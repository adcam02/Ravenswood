import * as THREE from 'three';
import { Builder, rng, soft } from './build';
import { BED, ROOM_DOOR } from './town/layout';

/**
 * The hooded figure's visit to someone killed in the night. It's drawn only on the screen of the one it visits (and
 * the Storyteller's, if they're at that bedside): in at the bedroom door, a glide to the bedside, the deed (one of
 * ten ways), and gone in a puff of smoke. Storybook spooky rather than gory: a jolt, a flash, a little wisp.
 *
 * Everything runs off `t`, seconds since it began, so it can be stopped at any moment to look at.
 */

/** When each part happens, in seconds. */
export const VISIT = { glide: 2.6, ready: 3.2, strike: 3.7, after: 4.8, vanish: 6.0, dark: 6.8, end: 11.5 };
export const VISIT_NAMES = ['dagger', 'pillow', 'poison', 'scythe', 'mallet', 'jack', 'lightning', 'ravens', 'snuffer', 'trapdoor'] as const;

/** How the one in bed moves while it happens: a jolt, a shake, a lift. */
export interface VictimPose {
  dy: number;
  shake: number;
  /** Squashed flat (under 1) or stretched tall (over 1), bulging or thinning at the sides to match. */
  squash?: number;
  /** Whirled round about the upright, in radians. */
  spin?: number;
  /** Out of sight (dropped through the bed), so their name tag goes too. */
  hidden?: boolean;
}

/** Puts the squash and the whirl of `pose` on the sleeper, once the jolt and the shake are on. */
export function bendVictim(root: THREE.Object3D, pose: VictimPose) {
  if (pose.spin) root.rotation.y += pose.spin;
  if (pose.squash !== undefined && pose.squash !== 1) {
    const w = 1 + (1 - pose.squash) * 0.6;
    root.scale.x *= w;
    root.scale.y *= pose.squash;
    root.scale.z *= w;
  }
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
  /** The box round them as they lie, for props made to their size. */
  private box = new THREE.Box3(new THREE.Vector3(BED.x - 0.4, BED.top, BED.z - 1.1), new THREE.Vector3(BED.x + 0.4, BED.top + 0.55, BED.z + 0.7));
  /** The newer ways (from the mallet on) each keep their props and moves in one of these. */
  private act: Act | null = null;

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
    } else if (variant === 3) {
      this.prop = scythe(m);
      this.right.hand.add(this.prop);
    } else {
      const stage: Stage = {
        room: this.group,
        figure: this.figure,
        body: this.body,
        left: this.left,
        right: this.right,
        material: m,
        bits: this.bits,
        box: this.box,
        head: this.head,
        chest: this.chest,
        cue: (name) => this.cue(name),
        once: (key, fn) => this.once(key, fn),
      };
      this.act = new ACTS[(variant - 4) % ACTS.length](stage);
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
    this.box.copy(box);
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
    } else if (k === 3) {
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
    } else if (this.act) {
      ({ la, ra, laz, raz } = this.act.update(t, pose, shown));
    }
    // The sleeper: a jolt at the moment, then shaking that dies away (the newer ways do their own).
    const since = t - strike;
    if (!this.act && since > 0 && since < 2) {
      pose.dy = k === 1 ? 0 : Math.max(0, 0.12 * Math.exp(-since * 8) * Math.sin(since * 30));
      pose.shake = (k === 1 ? 0.14 : 0.08) * Math.exp(-since * (k === 1 ? 1.4 : 3)) * Math.sin(since * (k === 1 ? 26 : 40));
    }
    if (t > V.after && !this.act) this.once('gasp', () => this.cue('gasp'));
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
    this.act?.dispose();
    for (const m of [this.material, this.eyeMat, this.glowMat, this.potionMat]) m.dispose();
  }
}

// ---------------------------------------------------------------- the newer ways

type Arm = ReturnType<typeof arm>;

/** What one of the newer ways works with: the figure and its arms, the room, the one in bed, and the effects. */
interface Stage {
  /** The room's frame, for props that leave the figure's hands. */
  room: THREE.Group;
  figure: THREE.Group;
  body: THREE.Group;
  left: Arm;
  right: Arm;
  material: THREE.Material;
  bits: Bits;
  /** The one in bed (kept up to date by `aim`): the box round them, their head and their chest. */
  box: THREE.Box3;
  head: THREE.Vector3;
  chest: THREE.Vector3;
  cue: (name: string) => void;
  once: (key: string, fn: () => void) => void;
}

/** How the arms are this moment: swung forward and up from hanging (negative), and out to the side. */
interface Arms {
  la: number;
  ra: number;
  laz: number;
  raz: number;
}

/** One of the newer ways: its props, and where they, the figure's arms and the sleeper are at `t`. */
interface Act {
  update(t: number, pose: VictimPose, shown: boolean): Arms;
  dispose(): void;
}

const UP = new THREE.Vector3(0, 1, 0);
/** Where the sleeper lies: the top of the mattress, which squashing and stretching them works from. */
const FLOOR = BED.top;
/** The top of the quilt. */
const COVERS = BED.top + 0.055;
const lerp = THREE.MathUtils.lerp;
const clamp = THREE.MathUtils.clamp;
const tmpQ = new THREE.Quaternion();

/** A soft-shaded mesh of a few coloured parts, for the props. */
function parts(material: THREE.Material, add: (b: Builder) => void): THREE.Mesh {
  const b = new Builder();
  add(b);
  return b.mesh(material, { cast: false, receive: false });
}

/** A flat five-pointed star, a little thick. */
function starGeometry(r: number): THREE.BufferGeometry {
  const shape = new THREE.Shape();
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2;
    const rr = i % 2 ? r * 0.45 : r;
    if (i) shape.lineTo(Math.sin(a) * rr, Math.cos(a) * rr);
    else shape.moveTo(Math.sin(a) * rr, Math.cos(a) * rr);
  }
  return new THREE.ExtrudeGeometry(shape, { depth: r * 0.35, bevelEnabled: false }).center();
}

/** Turns `obj` so its +y runs along `y` and its +z as near `z` as it can. */
function orient(obj: THREE.Object3D, y: THREE.Vector3, z: THREE.Vector3) {
  const Y = y.clone().normalize();
  const X = new THREE.Vector3().crossVectors(Y, z);
  if (X.lengthSq() < 1e-6) X.set(1, 0, 0);
  X.normalize();
  const Z = new THREE.Vector3().crossVectors(X, Y);
  obj.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(X, Y, Z));
}

/** Stretches a rod a unit long along y from `a` to `b`: centred on its origin, or standing on it (`from`). */
function between(rod: THREE.Object3D, a: THREE.Vector3, b: THREE.Vector3, thick = 1, from = false) {
  const d = b.clone().sub(a);
  const len = Math.max(0.001, d.length());
  rod.position.copy(a).addScaledVector(d, from ? 0 : 0.5);
  rod.quaternion.setFromUnitVectors(UP, d.divideScalar(len));
  rod.scale.set(thick, len, thick);
}

/** The helpers every newer way shares: where things are about the figure, and arms that reach for them. */
abstract class Deed implements Act {
  constructor(protected s: Stage) {}

  abstract update(t: number, pose: VictimPose, shown: boolean): Arms;

  dispose() {}

  /** How far the figure has drawn into itself, vanishing (0 to 1). */
  protected gone(t: number) {
    return span(t, VISIT.vanish - 0.45, VISIT.vanish);
  }

  /** A point in the figure's own frame, moved into the room's, following it as it vanishes. */
  private toRoom(t: number, p: THREE.Vector3) {
    const g = this.gone(t);
    const f = this.s.figure;
    return p
      .multiplyScalar(1 - 0.9 * g)
      .applyAxisAngle(UP, f.rotation.y)
      .add(f.position)
      .add(new THREE.Vector3(0, 0.95 * g, 0));
  }

  /** A point about the figure (x to its left, y up, z ahead), in the room's frame. */
  protected ahead(t: number, x: number, y: number, z: number) {
    return this.toRoom(t, new THREE.Vector3(x, y, z));
  }

