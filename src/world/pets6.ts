import * as THREE from 'three';
import { Builder, glow, soft, wet, type Vec3 } from './build';
import { regionOf, type Field } from './forms';
import { Sculpt, box, ellipsoid, pyramid, rod } from './sculpt';
import {
  Act,
  BLUSH,
  Critter,
  INK,
  V,
  addEyes,
  arc,
  bead,
  bell,
  both,
  clamp,
  cutout,
  either,
  flatBase,
  frontZ,
  gem,
  irisEyes,
  onFront,
  onSurface,
  patch,
  pip,
  sculpted,
  sph,
  spike,
  spots,
  tube,
} from './petkit';

/**
 * The sixth set of pets: classic gags and more fond nods to pop culture (a big red dog who's still small, a pet
 * rock, a sock puppet, a flying toaster). Built from the same kit as the others (see petkit.ts).
 */

/** A smooth ease from 0 to 1 as `u` goes from `a` to `b`. */
const ease = (u: number, a: number, b: number) => {
  const x = clamp((u - a) / (b - a), 0, 1);
  return x * x * (3 - 2 * x);
};

/** Up over the first `rise` of an act, held, and back down over its last `rise` (0 between acts). */
const held = (u: number, rise = 0.15) => (u < 0 ? 0 : ease(u, 0, rise) * (1 - ease(u, 1 - rise, 1)));

/** A cone from `base` pointing along `dir` (a beak, a spine): `len` long, `r` round at the base. */
function cone(b: Builder, base: Vec3, dir: Vec3, len: number, r: number, color: THREE.ColorRepresentation, sides = 5) {
  const d = V(dir).normalize();
  const m = new THREE.Matrix4().compose(V(base).addScaledVector(d, len / 2), new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d), new THREE.Vector3(r, len, r));
  b.add(spike(sides), color, m);
}

/** A see-through material (a glass dome, a ghost's body, a beam). */
function see(color: THREE.ColorRepresentation, opacity: number, emissive = 0): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: emissive, transparent: true, opacity, roughness: 0.3, depthWrite: false });
}

/** A leg for a four-legged pet: a rod down from `top` to a round paw, cut flat. */
function pawLeg(name: string, top: number, r: number, color: string, paw = color) {
  return sculpted(name, () => {
    const l = new Sculpt();
    l.add(rod('body', [0, top, 0], [0, 0.016, 0.003], r, r * 0.85, { name: 'leg' }));
    l.add(ellipsoid('body', [0, 0.012, 0.007], [r * 1.05, 0.012, r * 1.3], { k: 0.01, name: 'paw' }));
    l.add(flatBase());
    return { sc: l, marks: { base: color, marks: paw === color ? [] : [{ color: paw, f: regionOf(l, 'paw') }] } };
  }, 0.013);
}

/** A pet with legs on pivots that walk: four in diagonal pairs, two in turn. */
class Pal extends Critter {
  protected legs: THREE.Group[] = [];
  protected stride = 0;
  /** A copy of `geo` (built at x = z = 0) at each spot, hung from `top`. */
  protected addLegs(geo: THREE.BufferGeometry, top: number, at: [number, number][], parent: THREE.Object3D = this.bodyGroup) {
    for (const [x, z] of at) {
      const lb = new Builder();
      lb.addColored(geo, { pos: [x, 0, z] });
      this.legs.push(this.piece(lb, [x, top, z], parent));
    }
  }
  /** Moves the stride on (quicker the faster it goes) and swings the legs; gives the stride's sine. */
  protected walkLegs(dt: number, move: number, rate = 12, swing = 0.6): number {
    this.stride += dt * (rate + clamp(this.speed, 0, 8)) * move;
    const w = Math.sin(this.stride);
    const four = this.legs.length === 4;
    this.legs.forEach((leg, i) => (leg.rotation.x = w * (four ? (i === 0 || i === 3 ? 1 : -1) : i % 2 ? 1 : -1) * swing * move));
    return w;
  }
}

/** 1. A big red dog, only small: he trots along wagging, and now and then puffs himself up big. */
class RedPup extends Pal {
  private head: THREE.Group;
  private ears: THREE.Group[] = [];
  private tail: THREE.Group;
  private big = new Act(6, 12, 2.2);
  constructor() {
    const red = '#d8342c';
    const sc = new Sculpt();
    sc.add(ellipsoid('body', [0, 0.1, -0.015], [0.048, 0.045, 0.075], { name: 'body' }));
    sc.add(ellipsoid('body', [0, 0.112, 0.04], [0.044, 0.05, 0.04], { k: 0.03, name: 'body' }));
    const b = new Builder();
    b.addColored(sculpted('redpup', () => ({ sc, marks: { base: red, marks: [] } }), 0.018));
    const hs = new Sculpt();
    hs.add(ellipsoid('body', [0, 0.185, 0.07], [0.05, 0.046, 0.045], { name: 'head' }));
    hs.add(ellipsoid('body', [0, 0.166, 0.11], [0.027, 0.021, 0.026], { k: 0.02, name: 'muzzle' }));
    const hb = new Builder();
    hb.addColored(sculpted('redpup-head', () => ({ sc: hs, marks: { base: red, marks: [{ color: '#e65047', f: regionOf(hs, 'muzzle') }] } }), 0.016));
    hb.add(gem(), INK, { pos: [0, 0.176, frontZ(hs, 0, 0.176) + 0.002], scale: [0.012, 0.009, 0.009] });
    arc(hb, [0, 0.158, frontZ(hs, 0, 0.158)], 0.011, INK, false, Math.PI * 0.8);
    const e = new Builder();
    addEyes(e, 0.2, frontZ(hs, 0.021, 0.2) - 0.004, 0.021, 0.0115);
    super(b, e, 0.2);
    this.head = this.piece(hb, [0, 0.15, 0.06]);
    this.eyesOn(this.head);
    for (const s of [-1, 1]) {
      const eb = new Builder();
      eb.add(sph(10, 8), '#b52520', { pos: [s * 0.05, 0.18, 0.066], rot: [0, 0, s * 0.2], scale: [0.012, 0.034, 0.024] });
      this.ears.push(this.piece(eb, [s * 0.045, 0.21, 0.066], this.head));
    }
    this.addLegs(pawLeg('redpup-leg', 0.085, 0.016, red), 0.085, [[-0.03, 0.04], [0.03, 0.04], [-0.03, -0.065], [0.03, -0.065]]);
    const tb = new Builder();
    tube(tb, [[0, 0.12, -0.085], [0, 0.15, -0.105], [0, 0.18, -0.11]], 0.009, red, 6);
    this.tail = this.piece(tb, [0, 0.12, -0.085]);
  }
  protected animate(dt: number, t: number, move: number) {
    // Still, now and then he swells up to twice his size and stands proud a moment, then shrinks back.
    const g = held(this.big.step(dt, move < 0.2), 0.2);
    const w = this.walkLegs(dt, move);
    this.bodyGroup.scale.setScalar(1 + g * 0.9);
    this.bodyGroup.position.y = Math.abs(w) * 0.008 * move;
    this.head.rotation.set(-g * 0.3 + move * 0.08, clamp(this.turn * 0.12, -0.4, 0.4) + Math.sin(t * 0.7) * 0.15 * (1 - move) * (1 - g), Math.sin(t * 0.9) * 0.08 * (1 - g));
    this.ears.forEach((ear, i) => (ear.rotation.z = (i ? 1 : -1) * (Math.sin(this.stride * 2) * 0.15 * move + g * 0.25)));
    this.tail.rotation.set(-0.2, Math.sin(t * 15) * 0.5 * (1 - g * 0.6), 0);
  }
}

/** 2. A lanky brown hound with black spots and a diamond tag: he lopes along, and jumps out of his skin at nothing now and then. */
class Mutt extends Pal {
  private head: THREE.Group;
  private tail: THREE.Group;
  private fright = new Act(6, 12, 2);
  constructor() {
    const brown = '#a8763e';
    const sc = new Sculpt();
    sc.add(ellipsoid('body', [0, 0.15, -0.01], [0.042, 0.042, 0.082], { name: 'body' }));
    sc.add(rod('body', [0, 0.16, 0.05], [0, 0.22, 0.07], 0.03, 0.024, { k: 0.02, name: 'neck' }));
    const b = new Builder();
    b.addColored(
      sculpted('mutt', () => ({ sc, marks: { base: brown, marks: [{ color: '#2b2118', f: spots(14, 6, [0, 0.15, -0.01], [0.042, 0.042, 0.082], [0.013, 0.011, 0.013], (d) => d.y > -0.3) }] } }), 0.017),
    );
    // The teal collar and its gold diamond tag.
    b.add(new THREE.TorusGeometry(1, 0.2, 5, 14), '#2fa9a0', { pos: [0, 0.205, 0.066], rot: [Math.PI / 2 - 0.3, 0, 0], scale: 0.026 });
    b.add(new THREE.OctahedronGeometry(1), '#f2c230', { pos: [0, 0.19, 0.096], scale: [0.009, 0.011, 0.004] });
    const hs = new Sculpt();
    hs.add(ellipsoid('body', [0, 0.255, 0.075], [0.036, 0.036, 0.04], { name: 'head' }));
    hs.add(ellipsoid('body', [0, 0.238, 0.122], [0.022, 0.02, 0.036], { k: 0.02, name: 'muzzle' }));
    const hb = new Builder();
    hb.addColored(sculpted('mutt-head', () => ({ sc: hs, marks: { base: brown, marks: [{ color: '#c69a62', f: regionOf(hs, 'muzzle') }] } }), 0.014));
    hb.add(gem(), INK, { pos: [0, 0.246, frontZ(hs, 0, 0.246) + 0.002], scale: [0.012, 0.009, 0.009] });
    arc(hb, [0, 0.226, frontZ(hs, 0, 0.226)], 0.012, INK, false, Math.PI * 0.6, [0, 0, 0.2]);
    for (const s of [-1, 1]) hb.add(sph(8, 6), '#3b2a1c', { pos: [s * 0.036, 0.258, 0.07], rot: [0, 0, s * 0.3], scale: [0.009, 0.026, 0.018] });
    const e = new Builder();
    addEyes(e, 0.268, frontZ(hs, 0.017, 0.268) - 0.004, 0.017, 0.011);
    super(b, e, 0.268);
    this.head = this.piece(hb, [0, 0.225, 0.07]);
    this.eyesOn(this.head);
    this.addLegs(pawLeg('mutt-leg', 0.135, 0.012, brown), 0.135, [[-0.026, 0.045], [0.026, 0.045], [-0.026, -0.07], [0.026, -0.07]]);
    const tb = new Builder();
    tube(tb, [[0, 0.16, -0.085], [0, 0.19, -0.11], [0, 0.22, -0.115]], 0.006, brown, 5);
    this.tail = this.piece(tb, [0, 0.16, -0.085]);
  }
  protected animate(dt: number, t: number, move: number) {
    // The fright: a leap straight up, legs splayed, then a good long shiver with the tail tucked.
    const f = this.fright.step(dt, move < 0.2);
    const jump = f < 0 ? 0 : Math.sin(clamp(f / 0.3, 0, 1) * Math.PI);
    const shiver = f < 0 ? 0 : ease(f, 0.25, 0.32) * (1 - ease(f, 0.85, 1));
    const w = this.walkLegs(dt, move, 10, 0.55);
    this.legs.forEach((leg, i) => (leg.rotation.z = (i % 2 ? -1 : 1) * jump * 0.5));
    this.bodyGroup.position.set(Math.sin(t * 60) * 0.003 * shiver, jump * 0.09 + Math.abs(w) * 0.01 * move - shiver * 0.012, 0);
    this.bodyGroup.rotation.set(move * 0.05 + shiver * 0.08, 0, 0);
    this.head.rotation.set(-jump * 0.4 + shiver * 0.2, clamp(this.turn * 0.12, -0.4, 0.4) + Math.sin(t * 0.6) * 0.3 * (1 - move) * (1 - shiver) + Math.sin(t * 9) * 0.25 * shiver, 0);
    this.tail.rotation.set(shiver * 1.4 - 0.1, Math.sin(t * 12) * 0.35 * (1 - shiver), 0);
  }
}

