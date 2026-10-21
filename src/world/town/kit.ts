import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { Builder, SMOOTH_DEG, jitter } from '../build';

/** Unit primitives, made once and copied into builders. */
const cache = new Map<string, THREE.BufferGeometry>();
function cached(key: string, make: () => THREE.BufferGeometry): THREE.BufferGeometry {
  let g = cache.get(key);
  if (!g) {
    g = make();
    cache.set(key, g);
  }
  return g;
}

/** A triangular prism: base along z from -0.5 to 0.5, apex at y = 1, length along x from -0.5 to 0.5. */
function prismGeometry(): THREE.BufferGeometry {
  const a = [-0.5, 0, -0.5];
  const b = [-0.5, 0, 0.5];
  const c = [-0.5, 1, 0];
  const d = [0.5, 0, -0.5];
  const e = [0.5, 0, 0.5];
  const f = [0.5, 1, 0];
  // Wound counter-clockwise seen from outside, so every face shows (the gable ends used to face inward
  // and were culled, which let you see straight through the roof sides).
  const tris = [
    [a, b, c],
    [d, f, e],
    [b, e, f],
    [b, f, c],
    [a, f, d],
    [a, c, f],
    [a, e, b],
    [a, d, e],
  ];
  const pos = new Float32Array(tris.length * 9);
  tris.forEach((t, i) => t.forEach((v, j) => pos.set(v, i * 9 + j * 3)));
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.computeVertexNormals();
  return g;
}

/** Round things get at least this many sides; 3, 4 and 5 are kept, since those are shapes on purpose. */
const SIDES = 14;
const round = (n: number) => (n <= 5 ? n : Math.max(n, SIDES));

export const G = {
  box: () => cached('box', () => new THREE.BoxGeometry(1, 1, 1)),
  cyl: (n = SIDES) => cached(`cyl${n}`, () => new THREE.CylinderGeometry(1, 1, 1, n)),
  /** A cylinder that narrows to `top` (as a fraction of the bottom radius). */
  taper: (top: number, n = SIDES) => cached(`taper${top}:${n}`, () => new THREE.CylinderGeometry(top, 1, 1, n)),
  cone: (n = SIDES) => cached(`cone${n}`, () => new THREE.ConeGeometry(1, 1, n)),
  ico: (d = 0) => cached(`ico${d}`, () => new THREE.IcosahedronGeometry(1, d)),
  dodeca: () => cached('dodeca', () => new THREE.DodecahedronGeometry(1, 0)),
  sphere: (w = 16, h = 10) => cached(`sph${w}:${h}`, () => new THREE.SphereGeometry(1, w, h)),
  torus: (r = 0.15, rs = 8, ts = 24) => cached(`tor${r}:${rs}:${ts}`, () => new THREE.TorusGeometry(1, r, rs, ts)),
  prism: () => cached('prism', prismGeometry),
  plane: () => cached('plane', () => new THREE.PlaneGeometry(1, 1)),
  /**
   * A lumpy ball for tree crowns, bushes and rocks; a handful of fixed variants so the town looks the same
   * everywhere. The gentle jitter keeps every crease under the smoothing angle, so blobs read as soft, not
   * crystalline. `fine` is a denser ball for the trees and bushes in town.
   */
  blob: (k = 0, fine = false) => cached(`blob${fine ? 'f' : ''}${k % 6}`, () => jitter(new THREE.IcosahedronGeometry(1, fine ? 2 : 1), fine ? 0.1 : 0.12, 11 + (k % 6) * 7)),
  /** A box with softened edges, for table tops, seats and counters. `r` is the edge radius as a fraction of the smallest side. */
  rbox: (r = 0.12) => cached(`rbox${r}`, () => new RoundedBoxGeometry(1, 1, 1, 2, r)),
  /** A half sphere, flat side down. */
  dome: (w = 16) => cached(`dome${w}`, () => new THREE.SphereGeometry(1, w, 5, 0, Math.PI * 2, 0, Math.PI / 2)),
};

export interface Layers {
  /** Matte, shadow-casting geometry. */
  main: Builder;
  /** Window glass and lamp glass, which glow at night. */
  glass: Builder;
  /** Leaves, grass and reeds, which sway in the wind. Falls back to `main` when a place has none. */
  foliage?: Builder;
}