  /** Where a shoulder is (`side` 1 for the left, -1 the right, 0 between them), leaning with the body. */
  protected shoulder(t: number, side: number) {
    return this.toRoom(t, new THREE.Vector3(side * 0.27, 1.42, 0.02).applyQuaternion(this.s.body.quaternion));
  }

  /** An arm's swing and spread that point its hand at `at` (in the room's frame). `side` is 1 for the left. */
  protected reach(t: number, side: number, at: THREE.Vector3): [number, number] {
    const f = this.s.figure;
    const g = this.gone(t);
    const p = at
      .clone()
      .sub(f.position)
      .sub(new THREE.Vector3(0, 0.95 * g, 0))
      .applyAxisAngle(UP, -f.rotation.y)
      .divideScalar(1 - 0.9 * g);
    p.applyQuaternion(tmpQ.copy(this.s.body.quaternion).invert());
    p.x -= side * 0.27;
    p.y -= 1.42;
    p.z -= 0.02;
    p.normalize();
    let rx = Math.atan2(-p.z, -p.y);
    if (rx > 0.6) rx -= Math.PI * 2;
    return [rx, Math.asin(clamp(p.x, -1, 1))];
  }

  /** Both hands on one thing. */
  protected both(t: number, at: THREE.Vector3): Arms {
    const [la, laz] = this.reach(t, 1, at);
    const [ra, raz] = this.reach(t, -1, at);
    return { la, ra, laz, raz };
  }

  /** The sleeper's top, as they lie, squashed or not. */
  protected top(squash = 1) {
    return FLOOR + (this.s.box.max.y - FLOOR) * squash;
  }
}

/**
 * The giant mallet: carried over the shoulder, a trembling wind-up, BONK, the sleeper squashed flat as a pancake,
 * then springing back up with a wobble and stars going round their head.
 */
class Mallet extends Deed {
  private grip = new THREE.Group();
  private handle: THREE.Mesh;
  private mallet: THREE.Mesh;
  private stars: THREE.Mesh[] = [];
  private starMat = new THREE.MeshBasicMaterial({ color: '#ffd84a' });
  private flat = 0.3;

  constructor(s: Stage) {
    super(s);
    this.handle = parts(s.material, (b) => b.add(new THREE.CylinderGeometry(0.035, 0.042, 1, 8), '#7a5236'));
    this.mallet = parts(s.material, (b) => {
      // A fat wooden barrel lying across the top of the handle, with iron bands and pale end grain.
      b.add(new THREE.CylinderGeometry(0.25, 0.25, 0.64, 18), '#b5794a', { rot: [Math.PI / 2, 0, 0] });
      for (const z of [-0.25, 0.25]) b.add(new THREE.CylinderGeometry(0.262, 0.262, 0.07, 18), '#55515c', { pos: [0, 0, z], rot: [Math.PI / 2, 0, 0] });
      for (const z of [-0.322, 0.322]) b.add(new THREE.CylinderGeometry(0.2, 0.2, 0.01, 18), '#e2b27c', { pos: [0, 0, z], rot: [Math.PI / 2, 0, 0] });
    });
    this.grip.add(this.handle, this.mallet);
    s.room.add(this.grip);
    const geo = starGeometry(0.06);
    for (let i = 0; i < 5; i++) {
      const star = new THREE.Mesh(geo, this.starMat);
      star.visible = false;
      this.stars.push(star);
      s.room.add(star);
    }
  }

  update(t: number, pose: VictimPose, shown: boolean): Arms {
    const s = this.s;
    const V = VISIT;
    const hit = V.strike - 0.05;
    const sw = clamp((t - 3.45) / (hit - 3.45), 0, 1);
    // Leaning back into the wind-up, and over into the blow.
    s.body.rotation.x += -0.4 * span(t, 2.4, 3.2) * (1 - sw) + 0.22 * sw * (1 - span(t, V.after, V.after + 0.5));
    // It swings from the shoulders, arms straight along the handle, and comes down on top of the sleeper as they'll
    // be once flattened, so it lands square on any animal.
    const pivot = this.shoulder(t, 0);
    const target = new THREE.Vector3(s.chest.x, this.top(this.flat) + 0.25, s.chest.z);
    const toward = target.clone().sub(pivot).setY(0);
    const across = toward.length();
    toward.normalize();
    const fwd = new THREE.Vector3(Math.sin(s.figure.rotation.y), 0, Math.cos(s.figure.rotation.y));
    const plane = fwd.lerp(toward, span(t, V.glide - 0.6, V.glide)).normalize();
    const down = target.y - pivot.y;
    const R = clamp(Math.hypot(across, down), 1.0, 2.3);
    const landed = Math.atan2(across, down);
    // The angle from straight up: on the shoulder, back for the wind-up (trembling), the swing (quickening), a
    // little bounce off the sleeper, and back on the shoulder.
    const wound = -1.15 + Math.sin(t * 40) * 0.04 * span(t, 2.95, 3.15);
    let th = lerp(-0.55, wound, span(t, 2.2, 3.2));
    th = lerp(th, landed, sw * sw);
    if (t > hit) th -= 0.16 * Math.exp(-(t - hit) * 9) * Math.abs(Math.sin((t - hit) * 24));
    th = lerp(th, -0.55, span(t, V.after - 0.15, V.after + 0.45));
    const dir = UP.clone().multiplyScalar(Math.cos(th)).addScaledVector(plane, Math.sin(th));
    const swing = UP.clone().multiplyScalar(-Math.sin(th)).addScaledVector(plane, Math.cos(th));
    const scale = 1 - 0.9 * this.gone(t);
    const gripAt = pivot.clone().addScaledVector(dir, 0.66 * scale);
    this.grip.position.copy(gripAt);
    orient(this.grip, dir, swing);
    this.grip.scale.setScalar(scale);
    const len = R - 0.66;
    this.handle.scale.y = len;
    this.handle.position.y = len / 2;
    this.mallet.position.y = len;
    this.grip.visible = shown;
    if (t >= hit) {
      s.once('bonk', () => {
        s.cue('bonk');
        s.bits.emit(new THREE.Vector3(s.chest.x, COVERS + 0.04, s.chest.z), t, 12, { color: '#fff6e6', speed: 2.2, size: 0.035, grow: 1.6, life: 0.5 });
      });
    }
    if (t > 2.25) s.once('windup', () => s.cue('windup'));
    // The sleeper: flat while the mallet's on them, then up like a spring, wobbling, with a hop.
    const back = V.after - 0.1;
    if (t >= hit && t < back) pose.squash = this.flat + 0.07 * Math.exp(-(t - hit) * 12) * Math.sin((t - hit) * 50);
    else if (t >= back) {
      const w = t - back;
      pose.squash = 1 - (1 - this.flat) * Math.exp(-w * 4) * Math.cos(w * 14);
      pose.dy = 0.14 * Math.max(0, Math.sin(w * 8)) * Math.exp(-w * 3);
      s.once('boing', () => s.cue('boing'));
    }
    if (t > hit + 0.35) s.once('tweet', () => s.cue('tweet'));
    // Stars round their head, from the bonk until a moment after the figure has gone.
    const on = span(t, hit + 0.05, hit + 0.3) * (1 - span(t, V.vanish + 0.3, V.vanish + 0.8));
    const y = this.top(pose.squash ?? 1) + 0.12;
    this.stars.forEach((star, i) => {
      const a = t * 4.5 + (i / 5) * Math.PI * 2;
      star.visible = on > 0.01;
      star.position.set(s.head.x + Math.cos(a) * 0.26, y + Math.sin(a * 2 + i) * 0.035, s.head.z + Math.sin(a) * 0.2);
      star.rotation.set(0.3, a * 1.6, 0);
      star.scale.setScalar(on);
    });
    return this.both(t, gripAt);
  }

  dispose() {
    this.starMat.dispose();
  }
}

/** A coil spring a metre long, standing on the origin, for scaling to length. */
class Coil extends THREE.Curve<THREE.Vector3> {
  constructor() {
    super();
  }