/** 3. A white lab mouse with an enormous head, forever scheming: he scurries, and steeples his paws now and then. */
class BrainMouse extends Pal {
  private head: THREE.Group;
  private arms: THREE.Group[] = [];
  private tail: THREE.Group;
  private scheme = new Act(4, 9, 3);
  constructor() {
    const fur = '#dcd8de';
    const pink = '#f1a7b5';
    const sc = new Sculpt();
    sc.add(ellipsoid('body', [0, 0.072, 0], [0.033, 0.04, 0.03], { name: 'body' }));
    const b = new Builder();
    b.addColored(sculpted('brainmouse', () => ({ sc, marks: { base: fur, marks: [] } }), 0.014));
    const hs = new Sculpt();
    hs.add(ellipsoid('body', [0, 0.16, 0.005], [0.066, 0.055, 0.056], { name: 'head' }));
    hs.add(ellipsoid('body', [0, 0.19, -0.008], [0.062, 0.048, 0.052], { k: 0.03, name: 'head' }));
    hs.add(ellipsoid('body', [0, 0.135, 0.05], [0.022, 0.017, 0.024], { k: 0.02, name: 'snout' }));
    const hb = new Builder();
    // A few furrows across the great brow.
    hb.addColored(
      sculpted('brainmouse-head', () => ({
        sc: hs,
        marks: { base: fur, marks: [{ color: '#c4bfc7', f: (q) => (q.p.y > 0.2 ? Math.abs(Math.sin(q.p.x * 90 + q.p.z * 40)) - 0.12 : 1) }] },
      }), 0.014),
    );
    hb.add(bead(), pink, { pos: [0, 0.14, frontZ(hs, 0, 0.14) + 0.002], scale: [0.007, 0.006, 0.006] });
    // A stern little frown, and heavy lids over the eyes.
    arc(hb, [0, 0.122, frontZ(hs, 0, 0.122) - 0.001], 0.008, INK, true, Math.PI * 0.7);
    for (const s of [-1, 1]) {
      hb.add(sph(10, 8), fur, { pos: [s * 0.024, 0.172, frontZ(hs, s * 0.024, 0.172) - 0.002], rot: [0.35, 0, -s * 0.25], scale: [0.017, 0.007, 0.012] });
      for (const [c, r, z] of [[fur, 0.032, 0], [pink, 0.024, 0.004]] as [string, number, number][]) {
        hb.add(sph(12, 8), c, { pos: [s * 0.068, 0.2, -0.01 + z], rot: [0, -s * 0.4, s * 0.25], scale: [r, r * 1.05, 0.007] });
      }
    }
    for (const s of [-1, 1]) for (const k of [-1, 1]) tube(hb, [[s * 0.016, 0.137 + k * 0.002, 0.07], [s * 0.04, 0.14 + k * 0.008, 0.074]], 0.0008, '#ffffff', 3);
    const e = new Builder();
    addEyes(e, 0.164, frontZ(hs, 0.024, 0.164) - 0.003, 0.024, 0.01);
    super(b, e, 0.164);
    this.head = this.piece(hb, [0, 0.105, 0]);
    this.eyesOn(this.head);
    for (const s of [-1, 1]) {
      const ab = new Builder();
      tube(ab, [[s * 0.028, 0.09, 0.005], [s * 0.04, 0.072, 0.018], [s * 0.028, 0.065, 0.032]], 0.006, fur, 4);
      ab.add(gem(), pink, { pos: [s * 0.026, 0.065, 0.034], scale: 0.008 });
      this.arms.push(this.piece(ab, [s * 0.028, 0.09, 0.005]));
    }
    const leg = sculpted('brainmouse-leg', () => {
      const l = new Sculpt();
      l.add(rod('body', [0, 0.045, 0], [0, 0.012, 0.004], 0.011, 0.009, { name: 'leg' }));
      l.add(ellipsoid('body', [0, 0.008, 0.012], [0.011, 0.008, 0.02], { k: 0.006, name: 'foot' }));
      l.add(flatBase());
      return { sc: l, marks: { base: fur, marks: [{ color: pink, f: regionOf(l, 'foot') }] } };
    }, 0.01);
    this.addLegs(leg, 0.045, [[-0.018, 0], [0.018, 0]]);
    const tb = new Builder();
    tube(tb, [[0, 0.045, -0.026], [0, 0.02, -0.06], [0.01, 0.012, -0.1], [0.03, 0.03, -0.12]], 0.003, pink, 4);
    this.tail = this.piece(tb, [0, 0.045, -0.026]);
  }
  protected animate(dt: number, t: number, move: number) {
    // Scheming: paws come together under the chin, fingertips tapping, head lowered with a sidelong look.
    const s = held(this.scheme.step(dt, move < 0.2));
    const w = this.walkLegs(dt, move, 16, 0.8);
    this.bodyGroup.position.y = Math.abs(w) * 0.01 * move;
    this.bodyGroup.rotation.set(move * 0.12, 0, w * 0.04 * move);
    this.head.rotation.set(s * 0.15 + w * 0.04 * move, clamp(this.turn * 0.12, -0.4, 0.4) + s * 0.25 + Math.sin(t * 0.5) * 0.2 * (1 - move) * (1 - s), Math.sin(t * 0.8) * 0.04);
    const tap = Math.sin(t * 14) * 0.12 * s;
    this.arms.forEach((arm, i) => {
      const k = i ? 1 : -1;
      arm.rotation.set(-s * 1.0 - w * k * 0.4 * move, -k * s * 0.35, k * (tap - s * 0.1));
    });
    this.tail.rotation.set(0, Math.sin(t * 2) * 0.3, 0);
  }
}

/** 4. A chatty grey donkey with ears a mile long and a big toothy grin: he trots, and bounces up and down begging to be picked now and then. */
class Donkey extends Pal {
  private head: THREE.Group;
  private jaw: THREE.Group;
  private ears: THREE.Group[] = [];
  private tail: THREE.Group;
  private pick = new Act(5, 10, 2.4);
  constructor() {
    const grey = '#8e8a93';
    const pale = '#d1cbd1';
    const dark = '#4b464f';
    const sc = new Sculpt();
    sc.add(ellipsoid('body', [0, 0.11, -0.01], [0.046, 0.045, 0.076], { name: 'body' }));
    sc.add(rod('body', [0, 0.12, 0.04], [0, 0.175, 0.07], 0.03, 0.022, { k: 0.02, name: 'neck' }));
    const b = new Builder();
    b.addColored(sculpted('donkey', () => ({ sc, marks: { base: grey, marks: [{ color: pale, f: (q) => q.p.y - 0.085 }] } }), 0.017));
    // A short dark mane down the back of the neck.
    for (let i = 0; i < 5; i++) b.add(sph(6, 5), dark, { pos: [0, 0.2 - i * 0.017, 0.055 - i * 0.013], scale: [0.006, 0.012, 0.008] });
    const hs = new Sculpt();
    hs.add(ellipsoid('body', [0, 0.2, 0.08], [0.036, 0.036, 0.038], { name: 'head' }));
    hs.add(ellipsoid('body', [0, 0.182, 0.125], [0.03, 0.026, 0.034], { k: 0.025, name: 'muzzle' }));
    const hb = new Builder();
    hb.addColored(sculpted('donkey-head', () => ({ sc: hs, marks: { base: grey, marks: [{ color: pale, f: regionOf(hs, 'muzzle') }] } }), 0.014));
    for (const s of [-1, 1]) hb.add(bead(), dark, { pos: [s * 0.012, 0.19, frontZ(hs, s * 0.012, 0.19) + 0.001], scale: [0.004, 0.006, 0.003] });
    // The grin: a dark mouth and a row of big square teeth.
    const mz = frontZ(hs, 0, 0.172);
    hb.add(sph(10, 6), '#4a1f26', { pos: [0, 0.172, mz - 0.006], scale: [0.024, 0.008, 0.008] });
    for (const x of [-0.006, 0.006]) hb.add(new THREE.BoxGeometry(1, 1, 1), '#fbf8ee', { pos: [x, 0.172, mz - 0.002], scale: [0.011, 0.012, 0.004] });
    const e = new Builder();
    addEyes(e, 0.212, frontZ(hs, 0.02, 0.212) - 0.004, 0.02, 0.011);
    super(b, e, 0.212);
    this.head = this.piece(hb, [0, 0.175, 0.06]);
    this.eyesOn(this.head);
    const jb = new Builder();
    jb.add(sph(10, 6), pale, { pos: [0, 0.162, 0.125], scale: [0.024, 0.01, 0.026] });
    this.jaw = this.piece(jb, [0, 0.168, 0.105], this.head);
    for (const s of [-1, 1]) {
      const eb = new Builder();
      eb.add(sph(10, 8), grey, { pos: [s * 0.026, 0.262, 0.07], rot: [0, 0, -s * 0.28], scale: [0.012, 0.045, 0.008] });
      eb.add(sph(8, 6), dark, { pos: [s * 0.037, 0.3, 0.07], rot: [0, 0, -s * 0.28], scale: [0.007, 0.012, 0.006] });
      eb.add(sph(8, 6), '#e7b3bd', { pos: [s * 0.026, 0.262, 0.077], rot: [0, 0, -s * 0.28], scale: [0.007, 0.034, 0.003] });
      this.ears.push(this.piece(eb, [s * 0.016, 0.228, 0.07], this.head));
    }
    this.addLegs(pawLeg('donkey-leg', 0.09, 0.013, grey, dark), 0.09, [[-0.028, 0.04], [0.028, 0.04], [-0.028, -0.06], [0.028, -0.06]]);
    const tb = new Builder();
    tube(tb, [[0, 0.13, -0.085], [0, 0.11, -0.1], [0, 0.08, -0.105]], 0.004, grey, 4);
    tb.add(sph(8, 6), dark, { pos: [0, 0.07, -0.105], scale: [0.008, 0.016, 0.008] });
    this.tail = this.piece(tb, [0, 0.13, -0.085]);
  }
  protected animate(dt: number, t: number, move: number) {
    // Pick me: hopping up and down on the spot, ears flapping and the mouth going nineteen to the dozen.
    const p = held(this.pick.step(dt, move < 0.2), 0.08);
    const w = this.walkLegs(dt, move, 12, 0.55);
    const hop = Math.abs(Math.sin(t * 12)) * p;
    this.bodyGroup.position.y = Math.abs(w) * 0.008 * move + hop * 0.045;
    this.legs.forEach((leg) => (leg.rotation.x += Math.sin(t * 12) * 0.2 * p));
    this.head.rotation.set(-p * 0.25 + Math.sin(t * 24) * 0.04 * p, clamp(this.turn * 0.12, -0.4, 0.4) + Math.sin(t * 0.6) * 0.2 * (1 - move) * (1 - p), 0);
    this.jaw.rotation.x = (Math.abs(Math.sin(t * 20)) * 0.45 * p + Math.max(0, Math.sin(t * 7)) * 0.1 * (1 - p));
    this.ears.forEach((ear, i) => {
      const s = i ? 1 : -1;
      ear.rotation.set(-0.2 * move, 0, s * (Math.sin(t * 12 + i) * 0.4 * p - 0.05 + Math.sin(this.stride) * 0.1 * move));
    });
    this.tail.rotation.set(0.2, 0, Math.sin(t * 6) * 0.4);
  }
}

