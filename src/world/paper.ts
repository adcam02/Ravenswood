import * as THREE from 'three';
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { placeMatrix, type Vec3 } from './build';

/**
 * The papercraft kit: shapes built from a few low-poly bases, pushed into shape, nudged so every flat face
 * is a slightly different size and angle (like folded card), and coloured face by face so markings are crisp
 * regions of the surface itself (never a second surface laid on top). Everything is seeded, so an animal
 * looks the same on every screen.
 */

export type Color = THREE.ColorRepresentation;
/**
 * Picks a face's colour; nothing means the base colour. `u` is the face's centre on the plain unit shape
 * (before any bending, stretching or placing), so markings can be drawn on a head or a tail by where they
 * sit on it; `c` and `n` are the face's centre and normal where it ends up.
 */
export type Paint = (u: THREE.Vector3, c: THREE.Vector3, n: THREE.Vector3) => Color | null | undefined | false;

/**
 * Faces collected for one part of a model: positions, colours, and how far along a bendy part (a tail, a
 * tentacle) each corner is, for skinning it across several bones (-1 for corners that ride one bone).
 */
export class Fold {
  pos: number[] = [];
  col: number[] = [];
  along: number[] = [];
  get empty(): boolean {
    return this.pos.length === 0;
  }
  get faces(): number {
    return this.pos.length / 9;
  }
  /** A plain geometry (position and colour) for parts that aren't skinned. */
  geometry(): THREE.BufferGeometry {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(this.pos, 3));
    g.setAttribute('color', new THREE.Float32BufferAttribute(this.col, 3));
    g.computeVertexNormals();
    g.computeBoundingSphere();
    return g;
  }
}

/** Counts of faces built and faces that point into their own shape (which should never happen). */
export const audit = { faces: 0, inward: 0, trace: null as Map<string, number> | null, at: null as number[][] | null };
export function resetAudit() {
  audit.faces = 0;
  audit.inward = 0;
}

/** Welds a primitive's corners so nudging a corner moves every face that meets there. */
function weld(g: THREE.BufferGeometry, spin = 0): THREE.BufferGeometry {
  const plain = new THREE.BufferGeometry();
  plain.setAttribute('position', (g.getAttribute('position') as THREE.BufferAttribute).clone());
  if (g.index) plain.setIndex(g.index.clone());
  const flat = plain.index ? plain.toNonIndexed() : plain;
  if (spin) flat.rotateY(spin);
  const out = mergeVertices(flat, 1e-5);
  g.dispose();
  return out;
}

export const BASE = {
  /** 20, 80, 180 and 320 faces. */
  ico0: weld(new THREE.IcosahedronGeometry(1, 0)),
  ico1: weld(new THREE.IcosahedronGeometry(1, 1)),
  ico2: weld(new THREE.IcosahedronGeometry(1, 2)),
  ico3: weld(new THREE.IcosahedronGeometry(1, 3)),
  /** A unit-high seven-sided limb in three bands, centred on the origin. */
  limb: weld(new THREE.CylinderGeometry(1, 1, 1, 7, 3)),
  limb5: weld(new THREE.CylinderGeometry(1, 1, 1, 5, 1)),
  /** Pyramids with a flat face to the front (+z), apex up: beaks, spines, horns. */
  pyramid: weld(new THREE.ConeGeometry(1, 1, 4, 1), Math.PI / 4),
  /** A three-sided pyramid with a flat face to the front. */
  tri: weld(new THREE.ConeGeometry(1, 1, 3, 1), Math.PI),
  /** A five-sided cone, apex up, in two bands. */
  cone5: weld(new THREE.ConeGeometry(1, 1, 5, 2)),
  box: weld(new THREE.BoxGeometry(1, 1, 1)),
};
export type BaseName = keyof typeof BASE;

/** While building the distant version of an animal, big shapes drop a level of detail. */
let LOW = false;
export function lowDetail<T>(make: () => T): T {
  LOW = true;
  try {
    return make();
  } finally {
    LOW = false;
  }
}
export const isLow = () => LOW;

