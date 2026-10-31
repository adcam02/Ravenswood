import * as THREE from 'three';
import { toCreasedNormals } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { Builder, SMOOTH_DEG, matte, placeMatrix, rng } from '../build';
import { BOOTHS, type Collider } from '../types';
import { G, Paint, frame, local, pick, shade, smoothMesh, type Layers } from './kit';
import {
  BAKERY,
  CLUB,
  FLATS,
  FLATS_NAME,
  IDEA_BOX,
  ROAD_LOOP,
  ROAD_NARROW,
  BED_DEPTH,
  BED_H,
  BED_LEN,
  CHURCH,
  DAIS,
  DOCK,
  GATE_Z,
  HOUSE_D,
  HOUSE_W,
  LINE_POS,
  LINE_Y,
  MEETING_CENTRE,
  NOTICEBOARD,
  POND,
  POST,
  FAIRY_RING,
  POST_COLS,
  POST_ROWS,
  RING_ROAD_R,
  GRAVEYARD,
  SKIMMING,
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
  GALLERY,
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
import { CASINO } from './casinoLayout';
import { addSway, type GlowSpot } from './fx';
import type { DoorSpot } from './doors';
import { clubFront } from './club';
import { confessional } from './interiors';

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
  /** Where halos go at night: lamps, lanterns, lit windows and the clock faces. */
  glowSpots: GlowSpot[];
  /** Where birds can sit: ridges, lamp tops and bench backs. */
  perches: THREE.Vector3[];
  /** The front doors, for swinging open when someone goes in. */
  doors: DoorSpot[];
  /** The club's neon and marquee bulbs, bright day and night. */
  neon: THREE.Mesh;
}

/** While the town is being built, lamps, lanterns and windows note where their glow goes, and roofs where birds sit. */
let collect: { glow: GlowSpot[]; perches: THREE.Vector3[]; doors: DoorSpot[] } | null = null;
const WARM_GLOW = '#ffb453';
const glowAt = (p: Paint, x: number, y: number, z: number, size: number, color = WARM_GLOW) => {
  if (!collect) return;
  const v = new THREE.Vector3(x, y, z).applyMatrix4(p.m);
  collect.glow.push({ x: v.x, y: v.y, z: v.z, size, color });
};

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
  /** A quad facing `out`: for the upright sides of things, which `quad` can't tell the way of. */
  side(a: THREE.Vector3Like, b: THREE.Vector3Like, c: THREE.Vector3Like, d: THREE.Vector3Like, out: THREE.Vector3Like, color: THREE.ColorRepresentation) {
    const ux = b.x - a.x;
    const uy = b.y - a.y;
    const uz = b.z - a.z;
    const vx = c.x - a.x;
    const vy = c.y - a.y;
    const vz = c.z - a.z;
    const facing = (uy * vz - uz * vy) * out.x + (uz * vx - ux * vz) * out.y + (ux * vy - uy * vx) * out.z;
    const list = facing >= 0 ? [a, b, c, a, c, d] : [a, c, b, a, d, c];
    this.c.set(color);
    for (const p of list) {
      this.pos.push(p.x, p.y, p.z);
      this.col.push(this.c.r, this.c.g, this.c.b);
    }
  }
  /** A triangle with a colour at each corner, so neighbouring triangles blend instead of showing as patches. */
  triC(a: THREE.Vector3Like, b: THREE.Vector3Like, c: THREE.Vector3Like, ca: THREE.Color, cb: THREE.Color, cc: THREE.Color) {
    const d = c;
    const ux = b.x - a.x;
    const uz = b.z - a.z;
    const vx = d.x - a.x;
    const vz = d.z - a.z;
    const ny = uz * vx - ux * vz;
    const list: [THREE.Vector3Like, THREE.Color][] = ny >= 0 ? [[a, ca], [b, cb], [d, cc]] : [[a, ca], [d, cc], [b, cb]];
    for (const [p, col] of list) {
      this.pos.push(p.x, p.y, p.z);
      this.col.push(col.r, col.g, col.b);
    }
  }
  /** The mesh. `smoothDeg` > 0 smooths normals across edges gentler than that (rolling ground, water); 0 keeps facets (cobbles). */
  geometry(smoothDeg = 0): THREE.BufferGeometry {
    let g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(this.pos, 3));
    g.setAttribute('color', new THREE.Float32BufferAttribute(this.col, 3));
    if (smoothDeg > 0 && this.pos.length) {
      const smoothed = toCreasedNormals(g, THREE.MathUtils.degToRad(smoothDeg));
      g.dispose();
      g = smoothed;
    } else g.computeVertexNormals();
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
  // One colour per vertex (not per triangle), so the grass mottles softly instead of showing as a patchwork.
  const colAt = (i: number, j: number) => {
    const jj = ((j % seg) + seg) % seg;
    const list = rings[Math.min(i, rings.length - 1)] < TOWN_R ? grass : far;
    return new THREE.Color(shade(list[Math.floor(hash(jj, i * 3) * list.length)], (hash(i * 7, jj) - 0.5) * 0.05));
  };
  for (let i = 0; i < rings.length - 1; i++) {
    for (let j = 0; j < seg; j++) {
      const a = pt(i, j);
      const b = pt(i, j + 1);
      const c = pt(i + 1, j + 1);
      const d = pt(i + 1, j);
      const ca = colAt(i, j);
      const cb = colAt(i, j + 1);
      const cc = colAt(i + 1, j + 1);
      const cd = colAt(i + 1, j);
      if (i === 0) t.triC(a, c, d, ca, cc, cd);
      else {
        t.triC(a, b, c, ca, cb, cc);
        t.triC(a, c, d, ca, cc, cd);
      }
    }
  }
  // Rolling ground: smooth across the gentle slopes of the hills.
  const mesh = new THREE.Mesh(t.geometry(70), matte());
  mesh.receiveShadow = true;
  mesh.name = 'ground';
  return mesh;
}

/** A point on the square, by distance from the middle and angle round from north. */
const polar = (rad: number, a: number, y: number) => V(rad * Math.sin(a), y, -rad * Math.cos(a));

/**
 * A stone laid in a ring between radii `ra`–`rb` and angles `a0`–`a1`: a flat top with bevelled edges, and sides
 * standing up out of the mortar, so each one catches the light. `top` is the highest point (what animals stand on).
 */
function ringStone(t: Tris, ra: number, rb: number, a0: number, a1: number, top: number, base: number, bevel: number, col: THREE.Color) {
  const mid = (ra + rb) / 2;
  const da = Math.min(bevel / mid, (a1 - a0) / 4);
  const dr = Math.min(bevel, (rb - ra) / 4);
  const edge = top - bevel * 0.4;
  const lo = [polar(ra, a0, edge), polar(ra, a1, edge), polar(rb, a1, edge), polar(rb, a0, edge)];
  const hi = [polar(ra + dr, a0 + da, top), polar(ra + dr, a1 - da, top), polar(rb - dr, a1 - da, top), polar(rb - dr, a0 + da, top)];
  const foot = lo.map((p) => V(p.x, base, p.z));
  t.quad(hi[0], hi[1], hi[2], hi[3], col);
  const bev = shade(col, -0.025);
  const wall = shade(col, -0.07);
  for (let k = 0; k < 4; k++) {
    const n = (k + 1) % 4;
    t.quad(lo[k], lo[n], hi[n], hi[k], bev);
    const out = V((lo[k].x + lo[n].x) / 2 - mid * Math.sin((a0 + a1) / 2), 0, (lo[k].z + lo[n].z) / 2 + mid * Math.cos((a0 + a1) / 2));
    t.side(lo[k], lo[n], foot[n], foot[k], out, wall);
  }
}

