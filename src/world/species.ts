import * as THREE from 'three';
import { Builder, type Vec3 } from './build';
import { curve, pillar, seedOf, seeded, solid, tube, type BaseName, type Color, type Paint } from './paper';
import type { AnimalId } from './types';

/**
 * The papercraft animals: every species folded from a few faceted shapes on one body plan (a pear-shaped
 * body wide at the base, a head about a third of the height set a little forward, straight pillar arms
 * ending in paws, short sturdy legs with chunky feet, and a big tail), with markings as crisp colour panels.
 */

// ---------------------------------------------------------------- kit

export interface Shape {
  /** Head radii and centre, in neck space. */
  hr: Vec3;
  hc: Vec3;
  /** Torso radii and centre, in body space. */
  tr: Vec3;
  tc: Vec3;
}

/** Where the moving parts hang, in body space (the left side; the right mirrors it). */
export interface Joints {
  neck: Vec3;
  shoulder: Vec3;
  hip: Vec3;
  tail: Vec3;
  /** Where a held thing's grip sits, in the right arm's own space: just in front of the paw. */
  hand: Vec3;
}

export interface Kit {
  torso: Builder;
  head: Builder;
  eyes: Builder;
  armL: Builder;
  armR: Builder;
  legL: Builder;
  legR: Builder;
  tail: Builder;
  shape: Shape;
  joints: Joints;
  /** How far down the body may drop to sit on the ground. */
  seat: number;
  /** Where the eyes sit (neck space), so blinking squashes around them. */
  eyeY: number;
  /** Half the distance between the eyes, how big they are, and how far forward their fronts are (for glasses). */
  eyeX: number;
  eyeR: number;
  eyeZ: number;
  /** The tip of the nose, if the face has one (for a moustache). */
  nose: Vec3 | null;
  /** The head's own reshaping, so features can be placed on its surface. */
  headBend?: (v: THREE.Vector3) => void;
  rnd: () => number;
}

export interface Colors {
  coat: THREE.Color;
  light: THREE.Color;
  dark: THREE.Color;
  inner: THREE.Color;
}

export interface RecipeResult {
  aquatic?: boolean;
  legs?: 'none' | 'tentacles';
  sleepy?: boolean;
  /** Hovers this high off the ground (the bat, the jellyfish). */
  hover?: number;
  /** The arms are wings that beat while idling and moving. */
  flaps?: boolean;
  /** Translucent, like a jellyfish. */
  jelly?: boolean;
}

export type Recipe = (k: Kit, c: Colors, coat: string) => RecipeResult;

export const defaultShape = (): Shape => ({ hr: [0.205, 0.172, 0.185], hc: [0, 0.15, 0.06], tr: [0.235, 0.26, 0.19], tc: [0, 0.36, 0] });

export const defaultJoints = (): Joints => ({
  neck: [0, 0.565, 0.03],
  shoulder: [0.12, 0.46, 0.085],
  hip: [0.1, 0.17, 0.0],
  tail: [0, 0.19, -0.15],
  hand: [0, -0.3, 0.06],
});

export function newKit(id: string): Kit {
  return {
    torso: new Builder(),
    head: new Builder(),
    eyes: new Builder(),
    armL: new Builder(),
    armR: new Builder(),
    legL: new Builder(),
    legR: new Builder(),
    tail: new Builder(),
    shape: defaultShape(),
    joints: defaultJoints(),
    seat: 0.17,
    eyeY: 0.18,
    eyeX: 0.08,
    eyeR: 0.03,
    eyeZ: 0.2,
    nose: null,
    rnd: seeded(seedOf(id)),
  };
}

// ---------------------------------------------------------------- colour

export const col = (c: Color) => new THREE.Color(c);
export const mix = (a: Color, b: Color, t: number) => col(a).lerp(col(b), t);
export const luminance = (c: Color) => {
  const x = col(c);
  return 0.2126 * x.r + 0.7152 * x.g + 0.0722 * x.b;
};

export const INK = '#2a2326';
export const CREAM = '#efe3cb';
export const CHARCOAL = '#38332f';
export const PINK = '#d99a98';
const WARM = '#a48d74';

/** The player's colour, a touch muted and warmed so every coat sits in the same papery palette. */
export function mute(c: Color): THREE.Color {
  const x = col(c);
  const hsl = { h: 0, s: 0, l: 0 };
  x.getHSL(hsl);
  x.setHSL(hsl.h, hsl.s * 0.86, hsl.l);
  return x.lerp(col(WARM), 0.08);
}

