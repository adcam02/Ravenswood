import * as THREE from 'three';
import { SMOOTH_LOOK, type Vec3 } from './build';
import { audit, isLow, seedOf, seeded, type Color } from './paper';
import { Sculpt, bake, copyMesh, decimate, ellipsoid, folds, labelOf, polygonise, pyramid, rod, settle, snapMarks, type Baked, type Mesh, type Probe, type Shape } from './sculpt';
import { bone, onHead, part, v3, type Kit } from './species';

/**
 * The sculpted body plan: the shapes each part of an animal is made of, placed on the kit's bones, ready to
 * be melted into one surface (see sculpt.ts). A recipe calls these, adds a painter for its markings, and the
 * rig bakes the lot into a single skinned surface (cached per animal, colour and detail).
 */

const add = (a: Vec3, b: Vec3): Vec3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];

export function sculptOf(k: Kit): Sculpt {
  if (!k.sculpt) k.sculpt = new Sculpt();
  return k.sculpt;
}

export interface TorsoOpts {
  /** Centre and radii of the belly (the big lower half of the pear) and of the chest above it. */
  belly: [Vec3, Vec3];
  chest: [Vec3, Vec3];
  /** How softly the chest melts into the belly. */
  melt?: number;
  /** The haunches (left one; mirrored), bulging at the base. */
  haunch?: [Vec3, Vec3];
  /** A thick ruff at the top of the chest that the head flows into. */
  ruff?: [Vec3, Vec3];
}

/** The body: a pear from a big belly and a narrower chest melted together, with haunches and a ruff. */
export function torso(k: Kit, o: TorsoOpts) {
  const sc = sculptOf(k);
  sc.add(ellipsoid('body', o.belly[0], o.belly[1], { name: 'belly' }));
  sc.add(ellipsoid('body', o.chest[0], o.chest[1], { k: o.melt ?? 0.14, name: 'chest' }));
  if (o.haunch) {
    for (const side of [-1, 1]) {
      const [c, r] = o.haunch;
      sc.add(ellipsoid('body', [side * c[0], c[1], c[2]], r, { k: 0.09, rot: [0.25, side * 0.25, 0], name: side > 0 ? 'haunchL' : 'haunchR' }));
    }
  }
  if (o.ruff) sc.add(ellipsoid('body', o.ruff[0], o.ruff[1], { k: 0.1, name: 'ruff' }));
  // The ellipsoid summary that dress-up, seats and holding use, measured off the melted body itself.
  const [cx, cy, cz] = o.belly[0];
  const bottom = cy - extent(sc, [cx, cy, cz], [0, -1, 0]);
  const top = cy + extent(sc, [cx, cy, cz], [0, 1, 0]);
  const back = cz - extent(sc, [cx, cy, cz], [0, 0, -1]);
  let front = 0;
  for (let y = bottom + 0.08; y < top - 0.04; y += 0.02) front = Math.max(front, cz + extent(sc, [0, y, cz], [0, 0, 1]));
  k.shape.tc = [0, (bottom + top) / 2, (front + back) / 2];
  k.shape.tr = [extent(sc, [cx, cy, cz], [1, 0, 0]), (top - bottom) / 2, (front - back) / 2];
  k.shape.pear = Math.max(0, 1 - extent(sc, [0, o.chest[0][1], o.chest[0][2]], [1, 0, 0]) / k.shape.tr[0]);
  k.front = front;
  k.seat = Math.min(bottom, o.haunch ? o.haunch[0][1] - o.haunch[1][1] : bottom);
}

/** How far from a point inside the sculpt the surface is, going one way. */
function extent(sc: Sculpt, from: Vec3, dir: Vec3): number {
  let lo = 0;
  let hi = 1.2;
  const at = (t: number) => sc.at(from[0] + dir[0] * t, from[1] + dir[1] * t, from[2] + dir[2] * t);
  for (let t = 0; t < 1.2; t += 0.04) {
    if (at(t) > 0) {
      hi = t;
      break;
    }
    lo = t;
  }
  for (let i = 0; i < 20; i++) {
    const m = (lo + hi) / 2;
    if (at(m) > 0) hi = m;
    else lo = m;
  }
  return (lo + hi) / 2;
}

export interface HeadOpts {
  /** Radii, and the centre relative to the neck joint. */
  r: Vec3;
  at?: Vec3;
  /** Cheek ruffs (the left one; mirrored), relative to the head's centre. */
  cheeks?: [Vec3, Vec3];
  /** How softly the head flows into the neck and ruff. */
  melt?: number;
}

/** The head: an ellipsoid flowing into the ruff below it, with cheek ruffs if it has them. */
export function headForm(k: Kit, o: HeadOpts) {
  const sc = sculptOf(k);
  k.shape.hr = o.r;
  if (o.at) k.shape.hc = o.at;
  k.headBend = undefined;
  const c = add(k.joints.neck, k.shape.hc);
  sc.add(ellipsoid('neck', c, o.r, { k: o.melt ?? 0.09, anchor: k.joints.neck, reach: 0.24, name: 'head' }));
  if (o.cheeks) {
    for (const side of [-1, 1]) {
      const [cc, r] = o.cheeks;
      // Melted into the head all round (they move together, so there's no joint to keep clear).
      sc.add(ellipsoid('neck', add(c, [side * cc[0], cc[1], cc[2]]), r, { k: 0.09, rot: [0, 0, -side * 0.35], name: side > 0 ? 'cheekL' : 'cheekR' }));
    }
  }
}

