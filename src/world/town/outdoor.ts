import * as THREE from 'three';
import { Builder, matte, rng } from '../build';
import type { Collider } from '../types';
import { G, Paint, frame, local, pick, shade, type Layers } from './kit';
import {
  BAKERY,
  BED_DEPTH,
  BED_H,
  BED_LEN,
  CHURCH,
  DOCK,
  GATE_Z,
  HOUSE_D,
  HOUSE_W,
  LINE_POS,
  LINE_Y,
  NOTICEBOARD,
  POND,
  RING_ROAD_R,
  SQUARE_R,
  STEEPLE,
  STOOL_R,
  TAVERN,
  TOWN_R,
  TUBS,
  WASHHOUSE,
  WELL,
  beds,
  benches,
  houseSlots,
  pathLamps,
  roadLamps,
  squareLamps,
} from './layout';
import {
  IRON,
  STONE,
  STONE_DARK,
  WOOD,
  WOOD_DARK,
  WOOD_LIGHT,
  barrel,
  bench,
  bush,
  crate,
  flowerPatch,
  lampPost,
  mushroom,
  pineTree,
  railFence,
  rock,
  roundTree,
  tuft,
} from './props';
import { TextSign, signBoard } from './sign';

export interface Outdoor {
  group: THREE.Group;
  colliders: Collider[];
  water: { mesh: THREE.Mesh; base: Float32Array; material: THREE.MeshPhongMaterial };
  clockHands: { hour: THREE.Object3D; minute: THREE.Object3D }[];
  bell: THREE.Object3D;
  flag: THREE.Object3D;
  chimneys: THREE.Vector3[];
  houseSigns: TextSign[];
  signMaterials: THREE.MeshLambertMaterial[];
  wreaths: THREE.Object3D[];
  pools: THREE.Mesh;
  /** Night-time lamp positions for the few real point lights around the square. */
  lampLights: THREE.Vector3[];
}

const GLASS = '#a9c3d3';
const WALLS = ['#f4ead6', '#f6dcd2', '#dbe6ef', '#f5e6b8', '#dbe8cf', '#e8dcef', '#f2e2c4'];
const ROOFS = ['#c4643f', '#4f6f9a', '#7b4f7a', '#5f8a4f', '#a3453f', '#3f7f7f', '#8a5a3a'];
const TRIMS = ['#6e4a30', '#5a4636', '#7a5a40'];
const DOORS = ['#5f8fbf', '#bf5f5f', '#5f9f6f', '#a87f4f', '#8f6fbf', '#d98f4f'];

const smooth = (a: number, b: number, x: number) => {
  const t = THREE.MathUtils.clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};

function hash(i: number, j: number): number {
  const s = Math.sin(i * 127.1 + j * 311.7) * 43758.5453;
  return s - Math.floor(s);
}

/** Builds a non-indexed mesh from triangles with one colour per triangle. */
class Tris {
  pos: number[] = [];
  col: number[] = [];
  private c = new THREE.Color();
  tri(a: THREE.Vector3Like, b: THREE.Vector3Like, d: THREE.Vector3Like, color: THREE.ColorRepresentation) {
    // Keep every triangle facing up.
    const ux = b.x - a.x;
    const uz = b.z - a.z;
    const vx = d.x - a.x;
    const vz = d.z - a.z;
    const ny = uz * vx - ux * vz;
    const list = ny >= 0 ? [a, b, d] : [a, d, b];
    this.c.set(color);
    for (const p of list) {
      this.pos.push(p.x, p.y, p.z);
      this.col.push(this.c.r, this.c.g, this.c.b);
    }
  }
  quad(a: THREE.Vector3Like, b: THREE.Vector3Like, c: THREE.Vector3Like, d: THREE.Vector3Like, color: THREE.ColorRepresentation) {
    this.tri(a, b, c, color);
    this.tri(a, c, d, color);
  }
  geometry(): THREE.BufferGeometry {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(this.pos, 3));
    g.setAttribute('color', new THREE.Float32BufferAttribute(this.col, 3));
    g.computeVertexNormals();
    g.computeBoundingSphere();
    return g;
  }
}

const V = (x: number, y: number, z: number) => ({ x, y, z });

// ---------------------------------------------------------------- ground, cobbles and paths

function groundMesh(): THREE.Mesh {
  const rings: number[] = [];
  for (let x = 0; x <= 60; x += 3) rings.push(x);
  for (let x = 66; x <= 200; x += 7) rings.push(x);
  const seg = 80;
  const pt = (i: number, j: number) => {
    const rad = rings[i];
    const jj = ((j % seg) + seg) % seg;
    const a = (jj / seg) * Math.PI * 2 + (i % 2 ? Math.PI / seg : 0);
    const wob = i === 0 ? 0 : (hash(i, jj) - 0.5) * (rad < 58 ? 1.2 : 3.5);
    const rr = rad + wob;
    const hill = rad < 59 ? 0 : smooth(59, 110, rad) * (5 + 3 * Math.sin(a * 3 + 1.3) + 2 * Math.sin(a * 7 + 0.4)) + smooth(62, 80, rad) * hash(jj, i) * 1.4;
    return V(rr * Math.sin(a), hill, -rr * Math.cos(a));
  };
  const t = new Tris();
  const grass = ['#8bc366', '#86bf62', '#92c86c', '#80b95e', '#8fc568'];
  const far = ['#6fa957', '#78b05c', '#679f52', '#82b660'];
  for (let i = 0; i < rings.length - 1; i++) {
    for (let j = 0; j < seg; j++) {
      const a = pt(i, j);
      const b = pt(i, j + 1);
      const c = pt(i + 1, j + 1);
      const d = pt(i + 1, j);
      const list = rings[i] < 58 ? grass : far;
      const col = shade(list[Math.floor(hash(j, i * 3) * list.length)], (hash(i * 7, j) - 0.5) * 0.04);
      if (i === 0) t.tri(a, c, d, col);
      else {
        t.tri(a, b, c, col);
        t.tri(a, c, d, shade(col, (hash(i, j * 5) - 0.5) * 0.03));
      }
    }
  }
  const mesh = new THREE.Mesh(t.geometry(), matte());
  mesh.receiveShadow = true;
  mesh.name = 'ground';
  return mesh;
}

function cobbleMesh(): THREE.Mesh {
  const t = new Tris();
  const r = rng(9);
  // Mortar underneath.
  const mortar = '#9c907f';
  const n0 = 48;
  for (let j = 0; j < n0; j++) {
    const a0 = (j / n0) * Math.PI * 2;
    const a1 = ((j + 1) / n0) * Math.PI * 2;
    t.tri(V(0, 0.035, 0), V(SQUARE_R * Math.sin(a0), 0.035, -SQUARE_R * Math.cos(a0)), V(SQUARE_R * Math.sin(a1), 0.035, -SQUARE_R * Math.cos(a1)), mortar);
  }
  const stones = ['#d3c6b2', '#c8baa5', '#dccfbb', '#bfb19c', '#cdbfa9'];
  let rad = 2.9;
  while (rad < SQUARE_R - 0.2) {
    const w = 0.72;
    const r1 = Math.min(SQUARE_R - 0.05, rad + w);
    const n = Math.max(8, Math.round((Math.PI * 2 * (rad + w / 2)) / 0.85));
    const off = r() * Math.PI;
    const ring = Math.abs(rad + w / 2 - STOOL_R) < w / 2;
    for (let j = 0; j < n; j++) {
      const g = 0.05;
      const a0 = off + (j / n) * Math.PI * 2 + g / rad;
      const a1 = off + ((j + 1) / n) * Math.PI * 2 - g / rad;
      const ra = rad + g;
      const rb = r1 - g;
      const y = 0.05 + r() * 0.015;
      const col = ring ? shade('#b98e74', (r() - 0.5) * 0.06) : shade(pick(r, stones), (r() - 0.5) * 0.04);
      t.quad(
        V(ra * Math.sin(a0), y, -ra * Math.cos(a0)),
        V(ra * Math.sin(a1), y, -ra * Math.cos(a1)),
        V(rb * Math.sin(a1), y, -rb * Math.cos(a1)),
        V(rb * Math.sin(a0), y, -rb * Math.cos(a0)),
        col,
      );
    }
    rad = r1;
  }
  // A worn kerb around the edge.
  const nk = 90;
  for (let j = 0; j < nk; j++) {
    const a0 = (j / nk) * Math.PI * 2;
    const a1 = ((j + 1) / nk) * Math.PI * 2;
    const ra = SQUARE_R - 0.05;
    const rb = SQUARE_R + 0.45;
    const col = shade('#a99c89', (r() - 0.5) * 0.05);
    t.quad(V(ra * Math.sin(a0), 0.07, -ra * Math.cos(a0)), V(ra * Math.sin(a1), 0.07, -ra * Math.cos(a1)), V(rb * Math.sin(a1), 0.07, -rb * Math.cos(a1)), V(rb * Math.sin(a0), 0.07, -rb * Math.cos(a0)), col);
  }
  const mesh = new THREE.Mesh(t.geometry(), matte());
  mesh.receiveShadow = true;
  mesh.name = 'cobbles';
  return mesh;
}