export function colorsFor(coat: string): Colors {
  const c = mute(coat);
  return {
    coat: c,
    light: mix(c, CREAM, 0.62),
    dark: mix(c, CHARCOAL, 0.6),
    inner: mix(c, PINK, 0.6),
  };
}

// ---------------------------------------------------------------- small maths

const clamp = THREE.MathUtils.clamp;
export const smooth = (a: number, b: number, x: number) => {
  const t = clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};
const v3 = (p: THREE.Vector3): Vec3 => [p.x, p.y, p.z];

/** A placement from a position and Euler angles. */
export function frame(pos: Vec3 | THREE.Vector3, rot: Vec3 = [0, 0, 0]): THREE.Matrix4 {
  const p = Array.isArray(pos) ? new THREE.Vector3(...pos) : pos;
  return new THREE.Matrix4().compose(p, new THREE.Quaternion().setFromEuler(new THREE.Euler(...rot)), new THREE.Vector3(1, 1, 1));
}

/** A placement inside another one. */
export function inside(parent: THREE.Matrix4, pos: Vec3, rot: Vec3 = [0, 0, 0]): THREE.Matrix4 {
  return parent.clone().multiply(frame(pos, rot));
}

/** A point on the head's surface, from a point on its unit sphere (x across, y up), pushed `out` along the surface. */
export function onHead(k: Kit, ux: number, uy: number, out = 0): THREE.Vector3 {
  const v = new THREE.Vector3(ux, uy, Math.sqrt(Math.max(0, 1 - ux * ux - uy * uy)));
  k.headBend?.(v);
  const [rx, ry, rz] = k.shape.hr;
  const [cx, cy, cz] = k.shape.hc;
  const p = new THREE.Vector3(cx + v.x * rx, cy + v.y * ry, cz + v.z * rz);
  if (out) p.addScaledVector(headNormal(k, ux, uy), out);
  return p;
}

export function headNormal(k: Kit, ux: number, uy: number): THREE.Vector3 {
  const [rx, ry, rz] = k.shape.hr;
  const z = Math.sqrt(Math.max(0, 1 - ux * ux - uy * uy));
  return new THREE.Vector3(ux / rx, uy / ry, z / rz).normalize();
}

/** Turns +z to face along `n`, then rolls about it. */
function facing(n: THREE.Vector3, roll = 0): THREE.Quaternion {
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), n.clone().normalize());
  if (roll) q.multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), roll));
  return q;
}

// ---------------------------------------------------------------- body

export interface BodyOpts {
  color: Color;
  /** A belly panel down the front. */
  belly?: Color;
  bellyW?: number;
  /** How much narrower the top of the pear is than its base. */
  pear?: number;
  /** Chunky haunches at the base (the thighs), and their colour. */
  haunch?: boolean | Color;
  paint?: Paint;
  jitter?: number;
}

/** The pear-shaped body, flat underneath, with a belly panel and haunches. */
export function body(k: Kit, o: BodyOpts) {
  const s = k.shape;
  const pear = o.pear ?? 0.5;
  const bw = o.bellyW ?? 0.55;
  solid(k.torso, k.rnd, {
    base: 'ico2',
    r: s.tr,
    pos: s.tc,
    jitter: o.jitter ?? 0.05,
    bend: (v) => {
      const t = (v.y + 1) / 2;
      const w = 1 - pear * smooth(0.25, 1, t);
      v.x *= w;
      v.z *= w;
      if (v.z > 0) v.z *= 1 + 0.1 * (1 - smooth(0.2, 0.7, t));
      if (v.y < -0.72) v.y = -0.72 + (v.y + 0.72) * 0.3;
    },
    color: o.color,
    paint: (u, c, n) => {
      const p = o.paint?.(u, c, n);
      if (p) return p;
      if (o.belly && u.z > 0.42 && Math.abs(u.x) < bw && u.y < 0.62) return o.belly;
      return null;
    },
  });
  const bottom = s.tc[1] - s.tr[1] * 0.76;
  k.seat = bottom;
  if (o.haunch !== false) {
    const hc = typeof o.haunch === 'string' || o.haunch instanceof THREE.Color ? o.haunch : o.color;
    for (const side of [-1, 1]) {
      solid(k.torso, k.rnd, {
        base: 'ico1',
        r: [s.tr[0] * 0.5, s.tr[1] * 0.44, s.tr[2] * 0.8],
        pos: [side * s.tr[0] * 0.66, s.tc[1] - s.tr[1] * 0.5, s.tc[2] - s.tr[2] * 0.12],
        rot: [0.25, side * 0.3, 0],
        jitter: 0.06,
        color: hc,
      });
    }
    k.seat = Math.min(k.seat, s.tc[1] - s.tr[1] * 0.5 - s.tr[1] * 0.42);
  }
}

