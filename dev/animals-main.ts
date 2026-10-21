// A test bench for the animals: open /dev/animals.html?view=grid|close|poses|items|ghosts|hats&animal=fox
// Add &hat=crown to put a hat on every animal, &detail=low for the distant versions.
import * as THREE from 'three';
import { animalThumbnail, buildAnimal, buildPet, buildStoryteller, type Pet, type Rig } from '../src/world/animals';
import { buildBack, buildFace, buildNeck, type BackFit, type FaceFit, type NeckFit } from '../src/world/dressup';
import { buildHat } from '../src/world/hats';
import { buildItem } from '../src/world/items';
import { audit, resetAudit } from '../src/world/paper';
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
/** ?bg=#b8774a sets a plain studio backdrop (and floor) instead of sky and grass, for comparing with the reference. */
const bg = q.get('bg');
scene.background = new THREE.Color(bg ?? (view === 'night' ? '#1b2040' : '#9fd0f0'));
scene.add(new THREE.HemisphereLight('#fff8ee', bg ? new THREE.Color(bg).multiplyScalar(0.7) : '#6a8a50', view === 'night' ? 0.5 : 1.6));
const sun = new THREE.DirectionalLight('#fff2dc', view === 'night' ? 0.3 : 2.2);
sun.position.set(6, 12, 8);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
Object.assign(sun.shadow.camera, { left: -14, right: 14, top: 14, bottom: -14, far: 60 });
scene.add(sun);
const ground = new THREE.Mesh(new THREE.PlaneGeometry(80, 80), new THREE.MeshLambertMaterial({ color: bg ? new THREE.Color(bg).multiplyScalar(0.92) : '#8cc464' }));
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
/** Each rig's face audit: faces built and faces pointing into their own shape (must be 0). */
const audits = new Map<Rig, { faces: number; inward: number }>();
const traces: Record<string, Record<string, number>> = {};
function make(look: Look): Rig {
  resetAudit();
  if (q.has('trace')) audit.trace = new Map();
  const r = buildAnimal(look);
  audits.set(r, { faces: audit.faces, inward: audit.inward });
  if (audit.trace) traces[look.animal] = Object.fromEntries(audit.trace);
  return r;
}
type Inside = { mesh: THREE.SkinnedMesh; bones: Map<string, THREE.Bone>; shape: { tc: number[]; tr: number[]; hc: number[]; hr: number[] }; item: THREE.Object3D | null; body: THREE.Bone; neck: THREE.Bone };
const insideOf = (r: Rig) => (r as unknown as { inspect(): Inside }).inspect();

/**
 * Faces lying in the same place as another face that faces the same way (they'd flicker), counted over the
 * whole model at rest: nearly parallel, nearly in the same plane, and one's centre inside the other.
 */
function coplanar(r: Rig): number {
  const pos = insideOf(r).mesh.geometry.getAttribute('position') as THREE.BufferAttribute;
  const n = pos.count / 3;
  const P = (i: number) => new THREE.Vector3().fromBufferAttribute(pos, i);
  const tris = [] as { a: THREE.Vector3; b: THREE.Vector3; c: THREE.Vector3; m: THREE.Vector3; nrm: THREE.Vector3; area: number }[];
  for (let f = 0; f < n; f++) {
    const a = P(f * 3), b = P(f * 3 + 1), c = P(f * 3 + 2);
    const cr = new THREE.Vector3().subVectors(b, a).cross(new THREE.Vector3().subVectors(c, a));
    const area = cr.length() / 2;
    tris.push({ a, b, c, m: a.clone().add(b).add(c).multiplyScalar(1 / 3), nrm: cr.normalize(), area });
  }
  const cell = 0.03;
  const grid = new Map<string, number[]>();
  const key = (v: THREE.Vector3) => `${Math.floor(v.x / cell)},${Math.floor(v.y / cell)},${Math.floor(v.z / cell)}`;
  tris.forEach((t, i) => {
    const k = key(t.m);
    (grid.get(k) ?? grid.set(k, []).get(k)!).push(i);
  });
  const inTri = (p: THREE.Vector3, t: (typeof tris)[number]) => {
    const tri = new THREE.Triangle(t.a, t.b, t.c);
    const q = new THREE.Vector3();
    tri.closestPointToPoint(p, q);
    return q.distanceTo(p) < 1e-4 + Math.abs(t.nrm.dot(new THREE.Vector3().subVectors(p, t.a)));
  };
  let count = 0;
  tris.forEach((t, i) => {
    if (t.area < 1e-8) return;
    const [gx, gy, gz] = key(t.m).split(',').map(Number);
    for (let dx = -1; dx <= 1; dx++)
      for (let dy = -1; dy <= 1; dy++)
        for (let dz = -1; dz <= 1; dz++) {
          for (const j of grid.get(`${gx + dx},${gy + dy},${gz + dz}`) ?? []) {
            if (j <= i) continue;
            const u = tris[j];
            if (u.area < 1e-8 || t.nrm.dot(u.nrm) < 0.985) continue;
            if (Math.abs(t.nrm.dot(new THREE.Vector3().subVectors(u.m, t.a))) > 0.0015) continue;
            if (inTri(u.m, t) || inTri(t.m, u)) count++;
          }
        }
  });
  return count;
}