export interface SnoutOpts {
  /** Where it leaves the face (unit height on the head), its length, and radii at the root and tip. */
  dy: number;
  len: number;
  ra: number;
  rb: number;
  /** How far the tip drops. */
  drop?: number;
  /** Flattens it top to bottom (below 1) or side to side. */
  squash?: Vec3;
  melt?: number;
  /** Slender enough to need fattening when cut coarsely (a fox's). */
  thin?: boolean;
}

/**
 * A muzzle flowing out of the face. Returns where the nose goes (neck space), the tip's radius, and how high
 * the muzzle's middle line is at a point (model space), for painting its top and underside apart.
 */
export function snoutForm(k: Kit, o: SnoutOpts): { nose: Vec3; r: number; mid: (p: THREE.Vector3) => number } {
  const sc = sculptOf(k);
  const root = onHead(k, 0, o.dy);
  const a: Vec3 = [0, root.y + 0.005, root.z - o.ra * 0.6];
  const b: Vec3 = [0, root.y - (o.drop ?? 0.02), root.z + o.len];
  const n = k.joints.neck;
  sc.add(rod('neck', add(n, a), add(n, b), o.ra, o.rb, { k: o.melt ?? 0.045, anchor: add(n, v3(root)), reach: 0.12, name: 'muzzle', squash: o.squash, thin: o.thin }));
  const dir = new THREE.Vector3(...b).sub(new THREE.Vector3(...a)).normalize();
  const tip = new THREE.Vector3(...b).addScaledVector(dir, o.rb * 0.55);
  tip.y += o.rb * 0.35 * (o.squash?.[1] ?? 1);
  const A = new THREE.Vector3(...add(n, a));
  const B = new THREE.Vector3(...add(n, b));
  const mid = (p: THREE.Vector3) => {
    const t = Math.min(1, Math.max(0, p.clone().sub(A).dot(dir) / A.distanceTo(B)));
    return A.y + (B.y - A.y) * t;
  };
  return { nose: v3(tip), r: o.rb, mid };
}

export interface EarOpts {
  /** Where the ear's base sits on the head (unit sphere), half-width, height and half-depth. */
  x: number;
  y: number;
  w: number;
  h: number;
  d: number;
  /** Leaning outward, back and turned. */
  splay?: number;
  rake?: number;
  turn?: number;
  /** The inside of the ear, coloured on the front, this deep (a fraction of the depth). */
  cup?: number;
  /** A long rabbit ear (an ellipsoid) instead of a pyramid. */
  long?: boolean;
  /** Flops a long ear sideways. */
  flop?: number;
  /** A round ear (a flattened ellipsoid). */
  round?: boolean;
  /** Stands clear of the skull with a crisp notch round its base, rather than melting into it. */
  notch?: boolean;
}

/** Ears with real thickness, each on its own bone at its base so it can swivel and twitch. */
export function earForms(k: Kit, o: EarOpts) {
  const sc = sculptOf(k);
  for (const side of [-1, 1]) {
    const name = side > 0 ? 'earL' : 'earR';
    const base = onHead(k, side * o.x, o.y, o.notch ? -0.01 : -0.022);
    bone(k, name, 'neck', v3(base));
    const at = add(k.joints.neck, v3(base));
    const rot: Vec3 = [-(o.rake ?? 0.1), side * (o.turn ?? 0), -side * (o.splay ?? 0.3) + side * (o.flop ?? 0)];
    const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(...rot));
    const local = (x: number, y: number, z: number): Vec3 => add(at, v3(new THREE.Vector3(x, y, z).applyQuaternion(q)));
    if (o.long || o.round) {
      const c = local(0, o.h * (o.round ? 0.5 : 0.62), 0);
      sc.add(ellipsoid(name, c, [o.w, o.h * (o.round ? 0.5 : 0.62), o.d], { rot, k: 0.035, anchor: at, reach: 0.1, name, thin: true }));
      if (o.cup) sc.guides.push(ellipsoid(name, local(0, o.h * 0.66, o.d * 0.95), [o.w * 0.55, o.h * 0.42, o.d * o.cup], { rot, name: `${name}Cup` }));
      continue;
    }
    if (o.notch) sc.add(pyramid(name, at, o.w, o.h, o.d, { rot, k: 0.012, anchor: at, reach: 0.08, round: 0.012, name, thin: true, crease: 0.01 }));
    else sc.add(pyramid(name, at, o.w, o.h, o.d, { rot, k: 0.03, anchor: at, reach: 0.13, round: 0.016, name, thin: true }));
    if (o.cup) sc.guides.push(pyramid(name, local(0, o.h * 0.14, o.d * 0.95), o.w * 0.66, o.h * 0.74, o.d * o.cup, { rot, round: 0.004, name: `${name}Cup` }));
  }
}

export interface ArmOpts {
  /** Length to the wrist, thickness at the shoulder and the wrist. */
  len: number;
  r0: number;
  r1: number;
  /** Radii of the paw. */
  paw: Vec3;
  /**
   * How far forward and out the arm is made hanging (radians). It's made clear of the tummy so the two never
   * melt together, and bound that way, so the poses still say outright where the arm points.
   */
  fwd?: number;
  out?: number;
  /** How far past the end of the arm the paw sits (a hand coming out of a wide sleeve). */
  pawOut?: number;
}

