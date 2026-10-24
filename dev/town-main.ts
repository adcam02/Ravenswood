// A look at the town on its own: ?zone=tavern&x=0&z=0&t=1&dist=16&yaw=0.3&wide=1
// Also ?weather=rain|mist, ?day=0.9 (how far through the day), ?sway=4 (exaggerated wind, to check it moves),
// ?follow=x,z (where the player is, for the birds and the rain), ?ripple to drop rings on the pond.
import * as THREE from 'three';
import { createTown } from '../src/world/town';
import { swayUniforms } from '../src/world/town/fx';
import { ANIMALS, BOOTHS, animalInfo, emptyTown, type AnimalId, type PetId, type Weather, type ZoneKind } from '../src/world/types';
import { buildAnimal } from '../src/world/animals';
import { BED, groundAt } from '../src/world/town/layout';
import { NightVisit, bendVictim } from '../src/world/visit';
import { PigeonFlight } from '../src/world/pigeon';
import { AvatarView } from '../src/world/avatar';
import { EXEC_CAM, ExecStage, execCamera } from '../src/world/exec/stage';
import type { ExecMethod } from '../src/state/types';

const q = new URLSearchParams(location.search);
const num = (k: string, d: number) => (q.has(k) ? Number(q.get(k)) : d);
const zone = (q.get('zone') ?? 'town') as ZoneKind;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(innerWidth, innerHeight);
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
  visit = new NightVisit(town.groups.house, num('visit', 0));
  const animal = q.get('animal') ?? 'fox';
  sleeper = buildAnimal({ animal: animal as never, color: q.get('color') ?? animalInfo(animal).colors[0], hat: (q.get('hat') ?? null) as never });
  sleeper.root.position.set(BED.x, BED.top, BED.z + 0.25);
  if (q.has('ghost')) sleeper.setGhost(true);
  town.groups.house.add(sleeper.root);
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
      town.groups.house.add(sleeper.root);
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
  const stage = new ExecStage(o.exec as Exclude<ExecMethod, 'hang'>, Boolean(o.spared), spot);
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
if (q.has('exec')) execAt({ exec: q.get('exec')!, et: num('et', 2), animal: q.get('animal') ?? undefined, spared: q.has('spared'), hat: q.get('hat') ?? undefined, ry: num('ry', 0), edist: q.has('edist') ? num('edist', 8.5) : undefined });
// ?walkers=fox:zapmouse,bear:dragon: animals walking towards the camera past the focus, each with its pet in
// tow (?stop=12 has them stand still for the last 12 frames, the pets catching up; ?ghost makes the second a ghost).
const walkers: AvatarView[] = [];
if (q.has('walkers')) {
  q.get('walkers')!.split(',').forEach((w, i) => {
    const [animal, pet] = w.split(':') as [AnimalId, PetId];
    const color = ANIMALS.find((a) => a.id === animal)?.colors[0] ?? '#e2793a';
    walkers.push(new AvatarView(scene, { name: animal, look: { animal, color, pet }, ghost: q.has('ghost') && i === 1, storyteller: false, isMe: false, role: null, badge: null }));
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