/** Deterministic random numbers in [0, 1). */
export function seeded(seed: number): () => number {
  let s = seed >>> 0 || 1;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** A seed from a word, for "the fox" always folding the same way. */
export function seedOf(word: string): number {
  let h = 2166136261;
  for (let i = 0; i < word.length; i++) h = Math.imul(h ^ word.charCodeAt(i), 16777619);
  return h >>> 0;
}

const hash = (v: THREE.Vector3) => {
  const x = Math.sin(v.x * 127.1 + v.y * 311.7 + v.z * 74.7) * 43758.5453;
  return x - Math.floor(x);
};

const va = new THREE.Vector3();
const vb = new THREE.Vector3();
const vc = new THREE.Vector3();
const centre = new THREE.Vector3();
const unitCentre = new THREE.Vector3();
const axisCentre = new THREE.Vector3();
const normal = new THREE.Vector3();
const tmp = new THREE.Vector3();
const tint = new THREE.Color();

/**
 * Splits a placed geometry into flat faces, paints each one, and adds them to a fold. The geometry carries
 * `unit` (where each corner was on the plain unit shape), `axis` (a point inside the shape near that corner,
 * for checking the face points outward) and optionally `along`.
 */
function finish(f: Fold, g: THREE.BufferGeometry, color: Color, paint: Paint | undefined, tone: number) {
  const flat = g.index ? g.toNonIndexed() : g;
  const p = flat.getAttribute('position') as THREE.BufferAttribute;
  const u = flat.getAttribute('unit') as THREE.BufferAttribute;
  const ax = flat.getAttribute('axis') as THREE.BufferAttribute;
  const al = flat.getAttribute('along') as THREE.BufferAttribute | undefined;
  for (let i = 0; i < p.count; i += 3) {
    va.fromBufferAttribute(p, i);
    vb.fromBufferAttribute(p, i + 1);
    vc.fromBufferAttribute(p, i + 2);
    centre.copy(va).add(vb).add(vc).multiplyScalar(1 / 3);
    normal.subVectors(vc, vb).cross(tmp.subVectors(va, vb)).normalize();
    axisCentre.fromBufferAttribute(ax, i).add(tmp.fromBufferAttribute(ax, i + 1)).add(tmp.fromBufferAttribute(ax, i + 2)).multiplyScalar(1 / 3);
    audit.faces++;
    if (normal.dot(tmp.subVectors(centre, axisCentre)) < 0) {
      audit.inward++;
      if (audit.trace) {
        // For the test bench: which shape it came from.
        const where = (new Error().stack ?? '').split('\n').slice(2, 6).map((l) => l.trim().split(' ')[1]).join(' < ');
        audit.trace.set(where, (audit.trace.get(where) ?? 0) + 1);
      }
      audit.at?.push([centre.x, centre.y, centre.z, normal.x, normal.y, normal.z]);
    }
    unitCentre.fromBufferAttribute(u, i).add(tmp.fromBufferAttribute(u, i + 1)).add(tmp.fromBufferAttribute(u, i + 2)).multiplyScalar(1 / 3);
    const painted = paint?.(unitCentre, centre, normal);
    tint.set(painted || color);
    tint.multiplyScalar(1 + (hash(centre) - 0.5) * tone);
    for (const v of [va, vb, vc]) f.pos.push(v.x, v.y, v.z);
    for (let k = 0; k < 3; k++) {
      f.col.push(tint.r, tint.g, tint.b);
      f.along.push(al ? al.getX(i + k) : -1);
    }
  }
  if (flat !== g) flat.dispose();
  g.dispose();
}

export interface Solid {
  base?: BaseName | THREE.BufferGeometry;
  /** Radii (or a uniform radius) the unit shape is stretched to. */
  r: Vec3 | number;
  pos?: Vec3;
  rot?: Vec3;
  /** A full placement instead of pos and rot. */
  matrix?: THREE.Matrix4;
  /** How far each corner may wander, as a fraction of the radius. */
  jitter?: number;
  /** Reshapes the unit shape (before stretching): a pear, a flattened top, a pointed muzzle. */
  bend?: (v: THREE.Vector3) => void;
  color: Color;
  paint?: Paint;
  /** How much each face's shade may vary. */
  tone?: number;
}

/** Folds a solid and adds it to a fold. */
export function solid(f: Fold, rnd: () => number, s: Solid): void {
  let name = s.base ?? 'ico1';
  if (LOW && (name === 'ico3' || name === 'ico2')) name = 'ico1';
  else if (LOW && name === 'ico1' && !(typeof s.r === 'number' ? s.r > 0.07 : Math.max(...s.r) > 0.07)) name = 'ico0';
  else if (LOW && name === 'limb') name = 'limb5';
  const base = name instanceof THREE.BufferGeometry ? name : BASE[name];
  const g = base.clone();
  const pos = g.getAttribute('position') as THREE.BufferAttribute;
  const unit = new Float32Array(pos.count * 3);
  const r = typeof s.r === 'number' ? ([s.r, s.r, s.r] as Vec3) : s.r;
  const j = s.jitter ?? 0.04;
  const v = new THREE.Vector3();
  const mid = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    unit[i * 3] = v.x;
    unit[i * 3 + 1] = v.y;
    unit[i * 3 + 2] = v.z;
    s.bend?.(v);
    if (j > 0) v.set(v.x + (rnd() - 0.5) * 2 * j, v.y + (rnd() - 0.5) * 2 * j, v.z + (rnd() - 0.5) * 2 * j);
    pos.setXYZ(i, v.x * r[0], v.y * r[1], v.z * r[2]);
    mid.add(tmp.set(v.x * r[0], v.y * r[1], v.z * r[2]));
  }
  mid.multiplyScalar(1 / pos.count);
  const axis = new Float32Array(pos.count * 3);
  for (let i = 0; i < pos.count; i++) axis.set([mid.x, mid.y, mid.z], i * 3);
  g.setAttribute('unit', new THREE.BufferAttribute(unit, 3));
  g.setAttribute('axis', new THREE.BufferAttribute(axis, 3));
  const m = s.matrix ?? placeMatrix({ pos: s.pos, rot: s.rot });
  g.applyMatrix4(m);
  (g.getAttribute('axis') as THREE.BufferAttribute).applyMatrix4(m);
  finish(f, g, s.color, s.paint, s.tone ?? 0.06);
}

