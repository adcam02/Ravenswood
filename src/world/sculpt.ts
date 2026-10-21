import * as THREE from 'three';
import type { Vec3 } from './build';
import { Fold, audit, seeded, type Color } from './paper';

/**
 * Sculpting an animal as one continuous surface. Each animal is a set of simple shapes (ellipsoids, tapered
 * rods, chunky pyramids), each riding one bone, melted together where they meet (a smooth union, only near
 * the joint, so a paw hanging by the tummy doesn't fuse to it). The surface is pulled out of that field on a
 * grid (surface nets), snapped onto the surface, nudged a touch so the facets vary like folded card, and then:
 * - each corner is weighted to the bones whose shapes it's nearest (blending across the joints),
 * - each face is coloured by region (mask, muzzle, socks, rings...) so markings follow the facets,
 * - each face is darkened a little where the field says it's tucked into a crease (baked occlusion).
 */

/** Signed distance from a point (model space) to a shape. */
type SDF = (x: number, y: number, z: number) => number;

export interface Shape {
  d: SDF;
  /** A bounding sphere, for skipping shapes that can't matter. */
  c: THREE.Vector3;
  r: number;
  bone: string;
  /** How far it melts into the shapes before it, and where: near `anchor`, fading out by `reach`. */
  k: number;
  anchor?: THREE.Vector3;
  reach?: number;
  /** Cut this shape away instead of adding it. */
  carve?: boolean;
  /** Thin enough to need fattening when the surface is cut coarsely (ears). */
  thin?: boolean;
  /** Its own crease where it meets other shapes, if it should be crisper than the usual (an ear's notch). */
  crease?: number;
  name?: string;
  /** Where a point is on this shape's own unit form (for drawing markings on it). */
  unit?: (p: THREE.Vector3) => THREE.Vector3;
}

// ---------------------------------------------------------------- distance functions

const len3 = (x: number, y: number, z: number) => Math.sqrt(x * x + y * y + z * z);

/** A local frame: model point to the shape's own axes. */
function framer(centre: Vec3, rot?: Vec3) {
  const inv = new THREE.Matrix4().compose(new THREE.Vector3(...centre), new THREE.Quaternion().setFromEuler(new THREE.Euler(...(rot ?? [0, 0, 0]))), new THREE.Vector3(1, 1, 1)).invert();
  const e = inv.elements;
  return (x: number, y: number, z: number, out: number[]) => {
    out[0] = e[0] * x + e[4] * y + e[8] * z + e[12];
    out[1] = e[1] * x + e[5] * y + e[9] * z + e[13];
    out[2] = e[2] * x + e[6] * y + e[10] * z + e[14];
  };
}

/** An ellipsoid (a close bound, after Inigo Quilez). */
export function ellipsoid(bone: string, centre: Vec3, r: Vec3, o: { rot?: Vec3; k?: number; anchor?: Vec3; reach?: number; name?: string; carve?: boolean; thin?: boolean } = {}): Shape {
  const toLocal = framer(centre, o.rot);
  const l = [0, 0, 0];
  const [rx, ry, rz] = r;
  const d: SDF = (x, y, z) => {
    toLocal(x, y, z, l);
    const k0 = len3(l[0] / rx, l[1] / ry, l[2] / rz);
    const k1 = len3(l[0] / (rx * rx), l[1] / (ry * ry), l[2] / (rz * rz));
    return k1 < 1e-9 ? -Math.min(rx, ry, rz) : (k0 * (k0 - 1)) / k1;
  };
  return {
    d,
    c: new THREE.Vector3(...centre),
    r: Math.max(rx, ry, rz),
    bone,
    k: o.k ?? 0,
    anchor: o.anchor ? new THREE.Vector3(...o.anchor) : undefined,
    reach: o.reach,
    name: o.name,
    carve: o.carve,
    thin: o.thin,
    unit: (p) => {
      toLocal(p.x, p.y, p.z, l);
      return new THREE.Vector3(l[0] / rx, l[1] / ry, l[2] / rz);
    },
  };
}

/** A rod from a to b, radius ra at a and rb at b, rounded at both ends (exact, after Inigo Quilez). */
export function rod(bone: string, a: Vec3, b: Vec3, ra: number, rb: number, o: { k?: number; anchor?: Vec3; reach?: number; name?: string; squash?: Vec3; thin?: boolean } = {}): Shape {
  const [ax, ay, az] = a;
  const bax = b[0] - ax;
  const bay = b[1] - ay;
  const baz = b[2] - az;
  const l2 = bax * bax + bay * bay + baz * baz;
  const rr = ra - rb;
  const a2 = l2 - rr * rr;
  const il2 = 1 / l2;
  // An optional squash (scaling about the rod's middle), for flattened shapes like the snail's foot.
  const mid = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2];
  const sq = o.squash;
  const d: SDF = (x0, y0, z0) => {
    let x = x0;
    let y = y0;
    let z = z0;
    let s = 1;
    if (sq) {
      x = mid[0] + (x0 - mid[0]) / sq[0];
      y = mid[1] + (y0 - mid[1]) / sq[1];
      z = mid[2] + (z0 - mid[2]) / sq[2];
      s = Math.min(sq[0], sq[1], sq[2]);
    }
    const pax = x - ax;
    const pay = y - ay;
    const paz = z - az;
    const yy = pax * bax + pay * bay + paz * baz;
    const zz = yy - l2;
    const qx = pax * l2 - bax * yy;
    const qy = pay * l2 - bay * yy;
    const qz = paz * l2 - baz * yy;
    const x2 = qx * qx + qy * qy + qz * qz;
    const y2 = yy * yy * l2;
    const z2 = zz * zz * l2;
    const k = Math.sign(rr) * rr * rr * x2;
    let dist: number;
    if (Math.sign(zz) * a2 * z2 > k) dist = Math.sqrt(x2 + z2) * il2 - rb;
    else if (Math.sign(yy) * a2 * y2 < k) dist = Math.sqrt(x2 + y2) * il2 - ra;
    else dist = (Math.sqrt(x2 * a2 * il2) + yy * rr) * il2 - ra;
    return dist * s;
  };
  const c = new THREE.Vector3((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2);
  const ext = sq ? Math.max(...sq) : 1;
  return {
    d,
    c,
    r: (Math.sqrt(l2) / 2 + Math.max(ra, rb)) * ext,
    bone,
    k: o.k ?? 0,
    anchor: o.anchor ? new THREE.Vector3(...o.anchor) : undefined,
    reach: o.reach,
    name: o.name,
    thin: o.thin,
    unit: (p) => {
      // Along the rod (0 to 1), then across it.
      const t = ((p.x - ax) * bax + (p.y - ay) * bay + (p.z - az) * baz) * il2;
      return new THREE.Vector3(0, t, 0);
    },
  };
}

/**
 * A chunky pyramid with a square base (half-width w, half-depth dz) and height h, its apex up its own +y,
 * rounded off by `round` (an ear). Placed at `base` and turned by `rot`.
 */
