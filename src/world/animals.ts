import * as THREE from 'three';
import { Builder, glow, soft, wet, type Vec3 } from './build';
import { buildItem, disposeObject } from './items';
import { animalInfo, type Anim, type AnimalId, type Item, type Look } from './types';

/**
 * Chibi low-poly animals, built from simple shapes in code. Each moving part (torso, head, eyes, each
 * arm and leg, the tail) is a single vertex-coloured mesh hung on a pivot, and everything moves
 * procedurally, so there are no model files or animation clips to load.
 */

export interface RigState {
  anim: Anim;
  /** Ground speed in metres a second. */
  speed: number;
  dt: number;
  /** Seconds since the start, shared by everyone so idle motion doesn't line up. */
  t: number;
  speaking?: boolean;
}

export interface Rig {
  /** Origin at the feet; the model faces +z when root.rotation.y is 0. */
  root: THREE.Group;
  /** Height of the top of the head (ears included), for name labels. */
  headHeight: number;
  update(s: RigState): void;
  setItem(item: Item | null): void;
  setGhost(on: boolean): void;
  dispose(): void;
}

// ---------------------------------------------------------------- shapes

const G = {
  sph: new THREE.SphereGeometry(1, 10, 8),
  head: new THREE.SphereGeometry(1, 14, 10),
  ico: new THREE.IcosahedronGeometry(1, 0),
  ico1: new THREE.IcosahedronGeometry(1, 1),
  cone4: new THREE.ConeGeometry(1, 1, 4),
  cone6: new THREE.ConeGeometry(1, 1, 6),
  cone8: new THREE.ConeGeometry(1, 1, 8),
  cyl: new THREE.CylinderGeometry(1, 1, 1, 8),
  cyl6: new THREE.CylinderGeometry(1, 1, 1, 6),
  taper: new THREE.CylinderGeometry(0.55, 1, 1, 8),
  box: new THREE.BoxGeometry(1, 1, 1),
  smile: new THREE.TorusGeometry(1, 0.11, 4, 10, Math.PI),
  halfDisc: new THREE.SphereGeometry(1, 12, 4, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2),
  torus: new THREE.TorusGeometry(1, 0.32, 5, 12),
  ring: new THREE.TorusGeometry(1, 0.2, 4, 12),
};

const col = (c: THREE.ColorRepresentation) => new THREE.Color(c);
const mix = (a: THREE.ColorRepresentation, b: THREE.ColorRepresentation, t: number) => col(a).lerp(col(b), t);
const luminance = (c: THREE.ColorRepresentation) => {
  const x = col(c);
  return 0.2126 * x.r + 0.7152 * x.g + 0.0722 * x.b;
};

const INK = '#231c1f';
const WHITE = '#fbf8f2';
const BLUSH = '#f79aa8';
const ORANGE = '#f39a3a';
const PINK = '#f4a6b4';

// Joint positions in body space.
const NECK: Vec3 = [0, 0.55, 0];
const SHOULDER_X = 0.17;
const SHOULDER_Y = 0.49;
const HIP_X = 0.095;
const HIP_Y = 0.22;
const TAIL: Vec3 = [0, 0.32, -0.15];

interface Shape {
  /** Head radii and centre, in neck space. */
  hr: Vec3;
  hc: Vec3;
  /** Torso radii and centre, in body space. */
  tr: Vec3;
  tc: Vec3;
}

const defaultShape = (): Shape => ({ hr: [0.28, 0.25, 0.26], hc: [0, 0.25, 0.02], tr: [0.2, 0.22, 0.18], tc: [0, 0.38, 0] });

/** The z of a point on the front of the head, `x` across and `dy` up from its centre. */
function headZ(s: Shape, x: number, dy: number, inset = 0): number {
  const [rx, ry, rz] = s.hr;
  const k = 1 - (x / rx) ** 2 - (dy / ry) ** 2;
  return s.hc[2] + rz * Math.sqrt(Math.max(0, k)) - inset;
}

interface Kit {
  torso: Builder;
  head: Builder;
  eyes: Builder;
  armL: Builder;
  armR: Builder;
  legL: Builder;
  legR: Builder;
  tail: Builder;
  shape: Shape;
  /** Where the eyes sit (neck space), so blinking squashes around them. */
  eyeY: number;
}

interface Colors {
  coat: THREE.Color;
  light: THREE.Color;
  dark: THREE.Color;
  inner: THREE.Color;
}

function colorsFor(coat: string): Colors {
  return {
    coat: col(coat),
    light: mix(coat, '#fff8ee', 0.6),
    dark: mix(coat, '#2a2020', 0.35),
    inner: mix(coat, PINK, 0.6),
  };
}

// ---------------------------------------------------------------- building blocks

function ell(b: Builder, color: THREE.ColorRepresentation, pos: Vec3, r: Vec3 | number, rot?: Vec3, geo: THREE.BufferGeometry = G.sph) {
  b.add(geo, color, { pos, scale: r, rot });
}

function torso(k: Kit, coat: THREE.ColorRepresentation, belly?: THREE.ColorRepresentation) {
  const s = k.shape;
  ell(k.torso, coat, s.tc, s.tr);
  if (belly) ell(k.torso, belly, [s.tc[0], s.tc[1] - 0.01, s.tc[2] + s.tr[2] * 0.3], [s.tr[0] * 0.75, s.tr[1] * 0.78, s.tr[2] * 0.78]);
}

function head(k: Kit, coat: THREE.ColorRepresentation) {
  k.head.add(G.head, coat, { pos: k.shape.hc, scale: k.shape.hr });
}

type EyeStyle = 'dot' | 'big' | 'small' | 'top' | 'side';

function eyes(k: Kit, opts: { style?: EyeStyle; x?: number; dy?: number; ring?: THREE.ColorRepresentation; iris?: THREE.ColorRepresentation; size?: number; out?: number } = {}) {
  const s = k.shape;
  const style = opts.style ?? 'dot';
  const x = opts.x ?? 0.1;
  const dy = opts.dy ?? 0.03;
  const size = opts.size ?? 1;
  const ey = style === 'top' ? s.hc[1] + 0.18 : s.hc[1] + dy;
  k.eyeY = ey;
  for (const side of [-1, 1]) {
    const ex = side * x;
    if (style === 'top') {
      // Frog-style: the eyes sit on bulges on top of the head.
      const z = s.hc[2] + 0.06 + 0.06;
      ell(k.eyes, WHITE, [ex, ey, z], [0.055 * size, 0.06 * size, 0.035]);
      ell(k.eyes, INK, [ex, ey + 0.004, z + 0.022], [0.034 * size, 0.042 * size, 0.02]);
      ell(k.eyes, '#fff', [ex + 0.012, ey + 0.02, z + 0.038], 0.01);
      continue;
    }
    if (style === 'side') {
      const z = headZ(s, x, dy, 0.03);
      ell(k.eyes, INK, [ex, ey, z], [0.028 * size, 0.034 * size, 0.022], [0, side * 0.5, 0]);
      ell(k.eyes, '#fff', [ex - side * 0.006, ey + 0.012, z + 0.016], 0.008);
      continue;
    }
    const z = headZ(s, x, dy, style === 'big' ? 0.02 : 0.012) + (opts.out ?? 0);
    if (style === 'big') {
      ell(k.eyes, opts.ring ?? '#f6e7b8', [ex, ey, z - 0.008], [0.075 * size, 0.075 * size, 0.03], [0, side * 0.25, 0]);
      ell(k.eyes, opts.iris ?? '#e8a23a', [ex, ey, z + 0.006], [0.05 * size, 0.05 * size, 0.022], [0, side * 0.25, 0]);
      ell(k.eyes, INK, [ex, ey, z + 0.016], [0.032 * size, 0.034 * size, 0.018], [0, side * 0.25, 0]);
      ell(k.eyes, '#fff', [ex + 0.014, ey + 0.016, z + 0.03], 0.011);
      continue;
    }
    const sc = style === 'small' ? 0.75 : 1;
    if (opts.ring) ell(k.eyes, opts.ring, [ex, ey, z - 0.012], [0.05 * sc * size, 0.058 * sc * size, 0.022], [0, side * 0.3, 0]);
    ell(k.eyes, INK, [ex, ey, z], [0.036 * sc * size, 0.046 * sc * size, 0.024], [0, side * 0.3, 0]);
    ell(k.eyes, '#fff', [ex + 0.012, ey + 0.016, z + 0.02], 0.011 * sc);
  }
}

function blush(k: Kit, color: THREE.ColorRepresentation = BLUSH, x = 0.165, dy = -0.06) {
  const s = k.shape;
  for (const side of [-1, 1]) {
    ell(k.head, color, [side * x, s.hc[1] + dy, headZ(s, x, dy, 0.012)], [0.045, 0.024, 0.02], [0, side * 0.6, 0]);
  }
}

function smile(k: Kit, color: THREE.ColorRepresentation = INK, dy = -0.075, w = 0.035, z?: number) {
  const s = k.shape;
  k.head.add(G.smile, color, { pos: [0, s.hc[1] + dy, z ?? headZ(s, 0, dy, 0.004)], rot: [0, 0, Math.PI], scale: [w, w * 0.8, w] });
}

function nose(k: Kit, color: THREE.ColorRepresentation, pos: Vec3, r: Vec3 | number = [0.035, 0.026, 0.026]) {
  ell(k.head, color, pos, r);
}

