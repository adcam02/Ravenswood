// A whole game in headless Chrome: a Storyteller and four players with fake microphones, a local
// PeerJS lobby, and screenshots along the way. Run with `node tools/test-town.mjs` (needs `npm install`).
// It builds the site to a scratch folder first and tests that copy, so editing files meanwhile is fine.
//
//   OUT=/some/folder  where screenshots go (default ./test-results)
//   ONLY=join,voice   run only checks whose names contain one of these words
import { spawn, spawnSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join as joinPath } from 'node:path';
import { chromium } from 'playwright';

const OUT = process.env.OUT || 'test-results';
const ONLY = (process.env.ONLY || '').split(',').filter(Boolean);
const PORT = Number(process.env.PORT ?? 5190);
const PEER = Number(process.env.PEER ?? 9000);
// BUILT=/some/folder tests a site already built there (to compare two versions) instead of building this one.
const BUILD = process.env.BUILT || joinPath(tmpdir(), 'ravenswood-test-build');
mkdirSync(OUT, { recursive: true });
// Machines without a graphics card (like CI) render slowly, so the pages run small, in low graphics, at a capped
// frame rate, and only Abbey's page draws as it goes. The others (the Storyteller included) do everything else,
// voice too, and draw a single frame when a screenshot is wanted.
const FLAGS = `peer=127.0.0.1:${PEER}&debug&fx=low`;
const DRAWN = '&fps=4';
const UNDRAWN = '&fps=10&nodraw';

const procs = [];
function run(cmd, args) {
  // Its own process group, so stopping it also stops what npx started underneath.
  const p = spawn(cmd, args, { stdio: ['ignore', 'pipe', 'pipe'], detached: true });
  procs.push(p);
  return p;
}
async function waitFor(url, ms = 30000) {
  const end = Date.now() + ms;
  while (Date.now() < end) {
    try {
      const r = await fetch(url);
      if (r.status < 500) return;
    } catch {
      /* not up yet */
    }
    await new Promise((r) => setTimeout(r, 300));
  }
  throw new Error(`Timed out waiting for ${url}`);
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

if (!process.env.BUILT) {
  console.log('Building…');
  const built = spawnSync('npx', ['vite', 'build', '--outDir', BUILD, '--emptyOutDir'], { stdio: ['ignore', 'ignore', 'inherit'] });
  if (built.status !== 0) process.exit(1);
}
run('npx', ['peerjs', '--port', String(PEER), '--path', '/', '--host', '127.0.0.1']);
run('npx', ['vite', 'preview', '--outDir', BUILD, '--port', String(PORT), '--strictPort']);
await waitFor(`http://127.0.0.1:${PEER}/`);
await waitFor(`http://localhost:${PORT}/`);

const browser = await chromium.launch({
  args: [
    '--use-angle=swiftshader',
    '--enable-unsafe-swiftshader',
    '--ignore-gpu-blocklist',
    '--use-fake-ui-for-media-stream',
    '--use-fake-device-for-media-stream',
    '--autoplay-policy=no-user-gesture-required',
  ],
});

const errors = [];
const results = [];
async function open(name, path, draw = false) {
  const ctx = await browser.newContext({ viewport: { width: 760, height: 480 }, permissions: ['microphone'] });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => errors.push(`${name}: ${e.message}`));
  page.on('console', (m) => {
    if (m.type() === 'error' && !/favicon|WebGL|GPU stall|ERR_CONNECTION_REFUSED|net::|satellite|nostr|tunnel/.test(m.text())) errors.push(`${name} console: ${m.text()}`);
  });
  page.on('crash', () => console.log(`!! ${name} crashed`));
  let first = true;
  page.on('framenavigated', (f) => {
    if (f !== page.mainFrame()) return;
    if (!first) console.log(`!! ${name} navigated again: ${f.url()}`);
    first = false;
  });
  await page.goto(`http://localhost:${PORT}/${path}${path.includes('?') ? '&' : '?'}${FLAGS}${draw ? DRAWN : UNDRAWN}`);
  page.label = name;
  return page;
}
async function check(name, fn) {
  if (ONLY.length && !ONLY.some((w) => name.toLowerCase().includes(w))) return;
  const t0 = Date.now();
  const took = () => `(${Math.round((Date.now() - t0) / 1000)}s)`;
  try {
    await fn();
    results.push(['PASS', name]);
    console.log('PASS', name, took());
  } catch (e) {
    results.push(['FAIL', name, e.message]);
    console.log('FAIL', name, took(), '-', e.message);
  }
}
function expect(cond, msg) {
  if (!cond) throw new Error(msg);
}
async function until(page, fn, arg, ms = 30000, what = 'condition') {
  try {
    await page.waitForFunction(fn, arg, { timeout: ms, polling: 200 });
  } catch {
    throw new Error(`timed out waiting for ${what} on ${page.label}`);
  }
}
async function shot(page, name) {
  // A page that doesn't draw as it goes draws this one frame.
  await page.evaluate(() => window.__engine?.draw()).catch(() => {});
  await page.screenshot({ path: `${OUT}/${name}.png` });
}

// ---------------------------------------------------------------- the Storyteller opens a room

const st = await open('Storyteller', '?st');
await until(st, () => window.__host && window.__engine, null, 90000, 'storyteller to load');
const room = await st.evaluate(() => window.__host.getState().g.room);
console.log('Room', room);
await until(st, () => window.__hostNet?.getState().status === 'open', null, 60000, 'lobby to open');

// ---------------------------------------------------------------- players arrive

/** Clicks through the DOM once the element exists: a starved page can't satisfy Playwright's stability checks in time. */
async function jsClick(page, selector, ms = 90000) {
  await page.waitForSelector(selector, { state: 'attached', timeout: ms });
  await page.$eval(selector, (el) => el.click());
}