export function pyramid(bone: string, base: Vec3, w: number, h: number, dz: number, o: { rot?: Vec3; k?: number; anchor?: Vec3; reach?: number; round?: number; name?: string; carve?: boolean; thin?: boolean; crease?: number } = {}): Shape {
  const toLocal = framer(base, o.rot);
  const l = [0, 0, 0];
  const round = o.round ?? 0.008;
  // The unit pyramid has a base of side 1 and height hh; stretched to the real width and depth, less the
  // rounding (which fattens it back out to size).
  const sx = 2 * Math.max(0.002, w - round);
  const sz = 2 * Math.max(0.002, dz - round);
  const hh = Math.max(0.002, h - round) / Math.min(sx, sz);
  const s = Math.min(sx, sz);
  const m2 = hh * hh + 0.25;
  const d: SDF = (x, y, z) => {
    toLocal(x, y, z, l);
    let px = Math.abs(l[0] / sx);
    const py = l[1] / s;
    let pz = Math.abs(l[2] / sz);
    if (pz > px) {
      const t = px;
      px = pz;
      pz = t;
    }
    px -= 0.5;
    pz -= 0.5;
    const qx = pz;
    const qy = hh * py - 0.5 * px;
    const qz = hh * px + 0.5 * py;
    const ss = Math.max(-qx, 0);
    const t = Math.min(1, Math.max(0, (qy - 0.5 * pz) / (m2 + 0.25)));
    const a = m2 * (qx + ss) * (qx + ss) + qy * qy;
    const b = m2 * (qx + 0.5 * t) * (qx + 0.5 * t) + (qy - m2 * t) * (qy - m2 * t);
    const d2 = Math.min(qy, -qx * m2 - qy * 0.5) > 0 ? 0 : Math.min(a, b);
    return Math.sqrt((d2 + qz * qz) / m2) * Math.sign(Math.max(qz, -py)) * s - round;
  };
  return {
    d,
    c: new THREE.Vector3(...base).add(new THREE.Vector3(0, h / 2, 0).applyEuler(new THREE.Euler(...(o.rot ?? [0, 0, 0])))),
    r: Math.max(w, h, dz) * 1.2,
    bone,
    k: o.k ?? 0,
    anchor: o.anchor ? new THREE.Vector3(...o.anchor) : undefined,
    reach: o.reach,
    name: o.name,
    carve: o.carve,
    thin: o.thin,
    crease: o.crease,
    unit: (p) => {
      toLocal(p.x, p.y, p.z, l);
      return new THREE.Vector3(l[0] / w, l[1] / h, l[2] / dz);
    },
  };
}

/**
 * A coiled shell: a tube wound in a flat spiral (in the y-z plane, about `centre`) that starts at angle a0
 * (0 straight below the centre, a quarter turn in front of it) with radius R0, shrinks by `b` every radian,
 * and is `c` of the spiral's radius thick there, a little narrower side to side (`sx`). Its unit form is how
 * far across (x), along the coil (y, 0 to 1) and out from the coil's middle line (z, -1 inside to 1 outside).
 */
export function spiral(bone: string, centre: Vec3, o: { R0: number; b: number; a0: number; turns: number; c: number; sx?: number; k?: number; anchor?: Vec3; reach?: number; name?: string }): Shape {
  const [cx, cy, cz] = centre;
  const sx = o.sx ?? 1;
  const end = o.a0 + o.turns * Math.PI * 2;
  const R = (a: number) => o.R0 * Math.exp(-o.b * (a - o.a0));
  const at = (a: number) => [cx, cy - R(a) * Math.cos(a), cz + R(a) * Math.sin(a)];
  const ends = [o.a0, end].map((a) => ({ p: at(a), r: o.c * R(a) }));
  // The nearest bit of the coil to a point: its angle and distance.
  const nearest = (x: number, y: number, z: number) => {
    const px = (x - cx) / sx;
    const py = y - cy;
    const pz = z - cz;
    const rho = Math.hypot(py, pz);
    const phi = Math.atan2(pz, -py);
    let best = Infinity;
    let ba = o.a0;
    let bz = 0;
    for (let a = phi + Math.ceil((o.a0 - phi) / (Math.PI * 2)) * Math.PI * 2; a <= end; a += Math.PI * 2) {
      const Ra = R(a);
      const d = Math.hypot(rho - Ra, px) - o.c * Ra;
      if (d < best) {
        best = d;
        ba = a;
        bz = (rho - Ra) / (o.c * Ra);
      }
    }
    // Rounded ends.
    for (const e of ends) {
      const d = Math.hypot((x - e.p[0]) / sx, y - e.p[1], z - e.p[2]) - e.r;
      if (d < best) best = d;
    }
    return { d: best * Math.min(1, sx), a: ba, z: bz, x: px };
  };
  return {
    d: (x, y, z) => nearest(x, y, z).d,
    c: new THREE.Vector3(cx, cy, cz),
    r: o.R0 * (1 + o.c) + 0.01,
    bone,
    k: o.k ?? 0,
    anchor: o.anchor ? new THREE.Vector3(...o.anchor) : undefined,
    reach: o.reach,
    name: o.name,
    unit: (p) => {
      const n = nearest(p.x, p.y, p.z);
      return new THREE.Vector3(n.x / (o.c * R(n.a)), (n.a - o.a0) / (end - o.a0), n.z);
    },
  };
}

// ---------------------------------------------------------------- the field

/** A smooth minimum (polynomial, after Inigo Quilez): melts two shapes together over about k. */
const smin = (a: number, b: number, k: number) => {
  if (k <= 1e-6) return Math.min(a, b);
  const h = Math.max(k - Math.abs(a - b), 0) / k;
  return Math.min(a, b) - h * h * k * 0.25;
};

/** How much a shape melts in at a point: its full blend near its anchor, just a soft crease beyond its reach. */
function blendAt(s: Shape, x: number, y: number, z: number, soft: number): number {
  const crease = s.crease ?? soft;
  if (!s.anchor || !s.reach) return Math.max(crease, s.k);
  const t = 1 - len3(x - s.anchor.x, y - s.anchor.y, z - s.anchor.z) / s.reach;
  if (t <= 0) return crease;
  const u = Math.min(1, t);
  return Math.max(crease, s.k * u * u * (3 - 2 * u));
}

export class Sculpt {
  shapes: Shape[] = [];
  /** Shapes that aren't part of the surface, only there to draw markings by (the inside of an ear). */
  guides: Shape[] = [];
  /** How much thin shapes are fattened (for cutting the surface coarsely). */
  grow = 0;
  /**
   * Even shapes that don't melt together meet in a crease this soft, so no crease is a hard fold. (Cut
   * coarsely, it has to be softer: a crease much tighter than the cut folds over.)
   */
  crease = 0.012;

  add(...s: Shape[]): this {
    this.shapes.push(...s);
    return this;
  }

  /** The field at a point, using only some shapes (by index) if given. */
  at(x: number, y: number, z: number, only?: number[]): number {
    const S = this.shapes;
    let f = Infinity;
    const n = only ? only.length : S.length;
    for (let j = 0; j < n; j++) {
      const s = S[only ? only[j] : j];
      if (s.carve) {
        // Bitten out of everything before it.
        if (f === Infinity) continue;
        f = -smin(-f, s.d(x, y, z), s.k);
        continue;
      }
      // A shape can't matter if even its bounding sphere is further away than what's here already.
      const g = s.thin ? this.grow : 0;
      const far = len3(x - s.c.x, y - s.c.y, z - s.c.z) - s.r - g;
      if (far > f + s.k + this.crease) continue;
      const d = s.d(x, y, z) - g;
      f = f === Infinity ? d : smin(f, d, blendAt(s, x, y, z, this.crease));
    }
    return f;
  }

  /** The field's slope at a point (which way is out). */
  grad(x: number, y: number, z: number, out = new THREE.Vector3(), e = 0.002): THREE.Vector3 {
    out.set(this.at(x + e, y, z) - this.at(x - e, y, z), this.at(x, y + e, z) - this.at(x, y - e, z), this.at(x, y, z + e) - this.at(x, y, z - e));
    return out.normalize();
  }

  named(name: string): Shape | undefined {
    return this.shapes.find((s) => s.name === name) ?? this.guides.find((s) => s.name === name);
  }