/** A rounded muzzle on the lower front of the face, with the nose on top. */
function muzzle(k: Kit, color: THREE.ColorRepresentation, noseColor: THREE.ColorRepresentation, opts: { w?: number; h?: number; d?: number; dy?: number; noseR?: Vec3 } = {}) {
  const s = k.shape;
  const dy = opts.dy ?? -0.07;
  const z = headZ(s, 0, dy, 0.05);
  const w = opts.w ?? 0.11;
  const h = opts.h ?? 0.08;
  const d = opts.d ?? 0.08;
  ell(k.head, color, [0, s.hc[1] + dy, z], [w, h, d]);
  nose(k, noseColor, [0, s.hc[1] + dy + h * 0.55, z + d * 0.85], opts.noseR ?? [0.035, 0.025, 0.025]);
  // A little mouth under the nose.
  k.head.add(G.smile, INK, { pos: [0, s.hc[1] + dy - h * 0.2, z + d * 0.92], rot: [0, 0, Math.PI], scale: [0.022, 0.018, 0.02] });
}

/** A pointed muzzle, for foxes and wolves. */
function snout(k: Kit, color: THREE.ColorRepresentation, noseColor: THREE.ColorRepresentation, len = 0.2, r = 0.1, dy = -0.07) {
  const s = k.shape;
  const z = headZ(s, 0, dy, 0.07);
  k.head.add(G.cone8, color, { pos: [0, s.hc[1] + dy, z + len / 2], rot: [Math.PI / 2, 0, 0], scale: [r, len, r * 0.85] });
  nose(k, noseColor, [0, s.hc[1] + dy + 0.01, z + len - 0.005], [0.035, 0.028, 0.03]);
}

function pointyEars(k: Kit, outer: THREE.ColorRepresentation, inner: THREE.ColorRepresentation, opts: { x?: number; h?: number; r?: number; tilt?: number; y?: number; tip?: THREE.ColorRepresentation } = {}) {
  const s = k.shape;
  const x = opts.x ?? 0.15;
  const h = opts.h ?? 0.2;
  const r = opts.r ?? 0.1;
  const tilt = opts.tilt ?? 0.32;
  const y = s.hc[1] + (opts.y ?? s.hr[1] * 0.78);
  for (const side of [-1, 1]) {
    const pos: Vec3 = [side * x, y + h * 0.35, s.hc[2] - 0.01];
    k.head.add(G.cone4, outer, { pos, rot: [0, Math.PI / 4, -side * tilt], scale: [r, h, r * 0.6] });
    const ip: Vec3 = [pos[0] - side * 0.004, pos[1] - h * 0.06, pos[2] + r * 0.32];
    k.head.add(G.cone4, inner, { pos: ip, rot: [0, Math.PI / 4, -side * tilt], scale: [r * 0.6, h * 0.75, r * 0.3] });
    if (opts.tip) {
      const tip: Vec3 = [pos[0] + side * Math.sin(tilt) * h * 0.38, pos[1] + Math.cos(tilt) * h * 0.38, pos[2]];
      k.head.add(G.cone4, opts.tip, { pos: tip, rot: [0, Math.PI / 4, -side * tilt], scale: [r * 0.32, h * 0.26, r * 0.22] });
    }
  }
}

function roundEars(k: Kit, outer: THREE.ColorRepresentation, inner: THREE.ColorRepresentation, opts: { x?: number; y?: number; r?: number; depth?: number } = {}) {
  const s = k.shape;
  const x = opts.x ?? 0.18;
  const r = opts.r ?? 0.085;
  const y = s.hc[1] + (opts.y ?? s.hr[1] * 0.78);
  for (const side of [-1, 1]) {
    ell(k.head, outer, [side * x, y, s.hc[2] - 0.02], [r, r, (opts.depth ?? 0.5) * r]);
    ell(k.head, inner, [side * x, y - r * 0.05, s.hc[2] - 0.02 + (opts.depth ?? 0.5) * r * 0.55], [r * 0.6, r * 0.6, r * 0.2]);
  }
}

function arms(k: Kit, c: THREE.ColorRepresentation, paw: THREE.ColorRepresentation, style: 'paw' | 'wing' | 'flipper' | 'tentacle' = 'paw') {
  for (const [b, side] of [
    [k.armL, 1],
    [k.armR, -1],
  ] as const) {
    if (style === 'wing') {
      ell(b, c, [side * 0.02, -0.1, -0.01], [0.04, 0.15, 0.1], [0.1, 0, side * 0.1]);
      ell(b, paw, [side * 0.03, -0.2, -0.03], [0.035, 0.07, 0.07], [0.2, 0, side * 0.1]);
    } else if (style === 'flipper') {
      ell(b, c, [side * 0.02, -0.12, 0], [0.035, 0.16, 0.075], [0, 0, side * 0.15]);
    } else if (style === 'tentacle') {
      for (let i = 0; i < 4; i++) {
        const t = i / 3;
        ell(b, i === 3 ? paw : c, [side * (0.01 + t * 0.03), -0.04 - t * 0.17, Math.sin(t * 2.5) * 0.04], 0.06 - t * 0.022);
      }
    } else {
      ell(b, c, [side * 0.015, -0.09, 0], [0.06, 0.11, 0.06]);
      ell(b, paw, [side * 0.025, -0.19, 0.01], 0.064);
    }
  }
}

function legs(k: Kit, c: THREE.ColorRepresentation, foot: THREE.ColorRepresentation, style: 'stub' | 'webbed' = 'stub') {
  for (const b of [k.legL, k.legR]) {
    b.add(G.cyl, c, { pos: [0, -0.08, 0], scale: [0.064, 0.15, 0.064] });
    if (style === 'webbed') {
      b.add(G.cone4, foot, { pos: [0, -0.2, 0.06], rot: [Math.PI / 2, Math.PI / 4, 0], scale: [0.1, 0.16, 0.035] });
      ell(b, foot, [0, -0.18, 0.0], [0.06, 0.04, 0.07]);
    } else {
      ell(b, foot, [0, -0.175, 0.03], [0.075, 0.05, 0.095]);
    }
  }
}

function bushyTail(k: Kit, c: THREE.ColorRepresentation, tip?: THREE.ColorRepresentation, size = 1) {
  ell(k.tail, c, [0, 0.1 * size, -0.16 * size], [0.1 * size, 0.1 * size, 0.2 * size], [-0.75, 0, 0], G.ico1);
  if (tip) ell(k.tail, tip, [0, 0.22 * size, -0.3 * size], [0.07 * size, 0.07 * size, 0.08 * size], [-0.75, 0, 0], G.ico1);
}

function thinTail(k: Kit, c: THREE.ColorRepresentation, len = 0.32, r = 0.025, curl = 1) {
  const n = 5;
  let y = 0;
  let z = 0;
  let a = 0.4;
  for (let i = 0; i < n; i++) {
    const seg = len / n;
    const ny = y + Math.sin(a) * seg;
    const nz = z - Math.cos(a) * seg;
    k.tail.add(G.cyl6, c, { pos: [0, (y + ny) / 2, (z + nz) / 2], rot: [Math.PI / 2 + a, 0, 0], scale: [r, seg * 1.15, r] });
    y = ny;
    z = nz;
    a += 0.28 * curl;
  }
  ell(k.tail, c, [0, y, z], r * 1.15);
}

// ---------------------------------------------------------------- species

type Recipe = (k: Kit, c: Colors, coat: string) => { aquatic?: boolean; legs?: 'none' | 'tentacles' };

