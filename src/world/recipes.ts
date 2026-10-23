import * as THREE from 'three';
import type { Vec3 } from './build';
import { all, any, armForms, boneAt, type Details, beakForm, decal, decalLine, earForms, earMarks, type Field, finForm, headForm, legForms, membrane, membraneWings, piece, region, sculptOf, snoutForm, sock as sockOf, suckerForms, surfaceHit, tailForm, tentacleForms, torso, unitOf, useSurface, whiskers, wingForms } from './forms';
import { curve, isLow, pillar, solid, type Color, type Fold } from './paper';
import { box, ellipsoid, Probe, pyramid, rod, spiral } from './sculpt';
import {
  CHARCOAL,
  CREAM,
  INK,
  PINK,
  arms,
  bone,
  defaultProfile,
  eyes,
  frame,
  headNormal,
  inside,
  luminance,
  mix,
  mouth,
  nose,
  onHead,
  part,
  segDist,
  v3,
  type Kit,
  type Profile,
  type Recipe,
} from './species';
import type { AnimalId } from './types';

/**
 * Every species: how it's sculpted (see forms.ts) and painted, and how it carries itself (its profile: posture,
 * gait, how it sits, and the little things it does while standing about).
 */

const sample = (prof: number[], t: number) => {
  const x = t * (prof.length - 1);
  const i = Math.min(prof.length - 2, Math.floor(x));
  return prof[i] + (prof[i + 1] - prof[i]) * (x - i);
};

/** A tail's path (in its own space) along a gentle curve, and its thickness along the way from a profile. */
function tailPath(len: number, dir: Vec3, curl: Vec3, r: number, prof: number[], steps = 9) {
  const pts = curve([0, 0, 0.02], dir, steps, len / steps, [curl[0] / steps, curl[1] / steps, curl[2] / steps]);
  return { pts, radii: pts.map((_, i) => r * sample(prof, i / steps)) };
}

/** Moves a nose onto the end of the muzzle, a touch sunk in. */
const onSnout = (k: Kit, p: Vec3, sink = 0.005): Vec3 => v3(k.surface ? k.surface(new THREE.Vector3(...p), -sink) : new THREE.Vector3(...p));

const fox: Recipe = (k, c) => {
  const white = mix(c.coat, CREAM, 0.88);
  const sock = mix(c.coat, '#2b211d', 0.8);
  // Slender and alert: a deep chest, up on longer legs than the others, a long narrow snout.
  k.joints.neck = [0, 0.62, 0.05];
  k.joints.shoulder = [0.1, 0.5, 0.14];
  k.joints.hip = [0.1, 0.2, -0.06];
  k.joints.tail = [0, 0.22, -0.17];
  torso(k, {
    belly: [
      [0, 0.33, -0.095],
      [0.185, 0.22, 0.17],
    ],
    chest: [
      [0, 0.47, 0.045],
      [0.14, 0.15, 0.14],
    ],
    haunch: [
      [0.11, 0.2, -0.09],
      [0.095, 0.12, 0.14],
    ],
    ruff: [
      [0, 0.58, 0.045],
      [0.13, 0.08, 0.12],
    ],
    melt: 0.2,
  });
  headForm(k, {
    r: [0.185, 0.155, 0.175],
    at: [0, 0.14, 0.06],
    cheeks: [
      [0.13, -0.06, 0],
      [0.085, 0.07, 0.09],
    ],
  });
  const snout = snoutForm(k, { dy: -0.28, len: 0.13, ra: 0.072, rb: 0.04, drop: 0.045, squash: [1, 0.85, 1], thin: true });
  // Tall pointed ears set apart, standing clear of the skull.
  earForms(k, { x: 0.58, y: 0.7, w: 0.085, h: 0.22, d: 0.045, splay: 0.18, rake: 0.08, cup: 0.5, notch: true });
  armForms(k, { len: 0.3, r0: 0.052, r1: 0.044, paw: [0.048, 0.036, 0.058], fwd: 0.36, out: 0.16 });
  legForms(k, { r0: 0.062, r1: 0.047, foot: [0.05, 0.036, 0.08] });
  const tailAt = tailForm(k, tailPath(0.62, [0, -0.3, -1], [0.7, -0.75, 0], 0.125, [0.3, 0.7, 0.95, 1, 0.95, 0.8, 0.5]));
  useSurface(k);
  eyes(k, { x: 0.4, y: 0.12, size: 0.9, wide: 1.5, slant: 0.32, color: '#1a1412' });
  nose(k, INK, onSnout(k, snout.nose), 0.026, 0.019);
  whiskers(k, c.coat, { len: 0.1, back: 0.03 });
  const ears = ['earL', 'earR'].map((e) => earMarks(k, e));
  const face = region(k, 'head', 'cheekL', 'cheekR');
  const head = unitOf(k, 'head');
  k.marks = {
    base: c.coat,
    marks: [
      // Ears: white inside, dark behind.
      { color: white, f: any(...ears.map((e) => e.inner)) },
      { color: sock, f: any(...ears.map((e) => e.back)) },
      // White under the muzzle, round the jaw and up the cheek ruffs, and a bib down the chest.
      { color: white, f: all(region(k, 'muzzle'), (q) => q.p.y - (snout.mid(q.p) + snout.r * 0.15)) },
      {
        color: white,
        f: all(face, (q) => {
          const u = head(q);
          const ax = Math.abs(u.x);
          return Math.max(-0.2 - u.z, u.y - (-0.1 - 0.12 * ax + 0.3 * ax * ax));
        }),
      },
      { color: white, f: all(region(k, 'cheekL', 'cheekR'), (q) => head(q).y - 0.05) },
      { color: white, f: all(region(k, 'chest', 'ruff', 'belly'), (q) => -q.p.z, (q) => segDist(q.p.x, q.p.y, 0, 0.36, 0, 0.62).d - 0.075) },
      // Dark socks with a clean straight top, and dark feet.
      { color: sock, f: any(sockOf(k, 'L', 0.5), sockOf(k, 'R', 0.5)) },
      { color: sock, f: all(region(k, /^leg/), (q) => q.p.y - 0.14) },
      // A white tip to the tail.
      { color: white, f: all(region(k, /^tail\d/), (q) => 0.8 - tailAt(q.p)) },
    ],
  };
  return {};
};

const RACCOON_MASK = '#2c2a27';
const RACCOON_CREAM = '#e6dac0';

const raccoon: Recipe = (k, c) => {
  const mask = mix(c.coat, RACCOON_MASK, 0.8);
  const cream = mix(c.coat, RACCOON_CREAM, 0.85);
  const sock = mix(c.coat, '#2f2d28', 0.5);
  // A tall pear, sat solid on the ground, hunched a little forward, with a big wide head.
  k.joints.neck = [0, 0.585, 0.045];
  k.joints.shoulder = [0.12, 0.47, 0.115];
  k.joints.hip = [0.11, 0.17, -0.03];
  k.joints.tail = [0, 0.19, -0.17];
  torso(k, {
    belly: [
      [0, 0.255, -0.05],
      [0.235, 0.25, 0.195],
    ],
    chest: [
      [0, 0.45, 0.03],
      [0.165, 0.15, 0.15],
    ],
    haunch: [
      [0.13, 0.15, -0.05],
      [0.11, 0.12, 0.15],
    ],
    ruff: [
      [0, 0.56, 0.035],
      [0.15, 0.08, 0.13],
    ],
  });
  headForm(k, {
    r: [0.225, 0.178, 0.19],
    at: [0, 0.15, 0.065],
    cheeks: [
      [0.15, -0.07, 0.03],
      [0.105, 0.09, 0.1],
    ],
  });
  const snout = snoutForm(k, { dy: -0.36, len: 0.07, ra: 0.085, rb: 0.06, drop: 0.02, squash: [1.05, 0.8, 1] });
  // Grey outside, cream rims, dark inside.
  earForms(k, { x: 0.66, y: 0.64, w: 0.09, h: 0.15, d: 0.045, splay: 0.3, rake: 0.1, cup: 0.5, notch: true });
  armForms(k, { len: 0.24, r0: 0.062, r1: 0.052, paw: [0.056, 0.042, 0.064], fwd: 0.85 });
  legForms(k, { r0: 0.07, r1: 0.058, foot: [0.075, 0.048, 0.11], fwd: 0.075 });
  // A thick tail with dark rings round it and a dark tip.
  const tailAt = tailForm(k, tailPath(0.44, [0, -0.3, -1], [0.5, -0.9, 0], 0.12, [0.55, 0.9, 1, 1, 0.9, 0.6]));
  useSurface(k);
  // (No blush: it would sit on the mask.)
  eyes(k, { x: 0.38, y: 0.06, size: 0.85, wide: 1.3, slant: 0.18, color: '#121010', out: 0.006, blush: false });
  // A dark triangle of a nose on its own bone, for sniffing.
  nose(k, '#2a2624', onSnout(k, snout.nose), 0.03, 0.022, true);
  whiskers(k, c.coat, { len: 0.11 });
  const ears = ['earL', 'earR'].map((e) => earMarks(k, e));
  const face = region(k, 'head', 'cheekL', 'cheekR');
  const head = unitOf(k, 'head');
  // Across the face (the head's unit form, mirrored): x out from the middle, y up.
  const band = (ax: number, ay: number, bx: number, by: number, w0: number, w1: number) => (q: Probe) => {
    const u = head(q);
    const s = segDist(Math.abs(u.x), u.y, ax, ay, bx, by);
    return u.z < -0.1 ? 1 : s.d - (w0 + (w1 - w0) * s.t);
  };
  k.marks = {
    base: c.coat,
    marks: [
      // Ears: dark inside, cream round the front, grey behind.
      { color: mask, f: any(...ears.map((e) => e.inner)) },
      { color: cream, f: any(...ears.map((e) => e.front)) },
      { color: cream, f: region(k, 'muzzle') },
      // One bold dark band through the eyes, sweeping down onto the cheeks, a grey stripe up the middle.
      { color: mask, f: all(face, (q) => 0.075 - Math.abs(head(q).x), band(0.08, 0.13, 0.86, -0.22, 0.2, 0.13)) },
      // A cream brow above it, cream cheek ruffs and chin below.
      { color: cream, f: all(face, (q) => 0.07 - Math.abs(head(q).x), band(0.1, 0.36, 0.7, 0.26, 0.075, 0.06)) },
      { color: cream, f: any(region(k, 'cheekL', 'cheekR'), all(face, (q) => head(q).y + 0.5, (q) => -0.1 - head(q).z)) },
      // Dark socks with a clean straight top, and dark feet.
      { color: sock, f: any(sockOf(k, 'L', 0.45), sockOf(k, 'R', 0.45)) },
      { color: sock, f: all(region(k, /^leg/), (q) => q.p.y - 0.11) },
      // Dark rings round the tail and a dark tip.
      {
        color: mask,
        f: all(region(k, /^tail\d/), (q) => {
          const t = tailAt(q.p);
          return t > 0.875 ? -1 : Math.sin(Math.PI * 8 * t);
        }),
      },
      // A paler tummy.
      { color: mix(c.coat, cream, 0.14), f: all(region(k, 'belly', 'chest'), (q) => -q.p.z, (q) => Math.hypot(q.p.x / 0.12, (q.p.y - 0.27) / 0.14) - 1) },
    ],
  };
  return {};
};

const snail: Recipe = (k, c, coat) => {
  // The coat colour is the shell; the snail itself is a soft putty colour.
  const skin = mix('#cdbf98', coat, 0.12);
  const sole = mix(skin, CREAM, 0.45);
  const shellColor = c.coat;
  const band = mix(c.coat, CHARCOAL, 0.34);
  const seam = mix(c.coat, CHARCOAL, 0.65);
  k.joints.neck = [0, 0.27, 0.36];
  k.joints.shoulder = [0.085, 0.18, 0.37];
  k.joints.tail = [0, 0.05, -0.3];
  bone(k, 'rear', 'body', [0, 0.06, -0.22]);
  const sc = sculptOf(k);
  // The foot: one long low slab, its back half on its own bone so it can stretch and draw up, rising at the
  // front into the neck.
  sc.add(rod('body', [0, 0.07, -0.1], [0, 0.07, 0.15], 0.14, 0.135, { squash: [1, 0.5, 1], name: 'foot' }));
  sc.add(rod('rear', [0, 0.065, -0.38], [0, 0.07, -0.1], 0.06, 0.14, { squash: [1, 0.5, 1], k: 0.06, anchor: [0, 0.07, -0.14], reach: 0.2, name: 'tailFoot' }));
  sc.add(rod('body', [0, 0.1, 0.2], [0, 0.25, 0.355], 0.1, 0.085, { k: 0.08, anchor: [0, 0.1, 0.18], reach: 0.18, name: 'neck' }));
  // The shell: a tube wound into a spiral on the back, starting low at the front where it's tucked into the
  // foot, running up the front, over the top, down the back and on round, inward.
  const shell = spiral('body', [0, 0.36, -0.1], { R0: 0.2, b: 0.14, a0: 0.15, turns: 1.85, c: 0.45, sx: 1.2, k: 0.06, anchor: [0, 0.16, -0.02], reach: 0.3, name: 'shell' });
  // The tight middle of the coil, filled in.
  sc.add(shell, ellipsoid('body', [0, 0.36, -0.1], [0.08, 0.072, 0.072], { k: 0.03, name: 'shellCore' }));
  k.seat = 0;
  headForm(k, { r: [0.112, 0.106, 0.108], at: [0, 0.07, 0.03], melt: 0.06 });
  useSurface(k);
  mouth(k, { w: 0.24, y: -0.4, curve: 0.13, r: 0.0055 });
  const np = onHead(k, 0, -0.18, 0.004);
  solid(k.head, k.rnd, { base: 'ico1', r: [0.022, 0.016, 0.016], pos: v3(np), jitter: 0.02, color: mix(skin, CHARCOAL, 0.15) });
  k.nose = [np.x, np.y, np.z + 0.012];
  // Eye stalks, each on its own bone so they can look about separately, with the eyes on top.
  const tipRel = new THREE.Vector3(0, 0.17, 0.03);
  for (const side of [-1, 1]) {
    const nm = side > 0 ? 'L' : 'R';
    const base = onHead(k, side * 0.32, 0.72, -0.015);
    bone(k, `stalk${nm}`, 'neck', v3(base));
    const tip = tipRel.clone().add(new THREE.Vector3(side * 0.025, 0, 0));
    bone(k, `blink${nm}`, `stalk${nm}`, v3(tip));
    const stalk = part(k, `stalk${nm}`, `stalk${nm}`);
    pillar(stalk, k.rnd, [0, 0, 0], v3(tip), 0.02, 0.015, skin, { base: 'limb5' });
    solid(stalk, k.rnd, { base: 'ico1', r: 0.032, pos: v3(tip), jitter: 0.04, color: skin });
    const eye = part(k, `eye${nm}`, `stalk${nm}`, { bone: `blink${nm}`, eyes: true });
    const m = frame(tip.clone().add(new THREE.Vector3(0, 0.004, 0.024)));
    solid(eye, k.rnd, { base: 'ico1', r: [0.02, 0.022, 0.013], matrix: m, jitter: 0.02, color: INK, tone: 0.1 });
    solid(eye, k.rnd, { base: 'ico0', r: 0.0065, matrix: inside(m, [0.006, 0.008, 0.011]), jitter: 0.01, color: '#fbf6ec', tone: 0 });
  }
  k.blink = ['blinkL', 'blinkR'];
  const eyeAt = onHead(k, 0.32, 0.72).add(tipRel);
  k.eyeY = eyeAt.y;
  k.eyeX = eyeAt.x + 0.025;
  k.eyeR = 0.032;
  k.eyeZ = eyeAt.z + 0.035;
  // One small tendril on the right, which only reaches out to hold or gesture.
  arms(k, { color: skin, len: 0.12, r: 0.03, rightOnly: true });
  // Things are held out in front of the neck.
  k.front = 0.47;
  const shellAt = shell.unit!;
  const onShell = region(k, 'shell');
  k.marks = {
    base: skin,
    marks: [
      // A dark line where each turn of the shell meets the one outside it, and growth bands round the coil.
      { color: seam, f: all(onShell, (q) => 0.72 - shellAt(q.p).z, (q) => 0.3 - Math.abs(shellAt(q.p).x)) },
      { color: band, f: region(k, 'shellCore') },
      { color: band, f: all(onShell, (q) => Math.sin(Math.PI * 13 * shellAt(q.p).y)) },
      { color: shellColor, f: onShell },
      // A paler sole underneath.
      { color: sole, f: all(region(k, 'foot', 'tailFoot', 'neck'), (q) => q.p.y - 0.02) },
    ],
  };
  return { legs: 'none', tendril: true };
};

/** A patch on the front of the body: an oval (as seen from the front) on the named shapes' front faces. */
/**
 * Round spots on a named shape: each where it is round the shape's middle (in degrees down from the top and
 * round from the front) and how big (on its unit form).
 */
const spots = (k: Kit, name: string, at: [number, number, number][]) => {
  const u = unitOf(k, name);
  const D = Math.PI / 180;
  const dirs = at.map(([t, p, r]) => [Math.sin(t * D) * Math.sin(p * D), Math.cos(t * D), Math.sin(t * D) * Math.cos(p * D), r]);
  return all(region(k, name), (q) => {
    const v = u(q).normalize();
    let d = Infinity;
    for (const [x, y, z, r] of dirs) d = Math.min(d, Math.hypot(v.x - x, v.y - y, v.z - z) - r);
    return d;
  });
};

const frontOval = (k: Kit, names: (string | RegExp)[], cx: number, cy: number, rx: number, ry: number) =>
  all(region(k, ...names), (q) => -q.p.z, (q) => Math.hypot((q.p.x - cx) / rx, (q.p.y - cy) / ry) - 1);

interface DabOpts {
  stretch?: number;
  /** Which way a stretched dab is long (the left one's; mirrored). */
  along?: Vec3;
  sides?: number;
}

/**
 * Crisp dabs of colour on the face (see `decal`), a pair mirrored either side (or one, in the middle), each at a
 * spot on the head's unit form (across and up) and this big.
 */
const faceDabs = (k: Kit, at: [number, number, number][], color: Color, name: string, o: DabOpts = {}) => {
  const n = new THREE.Vector3(...k.joints.neck);
  const c = n.clone().add(new THREE.Vector3(...k.shape.hc));
  at.forEach(([x, y, r], i) => {
    for (const side of x ? [-1, 1] : [1]) {
      const p = onHead(k, side * x, y).add(n);
      const along = o.along && new THREE.Vector3(side * o.along[0], o.along[1], o.along[2]);
      decal(k, { bone: 'neck', from: c, dir: p.sub(c), r, color, stretch: o.stretch, along, sides: o.sides, name: `${name}${i}${side > 0 ? 'L' : 'R'}` });
    }
  });
};

/**
 * Crisp dabs of colour on the body (see `decal`), each where a ray from `c` comes out: round from straight behind
 * (`yaw`, mirrored to both sides unless nought), up (`pitch`), and how big.
 */
const bodyDabs = (k: Kit, bone: string, c: Vec3, at: [number, number, number][], color: Color, name: string, o: DabOpts = {}) => {
  at.forEach(([yaw, pitch, r], i) => {
    for (const side of yaw ? [-1, 1] : [1]) {
      const dir = new THREE.Vector3(side * Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch), -Math.cos(yaw) * Math.cos(pitch));
      const along = o.along && new THREE.Vector3(side * o.along[0], o.along[1], o.along[2]);
      decal(k, { bone, from: new THREE.Vector3(...c), dir, r, color, stretch: o.stretch, along, sides: o.sides, name: `${name}${i}${side > 0 ? 'L' : 'R'}` });
    }
  });
};

/** Two little fangs over the lip, either side of the middle, from a spot on the head's unit form (across and up). */
const fangs = (k: Kit, x: number, y: number, len: number, w: number, color: Color = '#fbf8f1', name = 'fang') => {
  const n = new THREE.Vector3(...k.joints.neck);
  for (const side of [-1, 1]) {
    const p = onHead(k, side * x, y);
    const out = headNormal(k, side * x, y);
    const dir = new THREE.Vector3(0, -1, 0).addScaledVector(out, 0.45).normalize();
    p.add(n);
    const pts = [p.clone().addScaledVector(out, -0.01), p.clone().addScaledVector(dir, len * 0.45), p.clone().addScaledVector(dir, len)];
    piece(k, { bone: 'neck', pts, w: [w, w * 0.8, 0], t: [w * 0.7, w * 0.55, 0], across: new THREE.Vector3(1, 0, 0), colors: [color, color], name: `${name}${side > 0 ? 'L' : 'R'}` });
  }
};

/**
 * Crisp speckles (see `decal`) scattered evenly over an ellipsoid's surface (where rays from its middle come out),
 * wherever `keep` says, a little different in size each.
 */
const speckle = (k: Kit, bone: string, c0: Vec3, r: Vec3, count: number, keep: (d: THREE.Vector3) => boolean, size: number, color: Color, name: string, sides = 7) =>
  fibonacci(count).forEach((d, i) => {
    if (!keep(d)) return;
    decal(k, { bone, from: new THREE.Vector3(...c0), dir: new THREE.Vector3(d.x * r[0], d.y * r[1], d.z * r[2]), r: size * (0.8 + ((i * 7) % 5) * 0.1), color, sides, name: `${name}${i}` });
  });

/**
 * Two little nostrils on top of a bill, `at` of the way along it from where it leaves the face (see `beakForm`),
 * `gap` either side of its middle.
 */
const nostrils = (k: Kit, o: { dy: number; len: number; drop: number; at: number; gap: number; r: number; color: Color }) => {
  const n = new THREE.Vector3(...k.joints.neck);
  const dir = new THREE.Vector3(0, -Math.sin(o.drop), Math.cos(o.drop));
  const c = onHead(k, 0, o.dy, -0.01).add(n).addScaledVector(dir, o.len * o.at);
  for (const side of [-1, 1]) {
    decal(k, { bone: 'neck', from: c.clone().add(new THREE.Vector3(side * o.gap, 0, 0)), dir: new THREE.Vector3(0, 1, 0), r: o.r, stretch: 1.6, along: dir, color: o.color, sides: 7, name: `nostril${side > 0 ? 'L' : 'R'}` });
  }
};

const shark: Recipe = (k, c) => {
  const white = mix(c.coat, '#f2efe8', 0.85);
  const dark = mix(c.coat, CHARCOAL, 0.4);
  // A chubby upright shark: the head runs straight into the body with no neck, a round snout, a tall fin
  // on its back, fins for arms, and a crescent tail.
  k.joints.neck = [0, 0.5, 0.05];
  k.joints.shoulder = [0.19, 0.4, 0.08];
  k.joints.hip = [0.1, 0.15, -0.02];
  k.joints.tail = [0, 0.22, -0.18];
  torso(k, {
    belly: [
      [0, 0.28, -0.02],
      [0.23, 0.26, 0.21],
    ],
    chest: [
      [0, 0.44, 0.03],
      [0.2, 0.16, 0.19],
    ],
    melt: 0.2,
  });
  headForm(k, { r: [0.24, 0.21, 0.25], at: [0, 0.15, 0.05], melt: 0.18 });
  const snout = snoutForm(k, { dy: -0.02, len: 0.08, ra: 0.15, rb: 0.1, drop: 0.01, squash: [1.1, 0.72, 1], melt: 0.08 });
  // Fins are thin side to side (w) and long front to back (d).
  finForm(k, 'body', [0, 0.47, -0.14], { len: 0.21, w: 0.04, d: 0.1, rot: [-0.95, 0, 0], name: 'dorsal', melt: 0.05 });
  wingForms(k, { len: 0.3, w: 0.09, d: 0.04, taper: 0.7, fwd: 0.3, out: 0.58 });
  legForms(k, { r0: 0.06, r1: 0.05, foot: [0.06, 0.035, 0.08] });
  const tp = tailPath(0.3, [0, -0.05, -1], [0.35, 0, 0], 0.1, [1, 0.8, 0.55, 0.4]);
  const tailAt = tailForm(k, tp);
  const tip = tp.pts[tp.pts.length - 1];
  const end: Vec3 = [k.joints.tail[0] + tip[0], k.joints.tail[1] + tip[1], k.joints.tail[2] + tip[2]];
  finForm(k, 'tail2', end, { len: 0.2, w: 0.04, d: 0.065, rot: [-0.75, 0, 0], name: 'tailFinUp' });
  finForm(k, 'tail2', end, { len: 0.12, w: 0.04, d: 0.055, rot: [-2.3, 0, 0], name: 'tailFinDown' });
  useSurface(k);
  eyes(k, { x: 0.45, y: 0.15, size: 0.9, wide: 1.1, slant: 0.1, color: '#141018' });
  mouth(k, { w: 0.4, y: -0.42, curve: 0.12, r: 0.008, out: 0.004 });
  // A few little pointed teeth along the top of its grin.
  fangs(k, 0.08, -0.41, 0.03, 0.012, '#fbf8f1', 'tooth');
  fangs(k, 0.2, -0.385, 0.025, 0.0105, '#fbf8f1', 'toothB');
  // Three crisp gill slits on each side of the neck, just under the head, leaning back.
  for (const side of [-1, 1]) {
    [-0.03, 0.035, 0.1].forEach((z, i) => {
      decal(k, { bone: 'body', from: new THREE.Vector3(0, 0.49, z), dir: new THREE.Vector3(side, -0.1, 0), r: 0.011, stretch: 3.6, along: new THREE.Vector3(0, 1, 0.3), color: mix(c.coat, CHARCOAL, 0.7), sides: 8, name: `gill${side > 0 ? 'L' : 'R'}${i}` });
    });
  }
  k.nose = snout.nose;
  const head = unitOf(k, 'head');
  k.marks = {
    base: c.coat,
    marks: [
      // A white underside from the snout back along the jaw and down the tummy, under a sweeping line.
      { color: white, f: all(region(k, 'muzzle'), (q) => q.p.y - (snout.mid(q.p) - snout.r * 0.15)) },
      { color: white, f: all(region(k, 'head'), (q) => head(q).y + 0.12 - head(q).z * 0.38, (q) => -head(q).z - 0.25) },
      { color: white, f: frontOval(k, ['belly', 'chest'], 0, 0.3, 0.17, 0.27) },
      { color: dark, f: region(k, 'dorsal', 'tailFinUp', 'tailFinDown') },
      { color: white, f: all(region(k, /^leg/), (q) => q.p.y - 0.03) },
      { color: white, f: all(region(k, /^tail\d/), (q) => -0.02 - (q.p.y - 0.22) + (tailAt(q.p) > 2 ? 1 : 0)) },
    ],
  };
  return { aquatic: true };
};

const jellyfish: Recipe = (k, c) => {
  const light = mix(c.coat, '#ffffff', 0.5);
  const deep = mix(c.coat, '#3a2a60', 0.35);
  // A domed bell, frilly at the rim, with frilled arms and long tentacles trailing under it.
  k.joints.neck = [0, 0.42, 0];
  k.joints.shoulder = [0.05, 0.32, 0.06];
  k.joints.hip = [0.1, 0.36, 0];
  k.joints.tail = [0, 0.4, -0.1];
  torso(k, {
    belly: [
      [0, 0.4, 0],
      [0.13, 0.07, 0.13],
    ],
    chest: [
      [0, 0.43, 0],
      [0.1, 0.05, 0.1],
    ],
  });
  headForm(k, { r: [0.33, 0.29, 0.33], at: [0, 0.14, 0], melt: 0.06 });
  const sc = sculptOf(k);
  const bell = [0, k.joints.neck[1] + 0.14, 0];
  // Scalloped round the rim.
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    sc.add(ellipsoid('neck', [Math.cos(a) * 0.31, bell[1] - 0.06, Math.sin(a) * 0.31], [0.055, 0.04, 0.055], { k: 0.03, name: 'rim' }));
  }
  armForms(k, { len: 0.22, r0: 0.05, r1: 0.035, paw: [0.04, 0.035, 0.04], fwd: 0.25, out: 0.08 });
  tentacleForms(k, { count: 3, len: 0.4, r0: 0.05, r1: 0.04, root: [0, 0.38, 0], rim: 0.23, spread: 2.6, hang: 0.85, curl: 0.12, wave: 0.03, melt: 0.03 });
  useSurface(k);
  // Things are held out under the front of the bell, and sipped from down there.
  k.front = 0.28;
  k.sipLow = true;
  eyes(k, { x: 0.3, y: -0.12, size: 1.1, wide: 1, slant: 0, color: '#1c1428' });
  mouth(k, { w: 0.14, y: -0.32, curve: 0.08, r: 0.006, color: deep });
  // Crisp pale round spots over the dome (clear of the face): each how far down from the top and round from the
  // front (degrees), and how big.
  const hr = k.shape.hr;
  const D = Math.PI / 180;
  ([[18, 150, 0.06], [45, 45, 0.048], [45, -45, 0.048], [52, 115, 0.054], [52, -115, 0.054], [58, 180, 0.058], [82, 80, 0.042], [82, -80, 0.042], [86, 145, 0.045], [86, -145, 0.045]] as Vec3[]).forEach(([t, p, r], i) => {
    const dir = new THREE.Vector3(Math.sin(t * D) * Math.sin(p * D) * hr[0], Math.cos(t * D) * hr[1], Math.sin(t * D) * Math.cos(p * D) * hr[2]);
    decal(k, { bone: 'neck', from: new THREE.Vector3(0, bell[1], 0), dir, r, color: mix(c.coat, '#ffffff', 0.55), sides: 12, name: `dome${i}` });
  });
  k.marks = {
    base: c.coat,
    marks: [
      { color: light, f: region(k, 'rim') },
      { color: light, f: region(k, /^arm/, /^fore/) },
      { color: mix(c.coat, light, 0.5), f: all(region(k, /^leg/), (q) => q.p.y - 0.12) },
    ],
  };
  return { aquatic: true, legs: 'tentacles', hover: 0.3, jelly: true };
};

