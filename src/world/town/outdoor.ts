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
  GRAVEYARD,
  SQUARE_R,
  STEEPLE,
  TAVERN,
  TOWN_R,
  TUBS,
  WASHHOUSE,
  WELL,
  WOODPILE,
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
  bird,
  bush,
  crate,
  flowerPatch,
  flowerStem,
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
  /** Buildings on their own meshes, so one between the camera and a player can fade to see-through. */
  occluders: THREE.Mesh[];
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
  for (let x = 0; x <= TOWN_R + 2; x += 3) rings.push(x);
  for (let x = TOWN_R + 8; x <= 200; x += 7) rings.push(x);
  const seg = 80;
  const pt = (i: number, j: number) => {
    const rad = rings[i];
    const jj = ((j % seg) + seg) % seg;
    const a = (jj / seg) * Math.PI * 2 + (i % 2 ? Math.PI / seg : 0);
    const wob = i === 0 ? 0 : (hash(i, jj) - 0.5) * (rad < TOWN_R ? 1.2 : 3.5);
    const rr = rad + wob;
    const hill = rad < TOWN_R + 1 ? 0 : smooth(TOWN_R + 1, TOWN_R + 52, rad) * (5 + 3 * Math.sin(a * 3 + 1.3) + 2 * Math.sin(a * 7 + 0.4)) + smooth(TOWN_R + 4, TOWN_R + 22, rad) * hash(jj, i) * 1.4;
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
      const list = rings[i] < TOWN_R ? grass : far;
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
    const ring = false;
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
  add(0, -SQUARE_R + 1, 0, -14.6, 2.6);
  add(0, SQUARE_R - 1, 0, 60, 2.6);
  add(-SQUARE_R + 1, 0, -16.4, 0, 2.6);
  add(SQUARE_R - 1, 0, 16.4, 0, 2.6);
  add(1, 12.2, 6.5, 12.2, 2.2);
  add(-1, 12.6, -14, 12.6, 2.2);
  add(-14, 12.6, -14, 13.4, 2.2);
  for (const deg of [60, 120, 240, 300]) {
    const a = (deg * Math.PI) / 180;
    add((SQUARE_R - 0.5) * Math.sin(a), -(SQUARE_R - 0.5) * Math.cos(a), RING_ROAD_R * Math.sin(a), -RING_ROAD_R * Math.cos(a), 2.0);
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
  PATHS.forEach(({ seg, w }, index) => {
    const lift = index * 0.00012;
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
      // Where paths cross, the one drawn later sits a hair higher, so they never flicker against each other.
      const y = 0.024 + lift;
      t.quad(V(ax + nx * wl, y, az + nz * wl), V(bx + nx * nl, y, bz + nz * nl), V(bx - nx * nr, y, bz - nz * nr), V(ax - nx * wr, y, az - nz * wr), shade(pick(r, dirt), (r() - 0.5) * 0.03));
    }
  });
  const mesh = new THREE.Mesh(t.geometry(), matte());
  mesh.receiveShadow = true;
  mesh.name = 'paths';
  return mesh;
}

// ---------------------------------------------------------------- windows and doors

/** A window on a wall whose face is the local z = 0 plane, looking out along +z. */
function wallWindow(p: Paint, w: number, h: number, trim: THREE.ColorRepresentation, glass: THREE.ColorRepresentation = GLASS, sill = true, shutters: THREE.ColorRepresentation | null = null) {
  p.box(trim, w + 0.16, h + 0.16, 0.08, 0, 0, 0.02);
  p.glass.box(glass, w, h, 0.1, 0, 0, 0.05);
  p.box(trim, 0.06, h, 0.05, 0, 0, 0.11);
  p.box(trim, w, 0.06, 0.05, 0, 0, 0.11);
  // A keystone-ish lintel above.
  p.box(shade(trim, -0.06), w + 0.3, 0.1, 0.12, 0, h / 2 + 0.12, 0.05);
  if (sill) {
    p.box(shade(trim, 0.08), w + 0.3, 0.08, 0.2, 0, -h / 2 - 0.1, 0.1);
    p.box(shade(trim, 0.0), w + 0.1, 0.06, 0.1, 0, -h / 2 - 0.17, 0.05);
  }
  if (shutters) {
    for (const sx of [-1, 1]) {
      const x = sx * (w / 2 + 0.08 + 0.17);
      p.box(shutters, 0.34, h + 0.1, 0.05, x, 0, 0.07);
      for (let k = 0; k < 4; k++) p.box(shade(shutters, -0.12), 0.26, 0.03, 0.02, x, -h / 2 + 0.12 + (k * (h - 0.24)) / 3, 0.1, 0.5);
      p.box(shade(shutters, -0.18), 0.3, 0.04, 0.02, x, h / 2 - 0.03, 0.1);
      p.box(shade(shutters, -0.18), 0.3, 0.04, 0.02, x, -h / 2 + 0.03, 0.1);
      // A heart cut-out, the cottage way.
      p.ico(shade(shutters, -0.35), 0.035, x, 0, 0.1, 0, 1.2);
    }
  }
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
  p.cyl(trim, w / 2 + 0.12, 0.08, 0, h, 0.02, 16, Math.PI / 2);
  p.box(color, w, h, 0.1, 0, h / 2, 0.06);
  p.cyl(color, w / 2, 0.1, 0, h, 0.06, 16, Math.PI / 2);
  // Planks, two iron straps with nail heads, hinges and a ring handle.
  const planks = 4;
  for (let k = 1; k < planks; k++) p.box(shade(color, -0.14), 0.025, h + w / 2, 0.02, -w / 2 + (k * w) / planks, h / 2, 0.115);
  for (const y of [h * 0.28, h * 0.72]) {
    p.box(IRON, w * 0.8, 0.07, 0.025, 0, y, 0.12);
    for (const sx of [-1, 0, 1]) p.cyl(shade(IRON, 0.15), 0.018, 0.015, sx * w * 0.3, y, 0.135, 6, Math.PI / 2);
  }
  for (const y of [h * 0.28, h * 0.72]) {
    p.box(IRON, 0.08, 0.14, 0.03, -w / 2 - 0.06, y, 0.11);
    p.cyl(IRON, 0.03, 0.16, -w / 2 - 0.06, y, 0.125, 8);
  }
  p.torus('#e8c35a', 0.07, 0.016, w * 0.3, h * 0.5, 0.14, Math.PI / 2);
  p.cyl('#e8c35a', 0.03, 0.03, w * 0.3, h * 0.5 + 0.07, 0.135, 8, Math.PI / 2);
  // A step worn in front.
  p.box(shade(trim, 0.1), w + 0.3, 0.06, 0.3, 0, 0.03, 0.2);
}

function lantern(p: Paint) {
  // A scroll bracket out from the wall with a six-sided lantern hanging off it.
  p.box(IRON, 0.05, 0.05, 0.34, 0, 0, 0.14);
  p.box(IRON, 0.05, 0.22, 0.05, 0, -0.1, 0.02);
  p.rod(IRON, 0.02, 0, -0.2, 0.03, 0, -0.02, 0.26, 6);
  p.torus(IRON, 0.04, 0.012, 0, 0.03, 0.26, 0, Math.PI / 2);
  p.cyl(IRON, 0.035, 0.08, 0, -0.04, 0.28, 6);
  p.cyl(IRON, 0.13, 0.025, 0, -0.07, 0.28, 6);
  p.glass.cyl('#fff1c8', 0.11, 0.26, 0, -0.21, 0.28, 6);
  for (let k = 0; k < 6; k++) {
    const a = (k / 6) * Math.PI * 2 + Math.PI / 6;
    p.box(IRON, 0.018, 0.28, 0.018, Math.cos(a) * 0.105, -0.21, 0.28 + Math.sin(a) * 0.105);
  }
  p.cyl(IRON, 0.12, 0.025, 0, -0.35, 0.28, 6);
  p.cone(IRON, 0.14, 0.1, 0, -0.07, 0.28, 6);
}

/** Lines of mortar around a block of masonry, with staggered joints, so a wall reads as courses of stone. */
function courses(p: Paint, w: number, h: number, d: number, x: number, y: number, z: number, course: number, color: THREE.ColorRepresentation, joints = true) {
  const rows = Math.floor(h / course);
  for (let k = 1; k <= rows; k++) {
    const yy = y + k * course;
    if (yy >= y + h - 0.02) break;
    p.box(color, w + 0.02, 0.03, d + 0.02, x, yy, z);
    if (!joints) continue;
    // Vertical joints, offset every other course, on each face.
    const stagger = k % 2 ? 0 : 0.4;
    for (let jx = -w / 2 + 0.5 + stagger; jx < w / 2 - 0.2; jx += 0.8) {
      p.box(color, 0.03, course - 0.04, 0.03, x + jx, yy - course / 2, z + d / 2 + 0.005);
      p.box(color, 0.03, course - 0.04, 0.03, x + jx, yy - course / 2, z - d / 2 - 0.005);
    }
    for (let jz = -d / 2 + 0.5 + stagger; jz < d / 2 - 0.2; jz += 0.8) {
      p.box(color, 0.03, course - 0.04, 0.03, x + w / 2 + 0.005, yy - course / 2, z + jz);
      p.box(color, 0.03, course - 0.04, 0.03, x - w / 2 - 0.005, yy - course / 2, z + jz);
    }
  }
}

/** A chimney stack with a pot (or two) on top. Standing on y. */
function chimney(p: Paint, brick: THREE.ColorRepresentation, w: number, h: number, x: number, y: number, z: number, pots = 1) {
  p.block(brick, w, h, w, x, y, z);
  courses(p, w, h, w, x, y, z, 0.28, shade(brick, -0.18), false);
  p.block(shade(brick, -0.12), w + 0.22, 0.16, w + 0.22, x, y + h, z);
  p.block(shade(brick, 0.04), w + 0.1, 0.1, w + 0.1, x, y + h + 0.16, z);
  for (let k = 0; k < pots; k++) {
    const px = x + (pots > 1 ? (k - (pots - 1) / 2) * (w * 0.5) : 0);
    p.taper('#9a5a44', 0.85, w * 0.22, 0.55, px, y + h + 0.26, z, 10);
    p.cyl('#8a4a38', w * 0.25, 0.08, px, y + h + 0.83, z, 10);
    p.cyl('#2a2024', w * 0.16, 0.02, px, y + h + 0.88, z, 10);
  }
}