const RECIPES: Record<AnimalId, Recipe> = {
  wolf(k, c) {
    const s = k.shape;
    s.hr = [0.28, 0.25, 0.25];
    torso(k, c.coat, c.light);
    head(k, c.coat);
    ell(k.head, c.light, [0, s.hc[1] - 0.08, headZ(s, 0, -0.08, 0.08)], [0.18, 0.1, 0.08]);
    snout(k, c.light, INK, 0.21, 0.1);
    eyes(k, { dy: 0.04, ring: luminance(c.coat) < 0.12 ? WHITE : undefined });
    pointyEars(k, c.coat, c.dark, { h: 0.22, r: 0.1, tilt: 0.25 });
    // A shaggy ruff around the neck.
    for (let i = 0; i < 7; i++) {
      const a = (i / 6 - 0.5) * 2.4;
      ell(k.torso, c.light, [Math.sin(a) * 0.17, 0.56, Math.cos(a) * 0.13], [0.07, 0.06, 0.05], [0, a, 0], G.ico);
    }
    arms(k, c.coat, c.light);
    legs(k, c.coat, c.dark);
    bushyTail(k, c.coat, c.light, 1.1);
    return {};
  },
  fox(k, c) {
    const s = k.shape;
    torso(k, c.coat);
    ell(k.torso, WHITE, [0, 0.42, 0.09], [0.13, 0.15, 0.11]);
    head(k, c.coat);
    ell(k.head, WHITE, [0, s.hc[1] - 0.09, headZ(s, 0, -0.09, 0.09)], [0.2, 0.1, 0.08]);
    snout(k, WHITE, INK, 0.19, 0.095);
    eyes(k, { dy: 0.04 });
    pointyEars(k, c.coat, WHITE, { h: 0.25, r: 0.12, tilt: 0.3, tip: '#3a2a24' });
    blush(k);
    arms(k, c.coat, '#3a2a24');
    legs(k, '#3a2a24', '#3a2a24');
    bushyTail(k, c.coat, WHITE, 1.25);
    return {};
  },
  bear(k, c) {
    const s = k.shape;
    s.tr = [0.22, 0.23, 0.2];
    s.hr = [0.29, 0.26, 0.26];
    torso(k, c.coat, c.light);
    head(k, c.coat);
    muzzle(k, c.light, INK, { w: 0.12, h: 0.085, d: 0.085, noseR: [0.045, 0.03, 0.03] });
    eyes(k, { dy: 0.05, ring: luminance(c.coat) < 0.12 ? WHITE : undefined });
    roundEars(k, c.coat, c.dark, { x: 0.19, r: 0.085 });
    blush(k);
    arms(k, c.coat, c.coat);
    legs(k, c.coat, c.dark);
    ell(k.tail, c.coat, [0, 0, -0.03], 0.06, undefined, G.ico1);
    return {};
  },
  cat(k, c) {
    const s = k.shape;
    torso(k, c.coat, c.light);
    head(k, c.coat);
    const z = headZ(s, 0, -0.06, 0.02);
    for (const side of [-1, 1]) ell(k.head, c.light, [side * 0.035, s.hc[1] - 0.075, z], [0.045, 0.035, 0.03]);
    k.head.add(G.cone4, PINK, { pos: [0, s.hc[1] - 0.045, z + 0.02], rot: [Math.PI, Math.PI / 4, 0], scale: [0.025, 0.025, 0.02] });
    for (const side of [-1, 1]) {
      for (const tilt of [-0.15, 0.12]) {
        k.head.add(G.box, luminance(c.coat) < 0.12 ? WHITE : INK, { pos: [side * 0.13, s.hc[1] - 0.07 + tilt * 0.12, z - 0.02], rot: [0, side * 0.35, tilt * side], scale: [0.11, 0.006, 0.006] });
      }
    }
    eyes(k, { dy: 0.04, ring: luminance(c.coat) < 0.12 ? '#d7e66a' : undefined });
    pointyEars(k, c.coat, PINK, { h: 0.19, r: 0.11, tilt: 0.28, x: 0.16 });
    blush(k);
    arms(k, c.coat, c.light);
    legs(k, c.coat, c.light);
    thinTail(k, c.coat, 0.4, 0.03, 1.2);
    return {};
  },
  dog(k, c) {
    const s = k.shape;
    torso(k, c.coat, c.light);
    head(k, c.coat);
    muzzle(k, c.light, INK, { w: 0.12, h: 0.085, d: 0.1, noseR: [0.045, 0.032, 0.032] });
    eyes(k, { dy: 0.05 });
    for (const side of [-1, 1]) {
      ell(k.head, c.dark, [side * 0.28, s.hc[1] - 0.02, s.hc[2] - 0.01], [0.055, 0.15, 0.1], [0, 0, side * 0.28]);
    }
    k.head.add(G.cone8, PINK, { pos: [0.02, s.hc[1] - 0.15, headZ(s, 0, -0.1, -0.06)], rot: [Math.PI / 2 + 0.4, 0, 0], scale: [0.035, 0.05, 0.015] });
    blush(k);
    arms(k, c.coat, c.light);
    legs(k, c.coat, c.light);
    ell(k.tail, c.coat, [0, 0.1, -0.08], [0.05, 0.05, 0.14], [-1.0, 0, 0]);
    return {};
  },
  pig(k, c) {
    const s = k.shape;
    s.tr = [0.22, 0.22, 0.2];
    torso(k, c.coat, mix(c.coat, '#fff', 0.25));
    head(k, c.coat);
    const z = headZ(s, 0, -0.05, 0.02);
    k.head.add(G.cyl, mix(c.coat, '#d06a80', 0.35), { pos: [0, s.hc[1] - 0.05, z + 0.03], rot: [Math.PI / 2, 0, 0], scale: [0.085, 0.07, 0.07] });
    for (const side of [-1, 1]) ell(k.head, '#7a3a48', [side * 0.03, s.hc[1] - 0.05, z + 0.067], [0.016, 0.026, 0.01]);
    eyes(k, { dy: 0.06, x: 0.12, style: 'small' });
    for (const side of [-1, 1]) {
      k.head.add(G.cone4, c.coat, { pos: [side * 0.17, s.hc[1] + 0.2, s.hc[2] + 0.04], rot: [0.7, Math.PI / 4, -side * 0.5], scale: [0.08, 0.13, 0.05] });
    }
    blush(k, '#f07a90');
    arms(k, c.coat, mix(c.coat, '#5a3a3a', 0.4));
    legs(k, c.coat, mix(c.coat, '#5a3a3a', 0.4));
    k.tail.add(G.ring, c.coat, { pos: [0, 0.03, -0.06], rot: [0, Math.PI / 2, 0], scale: 0.045 });
    return {};
  },
  mouse(k, c) {
    const s = k.shape;
    s.hr = [0.26, 0.24, 0.25];
    torso(k, c.coat, c.light);
    head(k, c.coat);
    snout(k, c.light, '#e47a90', 0.12, 0.09, -0.06);
    for (const side of [-1, 1]) {
      k.head.add(G.box, INK, { pos: [side * 0.12, s.hc[1] - 0.06, headZ(s, 0.08, -0.06, 0.0)], rot: [0, side * 0.3, side * 0.1], scale: [0.12, 0.005, 0.005] });
    }
    eyes(k, { dy: 0.04, x: 0.095 });
    roundEars(k, c.coat, PINK, { x: 0.2, r: 0.13, y: 0.22, depth: 0.35 });
    blush(k);
    arms(k, c.coat, PINK);
    legs(k, c.coat, PINK);
    thinTail(k, PINK, 0.42, 0.016, 1.4);
    return {};
  },
  raccoon(k, c) {
    const s = k.shape;
    const mask = '#2e2a2c';
    torso(k, c.coat, c.light);
    head(k, c.coat);
    // The bandit mask, then a white brow above it.
    ell(k.head, WHITE, [0, s.hc[1] + 0.085, headZ(s, 0, 0.085, 0.1)], [0.2, 0.06, 0.1]);
    ell(k.head, mask, [0, s.hc[1] + 0.03, headZ(s, 0, 0.03, 0.1)], [0.27, 0.07, 0.115]);
    snout(k, WHITE, INK, 0.13, 0.085, -0.075);
    eyes(k, { dy: 0.03, ring: WHITE, out: 0.03 });
    pointyEars(k, c.coat, WHITE, { h: 0.15, r: 0.1, tilt: 0.35, x: 0.17 });
    arms(k, c.coat, mask);
    legs(k, c.coat, mask);
    for (let i = 0; i < 5; i++) {
      const t = i / 4;
      ell(k.tail, i % 2 ? mask : c.coat, [0, 0.03 + t * 0.2, -0.06 - t * 0.2], [0.085 - t * 0.012, 0.085 - t * 0.012, 0.06], [-0.8, 0, 0]);
    }
    return {};
  },
  deer(k, c) {
    const s = k.shape;
    s.hr = [0.26, 0.25, 0.26];
    torso(k, c.coat, c.light);
    for (const [x, y, z] of [
      [-0.1, 0.5, -0.12],
      [0.08, 0.45, -0.15],
      [-0.02, 0.38, -0.17],
      [0.12, 0.33, -0.12],
      [-0.13, 0.3, -0.11],
    ] as Vec3[]) {
      ell(k.torso, WHITE, [x, y, z], 0.025);
    }
    head(k, c.coat);
    muzzle(k, c.light, INK, { w: 0.1, h: 0.075, d: 0.08 });
    eyes(k, { dy: 0.04 });
    for (const side of [-1, 1]) {
      ell(k.head, c.coat, [side * 0.28, s.hc[1] + 0.12, s.hc[2] - 0.02], [0.13, 0.05, 0.06], [0, 0, side * 0.45]);
      ell(k.head, c.light, [side * 0.29, s.hc[1] + 0.12, s.hc[2] + 0.0], [0.09, 0.03, 0.03], [0, 0, side * 0.45]);
      // Antlers: a stem with two tines.
      const ax = side * 0.1;
      const ay = s.hc[1] + 0.22;
      const antler = '#e8d8b8';
      k.head.add(G.cyl6, antler, { pos: [ax + side * 0.03, ay + 0.1, s.hc[2] - 0.02], rot: [0, 0, -side * 0.3], scale: [0.02, 0.2, 0.02] });
      k.head.add(G.cyl6, antler, { pos: [ax + side * 0.1, ay + 0.17, s.hc[2] - 0.02], rot: [0, 0, -side * 1.1], scale: [0.016, 0.12, 0.016] });
      k.head.add(G.cyl6, antler, { pos: [ax + side * 0.04, ay + 0.24, s.hc[2] + 0.02], rot: [0.5, 0, -side * 0.1], scale: [0.015, 0.1, 0.015] });
      ell(k.head, antler, [ax + side * 0.06, ay + 0.2, s.hc[2] - 0.02], 0.022);
    }
    blush(k);
    arms(k, c.coat, c.dark);
    legs(k, c.coat, '#3a2a24');
    ell(k.tail, WHITE, [0, 0.05, -0.04], [0.045, 0.06, 0.04], [-0.5, 0, 0]);
    return {};
  },
  owl(k, c) {
    const s = k.shape;
    s.tr = [0.23, 0.25, 0.21];
    s.tc = [0, 0.4, 0];
    s.hr = [0.29, 0.25, 0.25];
    torso(k, c.coat, c.light);
    for (let i = 0; i < 3; i++) {
      for (const side of [-1, 1]) {
        k.torso.add(G.cone4, c.dark, { pos: [side * 0.05, 0.42 - i * 0.07, 0.19 - i * 0.005], rot: [Math.PI, Math.PI / 4, 0], scale: [0.025, 0.025, 0.01] });
      }
    }
    head(k, c.coat);
    // The heart-shaped face disc.
    for (const side of [-1, 1]) ell(k.head, c.light, [side * 0.1, s.hc[1] + 0.01, headZ(s, 0.1, 0.01, 0.07)], [0.12, 0.13, 0.07]);
    k.head.add(G.cone4, '#e8a23a', { pos: [0, s.hc[1] - 0.06, headZ(s, 0, -0.06, -0.025)], rot: [Math.PI + 0.3, Math.PI / 4, 0], scale: [0.04, 0.08, 0.035] });
    eyes(k, { style: 'big', x: 0.105, dy: 0.02, ring: '#fbf3dc', iris: '#f2b33a' });
    for (const side of [-1, 1]) {
      k.head.add(G.cone4, c.dark, { pos: [side * 0.19, s.hc[1] + 0.25, s.hc[2]], rot: [0, Math.PI / 4, -side * 0.45], scale: [0.06, 0.15, 0.04] });
    }
    arms(k, c.dark, c.dark, 'wing');
    legs(k, '#e8a23a', '#e8a23a');
    for (const a of [-0.35, 0, 0.35]) k.tail.add(G.cone4, c.dark, { pos: [a * 0.12, -0.04, -0.08], rot: [-2.2, 0, a], scale: [0.05, 0.13, 0.02] });
    return {};
  },
  koala(k, c) {
    const s = k.shape;
    s.hr = [0.3, 0.25, 0.25];
    torso(k, c.coat, c.light);
    head(k, c.coat);
    // The big nose is the whole point of a koala.
    ell(k.head, '#2f2a30', [0, s.hc[1] - 0.03, headZ(s, 0, -0.03, 0.03)], [0.065, 0.1, 0.06]);
    eyes(k, { dy: 0.04, x: 0.13, style: 'small' });
    for (const side of [-1, 1]) {
      const p: Vec3 = [side * 0.28, s.hc[1] + 0.17, s.hc[2] - 0.03];
      ell(k.head, c.coat, p, [0.15, 0.14, 0.07], undefined, G.ico1);
      ell(k.head, WHITE, [p[0] - side * 0.01, p[1] - 0.01, p[2] + 0.04], [0.1, 0.1, 0.04], undefined, G.ico1);
    }
    blush(k);
    arms(k, c.coat, c.dark);
    legs(k, c.coat, c.dark);
    return {};
  },
  hedgehog(k, c) {
    const s = k.shape;
    const face = mix('#f0dcc0', c.coat, 0.15);
    torso(k, face);
    head(k, face);
    snout(k, face, INK, 0.13, 0.09, -0.06);
    eyes(k, { dy: 0.04 });
    roundEars(k, face, PINK, { x: 0.19, r: 0.06, y: 0.17 });
    blush(k);
    // Spikes over the back of the head and body.
    const spikes = (b: Builder, centre: Vec3, r: Vec3, rows: number, color: THREE.Color, minZ: number) => {
      for (let i = 0; i < rows; i++) {
        const theta = 0.25 + (i / rows) * 2.4;
        const ring = Math.round(7 + Math.sin(theta) * 9);
        for (let j = 0; j < ring; j++) {
          const phi = (j / ring) * Math.PI * 2 + i * 0.4;
          const dir = new THREE.Vector3(Math.sin(theta) * Math.cos(phi), Math.cos(theta), Math.sin(theta) * Math.sin(phi));
          if (dir.z > minZ) continue;
          const p = new THREE.Vector3(centre[0] + dir.x * r[0], centre[1] + dir.y * r[1], centre[2] + dir.z * r[2]);
          const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().add(new THREE.Vector3(0, 0, -0.5)).normalize());
          const m = new THREE.Matrix4().compose(p, q, new THREE.Vector3(0.06, 0.2, 0.06));
          b.add(G.cone4, (i + j) % 3 ? color : mix(color, '#fff', 0.25), m);
        }
      }
    };
    spikes(k.head, s.hc, s.hr, 6, c.coat, 0.05);
    spikes(k.torso, s.tc, s.tr, 7, c.coat, 0.0);
    arms(k, face, face);
    legs(k, face, c.dark);
    return {};
  },
  sheep(k, c, coat) {
    const s = k.shape;
    const face = luminance(coat) > 0.35 ? '#3d3436' : '#f0e6d8';
    torso(k, c.coat);
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2;
      const y = 0.3 + (i % 3) * 0.1;
      ell(k.torso, c.coat, [Math.cos(a) * 0.19, y, Math.sin(a) * 0.16], 0.075, [i, i * 2, 0], G.ico);
    }
    k.head.add(G.head, face, { pos: [0, s.hc[1] - 0.02, s.hc[2] + 0.02], scale: [0.22, 0.22, 0.22] });
    // The woolly cap on top.
    for (let i = 0; i < 9; i++) {
      const a = (i / 9) * Math.PI * 2;
      ell(k.head, c.coat, [Math.cos(a) * 0.15, s.hc[1] + 0.17 + (i % 2) * 0.03, s.hc[2] - 0.02 + Math.sin(a) * 0.13], 0.09, [i, i, 0], G.ico);
    }
    ell(k.head, c.coat, [0, s.hc[1] + 0.22, s.hc[2] - 0.02], 0.12, undefined, G.ico);
    for (const side of [-1, 1]) {
      ell(k.head, face, [side * 0.25, s.hc[1] + 0.06, s.hc[2] - 0.02], [0.11, 0.04, 0.06], [0, 0, side * 0.5]);
      ell(k.head, PINK, [side * 0.26, s.hc[1] + 0.06, s.hc[2] + 0.01], [0.07, 0.022, 0.03], [0, 0, side * 0.5]);
    }
    const sh = { ...s, hr: [0.22, 0.22, 0.22] as Vec3, hc: [0, s.hc[1] - 0.02, s.hc[2] + 0.02] as Vec3 };
    const z = headZ(sh, 0, -0.08, 0.01);
    ell(k.head, mix(face, '#fff', 0.15), [0, s.hc[1] - 0.1, z], [0.06, 0.045, 0.03]);
    const kk = { ...k, shape: sh };
    eyes(kk, { dy: 0.03, x: 0.08, ring: luminance(face) < 0.3 ? WHITE : undefined });
    k.eyeY = kk.eyeY;
    blush(kk, BLUSH, 0.13, -0.05);
    arms(k, c.coat, face);
    legs(k, face, face);
    ell(k.tail, c.coat, [0, 0.03, -0.04], 0.07, undefined, G.ico);
    return {};
  },
  panda(k, c) {
    const s = k.shape;
    const black = '#262428';
    s.tr = [0.22, 0.23, 0.2];
    torso(k, c.coat);
    ell(k.torso, black, [0, 0.5, 0], [0.215, 0.075, 0.19]);
    head(k, c.coat);
    for (const side of [-1, 1]) ell(k.head, black, [side * 0.1, s.hc[1] + 0.02, headZ(s, 0.1, 0.02, 0.03)], [0.07, 0.085, 0.04], [0, side * 0.35, -side * 0.5]);
    muzzle(k, c.coat, INK, { w: 0.1, h: 0.07, d: 0.07, noseR: [0.04, 0.026, 0.026] });
    eyes(k, { dy: 0.02, ring: '#ffffff' });
    roundEars(k, black, black, { x: 0.2, r: 0.085 });
    blush(k);
    arms(k, black, black);
    legs(k, black, black);
    ell(k.tail, c.coat, [0, 0, -0.03], 0.05);
    return {};
  },
  penguin(k, c) {
    const s = k.shape;
    s.tr = [0.23, 0.29, 0.21];
    s.tc = [0, 0.42, 0];
    s.hr = [0.27, 0.25, 0.25];
    torso(k, c.coat);
    ell(k.torso, WHITE, [0, 0.4, 0.08], [0.17, 0.25, 0.15]);
    head(k, c.coat);
    for (const side of [-1, 1]) ell(k.head, WHITE, [side * 0.085, s.hc[1] + 0.0, headZ(s, 0.085, 0, 0.1)], [0.13, 0.15, 0.115]);
    k.head.add(G.cone4, ORANGE, { pos: [0, s.hc[1] - 0.05, headZ(s, 0, -0.05, -0.05)], rot: [Math.PI / 2, Math.PI / 4, 0], scale: [0.055, 0.11, 0.04] });
    eyes(k, { dy: 0.03, x: 0.095, out: 0.022 });
    blush(k);
    arms(k, c.coat, c.coat, 'flipper');
    legs(k, ORANGE, ORANGE, 'webbed');
    k.tail.add(G.cone4, c.coat, { pos: [0, -0.05, -0.08], rot: [-2.0, Math.PI / 4, 0], scale: [0.07, 0.1, 0.03] });
    return { aquatic: true };
  },
  otter(k, c) {
    const s = k.shape;
    s.hr = [0.27, 0.24, 0.25];
    torso(k, c.coat, c.light);
    head(k, c.coat);
    ell(k.head, c.light, [0, s.hc[1] - 0.05, headZ(s, 0, -0.05, 0.08)], [0.19, 0.12, 0.1]);
    muzzle(k, c.light, INK, { w: 0.11, h: 0.07, d: 0.08, noseR: [0.045, 0.03, 0.03] });
    for (const side of [-1, 1]) {
      for (const tilt of [-0.12, 0.1]) {
        k.head.add(G.box, mix(c.coat, '#fff', 0.7), { pos: [side * 0.15, s.hc[1] - 0.06 + tilt * 0.1, headZ(s, 0.1, -0.06, 0.03)], rot: [0, side * 0.3, side * tilt], scale: [0.12, 0.006, 0.006] });
      }
    }
    eyes(k, { dy: 0.04 });
    roundEars(k, c.coat, c.dark, { x: 0.22, r: 0.05, y: 0.15 });
    blush(k);
    arms(k, c.coat, c.dark);
    legs(k, c.coat, c.dark, 'webbed');
    ell(k.tail, c.coat, [0, -0.02, -0.18], [0.075, 0.06, 0.22], [0.35, 0, 0]);
    return { aquatic: true };
  },
  frog(k, c) {
    const s = k.shape;
    s.hr = [0.3, 0.22, 0.26];
    s.tr = [0.21, 0.21, 0.18];
    const belly = mix(c.coat, '#fff6c8', 0.6);
    torso(k, c.coat, belly);
    head(k, c.coat);
    for (const side of [-1, 1]) ell(k.head, c.coat, [side * 0.13, s.hc[1] + 0.17, s.hc[2] + 0.06], [0.085, 0.085, 0.08]);
    eyes(k, { style: 'top', x: 0.13 });
    k.head.add(G.smile, '#3a2a2a', { pos: [0, s.hc[1] - 0.04, headZ(s, 0, -0.04, 0.03)], rot: [0.2, 0, Math.PI], scale: [0.17, 0.1, 0.12] });
    blush(k, BLUSH, 0.19, -0.02);
    arms(k, c.coat, belly);
    legs(k, c.coat, c.coat, 'webbed');
    return { aquatic: true };
  },
  axolotl(k, c) {
    const s = k.shape;
    s.hr = [0.3, 0.23, 0.26];
    const gill = mix(c.coat, '#c0406a', 0.45);
    torso(k, c.coat, mix(c.coat, '#fff', 0.35));
    head(k, c.coat);
    for (const side of [-1, 1]) {
      for (let i = 0; i < 3; i++) {
        const a = -0.55 + i * 0.55;
        const base: Vec3 = [side * 0.26, s.hc[1] + 0.02 + i * 0.07, s.hc[2] - 0.06];
        const len = 0.17;
        const dir: Vec3 = [side * Math.cos(a), Math.sin(a) + 0.3, -0.25];
        const m = new THREE.Matrix4().compose(
          new THREE.Vector3(base[0] + dir[0] * len * 0.5, base[1] + dir[1] * len * 0.5, base[2] + dir[2] * len * 0.5),
          new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(...dir).normalize()),
          new THREE.Vector3(0.025, len, 0.025),
        );
        k.head.add(G.cyl6, gill, m);
        for (let f = 0; f < 3; f++) {
          const t = 0.35 + f * 0.25;
          ell(k.head, gill, [base[0] + dir[0] * len * t, base[1] + dir[1] * len * t, base[2] + dir[2] * len * t], [0.035, 0.022, 0.035]);
        }
      }
    }
    eyes(k, { dy: 0.03, x: 0.13, style: 'small' });
    smile(k, '#7a3a50', -0.07, 0.07);
    blush(k, '#f07a98', 0.19, -0.05);
    arms(k, c.coat, c.coat);
    legs(k, c.coat, c.coat);
    ell(k.tail, c.coat, [0, 0.0, -0.2], [0.07, 0.08, 0.22], [0.25, 0, 0]);
    ell(k.tail, mix(c.coat, '#fff', 0.45), [0, 0.06, -0.26], [0.015, 0.13, 0.2], [0.25, 0, 0]);
    return { aquatic: true };
  },
  shark(k, c) {
    const s = k.shape;
    s.hr = [0.28, 0.25, 0.29];
    const belly = WHITE;
    torso(k, c.coat, belly);
    head(k, c.coat);
    ell(k.head, belly, [0, s.hc[1] - 0.1, headZ(s, 0, -0.1, 0.11)], [0.2, 0.1, 0.13]);
    // The fin on top is what makes it a shark from above.
    k.head.add(G.cone4, c.coat, { pos: [0, s.hc[1] + 0.31, s.hc[2] - 0.08], rot: [-0.45, 0, 0], scale: [0.035, 0.24, 0.17] });
    eyes(k, { dy: 0.05, x: 0.13, out: 0.005 });
    // A wide toothy grin: a dark half-moon with a row of little teeth along the top.
    const gy = s.hc[1] - 0.045;
    const gz = headZ(s, 0, -0.045, 0.03);
    k.head.add(G.halfDisc, '#5a2a34', { pos: [0, gy, gz], rot: [0.15, 0, 0], scale: [0.13, 0.075, 0.04] });
    for (let i = -3; i <= 3; i++) {
      const x = i * 0.034;
      const y = gy - 0.004 - (Math.abs(i) === 3 ? 0.01 : 0);
      k.head.add(G.cone4, WHITE, { pos: [x, y - 0.012, headZ(s, x, y - 0.012 - s.hc[1], 0.002)], rot: [Math.PI, 0, 0], scale: [0.016, 0.03, 0.012] });
    }
    for (const side of [-1, 1]) {
      for (let i = 0; i < 3; i++) k.head.add(G.box, c.dark, { pos: [side * 0.25, s.hc[1] - 0.03, s.hc[2] - 0.01 - i * 0.045], rot: [0, side * 0.45, 0], scale: [0.008, 0.08, 0.01] });
    }
    blush(k, BLUSH, 0.19, 0.0);
    arms(k, c.coat, c.coat, 'flipper');
    legs(k, c.coat, belly);
    k.tail.add(G.cone4, c.coat, { pos: [0, 0.02, -0.12], rot: [-Math.PI / 2, 0, 0], scale: [0.07, 0.24, 0.07] });
    k.tail.add(G.cone4, c.coat, { pos: [0, 0.11, -0.25], rot: [-0.5, 0, 0], scale: [0.02, 0.2, 0.09] });
    k.tail.add(G.cone4, c.coat, { pos: [0, -0.04, -0.24], rot: [-2.4, 0, 0], scale: [0.02, 0.14, 0.07] });
    return { aquatic: true };
  },
  octopus(k, c) {
    const s = k.shape;
    // A big round mantle sitting on a skirt of tentacles.
    s.hr = [0.33, 0.32, 0.31];
    s.hc = [0, 0.12, 0.0];
    s.tr = [0.24, 0.12, 0.22];
    s.tc = [0, 0.3, 0];
    const light = mix(c.coat, '#fff', 0.4);
    torso(k, c.coat);
    head(k, c.coat);
    for (const [x, y] of [
      [0.16, 0.18],
      [-0.2, 0.12],
      [0.04, 0.27],
      [-0.1, 0.3],
      [0.22, 0.04],
    ]) {
      const p = new THREE.Vector3(x, y, 0);
      const z = headZ(s, x, y, 0.012);
      ell(k.head, light, [p.x, s.hc[1] + p.y, z], [0.035, 0.035, 0.012], [-y * 2, x * 2, 0]);
    }
    eyes(k, { dy: -0.04, x: 0.12, out: 0.004 });
    smile(k, '#5a2a3a', -0.13, 0.04);
    blush(k, BLUSH, 0.2, -0.11);
    arms(k, c.coat, light, 'tentacle');
    // Three tentacles per side instead of legs, spreading out and curling up at the tips.
    for (const [b, side] of [
      [k.legL, 1],
      [k.legR, -1],
    ] as const) {
      for (let j = 0; j < 3; j++) {
        const ang = (j - 1) * 0.85;
        const dx = side * Math.cos(ang);
        const dz = Math.sin(ang) * 1.1;
        const n = 6;
        for (let i = 0; i < n; i++) {
          const t = i / (n - 1);
          const out = t * 0.2;
          const y = -0.06 - t * 0.14 + t * t * 0.06;
          ell(b, i === n - 1 ? light : c.coat, [dx * out - side * 0.03, y, dz * out], [0.07 - t * 0.035, 0.05 - t * 0.02, 0.07 - t * 0.035]);
          if (i > 0 && i < n - 1) ell(b, light, [dx * out - side * 0.03, y - 0.03 + t * 0.01, dz * out], [0.03 - t * 0.012, 0.02, 0.03 - t * 0.012]);
        }
      }
    }
    return { aquatic: true, legs: 'tentacles' };
  },
  duck(k, c) {
    const s = k.shape;
    s.tr = [0.22, 0.24, 0.2];
    s.hr = [0.26, 0.25, 0.25];
    torso(k, c.coat, mix(c.coat, '#fff', 0.35));
    head(k, c.coat);
    const z = headZ(s, 0, -0.06, 0.05);
    ell(k.head, ORANGE, [0, s.hc[1] - 0.06, z + 0.07], [0.12, 0.035, 0.11]);
    ell(k.head, mix(ORANGE, '#a04a10', 0.3), [0, s.hc[1] - 0.085, z + 0.06], [0.1, 0.022, 0.09]);
    eyes(k, { dy: 0.05, x: 0.1 });
    blush(k);
    ell(k.head, c.coat, [0, s.hc[1] + 0.25, s.hc[2]], [0.03, 0.06, 0.03], [0.4, 0, 0]);
    arms(k, c.coat, c.coat, 'wing');
    legs(k, ORANGE, ORANGE, 'webbed');
    k.tail.add(G.cone4, c.coat, { pos: [0, 0.06, -0.06], rot: [-0.8, Math.PI / 4, 0], scale: [0.08, 0.14, 0.04] });
    return { aquatic: true };
  },
  platypus(k, c) {
    const s = k.shape;
    s.hr = [0.27, 0.24, 0.25];
    const bill = '#4a4246';
    torso(k, c.coat, c.light);
    head(k, c.coat);
    const z = headZ(s, 0, -0.05, 0.05);
    ell(k.head, bill, [0, s.hc[1] - 0.05, z + 0.1], [0.14, 0.04, 0.15]);
    for (const side of [-1, 1]) ell(k.head, '#2a2428', [side * 0.03, s.hc[1] - 0.015, z + 0.2], [0.012, 0.006, 0.01]);
    eyes(k, { dy: 0.06, x: 0.11, style: 'small' });
    blush(k, BLUSH, 0.17, -0.0);
    arms(k, c.coat, bill);
    legs(k, c.coat, bill, 'webbed');
    // The flat beaver tail.
    ell(k.tail, c.dark, [0, -0.05, -0.18], [0.13, 0.03, 0.2], [0.3, 0, 0]);
    for (const zz of [-0.1, -0.18, -0.26]) k.tail.add(G.box, mix(c.dark, '#000', 0.25), { pos: [0, -0.025 - (zz + 0.1) * -0.3 + 0.0, -0.16 + (zz + 0.1)], rot: [0.3, 0, 0], scale: [0.18, 0.005, 0.01] });
    return { aquatic: true };
  },
  bunny(k, c) {
    const s = k.shape;
    torso(k, c.coat, mix(c.coat, '#fff', 0.5));
    head(k, c.coat);
    for (const side of [-1, 1]) ell(k.head, mix(c.coat, '#fff', 0.5), [side * 0.04, s.hc[1] - 0.07, headZ(s, 0.04, -0.07, 0.02)], [0.05, 0.04, 0.035]);
    ell(k.head, '#e47a90', [0, s.hc[1] - 0.035, headZ(s, 0, -0.035, -0.012)], [0.03, 0.022, 0.02]);
    for (const side of [-1, 1]) k.head.add(G.box, WHITE, { pos: [side * 0.012, s.hc[1] - 0.12, headZ(s, 0, -0.12, 0.0)], scale: [0.02, 0.035, 0.012] });
    eyes(k, { dy: 0.04, ring: luminance(c.coat) < 0.12 ? WHITE : undefined });
    for (const side of [-1, 1]) {
      const p: Vec3 = [side * 0.09, s.hc[1] + 0.4, s.hc[2] - 0.04];
      ell(k.head, c.coat, p, [0.065, 0.23, 0.045], [-0.15, 0, -side * 0.12]);
      ell(k.head, PINK, [p[0] - side * 0.004, p[1] - 0.01, p[2] + 0.032], [0.035, 0.17, 0.02], [-0.15, 0, -side * 0.12]);
    }
    blush(k);
    arms(k, c.coat, c.coat);
    legs(k, c.coat, mix(c.coat, '#fff', 0.5));
    ell(k.tail, WHITE, [0, 0.0, -0.04], 0.075, undefined, G.ico1);
    return {};
  },
};

