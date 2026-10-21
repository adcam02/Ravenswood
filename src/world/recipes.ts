import * as THREE from 'three';
import type { Vec3 } from './build';
import { pillar, solid, tube } from './paper';
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
  puffTail,
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
 * Every species: how it's folded, and how it carries itself (its profile: posture, gait, how it sits, and the
 * little things it does while standing about).
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

const fox: Recipe = (k, c) => {
  const white = mix(c.coat, CREAM, 0.88);
  const sock = mix(c.coat, '#2b211d', 0.8);
  const s = k.shape;
  // Slender and alert: a narrower body up on longer, thinner legs, and a long narrow snout.
  s.tr = [0.2, 0.265, 0.17];
  s.tc = [0, 0.39, 0];
  s.hr = [0.19, 0.158, 0.18];
  k.joints.neck = [0, 0.61, 0.035];
  k.joints.shoulder = [0.105, 0.5, 0.075];
  k.joints.hip = [0.09, 0.2, 0];
  k.joints.tail = [0, 0.22, -0.14];
  body(k, {
    color: c.coat,
    pear: 0.45,
    // A white bib down the chest.
    paint: (u) => (u.z > 0.3 && u.y > -0.35 && Math.abs(u.x) < 0.5 - Math.max(0, 0.1 - u.y) * 0.6 ? white : null),
  });
  head(k, {
    color: c.coat,
    cheeks: 0.2,
    ruff: 0.3,
    crown: 0.7,
    paint: (u) => {
      const ax = Math.abs(u.x);
      // White cheeks sweeping up from the jaw to the ruff.
      if (u.z > -0.15 && u.y < -0.08 - ax * 0.12 + 0.22 * ax * ax) return white;
      if (ax > 0.8 && u.y < 0.02 && u.y > -0.62) return white;
      return null;
    },
  });
  muzzle(k, { color: c.coat, nose: INK, w: 0.06, h: 0.05, len: 0.145, dy: -0.28, point: 0.62, droop: 0.06, noseW: 0.024, paint: (u) => (u.y < 0.12 ? white : null) });
  eyes(k, { x: 0.4, y: 0.12, size: 0.9, wide: 1.5, slant: 0.32, color: '#1a1412' });
  // Big pointed ears with dark backs.
  ears(k, { color: c.coat, back: sock, rim: c.coat, inner: white, x: 0.5, y: 0.74, w: 0.095, h: 0.18, d: 0.045, splay: 0.22, inset: 0.6 });
  arms(k, { color: c.coat, sock, sockFrom: 0.32, len: 0.28, r: 0.045 });
  legs(k, { color: sock, foot: sock, r: 0.048 });
  tail(k, { color: c.coat, tip: white, tipFrom: 0.78, r: 0.13, len: 0.52, dir: [0, -0.35, -1], curl: [1.1, 0.25, 0], profile: [0.3, 0.7, 0.95, 1, 0.95, 0.8, 0.5], steps: 12 });
  return {};
};

const RACCOON_MASK = '#2c2a27';
const RACCOON_CREAM = '#e6dac0';