async function join(name, animal, color) {
  const p = await open(name, `?room=${room}`, name === 'Abbey');
  await p.waitForSelector('.join-name input', { timeout: 180000 });
  await sleep(600);
  // The town builds on the main thread while the join card is up, so give a busy page plenty of time.
  await p.fill('.join-name input', name, { timeout: 180000 });
  await sleep(400);
  await jsClick(p, '.join-name button');
  if (animal) {
    await p.waitForSelector('.join-animal', { timeout: 180000 });
    // Only a page that draws has pictures on the tiles.
    await p.waitForSelector(`.join-tile[title="${animal}"]${name === 'Abbey' ? ' img' : ''}`, { timeout: 180000 });
    if (name === 'Abbey') {
      await shot(p, '01-animal-picker');
      const tiles = await p.$$eval('.join-tile', (els) => els.map((e) => e.getAttribute('title')));
      pickerTiles = tiles;
    }
    if (name === 'Colter') {
      // Abbey has the fox by now, so Colter's picker should show it as hers.
      await p.waitForSelector('.join-tile.taken', { timeout: 30000 }).catch(() => {});
      takenTiles = await p.$$eval('.join-tile.taken', (els) => els.map((e) => e.getAttribute('title')));
      await shot(p, '01b-animal-taken');
    }
    await jsClick(p, `.join-tile[title="${animal}"]`);
    if (color) await jsClick(p, `.join-color[aria-label="${color}"]`);
    await jsClick(p, '.join-animal .cosy-btn.primary');
  }
  await p.waitForSelector('.join-mic', { timeout: 60000 });
  await jsClick(p, '.join-mic .cosy-btn.big:not(.primary)');
  await p.waitForSelector('.mic-meter', { timeout: 60000 });
  await jsClick(p, '.join-mic .cosy-btn.primary');
  await p.waitForSelector('.place-chip', { timeout: 60000 });
  return p;
}

const players = {};
let pickerTiles = [];
let takenTiles = [];
await check('join: Abbey picks a fox, Colter a shark, Steele a penguin', async () => {
  players.abbey = await join('Abbey', 'Fox');
  players.colter = await join('Colter', 'Shark');
  players.steele = await join('Steele', 'Penguin', '#8fc1e8');
});

await check('join: every animal is on offer, the kaiju too', async () => {
  expect(pickerTiles.length >= 30, `only ${pickerTiles.length} animals offered`);
  expect(pickerTiles.includes('Kaiju'), 'no Kaiju tile is offered');
});

await check('join: Jarrod picks from the animals like everyone else', async () => {
  players.jarrod = await join('Jarrod', 'Kaiju');
  const look = await st.evaluate(() => window.__host.getState().g.seats.find((s) => s.name.toLowerCase() === 'jarrod')?.look);
  expect(look?.animal === 'kaiju', `Jarrod is a ${look?.animal}`);
});

await check('join: an animal someone has is greyed out for everyone else', async () => {
  expect(takenTiles.some((t) => /^Fox: taken by Abbey/.test(t ?? '')), `Colter saw taken tiles ${JSON.stringify(takenTiles)}`);
});

await check('join: each animal belongs to one player, even when two pick it at once', async () => {
  const r = await st.evaluate(() => {
    const { st: s } = window.__st;
    const g = () => window.__host.getState().g;
    const before = g().seats.length;
    const p = s.fromPlayer;
    // Two players click the panda at the same moment: the host takes them one at a time, first wins.
    const a = p.hold('race-a', 'Ana', 'panda');
    const b = p.hold('race-b', 'Bo', 'panda');
    // Bo presses "This is me!" with the panda anyway, and someone else tries for Abbey's fox.
    const c = p.join('race-b', 'Bo', { animal: 'panda', color: '#ffffff' });
    const d = p.join('race-c', 'Cy', { animal: 'fox', color: '#e2793a' });
    const boLook = g().seats.find((x) => x.playerId === 'race-b')?.look ?? null;
    // Ana walks off without choosing: the panda is free again.
    p.dropped('race-a');
    const e = p.hold('race-b', 'Bo', 'panda');
    const raceSeats = g().seats.filter((x) => x.playerId?.startsWith('race-')).map((x) => x.id);
    for (const id of ['race-a', 'race-b', 'race-c']) p.leave(id);
    for (const id of raceSeats) s.removeSeat(id);
    return { a, b, c, d, e, boLook, after: g().seats.length, before };
  });
  expect(r.a === null, `Ana's hold was refused: ${JSON.stringify(r.a)}`);
  expect(r.b?.by === 'Ana', `Bo's hold should go to Ana: ${JSON.stringify(r.b)}`);
  expect(r.c?.by === 'Ana' && r.boLook === null, `Bo still got the panda: ${JSON.stringify(r.c)} ${JSON.stringify(r.boLook)}`);
  expect(r.d?.by === 'Abbey', `the fox should be Abbey's: ${JSON.stringify(r.d)}`);
  expect(r.e === null, `the panda wasn't freed when Ana left: ${JSON.stringify(r.e)}`);
  expect(r.after === r.before, `the test's seats weren't cleaned up (${r.before} then ${r.after})`);
});

await check('join: the host records everyone’s animals', async () => {
  const seats = await st.evaluate(() => window.__host.getState().g.seats.map((s) => [s.name, s.look?.animal, s.look?.color]));
  const by = Object.fromEntries(seats.map(([n, a, c]) => [n, [a, c]]));
  expect(by.Abbey?.[0] === 'fox' && by.Colter?.[0] === 'shark' && by.Steele?.[0] === 'penguin', JSON.stringify(seats));
  expect(by.Steele?.[1] === '#8fc1e8', `Steele's colour is ${by.Steele?.[1]}`);
});

const all = () => Object.values(players);

await check('presence: everyone sees everyone else in town', async () => {
  for (const p of all()) await until(p, () => window.__presence.others.size >= 4, null, 15000, 'four others');
  await until(st, () => window.__presence.others.size >= 4, null, 15000, 'four players');
  await sleep(1500);
  await shot(players.abbey, '03-town-arrivals');
  await shot(st, '04-storyteller-town');
});

// ---------------------------------------------------------------- moving and talking

const place = (p, zone, x, z, ry = 0) => p.evaluate(([zone, x, z, ry]) => window.__engine.place(zone, x, z, ry, false), [zone, x, z, ry]);
const me = (p) => p.evaluate(() => ({ ...window.__local }));
const seatOf = (name) => st.evaluate((n) => window.__host.getState().g.seats.find((s) => s.name.toLowerCase() === n.toLowerCase())?.id, name);

await check('items: nobody but the Storyteller carries the book', async () => {
  for (const p of all()) expect((await me(p)).item === null, `${p.label} is holding ${JSON.stringify((await me(p)).item)}`);
  const id = await seatOf('Abbey');
  const book = await players.colter.evaluate((id) => Boolean(window.__engine.others.get(id)?.rig.root.getObjectByName('item:grimoire')), id);
  expect(!book, 'Colter sees Abbey holding the grimoire');
  const stBook = await players.colter.evaluate(() => Boolean(window.__engine.others.get('st')?.rig.root.getObjectByName('item:grimoire')));
  expect(stBook, 'the Storyteller has no grimoire in hand');
});

