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
  blushes,
  both,
  clamp,
  cutout,
  either,
  flatBase,
  frontZ,
  gem,
  hop,
  onFront,
  onSurface,
  patch,
  pip,
  placeCopy,
  sculpted,
  sph,
  spike,
  tube,
} from './petkit';

/**
 * The fifth set of pets: more fond storybook takes on pop culture favourites (robots, sprites, spirits and
 * a dog with a talking collar). Built from the same kit as the others (see petkit.ts).
 */

/** A smooth ease from 0 to 1 as `u` goes from `a` to `b`. */
const ease = (u: number, a: number, b: number) => {
  const x = clamp((u - a) / (b - a), 0, 1);
  return x * x * (3 - 2 * x);
};

/** A cone from `base` pointing along `dir` (a quill, a tuft): `len` long, `r` round at the base. */
function cone(b: Builder, base: Vec3, dir: Vec3, len: number, r: number, color: THREE.ColorRepresentation, sides = 5) {
  const d = V(dir).normalize();
  const m = new THREE.Matrix4().compose(V(base).addScaledVector(d, len / 2), new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d), new THREE.Vector3(r, len, r));
  b.add(spike(sides), color, m);
}

/** A see-through glowing material (a halo, a beam); `add` lights up what's behind it instead of covering it. */
function haze(color: THREE.ColorRepresentation, opacity: number, add = false): THREE.MeshStandardMaterial {
  const m = glow(color, 1);
  m.transparent = true;
  m.opacity = opacity;
  m.depthWrite = false;
  if (add) m.blending = THREE.AdditiveBlending;
  return m;
}

/** 1. A sleek white egg of a probe robot with blue LED eyes: it floats, leans into the going, and twirls for joy now and then. */
class EggProbe extends Critter {
  private head: THREE.Group;
  private arms: THREE.Group[] = [];
  private twirl = new Act(5, 10, 1.3);
  constructor() {
    const white = '#f6f7f9';
    const sc = new Sculpt();
    sc.add(ellipsoid('body', [0, 0.135, 0], [0.064, 0.082, 0.062], { name: 'body' }));
    sc.add(rod('body', [0, 0.12, 0], [0, 0.04, 0], 0.056, 0.012, { k: 0.04, name: 'body' }));
    const b = new Builder();
    b.addColored(sculpted('eggprobe', () => ({ sc, marks: { base: white, marks: [{ color: '#e3e7ee', f: (q) => q.p.y - 0.07 }] } }), 0.018));
    // The head floats just clear of the body: a wide egg with a black glass face.
    const hs = new Sculpt();
    hs.add(ellipsoid('body', [0, 0.268, 0], [0.068, 0.05, 0.064], { name: 'head' }));
    const hb = new Builder();
    hb.addColored(
      sculpted('eggprobe-head', () => ({ sc: hs, marks: { base: white, marks: [{ color: '#14161d', f: both(patch([0, 0.266, 0.045], [0.054, 0.035, 0.04]), (q) => q.p.z - 0.018 > 0 ? -1 : 1) }] } }), 0.016),
    );
    // LED eyes: a dark bezel (which blinks with them) and the glowing blue in front.
    const e = new Builder();
    const lit = new Builder();
    for (const s of [-1, 1]) {
      const at = onSurface(hs, s * 0.024, 0.268, 0.001);
      e.add(bead(), '#0d2638', { rot: [0, 0, s * 0.3], scale: [0.017, 0.011, 0.003] }, at);
      lit.add(bead(), '#7fd8ff', { pos: [0, 0, 0.002], rot: [0, 0, s * 0.3], scale: [0.013, 0.0075, 0.003] }, at);
    }
    super(b, e, 0.268);
    this.head = this.piece(hb, [0, 0.222, 0]);
    this.eyesOn(this.head);
    this.piece(lit, [0, 0.268, 0.06], this.eyes, glow('#7fd8ff', 1.4));
    // Fin-like arms that lie flat to the sides.
    for (const s of [-1, 1]) {
      const ab = new Builder();
      ab.add(sph(12, 9), white, { pos: [s * 0.07, 0.13, 0], rot: [0, 0, -s * 0.08], scale: [0.013, 0.058, 0.03] });
      this.arms.push(this.piece(ab, [s * 0.066, 0.185, 0]));
    }
  }
  protected animate(dt: number, t: number, move: number) {
    // Hovers, leaning into the going with the arms swept back; still, it looks about, and now and then twirls.
    const w = this.twirl.step(dt, move < 0.3);
    this.bodyGroup.position.y = 0.07 + Math.sin(t * 2) * 0.012;
    this.bodyGroup.rotation.set(move * 0.35, w < 0 ? 0 : (1 - Math.cos(w * Math.PI)) * Math.PI, Math.sin(t * 1.3) * 0.04);
    this.head.position.y = 0.222 + Math.sin(t * 2 - 0.7) * 0.004;
    this.head.rotation.set(-move * 0.25 + Math.sin(t * 0.9) * 0.05, clamp(this.turn * 0.15, -0.5, 0.5) + Math.tanh(Math.sin(t * 0.5) * 3) * 0.5 * (1 - move), 0);
    const spread = bell(w) * 1.3;
    this.arms.forEach((arm, i) => {
      const s = i ? 1 : -1;
      arm.rotation.set(move * 0.9, 0, s * (0.06 + move * 0.15 + spread + Math.sin(t * 2 + i) * 0.04));
    });
  }
}

/** 2. A huggable white inflatable nurse robot: it waddles, tilts its head, and waves hello now and then. */
class NurseBot extends Critter {
  private head: THREE.Group;
  private arms: THREE.Group[] = [];
  private wave = new Act(5, 10, 2.2);
  constructor() {
    const white = '#fbfbfc';
    const sc = new Sculpt();
    sc.add(ellipsoid('body', [0, 0.155, 0], [0.082, 0.095, 0.072], { name: 'body' }));
    sc.add(ellipsoid('body', [0, 0.1, 0.004], [0.104, 0.08, 0.088], { k: 0.05, name: 'body' }));
    for (const s of [-1, 1]) sc.add(rod('body', [s * 0.045, 0.05, 0], [s * 0.048, 0.012, 0.006], 0.034, 0.03, { k: 0.02, name: 'leg' }));
    sc.add(flatBase());
    const port = frontZ(sc, 0.045, 0.19);
    const b = new Builder();
    b.addColored(
      sculpted('nursebot', () => ({
        sc,
        marks: {
          base: white,
          marks: [
            { color: '#dfe3e8', f: (q) => q.p.y - 0.022 },
            // A little round access port on the chest.
            { color: '#d7dce2', f: patch([0.045, 0.19, port], [0.016, 0.016, 0.012]) },
          ],
        },
      }), 0.022),
    );
    // A small head, just two dots joined by a line for a face.
    const hs = new Sculpt();
    hs.add(ellipsoid('body', [0, 0.272, 0.012], [0.054, 0.037, 0.044], { name: 'head' }));
    const hb = new Builder();
    hb.addColored(sculpted('nursebot-head', () => ({ sc: hs, marks: { base: white, marks: [] } }), 0.016));
    const e = new Builder();
    const fz = frontZ(hs, 0, 0.276);
    for (const s of [-1, 1]) e.add(bead(), INK, { pos: [s * 0.02, 0.276, frontZ(hs, s * 0.02, 0.276) - 0.002], scale: [0.0085, 0.0085, 0.005] });
    e.add(new THREE.BoxGeometry(1, 1, 1), INK, { pos: [0, 0.276, fz - 0.0005], scale: [0.04, 0.0022, 0.003] });
    super(b, e, 0.276);
    this.head = this.piece(hb, [0, 0.24, 0.005]);
    this.eyesOn(this.head);
    for (const s of [-1, 1]) {
      const ab = new Builder();
      ab.addColored(
        sculpted(`nursebot-arm${s}`, () => {
          const a = new Sculpt();
          a.add(rod('body', [s * 0.085, 0.19, 0], [s * 0.112, 0.085, 0.01], 0.03, 0.025, { name: 'arm' }));
          a.add(ellipsoid('body', [s * 0.114, 0.07, 0.012], [0.024, 0.026, 0.022], { k: 0.012, name: 'hand' }));
          return { sc: a, marks: { base: white, marks: [] } };
        }, 0.018),
      );
      this.arms.push(this.piece(ab, [s * 0.08, 0.195, 0]));
    }
  }
  protected animate(dt: number, t: number, move: number) {
    const wv = this.wave.step(dt, move < 0.2);
    const up = Math.min(1, bell(wv) * 3);
    // A slow, puffy waddle; still, it breathes, and tilts its head as if to ask how you are.
    const w = Math.sin(t * 6);
    this.bodyGroup.rotation.set(move * 0.05, 0, w * 0.1 * move);
    this.bodyGroup.position.y = Math.abs(w) * 0.008 * move;
    const breathe = 1 + Math.sin(t * 1.5) * 0.02;
    this.bodyGroup.scale.set(1 + (breathe - 1) * 0.8, breathe, 1 + (breathe - 1) * 0.8);
    this.head.rotation.set(0, clamp(this.turn * 0.12, -0.4, 0.4), Math.tanh(Math.sin(t * 0.5) * 4) * 0.22 * (1 - move) - up * 0.12);
    this.arms.forEach((arm, i) => {
      const s = i ? 1 : -1;
      // The right arm (on the left as you look at it) does the waving.
      const raise = s < 0 ? up * (2.3 + Math.sin(t * 9) * 0.3) : 0;
      arm.rotation.set(-w * s * 0.15 * move, 0, s * (0.08 + Math.sin(t * 1.5) * 0.02 + raise));
    });
  }
}