// ---------------------------------------------------------------- head

export interface HeadOpts {
  color: Color;
  paint?: Paint;
  /** How much the lower half widens into cheeks. */
  cheeks?: number;
  /** Pointed fur ruffs at the sides of the cheeks (raccoons, red pandas). */
  ruff?: number;
  /** A flatter or rounder crown. */
  crown?: number;
  jitter?: number;
  base?: BaseName;
  bend?: (v: THREE.Vector3) => void;
}

export function head(k: Kit, o: HeadOpts) {
  const cheeks = o.cheeks ?? 0.1;
  const ruff = o.ruff ?? 0;
  const crown = o.crown ?? 0.75;
  const bend = (v: THREE.Vector3) => {
    if (v.y > 0.5) v.y = 0.5 + (v.y - 0.5) * crown;
    const low = clamp(0.25 - v.y, 0, 1.2);
    v.x *= 1 + cheeks * low;
    if (ruff) {
      const side = Math.abs(v.x);
      const band = Math.max(0, 1 - Math.abs(v.y + 0.3) / 0.38);
      v.x *= 1 + ruff * band * smooth(0.55, 0.95, side) * (1 - 0.6 * Math.max(0, v.z));
    }
    if (v.z > 0.55) v.z = 0.55 + (v.z - 0.55) * 0.72;
    o.bend?.(v);
  };
  k.headBend = bend;
  solid(k.head, k.rnd, { base: o.base ?? 'ico2', r: k.shape.hr, pos: k.shape.hc, jitter: o.jitter ?? 0.05, bend, color: o.color, paint: o.paint });
}

export interface MuzzleOpts {
  color: Color;
  nose: Color;
  /** Width, height and length (radii). */
  w?: number;
  h?: number;
  len?: number;
  /** Where it sits on the face (unit height). */
  dy?: number;
  /** How much it narrows towards the tip: 0 a round muzzle, 0.5 a fox's snout. */
  point?: number;
  /** Tilts the tip down. */
  droop?: number;
  noseW?: number;
  noseH?: number;
  paint?: Paint;
}

/** A muzzle on the lower front of the face with a faceted nose on its tip. */
export function muzzle(k: Kit, o: MuzzleOpts) {
  const w = o.w ?? 0.09;
  const h = o.h ?? 0.065;
  const len = o.len ?? 0.09;
  const point = o.point ?? 0.2;
  const droop = o.droop ?? 0.15;
  const root = onHead(k, 0, o.dy ?? -0.32);
  const c = root.clone().add(new THREE.Vector3(0, 0, len * 0.45));
  solid(k.head, k.rnd, {
    base: 'ico1',
    r: [w, h, len],
    pos: v3(c),
    rot: [droop, 0, 0],
    jitter: 0.05,
    bend: (v) => {
      const f = Math.max(0, v.z);
      v.x *= 1 - point * f;
      v.y *= 1 - point * 0.6 * f;
      if (v.y > 0.4) v.y = 0.4 + (v.y - 0.4) * 0.5;
    },
    color: o.color,
    paint: o.paint,
  });
  // The nose: a small faceted wedge on the tip.
  const tipZ = c.z + len * (1 - point * 0.15) * Math.cos(droop) * 0.95;
  const tipY = c.y + h * 0.4 - Math.sin(droop) * len * 0.9;
  const nw = o.noseW ?? Math.max(0.03, w * 0.48);
  const nh = o.noseH ?? nw * 0.72;
  // A rounded triangle, wide on top and pointed underneath.
  solid(k.head, k.rnd, {
    base: 'ico0',
    r: [nw, nh, nw * 0.8],
    pos: [0, tipY, tipZ],
    rot: [0.3, 0, 0],
    jitter: 0.03,
    bend: (v) => {
      v.x *= 1 + v.y * 0.45;
      if (v.y > 0.3) v.y = 0.3 + (v.y - 0.3) * 0.5;
    },
    color: o.nose,
    tone: 0.14,
  });
  k.nose = [0, tipY - nh * 0.3, tipZ + nw * 0.6];
}

export interface EyeOpts {
  /** Where on the face (unit sphere): across and up. */
  x?: number;
  y?: number;
  size?: number;
  /** Width over height: above 1 an almond, below an upright oval. */
  wide?: number;
  /** Slant of the almond (positive tips the outer corners up). */
  slant?: number;
  color?: Color;
  /** A ring or white behind the eye. */
  ring?: Color;
  ringSize?: number;
  out?: number;
}