type Seg = [number, number, number, number];

/** Dirt paths: the spokes from the square, the ring road past every cottage, and the road out of town. */
export const PATHS: { seg: Seg; w: number }[] = (() => {
  const list: { seg: Seg; w: number }[] = [];
  const add = (x0: number, z0: number, x1: number, z1: number, w = 2.4) => list.push({ seg: [x0, z0, x1, z1], w });
  add(0, -13, 0, -24.4, 2.6);
  add(0, 13, 0, 90, 2.6);
  add(-13, 0, -25.2, 0, 2.6);
  add(13, 0, 25.6, 0, 2.6);
  add(1, 17, 20, 17, 2.2);
  add(-1, 17, -19, 17, 2.2);
  add(-19, 17, -19, 18.6, 2.2);
  for (const deg of [60, 120, 240, 300]) {
    const a = (deg * Math.PI) / 180;
    add(13.5 * Math.sin(a), -13.5 * Math.cos(a), RING_ROAD_R * Math.sin(a), -RING_ROAD_R * Math.cos(a), 2.0);
  }
  const n = 72;
  for (let i = 0; i < n; i++) {
    const a0 = (i / n) * Math.PI * 2;
    const a1 = ((i + 1) / n) * Math.PI * 2;
    add(RING_ROAD_R * Math.sin(a0), -RING_ROAD_R * Math.cos(a0), RING_ROAD_R * Math.sin(a1), -RING_ROAD_R * Math.cos(a1), 2.4);
  }
  for (const h of houseSlots) {
    const a = local(h.x, h.z, h.ry, 0, HOUSE_D / 2 + 0.2);
    const b = local(h.x, h.z, h.ry, 0, HOUSE_D / 2 + 3.4);
    add(a.x, a.z, b.x, b.z, 1.5);
  }
  return list;
})();

export function nearPath(x: number, z: number, margin: number): boolean {
  for (const { seg, w } of PATHS) {
    const [x0, z0, x1, z1] = seg;
    const dx = x1 - x0;
    const dz = z1 - z0;
    const l2 = dx * dx + dz * dz || 1;
    const t = THREE.MathUtils.clamp(((x - x0) * dx + (z - z0) * dz) / l2, 0, 1);
    if (Math.hypot(x - (x0 + dx * t), z - (z0 + dz * t)) < w / 2 + margin) return true;
  }
  return false;
}

function pathMesh(): THREE.Mesh {
  const t = new Tris();
  const r = rng(21);
  const dirt = ['#d9bd8f', '#d2b484', '#dcc296', '#cfb07f'];
  for (const { seg, w } of PATHS) {
    const [x0, z0, x1, z1] = seg;
    const len = Math.hypot(x1 - x0, z1 - z0);
    const steps = Math.max(1, Math.round(len / 2.2));
    const nx = -(z1 - z0) / len;
    const nz = (x1 - x0) / len;
    let prevL = 0;
    let prevR = 0;
    for (let s = 0; s < steps; s++) {
      const ta = s / steps;
      const tb = (s + 1) / steps;
      const ax = x0 + (x1 - x0) * ta;
      const az = z0 + (z1 - z0) * ta;
      const bx = x0 + (x1 - x0) * tb;
      const bz = z0 + (z1 - z0) * tb;
      const wl = s === 0 ? w / 2 : prevL;
      const wr = s === 0 ? w / 2 : prevR;
      const nl = w / 2 + (r() - 0.5) * 0.35;
      const nr = w / 2 + (r() - 0.5) * 0.35;
      prevL = nl;
      prevR = nr;
      const y = 0.025 + r() * 0.004;
      t.quad(V(ax + nx * wl, y, az + nz * wl), V(bx + nx * nl, y, bz + nz * nl), V(bx - nx * nr, y, bz - nz * nr), V(ax - nx * wr, y, az - nz * wr), shade(pick(r, dirt), (r() - 0.5) * 0.03));
    }
  }
  const mesh = new THREE.Mesh(t.geometry(), matte());
  mesh.receiveShadow = true;
  mesh.name = 'paths';
  return mesh;
}

// ---------------------------------------------------------------- windows and doors

/** A window on a wall whose face is the local z = 0 plane, looking out along +z. */
function wallWindow(p: Paint, w: number, h: number, trim: THREE.ColorRepresentation, glass: THREE.ColorRepresentation = GLASS, sill = true) {
  p.box(trim, w + 0.16, h + 0.16, 0.08, 0, 0, 0.02);
  p.glass.box(glass, w, h, 0.1, 0, 0, 0.05);
  p.box(trim, 0.06, h, 0.05, 0, 0, 0.11);
  p.box(trim, w, 0.06, 0.05, 0, 0, 0.11);
  if (sill) p.box(shade(trim, 0.08), w + 0.3, 0.08, 0.2, 0, -h / 2 - 0.1, 0.1);
}

function windowBox(p: Paint, r: () => number, w: number) {
  p.box(WOOD, w, 0.18, 0.22, 0, 0, 0.14);
  const c = pick(r, ['#f2a7b8', '#e4553f', '#f6d55c', '#b494dd', '#ffffff']);
  for (let i = 0; i < 4; i++) {
    p.ico('#5f9e47', 0.1, -w / 2 + 0.15 + (i * (w - 0.3)) / 3, 0.14, 0.16, 0);
    p.ico(c, 0.065, -w / 2 + 0.2 + (i * (w - 0.3)) / 3, 0.22, 0.2, 0);
  }
}

function archedDoor(p: Paint, w: number, h: number, color: THREE.ColorRepresentation, trim: THREE.ColorRepresentation) {
  p.box(trim, w + 0.24, h + 0.1, 0.08, 0, h / 2, 0.02);
  p.cyl(trim, w / 2 + 0.12, 0.08, 0, h, 0.02, 10, Math.PI / 2);
  p.box(color, w, h, 0.1, 0, h / 2, 0.06);
  p.cyl(color, w / 2, 0.1, 0, h, 0.06, 10, Math.PI / 2);
  p.box(shade(color, -0.12), 0.05, h, 0.05, 0, h / 2, 0.12);
  p.sphere('#e8c35a', 0.06, 0.06, 0.06, w * 0.32, h * 0.5, 0.14);
}

function lantern(p: Paint) {
  p.box(IRON, 0.05, 0.05, 0.3, 0, 0, 0.12);
  p.glass.box('#fff1c8', 0.2, 0.28, 0.2, 0, -0.18, 0.28);
  p.cone(IRON, 0.19, 0.14, 0, -0.04, 0.28, 4, Math.PI / 4);
}

// ---------------------------------------------------------------- buildings

