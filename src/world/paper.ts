import * as THREE from 'three';
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { Builder, placeMatrix, type Vec3 } from './build';

/**
 * The papercraft kit: shapes built from a few low-poly bases, pushed into shape, nudged so every flat face
 * is a slightly different size and angle (like folded card), and coloured face by face so markings have
 * crisp edges along the folds. Everything is seeded, so an animal looks the same on every screen.
 */

export type Color = THREE.ColorRepresentation;
/**
 * Picks a face's colour; nothing means the base colour. `u` is the face's centre on the plain unit shape
 * (before any bending, stretching or placing), so markings can be drawn on a head or a tail by where they
 * sit on it; `c` and `n` are the face's centre and normal where it ends up.
 */
export type Paint = (u: THREE.Vector3, c: THREE.Vector3, n: THREE.Vector3) => Color | null | undefined | false;

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
  /** 20, 80 and 320 faces. */
  ico0: weld(new THREE.IcosahedronGeometry(1, 0)),
  ico1: weld(new THREE.IcosahedronGeometry(1, 1)),
  ico2: weld(new THREE.IcosahedronGeometry(1, 2)),
  /** A unit-high six-sided limb in two bands, centred on the origin. */
  limb: weld(new THREE.CylinderGeometry(1, 1, 1, 6, 2)),
  limb5: weld(new THREE.CylinderGeometry(1, 1, 1, 5, 1)),
  /** Pyramids with a flat face to the front (+z), apex up: ears, beaks, spines, horns. */
  pyramid: weld(new THREE.ConeGeometry(1, 1, 4, 1), Math.PI / 4),
  /** A three-sided pyramid with a flat face to the front. */
  tri: weld(new THREE.ConeGeometry(1, 1, 3, 1), Math.PI),
  /** A five-sided cone, apex up, in two bands. */
  cone5: weld(new THREE.ConeGeometry(1, 1, 5, 2)),
  box: weld(new THREE.BoxGeometry(1, 1, 1)),
  /** A seven-by-five sphere: chunky facets for small round things. */
  ball: weld(new THREE.SphereGeometry(1, 7, 5)),
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
const normal = new THREE.Vector3();
const tmp = new THREE.Vector3();
const tint = new THREE.Color();

/**
 * Splits a welded, placed geometry (with a `unit` attribute) into flat faces, paints each, and adds it.
 * Each face gets its own slight shade, like separate pieces of card.
 */