await check('move: walking with W moves Abbey for everyone', async () => {
  const p = players.abbey;
  await place(p, 'town', 0, 22, 0);
  await sleep(500);
  const before = await me(p);
  await p.keyboard.down('w');
  await until(p, ([x, z]) => Math.hypot(window.__local.x - x, window.__local.z - z) > 2, [before.x, before.z], 20000, 'Abbey to walk 2m');
  await p.keyboard.up('w');
  const after = await me(p);
  const id = await seatOf('Abbey');
  await until(st, ([id, x, z]) => {
    const o = window.__presence.others.get(id);
    return o && Math.hypot(o.x - x, o.z - z) < 0.6;
  }, [id, after.x, after.z], 5000, 'host to see the new position');
});

/** Waits until the listener hears the speaker at a volume satisfying `ok`, and returns the last reading. */
async function gainUntil(listener, speakerName, ok, what, ms = 25000) {
  const end = Date.now() + ms;
  let g;
  while (Date.now() < end) {
    g = await voiceGain(listener, speakerName);
    if (ok(g)) return g;
    await sleep(400);
  }
  throw new Error(`${what}: gain ${g?.gain} (${g?.why ?? ''})`);
}

async function voiceGain(listener, speakerName) {
  const id = await seatOf(speakerName);
  return listener.evaluate((id) => {
    const p = window.__presence.others.get(id);
    if (!p?.voiceId) return { gain: null, why: 'no voice id' };
    const links = window.__voiceLinks?.() ?? [];
    const link = links.find((l) => l.id === p.voiceId);
    return { gain: link ? link.volume : null, open: link?.open ?? false, why: link ? '' : `no link (have ${links.length})` };
  }, id);
}

await check('voice: players close together hear each other at full volume', async () => {
  await place(players.abbey, 'town', 4, 24, 0);
  await place(players.colter, 'town', 5, 24, 0);
  await until(players.abbey, () => (window.__voiceLinks?.() ?? []).some((l) => l.open), null, 60000, 'a voice link to open');
  await gainUntil(players.abbey, 'Colter', (g) => g.gain !== null && g.gain > 0.9, 'close together');
});

await check('voice: far away is silent, and walls are absolute', async () => {
  await place(players.colter, 'town', -30, 30, 0);
  await gainUntil(players.abbey, 'Colter', (g) => g.gain === null || g.gain < 0.05, 'far away');
  await place(players.colter, 'town', 10, 24, 0);
  await gainUntil(players.abbey, 'Colter', (g) => g.gain !== null && g.gain > 0.1 && g.gain < 0.95, 'mid-distance');
  await place(players.colter, 'tavern', 0, 0, 0);
  await gainUntil(players.abbey, 'Colter', (g) => g.gain === null || g.gain < 0.01, 'through a wall');
});

await check('voice: lines to far-away players go quiet at once, hang up after two minutes, and reopen', async () => {
  await place(players.abbey, 'town', 4, 24, 0);
  await place(players.colter, 'town', -30, 30, 0);
  await gainUntil(players.abbey, 'Colter', (g) => g.gain === null || g.gain === 0, 'the far line to go quiet', 10000);
  // An idle line is kept for two minutes (LINGER_MS in voice.ts), so walking back is instant.
  await gainUntil(players.abbey, 'Colter', (g) => g.gain === null, 'the far line to hang up', 160000);
  await place(players.colter, 'town', 5, 24, 0);
  await gainUntil(players.abbey, 'Colter', (g) => g.gain !== null && g.gain > 0.5, 'the line to reopen', 60000);
});

await check('voice: the Storyteller can speak to everyone', async () => {
  await place(st, 'church', 0, 0, 0);
  await st.evaluate(() => (window.__presence.announce = true));
  try {
    await until(players.steele, () => {
      const p = window.__presence.others.get('st');
      const link = (window.__voiceLinks?.() ?? []).find((l) => l.id === p?.voiceId);
      return Boolean(link && link.volume > 0.9);
    }, null, 25000, 'the announcement to reach Steele');
  } finally {
    await st.evaluate(() => (window.__presence.announce = false));
  }
});

await check('booth: the confession booth is private, one to a side', async () => {
  const sides = await players.abbey.evaluate(() => window.__engine.town.stations.filter((s) => s.job === 'confess' && s.zone === 'church'));
  expect(sides.length === 2, `${sides.length} sides to the booth`);
  const step = async (p, side) => {
    await place(p, 'church', side.x, side.z + 0.55, Math.PI);
    // (A page only notices the booth's side on its next frame.)
    await until(p, () => window.__engine.nearStation?.job === 'confess', null, 30000, 'the booth prompt');
    await p.evaluate(() => window.__game.interact());
  };
  const inside = (p) => p.evaluate(() => window.__local.zone === 'church' && window.__local.z < -7.37 && window.__local.x > 2.85);
  await step(players.abbey, sides[0]);
  await until(players.abbey, () => window.__local.zone === 'church' && window.__local.z < -7.37, null, 8000, 'Abbey to be in the booth');
  await step(players.colter, sides[1]);
  await until(players.colter, () => window.__local.zone === 'church' && window.__local.z < -7.37, null, 8000, 'Colter to be in the booth');
  // Steele right outside the booth, in the same room.
  await place(players.steele, 'church', 4.3, -6.5, Math.PI);
  await gainUntil(players.abbey, 'Colter', (g) => g.gain !== null && g.gain > 0.9, 'Abbey to hear Colter through the grille');
  await gainUntil(players.colter, 'Abbey', (g) => g.gain !== null && g.gain > 0.9, 'Colter to hear Abbey through the grille');
  await gainUntil(players.steele, 'Abbey', (g) => g.gain === null || g.gain < 0.01, 'Steele, outside, not to hear Abbey');
  await gainUntil(players.abbey, 'Steele', (g) => g.gain === null || g.gain < 0.01, 'Abbey not to hear Steele outside');
  // A side with someone in it stays shut.
  await step(players.steele, sides[0]);
  await sleep(1000);
  expect(!(await inside(players.steele)), 'Steele got into the side Abbey is in');
  await shot(players.steele, '09b-booth');
  for (const p of [players.abbey, players.colter]) await p.evaluate(() => window.__game.interact());
  for (const p of [players.abbey, players.colter]) await until(p, () => window.__local.z > -7.37, null, 8000, 'to step out of the booth');
});