/** Dark faceted almond eyes with a single highlight facet. */
export function eyes(k: Kit, o: EyeOpts = {}) {
  const ux = o.x ?? 0.42;
  const uy = o.y ?? 0.08;
  const size = o.size ?? 1;
  const wide = o.wide ?? 1.15;
  const ew = 0.03 * size * Math.sqrt(wide);
  const eh = (0.03 * size) / Math.sqrt(wide);
  const ed = 0.016 * size;
  let p = new THREE.Vector3();
  for (const side of [-1, 1]) {
    p = onHead(k, side * ux, uy, (o.out ?? 0) + 0.004);
    const n = headNormal(k, side * ux, uy);
    const q = facing(n, side * (o.slant ?? 0.12));
    const m = new THREE.Matrix4().compose(p, q, new THREE.Vector3(1, 1, 1));
    if (o.ring) {
      const rs = o.ringSize ?? 1.45;
      solid(k.eyes, k.rnd, { base: 'ico1', r: [ew * rs, eh * rs, ed * 0.9], matrix: inside(m, [0, 0, -ed * 0.35]), jitter: 0.04, color: o.ring, tone: 0.05 });
    }
    solid(k.eyes, k.rnd, {
      base: 'ico0',
      r: [ew, eh, ed],
      matrix: m,
      jitter: 0.03,
      bend: (v) => {
        // Pointed at the corners, like an almond.
        v.y *= 1 - 0.35 * Math.abs(v.x);
      },
      color: o.color ?? INK,
      tone: 0.1,
    });
    solid(k.eyes, k.rnd, { base: 'ico0', r: [ew * 0.3, eh * 0.3, ed * 0.3], matrix: inside(m, [ew * 0.3, eh * 0.38, ed * 0.75]), jitter: 0.02, color: '#fbf6ec', tone: 0 });
  }
  k.eyeY = p.y;
  k.eyeX = Math.abs(p.x);
  k.eyeR = Math.max(ew, eh) * (o.ring ? 1.4 : 1.1);
  k.eyeZ = p.z + ed;
}

export interface EarOpts {
  color: Color;
  inner?: Color;
  /** Where the ear's base sits on the head (unit sphere), and its size. */
  x?: number;
  y?: number;
  w?: number;
  h?: number;
  d?: number;
  /** Leaning outward, and back. */
  splay?: number;
  back?: number;
  /** A coloured tip (fox) and how far down it reaches (0 to 1). */
  tip?: Color;
  tipFrom?: number;
  /** 'pointy' pyramids, 'round' discs, or 'long' rabbit ears. */
  kind?: 'pointy' | 'round' | 'long';
  /** Droop a long ear forward or flop it to the side. */
  flop?: number;
}

export function ears(k: Kit, o: EarOpts) {
  const kind = o.kind ?? 'pointy';
  const w = o.w ?? 0.075;
  const h = o.h ?? 0.13;
  const d = o.d ?? 0.04;
  for (const side of [-1, 1]) {
    const base = onHead(k, side * (o.x ?? 0.55), o.y ?? 0.72, -0.012);
    const splay = side * -(o.splay ?? 0.32);
    const m = frame(base, [-(o.back ?? 0.1), 0, splay]);
    if (kind === 'round') {
      solid(k.head, k.rnd, { base: 'ico1', r: [w, w * 0.92, d], matrix: inside(m, [0, w * 0.55, 0]), jitter: 0.05, color: o.color });
      if (o.inner) solid(k.head, k.rnd, { base: 'ico0', r: [w * 0.6, w * 0.55, d * 0.4], matrix: inside(m, [0, w * 0.5, d * 0.72]), jitter: 0.04, color: o.inner });
      continue;
    }
    if (kind === 'long') {
      const flop = (o.flop ?? 0) * side;
      const lm = inside(m, [0, 0, 0], [0, 0, flop]);
      solid(k.head, k.rnd, {
        base: 'ico1',
        r: [w, h, d],
        matrix: inside(lm, [0, h * 0.85, 0]),
        jitter: 0.05,
        bend: (v) => {
          // Narrow at the root, widest two thirds up, rounded to a blunt point.
          const t = (v.y + 1) / 2;
          v.x *= 0.55 + 0.6 * Math.sin(Math.min(1, t * 1.25) * Math.PI * 0.62);
          if (v.z < 0) v.z *= 0.7;
        },
        color: o.color,
        paint: o.tip ? (u) => (u.y > (o.tipFrom ?? 0.6) ? o.tip : null) : undefined,
      });
      if (o.inner) {
        solid(k.head, k.rnd, {
          base: 'ico1',
          r: [w * 0.55, h * 0.78, d * 0.35],
          matrix: inside(lm, [0, h * 0.85, d * 0.72]),
          jitter: 0.04,
          bend: (v) => {
            const t = (v.y + 1) / 2;
            v.x *= 0.55 + 0.6 * Math.sin(Math.min(1, t * 1.25) * Math.PI * 0.62);
          },
          color: o.inner,
        });
      }
      continue;
    }
    // Pointy: a pyramid with its flat face forward, and a smaller dark panel just proud of that face.
    solid(k.head, k.rnd, {
      base: 'pyramid',
      r: [w, h, d],
      matrix: inside(m, [0, h * 0.5, 0]),
      jitter: 0.03,
      color: o.color,
      paint: o.tip ? (u) => (u.y > 0.5 - (o.tipFrom ?? 0.35) ? o.tip : null) : undefined,
    });
    if (o.inner) {
      const ih = h * 0.72;
      const dz = 0.707 * d * (1 - 0.06 - 0.72) + 0.005;
      solid(k.head, k.rnd, { base: 'pyramid', r: [w * 0.62, ih, d * 0.72], matrix: inside(m, [0, h * 0.06 + ih * 0.5, dz]), jitter: 0.02, color: o.inner });
    }
  }
}