function cobbleMesh(): THREE.Mesh {
  const t = new Tris();
  const r = rng(9);
  // Pale mortar underneath, a little below the stones so each one stands up softly.
  const mortar = '#9c907f';
  const MORTAR_Y = 0.025;
  const n0 = 48;
  for (let j = 0; j < n0; j++) {
    const a0 = (j / n0) * Math.PI * 2;
    const a1 = ((j + 1) / n0) * Math.PI * 2;
    t.tri(V(0, MORTAR_Y, 0), polar(SQUARE_R, a0, MORTAR_Y), polar(SQUARE_R, a1, MORTAR_Y), mortar);
  }
  const stones = ['#d3c6b2', '#c8baa5', '#dccfbb', '#bfb19c', '#cdbfa9'];
  let rad = 2.9;
  while (rad < SQUARE_R - 0.2) {
    const w = 0.72;
    const r1 = Math.min(SQUARE_R - 0.05, rad + w);
    const n = Math.max(8, Math.round((Math.PI * 2 * (rad + w / 2)) / 0.85));
    const off = r() * Math.PI;
    for (let j = 0; j < n; j++) {
      const g = 0.05;
      const a0 = off + (j / n) * Math.PI * 2 + g / rad;
      const a1 = off + ((j + 1) / n) * Math.PI * 2 - g / rad;
      // The tops vary between 5 and 6.5 cm, as `groundAt` expects.
      const y = 0.05 + r() * 0.015;
      ringStone(t, rad + g, r1 - g, a0, a1, y, MORTAR_Y, 0.06, shade(pick(r, stones), (r() - 0.5) * 0.04));
    }
    rad = r1;
  }
  // A worn kerb of long stones around the edge, standing proud of the grass outside it.
  const nk = 90;
  for (let j = 0; j < nk; j++) {
    const g = 0.012;
    const a0 = (j / nk) * Math.PI * 2 + g / SQUARE_R;
    const a1 = ((j + 1) / nk) * Math.PI * 2 - g / SQUARE_R;
    ringStone(t, SQUARE_R - 0.05, SQUARE_R + 0.45, a0, a1, 0.07, -0.01, 0.035, shade('#a99c89', (r() - 0.5) * 0.05));
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
  // The ring road, round the back of the church (in shorter pieces where it runs round, for a smoother curve).
  ROAD_LOOP.forEach((a, i) => {
    const b = ROAD_LOOP[(i + 1) % ROAD_LOOP.length];
    const w = ROAD_NARROW(i) ? 1.9 : 2.4;
    const pieces = Math.max(1, Math.round(Math.hypot(b.x - a.x, b.z - a.z) / 2.2));
    for (let k = 0; k < pieces; k++) add(a.x + ((b.x - a.x) * k) / pieces, a.z + ((b.z - a.z) * k) / pieces, a.x + ((b.x - a.x) * (k + 1)) / pieces, a.z + ((b.z - a.z) * (k + 1)) / pieces, w);
  });
  for (const h of houseSlots) {
    const a = local(h.x, h.z, h.ry, 0, HOUSE_D / 2 + 0.2);
    const b = local(h.x, h.z, h.ry, 0, HOUSE_D / 2 + 3.4);
    add(a.x, a.z, b.x, b.z, 1.5);
  }
  // Up to the club's rope, and out to each confession booth among the trees.
  {
    const a = local(CLUB.x, CLUB.z, CLUB.ry, 0, CLUB.d / 2 + 2.2);
    const b = local(CLUB.x, CLUB.z, CLUB.ry, 0, CLUB.d / 2 + 4.0);
    add(a.x, a.z, b.x, b.z, 1.5);
  }
  for (const booth of BOOTHS) {
    if (booth.zone !== 'town') continue;
    const a = local(booth.x, booth.z, booth.ry, 0, 0.9);
    const b = local(booth.x, booth.z, booth.ry, 0, Math.hypot(booth.x, booth.z) - RING_ROAD_R);
    add(a.x, a.z, b.x, b.z, 1.3);
  }
  {
    const a = local(CASINO.x, CASINO.z, CASINO.ry, 0, CASINO.d / 2 + 0.2);
    const b = local(CASINO.x, CASINO.z, CASINO.ry, 0, CASINO.d / 2 + 4.4);
    add(a.x, a.z, b.x, b.z, 1.8);
  }
  {
    const a = local(FLATS.x, FLATS.z, FLATS.ry, 0, FLATS.d / 2 + 0.2);
    const b = local(FLATS.x, FLATS.z, FLATS.ry, 0, FLATS.d / 2 + 3.6);
    add(a.x, a.z, b.x, b.z, 1.8);
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

const PEBBLES = ['#b8ad9c', '#a59a8a', '#c9bfae', '#958c7f', '#bcae96'];

/** A low, lumpy stone of radius about `rad` with its top `h` above the ground, faceted so it catches the light. */
function pebble(t: Tris, r: () => number, x: number, z: number, rad: number, h: number, col: THREE.Color) {
  const n = 6;
  const turn = r() * Math.PI;
  const stretch = 0.75 + r() * 0.5;
  const ring = (k: number, rr: number, y: number) => {
    const a = turn + (k / n) * Math.PI * 2;
    const wob = rr * (0.85 + hash(x * 13 + k, z * 7) * 0.3);
    return V(x + Math.cos(a) * wob * stretch, y, z + Math.sin(a) * wob);
  };
  const base = Array.from({ length: n }, (_, k) => ring(k, rad, 0.015));
  const top = Array.from({ length: n }, (_, k) => ring(k, rad * 0.6, h * 0.8));
  const peak = V(x, h, z);
  const dark = shade(col, -0.1);
  for (let k = 0; k < n; k++) {
    const m = (k + 1) % n;
    t.quad(base[k], base[m], top[m], top[k], dark);
    t.tri(top[k], top[m], peak, col);
  }
}

/** A path's ends moved out to the edge of the square's kerb, where one lies inside it. */
function outsideSquare([x0, z0, x1, z1]: number[]): number[] {
  const R = SQUARE_R + 0.2;
  const dx = x1 - x0;
  const dz = z1 - z0;
  // Where along the path it crosses the kerb's circle (|p0 + t d| = R), if it does.
  const a = dx * dx + dz * dz;
  const b = 2 * (x0 * dx + z0 * dz);
  const c = x0 * x0 + z0 * z0 - R * R;
  const disc = b * b - 4 * a * c;
  if (!a || disc <= 0) return [x0, z0, x1, z1];
  const t1 = (-b + Math.sqrt(disc)) / (2 * a);
  const t2 = (-b - Math.sqrt(disc)) / (2 * a);
  let from = 0;
  let to = 1;
  if (Math.hypot(x0, z0) < R) from = Math.max(t1, t2);
  if (Math.hypot(x1, z1) < R) to = Math.min(t1, t2);
  if (to <= from) return [x0, z0, x1, z1];
  return [x0 + dx * from, z0 + dz * from, x0 + dx * to, z0 + dz * to];
}

function pathMesh(): THREE.Mesh {
  const t = new Tris();
  const r = rng(21);
  const dirt = ['#d9bd8f', '#d2b484', '#dcc296', '#cfb07f'];
  PATHS.forEach(({ seg, w }, index) => {
    const lift = index * 0.00012;
    // A path starting in the square stops just under the kerb, so the dirt never shows between the paving stones.
    const [x0, z0, x1, z1] = outsideSquare(seg);
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
    // Stones pressed into the dirt, more of them along the edges where feet don't wear them away.
    const count = Math.round(len * 1.3);
    for (let k = 0; k < count; k++) {
      const along = r();
      const side = (r() < 0.5 ? -1 : 1) * Math.sqrt(r()) * (w / 2) * 0.92;
      const x = x0 + (x1 - x0) * along + nx * side;
      const z = z0 + (z1 - z0) * along + nz * side;
      if (Math.hypot(x, z) < SQUARE_R + 0.7 || Math.hypot(x, z) > TOWN_R - 2) continue;
      if (Math.hypot(x - MEETING_CENTRE.x, z - MEETING_CENTRE.z) < DAIS.r1 + 0.4) continue;
      const flat = r() < 0.15;
      pebble(t, r, x, z, flat ? 0.18 + r() * 0.1 : 0.05 + r() * 0.09, flat ? 0.035 : 0.03 + r() * 0.035, shade(pick(r, PEBBLES), (r() - 0.5) * 0.06));
    }
  });
  const mesh = new THREE.Mesh(t.geometry(), matte());
  mesh.receiveShadow = true;
  mesh.name = 'paths';
  return mesh;
}

/** Darkens a building's walls a little towards the ground, where less light reaches, so it sits solidly in the grass. */
function shadeFoot(geo: THREE.BufferGeometry, height = 0.8, dark = 0.2) {
  const pos = geo.getAttribute('position');
  const col = geo.getAttribute('color');
  if (!pos || !col) return;
  for (let i = 0; i < pos.count; i++) {
    const k = 1 - dark * (1 - smooth(0, height, pos.getY(i)));
    col.setXYZ(i, col.getX(i) * k, col.getY(i) * k, col.getZ(i) * k);
  }
  col.needsUpdate = true;
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
  // Clear and frosted glass glows warm at night; stained glass glows in its own colours.
  const clear = glass === GLASS || glass === '#c9d3c0' || glass === '#d6e2e8';
  glowAt(p, 0, 0, 0.25, Math.max(w, h) * 1.1 + 0.2, clear ? '#94622e' : `#${shade(glass, -0.12).getHexString()}`);
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

/** A front door that swings open when someone goes in (see doors.ts): `p` at its foot, on the wall. */
const doorAt = (p: Paint, w: number, h: number, color: THREE.ColorRepresentation, arched: boolean) => {
  collect?.doors.push({ m: p.m.clone(), w, h, color: `#${new THREE.Color(color).getHexString()}`, arched });
};

function archedDoor(p: Paint, w: number, h: number, color: THREE.ColorRepresentation, trim: THREE.ColorRepresentation) {
  doorAt(p, w, h, color, true);
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
  glowAt(p, 0, -0.21, 0.28, 1.5, '#ffc46b');
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
    // Turn to the wall first, then step out to it, so each side gets its own dial.
    const f = p.at(0, 0, 0, (k * Math.PI) / 2).at(0, 9.8, 1.9);
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

/** Where the gate in the churchyard's railing opens (half its width), at the front, facing the square. */
const GRAVE_GATE = 0.75;

/** The churchyard: returns where its old stones and its tree stand (its own coordinates), to walk round. */
function graveyard(p: Paint, r: () => number): { x: number; z: number; r: number }[] {
  // A quiet corner beside the church, with a low iron railing and its gate standing open.
  const hw = 2.2;
  const hd = 5.6;
  const solid: { x: number; z: number; r: number }[] = [];
  for (const sx of [-1, 1]) {
    for (let z = -hd; z < hd; z += 0.5) p.block(IRON, 0.05, 0.8, 0.05, sx * hw, 0, z);
    p.box(IRON, 0.06, 0.06, hd * 2, sx * hw, 0.72, 0);
  }
  for (const sz of [-1, 1]) {
    for (let x = -hw; x < hw; x += 0.5) if (sz < 0 || Math.abs(x) > GRAVE_GATE) p.block(IRON, 0.05, 0.8, 0.05, x, 0, sz * hd);
    if (sz < 0) p.box(IRON, hw * 2, 0.06, 0.06, 0, 0.72, sz * hd);
    else for (const sx of [-1, 1]) p.box(IRON, hw - GRAVE_GATE, 0.06, 0.06, (sx * (hw + GRAVE_GATE)) / 2, 0.72, hd);
  }
  // Spiked finials on the posts, and the gate swung right open against the railing.
  for (const sx of [-1, 1]) for (let z = -hd; z <= hd; z += 1.0) p.cone(IRON, 0.05, 0.14, sx * hw, 0.8, z, 4, Math.PI / 4);
  for (const sx of [-1, 1]) {
    p.block(IRON, 0.07, 1.0, 0.07, sx * GRAVE_GATE, 0, hd);
    p.ico(IRON, 0.07, sx * GRAVE_GATE, 1.05, hd, 1);
  }
  const gate = -GRAVE_GATE - 0.5;
  for (let x = -0.4; x <= 0.4; x += 0.2) p.block(IRON, 0.03, 0.75, 0.03, gate + x, 0, hd + 0.1);
  p.box(IRON, 1.0, 0.04, 0.04, gate, 0.72, hd + 0.1);
  p.box(IRON, 1.0, 0.04, 0.04, gate, 0.2, hd + 0.1);
  p.torus(IRON, 0.12, 0.02, gate, 0.5, hd + 0.1, 0, 0);
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
    solid.push({ x, z, r: 0.3 });
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
  solid.push({ x: -hw + 0.9, z: -hd + 0.9, r: 0.4 });
  return solid;
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
  // The hanging sign's bracket, off the front corner post: past the end of the awning, and under the eaves.
  p.box(IRON, 0.08, 0.08, 1.3, W / 2 + 0.12, 3.28, D / 2 + 0.65);
  p.box(IRON, 0.05, 0.05, 0.5, W / 2 + 0.12, 3.08, D / 2 + 0.3, -0.7);
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
  // Timbering on each gable: a king post, a collar beam, and two rafters that run just under the roof line
  // (so nothing pokes out through the tiles).
  for (const sx of [-1, 1]) {
    const g = p.at(sx * (W / 2 + 0.01), 0, 0, (sx * Math.PI) / 2);
    const base = 2.98;
    const rise = 1.7;
    const halfD = D / 2;
    g.box(trim, 0.12, rise - 0.3, 0.06, 0, base + (rise - 0.3) / 2 + 0.02, 0);
    const collarY = base + 0.6;
    const collarW = D * (1 - 0.6 / rise) - 0.3;
    g.box(trim, collarW, 0.1, 0.06, 0, collarY, 0);
    const slopeLen = Math.hypot(halfD, rise);
    const tilt = Math.atan2(halfD, rise);
    for (const side of [-1, 1]) {
      // The rafter's centre sits a little inside the slope, so it stays under the eave line.
      const cx = side * (halfD / 2) * 0.86;
      const cy = base + (rise / 2) * 0.86 + 0.05;
      g.box(trim, 0.1, slopeLen * 0.8, 0.06, cx, cy, 0, 0, 0, side * tilt);
    }
    wallWindow(g.at(0, 3.45, 0), 0.4, 0.4, trim, GLASS, false);
  }
  p.roof(roof, W, D, 1.7, 2.98, 0.45, 0.18);
  const cx = slot % 2 ? 1.5 : -1.5;
  chimney(p, '#a8604a', 0.6, 2.4, cx, 2.6, -0.9, 1);
  smoke(new THREE.Vector3(cx, 5.35, -0.9).applyMatrix4(p.m));
  const f = p.at(0, 0, D / 2 + 0.01);
  // The front door: a frame, planks, two cross-battens, hinges, a knob and a letter slot.
  f.box(trim, 1.15, 2.05, 0.06, 0, 1.3, 0.01);
  f.box(door, 0.92, 1.85, 0.1, 0, 1.22, 0.05);
  doorAt(f.at(0, 0.295, 0), 0.92, 1.85, door, false);
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
  // A spot on the ridge where a bird may sit.
  if (r() < 0.6) collect?.perches.push(new THREE.Vector3((r() - 0.5) * 3, 2.98 + 1.7 + 0.32, 0).applyMatrix4(p.m));
}

/**
 * The Lucky Raven: a storybook casino in berry red with gold trim, a tall curved front over the door to hold its
 * lit sign (ringed with bulbs, a raven on a lucky horseshoe on top), a striped canopy, and a red carpet down the steps.
 */
function casinoFront(p: Paint, r: () => number) {
  const W = CASINO.w;
  const D = CASINO.d;
  const wall = '#8a2f4a';
  const cream = '#f3e3c3';
  const gold = '#d8b04a';
  const roof = '#2f4f6a';
  p.block(STONE_DARK, W + 0.3, 0.35, D + 0.3, 0, 0, 0);
  p.block(wall, W, 3.4, D, 0, 0.3, 0);
  // Cream quoins up each corner, a gold band at the sills and a cornice under the eaves.
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) for (let k = 0; k < 6; k++) p.block(cream, k % 2 ? 0.34 : 0.26, 0.5, k % 2 ? 0.26 : 0.34, sx * (W / 2), 0.32 + k * 0.56, sz * (D / 2));
  p.box(gold, W + 0.14, 0.08, D + 0.14, 0, 1.05, 0);
  p.box(cream, W + 0.3, 0.16, D + 0.3, 0, 3.72, 0);
  for (let x = -W / 2 + 0.3; x < W / 2; x += 0.42) for (const sz of [-1, 1]) p.box(gold, 0.12, 0.1, 0.14, x, 3.6, sz * (D / 2 + 0.1));
  p.prism(wall, W, 2.0, D, 0, 3.8, 0);
  p.roof(roof, W, D, 2.0, 3.8, 0.5, 0.2);
  // Gold finials at the ridge ends.
  for (const sx of [-1, 1]) p.sphere(gold, 0.14, 0.14, 0.14, sx * (W / 2 + 0.3), 5.95, 0);
  const f = p.at(0, 0, D / 2 + 0.01);
  // The tall front over the door, with a round top, to carry the sign.
  f.box(wall, 5.0, 2.2, 0.3, 0, 4.7, 0.12);
  f.geo(G.cyl(32), wall, placeMatrix({ pos: [0, 5.8, 0.12], rot: [Math.PI / 2, 0, 0], scale: [2.5, 0.3, 1.0] }));
  f.box(cream, 5.2, 0.14, 0.36, 0, 3.66, 0.12);
  for (let k = 0; k <= 24; k++) {
    const a = (k / 24) * Math.PI;
    f.sphere(gold, 0.06, 0.06, 0.06, Math.cos(a) * 2.53, 5.8 + Math.sin(a) * 1.03, 0.28, 8, 6);
  }
  for (const sx of [-1, 1]) f.box(gold, 0.08, 2.2, 0.08, sx * 2.52, 4.7, 0.28);
  // A raven on a lucky horseshoe, up on top.
  {
    const t = f.at(0, 7.25, 0.12);
    t.torus(gold, 0.42, 0.07, 0, 0, 0, 0, 0);
    for (let k = 0; k < 6; k++) t.sphere('#a8843a', 0.03, 0.03, 0.03, Math.cos(-0.4 + k * 0.78) * 0.42, Math.sin(-0.4 + k * 0.78) * 0.42, 0.06, 6, 4);
    t.sphere('#23222b', 0.24, 0.2, 0.32, 0, 0.62, 0);
    t.sphere('#23222b', 0.15, 0.15, 0.15, 0, 0.82, 0.24);
    t.cone('#d8b04a', 0.05, 0.16, 0, 0.8, 0.42, 6, 0);
    t.box('#23222b', 0.06, 0.2, 0.34, 0, 0.6, -0.36, 0.9, 0, 0);
    for (const sx of [-1, 1]) {
      t.sphere('#f6efe0', 0.035, 0.035, 0.02, sx * 0.09, 0.86, 0.35, 6, 4);
      t.box('#2a2a33', 0.04, 0.12, 0.04, sx * 0.08, 0.4, 0.05);
    }
  }
  // Bulbs all round where the sign hangs.
  const bulbs: [number, number][] = [];
  for (let x = -2.1; x <= 2.11; x += 0.3) bulbs.push([x, 5.15], [x, 3.95]);
  for (let y = 4.25; y < 5.0; y += 0.3) bulbs.push([-2.1, y], [2.1, y]);
  bulbs.forEach(([x, y], i) => {
    f.sphere('#fff1b0', 0.05, 0.05, 0.05, x, y, 0.3, 8, 6);
    if (i % 3 === 0) glowAt(f, x, y, 0.35, 0.6, '#ffd27a');
  });
  // The door, under a striped canopy, up two steps on a red carpet.
  archedDoor(f.at(0, 0.3, 0), 1.4, 2.25, '#2f6a4f', gold);
  const stripes = 8;
  for (let k = 0; k < stripes; k++) {
    const x = -1.3 + (k + 0.5) * (2.6 / stripes);
    f.box(k % 2 ? gold : '#b0283f', 2.6 / stripes + 0.01, 0.06, 1.5, x, 2.95, 0.7, 0.35);
    f.cyl(k % 2 ? gold : '#b0283f', 2.6 / stripes / 2, 0.04, x, 2.62, 1.43, 12, Math.PI / 2);
  }
  for (const sx of [-1, 1]) {
    f.post(gold, 0.04, 2.6, sx * 1.25, 0.3, 1.4, 8);
    f.sphere(gold, 0.07, 0.07, 0.07, sx * 1.25, 2.95, 1.4);
  }
  f.block(STONE, 2.2, 0.15, 0.7, 0, 0, 0.45);
  f.block(shade(STONE, 0.06), 1.9, 0.15, 0.4, 0, 0.15, 0.3);
  f.box('#b0283f', 1.2, 0.02, 3.0, 0, 0.012, 2.2);
  f.box('#b0283f', 1.2, 0.02, 0.5, 0, 0.31, 0.3);
  for (const sx of [-1, 1]) f.box(gold, 0.05, 0.022, 3.0, sx * 0.58, 0.014, 2.2);
  // Tall windows either side, glowing gold, with gold diamonds over them.
  for (const x of [-2.9, 2.9]) {
    wallWindow(f.at(x, 2.0, 0), 1.0, 1.6, gold, '#f2c879', true, null);
    f.box(gold, 0.22, 0.22, 0.05, x, 3.15, 0.06, 0, 0, Math.PI / 4);
    windowBox(f.at(x, 1.1, 0), r, 1.2);
  }
  for (const sx of [-1, 1]) {
    const side = p.at(sx * (W / 2 + 0.01), 0, 0, (sx * Math.PI) / 2);
    for (const z of [-1.6, 1.6]) wallWindow(side.at(z, 2.0, 0), 0.9, 1.3, gold, '#f2c879', true, null);
  }
  // Brass lamp posts at the foot of the steps, and clipped bay trees in pots.
  for (const sx of [-1, 1]) {
    const l = f.at(sx * 1.9, 0, 1.6);
    l.post('#3a3a44', 0.06, 2.2, 0, 0, 0, 8);
    l.cyl(gold, 0.1, 0.1, 0, 0.05, 0, 10);
    l.glass.sphere('#fff1c8', 0.18, 0.18, 0.18, 0, 2.35, 0, 12, 8);
    l.cone(gold, 0.16, 0.12, 0, 2.5, 0, 10);
    glowAt(l, 0, 2.35, 0, 1.6, '#ffc46b');
    const pot = f.at(sx * 0.95, 0, 1.0);
    pot.taper(gold, 1.2, 0.18, 0.35, 0, 0, 0, 12);
    pot.post('#6a4a32', 0.03, 0.6, 0, 0.35, 0, 6);
    pot.blob('#3f7a42', 0.32, 0, 1.15, 0, 2);
  }
}

/**
 * Wren Court: a three-storey block of flats in cream render over a brick ground floor, with a terracotta roof and
 * dormers, a balcony with flower boxes on each upper floor, shuttered windows, and a green door under a little porch.
 */
function flatsFront(p: Paint, r: () => number) {
  const W = FLATS.w;
  const D = FLATS.d;
  const brick = '#b86a50';
  const render = '#f3e2c8';
  const trim = '#fbf4e6';
  const roof = '#b5553a';
  const shutter = '#5f8a6a';
  const STOREY = 2.5;
  const base = 0.3;
  const top = base + STOREY * 3;
  p.block(STONE_DARK, W + 0.3, 0.35, D + 0.3, 0, 0, 0);
  // Brick up to the first floor, render above, with bands between the floors and quoins up the corners.
  p.block(brick, W, STOREY, D, 0, base, 0);
  courses(p, W, STOREY, D, 0, base, 0, 0.25, shade(brick, -0.16), true);
  p.block(render, W, STOREY * 2, D, 0, base + STOREY, 0);
  for (const y of [base + STOREY, base + STOREY * 2]) p.box(trim, W + 0.12, 0.14, D + 0.12, 0, y, 0);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) for (let k = 0; k < 9; k++) p.block(shade(render, -0.06), k % 2 ? 0.32 : 0.24, 0.5, k % 2 ? 0.24 : 0.32, sx * (W / 2), base + STOREY + k * 0.56, sz * (D / 2));
  p.box(trim, W + 0.3, 0.18, D + 0.3, 0, top + 0.04, 0);
  for (let x = -W / 2 + 0.3; x < W / 2; x += 0.45) for (const sz of [-1, 1]) p.box(shade(trim, -0.06), 0.12, 0.1, 0.14, x, top - 0.1, sz * (D / 2 + 0.09));
  p.prism(render, W, 2.3, D, 0, top + 0.12, 0);
  p.roof(roof, W, D, 2.3, top + 0.12, 0.5, 0.2);
  chimney(p, '#a8604a', 0.7, 2.6, -2.8, top + 0.2, -1.0, 2);
  chimney(p, '#a8604a', 0.7, 2.6, 2.8, top + 0.2, -1.0, 2);
  // Two dormers on the front slope, each with a little window.
  for (const x of [-2.4, 2.4]) {
    const z = 1.55;
    const y = top + 0.12 + 2.3 * (1 - z / (D / 2)) - 0.45;
    p.block(render, 1.1, 1.0, 1.3, x, y, z - 0.1);
    p.prism(roof, 1.3, 0.55, 1.5, x, y + 1.0, z - 0.1, Math.PI / 2);
    wallWindow(p.at(x, y + 0.5, z + 0.56), 0.6, 0.6, trim, GLASS, false);
  }
  const f = p.at(0, 0, D / 2 + 0.01);
  // The front door, under the first floor's balcony on two posts, up a step, with a lantern either side.
  archedDoor(f.at(0, 0.3, 0), 1.25, 1.75, '#2f6a4f', trim);
  for (const sx of [-1, 1]) {
    f.post(trim, 0.07, STOREY, sx * 1.2, 0.3, 0.72, 8);
    f.torus(trim, 0.08, 0.025, sx * 1.2, 1.5, 0.72, Math.PI / 2);
    lantern(f.at(sx * 0.95, 2.0, 0));
  }
  f.block(STONE, 2.4, 0.15, 1.2, 0, 0, 0.55);
  f.block(shade(STONE, 0.06), 2.0, 0.15, 0.7, 0, 0.15, 0.35);
  // Ground-floor windows either side, with window boxes; the bay trees in tubs by the door.
  for (const x of [-2.9, 2.9]) {
    wallWindow(f.at(x, 1.7, 0), 1.0, 1.1, trim, GLASS, true, shutter);
    windowBox(f.at(x, 1.07, 0), r, 1.2);
  }
  for (const sx of [-1, 1]) {
    const pot = f.at(sx * 1.78, 0, 0.75);
    pot.block('#f3e2c8', 0.5, 0.5, 0.5, 0, 0, 0);
    pot.box(shade('#f3e2c8', -0.1), 0.56, 0.08, 0.56, 0, 0.48, 0);
    pot.post(WOOD_DARK, 0.03, 0.7, 0, 0.5, 0, 6);
    pot.blob('#3f7a42', 0.36, 0, 1.4, 0, 3);
  }
  // Upstairs: a balcony with a French door on each floor, and shuttered windows with flower boxes either side.
  for (let floor = 1; floor <= 2; floor++) {
    const y = base + STOREY * floor;
    const bal = f.at(0, y, 0);
    bal.box('#3a2a22', 1.05, 2.0, 0.06, 0, 1.05, 0.01);
    bal.glass.box(GLASS, 0.85, 1.8, 0.06, 0, 1.05, 0.04);
    bal.box(trim, 0.06, 1.8, 0.05, 0, 1.05, 0.08);
    glowAt(bal, 0, 1.05, 0.25, 2.0, WARM_GLOW);
    bal.box(trim, 2.8, 0.12, 0.85, 0, 0.0, 0.42);
    for (let k = 0; k < 3; k++) bal.box(trim, 0.16, 0.16, 0.16, -1.2 + k * 1.2, -0.12, 0.75);
    // Iron railings, and flower boxes hung over them.
    bal.box(IRON, 2.8, 0.05, 0.05, 0, 0.95, 0.83);
    for (const sx of [-1, 1]) bal.box(IRON, 0.05, 0.05, 0.85, sx * 1.38, 0.95, 0.42);
    for (let k = 0; k <= 14; k++) bal.box(IRON, 0.025, 0.9, 0.025, -1.38 + k * (2.76 / 14), 0.5, 0.83);
    for (const sx of [-1, 1]) windowBox(bal.at(sx * 0.75, 0.9, 0.7), r, 0.9);
    if (r() < 0.7) {
      const pp = bal.at(-1.0, 0.06, 0.25);
      pp.taper('#c06a48', 1.2, 0.14, 0.3, 0, 0, 0, 10);
      pp.blob('#5f9e47', 0.22, 0, 0.45, 0, 1);
    }
    for (const x of [-2.9, 2.9]) {
      wallWindow(f.at(x, y + 1.2, 0), 0.9, 1.1, trim, GLASS, true, shutter);
      windowBox(f.at(x, y + 0.58, 0), r, 1.1);
    }
  }
  // Windows down the sides and along the back, three floors of them.
  for (const sx of [-1, 1]) {
    const side = p.at(sx * (W / 2 + 0.01), 0, 0, (sx * Math.PI) / 2);
    for (let floor = 0; floor < 3; floor++) for (const z of [-1.4, 1.4]) wallWindow(side.at(z, base + STOREY * floor + 1.3, 0), 0.8, 1.0, trim, GLASS, true, shutter);
  }
  const back = p.at(0, 0, -D / 2 - 0.01, Math.PI);
  for (let floor = 0; floor < 3; floor++) for (const x of [-3, -1, 1, 3]) wallWindow(back.at(x, base + STOREY * floor + 1.3, 0), 0.8, 1.0, trim, GLASS, true, null);
  // A drainpipe down one front corner, and bushes along the front.
  f.post('#4a4a52', 0.06, top, W / 2 - 0.35, 0, 0.1, 8);
  for (const x of [-3.9, 3.9]) bush(p.at(x, 0, D / 2 + 0.45), r, r() < 0.6);
  // A spot on the ridge where a bird may sit.
  collect?.perches.push(new THREE.Vector3(1.2, top + 2.6, 0).applyMatrix4(p.m));
}

/**
 * The washhouse: `shell` is the posts, beams and roof (which fade when they hide someone standing under
 * them); `props` is the floor, pump, tubs, basket and rack, which always stay solid.
 */
function washhouse(shell: Paint, props: Paint, r: () => number) {
  const p = shell;
  const { w, d } = WASHHOUSE;
  // A flagstone floor, turned posts with braces, a plate and a tiled roof.
  props.block('#bdb3a3', w + 0.4, 0.15, d + 0.4, 0, 0, 0);
  for (let x = -w / 2; x < w / 2; x += 0.9) for (let z = -d / 2; z < d / 2; z += 0.9) props.box(shade('#bdb3a3', (((x * 3 + z * 7) % 5) / 5 - 0.5) * 0.08), 0.84, 0.03, 0.84, x + 0.45, 0.16, z + 0.45);
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
  props.block('#4a5a6a', 0.3, 1.1, 0.3, 0, 0.15, -d / 2 + 0.5);
  props.cyl('#4a5a6a', 0.2, 0.08, 0, 1.28, -d / 2 + 0.5, 12);
  props.box('#4a5a6a', 0.08, 0.08, 0.5, 0, 1.15, -d / 2 + 0.7);
  props.box('#4a5a6a', 0.06, 0.06, 0.2, 0, 1.05, -d / 2 + 0.95, 0.8);
  props.box('#3a4a5a', 0.06, 0.9, 0.06, -0.2, 1.3, -d / 2 + 0.4, 0, 0, -0.5);
  props.sphere('#c9a24f', 0.05, 0.05, 0.05, -0.42, 1.68, -d / 2 + 0.4);
  props.block(STONE_DARK, 0.9, 0.3, 0.5, 0, 0.15, -d / 2 + 1.0);
  props.box('#8fd0e8', 0.8, 0.02, 0.4, 0, 0.42, -d / 2 + 1.0);
  for (const t of TUBS) {
    const q = props.at(t.x - WASHHOUSE.x, 0.15, t.z - WASHHOUSE.z);
    // Tubs made of staves with iron hoops, full of suds.
    q.taper(WOOD, 0.85, 0.72, 0.62, 0, 0, 0, 16);
    for (let k = 0; k < 16; k++) {
      const a = (k / 16) * Math.PI * 2;
      q.box(shade(WOOD, ((k * 7) % 3) * 0.03 - 0.03), 0.27, 0.62, 0.05, Math.cos(a) * 0.68, 0.31, Math.sin(a) * 0.68, 0, Math.PI / 2 - a, 0);
    }
    for (const y of [0.12, 0.48]) q.cyl(IRON, 0.72 - y * 0.12, 0.05, 0, y, 0, 16);
    q.cyl('#8fd0e8', 0.58, 0.02, 0, 0.57, 0, 16);
    for (let k = 0; k < 7; k++) q.ico('#ffffff', 0.07 + r() * 0.07, (r() - 0.5) * 0.75, 0.62, (r() - 0.5) * 0.75, 1);
  }
  // A basket of washing, a washboard, soap on a dish, and a drying rack.
  const b = props.at(0, 0.15, 0.9);
  b.taper('#c9a46a', 1.2, 0.35, 0.35, 0, 0, 0, 12);
  for (let k = 0; k < 12; k++) {
    const a = (k / 12) * Math.PI * 2;
    b.box(shade('#c9a46a', k % 2 ? -0.06 : 0.04), 0.14, 0.33, 0.03, Math.cos(a) * 0.37, 0.17, Math.sin(a) * 0.37, 0, Math.PI / 2 - a, 0);
  }
  b.torus('#a8834f', 0.38, 0.02, 0, 0.35, 0, Math.PI / 2);
  b.ico('#f2a7b8', 0.18, -0.1, 0.38, 0, 1);
  b.ico('#8fc1e8', 0.16, 0.12, 0.4, 0.05, 1);
  props.box(WOOD_LIGHT, 0.4, 0.7, 0.05, 1.9, 0.5, -0.8, -0.3);
  for (let k = 0; k < 8; k++) p.box(shade(WOOD_LIGHT, -0.1), 0.34, 0.02, 0.02, 1.9, 0.25 + k * 0.06, -0.8 + 0.03 + k * 0.018, -0.3);
  props.cyl('#e8dcc0', 0.1, 0.02, -1.8, 0.16, 0.9, 12);
  props.box('#f6d55c', 0.12, 0.05, 0.08, -1.8, 0.2, 0.9, 0, 0.4, 0);
  for (const x of [-2.2, -1.2]) p.post(WOOD, 0.03, 1.1, x, 0.15, -1.2, 8);
  for (let k = 0; k < 3; k++) p.cyl(WOOD, 0.015, 1.0, -1.7, 0.6 + k * 0.3, -1.2, 6, 0, 0, Math.PI / 2);
  props.box('#8fc1e8', 0.3, 0.26, 0.02, -1.5, 1.05, -1.2);
  props.box('#f2a7b8', 0.25, 0.2, 0.02, -1.9, 1.08, -1.2);
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
  glowAt(p, x - (w / 2 - 0.05), 1.1, z1 - 0.15, 1.3, '#ffc46b');
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
  const bank = new THREE.Mesh(t.geometry(SMOOTH_DEG), matte());
  bank.receiveShadow = true;
  group.add(bank);
  // The water itself: a smooth sheet of shared vertices, so the ripples (set every frame by the town) light
  // smoothly. Normals are refreshed just before each draw.
  const geo = new THREE.BufferGeometry();
  const rings = 9;
  const pos: number[] = [];
  const index: number[] = [];
  const vid = (i: number, k: number) => (i === 0 ? 0 : 1 + (i - 1) * n + (((k % n) + n) % n));
  pos.push(POND.x, 0.045, POND.z);
  for (let i = 1; i <= rings; i++) {
    const s = i / rings;
    for (let k = 0; k < n; k++) {
      const a = (k / n) * Math.PI * 2;
      const wob = 1 + Math.sin(a * 3) * 0.04 + Math.cos(a * 5) * 0.03;
      pos.push(POND.x + Math.cos(a) * POND.rx * s * wob * 0.99, 0.045, POND.z + Math.sin(a) * POND.rz * s * wob * 0.99);
    }
  }
  // Wound so the faces point up (seen from above, the angle runs clockwise, so the order goes the other way).
  for (let k = 0; k < n; k++) index.push(vid(0, 0), vid(1, k + 1), vid(1, k));
  for (let i = 1; i < rings; i++) {
    for (let k = 0; k < n; k++) {
      index.push(vid(i, k), vid(i + 1, k + 1), vid(i + 1, k));
      index.push(vid(i, k), vid(i, k + 1), vid(i + 1, k + 1));
    }
  }
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setIndex(index);
  geo.computeVertexNormals();
  const material = new THREE.MeshPhongMaterial({ color: '#5fb6cf', specular: '#cfe9f6', shininess: 55, transparent: true, opacity: 0.9 });
  const mesh = new THREE.Mesh(geo, material);
  mesh.receiveShadow = true;
  mesh.name = 'pond';
  mesh.onBeforeRender = () => geo.computeVertexNormals();
  group.add(mesh);
  // Lily pads, reeds and stones around the edge. Pads keep clear of each other, the pier and the boat; reeds and
  // stones keep clear of each other, the boat, the lamp on the bank and where you stand to skim stones, so nothing
  // grows through anything else.
  const bx = POND.x + POND.rx * 0.62;
  const bz = POND.z + POND.rz * 0.45;
  const byBoat = (x: number, z: number, margin: number) => Math.abs(x - bx) < 0.6 + margin && Math.abs(z - bz) < 1.3 + margin;
  const pads: { x: number; z: number; rad: number }[] = [];
  for (let tries = 0; tries < 60 && pads.length < 9; tries++) {
    const a = r() * Math.PI * 2;
    const s = 0.35 + r() * 0.5;
    const x = POND.x + Math.cos(a) * POND.rx * s;
    const z = POND.z + Math.sin(a) * POND.rz * s;
    const rad = 0.35 + r() * 0.2;
    if (Math.abs(x - DOCK.x) < 2.2 && z < DOCK.z1 + 1) continue;
    if (byBoat(x, z, rad)) continue;
    if (pads.some((q) => Math.hypot(q.x - x, q.z - z) < q.rad + rad + 0.12)) continue;
    pads.push({ x, z, rad });
  }
  pads.forEach(({ x, z, rad }, i) => {
    const y = 0.08 + i * 0.004;
    p.cyl(shade('#5f9e47', (r() - 0.5) * 0.08), rad, 0.03, x, y, z, 7);
    // A notch cut out of the pad, as a darker wedge of water showing through.
    p.box(shade('#5fb6cf', -0.05), rad * 0.5, 0.034, 0.08, x + rad * 0.6, y, z, 0, r() * Math.PI * 2);
    if (r() < 0.4) p.ico(pick(r, ['#f2a7b8', '#ffffff']), 0.1, x, y + 0.06, z, 0, 0.6);
  });
  const edge: { x: number; z: number; reed: boolean }[] = [];
  for (let tries = 0; tries < 60 && edge.length < 22; tries++) {
    const a = r() * Math.PI * 2;
    const s = 0.92 + r() * 0.12;
    const x = POND.x + Math.cos(a) * POND.rx * s;
    const z = POND.z + Math.sin(a) * POND.rz * s;
    // Three clumps of reeds to every two stones.
    const reed = edge.length % 5 < 3;
    if (Math.abs(x - DOCK.x) < 2.5 && z < POND.z) continue;
    if (byBoat(x, z, 0.6) || pathLamps.some((l) => Math.hypot(l.x - x, l.z - z) < 0.9)) continue;
    if (Math.hypot(x - SKIMMING.x, z - SKIMMING.z) < 1.1) continue;
    if (reed && pads.some((q) => Math.hypot(q.x - x, q.z - z) < q.rad + 0.35)) continue;
    // Reeds can bunch up, stones less so, but a clump of reeds never stands in a stone.
    if (edge.some((q) => Math.hypot(q.x - x, q.z - z) < (q.reed !== reed ? 1.0 : reed ? 0.45 : 0.8))) continue;
    edge.push({ x, z, reed });
    if (reed) {
      // Reeds and bulrushes, which sway with the grass. A bulrush head stands on a stem of its own.
      for (let k = 0; k < 4; k++) p.leaves.cone(shade('#6f9e4a', (r() - 0.5) * 0.1), 0.05, 0.9 + r() * 0.6, x + (r() - 0.5) * 0.4, 0, z + (r() - 0.5) * 0.4, 3);
      if (r() < 0.5) {
        p.leaves.post('#5f8e3e', 0.014, 1.02, x, 0, z, 4);
        p.leaves.cyl('#7a4a2a', 0.06, 0.25, x, 1.1, z, 5);
      }
    } else rock(p.at(x, 0, z), r, 0.7);
  }
  // A little rowing boat moored on the far bank, oars shipped.
  {
    const boat = p.at(bx, 0.0, bz, 0.9);
    const ell = (color: THREE.ColorRepresentation, geo: THREE.BufferGeometry, sx: number, sy: number, sz: number, y: number, rx = 0) =>
      boat.geo(geo, color, new THREE.Matrix4().compose(new THREE.Vector3(0, y, 0), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, 0, 0)), new THREE.Vector3(sx, sy, sz)));
    // A pointed hull (a four-sided bowl turned over), the rim and floor planked, two thwarts, and a mooring rope.
    ell('#8a5a36', G.dome(12), 0.62, 0.55, 1.4, 0.5, Math.PI);
    ell('#6e4a30', G.cyl(12), 0.62, 0.05, 1.4, 0.5);
    ell('#a8784a', G.cyl(4), 0.5, 0.04, 1.2, 0.5);
    for (let k = -2; k <= 2; k++) boat.box(shade('#a8784a', -0.1), 0.03, 0.02, 1.15 - Math.abs(k) * 0.25, k * 0.1, 0.53, 0);
    boat.box('#c49a6c', 0.8, 0.06, 0.2, 0, 0.5, 0.45);
    boat.box('#c49a6c', 0.9, 0.06, 0.2, 0, 0.5, -0.3);
    boat.post(WOOD_DARK, 0.06, 0.5, 1.1, 0, 1.6, 8);
    boat.rope('#d8c8a0', 0.012, 0.0, 0.52, 1.4, 1.1, 0.45, 1.6, 0.05, 3);
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
      p.box(shade('#a99c89', ((k * 5 + c * 3) % 4) * 0.03 - 0.05), 0.46, 0.24, 0.16, Math.cos(a) * 0.98, 0.15 + c * 0.28, Math.sin(a) * 0.98, 0, Math.PI / 2 - a, 0);
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

/**
 * The idea box: a little mint post box on a post, with a pink roof, a slot, a light bulb on its front for bright
 * ideas, and hearts. (Its sign hangs below it; see the signs.)
 */
function ideaBox(p: Paint) {
  const body = '#8fd3c1';
  const roof = '#f28fb0';
  p.post(WOOD_DARK, 0.07, 1.05, 0, 0, 0, 10);
  p.block(shade(WOOD_DARK, -0.1), 0.24, 0.1, 0.24, 0, 0, 0);
  p.rbox(body, 0.62, 0.5, 0.46, 0, 1.3, 0, 0.05);
  p.box(shade(body, -0.12), 0.66, 0.05, 0.5, 0, 1.06, 0);
  p.prism(roof, 0.74, 0.24, 0.56, 0, 1.55, 0, Math.PI / 2);
  p.box(shade(roof, -0.15), 0.06, 0.06, 0.62, 0, 1.78, 0);
  // The slot, a little brass flap over it, and a keyhole.
  p.box('#2a2228', 0.34, 0.035, 0.02, 0, 1.44, 0.235);
  p.box('#e8c35a', 0.38, 0.06, 0.015, 0, 1.475, 0.24, -0.3);
  p.cyl('#e8c35a', 0.025, 0.015, 0.2, 1.15, 0.235, 10, Math.PI / 2);
  // A light bulb for a bright idea.
  p.sphere('#ffe87a', 0.08, 0.09, 0.03, 0, 1.27, 0.24, 14, 10);
  p.box('#9aa0a8', 0.06, 0.05, 0.03, 0, 1.17, 0.24);
  for (const k of [-1, 0, 1]) p.box('#ffe87a', 0.015, 0.06, 0.01, k * 0.13, 1.3 + Math.abs(k) * -0.02 + 0.08, 0.245, 0, 0, -k * 0.6);
  glowAt(p, 0, 1.27, 0.3, 0.7, '#ffe87a');
  // Hearts on the sides.
  for (const sx of [-1, 1]) {
    const q = p.at(sx * 0.315, 1.3, 0, (sx * Math.PI) / 2);
    q.sphere('#f25f8a', 0.045, 0.045, 0.015, -0.035, 0.03, 0, 10, 6);
    q.sphere('#f25f8a', 0.045, 0.045, 0.015, 0.035, 0.03, 0, 10, 6);
    q.box('#f25f8a', 0.065, 0.065, 0.02, 0, -0.015, 0, 0, 0, Math.PI / 4);
  }
  // Flowers round its foot.
  for (let k = 0; k < 5; k++) {
    const a = (k / 5) * Math.PI * 2;
    p.post('#4f8f3f', 0.01, 0.22, Math.cos(a) * 0.22, 0, Math.sin(a) * 0.22, 4);
    p.sphere(['#f6d55c', '#f2a7b8', '#ffffff'][k % 3], 0.05, 0.035, 0.05, Math.cos(a) * 0.22, 0.24, Math.sin(a) * 0.22, 8, 6);
  }
}

/** Where the post office's letterboxes are on its front, in its own frame: the grid the name plates are drawn on. */
export const POST_GRID = { x0: -1.08, x1: 1.08, y0: 0.28, y1: 1.4, z: 0.21 };

/**
 * The post office: a wooden cabinet of little letterbox doors on a stone plinth, under a tiled roof, with a red
 * pillar box beside it. The doors' name plates are a picture drawn over the front (see post.ts); the bars between
 * them stand proud of it.
 */
function postOffice(p: Paint) {
  const wood = '#7a4f30';
  const trim = '#4f321f';
  const g = POST_GRID;
  p.block('#a8a196', 2.56, 0.14, 0.6, 0, 0, 0);
  p.block(wood, 2.4, 1.5, 0.42, 0, 0.14, 0);
  p.box(trim, 2.48, 0.07, 0.48, 0, 1.64, 0);
  p.roof('#8a3a2e', 2.5, 0.56, 0.28, 1.67, 0.12, 0.06);
  // The bars between the doors: uprights a touch prouder than the rails, so their fronts never share a plane.
  const cw = (g.x1 - g.x0) / POST_COLS;
  const rh = (g.y1 - g.y0) / POST_ROWS;
  for (let k = 0; k <= POST_COLS; k++) p.box(trim, 0.03, g.y1 - g.y0 + 0.03, 0.045, g.x0 + k * cw, (g.y0 + g.y1) / 2, g.z + 0.0225);
  for (let k = 0; k <= POST_ROWS; k++) p.box(trim, g.x1 - g.x0 + 0.03, 0.03, 0.04, 0, g.y0 + k * rh, g.z + 0.02);
  // The pillar box: red, round, with a domed cap, a slot and a little gold crown.
  const red = '#c8302c';
  const px = 1.75;
  const pz = 0.05;
  p.block('#a8a196', 0.6, 0.1, 0.6, px, 0, pz);
  p.post(red, 0.24, 0.95, px, 0.1, pz, 18);
  p.cyl(shade(red, -0.12), 0.27, 0.07, px, 1.06, pz, 18);
  p.sphere(red, 0.25, 0.15, 0.25, px, 1.09, pz, 18, 8);
  p.cyl(shade(red, -0.12), 0.26, 0.05, px, 0.14, pz, 18);
  p.box('#1d1612', 0.2, 0.035, 0.04, px, 0.86, pz + 0.23);
  p.box(shade(red, -0.15), 0.26, 0.05, 0.05, px, 0.9, pz + 0.23);
  p.ico('#e2c06a', 0.05, px, 0.66, pz + 0.24, 0, 0.6);
  p.box('#f6efe0', 0.16, 0.1, 0.02, px, 0.48, pz + 0.24);
}

/** The fairy ring: toadstools in a circle, red caps with white spots, and a few tiny white flowers inside. */
function fairyRing(p: Paint, r: () => number) {
  const n = 11;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + (r() - 0.5) * 0.2;
    const x = Math.sin(a) * FAIRY_RING.r;
    const z = Math.cos(a) * FAIRY_RING.r;
    const h = 0.1 + r() * 0.07;
    const cap = 0.07 + r() * 0.04;
    p.post('#f2ead8', 0.026, h, x, 0, z, 8);
    p.sphere(pick(r, ['#d8343a', '#c8302c', '#e04a3a']), cap, cap * 0.6, cap, x, h, z, 12, 6);
    for (let k = 0; k < 3; k++) {
      const da = r() * Math.PI * 2;
      p.sphere('#fff7ec', cap * 0.18, cap * 0.12, cap * 0.18, x + Math.cos(da) * cap * 0.55, h + cap * 0.38, z + Math.sin(da) * cap * 0.55, 6, 4);
    }
  }
  for (let i = 0; i < 6; i++) {
    const a = r() * Math.PI * 2;
    const d = r() * 0.6;
    flowerStem(p, r, Math.sin(a) * d, Math.cos(a) * d, '#ffffff', 0.12);
  }
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
  add(CLUB.x, CLUB.z, 6.5);
  for (const b of BOOTHS) if (b.zone === 'town') add(b.x, b.z, 3.2);
  add(IDEA_BOX.x, IDEA_BOX.z, 1.6);
  add(CASINO.x, CASINO.z, 7.5);
  // No trees on the way up to its door from the square, where they'd hide you from the camera.
  for (const out of [7.5, 11.5]) {
    const p = local(CASINO.x, CASINO.z, CASINO.ry, 0, CASINO.d / 2 + out);
    add(p.x, p.z, 3.2);
  }
  add(FLATS.x, FLATS.z, 7.5);
  for (const bd of beds) add(bd.x, bd.z, 4);
  add(GALLERY.x, GALLERY.z, 4.5);
  add(WELL.x, WELL.z, 3);
  add(WOODPILE.x, WOODPILE.z, 2.5);
  add(NOTICEBOARD.x, NOTICEBOARD.z, 2.5);
  add(POST.x, POST.z, 3.2);
  add(FAIRY_RING.x, FAIRY_RING.z, 2.2);
  for (const l of [...squareLamps, ...roadLamps, ...pathLamps]) add(l.x, l.z, 1.2);
  return b;
}

/**
 * Nothing stands between the night gallery's board and the camera of someone looking at it: a tree or a bush that
 * would steps aside to the east or west (rather than not growing, which would move every one after it).
 */
function besideGallery(x: number, z: number): number {
  const gx = x - GALLERY.x;
  if (Math.abs(gx) < GALLERY.w / 2 + 0.8 && z > GALLERY.z - 0.5 && z < GALLERY.z + 7) return GALLERY.x + (gx < 0 ? -1 : 1) * (GALLERY.w / 2 + 1);
  return x;
}

function free(x: number, z: number, list: Blocker[], margin: number, pathMargin: number): boolean {
  for (const b of list) if (Math.hypot(x - b.x, z - b.z) < b.r + margin) return false;
  if (nearPath(x, z, pathMargin)) return false;
  return true;
}

// ---------------------------------------------------------------- assembly

/** Roughly how high the hills rise beyond the fence (the same shape as the ground mesh, without its noise). */
function hillAt(x: number, z: number): number {
  const rad = Math.hypot(x, z);
  if (rad < TOWN_R + 1) return 0;
  const a = Math.atan2(x, -z);
  return smooth(TOWN_R + 1, TOWN_R + 52, rad) * (5 + 3 * Math.sin(a * 3 + 1.3) + 2 * Math.sin(a * 7 + 0.4)) + smooth(TOWN_R + 4, TOWN_R + 22, rad) * 0.7;
}

export function buildOutdoor(windowMat: THREE.Material): Outdoor {
  const group = new THREE.Group();
  group.name = 'town';
  const r = rng(1337);
  const colliders: Collider[] = [];
  const chimneys: THREE.Vector3[] = [];
  const smoke = (v: THREE.Vector3) => chimneys.push(v);
  const glowSpots: GlowSpot[] = [];
  const perches: THREE.Vector3[] = [];
  const doors: DoorSpot[] = [];
  collect = { glow: glowSpots, perches, doors };
  // Leaves, grass and reeds sway in the wind.
  const leafMat = addSway(matte());
  const forestMat = addSway(matte(), true);

  // Chunks of static geometry, so off-screen parts of town can be skipped.
  const chunks = new Map<string, Layers>();
  const mains = new Map<string, Builder>();
  const chunkMain = (key: string) => {
    let b = mains.get(key);
    if (!b) {
      b = new Builder();
      mains.set(key, b);
    }
    return b;
  };
  const glass = new Builder();
  // Leaves and grass inside the fence sway, in a few big pieces; beyond the fence they stay still with the rest.
  const leafChunks = new Map<string, Builder>();
  const chunkAt = (x: number, z: number): Layers => {
    // 48 m pieces: big enough to keep the draw calls down, small enough that most of the forest ring is skipped.
    const key = `${Math.floor(x / 48)},${Math.floor(z / 48)}`;
    const inside = Math.hypot(x, z) < TOWN_R + 1;
    // All of the town's swaying leaves in one piece: it's nearly always in view anyway.
    const lkey = 'town';
    let foliage = inside ? leafChunks.get(lkey) : undefined;
    if (inside && !foliage) {
      foliage = new Builder();
      leafChunks.set(lkey, foliage);
    }
    const ckey = `${key}:${inside ? lkey : '-'}`;
    let l = chunks.get(ckey);
    if (!l) {
      l = { main: chunkMain(key), glass, foliage };
      chunks.set(ckey, l);
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

  // The clock tower, its faces softly lit at night.
  const tower = clockTower(solo(0, 0));
  for (const f of tower.faces) {
    const v = new THREE.Vector3(0, 0, 0.15).applyMatrix4(f);
    glowSpots.push({ x: v.x, y: v.y, z: v.z, size: 3.4, color: '#b8a77e' });
  }
  // Public buildings.
  church(solo(CHURCH.x, CHURCH.z, CHURCH.ry));
  {
    // The railing all round, but for the open gate at the front, so you can walk in among the graves.
    const { x: gx, z: gz, hw, hd } = GRAVEYARD;
    const rail = (x: number, z: number, w: number, d: number) => colliders.push({ kind: 'box', x: gx + x, z: gz + z, hw: w, hd: d, rot: 0 });
    rail(-hw, 0, 0.1, hd + 0.1);
    rail(hw, 0, 0.1, hd + 0.1);
    rail(0, -hd, hw + 0.1, 0.1);
    for (const sx of [-1, 1]) rail((sx * (hw + GRAVE_GATE + 0.1)) / 2, hd + 0.05, (hw + 0.1 - GRAVE_GATE) / 2, 0.15);
    for (const st of graveyard(painter(gx, gz), r)) colliders.push({ kind: 'circle', x: gx + st.x, z: gz + st.z, r: st.r });
  }
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
  washhouse(solo(WASHHOUSE.x, WASHHOUSE.z), painter(WASHHOUSE.x, WASHHOUSE.z), r);
  washingLines(painter(0, 0));
  dock(painter(0, 0));
  const water = pond(group, painter(0, 0), r);
  for (const b of beds) flowerBedFrame(painter(b.x, b.z, b.ry));
  for (const b of benches) {
    bench(painter(b.x, b.z, b.ry));
    const back = local(b.x, b.z, b.ry, 0.55, -0.27);
    perches.push(new THREE.Vector3(back.x, 0.96, back.z));
  }
  for (const l of [...squareLamps, ...roadLamps, ...pathLamps]) {
    lampPost(painter(l.x, l.z));
    glowSpots.push({ x: l.x, y: 2.86, z: l.z, size: 2.3, color: '#ffc46b' });
    perches.push(new THREE.Vector3(l.x, 3.31, l.z));
  }
  well(painter(WELL.x, WELL.z));
  woodpile(painter(WOODPILE.x, WOODPILE.z, WOODPILE.ry), r);
  noticeboard(painter(NOTICEBOARD.x, NOTICEBOARD.z), r);
  postOffice(painter(POST.x, POST.z, POST.ry));
  fairyRing(painter(FAIRY_RING.x, FAIRY_RING.z), r);
  // A faint glimmer over it at night.
  for (let i = 0; i < 3; i++) glowSpots.push({ x: FAIRY_RING.x + (i - 1) * 0.5, y: 0.35 + i * 0.15, z: FAIRY_RING.z + ((i % 2) - 0.5) * 0.6, size: 0.5, color: '#c8b8ff' });
  gate(painter(0, GATE_Z));

  // Cottages.
  houseSlots.forEach((h, i) => {
    // (Each keeps the look it had when Ferncroft, now Wren Court, came first.)
    cottage(solo(h.x, h.z, h.ry), rng(501 + i), i + 1, smoke);
    const post = local(h.x, h.z, h.ry, -1.75, HOUSE_D / 2 + 1.9);
    colliders.push({ kind: 'circle', x: post.x, z: post.z, r: 0.15 });
  });
  // The club, where Bramble Cottage stood, with its neon (bright day and night) on its own mesh.
  const neonB = new Builder();
  const club = clubFront(solo(CLUB.x, CLUB.z, CLUB.ry), neonB, { glow: glowAt, door: (p, w, h, color) => doorAt(p, w, h, color, false) });
  group.add(club.sign);
  const neon = neonB.mesh(new THREE.MeshBasicMaterial({ vertexColors: true }), { cast: false, receive: false });
  neon.name = 'neon';
  group.add(neon);
  // The confession booths out among the trees: each on a few flagstones, with a lantern on a post beside it.
  for (const b of BOOTHS) {
    if (b.zone !== 'town') continue;
    const p = solo(b.x, b.z, b.ry);
    confessional(p, null);
    const ground = painter(b.x, b.z, b.ry);
    for (let k = 0; k < 5; k++) ground.box(shade(STONE, (k % 3) * 0.04 - 0.04), 0.62, 0.05, 0.5, -1.25 + k * 0.62, 0.025, 1.1);
    ground.post(WOOD_DARK, 0.06, 1.9, -1.85, 0, 0.6, 8);
    lantern(ground.at(-1.85, 1.8, 0.6));
    if (r() < 0.9) flowerPatch(ground.at(1.9, 0, 0.7), r);
    bush(ground.at(-2.2, 0, -0.6), r, true);
    colliders.push({ kind: 'circle', ...local(b.x, b.z, b.ry, -1.85, 0.6), r: 0.12 });
  }
  ideaBox(painter(IDEA_BOX.x, IDEA_BOX.z, IDEA_BOX.ry));

  // The casino, north-west between the church and the tavern.
  casinoFront(solo(CASINO.x, CASINO.z, CASINO.ry), rng(777));
  for (const sx of [-1.9, 1.9]) {
    const c = local(CASINO.x, CASINO.z, CASINO.ry, sx, CASINO.d / 2 + 1.6);
    colliders.push({ kind: 'circle', x: c.x, z: c.z, r: 0.2 });
  }
  for (const sx of [-1.25, 1.25]) {
    const c = local(CASINO.x, CASINO.z, CASINO.ry, sx, CASINO.d / 2 + 1.4);
    colliders.push({ kind: 'circle', x: c.x, z: c.z, r: 0.12 });
  }

  // Wren Court, the apartment block, where Ferncroft cottage stood.
  flatsFront(solo(FLATS.x, FLATS.z, FLATS.ry), rng(909));
  for (const sx of [-1.55, 1.55]) {
    const c = local(FLATS.x, FLATS.z, FLATS.ry, sx * 1.15, FLATS.d / 2 + 0.75);
    colliders.push({ kind: 'circle', x: c.x, z: c.z, r: 0.35 });
  }
  for (const sx of [-1.2, 1.2]) {
    const c = local(FLATS.x, FLATS.z, FLATS.ry, sx, FLATS.d / 2 + 0.73);
    colliders.push({ kind: 'circle', x: c.x, z: c.z, r: 0.1 });
  }

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
    if (collide) x = besideGallery(x, z);
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
  // Forest ring outside the fence: a handful of tree shapes drawn many times over, sitting on the hills.
  const forest: { x: number; z: number; ry: number; s: number; v: number }[] = [];
  let placed = 0;
  for (let k = 0; k < 2400 && placed < 360; k++) {
    const a = r() * Math.PI * 2;
    const rad = TOWN_R + 4 + Math.pow(r(), 0.8) * 55;
    const x = rad * Math.sin(a);
    const z = -rad * Math.cos(a);
    if (z > TOWN_R - 3 && Math.abs(x) < 5) continue;
    if (trees.some((t) => Math.hypot(t.x - x, t.z - z) < 2.6)) continue;
    const kind = r();
    // Three pines, three green round trees and two autumn ones.
    const v = kind < 0.42 ? Math.floor(r() * 3) : kind > 0.9 ? 6 + Math.floor(r() * 2) : 3 + Math.floor(r() * 3);
    forest.push({ x, z, ry: r() * Math.PI * 2, s: 0.85 + r() * 0.4, v });
    trees.push({ x, z, r: 2 });
    placed++;
  }
  {
    // Each tree shape is built (and smoothed) once, then copied into place: four quarter-rings of forest, so the
    // quarters behind the camera are skipped, with no smoothing pass over the whole lot.
    const vr = rng(4242);
    const shapes = Array.from({ length: 8 }, (_, v) => {
      const tree = new Builder();
      const p = new Paint({ main: tree, glass: new Builder(), foliage: tree });
      if (v < 3) pineTree(p, vr, false);
      else roundTree(p, vr, v >= 6, false);
      return tree.geometry();
    });
    const quarters: (typeof forest)[] = [[], [], [], []];
    for (const f of forest) quarters[Math.floor(((Math.atan2(f.x, -f.z) + Math.PI * 2.25) % (Math.PI * 2)) / (Math.PI / 2))].push(f);
    const m4 = new THREE.Matrix4();
    const q4 = new THREE.Quaternion();
    const up = new THREE.Vector3(0, 1, 0);
    const v3 = new THREE.Vector3();
    const n3 = new THREE.Vector3();
    for (const list of quarters) {
      if (!list.length) continue;
      const verts = list.reduce((n, f) => n + shapes[f.v].getAttribute('position').count, 0);
      const pos = new Float32Array(verts * 3);
      const nor = new Float32Array(verts * 3);
      const colr = new Float32Array(verts * 3);
      const sway = new Float32Array(verts);
      let o = 0;
      for (const f of list) {
        const g = shapes[f.v];
        const gp = g.getAttribute('position') as THREE.BufferAttribute;
        const gn = g.getAttribute('normal') as THREE.BufferAttribute;
        const gc = g.getAttribute('color') as THREE.BufferAttribute;
        q4.setFromAxisAngle(up, f.ry);
        m4.compose(v3.set(f.x, hillAt(f.x, f.z) - 0.4, f.z), q4, n3.set(f.s, f.s, f.s));
        const tint = 0.88 + vr() * 0.24;
        for (let i = 0; i < gp.count; i++, o++) {
          v3.fromBufferAttribute(gp, i);
          sway[o] = v3.y * f.s;
          v3.applyMatrix4(m4);
          pos[o * 3] = v3.x;
          pos[o * 3 + 1] = v3.y;
          pos[o * 3 + 2] = v3.z;
          n3.fromBufferAttribute(gn, i).applyQuaternion(q4);
          nor[o * 3] = n3.x;
          nor[o * 3 + 1] = n3.y;
          nor[o * 3 + 2] = n3.z;
          colr[o * 3] = gc.getX(i) * tint;
          colr[o * 3 + 1] = gc.getY(i) * tint;
          colr[o * 3 + 2] = gc.getZ(i) * tint;
        }
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      geo.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
      geo.setAttribute('color', new THREE.BufferAttribute(colr, 3));
      geo.setAttribute('swayH', new THREE.BufferAttribute(sway, 1));
      geo.computeBoundingSphere();
      const mesh = new THREE.Mesh(geo, forestMat);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.name = 'forest';
      group.add(mesh);
    }
    for (const g of shapes) g.dispose();
  }
  // Inside town, in the gaps.
  for (let k = 0; k < 900 && placed < 450; k++) {
    const a = r() * Math.PI * 2;
    const rad = 14 + r() * (TOWN_R - 16);
    const x = rad * Math.sin(a);
    const z = -rad * Math.cos(a);
    if (!free(x, z, block, 1.4, 2.2)) continue;
    if (trees.some((t) => Math.hypot(t.x - x, t.z - z) < 3.4)) continue;
    placeTree(x, z, true);
    placed++;
  }
  for (let k = 0; k < 780; k++) {
    const a = r() * Math.PI * 2;
    const rad = 12 + r() * (TOWN_R - 14);
    const x = rad * Math.sin(a);
    const z = -rad * Math.cos(a);
    if (!free(x, z, block, 0.6, 1.0)) continue;
    if (trees.some((t) => Math.hypot(t.x - x, t.z - z) < 1.6)) continue;
    const kind = r();
    const p = painter(besideGallery(x, z), z, r() * 6);
    if (kind < 0.16) bush(p, r, r() < 0.5);
    else if (kind < 0.34) flowerPatch(p, r);
    else if (kind < 0.42) rock(p, r, 0.6 + r() * 0.6);
    else if (kind < 0.45) mushroom(p, r);
    else tuft(p, r);
  }
  for (let k = 0; k < 220; k++) {
    const a = r() * Math.PI * 2;
    const rad = TOWN_R + 2 + r() * 45;
    const p = painter(rad * Math.sin(a), -rad * Math.cos(a), r() * 6);
    const kind = r();
    if (kind < 0.45) bush(p, r, false, false);
    else if (kind < 0.85) rock(p, r, 0.8 + r());
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
      const n = Math.max(1, Math.round(len / 0.8));
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
  // Places on the ridges of the tavern, the bakery and the church where birds sit.
  for (const [b, y, n] of [
    [TAVERN, 5.9 + 2.8 + 0.32, 3],
    [BAKERY, 3.7 + 2.4 + 0.3, 2],
    [CHURCH, 6.9 + 4.6 + 0.34, 3],
  ] as [{ x: number; z: number; ry: number; w: number; d: number }, number, number][]) {
    for (let k = 0; k < n; k++) {
      const along = b === CHURCH ? 0 : (k / Math.max(1, n - 1) - 0.5) * b.w * 0.6;
      const across = b === CHURCH ? (k / Math.max(1, n - 1) - 0.5) * b.d * 0.5 : 0;
      const w = local(b.x, b.z, b.ry, along, across);
      perches.push(new THREE.Vector3(w.x, y, w.z));
    }
  }

  // Merge everything.
  const main = matte();
  for (const b of mains.values()) {
    if (b.empty) continue;
    const m = smoothMesh(b, main);
    m.name = 'chunk';
    group.add(m);
  }
  for (const b of leafChunks.values()) {
    if (b.empty) continue;
    const f = smoothMesh(b, leafMat);
    f.name = 'foliage';
    group.add(f);
  }
  const occluders: THREE.Mesh[] = [];
  for (const b of solos) {
    if (b.empty) continue;
    const mat = matte();
    mat.transparent = true;
    const m = smoothMesh(b, mat);
    shadeFoot(m.geometry);
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
    b.add(G.taper(0.55, 18), '#d8a845', { pos: [0, -0.5, 0], scale: [0.55, 0.8, 0.55] });
    b.add(G.cyl(18), '#b88a35', { pos: [0, -0.92, 0], scale: [0.6, 0.08, 0.6] });
    b.add(G.sphere(16, 10), '#d8a845', { pos: [0, -0.08, 0], scale: [0.32, 0.18, 0.32] });
    b.add(G.sphere(12, 8), '#6b5a3a', { pos: [0, -0.95, 0], scale: [0.1, 0.1, 0.1] });
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
    b.add(G.box(), '#e8c35a', { pos: [0.95, 0.12, 0], scale: [1.82, 0.1, 0.035] });
    b.add(G.box(), '#e8c35a', { pos: [0.95, 1.18, 0], scale: [1.82, 0.1, 0.035] });
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
  signMaterials.push(club.material);
  {
    const sign = new TextSign({ w: 512, h: 192, bg: '#fff4e0', fg: '#b8506a', border: '#f28fb0', round: false, size: 66 }, ['Ideas & requests', 'for the Storyteller']);
    const { mesh, material } = signBoard(sign, 0.9, 0.34);
    const p = local(IDEA_BOX.x, IDEA_BOX.z, IDEA_BOX.ry, 0, 0.09);
    mesh.position.set(p.x, 0.78, p.z);
    mesh.rotation.y = IDEA_BOX.ry;
    group.add(mesh);
    signMaterials.push(material);
  }
  // (The bakery's hangs off its front corner, clear of the awning.)
  hang(['Bakery', 'fresh every morning'], BAKERY, BAKERY.w / 2 + 0.12, BAKERY.d / 2 + 1.0, 2.83, 1.5, 0.85, { bg: '#f6e7cf', fg: '#a0523a', border: '#a0523a' });
  {
    // The casino's sign, ringed with its bulbs.
    const sign = new TextSign({ w: 1024, h: 256, bg: '#1d1a24', fg: '#f6d77a', border: '#d8b04a', round: true }, ['The Lucky Raven']);
    const { mesh, material } = signBoard(sign, 4.0, 1.0, { lit: true });
    const p = local(CASINO.x, CASINO.z, CASINO.ry, 0, CASINO.d / 2 + 0.31);
    mesh.position.set(p.x, 4.55, p.z);
    mesh.rotation.y = CASINO.ry;
    group.add(mesh);
    signMaterials.push(material);
    const suits = new TextSign({ w: 512, h: 128, bg: '#8a2f4a', fg: '#f6d77a', border: '#8a2f4a' }, ['♠ ♥ ♣ ♦']);
    const s2 = signBoard(suits, 1.6, 0.4, { lit: true });
    s2.mesh.position.set(p.x, 6.05, p.z);
    s2.mesh.rotation.y = CASINO.ry;
    group.add(s2.mesh);
    signMaterials.push(s2.material);
  }
  {
    // Across Wren Court's front, over the top balcony.
    const sign = new TextSign({ w: 512, h: 128, bg: '#2f6a4f', fg: '#fbf4e6', border: '#d8b04a', round: false }, [FLATS_NAME]);
    const { mesh, material } = signBoard(sign, 1.9, 0.48, { lit: true });
    const p = local(FLATS.x, FLATS.z, FLATS.ry, 0, FLATS.d / 2 + 0.08);
    mesh.position.set(p.x, 7.56, p.z);
    mesh.rotation.y = FLATS.ry;
    group.add(mesh);
    signMaterials.push(material);
  }
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
    { ...local(CLUB.x, CLUB.z, CLUB.ry, 0, CLUB.d / 2 + 1.2), r: 2.8 },
    ...BOOTHS.filter((b) => b.zone === 'town').map((b) => ({ ...local(b.x, b.z, b.ry, -1.85, 0.6), r: 1.8 })),
    { ...local(CASINO.x, CASINO.z, CASINO.ry, 0, CASINO.d / 2 + 1.6), r: 3.2 },
    { ...local(FLATS.x, FLATS.z, FLATS.ry, 0, FLATS.d / 2 + 1.4), r: 3.0 },
    { x: 0, z: 0, r: 0 },
  ].filter((s) => s.r > 0);
  const pools = lightPools(poolSpots);
  group.add(pools);

  const lampLights = [0, 2, 4, 6].map((i) => new THREE.Vector3(squareLamps[i].x, 2.9, squareLamps[i].z));

  collect = null;
  return { group, colliders, water, clockHands, bell, flag, chimneys, houseSigns, signMaterials, wreaths, pools, lampLights, occluders, glowSpots, perches, doors, neon };
}