// ---------------------------------------------------------------- the rig

interface Pose {
  by: number;
  bz: number;
  brx: number;
  bry: number;
  brz: number;
  hrx: number;
  hry: number;
  hrz: number;
  alx: number;
  alz: number;
  arx: number;
  arz: number;
  llx: number;
  llz: number;
  lrx: number;
  lrz: number;
  trx: number;
  try: number;
  /** Extra forward tilt of whatever is in the right paw (pouring, sipping). */
  tilt: number;
  /** Arm stretch, so a raised paw clears the big head. */
  sl: number;
  sr: number;
}

const POSE_KEYS = ['by', 'bz', 'brx', 'bry', 'brz', 'hrx', 'hry', 'hrz', 'alx', 'alz', 'arx', 'arz', 'llx', 'llz', 'lrx', 'lrz', 'trx', 'try', 'tilt', 'sl', 'sr'] as const;

const restPose = (): Pose => ({
  by: 0,
  bz: 0,
  brx: 0,
  bry: 0,
  brz: 0,
  hrx: 0,
  hry: 0,
  hrz: 0,
  alx: 0,
  alz: 0.18,
  arx: 0,
  arz: -0.18,
  llx: 0,
  llz: 0,
  lrx: 0,
  lrz: 0,
  trx: 0,
  try: 0,
  tilt: 0,
  sl: 1,
  sr: 1,
});