// ---------------------------------------------------------------- buildings

function clockTower(p: Paint): { faces: THREE.Matrix4[] } {
  const stone = '#cdbda6';
  const quoin = '#b3a28a';
  const mortar = '#a89a84';
  // Two stone steps all round, with a worn edge.
  p.cyl('#a99c89', 2.65, 0.45, 0, 0.225, 0, 24);
  p.cyl('#bcae99', 2.3, 0.3, 0, 0.6, 0, 24);
  p.torus('#9c907c', 2.62, 0.04, 0, 0.45, 0, Math.PI / 2);
  p.block(stone, 3.4, 8.0, 3.4, 0, 0.6, 0);
  courses(p, 3.4, 8.0, 3.4, 0, 0.6, 0, 0.5, mortar);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) for (let k = 0; k < 8; k++) p.block(k % 2 ? quoin : shade(quoin, 0.05), 0.42, 0.5, 0.42, sx * 1.62, 0.8 + k, sz * 1.62);
  // A door on each side, slit windows with sills, and a lantern by each door.
  for (let k = 0; k < 4; k++) {
    const f = p.at(0, 0, 0, (k * Math.PI) / 2);
    archedDoor(f.at(0, 0.6, 1.7), 0.9, 1.6, '#5a3a28', '#8f8070');
    wallWindow(f.at(0, 5.2, 1.7), 0.3, 0.7, '#8f8070');
    wallWindow(f.at(0, 3.3, 1.7), 0.3, 0.5, '#8f8070');
    lantern(f.at(0.95, 2.5, 1.7));
    // A string course between the storeys.
    f.box(quoin, 3.6, 0.14, 0.14, 0, 4.4, 1.75);
  }
  // Clock storey, with a dentil cornice under the belfry.
  p.block('#d8c9b2', 3.8, 2.8, 3.8, 0, 8.4, 0);
  courses(p, 3.8, 2.8, 3.8, 0, 8.4, 0, 0.47, mortar, false);
  p.block(quoin, 4.0, 0.25, 4.0, 0, 8.3, 0);
  p.block(quoin, 4.1, 0.3, 4.1, 0, 11.2, 0);
  for (let k = 0; k < 4; k++) {
    const f = p.at(0, 0, 0, (k * Math.PI) / 2);
    for (let j = -1.7; j <= 1.7; j += 0.34) f.box(shade(quoin, -0.08), 0.16, 0.14, 0.12, j, 11.1, 2.08);
  }
  const faces: THREE.Matrix4[] = [];
  for (let k = 0; k < 4; k++) {
    // The face sits flat against the wall: a moulded bezel, a dial and painted-on hour marks.
    const f = p.at(0, 9.8, 1.9, (k * Math.PI) / 2);
    f.torus('#3b2f2a', 1.12, 0.05, 0, 0, 0.005, 0, 0);
    f.cyl('#e8c35a', 1.1, 0.02, 0, 0, 0.0, 24, Math.PI / 2);
    f.cyl('#f6ecd2', 1.0, 0.03, 0, 0, 0.02, 24, Math.PI / 2);
    f.torus('#3b2f2a', 1.0, 0.012, 0, 0, 0.04, 0, 0);
    for (let h = 0; h < 12; h++) {
      const a = (h / 12) * Math.PI * 2;
      const big = h % 3 === 0;
      f.box('#3b2f2a', big ? 0.08 : 0.05, big ? 0.2 : 0.12, 0.012, Math.sin(a) * 0.82, Math.cos(a) * 0.82, 0.04, 0, 0, -a);
    }
    for (let h = 0; h < 60; h++) {
      if (h % 5 === 0) continue;
      const a = (h / 60) * Math.PI * 2;
      f.box('#6b5a48', 0.02, 0.06, 0.01, Math.sin(a) * 0.9, Math.cos(a) * 0.9, 0.04, 0, 0, -a);
    }
    faces.push(new THREE.Matrix4().copy(p.m).multiply(new THREE.Matrix4().makeRotationY((k * Math.PI) / 2)).multiply(new THREE.Matrix4().makeTranslation(0, 9.8, 1.96)));
  }
  // Belfry: four corner pillars with capitals and arches, open to show the bell.
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    p.block(stone, 0.6, 2.3, 0.6, sx * 1.6, 11.5, sz * 1.6);
    p.block(quoin, 0.72, 0.14, 0.72, sx * 1.6, 11.5, sz * 1.6);
    p.block(quoin, 0.72, 0.14, 0.72, sx * 1.6, 13.5, sz * 1.6);
  }
  for (let k = 0; k < 4; k++) {
    const f = p.at(0, 0, 0, (k * Math.PI) / 2);
    f.box(stone, 2.6, 0.35, 0.3, 0, 13.6, 1.75);
    f.box(quoin, 3.2, 0.15, 0.4, 0, 11.6, 1.75);
    // The arch, as a ring cut flat, and a little balustrade below.
    f.cyl(stone, 1.3, 0.3, 0, 12.4, 1.75, 24, Math.PI / 2);
    f.cyl('#4a4050', 1.1, 0.34, 0, 12.3, 1.75, 24, Math.PI / 2);
    f.box('#4a4050', 2.2, 1.0, 0.34, 0, 11.75, 1.75);
    for (let j = -0.9; j <= 0.9; j += 0.3) f.cyl(stone, 0.05, 0.5, j, 11.95, 1.78, 8);
    f.box(stone, 2.3, 0.08, 0.14, 0, 12.22, 1.78);
  }
  p.block('#6b5a48', 3.4, 0.12, 3.4, 0, 11.5, 0);
  p.box(WOOD_DARK, 3.3, 0.2, 0.2, 0, 13.4, 0);
  // Roof: a slate pyramid laid in stepped rows, with a finial on top.
  p.block(quoin, 4.0, 0.25, 4.0, 0, 13.75, 0);
  const R = 2.45 * Math.SQRT2;
  const rows = 11;
  for (let i = 0; i < rows; i++) {
    const t = i / rows;
    const rad = R * (1 - t) + 0.06;
    p.cone(shade('#55507a', i % 2 ? -0.05 : 0.02), rad, 0.62, 0, 14.0 + t * 4.8, 0, 4, Math.PI / 4);
  }
  p.cone('#4a4568', 0.25, 0.5, 0, 18.5, 0, 4, Math.PI / 4);
  p.post('#e8c35a', 0.05, 1.3, 0, 18.6, 0, 8);
  p.sphere('#e8c35a', 0.13, 0.13, 0.13, 0, 18.75, 0);
  p.sphere('#e8c35a', 0.09, 0.09, 0.09, 0, 19.9, 0);
  return { faces };
}