/** Front legs as thick rounded pillars growing out of the chest, ending in paws. */
export function armForms(k: Kit, o: ArmOpts) {
  const sc = sculptOf(k);
  const sh = k.joints.shoulder;
  const fwd = o.fwd ?? 0.3;
  const out = o.out ?? 0.12;
  k.bind ??= {};
  // In the arm's own (untilted) space: straight down to the wrist, the paw just below and a touch forward.
  const pawAt: Vec3 = [0, -o.len - o.paw[1] * 0.35 - (o.pawOut ?? 0), o.paw[2] * 0.3];
  // An elbow half way down, so a paw holding something can be brought up in front of the chest.
  const elbow = o.len * 0.5;
  k.elbow = elbow;
  for (const side of [-1, 1]) {
    const name = side > 0 ? 'armL' : 'armR';
    const fore = side > 0 ? 'foreL' : 'foreR';
    const rot: Vec3 = [-fwd, 0, side * out];
    k.bind[name] = rot;
    bone(k, fore, name, [0, -elbow, 0]);
    const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(...rot));
    const s: Vec3 = [side * sh[0], sh[1], sh[2]];
    const local = (p: Vec3): Vec3 => add(s, v3(new THREE.Vector3(...p).applyQuaternion(q)));
    const e = local([0, -elbow, 0]);
    const wrist = local([0, -o.len, 0]);
    const mid = (o.r0 + o.r1) / 2;
    // Melted into the chest well down the arm, so it grows out of the body rather than lying against it.
    sc.add(rod(name, add(s, [0, 0.03, -0.015]), e, o.r0, mid, { k: 0.12, anchor: s, reach: 0.28, name }));
    sc.add(rod(fore, e, wrist, mid, o.r1, { k: 0.05, anchor: e, reach: 0.07, name: fore }));
    sc.add(ellipsoid(fore, local(pawAt), o.paw, { rot, k: 0.035, anchor: wrist, reach: 0.08, name: `${name}Paw` }));
    // The whole arm's length, for drawing socks along it.
    sc.guides.push(rod(name, s, wrist, o.r0, o.r1, { name: `${name}Axis` }));
  }
  // The paw's middle and the grip just in front of it, in the arm's own space.
  k.joints.paw = pawAt;
  k.joints.hand = [0, pawAt[1], pawAt[2] + o.paw[2] + 0.012];
}

export interface WingOpts {
  /** Length from the shoulder to the tip, how wide (front to back) and how thick. */
  len: number;
  w: number;
  d: number;
  /** How far forward and out it hangs, as for arms. */
  fwd?: number;
  out?: number;
  /** Narrower towards the tip (a flipper keeps more of its width). */
  taper?: number;
}

/**
 * Wings (or flippers) for arms: a broad flat blade hanging from the shoulder down the side, bending half way
 * on its own bone like an elbow, so a wing tip can hold things just like a paw. The tip is the "paw".
 */
export function wingForms(k: Kit, o: WingOpts) {
  const sc = sculptOf(k);
  const sh = k.joints.shoulder;
  const fwd = o.fwd ?? 0.12;
  const out = o.out ?? 0.18;
  const taper = o.taper ?? 0.6;
  k.bind ??= {};
  const elbow = o.len * 0.45;
  k.elbow = elbow;
  const tipAt: Vec3 = [0, -o.len * 0.82, o.w * 0.15];
  for (const side of [-1, 1]) {
    const name = side > 0 ? 'armL' : 'armR';
    const fore = side > 0 ? 'foreL' : 'foreR';
    const rot: Vec3 = [-fwd, 0, side * out];
    k.bind[name] = rot;
    bone(k, fore, name, [0, -elbow, 0]);
    const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(...rot));
    const s: Vec3 = [side * sh[0], sh[1], sh[2]];
    const local = (p: Vec3): Vec3 => add(s, v3(new THREE.Vector3(...p).applyQuaternion(q)));
    // Flat side to side, broad front to back, the leading edge a little forward of the bone.
    sc.add(ellipsoid(name, local([0, -elbow * 0.55, -o.w * 0.1]), [o.d, elbow * 0.75, o.w], { rot, k: 0.06, anchor: s, reach: 0.14, name, thin: true }));
    sc.add(ellipsoid(fore, local([0, -elbow - (o.len - elbow) * 0.45, -o.w * 0.15]), [o.d * 0.9, (o.len - elbow) * 0.6, o.w * taper], { rot, k: 0.04, anchor: local([0, -elbow, 0]), reach: 0.08, name: `${name}Paw`, thin: true }));
    sc.guides.push(rod(name, s, local([0, -o.len, 0]), o.d, o.d, { name: `${name}Axis` }));
  }
  k.joints.paw = tipAt;
  k.joints.hand = [0, tipAt[1], tipAt[2] + o.w * taper * 0.5 + 0.012];
}

/**
 * A bat's wings: thin finger-bone arms held out wide, with a membrane spread below each from the shoulder to
 * the tip. Made (and bound) spread out, which is how they're held while flapping.
 */