const GHOST_EYES = new THREE.MeshBasicMaterial({ color: '#3a4a7a', transparent: true, opacity: 0.85 });

interface RigParts {
  parts: Kit;
  material: THREE.Material;
  ghostColor: THREE.Color;
  floats: boolean;
  tentacles: boolean;
  aquatic: boolean;
  noLegs?: boolean;
  /** Extra things that hang off the body group (the Storyteller's lantern). */
  extras?: (body: THREE.Group, hand: THREE.Group) => void;
  eyeMaterial?: THREE.Material;
}

class AnimalRig implements Rig {
  root = new THREE.Group();
  headHeight = 1.1;
  private float = new THREE.Group();
  private body = new THREE.Group();
  private neck = new THREE.Group();
  private eyes = new THREE.Group();
  private armL = new THREE.Group();
  private armR = new THREE.Group();
  private legL = new THREE.Group();
  private legR = new THREE.Group();
  private tail = new THREE.Group();
  private hand = new THREE.Group();
  private handTilt = new THREE.Group();
  private meshes: THREE.Mesh[] = [];
  private eyeMesh: THREE.Mesh;
  private material: THREE.Material;
  private eyeMaterial: THREE.Material;
  private ghostMaterial: THREE.MeshStandardMaterial;
  private wisp: THREE.Mesh;
  private drips: THREE.InstancedMesh | null = null;
  private dripState: { x: number; y: number; z: number; v: number; wait: number }[] = [];
  private item: THREE.Object3D | null = null;
  private itemKey = '';
  private ghost = false;
  private pose = restPose();
  private phase = 0;
  private blinkAt = 2 + Math.random() * 3;
  private blinkT = -1;
  private seed = Math.random() * 100;
  private floats: boolean;
  private tentacles: boolean;
  private noLegs: boolean;
  private owned: THREE.Material[] = [];