  getPoint(u: number, out = new THREE.Vector3()) {
    const a = u * Math.PI * 2 * 10;
    return out.set(Math.cos(a) * 0.045, u, Math.sin(a) * 0.045);
  }
}

/**
 * The jack-in-the-box: held out over the sleeper's face and wound, tinkling a little tune, the box jiggling, then
 * POP: a grinning jester on a spring right in their face. They leap out of their skin, land flat, and shiver.
 */
class JackInTheBox extends Deed {
  private box = new THREE.Group();
  private lid = new THREE.Group();
  private crank = new THREE.Group();
  private spring: THREE.Mesh;
  private jester = new THREE.Group();

  constructor(s: Stage) {
    super(s);
    const m = s.material;
    this.box.add(
      parts(m, (b) => {
        b.add(new THREE.BoxGeometry(0.26, 0.26, 0.26), '#c8363d', { pos: [0, 0.13, 0] });
        // Yellow trim round the top and bottom, and a diamond on each side.
        for (const y of [0.012, 0.248]) b.add(new THREE.BoxGeometry(0.274, 0.026, 0.274), '#f6c445', { pos: [0, y, 0] });
        for (let k = 0; k < 4; k++) {
          const a = (k * Math.PI) / 2;
          b.add(new THREE.BoxGeometry(0.1, 0.1, 0.012), k % 2 ? '#3f7fc4' : '#f6c445', { pos: [Math.sin(a) * 0.132, 0.13, Math.cos(a) * 0.132], rot: [0, a, Math.PI / 4] });
        }
      }),
    );
    // The lid, hinged along the back.
    this.lid.position.set(0, 0.262, -0.135);
    this.lid.add(
      parts(m, (b) => {
        b.add(new THREE.BoxGeometry(0.28, 0.03, 0.28), '#c8363d', { pos: [0, 0.015, 0.135] });
        b.add(new THREE.SphereGeometry(0.025, 8, 6), '#f6c445', { pos: [0, 0.035, 0.135] });
      }),
    );
    // The crank on its side (towards the figure's winding hand).
    this.crank.position.set(-0.135, 0.13, 0);
    this.crank.add(
      parts(m, (b) => {
        b.add(new THREE.CylinderGeometry(0.014, 0.014, 0.05, 6), '#c9a24f', { pos: [-0.025, 0, 0], rot: [0, 0, Math.PI / 2] });
        b.add(new THREE.BoxGeometry(0.018, 0.09, 0.018), '#c9a24f', { pos: [-0.05, 0.04, 0] });
        b.add(new THREE.CylinderGeometry(0.016, 0.016, 0.06, 6), '#7a5236', { pos: [-0.08, 0.08, 0], rot: [0, 0, Math.PI / 2] });
      }),
    );
    this.box.add(this.lid, this.crank);
    this.spring = parts(m, (b) => b.add(new THREE.TubeGeometry(new Coil(), 200, 0.009, 5, false), '#c8ccd4'));
    // The jester: a white face with a red nose and a wide grin, a three-pointed hat with bells, a frilly ruff.
    const head = parts(m, (b) => {
      b.add(new THREE.SphereGeometry(0.12, 16, 12), '#f4efe6');
      for (const sx of [-1, 1]) {
        b.add(new THREE.SphereGeometry(0.028, 8, 6), '#1d1a24', { pos: [sx * 0.045, 0.03, 0.1], scale: [1, 1.2, 0.6] });
        b.add(new THREE.SphereGeometry(0.025, 8, 6), '#f2a7b8', { pos: [sx * 0.072, -0.025, 0.088], scale: [1, 0.6, 0.5] });
      }
      b.add(new THREE.SphereGeometry(0.026, 8, 6), '#d8343a', { pos: [0, 0.0, 0.122] });
      b.add(new THREE.TorusGeometry(0.058, 0.012, 6, 14, Math.PI), '#9a2030', { pos: [0, -0.035, 0.098], rot: [0.35, 0, Math.PI] });
      for (const [a, col] of [
        [-0.95, '#7a4ab0'],
        [0, '#3f9c58'],
        [0.95, '#d8343a'],
      ] as const) {
        b.add(new THREE.ConeGeometry(0.065, 0.24, 8), col, { pos: [Math.sin(a) * 0.11, 0.12 + Math.cos(a) * 0.08, -0.01], rot: [0, 0, -a] });
        b.add(new THREE.SphereGeometry(0.026, 8, 6), '#f6c445', { pos: [Math.sin(a) * 0.22, 0.12 + Math.cos(a) * 0.19, -0.01] });
      }
      b.add(new THREE.TorusGeometry(0.105, 0.022, 6, 16), '#f6c445', { pos: [0, 0.075, 0], rot: [Math.PI / 2, 0, 0] });
      for (let k = 0; k < 10; k++) {
        const a = (k / 10) * Math.PI * 2;
        b.add(new THREE.SphereGeometry(0.045, 6, 5), k % 2 ? '#ffffff' : '#e8dcc0', { pos: [Math.sin(a) * 0.09, -0.125, Math.cos(a) * 0.09], scale: [1, 0.55, 1] });
      }
    });
    head.position.y = 0.15;
    this.jester.add(head);
    s.room.add(this.box, this.spring, this.jester);
  }

  update(t: number, pose: VictimPose, shown: boolean): Arms {
    const s = this.s;
    const V = VISIT;
    const pop = V.strike;
    // (A little bigger than a real one, so it reads across the room.)
    const scale = 1.3 * (1 - 0.9 * this.gone(t));
    // Carried in front, then held out over the bed beside the sleeper's face, nearer the figure.
    const carried = this.ahead(t, 0.2, 0.95, 0.42);
    const held = this.ahead(t, 0.05, 0, 0);
    held.lerp(s.head, 0.6);
    held.y = Math.max(s.head.y - 0.1, COVERS + 0.25) + 0.95 * this.gone(t);
    const out = span(t, 2.3, 2.9);
    const at = carried.clone().lerp(held, out);
    const facing = Math.atan2(s.head.x - at.x, s.head.z - at.z);
    const fwd = s.figure.rotation.y;
    const yaw = fwd + Math.atan2(Math.sin(facing - fwd), Math.cos(facing - fwd)) * out;
    // Wound for a little over a turn and a half, jiggling to the tune, then a kick back as it goes off.
    const wind = clamp((t - 2.8) / 0.85, 0, 1);
    const winding = wind > 0 && wind < 1 ? 1 : 0;
    const kick = t > pop ? 0.08 * Math.exp(-(t - pop) * 10) : 0;
    this.box.position.copy(at).add(new THREE.Vector3(-Math.sin(yaw) * kick, Math.abs(Math.sin(t * 26)) * 0.012 * winding, -Math.cos(yaw) * kick));
    this.box.rotation.set(0, yaw, Math.sin(t * 30) * 0.05 * winding);
    this.box.scale.setScalar(scale);
    const turn = wind * Math.PI * 2 * 1.6;
    this.crank.rotation.x = turn;
    // The lid rattles just before, then flies open.
    const rattle = span(t, pop - 0.2, pop - 0.1) * (t < pop ? 1 : 0);
    this.lid.rotation.x = -0.12 * rattle * Math.abs(Math.sin(t * 60)) - 2.3 * span(t, pop, pop + 0.06);
    if (t > 2.8) s.once('crank', () => s.cue('crank'));
    // The jester: tucked away, then out on its spring into the sleeper's face, boinging, swaying as it laughs.
    const u = t - pop;
    // (A point on the box, in the room's frame.)
    const onBox = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z).multiplyScalar(scale).applyAxisAngle(UP, yaw).add(this.box.position);
    const base = onBox(0, 0.22, 0);
    const toward = at.clone().sub(s.head).setY(0).normalize();
    const face = s.head.clone().addScaledVector(toward, 0.3).add(new THREE.Vector3(0, 0.2, 0));
    const out2 = u <= 0 ? 0 : 1 - Math.exp(-u * 6) * Math.cos(u * 16);
    const sway = u <= 0 ? 0 : 0.12 * Math.exp(-u * 2.5) * Math.sin(u * 11) + 0.04 * Math.sin(t * 5) * span(u, 0.6, 1.2);
    const side = new THREE.Vector3().crossVectors(UP, toward).normalize();
    const jAt = base.clone().lerp(face, out2).addScaledVector(side, sway * out2).addScaledVector(UP, 0.06 * Math.sin(t * 9) * span(u, 0.5, 1));
    const out3 = u > 0 && shown;
    this.spring.visible = out3;
    this.jester.visible = out3;
    if (out3) {
      between(this.spring, base, jAt, 1, true);
      this.jester.position.copy(jAt);
      // Looking at the sleeper, turned a little towards the room so its face reads.
      const look = s.head.clone().sub(jAt).setY(0).normalize().add(new THREE.Vector3(0, 0, 0.55)).normalize();
      orient(this.jester, UP.clone().addScaledVector(side, sway), look);
      this.jester.scale.setScalar(scale * 1.1 * clamp(out2 * 3, 0, 1));
    }
    this.box.visible = shown;
    if (u > 0) {
      s.once('pop', () => {
        s.cue('pop');
        s.bits.emit(base, t, 10, { color: '#f6c445', speed: 1.6, up: 0.5, size: 0.025, life: 0.5 });
      });
    }
    if (u > 0.04) s.once('eek', () => s.cue('eek'));
    if (u > 0.5) s.once('cackle', () => s.cue('cackle'));
    // The sleeper leaps out of their skin, stretched tall, then lands squashed and lies shivering.
    if (u > 0.04) {
      const w = u - 0.04;
      const air = 0.5;
      if (w < air) {
        pose.dy = 0.6 * Math.sin((Math.PI * w) / air);
        pose.squash = 1 + 0.38 * (1 - w / air) * Math.min(1, w * 25);
      } else {
        const v = w - air;
        pose.squash = 1 - 0.3 * Math.exp(-v * 7) * Math.cos(v * 18);
        pose.shake = 0.06 * Math.exp(-v * 2.2) * Math.sin(v * 52);
      }
    }
    // Left hand under the box, right hand on the crank.
    const knob = onBox(-0.215, 0.13 + Math.cos(turn) * 0.08, Math.sin(turn) * 0.08);
    const [la, laz] = this.reach(t, 1, at);
    const [ra, raz] = this.reach(t, -1, t > 2.6 && t < V.after ? knob : at);
    return { la, ra, laz, raz };
  }
}

