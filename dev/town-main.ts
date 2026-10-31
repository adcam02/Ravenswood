// A look at the town on its own: ?zone=tavern&x=0&z=0&t=1&dist=16&yaw=0.3&wide=1
// Also ?weather=rain|mist, ?day=0.9 (how far through the day), ?sway=4 (exaggerated wind, to check it moves),
// ?follow=x,z (where the player is, for the birds and the rain), ?ripple to drop rings on the pond.
import * as THREE from 'three';
import { GRAVES, STOOLS } from '../src/world/stoolShop';
import { CSS2DRenderer } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import '../src/styles/cosy.css';
import '../src/styles/casino.css';
import { createTown } from '../src/world/town';
import { swayUniforms } from '../src/world/town/fx';
import { ANIMALS, BOOTHS, animalInfo, emptyTown, type AnimalId, type HatId, type PetId, type Weather, type ZoneKind } from '../src/world/types';
import { buildAnimal } from '../src/world/animals';
import { BED, groundAt } from '../src/world/town/layout';
import { NightVisit, bendVictim } from '../src/world/visit';
import { PigeonFlight } from '../src/world/pigeon';
import { AvatarView } from '../src/world/avatar';
import type { ExecStage } from '../src/world/exec/stage';
import { EXEC_CAM, execCamera, makeStage } from '../src/world/exec/shows';
import type { ExecMethod } from '../src/state/types';
import { CHAIR_Y, FELT_Y, PK_TABLE, RL_LOOK, SLOTS, bjSeat, bjSpot, pkSeat, rlSeat, slStool } from '../src/world/town/casinoLayout';
import { PIECES, freeSpot, type FlatItem } from '../src/flats/catalogue';

const q = new URLSearchParams(location.search);
const num = (k: string, d: number) => (q.has(k) ? Number(q.get(k)) : d);
const zone = (q.get('zone') ?? 'town') as ZoneKind;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(innerWidth, innerHeight);
// Labels over the scene (the plates round a card table from a seat).
const labels = new CSS2DRenderer();
labels.setSize(innerWidth, innerHeight);
Object.assign(labels.domElement.style, { position: 'absolute', inset: '0', pointerEvents: 'none' });
document.body.append(labels.domElement);
renderer.shadowMap.enabled = !q.has('noshadow');
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
// As in the game: the shadows are drawn only when the town says something changed.
renderer.shadowMap.autoUpdate = false;
renderer.toneMapping = THREE.NeutralToneMapping;
renderer.toneMappingExposure = 1.06;
document.body.appendChild(renderer.domElement);
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(num('fov', 40), innerWidth / innerHeight, 0.3, 400);
const t0 = performance.now();
const town = createTown(scene, renderer);
const buildMs = Math.round(performance.now() - t0);
town.show(zone, q.has('night'));
if (q.has('low')) town.setLowDetail(true);
town.setTime(num('t', 0));
if (q.has('day')) town.setDayProgress(num('day', 0.35));
if (q.has('weather')) town.setWeather(q.get('weather') as Weather);
// ?zone=flat&furnish=all (every piece, wherever it fits) or demo (a cosy flat), with ?wall=, ?floor= and ?held=<piece>.
if (zone === 'flat') {
  const items: FlatItem[] = [];
  if (q.get('furnish') === 'all') {
    for (const p of PIECES) {
      const spot = freeSpot(items, p.id);
      if (spot) items.push(spot);
    }
  } else if (q.get('furnish') === 'demo') {
    items.push(
      { id: 'sofa', x: 7, z: 5, r: 0 },
      { id: 'coffee', x: 8, z: 8, r: 0 },
      { id: 'armchair', x: 3, z: 7, r: 3 },
      { id: 'bookshelf', x: 0, z: 1, r: 3 },
      { id: 'lamp', x: 2, z: 5, r: 0 },
      { id: 'fishtank', x: 16, z: 8, r: 1 },
      { id: 'jukebox', x: 14, z: 13, r: 0 },
      { id: 'plant', x: 0, z: 15, r: 0 },
      { id: 'fern', x: 18, z: 14, r: 0 },
      { id: 'petbed', x: 13, z: 7, r: 0 },
      { id: 'painting', x: 12, z: 0, r: 0 },
      { id: 'neon', x: 0, z: 0, r: 0 },
      { id: 'trophies', x: 0, z: 9, r: 1 },
      { id: 'bunting', x: 19, z: 3, r: 3 },
      { id: 'mirror', x: 19, z: 10, r: 3 },
    );
  }
  // ?art: drawings from the night gallery in "Your art" frames, on the back wall and the left one.
  const art: Record<string, string> = {};
  if (q.has('art')) {
    [
      { x: 0, z: 0, r: 0 },
      { x: 0, z: 4, r: 1 },
      { x: 0, z: 9, r: 1 },
    ].forEach((at, i) => {
      const c = document.createElement('canvas');
      c.width = 480;
      c.height = 360;
      const g = c.getContext('2d')!;
      g.fillStyle = ['#7fd0f0', '#fff', '#ffd23f'][i];
      g.fillRect(0, 0, 480, 360);
      g.lineCap = 'round';
      for (let k = 0; k < 5; k++) {
        g.strokeStyle = ['#e0403a', '#2f6fd0', '#2f8a46', '#9a5fd0', '#1f1a17'][(i + k) % 5];
        g.lineWidth = 8 + k * 4;
        g.beginPath();
        g.arc(140 + k * 50, 120 + ((k * 37 + i * 50) % 140), 40 + k * 8, 0, Math.PI * 1.4);
        g.stroke();
      }
      art[`art${i}`] = c.toDataURL('image/png');
      items.push({ id: 'myart', ...at, art: `art${i}` });
    });
  }
  const held = q.get('held');
  const spot = held ? freeSpot(items, held) : null;
  town.setFlat({ layout: { wall: q.get('wall') ?? 'cream', floor: q.get('floor') ?? 'oak', items }, held: spot ? { item: spot, index: -1, ok: true } : null, grid: q.has('grid') || Boolean(held), art });
}