/** 3. A blue spiky hedgehog in red trainers: he runs leaning hard into it, and taps his foot when kept waiting. */
class Hedgehog extends Critter {
  private head: THREE.Group;
  private legs: THREE.Group[] = [];
  private shoes: THREE.Group[] = [];
  private arms: THREE.Group[] = [];
  private stride = 0;
  private waiting = 0;
  constructor() {
    const blue = '#2d62da';
    const tan = '#f2c99a';
    const sc = new Sculpt();
    sc.add(ellipsoid('body', [0, 0.1, 0], [0.04, 0.046, 0.036], { name: 'body' }));
    const b = new Builder();
    b.addColored(sculpted('hedgehog', () => ({ sc, marks: { base: blue, marks: [{ color: tan, f: both(patch([0, 0.098, 0.03], [0.028, 0.034, 0.03]), (q) => 0.01 - q.p.z) }] } }), 0.014));
    for (const s of [-1, 1]) cone(b, [s * 0.01, 0.11, -0.03], [s * 0.2, -0.4, -1], 0.04, 0.012, blue);
    // The head: big, with a tan muzzle and ears, and the quills sweeping back off it.
    const hs = new Sculpt();
    hs.add(ellipsoid('body', [0, 0.19, 0], [0.066, 0.06, 0.06], { name: 'head' }));
    hs.add(ellipsoid('body', [0, 0.166, 0.048], [0.036, 0.024, 0.026], { k: 0.02, name: 'muzzle' }));
    for (const s of [-1, 1]) hs.add(pyramid('body', [s * 0.036, 0.242, -0.006], 0.024, 0.05, 0.01, { rot: [-0.2, 0, -s * 0.35], k: 0.008, round: 0.003, thin: true, name: 'ear' }));
    // Inside each ear, a tan patch on its front.
    const inner = (x: number): Field => patch([x, 0.262, frontZ(hs, x, 0.262)], [0.011, 0.015, 0.008]);
    const hb = new Builder();
    hb.addColored(
      sculpted('hedgehog-head', () => ({
        sc: hs,
        marks: { base: blue, marks: [{ color: tan, f: regionOf(hs, 'muzzle') }, { color: tan, f: either(inner(-0.042), inner(0.042)) }] },
      }), 0.015),
    );
    for (const [base, dir, len, r] of [
      [[0, 0.232, -0.03], [0, 0.55, -1], 0.08, 0.026],
      [[0, 0.195, -0.052], [0, -0.05, -1], 0.095, 0.028],
      [[0, 0.158, -0.042], [0, -0.6, -1], 0.08, 0.026],
      [[0.03, 0.235, -0.025], [0.6, 0.7, -0.7], 0.06, 0.018],
      [[-0.03, 0.235, -0.025], [-0.6, 0.7, -0.7], 0.06, 0.018],
      [[0.036, 0.21, -0.03], [0.8, 0.3, -0.8], 0.075, 0.021],
      [[-0.036, 0.21, -0.03], [-0.8, 0.3, -0.8], 0.075, 0.021],
      [[0.034, 0.172, -0.032], [0.75, -0.35, -0.8], 0.065, 0.019],
      [[-0.034, 0.172, -0.032], [-0.75, -0.35, -0.8], 0.065, 0.019],
    ] as [Vec3, Vec3, number, number][]) {
      cone(hb, base, dir, len, r, blue);
    }
    hb.add(bead(), INK, { pos: [0, 0.178, frontZ(hs, 0, 0.178) + 0.002], scale: [0.009, 0.007, 0.007] });
    // A cocky little smirk.
    tube(hb, onFront(hs, [[-0.008, 0.159], [0.006, 0.155], [0.019, 0.162]], 0.001), 0.0022, INK, 4);
    // The eyes: one white mask across both, green irises.
    const e = new Builder();
    const ez = frontZ(hs, 0.018, 0.2) - 0.008;
    for (const s of [-1, 1]) {
      e.add(gem(), '#fffdf8', { pos: [s * 0.017, 0.2, ez], rot: [0, 0, s * -0.15], scale: [0.021, 0.028, 0.012] });
      e.add(bead(), '#3fae4a', { pos: [s * 0.017 + 0.003, 0.198, ez + 0.009], scale: [0.0095, 0.014, 0.005] });
      e.add(bead(), INK, { pos: [s * 0.017 + 0.004, 0.198, ez + 0.012], scale: [0.005, 0.008, 0.004] });
      e.add(new THREE.IcosahedronGeometry(1, 0), '#ffffff', { pos: [s * 0.017 + 0.007, 0.203, ez + 0.014], scale: 0.0025 });
    }
    super(b, e, 0.2);
    this.head = this.piece(hb, [0, 0.14, 0]);
    this.eyesOn(this.head);
    // Thin blue legs, each with a big red trainer (white strap, gold buckle) that pivots at the heel.
    for (const s of [-1, 1]) {
      const lb = new Builder();
      tube(lb, [[s * 0.022, 0.072, 0], [s * 0.024, 0.05, 0.002], [s * 0.025, 0.026, 0]], 0.0085, blue, 5);
      const leg = this.piece(lb, [s * 0.022, 0.072, 0]);
      const fb = new Builder();
      fb.add(gem(), '#d8262c', { pos: [s * 0.025, 0.018, 0.012], scale: [0.022, 0.017, 0.038] });
      fb.add(new THREE.BoxGeometry(1, 1, 1), '#f4efe6', { pos: [s * 0.025, 0.004, 0.012], scale: [0.04, 0.007, 0.072] });
      fb.add(new THREE.BoxGeometry(1, 1, 1), '#ffffff', { pos: [s * 0.025, 0.026, 0.01], rot: [0.3, 0, 0], scale: [0.046, 0.007, 0.014] });
      fb.add(new THREE.BoxGeometry(1, 1, 1), '#f2c230', { pos: [s * 0.047, 0.025, 0.01], scale: [0.003, 0.008, 0.008] });
      this.shoes.push(this.piece(fb, [s * 0.025, 0.006, -0.018], leg));
      this.legs.push(leg);
      // Arms bent, white-gloved hands on hips.
      const ab = new Builder();
      tube(ab, [[s * 0.036, 0.13, 0], [s * 0.062, 0.112, -0.006], [s * 0.044, 0.09, 0.008]], 0.0065, blue, 4);
      ab.add(gem(), '#fffdf8', { pos: [s * 0.043, 0.089, 0.01], scale: [0.015, 0.014, 0.015] });
      ab.add(new THREE.TorusGeometry(1, 0.35, 4, 10), '#fffdf8', { pos: [s * 0.05, 0.097, 0.004], rot: [Math.PI / 2, 0, s * 0.7], scale: 0.01 });
      this.arms.push(this.piece(ab, [s * 0.036, 0.13, 0]));
    }
  }
  protected animate(dt: number, t: number, move: number) {
    // Faster on the move than anyone: legs a whirl, arms flung back, leaning hard. Kept waiting, he taps his foot.
    this.stride += dt * (10 + clamp(this.speed, 0, 8) * 2.5) * move;
    const w = Math.sin(this.stride);
    this.waiting = move < 0.1 ? this.waiting + dt : 0;
    const tapping = this.waiting > 1.2 && Math.sin(t * 0.9) > -0.3 ? 1 : 0;
    this.bodyGroup.rotation.set(move * 0.38, 0, 0);
    this.bodyGroup.position.y = Math.abs(w) * 0.012 * move + Math.sin(t * 2.4) * 0.002;
    this.legs.forEach((leg, i) => {
      const s = i ? 1 : -1;
      leg.rotation.x = w * s * 1.1 * move;
      leg.position.y = 0.072 + Math.max(0, w * s) * 0.012 * move;
    });
    // His left foot taps (toe up and down off the heel).
    this.shoes.forEach((shoe, i) => (shoe.rotation.x = i ? -Math.max(0, Math.sin(t * 13)) * 0.45 * tapping : 0));
    this.arms.forEach((arm, i) => {
      const s = i ? 1 : -1;
      arm.rotation.set(move * (1.1 - w * s * 0.25), 0, s * move * 0.3);
    });
    this.head.rotation.set(-move * 0.2, clamp(this.turn * 0.12, -0.4, 0.4) + Math.sin(t * 0.6) * 0.25 * (1 - move), -0.08 * (1 - move));
  }
}

/** 4. A black iron ball of a chomper, all teeth, chained to a stake: it bounces about, and lunges for a snap now and then. */
class Chomper extends Critter {
  private jaw: THREE.Group;
  private stake: THREE.Group;
  private chain: THREE.InstancedMesh;
  private lunge = new Act(3, 7, 1.1);
  private static readonly LINKS = 7;
  private static readonly CY = 0.085;
  private static readonly R = 0.075;
  constructor() {
    const { CY, R } = Chomper;
    const black = '#20212a';
    const mouth = '#7a1d26';
    const ball = (half: 1 | -1) => {
      const s = new Sculpt();
      s.add(ellipsoid('body', [0, CY, 0], [R, R, R * 0.98], { name: 'ball' }));
      s.add(box('body', [0, CY - half * 0.3, 0], [0.6, 0.3, 0.6], { carve: true, round: 0.004 }));
      return s;
    };
    const top = ball(1);
    const b = new Builder();
    b.addColored(
      sculpted('chomper', () => ({
        sc: top,
        marks: {
          base: black,
          marks: [
            { color: mouth, f: (q) => q.p.y - CY - 0.003 },
            { color: '#5c5e6c', f: patch([-0.032, CY + 0.058, 0.03], [0.022, 0.014, 0.022]) },
          ],
        },
      }), 0.018),
    );
    // Teeth all round the front of the rim, top and bottom, meeting between.
    const teeth = (bb: Builder, up: boolean) => {
      for (let i = 0; i < 7; i++) {
        const a = -1.75 + (i + (up ? 0.5 : 0)) * (3.5 / 7);
        if (up && i === 6) continue;
        bb.add(spike(4), '#fbf8ee', { pos: [Math.sin(a) * R * 0.88, CY + (up ? 0.012 : -0.012), Math.cos(a) * R * 0.88], rot: [up ? 0 : Math.PI, a + Math.PI / 4, 0], scale: [0.014, 0.026, 0.014] });
      }
    };
    teeth(b, false);
    const e = new Builder();
    for (const s of [-1, 1]) {
      const at = onSurface(top, s * 0.03, CY + 0.036, -0.004);
      e.add(gem(), '#fffdf8', { scale: [0.021, 0.024, 0.01] }, at);
      e.add(bead(), INK, { pos: [-s * 0.003, -0.002, 0.008], scale: [0.0065, 0.008, 0.004] }, at);
    }
    super(b, e, CY + 0.036);
    const jb = new Builder();
    jb.addColored(sculpted('chomper-jaw', () => ({ sc: ball(-1), marks: { base: black, marks: [{ color: mouth, f: (q) => CY - 0.003 - q.p.y }] } }), 0.018));
    teeth(jb, true);
    this.jaw = this.piece(jb, [0, CY, -R * 0.85]);
    // The stake it's chained to, on the ground behind (it comes along, dragged).
    const sb = new Builder();
    sb.add(new THREE.CylinderGeometry(1, 1, 1, 6), '#8a5a34', { pos: [0, 0.04, -0.2], scale: [0.012, 0.08, 0.012] });
    sb.add(new THREE.CylinderGeometry(1, 1, 1, 6), '#c08a55', { pos: [0, 0.081, -0.2], scale: [0.0125, 0.003, 0.0125] });
    sb.add(new THREE.TorusGeometry(1, 0.3, 4, 8), '#8d929c', { pos: [0, 0.07, -0.188], scale: 0.009 });
    this.stake = this.piece(sb, [0, 0, -0.2], this.root);
    const lb = new Builder();
    lb.add(new THREE.TorusGeometry(1, 0.32, 4, 8), '#7d828c', { scale: [0.011, 0.016, 0.011] });
    this.chain = this.copies(lb, Chomper.LINKS);
    this.root.add(this.chain);
  }
  protected animate(dt: number, t: number, move: number) {
    const { CY, R, LINKS } = Chomper;
    // A restless bounce on the spot, chattering; on the move, big hops; now and then a lunge to the end of the chain.
    const u = this.lunge.step(dt, move < 0.2);
    const reach = u < 0 ? 0 : Math.sin(ease(u, 0, 0.25) * Math.PI / 2) * (1 - ease(u, 0.7, 1));
    const snap = u < 0 ? 0 : reach * Math.abs(Math.sin(u * Math.PI * 4.5));
    const open = Math.max(snap, Math.max(0, Math.sin(t * 9 + 1)) * 0.25 * (1 - move));
    const bounce = Math.abs(Math.sin(t * 5)) * 0.02 * (1 - move) * (1 - reach) + hop(t, move, 0.05, 9);
    this.bodyGroup.position.set(0, bounce, reach * 0.1);
    this.bodyGroup.rotation.set(-open * 0.3, Math.sin(t * 1.7) * 0.15 * (1 - move), 0);
    this.jaw.rotation.x = open * 0.75;
    this.stake.rotation.x = move * 0.7 + reach * 0.15;
    // The chain: from the ring on the stake to the back of the ball, sagging when slack.
    const lean = this.stake.rotation.x;
    const a = new THREE.Vector3(0, 0.07 * Math.cos(lean), -0.2 + 0.07 * Math.sin(lean) + 0.012);
    const bp = new THREE.Vector3(0, CY + bounce, -R * 0.9 + reach * 0.1);
    const len = a.distanceTo(bp);
    const sag = Math.max(0, 0.24 - len) * 0.9;
    const prev = a.clone();
    for (let i = 0; i < LINKS; i++) {
      const f = (i + 0.5) / LINKS;
      const p = a.clone().lerp(bp, f);
      p.y = Math.max(0.008, p.y - 4 * f * (1 - f) * sag);
      const next = a.clone().lerp(bp, (i + 1) / LINKS);
      next.y = Math.max(0.008, next.y - 4 * ((i + 1) / LINKS) * (1 - (i + 1) / LINKS) * sag);
      const d = next.sub(prev).normalize();
      const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d).multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), (i % 2) * Math.PI / 2));
      this.chain.setMatrixAt(i, new THREE.Matrix4().compose(p, q, new THREE.Vector3(1, 1, 1)));
      prev.copy(p);
    }
    this.chain.instanceMatrix.needsUpdate = true;
  }
}

