import * as THREE from 'three';
import { SMOOTH_LOOK, type Vec3 } from './build';
import { Fold, along, card, curve, pillar, seedOf, seeded, solid, tube, type BaseName, type Color, type Paint } from './paper';
import type { Markings } from './forms';
import type { Sculpt } from './sculpt';

/**
 * The papercraft kit for the animals: one body plan (a pear-shaped body wide at the base, a head about a
 * third of the height set a little forward, straight pillar arms ending in paws, short sturdy legs with
 * chunky feet, and a big tail), the faceted pieces every species is folded from, and the bones they hang on.
 * The species themselves, and how each one carries itself, are in recipes.ts.
 */

// ---------------------------------------------------------------- kit

export interface Shape {
  /** Head radii and centre, in neck space. */
  hr: Vec3;
  hc: Vec3;
  /** Torso radii and centre, in body space. */
  tr: Vec3;
  tc: Vec3;
  /** How much narrower the top of the body is than its base. */
  pear?: number;
}

/** Where the moving parts hang, in body space (the left side; the right mirrors it). */
export interface Joints {
  neck: Vec3;
  shoulder: Vec3;
  hip: Vec3;
  tail: Vec3;
  /** Where a held thing's grip sits, in the right arm's own space: just in front of the paw. */
  hand: Vec3;
  /** The middle of the paw, in the arm's own space (for putting paws on things). */
  paw?: Vec3;
}

/**
 * One piece of the model: its faces, the bone whose space they were built in, and the bone (or chain of
 * bones, for a bendy tail) they move with.
 */
export interface Part {
  fold: Fold;
  space: string;
  bone: string;
  chain?: string[];
  /** Drawn with the eye material (and squashed for blinks). */
  eyes?: boolean;
  /** Drawn see-through (a bee's wings). */
  glass?: boolean;
}

/** An extra bone beyond the standard ones, at a spot in its parent's space. */
export interface BoneDef {
  name: string;
  parent: string;
  pos: Vec3;
}

export interface Kit {
  parts: Map<string, Part>;
  bones: BoneDef[];
  /** Bones that squash shut for a blink. */
  blink: string[];
  torso: Fold;
  head: Fold;
  eyes: Fold;
  armL: Fold;
  armR: Fold;
  legL: Fold;
  legR: Fold;
  tail: Fold;
  shape: Shape;
  joints: Joints;
  /** How far down the body may drop to sit on the ground. */
  seat: number;
  /** How far forward the front of the body (or neck) reaches, for holding things clear of it. */
  front?: number;
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
  /** A sculpted animal: its shapes, its colours and markings, and how finely it's cut (see forms.ts). */
  sculpt?: Sculpt;
  marks?: Markings;
  step?: number;
  /** Bones that start turned (Euler angles): a sculpted arm is made hanging the way it's held. */
  bind?: Record<string, Vec3>;
  /** The sculpted hind feet (model space), for toes and claws. */
  feet?: { bone: string; at: Vec3; r: Vec3 }[];
  /** The sculpted front paws (model space), and how each is turned. */
  paws?: { bone: string; at: Vec3; r: Vec3; rot: Vec3 }[];
  /** How far down a sculpted arm its elbow is (it bends there, on its own bone). */
  elbow?: number;
  /** Its paws can't come up to its mouth (a jellyfish's arms hang under its bell): it sips from low down. */
  sipLow?: boolean;
  /**
   * Crisp pieces built as plain faceted geometry and fixed rigidly to one bone each (spikes, locks of hair),
   * by name, with the corners of each one's root (model space), which must be sunk into the body.
   */
  pieces?: { name: string; bone: string; root: Vec3[] }[];
  /** Holds things this much higher than its shoulders would put them (a squid's arms start low). */
  lift?: number;
  /** Rosy cheeks, blended softly into the sculpted surface (model space): where, which way they face, how wide. */
  blush?: { at: Vec3; n: Vec3; r: number }[];
  /** Puts a point near the head (neck space) onto the sculpted surface, `out` beyond it, and which way is out there. */
  surface?: (p: THREE.Vector3, out: number) => THREE.Vector3;
  normalAt?: (p: THREE.Vector3) => THREE.Vector3;
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
  /** The right arm is a little tendril that only comes out to hold or gesture (the snail). */
  tendril?: boolean;
  /**
   * Little wings on its back, on bones of their own (wingL and wingR): a bee's buzz whenever it's up in the air,
   * or a dragon's, folded until it flutters them (cheering, dancing, now and then while idling).
   */
  wings?: 'buzz' | 'flutter';
  /** Its eyes are turrets (on bones turretL and turretR) that swivel about each on its own (the chameleon). */
  swivel?: boolean;
  /** Its skin slowly shifts colour, a shimmer travelling along it (the chameleon). */
  shifts?: boolean;
}

export type Recipe = (k: Kit, c: Colors, coat: string) => RecipeResult;

// ---------------------------------------------------------------- personality

