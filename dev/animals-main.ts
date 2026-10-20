// A test bench for the animals: open /dev/animals.html?view=grid|close|poses|items|ghosts|hats&animal=fox
// Add &hat=crown to put a hat on every animal, &detail=low for the distant versions.
import * as THREE from 'three';
import { animalThumbnail, buildAnimal, buildPet, buildStoryteller, type Pet, type Rig } from '../src/world/animals';
import { buildBack, buildFace, buildNeck, type BackFit, type FaceFit, type NeckFit } from '../src/world/dressup';
import { buildHat } from '../src/world/hats';
import { buildItem } from '../src/world/items';
import { ANIMALS, BACKS, FACES, HATS, NECKS, PETS, type Anim, type AnimalId, type BackId, type FaceId, type HatId, type ItemKind, type Look, type NeckId, type PetId } from '../src/world/types';

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

const hatParam = q.get('hat') as HatId | null;
/** ?wear=face:glasses,neck:scarf,back:cape puts the same dress-up on every animal. */
const wearParam = q.get('wear') ? (Object.fromEntries(q.get('wear')!.split(',').map((kv) => kv.split(':'))) as { face?: FaceId; neck?: NeckId; back?: BackId }) : null;
const pets: { pet: Pet; moving: boolean }[] = [];
const lookOf = (id: AnimalId, extra: Partial<Look> = {}): Look => ({ animal: id, color: ANIMALS.find((x) => x.id === id)!.colors[0], ...extra });
const lowParam = q.get('detail') === 'low';
function place(rig: Rig, x: number, z: number, anim: Anim = 'idle', speed = 0, ry = 0) {
  rig.root.position.set(x, 0, z);
  rig.root.rotation.y = ry;
  if (hatParam) rig.setHat(hatParam);
  if (wearParam) rig.setDressUp(wearParam);
  if (lowParam) rig.setDetail('low');
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
  const zr = Math.ceil(list.length / cols) * 1.8 - 1.8 + 0.6;
  const st = place(buildStoryteller(), -4, zr);
  void st;
  const g1 = place(buildAnimal({ animal: 'fox', color: '#e2793a' }), 0, zr);
  g1.setGhost(true);
  const g2 = place(buildAnimal({ animal: 'penguin', color: '#2e3340' }), 2, zr);
  g2.setGhost(true);
  const w = place(buildAnimal({ animal: 'bear', color: '#8a5a36' }), 4, zr, 'walk', 1.8);
  w.setItem({ k: 'ale' });
  camera.position.set(0, 12, 14.5);
  camera.lookAt(0, 0, 1.4);
} else if (view === 'game') {
  // About what the game camera sees: a small crowd, about 12m away, looking down at 40 degrees.
  const pick: AnimalId[] = ['wolf', 'bunny', 'shark', 'fox', 'octopus', 'penguin', 'bat', 'deer', 'squid', 'axolotl'];
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
  const ids = q.get('animal') ? q.get('animal')!.split(',') : list.slice(start, start + 6);
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
} else if (view === 'hats') {
  // Front row: one hat each. Back rows: the awkward heads all wearing the same hat (?hat=, default crown).
  const each: [AnimalId, HatId][] = [
    ['fox', 'beanie'],
    ['cat', 'flower'],
    ['wolf', 'party'],
    ['owl', 'wizard'],
    ['bear', 'tophat'],
    ['penguin', 'crown'],
    ['axolotl', 'halo'],
    ['raven', 'witch'],
  ];
  each.forEach(([id, hat], i) => {
    const r = place(buildAnimal({ animal: id, color: ANIMALS.find((x) => x.id === id)!.colors[0], hat }), (i - 3.5) * 1.2, 1.6, 'idle', 0, 0.25);
    if (q.has('ghost') && i % 2) r.setGhost(true);
  });
  const same = (hatParam ?? 'crown') as HatId;
  const awkward: AnimalId[] = ['bunny', 'snail', 'deer', 'highland', 'squid', 'jellyfish', 'octopus', 'frog', 'shark', 'hedgehog', 'fennec', 'bat'];
  awkward.forEach((id, i) => {
    place(buildAnimal({ animal: id, color: ANIMALS.find((x) => x.id === id)!.colors[0], hat: same }), ((i % 6) - 2.5) * 1.35, -0.3 - Math.floor(i / 6) * 1.7, 'idle', 0, 0.3);
  });
  camera.position.set(0, 3.6, 8.2);
  camera.lookAt(0, 0.5, -0.2);
} else if (view === 'dressup') {
  // Front row: full outfits with a pet beside each. Back row: very different heads all wearing the same piece
  // (?face=, ?neck=, ?back= pick it; by default each head tries a different face piece).
  const outfits: [AnimalId, Partial<Look>][] = [
    ['fox', { face: 'glasses', neck: 'scarf', back: 'backpack', pet: 'chick' }],
    ['cat', { face: 'hearts', neck: 'bowtie', back: 'butterfly', pet: 'slime' }],
    ['wolf', { face: 'shades', neck: 'bandana', back: 'cape', pet: 'ghost' }],
    ['bear', { face: 'monocle', neck: 'pearls', back: 'satchel', pet: 'mouse', hat: 'tophat' }],
    ['penguin', { face: 'moustache', neck: 'bell', back: 'wings', pet: 'bee' }],
    ['raven', { face: 'mask', neck: 'lei', back: 'balloon', pet: 'snail' }],
  ];
  const moving = q.has('moving');
  outfits.forEach(([id, extra], i) => {
    const x = (i - 2.5) * 1.55;
    const r = place(buildAnimal(lookOf(id, extra)), x, 1.2, moving ? 'walk' : 'idle', moving ? 1.6 : 0, 0.3);
    if (q.has('ghost') && i % 2) r.setGhost(true);
    const pet = buildPet(extra.pet as PetId);
    pet.root.position.set(x + 0.55, 0, 1.35);
    pet.root.rotation.y = 0.3;
    if (q.has('ghost') && i % 2) pet.setGhost(true);
    scene.add(pet.root);
    pets.push({ pet, moving });
  });
  const heads: AnimalId[] = ['fox', 'owl', 'snail', 'squid', 'jellyfish', 'highland', 'bunny', 'bat'];
  const face = q.get('face') as FaceId | null;
  const neck = q.get('neck') as NeckId | null;
  const back = q.get('back') as BackId | null;
  heads.forEach((id, i) => {
    const f = face ?? (neck || back ? null : FACES[i % FACES.length].id);
    place(buildAnimal(lookOf(id, { face: f, neck, back })), (i - 3.5) * 1.15, -0.6, 'idle', 0, Number(q.get('ry') ?? 0.3));
  });
  camera.position.set(0, 3.2, 8.6);
  camera.lookAt(0, 0.8, 0);
} else if (view === 'pets') {
  PETS.forEach((p, i) => {
    const pet = buildPet(p.id);
    pet.root.position.set((i - 2.5) * 0.7, 0, 0);
    pet.root.rotation.y = 0.35;
    scene.add(pet.root);
    pets.push({ pet, moving: q.has('moving') });
  });
  camera.position.set(0, 1.1, 3.4);
  camera.lookAt(0, 0.2, 0);
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
    img.src = animalThumbnail({ animal: a.id, color: a.colors[0], hat: hatParam });
    box.appendChild(img);
  }
}