// ---------------------------------------------------------------- limbs

export interface ArmOpts {
  color: Color;
  /** The lower leg (a sock) from this far down, 0 to 1. */
  sock?: Color;
  sockFrom?: number;
  paw?: Color;
  /** Length from shoulder to the top of the paw, and thickness. */
  len?: number;
  r?: number;
}

/** Front legs as straight faceted pillars ending in paws: they're the arms. */
export function arms(k: Kit, o: ArmOpts) {
  const len = o.len ?? 0.27;
  const r = o.r ?? 0.055;
  const sockFrom = o.sockFrom ?? 0.45;
  const paw = o.paw ?? o.sock ?? o.color;
  for (const b of [k.armL, k.armR]) {
    pillar(b, k.rnd, [0, 0.03, 0], [0, -len, 0], r, r * 0.86, o.color, {
      depth: 0.92,
      paint: o.sock ? (u) => (u.y + 0.5 > sockFrom ? o.sock : null) : undefined,
    });
    solid(b, k.rnd, {
      base: 'ico1',
      r: [r * 1.12, r * 0.85, r * 1.25],
      pos: [0, -len - r * 0.25, r * 0.28],
      jitter: 0.06,
      bend: (v) => {
        if (v.y < -0.5) v.y = -0.5 + (v.y + 0.5) * 0.4;
      },
      color: paw,
    });
  }
  k.joints.hand = [0, -len - r * 0.25, r * 0.28 + r * 1.05];
}

export interface LegOpts {
  color: Color;
  foot?: Color;
  r?: number;
  /** Foot length (front to back radius) and height. */
  footLen?: number;
  footH?: number;
  /** A sole panel under the foot (bunnies' pink pads). */
  sole?: Color;
}

/** Short sturdy hind legs with chunky feet resting on the ground. */
export function legs(k: Kit, o: LegOpts) {
  const hipY = k.joints.hip[1];
  const r = o.r ?? 0.058;
  const fh = o.footH ?? 0.045;
  const fl = o.footLen ?? r * 1.7;
  for (const b of [k.legL, k.legR]) {
    pillar(b, k.rnd, [0, 0.02, 0], [0, -hipY + fh, 0.0], r, r * 0.92, o.color, { depth: 1 });
    solid(b, k.rnd, {
      base: 'ico1',
      r: [r * 1.15, fh, fl],
      pos: [0, -hipY + fh * 0.62, fl * 0.42],
      jitter: 0.05,
      bend: (v) => {
        if (v.y < -0.62) v.y = -0.62;
        if (v.z > 0) v.y *= 1 - 0.25 * v.z;
      },
      color: o.foot ?? o.color,
      paint: o.sole ? (u) => (u.y < -0.55 ? o.sole : null) : undefined,
    });
  }
}

// ---------------------------------------------------------------- tails