function church(p: Paint) {
  const wall = '#ddd3c1';
  const dark = '#c3b7a2';
  const roof = '#52587a';
  const W = CHURCH.w;
  const D = CHURCH.d;
  const mortar = '#b8ad9a';
  p.block(STONE_DARK, W + 0.4, 0.4, D + 0.4, 0, 0, 0);
  p.block(wall, W, 6.6, D, 0, 0.3, 0);
  courses(p, W, 6.6, D, 0, 0.3, 0, 0.55, mortar);
  // Quoins up the corners and a cornice under the eaves.
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) for (let k = 0; k < 11; k++) p.block(k % 2 ? dark : shade(dark, 0.05), 0.5, 0.55, 0.5, sx * (W / 2 - 0.05), 0.45 + k * 0.55, sz * (D / 2 - 0.05));
  p.box(dark, W + 0.3, 0.18, D + 0.3, 0, 6.8, 0);
  p.prism(wall, D, 4.6, W, 0, 6.9, 0, Math.PI / 2);
  p.roof(roof, D, W, 4.6, 6.9, 0.55, 0.22, 0, 0, Math.PI / 2);
  const stained = ['#4f6fb8', '#b84f5a', '#e0b84f', '#5aa06a'];
  for (const sx of [-1, 1]) {
    for (const z of [-5.6, -2.0, 1.6, 5.2]) {
      // Stepped buttresses with a sloped cap.
      p.block(dark, 0.6, 4.2, 0.9, sx * (W / 2 + 0.25), 0.3, z);
      p.block(dark, 0.45, 1.6, 0.9, sx * (W / 2 + 0.18), 4.5, z);
      p.box(shade(dark, -0.06), 0.7, 0.12, 1.0, sx * (W / 2 + 0.25), 4.55, z, 0, 0, sx * 0.5);
      p.box(shade(dark, -0.06), 0.55, 0.12, 1.0, sx * (W / 2 + 0.18), 6.15, z, 0, 0, sx * 0.5);
    }
    [-3.8, -0.2, 3.4].forEach((z, i) => {
      const f = p.at(sx * (W / 2 + 0.01), 3.6, z, (sx * Math.PI) / 2);
      wallWindow(f, 0.9, 2.4, '#8f8070', stained[(i + (sx > 0 ? 1 : 0)) % stained.length], false);
      // Lead lines across the glass, a pointed arch over, and a sill.
      for (let k = -0.9; k <= 0.9; k += 0.45) f.box('#3a3330', 0.86, 0.025, 0.02, 0, k, 0.11);
      f.box('#3a3330', 0.025, 2.3, 0.02, 0, 0, 0.11);
      f.glass.cyl(stained[(i + 2) % stained.length], 0.45, 0.1, 0, 1.2, 0.05, 16, Math.PI / 2);
      f.torus('#8f8070', 0.5, 0.05, 0, 1.2, 0.08, 0, 0);
      f.box(shade('#8f8070', 0.06), 1.3, 0.1, 0.22, 0, -1.3, 0.1);
    });
  }
  // A round window at the back, with tracery.
  const back = p.at(0, 8.0, -D / 2 - 0.01, Math.PI);
  back.cyl('#8f8070', 1.25, 0.1, 0, 0, 0.02, 24, Math.PI / 2);
  back.glass.cyl('#7a5fb8', 1.05, 0.12, 0, 0, 0.05, 24, Math.PI / 2);
  for (let k = 0; k < 6; k++) back.box('#8f8070', 0.06, 2.1, 0.04, 0, 0, 0.12, 0, 0, (k / 6) * Math.PI);
  back.torus('#8f8070', 0.5, 0.03, 0, 0, 0.12, 0, 0);
  // The steeple.
  const s = p.at(0, 0, STEEPLE.z);
  const S = STEEPLE.size;
  s.block(STONE_DARK, S + 0.4, 0.4, S + 0.4, 0, 0, 0);
  s.block('#d4c9b5', S, 12.4, S, 0, 0.3, 0);
  courses(s, S, 12.4, S, 0, 0.3, 0, 0.55, mortar);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) s.block(dark, 0.45, 12.4, 0.45, sx * (S / 2), 0.3, sz * (S / 2));
  for (const y of [4.6, 8.8]) s.block(dark, S + 0.25, 0.14, S + 0.25, 0, y, 0);
  s.block(dark, S + 0.3, 0.3, S + 0.3, 0, 12.6, 0);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) s.block('#d4c9b5', 0.6, 2.3, 0.6, sx * (S / 2 - 0.3), 12.9, sz * (S / 2 - 0.3));
  s.block('#3a2f2a', S - 0.6, 2.3, S - 0.6, 0, 12.9, 0);
  // Louvred openings in the belfry, so it reads as a bell chamber.
  for (let k = 0; k < 4; k++) {
    const f = s.at(0, 0, 0, (k * Math.PI) / 2);
    for (let j = 0; j < 5; j++) f.box(shade(dark, -0.1), S - 0.7, 0.08, 0.12, 0, 13.2 + j * 0.4, S / 2 - 0.3, 0.6);
    f.cyl('#d4c9b5', 1.4, 0.3, 0, 13.0, S / 2 - 0.3, 24, Math.PI / 2);
    f.cyl('#3a2f2a', 1.2, 0.34, 0, 13.0, S / 2 - 0.3, 24, Math.PI / 2);
  }
  s.block(dark, S + 0.4, 0.3, S + 0.4, 0, 15.2, 0);
  // The spire, in stepped rows of slate, and a cross-trimmed weathervane.
  const SR = (S / 2 + 0.25) * Math.SQRT2;
  const srows = 14;
  for (let i = 0; i < srows; i++) {
    const t = i / srows;
    s.cone(shade(roof, i % 2 ? -0.05 : 0.02), SR * (1 - t) + 0.06, 0.78, 0, 15.5 + t * 8.5, 0, 4, Math.PI / 4);
  }
  s.cone(shade(roof, -0.1), 0.2, 0.6, 0, 23.6, 0, 4, Math.PI / 4);
  s.post('#e8c35a', 0.06, 1.4, 0, 23.8, 0, 8);
  s.box('#e8c35a', 0.6, 0.08, 0.08, 0, 24.7, 0);
  s.box('#e8c35a', 0.08, 0.08, 0.6, 0, 24.7, 0);
  for (const [dx, dz] of [
    [0.3, 0],
    [-0.3, 0],
    [0, 0.3],
    [0, -0.3],
  ]) s.cone('#e8c35a', 0.06, 0.14, dx, 24.74, dz, 4, Math.PI / 4);
  // A little raven weathervane.
  s.sphere('#2a2530', 0.22, 0.16, 0.12, 0, 25.4, 0);
  s.sphere('#2a2530', 0.11, 0.11, 0.11, 0.2, 25.55, 0);
  s.cone('#e8c35a', 0.04, 0.14, 0.33, 25.48, 0, 4);
  s.box('#2a2530', 0.16, 0.03, 0.08, -0.22, 25.42, 0, 0, 0, 0.3);
  const front = s.at(0, 0, S / 2 + 0.01);
  archedDoor(front.at(0, 0.3, 0), 1.7, 2.4, '#6a3f2a', '#8f8070');
  for (const sx of [-1, 1]) lantern(front.at(sx * 1.3, 2.7, 0));
  front.cyl('#8f8070', 0.95, 0.1, 0, 7.4, 0.02, 24, Math.PI / 2);
  front.glass.cyl('#c9a24f', 0.8, 0.12, 0, 7.4, 0.05, 24, Math.PI / 2);
  front.glass.cyl('#b84f5a', 0.35, 0.14, 0, 7.4, 0.08, 16, Math.PI / 2);
  for (let k = 0; k < 4; k++) front.box('#8f8070', 0.05, 1.6, 0.04, 0, 7.4, 0.12, 0, 0, (k / 4) * Math.PI);
  wallWindow(front.at(0, 4.6, 0), 0.5, 1.2, '#8f8070', '#4f6fb8', false);
  // Steps with a worn lip, and an iron boot scraper.
  s.block(STONE, 3.0, 0.15, 1.0, 0, 0, S / 2 + 0.5);
  s.block(STONE, 2.4, 0.15, 0.6, 0, 0.15, S / 2 + 0.3);
  s.box(shade(STONE, -0.08), 3.0, 0.04, 0.08, 0, 0.15, S / 2 + 1.0);
  s.box(IRON, 0.3, 0.12, 0.03, 1.6, 0.21, S / 2 + 0.85);
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
  // Spiked finials on the posts, and a little gate at the front.
  for (const sx of [-1, 1]) for (let z = -hd; z <= hd; z += 1.0) p.cone(IRON, 0.05, 0.14, sx * hw, 0.8, z, 4, Math.PI / 4);
  for (const sx of [-1, 1]) {
    p.block(IRON, 0.07, 1.0, 0.07, sx * 0.55, 0, hd);
    p.ico(IRON, 0.07, sx * 0.55, 1.05, hd, 1);
  }
  for (let x = -0.4; x <= 0.4; x += 0.2) p.block(IRON, 0.03, 0.75, 0.03, x, 0, hd + 0.02);
  p.box(IRON, 1.0, 0.04, 0.04, 0, 0.72, hd + 0.02);
  p.box(IRON, 1.0, 0.04, 0.04, 0, 0.2, hd + 0.02);
  p.torus(IRON, 0.12, 0.02, 0, 0.5, hd + 0.02, 0, 0);
  for (let i = 0; i < 8; i++) {
    const x = (i % 2 ? 0.9 : -0.9) + (r() - 0.5) * 0.3;
    const z = -hd + 1.0 + Math.floor(i / 2) * 2.6;
    const c = shade('#a8a196', (r() - 0.5) * 0.1);
    const tilt = (r() - 0.5) * 0.15;
    const kind = r();
    if (kind < 0.3) {
      // A cross on a plinth.
      p.block(shade(c, -0.05), 0.5, 0.12, 0.4, x, 0, z);
      p.box(c, 0.16, 1.0, 0.16, x, 0.6, z, 0, 0, tilt);
      p.box(c, 0.6, 0.16, 0.16, x, 0.85, z, 0, 0, tilt);
    } else if (kind < 0.55) {
      // A tall slab with a pointed top.
      p.box(c, 0.55, 0.95, 0.14, x, 0.47, z, 0, 0, tilt);
      p.prism(c, 0.14, 0.2, 0.55, x, 0.94, z, Math.PI / 2);
      p.box(shade(c, -0.15), 0.3, 0.02, 0.02, x, 0.7, z + 0.08);
      p.box(shade(c, -0.15), 0.3, 0.02, 0.02, x, 0.6, z + 0.08);
    } else {
      // A round-topped stone with a carved border.
      p.box(c, 0.6, 0.75, 0.16, x, 0.37, z, 0, 0, tilt);
      p.cyl(c, 0.3, 0.16, x, 0.75, z, 16, Math.PI / 2);
      p.torus(shade(c, -0.12), 0.22, 0.012, x, 0.75, z + 0.085, 0, 0);
      p.box(shade(c, -0.12), 0.35, 0.02, 0.012, x, 0.5, z + 0.085);
      p.box(shade(c, -0.12), 0.35, 0.02, 0.012, x, 0.4, z + 0.085);
    }
    // A grassy mound in front, with a flower or two and a little moss.
    p.sphere('#7aa85a', 0.38, 0.1, 0.68, x, 0.0, z + 0.75, 10, 4);
    if (r() < 0.6) flowerStem(p, r, x + 0.2, z + 0.5, pick(r, ['#f2a7b8', '#ffffff', '#b494dd']), 0.18);
    if (r() < 0.4) p.blob('#5f8f45', 0.12, x - 0.25, 0.08, z + 0.1, i, 0.4, r() * 3);
  }
  // A weeping tree in the far corner.
  const t = p.at(-hw + 0.9, 0, -hd + 0.9);
  t.taper(WOOD_DARK, 0.7, 0.2, 1.8, 0, 0, 0, 10);
  t.blob('#4f8f45', 1.3, 0, 2.6, 0, 2, 0.8);
  for (let k = 0; k < 8; k++) {
    const a = (k / 8) * Math.PI * 2;
    t.rod('#4f8f45', 0.08, Math.cos(a) * 1.0, 2.4, Math.sin(a) * 1.0, Math.cos(a) * 1.2, 1.2 + r() * 0.4, Math.sin(a) * 1.2, 5);
  }
}