/** 5. An orange tabby in a plumed hat and boots, up on his hind legs: he swaggers, and doffs his hat with big pleading eyes now and then. */
class BootCat extends Pal {
  private head: THREE.Group;
  private hat: THREE.Group;
  private plead: THREE.Group;
  private arms: THREE.Group[] = [];
  private tail: THREE.Group;
  private charm = new Act(5, 10, 2.8);
  constructor() {
    const ginger = '#e39a3c';
    const stripe = '#bd7124';
    const cream = '#f7e2bf';
    const leather = '#3a2a22';
    const sc = new Sculpt();
    sc.add(ellipsoid('body', [0, 0.1, 0], [0.034, 0.045, 0.03], { name: 'body' }));
    const b = new Builder();
    b.addColored(sculpted('bootcat', () => ({ sc, marks: { base: ginger, marks: [{ color: cream, f: patch([0, 0.1, 0.026], [0.02, 0.034, 0.02]) }] } }), 0.013));
    // A belt with a gold buckle.
    b.add(new THREE.CylinderGeometry(1, 1, 1, 14), '#5b3b26', { pos: [0, 0.082, 0], scale: [0.035, 0.008, 0.031] });
    b.add(new THREE.BoxGeometry(1, 1, 1), '#f2c230', { pos: [0, 0.082, 0.031], scale: [0.012, 0.01, 0.003] });
    const hs = new Sculpt();
    hs.add(ellipsoid('body', [0, 0.18, 0.006], [0.048, 0.042, 0.042], { name: 'head' }));
    hs.add(ellipsoid('body', [0, 0.166, 0.038], [0.02, 0.014, 0.014], { k: 0.015, name: 'muzzle' }));
    for (const s of [-1, 1]) hs.add(pyramid('body', [s * 0.03, 0.212, 0], 0.03, 0.03, 0.012, { rot: [0, 0, -s * 0.3], k: 0.006, round: 0.003, thin: true, name: 'ear' }));
    const hb = new Builder();
    hb.addColored(
      sculpted('bootcat-head', () => ({
        sc: hs,
        marks: { base: ginger, marks: [{ color: cream, f: regionOf(hs, 'muzzle') }, { color: stripe, f: (q) => (q.p.y > 0.198 && q.p.z > 0 ? Math.abs(Math.sin(q.p.x * 160)) - 0.3 : 1) }] },
      }), 0.012),
    );
    hb.add(gem(), '#e57f8d', { pos: [0, 0.172, frontZ(hs, 0, 0.172) + 0.001], scale: [0.006, 0.0045, 0.004] });
    tube(hb, onFront(hs, [[-0.01, 0.158], [0, 0.162], [0.01, 0.158]], 0.001), 0.0014, INK, 3);
    for (const s of [-1, 1]) for (const k of [-1, 1]) tube(hb, [[s * 0.016, 0.165 + k * 0.003, 0.05], [s * 0.044, 0.168 + k * 0.009, 0.05]], 0.0007, '#ffffff', 3);
    const e = new Builder();
    irisEyes(e, 0.186, frontZ(hs, 0.019, 0.186) - 0.004, 0.019, 0.011, '#7cbf3a');
    super(b, e, 0.186);
    this.head = this.piece(hb, [0, 0.14, 0]);
    this.eyesOn(this.head);
    // The pleading eyes: huge and shining, swelling over the usual ones.
    const pb = new Builder();
    irisEyes(pb, 0, 0, 0.019, 0.016, '#3f2a1c', 0.8);
    for (const s of [-1, 1]) pb.add(pip(), '#ffffff', { pos: [s * 0.019 - 0.005, -0.006, 0.012], scale: 0.0028 });
    this.plead = this.piece(pb, [0, 0, 0], this.head);
    this.plead.position.set(0, 0.186 - 0.14, frontZ(hs, 0.019, 0.186) - 0.002);
    this.plead.scale.setScalar(0.001);
    // The hat: a wide brim, a soft crown, and a long white plume curling back.
    const tb = new Builder();
    tb.add(new THREE.CylinderGeometry(1, 1, 1, 16), leather, { pos: [0, 0.222, 0], rot: [-0.15, 0, 0.12], scale: [0.068, 0.005, 0.06] });
    tb.add(sph(12, 8), leather, { pos: [0, 0.236, -0.004], rot: [-0.15, 0, 0.12], scale: [0.036, 0.024, 0.034] });
    tube(tb, [[0.02, 0.244, 0.01], [0.04, 0.27, -0.01], [0.05, 0.28, -0.04], [0.045, 0.265, -0.07]], 0.006, '#fbf8ee', 6);
    this.hat = this.piece(tb, [0, 0.222, 0], this.head);
    // Arms, and tall cuffed boots on the legs.
    for (const s of [-1, 1]) {
      const ab = new Builder();
      tube(ab, [[s * 0.03, 0.125, 0], [s * 0.042, 0.1, 0.006], [s * 0.04, 0.078, 0.012]], 0.0075, ginger, 4);
      ab.add(gem(), cream, { pos: [s * 0.04, 0.074, 0.013], scale: 0.009 });
      this.arms.push(this.piece(ab, [s * 0.03, 0.125, 0]));
    }
    const leg = sculpted('bootcat-leg', () => {
      const l = new Sculpt();
      l.add(rod('body', [0, 0.06, 0], [0, 0.012, 0.003], 0.012, 0.012, { name: 'leg' }));
      l.add(ellipsoid('body', [0, 0.01, 0.012], [0.013, 0.01, 0.022], { k: 0.006, name: 'boot' }));
      l.add(ellipsoid('body', [0, 0.05, 0.002], [0.017, 0.008, 0.016], { k: 0.004, name: 'boot' }));
      l.add(flatBase());
      return { sc: l, marks: { base: leather, marks: [{ color: ginger, f: (q) => 0.056 - q.p.y }] } };
    }, 0.01);
    this.addLegs(leg, 0.06, [[-0.016, 0], [0.016, 0]]);
    const tl = new Builder();
    tube(tl, [[0, 0.07, -0.026], [0, 0.06, -0.06], [0, 0.1, -0.075], [0.01, 0.14, -0.07]], 0.006, ginger, 5);
    this.tail = this.piece(tl, [0, 0.07, -0.026]);
  }
  protected animate(dt: number, t: number, move: number) {
    // The charm: hat swept off to the chest, head tilted, and those eyes.
    const c = this.charm.step(dt, move < 0.2);
    const h = held(c, 0.18);
    const w = this.walkLegs(dt, move, 14, 0.7);
    this.bodyGroup.position.y = Math.abs(w) * 0.01 * move;
    this.bodyGroup.rotation.set(-move * 0.05 + h * 0.05, 0, w * 0.06 * move);
    this.head.rotation.set(h * 0.12, clamp(this.turn * 0.12, -0.4, 0.4) + Math.sin(t * 0.5) * 0.2 * (1 - move) * (1 - h), h * 0.3);
    this.plead.scale.setScalar(Math.max(0.001, ease(c, 0.2, 0.35) * (1 - ease(c, 0.85, 0.95))));
    this.hat.position.set(-h * 0.05, 0.222 - 0.14 - h * 0.09, h * 0.06);
    this.hat.rotation.set(h * 1.3, 0, -h * 0.4);
    this.arms.forEach((arm, i) => {
      const s = i ? 1 : -1;
      arm.rotation.set(-w * s * 0.5 * move - (s < 0 ? h * 1.1 : 0), 0, s * (0.08 + (s < 0 ? h * 0.3 : 0)));
    });
    this.tail.rotation.set(0, Math.sin(t * 2.4) * 0.3, Math.sin(t * 1.7) * 0.2);
  }
}

/** 6. A greedy little green ghost, all mouth: he floats after you, and now and then opens wide and slurps. */
class Goober extends Critter {
  private mouth: THREE.Group;
  private tongue: THREE.Group;
  private arms: THREE.Group[] = [];
  private slurp = new Act(4, 9, 1.8);
  constructor() {
    const green = '#8bd93b';
    const sc = new Sculpt();
    sc.add(ellipsoid('body', [0, 0.17, 0], [0.068, 0.062, 0.058], { name: 'body' }));
    sc.add(rod('body', [0, 0.14, -0.01], [0.01, 0.06, -0.04], 0.04, 0.01, { k: 0.03, name: 'tail' }));
    const b = new Builder();
    b.addColored(sculpted('goober', () => ({ sc, marks: { base: green, marks: [{ color: '#a9ec61', f: patch([-0.025, 0.21, 0.03], [0.025, 0.018, 0.03]) }] } }), 0.016));
    // A few drips of slime.
    for (const [x, y] of [[-0.05, 0.13], [0.045, 0.125], [0.02, 0.112]]) b.add(sph(8, 6), '#7cc832', { pos: [x, y, frontZ(sc, x, y) - 0.012], scale: [0.007, 0.012, 0.007] });
    const e = new Builder();
    addEyes(e, 0.205, frontZ(sc, 0.024, 0.205) - 0.004, 0.024, 0.013);
    super(b, e, 0.205);
    const mz = frontZ(sc, 0, 0.16);
    const mb = new Builder();
    mb.add(sph(14, 8), '#5a1e2c', { pos: [0, 0.16, mz - 0.012], scale: [0.044, 0.022, 0.014] });
    for (const x of [-0.03, -0.012, 0.012, 0.03]) mb.add(new THREE.BoxGeometry(1, 1, 1), '#fbf8ee', { pos: [x, 0.176, mz - 0.006], scale: [0.012, 0.009, 0.004] });
    this.mouth = this.piece(mb, [0, 0.16, mz - 0.012]);
    const tg = new Builder();
    tg.add(gem(), '#ef7f95', { pos: [0, 0.152, mz + 0.002], rot: [0.4, 0, 0], scale: [0.018, 0.006, 0.02] });
    this.tongue = this.piece(tg, [0, 0.154, mz - 0.01]);
    for (const s of [-1, 1]) {
      const ab = new Builder();
      tube(ab, [[s * 0.06, 0.16, 0.01], [s * 0.085, 0.15, 0.025], [s * 0.088, 0.135, 0.04]], 0.009, green, 5);
      ab.add(sph(8, 6), green, { pos: [s * 0.088, 0.132, 0.042], scale: 0.012 });
      this.arms.push(this.piece(ab, [s * 0.06, 0.16, 0.01]));
    }
  }
  protected animate(dt: number, t: number, move: number) {
    // Floats along tail-first in the breeze; the slurp is a big gape, a lick round, and a gulp that shakes him.
    const s = this.slurp.step(dt, move < 0.3);
    const gape = s < 0 ? 0 : ease(s, 0, 0.15) * (1 - ease(s, 0.7, 0.8));
    const lick = s < 0 ? 0 : ease(s, 0.25, 0.35) * (1 - ease(s, 0.6, 0.7));
    const gulp = s < 0 ? 0 : bell(clamp((s - 0.8) / 0.2, 0, 1));
    this.bodyGroup.position.y = 0.06 + Math.sin(t * 2.2) * 0.012;
    this.bodyGroup.rotation.set(move * 0.3, Math.sin(t * 0.7) * 0.2 * (1 - move), Math.sin(t * 1.6) * 0.06);
    this.bodyGroup.scale.set(1 + gulp * 0.12, 1 - gulp * 0.08, 1 + gulp * 0.12);
    this.mouth.scale.set(1 + gape * 0.15, 1 + gape * 1.6 + Math.sin(t * 3) * 0.08, 1);
    this.tongue.position.y = 0.154 - gape * 0.012;
    this.tongue.rotation.set(-lick * 0.5, 0, Math.sin(t * 9) * 0.6 * lick);
    this.tongue.scale.setScalar(0.5 + lick * 0.9);
    this.arms.forEach((arm, i) => {
      const k = i ? 1 : -1;
      arm.rotation.set(Math.sin(t * 3 + i) * 0.3 - move * 0.6, 0, k * (Math.sin(t * 2.5 + i * 2) * 0.25 + gape * 0.6));
    });
  }
}

