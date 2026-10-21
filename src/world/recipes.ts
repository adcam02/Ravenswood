import * as THREE from 'three';
import type { Vec3 } from './build';
import { all, any, armForms, beakForm, earForms, earMarks, finForm, headForm, legForms, membraneWings, piece, region, sculptOf, snoutForm, sock as sockOf, surfaceHit, tailForm, tentacleForms, torso, unitOf, useSurface, wingForms } from './forms';
import { curve, pillar, solid } from './paper';
import { ellipsoid, pyramid, rod, spiral, type Probe } from './sculpt';
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
  inside,
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
  // Sleek and glossy, leaning forward: a slim body, a head with a long heavy beak hooked at the tip and a
  // shaggy throat under it, wings folded down its sides with the long flight feathers crossing over a long
  // wedge of a tail.
  k.joints.neck = [0, 0.58, 0.06];
  k.joints.shoulder = [0.16, 0.48, 0];
  k.joints.hip = [0.07, 0.15, 0];
  k.joints.tail = [0, 0.22, -0.18];
  torso(k, {
    belly: [
      [0, 0.32, -0.03],
      [0.165, 0.25, 0.19],
    ],
    chest: [
      [0, 0.48, 0.04],
      [0.145, 0.14, 0.16],
    ],
    melt: 0.18,
  });
  const headAt: Vec3 = [0, 0.13, 0.05];
  headForm(k, { r: [0.16, 0.155, 0.17], at: headAt, melt: 0.12 });
  const sc = sculptOf(k);
  const n = k.joints.neck;
  const hc = plus(n, headAt);
  const beakTip = beakForm(k, { dy: -0.06, len: 0.22, w: 0.056, h: 0.056, drop: 0.26 });
  // The hook: the end of the upper beak curving down over the tip.
  const tipW = plus(n, beakTip);
  sc.add(rod('neck', plus(tipW, [0, 0.022, -0.045]), plus(tipW, [0, -0.022, 0.006]), 0.024, 0.016, { k: 0.02, name: 'beakHook', thin: true }));
  // A ruff of shaggy feathers under the beak.
  const up = new THREE.Vector3(0, 1, 0);
  [-0.05, -0.017, 0.017, 0.05].forEach((x, i) => {
    const dir = new THREE.Vector3(x * 1.5, -0.85, 0.55).normalize();
    const e = new THREE.Euler().setFromQuaternion(new THREE.Quaternion().setFromUnitVectors(up, dir));
    sc.add(pyramid('neck', [x, hc[1] - 0.09 - (i % 2) * 0.02, hc[2] + 0.1], 0.046, 0.08, 0.034, { rot: [e.x, e.y, e.z], k: 0.02, round: 0.012, name: `ruff${i}`, thin: true }));
  });
  // Clear of the slim body, so a wing never melts into its side.
  wingForms(k, { len: 0.33, w: 0.12, d: 0.035, fwd: -0.1, out: 0.24 });
  // The long flight feathers: three points at the back of each folded wing, angled in over the root of the
  // tail (clear of it, so the wings can open without dragging the tail along).
  for (const side of [-1, 1]) {
    const tip = sc.named(side > 0 ? 'armLPaw' : 'armRPaw')!.c;
    const nrm = new THREE.Vector3(side, 0, 0);
    [0, 1, 2].forEach((i) => {
      const dir = new THREE.Vector3(-side * 0.14, -0.3 - i * 0.22, -1).normalize();
      const across = new THREE.Vector3().crossVectors(dir, nrm).normalize();
      const flat = new THREE.Vector3().crossVectors(across, dir).normalize();
      const e = new THREE.Euler().setFromRotationMatrix(new THREE.Matrix4().makeBasis(across, dir, flat));
      const base: Vec3 = [tip.x, tip.y + 0.045 - i * 0.04, tip.z - 0.02];
      sc.add(pyramid(side > 0 ? 'foreL' : 'foreR', base, 0.04, 0.11 - i * 0.015, 0.034, { rot: [e.x, e.y, e.z], k: 0.02, round: 0.012, anchor: base, reach: 0.06, name: `primary${side > 0 ? 'L' : 'R'}${i}`, thin: true }));
    });
  }
  legForms(k, { r0: 0.034, r1: 0.028, foot: [0.042, 0.022, 0.08], fwd: 0.05 });
  finForm(k, 'tail', k.joints.tail, { len: 0.27, w: 0.11, d: 0.04, rot: [-(Math.PI / 2 + 0.4), 0, 0], name: 'tailFan' });
  useSurface(k);
  // Dark eyes, ringed with grey so they read against the black.
  eyes(k, { x: 0.42, y: 0.14, size: 0.85, wide: 1, slant: 0.1, color: '#0c0a10', ring: mix(c.coat, '#9a9aaa', 0.55), ringSize: 1.35, out: 0.005 });
  k.nose = beakTip;
  k.marks = {
    base: c.coat,
    marks: [
      { color: beak, f: region(k, 'beak', 'beakHook') },
      { color: leg, f: region(k, /^leg/) },
      // A blue-black sheen over the wings and tail.
      { color: sheen, f: region(k, 'armL', 'armR', 'foreL', 'foreR', 'armLPaw', 'armRPaw', 'tailFan', /^primary/) },
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
  armForms(k, { len: 0.24, r0: 0.045, r1: 0.034, paw: [0.036, 0.03, 0.045], fwd: 0.75, out: 0.3 });
  // Its arms start low, under the head: things are lifted up to the chest like everyone else's.
  k.lift = 0.12;
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
      // Dark under the spikes, with a clean edge round the face and tummy.
      { color: spine, f: all(region(k, 'belly', 'chest'), (q) => onBody(unitDir(q, bellyC, bellyR), 0.06) * 0.2) },
      { color: spine, f: all(region(k, 'head'), (q) => onHead(unitDir(q, hc, headR), 0.06) * 0.15) },
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
  mouth(k, { w: 0.18, y: -0.52, curve: 0.06, r: 0.006 });
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

const puffin: Recipe = (k, c) => {
  const white = '#f2efe6';
  const red = '#e0502e';
  const band = '#f0c040';
  const slate = '#8a8f9a';
  const orange = '#ec7a2c';
  // A stout little seabird: black back and collar, a white face and front, a tall flat striped beak, and
  // bright orange feet.
  k.joints.neck = [0, 0.56, 0.04];
  k.joints.shoulder = [0.18, 0.46, 0];
  k.joints.hip = [0.08, 0.12, 0.02];
  k.joints.tail = [0, 0.14, -0.17];
  torso(k, {
    belly: [
      [0, 0.3, 0],
      [0.21, 0.28, 0.2],
    ],
    chest: [
      [0, 0.47, 0.02],
      [0.18, 0.15, 0.17],
    ],
    melt: 0.18,
  });
  const headAt: Vec3 = [0, 0.13, 0.02];
  headForm(k, { r: [0.18, 0.17, 0.17], at: headAt, melt: 0.14 });
  const tip = beakForm(k, { dy: -0.12, len: 0.12, w: 0.04, h: 0.075, drop: 0.35 });
  wingForms(k, { len: 0.32, w: 0.09, d: 0.03, taper: 0.8, fwd: 0.05, out: 0.22 });
  legForms(k, { r0: 0.045, r1: 0.038, foot: [0.055, 0.024, 0.085], fwd: 0.06 });
  finForm(k, 'tail', k.joints.tail, { len: 0.09, w: 0.07, d: 0.022, rot: [-(Math.PI / 2 + 0.6), 0, 0], name: 'tailFan' });
  useSurface(k);
  eyes(k, { x: 0.42, y: 0.12, size: 0.85, wide: 1, slant: 0.2, color: '#141018' });
  k.nose = tip;
  const head = unitOf(k, 'head');
  const hc = plus(k.joints.neck, headAt);
  // How far out along the beak a point is (0 at the face, 1 at the tip).
  const beakT = (q: Probe) => (q.p.z - (hc[2] + 0.17)) / 0.11;
  k.marks = {
    base: c.coat,
    marks: [
      // The beak: slate at the base, a yellow band, then red to the tip.
      { color: red, f: all(region(k, 'beak'), (q) => 0.4 - beakT(q)) },
      { color: band, f: all(region(k, 'beak'), (q) => 0.15 - beakT(q)) },
      { color: slate, f: region(k, 'beak') },
      { color: orange, f: region(k, /^leg/) },
      // A white face below the crown and in front of the collar, and a white front.
      { color: white, f: all(region(k, 'head'), (q) => head(q).y - 0.45, (q) => -head(q).z - 0.1, (q) => -0.55 - head(q).y) },
      { color: white, f: frontOval(k, ['belly', 'chest'], 0, 0.3, 0.16, 0.22) },
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
  armForms(k, { len: 0.18, r0: 0.045, r1: 0.036, paw: [0.05, 0.02, 0.05], fwd: 0.5, out: 0.3 });
  legForms(k, { r0: 0.05, r1: 0.042, foot: [0.06, 0.022, 0.08] });
  // The paddle: a wide flat tail, thinner to the end.
  const j = k.joints.tail;
  sculptOf(k).add(ellipsoid('tail', [j[0], j[1] - 0.06, j[2] - 0.13], [0.12, 0.045, 0.16], { rot: [-0.4, 0, 0], k: 0.05, anchor: j, reach: 0.12, name: 'paddle' }));
  useSurface(k);
  eyes(k, { x: 0.5, y: 0.25, size: 0.75, wide: 1, slant: 0, color: '#120e10' });
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
  const hc = plus(k.joints.neck, headAt);
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
      { color: black, f: all(region(k, 'chest', 'belly'), (q) => Math.abs(q.p.y - 0.5 + q.p.z * 0.35) - 0.07, (q) => hc[1] - 0.1 - q.p.y + 0.3) },
      { color: black, f: region(k, /^leg/, 'haunchL', 'haunchR') },
    ],
  };
  return {};
};

const koala: Recipe = (k, c) => {
  const white = mix(c.coat, CREAM, 0.8);
  const noseC = '#2a2428';
  // A round grey bundle: a broad head with huge round fluffy ears (white inside), a big dark spoon of a nose,
  // a pale chin and chest, and strong arms for hugging trees.
  k.joints.neck = [0, 0.56, 0.05];
  k.joints.shoulder = [0.17, 0.46, 0.1];
  k.joints.hip = [0.1, 0.16, -0.04];
  k.joints.tail = [0, 0.18, -0.2];
  torso(k, {
    belly: [
      [0, 0.31, -0.03],
      [0.22, 0.25, 0.21],
    ],
    chest: [
      [0, 0.46, 0.03],
      [0.18, 0.14, 0.17],
    ],
    melt: 0.2,
  });
  const headAt: Vec3 = [0, 0.13, 0.05];
  headForm(k, { r: [0.21, 0.17, 0.17], at: headAt });
  earForms(k, { x: 0.82, y: 0.45, w: 0.11, h: 0.13, d: 0.04, round: true, splay: 0.9, rake: 0.05, cup: 0.6 });
  // The nose: a big dark oval standing proud down the middle of the face.
  const hc = plus(k.joints.neck, headAt);
  sculptOf(k).add(ellipsoid('neck', [0, hc[1] - 0.04, hc[2] + 0.15], [0.055, 0.08, 0.05], { k: 0.03, name: 'bignose' }));
  armForms(k, { len: 0.27, r0: 0.06, r1: 0.05, paw: [0.05, 0.04, 0.055], fwd: 0.4, out: 0.18 });
  legForms(k, { r0: 0.06, r1: 0.05, foot: [0.055, 0.035, 0.075] });
  useSurface(k);
  eyes(k, { x: 0.36, y: 0.08, size: 0.75, wide: 1, slant: 0.1, color: '#120e10' });
  mouth(k, { w: 0.12, y: -0.62, curve: 0.06, r: 0.006 });
  const ears = ['earL', 'earR'].map((e) => earMarks(k, e));
  const head = unitOf(k, 'head');
  k.marks = {
    base: c.coat,
    marks: [
      { color: noseC, f: region(k, 'bignose') },
      // Fluffy white inside the ears and round their rims.
      { color: white, f: any(...ears.map((e) => e.inner)) },
      { color: white, f: all(region(k, 'head'), (q) => head(q).y + 0.45, (q) => -head(q).z - 0.1, (q) => 0.35 - Math.abs(head(q).x)) },
      { color: white, f: frontOval(k, ['belly', 'chest'], 0, 0.4, 0.12, 0.14) },
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

const fennec: Recipe = (k, c) => {
  const white = mix(c.coat, CREAM, 0.85);
  const pink = mix(c.coat, '#f0a8a8', 0.55);
  const tipC = mix(c.coat, '#3a2a20', 0.7);
  // A tiny desert fox that's mostly ears: enormous wide ears, big dark eyes, a little pointed snout, a pale
  // face and front, slim legs, and a bushy tail with a dark tip.
  k.joints.neck = [0, 0.52, 0.05];
  k.joints.shoulder = [0.1, 0.42, 0.12];
  k.joints.hip = [0.08, 0.17, -0.05];
  k.joints.tail = [0, 0.2, -0.15];
  torso(k, {
    belly: [
      [0, 0.28, -0.07],
      [0.16, 0.19, 0.16],
    ],
    chest: [
      [0, 0.41, 0.04],
      [0.13, 0.13, 0.13],
    ],
    haunch: [
      [0.09, 0.17, -0.08],
      [0.085, 0.1, 0.12],
    ],
    melt: 0.2,
  });
  headForm(k, {
    r: [0.17, 0.145, 0.16],
    at: [0, 0.13, 0.06],
    cheeks: [
      [0.11, -0.06, 0],
      [0.08, 0.06, 0.08],
    ],
  });
  const snout = snoutForm(k, { dy: -0.26, len: 0.1, ra: 0.06, rb: 0.033, drop: 0.035, squash: [1, 0.85, 1], thin: true });
  earForms(k, { x: 0.55, y: 0.62, w: 0.12, h: 0.3, d: 0.052, splay: 0.42, rake: 0.05, cup: 0.6, notch: true });
  armForms(k, { len: 0.27, r0: 0.042, r1: 0.036, paw: [0.04, 0.032, 0.05], fwd: 0.36, out: 0.16 });
  legForms(k, { r0: 0.05, r1: 0.04, foot: [0.042, 0.03, 0.068] });
  const tailAt = tailForm(k, tailPath(0.5, [0, -0.35, -1], [0.6, -0.6, 0], 0.11, [0.3, 0.7, 0.95, 1, 0.9, 0.7, 0.45]));
  useSurface(k);
  eyes(k, { x: 0.4, y: 0.1, size: 1.15, wide: 1.15, slant: 0.2, color: '#1a1210' });
  nose(k, INK, onSnout(k, snout.nose), 0.022, 0.017);
  const ears = ['earL', 'earR'].map((e) => earMarks(k, e));
  const head = unitOf(k, 'head');
  k.marks = {
    base: c.coat,
    marks: [
      { color: pink, f: any(...ears.map((e) => e.inner)) },
      { color: white, f: all(region(k, 'muzzle'), (q) => q.p.y - (snout.mid(q.p) + snout.r * 0.2)) },
      { color: white, f: all(region(k, 'head', 'cheekL', 'cheekR'), (q) => head(q).y + 0.05 + Math.abs(head(q).x) * 0.2, (q) => -0.2 - head(q).z) },
      { color: white, f: frontOval(k, ['belly', 'chest'], 0, 0.36, 0.09, 0.14) },
      { color: tipC, f: all(region(k, /^tail\d/), (q) => 0.85 - tailAt(q.p)) },
    ],
  };
  return {};
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
      // A darker saddle over the back, and a dark tip to the tail.
      { color: dark, f: all(region(k, 'belly', 'chest', 'ruff', 'haunchL', 'haunchR'), (q) => q.p.z + 0.06, (q) => 0.4 - q.p.y + Math.abs(q.p.x) * 0.6) },
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
      { color: dark, f: region(k, 'armLPaw', 'armRPaw') },
      { color: dark, f: all(region(k, /^leg/), (q) => q.p.y - 0.06) },
    ],
  };
  return {};
};

const cat: Recipe = (k, c) => {
  const white = mix(c.coat, CREAM, 0.88);
  const stripe = mix(c.coat, '#7a3a14', 0.38);
  const pink = mix(c.coat, '#f0a0a8', 0.6);
  // Neat and poised: a round head with big pointed ears and big green eyes, a little pink nose on a short
  // muzzle, a white chest and paws, tabby stripes over the back and round the long tail, held up in a curl.
  k.joints.neck = [0, 0.56, 0.05];
  k.joints.shoulder = [0.1, 0.45, 0.12];
  k.joints.hip = [0.09, 0.19, -0.05];
  k.joints.tail = [0, 0.22, -0.16];
  torso(k, {
    belly: [
      [0, 0.31, -0.07],
      [0.17, 0.21, 0.17],
    ],
    chest: [
      [0, 0.44, 0.04],
      [0.14, 0.14, 0.14],
    ],
    haunch: [
      [0.1, 0.19, -0.08],
      [0.09, 0.11, 0.13],
    ],
    melt: 0.2,
  });
  headForm(k, {
    r: [0.19, 0.165, 0.17],
    at: [0, 0.13, 0.06],
    cheeks: [
      [0.12, -0.06, 0.03],
      [0.08, 0.07, 0.08],
    ],
  });
  const snout = snoutForm(k, { dy: -0.26, len: 0.04, ra: 0.075, rb: 0.06, drop: 0.01, squash: [1.25, 0.8, 1] });
  earForms(k, { x: 0.6, y: 0.68, w: 0.08, h: 0.14, d: 0.04, splay: 0.3, rake: 0.05, cup: 0.55, notch: true });
  armForms(k, { len: 0.29, r0: 0.048, r1: 0.04, paw: [0.044, 0.034, 0.052], fwd: 0.33, out: 0.14 });
  legForms(k, { r0: 0.056, r1: 0.044, foot: [0.046, 0.034, 0.07] });
  const tailAt = tailForm(k, tailPath(0.55, [0, 0.25, -1], [0, 1.6, 0], 0.05, [1, 0.95, 0.9, 0.9, 0.85, 0.75]));
  useSurface(k);
  eyes(k, { x: 0.4, y: 0.1, size: 1.05, wide: 1.2, slant: 0.2, color: '#141010', ring: '#8fbf4a', ringSize: 1.35, out: 0.006 });
  nose(k, pink, onSnout(k, snout.nose, 0.004), 0.022, 0.016);
  mouth(k, { w: 0.14, y: -0.55, curve: 0.06, r: 0.005 });
  const ears = ['earL', 'earR'].map((e) => earMarks(k, e));
  const head = unitOf(k, 'head');
  k.marks = {
    base: c.coat,
    marks: [
      { color: pink, f: any(...ears.map((e) => e.inner)) },
      { color: white, f: region(k, 'muzzle') },
      { color: white, f: all(region(k, 'chest', 'belly'), (q) => -q.p.z, (q) => segDist(q.p.x, q.p.y, 0, 0.3, 0, 0.52).d - 0.08) },
      { color: white, f: region(k, 'armLPaw', 'armRPaw') },
      { color: white, f: all(region(k, /^leg/), (q) => q.p.y - 0.06) },
      // Tabby stripes: over the brow, across the back and round the tail.
      { color: stripe, f: all(region(k, 'head'), (q) => 0.3 - head(q).y, (q) => -0.25 - head(q).z + 1, (q) => Math.abs(Math.abs(head(q).x) - 0.12) - 0.05) },
      { color: stripe, f: all(region(k, 'belly', 'chest', 'haunchL', 'haunchR'), (q) => q.p.z + 0.03, (q) => 0.5 - Math.sin((q.p.y - 0.1) * 30)) },
      { color: stripe, f: all(region(k, /^tail\d/), (q) => 0.5 - Math.sin(tailAt(q.p) * Math.PI * 8)) },
    ],
  };
  return {};
};

const dog: Recipe = (k, c) => {
  const white = mix(c.coat, CREAM, 0.85);
  const ear = mix(c.coat, '#6a3a1e', 0.4);
  // Friendly and floppy: a round head with long soft ears hanging down, a rounded muzzle with a big black
  // nose, a white chest and muzzle, sturdy legs and a waggy tail.
  k.joints.neck = [0, 0.6, 0.05];
  k.joints.shoulder = [0.11, 0.48, 0.12];
  k.joints.hip = [0.1, 0.2, -0.06];
  k.joints.tail = [0, 0.26, -0.18];
  torso(k, {
    belly: [
      [0, 0.33, -0.08],
      [0.18, 0.22, 0.18],
    ],
    chest: [
      [0, 0.47, 0.04],
      [0.15, 0.15, 0.15],
    ],
    haunch: [
      [0.1, 0.21, -0.09],
      [0.1, 0.12, 0.14],
    ],
    melt: 0.2,
  });
  headForm(k, {
    r: [0.18, 0.165, 0.175],
    at: [0, 0.13, 0.06],
    cheeks: [
      [0.11, -0.06, 0.04],
      [0.08, 0.07, 0.08],
    ],
  });
  const snout = snoutForm(k, { dy: -0.25, len: 0.1, ra: 0.085, rb: 0.07, drop: 0.03, squash: [1.05, 0.9, 1] });
  armForms(k, { len: 0.3, r0: 0.054, r1: 0.046, paw: [0.05, 0.038, 0.058], fwd: 0.33, out: 0.14 });
  legForms(k, { r0: 0.064, r1: 0.05, foot: [0.052, 0.038, 0.078] });
  tailForm(k, tailPath(0.32, [0, 0.4, -1], [0, 0.6, 0], 0.05, [1, 0.9, 0.8, 0.6, 0.4]));
  useSurface(k);
  // Long soft ears: crisp flaps from the top of the head, out a little and hanging down its sides.
  const hc = plus(k.joints.neck, [0, 0.13, 0.06]);
  for (const side of [-1, 1]) {
    const hit = surfaceHit(k, new THREE.Vector3(...hc), new THREE.Vector3(side * 0.75, 0.6, -0.1));
    if (!hit) continue;
    const { p, n } = hit;
    const pts = [p.clone().addScaledVector(n, -0.035), p.clone().add(new THREE.Vector3(side * 0.045, 0.01, 0)), p.clone().add(new THREE.Vector3(side * 0.075, -0.1, 0.012)), p.clone().add(new THREE.Vector3(side * 0.07, -0.2, 0.02)), p.clone().add(new THREE.Vector3(side * 0.06, -0.235, 0.022))];
    piece(k, { bone: 'neck', pts, w: [0.05, 0.075, 0.08, 0.06, 0], t: [0.026, 0.026, 0.024, 0.02, 0], across: new THREE.Vector3(0, 0, 1), colors: [ear, ear, ear, ear], name: `ear${side > 0 ? 'L' : 'R'}` });
  }
  eyes(k, { x: 0.38, y: 0.12, size: 0.95, wide: 1, slant: 0, color: '#1a1210' });
  nose(k, INK, onSnout(k, snout.nose), 0.034, 0.024);
  mouth(k, { w: 0.18, y: -0.6, curve: 0.08, r: 0.006, out: 0.004 });
  k.marks = {
    base: c.coat,
    marks: [
      { color: white, f: region(k, 'muzzle') },
      { color: white, f: all(region(k, 'chest', 'belly'), (q) => -q.p.z, (q) => segDist(q.p.x, q.p.y, 0, 0.3, 0, 0.56).d - 0.09) },
      { color: white, f: region(k, 'armLPaw', 'armRPaw') },
      { color: white, f: all(region(k, /^leg/), (q) => q.p.y - 0.06) },
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
      { color: white, f: all(region(k, 'head'), (q) => Math.hypot((Math.abs(head(q).x) - 0.32) / 0.12, (head(q).y - 0.42) / 0.09) - 1) },
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

const chinchilla: Recipe = (k, c) => {
  const pale = mix(c.coat, '#f2ece2', 0.7);
  const pink = mix(c.coat, '#f0b0b8', 0.55);
  // A soft round puff of grey: a round body, a round head with huge round ears (pink inside), big dark eyes, a
  // tiny nose, a pale tummy, and a bushy tail curled up behind.
  k.joints.neck = [0, 0.5, 0.05];
  k.joints.shoulder = [0.12, 0.4, 0.11];
  k.joints.hip = [0.09, 0.14, -0.04];
  k.joints.tail = [0, 0.17, -0.2];
  torso(k, {
    belly: [
      [0, 0.27, -0.04],
      [0.21, 0.23, 0.2],
    ],
    chest: [
      [0, 0.4, 0.03],
      [0.16, 0.12, 0.15],
    ],
    melt: 0.2,
  });
  headForm(k, {
    r: [0.18, 0.165, 0.17],
    at: [0, 0.13, 0.05],
    cheeks: [
      [0.11, -0.06, 0.03],
      [0.08, 0.07, 0.08],
    ],
  });
  const snout = snoutForm(k, { dy: -0.24, len: 0.04, ra: 0.065, rb: 0.055, drop: 0.01, squash: [1.15, 0.85, 1] });
  earForms(k, { x: 0.6, y: 0.66, w: 0.1, h: 0.13, d: 0.035, round: true, splay: 0.45, rake: 0.1, cup: 0.6 });
  armForms(k, { len: 0.15, r0: 0.04, r1: 0.034, paw: [0.036, 0.028, 0.042], fwd: 0.9, out: 0.1 });
  legForms(k, { r0: 0.052, r1: 0.044, foot: [0.046, 0.03, 0.09], fwd: 0.05 });
  tailForm(k, tailPath(0.36, [0, 0.2, -1], [0, 1.5, 0], 0.07, [0.8, 1, 1, 0.95, 0.8]));
  useSurface(k);
  eyes(k, { x: 0.42, y: 0.1, size: 1.2, wide: 1, slant: 0.05, color: '#100c0c' });
  nose(k, pink, onSnout(k, snout.nose, 0.004), 0.018, 0.014);
  const ears = ['earL', 'earR'].map((e) => earMarks(k, e));
  k.marks = {
    base: c.coat,
    marks: [
      { color: pink, f: any(...ears.map((e) => e.inner)) },
      { color: pale, f: region(k, 'muzzle') },
      { color: pale, f: frontOval(k, ['belly', 'chest'], 0, 0.28, 0.15, 0.2) },
    ],
  };
  return {};
};

const wombat: Recipe = (k, c) => {
  const nosePad = '#2a2422';
  const dark = mix(c.coat, CHARCOAL, 0.4);
  const light = mix(c.coat, CREAM, 0.35);
  // Low and solid as a barrel: a broad flat face with a wide dark nose pad on top of a pale muzzle, small
  // rounded ears set wide, a heavy body up on short sturdy legs, and hardly any tail.
  k.joints.neck = [0, 0.5, 0.08];
  k.joints.shoulder = [0.17, 0.4, 0.12];
  k.joints.hip = [0.13, 0.17, -0.05];
  k.joints.tail = [0, 0.22, -0.24];
  torso(k, {
    belly: [
      [0, 0.32, -0.05],
      [0.25, 0.2, 0.25],
    ],
    chest: [
      [0, 0.41, 0.05],
      [0.21, 0.12, 0.2],
    ],
    haunch: [
      [0.14, 0.2, -0.08],
      [0.1, 0.09, 0.14],
    ],
    melt: 0.22,
  });
  const headAt: Vec3 = [0, 0.1, 0.08];
  headForm(k, { r: [0.22, 0.15, 0.17], at: headAt });
  const snout = snoutForm(k, { dy: -0.18, len: 0.035, ra: 0.12, rb: 0.11, drop: 0.01, squash: [1.4, 0.72, 1] });
  earForms(k, { x: 0.78, y: 0.58, w: 0.05, h: 0.055, d: 0.03, round: true, splay: 0.55, rake: 0.1, cup: 0.5 });
  // The broad leathery nose pad across the top of the muzzle, where it shows from above.
  const nz = plus(k.joints.neck, snout.nose);
  sculptOf(k).add(ellipsoid('neck', [nz[0], nz[1] + 0.022, nz[2] - 0.022], [0.09, 0.045, 0.05], { k: 0.022, name: 'nosePad' }));
  armForms(k, { len: 0.24, r0: 0.075, r1: 0.068, paw: [0.064, 0.042, 0.07], fwd: 0.3, out: 0.24 });
  legForms(k, { r0: 0.08, r1: 0.072, foot: [0.068, 0.042, 0.085] });
  useSurface(k);
  eyes(k, { x: 0.42, y: 0.22, size: 0.7, wide: 1, slant: 0.05, color: '#140e0c' });
  const ears = ['earL', 'earR'].map((e) => earMarks(k, e));
  k.marks = {
    base: c.coat,
    marks: [
      { color: nosePad, f: region(k, 'nosePad') },
      { color: light, f: region(k, 'muzzle') },
      { color: mix(c.coat, '#e0b0a0', 0.45), f: any(...ears.map((e) => e.inner)) },
      { color: dark, f: region(k, 'armLPaw', 'armRPaw') },
      { color: dark, f: all(region(k, /^leg/), (q) => q.p.y - 0.06) },
    ],
  };
  return {};
};

export const RECIPES: Record<AnimalId, Recipe> = {
  raccoon,
  fox,
  bunny,
  snail,
  wolf,
  bear,
  cat,
  dog,
  deer,
  owl,
  koala,
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
  puffin,
  fennec,
  chinchilla,
  highland,
  squid,
  bat,
  raven,
  wombat,
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
  // Sways on its back flippers, flaps a flipper, tilts its head.
  seal: { lean: 0.02, head: -0.02, gait: 'waddle', cadence: 0.9, stride: 0.6, sit: 'settle', idles: ['headTilt', 'chill', 'flap'], tailSway: 0 },
  // Stout and busy: waddles, flaps, looks about.
  puffin: { lean: 0, head: -0.03, gait: 'waddle', cadence: 1.2, stride: 0.6, sit: 'settle', idles: ['flap', 'headTilt', 'lookAround'], tailSway: 0.1 },
  // Waddles, snuffles with its bill, swishes its paddle.
  platypus: { lean: 0.05, head: -0.03, gait: 'waddle', cadence: 1, stride: 0.7, sit: 'settle', idles: ['sniff', 'tailSwish', 'chill'], tailSway: 0.2 },
  // Big and easy: a rolling amble, sits back with its feet out, scratches.
  panda: { lean: 0.06, head: -0.03, gait: 'amble', cadence: 0.8, stride: 0.9, sit: 'feet', idles: ['chill', 'headTilt', 'scratch'], tailSway: 0.05 },
  // Sleepy and slow, paws held up as if round a branch.
  koala: { lean: 0.05, head: -0.03, paws: 0.15, gait: 'amble', cadence: 0.7, stride: 0.8, sit: 'tuck', idles: ['slowBlink', 'scratch', 'chill'], tailSway: 0 },
  // Up tall and fidgety, paws held up, rubbing them together.
  otter: { lean: -0.03, head: -0.05, paws: 0.14, gait: 'trot', cadence: 1.3, stride: 0.85, sit: 'tuck', idles: ['rubPaws', 'lookAround', 'headTilt'], tailSway: 0.3 },
  // Quick and twitchy, the great ears always turning.
  fennec: { lean: -0.02, head: -0.06, gait: 'trot', cadence: 1.4, stride: 0.85, sit: 'wrap', idles: ['earSwivel', 'tailSwish', 'headTilt'], tailSway: 0.3 },
  // Utterly calm: a slow amble, slow blinks.
  capybara: { lean: 0.04, head: 0, gait: 'amble', cadence: 0.7, stride: 0.8, sit: 'tuck', idles: ['chill', 'slowBlink', 'lookAround'], tailSway: 0 },
  // Rangy and watchful: a long easy trot, ears always turning, tongue out when it's warm.
  wolf: { lean: -0.02, head: -0.05, gait: 'trot', cadence: 1.1, stride: 1, sit: 'wrap', idles: ['earSwivel', 'lookAround', 'pant'], tailSway: 0.2 },
  // Big and easy: a rolling amble, sits back with its feet out, scratches and sniffs.
  bear: { lean: 0.06, head: -0.03, gait: 'amble', cadence: 0.8, stride: 0.9, sit: 'feet', idles: ['scratch', 'sniff', 'chill'], tailSway: 0.05 },
  // Neat and poised: a light trot, sits with its tail round its feet, washes a paw.
  cat: { lean: -0.02, head: -0.04, gait: 'trot', cadence: 1.2, stride: 0.85, sit: 'wrap', idles: ['lickPaw', 'tailCurl', 'slowBlink'], tailSway: 0.35 },
  // Bouncy and friendly: wags, pants, tilts its head.
  dog: { lean: 0, head: -0.04, gait: 'trot', cadence: 1.2, stride: 0.95, sit: 'tuck', idles: ['wag', 'pant', 'headTilt'], tailSway: 0.4 },
  // Ambles, looks about, swishes its big ringed tail.
  redpanda: { lean: 0.03, head: -0.04, gait: 'amble', cadence: 1, stride: 0.85, sit: 'wrap', idles: ['lookAround', 'tailSwish', 'rubPaws'], tailSway: 0.25 },
  // Hops along on its big feet, smiling, paws held up.
  quokka: { lean: 0.02, head: -0.03, paws: 0.12, gait: 'hop', cadence: 1, sit: 'feet', idles: ['headTilt', 'sniff', 'chill'], tailSway: 0.05 },
  // Quick little hops, whiskers and ears always going.
  chinchilla: { lean: 0.02, head: -0.03, paws: 0.1, gait: 'hop', cadence: 1.2, sit: 'feet', idles: ['noseWiggle', 'earTwitch', 'rubPaws'], tailSway: 0.1 },
  // Low and determined: a steady amble, nose down.
  wombat: { lean: 0.06, head: 0.02, gait: 'amble', cadence: 0.9, stride: 0.7, sit: 'tuck', idles: ['sniff', 'scratch', 'chill'], tailSway: 0 },
  // Squat and still, its throat pulsing; hops everywhere.
  frog: { lean: 0.05, head: -0.06, gait: 'hop', cadence: 1, sit: 'settle', idles: ['throat', 'slowBlink', 'hop'], tailSway: 0 },
};

export function profileOf(id: AnimalId): Profile {
  return { ...defaultProfile(), ...PROFILES[id] };
}