/** How an animal gets about. */
export type Gait = 'trot' | 'amble' | 'hop' | 'slither' | 'waddle' | 'lumber' | 'scuttle' | 'flap' | 'slow' | 'float';
/** How it sits down. */
export type SitStyle = 'tuck' | 'wrap' | 'feet' | 'settle';
/** Little things it does now and then while standing about. */
export type Mannerism =
  | 'earSwivel'
  | 'earTwitch'
  | 'tailSwish'
  | 'headTilt'
  | 'sniff'
  | 'rubPaws'
  | 'noseWiggle'
  | 'hop'
  | 'stalks'
  | 'stretch'
  | 'headSwivel'
  | 'slowBlink'
  | 'lickPaw'
  | 'tailCurl'
  | 'wag'
  | 'pant'
  | 'sway'
  | 'scratch'
  | 'flap'
  | 'throat'
  | 'chill'
  | 'wingStretch'
  | 'flutter'
  | 'lookAround';

export interface Profile {
  /** Forward lean of the body when standing (radians), and the head's pitch and roll on top of it. */
  lean: number;
  head: number;
  tilt: number;
  /** Front paws held up in front of the chest when idle, this far below the shoulders (0: they hang). */
  paws: number;
  gait: Gait;
  /** Steps a second, relative to the usual, and how far the legs swing. */
  cadence: number;
  stride: number;
  sit: SitStyle;
  /**
   * How it sleeps: on its back (the usual), settled upright against the pillow, or curled up on its side (when it
   * has a fin, a shell or spines along its back that would dig into the bed).
   */
  bed?: 'back' | 'upright' | 'side';
  idles: Mannerism[];
  /** How much the tail sways at rest, and whether the ears lie back when moving. */
  tailSway: number;
  earsBack: number;
}

export const defaultProfile = (): Profile => ({
  lean: 0,
  head: 0,
  tilt: 0,
  paws: 0,
  gait: 'trot',
  cadence: 1,
  stride: 1,
  sit: 'tuck',
  idles: ['lookAround', 'headTilt'],
  tailSway: 0.25,
  earsBack: 0,
});

// ---------------------------------------------------------------- the standard body

export const defaultShape = (): Shape => ({ hr: [0.205, 0.172, 0.185], hc: [0, 0.15, 0.06], tr: [0.235, 0.26, 0.19], tc: [0, 0.36, 0] });

export const defaultJoints = (): Joints => ({
  neck: [0, 0.565, 0.03],
  shoulder: [0.12, 0.46, 0.085],
  hip: [0.1, 0.17, 0.0],
  tail: [0, 0.19, -0.15],
  hand: [0, -0.3, 0.06],
});

/** Adds (or finds) a part built in `space`'s coordinates and moving with `bone`. */
export function part(k: Kit, name: string, space: string, opts: { bone?: string; chain?: string[]; eyes?: boolean; glass?: boolean } = {}): Fold {
  const hit = k.parts.get(name);
  if (hit) return hit.fold;
  const fold = new Fold();
  k.parts.set(name, { fold, space, bone: opts.bone ?? space, chain: opts.chain, eyes: opts.eyes, glass: opts.glass });
  return fold;
}

/** Adds an extra bone at a spot in its parent's space. */
export function bone(k: Kit, name: string, parent: string, pos: Vec3) {
  if (!k.bones.some((b) => b.name === name)) k.bones.push({ name, parent, pos });
}

export function newKit(id: string): Kit {
  const k = {
    parts: new Map<string, Part>(),
    bones: [] as BoneDef[],
    blink: ['eyes'],
    shape: defaultShape(),
    joints: defaultJoints(),
    seat: 0.17,
    eyeY: 0.18,
    eyeX: 0.08,
    eyeR: 0.03,
    eyeZ: 0.2,
    nose: null,
    rnd: seeded(seedOf(id)),
  } as unknown as Kit;
  k.torso = part(k, 'torso', 'body');
  k.head = part(k, 'head', 'neck');
  k.eyes = part(k, 'eyes', 'neck', { bone: 'eyes', eyes: true });
  k.armL = part(k, 'armL', 'armL');
  k.armR = part(k, 'armR', 'armR');
  k.legL = part(k, 'legL', 'legL');
  k.legR = part(k, 'legR', 'legR');
  k.tail = part(k, 'tail', 'tail');
  return k;
}

// ---------------------------------------------------------------- colour

export const col = (c: Color) => new THREE.Color(c);
export const mix = (a: Color, b: Color, t: number) => col(a).lerp(col(b), t);
export const luminance = (c: Color) => {
  const x = col(c);
  return 0.2126 * x.r + 0.7152 * x.g + 0.0722 * x.b;
};

// (The smooth finish has a softer ink, a warm off-white and a rosier pink; ?look=paper the card palette.)
export const INK = SMOOTH_LOOK ? '#231c1f' : '#2a2326';
export const CREAM = SMOOTH_LOOK ? '#f1e6d3' : '#efe3cb';
export const CHARCOAL = '#38332f';
export const PINK = SMOOTH_LOOK ? '#eba3ab' : '#d99a98';
export const BLUSH = '#ee8e9a';
const WARM = '#a48d74';