// ?door=tavern-in: that door held wide open (as when someone goes in), and the camera on it unless x, z say otherwise.
const openDoor = q.has('door') ? town.doors.find((d) => d.id === q.get('door')) : undefined;
const tx = openDoor && !q.has('x') ? openDoor.x : num('x', 0);
const tz = openDoor && !q.has('z') ? openDoor.z : num('z', 0);
const wide = q.has('wide');
const dist = num('dist', wide ? 95 : 16);
const yaw = num('yaw', 0);
const pitch = num('pitch', wide ? 0.95 : zone === 'town' ? 0.78 : 0.95);
camera.position.set(tx + Math.sin(yaw) * dist * Math.cos(pitch), dist * Math.sin(pitch), tz + Math.cos(yaw) * dist * Math.cos(pitch));
camera.lookAt(tx, 0.8, tz);
const [fx, fz] = q.has('follow') ? q.get('follow')!.split(',').map(Number) : [tx, tz];
town.follow(fx, fz);

const state = emptyTown();
const now = Date.now();
state.drinks = [
  { id: 'a', kind: 'ale', stars: 3, by: 'Abbey', spot: 0 },
  { id: 'b', kind: 'cocoa', stars: 2, by: 'Abbey', spot: 2 },
  { id: 'c', kind: 'milk', stars: 1, by: 'Abbey', spot: 4 },
];
state.loaves = [
  { id: 'l1', kind: 'loaf', stars: 3, by: 'Steele', slot: 0 },
  { id: 'l2', kind: 'pie', stars: 3, by: 'Steele', slot: 1 },
  { id: 'l3', kind: 'bun', stars: 3, by: 'Steele', slot: 5 },
];
state.clothes = ['shirt', 'sock', 'dress', 'towel', 'pants', 'shirt'].map((kind, i) => ({
  id: `c${i}`,
  kind: kind as never,
  color: ['#e8675a', '#6fb0e0', '#f39ab5', '#f2c14e', '#7cc28b', '#b494dd'][i],
  by: 'Colter',
  line: i % 2,
  slot: i,
}));
state.flowers = Array.from({ length: 10 }, (_, i) => ({
  id: `f${i}`,
  bed: i % 4,
  spot: Math.floor(i / 4) + (i % 2),
  kind: (['tulip', 'daisy', 'sunflower', 'rose'] as const)[i % 4],
  color: ['#e8505b', '#ffffff', '#f6c445', '#d8407a'][i % 4],
  by: 'Jarrod',
  at: now - 60000 * (i % 3) * 0.5,
}));
town.setTown(state, now);
town.setHouses(Array.from({ length: 20 }, (_, i) => (i < 6 ? { name: ['Abbey', 'Colter', 'Steele', 'Jarrod', 'Mika', 'Theo'][i], dead: i === 1 } : null)));
town.setHomeOwner('Abbey');
town.setGraves(['Colter', 'Mika']);
// ?gallery=7 hangs that many made-up drawings in the night gallery (?revealed names them, with the top three).
if (q.has('gallery')) {
  const n = num('gallery', 7);
  const names = ['Abbey', 'Ben', 'Cara', 'Dev', 'Ellie', 'Finn', 'Gus', 'Hana', 'Ivy', 'Jo', 'Kit', 'Lou', 'Max', 'Ned', 'Ola'];
  const pieces = Array.from({ length: n }, (_, i) => {
    const c = document.createElement('canvas');
    c.width = 480;
    c.height = 360;
    const g = c.getContext('2d')!;
    g.fillStyle = '#fff';
    g.fillRect(0, 0, 480, 360);
    g.lineCap = 'round';
    for (let k = 0; k < 6; k++) {
      g.strokeStyle = ['#e0403a', '#2f6fd0', '#7ccf5a', '#ffd23f', '#9a5fd0', '#1f1a17'][(i + k) % 6];
      g.lineWidth = 6 + ((i * 7 + k * 5) % 20);
      g.beginPath();
      g.arc(120 + ((i * 53 + k * 71) % 260), 90 + ((i * 37 + k * 43) % 180), 30 + ((i + k) % 5) * 14, 0, Math.PI * (1 + (k % 3) * 0.5));
      g.stroke();
    }
    return { id: `p${i}`, img: c.toDataURL('image/png'), name: q.has('revealed') ? names[i % names.length] : undefined, place: q.has('revealed') && i < 3 ? i + 1 : undefined };
  });
  town.setGallery('A cat in a top hat', pieces);
}
// ?stools: a dozen players round the dais on bought stools, two of them dead (one with a ghost vote left, one
// spent), and gravestones of every design in the churchyard (?stools=2 for the rest of the stools).
if (q.has('stools')) {
  const names = ['Abbey', 'Colter', 'Steele', 'Jarrod', 'Mika', 'Theo', 'Wren', 'Pip', 'Ada', 'Bo', 'Cy', 'Di'];
  const from = q.get('stools') === '2' ? 12 : 0;
  town.setMeeting({ n: 12, nominee: null, hand: null, active: false, votes: [] });
  town.setStoolNames(
    names.map((name, i) => ({ name, me: i === 0, dead: i === 3 || i === 7, ghostVote: i === 3, stool: STOOLS[(from + i) % STOOLS.length].id, grave: i === 7 ? 'angel' : null })),
  );
  town.setGraves([null, ...GRAVES.map((g) => g.id)].map((grave, i) => ({ name: names[i], grave, epitaph: grave === 'tablet' ? 'Was framed by the Spy' : '' })));
}
if (q.has('meeting')) town.setMeeting({ n: 8, nominee: 2, nominator: 6, hand: 4, active: true, votes: [0, 4, 6] });
if (q.has('bell')) town.bellRing();
// ?curtains: every confession booth's curtains drawn (as when someone sits on each side).
if (q.has('curtains')) BOOTHS.forEach((_, i) => town.setBoothCurtains(true, i));
if (q.has('gallows')) town.setGallows({ open: num('gallows', 1), label: 'Steele is executed', ring: num('ring', 0), rope: num('rope', 0.97), swing: num('swing', 0), puff: num('puff', 0) });