/** A placement that points a shape's +y from `from` towards `to`, centred between them. */
export function along(from: Vec3, to: Vec3, roll = 0): { matrix: THREE.Matrix4; len: number } {
  const a = new THREE.Vector3(...from);
  const c = new THREE.Vector3(...to);
  const d = c.clone().sub(a);
  const len = d.length();
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize());
  if (roll) q.multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), roll));
  return { matrix: new THREE.Matrix4().compose(a.add(c).multiplyScalar(0.5), q, new THREE.Vector3(1, 1, 1)), len };
}

/** A tapering faceted limb from one point to another (r0 at `from`, r1 at `to`), flattened front to back by `depth`. */
export function pillar(
  f: Fold,
  rnd: () => number,
  from: Vec3,
  to: Vec3,
  r0: number,
  r1: number,
  color: Color,
  opts: { depth?: number; jitter?: number; paint?: Paint; base?: BaseName; roll?: number } = {},
): void {
  const { matrix, len } = along(from, to, opts.roll);
  const depth = opts.depth ?? 1;
  const j = opts.jitter ?? 0.04;
  solid(f, rnd, {
    base: opts.base ?? 'limb',
    r: [1, len, 1],
    matrix,
    // The corners wander in proportion to the limb's own thickness, not its length.
    jitter: 0,
    bend: (v) => {
      // In the unit limb y runs -0.5 (at `from`) to 0.5 (at `to`).
      const t = v.y + 0.5;
      const k = r0 + (r1 - r0) * t;
      v.x = (v.x + (rnd() - 0.5) * 2 * j) * k;
      v.z = (v.z + (rnd() - 0.5) * 2 * j) * k * depth;
      v.y += ((rnd() - 0.5) * 2 * j * k) / Math.max(len, 1e-6);
    },
    color,
    paint: opts.paint,
  });
}

export interface Tube {
  /** The path, and the radius at each point. */
  pts: Vec3[];
  radii: number[];
  /** Sides round the tube (6 by default). */
  sides?: number;
  /** Squashes the cross-section across its second axis (flat tails, flippers), or by this much at each point. */
  flat?: number;
  flats?: number[];
  /** How far each corner may wander, as a fraction of the local radius. */
  jitter?: number;
  color: Color;
  /** `u.y` runs 0 to 1 along the tube; `u.x` and `u.z` go round it. */
  paint?: Paint;
  /** Round the ends off (true) or leave them pointed at the path's ends. */
  round?: boolean;
  /** Which way the first axis of the cross-section points at the start (defaults to sideways). */
  up?: Vec3;
  tone?: number;
}