/** 5. A fairy that's just a ball of light with wings: it flits about at shoulder height, and pipes up now and then. */
class Fairy extends Critter {
  private wings: THREE.Group[] = [];
  private halo: THREE.Group;
  private sparkles: THREE.Group;
  private core: THREE.MeshStandardMaterial;
  private call = new Act(6, 12, 1.4);
  private zip = new Act(1.2, 3, 0.1);
  private off = new THREE.Vector3();
  private aim = new THREE.Vector3();
  constructor() {
    const b = new Builder();
    b.add(sph(12, 9), '#ffffff', { scale: 0.026 });
    // (A pet must have eyes: a tiny bead hidden inside the light.)
    const e = new Builder();
    e.add(bead(), '#ffffff', { scale: 0.006 });
    const core = glow('#eef9ff', 1.6);
    super(b, e, 0, core);
    this.core = core;
    const hb = new Builder();
    hb.add(sph(12, 9), '#ffffff', { scale: 0.048 });
    hb.add(sph(12, 9), '#ffffff', { scale: 0.08 });
    this.halo = this.piece(hb, [0, 0, 0], this.bodyGroup, haze('#5fc3ff', 0.22, true));
    this.halo.children[0].castShadow = false;
    // Two pairs of dragonfly wings behind it.
    const wmat = new THREE.MeshStandardMaterial({ color: '#e3f6ff', emissive: '#9fdcff', emissiveIntensity: 0.7, transparent: true, opacity: 0.55, side: THREE.DoubleSide, depthWrite: false });
    for (const s of [-1, 1]) {
      for (const [len, w, rz] of [[0.075, 0.022, 0.55], [0.055, 0.016, -0.45]]) {
        const sh = new THREE.Shape();
        sh.absellipse(len / 2, 0, len / 2, w, 0, Math.PI * 2, false, 0);
        const g = cutout(sh, 0.002, 8);
        const wb = new Builder();
        wb.add(g, '#e3f6ff', { pos: [s * 0.012, 0, -0.016], rot: [0, s > 0 ? 0 : Math.PI, rz] });
        g.dispose();
        this.wings.push(this.piece(wb, [s * 0.012, 0, -0.016], this.bodyGroup, wmat));
      }
    }
    for (const w of this.wings) w.children[0].castShadow = false;
    // A few motes of light circling it.
    const sb = new Builder();
    for (let i = 0; i < 3; i++) sb.add(pip(), '#ffffff', { pos: [Math.cos(i * 2.1) * 0.06, Math.sin(i * 3.3) * 0.02, Math.sin(i * 2.1) * 0.06], scale: 0.005 });
    this.sparkles = this.piece(sb, [0, 0, 0], this.bodyGroup, glow('#d8f3ff', 1.5));
  }
  protected animate(dt: number, t: number, move: number) {
    // Darts from spot to spot about a little way off its owner's shoulder, and flits about in between.
    if (this.zip.step(dt) === 0) this.aim.set((Math.random() - 0.5) * 0.24, (Math.random() - 0.4) * 0.12, (Math.random() - 0.5) * 0.2);
    this.off.lerp(this.aim, Math.min(1, dt * 7));
    const c = this.call.step(dt, move < 0.3);
    const pipe = c < 0 ? 0 : Math.abs(Math.sin(c * Math.PI * 2)) * bell(c);
    this.bodyGroup.position.set(
      this.off.x * (1 - move * 0.5) + Math.sin(t * 2.9) * 0.025,
      0.5 + this.off.y + Math.sin(t * 3.7) * 0.02 + pipe * 0.08,
      this.off.z * (1 - move * 0.5) + Math.sin(t * 2.3) * 0.02 - move * 0.12,
    );
    const pulse = 1 + Math.sin(t * 5) * 0.08 + pipe * 0.6;
    this.halo.scale.setScalar(pulse);
    this.core.emissiveIntensity = 1.5 + pipe * 1.2 + Math.sin(t * 5) * 0.15;
    this.sparkles.rotation.set(Math.sin(t) * 0.4, t * 2.5, 0);
    const flap = Math.sin(t * 55) * 0.7;
    this.wings.forEach((w, i) => {
      const s = i < 2 ? -1 : 1;
      w.rotation.y = s * (flap + 0.2);
    });
  }
}

/** 6. A white furry moogle with little bat wings and a red pom-pom on a stalk: it flutter-hops about, kupo! */
class Moogle extends Critter {
  private wings: THREE.Group[] = [];
  private stalk: THREE.Group;
  private kupo = new Act(4, 9, 0.9);
  private swing = new THREE.Vector2();
  private swingV = new THREE.Vector2();
  constructor() {
    const white = '#fbf8f4';
    const sc = new Sculpt();
    sc.add(ellipsoid('body', [0, 0.092, 0], [0.068, 0.072, 0.062], { name: 'body' }));
    sc.add(ellipsoid('body', [0, 0.2, 0.006], [0.084, 0.07, 0.074], { k: 0.045, name: 'head' }));
    for (const s of [-1, 1]) {
      sc.add(pyramid('body', [s * 0.05, 0.252, -0.004], 0.026, 0.04, 0.016, { rot: [0, 0, -s * 0.4], k: 0.012, thin: true, name: 'ear' }));
      sc.add(ellipsoid('body', [s * 0.034, 0.014, 0.024], [0.025, 0.015, 0.03], { k: 0.015, name: 'foot' }));
      sc.add(ellipsoid('body', [s * 0.064, 0.098, 0.024], [0.02, 0.03, 0.021], { rot: [0.3, 0, s * 0.35], k: 0.02, name: 'arm' }));
    }
    sc.add(flatBase());
    const cheek = frontZ(sc, 0.05, 0.188);
    const inner = (x: number): Field => patch([x, 0.27, frontZ(sc, x, 0.27)], [0.011, 0.014, 0.008]);
    const b = new Builder();
    b.addColored(
      sculpted('moogle', () => ({
        sc,
        marks: {
          base: white,
          marks: [
            { color: '#f2b5c4', f: either(inner(-0.058), inner(0.058)) },
            { color: BLUSH, f: blushes(0.188, cheek, 0.05, 0.014) },
            { color: '#ece4dc', f: regionOf(sc, 'foot') },
          ],
        },
      }), 0.022),
    );
    // A big pink nose and a small smile.
    b.add(gem(), '#e66d86', { pos: [0, 0.196, frontZ(sc, 0, 0.196) + 0.004], scale: [0.017, 0.013, 0.012] });
    arc(b, [0, 0.176, frontZ(sc, 0, 0.176) + 0.001], 0.008, INK, false, Math.PI * 0.8);
    // Fluffy tufts on the chest.
    for (const [x, y] of [[-0.02, 0.13], [0.012, 0.135], [0.0, 0.118]]) cone(b, [x, y, frontZ(sc, x, y) - 0.004], [x * 4, -0.3, 1], 0.02, 0.007, '#f4efe8', 4);
    // Eyes shut in a contented smile.
    const e = new Builder();
    for (const s of [-1, 1]) arc(e, [s * 0.036, 0.214, frontZ(sc, s * 0.036, 0.214) + 0.001], 0.011, INK, true, Math.PI * 0.8);
    super(b, e, 0.214);
    // The antenna, a springy stalk with the red pom-pom on top.
    const ab = new Builder();
    tube(ab, [[0, 0.268, 0], [0.003, 0.31, 0.006], [0.01, 0.345, 0.024], [0.018, 0.362, 0.048]], 0.0032, '#2c2628', 4);
    const pom: Vec3 = [0.02, 0.364, 0.06];
    ab.add(gem(), '#e2343f', { pos: pom, scale: 0.022 });
    for (let i = 0; i < 10; i++) {
      const d: Vec3 = [Math.cos(i * 2.4) * Math.sin(i * 1.3 + 0.5), Math.cos(i * 1.3 + 0.5), Math.sin(i * 2.4) * Math.sin(i * 1.3 + 0.5)];
      cone(ab, [pom[0] + d[0] * 0.016, pom[1] + d[1] * 0.016, pom[2] + d[2] * 0.016], d, 0.014, 0.007, '#c9222e', 4);
    }
    this.stalk = this.piece(ab, [0, 0.268, 0]);
    // Purple bat wings with scalloped edges.
    for (const s of [-1, 1]) {
      const pts: [number, number][] = [[0, 0], [0.055, 0.045], [0.072, 0.018], [0.06, 0.006], [0.054, -0.014], [0.036, -0.004], [0.024, -0.022], [0.01, -0.008]];
      const g = cutout(pts.map(([x, y]) => [x * s, y]), 0.004);
      const wb = new Builder();
      wb.add(g, '#8a5ab2', { pos: [s * 0.028, 0.14, -0.058], rot: [0, s * 0.6, 0] });
      g.dispose();
      this.wings.push(this.piece(wb, [s * 0.028, 0.14, -0.058]));
    }
  }
  protected animate(dt: number, t: number, move: number) {
    const k = this.kupo.step(dt, move < 0.3);
    // Flutter-hops along, wings beating while it's up; still, a gentle bob and the odd jump and spin for joy.
    const air = hop(t, move, 0.07, 8) + bell(k) * 0.08;
    this.bodyGroup.position.y = air + Math.sin(t * 2.2) * 0.004;
    this.bodyGroup.rotation.set(move * 0.12, k < 0 ? 0 : ease(k, 0.1, 0.9) * Math.PI * 2, Math.sin(t * 1.6) * 0.05 * (1 - move));
    const beat = air > 0.01 ? Math.sin(t * 30) * 0.7 : Math.sin(t * 3) * 0.12;
    this.wings.forEach((w, i) => (w.rotation.y = (i ? 1 : -1) * (0.1 + beat)));
    // The pom-pom on a spring: it lags behind the bobbing and the turns.
    const pull = new THREE.Vector2(-this.turn * 0.04, -(air - 0.03) * 3);
    this.swingV.addScaledVector(pull.sub(this.swing), dt * 90).multiplyScalar(Math.max(0, 1 - dt * 6));
    this.swing.addScaledVector(this.swingV, dt);
    this.stalk.rotation.set(clamp(this.swing.y, -0.6, 0.6) + Math.sin(t * 2.5) * 0.06, 0, clamp(this.swing.x, -0.6, 0.6) + Math.sin(t * 1.9) * 0.08);
  }
}