const raccoon: Recipe = (k, c) => {
  const mask = mix(c.coat, RACCOON_MASK, 0.8);
  const cream = mix(c.coat, RACCOON_CREAM, 0.85);
  const sock = mix(c.coat, '#2f2d28', 0.5);
  const s = k.shape;
  // A tall pear, hunched a little forward.
  s.tr = [0.235, 0.28, 0.19];
  s.tc = [0, 0.375, 0];
  k.joints.neck = [0, 0.585, 0.035];
  k.joints.shoulder = [0.12, 0.47, 0.085];
  body(k, { color: c.coat, haunch: c.coat, jitter: 0.016, paint: (u) => (u.z > 0.5 && Math.abs(u.x) < 0.42 && u.y < 0.45 && u.y > -0.55 ? mix(c.coat, cream, 0.14) : null) });
  head(k, {
    color: c.coat,
    cheeks: 0.12,
    ruff: 0.32,
    paint: (u) => {
      if (u.z < 0.0) return null;
      const ax = Math.abs(u.x);
      // A cream brow stripe over each eye.
      if (segDist(ax, u.y, 0.13, 0.37, 0.66, 0.27).d < 0.075) return cream;
      // A dark patch round each eye, tapering down beside the muzzle; grey between them.
      const patch = segDist(ax, u.y, 0.47, 0.08, 0.27, -0.3);
      if (ax > 0.13 && patch.d < 0.2 - 0.13 * patch.t) return mask;
      // Cream cheeks and chin.
      if (u.y < -0.22 && ax > 0.36) return cream;
      if (u.y < -0.46) return cream;
      if (ax > 0.8 && u.y < 0.06) return cream;
      return null;
    },
  });
  muzzle(k, { color: cream, nose: '#2a2624', w: 0.085, h: 0.062, len: 0.1, dy: -0.36, point: 0.3, droop: 0.14, twitch: true });
  eyes(k, { x: 0.38, y: 0.06, size: 0.85, wide: 1.3, slant: 0.18, color: '#121010', out: 0.006 });
  // Grey outside, cream rims, dark inside.
  ears(k, { color: c.coat, rim: cream, inner: mask, x: 0.6, y: 0.7, w: 0.09, h: 0.13, d: 0.045, splay: 0.34, inset: 0.58 });
  arms(k, { color: c.coat, sock, sockFrom: 0.38 });
  legs(k, { color: sock, foot: sock });
  // A thick tail with three clear dark rings and a dark tip, curving round to one side.
  tail(k, { color: c.coat, rings: mask, ringEvery: 2, tip: mask, tipFrom: 0.86, r: 0.12, len: 0.44, dir: [0, -0.3, -1], curl: [0.5, -0.9, 0], profile: [0.55, 0.9, 1, 1, 0.9, 0.6], steps: 12 });
  return {};
};

const bunny: Recipe = (k, c) => {
  const pale = mix(c.coat, CREAM, 0.55);
  const pink = mix(c.coat, '#e3a0a6', 0.75);
  const s = k.shape;
  // Round and soft: a rounder body and head, short arms, big feet.
  s.hr = [0.19, 0.175, 0.18];
  s.hc = [0, 0.15, 0.05];
  s.tr = [0.215, 0.235, 0.2];
  s.tc = [0, 0.33, 0];
  k.joints.neck = [0, 0.535, 0.025];
  k.joints.shoulder = [0.11, 0.43, 0.1];
  k.joints.hip = [0.1, 0.15, -0.01];
  k.joints.tail = [0, 0.17, -0.18];
  body(k, { color: c.coat, belly: pale, bellyW: 0.5, pear: 0.3, haunch: c.coat });
  head(k, { color: c.coat, cheeks: 0.22, crown: 0.88, paint: (u) => (u.z > 0.3 && u.y < -0.3 && Math.abs(u.x) < 0.45 ? pale : null) });
  // A little pink nose on its own bone, for wiggling.
  nose(k, pink, v3(onHead(k, 0, -0.2, 0.01)), 0.021, 0.016, true);
  eyes(k, { x: 0.44, y: 0.1, size: 1.05, wide: 0.95, slant: 0.05, color: '#1c1416' });
  ears(k, { kind: 'long', color: c.coat, inner: pink, x: 0.3, y: 0.8, w: 0.052, h: 0.2, d: 0.03, splay: 0.12, rake: 0.15 });
  arms(k, { color: c.coat, len: 0.19, r: 0.045 });
  legs(k, { color: c.coat, foot: c.coat, r: 0.06, footLen: 0.125, footH: 0.042, sole: pale });
  puffTail(k, pale, 0.058);
  return {};
};