// ---------------------------------------------------------------- doors, jobs and items

const stationFor = (p, job) => p.evaluate((job) => window.__engine.town.stations.find((s) => s.job === job), job);
/** After being put somewhere, a page only notices which station it's at on its next frame: wait for that one. */
const atStation = (p, job) => until(p, (job) => window.__engine.nearStation?.job === job && document.querySelector('.action-prompt'), job, 30000, `the ${job} prompt`);

await check('doors: walking into the tavern door goes inside', async () => {
  const p = players.abbey;
  const door = await p.evaluate(() => window.__engine.town.doors.find((d) => d.zone === 'town' && d.to === 'tavern'));
  // The spot just outside the tavern, where you land on the way out, faces away from the door.
  const outside = await p.evaluate(() => window.__engine.town.doors.find((d) => d.id === 'tavern-out').spawn);
  expect(door && outside, 'no tavern door');
  await place(p, 'town', outside.x, outside.z, outside.ry + Math.PI);
  await sleep(500);
  await p.evaluate(([x, z]) => {
    window.__engine.moveTarget = { x, z, y: 0 };
  }, [door.x, door.z]);
  await until(p, () => window.__local.zone === 'tavern', null, 30000, 'to be inside the tavern');
  await sleep(800);
  await shot(p, '05-tavern-inside');
});

await check('doors: the clock tower opens at the front, and lets you out the same way', async () => {
  const p = players.abbey;
  const door = await p.evaluate(() => window.__engine.town.doors.find((d) => d.id === 'tower-in-s'));
  const out = await p.evaluate(() => window.__engine.town.doors.find((d) => d.id === 'tower-out'));
  expect(door && out, 'no clock tower door');
  await place(p, 'town', door.back.x, door.back.z, door.back.ry + Math.PI);
  await sleep(500);
  await p.evaluate(([x, z]) => {
    window.__engine.moveTarget = { x, z, y: 0 };
  }, [door.x, door.z]);
  await until(p, () => window.__local.zone === 'tower', null, 30000, 'to be inside the clock tower');
  await sleep(800);
  await shot(p, '05b-tower-inside');
  await p.evaluate(([x, z]) => {
    window.__engine.moveTarget = { x, z, y: 0 };
  }, [out.x, out.z]);
  await until(p, () => window.__local.zone === 'town', null, 30000, 'to be back out in the square');
  const at = await me(p);
  expect(Math.hypot(at.x - door.back.x, at.z - door.back.z) < 1.5, `came out at ${at.x.toFixed(1)}, ${at.z.toFixed(1)}`);
});

await check('doors: in by the clock tower’s back door, out by the back door', async () => {
  const p = players.abbey;
  const door = await p.evaluate(() => window.__engine.town.doors.find((d) => d.id === 'tower-in-n'));
  const out = await p.evaluate(() => window.__engine.town.doors.find((d) => d.id === 'tower-out'));
  await sleep(1200);
  await place(p, 'town', door.back.x, door.back.z, door.back.ry + Math.PI);
  await sleep(500);
  await p.evaluate(([x, z]) => {
    window.__engine.moveTarget = { x, z, y: 0 };
  }, [door.x, door.z]);
  await until(p, () => window.__local.zone === 'tower', null, 30000, 'to be inside the clock tower');
  await sleep(1200);
  await p.evaluate(([x, z]) => {
    window.__engine.moveTarget = { x, z, y: 0 };
  }, [out.x, out.z]);
  await until(p, () => window.__local.zone === 'town', null, 30000, 'to be back out');
  const at = await me(p);
  expect(Math.hypot(at.x - door.back.x, at.z - door.back.z) < 1.5, `came out at ${at.x.toFixed(1)}, ${at.z.toFixed(1)}, not by the back door`);
});

await check('doors: walking past the tower’s front door, or to the stools, doesn’t go in', async () => {
  const p = players.abbey;
  await sleep(1200);
  // Along the front of the tower, brushing its steps, from one side to the other.
  await place(p, 'town', -2.5, 3.2, Math.PI / 2);
  await sleep(500);
  await p.evaluate(() => {
    window.__engine.moveTarget = { x: 2.5, z: 3.2, y: 0 };
  });
  // A slow page walks slowly, so give it time.
  await until(p, () => window.__local.x > 2 || window.__local.zone !== 'town', null, 120000, 'to walk past the door');
  expect((await me(p)).zone === 'town', 'walked into the tower going past it');
  // From the back of the meeting circle to the stool nearest the tower.
  const spot = await p.evaluate(() => window.__engine.town.meetingSpot(0, 10));
  await place(p, 'town', spot.x, spot.z + 6, Math.PI);
  await sleep(500);
  await p.evaluate(([x, z]) => {
    window.__engine.moveTarget = { x, z, y: 0 };
  }, [spot.x, spot.z]);
  await until(p, ([x, z]) => Math.hypot(window.__local.x - x, window.__local.z - z) < 0.6 || window.__local.zone !== 'town', [spot.x, spot.z], 120000, 'to reach the stool');
  await sleep(1500);
  expect((await me(p)).zone === 'town', 'walked into the tower on the way to the front stool');
});

await check('jobs: bartending puts a drink on the bar', async () => {
  const p = players.abbey;
  const s = await stationFor(p, 'bartender');
  expect(s, 'no bartender station');
  await place(p, 'tavern', s.stand.x, s.stand.z, s.stand.ry);
  await atStation(p, 'bartender');
  await p.keyboard.press('e');
  await p.waitForSelector('.job-dock', { timeout: 60000 });
  await shot(p, '06-bartender-game');
  const before = await st.evaluate(() => window.__host.getState().g.town.drinks.length);
  await p.evaluate(() => window.__game.jobDone({ kind: 'cocoa', stars: 3 }));
  await until(st, (n) => window.__host.getState().g.town.drinks.length > n, before, 30000, 'a drink on the bar');
  await sleep(800);
  await shot(p, '07-drink-on-bar');
});

