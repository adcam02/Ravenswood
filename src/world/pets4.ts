import * as THREE from 'three';
import { Builder, glow, type Vec3 } from './build';
import { regionOf, type Field } from './forms';
import { Act, BLUSH, Critter, INK, addEyes, bead, bell, blushes, both, clamp, cutout, either, flatBase, frontZ, gem, hop, irisEyes, onFront, onSurface, patch, pip, placeCopy, sculpted, sph, spike, spots, tube, V } from './petkit';
import { Sculpt, ellipsoid, pyramid, rod } from './sculpt';

/**
 * Pop-culture pets, a third set: fond storybook takes on cartoon, game and film favourites. Each is a Critter
 * (pieces on pivots, eyes that ride on a head) with an idle, a walk and a little act of its own.
 */

/** A frame on a sculpt's front at (x, y), scaled: for features that should sit flat on the surface (eyes, a nose). */
const stuck = (sc: Sculpt, x: number, y: number, lift: number, scale: Vec3) => onSurface(sc, x, y, lift).multiply(new THREE.Matrix4().makeScale(...scale));
/** Eased in and out, 0 to 1. */
const ease = (u: number) => {
  const v = clamp(u, 0, 1);
  return v * v * (3 - 2 * v);
};
/** A point along a smooth curve through some points (u from 0 to 1). */
const along = (pts: Vec3[], u: number): Vec3 => new THREE.CatmullRomCurve3(pts.map(V)).getPointAt(u).toArray() as Vec3;
/** Dark bands round a tube (a ringed or striped tail), `n` of them along its curve. */
function bands(b: Builder, pts: Vec3[], r: number, color: string, n: number, from = 0.15, to = 0.9) {
  const curve = new THREE.CatmullRomCurve3(pts.map(V));
  for (let i = 0; i < n; i++) {
    const u = from + ((to - from) * i) / Math.max(1, n - 1);
    const p = curve.getPointAt(u);
    const d = curve.getTangentAt(u);
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), d);
    const m = new THREE.Matrix4().compose(p, q, new THREE.Vector3(r * 1.12, r * 1.12, r * 0.55));
    b.add(new THREE.CylinderGeometry(1, 1, 1, 8, 1).rotateX(Math.PI / 2), color, m);
  }
}
/** A flame: a round base drawn up into a point, `h` tall. */
function flame(b: Builder, at: Vec3, r: number, h: number, color: string) {
  b.add(gem(), color, { pos: at, scale: r });
  b.add(spike(7), color, { pos: [at[0], at[1] + h * 0.45, at[2]], scale: [r * 0.98, h, r * 0.98] });
}
/** A little music note (a head, a stem, a flag), standing in the x-y plane with its foot at the origin. */
function note(b: Builder, color: string) {
  b.add(bead(), color, { pos: [0, 0, 0], rot: [0, 0, 0.4], scale: [0.011, 0.008, 0.005] });
  b.add(new THREE.BoxGeometry(1, 1, 1), color, { pos: [0.009, 0.016, 0], scale: [0.0026, 0.032, 0.003] });
  b.add(new THREE.BoxGeometry(1, 1, 1), color, { pos: [0.015, 0.029, 0], rot: [0, 0, -0.6], scale: [0.012, 0.0035, 0.003] });
}

/** 1. A white beagle with black ears who walks on his hind legs, and, left alone a while, pops up his little red doghouse and lies on its roof. */
class Doghouse extends Critter {
  private ears: THREE.Group[] = [];
  private arms: THREE.Group[] = [];
  private house: THREE.Group;
  private shut: THREE.Group;
  private still = 0;
  private rest = 0;
  /** The roof's ridge, where he lies. */
  private static RIDGE = 0.17;
  constructor() {
    const white = '#fbf8f1';
    const sc = new Sculpt();
    sc.add(ellipsoid('body', [0, 0.085, -0.008], [0.048, 0.06, 0.044], { name: 'body' }));
    sc.add(ellipsoid('body', [0, 0.056, 0.0], [0.054, 0.042, 0.048], { k: 0.03, name: 'body' }));
    for (const s of [-1, 1]) sc.add(ellipsoid('body', [s * 0.027, 0.012, 0.02], [0.021, 0.013, 0.034], { k: 0.012, name: 'foot' }));
    sc.add(rod('body', [0, 0.13, -0.008], [0, 0.17, -0.006], 0.027, 0.03, { k: 0.02, name: 'body' }));
    sc.add(ellipsoid('body', [0, 0.208, -0.012], [0.054, 0.052, 0.052], { k: 0.03, name: 'head' }));
    sc.add(ellipsoid('body', [0, 0.2, 0.048], [0.038, 0.034, 0.056], { rot: [-0.15, 0, 0], k: 0.035, name: 'snout' }));
    sc.add(rod('body', [0, 0.07, -0.045], [0, 0.098, -0.07], 0.011, 0.008, { k: 0.012, name: 'tail' }));
    sc.add(flatBase());
    const b = new Builder();
    b.addColored(sculpted('doghouse', () => ({ sc, marks: { base: white, marks: [{ color: '#ece6da', f: regionOf(sc, 'foot') }] } }), 0.019));
    b.add(gem(), INK, { pos: [0, 0.216, frontZ(sc, 0, 0.216) - 0.004], scale: [0.017, 0.014, 0.014] });
    tube(b, onFront(sc, [[-0.026, 0.188], [-0.012, 0.18], [0.006, 0.18], [0.022, 0.186]], 0.001), 0.0019, INK, 4);
    // A red collar.
    b.add(new THREE.TorusGeometry(1, 0.2, 5, 16), '#d63a2f', { pos: [0, 0.152, -0.006], rot: [Math.PI / 2 - 0.1, 0, 0], scale: [0.031, 0.031, 0.034] });
    const e = new Builder();
    for (const s of [-1, 1]) e.add(gem(), INK, stuck(sc, s * 0.017, 0.236, 0.001, [0.0055, 0.011, 0.004]));
    super(b, e, 0.236);
    // Eyes shut for his nap: two little lines.
    const zb = new Builder();
    for (const s of [-1, 1]) tube(zb, onFront(sc, [[s * 0.011, 0.234], [s * 0.017, 0.232], [s * 0.023, 0.234]], 0.002), 0.0016, INK, 4);
    this.shut = this.piece(zb, [0, 0.234, 0.04]);
    this.shut.visible = false;
    // Long black ears, hung from the top of his head.
    for (const s of [-1, 1]) {
      const eb = new Builder();
      eb.addColored(
        sculpted(`doghouse-ear${s}`, () => {
          const ear = new Sculpt();
          ear.add(ellipsoid('body', [s * 0.006, -0.036, 0], [0.012, 0.042, 0.025], { rot: [0.1, 0, s * 0.12] }));
          return { sc: ear, marks: { base: '#2a2426', marks: [] } };
        }, 0.012),
        { pos: [s * 0.05, 0.238, -0.016] },
      );
      this.ears.push(this.piece(eb, [s * 0.05, 0.238, -0.016]));
    }
    for (const s of [-1, 1]) {
      const ab = new Builder();
      ab.addColored(
        sculpted('doghouse-arm', () => {
          const arm = new Sculpt();
          arm.add(rod('body', [0.0, 0.0, 0], [0.012, -0.042, 0.012], 0.012, 0.011));
          return { sc: arm, marks: { base: white, marks: [] } };
        }, 0.012),
        { pos: [s * 0.046, 0.125, 0.0], scale: [s, 1, 1] },
      );
      this.arms.push(this.piece(ab, [s * 0.046, 0.125, 0.0]));
    }
    // The doghouse: red walls, a pitched roof with its ridge front to back, and a dark arched door.
    const hb = new Builder();
    const red = '#d23b2f';
    const W = 0.075;
    const H = 0.1;
    hb.add(new THREE.BoxGeometry(1, 1, 1), red, { pos: [0, H / 2, 0], scale: [W * 2, H, 0.2] });
    const gable = cutout([[-W, 0], [W, 0], [0, Doghouse.RIDGE - H]], 0.2);
    hb.add(gable, red, { pos: [0, H, 0] });
    gable.dispose();
    const slope = Math.atan2(Doghouse.RIDGE - H, W);
    const len = Math.hypot(W, Doghouse.RIDGE - H) + 0.016;
    for (const s of [-1, 1]) hb.add(new THREE.BoxGeometry(1, 1, 1), '#b12d24', { pos: [(s * W) / 2 + s * 0.004, H + (Doghouse.RIDGE - H) / 2 + 0.007, 0], rot: [0, 0, -s * slope], scale: [len, 0.012, 0.226] });
    const door = new THREE.Shape();
    door.moveTo(-0.026, 0);
    door.lineTo(0.026, 0);
    door.lineTo(0.026, 0.05);
    door.absarc(0, 0.05, 0.026, 0, Math.PI, false);
    door.lineTo(-0.026, 0);
    const dg = cutout(door, 0.004, 6);
    hb.add(dg, '#2a1c1a', { pos: [0, 0.002, 0.1] });
    dg.dispose();
    this.house = this.piece(hb, [0, 0, 0], this.root);
    this.house.visible = false;
  }
  protected animate(dt: number, t: number, move: number) {
    // Still for a while, the house comes up and he hops onto it; moving off, he hops down and it goes.
    this.still = move < 0.05 ? this.still + dt : 0;
    this.rest = clamp(this.rest + (this.still > 1.6 ? dt * 0.9 : -dt * 3), 0, 1);
    const a = clamp(this.rest * 2, 0, 1);
    const up = ease(this.rest * 2 - 1);
    const pop = a <= 0 ? 0 : 1 + 2.7 * Math.pow(a - 1, 3) + 1.7 * Math.pow(a - 1, 2);
    this.house.visible = a > 0.01;
    this.house.scale.set(Math.max(0.01, pop), Math.max(0.01, pop), Math.max(0.01, pop));
    const lying = up >= 1;
    // On his back along the ridge, feet up, his back on the roof.
    const walk = t * 12;
    const breathe = Math.sin(t * 1.8);
    this.bodyGroup.position.set(0, hop(t, move, 0.022, 12) * (1 - up) + up * (Doghouse.RIDGE + 0.04) + Math.sin(Math.PI * up) * 0.06 + (lying ? breathe * 0.002 : 0), up * 0.125);
    this.bodyGroup.rotation.set(-up * Math.PI * 0.5 + move * 0.05, 0, Math.sin(walk) * 0.07 * move + Math.sin(t * 1.3) * 0.04 * (1 - move) * (1 - up));
    this.eyes.visible = !lying;
    this.shut.visible = lying;
    this.ears.forEach((ear, i) => {
      const s = i ? 1 : -1;
      ear.rotation.set(up * 1.3 + Math.abs(Math.sin(walk)) * 0.3 * move, 0, s * (0.08 + Math.abs(Math.sin(walk + i)) * 0.35 * move + up * 0.2));
    });
    this.arms.forEach((arm, i) => {
      const s = i ? 1 : -1;
      arm.rotation.set(Math.sin(walk + i * Math.PI) * 0.7 * move - up * 0.6, 0, s * (0.15 + up * 0.5 + (lying ? Math.sin(t * 1.1 + i) * 0.05 : 0)));
    });
  }
}