  /** The model's bounds, from every shape's bounding sphere. */
  bounds(): THREE.Box3 {
    const b = new THREE.Box3();
    for (const s of this.shapes) {
      if (s.carve) continue;
      b.expandByPoint(s.c.clone().addScalar(s.r));
      b.expandByPoint(s.c.clone().addScalar(-s.r));
    }
    return b;
  }
}

// ---------------------------------------------------------------- the surface

export interface Mesh {
  /** Corner positions, and triangles as three corner indices each. */
  pos: Float32Array;
  tris: Uint32Array;
  /** The shapes that could matter at each corner (all of them if not given). */
  near?: (number[] | undefined)[];
  /** Which way is out at each corner (the surface's normal there). */
  grads?: Float32Array;
  /** Which marking each corner is in (-1 for those sitting on a border). */
  labels?: Int32Array;
}

/**
 * Pulls the surface out of the field on a grid of `step` (naive surface nets), working block by block and
 * only looking closely where the surface is, then snaps each corner onto the surface and nudges it a little.
 */
export function polygonise(sc: Sculpt, step: number, seed: number, jitter = 0.18, shift = 0): Mesh {
  const box = sc.bounds();
  box.expandByScalar(step * 2);
  // The grid can be shifted a little, for another try where a fold won't settle.
  box.min.addScalar(-shift * step);
  const nx = Math.ceil((box.max.x - box.min.x) / step) + 1;
  const ny = Math.ceil((box.max.y - box.min.y) / step) + 1;
  const nz = Math.ceil((box.max.z - box.min.z) / step) + 1;
  const ox = box.min.x;
  const oy = box.min.y;
  const oz = box.min.z;
  const val = new Float32Array(nx * ny * nz);
  const id = (i: number, j: number, k: number) => i + nx * (j + ny * k);
  // Blocks of B cells: check the middle of each, skip the block if the surface can't be in it, and only
  // use the shapes that could matter there (remembered for the corners made in it).
  const B = 4;
  const nbx = Math.ceil(nx / B);
  const nby = Math.ceil(ny / B);
  const bid = (i: number, j: number, k: number) => Math.floor(i / B) + nbx * (Math.floor(j / B) + nby * Math.floor(k / B));
  const blockNear = new Map<number, number[]>();
  const half = (B * step * Math.sqrt(3)) / 2;
  for (let bk = 0; bk < nz; bk += B) {
    for (let bj = 0; bj < ny; bj += B) {
      for (let bi = 0; bi < nx; bi += B) {
        const cx = ox + (bi + B / 2) * step;
        const cy = oy + (bj + B / 2) * step;
        const cz = oz + (bk + B / 2) * step;
        const F = sc.at(cx, cy, cz);
        const i1 = Math.min(nx, bi + B);
        const j1 = Math.min(ny, bj + B);
        const k1 = Math.min(nz, bk + B);
        if (Math.abs(F) > half * 1.15 + step) {
          for (let k = bk; k < k1; k++) for (let j = bj; j < j1; j++) for (let i = bi; i < i1; i++) val[id(i, j, k)] = F;
          continue;
        }
        const near: number[] = [];
        sc.shapes.forEach((s, n) => {
          if (s.carve) {
            near.push(n);
            return;
          }
          const far = len3(cx - s.c.x, cy - s.c.y, cz - s.c.z) - s.r - (s.thin ? sc.grow : 0);
          if (far <= Math.max(F, 0) + 2 * half + s.k + sc.crease) near.push(n);
        });
        blockNear.set(bid(bi, bj, bk), near);
        for (let k = bk; k < k1; k++) for (let j = bj; j < j1; j++) for (let i = bi; i < i1; i++) val[id(i, j, k)] = sc.at(ox + i * step, oy + j * step, oz + k * step, near);
      }
    }
  }
  // One corner per cell the surface passes through, at the average of where it crosses the cell's edges.
  const cellVert = new Int32Array((nx - 1) * (ny - 1) * (nz - 1)).fill(-1);
  const cid = (i: number, j: number, k: number) => i + (nx - 1) * (j + (ny - 1) * k);
  const raw: number[] = [];
  const vNear: (number[] | undefined)[] = [];
  const corners = [
    [0, 0, 0],
    [1, 0, 0],
    [0, 1, 0],
    [1, 1, 0],
    [0, 0, 1],
    [1, 0, 1],
    [0, 1, 1],
    [1, 1, 1],
  ];
  const edges = [
    [0, 1],
    [2, 3],
    [4, 5],
    [6, 7],
    [0, 2],
    [1, 3],
    [4, 6],
    [5, 7],
    [0, 4],
    [1, 5],
    [2, 6],
    [3, 7],
  ];
  const v = new Float32Array(8);
  for (let k = 0; k < nz - 1; k++) {
    for (let j = 0; j < ny - 1; j++) {
      for (let i = 0; i < nx - 1; i++) {
        let inside = 0;
        for (let c = 0; c < 8; c++) {
          v[c] = val[id(i + corners[c][0], j + corners[c][1], k + corners[c][2])];
          if (v[c] < 0) inside++;
        }
        if (inside === 0 || inside === 8) continue;
        let sx = 0;
        let sy = 0;
        let sz = 0;
        let n = 0;
        for (const [a, b] of edges) {
          if (v[a] < 0 === v[b] < 0) continue;
          const t = v[a] / (v[a] - v[b]);
          sx += corners[a][0] + (corners[b][0] - corners[a][0]) * t;
          sy += corners[a][1] + (corners[b][1] - corners[a][1]) * t;
          sz += corners[a][2] + (corners[b][2] - corners[a][2]) * t;
          n++;
        }
        cellVert[cid(i, j, k)] = raw.length / 3;
        raw.push(ox + (i + sx / n) * step, oy + (j + sy / n) * step, oz + (k + sz / n) * step);
        vNear.push(blockNear.get(bid(i, j, k)));
      }
    }
  }
  // A quad across every grid edge the surface crosses, wound so its front faces out.
  const quads: number[] = [];
  for (let k = 1; k < nz - 1; k++) {
    for (let j = 1; j < ny - 1; j++) {
      for (let i = 1; i < nx - 1; i++) {
        const a = val[id(i, j, k)] < 0;
        const q: number[] = [];
        // Along x, y and z.
        if (a !== val[id(i + 1, j, k)] < 0) {
          q.push(cellVert[cid(i, j - 1, k - 1)], cellVert[cid(i, j, k - 1)], cellVert[cid(i, j, k)], cellVert[cid(i, j - 1, k)]);
          if (!a) q.push(...q.splice(0, 4).reverse());
        }
        if (a !== val[id(i, j + 1, k)] < 0) {
          const p = [cellVert[cid(i - 1, j, k - 1)], cellVert[cid(i, j, k - 1)], cellVert[cid(i, j, k)], cellVert[cid(i - 1, j, k)]];
          q.push(...(a ? p.reverse() : p));
        }
        if (a !== val[id(i, j, k + 1)] < 0) {
          const p = [cellVert[cid(i - 1, j - 1, k)], cellVert[cid(i, j - 1, k)], cellVert[cid(i, j, k)], cellVert[cid(i - 1, j, k)]];
          q.push(...(a ? p : p.reverse()));
        }
        for (let n = 0; n < q.length; n += 4) if (q[n] >= 0 && q[n + 1] >= 0 && q[n + 2] >= 0 && q[n + 3] >= 0) quads.push(q[n], q[n + 1], q[n + 2], q[n + 3]);
      }
    }
  }
  const nv = raw.length / 3;
  const field = (x: number, y: number, z: number, near?: number[]) => sc.at(x, y, z, near);
  // Snap each corner onto the surface (never more than half a cell), then nudge it a little along the
  // surface so no two facets match.
  const rnd = seeded(seed);
  const snapped = new Float32Array(nv * 3);
  const pos = new Float32Array(nv * 3);
  const grads = new Float32Array(nv * 3);
  const e = 0.002;
  const g = new THREE.Vector3();
  const t1 = new THREE.Vector3();
  const t2 = new THREE.Vector3();
  for (let n = 0; n < nv; n++) {
    const near = vNear[n];
    let x = raw[n * 3];
    let y = raw[n * 3 + 1];
    let z = raw[n * 3 + 2];
    const d = field(x, y, z, near);
    g.set(field(x + e, y, z, near) - d, field(x, y + e, z, near) - d, field(x, y, z + e, near) - d).normalize();
    const m = Math.max(-step * 0.5, Math.min(step * 0.5, d));
    x -= g.x * m;
    y -= g.y * m;
    z -= g.z * m;
    grads[n * 3] = g.x;
    grads[n * 3 + 1] = g.y;
    grads[n * 3 + 2] = g.z;
    snapped[n * 3] = x;
    snapped[n * 3 + 1] = y;
    snapped[n * 3 + 2] = z;
    t1.set(1, 0, 0).cross(g);
    if (t1.lengthSq() < 0.01) t1.set(0, 1, 0).cross(g);
    t1.normalize();
    t2.copy(g).cross(t1);
    const a = (rnd() - 0.5) * 2 * jitter * step;
    const b = (rnd() - 0.5) * 2 * jitter * step;
    const c = (rnd() - 0.5) * jitter * 0.25 * step;
    pos[n * 3] = x + t1.x * a + t2.x * b + g.x * c;
    pos[n * 3 + 1] = y + t1.y * a + t2.y * b + g.y * c;
    pos[n * 3 + 2] = z + t1.z * a + t2.z * b + g.z * c;
  }
  // Does a face look out of the surface, the way the surface at its corners does?
  const outward = (a: number, b: number, c: number) => facesOut(pos, grads, a, b, c);
  // Each quad into two triangles, split along whichever diagonal is shorter (and now and then the other, so
  // the facets don't all line up), unless only the other split faces out. Wherever a face still folds
  // inward, its corners settle back (unnudged, then unsnapped, then into their neighbours) until none do.
  const nq = quads.length / 4;
  const flips = Array.from({ length: nq }, () => rnd() < 0.15);
  const split = new Int8Array(nq);
  const quadsOf: number[][] = Array.from({ length: nv }, () => []);
  const nbrs: Set<number>[] = Array.from({ length: nv }, () => new Set<number>());
  for (let q = 0; q < nq; q++) {
    for (let s = 0; s < 4; s++) {
      const n = quads[q * 4 + s];
      quadsOf[n].push(q);
      nbrs[n].add(quads[q * 4 + ((s + 1) % 4)]).add(quads[q * 4 + ((s + 3) % 4)]);
    }
  }
  // Which split a quad takes: 0 or 1, or -1 if neither faces out.
  const choose = (q: number) => {
    const [a, b, c, d] = [quads[q * 4], quads[q * 4 + 1], quads[q * 4 + 2], quads[q * 4 + 3]];
    const ac = len3(pos[a * 3] - pos[c * 3], pos[a * 3 + 1] - pos[c * 3 + 1], pos[a * 3 + 2] - pos[c * 3 + 2]);
    const bd = len3(pos[b * 3] - pos[d * 3], pos[b * 3 + 1] - pos[d * 3 + 1], pos[b * 3 + 2] - pos[d * 3 + 2]);
    const first = ac < bd !== flips[q] ? 0 : 1;
    for (const s of [first, 1 - first]) {
      if (s === 0 ? outward(a, b, c) && outward(a, c, d) : outward(a, b, d) && outward(b, c, d)) {
        split[q] = s;
        return;
      }
    }
    split[q] = -1;
  };
  let todo = new Set<number>(Array.from({ length: nq }, (_, q) => q));
  for (let pass = 0; todo.size; pass++) {
    for (const q of todo) choose(q);
    const bad = new Set<number>();
    for (const q of todo) if (split[q] < 0) for (let s = 0; s < 4; s++) bad.add(quads[q * 4 + s]);
    if (!bad.size || pass === 4) break;
    todo = new Set<number>();
    for (const n of bad) {
      if (pass === 0) pos.set(snapped.subarray(n * 3, n * 3 + 3), n * 3);
      else if (pass === 1) pos.set(raw.slice(n * 3, n * 3 + 3), n * 3);
      else {
        let x = 0;
        let y = 0;
        let z = 0;
        for (const m of nbrs[n]) {
          x += pos[m * 3];
          y += pos[m * 3 + 1];
          z += pos[m * 3 + 2];
        }
        const k = nbrs[n].size || 1;
        pos[n * 3] = x / k;
        pos[n * 3 + 1] = y / k;
        pos[n * 3 + 2] = z / k;
      }
      // Which way is out where it's moved to.
      const near = vNear[n];
      const x = pos[n * 3];
      const y = pos[n * 3 + 1];
      const z = pos[n * 3 + 2];
      const d = field(x, y, z, near);
      g.set(field(x + e, y, z, near) - d, field(x, y + e, z, near) - d, field(x, y, z + e, near) - d).normalize();
      grads[n * 3] = g.x;
      grads[n * 3 + 1] = g.y;
      grads[n * 3 + 2] = g.z;
      for (const q of quadsOf[n]) todo.add(q);
    }
  }
  const tris: number[] = [];
  for (let q = 0; q < nq; q++) {
    const [a, b, c, d] = [quads[q * 4], quads[q * 4 + 1], quads[q * 4 + 2], quads[q * 4 + 3]];
    if (split[q] === 1) tris.push(a, b, d, b, c, d);
    else tris.push(a, b, c, a, c, d);
  }
  return { pos, tris: new Uint32Array(tris), near: vNear, grads };
}