function tavern(p: Paint, r: () => number, smoke: (v: THREE.Vector3) => void) {
  const W = TAVERN.w;
  const D = TAVERN.d;
  const plaster = '#f3ead8';
  const timber = '#5a3d2a';
  const brick = '#b57a5a';
  p.block(STONE_DARK, W + 0.3, 0.35, D + 0.3, 0, 0, 0);
  // Ground floor in brick, laid in courses.
  p.block(brick, W, 3.0, D, 0, 0.3, 0);
  courses(p, W, 3.0, D, 0, 0.3, 0, 0.25, shade(brick, -0.22), false);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) p.block(timber, 0.26, 3.0, 0.26, sx * (W / 2), 0.3, sz * (D / 2));
  // The upper floor overhangs the street, on carved joist ends.
  p.block(plaster, W + 0.4, 2.6, D + 0.5, 0, 3.3, 0);
  p.box(timber, W + 0.5, 0.25, D + 0.6, 0, 3.3, 0);
  p.box(timber, W + 0.5, 0.2, D + 0.6, 0, 5.85, 0);
  for (let x = -W / 2 + 0.5; x < W / 2; x += 1.0) for (const sz of [-1, 1]) p.box(shade(timber, -0.1), 0.18, 0.2, 0.3, x, 3.1, sz * (D / 2 + 0.2));
  const front = p.at(0, 0, (D + 0.5) / 2 + 0.01);
  for (const x of [-5.6, -2.8, 0, 2.8, 5.6]) front.box(timber, 0.18, 2.6, 0.08, x, 4.6, 0);
  for (const x of [-4.2, 4.2]) {
    front.box(timber, 0.14, 3.0, 0.07, x, 4.6, 0, 0, 0, 0.75);
    front.box(timber, 0.14, 3.0, 0.07, x, 4.6, 0, 0, 0, -0.75);
  }
  for (const x of [-1.4, 1.4]) front.box(timber, 0.12, 1.1, 0.07, x, 4.0, 0, 0, 0, x > 0 ? 0.6 : -0.6);
  const back = p.at(0, 0, -(D + 0.5) / 2 - 0.01, Math.PI);
  for (const x of [-5.6, -2.8, 0, 2.8, 5.6]) back.box(timber, 0.18, 2.6, 0.08, x, 4.6, 0);
  for (const x of [-4.2, 1.4]) {
    back.box(timber, 0.12, 2.6, 0.07, x, 4.6, 0, 0, 0, 0.6);
    back.box(timber, 0.12, 2.6, 0.07, x + 2.8, 4.6, 0, 0, 0, -0.6);
  }
  for (const sx of [-1, 1]) {
    const side = p.at(sx * (W / 2 + 0.21), 0, 0, (sx * Math.PI) / 2);
    for (const z of [-2.4, 2.4]) side.box(timber, 0.18, 2.6, 0.08, z, 4.6, 0);
    side.box(timber, 0.12, 2.0, 0.07, -1.2, 4.6, 0, 0, 0, 0.5);
    side.box(timber, 0.12, 2.0, 0.07, 1.2, 4.6, 0, 0, 0, -0.5);
  }
  p.prism(plaster, W + 0.4, 2.8, D + 0.5, 0, 5.9, 0);
  for (const sx of [-1, 1]) {
    const g = p.at(sx * (W / 2 + 0.21), 0, 0, (sx * Math.PI) / 2);
    g.box(timber, 0.14, 2.5, 0.07, 0, 7.1, 0);
    g.box(timber, 0.12, 2.2, 0.07, -1.3, 6.7, 0, 0, 0, 0.4);
    g.box(timber, 0.12, 2.2, 0.07, 1.3, 6.7, 0, 0, 0, -0.4);
  }
  p.roof('#4b3f5f', W + 0.4, D + 0.5, 2.8, 5.9, 0.55, 0.2);
  for (const x of [-3.8, 3.4]) {
    chimney(p, '#9a5a44', 0.8, 3.6, x, 6.0, -1.6, 2);
    smoke(new THREE.Vector3(x, 10.0, -1.6));
  }
  const fg = p.at(0, 0, D / 2 + 0.01);
  archedDoor(fg.at(0, 0.3, 0), 1.7, 2.1, '#6e3f2a', timber);
  for (const x of [-1.4, 1.4]) lantern(fg.at(x, 2.4, 0));
  for (const x of [-3.6, 3.6]) {
    wallWindow(fg.at(x, 1.7, 0), 1.6, 1.1, timber, '#c9d3c0', true, '#5f6f4a');
    windowBox(fg.at(x, 1.0, 0), r, 1.7);
    // A little gable hood over each window.
    fg.box(timber, 2.0, 0.08, 0.5, x, 2.45, 0.2, 0.35);
  }
  for (const x of [-3.6, 0, 3.6]) wallWindow(front.at(x, 4.6, 0), 1.0, 1.0, timber, GLASS, true, '#5f6f4a');
  for (const sx of [-1, 1]) {
    const side = p.at(sx * (W / 2 + 0.01), 0, 0, (sx * Math.PI) / 2);
    wallWindow(side.at(-1.6, 1.7, 0), 1.0, 1.0, timber);
    wallWindow(side.at(1.6, 1.7, 0), 1.0, 1.0, timber);
    wallWindow(p.at(sx * (W / 2 + 0.21), 0, 0, (sx * Math.PI) / 2).at(0, 4.6, 0), 0.9, 0.9, timber);
  }
  // Barrels, crates, a hitching post and a bench out front.
  barrel(p.at(-4.6, 0, D / 2 + 0.9), r);
  barrel(p.at(-3.8, 0, D / 2 + 1.2), r);
  barrel(p.at(-4.2, 0, D / 2 + 2.1), r, true);
  crate(p.at(4.5, 0, D / 2 + 0.9), r);
  crate(p.at(4.6, 0.7, D / 2 + 0.9), r, 0.5);
  p.post(WOOD_DARK, 0.07, 1.0, 5.6, 0, D / 2 + 1.3, 8);
  p.cyl(WOOD_DARK, 0.05, 1.2, 5.6, 1.0, D / 2 + 1.3, 8, 0, 0, Math.PI / 2);
  p.torus(IRON, 0.08, 0.015, 5.3, 0.95, D / 2 + 1.3, 0, Math.PI / 2);
  // A tankard sign on the wall and the bracket the sign hangs from.
  p.box(IRON, 0.08, 0.08, 1.3, 2.6, 3.7, D / 2 + 0.65);
  p.box(IRON, 0.06, 0.6, 0.06, 2.6, 3.4, D / 2 + 0.1);
  p.box(IRON, 0.05, 0.05, 0.5, 2.6, 3.5, D / 2 + 0.3, -0.7);
  p.torus(IRON, 0.07, 0.015, 2.6, 3.62, D / 2 + 1.25, 0, 0);
}

function bakery(p: Paint, r: () => number, smoke: (v: THREE.Vector3) => void) {
  const W = BAKERY.w;
  const D = BAKERY.d;
  const wall = '#f3d4b4';
  const roof = '#c4643f';
  p.block(STONE_DARK, W + 0.3, 0.35, D + 0.3, 0, 0, 0);
  p.block(wall, W, 3.4, D, 0, 0.3, 0);
  // Timber corner posts, a sill course, and dentils under the eaves.
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) p.block('#b98a63', 0.25, 3.4, 0.25, sx * (W / 2), 0.3, sz * (D / 2));
  p.box('#b98a63', W + 0.2, 0.1, D + 0.2, 0, 1.0, 0);
  p.box('#b98a63', W + 0.3, 0.14, D + 0.3, 0, 3.62, 0);
  for (let x = -W / 2 + 0.3; x < W / 2; x += 0.45) for (const sz of [-1, 1]) p.box(shade('#b98a63', -0.08), 0.16, 0.12, 0.16, x, 3.5, sz * (D / 2 + 0.1));
  p.prism(wall, W, 2.4, D, 0, 3.7, 0);
  // Barge boards on the gables with a scalloped edge.
  for (const sx of [-1, 1]) {
    const g = p.at(sx * (W / 2 + 0.05), 0, 0, (sx * Math.PI) / 2);
    g.box('#b98a63', 0.1, 0.16, Math.hypot(2.4, D / 2) + 0.4, 0, 3.7 + 1.2, D / 4 + 0.1, Math.atan2(2.4, D / 2), 0, 0);
    g.box('#b98a63', 0.1, 0.16, Math.hypot(2.4, D / 2) + 0.4, 0, 3.7 + 1.2, -D / 4 - 0.1, -Math.atan2(2.4, D / 2), 0, 0);
  }
  p.roof(roof, W, D, 2.4, 3.7, 0.5, 0.2);
  chimney(p, '#a0523a', 0.9, 3.0, -2.8, 4.0, -1.8, 1);
  smoke(new THREE.Vector3(-2.8, 7.4, -1.8));
  const f = p.at(0, 0, D / 2 + 0.01);
  archedDoor(f.at(0, 0.3, 0), 1.3, 2.0, '#bf5f5f', '#8a5a3a');
  for (const x of [-2.8, 2.8]) {
    wallWindow(f.at(x, 1.65, 0), 2.0, 1.3, '#8a5a3a', '#d6e2e8', true, '#bf5f5f');
    // Loaves and buns in the shop window, on a shelf.
    f.box(shade('#8a5a3a', 0.1), 1.9, 0.05, 0.3, x, 1.02, 0.15);
    for (let k = 0; k < 3; k++) {
      f.sphere('#c98a45', 0.2, 0.13, 0.12, x - 0.6 + k * 0.6, 1.15, 0.12);
      for (const dz of [-0.06, 0.06]) f.box('#f0cf8e', 0.12, 0.012, 0.016, x - 0.6 + k * 0.6, 1.27, 0.12 + dz, 0, 0.5, 0);
    }
    for (let k = 0; k < 2; k++) f.sphere('#d8964e', 0.09, 0.07, 0.09, x - 0.3 + k * 0.6, 1.1, 0.22);
  }
  // A striped awning on iron arms, with a frilled edge.
  const stripes = 12;
  for (let k = 0; k < stripes; k++) {
    const x = -W / 2 + 0.2 + (k + 0.5) * ((W - 0.4) / stripes);
    f.box(k % 2 ? '#fff3e0' : '#e4553f', (W - 0.4) / stripes + 0.01, 0.06, 1.4, x, 2.95, 0.6, 0.45);
  }
  for (let k = 0; k < stripes; k++) {
    const x = -W / 2 + 0.2 + (k + 0.5) * ((W - 0.4) / stripes);
    f.box(k % 2 ? '#fff3e0' : '#e4553f', (W - 0.4) / stripes + 0.01, 0.22, 0.04, x, 2.56, 1.25);
    f.cyl(k % 2 ? '#fff3e0' : '#e4553f', ((W - 0.4) / stripes) * 0.5, 0.04, x, 2.45, 1.25, 12, Math.PI / 2);
  }
  for (const x of [-W / 2 + 0.3, 0, W / 2 - 0.3]) {
    f.box(IRON, 0.05, 0.05, 1.3, x, 3.2, 0.6, 0.45);
    f.box(IRON, 0.05, 0.9, 0.05, x, 2.75, 0.05, -0.6);
  }
  for (const sx of [-1, 1]) {
    const side = p.at(sx * (W / 2 + 0.01), 0, 0, (sx * Math.PI) / 2);
    wallWindow(side.at(0, 1.8, 0), 1.0, 1.0, '#8a5a3a', GLASS, true, '#bf5f5f');
    windowBox(side.at(0, 1.2, 0), r, 1.1);
  }
  // Crates of bread, a milk churn, and a chalkboard on an easel.
  crate(p.at(-3.6, 0, D / 2 + 1.0), r, 0.6);
  for (let k = 0; k < 3; k++) p.sphere('#c98a45', 0.16, 0.1, 0.1, -3.75 + k * 0.15, 0.65, D / 2 + 1.0 + (k - 1) * 0.12);
  p.taper('#9aa0a8', 0.85, 0.22, 0.6, -4.5, 0, D / 2 + 0.8, 12);
  p.cyl('#9aa0a8', 0.24, 0.06, -4.5, 0.62, D / 2 + 0.8, 12);
  p.cyl('#7a8088', 0.1, 0.08, -4.5, 0.69, D / 2 + 0.8, 10);
  p.box('#3a3a3a', 0.7, 0.9, 0.06, 3.6, 0.75, D / 2 + 1.0, -0.2);
  p.box(WOOD, 0.8, 1.0, 0.04, 3.6, 0.75, D / 2 + 0.97, -0.2);
  for (const sx of [-1, 1]) p.box(WOOD, 0.05, 1.2, 0.05, 3.6 + sx * 0.3, 0.6, D / 2 + 0.9, -0.2);
  for (let k = 0; k < 3; k++) p.box('#f6efe0', 0.4 - k * 0.08, 0.025, 0.012, 3.6, 1.0 - k * 0.2, D / 2 + 1.03, -0.2);
  p.box(IRON, 0.08, 0.08, 1.3, 2.3, 3.7, D / 2 + 0.65);
  p.box(IRON, 0.05, 0.05, 0.5, 2.3, 3.5, D / 2 + 0.3, -0.7);
}

