import * as THREE from 'three';
import type { Vec3 } from './build';
import { all, any, armForms, earForms, earMarks, headForm, legForms, region, sculptOf, snoutForm, sock as sockOf, tailForm, torso, unitOf, useSurface } from './forms';
import { curve, pillar, solid } from './paper';
import { ellipsoid, rod, spiral, type Probe } from './sculpt';
import {
  CHARCOAL,
  CREAM,
  INK,
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

export const RECIPES: Record<AnimalId, Recipe> = {
  raccoon,
  fox,
  bunny,
  snail,
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
};

export function profileOf(id: AnimalId): Profile {
  return { ...defaultProfile(), ...PROFILES[id] };
}