/**
 * Whether a face looks the same way out as the surface at its corners. (Its middle is no guide: on
 * something thin, like an ear's tip, a face's middle can sag nearer the far side.)
 */
function facesOut(pos: Float32Array, grads: Float32Array, a: number, b: number, c: number): boolean {
  const ux = pos[b * 3] - pos[a * 3];
  const uy = pos[b * 3 + 1] - pos[a * 3 + 1];
  const uz = pos[b * 3 + 2] - pos[a * 3 + 2];
  const vx = pos[c * 3] - pos[a * 3];
  const vy = pos[c * 3 + 1] - pos[a * 3 + 1];
  const vz = pos[c * 3 + 2] - pos[a * 3 + 2];
  const nx = uy * vz - uz * vy;
  const ny = uz * vx - ux * vz;
  const nz = ux * vy - uy * vx;
  const l2 = nx * nx + ny * ny + nz * nz;
  if (l2 < 1e-14) return true;
  let agree = 0;
  for (const v of [a, b, c]) agree += nx * grads[v * 3] + ny * grads[v * 3 + 1] + nz * grads[v * 3 + 2];
  // Clearly out, not just edge on.
  return agree > 0.15 * Math.sqrt(l2);
}

/**
 * The tidy-up of a cut surface once its corners are where they'll stay: works out which way is out at each
 * corner (unless it's known already and `fresh` is off), then wherever a face still doesn't face out with its corners (a fold in a tight crease or at
 * a thin tip), turns the edge it shares with a neighbour the other way, or failing that settles its corners
 * in among their neighbours, back on the surface.
 */