/** 7. A little green cactus forever caught mid-sprint, three dots for a face: it holds the pose, and flips it now and then. */
class Cactus extends Critter {
  private arms: THREE.Group[] = [];
  private legs: THREE.Group[] = [];
  private flip = new Act(2.5, 5, 0.4);
  private pose = 1;
  private lastFlip = -1;
  constructor() {
    const green = '#79bf3b';
    const sc = new Sculpt();
    sc.add(rod('body', [0, 0.085, 0], [0, 0.2, 0], 0.043, 0.041, { name: 'body' }));
    sc.add(ellipsoid('body', [0, 0.205, 0], [0.041, 0.04, 0.04], { k: 0.015, name: 'body' }));
    sc.add(ellipsoid('body', [0, 0.08, 0], [0.043, 0.03, 0.042], { k: 0.015, name: 'body' }));
    const b = new Builder();
    b.addColored(
      sculpted('cactus', () => ({
        sc,
        marks: {
          base: green,
          // Ribs running up it, but not across the face.
          marks: [{ color: '#62a530', f: (q) => Math.max(Math.abs(Math.sin(Math.atan2(q.p.x, q.p.z) * 4)) - 0.22, Math.min(0.6 - Math.abs(Math.atan2(q.p.x, q.p.z)), 0.13 - q.p.y + 0.01)) }],
        },
      }), 0.016),
    );
    // Little pale spines, and three tufts on top.
    for (let i = 0; i < 12; i++) {
      const a = 0.9 + (i / 12) * (Math.PI * 2 - 1.8);
      const y = 0.1 + ((i * 5) % 4) * 0.028;
      cone(b, [Math.sin(a) * 0.04, y, Math.cos(a) * 0.04], [Math.sin(a), 0.4, Math.cos(a)], 0.012, 0.0035, '#f4ecbf', 3);
    }
    for (const [x, lean] of [[-0.012, -0.5], [0, 0], [0.012, 0.5]]) cone(b, [x, 0.24, 0], [lean, 1, 0], 0.03, 0.007, '#9fd24a', 4);
    b.add(bead(), '#2a2420', { pos: [0, 0.158, frontZ(sc, 0, 0.158) - 0.002], scale: [0.0075, 0.012, 0.004] });
    const e = new Builder();
    for (const s of [-1, 1]) e.add(bead(), '#2a2420', { pos: [s * 0.016, 0.19, frontZ(sc, s * 0.016, 0.19) - 0.002], scale: [0.0075, 0.0105, 0.004] });
    super(b, e, 0.19);
    // Arms bent at the elbow, forearm up: turning about the upper arm swings the forearm up, forward or down.
    for (const s of [-1, 1]) {
      const ab = new Builder();
      tube(ab, [[s * 0.03, 0.15, 0], [s * 0.06, 0.152, 0], [s * 0.074, 0.156, 0], [s * 0.078, 0.18, 0], [s * 0.078, 0.192, 0]], 0.0115, green, 6);
      ab.add(sph(8, 6), green, { pos: [s * 0.078, 0.193, 0], scale: 0.0115 });
      this.arms.push(this.piece(ab, [s * 0.035, 0.152, 0]));
      const lb = new Builder();
      tube(lb, [[s * 0.02, 0.07, 0], [s * 0.021, 0.04, 0], [s * 0.022, 0.014, 0]], 0.013, green, 6);
      lb.add(sph(8, 6), green, { pos: [s * 0.022, 0.013, 0.002], scale: [0.014, 0.012, 0.016] });
      this.legs.push(this.piece(lb, [s * 0.02, 0.07, 0]));
    }
  }
  protected animate(dt: number, t: number, move: number) {
    // Still, it holds its sprint, flipping arms and legs over with a hop now and then; moving, it sprints for real.
    const f = this.flip.step(dt, move < 0.2);
    if (f < 0 && this.lastFlip >= 0) this.pose = -this.pose;
    this.lastFlip = f;
    const posed = f < 0 ? this.pose : this.pose * Math.cos(f * Math.PI);
    const p = posed * (1 - move) + Math.sin(t * 16) * move;
    this.bodyGroup.position.y = bell(f) * 0.035 + Math.abs(Math.sin(t * 16)) * 0.015 * move;
    this.bodyGroup.rotation.set(0.12 + move * 0.1, p * 0.12, 0);
    this.arms.forEach((arm, i) => {
      const s = i ? 1 : -1;
      arm.rotation.x = ((1 - p * s) * Math.PI) / 2;
    });
    this.legs.forEach((leg, i) => {
      const s = i ? 1 : -1;
      leg.rotation.x = -p * s * 0.65;
      leg.position.y = 0.07 + Math.max(0, -p * s) * 0.012;
    });
  }
}

/** The bean's suit colours: one picked by its owner's name, so everyone sees the same. */
const SUITS = ['#d63a3a', '#2f55d4', '#2b9a48', '#ee6fc1', '#f18a24', '#f5e050', '#3f4650', '#eef1f6', '#7a46c8', '#7b5134', '#45d6e2', '#7fe04c'];

/** 8. A little astronaut bean with a visor and a backpack: it waddles about, and looks round suspiciously now and then. */
class Bean extends Critter {
  private legs: THREE.Group[] = [];
  private sus = new Act(4, 9, 2.4);
  private look = 0;
  constructor() {
    const sc = new Sculpt();
    sc.add(rod('body', [0, 0.085, 0], [0, 0.165, 0], 0.06, 0.058, { name: 'suit' }));
    sc.add(ellipsoid('body', [0, 0.168, 0], [0.058, 0.055, 0.056], { k: 0.02, name: 'suit' }));
    sc.add(ellipsoid('body', [0, 0.08, 0], [0.06, 0.04, 0.058], { k: 0.02, name: 'suit' }));
    sc.add(box('body', [0, 0.125, -0.066], [0.04, 0.046, 0.022], { round: 0.014, k: 0.008, name: 'pack' }));
    // The suit is drawn white and tinted by the material, so its colour can change.
    const b = new Builder();
    b.addColored(sculpted('bean', () => ({ sc, marks: { base: '#ffffff', marks: [{ color: '#e6e6e6', f: regionOf(sc, 'pack') }, { color: '#dcdcdc', f: (q) => q.p.y - 0.052 }] } }), 0.018));
    const vz = frontZ(sc, 0, 0.163);
    const e = new Builder();
    e.add(gem(), '#ffffff', { pos: [0.018, 0.172, vz + 0.017], rot: [0, 0.2, 0.25], scale: [0.013, 0.005, 0.004] });
    const mat = soft();
    super(b, e, 0.172, mat);
    // The visor, glassy pale blue.
    const vb = new Builder();
    vb.add(gem(), '#8fcbe0', { pos: [0, 0.163, vz - 0.008], scale: [0.044, 0.027, 0.024] });
    vb.add(gem(), '#6aa7c2', { pos: [0, 0.157, vz - 0.009], scale: [0.042, 0.022, 0.024] });
    this.piece(vb, [0, 0.163, vz], this.bodyGroup, wet());
    const leg = sculpted('bean-leg', () => {
      const l = new Sculpt();
      l.add(rod('body', [0, 0.06, 0], [0, 0.016, 0.004], 0.028, 0.026, { name: 'leg' }));
      l.add(flatBase());
      return { sc: l, marks: { base: '#ffffff', marks: [{ color: '#dcdcdc', f: (q) => q.p.y - 0.012 }] } };
    }, 0.016);
    for (const s of [-1, 1]) {
      const lb = new Builder();
      lb.addColored(leg, { pos: [s * 0.03, 0, 0] });
      this.legs.push(this.piece(lb, [s * 0.03, 0.06, 0]));
    }
    this.setColor(SUITS[0]);
  }
  private setColor(c: string) {
    (this.mat as THREE.MeshLambertMaterial).color.set(c);
  }
  /** Picks the suit colour from its owner's name. */
  setOwner(name: string) {
    let h = 7;
    for (const ch of name.toLowerCase()) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
    this.setColor(SUITS[h % SUITS.length]);
  }
  protected animate(dt: number, t: number, move: number) {
    const s = this.sus.step(dt, move < 0.2);
    // A stubby waddle; still, now and then a long suspicious look one way, then the other.
    const want = s < 0 ? 0 : s < 0.42 ? 0.7 : s < 0.82 ? -0.7 : 0;
    this.look += (want - this.look) * Math.min(1, dt * (s > 0.1 && s < 0.2 ? 3 : 9));
    const w = Math.sin(t * 11);
    this.bodyGroup.position.y = Math.abs(w) * 0.01 * move;
    this.bodyGroup.rotation.set(move * 0.06, this.look, w * 0.08 * move + Math.sin(t * 1.4) * 0.03 * (1 - move));
    this.legs.forEach((leg, i) => (leg.rotation.x = w * (i ? 1 : -1) * 0.6 * move));
  }
}

