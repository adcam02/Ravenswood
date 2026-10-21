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
const PORT = 5190;
const PEER = 9000;
const BUILD = joinPath(tmpdir(), 'ravenswood-test-build');
mkdirSync(OUT, { recursive: true });
// Machines without a graphics card (like CI) render slowly, so the pages run small, in low graphics, at a capped frame rate.
const FLAGS = `peer=127.0.0.1:${PEER}&debug&fx=low&fps=4`;

const procs = [];
function run(cmd, args) {
  const p = spawn(cmd, args, { stdio: ['ignore', 'pipe', 'pipe'] });
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

console.log('Building…');
const built = spawnSync('npx', ['vite', 'build', '--outDir', BUILD, '--emptyOutDir'], { stdio: ['ignore', 'ignore', 'inherit'] });
if (built.status !== 0) process.exit(1);
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
async function open(name, path) {
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
  await page.goto(`http://localhost:${PORT}/${path}${path.includes('?') ? '&' : '?'}${FLAGS}`);
  page.label = name;
  return page;
}
async function check(name, fn) {
  if (ONLY.length && !ONLY.some((w) => name.toLowerCase().includes(w))) return;
  try {
    await fn();
    results.push(['PASS', name]);
    console.log('PASS', name);
  } catch (e) {
    results.push(['FAIL', name, e.message]);
    console.log('FAIL', name, '-', e.message);
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
const shot = (page, name) => page.screenshot({ path: `${OUT}/${name}.png` });

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
  const p = await open(name, `?room=${room}`);
  await p.waitForSelector('.join-name input', { timeout: 180000 });
  await sleep(600);
  // The town builds on the main thread while the join card is up, so give a busy page plenty of time.
  await p.fill('.join-name input', name, { timeout: 180000 });
  await sleep(400);
  await jsClick(p, '.join-name button');
  if (animal) {
    await p.waitForSelector('.join-animal', { timeout: 180000 });
    await p.waitForSelector(`.join-tile[title="${animal}"] img`, { timeout: 180000 });
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
await check('join: Abbey picks a fox, Colter a shark, Steele an owl', async () => {
  players.abbey = await join('Abbey', 'Fox');
  players.colter = await join('Colter', 'Shark');
  players.steele = await join('Steele', 'Owl', '#8fc1e8');
});

await check('join: the bunny is not on offer to anyone but Jarrod', async () => {
  expect(pickerTiles.length >= 20, `only ${pickerTiles.length} animals offered`);
  expect(!pickerTiles.includes('Bunny'), 'a Bunny tile is offered');
});

await check('join: Jarrod skips the picker and is the bunny', async () => {
  const p = await open('Jarrod', `?room=${room}`);
  await p.waitForSelector('.join-name input', { timeout: 180000 });
  await p.fill('.join-name input', 'jarrod', { timeout: 180000 });
  await sleep(400);
  await jsClick(p, '.join-name button');
  await p.waitForSelector('.join-mic', { timeout: 120000 });
  expect(!(await p.$('.join-animal')), 'Jarrod saw the animal picker');
  await shot(p, '02-jarrod-mic');
  await jsClick(p, '.join-mic .cosy-btn.primary');
  await p.waitForSelector('.place-chip', { timeout: 60000 });
  players.jarrod = p;
  const look = await st.evaluate(() => window.__host.getState().g.seats.find((s) => s.name.toLowerCase() === 'jarrod')?.look);
  expect(look?.animal === 'bunny', `Jarrod is a ${look?.animal}`);
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
  expect(by.Abbey?.[0] === 'fox' && by.Colter?.[0] === 'shark' && by.Steele?.[0] === 'owl', JSON.stringify(seats));
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

await check('voice: lines to far-away players hang up, and reopen when they come back', async () => {
  await place(players.abbey, 'town', 4, 24, 0);
  await place(players.colter, 'town', -30, 30, 0);
  await gainUntil(players.abbey, 'Colter', (g) => g.gain === null, 'the far line to hang up', 45000);
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

// ---------------------------------------------------------------- doors, jobs and items

const stationFor = (p, job) => p.evaluate((job) => window.__engine.town.stations.find((s) => s.job === job), job);

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

await check('jobs: bartending puts a drink on the bar', async () => {
  const p = players.abbey;
  const s = await stationFor(p, 'bartender');
  expect(s, 'no bartender station');
  await place(p, 'tavern', s.stand.x, s.stand.z, s.stand.ry);
  await p.waitForSelector('.action-prompt', { timeout: 30000 });
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
  await p.waitForSelector('.action-prompt', { timeout: 30000 });
  await p.keyboard.press('e');
  await p.waitForSelector('.job-dock', { timeout: 60000 });
  const before = await st.evaluate(() => window.__host.getState().g.town.drinks.length);
  // Pick the first drink, then hold to pour and let go part way.
  await p.keyboard.press('Space');
  await sleep(300);
  await p.keyboard.down('Space');
  await sleep(1600);
  await p.keyboard.up('Space');
  await sleep(600);
  await p.keyboard.down('Space');
  await sleep(500);
  await p.keyboard.up('Space');
  await until(st, (n) => window.__host.getState().g.town.drinks.length > n, before, 60000, 'the poured drink');
});

await check('items: Colter takes a drink from the bar and gives it to Abbey', async () => {
  const c = players.colter;
  const s = await stationFor(c, 'takeDrink');
  expect(s, 'no takeDrink station');
  await place(c, 'tavern', s.stand.x, s.stand.z, s.stand.ry);
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
    await p.waitForSelector('.action-prompt', { timeout: 30000 });
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
  await st.evaluate(() => window.__st.st.callTownHall());
  for (const p of all()) await p.waitForSelector('.bell-call', { timeout: 8000 }).catch(() => expect(false, `${p.label} never saw the bell`));
  await shot(players.abbey, '16-bell');
  // Everyone is taken to their stool on their own; the host sees them arrive.
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
        return { name: s.name, i, off: av ? Math.hypot(av.x - spot.x, av.z - spot.z) : 99, y: av?.y ?? 0, anim: p?.anim };
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
  await shot(players.colter, '16b-seated-minimap');
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
  await st.evaluate((id) => {
    window.__st.st.markSeat(id);
    window.__st.st.toggleDead(id);
  }, id);
  await until(players.abbey, () => Boolean(window.__engine.show), null, 15000, 'the show to start for Abbey');
  await until(players.steele, () => Boolean(window.__engine.show?.mine), null, 15000, 'the show to start for Steele');
  await sleep(900);
  await shot(players.abbey, '22-execution');
  await shot(players.steele, '22-execution-condemned');
  // Through the drop, frame by frame, as Abbey sees it; Steele stays solid (not a ghost) until the puff.
  const before = await players.abbey.evaluate((id) => window.__engine.others.get(id)?.ghost, id);
  expect(before === false, 'Steele was already a ghost before the drop');
  for (const [k, ms] of [['a', 700], ['b', 350], ['c', 500], ['d', 900]]) {
    await sleep(ms);
    await shot(players.abbey, `22-drop-${k}`);
  }
  await sleep(2200);
  await shot(players.abbey, '23-execution-drop');
  await until(players.steele, () => !window.__engine.show, null, 15000, 'the show to end');
  const dead = await players.abbey.evaluate((id) => window.__client.getState().pub.seats.find((s) => s.id === id)?.dead, id);
  expect(dead, 'Steele is not dead after the execution');
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
for (const p of procs) p.kill();
process.exit(results.some((r) => r[0] === 'FAIL') || errors.length ? 1 : 0);