const v = new THREE.Vector3();
const q = new THREE.Quaternion();
const e = new THREE.Euler();
const s = new THREE.Vector3();

function mat(x: number, y: number, z: number, rx: number, ry: number, rz: number, sx: number, sy: number, sz: number): THREE.Matrix4 {
  return new THREE.Matrix4().compose(v.set(x, y, z), q.setFromEuler(e.set(rx, ry, rz)), s.set(sx, sy, sz));
}

/**
 * Two faces in the same plane (a skirting board flush with the panel behind it, a rug on a rug) flicker,
 * because the graphics card can't tell which is in front. So every shape grows by its own couple of
 * millimetres (a golden-ratio step, so shapes painted near each other always differ), far below a pixel
 * but enough that no two faces ever share a plane. Thin pieces grow by at most a quarter of their size.
 */
let shapeCount = 0;
function apart(m: THREE.Matrix4): THREE.Matrix4 {
  const d = 0.0006 + 0.005 * ((shapeCount++ * 0.6180339887) % 1);
  m.decompose(v, q, s);
  const grow = (x: number) => x + Math.sign(x) * Math.min(2 * d, Math.abs(x) * 0.25);
  return m.compose(v, q, s.set(grow(s.x), grow(s.y), grow(s.z)));
}

/**
 * Paints primitives into a set of builders, inside a local frame (a building's position and facing).
 * Boxes, cylinders and cones are given by size and centre; `y` is the centre height unless noted.
 */
export class Paint {
  constructor(
    public layers: Layers,
    public m: THREE.Matrix4 = new THREE.Matrix4(),
  ) {}

  /** A painter for a child frame: moved, turned about y, and scaled. */
  at(x: number, y: number, z: number, ry = 0, scale = 1): Paint {
    const child = this.m.clone().multiply(mat(x, y, z, 0, ry, 0, scale, scale, scale));
    return new Paint(this.layers, child);
  }

  /** The same frame, painting into a different layer. */
  get glass(): Paint {
    return new Paint({ main: this.layers.glass, glass: this.layers.glass }, this.m);
  }

  /** The same frame, painting leaves and grass (which sway) when the place keeps them apart. */
  get leaves(): Paint {
    const f = this.layers.foliage;
    return f ? new Paint({ main: f, glass: this.layers.glass, foliage: f }, this.m) : this;
  }

  geo(geo: THREE.BufferGeometry, color: THREE.ColorRepresentation, m: THREE.Matrix4): this {
    this.layers.main.add(geo, color, apart(m), this.m);
    return this;
  }

  box(color: THREE.ColorRepresentation, w: number, h: number, d: number, x: number, y: number, z: number, rx = 0, ry = 0, rz = 0): this {
    return this.geo(G.box(), color, mat(x, y, z, rx, ry, rz, w, h, d));
  }

  /** A box standing on y (its bottom at y). */
  block(color: THREE.ColorRepresentation, w: number, h: number, d: number, x: number, y: number, z: number, ry = 0): this {
    return this.box(color, w, h, d, x, y + h / 2, z, 0, ry, 0);
  }

  cyl(color: THREE.ColorRepresentation, r: number, h: number, x: number, y: number, z: number, n = SIDES, rx = 0, ry = 0, rz = 0): this {
    return this.geo(G.cyl(round(n)), color, mat(x, y, z, rx, ry, rz, r, h, r));
  }

  /** A cylinder standing on y. */
  post(color: THREE.ColorRepresentation, r: number, h: number, x: number, y: number, z: number, n = SIDES): this {
    return this.cyl(color, r, h, x, y + h / 2, z, n);
  }

  taper(color: THREE.ColorRepresentation, top: number, r: number, h: number, x: number, y: number, z: number, n = SIDES): this {
    return this.geo(G.taper(top, round(n)), color, mat(x, y + h / 2, z, 0, 0, 0, r, h, r));
  }

  /** A cone standing on y. */
  cone(color: THREE.ColorRepresentation, r: number, h: number, x: number, y: number, z: number, n = SIDES, ry = 0): this {
    return this.geo(G.cone(round(n)), color, mat(x, y + h / 2, z, 0, ry, 0, r, h, r));
  }