function clockTower(p: Paint): { faces: THREE.Matrix4[] } {
  const stone = '#cdbda6';
  const quoin = '#b3a28a';
  p.cyl('#a99c89', 2.65, 0.45, 0, 0.225, 0, 8);
  p.cyl('#bcae99', 2.3, 0.3, 0, 0.6, 0, 8);
  p.block(stone, 3.4, 8.0, 3.4, 0, 0.6, 0);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) for (let k = 0; k < 8; k++) p.block(k % 2 ? quoin : shade(quoin, 0.05), 0.42, 0.5, 0.42, sx * 1.62, 0.8 + k, sz * 1.62);
  // A door on each side, and slit windows.
  for (let k = 0; k < 4; k++) {
    const f = p.at(0, 0, 0, (k * Math.PI) / 2);
    archedDoor(f.at(0, 0.6, 1.7), 0.9, 1.6, '#5a3a28', '#8f8070');
    wallWindow(f.at(0, 5.2, 1.7), 0.3, 0.7, '#8f8070');
  }
  // Clock storey.
  p.block('#d8c9b2', 3.8, 2.8, 3.8, 0, 8.4, 0);
  p.block(quoin, 4.0, 0.25, 4.0, 0, 8.3, 0);
  p.block(quoin, 4.1, 0.3, 4.1, 0, 11.2, 0);
  const faces: THREE.Matrix4[] = [];
  for (let k = 0; k < 4; k++) {
    const f = p.at(0, 9.8, 1.92, (k * Math.PI) / 2);
    f.cyl('#3b2f2a', 1.12, 0.1, 0, 0, 0, 16, Math.PI / 2);
    f.cyl('#f6ecd2', 1.0, 0.14, 0, 0, 0.02, 16, Math.PI / 2);
    for (let h = 0; h < 12; h++) {
      const a = (h / 12) * Math.PI * 2;
      const big = h % 3 === 0;
      f.box('#3b2f2a', big ? 0.08 : 0.05, big ? 0.2 : 0.12, 0.04, Math.sin(a) * 0.82, Math.cos(a) * 0.82, 0.1, 0, 0, -a);
    }
    faces.push(new THREE.Matrix4().copy(p.m).multiply(new THREE.Matrix4().makeRotationY((k * Math.PI) / 2)).multiply(new THREE.Matrix4().makeTranslation(0, 9.8, 2.05)));
  }
  // Belfry: four corner pillars and arches, open to show the bell.
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) p.block(stone, 0.6, 2.3, 0.6, sx * 1.6, 11.5, sz * 1.6);
  for (let k = 0; k < 4; k++) {
    const f = p.at(0, 0, 0, (k * Math.PI) / 2);
    f.box(stone, 2.6, 0.35, 0.3, 0, 13.6, 1.75);
    f.box(quoin, 3.2, 0.15, 0.4, 0, 11.6, 1.75);
  }
  p.block('#6b5a48', 3.4, 0.12, 3.4, 0, 11.5, 0);
  p.box(WOOD_DARK, 3.3, 0.2, 0.2, 0, 13.4, 0);
  // Roof.
  p.block(quoin, 4.0, 0.25, 4.0, 0, 13.75, 0);
  p.cone('#55507a', 2.45 * Math.SQRT2, 4.8, 0, 14.0, 0, 4, Math.PI / 4);
  p.post('#e8c35a', 0.05, 1.3, 0, 18.6, 0, 4);
  p.sphere('#e8c35a', 0.13, 0.13, 0.13, 0, 18.75, 0);
  return { faces };
}

function church(p: Paint) {
  const wall = '#ddd3c1';
  const dark = '#c3b7a2';
  const roof = '#52587a';
  const W = CHURCH.w;
  const D = CHURCH.d;
  p.block(STONE_DARK, W + 0.4, 0.4, D + 0.4, 0, 0, 0);
  p.block(wall, W, 6.6, D, 0, 0.3, 0);
  p.prism(wall, D, 4.6, W, 0, 6.9, 0, Math.PI / 2);
  p.roof(roof, D, W, 4.6, 6.9, 0.55, 0.22, 0, 0, Math.PI / 2);
  const stained = ['#4f6fb8', '#b84f5a', '#e0b84f', '#5aa06a'];
  for (const sx of [-1, 1]) {
    for (const z of [-5.6, -2.0, 1.6, 5.2]) p.block(dark, 0.6, 4.2, 0.9, sx * (W / 2 + 0.25), 0.3, z);
    [-3.8, -0.2, 3.4].forEach((z, i) => {
      const f = p.at(sx * (W / 2 + 0.01), 3.6, z, (sx * Math.PI) / 2);
      wallWindow(f, 0.9, 2.4, '#8f8070', stained[(i + (sx > 0 ? 1 : 0)) % stained.length], false);
      f.glass.cyl(stained[(i + 2) % stained.length], 0.45, 0.1, 0, 1.2, 0.05, 8, Math.PI / 2);
    });
  }
  // A round window at the back.
  const back = p.at(0, 8.0, -D / 2 - 0.01, Math.PI);
  back.cyl('#8f8070', 1.25, 0.1, 0, 0, 0.02, 12, Math.PI / 2);
  back.glass.cyl('#7a5fb8', 1.05, 0.12, 0, 0, 0.05, 12, Math.PI / 2);
  // The steeple.
  const s = p.at(0, 0, STEEPLE.z);
  const S = STEEPLE.size;
  s.block(STONE_DARK, S + 0.4, 0.4, S + 0.4, 0, 0, 0);
  s.block('#d4c9b5', S, 12.4, S, 0, 0.3, 0);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) s.block(dark, 0.45, 12.4, 0.45, sx * (S / 2), 0.3, sz * (S / 2));
  s.block(dark, S + 0.3, 0.3, S + 0.3, 0, 12.6, 0);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) s.block('#d4c9b5', 0.6, 2.3, 0.6, sx * (S / 2 - 0.3), 12.9, sz * (S / 2 - 0.3));
  s.block('#3a2f2a', S - 0.6, 2.3, S - 0.6, 0, 12.9, 0);
  s.block(dark, S + 0.4, 0.3, S + 0.4, 0, 15.2, 0);
  s.cone(roof, (S / 2 + 0.25) * Math.SQRT2, 8.5, 0, 15.5, 0, 4, Math.PI / 4);
  s.post('#e8c35a', 0.06, 1.4, 0, 23.8, 0, 4);
  s.box('#e8c35a', 0.6, 0.08, 0.08, 0, 24.7, 0);
  // A little raven weathervane.
  s.sphere('#2a2530', 0.22, 0.16, 0.12, 0, 25.4, 0);
  s.sphere('#2a2530', 0.11, 0.11, 0.11, 0.2, 25.55, 0);
  s.cone('#e8c35a', 0.04, 0.14, 0.33, 25.48, 0, 4);
  const front = s.at(0, 0, S / 2 + 0.01);
  archedDoor(front.at(0, 0.3, 0), 1.7, 2.4, '#6a3f2a', '#8f8070');
  front.cyl('#8f8070', 0.95, 0.1, 0, 7.4, 0.02, 12, Math.PI / 2);
  front.glass.cyl('#c9a24f', 0.8, 0.12, 0, 7.4, 0.05, 12, Math.PI / 2);
  front.glass.cyl('#b84f5a', 0.35, 0.14, 0, 7.4, 0.08, 8, Math.PI / 2);
  wallWindow(front.at(0, 4.6, 0), 0.5, 1.2, '#8f8070', '#4f6fb8', false);
  // Steps.
  s.block(STONE, 3.0, 0.15, 1.0, 0, 0, S / 2 + 0.5);
  s.block(STONE, 2.4, 0.15, 0.6, 0, 0.15, S / 2 + 0.3);
}

