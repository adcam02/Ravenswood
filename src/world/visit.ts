import * as THREE from 'three';
import { Builder, soft } from './build';
import { BED, ROOM_DOOR } from './town/layout';

/**
 * The hooded figure's visit to someone killed in the night. It's drawn only on the screen of the one it visits (and
 * the Storyteller's, if they're at that bedside): in at the bedroom door, a glide to the bedside, the deed (one of
 * four ways), and gone in a puff of smoke. Storybook spooky rather than gory: a jolt, a flash, a little wisp.
 *
 * Everything runs off `t`, seconds since it began, so it can be stopped at any moment to look at.
 */

/** When each part happens, in seconds. */
export const VISIT = { glide: 2.6, ready: 3.2, strike: 3.7, after: 4.8, vanish: 6.0, dark: 6.8, end: 11.5 };
export const VISIT_NAMES = ['dagger', 'pillow', 'poison', 'scythe'] as const;

/** How the one in bed moves while it happens: a jolt, a shake, a lift. */
export interface VictimPose {
  dy: number;
  shake: number;
}

const ROBE = '#2a2433';
const ROBE_HI = '#3a3146';
const BONE = '#e2dccd';
const VOID = '#060509';

const ease = (k: number) => {
  const c = Math.min(1, Math.max(0, k));
  return c * c * (3 - 2 * c);
};
const span = (t: number, a: number, b: number) => ease((t - a) / (b - a));

/** One arm from the shoulder: a sleeve that widens towards the cuff, a bony hand, and somewhere to hold things. */
function arm(material: THREE.Material, side: number) {
  const pivot = new THREE.Group();
  pivot.position.set(side * 0.27, 1.42, 0.02);
  const b = new Builder();
  b.add(new THREE.CylinderGeometry(0.075, 0.11, 0.6, 10, 1, true), ROBE_HI, { pos: [0, -0.3, 0] });
  b.add(new THREE.CylinderGeometry(0.11, 0.11, 0.02, 10), ROBE, { pos: [0, -0.6, 0] });
  b.add(new THREE.SphereGeometry(1, 10, 8), BONE, { pos: [0, -0.66, 0.01], scale: [0.055, 0.07, 0.05] });
  for (let k = 0; k < 3; k++) b.add(new THREE.CylinderGeometry(0.011, 0.009, 0.08, 5), BONE, { pos: [(k - 1) * 0.025, -0.73, 0.03], rot: [0.4, 0, 0] });
  const mesh = b.mesh(material, { cast: false, receive: false });
  pivot.add(mesh);
  const hand = new THREE.Group();
  hand.position.set(0, -0.7, 0.04);
  pivot.add(hand);
  return { pivot, hand };
}

function dagger(material: THREE.Material) {
  const b = new Builder();
  b.add(new THREE.CylinderGeometry(0.018, 0.018, 0.12, 8), '#4a3020', { pos: [0, 0, 0] });
  b.add(new THREE.BoxGeometry(0.1, 0.02, 0.03), '#c9a24f', { pos: [0, -0.07, 0] });
  b.add(new THREE.ConeGeometry(0.028, 0.28, 4), '#d8dde6', { pos: [0, -0.22, 0], rot: [Math.PI, Math.PI / 4, 0], scale: [1, 1, 0.35] });
  return b.mesh(material, { cast: false, receive: false });
}

function pillow(material: THREE.Material) {
  const b = new Builder();
  b.add(new THREE.SphereGeometry(1, 16, 10), '#f6f1e6', { scale: [0.32, 0.09, 0.22] });
  b.add(new THREE.TorusGeometry(0.2, 0.015, 6, 24), '#e8dcc0', { rot: [Math.PI / 2, 0, 0], scale: [1.4, 1, 1] });
  return b.mesh(material, { cast: false, receive: false });
}