/** 9. A white turret pal on three spindly legs with one red eye: it scans about, and opens up to say hello now and then. */
class Turret extends Critter {
  private top: THREE.Group;
  private shells: THREE.Group[] = [];
  private legs: THREE.Group[] = [];
  private beam: THREE.Group;
  private hello = new Act(6, 12, 2.4);
  private still = 0;
  private static readonly LEGS = [Math.PI, 0.95, -0.95];
  constructor() {
    const white = '#f4f4f2';
    const cy = 0.18;
    const sc = new Sculpt();
    sc.add(ellipsoid('body', [0, cy, 0], [0.022, 0.082, 0.045], { name: 'core' }));
    const b = new Builder();
    b.addColored(sculpted('turret', () => ({ sc, marks: { base: white, marks: [{ color: '#2d3036', f: (q) => Math.max(Math.abs(q.p.x) - 0.0035, -q.p.z) }] } }), 0.014));
    // The guns tucked inside, out of sight until the sides open.
    for (const s of [-1, 1]) for (const y of [cy + 0.025, cy - 0.025]) b.add(new THREE.CylinderGeometry(1, 1, 1, 6), '#3a3d44', { pos: [s * 0.032, y, -0.004], rot: [Math.PI / 2, 0, 0], scale: [0.006, 0.04, 0.006] });
    const e = new Builder();
    const lens = onSurface(sc, 0, cy + 0.01, -0.002);
    e.add(gem(), '#1b1c20', { scale: [0.018, 0.018, 0.008] }, lens);
    e.add(new THREE.TorusGeometry(1, 0.2, 4, 12), '#9aa0a8', { pos: [0, 0, 0.004], scale: 0.017 }, lens);
    super(b, e, cy + 0.01);
    this.top = this.pivotBody([0, cy, 0]);
    this.eyesOn(this.top);
    const rb = new Builder();
    rb.add(bead(), '#ff2a20', { pos: [0, 0, 0.007], scale: [0.007, 0.007, 0.004] }, lens);
    this.piece(rb, [0, cy + 0.01, 0.05], this.eyes, glow('#ff3020', 1.8));
    // A thin red beam, for when it's scanning.
    const lb = new Builder();
    lb.add(new THREE.CylinderGeometry(1, 1, 1, 4), '#ff3b30', { pos: [0, 0, 0.3], rot: [Math.PI / 2, 0, 0], scale: [0.0012, 0.5, 0.0012] }, lens);
    this.beam = this.piece(lb, [0, cy + 0.01, 0.05], this.top, haze('#ff3b30', 0.55));
    this.beam.children[0].castShadow = false;
    // The two side shells that make up most of the egg, sliding apart to say hello.
    for (const s of [-1, 1]) {
      const sh = new Sculpt();
      sh.add(ellipsoid('body', [0, cy, 0], [0.056, 0.086, 0.048], { name: 'shell' }));
      sh.add(box('body', [s * (0.02 - 0.3), cy, 0], [0.3, 0.3, 0.3], { carve: true, round: 0.003 }));
      const shb = new Builder();
      shb.addColored(sculpted(`turret-shell${s}`, () => ({ sc: sh, marks: { base: white, marks: [{ color: '#c4c8ce', f: (q) => Math.abs(q.p.x) - 0.024 }] } }), 0.014));
      this.shells.push(this.piece(shb, [0, cy, 0], this.top));
    }
    // Three thin black legs, two in front and one behind.
    for (const a of Turret.LEGS) {
      const lg = new Builder();
      const at: Vec3 = [Math.sin(a) * 0.02, 0.115, Math.cos(a) * 0.02];
      tube(lg, [at, [Math.sin(a) * 0.05, 0.075, Math.cos(a) * 0.05], [Math.sin(a) * 0.075, 0.008, Math.cos(a) * 0.075]], 0.0045, '#34373e', 4);
      lg.add(pip(), '#2a2c31', { pos: [Math.sin(a) * 0.077, 0.004, Math.cos(a) * 0.077], scale: [0.009, 0.004, 0.009] });
      this.legs.push(this.piece(lg, at));
    }
  }
  protected animate(dt: number, t: number, move: number) {
    const h = this.hello.step(dt, move < 0.2);
    const open = h < 0 ? 0 : ease(h, 0, 0.15) * (1 - ease(h, 0.8, 1));
    // Scuttles on its tripod; still, it sweeps the beam slowly to and fro.
    this.bodyGroup.position.y = Math.abs(Math.sin(t * 10)) * 0.008 * move;
    this.top.rotation.set(move * 0.15, Math.sin(t * 0.7) * 0.5 * (1 - move) * (1 - open) + clamp(this.turn * 0.1, -0.3, 0.3), Math.sin(t * 13) * 0.04 * open);
    this.shells.forEach((sh, i) => (sh.position.x = (i ? 1 : -1) * 0.028 * open));
    // The beam comes on once it's stood still a moment, and reaches out.
    this.still = move < 0.4 ? this.still + dt : 0;
    const reach = ease(this.still, 1.5, 2.2);
    this.beam.visible = reach > 0;
    this.beam.scale.set(1, 1, Math.max(0.01, reach));
    this.legs.forEach((leg, i) => {
      const a = Turret.LEGS[i];
      const lift = Math.max(0, Math.sin(t * 12 + (i * Math.PI * 2) / 3)) * move;
      leg.rotation.set(-Math.cos(a) * lift * 0.35, 0, Math.sin(a) * lift * 0.35);
    });
  }
}

/** 10. A tiny grinning cat that's also a bus, on a dozen scurrying legs. */
class CatBus extends Critter {
  private legs: THREE.InstancedMesh;
  private tail: THREE.Group;
  private stretch = new Act(5, 10, 1.4);
  private stride = 0;
  constructor() {
    const tan = '#dc9a45';
    const cream = '#f4dfb2';
    const sc = new Sculpt();
    sc.add(box('body', [0, 0.118, -0.01], [0.062, 0.058, 0.12], { round: 0.045, name: 'body' }));
    sc.add(ellipsoid('body', [0, 0.124, 0.09], [0.064, 0.066, 0.052], { k: 0.03, name: 'head' }));
    for (const s of [-1, 1]) sc.add(pyramid('body', [s * 0.038, 0.176, 0.094], 0.024, 0.04, 0.014, { rot: [0, 0, -s * 0.3], k: 0.01, thin: true, name: 'ear' }));
    // The grin: a wide crescent across the face, teeth along its top.
    const mouthTop = (x: number) => 0.106 - 0.01 * (1 - (x / 0.05) ** 2);
    const mouthBot = (x: number) => 0.106 - 0.042 * (1 - (x / 0.05) ** 2);
    const inMouth = (q: { p: THREE.Vector3 }) => Math.max(Math.abs(q.p.x) - 0.05, mouthBot(q.p.x) - q.p.y, q.p.y - mouthTop(q.p.x), 0.1 - q.p.z);
    const b = new Builder();
    b.addColored(
      sculpted('catbus', () => ({
        sc,
        marks: {
          base: tan,
          marks: [
            { color: '#fffaf0', f: (q) => Math.max(inMouth(q), mouthTop(q.p.x) - 0.008 - q.p.y) },
            { color: '#4a1e1c', f: inMouth },
            { color: '#f2b5b0', f: either(patch([-0.042, 0.19, frontZ(sc, -0.042, 0.19)], [0.009, 0.012, 0.007]), patch([0.042, 0.19, frontZ(sc, 0.042, 0.19)], [0.009, 0.012, 0.007])) },
            { color: cream, f: (q) => q.p.y - 0.075 },
            // Tabby stripes over the back.
            { color: '#a8692c', f: (q) => Math.max(0.15 - q.p.y, Math.abs(Math.sin(q.p.z * 70)) - 0.32, q.p.z - 0.075) },
          ],
        },
      }), 0.018),
    );
    // Windows along both sides.
    for (const s of [-1, 1]) {
      for (const z of [-0.075, -0.025, 0.025]) {
        b.add(new THREE.BoxGeometry(1, 1, 1), cream, { pos: [s * 0.061, 0.132, z], scale: [0.004, 0.036, 0.042] });
        b.add(new THREE.BoxGeometry(1, 1, 1), '#4b3a2f', { pos: [s * 0.0625, 0.133, z], scale: [0.004, 0.028, 0.034] });
      }
    }
    b.add(bead(), '#d97a6a', { pos: [0, 0.128, frontZ(sc, 0, 0.128) + 0.002], scale: [0.009, 0.006, 0.006] });
    for (const s of [-1, 1]) {
      for (const [dy, a] of [[0.006, 0.18], [-0.006, -0.1]]) {
        const y = 0.12 + dy;
        b.add(new THREE.BoxGeometry(1, 1, 1), '#5b3a22', { pos: [s * 0.075, y + a * 0.02, frontZ(sc, s * 0.045, y) - 0.006], rot: [0, -s * 0.45, s * a], scale: [0.05, 0.0022, 0.0022] });
      }
    }
    // Big round yellow eyes like headlamps, slit pupils.
    const e = new Builder();
    for (const s of [-1, 1]) {
      const at = onSurface(sc, s * 0.032, 0.156, -0.004);
      e.add(gem(), '#ffd84a', { scale: [0.02, 0.02, 0.01] }, at);
      e.add(bead(), INK, { pos: [0, 0, 0.008], scale: [0.004, 0.012, 0.004] }, at);
      e.add(new THREE.IcosahedronGeometry(1, 0), '#ffffff', { pos: [0.006, 0.007, 0.01], scale: 0.003 }, at);
    }
    super(b, e, 0.156);
    const tb = new Builder();
    tube(tb, [[0, 0.14, -0.12], [0, 0.17, -0.155], [0.008, 0.21, -0.16], [0.02, 0.235, -0.145]], 0.011, tan, 6);
    tb.add(gem(), '#a8692c', { pos: [0.02, 0.237, -0.144], scale: 0.012 });
    this.tail = this.piece(tb, [0, 0.14, -0.12]);
    // Six legs a side, all one instanced mesh.
    const lb = new Builder();
    tube(lb, [[0, 0, 0], [0, -0.03, 0.003], [0, -0.058, 0.004]], 0.0095, tan, 5);
    lb.add(pip(), cream, { pos: [0, -0.06, 0.008], scale: [0.011, 0.006, 0.013] });
    this.legs = this.copies(lb, 12);
  }
  protected animate(dt: number, t: number, move: number) {
    // Scurries on a ripple of legs, front to back; still, it settles, swishes its tail, and stretches now and then.
    this.stride += dt * (14 + clamp(this.speed, 0, 8) * 2) * move;
    const st = this.stretch.step(dt, move < 0.2);
    const reach = bell(st);
    this.bodyGroup.position.y = Math.abs(Math.sin(this.stride * 2)) * 0.006 * move - (1 - move) * 0.004 + reach * 0.01;
    this.bodyGroup.rotation.set(Math.sin(this.stride) * 0.03 * move + reach * 0.08, 0, Math.sin(this.stride * 0.5) * 0.03 * move);
    this.bodyGroup.scale.set(1, 1 - reach * 0.04, 1 + reach * 0.08);
    for (let i = 0; i < 12; i++) {
      const s = i < 6 ? -1 : 1;
      const j = i % 6;
      const ph = this.stride - j * 1.1 + (s > 0 ? Math.PI : 0);
      placeCopy(this.legs, i, [s * 0.044, 0.064 + Math.max(0, Math.sin(ph)) * 0.008 * move, -0.1 + j * 0.039], [Math.cos(ph) * 0.55 * move + (j < 3 ? -1 : 1) * reach * 0.3, 0, s * 0.08], [1, 1, 1]);
    }
    this.legs.instanceMatrix.needsUpdate = true;
    this.tail.rotation.set(-move * 0.4 + Math.sin(t * 2.2) * 0.1, Math.sin(t * 1.5) * 0.35 * (1 - move) + Math.sin(this.stride) * 0.15 * move, 0);
  }
}