/** 2. A fat orange striped cat with heavy eyelids, who waddles along at his own pace and yawns hugely when he stops. */
class Lasagne extends Critter {
  private head: THREE.Group;
  private mouth: THREE.Group;
  private legs: THREE.Group[] = [];
  private arms: THREE.Group[] = [];
  private tail: THREE.Group;
  private yawn = new Act(4, 9, 2.6);
  constructor() {
    const orange = '#f2943a';
    const stripe = '#4a2a18';
    const cream = '#fbe2a4';
    const sc = new Sculpt();
    sc.add(ellipsoid('body', [0, 0.085, -0.005], [0.066, 0.072, 0.06], { name: 'body' }));
    const b = new Builder();
    b.addColored(
      sculpted(
        'lasagne',
        () => ({
          sc,
          marks: {
            base: orange,
            marks: [
              { color: '#f8c070', f: patch([0, 0.075, 0.05], [0.045, 0.05, 0.03]) },
              // Stripes across his back.
              { color: stripe, f: (q) => Math.max(q.p.z + 0.015 - Math.abs(q.p.x) * 0.3, Math.abs(Math.sin(q.p.y * 95)) - 0.3, q.p.y - 0.14) },
            ],
          },
        }),
        0.018,
      ),
    );
    // The head: wide, with plump cheeks, small ears and three stripes on top.
    const hs = new Sculpt();
    hs.add(ellipsoid('body', [0, 0.205, 0.008], [0.074, 0.06, 0.058], { name: 'head' }));
    for (const s of [-1, 1]) hs.add(ellipsoid('body', [s * 0.023, 0.183, 0.054], [0.03, 0.022, 0.022], { k: 0.014, name: 'cheek' }));
    for (const s of [-1, 1]) hs.add(pyramid('body', [s * 0.046, 0.24, -0.004], 0.016, 0.028, 0.008, { round: 0.002, rot: [0, 0, -s * 0.42], k: 0.01, name: 'ear' }));
    const e = new Builder();
    // Big eyes side by side, the lids half down.
    const ez = frontZ(hs, 0.019, 0.226);
    for (const s of [-1, 1]) {
      e.add(gem(), '#fffdf8', { pos: [s * 0.019, 0.226, ez - 0.008], scale: [0.02, 0.025, 0.013] });
      e.add(gem(), INK, { pos: [s * 0.012, 0.217, ez + 0.003], scale: [0.0065, 0.0065, 0.004] });
      e.add(new THREE.SphereGeometry(1, 12, 5, 0, Math.PI * 2, 0, Math.PI / 2), orange, { pos: [s * 0.019, 0.224, ez - 0.008], rot: [0.12, 0, -s * 0.14], scale: [0.0215, 0.027, 0.0145] });
      e.add(new THREE.TorusGeometry(1, 0.1, 4, 14, Math.PI), stripe, { pos: [s * 0.019, 0.224, ez - 0.008], rot: [Math.PI / 2 + 0.12, 0, -s * 0.14], scale: [0.0215, 0.0145, 0.02] });
    }
    super(b, e, 0.226);
    const hb = new Builder();
    hb.addColored(
      sculpted(
        'lasagne-head',
        () => ({
          sc: hs,
          marks: {
            base: orange,
            marks: [
              { color: '#f5a0a8', f: both(regionOf(hs, 'ear'), (q) => 0.0 - q.p.z) },
              { color: cream, f: regionOf(hs, 'cheek') },
              { color: stripe, f: (q) => Math.max(q.p.y - 0.255 > 0 ? -1 : 0.255 - q.p.y, Math.min(Math.abs(q.p.x), Math.abs(Math.abs(q.p.x) - 0.018)) - 0.0035, -q.p.z - 0.01) },
            ],
          },
        }),
        0.015,
      ),
    );
    hb.add(gem(), '#ef8fa0', { pos: [0, 0.2, frontZ(hs, 0, 0.2) + 0.002], scale: [0.011, 0.007, 0.007] });
    for (const s of [-1, 1]) for (const [dx, dy] of [[0.015, 0.188], [0.025, 0.184], [0.02, 0.178]]) hb.add(bead(), INK, { pos: [s * dx, dy, frontZ(hs, s * dx, dy)], scale: 0.0018 });
    this.head = this.piece(hb, [0, 0.15, 0.0]);
    this.eyesOn(this.head);
    const mb = new Builder();
    mb.add(gem(), '#8a2f3a', { pos: [0, 0.166, frontZ(hs, 0, 0.166) - 0.004], scale: [0.02, 0.016, 0.008] });
    mb.add(gem(), '#e86a7c', { pos: [0, 0.162, frontZ(hs, 0, 0.166) - 0.002], scale: [0.012, 0.007, 0.006] });
    this.mouth = this.piece(mb, [0, 0.172, 0.06], this.head);
    this.mouth.scale.setScalar(0.01);
    // Stubby legs and big feet.
    const leg = sculpted('lasagne-leg', () => {
      const l = new Sculpt();
      l.add(rod('body', [0, 0.04, 0], [0, 0.014, 0.004], 0.022, 0.02, { name: 'leg' }));
      l.add(ellipsoid('body', [0, 0.012, 0.016], [0.024, 0.013, 0.032], { k: 0.012, name: 'foot' }));
      l.add(flatBase());
      return { sc: l, marks: { base: orange, marks: [{ color: '#f8c070', f: (q) => q.p.y - 0.01 }] } };
    }, 0.014);
    for (const s of [-1, 1]) {
      const lb = new Builder();
      lb.addColored(leg, { pos: [s * 0.034, 0, 0.005] });
      this.legs.push(this.piece(lb, [s * 0.034, 0.04, 0.005]));
      const ab = new Builder();
      tube(ab, [[s * 0.055, 0.12, 0.01], [s * 0.066, 0.095, 0.025], [s * 0.06, 0.08, 0.04]], 0.011, orange, 6);
      this.arms.push(this.piece(ab, [s * 0.055, 0.12, 0.01]));
    }
    // A long tail, striped, curling up behind.
    const tp: Vec3[] = [[0, 0.05, -0.055], [0.025, 0.04, -0.1], [0.05, 0.07, -0.125], [0.05, 0.115, -0.12]];
    const tb = new Builder();
    tube(tb, tp, 0.011, orange, 6);
    bands(tb, tp, 0.011, stripe, 3, 0.35, 0.95);
    this.tail = this.piece(tb, [0, 0.05, -0.055]);
  }
  protected animate(dt: number, t: number, move: number) {
    const y = this.yawn.step(dt, move < 0.2);
    const wide = y < 0 ? 0 : Math.min(1, bell(y) * 1.8);
    // A slow, heavy waddle; still, a sleepy nod.
    const w = t * 7;
    this.bodyGroup.position.y = Math.abs(Math.sin(w)) * 0.012 * move;
    this.bodyGroup.rotation.set(move * 0.05, 0, Math.sin(w) * 0.09 * move);
    this.legs.forEach((leg, i) => (leg.rotation.x = Math.sin(w + i * Math.PI) * 0.5 * move));
    const nod = Math.pow(Math.max(0, Math.sin(t * 0.7)), 6) * 0.18 * (1 - move);
    this.head.rotation.set(nod - wide * 0.45, Math.sin(t * 0.5) * 0.15 * (1 - move), Math.sin(w) * -0.05 * move + wide * 0.08);
    this.mouth.scale.setScalar(Math.max(0.01, wide));
    this.arms.forEach((arm, i) => {
      const s = i ? 1 : -1;
      arm.rotation.set(Math.sin(w + i * Math.PI) * 0.4 * move - wide * 2.2, 0, s * wide * 0.4);
    });
    this.tail.rotation.set(0, Math.sin(t * 1.2) * 0.3, Math.sin(t * 2.3) * 0.08);
  }
}

/** 3. A round pink balloon puff with a curl on her brow and a little microphone, who sings now and then (notes and all). */
class Lullaby extends Critter {
  private arms: THREE.Group[] = [];
  private mouth: THREE.Group;
  private notes: THREE.Group[] = [];
  private song = new Act(4, 9, 3.6);
  constructor() {
    const pink = '#f8b8cc';
    const sc = new Sculpt();
    sc.add(ellipsoid('body', [0, 0.105, 0], [0.094, 0.092, 0.088], { name: 'body' }));
    for (const s of [-1, 1]) {
      sc.add(pyramid('body', [s * 0.05, 0.172, 0.0], 0.03, 0.05, 0.014, { round: 0.002, rot: [0, 0, -s * 0.5], k: 0.012, name: 'ear' }));
      sc.add(ellipsoid('body', [s * 0.036, 0.013, 0.03], [0.026, 0.014, 0.032], { k: 0.012, name: 'foot' }));
    }
    sc.add(flatBase());
    const b = new Builder();
    b.addColored(
      sculpted(
        'lullaby',
        () => ({
          sc,
          marks: {
            base: pink,
            marks: [
              { color: '#3a2c38', f: both(regionOf(sc, 'ear'), (q) => -q.p.z - 0.002 + (0.21 - q.p.y) * 0.25) },
              { color: BLUSH, f: blushes(0.09, frontZ(sc, 0.06, 0.09), 0.06, 0.014) },
              { color: '#f4a3bb', f: regionOf(sc, 'foot') },
            ],
          },
        }),
        0.02,
      ),
    );
    // The curl on her brow.
    const cp: Vec3[] = [[0, 0.19, 0.04], [0, 0.212, 0.058], [0, 0.212, 0.085], [0, 0.19, 0.096], [0, 0.174, 0.082], [0, 0.18, 0.068], [0, 0.192, 0.074]];
    tube(b, cp, 0.0085, pink, 6);
    b.add(gem(), pink, { pos: cp[cp.length - 1], scale: 0.008 });
    tube(b, onFront(sc, [[-0.012, 0.082], [0, 0.077], [0.012, 0.082]], 0.001), 0.0018, '#8a3a52', 4);
    const e = new Builder();
    irisEyes(e, 0.12, frontZ(sc, 0.038, 0.12) - 0.008, 0.038, 0.025, '#3c95b4', 0.5);
    super(b, e, 0.12);
    // A singing mouth, opened for the song.
    const mb = new Builder();
    mb.add(gem(), '#a8394f', { pos: [0, 0.074, frontZ(sc, 0, 0.074) - 0.003], scale: [0.013, 0.012, 0.006] });
    this.mouth = this.piece(mb, [0, 0.074, 0.085]);
    this.mouth.scale.setScalar(0.01);
    // Little arms; the right one holds the microphone.
    for (const s of [-1, 1]) {
      const ab = new Builder();
      ab.add(sph(8, 6), pink, { pos: [s * 0.09, 0.098, 0.025], scale: [0.016, 0.022, 0.017] });
      if (s > 0) {
        ab.add(new THREE.CylinderGeometry(1, 0.8, 1, 7), '#9aa2ad', { pos: [0.1, 0.11, 0.045], rot: [0.5, 0, 0], scale: [0.006, 0.04, 0.006] });
        ab.add(gem(), '#2e2a30', { pos: [0.1, 0.13, 0.057], scale: 0.0115 });
      }
      this.arms.push(this.piece(ab, [s * 0.082, 0.105, 0.015]));
    }
    // Notes that float up as she sings.
    ['#f06ea0', '#5aa8e6', '#f2bf3a'].forEach((c) => {
      const nb = new Builder();
      note(nb, c);
      const g = this.piece(nb, [0, 0, 0], this.root, glow(c, 0.5));
      g.scale.setScalar(0.01);
      g.visible = false;
      this.notes.push(g);
    });
  }
  protected animate(dt: number, t: number, move: number) {
    const s = this.song.step(dt, move < 0.2);
    const sing = s < 0 ? 0 : Math.min(1, bell(s) * 3);
    // Bouncing along like a balloon; still, a soft breath; singing, a sway in time.
    const air = hop(t, move, 0.05, 9);
    const land = move * Math.max(0, 0.012 - air) * 6;
    this.bodyGroup.position.y = air;
    this.bodyGroup.scale.set(1 + land + Math.sin(t * 2) * 0.012, 1 - land - Math.sin(t * 2) * 0.012, 1 + land);
    this.bodyGroup.rotation.set(move * 0.1 - sing * 0.08, Math.sin(t * 3) * 0.12 * sing, Math.sin(t * 3) * 0.12 * sing + Math.sin(t * 9) * 0.05 * move);
    this.mouth.scale.set(Math.max(0.01, sing * (0.8 + Math.abs(Math.sin(t * 7)) * 0.3)), Math.max(0.01, sing * (0.6 + Math.abs(Math.sin(t * 7)) * 0.5)), 1);
    this.arms.forEach((arm, i) => {
      const side = i ? 1 : -1;
      // The microphone comes up to her mouth; the other arm sweeps out with the tune.
      arm.rotation.set(-sing * (i ? 0.5 : 0.2) + Math.sin(t * 9 + i * Math.PI) * 0.3 * move, i ? -sing * 0.9 : 0, side * (0.1 + (i ? 0.6 : 0.5 + Math.sin(t * 3) * 0.2) * sing));
    });
    this.notes.forEach((n, i) => {
      const u = (t * 0.55 + i / 3) % 1;
      n.visible = sing > 0.3;
      const k = Math.min(1, bell(u) * 2) * sing;
      n.position.set(Math.sin(u * 5 + i * 2) * 0.05 + (i - 1) * 0.03, 0.2 + this.bodyGroup.position.y + u * 0.14, 0.03);
      n.rotation.z = Math.sin(t * 4 + i) * 0.25;
      n.scale.setScalar(Math.max(0.01, k));
    });
  }
}

