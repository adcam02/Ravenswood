// A look at the town on its own: ?zone=tavern&x=0&z=0&t=1&dist=16&yaw=0.3&wide=1
// Also ?weather=rain|mist, ?day=0.9 (how far through the day), ?sway=4 (exaggerated wind, to check it moves),
// ?follow=x,z (where the player is, for the birds and the rain), ?ripple to drop rings on the pond.
import * as THREE from 'three';
import { createTown } from '../src/world/town';
import { swayUniforms } from '../src/world/town/fx';
import { emptyTown, type Weather, type ZoneKind } from '../src/world/types';
import { buildAnimal } from '../src/world/animals';
import { BED } from '../src/world/town/layout';
import { NightVisit } from '../src/world/visit';
import { PigeonFlight } from '../src/world/pigeon';

const q = new URLSearchParams(location.search);
const num = (k: string, d: number) => (q.has(k) ? Number(q.get(k)) : d);
const zone = (q.get('zone') ?? 'town') as ZoneKind;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
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
town.setTime(num('t', 0));
if (q.has('day')) town.setDayProgress(num('day', 0.35));
if (q.has('weather')) town.setWeather(q.get('weather') as Weather);

const tx = num('x', 0);
const tz = num('z', 0);
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
if (q.has('meeting')) town.setMeeting({ n: 8, nominee: 2, nominator: 6, hand: 4, active: true, votes: [0, 4, 6] });
if (q.has('bell')) town.bellRing();
// ?curtains: the confession booth's curtains drawn (as when someone sits on each side).
if (q.has('curtains')) town.setBoothCurtains(true);
if (q.has('gallows')) town.setGallows({ open: num('gallows', 1), label: 'Steele is executed', ring: num('ring', 0), rope: num('rope', 0.97), swing: num('swing', 0), puff: num('puff', 0) });

// ?visit=0..3&vt=4.2: the hooded figure's night visit, held at vt seconds in, with a fox asleep in the bed (and
// ?vcam to look from where the game's camera does).
let visit: NightVisit | null = null;
let sleeper: ReturnType<typeof buildAnimal> | null = null;
if (q.has('visit')) {
  visit = new NightVisit(town.groups.house, num('visit', 0));
  sleeper = buildAnimal({ animal: (q.get('animal') ?? 'fox') as never, color: '#e2793a' });
  sleeper.root.position.set(BED.x, BED.top, BED.z + 0.25);
  town.groups.house.add(sleeper.root);
  if (q.has('vcam')) {
    camera.position.set(BED.x + 1.5, 2.6, BED.z + 3.3);
    camera.lookAt(BED.x - 0.6, 0.9, BED.z - 0.6);
  }
}

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
    const vt = num('vt', 3);
    const at = Math.min(vt, (frames / Math.max(1, settle - 1)) * vt);
    sleeper.update({ anim: 'sleep', speed: 0, dt: 0.016, t: at });
    if (frames === 3) visit.aim(new THREE.Box3().setFromObject(sleeper.root));
    const pose = visit.update(at);
    sleeper.root.position.y = BED.top + pose.dy;
    sleeper.root.rotation.z = pose.shake;
  }
  if (q.has('sway')) swayUniforms.uSway.value = num('sway', 4);
  if (q.has('ripple') && frames === 2) for (let i = 0; i < 4; i++) town.ripple(6.5 + (i - 1.5) * 1.6, 17.8 + (i % 2) * 1.2, 1);
  // ?dust: someone running along x from the focus, kicking up a puff each frame.
  if (q.has('dust') && frames < settle - 1) town.puff(tx + frames * 0.35, 0, tz);
  if (town.consumeShadowDirty()) {
    renderer.shadowMap.needsUpdate = true;
    shadowRenders++;
  }
  renderer.render(scene, camera);
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
    (window as unknown as { info: unknown }).info = { calls: renderer.info.render.calls, triangles: renderer.info.render.triangles, total: Math.round(total), buildMs, badNormals, shadowRenders, kinds };
  }
}
loop();