/**
 * The spellbook: it floats up out of the robe and falls open, pages riffling and glowing runes drifting up. A bony
 * finger raised calls a little storm cloud over the bed; then it points, and a bolt of lightning cracks down. A
 * flash fills the room; the sleeper jitters, stood on end, sparking, and then lies there smoking.
 */
class Lightning extends Deed {
  private book = new THREE.Group();
  private covers: THREE.Group[] = [];
  private leaf = new THREE.Group();
  private pageGlow: THREE.Mesh;
  private cloud: THREE.Mesh;
  private bolt: THREE.Mesh[] = [];
  private flash: THREE.Mesh;
  private glowMat = new THREE.MeshBasicMaterial({ color: '#9fffe0', transparent: true, opacity: 0.5, depthWrite: false, blending: THREE.AdditiveBlending });
  private boltMat = new THREE.MeshBasicMaterial({ color: '#fffbe6' });
  private haloMat = new THREE.MeshBasicMaterial({ color: '#8fc8ff', transparent: true, opacity: 0.6, depthWrite: false, blending: THREE.AdditiveBlending });
  private flashMat = new THREE.MeshBasicMaterial({ color: '#dfe8ff', transparent: true, opacity: 0, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending, side: THREE.BackSide });
  private cloudMat = new THREE.MeshLambertMaterial({ vertexColors: true, emissive: '#000000' });
  private boltGeo = new THREE.BoxGeometry(1, 1, 1);

  constructor(s: Stage) {
    super(s);
    const m = s.material;
    // The book: two covers hinged on the spine (running away from the figure), each with its block of pages.
    this.book.add(parts(m, (b) => b.add(new THREE.CylinderGeometry(0.024, 0.024, 0.44, 8), '#4a2e66', { rot: [Math.PI / 2, 0, 0] })));
    for (const side of [1, -1]) {
      const pivot = new THREE.Group();
      pivot.add(
        parts(m, (b) => {
          b.add(new THREE.BoxGeometry(0.17, 0.02, 0.44), '#5a3a7a', { pos: [side * 0.085, 0, 0] });
          b.add(new THREE.BoxGeometry(0.155, 0.035, 0.41), '#f1e6c8', { pos: [side * 0.08, 0.026, 0] });
          for (const z of [-0.2, 0.2]) b.add(new THREE.BoxGeometry(0.04, 0.026, 0.04), '#c9a24f', { pos: [side * 0.155, 0, z] });
          // A gold moon on the outside.
          b.add(new THREE.TorusGeometry(0.05, 0.013, 6, 14, Math.PI * 1.3), '#e8c45a', { pos: [side * 0.085, -0.013, 0], rot: [Math.PI / 2, 0, 0.6] });
        }),
      );
      this.covers.push(pivot);
      this.book.add(pivot);
    }
    this.leaf.position.y = 0.045;
    this.leaf.add(parts(m, (b) => b.add(new THREE.BoxGeometry(0.15, 0.004, 0.4), '#fbf3dc', { pos: [0.075, 0, 0] })));
    this.pageGlow = new THREE.Mesh(new THREE.SphereGeometry(0.2, 12, 8), this.glowMat);
    this.pageGlow.scale.set(1, 0.3, 1.15);
    this.pageGlow.position.y = 0.07;
    this.book.add(this.leaf, this.pageGlow);
    this.book.position.set(0, 1.12, 0.52);
    s.figure.add(this.book);
    // The storm cloud: a lumpy cluster of puffs, lit from inside as it crackles.
    const b = new Builder();
    for (const [x, y, z, r, col] of [
      [0, 0, 0, 0.3, '#7d7896'],
      [0.3, 0.02, 0.05, 0.24, '#726d8a'],
      [-0.31, 0.01, -0.03, 0.25, '#726d8a'],
      [0.12, 0.14, -0.05, 0.22, '#938eae'],
      [-0.12, 0.12, 0.06, 0.23, '#938eae'],
      [0.52, -0.04, 0, 0.17, '#5f5a76'],
      [-0.53, -0.03, 0.02, 0.17, '#5f5a76'],
      [0.05, -0.08, 0.16, 0.2, '#5f5a76'],
      [-0.05, -0.06, -0.17, 0.2, '#5f5a76'],
    ] as const)
      b.add(new THREE.SphereGeometry(1, 12, 9), col, { pos: [x, y, z], scale: [r, r * 0.8, r] });
    this.cloud = b.mesh(this.cloudMat, { cast: false, receive: false });
    this.cloud.visible = false;
    for (let i = 0; i < 16; i++) {
      const seg = new THREE.Mesh(this.boltGeo, i % 2 ? this.haloMat : this.boltMat);
      seg.visible = false;
      this.bolt.push(seg);
    }
    // The flash: a huge ball round the room, seen from inside, added over everything for a moment.
    this.flash = new THREE.Mesh(new THREE.SphereGeometry(30, 16, 10), this.flashMat);
    this.flash.frustumCulled = false;
    this.flash.renderOrder = 10;
    this.flash.visible = false;
    s.room.add(this.cloud, this.flash, ...this.bolt);
  }