const t0 = performance.now();
let last = t0;
const fixedT = q.get('t');
let frames = 0;
/** Triangles in a rig, counting every mesh hung off its root. */
function triangles(rig: Rig): number {
  let n = 0;
  rig.root.traverse((o) => {
    const m = o as THREE.Mesh;
    if (m.isMesh && m.visible) n += (m.geometry.getAttribute('position')?.count ?? 0) / 3;
  });
  return Math.round(n);
}
function frame(now: number) {
  const dt = Math.min((now - last) / 1000, 0.1);
  last = now;
  const t = fixedT ? Number(fixedT) : (now - t0) / 1000;
  for (const r of rigs) {
    r.rig.update({ anim: r.anim, speed: r.speed, dt, t });
  }
  for (const p of pets) p.pet.update(dt, t, p.moving);
  renderer.render(scene, camera);
  frames++;
  if (frames === 12) {
    const tris: Record<string, number> = {};
    rigs.forEach((r, i) => (tris[`${i}`] = triangles(r.rig)));
    // Both detail levels for every rig, measured by switching each one over and back.
    const levels: Record<string, { high: number; low: number }> = {};
    rigs.forEach((r, i) => {
      r.rig.setDetail('high');
      const high = triangles(r.rig);
      r.rig.setDetail('low');
      const low = triangles(r.rig);
      r.rig.setDetail(lowParam ? 'low' : 'high');
      levels[`${i}`] = { high, low };
    });
    const hats: Record<string, number> = {};
    for (const h of HATS) {
      const built = buildHat(h.id);
      let n = 0;
      built?.group.traverse((o) => {
        const m = o as THREE.Mesh;
        if (m.isMesh) n += (m.geometry.getAttribute('position')?.count ?? 0) / 3;
      });
      hats[h.id] = Math.round(n);
    }
    // Every dress-up piece on a fox, and every pet.
    const count = (o: THREE.Object3D) => {
      let n = 0;
      o.traverse((c) => {
        const m = c as THREE.Mesh;
        if (m.isMesh) n += ((m.geometry.index?.count ?? m.geometry.getAttribute('position')?.count ?? 0) / 3) * ((m as THREE.InstancedMesh).isInstancedMesh ? (m as THREE.InstancedMesh).count : 1);
      });
      return Math.round(n);
    };
    const fox = buildAnimal(lookOf('fox')) as unknown as { dressFit: { face: FaceFit; neck: NeckFit; back: BackFit } };
    const pieces: Record<string, number> = {};
    for (const f of FACES) pieces[`face:${f.id}`] = count(buildFace(f.id, fox.dressFit.face)!.group);
    for (const f of NECKS) pieces[`neck:${f.id}`] = count(buildNeck(f.id, fox.dressFit.neck)!.group);
    for (const f of BACKS) pieces[`back:${f.id}`] = count(buildBack(f.id, fox.dressFit.back)!.group);
    for (const p of PETS) pieces[`pet:${p.id}`] = count(buildPet(p.id).root);
    (window as unknown as { info: unknown }).info = { calls: renderer.info.render.calls, triangles: renderer.info.render.triangles, rigs: tris, levels, hats, pieces };
    (window as unknown as { done: boolean }).done = true;
  }
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
(window as unknown as { ready: boolean }).ready = true;