/** 11. A tall faceless spirit, all shadow, with a white mask: it drifts after you, and shyly offers a little gold now and then. */
class Faceless extends Critter {
  private arm: THREE.Group;
  private offer = new Act(6, 12, 3.2);
  constructor() {
    const sc = new Sculpt();
    sc.add(rod('body', [0, 0.07, 0], [0, 0.29, 0], 0.066, 0.05, { name: 'body' }));
    sc.add(ellipsoid('body', [0, 0.3, 0], [0.051, 0.058, 0.048], { k: 0.03, name: 'body' }));
    sc.add(ellipsoid('body', [0, 0.05, 0], [0.08, 0.045, 0.075], { k: 0.04, name: 'body' }));
    sc.add(flatBase());
    const b = new Builder();
    b.addColored(sculpted('faceless', () => ({ sc, marks: { base: '#1b181f', marks: [{ color: '#120f15', f: (q) => q.p.y - 0.03 }] } }), 0.02));
    // The mask: plain white, purple marks above and below each eye, a small mouth.
    const mask = onSurface(sc, 0, 0.268, 0.003);
    const mb = new Builder();
    mb.add(gem(), '#f4f1ea', { scale: [0.036, 0.05, 0.014] }, mask);
    for (const s of [-1, 1]) {
      mb.add(spike(3), '#8a6aa3', { pos: [s * 0.016, 0.02, 0.011], scale: [0.006, 0.013, 0.003] }, mask);
      mb.add(spike(3), '#8a6aa3', { pos: [s * 0.016, -0.014, 0.011], rot: [0, 0, Math.PI], scale: [0.006, 0.018, 0.003] }, mask);
    }
    mb.add(new THREE.BoxGeometry(1, 1, 1), '#2a2228', { pos: [0, -0.032, 0.01], scale: [0.012, 0.0025, 0.003] }, mask);
    const e = new Builder();
    for (const s of [-1, 1]) e.add(bead(), INK, { pos: [s * 0.016, 0.004, 0.0115], scale: [0.0065, 0.0045, 0.003] }, mask);
    const mat = soft();
    mat.transparent = true;
    mat.opacity = 0.88;
    super(b, e, 0.272, mat);
    this.piece(mb, [0, 0.268, 0.05], this.bodyGroup, soft());
    // A thin shadowy arm that reaches out with gold in its hand.
    const ab = new Builder();
    tube(ab, [[0.045, 0.19, 0.01], [0.06, 0.16, 0.05], [0.05, 0.155, 0.095]], 0.007, '#1b181f', 4);
    for (const [x, y, z, r] of [[0.05, 0.164, 0.102, 0.015], [0.038, 0.166, 0.094, 0.012], [0.06, 0.167, 0.09, 0.011]]) ab.add(pip(), '#f2c140', { pos: [x, y, z], rot: [x * 50, y * 40, 0], scale: r });
    this.arm = this.piece(ab, [0.045, 0.19, 0.01]);
  }
  protected animate(dt: number, t: number, move: number) {
    // Drifts along without a step, swaying; still, now and then it holds out a handful of gold, bowing a little.
    const o = this.offer.step(dt, move < 0.2);
    const k = o < 0 ? 0 : ease(o, 0, 0.2) * (1 - ease(o, 0.8, 1));
    this.bodyGroup.position.y = 0.01 + Math.sin(t * 1.3) * 0.008;
    this.bodyGroup.rotation.set(-move * 0.06 + k * 0.14, Math.sin(t * 0.4) * 0.15 * (1 - move), Math.sin(t * 0.9) * 0.05 + Math.sin(t * 3) * 0.04 * k);
    this.arm.visible = k > 0.01;
    this.arm.scale.setScalar(Math.max(0.01, k));
  }
}

/** 12. A little fire demon with big eyes, sat on a log: he flickers, hops his log along, and flares up now and then. */
class Hearth extends Critter {
  private flame: THREE.Group;
  private tongues: THREE.Group[] = [];
  private embers: THREE.InstancedMesh;
  private flare = new Act(5, 10, 1.2);
  constructor() {
    const b = new Builder();
    // The log: bark round the side, pale rings at the ends, and a twig with a leaf.
    b.add(new THREE.CylinderGeometry(1, 1, 1, 9), '#7a4c2c', { pos: [0, 0.034, 0], rot: [0, 0, Math.PI / 2], scale: [0.034, 0.17, 0.034] });
    for (const s of [-1, 1]) {
      b.add(new THREE.CylinderGeometry(1, 1, 1, 9), '#e3b984', { pos: [s * 0.0855, 0.034, 0], rot: [0, 0, Math.PI / 2], scale: [0.03, 0.002, 0.03] });
      b.add(new THREE.TorusGeometry(1, 0.12, 3, 10), '#b98a55', { pos: [s * 0.087, 0.034, 0], rot: [0, Math.PI / 2, 0], scale: 0.016 });
    }
    tube(b, [[0.05, 0.06, 0.02], [0.058, 0.08, 0.03], [0.07, 0.092, 0.034]], 0.0035, '#7a4c2c', 4);
    b.add(gem(), '#6aa84a', { pos: [0.075, 0.096, 0.036], rot: [0, 0, -0.6], scale: [0.012, 0.005, 0.008] });
    // Eyes and a grin on the yellow heart of the flame.
    const fy = 0.06;
    const e = new Builder();
    for (const s of [-1, 1]) {
      e.add(gem(), '#fffdf8', { pos: [s * 0.021, 0.118, 0.047], scale: [0.019, 0.022, 0.01] });
      e.add(bead(), INK, { pos: [s * 0.019, 0.115, 0.056], scale: [0.009, 0.011, 0.005] });
      e.add(new THREE.IcosahedronGeometry(1, 0), '#ffffff', { pos: [s * 0.019 + 0.004, 0.12, 0.06], scale: 0.0032 });
    }
    super(b, e, 0.118);
    const fb = new Builder();
    fb.addColored(
      sculpted('hearth-flame', () => {
        const s = new Sculpt();
        s.add(ellipsoid('body', [0, 0.105, 0], [0.06, 0.052, 0.05], { name: 'flame' }));
        s.add(rod('body', [0, 0.12, -0.004], [0, 0.215, -0.014], 0.048, 0.005, { k: 0.03, name: 'flame' }));
        for (const x of [-1, 1]) s.add(rod('body', [x * 0.042, 0.12, 0], [x * 0.066, 0.168, -0.006], 0.018, 0.004, { k: 0.02, name: 'flame' }));
        s.add(flatBase(fy));
        return { sc: s, marks: { base: '#ff6a1f', marks: [] } };
      }, 0.016),
    );
    this.flame = this.piece(fb, [0, fy, 0], this.bodyGroup, glow('#ff6a1f', 0.9));
    const ib = new Builder();
    ib.addColored(
      sculpted('hearth-heart', () => {
        const s = new Sculpt();
        s.add(ellipsoid('body', [0, 0.1, 0.012], [0.044, 0.042, 0.042], { name: 'heart' }));
        s.add(rod('body', [0, 0.11, 0.008], [0, 0.17, -0.002], 0.034, 0.005, { k: 0.02, name: 'heart' }));
        s.add(flatBase(fy));
        return { sc: s, marks: { base: '#ffd23a', marks: [] } };
      }, 0.015),
    );
    this.piece(ib, [0, fy, 0], this.flame, glow('#ffcf3a', 1.05));
    const mb = new Builder();
    arc(mb, [0, 0.09, 0.053], 0.014, '#6e2410', false, Math.PI * 0.9);
    this.piece(mb, [0, fy, 0], this.flame, soft());
    this.eyesOn(this.flame);
    // Extra tongues of flame that lick up on their own.
    for (const [x, z, h, lean] of [[0.024, -0.02, 0.07, -0.25], [-0.03, -0.012, 0.055, 0.35]]) {
      const tb = new Builder();
      tb.add(spike(6), '#ff8a2a', { pos: [x, 0.15 + h / 2, z], rot: [0, 0, lean], scale: [0.017, h, 0.015] });
      this.tongues.push(this.piece(tb, [x, 0.15, z], this.flame, glow('#ff8a2a', 1)));
    }
    const eb = new Builder();
    eb.add(pip(), '#ffd36a', { scale: 0.004 });
    this.embers = this.copies(eb, 4, glow('#ffb347', 1.4));
  }
  protected animate(dt: number, t: number, move: number) {
    const f = this.flare.step(dt, move < 0.3);
    const big = bell(f) * 0.35;
    // Flickers all the while; on the move, the log hops along and the flame streams back.
    this.bodyGroup.position.y = hop(t, move, 0.04, 10);
    this.bodyGroup.rotation.x = move * 0.08;
    this.flame.scale.set(1 + Math.sin(t * 11) * 0.03 + big * 0.5, 1 + Math.sin(t * 13 + 1) * 0.06 + Math.sin(t * 23) * 0.03 + big, 1 + big * 0.5);
    this.flame.rotation.set(-move * 0.3 + Math.sin(t * 2.3) * 0.04, 0, Math.sin(t * 3) * 0.06);
    this.tongues.forEach((tg, i) => {
      tg.scale.y = 0.7 + Math.abs(Math.sin(t * (9 + i * 4) + i)) * 0.6;
      tg.rotation.z = Math.sin(t * (5 + i)) * 0.15;
    });
    for (let i = 0; i < 4; i++) {
      const u = (t * 0.45 + i / 4) % 1;
      const s = 1 - u;
      placeCopy(this.embers, i, [Math.sin(i * 2.7 + t * 2) * 0.03 + (i - 1.5) * 0.012, 0.19 + u * 0.11, -move * u * 0.15 + Math.cos(i * 1.7) * 0.015], [t, t * 1.3, 0], [s, s, s]);
    }
    this.embers.instanceMatrix.needsUpdate = true;
  }
}