  ico(color: THREE.ColorRepresentation, r: number, x: number, y: number, z: number, detail = 0, sy = 1, ry = 0): this {
    return this.geo(G.ico(detail), color, mat(x, y, z, 0, ry, 0, r, r * sy, r));
  }

  /** A lumpy ball: tree crowns, bushes, rocks. `k` picks one of a few shapes; `fine` for the ones seen up close. */
  blob(color: THREE.ColorRepresentation, r: number, x: number, y: number, z: number, k = 0, sy = 1, ry = 0, rx = 0, fine = false): this {
    return this.geo(G.blob(k, fine), color, mat(x, y, z, rx, ry, 0, r, r * sy, r));
  }

  /** A box with softened edges (centre at x, y, z). The edge radius is `edge` metres, capped at a third of the smallest side. */
  rbox(color: THREE.ColorRepresentation, w: number, h: number, d: number, x: number, y: number, z: number, edge = 0.03, ry = 0): this {
    const minSide = Math.min(w, h, d);
    const r = Math.min(edge / minSide, 0.33);
    // Rounded boxes don't scale evenly, so the radius is set for the smallest side and the rest stretch a touch.
    return this.geo(G.rbox(Math.round(r * 100) / 100), color, mat(x, y, z, 0, ry, 0, w, h, d));
  }

  /** A half sphere sitting on y, flat side down. */
  dome(color: THREE.ColorRepresentation, r: number, x: number, y: number, z: number, sy = 1, w = 16): this {
    return this.geo(G.dome(w), color, mat(x, y, z, 0, 0, 0, r, r * sy, r));
  }

  sphere(color: THREE.ColorRepresentation, rx: number, ry: number, rz: number, x: number, y: number, z: number, w = 16, h = 10): this {
    const ww = w <= 5 ? w : Math.max(w, 16);
    const hh = h <= 4 ? h : Math.max(h, 10);
    return this.geo(G.sphere(ww, hh), color, mat(x, y, z, 0, 0, 0, rx, ry, rz));
  }

  /** A short rod between two points, for ropes, rails and branches. */
  rod(color: THREE.ColorRepresentation, r: number, ax: number, ay: number, az: number, bx: number, by: number, bz: number, n = 8): this {
    const dx = bx - ax;
    const dy = by - ay;
    const dz = bz - az;
    const len = Math.hypot(dx, dy, dz);
    if (len < 1e-5) return this;
    const dir = new THREE.Vector3(dx, dy, dz).normalize();
    const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
    const m = new THREE.Matrix4().compose(new THREE.Vector3((ax + bx) / 2, (ay + by) / 2, (az + bz) / 2), quat, new THREE.Vector3(r, len, r));
    return this.geo(G.cyl(round(n)), color, m);
  }

  /** A sagging rope between two points, in a few straight pieces. */
  rope(color: THREE.ColorRepresentation, r: number, ax: number, ay: number, az: number, bx: number, by: number, bz: number, sag = 0.15, pieces = 6): this {
    let px = ax;
    let py = ay;
    let pz = az;
    for (let i = 1; i <= pieces; i++) {
      const t = i / pieces;
      const x = ax + (bx - ax) * t;
      const y = ay + (by - ay) * t - Math.sin(t * Math.PI) * sag;
      const z = az + (bz - az) * t;
      this.rod(color, r, px, py, pz, x, y, z, 6);
      px = x;
      py = y;
      pz = z;
    }
    return this;
  }

  /** A gable: triangular prism `len` long (x), `base` wide (z), `h` tall, standing on y. */
  prism(color: THREE.ColorRepresentation, len: number, h: number, base: number, x: number, y: number, z: number, ry = 0): this {
    return this.geo(G.prism(), color, mat(x, y, z, 0, ry, 0, len, h, base));
  }

  torus(color: THREE.ColorRepresentation, r: number, tube: number, x: number, y: number, z: number, rx = 0, ry = 0): this {
    return this.geo(G.torus(Math.round((tube / r) * 100) / 100, 6, 16), color, mat(x, y, z, rx, ry, 0, r, r, r));
  }