const snail: Recipe = (k, c, coat) => {
  // The coat colour is the shell; the snail itself is a soft putty colour.
  const skin = mix('#cdbf98', coat, 0.12);
  const sole = mix(skin, CREAM, 0.45);
  const shell = c.coat;
  const band = mix(c.coat, CHARCOAL, 0.32);
  const s = k.shape;
  s.tc = [0, 0.1, 0];
  s.tr = [0.15, 0.08, 0.34];
  s.hc = [0, 0.075, 0.03];
  s.hr = [0.12, 0.115, 0.115];
  k.joints.neck = [0, 0.33, 0.255];
  k.joints.shoulder = [0.1, 0.22, 0.33];
  k.joints.tail = [0, 0.05, -0.3];
  bone(k, 'rear', 'body', [0, 0.06, -0.22]);
  // The foot: one long low slab, its back half on its own bone so it can stretch and draw up, rising at
  // the front into the neck.
  const foot = part(k, 'foot', 'body', { chain: ['rear', 'body'] });
  tube(foot, k.rnd, {
    pts: [
      [0, 0.06, -0.38],
      [0, 0.065, -0.27],
      [0, 0.07, -0.13],
      [0, 0.07, 0.01],
      [0, 0.08, 0.14],
      [0, 0.13, 0.23],
      [0, 0.22, 0.27],
      [0, 0.32, 0.275],
    ],
    radii: [0.035, 0.1, 0.135, 0.145, 0.14, 0.12, 0.105, 0.098],
    flats: [0.5, 0.5, 0.5, 0.5, 0.55, 0.8, 1, 1],
    sides: 8,
    up: [1, 0, 0],
    jitter: 0.05,
    color: skin,
    paint: (_u, _c, n) => (n.y < -0.4 ? sole : null),
  });
  // The shell: a faceted tube wound into a spiral on the back, banded like growth rings. It starts low at
  // the front, tucked into the foot, runs up the front, over the top, down the back and in.
  const shellPart = part(k, 'shell', 'body');
  const sc = new THREE.Vector3(0, 0.36, -0.1);
  const coil: Vec3[] = [];
  const radii: number[] = [];
  const turns = 2.25 * Math.PI;
  const steps = 26;
  const a0 = 0.45;
  for (let i = 0; i <= steps; i++) {
    const a = a0 + (i / steps) * turns;
    const R = 0.19 * Math.exp(-0.3 * (a - a0));
    coil.push([-0.03 + 0.06 * (i / steps), sc.y - R * Math.cos(a), sc.z + R * Math.sin(a)]);
    radii.push(0.72 * R * 1.22 + 0.006);
  }
  tube(shellPart, k.rnd, { pts: coil, radii, sides: 8, flat: 0.82, up: [1, 0, 0], jitter: 0.05, color: shell, paint: (u) => (Math.floor(u.y * 14) % 2 ? band : null) });
  k.seat = 0;
  head(k, { color: skin, cheeks: 0.06, crown: 0.9 });
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
    // Short feelers lower down.
    const lf = onHead(k, side * 0.36, -0.08, -0.01);
    pillar(k.head, k.rnd, v3(lf), [side * 0.07, lf.y + 0.03, lf.z + 0.05], 0.011, 0.007, skin, { base: 'limb5' });
  }
  k.blink = ['blinkL', 'blinkR'];
  const eyeAt = onHead(k, 0.32, 0.72).add(tipRel);
  k.eyeY = eyeAt.y;
  k.eyeX = eyeAt.x + 0.025;
  k.eyeR = 0.032;
  k.eyeZ = eyeAt.z + 0.035;
  // One small tendril on the right, which only reaches out to hold or gesture.
  arms(k, { color: skin, len: 0.08, r: 0.03, rightOnly: true });
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
  raccoon: { lean: 0.14, head: -0.05, paws: 0.55, gait: 'amble', cadence: 0.85, sit: 'tuck', idles: ['rubPaws', 'sniff', 'lookAround'], tailSway: 0.18 },
  // Round and soft, paws tucked up, hops everywhere, sits back with its big feet forward.
  bunny: { lean: 0.02, head: -0.04, paws: 0.5, gait: 'hop', cadence: 0.9, sit: 'feet', idles: ['earTwitch', 'noseWiggle', 'hop'], tailSway: 0.04, earsBack: 0.45 },
  // Slides along with a slow stretch and draw, settles low to sit.
  snail: { gait: 'slither', cadence: 0.55, sit: 'settle', idles: ['stalks', 'stretch', 'stalks'], tailSway: 0 },
};

export function profileOf(id: AnimalId): Profile {
  return { ...defaultProfile(), ...PROFILES[id] };
}