/**
 * Swatches retuned to sit with the card palette (the picker's swatch on the left, what gets folded on the
 * right). The raccoon's default grey becomes the reference sculpture's warm grey-green.
 */
const SWATCH: Record<string, string> = {
  'raccoon:#8a8c94': '#8e8b7c',
};

/** The player's colour, a touch muted and warmed so every coat sits in the same papery palette. */
export function mute(c: Color): THREE.Color {
  const x = col(c);
  const hsl = { h: 0, s: 0, l: 0 };
  x.getHSL(hsl);
  x.setHSL(hsl.h, hsl.s * 0.86, hsl.l);
  return x.lerp(col(WARM), 0.08);
}

/** The smooth finish keeps the coat's own colour, but brings the brightest coats down a little in lightness. */
function soften(c: Color): THREE.Color {
  const x = col(c);
  const hsl = { h: 0, s: 0, l: 0 };
  x.getHSL(hsl);
  const value = Math.max(x.r, x.g, x.b);
  return x.setHSL(hsl.h, hsl.s, hsl.l * (1 - 0.13 * smooth(0.6, 0.95, value)));
}

export function colorsFor(coat: string, id?: string): Colors {
  // The smooth finish: the coat as chosen (softened if very bright), warm off-white lights and soft darks.
  if (SMOOTH_LOOK) {
    const c = soften(coat);
    return { coat: c, light: mix(c, '#f6ead8', 0.6), dark: mix(c, '#2a2020', 0.38), inner: mix(c, PINK, 0.6) };
  }
  const c = mute(SWATCH[`${id}:${coat.toLowerCase()}`] ?? coat);
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
export const v3 = (p: THREE.Vector3): Vec3 => [p.x, p.y, p.z];

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
  if (k.surface) return k.surface(p, out);
  if (out) p.addScaledVector(headNormal(k, ux, uy), out);
  return p;
}