  /**
   * A pitched roof over a rectangle `len` (x) by `depth` (z) whose eaves sit at `y`, rising `h` to the
   * ridge, with an overhang. Two slabs meeting along a ridge that runs along x, laid with rows of tiles
   * and a row of rounded ridge caps.
   */
  roof(color: THREE.ColorRepresentation, len: number, depth: number, h: number, y: number, overhang = 0.4, thick = 0.18, x = 0, z = 0, ry = 0, tiles = true): this {
    const half = depth / 2;
    const slope = Math.hypot(h, half);
    const ang = Math.atan2(h, half);
    const width = len + overhang * 1.4;
    for (const side of [1, -1]) {
      const p = this.at(x, 0, z, ry + (side < 0 ? Math.PI : 0));
      const length = slope + overhang;
      // Centre of the slab, starting at the ridge and running down past the eave.
      const cz = (Math.cos(ang) * length) / 2;
      const cy = y + h - (Math.sin(ang) * length) / 2;
      // Lift the slab off the gable along its normal so the wall doesn't poke through.
      const nz = Math.sin(ang) * thick * 0.5;
      const ny = Math.cos(ang) * thick * 0.5;
      p.box(color, width, thick, length, 0, cy + ny, cz + nz, ang);
      if (!tiles) continue;
      // Rows of tiles down the slope, each row staggered by half a tile.
      const rows = Math.max(3, Math.round(length / 0.42));
      const cols = Math.max(2, Math.round(width / 0.4));
      const tw = width / cols;
      const tl = length / rows;
      const tt = 0.045;
      const lift = thick + tt * 0.5 + 0.01;
      for (let i = 0; i < rows; i++) {
        const d = (i + 0.5) * tl;
        const rz = Math.cos(ang) * d + Math.sin(ang) * lift;
        const ryy = y + h - Math.sin(ang) * d + Math.cos(ang) * lift;
        const stagger = i % 2 ? tw / 2 : 0;
        for (let j = 0; j < cols + (i % 2 ? 1 : 0); j++) {
          const cx = -width / 2 + (j + 0.5) * tw - stagger;
          const w = Math.min(tw - 0.03, width / 2 - Math.abs(cx) + tw / 2 - 0.03);
          if (w < 0.08) continue;
          const t = ((i * 7 + j * 13 + side * 3) % 9) / 9 - 0.5;
          p.box(shade(color, t * 0.09), w, tt, tl + 0.04, Math.max(-width / 2 + w / 2, Math.min(width / 2 - w / 2, cx)), ryy, rz, ang);
        }
      }
    }
    // Ridge caps: a row of rounded tiles along the top, over a ridge beam that closes the gap between the slabs.
    const top = this.at(x, 0, z, ry);
    const capLen = len + overhang * 1.5;
    // The beam stops just inside the end caps, so its square end never shows past the round ones.
    top.box(shade(color, -0.16), capLen - 0.12, thick * 1.3, thick * 1.5, 0, y + h + thick * 0.45, 0);
    const caps = Math.max(2, Math.round(capLen / 0.45));
    const cw = capLen / caps;
    for (let j = 0; j < caps; j++) {
      top.cyl(shade(color, j % 2 ? -0.14 : -0.1), thick * 1.1, cw - 0.03, -capLen / 2 + (j + 0.5) * cw, y + h + thick * 0.8, 0, 10, 0, 0, Math.PI / 2);
    }
    return this;
  }
}

/** Lightens (+) or darkens (-) a colour. */
export function shade(color: THREE.ColorRepresentation, amount: number): THREE.Color {
  const c = new THREE.Color(color);
  const hsl = { h: 0, s: 0, l: 0 };
  c.getHSL(hsl);
  c.setHSL(hsl.h, hsl.s, THREE.MathUtils.clamp(hsl.l + amount, 0, 1));
  return c;
}

/** Picks from a list with a random function. */
export const pick = <T>(r: () => number, list: T[]): T => list[Math.floor(r() * list.length) % list.length];

/** World frame for a building at x, z facing ry. */
export function frame(x: number, z: number, ry: number): THREE.Matrix4 {
  return mat(x, 0, z, 0, ry, 0, 1, 1, 1);
}

/** Turns a local offset in a building's frame into world x, z. */
export function local(x: number, z: number, ry: number, lx: number, lz: number): { x: number; z: number } {
  const c = Math.cos(ry);
  const sn = Math.sin(ry);
  return { x: x + lx * c + lz * sn, z: z - lx * sn + lz * c };
}