/** 7. A little yellow baby shark: it swims along through the air, and goes chomp-chomp to its own song now and then. */
class BabyShark extends Critter {
  private jaw: THREE.Group;
  private tail: THREE.Group;
  private fins: THREE.Group[] = [];
  private song = new Act(4, 9, 3);
  constructor() {
    const yellow = '#f6cf3c';
    const belly = '#fff6dc';
    const sc = new Sculpt();
    sc.add(ellipsoid('body', [0, 0.14, 0.005], [0.046, 0.044, 0.07], { name: 'body' }));
    sc.add(rod('body', [0, 0.14, -0.03], [0, 0.145, -0.1], 0.03, 0.011, { k: 0.02, name: 'body' }));
    sc.add(pyramid('body', [0, 0.172, -0.01], 0.034, 0.042, 0.007, { rot: [-0.45, 0, 0], k: 0.008, round: 0.003, thin: true, name: 'fin' }));
    const b = new Builder();
    b.addColored(sculpted('babyshark', () => ({ sc, marks: { base: yellow, marks: [{ color: belly, f: (q) => q.p.y - 0.125 + q.p.z * 0.1 }] } }), 0.014));
    // Gill stripes, a happy blush.
    for (const s of [-1, 1]) for (let i = 0; i < 2; i++) tube(b, [[s * 0.043, 0.15, -0.012 - i * 0.012], [s * 0.045, 0.135, -0.014 - i * 0.012]], 0.0012, '#c99c1c', 3);
    const e = new Builder();
    for (const s of [-1, 1]) {
      const at = onSurface(sc, s * 0.026, 0.155, 0.001);
      e.add(gem(), INK, { scale: [0.011, 0.013, 0.006] }, at);
      e.add(pip(), '#ffffff', { pos: [0.003, 0.004, 0.005], scale: 0.0035 }, at);
    }
    e.add(sph(8, 6), BLUSH, { pos: [0.036, 0.137, frontZ(sc, 0.036, 0.137) - 0.002], scale: [0.008, 0.005, 0.004] });
    e.add(sph(8, 6), BLUSH, { pos: [-0.036, 0.137, frontZ(sc, -0.036, 0.137) - 0.002], scale: [0.008, 0.005, 0.004] });
    super(b, e, 0.155, wet());
    const jz = frontZ(sc, 0, 0.122);
    const jb = new Builder();
    jb.add(sph(12, 6), '#e2556b', { pos: [0, 0.122, jz - 0.012], scale: [0.026, 0.006, 0.014] });
    for (const x of [-0.016, -0.005, 0.005, 0.016]) cone(jb, [x, 0.125, jz - 0.006], [0, 1, 0.2], 0.007, 0.003, '#ffffff', 3);
    this.jaw = this.piece(jb, [0, 0.126, jz - 0.03]);
    const tb = new Builder();
    tb.add(cutout([[0, 0], [-0.018, 0.04], [-0.01, 0.042], [0.012, 0.004], [-0.004, -0.03], [-0.014, -0.03]], 0.006), yellow, { pos: [0, 0.146, -0.1], rot: [0, Math.PI / 2, 0] });
    this.tail = this.piece(tb, [0, 0.145, -0.095]);
    for (const s of [-1, 1]) {
      const fb = new Builder();
      fb.add(sph(10, 6), yellow, { pos: [s * 0.055, 0.118, 0.005], rot: [0.5, 0, s * 0.6], scale: [0.006, 0.022, 0.012] });
      this.fins.push(this.piece(fb, [s * 0.04, 0.125, 0.005]));
    }
  }
  protected animate(dt: number, t: number, move: number) {
    // Doo doo, doo-doo doo-doo: chomps in time and a little hop on each.
    const s = this.song.step(dt, move < 0.3);
    const on = held(s, 0.06);
    const beat = Math.max(0, Math.sin(t * 15)) * on;
    const sway = Math.sin(t * (3 + move * 6));
    this.bodyGroup.position.y = 0.05 + Math.sin(t * 2) * 0.01 + beat * 0.025;
    this.bodyGroup.rotation.set(move * 0.1 - beat * 0.15, sway * 0.12, Math.sin(t * 1.3) * 0.05);
    this.jaw.rotation.x = 0.1 + beat * 0.5 + Math.max(0, Math.sin(t * 1.1)) * 0.1 * (1 - on);
    this.tail.rotation.y = -sway * 0.6;
    this.fins.forEach((fin, i) => (fin.rotation.x = Math.sin(t * 5 + i * Math.PI) * 0.4));
  }
}

/** 8. A striped sock puppet with button eyes: it inches along like a worm, and has a good natter now and then. */
class Sock extends Critter {
  private top: THREE.Group;
  private natter = new Act(3, 8, 2.4);
  constructor() {
    const red = '#d6403a';
    const cream = '#f6efe1';
    const stripes: Field = (q) => Math.sin(q.p.y * 120) - 0.1;
    const sc = new Sculpt();
    sc.add(rod('body', [0, 0.015, -0.01], [0, 0.14, 0.004], 0.032, 0.034, { name: 'leg' }));
    sc.add(ellipsoid('body', [0, 0.025, -0.022], [0.034, 0.028, 0.034], { k: 0.02, name: 'heel' }));
    sc.add(ellipsoid('body', [0, 0.152, 0.032], [0.038, 0.016, 0.05], { k: 0.03, name: 'jaw' }));
    sc.add(flatBase());
    const b = new Builder();
    b.addColored(
      sculpted('sock', () => ({
        sc,
        marks: { base: cream, marks: [{ color: '#b52b33', f: both(regionOf(sc, 'jaw'), (q) => 0.158 - q.p.y) }, { color: red, f: either(stripes, regionOf(sc, 'heel')) }] },
      }), 0.013),
    );
    const ts = new Sculpt();
    ts.add(ellipsoid('body', [0, 0.17, 0.03], [0.04, 0.026, 0.052], { name: 'top' }));
    ts.add(box('body', [0, 0.17 - 0.3, 0.03], [0.6, 0.3, 0.6], { carve: true, round: 0.003 }));
    const tb = new Builder();
    tb.addColored(sculpted('sock-top', () => ({ sc: ts, marks: { base: cream, marks: [{ color: red, f: (q) => Math.sin(q.p.z * 120) - 0.1 }, { color: '#b52b33', f: (q) => q.p.y - 0.173 }] } }), 0.012));
    // Button eyes, sewn on with a cross of thread.
    const e = new Builder();
    for (const s of [-1, 1]) {
      const at: Vec3 = [s * 0.019, 0.183, frontZ(ts, s * 0.019, 0.183) - 0.002];
      e.add(new THREE.CylinderGeometry(1, 1, 1, 12), '#2d63b8', { pos: at, rot: [1.0, 0, 0], scale: [0.011, 0.004, 0.011] });
      for (const r of [0.8, -0.8]) e.add(new THREE.BoxGeometry(1, 1, 1), cream, { pos: [at[0], at[1] + 0.0012, at[2] + 0.002], rot: [1.0, 0, r], scale: [0.012, 0.0012, 0.0015] });
    }
    super(b, e, 0.183);
    this.top = this.piece(tb, [0, 0.168, -0.012]);
    this.eyesOn(this.top);
    const tg = new Builder();
    tg.add(gem(), '#ef7f95', { pos: [0, 0.16, 0.05], scale: [0.016, 0.004, 0.018] });
    this.piece(tg, [0, 0.16, 0.05]);
  }
  protected animate(dt: number, t: number, move: number) {
    // Inching: squashes down and stretches up and forward; the natter is the mouth going flat out, nodding along.
    const n = held(this.natter.step(dt, move < 0.2), 0.08);
    const inch = Math.sin(t * 10) * move;
    this.bodyGroup.scale.set(1 - inch * 0.06, 1 + inch * 0.1, 1 + inch * 0.04);
    this.bodyGroup.rotation.set(Math.max(0, inch) * 0.15, Math.sin(t * 0.6) * 0.2 * (1 - move), Math.sin(t * 1.4) * 0.05 + Math.sin(t * 7) * 0.06 * n);
    this.top.rotation.set(-(Math.abs(Math.sin(t * 17)) * 0.6 * n + (0.14 + Math.max(0, Math.sin(t * 1.3)) * 0.1) * (1 - n) + Math.max(0, inch) * 0.2), 0, 0);
  }
}

/** 9. A rubber chicken, plucked and floppy: it flops along on its long legs, and lets out a great squawk now and then. */
class RubberChicken extends Pal {
  private neck: THREE.Group;
  private beak: THREE.Group;
  private wings: THREE.Group[] = [];
  private squawk = new Act(4, 9, 1.4);
  constructor() {
    const skin = '#f4e36b';
    const orange = '#f08a24';
    const sc = new Sculpt();
    sc.add(ellipsoid('body', [0, 0.1, -0.01], [0.034, 0.03, 0.055], { rot: [0.3, 0, 0], name: 'body' }));
    const b = new Builder();
    b.addColored(sculpted('rubberchicken', () => ({ sc, marks: { base: skin, marks: [{ color: '#e5cf4b', f: spots(4, 12, [0, 0.1, -0.01], [0.034, 0.03, 0.055], [0.004, 0.004, 0.004]) }] } }), 0.012));
    const nb = new Builder();
    tube(nb, [[0, 0.11, 0.035], [0, 0.15, 0.045], [0, 0.185, 0.05], [0, 0.205, 0.05]], 0.009, skin, 6);
    nb.add(sph(12, 8), skin, { pos: [0, 0.215, 0.055], scale: [0.017, 0.016, 0.02] });
    for (const [z, y] of [[0.05, 0.234], [0.06, 0.236], [0.07, 0.23]]) nb.add(sph(8, 6), '#e0332c', { pos: [0, y, z], scale: 0.007 });
    nb.add(sph(8, 6), '#e0332c', { pos: [0, 0.198, 0.07], scale: [0.004, 0.01, 0.005] });
    cone(nb, [0, 0.218, 0.07], [0, 0.2, 1], 0.03, 0.0075, orange, 5);
    const e = new Builder();
    for (const s of [-1, 1]) {
      e.add(gem(), '#ffffff', { pos: [s * 0.012, 0.222, 0.064], scale: [0.006, 0.0075, 0.005] });
      e.add(bead(), INK, { pos: [s * 0.013, 0.222, 0.068], scale: 0.0028 });
    }
    super(b, e, 0.222);
    this.neck = this.piece(nb, [0, 0.11, 0.035]);
    this.eyesOn(this.neck);
    const bb = new Builder();
    cone(bb, [0, 0.21, 0.068], [0, -0.5, 1], 0.025, 0.006, '#d9721a', 5);
    this.beak = this.piece(bb, [0, 0.212, 0.066], this.neck);
    for (const s of [-1, 1]) {
      const wb = new Builder();
      wb.add(sph(10, 6), skin, { pos: [s * 0.036, 0.1, -0.015], rot: [0.2, 0, s * 0.3], scale: [0.007, 0.02, 0.03] });
      this.wings.push(this.piece(wb, [s * 0.03, 0.112, -0.01]));
    }
    for (const s of [-1, 1]) {
      const lb = new Builder();
      tube(lb, [[s * 0.016, 0.08, -0.005], [s * 0.017, 0.04, 0], [s * 0.018, 0.006, 0.002]], 0.0035, orange, 4);
      for (const a of [-0.5, 0, 0.5]) cone(lb, [s * 0.018, 0.003, 0.002], [Math.sin(a), 0, Math.cos(a)], 0.02, 0.003, orange, 3);
      this.legs.push(this.piece(lb, [s * 0.016, 0.08, -0.005]));
    }
  }
  protected animate(dt: number, t: number, move: number) {
    // Floppy: the neck flops side to side as it goes. The squawk throws the head back, beak wide, body shaking.
    const s = this.squawk.step(dt, move < 0.2);
    const sq = s < 0 ? 0 : ease(s, 0, 0.12) * (1 - ease(s, 0.75, 1));
    const w = this.walkLegs(dt, move, 12, 0.7);
    this.bodyGroup.position.y = Math.abs(w) * 0.012 * move;
    this.bodyGroup.rotation.set(move * 0.1, 0, w * 0.1 * move);
    this.bodyGroup.scale.set(1 + sq * 0.08 + Math.sin(t * 40) * 0.02 * sq, 1 - sq * 0.08, 1);
    this.neck.rotation.set(-sq * 0.7 + Math.sin(t * 1.3) * 0.1 * (1 - sq), clamp(this.turn * 0.1, -0.3, 0.3), Math.sin(this.stride + 0.8) * 0.35 * move + Math.sin(t * 1.1) * 0.12 * (1 - move));
    this.beak.rotation.x = sq * 0.7;
    this.wings.forEach((wing, i) => (wing.rotation.z = (i ? 1 : -1) * (sq * (0.6 + Math.sin(t * 30) * 0.3) + Math.abs(w) * 0.2 * move)));
  }
}