await check('jobs: the minigame can actually be played (pour)', async () => {
  const p = players.abbey;
  const s = await stationFor(p, 'bartender');
  await place(p, 'tavern', s.stand.x, s.stand.z, s.stand.ry);
  await atStation(p, 'bartender');
  await p.keyboard.press('e');
  await p.waitForSelector('.job-dock', { timeout: 60000 });
  const before = await st.evaluate(() => window.__host.getState().g.town.drinks.length);
  // Pick the first drink, then hold to pour and let go part way. The game moves at most a twentieth of a
  // second per frame, so on a starved test page a short hold barely fills the mug: keep topping up until it's served.
  await p.keyboard.press('Space');
  await sleep(300);
  const served = () => st.evaluate((n) => window.__host.getState().g.town.drinks.length > n, before);
  for (let i = 0; i < 8 && !(await served()); i++) {
    await p.keyboard.down('Space');
    await sleep(1600);
    await p.keyboard.up('Space');
    await sleep(2500);
  }
  await until(st, (n) => window.__host.getState().g.town.drinks.length > n, before, 60000, 'the poured drink');
});

await check('items: Colter takes a drink from the bar and gives it to Abbey', async () => {
  const c = players.colter;
  const s = await stationFor(c, 'takeDrink');
  expect(s, 'no takeDrink station');
  await place(c, 'tavern', s.stand.x, s.stand.z, s.stand.ry);
  await atStation(c, 'takeDrink');
  await c.waitForSelector('.action-prompt:not(.locked)', { timeout: 30000 });
  await c.keyboard.press('e');
  await until(c, () => window.__local.item, null, 30000, 'a drink in paw');
  const a = players.abbey;
  await place(a, 'tavern', s.stand.x + 1, s.stand.z, s.stand.ry);
  await until(c, () => window.__hud.getState().giveTo, null, 30000, 'Abbey to be close enough to give to');
  await c.keyboard.press('g');
  await until(a, () => window.__local.item, null, 30000, 'Abbey to receive it');
  await sleep(500);
  await shot(a, '08-gift-received');
});

for (const [job, where] of [
  ['laundry', 'town'],
  ['fishing', 'town'],
  ['baking', 'bakery'],
  ['gardening', 'town'],
]) {
  await check(`jobs: ${job} opens its minigame and records the result`, async () => {
    const p = players.steele;
    const s = await stationFor(p, job);
    expect(s, `no ${job} station`);
    await place(p, where, s.stand.x, s.stand.z, s.stand.ry);
    await atStation(p, job);
    await p.keyboard.press('e');
    await p.waitForSelector('.job-dock', { timeout: 60000 });
    await sleep(400);
    await shot(p, `09-${job}`);
    const results = {
      laundry: { kind: 'shirt', color: '#e05a8a', stars: 3 },
      fishing: { kind: 'Golden Carp', cm: 41, stars: 3 },
      baking: { kind: 'pie', stars: 2 },
      gardening: { kind: 'sunflower', color: '#f6c445', stars: 3 },
    };
    const key = { laundry: 'clothes', fishing: 'fish', baking: 'loaves', gardening: 'flowers' }[job];
    const before = await st.evaluate((k) => window.__host.getState().g.town[k].length, key);
    await p.evaluate((r) => window.__game.jobDone(r), results[job]);
    await until(st, ([k, n]) => window.__host.getState().g.town[k].length > n, [key, before], 30000, `${key} to update`);
  });
}

await check('town: the washing line, flowers and bakes show up for others', async () => {
  const p = players.jarrod;
  const line = await stationFor(p, 'laundry');
  await place(p, 'town', line.stand.x + 2, line.stand.z + 3, Math.PI);
  await sleep(1500);
  await shot(p, '10-washing-line');
  const bed = await stationFor(p, 'gardening');
  await place(p, 'town', bed.stand.x, bed.stand.z + 3, Math.PI);
  await sleep(1500);
  await shot(p, '11-flower-bed');
});

await check('letters: posted by day, waiting with the flag up, not readable yet', async () => {
  const colter = await seatOf('Colter');
  const a = players.abbey;
  const post = await stationFor(a, 'post');
  await place(a, 'town', post.stand.x, post.stand.z, post.stand.ry);
  await sleep(600);
  await a.evaluate(() => window.__game.interact());
  await a.waitForSelector('.letter-modal', { timeout: 10000 });
  await jsClick(a, '.letter-modal .ask-seat >> text=Colter', 5000);
  await a.fill('.letter-paper textarea', 'Meet me by the pond at noon. I know who the Imp is.');
  await shot(a, '11b-letter-writing');
  await jsClick(a, '.letter-actions .btn.primary', 5000);
  await a.waitForSelector('.letter-done', { timeout: 15000 });
  await jsClick(a, '.letter-actions .btn.primary', 5000);
  // And an unsigned one from Steele.
  await players.steele.evaluate((id) => window.__clientLink.send({ t: 'letter', to: id, text: 'Watch your back.', signed: false }), colter);
  await until(players.steele, (id) => window.__client.getState().pub.seats.find((s) => s.id === id)?.mail === true, colter, 10000, 'the flag up on Colter’s letterbox');
  await until(st, (id) => (window.__host.getState().g.letters ?? []).filter((l) => l.to === id).length === 2, colter, 10000, 'both letters with the host');
  const early = await players.colter.evaluate(() => window.__client.getState().priv?.letters?.length ?? 0);
  expect(early === 0, 'Colter can read his letters before night');
  await place(a, 'town', post.stand.x + 1.6, post.stand.z + 1.2, post.stand.ry + 0.6);
  await sleep(1500);
  await shot(a, '11c-post-office');
});

// ---------------------------------------------------------------- the game itself