function cottage(p: Paint, r: () => number, slot: number, smoke: (v: THREE.Vector3) => void) {
  const W = HOUSE_W;
  const D = HOUSE_D;
  const wall = WALLS[slot % WALLS.length];
  const roof = ROOFS[(slot * 3) % ROOFS.length];
  const trim = TRIMS[slot % TRIMS.length];
  const door = DOORS[(slot * 5) % DOORS.length];
  const shutter = shade(door, -0.08);
  p.block(STONE_DARK, W + 0.25, 0.32, D + 0.25, 0, 0, 0);
  // A stone footing course, then the walls with timber corners and a plate under the eaves.
  p.block(shade(STONE_DARK, 0.08), W + 0.1, 0.5, D + 0.1, 0, 0.3, 0);
  courses(p, W + 0.1, 0.5, D + 0.1, 0, 0.3, 0, 0.25, shade(STONE_DARK, -0.15), false);
  p.block(wall, W, 2.6, D, 0, 0.3, 0);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) p.block(trim, 0.18, 2.6, 0.18, sx * (W / 2), 0.3, sz * (D / 2));
  p.box(trim, W + 0.12, 0.16, D + 0.12, 0, 2.9, 0);
  for (let x = -W / 2 + 0.4; x < W / 2; x += 0.8) for (const sz of [-1, 1]) p.box(shade(trim, -0.08), 0.14, 0.14, 0.2, x, 2.78, sz * (D / 2 + 0.08));
  p.prism(wall, W, 1.7, D, 0, 2.98, 0);
  // A timber pattern on each gable.
  for (const sx of [-1, 1]) {
    const g = p.at(sx * (W / 2 + 0.01), 0, 0, (sx * Math.PI) / 2);
    g.box(trim, 0.12, 1.6, 0.06, 0, 3.75, 0);
    g.box(trim, 0.1, 1.5, 0.06, -0.8, 3.5, 0, 0, 0, 0.55);
    g.box(trim, 0.1, 1.5, 0.06, 0.8, 3.5, 0, 0, 0, -0.55);
    wallWindow(g.at(0, 3.55, 0), 0.4, 0.4, trim, GLASS, false);
  }
  p.roof(roof, W, D, 1.7, 2.98, 0.45, 0.18);
  const cx = slot % 2 ? 1.5 : -1.5;
  chimney(p, '#a8604a', 0.6, 2.4, cx, 2.6, -0.9, 1);
  smoke(new THREE.Vector3(cx, 5.35, -0.9).applyMatrix4(p.m));
  const f = p.at(0, 0, D / 2 + 0.01);
  // The front door: a frame, planks, two cross-battens, hinges, a knob and a letter slot.
  f.box(trim, 1.15, 2.05, 0.06, 0, 1.3, 0.01);
  f.box(door, 0.92, 1.85, 0.1, 0, 1.22, 0.05);
  for (let k = 1; k < 4; k++) f.box(shade(door, -0.16), 0.02, 1.8, 0.02, -0.46 + k * 0.23, 1.22, 0.105);
  f.box(shade(door, -0.1), 0.7, 0.07, 0.04, 0, 1.6, 0.11);
  f.box(shade(door, -0.1), 0.7, 0.07, 0.04, 0, 0.9, 0.11);
  for (const y of [0.9, 1.6]) {
    f.box(IRON, 0.22, 0.05, 0.02, -0.33, y, 0.135);
    f.cyl(IRON, 0.025, 0.14, -0.44, y, 0.12, 8);
  }
  f.sphere('#e8c35a', 0.05, 0.05, 0.05, 0.3, 1.2, 0.12);
  f.box('#e8c35a', 0.18, 0.04, 0.02, 0, 1.35, 0.11);
  f.block(STONE, 1.3, 0.14, 0.55, 0, 0, 0.3);
  f.block(shade(STONE, 0.06), 1.1, 0.08, 0.3, 0, 0.14, 0.18);
  // A little porch roof over the door, on two turned posts.
  f.box(roof, 1.6, 0.1, 0.7, 0, 2.45, 0.32, 0.25);
  f.box(shade(roof, -0.12), 1.7, 0.06, 0.06, 0, 2.54, 0.0);
  for (const sx of [-1, 1]) {
    f.post(trim, 0.05, 2.3, sx * 0.72, 0.14, 0.6, 8);
    f.torus(trim, 0.06, 0.02, sx * 0.72, 1.3, 0.6, Math.PI / 2);
    f.box(trim, 0.06, 0.06, 0.4, sx * 0.72, 2.3, 0.4, 0.5);
  }
  lantern(f.at(0.85, 2.0, 0));
  for (const x of [-1.6, 1.6]) {
    wallWindow(f.at(x, 1.7, 0), 0.85, 0.85, trim, GLASS, true, shutter);
    windowBox(f.at(x, 1.15, 0), r, 1.0);
  }
  for (const sx of [-1, 1]) wallWindow(p.at(sx * (W / 2 + 0.01), 0, 0, (sx * Math.PI) / 2).at(0, 1.7, 0), 0.8, 0.8, trim, GLASS, true, shutter);
  wallWindow(p.at(0, 0, -D / 2 - 0.01, Math.PI).at(0, 1.7, 0), 0.8, 0.8, trim, GLASS, true, shutter);
  // Garden: bushes either side, flowers, a planter, and the name sign's post.
  bush(p.at(-W / 2 - 0.3, 0, D / 2 - 0.2), r, true);
  bush(p.at(W / 2 + 0.3, 0, D / 2 - 0.4), r, r() < 0.5);
  if (r() < 0.6) flowerPatch(p.at(W / 2 + 0.6, 0, D / 2 + 1.6), r);
  {
    const pl = p.at(1.4, 0, D / 2 + 0.55);
    pl.taper('#c06a48', 1.25, 0.22, 0.32, 0, 0, 0, 12);
    pl.cyl('#5a3a2a', 0.2, 0.03, 0, 0.3, 0, 12);
    for (let k = 0; k < 3; k++) flowerStem(pl, r, (k - 1) * 0.1, (r() - 0.5) * 0.1, pick(r, ['#f2a7b8', '#f6d55c', '#e4553f']), 0.5);
  }
  p.post(WOOD_DARK, 0.06, 1.2, -1.75, 0, D / 2 + 1.9, 8);
  if (r() < 0.5) barrel(p.at(-W / 2 - 0.5, 0, -D / 2 + 0.6), r);
  else crate(p.at(-W / 2 - 0.5, 0, -D / 2 + 0.6), r, 0.6);
  // A bird on the ridge, some days.
  if (r() < 0.6) bird(p.at((r() - 0.5) * 3, 2.98 + 1.7 + 0.3, 0, r() * 6), r);
}