const octopus: Recipe = (k, c) => {
  // A big round mantle sitting on a skirt of curling tentacles, two of them for arms.
  k.joints.neck = [0, 0.3, 0];
  k.joints.shoulder = [0.13, 0.26, 0.12];
  k.joints.hip = [0.1, 0.18, -0.02];
  k.joints.tail = [0, 0.25, -0.18];
  torso(k, {
    belly: [
      [0, 0.22, 0],
      [0.22, 0.14, 0.2],
    ],
    chest: [
      [0, 0.3, 0.02],
      [0.2, 0.1, 0.18],
    ],
  });
  headForm(k, { r: [0.29, 0.31, 0.27], at: [0, 0.22, -0.03], melt: 0.12 });
  const arms = { len: 0.24, r0: 0.055, r1: 0.032, paw: [0.035, 0.03, 0.04] as Vec3, fwd: 0.45, out: 0.35 };
  const legs = { count: 3, len: 0.46, r0: 0.064, r1: 0.034, root: [0.12, 0.15, -0.02] as Vec3, spread: 2.4, hang: 0.4, coil: 2.7 };
  armForms(k, arms);
  tentacleForms(k, legs);
  // A little skirt of webbing where they join.
  sculptOf(k).add(ellipsoid('body', [0, 0.12, -0.02], [0.25, 0.045, 0.23], { k: 0.06, name: 'skirt' }));
  useSurface(k);
  suckerForms(k, legs, arms, mix(c.coat, '#fff3ec', 0.55));
  eyes(k, { x: 0.34, y: -0.12, size: 1.35, wide: 1.05, slant: 0.05, color: '#1c1420' });
  mouth(k, { w: 0.16, y: -0.42, curve: 0.08, r: 0.006 });
  // Pale freckles over the top and back of the mantle, clear of the face.
  bodyDabs(k, 'neck', plus(k.joints.neck, [0, 0.22, -0.03]), [[0, 1.15, 0.05], [0.55, 0.6, 0.045], [0, 0.3, 0.05], [1.05, 0.2, 0.04], [1.25, 0.8, 0.042], [0.5, -0.1, 0.038], [1.85, 0.55, 0.036], [0.15, -0.45, 0.034]], mix(c.coat, '#fff3ec', 0.4), 'freckle');
  k.marks = {
    base: c.coat,
    // Plain all over (the freckles and suckers are pieces of their own).
    marks: [],
  };
  return { aquatic: true, legs: 'tentacles' };
};

const penguin: Recipe = (k, c) => {
  const white = '#f2efe6';
  const orange = '#e8892e';
  const gold = '#f2c14e';
  const flipper = mix(c.coat, '#121419', 0.22);
  // Tall and upright like a little skittle: a round tummy bulging in front, a smooth back, flat paddle flippers
  // hanging close at its sides, a stubby tail propping it up behind and big flat orange feet. The white front wraps
  // a long way round its sides under a dark coat and hood, and a golden patch curls down each side of its neck.
  k.joints.neck = [0, 0.6, 0.03];
  k.joints.shoulder = [0.185, 0.5, 0];
  k.joints.hip = [0.085, 0.12, 0.03];
  k.joints.tail = [0, 0.14, -0.15];
  torso(k, {
    belly: [
      [0, 0.31, 0.02],
      [0.225, 0.3, 0.2],
    ],
    chest: [
      [0, 0.5, 0.02],
      [0.185, 0.16, 0.165],
    ],
    melt: 0.18,
  });
  headForm(k, { r: [0.2, 0.19, 0.19], at: [0, 0.13, 0.02], melt: 0.14 });
  const beakTip = beakForm(k, { dy: -0.08, len: 0.1, w: 0.03, h: 0.028, drop: 0.25 });
  wingForms(k, { len: 0.32, w: 0.08, d: 0.027, taper: 0.75, fwd: -0.06, out: 0.26 });
  legForms(k, { r0: 0.05, r1: 0.04, foot: [0.068, 0.024, 0.09], fwd: 0.07 });
  // The tail: a short stiff wedge of feathers sloping down behind.
  sculptOf(k).add(ellipsoid('tail', plus(k.joints.tail, [0, -0.05, -0.03]), [0.05, 0.024, 0.052], { rot: [-0.95, 0, 0], k: 0.05, anchor: k.joints.tail, reach: 0.12, name: 'tailFan' }));
  useSurface(k);
  // White rings round its eyes.
  eyes(k, { x: 0.38, y: 0.14, size: 0.9, wide: 1, slant: 0, color: '#141018', ring: white, ringSize: 1.55 });
  k.nose = beakTip;
  const head = unitOf(k, 'head');
  const n = k.joints.neck;
  // How far round from the front the white reaches at each height (radians), up from the feet to the chin.
  const reach = [1.05, 1.3, 1.32, 1.2, 1.0, 0.9];
  const front = (q: Probe) => Math.atan2(Math.abs(q.p.x), q.p.z + 0.02) - sample(reach, THREE.MathUtils.clamp(q.p.y / 0.66, 0, 1));
  // A golden comma on each side of the neck: broad behind the eye, curling down and forward to the white front.
  const comma = (q: Probe) => {
    if (Math.abs(q.p.x) < 0.1) return 1;
    const s = segDist(q.p.z, q.p.y, n[2] + 0.01, n[1] + 0.1, n[2] + 0.09, n[1] - 0.02);
    return s.d - (0.045 - 0.025 * s.t);
  };
  // The hood comes down the sides of the face, leaving a white bib up under the beak.
  const bib = (q: Probe) => {
    const u = head(q);
    return u.y + 0.1 + 0.42 * Math.abs(u.x);
  };
  k.marks = {
    base: c.coat,
    marks: [
      { color: orange, f: region(k, 'beak', /^leg/) },
      { color: flipper, f: region(k, 'armL', 'armLPaw', 'armR', 'armRPaw') },
      { color: gold, f: comma },
      // The white front, up to under the beak, its edge running smoothly round the sides.
      { color: white, f: all(region(k, 'head', 'belly', 'chest'), front, bib) },
    ],
  };
  return { aquatic: true };
};

const duck: Recipe = (k, c) => {
  const orange = '#e8892e';
  const pale = mix(c.coat, '#ffffff', 0.35);
  // A round little duck: a flat orange bill, a tuft on top, wings folded on its back, tail cocked up.
  k.joints.neck = [0, 0.56, 0.05];
  k.joints.shoulder = [0.19, 0.45, -0.02];
  k.joints.hip = [0.08, 0.12, 0.02];
  k.joints.tail = [0, 0.22, -0.2];
  torso(k, {
    belly: [
      [0, 0.3, -0.02],
      [0.24, 0.28, 0.22],
    ],
    chest: [
      [0, 0.46, 0.05],
      [0.19, 0.14, 0.17],
    ],
    melt: 0.18,
  });
  headForm(k, { r: [0.2, 0.19, 0.19], at: [0, 0.16, 0.03], melt: 0.14 });
  const billTip = beakForm(k, { dy: -0.12, len: 0.13, w: 0.075, h: 0.028, drop: 0.12, flat: true });
  const bill = { dy: -0.12, len: 0.13, drop: 0.12 };
  finForm(k, 'neck', v3(onHead(k, 0, 0.92, -0.02).add(new THREE.Vector3(...k.joints.neck))), { len: 0.08, w: 0.025, d: 0.015, rot: [-0.5, 0, 0], name: 'tuft', melt: 0.02 });
  wingForms(k, { len: 0.4, w: 0.14, d: 0.04, fwd: -0.05, out: 0.18 });
  legForms(k, { r0: 0.045, r1: 0.04, foot: [0.065, 0.025, 0.09], fwd: 0.06 });
  finForm(k, 'tail', k.joints.tail, { len: 0.13, w: 0.08, d: 0.024, rot: [-0.65, 0, 0], name: 'tailFan' });
  useSurface(k);
  eyes(k, { x: 0.38, y: 0.18, size: 0.9, wide: 1, slant: 0, color: '#141018' });
  nostrils(k, { ...bill, at: 0.42, gap: 0.022, r: 0.0095, color: mix(orange, '#5a2a10', 0.55) });
  // Three crisp darker flight feathers fanned out at the back of each folded wing.
  const quill = mix(c.coat, CHARCOAL, 0.32);
  for (const side of ['L', 'R']) {
    const tip = sculptOf(k).named(`arm${side}Paw`)!.c;
    [-0.5, 0, 0.5].forEach((spread, i) => {
      const dir = new THREE.Vector3((side === 'L' ? 1 : -1) * (0.25 + spread * 0.3), -0.55 + spread * 0.35, -1).normalize();
      const hit = surfaceHit(k, tip, dir);
      if (!hit) return;
      const len = 0.085 - Math.abs(spread) * 0.03;
      piece(k, { bone: `fore${side}`, pts: [hit.p.clone().addScaledVector(dir, -0.02), hit.p.clone().addScaledVector(dir, len * 0.5), hit.p.clone().addScaledVector(dir, len)], w: [0.024, 0.02, 0], t: [0.006, 0.005, 0], across: new THREE.Vector3(1, 0, 0).cross(dir).normalize(), colors: [quill, quill], name: `quill${side}${i}` });
    });
  }
  k.nose = billTip;
  k.marks = {
    base: c.coat,
    marks: [
      { color: orange, f: region(k, 'beak', /^leg/) },
      { color: mix(c.coat, CHARCOAL, 0.12), f: region(k, 'armL', 'armLPaw', 'armR', 'armRPaw') },
      { color: pale, f: frontOval(k, ['belly', 'chest'], 0, 0.3, 0.17, 0.22) },
    ],
  };
  return { aquatic: true };
};

const bat: Recipe = (k, c) => {
  const membrane = mix(c.coat, '#c98593', 0.42);
  const belly = mix(c.coat, '#c8a890', 0.45);
  const pink = mix(c.coat, PINK, 0.6);
  // A small furry body, a big head with huge pointed ears, and wide leathery wings held out.
  k.joints.neck = [0, 0.5, 0.02];
  k.joints.shoulder = [0.12, 0.45, 0];
  k.joints.hip = [0.07, 0.2, -0.01];
  k.joints.tail = [0, 0.2, -0.12];
  torso(k, {
    belly: [
      [0, 0.33, 0],
      [0.17, 0.2, 0.15],
    ],
    chest: [
      [0, 0.44, 0.02],
      [0.15, 0.1, 0.14],
    ],
  });
  headForm(k, { r: [0.22, 0.2, 0.2], at: [0, 0.15, 0.03], cheeks: [[0.1, -0.08, 0.03], [0.08, 0.07, 0.08]] });
  const snout = snoutForm(k, { dy: -0.3, len: 0.04, ra: 0.075, rb: 0.06, drop: 0.0, squash: [1.1, 0.85, 1] });
  earForms(k, { x: 0.5, y: 0.62, w: 0.095, h: 0.22, d: 0.035, splay: 0.42, rake: 0.05, cup: 0.5, notch: true });
  membraneWings(k, { len: 0.46, span: 0.3, d: 0.022, fingers: [0.4, 0.66, 0.9], elbow: 0.34 });
  legForms(k, { r0: 0.032, r1: 0.026, foot: [0.035, 0.02, 0.05] });
  useSurface(k);
  eyes(k, { x: 0.36, y: 0.08, size: 1.1, wide: 1, slant: 0.05, color: '#140c10' });
  nose(k, '#3a2a30', onSnout(k, snout.nose, 0.004), 0.02, 0.016);
  mouth(k, { w: 0.18, y: -0.55, curve: 0.08, r: 0.006 });
  // Two tiny fangs peeping over its lip.
  fangs(k, 0.075, -0.535, 0.03, 0.0085);
  const ears = ['earL', 'earR'].map((e) => earMarks(k, e));
  k.marks = {
    base: c.coat,
    marks: [
      { color: pink, f: any(...ears.map((e) => e.inner)) },
      { color: membrane, f: region(k, 'armLWeb', 'armRWeb', 'armLHand', 'armRHand') },
      { color: belly, f: region(k, 'muzzle') },
      { color: belly, f: frontOval(k, ['belly', 'chest'], 0, 0.36, 0.11, 0.15) },
    ],
  };
  return { hover: 0.22, flaps: true };
};

const frog: Recipe = (k, c) => {
  const belly = mix(c.coat, '#fff6c8', 0.6);
  const spot = mix(c.coat, CHARCOAL, 0.36);
  // Squat and wide: a wide flat head with eyes up on top, a big smile, a throat that puffs out, and long
  // folded back legs on big feet.
  k.joints.neck = [0, 0.34, 0.08];
  k.joints.shoulder = [0.15, 0.3, 0.12];
  k.joints.hip = [0.14, 0.14, -0.06];
  k.joints.tail = [0, 0.15, -0.2];
  torso(k, {
    belly: [
      [0, 0.2, -0.04],
      [0.24, 0.19, 0.22],
    ],
    chest: [
      [0, 0.3, 0.04],
      [0.2, 0.12, 0.18],
    ],
    haunch: [
      [0.15, 0.14, -0.08],
      [0.1, 0.1, 0.15],
    ],
  });
  headForm(k, { r: [0.27, 0.16, 0.22], at: [0, 0.1, 0.05], melt: 0.12 });
  const sc = sculptOf(k);
  const hc = new THREE.Vector3(...k.joints.neck).add(new THREE.Vector3(0, 0.1, 0.05));
  for (const side of [-1, 1]) {
    sc.add(ellipsoid('neck', [side * 0.14, hc.y + 0.12, hc.z + 0.05], [0.075, 0.07, 0.07], { k: 0.05, name: side > 0 ? 'moundL' : 'moundR' }));
  }
  // A throat on its own bone, so it can puff out.
  bone(k, 'throat', 'neck', [0, -0.02, 0.15]);
  sc.add(ellipsoid('throat', [0, k.joints.neck[1] - 0.02, k.joints.neck[2] + 0.15], [0.13, 0.06, 0.08], { k: 0.04, anchor: [0, k.joints.neck[1] - 0.02, k.joints.neck[2] + 0.15], reach: 0.12, name: 'throat' }));
  armForms(k, { len: 0.2, r0: 0.045, r1: 0.035, paw: [0.045, 0.02, 0.05], fwd: 0.5, out: 0.25 });
  legForms(k, { r0: 0.055, r1: 0.045, foot: [0.07, 0.024, 0.11], fwd: 0.06 });
  useSurface(k);
  eyes(k, { x: 0.52, y: 0.62, size: 1.05, wide: 1.05, slant: 0, color: '#141018' });
  mouth(k, { w: 0.6, y: -0.25, curve: 0.08, r: 0.0075 });
  // A round eardrum behind each eye, and crisp darker spots over the back, the haunches and the back of the head.
  faceDabs(k, [[0.9, 0.2, 0.034]], mix(c.coat, '#4a3a20', 0.4), 'drum');
  bodyDabs(k, 'body', [0, 0.22, -0.02], [[0, 0.55, 0.038], [0.42, 0.2, 0.033], [0.5, 0.85, 0.03], [0.95, 0.5, 0.03], [0.85, -0.05, 0.028], [1.35, 0.22, 0.025]], spot, 'spot');
  bodyDabs(k, 'neck', plus(k.joints.neck, [0, 0.1, 0.05]), [[0, 0.75, 0.03], [0.55, 0.45, 0.024]], spot, 'headSpot');
  k.marks = {
    base: c.coat,
    marks: [
      { color: belly, f: region(k, 'throat') },
      { color: belly, f: frontOval(k, ['belly', 'chest'], 0, 0.2, 0.17, 0.16) },
    ],
  };
  return { aquatic: true };
};

const plus = (a: Vec3, b: Vec3): Vec3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];

/** Evenly spread directions over a sphere (a Fibonacci spiral), for scattering spines. */
function fibonacci(n: number): THREE.Vector3[] {
  return Array.from({ length: n }, (_, i) => {
    const y = 1 - (2 * (i + 0.5)) / n;
    const r = Math.sqrt(1 - y * y);
    const a = i * Math.PI * (3 - Math.sqrt(5));
    return new THREE.Vector3(Math.cos(a) * r, y, Math.sin(a) * r);
  });
}

/** A chain of tapering rods through some points (horns, antlers, gill stalks), each melted into the last. */
function chain(k: Kit, bone: string, pts: Vec3[], radii: number[], name: string, melt = 0.03) {
  const sc = sculptOf(k);
  for (let i = 0; i + 1 < pts.length; i++) {
    sc.add(rod(bone, pts[i], pts[i + 1], radii[i], radii[i + 1], { k: i === 0 ? melt : 0.02, anchor: pts[0], reach: 0.08, name: `${name}${i}`, thin: true }));
  }
}

const squid: Recipe = (k, c) => {
  const light = mix(c.coat, '#ffffff', 0.45);
  const deep = mix(c.coat, '#5a2a4a', 0.38);
  // A fish turned on end: a tall pointed mantle standing up out of the back of a round head with big eyes,
  // a fin each side at the top, and a skirt of short arms underneath (two long ones to hold things).
  k.joints.neck = [0, 0.36, 0.02];
  k.joints.shoulder = [0.13, 0.33, 0.1];
  k.joints.hip = [0.1, 0.18, -0.02];
  k.joints.tail = [0, 0.3, -0.15];
  torso(k, {
    belly: [
      [0, 0.25, 0],
      [0.17, 0.11, 0.16],
    ],
    chest: [
      [0, 0.33, 0.02],
      [0.16, 0.08, 0.15],
    ],
  });
  headForm(k, { r: [0.21, 0.17, 0.19], at: [0, 0.1, 0.03], melt: 0.1 });
  const sc = sculptOf(k);
  const n = k.joints.neck;
  // The mantle, on the neck so it moves with the head: an egg rising out of the back of the head to a point.
  sc.add(ellipsoid('neck', [0, n[1] + 0.31, n[2] - 0.05], [0.145, 0.27, 0.135], { k: 0.08, name: 'mantle' }));
  sc.add(rod('neck', [0, n[1] + 0.45, n[2] - 0.05], [0, n[1] + 0.68, n[2] - 0.06], 0.105, 0.025, { k: 0.06, name: 'mantleTip' }));
  // Fins either side of the point, together an arrowhead.
  finForm(k, 'neck', [0.07, n[1] + 0.5, n[2] - 0.05], { len: 0.14, w: 0.08, d: 0.034, rot: [0, 0, -0.8], name: 'finL', melt: 0.04 });
  finForm(k, 'neck', [-0.07, n[1] + 0.5, n[2] - 0.05], { len: 0.14, w: 0.08, d: 0.034, rot: [0, 0, 0.8], name: 'finR', melt: 0.04 });
  armForms(k, { len: 0.24, r0: 0.045, r1: 0.034, paw: [0.036, 0.03, 0.045], fwd: 0.75, out: 0.3 });
  // Its arms start low, under the head: things are lifted up to the chest like everyone else's.
  k.lift = 0.12;
  tentacleForms(k, { count: 3, len: 0.24, r0: 0.042, r1: 0.03, root: [0.08, 0.15, -0.01], rim: 0.08, spread: 2.3, hang: 0.7, curl: 0.06, melt: 0.09 });
  useSurface(k);
  eyes(k, { x: 0.5, y: 0.02, size: 1.35, wide: 1, slant: 0, color: '#141018', ring: light, ringSize: 1.4 });
  mouth(k, { w: 0.12, y: -0.42, curve: 0.06, r: 0.006 });
  // Little dark spots of colour scattered over the mantle, above and below its band.
  speckle(k, 'neck', [0, n[1] + 0.31, n[2] - 0.05], [0.145, 0.27, 0.135], 44, (d) => Math.abs(d.y - 0.19) > 0.2 && d.y < 0.5 && d.y > (d.z > 0 ? -0.15 : -0.45), 0.023, deep, 'spot');
  k.marks = {
    base: c.coat,
    marks: [
      // Darker fins and point, and a darker band round the mantle.
      { color: deep, f: region(k, 'finL', 'finR', 'mantleTip') },
      { color: deep, f: all(region(k, 'mantle'), (q) => Math.abs(q.p.y - (n[1] + 0.36)) - 0.035) },
      // Paler undersides to the arms.
      { color: light, f: all(region(k, /^leg/, /^fore/, 'armLPaw', 'armRPaw'), (q) => q.p.y - 0.05) },
    ],
  };
  return { aquatic: true, legs: 'tentacles' };
};

const hedgehog: Recipe = (k, c) => {
  const face = mix(c.coat, CREAM, 0.72);
  const spine = mix(c.coat, '#2e2016', 0.5);
  const tip = mix(spine, CREAM, 0.42);
  // A round little ball: a pale face with a pointed snout, peeping out of a coat of crisp spikes laid back in
  // overlapping rows over the crown and the back; small round ears, tiny paws and feet.
  k.joints.neck = [0, 0.44, 0.07];
  k.joints.shoulder = [0.14, 0.34, 0.13];
  k.joints.hip = [0.1, 0.13, -0.02];
  k.joints.tail = [0, 0.15, -0.2];
  const bellyC: Vec3 = [0, 0.28, -0.03];
  const bellyR: Vec3 = [0.23, 0.21, 0.2];
  torso(k, {
    belly: [bellyC, bellyR],
    chest: [
      [0, 0.38, 0.05],
      [0.17, 0.12, 0.16],
    ],
    melt: 0.18,
  });
  const headAt: Vec3 = [0, 0.1, 0.07];
  const headR: Vec3 = [0.17, 0.15, 0.16];
  headForm(k, { r: headR, at: headAt, melt: 0.12 });
  const snout = snoutForm(k, { dy: -0.22, len: 0.1, ra: 0.065, rb: 0.03, drop: 0.03, squash: [1, 0.9, 1], thin: true });
  earForms(k, { x: 0.62, y: 0.42, w: 0.05, h: 0.06, d: 0.03, round: true, splay: 0.3, rake: 0.1, cup: 0.5 });
  armForms(k, { len: 0.13, r0: 0.04, r1: 0.035, paw: [0.036, 0.026, 0.042], fwd: 0.7, out: 0.2 });
  legForms(k, { r0: 0.046, r1: 0.04, foot: [0.046, 0.026, 0.07], fwd: 0.04 });
  useSurface(k);
  // The coat: on the body behind a line round the shoulders, and on the head behind the brow.
  const hc = plus(k.joints.neck, headAt);
  const onBody = (d: THREE.Vector3, m = 0) => Math.max(d.z - 0.3 - m, -0.15 - m - d.y);
  const onHead = (d: THREE.Vector3, m = 0) => Math.max(d.z + 0.05 - d.y * 0.4 - m, -0.2 - m - d.y);
  // Spikes: crisp faceted points, sunk into the coat and swept back away from the brow, standing off it so
  // the outline bristles; one in three with a paler point.
  const brow = new THREE.Vector3(0, hc[1] + 0.06, hc[2] + 0.2);
  let n = 0;
  const bristle = (bone: string, c0: Vec3, r: Vec3, count: number, inCoat: (d: THREE.Vector3) => number) => {
    for (const d of fibonacci(count)) {
      if (inCoat(d) > -0.04) continue;
      const hit = surfaceHit(k, new THREE.Vector3(...c0), new THREE.Vector3(d.x * r[0], d.y * r[1], d.z * r[2]));
      if (!hit) continue;
      const { p, n: nrm } = hit;
      const flow = p.clone().sub(brow);
      flow.addScaledVector(nrm, -flow.dot(nrm)).normalize();
      const dir = flow.multiplyScalar(Math.cos(0.6)).addScaledVector(nrm, Math.sin(0.6)).normalize();
      const len = 0.15 + ((n * 7) % 5) * 0.008;
      const pts = [p.clone().addScaledVector(nrm, -0.03), p.clone().addScaledVector(dir, len * 0.55), p.clone().addScaledVector(dir, len)];
      const pale = n % 3 === 0;
      piece(k, { bone, pts, w: [0.036, 0.02, 0], t: [0.017, 0.011, 0], across: new THREE.Vector3().crossVectors(nrm, dir), colors: [spine, pale ? tip : spine], name: `spike${n++}` });
    }
  };
  bristle('body', bellyC, bellyR, 90, onBody);
  bristle('neck', hc, headR, 50, onHead);
  eyes(k, { x: 0.4, y: 0.06, size: 0.85, wide: 1, slant: 0.05, color: '#140e0c' });
  nose(k, INK, onSnout(k, snout.nose), 0.024, 0.018);
  const ears = ['earL', 'earR'].map((e) => earMarks(k, e));
  const unitDir = (q: Probe, c0: Vec3, r: Vec3) => new THREE.Vector3((q.p.x - c0[0]) / r[0], (q.p.y - c0[1]) / r[1], (q.p.z - c0[2]) / r[2]).normalize();
  k.marks = {
    base: face,
    marks: [
      { color: mix(c.coat, '#e8a0a0', 0.6), f: any(...ears.map((e) => e.inner)) },
      // Little brown paws and feet.
      { color: mix(face, spine, 0.6), f: region(k, 'armLPaw', 'armRPaw') },
      { color: mix(face, spine, 0.6), f: all(region(k, /^leg/), (q) => q.p.y - 0.045) },
      // Dark under the spikes, with a clean edge round the face and tummy.
      { color: spine, f: all(region(k, 'belly', 'chest'), (q) => onBody(unitDir(q, bellyC, bellyR), 0.06) * 0.2) },
      { color: spine, f: all(region(k, 'head'), (q) => onHead(unitDir(q, hc, headR), 0.06) * 0.15) },
    ],
  };
  return {};
};

const axolotl: Recipe = (k, c) => {
  const gill = mix(c.coat, '#c0306a', 0.55);
  const frill = mix(gill, '#d02060', 0.3);
  const pale = mix(c.coat, '#ffffff', 0.4);
  // A soft newt standing up: a wide flat head with a wide smile, three gill stalks fanning out each side,
  // little hands and feet, and a long flat tail with a fin along the top.
  k.joints.neck = [0, 0.5, 0.06];
  k.joints.shoulder = [0.15, 0.4, 0.1];
  k.joints.hip = [0.1, 0.15, -0.04];
  k.joints.tail = [0, 0.2, -0.18];
  torso(k, {
    belly: [
      [0, 0.28, -0.02],
      [0.19, 0.22, 0.18],
    ],
    chest: [
      [0, 0.42, 0.04],
      [0.16, 0.12, 0.15],
    ],
  });
  const headAt: Vec3 = [0, 0.1, 0.05];
  headForm(k, { r: [0.25, 0.155, 0.2], at: headAt, melt: 0.12 });
  const hc = plus(k.joints.neck, headAt);
  for (const side of [-1, 1]) {
    for (let i = 0; i < 3; i++) {
      const a = 0.35 + i * 0.5;
      const base: Vec3 = [side * 0.2, hc[1] - 0.03 + i * 0.045, hc[2] - 0.06];
      const mid: Vec3 = [side * (0.2 + Math.cos(a) * 0.08), base[1] + Math.sin(a) * 0.08, base[2] - 0.035];
      const tipP: Vec3 = [side * (0.2 + Math.cos(a + 0.25) * 0.15), base[1] + Math.sin(a + 0.25) * 0.15, base[2] - 0.06];
      chain(k, 'neck', [base, mid, tipP], [0.032, 0.03, 0.028], `gill${side > 0 ? 'L' : 'R'}${i}_`);
      // Feathery filaments down both sides of each stalk, swept towards its tip and a little forward.
      const b0 = new THREE.Vector3(...base);
      const d = new THREE.Vector3(...tipP).sub(b0);
      const len = d.length();
      d.normalize();
      const across = new THREE.Vector3(-d.y, d.x, 0).normalize();
      [0.32, 0.52, 0.72, 0.92].forEach((t, f) => {
        const at = b0.clone().addScaledVector(d, len * t);
        const dir = across.clone().multiplyScalar(f % 2 ? 1 : -1).addScaledVector(d, 0.75).add(new THREE.Vector3(0, 0, 0.35)).normalize();
        piece(k, { bone: 'neck', pts: [at, at.clone().addScaledVector(dir, 0.046), at.clone().addScaledVector(dir, 0.072)], w: [0.008, 0.0065, 0], t: [0.0055, 0.0045, 0], across: new THREE.Vector3(0, 0, 1), colors: [frill, frill], name: `frill${side > 0 ? 'L' : 'R'}${i}_${f}` });
      });
    }
  }
  armForms(k, { len: 0.17, r0: 0.04, r1: 0.033, paw: [0.042, 0.02, 0.045], fwd: 0.5, out: 0.3 });
  legForms(k, { r0: 0.05, r1: 0.042, foot: [0.05, 0.022, 0.07] });
  const tp = tailPath(0.46, [0, -0.35, -1], [0.25, 0.2, 0], 0.085, [1, 0.85, 0.7, 0.5, 0.3]);
  const tailAt = tailForm(k, tp);
  const midT = tp.pts[Math.round(tp.pts.length * 0.55)];
  finForm(k, 'tail1', plus(k.joints.tail, midT), { len: 0.07, w: 0.04, d: 0.12, rot: [0.25, 0, 0], name: 'tailFin', melt: 0.04 });
  useSurface(k);
  eyes(k, { x: 0.55, y: 0.18, size: 0.7, wide: 1, slant: 0, color: '#141018' });
  mouth(k, { w: 0.55, y: -0.32, curve: 0.1, r: 0.0065 });
  k.marks = {
    base: c.coat,
    marks: [
      { color: gill, f: region(k, /^gill/) },
      { color: pale, f: region(k, 'tailFin') },
      { color: pale, f: frontOval(k, ['belly', 'chest'], 0, 0.3, 0.14, 0.2) },
      { color: pale, f: all(region(k, /^tail\d/), (q) => 0.12 - tailAt(q.p) + (q.p.y > 0.2 ? 1 : 0)) },
    ],
  };
  return { aquatic: true };
};