function scythe(material: THREE.Material) {
  const b = new Builder();
  b.add(new THREE.CylinderGeometry(0.022, 0.026, 1.9, 8), '#3a2a1e', { pos: [0, 0.35, 0] });
  b.add(new THREE.CylinderGeometry(0.018, 0.018, 0.16, 6), '#3a2a1e', { pos: [0.06, 0.05, 0], rot: [0, 0, Math.PI / 2] });
  // The blade: a curve of short slivers, sweeping out from the top of the pole.
  for (let k = 0; k < 12; k++) {
    const a = (k / 11) * 1.5;
    const r = 0.78;
    const w = 0.15 * (1 - k / 14);
    b.add(new THREE.BoxGeometry(0.16, w, 0.02), k > 8 ? '#ffffff' : '#dfe4ec', {
      pos: [Math.sin(a) * r, 1.28 - (1 - Math.cos(a)) * r * 0.5, 0],
      rot: [0, 0, -a * 0.75],
    });
  }
  return b.mesh(material, { cast: false, receive: false });
}

function vial(material: THREE.Material, glowMat: THREE.Material) {
  const g = new THREE.Group();
  const b = new Builder();
  b.add(new THREE.CylinderGeometry(0.018, 0.018, 0.06, 8), '#d8d0c0', { pos: [0, 0.11, 0] });
  b.add(new THREE.CylinderGeometry(0.022, 0.022, 0.02, 8), '#7a5236', { pos: [0, 0.15, 0] });
  g.add(b.mesh(material, { cast: false, receive: false }));
  const liquid = new THREE.Mesh(new THREE.SphereGeometry(0.06, 12, 10), glowMat);
  liquid.position.y = 0.04;
  g.add(liquid);
  return g;
}

/** Puffs and droplets: small spheres that each live a moment, all sharing a few materials. */
class Bits {
  private pool: { mesh: THREE.Mesh; born: number; life: number; v: THREE.Vector3; grow: number; size: number; mat: THREE.MeshBasicMaterial }[] = [];
  private geo = new THREE.SphereGeometry(1, 8, 6);
  readonly group = new THREE.Group();

  emit(at: THREE.Vector3, t: number, n: number, opts: { color: string; speed: number; up?: number; size: number; grow?: number; life: number; opacity?: number; fall?: boolean }) {
    for (let i = 0; i < n; i++) {
      const mat = new THREE.MeshBasicMaterial({ color: opts.color, transparent: true, opacity: opts.opacity ?? 0.85, depthWrite: false });
      const mesh = new THREE.Mesh(this.geo, mat);
      mesh.position.copy(at);
      const a = Math.random() * Math.PI * 2;
      const e = (Math.random() - 0.3) * 1.2;
      const v = new THREE.Vector3(Math.cos(a) * Math.cos(e), Math.sin(e) + (opts.up ?? 0), Math.sin(a) * Math.cos(e)).multiplyScalar(opts.speed * (0.5 + Math.random() * 0.6));
      if (opts.fall) v.set((Math.random() - 0.5) * 0.08, -opts.speed, (Math.random() - 0.5) * 0.08);
      mesh.scale.setScalar(opts.size);
      this.group.add(mesh);
      this.pool.push({ mesh, born: t, life: opts.life * (0.7 + Math.random() * 0.6), v, grow: opts.grow ?? 1, size: opts.size, mat });
    }
  }

  update(t: number, dt: number) {
    this.pool = this.pool.filter((b) => {
      const age = (t - b.born) / b.life;
      if (age >= 1 || age < 0) {
        this.group.remove(b.mesh);
        b.mat.dispose();
        return false;
      }
      b.mesh.position.addScaledVector(b.v, dt);
      b.v.multiplyScalar(Math.max(0, 1 - dt * 1.5));
      b.mesh.scale.setScalar(b.size * (1 + (b.grow - 1) * age));
      b.mat.opacity = (1 - age) * 0.85;
      return true;
    });
  }

  dispose() {
    for (const b of this.pool) b.mat.dispose();
    this.pool = [];
    this.geo.dispose();
  }
}