/** 4. A teal toad on four stubby legs with a plant bulb on his back: it breathes as he goes, and now and then two vines wave out of it. */
class BulbToad extends Critter {
  private head: THREE.Group;
  private legs: THREE.Group[] = [];
  private bulb: THREE.Group;
  private vines: THREE.Group[] = [];
  private whip = new Act(4, 9, 2.4);
  constructor() {
    const teal = '#86d0bd';
    const spot = '#4e9c88';
    const sc = new Sculpt();
    sc.add(ellipsoid('body', [0, 0.078, -0.02], [0.068, 0.052, 0.078], { name: 'body' }));
    const b = new Builder();
    b.addColored(
      sculpted(
        'bulbtoad',
        () => ({
          sc,
          marks: { base: teal, marks: [{ color: spot, f: spots(31, 4, [0, 0.078, -0.02], [0.068, 0.052, 0.078], [0.016, 0.012, 0.016], (d) => d.y > -0.1 && Math.abs(d.x) > 0.3) }, { color: '#a6e0cf', f: (q) => q.p.y - 0.045 }] },
        }),
        0.018,
      ),
    );
    // A big wide head, with red eyes and a wide smile.
    const hs = new Sculpt();
    hs.add(ellipsoid('body', [0, 0.12, 0.07], [0.07, 0.056, 0.056], { name: 'head' }));
    for (const s of [-1, 1]) hs.add(pyramid('body', [s * 0.045, 0.162, 0.058], 0.017, 0.026, 0.01, { round: 0.002, rot: [0, 0, -s * 0.55], k: 0.01, name: 'ear' }));
    const e = new Builder();
    irisEyes(e, 0.128, frontZ(hs, 0.038, 0.128) - 0.006, 0.038, 0.017, '#d0383c', 0.5);
    super(b, e, 0.128);
    const hb = new Builder();
    hb.addColored(
      sculpted(
        'bulbtoad-head',
        () => ({
          sc: hs,
          marks: {
            base: teal,
            marks: [
              { color: spot, f: either(patch([0, 0.17, 0.07], [0.014, 0.01, 0.014]), patch([0.03, 0.163, 0.04], [0.011, 0.009, 0.012]), patch([-0.032, 0.16, 0.045], [0.01, 0.008, 0.011])) },
              { color: '#5aae9a', f: regionOf(hs, 'ear') },
            ],
          },
        }),
        0.016,
      ),
    );
    tube(hb, onFront(hs, [[-0.04, 0.108], [-0.02, 0.099], [0, 0.097], [0.02, 0.099], [0.04, 0.108]], 0.001), 0.0022, '#2c4a44', 4);
    for (const s of [-1, 1]) hb.add(bead(), '#2c4a44', { pos: [s * 0.008, 0.118, frontZ(hs, s * 0.008, 0.118)], scale: [0.003, 0.002, 0.002] });
    this.head = this.piece(hb, [0, 0.1, 0.04]);
    this.eyesOn(this.head);
    // Four short legs with three little claws.
    const leg = sculpted('bulbtoad-leg', () => {
      const l = new Sculpt();
      l.add(rod('body', [0, 0.045, 0], [0, 0.012, 0.006], 0.022, 0.02, { name: 'leg' }));
      l.add(flatBase());
      return { sc: l, marks: { base: teal, marks: [] } };
    }, 0.016);
    for (const [s, z] of [[-1, 0.03], [1, 0.03], [-1, -0.07], [1, -0.07]]) {
      const lb = new Builder();
      lb.addColored(leg, { pos: [s * 0.048, 0, z] });
      for (const dx of [-0.009, 0, 0.009]) lb.add(spike(4), '#f6f7ef', { pos: [s * 0.048 + dx, 0.006, z + 0.026], rot: [Math.PI / 2, 0, 0], scale: [0.0035, 0.008, 0.0035] });
      this.legs.push(this.piece(lb, [s * 0.048, 0.05, z]));
    }
    // The bulb: a green onion with darker leaf ribs, its tip drawn up into a point.
    const bc: Vec3 = [0, 0.15, -0.035];
    const bulb = sculpted('bulbtoad-bulb', () => {
      const bs = new Sculpt();
      bs.add(ellipsoid('body', bc, [0.052, 0.046, 0.05], { name: 'bulb' }));
      bs.add(rod('body', [0, 0.18, -0.04], [0, 0.212, -0.056], 0.022, 0.004, { k: 0.02, name: 'bulb' }));
      const rib: Field = (q) => Math.abs(Math.sin(Math.atan2(q.p.x - bc[0], q.p.z - bc[2]) * 2.5)) - 0.12;
      return { sc: bs, marks: { base: '#6fc256', marks: [{ color: '#4c9a3e', f: both(rib, (q) => 0.14 - q.p.y) }, { color: '#4c9a3e', f: (q) => 0.112 - q.p.y }] } };
    }, 0.016);
    const bb = new Builder();
    bb.addColored(bulb);
    this.bulb = this.piece(bb, [0, 0.11, -0.03]);
    for (const s of [-1, 1]) {
      const vb = new Builder();
      const vp: Vec3[] = [[s * 0.03, 0.14, -0.03], [s * 0.08, 0.17, -0.01], [s * 0.11, 0.21, 0.02], [s * 0.1, 0.24, 0.05]];
      tube(vb, vp, 0.0055, '#58a845', 5);
      for (const u of [0.45, 0.8]) {
        const p = along(vp, u);
        vb.add(sph(6, 4), '#7ccc5c', { pos: [p[0] + s * 0.006, p[1] + 0.006, p[2]], rot: [0, 0, -s * 0.6], scale: [0.012, 0.004, 0.007] });
      }
      const v = this.piece(vb, [s * 0.03, 0.14, -0.03]);
      v.scale.setScalar(0.01);
      v.visible = false;
      this.vines.push(v);
    }
  }
  protected animate(dt: number, t: number, move: number) {
    const w = this.whip.step(dt, move < 0.2);
    const out = w < 0 ? 0 : Math.min(1, bell(w) * 2.2);
    const trot = t * 12;
    this.bodyGroup.position.y = Math.abs(Math.sin(trot)) * 0.012 * move;
    this.bodyGroup.rotation.set(move * 0.05, 0, Math.sin(trot) * 0.03 * move);
    this.legs.forEach((leg, i) => {
      const diag = i === 0 || i === 3 ? 1 : -1;
      leg.rotation.x = Math.sin(trot) * diag * 0.6 * move;
    });
    const breath = Math.sin(t * 2.2);
    this.bulb.scale.set(1 + breath * 0.035, 1 + breath * 0.05, 1 + breath * 0.035);
    this.head.rotation.set(Math.sin(t * 1.3) * 0.05 - out * 0.1, Math.sin(t * 0.7) * 0.2 * (1 - move) + clamp(this.turn * 0.2, -0.4, 0.4), 0);
    this.vines.forEach((v, i) => {
      const s = i ? 1 : -1;
      v.visible = out > 0.02;
      v.scale.setScalar(Math.max(0.01, out));
      v.rotation.set(Math.sin(t * 6 + i) * 0.3 * out, 0, s * Math.sin(t * 5 + i * 1.7) * 0.25 * out);
    });
  }
}

/** 5. An orange lizard who walks upright with a flame on the tip of his tail, and puffs a little fire now and then. */
class FlameTail extends Critter {
  private head: THREE.Group;
  private arms: THREE.Group[] = [];
  private legs: THREE.Group[] = [];
  private tail: THREE.Group;
  private flames: THREE.Group[] = [];
  private breath: THREE.Group;
  private puff = new Act(4, 9, 1.2);
  constructor() {
    const orange = '#f5893a';
    const belly = '#f8da8a';
    const sc = new Sculpt();
    sc.add(ellipsoid('body', [0, 0.088, 0], [0.048, 0.06, 0.044], { name: 'body' }));
    const b = new Builder();
    b.addColored(sculpted('flametail', () => ({ sc, marks: { base: orange, marks: [{ color: belly, f: patch([0, 0.08, 0.04], [0.034, 0.05, 0.03]) }] } }), 0.018));
    const hs = new Sculpt();
    hs.add(ellipsoid('body', [0, 0.2, 0.012], [0.056, 0.052, 0.052], { name: 'head' }));
    hs.add(ellipsoid('body', [0, 0.186, 0.05], [0.04, 0.03, 0.03], { k: 0.03, name: 'snout' }));
    const e = new Builder();
    irisEyes(e, 0.212, frontZ(hs, 0.027, 0.212) - 0.005, 0.027, 0.014, '#2b6584', 0.62);
    super(b, e, 0.212);
    const hb = new Builder();
    hb.addColored(sculpted('flametail-head', () => ({ sc: hs, marks: { base: orange, marks: [{ color: BLUSH, f: blushes(0.188, 0.055, 0.04, 0.01) }] } }), 0.015));
    tube(hb, onFront(hs, [[-0.026, 0.182], [-0.01, 0.172], [0.01, 0.172], [0.026, 0.182]], 0.001), 0.002, '#7a3a20', 4);
    for (const s of [-1, 1]) hb.add(bead(), '#7a3a20', { pos: [s * 0.008, 0.194, frontZ(hs, s * 0.008, 0.194)], scale: [0.0025, 0.002, 0.002] });
    this.head = this.piece(hb, [0, 0.148, 0.0]);
    this.eyesOn(this.head);
    // A little puff of fire, from the mouth.
    const fb = new Builder();
    const mz = frontZ(hs, 0, 0.176);
    flame(fb, [0, 0.176, mz + 0.012], 0.01, 0.026, '#ffb43a');
    this.breath = this.piece(fb, [0, 0.176, mz], this.head, glow('#ff9a2e', 1.4));
    this.breath.rotation.x = Math.PI / 2;
    this.breath.visible = false;
    const leg = sculpted('flametail-leg', () => {
      const l = new Sculpt();
      l.add(rod('body', [0, 0.045, 0], [0, 0.014, 0.004], 0.02, 0.017, { name: 'leg' }));
      l.add(ellipsoid('body', [0, 0.012, 0.016], [0.02, 0.012, 0.028], { k: 0.012, name: 'foot' }));
      l.add(flatBase());
      return { sc: l, marks: { base: orange, marks: [] } };
    }, 0.014);
    for (const s of [-1, 1]) {
      const lb = new Builder();
      lb.addColored(leg, { pos: [s * 0.028, 0, 0.0] });
      for (const dx of [-0.007, 0.007]) lb.add(spike(4), '#fff8ea', { pos: [s * 0.028 + dx, 0.008, 0.044], rot: [Math.PI / 2, 0, 0], scale: [0.003, 0.007, 0.003] });
      this.legs.push(this.piece(lb, [s * 0.028, 0.045, 0.0]));
      const ab = new Builder();
      tube(ab, [[s * 0.04, 0.12, 0.01], [s * 0.054, 0.1, 0.03], [s * 0.05, 0.092, 0.048]], 0.008, orange, 5);
      this.arms.push(this.piece(ab, [s * 0.04, 0.12, 0.01]));
    }
    // The tail, curving up behind, with the flame on its tip.
    const ts = new Sculpt();
    ts.add(rod('body', [0, 0.06, -0.035], [0.02, 0.045, -0.09], 0.022, 0.016, { name: 'tail' }));
    ts.add(rod('body', [0.02, 0.045, -0.09], [0.05, 0.1, -0.12], 0.016, 0.01, { k: 0.012, name: 'tail' }));
    const tb = new Builder();
    tb.addColored(sculpted('flametail-tail', () => ({ sc: ts, marks: { base: orange, marks: [{ color: belly, f: (q) => q.p.y - 0.04 + (q.p.z + 0.09) * 0.1 }] } }), 0.014));
    this.tail = this.piece(tb, [0, 0.06, -0.035]);
    const tip: Vec3 = [0.053, 0.112, -0.122];
    [
      ['#ff7a1f', 0.016, 0.05, 1.3],
      ['#ffe066', 0.009, 0.03, 1.6],
    ].forEach(([c, r, h, k]) => {
      const fb2 = new Builder();
      flame(fb2, [tip[0], tip[1] + (r as number) * 0.6, tip[2]], r as number, h as number, c as string);
      const g = this.piece(fb2, tip, this.tail, glow(c as string, k as number));
      (g.children[0] as THREE.Mesh).castShadow = false;
      this.flames.push(g);
    });
  }
  protected animate(dt: number, t: number, move: number) {
    const p = this.puff.step(dt, move < 0.2);
    const blow = p < 0 ? 0 : Math.min(1, bell(p) * 2.5);
    const w = t * 11;
    this.bodyGroup.position.y = hop(t, move, 0.018, 11) + Math.sin(t * 2) * 0.002;
    this.bodyGroup.rotation.set(move * 0.08, 0, Math.sin(w) * 0.06 * move);
    this.legs.forEach((leg, i) => (leg.rotation.x = Math.sin(w + i * Math.PI) * 0.55 * move));
    this.arms.forEach((arm, i) => (arm.rotation.x = Math.sin(w + i * Math.PI + Math.PI) * 0.5 * move - blow * 0.3));
    this.head.rotation.set(-blow * 0.25 + Math.sin(t * 1.4) * 0.04, Math.sin(t * 0.6) * 0.25 * (1 - move) + clamp(this.turn * 0.2, -0.4, 0.4), 0);
    this.tail.rotation.set(Math.sin(t * 1.5) * 0.06, Math.sin(t * 2) * 0.25 * (1 - move) + Math.sin(w) * 0.3 * move, 0);
    this.flames.forEach((f, i) => {
      const flick = 1 + Math.sin(t * 23 + i) * 0.12 + Math.sin(t * 37 + i * 2) * 0.08;
      f.scale.set(1 - (flick - 1) * 0.5, flick + move * 0.15, 1 - (flick - 1) * 0.5);
      // Blown back a touch as he goes.
      f.rotation.x = -move * 0.5 + Math.sin(t * 9 + i) * 0.08;
    });
    this.breath.visible = blow > 0.05;
    this.breath.scale.setScalar(Math.max(0.01, blow * (1 + Math.sin(t * 30) * 0.15)));
  }
}