function washhouse(p: Paint, r: () => number) {
  const { w, d } = WASHHOUSE;
  // A flagstone floor, turned posts with braces, a plate and a tiled roof.
  p.block('#bdb3a3', w + 0.4, 0.15, d + 0.4, 0, 0, 0);
  for (let x = -w / 2; x < w / 2; x += 0.9) for (let z = -d / 2; z < d / 2; z += 0.9) p.box(shade('#bdb3a3', (((x * 3 + z * 7) % 5) / 5 - 0.5) * 0.08), 0.84, 0.03, 0.84, x + 0.45, 0.16, z + 0.45);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    p.block(WOOD, 0.24, 2.6, 0.24, sx * (w / 2 - 0.2), 0.15, sz * (d / 2 - 0.2));
    p.block(shade(WOOD, -0.1), 0.34, 0.12, 0.34, sx * (w / 2 - 0.2), 0.15, sz * (d / 2 - 0.2));
    p.box(WOOD_DARK, 0.12, 0.9, 0.12, sx * (w / 2 - 0.55), 2.45, sz * (d / 2 - 0.2), 0, 0, sx * 0.7);
  }
  p.box(WOOD_DARK, w, 0.18, 0.2, 0, 2.75, d / 2 - 0.2);
  p.box(WOOD_DARK, w, 0.18, 0.2, 0, 2.75, -d / 2 + 0.2);
  for (const sx of [-1, 1]) p.box(WOOD_DARK, 0.2, 0.18, d - 0.4, sx * (w / 2 - 0.2), 2.75, 0);
  p.prism(WOOD_LIGHT, w - 0.2, 1.1, d - 0.4, 0, 2.84, 0);
  p.roof('#5f7fa8', w, d, 1.3, 2.84, 0.45, 0.16);
  // A pump at the back, with a handle and a spout over a trough.
  p.block('#4a5a6a', 0.3, 1.1, 0.3, 0, 0.15, -d / 2 + 0.5);
  p.cyl('#4a5a6a', 0.2, 0.08, 0, 1.28, -d / 2 + 0.5, 12);
  p.box('#4a5a6a', 0.08, 0.08, 0.5, 0, 1.15, -d / 2 + 0.7);
  p.box('#4a5a6a', 0.06, 0.06, 0.2, 0, 1.05, -d / 2 + 0.95, 0.8);
  p.box('#3a4a5a', 0.06, 0.9, 0.06, -0.2, 1.3, -d / 2 + 0.4, 0, 0, -0.5);
  p.sphere('#c9a24f', 0.05, 0.05, 0.05, -0.42, 1.68, -d / 2 + 0.4);
  p.block(STONE_DARK, 0.9, 0.3, 0.5, 0, 0.15, -d / 2 + 1.0);
  p.box('#8fd0e8', 0.8, 0.02, 0.4, 0, 0.42, -d / 2 + 1.0);
  for (const t of TUBS) {
    const q = p.at(t.x - WASHHOUSE.x, 0.15, t.z - WASHHOUSE.z);
    // Tubs made of staves with iron hoops, full of suds.
    q.taper(WOOD, 0.85, 0.72, 0.62, 0, 0, 0, 16);
    for (let k = 0; k < 16; k++) {
      const a = (k / 16) * Math.PI * 2;
      q.box(shade(WOOD, ((k * 7) % 3) * 0.03 - 0.03), 0.27, 0.62, 0.05, Math.cos(a) * 0.68, 0.31, Math.sin(a) * 0.68, 0, -a, 0.08);
    }
    for (const y of [0.12, 0.48]) q.cyl(IRON, 0.72 - y * 0.12, 0.05, 0, y, 0, 16);
    q.cyl('#8fd0e8', 0.58, 0.02, 0, 0.57, 0, 16);
    for (let k = 0; k < 7; k++) q.ico('#ffffff', 0.07 + r() * 0.07, (r() - 0.5) * 0.75, 0.62, (r() - 0.5) * 0.75, 1);
  }
  // A basket of washing, a washboard, soap on a dish, and a drying rack.
  const b = p.at(0, 0.15, 0.9);
  b.taper('#c9a46a', 1.2, 0.35, 0.35, 0, 0, 0, 12);
  for (let k = 0; k < 12; k++) {
    const a = (k / 12) * Math.PI * 2;
    b.box(shade('#c9a46a', k % 2 ? -0.06 : 0.04), 0.14, 0.33, 0.03, Math.cos(a) * 0.37, 0.17, Math.sin(a) * 0.37, 0, -a, 0.12);
  }
  b.torus('#a8834f', 0.38, 0.02, 0, 0.35, 0, Math.PI / 2);
  b.ico('#f2a7b8', 0.18, -0.1, 0.38, 0, 1);
  b.ico('#8fc1e8', 0.16, 0.12, 0.4, 0.05, 1);
  p.box(WOOD_LIGHT, 0.4, 0.7, 0.05, 1.9, 0.5, -0.8, -0.3);
  for (let k = 0; k < 8; k++) p.box(shade(WOOD_LIGHT, -0.1), 0.34, 0.02, 0.02, 1.9, 0.25 + k * 0.06, -0.8 + 0.03 + k * 0.018, -0.3);
  p.cyl('#e8dcc0', 0.1, 0.02, -1.8, 0.16, 0.9, 12);
  p.box('#f6d55c', 0.12, 0.05, 0.08, -1.8, 0.2, 0.9, 0, 0.4, 0);
  for (const x of [-2.2, -1.2]) p.post(WOOD, 0.03, 1.1, x, 0.15, -1.2, 8);
  for (let k = 0; k < 3; k++) p.cyl(WOOD, 0.015, 1.0, -1.7, 0.6 + k * 0.3, -1.2, 6, 0, 0, Math.PI / 2);
  p.box('#8fc1e8', 0.3, 0.26, 0.02, -1.5, 1.05, -1.2);
  p.box('#f2a7b8', 0.25, 0.2, 0.02, -1.9, 1.08, -1.2);
}

function washingLines(p: Paint) {
  for (const l of LINE_POS) {
    for (const x of [l.x0, l.x1]) {
      p.post(WOOD, 0.08, LINE_Y + 0.2, x, 0, l.z, 8);
      p.box(WOOD, 0.08, 0.08, 0.6, x, LINE_Y + 0.1, l.z);
      p.cone(shade(WOOD, -0.1), 0.1, 0.1, x, LINE_Y + 0.2, l.z, 4, Math.PI / 4);
      // A brace and a stay rope to a peg in the ground.
      p.box(shade(WOOD, -0.08), 0.06, 0.06, 0.4, x, LINE_Y - 0.05, l.z + 0.15, 0.8);
      p.rope('#d8c8a0', 0.012, x, LINE_Y + 0.15, l.z, x + (x < 0 ? -0.9 : 0.9), 0.05, l.z, 0.05, 3);
      p.post(WOOD_DARK, 0.04, 0.18, x + (x < 0 ? -0.9 : 0.9), 0, l.z, 6);
    }
    // The line sags a little between the posts, with a few spare pegs on it.
    p.rope('#efe4cc', 0.015, l.x0, LINE_Y, l.z, l.x1, LINE_Y, l.z, 0.08, 8);
    for (let k = 0; k < 3; k++) {
      const x = l.x0 + 0.5 + k * 0.25;
      p.box('#d8a845', 0.03, 0.09, 0.02, x, LINE_Y - 0.03, l.z);
    }
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
  // Nail heads along the planks, piles under the deck, and a rope rail between the posts.
  for (let i = 0; i < n; i++) {
    const z = z0 + (i + 0.5) * ((z1 - z0) / n);
    for (const sx of [-1, 1]) p.cyl(IRON, 0.012, 0.01, x + sx * (w / 2 - 0.2), 0.106, z, 6);
  }
  for (const sx of [-1, 1]) for (const z of [z0 + 1.8, z1 - 0.15]) {
    p.post(WOOD_DARK, 0.11, 0.75, x + sx * (w / 2 - 0.05), -0.3, z, 10);
    p.torus('#d8c8a0', 0.13, 0.02, x + sx * (w / 2 - 0.05), 0.4, z, Math.PI / 2);
  }
  for (const sx of [-1, 1]) for (const z of [z0 + 0.6, z0 + 3.2]) p.post(shade(WOOD_DARK, -0.1), 0.08, 0.5, x + sx * (w / 2 - 0.05), -0.4, z, 8);
  for (const sx of [-1, 1]) p.rope('#d8c8a0', 0.02, x + sx * (w / 2 - 0.05), 0.42, z0 + 1.8, x + sx * (w / 2 - 0.05), 0.42, z1 - 0.15, 0.12, 6);
  // A bucket, a coil of rope, a mooring ring, a lantern on the end post and a net drying over the rail.
  p.taper('#7a8a9a', 1.2, 0.16, 0.26, x + 0.95, 0.1, z1 - 1.2, 12);
  p.torus('#7a8a9a', 0.17, 0.012, x + 0.95, 0.33, z1 - 1.2, 0, 0);
  p.torus('#d8c8a0', 0.18, 0.05, x - 0.9, 0.14, z1 - 1.6, Math.PI / 2);
  p.torus('#d8c8a0', 0.13, 0.04, x - 0.9, 0.23, z1 - 1.6, Math.PI / 2);
  p.torus(IRON, 0.08, 0.015, x + w / 2 + 0.02, 0.2, z1 - 0.5, 0, Math.PI / 2);
  p.post(IRON, 0.02, 0.6, x - (w / 2 - 0.05), 0.45, z1 - 0.15, 6);
  p.glass.cyl('#fff1c8', 0.08, 0.16, x - (w / 2 - 0.05), 1.1, z1 - 0.15, 6);
  p.cone(IRON, 0.1, 0.08, x - (w / 2 - 0.05), 1.18, z1 - 0.15, 6);
  for (let k = 0; k < 5; k++) p.rope('#c9b89a', 0.008, x + w / 2 - 0.05, 0.42, z0 + 2.0 + k * 0.25, x + w / 2 + 0.5, 0.05, z0 + 2.0 + k * 0.25, 0.02, 2);
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
  // A little rowing boat moored on the far bank, oars shipped.
  {
    const bx = POND.x + POND.rx * 0.62;
    const bz = POND.z + POND.rz * 0.45;
    const boat = p.at(bx, 0.0, bz, 0.9);
    boat.sphere('#8a5a36', 0.5, 0.26, 1.15, 0, 0.12, 0, 12, 6);
    boat.sphere('#5fb6cf', 0.38, 0.16, 1.0, 0, 0.22, 0, 12, 4);
    boat.box('#c49a6c', 0.7, 0.05, 0.14, 0, 0.3, 0.3);
    boat.box('#c49a6c', 0.7, 0.05, 0.14, 0, 0.3, -0.35);
    boat.torus('#6e4a30', 0.5, 0.03, 0, 0.32, 0, Math.PI / 2);
    boat.rod('#c49a6c', 0.02, -0.4, 0.34, 0.5, 0.45, 0.36, -0.6, 6);
    boat.post(WOOD_DARK, 0.06, 0.5, 0.9, 0, 0.9, 8);
    boat.rope('#d8c8a0', 0.012, 0.45, 0.3, 0.6, 0.9, 0.45, 0.9, 0.05, 3);
  }
  for (let i = 0; i < 14; i++) {
    const a = r() * Math.PI * 2;
    const s = 1.0 + r() * 0.1;
    const x = POND.x + Math.cos(a) * POND.rx * s;
    const z = POND.z + Math.sin(a) * POND.rz * s;
    if (Math.abs(x - DOCK.x) < 2.5 && z < POND.z) continue;
    p.blob(shade('#a8a196', (r() - 0.5) * 0.1), 0.12 + r() * 0.1, x, 0.04, z, i, 0.5, r() * 3);
  }
  const base = new Float32Array((geo.getAttribute('position') as THREE.BufferAttribute).array);
  return { mesh, base, material };
}

function flowerBedFrame(p: Paint) {
  const L = BED_LEN;
  const D = BED_DEPTH;
  p.block('#6b4a33', L - 0.1, BED_H - 0.02, D - 0.1, 0, 0, 0);
  // Two boards a side, corner posts with caps, and a little hand trowel left on the edge.
  for (const sz of [-1, 1]) for (let k = 0; k < 2; k++) p.block(shade(WOOD, k ? 0.04 : -0.02), L + 0.1, (BED_H + 0.05) / 2 - 0.015, 0.14, 0, k * ((BED_H + 0.05) / 2), sz * (D / 2));
  for (const sx of [-1, 1]) for (let k = 0; k < 2; k++) p.block(shade(WOOD, k ? 0.04 : -0.02), 0.14, (BED_H + 0.05) / 2 - 0.015, D, sx * (L / 2), k * ((BED_H + 0.05) / 2), 0);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    p.block(WOOD_DARK, 0.2, BED_H + 0.22, 0.2, sx * (L / 2), 0, sz * (D / 2));
    p.cone(shade(WOOD_DARK, -0.08), 0.14, 0.1, sx * (L / 2), BED_H + 0.22, sz * (D / 2), 4, Math.PI / 4);
  }
  for (let i = 0; i < 10; i++) p.sphere('#5e4130', 0.18, 0.06, 0.15, -L / 2 + 0.3 + i * 0.47, BED_H - 0.02, ((i * 13) % 5) * 0.08 - 0.16, 10, 5);
  p.box('#9aa0a8', 0.08, 0.02, 0.2, L / 2 - 0.5, BED_H + 0.06, D / 2, 0, 0.4, 0);
  p.cyl('#a8463f', 0.02, 0.14, L / 2 - 0.5, BED_H + 0.07, D / 2 + 0.16, 8, Math.PI / 2, 0.4, 0);
}