/** 10. A pet rock, with googly eyes: it shuffles along in little scoots, and its eyes roll about at the slightest thing. */
class PetRock extends Critter {
  private pupils: THREE.Group[] = [];
  private homes: THREE.Vector3[] = [];
  private roll = new Act(3, 7, 1.6);
  private jig = new THREE.Vector2();
  private jigV = new THREE.Vector2();
  private lastY = 0;
  constructor() {
    const stone = '#8f8a84';
    const sc = new Sculpt();
    sc.add(ellipsoid('body', [0, 0.042, 0], [0.068, 0.045, 0.055], { name: 'rock' }));
    sc.add(ellipsoid('body', [0.018, 0.058, -0.012], [0.045, 0.036, 0.04], { k: 0.02, name: 'rock' }));
    sc.add(ellipsoid('body', [-0.03, 0.038, 0.012], [0.035, 0.03, 0.04], { k: 0.02, name: 'rock' }));
    sc.add(flatBase());
    const b = new Builder();
    b.addColored(
      sculpted('petrock', () => ({
        sc,
        marks: { base: stone, marks: [{ color: '#77726d', f: spots(9, 10, [0, 0.045, 0], [0.068, 0.05, 0.055], [0.008, 0.006, 0.008]) }, { color: '#a7a29b', f: patch([-0.02, 0.08, 0.02], [0.03, 0.012, 0.03]) }] },
      }), 0.012),
    );
    // The googly eyes' whites, glued on.
    const at = [-0.02, 0.022].map((x) => onSurface(sc, x, 0.06, 0.001));
    at.forEach((m, i) => b.add(new THREE.CylinderGeometry(1, 1, 1, 14), '#fbfbf8', { rot: [Math.PI / 2, 0, 0], scale: [i ? 0.016 : 0.014, 0.004, i ? 0.016 : 0.014] }, m));
    tube(b, onFront(sc, [[-0.012, 0.035], [0, 0.03], [0.012, 0.035]], 0.001), 0.0014, '#3c3632', 3);
    // (A pet must have eyes: googly ones don't blink, so a tiny bead hidden in the rock.)
    const e = new Builder();
    e.add(bead(), stone, { pos: [0, 0.04, 0], scale: 0.004 });
    super(b, e, 0.04);
    at.forEach((m, i) => {
      const home = new THREE.Vector3().setFromMatrixPosition(m).add(new THREE.Vector3(0, 0, 1).transformDirection(m).multiplyScalar(0.004));
      const pb = new Builder();
      pb.add(new THREE.CylinderGeometry(1, 1, 1, 10), INK, { pos: [home.x, home.y, home.z], rot: [Math.PI / 2, 0, 0], scale: [i ? 0.008 : 0.007, 0.002, i ? 0.008 : 0.007] });
      this.pupils.push(this.piece(pb, [home.x, home.y, home.z]));
      this.homes.push(home);
    });
  }
  protected animate(dt: number, t: number, move: number) {
    // Scoots: a little lurch forward, a settle. The pupils swing about on every bump, and roll round by themselves now and then.
    const r = this.roll.step(dt, move < 0.2);
    const scoot = Math.max(0, Math.sin(t * 8)) * move;
    const y = scoot * 0.008;
    this.bodyGroup.position.y = y;
    this.bodyGroup.rotation.set(-scoot * 0.15, Math.sin(t * 0.4) * 0.1 * (1 - move), Math.sin(t * 8) * 0.04 * move);
    // A spring for the pupils: bumps kick them, gravity pulls them down.
    const kick = (y - this.lastY) / Math.max(dt, 1e-3);
    this.lastY = y;
    this.jigV.y += (-this.jig.y * 120 - 2 - kick * 1.5) * dt;
    this.jigV.x += (-this.jig.x * 120 + Math.sin(t * 8) * 6 * move) * dt;
    this.jigV.multiplyScalar(Math.max(0, 1 - dt * 3));
    this.jig.addScaledVector(this.jigV, dt);
    this.jig.clampLength(0, 1);
    this.pupils.forEach((p, i) => {
      const h = this.homes[i];
      const a = t * 9 + i;
      const rx = r < 0 ? 0 : Math.cos(a) * bell(r);
      const ry = r < 0 ? 0 : Math.sin(a) * bell(r);
      const room = i ? 0.0075 : 0.0065;
      p.position.set(h.x + clamp(this.jig.x + rx, -1, 1) * room, h.y + clamp(this.jig.y * 0.6 - 0.25 + ry, -1, 1) * room, h.z);
    });
  }
}

/** 11. The ghost of a goldfish, halo and all: it floats about where it likes, and does a loop-the-loop now and then. */
class FishGhost extends Critter {
  private tail: THREE.Group;
  private halo: THREE.Group;
  private loop = new Act(5, 10, 1.4);
  constructor() {
    const gold = '#f7a246';
    const sc = new Sculpt();
    sc.add(ellipsoid('body', [0, 0, 0], [0.032, 0.038, 0.052], { name: 'body' }));
    sc.add(rod('body', [0, 0, -0.03], [0, 0, -0.06], 0.02, 0.008, { k: 0.015, name: 'body' }));
    const b = new Builder();
    b.addColored(sculpted('fishghost', () => ({ sc, marks: { base: gold, marks: [{ color: '#ffe0b0', f: (q) => q.p.y + 0.018 }] } }), 0.011));
    for (const s of [-1, 1]) b.add(sph(10, 6), '#ffc27a', { pos: [s * 0.033, -0.012, 0.012], rot: [0.6, 0, s * 0.7], scale: [0.004, 0.014, 0.01] });
    b.add(cutout([[0, 0], [0.01, 0.026], [-0.03, 0.012], [-0.04, 0]], 0.003), '#ffc27a', { pos: [0, 0.03, 0.015], rot: [0, Math.PI / 2, 0] });
    // Crosses for eyes: it has, after all, passed on.
    const e = new Builder();
    for (const s of [-1, 1]) {
      const at = onSurface(sc, s * 0.02, 0.008, 0.001);
      for (const r of [0.8, -0.8]) e.add(new THREE.BoxGeometry(1, 1, 1), INK, { rot: [0, 0, r], scale: [0.014, 0.003, 0.003] }, at);
    }
    arc(e, [0, -0.008, frontZ(sc, 0, -0.008)], 0.005, INK, true, Math.PI * 0.9);
    const body = see('#ffb35c', 0.72, 0.35);
    super(b, e, 0.008, body);
    const tb = new Builder();
    tb.add(cutout([[0, 0], [-0.03, 0.032], [-0.042, 0.018], [-0.028, 0], [-0.042, -0.018], [-0.03, -0.032]], 0.003, 6), '#ffc27a', { pos: [0, 0, -0.058], rot: [0, Math.PI / 2, 0] });
    this.tail = this.piece(tb, [0, 0, -0.058], this.bodyGroup, body);
    const hb = new Builder();
    hb.add(new THREE.TorusGeometry(1, 0.12, 6, 20), '#fff4b0', { rot: [Math.PI / 2, 0, 0], scale: 0.024 });
    this.halo = this.piece(hb, [0, 0, 0], this.bodyGroup, glow('#ffe98a', 1.3));
    this.halo.position.set(0, 0.058, 0);
    this.halo.children[0].castShadow = false;
  }
  protected animate(dt: number, t: number, move: number) {
    const l = this.loop.step(dt, move < 0.3);
    const spin = l < 0 ? 0 : ease(l, 0.1, 0.9) * Math.PI * 2;
    this.bodyGroup.scale.setScalar(1.5);
    this.bodyGroup.position.set(Math.sin(t * 0.9) * 0.03 * (1 - move), 0.34 + Math.sin(t * 1.8) * 0.02 + bell(l) * 0.05, Math.cos(t * 0.7) * 0.02 * (1 - move));
    this.bodyGroup.rotation.set(-spin + move * 0.1, Math.sin(t * 1.1) * 0.25 * (1 - move), Math.sin(t * 1.5) * 0.1);
    this.tail.rotation.y = Math.sin(t * (5 + move * 6)) * 0.45;
    this.halo.position.y = 0.058 + Math.sin(t * 2.4) * 0.004;
    this.halo.rotation.set(0.15, t, 0);
  }
}

/** 12. A tiny flying saucer with a little green pilot: it hovers along, and now and then beams up a very small cow. */
class Ufo extends Critter {
  private lights: THREE.Group;
  private beam: THREE.Group;
  private cow: THREE.Group;
  private beamMat: THREE.MeshStandardMaterial;
  private abduct = new Act(6, 12, 4);
  private static readonly Y = 0.32;
  constructor() {
    const silver = '#c9ced6';
    const sc = new Sculpt();
    sc.add(ellipsoid('body', [0, 0, 0], [0.085, 0.02, 0.085], { name: 'disc' }));
    sc.add(ellipsoid('body', [0, -0.012, 0], [0.042, 0.02, 0.042], { k: 0.02, name: 'belly' }));
    const b = new Builder();
    b.addColored(sculpted('ufo', () => ({ sc, marks: { base: silver, marks: [{ color: '#8f97a3', f: regionOf(sc, 'belly') }, { color: '#e6e9ee', f: (q) => 0.012 - q.p.y }] } }), 0.012));
    // The pilot: a green head with big black almond eyes.
    b.add(sph(10, 8), '#7ad05a', { pos: [0, 0.03, 0], scale: [0.016, 0.018, 0.015] });
    b.add(sph(12, 10), '#8ee26a', { pos: [0, 0.052, 0], scale: [0.02, 0.019, 0.018] });
    for (const s of [-1, 1]) tube(b, [[s * 0.01, 0.068, 0], [s * 0.014, 0.08, 0], [s * 0.016, 0.085, 0]], 0.0015, '#7ad05a', 3);
    for (const s of [-1, 1]) b.add(sph(6, 5), '#f2f06a', { pos: [s * 0.016, 0.086, 0], scale: 0.003 });
    const e = new Builder();
    for (const s of [-1, 1]) e.add(gem(), '#141418', { pos: [s * 0.009, 0.053, 0.016], rot: [0, s * 0.3, s * 0.5], scale: [0.006, 0.009, 0.004] });
    super(b, e, 0.053);
    const db = new Builder();
    db.add(sph(16, 10), '#cfeeff', { pos: [0, 0.012, 0], scale: [0.038, 0.05, 0.038] });
    const dome = this.piece(db, [0, 0, 0], this.bodyGroup, see('#cfeeff', 0.3));
    dome.children[0].castShadow = false;
    const lb = new Builder();
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      lb.add(pip(), '#ffffff', { pos: [Math.sin(a) * 0.078, 0.002, Math.cos(a) * 0.078], scale: 0.0065 });
    }
    this.lights = this.piece(lb, [0, 0, 0], this.bodyGroup, glow('#ffd34d', 1.6));
    // The beam: a pale cone down to the ground, and the cow it brings up.
    const bb = new Builder();
    bb.add(new THREE.CylinderGeometry(0.03, 0.075, 1, 16, 1, true), '#c8ffcf', { pos: [0, -0.5, 0] });
    this.beamMat = see('#b8ffbf', 0, 1);
    this.beamMat.side = THREE.DoubleSide;
    this.beam = this.piece(bb, [0, 0, 0], this.bodyGroup, this.beamMat);
    this.beam.children[0].castShadow = false;
    const cb = new Builder();
    cb.add(sph(10, 8), '#ffffff', { pos: [0, 0.012, 0], scale: [0.012, 0.01, 0.017] });
    cb.add(sph(6, 5), INK, { pos: [0.007, 0.016, -0.004], scale: [0.006, 0.005, 0.007] });
    cb.add(sph(8, 6), '#ffffff', { pos: [0, 0.018, 0.017], scale: [0.007, 0.007, 0.008] });
    cb.add(sph(6, 5), '#f4a9b5', { pos: [0, 0.015, 0.024], scale: [0.005, 0.004, 0.003] });
    for (const [x, z] of [[-0.006, 0.008], [0.006, 0.008], [-0.006, -0.008], [0.006, -0.008]]) cb.add(new THREE.CylinderGeometry(1, 1, 1, 5), '#ffffff', { pos: [x, 0.002, z], scale: [0.002, 0.01, 0.002] });
    this.cow = this.piece(cb, [0, 0, 0]);
    this.cow.visible = false;
  }
  protected animate(dt: number, t: number, move: number) {
    // Up the beam goes the cow, turning slowly, has a look round inside, and comes gently back down.
    const a = this.abduct.step(dt, move < 0.2);
    const on = held(a, 0.08);
    const y = Ufo.Y + Math.sin(t * 2) * 0.012;
    this.bodyGroup.position.y = y * (1 - on * 0.15);
    this.bodyGroup.rotation.set(move * 0.25, 0, Math.sin(t * 1.4) * 0.06 * (1 - on));
    this.lights.rotation.y = t * (2 + on * 6);
    this.beamMat.opacity = on * (0.28 + Math.sin(t * 20) * 0.04);
    this.beam.visible = on > 0.01;
    this.beam.scale.set(1, y * (1 - on * 0.15), 1);
    const up = a < 0 ? 0 : ease(a, 0.1, 0.45) * (1 - ease(a, 0.55, 0.9));
    this.cow.visible = a >= 0 && a < 0.95;
    // (In the saucer's own frame, so it hangs straight below it.)
    this.cow.position.set(0, -(1 - up) * this.bodyGroup.position.y + up * -0.02, 0);
    this.cow.rotation.set(-this.bodyGroup.rotation.x, a < 0 ? 0 : a * 9, 0);
    this.cow.scale.setScalar(1 - up * 0.4);
  }
}