/** 6. A blue turtle with a brown shell and a curly tail, who keeps his sunglasses on his brow and slides them down when he's feeling cool. */
class Squirt extends Critter {
  private head: THREE.Group;
  private shades: THREE.Group;
  private legs: THREE.Group[] = [];
  private arms: THREE.Group[] = [];
  private tail: THREE.Group;
  private cool = new Act(3, 8, 4);
  /** Where the shades sit when they're on. */
  private shadesAt: THREE.Vector3;
  private static EYE_Y = 0.212;
  constructor() {
    const blue = '#8dcfe8';
    const shell = '#a5653a';
    const rim = '#f2e5c2';
    const belly = '#f2db8c';
    const sc = new Sculpt();
    sc.add(ellipsoid('body', [0, 0.088, 0.0], [0.048, 0.058, 0.044], { name: 'body' }));
    sc.add(ellipsoid('body', [0, 0.09, -0.016], [0.058, 0.064, 0.048], { k: 0.01, name: 'shell' }));
    sc.add(ellipsoid('body', [0, 0.086, 0.02], [0.044, 0.054, 0.028], { k: 0.008, name: 'belly' }));
    const b = new Builder();
    b.addColored(
      sculpted(
        'squirt',
        () => ({
          sc,
          marks: {
            base: blue,
            marks: [
              // Brown lines across the belly plate, then the plate.
              { color: '#b48a4c', f: both(regionOf(sc, 'belly'), (q) => Math.min(Math.abs(q.p.y - 0.068), Math.abs(q.p.y - 0.1), Math.abs(q.p.x) + (q.p.y > 0.1 ? 1 : 0)) - 0.0025) },
              { color: belly, f: regionOf(sc, 'belly') },
              { color: rim, f: both(regionOf(sc, 'shell'), (q) => q.p.z + 0.03) },
              { color: '#7e4a28', f: both(regionOf(sc, 'shell'), (q) => Math.abs(Math.sin(Math.atan2(q.p.x, -q.p.z - 0.016) * 3)) - 0.12) },
              { color: shell, f: regionOf(sc, 'shell') },
            ],
          },
        }),
        0.017,
      ),
    );
    const hs = new Sculpt();
    hs.add(ellipsoid('body', [0, 0.2, 0.012], [0.058, 0.056, 0.054], { name: 'head' }));
    const ez = frontZ(hs, 0.026, Squirt.EYE_Y);
    const e = new Builder();
    irisEyes(e, Squirt.EYE_Y, ez - 0.005, 0.026, 0.015, '#7a2c3c', 0.6);
    super(b, e, Squirt.EYE_Y);
    const hb = new Builder();
    hb.addColored(sculpted('squirt-head', () => ({ sc: hs, marks: { base: blue, marks: [{ color: BLUSH, f: blushes(0.19, 0.06, 0.04, 0.01) }] } }), 0.015));
    tube(hb, onFront(hs, [[-0.02, 0.182], [-0.008, 0.174], [0.008, 0.174], [0.02, 0.182]], 0.001), 0.002, '#3a5a70', 4);
    this.head = this.piece(hb, [0, 0.148, 0.0]);
    this.eyesOn(this.head);
    // Pointed black sunglasses: up on his brow most of the time.
    const gb = new Builder();
    for (const s of [-1, 1]) {
      const lens = cutout([[0, 0.008], [s * 0.032, 0.012], [s * 0.034, -0.002], [s * 0.022, -0.012], [s * 0.006, -0.008]], 0.004);
      gb.add(lens, '#1c1a22', { pos: [0, Squirt.EYE_Y, ez + 0.012], rot: [0, s * 0.25, 0] });
      lens.dispose();
    }
    gb.add(new THREE.BoxGeometry(1, 1, 1), '#1c1a22', { pos: [0, Squirt.EYE_Y + 0.006, ez + 0.013], scale: [0.012, 0.004, 0.004] });
    gb.add(new THREE.BoxGeometry(1, 1, 1), '#4a4a58', { pos: [0.02, Squirt.EYE_Y + 0.006, ez + 0.0156], rot: [0, 0.25, 0], scale: [0.008, 0.002, 0.001] });
    this.shades = this.piece(gb, [0, Squirt.EYE_Y, ez - 0.03], this.head, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.25, metalness: 0.3 }));
    this.shadesAt = this.shades.position.clone();
    const leg = sculpted('squirt-leg', () => {
      const l = new Sculpt();
      l.add(rod('body', [0, 0.042, 0], [0, 0.014, 0.004], 0.02, 0.018, { name: 'leg' }));
      l.add(ellipsoid('body', [0, 0.012, 0.014], [0.021, 0.012, 0.027], { k: 0.012, name: 'foot' }));
      l.add(flatBase());
      return { sc: l, marks: { base: blue, marks: [] } };
    }, 0.014);
    for (const s of [-1, 1]) {
      const lb = new Builder();
      lb.addColored(leg, { pos: [s * 0.028, 0, 0.0] });
      this.legs.push(this.piece(lb, [s * 0.028, 0.042, 0.0]));
      const ab = new Builder();
      tube(ab, [[s * 0.045, 0.12, 0.01], [s * 0.06, 0.1, 0.025], [s * 0.057, 0.09, 0.04]], 0.009, blue, 5);
      this.arms.push(this.piece(ab, [s * 0.045, 0.12, 0.01]));
    }
    // A curly tail out of the back of his shell.
    const pts: Vec3[] = [];
    for (let i = 0; i <= 14; i++) {
      const a = (i / 14) * Math.PI * 1.6;
      const r = 0.026 * (1 - (i / 14) * 0.55);
      pts.push([0, 0.075 + Math.sin(a) * r * 0.9 + i * 0.0012, -0.06 - (1 - Math.cos(a)) * r * 0.25 - i * 0.002 - Math.sin(a * 0.5) * 0.02]);
    }
    const tb = new Builder();
    tube(tb, pts, 0.0085, blue, 6);
    this.tail = this.piece(tb, [0, 0.07, -0.06]);
  }
  protected animate(dt: number, t: number, move: number) {
    const c = this.cool.step(dt, move < 0.2);
    // Down in a moment, held, and pushed back up.
    const on = c < 0 ? 0 : ease(Math.min(c * 6, (1 - c) * 6));
    const w = t * 11;
    const beat = Math.abs(Math.sin(t * 5)) * on;
    this.bodyGroup.position.y = hop(t, move, 0.018, 11) + beat * 0.004;
    this.bodyGroup.rotation.set(move * 0.07, 0, Math.sin(w) * 0.07 * move);
    this.legs.forEach((leg, i) => (leg.rotation.x = Math.sin(w + i * Math.PI) * 0.55 * move));
    this.arms.forEach((arm, i) => {
      const s = i ? 1 : -1;
      arm.rotation.set(Math.sin(w + i * Math.PI + Math.PI) * 0.5 * move - on * (i ? 1.2 : 0), 0, s * on * (i ? 0.3 : 0));
    });
    this.head.rotation.set(beat * 0.12 + Math.sin(t * 1.3) * 0.03, Math.sin(t * 0.6) * 0.2 * (1 - move) * (1 - on), on * 0.08);
    // The shades sit back on his brow, then come down over his eyes.
    this.shades.position.copy(this.shadesAt).add(V([0, (1 - on) * 0.012, -(1 - on) * 0.012]));
    this.shades.rotation.x = -(1 - on) * 0.7;
    this.tail.rotation.set(Math.sin(t * 2) * 0.1, Math.sin(t * 3 + move * t * 6) * 0.3, 0);
  }
}

/** 7. A brown fox-like kit with big ears, a cream fluffy collar and a bushy tail, who does a happy little spin. */
class Fluff extends Critter {
  private head: THREE.Group;
  private ears: THREE.Group[] = [];
  private legs: THREE.Group[] = [];
  private tail: THREE.Group;
  private spin = new Act(4, 9, 0.9);
  constructor() {
    const brown = '#b47b43';
    const cream = '#f5e6c2';
    const sc = new Sculpt();
    sc.add(ellipsoid('body', [0, 0.088, -0.02], [0.044, 0.044, 0.07], { name: 'body' }));
    // The collar: a big soft ruff round the neck.
    sc.add(ellipsoid('body', [0, 0.115, 0.03], [0.05, 0.042, 0.036], { k: 0.02, name: 'ruff' }));
    for (const s of [-1, 1]) sc.add(ellipsoid('body', [s * 0.036, 0.11, 0.012], [0.026, 0.036, 0.032], { k: 0.02, name: 'ruff' }));
    const b = new Builder();
    b.addColored(sculpted('fluff', () => ({ sc, marks: { base: brown, marks: [{ color: cream, f: regionOf(sc, 'ruff') }] } }), 0.017));
    // Fluffy tufts round the collar's edge.
    for (let i = 0; i < 9; i++) {
      const a = -1.5 + (i / 8) * 3;
      b.add(spike(4), cream, { pos: [Math.sin(a) * 0.05, 0.09 + Math.abs(Math.sin(a)) * 0.012, 0.025 + Math.cos(a) * 0.026], rot: [Math.PI - 0.5 * Math.cos(a), a, 0], scale: [0.012, 0.026, 0.009] });
    }
    const hs = new Sculpt();
    hs.add(ellipsoid('body', [0, 0.168, 0.062], [0.05, 0.044, 0.045], { name: 'head' }));
    hs.add(ellipsoid('body', [0, 0.154, 0.1], [0.022, 0.018, 0.02], { k: 0.022, name: 'muzzle' }));
    const e = new Builder();
    irisEyes(e, 0.172, frontZ(hs, 0.023, 0.172) - 0.005, 0.023, 0.0125, '#4a2a18', 0.62);
    super(b, e, 0.172);
    const hb = new Builder();
    hb.addColored(sculpted('fluff-head', () => ({ sc: hs, marks: { base: brown, marks: [{ color: BLUSH, f: blushes(0.155, 0.095, 0.03, 0.009) }, { color: '#cfa26e', f: regionOf(hs, 'muzzle') }] } }), 0.014));
    hb.add(gem(), INK, { pos: [0, 0.16, frontZ(hs, 0, 0.16) + 0.001], scale: [0.006, 0.0045, 0.005] });
    tube(hb, onFront(hs, [[-0.008, 0.146], [0, 0.149], [0.008, 0.146]], 0.0008), 0.0013, '#5a3a24', 4);
    this.head = this.piece(hb, [0, 0.13, 0.04]);
    this.eyesOn(this.head);
    for (const s of [-1, 1]) {
      const eb = new Builder();
      eb.addColored(
        sculpted(`fluff-ear${s}`, () => {
          const ear = new Sculpt();
          ear.add(pyramid('body', [0, 0, 0], 0.024, 0.07, 0.008, { round: 0.002, rot: [-0.1, 0, -s * 0.5], name: 'ear', thin: true }));
          return { sc: ear, marks: { base: brown, marks: [{ color: '#6e4524', f: (q) => 0.052 - q.p.y }, { color: '#8a5a32', f: (q) => -q.p.z - 0.002 }] } };
        }, 0.011),
        { pos: [s * 0.032, 0.19, 0.055] },
      );
      this.ears.push(this.piece(eb, [s * 0.032, 0.19, 0.055], this.head));
    }
    const leg = sculpted('fluff-leg', () => {
      const l = new Sculpt();
      l.add(rod('body', [0, 0.06, 0], [0, 0.01, 0.004], 0.014, 0.012, { name: 'leg' }));
      l.add(flatBase());
      return { sc: l, marks: { base: brown, marks: [{ color: '#8a5a32', f: (q) => q.p.y - 0.012 }] } };
    }, 0.012);
    for (const [s, z] of [[-1, 0.02], [1, 0.02], [-1, -0.06], [1, -0.06]]) {
      const lb = new Builder();
      lb.addColored(leg, { pos: [s * 0.026, 0, z] });
      this.legs.push(this.piece(lb, [s * 0.026, 0.06, z]));
    }
    // The big bushy tail, cream at its tip.
    const ts = new Sculpt();
    ts.add(rod('body', [0, 0.1, -0.08], [0, 0.13, -0.11], 0.012, 0.026, { name: 'tail' }));
    ts.add(ellipsoid('body', [0, 0.17, -0.115], [0.032, 0.05, 0.03], { rot: [-0.35, 0, 0], k: 0.02, name: 'tail' }));
    const tb = new Builder();
    tb.addColored(sculpted('fluff-tail', () => ({ sc: ts, marks: { base: brown, marks: [{ color: cream, f: (q) => 0.19 - q.p.y }] } }), 0.014));
    this.tail = this.piece(tb, [0, 0.1, -0.08]);
  }
  protected animate(dt: number, t: number, move: number) {
    const s = this.spin.step(dt, move < 0.2);
    const trot = t * 13;
    const jump = s < 0 ? 0 : bell(s);
    this.bodyGroup.position.y = Math.abs(Math.sin(trot)) * 0.016 * move + jump * 0.05;
    this.bodyGroup.rotation.set(move * 0.05, s < 0 ? 0 : ease(s) * Math.PI * 2, Math.sin(trot) * 0.03 * move);
    this.legs.forEach((leg, i) => {
      const diag = i === 0 || i === 3 ? 1 : -1;
      leg.rotation.x = Math.sin(trot) * diag * 0.65 * move + jump * (i < 2 ? -0.5 : 0.5);
    });
    this.head.rotation.set(Math.sin(t * 1.6) * 0.04, Math.sin(t * 0.5) * 0.25 * (1 - move) + clamp(this.turn * 0.2, -0.4, 0.4), Math.tanh(Math.sin(t * 0.45) * 3) * 0.14 * (1 - move));
    this.ears.forEach((ear, i) => {
      const flick = Math.pow(Math.max(0, Math.sin(t * 1.9 + i * 2.1)), 20);
      ear.rotation.set(-move * 0.3 - jump * 0.4, 0, (i ? -1 : 1) * flick * 0.3);
    });
    this.tail.rotation.set(-move * 0.2, Math.sin(t * (5 + move * 6)) * 0.35, 0);
  }
}