  constructor(p: RigParts) {
    const k = p.parts;
    this.floats = p.floats;
    this.tentacles = p.tentacles;
    this.noLegs = Boolean(p.noLegs);
    this.material = p.material;
    this.eyeMaterial = p.eyeMaterial ?? p.material;
    this.owned.push(p.material);
    if (p.eyeMaterial) this.owned.push(p.eyeMaterial);

    this.root.add(this.float);
    this.float.add(this.body);
    this.body.add(this.neck, this.armL, this.armR, this.legL, this.legR, this.tail);
    this.neck.position.set(...NECK);
    this.armL.position.set(SHOULDER_X, SHOULDER_Y, 0);
    this.armR.position.set(-SHOULDER_X, SHOULDER_Y, 0);
    this.legL.position.set(HIP_X, HIP_Y, 0);
    this.legR.position.set(-HIP_X, HIP_Y, 0);
    this.tail.position.set(...TAIL);
    this.hand.position.set(-0.025, -0.21, 0.035);
    this.armR.add(this.hand);
    this.hand.add(this.handTilt);

    const mk = (b: Builder, parent: THREE.Object3D, mat = this.material) => {
      if (b.empty) return null;
      const m = b.mesh(mat, { cast: true, receive: false });
      parent.add(m);
      this.meshes.push(m);
      return m;
    };
    mk(k.torso, this.body);
    mk(k.head, this.neck);
    this.eyes.position.set(0, k.eyeY, 0);
    this.neck.add(this.eyes);
    // Eye geometry is built around the neck; shift it so blinking squashes around the eyes.
    const eg = k.eyes.geometry();
    eg.translate(0, -k.eyeY, 0);
    this.eyeMesh = new THREE.Mesh(eg, this.eyeMaterial);
    this.eyeMesh.castShadow = false;
    this.eyes.add(this.eyeMesh);
    mk(k.armL, this.armL);
    mk(k.armR, this.armR);
    mk(k.legL, this.legL);
    mk(k.legR, this.legR);
    mk(k.tail, this.tail);

    this.ghostMaterial = new THREE.MeshStandardMaterial({
      color: p.ghostColor,
      emissive: '#9fc4ff',
      emissiveIntensity: 0.55,
      transparent: true,
      opacity: 0.6,
      depthWrite: true,
      flatShading: true,
      roughness: 1,
    });
    this.owned.push(this.ghostMaterial);

    // A wispy tail-off that replaces the legs of ghosts (and the Storyteller).
    const wb = new Builder();
    wb.add(G.cone8, '#ffffff', { pos: [0, 0.12, -0.02], rot: [Math.PI + 0.25, 0, 0], scale: [0.17, 0.32, 0.15] });
    wb.add(G.cone8, '#ffffff', { pos: [0.03, 0.0, -0.1], rot: [Math.PI + 0.9, 0.4, 0], scale: [0.05, 0.14, 0.045] });
    this.wisp = new THREE.Mesh(wb.geometry(), this.ghostMaterial);
    this.wisp.visible = false;
    this.body.add(this.wisp);

    if (p.aquatic) {
      const dripMat = new THREE.MeshStandardMaterial({ color: '#a8d8ff', transparent: true, opacity: 0.75, roughness: 0.1, flatShading: true });
      this.owned.push(dripMat);
      const dg = new THREE.SphereGeometry(1, 5, 4);
      dg.scale(0.018, 0.028, 0.018);
      this.drips = new THREE.InstancedMesh(dg, dripMat, 4);
      this.drips.frustumCulled = false;
      for (let i = 0; i < 4; i++) this.dripState.push({ x: 0, y: -1, z: 0, v: 0, wait: Math.random() * 2.5 });
      this.root.add(this.drips);
    }
    p.extras?.(this.body, this.handTilt);

    if (this.noLegs) {
      this.legL.visible = false;
      this.legR.visible = false;
      this.wisp.visible = true;
      this.wisp.material = this.material;
    }

    // Measure the head with the rig at rest.
    this.applyPose(1);
    this.root.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(this.neck);
    this.headHeight = box.max.y + (this.floats ? 0.35 : 0);
  }