  update(t: number, pose: VictimPose, shown: boolean): Arms {
    const s = this.s;
    const V = VISIT;
    const u = t - V.strike;
    // The book rises out of the robe, opens, riffles, and snaps shut when it's done.
    const appear = span(t, 2.2, 2.6);
    const open = span(t, 2.45, 2.85) * (1 - span(t, V.after + 0.3, V.after + 0.5));
    this.book.visible = appear > 0.01;
    this.book.scale.setScalar(1.3 * appear);
    this.book.position.y = 1.12 + Math.sin(t * 3) * 0.025;
    this.book.rotation.set(-0.55 + 0.1 * Math.sin(t * 1.7), 0, 0);
    this.covers.forEach((c, i) => (c.rotation.z = (i ? -1 : 1) * (Math.PI / 2 - 0.08) * (1 - open)));
    const riffle = open > 0.95 && t < V.strike + 0.2;
    this.leaf.visible = riffle;
    this.leaf.rotation.z = Math.PI * ((t * 2.6) % 1);
    this.glowMat.opacity = open * (0.35 + 0.15 * Math.sin(t * 9));
    const bookAt = this.ahead(t, 0, 1.15, 0.52);
    if (t > 2.3) s.once('spell', () => {
      s.cue('spell');
      s.bits.emit(bookAt, t, 10, { color: '#9fffe0', speed: 0.9, size: 0.025, life: 0.6 });
    });
    if (open > 0.5 && t < V.strike + 0.1) {
      const k = Math.floor(t / 0.07);
      s.once(`rune${k}`, () => {
        const at = bookAt.clone().add(new THREE.Vector3((Math.random() - 0.5) * 0.2, 0.06, (Math.random() - 0.5) * 0.2));
        s.bits.emit(at, t, 1, { color: '#9fffe0', speed: 0.25, up: 2.4, size: 0.022, life: 1.0 });
      });
    }
    // The cloud gathers over the head of the bed (clear of the sleeper from where anyone watches), crackles,
    // and drifts up and away after.
    const cloudAt = new THREE.Vector3(s.chest.x, Math.max(this.top() + 0.75, 1.6), Math.max(BED.z - BED.d / 2 + 0.45, s.head.z - 0.1));
    const gather = span(t, 2.95, 3.45) * (1 - span(t, V.after - 0.2, V.after + 0.5));
    this.cloud.visible = gather > 0.01 && shown;
    this.cloud.position.copy(cloudAt).add(new THREE.Vector3(0, 0.5 * span(t, V.after - 0.2, V.after + 0.5), 0));
    this.cloud.scale.set(gather * (1 + 0.04 * Math.sin(t * 5)), gather * (1 + 0.05 * Math.sin(t * 4 + 1)), gather);
    this.cloud.rotation.y = t * 0.4;
    if (t > 2.95) s.once('cloud', () => s.bits.emit(cloudAt, t, 10, { color: '#4d4860', speed: 0.8, size: 0.14, grow: 1.8, life: 0.8 }));
    if (t > 3.15) s.once('crackle', () => s.cue('crackle'));
    // Flickers inside it, quickening towards the strike.
    const glimmer = t > 3.2 && t < V.strike ? (Math.sin(t * (30 + (t - 3.2) * 80)) > 0.6 ? 0.5 : 0) : 0;
    // The bolt flickers three times, a fresh zigzag each time.
    const flashes = [
      [0, 0.07],
      [0.11, 0.17],
      [0.24, 0.3],
    ];
    const lit = flashes.findIndex(([a, z]) => u >= a && u < z);
    const on = lit >= 0 && shown;
    const from = cloudAt.clone().add(new THREE.Vector3(0, -0.15, 0));
    const to = new THREE.Vector3(s.chest.x, this.top() + 0.02, s.chest.z);
    if (on) {
      const r = rng(lit * 7 + 3);
      const pts = [from];
      for (let i = 1; i < 8; i++) pts.push(from.clone().lerp(to, i / 8).add(new THREE.Vector3((r() - 0.5) * 0.26, (r() - 0.5) * 0.05, (r() - 0.5) * 0.26)));
      pts.push(to);
      for (let i = 0; i < 8; i++) {
        between(this.bolt[i * 2], pts[i], pts[i + 1], 0.035);
        between(this.bolt[i * 2 + 1], pts[i], pts[i + 1], 0.13);
      }
    }
    for (const seg of this.bolt) seg.visible = on;
    const flash = on ? Math.exp(-u * 3) : 0;
    this.flash.visible = flash > 0.01;
    this.flash.position.copy(to);
    this.flashMat.opacity = 0.55 * flash;
    this.cloudMat.emissive.setRGB(0.45, 0.6, 0.85).multiplyScalar(Math.max(glimmer, flash));
    if (u >= 0) s.once('thunder', () => {
      s.cue('thunder');
      s.bits.emit(to, t, 22, { color: '#fff2a0', speed: 2.6, up: 0.4, size: 0.03, life: 0.5 });
    });
    if (u > 0.35) s.once('fizzle', () => s.cue('fizzle'));
    // The sleeper: stood on end and jittering, sparks crackling off them, then slumped and smoking.
    if (u >= 0) {
      const fade = Math.exp(-u * 2.2);
      pose.shake = 0.1 * fade * Math.sin(u * 95);
      pose.dy = 0.07 * fade * Math.abs(Math.sin(u * 41));
      pose.squash = 1 + 0.22 * Math.exp(-u * 1.8) - 0.07 * span(u, 0.9, 1.5);
      if (u < 0.9) {
        s.once(`spark${Math.floor(u / 0.09)}`, () => s.bits.emit(s.chest, t, 2, { color: '#bfe4ff', speed: 1.6, up: 0.6, size: 0.022, life: 0.35 }));
      }
      if (u > 0.35 && t < V.after + 0.8) {
        const at = new THREE.Vector3(s.chest.x, this.top(), s.chest.z);
        s.once(`smoke${Math.floor(u / 0.16)}`, () => s.bits.emit(at, t, 1, { color: '#6a6878', speed: 0.3, up: 1.8, size: 0.07, grow: 2.4, life: 1.6, opacity: 0.6 }));
      }
      if (u > 0.9) s.once('wisp', () => s.bits.emit(s.chest, t, 1, { color: '#e8f2ff', speed: 0.5, up: 1.6, size: 0.1, grow: 1.4, life: 2.4, opacity: 0.7 }));
    }
    // The left hand under the book; the right raised to the cloud, then pointing down at the sleeper.
    const [la, laz] = this.reach(t, 1, this.ahead(t, 0.05, 1.0, 0.5));
    const [ra0, raz0] = this.reach(t, -1, cloudAt.clone().lerp(to, span(t, V.strike - 0.15, V.strike)));
    const raise = span(t, 2.9, 3.3) * (1 - span(t, V.after, V.after + 0.4));
    s.body.rotation.x -= 0.15 * span(t, 2.9, 3.3) * (1 - span(t, V.strike - 0.15, V.strike));
    return { la: lerp(-0.25, la, appear), laz: laz * appear, ra: lerp(-0.25, ra0, raise), raz: raz0 * raise };
  }

  dispose() {
    for (const m of [this.glowMat, this.boltMat, this.haloMat, this.flashMat, this.cloudMat]) m.dispose();
    this.boltGeo.dispose();
  }
}

/**
 * The ravens: the figure flings its cloak open and a flock bursts out, circles over the bed cawing, then dives
 * round the sleeper in a whirlwind that lifts them up and spins them round. The birds scatter up into the dark,
 * the sleeper drops back with a bounce, and black feathers drift down over the covers.
 */
class Ravens extends Deed {
  private birds: { root: THREE.Group; wings: THREE.Group[] }[] = [];
  private feathers: THREE.Mesh[] = [];
  private n = 9;