export function membraneWings(k: Kit, o: { len: number; span: number; d: number; fwd?: number; out?: number; fingers?: number[]; elbow?: number }) {
  const sc = sculptOf(k);
  const sh = k.joints.shoulder;
  const fwd = o.fwd ?? 0.15;
  const out = o.out ?? 1.45;
  k.bind ??= {};
  // A short upper arm and a long forearm, as a bat's are.
  const elbow = o.len * (o.elbow ?? 0.45);
  k.elbow = elbow;
  const tipAt: Vec3 = [0, -o.len * 0.92, 0.02];
  for (const side of [-1, 1]) {
    const name = side > 0 ? 'armL' : 'armR';
    const fore = side > 0 ? 'foreL' : 'foreR';
    const rot: Vec3 = [-fwd, 0, side * out];
    k.bind[name] = rot;
    bone(k, fore, name, [0, -elbow, 0]);
    const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(...rot));
    const s: Vec3 = [side * sh[0], sh[1], sh[2]];
    const local = (p: Vec3): Vec3 => add(s, v3(new THREE.Vector3(...p).applyQuaternion(q)));
    // Below the arm once it's spread is the arm's own -x on the left and +x on the right: a point on the wing
    // is how far along the arm (u) and how far below it (v).
    const down = -side;
    const at = (u: number, v: number, z = 0) => local([down * v, -u, z]);
    const e = at(elbow, 0);
    sc.add(rod(name, s, e, 0.032, 0.026, { k: 0.05, anchor: s, reach: 0.12, name }));
    sc.add(rod(fore, e, at(o.len, 0), 0.028, 0.022, { k: 0.03, anchor: e, reach: 0.06, name: fore, thin: true }));
    const webs = [
      { c: [o.span * 0.45, elbow * 0.55], r: [o.span * 0.5, elbow * 0.62] },
      { c: [o.span * 0.4, elbow + (o.len - elbow) * 0.42], r: [o.span * 0.42, (o.len - elbow) * 0.58] },
    ];
    sc.add(ellipsoid(name, at(webs[0].c[1], webs[0].c[0], -0.005), [webs[0].r[0], webs[0].r[1], o.d], { rot, k: 0.04, anchor: s, reach: 0.12, name: `${name}Web`, thin: true }));
    sc.add(ellipsoid(fore, at(webs[1].c[1], webs[1].c[0], -0.005), [webs[1].r[0], webs[1].r[1], o.d], { rot, k: 0.03, anchor: e, reach: 0.04, name: `${name}Hand`, thin: true }));
    // The wing's "paw" is its tip, where it takes hold of things.
    sc.guides.push(ellipsoid(fore, at(o.len * 0.9, 0.02), [0.05, 0.06, 0.04], { rot, name: `${name}Paw` }));
    // Fingers: struts fanning from the wrist out to the trailing edge, standing a little proud of the
    // membrane, which is scalloped between them (round bites out of the edge, leaving a point at each).
    const fingers = (o.fingers ?? []).map((f) => f * o.len).sort((a, b) => a - b);
    const edge = (u: number) => Math.max(...webs.map((w) => w.c[0] + w.r[0] * Math.sqrt(Math.max(0, 1 - ((u - w.c[1]) / w.r[1]) ** 2))));
    const wrist = o.len * 0.62;
    fingers.forEach((u, i) => sc.add(rod(fore, at(wrist, 0.01), at(u, edge(u) - 0.012), 0.033, 0.03, { k: 0.02, anchor: e, reach: 0.06, name: `${name}Finger${i}`, thin: true })));
    for (let i = 0; i + 1 < fingers.length; i++) {
      const u = (fingers[i] + fingers[i + 1]) / 2;
      const r = (fingers[i + 1] - fingers[i]) / 2;
      sc.add(ellipsoid(fore, at(u, edge(u) + r * 0.25), [r * 1.05, r, 0.08], { rot, k: 0.015, carve: true }));
    }
    sc.guides.push(rod(name, s, at(o.len, 0), 0.03, 0.03, { name: `${name}Axis` }));
  }
  k.joints.paw = tipAt;
  k.joints.hand = [0, tipAt[1], tipAt[2] + 0.03];
}

export interface BeakOpts {
  /** Where it leaves the face (unit height on the head), how far it sticks out, half-width and half-height. */
  dy: number;
  len: number;
  w: number;
  h: number;
  /** A flat duck's bill (a squashed rod) rather than a pointed beak. */
  flat?: boolean;
  /** How far it angles down. */
  drop?: number;
}

/** A beak or bill out of the face. Returns where its tip is (neck space). */
export function beakForm(k: Kit, o: BeakOpts): Vec3 {
  const sc = sculptOf(k);
  const root = onHead(k, 0, o.dy, -0.01);
  const n = k.joints.neck;
  const at = add(n, v3(root));
  const drop = o.drop ?? 0.2;
  const dir = new THREE.Vector3(0, -Math.sin(drop), Math.cos(drop));
  const tip = root.clone().addScaledVector(dir, o.len);
  if (o.flat) {
    sc.add(rod('neck', add(at, [0, 0, -0.02]), add(n, v3(tip)), o.w, o.w * 0.9, { k: 0.03, anchor: at, reach: 0.08, name: 'beak', squash: [1, o.h / o.w, 1], thin: true }));
  } else {
    // A pyramid lying forward, apex at the tip, turned a quarter so a ridge runs along the top.
    sc.add(pyramid('neck', add(at, [0, 0, -0.01]), o.w, o.len + 0.01, o.h, { rot: [Math.PI / 2 + drop, Math.PI / 4, 0], k: 0.025, anchor: at, reach: 0.07, round: 0.006, name: 'beak', thin: true }));
  }
  return v3(tip);
}

/** A fin: a thin pointed blade (a pyramid) on a bone, from `base` towards `dir`. */
export function finForm(k: Kit, bone: string, base: Vec3, o: { len: number; w: number; d: number; rot: Vec3; melt?: number; name: string }) {
  // Never thinner than the surface can be cut cleanly (a thinner blade folds over at its edges).
  const d = Math.max(o.d, 0.032);
  sculptOf(k).add(pyramid(bone, base, o.w, o.len, d, { rot: o.rot, k: o.melt ?? 0.03, anchor: base, reach: Math.max(0.08, o.w * 1.5), round: 0.014, name: o.name, thin: true }));
}