function well(p: Paint) {
  // A ring of stone blocks laid in three courses, a dark shaft inside, water glinting at the bottom.
  p.cyl('#a99c89', 1.0, 0.85, 0, 0.425, 0, 20);
  for (let c = 0; c < 3; c++) {
    const n = 12;
    for (let k = 0; k < n; k++) {
      const a = ((k + (c % 2) * 0.5) / n) * Math.PI * 2;
      p.box(shade('#a99c89', ((k * 5 + c * 3) % 4) * 0.03 - 0.05), 0.46, 0.24, 0.16, Math.cos(a) * 0.98, 0.15 + c * 0.28, Math.sin(a) * 0.98, 0, -a, 0);
    }
  }
  p.cyl('#bfb2a0', 1.08, 0.12, 0, 0.88, 0, 20);
  p.torus('#b3a593', 1.06, 0.03, 0, 0.95, 0, Math.PI / 2);
  p.cyl('#1a2028', 0.78, 0.9, 0, 0.5, 0, 20);
  p.cyl('#2f4a5a', 0.76, 0.04, 0, 0.34, 0, 20);
  // The frame, with braces, a windlass with a crank handle and rope wound on it.
  for (const sx of [-1, 1]) {
    p.block(WOOD_DARK, 0.14, 2.1, 0.14, sx * 0.85, 0.85, 0);
    p.box(shade(WOOD_DARK, -0.08), 0.1, 0.7, 0.1, sx * 0.72, 1.3, 0, 0, 0, sx * 0.55);
    p.box(IRON, 0.2, 0.06, 0.06, sx * 0.85, 0.95, 0.09);
  }
  p.cyl(WOOD, 0.07, 1.8, 0, 2.15, 0, 12, 0, 0, Math.PI / 2);
  for (let k = 0; k < 7; k++) p.torus('#d8c8a0', 0.08, 0.016, -0.1 + k * 0.045, 2.15, 0, 0, Math.PI / 2);
  p.cyl(IRON, 0.03, 0.3, 1.0, 2.15, 0, 8, 0, 0, Math.PI / 2);
  p.cyl(IRON, 0.03, 0.4, 1.13, 2.35, 0, 8);
  p.cyl(WOOD_LIGHT, 0.04, 0.3, 1.0, 2.55, 0, 8, 0, 0, Math.PI / 2);
  p.prism(WOOD_LIGHT, 2.1, 0.7, 1.6, 0, 2.7, 0, Math.PI / 2);
  p.roof('#7b4f7a', 1.6, 2.0, 0.8, 2.6, 0.2, 0.1, 0, 0, Math.PI / 2);
  // The bucket hanging on its rope, with a handle.
  p.taper('#8a6a4a', 1.2, 0.18, 0.28, 0.2, 1.5, 0, 12);
  p.cyl('#5a4030', 0.19, 0.03, 0.2, 1.78, 0, 12);
  p.cyl('#5a4030', 0.16, 0.03, 0.2, 1.52, 0, 12);
  p.torus('#9aa0a8', 0.17, 0.012, 0.2, 1.82, 0, 0, 0);
  p.cyl('#d8c8a0', 0.01, 0.35, 0.2, 2.0, 0, 4);
  // A dipper on a hook and a few stones round the foot.
  p.cyl('#9aa0a8', 0.06, 0.08, -0.95, 1.75, 0.12, 10);
  p.cyl('#9aa0a8', 0.012, 0.25, -0.95, 1.9, 0.12, 6);
  for (let k = 0; k < 6; k++) {
    const a = (k / 6) * Math.PI * 2 + 0.3;
    p.blob('#a49d93', 0.12, Math.cos(a) * 1.25, 0.03, Math.sin(a) * 1.25, k, 0.5, a);
  }
}

function woodpile(p: Paint, r: () => number) {
  // A chopping block with an axe in it, and split logs stacked beside.
  p.cyl('#7a5236', 0.32, 0.45, -0.6, 0.225, 0, 14);
  p.cyl('#c49a6c', 0.3, 0.03, -0.6, 0.465, 0, 14);
  p.torus('#a8834f', 0.2, 0.01, -0.6, 0.485, 0, Math.PI / 2);
  p.torus('#a8834f', 0.1, 0.01, -0.6, 0.485, 0, Math.PI / 2);
  // The axe: a wedge head bitten into the block, on a hickory handle.
  p.box(IRON, 0.05, 0.22, 0.16, -0.5, 0.58, 0, 0, 0, 0.5);
  p.box(shade(IRON, 0.25), 0.012, 0.2, 0.14, -0.47, 0.6, 0, 0, 0, 0.5);
  p.cyl('#c49a6c', 0.025, 0.6, -0.33, 0.88, 0, 8, 0, 0, 1.1);
  p.cyl(shade('#c49a6c', -0.2), 0.028, 0.08, -0.08, 1.0, 0, 8, 0, 0, 1.1);
  for (let row = 0; row < 3; row++) {
    for (let i = 0; i < 4 - row; i++) {
      const x = 0.15 + i * 0.2 + row * 0.1;
      const c = shade('#9a6a43', (r() - 0.5) * 0.08);
      p.cyl(c, 0.1, 0.5, x, 0.1 + row * 0.17, 0, 10, Math.PI / 2);
      p.cyl(shade(c, 0.18), 0.085, 0.015, x, 0.1 + row * 0.17, 0.255, 10, Math.PI / 2);
      p.cyl(shade(c, 0.18), 0.085, 0.015, x, 0.1 + row * 0.17, -0.255, 10, Math.PI / 2);
    }
  }
  // Chips and a couple of split halves on the ground.
  for (let k = 0; k < 6; k++) p.box('#c49a6c', 0.08, 0.02, 0.04, -0.6 + (r() - 0.5) * 1.0, 0.01, (r() - 0.5) * 1.0, 0, r() * 3, 0);
  p.cyl('#9a6a43', 0.09, 0.4, -1.0, 0.05, 0.4, 10, Math.PI / 2, 0.5, 0);
}

function noticeboard(p: Paint, r: () => number) {
  for (const sx of [-1, 1]) {
    p.post(WOOD_DARK, 0.08, 2.2, sx * 0.85, 0, 0, 10);
    p.cone(shade(WOOD_DARK, -0.08), 0.1, 0.1, sx * 0.85, 2.2, 0, 4, Math.PI / 4);
    p.block(shade(WOOD_DARK, -0.1), 0.2, 0.1, 0.2, sx * 0.85, 0, 0);
  }
  p.box(WOOD, 1.8, 1.1, 0.08, 0, 1.45, 0);
  p.box(shade(WOOD, -0.12), 1.86, 0.06, 0.1, 0, 0.9, 0);
  p.box(shade(WOOD, -0.12), 1.86, 0.06, 0.1, 0, 2.0, 0);
  p.box('#7a6a5a', 1.6, 0.9, 0.02, 0, 1.45, 0.04);
  // A little tiled roof over the board, and a plaque.
  p.roof('#5a4636', 1.9, 0.6, 0.25, 2.05, 0.1, 0.06, 0, 0, 0);
  p.box('#c9a24f', 0.6, 0.12, 0.02, 0, 0.99, 0.05);
  for (let k = 0; k < 3; k++) p.box('#3b2a36', 0.12, 0.03, 0.01, -0.18 + k * 0.18, 0.99, 0.065);
  const notes = ['#fff7e0', '#ffe9a8', '#f8d0d8', '#d8ecf8', '#e0f2d8'];
  for (let i = 0; i < 6; i++) {
    const x = -0.6 + (i % 3) * 0.6 + (r() - 0.5) * 0.1;
    const y = 1.7 - Math.floor(i / 3) * 0.48;
    const tilt = (r() - 0.5) * 0.2;
    p.box(pick(r, notes), 0.42, 0.36, 0.02, x, y, 0.05, 0, 0, tilt);
    for (let l = 0; l < 4; l++) p.box('#6b5a48', 0.26 - (l === 3 ? 0.1 : 0), 0.012, 0.01, x - 0.02 + Math.sin(tilt) * (0.1 - l * 0.07), y + 0.09 - l * 0.07, 0.065, 0, 0, tilt);
    p.sphere(pick(r, ['#e4553f', '#4f6fb8', '#f6d55c']), 0.025, 0.025, 0.025, x, y + 0.14, 0.07, 8, 6);
  }
  lantern(p.at(0.85, 1.9, 0.06));
}