await check('game: dealing and night sends everyone home with doors locked', async () => {
  await st.evaluate(() => {
    const { st: s } = window.__st;
    s.setBag(['washerwoman', 'empath', 'scarletwoman', 'imp']);
    s.dealRandom();
    s.reveal(true);
    s.setPhase('night');
  });
  for (const p of all()) await until(p, () => window.__local.zone.startsWith('house:'), null, 30000, 'to be home');
  // Each player gets a "You are the…" card, which they'd read and close.
  for (const p of all()) {
    await jsClick(p, '.reveal-overlay .btn', 30000);
    await p.waitForSelector('.reveal-overlay', { state: 'detached', timeout: 20000 });
  }
  await shot(players.abbey, '12a-after-reveal');
  const a = players.abbey;
  const id = await seatOf('Abbey');
  const zone = (await me(a)).zone;
  expect(zone === `house:${id}`, `Abbey is in ${zone}`);
  await until(a, () => window.__local.anim === 'sleep', null, 10000, 'Abbey to be asleep in bed');
  await sleep(2000);
  await shot(a, '12-home-at-night');
  // Tucked in: the keys do nothing until morning.
  const before = await me(a);
  await a.keyboard.down('s');
  await sleep(1500);
  await a.keyboard.up('s');
  const after = await me(a);
  expect(Math.hypot(after.x - before.x, after.z - before.z) < 0.05 && after.anim === 'sleep', 'Abbey got out of bed at night');
  await a.waitForSelector('.action-prompt', { timeout: 15000 });
  const prompt = await a.$eval('.action-prompt', (el) => el.textContent);
  expect(/count the sheep/i.test(prompt), `the bedside prompt says "${prompt}"`);
});

await check('night: counting the sheep right earns a gold star for the morning', async () => {
  const a = players.abbey;
  await a.keyboard.press('e');
  await a.waitForSelector('.sheep-game', { timeout: 10000 });
  await shot(a, '12b-sheep-rules');
  await jsClick(a, '.sheep-rules .cosy-btn', 5000);
  await a.waitForSelector('.sheep-canvas', { timeout: 5000 });
  await sleep(4000);
  await shot(a, '12c-sheep-run');
  await a.waitForSelector('.sheep-guess', { timeout: 70000 });
  const answer = await a.evaluate(() => window.__sheepAnswer);
  expect(Number.isInteger(answer), `no answer on the page (${answer})`);
  for (const ch of String(answer)) await a.keyboard.press(ch);
  await a.keyboard.press('Enter');
  await a.waitForSelector('.sheep-result.is-right', { timeout: 5000 });
  await shot(a, '12d-sheep-right');
  const id = await seatOf('Abbey');
  await until(st, (id) => {
    const g = window.__host.getState().g;
    return g.seats.find((s) => s.id === id)?.star === g.day;
  }, id, 10000, 'the host to award Abbey a star');
});

await check('letters: at night they arrive, for their reader only, and open in bed', async () => {
  const c = players.colter;
  await until(c, () => (window.__client.getState().priv?.letters?.length ?? 0) >= 2, null, 15000, 'Colter’s letters to arrive');
  const letters = await c.evaluate(() => window.__client.getState().priv.letters);
  const signed = letters.find((l) => /pond/.test(l.text));
  const unsigned = letters.find((l) => /back/.test(l.text));
  expect(signed?.name === 'Abbey', `the signed letter says it's from ${signed?.name}`);
  expect(unsigned && unsigned.name === null && !('from' in unsigned) && !('to' in unsigned), `the unsigned letter came as ${JSON.stringify(unsigned)}`);
  const abbeys = await players.abbey.evaluate(() => window.__client.getState().priv?.letters?.length ?? 0);
  expect(abbeys === 0, `Abbey was sent ${abbeys} letters`);
  await c.waitForSelector('.bed-letters', { timeout: 15000 });
  await jsClick(c, '.bed-letters', 5000);
  await c.waitForSelector('.letter-envelope', { timeout: 5000 });
  await shot(c, '12e-letters');
  await jsClick(c, '.letter-envelope', 5000);
  await c.waitForSelector('.letter-paper.reading', { timeout: 5000 });
  await shot(c, '12f-letter-read');
  await jsClick(c, '.modal-close', 5000);
});

await check('game: the Storyteller floats into a house to talk', async () => {
  const id = await seatOf('Steele');
  await st.evaluate((id) => window.__engine.goTo(id), id);
  await until(st, (id) => window.__local.zone === `house:${id}`, id, 5000, 'the Storyteller to be in Steele’s house');
  await sleep(1500);
  const g = await voiceGain(players.steele, 'Storyteller').catch(() => null);
  void g;
  await shot(players.steele, '13-storyteller-visit');
  await shot(st, '14-storyteller-in-house');
});

await check('game: a night death shows at dawn and the dead walk as ghosts', async () => {
  const id = await seatOf('Colter');
  await st.evaluate((id) => window.__st.st.toggleDead(id), id);
  await sleep(500);
  const early = await players.abbey.evaluate((id) => window.__client.getState().pub.seats.find((s) => s.id === id).dead, id);
  expect(!early, 'players saw the death before dawn');
  // The hooded figure visits Colter, and only Colter.
  await until(players.colter, () => Boolean(window.__engine.visit), null, 15000, 'the hooded figure to visit Colter');
  const others = await players.abbey.evaluate(() => [Boolean(window.__engine.visit), window.__client.getState().priv?.visit ?? null]);
  expect(!others[0] && !others[1], `Abbey was told of the visit: ${JSON.stringify(others)}`);
  await sleep(3800);
  await shot(players.colter, '15a-night-visit');
  await players.colter.waitForSelector('.visit-card', { timeout: 15000 });
  await shot(players.colter, '15b-killed-in-the-night');
  await until(players.colter, () => !window.__engine.visit, null, 15000, 'the visit to end');
  await st.evaluate(() => window.__st.st.setPhase('day'));
  for (const p of all()) await until(p, () => window.__local.zone === 'town', null, 8000, 'to be back outside');
  await players.abbey.waitForSelector('.phase-banner', { timeout: 40000 });
  const banner = await players.abbey.textContent('.phase-banner');
  expect(/Colter died/.test(banner), `banner said "${banner}"`);
  await sleep(1000);
  const c = players.colter;
  await place(c, 'town', 2, 20, Math.PI);
  await place(players.abbey, 'town', 0, 22, Math.PI);
  await sleep(1500);
  await shot(players.abbey, '15-ghost-in-town');
});