function graveyard(p: Paint, r: () => number) {
  // A quiet corner beside the church, with a low iron railing.
  const hw = 2.2;
  const hd = 5.6;
  for (const sx of [-1, 1]) {
    for (let z = -hd; z < hd; z += 0.5) p.block(IRON, 0.05, 0.8, 0.05, sx * hw, 0, z);
    p.box(IRON, 0.06, 0.06, hd * 2, sx * hw, 0.72, 0);
  }
  for (const sz of [-1, 1]) {
    for (let x = -hw; x < hw; x += 0.5) p.block(IRON, 0.05, 0.8, 0.05, x, 0, sz * hd);
    p.box(IRON, hw * 2, 0.06, 0.06, 0, 0.72, sz * hd);
  }
  for (let i = 0; i < 8; i++) {
    const x = (i % 2 ? 0.9 : -0.9) + (r() - 0.5) * 0.3;
    const z = -hd + 1.0 + Math.floor(i / 2) * 2.6;
    const c = shade('#a8a196', (r() - 0.5) * 0.1);
    const tilt = (r() - 0.5) * 0.15;
    if (r() < 0.3) {
      p.box(c, 0.16, 1.0, 0.16, x, 0.5, z, 0, 0, tilt);
      p.box(c, 0.6, 0.16, 0.16, x, 0.72, z, 0, 0, tilt);
    } else {
      p.box(c, 0.6, 0.75, 0.16, x, 0.37, z, 0, 0, tilt);
      p.cyl(c, 0.3, 0.16, x, 0.75, z, 8, Math.PI / 2);
    }
    p.block('#7aa85a', 0.7, 0.06, 1.3, x, 0, z + 0.75);
    if (r() < 0.5) p.ico(pick(r, ['#f2a7b8', '#ffffff', '#b494dd']), 0.08, x + 0.2, 0.12, z + 0.5, 0);
  }
}

function tavern(p: Paint, r: () => number, smoke: (v: THREE.Vector3) => void) {
  const W = TAVERN.w;
  const D = TAVERN.d;
  const plaster = '#f3ead8';
  const timber = '#5a3d2a';
  p.block(STONE_DARK, W + 0.3, 0.35, D + 0.3, 0, 0, 0);
  p.block('#d9c7a8', W, 3.0, D, 0, 0.3, 0);
  // The upper floor overhangs the street.
  p.block(plaster, W + 0.4, 2.6, D + 0.5, 0, 3.3, 0);
  p.box(timber, W + 0.5, 0.25, D + 0.6, 0, 3.3, 0);
  p.box(timber, W + 0.5, 0.2, D + 0.6, 0, 5.85, 0);
  const front = p.at(0, 0, (D + 0.5) / 2 + 0.01);
  for (const x of [-5.6, -2.8, 0, 2.8, 5.6]) front.box(timber, 0.18, 2.6, 0.08, x, 4.6, 0);
  for (const x of [-4.2, 4.2]) {
    front.box(timber, 0.14, 3.0, 0.07, x, 4.6, 0, 0, 0, 0.75);
    front.box(timber, 0.14, 3.0, 0.07, x, 4.6, 0, 0, 0, -0.75);
  }
  const back = p.at(0, 0, -(D + 0.5) / 2 - 0.01, Math.PI);
  for (const x of [-5.6, -2.8, 0, 2.8, 5.6]) back.box(timber, 0.18, 2.6, 0.08, x, 4.6, 0);
  p.prism(plaster, W + 0.4, 2.8, D + 0.5, 0, 5.9, 0);
  p.roof('#4b3f5f', W + 0.4, D + 0.5, 2.8, 5.9, 0.55, 0.2);
  for (const x of [-3.8, 3.4]) {
    p.block('#9a5a44', 0.8, 3.6, 0.8, x, 6.0, -1.6);
    p.block('#7a4636', 1.0, 0.2, 1.0, x, 9.6, -1.6);
    smoke(new THREE.Vector3(x, 10.0, -1.6));
  }
  const fg = p.at(0, 0, D / 2 + 0.01);
  archedDoor(fg.at(0, 0.3, 0), 1.7, 2.1, '#6e3f2a', timber);
  for (const x of [-1.4, 1.4]) lantern(fg.at(x, 2.4, 0));
  for (const x of [-3.6, 3.6]) {
    wallWindow(fg.at(x, 1.7, 0), 1.6, 1.1, timber, '#c9d3c0');
    windowBox(fg.at(x, 1.0, 0), r, 1.7);
  }
  for (const x of [-3.6, 0, 3.6]) wallWindow(front.at(x, 4.6, 0), 1.0, 1.0, timber);
  for (const sx of [-1, 1]) {
    const side = p.at(sx * (W / 2 + 0.01), 0, 0, (sx * Math.PI) / 2);
    wallWindow(side.at(-1.6, 1.7, 0), 1.0, 1.0, timber);
    wallWindow(side.at(1.6, 1.7, 0), 1.0, 1.0, timber);
    wallWindow(p.at(sx * (W / 2 + 0.21), 0, 0, (sx * Math.PI) / 2).at(0, 4.6, 0), 0.9, 0.9, timber);
  }
  // Barrels and a bench out front.
  barrel(p.at(-4.6, 0, D / 2 + 0.9), r);
  barrel(p.at(-3.8, 0, D / 2 + 1.2), r);
  barrel(p.at(-4.2, 0, D / 2 + 2.1), r, true);
  crate(p.at(4.5, 0, D / 2 + 0.9), r);
  crate(p.at(4.6, 0.7, D / 2 + 0.9), r, 0.5);
  // The bracket the sign hangs from.
  p.box(IRON, 0.08, 0.08, 1.3, 2.6, 3.7, D / 2 + 0.65);
  p.box(IRON, 0.06, 0.6, 0.06, 2.6, 3.4, D / 2 + 0.1);
}

function bakery(p: Paint, r: () => number, smoke: (v: THREE.Vector3) => void) {
  const W = BAKERY.w;
  const D = BAKERY.d;
  const wall = '#f3d4b4';
  const roof = '#c4643f';
  p.block(STONE_DARK, W + 0.3, 0.35, D + 0.3, 0, 0, 0);
  p.block(wall, W, 3.4, D, 0, 0.3, 0);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) p.block('#b98a63', 0.25, 3.4, 0.25, sx * (W / 2), 0.3, sz * (D / 2));
  p.prism(wall, W, 2.4, D, 0, 3.7, 0);
  p.roof(roof, W, D, 2.4, 3.7, 0.5, 0.2);
  p.block('#a0523a', 0.9, 3.0, 0.9, -2.8, 4.0, -1.8);
  p.block('#7a3a2a', 1.1, 0.2, 1.1, -2.8, 7.0, -1.8);
  smoke(new THREE.Vector3(-2.8, 7.4, -1.8));
  const f = p.at(0, 0, D / 2 + 0.01);
  archedDoor(f.at(0, 0.3, 0), 1.3, 2.0, '#bf5f5f', '#8a5a3a');
  for (const x of [-2.8, 2.8]) {
    wallWindow(f.at(x, 1.65, 0), 2.0, 1.3, '#8a5a3a', '#d6e2e8');
    // Loaves in the shop window.
    for (let k = 0; k < 3; k++) f.sphere('#c98a45', 0.2, 0.13, 0.12, x - 0.6 + k * 0.6, 1.15, 0.12);
  }
  // A striped awning.
  const stripes = 12;
  for (let k = 0; k < stripes; k++) {
    const x = -W / 2 + 0.2 + (k + 0.5) * ((W - 0.4) / stripes);
    f.box(k % 2 ? '#fff3e0' : '#e4553f', (W - 0.4) / stripes + 0.01, 0.06, 1.4, x, 2.95, 0.6, 0.45);
  }
  for (let k = 0; k < stripes; k++) {
    const x = -W / 2 + 0.2 + (k + 0.5) * ((W - 0.4) / stripes);
    f.box(k % 2 ? '#fff3e0' : '#e4553f', (W - 0.4) / stripes + 0.01, 0.22, 0.04, x, 2.56, 1.25);
  }
  for (const sx of [-1, 1]) {
    const side = p.at(sx * (W / 2 + 0.01), 0, 0, (sx * Math.PI) / 2);
    wallWindow(side.at(0, 1.8, 0), 1.0, 1.0, '#8a5a3a');
  }
  // Crates of bread and a chalkboard.
  crate(p.at(-3.6, 0, D / 2 + 1.0), r, 0.6);
  for (let k = 0; k < 3; k++) p.sphere('#c98a45', 0.16, 0.1, 0.1, -3.75 + k * 0.15, 0.65, D / 2 + 1.0 + (k - 1) * 0.12);
  p.box('#3a3a3a', 0.7, 0.9, 0.06, 3.6, 0.75, D / 2 + 1.0, -0.2);
  p.box(WOOD, 0.8, 1.0, 0.04, 3.6, 0.75, D / 2 + 0.97, -0.2);
  p.box(IRON, 0.08, 0.08, 1.3, 2.3, 3.7, D / 2 + 0.65);
}