export interface TentacleOpts {
  /** How many each side, how long, thick at the root and the tip. */
  count: number;
  len: number;
  r0: number;
  r1: number;
  /** Where they leave the body (body space, the left side's middle one), and how far round they spread. */
  root: Vec3;
  spread?: number;
  /** How much they curl up at the tips. */
  curl?: number;
  /** Instead, laid along the ground and curled up and over at the tips, by this much (radians). */
  coil?: number;
  /** How far down they reach before spreading (0 lie flat, 1 hang). */
  hang?: number;
  /** How far out round the rim they start, how much they wave from side to side, and how they melt in. */
  rim?: number;
  wave?: number;
  melt?: number;
}

/** Tentacles in place of legs: tapering curling rods, a bunch on each leg bone so they sway together. */
export function tentacleForms(k: Kit, o: TentacleOpts): Shape[] {
  const sc = sculptOf(k);
  const all: Shape[] = [];
  const spread = o.spread ?? 1.6;
  const hang = o.hang ?? 0.3;
  for (const side of [-1, 1]) {
    const name = side > 0 ? 'legL' : 'legR';
    for (let j = 0; j < o.count; j++) {
      const a = (o.count === 1 ? 0 : j / (o.count - 1) - 0.5) * spread;
      const dir = new THREE.Vector3(side * Math.cos(a), 0, Math.sin(a));
      const pts: Vec3[] = [];
      const n = o.coil === undefined ? 5 : 8;
      // Each starts round the rim in its own direction, and (hanging) waves a little as it goes down.
      const start = new THREE.Vector3(side * Math.abs(o.root[0]), o.root[1], o.root[2]).add(dir.clone().multiplyScalar(o.rim ?? 0));
      const across = new THREE.Vector3(-dir.z, 0, dir.x);
      const r = (t: number) => o.r0 + (o.r1 - o.r0) * t;
      if (o.coil !== undefined) {
        // Marched out from the root: down and out, along the ground, then curling up and over at the tip.
        const p = start.clone();
        pts.push(v3(p));
        for (let i = 1; i <= n; i++) {
          const t = i / n;
          const pitch = -hang * 1.2 + (t > 0.5 ? ((t - 0.5) / 0.5) ** 1.5 * o.coil : 0);
          p.addScaledVector(dir, Math.cos(pitch) * (o.len / n)).add(new THREE.Vector3(0, Math.sin(pitch) * (o.len / n), 0));
          p.y = Math.max(p.y, r(t) * 0.9);
          pts.push(v3(p));
        }
      }
      for (let i = 0; i <= n && o.coil === undefined; i++) {
        const t = i / n;
        const out = t * o.len * (1 - hang * 0.6);
        const y = o.root[1] - t * o.len * hang + Math.max(0, t - 0.6) ** 2 * (o.curl ?? 0.15);
        const wave = Math.sin(t * 6 + j * 1.7) * (o.wave ?? 0) * t;
        pts.push([start.x + dir.x * out + across.x * wave, Math.max(o.r1 * 0.8 + (o.curl ?? 0.15) * Math.max(0, t - 0.7), y), start.z + dir.z * out + across.z * wave]);
      }
      for (let i = 0; i < n; i++) {
        const sh = rod(name, pts[i], pts[i + 1], r(i / n), r((i + 1) / n), { k: i === 0 ? o.melt ?? 0.06 : 0.025, anchor: pts[i], reach: i === 0 ? 0.14 : 0.06, name: `${name}T${j}_${i}`, thin: true });
        sc.add(sh);
        all.push(sh);
      }
    }
  }
  return all;
}

export interface LegOpts {
  r0: number;
  r1: number;
  /** Radii of the foot, and how far forward of the leg it reaches. */
  foot: Vec3;
  fwd?: number;
}

/** Short sturdy back legs flowing out of the haunches, on chunky planted feet. */
export function legForms(k: Kit, o: LegOpts) {
  const sc = sculptOf(k);
  const hip = k.joints.hip;
  for (const side of [-1, 1]) {
    const name = side > 0 ? 'legL' : 'legR';
    const h: Vec3 = [side * hip[0], hip[1], hip[2]];
    const ankle: Vec3 = [side * hip[0], o.foot[1] * 1.3, hip[2] + 0.01];
    sc.add(rod(name, add(h, [0, 0.04, 0]), ankle, o.r0, o.r1, { k: 0.06, anchor: h, reach: 0.11, name, thin: true }));
    sc.add(ellipsoid(name, [side * hip[0], o.foot[1] * 0.8, hip[2] + (o.fwd ?? o.foot[2] * 0.45)], o.foot, { k: 0.035, anchor: ankle, reach: 0.08, name: `${name}Foot`, thin: true }));
  }
}

export interface TailOpts {
  /** The path from the tail joint (in its own space), and the radius at each point. */
  pts: Vec3[];
  radii: number[];
  melt?: number;
}

/**
 * A tail of tapering rods along a path, melted into the rump and into each other, on three bones so it
 * can swish and curl. Returns how far along the tail (0 to 1) a point is, for drawing rings and tips.
 */