await check('game: ringing the bell gathers everyone at the square', async () => {
  // Abbey is already standing in the square, the others are off by the washhouse: all of them must get the call.
  await place(players.abbey, 'town', 1, 9, 0);
  for (const p of all().filter((q) => q !== players.abbey)) await place(p, 'town', -20, 20, 0);
  await sleep(1500);
  // Each page notes the moment the bell call appears (a slow page may already be seated by the time we look).
  for (const p of all()) {
    await p.evaluate(() => {
      window.__sawBell = Boolean(document.querySelector('.bell-call'));
      new MutationObserver(() => {
        if (document.querySelector('.bell-call')) window.__sawBell = true;
      }).observe(document.body, { childList: true, subtree: true });
    });
  }
  await st.evaluate(() => window.__st.st.callTownHall());
  await shot(players.abbey, '16-bell');
  for (const p of all()) await until(p, () => window.__sawBell, null, 20000, 'to see the bell call');
  // Nobody is taken anywhere until they choose to go: a few seconds on, everyone is still where they were.
  await sleep(3500);
  for (const p of all()) expect(!(await p.evaluate(() => window.__hud.getState().meetingSeated)), `${p.label} was sat down without choosing to go`);
  // Each answers it with "Take my seat", which takes them to their stool; the host sees them sit down.
  for (const p of all()) await p.$eval('.bell-call .bell-actions .cosy-btn.primary', (el) => el.click()).catch(() => {});
  for (const p of all()) await until(p, () => window.__hud.getState().meetingSeated, null, 30000, 'to be seated at the meeting');
  // Once everyone is there the bell stops, but the meeting (and the stools) carry on.
  await until(st, () => Boolean(window.__host.getState().g.townHall?.gathered), null, 60000, 'everyone to arrive at the square');
  await sleep(2000);
  // From the Storyteller's view: everyone on their own stool (the grimoire's order), at stool height, sitting.
  const seats = await st.evaluate(() => {
    const e = window.__engine;
    const v = e.view;
    const n = v.seats.length;
    return v.seats
      .filter((s) => window.__presence.others.has(s.id))
      .map((s) => {
        const i = v.seats.findIndex((x) => x.id === s.id);
        const spot = e.town.meetingSpot(i, n);
        const av = e.others.get(s.id);
        const p = window.__presence.others.get(s.id);
        // Where each player says they are (a starved test page may not have drawn a frame since they moved),
        // and the height the Storyteller's page gives someone sitting there.
        return { name: s.name, i, off: p ? Math.hypot(p.x - spot.x, p.z - spot.z) : 99, y: p ? e.seatHeight(p.zone, p.anim, p.x, p.z) : 0, anim: p?.anim };
      });
  });
  const wrong = seats.filter((s) => s.off > 0.4 || s.y < 0.3 || s.anim !== 'sit');
  expect(seats.length >= 4 && !wrong.length, `not sat on their own stools: ${JSON.stringify(wrong.length ? wrong : seats)}`);
  await shot(st, '16c-bell-seated-st');
  const stools = await st.evaluate(() => window.__engine.scene.getObjectByName('meeting')?.visible ?? null);
  expect(stools !== false, 'the stools vanished once everyone had arrived');
  for (const p of all()) expect(!(await p.$('.bell-call')), `${p.label} still sees the bell call after sitting`);
  const me = await players.abbey.evaluate(() => ({ ...window.__local }));
  expect(Math.hypot(me.x, me.z) < 13, `Abbey ended up ${Math.hypot(me.x, me.z).toFixed(1)}m from the tower`);
  // Seated, the camera looks at the middle of the circle (not at the player), from behind their own stool.
  await sleep(2500);
  for (const p of [players.abbey, players.colter]) {
    const cam = await p.evaluate(() => ({ look: window.__engine.camLook, pos: window.__engine.camPos, me: { x: window.__local.x, z: window.__local.z } }));
    const off = Math.hypot(cam.look.x - 0, cam.look.z - 9.3);
    expect(off < 1, `${p.label}'s camera looks ${off.toFixed(1)}m from the middle of the circle`);
    const behind = Math.hypot(cam.pos.x - 0, cam.pos.z - 9.3) > Math.hypot(cam.me.x - 0, cam.me.z - 9.3);
    expect(behind, `${p.label}'s camera isn't behind their stool`);
  }
  await shot(players.colter, '16b-seated-minimap');
  await shot(players.abbey, '16d-meeting-camera');
});

await check('game: nominations and votes raise paws round the clock', async () => {
  const nominee = await seatOf('Steele');
  const nominator = await seatOf('Abbey');
  await st.evaluate(([a, b]) => window.__st.st.nominate(a, b), [nominator, nominee]);
  await players.abbey.waitForSelector('.vote-bar', { timeout: 20000 });
  for (const p of [players.abbey, players.jarrod]) {
    await p.click('.meeting-seat').catch(() => {});
  }
  await sleep(800);
  await players.abbey.click('.vote-bar .btn');
  await players.jarrod.click('.vote-bar .btn');
  await sleep(1200);
  const votes = await st.evaluate(() => window.__host.getState().g.nomination.votes.length);
  expect(votes === 2, `${votes} votes`);
  await shot(players.abbey, '17-voting');
  await st.evaluate(() => window.__st.st.startVote());
  await until(st, () => window.__host.getState().g.nomination?.status === 'done', null, 20000, 'the vote to finish');
  await shot(st, '18-storyteller-vote');
});

await check('game: waking a player at night takes the Storyteller to their bedside', async () => {
  await st.evaluate(() => window.__st.st.setPhase('night'));
  for (const p of all()) await until(p, () => window.__local.zone.startsWith('house:'), null, 30000, 'to be home');
  const id = await seatOf('Abbey');
  await st.evaluate(() => window.__engine.place('town', 0, 10, 0, false));
  await st.evaluate((id) => window.__st.st.wake([id], [{ card: 'youAre', signs: [], roleIds: [], seatIds: [], text: '' }], null), id);
  await until(st, (id) => window.__local.zone === `house:${id}`, id, 10000, 'the Storyteller to drift to Abbey’s bedside');
  await sleep(1500);
  await shot(players.abbey, '21-night-wake');
  await st.evaluate(() => window.__st.st.sleep());
  await st.evaluate(() => window.__st.st.setPhase('day'));
  for (const p of all()) await until(p, () => window.__local.zone === 'town', null, 30000, 'to be back outside');
  for (const p of all()) await p.$('.reveal-overlay .btn').then((b) => b && jsClick(p, '.reveal-overlay .btn', 10000)).catch(() => {});
});