// ?visit=0..9&vt=4.2: the hooded figure's night visit, held at vt seconds in, with a fox asleep in the bed (or
// ?animal=kaiju; ?ghost to show them as the ghost they are by then in the game; ?vcam to look from where the game's
// camera does; ?hat= puts a hat on them; ?color= its colour). ?vt=1.4,3.3,3.9 stops at each moment in turn, waiting for `next()` between them, for contact sheets.
let visit: NightVisit | null = null;
let sleeper: ReturnType<typeof buildAnimal> | null = null;
const moments = (q.get('vt') ?? '3').split(',').map(Number);
let moment = 0;
let walkFrom = 0;
let walkStart = 0;
(window as unknown as { next: () => void }).next = () => {
  walkFrom = moments[moment];
  moment = Math.min(moments.length - 1, moment + 1);
  walkStart = frames;
  (window as unknown as { done: boolean }).done = false;
};
if (q.has('visit')) {
  visit = new NightVisit(town.groups[zone], num('visit', 0));
  const animal = q.get('animal') ?? 'fox';
  sleeper = buildAnimal({ animal: animal as never, color: q.get('color') ?? animalInfo(animal).colors[0], hat: (q.get('hat') ?? null) as never });
  sleeper.root.position.set(BED.x, BED.top, BED.z + 0.25);
  if (q.has('ghost')) sleeper.setGhost(true);
  town.groups[zone].add(sleeper.root);
  if (q.has('vcam')) {
    camera.position.set(BED.x + 1.5, 2.6, BED.z + 3.3);
    camera.lookAt(BED.x - 0.6, 0.9, BED.z - 0.6);
  }
}
// For going through every animal in bed without building the town each time: bench.sleepAs('kaiju') puts another
// animal in the bed (settled straight into its sleeping pose), bench.lookFrom([x, y, z], [x, y, z]) moves the
// camera, bench.shadows() redraws the shadows for the next frame, bench.sleeper() is whoever is in the bed.
let redrawShadows = false;
Object.assign(window, {
  bench: {
    sleepAs(id: string, color?: string) {
      if (!sleeper) return;
      sleeper.dispose();
      sleeper = buildAnimal({ animal: id as never, color: color ?? animalInfo(id).colors[0] });
      sleeper.root.position.set(BED.x, BED.top, BED.z + 0.25);
      town.groups[zone].add(sleeper.root);
      for (let i = 0; i < 6; i++) sleeper.update({ anim: 'sleep', speed: 0, dt: 0.5, t: num('vt', 3) });
      redrawShadows = true;
    },
    lookFrom(from: [number, number, number], to: [number, number, number]) {
      camera.position.set(...from);
      camera.lookAt(...to);
    },
    shadows: () => (redrawShadows = true),
    sleeper: () => sleeper,
    frames: () => frames,
  },
});