export function settle(sc: Sculpt, mesh: Mesh, fresh = true) {
  const pos = mesh.pos;
  const nv = pos.length / 3;
  const grads = fresh || !mesh.grads ? new Float32Array(nv * 3) : mesh.grads;
  const g = new THREE.Vector3();
  const e = 0.002;
  const normalAt = (v: number) => {
    const near = mesh.near?.[v];
    const x = pos[v * 3];
    const y = pos[v * 3 + 1];
    const z = pos[v * 3 + 2];
    g.set(sc.at(x + e, y, z, near) - sc.at(x - e, y, z, near), sc.at(x, y + e, z, near) - sc.at(x, y - e, z, near), sc.at(x, y, z + e, near) - sc.at(x, y, z - e, near)).normalize();
    grads[v * 3] = g.x;
    grads[v * 3 + 1] = g.y;
    grads[v * 3 + 2] = g.z;
  };
  if (grads !== mesh.grads) for (let v = 0; v < nv; v++) normalAt(v);
  mesh.grads = grads;
  const T = mesh.tris;
  const good = (t: number) => facesOut(pos, grads, T[t], T[t + 1], T[t + 2]);
  for (let pass = 0; pass < 8; pass++) {
    const bad: number[] = [];
    for (let t = 0; t < T.length; t += 3) if (!good(t)) bad.push(t);
    if (!bad.length) return;
    // Which faces meet along each edge.
    const edges = new Map<number, number[]>();
    for (let t = 0; t < T.length; t += 3) {
      for (let e = 0; e < 3; e++) {
        const a = T[t + e];
        const b = T[t + ((e + 1) % 3)];
        const key = Math.min(a, b) * nv + Math.max(a, b);
        const list = edges.get(key);
        if (list) list.push(t);
        else edges.set(key, [t]);
      }
    }
    const stuck = new Set<number>();
    // Faces already changed this pass (the map of edges is out of date round them until the next).
    const touched = new Set<number>();
    for (const t of bad) {
      if (good(t) || touched.has(t)) continue;
      let fixed = false;
      for (let i = 0; i < 3 && !fixed; i++) {
        const a = T[t + i];
        const b = T[t + ((i + 1) % 3)];
        const c = T[t + ((i + 2) % 3)];
        const other = edges.get(Math.min(a, b) * nv + Math.max(a, b))?.find((u) => u !== t);
        if (other === undefined || touched.has(other)) continue;
        const d = [T[other], T[other + 1], T[other + 2]].find((x) => x !== a && x !== b);
        if (d === undefined || d === c) continue;
        // Turn the edge a-b into c-d: faces (c, a, d) and (c, d, b).
        const was = [T[t], T[t + 1], T[t + 2], T[other], T[other + 1], T[other + 2]];
        T[t] = c;
        T[t + 1] = a;
        T[t + 2] = d;
        T[other] = c;
        T[other + 1] = d;
        T[other + 2] = b;
        if (good(t) && good(other)) {
          fixed = true;
          touched.add(t).add(other);
        } else [T[t], T[t + 1], T[t + 2], T[other], T[other + 1], T[other + 2]] = was;
      }
      if (fixed) continue;
      // A speck of a face (at a sharp tip) is simply pinched out: its shortest edge's ends meet in the middle,
      // which leaves it (and the face across that edge) with no area, so they're left out when it's baked.
      const [a, b, c] = [T[t], T[t + 1], T[t + 2]];
      const ab = len3(pos[a * 3] - pos[b * 3], pos[a * 3 + 1] - pos[b * 3 + 1], pos[a * 3 + 2] - pos[b * 3 + 2]);
      const bc = len3(pos[b * 3] - pos[c * 3], pos[b * 3 + 1] - pos[c * 3 + 1], pos[b * 3 + 2] - pos[c * 3 + 2]);
      const ca = len3(pos[c * 3] - pos[a * 3], pos[c * 3 + 1] - pos[a * 3 + 1], pos[c * 3 + 2] - pos[a * 3 + 2]);
      const sp = (ab + bc + ca) / 2;
      const area = Math.sqrt(Math.max(0, sp * (sp - ab) * (sp - bc) * (sp - ca)));
      if (area < 1.5e-4) {
        const [u, v] = ab <= bc && ab <= ca ? [a, b] : bc <= ca ? [b, c] : [c, a];
        for (let i = 0; i < 3; i++) pos[u * 3 + i] = pos[v * 3 + i] = (pos[u * 3 + i] + pos[v * 3 + i]) / 2;
        normalAt(u);
        grads.copyWithin(v * 3, u * 3, u * 3 + 3);
        continue;
      }
      for (let i = 0; i < 3; i++) stuck.add(T[t + i]);
    }
    // Settle a corner of each face that couldn't be turned right: into the middle of its neighbours, back on
    // the surface. Whichever corner fixes the face without folding another one round it.
    const ring = new Map<number, number[]>();
    const facesAt = new Map<number, number[]>();
    for (let t = 0; t < T.length; t += 3) {
      for (let c = 0; c < 3; c++) {
        const v = T[t + c];
        if (!stuck.has(v)) continue;
        const r = ring.get(v) ?? [];
        r.push(T[t + ((c + 1) % 3)], T[t + ((c + 2) % 3)]);
        ring.set(v, r);
        const fs = facesAt.get(v) ?? [];
        fs.push(t);
        facesAt.set(v, fs);
      }
    }
    const tryMove = (v: number, f: number) => {
      const r = ring.get(v)!;
      let x = 0;
      let y = 0;
      let z = 0;
      for (const m of r) {
        x += pos[m * 3];
        y += pos[m * 3 + 1];
        z += pos[m * 3 + 2];
      }
      x = pos[v * 3] + (x / r.length - pos[v * 3]) * f;
      y = pos[v * 3 + 1] + (y / r.length - pos[v * 3 + 1]) * f;
      z = pos[v * 3 + 2] + (z / r.length - pos[v * 3 + 2]) * f;
      const d = sc.at(x, y, z, mesh.near?.[v]);
      sc.grad(x, y, z, g);
      const old = [pos[v * 3], pos[v * 3 + 1], pos[v * 3 + 2]];
      const oldG = [grads[v * 3], grads[v * 3 + 1], grads[v * 3 + 2]];
      const wasBad = facesAt.get(v)!.filter((t) => !good(t)).length;
      pos[v * 3] = x - g.x * d;
      pos[v * 3 + 1] = y - g.y * d;
      pos[v * 3 + 2] = z - g.z * d;
      normalAt(v);
      const nowBad = facesAt.get(v)!.filter((t) => !good(t)).length;
      if (nowBad < wasBad) return true;
      pos.set(old, v * 3);
      grads.set(oldG, v * 3);
      return false;
    };
    for (const t of bad) {
      if (good(t)) continue;
      const corners = [T[t], T[t + 1], T[t + 2]].filter((v) => ring.has(v));
      // One corner at a time, part way, then all the way; if none helps, all three part way (as a last resort).
      if (corners.some((v) => tryMove(v, 0.5)) || corners.some((v) => tryMove(v, 1))) continue;
      if (pass >= 4) for (const v of corners) tryMove(v, 1) || void 0;
    }
  }
}

/** How many faces of a settled surface still don't face out with their corners. */
export function folds(mesh: Mesh): number {
  let n = 0;
  if (!mesh.grads) return 0;
  for (let t = 0; t < mesh.tris.length; t += 3) if (!facesOut(mesh.pos, mesh.grads, mesh.tris[t], mesh.tris[t + 1], mesh.tris[t + 2])) n++;
  return n;
}

/** A copy of a cut surface that can be changed without touching the original. */
export function copyMesh(m: Mesh): Mesh {
  return { pos: m.pos.slice(), tris: m.tris.slice(), near: m.near, grads: m.grads?.slice() };
}

/**
 * Thins a cut surface out to `keep` of its faces, for seeing from far off. One corner at a time is folded
 * into a neighbour (whichever changes the shape least: each corner remembers the planes of the faces it has
 * taken in), never where that would turn a face over, pinch the surface, squash a face to a sliver or make an
 * edge longer than `longest`. Every corner left is one of the originals, so it all stays on the sculpted
 * surface, and the facets stay about even.
 */