function finish(b: Builder, g: THREE.BufferGeometry, color: Color, paint: Paint | undefined, tone: number) {
  const flat = g.index ? g.toNonIndexed() : g;
  const p = flat.getAttribute('position') as THREE.BufferAttribute;
  const u = flat.getAttribute('unit') as THREE.BufferAttribute;
  const colors = new Float32Array(p.count * 3);
  for (let f = 0; f < p.count; f += 3) {
    va.fromBufferAttribute(p, f);
    vb.fromBufferAttribute(p, f + 1);
    vc.fromBufferAttribute(p, f + 2);
    centre.copy(va).add(vb).add(vc).multiplyScalar(1 / 3);
    normal.subVectors(vc, vb).cross(tmp.subVectors(va, vb)).normalize();
    unitCentre.fromBufferAttribute(u, f).add(vb.fromBufferAttribute(u, f + 1)).add(vc.fromBufferAttribute(u, f + 2)).multiplyScalar(1 / 3);
    const painted = paint?.(unitCentre, centre, normal);
    tint.set(painted || color);
    tint.multiplyScalar(1 + (hash(centre) - 0.5) * tone);
    for (let k = 0; k < 3; k++) {
      colors[(f + k) * 3] = tint.r;
      colors[(f + k) * 3 + 1] = tint.g;
      colors[(f + k) * 3 + 2] = tint.b;
    }
  }
  const clean = new THREE.BufferGeometry();
  clean.setAttribute('position', p);
  clean.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  b.addColored(clean);
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

/** Folds a solid and adds it to a builder. */
export function solid(b: Builder, rnd: () => number, s: Solid): void {
  let name = s.base ?? 'ico1';
  if (LOW && name === 'ico2') name = 'ico1';
  else if (LOW && name === 'ico1' && !(typeof s.r === 'number' ? s.r > 0.07 : Math.max(...s.r) > 0.07)) name = 'ico0';
  const base = name instanceof THREE.BufferGeometry ? name : BASE[name];
  const g = base.clone();
  const pos = g.getAttribute('position') as THREE.BufferAttribute;
  const unit = new Float32Array(pos.count * 3);
  const r = typeof s.r === 'number' ? ([s.r, s.r, s.r] as Vec3) : s.r;
  const j = s.jitter ?? 0.07;
  const v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    unit[i * 3] = v.x;
    unit[i * 3 + 1] = v.y;
    unit[i * 3 + 2] = v.z;
    s.bend?.(v);
    if (j > 0) v.set(v.x + (rnd() - 0.5) * 2 * j, v.y + (rnd() - 0.5) * 2 * j, v.z + (rnd() - 0.5) * 2 * j);
    pos.setXYZ(i, v.x * r[0], v.y * r[1], v.z * r[2]);
  }
  g.setAttribute('unit', new THREE.BufferAttribute(unit, 3));
  g.applyMatrix4(s.matrix ?? placeMatrix({ pos: s.pos, rot: s.rot }));
  finish(b, g, s.color, s.paint, s.tone ?? 0.07);
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
  b: Builder,
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
  solid(b, rnd, {
    base: opts.base ?? 'limb',
    r: [1, len, 1],
    matrix,
    jitter: opts.jitter ?? 0.04,
    bend: (v) => {
      // In the unit limb y runs -0.5 (at `from`) to 0.5 (at `to`).
      const t = v.y + 0.5;
      const k = r0 + (r1 - r0) * t;
      v.x *= k;
      v.z *= k * depth;
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
  /** Squashes the cross-section across its second axis (flat tails, flippers). */
  flat?: number;
  /** How far each corner may wander, as a fraction of the local radius. */
  jitter?: number;
  color: Color;
  /** `u.y` runs 0 to 1 along the tube; `u.x` and `u.z` go round it. */
  paint?: Paint;
  /** Round the ends off (true) or leave them pointed at the path's ends. */
  round?: boolean;
  /** Which way the flat side faces at the start (defaults to sideways). */
  up?: Vec3;
  tone?: number;
}

/** A faceted tube along a path, closed at both ends: tails, tentacles, horns, necks, the snail's foot. */
export function tube(b: Builder, rnd: () => number, t: Tube): void {
  const n = Math.max(3, (t.sides ?? 6) - (LOW ? 1 : 0));
  const pts = t.pts.map((p) => new THREE.Vector3(...p));
  const m = pts.length;
  const flat = t.flat ?? 1;
  const j = t.jitter ?? 0.12;
  // Frames carried along the path so the tube doesn't twist.
  const tangents = pts.map((_p, i) => {
    const a = pts[Math.max(0, i - 1)];
    const c = pts[Math.min(m - 1, i + 1)];
    return c.clone().sub(a).normalize();
  });
  let side = new THREE.Vector3(...(t.up ?? [1, 0, 0]));
  if (Math.abs(side.dot(tangents[0])) > 0.95) side = new THREE.Vector3(0, 0, 1);
  side.sub(tangents[0].clone().multiplyScalar(side.dot(tangents[0]))).normalize();
  const positions: number[] = [];
  const units: number[] = [];
  for (let i = 0; i < m; i++) {
    const tan = tangents[i];
    side.sub(tan.clone().multiplyScalar(side.dot(tan))).normalize();
    const other = tan.clone().cross(side).normalize();
    const r = t.radii[i];
    for (let s = 0; s < n; s++) {
      const a = (s / n) * Math.PI * 2 + (i % 2) * (Math.PI / n) * 0.5;
      const cx = Math.cos(a);
      const cz = Math.sin(a);
      const jr = r * j;
      const p = pts[i]
        .clone()
        .addScaledVector(side, cx * r + (rnd() - 0.5) * 2 * jr)
        .addScaledVector(other, cz * r * flat + (rnd() - 0.5) * 2 * jr * flat)
        .addScaledVector(tan, (rnd() - 0.5) * jr);
      positions.push(p.x, p.y, p.z);
      units.push(cx, i / (m - 1), cz);
    }
  }
  // The two end points.
  const round = t.round ?? true;
  const startTip = pts[0].clone().addScaledVector(tangents[0], -(round ? t.radii[0] * 0.7 : 0));
  const endTip = pts[m - 1].clone().addScaledVector(tangents[m - 1], round ? t.radii[m - 1] * 0.7 : 0);
  const s0 = m * n;
  positions.push(startTip.x, startTip.y, startTip.z, endTip.x, endTip.y, endTip.z);
  units.push(0, 0, 0, 0, 1, 0);
  const index: number[] = [];
  for (let i = 0; i < m - 1; i++) {
    for (let s = 0; s < n; s++) {
      const a = i * n + s;
      const bq = i * n + ((s + 1) % n);
      const c = (i + 1) * n + s;
      const d = (i + 1) * n + ((s + 1) % n);
      index.push(a, c, bq, bq, c, d);
    }
  }
  for (let s = 0; s < n; s++) {
    index.push(s0, s, (s + 1) % n);
    index.push(s0 + 1, (m - 1) * n + ((s + 1) % n), (m - 1) * n + s);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  g.setAttribute('unit', new THREE.Float32BufferAttribute(units, 3));
  g.setIndex(index);
  finish(b, g, t.color, t.paint, t.tone ?? 0.07);
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

/** A thin flat sheet (wing membranes, fins) as a fan of faces round a centre, both sides. */
export function sheet(b: Builder, centreP: Vec3, rim: Vec3[], color: Color, parent?: THREE.Matrix4): void {
  const pos: number[] = [];
  for (let i = 0; i < rim.length - 1; i++) {
    const a = rim[i];
    const c = rim[i + 1];
    pos.push(...centreP, ...a, ...c, ...centreP, ...c, ...a);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  b.add(g, color, parent ?? new THREE.Matrix4());
}