/** 8. A yellow duck with a permanent headache: both hands on his head, a blank stare, and now and then a throb that sends ripples off him. */
class Headache extends Critter {
  private head: THREE.Group;
  private legs: THREE.Group[] = [];
  private arms: THREE.Group[] = [];
  private rings: { g: THREE.Group; mat: THREE.MeshStandardMaterial }[] = [];
  private throb = new Act(4, 8, 1.6);
  constructor() {
    const yellow = '#f8d548';
    const bill = '#f6e6ae';
    const sc = new Sculpt();
    sc.add(ellipsoid('body', [0, 0.08, -0.004], [0.054, 0.06, 0.05], { name: 'body' }));
    const b = new Builder();
    b.addColored(sculpted('headache', () => ({ sc, marks: { base: yellow, marks: [{ color: '#fbe58a', f: patch([0, 0.075, 0.045], [0.036, 0.042, 0.03]) }] } }), 0.018));
    const hs = new Sculpt();
    hs.add(ellipsoid('body', [0, 0.19, 0.005], [0.062, 0.058, 0.055], { name: 'head' }));
    hs.add(ellipsoid('body', [0, 0.168, 0.062], [0.04, 0.012, 0.03], { k: 0.012, name: 'bill' }));
    hs.add(ellipsoid('body', [0, 0.156, 0.056], [0.034, 0.01, 0.026], { k: 0.01, name: 'bill' }));
    // A blank stare: wide white eyes with tiny dots.
    const e = new Builder();
    for (const s of [-1, 1]) {
      e.add(gem(), '#fffdf8', stuck(hs, s * 0.022, 0.198, -0.004, [0.016, 0.018, 0.01]));
      e.add(bead(), INK, stuck(hs, s * 0.022, 0.197, 0.006, [0.0035, 0.0035, 0.002]));
    }
    super(b, e, 0.198);
    const hb = new Builder();
    hb.addColored(sculpted('headache-head', () => ({ sc: hs, marks: { base: yellow, marks: [{ color: bill, f: regionOf(hs, 'bill') }] } }), 0.014));
    for (const s of [-1, 1]) hb.add(bead(), '#c9b27a', { pos: [s * 0.01, 0.172, frontZ(hs, s * 0.01, 0.172)], scale: [0.003, 0.002, 0.002] });
    // Three wisps of hair.
    for (const [x, lean] of [[-0.01, -0.3], [0, 0], [0.01, 0.3]]) tube(hb, [[x, 0.244, 0.0], [x + lean * 0.015, 0.262, 0.004], [x + lean * 0.032, 0.274, 0.0]], 0.0018, INK, 4);
    this.head = this.piece(hb, [0, 0.14, 0.0]);
    this.eyesOn(this.head);
    for (const s of [-1, 1]) {
      const lb = new Builder();
      tube(lb, [[s * 0.026, 0.04, 0], [s * 0.026, 0.012, 0.004]], 0.008, bill, 5);
      const foot = cutout([[0, 0], [0.018, 0.03], [0.006, 0.026], [0, 0.034], [-0.006, 0.026], [-0.018, 0.03]], 0.006);
      lb.add(foot, '#f2c75a', { pos: [s * 0.026, 0.004, 0.0], rot: [Math.PI / 2, 0, 0] });
      foot.dispose();
      this.legs.push(this.piece(lb, [s * 0.026, 0.04, 0.0]));
      // Arms up, hands pressed to the sides of his head.
      const ab = new Builder();
      tube(ab, [[s * 0.045, 0.11, 0.0], [s * 0.07, 0.14, 0.012], [s * 0.062, 0.18, 0.018]], 0.0095, yellow, 5);
      ab.add(sph(7, 5), yellow, { pos: [s * 0.058, 0.188, 0.02], scale: [0.012, 0.016, 0.014] });
      this.arms.push(this.piece(ab, [s * 0.045, 0.11, 0.0]));
    }
    // Ripples of a headache coming off him.
    for (let i = 0; i < 2; i++) {
      const rb = new Builder();
      rb.add(new THREE.TorusGeometry(1, 0.06, 4, 20), '#ffffff', { pos: [0, 0.2, 0.0], rot: [Math.PI / 2, 0, 0] });
      const mat = new THREE.MeshStandardMaterial({ color: '#b48aff', emissive: '#8a5cff', emissiveIntensity: 0.7, transparent: true, opacity: 0, roughness: 1, depthWrite: false });
      const g = this.piece(rb, [0, 0.2, 0.0], this.bodyGroup, mat);
      (g.children[0] as THREE.Mesh).castShadow = false;
      // Kept small while hidden too, so anything measuring the pet (the fight pit) isn't thrown by them.
      g.scale.setScalar(0.04);
      g.visible = false;
      this.rings.push({ g, mat });
    }
  }
  protected animate(dt: number, t: number, move: number) {
    const p = this.throb.step(dt, true);
    const ache = p < 0 ? 0 : bell(p);
    const w = t * 10;
    this.bodyGroup.position.y = hop(t, move, 0.016, 10);
    this.bodyGroup.rotation.set(move * 0.05, 0, Math.sin(w) * 0.08 * move + Math.sin(t * 1.1) * 0.05 * (1 - move));
    this.legs.forEach((leg, i) => (leg.rotation.x = Math.sin(w + i * Math.PI) * 0.6 * move));
    // A woozy sway, and a shudder when it throbs.
    const shake = Math.sin(t * 45) * 0.06 * ache;
    this.head.rotation.set(Math.sin(t * 0.9) * 0.06, Math.sin(t * 0.7) * 0.08 + shake, Math.sin(t * 1.1) * 0.1 + shake * 0.5);
    this.arms.forEach((arm, i) => {
      const s = i ? 1 : -1;
      arm.rotation.set(Math.sin(t * 0.9) * 0.05, 0, s * (Math.sin(t * 1.1) * 0.03 + ache * 0.08));
    });
    this.rings.forEach(({ g, mat }, i) => {
      const u = p < 0 ? -1 : (p * 1.4 - i * 0.3) % 1.4;
      g.visible = u > 0 && u < 1;
      if (!g.visible) return;
      g.scale.setScalar(0.04 + u * 0.08);
      mat.opacity = (1 - u) * 0.7;
    });
  }
}

/** 9. A little furry forest creature in a leather hood with a spear, who keeps watch and shakes his spear at nothing in particular. */
class Teddy extends Critter {
  private head: THREE.Group;
  private legs: THREE.Group[] = [];
  private arms: THREE.Group[] = [];
  private brandish = new Act(4, 8, 1.4);
  constructor() {
    const fur = '#6f4a2e';
    const face = '#a87e56';
    const hood = '#c8783c';
    const sc = new Sculpt();
    sc.add(ellipsoid('body', [0, 0.078, 0], [0.05, 0.06, 0.047], { name: 'body' }));
    const b = new Builder();
    b.addColored(
      sculpted('teddy', () => ({ sc, marks: { base: fur, marks: [{ color: '#86603e', f: spots(5, 9, [0, 0.078, 0], [0.05, 0.06, 0.047], [0.012, 0.008, 0.012]) }, { color: '#5c3c24', f: spots(8, 7, [0, 0.078, 0], [0.05, 0.06, 0.047], [0.01, 0.007, 0.01]) }] } }), 0.017),
    );
    // A furry head in a hood, the face looking out of it.
    const hs = new Sculpt();
    hs.add(ellipsoid('body', [0, 0.19, -0.004], [0.058, 0.056, 0.055], { name: 'hood' }));
    hs.add(ellipsoid('body', [0, 0.18, 0.032], [0.046, 0.042, 0.03], { k: 0.01, name: 'face' }));
    hs.add(ellipsoid('body', [0, 0.17, 0.056], [0.02, 0.016, 0.016], { k: 0.015, name: 'muzzle' }));
    for (const s of [-1, 1]) hs.add(ellipsoid('body', [s * 0.04, 0.236, -0.002], [0.016, 0.019, 0.012], { k: 0.008, name: 'ear' }));
    hs.add(ellipsoid('body', [0, 0.21, -0.045], [0.026, 0.03, 0.03], { rot: [0.6, 0, 0], k: 0.02, name: 'hood' }));
    const e = new Builder();
    addEyes(e, 0.192, frontZ(hs, 0.019, 0.192) - 0.002, 0.019, 0.0125);
    super(b, e, 0.192);
    const hb = new Builder();
    hb.addColored(
      sculpted(
        'teddy-head',
        () => ({
          sc: hs,
          marks: { base: hood, marks: [{ color: '#c7a07a', f: regionOf(hs, 'muzzle') }, { color: face, f: regionOf(hs, 'face') }, { color: fur, f: regionOf(hs, 'ear') }, { color: '#a85f2c', f: (q) => Math.abs(q.p.x) - 0.004 + (q.p.y < 0.205 ? 1 : 0) }] },
        }),
        0.014,
      ),
    );
    hb.add(gem(), INK, { pos: [0, 0.175, frontZ(hs, 0, 0.175) + 0.001], scale: [0.007, 0.005, 0.005] });
    // The hood's ties under his chin.
    for (const s of [-1, 1]) tube(hb, [[s * 0.03, 0.15, 0.03], [s * 0.012, 0.138, 0.042], [s * 0.004, 0.124, 0.044]], 0.0018, '#8a4e26', 4);
    this.head = this.piece(hb, [0, 0.135, 0.0]);
    this.eyesOn(this.head);
    for (const s of [-1, 1]) {
      const lb = new Builder();
      tube(lb, [[s * 0.026, 0.04, 0], [s * 0.026, 0.01, 0.006]], 0.014, fur, 6);
      lb.add(sph(7, 5), '#4e3220', { pos: [s * 0.026, 0.008, 0.012], scale: [0.016, 0.009, 0.02] });
      this.legs.push(this.piece(lb, [s * 0.026, 0.04, 0.0]));
      const ab = new Builder();
      tube(ab, [[s * 0.044, 0.112, 0.0], [s * 0.058, 0.09, 0.02], [s * 0.056, 0.085, 0.036]], 0.01, fur, 5);
      if (s > 0) {
        // The spear, held upright: a pole, a stone tip bound on, and a feather.
        ab.add(new THREE.CylinderGeometry(1, 1, 1, 6), '#8a6a40', { pos: [0.056, 0.15, 0.04], scale: [0.0035, 0.26, 0.0035] });
        ab.add(spike(4), '#9da3a8', { pos: [0.056, 0.296, 0.04], scale: [0.009, 0.034, 0.006] });
        ab.add(new THREE.CylinderGeometry(1, 1, 1, 6), '#6a4a2a', { pos: [0.056, 0.276, 0.04], scale: [0.0052, 0.012, 0.0052] });
        ab.add(sph(6, 4), '#f2ece0', { pos: [0.064, 0.262, 0.04], rot: [0, 0, -0.5], scale: [0.004, 0.016, 0.002] });
      }
      this.arms.push(this.piece(ab, [s * 0.044, 0.112, 0.0]));
    }
  }
  protected animate(dt: number, t: number, move: number) {
    const a = this.brandish.step(dt, move < 0.2);
    const up = a < 0 ? 0 : bell(a);
    const w = t * 11;
    this.bodyGroup.position.y = hop(t, move, 0.016, 11) + Math.abs(Math.sin(t * 14)) * 0.022 * up;
    this.bodyGroup.rotation.set(move * 0.06, 0, Math.sin(w) * 0.08 * move);
    this.legs.forEach((leg, i) => (leg.rotation.x = Math.sin(w + i * Math.PI) * 0.55 * move));
    // Keeping watch: a slow look one way and then the other.
    const look = Math.tanh(Math.sin(t * 0.5) * 2.5) * 0.45 * (1 - move);
    this.head.rotation.set(Math.sin(t * 1.4) * 0.04 - up * 0.1, look + clamp(this.turn * 0.2, -0.4, 0.4), 0);
    this.arms.forEach((arm, i) => {
      const s = i ? 1 : -1;
      const shake = i ? -up * (0.9 + Math.sin(t * 16) * 0.25) : -up * 0.6;
      arm.rotation.set(Math.sin(w + i * Math.PI) * 0.4 * move * (i ? 0.4 : 1) + shake, 0, s * up * 0.15);
    });
  }
}