const gecko: Recipe = (k, c) => {
  const belly = mix(c.coat, CREAM, 0.6);
  const band = mix(c.coat, '#5a3424', 0.5);
  // A little lizard standing up: a big round head with huge eyes and a wide grin, a slim body, wide hands and
  // feet, dark spots all over its back, and a long fat tail curling out behind, banded across.
  k.joints.neck = [0, 0.5, 0.06];
  k.joints.shoulder = [0.12, 0.42, 0.08];
  k.joints.hip = [0.09, 0.16, -0.03];
  k.joints.tail = [0, 0.19, -0.15];
  torso(k, {
    belly: [
      [0, 0.28, -0.02],
      [0.16, 0.2, 0.15],
    ],
    chest: [
      [0, 0.42, 0.03],
      [0.13, 0.11, 0.12],
    ],
  });
  headForm(k, { r: [0.2, 0.15, 0.19], at: [0, 0.12, 0.06], melt: 0.1 });
  snoutForm(k, { dy: -0.2, len: 0.06, ra: 0.12, rb: 0.085, drop: 0.02, squash: [1.2, 0.62, 1] });
  armForms(k, { len: 0.2, r0: 0.035, r1: 0.03, paw: [0.052, 0.02, 0.05], fwd: 0.45, out: 0.35 });
  legForms(k, { r0: 0.045, r1: 0.036, foot: [0.06, 0.02, 0.07] });
  const tailAt = tailForm(k, tailPath(0.6, [0, -0.45, -1], [0.9, 0.35, 0], 0.08, [1, 0.92, 0.8, 0.62, 0.45, 0.32]));
  useSurface(k);
  // Huge eyes up on the sides of the head, gold round the pupils.
  eyes(k, { x: 0.5, y: 0.3, size: 1.5, wide: 1, slant: 0, color: '#1a1410', ring: '#e2b040', ringSize: 1.3 });
  mouth(k, { w: 0.6, y: -0.3, curve: 0.1, r: 0.006 });
  // A leopard gecko's crisp dark spots over the top of its head, its back and sides.
  speckle(k, 'neck', plus(k.joints.neck, [0, 0.12, 0.06]), [0.2, 0.15, 0.19], 40, (d) => d.z < 0.3 && d.y > -0.1, 0.017, band, 'headSpot');
  speckle(k, 'body', [0, 0.3, -0.02], [0.16, 0.22, 0.15], 44, (d) => d.z < 0.15 && d.y > (Math.abs(d.x) < 0.5 ? -0.25 : -0.6) && d.y < 0.85, 0.018, band, 'spot');
  k.marks = {
    base: c.coat,
    marks: [
      { color: belly, f: frontOval(k, ['belly', 'chest'], 0, 0.3, 0.12, 0.2) },
      // Broad bands round the tail.
      { color: band, f: all(region(k, /^tail\d/), (q) => 0.55 - Math.sin(tailAt(q.p) * Math.PI * 7)) },
    ],
  };
  return {};
};

const highland: Recipe = (k, c) => {
  const horn = '#ece0c4';
  const hornTip = '#4a3e34';
  const nosePink = mix(c.coat, '#e8b8a8', 0.65);
  const hoof = mix(c.coat, CHARCOAL, 0.75);
  const tones = [mix(c.coat, '#f2c890', 0.22), c.coat, mix(c.coat, '#6a2e12', 0.2)];
  // A big shaggy ginger cow: hung all over with crisp locks of hair in layers, a long fringe parted over its
  // eyes, locks down its cheeks, a wide pale muzzle, ears out sideways under long horns that sweep out and up,
  // and a tufted tail.
  k.joints.neck = [0, 0.6, 0.08];
  k.joints.shoulder = [0.17, 0.48, 0.13];
  k.joints.hip = [0.12, 0.2, -0.05];
  k.joints.tail = [0, 0.32, -0.24];
  const bellyC: Vec3 = [0, 0.36, -0.04];
  const bellyR: Vec3 = [0.25, 0.24, 0.24];
  const haunchC: Vec3 = [0.13, 0.22, -0.08];
  const haunchR: Vec3 = [0.11, 0.13, 0.16];
  torso(k, {
    belly: [bellyC, bellyR],
    chest: [
      [0, 0.5, 0.05],
      [0.2, 0.15, 0.19],
    ],
    haunch: [haunchC, haunchR],
    melt: 0.2,
  });
  const headAt: Vec3 = [0, 0.11, 0.08];
  const headR: Vec3 = [0.2, 0.165, 0.175];
  headForm(k, { r: headR, at: headAt, melt: 0.12 });
  const snout = snoutForm(k, { dy: -0.36, len: 0.08, ra: 0.12, rb: 0.105, drop: 0.03, squash: [1.15, 0.8, 1] });
  earForms(k, { x: 0.85, y: 0.15, w: 0.065, h: 0.11, d: 0.03, splay: 1.35, rake: 0.1, cup: 0.5, round: true });
  const sc = sculptOf(k);
  const hc = plus(k.joints.neck, headAt);
  // Horns: out sideways from the top of the head, sweeping up to a point.
  for (const side of [-1, 1]) {
    const b: Vec3 = [side * 0.13, hc[1] + 0.12, hc[2] - 0.02];
    const pts: Vec3[] = [b, [side * 0.26, hc[1] + 0.13, hc[2] - 0.01], [side * 0.36, hc[1] + 0.2, hc[2]], [side * 0.39, hc[1] + 0.3, hc[2] + 0.02]];
    chain(k, 'neck', pts, [0.042, 0.036, 0.029, 0.021], `horn${side > 0 ? 'L' : 'R'}_`, 0.04);
  }
  // A thick forelock on the crown for the fringe to hang from.
  sc.add(ellipsoid('neck', [0, hc[1] + 0.11, hc[2] + 0.06], [0.17, 0.08, 0.13], { k: 0.06, name: 'forelock' }));
  armForms(k, { len: 0.3, r0: 0.07, r1: 0.06, paw: [0.06, 0.048, 0.065], fwd: 0.3, out: 0.16 });
  legForms(k, { r0: 0.08, r1: 0.066, foot: [0.066, 0.048, 0.08] });
  const tailAt = tailForm(k, tailPath(0.3, [0, -0.85, -0.5], [0, 0, 0], 0.035, [1, 0.9, 0.9, 1.5, 1.9]));
  useSurface(k);
  // Locks: crisp flat tapering strips hanging off the surface, tipped out a little and curling out at the end.
  let n = 0;
  const lock = (bone: string, from: THREE.Vector3, out: THREE.Vector3, len: number, w = 0.036, down = new THREE.Vector3(0, -1, 0)) => {
    const hit = surfaceHit(k, from, out);
    if (!hit) return;
    const { p, n: nrm } = hit;
    const flat = new THREE.Vector3(nrm.x, 0, nrm.z).normalize();
    const dir = down.clone().addScaledVector(flat, 0.45).normalize();
    const pts = [p.clone().addScaledVector(nrm, -0.025), p.clone().addScaledVector(dir, len * 0.55).addScaledVector(flat, 0.012), p.clone().addScaledVector(dir, len).addScaledVector(flat, 0.03)];
    const tone = tones[(n * 5 + 1) % 3];
    piece(k, { bone, pts, w: [w, w * 0.75, 0], t: [0.014, 0.011, 0], across: new THREE.Vector3().crossVectors(dir, flat), colors: [tone, tone], name: `lock${n++}` });
  };
  const bc = new THREE.Vector3(...bellyC);
  // Three rows round the body, each between the ones above.
  [0.5, 0.12, -0.25].forEach((y, row) => {
    const count = 12 + row;
    for (let i = 0; i < count; i++) {
      const a = ((i + (row % 2) * 0.5) / count) * Math.PI * 2;
      const d = new THREE.Vector3(Math.sin(a) * bellyR[0], y * bellyR[1], Math.cos(a) * bellyR[2]);
      lock('body', bc, d, row === 0 ? 0.15 : 0.17, 0.04);
    }
  });
  // Over the haunches.
  for (const side of [-1, 1]) {
    const hcn = new THREE.Vector3(side * haunchC[0], haunchC[1], haunchC[2]);
    for (let i = 0; i < 3; i++) lock('body', hcn, new THREE.Vector3(side, 0.3 - i * 0.3, -0.4 + i * 0.35), 0.13, 0.036);
  }
  // The fringe: long locks from the crown hanging down over the face, parted in the middle, with shorter ones
  // between ending above the eyes so they peep out; and locks down each cheek.
  const hcv = new THREE.Vector3(...hc);
  const fringe = (x: number, up: number, len: number) => lock('neck', hcv.clone().add(new THREE.Vector3(0, up, 0)), new THREE.Vector3(x, 0.25, 1), len, 0.034, new THREE.Vector3(x * 0.4, -1, 0.25));
  for (const x of [-0.95, -0.6, -0.15, 0.15, 0.6, 0.95]) fringe(x, 0.08, 0.19);
  for (const x of [-0.8, -0.38, 0.38, 0.8]) fringe(x, 0.1, 0.12);
  for (const side of [-1, 1]) {
    for (let i = 0; i < 3; i++) lock('neck', hcv, new THREE.Vector3(side, -0.25 - i * 0.25, 0.55 - i * 0.2), 0.12, 0.032);
  }
  // Eyes just peeping out under the fringe.
  eyes(k, { x: 0.38, y: -0.2, size: 0.8, wide: 1.15, slant: 0.05, color: '#1a1412' });
  nose(k, mix(nosePink, CHARCOAL, 0.45), onSnout(k, snout.nose), 0.04, 0.022);
  const hornT = (q: Probe) => hc[1] + 0.25 - q.p.y;
  k.marks = {
    base: c.coat,
    marks: [
      { color: hornTip, f: all(region(k, /^horn/), hornT) },
      { color: horn, f: region(k, /^horn/) },
      { color: nosePink, f: all(region(k, 'muzzle'), (q) => -q.p.z + hc[2] + 0.2) },
      { color: tones[0], f: region(k, 'forelock') },
      { color: hoof, f: all(region(k, /^leg/), (q) => q.p.y - 0.06) },
      { color: hoof, f: all(region(k, 'armLPaw', 'armRPaw'), (q) => q.p.y - (k.joints.shoulder[1] - 0.36)) },
      { color: tones[2], f: all(region(k, /^tail\d/), (q) => 0.75 - tailAt(q.p)) },
    ],
  };
  return {};
};

const deer: Recipe = (k, c) => {
  const white = mix(c.coat, CREAM, 0.85);
  const dark = mix(c.coat, '#2b211d', 0.72);
  const antler = '#e4d6b8';
  // Slender and gentle: long legs, a longer neck, big wide ears, a bob of a tail white underneath, a dark nose,
  // a fawn's white spots down its back, and small branching antlers.
  k.joints.neck = [0, 0.66, 0.07];
  k.joints.shoulder = [0.11, 0.52, 0.12];
  k.joints.hip = [0.09, 0.24, -0.06];
  k.joints.tail = [0, 0.36, -0.2];
  torso(k, {
    belly: [
      [0, 0.39, -0.06],
      [0.17, 0.2, 0.17],
    ],
    chest: [
      [0, 0.52, 0.04],
      [0.14, 0.14, 0.13],
    ],
    haunch: [
      [0.1, 0.28, -0.08],
      [0.09, 0.11, 0.13],
    ],
    ruff: [
      [0, 0.62, 0.06],
      [0.09, 0.09, 0.09],
    ],
    melt: 0.2,
  });
  const headAt: Vec3 = [0, 0.15, 0.06];
  headForm(k, { r: [0.15, 0.145, 0.155], at: headAt });
  const snout = snoutForm(k, { dy: -0.3, len: 0.11, ra: 0.075, rb: 0.052, drop: 0.045, squash: [1, 0.85, 1], thin: true });
  earForms(k, { x: 0.8, y: 0.3, w: 0.065, h: 0.17, d: 0.035, splay: 1.05, rake: 0.12, cup: 0.55, long: true });
  const hc = plus(k.joints.neck, headAt);
  // Antlers: a beam up and out from the crown with a tine forward off it, each on a bone of its own so it can fold away
  // under a hat.
  for (const side of [-1, 1]) {
    const nm = side > 0 ? 'antlerL' : 'antlerR';
    const b: Vec3 = [side * 0.07, hc[1] + 0.12, hc[2] - 0.02];
    const m: Vec3 = [side * 0.12, hc[1] + 0.22, hc[2] - 0.04];
    bone(k, nm, 'neck', [b[0] - k.joints.neck[0], b[1] - k.joints.neck[1], b[2] - k.joints.neck[2]]);
    chain(k, nm, [b, m, [side * 0.17, hc[1] + 0.31, hc[2] - 0.07]], [0.027, 0.024, 0.021], `${nm}_`);
    chain(k, nm, [m, [side * 0.13, hc[1] + 0.28, hc[2] + 0.04]], [0.024, 0.021], `${nm}T`);
  }
  armForms(k, { len: 0.32, r0: 0.045, r1: 0.036, paw: [0.036, 0.032, 0.045], fwd: 0.3, out: 0.12 });
  legForms(k, { r0: 0.05, r1: 0.036, foot: [0.036, 0.032, 0.05] });
  const j = k.joints.tail;
  sculptOf(k).add(ellipsoid('tail', [j[0], j[1] + 0.02, j[2] - 0.03], [0.05, 0.065, 0.04], { k: 0.025, anchor: j, reach: 0.07, name: 'bob' }));
  useSurface(k);
  eyes(k, { x: 0.45, y: 0.1, size: 1.1, wide: 1.15, slant: 0.12, color: '#1a1210' });
  nose(k, INK, onSnout(k, snout.nose), 0.026, 0.02);
  const ears = ['earL', 'earR'].map((e) => earMarks(k, e));
  // A fawn's spots: crisp white dots in rows down each side of the back, from the shoulders to the rump, the
  // rows staggered and the outer ones smaller, out onto the flanks.
  const rows = [
    { a: 0.3, top: 0.6, n: 5, r: 0.028 },
    { a: 0.72, top: 0.565, n: 4, r: 0.027 },
    { a: 1.12, top: 0.53, n: 3, r: 0.022 },
    { a: 1.5, top: 0.5, n: 3, r: 0.02 },
  ];
  for (const side of [-1, 1]) {
    rows.forEach(({ a, top, n, r }, ri) => {
      for (let i = 0; i < n; i++) {
        const y = top - i * 0.07;
        const tilt = a + (i % 2) * 0.06 - 0.03;
        decal(k, { bone: 'body', from: new THREE.Vector3(0, y, -0.03), dir: new THREE.Vector3(side * Math.sin(tilt), 0, -Math.cos(tilt)), r, stretch: 1.15, color: white, name: `spot${side > 0 ? 'L' : 'R'}${ri}_${i}` });
      }
    });
  }
  const bobY = j[1] + 0.02;
  k.marks = {
    base: c.coat,
    marks: [
      { color: antler, f: region(k, /^antler/) },
      { color: white, f: any(...ears.map((e) => e.inner)) },
      { color: dark, f: any(...ears.map((e) => e.back)) },
      { color: white, f: all(region(k, 'muzzle'), (q) => q.p.y - (snout.mid(q.p) - snout.r * 0.2)) },
      { color: white, f: all(region(k, 'chest', 'ruff'), (q) => -q.p.z, (q) => Math.hypot(q.p.x / 0.07, (q.p.y - 0.6) / 0.06) - 1) },
      { color: white, f: frontOval(k, ['belly'], 0, 0.3, 0.1, 0.12) },
      // The tail: coat over the top, white under it and on the rump round it, flashed when it bobs.
      { color: white, f: all(region(k, 'bob'), (q) => q.p.y - bobY + (q.p.z - j[2]) * 0.6) },
      { color: white, f: all(region(k, 'belly', 'haunchL', 'haunchR'), (q) => q.p.z + 0.17, (q) => Math.hypot(q.p.x / 0.075, (q.p.y - 0.33) / 0.075) - 1) },
      { color: dark, f: all(region(k, /^leg/), (q) => q.p.y - 0.06) },
      { color: dark, f: all(region(k, 'armLPaw', 'armRPaw'), (q) => q.p.y - (k.joints.shoulder[1] - 0.37)) },
    ],
  };
  return {};
};

const sloth: Recipe = (k, c) => {
  const face = mix(c.coat, CREAM, 0.7);
  const mask = mix(c.coat, '#33241a', 0.68);
  const claw = '#ece2c8';
  // Round and slow: a fuzzy pear of a body, long arms ending in three big pale claws, a pale round face with a
  // dark stripe back through each eye, and a gentle smile.
  k.joints.neck = [0, 0.56, 0.05];
  k.joints.shoulder = [0.17, 0.47, 0.06];
  k.joints.hip = [0.1, 0.16, -0.03];
  k.joints.tail = [0, 0.2, -0.18];
  torso(k, {
    belly: [
      [0, 0.32, -0.03],
      [0.21, 0.23, 0.19],
    ],
    chest: [
      [0, 0.46, 0.03],
      [0.18, 0.13, 0.16],
    ],
    melt: 0.2,
  });
  headForm(k, { r: [0.19, 0.17, 0.17], at: [0, 0.12, 0.06], melt: 0.12 });
  const snout = snoutForm(k, { dy: -0.26, len: 0.04, ra: 0.075, rb: 0.065, drop: 0.01, squash: [1.2, 0.85, 1] });
  armForms(k, { len: 0.36, r0: 0.05, r1: 0.042, paw: [0.045, 0.035, 0.05], fwd: 0.3, out: 0.32 });
  // Three long claws curving down from each paw.
  const sc = sculptOf(k);
  for (const side of ['L', 'R']) {
    const paw = sc.named(`arm${side}Paw`)!.c;
    for (let i = -1; i <= 1; i++) {
      const a: Vec3 = [paw.x + i * 0.025, paw.y - 0.015, paw.z + 0.025];
      chain(k, `fore${side}`, [a, [a[0], a[1] - 0.05, a[2] + 0.025], [a[0], a[1] - 0.085, a[2] + 0.005]], [0.018, 0.016, 0.014], `claw${side}${i + 1}_`, 0.02);
    }
  }
  legForms(k, { r0: 0.055, r1: 0.046, foot: [0.05, 0.03, 0.07] });
  useSurface(k);
  eyes(k, { x: 0.36, y: 0.08, size: 0.8, wide: 1, slant: 0, color: '#140e0c' });
  nose(k, mix(c.coat, '#1a1210', 0.85), onSnout(k, snout.nose), 0.03, 0.022);
  mouth(k, { w: 0.24, y: -0.48, curve: 0.08, r: 0.006 });
  // A crisp dark stripe back from each eye across the pale face.
  faceDabs(k, [[0.55, 0.04, 0.025]], mask, 'stripe', { stretch: 2.9, along: [1, -0.22, 0], sides: 12 });
  const head = unitOf(k, 'head');
  const faceR = region(k, 'head', 'muzzle');
  k.marks = {
    base: c.coat,
    marks: [
      { color: claw, f: region(k, /^claw/) },
      // The pale face.
      { color: face, f: all(faceR, (q) => 0.05 - head(q).z) },
      { color: face, f: region(k, 'muzzle') },
    ],
  };
  return { sleepy: true };
};

const seal: Recipe = (k, c) => {
  const belly = mix(c.coat, '#f2eee6', 0.55);
  const dark = mix(c.coat, CHARCOAL, 0.35);
  // A plump teardrop standing up on its back flippers: a round head with big dark eyes and a whiskery muzzle,
  // flippers for arms, and the back flippers splayed out flat as its feet.
  k.joints.neck = [0, 0.56, 0.05];
  k.joints.shoulder = [0.18, 0.44, 0.06];
  k.joints.hip = [0.08, 0.1, -0.02];
  k.joints.tail = [0, 0.12, -0.18];
  torso(k, {
    belly: [
      [0, 0.3, -0.02],
      [0.22, 0.28, 0.21],
    ],
    chest: [
      [0, 0.46, 0.03],
      [0.18, 0.15, 0.17],
    ],
    melt: 0.2,
  });
  headForm(k, { r: [0.18, 0.165, 0.17], at: [0, 0.13, 0.04], melt: 0.14 });
  const snout = snoutForm(k, { dy: -0.28, len: 0.05, ra: 0.085, rb: 0.07, drop: 0.015, squash: [1.25, 0.8, 1] });
  wingForms(k, { len: 0.28, w: 0.09, d: 0.03, taper: 0.75, fwd: 0.15, out: 0.32 });
  legForms(k, { r0: 0.05, r1: 0.045, foot: [0.075, 0.024, 0.1], fwd: 0.02 });
  useSurface(k);
  eyes(k, { x: 0.4, y: 0.1, size: 1.25, wide: 1, slant: 0, color: '#120e10' });
  nose(k, '#2a2224', onSnout(k, snout.nose), 0.028, 0.02);
  whiskers(k, c.coat, { len: 0.1, sweep: 0.15, color: '#e8e0d4' });
  mouth(k, { w: 0.18, y: -0.52, curve: 0.06, r: 0.006 });
  // A harbour seal's dark speckles, scattered over its back and sides and the top of its head.
  const speck = mix(c.coat, CHARCOAL, 0.42);
  speckle(k, 'body', [0, 0.33, -0.02], [0.22, 0.28, 0.21], 46, (d) => d.z < 0.25 && d.y < 0.75 && d.y > -0.55, 0.017, speck, 'speck');
  speckle(k, 'neck', plus(k.joints.neck, [0, 0.13, 0.04]), [0.18, 0.165, 0.17], 22, (d) => d.z < 0.1 && d.y > -0.1, 0.014, speck, 'headSpeck');
  k.marks = {
    base: c.coat,
    marks: [
      { color: belly, f: region(k, 'muzzle') },
      { color: belly, f: frontOval(k, ['belly', 'chest'], 0, 0.32, 0.16, 0.26) },
      { color: dark, f: all(region(k, /^leg/), (q) => q.p.y - 0.05) },
    ],
  };
  return { aquatic: true };
};

const platypus: Recipe = (k, c) => {
  const bill = '#4a4448';
  const belly = mix(c.coat, '#e8c8a0', 0.45);
  const web = mix(c.coat, '#3a3034', 0.6);
  // A sleek brown swimmer: a soft round body, a wide flat duck's bill, little eyes up high, webbed hands and
  // feet, and a broad flat paddle of a tail.
  k.joints.neck = [0, 0.52, 0.06];
  k.joints.shoulder = [0.16, 0.42, 0.08];
  k.joints.hip = [0.1, 0.14, -0.03];
  k.joints.tail = [0, 0.2, -0.2];
  torso(k, {
    belly: [
      [0, 0.29, -0.03],
      [0.2, 0.25, 0.2],
    ],
    chest: [
      [0, 0.43, 0.03],
      [0.17, 0.13, 0.16],
    ],
    melt: 0.2,
  });
  headForm(k, { r: [0.17, 0.15, 0.16], at: [0, 0.12, 0.05], melt: 0.12 });
  const tip = beakForm(k, { dy: -0.18, len: 0.16, w: 0.09, h: 0.028, flat: true, drop: 0.12 });
  const billAt = { dy: -0.18, len: 0.16, drop: 0.12 };
  armForms(k, { len: 0.18, r0: 0.045, r1: 0.036, paw: [0.05, 0.02, 0.05], fwd: 0.5, out: 0.3 });
  legForms(k, { r0: 0.05, r1: 0.042, foot: [0.06, 0.022, 0.08] });
  // The paddle: a wide flat tail, thinner to the end.
  const j = k.joints.tail;
  sculptOf(k).add(ellipsoid('tail', [j[0], j[1] - 0.06, j[2] - 0.13], [0.12, 0.045, 0.16], { rot: [-0.4, 0, 0], k: 0.05, anchor: j, reach: 0.12, name: 'paddle' }));
  useSurface(k);
  eyes(k, { x: 0.5, y: 0.25, size: 0.75, wide: 1, slant: 0, color: '#120e10' });
  // Nostrils near the end of the bill, and a pale spot under each eye.
  nostrils(k, { ...billAt, at: 0.78, gap: 0.02, r: 0.0085, color: '#1c181a' });
  faceDabs(k, [[0.6, 0.12, 0.024]], belly, 'cheek', { stretch: 1.3, along: [1, 0.3, 0] });
  k.nose = tip;
  k.marks = {
    base: c.coat,
    marks: [
      { color: bill, f: region(k, 'beak') },
      { color: web, f: region(k, 'armLPaw', 'armRPaw') },
      { color: web, f: all(region(k, /^leg/), (q) => q.p.y - 0.045) },
      { color: belly, f: frontOval(k, ['belly', 'chest'], 0, 0.3, 0.15, 0.24) },
    ],
  };
  return { aquatic: true };
};

const panda: Recipe = (k, c) => {
  const black = '#26242a';
  // A round white bear with black ears, black patches round the eyes, a black nose, black legs and arms
  // joined by a black band over the shoulders.
  k.joints.neck = [0, 0.58, 0.05];
  k.joints.shoulder = [0.17, 0.48, 0.1];
  k.joints.hip = [0.11, 0.17, -0.04];
  k.joints.tail = [0, 0.2, -0.22];
  torso(k, {
    belly: [
      [0, 0.32, -0.04],
      [0.24, 0.26, 0.23],
    ],
    chest: [
      [0, 0.48, 0.03],
      [0.2, 0.15, 0.18],
    ],
    haunch: [
      [0.13, 0.18, -0.06],
      [0.11, 0.12, 0.15],
    ],
    melt: 0.2,
  });
  const headAt: Vec3 = [0, 0.13, 0.06];
  headForm(k, {
    r: [0.2, 0.18, 0.18],
    at: headAt,
    cheeks: [
      [0.12, -0.06, 0.04],
      [0.09, 0.08, 0.09],
    ],
  });
  const snout = snoutForm(k, { dy: -0.28, len: 0.05, ra: 0.08, rb: 0.065, drop: 0.02, squash: [1.15, 0.85, 1] });
  earForms(k, { x: 0.62, y: 0.68, w: 0.065, h: 0.075, d: 0.035, round: true, splay: 0.3, rake: 0.1 });
  armForms(k, { len: 0.27, r0: 0.07, r1: 0.06, paw: [0.06, 0.045, 0.065], fwd: 0.35, out: 0.15 });
  legForms(k, { r0: 0.075, r1: 0.065, foot: [0.065, 0.045, 0.085] });
  const j = k.joints.tail;
  sculptOf(k).add(ellipsoid('tail', [j[0], j[1] + 0.01, j[2] - 0.02], [0.05, 0.05, 0.04], { k: 0.025, anchor: j, reach: 0.07, name: 'puff' }));
  useSurface(k);
  eyes(k, { x: 0.38, y: 0.1, size: 0.85, wide: 1, slant: 0.1, color: '#120e10', ring: black, ringSize: 1.8, out: 0.006 });
  nose(k, black, onSnout(k, snout.nose), 0.032, 0.022);
  const head = unitOf(k, 'head');
  k.marks = {
    base: c.coat,
    marks: [
      { color: black, f: region(k, 'earL', 'earR') },
      // Tilted black patches round the eyes.
      {
        color: black,
        f: all(region(k, 'head', 'cheekL', 'cheekR'), (q) => {
          const u = head(q);
          const x = Math.abs(u.x) - 0.38;
          const y = u.y - 0.08;
          const a = 0.5;
          const rx = x * Math.cos(a) + y * Math.sin(a);
          const ry = -x * Math.sin(a) + y * Math.cos(a);
          return Math.max(Math.hypot(rx / 0.2, ry / 0.29) - 1, 0.2 - u.z);
        }),
      },
      // Black arms and a band over the shoulders joining them; black legs.
      { color: black, f: region(k, 'armL', 'armR', 'foreL', 'foreR', 'armLPaw', 'armRPaw') },
      { color: black, f: all(region(k, 'chest', 'belly'), (q) => Math.abs(q.p.y - 0.54 - q.p.z * 0.25) - 0.075, (q) => -Math.max(0.05 - q.p.z, Math.abs(q.p.x) - 0.13)) },
      { color: black, f: region(k, /^leg/, 'haunchL', 'haunchR') },
    ],
  };
  return {};
};

const otter: Recipe = (k, c) => {
  const pale = mix(c.coat, '#e8d4b4', 0.6);
  const dark = mix(c.coat, CHARCOAL, 0.3);
  // Long and supple, standing up tall: a slender body, a small round head with tiny ears, a pale whiskery
  // face and throat, little webbed paws held up, and a long thick tail tapering to a point.
  k.joints.neck = [0, 0.66, 0.07];
  k.joints.shoulder = [0.12, 0.54, 0.1];
  k.joints.hip = [0.09, 0.16, -0.03];
  k.joints.tail = [0, 0.18, -0.16];
  torso(k, {
    belly: [
      [0, 0.32, -0.03],
      [0.17, 0.28, 0.17],
    ],
    chest: [
      [0, 0.53, 0.04],
      [0.14, 0.15, 0.14],
    ],
    melt: 0.22,
  });
  const headAt: Vec3 = [0, 0.11, 0.06];
  headForm(k, { r: [0.15, 0.13, 0.15], at: headAt });
  const snout = snoutForm(k, { dy: -0.22, len: 0.06, ra: 0.075, rb: 0.065, drop: 0.015, squash: [1.25, 0.82, 1] });
  earForms(k, { x: 0.78, y: 0.5, w: 0.035, h: 0.04, d: 0.025, round: true, splay: 0.6, rake: 0.1 });
  armForms(k, { len: 0.18, r0: 0.04, r1: 0.034, paw: [0.04, 0.03, 0.045], fwd: 0.8, out: 0.15 });
  legForms(k, { r0: 0.05, r1: 0.042, foot: [0.05, 0.024, 0.085] });
  const tailAt = tailForm(k, tailPath(0.5, [0, -0.6, -1], [0.3, 0.45, 0], 0.075, [1, 0.9, 0.75, 0.55, 0.35]));
  useSurface(k);
  eyes(k, { x: 0.42, y: 0.12, size: 0.85, wide: 1, slant: 0.05, color: '#120e10' });
  nose(k, '#2a1e1a', onSnout(k, snout.nose), 0.028, 0.02);
  whiskers(k, c.coat, { len: 0.09, color: '#e8ddd0' });
  mouth(k, { w: 0.16, y: -0.5, curve: 0.06, r: 0.006 });
  const head = unitOf(k, 'head');
  k.marks = {
    base: c.coat,
    marks: [
      { color: pale, f: region(k, 'muzzle') },
      { color: pale, f: all(region(k, 'head'), (q) => head(q).y + 0.1, (q) => 0.1 - head(q).z) },
      { color: pale, f: all(region(k, 'chest', 'belly'), (q) => -q.p.z, (q) => Math.hypot(q.p.x / 0.09, (q.p.y - 0.6) / 0.09) - 1) },
      { color: dark, f: region(k, 'armLPaw', 'armRPaw') },
      { color: dark, f: all(region(k, /^leg/), (q) => q.p.y - 0.045) },
      { color: dark, f: all(region(k, /^tail\d/), (q) => 0.55 - tailAt(q.p)) },
    ],
  };
  return { aquatic: true };
};