/**
 * Smooth normals across edges gentler than `deg`, sharp ones kept: the same result as three's
 * `toCreasedNormals`, but several times faster on the town's big merged meshes (numbers, not strings, for the
 * position hash, and no per-triangle allocations). Works in place on a non-indexed geometry.
 */
export function creaseNormals(geo: THREE.BufferGeometry, deg = SMOOTH_DEG): THREE.BufferGeometry {
  const posAttr = geo.getAttribute('position') as THREE.BufferAttribute | undefined;
  if (!posAttr || geo.index) return geo;
  const p = posAttr.array as Float32Array;
  const verts = posAttr.count;
  const tris = Math.floor(verts / 3);
  const creaseDot = Math.cos(THREE.MathUtils.degToRad(deg));
  // Face normals.
  const fn = new Float32Array(tris * 3);
  for (let t = 0; t < tris; t++) {
    const a = t * 9;
    const ux = p[a + 3] - p[a];
    const uy = p[a + 4] - p[a + 1];
    const uz = p[a + 5] - p[a + 2];
    const vx = p[a + 6] - p[a];
    const vy = p[a + 7] - p[a + 1];
    const vz = p[a + 8] - p[a + 2];
    let nx = uy * vz - uz * vy;
    let ny = uz * vx - ux * vz;
    let nz = ux * vy - uy * vx;
    const l = Math.hypot(nx, ny, nz) || 1;
    nx /= l;
    ny /= l;
    nz /= l;
    fn[t * 3] = nx;
    fn[t * 3 + 1] = ny;
    fn[t * 3 + 2] = nz;
  }
  // Group the corners that share a position (to the centimetre).
  const groupOf = new Int32Array(verts);
  const ids = new Map<number, number>();
  for (let v = 0; v < verts; v++) {
    const ix = Math.trunc(p[v * 3] * 100) + 65536;
    const iy = Math.trunc(p[v * 3 + 1] * 100) + 65536;
    const iz = Math.trunc(p[v * 3 + 2] * 100) + 65536;
    const key = (ix * 131072 + iy) * 131072 + iz;
    let g = ids.get(key);
    if (g === undefined) {
      g = ids.size;
      ids.set(key, g);
    }
    groupOf[v] = g;
  }
  const groups = ids.size;
  const start = new Int32Array(groups + 1);
  for (let v = 0; v < verts; v++) start[groupOf[v] + 1]++;
  for (let g = 0; g < groups; g++) start[g + 1] += start[g];
  const fill = start.slice(0, groups);
  const members = new Int32Array(verts);
  for (let v = 0; v < verts; v++) members[fill[groupOf[v]]++] = v;
  // Each corner takes the sum of the face normals at its position that are within the crease angle of its own.
  const out = new Float32Array(verts * 3);
  for (let v = 0; v < verts; v++) {
    const f = Math.floor(v / 3) * 3;
    const ax = fn[f];
    const ay = fn[f + 1];
    const az = fn[f + 2];
    let sx = 0;
    let sy = 0;
    let sz = 0;
    const g = groupOf[v];
    for (let k = start[g]; k < start[g + 1]; k++) {
      const o = Math.floor(members[k] / 3) * 3;
      const bx = fn[o];
      const by = fn[o + 1];
      const bz = fn[o + 2];
      if (ax * bx + ay * by + az * bz > creaseDot) {
        sx += bx;
        sy += by;
        sz += bz;
      }
    }
    const l = Math.hypot(sx, sy, sz) || 1;
    out[v * 3] = sx / l;
    out[v * 3 + 1] = sy / l;
    out[v * 3 + 2] = sz / l;
  }
  geo.setAttribute('normal', new THREE.BufferAttribute(out, 3));
  return geo;
}

/** A mesh from a builder, smoothed with the fast crease above. Casts and takes shadows unless told otherwise. */
export function smoothMesh(b: Builder, material: THREE.Material, opts: { cast?: boolean; receive?: boolean } = {}): THREE.Mesh {
  const geo = creaseNormals(b.geometry(0));
  geo.computeBoundingSphere();
  const mesh = new THREE.Mesh(geo, material);
  mesh.castShadow = opts.cast ?? true;
  mesh.receiveShadow = opts.receive ?? true;
  return mesh;
}