/** 13. A fluffy black platypus-mole with an eye for anything shiny: it scurries, sniffs, and pockets a gold coin now and then. */
class Niffler extends Critter {
  private head: THREE.Group;
  private arms: THREE.Group[] = [];
  private coin: THREE.Group;
  private snatch = new Act(4, 9, 3.2);
  constructor() {
    const fur = '#322d37';
    const sc = new Sculpt();
    sc.add(ellipsoid('body', [0, 0.08, -0.012], [0.068, 0.064, 0.082], { name: 'body' }));
    for (const s of [-1, 1]) sc.add(ellipsoid('body', [s * 0.044, 0.018, -0.06], [0.02, 0.018, 0.024], { k: 0.015, name: 'paw' }));
    sc.add(flatBase());
    const pouch = frontZ(sc, 0, 0.06);
    const b = new Builder();
    b.addColored(
      sculpted('niffler', () => ({
        sc,
        marks: { base: fur, marks: [{ color: '#4a4350', f: patch([0, 0.06, pouch], [0.04, 0.03, 0.02]) }, { color: '#cfa9a0', f: regionOf(sc, 'paw') }] },
      }), 0.02),
    );
    // Fluff all over the back and sides.
    const c: Vec3 = [0, 0.08, -0.012];
    for (let i = 0; i < 36; i++) {
      const y = 1 - (2 * (i + 0.5)) / 36;
      const r = Math.sqrt(1 - y * y);
      const d = new THREE.Vector3(Math.cos(i * 2.39996) * r, y, Math.sin(i * 2.39996) * r);
      if (d.y < -0.35 || (d.z > 0.5 && d.y < 0.4)) continue;
      cone(b, [c[0] + d.x * 0.064, c[1] + d.y * 0.06, c[2] + d.z * 0.078], [d.x, d.y + 0.3, d.z - 0.3], 0.022, 0.009, i % 3 ? '#3b3542' : fur, 4);
    }
    // The head, with its flat leathery bill, on its own pivot so it can sniff and nod.
    const hs = new Sculpt();
    hs.add(ellipsoid('body', [0, 0.125, 0.058], [0.05, 0.046, 0.048], { name: 'head' }));
    hs.add(ellipsoid('body', [0, 0.112, 0.113], [0.029, 0.011, 0.038], { rot: [-0.12, 0, 0], k: 0.012, name: 'bill' }));
    const hb = new Builder();
    hb.addColored(
      sculpted('niffler-head', () => ({
        sc: hs,
        marks: { base: fur, marks: [{ color: '#5d5359', f: regionOf(hs, 'bill') }, { color: '#4b4452', f: either(patch([0.026, 0.138, 0.096], [0.015, 0.014, 0.014]), patch([-0.026, 0.138, 0.096], [0.015, 0.014, 0.014])) }] },
      }), 0.016),
    );
    for (const s of [-1, 1]) hb.add(bead(), '#2a2428', { pos: [s * 0.008, 0.12, 0.14], scale: [0.0035, 0.0025, 0.003] });
    for (const [x, lean] of [[-0.012, -0.4], [0, 0], [0.012, 0.4]]) cone(hb, [x, 0.165, 0.05], [lean, 1, -0.3], 0.02, 0.006, '#3b3542', 4);
    const e = new Builder();
    addEyes(e, 0.138, frontZ(hs, 0.026, 0.138) - 0.003, 0.026, 0.0115);
    super(b, e, 0.138);
    this.head = this.piece(hb, [0, 0.105, 0.03]);
    this.eyesOn(this.head);
    // Little pink-palmed arms with claws, to hold the treasure.
    for (const s of [-1, 1]) {
      const ab = new Builder();
      tube(ab, [[s * 0.045, 0.085, 0.045], [s * 0.04, 0.07, 0.07], [s * 0.026, 0.07, 0.088]], 0.008, fur, 4);
      ab.add(gem(), '#cfa9a0', { pos: [s * 0.023, 0.07, 0.092], scale: [0.009, 0.007, 0.009] });
      for (const d of [-0.004, 0.004]) ab.add(spike(3), '#efe6dc', { pos: [s * 0.021 + d, 0.068, 0.1], rot: [1.6, 0, 0], scale: [0.002, 0.008, 0.002] });
      this.arms.push(this.piece(ab, [s * 0.045, 0.085, 0.045]));
    }
    const cb = new Builder();
    cb.add(new THREE.CylinderGeometry(1, 1, 1, 12), '#f5c542', { rot: [Math.PI / 2, 0, 0], scale: [0.024, 0.005, 0.024] });
    cb.add(new THREE.TorusGeometry(1, 0.12, 3, 12), '#d9a52a', { pos: [0, 0, 0.003], scale: 0.017 });
    this.coin = this.piece(cb, [0, 0, 0]);
    this.coin.visible = false;
  }
  protected animate(dt: number, t: number, move: number) {
    // The treasure: a coin turns up in its paws, gets admired (and spun), then tucked into the pouch with a pat.
    const s = this.snatch.step(dt, move < 0.2);
    const hold = s < 0 ? 0 : ease(s, 0, 0.1) * (1 - ease(s, 0.55, 0.7));
    const tuck = s < 0 ? 0 : ease(s, 0.55, 0.7);
    const pat = s < 0 ? 0 : ease(s, 0.68, 0.72) * (1 - ease(s, 0.92, 1));
    this.coin.visible = s >= 0 && s < 0.72;
    this.coin.position.set(0, 0.092 - tuck * 0.035 + Math.sin(t * 6) * 0.004 * hold, 0.098 - tuck * 0.02);
    this.coin.rotation.set(0, hold > 0.9 ? t * 6 : 0, 0);
    this.coin.scale.setScalar(Math.max(0.01, s < 0 ? 0 : ease(s, 0, 0.08) * (1 - tuck * 0.8)));
    // Scurries in a quick shuffle; still, its bill twitches as it sniffs about.
    const sniff = Math.max(0, Math.sin(t * 2.2)) * Math.sin(t * 22) * 0.06 * (1 - move);
    this.bodyGroup.position.y = hop(t, move, 0.025, 15);
    this.bodyGroup.rotation.set(move * 0.1, Math.sin(t * 15) * 0.06 * move, Math.sin(t * 8) * 0.06 * pat);
    const plump = 1 + pat * 0.05;
    this.bodyGroup.scale.set(plump, 1, plump);
    this.head.rotation.set(sniff + hold * 0.3 + move * 0.1, (1 - hold) * (Math.sin(t * 0.8) * 0.3 * (1 - move) + clamp(this.turn * 0.12, -0.4, 0.4)), 0);
    this.arms.forEach((arm, i) => {
      const side = i ? 1 : -1;
      arm.rotation.set(-hold * 0.5 + Math.sin(t * 15 + i * Math.PI) * 0.4 * move + Math.sin(t * 14) * 0.35 * pat, 0, -side * hold * 0.15);
    });
  }
}

/** 14. A teal platypus secret agent in a fedora, up on two legs: he waddles, chatters, and tips his hat now and then. */
class Platypus extends Critter {
  private head: THREE.Group;
  private hat: THREE.Group;
  private arm: THREE.Group;
  private feet: THREE.Group[] = [];
  private tail: THREE.Group;
  private chatter = new Act(3, 7, 0.7);
  private tip = new Act(6, 11, 1.8);
  constructor() {
    const teal = '#35b1a9';
    const orange = '#f39c34';
    const sc = new Sculpt();
    sc.add(ellipsoid('body', [0, 0.125, 0], [0.054, 0.074, 0.047], { name: 'body' }));
    sc.add(ellipsoid('body', [0.054, 0.14, 0.012], [0.014, 0.03, 0.016], { rot: [0, 0, 0.3], k: 0.012, name: 'arm' }));
    for (const s of [-1, 1]) sc.add(rod('body', [s * 0.025, 0.065, 0], [s * 0.027, 0.02, 0.004], 0.014, 0.012, { k: 0.015, name: 'leg' }));
    const b = new Builder();
    b.addColored(sculpted('platypus', () => ({ sc, marks: { base: teal, marks: [{ color: '#45c0b7', f: patch([0, 0.12, 0.04], [0.036, 0.05, 0.02]) }] } }), 0.018));
    const hs = new Sculpt();
    hs.add(ellipsoid('body', [0, 0.212, 0.004], [0.048, 0.042, 0.044], { name: 'head' }));
    hs.add(ellipsoid('body', [0, 0.196, 0.064], [0.034, 0.01, 0.036], { k: 0.012, name: 'bill' }));
    const hb = new Builder();
    hb.addColored(
      sculpted('platypus-head', () => ({
        sc: hs,
        marks: { base: teal, marks: [{ color: '#c9761c', f: both(regionOf(hs, 'bill'), (q) => Math.abs(q.p.y - 0.196) - 0.0015) }, { color: orange, f: regionOf(hs, 'bill') }] },
      }), 0.015),
    );
    // Half-shut, unimpressed agent's eyes.
    const e = new Builder();
    for (const s of [-1, 1]) {
      const z = frontZ(hs, s * 0.02, 0.228) - 0.004;
      e.add(gem(), '#fffdf8', { pos: [s * 0.02, 0.228, z], scale: [0.015, 0.017, 0.009] });
      e.add(bead(), INK, { pos: [s * 0.02, 0.225, z + 0.007], scale: [0.0065, 0.0075, 0.004] });
      e.add(gem(), '#2c9d96', { pos: [s * 0.02, 0.236, z + 0.001], rot: [0.2, 0, -s * 0.12], scale: [0.018, 0.01, 0.011] });
    }
    super(b, e, 0.228);
    this.head = this.piece(hb, [0, 0.18, 0]);
    this.eyesOn(this.head);
    // The fedora, tipped forward a touch.
    const hatAt = new THREE.Matrix4().compose(V([0, 0.252, -0.004]), new THREE.Quaternion().setFromEuler(new THREE.Euler(0.12, 0, 0.1)), new THREE.Vector3(1, 1, 1));
    const fb = new Builder();
    fb.add(new THREE.CylinderGeometry(1, 1, 1, 14), '#6e4b2e', { scale: [0.056, 0.005, 0.054] }, hatAt);
    fb.add(new THREE.CylinderGeometry(0.82, 1, 1, 12), '#7b5534', { pos: [0, 0.018, 0], scale: [0.034, 0.032, 0.032] }, hatAt);
    fb.add(new THREE.CylinderGeometry(1, 1, 1, 12), '#2f2219', { pos: [0, 0.008, 0], scale: [0.0345, 0.008, 0.0325] }, hatAt);
    fb.add(new THREE.BoxGeometry(1, 1, 1), '#5e3f26', { pos: [0, 0.034, 0], scale: [0.004, 0.004, 0.04] }, hatAt);
    this.hat = this.piece(fb, [0, 0.252, 0], this.head);
    // His right arm, free to reach up to the brim.
    const ab = new Builder();
    ab.addColored(
      sculpted('platypus-arm', () => {
        const a = new Sculpt();
        a.add(ellipsoid('body', [-0.054, 0.14, 0.012], [0.014, 0.03, 0.016], { rot: [0, 0, -0.3], name: 'arm' }));
        return { sc: a, marks: { base: teal, marks: [] } };
      }, 0.012),
    );
    this.arm = this.piece(ab, [-0.048, 0.165, 0.01]);
    for (const s of [-1, 1]) {
      const lb = new Builder();
      lb.add(gem(), orange, { pos: [s * 0.03, 0.005, 0.022], rot: [0, s * -0.2, 0], scale: [0.022, 0.006, 0.03] });
      this.feet.push(this.piece(lb, [s * 0.027, 0.012, 0]));
    }
    // A broad flat tail, down on the ground behind for balance.
    const tb = new Builder();
    tb.add(gem(), '#d9822b', { pos: [0, 0.016, -0.09], rot: [0.25, 0, 0], scale: [0.034, 0.008, 0.055] });
    for (const z of [-0.07, -0.09, -0.11]) tb.add(new THREE.BoxGeometry(1, 1, 1), '#b9691f', { pos: [0, 0.022 + (z + 0.09) * -0.25, z], rot: [0.25, 0, 0], scale: [0.05, 0.003, 0.003] });
    this.tail = this.piece(tb, [0, 0.05, -0.04]);
  }
  protected animate(dt: number, t: number, move: number) {
    const c = this.chatter.step(dt, move < 0.3);
    const tp = this.tip.step(dt, move < 0.2 && c < 0);
    const lift = tp < 0 ? 0 : ease(tp, 0, 0.3) * (1 - ease(tp, 0.7, 1));
    // An upright waddle; still, a cool sway, a chatter of the bill now and then, and a tip of the hat.
    const w = Math.sin(t * 10);
    const buzz = c < 0 ? 0 : Math.sin(t * 70) * 0.05 * bell(c);
    this.bodyGroup.position.y = Math.abs(w) * 0.008 * move;
    this.bodyGroup.rotation.set(move * 0.1 + lift * 0.08, 0, w * 0.08 * move + Math.sin(t * 1.1) * 0.03 * (1 - move));
    this.head.rotation.set(buzz + lift * 0.1, clamp(this.turn * 0.12, -0.4, 0.4) + Math.sin(t * 0.5) * 0.2 * (1 - move), buzz * 0.5);
    this.hat.position.y = 0.072 + lift * 0.016;
    this.hat.rotation.set(-lift * 0.35, 0, lift * 0.1);
    this.arm.rotation.set(-lift * 0.5, 0, -lift * 2.3 - w * 0.2 * move);
    this.feet.forEach((f, i) => {
      const s = i ? 1 : -1;
      f.position.y = 0.012 + Math.max(0, w * s) * 0.014 * move;
      f.rotation.x = -Math.max(0, w * s) * 0.4 * move;
    });
    this.tail.rotation.set(-(Math.max(0, Math.sin(t * 0.7)) ** 12) * 0.5 - move * 0.2, Math.sin(t * 10) * 0.1 * move, 0);
  }
}