/** 10. A round little sea bird with huge dark eyes, waddling about and squawking with its beak wide. */
class Porg extends Critter {
  private jaw: THREE.Group;
  private wings: THREE.Group[] = [];
  private feet: THREE.Group[] = [];
  private squawk = new Act(3, 7, 0.9);
  constructor() {
    const white = '#f8f3ea';
    const brown = '#a8714a';
    const sc = new Sculpt();
    sc.add(ellipsoid('body', [0, 0.088, -0.005], [0.08, 0.078, 0.072], { name: 'body' }));
    sc.add(ellipsoid('body', [0, 0.06, -0.075], [0.03, 0.02, 0.02], { rot: [0.6, 0, 0], k: 0.02, name: 'tail' }));
    sc.add(flatBase(0.008));
    // Big dark eyes, each in a pale ring, a brown cap coming down between them.
    const ez = frontZ(sc, 0.032, 0.11);
    const b = new Builder();
    b.addColored(
      sculpted(
        'porg',
        () => ({
          sc,
          marks: {
            base: white,
            marks: [
              { color: '#c98a4e', f: either(patch([0.032, 0.11, ez], [0.026, 0.026, 0.026]), patch([-0.032, 0.11, ez], [0.026, 0.026, 0.026])) },
              { color: brown, f: either((q) => Math.max(q.p.z - 0.02 + (0.15 - q.p.y) * 0.9, -0.1), patch([0, 0.13, 0.07], [0.012, 0.03, 0.03]), (q) => q.p.z + 0.03 - (q.p.y - 0.06) * 0.3) },
              { color: '#7c4e30', f: regionOf(sc, 'tail') },
            ],
          },
        }),
        0.018,
      ),
    );
    const e = new Builder();
    for (const s of [-1, 1]) {
      e.add(gem(), '#1c1418', stuck(sc, s * 0.032, 0.11, -0.006, [0.02, 0.021, 0.012]));
      e.add(new THREE.IcosahedronGeometry(1, 1), '#fffdf8', stuck(sc, s * 0.032 + 0.008, 0.118, 0.005, [0.005, 0.005, 0.003]));
      e.add(new THREE.IcosahedronGeometry(1, 1), '#fffdf8', stuck(sc, s * 0.032 - 0.006, 0.103, 0.005, [0.0025, 0.0025, 0.002]));
    }
    super(b, e, 0.11);
    // A small orange beak, its lower half opening for the squawk.
    const bz = frontZ(sc, 0, 0.088);
    const kb = new Builder();
    kb.add(spike(5), '#f0a04a', { pos: [0, 0.092, bz + 0.008], rot: [Math.PI / 2, 0, 0], scale: [0.012, 0.022, 0.007] });
    this.piece(kb, [0, 0.092, bz]);
    const jb = new Builder();
    jb.add(spike(5), '#d9873a', { pos: [0, 0.085, bz + 0.004], rot: [Math.PI / 2 + 0.2, 0, 0], scale: [0.01, 0.014, 0.005] });
    jb.add(sph(6, 4), '#c8505a', { pos: [0, 0.088, bz + 0.001], scale: [0.008, 0.004, 0.006] });
    this.jaw = this.piece(jb, [0, 0.088, bz - 0.002]);
    for (const s of [-1, 1]) {
      const wb = new Builder();
      wb.add(sph(8, 5), brown, { pos: [s * 0.08, 0.085, -0.01], rot: [0, 0, -s * 0.25], scale: [0.012, 0.04, 0.03] });
      this.wings.push(this.piece(wb, [s * 0.072, 0.11, -0.01]));
      const fb = new Builder();
      for (const a of [-0.5, 0, 0.5]) fb.add(spike(4), '#e98a3a', { pos: [s * 0.03 + Math.sin(a) * 0.01, 0.004, 0.035 + Math.cos(a) * 0.01], rot: [Math.PI / 2, 0, -a], scale: [0.004, 0.018, 0.003] });
      this.feet.push(this.piece(fb, [s * 0.03, 0.01, 0.02]));
    }
  }
  protected animate(dt: number, t: number, move: number) {
    const q = this.squawk.step(dt, move < 0.2);
    const open = q < 0 ? 0 : Math.min(1, bell(q) * 2.5);
    const w = t * 12;
    this.bodyGroup.position.y = hop(t, move, 0.022, 12) + open * 0.01;
    this.bodyGroup.scale.set(1 - open * 0.03, 1 + open * 0.05, 1);
    this.bodyGroup.rotation.set(move * 0.06 - open * 0.15, Math.sin(t * 0.6) * 0.15 * (1 - move), Math.sin(w) * 0.1 * move + Math.sin(t * 1.5) * 0.04 * (1 - move));
    this.jaw.rotation.x = open * 0.7;
    this.wings.forEach((wing, i) => {
      const s = i ? 1 : -1;
      wing.rotation.z = s * (0.05 + Math.abs(Math.sin(t * 24)) * 0.7 * open + Math.abs(Math.sin(w)) * 0.25 * move);
    });
    this.feet.forEach((f, i) => (f.rotation.x = Math.max(0, Math.sin(w + i * Math.PI)) * -0.6 * move));
  }
}

/** 11. A little snowman with twig arms, a carrot nose and a buck-toothed grin, under his own tiny snow cloud; he waves hello. */
class Snowman extends Critter {
  private head: THREE.Group;
  private arms: THREE.Group[] = [];
  private cloud: THREE.Group;
  private flakes: THREE.InstancedMesh;
  private readonly nFlakes = 12;
  private wave = new Act(3, 7, 2);
  constructor() {
    const snow = '#f7fbff';
    const shade = '#d9e6f2';
    const twig = '#7a5636';
    const sc = new Sculpt();
    sc.add(ellipsoid('body', [0, 0.045, 0], [0.05, 0.044, 0.046], { name: 'base' }));
    sc.add(ellipsoid('body', [0, 0.106, 0.002], [0.038, 0.034, 0.035], { k: 0.012, name: 'middle' }));
    for (const s of [-1, 1]) sc.add(ellipsoid('body', [s * 0.024, 0.01, 0.03], [0.018, 0.012, 0.022], { k: 0.012, name: 'foot' }));
    sc.add(flatBase());
    const b = new Builder();
    b.addColored(sculpted('snowman', () => ({ sc, marks: { base: snow, marks: [{ color: shade, f: (q) => q.p.y - 0.018 }] } }), 0.017));
    for (const y of [0.124, 0.104, 0.084]) b.add(bead(), '#2a2628', { pos: [0, y, frontZ(sc, 0, y) - 0.001], scale: 0.0055 });
    // A tall head, wide at the jaw.
    const hs = new Sculpt();
    hs.add(ellipsoid('body', [0, 0.196, 0.0], [0.04, 0.05, 0.038], { name: 'head' }));
    hs.add(ellipsoid('body', [0, 0.166, 0.012], [0.05, 0.03, 0.04], { k: 0.025, name: 'head' }));
    const e = new Builder();
    addEyes(e, 0.206, frontZ(hs, 0.016, 0.206) - 0.002, 0.016, 0.0105);
    for (const s of [-1, 1]) tube(e, onFront(hs, [[s * 0.008, 0.222], [s * 0.016, 0.226], [s * 0.025, 0.222]], 0.003), 0.0016, INK, 4);
    super(b, e, 0.206);
    const hb = new Builder();
    hb.addColored(sculpted('snowman-head', () => ({ sc: hs, marks: { base: snow, marks: [{ color: BLUSH, f: blushes(0.176, 0.045, 0.034, 0.008) }] } }), 0.014));
    // The grin, with one big tooth, and the carrot.
    const grin = onFront(hs, [[-0.03, 0.17], [-0.016, 0.158], [0, 0.155], [0.016, 0.158], [0.03, 0.17]], 0.001);
    tube(hb, grin, 0.0035, '#3a2a2c', 4);
    hb.add(new THREE.BoxGeometry(1, 1, 1), '#fffef8', { pos: [0, 0.16, frontZ(hs, 0, 0.16) + 0.003], scale: [0.011, 0.008, 0.003] });
    hb.add(spike(6), '#f08a2a', { pos: [0, 0.188, frontZ(hs, 0, 0.188) + 0.016], rot: [Math.PI / 2, 0, 0], scale: [0.0075, 0.04, 0.0075] });
    for (const [x, lean] of [[-0.008, -0.4], [0, 0.05], [0.008, 0.45]]) tube(hb, [[x, 0.24, 0], [x + lean * 0.012, 0.258, 0], [x + lean * 0.022, 0.27, 0.004]], 0.0018, twig, 4);
    this.head = this.piece(hb, [0, 0.14, 0.0]);
    this.eyesOn(this.head);
    for (const s of [-1, 1]) {
      const ab = new Builder();
      const ap: Vec3[] = [[s * 0.03, 0.115, 0], [s * 0.06, 0.13, 0.008], [s * 0.088, 0.152, 0.012]];
      tube(ab, ap, 0.0028, twig, 4);
      tube(ab, [ap[2], [s * 0.095, 0.168, 0.012]], 0.002, twig, 4);
      tube(ab, [ap[2], [s * 0.1, 0.152, 0.016]], 0.002, twig, 4);
      tube(ab, [along(ap, 0.6), [s * 0.072, 0.152, 0.008]], 0.0018, twig, 4);
      this.arms.push(this.piece(ab, [s * 0.03, 0.115, 0.0]));
    }
    // His own little snow cloud, and its flakes.
    const cb = new Builder();
    for (const [x, y, z, r] of [[-0.03, 0.335, 0, 0.026], [0.0, 0.345, 0.004, 0.032], [0.032, 0.334, -0.004, 0.025], [0.012, 0.33, 0.02, 0.022], [-0.012, 0.332, -0.02, 0.022]]) cb.add(sph(8, 6), '#f4f8fc', { pos: [x * 0.8, y - 0.03, z * 0.8], scale: [r * 0.8, r * 0.64, r * 0.8] });
    this.cloud = this.piece(cb, [0, 0.31, 0], this.root);
    const fb = new Builder();
    fb.add(new THREE.OctahedronGeometry(1, 0), '#ffffff', { scale: 0.0045 });
    this.flakes = this.copies(fb, this.nFlakes);
    this.flakes.castShadow = false;
  }
  protected animate(dt: number, t: number, move: number) {
    const wv = this.wave.step(dt, move < 0.2);
    const hi = wv < 0 ? 0 : Math.min(1, bell(wv) * 2.5);
    const w = t * 10;
    // A shuffling hop along: the head bobbing a beat behind.
    this.bodyGroup.position.y = hop(t, move, 0.02, 10);
    this.bodyGroup.rotation.set(move * 0.05, 0, Math.sin(w) * 0.07 * move);
    this.head.rotation.set(Math.sin(w - 0.8) * 0.08 * move + Math.sin(t * 1.3) * 0.03, Math.sin(t * 0.6) * 0.2 * (1 - move), Math.sin(t * 1.1) * 0.08 * (1 - move) + hi * 0.15);
    this.head.position.y = 0.14 + Math.abs(Math.sin(w - 0.8)) * 0.008 * move;
    this.arms.forEach((arm, i) => {
      const s = i ? 1 : -1;
      const waving = i ? hi : 0;
      arm.rotation.set(Math.sin(w + i * Math.PI) * 0.4 * move, 0, s * (waving * (0.9 + Math.sin(t * 14) * 0.3) + Math.sin(t * 1.2 + i) * 0.06));
    });
    this.cloud.position.set(Math.sin(t * 0.7) * 0.008, 0.31 + Math.sin(t * 1.3) * 0.006 + this.bodyGroup.position.y * 0.3, 0);
    // The flakes fall from the cloud to the ground, and round again.
    for (let i = 0; i < this.nFlakes; i++) {
      const u = (t * 0.32 + i * 0.618) % 1;
      const a = i * 2.4 + t * 0.4;
      const r = 0.02 + ((i * 37) % 10) * 0.005;
      placeCopy(this.flakes, i, [this.cloud.position.x + Math.cos(a) * r + Math.sin(t * 3 + i) * 0.004, 0.295 - u * 0.295, Math.sin(a) * r], [t * 2 + i, t * 3 + i, 0], [1, 1, 1].map(() => (u > 0.92 ? (1 - u) / 0.08 : 1)) as Vec3);
    }
    this.flakes.instanceMatrix.needsUpdate = true;
  }
}