export class NightVisit {
  readonly group = new THREE.Group();
  private figure = new THREE.Group();
  private body = new THREE.Group();
  private left: ReturnType<typeof arm>;
  private right: ReturnType<typeof arm>;
  private prop: THREE.Object3D | null = null;
  private material = soft();
  private eyeMat = new THREE.MeshBasicMaterial({ color: '#ff5a6a' });
  private glowMat = new THREE.MeshBasicMaterial({ color: '#ff6a7a', transparent: true, opacity: 0.35, depthWrite: false, blending: THREE.AdditiveBlending });
  private potionMat = new THREE.MeshBasicMaterial({ color: '#7dff6a' });
  private bits = new Bits();
  private lastT = 0;
  private fired = new Set<string>();
  /** Where it comes in, and where it stands by the bed. */
  private from = new THREE.Vector3(ROOM_DOOR.house.exit.x, 0, ROOM_DOOR.house.exit.z + 0.3);
  private to = new THREE.Vector3(BED.x - BED.w / 2 - 0.5, 0, BED.z - 0.55);
  /** Where the sleeper's head and chest are (roughly, until `aim` says exactly). */
  private head = new THREE.Vector3(BED.x, BED.top + 0.35, BED.z - BED.d / 2 + 0.55);
  private chest = new THREE.Vector3(BED.x, BED.top + 0.3, BED.z - 0.1);

