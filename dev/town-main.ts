// A look at the town on its own: ?zone=tavern&x=0&z=0&t=1&dist=16&yaw=0.3&wide=1
import * as THREE from 'three';
import { createTown } from '../src/world/town';
import { emptyTown, type ZoneKind } from '../src/world/types';

const q = new URLSearchParams(location.search);
const num = (k: string, d: number) => (q.has(k) ? Number(q.get(k)) : d);
const zone = (q.get('zone') ?? 'town') as ZoneKind;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(num('fov', 40), innerWidth / innerHeight, 0.3, 400);
const town = createTown(scene, renderer);
town.show(zone);
town.setTime(num('t', 0));

const tx = num('x', 0);
const tz = num('z', 0);
const wide = q.has('wide');
const dist = num('dist', wide ? 95 : 16);
const yaw = num('yaw', 0);
const pitch = num('pitch', wide ? 0.95 : zone === 'town' ? 0.78 : 0.95);
camera.position.set(tx + Math.sin(yaw) * dist * Math.cos(pitch), dist * Math.sin(pitch), tz + Math.cos(yaw) * dist * Math.cos(pitch));
camera.lookAt(tx, 0.8, tz);
town.follow(tx, tz);

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
if (q.has('meeting')) town.setMeeting({ n: 8, nominee: 2, hand: 4, active: true, votes: [0, 4, 6] });
if (q.has('bell')) town.bellRing();

const clock = new THREE.Clock();
let frames = 0;
function loop() {
  requestAnimationFrame(loop);
  const dt = clock.getDelta();
  town.update(dt, clock.elapsedTime + num('skip', 0));
  renderer.render(scene, camera);
  frames++;
  if (frames === 10) {
    (window as unknown as { done: boolean }).done = true;
    (window as unknown as { info: unknown }).info = { calls: renderer.info.render.calls, triangles: renderer.info.render.triangles };
  }
}
loop();