/** A faceted tube along a path, closed at both ends: tails, tentacles, horns, the snail's foot and shell. */
export function tube(f: Fold, rnd: () => number, t: Tube): void {
  const n = Math.max(3, (t.sides ?? 6) - (LOW ? 1 : 0));
  const pts = t.pts.map((p) => new THREE.Vector3(...p));
  const m = pts.length;
  const flat = t.flat ?? 1;
  const j = t.jitter ?? 0.08;
  // Frames carried along the path so the tube doesn't twist.
  const tangents = pts.map((_p, i) => pts[Math.min(m - 1, i + 1)].clone().sub(pts[Math.max(0, i - 1)]).normalize());
  let side = new THREE.Vector3(...(t.up ?? [1, 0, 0]));
  if (Math.abs(side.dot(tangents[0])) > 0.95) side = new THREE.Vector3(0, 0, 1);
  side.sub(tangents[0].clone().multiplyScalar(side.dot(tangents[0]))).normalize();
  const positions: number[] = [];
  const units: number[] = [];
  const axes: number[] = [];
  const alongs: number[] = [];
  const round = t.round ?? true;
  // Inside points near each end, so the end faces check as outward even when the end is pointed.
  const a0 = pts[0].clone().addScaledVector(tangents[0], t.radii[0] * 0.3);
  const a1 = pts[m - 1].clone().addScaledVector(tangents[m - 1], -t.radii[m - 1] * 0.3);
  for (let i = 0; i < m; i++) {
    const tan = tangents[i];
    side.sub(tan.clone().multiplyScalar(side.dot(tan))).normalize();
    const other = tan.clone().cross(side).normalize();
    const r = t.radii[i];
    const fl = t.flats?.[i] ?? flat;
    const inside = i === 0 ? pts[0].clone().lerp(a0, 0.5) : i === m - 1 ? pts[m - 1].clone().lerp(a1, 0.5) : pts[i];
    for (let s = 0; s < n; s++) {
      const a = (s / n) * Math.PI * 2 + (i % 2) * (Math.PI / n) * 0.5;
      const cx = Math.cos(a);
      const cz = Math.sin(a);
      const jr = r * j;
      const p = pts[i]
        .clone()
        .addScaledVector(side, cx * r + (rnd() - 0.5) * 2 * jr)
        .addScaledVector(other, cz * r * fl + (rnd() - 0.5) * 2 * jr * fl)
        .addScaledVector(tan, (rnd() - 0.5) * jr);
      positions.push(p.x, p.y, p.z);
      units.push(cx, i / (m - 1), cz);
      axes.push(inside.x, inside.y, inside.z);
      alongs.push(i / (m - 1));
    }
  }
  const startTip = pts[0].clone().addScaledVector(tangents[0], -(round ? t.radii[0] * 0.7 : 0));
  const endTip = pts[m - 1].clone().addScaledVector(tangents[m - 1], round ? t.radii[m - 1] * 0.7 : 0);
  const s0 = m * n;
  positions.push(startTip.x, startTip.y, startTip.z, endTip.x, endTip.y, endTip.z);
  units.push(0, 0, 0, 0, 1, 0);
  axes.push(a0.x, a0.y, a0.z, a1.x, a1.y, a1.z);
  alongs.push(0, 1);
  const index: number[] = [];
  // Wound so each face's front is on the outside.
  for (let i = 0; i < m - 1; i++) {
    for (let s = 0; s < n; s++) {
      const a = i * n + s;
      const b = i * n + ((s + 1) % n);
      const c = (i + 1) * n + s;
      const d = (i + 1) * n + ((s + 1) % n);
      index.push(a, b, c, b, d, c);
    }
  }
  for (let s = 0; s < n; s++) {
    index.push(s0, (s + 1) % n, s);
    index.push(s0 + 1, (m - 1) * n + s, (m - 1) * n + ((s + 1) % n));
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  g.setAttribute('unit', new THREE.Float32BufferAttribute(units, 3));
  g.setAttribute('axis', new THREE.Float32BufferAttribute(axes, 3));
  g.setAttribute('along', new THREE.Float32BufferAttribute(alongs, 1));
  g.setIndex(index);
  finish(f, g, t.color, t.paint, t.tone ?? 0.06);
}

/** Points along a gentle curve, from a start heading a direction and turning by `curl` (Euler angles) per step. */
export function curve(start: Vec3, dir: Vec3, steps: number, step: number, curl: Vec3): Vec3[] {
  const out: Vec3[] = [start];
  const p = new THREE.Vector3(...start);
  const d = new THREE.Vector3(...dir).normalize();
  const turn = new THREE.Euler(...curl);
  for (let i = 0; i < steps; i++) {
    p.addScaledVector(d, step);
    out.push([p.x, p.y, p.z]);
    d.applyEuler(turn).normalize();
  }
  return out;
}

export interface Card {
  /** Half-width at the base, height, and depth front to back. */
  w: number;
  h: number;
  d: number;
  matrix: THREE.Matrix4;
  /** The back, the rim round the front, and the recessed inner panel. */
  back: Color;
  rim: Color;
  inner?: Color;
  /** How much of the front the inner panel takes (0 to 1) and how far it's set back (a fraction of the depth). */
  inset?: number;
  recess?: number;
  /** Leans the tip back (a fraction of the height). */
  lean?: number;
}

/**
 * A pointed ear folded from card: a three-sided pyramid whose front face is inset into a rim and a slightly
 * recessed inner panel, so the inside of the ear is part of the same surface (no second layer to flicker).
 */
export function card(f: Fold, rnd: () => number, o: Card): void {
  const { w, h, d } = o;
  const jit = () => (rnd() - 0.5) * 0.08;
  const FL = new THREE.Vector3(-w * (1 + jit()), 0, d * 0.3);
  const FR = new THREE.Vector3(w * (1 + jit()), 0, d * 0.3);
  const B = new THREE.Vector3(0, 0, -d * 0.9);
  const A = new THREE.Vector3(w * jit() * 0.5, h * (1 + jit() * 0.5), -(o.lean ?? 0.15) * h);
  const C = FL.clone().add(FR).add(A).multiplyScalar(1 / 3);
  const fn = FR.clone().sub(FL).cross(A.clone().sub(FL)).normalize();
  const s = o.inset ?? 0.62;
  const inner = (p: THREE.Vector3) =>
    C.clone()
      .addScaledVector(p.clone().sub(C), s)
      .addScaledVector(new THREE.Vector3(0, 1, 0), -h * 0.06)
      .addScaledVector(fn, -(o.recess ?? 0.25) * d);
  const IL = inner(FL);
  const IR = inner(FR);
  const IA = inner(A);
  const faces: [THREE.Vector3[], Color][] = [
    [[FL, FR, IR, IL], o.rim],
    [[FR, A, IA, IR], o.rim],
    [[A, FL, IL, IA], o.rim],
    [[IL, IR, IA], o.inner ?? o.rim],
    [[FR, B, A], o.back],
    [[B, FL, A], o.back],
    [[FL, B, FR], o.back],
  ];
  // Points inside the card for checking faces point outward: the front is a shallow cup, so its faces are
  // checked against a point well behind it; the back and bottom against the middle.
  const mid = FL.clone().add(FR).add(B).add(A).multiplyScalar(0.25);
  const behind = B.clone().add(new THREE.Vector3(0, h * 0.2, -d));
  const positions: number[] = [];
  const units: number[] = [];
  const axes: number[] = [];
  const colorsByFace: Color[] = [];
  faces.forEach(([poly, c], fi) => {
    const ref = fi < 4 ? behind : mid;
    for (let i = 1; i < poly.length - 1; i++) {
      for (const p of [poly[0], poly[i], poly[i + 1]]) {
        positions.push(p.x, p.y, p.z);
        units.push(p.x / w, p.y / h, p.z / d);
        axes.push(ref.x, ref.y, ref.z);
      }
      colorsByFace.push(c);
    }
  });
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  g.setAttribute('unit', new THREE.Float32BufferAttribute(units, 3));
  g.setAttribute('axis', new THREE.Float32BufferAttribute(axes, 3));
  g.applyMatrix4(o.matrix);
  (g.getAttribute('axis') as THREE.BufferAttribute).applyMatrix4(o.matrix);
  let face = 0;
  finish(f, g, o.back, () => colorsByFace[face++], 0.05);
}

/** A thin flat sheet (wing membranes, fins) as a fan of faces round a centre, on both sides. */
export function sheet(f: Fold, centreP: Vec3, rim: Vec3[], color: Color, matrix?: THREE.Matrix4): void {
  const c = new THREE.Color(color);
  const p = new THREE.Vector3();
  for (let i = 0; i < rim.length - 1; i++) {
    const tri = [centreP, rim[i], rim[i + 1], centreP, rim[i + 1], rim[i]];
    for (const q of tri) {
      p.set(...q);
      if (matrix) p.applyMatrix4(matrix);
      f.pos.push(p.x, p.y, p.z);
      f.col.push(c.r, c.g, c.b);
      f.along.push(-1);
    }
  }
}