export interface TailOpts {
  color: Color;
  /** Rings of a second colour (raccoon, red panda), and how many bands. */
  rings?: Color;
  bands?: number;
  /** A tip of another colour, from this far along (0 to 1). */
  tip?: Color;
  tipFrom?: number;
  len?: number;
  /** Radius at its fattest. */
  r?: number;
  /** Which way it heads from the body and how it curls each step. */
  dir?: Vec3;
  curl?: Vec3;
  steps?: number;
  /** Radii along the tail, as fractions of `r`. */
  profile?: number[];
  flat?: number;
  sides?: number;
}

/** A big faceted tail along a gentle curve. */
export function tail(k: Kit, o: TailOpts) {
  const steps = o.steps ?? 5;
  const len = o.len ?? 0.4;
  const pts = curve([0, 0, 0.02], o.dir ?? [0, -0.3, -1], steps, len / steps, o.curl ?? [0.3, 0, 0]);
  const prof = o.profile ?? [0.45, 0.85, 1, 0.95, 0.75, 0.4];
  const r = o.r ?? 0.09;
  const radii = pts.map((_, i) => r * prof[Math.min(prof.length - 1, Math.round((i / (pts.length - 1)) * (prof.length - 1)))]);
  const bands = o.bands ?? 6;
  tube(k.tail, k.rnd, {
    pts,
    radii,
    sides: o.sides ?? 7,
    flat: o.flat,
    jitter: 0.1,
    color: o.color,
    paint: (u) => {
      if (o.tip && u.y >= (o.tipFrom ?? 0.8)) return o.tip;
      if (o.rings && Math.floor(u.y * bands + 0.5) % 2 === 1) return o.rings;
      return null;
    },
  });
}

/** A round puff of a tail. */
export function puffTail(k: Kit, color: Color, r = 0.065) {
  solid(k.tail, k.rnd, { base: 'ico1', r: [r, r, r * 0.9], pos: [0, 0.01, -r * 0.4], jitter: 0.1, color });
}

// ---------------------------------------------------------------- species

/** A plain stand-in for the animals not refolded yet: the shared body plan in the coat colour. */
function plain(k: Kit, c: Colors): RecipeResult {
  body(k, { color: c.coat, belly: c.light });
  head(k, { color: c.coat });
  muzzle(k, { color: c.light, nose: INK });
  eyes(k);
  ears(k, { color: c.coat, inner: c.inner });
  arms(k, { color: c.coat, paw: c.dark });
  legs(k, { color: c.coat, foot: c.dark });
  tail(k, { color: c.coat, tip: c.light });
  return {};
}

const RACCOON_MASK = '#3a3634';
const RACCOON_CREAM = '#e4d6bb';