// ?pigeon=3.5: a messenger pigeon held at that many seconds in, coming to a fox standing at x, z.
let pigeon: PigeonFlight | null = null;
let perch: ReturnType<typeof buildAnimal> | null = null;
if (q.has('pigeon')) {
  perch = buildAnimal({ animal: (q.get('animal') ?? 'fox') as never, color: '#e2793a' });
  perch.root.position.set(tx, 0, tz);
  perch.root.rotation.y = num('ry', 0.4);
  town.groups[zone].add(perch.root);
  pigeon = new PigeonFlight(scene, () => {}, 2.2);
}

// ?casino: the Lucky Raven's tables mid-game, with players sitting at them (?seatcam=pk:4 or bj:2 looks from that seat).
const sitters: ReturnType<typeof buildAnimal>[] = [];
// (The wheel is held still at ?rlt seconds into its spin: the bench keeps telling it the time is that moment.)
const benchT0 = Date.now();
let casinoView: Parameters<typeof town.setCasino>[0] = null;
if (q.has('casino')) {
  const seat = (name: string, cards: string[], stack: number, bet: number, last: string | null, mine = false, folded = false) => ({ name, mine, stack, bet, inHand: true, folded, allIn: false, out: false, cards, last, won: 0, hand: null });
  casinoView = {
    bj: [
      { name: 'Abbey', mine: false, state: 'playing', bet: 10, cards: ['Kh', '7c'], dealer: ['6d', '??'], result: null, paid: 0, canDouble: true, until: null },
      null,
      { name: 'Theo', mine: true, state: 'done', bet: 5, cards: ['As', 'Jd'], dealer: ['9c', '8h'], result: 'blackjack', paid: 13, canDouble: false, until: null },
      null,
      { name: 'Mika', mine: false, state: 'dealer', bet: 25, cards: ['9h', '9s'], dealer: ['Ts', '4c', '5d'], result: null, paid: 0, canDouble: false, until: null },
    ],
    pk: {
      seats: [seat('Colter', ['??', '??'], 38, 6, 'Call $6'), null, seat('Steele', ['??', '??'], 52, 6, 'Raise to $6'), seat('Jarrod', [], 20, 0, 'Fold', false, true), null, seat('You', ['Ah', 'Kh'], 64, 0, null, true), seat('Mika', ['??', '??'], 17, 2, 'Big blind'), null],
      hand: 7,
      stage: 'flop',
      board: ['Qh', 'Jh', '4c'],
      pot: 24,
      pots: [],
      button: 2,
      turn: 5,
      until: null,
      toMatch: 6,
      minRaise: 10,
      canRaise: true,
      note: '',
    },
    rl: {
      seats: [
        { name: 'Ann', mine: false, bets: { red: 10, n17: 2, d2: 5 }, ready: true, staked: 0, won: 0 },
        null,
        { name: 'You', mine: true, bets: { n7: 1, odd: 5, c1: 3 }, ready: false, staked: 0, won: 0 },
        null,
        { name: 'Bea', mine: false, bets: { black: 25 }, ready: false, staked: 0, won: 0 },
      ],
      stage: q.has('rlresult') ? 'result' : 'spinning',
      closes: null,
      // (Thrown a moment ago, or settled on 17.)
      spin: { n: 17, at: benchT0 - num('rlt', 3) * 1000, until: benchT0 - num('rlt', 3) * 1000 + 7500, no: 3 },
      history: [32, 5, 0, 17, 26, 11],
    },
    // The slot machines: ours ?slt seconds after the lever was pulled (?sl=6,6,6 for what it stops on), the next
    // one's player just won, and the last one standing idle after a losing pull.
    sl: [
      { name: 'You', mine: true, spin: { reels: (q.get('sl') ?? '6,6,6').split(',').map(Number), bet: 5, won: 500, at: benchT0 - num('slt', 1) * 1000, no: 4 }, readyAt: 0 },
      { name: 'Ann', mine: false, spin: { reels: [0, 0, 3], bet: 2, won: 8, at: benchT0 - 2700, no: 2 }, readyAt: 0 },
      { name: null, mine: false, spin: { reels: [1, 2, 4], bet: 1, won: 0, at: benchT0 - 60000, no: 9 }, readyAt: 0 },
    ],
    note: null,
  };
  town.setCasino(casinoView);
  const at = [
    ['bj', 0, 'deer'],
    ['bj', 2, 'panda'],
    ['bj', 4, 'frog'],
    ['pk', 0, 'bear'],
    ['pk', 2, 'raccoon'],
    ['pk', 3, 'hedgehog'],
    ['pk', 5, 'fox'],
    ['pk', 6, 'capybara'],
    ['rl', 0, 'otter'],
    ['rl', 2, 'bee'],
    ['rl', 4, 'duck'],
    ['sl', 0, 'wolf'],
    ['sl', 1, 'bear'],
  ] as const;
  const seatOf = (table: string, i: number) => (table === 'bj' ? bjSeat(i) : table === 'pk' ? pkSeat(i) : table === 'sl' ? slStool(i) : rlSeat(i));
  for (const [table, i, animal] of at) {
    const spot = seatOf(table, i);
    const a = buildAnimal({ animal, color: ({ wolf: '#8a8c94', deer: '#b07a4a', panda: '#f4efe6', frog: '#7cc28b', bear: '#8a5a36', raccoon: '#8a8c94', hedgehog: '#8a5a36', fox: '#e2793a', capybara: '#a8784a', otter: '#8a5a36', bee: '#f2cf5b', duck: '#f4efe6' } as Record<string, string>)[animal] });
    a.root.position.set(spot.x, CHAIR_Y, spot.z);
    a.root.rotation.y = spot.ry;
    town.groups.casino.add(a.root);
    sitters.push(a);
  }
  if (q.has('seatcam')) {
    const [table, n] = q.get('seatcam')!.split(':');
    const i = Number(n);
    const spot = seatOf(table, i);
    const look = table === 'bj' ? bjSpot(i, 0.8) : table === 'pk' ? PK_TABLE : table === 'sl' ? { x: SLOTS[i].x - 0.3, z: SLOTS[i].z } : RL_LOOK;
    // (At a slot machine the eyes sit a little behind the stool, looking at the reels, as in the game.)
    const ahead = table === 'sl' ? -0.95 : 0.18;
    camera.fov = num('fov', 58);
    camera.near = 0.1;
    camera.updateProjectionMatrix();
    camera.position.set(spot.x + Math.sin(spot.ry) * ahead, CHAIR_Y + 0.8, spot.z + Math.cos(spot.ry) * ahead);
    camera.lookAt(look.x, table === 'sl' ? 1.15 : FELT_Y, look.z);
    // (As in the game, the picture sits a little higher, above the table's panel.)
    camera.setViewOffset(1000, 1000, 0, 170, 1000, 1000);
    // Everyone else round the table gets a plate, as in the game.
    if (table !== 'sl') town.setCasinoSeat(table === 'bj' ? 'blackjack' : table === 'pk' ? 'poker' : 'roulette');
    // (Whoever sits there is us: out of the lens's way.)
    sitters.forEach((a) => Math.hypot(a.root.position.x - spot.x, a.root.position.z - spot.z) < 0.1 && (a.root.visible = false));
  }
}
// ?exec=guillotine&et=3.2: an execution held at et seconds in, on a fox (or &animal=) at the gallows, seen from the
// meeting camera; &spared for the lucky escape, &ry= to turn the camera round the gallows, &edist= to move it back.
// window.execAt({ exec, et, animal, spared }) shows another without building the town again.
let exec: ExecStage | null = null;
let condemned: ReturnType<typeof buildAnimal> | null = null;
function execAt(o: { exec: string; et: number; animal?: string; spared?: boolean; hat?: string; ry?: number; edist?: number }) {
  exec?.dispose();
  condemned?.root.removeFromParent();
  condemned?.dispose();
  renderer.localClippingEnabled = true;
  const animal = (o.animal ?? 'fox') as never;
  const colour = ANIMALS.find((a) => a.id === animal)?.colors[0] ?? '#e2793a';
  const rig = buildAnimal({ animal, color: colour, hat: (o.hat as never) ?? null });
  condemned = rig;
  town.groups.town.add(rig.root);
  const spot = town.gallowsSpot;
  rig.root.position.set(spot.x, spot.y, spot.z);
  rig.root.rotation.y = spot.ry;
  const stage = makeStage(o.exec as Exclude<ExecMethod, 'hang'>, Boolean(o.spared), spot);
  exec = stage;
  town.groups.town.add(stage.group);
  // The gallows' own noose is tied up out of the way.
  town.setGallows({ open: 0, label: '', rope: 0.25 });
  let ghost = false;
  // Walked up to the moment in small steps, so everything that happens on the way happens.
  for (let x = 0; ; x = Math.min(o.et, x + 1 / 30)) {
    const pose = stage.update(x, rig, camera);
    if (pose.ghost !== ghost) {
      ghost = pose.ghost;
      rig.setGhost(ghost);
    }
    rig.update({ anim: pose.anim, speed: 0, dt: 1 / 30, t: x });
    rig.root.position.copy(pose.pos);
    rig.root.quaternion.copy(pose.quat);
    rig.root.scale.copy(pose.scale);
    rig.root.visible = pose.visible;
    rig.root.updateMatrixWorld(true);
    if (x >= o.et) break;
  }
  const shot = execCamera(stage.framing(), innerWidth / innerHeight, o.et);
  camera.position.copy(shot.pos).sub(shot.look).applyAxisAngle(new THREE.Vector3(0, 1, 0), o.ry ?? 0).multiplyScalar((o.edist ?? EXEC_CAM.dist) / EXEC_CAM.dist).add(shot.look);
  camera.lookAt(shot.look);
}
(window as unknown as { execAt: typeof execAt }).execAt = execAt;
// window.execClear(): takes down the show and its animal, and says what's left in memory and in the town, so a show
// that leaves something behind shows up as a difference from before it.
function execClear() {
  exec?.dispose();
  exec = null;
  condemned?.root.removeFromParent();
  condemned?.dispose();
  condemned = null;
  renderer.render(scene, camera);
  let objects = 0;
  scene.traverse(() => objects++);
  return { geometries: renderer.info.memory.geometries, textures: renderer.info.memory.textures, objects };
}
(window as unknown as { execClear: typeof execClear }).execClear = execClear;
if (q.has('exec')) execAt({ exec: q.get('exec')!, et: num('et', 2), animal: q.get('animal') ?? undefined, spared: q.has('spared'), hat: q.get('hat') ?? undefined, ry: num('ry', 0), edist: q.has('edist') ? num('edist', 8.5) : undefined });
// ?walkers=fox:zapmouse,bear:dragon: animals walking towards the camera past the focus, each with its pet in
// tow (?stop=12 has them stand still for the last 12 frames, the pets catching up; ?ghost makes the second a ghost).
// A third part puts a hat on: fox::trophy (no pet), bear:dragon:crown.
const walkers: AvatarView[] = [];
if (q.has('walkers')) {
  q.get('walkers')!.split(',').forEach((w, i) => {
    const [animal, pet, hat] = w.split(':') as [AnimalId, PetId, HatId | undefined];
    const color = ANIMALS.find((a) => a.id === animal)?.colors[0] ?? '#e2793a';
    walkers.push(new AvatarView(scene, { name: animal, look: { animal, color, pet: pet || null, hat: hat || null }, ghost: q.has('ghost') && i === 1, storyteller: false, isMe: false, role: null, badge: null }));
    // (&nofx hides the prestige hats' effects, to see what they cost.)
    if (q.has('nofx')) walkers[i].setHatFxShown(false);
  });
}