const capybara: Recipe = (k, c) => {
  const dark = mix(c.coat, CHARCOAL, 0.45);
  // A calm, blocky barrel: a big square-ended head with a deep blunt muzzle, small round ears and eyes set
  // high, a heavy body, short legs and no tail to speak of.
  k.joints.neck = [0, 0.58, 0.07];
  k.joints.shoulder = [0.17, 0.46, 0.11];
  k.joints.hip = [0.12, 0.18, -0.05];
  k.joints.tail = [0, 0.24, -0.25];
  torso(k, {
    belly: [
      [0, 0.33, -0.05],
      [0.24, 0.27, 0.25],
    ],
    chest: [
      [0, 0.47, 0.04],
      [0.2, 0.15, 0.19],
    ],
    haunch: [
      [0.13, 0.2, -0.08],
      [0.11, 0.13, 0.16],
    ],
    melt: 0.22,
  });
  const headAt: Vec3 = [0, 0.13, 0.08];
  headForm(k, { r: [0.17, 0.17, 0.19], at: headAt });
  const snout = snoutForm(k, { dy: -0.12, len: 0.12, ra: 0.13, rb: 0.12, drop: 0.05, squash: [0.95, 1.05, 1] });
  earForms(k, { x: 0.55, y: 0.8, w: 0.045, h: 0.05, d: 0.03, round: true, splay: 0.3, rake: 0.1 });
  armForms(k, { len: 0.27, r0: 0.065, r1: 0.055, paw: [0.055, 0.04, 0.065], fwd: 0.3, out: 0.15 });
  legForms(k, { r0: 0.07, r1: 0.06, foot: [0.06, 0.04, 0.08] });
  useSurface(k);
  eyes(k, { x: 0.5, y: 0.35, size: 0.7, wide: 1, slant: 0, color: '#140e0c' });
  nose(k, dark, onSnout(k, snout.nose), 0.04, 0.02);
  // The dark bare patch on top of its nose.
  const n = new THREE.Vector3(...k.joints.neck);
  const root = onHead(k, 0, -0.12).add(n);
  const ridge = root.clone().lerp(new THREE.Vector3(...snout.nose).add(n), 0.4);
  decal(k, { bone: 'neck', from: ridge.add(new THREE.Vector3(0, -0.03, 0)), dir: new THREE.Vector3(0, 1, 0.15), r: 0.032, stretch: 1.45, along: new THREE.Vector3(0, -0.3, 1), color: mix(c.coat, CHARCOAL, 0.5), name: 'ridge' });
  k.marks = {
    base: c.coat,
    marks: [
      { color: dark, f: region(k, 'earL', 'earR') },
      { color: dark, f: all(region(k, /^leg/), (q) => q.p.y - 0.05) },
    ],
  };
  return {};
};

const wolf: Recipe = (k, c) => {
  const pale = mix(c.coat, CREAM, 0.75);
  const dark = mix(c.coat, CHARCOAL, 0.45);
  const saddle = mix(c.coat, CHARCOAL, 0.3);
  // Rangy and proud: a deep chest under a thick ruff, a long snout, tall pointed ears, a pale mask round the
  // muzzle and throat, a darker saddle over the back, long legs and a bushy tail carried low.
  k.joints.neck = [0, 0.66, 0.05];
  k.joints.shoulder = [0.11, 0.53, 0.13];
  k.joints.hip = [0.1, 0.22, -0.07];
  k.joints.tail = [0, 0.25, -0.18];
  torso(k, {
    belly: [
      [0, 0.36, -0.1],
      [0.18, 0.22, 0.18],
    ],
    chest: [
      [0, 0.5, 0.04],
      [0.16, 0.16, 0.15],
    ],
    haunch: [
      [0.11, 0.22, -0.1],
      [0.1, 0.13, 0.15],
    ],
    ruff: [
      [0, 0.61, 0.04],
      [0.16, 0.1, 0.14],
    ],
    melt: 0.2,
  });
  headForm(k, {
    r: [0.18, 0.155, 0.175],
    at: [0, 0.14, 0.06],
    cheeks: [
      [0.13, -0.05, -0.01],
      [0.09, 0.08, 0.09],
    ],
  });
  const snout = snoutForm(k, { dy: -0.27, len: 0.15, ra: 0.078, rb: 0.048, drop: 0.04, squash: [1, 0.85, 1], thin: true });
  earForms(k, { x: 0.55, y: 0.72, w: 0.08, h: 0.19, d: 0.045, splay: 0.15, rake: 0.08, cup: 0.5, notch: true });
  armForms(k, { len: 0.33, r0: 0.056, r1: 0.047, paw: [0.05, 0.038, 0.06], fwd: 0.33, out: 0.15 });
  legForms(k, { r0: 0.066, r1: 0.05, foot: [0.052, 0.038, 0.082] });
  const tailAt = tailForm(k, tailPath(0.55, [0, -0.65, -1], [0.2, -0.25, 0], 0.11, [0.35, 0.75, 0.95, 1, 0.9, 0.7, 0.4]));
  useSurface(k);
  eyes(k, { x: 0.4, y: 0.14, size: 0.85, wide: 1.4, slant: 0.28, color: '#1a1410', ring: '#c8963a', ringSize: 1.25 });
  nose(k, INK, onSnout(k, snout.nose), 0.028, 0.02);
  whiskers(k, c.coat, { len: 0.1, back: 0.035 });
  // Pale brow spots over the eyes.
  faceDabs(k, [[0.27, 0.43, 0.024]], pale, 'brow', { stretch: 1.3, along: [1, 0.35, 0] });
  const ears = ['earL', 'earR'].map((e) => earMarks(k, e));
  const head = unitOf(k, 'head');
  k.marks = {
    base: c.coat,
    marks: [
      { color: pale, f: any(...ears.map((e) => e.inner)) },
      { color: dark, f: any(...ears.map((e) => e.back)) },
      // A pale mask: under the muzzle, round the jaw and cheeks, down the throat and chest.
      { color: pale, f: all(region(k, 'muzzle'), (q) => q.p.y - (snout.mid(q.p) + snout.r * 0.2)) },
      { color: pale, f: all(region(k, 'head', 'cheekL', 'cheekR'), (q) => head(q).y + 0.12 + Math.abs(head(q).x) * 0.15, (q) => -0.2 - head(q).z) },
      { color: pale, f: all(region(k, 'chest', 'ruff', 'belly'), (q) => -q.p.z, (q) => segDist(q.p.x, q.p.y, 0, 0.32, 0, 0.62).d - 0.09) },
      // A darker saddle over the back from the shoulders to the rump, and a dark tip to the tail.
      { color: saddle, f: all(region(k, 'belly', 'chest', 'ruff', 'haunchL', 'haunchR'), (q) => Math.atan2(Math.abs(q.p.x), -0.06 - q.p.z) - 0.55 - (q.p.y - 0.3) * 1.7, (q) => 0.3 - q.p.y) },
      { color: dark, f: all(region(k, /^tail\d/), (q) => 0.85 - tailAt(q.p)) },
    ],
  };
  return {};
};

const bear: Recipe = (k, c) => {
  const muzzleC = mix(c.coat, '#e2c8a0', 0.55);
  const dark = mix(c.coat, CHARCOAL, 0.35);
  // Big, round and soft: a heavy body, a broad head with small round ears, a pale short muzzle with a big dark
  // nose, thick arms and legs with darker paws, and a little stub of a tail.
  k.joints.neck = [0, 0.6, 0.05];
  k.joints.shoulder = [0.18, 0.49, 0.1];
  k.joints.hip = [0.12, 0.18, -0.04];
  k.joints.tail = [0, 0.22, -0.23];
  torso(k, {
    belly: [
      [0, 0.33, -0.04],
      [0.25, 0.27, 0.24],
    ],
    chest: [
      [0, 0.5, 0.03],
      [0.21, 0.16, 0.19],
    ],
    haunch: [
      [0.14, 0.19, -0.06],
      [0.11, 0.12, 0.15],
    ],
    melt: 0.2,
  });
  headForm(k, {
    r: [0.2, 0.18, 0.18],
    at: [0, 0.13, 0.06],
    cheeks: [
      [0.12, -0.06, 0.03],
      [0.09, 0.08, 0.09],
    ],
  });
  const snout = snoutForm(k, { dy: -0.26, len: 0.08, ra: 0.085, rb: 0.07, drop: 0.02, squash: [1.1, 0.85, 1] });
  earForms(k, { x: 0.62, y: 0.68, w: 0.06, h: 0.07, d: 0.035, round: true, splay: 0.3, rake: 0.1, cup: 0.5 });
  armForms(k, { len: 0.28, r0: 0.075, r1: 0.064, paw: [0.064, 0.048, 0.07], fwd: 0.35, out: 0.22 });
  legForms(k, { r0: 0.08, r1: 0.068, foot: [0.068, 0.046, 0.09] });
  const j = k.joints.tail;
  sculptOf(k).add(ellipsoid('tail', [j[0], j[1] + 0.01, j[2] - 0.02], [0.045, 0.045, 0.04], { k: 0.025, anchor: j, reach: 0.07, name: 'stub' }));
  useSurface(k);
  eyes(k, { x: 0.36, y: 0.12, size: 0.8, wide: 1, slant: 0.05, color: '#120e0c' });
  nose(k, INK, onSnout(k, snout.nose), 0.036, 0.026);
  mouth(k, { w: 0.14, y: -0.56, curve: 0.06, r: 0.006, out: 0.004 });
  const ears = ['earL', 'earR'].map((e) => earMarks(k, e));
  k.marks = {
    base: c.coat,
    marks: [
      { color: muzzleC, f: any(...ears.map((e) => e.inner)) },
      { color: muzzleC, f: region(k, 'muzzle') },
      { color: mix(c.coat, muzzleC, 0.35), f: frontOval(k, ['belly', 'chest'], 0, 0.33, 0.15, 0.22) },
      // Darker legs: socks well up the arms, and up over the feet.
      { color: dark, f: any(sockOf(k, 'L', 0.55), sockOf(k, 'R', 0.55)) },
      { color: dark, f: all(region(k, /^leg/), (q) => q.p.y - 0.11) },
    ],
  };
  return {};
};

const redpanda: Recipe = (k, c) => {
  const white = '#f4efe6';
  const dark = mix(c.coat, '#2a1612', 0.72);
  const band = mix(c.coat, '#f0c890', 0.5);
  // Rusty red and round: a pale face with white cheeks and brows and dark tear stripes, round white-rimmed ears,
  // dark legs and belly, and a big bushy tail ringed in light and dark.
  k.joints.neck = [0, 0.54, 0.05];
  k.joints.shoulder = [0.14, 0.43, 0.11];
  k.joints.hip = [0.1, 0.17, -0.05];
  k.joints.tail = [0, 0.2, -0.18];
  torso(k, {
    belly: [
      [0, 0.3, -0.05],
      [0.2, 0.23, 0.19],
    ],
    chest: [
      [0, 0.43, 0.03],
      [0.16, 0.13, 0.15],
    ],
    melt: 0.2,
  });
  headForm(k, {
    r: [0.2, 0.165, 0.17],
    at: [0, 0.13, 0.05],
    cheeks: [
      [0.12, -0.06, 0.03],
      [0.09, 0.08, 0.09],
    ],
  });
  const snout = snoutForm(k, { dy: -0.28, len: 0.06, ra: 0.07, rb: 0.055, drop: 0.02, squash: [1.1, 0.85, 1] });
  earForms(k, { x: 0.62, y: 0.66, w: 0.07, h: 0.1, d: 0.035, round: true, splay: 0.35, rake: 0.1, cup: 0.5 });
  armForms(k, { len: 0.26, r0: 0.05, r1: 0.042, paw: [0.046, 0.035, 0.054], fwd: 0.35, out: 0.15 });
  legForms(k, { r0: 0.058, r1: 0.048, foot: [0.05, 0.035, 0.072] });
  const tailAt = tailForm(k, tailPath(0.6, [0, -0.3, -1], [0.5, 0.9, 0], 0.1, [0.6, 0.9, 1, 1, 0.95, 0.85, 0.65]));
  useSurface(k);
  eyes(k, { x: 0.38, y: 0.08, size: 0.9, wide: 1, slant: 0.1, color: '#140e0c' });
  nose(k, INK, onSnout(k, snout.nose), 0.026, 0.019);
  whiskers(k, c.coat, { len: 0.09, color: '#f0e6da' });
  // White brows over the eyes.
  faceDabs(k, [[0.33, 0.43, 0.026]], white, 'brow', { stretch: 1.55, along: [1, 0.3, 0] });
  const ears = ['earL', 'earR'].map((e) => earMarks(k, e));
  const head = unitOf(k, 'head');
  k.marks = {
    base: c.coat,
    marks: [
      // Ears white inside.
      { color: white, f: any(...ears.map((e) => e.inner)) },
      // A dark tear stripe down from each eye, then white cheeks, brows and muzzle.
      { color: dark, f: all(region(k, 'head', 'cheekL', 'cheekR'), (q) => Math.abs(Math.abs(head(q).x) - 0.4) - 0.07, (q) => head(q).y - 0.0, (q) => -0.35 - head(q).y, (q) => 0.2 - head(q).z) },
      { color: white, f: region(k, 'muzzle') },
      { color: white, f: all(region(k, 'cheekL', 'cheekR', 'head'), (q) => head(q).y + 0.05, (q) => 0.25 - head(q).z) },
      // Dark legs, arms and belly.
      { color: dark, f: region(k, 'armL', 'armR', 'foreL', 'foreR', 'armLPaw', 'armRPaw', /^leg/) },
      { color: dark, f: frontOval(k, ['belly', 'chest'], 0, 0.28, 0.14, 0.2) },
      // Rings round the tail.
      { color: band, f: all(region(k, /^tail\d/), (q) => 0.4 - Math.sin(tailAt(q.p) * Math.PI * 7)) },
    ],
  };
  return {};
};

const quokka: Recipe = (k, c) => {
  const pale = mix(c.coat, CREAM, 0.55);
  const dark = mix(c.coat, CHARCOAL, 0.55);
  // The happiest marsupial: a round little body sat up on big hind feet, a round face with a broad smile,
  // small round ears, little forepaws held up, and a short thick tail behind.
  k.joints.neck = [0, 0.52, 0.05];
  k.joints.shoulder = [0.12, 0.42, 0.12];
  k.joints.hip = [0.1, 0.15, -0.04];
  k.joints.tail = [0, 0.17, -0.19];
  torso(k, {
    belly: [
      [0, 0.27, -0.04],
      [0.2, 0.23, 0.19],
    ],
    chest: [
      [0, 0.41, 0.03],
      [0.15, 0.13, 0.14],
    ],
    haunch: [
      [0.12, 0.15, -0.06],
      [0.1, 0.11, 0.15],
    ],
    melt: 0.2,
  });
  headForm(k, {
    r: [0.18, 0.16, 0.16],
    at: [0, 0.13, 0.05],
    // Round cheeks either side of the smile.
    cheeks: [
      [0.1, -0.07, 0.05],
      [0.08, 0.075, 0.08],
    ],
  });
  const snout = snoutForm(k, { dy: -0.26, len: 0.025, ra: 0.08, rb: 0.068, drop: 0.01, squash: [1.15, 0.85, 1] });
  earForms(k, { x: 0.66, y: 0.62, w: 0.048, h: 0.055, d: 0.028, round: true, splay: 0.4, rake: 0.1, cup: 0.5 });
  armForms(k, { len: 0.17, r0: 0.042, r1: 0.035, paw: [0.038, 0.03, 0.045], fwd: 0.9, out: 0.1 });
  legForms(k, { r0: 0.06, r1: 0.05, foot: [0.05, 0.035, 0.12], fwd: 0.07 });
  tailForm(k, tailPath(0.3, [0, -0.7, -1], [0, 0.2, 0], 0.06, [1, 0.85, 0.65, 0.45]));
  useSurface(k);
  eyes(k, { x: 0.38, y: 0.12, size: 0.85, wide: 1, slant: 0.05, color: '#140e0c' });
  nose(k, dark, onSnout(k, snout.nose), 0.026, 0.018);
  whiskers(k, c.coat, { len: 0.07 });
  // The famous smile: a broad upturned line under the nose, from cheek to cheek.
  mouth(k, { w: 0.42, y: -0.42, curve: 0.2, r: 0.011, out: 0.004 });
  const ears = ['earL', 'earR'].map((e) => earMarks(k, e));
  k.marks = {
    base: c.coat,
    marks: [
      { color: mix(c.coat, '#e0a0a0', 0.5), f: any(...ears.map((e) => e.inner)) },
      { color: pale, f: region(k, 'muzzle') },
      { color: pale, f: frontOval(k, ['belly', 'chest'], 0, 0.3, 0.13, 0.2) },
      { color: dark, f: all(region(k, /^leg/), (q) => q.p.y - 0.04) },
    ],
  };
  return {};
};

const ferret: Recipe = (k, c) => {
  const pale = mix(c.coat, '#fbf4e6', 0.7);
  const points = mix(c.coat, '#3a2a20', 0.72);
  // Long, low and bendy, standing up to look about: a slim body, a small pointed head with little round ears,
  // a dark bandit mask over a pale face, dark legs and a long dark tail.
  k.joints.neck = [0, 0.68, 0.06];
  k.joints.shoulder = [0.11, 0.56, 0.09];
  k.joints.hip = [0.085, 0.16, -0.03];
  k.joints.tail = [0, 0.18, -0.15];
  torso(k, {
    belly: [
      [0, 0.32, -0.03],
      [0.15, 0.28, 0.15],
    ],
    chest: [
      [0, 0.55, 0.03],
      [0.125, 0.15, 0.13],
    ],
    melt: 0.22,
  });
  const headAt: Vec3 = [0, 0.1, 0.06];
  headForm(k, { r: [0.14, 0.12, 0.145], at: headAt });
  const snout = snoutForm(k, { dy: -0.2, len: 0.08, ra: 0.07, rb: 0.05, drop: 0.02, squash: [1.15, 0.85, 1] });
  earForms(k, { x: 0.74, y: 0.55, w: 0.042, h: 0.046, d: 0.026, round: true, splay: 0.5, rake: 0.1, cup: 0.5 });
  armForms(k, { len: 0.17, r0: 0.036, r1: 0.03, paw: [0.036, 0.026, 0.04], fwd: 0.7, out: 0.15 });
  legForms(k, { r0: 0.045, r1: 0.038, foot: [0.045, 0.022, 0.075] });
  const tailAt = tailForm(k, tailPath(0.46, [0, -0.6, -1], [0.3, 0.42, 0], 0.058, [1, 0.95, 0.85, 0.72, 0.55]));
  useSurface(k);
  eyes(k, { x: 0.4, y: 0.12, size: 0.85, wide: 1, slant: 0.08, color: '#120e10' });
  nose(k, '#d9878a', onSnout(k, snout.nose), 0.024, 0.018);
  whiskers(k, c.coat, { len: 0.09, color: '#e8ddd0' });
  mouth(k, { w: 0.14, y: -0.5, curve: 0.06, r: 0.006 });
  const head = unitOf(k, 'head');
  const ears = ['earL', 'earR'].map((e) => earMarks(k, e));
  k.marks = {
    base: c.coat,
    marks: [
      { color: mix(pale, '#e8a0a0', 0.25), f: any(...ears.map((e) => e.inner)) },
      // The mask: a dark patch round each eye, either side of a pale stripe down the middle of the face.
      { color: points, f: all(region(k, 'head', 'muzzle'), (q) => Math.abs(head(q).y - 0.14) - 0.17, (q) => 0.13 - Math.abs(head(q).x), (q) => 0.1 - head(q).z) },
      { color: pale, f: region(k, 'muzzle') },
      { color: pale, f: all(region(k, 'head'), (q) => 0.3 - head(q).z) },
      { color: pale, f: region(k, 'earL', 'earR') },
      { color: points, f: region(k, /^arm/, /^fore/) },
      { color: points, f: region(k, /^leg/) },
      { color: points, f: all(region(k, /^tail\d/), (q) => 0.2 - tailAt(q.p)) },
    ],
  };
  return {};
};

const dugong: Recipe = (k, c) => {
  const belly = mix(c.coat, '#f4ebe0', 0.5);
  const dark = mix(c.coat, CHARCOAL, 0.25);
  // A gentle, smiley sea cow: a big soft round teardrop standing on its tail fluke, little round flippers, a round
  // head with big kind eyes and rosy cheeks, and a soft round muzzle like a big button nose, with a bristly top lip
  // and a happy smile under it.
  k.joints.neck = [0, 0.55, 0.06];
  k.joints.shoulder = [0.2, 0.42, 0.07];
  k.joints.hip = [0.07, 0.1, -0.05];
  k.joints.tail = [0, 0.12, -0.2];
  torso(k, {
    belly: [
      [0, 0.3, -0.02],
      [0.255, 0.29, 0.235],
    ],
    chest: [
      [0, 0.47, 0.03],
      [0.2, 0.15, 0.19],
    ],
    melt: 0.2,
  });
  headForm(k, { r: [0.19, 0.17, 0.175], at: [0, 0.14, 0.04], melt: 0.18 });
  const snout = snoutForm(k, { dy: -0.3, len: 0.06, ra: 0.095, rb: 0.09, drop: 0.06, squash: [1.12, 0.92, 1] });
  // The soft round pad at the end of the muzzle, facing forward and a little down: the dugong's big bristly lip.
  const n = k.joints.neck;
  const tip = plus(n, snout.nose);
  const lipAt: Vec3 = [tip[0], tip[1] - 0.04, tip[2] - 0.035];
  sculptOf(k).add(ellipsoid('neck', lipAt, [0.092, 0.068, 0.064], { rot: [0.4, 0, 0], k: 0.04, name: 'lip' }));
  wingForms(k, { len: 0.22, w: 0.085, d: 0.036, taper: 0.85, fwd: 0.25, out: 0.4 });
  // The tail fluke, as two flat lobes splayed out behind: what it stands and shuffles on.
  legForms(k, { r0: 0.06, r1: 0.055, foot: [0.12, 0.024, 0.08], fwd: -0.08 });
  useSurface(k);
  eyes(k, { x: 0.46, y: 0.24, size: 1.2, wide: 1, slant: -0.06, color: '#120e10', blush: false });
  // Rosy cheeks either side of the muzzle, under the eyes.
  for (const side of [-1, 1]) {
    const at = onHead(k, side * 0.6, -0.12).add(new THREE.Vector3(...n));
    (k.blush ??= []).push({ at: v3(at), n: v3(headNormal(k, side * 0.6, -0.12)), r: 0.05 });
  }
  // Two crescent nostrils up on top of the end of the muzzle.
  for (const side of [-1, 1]) {
    decal(k, { bone: 'neck', from: new THREE.Vector3(...tip).add(new THREE.Vector3(0, -0.04, -0.05)), dir: new THREE.Vector3(side * 0.45, 1, 0.6), r: 0.011, stretch: 1.7, along: new THREE.Vector3(1, 0, -0.4 * side), color: mix(c.coat, '#2a2224', 0.65), sides: 8, name: `nostril${side > 0 ? 'L' : 'R'}` });
  }
  k.nose = v3(new THREE.Vector3(...snout.nose).add(new THREE.Vector3(0, -0.02, 0.01)));
  whiskers(k, c.coat, { len: 0.04, sweep: 0.05, drop: 0.035, color: mix(c.coat, '#f2ece2', 0.6) });
  // A happy smile across the bottom of the lip.
  const lip = new THREE.Vector3(...lipAt);
  const smile = [-1, -0.6, -0.2, 0.2, 0.6, 1].map((t) => surfaceHit(k, lip, new THREE.Vector3(t * 0.75, -0.62 + 0.3 * t * t, 1))?.p);
  if (smile.every(Boolean)) decalLine(k, { bone: 'neck', pts: smile as THREE.Vector3[], w: 0.0055, color: '#2a2224' });
  k.marks = {
    base: c.coat,
    marks: [
      { color: mix(belly, c.coat, 0.35), f: region(k, 'lip') },
      { color: belly, f: frontOval(k, ['belly', 'chest'], 0, 0.3, 0.18, 0.27) },
      { color: mix(c.coat, CHARCOAL, 0.12), f: region(k, 'armL', 'armR', 'armLPaw', 'armRPaw') },
      { color: dark, f: region(k, /^leg/) },
    ],
  };
  return { aquatic: true };
};

const seacucumber: Recipe = (k, c) => {
  const sole = mix(c.coat, '#f2dcc0', 0.5);
  const spike = mix(c.coat, '#ffb040', 0.6);
  const dark = mix(c.coat, '#2a1410', 0.25);
  // A long knobbly sausage lying along the sea floor like the real thing, covered in soft pointed spikes with
  // orange tips, its front end lifted a little to look about. It inches along on its belly, and a little tube
  // foot comes out to hold things, as the snail's tendril does.
  k.joints.neck = [0, 0.25, 0.3];
  k.joints.shoulder = [0.08, 0.17, 0.33];
  k.joints.tail = [0, 0.1, -0.38];
  bone(k, 'rear', 'body', [0, 0.1, -0.12]);
  const sc = sculptOf(k);
  // The body: a fat middle, a tapering back end on its own bone so it can stretch and draw up, and the front
  // rising into the head.
  sc.add(rod('body', [0, 0.14, -0.12], [0, 0.16, 0.14], 0.15, 0.14, { squash: [1, 0.9, 1], name: 'trunk' }));
  sc.add(rod('rear', [0, 0.1, -0.42], [0, 0.14, -0.12], 0.09, 0.15, { squash: [1, 0.9, 1], k: 0.07, anchor: [0, 0.13, -0.15], reach: 0.22, name: 'tailEnd' }));
  sc.add(rod('body', [0, 0.17, 0.12], [0, 0.24, 0.28], 0.14, 0.125, { k: 0.08, anchor: [0, 0.16, 0.12], reach: 0.18, name: 'neck' }));
  k.seat = 0;
  headForm(k, { r: [0.13, 0.12, 0.12], at: [0, 0.04, 0.05], melt: 0.1 });
  useSurface(k);
  eyes(k, { x: 0.36, y: 0.2, size: 0.95, wide: 1, slant: 0, color: '#1a1214' });
  mouth(k, { w: 0.18, y: -0.25, curve: 0.08, r: 0.006 });
  arms(k, { color: c.coat, len: 0.12, r: 0.03, rightOnly: true });
  k.front = 0.47;
  // Rows of soft spikes along the back and down the sides, crisp pieces so they stay pointed, each on the bone
  // of the part of the body it grows from.
  const axis = (z: number) => {
    if (z < -0.12) {
      const t = (z + 0.42) / 0.3;
      return { y: 0.1 + 0.04 * t, r: 0.09 + 0.06 * t, bone: 'rear' };
    }
    if (z < 0.14) return { y: 0.14 + (0.02 * (z + 0.12)) / 0.26, r: 0.15 - (0.01 * (z + 0.12)) / 0.26, bone: 'body' };
    return { y: 0.17 + (0.07 * (z - 0.14)) / 0.14, r: 0.14, bone: 'body' };
  };
  let n = 0;
  for (let z = -0.36; z <= 0.18; z += 0.075) {
    const row = Math.round((z + 0.36) / 0.075);
    const { y, r, bone: bn } = axis(z);
    const count = r > 0.12 ? 7 : 5;
    for (let i = 0; i < count; i++) {
      // From down one side, over the top, to down the other, every other row shifted half a step.
      const a = -1.75 + (3.5 * (i + (row % 2 ? 0.5 : 0) + 0.25)) / count;
      if (Math.abs(a) > 1.75) continue;
      const dir = new THREE.Vector3(Math.sin(a), Math.cos(a), 0).normalize();
      const hit = surfaceHit(k, new THREE.Vector3(0, y, z), dir);
      if (!hit) continue;
      const len = (0.06 + ((n * 37) % 10) * 0.004) * (r / 0.15) + 0.015;
      const root = hit.p.clone().addScaledVector(hit.n, -0.02);
      const mid = hit.p.clone().addScaledVector(hit.n, len * 0.45);
      const tip = hit.p.clone().addScaledVector(hit.n, len);
      piece(k, { bone: bn, pts: [root, mid, tip], w: [0.026, 0.017, 0], t: [0.026, 0.017, 0], across: new THREE.Vector3(0, 0, 1), colors: [c.coat, spike], name: `spike${n++}` });
    }
  }
  k.marks = {
    base: c.coat,
    marks: [
      // A paler belly it creeps along on, and the top a shade darker.
      { color: sole, f: all(region(k, 'trunk', 'tailEnd', 'neck', 'head'), (q) => q.p.y - 0.055) },
      { color: dark, f: all(region(k, 'trunk', 'tailEnd'), (q) => 0.24 - q.p.y) },
    ],
  };
  return { aquatic: true, legs: 'none', tendril: true };
};