export const RECIPES: Record<AnimalId, Recipe> = {
  raccoon(k, c) {
    const mask = mix(c.coat, RACCOON_MASK, 0.82);
    const cream = mix(c.coat, RACCOON_CREAM, 0.85);
    const sock = mix(c.coat, RACCOON_MASK, 0.75);
    body(k, { color: c.coat, belly: mix(c.coat, cream, 0.22), bellyW: 0.5, haunch: c.coat });
    head(k, {
      color: c.coat,
      cheeks: 0.12,
      ruff: 0.3,
      paint: (u) => {
        const ax = Math.abs(u.x);
        // The bandit mask across the eyes, a cream brow over it and cream below, a grey stripe down the middle.
        if (u.z < -0.15) return null;
        const brow = 0.36 - ax * 0.12;
        if (u.y > brow - 0.02 && u.y < brow + 0.2 && ax > 0.1 && ax < 0.78 && u.z > 0.2) return cream;
        if (u.y <= brow - 0.02 && u.y > -0.34 + ax * 0.15 && ax > 0.12) return mask;
        if (u.y <= -0.2 && u.z > -0.1) return cream;
        if (ax > 0.82 && u.y < 0.05 && u.y > -0.6) return cream;
        return null;
      },
    });
    muzzle(k, { color: cream, nose: RACCOON_MASK, w: 0.085, h: 0.062, len: 0.1, dy: -0.36, point: 0.3, droop: 0.14 });
    eyes(k, { x: 0.37, y: 0.07, size: 0.85, wide: 1.3, slant: 0.18, color: '#141011', out: 0.006 });
    ears(k, { color: cream, inner: mask, x: 0.6, y: 0.7, w: 0.085, h: 0.13, d: 0.042, splay: 0.34 });
    arms(k, { color: c.coat, sock, sockFrom: 0.38 });
    legs(k, { color: sock, foot: sock });
    tail(k, { color: c.coat, rings: mask, bands: 7, tip: mask, tipFrom: 0.86, r: 0.105, len: 0.42, dir: [0, -0.35, -1], curl: [0.2, -0.3, 0], profile: [0.5, 0.85, 1, 1, 0.9, 0.6] });
    return {};
  },
  fox(k, c) {
    const white = mix(c.coat, CREAM, 0.85);
    const sock = mix(c.coat, CHARCOAL, 0.78);
    k.shape.hr = [0.19, 0.16, 0.18];
    body(k, { color: c.coat, belly: white, bellyW: 0.45, pear: 0.48 });
    head(k, {
      color: c.coat,
      cheeks: 0.18,
      ruff: 0.22,
      paint: (u) => {
        const ax = Math.abs(u.x);
        // White cheeks sweeping up from the jaw.
        if (u.z > 0.05 && u.y < -0.12 - ax * 0.12 + 0.18 * ax * ax) return white;
        if (ax > 0.8 && u.y < 0.05 && u.y > -0.55) return white;
        return null;
      },
    });
    muzzle(k, {
      color: c.coat,
      nose: INK,
      w: 0.07,
      h: 0.055,
      len: 0.12,
      dy: -0.3,
      point: 0.55,
      droop: 0.1,
      noseW: 0.024,
      paint: (u) => (u.y < 0.05 ? white : null),
    });
    eyes(k, { x: 0.4, y: 0.1, size: 0.95, wide: 1.4, slant: 0.32, color: '#1a1412' });
    ears(k, { color: c.coat, inner: white, tip: sock, tipFrom: 0.3, x: 0.52, y: 0.72, w: 0.085, h: 0.16, d: 0.04, splay: 0.24 });
    arms(k, { color: c.coat, sock, sockFrom: 0.42 });
    legs(k, { color: sock, foot: sock });
    tail(k, {
      color: c.coat,
      tip: white,
      tipFrom: 0.78,
      r: 0.1,
      len: 0.48,
      dir: [0, -0.15, -1],
      curl: [0.22, 0.05, 0],
      profile: [0.35, 0.75, 1, 1, 0.85, 0.55, 0.25],
      steps: 6,
    });
    return {};
  },
  bunny(k, c) {
    const pale = mix(c.coat, CREAM, 0.55);
    const pink = mix(c.coat, '#e3a0a6', 0.75);
    k.shape.hr = [0.19, 0.17, 0.175];
    k.shape.tr = [0.195, 0.24, 0.17];
    body(k, { color: c.coat, belly: pale, bellyW: 0.5, pear: 0.45 });
    head(k, { color: c.coat, cheeks: 0.2, crown: 0.85 });
    // Two puffy cheeks either side of a little pink nose.
    for (const side of [-1, 1]) {
      const p = onHead(k, side * 0.14, -0.38, -0.01);
      solid(k.head, k.rnd, { base: 'ico1', r: [0.042, 0.034, 0.034], pos: [p.x, p.y, p.z + 0.012], jitter: 0.05, color: pale });
    }
    const np = onHead(k, 0, -0.22, 0.01);
    solid(k.head, k.rnd, { base: 'ico0', r: [0.022, 0.016, 0.014], pos: v3(np), rot: [0.3, 0, 0], jitter: 0.03, color: pink, tone: 0.1 });
    k.nose = [np.x, np.y, np.z + 0.012];
    eyes(k, { x: 0.42, y: 0.1, size: 1.05, wide: 0.95, slant: 0.05, color: '#1c1416' });
    ears(k, { kind: 'long', color: c.coat, inner: pink, x: 0.3, y: 0.82, w: 0.05, h: 0.19, d: 0.03, splay: 0.12, back: 0.18 });
    arms(k, { color: c.coat, len: 0.22, r: 0.046 });
    k.joints.hip = [0.1, 0.16, -0.01];
    legs(k, { color: c.coat, foot: c.coat, r: 0.06, footLen: 0.11, footH: 0.045, sole: pale });
    puffTail(k, pale, 0.07);
    return {};
  },
  snail(k, c, coat) {
    // The coat colour is the shell; the snail itself is a soft putty colour.
    const skin = mix('#cdbf98', coat, 0.12);
    const belly = mix(skin, CREAM, 0.4);
    const shell = c.coat;
    const line = mix(coat, CHARCOAL, 0.5);
    k.shape.tc = [0, 0.15, 0.02];
    k.shape.tr = [0.17, 0.12, 0.34];
    k.shape.hc = [0, 0.08, 0.02];
    k.shape.hr = [0.115, 0.11, 0.11];
    k.joints.neck = [0, 0.36, 0.27];
    k.joints.shoulder = [0.11, 0.27, 0.34];
    k.joints.tail = [0, 0.05, -0.28];
    // The foot: long and low, rising at the front into the head.
    tube(k.torso, k.rnd, {
      pts: [
        [0, 0.05, -0.3],
        [0, 0.06, -0.14],
        [0, 0.07, 0.06],
        [0, 0.12, 0.23],
        [0, 0.24, 0.3],
        [0, 0.36, 0.29],
      ],
      radii: [0.07, 0.125, 0.14, 0.135, 0.12, 0.1],
      sides: 7,
      flat: 0.8,
      up: [1, 0, 0],
      jitter: 0.08,
      color: skin,
      paint: (_u, _c, n) => (n.y < -0.6 ? belly : null),
    });
    // The shell: a faceted tube wound into a coil on the back, banded like growth rings. It starts low at the
    // front, tucked into the foot, then runs up the front, over the top, down the back and in.
    const sc = new THREE.Vector3(0, 0.4, -0.08);
    const coil: Vec3[] = [];
    const radii: number[] = [];
    const turns = 2.2 * Math.PI;
    const steps = 24;
    const a0 = 0.5;
    for (let i = 0; i <= steps; i++) {
      const a = a0 + (i / steps) * turns;
      const R = 0.2 * Math.exp(-0.3 * (a - a0));
      coil.push([-0.03 + 0.06 * (i / steps), sc.y - R * Math.cos(a), sc.z + R * Math.sin(a)]);
      radii.push(0.74 * R * 1.25 + 0.006);
    }
    tube(k.torso, k.rnd, {
      pts: coil,
      radii,
      sides: 7,
      flat: 0.8,
      up: [1, 0, 0],
      jitter: 0.07,
      color: shell,
      paint: (u) => (Math.floor(u.y * 13) % 2 ? mix(shell, line, 0.3) : null),
    });
    k.seat = 0;
    head(k, { color: skin, cheeks: 0.06, crown: 0.9 });
    const np = onHead(k, 0, -0.25, 0.004);
    solid(k.head, k.rnd, { base: 'ico0', r: [0.026, 0.018, 0.018], pos: v3(np), jitter: 0.03, color: mix(skin, CHARCOAL, 0.18) });
    k.nose = [np.x, np.y, np.z + 0.014];
    // Eyes on stalks, each a dark bead on the end.
    let tip = new THREE.Vector3();
    for (const side of [-1, 1]) {
      const from = onHead(k, side * 0.3, 0.72, -0.02);
      tip = new THREE.Vector3(side * 0.08, 0.32, 0.07);
      pillar(k.head, k.rnd, v3(from), v3(tip), 0.021, 0.015, skin, { base: 'limb5' });
      solid(k.head, k.rnd, { base: 'ico1', r: 0.033, pos: v3(tip), jitter: 0.06, color: skin });
      const m = frame(tip.clone().add(new THREE.Vector3(0, 0.004, 0.025)));
      solid(k.eyes, k.rnd, { base: 'ico0', r: [0.021, 0.023, 0.014], matrix: m, jitter: 0.03, color: INK, tone: 0.1 });
      solid(k.eyes, k.rnd, { base: 'ico0', r: 0.007, matrix: inside(m, [0.007, 0.009, 0.011]), jitter: 0.02, color: '#fbf6ec', tone: 0 });
      // The short feelers lower down.
      const lf = onHead(k, side * 0.32, -0.1, -0.01);
      pillar(k.head, k.rnd, v3(lf), [side * 0.075, lf.y + 0.035, lf.z + 0.05], 0.011, 0.008, skin, { base: 'limb5' });
    }
    k.eyeY = tip.y;
    k.eyeX = 0.08;
    k.eyeR = 0.033;
    k.eyeZ = tip.z + 0.04;
    // Little nubs of arms at the front of the body, so it can still carry a mug.
    arms(k, { color: skin, len: 0.07, r: 0.036 });
    return { legs: 'none' };
  },
  wolf: plain,
  bear: plain,
  cat: plain,
  dog: plain,
  deer: plain,
  owl: plain,
  koala: plain,
  hedgehog: plain,
  panda: plain,
  penguin: plain,
  otter: plain,
  frog: plain,
  axolotl: plain,
  shark: plain,
  octopus: plain,
  duck: plain,
  platypus: plain,
  capybara: plain,
  redpanda: plain,
  quokka: plain,
  sloth: plain,
  seal: plain,
  puffin: plain,
  fennec: plain,
  chinchilla: plain,
  highland: plain,
  squid: plain,
  bat: plain,
  raven: plain,
  wombat: plain,
  jellyfish: plain,
  gecko: plain,
};
