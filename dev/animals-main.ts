// A test bench for the animals: open /dev/animals.html?view=grid|close|poses|items|ghosts&animal=fox
import * as THREE from 'three';
import { animalThumbnail, buildAnimal, buildStoryteller, type Rig } from '../src/world/animals';
import { buildItem } from '../src/world/items';
import { ANIMALS, type Anim, type AnimalId, type ItemKind } from '../src/world/types';

const q = new URLSearchParams(location.search);
const view = q.get('view') ?? 'grid';
const W = Number(q.get('w') ?? 1400);
const H = Number(q.get('h') ?? 900);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(W, H);
renderer.setPixelRatio(1);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.prepend(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(view === 'night' ? '#1b2040' : '#9fd0f0');
scene.add(new THREE.HemisphereLight('#fff8ee', '#6a8a50', view === 'night' ? 0.5 : 1.6));
const sun = new THREE.DirectionalLight('#fff2dc', view === 'night' ? 0.3 : 2.2);
sun.position.set(6, 12, 8);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
Object.assign(sun.shadow.camera, { left: -14, right: 14, top: 14, bottom: -14, far: 60 });
scene.add(sun);
const ground = new THREE.Mesh(new THREE.PlaneGeometry(80, 80), new THREE.MeshLambertMaterial({ color: '#8cc464' }));
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

const camera = new THREE.PerspectiveCamera(40, W / H, 0.1, 200);
const rigs: { rig: Rig; anim: Anim; speed: number; spinning?: boolean }[] = [];

function place(rig: Rig, x: number, z: number, anim: Anim = 'idle', speed = 0, ry = 0) {
  rig.root.position.set(x, 0, z);
  rig.root.rotation.y = ry;
  scene.add(rig.root);
  rigs.push({ rig, anim, speed });
  return rig;
}

const list = ANIMALS.map((a) => a.id);
if (view === 'grid' || view === 'night') {
  // The game camera: high, behind, looking down about 40 degrees.
  const cols = 8;
  list.forEach((id, i) => {
    const x = (i % cols) * 1.6 - ((cols - 1) * 1.6) / 2;
    const z = Math.floor(i / cols) * 1.8 - 1.8;
    place(buildAnimal({ animal: id as AnimalId, color: ANIMALS[i].colors[0] }), x, z, 'idle', 0, 0);
  });
  const st = place(buildStoryteller(), -4, 3.6);
  void st;
  const g1 = place(buildAnimal({ animal: 'fox', color: '#e2793a' }), 0, 3.6);
  g1.setGhost(true);
  const g2 = place(buildAnimal({ animal: 'penguin', color: '#2e3340' }), 2, 3.6);
  g2.setGhost(true);
  const w = place(buildAnimal({ animal: 'bear', color: '#8a5a36' }), 4, 3.6, 'walk', 1.8);
  w.setItem({ k: 'ale' });
  camera.position.set(0, 11, 13.5);
  camera.lookAt(0, 0, 0.8);
} else if (view === 'game') {
  // About what the game camera sees: a small crowd, about 12m away, looking down at 40 degrees.
  const pick: AnimalId[] = ['wolf', 'bunny', 'shark', 'fox', 'octopus', 'penguin', 'sheep', 'deer', 'hedgehog', 'axolotl'];
  pick.forEach((id, i) => {
    const a = (i / pick.length) * Math.PI * 2;
    const r = place(buildAnimal({ animal: id, color: ANIMALS.find((x) => x.id === id)!.colors[0] }), Math.cos(a) * 3.2, Math.sin(a) * 2.4, i % 3 === 0 ? 'walk' : i % 3 === 1 ? 'idle' : 'wave', i % 3 === 0 ? 1.6 : 0, -a + Math.PI / 2);
    if (i === 4) r.setGhost(true);
  });
  place(buildStoryteller(), 0, 0, 'idle', 0, 0.3);
  camera.position.set(0, 7.7, 9.2);
  camera.lookAt(0, 0.5, 0);
} else if (view === 'close') {
  const start = Number(q.get('from') ?? 0);
  const ids = list.slice(start, start + 6);
  ids.forEach((id, i) => {
    const info = ANIMALS.find((a) => a.id === id)!;
    place(buildAnimal({ animal: id as AnimalId, color: q.get('color') ?? info.colors[Number(q.get('c') ?? 0)] ?? info.colors[0] }), (i - (ids.length - 1) / 2) * 1.25, 0, 'idle', 0, Number(q.get('ry') ?? 0.25));
  });
  camera.position.set(0, 1.9, 7);
  camera.lookAt(0, 0.6, 0);
} else if (view === 'poses') {
  const id = (q.get('animal') ?? 'fox') as AnimalId;
  const anims: Anim[] = ['idle', 'walk', 'run', 'sit', 'sleep', 'wave', 'dance', 'cheer', 'laugh', 'cry', 'hand', 'work', 'fish', 'water', 'drink'];
  const items: Partial<Record<Anim, ItemKind>> = { fish: 'rod', water: 'can', drink: 'cocoa', work: 'washing', walk: 'loaf' };
  anims.forEach((a, i) => {
    const r = place(buildAnimal({ animal: id, color: ANIMALS.find((x) => x.id === id)!.colors[0] }), (i % 5) * 1.6 - 3.2, Math.floor(i / 5) * 1.9 - 1.9, a, a === 'run' ? 4 : a === 'walk' ? 1.6 : 0, 0.5);
    if (a === 'sit') r.root.position.y = 0.3;
    if (a === 'sleep') r.root.position.y = 0.3;
    const it = items[a];
    if (it) r.setItem({ k: it });
  });
  camera.position.set(0, 5.5, 8.5);
  camera.lookAt(0, 0.4, 0);
} else if (view === 'items') {
  const kinds: ItemKind[] = ['ale', 'cider', 'milk', 'cocoa', 'loaf', 'pie', 'bun', 'fish', 'flower', 'rod', 'can', 'washing'];
  kinds.forEach((k, i) => {
    const o = buildItem({ k, c: '#e0605a' });
    o.position.set((i % 6) * 0.7 - 1.75, 0, Math.floor(i / 6) * 0.8 - 0.4);
    o.scale.setScalar(k === 'rod' ? 0.6 : 1.6);
    scene.add(o);
  });
  camera.position.set(0, 2.2, 3.2);
  camera.lookAt(0, 0.1, 0);
} else if (view === 'ghosts') {
  ['fox', 'bunny', 'octopus', 'owl', 'shark'].forEach((id, i) => {
    const r = place(buildAnimal({ animal: id as AnimalId, color: ANIMALS.find((x) => x.id === id)!.colors[0] }), i * 1.4 - 2.8, 0, i === 2 ? 'wave' : 'idle');
    r.setGhost(true);
  });
  place(buildStoryteller(), 4.2, 0, 'wave');
  camera.position.set(0, 2.2, 6);
  camera.lookAt(0, 0.7, 0);
}

if (q.has('thumbs')) {
  const box = document.getElementById('thumbs')!;
  for (const a of ANIMALS) {
    const img = document.createElement('img');
    img.src = animalThumbnail({ animal: a.id, color: a.colors[0] });
    box.appendChild(img);
  }
}

const t0 = performance.now();
let last = t0;
const fixedT = q.get('t');
function frame(now: number) {
  const dt = Math.min((now - last) / 1000, 0.1);
  last = now;
  const t = fixedT ? Number(fixedT) : (now - t0) / 1000;
  for (const r of rigs) {
    r.rig.update({ anim: r.anim, speed: r.speed, dt, t });
    if (r.anim === 'walk' || r.anim === 'run') {
      // Walk on the spot.
    }
  }
  renderer.render(scene, camera);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
(window as unknown as { ready: boolean }).ready = true;