  constructor(s: Stage) {
    super(s);
    const m = s.material;
    const body = new Builder();
    body.add(new THREE.SphereGeometry(1, 12, 8), '#2a2536', { scale: [0.075, 0.07, 0.15] });
    body.add(new THREE.SphereGeometry(0.062, 10, 8), '#2a2536', { pos: [0, 0.045, 0.13] });
    body.add(new THREE.ConeGeometry(0.022, 0.085, 6), '#5a5468', { pos: [0, 0.035, 0.215], rot: [Math.PI / 2, 0, 0] });
    for (const sx of [-1, 1]) body.add(new THREE.SphereGeometry(0.014, 6, 5), '#ff7080', { pos: [sx * 0.04, 0.065, 0.165] });
    body.add(new THREE.ConeGeometry(0.065, 0.15, 6), '#211d2b', { pos: [0, 0.0, -0.18], rot: [-Math.PI / 2, 0, 0], scale: [1, 1, 0.3] });
    const bodyGeo = body.geometry();
    const wingGeo = (side: number) => {
      const w = new Builder();
      w.add(new THREE.SphereGeometry(1, 10, 6), '#332c44', { pos: [side * 0.15, 0, 0], scale: [0.16, 0.012, 0.07] });
      w.add(new THREE.SphereGeometry(1, 10, 6), '#2a2438', { pos: [side * 0.3, 0, -0.03], scale: [0.11, 0.01, 0.05], rot: [0, side * 0.35, 0] });
      return w.geometry();
    };
    const wingL = wingGeo(1);
    const wingR = wingGeo(-1);
    for (let i = 0; i < this.n; i++) {
      const root = new THREE.Group();
      root.add(new THREE.Mesh(bodyGeo, m));
      const wings = [1, -1].map((side) => {
        const pivot = new THREE.Group();
        pivot.position.set(side * 0.055, 0.03, 0.02);
        pivot.add(new THREE.Mesh(side > 0 ? wingL : wingR, m));
        root.add(pivot);
        return pivot;
      });
      root.visible = false;
      this.birds.push({ root, wings });
      s.room.add(root);
    }
    const featherGeo = parts(m, (b) => {
      b.add(new THREE.SphereGeometry(1, 8, 5), '#3a3348', { scale: [0.1, 0.006, 0.03] });
      b.add(new THREE.BoxGeometry(0.15, 0.008, 0.006), '#6a6478', { pos: [-0.015, 0.003, 0] });
    }).geometry;
    for (let j = 0; j < 14; j++) {
      const f = new THREE.Mesh(featherGeo, m);
      f.visible = false;
      this.feathers.push(f);
      s.room.add(f);
    }
  }

  /** Where raven `i` is at `t`: out of the figure, round over the bed, down in a whirl round the sleeper, and off. */
  private at(i: number, t: number): { p: THREE.Vector3; size: number; centre: THREE.Vector3 } {
    const s = this.s;
    const V = VISIT;
    const phase = (i / this.n) * Math.PI * 2;
    const tier = ((i * 5) % this.n) / this.n;
    const centre = new THREE.Vector3(s.chest.x, Math.min(this.top() + 0.7, 1.9), s.chest.z);
    const whirl = span(t, V.strike, V.strike + 0.3);
    const leave = clamp((t - V.after) / 0.7, 0, 1);
    const a = phase + 3.5 * (t - 3.05) + 2.75 * Math.max(0, t - V.strike) ** 2;
    const r = lerp(0.95, 0.5, whirl) + 3 * leave * leave;
    const y = lerp(centre.y + tier * 0.3, s.chest.y - 0.05 + tier * 0.6 + 0.5 * span(t, 3.75, 4.2), whirl) + 2.6 * leave;
    const p = new THREE.Vector3(centre.x + Math.cos(a) * r, y, centre.z + Math.sin(a) * r * 0.85);
    // Bursting out of the figure's chest on the way.
    const burst = clamp((t - 3.05) / 0.5, 0, 1);
    if (burst < 1) {
      const from = this.ahead(t, 0, 1.2, 0.25);
      p.copy(from.lerp(p, ease(burst))).add(new THREE.Vector3(0, Math.sin(Math.PI * burst) * 0.4, 0));
    }
    return { p, size: clamp(burst * 3, 0, 1) * (1 - leave), centre };
  }

  update(t: number, pose: VictimPose, shown: boolean): Arms {
    const s = this.s;
    const V = VISIT;
    const flying = t > 3.05 && t < V.after + 0.7 && shown;
    this.birds.forEach((bird, i) => {
      const { root, wings } = bird;
      root.visible = flying;
      if (!flying) return;
      const now = this.at(i, t);
      const next = this.at(i, t + 0.02);
      const fwd = next.p.clone().sub(now.p);
      // Banked into the turn.
      const lean = now.centre.clone().sub(now.p).setY(0).normalize().multiplyScalar(0.7).add(UP);
      const X = new THREE.Vector3().crossVectors(lean, fwd).normalize();
      const Y = new THREE.Vector3().crossVectors(fwd.normalize(), X);
      root.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(X, Y, fwd));
      root.position.copy(now.p);
      root.scale.setScalar(Math.max(0.001, now.size));
      const flap = Math.sin(t * 24 + i * 1.7) * 0.9;
      wings[0].rotation.z = flap;
      wings[1].rotation.z = -flap;
    });
    if (t > 3.05) s.once('flock', () => {
      s.cue('flock');
      s.bits.emit(this.ahead(t, 0, 1.2, 0.3), t, 14, { color: '#2a2036', speed: 1.4, size: 0.1, grow: 2.2, life: 0.9 });
    });
    if (t > 3.6) s.once('caw1', () => s.cue('caw'));
    if (t > 4.3) s.once('caw2', () => s.cue('caw'));
    if (t > V.after) s.once('scatter', () => s.cue('scatter'));
    // Feathers shaken loose in the whirl, drifting down to lie on the covers, gone a moment after the figure.
    this.feathers.forEach((f, j) => {
      const born = V.strike + 0.05 + j * 0.075;
      const age = t - born;
      f.visible = age > 0 && t < V.vanish + 0.9 && shown;
      if (!f.visible) return;
      const start = this.at(j % this.n, born).p;
      const y = Math.max(COVERS + 0.01, start.y - 0.38 * age);
      const settled = y <= COVERS + 0.011;
      f.position.set(start.x + Math.sin(age * 4 + j) * 0.12, y, start.z + Math.cos(age * 3 + j) * 0.1);
      f.rotation.set(settled ? 0 : Math.sin(age * 5 + j) * 0.6, j * 1.3 + age * 0.8, settled ? 0 : Math.cos(age * 4 + j) * 0.5);
      f.scale.setScalar(1 - span(t, V.vanish + 0.3, V.vanish + 0.9));
    });
    // The sleeper: lifted up into the whirl and spun round three times, then dropped back with a bounce.
    if (t > 3.75 && t < V.after) {
      pose.dy = 0.5 * span(t, 3.75, 4.2) + 0.03 * Math.sin(t * 9);
      pose.shake = 0.05 * Math.sin(t * 13) * span(t, 3.75, 4.0);
    } else if (t >= V.after) {
      const w = t - V.after;
      const land = Math.sqrt(0.5 / 6);
      if (w < land) pose.dy = Math.max(0, 0.5 - 6 * w * w);
      else {
        const v = w - land;
        pose.dy = 0.08 * Math.abs(Math.sin(v * 10)) * Math.exp(-v * 5);
        pose.squash = 1 - 0.2 * Math.exp(-v * 6) * Math.cos(v * 16);
      }
    }
    pose.spin = Math.PI * 2 * 3 * span(t, 3.8, V.after + 0.15);
    // Arms flung wide (the cloak thrown open), then raised high, stirring the whirl, and down again.
    const fling = span(t, 2.85, 3.05) * (1 - span(t, 3.4, 3.7));
    const stir = span(t, 3.5, 3.8) * (1 - span(t, V.after, V.after + 0.4));
    s.body.rotation.x -= 0.25 * fling;
    const la = -0.25 - 1.0 * fling - (2.2 + Math.sin(t * 6) * 0.25) * stir;
    const ra = -0.25 - 1.0 * fling - (2.2 + Math.sin(t * 6 + Math.PI) * 0.25) * stir;
    return { la, ra, laz: 1.3 * fling + 0.45 * stir, raz: -1.3 * fling - 0.45 * stir };
  }
}

/**
 * The candle snuffer, as big as the sleeper: carried upright like a lamp on a pole, swung over the bed and brought
 * down over them, fwump. A curl of smoke rises from its tip; it jiggles a moment, then is still. Lifted away, the
 * sleeper lies a little flattened, a thin wisp rising from them like a candle just blown out.
 */