const ibis: Recipe = (k, c) => {
  const black = '#1f1d22';
  const plume = '#26242a';
  // The Australian white ibis: a white bird on long black legs, its bare black head and neck ending in a long
  // down-curved beak, black tips to its wings and a scruffy black plume over the tail. Cut finer than most, so the slender beak survives.
  k.step = 0.03;
  k.joints.neck = [0, 0.86, 0.1];
  k.joints.shoulder = [0.14, 0.6, 0.0];
  k.joints.hip = [0.065, 0.34, -0.02];
  k.joints.tail = [0, 0.4, -0.2];
  torso(k, {
    belly: [
      [0, 0.47, -0.04],
      [0.165, 0.16, 0.2],
    ],
    chest: [
      [0, 0.66, 0.06],
      [0.09, 0.18, 0.09],
    ],
    melt: 0.18,
  });
  const headAt: Vec3 = [0, 0.07, 0.04];
  headForm(k, { r: [0.105, 0.1, 0.115], at: headAt, melt: 0.12 });
  // The beak: long and curving down, thinning to the tip.
  const n = k.joints.neck;
  const root = onHead(k, 0, -0.08, -0.02);
  const rel: Vec3[] = [
    [0, 0, -0.02],
    [0, -0.008, 0.07],
    [0, -0.03, 0.15],
    [0, -0.07, 0.225],
    [0, -0.125, 0.285],
    [0, -0.19, 0.32],
  ];
  const pts = rel.map((r) => plus(plus(n, v3(root)), r));
  chain(k, 'neck', pts, [0.03, 0.026, 0.022, 0.019, 0.016, 0.013], 'beak');
  wingForms(k, { len: 0.34, w: 0.13, d: 0.035, fwd: -0.05, out: 0.2 });
  // Long thin legs, and a fan of tail feathers under a scruffy plume.
  legForms(k, { r0: 0.028, r1: 0.022, foot: [0.045, 0.018, 0.08], fwd: 0.04 });
  finForm(k, 'tail', k.joints.tail, { len: 0.14, w: 0.09, d: 0.034, rot: [-(Math.PI / 2 + 0.5), 0, 0], name: 'tailFan' });
  useSurface(k);
  // The plume: crisp black feathers drooping from the lower back over the tail, fanned a little. They're on the
  // bone the rig folds away inside the body under a cape or a backpack (as the kaiju's plates are).
  bone(k, 'backPlates', 'body', [0, 0.48, -0.16]);
  [-0.05, -0.025, 0, 0.025, 0.05].forEach((x, i) => {
    const l = 1 - Math.abs(x) * 3 + (i % 2) * 0.08;
    const pts = [new THREE.Vector3(x, 0.49, -0.17), new THREE.Vector3(x * 1.3, 0.46, -0.27), new THREE.Vector3(x * 1.6, 0.46 - 0.08 * l, -0.27 - 0.07 * l), new THREE.Vector3(x * 1.8, 0.46 - 0.17 * l, -0.28 - 0.1 * l)];
    piece(k, { bone: 'backPlates', pts, w: [0.02, 0.022, 0.015, 0], t: [0.008, 0.007, 0.005, 0], across: new THREE.Vector3(1, 0, 0), colors: [plume, plume, plume], name: `plume${i}` });
  });
  eyes(k, { x: 0.42, y: 0.12, size: 0.8, wide: 1, slant: 0, color: '#120e10', ring: '#9a9aa4', ringSize: 1.45, out: 0.005 });
  k.nose = v3(new THREE.Vector3(...pts[pts.length - 1]).sub(new THREE.Vector3(...n)));
  k.marks = {
    base: c.coat,
    marks: [
      { color: black, f: region(k, /^beak/) },
      { color: black, f: region(k, 'head') },
      { color: black, f: all(region(k, 'chest'), (q) => 0.74 - q.p.y) },
      { color: black, f: region(k, /^leg/) },
      // Black tips to the folded wings.
      { color: plume, f: all(region(k, 'armLPaw', 'armRPaw'), (q) => q.p.y - 0.37) },
    ],
  };
  return {};
};

const crab: Recipe = (k, c) => {
  const pale = mix(c.coat, '#fbeee0', 0.6);
  const tipColor = mix(c.coat, CHARCOAL, 0.55);
  const eyeStalk = mix(c.coat, '#f4e2d0', 0.25);
  // A round shore crab standing up: a wide shell for a body with a little face on its front, eyes on stalks, two
  // big claws, and three spindly legs a side that scuttle along with its feet. Cut a little finer, for the legs.
  k.step = 0.036;
  k.joints.neck = [0, 0.46, 0.06];
  k.joints.shoulder = [0.22, 0.34, 0.08];
  k.joints.hip = [0.1, 0.13, 0];
  k.joints.tail = [0, 0.15, -0.14];
  torso(k, {
    belly: [
      [0, 0.28, 0],
      [0.27, 0.19, 0.17],
    ],
    chest: [
      [0, 0.38, 0.02],
      [0.24, 0.12, 0.15],
    ],
    melt: 0.14,
  });
  headForm(k, { r: [0.13, 0.085, 0.11], at: [0, 0.0, 0.03], melt: 0.12 });
  const sc = sculptOf(k);
  // The claws: stout arms ending in a big round palm, with a fixed finger and a moving one.
  armForms(k, { len: 0.16, r0: 0.045, r1: 0.04, paw: [0.07, 0.06, 0.075], fwd: 0.55, out: 0.42 });
  for (const p of k.paws ?? []) {
    const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(...p.rot));
    const at = new THREE.Vector3(...p.at);
    const fwd = new THREE.Vector3(0, 0, 1).applyQuaternion(q);
    const upv = new THREE.Vector3(0, 1, 0).applyQuaternion(q);
    for (const [dy, tilt, nm] of [
      [0.025, -0.35, 'Top'],
      [-0.025, 0.3, 'Low'],
    ] as const) {
      const base = at.clone().addScaledVector(fwd, p.r[2] * 0.75).addScaledVector(upv, dy);
      sc.add(pyramid(p.bone, v3(base), 0.042, 0.1, 0.042, { rot: [Math.PI / 2 + p.rot[0] + tilt, 0, p.rot[2]], k: 0.04, round: 0.02, anchor: v3(base), reach: 0.05, name: `pincer${nm}${p.bone}`, thin: true }));
    }
  }
  legForms(k, { r0: 0.04, r1: 0.032, foot: [0.035, 0.02, 0.05], fwd: 0.02 });
  // Three spindly legs a side: crisp jointed pieces (the soft surface would fold at their knees), on the feet's
  // bones so they scuttle along with them.
  const legTone = mix(c.coat, CHARCOAL, 0.12);
  for (const side of [-1, 1]) {
    const bn = side > 0 ? 'legL' : 'legR';
    [0.07, 0, -0.07].forEach((dz, i) => {
      const pts = [
        new THREE.Vector3(side * 0.17, 0.22 + i * 0.02, dz),
        new THREE.Vector3(side * 0.35, 0.19 + i * 0.015, dz * 1.6),
        new THREE.Vector3(side * 0.44, 0.015, dz * 2),
      ];
      piece(k, { bone: bn, pts, w: [0.03, 0.026, 0], t: [0.028, 0.022, 0], across: new THREE.Vector3(0, 0, 1), colors: [c.coat, legTone], name: `side${bn}${i}` });
    });
  }
  useSurface(k);
  mouth(k, { w: 0.2, y: -0.45, curve: 0.09, r: 0.006 });
  // Eyes on stalks, each on its own bone so they can look about separately.
  const tipRel = new THREE.Vector3(0, 0.12, 0.02);
  for (const side of [-1, 1]) {
    const nm = side > 0 ? 'L' : 'R';
    const base = onHead(k, side * 0.4, 0.62, -0.015);
    bone(k, `stalk${nm}`, 'neck', v3(base));
    const tip = tipRel.clone().add(new THREE.Vector3(side * 0.02, 0, 0));
    bone(k, `blink${nm}`, `stalk${nm}`, v3(tip));
    const stalk = part(k, `stalk${nm}`, `stalk${nm}`);
    pillar(stalk, k.rnd, [0, 0, 0], v3(tip), 0.018, 0.015, eyeStalk, { base: 'limb5' });
    solid(stalk, k.rnd, { base: 'ico1', r: 0.034, pos: v3(tip), jitter: 0.04, color: eyeStalk });
    const eye = part(k, `eye${nm}`, `stalk${nm}`, { bone: `blink${nm}`, eyes: true });
    const m = frame(tip.clone().add(new THREE.Vector3(0, 0.004, 0.026)));
    solid(eye, k.rnd, { base: 'ico1', r: [0.021, 0.023, 0.014], matrix: m, jitter: 0.02, color: INK, tone: 0.1 });
    solid(eye, k.rnd, { base: 'ico0', r: 0.007, matrix: inside(m, [0.006, 0.008, 0.011]), jitter: 0.01, color: '#fbf6ec', tone: 0 });
  }
  k.blink = ['blinkL', 'blinkR'];
  // Pale freckles over the top and back of the shell.
  speckle(k, 'body', [0, 0.3, 0], [0.27, 0.2, 0.17], 48, (d) => d.y > 0.1 && d.z < 0.25, 0.016, mix(c.coat, '#fbeee0', 0.42), 'freckle');
  const eyeAt = onHead(k, 0.4, 0.62).add(tipRel);
  k.eyeY = eyeAt.y;
  k.eyeX = eyeAt.x + 0.02;
  k.eyeR = 0.034;
  k.eyeZ = eyeAt.z + 0.035;
  k.marks = {
    base: c.coat,
    marks: [
      { color: tipColor, f: region(k, /^pincer/) },
      { color: pale, f: frontOval(k, ['belly'], 0, 0.2, 0.17, 0.12) },
      { color: mix(c.coat, CHARCOAL, 0.2), f: all(region(k, /^leg/), (q) => q.p.y - 0.06) },
    ],
  };
  return { aquatic: true };
};

/** Where a turtle's shell plates sit on its dome (directions from the dome's middle): three down the middle, three a side. */
const SCUTES: [number, number, number][] = [
  [0, 0.62, -0.78],
  [0, 0.02, -1],
  [0, -0.6, -0.8],
  [0.66, 0.52, -0.54],
  [-0.66, 0.52, -0.54],
  [0.74, -0.04, -0.67],
  [-0.74, -0.04, -0.67],
  [0.64, -0.58, -0.5],
  [-0.64, -0.58, -0.5],
];

const turtle: Recipe = (k, c) => {
  const skin = mix(c.coat, '#b8c488', 0.4);
  const plastron = '#eadcb0';
  const seam = mix(c.coat, '#2a2014', 0.55);
  const plate = mix(c.coat, '#e8c87a', 0.18);
  // A sea turtle standing up: a domed shell on its back, plated in a pattern of scutes, a pale front plate, a
  // round head with a short beak, broad front flippers and stumpy back feet.
  k.joints.neck = [0, 0.56, 0.08];
  k.joints.shoulder = [0.17, 0.44, 0.07];
  k.joints.hip = [0.09, 0.13, -0.01];
  k.joints.tail = [0, 0.14, -0.2];
  torso(k, {
    belly: [
      [0, 0.3, 0.01],
      [0.2, 0.27, 0.17],
    ],
    chest: [
      [0, 0.47, 0.04],
      [0.16, 0.13, 0.14],
    ],
    melt: 0.18,
  });
  const sc = sculptOf(k);
  // The shell: a dome over the back, melted only a little so it reads as its own hard plate, with a lip all round,
  // and its plates standing a little proud of it with grooves between.
  const domeC = new THREE.Vector3(0, 0.35, -0.07);
  const domeR = new THREE.Vector3(0.27, 0.31, 0.19);
  sc.add(ellipsoid('body', v3(domeC), v3(domeR), { k: 0.03, name: 'shell' }));
  sc.add(ellipsoid('body', [0, 0.35, 0.01], [0.275, 0.315, 0.07], { k: 0.02, name: 'shellRim' }));
  SCUTES.forEach(([x, y, z], i) => {
    const d = new THREE.Vector3(x, y, z).normalize();
    const at = domeC.clone().add(new THREE.Vector3(d.x * domeR.x, d.y * domeR.y, d.z * domeR.z));
    const nrm = new THREE.Vector3(d.x / domeR.x, d.y / domeR.y, d.z / domeR.z).normalize();
    const e = new THREE.Euler().setFromQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), nrm));
    sc.add(ellipsoid('body', v3(at.addScaledVector(nrm, -0.006)), [0.112, 0.112, 0.032], { rot: [e.x, e.y, e.z], k: 0.012, name: `scute${i}` }));
  });
  // Where two plates meet: about as near the one as the other.
  const scuteIds = sc.shapes.flatMap((s, i) => (/^scute/.test(s.name ?? '') ? [i] : []));
  const seamLine = (q: Probe) => {
    let a = Infinity;
    let b = Infinity;
    for (const i of scuteIds) {
      const d = q.dist(i);
      if (d < a) {
        b = a;
        a = d;
      } else if (d < b) b = d;
    }
    return b - a - 0.012;
  };
  headForm(k, { r: [0.15, 0.135, 0.155], at: [0, 0.12, 0.08], melt: 0.1 });
  wingForms(k, { len: 0.3, w: 0.1, d: 0.03, taper: 0.7, fwd: 0.3, out: 0.38 });
  legForms(k, { r0: 0.055, r1: 0.05, foot: [0.07, 0.022, 0.09] });
  tailForm(k, tailPath(0.08, [0, -0.5, -1], [0, 0, 0], 0.035, [1, 0.6]));
  useSurface(k);
  eyes(k, { x: 0.42, y: 0.14, size: 1.1, wide: 1, slant: 0.05, color: '#120e10', out: 0.006 });
  mouth(k, { w: 0.26, y: -0.36, curve: 0.07, r: 0.006 });
  k.marks = {
    base: skin,
    marks: [
      // A few big scales on the top of the head.
      { color: mix(skin, '#3a3020', 0.22), f: spots(k, 'head', [[12, 0, 0.17], [38, 38, 0.15], [38, -38, 0.15], [55, 95, 0.14], [55, -95, 0.14], [42, 180, 0.2]]) },
      { color: seam, f: all(region(k, /^scute/), seamLine) },
      { color: plate, f: region(k, /^scute/) },
      // The edge of the shell round the plates, a shade darker, and the lip darker again.
      { color: mix(plate, seam, 0.45), f: region(k, 'shell') },
      { color: seam, f: region(k, 'shellRim') },
      { color: plastron, f: frontOval(k, ['belly', 'chest'], 0, 0.32, 0.15, 0.24) },
    ],
  };
  return { aquatic: true };
};

const kaiju: Recipe = (k, c) => {
  const belly = mix(c.coat, '#e8dcc0', 0.45);
  const back = mix(c.coat, CHARCOAL, 0.3);
  const plate = mix(c.coat, CHARCOAL, 0.15);
  const glow = mix(c.coat, '#bdf2ff', 0.7);
  // A giant monster from the films, cut down to town size: a heavy upright lizard on thick legs and big flat
  // feet, little arms held up in front, a blunt head with a heavy brow, and a long thick tail dragging behind.
  // Jagged plates run in three rows from the shoulders right down the tail, pale at the tips as if about to glow.
  k.joints.neck = [0, 0.62, 0.08];
  k.joints.shoulder = [0.15, 0.5, 0.1];
  k.joints.hip = [0.12, 0.2, -0.03];
  k.joints.tail = [0, 0.24, -0.19];
  torso(k, {
    belly: [
      [0, 0.34, -0.02],
      [0.22, 0.25, 0.21],
    ],
    chest: [
      [0, 0.51, 0.05],
      [0.17, 0.15, 0.16],
    ],
    haunch: [
      [0.13, 0.21, -0.05],
      [0.105, 0.14, 0.15],
    ],
    melt: 0.18,
  });
  headForm(k, { r: [0.15, 0.13, 0.16], at: [0, 0.1, 0.06], melt: 0.13 });
  const snout = snoutForm(k, { dy: -0.22, len: 0.09, ra: 0.115, rb: 0.088, drop: 0.015, squash: [1.08, 0.72, 1] });
  // A heavy brow ridge over the eyes.
  const sc = sculptOf(k);
  const hc = new THREE.Vector3(...k.joints.neck).add(new THREE.Vector3(...k.shape.hc));
  for (const side of [-1, 1]) sc.add(ellipsoid('neck', [side * 0.07, hc.y + 0.06, hc.z + 0.1], [0.065, 0.03, 0.05], { k: 0.04, rot: [0, 0, side * 0.32], name: side > 0 ? 'browL' : 'browR' }));
  armForms(k, { len: 0.17, r0: 0.05, r1: 0.04, paw: [0.042, 0.03, 0.045], fwd: 0.7, out: 0.32 });
  legForms(k, { r0: 0.085, r1: 0.07, foot: [0.078, 0.034, 0.1] });
  const path = tailPath(0.74, [0, -0.42, -1], [0.18, 0.5, 0], 0.13, [1, 0.86, 0.7, 0.52, 0.34, 0.16]);
  const tailAt = tailForm(k, path);
  useSurface(k);
  eyes(k, { x: 0.46, y: 0.24, size: 0.75, wide: 1.25, slant: 0.2, color: '#1a1210', ring: '#f2c84a', ringSize: 1.35 });
  mouth(k, { w: 0.5, y: -0.36, curve: 0.06, r: 0.006 });
  // Two little fangs over the bottom lip.
  const nk = new THREE.Vector3(...k.joints.neck);
  for (const side of [-1, 1]) {
    const from = new THREE.Vector3(...snout.nose).add(nk).add(new THREE.Vector3(side * 0.034, -0.01, -0.04));
    const hit = surfaceHit(k, from, new THREE.Vector3(side * 0.2, -1, 0.25));
    if (!hit) continue;
    const down = new THREE.Vector3(0, -1, 0.15).normalize();
    piece(k, { bone: 'neck', pts: [hit.p.clone().addScaledVector(down, -0.012), hit.p.clone().addScaledVector(down, 0.01), hit.p.clone().addScaledVector(down, 0.027)], w: [0.01, 0.008, 0], t: [0.007, 0.006, 0], across: new THREE.Vector3(1, 0, 0), colors: ['#fbf8f1', '#fbf8f1'], name: `fang${side > 0 ? 'L' : 'R'}` });
  }
  // The plates: a row down the middle of the back and tail with a smaller row either side, each plate a flat
  // leaf pointing out, biggest over the shoulders and getting smaller down the tail.
  const spine: { at: THREE.Vector3; up: THREE.Vector3; along: THREE.Vector3; bone: string; size: number }[] = [];
  // Down the back: from just under the head to the root of the tail, out through the surface behind. These are on
  // a bone of their own inside the body, so they can fold away under a cape or a backpack.
  bone(k, 'backPlates', 'body', [0, 0.42, -0.06]);
  for (let y = 0.6; y > 0.3; y -= 0.065) {
    const dir = new THREE.Vector3(0, 0.35 * (y - 0.3), -1).normalize();
    spine.push({ at: new THREE.Vector3(0, y, -0.02), up: dir, along: new THREE.Vector3(0, 1, 0.3), bone: 'backPlates', size: 0.75 + (0.6 - y) * 1.2 });
  }
  // Down the tail, along its top.
  const j = new THREE.Vector3(...k.joints.tail);
  const n = path.pts.length - 1;
  const i1 = Math.max(1, Math.round(n / 3));
  const i2 = Math.max(i1 + 1, Math.round((n * 2) / 3));
  for (let i = 1; i < n - 1; i++) {
    const a = new THREE.Vector3(...path.pts[i]).add(j);
    const b = new THREE.Vector3(...path.pts[i + 1]).add(j);
    const along = b.clone().sub(a).normalize();
    const up = new THREE.Vector3(0, 1, 0).addScaledVector(along, -along.y).normalize();
    spine.push({ at: a, up, along, bone: i < i1 ? 'tail' : i < i2 ? 'tail1' : 'tail2', size: 0.85 * (1 - i / n) + 0.3 });
  }
  let m = 0;
  spine.forEach((s, i) => {
    const side = new THREE.Vector3().crossVectors(s.along, s.up).normalize();
    const rows = [
      { off: 0, tilt: 0, scale: 1 },
      { off: -1, tilt: -0.42, scale: 0.68 },
      { off: 1, tilt: 0.42, scale: 0.68 },
    ];
    for (const r of rows) {
      if (r.off && i % 2) continue;
      const dir = s.up.clone().applyAxisAngle(s.along, r.tilt).normalize();
      const hit = surfaceHit(k, s.at, dir);
      if (!hit) continue;
      const len = 0.13 * s.size * r.scale * (1 + ((m * 7) % 5) * 0.04);
      const w = 0.055 * s.size * r.scale;
      const root = hit.p.clone().addScaledVector(dir, -0.02);
      // A jagged leaf: widest a third of the way out, a notch, then a point.
      const p1 = hit.p.clone().addScaledVector(dir, len * 0.35);
      const p2 = hit.p.clone().addScaledVector(dir, len * 0.62);
      const tip = hit.p.clone().addScaledVector(dir, len).addScaledVector(s.along, -len * 0.18);
      piece(k, {
        bone: s.bone,
        pts: [root, p1, p2, tip],
        w: [w * 0.8, w, w * 0.62, 0],
        t: [0.013, 0.011, 0.008, 0],
        across: s.along.clone().addScaledVector(side, r.off * 0.2),
        colors: [plate, plate, glow],
        name: `plate${m++}`,
      });
    }
  });
  const head = unitOf(k, 'head');
  k.marks = {
    base: c.coat,
    marks: [
      // A paler belly and throat, and the back a shade darker, as on the tail.
      { color: belly, f: frontOval(k, ['belly', 'chest'], 0, 0.38, 0.13, 0.25) },
      { color: belly, f: all(region(k, 'head', 'muzzle'), (q) => -head(q).y - 0.35, (q) => -q.p.z + 0.5) },
      { color: back, f: all(region(k, 'belly', 'chest', 'haunchL', 'haunchR'), (q) => q.p.z + 0.06) },
      { color: back, f: all(region(k, /^tail\d/), (q) => 0.04 - (q.p.y - (j.y - 0.32 * tailAt(q.p)))) },
      { color: back, f: region(k, 'browL', 'browR') },
    ],
  };
  return {};
};

/** A rounded rectangle across a face (half-width a, half-height b, corners rounded by r): below zero inside. */
const roundRect = (x: number, y: number, a: number, b: number, r: number) => {
  const qx = Math.abs(x) - a + r;
  const qy = Math.abs(y) - b + r;
  return Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0) - r;
};

/** A puffy heart about two across, flat front and back with rounded edges, facing +z (the robot's chest light). */
function heartGeometry(): THREE.BufferGeometry {
  const s = new THREE.Shape();
  s.moveTo(0, -0.95);
  s.bezierCurveTo(-0.25, -0.62, -1, -0.28, -1, 0.28);
  s.bezierCurveTo(-1, 0.82, -0.36, 1.02, 0, 0.6);
  s.bezierCurveTo(0.36, 1.02, 1, 0.82, 1, 0.28);
  s.bezierCurveTo(1, -0.28, 0.25, -0.62, 0, -0.95);
  const low = isLow();
  const g = new THREE.ExtrudeGeometry(s, { depth: 0.3, curveSegments: low ? 2 : 4, bevelEnabled: true, bevelThickness: 0.25, bevelSize: 0.16, bevelSegments: low ? 1 : 2 });
  g.translate(0, -0.05, -0.15);
  g.deleteAttribute('uv');
  g.deleteAttribute('normal');
  return g;
}

/** A little bolt head (a short seven-sided disc) on a surface: where (model space), which way is out, how big. */
function bolt(k: Kit, f: Fold, bone: string, at: THREE.Vector3, n: THREE.Vector3, r: number, color: Color) {
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), n.clone().normalize());
  const m = new THREE.Matrix4().compose(at.clone().sub(boneAt(k, bone)), q, new THREE.Vector3(1, 1, 1));
  solid(f, k.rnd, { base: 'disc', r: [r, r * 0.55, r], matrix: m, color });
}

const robot: Recipe = (k, c) => {
  // A little friendly robot, like a tin toy come to life: a soft-cornered boxy body under a bigger boxy head, a
  // dark screen for a face with two big round glowing eyes and a smile, an antenna with a ball on top, round ear
  // discs, a chest panel with a heart light and a bolt at each corner, bendy arms on ball joints ending in round
  // claw hands, and short legs on chunky feet. Painted metal with a contrasting trim. Cut a little finer, for its
  // crisp edges.
  const hsl = { h: 0, s: 0, l: 0 };
  c.coat.getHSL(hsl, THREE.SRGBColorSpace);
  // A warm silver trim, or on a pale or greyish robot a darker shade of its own paint.
  const pale = (hsl.s < 0.22 && hsl.l > 0.45) || hsl.l > 0.76;
  const trim = pale ? mix(c.coat, '#2c3036', 0.52) : mix('#d8d2c6', c.coat, 0.08);
  const joint = mix(trim, CHARCOAL, 0.4);
  const screen = '#1a232e';
  const glow = '#8cf0ff';
  // A red ball and heart, or butter yellow on a red or pink robot.
  const accent = (hsl.h < 0.05 || hsl.h > 0.9) && hsl.s > 0.35 ? '#f6cf4a' : '#e8443a';
  k.step = 0.03;
  k.joints.neck = [0, 0.52, 0];
  k.joints.shoulder = [0.212, 0.41, 0];
  k.joints.hip = [0.085, 0.15, 0];
  k.joints.tail = [0, 0.22, -0.14];
  const sc = sculptOf(k);
  // The body: a box with soft corners. (Its summary for dress-up, seats and holding is the box itself.)
  const bodyC: Vec3 = [0, 0.3, 0];
  const bodyR: Vec3 = [0.18, 0.16, 0.145];
  sc.add(box('body', bodyC, bodyR, { round: 0.085, name: 'chassis' }));
  k.shape.tc = bodyC;
  k.shape.tr = bodyR;
  k.shape.pear = 0;
  k.front = bodyR[2];
  k.seat = bodyC[1] - bodyR[1];
  // The head: a bigger box on a short post.
  const n = k.joints.neck;
  const headAt: Vec3 = [0, 0.15, 0.01];
  const headR: Vec3 = [0.2, 0.155, 0.165];
  k.shape.hr = headR;
  k.shape.hc = headAt;
  k.headBend = undefined;
  const hc = plus(n, headAt);
  sc.add(box('neck', hc, headR, { round: 0.08, name: 'head' }));
  sc.add(rod('neck', [0, n[1] - 0.08, 0], [0, n[1] + 0.03, 0], 0.068, 0.068, { name: 'post' }));
  // Round discs for ears, and the socket the antenna stands in.
  for (const side of [-1, 1]) {
    sc.add(rod('neck', [side * (headR[0] - 0.02), hc[1] - 0.005, hc[2] - 0.01], [side * (headR[0] + 0.022), hc[1] - 0.005, hc[2] - 0.01], 0.056, 0.05, { k: 0.01, name: side > 0 ? 'discL' : 'discR' }));
  }
  sc.add(ellipsoid('neck', [0, hc[1] + headR[1] - 0.004, hc[2]], [0.042, 0.024, 0.042], { k: 0.012, name: 'socket' }));
  // Arms hung on a ball at each shoulder, rather than grown out of the body.
  armForms(k, { len: 0.16, r0: 0.036, r1: 0.032, paw: [0.047, 0.045, 0.047], fwd: 0.2, out: 0.14 });
  for (const nm of ['armL', 'armR']) sc.named(nm)!.k = 0.015;
  for (const side of [-1, 1]) {
    const sh = k.joints.shoulder;
    sc.add(ellipsoid(side > 0 ? 'armL' : 'armR', [side * (sh[0] - 0.008), sh[1], sh[2]], [0.054, 0.054, 0.054], { k: 0.012, name: side > 0 ? 'shoulderL' : 'shoulderR' }));
  }
  // Short legs into chunky feet.
  for (const side of [-1, 1]) {
    const name = side > 0 ? 'legL' : 'legR';
    const x = side * k.joints.hip[0];
    sc.add(rod(name, [x, 0.19, 0], [x, 0.07, 0.005], 0.042, 0.04, { k: 0.015, anchor: [x, 0.15, 0], reach: 0.08, name }));
    sc.add(box(name, [x, 0.039, 0.025], [0.064, 0.039, 0.09], { round: 0.032, k: 0.02, anchor: [x, 0.07, 0.005], reach: 0.07, name: `${name}Foot` }));
  }
  useSurface(k);
  // Two prongs curling down from each round hand, closing like a little grabber.
  for (const p of k.paws ?? []) {
    const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(...p.rot));
    const at = new THREE.Vector3(...p.at);
    const L = (x: number, y: number, z: number) => at.clone().add(new THREE.Vector3(x, y, z).applyQuaternion(q));
    for (const s of [-1, 1]) {
      piece(k, {
        bone: p.bone,
        pts: [L(s * 0.016, -0.018, 0.012), L(s * 0.034, -0.052, 0.018), L(s * 0.012, -0.08, 0.016)],
        w: [0.013, 0.011, 0],
        t: [0.009, 0.008, 0],
        across: new THREE.Vector3(0, 0, 1).applyQuaternion(q),
        colors: [joint, joint],
        name: `prong${p.bone}${s}`,
      });
    }
  }
  // The antenna, on a bone of its own just inside the top of the head so it can fold away under a hat.
  bone(k, 'crest', 'neck', [0, headAt[1] + headR[1] - 0.03, headAt[2]]);
  const antenna = part(k, 'crest', 'crest');
  pillar(antenna, k.rnd, [0, 0, 0], [0, 0.15, 0], 0.011, 0.009, trim, { base: 'limb5' });
  solid(antenna, k.rnd, { base: 'ico2', r: 0.034, pos: [0, 0.163, 0], color: accent });
  // (Not the usual rosy blush, which goes muddy on the dark screen: little pink lights for cheeks instead.)
  eyes(k, { x: 0.4, y: 0.14, size: 1.45, wide: 1, slant: 0, color: glow, blush: false });
  mouth(k, { w: 0.2, y: -0.4, curve: 0.13, r: 0.0075, color: glow });
  for (const side of [-1, 1]) {
    const at = onHead(k, side * 0.6, -0.3, 0.001);
    const m = new THREE.Matrix4().compose(at, new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), headNormal(k, side * 0.6, -0.3)), new THREE.Vector3(1, 1, 1));
    solid(k.head, k.rnd, { base: 'ico1', r: [0.028, 0.016, 0.005], matrix: m, color: '#ff8fb0' });
  }
  // The heart light in the middle of the chest panel, and a bolt at each of its corners and on each ear disc.
  const panelY = 0.315;
  solid(k.torso, k.rnd, { base: heartGeometry(), r: [0.036, 0.036, 0.024], pos: [0, panelY, bodyR[2] + 0.003], color: accent });
  for (const [x, y] of [
    [-0.072, panelY - 0.06],
    [0.072, panelY - 0.06],
    [-0.072, panelY + 0.06],
    [0.072, panelY + 0.06],
  ]) {
    const hit = surfaceHit(k, new THREE.Vector3(x, y, 0), new THREE.Vector3(0, 0, 1));
    if (hit) bolt(k, k.torso, 'body', hit.p, hit.n, 0.013, joint);
  }
  for (const side of [-1, 1]) {
    const hit = surfaceHit(k, new THREE.Vector3(side * 0.15, hc[1] - 0.005, hc[2] - 0.01), new THREE.Vector3(side, 0, 0));
    if (hit) bolt(k, k.head, 'neck', hit.p, hit.n, 0.018, joint);
  }
  const armAxis = (side: string) => unitOf(k, `arm${side}Axis`);
  const [axL, axR] = [armAxis('L'), armAxis('R')];
  k.marks = {
    base: c.coat,
    marks: [
      // The screen, across the front of the head.
      { color: screen, f: all(region(k, 'head'), (q) => hc[2] + headR[2] - 0.035 - q.p.z, (q) => roundRect(q.p.x, q.p.y - hc[1] + 0.008, 0.152, 0.112, 0.045)) },
      { color: trim, f: region(k, 'discL', 'discR', 'socket') },
      { color: joint, f: region(k, 'post') },
      // The chest panel, and a band of trim round the waist.
      { color: trim, f: all(region(k, 'chassis'), (q) => bodyR[2] - 0.035 - q.p.z, (q) => roundRect(q.p.x, q.p.y - panelY, 0.1, 0.088, 0.03)) },
      { color: trim, f: all(region(k, 'chassis'), (q) => Math.abs(q.p.y - 0.19) - 0.022) },
      // Silver arms with a dark band at the elbow, on silver shoulder balls; round hands in the paint.
      { color: joint, f: any(all(region(k, 'armL', 'foreL'), (q) => Math.abs(axL(q).y - 0.52) - 0.07), all(region(k, 'armR', 'foreR'), (q) => Math.abs(axR(q).y - 0.52) - 0.07)) },
      { color: trim, f: region(k, 'armL', 'foreL', 'armR', 'foreR', 'shoulderL', 'shoulderR') },
      // Silver legs, and dark soles under the feet.
      { color: trim, f: region(k, 'legL', 'legR') },
      { color: joint, f: all(region(k, 'legLFoot', 'legRFoot'), (q) => q.p.y - 0.016) },
    ],
  };
  return {};
};