  setItem(item: Item | null) {
    const key = item ? `${item.k}:${item.c ?? ''}` : '';
    if (key === this.itemKey) return;
    this.itemKey = key;
    if (this.item) {
      this.handTilt.remove(this.item);
      disposeObject(this.item);
      this.item = null;
    }
    if (item) {
      this.item = buildItem(item);
      this.item.traverse((o) => (o.castShadow = !this.ghost));
      this.handTilt.add(this.item);
    }
  }

  setGhost(on: boolean) {
    if (on === this.ghost) return;
    this.ghost = on;
    for (const m of this.meshes) {
      m.material = on ? this.ghostMaterial : this.material;
      m.castShadow = !on;
    }
    this.eyeMesh.material = on ? GHOST_EYES : this.eyeMaterial;
    if (!this.noLegs) {
      this.legL.visible = !on;
      this.legR.visible = !on;
      this.wisp.visible = on;
    }
    this.wisp.material = on || !this.noLegs ? this.ghostMaterial : this.material;
    if (this.drips) this.drips.visible = !on;
    this.item?.traverse((o) => (o.castShadow = !on));
  }

  private target(s: RigState): Pose {
    const P = restPose();
    const t = s.t + this.seed;
    const sin = Math.sin;
    switch (s.anim) {
      case 'walk':
      case 'run': {
        const run = s.anim === 'run';
        const w = this.phase;
        const A = THREE.MathUtils.clamp(Math.max(s.speed, run ? 3 : 1.5) / 3.6, 0.35, 0.95);
        P.llx = sin(w) * A;
        P.lrx = -sin(w) * A;
        P.alx = -sin(w) * A * 0.9;
        P.arx = sin(w) * A * 0.9;
        P.by = Math.abs(sin(w)) * (run ? 0.06 : 0.035);
        P.brz = sin(w) * 0.05;
        P.brx = run ? 0.14 : 0.05;
        P.hrx = -P.brx * 0.5;
        P.try = sin(w) * 0.35;
        P.trx = run ? 0.3 : 0.1;
        break;
      }
      case 'sit':
        P.by = -HIP_Y + 0.02;
        P.llx = P.lrx = -1.45;
        P.llz = 0.1;
        P.lrz = -0.1;
        P.alx = P.arx = -0.45;
        P.alz = 0.3;
        P.arz = -0.3;
        P.trx = 0.9;
        P.hry = sin(t * 0.35) * 0.2;
        break;
      case 'sleep':
        // On its back, head towards the back of the root, centred on the origin.
        P.brx = -Math.PI / 2;
        P.by = 0.2;
        P.bz = 0.5;
        P.alz = 0.6;
        P.arz = -0.6;
        P.llz = 0.15;
        P.lrz = -0.15;
        P.hry = 0.25;
        P.trx = 0.8;
        break;
      case 'wave':
        P.arz = -2.25 + sin(t * 9) * 0.4;
        P.arx = -0.15;
        P.sr = 1.3;
        P.hrz = 0.12;
        P.brz = 0.04;
        P.try = sin(t * 6) * 0.4;
        break;
      case 'hand':
        P.arz = -2.5;
        P.arx = -0.1;
        P.sr = 1.45;
        P.by = Math.abs(sin(t * 2.5)) * 0.012;
        P.hrz = 0.06;
        break;
      case 'cheer': {
        const k = sin(t * 10) * 0.25;
        P.alz = 2.3 + k;
        P.arz = -(2.3 + k);
        P.sl = P.sr = 1.3;
        P.by = Math.abs(sin(t * 5)) * 0.1;
        P.hrx = -0.18;
        P.try = sin(t * 10) * 0.5;
        break;
      }
      case 'dance': {
        const b = sin(t * 5.5);
        P.by = Math.abs(b) * 0.1;
        P.bry = sin(t * 2.75) * 0.75;
        P.brz = b * 0.12;
        P.alz = 1.3 + b * 0.6;
        P.arz = -(1.3 - b * 0.6);
        P.llx = Math.max(0, b) * -0.6;
        P.lrx = Math.max(0, -b) * -0.6;
        P.hrz = b * 0.16;
        P.try = b * 0.6;
        break;
      }
      case 'laugh':
        P.hrx = -0.35 + sin(t * 16) * 0.06;
        P.brz = sin(t * 18) * 0.035;
        P.by = Math.abs(sin(t * 9)) * 0.025;
        P.alx = P.arx = -0.75;
        P.alz = -0.25;
        P.arz = 0.25;
        P.try = sin(t * 9) * 0.3;
        break;
      case 'cry':
        P.hrx = 0.38 + sin(t * 12) * 0.03;
        P.alx = P.arx = -2.4;
        P.alz = -0.5;
        P.arz = 0.5;
        P.brz = sin(t * 14) * 0.025;
        P.by = -0.01;
        break;
      case 'work':
        P.alx = -1.15 + sin(t * 7) * 0.28;
        P.arx = -1.15 - sin(t * 7) * 0.28;
        P.alz = -0.2;
        P.arz = 0.2;
        P.hrx = 0.25;
        P.brx = 0.08;
        P.by = Math.abs(sin(t * 7)) * 0.012;
        break;
      case 'fish': {
        const twitch = sin(t * 0.9) > 0.9 ? sin(t * 40) * 0.08 : 0;
        P.alx = -0.85 + twitch;
        P.arx = -0.85 + twitch;
        P.alz = -0.35;
        P.arz = 0.3;
        P.hrx = 0.12;
        P.hry = sin(t * 0.3) * 0.1;
        break;
      }
      case 'water':
        P.arx = -1.0;
        P.arz = 0.05;
        P.alz = 0.3;
        P.hrx = 0.28;
        P.tilt = 0.75 + sin(t * 3) * 0.1;
        break;
      case 'drink': {
        const cyc = t % 3.2;
        const sip = cyc < 1.4 ? sin((cyc / 1.4) * Math.PI) : 0;
        P.arx = -0.45 - sip * 1.85;
        P.arz = -0.15 + sip * 0.6;
        P.hrx = -sip * 0.25;
        P.tilt = -sip * 0.9;
        P.try = sin(t * 2) * 0.2;
        break;
      }
      default: {
        // Idle: a little breathing, glancing about and a lazy tail.
        P.hry = sin(t * 0.37) * 0.22 * (sin(t * 0.13) > 0 ? 1 : 0.3);
        P.hrz = sin(t * 0.29) * 0.05;
        P.try = sin(t * 1.6) * 0.25;
        P.by = sin(t * 2.2) * 0.006;
        P.alz = 0.18 + sin(t * 2.2) * 0.03;
        P.arz = -0.18 - sin(t * 2.2) * 0.03;
      }
    }
    if (s.speaking) {
      P.hrx += sin(t * 13) * 0.04;
      P.hrz += sin(t * 7) * 0.025;
    }
    if (this.tentacles) {
      P.llz += sin(t * 3) * 0.14;
      P.lrz -= sin(t * 3 + 1) * 0.14;
      P.llx *= 0.4;
      P.lrx *= 0.4;
    }
    return P;
  }

  private applyPose(k: number, target?: Pose) {
    const P = this.pose;
    if (target) for (const key of POSE_KEYS) P[key] += (target[key] - P[key]) * k;
    this.body.position.set(0, P.by, P.bz);
    this.body.rotation.set(P.brx, P.bry, P.brz);
    this.neck.rotation.set(P.hrx, P.hry, P.hrz);
    this.armL.rotation.set(P.alx, 0, P.alz);
    this.armR.rotation.set(P.arx, 0, P.arz);
    this.armL.scale.set(1, P.sl, 1);
    this.armR.scale.set(1, P.sr, 1);
    this.legL.rotation.set(P.llx, 0, P.llz);
    this.legR.rotation.set(P.lrx, 0, P.lrz);
    this.tail.rotation.set(P.trx, P.try, 0);
    // Keep the held item level whatever the arm is doing, then tip it on purpose.
    this.hand.quaternion.copy(this.armR.quaternion).invert();
    this.hand.scale.set(1, 1 / P.sr, 1);
    this.handTilt.rotation.set(P.tilt, 0, 0);
  }