class Snuffer extends Deed {
  private bell: THREE.Mesh;
  private handle: THREE.Mesh;
  private ring: THREE.Mesh;

  constructor(s: Stage) {
    super(s);
    const m = s.material;
    // A brass bell a unit across and a little over a unit tall, open underneath (dark inside), with a rolled rim and a
    // knob on top; stretched to fit whoever is in bed.
    const out = [
      [1.0, 0],
      [0.97, 0.08],
      [0.82, 0.3],
      [0.58, 0.58],
      [0.33, 0.84],
      [0.16, 0.98],
      [0.1, 1.04],
      [0, 1.06],
    ].map(([x, y]) => new THREE.Vector2(x, y));
    const inside = out.map((v) => new THREE.Vector2(Math.max(0, v.x - 0.04), Math.max(0, v.y - 0.04))).reverse();
    this.bell = parts(m, (b) => {
      b.add(new THREE.LatheGeometry(out, 24), '#c9a24f');
      b.add(new THREE.LatheGeometry(inside, 24), '#4a3818');
      b.add(new THREE.TorusGeometry(0.99, 0.035, 6, 32), '#e2be66', { rot: [Math.PI / 2, 0, 0] });
      b.add(new THREE.SphereGeometry(0.08, 10, 8), '#e2be66', { pos: [0, 1.1, 0] });
    });
    this.handle = parts(m, (b) => b.add(new THREE.CylinderGeometry(0.028, 0.028, 1, 8), '#b08a3a'));
    this.ring = parts(m, (b) => b.add(new THREE.TorusGeometry(0.075, 0.018, 6, 16), '#c9a24f'));
    s.room.add(this.bell, this.handle, this.ring);
  }

  update(t: number, pose: VictimPose, shown: boolean): Arms {
    const s = this.s;
    const V = VISIT;
    const box = s.box;
    const g = 1 - 0.9 * this.gone(t);
    // Carried a handy size, it swells to fit the sleeper as it swings over the bed, and shrinks back after.
    const grow = lerp(0.4, 1, span(t, 2.6, 3.3) * (1 - span(t, V.after + 0.3, V.after + 0.9)));
    const rx = clamp((box.max.x - box.min.x) / 2 + 0.15, 0.32, 0.95) * grow;
    const rz = clamp((box.max.z - box.min.z) / 2 + 0.15, 0.36, 1.4) * grow;
    const h = clamp(box.max.y - FLOOR + 0.2, 0.55, 1.5) * grow;
    const mid = box.getCenter(new THREE.Vector3());
    // Where the rim's middle is: held up over the figure's shoulder, swung across over the sleeper, down onto the
    // covers, held there, lifted, and back on the shoulder.
    const carried = this.ahead(t, -0.35, 2.0, 0.15);
    const over = new THREE.Vector3(mid.x, this.top() + 0.45, mid.z);
    const on = new THREE.Vector3(mid.x, COVERS - 0.01, mid.z);
    const across = span(t, 2.5, 3.25) * (1 - span(t, V.after + 0.3, V.after + 0.9));
    const at = carried.clone().lerp(over, across).add(new THREE.Vector3(0, Math.sin(Math.PI * across) * 0.35, 0));
    const lower = clamp((t - 3.4) / (V.strike - 3.4), 0, 1);
    const drop = lower * lower * (1 - span(t, V.after - 0.2, V.after + 0.3));
    at.lerp(on, drop);
    this.bell.position.copy(at);
    // A squash as it lands, and a jiggle while the sleeper struggles underneath.
    const u = t - V.strike;
    const thump = u > 0 ? Math.exp(-u * 10) * Math.sin(u * 40) * 0.08 : 0;
    const jiggle = u > 0.15 && t < V.after - 0.3 ? Math.sin(t * 27) * 0.04 * Math.exp(-(u - 0.15) * 2.5) : 0;
    this.bell.scale.set(rx * g * (1 + thump), h * g * (1 - thump), rz * g * (1 + thump));
    this.bell.rotation.set(0, 0, jiggle);
    // The handle, from the bell's shoulder (on the figure's side) to the hand.
    const shoulder = this.ahead(t, -0.27, 1.42, 0.05);
    const toward = shoulder.clone().sub(at).setY(0).normalize();
    const fix = at.clone().add(new THREE.Vector3(toward.x * rx * 0.3 * g, h * 0.88 * g, toward.z * rz * 0.3 * g));
    const reachLen = Math.max(0.4, fix.distanceTo(shoulder) - 0.65 * g);
    const grip = fix.clone().addScaledVector(shoulder.clone().sub(fix).normalize(), reachLen);
    between(this.handle, fix, grip, g);
    this.ring.position.copy(grip);
    this.ring.quaternion.copy(this.handle.quaternion);
    this.ring.scale.setScalar(g);
    this.bell.visible = this.handle.visible = this.ring.visible = shown;
    if (t > 2.6) s.once('swing', () => s.cue('whoosh'));
    if (u >= 0) s.once('fwump', () => {
      s.cue('fwump');
      s.bits.emit(new THREE.Vector3(mid.x, COVERS + 0.05, mid.z), t, 18, { color: '#efe6d6', speed: 2.0, up: 0.1, size: 0.06, grow: 2, life: 0.6, opacity: 0.7 });
    });
    if (u > 0.15) s.once('hiss', () => s.cue('hiss'));
    // Smoke curling out of the little hole at its tip while it's down.
    if (u > 0.15 && t < V.after) {
      const tip = at.clone().add(new THREE.Vector3(0, h * 1.12 * g, 0));
      s.once(`curl${Math.floor(u / 0.14)}`, () => s.bits.emit(tip, t, 1, { color: '#8a8898', speed: 0.25, up: 2.2, size: 0.05, grow: 2.2, life: 1.3, opacity: 0.7 }));
    }
    // The sleeper: pressed a little flat underneath, and left so, with a thin wisp rising off them.
    if (u > 0) pose.squash = 0.8 + 0.08 * span(t, V.after - 0.2, V.after + 0.6);
    if (t > V.after && t < V.vanish + 0.6) {
      const k = Math.floor((t - V.after) / 0.12);
      const wick = new THREE.Vector3(s.head.x, this.top(0.88) + 0.02, s.head.z);
      s.once(`wick${k}`, () => s.bits.emit(wick, t, 1, { color: '#b8b6c4', speed: 0.12, up: 3, size: 0.025, grow: 2.2, life: 1.2, opacity: 0.6 }));
    }
    // Both hands on it while it's over the bed; just the right hand carrying it.
    const both = this.both(t, grip);
    const [ra, raz] = this.reach(t, -1, grip);
    return across > 0.2 ? both : { la: -0.25, laz: 0, ra, raz };
  }
}

/**
 * The trapdoor: a lever pops up out of the floorboards beside the figure, and a trapdoor appears in the bed under
 * the sleeper. A look round at whoever is watching, a yank on the lever, and the doors drop open: the sleeper
 * hangs in the air a heartbeat, then plummets with a whistle. A far-off thud, the doors slam shut, the lever sinks
 * away; and once the figure has gone, their ghost floats back up through the covers.
 */
class Trapdoor extends Deed {
  private lever = new THREE.Group();
  private stick = new THREE.Group();
  private hatch = new THREE.Group();
  private doors: THREE.Group[] = [];
  private holeMat = new THREE.MeshBasicMaterial({ color: VOID });
  private built = false;

  constructor(s: Stage) {
    super(s);
    const m = s.material;
    this.lever.add(
      parts(m, (b) => {
        b.add(new THREE.BoxGeometry(0.24, 0.1, 0.32), '#4a3020', { pos: [0, 0.05, 0] });
        b.add(new THREE.BoxGeometry(0.06, 0.02, 0.22), '#1d1a24', { pos: [0, 0.1, 0] });
      }),
    );
    this.stick.position.y = 0.08;
    this.stick.add(
      parts(m, (b) => {
        b.add(new THREE.CylinderGeometry(0.022, 0.026, 0.72, 8), '#6a6470', { pos: [0, 0.36, 0] });
        b.add(new THREE.SphereGeometry(0.065, 12, 10), '#d8343a', { pos: [0, 0.74, 0] });
      }),
    );
    this.lever.add(this.stick);
    this.lever.visible = false;
    this.hatch.visible = false;
    s.room.add(this.lever, this.hatch);
  }