const homunculus: Recipe = (k, c) => {
  const belly = mix(c.coat, '#f8e8d6', 0.2);
  const inner = mix(c.coat, '#e0707e', 0.38);
  const nosey = mix(c.coat, '#d8606a', 0.2);
  const seam = mix(c.coat, '#3a1e1a', 0.6);
  const leaf = '#8cc65c';
  const sprout = '#5f9c48';
  // A little creature grown in an alchemist's flask: a big round head with huge round amber eyes, long pointed
  // ears out to the sides, a button nose and a wide grin, a round pot belly on a small body, and hands and feet
  // far too big for it. A seedling sprouts from the top of its head, and a stitched seam runs over one temple.
  k.joints.neck = [0, 0.5, 0.02];
  k.joints.shoulder = [0.105, 0.445, 0.0];
  k.joints.hip = [0.065, 0.2, 0];
  k.joints.tail = [0, 0.2, -0.13];
  k.step = 0.036;
  // A narrow chest over a round pot belly, up on short thin legs.
  torso(k, {
    belly: [
      [0, 0.31, 0.02],
      [0.145, 0.145, 0.145],
    ],
    chest: [
      [0, 0.43, -0.005],
      [0.1, 0.085, 0.085],
    ],
    melt: 0.14,
  });
  headForm(k, { r: [0.215, 0.195, 0.195], at: [0, 0.17, 0.03], melt: 0.1 });
  const snout = snoutForm(k, { dy: -0.2, len: 0.012, ra: 0.044, rb: 0.042, drop: 0.01 });
  earForms(k, { x: 0.88, y: 0.2, w: 0.05, h: 0.21, d: 0.034, splay: 1.05, rake: 0.2, cup: 0.5, notch: true });
  // Thin arms hanging down its sides, and hands and feet much too big for them: each hand a big flat mitten
  // hanging palm in, with a thumb out in front.
  armForms(k, { len: 0.21, r0: 0.03, r1: 0.026, paw: [0.036, 0.07, 0.062], fwd: 0.12, out: 0.4 });
  const sc = sculptOf(k);
  const hands = (k.paws ?? []).map((p) => {
    const side = p.at[0] > 0 ? 1 : -1;
    const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(...p.rot));
    const at = new THREE.Vector3(...p.at);
    return { ...p, side, q, at, L: (x: number, y: number, z: number) => at.clone().add(new THREE.Vector3(x, y, z).applyQuaternion(q)) };
  });
  for (const h of hands) {
    const r = [h.rot[0] - 0.5, 0, h.rot[2] - h.side * 0.35] as Vec3;
    sc.add(ellipsoid(h.bone, v3(h.L(-h.side * 0.012, 0.012, 0.055)), [0.022, 0.034, 0.021], { rot: r, k: 0.025, anchor: v3(h.at), reach: 0.09, name: `thumb${h.side > 0 ? 'L' : 'R'}` }));
  }
  legForms(k, { r0: 0.038, r1: 0.032, foot: [0.074, 0.04, 0.13], fwd: 0.075 });
  useSurface(k);
  eyes(k, { x: 0.4, y: 0.04, size: 1.45, wide: 1, slant: 0, color: '#1a1210', ring: '#e2a93c', ringSize: 1.32 });
  mouth(k, { w: 0.32, y: -0.52, curve: 0.13, r: 0.0065 });
  // Two faint wrinkles across the brow, like a little old man.
  const wrinkle = mix(c.coat, '#5a3020', 0.32);
  mouth(k, { w: 0.15, y: 0.44, curve: -0.05, r: 0.0042, color: wrinkle });
  mouth(k, { w: 0.1, y: 0.53, curve: -0.04, r: 0.0038, color: wrinkle });
  k.nose = snout.nose;
  const nk = new THREE.Vector3(...k.joints.neck);
  // The sprout: a little stem with two leaves, on a bone of its own just inside the crown so it can fold away
  // under a hat.
  const crest = onHead(k, 0.06, 0.97, -0.02);
  bone(k, 'crest', 'neck', v3(crest));
  const root = crest.clone().add(nk);
  const up = new THREE.Vector3(0.15, 1, 0.1).normalize();
  const top = root.clone().addScaledVector(up, 0.11);
  piece(k, { bone: 'crest', pts: [root.clone().addScaledVector(up, -0.01), root.clone().addScaledVector(up, 0.06), top], w: [0.009, 0.007, 0], t: [0.009, 0.007, 0], across: new THREE.Vector3(1, 0, 0), colors: [sprout, sprout], name: 'sprout' });
  for (const s of [-1, 1]) {
    const out = new THREE.Vector3(s, 0.3, -0.1 * s).normalize();
    const from = top.clone().addScaledVector(up, -0.014);
    const across = new THREE.Vector3(-out.z, 0, out.x).normalize();
    piece(k, {
      bone: 'crest',
      pts: [from, from.clone().addScaledVector(out, 0.042).add(new THREE.Vector3(0, 0.006, 0)), from.clone().addScaledVector(out, 0.085).add(new THREE.Vector3(0, 0.024, 0))],
      w: [0, 0.025, 0],
      t: [0, 0.006, 0],
      across,
      colors: [leaf, leaf],
      name: `leaf${s}`,
    });
  }
  // The seam: a fine dark line over the left temple with little stitches across it.
  const along: THREE.Vector3[] = [];
  const normals: THREE.Vector3[] = [];
  for (let i = 0; i <= 6; i++) {
    const t = i / 6;
    const ux = 0.3 + 0.36 * t;
    const uy = 0.74 - 0.48 * t + 0.08 * Math.sin(t * Math.PI);
    along.push(onHead(k, ux, uy).add(nk));
    normals.push(headNormal(k, ux, uy));
  }
  piece(k, {
    bone: 'neck',
    pts: along.map((p, i) => p.clone().addScaledVector(normals[i], i === 0 || i === along.length - 1 ? -0.002 : 0.0014)),
    w: along.map((_, i) => (i === 0 || i === along.length - 1 ? 0 : 0.0032)),
    t: along.map((_, i) => (i === 0 || i === along.length - 1 ? 0 : 0.0022)),
    across: new THREE.Vector3(1, 0, 0),
    colors: along.slice(1).map(() => seam),
    name: 'seam',
  });
  for (const i of [1, 2, 3, 4, 5]) {
    const p = along[i];
    const nrm = normals[i];
    const dir = along[i + 1].clone().sub(along[i - 1]).normalize();
    const side = new THREE.Vector3().crossVectors(nrm, dir).normalize();
    const a = p.clone().addScaledVector(side, -0.016);
    const b = p.clone().addScaledVector(side, 0.016);
    piece(k, { bone: 'neck', pts: [a.addScaledVector(nrm, -0.002), p.clone().addScaledVector(nrm, 0.002), b.addScaledVector(nrm, -0.002)], w: [0, 0.003, 0], t: [0, 0.0022, 0], across: dir, colors: [seam, seam], name: `stitch${i}` });
  }
  // A little belly button in the middle of the pot belly.
  decal(k, { bone: 'body', from: new THREE.Vector3(0, 0.32, 0.02), dir: new THREE.Vector3(0, 0, 1), r: 0.011, stretch: 1.3, color: mix(c.coat, '#5a3020', 0.38), sides: 8, name: 'navel' });
  // Fingers: creases up the outside of each hand from its bottom edge.
  for (const h of hands) {
    for (const z of [-0.026, 0, 0.026]) {
      const hits = [1.02, 0.8, 0.58, 0.4].map((v) => surfaceHit(k, h.at, new THREE.Vector3(h.side * 0.02, -v * 0.07, z).applyQuaternion(h.q)));
      if (hits.some((x) => !x)) continue;
      const col = mix(c.coat, CHARCOAL, 0.38);
      const pts = hits.map((x, j) => x!.p.clone().addScaledVector(x!.n.normalize(), j === 0 || j === hits.length - 1 ? -0.002 : 0.0014));
      piece(k, { bone: h.bone, pts, w: [0, 0.0032, 0.0032, 0], t: [0, 0.0022, 0.0022, 0], across: new THREE.Vector3(0, 0, 1).applyQuaternion(h.q), colors: [col, col, col], name: `finger${h.bone}${z}` });
    }
  }
  const ears = ['earL', 'earR'].map((e) => earMarks(k, e));
  k.marks = {
    base: c.coat,
    marks: [
      { color: inner, f: any(...ears.map((e) => e.inner)) },
      { color: nosey, f: region(k, 'muzzle') },
      { color: belly, f: frontOval(k, ['belly', 'chest'], 0, 0.31, 0.09, 0.09) },
    ],
  };
  return {};
};

const fungi: Recipe = (k, c) => {
  const stem = mix(c.coat, '#f4ecdc', 0.86);
  // White spots, or on a very pale cap a soft brown so they still show.
  const spot = luminance(c.coat) > 0.68 ? mix(c.coat, '#7a5a40', 0.32) : mix(c.coat, '#fffcf4', 0.9);
  const shade = mix(stem, c.coat, 0.4);
  const gill = mix(stem, c.coat, 0.14);
  // A little mushroom out for a walk: a big domed cap for a head, with round white spots on top and fine gills
  // underneath, tipped back a touch so the face peeps out from under the brim at the top of a chunky pale stem,
  // with little arms and stubby feet. It hops about.
  k.joints.neck = [0, 0.43, 0.02];
  k.joints.shoulder = [0.13, 0.34, 0.06];
  k.joints.hip = [0.075, 0.13, 0];
  k.joints.tail = [0, 0.15, -0.14];
  const sc = sculptOf(k);
  const n = k.joints.neck;
  // The cap first, so the hollow underneath (where the gills are) bites only into it.
  const tip: Vec3 = [-0.14, 0, 0];
  const turn = new THREE.Quaternion().setFromEuler(new THREE.Euler(...tip));
  const capC = new THREE.Vector3(0, n[1] + 0.28, n[2] - 0.04);
  const capR: Vec3 = [0.34, 0.21, 0.32];
  const cap = ellipsoid('neck', v3(capC), capR, { rot: tip, name: 'cap' });
  const hollow = ellipsoid('neck', v3(capC.clone().add(new THREE.Vector3(0, -0.14, 0).applyQuaternion(turn))), [0.305, 0.13, 0.285], { rot: tip, k: 0.05, carve: true, name: 'hollow' });
  sc.add(cap, hollow);
  torso(k, {
    belly: [
      [0, 0.22, 0],
      [0.175, 0.2, 0.165],
    ],
    chest: [
      [0, 0.36, 0.01],
      [0.14, 0.11, 0.135],
    ],
    melt: 0.2,
  });
  headForm(k, { r: [0.165, 0.14, 0.155], at: [0, 0.08, 0.03], melt: 0.12 });
  // The top of the stem, running on up into the cap.
  sc.add(rod('neck', [0, n[1] + 0.1, n[2] - 0.01], v3(capC.clone().add(new THREE.Vector3(0, -0.02, 0).applyQuaternion(turn))), 0.13, 0.1, { k: 0.06, name: 'stemTop' }));
  armForms(k, { len: 0.15, r0: 0.04, r1: 0.034, paw: [0.042, 0.036, 0.045], fwd: 0.4, out: 0.25 });
  legForms(k, { r0: 0.05, r1: 0.045, foot: [0.062, 0.036, 0.08] });
  useSurface(k);
  eyes(k, { x: 0.4, y: 0.0, size: 1.15, wide: 1, slant: 0, color: '#1a1210' });
  mouth(k, { w: 0.22, y: -0.42, curve: 0.12, r: 0.006 });
  // The gills: thin pale blades radiating under the cap from the stem out to the rim, standing out of its
  // shadowed underside. Each is found by looking straight down (in the cap's own turn) from inside the cap.
  const capAt = (x: number, y: number, z: number) => capC.clone().add(new THREE.Vector3(x, y, z).applyQuaternion(turn));
  const down = new THREE.Vector3(0, -1, 0).applyQuaternion(turn);
  const G = 24;
  for (let i = 0; i < G && !isLow(); i++) {
    const a = ((i + 0.5) / G) * Math.PI * 2;
    const hits = [0.13, 0.2, 0.275].map((rho) => {
      const x = rho * Math.sin(a);
      const z = rho * Math.cos(a);
      const ceiling = -0.14 + 0.13 * Math.sqrt(Math.max(0, 1 - (x / 0.305) ** 2 - (z / 0.285) ** 2));
      const dome = capR[1] * Math.sqrt(Math.max(0, 1 - (x / capR[0]) ** 2 - (z / capR[2]) ** 2));
      return surfaceHit(k, capAt(x, (ceiling + dome) / 2, z), down);
    });
    if (hits.some((h) => !h)) continue;
    const across = hits.reduce((sum, h) => sum.add(h!.n.normalize()), new THREE.Vector3()).normalize();
    piece(k, { bone: 'neck', pts: hits.map((h) => h!.p.clone().addScaledVector(h!.n, 0.004)), w: [0, 0.011, 0], t: [0, 0.003, 0], across, colors: [gill, gill], name: `gill${i}` });
  }
  // The underside is the hollow's own surface; the cap's colour is only on the outside of it (the stem rising
  // through the hollow lies inside the cap's dome, so is in its region too).
  const under = (q: Probe) => Math.abs(hollow.d(q.p.x, q.p.y, q.p.z)) - 0.012;
  const outside = (q: Probe) => -hollow.d(q.p.x, q.p.y, q.p.z);
  const onCap = region(k, 'cap');
  k.marks = {
    base: stem,
    marks: [
      { color: shade, f: all(onCap, under) },
      { color: spot, f: spots(k, 'cap', [[0, 0, 0.27], [40, 0, 0.21], [44, 72, 0.2], [44, -72, 0.2], [46, 144, 0.21], [46, -144, 0.21], [74, 36, 0.17], [74, -36, 0.17], [76, 108, 0.17], [76, -108, 0.17], [76, 180, 0.17]]) },
      { color: c.coat, f: all(onCap, outside) },
      { color: mix(stem, c.coat, 0.14), f: all(region(k, /^leg/), (q) => q.p.y - 0.05) },
    ],
  };
  return {};
};

/**
 * Where to put things on a little wing on the back: a point `u` out along its leading edge, `v` across towards its
 * trailing edge, and `lift` off its face.
 */
function wingPlane(root: THREE.Vector3, out: THREE.Vector3, trail: THREE.Vector3) {
  const U = out.clone().normalize();
  const V = trail.clone().addScaledVector(U, -trail.dot(U)).normalize();
  // Which way its face looks: away from the body, out behind it.
  const N = new THREE.Vector3().crossVectors(U, V);
  if (N.z > 0) N.negate();
  return { U, V, N, at: (u: number, v: number, lift = 0) => root.clone().addScaledVector(U, u).addScaledVector(V, v).addScaledVector(N, lift) };
}

const dragon: Recipe = (k, c) => {
  const belly = mix(c.coat, '#f8e4a8', 0.66);
  const seam = mix(belly, c.coat, 0.4);
  const spike = mix(c.coat, '#f4c860', 0.55);
  const horn = '#f3e6c8';
  const web = mix(c.coat, '#f8dca0', 0.42);
  // A round baby dragon, nearly all tummy: a big pale belly banded with scales, stubby arms and legs, a big round
  // head with a short snout, little horns and fins for ears, small spikes from its crown down its back and tail, a
  // spade on the end of its tail, and two little bat wings on its back, far too small to fly with (folded, until it
  // flutters them).
  k.joints.neck = [0, 0.56, 0.05];
  k.joints.shoulder = [0.16, 0.44, 0.13];
  k.joints.hip = [0.11, 0.17, -0.01];
  k.joints.tail = [0, 0.2, -0.2];
  torso(k, {
    belly: [
      [0, 0.3, -0.01],
      [0.25, 0.26, 0.23],
    ],
    chest: [
      [0, 0.47, 0.04],
      [0.18, 0.13, 0.16],
    ],
    haunch: [
      [0.13, 0.17, -0.03],
      [0.1, 0.1, 0.13],
    ],
    melt: 0.2,
  });
  // (Things are held a little further out, clear of the big round tummy.)
  k.front! += 0.035;
  headForm(k, { r: [0.2, 0.175, 0.185], at: [0, 0.13, 0.05], melt: 0.14 });
  const snout = snoutForm(k, { dy: -0.26, len: 0.08, ra: 0.11, rb: 0.085, drop: 0.02, squash: [1.15, 0.78, 1] });
  earForms(k, { x: 0.8, y: 0.32, w: 0.04, h: 0.085, d: 0.024, splay: 1.2, rake: 0.25, notch: true });
  armForms(k, { len: 0.16, r0: 0.05, r1: 0.044, paw: [0.046, 0.034, 0.048], fwd: 0.55, out: 0.32 });
  legForms(k, { r0: 0.072, r1: 0.062, foot: [0.068, 0.034, 0.088] });
  const path = tailPath(0.5, [0, -0.45, -1], [0.55, 0.3, 0], 0.11, [1, 0.8, 0.6, 0.45, 0.32, 0.24]);
  tailForm(k, path);
  useSurface(k);
  eyes(k, { x: 0.42, y: 0.1, size: 1.15, wide: 1.1, slant: 0.12, color: '#1a1216' });
  mouth(k, { w: 0.42, y: -0.42, curve: 0.1, r: 0.0065 });
  k.nose = snout.nose;
  const nk = new THREE.Vector3(...k.joints.neck);
  // Two little nostrils on the end of the snout.
  for (const side of [-1, 1]) {
    const at = onSnout(k, [side * 0.032, snout.nose[1] - 0.004, snout.nose[2] - 0.01], 0.002);
    solid(k.head, k.rnd, { base: 'ico1', r: [0.011, 0.008, 0.006], pos: at, rot: [-0.4, side * 0.4, 0], color: mix(c.coat, CHARCOAL, 0.65) });
  }
  // Two little horns curving back off the top of the head.
  for (const side of [-1, 1]) {
    const base = onHead(k, side * 0.4, 0.78, -0.012).add(nk);
    const out = new THREE.Vector3(side * 0.3, 0.8, -0.5).normalize();
    const back = new THREE.Vector3(0, -0.3, -1).normalize();
    const pts = [base.clone().addScaledVector(out, -0.02), base.clone().addScaledVector(out, 0.035), base.clone().addScaledVector(out, 0.065).addScaledVector(back, 0.02), base.clone().addScaledVector(out, 0.078).addScaledVector(back, 0.058)];
    piece(k, { bone: 'neck', pts, w: [0.024, 0.02, 0.013, 0], t: [0.024, 0.02, 0.013, 0], across: new THREE.Vector3(1, 0, 0), colors: [horn, horn, horn], name: `horn${side > 0 ? 'L' : 'R'}` });
  }
  // A row of small spikes down the middle, from the crown down the back of the head, down the back (on a bone of its
  // own, so they fold away under a cape or a backpack) and along the top of the tail, smaller towards its end.
  const row: { from: THREE.Vector3; dir: THREE.Vector3; along: THREE.Vector3; bone: string; size: number }[] = [];
  const hc = nk.clone().add(new THREE.Vector3(...k.shape.hc));
  for (const a of [1.0, 1.4, 1.8]) {
    const dir = new THREE.Vector3(0, Math.cos(a), -Math.sin(a));
    row.push({ from: hc, dir, along: new THREE.Vector3(0, -Math.sin(a), -Math.cos(a)), bone: 'neck', size: 0.8 });
  }
  bone(k, 'backPlates', 'body', [0, 0.4, -0.08]);
  for (let y = 0.52; y > 0.28; y -= 0.07) {
    const dir = new THREE.Vector3(0, 0.45 * (y - 0.28), -1).normalize();
    row.push({ from: new THREE.Vector3(0, y, 0), dir, along: new THREE.Vector3(0, 1, 0.2).normalize(), bone: 'backPlates', size: 0.9 });
  }
  const j = new THREE.Vector3(...k.joints.tail);
  const n = path.pts.length - 1;
  const i1 = Math.max(1, Math.round(n / 3));
  const i2 = Math.max(i1 + 1, Math.round((n * 2) / 3));
  for (let i = 1; i < n - 1; i++) {
    const a = new THREE.Vector3(...path.pts[i]).add(j);
    const b = new THREE.Vector3(...path.pts[i + 1]).add(j);
    const along = b.clone().sub(a).normalize();
    const up = new THREE.Vector3(0, 1, 0).addScaledVector(along, -along.y).normalize();
    row.push({ from: a, dir: up, along: along.negate(), bone: i < i1 ? 'tail' : i < i2 ? 'tail1' : 'tail2', size: 0.85 - (i / n) * 0.45 });
  }
  row.forEach((s, i) => {
    const hit = surfaceHit(k, s.from, s.dir);
    if (!hit) return;
    const len = 0.075 * s.size;
    const w = 0.032 * s.size;
    // A little rounded point, leaning back.
    const pts = [hit.p.clone().addScaledVector(s.dir, -0.014), hit.p.clone().addScaledVector(s.dir, len * 0.45), hit.p.clone().addScaledVector(s.dir, len).addScaledVector(s.along, len * 0.3)];
    piece(k, { bone: s.bone, pts, w: [w, w * 0.8, 0], t: [0.012, 0.01, 0], across: s.along, colors: [spike, spike], name: `ridge${i}` });
  });
  // The spade on the end of the tail: flat, lying level, so it shows from above and behind.
  {
    const end = new THREE.Vector3(...path.pts[n]).add(j);
    const d = end.clone().sub(new THREE.Vector3(...path.pts[n - 1]).add(j)).normalize();
    const across = new THREE.Vector3(0, 1, 0).cross(d).normalize();
    const pts = [-0.012, 0.012, 0.035, 0.058, 0.08, 0.105].map((x) => end.clone().addScaledVector(d, x));
    piece(k, { bone: 'tail2', pts, w: [0.018, 0.04, 0.056, 0.05, 0.03, 0], t: [0.016, 0.014, 0.013, 0.012, 0.009, 0], across, colors: [spike, spike, spike, spike, spike], name: 'spade' });
  }
  // The wings: a little arm along the leading edge to a wrist with a claw, two fingers fanning out from it, and the
  // membrane between, scalloped along its edge. Each on a bone of its own at the top of the back, standing up and
  // out from it, facing back.
  for (const side of [-1, 1]) {
    const nm = side > 0 ? 'wingL' : 'wingR';
    const hit = surfaceHit(k, new THREE.Vector3(side * 0.06, 0.47, 0), new THREE.Vector3(side * 0.45, 0.15, -1));
    if (!hit) continue;
    const nrm = hit.n.clone().normalize();
    bone(k, nm, 'body', v3(hit.p.clone().addScaledVector(nrm, -0.02)));
    const w = wingPlane(hit.p.clone().addScaledVector(nrm, -0.006), new THREE.Vector3(side * 0.5, 0.82, -0.22), new THREE.Vector3(side * 0.85, -0.5, -0.15));
    const wrist = w.at(0.1, 0);
    const tips = [w.at(0.175, 0.035), w.at(0.15, 0.1), w.at(0.085, 0.135)];
    const rim = [w.at(0, 0), w.at(0.05, -0.004), wrist, tips[0], w.at(0.13, 0.062), tips[1], w.at(0.088, 0.09), tips[2], w.at(0.03, 0.082), w.at(-0.004, 0.06)];
    membrane(k, { bone: nm, centre: w.at(0.07, 0.05), rim, up: w.N, cup: 0.008, color: web, edge: mix(web, c.coat, 0.45) });
    const bones: [THREE.Vector3[], number][] = [
      [[w.at(-0.012, 0), w.at(0.05, -0.002), wrist, tips[0]], 0.011],
      [[wrist, w.at(0.13, 0.05), tips[1]], 0.007],
      [[wrist, w.at(0.095, 0.07), tips[2]], 0.007],
    ];
    bones.forEach(([pts, r], i) => {
      const last = pts.length - 1;
      piece(k, { bone: nm, pts, w: pts.map((_, q) => (q === last ? 0 : r * (1 - (q / last) * 0.4))), t: pts.map((_, q) => (q === last ? 0 : r * 0.8)), across: w.N, colors: pts.slice(1).map(() => c.coat), name: `${nm}Bone${i}` });
    });
    piece(k, { bone: nm, pts: [wrist, wrist.clone().addScaledVector(w.U, 0.008).addScaledVector(w.V, -0.025)], w: [0.006, 0], t: [0.005, 0], across: w.N, colors: [horn], name: `${nm}Claw` });
  }
  // The belly scales: pale plates across the front, a darker line between each (none up in the crease under the chin).
  const front = frontOval(k, ['belly', 'chest'], 0, 0.3, 0.165, 0.235);
  const plate = 0.075;
  k.marks = {
    base: c.coat,
    marks: [
      {
        color: seam,
        f: all(front, (q) => {
          const x = (q.p.y - 0.09) / plate;
          return Math.abs(x - Math.round(x)) * plate - 0.013;
        }, (q) => q.p.y - 0.43),
      },
      { color: belly, f: front },
      { color: belly, f: all(region(k, 'muzzle'), (q) => q.p.y - snout.mid(q.p)) },
    ],
  };
  return { wings: 'flutter' };
};