export function tailForm(k: Kit, o: TailOpts): (p: THREE.Vector3) => number {
  const sc = sculptOf(k);
  const j = k.joints.tail;
  const n = o.pts.length - 1;
  const i1 = Math.max(1, Math.round(n / 3));
  const i2 = Math.max(i1 + 1, Math.round((n * 2) / 3));
  bone(k, 'tail1', 'tail', o.pts[i1]);
  bone(k, 'tail2', 'tail1', [o.pts[i2][0] - o.pts[i1][0], o.pts[i2][1] - o.pts[i1][1], o.pts[i2][2] - o.pts[i1][2]]);
  const segs: Shape[] = [];
  for (let i = 0; i < n; i++) {
    const a = add(j, o.pts[i]);
    const b = add(j, o.pts[i + 1]);
    const b0 = i < i1 ? 'tail' : i < i2 ? 'tail1' : 'tail2';
    const s = rod(b0, a, b, o.radii[i], o.radii[i + 1], { k: i === 0 ? o.melt ?? 0.06 : 0.035, anchor: a, reach: i === 0 ? 0.14 : 0.08, name: `tail${i}` });
    segs.push(s);
    sc.add(s);
  }
  return (p) => along(segs, p);
}

/** Moves a point (neck space) onto the sculpted surface, along the head's outward direction. */
export function snap(k: Kit, p: THREE.Vector3, out = 0): THREE.Vector3 {
  if (!k.sculpt) return p;
  const n = new THREE.Vector3(...k.joints.neck);
  const m = p.clone().add(n);
  const g = new THREE.Vector3();
  for (let i = 0; i < 4; i++) {
    const d = k.sculpt.at(m.x, m.y, m.z);
    k.sculpt.grad(m.x, m.y, m.z, g);
    m.addScaledVector(g, -d);
  }
  k.sculpt.grad(m.x, m.y, m.z, g);
  return m.addScaledVector(g, out).sub(n);
}

/** From here on, features placed on the head (eyes, noses, mouths) sit on the sculpted surface. */
export function useSurface(k: Kit) {
  const n = new THREE.Vector3(...k.joints.neck);
  k.surface = (p, out) => snap(k, p, out);
  k.normalAt = (p) => {
    const m = p.clone().add(n);
    return k.sculpt ? k.sculpt.grad(m.x, m.y, m.z) : new THREE.Vector3(0, 0, 1);
  };
}

/** How finely the surface is cut (about 3.5k faces for a whole animal), and how much of it is kept far off. */
export const STEP = 0.04;
export const LOW_KEEP = 0.25;
/** The most faces an animal's surface may have, close up. */
export const MAX_TRIS = 3500;

/** Cut surfaces by animal (they don't depend on colour), and baked ones by animal, colour and detail. */
const meshes = new Map<string, Mesh>();
const cache = new Map<string, Baked>();

/**
 * Bakes the kit's sculpt into one skinned, coloured surface part. The surface is cut once per animal; far off
 * it's thinned out from that; each colour is then lined up with its markings and baked (all kept for reuse).
 */
export function finishSculpt(k: Kit, animal: string, coat: string) {
  if (!k.sculpt || !k.marks) return;
  const low = isLow();
  const id = `${animal}:${coat}:${low ? 'low' : 'high'}`;
  let baked = cache.get(id);
  if (!baked) {
    const sc = k.sculpt;
    const { base, marks } = k.marks;
    // Which marking a point is in: the first that covers it, or the base colour after them all.
    const fields = marks.map((m) => m.f);
    const colors = [...marks.map((m) => new THREE.Color(m.color)), new THREE.Color(base)];
    // Thin things (ears, legs) are fattened a touch so they don't fold, and creases kept a little soft.
    const step = k.step ?? STEP;
    sc.grow = step * 0.15;
    sc.crease = step * 0.5;
    const which = `${animal}:${low ? 'low' : 'high'}`;
    let cut = meshes.get(which);
    if (!cut) {
      let high = meshes.get(`${animal}:high`);
      if (!high) {
        // Should that leave a fold somewhere it can't be settled out of, it's cut again on a grid shifted a
        // little (where the surface passes through the cells differently).
        let best = Infinity;
        for (let i = 0; i < 4 && best > 0; i++) {
          const cut = polygonise(sc, step, seedOf(animal) + i, SMOOTH_LOOK ? 0 : 0.18, i * 0.37);
          settle(sc, cut);
          const n = folds(cut);
          if (n < best) {
            best = n;
            high = cut;
          }
        }
        // Kept under the triangle budget (a long-limbed animal cuts to more), by merging the flattest facets.
        // (Less, the more crisp pieces are attached to it.)
        const n = high!.tris.length / 3;
        const cap = Math.max(2000, MAX_TRIS - [...k.parts].filter(([name]) => name.startsWith('piece:')).reduce((sum, [, p]) => sum + p.fold.faces, 0));
        if (n > cap * 1.03) high = decimate(high!, cap / n, step * 2.5);
        meshes.set(`${animal}:high`, high!);
      }
      cut = low ? decimate(high!, LOW_KEEP, step * 5) : high!;
      meshes.set(which, cut);
    }
    const mesh = copyMesh(cut);
    snapMarks(sc, mesh, fields);
    settle(sc, mesh, false);
    // (?look=smooth: no facet-to-facet tone, and gentler creases, as the older smooth finish had none baked.)
    const finish = SMOOTH_LOOK ? { tone: 0, depth: 0.12 } : {};
    baked = bake(sc, mesh, { paint: (q) => colors[labelOf(fields, q)], colors, seed: seedOf(id), ...finish });
    cache.set(id, baked);
  }
  const f = part(k, 'skin', 'body');
  f.pos = baked.fold.pos;
  f.col = baked.fold.col;
  f.along = baked.fold.along;
  f.bones = baked.fold.bones;
  f.si = baked.fold.si;
  f.sw = baked.fold.sw;
}