export function decimate(m: Mesh, keep: number, longest: number): Mesh {
  const pos = m.pos;
  const grads = m.grads!;
  const nv = pos.length / 3;
  const T = Array.from(m.tris);
  const nf = T.length / 3;
  const alive = new Uint8Array(nf).fill(1);
  let left = nf;
  const target = Math.round(nf * keep);
  const facesOf: number[][] = Array.from({ length: nv }, () => []);
  for (let f = 0; f < nf; f++) for (let c = 0; c < 3; c++) facesOf[T[f * 3 + c]].push(f);
  const has = (f: number, v: number) => T[f * 3] === v || T[f * 3 + 1] === v || T[f * 3 + 2] === v;
  // Each corner's quadric: the summed squared distance to the planes of its faces.
  const Q = new Float64Array(nv * 10);
  const A = new THREE.Vector3();
  const B = new THREE.Vector3();
  const C = new THREE.Vector3();
  const N = new THREE.Vector3();
  for (let f = 0; f < nf; f++) {
    A.fromArray(pos, T[f * 3] * 3);
    B.fromArray(pos, T[f * 3 + 1] * 3);
    C.fromArray(pos, T[f * 3 + 2] * 3);
    N.subVectors(B, A).cross(C.sub(A));
    if (N.lengthSq() < 1e-14) continue;
    N.normalize();
    const p = [N.x, N.y, N.z, -N.dot(A)];
    // Every face counts the same (so a small tip isn't cheap to lose).
    for (let c = 0; c < 3; c++) {
      const q = T[f * 3 + c] * 10;
      let i = 0;
      for (let r = 0; r < 4; r++) for (let s2 = r; s2 < 4; s2++) Q[q + i++] += p[r] * p[s2];
    }
  }
  const cost = (u: number, v: number) => {
    const x = pos[v * 3];
    const y = pos[v * 3 + 1];
    const z = pos[v * 3 + 2];
    const a = u * 10;
    const b = v * 10;
    const q = (i: number) => Q[a + i] + Q[b + i];
    // [x y z 1] Q [x y z 1], from the upper triangle (xx xy xz xw yy yz yw zz zw ww).
    return q(0) * x * x + 2 * q(1) * x * y + 2 * q(2) * x * z + 2 * q(3) * x + q(4) * y * y + 2 * q(5) * y * z + 2 * q(6) * y + q(7) * z * z + 2 * q(8) * z + q(9);
  };
  // The corners round a corner, into a given list.
  const mark = new Int32Array(nv);
  let tick = 0;
  const around = (u: number, out: number[]) => {
    tick++;
    out.length = 0;
    for (const f of facesOf[u]) {
      for (let c = 0; c < 3; c++) {
        const w = T[f * 3 + c];
        if (w !== u && mark[w] !== tick) {
          mark[w] = tick;
          out.push(w);
        }
      }
    }
    return out;
  };
  const ringU: number[] = [];
  const ringV: number[] = [];
  const len = (a: number, b: number) => len3(pos[a * 3] - pos[b * 3], pos[a * 3 + 1] - pos[b * 3 + 1], pos[a * 3 + 2] - pos[b * 3 + 2]);
  const before = new THREE.Vector3();
  const after = new THREE.Vector3();
  // Whether u can be folded into v.
  const ok = (u: number, v: number) => {
    around(u, ringU);
    // Only the corners across the edge's two faces may be shared, or the surface would pinch.
    around(v, ringV);
    let shared = 0;
    for (const w of ringU) if (mark[w] === tick) shared++;
    let across = 0;
    for (const f of facesOf[u]) if (has(f, v)) across++;
    if (shared !== across || across !== 2) return false;
    for (const w of ringU) if (w !== v && len(v, w) > longest) return false;
    for (const f of facesOf[u]) {
      if (has(f, v)) continue;
      const c0 = T[f * 3];
      const c1 = T[f * 3 + 1];
      const c2 = T[f * 3 + 2];
      A.fromArray(pos, c0 * 3);
      B.fromArray(pos, c1 * 3);
      C.fromArray(pos, c2 * 3);
      before.subVectors(B, A).cross(C.sub(A));
      const d0 = c0 === u ? v : c0;
      const d1 = c1 === u ? v : c1;
      const d2 = c2 === u ? v : c2;
      A.fromArray(pos, d0 * 3);
      B.fromArray(pos, d1 * 3);
      C.fromArray(pos, d2 * 3);
      after.subVectors(B, A).cross(C.sub(A));
      // No slivers, nothing turned far round, and still facing out with its corners.
      const la = after.length();
      if (la < 1e-9 || after.dot(before) < 0.5 * la * before.length()) return false;
      const perim = len(d0, d1) + len(d1, d2) + len(d2, d0);
      if (la / (perim * perim) < 0.02) return false;
      if (!facesOut(pos, grads, d0, d1, d2)) return false;
    }
    return true;
  };
  // Cheapest folds first: a binary heap (in plain arrays), with stale entries skipped.
  const stamp = new Int32Array(nv);
  const hc: number[] = [];
  const hu: number[] = [];
  const hv: number[] = [];
  const hs: number[] = [];
  const swap = (i: number, j: number) => {
    let t = hc[i];
    hc[i] = hc[j];
    hc[j] = t;
    t = hu[i];
    hu[i] = hu[j];
    hu[j] = t;
    t = hv[i];
    hv[i] = hv[j];
    hv[j] = t;
    t = hs[i];
    hs[i] = hs[j];
    hs[j] = t;
  };
  const push = (u: number, v: number) => {
    hc.push(cost(u, v));
    hu.push(u);
    hv.push(v);
    hs.push(stamp[u] * 65536 + stamp[v]);
    let i = hc.length - 1;
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (hc[p] <= hc[i]) break;
      swap(p, i);
      i = p;
    }
  };
  const pop = () => {
    const n = hc.length - 1;
    swap(0, n);
    const u = hu.pop()!;
    const v = hv.pop()!;
    const st = hs.pop()!;
    hc.pop();
    let i = 0;
    for (;;) {
      const l = i * 2 + 1;
      const r = l + 1;
      let k = i;
      if (l < n && hc[l] < hc[k]) k = l;
      if (r < n && hc[r] < hc[k]) k = r;
      if (k === i) break;
      swap(k, i);
      i = k;
    }
    return stamp[u] * 65536 + stamp[v] === st && facesOf[u].length ? [u, v] : null;
  };
  for (let u = 0; u < nv; u++) for (const v of around(u, ringU)) push(u, v);
  const fresh: number[] = [];
  while (left > target && hc.length) {
    const e = pop();
    if (!e || !ok(e[0], e[1])) continue;
    const [u, v] = e;
    for (const f of facesOf[u]) {
      if (has(f, v)) {
        alive[f] = 0;
        left--;
        for (let c = 0; c < 3; c++) {
          const w = T[f * 3 + c];
          if (w === u) continue;
          const list = facesOf[w];
          const i = list.indexOf(f);
          list[i] = list[list.length - 1];
          list.pop();
        }
      } else {
        for (let c = 0; c < 3; c++) if (T[f * 3 + c] === u) T[f * 3 + c] = v;
        facesOf[v].push(f);
      }
    }
    facesOf[u].length = 0;
    for (let i = 0; i < 10; i++) Q[v * 10 + i] += Q[u * 10 + i];
    around(v, fresh);
    stamp[v]++;
    for (const w of fresh) stamp[w]++;
    for (const w of fresh) {
      push(v, w);
      push(w, v);
    }
  }
  // Just the corners still in use.
  const index = new Int32Array(nv).fill(-1);
  const keepPos: number[] = [];
  const keepGrads: number[] = [];
  const keepNear: (number[] | undefined)[] = [];
  const tris: number[] = [];
  for (let f = 0; f < nf; f++) {
    if (!alive[f]) continue;
    for (let c = 0; c < 3; c++) {
      const v = T[f * 3 + c];
      if (index[v] < 0) {
        index[v] = keepPos.length / 3;
        keepPos.push(pos[v * 3], pos[v * 3 + 1], pos[v * 3 + 2]);
        keepGrads.push(grads[v * 3], grads[v * 3 + 1], grads[v * 3 + 2]);
        keepNear.push(m.near?.[v]);
      }
      tris.push(index[v]);
    }
  }
  return { pos: new Float32Array(keepPos), tris: new Uint32Array(tris), near: keepNear, grads: new Float32Array(keepGrads) };
}