const bee: Recipe = (k, c, coat) => {
  const black = '#2a2326';
  // (On a dark coat the stripes are pale instead, so they still show.)
  const stripe = luminance(coat) < 0.2 ? mix(c.coat, '#f6e6b8', 0.7) : black;
  const fluff = mix(c.coat, '#fff6dc', 0.5);
  // A fuzzy round bumblebee: a big round head with huge eyes and antennae with little balls on the ends, a fluffy
  // collar, a round body striped black, a little stinger, tiny arms and legs, and two pairs of see-through wings on
  // its back that buzz too fast to see. It's always up in the air, hovering.
  k.joints.neck = [0, 0.47, 0.04];
  k.joints.shoulder = [0.15, 0.4, 0.11];
  k.joints.hip = [0.08, 0.15, 0];
  k.joints.tail = [0, 0.16, -0.2];
  torso(k, {
    belly: [
      [0, 0.27, -0.03],
      [0.22, 0.22, 0.21],
    ],
    chest: [
      [0, 0.42, 0.01],
      [0.17, 0.1, 0.16],
    ],
    melt: 0.16,
  });
  // The fluffy collar: a ring of soft puffs round the neck.
  const sc = sculptOf(k);
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2;
    sc.add(ellipsoid('body', [Math.sin(a) * 0.15, 0.445 + (i % 2) * 0.012, 0.02 + Math.cos(a) * 0.145], [0.058, 0.048, 0.058], { k: 0.04, name: `fluff${i}` }));
  }
  // (Things are held a little further out, clear of the big round tummy.)
  k.front! += 0.035;
  headForm(k, { r: [0.205, 0.185, 0.185], at: [0, 0.15, 0.05], melt: 0.12 });
  armForms(k, { len: 0.14, r0: 0.034, r1: 0.03, paw: [0.034, 0.028, 0.036], fwd: 0.5, out: 0.3 });
  legForms(k, { r0: 0.028, r1: 0.024, foot: [0.031, 0.02, 0.04] });
  useSurface(k);
  eyes(k, { x: 0.42, y: 0.02, size: 1.45, wide: 1, slant: 0.05, color: '#1a1418' });
  mouth(k, { w: 0.2, y: -0.5, curve: 0.1, r: 0.006 });
  const nk = new THREE.Vector3(...k.joints.neck);
  // Antennae on the ears' bones (so they twitch, perk up and droop as ears do), each a thin crisp stalk with a ball.
  for (const side of [-1, 1]) {
    const nm = side > 0 ? 'earL' : 'earR';
    const base = onHead(k, side * 0.3, 0.86, -0.012);
    bone(k, nm, 'neck', v3(base));
    const b = base.clone().add(nk);
    const pts = [b.clone().add(new THREE.Vector3(0, -0.012, 0)), b.clone().add(new THREE.Vector3(side * 0.018, 0.06, 0.004)), b.clone().add(new THREE.Vector3(side * 0.045, 0.115, 0.02)), b.clone().add(new THREE.Vector3(side * 0.07, 0.15, 0.05))];
    piece(k, { bone: nm, pts, w: [0.009, 0.008, 0.007, 0.006], t: [0.009, 0.008, 0.007, 0.006], across: new THREE.Vector3(1, 0, 0), colors: [black, black, black], name: `antenna${side > 0 ? 'L' : 'R'}` });
    solid(part(k, `knob${side > 0 ? 'L' : 'R'}`, nm), k.rnd, { base: 'ico2', r: 0.024, pos: v3(pts[3].clone().sub(boneAt(k, nm))), color: black });
  }
  // A little stinger out of the bottom of its back.
  {
    const hit = surfaceHit(k, new THREE.Vector3(0, 0.2, -0.05), new THREE.Vector3(0, -0.45, -1));
    if (hit) {
      const d = new THREE.Vector3(0, -0.35, -1).normalize();
      const pts = [hit.p.clone().addScaledVector(d, -0.014), hit.p.clone().addScaledVector(d, 0.03), hit.p.clone().addScaledVector(d, 0.058)];
      piece(k, { bone: 'tail', pts, w: [0.017, 0.009, 0], t: [0.017, 0.009, 0], across: new THREE.Vector3(1, 0, 0), colors: [black, black], name: 'stinger' });
    }
  }
  // Two pairs of see-through wings, a big one in front and a smaller one behind, each side on a bone of its own at
  // the top of the back.
  for (const side of [-1, 1]) {
    const nm = side > 0 ? 'wingL' : 'wingR';
    const hit = surfaceHit(k, new THREE.Vector3(side * 0.04, 0.42, -0.02), new THREE.Vector3(side * 0.35, 0.3, -1));
    if (!hit) continue;
    const nrm = hit.n.clone().normalize();
    bone(k, nm, 'body', v3(hit.p.clone().addScaledVector(nrm, -0.012)));
    const root = hit.p.clone().addScaledVector(nrm, -0.004);
    const pairs: [THREE.Vector3, number, number, number, number, number][] = [
      // Which way it leaves the body (up and out, facing back), its middle along that and across it, its half-length
      // and half-width, and how far behind the other it stands.
      [new THREE.Vector3(side * 0.6, 0.78, -0.15), 0.115, 0.004, 0.115, 0.05, 0],
      [new THREE.Vector3(side * 0.95, 0.15, -0.2), 0.08, 0.004, 0.08, 0.034, 0.01],
    ];
    for (const [out, cu, cv, ru, rv, lift] of pairs) {
      const w = wingPlane(root, out, new THREE.Vector3(side * 0.4, -1, -0.1));
      const rim: THREE.Vector3[] = [];
      for (let i = 0; i < 14; i++) {
        const a = (i / 14) * Math.PI * 2;
        rim.push(w.at(cu + Math.cos(a) * ru, cv + Math.sin(a) * rv, lift));
      }
      membrane(k, { bone: nm, centre: w.at(cu, cv, lift), rim, up: w.N, cup: 0.004, color: '#f6fbff', edge: '#a9c0dc', glass: true });
    }
  }
  // Bands round the body (far off, where the surface is cut coarsely, two broad ones), and dark little limbs.
  const bands: [number, number][] = isLow()
    ? [
        [-1, 0.1],
        [0.19, 0.29],
      ]
    : [
        [-1, 0.09],
        [0.15, 0.21],
        [0.27, 0.33],
      ];
  k.marks = {
    base: c.coat,
    marks: [
      { color: fluff, f: region(k, /^fluff/) },
      { color: stripe, f: all(region(k, 'belly', 'chest'), (q) => Math.min(...bands.map(([a, b]) => Math.max(a - q.p.y, q.p.y - b)))) },
      { color: black, f: region(k, /^arm/, /^fore/, /^leg/) },
    ],
  };
  return { hover: 0.22, wings: 'buzz' };
};

const chameleon: Recipe = (k, c) => {
  const pale = mix(c.coat, '#f6f2d6', 0.58);
  const band = mix(c.coat, '#1e2a18', 0.28);
  const stripe = mix(c.coat, '#fbf8e8', 0.72);
  // A little chameleon standing up: a tall helmet crest (the casque) on the back of its head, eyes in round turrets
  // that swivel about each on its own, a wide smile, mitten hands and feet for gripping branches, and its tail rolled
  // up in a curl. Its skin slowly shifts colour, a shimmer running along it (see the rig).
  k.joints.neck = [0, 0.5, 0.07];
  k.joints.shoulder = [0.13, 0.41, 0.09];
  k.joints.hip = [0.1, 0.16, -0.04];
  k.joints.tail = [0, 0.2, -0.17];
  torso(k, {
    belly: [
      [0, 0.29, -0.03],
      [0.175, 0.215, 0.19],
    ],
    chest: [
      [0, 0.42, 0.03],
      [0.135, 0.12, 0.14],
    ],
    melt: 0.18,
  });
  const headAt: Vec3 = [0, 0.1, 0.07];
  headForm(k, { r: [0.165, 0.15, 0.18], at: headAt, melt: 0.12 });
  const snout = snoutForm(k, { dy: -0.18, len: 0.07, ra: 0.1, rb: 0.07, drop: 0.02, squash: [1, 0.85, 1] });
  const sc = sculptOf(k);
  const hc = plus(k.joints.neck, headAt);
  // The casque: a helmet crest rising up and back from the back of the head, narrow side to side.
  const casqueAt: Vec3 = [0, hc[1] + 0.06, hc[2] - 0.08];
  sc.add(pyramid('neck', casqueAt, 0.06, 0.2, 0.085, { rot: [-0.5, 0, 0], k: 0.035, anchor: casqueAt, reach: 0.12, round: 0.045, name: 'casque' }));
  armForms(k, { len: 0.18, r0: 0.04, r1: 0.034, paw: [0.046, 0.026, 0.046], fwd: 0.45, out: 0.32 });
  legForms(k, { r0: 0.05, r1: 0.04, foot: [0.054, 0.028, 0.066] });
  // The tail: straight back from the rump, then rolled down and under in a tightening curl (clear of itself, so the
  // turns don't melt together), drifting a little to one side as it goes.
  const pts: Vec3[] = [
    [0, 0, 0.02],
    [0, -0.004, -0.07],
  ];
  const radii = [0.062, 0.052];
  const turn = 1.55 * Math.PI;
  for (let i = 0; i <= 9; i++) {
    const a = (i / 9) * turn;
    const r = 0.1 * Math.exp(-0.18 * a);
    pts.push([0.012 * (a / Math.PI), -0.1 + r * Math.cos(a), -0.16 - r * Math.sin(a)]);
    radii.push(0.044 - 0.027 * (i / 9));
  }
  const tailAt = tailForm(k, { pts, radii });
  useSurface(k);
  mouth(k, { w: 0.5, y: -0.36, curve: 0.08, r: 0.006 });
  k.nose = snout.nose;
  // The turret eyes: a round dome out of each side of the head on a bone of its own (so it can swivel), with a
  // gold-rimmed pupil at its tip, which closes (on a bone of its own) to blink.
  const z = new THREE.Vector3(0, 0, 1);
  let eyeAt = new THREE.Vector3();
  for (const side of [-1, 1]) {
    const nm = side > 0 ? 'L' : 'R';
    const at = onHead(k, side * 0.6, 0.16);
    const axis = headNormal(k, side * 0.6, 0.16).add(new THREE.Vector3(0, 0.12, 0.3)).normalize();
    bone(k, `turret${nm}`, 'neck', v3(at.clone().addScaledVector(axis, -0.02)));
    const q = new THREE.Quaternion().setFromUnitVectors(z, axis);
    const one = new THREE.Vector3(1, 1, 1);
    solid(part(k, `turret${nm}`, `turret${nm}`), k.rnd, {
      base: 'ico2',
      r: [0.064, 0.064, 0.054],
      matrix: new THREE.Matrix4().compose(axis.clone().multiplyScalar(0.02), q, one),
      bend: (v) => {
        if (v.z > 0) {
          v.x *= 1 - 0.2 * v.z;
          v.y *= 1 - 0.2 * v.z;
        }
      },
      color: c.coat,
    });
    const apex = axis.clone().multiplyScalar(0.074);
    bone(k, `blink${nm}`, `turret${nm}`, v3(apex));
    const eye = part(k, `eye${nm}`, `turret${nm}`, { bone: `blink${nm}`, eyes: true });
    const m = new THREE.Matrix4().compose(apex.clone().addScaledVector(axis, -0.004), q, one);
    solid(eye, k.rnd, { base: 'ico2', r: [0.03, 0.03, 0.01], matrix: inside(m, [0, 0, -0.004]), color: '#d8ac3a', tone: 0.05 });
    solid(eye, k.rnd, { base: 'ico2', r: [0.021, 0.021, 0.012], matrix: m, color: INK, tone: 0.1 });
    solid(eye, k.rnd, { base: 'ico1', r: [0.007, 0.007, 0.004], matrix: inside(m, [0.007, 0.008, 0.01]), color: '#fffdf8', tone: 0 });
    eyeAt = at.clone().addScaledVector(axis, 0.05);
  }
  k.blink = ['blinkL', 'blinkR'];
  k.eyeY = eyeAt.y;
  k.eyeX = Math.abs(eyeAt.x);
  k.eyeR = 0.04;
  k.eyeZ = eyeAt.z + 0.02;
  // Crisp pale spots in a loose row along each flank (they shift colour with the rest of the skin).
  bodyDabs(k, 'body', [0, 0.3, -0.03], [[2.0, 0.35, 0.02], [1.7, 0.1, 0.022], [1.4, 0.45, 0.018], [1.1, 0.15, 0.022], [0.8, 0.42, 0.017]], stripe, 'spot');
  k.marks = {
    base: c.coat,
    marks: [
      // A paler front, and darker rings round the tail.
      { color: pale, f: frontOval(k, ['belly', 'chest'], 0, 0.3, 0.12, 0.22) },
      { color: band, f: all(region(k, /^tail\d/), (q) => 0.6 - Math.sin(tailAt(q.p) * Math.PI * 7)) },
      // A pale line along the lips.
      { color: pale, f: all(region(k, 'muzzle', 'head'), (q) => q.p.y - (snout.mid(q.p) - 0.01), (q) => -q.p.z + hc[2] + 0.05) },
    ],
  };
  return { swivel: true, shifts: true };
};

const whaleshark: Recipe = (k, c) => {
  const belly = mix(c.coat, '#f2eee6', 0.86);
  // (On a pale coat, the pattern a shade darker instead, so it still shows.)
  const pale = luminance(c.coat) > 0.6 ? mix(c.coat, '#6a7a90', 0.3) : mix(c.coat, '#f6f3ec', 0.8);
  const deep = mix(c.coat, '#1a2236', 0.28);
  const ridge = mix(c.coat, '#1a2236', 0.1);
  // The biggest fish in the sea as a gentle giant: a broad flat head with a very wide smile right across the
  // front and little eyes set far apart, a pale tummy, and its back covered in pale spots in rows between thin
  // pale stripes, over ridges running down it. Long fins for arms, a fin half way down its back, and a tall
  // crescent tail.
  k.joints.neck = [0, 0.52, 0.05];
  k.joints.shoulder = [0.21, 0.42, 0.07];
  k.joints.hip = [0.11, 0.15, -0.02];
  k.joints.tail = [0, 0.2, -0.19];
  const bellyC: Vec3 = [0, 0.29, -0.02];
  torso(k, {
    belly: [bellyC, [0.25, 0.27, 0.22]],
    chest: [
      [0, 0.46, 0.03],
      [0.225, 0.16, 0.2],
    ],
    melt: 0.2,
  });
  const headAt: Vec3 = [0, 0.11, 0.06];
  const headR: Vec3 = [0.3, 0.165, 0.25];
  headForm(k, { r: headR, at: headAt, melt: 0.2 });
  const hc = plus(k.joints.neck, headAt);
  const sc = sculptOf(k);
  // The broad, flat, blunt front of the head.
  sc.add(ellipsoid('neck', [0, hc[1] - 0.035, hc[2] + 0.1], [0.27, 0.12, 0.17], { k: 0.08, name: 'jaw' }));
  wingForms(k, { len: 0.3, w: 0.1, d: 0.04, taper: 0.62, fwd: 0.25, out: 0.62 });
  legForms(k, { r0: 0.065, r1: 0.055, foot: [0.065, 0.035, 0.085] });
  const tp = tailPath(0.3, [0, -0.15, -1], [0.3, 0, 0], 0.11, [1, 0.8, 0.58, 0.42]);
  const tailAt = tailForm(k, tp);
  const tj = new THREE.Vector3(...k.joints.tail);
  const end = plus(k.joints.tail, tp.pts[tp.pts.length - 1]);
  // The crescent tail: a tall lobe sweeping up and back and a shorter one down, each a flat blade curving back.
  const lobe = (pts: Vec3[], radii: number[], name: string) => {
    for (let i = 0; i + 1 < pts.length; i++) {
      sc.add(rod('tail2', plus(end, pts[i]), plus(end, pts[i + 1]), radii[i], radii[i + 1], { k: i === 0 ? 0.04 : 0.02, anchor: end, reach: 0.1, name: `${name}${i}`, squash: [0.34, 1, 1], thin: true }));
    }
  };
  lobe([[0, 0, 0], [0, 0.1, -0.035], [0, 0.19, -0.09], [0, 0.26, -0.17]], [0.07, 0.06, 0.042, 0.014], 'finUp');
  lobe([[0, 0, 0], [0, -0.06, -0.05], [0, -0.095, -0.12]], [0.06, 0.042, 0.014], 'finDown');
  // The fin on its back, on a bone of its own inside the body so it can fold away under a cape or a backpack.
  bone(k, 'backPlates', 'body', [0, 0.36, -0.2]);
  finForm(k, 'backPlates', [0, 0.36, -0.2], { len: 0.13, w: 0.028, d: 0.07, rot: [-1.6, 0, 0], name: 'dorsal', melt: 0.05 });
  // Where a line out from the middle of the body, round from straight behind, comes out through its back.
  const back = (a: number, y: number) => surfaceHit(k, new THREE.Vector3(0, y, bellyC[2]), new THREE.Vector3(Math.sin(a), 0, -Math.cos(a)));
  useSurface(k);
  eyes(k, { x: 0.62, y: 0.1, size: 0.62, wide: 1, slant: 0, color: '#141018' });
  mouth(k, { w: 0.68, y: -0.3, curve: 0.12, r: 0.009 });
  k.nose = v3(onHead(k, 0, -0.12));
  // (Whether a point is on the body itself, clear of the fin, the tail and the arms.)
  const probe = new Probe(sc);
  const onBody = region(k, 'belly', 'chest');
  const inBody = (p: THREE.Vector3, by = 0.005) => onBody(probe.set(p.x, p.y, p.z)) < -by;
  // Ridges down the back, two a side: low crisp ridges lying along the surface.
  for (const a of [-1.1, -0.55, 0.55, 1.1]) {
    const pts: THREE.Vector3[] = [];
    for (let y = 0.55; y > 0.17; y -= 0.055) {
      const h = back(a, y);
      if (h && inBody(h.p)) pts.push(h.p);
    }
    const w = pts.map((_, i) => (i === 0 || i === pts.length - 1 ? 0 : 0.022));
    piece(k, { bone: 'body', pts, w, t: w.map((x) => x * 0.55), across: new THREE.Vector3(Math.cos(a), 0, Math.sin(a)), colors: pts.slice(1).map(() => ridge), name: `ridge${a > 0 ? 'L' : 'R'}${Math.abs(a) > 0.8 ? 1 : 0}` });
  }
  // The pattern (crisp, see `decal`): thin stripes across the back, broken where the fin or the tail is in the
  // way, rows of spots above and below them, and smaller spots scattered evenly over the top of the head.
  for (const y of [0.25, 0.35, 0.45]) {
    const runs: THREE.Vector3[][] = [[]];
    for (let a = -1.45; a < 1.5; a += 0.1) {
      const h = back(a, y);
      if (h && inBody(h.p)) runs[runs.length - 1].push(h.p);
      else runs.push([]);
    }
    for (const pts of runs) decalLine(k, { bone: 'body', pts, w: 0.0075, color: pale });
  }
  [0.2, 0.3, 0.4, 0.5].forEach((y, row) => {
    for (const a of [-1.36, -0.83, -0.27, 0.27, 0.83, 1.36]) {
      const h = back(a, y);
      if (h && inBody(h.p, 0.03)) decal(k, { bone: 'body', from: new THREE.Vector3(0, y, bellyC[2]), dir: new THREE.Vector3(Math.sin(a), 0, -Math.cos(a)), r: 0.028, color: pale, sides: 9, name: `spot${row}_${a}` });
    }
  });
  speckle(k, 'neck', hc, headR, 80, (d) => d.y > 0.28 && d.z < 0.82, 0.022, pale, 'headSpot', 9);
  // Far off, where those aren't drawn, a few big painted spots instead.
  const far: THREE.Vector3[] = [];
  if (isLow()) {
    for (const d of fibonacci(26)) {
      const h = d.y > 0.3 && d.z < 0.8 && surfaceHit(k, new THREE.Vector3(...hc), new THREE.Vector3(d.x * headR[0], d.y * headR[1], d.z * headR[2]));
      if (h) far.push(h.p);
    }
    for (const y of [0.25, 0.43]) {
      for (const a of [-1.2, -0.45, 0.45, 1.2]) {
        const h = back(a, y);
        if (h) far.push(h.p);
      }
    }
  }
  const head = unitOf(k, 'head');
  k.marks = {
    base: c.coat,
    marks: [
      // A pale tummy, and a pale lower jaw under the smile.
      { color: belly, f: frontOval(k, ['belly', 'chest'], 0, 0.3, 0.19, 0.29) },
      { color: belly, f: all(region(k, 'head', 'jaw'), (q) => -head(q).z, (q) => head(q).y - (-0.34 + 0.12 * head(q).x ** 2)) },
      { color: belly, f: all(region(k, /^leg/), (q) => q.p.y - 0.03) },
      { color: belly, f: all(region(k, /^tail\d/), (q) => q.p.y - (tj.y + (end[1] - tj.y) * tailAt(q.p)) + 0.02) },
      { color: deep, f: region(k, 'dorsal', /^finUp/, /^finDown/) },
      { color: pale, f: (q) => Math.min(...far.map((p) => q.p.distanceTo(p))) - 0.045 },
    ],
  };
  return { aquatic: true };
};

/** Euler angles that turn a shape's own +y to point along `along`, with its own +z towards `face`. */
function turnTo(along: THREE.Vector3, face: THREE.Vector3): Vec3 {
  const y = along.clone().normalize();
  const x = new THREE.Vector3().crossVectors(y, face).normalize();
  const z = new THREE.Vector3().crossVectors(x, y);
  const e = new THREE.Euler().setFromRotationMatrix(new THREE.Matrix4().makeBasis(x, y, z));
  return [e.x, e.y, e.z];
}

/** A prawn's body, top to bottom: rings standing a little proud of it (height, how far forward, half-width, half-depth). */
const PRAWN_BANDS: [number, number, number, number][] = [
  [0.47, 0.035, 0.15, 0.14],
  [0.4, 0.01, 0.162, 0.152],
  [0.33, -0.015, 0.168, 0.158],
  [0.26, -0.03, 0.165, 0.155],
  [0.19, -0.036, 0.152, 0.142],
];

/**
 * The lines between rings (each a shape whose own y runs along the body): where a point is about as far past the end
 * of one as it is short of the start of the next.
 */
function grooves(k: Kit, names: string[], w: number): Field {
  const units = names.map((n) => unitOf(k, n));
  return (q) => {
    let d = Infinity;
    for (let i = 0; i + 1 < units.length; i++) {
      const a = units[i](q).y;
      const b = units[i + 1](q).y;
      if (a * b < 0.04) d = Math.min(d, Math.abs(a + b) * 0.5);
    }
    return d - w;
  };
}

const prawn: Recipe = (k, c) => {
  const light = mix(c.coat, '#fff3e8', 0.3);
  const deep = mix(c.coat, '#4a2028', 0.3);
  // A little prawn standing up: a round shell of a head with a pointed rostrum, eyes on short stalks and very long
  // feelers sweeping back past its body; a curved body in bands, little walking legs down the front, small claws
  // for paws, and a banded tail ending in a fan. Cut a little finer, for the bands.
  k.step = 0.034;
  k.joints.neck = [0, 0.5, 0.04];
  k.joints.shoulder = [0.13, 0.43, 0.07];
  k.joints.hip = [0.075, 0.13, 0];
  k.joints.tail = [0, 0.17, -0.12];
  // The body inside the bands, which stand proud of it all round.
  torso(k, {
    belly: [
      [0, 0.27, -0.03],
      [0.13, 0.17, 0.12],
    ],
    chest: [
      [0, 0.42, 0.015],
      [0.125, 0.11, 0.115],
    ],
    melt: 0.14,
  });
  const sc = sculptOf(k);
  const BANDS = PRAWN_BANDS.map(([y, z, w, d], i) => {
    sc.add(ellipsoid('body', [0, y, z], [w, 0.05, d], { rot: [0.06 * i, 0, 0], k: 0.012, name: `band${i}` }));
    return `band${i}`;
  });
  // (Measured round the bands, for dressing up and holding things.)
  k.shape.tr = [0.168, k.shape.tr[1], 0.165];
  k.front = (k.front ?? 0) + 0.03;
  const headAt: Vec3 = [0, 0.12, 0.04];
  headForm(k, { r: [0.19, 0.165, 0.185], at: headAt, melt: 0.1 });
  armForms(k, { len: 0.19, r0: 0.034, r1: 0.03, paw: [0.036, 0.032, 0.046], fwd: 0.55, out: 0.32 });
  legForms(k, { r0: 0.04, r1: 0.034, foot: [0.042, 0.022, 0.06], fwd: 0.025 });
  // The tail: short, in rings like the body's, curling a little up behind.
  const tp = tailPath(0.2, [0, -0.35, -1], [0.85, 0, 0], 0.075, [1, 0.86, 0.72, 0.6]);
  tailForm(k, tp);
  const tj = new THREE.Vector3(...k.joints.tail);
  const n = tp.pts.length - 1;
  const at = (i: number) => new THREE.Vector3(...tp.pts[Math.min(n, Math.floor(i))]).lerp(new THREE.Vector3(...tp.pts[Math.min(n, Math.floor(i) + 1)]), i % 1).add(tj);
  const across = new THREE.Vector3(1, 0, 0);
  const RINGS = [1.8, 5.2].map((i, j) => {
    const dir = at(i + 0.5).sub(at(i - 0.5)).normalize();
    const r = 0.09 - j * 0.014;
    sc.add(ellipsoid(i < n / 3 ? 'tail' : i < (n * 2) / 3 ? 'tail1' : 'tail2', v3(at(i)), [r, 0.034, r * 0.9], { rot: turnTo(dir, new THREE.Vector3(0, 1, 0)), k: 0.012, name: `ring${j}` }));
    return `ring${j}`;
  });
  // The fan: a pointed middle flanked by two rounded paddles a side, spread about the end of the tail and tipped up
  // a little either side of the middle, so it shows from the side as well as from above.
  const end = at(n);
  const along = at(n).sub(at(n - 1)).normalize();
  const flat = new THREE.Vector3().crossVectors(across, along).normalize();
  for (const a of [-1.1, -0.55, 0, 0.55, 1.1]) {
    const side = across.clone().multiplyScalar(Math.cos(0.45)).addScaledVector(flat, Math.sin(0.45) * Math.sign(a));
    const dir = along.clone().multiplyScalar(Math.cos(a)).addScaledVector(side, Math.sin(a));
    const base = end.clone().addScaledVector(dir, -0.02);
    if (a === 0) sc.add(pyramid('tail2', v3(base), 0.055, 0.19, 0.022, { rot: turnTo(dir, flat), k: 0.02, anchor: v3(end), reach: 0.06, round: 0.012, name: 'fan0', thin: true }));
    else sc.add(ellipsoid('tail2', v3(base.addScaledVector(dir, 0.105)), [0.056, 0.11, 0.024], { rot: turnTo(dir, new THREE.Vector3().crossVectors(side, along)), k: 0.02, anchor: v3(end), reach: 0.06, name: `fan${a > 0 ? 'L' : 'R'}${Math.abs(a) > 0.7 ? 2 : 1}`, thin: true }));
  }
  useSurface(k);
  mouth(k, { w: 0.22, y: -0.4, curve: 0.08, r: 0.006 });
  k.nose = v3(onHead(k, 0, -0.2));
  // Eyes on short stalks, each on its own bone so they can look about separately: big round dark eyes, low enough
  // on the face to stay clear of a hat.
  const tipRel = new THREE.Vector3(0, 0.06, 0.05);
  for (const side of [-1, 1]) {
    const nm = side > 0 ? 'L' : 'R';
    const base = onHead(k, side * 0.4, 0.3, -0.015);
    bone(k, `stalk${nm}`, 'neck', v3(base));
    const tip = tipRel.clone().add(new THREE.Vector3(side * 0.035, 0, 0));
    bone(k, `blink${nm}`, `stalk${nm}`, v3(tip));
    const stalk = part(k, `stalk${nm}`, `stalk${nm}`);
    pillar(stalk, k.rnd, [0, 0, 0], v3(tip), 0.021, 0.018, c.coat, { base: 'limb5' });
    const eye = part(k, `eye${nm}`, `stalk${nm}`, { bone: `blink${nm}`, eyes: true });
    const m = frame(tip);
    solid(eye, k.rnd, { base: 'ico2', r: [0.036, 0.038, 0.034], matrix: m, color: INK, tone: 0.1 });
    solid(eye, k.rnd, { base: 'ico1', r: [0.012, 0.012, 0.006], matrix: inside(m, [0.011, 0.015, 0.029]), color: '#fffdf8', tone: 0 });
    solid(eye, k.rnd, { base: 'ico1', r: [0.005, 0.005, 0.003], matrix: inside(m, [-0.012, -0.011, 0.031]), color: '#fffdf8', tone: 0 });
  }
  k.blink = ['blinkL', 'blinkR'];
  const eyeAt = onHead(k, 0.4, 0.3).add(tipRel);
  k.eyeY = eyeAt.y;
  k.eyeX = eyeAt.x + 0.035;
  k.eyeR = 0.038;
  k.eyeZ = eyeAt.z + 0.034;
  const nk = new THREE.Vector3(...k.joints.neck);
  // The rostrum: a pointed blade out of the brow between the eyes, with little teeth along its top.
  const r0 = onHead(k, 0, 0.38, -0.02).add(nk);
  const ros = [r0, r0.clone().add(new THREE.Vector3(0, 0.028, 0.065)), r0.clone().add(new THREE.Vector3(0, 0.05, 0.135)), r0.clone().add(new THREE.Vector3(0, 0.07, 0.2))];
  piece(k, { bone: 'neck', pts: ros, w: [0.016, 0.013, 0.008, 0], t: [0.03, 0.022, 0.012, 0], across, colors: [c.coat, c.coat, deep], name: 'rostrum' });
  [0.35, 0.6, 0.82].forEach((f, i) => {
    const p = ros[0].clone().lerp(ros[3], f);
    const h = 0.03 * (1 - f) + 0.004;
    piece(k, { bone: 'neck', pts: [p.clone().add(new THREE.Vector3(0, h - 0.01, -0.01)), p.clone().add(new THREE.Vector3(0, h + 0.013, 0.008))], w: [0.005, 0], t: [0.008, 0], across, colors: [c.coat], name: `rostrumTooth${i}` });
  });
  // Very long feelers from the sides of the face under the eyes, arcing out and back past the body, below where a
  // hat sits: each in a few pieces so it keeps its curve far off (where every piece is cut down to a straight spike).
  const FEELER: Vec3[] = [
    [0, 0, 0],
    [0.04, 0.005, 0.02],
    [0.11, 0.035, 0.005],
    [0.19, 0.075, -0.05],
    [0.265, 0.08, -0.16],
    [0.32, 0.03, -0.3],
    [0.355, -0.09, -0.45],
    [0.365, -0.26, -0.56],
    [0.36, -0.45, -0.61],
  ];
  // Each is on a bone of its own at its root, so it can drift about, and lie along the covers in bed.
  for (const side of [-1, 1]) {
    const nm = `feeler${side > 0 ? 'L' : 'R'}`;
    const at = onHead(k, side * 0.58, 0.14, -0.015);
    bone(k, nm, 'neck', v3(at));
    const root = at.add(nk);
    const curve = new THREE.CatmullRomCurve3(FEELER.map(([x, y, z]) => root.clone().add(new THREE.Vector3(side * x, y, z))));
    const pts = curve.getSpacedPoints(16);
    const w = pts.map((_, i) => (i === 16 ? 0 : 0.0075 - 0.0045 * (i / 16)));
    for (let j = 0; j < 4; j++) {
      const a = j * 4;
      piece(k, { bone: nm, pts: pts.slice(a, a + 5), w: w.slice(a, a + 5), t: w.slice(a, a + 5), across: new THREE.Vector3(0, 1, 0), colors: [c.coat, c.coat, c.coat, c.coat], name: `${nm}${j}` });
    }
  }
  // Small claws: a fixed finger and a moving one on each paw, a little open and curving in at the tips.
  for (const p of k.paws ?? []) {
    const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(...p.rot));
    const c0 = new THREE.Vector3(...p.at);
    const fwd = new THREE.Vector3(0, 0, 1).applyQuaternion(q);
    const upv = new THREE.Vector3(0, 1, 0).applyQuaternion(q);
    const x = new THREE.Vector3(1, 0, 0).applyQuaternion(q);
    for (const s of [1, -1]) {
      const at = (f: number, u: number) => c0.clone().addScaledVector(fwd, f).addScaledVector(upv, u * s);
      piece(k, { bone: p.bone, pts: [at(0.005, 0.012), at(0.045, 0.02), at(0.075, 0.016), at(0.095, 0.004)], w: [0.017, 0.015, 0.011, 0], t: [0.014, 0.012, 0.009, 0], across: x, colors: [c.coat, c.coat, deep], name: `claw${p.bone}${s > 0 ? 'Top' : 'Low'}` });
    }
  }
  // Little walking legs down the front, in pairs, each bent at the knee.
  for (let i = 0; i < 4; i++) {
    const y = 0.43 - i * 0.07;
    for (const side of [-1, 1]) {
      const hit = surfaceHit(k, new THREE.Vector3(side * 0.05, y, 0), new THREE.Vector3(side * 0.4, -0.1, 1));
      if (!hit) continue;
      const root = hit.p.clone().addScaledVector(hit.n, -0.015);
      const knee = hit.p.clone().add(new THREE.Vector3(side * 0.025, 0.012, 0.035));
      const ankle = knee.clone().add(new THREE.Vector3(side * 0.008, -0.055, 0.01));
      const toe = ankle.clone().add(new THREE.Vector3(0, -0.008, 0.004));
      piece(k, { bone: 'body', pts: [root, knee, ankle, toe], w: [0.012, 0.011, 0.009, 0], t: [0.011, 0.01, 0.008, 0], across, colors: [c.coat, c.coat, c.coat], name: `walker${side > 0 ? 'L' : 'R'}${i}` });
    }
  }
  k.marks = {
    base: c.coat,
    marks: [
      // A darker line in each groove between the bands, down the body and along the tail.
      { color: deep, f: all(region(k, ...BANDS, 'belly', 'chest'), grooves(k, BANDS, 0.2)) },
      { color: deep, f: all(region(k, ...RINGS, /^tail\d/), grooves(k, RINGS, 0.16)) },
      // A paler front.
      { color: light, f: frontOval(k, BANDS, 0, 0.3, 0.1, 0.2) },
      { color: deep, f: region(k, /^fan/) },
    ],
  };
  return { aquatic: true };
};