function cottage(p: Paint, r: () => number, slot: number, smoke: (v: THREE.Vector3) => void) {
  const W = HOUSE_W;
  const D = HOUSE_D;
  const wall = WALLS[slot % WALLS.length];
  const roof = ROOFS[(slot * 3) % ROOFS.length];
  const trim = TRIMS[slot % TRIMS.length];
  const door = DOORS[(slot * 5) % DOORS.length];
  p.block(STONE_DARK, W + 0.25, 0.32, D + 0.25, 0, 0, 0);
  p.block(wall, W, 2.6, D, 0, 0.3, 0);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) p.block(trim, 0.18, 2.6, 0.18, sx * (W / 2), 0.3, sz * (D / 2));
  p.box(trim, W + 0.12, 0.16, D + 0.12, 0, 2.9, 0);
  p.prism(wall, W, 1.7, D, 0, 2.98, 0);
  p.roof(roof, W, D, 1.7, 2.98, 0.45, 0.18);
  const cx = slot % 2 ? 1.5 : -1.5;
  p.block('#a8604a', 0.6, 2.4, 0.6, cx, 2.6, -0.9);
  p.block('#7a4636', 0.75, 0.16, 0.75, cx, 5.0, -0.9);
  smoke(new THREE.Vector3(cx, 5.35, -0.9).applyMatrix4(p.m));
  const f = p.at(0, 0, D / 2 + 0.01);
  f.box(trim, 1.15, 2.05, 0.06, 0, 1.3, 0.01);
  f.box(door, 0.92, 1.85, 0.1, 0, 1.22, 0.05);
  f.box(shade(door, -0.1), 0.6, 0.06, 0.04, 0, 1.6, 0.11);
  f.box(shade(door, -0.1), 0.6, 0.06, 0.04, 0, 0.9, 0.11);
  f.sphere('#e8c35a', 0.05, 0.05, 0.05, 0.3, 1.2, 0.12);
  f.block(STONE, 1.3, 0.14, 0.55, 0, 0, 0.3);
  // A little porch roof over the door.
  f.box(roof, 1.6, 0.1, 0.7, 0, 2.45, 0.32, 0.25);
  lantern(f.at(0.85, 2.0, 0));
  for (const x of [-1.6, 1.6]) {
    wallWindow(f.at(x, 1.7, 0), 0.85, 0.85, trim);
    windowBox(f.at(x, 1.15, 0), r, 1.0);
  }
  for (const sx of [-1, 1]) wallWindow(p.at(sx * (W / 2 + 0.01), 0, 0, (sx * Math.PI) / 2).at(0, 1.7, 0), 0.8, 0.8, trim);
  wallWindow(p.at(0, 0, -D / 2 - 0.01, Math.PI).at(0, 1.7, 0), 0.8, 0.8, trim);
  // Garden: bushes either side, flowers, and the name sign's post.
  bush(p.at(-W / 2 - 0.3, 0, D / 2 - 0.2), r, true);
  bush(p.at(W / 2 + 0.3, 0, D / 2 - 0.4), r, r() < 0.5);
  if (r() < 0.6) flowerPatch(p.at(W / 2 + 0.6, 0, D / 2 + 1.6), r);
  p.post(WOOD_DARK, 0.06, 1.2, -1.75, 0, D / 2 + 1.9, 5);
  if (r() < 0.5) barrel(p.at(-W / 2 - 0.5, 0, -D / 2 + 0.6), r);
  else crate(p.at(-W / 2 - 0.5, 0, -D / 2 + 0.6), r, 0.6);
}

function washhouse(p: Paint, r: () => number) {
  const { w, d } = WASHHOUSE;
  p.block('#bdb3a3', w + 0.4, 0.15, d + 0.4, 0, 0, 0);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) p.block(WOOD, 0.24, 2.6, 0.24, sx * (w / 2 - 0.2), 0.15, sz * (d / 2 - 0.2));
  p.box(WOOD_DARK, w, 0.18, 0.2, 0, 2.75, d / 2 - 0.2);
  p.box(WOOD_DARK, w, 0.18, 0.2, 0, 2.75, -d / 2 + 0.2);
  p.prism(WOOD_LIGHT, w - 0.2, 1.1, d - 0.4, 0, 2.84, 0);
  p.roof('#5f7fa8', w, d, 1.3, 2.84, 0.45, 0.16);
  // A pump at the back.
  p.block('#4a5a6a', 0.3, 1.1, 0.3, 0, 0.15, -d / 2 + 0.5);
  p.box('#4a5a6a', 0.08, 0.08, 0.5, 0, 1.15, -d / 2 + 0.7);
  for (const t of TUBS) {
    const q = p.at(t.x - WASHHOUSE.x, 0.15, t.z - WASHHOUSE.z);
    q.taper(WOOD, 0.85, 0.72, 0.62, 0, 0, 0, 12);
    for (const y of [0.12, 0.48]) q.cyl(IRON, 0.7 - y * 0.12, 0.05, 0, y, 0, 12);
    q.cyl('#8fd0e8', 0.58, 0.02, 0, 0.57, 0, 12);
    for (let k = 0; k < 5; k++) q.ico('#ffffff', 0.08 + r() * 0.07, (r() - 0.5) * 0.7, 0.62, (r() - 0.5) * 0.7, 0);
  }
  // A basket of washing and a washboard.
  const b = p.at(0, 0.15, 0.9);
  b.taper('#c9a46a', 1.2, 0.35, 0.35, 0, 0, 0, 8);
  b.ico('#f2a7b8', 0.18, -0.1, 0.38, 0, 0);
  b.ico('#8fc1e8', 0.16, 0.12, 0.4, 0.05, 0);
  p.box(WOOD_LIGHT, 0.4, 0.7, 0.05, 1.9, 0.5, -0.8, -0.3);
}

function washingLines(p: Paint) {
  for (const l of LINE_POS) {
    for (const x of [l.x0, l.x1]) {
      p.post(WOOD, 0.08, LINE_Y + 0.2, x, 0, l.z, 6);
      p.box(WOOD, 0.08, 0.08, 0.6, x, LINE_Y + 0.1, l.z);
    }
    p.cyl('#efe4cc', 0.015, l.x1 - l.x0, (l.x0 + l.x1) / 2, LINE_Y, l.z, 4, 0, 0, Math.PI / 2);
  }
}

function dock(p: Paint) {
  const { x, z0, z1, w } = DOCK;
  const n = Math.round((z1 - z0) / 0.34);
  for (let i = 0; i < n; i++) {
    const z = z0 + (i + 0.5) * ((z1 - z0) / n);
    p.box(shade(WOOD_LIGHT, ((i * 37) % 7) * 0.008 - 0.02), w, 0.07, 0.31, x, 0.07, z);
  }
  for (const sx of [-1, 1]) p.box(WOOD_DARK, 0.14, 0.12, z1 - z0, x + sx * (w / 2 - 0.07), 0.03, (z0 + z1) / 2);
  for (const sx of [-1, 1]) for (const z of [z0 + 1.8, z1 - 0.15]) p.post(WOOD_DARK, 0.11, 0.75, x + sx * (w / 2 - 0.05), -0.3, z, 6);
  // A bucket and a coil of rope at the end.
  p.taper('#7a8a9a', 1.2, 0.16, 0.26, x + 0.95, 0.1, z1 - 1.2, 8);
  p.torus('#d8c8a0', 0.18, 0.05, x - 0.9, 0.14, z1 - 1.6, Math.PI / 2);
}