  constructor(
    parent: THREE.Object3D,
    readonly variant: number,
    /** Sound cues as they come: 'creak', 'whoosh', 'strike', 'gasp', 'vanish'. */
    private cue: (name: string) => void = () => {},
  ) {
    const m = this.material;
    const b = new Builder();
    // The robe: a long flared cone with a ragged hem, shoulders, and the hood with its dark opening.
    b.add(new THREE.CylinderGeometry(0.2, 0.42, 1.36, 14, 1, true), ROBE, { pos: [0, 0.78, 0] });
    b.add(new THREE.CylinderGeometry(0.2, 0.2, 0.02, 14), ROBE, { pos: [0, 1.46, 0] });
    for (let k = 0; k < 12; k++) {
      const a = (k / 12) * Math.PI * 2;
      b.add(new THREE.ConeGeometry(0.07, 0.16, 4), ROBE, { pos: [Math.sin(a) * 0.38, 0.1, Math.cos(a) * 0.38], rot: [Math.PI, a, 0] });
    }
    b.add(new THREE.SphereGeometry(1, 14, 10), ROBE_HI, { pos: [0, 1.44, 0], scale: [0.32, 0.16, 0.24] });
    b.add(new THREE.SphereGeometry(1, 16, 12), ROBE, { pos: [0, 1.72, -0.02], scale: [0.23, 0.27, 0.25] });
    // The hood's point droops down the back, rather than standing up like an ear.
    b.add(new THREE.ConeGeometry(0.12, 0.34, 10), ROBE, { pos: [0, 1.64, -0.27], rot: [-2.1, 0, 0] });
    b.add(new THREE.SphereGeometry(1, 14, 10), VOID, { pos: [0, 1.69, 0.12], scale: [0.15, 0.19, 0.12] });
    // A rope belt.
    b.add(new THREE.TorusGeometry(0.26, 0.018, 6, 20), '#6a5a48', { pos: [0, 1.05, 0], rot: [Math.PI / 2, 0, 0], scale: [1, 0.85, 1] });
    this.body.add(b.mesh(m, { cast: false, receive: false }));
    // Two glowing eyes in the dark of the hood, with a soft glow round them.
    for (const sx of [-1, 1]) {
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.026, 8, 6), this.eyeMat);
      eye.position.set(sx * 0.055, 1.7, 0.2);
      eye.scale.set(1, 0.7, 0.6);
      const halo = new THREE.Mesh(new THREE.SphereGeometry(0.07, 10, 8), this.glowMat);
      halo.position.copy(eye.position);
      this.body.add(eye, halo);
    }
    this.left = arm(m, 1);
    this.right = arm(m, -1);
    this.body.add(this.left.pivot, this.right.pivot);
    this.figure.add(this.body);
    // What it carries.
    if (variant === 0) {
      this.prop = dagger(m);
      this.right.hand.add(this.prop);
    } else if (variant === 1) {
      // (Held in the room's own frame, so it can be carried from the hands to the bed.)
      this.prop = pillow(m);
      this.group.add(this.prop);
    } else if (variant === 2) {
      this.prop = vial(m, this.potionMat);
      this.right.hand.add(this.prop);
    } else {
      this.prop = scythe(m);
      this.right.hand.add(this.prop);
    }
    this.figure.visible = false;
    this.group.add(this.figure, this.bits.group);
    this.group.name = 'night-visit';
    parent.add(this.group);
  }

  /**
   * Aims at the one in bed, from the box round them as they lie (in the room's frame): the head at the pillow end,
   * the chest in the middle. Every animal lies a little differently, so this is measured rather than guessed.
   */
  aim(box: THREE.Box3) {
    if (box.isEmpty()) return;
    const c = box.getCenter(new THREE.Vector3());
    const depth = box.max.z - box.min.z;
    this.head.set(c.x, c.y + (box.max.y - c.y) * 0.5, box.min.z + Math.min(0.25, depth * 0.25));
    this.chest.set(c.x, c.y + (box.max.y - c.y) * 0.4, c.z);
    this.to.set(BED.x - BED.w / 2 - 0.5, 0, Math.min(BED.z + 0.4, this.head.z + 0.2));
  }

  private once(key: string, fn: () => void) {
    if (this.fired.has(key)) return;
    this.fired.add(key);
    fn();
  }

  /** Moves everything to `t` seconds in, and says how the sleeper reacts. */
  update(t: number): VictimPose {
    const dt = Math.max(0, Math.min(0.1, t - this.lastT));
    this.lastT = t;
    const V = VISIT;
    const f = this.figure;
    const shown = t >= 0.15 && t < V.vanish + 0.1;
    f.visible = shown;
    // In through the door in a puff of smoke, and a glide to the bedside with a gentle bob.
    if (t >= 0.1) this.once('in', () => {
      this.cue('creak');
      this.bits.emit(this.from.clone().setY(1), t, 14, { color: '#2a2036', speed: 1.2, size: 0.16, grow: 2.6, life: 1.2 });
    });
    const g = span(t, 0.2, V.glide);
    f.position.lerpVectors(this.from, this.to, g);
    const hover = 0.06 + Math.sin(t * 2.4) * 0.03;
    f.position.y = hover;
    // Facing where it's going, then the bed.
    const going = Math.atan2(this.to.x - this.from.x, this.to.z - this.from.z);
    const atBed = Math.atan2(this.head.x - this.to.x, this.head.z - this.to.z);
    f.rotation.y = going + (atBed - going) * span(t, V.glide - 0.5, V.glide + 0.2);
    if (t > 1.2) this.once('whoosh', () => this.cue('whoosh'));
    // A lean over the bed while it works.
    this.body.rotation.x = 0.28 * span(t, V.glide, V.ready) * (1 - span(t, V.after, V.vanish - 0.3));
    this.body.rotation.z = Math.sin(t * 1.7) * 0.03;
    // Arms at rest: hanging a little forward.
    let la = -0.25;
    let ra = -0.25;
    let laz = 0;
    let raz = 0;
    const pose: VictimPose = { dy: 0, shake: 0 };
    const k = this.variant;
    const strike = V.strike;
    if (k === 0) {
      // The dagger: up overhead, a quick stab down, a jolt.
      const up = span(t, V.glide, V.ready + 0.3);
      const down = span(t, strike - 0.05, strike + 0.1);
      ra = -0.25 - 2.6 * up + 1.9 * down;
      raz = 0.2 * up;
      if (t >= strike + 0.08) this.once('hit', () => {
        this.cue('strike');
        this.bits.emit(this.chest, t, 18, { color: '#d8343a', speed: 1.6, up: 0.6, size: 0.04, life: 0.8 });
        this.bits.emit(this.chest, t, 8, { color: '#ffffff', speed: 2.2, size: 0.03, life: 0.4 });
      });
      ra -= 1.2 * span(t, V.after, V.vanish - 0.4);
    } else if (k === 1) {
      // The pillow: held out in both hands, pressed down over the sleeper's face, and the struggle.
      const reach = span(t, V.glide - 0.3, V.ready);
      la = ra = -0.25 - 1.15 * reach;
      laz = -0.35 * reach;
      raz = 0.35 * reach;
      const press = span(t, strike - 0.3, strike + 0.1) * (1 - span(t, V.after + 0.2, V.after + 0.7));
      const held = new THREE.Vector3(0, 1.05, 0.55).applyAxisAngle(new THREE.Vector3(0, 1, 0), f.rotation.y).add(f.position);
      const onFace = this.head.clone().setY(this.head.y + 0.06 + Math.abs(Math.sin(t * 11)) * 0.03 * press);
      const p = this.prop!;
      p.position.lerpVectors(held, onFace, press);
      p.rotation.set(0, f.rotation.y, 0);
      la += 0.5 * press;
      ra += 0.5 * press;
      if (press > 0.6) this.once('hit', () => this.cue('strike'));
    } else if (k === 2) {
      // The poison: the glowing vial raised over the sleeper and tipped, green drops, and green bubbles after.
      const lift = span(t, V.glide, V.ready);
      ra = -0.25 - 1.5 * lift;
      raz = -0.25 * lift;
      const tip = span(t, strike - 0.4, strike);
      if (this.prop) this.prop.rotation.z = -2.2 * tip;
      if (t > strike && t < V.after) {
        const drop = Math.floor((t - strike) / 0.12);
        this.once(`drop${drop}`, () => {
          const at = new THREE.Vector3();
          this.right.hand.getWorldPosition(at);
          this.group.worldToLocal(at);
          this.bits.emit(at, t, 1, { color: '#7dff6a', speed: 1.4, size: 0.025, life: 0.45, fall: true });
        });
      }
      if (t > strike + 0.3) this.once('hit', () => this.cue('strike'));
      if (t > strike + 0.4 && t < V.dark) {
        const bubble = Math.floor((t - strike) / 0.18);
        this.once(`bub${bubble}`, () => this.bits.emit(this.head, t, 1, { color: '#8de07a', speed: 0.45, up: 1.2, size: 0.035, grow: 1.6, life: 1.4 }));
      }
      this.potionMat.color.setHSL(0.31, 1, 0.6 + Math.sin(t * 9) * 0.08);
    } else {
      // The scythe: raised high behind, a sweeping swing over the bed, a flash, and a little wisp rising.
      const raise = span(t, V.glide - 0.4, V.ready + 0.2);
      const swing = span(t, strike - 0.1, strike + 0.15);
      la = ra = -0.25 - 2.7 * raise + 2.2 * swing;
      if (this.prop) this.prop.rotation.x = -0.6 * raise + 1.5 * swing;
      if (t >= strike + 0.15) this.once('hit', () => {
        this.cue('strike');
        this.bits.emit(this.chest, t, 14, { color: '#ffffff', speed: 2.4, size: 0.035, life: 0.5 });
      });
      if (t >= strike + 0.5) this.once('wisp', () => this.bits.emit(this.chest, t, 1, { color: '#e8f2ff', speed: 0.5, up: 1.6, size: 0.1, grow: 1.4, life: 2.4, opacity: 0.7 }));
    }
    // The sleeper: a jolt at the moment, then shaking that dies away.
    const since = t - strike;
    if (since > 0 && since < 2) {
      pose.dy = k === 1 ? 0 : Math.max(0, 0.12 * Math.exp(-since * 8) * Math.sin(since * 30));
      pose.shake = (k === 1 ? 0.14 : 0.08) * Math.exp(-since * (k === 1 ? 1.4 : 3)) * Math.sin(since * (k === 1 ? 26 : 40));
    }
    if (t > V.after) this.once('gasp', () => this.cue('gasp'));
    this.left.pivot.rotation.set(la, 0, laz);
    this.right.pivot.rotation.set(ra, 0, raz);
    // Gone in a swirl of smoke.
    // (Drawn up into the middle of itself as it goes, rather than shrinking to the floor.)
    const shrink = span(t, V.vanish - 0.45, V.vanish);
    f.scale.setScalar(1 - 0.9 * shrink);
    f.position.y += 0.95 * shrink;
    if (t >= V.vanish - 0.5) this.once('out', () => {
      this.cue('vanish');
      this.bits.emit(f.position.clone().setY(1.0), t, 26, { color: '#2a2036', speed: 1.3, up: 0.3, size: 0.24, grow: 2.6, life: 1.5, opacity: 0.95 });
    });
    if (this.variant === 1 && this.prop) this.prop.visible = shown;
    this.glowMat.opacity = 0.3 + Math.sin(t * 6) * 0.08;
    this.bits.update(t, dt);
    return pose;
  }

  dispose() {
    this.group.removeFromParent();
    this.group.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (mesh.isMesh) mesh.geometry.dispose();
    });
    this.bits.dispose();
    for (const m of [this.material, this.eyeMat, this.glowMat, this.potionMat]) m.dispose();
  }
}