// ---------------------------------------------------------------- markings

/** A point being coloured, with its distance to each nearby shape worked out once (when first asked) and kept. */
export class Probe {
  readonly p = new THREE.Vector3();
  private d: Float64Array;
  private near: number[] | undefined;
  private done = false;
  constructor(readonly sc: Sculpt) {
    this.d = new Float64Array(sc.shapes.length);
  }

  set(x: number, y: number, z: number, near?: number[]): this {
    this.p.set(x, y, z);
    this.near = near;
    this.done = false;
    return this;
  }

  /** The distance to a shape (by index): far off if it's not one that could matter here. */
  dist(i: number): number {
    if (!this.done) {
      const S = this.sc.shapes;
      this.d.fill(Infinity);
      const each = (j: number) => {
        const s = S[j];
        if (!s.carve) this.d[j] = s.d(this.p.x, this.p.y, this.p.z) - (s.thin ? this.sc.grow : 0);
      };
      if (this.near) this.near.forEach(each);
      else S.forEach((_, j) => each(j));
      this.done = true;
    }
    return this.d[i];
  }
}

/** Which marking a point is in: the first whose field is below zero there, or past them all (the base colour). */
export function labelOf(fields: ((q: Probe) => number)[], q: Probe): number {
  for (let i = 0; i < fields.length; i++) if (fields[i](q) < 0) return i;
  return fields.length;
}

/**
 * Lines the mesh up with the markings (each a field, below zero inside it), so their borders run along edges in
 * clean straight runs instead of zigzagging across faces: wherever an edge crosses from one marking into another,
 * its nearer end is moved onto the crossing (each corner moves once at most, and never so far that a face around
 * it folds over or squashes to a sliver). Leaves each corner's marking on the mesh (-1 for those on a border).
 */
export function snapMarks(sc: Sculpt, mesh: Mesh, fields: ((q: Probe) => number)[]) {
  const pos = mesh.pos;
  const nv = pos.length / 3;
  const q = new Probe(sc);
  const at = (v: number) => q.set(pos[v * 3], pos[v * 3 + 1], pos[v * 3 + 2], mesh.near?.[v]);
  const lab = new Int32Array(nv);
  for (let v = 0; v < nv; v++) lab[v] = labelOf(fields, at(v));
  const facesOf: number[][] = Array.from({ length: nv }, () => []);
  for (let t = 0; t < mesh.tris.length; t += 3) for (let c = 0; c < 3; c++) facesOf[mesh.tris[t + c]].push(t);
  const locked = new Uint8Array(nv);
  const seen = new Set<number>();
  const A = new THREE.Vector3();
  const B = new THREE.Vector3();
  const C = new THREE.Vector3();
  const before = new THREE.Vector3();
  const after = new THREE.Vector3();
  const gv = new THREE.Vector3();
  const normal = (t: number, out: THREE.Vector3) => {
    A.fromArray(pos, mesh.tris[t] * 3);
    B.fromArray(pos, mesh.tris[t + 1] * 3);
    C.fromArray(pos, mesh.tris[t + 2] * 3);
    return out.subVectors(B, A).cross(C.sub(A));
  };
  // Moves a corner, unless that would turn a face around it too far (or squash it to a sliver).
  const move = (v: number, x: number, y: number, z: number) => {
    const old = [pos[v * 3], pos[v * 3 + 1], pos[v * 3 + 2]];
    const was = facesOf[v].map((t) => normal(t, new THREE.Vector3()));
    pos[v * 3] = x;
    pos[v * 3 + 1] = y;
    pos[v * 3 + 2] = z;
    // Which way is out where it's going.
    const G = mesh.grads;
    const oldG = G ? [G[v * 3], G[v * 3 + 1], G[v * 3 + 2]] : null;
    if (G) {
      const e = 0.002;
      const near = mesh.near?.[v];
      gv.set(sc.at(x + e, y, z, near) - sc.at(x - e, y, z, near), sc.at(x, y + e, z, near) - sc.at(x, y - e, z, near), sc.at(x, y, z + e, near) - sc.at(x, y, z - e, near)).normalize();
      G[v * 3] = gv.x;
      G[v * 3 + 1] = gv.y;
      G[v * 3 + 2] = gv.z;
    }
    const ok = facesOf[v].every((t, i) => {
      normal(t, after);
      before.copy(was[i]);
      if (G && !facesOut(pos, G, mesh.tris[t], mesh.tris[t + 1], mesh.tris[t + 2])) return false;
      return after.lengthSq() > before.lengthSq() * 0.09 && after.dot(before) > 0.7 * after.length() * before.length();
    });
    if (!ok) {
      pos.set(old, v * 3);
      if (G && oldG) G.set(oldG, v * 3);
    }
    return ok;
  };
  // Each corner's value of a marking's field, worked out once.
  const known = new Map<number, number>();
  const fieldAt = (v: number, m: number) => {
    const key = v * 64 + m;
    let f = known.get(key);
    if (f === undefined) {
      f = fields[m](at(v));
      known.set(key, f);
    }
    return f;
  };
  for (let t = 0; t < mesh.tris.length; t += 3) {
    for (let e = 0; e < 3; e++) {
      const a = mesh.tris[t + e];
      const b = mesh.tris[t + ((e + 1) % 3)];
      if (lab[a] === lab[b]) continue;
      const key = Math.min(a, b) * nv + Math.max(a, b);
      if (seen.has(key)) continue;
      seen.add(key);
      if (locked[a] && locked[b]) continue;
      const ax = pos[a * 3];
      const ay = pos[a * 3 + 1];
      const az = pos[a * 3 + 2];
      const dx = pos[b * 3] - ax;
      const dy = pos[b * 3 + 1] - ay;
      const dz = pos[b * 3 + 2] - az;
      // Where along the edge the marking changes: where the field of the one in front (inside at one end,
      // outside at the other) crosses zero, found by false position.
      const mk = Math.min(lab[a], lab[b]);
      const f = (s2: number) => fields[mk](q.set(ax + dx * s2, ay + dy * s2, az + dz * s2, mesh.near?.[a]));
      let lo = 0;
      let hi = 1;
      let flo = fieldAt(a, mk);
      let fhi = fieldAt(b, mk);
      let side = 0;
      for (let i = 0; i < 4; i++) {
        let m = Number.isFinite(flo) && Number.isFinite(fhi) && fhi !== flo ? (lo * fhi - hi * flo) / (fhi - flo) : (lo + hi) / 2;
        m = Math.min(hi - (hi - lo) * 0.05, Math.max(lo + (hi - lo) * 0.05, m));
        const fm = f(m);
        if (fm < 0 === flo < 0) {
          lo = m;
          flo = fm;
          if (side === -1) fhi /= 2;
          side = -1;
        } else {
          hi = m;
          fhi = fm;
          if (side === 1) flo /= 2;
          side = 1;
        }
      }
      const m = Number.isFinite(flo) && Number.isFinite(fhi) && fhi !== flo ? Math.min(hi, Math.max(lo, (lo * fhi - hi * flo) / (fhi - flo))) : (lo + hi) / 2;
      // A locked end already sitting on the line needs nothing more.
      if ((locked[a] && m < 0.12) || (locked[b] && m > 0.88)) continue;
      for (const [v, frac] of m < 0.5 ? [[a, m] as const, [b, 1 - m] as const] : [[b, 1 - m] as const, [a, m] as const]) {
        if (locked[v] || frac > 0.6) continue;
        if (move(v, ax + dx * m, ay + dy * m, az + dz * m)) {
          locked[v] = 1;
          break;
        }
      }
    }
  }
  for (let v = 0; v < nv; v++) if (locked[v]) lab[v] = -1;
  mesh.labels = lab;
}