await check('day: the gold star shows on the sheep counter for everyone', async () => {
  // Abbey earned hers on the first night; it's worn through that day, and a fresh one needs a fresh night.
  await st.evaluate(() => window.__st.st.setPhase('night'));
  for (const p of all()) await until(p, () => window.__local.anim === 'sleep', null, 30000, 'to be in bed');
  const a = players.abbey;
  await a.keyboard.press('e');
  await a.waitForSelector('.sheep-game', { timeout: 10000 });
  await jsClick(a, '.sheep-rules .cosy-btn', 5000);
  await a.waitForSelector('.sheep-guess', { timeout: 70000 });
  const answer = await a.evaluate(() => window.__sheepAnswer);
  for (const ch of String(answer)) await a.keyboard.press(ch);
  await a.keyboard.press('Enter');
  await a.waitForSelector('.sheep-result', { timeout: 5000 });
  await st.evaluate(() => window.__st.st.setPhase('day'));
  for (const p of all()) await until(p, () => window.__local.zone === 'town', null, 30000, 'to be back outside');
  for (const p of all()) await p.$('.reveal-overlay .btn').then((b) => b && jsClick(p, '.reveal-overlay .btn', 10000)).catch(() => {});
  const id = await seatOf('Abbey');
  await until(players.colter, (id) => Boolean(window.__engine.others.get(id)?.star), id, 15000, 'Colter to see Abbey’s star');
  await place(players.colter, 'town', 0, 9, 0);
  await place(players.abbey, 'town', 0, 7, 0);
  await sleep(1500);
  await shot(players.colter, '21b-gold-star');
});

await check('game: an execution plays out at the gallows for everyone', async () => {
  const id = await seatOf('Steele');
  const abbeySat = await players.abbey.evaluate(() => window.__hud.getState().meetingSeated);
  // Held near its start on both screens from the moment it begins, so neither can run on past the puff while the
  // test is still waiting for the other.
  for (const p of [players.abbey, players.steele]) await p.evaluate(() => void (window.__engine.showFreeze = 0.6));
  // The Storyteller picks the gallows outright (otherwise the town votes, and the wheel could land on anything).
  await st.evaluate((id) => {
    window.__st.st.markSeat(id);
    window.__st.st.execute(id, 'hang');
  }, id);
  try {
    await until(players.abbey, () => Boolean(window.__engine.show), null, 15000, 'the show to start for Abbey');
  } catch (e) {
    // What the host did, and what reached Abbey.
    const host = await st.evaluate((id) => {
      const g = window.__host.getState().g;
      return { phase: g.phase, execution: g.execution, marked: g.marked, nomination: g.nomination?.status ?? null, townHall: Boolean(g.townHall), dead: g.seats.find((s) => s.id === id)?.dead };
    }, id);
    const seen = await players.abbey.evaluate(() => ({ execution: window.__client.getState().pub?.execution ?? null, now: Date.now(), status: window.__client.getState().status }));
    throw new Error(`${e.message}; host ${JSON.stringify(host)}; Abbey has ${JSON.stringify(seen)}`);
  }
  await until(players.steele, () => Boolean(window.__engine.show?.mine), null, 15000, 'the show to start for Steele');
  // Hold the show at set moments on both screens, so even a slow machine shows every beat.
  const viewers = [players.abbey, players.steele];
  const frame = async (age, name) => {
    for (const p of viewers) await p.evaluate((a) => void (window.__engine.showFreeze = a), age);
    await sleep(1200);
    await shot(players.abbey, name);
  };
  const ghostToAbbey = () => players.abbey.evaluate((id) => window.__engine.others.get(id)?.ghost, id);
  await frame(0.6, '22-execution');
  await shot(players.steele, '22-execution-condemned');
  expect((await ghostToAbbey()) === false, 'Steele was already a ghost before the drop');
  if (abbeySat) expect(await players.abbey.evaluate(() => window.__hud.getState().meetingSeated), 'the execution knocked Abbey off her stool');
  // The drop, the rope jolting taut, the swing, then the puff with the ghost floating up out of the trapdoor.
  for (const [k, age] of [['a', 1.75], ['b', 2.3], ['c', 2.9]]) await frame(age, `22-drop-${k}`);
  expect((await ghostToAbbey()) === false, 'Steele turned into a ghost while still hanging');
  await frame(3.5, '23-execution-puff');
  await frame(3.95, '23-execution-ghost');
  expect((await ghostToAbbey()) === true, 'Steele is not a ghost after the puff');
  // Steele's first death unlocks the halo, but nothing pops up over the hanging.
  expect(!(await players.steele.$('.new-hat, .new-feat')), 'an unlock popped up in the middle of the hanging');
  for (const p of viewers) await p.evaluate(() => void (window.__engine.showFreeze = null));
  await until(players.steele, () => !window.__engine.show, null, 15000, 'the show to end');
  await players.steele.waitForSelector('.new-hat, .new-feat', { timeout: 20000 });
  await shot(players.steele, '23c-unlock-after-hanging');
  await until(players.abbey, () => !window.__engine.show, null, 15000, 'the show to end for Abbey');
  const dead = await players.abbey.evaluate((id) => window.__client.getState().pub.seats.find((s) => s.id === id)?.dead, id);
  expect(dead, 'Steele is not dead after the execution');
  // The meeting is still on, so Steele's ghost goes back to its stool.
  const meeting = await st.evaluate(() => Boolean(window.__host.getState().g.townHall || window.__host.getState().g.nomination));
  if (meeting) await until(players.steele, () => window.__hud.getState().meetingSeated, null, 20000, 'Steele’s ghost to be back on its stool');
  await sleep(1500);
  await shot(players.abbey, '23b-after-execution');
});

await check('game: the grimoire opens over the town for the Storyteller', async () => {
  await st.keyboard.press('Tab');
  await st.waitForSelector('.grimoire-layer .town', { timeout: 15000 });
  await sleep(500);
  await shot(st, '19-grimoire');
  await st.keyboard.press('Tab');
});

await check('game: the reveal shows everyone’s characters over their heads', async () => {
  await st.evaluate(() => window.__st.st.revealGrimoire(true));
  await sleep(1500);
  const n = await players.abbey.$$eval('.tag-role.on', (els) => els.length);
  expect(n >= 3, `${n} characters shown`);
  await shot(players.abbey, '20-reveal');
});

console.log('\n' + results.map((r) => r.join('  ')).join('\n'));
console.log(`\n${results.filter((r) => r[0] === 'PASS').length} of ${results.length} passed`);
if (errors.length) console.log('\nErrors:\n' + [...new Set(errors)].slice(0, 30).join('\n'));
await browser.close();
for (const p of procs) {
  try {
    process.kill(-p.pid);
  } catch {
    p.kill();
  }
}
process.exit(results.some((r) => r[0] === 'FAIL') || errors.length ? 1 : 0);