function pond(group: THREE.Group, p: Paint, r: () => number): Outdoor['water'] {
  // The bank: a ring of sand and pebbles.
  const t = new Tris();
  const n = 48;
  const pt = (k: number, s: number, y: number) => {
    const a = (k / n) * Math.PI * 2;
    const wob = 1 + Math.sin(a * 3) * 0.04 + Math.cos(a * 5) * 0.03;
    return V(POND.x + Math.cos(a) * POND.rx * s * wob, y, POND.z + Math.sin(a) * POND.rz * s * wob);
  };
  for (let k = 0; k < n; k++) {
    t.quad(pt(k, 0.95, 0.03), pt(k + 1, 0.95, 0.03), pt(k + 1, 1.16, 0.03), pt(k, 1.16, 0.03), shade('#d8c89a', (hash(k, 3) - 0.5) * 0.06));
  }
  const bank = new THREE.Mesh(t.geometry(), matte());
  bank.receiveShadow = true;
  group.add(bank);
  // The water itself, rippling gently.
  const geo = new THREE.BufferGeometry();
  const rings = 5;
  const pos: number[] = [];
  const ring = (i: number, k: number) => {
    const s = i / rings;
    const a = (k / n) * Math.PI * 2 + (i % 2 ? Math.PI / n : 0);
    const wob = 1 + Math.sin(a * 3) * 0.04 + Math.cos(a * 5) * 0.03;
    return [POND.x + Math.cos(a) * POND.rx * s * wob * 0.99, 0.045, POND.z + Math.sin(a) * POND.rz * s * wob * 0.99];
  };
  for (let i = 0; i < rings; i++) {
    for (let k = 0; k < n; k++) {
      const a = ring(i, k);
      const b = ring(i, k + 1);
      const c = ring(i + 1, k + 1);
      const d = ring(i + 1, k);
      if (i > 0) pos.push(...a, ...b, ...c);
      pos.push(...a, ...c, ...d);
    }
  }
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.computeVertexNormals();
  const material = new THREE.MeshPhongMaterial({ color: '#5fb6cf', specular: '#ffffff', shininess: 70, flatShading: true, transparent: true, opacity: 0.9 });
  const mesh = new THREE.Mesh(geo, material);
  mesh.receiveShadow = true;
  mesh.name = 'pond';
  group.add(mesh);
  // Lily pads, reeds and stones around the edge.
  for (let i = 0; i < 9; i++) {
    const a = r() * Math.PI * 2;
    const s = 0.35 + r() * 0.5;
    const x = POND.x + Math.cos(a) * POND.rx * s;
    const z = POND.z + Math.sin(a) * POND.rz * s;
    if (Math.abs(x - DOCK.x) < 2.2 && z < DOCK.z1 + 1) continue;
    p.cyl(shade('#5f9e47', (r() - 0.5) * 0.08), 0.35 + r() * 0.2, 0.03, x, 0.08, z, 7);
    if (r() < 0.4) p.ico(pick(r, ['#f2a7b8', '#ffffff']), 0.1, x, 0.14, z, 0, 0.6);
  }
  for (let i = 0; i < 26; i++) {
    const a = r() * Math.PI * 2;
    const s = 0.92 + r() * 0.12;
    const x = POND.x + Math.cos(a) * POND.rx * s;
    const z = POND.z + Math.sin(a) * POND.rz * s;
    if (Math.abs(x - DOCK.x) < 2.5 && z < POND.z) continue;
    if (r() < 0.6) {
      for (let k = 0; k < 4; k++) p.cone(shade('#6f9e4a', (r() - 0.5) * 0.1), 0.05, 0.9 + r() * 0.6, x + (r() - 0.5) * 0.4, 0, z + (r() - 0.5) * 0.4, 3);
      if (r() < 0.5) p.cyl('#7a4a2a', 0.06, 0.25, x, 1.1, z, 5);
    } else rock(p.at(x, 0, z), r, 0.7);
  }
  const base = new Float32Array((geo.getAttribute('position') as THREE.BufferAttribute).array);
  return { mesh, base, material };
}

function flowerBedFrame(p: Paint) {
  const L = BED_LEN;
  const D = BED_DEPTH;
  p.block('#6b4a33', L - 0.1, BED_H - 0.02, D - 0.1, 0, 0, 0);
  for (const sz of [-1, 1]) p.block(WOOD, L + 0.1, BED_H + 0.05, 0.14, 0, 0, sz * (D / 2));
  for (const sx of [-1, 1]) p.block(WOOD, 0.14, BED_H + 0.05, D, sx * (L / 2), 0, 0);
  for (let i = 0; i < 10; i++) p.sphere('#5e4130', 0.18, 0.06, 0.15, -L / 2 + 0.3 + i * 0.47, BED_H - 0.02, ((i * 13) % 5) * 0.08 - 0.16);
}

function well(p: Paint) {
  p.cyl('#a99c89', 1.0, 0.85, 0, 0.425, 0, 10);
  p.cyl('#bfb2a0', 1.08, 0.12, 0, 0.88, 0, 10);
  p.cyl('#2f4a5a', 0.78, 0.04, 0, 0.8, 0, 10);
  for (const sx of [-1, 1]) p.block(WOOD_DARK, 0.14, 2.1, 0.14, sx * 0.85, 0.85, 0);
  p.cyl(WOOD, 0.07, 1.8, 0, 2.15, 0, 6, 0, 0, Math.PI / 2);
  p.prism(WOOD_LIGHT, 2.1, 0.7, 1.6, 0, 2.7, 0, Math.PI / 2);
  p.roof('#7b4f7a', 1.6, 2.0, 0.8, 2.6, 0.2, 0.1, 0, 0, Math.PI / 2);
  p.taper('#8a6a4a', 1.2, 0.18, 0.28, 0.2, 1.5, 0, 8);
  p.cyl('#d8c8a0', 0.01, 0.6, 0.2, 1.95, 0, 3);
}

function noticeboard(p: Paint, r: () => number) {
  for (const sx of [-1, 1]) p.post(WOOD_DARK, 0.08, 2.2, sx * 0.85, 0, 0, 6);
  p.box(WOOD, 1.8, 1.1, 0.08, 0, 1.45, 0);
  p.box(WOOD_DARK, 2.0, 0.08, 0.5, 0, 2.15, 0, 0.15);
  const notes = ['#fff7e0', '#ffe9a8', '#f8d0d8', '#d8ecf8', '#e0f2d8'];
  for (let i = 0; i < 6; i++) {
    const x = -0.6 + (i % 3) * 0.6 + (r() - 0.5) * 0.1;
    const y = 1.7 - Math.floor(i / 3) * 0.48;
    p.box(pick(r, notes), 0.42, 0.36, 0.02, x, y, 0.05, 0, 0, (r() - 0.5) * 0.2);
    p.sphere('#e4553f', 0.025, 0.025, 0.025, x, y + 0.14, 0.07);
  }
}

function gate(p: Paint) {
  for (const sx of [-1, 1]) {
    p.block('#b3a58f', 0.75, 2.8, 0.75, sx * 2.6, 0, 0);
    p.block('#9a8c78', 0.9, 0.25, 0.9, sx * 2.6, 2.8, 0);
    p.ico('#cdbda6', 0.3, sx * 2.6, 3.3, 0, 0);
  }
  p.box(WOOD_DARK, 5.9, 0.28, 0.3, 0, 3.0, 0);
  for (const sx of [-1, 1]) p.box(IRON, 0.05, 0.5, 0.05, sx * 1.1, 2.62, 0);
}

function lightPools(spots: { x: number; z: number; r: number }[]): THREE.Mesh {
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const g = c.getContext('2d')!;
  const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, 'rgba(255,255,255,1)');
  grad.addColorStop(0.45, 'rgba(255,255,255,0.45)');
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, 64, 64);
  const tex = new THREE.CanvasTexture(c);
  const geos = spots.map((s) => {
    const p = new THREE.PlaneGeometry(s.r * 2, s.r * 2);
    p.rotateX(-Math.PI / 2);
    p.translate(s.x, 0.09, s.z);
    return p;
  });
  const merged = new THREE.BufferGeometry();
  const pos: number[] = [];
  const uv: number[] = [];
  for (const g2 of geos) {
    const ng = g2.toNonIndexed();
    pos.push(...(ng.getAttribute('position').array as Float32Array));
    uv.push(...(ng.getAttribute('uv').array as Float32Array));
  }
  merged.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  merged.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  const mat = new THREE.MeshBasicMaterial({ map: tex, color: '#ffc46b', transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false });
  const mesh = new THREE.Mesh(merged, mat);
  mesh.renderOrder = 2;
  mesh.name = 'light-pools';
  return mesh;
}

