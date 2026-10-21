import * as THREE from 'three';
import type { Vec3 } from './build';
import { all, any, armForms, beakForm, earForms, earMarks, finForm, headForm, legForms, membraneWings, region, sculptOf, snoutForm, sock as sockOf, tailForm, tentacleForms, torso, unitOf, useSurface, wingForms } from './forms';
import { curve, pillar, solid } from './paper';
import { ellipsoid, pyramid, rod, spiral, type Probe } from './sculpt';
import {
  CHARCOAL,
  CREAM,
  INK,
  PINK,
  arms,
  body,
  bone,
  defaultProfile,
  ears,
  eyes,
  frame,
  head,
  inside,
  legs,
  mix,
  mouth,
  muzzle,
  nose,
  onHead,
  part,
  segDist,
  tail,
  v3,
  type Colors,
  type Kit,
  type Profile,
  type Recipe,
  type RecipeResult,
} from './species';
import type { AnimalId } from './types';

/**
 * Every species: how it's sculpted (see forms.ts) and painted, and how it carries itself (its profile: posture,
 * gait, how it sits, and the little things it does while standing about).
 */

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
  eyes(k, { x: 0.38, y: 0.06, size: 0.85, wide: 1.3, slant: 0.18, color: '#121010', out: 0.006 });
  // A dark triangle of a nose on its own bone, for sniffing.
  nose(k, '#2a2624', onSnout(k, snout.nose), 0.03, 0.022, true);
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
      { color: cream, f: any(region(k, 'cheekL', 'cheekR'), all(face, (q) => head(q).y + 0.5)) },
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

