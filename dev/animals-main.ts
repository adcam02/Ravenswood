// A test bench for the animals: open /dev/animals.html?view=grid|close|poses|items|ghosts|hats|colors&animal=fox
// Add &hat=crown to put a hat on every animal, &detail=low for the distant versions.
import * as THREE from 'three';
import { animalThumbnail, buildAnimal, buildPet, buildStoryteller, type Pet, type Rig } from '../src/world/animals';
import { buildHat } from '../src/world/hats';
import { buildItem } from '../src/world/items';
import { audit, resetAudit } from '../src/world/paper';
import { ANIMALS, DANCES, EXTRA_COLORS, HATS, PETS, type Anim, type AnimalId, type HatId, type ItemKind, type Look, type PetId } from '../src/world/types';

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
/** Some views look straight on without perspective. */
let orthoCam: THREE.OrthographicCamera | null = null;
const rigs: { rig: Rig; anim: Anim; speed: number; spinning?: boolean }[] = [];
/** A view that draws itself in pieces (the hat sheets) rather than as one picture. */
let sheetDraw: (() => void) | null = null;

const hatParam = q.get('hat') as HatId | null;
const pets: { pet: Pet; moving: boolean }[] = [];
/** Pets drawn as a sheet of close-ups, this many to a row (0: all in one view). */
let petSheet = 0;
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
type Inside = { mesh: THREE.SkinnedMesh; bones: Map<string, THREE.Bone>; shape: { tc: number[]; tr: number[]; hc: number[]; hr: number[]; pear?: number }; item: THREE.Object3D | null; body: THREE.Bone; neck: THREE.Bone };
const insideOf = (r: Rig) => (r as unknown as { inspect(): Inside }).inspect();

/**
 * Faces lying in the same place as another face that faces the same way (they'd flicker), counted over the
 * whole model at rest: nearly parallel, nearly in the same plane, and one's centre inside the other.
 */