/** 13. A chrome toaster with feathered wings: it flies along flapping, and pops its toast now and then. */
class Toaster extends Critter {
  private wings: THREE.Group[] = [];
  private toast: THREE.Group[] = [];
  private pop = new Act(4, 9, 1.3);
  constructor() {
    const chrome = '#cfd4da';
    const sc = new Sculpt();
    sc.add(box('body', [0, 0, 0], [0.058, 0.045, 0.034], { round: 0.016, name: 'toaster' }));
    const b = new Builder();
    b.addColored(sculpted('toaster', () => ({ sc, marks: { base: chrome, marks: [{ color: '#eef1f4', f: patch([-0.03, 0.025, 0.03], [0.02, 0.015, 0.01]) }, { color: '#7d848d', f: (q) => q.p.y + 0.04 }] } }), 0.011));
    for (const x of [-0.022, 0.022]) b.add(new THREE.BoxGeometry(1, 1, 1), '#2c2f35', { pos: [x, 0.045, 0], scale: [0.026, 0.002, 0.048] });
    b.add(new THREE.BoxGeometry(1, 1, 1), '#2c2f35', { pos: [0.059, 0.005, 0.012], scale: [0.004, 0.024, 0.006] });
    b.add(new THREE.BoxGeometry(1, 1, 1), '#1d1f23', { pos: [0.062, 0.02, 0.012], scale: [0.008, 0.006, 0.012] });
    const e = new Builder();
    addEyes(e, 0.01, frontZ(sc, 0.02, 0.01) - 0.004, 0.02, 0.01);
    arc(e, [0, -0.012, frontZ(sc, 0, -0.012)], 0.008, INK, false, Math.PI * 0.8);
    super(b, e, 0.01, wet());
    for (const x of [-0.022, 0.022]) {
      const tb = new Builder();
      tb.add(new THREE.BoxGeometry(1, 1, 1), '#e2b16a', { pos: [x, 0.036, 0], scale: [0.012, 0.05, 0.042] });
      tb.add(new THREE.BoxGeometry(1, 1, 1), '#a8692e', { pos: [x, 0.036, 0], scale: [0.0125, 0.052, 0.044] });
      this.toast.push(this.piece(tb, [x, 0.03, 0]));
    }
    // Feathered wings, a few long white feathers each.
    for (const s of [-1, 1]) {
      const wb = new Builder();
      for (let i = 0; i < 4; i++) {
        const len = 0.06 - i * 0.008;
        wb.add(sph(8, 5), i % 2 ? '#f2f2f6' : '#ffffff', { pos: [s * (0.06 + len / 2), 0.018 - i * 0.008, -0.005 - i * 0.006], rot: [0, 0, s * (0.3 - i * 0.15)], scale: [len / 2, 0.006, 0.012] });
      }
      this.wings.push(this.piece(wb, [s * 0.06, 0.018, -0.005]));
    }
  }
  protected animate(dt: number, t: number, move: number) {
    // Toast up with a ping, a little kick back, and down again.
    const p = this.pop.step(dt, move < 0.3);
    const up = p < 0 ? 0 : Math.sin(clamp(p / 0.7, 0, 1) * Math.PI);
    const flap = Math.sin(t * (9 + move * 5));
    this.bodyGroup.position.y = 0.3 + flap * 0.012 - up * 0.01;
    this.bodyGroup.rotation.set(move * 0.2 + up * 0.15, Math.sin(t * 0.6) * 0.15 * (1 - move), Math.sin(t * 1.3) * 0.05);
    this.wings.forEach((w, i) => (w.rotation.z = (i ? 1 : -1) * (flap * 0.6 + 0.1)));
    this.toast.forEach((tst, i) => {
      tst.position.y = 0.03 + up * (0.06 + i * 0.015);
      tst.rotation.z = up * (i ? -0.5 : 0.4);
    });
  }
}

/** 14. A fluffy chatterbox owl-thing with tall ears: it waddles about, and rocks and chatters away now and then. */
class Furbo extends Critter {
  private ears: THREE.Group[] = [];
  private beak: THREE.Group;
  private feet: THREE.Group[] = [];
  private chat = new Act(3, 8, 2.6);
  constructor() {
    const fur = '#a77bd1';
    const pale = '#f1e1f6';
    const sc = new Sculpt();
    sc.add(ellipsoid('body', [0, 0.085, 0], [0.058, 0.07, 0.054], { name: 'body' }));
    sc.add(flatBase(0.012));
    const b = new Builder();
    b.addColored(
      sculpted('furbo', () => ({
        sc,
        marks: {
          base: fur,
          marks: [
            { color: pale, f: patch([0, 0.06, 0.04], [0.036, 0.04, 0.03]) },
            { color: '#f6d5f0', f: patch([0, 0.112, 0.045], [0.036, 0.022, 0.02]) },
            { color: '#8c62b8', f: spots(12, 22, [0, 0.085, 0], [0.058, 0.07, 0.054], [0.007, 0.01, 0.007], (d) => d.z < 0.5) },
          ],
        },
      }), 0.013),
    );
    // A tuft on top.
    for (const a of [-0.4, 0, 0.4]) cone(b, [0, 0.15, 0], [Math.sin(a), 1, -0.2], 0.025, 0.006, fur, 4);
    const e = new Builder();
    irisEyes(e, 0.112, frontZ(sc, 0.022, 0.112) - 0.004, 0.022, 0.016, '#3a8fd8');
    super(b, e, 0.112);
    const kb = new Builder();
    cone(kb, [0, 0.088, frontZ(sc, 0, 0.088) - 0.004], [0, -0.3, 1], 0.014, 0.008, '#f1a43a', 4);
    this.beak = this.piece(kb, [0, 0.088, frontZ(sc, 0, 0.088) - 0.006]);
    for (const s of [-1, 1]) {
      const eb = new Builder();
      eb.add(spike(4), fur, { pos: [s * 0.042, 0.172, -0.005], rot: [0, 0, -s * 0.25], scale: [0.018, 0.07, 0.008] });
      eb.add(spike(4), '#f6b4cf', { pos: [s * 0.042, 0.165, -0.0005], rot: [0, 0, -s * 0.25], scale: [0.01, 0.045, 0.004] });
      this.ears.push(this.piece(eb, [s * 0.036, 0.14, -0.005]));
      const fb = new Builder();
      fb.add(sph(8, 6), '#f1a43a', { pos: [s * 0.024, 0.006, 0.03], scale: [0.016, 0.007, 0.02] });
      this.feet.push(this.piece(fb, [s * 0.024, 0.006, 0.01]));
    }
  }
  protected animate(dt: number, t: number, move: number) {
    // The chatter: rocking back and forth, beak going, ears waggling every which way.
    const c = held(this.chat.step(dt, move < 0.2), 0.1);
    const w = Math.sin(t * 12);
    this.bodyGroup.position.y = Math.abs(w) * 0.008 * move;
    this.bodyGroup.rotation.set(Math.sin(t * 5) * 0.18 * c + move * 0.05, Math.sin(t * 0.6) * 0.25 * (1 - move) * (1 - c), w * 0.12 * move);
    this.beak.rotation.x = Math.abs(Math.sin(t * 16)) * 0.6 * c;
    this.ears.forEach((ear, i) => {
      const s = i ? 1 : -1;
      ear.rotation.set(Math.sin(t * 7 + i) * 0.4 * c, 0, s * (Math.sin(t * 9 + i * 2) * 0.35 * c + Math.sin(t * 1.4) * 0.06 - 0.1 * move));
    });
    this.feet.forEach((f, i) => (f.rotation.x = w * (i ? 1 : -1) * 0.5 * move));
  }
}

/** 15. A flower in a pot that never stops grooving: it hops its pot along, and really gets down now and then. */
class PotDancer extends Critter {
  private stem: THREE.Group;
  private head: THREE.Group;
  private petals: THREE.Group;
  private leaves: THREE.Group[] = [];
  private groove = new Act(4, 9, 3);
  constructor() {
    const pot = '#c8673b';
    const b = new Builder();
    b.add(new THREE.CylinderGeometry(0.04, 0.03, 0.055, 14), pot, { pos: [0, 0.028, 0] });
    b.add(new THREE.CylinderGeometry(0.046, 0.046, 0.014, 14), '#d97c4f', { pos: [0, 0.058, 0] });
    b.add(new THREE.CylinderGeometry(0.039, 0.039, 0.004, 14), '#5a3a26', { pos: [0, 0.064, 0] });
    const hb = new Builder();
    hb.add(new THREE.CylinderGeometry(1, 1, 1, 18), '#f6c935', { pos: [0, 0.2, 0.004], rot: [Math.PI / 2, 0, 0], scale: [0.03, 0.014, 0.03] });
    arc(hb, [0, 0.192, 0.0125], 0.011, INK, false, Math.PI * 0.85);
    hb.add(sph(8, 6), BLUSH, { pos: [0.02, 0.195, 0.011], scale: [0.006, 0.004, 0.002] });
    hb.add(sph(8, 6), BLUSH, { pos: [-0.02, 0.195, 0.011], scale: [0.006, 0.004, 0.002] });
    // Sunglasses pushed up on top.
    for (const s of [-1, 1]) hb.add(new THREE.CylinderGeometry(1, 1, 1, 10), '#1d1f26', { pos: [s * 0.012, 0.224, 0.012], rot: [Math.PI / 2 - 0.4, 0, 0], scale: [0.009, 0.003, 0.007] });
    hb.add(new THREE.BoxGeometry(1, 1, 1), '#1d1f26', { pos: [0, 0.226, 0.011], scale: [0.008, 0.002, 0.002] });
    const e = new Builder();
    addEyes(e, 0.206, 0.0125, 0.011, 0.0065);
    super(b, e, 0.206);
    const sb = new Builder();
    tube(sb, [[0, 0.064, 0], [0.005, 0.11, 0], [-0.004, 0.15, 0], [0, 0.18, 0]], 0.005, '#4f9a3a', 5);
    this.stem = this.piece(sb, [0, 0.064, 0]);
    for (const s of [-1, 1]) {
      const lb = new Builder();
      lb.add(sph(10, 6), '#5fb446', { pos: [s * 0.024, 0.124, 0], rot: [0, 0, s * 0.9], scale: [0.007, 0.024, 0.012] });
      this.leaves.push(this.piece(lb, [s * 0.004, 0.115, 0], this.stem));
    }
    this.head = this.piece(hb, [0, 0.18, 0], this.stem);
    this.eyesOn(this.head);
    const pb = new Builder();
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2;
      pb.add(sph(10, 6), i % 2 ? '#ef5a4a' : '#f47b3c', { pos: [Math.sin(a) * 0.04, 0.2 + Math.cos(a) * 0.04, -0.002], rot: [0, 0, -a], scale: [0.012, 0.02, 0.004] });
    }
    this.petals = this.piece(pb, [0, 0.2, 0], this.head);
  }
  protected animate(dt: number, t: number, move: number) {
    // Always swaying to the beat; when it gets down, it's bigger and faster, head bobbing and petals spinning.
    const g = held(this.groove.step(dt, move < 0.2), 0.1);
    const beat = t * (4 + g * 3);
    const sway = Math.sin(beat);
    this.bodyGroup.position.y = Math.abs(Math.sin(t * 10)) * 0.02 * move;
    this.bodyGroup.rotation.set(move * 0.05, Math.sin(t * 0.5) * 0.2 * (1 - move), sway * 0.04 * (1 - move));
    this.stem.rotation.set(Math.cos(beat * 2) * 0.08 * g, 0, sway * (0.18 + g * 0.15));
    this.head.rotation.set(-Math.abs(Math.cos(beat)) * (0.1 + g * 0.2), clamp(this.turn * 0.12, -0.4, 0.4), -sway * 0.3);
    this.petals.rotation.z = g * t * 6;
    this.leaves.forEach((l, i) => (l.rotation.z = (i ? 1 : -1) * (0.2 + Math.sin(beat + i * Math.PI) * (0.35 + g * 0.4))));
  }
}