// ---------------------------------------------------------------- markings

/** A field over the body for drawing a marking: below zero inside it. */
export type Field = (q: Probe) => number;

export interface Mark {
  color: Color;
  f: Field;
}

/** How an animal is coloured: a base colour, and markings over it (where they overlap, the first wins). */
export interface Markings {
  base: Color;
  marks: Mark[];
}

/** Inside a marking only where all of these are. */
export const all =
  (...fs: Field[]): Field =>
  (q) => {
    let m = -Infinity;
    for (const f of fs) {
      m = Math.max(m, f(q));
      if (m >= 0) return m;
    }
    return m;
  };

/** Inside a marking where any of these is. */
export const any =
  (...fs: Field[]): Field =>
  (q) => {
    let m = Infinity;
    for (const f of fs) {
      m = Math.min(m, f(q));
      if (m < 0) return m;
    }
    return m;
  };

/** The part of the body made of the named shapes (wherever they're nearer than any other shape). */
export function region(k: Kit, ...names: (string | RegExp)[]): Field {
  const ins: number[] = [];
  const outs: number[] = [];
  sculptOf(k).shapes.forEach((s, i) => {
    if (s.carve) return;
    const hit = names.some((n) => (typeof n === 'string' ? s.name === n : n.test(s.name ?? '')));
    (hit ? ins : outs).push(i);
  });
  return (q) => {
    let a = Infinity;
    for (const i of ins) a = Math.min(a, q.dist(i));
    if (a === Infinity) return Infinity;
    let b = Infinity;
    for (const i of outs) b = Math.min(b, q.dist(i));
    return a - b;
  };
}

/** Where a point is on a named shape's own unit form. */
export function unitOf(k: Kit, name: string): (q: Probe) => THREE.Vector3 {
  const s = sculptOf(k).named(name);
  if (!s?.unit) throw new Error(`no shape ${name}`);
  return (q) => s.unit!(q.p);
}

/** An ear's markings: the scooped-out inside, and its front and back halves (split down the middle of its edge). */
export function earMarks(k: Kit, name: string): { inner: Field; front: Field; back: Field } {
  const cup = sculptOf(k).named(`${name}Cup`);
  const u = unitOf(k, name);
  const on = region(k, name);
  return {
    inner: cup ? (q) => cup.d(q.p.x, q.p.y, q.p.z) - 0.004 : () => Infinity,
    // The front only above the base, so none of it spills onto the skull.
    front: all(on, (q) => -u(q).z, (q) => 0.12 - u(q).y),
    back: all(on, (q) => u(q).z),
  };
}

/** A stripe across a rod at `t` of the way along it: below zero beyond that (a sock's straight top edge). */
export function beyond(k: Kit, name: string, t: number): Field {
  const u = unitOf(k, name);
  return (q) => t - u(q).y;
}

/** A sock on a front leg: everything from `t` of the way down it (a clean straight top edge) to the paw. */
export function sock(k: Kit, side: 'L' | 'R', t: number): Field {
  return all(region(k, `arm${side}`, `fore${side}`, `arm${side}Paw`), beyond(k, `arm${side}Axis`, t));
}

/** For markings: how far along a chain of shapes (a tail, a shell) a point is, 0 at its root to 1 at its tip. */
export function along(shapes: Shape[], p: THREE.Vector3): number {
  let best = 0;
  let bd = Infinity;
  shapes.forEach((s, i) => {
    const d = s.d(p.x, p.y, p.z);
    if (d < bd) {
      bd = d;
      best = i;
    }
  });
  return (best + Math.min(1, Math.max(0, shapes[best].unit!(p).y))) / shapes.length;
}


// ---------------------------------------------------------------- crisp attached pieces

/** Where a bone sits at rest, in the model's space. */
export function boneAt(k: Kit, name: string): THREE.Vector3 {
  const j = k.joints;
  const mirror = (p: Vec3): Vec3 => [-p[0], p[1], p[2]];
  const own: Record<string, [string | null, Vec3]> = {
    body: [null, [0, 0, 0]],
    neck: ['body', j.neck],
    armL: ['body', j.shoulder],
    armR: ['body', mirror(j.shoulder)],
    legL: ['body', j.hip],
    legR: ['body', mirror(j.hip)],
    tail: ['body', j.tail],
  };
  for (const b of k.bones) own[b.name] ??= [b.parent, b.pos];
  const at = new THREE.Vector3();
  for (let n: string | null = name; n; n = own[n]?.[0] ?? null) at.add(new THREE.Vector3(...(own[n]?.[1] ?? [0, 0, 0])));
  return at;
}

export interface PieceOpts {
  bone: string;
  /** The spine of the piece, from its root (sunk into the body) to its point (model space). */
  pts: THREE.Vector3[];
  /** Half its width and half its thickness at each point (the last are usually 0, for a point). */
  w: number[];
  t: number[];
  /** Which way is across it (its width); its thickness is square to that and to its spine. */
  across: THREE.Vector3;
  /** A colour for each stretch between points. */
  colors: Color[];
  name: string;
}

/**
 * A crisp faceted piece fixed rigidly to one bone, built as plain geometry rather than sculpted (the surface
 * would melt anything this small into a bump): a diamond in section, tapering along its spine to a point, so
 * it has a ridge down each face. Its root is left open, sunk inside the body.
 */