const meerkat: Recipe = (k, c) => {
  const pale = mix(c.coat, '#f7ecd6', 0.62);
  const dark = mix(c.coat, '#2c2019', 0.8);
  const band = mix(c.coat, '#3a2a1e', 0.22);
  // A little sentry standing bolt upright on its back legs: a slim body with a pale front, front paws held up under
  // its chin, a small head tapering to a pointed nose, dark patches round its big eyes, little dark ears low on the
  // sides of its head, faint dark bands across its back, and a thin tail reaching the ground with a dark tip.
  k.joints.neck = [0, 0.66, 0.05];
  k.joints.shoulder = [0.1, 0.55, 0.07];
  k.joints.hip = [0.08, 0.16, -0.02];
  k.joints.tail = [0, 0.17, -0.14];
  torso(k, {
    belly: [
      [0, 0.3, -0.01],
      [0.165, 0.27, 0.155],
    ],
    chest: [
      [0, 0.53, 0.03],
      [0.12, 0.15, 0.12],
    ],
    melt: 0.22,
  });
  headForm(k, { r: [0.15, 0.135, 0.15], at: [0, 0.11, 0.05], melt: 0.1 });
  const snout = snoutForm(k, { dy: -0.24, len: 0.1, ra: 0.075, rb: 0.03, drop: 0.035, squash: [1.05, 0.85, 1], thin: true });
  earForms(k, { x: 0.86, y: 0.3, w: 0.042, h: 0.05, d: 0.022, round: true, splay: 1.1, rake: 0.05, turn: 0.3 });
  armForms(k, { len: 0.17, r0: 0.034, r1: 0.028, paw: [0.032, 0.026, 0.036], fwd: 0.6, out: 0.12 });
  legForms(k, { r0: 0.05, r1: 0.04, foot: [0.045, 0.024, 0.08] });
  const tailAt = tailForm(k, tailPath(0.44, [0, -0.75, -1], [0.6, 0, 0], 0.045, [1, 0.85, 0.7, 0.55, 0.4]));
  useSurface(k);
  eyes(k, { x: 0.42, y: 0.14, size: 0.95, wide: 1, slant: 0.05, color: '#120d0b' });
  nose(k, '#2a1f1a', onSnout(k, snout.nose), 0.02, 0.016);
  whiskers(k, c.coat, { len: 0.07 });
  mouth(k, { w: 0.12, y: -0.52, curve: 0.06, r: 0.0055 });
  const head = unitOf(k, 'head');
  // A dark patch round each eye, a teardrop running down and back from it.
  const patch = (q: Probe) => {
    const u = head(q);
    return segDist(Math.abs(u.x), u.y, 0.42, 0.18, 0.62, -0.14).d - 0.2 + (u.z < 0.1 ? 1 : 0);
  };
  // Bands across the lower back, wavy and a little broken up.
  const bands = (q: Probe) => {
    const w = (q.p.y + 0.015 * Math.sin(q.p.x * 30)) / 0.065;
    return Math.max(Math.abs(w - Math.round(w)) - 0.2, q.p.z + 0.05, Math.abs(q.p.y - 0.32) - 0.15) * 0.1;
  };
  k.marks = {
    base: c.coat,
    marks: [
      { color: dark, f: region(k, 'earL', 'earR') },
      { color: dark, f: all(region(k, 'head', 'muzzle'), patch) },
      { color: pale, f: region(k, 'muzzle') },
      { color: pale, f: all(region(k, 'head'), (q) => 0.25 - head(q).z) },
      { color: pale, f: frontOval(k, ['belly', 'chest'], 0, 0.36, 0.12, 0.34) },
      { color: band, f: all(region(k, 'belly', 'chest'), bands) },
      { color: mix(c.coat, dark, 0.35), f: region(k, 'armLPaw', 'armRPaw', 'legLFoot', 'legRFoot') },
      { color: dark, f: all(region(k, /^tail\d/), (q) => 0.78 - tailAt(q.p)) },
    ],
  };
  return {};
};

const skeleton: Recipe = (k, c) => {
  // (On a dark skeleton, the hollows are pale instead, so they still show.)
  const dim = luminance(c.coat) < 0.08;
  const hollow = dim ? mix(c.coat, '#efe8f4', 0.62) : mix(c.coat, '#1c1522', 0.86);
  const socket = dim ? mix(c.coat, '#efe8f4', 0.42) : mix(c.coat, '#3a3040', 0.84);
  const gap = dim ? mix(c.coat, '#efe8f4', 0.32) : mix(c.coat, '#3c3048', 0.62);
  // A friendly little skeleton out of a Halloween storybook: a big round skull with big shiny eyes set in dark
  // sockets, a little nose hole and a toothy grin, a rib cage over a slender spine, a round pelvis, and thin bony
  // arms and legs with knobbly joints, ending in bony hands and feet.
  k.joints.neck = [0, 0.56, 0];
  k.joints.shoulder = [0.15, 0.5, 0];
  k.joints.hip = [0.075, 0.17, 0];
  k.joints.tail = [0, 0.2, -0.1];
  // (Cut a little finer, for its thin bones.)
  k.step = 0.03;
  const sc = sculptOf(k);
  const n = k.joints.neck;
  // The rib cage, the spine below it, and the pelvis. (Its summary for dress-up, seats and holding is the cage.)
  sc.add(ellipsoid('body', [0, 0.42, 0.01], [0.15, 0.135, 0.125], { name: 'ribs' }));
  sc.add(rod('body', [0, 0.33, -0.03], [0, 0.21, -0.03], 0.042, 0.042, { k: 0.03, name: 'spine' }));
  sc.add(ellipsoid('body', [0, 0.205, -0.005], [0.115, 0.052, 0.08], { k: 0.035, name: 'pelvis' }));
  sc.add(rod('neck', [0, n[1] - 0.09, -0.02], [0, n[1] + 0.04, -0.01], 0.036, 0.036, { k: 0.03, name: 'neckBone' }));
  k.shape.tc = [0, 0.36, 0];
  k.shape.tr = [0.15, 0.2, 0.125];
  k.shape.pear = 0;
  k.front = 0.135;
  k.seat = 0.14;
  headForm(k, { r: [0.205, 0.19, 0.19], at: [0, 0.18, 0.01], melt: 0.05 });
  // Cheekbones, and the jaw: narrower than the skull and a little forward.
  const hc = plus(n, k.shape.hc);
  for (const side of [-1, 1]) sc.add(ellipsoid('neck', [side * 0.11, hc[1] - 0.09, hc[2] + 0.1], [0.06, 0.045, 0.06], { k: 0.04, name: side > 0 ? 'cheekL' : 'cheekR' }));
  sc.add(ellipsoid('neck', [0, hc[1] - 0.14, hc[2] + 0.06], [0.12, 0.07, 0.11], { k: 0.05, name: 'jaw' }));
  armForms(k, { len: 0.2, r0: 0.026, r1: 0.022, paw: [0.03, 0.034, 0.028], fwd: 0.2, out: 0.2 });
  for (const nm of ['armL', 'armR']) sc.named(nm)!.k = 0.015;
  legForms(k, { r0: 0.03, r1: 0.026, foot: [0.045, 0.026, 0.075], fwd: 0.04 });
  // Knobbly joints: a ball at each shoulder, elbow and knee.
  const elbow = k.elbow ?? 0.1;
  for (const side of [-1, 1]) {
    const L = side > 0 ? 'L' : 'R';
    const sh: Vec3 = [side * k.joints.shoulder[0], k.joints.shoulder[1], k.joints.shoulder[2]];
    sc.add(ellipsoid(`arm${L}`, sh, [0.04, 0.04, 0.04], { k: 0.015, name: `shoulder${L}` }));
    const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(...k.bind!.armL.map((x, i) => (i === 2 ? x * side : x)) as Vec3));
    const e = new THREE.Vector3(0, -elbow, 0).applyQuaternion(q).add(new THREE.Vector3(...sh));
    sc.add(ellipsoid(`fore${L}`, v3(e), [0.032, 0.032, 0.032], { k: 0.02, name: `elbow${L}` }));
    sc.add(ellipsoid(`leg${L}`, [side * k.joints.hip[0], 0.1, k.joints.hip[2] + 0.005], [0.035, 0.035, 0.035], { k: 0.02, name: `knee${L}` }));
  }
  useSurface(k);
  eyes(k, { x: 0.36, y: 0.04, size: 1.45, wide: 1, slant: 0, color: '#120e16' });
  // A toothy grin: a curved line with little ticks across it.
  mouth(k, { w: 0.28, y: -0.5, curve: 0.1, r: 0.0055, color: hollow });
  const nk = new THREE.Vector3(...n);
  for (let i = -3; i <= 3; i++) {
    const ux = (i / 3.5) * 0.28;
    const uy = -0.5 + 0.1 * (ux / 0.28) ** 2;
    const at = onHead(k, ux, uy).add(nk);
    const nrm = headNormal(k, ux, uy);
    piece(k, { bone: 'neck', pts: [at.clone().add(new THREE.Vector3(0, 0.022, 0)).addScaledVector(nrm, -0.002), at.clone().addScaledVector(nrm, 0.002), at.clone().add(new THREE.Vector3(0, -0.022, 0)).addScaledVector(nrm, -0.002)], w: [0, 0.0032, 0], t: [0, 0.0022, 0], across: new THREE.Vector3(1, 0, 0), colors: [hollow, hollow], name: `tooth${i}` });
  }
  // Bony fingers: three little bones curling down from each hand.
  for (const p of k.paws ?? []) {
    const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(...p.rot));
    const at = new THREE.Vector3(...p.at);
    const L = (x: number, y: number, z: number) => at.clone().add(new THREE.Vector3(x, y, z).applyQuaternion(q));
    for (const f of [-1, 0, 1]) {
      piece(k, { bone: p.bone, pts: [L(0, -0.015, f * 0.016), L(0.004, -0.045, f * 0.02 + 0.006), L(0.0, -0.068, f * 0.022 + 0.012)], w: [0.008, 0.007, 0], t: [0.008, 0.007, 0], across: new THREE.Vector3(0, 0, 1).applyQuaternion(q), colors: [c.coat, c.coat], name: `finger${p.bone}${f}` });
    }
  }
  // The ribs: shadowed gaps curving round the cage between them, leaving the breastbone down the front and the
  // spine down the back.
  for (const y of [0.345, 0.4, 0.455]) {
    for (const side of [-1, 1]) {
      const pts = [0.28, 0.6, 0.95, 1.3, 1.65, 2.0, 2.35, 2.7].map((a) => surfaceHit(k, new THREE.Vector3(0, y, 0.01), new THREE.Vector3(side * Math.sin(a), -0.28 * Math.sin(a), Math.cos(a)))?.p);
      if (pts.every(Boolean)) decalLine(k, { bone: 'body', pts: pts as THREE.Vector3[], w: 0.0095, color: gap });
    }
  }
  const lowRibs = (q: Probe) => {
    const w = (q.p.y - 0.33 + 0.9 * q.p.x * q.p.x) / 0.06;
    return Math.max(Math.abs(w - Math.floor(w) - 0.5) - 0.18, 0.03 - Math.abs(q.p.x), q.p.y - 0.48);
  };
  const head = unitOf(k, 'head');
  const face = (f: (u: THREE.Vector3) => number) => all(region(k, 'head'), (q) => {
    const u = head(q);
    return u.z < 0 ? 1 : f(u);
  });
  k.marks = {
    base: c.coat,
    marks: [
      // Big dark sockets round the eyes, and a little upside-down heart of a nose between them.
      { color: socket, f: face((u) => Math.hypot(Math.abs(u.x) - 0.36, u.y - 0.04) - 0.33) },
      { color: hollow, f: face((u) => Math.hypot(Math.abs(u.x) - 0.045, u.y + 0.2) - 0.06 + Math.max(0, u.y + 0.2) * 0.4) },
      // Far off, where the gaps between the ribs aren't drawn, broad bands painted round the cage instead.
      ...(isLow() ? [{ color: gap, f: all(region(k, 'ribs'), lowRibs) }] : []),
    ],
  };
  return {};
};

export const RECIPES: Record<AnimalId, Recipe> = {
  raccoon,
  fox,
  snail,
  wolf,
  bear,
  deer,
  hedgehog,
  panda,
  penguin,
  otter,
  frog,
  axolotl,
  shark,
  octopus,
  duck,
  platypus,
  capybara,
  redpanda,
  quokka,
  sloth,
  seal,
  highland,
  squid,
  bat,
  jellyfish,
  gecko,
  ferret,
  dugong,
  seacucumber,
  ibis,
  crab,
  turtle,
  kaiju,
  robot,
  homunculus,
  fungi,
  dragon,
  bee,
  chameleon,
  whaleshark,
  prawn,
  meerkat,
  skeleton,
};

/** How each species carries itself. Anything left out is the plain default. */
const PROFILES: Partial<Record<AnimalId, Partial<Profile>>> = {
  // Slender and alert: upright, head up, a light quick trot, sits with its tail wrapped round its feet.
  fox: { lean: -0.03, head: -0.07, gait: 'trot', cadence: 1.25, stride: 0.9, sit: 'wrap', idles: ['earSwivel', 'tailSwish', 'headTilt'], tailSway: 0.3 },
  // Hunched with its paws held in front, an ambling roll, sits like the papercraft sculpture.
  raccoon: { lean: 0.14, head: -0.05, paws: 0.2, gait: 'amble', cadence: 0.85, sit: 'tuck', idles: ['rubPaws', 'sniff', 'lookAround'], tailSway: 0.18 },
  // Slides along with a slow stretch and draw, settles low to sit.
  snail: { gait: 'slither', cadence: 0.55, sit: 'settle', idles: ['stalks', 'stretch', 'stalks'], tailSway: 0 },
  // Bobs about on stubby legs with its fins out, swishes its tail. Sleeps curled up on its side (clear of its fin).
  shark: { lean: 0.04, head: -0.02, gait: 'waddle', cadence: 1, stride: 0.7, sit: 'settle', bed: 'side', idles: ['tailSwish', 'headTilt', 'chill'], tailSway: 0.25 },
  // Drifts, sways and pulses.
  jellyfish: { gait: 'float', cadence: 0.6, sit: 'settle', idles: ['sway', 'chill', 'sway'], tailSway: 0 },
  // Ripples along on its tentacles, stretches, sways.
  octopus: { gait: 'scuttle', cadence: 1.1, sit: 'settle', bed: 'upright', idles: ['sway', 'stretch', 'chill'], tailSway: 0 },
  // Upright and stiff, waddles with its flippers out, flaps them now and then.
  penguin: { lean: -0.02, head: -0.04, gait: 'waddle', cadence: 1.2, stride: 0.55, sit: 'settle', idles: ['flap', 'headTilt', 'chill'], tailSway: 0.1 },
  // Waddles, flaps, wags its tail.
  duck: { lean: 0.04, head: -0.03, gait: 'waddle', cadence: 1.15, stride: 0.6, sit: 'settle', idles: ['flap', 'headTilt', 'wag'], tailSway: 0.2 },
  // Always on the wing: flaps along, scratches an ear, looks about.
  bat: { gait: 'flap', cadence: 1.2, sit: 'settle', idles: ['wingStretch', 'scratch', 'lookAround'], tailSway: 0 },
  // Ripples along on its arms like the octopus, sways and stretches.
  squid: { gait: 'scuttle', cadence: 1, sit: 'settle', idles: ['sway', 'chill', 'stretch'], tailSway: 0 },
  // Snuffles about on quick little steps, nose always going. Sleeps curled up on its side, off its spines.
  hedgehog: { lean: 0.04, head: -0.04, paws: 0.1, gait: 'trot', cadence: 1.5, stride: 0.6, sit: 'tuck', bed: 'side', idles: ['sniff', 'noseWiggle', 'lookAround'], tailSway: 0 },
  // Waddles with a swish of its tail, smiling.
  axolotl: { lean: 0.02, head: -0.02, gait: 'waddle', cadence: 0.9, stride: 0.7, sit: 'settle', idles: ['headTilt', 'tailSwish', 'chill'], tailSway: 0.3 },
  // Quick and alert, the tail curling.
  gecko: { lean: 0.05, head: -0.04, gait: 'trot', cadence: 1.3, stride: 0.8, sit: 'tuck', idles: ['lookAround', 'tailCurl', 'headTilt'], tailSway: 0.3 },
  // Big and unhurried: ambles, swishes its tail.
  highland: { lean: 0.04, head: -0.02, gait: 'amble', cadence: 0.75, stride: 0.9, sit: 'tuck', idles: ['chill', 'headTilt', 'tailSwish'], tailSway: 0.2 },
  // Light on its feet, ears always moving.
  deer: { lean: -0.02, head: -0.06, gait: 'trot', cadence: 1.1, stride: 1, sit: 'tuck', idles: ['earTwitch', 'lookAround', 'headTilt'], tailSway: 0.1 },
  // Very slow: a dawdling amble, slow blinks and long stretches.
  sloth: { lean: 0.06, head: -0.04, gait: 'amble', cadence: 0.5, stride: 0.8, sit: 'tuck', idles: ['slowBlink', 'stretch', 'headTilt'], tailSway: 0 },
  // Sways on its back flippers, flaps a flipper, tilts its head.
  seal: { lean: 0.02, head: -0.02, gait: 'waddle', cadence: 0.9, stride: 0.6, sit: 'settle', idles: ['headTilt', 'chill', 'flap'], tailSway: 0 },
  // Waddles, snuffles with its bill, swishes its paddle.
  platypus: { lean: 0.05, head: -0.03, gait: 'waddle', cadence: 1, stride: 0.7, sit: 'settle', idles: ['sniff', 'tailSwish', 'chill'], tailSway: 0.2 },
  // Big and easy: a rolling amble, sits back with its feet out, scratches.
  panda: { lean: 0.06, head: -0.03, gait: 'amble', cadence: 0.8, stride: 0.9, sit: 'feet', idles: ['chill', 'headTilt', 'scratch'], tailSway: 0.05 },
  // Up tall and fidgety, paws held up, rubbing them together.
  otter: { lean: -0.03, head: -0.05, paws: 0.14, gait: 'trot', cadence: 1.3, stride: 0.85, sit: 'tuck', idles: ['rubPaws', 'lookAround', 'headTilt'], tailSway: 0.3 },
  // Utterly calm: a slow amble, slow blinks.
  capybara: { lean: 0.04, head: 0, gait: 'amble', cadence: 0.7, stride: 0.8, sit: 'tuck', idles: ['chill', 'slowBlink', 'lookAround'], tailSway: 0 },
  // Rangy and watchful: a long easy trot, ears always turning, tongue out when it's warm.
  wolf: { lean: -0.02, head: -0.05, gait: 'trot', cadence: 1.1, stride: 1, sit: 'wrap', idles: ['earSwivel', 'lookAround', 'pant'], tailSway: 0.2 },
  // Big and easy: a rolling amble, sits back with its feet out, scratches and sniffs.
  bear: { lean: 0.06, head: -0.03, gait: 'amble', cadence: 0.8, stride: 0.9, sit: 'feet', idles: ['scratch', 'sniff', 'chill'], tailSway: 0.05 },
  // Ambles, looks about, swishes its big ringed tail.
  redpanda: { lean: 0.03, head: -0.04, gait: 'amble', cadence: 1, stride: 0.85, sit: 'wrap', idles: ['lookAround', 'tailSwish', 'rubPaws'], tailSway: 0.25 },
  // Hops along on its big feet, smiling, paws held up.
  quokka: { lean: 0.02, head: -0.03, paws: 0.12, gait: 'hop', cadence: 1, sit: 'feet', idles: ['headTilt', 'sniff', 'chill'], tailSway: 0.05 },
  // Squat and still, its throat pulsing; hops everywhere.
  frog: { lean: 0.05, head: -0.06, gait: 'hop', cadence: 1, sit: 'settle', idles: ['throat', 'slowBlink', 'hop'], tailSway: 0 },
  // Never still: a quick bouncy trot, nose going, now and then a little hop of excitement.
  ferret: { lean: -0.02, head: -0.05, paws: 0.1, gait: 'trot', cadence: 1.45, stride: 0.85, sit: 'tuck', idles: ['sniff', 'hop', 'lookAround'], tailSway: 0.3 },
  // Slow and gentle: shuffles along on its fluke, flaps a flipper, blinks.
  dugong: { lean: 0.03, head: -0.02, gait: 'waddle', cadence: 0.75, stride: 0.5, sit: 'settle', idles: ['chill', 'slowBlink', 'flap'], tailSway: 0 },
  // Inches along on its belly, stretching and drawing up its back end; sways and stretches about.
  seacucumber: { gait: 'slither', cadence: 0.5, sit: 'settle', idles: ['stretch', 'sway', 'chill'], tailSway: 0 },
  // Strides about on its long legs, probing about with its beak, stretching a wing.
  ibis: { lean: 0.1, head: -0.02, gait: 'trot', cadence: 0.95, stride: 0.8, sit: 'settle', idles: ['sniff', 'headTilt', 'wingStretch'], tailSway: 0.08 },
  // Scuttles about on its little legs, claws up, eyes swivelling on their stalks.
  crab: { lean: 0, head: 0, paws: 0.12, gait: 'scuttle', cadence: 1.3, stride: 0.6, sit: 'settle', idles: ['stalks', 'rubPaws', 'lookAround'], tailSway: 0 },
  // Unhurried: a slow waddle, slow blinks, a stretch of the neck.
  turtle: { lean: 0.03, head: -0.02, gait: 'waddle', cadence: 0.6, stride: 0.55, sit: 'settle', idles: ['slowBlink', 'headTilt', 'chill'], tailSway: 0.05 },
  // Stomps about in a heavy rolling amble, the great tail swinging behind; looks about, stretches up tall. Sleeps
  // curled up on its side, off its plates.
  kaiju: { lean: 0.06, head: -0.03, paws: 0.1, gait: 'amble', cadence: 0.7, stride: 0.85, sit: 'tuck', bed: 'side', idles: ['lookAround', 'stretch', 'tailSwish'], tailSway: 0.15 },
  // Stiff little steps, rocking from foot to foot like a wind-up toy; swivels its head right round, sits with its feet out.
  robot: { lean: 0, head: 0, gait: 'waddle', cadence: 1.3, stride: 0.5, sit: 'feet', idles: ['headSwivel', 'lookAround', 'headTilt'], tailSway: 0 },
  // Scampers about on its big feet, rubbing its big hands together, ears twitching.
  homunculus: { lean: 0.04, head: -0.04, gait: 'trot', cadence: 1.4, stride: 0.75, sit: 'feet', idles: ['rubPaws', 'earTwitch', 'headTilt', 'lookAround'], tailSway: 0 },
  // Hops everywhere, sways a little, blinks slowly.
  fungi: { lean: 0, head: -0.02, gait: 'hop', cadence: 1.05, sit: 'feet', idles: ['sway', 'headTilt', 'slowBlink'], tailSway: 0 },
  // Waddles about on its stubby legs, little arms up; flutters its tiny wings now and then, swishes its tail. Sleeps
  // curled up on its side, off its wings and spikes.
  dragon: { lean: 0.03, head: -0.04, paws: 0.12, gait: 'waddle', cadence: 1.05, stride: 0.65, sit: 'feet', bed: 'side', idles: ['flutter', 'tailSwish', 'lookAround', 'flutter'], tailSway: 0.2 },
  // Always on the wing, buzzing about; rubs its little hands, twitches an antenna, looks about.
  bee: { lean: 0.02, head: -0.03, gait: 'flap', cadence: 1.3, stride: 0.7, sit: 'settle', idles: ['rubPaws', 'earTwitch', 'lookAround'], tailSway: 0 },
  // Slow and careful, rocking as it goes; sways, tilts its head, its eyes always roving.
  chameleon: { lean: 0.04, head: -0.03, gait: 'amble', cadence: 0.6, stride: 0.75, sit: 'feet', idles: ['sway', 'headTilt', 'lookAround'], tailSway: 0.05 },
  // Unhurried and gentle: a slow waddle, slow blinks, a lazy swish of the great tail. Sleeps on its side, off its fin.
  whaleshark: { lean: 0.03, head: -0.02, gait: 'waddle', cadence: 0.75, stride: 0.6, sit: 'settle', bed: 'side', idles: ['slowBlink', 'tailSwish', 'chill'], tailSway: 0.22 },
  // Scuttles about on quick little steps, claws up, eyes swivelling on their stalks.
  prawn: { lean: 0.02, head: -0.03, paws: 0.12, gait: 'scuttle', cadence: 1.35, stride: 0.6, sit: 'settle', idles: ['stalks', 'rubPaws', 'tailSwish'], tailSway: 0.2 },
  // Bolt upright with its paws held up under its chin, scurrying about in quick little bursts; every so often it
  // stands up tall on its toes to keep watch, looking sharply this way and that.
  meerkat: { lean: -0.04, head: -0.06, paws: 0.17, gait: 'trot', cadence: 1.55, stride: 0.75, sit: 'feet', idles: ['sentinel', 'lookAround', 'sniff', 'sentinel'], tailSway: 0.12 },
  // A jaunty, loose-limbed little walk; tilts its head, looks about, and has a good stretch now and then.
  skeleton: { lean: 0, head: -0.03, gait: 'trot', cadence: 1.2, stride: 0.85, sit: 'feet', idles: ['headTilt', 'lookAround', 'stretch'], tailSway: 0 },
};

/** Finishing touches: toes on the feet, claws, buck teeth. */
export const DETAILS: Partial<Record<AnimalId, Details>> = {
  fox: { toes: 2, paws: 2 },
  penguin: { toes: 2 },
  wolf: { toes: 2, paws: 2 },
  redpanda: { toes: 2, paws: 2 },
  quokka: { toes: 2 },
  panda: { toes: 2 },
  raccoon: { toes: 3 },
  bear: { claws: 3 },
  gecko: { toes: 3, paws: 3 },
  otter: { toes: 3 },
  ferret: { toes: 2, paws: 2 },
  kaiju: { claws: 3 },
  homunculus: { toes: 3 },
  dragon: { claws: 3 },
  // Two bundles of toes on each foot and hand, for gripping.
  chameleon: { toes: 1, paws: 1 },
  meerkat: { toes: 2, claws: 3 },
  skeleton: { toes: 2 },
};

export function profileOf(id: AnimalId): Profile {
  return { ...defaultProfile(), ...PROFILES[id] };
}