/** 16. A pink-and-purple striped cat with an enormous grin: it saunters about, and fades away to just the grin now and then. */
class GrinCat extends Pal {
  private head: THREE.Group;
  private tail: THREE.Group;
  private fur: THREE.Material;
  private vanish = new Act(6, 12, 4);
  constructor() {
    const pink = '#e08bc4';
    const purple = '#7d3f9a';
    const stripes: Field = (q) => Math.sin(q.p.z * 140 + q.p.y * 40) - 0.3;
    const sc = new Sculpt();
    sc.add(ellipsoid('body', [0, 0.095, -0.012], [0.046, 0.044, 0.068], { name: 'body' }));
    const b = new Builder();
    b.addColored(sculpted('grincat', () => ({ sc, marks: { base: pink, marks: [{ color: purple, f: stripes }] } }), 0.015));
    const hs = new Sculpt();
    hs.add(ellipsoid('body', [0, 0.17, 0.055], [0.054, 0.044, 0.044], { name: 'head' }));
    for (const s of [-1, 1]) hs.add(pyramid('body', [s * 0.032, 0.2, 0.05], 0.032, 0.034, 0.012, { rot: [0, 0, -s * 0.3], k: 0.006, round: 0.003, thin: true, name: 'ear' }));
    const hb = new Builder();
    hb.addColored(sculpted('grincat-head', () => ({ sc: hs, marks: { base: pink, marks: [{ color: purple, f: (q) => (q.p.y > 0.185 ? Math.sin(q.p.x * 150) - 0.2 : 1) }] } }), 0.013));
    hb.add(gem(), '#c0458e', { pos: [0, 0.172, frontZ(hs, 0, 0.172) + 0.001], scale: [0.006, 0.0045, 0.004] });
    const e = new Builder();
    irisEyes(e, 0.184, frontZ(hs, 0.02, 0.184) - 0.004, 0.02, 0.012, '#d9e53a', 0.35);
    const fur = soft();
    fur.transparent = true;
    super(b, e, 0.184, fur);
    this.fur = fur;
    this.head = this.piece(hb, [0, 0.14, 0.05]);
    this.eyesOn(this.head);
    // The grin, which stays when all the rest has gone.
    const gb = new Builder();
    const gz = frontZ(hs, 0, 0.158);
    gb.add(new THREE.TorusGeometry(1, 0.22, 5, 18, Math.PI), '#fffdf8', { pos: [0, 0.166, gz - 0.006], rot: [0.2, 0, Math.PI], scale: [0.03, 0.022, 0.03] });
    for (let i = -5; i <= 5; i++) gb.add(new THREE.BoxGeometry(1, 1, 1), '#c9c3c9', { pos: [i * 0.0052, 0.154 + Math.abs(i) * Math.abs(i) * 0.0004, gz + 0.0005], scale: [0.0006, 0.007, 0.002] });
    tube(gb, [[-0.034, 0.17, gz - 0.008], [-0.018, 0.146, gz], [0, 0.141, gz + 0.002], [0.018, 0.146, gz], [0.034, 0.17, gz - 0.008]], 0.0014, INK, 3);
    this.piece(gb, [0, 0.16, gz], this.head, soft());
    this.addLegs(pawLeg('grincat-leg', 0.075, 0.013, pink, purple), 0.075, [[-0.026, 0.03], [0.026, 0.03], [-0.026, -0.055], [0.026, -0.055]]);
    const tb = new Builder();
    tube(tb, [[0, 0.11, -0.075], [0, 0.15, -0.1], [0.015, 0.19, -0.095], [0.03, 0.2, -0.07]], 0.009, purple, 6);
    this.tail = this.piece(tb, [0, 0.11, -0.075]);
  }
  protected animate(dt: number, t: number, move: number) {
    // Fades from the tail up, till only the grin hangs there; then back the same way.
    const v = this.vanish.step(dt, move < 0.2);
    const gone = held(v, 0.25);
    this.fur.opacity = 1 - gone;
    this.fur.depthWrite = gone < 0.5;
    this.eyes.visible = gone < 0.85;
    const w = this.walkLegs(dt, move, 11, 0.55);
    this.bodyGroup.position.y = Math.abs(w) * 0.008 * move + gone * 0.03;
    this.head.rotation.set(Math.sin(t * 0.8) * 0.06, clamp(this.turn * 0.12, -0.4, 0.4) + Math.sin(t * 0.5) * 0.25 * (1 - move), Math.sin(t * 0.7) * 0.25 * (1 - move) + gone * 0.4);
    this.tail.rotation.set(Math.sin(t * 1.3) * 0.2, Math.sin(t * 2) * 0.4, 0);
  }
}

/** 17. A wind-up walking bomb with a lit fuse: it waddles along on its little feet, and has a fizzing panic now and then. */
class BombPal extends Critter {
  private key: THREE.Group;
  private spark: THREE.Group;
  private feet: THREE.Group[] = [];
  private shell: THREE.Material;
  private fizz = new Act(6, 12, 2.4);
  constructor() {
    const black = '#25262e';
    const sc = new Sculpt();
    sc.add(ellipsoid('body', [0, 0.09, 0], [0.064, 0.064, 0.064], { name: 'ball' }));
    const b = new Builder();
    b.addColored(sculpted('bombpal', () => ({ sc, marks: { base: black, marks: [{ color: '#5a5d6c', f: patch([-0.03, 0.13, 0.035], [0.02, 0.015, 0.02]) }] } }), 0.014));
    b.add(new THREE.CylinderGeometry(1, 1, 1, 12), '#b8bcc6', { pos: [0, 0.158, 0], scale: [0.018, 0.012, 0.018] });
    tube(b, [[0, 0.164, 0], [0.004, 0.18, 0.003], [-0.004, 0.19, 0.006], [0.002, 0.2, 0.004]], 0.0028, '#e9dcbc', 4);
    // White eyes, tall ovals with black pupils.
    const e = new Builder();
    for (const s of [-1, 1]) {
      const at = onSurface(sc, s * 0.018, 0.105, 0);
      e.add(gem(), '#fffdf8', { scale: [0.009, 0.017, 0.004] }, at);
      e.add(bead(), INK, { pos: [0, 0.002, 0.003], scale: [0.005, 0.009, 0.003] }, at);
    }
    const shell = soft();
    super(b, e, 0.105, shell);
    this.shell = shell;
    const kb = new Builder();
    kb.add(new THREE.CylinderGeometry(1, 1, 1, 8), '#d4b13c', { pos: [0, 0.09, -0.07], rot: [Math.PI / 2, 0, 0], scale: [0.004, 0.02, 0.004] });
    for (const s of [-1, 1]) kb.add(new THREE.TorusGeometry(1, 0.3, 5, 10), '#e9c44a', { pos: [s * 0.016, 0.09, -0.08], rot: [0, Math.PI / 2, 0], scale: 0.012 });
    this.key = this.piece(kb, [0, 0.09, -0.07]);
    const sb = new Builder();
    for (let i = 0; i < 5; i++) sb.add(spike(3), '#ffffff', { pos: [0, 0.204, 0.004], rot: [Math.cos(i * 1.3) * 1.2, i * 1.25, Math.sin(i * 1.3) * 1.2], scale: [0.003, 0.016, 0.003] });
    this.spark = this.piece(sb, [0.002, 0.202, 0.004], this.bodyGroup, glow('#ffc23a', 2));
    this.spark.children[0].castShadow = false;
    for (const s of [-1, 1]) {
      const fb = new Builder();
      fb.add(sph(10, 6), '#f2b43a', { pos: [s * 0.03, 0.01, 0.012], scale: [0.02, 0.011, 0.028] });
      this.feet.push(this.piece(fb, [s * 0.03, 0.022, 0.005]));
    }
  }
  protected animate(dt: number, t: number, move: number) {
    // The panic: the fuse fizzes up, it glows red hot and runs about on the spot, then sighs and cools.
    const f = held(this.fizz.step(dt, move < 0.2), 0.2);
    const pace = move + f;
    const w = Math.sin(t * (10 + f * 12));
    this.bodyGroup.position.set(Math.sin(t * 40) * 0.003 * f, Math.abs(w) * 0.008 * pace, 0);
    this.bodyGroup.rotation.set(move * 0.05, 0, w * 0.12 * pace);
    this.bodyGroup.scale.setScalar(1 + f * 0.05 * (0.5 + 0.5 * Math.sin(t * 30)));
    this.feet.forEach((ft, i) => (ft.rotation.x = w * (i ? 1 : -1) * 0.6 * Math.min(1, pace)));
    this.key.rotation.z = t * (1.5 + move * 3 + f * 10);
    this.spark.scale.setScalar((0.7 + Math.random() * 0.5) * (1 + f * 1.6));
    this.spark.rotation.y = t * 7;
    const m = this.shell as THREE.MeshStandardMaterial;
    if (m.emissive) {
      m.emissive.set('#ff3a1a');
      m.emissiveIntensity = f * (0.45 + Math.sin(t * 25) * 0.2);
    }
  }
}

/** 18. A little loch monster with a long neck and humps: it paddles along, and periscopes up for a good look round now and then. */
class Nessie extends Critter {
  private neck: THREE.Group;
  private flippers: THREE.Group[] = [];
  private tail: THREE.Group;
  private peek = new Act(5, 10, 3.2);
  constructor() {
    const green = '#4f9a6b';
    const belly = '#bfe2b0';
    const sc = new Sculpt();
    sc.add(ellipsoid('body', [0, 0.06, -0.01], [0.045, 0.04, 0.068], { name: 'body' }));
    sc.add(ellipsoid('body', [0, 0.085, -0.03], [0.03, 0.032, 0.03], { k: 0.025, name: 'hump' }));
    sc.add(flatBase(0.016));
    const b = new Builder();
    b.addColored(
      sculpted('nessie', () => ({ sc, marks: { base: green, marks: [{ color: belly, f: (q) => q.p.y - 0.04 }, { color: '#3b7d55', f: spots(3, 6, [0, 0.07, -0.01], [0.045, 0.045, 0.068], [0.01, 0.008, 0.01], (d) => d.y > 0.2) }] } }), 0.014),
    );
    const nb = new Builder();
    tube(nb, [[0, 0.07, 0.045], [0, 0.12, 0.07], [0, 0.17, 0.075], [0, 0.2, 0.08]], 0.015, green, 7);
    const hs = new Sculpt();
    hs.add(ellipsoid('body', [0, 0.208, 0.095], [0.022, 0.019, 0.032], { name: 'head' }));
    nb.addColored(sculpted('nessie-head', () => ({ sc: hs, marks: { base: green, marks: [{ color: belly, f: (q) => q.p.y - 0.2 }] } }), 0.01));
    for (const s of [-1, 1]) nb.add(sph(6, 5), '#3b7d55', { pos: [s * 0.009, 0.228, 0.088], scale: 0.005 });
    arc(nb, [0, 0.2, frontZ(hs, 0, 0.2)], 0.008, INK, false, Math.PI * 0.7);
    const e = new Builder();
    addEyes(e, 0.214, frontZ(hs, 0.012, 0.214) - 0.004, 0.012, 0.0075);
    super(b, e, 0.214);
    this.neck = this.piece(nb, [0, 0.07, 0.045]);
    this.eyesOn(this.neck);
    for (const [x, z] of [[-1, 0.03], [1, 0.03], [-1, -0.045], [1, -0.045]]) {
      const fb = new Builder();
      fb.add(sph(10, 6), green, { pos: [x * 0.055, 0.03, z], rot: [0, x * 0.3, x * 0.4], scale: [0.024, 0.006, 0.014] });
      this.flippers.push(this.piece(fb, [x * 0.038, 0.04, z]));
    }
    const tb = new Builder();
    tube(tb, [[0, 0.05, -0.07], [0, 0.04, -0.1], [0.01, 0.025, -0.13], [0.02, 0.02, -0.15]], 0.012, green, 6);
    this.tail = this.piece(tb, [0, 0.05, -0.07]);
  }
  protected animate(dt: number, t: number, move: number) {
    // The periscope: the neck straight up and long, the head turning in slow sweeps; then back down, nothing seen.
    const p = this.peek.step(dt, move < 0.2);
    const up = held(p, 0.15);
    const paddle = t * (6 + move * 4);
    this.bodyGroup.position.y = Math.sin(paddle) * 0.004 * move;
    this.bodyGroup.rotation.set(Math.sin(paddle) * 0.04 * move, Math.sin(t * 0.5) * 0.15 * (1 - move), 0);
    this.neck.scale.set(1, 1 + up * 0.35, 1);
    this.neck.rotation.set(Math.sin(t * 1.4) * 0.08 + move * 0.2 - up * 0.25, clamp(this.turn * 0.15, -0.5, 0.5) + (p < 0 ? 0 : Math.tanh(Math.sin(p * Math.PI * 3) * 3) * 0.7 * up), Math.sin(paddle * 0.5) * 0.1 * move);
    this.flippers.forEach((f, i) => {
      const s = i % 2 ? 1 : -1;
      f.rotation.set(0, Math.sin(paddle + (i < 2 ? 0 : Math.PI)) * 0.5 * (0.3 + move), s * Math.sin(t * 1.5) * 0.1);
    });
    this.tail.rotation.y = Math.sin(paddle * 0.5) * 0.35;
  }
}