// ---------------------------------------------------------------- scatter

interface Blocker {
  x: number;
  z: number;
  r: number;
}

function blockers(): Blocker[] {
  const b: Blocker[] = [];
  const add = (x: number, z: number, r: number) => b.push({ x, z, r });
  add(0, 0, SQUARE_R + 2);
  add(CHURCH.x, CHURCH.z, 10);
  add(CHURCH.x, CHURCH.z + STEEPLE.z, 4);
  add(-8.75, -34, 7);
  add(TAVERN.x, TAVERN.z, 9);
  add(BAKERY.x, BAKERY.z, 8);
  add(WASHHOUSE.x, WASHHOUSE.z, 6);
  for (const l of LINE_POS) for (let x = l.x0; x <= l.x1; x += 2) add(x, l.z, 2.2);
  add(POND.x, POND.z, 10.5);
  for (const h of houseSlots) add(h.x, h.z, 6);
  for (const bd of beds) add(bd.x, bd.z, 4);
  add(WELL.x, WELL.z, 3);
  add(NOTICEBOARD.x, NOTICEBOARD.z, 2.5);
  for (const l of [...squareLamps, ...roadLamps, ...pathLamps]) add(l.x, l.z, 1.2);
  return b;
}

function free(x: number, z: number, list: Blocker[], margin: number, pathMargin: number): boolean {
  for (const b of list) if (Math.hypot(x - b.x, z - b.z) < b.r + margin) return false;
  if (nearPath(x, z, pathMargin)) return false;
  return true;
}

// ---------------------------------------------------------------- assembly