function gate(p: Paint) {
  for (const sx of [-1, 1]) {
    p.block('#b3a58f', 0.75, 2.8, 0.75, sx * 2.6, 0, 0);
    courses(p, 0.75, 2.8, 0.75, sx * 2.6, 0, 0, 0.4, '#9c907c', false);
    p.block('#9a8c78', 0.95, 0.2, 0.95, sx * 2.6, 0, 0);
    p.block('#9a8c78', 0.9, 0.25, 0.9, sx * 2.6, 2.8, 0);
    p.sphere('#cdbda6', 0.28, 0.28, 0.28, sx * 2.6, 3.3, 0, 14, 10);
    // A lantern on each pier.
    p.glass.cyl('#fff1c8', 0.12, 0.3, sx * 2.6, 3.85, 0, 6);
    p.cyl(IRON, 0.14, 0.03, sx * 2.6, 3.7, 0, 6);
    p.cone(IRON, 0.16, 0.12, sx * 2.6, 4.0, 0, 6);
    p.post(IRON, 0.02, 0.15, sx * 2.6, 3.56, 0, 6);
  }
  p.box(WOOD_DARK, 5.9, 0.28, 0.3, 0, 3.0, 0);
  for (const sx of [-1, 1]) p.box(IRON, 0.05, 0.5, 0.05, sx * 1.1, 2.62, 0);
  // Iron scrollwork over the beam.
  for (let k = -2; k <= 2; k++) p.torus(IRON, 0.18, 0.02, k * 0.9, 3.3, 0, 0, 0);
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
  add(GRAVEYARD.x, GRAVEYARD.z, 7);
  add(TAVERN.x, TAVERN.z, 9);
  add(BAKERY.x, BAKERY.z, 8);
  add(WASHHOUSE.x, WASHHOUSE.z, 6);
  for (const l of LINE_POS) for (let x = l.x0; x <= l.x1; x += 2) add(x, l.z, 2.2);
  add(POND.x, POND.z, 10.5);
  for (const h of houseSlots) add(h.x, h.z, 6);
  for (const bd of beds) add(bd.x, bd.z, 4);
  add(WELL.x, WELL.z, 3);
  add(WOODPILE.x, WOODPILE.z, 2.5);
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
  // Big things that can hide a player get a mesh each, so they can be faded on their own.
  const solos: Builder[] = [];
  const solo = (x: number, z: number, ry = 0) => {
    const main = new Builder();
    solos.push(main);
    return new Paint({ main, glass }, frame(x, z, ry));
  };

  group.add(groundMesh(), cobbleMesh(), pathMesh());

  // The clock tower.
  const tower = clockTower(solo(0, 0));
  // Public buildings.
  church(solo(CHURCH.x, CHURCH.z, CHURCH.ry));
  graveyard(painter(GRAVEYARD.x, GRAVEYARD.z), r);
  colliders.push({ kind: 'box', x: GRAVEYARD.x, z: GRAVEYARD.z, hw: GRAVEYARD.hw + 0.1, hd: GRAVEYARD.hd + 0.1, rot: 0 });
  tavern(solo(TAVERN.x, TAVERN.z, TAVERN.ry), r, (v) => smoke(v.applyMatrix4(frame(TAVERN.x, TAVERN.z, TAVERN.ry))));
  bakery(solo(BAKERY.x, BAKERY.z, BAKERY.ry), r, (v) => smoke(v.applyMatrix4(frame(BAKERY.x, BAKERY.z, BAKERY.ry))));
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
  washhouse(solo(WASHHOUSE.x, WASHHOUSE.z), r);
  washingLines(painter(0, 0));
  dock(painter(0, 0));
  const water = pond(group, painter(0, 0), r);
  for (const b of beds) flowerBedFrame(painter(b.x, b.z, b.ry));
  for (const b of benches) bench(painter(b.x, b.z, b.ry));
  for (const l of [...squareLamps, ...roadLamps, ...pathLamps]) lampPost(painter(l.x, l.z));
  well(painter(WELL.x, WELL.z));
  woodpile(painter(WOODPILE.x, WOODPILE.z, WOODPILE.ry), r);
  noticeboard(painter(NOTICEBOARD.x, NOTICEBOARD.z), r);
  gate(painter(0, GATE_Z));

  // Cottages.
  houseSlots.forEach((h, i) => {
    cottage(solo(h.x, h.z, h.ry), rng(500 + i), i, smoke);
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
    // Trees inside the fence get roots, branches and cones; the forest beyond keeps it simpler.
    if (kind < 0.42) pineTree(p, r, collide);
    else roundTree(p, r, kind > 0.9, collide);
    if (collide && r() < 0.3) {
      const a = r() * Math.PI * 2;
      mushroom(painter(x + Math.cos(a) * 0.6, z + Math.sin(a) * 0.6, r() * 6), r);
    }
    trees.push({ x, z, r: 2 });
    if (collide) colliders.push({ kind: 'circle', x, z, r: 0.45 });
  };
  // Forest ring outside the fence.
  let placed = 0;
  for (let k = 0; k < 2400 && placed < 430; k++) {
    const a = r() * Math.PI * 2;
    const rad = TOWN_R + 4 + Math.pow(r(), 0.8) * 55;
    const x = rad * Math.sin(a);
    const z = -rad * Math.cos(a);
    if (z > TOWN_R - 3 && Math.abs(x) < 5) continue;
    if (trees.some((t) => Math.hypot(t.x - x, t.z - z) < 2.6)) continue;
    placeTree(x, z, false);
    placed++;
  }
  // Inside town, in the gaps.
  for (let k = 0; k < 900 && placed < 520; k++) {
    const a = r() * Math.PI * 2;
    const rad = 14 + r() * (TOWN_R - 16);
    const x = rad * Math.sin(a);
    const z = -rad * Math.cos(a);
    if (!free(x, z, block, 1.4, 2.2)) continue;
    if (trees.some((t) => Math.hypot(t.x - x, t.z - z) < 3.4)) continue;
    placeTree(x, z, true);
    placed++;
  }
  for (let k = 0; k < 900; k++) {
    const a = r() * Math.PI * 2;
    const rad = 12 + r() * (TOWN_R - 14);
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
    const rad = TOWN_R + 2 + r() * 45;
    const p = painter(rad * Math.sin(a), -rad * Math.cos(a), r() * 6);
    const kind = r();
    if (kind < 0.4) bush(p, r);
    else if (kind < 0.7) rock(p, r, 0.8 + r());
    else mushroom(p, r);
  }

  // Cobbles along the edges of the paths, skipping where paths cross.
  {
    const inside = (x: number, z: number, except: number) => {
      for (let i = 0; i < PATHS.length; i++) {
        if (i === except) continue;
        const [x0, z0, x1, z1] = PATHS[i].seg;
        const dx = x1 - x0;
        const dz = z1 - z0;
        const l2 = dx * dx + dz * dz || 1;
        const t = THREE.MathUtils.clamp(((x - x0) * dx + (z - z0) * dz) / l2, 0, 1);
        if (Math.hypot(x - (x0 + dx * t), z - (z0 + dz * t)) < PATHS[i].w / 2 + 0.05) return true;
      }
      return false;
    };
    const stones = ['#b8ab98', '#a99c89', '#c4b7a3'];
    PATHS.forEach(({ seg, w }, index) => {
      const [x0, z0, x1, z1] = seg;
      const len = Math.hypot(x1 - x0, z1 - z0);
      const nx = -(z1 - z0) / len;
      const nz = (x1 - x0) / len;
      const n = Math.max(1, Math.round(len / 0.6));
      for (let k = 0; k < n; k++) {
        const t = (k + 0.5) / n;
        for (const side of [-1, 1]) {
          if (r() < 0.25) continue;
          const d = side * (w / 2 + 0.12 + (r() - 0.5) * 0.08);
          const x = x0 + (x1 - x0) * t + nx * d;
          const z = z0 + (z1 - z0) * t + nz * d;
          if (Math.hypot(x, z) < SQUARE_R + 0.6 || inside(x, z, index)) continue;
          painter(x, z).ico(shade(pick(r, stones), (r() - 0.5) * 0.06), 0.1 + r() * 0.05, 0, 0.03, 0, 0, 0.5, r() * 3);
        }
      }
    });
  }
  // Birds on the ridges of the tavern, the bakery and the church.
  for (const [b, y, n] of [
    [TAVERN, 5.9 + 2.8 + 0.32, 2],
    [BAKERY, 3.7 + 2.4 + 0.3, 1],
    [CHURCH, 6.9 + 4.6 + 0.34, 2],
  ] as [{ x: number; z: number; ry: number; w: number; d: number }, number, number][]) {
    for (let k = 0; k < n; k++) {
      const along = b === CHURCH ? 0 : (r() - 0.5) * b.w * 0.6;
      const across = b === CHURCH ? (r() - 0.5) * b.d * 0.5 : 0;
      const w = local(b.x, b.z, b.ry, along, across);
      bird(painter(w.x, w.z, r() * 6).at(0, y, 0), r);
    }
  }

  // Merge everything.
  const main = matte();
  for (const l of chunks.values()) {
    if (l.main.empty) continue;
    const m = l.main.mesh(main);
    m.name = 'chunk';
    group.add(m);
  }
  const occluders: THREE.Mesh[] = [];
  for (const b of solos) {
    if (b.empty) continue;
    const mat = matte();
    mat.transparent = true;
    const m = b.mesh(mat);
    m.name = 'building';
    group.add(m);
    occluders.push(m);
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
      b.add(G.box(), '#2a211c', { pos: [0, len / 2 - 0.08, 0], scale: [w, len, 0.012] });
      b.add(G.cyl(6), '#2a211c', { pos: [0, 0, 0], scale: [0.07, 0.02, 0.07], rot: [Math.PI / 2, 0, 0] });
      const mesh = b.mesh(handMat, { cast: false });
      holder.add(mesh);
      return mesh;
    };
    const hour = make(0.55, 0.08);
    const minute = make(0.85, 0.05);
    minute.position.z = 0.014;
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
  // A proper banner on a tall pole, so it reads as a flag from the ground: wine red with a gold raven.
  const flag = new THREE.Group();
  flag.position.set(0, 19.9, 0);
  {
    const b = new Builder();
    b.add(G.cyl(6), '#4a3a2a', { pos: [0, 0.1, 0], scale: [0.05, 2.4, 0.05] });
    b.add(G.sphere(6, 4), '#e8c35a', { pos: [0, 1.32, 0], scale: 0.12 });
    b.add(G.box(), '#8a3a5a', { pos: [0.95, 0.65, 0], scale: [1.8, 1.1, 0.03] });
    b.add(G.box(), '#e8c35a', { pos: [0.95, 0.12, 0], scale: [1.8, 0.1, 0.035] });
    b.add(G.box(), '#e8c35a', { pos: [0.95, 1.18, 0], scale: [1.8, 0.1, 0.035] });
    // The raven: a body, a head and a beak, in gold.
    b.add(G.sphere(6, 4), '#e8c35a', { pos: [0.85, 0.62, 0.03], scale: [0.34, 0.2, 0.02] });
    b.add(G.sphere(6, 4), '#e8c35a', { pos: [1.15, 0.78, 0.03], scale: [0.14, 0.13, 0.02] });
    b.add(G.cone(4), '#e8c35a', { pos: [1.32, 0.78, 0.03], rot: [0, 0, -Math.PI / 2], scale: [0.06, 0.16, 0.02] });
    b.add(G.cone(3), '#e8c35a', { pos: [0.55, 0.52, 0.03], rot: [0, 0, 1.2], scale: [0.12, 0.3, 0.02] });
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

  return { group, colliders, water, clockHands, bell, flag, chimneys, houseSigns, signMaterials, wreaths, pools, lampLights, occluders };
}