export function piece(k: Kit, o: PieceOpts) {
  // Far off, just the root and the point: a plain four-sided spike.
  if (isLow()) {
    const last = o.pts.length - 1;
    o = { ...o, pts: [o.pts[0], o.pts[last]], w: [o.w[0], o.w[last]], t: [o.t[0], o.t[last]], colors: [o.colors[last - 1]] };
  }
  const f = part(k, `piece:${o.bone}`, o.bone);
  const origin = boneAt(k, o.bone);
  const rnd = seeded(seedOf(o.name) + (k.pieces?.length ?? 0));
  const rings = o.pts.map((p, i) => {
    const prev = o.pts[Math.max(0, i - 1)];
    const next = o.pts[Math.min(o.pts.length - 1, i + 1)];
    const d = next.clone().sub(prev).normalize();
    const a = o.across.clone().addScaledVector(d, -o.across.dot(d)).normalize();
    const b = new THREE.Vector3().crossVectors(d, a);
    return [a, b, a.clone().negate(), b.clone().negate()].map((dir, j) => p.clone().addScaledVector(dir, j % 2 ? o.t[i] : o.w[i]));
  });
  const tint = new THREE.Color();
  const face = (va: THREE.Vector3, vb: THREE.Vector3, vc: THREE.Vector3, mid: THREE.Vector3, color: Color) => {
    const n = new THREE.Vector3().subVectors(vb, va).cross(new THREE.Vector3().subVectors(vc, va));
    if (n.lengthSq() < 1e-12) return;
    const c = va.clone().add(vb).add(vc).multiplyScalar(1 / 3);
    // Wound to face out from the spine.
    const tri = n.dot(c.sub(mid)) < 0 ? [va, vc, vb] : [va, vb, vc];
    tint.set(color).multiplyScalar(1 + (rnd() - 0.5) * 0.08);
    for (const v of tri) {
      f.pos.push(v.x - origin.x, v.y - origin.y, v.z - origin.z);
      f.col.push(tint.r, tint.g, tint.b);
      f.along.push(-1);
    }
    audit.faces++;
  };
  for (let i = 0; i + 1 < rings.length; i++) {
    const mid = o.pts[i].clone().add(o.pts[i + 1]).multiplyScalar(0.5);
    const tip = o.w[i + 1] === 0 && o.t[i + 1] === 0;
    for (let j = 0; j < 4; j++) {
      const a0 = rings[i][j];
      const a1 = rings[i][(j + 1) % 4];
      if (tip) face(a0, a1, o.pts[i + 1], mid, o.colors[i]);
      else {
        const b0 = rings[i + 1][j];
        const b1 = rings[i + 1][(j + 1) % 4];
        face(a0, a1, b1, mid, o.colors[i]);
        face(a0, b1, b0, mid, o.colors[i]);
      }
    }
  }
  (k.pieces ??= []).push({ name: o.name, bone: o.bone, root: rings[0].map(v3) });
}

/** Where a ray from inside the body (`from`, along `dir`) comes out through the sculpted surface, and which way is out there. */
export function surfaceHit(k: Kit, from: THREE.Vector3, dir: THREE.Vector3): { p: THREE.Vector3; n: THREE.Vector3 } | null {
  const sc = sculptOf(k);
  const d = dir.clone().normalize();
  const p = new THREE.Vector3();
  let prev = sc.at(from.x, from.y, from.z);
  if (prev > 0) return null;
  for (let t = 0.005; t < 1; t += 0.005) {
    p.copy(from).addScaledVector(d, t);
    const f = sc.at(p.x, p.y, p.z);
    if (f > 0) {
      // Between the last two steps, where the field crosses nought.
      p.addScaledVector(d, -0.005 * (f / (f - prev)));
      return { p, n: sc.grad(p.x, p.y, p.z) };
    }
    prev = f;
  }
  return null;
}

// ---------------------------------------------------------------- small sculpted things (pets)

/** Inside a marking where these named shapes of a sculpt are the nearest (a kit-free `region`). */
export function regionOf(sc: Sculpt, ...names: string[]): Field {
  const ins: number[] = [];
  const outs: number[] = [];
  sc.shapes.forEach((s, i) => {
    if (s.carve) return;
    (names.includes(s.name ?? '') ? ins : outs).push(i);
  });
  return (q) => {
    let a = Infinity;
    for (const i of ins) a = Math.min(a, q.dist(i));
    let b = Infinity;
    for (const i of outs) b = Math.min(b, q.dist(i));
    return a - b;
  };
}

/**
 * A small sculpted thing that isn't an animal (a pet): one surface cut from the sculpt, its markings drawn
 * with clean edges, faceted and shaded like the animals, as a plain coloured geometry.
 */
export function sculptGeometry(sc: Sculpt, m: Markings, step: number, seed: number): THREE.BufferGeometry {
  const fields = m.marks.map((x) => x.f);
  const colors = [...m.marks.map((x) => new THREE.Color(x.color)), new THREE.Color(m.base)];
  sc.grow = step * 0.15;
  sc.crease = step * 0.5;
  let best: Mesh | null = null;
  let fewest = Infinity;
  for (let i = 0; i < 3 && fewest > 0; i++) {
    const cut = polygonise(sc, step, seed + i, 0.18, i * 0.37);
    settle(sc, cut);
    const n = folds(cut);
    if (n < fewest) {
      fewest = n;
      best = cut;
    }
  }
  const mesh = best!;
  snapMarks(sc, mesh, fields);
  settle(sc, mesh, false);
  return bake(sc, mesh, { paint: (q) => colors[labelOf(fields, q)], colors, seed }).fold.geometry();
}