const clock = new THREE.Clock();
let frames = 0;
let shadowRenders = 0;
const settle = num('frames', 10);
function loop() {
  requestAnimationFrame(loop);
  // Weather fades over two seconds, so let it arrive at once here.
  const dt = frames < 3 && q.has('weather') ? 2.5 : clock.getDelta();
  town.update(dt, clock.elapsedTime + num('skip', 0));
  if (pigeon && perch) {
    const pt = Math.min(num('pigeon', 3), (frames / Math.max(1, settle - 1)) * num('pigeon', 3));
    perch.update({ anim: 'idle', speed: 0, dt: 0.016, t: pt });
    const ry = perch.root.rotation.y;
    const shoulder = new THREE.Vector3(Math.cos(ry) * -0.24, perch.headHeight * 0.72, -Math.sin(ry) * -0.24).add(perch.root.position);
    pigeon.update(pt, shoulder, ry);
  }
  if (visit && sleeper) {
    // Walked up to the moment in small steps, so the puffs and drops along the way are where they'd be.
    const vt = moments[moment];
    const steps = moment ? Math.max(3, Math.ceil((vt - walkFrom) / 0.1)) : Math.max(1, settle - 1);
    const at = walkFrom + (vt - walkFrom) * Math.min(1, (frames - walkStart) / steps);
    sleeper.update({ anim: 'sleep', speed: 0, dt: 0.016, t: at });
    if (frames === 3) visit.aim(new THREE.Box3().setFromObject(sleeper.root));
    const pose = visit.update(at);
    sleeper.root.position.y = BED.top + pose.dy;
    sleeper.root.rotation.set(0, 0, pose.shake);
    sleeper.root.scale.setScalar(1);
    bendVictim(sleeper.root, pose);
    if (moment && frames - walkStart === steps + 2) (window as unknown as { done: boolean }).done = true;
  }
  if (walkers.length) {
    // In even steps, so a shot lands at the same moment however slowly this draws.
    const going = frames < settle - num('stop', 0);
    const walked = Math.min(frames, settle - num('stop', 0)) * 0.05 * 3;
    walkers.forEach((w, i) => {
      const x = tx + (i - (walkers.length - 1) / 2) * 1.5;
      const z = tz - 3 + walked - (i % 2) * 0.7;
      w.ground = groundAt(x, z);
      w.setTarget(x, z, 0, w.ground);
      w.update(0.05, frames * 0.05, going ? 'walk' : 'idle', false, false);
    });
  }
  if (casinoView) town.setCasino(casinoView, benchT0 - Date.now());
  for (const a of sitters) a.update({ anim: 'sit', speed: 0, dt: 0.016, t: clock.elapsedTime });
  if (q.has('sway')) swayUniforms.uSway.value = num('sway', 4);
  if (openDoor) town.openDoor(openDoor.x, openDoor.z);
  if (q.has('ripple') && frames === 2) for (let i = 0; i < 4; i++) town.ripple(6.5 + (i - 1.5) * 1.6, 17.8 + (i % 2) * 1.2, 1);
  // ?dust: someone running along x from the focus, kicking up a puff each frame.
  if (q.has('dust') && frames < settle - 1) town.puff(tx + frames * 0.35, 0, tz);
  if (town.consumeShadowDirty() || redrawShadows) {
    redrawShadows = false;
    renderer.shadowMap.needsUpdate = true;
    shadowRenders++;
  }
  renderer.render(scene, camera);
  labels.render(scene, camera);
  frames++;
  if (frames === settle) {
    (window as unknown as { done: boolean }).done = true;
    let total = 0;
    scene.traverse((o) => {
      const m = o as THREE.Mesh;
      if (m.isMesh && m.geometry) total += (m.geometry.index ? m.geometry.index.count : m.geometry.getAttribute('position').count) / 3;
    });
    // Any NaN normal shows up as a black patch, so count them.
    let badNormals = 0;
    scene.traverse((o) => {
      const n = (o as THREE.Mesh).geometry?.getAttribute?.('normal') as THREE.BufferAttribute | undefined;
      if (!n) return;
      const arr = n.array as Float32Array;
      for (let i = 0; i < arr.length; i++) if (Number.isNaN(arr[i])) badNormals++;
    });
    // How many meshes of each kind, to keep an eye on draw calls.
    const kinds: Record<string, number> = {};
    scene.traverse((o) => {
      if ((o as THREE.Mesh).isMesh && o.visible) kinds[o.name || 'other'] = (kinds[o.name || 'other'] ?? 0) + 1;
    });
    (window as unknown as { info: unknown }).info = { calls: renderer.info.render.calls, triangles: renderer.info.render.triangles, points: renderer.info.render.points, total: Math.round(total), buildMs, badNormals, shadowRenders, kinds };
  }
}
loop();