  update(s: RigState) {
    const dt = Math.min(Math.max(s.dt, 0), 0.1);
    if (s.anim === 'walk' || s.anim === 'run') {
      const sp = THREE.MathUtils.clamp(s.speed || (s.anim === 'run' ? 4 : 2), 0.8, 7);
      this.phase += dt * (5 + sp * 1.6);
    }
    const target = this.target(s);
    this.applyPose(1 - Math.exp(-dt * 14), target);

    // Floating: ghosts and the Storyteller hover with a gentle bob.
    const floating = this.floats || this.ghost;
    const fy = floating ? 0.35 + Math.sin(s.t * 2 + this.seed) * 0.06 : 0;
    this.float.position.y += (fy - this.float.position.y) * (1 - Math.exp(-dt * 6));
    if (floating) this.wisp.rotation.z = Math.sin(s.t * 3 + this.seed) * 0.15;

    // Blinking.
    this.blinkAt -= dt;
    if (this.blinkAt <= 0 && this.blinkT < 0) this.blinkT = 0;
    if (this.blinkT >= 0) {
      this.blinkT += dt;
      const b = this.blinkT / 0.14;
      this.eyes.scale.y = b < 1 ? Math.max(0.12, Math.abs(1 - b * 2)) : 1;
      if (b >= 1) {
        this.blinkT = -1;
        this.blinkAt = 2 + Math.random() * 4;
      }
    }
    if (s.anim === 'sleep') this.eyes.scale.y = 0.12;
    else if (s.anim === 'laugh') this.eyes.scale.y = 0.35;

    if (this.drips && !this.ghost) this.updateDrips(dt);
  }

  private updateDrips(dt: number) {
    const m = new THREE.Matrix4();
    this.dripState.forEach((d, i) => {
      if (d.wait > 0) {
        d.wait -= dt;
        if (d.wait <= 0) {
          // Start a new drip somewhere on the body.
          const a = Math.random() * Math.PI * 2;
          d.x = Math.cos(a) * 0.19;
          d.z = Math.sin(a) * 0.16;
          d.y = 0.3 + Math.random() * 0.45 + this.body.position.y;
          d.v = 0;
        }
        m.makeScale(0, 0, 0);
      } else {
        d.v += 9.8 * dt;
        d.y -= d.v * dt;
        if (d.y <= 0.01) {
          d.wait = 0.6 + Math.random() * 2.4;
          m.makeScale(0, 0, 0);
        } else m.makeTranslation(d.x, d.y, d.z);
      }
      this.drips!.setMatrixAt(i, m);
    });
    this.drips!.instanceMatrix.needsUpdate = true;
  }

  dispose() {
    this.setItem(null);
    for (const m of this.meshes) m.geometry.dispose();
    this.eyeMesh.geometry.dispose();
    this.wisp.geometry.dispose();
    this.drips?.geometry.dispose();
    this.root.traverse((o) => {
      if (o !== this.root && (o as THREE.Mesh).isMesh && !this.meshes.includes(o as THREE.Mesh) && o !== this.eyeMesh && o !== this.wisp && o !== this.drips) {
        (o as THREE.Mesh).geometry.dispose();
      }
    });
    for (const m of this.owned) m.dispose();
    this.root.removeFromParent();
  }
}

function newKit(): Kit {
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
    eyeY: 0.28,
  };
}

export function buildAnimal(look: Look): Rig {
  const info = animalInfo(look.animal);
  const coat = /^#[0-9a-f]{6}$/i.test(look.color) ? look.color : info.colors[0];
  const k = newKit();
  const c = colorsFor(coat);
  const res = RECIPES[info.id](k, c, coat);
  const aquatic = res.aquatic ?? info.aquatic;
  return new AnimalRig({
    parts: k,
    material: aquatic ? wet() : soft(),
    ghostColor: mix(coat, '#e6f0ff', 0.75),
    floats: false,
    tentacles: res.legs === 'tentacles',
    aquatic,
  });
}

// ---------------------------------------------------------------- the Storyteller

const ROBE = '#3b2a5a';
const TRIM = '#e8c26a';

export function buildStoryteller(): Rig {
  const k = newKit();
  // A tall robe that narrows into wisps, a deep hood, and sleeves for arms.
  k.torso.add(new THREE.CylinderGeometry(0.16, 0.3, 0.7, 9), ROBE, { pos: [0, 0.42, 0] });
  k.torso.add(new THREE.CylinderGeometry(0.305, 0.31, 0.04, 9), TRIM, { pos: [0, 0.08, 0] });
  k.torso.add(G.box, TRIM, { pos: [0, 0.45, 0.2], rot: [-0.18, 0, 0], scale: [0.04, 0.6, 0.02] });
  ell(k.torso, ROBE, [0, 0.74, 0], [0.24, 0.12, 0.2]);
  // The hood: an outer shell with a dark hollow where the face should be.
  const hc: Vec3 = [0, 0.3, 0];
  k.head.add(G.head, ROBE, { pos: hc, scale: [0.27, 0.29, 0.27] });
  k.head.add(G.cone6, ROBE, { pos: [0, 0.6, -0.1], rot: [-0.6, 0, 0], scale: [0.14, 0.26, 0.12] });
  ell(k.head, '#0d0a14', [0, 0.27, 0.1], [0.2, 0.21, 0.19]);
  k.head.add(G.ring, TRIM, { pos: [0, 0.28, 0.2], rot: [0.1, 0, 0], scale: [0.205, 0.22, 0.12] });
  k.eyeY = 0.3;
  for (const side of [-1, 1]) {
    ell(k.eyes, '#ffe08a', [side * 0.075, 0.3, 0.27], [0.035, 0.022, 0.012], [0, 0, -side * 0.25]);
  }
  for (const [b, side] of [
    [k.armL, 1],
    [k.armR, -1],
  ] as const) {
    b.add(G.taper, ROBE, { pos: [side * 0.02, -0.12, 0], rot: [0, 0, 0], scale: [0.09, 0.26, 0.09] });
    b.add(G.cyl, TRIM, { pos: [side * 0.025, -0.25, 0], scale: [0.092, 0.03, 0.092] });
    ell(b, '#d8d0f0', [side * 0.025, -0.28, 0.01], 0.045);
  }
  const lanternGlow = glow('#ffcf6a', 1.6);
  const eyeGlow = new THREE.MeshBasicMaterial({ color: '#ffe08a' });
  const rig = new AnimalRig({
    parts: k,
    material: soft(),
    eyeMaterial: eyeGlow,
    ghostColor: col('#cbbcf0'),
    floats: true,
    tentacles: false,
    aquatic: false,
    noLegs: true,
    extras: (body) => {
      // The lantern hangs from the left sleeve, so the right paw is free for anything else.
      const lantern = new THREE.Group();
      const lb = new Builder();
      lb.add(G.cyl6, '#4d3a2a', { pos: [0, 0.12, 0], scale: [0.065, 0.03, 0.065] });
      lb.add(G.cone6, '#4d3a2a', { pos: [0, 0.16, 0], scale: [0.07, 0.06, 0.07] });
      lb.add(G.ring, '#4d3a2a', { pos: [0, 0.21, 0], scale: 0.03 });
      lb.add(G.cyl6, '#4d3a2a', { pos: [0, -0.05, 0], scale: [0.07, 0.025, 0.07] });
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        lb.add(G.box, '#4d3a2a', { pos: [Math.cos(a) * 0.058, 0.035, Math.sin(a) * 0.058], scale: [0.012, 0.16, 0.012] });
      }
      const frame = lb.mesh(soft(), { cast: true, receive: false });
      const flame = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.15, 6), lanternGlow);
      flame.position.y = 0.035;
      const light = new THREE.PointLight('#ffcf7a', 1.6, 6, 2);
      light.position.y = 0.04;
      lantern.add(frame, flame, light);
      lantern.position.set(0.04, -0.4, 0.06);
      lantern.name = 'lantern';
      const armL = body.children.find((c) => c.position.x > 0.1 && c.position.y > 0.4);
      (armL ?? body).add(lantern);
    },
  });
  return rig;
}

// ---------------------------------------------------------------- thumbnails

let thumbRenderer: THREE.WebGLRenderer | null = null;
let thumbScene: THREE.Scene | null = null;
let thumbCamera: THREE.PerspectiveCamera | null = null;
const thumbCache = new Map<string, string>();

export function animalThumbnail(look: Look, size = 128): string {
  const key = `${look.animal}:${look.color}:${size}`;
  const hit = thumbCache.get(key);
  if (hit) return hit;
  try {
    if (!thumbRenderer) {
      thumbRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
      thumbRenderer.setPixelRatio(1);
      thumbScene = new THREE.Scene();
      thumbScene.add(new THREE.HemisphereLight('#fff8ee', '#8a7a6a', 2.2));
      const sun = new THREE.DirectionalLight('#fff2dc', 1.6);
      sun.position.set(1.5, 3, 2.5);
      thumbScene.add(sun);
      thumbCamera = new THREE.PerspectiveCamera(30, 1, 0.1, 20);
    }
    thumbRenderer.setSize(size, size, false);
    const rig = buildAnimal(look);
    rig.update({ anim: 'idle', speed: 0, dt: 0.016, t: 0 });
    for (let i = 0; i < 30; i++) rig.update({ anim: 'idle', speed: 0, dt: 0.05, t: 0 });
    rig.root.rotation.y = 0.35;
    thumbScene!.add(rig.root);
    // Head and shoulders, with room for tall ears and antlers.
    const top = Math.max(rig.headHeight, 1.05);
    const bottom = 0.42;
    const cy = (bottom + top) / 2;
    const dist = ((top - bottom) * 1.12) / (2 * Math.tan(THREE.MathUtils.degToRad(15)));
    thumbCamera!.position.set(dist * 0.18, cy + 0.08, dist);
    thumbCamera!.lookAt(0, cy, 0);
    thumbRenderer.render(thumbScene!, thumbCamera!);
    const url = thumbRenderer.domElement.toDataURL('image/png');
    thumbScene!.remove(rig.root);
    rig.dispose();
    thumbCache.set(key, url);
    return url;
  } catch {
    return '';
  }
}