const bunny: Recipe = (k, c) => {
  const pale = mix(c.coat, CREAM, 0.55);
  const pink = mix(c.coat, '#e3a0a6', 0.75);
  // Round and soft: a round body on big haunches, a round head with chubby cheeks, little paws tucked
  // into the chest, long feet.
  k.joints.neck = [0, 0.535, 0.035];
  k.joints.shoulder = [0.1, 0.42, 0.13];
  k.joints.hip = [0.1, 0.15, -0.03];
  k.joints.tail = [0, 0.17, -0.2];
  torso(k, {
    belly: [
      [0, 0.24, -0.03],
      [0.215, 0.235, 0.2],
    ],
    chest: [
      [0, 0.4, 0.03],
      [0.16, 0.14, 0.15],
    ],
    haunch: [
      [0.12, 0.14, -0.06],
      [0.115, 0.12, 0.16],
    ],
  });
  headForm(k, {
    r: [0.19, 0.175, 0.18],
    at: [0, 0.15, 0.05],
    cheeks: [
      [0.11, -0.08, 0.04],
      [0.09, 0.08, 0.09],
    ],
  });
  const snout = snoutForm(k, { dy: -0.3, len: 0.03, ra: 0.075, rb: 0.06, drop: 0.012, squash: [1.15, 0.8, 1] });
  earForms(k, { x: 0.3, y: 0.8, w: 0.055, h: 0.2, d: 0.035, splay: 0.12, rake: 0.15, long: true, cup: 0.55 });
  armForms(k, { len: 0.15, r0: 0.055, r1: 0.045, paw: [0.045, 0.034, 0.05], fwd: 1.0, out: 0.08 });
  legForms(k, { r0: 0.065, r1: 0.05, foot: [0.055, 0.042, 0.125], fwd: 0.06 });
  // A round puff of a tail.
  const j = k.joints.tail;
  sculptOf(k).add(ellipsoid('tail', [j[0], j[1] + 0.01, j[2] - 0.035], [0.06, 0.06, 0.054], { k: 0.025, anchor: j, reach: 0.07, name: 'puff' }));
  useSurface(k);
  eyes(k, { x: 0.44, y: 0.1, size: 1.05, wide: 0.95, slant: 0.05, color: '#1c1416' });
  // A little pink nose on its own bone, for wiggling.
  nose(k, pink, onSnout(k, snout.nose, 0.004), 0.021, 0.016, true);
  const ears = ['earL', 'earR'].map((e) => earMarks(k, e));
  k.marks = {
    base: c.coat,
    marks: [
      { color: pink, f: any(...ears.map((e) => e.inner)) },
      // A pale muzzle, tummy, tail and soles.
      { color: pale, f: region(k, 'muzzle') },
      { color: pale, f: region(k, 'puff') },
      { color: pale, f: all(region(k, 'belly', 'chest'), (q) => -q.p.z, (q) => Math.hypot(q.p.x / 0.12, (q.p.y - 0.25) / 0.16) - 1) },
      { color: pale, f: all(region(k, /^leg[LR]Foot$/), (q) => q.p.y - 0.012) },
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

const owl: Recipe = (k, c) => {
  const light = mix(c.coat, CREAM, 0.72);
  const dark = mix(c.coat, CHARCOAL, 0.45);
  const gold = '#d9962e';
  // A round barrel of a bird with a big round head sat straight on it, wings folded down its sides.
  k.joints.neck = [0, 0.56, 0.02];
  k.joints.shoulder = [0.2, 0.47, 0];
  k.joints.hip = [0.08, 0.12, 0.03];
  k.joints.tail = [0, 0.16, -0.17];
  torso(k, {
    belly: [
      [0, 0.3, 0],
      [0.24, 0.29, 0.21],
    ],
    chest: [
      [0, 0.46, 0.02],
      [0.21, 0.15, 0.19],
    ],
    melt: 0.18,
  });
  headForm(k, { r: [0.27, 0.23, 0.23], at: [0, 0.17, 0.01], melt: 0.14 });
  // Feathery ear tufts.
  earForms(k, { x: 0.62, y: 0.74, w: 0.055, h: 0.11, d: 0.03, splay: 0.45, rake: 0.2, notch: true });
  const beakTip = beakForm(k, { dy: -0.1, len: 0.06, w: 0.032, h: 0.03, drop: 0.75 });
  wingForms(k, { len: 0.34, w: 0.12, d: 0.04, fwd: 0.04, out: 0.1 });
  legForms(k, { r0: 0.05, r1: 0.04, foot: [0.05, 0.025, 0.07], fwd: 0.04 });
  finForm(k, 'tail', k.joints.tail, { len: 0.13, w: 0.09, d: 0.022, rot: [-(Math.PI / 2 + 0.55), 0, 0], name: 'tailFan' });
  useSurface(k);
  // Big round eyes in gold rings.
  eyes(k, { x: 0.35, y: 0.05, size: 1.45, wide: 1, slant: 0, color: '#1e140e', ring: gold, ringSize: 1.55 });
  k.nose = beakTip;
  const head = unitOf(k, 'head');
  // The facial disc: a round of pale feathers round each eye, meeting over the beak, with a darker rim.
  const disc = (q: Probe) => {
    const u = head(q);
    return u.z < -0.15 ? 1 : Math.hypot((Math.abs(u.x) - 0.33) / 0.37, (u.y - 0.02) / 0.43) - 1;
  };
  const face = region(k, 'head');
  const wing = region(k, 'armL', 'armLPaw', 'armR', 'armRPaw');
  k.marks = {
    base: c.coat,
    marks: [
      { color: gold, f: region(k, 'beak') },
      { color: dark, f: region(k, 'earL', 'earR', 'tailFan') },
      { color: light, f: all(face, disc) },
      { color: dark, f: all(face, (q) => Math.abs(disc(q) - 0.1) - 0.1) },
      { color: gold, f: region(k, /^leg/) },
      // Wings darker, barred across with paler bands.
      { color: light, f: all(wing, (q) => 0.75 - Math.sin(q.p.y * 34)) },
      { color: dark, f: wing },
      // A pale front barred with little dark chevrons.
      { color: dark, f: all(frontOval(k, ['belly', 'chest'], 0, 0.3, 0.15, 0.22), (q) => 0.72 - Math.sin((q.p.y + Math.abs(q.p.x) * 0.6) * 42)) },
      { color: light, f: frontOval(k, ['belly', 'chest'], 0, 0.3, 0.15, 0.22) },
    ],
  };
  return {};
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
  k.nose = snout.nose;
  const head = unitOf(k, 'head');
  k.marks = {
    base: c.coat,
    marks: [
      // Three short gill slits low on each side of the neck, just under the head.
      {
        color: mix(c.coat, CHARCOAL, 0.7),
        f: all(region(k, 'head', 'chest', 'belly'), (q) => 0.17 - Math.abs(q.p.x), (q) => Math.abs(q.p.y - 0.48) - 0.045, (q) => Math.min(...[-0.04, 0.03, 0.1].map((z) => Math.abs(q.p.z - z))) - 0.022),
      },
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
  k.marks = {
    base: c.coat,
    marks: [
      { color: light, f: region(k, 'rim') },
      // Pale round spots over the dome (clear of the face).
      { color: mix(c.coat, '#ffffff', 0.55), f: spots(k, 'head', [[18, 150, 0.2], [45, 45, 0.15], [45, -45, 0.15], [52, 115, 0.17], [52, -115, 0.17], [58, 180, 0.18], [82, 80, 0.13], [82, -80, 0.13], [86, 145, 0.14], [86, -145, 0.14]]) },
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
  armForms(k, { len: 0.24, r0: 0.055, r1: 0.032, paw: [0.035, 0.03, 0.04], fwd: 0.45, out: 0.35 });
  tentacleForms(k, { count: 3, len: 0.44, r0: 0.062, r1: 0.026, root: [0.12, 0.15, -0.02], spread: 2.4, hang: 0.4, coil: 2.7 });
  // A little skirt of webbing where they join.
  sculptOf(k).add(ellipsoid('body', [0, 0.12, -0.02], [0.25, 0.045, 0.23], { k: 0.06, name: 'skirt' }));
  useSurface(k);
  eyes(k, { x: 0.34, y: -0.12, size: 1.35, wide: 1.05, slant: 0.05, color: '#1c1420' });
  mouth(k, { w: 0.16, y: -0.42, curve: 0.08, r: 0.006 });
  k.marks = {
    base: c.coat,
    // Plain all over (spots or suckers this small only come out as stray flecks).
    marks: [],
  };
  return { aquatic: true, legs: 'tentacles' };
};

const penguin: Recipe = (k, c) => {
  const white = '#f2efe6';
  const orange = '#e8892e';
  const gold = '#f2c14e';
  // Tall and upright, a white front, flippers at its sides and big orange feet.
  k.joints.neck = [0, 0.6, 0.03];
  k.joints.shoulder = [0.2, 0.5, 0];
  k.joints.hip = [0.08, 0.12, 0.02];
  k.joints.tail = [0, 0.13, -0.17];
  torso(k, {
    belly: [
      [0, 0.32, 0],
      [0.23, 0.31, 0.2],
    ],
    chest: [
      [0, 0.5, 0.02],
      [0.19, 0.16, 0.17],
    ],
    melt: 0.18,
  });
  headForm(k, { r: [0.2, 0.19, 0.19], at: [0, 0.13, 0.02], melt: 0.14 });
  const beakTip = beakForm(k, { dy: -0.08, len: 0.1, w: 0.03, h: 0.028, drop: 0.25 });
  wingForms(k, { len: 0.34, w: 0.075, d: 0.025, taper: 0.8, fwd: 0.05, out: 0.2 });
  legForms(k, { r0: 0.05, r1: 0.04, foot: [0.055, 0.025, 0.085], fwd: 0.06 });
  finForm(k, 'tail', k.joints.tail, { len: 0.1, w: 0.07, d: 0.022, rot: [-(Math.PI / 2 + 0.6), 0, 0], name: 'tailFan' });
  useSurface(k);
  eyes(k, { x: 0.38, y: 0.14, size: 0.9, wide: 1, slant: 0, color: '#141018' });
  k.nose = beakTip;
  const head = unitOf(k, 'head');
  k.marks = {
    base: c.coat,
    marks: [
      { color: orange, f: region(k, 'beak', /^leg/) },
      // Golden patches on the sides of the neck, and a white front from the chin down.
      { color: gold, f: all(region(k, 'head'), (q) => 0.78 - Math.abs(head(q).x), (q) => Math.abs(head(q).y + 0.35) - 0.25, (q) => head(q).z + 0.2 - 0.4) },
      { color: white, f: all(region(k, 'head'), (q) => head(q).y + 0.3, (q) => 0.2 - head(q).z) },
      { color: white, f: frontOval(k, ['belly', 'chest'], 0, 0.38, 0.17, 0.4) },
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
  finForm(k, 'neck', v3(onHead(k, 0, 0.92, -0.02).add(new THREE.Vector3(...k.joints.neck))), { len: 0.08, w: 0.025, d: 0.015, rot: [-0.5, 0, 0], name: 'tuft', melt: 0.02 });
  wingForms(k, { len: 0.4, w: 0.14, d: 0.04, fwd: -0.05, out: 0.18 });
  legForms(k, { r0: 0.045, r1: 0.04, foot: [0.065, 0.025, 0.09], fwd: 0.06 });
  finForm(k, 'tail', k.joints.tail, { len: 0.13, w: 0.08, d: 0.024, rot: [-0.65, 0, 0], name: 'tailFan' });
  useSurface(k);
  eyes(k, { x: 0.38, y: 0.18, size: 0.9, wide: 1, slant: 0, color: '#141018' });
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
  const spot = mix(c.coat, CHARCOAL, 0.3);
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
  k.marks = {
    base: c.coat,
    marks: [
      { color: belly, f: region(k, 'throat') },
      { color: belly, f: frontOval(k, ['belly', 'chest'], 0, 0.2, 0.17, 0.16) },
      // Darker spots over the back and head.
      { color: spot, f: all(region(k, 'belly', 'chest', 'head', 'haunchL', 'haunchR'), (q) => q.p.z + 0.02, (q) => 0.8 - Math.sin(q.p.x * 22 + 1) * Math.sin(q.p.y * 20) * Math.sin(q.p.z * 18 + 2)) },
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

const raven: Recipe = (k, c) => {
  const beak = mix(c.coat, '#3c3c44', 0.6);
  const sheen = mix(c.coat, '#4c5c9c', 0.32);
  const leg = mix(c.coat, '#45454c', 0.6);
  // Sleek and glossy, leaning forward: a smooth pear of a body, a round head with a big heavy beak, wings
  // folded down its sides and a long wedge of a tail.
  k.joints.neck = [0, 0.58, 0.06];
  k.joints.shoulder = [0.17, 0.48, 0];
  k.joints.hip = [0.07, 0.15, 0];
  k.joints.tail = [0, 0.22, -0.18];
  torso(k, {
    belly: [
      [0, 0.32, -0.02],
      [0.19, 0.25, 0.2],
    ],
    chest: [
      [0, 0.48, 0.04],
      [0.17, 0.14, 0.17],
    ],
    melt: 0.18,
  });
  headForm(k, { r: [0.18, 0.17, 0.18], at: [0, 0.13, 0.04], melt: 0.12 });
  const beakTip = beakForm(k, { dy: -0.04, len: 0.17, w: 0.05, h: 0.047, drop: 0.32 });
  wingForms(k, { len: 0.38, w: 0.12, d: 0.035, fwd: -0.08, out: 0.12 });
  legForms(k, { r0: 0.034, r1: 0.028, foot: [0.042, 0.022, 0.08], fwd: 0.05 });
  finForm(k, 'tail', k.joints.tail, { len: 0.2, w: 0.1, d: 0.036, rot: [-(Math.PI / 2 + 0.45), 0, 0], name: 'tailFan' });
  useSurface(k);
  // Dark eyes, ringed with grey so they read against the black.
  eyes(k, { x: 0.42, y: 0.14, size: 0.85, wide: 1, slant: 0.1, color: '#0c0a10', ring: mix(c.coat, '#9a9aaa', 0.55), ringSize: 1.35 });
  k.nose = beakTip;
  k.marks = {
    base: c.coat,
    marks: [
      { color: beak, f: region(k, 'beak') },
      { color: leg, f: region(k, /^leg/) },
      // A blue-black sheen over the wings and tail.
      { color: sheen, f: region(k, 'armL', 'armR', 'foreL', 'foreR', 'armLPaw', 'armRPaw', 'tailFan') },
    ],
  };
  return {};
};

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
  armForms(k, { len: 0.2, r0: 0.045, r1: 0.034, paw: [0.036, 0.03, 0.045], fwd: 0.75, out: 0.3 });
  tentacleForms(k, { count: 3, len: 0.24, r0: 0.042, r1: 0.03, root: [0.08, 0.15, -0.01], rim: 0.08, spread: 2.3, hang: 0.7, curl: 0.06, melt: 0.09 });
  useSurface(k);
  eyes(k, { x: 0.5, y: 0.02, size: 1.35, wide: 1, slant: 0, color: '#141018', ring: light, ringSize: 1.4 });
  mouth(k, { w: 0.12, y: -0.42, curve: 0.06, r: 0.006 });
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
  const spine = mix(c.coat, '#33241a', 0.4);
  const tip = mix(c.coat, CREAM, 0.7);
  // A round little ball: a pale face with a pointed snout poking out of a coat of spines over its back and
  // the top of its head, small round ears, tiny paws and feet.
  k.joints.neck = [0, 0.44, 0.07];
  k.joints.shoulder = [0.14, 0.34, 0.13];
  k.joints.hip = [0.1, 0.13, -0.02];
  k.joints.tail = [0, 0.15, -0.2];
  const bellyC: Vec3 = [0, 0.26, -0.03];
  const bellyR: Vec3 = [0.23, 0.22, 0.22];
  torso(k, {
    belly: [bellyC, bellyR],
    chest: [
      [0, 0.37, 0.05],
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
  // Spines: chunky cones standing out all over the back and over the crown, lying back a little.
  const sc = sculptOf(k);
  const spines: number[] = [];
  const up = new THREE.Vector3(0, 1, 0);
  const coat = (bone: string, c0: Vec3, r: Vec3, n: number, keep: (d: THREE.Vector3) => boolean) => {
    for (const d of fibonacci(n)) {
      if (!keep(d)) continue;
      const p = new THREE.Vector3(c0[0] + r[0] * d.x, c0[1] + r[1] * d.y, c0[2] + r[2] * d.z);
      const nrm = new THREE.Vector3(d.x / r[0], d.y / r[1], d.z / r[2]).normalize().add(new THREE.Vector3(0, 0.1, -0.45)).normalize();
      const e = new THREE.Euler().setFromQuaternion(new THREE.Quaternion().setFromUnitVectors(up, nrm));
      spines.push(sc.shapes.length);
      sc.add(pyramid(bone, v3(p.addScaledVector(nrm, -0.045)), 0.055, 0.12, 0.055, { rot: [e.x, e.y, e.z], k: 0.012, round: 0.02, name: `spine${spines.length}`, thin: true }));
    }
  };
  coat('body', bellyC, bellyR, 44, (d) => d.z < 0.3 && d.y > -0.3);
  const hc = plus(k.joints.neck, headAt);
  coat('neck', hc, headR, 26, (d) => d.z < -0.05 + d.y * 0.4 && d.y > -0.2);
  useSurface(k);
  eyes(k, { x: 0.4, y: 0.06, size: 0.85, wide: 1, slant: 0.05, color: '#140e0c' });
  nose(k, INK, onSnout(k, snout.nose), 0.024, 0.018);
  const ears = ['earL', 'earR'].map((e) => earMarks(k, e));
  // How far up its own spine a point is (0 at the root, 1 at the point).
  const spineT = (q: Probe) => {
    let best = -1;
    let bd = Infinity;
    for (const i of spines) {
      const d = q.dist(i);
      if (d < bd) {
        bd = d;
        best = i;
      }
    }
    return sc.shapes[best].unit!(q.p).y;
  };
  const prickly = region(k, /^spine/);
  k.marks = {
    base: c.coat,
    marks: [
      { color: mix(c.coat, '#e8a0a0', 0.6), f: any(...ears.map((e) => e.inner)) },
      // Pale points to the spines, dark below.
      { color: tip, f: all(prickly, (q) => 0.62 - spineT(q)) },
      { color: spine, f: prickly },
      // A pale face, front and paws; the rest under the spines brown.
      { color: face, f: region(k, 'muzzle', 'earL', 'earR') },
      { color: face, f: all(region(k, 'head'), (q) => -q.p.z + hc[2] - 0.02) },
      { color: face, f: frontOval(k, ['belly', 'chest'], 0, 0.27, 0.16, 0.2) },
      { color: face, f: region(k, /^arm/, /^fore/, /^leg/) },
    ],
  };
  return {};
};

const axolotl: Recipe = (k, c) => {
  const gill = mix(c.coat, '#c0306a', 0.55);
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
  // feet, and a long fat tail curling out behind, banded across the back.
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
  const back = region(k, 'belly', 'chest');
  k.marks = {
    base: c.coat,
    marks: [
      { color: belly, f: frontOval(k, ['belly', 'chest'], 0, 0.3, 0.12, 0.2) },
      // Broad bands across the back and round the tail.
      { color: band, f: all(back, (q) => q.p.z + 0.02, (q) => 0.55 - Math.sin((q.p.y - 0.1) * 26)) },
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
  const shag = mix(c.coat, '#f6e6c8', 0.25);
  // A big shaggy cow: a broad body fringed with long hair, a wide head with a pale muzzle, a long fringe
  // flopping down over its eyes, ears out sideways under long horns that sweep out and up, and a tufted tail.
  k.joints.neck = [0, 0.6, 0.08];
  k.joints.shoulder = [0.17, 0.48, 0.13];
  k.joints.hip = [0.12, 0.2, -0.05];
  k.joints.tail = [0, 0.32, -0.24];
  const bellyC: Vec3 = [0, 0.36, -0.04];
  const bellyR: Vec3 = [0.26, 0.25, 0.25];
  torso(k, {
    belly: [bellyC, bellyR],
    chest: [
      [0, 0.5, 0.05],
      [0.21, 0.15, 0.2],
    ],
    haunch: [
      [0.13, 0.22, -0.08],
      [0.11, 0.13, 0.16],
    ],
    melt: 0.2,
  });
  const headAt: Vec3 = [0, 0.11, 0.08];
  const headR: Vec3 = [0.21, 0.17, 0.18];
  headForm(k, { r: headR, at: headAt, melt: 0.12 });
  const snout = snoutForm(k, { dy: -0.32, len: 0.07, ra: 0.12, rb: 0.105, drop: 0.03, squash: [1.15, 0.8, 1] });
  earForms(k, { x: 0.85, y: 0.2, w: 0.065, h: 0.11, d: 0.03, splay: 1.35, rake: 0.1, cup: 0.5, round: true });
  const sc = sculptOf(k);
  const hc = plus(k.joints.neck, headAt);
  // Horns: out sideways from the top of the head, sweeping up to a point.
  for (const side of [-1, 1]) {
    const b: Vec3 = [side * 0.13, hc[1] + 0.12, hc[2] - 0.02];
    const pts: Vec3[] = [b, [side * 0.26, hc[1] + 0.13, hc[2] - 0.01], [side * 0.36, hc[1] + 0.2, hc[2]], [side * 0.39, hc[1] + 0.3, hc[2] + 0.02]];
    chain(k, 'neck', pts, [0.04, 0.034, 0.026, 0.017], `horn${side > 0 ? 'L' : 'R'}_`, 0.04);
  }
  // The fringe: a shaggy lock from the crown, hanging down over the eyes in ragged points.
  sc.add(ellipsoid('neck', [0, hc[1] + 0.11, hc[2] + 0.07], [0.19, 0.09, 0.13], { k: 0.06, name: 'fringe' }));
  for (let i = -2; i <= 2; i++) {
    sc.add(ellipsoid('neck', [i * 0.07, hc[1] + 0.02 - Math.abs(i) * 0.012, hc[2] + 0.16 - Math.abs(i) * 0.025], [0.052, 0.085, 0.048], { k: 0.035, name: 'fringe' }));
  }
  // Long hair hanging in locks round the bottom of the body.
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2 + 0.3;
    sc.add(ellipsoid('body', [bellyC[0] + Math.cos(a) * bellyR[0] * 0.82, bellyC[1] - bellyR[1] * 0.55, bellyC[2] + Math.sin(a) * bellyR[2] * 0.82], [0.075, 0.1, 0.075], { k: 0.05, name: 'shag' }));
  }
  armForms(k, { len: 0.3, r0: 0.07, r1: 0.06, paw: [0.06, 0.048, 0.065], fwd: 0.3, out: 0.16 });
  legForms(k, { r0: 0.08, r1: 0.066, foot: [0.066, 0.048, 0.08] });
  const tailAt = tailForm(k, tailPath(0.3, [0, -0.85, -0.5], [0, 0, 0], 0.035, [1, 0.9, 0.9, 1.5, 1.9]));
  useSurface(k);
  // Eyes peeping out from under the fringe.
  eyes(k, { x: 0.38, y: -0.16, size: 0.8, wide: 1.15, slant: 0.05, color: '#1a1412' });
  nose(k, mix(nosePink, CHARCOAL, 0.45), onSnout(k, snout.nose), 0.04, 0.022);
  const hornT = (q: Probe) => hc[1] + 0.25 - q.p.y;
  k.marks = {
    base: c.coat,
    marks: [
      { color: hornTip, f: all(region(k, /^horn/), hornT) },
      { color: horn, f: region(k, /^horn/) },
      { color: nosePink, f: all(region(k, 'muzzle'), (q) => -q.p.z + hc[2] + 0.2) },
      { color: shag, f: region(k, 'fringe') },
      { color: hoof, f: all(region(k, /^leg/), (q) => q.p.y - 0.06) },
      { color: hoof, f: all(region(k, 'armLPaw', 'armRPaw'), (q) => q.p.y - (k.joints.shoulder[1] - 0.36)) },
      { color: mix(c.coat, CHARCOAL, 0.3), f: all(region(k, /^tail\d/), (q) => 0.75 - tailAt(q.p)) },
    ],
  };
  return {};
};

const deer: Recipe = (k, c) => {
  const white = mix(c.coat, CREAM, 0.85);
  const dark = mix(c.coat, '#2b211d', 0.72);
  const antler = '#e4d6b8';
  // Slender and gentle: long legs, a longer neck, big wide ears, a white bob of a tail, a dark nose, pale spots
  // down its back, and small branching antlers.
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
  // Antlers: a beam up and out from the crown with a tine forward off it.
  for (const side of [-1, 1]) {
    const b: Vec3 = [side * 0.07, hc[1] + 0.12, hc[2] - 0.02];
    const m: Vec3 = [side * 0.12, hc[1] + 0.22, hc[2] - 0.04];
    chain(k, 'neck', [b, m, [side * 0.17, hc[1] + 0.31, hc[2] - 0.07]], [0.027, 0.024, 0.021], `antler${side > 0 ? 'L' : 'R'}_`);
    chain(k, 'neck', [m, [side * 0.13, hc[1] + 0.28, hc[2] + 0.04]], [0.024, 0.021], `antler${side > 0 ? 'L' : 'R'}T`);
  }
  armForms(k, { len: 0.32, r0: 0.045, r1: 0.036, paw: [0.036, 0.032, 0.045], fwd: 0.3, out: 0.12 });
  legForms(k, { r0: 0.05, r1: 0.036, foot: [0.036, 0.032, 0.05] });
  const j = k.joints.tail;
  sculptOf(k).add(ellipsoid('tail', [j[0], j[1] + 0.02, j[2] - 0.03], [0.05, 0.065, 0.04], { k: 0.025, anchor: j, reach: 0.07, name: 'bob' }));
  useSurface(k);
  eyes(k, { x: 0.45, y: 0.1, size: 1.1, wide: 1.15, slant: 0.12, color: '#1a1210' });
  nose(k, INK, onSnout(k, snout.nose), 0.026, 0.02);
  const ears = ['earL', 'earR'].map((e) => earMarks(k, e));
  // Pale spots in two rows down each side of the back.
  const spotsAt: Vec3[] = [];
  for (const side of [-1, 1]) {
    for (let i = 0; i < 4; i++) {
      spotsAt.push([side * 0.075, 0.5 - i * 0.055, -0.08 - i * 0.04]);
      spotsAt.push([side * 0.13, 0.46 - i * 0.055, -0.04 - i * 0.04]);
    }
  }
  const spot = (q: Probe) => Math.min(...spotsAt.map((s) => Math.hypot(q.p.x - s[0], q.p.y - s[1], (q.p.z - s[2]) * 0.6))) - 0.034;
  k.marks = {
    base: c.coat,
    marks: [
      { color: antler, f: region(k, /^antler/) },
      { color: white, f: any(...ears.map((e) => e.inner)) },
      { color: dark, f: any(...ears.map((e) => e.back)) },
      { color: white, f: all(region(k, 'muzzle'), (q) => q.p.y - (snout.mid(q.p) - snout.r * 0.2)) },
      { color: white, f: all(region(k, 'chest', 'ruff'), (q) => -q.p.z, (q) => Math.hypot(q.p.x / 0.07, (q.p.y - 0.6) / 0.06) - 1) },
      { color: white, f: frontOval(k, ['belly'], 0, 0.3, 0.1, 0.12) },
      { color: white, f: region(k, 'bob') },
      { color: white, f: all(region(k, 'belly', 'chest', 'haunchL', 'haunchR'), (q) => q.p.z + 0.02, spot) },
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
  const head = unitOf(k, 'head');
  const faceR = region(k, 'head', 'muzzle');
  k.marks = {
    base: c.coat,
    marks: [
      { color: claw, f: region(k, /^claw/) },
      // A dark stripe back from each eye, then the pale face round it.
      { color: mask, f: all(faceR, (q) => 0.16 - Math.abs(head(q).x), (q) => Math.abs(head(q).x) - 0.9, (q) => Math.abs(head(q).y - 0.08 + (Math.abs(head(q).x) - 0.36) * 0.25) - 0.085, (q) => -0.3 - head(q).z) },
      { color: face, f: all(faceR, (q) => 0.05 - head(q).z) },
      { color: face, f: region(k, 'muzzle') },
    ],
  };
  return { sleepy: true };
};

export const RECIPES: Record<AnimalId, Recipe> = {
  raccoon,
  fox,
  bunny,
  snail,
  wolf: plain,
  bear: plain,
  cat: plain,
  dog: plain,
  deer,
  owl,
  koala: plain,
  hedgehog,
  panda: plain,
  penguin,
  otter: plain,
  frog,
  axolotl,
  shark,
  octopus,
  duck,
  platypus: plain,
  capybara: plain,
  redpanda: plain,
  quokka: plain,
  sloth,
  seal: plain,
  puffin: plain,
  fennec: plain,
  chinchilla: plain,
  highland,
  squid,
  bat,
  raven,
  wombat: plain,
  jellyfish,
  gecko,
};

/** How each species carries itself. Anything left out is the plain default. */
const PROFILES: Partial<Record<AnimalId, Partial<Profile>>> = {
  // Slender and alert: upright, head up, a light quick trot, sits with its tail wrapped round its feet.
  fox: { lean: -0.03, head: -0.07, gait: 'trot', cadence: 1.25, stride: 0.9, sit: 'wrap', idles: ['earSwivel', 'tailSwish', 'headTilt'], tailSway: 0.3 },
  // Hunched with its paws held in front, an ambling roll, sits like the papercraft sculpture.
  raccoon: { lean: 0.14, head: -0.05, paws: 0.2, gait: 'amble', cadence: 0.85, sit: 'tuck', idles: ['rubPaws', 'sniff', 'lookAround'], tailSway: 0.18 },
  // Round and soft, paws tucked up, hops everywhere, sits back with its big feet forward.
  bunny: { lean: 0.02, head: -0.04, paws: 0.07, gait: 'hop', cadence: 0.9, sit: 'feet', idles: ['earTwitch', 'noseWiggle', 'hop'], tailSway: 0.04, earsBack: 0.45 },
  // Slides along with a slow stretch and draw, settles low to sit.
  snail: { gait: 'slither', cadence: 0.55, sit: 'settle', idles: ['stalks', 'stretch', 'stalks'], tailSway: 0 },
  // Upright and still, then the head swivels right round; waddles, blinks slowly, stretches a wing.
  owl: { lean: 0, head: 0, gait: 'waddle', cadence: 0.9, stride: 0.7, sit: 'settle', idles: ['headSwivel', 'slowBlink', 'wingStretch'], tailSway: 0.05 },
  // Bobs about on stubby legs with its fins out, swishes its tail.
  shark: { lean: 0.04, head: -0.02, gait: 'waddle', cadence: 1, stride: 0.7, sit: 'settle', idles: ['tailSwish', 'headTilt', 'chill'], tailSway: 0.25 },
  // Drifts, sways and pulses.
  jellyfish: { gait: 'float', cadence: 0.6, sit: 'settle', idles: ['sway', 'chill', 'sway'], tailSway: 0 },
  // Ripples along on its tentacles, stretches, sways.
  octopus: { gait: 'scuttle', cadence: 1.1, sit: 'settle', idles: ['sway', 'stretch', 'chill'], tailSway: 0 },
  // Upright and stiff, waddles with its flippers out, flaps them now and then.
  penguin: { lean: -0.02, head: -0.04, gait: 'waddle', cadence: 1.2, stride: 0.55, sit: 'settle', idles: ['flap', 'headTilt', 'chill'], tailSway: 0.1 },
  // Waddles, flaps, wags its tail.
  duck: { lean: 0.04, head: -0.03, gait: 'waddle', cadence: 1.15, stride: 0.6, sit: 'settle', idles: ['flap', 'headTilt', 'wag'], tailSway: 0.2 },
  // Always on the wing: flaps along, scratches an ear, looks about.
  bat: { gait: 'flap', cadence: 1.2, sit: 'settle', idles: ['wingStretch', 'scratch', 'lookAround'], tailSway: 0 },
  // Glossy and watchful: leans forward, tilts its head at things, stretches a wing.
  raven: { lean: 0.08, head: -0.03, gait: 'waddle', cadence: 1.1, stride: 0.7, sit: 'settle', idles: ['headTilt', 'lookAround', 'wingStretch'], tailSway: 0.08 },
  // Ripples along on its arms like the octopus, sways and stretches.
  squid: { gait: 'scuttle', cadence: 1, sit: 'settle', idles: ['sway', 'chill', 'stretch'], tailSway: 0 },
  // Snuffles about on quick little steps, nose always going.
  hedgehog: { lean: 0.04, head: -0.04, paws: 0.1, gait: 'trot', cadence: 1.5, stride: 0.6, sit: 'tuck', idles: ['sniff', 'noseWiggle', 'lookAround'], tailSway: 0 },
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
  // Squat and still, its throat pulsing; hops everywhere.
  frog: { lean: 0.05, head: -0.06, gait: 'hop', cadence: 1, sit: 'settle', idles: ['throat', 'slowBlink', 'hop'], tailSway: 0 },
};

export function profileOf(id: AnimalId): Profile {
  return { ...defaultProfile(), ...PROFILES[id] };
}