/** 12. A red crab with big claws and heavy-lidded eyes, who sways and clacks along to a tune only he can hear, and scuttles sideways. */
class Crab extends Critter {
  private claws: THREE.Group[] = [];
  private pincers: THREE.Group[] = [];
  private legs: THREE.Group[] = [];
  constructor() {
    const red = '#e1453a';
    const sc = new Sculpt();
    sc.add(ellipsoid('body', [0, 0.07, 0], [0.078, 0.046, 0.06], { name: 'body' }));
    sc.add(ellipsoid('body', [0, 0.098, 0.03], [0.05, 0.03, 0.035], { k: 0.03, name: 'face' }));
    const b = new Builder();
    b.addColored(
      sculpted('crab', () => ({ sc, marks: { base: red, marks: [{ color: '#f07a62', f: (q) => q.p.y - 0.045 }, { color: BLUSH, f: blushes(0.078, frontZ(sc, 0.045, 0.078), 0.045, 0.01) }] } }), 0.018),
    );
    tube(b, onFront(sc, [[-0.022, 0.07], [-0.008, 0.062], [0.008, 0.062], [0.022, 0.07]], 0.001), 0.0022, '#6a1c1c', 4);
    // Big round eyes with heavy red lids.
    const ez = frontZ(sc, 0.022, 0.108);
    const e = new Builder();
    irisEyes(e, 0.108, ez - 0.006, 0.022, 0.016, '#fffdf8', 0.5);
    for (const s of [-1, 1]) e.add(gem(), red, { pos: [s * 0.022, 0.117, ez - 0.004], rot: [0.3, 0, s * 0.15], scale: [0.0175, 0.01, 0.012] });
    super(b, e, 0.108);
    for (const s of [-1, 1]) {
      // An arm out to a big claw, its top pincer hinged.
      const cb = new Builder();
      tube(cb, [[s * 0.07, 0.07, 0.02], [s * 0.1, 0.075, 0.04], [s * 0.11, 0.085, 0.06]], 0.008, red, 5);
      cb.add(sph(9, 6), red, { pos: [s * 0.112, 0.085, 0.075], rot: [0.2, 0, 0], scale: [0.026, 0.02, 0.028] });
      cb.add(spike(5), red, { pos: [s * 0.112, 0.078, 0.104], rot: [Math.PI / 2, 0, 0], scale: [0.016, 0.03, 0.008] });
      const claw = this.piece(cb, [s * 0.07, 0.07, 0.02]);
      this.claws.push(claw);
      const pb = new Builder();
      pb.add(spike(5), '#ec5a4a', { pos: [s * 0.112, 0.098, 0.102], rot: [Math.PI / 2 + 0.15, 0, 0], scale: [0.013, 0.034, 0.008] });
      this.pincers.push(this.piece(pb, [s * 0.112, 0.096, 0.082], claw));
      // Three thin legs a side.
      for (const z of [0.01, -0.018, -0.044]) {
        const lb = new Builder();
        tube(lb, [[s * 0.065, 0.06, z], [s * 0.098, 0.05, z - 0.004], [s * 0.112, 0.006, z - 0.01]], 0.0045, red, 4);
        this.legs.push(this.piece(lb, [s * 0.065, 0.06, z]));
      }
    }
  }
  protected animate(_dt: number, t: number, move: number) {
    // The tune: a steady beat he sways and bobs to.
    const beat = t * Math.PI * 2.2;
    const sway = Math.sin(beat * 0.5);
    const bob = Math.abs(Math.sin(beat * 0.5));
    const still = 1 - move;
    this.bodyGroup.position.set(sway * 0.012 * still, 0.006 * bob * still + Math.abs(Math.sin(t * 20)) * 0.006 * move, 0);
    // On the move, he turns side-on and scuttles.
    this.bodyGroup.rotation.set(0, move * Math.PI * 0.5, sway * 0.14 * still + Math.sin(t * 20) * 0.04 * move);
    this.claws.forEach((c, i) => {
      const s = i ? 1 : -1;
      c.rotation.set(Math.sin(beat * 0.5 + i * Math.PI) * 0.35 * still - 0.1, 0, s * (0.1 + Math.max(0, Math.sin(beat * 0.5 + i * Math.PI)) * 0.4 * still));
    });
    this.pincers.forEach((p, i) => (p.rotation.x = -Math.max(0, Math.sin(beat * 2 + i)) * 0.45 * still - Math.max(0, Math.sin(t * 9 + i)) * 0.2 * move));
    this.legs.forEach((leg, i) => {
      const s = i < 3 ? -1 : 1;
      leg.rotation.set(Math.sin(t * 20 + i * 2.1) * 0.25 * move, 0, s * (Math.max(0, Math.sin(t * 20 + i * 2.1)) * 0.35 * move + bob * 0.06 * still));
    });
  }
}

/** 13. A little orange and white clownfish with one small fin, swimming round and round a fishbowl that hops along after its friend. */
class LuckyFin extends Critter {
  private fish: THREE.Group;
  private tailFin: THREE.Group;
  private water: THREE.Group;
  private bubbles: THREE.Group[] = [];
  private lap = 0;
  private static C: Vec3 = [0, 0.105, 0];
  private static R = 0.1;
  constructor() {
    const orange = '#f67a24';
    const white = '#fdfbf4';
    const edge = '#2a2022';
    // The fish is the body, built round its own middle so it can swim.
    const fs = new Sculpt();
    fs.add(ellipsoid('body', [0, 0, 0], [0.013, 0.02, 0.032], { name: 'fish' }));
    fs.add(ellipsoid('body', [0, 0.017, -0.006], [0.003, 0.01, 0.018], { k: 0.006, name: 'fin' }));
    const band = (z: number, w: number): Field => (q) => Math.abs(q.p.z - z) - w;
    const b = new Builder();
    b.addColored(
      sculpted(
        'luckyfin',
        () => ({
          sc: fs,
          marks: {
            base: orange,
            marks: [
              { color: white, f: either(band(0.014, 0.004), band(-0.008, 0.004), band(-0.027, 0.003)) },
              { color: edge, f: either(band(0.014, 0.0065), band(-0.008, 0.0065), band(-0.027, 0.0055), both(regionOf(fs, 'fin'), (q) => 0.022 - q.p.y)) },
            ],
          },
        }),
        0.007,
      ),
    );
    // Fins: an ordinary one on the left, the small lucky one on the right.
    b.add(sph(6, 4), orange, { pos: [-0.015, -0.006, 0.006], rot: [0.4, 0, -0.5], scale: [0.011, 0.002, 0.007] });
    b.add(sph(6, 4), orange, { pos: [0.014, -0.006, 0.008], rot: [0.4, 0, 0.5], scale: [0.0045, 0.0015, 0.0035] });
    tube(b, [[-0.004, 0.006, 0.03], [0, 0.002, 0.033], [0.004, 0.006, 0.03]], 0.0011, edge, 4);
    const e = new Builder();
    for (const s of [-1, 1]) {
      e.add(gem(), '#fffdf8', { pos: [s * 0.009, 0.006, 0.019], scale: [0.0045, 0.0055, 0.0045] });
      e.add(gem(), INK, { pos: [s * 0.0105, 0.006, 0.021], scale: [0.0028, 0.0034, 0.0028] });
    }
    super(b, e, 0.006);
    this.fish = this.pivotBody([0, 0, 0]);
    this.fish.scale.setScalar(1.3);
    this.eyesOn(this.fish);
    const tb = new Builder();
    const tail = cutout([[0, 0], [-0.012, -0.018], [-0.014, -0.006], [-0.002, 0], [-0.014, 0.006], [-0.012, 0.018]], 0.002);
    tb.add(tail, orange, { pos: [0, 0, -0.03], rot: [0, Math.PI / 2, 0] });
    tail.dispose();
    tb.add(new THREE.BoxGeometry(1, 1, 1), edge, { pos: [0, 0, -0.0425], scale: [0.0022, 0.03, 0.0016] });
    this.tailFin = this.piece(tb, [0, 0, -0.03], this.fish);
    // The bowl: open at the top, with a lip, water up to its shoulders, and pebbles and a weed on the bottom.
    const [cx, cy, cz] = LuckyFin.C;
    const R = LuckyFin.R;
    const glass = new THREE.MeshStandardMaterial({ color: '#d8f2ff', transparent: true, opacity: 0.22, roughness: 0.08, metalness: 0.1, depthWrite: false, side: THREE.DoubleSide });
    const gb = new Builder();
    gb.add(new THREE.SphereGeometry(1, 20, 12, 0, Math.PI * 2, 0.6, Math.PI - 0.9), '#ffffff', { pos: LuckyFin.C, scale: R });
    gb.add(new THREE.TorusGeometry(1, 0.08, 5, 22), '#ffffff', { pos: [cx, cy + R * Math.cos(0.6), cz], rot: [Math.PI / 2, 0, 0], scale: R * Math.sin(0.6) });
    gb.add(new THREE.CylinderGeometry(1, 1, 1, 20), '#ffffff', { pos: [cx, cy - R * Math.cos(0.3) + 0.002, cz], scale: [R * Math.sin(0.3), 0.004, R * Math.sin(0.3)] });
    const bowl = this.piece(gb, [0, 0, 0], this.bodyGroup, glass);
    const level = 0.95;
    const wb = new Builder();
    wb.add(new THREE.SphereGeometry(1, 18, 9, 0, Math.PI * 2, level, Math.PI - level - 0.3), '#ffffff', { pos: LuckyFin.C, scale: R * 0.965 });
    wb.add(new THREE.CircleGeometry(1, 18), '#ffffff', { pos: [cx, cy + R * 0.965 * Math.cos(level), cz], rot: [-Math.PI / 2, 0, 0], scale: R * 0.965 * Math.sin(level) });
    const waterMat = new THREE.MeshStandardMaterial({ color: '#7cc8f0', transparent: true, opacity: 0.32, roughness: 0.2, depthWrite: false, side: THREE.DoubleSide });
    this.water = this.piece(wb, [cx, cy, cz], this.bodyGroup, waterMat);
    for (const g of [bowl, this.water]) (g.children[0] as THREE.Mesh).castShadow = false;
    const pb = new Builder();
    const floor = cy - R * Math.cos(0.3) + 0.008;
    [['#f2c14e', 0.03, 0.01], ['#7ab0e0', -0.025, 0.02], ['#f07a8a', 0.005, -0.03], ['#9ad07a', -0.03, -0.012], ['#f4efe4', 0.02, -0.022]].forEach(([c, x, z]) => pb.add(pip(), c as string, { pos: [x as number, floor, z as number], scale: [0.009, 0.006, 0.009] }));
    tube(pb, [[-0.012, floor, 0.0], [-0.016, floor + 0.03, 0.004], [-0.01, floor + 0.055, 0.0], [-0.016, floor + 0.075, 0.004]], 0.0035, '#4fa85a', 4);
    this.piece(pb, [0, floor, 0]);
    for (let i = 0; i < 3; i++) {
      const bb = new Builder();
      bb.add(sph(6, 4), '#ffffff', { scale: 0.004 + i * 0.0012 });
      const g = this.piece(bb, [0, 0, 0], this.bodyGroup, glass);
      (g.children[0] as THREE.Mesh).castShadow = false;
      this.bubbles.push(g);
    }
  }
  protected animate(dt: number, t: number, move: number) {
    // The bowl hops along; the water sloshes.
    const air = hop(t, move, 0.035, 9);
    this.bodyGroup.position.y = air;
    this.water.rotation.set(Math.sin(t * 9) * 0.06 * move, 0, Math.sin(t * 4.5) * 0.08 * move + Math.sin(t * 1.3) * 0.015);
    // Round and round, quicker when they're off somewhere.
    this.lap += dt * (1.1 + move * 1.8);
    const r = 0.045;
    const [cx, cy, cz] = LuckyFin.C;
    const a = this.lap;
    this.fish.position.set(cx + Math.cos(a) * r, cy - 0.012 + Math.sin(t * 1.7) * 0.01, cz + Math.sin(a) * r);
    this.fish.rotation.set(Math.sin(t * 1.7) * 0.15, -a, Math.sin(t * 2) * 0.1);
    this.tailFin.rotation.y = Math.sin(t * (14 + move * 10)) * 0.5;
    this.bubbles.forEach((g, i) => {
      const u = (t * 0.4 + i / 3) % 1;
      g.position.set(cx + Math.sin(i * 2.3) * 0.03 + Math.sin(t * 3 + i) * 0.004, cy - 0.06 + u * 0.1, cz + Math.cos(i * 2.3) * 0.03);
      g.visible = u < 0.95;
    });
  }
}