/** 15. A golden retriever with a talking collar: he trots along wagging, and now and then freezes, staring off sideways. Squirrel! */
class Dug extends Critter {
  private head: THREE.Group;
  private ears: THREE.Group[] = [];
  private tongue: THREE.Group;
  private tail: THREE.Group;
  private legs: THREE.Group[] = [];
  private squirrel = new Act(5, 10, 2.4);
  private side = 1;
  private stride = 0;
  constructor() {
    const gold = '#dca24c';
    const cream = '#f3d79c';
    const sc = new Sculpt();
    sc.add(ellipsoid('body', [0, 0.125, -0.02], [0.054, 0.054, 0.092], { name: 'body' }));
    sc.add(ellipsoid('body', [0, 0.135, 0.05], [0.05, 0.056, 0.045], { k: 0.03, name: 'body' }));
    const b = new Builder();
    b.addColored(
      sculpted('dug', () => ({ sc, marks: { base: gold, marks: [{ color: cream, f: either(patch([0, 0.12, 0.09], [0.035, 0.045, 0.03]), (q) => q.p.y - 0.085) }] } }), 0.02),
    );
    // The red collar and its grey talking box.
    b.add(new THREE.TorusGeometry(1, 0.17, 5, 16), '#d23b33', { pos: [0, 0.172, 0.072], rot: [Math.PI / 2 - 0.55, 0, 0], scale: 0.042 });
    b.add(new THREE.BoxGeometry(1, 1, 1), '#9da3ab', { pos: [0, 0.143, 0.11], rot: [-0.55, 0, 0], scale: [0.024, 0.017, 0.012] });
    b.add(new THREE.CylinderGeometry(1, 1, 1, 8), '#4a4e55', { pos: [0, 0.141, 0.117], rot: [Math.PI / 2 - 0.55, 0, 0], scale: [0.005, 0.002, 0.005] });
    const hs = new Sculpt();
    hs.add(ellipsoid('body', [0, 0.218, 0.085], [0.05, 0.047, 0.048], { name: 'head' }));
    hs.add(ellipsoid('body', [0, 0.198, 0.13], [0.029, 0.025, 0.034], { k: 0.02, name: 'muzzle' }));
    const hb = new Builder();
    hb.addColored(
      sculpted('dug-head', () => ({ sc: hs, marks: { base: gold, marks: [{ color: '#f0cf8e', f: regionOf(hs, 'muzzle') }, { color: BLUSH, f: blushes(0.205, frontZ(hs, 0.035, 0.205), 0.035, 0.01) }] } }), 0.017),
    );
    const nz = frontZ(hs, 0, 0.206);
    hb.add(gem(), INK, { pos: [0, 0.206, nz + 0.002], scale: [0.012, 0.009, 0.009] });
    arc(hb, [0, 0.188, frontZ(hs, 0, 0.188)], 0.012, INK, false, Math.PI * 0.8);
    const e = new Builder();
    addEyes(e, 0.232, frontZ(hs, 0.022, 0.232) - 0.004, 0.022, 0.0115);
    super(b, e, 0.232);
    this.head = this.piece(hb, [0, 0.18, 0.07]);
    this.eyesOn(this.head);
    const tg = new Builder();
    tg.add(gem(), '#ef7f95', { pos: [0.004, 0.178, frontZ(hs, 0.004, 0.18) - 0.004], rot: [0.5, 0, 0], scale: [0.011, 0.004, 0.016] });
    this.tongue = this.piece(tg, [0.004, 0.186, frontZ(hs, 0.004, 0.186) - 0.01], this.head);
    // Soft floppy ears.
    for (const s of [-1, 1]) {
      const eb = new Builder();
      eb.addColored(
        sculpted(`dug-ear${s}`, () => {
          const es = new Sculpt();
          es.add(ellipsoid('body', [s * 0.052, 0.208, 0.078], [0.012, 0.038, 0.026], { rot: [0, 0, s * 0.18], name: 'ear' }));
          return { sc: es, marks: { base: '#c98a35', marks: [] } };
        }, 0.012),
      );
      this.ears.push(this.piece(eb, [s * 0.046, 0.238, 0.078], this.head));
    }
    // Four legs, trotting in diagonal pairs.
    const leg = sculpted('dug-leg', () => {
      const l = new Sculpt();
      l.add(rod('body', [0, 0.11, 0], [0, 0.016, 0.004], 0.019, 0.015, { name: 'leg' }));
      l.add(ellipsoid('body', [0, 0.012, 0.01], [0.017, 0.012, 0.021], { k: 0.01, name: 'paw' }));
      l.add(flatBase());
      return { sc: l, marks: { base: gold, marks: [{ color: cream, f: regionOf(l, 'paw') }] } };
    }, 0.014);
    for (const [x, z] of [[-0.033, 0.05], [0.033, 0.05], [-0.033, -0.078], [0.033, -0.078]]) {
      const lb = new Builder();
      lb.addColored(leg, { pos: [x, 0, z] });
      this.legs.push(this.piece(lb, [x, 0.11, z]));
    }
    // A feathery plume of a tail.
    const tb = new Builder();
    tube(tb, [[0, 0.15, -0.1], [0, 0.18, -0.13], [0, 0.215, -0.135], [0, 0.235, -0.12]], 0.012, gold, 6);
    for (const [y, z] of [[0.175, -0.135], [0.205, -0.143]]) tb.add(gem(), cream, { pos: [0, y, z], scale: [0.009, 0.016, 0.009] });
    this.tail = this.piece(tb, [0, 0.15, -0.1]);
  }
  protected animate(dt: number, t: number, move: number) {
    const sq = this.squirrel.step(dt, move < 0.2);
    if (sq === 0) this.side = Math.random() < 0.5 ? -1 : 1;
    // The freeze: head snaps round, ears up, tongue in, tail stops dead, then back to happy as if nothing happened.
    const frozen = sq < 0 ? 0 : ease(sq, 0, 0.06) * (1 - ease(sq, 0.85, 1));
    const happy = 1 - frozen;
    this.stride += dt * (12 + clamp(this.speed, 0, 8)) * move;
    const w = Math.sin(this.stride);
    this.bodyGroup.position.y = Math.abs(w) * 0.01 * move + Math.sin(t * 6) * 0.002 * happy;
    this.bodyGroup.rotation.set(move * 0.04, this.side * frozen * 0.15, 0);
    this.legs.forEach((leg, i) => {
      const diag = i === 0 || i === 3 ? 1 : -1;
      leg.rotation.x = w * diag * 0.6 * move;
    });
    const pant = Math.sin(t * 9) * happy;
    this.head.rotation.set(-frozen * 0.12 + pant * 0.025 + move * 0.06, this.side * frozen * 1.15 + happy * clamp(this.turn * 0.12, -0.4, 0.4), this.side * frozen * 0.1 + Math.sin(t * 0.7) * 0.1 * happy * (1 - move));
    this.tongue.scale.set(1, 1, Math.max(0.05, happy * (0.9 + pant * 0.15)));
    this.ears.forEach((ear, i) => {
      const s = i ? 1 : -1;
      ear.rotation.set(-frozen * 0.3, 0, s * (frozen * 0.5 + Math.sin(this.stride * 2) * 0.12 * move));
    });
    this.tail.rotation.set(-0.2 * happy, Math.sin(t * (14 + move * 6)) * 0.45 * happy, 0);
  }
}

/** The fifth set's makers, for pets.ts's list. */
export const PETS5_MAKERS = {
  eggprobe: () => new EggProbe(),
  nursebot: () => new NurseBot(),
  hedgehog: () => new Hedgehog(),
  chomper: () => new Chomper(),
  fairy: () => new Fairy(),
  moogle: () => new Moogle(),
  cactus: () => new Cactus(),
  bean: () => new Bean(),
  turret: () => new Turret(),
  catbus: () => new CatBus(),
  faceless: () => new Faceless(),
  hearth: () => new Hearth(),
  niffler: () => new Niffler(),
  platypus: () => new Platypus(),
  dug: () => new Dug(),
};