/** 19. A potato with stick-on features: it waddles along in big shoes, and its bits all pop off and back on now and then. */
class Spud extends Pal {
  private bits: { g: THREE.Group; home: THREE.Vector3; fly: THREE.Vector3; spin: number }[] = [];
  private arms: THREE.Group[] = [];
  private pop = new Act(5, 10, 1.6);
  constructor() {
    const tater = '#c9a064';
    const sc = new Sculpt();
    sc.add(ellipsoid('body', [0, 0.115, 0], [0.056, 0.074, 0.05], { name: 'tater' }));
    sc.add(ellipsoid('body', [0.022, 0.15, -0.01], [0.036, 0.04, 0.035], { k: 0.02, name: 'tater' }));
    const b = new Builder();
    b.addColored(sculpted('spud', () => ({ sc, marks: { base: tater, marks: [{ color: '#a77e48', f: spots(6, 14, [0, 0.115, 0], [0.056, 0.074, 0.05], [0.005, 0.005, 0.005]) }] } }), 0.013));
    const e = new Builder();
    for (const s of [-1, 1]) {
      const at = onSurface(sc, s * 0.02, 0.145, 0.004);
      e.add(gem(), '#fffdf8', { scale: [0.014, 0.016, 0.008] }, at);
      e.add(bead(), INK, { pos: [0.002, -0.002, 0.007], scale: 0.006 }, at);
      e.add(pip(), '#ffffff', { pos: [0.004, 0.002, 0.012], scale: 0.002 }, at);
    }
    super(b, e, 0.145);
    // The stick-on bits, each on its own pivot so it can pop off: nose, moustache, mouth, ears and a bowler.
    const bit = (bb: Builder, at: Vec3, fly: Vec3, spin: number) => this.bits.push({ g: this.piece(bb, at), home: V(at), fly: V(fly), spin });
    const nz = frontZ(sc, 0, 0.122);
    let bb = new Builder();
    bb.add(sph(10, 8), '#e2453a', { pos: [0, 0.122, nz + 0.008], scale: [0.014, 0.012, 0.013] });
    bit(bb, [0, 0.122, nz + 0.008], [0, 0.03, 0.08], 6);
    bb = new Builder();
    for (const s of [-1, 1]) tube(bb, [[0, 0.106, nz + 0.006], [s * 0.016, 0.104, nz + 0.003], [s * 0.03, 0.11, nz - 0.004]], 0.005, '#2c211c', 5);
    bit(bb, [0, 0.106, nz + 0.006], [0.02, -0.01, 0.07], -5);
    bb = new Builder();
    bb.add(sph(10, 6), '#d8566a', { pos: [0, 0.088, frontZ(sc, 0, 0.088) + 0.002], scale: [0.016, 0.006, 0.006] });
    bit(bb, [0, 0.088, frontZ(sc, 0, 0.088)], [-0.02, -0.02, 0.07], 4);
    for (const s of [-1, 1]) {
      bb = new Builder();
      bb.add(sph(10, 6), '#f0a7a0', { pos: [s * 0.058, 0.13, 0], rot: [0, 0, -s * 0.2], scale: [0.007, 0.016, 0.012] });
      bit(bb, [s * 0.056, 0.13, 0], [s * 0.08, 0.02, 0], s * 5);
    }
    bb = new Builder();
    bb.add(new THREE.CylinderGeometry(1, 1, 1, 16), '#1f1e24', { pos: [0, 0.188, 0], scale: [0.04, 0.004, 0.038] });
    bb.add(sph(14, 8), '#1f1e24', { pos: [0, 0.192, 0], scale: [0.026, 0.024, 0.025] });
    bb.add(new THREE.CylinderGeometry(1, 1, 1, 16), '#8b1d2b', { pos: [0, 0.196, 0], scale: [0.0262, 0.006, 0.0252] });
    bit(bb, [0, 0.188, 0], [0, 0.1, 0], 3);
    for (const s of [-1, 1]) {
      const ab = new Builder();
      tube(ab, [[s * 0.05, 0.1, 0], [s * 0.07, 0.085, 0.01], [s * 0.074, 0.068, 0.02]], 0.004, '#fbf8ee', 4);
      ab.add(sph(8, 6), '#fbf8ee', { pos: [s * 0.075, 0.064, 0.022], scale: 0.01 });
      this.arms.push(this.piece(ab, [s * 0.05, 0.1, 0]));
    }
    const leg = sculpted('spud-shoe', () => {
      const l = new Sculpt();
      l.add(ellipsoid('body', [0, 0.014, 0.012], [0.02, 0.014, 0.032], { name: 'shoe' }));
      l.add(rod('body', [0, 0.045, 0], [0, 0.02, 0.004], 0.008, 0.008, { k: 0.008, name: 'leg' }));
      l.add(flatBase());
      return { sc: l, marks: { base: '#2f55d4', marks: [{ color: '#fbf8ee', f: regionOf(l, 'leg') }] } };
    }, 0.01);
    this.addLegs(leg, 0.045, [[-0.026, 0], [0.026, 0]]);
  }
  protected animate(dt: number, t: number, move: number) {
    // Pop! Everything flies off a little way, hangs a moment, and snaps back on.
    const p = this.pop.step(dt, move < 0.2);
    const off = p < 0 ? 0 : Math.sin(clamp(p / 0.8, 0, 1) * Math.PI);
    const w = this.walkLegs(dt, move, 12, 0.7);
    this.bodyGroup.position.y = Math.abs(w) * 0.01 * move + bell(p) * 0.02;
    this.bodyGroup.rotation.set(0, Math.sin(t * 0.5) * 0.2 * (1 - move), w * 0.1 * move);
    for (const bt of this.bits) {
      bt.g.position.copy(bt.home).addScaledVector(bt.fly, off);
      bt.g.rotation.set(off * bt.spin * 0.3, off * bt.spin * 0.5, 0);
    }
    this.arms.forEach((arm, i) => {
      const s = i ? 1 : -1;
      arm.rotation.set(-w * s * 0.5 * move, 0, s * (0.1 + off * 1.2));
    });
  }
}

/** 20. A ginger cat in a blue shirt with a little keyboard: he plays as he goes, and plays you off with a flourish now and then. */
class KeyCat extends Pal {
  private head: THREE.Group;
  private arms: THREE.Group[] = [];
  private flourish = new Act(5, 10, 2.4);
  constructor() {
    const ginger = '#e8a54b';
    const shirt = '#7fb2e5';
    const sc = new Sculpt();
    sc.add(ellipsoid('body', [0, 0.1, 0], [0.036, 0.044, 0.03], { name: 'body' }));
    const b = new Builder();
    b.addColored(sculpted('keycat', () => ({ sc, marks: { base: shirt, marks: [{ color: '#6a9bd0', f: (q) => Math.abs(q.p.x) - 0.002 }] } }), 0.013));
    // The keyboard, slung in front: white keys with black ones between.
    b.add(new THREE.BoxGeometry(1, 1, 1), '#2c2e36', { pos: [0, 0.088, 0.05], rot: [0.3, 0, 0], scale: [0.09, 0.01, 0.03] });
    b.add(new THREE.BoxGeometry(1, 1, 1), '#fbfbf8', { pos: [0, 0.0935, 0.054], rot: [0.3, 0, 0], scale: [0.082, 0.003, 0.018] });
    for (let i = 0; i < 9; i++) if (i % 7 !== 2 && i % 7 !== 6) b.add(new THREE.BoxGeometry(1, 1, 1), '#1d1f23', { pos: [-0.036 + i * 0.009 + 0.0045, 0.0955, 0.05], rot: [0.3, 0, 0], scale: [0.004, 0.003, 0.009] });
    tube(b, [[-0.04, 0.09, 0.045], [-0.03, 0.13, 0.02], [0, 0.145, 0.02], [0.03, 0.13, 0.02], [0.04, 0.09, 0.045]], 0.002, '#3a2a22', 4);
    const hs = new Sculpt();
    hs.add(ellipsoid('body', [0, 0.18, 0.006], [0.046, 0.04, 0.04], { name: 'head' }));
    hs.add(ellipsoid('body', [0, 0.167, 0.036], [0.018, 0.013, 0.013], { k: 0.015, name: 'muzzle' }));
    for (const s of [-1, 1]) hs.add(pyramid('body', [s * 0.028, 0.205, 0], 0.03, 0.04, 0.011, { rot: [0, 0, -s * 0.3], k: 0.006, round: 0.003, thin: true, name: 'ear' }));
    const hb = new Builder();
    hb.addColored(
      sculpted('keycat-head', () => ({ sc: hs, marks: { base: ginger, marks: [{ color: '#fbe6c4', f: regionOf(hs, 'muzzle') }, { color: '#c98432', f: (q) => (q.p.y > 0.2 ? Math.abs(Math.sin(q.p.x * 170)) - 0.3 : 1) }] } }), 0.012),
    );
    hb.add(gem(), '#e57f8d', { pos: [0, 0.172, frontZ(hs, 0, 0.172) + 0.001], scale: [0.006, 0.0045, 0.004] });
    tube(hb, onFront(hs, [[-0.01, 0.163], [-0.005, 0.159], [0, 0.162], [0.005, 0.159], [0.01, 0.163]], 0.001), 0.0013, INK, 3);
    const e = new Builder();
    irisEyes(e, 0.186, frontZ(hs, 0.018, 0.186) - 0.004, 0.018, 0.0095, '#c9b23a', 0.5);
    super(b, e, 0.186);
    this.head = this.piece(hb, [0, 0.145, 0]);
    this.eyesOn(this.head);
    for (const s of [-1, 1]) {
      const ab = new Builder();
      tube(ab, [[s * 0.03, 0.125, 0], [s * 0.034, 0.11, 0.025], [s * 0.022, 0.105, 0.048]], 0.007, shirt, 4);
      ab.add(gem(), ginger, { pos: [s * 0.02, 0.103, 0.052], scale: 0.0085 });
      this.arms.push(this.piece(ab, [s * 0.03, 0.125, 0]));
    }
    this.addLegs(pawLeg('keycat-leg', 0.065, 0.012, ginger), 0.065, [[-0.016, 0], [0.016, 0]]);
  }
  protected animate(dt: number, t: number, move: number) {
    // Plays all the time, paws pecking at the keys; the flourish is a big run up the keyboard with the head thrown back.
    const f = held(this.flourish.step(dt, move < 0.2), 0.12);
    const w = this.walkLegs(dt, move, 12, 0.6);
    this.bodyGroup.position.y = Math.abs(w) * 0.008 * move + Math.abs(Math.sin(t * 6)) * 0.004 * (1 - move);
    this.bodyGroup.rotation.set(0, Math.sin(t * 3) * 0.15 * f, w * 0.05 * move);
    this.head.rotation.set(-f * 0.35 + Math.abs(Math.sin(t * 6)) * 0.12 * (1 - f), clamp(this.turn * 0.12, -0.4, 0.4) + Math.sin(t * 6) * 0.1 * f, Math.sin(t * 3) * 0.12);
    this.arms.forEach((arm, i) => {
      const s = i ? 1 : -1;
      const peck = Math.max(0, Math.sin(t * (14 + i * 3) + i)) * 0.25;
      arm.rotation.set(-peck, s * f * Math.sin(t * 6) * 0.3, s * (f * 0.2 - peck * 0.2));
    });
  }
}

/** The sixth set's makers, for pets.ts's list. */
export const PETS6_MAKERS = {
  redpup: () => new RedPup(),
  mutt: () => new Mutt(),
  brainmouse: () => new BrainMouse(),
  donkey: () => new Donkey(),
  bootcat: () => new BootCat(),
  goober: () => new Goober(),
  babyshark: () => new BabyShark(),
  sock: () => new Sock(),
  rubberchicken: () => new RubberChicken(),
  petrock: () => new PetRock(),
  fishghost: () => new FishGhost(),
  ufo: () => new Ufo(),
  toaster: () => new Toaster(),
  furbo: () => new Furbo(),
  potdancer: () => new PotDancer(),
  grincat: () => new GrinCat(),
  bombpal: () => new BombPal(),
  nessie: () => new Nessie(),
  spud: () => new Spud(),
  keycat: () => new KeyCat(),
};