/** 14. A googly-eyed rooster who struts along bobbing his head, walks straight into things, and pecks at the ground and misses. */
class Rooster extends Critter {
  private head: THREE.Group;
  private legs: THREE.Group[] = [];
  private tail: THREE.Group;
  private pupils: THREE.Group[] = [];
  private bonk = new Act(5, 10, 1.4);
  private peck = new Act(2, 5, 0.9);
  constructor() {
    const teal = '#2f4e4a';
    const hackle = '#c8692c';
    const red = '#d8362e';
    const yellow = '#f2c23a';
    const sc = new Sculpt();
    sc.add(ellipsoid('body', [0, 0.118, -0.012], [0.05, 0.052, 0.068], { rot: [-0.25, 0, 0], name: 'body' }));
    for (const s of [-1, 1]) sc.add(ellipsoid('body', [s * 0.044, 0.122, -0.02], [0.016, 0.034, 0.05], { rot: [-0.3, 0, 0], k: 0.012, name: 'wing' }));
    const b = new Builder();
    b.addColored(sculpted('rooster', () => ({ sc, marks: { base: teal, marks: [{ color: '#24403d', f: regionOf(sc, 'wing') }, { color: hackle, f: (q) => 0.13 - q.p.y + q.p.z * 0.8 }] } }), 0.017));
    // The neck and head, bobbing together.
    const hs = new Sculpt();
    hs.add(rod('body', [0, 0.145, 0.03], [0, 0.205, 0.05], 0.026, 0.02, { name: 'neck' }));
    hs.add(ellipsoid('body', [0, 0.228, 0.056], [0.028, 0.03, 0.033], { k: 0.015, name: 'head' }));
    for (const [y, z, r] of [[0.262, 0.07, 0.011], [0.266, 0.055, 0.012], [0.26, 0.04, 0.01]]) hs.add(ellipsoid('body', [0, y, z], [0.006, r, r * 0.9], { k: 0.008, name: 'comb' }));
    hs.add(ellipsoid('body', [0, 0.196, 0.08], [0.006, 0.014, 0.008], { k: 0.006, name: 'wattle' }));
    // Big googly eyes on each side of the head: whites here, pupils on their own so they can rattle about.
    const e = new Builder();
    const eyeAt = (s: number): Vec3 => [s * 0.024, 0.236, 0.07];
    for (const s of [-1, 1]) e.add(gem(), '#fffdf8', { pos: eyeAt(s), scale: [0.012, 0.0135, 0.012] });
    super(b, e, 0.236);
    const hb = new Builder();
    hb.addColored(sculpted('rooster-head', () => ({ sc: hs, marks: { base: hackle, marks: [{ color: red, f: either(regionOf(hs, 'comb'), regionOf(hs, 'wattle'), patch([0, 0.226, 0.075], [0.024, 0.016, 0.02])) }, { color: '#a64e20', f: (q) => q.p.y - 0.17 }] } }), 0.013));
    hb.add(spike(5), yellow, { pos: [0, 0.222, 0.096], rot: [Math.PI / 2 + 0.25, 0, 0], scale: [0.009, 0.026, 0.006] });
    this.head = this.piece(hb, [0, 0.145, 0.03]);
    this.eyesOn(this.head);
    for (const s of [-1, 1]) {
      const pb = new Builder();
      const [x, y, z] = eyeAt(s);
      pb.add(gem(), INK, { pos: [x + s * 0.01, y, z + 0.004], scale: [0.0035, 0.0055, 0.0055] });
      this.pupils.push(this.piece(pb, eyeAt(s), this.eyes));
    }
    // Long thin legs with three toes.
    for (const s of [-1, 1]) {
      const lb = new Builder();
      tube(lb, [[s * 0.022, 0.08, -0.01], [s * 0.022, 0.045, -0.002], [s * 0.022, 0.006, 0.004]], 0.0045, yellow, 4);
      for (const a of [-0.5, 0, 0.5]) lb.add(spike(4), yellow, { pos: [s * 0.022 + Math.sin(a) * 0.01, 0.004, 0.012 + Math.cos(a) * 0.008], rot: [Math.PI / 2, 0, -a], scale: [0.0035, 0.02, 0.003] });
      this.legs.push(this.piece(lb, [s * 0.022, 0.08, -0.01]));
    }
    // Arching tail plumes, dark green and teal.
    const tb = new Builder();
    [[-0.012, '#1f3a3a', 0.0], [0.0, '#2f6a64', 0.012], [0.012, '#1f3a3a', 0.004], [0.006, '#3a7a70', -0.016]].forEach(([x, c, dz]) => {
      const xx = x as number;
      const d = dz as number;
      tube(tb, [[xx, 0.14, -0.06], [xx, 0.2 + d, -0.085], [xx * 1.5, 0.225 + d, -0.12], [xx * 2, 0.2 + d, -0.15]], 0.0065, c as string, 5);
    });
    this.tail = this.piece(tb, [0, 0.14, -0.06]);
  }
  protected animate(dt: number, t: number, move: number) {
    const k = this.bonk.step(dt, move > 0.6);
    const p = this.peck.step(dt, move < 0.2);
    // Bonk: stopped dead, rocked back, and wobbling as it wears off.
    const hit = k < 0 ? 0 : Math.max(0, 1 - k * 1.3);
    const reel = k < 0 ? 0 : Math.exp(-k * 3) * Math.sin(k * 26);
    const dip = p < 0 ? 0 : bell(p);
    const w = t * 12;
    this.bodyGroup.position.y = hop(t, move, 0.012, 12) * (1 - hit);
    this.bodyGroup.rotation.set(move * 0.08 - hit * 0.35 + dip * 0.35, 0, reel * 0.2);
    this.legs.forEach((leg, i) => (leg.rotation.x = Math.sin(w + i * Math.PI) * 0.6 * move * (1 - hit) + hit * 0.25 - dip * 0.3));
    // A strut's head-bob: thrust forward, pulled back.
    const thrust = Math.sin(w) * 0.012 * move * (1 - hit);
    this.head.position.set(0, 0.145 + dip * -0.01, 0.03 + thrust - hit * 0.02);
    // The peck lands off to one side, nowhere near anything.
    this.head.rotation.set(dip * 1.1 - hit * 0.5 + Math.sin(t * 1.2) * 0.04, Math.sin(t * 0.7) * 0.3 * (1 - move) + dip * 0.35, reel * 0.4 + dip * 0.2);
    this.pupils.forEach((pp, i) => {
      // Never quite looking the same way: rattling about, and spinning after a bonk.
      const spin = reel * 9 + hit * t * 20;
      pp.rotation.set(Math.sin(t * (7 + i * 3.1) + i) * 0.5 + Math.sin(spin + i) * 0.6 * (k < 0 ? 0 : 1), Math.sin(t * (5.3 + i * 2.2)) * 0.7, 0);
    });
    this.tail.rotation.set(Math.sin(w) * 0.06 * move + hit * 0.3, Math.sin(t * 1.4) * 0.1, reel * 0.2);
  }
}

/** 15. A raccoon in an orange flight suit with a big blaster, who swaggers along and now and then takes aim at the sky. */
class Raccoon extends Critter {
  private head: THREE.Group;
  private legs: THREE.Group[] = [];
  private arms: THREE.Group[] = [];
  private tail: THREE.Group;
  private flash: THREE.Group;
  private aim = new Act(4, 9, 1.8);
  constructor() {
    const fur = '#8c7e72';
    const mask = '#3a3330';
    const light = '#efe7dc';
    const suit = '#e8762e';
    const dark = '#5a3a2a';
    const sc = new Sculpt();
    sc.add(ellipsoid('body', [0, 0.085, 0], [0.044, 0.054, 0.04], { name: 'body' }));
    const b = new Builder();
    b.addColored(
      sculpted(
        'raccoon',
        () => ({
          sc,
          marks: {
            base: suit,
            marks: [
              { color: dark, f: (q) => Math.abs(q.p.y - 0.062) - 0.005 },
              { color: '#c45e22', f: both(patch([0.018, 0.105, 0.04], [0.012, 0.012, 0.03]), (q) => -q.p.x) },
              { color: '#f4a46a', f: (q) => Math.max(Math.abs(q.p.x) - 0.0025, 0.07 - q.p.y, -q.p.z) },
              { color: dark, f: (q) => 0.124 - q.p.y },
            ],
          },
        }),
        0.016,
      ),
    );
    const hs = new Sculpt();
    hs.add(ellipsoid('body', [0, 0.178, 0.004], [0.048, 0.044, 0.044], { name: 'head' }));
    hs.add(ellipsoid('body', [0, 0.166, 0.044], [0.02, 0.016, 0.024], { k: 0.022, name: 'muzzle' }));
    for (const s of [-1, 1]) {
      hs.add(ellipsoid('body', [s * 0.044, 0.162, 0.008], [0.018, 0.015, 0.02], { rot: [0, 0, s * 0.4], k: 0.015, name: 'cheek' }));
      hs.add(pyramid('body', [s * 0.03, 0.212, -0.004], 0.016, 0.03, 0.008, { round: 0.002, rot: [0, 0, -s * 0.38], k: 0.01, name: 'ear' }));
    }
    const ez = frontZ(hs, 0.019, 0.184);
    const e = new Builder();
    irisEyes(e, 0.184, ez - 0.004, 0.019, 0.0105, '#c98d3c', 0.55);
    super(b, e, 0.184);
    const hb = new Builder();
    hb.addColored(
      sculpted(
        'raccoon-head',
        () => ({
          sc: hs,
          marks: {
            base: fur,
            marks: [
              { color: light, f: either(regionOf(hs, 'muzzle'), regionOf(hs, 'cheek'), both(regionOf(hs, 'ear'), (q) => -q.p.z), patch([0, 0.2, 0.038], [0.026, 0.0055, 0.02])) },
              // The mask: a band across the eyes, pointed at the middle.
              { color: mask, f: (q) => Math.max(Math.abs(q.p.y - 0.185 + Math.abs(q.p.x) * 0.15) - 0.011 - (Math.abs(q.p.x) < 0.008 ? -0.004 : 0), -q.p.z + 0.004) },
              { color: mask, f: regionOf(hs, 'ear') },
            ],
          },
        }),
        0.013,
      ),
    );
    hb.add(gem(), INK, { pos: [0, 0.17, frontZ(hs, 0, 0.17) + 0.001], scale: [0.006, 0.0045, 0.005] });
    tube(hb, onFront(hs, [[-0.008, 0.153], [0, 0.156], [0.01, 0.152]], 0.0008), 0.0013, '#3a2a28', 4);
    this.head = this.piece(hb, [0, 0.14, 0.0]);
    this.eyesOn(this.head);
    for (const s of [-1, 1]) {
      const lb = new Builder();
      tube(lb, [[s * 0.022, 0.045, 0], [s * 0.023, 0.014, 0.002]], 0.012, suit, 6);
      lb.add(sph(7, 5), '#3a3036', { pos: [s * 0.023, 0.01, 0.01], scale: [0.015, 0.01, 0.022] });
      this.legs.push(this.piece(lb, [s * 0.022, 0.045, 0.0]));
      const ab = new Builder();
      tube(ab, [[s * 0.04, 0.115, 0.0], [s * 0.054, 0.095, 0.016], [s * 0.05, 0.085, 0.032]], 0.009, suit, 5);
      ab.add(sph(6, 5), '#4a423e', { pos: [s * 0.05, 0.083, 0.036], scale: 0.008 });
      if (s > 0) {
        // The blaster: a chunky body, a barrel, a grip and a glowing light.
        ab.add(new THREE.BoxGeometry(1, 1, 1), '#5c6470', { pos: [0.05, 0.092, 0.05], scale: [0.016, 0.018, 0.046] });
        ab.add(new THREE.CylinderGeometry(1, 1, 1, 8), '#3c424c', { pos: [0.05, 0.095, 0.082], rot: [Math.PI / 2, 0, 0], scale: [0.0055, 0.03, 0.0055] });
        ab.add(new THREE.BoxGeometry(1, 1, 1), '#3c424c', { pos: [0.05, 0.078, 0.038], rot: [0.3, 0, 0], scale: [0.01, 0.02, 0.01] });
        ab.add(new THREE.BoxGeometry(1, 1, 1), '#7ad0ff', { pos: [0.05, 0.102, 0.05], scale: [0.012, 0.004, 0.02] });
      }
      this.arms.push(this.piece(ab, [s * 0.04, 0.115, 0.0]));
    }
    const fb = new Builder();
    fb.add(gem(), '#bfefff', { pos: [0.05, 0.095, 0.1], scale: [0.01, 0.01, 0.014] });
    this.flash = this.piece(fb, [0.05, 0.095, 0.1], this.arms[1], glow('#8fe0ff', 1.8));
    this.flash.visible = false;
    // A ringed tail.
    const ts = new Sculpt();
    ts.add(rod('body', [0, 0.06, -0.03], [0, 0.05, -0.085], 0.014, 0.022, { name: 'tail' }));
    ts.add(rod('body', [0, 0.05, -0.085], [0.012, 0.085, -0.13], 0.022, 0.01, { k: 0.01, name: 'tail' }));
    const tb = new Builder();
    tb.addColored(sculpted('raccoon-tail', () => ({ sc: ts, marks: { base: fur, marks: [{ color: mask, f: (q) => Math.abs(Math.sin((q.p.y * 0.6 - q.p.z) * 110)) - 0.45 }] } }), 0.012));
    this.tail = this.piece(tb, [0, 0.06, -0.03]);
  }
  protected animate(dt: number, t: number, move: number) {
    const a = this.aim.step(dt, move < 0.2);
    const up = a < 0 ? 0 : Math.min(1, bell(a) * 2.2);
    const shot = a > 0.45 && a < 0.55;
    const w = t * 10;
    // A swagger: a roll of the shoulders with every step.
    this.bodyGroup.position.y = hop(t, move, 0.014, 10);
    this.bodyGroup.rotation.set(move * 0.04 - up * 0.08, Math.sin(w) * 0.12 * move, Math.sin(w) * 0.06 * move);
    this.legs.forEach((leg, i) => (leg.rotation.x = Math.sin(w + i * Math.PI) * 0.55 * move));
    this.arms.forEach((arm, i) => {
      const s = i ? 1 : -1;
      const raise = i ? up : up * 0.6;
      arm.rotation.set(Math.sin(w + i * Math.PI + Math.PI) * 0.45 * move - raise * 1.2 + (shot && i ? 0.25 : 0), i ? -up * 0.15 : 0, s * raise * 0.1);
    });
    this.flash.visible = shot;
    this.head.rotation.set(-up * 0.25 + Math.sin(t * 1.3) * 0.04, Math.sin(t * 0.55) * 0.25 * (1 - move) * (1 - up) + up * 0.1, 0);
    this.tail.rotation.set(Math.sin(t * 1.6) * 0.08, Math.sin(t * 2.3) * 0.3 + Math.sin(w) * 0.2 * move, 0);
  }
}

/** This set's makers, for pets.ts's MAKERS. */
export const PETS4 = {
  doghouse: () => new Doghouse(),
  lasagne: () => new Lasagne(),
  lullaby: () => new Lullaby(),
  bulbtoad: () => new BulbToad(),
  flametail: () => new FlameTail(),
  squirt: () => new Squirt(),
  fluff: () => new Fluff(),
  headache: () => new Headache(),
  teddy: () => new Teddy(),
  porg: () => new Porg(),
  snowman: () => new Snowman(),
  crab: () => new Crab(),
  luckyfin: () => new LuckyFin(),
  rooster: () => new Rooster(),
  raccoon: () => new Raccoon(),
};