export function buildOutdoor(windowMat: THREE.Material): Outdoor {
  const group = new THREE.Group();
  group.name = 'town';
  const r = rng(1337);
  const colliders: Collider[] = [];
  const chimneys: THREE.Vector3[] = [];
  const smoke = (v: THREE.Vector3) => chimneys.push(v);

  // Chunks of static geometry, so off-screen parts of town can be skipped.
  const chunks = new Map<string, Layers>();
  const glass = new Builder();
  const chunkAt = (x: number, z: number): Layers => {
    const key = `${Math.floor(x / 32)},${Math.floor(z / 32)}`;
    let l = chunks.get(key);
    if (!l) {
      l = { main: new Builder(), glass };
      chunks.set(key, l);
    }
    return l;
  };
  const painter = (x: number, z: number, ry = 0) => new Paint(chunkAt(x, z), frame(x, z, ry));

  group.add(groundMesh(), cobbleMesh(), pathMesh());

  // The clock tower.
  const tower = clockTower(painter(0, 0));
  // Public buildings.
  church(painter(CHURCH.x, CHURCH.z, CHURCH.ry));
  graveyard(painter(-8.75, -34), r);
  colliders.push({ kind: 'box', x: -8.75, z: -34, hw: 2.3, hd: 5.7, rot: 0 });
  tavern(painter(TAVERN.x, TAVERN.z, TAVERN.ry), r, (v) => smoke(v.applyMatrix4(frame(TAVERN.x, TAVERN.z, TAVERN.ry))));
  bakery(painter(BAKERY.x, BAKERY.z, BAKERY.ry), r, (v) => smoke(v.applyMatrix4(frame(BAKERY.x, BAKERY.z, BAKERY.ry))));
  for (const [lx, lz] of [
    [-4.6, TAVERN.d / 2 + 0.9],
    [-3.8, TAVERN.d / 2 + 1.2],
    [4.5, TAVERN.d / 2 + 0.9],
  ]) {
    const c = local(TAVERN.x, TAVERN.z, TAVERN.ry, lx, lz);
    colliders.push({ kind: 'circle', x: c.x, z: c.z, r: 0.45 });
  }
  const lyingBarrel = local(TAVERN.x, TAVERN.z, TAVERN.ry, -4.2, TAVERN.d / 2 + 2.1);
  colliders.push({ kind: 'box', x: lyingBarrel.x, z: lyingBarrel.z, hw: 0.5, hd: 0.4, rot: TAVERN.ry });
  for (const [lx, lz] of [
    [-3.6, BAKERY.d / 2 + 1.0],
    [3.6, BAKERY.d / 2 + 1.0],
  ]) {
    const c = local(BAKERY.x, BAKERY.z, BAKERY.ry, lx, lz);
    colliders.push({ kind: 'circle', x: c.x, z: c.z, r: 0.45 });
  }
  washhouse(painter(WASHHOUSE.x, WASHHOUSE.z), r);
  washingLines(painter(0, 0));
  dock(painter(DOCK.x, (DOCK.z0 + DOCK.z1) / 2));
  const water = pond(group, painter(POND.x, POND.z), r);
  for (const b of beds) flowerBedFrame(painter(b.x, b.z, b.ry));
  for (const b of benches) bench(painter(b.x, b.z, b.ry));
  for (const l of [...squareLamps, ...roadLamps, ...pathLamps]) lampPost(painter(l.x, l.z));
  well(painter(WELL.x, WELL.z));
  noticeboard(painter(NOTICEBOARD.x, NOTICEBOARD.z), r);
  gate(painter(0, GATE_Z));

  // Cottages.
  houseSlots.forEach((h, i) => {
    cottage(painter(h.x, h.z, h.ry), rng(500 + i), i, smoke);
    const post = local(h.x, h.z, h.ry, -1.75, HOUSE_D / 2 + 1.9);
    colliders.push({ kind: 'circle', x: post.x, z: post.z, r: 0.15 });
  });

  // The town fence, with a gap for the road south.
  const fenceR = TOWN_R + 0.9;
  const segs = 120;
  for (let i = 0; i < segs; i++) {
    const a0 = (i / segs) * Math.PI * 2;
    const a1 = ((i + 1) / segs) * Math.PI * 2;
    const am = (a0 + a1) / 2;
    const x = fenceR * Math.sin(am);
    const z = -fenceR * Math.cos(am);
    if (z > 0 && Math.abs(x) < 3.4) continue;
    railFence(painter(x, z, -am), 2 * fenceR * Math.sin(Math.PI / segs));
  }

  // Trees, bushes and flowers.
  const block = blockers();
  const trees: Blocker[] = [];
  const placeTree = (x: number, z: number, collide: boolean) => {
    const p = painter(x, z, r() * Math.PI * 2);
    const kind = r();
    if (kind < 0.42) pineTree(p, r);
    else roundTree(p, r, kind > 0.9);
    trees.push({ x, z, r: 2 });
    if (collide) colliders.push({ kind: 'circle', x, z, r: 0.45 });
  };
  // Forest ring outside the fence.
  let placed = 0;
  for (let k = 0; k < 2400 && placed < 430; k++) {
    const a = r() * Math.PI * 2;
    const rad = 62 + Math.pow(r(), 0.8) * 70;
    const x = rad * Math.sin(a);
    const z = -rad * Math.cos(a);
    if (z > 55 && Math.abs(x) < 5) continue;
    if (trees.some((t) => Math.hypot(t.x - x, t.z - z) < 2.6)) continue;
    placeTree(x, z, false);
    placed++;
  }
  // Inside town, in the gaps.
  for (let k = 0; k < 900 && placed < 520; k++) {
    const a = r() * Math.PI * 2;
    const rad = 20 + r() * 37;
    const x = rad * Math.sin(a);
    const z = -rad * Math.cos(a);
    if (!free(x, z, block, 1.4, 2.2)) continue;
    if (trees.some((t) => Math.hypot(t.x - x, t.z - z) < 3.4)) continue;
    placeTree(x, z, true);
    placed++;
  }
  for (let k = 0; k < 900; k++) {
    const a = r() * Math.PI * 2;
    const rad = 16 + r() * 41;
    const x = rad * Math.sin(a);
    const z = -rad * Math.cos(a);
    if (!free(x, z, block, 0.6, 1.0)) continue;
    if (trees.some((t) => Math.hypot(t.x - x, t.z - z) < 1.6)) continue;
    const kind = r();
    const p = painter(x, z, r() * 6);
    if (kind < 0.18) bush(p, r, r() < 0.5);
    else if (kind < 0.42) flowerPatch(p, r);
    else if (kind < 0.5) rock(p, r, 0.6 + r() * 0.6);
    else if (kind < 0.53) mushroom(p, r);
    else tuft(p, r);
  }
  for (let k = 0; k < 260; k++) {
    const a = r() * Math.PI * 2;
    const rad = 60 + r() * 50;
    const p = painter(rad * Math.sin(a), -rad * Math.cos(a), r() * 6);
    const kind = r();
    if (kind < 0.4) bush(p, r);
    else if (kind < 0.7) rock(p, r, 0.8 + r());
    else mushroom(p, r);
  }

  // Merge everything.
  const main = matte();
  for (const l of chunks.values()) {
    if (l.main.empty) continue;
    const m = l.main.mesh(main);
    m.name = 'chunk';
    group.add(m);
  }
  const glassMesh = glass.mesh(windowMat, { cast: false, receive: false });
  glassMesh.name = 'glass';
  group.add(glassMesh);

  // Moving parts: clock hands, the bell and the flag.
  const handMat = matte();
  const clockHands = tower.faces.map((m) => {
    const holder = new THREE.Group();
    holder.matrixAutoUpdate = false;
    holder.matrix.copy(m);
    const make = (len: number, w: number) => {
      const b = new Builder();
      b.add(G.box(), '#2a211c', { pos: [0, len / 2 - 0.08, 0], scale: [w, len, 0.04] });
      b.add(G.cyl(6), '#2a211c', { pos: [0, 0, 0], scale: [0.07, 0.05, 0.07], rot: [Math.PI / 2, 0, 0] });
      const mesh = b.mesh(handMat, { cast: false });
      holder.add(mesh);
      return mesh;
    };
    const hour = make(0.55, 0.08);
    const minute = make(0.85, 0.05);
    minute.position.z = 0.03;
    group.add(holder);
    return { hour, minute };
  });
  const bell = new THREE.Group();
  bell.position.set(0, 13.3, 0);
  {
    const b = new Builder();
    b.add(G.taper(0.55, 12), '#d8a845', { pos: [0, -0.5, 0], scale: [0.55, 0.8, 0.55] });
    b.add(G.cyl(12), '#b88a35', { pos: [0, -0.92, 0], scale: [0.6, 0.08, 0.6] });
    b.add(G.sphere(6, 4), '#d8a845', { pos: [0, -0.08, 0], scale: [0.32, 0.18, 0.32] });
    b.add(G.sphere(6, 4), '#6b5a3a', { pos: [0, -0.95, 0], scale: [0.1, 0.1, 0.1] });
    bell.add(b.mesh(matte()));
  }
  group.add(bell);
  const flag = new THREE.Group();
  flag.position.set(0, 19.8, 0);
  {
    const b = new Builder();
    b.add(G.box(), '#8a3a5a', { pos: [0.45, -0.22, 0], scale: [0.9, 0.44, 0.03] });
    b.add(G.box(), '#e8c35a', { pos: [0.45, -0.22, 0.02], scale: [0.3, 0.1, 0.02] });
    flag.add(b.mesh(matte()));
  }
  group.add(flag);

  // Name signs by every cottage, and a wreath for each door.
  const houseSigns: TextSign[] = [];
  const signMaterials: THREE.MeshLambertMaterial[] = [];
  const wreaths: THREE.Object3D[] = [];
  const wreathGeo = (() => {
    const b = new Builder();
    b.add(G.torus(0.3, 6, 12), '#3f6f3f', { scale: 0.22 });
    for (let k = 0; k < 6; k++) {
      const a = (k / 6) * Math.PI * 2;
      b.add(G.ico(0), k % 2 ? '#5f8f4f' : '#2f5a3a', { pos: [Math.cos(a) * 0.22, Math.sin(a) * 0.22, 0.03], scale: 0.07 });
    }
    b.add(G.box(), '#6a4f8a', { pos: [0, -0.22, 0.05], scale: [0.14, 0.1, 0.04] });
    b.add(G.box(), '#6a4f8a', { pos: [-0.05, -0.32, 0.05], rot: [0, 0, 0.4], scale: [0.05, 0.18, 0.03] });
    b.add(G.box(), '#6a4f8a', { pos: [0.05, -0.32, 0.05], rot: [0, 0, -0.4], scale: [0.05, 0.18, 0.03] });
    return b.geometry();
  })();
  const wreathMat = matte();
  houseSlots.forEach((h) => {
    const sign = new TextSign({ w: 384, h: 128, bg: '#f3e2c0', fg: '#5a4434', border: '#8a5a3a', grain: true }, '');
    const { mesh, material } = signBoard(sign, 1.5, 0.5);
    const p = local(h.x, h.z, h.ry, -1.75, HOUSE_D / 2 + 1.9);
    mesh.position.set(p.x, 1.45, p.z);
    mesh.rotation.y = h.ry;
    group.add(mesh);
    houseSigns.push(sign);
    signMaterials.push(material);
    const w = new THREE.Mesh(wreathGeo, wreathMat);
    const wp = local(h.x, h.z, h.ry, 0, HOUSE_D / 2 + 0.13);
    w.position.set(wp.x, 1.62, wp.z);
    w.rotation.y = h.ry;
    w.visible = false;
    group.add(w);
    wreaths.push(w);
  });
  // The tavern's and bakery's hanging signs, and the town gate.
  const hang = (text: string[], b: { x: number; z: number; ry: number }, lx: number, lz: number, y: number, w: number, h: number, style: Partial<ConstructorParameters<typeof TextSign>[0]> = {}) => {
    const sign = new TextSign({ w: 512, h: Math.round((512 * h) / w), bg: '#3b2a36', fg: '#f6e3b0', border: '#c9a24f', grain: false, ...style }, text);
    const { mesh, material } = signBoard(sign, w, h, { lit: true });
    const p = local(b.x, b.z, b.ry, lx, lz);
    mesh.position.set(p.x, y, p.z);
    mesh.rotation.y = b.ry + Math.PI / 2;
    group.add(mesh);
    signMaterials.push(material);
  };
  hang(['The Raven’s Rest', 'tavern & inn'], TAVERN, 2.6, TAVERN.d / 2 + 1.0, 3.05, 1.6, 0.95);
  hang(['Bakery', 'fresh every morning'], BAKERY, 2.3, BAKERY.d / 2 + 1.0, 3.05, 1.5, 0.85, { bg: '#f6e7cf', fg: '#a0523a', border: '#a0523a' });
  {
    const sign = new TextSign({ w: 512, h: 128, bg: '#5a3d2a', fg: '#f6e3b0', border: '#c9a24f' }, ['Ravenswood Bluff']);
    const { mesh, material } = signBoard(sign, 3.6, 0.9, { lit: true });
    mesh.position.set(0, 2.25, GATE_Z);
    group.add(mesh);
    signMaterials.push(material);
  }

  // Warm pools of light under every lamp, shown at night.
  const poolSpots = [
    ...[...squareLamps, ...roadLamps, ...pathLamps].map((l) => ({ x: l.x, z: l.z, r: 3.4 })),
    ...houseSlots.map((h) => ({ ...local(h.x, h.z, h.ry, 0.85, HOUSE_D / 2 + 0.9), r: 2.2 })),
    ...[-1.4, 1.4].map((lx) => ({ ...local(TAVERN.x, TAVERN.z, TAVERN.ry, lx, TAVERN.d / 2 + 0.8), r: 2.4 })),
    { x: 0, z: 0, r: 0 },
  ].filter((s) => s.r > 0);
  const pools = lightPools(poolSpots);
  group.add(pools);

  const lampLights = [0, 2, 4, 6].map((i) => new THREE.Vector3(squareLamps[i].x, 2.9, squareLamps[i].z));

  return { group, colliders, water, clockHands, bell, flag, chimneys, houseSigns, signMaterials, wreaths, pools, lampLights };
}