const coplanarAt: Record<string, number[][]> = {};
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
            if (inTri(u.m, t) || inTri(t.m, u)) {
              count++;
              // ?where lists where (model space, the first few).
              if (q.has('where') && count <= 12) (coplanarAt[r.root.uuid] ??= []).push([...t.m.toArray(), ...u.m.toArray(), ...t.nrm.toArray(), t.area, u.area].map((x) => +x.toFixed(4)));
            }
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
  const inBody = (w: THREE.Vector3, k = 0.92) => {
    v.copy(w).applyMatrix4(inv.copy(I.body.matrixWorld).invert());
    const u = (v.y - s.tc[1]) / s.tr[1];
    if (Math.abs(u) > 0.95) return false;
    const pear = 1 - (s.pear ?? 0.5) * THREE.MathUtils.smoothstep((u + 1) / 2, 0.25, 1);
    const rx = s.tr[0] * pear * k;
    const rz = s.tr[2] * pear * k * 1.08;
    return ((v.x - s.tc[0]) / rx) ** 2 + ((v.z - s.tc[2]) / rz) ** 2 + u * u < 1;
  };
  const inHead = (w: THREE.Vector3, k = 0.9) => {
    v.copy(w).applyMatrix4(inv.copy(I.neck.matrixWorld).invert());
    return ((v.x - s.hc[0]) / (s.hr[0] * k)) ** 2 + ((v.y - s.hc[1]) / (s.hr[1] * k)) ** 2 + ((v.z - s.hc[2]) / (s.hr[2] * k)) ** 2 < 1;
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
  // How far the paw hangs below the shoulder, from the lowest arm corner at rest.
  let armLen = 0;
  for (let i = 0; i < p.count; i++) if (si.getX(i) === armR) armLen = Math.max(armLen, restArm(armR).position.y - p.getY(i));
  for (let i = 0; i < p.count; i += 3) {
    const b = si.getX(i);
    if (b !== armL && b !== armR) continue;
    // Only the paw itself (the bottom of the arm), and only sunk well in: the arm is meant to meet the body.
    const local = new THREE.Vector3().fromBufferAttribute(p, i);
    const bone = restArm(b);
    const restY = bone.position.y;
    if (local.y > restY - armLen + 0.07) continue;
    const w = I.mesh.getVertexPosition(i, new THREE.Vector3()).applyMatrix4(I.mesh.matrixWorld);
    if (inBody(w, 0.85) || inHead(w, 0.85)) paws++;
  }
  return { item, paws };
}
function place(rig: Rig, x: number, z: number, anim: Anim = 'idle', speed = 0, ry = 0) {
  rig.root.position.set(x, 0, z);
  rig.root.rotation.y = ry;
  if (hatParam) rig.setHat(hatParam);
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
  const pick = (q.get('animal')?.split(',') ?? ['wolf', 'kaiju', 'shark', 'fox', 'octopus', 'penguin', 'bat', 'deer', 'squid', 'axolotl']) as AnimalId[];
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
  const info = ANIMALS.find((a) => a.id === id);
  const anim = (q.get('anim') ?? 'idle') as Anim;
  // (?animal=storyteller for the Storyteller.)
  const built = (id as string) === 'storyteller' ? buildStoryteller() : make({ animal: id, color: q.get('color') ?? info!.colors[Number(q.get('c') ?? 0)] ?? info!.colors[0], ...(hatParam ? { hat: hatParam } : {}) });
  const r = place(built, 0, 0, anim, anim === 'run' ? 4 : anim === 'walk' ? 1.6 : 0, Number(q.get('ry') ?? 0));
  if (q.get('item')) r.setItem({ k: q.get('item') as ItemKind });
  if (q.has('ghost')) r.setGhost(true);
  camera.fov = 22;
  camera.aspect = W / H;
  camera.updateProjectionMatrix();
  const dist = Number(q.get('dist') ?? 3.6);
  const lift = Number(q.get('lift') ?? 0.25);
  const ly = Number(q.get('ly') ?? 0.5);
  camera.position.set(0, ly + dist * lift, dist);
  camera.lookAt(0, ly, 0);
} else if (view === 'fit') {
  // Every animal wearing the same hat (?hat=), in rows, turned
  // ?ry= (default three-quarter), seen square-on from above and in front, for checking how things fit.
  const ry = Number(q.get('ry') ?? 0.7);
  const cols = 9;
  list.forEach((id, i) => {
    place(make({ animal: id as AnimalId, color: ANIMALS[i].colors[0] }), ((i % cols) - (cols - 1) / 2) * 1.05, (Math.floor(i / cols) - 1.5) * 1.5, 'idle', 0, ry);
  });
  const tilt = 0.5;
  const halfW = (cols * 1.05) / 2 + 0.1;
  const aspect = W / H;
  const halfH = Math.max((4 * 1.5 * Math.sin(tilt) + 1.3 * Math.cos(tilt)) / 2 + 0.2, halfW / aspect);
  const ortho = new THREE.OrthographicCamera(-halfH * aspect, halfH * aspect, halfH, -halfH, 0.1, 100);
  ortho.position.set(0, 0.55 + Math.sin(tilt) * 30, Math.cos(tilt) * 30);
  ortho.lookAt(0, 0.55, 0);
  ortho.updateMatrixWorld();
  orthoCam = ortho;
} else if (view === 'colors') {
  // One animal (?animal=) in every colour it can be: its own ones first, then the shared ones, turned ?ry=.
  const id = (q.get('animal') ?? 'fox') as AnimalId;
  const colors = [...ANIMALS.find((a) => a.id === id)!.colors, ...EXTRA_COLORS];
  const cols = 9;
  colors.forEach((color, i) => {
    place(make({ animal: id, color }), ((i % cols) - (cols - 1) / 2) * 1.05, Math.floor(i / cols) * 1.5 - 0.75, 'idle', 0, Number(q.get('ry') ?? 0.5));
  });
  camera.position.set(0, 3.2, 8.6);
  camera.lookAt(0, 0.45, 0);
} else if (view === 'itemgrid') {
  // Every named animal holding every named item: columns are each animal from the front and three-quarter
  // (?ry=0,0.7), rows are the items, seen square-on from above and in front (no perspective, so every row
  // reads the same size). ?animal=raccoon,fox&items=ale,cider&anim=idle
  const ids = (q.get('animal') ?? 'raccoon,fox,bunny,snail').split(',') as AnimalId[];
  const kinds = (q.get('items') ?? 'ale,cider,milk,cocoa,wine').split(',') as ItemKind[];
  const rys = (q.get('ry') ?? '0,0.7').split(',').map(Number);
  const anim = (q.get('anim') ?? 'idle') as Anim;
  const dx = 1.0;
  const dz = Number(q.get('dz') ?? 1.6);
  const cols = ids.length * rys.length;
  kinds.forEach((k, row) => {
    ids.forEach((id, i) => {
      rys.forEach((ry, j) => {
        const col = i * rys.length + j;
        const r = place(make(lookOf(id)), (col - (cols - 1) / 2) * dx, (row - (kinds.length - 1) / 2) * dz, anim, 0, ry);
        r.setItem({ k, c: k === 'flower' ? '#e07a9a' : k === 'washing' ? '#7aa6d6' : undefined });
      });
    });
  });
  const halfW = (cols * dx) / 2 + 0.2;
  // About the game camera's angle, looking down.
  const tilt = Number(q.get('tilt') ?? 0.66);
  const halfH = ((kinds.length * dz) * Math.sin(tilt) + 1.1 * Math.cos(tilt)) / 2 + 0.2;
  const aspect = W / H;
  const ortho = new THREE.OrthographicCamera(-Math.max(halfW, halfH * aspect), Math.max(halfW, halfH * aspect), Math.max(halfH, halfW / aspect), -Math.max(halfH, halfW / aspect), 0.1, 100);
  ortho.position.set(0, 0.5 + Math.sin(tilt) * 30, Math.cos(tilt) * 30);
  ortho.lookAt(0, 0.5, 0);
  ortho.updateMatrixWorld();
  orthoCam = ortho;
} else if (view === 'clip') {
  // Not a picture: every animal named (default all) holding every item, in each pose, checked for clipping.
  const ids = (q.get('animal') ?? list.join(',')).split(',') as AnimalId[];
  const kinds: ItemKind[] = ['ale', 'cider', 'milk', 'cocoa', 'loaf', 'pie', 'bun', 'fish', 'flower', 'rod', 'can', 'washing', 'water', 'wine', 'firewood'];
  const anims: Anim[] = ['idle', 'walk', 'run', 'sit', 'drink', 'fish', 'water', 'work'];
  // The pairings the game actually makes (sips of anything sippable, the rod for fishing, and so on).
  const sippable = new Set(['ale', 'cider', 'milk', 'cocoa', 'loaf', 'pie', 'bun', 'water', 'wine']);
  const goes = (k: ItemKind, a: Anim) => (a === 'drink' ? sippable.has(k) : a === 'fish' ? k === 'rod' : a === 'water' ? k === 'can' : a === 'work' ? k === 'washing' : true);
  const report: Record<string, string[]> = {};
  let worst = 0;
  for (const id of ids) {
    const r = make(lookOf(id));
    scene.add(r.root);
    for (const k of kinds) {
      r.setItem({ k });
      for (const a of anims) {
        if (!goes(k, a)) continue;
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
  const anims: Anim[] = ['idle', 'walk', 'run', 'sit', 'sleep', 'wave', 'dance', 'cheer', 'laugh', 'cry', 'hand', 'work', 'fish', 'water', 'drink', ...DANCES.map((d) => d.anim)];
  const items: Partial<Record<Anim, ItemKind>> = { fish: 'rod', water: 'can', drink: 'cocoa', work: 'washing', walk: 'loaf' };
  anims.forEach((a, i) => {
    const r = place(make({ animal: id, color: ANIMALS.find((x) => x.id === id)!.colors[0] }), (i % 5) * 1.6 - 3.2, Math.floor(i / 5) * 1.9 - 1.9, a, a === 'run' ? 4 : a === 'walk' ? 1.6 : 0, 0.5);
    if (a === 'sit') r.root.position.y = 0.3;
    if (a === 'sleep') r.root.position.y = 0.3;
    const it = items[a];
    if (it) r.setItem({ k: it });
  });
  camera.position.set(0, 6.5, 10);
  camera.lookAt(0, 0.4, 1);
} else if (view === 'dances') {
  // Key frames of a dance as a contact sheet: a row for each animal (?animal=fox,octopus,...), a column for each
  // moment (?times=0.3,0.8,... seconds into it, played through from the start), all framed alike. ?anim=twerk picks
  // the dance; ?angle=front|side|back|game (default a three-quarter view from the front).
  const ids = (q.get('animal') ?? 'fox,octopus,bat,snail,kaiju,penguin').split(',') as AnimalId[];
  const anim = (q.get('anim') ?? 'twerk') as Anim;
  const times = (q.get('times') ?? '0.25,0.5,0.75,1,1.25,1.5').split(',').map(Number);
  const angles: Record<string, [number, number]> = { three: [0.6, 0.25], front: [0, 0.15], side: [Math.PI / 2, 0.12], back: [Math.PI + 0.5, 0.3], game: [0.62, 0.6] };
  const [az, el] = angles[q.get('angle') ?? 'three'];
  const cam = new THREE.PerspectiveCamera(20, 1, 0.05, 80);
  const labels = document.createElement('div');
  labels.style.cssText = 'position:absolute;left:0;top:0;font:13px sans-serif;color:#123;pointer-events:none';
  document.body.appendChild(labels);
  renderer.setScissorTest(true);
  sun.shadow.mapSize.set(1024, 1024);
  Object.assign(sun.shadow.camera, { left: -2.5, right: 2.5, top: 2.5, bottom: -2.5 });
  sun.shadow.camera.updateProjectionMatrix();
  sheetDraw = () => {
    const cols = times.length;
    const cw = W / cols;
    const ch = H / ids.length;
    cam.aspect = cw / ch;
    cam.updateProjectionMatrix();
    renderer.setScissor(0, 0, W, H);
    renderer.setClearColor('#5a6a78');
    renderer.clear();
    ids.forEach((id, row) => {
      const r = id === ('storyteller' as AnimalId) ? buildStoryteller() : make(lookOf(id));
      if (hatParam) r.setHat(hatParam);
      scene.add(r.root);
      // Framed on the animal standing (so how far a dance moves it shows), with room round it for the paws.
      r.update({ anim: 'idle', speed: 0, dt: 0.05, t: 0 });
      r.root.updateMatrixWorld(true);
      const box = new THREE.Box3().setFromObject(insideOf(r).mesh);
      const c = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      const d = (Math.max(size.y, size.x / cam.aspect) * 1.5) / 2 / Math.tan(THREE.MathUtils.degToRad(cam.fov / 2));
      cam.position.set(c.x + Math.sin(az) * Math.cos(el) * d, c.y + Math.sin(el) * d, c.z + Math.cos(az) * Math.cos(el) * d);
      cam.lookAt(c.x, c.y + size.y * 0.05, c.z);
      let t = 0;
      times.forEach((at, col) => {
        // Played through at 30 frames a second, as in the game.
        for (; t < at; t += 1 / 30) r.update({ anim, speed: 0, dt: 1 / 30, t });
        r.root.updateMatrixWorld(true);
        const x = col * cw;
        const y = H - (row + 1) * ch;
        renderer.setViewport(x, y, cw, ch);
        renderer.setScissor(x + 1, y + 1, cw - 2, ch - 2);
        renderer.render(scene, cam);
        const tag = document.createElement('div');
        tag.textContent = col === 0 ? `${id} ${at}s` : `${at}s`;
        tag.style.cssText = `position:absolute;left:${x + 4}px;top:${row * ch + 2}px`;
        labels.appendChild(tag);
      });
      scene.remove(r.root);
    });
    (window as unknown as { info: unknown }).info = { anim, ids, times };
  };
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
} else if (view === 'hatsheet') {
  // Contact sheets for fitting hats, each cell framed on one head: ?hat=tophat puts that hat on every animal,
  // ?animal=fox puts every hat on that animal (a list of either narrows it). ?angle=game (three-quarter from above,
  // as the town camera sees others), side, front, back (as you see yourself) or top; &anim=walk|sit|wave poses
  // them (at &t=, default 1, heads turned straight ahead unless &natural), &ghost turns them ghostly, &cols= sets the
  // columns. window.sheet({ animal, hat, angle, anim, t }) draws another on the same page, without building the
  // animals again.
  type Sheet = { animal?: string | null; hat?: string | null; angle?: string | null; anim?: string | null; t?: string | null; cols?: string | null };
  const angles: Record<string, [number, number]> = { game: [0.62, 0.78], side: [Math.PI / 2, 0.1], front: [0, 0.14], back: [Math.PI + 0.5, 0.62], top: [0.3, 1.25] };
  const built = new Map<AnimalId, Rig>();
  const rigFor = (id: AnimalId) => {
    let r = built.get(id);
    if (!r) {
      r = make(lookOf(id));
      r.root.visible = false;
      if (q.has('ghost')) r.setGhost(true);
      if (lowParam) r.setDetail('low');
      scene.add(r.root);
      built.set(id, r);
    }
    return r;
  };
  const labels = document.createElement('div');
  labels.style.cssText = 'position:absolute;left:0;top:0;font:12px sans-serif;color:#123;pointer-events:none';
  document.body.appendChild(labels);
  // Narrow, from well back, so it looks down at the same angle all over (as the town camera does from afar).
  const cam = new THREE.PerspectiveCamera(8, 1, 0.05, 80);
  const box = new THREE.Box3();
  const v = new THREE.Vector3();
  renderer.setScissorTest(true);
  // Everyone stands at the middle, so the sun's shadows need only cover a little.
  sun.shadow.mapSize.set(1024, 1024);
  Object.assign(sun.shadow.camera, { left: -2.5, right: 2.5, top: 2.5, bottom: -2.5 });
  sun.shadow.camera.updateProjectionMatrix();
  const draw = (o: Sheet) => {
    const ids = (o.animal?.split(',') ?? list) as AnimalId[];
    const hats = (o.hat?.split(',') ?? HATS.map((h) => h.id)) as HatId[];
    const anim = (o.anim ?? 'idle') as Anim;
    const speed = anim === 'walk' ? 1.6 : anim === 'run' ? 4 : 0;
    const t = Number(o.t ?? 1);
    const [az, el] = angles[o.angle ?? 'game'];
    const pairs = ids.flatMap((id) => hats.map((hat) => [id, hat] as const));
    const cols = Number(o.cols ?? Math.ceil(Math.sqrt(pairs.length * (W / H))));
    const rows = Math.ceil(pairs.length / cols);
    const cw = W / cols;
    const ch = H / rows;
    cam.aspect = cw / ch;
    cam.updateProjectionMatrix();
    labels.replaceChildren();
    renderer.setScissor(0, 0, W, H);
    renderer.setClearColor('#5a6a78');
    renderer.clear();
    pairs.forEach(([id, hat], i) => {
      const r = rigFor(id);
      r.setHat(hat);
      // Settled into the pose (the same moment for every cell).
      for (let f = 0; f < 8; f++) r.update({ anim, speed, dt: 0.05, t });
      // Looking straight ahead, so every cell is seen from the same side (&natural leaves the head as the pose has it).
      if (!q.has('natural')) insideOf(r).neck.rotation.y = insideOf(r).neck.rotation.z = 0;
      r.root.visible = true;
      r.root.updateMatrixWorld(true);
      // Framed on the head (its ellipsoid, in neck space) and the hat together.
      const I = insideOf(r);
      box.makeEmpty();
      for (const sx of [-1, 1]) for (const sy of [-1, 1]) for (const sz of [-1, 1]) box.expandByPoint(v.set(I.shape.hc[0] + sx * I.shape.hr[0], I.shape.hc[1] + sy * I.shape.hr[1], I.shape.hc[2] + sz * I.shape.hr[2]).applyMatrix4(I.neck.matrixWorld));
      const holder = (r as unknown as { hat: { holder: THREE.Object3D } | null }).hat?.holder;
      if (holder) box.union(new THREE.Box3().setFromObject(holder));
      const c = box.getCenter(new THREE.Vector3());
      const d = ((box.getSize(v).length() / 2) * 1.08) / Math.sin(THREE.MathUtils.degToRad(cam.fov / 2));
      const ry = r.root.rotation.y + az;
      cam.position.set(c.x + Math.sin(ry) * Math.cos(el) * d, c.y + Math.sin(el) * d, c.z + Math.cos(ry) * Math.cos(el) * d);
      cam.lookAt(c);
      const x = (i % cols) * cw;
      const y = H - (Math.floor(i / cols) + 1) * ch;
      renderer.setViewport(x, y, cw, ch);
      renderer.setScissor(x + 1, y + 1, cw - 2, ch - 2);
      renderer.render(scene, cam);
      r.root.visible = false;
      const tag = document.createElement('div');
      tag.textContent = ids.length > 1 && hats.length > 1 ? `${id} ${hat}` : ids.length > 1 ? id : hat;
      tag.style.cssText = `position:absolute;left:${x + 4}px;top:${Math.floor(i / cols) * ch + 2}px`;
      labels.appendChild(tag);
    });
  };
  const first: Sheet = Object.fromEntries(['animal', 'hat', 'angle', 'anim', 't', 'cols'].map((k) => [k, q.get(k)]));
  sheetDraw = () => draw(first);
  (window as unknown as { sheet: (o: Sheet) => void }).sheet = draw;
} else if (view === 'hats' && q.get('set') === 'jobs') {
  // The job hats, one each on ten different heads; then the awkward heads all in one of them (?hat=).
  const jobs: [AnimalId, HatId][] = [
    ['fox', 'lumberjack'],
    ['hedgehog', 'souwester'],
    ['bear', 'mitre'],
    ['wolf', 'chef'],
    ['penguin', 'bowler'],
    ['panda', 'sunhat'],
    ['otter', 'headscarf'],
    ['deer', 'feathercap'],
    ['frog', 'sailor'],
    ['raccoon', 'leprechaun'],
  ];
  jobs.forEach(([id, hat], i) => place(make({ animal: id, color: ANIMALS.find((x) => x.id === id)!.colors[0], hat }), ((i % 5) - 2) * 1.5, 1.7 - Math.floor(i / 5) * 1.9, 'idle', 0, 0.25));
  const same = (hatParam ?? 'mitre') as HatId;
  (['snail', 'highland', 'octopus', 'shark', 'bat', 'jellyfish'] as AnimalId[]).forEach((id, i) => place(make({ animal: id, color: ANIMALS.find((x) => x.id === id)!.colors[0], hat: same }), (i - 2.5) * 1.4, -2.3, 'idle', 0, 0.3));
  camera.position.set(0, 3.4, 8.6);
  camera.lookAt(0, 0.6, -0.4);
} else if (view === 'hats' && q.get('set') === 'new') {
  // The newer hats, one each on ten different heads.
  const fresh: [AnimalId, HatId][] = [
    ['fox', 'propeller'],
    ['frog', 'reaper'],
    ['wolf', 'horns'],
    ['bear', 'laurel'],
    ['raccoon', 'tricorn'],
    ['frog', 'toadstool'],
    ['penguin', 'headband'],
    ['capybara', 'candle'],
    ['deer', 'postie'],
    ['quokka', 'jester'],
  ];
  fresh.forEach(([id, hat], i) => place(make({ animal: id, color: ANIMALS.find((x) => x.id === id)!.colors[0], hat }), ((i % 5) - 2) * 1.5 + (i < 5 ? -0.375 : 0.375), 1.2 - Math.floor(i / 5) * 1.9, 'idle', 0, Number(q.get('ry') ?? 0.25)));
  camera.position.set(0, 3.0, 8.6);
  camera.lookAt(0, 0.5, 0.1);
} else if (view === 'hats' && q.get('set') === 'pop') {
  // The pop-culture hats, one each on ten different heads.
  const pop: [AnimalId, HatId][] = [
    ['fox', 'fez'],
    ['bear', 'deerstalker'],
    ['frog', 'tinfoil'],
    ['penguin', 'trainer'],
    ['capybara', 'pumpkin'],
    ['deer', 'cowboy'],
    ['wolf', 'robot'],
    ['hedgehog', 'cone'],
    ['octopus', 'mortarboard'],
    ['raccoon', 'madhatter'],
  ];
  // The back row stands further back and wider apart, so each head shows between two in front.
  pop.forEach(([id, hat], i) => place(make({ animal: id, color: ANIMALS.find((x) => x.id === id)!.colors[0], hat }), i < 5 ? (i - 2) * 1.5 - 0.75 : (i - 7) * 2, i < 5 ? 1.3 : -1.3, 'idle', 0, Number(q.get('ry') ?? 0.25)));
  camera.position.set(0, 3.6, 8.8);
  camera.lookAt(0, 0.4, -0.1);
} else if (view === 'hats' && q.get('set') === 'close') {
  // One hat (?hat=) up close on one head (?animal=, default fox): from the front, three quarters, the side and behind.
  const id = (q.get('animal') ?? 'fox') as AnimalId;
  // &bare hides the even ones' bodies, to see what the hat does inside the head.
  ([0, 0.8, Math.PI / 2, Math.PI] as number[]).forEach((ry, i) => {
    const r = place(make(lookOf(id)), (i - 1.5) * 1.3, 0, 'idle', 0, ry);
    if (q.has('bare') && i % 2 === 0) insideOf(r).mesh.visible = false;
  });
  camera.position.set(0, 1.9, 4.4);
  camera.lookAt(0, 0.7, 0);
} else if (view === 'hats') {
  // Front row: one hat each. Back rows: the awkward heads all wearing the same hat (?hat=, default crown).
  const each: [AnimalId, HatId][] = [
    ['fox', 'beanie'],
    ['redpanda', 'flower'],
    ['wolf', 'party'],
    ['sloth', 'wizard'],
    ['bear', 'tophat'],
    ['penguin', 'crown'],
    ['axolotl', 'halo'],
    ['ibis', 'witch'],
  ];
  each.forEach(([id, hat], i) => {
    const r = place(make({ animal: id, color: ANIMALS.find((x) => x.id === id)!.colors[0], hat }), (i - 3.5) * 1.2, 1.6, 'idle', 0, 0.25);
    if (q.has('ghost') && i % 2) r.setGhost(true);
  });
  const same = (hatParam ?? 'crown') as HatId;
  const awkward: AnimalId[] = ['kaiju', 'snail', 'deer', 'highland', 'squid', 'jellyfish', 'octopus', 'frog', 'shark', 'hedgehog', 'crab', 'bat'];
  awkward.forEach((id, i) => {
    place(make({ animal: id, color: ANIMALS.find((x) => x.id === id)!.colors[0], hat: same }), ((i % 6) - 2.5) * 1.35, -0.3 - Math.floor(i / 6) * 1.7, 'idle', 0, 0.3);
  });
  camera.position.set(0, 3.6, 8.2);
  camera.lookAt(0, 0.5, -0.2);
} else if (view === 'pets') {
  // ?pets=chick,bee picks some (all by default); ?cols=5 draws them as a sheet of close-ups, one tile each,
  // turned by ?ry= (0 faces us, 1.57 shows the left side); ?ghost shows them as ghosts.
  const ids = (q.get('pets')?.split(',') ?? PETS.map((p) => p.id)) as PetId[];
  petSheet = Number(q.get('cols') ?? 0);
  ids.forEach((id, i) => {
    const pet = buildPet(id);
    pet.root.position.set((i - (ids.length - 1) / 2) * (petSheet ? 1.5 : 0.7), 0, 0);
    pet.root.rotation.y = Number(q.get('ry') ?? 0.35);
    if (q.has('ghost')) pet.setGhost(true);
    scene.add(pet.root);
    pets.push({ pet, moving: q.has('moving') });
  });
  camera.position.set(0, 1.1, 3.4);
  camera.lookAt(0, 0.2, 0);
} else if (view === 'ghosts') {
  ['fox', 'kaiju', 'octopus', 'penguin', 'shark'].forEach((id, i) => {
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
/**
 * ?fixdt=0.05 steps the animation by a fixed time each frame (so a sequence of shots is evenly spaced however
 * slowly this machine draws), and window.hold = n stops it at frame n until it's moved on.
 */
const fixdt = Number(q.get('fixdt') ?? 0);
let simT = 0;
const W8 = window as unknown as { hold?: number; frame: number };
function frame(now: number) {
  if (W8.hold !== undefined && frames >= W8.hold) {
    last = now;
    requestAnimationFrame(frame);
    return;
  }
  const dt = fixdt || Math.min((now - last) / 1000, 0.1);
  last = now;
  const t = fixedT ? Number(fixedT) : fixdt ? (simT += fixdt) : (now - t0) / 1000;
  for (const r of rigs) {
    // ?busy plays the species' mannerisms back to back, for watching them.
    if (q.has('busy')) {
      const x = r.rig as unknown as { clip: unknown; nextClip: number };
      if (!x.clip) x.nextClip = 0;
    }
    r.rig.update({ anim: r.anim, speed: r.speed, dt, t });
  }
  // ?speed=6 sends the pets off along the way they face at that pace (the sheet's cameras follow), for pets
  // that behave differently at a run.
  const petSpeed = Number(q.get('speed') ?? 0);
  for (const p of pets) {
    if (petSpeed) p.pet.root.position.add(new THREE.Vector3(Math.sin(p.pet.root.rotation.y), 0, Math.cos(p.pet.root.rotation.y)).multiplyScalar(petSpeed * dt));
    p.pet.update(dt, t, p.moving || petSpeed > 0);
  }
  // (A sheet is drawn just once: drawing every cell is slow.)
  if (sheetDraw) {
    if (frames === 10) sheetDraw();
  } else if (petSheet) {
    // One tile per pet, the camera stepping along the row.
    const rows = Math.ceil(pets.length / petSheet);
    const tw = W / petSheet;
    const th = H / rows;
    camera.aspect = tw / th;
    camera.updateProjectionMatrix();
    renderer.setScissorTest(true);
    pets.forEach((p, i) => {
      const x = (i % petSheet) * tw;
      const y = H - (Math.floor(i / petSheet) + 1) * th;
      renderer.setViewport(x, y, tw, th);
      renderer.setScissor(x, y, tw, th);
      const at = p.pet.root.position;
      camera.position.set(at.x, 0.36, at.z + 0.8);
      camera.lookAt(at.x, 0.17, at.z);
      renderer.render(scene, camera);
    });
    renderer.setScissorTest(false);
  } else renderer.render(scene, orthoCam ?? camera);
  frames++;
  W8.frame = frames;
  if (frames === 12 && sheetDraw) {
    (window as unknown as { done: boolean }).done = true;
  } else if (frames === 12 && q.has('lite')) {
    const tris: Record<string, number> = {};
    const faces: Record<string, unknown> = {};
    rigs.forEach((r, i) => {
      tris[`${i}`] = triangles(r.rig);
      faces[`${i}`] = { ...audits.get(r.rig), coplanar: coplanar(r.rig), where: coplanarAt[r.rig.root.uuid] };
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
    // Every pet.
    const count = (o: THREE.Object3D) => {
      let n = 0;
      o.traverse((c) => {
        const m = c as THREE.Mesh;
        if (m.isMesh) n += ((m.geometry.index?.count ?? m.geometry.getAttribute('position')?.count ?? 0) / 3) * ((m as THREE.InstancedMesh).isInstancedMesh ? (m as THREE.InstancedMesh).count : 1);
      });
      return Math.round(n);
    };
    const pieces: Record<string, number> = {};
    for (const p of PETS) pieces[`pet:${p.id}`] = count(buildPet(p.id).root);
    (window as unknown as { info: unknown }).info = { calls: renderer.info.render.calls, triangles: renderer.info.render.triangles, rigs: tris, levels, hats, pieces };
    (window as unknown as { done: boolean }).done = true;
  }
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
(window as unknown as { ready: boolean }).ready = true;