// ---------------------------------------------------------------- weights, colours, depth

export interface Baked {
  fold: Fold;
  bones: string[];
}

export interface BakeOpts {
  /** Picks a face's colour from its middle, or from its corners' markings when they all agree. */
  paint: (q: Probe) => Color;
  colors?: Color[];
  /** How much each face's shade may vary, and how dark the deepest creases get. */
  tone?: number;
  depth?: number;
  seed: number;
}

/** Where to look along each face's normal for creases, and how much each look counts. */
const AO = [
  [0.02, 1],
  [0.06, 0.6],
  [0.12, 0.35],
];

const hash = (x: number, y: number, z: number) => {
  const s = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453;
  return s - Math.floor(s);
};

/**
 * Turns a surface into faces ready for the rig: every corner weighted to up to four bones (each bone's
 * share falls off with how much further its own shapes are than the nearest, over the blend at that joint),
 * every face painted by where its middle is, shaded a touch differently, and darkened where it's tucked into a
 * crease.
 */
export function bake(sc: Sculpt, mesh: Mesh, o: BakeOpts): Baked {
  const S = sc.shapes;
  const solid = S.map((_, i) => i).filter((i) => !S[i].carve);
  const bones = [...new Set(solid.map((i) => S[i].bone))];
  const boneOf = S.map((s) => bones.indexOf(s.bone));
  const joints = solid.filter((i) => S[i].anchor);
  const nv = mesh.pos.length / 3;
  const nb = bones.length;
  // Per corner: the weights.
  const wIdx = new Uint8Array(nv * 4);
  const wVal = new Float32Array(nv * 4);
  const d = new Float64Array(nb);
  const kb = new Float64Array(nb);
  const w = new Float64Array(nb);
  const order = Array.from({ length: nb }, (_, i) => i);
  for (let v = 0; v < nv; v++) {
    const x = mesh.pos[v * 3];
    const y = mesh.pos[v * 3 + 1];
    const z = mesh.pos[v * 3 + 2];
    d.fill(Infinity);
    let near = solid[0];
    let nd = Infinity;
    for (const i of mesh.near?.[v] ?? solid) {
      if (S[i].carve) continue;
      const di = S[i].d(x, y, z) - (S[i].thin ? sc.grow : 0);
      if (di < d[boneOf[i]]) d[boneOf[i]] = di;
      if (di < nd) {
        nd = di;
        near = i;
      }
    }
    const best = boneOf[near];
    // How wide the melt is here at each bone's joints (a shape melting into others on its own bone everywhere
    // doesn't count).
    kb.fill(0);
    for (const i of joints) {
      const k = blendAt(S[i], x, y, z, sc.crease);
      if (k > kb[boneOf[i]]) kb[boneOf[i]] = k;
    }
    for (let b = 0; b < nb; b++) {
      if (b === best) {
        w[b] = 1;
        continue;
      }
      const k = Math.max(kb[b], kb[best]);
      if (k < 1e-4) {
        w[b] = 0;
        continue;
      }
      const t = Math.max(0, 1 - (d[b] - d[best]) / (k * 1.2));
      w[b] = t * t * (3 - 2 * t);
    }
    order.sort((a, b) => w[b] - w[a]);
    let sum = 0;
    for (let n = 0; n < Math.min(4, nb); n++) sum += w[order[n]];
    for (let n = 0; n < Math.min(4, nb); n++) {
      wIdx[v * 4 + n] = order[n];
      wVal[v * 4 + n] = w[order[n]] / (sum || 1);
    }
  }
  // Faces: painted, toned and shaded by depth.
  const fold = new Fold();
  fold.bones = bones;
  const tone = o.tone ?? 0.06;
  const depth = o.depth ?? 0.32;
  const a = new THREE.Vector3();
  const b = new THREE.Vector3();
  const c = new THREE.Vector3();
  const cen = new THREE.Vector3();
  const n = new THREE.Vector3();
  const tint = new THREE.Color();
  const probe = new Probe(sc);
  // How tucked into a crease each corner is: a cheap look out along the surface's normal there (the nearer
  // something else is, the darker).
  const shadeAt = (x: number, y: number, z: number, nx: number, ny: number, nz: number, near?: number[]) => {
    const f0 = Math.min(0, sc.at(x, y, z, near));
    let occ = 0;
    let wsum = 0;
    for (const [dist, wt] of AO) {
      const f = sc.at(x + nx * dist, y + ny * dist, z + nz * dist, near);
      occ += (wt * Math.max(0, dist - (f - f0))) / dist;
      wsum += wt;
    }
    return 1 - depth * Math.min(1, occ / wsum);
  };
  const G = mesh.grads;
  const shades = G ? new Float32Array(mesh.pos.length / 3) : null;
  if (shades && G) for (let v = 0; v < shades.length; v++) shades[v] = shadeAt(mesh.pos[v * 3], mesh.pos[v * 3 + 1], mesh.pos[v * 3 + 2], G[v * 3], G[v * 3 + 1], G[v * 3 + 2], mesh.near?.[v]);
  const L = mesh.labels;
  for (let t = 0; t < mesh.tris.length; t += 3) {
    const ia = mesh.tris[t];
    const ib = mesh.tris[t + 1];
    const ic = mesh.tris[t + 2];
    a.fromArray(mesh.pos, ia * 3);
    b.fromArray(mesh.pos, ib * 3);
    c.fromArray(mesh.pos, ic * 3);
    cen.copy(a).add(b).add(c).multiplyScalar(1 / 3);
    n.subVectors(b, a).cross(c.clone().sub(a));
    // Leave out specks (a face squeezed to a line where corners were settled together): they can't be seen.
    if (n.lengthSq() < 4e-12) continue;
    n.normalize();
    const near = mesh.near?.[ia];
    audit.faces++;
    if (G && !facesOut(mesh.pos, G, ia, ib, ic)) audit.inward++;
    const shade = shades ? (shades[ia] + shades[ib] + shades[ic]) / 3 : shadeAt(cen.x, cen.y, cen.z, n.x, n.y, n.z, near);
    // Its colour: its corners' marking if they agree, or else whichever its middle is in.
    const same = L && o.colors && L[ia] >= 0 && L[ia] === L[ib] && L[ib] === L[ic];
    tint.set(same ? o.colors![L![ia]] : o.paint(probe.set(cen.x, cen.y, cen.z, near)));
    tint.multiplyScalar(shade * (1 + (hash(cen.x, cen.y, cen.z) - 0.5) * tone));
    for (const [p, iv] of [
      [a, ia],
      [b, ib],
      [c, ic],
    ] as const) {
      fold.pos.push(p.x, p.y, p.z);
      fold.col.push(tint.r, tint.g, tint.b);
      fold.along.push(-1);
      for (let q = 0; q < 4; q++) {
        fold.si!.push(wIdx[iv * 4 + q]);
        fold.sw!.push(wVal[iv * 4 + q]);
      }
    }
  }
  return { fold, bones };
}