export function headNormal(k: Kit, ux: number, uy: number): THREE.Vector3 {
  if (k.normalAt) return k.normalAt(onHead(k, ux, uy));
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

/** Distance from a point to a segment, in 2D, and how far along the segment the nearest point is. */
export function segDist(px: number, py: number, ax: number, ay: number, bx: number, by: number): { d: number; t: number } {
  const dx = bx - ax;
  const dy = by - ay;
  const t = clamp(((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy), 0, 1);
  return { d: Math.hypot(px - ax - dx * t, py - ay - dy * t), t };
}

/** A painter for round spots scattered over a unit shape, only where `where` allows. */
export function spotted(seed: number, n: number, size: number, color: Color, where: (d: THREE.Vector3) => boolean = () => true): Paint {
  const rnd = seeded(seed);
  const centres: THREE.Vector3[] = [];
  for (let tries = 0; centres.length < n && tries < n * 40; tries++) {
    const d = new THREE.Vector3(rnd() * 2 - 1, rnd() * 2 - 1, rnd() * 2 - 1);
    if (d.lengthSq() > 1 || d.lengthSq() < 0.01) continue;
    d.normalize();
    if (!where(d) || centres.some((c) => c.distanceTo(d) < size * 1.7)) continue;
    centres.push(d);
  }
  const t = new THREE.Vector3();
  return (u) => (centres.some((c) => t.copy(u).normalize().distanceTo(c) < size) ? color : null);
}

// ---------------------------------------------------------------- body

export interface BodyOpts {
  color: Color;
  /** A belly panel down the front. */
  belly?: Color;
  bellyW?: number;
  /** How much narrower the top of the pear is than its base. */
  pear?: number;
  /** Chunky haunches at the base (the thighs), and their colour and size. */
  haunch?: boolean | Color;
  haunchSize?: number;
  paint?: Paint;
  jitter?: number;
}

/** The pear-shaped body, flat underneath, with a belly panel and haunches. */
export function body(k: Kit, o: BodyOpts) {
  const s = k.shape;
  const pear = o.pear ?? 0.5;
  s.pear = pear;
  const bw = o.bellyW ?? 0.55;
  solid(k.torso, k.rnd, {
    base: 'ico3',
    r: s.tr,
    pos: s.tc,
    jitter: o.jitter ?? 0.022,
    bend: (v) => {
      const t = (v.y + 1) / 2;
      const w = 1 - pear * smooth(0.25, 1, t);
      v.x *= w;
      v.z *= w;
      if (v.z > 0) v.z *= 1 + 0.1 * (1 - smooth(0.2, 0.7, t));
      if (v.y < -0.72) v.y = -0.72 + (v.y + 0.72) * 0.3;
    },
    color: o.color,
    tone: 0.05,
    paint: (u, c, n) => {
      const p = o.paint?.(u, c, n);
      if (p) return p;
      if (o.belly && u.z > 0.42 && Math.abs(u.x) < bw && u.y < 0.62) return o.belly;
      return null;
    },
  });
  k.seat = s.tc[1] - s.tr[1] * 0.76;
  if (o.haunch !== false) {
    const hc = typeof o.haunch === 'string' || o.haunch instanceof THREE.Color ? o.haunch : o.color;
    const hs = o.haunchSize ?? 1;
    for (const side of [-1, 1]) {
      // Flattened against the body so they read as thighs rather than balls.
      solid(k.torso, k.rnd, {
        base: 'ico2',
        r: [s.tr[0] * 0.44 * hs, s.tr[1] * 0.44 * hs, s.tr[2] * 0.8 * hs],
        pos: [side * s.tr[0] * (0.62 + 0.04 * hs), s.tc[1] - s.tr[1] * 0.5, s.tc[2] - s.tr[2] * 0.12],
        rot: [0.25, side * 0.3, 0],
        jitter: 0.03,
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
  solid(k.head, k.rnd, { base: o.base ?? 'ico3', r: k.shape.hr, pos: k.shape.hc, jitter: o.jitter ?? 0.022, bend, color: o.color, paint: o.paint, tone: 0.05 });
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
  /** The nose on its own bone, so it can twitch and sniff. */
  twitch?: boolean;
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
    base: 'ico2',
    r: [w, h, len],
    pos: v3(c),
    rot: [droop, 0, 0],
    jitter: 0.025,
    bend: (v) => {
      const f = Math.max(0, v.z);
      v.x *= 1 - point * f;
      v.y *= 1 - point * 0.6 * f;
      if (v.y > 0.4) v.y = 0.4 + (v.y - 0.4) * 0.5;
    },
    color: o.color,
    paint: o.paint,
  });
  const tipZ = c.z + len * (1 - point * 0.15) * Math.cos(droop) * 0.95;
  const tipY = c.y + h * 0.4 - Math.sin(droop) * len * 0.9;
  const nw = o.noseW ?? Math.max(0.03, w * 0.48);
  nose(k, o.nose, [0, tipY, tipZ], nw, o.noseH, o.twitch);
}

/** A faceted triangular nose, wide on top and pointed underneath. */
export function nose(k: Kit, color: Color, p: Vec3, nw: number, nh = nw * 0.72, twitch = false) {
  let f = k.head;
  let at: Vec3 = p;
  if (twitch) {
    bone(k, 'nose', 'neck', p);
    f = part(k, 'nose', 'nose');
    at = [0, 0, 0];
  }
  solid(f, k.rnd, {
    base: SMOOTH_LOOK ? 'ico2' : 'ico1',
    r: [nw, nh, nw * 0.8],
    pos: at,
    rot: [0.3, 0, 0],
    jitter: 0.02,
    bend: (v) => {
      v.x *= 1 + v.y * 0.5;
      if (v.y > 0.3) v.y = 0.3 + (v.y - 0.3) * 0.5;
    },
    color,
    tone: 0.12,
  });
  k.nose = [p[0], p[1] - nh * 0.3, p[2] + nw * 0.6];
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
  /** No rosy cheeks (the smooth finish gives them by default). */
  blush?: boolean;
  ringSize?: number;
  out?: number;
}

/**
 * The eyes. In the smooth finish they're cute: rounder, bigger and more domed than the species' own shape (less
 * so inside a ring, which has to fit round them), glossy, with a big catchlight and a little one, and a soft
 * rosy blush on each cheek below. With ?look=paper, dark faceted almonds with a single highlight facet.
 */
export function eyes(k: Kit, o: EyeOpts = {}) {
  const cute = SMOOTH_LOOK;
  const ux = o.x ?? 0.42;
  const uy = o.y ?? 0.08;
  const size = (o.size ?? 1) * (cute ? (o.ring ? 1.08 : 1.22) : 1);
  const wide = cute ? 1 + ((o.wide ?? 1.15) - 1) * 0.3 : (o.wide ?? 1.15);
  const ew = 0.03 * size * Math.sqrt(wide);
  const eh = (0.03 * size) / Math.sqrt(wide);
  const ed = (cute ? 0.021 : 0.016) * size;
  // A ring stays the size the species asked for.
  const ring = (o.ringSize ?? 1.45) / (cute && o.ring ? 1.08 : 1);
  const base = cute ? 'ico2' : 'ico1';
  const jitter = cute ? 0 : 0.02;
  let p = new THREE.Vector3();
  for (const side of [-1, 1]) {
    p = onHead(k, side * ux, uy, (o.out ?? 0) + 0.004);
    const n = headNormal(k, side * ux, uy);
    const q = facing(n, side * (o.slant ?? 0.12) * (cute ? 0.4 : 1));
    const m = new THREE.Matrix4().compose(p, q, new THREE.Vector3(1, 1, 1));
    if (o.ring) solid(k.eyes, k.rnd, { base, r: [ew * ring, eh * ring, ed * 0.75], matrix: inside(m, [0, 0, -ed * 0.5]), jitter: jitter * 1.5, color: o.ring, tone: 0.05 });
    solid(k.eyes, k.rnd, {
      base,
      r: [ew, eh, ed],
      matrix: m,
      jitter,
      bend: (v) => {
        // Pointed at the corners, like an almond.
        if (!cute) v.y *= 1 - 0.35 * Math.abs(v.x);
      },
      color: o.color ?? INK,
      tone: 0.1,
    });
    if (cute) {
      solid(k.eyes, k.rnd, { base: 'ico1', r: [ew * 0.34, eh * 0.34, ed * 0.3], matrix: inside(m, [ew * 0.3, eh * 0.36, ed * 0.8]), color: '#fffdf8', tone: 0 });
      solid(k.eyes, k.rnd, { base: 'ico1', r: [ew * 0.14, eh * 0.14, ed * 0.15], matrix: inside(m, [-ew * 0.34, -eh * 0.34, ed * 0.86]), color: '#fffdf8', tone: 0 });
      if (o.blush !== false) {
        // Below the eye and a little out, on the cheek.
        const bx = side * Math.min(0.8, ux + 0.12);
        const by = Math.min(uy - 0.4, -0.14);
        const at = onHead(k, bx, by).add(new THREE.Vector3(...k.joints.neck));
        (k.blush ??= []).push({ at: v3(at), n: v3(headNormal(k, bx, by)), r: 0.03 * (o.size ?? 1) + 0.01 });
      }
    } else solid(k.eyes, k.rnd, { base: 'ico0', r: [ew * 0.3, eh * 0.3, ed * 0.3], matrix: inside(m, [ew * 0.3, eh * 0.38, ed * 0.8]), jitter: 0.02, color: '#fbf6ec', tone: 0 });
  }
  k.eyeY = p.y;
  k.eyeX = Math.abs(p.x);
  k.eyeR = Math.max(ew, eh) * (o.ring ? 1.4 : 1.1);
  k.eyeZ = p.z + ed;
}

export interface EarOpts {
  color: Color;
  inner?: Color;
  /** The rim round the front of a pointed ear (defaults to the coat). */
  rim?: Color;
  /** The back of a pointed ear (defaults to the coat; the fox's are dark). */
  back?: Color;
  /** Where the ear's base sits on the head (unit sphere), and its size. */
  x?: number;
  y?: number;
  w?: number;
  h?: number;
  d?: number;
  /** Leaning outward, and back. */
  splay?: number;
  rake?: number;
  /** 'pointy' cards, 'round' discs, or 'long' rabbit ears. */
  kind?: 'pointy' | 'round' | 'long';
  /** Flop a long ear sideways (a dog's). */
  flop?: number;
  /** Turn the ear to face more sideways. */
  turn?: number;
  /** How much of a pointed ear's front is the inner panel. */
  inset?: number;
}

/** Ears, each on its own bone at its base so it can swivel and twitch. */
export function ears(k: Kit, o: EarOpts) {
  const kind = o.kind ?? 'pointy';
  const w = o.w ?? 0.075;
  const h = o.h ?? 0.13;
  const d = o.d ?? 0.04;
  for (const side of [-1, 1]) {
    const name = side > 0 ? 'earL' : 'earR';
    const base = onHead(k, side * (o.x ?? 0.55), o.y ?? 0.72, -0.012);
    bone(k, name, 'neck', v3(base));
    const f = part(k, name, name);
    const m = frame([0, 0, 0], [-(o.rake ?? 0.1), side * (o.turn ?? 0), side * -(o.splay ?? 0.32)]);
    if (kind === 'round') {
      // A thick disc, with the inside painted on its front.
      solid(f, k.rnd, {
        base: 'ico2',
        r: [w, w * 0.92, d],
        matrix: inside(m, [0, w * 0.55, 0]),
        jitter: 0.025,
        color: o.color,
        paint: o.inner ? (u) => (u.z > 0.45 && Math.hypot(u.x, u.y + 0.08) < 0.62 ? o.inner : null) : undefined,
      });
      continue;
    }
    if (kind === 'long') {
      const lm = inside(m, [0, 0, 0], [0, 0, (o.flop ?? 0) * side]);
      solid(f, k.rnd, {
        base: 'ico2',
        r: [w, h, d],
        matrix: inside(lm, [0, h * 0.85, 0]),
        jitter: 0.02,
        bend: (v) => {
          // Narrow at the root, widest two thirds up, rounded to a blunt point.
          const t = (v.y + 1) / 2;
          v.x *= 0.55 + 0.6 * Math.sin(Math.min(1, t * 1.25) * Math.PI * 0.62);
          if (v.z < 0) v.z *= 0.7;
          // A shallow groove down the front.
          if (v.z > 0) v.z *= 1 - 0.35 * (1 - Math.abs(v.x));
        },
        color: o.color,
        paint: o.inner ? (u) => (u.z > 0.3 && Math.abs(u.x) < 0.62 && u.y > -0.78 && u.y < 0.86 ? o.inner : null) : undefined,
      });
      continue;
    }
    card(f, k.rnd, { w, h, d, matrix: m, back: o.back ?? o.color, rim: o.rim ?? o.color, inner: o.inner, inset: o.inset });
  }
}

/** A small curved mouth line on the face (a smile when `curve` is above 0). */
export function mouth(k: Kit, o: { w?: number; y?: number; curve?: number; color?: Color; r?: number; out?: number } = {}) {
  const w = o.w ?? 0.2;
  const y = o.y ?? -0.5;
  const pts: Vec3[] = [];
  for (let i = 0; i <= 6; i++) {
    const t = (i / 6) * 2 - 1;
    pts.push(v3(onHead(k, t * w, y + (o.curve ?? 0.1) * t * t, (o.out ?? 0) + 0.003)));
  }
  tube(k.head, k.rnd, { pts, radii: pts.map((_, i) => (o.r ?? 0.006) * (i === 0 || i === 6 ? 0.6 : 1)), sides: 4, jitter: 0.03, color: o.color ?? INK, up: [0, 0, 1] });
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
  /** Claws on the paw (sloths, bears). */
  claws?: Color;
  clawLen?: number;
  /** Build only the right arm (the snail's tendril). */
  rightOnly?: boolean;
}

/** Front legs as straight faceted pillars ending in paws: they're the arms. */
export function arms(k: Kit, o: ArmOpts) {
  const len = o.len ?? 0.27;
  const r = o.r ?? 0.055;
  const sockFrom = o.sockFrom ?? 0.45;
  const paw = o.paw ?? o.sock ?? o.color;
  for (const f of o.rightOnly ? [k.armR] : [k.armL, k.armR]) {
    pillar(f, k.rnd, [0, 0.03, 0], [0, -len, 0], r, r * 0.86, o.color, {
      depth: 0.92,
      paint: o.sock ? (u) => (u.y + 0.5 > sockFrom ? o.sock : null) : undefined,
    });
    solid(f, k.rnd, {
      base: 'ico1',
      r: [r * 1.12, r * 0.85, r * 1.25],
      pos: [0, -len - r * 0.25, r * 0.28],
      jitter: 0.03,
      bend: (v) => {
        if (v.y < -0.5) v.y = -0.5 + (v.y + 0.5) * 0.4;
      },
      color: paw,
    });
    if (o.claws) {
      for (const i of [-1, 0, 1]) {
        const from: Vec3 = [i * r * 0.55, -len - r * 0.5, r * 0.9];
        const to: Vec3 = [i * r * 0.65, -len - r * 0.5 - (o.clawLen ?? 0.05) * 0.6, r * 1.3 + (o.clawLen ?? 0.05) * 0.5];
        spike(f, k.rnd, from, to, r * 0.22, o.claws, r * 0.16);
      }
    }
  }
  k.joints.hand = [0, -len - r * 0.25, r * 0.28 + r * 1.05];
  k.joints.paw = [0, -len - r * 0.25, r * 0.28];
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
  /** Little dark hooves instead of paws. */
  hoof?: boolean;
}

/** Short sturdy hind legs with chunky feet resting on the ground. */
export function legs(k: Kit, o: LegOpts) {
  const hipY = k.joints.hip[1];
  const r = o.r ?? 0.058;
  const fh = o.footH ?? 0.045;
  const fl = o.footLen ?? r * 1.7;
  for (const f of [k.legL, k.legR]) {
    pillar(f, k.rnd, [0, 0.02, 0], [0, -hipY + fh, 0.0], r, r * 0.92, o.color, { depth: 1 });
    if (o.hoof) {
      solid(f, k.rnd, { base: 'limb', r: [r * 1.05, fh * 1.6, r * 1.05], pos: [0, -hipY + fh * 0.8, 0.01], jitter: 0.02, color: o.foot ?? CHARCOAL });
      continue;
    }
    solid(f, k.rnd, {
      base: 'ico1',
      r: [r * 1.15, fh, fl],
      pos: [0, -hipY + fh * 0.62, fl * 0.42],
      jitter: 0.03,
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
  /** Rings of a second colour (raccoon, red panda): this many tube segments to each band. */
  rings?: Color;
  ringEvery?: number;
  /** A tip of another colour, from this far along (0 to 1). */
  tip?: Color;
  tipFrom?: number;
  len?: number;
  /** Radius at its fattest. */
  r?: number;
  /** Which way it heads from the body and how it curls over its whole length (Euler angles). */
  dir?: Vec3;
  curl?: Vec3;
  steps?: number;
  /** Radii along the tail, as fractions of `r`. */
  profile?: number[];
  flat?: number;
  sides?: number;
  up?: Vec3;
}

const sample = (prof: number[], t: number) => {
  const x = t * (prof.length - 1);
  const i = Math.min(prof.length - 2, Math.floor(x));
  return prof[i] + (prof[i + 1] - prof[i]) * (x - i);
};

/** A big faceted tail along a gentle curve, skinned over three bones so it can swish and curl. */
export function tail(k: Kit, o: TailOpts) {
  const steps = o.steps ?? 12;
  const len = o.len ?? 0.4;
  const curl = o.curl ?? [1.5, 0, 0];
  const pts = curve([0, 0, 0.02], o.dir ?? [0, -0.3, -1], steps, len / steps, [curl[0] / steps, curl[1] / steps, curl[2] / steps]);
  const prof = o.profile ?? [0.45, 0.85, 1, 0.95, 0.75, 0.4];
  const r = o.r ?? 0.09;
  const radii = pts.map((_, i) => r * sample(prof, i / (pts.length - 1)));
  const every = o.ringEvery ?? 2;
  // Bones a third and two thirds of the way along.
  const p1 = pts[Math.round(steps / 3)];
  const p2 = pts[Math.round((steps * 2) / 3)];
  bone(k, 'tail1', 'tail', p1);
  bone(k, 'tail2', 'tail1', [p2[0] - p1[0], p2[1] - p1[1], p2[2] - p1[2]]);
  k.parts.get('tail')!.chain = ['tail', 'tail1', 'tail2'];
  tube(k.tail, k.rnd, {
    pts,
    radii,
    sides: o.sides ?? 7,
    flat: o.flat,
    up: o.up,
    jitter: 0.06,
    color: o.color,
    paint: (u) => {
      if (o.tip && u.y >= (o.tipFrom ?? 0.8)) return o.tip;
      if (o.rings && Math.floor(Math.min(steps - 1, Math.floor(u.y * steps)) / every) % 2 === 1) return o.rings;
      return null;
    },
  });
}

/** A round puff of a tail. */
export function puffTail(k: Kit, color: Color, r = 0.065) {
  solid(k.tail, k.rnd, { base: 'ico2', r: [r, r, r * 0.9], pos: [0, 0.01, -r * 0.4], jitter: 0.05, color });
}

// ---------------------------------------------------------------- birds, fish and the rest

/** A pyramid pointing from one point to another (spines, toes, claws, fins). */
export function spike(f: Fold, rnd: () => number, from: Vec3, to: Vec3, w: number, color: Color, d = w, base: BaseName = 'pyramid', jitter = 0.02) {
  const { matrix, len } = along(from, to);
  solid(f, rnd, { base, r: [w, len, d], matrix, jitter, color });
}

export interface BeakOpts {
  color: Color;
  lower?: Color;
  len?: number;
  w?: number;
  h?: number;
  dy?: number;
  /** Tips the point down (a hooked beak). */
  hook?: number;
  /** A flat rounded bill (ducks, the platypus) instead of a pointed beak. */
  bill?: boolean;
  paint?: Paint;
}

/** A beak or bill on the front of the face. */
export function beak(k: Kit, o: BeakOpts) {
  const len = o.len ?? 0.09;
  const w = o.w ?? 0.045;
  const h = o.h ?? 0.04;
  const root = onHead(k, 0, o.dy ?? -0.2, -0.015);
  const hook = o.hook ?? 0.1;
  if (o.bill) {
    solid(k.head, k.rnd, {
      base: 'ico2',
      r: [w, h, len],
      pos: [0, root.y, root.z + len * 0.6],
      rot: [hook, 0, 0],
      jitter: 0.02,
      bend: (v) => {
        v.x *= 1 + 0.25 * Math.max(0, v.z);
        if (v.y < 0) v.y *= 0.6;
      },
      color: o.color,
      paint: o.paint,
    });
    k.nose = [0, root.y + h * 0.4, root.z + len * 1.4];
    return;
  }
  solid(k.head, k.rnd, { base: 'pyramid', r: [w, len, h], pos: [0, root.y + h * 0.15, root.z + len * 0.45], rot: [Math.PI / 2 + hook, 0, 0], jitter: 0.015, color: o.color, paint: o.paint });
  solid(k.head, k.rnd, { base: 'pyramid', r: [w * 0.8, len * 0.7, h * 0.6], pos: [0, root.y - h * 0.45, root.z + len * 0.32], rot: [Math.PI / 2 - 0.05, 0, 0], jitter: 0.015, color: o.lower ?? o.color });
  k.nose = [0, root.y + h * 0.1 - Math.sin(hook) * len * 0.9, root.z + len * 0.95];
}

export interface WingOpts {
  color: Color;
  /** Darker flight feathers at the tip. */
  tip?: Color;
  /** Bands of another colour across the wing (an owl's barring). */
  bars?: Color;
  len?: number;
  w?: number;
  d?: number;
}

/** Folded wings for arms: broad at the shoulder, tapering to a feathered point. */
export function wings(k: Kit, o: WingOpts) {
  const len = o.len ?? 0.27;
  const w = o.w ?? 0.085;
  const d = o.d ?? 0.032;
  for (const [f, side] of [
    [k.armL, 1],
    [k.armR, -1],
  ] as const) {
    solid(f, k.rnd, {
      base: 'ico2',
      r: [d, len * 0.56, w],
      pos: [side * 0.012, -len * 0.45, -0.012],
      rot: [0.08, 0, side * 0.04],
      jitter: 0.02,
      bend: (v) => {
        const t = (1 - v.y) / 2;
        v.z *= 1 - 0.5 * t * t;
        v.x *= 1 - 0.45 * t;
        if (v.y < -0.4) v.z -= (v.y + 0.4) * 0.25;
      },
      color: o.color,
      paint: (u) => {
        if (o.tip && u.y < -0.42) return o.tip;
        if (o.bars && u.y < 0.3 && Math.floor((u.y + 1) * 5) % 2 === 1) return o.bars;
        return null;
      },
    });
  }
  k.joints.hand = [0, -len * 0.9, 0.04];
}

/** Flat paddles for arms (seals, penguins). */
export function flippers(k: Kit, o: { color: Color; under?: Color; len?: number; w?: number }) {
  const len = o.len ?? 0.24;
  const w = o.w ?? 0.06;
  for (const [f, side] of [
    [k.armL, 1],
    [k.armR, -1],
  ] as const) {
    solid(f, k.rnd, {
      base: 'ico2',
      r: [0.022, len * 0.55, w],
      pos: [side * 0.012, -len * 0.45, 0.01],
      rot: [0.1, 0, side * 0.08],
      jitter: 0.02,
      bend: (v) => {
        const t = (1 - v.y) / 2;
        v.z *= 0.75 + 0.4 * Math.sin(t * Math.PI * 0.85);
      },
      color: o.color,
      paint: o.under ? (u) => (u.x * side < -0.4 ? o.under : null) : undefined,
    });
  }
  k.joints.hand = [0, -len * 0.88, 0.05];
}

export interface BirdLegOpts {
  color: Color;
  webbed?: boolean;
  r?: number;
  /** Foot size. */
  foot?: number;
}

/** Thin legs with three toes, or a webbed foot. */
export function birdLegs(k: Kit, o: BirdLegOpts) {
  const hipY = k.joints.hip[1];
  const r = o.r ?? 0.022;
  const s = o.foot ?? 1;
  const y = -hipY + 0.012;
  for (const f of [k.legL, k.legR]) {
    pillar(f, k.rnd, [0, 0.02, 0], [0, y + 0.01, 0.01], r, r * 0.85, o.color, { base: 'limb5' });
    if (o.webbed) {
      solid(f, k.rnd, {
        base: 'ico1',
        r: [0.06 * s, 0.016, 0.085 * s],
        pos: [0, y, 0.045 * s],
        jitter: 0.02,
        bend: (v) => {
          v.x *= 0.45 + 0.55 * (v.z + 1) * 0.5;
          if (v.y < -0.3) v.y = -0.3;
        },
        color: o.color,
      });
    } else {
      for (const a of [-0.55, 0, 0.55]) spike(f, k.rnd, [Math.sin(a) * 0.01, y, 0.01], [Math.sin(a) * 0.07 * s, y, 0.01 + Math.cos(a) * 0.075 * s], 0.016 * s, o.color, 0.012 * s);
      spike(f, k.rnd, [0, y, 0.0], [0, y, -0.045 * s], 0.012 * s, o.color, 0.01 * s);
    }
  }
}

/** Spines over part of a solid: little pyramids standing out along its surface. */
export function spines(
  f: Fold,
  rnd: () => number,
  centre: Vec3,
  r: Vec3,
  n: number,
  len: number,
  color: Color | ((i: number) => Color),
  where: (d: THREE.Vector3) => boolean,
  opts: { w?: number; sweep?: Vec3; sink?: number } = {},
) {
  const w = opts.w ?? 0.28;
  const sweep = opts.sweep ?? [0, 0.25, -0.35];
  const sink = opts.sink ?? 0.92;
  const golden = Math.PI * (3 - Math.sqrt(5));
  let made = 0;
  for (let i = 0; i < n * 3 && made < n; i++) {
    const y = 1 - ((i + 0.5) / (n * 3)) * 2;
    const rad = Math.sqrt(1 - y * y);
    const d = new THREE.Vector3(Math.cos(i * golden) * rad, y, Math.sin(i * golden) * rad);
    if (!where(d)) continue;
    const from = new THREE.Vector3(centre[0] + d.x * r[0] * sink, centre[1] + d.y * r[1] * sink, centre[2] + d.z * r[2] * sink);
    const dir = new THREE.Vector3(d.x / r[0], d.y / r[1], d.z / r[2]).normalize().add(new THREE.Vector3(...sweep)).normalize();
    const l = len * (0.8 + rnd() * 0.4);
    spike(f, rnd, v3(from), v3(from.clone().addScaledVector(dir, l)), l * w, typeof color === 'function' ? color(made) : color, l * w, 'tri', 0.04);
    made++;
  }
}

/** A tapering horn, tentacle or stalk along a curve, from thick to a point. */
export function horn(f: Fold, rnd: () => number, start: Vec3, dir: Vec3, len: number, r: number, color: Color, opts: { curl?: Vec3; steps?: number; sides?: number; end?: number; paint?: Paint; flat?: number } = {}) {
  const steps = opts.steps ?? 5;
  const c = opts.curl ?? [0, 0, 0];
  const pts = curve(start, dir, steps, len / steps, [c[0] / steps, c[1] / steps, c[2] / steps]);
  const end = opts.end ?? 0.15;
  tube(f, rnd, { pts, radii: pts.map((_, i) => r * (1 - (1 - end) * (i / steps))), sides: opts.sides ?? 5, jitter: 0.05, round: false, color, paint: opts.paint, flat: opts.flat });
}