/**
 * How many corners of the held item (and of the paws) end up inside the body or the head, judged against the
 * body's pear and the head's ellipsoid each shrunk a touch, so only real clipping counts.
 */
function clipping(r: Rig): { item: number; paws: number } {
  const I = insideOf(r);
  const s = I.shape;
  const inv = new THREE.Matrix4();
  const v = new THREE.Vector3();
  const inBody = (w: THREE.Vector3) => {
    v.copy(w).applyMatrix4(inv.copy(I.body.matrixWorld).invert());
    const u = (v.y - s.tc[1]) / s.tr[1];
    if (Math.abs(u) > 0.95) return false;
    const pear = 1 - 0.5 * THREE.MathUtils.smoothstep((u + 1) / 2, 0.25, 1);
    const rx = s.tr[0] * pear * 0.92;
    const rz = s.tr[2] * pear * 0.92;
    return ((v.x - s.tc[0]) / rx) ** 2 + ((v.z - s.tc[2]) / rz) ** 2 + u * u < 1;
  };
  const inHead = (w: THREE.Vector3) => {
    v.copy(w).applyMatrix4(inv.copy(I.neck.matrixWorld).invert());
    return ((v.x - s.hc[0]) / (s.hr[0] * 0.9)) ** 2 + ((v.y - s.hc[1]) / (s.hr[1] * 0.9)) ** 2 + ((v.z - s.hc[2]) / (s.hr[2] * 0.9)) ** 2 < 1;
  };
  r.root.updateMatrixWorld(true);
  let item = 0;
  I.item?.traverse((o) => {
    const m = o as THREE.Mesh;
    if (!m.isMesh) return;
    const p = m.geometry.getAttribute('position') as THREE.BufferAttribute;
    for (let i = 0; i < p.count; i += 3) {
      const w = new THREE.Vector3().fromBufferAttribute(p, i).applyMatrix4(m.matrixWorld);
      if (inBody(w) || inHead(w)) item++;
    }
  });
  // The paws: the far ends of the arms, from the skinned mesh.
  let paws = 0;
  const g = I.mesh.geometry;
  const p = g.getAttribute('position') as THREE.BufferAttribute;
  const si = g.getAttribute('skinIndex') as THREE.BufferAttribute;
  const names = [...I.bones.keys()];
  const armL = names.indexOf('armL');
  const armR = names.indexOf('armR');
  const restArm = (b: number) => I.bones.get(names[b])!;
  for (let i = 0; i < p.count; i += 3) {
    const b = si.getX(i);
    if (b !== armL && b !== armR) continue;
    // Only the lower half of the arm: the shoulder end is meant to sit in the body.
    const local = new THREE.Vector3().fromBufferAttribute(p, i);
    const bone = restArm(b);
    const restY = bone.position.y;
    if (local.y > restY - 0.12) continue;
    const w = I.mesh.getVertexPosition(i, new THREE.Vector3()).applyMatrix4(I.mesh.matrixWorld);
    if (inBody(w) || inHead(w)) paws++;
  }
  return { item, paws };
}
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
    place(make({ animal: id as AnimalId, color: ANIMALS[i].colors[0] }), x, z, 'idle', 0, 0);
  });
  const zr = Math.ceil(list.length / cols) * 1.8 - 1.8 + 0.6;
  const st = place(buildStoryteller(), -4, zr);
  void st;
  const g1 = place(make({ animal: 'fox', color: '#e2793a' }), 0, zr);
  g1.setGhost(true);
  const g2 = place(make({ animal: 'penguin', color: '#2e3340' }), 2, zr);
  g2.setGhost(true);
  const w = place(make({ animal: 'bear', color: '#8a5a36' }), 4, zr, 'walk', 1.8);
  w.setItem({ k: 'ale' });
  camera.position.set(0, 12, 14.5);
  camera.lookAt(0, 0, 1.4);
} else if (view === 'game') {
  // About what the game camera sees: a small crowd, about 12m away, looking down at 40 degrees.
  const pick = (q.get('animal')?.split(',') ?? ['wolf', 'bunny', 'shark', 'fox', 'octopus', 'penguin', 'bat', 'deer', 'squid', 'axolotl']) as AnimalId[];
  pick.forEach((id, i) => {
    const a = (i / pick.length) * Math.PI * 2;
    const r = place(make({ animal: id, color: ANIMALS.find((x) => x.id === id)!.colors[0] }), Math.cos(a) * 3.2, Math.sin(a) * 2.4, i % 3 === 0 ? 'walk' : i % 3 === 1 ? 'idle' : 'wave', i % 3 === 0 ? 1.6 : 0, -a + Math.PI / 2);
    if (i === 4 && !q.has('animal')) r.setGhost(true);
  });
  place(buildStoryteller(), 0, 0, 'idle', 0, 0.3);
  camera.position.set(0, 7.7, 9.2);
  camera.lookAt(0, 0.5, 0);
} else if (view === 'one') {
  // One animal, big: ?animal=fox&ry=0&anim=idle&item=ale&dist=2.2 (framed so it's most of the picture's height).
  const id = (q.get('animal') ?? 'raccoon') as AnimalId;
  const info = ANIMALS.find((a) => a.id === id)!;
  const anim = (q.get('anim') ?? 'idle') as Anim;
  const r = place(make({ animal: id, color: q.get('color') ?? info.colors[Number(q.get('c') ?? 0)] ?? info.colors[0] }), 0, 0, anim, anim === 'run' ? 4 : anim === 'walk' ? 1.6 : 0, Number(q.get('ry') ?? 0));
  if (q.get('item')) r.setItem({ k: q.get('item') as ItemKind });
  if (q.has('ghost')) r.setGhost(true);
  camera.fov = 22;
  camera.aspect = W / H;
  camera.updateProjectionMatrix();
  const dist = Number(q.get('dist') ?? 3.6);
  const lift = Number(q.get('lift') ?? 0.25);
  camera.position.set(0, 0.5 + dist * lift, dist);
  camera.lookAt(0, 0.5, 0);
} else if (view === 'clip') {
  // Not a picture: every animal named (default all) holding every item, in each pose, checked for clipping.
  const ids = (q.get('animal') ?? list.join(',')).split(',') as AnimalId[];
  const kinds: ItemKind[] = ['ale', 'cider', 'milk', 'cocoa', 'loaf', 'pie', 'bun', 'fish', 'flower', 'rod', 'can', 'washing', 'water', 'wine', 'firewood'];
  const anims: Anim[] = ['idle', 'walk', 'run', 'sit', 'drink', 'fish', 'water', 'work'];
  const report: Record<string, string[]> = {};
  let worst = 0;
  for (const id of ids) {
    const r = make(lookOf(id));
    scene.add(r.root);
    for (const k of kinds) {
      r.setItem({ k });
      for (const a of anims) {
        // Settle into the pose, sampling through a walk cycle and a sip.
        let maxItem = 0;
        let maxPaws = 0;
        for (let f = 0; f < 60; f++) {
          r.update({ anim: a, speed: a === 'run' ? 4 : a === 'walk' ? 1.6 : 0, dt: 0.05, t: f * 0.05 });
          if (f >= 30 && f % 3 === 0) {
            const c = clipping(r);
            maxItem = Math.max(maxItem, c.item);
            maxPaws = Math.max(maxPaws, c.paws);
          }
        }
        if (maxItem || maxPaws) (report[id] ??= []).push(`${k}/${a}: item ${maxItem} paws ${maxPaws}`);
        worst = Math.max(worst, maxItem);
      }
    }
    scene.remove(r.root);
    r.dispose();
  }
  (window as unknown as { clip: unknown }).clip = { worst, report };
  camera.position.set(0, 2, 4);
  camera.lookAt(0, 0.5, 0);
} else if (view === 'ref') {
  // Big and close, at about the reference picture's angle: ?animal=raccoon,fox&anim=sit&ry=-0.5
  const ids = (q.get('animal') ?? 'raccoon').split(',');
  const anim = (q.get('anim') ?? 'sit') as Anim;
  const gap = Number(q.get('gap') ?? 1.05);
  ids.forEach((id, i) => {
    const info = ANIMALS.find((a) => a.id === id)!;
    const r = place(make({ animal: id as AnimalId, color: q.get('color') ?? info.colors[Number(q.get('c') ?? 0)] ?? info.colors[0] }), (i - (ids.length - 1) / 2) * gap, 0, anim, anim === 'run' ? 4 : anim === 'walk' ? 1.6 : 0, Number(q.get('ry') ?? -0.5));
    const it = q.get('item');
    if (it) r.setItem({ k: it as ItemKind });
  });
  const span = Math.max(1, ids.length * gap * 0.75);
  camera.position.set(0, 0.62 + span * 0.32, 0.25 + span * 1.6);
  camera.lookAt(0, 0.44, 0);
} else if (view === 'close') {
  const start = Number(q.get('from') ?? 0);
  const ids = q.get('animal') ? q.get('animal')!.split(',') : list.slice(start, start + 6);
  ids.forEach((id, i) => {
    const info = ANIMALS.find((a) => a.id === id)!;
    const anim = (q.get('anim') ?? 'idle') as Anim;
    place(make({ animal: id as AnimalId, color: q.get('color') ?? info.colors[Number(q.get('c') ?? 0)] ?? info.colors[0] }), (i - (ids.length - 1) / 2) * 1.25, 0, anim, anim === 'run' ? 4 : anim === 'walk' ? 1.6 : 0, Number(q.get('ry') ?? 0.25));
  });
  camera.position.set(0, 1.9, 7);
  camera.lookAt(0, 0.6, 0);
} else if (view === 'poses') {
  const id = (q.get('animal') ?? 'fox') as AnimalId;
  const anims: Anim[] = ['idle', 'walk', 'run', 'sit', 'sleep', 'wave', 'dance', 'cheer', 'laugh', 'cry', 'hand', 'work', 'fish', 'water', 'drink'];
  const items: Partial<Record<Anim, ItemKind>> = { fish: 'rod', water: 'can', drink: 'cocoa', work: 'washing', walk: 'loaf' };
  anims.forEach((a, i) => {
    const r = place(make({ animal: id, color: ANIMALS.find((x) => x.id === id)!.colors[0] }), (i % 5) * 1.6 - 3.2, Math.floor(i / 5) * 1.9 - 1.9, a, a === 'run' ? 4 : a === 'walk' ? 1.6 : 0, 0.5);
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
    const r = place(make({ animal: id, color: ANIMALS.find((x) => x.id === id)!.colors[0], hat }), (i - 3.5) * 1.2, 1.6, 'idle', 0, 0.25);
    if (q.has('ghost') && i % 2) r.setGhost(true);
  });
  const same = (hatParam ?? 'crown') as HatId;
  const awkward: AnimalId[] = ['bunny', 'snail', 'deer', 'highland', 'squid', 'jellyfish', 'octopus', 'frog', 'shark', 'hedgehog', 'fennec', 'bat'];
  awkward.forEach((id, i) => {
    place(make({ animal: id, color: ANIMALS.find((x) => x.id === id)!.colors[0], hat: same }), ((i % 6) - 2.5) * 1.35, -0.3 - Math.floor(i / 6) * 1.7, 'idle', 0, 0.3);
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
    const r = place(make(lookOf(id, extra)), x, 1.2, moving ? 'walk' : 'idle', moving ? 1.6 : 0, 0.3);
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
    place(make(lookOf(id, { face: f, neck, back })), (i - 3.5) * 1.15, -0.6, 'idle', 0, Number(q.get('ry') ?? 0.3));
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
    const r = place(make({ animal: id as AnimalId, color: ANIMALS.find((x) => x.id === id)!.colors[0] }), i * 1.4 - 2.8, 0, i === 2 ? 'wave' : 'idle');
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
    // ?busy plays the species' mannerisms back to back, for watching them.
    if (q.has('busy')) {
      const x = r.rig as unknown as { clip: unknown; nextClip: number };
      if (!x.clip) x.nextClip = 0;
    }
    r.rig.update({ anim: r.anim, speed: r.speed, dt, t });
  }
  for (const p of pets) p.pet.update(dt, t, p.moving);
  renderer.render(scene, camera);
  frames++;
  if (frames === 12 && q.has('lite')) {
    const tris: Record<string, number> = {};
    const faces: Record<string, unknown> = {};
    rigs.forEach((r, i) => {
      tris[`${i}`] = triangles(r.rig);
      faces[`${i}`] = { ...audits.get(r.rig), coplanar: coplanar(r.rig) };
    });
    (window as unknown as { info: unknown }).info = { calls: renderer.info.render.calls, triangles: renderer.info.render.triangles, rigs: tris, faces, traces };
    (window as unknown as { done: boolean }).done = true;
  } else if (frames === 12) {
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