  /** The trapdoor, made to the sleeper's size once we know it: a dark frame, the hole, and two doors. */
  private build() {
    this.built = true;
    const s = this.s;
    const box = s.box;
    const x0 = Math.max(BED.x - BED.w / 2 + 0.12, box.min.x - 0.06);
    const x1 = Math.min(BED.x + BED.w / 2 - 0.12, box.max.x + 0.06);
    const z0 = Math.max(BED.z - 0.85, box.min.z - 0.05);
    const z1 = Math.min(BED.z + BED.d / 2 - 0.2, box.max.z + 0.05);
    const w = Math.max(0.5, x1 - x0);
    const d = Math.max(0.6, z1 - z0);
    this.hatch.position.set((x0 + x1) / 2, COVERS + 0.035, (z0 + z1) / 2);
    const hole = new THREE.Mesh(new THREE.PlaneGeometry(w, d), this.holeMat);
    hole.rotation.x = -Math.PI / 2;
    this.hatch.add(hole);
    this.hatch.add(
      parts(s.material, (b) => {
        for (const sz of [-1, 1]) b.add(new THREE.BoxGeometry(w + 0.12, 0.035, 0.06), '#4a3020', { pos: [0, 0.01, sz * (d / 2 + 0.03)] });
        for (const sx of [-1, 1]) b.add(new THREE.BoxGeometry(0.06, 0.035, d), '#4a3020', { pos: [sx * (w / 2 + 0.03), 0.01, 0] });
        for (const sx of [-1, 1]) for (const sz of [-1, 1]) b.add(new THREE.BoxGeometry(0.07, 0.04, 0.07), '#55515c', { pos: [sx * (w / 2 + 0.03), 0.012, sz * (d / 2 + 0.03)] });
      }),
    );
    // Each door hinged on its long outside edge, planked, with iron straps and a ring to pull.
    for (const side of [-1, 1]) {
      const pivot = new THREE.Group();
      pivot.position.set(side * (w / 2), 0.004, 0);
      pivot.add(
        parts(s.material, (b) => {
          const dw = w / 2 - 0.006;
          b.add(new THREE.BoxGeometry(dw, 0.022, d - 0.01), '#a0703f', { pos: [-side * (dw / 2), 0.011, 0] });
          for (let k = 1; k < 3; k++) b.add(new THREE.BoxGeometry(0.008, 0.024, d - 0.03), '#5a3a22', { pos: [-side * (dw * k) / 3, 0.012, 0] });
          for (const z of [-d / 3, d / 3]) b.add(new THREE.BoxGeometry(dw * 0.6, 0.026, 0.035), '#3a3640', { pos: [-side * dw * 0.3, 0.013, z] });
          b.add(new THREE.TorusGeometry(0.03, 0.007, 5, 10), '#3a3640', { pos: [-side * (dw - 0.06), 0.026, 0], rot: [Math.PI / 2, 0, 0] });
        }),
      );
      this.doors.push(pivot);
      this.hatch.add(pivot);
    }
  }

  update(t: number, pose: VictimPose, shown: boolean): Arms {
    const s = this.s;
    const V = VISIT;
    if (!this.built && t > 2.2) this.build();
    const u = t - V.strike;
    // The lever, up out of the floor at the figure's right hand, and back down after.
    const up = span(t, 2.65, 2.9) * (1 - span(t, V.after + 0.3, V.after + 0.7));
    const base = this.ahead(t, -0.55, 0, 0.3);
    this.lever.position.set(base.x, -0.95 * (1 - up), base.z);
    this.lever.rotation.y = s.figure.rotation.y;
    this.lever.visible = up > 0.01 && shown;
    if (t > 2.65) s.once('lever-up', () => s.bits.emit(base.clone().setY(0.1), t, 10, { color: '#2a2036', speed: 1.0, size: 0.1, grow: 2, life: 0.8 }));
    const yank = span(t, V.strike - 0.16, V.strike - 0.05) * (1 - span(t, V.after + 0.05, V.after + 0.25));
    this.stick.rotation.x = 0.5 - 1.15 * yank;
    if (t > V.strike - 0.14) s.once('lever', () => s.cue('lever'));
    // The trapdoor appears under the sleeper with a puff, then goes the same way after.
    const there = span(t, 2.8, 3.05) * (1 - span(t, V.after + 0.5, V.after + 0.8));
    this.hatch.visible = there > 0.01 && this.built;
    this.hatch.scale.set(there, 1, there);
    if (t > 2.8 && this.built) s.once('hatch', () => s.bits.emit(this.hatch.position, t, 12, { color: '#efe6d6', speed: 1.2, up: 0.2, size: 0.06, grow: 2, life: 0.7, opacity: 0.6 }));
    // The doors drop open with a little bounce, and slam shut.
    const open = (u > 0 ? Math.min(1, u / 0.1) + 0.12 * Math.exp(-u * 8) * Math.sin(u * 30) : 0) * (1 - span(t, V.after, V.after + 0.1));
    this.doors.forEach((d, i) => (d.rotation.z = (i ? 1 : -1) * 1.9 * open));
    if (u > 0) s.once('open', () => s.cue('creak'));
    if (t > V.after + 0.08) s.once('slam', () => {
      s.cue('slam');
      s.bits.emit(this.hatch.position, t, 16, { color: '#efe6d6', speed: 1.8, up: 0.2, size: 0.06, grow: 2, life: 0.7, opacity: 0.7 });
    });
    // The sleeper: a heartbeat hanging in the air (stretched, looking down), then gone with a whistle, a thud far
    // below, and once the figure has gone, back up through the covers as a ghost.
    const hang = 0.2;
    if (u > 0 && u < hang) {
      pose.squash = 1 + 0.12 * Math.sin((Math.PI * u) / hang);
      pose.shake = 0.04 * Math.sin(u * 60);
    } else if (u >= hang) {
      const w = u - hang;
      pose.dy = Math.max(-2.6, -7 * w * w);
      pose.squash = 1 + Math.min(0.25, w * 0.8);
      s.once('drop', () => s.cue('drop'));
    }
    if (u > 1.05) s.once('thud', () => {
      s.cue('thud');
      s.bits.emit(this.hatch.position, t, 8, { color: '#2a2036', speed: 0.7, up: 1.2, size: 0.08, grow: 2, life: 0.8 });
    });
    const rise = span(t, V.vanish + 0.3, V.dark + 1.0);
    if (rise > 0) {
      pose.dy = lerp(-1.3, 0, rise) + 0.05 * Math.sin(t * 4) * (1 - rise);
      pose.squash = 1;
    }
    pose.hidden = pose.dy < -0.35;
    // A look round at whoever is watching before the yank.
    s.body.rotation.y = -0.65 * (span(t, 3.0, 3.2) - span(t, 3.38, 3.52));
    const knob = this.ahead(t, -0.55, 0, 0.3)
      .setY(-0.95 * (1 - up) + 0.08)
      .add(new THREE.Vector3(0, 0.74, 0).applyAxisAngle(new THREE.Vector3(1, 0, 0), this.stick.rotation.x).applyAxisAngle(UP, s.figure.rotation.y));
    const [ra, raz] = this.reach(t, -1, knob);
    const grab = span(t, 2.75, 3.0) * (1 - span(t, V.after + 0.1, V.after + 0.4));
    return { la: -0.25, laz: 0, ra: lerp(-0.25, ra, grab), raz: raz * grab };
  }

  dispose() {
    this.holeMat.dispose();
  }
}

const ACTS: (new (s: Stage) => Act)[] = [Mallet, JackInTheBox, Lightning, Ravens, Snuffer, Trapdoor];
