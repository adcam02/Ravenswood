import * as THREE from 'three';
import { Builder, rng, soft } from './build';
import { BED, ROOM_DOOR } from './town/layout';
import { FLAT_HD } from '../flats/catalogue';

/**
 * The hooded figure's visit to someone killed in the night. It's drawn only on the screen of the one it visits (and
 * the Storyteller's, if they're at that bedside): in at the bedroom door, a glide to the bedside, the deed (one of
 * twenty ways), and gone in a puff of smoke. Storybook spooky rather than gory: a jolt, a flash, a little wisp.
 *
 * Everything runs off `t`, seconds since it began, so it can be stopped at any moment to look at.
 */

/** When each part happens, in seconds. */
export const VISIT = { glide: 2.6, ready: 3.2, strike: 3.7, after: 4.8, vanish: 6.0, dark: 6.8, end: 11.5 };
export const VISIT_NAMES = [
  'dagger',
  'pillow',
  'poison',
  'scythe',
  'mallet',
  'jack',
  'lightning',
  'ravens',
  'snuffer',
  'trapdoor',
  'shark',
  'curtain',
  'balloon',
  'claws',
  'telly',
  'gremlins',
  'anvil',
  'vampire',
  'mummy',
  'jungle',
] as const;

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

  /** How big the sleeper is across, along and up, for props made to fit. */
  protected size() {
    const b = this.s.box;
    return { w: b.max.x - b.min.x, d: b.max.z - b.min.z, h: b.max.y - FLOOR };
  }

  /** Taken away out of sight, then back up through the covers as a ghost once the figure has gone. */
  protected ghostUp(t: number, pose: VictimPose) {
    const rise = span(t, VISIT.vanish + 0.3, VISIT.dark + 1.0);
    if (rise > 0) {
      pose.dy = lerp(-1.3, 0, rise) + 0.05 * Math.sin(t * 4) * (1 - rise);
      pose.squash = 1;
    }
    pose.hidden = pose.dy < -0.35;
  }

  /** The figure's arms waving like a conductor's, `k` of the way up (0 hanging, 1 raised). */
  protected conduct(t: number, k: number, tempo = 7): Arms {
    return {
      la: -0.25 - k * (1.55 + 0.35 * Math.sin(t * tempo)),
      ra: -0.25 - k * (1.55 + 0.35 * Math.sin(t * tempo + 2)),
      laz: k * (0.5 + 0.2 * Math.sin(t * tempo * 0.5)),
      raz: -k * (0.5 + 0.2 * Math.cos(t * tempo * 0.5)),
    };
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
    // (Clear of the side of a wide sleeper.)
    held.x = Math.max(BED.x - BED.w / 2 - 0.05, Math.min(held.x, s.box.min.x - 0.2));
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

// ---------------------------------------------------------------- the third lot: homages, all bloodless

/** A flash over the whole room, seen from inside, for a moment (as the lightning has). */
function roomFlash(color: string) {
  const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending, side: THREE.BackSide });
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(30, 16, 10), mat);
  mesh.frustumCulled = false;
  mesh.renderOrder = 10;
  mesh.visible = false;
  return { mesh, mat };
}

/** Paints a plain geometry one colour, for meshes on the figure's vertex-coloured material. */
function tinted<G extends THREE.BufferGeometry>(geo: G, color: THREE.ColorRepresentation): G {
  const c = new THREE.Color(color);
  const n = geo.getAttribute('position').count;
  const col = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) col.set([c.r, c.g, c.b], i * 3);
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  return geo;
}

/** A little bat: a body and two wings that flap (`flap` sets them, -1 to 1). */
function bat(material: THREE.Material) {
  const root = new THREE.Group();
  root.add(
    parts(material, (b) => {
      b.add(new THREE.SphereGeometry(1, 10, 8), '#2a2233', { scale: [0.05, 0.05, 0.07] });
      for (const sx of [-1, 1]) {
        b.add(new THREE.ConeGeometry(0.018, 0.05, 5), '#2a2233', { pos: [sx * 0.025, 0.05, 0.03] });
        b.add(new THREE.SphereGeometry(0.009, 6, 5), '#ff5a6a', { pos: [sx * 0.018, 0.015, 0.06] });
      }
    }),
  );
  const wings = [1, -1].map((side) => {
    const pivot = new THREE.Group();
    pivot.position.set(side * 0.04, 0.01, 0);
    pivot.add(
      parts(material, (b) => {
        b.add(new THREE.BoxGeometry(0.14, 0.008, 0.09), '#3a2f48', { pos: [side * 0.07, 0, 0] });
        for (const z of [-0.03, 0.03]) b.add(new THREE.ConeGeometry(0.02, 0.05, 4), '#3a2f48', { pos: [side * 0.1, 0, z - 0.04], rot: [Math.PI / 2, 0, 0], scale: [1, 1, 0.2] });
      }),
    );
    root.add(pivot);
    return pivot;
  });
  return {
    root,
    flap: (k: number) => {
      wings[0].rotation.z = k * 0.9;
      wings[1].rotation.z = -k * 0.9;
    },
  };
}

/**
 * The shark: the figure conducts, and a fin rises through the covers and circles the sleeper, quicker and quicker to
 * a low two-note tune. It dives; then the whole shark bursts up out of the quilt, jaws wide, CHOMP, and arcs back down
 * under the covers with them in its mouth. Once the figure has gone they float back up through the quilt, a ghost.
 */
class Shark extends Deed {
  private fin: THREE.Mesh;
  private shark = new THREE.Group();
  private jaw = new THREE.Group();

  constructor(s: Stage) {
    super(s);
    const m = s.material;
    const GREY = '#7f93a6';
    const BELLY = '#eef1f2';
    const finShape = new THREE.Shape();
    finShape.moveTo(-0.17, 0);
    finShape.quadraticCurveTo(-0.02, 0.12, 0.09, 0.4);
    finShape.quadraticCurveTo(0.08, 0.16, 0.16, 0);
    finShape.lineTo(-0.17, 0);
    const finGeo = new THREE.ExtrudeGeometry(finShape, { depth: 0.04, bevelEnabled: false }).translate(0, 0, -0.02);
    // (Leading edge forwards, along +z.)
    this.fin = parts(m, (b) => b.add(finGeo, GREY, { rot: [0, Math.PI / 2, 0] }));
    this.fin.visible = false;
    // The shark lies along +z, nose first, its lower jaw hinged under the snout.
    this.shark.add(
      parts(m, (b) => {
        b.add(new THREE.SphereGeometry(1, 18, 12), GREY, { scale: [0.27, 0.27, 0.78] });
        b.add(new THREE.SphereGeometry(1, 16, 10), BELLY, { pos: [0, -0.1, 0.05], scale: [0.22, 0.17, 0.66] });
        b.add(new THREE.ConeGeometry(0.13, 0.5, 10), GREY, { pos: [0, 0, -0.88], rot: [-Math.PI / 2, 0, 0] });
        for (const sy of [1, -1]) b.add(new THREE.ConeGeometry(0.09, 0.36, 4), GREY, { pos: [0, sy * 0.17, -1.12], rot: [sy * 0.75, 0, 0], scale: [0.25, 1, 1] });
        b.add(finGeo, GREY, { pos: [0, 0.22, -0.12], rot: [0, Math.PI / 2, 0], scale: [1.1, 0.95, 1] });
        for (const sx of [-1, 1]) {
          b.add(new THREE.ConeGeometry(0.08, 0.34, 4), GREY, { pos: [sx * 0.27, -0.1, 0.12], rot: [0.9, 0, sx * 1.2], scale: [1, 1, 0.25] });
          b.add(new THREE.SphereGeometry(0.035, 8, 6), '#15151c', { pos: [sx * 0.17, 0.07, 0.52] });
          b.add(new THREE.SphereGeometry(0.012, 6, 4), '#ffffff', { pos: [sx * 0.19, 0.085, 0.54] });
          for (let g = 0; g < 3; g++) b.add(new THREE.BoxGeometry(0.01, 0.12, 0.012), '#5f7286', { pos: [sx * 0.24, 0, 0.28 - g * 0.06] });
        }
        // The roof of the mouth and the top teeth.
        b.add(new THREE.SphereGeometry(1, 12, 8), '#7a2a3a', { pos: [0, -0.1, 0.5], scale: [0.16, 0.05, 0.22] });
        for (let k = 0; k < 7; k++) {
          const a = (k / 6 - 0.5) * 2.2;
          b.add(new THREE.ConeGeometry(0.022, 0.06, 4), '#ffffff', { pos: [Math.sin(a) * 0.15, -0.13, 0.5 + Math.cos(a) * 0.2], rot: [Math.PI, 0, 0] });
        }
      }),
    );
    this.jaw.position.set(0, -0.12, 0.3);
    this.jaw.add(
      parts(m, (b) => {
        b.add(new THREE.SphereGeometry(1, 14, 8), BELLY, { pos: [0, -0.02, 0.2], scale: [0.19, 0.06, 0.3] });
        b.add(new THREE.SphereGeometry(1, 12, 8), '#9a3a4a', { pos: [0, 0.015, 0.18], scale: [0.14, 0.03, 0.22] });
        for (let k = 0; k < 6; k++) {
          const a = (k / 5 - 0.5) * 2.0;
          b.add(new THREE.ConeGeometry(0.02, 0.055, 4), '#ffffff', { pos: [Math.sin(a) * 0.13, 0.04, 0.2 + Math.cos(a) * 0.17] });
        }
      }),
    );
    this.shark.add(this.jaw);
    this.shark.visible = false;
    s.room.add(this.fin, this.shark);
  }

  update(t: number, pose: VictimPose, shown: boolean): Arms {
    const s = this.s;
    const { w, d } = this.size();
    // The fin: up through the quilt, round and round the sleeper, quicker each time, and down again.
    const rx = clamp(w / 2 + 0.28, 0.45, BED.w / 2 - 0.12);
    const rz = clamp(d / 2 + 0.2, 0.55, BED.d / 2 - 0.15);
    const u = Math.max(0, t - 2.45);
    const a = 2.0 * u + 1.6 * u * u;
    const up = span(t, 2.45, 2.75) * (1 - span(t, 3.4, 3.58));
    const cz = clamp(s.chest.z, BED.z - BED.d / 2 + rz + 0.1, BED.z + BED.d / 2 - rz - 0.1);
    this.fin.visible = shown && up > 0.02;
    this.fin.position.set(BED.x + Math.cos(a) * rx, COVERS - 0.42 + 0.44 * up, cz + Math.sin(a) * rz);
    // (Facing along the circle as it goes round.)
    this.fin.rotation.set(0, Math.atan2(-Math.sin(a) * rx, Math.cos(a) * rz), Math.sin(t * 9) * 0.06);
    if (up > 0.5) s.once(`wake${Math.floor(t / 0.07)}`, () => s.bits.emit(new THREE.Vector3(this.fin.position.x, COVERS + 0.04, this.fin.position.z), t, 1, { color: '#e8f4ff', speed: 0.4, up: 0.6, size: 0.04, grow: 1.8, life: 0.6, opacity: 0.7 }));
    if (t > 2.45) s.once('dundun', () => s.cue('dundun'));
    // The breach: up out of the covers beside them, jaws wide, over the top, and down the other side.
    const sz = clamp(Math.max(w, this.size().h * 1.4) / 0.75, 1, 1.9);
    const b = clamp((t - 3.58) / 0.85, 0, 1);
    const from = new THREE.Vector3(clamp(s.chest.x + 0.5, BED.x - BED.w / 2 + 0.2, BED.x + BED.w / 2 - 0.15), COVERS - 0.75 * sz, s.chest.z + 0.05);
    const to = new THREE.Vector3(clamp(s.chest.x - 0.55, BED.x - BED.w / 2 + 0.15, BED.x + BED.w / 2 - 0.2), COVERS - 0.9 * sz, s.chest.z - 0.05);
    const H = this.top() - COVERS + 0.95 * sz;
    const at = (k: number) => from.clone().lerp(to, k).add(new THREE.Vector3(0, Math.sin(Math.PI * k) * H, 0));
    const p = at(b);
    const ahead = at(Math.min(1, b + 0.02)).sub(at(Math.max(0, b - 0.02)));
    this.shark.visible = shown && b > 0 && b < 1;
    this.shark.position.copy(p);
    // (Nose along the way it's going, belly down, rolled a touch towards the camera so the teeth show.)
    const fwd = ahead.normalize();
    const side = new THREE.Vector3(0.25, 0, 1).normalize();
    const upv = new THREE.Vector3().crossVectors(fwd, side).normalize();
    const X = new THREE.Vector3().crossVectors(upv, fwd).normalize();
    this.shark.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(X, upv, fwd));
    this.shark.scale.setScalar(sz);
    const snap = 0.36;
    this.jaw.rotation.x = 0.75 * span(b, 0.05, 0.25) * (1 - span(b, snap - 0.04, snap)) + 0.05 * Math.sin(t * 20) * (b > snap ? 1 : 0);
    if (b > 0.04) s.once('burst', () => {
      s.cue('splash');
      s.bits.emit(new THREE.Vector3(from.x, COVERS + 0.05, from.z), t, 22, { color: '#e8f4ff', speed: 2.2, up: 1.2, size: 0.05, grow: 1.6, life: 0.7, opacity: 0.8 });
    });
    if (b >= snap) s.once('chomp', () => s.cue('chomp'));
    if (b > 0.9) s.once('dive', () => {
      s.cue('splash');
      s.bits.emit(new THREE.Vector3(to.x, COVERS + 0.05, to.z), t, 18, { color: '#e8f4ff', speed: 1.8, up: 1.0, size: 0.05, grow: 1.6, life: 0.7, opacity: 0.8 });
    });
    // The sleeper: trembling as the fin goes round, then gone in one gulp, and back up later as a ghost.
    if (t > 2.9 && b < snap) pose.shake = 0.03 * Math.sin(t * 50) * span(t, 2.9, 3.5);
    if (b >= snap) pose.dy = -2;
    this.ghostUp(t, pose);
    // Conducting the tune, quicker as it goes.
    const k = span(t, 2.3, 2.7) * (1 - span(t, 3.6, 3.9));
    return this.conduct(t, k, 5 + u * 4);
  }
}

/**
 * The shower curtain: a rail on two poles rises out of the floor at the foot of the bed and a curtain swishes shut
 * across it. Behind it, a hooded silhouette raises a scrubbing brush and brings it down, again and again, to
 * screeching violins; the curtain is yanked back and the sleeper lies there scrubbed squeaky clean, bubbles rising.
 */
class Curtain extends Deed {
  private rail = new THREE.Group();
  private panels: THREE.Mesh[] = [];
  private brush: THREE.Mesh;
  // (Unlit and pale, so the figure shows as a dark shape behind it.)
  private curtainMat = new THREE.MeshBasicMaterial({ color: '#b9cdd6', transparent: true, opacity: 0.5, side: THREE.DoubleSide, depthWrite: false });
  private n = 16;
  private x0 = BED.x - BED.w / 2 - 0.85;
  private x1 = BED.x + BED.w / 2 + 0.3;
  private z = BED.z + BED.d / 2 + 0.3;

  constructor(s: Stage) {
    super(s);
    const m = s.material;
    const len = this.x1 - this.x0;
    this.rail.add(
      parts(m, (b) => {
        b.add(new THREE.CylinderGeometry(0.02, 0.02, len + 0.1, 8), '#c8ccd4', { pos: [len / 2, 2.35, 0], rot: [0, 0, Math.PI / 2] });
        for (const x of [0, len]) {
          b.add(new THREE.CylinderGeometry(0.022, 0.022, 2.35, 8), '#c8ccd4', { pos: [x, 1.175, 0] });
          b.add(new THREE.CylinderGeometry(0.12, 0.14, 0.04, 14), '#a8acb4', { pos: [x, 0.02, 0] });
          b.add(new THREE.SphereGeometry(0.04, 8, 6), '#e2e6ec', { pos: [x, 2.37, 0] });
        }
      }),
    );
    this.rail.position.set(this.x0, 0, this.z);
    // A wavy curtain of narrow panels, each with a ring at the top and a pale blue stripe near the hem.
    const panel = new THREE.PlaneGeometry(1, 1);
    for (let i = 0; i < this.n; i++) {
      const p = new THREE.Mesh(panel, this.curtainMat);
      const ring = parts(m, (b) => {
        b.add(new THREE.TorusGeometry(0.035, 0.008, 5, 10), '#d8dce4', { pos: [0, 0.5, 0] });
        b.add(new THREE.BoxGeometry(1, 0.05, 0.004), '#8fc4dc', { pos: [0, -0.4, 0.003] });
      });
      ring.scale.set(1, 1, 1);
      p.add(ring);
      this.panels.push(p);
      this.rail.add(p);
    }
    this.brush = parts(m, (b) => {
      b.add(new THREE.CylinderGeometry(0.022, 0.025, 0.42, 8), '#c98a4a', { pos: [0, -0.15, 0] });
      b.add(new THREE.BoxGeometry(0.2, 0.06, 0.11), '#8a5a34', { pos: [0, -0.38, 0] });
      for (let k = 0; k < 10; k++) b.add(new THREE.BoxGeometry(0.014, 0.06, 0.014), '#f2d36a', { pos: [-0.08 + (k % 5) * 0.04, -0.43, (k < 5 ? -1 : 1) * 0.03] });
    });
    s.right.hand.add(this.brush);
    s.room.add(this.rail);
  }

  update(t: number, pose: VictimPose, shown: boolean): Arms {
    const s = this.s;
    const V = VISIT;
    const len = this.x1 - this.x0;
    // The rail up out of the floor and back down at the end.
    const there = span(t, 2.2, 2.6) * (1 - span(t, V.after + 0.6, V.vanish - 0.1));
    this.rail.visible = shown && there > 0.01;
    this.rail.scale.set(1, Math.max(0.01, there), 1);
    if (t > 2.2) s.once('rail', () => s.bits.emit(new THREE.Vector3(this.x0 + len / 2, 0.1, this.z), t, 12, { color: '#2a2036', speed: 1.2, size: 0.12, grow: 2, life: 0.8 }));
    // Drawn shut from the near end (the figure's), then yanked back open.
    const shut = span(t, 2.8, 3.05) * (1 - span(t, 4.3, 4.42));
    if (t > 2.8) s.once('swish1', () => s.cue('swish'));
    if (t > 4.3) s.once('swish2', () => s.cue('swish'));
    const spread = lerp(0.18, len, shut);
    const pw = (spread / this.n) * 1.25;
    this.panels.forEach((p, i) => {
      const fold = i % 2 ? 1 : -1;
      p.position.set((i + 0.5) * (spread / this.n), 1.3, fold * 0.035 * (1.3 - shut));
      p.rotation.set(0, fold * lerp(1.1, 0.35, shut) + Math.sin(t * 3 + i) * 0.04, 0);
      p.scale.set(pw, 2.0, 1);
      (p.children[0] as THREE.Object3D).scale.set(1, 1 / 2.0, 1);
      (p.children[0] as THREE.Object3D).position.y = 0.5 - 0.5 / 2.0;
    });
    // The brush: raised and brought down four times behind the curtain, each to a shriek of violins.
    this.brush.visible = shown && t > 2.9 && t < V.after + 0.2;
    const hits = [3.3, 3.55, 3.8, 4.05];
    let phase = 0;
    for (const h of hits) {
      if (t > h - 0.22 && t <= h) phase = Math.sin(((t - (h - 0.22)) / 0.22) * Math.PI * 0.5);
      if (t > h && t < h + 0.03) phase = 1;
    }
    hits.forEach((h, i) => {
      if (t >= h) s.once(`stab${i}`, () => {
        s.cue('screech');
        s.bits.emit(s.chest, t, 6, { color: '#e8f8ff', speed: 0.9, up: 1.4, size: 0.05, grow: 2, life: 1.2, opacity: 0.6 });
      });
    });
    const hitAt = s.chest.clone().add(new THREE.Vector3(0, 0.18, 0));
    const raised = this.ahead(t, -0.2, 2.6, 0.3);
    const [ra, raz] = this.reach(t, -1, raised.clone().lerp(hitAt, phase));
    const busy = span(t, 2.95, 3.15) * (1 - span(t, 4.15, 4.4));
    if (this.brush.visible) this.brush.rotation.set(-0.4 - 0.8 * phase, 0, 0);
    // The sleeper: a jolt at each blow, then scrubbed clean, bubbles drifting up and a sparkle or two.
    const last = hits.filter((h) => t >= h).pop();
    if (last !== undefined && t < 4.6) {
      const w = t - last;
      pose.dy = 0.08 * Math.exp(-w * 10) * Math.abs(Math.sin(w * 30));
      pose.shake = 0.07 * Math.exp(-w * 6) * Math.sin(w * 45);
    }
    if (t > 4.4 && t < V.vanish + 0.8) {
      s.once(`bubble${Math.floor(t / 0.16)}`, () => {
        const at = new THREE.Vector3(s.chest.x + (Math.random() - 0.5) * 0.5, this.top() + 0.05, s.chest.z + (Math.random() - 0.5) * 0.6);
        s.bits.emit(at, t, 1, { color: Math.random() < 0.5 ? '#dff4ff' : '#ffffff', speed: 0.2, up: 2.5, size: 0.035, grow: 1.8, life: 1.6, opacity: 0.55 });
      });
    }
    if (t > 4.45) s.once('squeak', () => {
      s.cue('squeaky');
      s.bits.emit(s.head, t, 10, { color: '#ffffff', speed: 1.2, up: 0.5, size: 0.02, life: 0.5 });
    });
    return { la: -0.25, laz: 0, ra: lerp(-0.25, ra, busy), raz: raz * busy };
  }

  dispose() {
    this.curtainMat.dispose();
  }
}

/**
 * The red balloon: the figure holds it on a string, and with a giggle from nowhere lets it float out over the bed and
 * bob down to the sleeper's face. A long pin; POP; red scraps everywhere. The sleeper jumps out of their skin and then
 * floats, limp and turning slowly, up off the bed like a balloon themselves, before flopping back down.
 */
class Balloon extends Deed {
  private balloon: THREE.Mesh;
  private string: THREE.Mesh[] = [];
  private pin: THREE.Mesh;
  private grip = new THREE.Vector3();

  constructor(s: Stage) {
    super(s);
    const m = s.material;
    this.balloon = parts(m, (b) => {
      b.add(new THREE.SphereGeometry(1, 20, 14), '#d8283a', { scale: [0.21, 0.25, 0.21] });
      b.add(new THREE.SphereGeometry(1, 10, 8), '#ff8a94', { pos: [-0.07, 0.09, 0.15], scale: [0.04, 0.06, 0.02] });
      b.add(new THREE.ConeGeometry(0.03, 0.05, 8), '#b81c2c', { pos: [0, -0.26, 0], rot: [Math.PI, 0, 0] });
    });
    const seg = tinted(new THREE.CylinderGeometry(0.005, 0.005, 1, 4), '#f2ece0');
    for (let i = 0; i < 8; i++) {
      const piece = new THREE.Mesh(seg, m);
      this.string.push(piece);
      s.room.add(piece);
    }
    this.pin = parts(m, (b) => {
      b.add(new THREE.CylinderGeometry(0.006, 0.003, 0.34, 6), '#d8dde6', { pos: [0, -0.17, 0] });
      b.add(new THREE.SphereGeometry(0.025, 8, 6), '#3f7fc4', { pos: [0, 0.01, 0] });
    });
    s.left.hand.add(this.pin);
    s.room.add(this.balloon);
  }

  update(t: number, pose: VictimPose, shown: boolean): Arms {
    const s = this.s;
    const V = VISIT;
    const popAt = V.strike;
    // The string's end, in the figure's right hand (from where the hand was a moment ago).
    s.right.hand.getWorldPosition(this.grip);
    s.room.worldToLocal(this.grip);
    const held = this.ahead(t, -0.25, 2.35, 0.25);
    const over = s.head.clone().add(new THREE.Vector3(0.05, 0.95, 0.1));
    const face = s.head.clone().add(new THREE.Vector3(0, 0.42, 0.08));
    const bob = new THREE.Vector3(Math.sin(t * 1.7) * 0.05, Math.sin(t * 2.3) * 0.06, Math.cos(t * 1.3) * 0.04);
    const at = held.lerp(over, span(t, 2.55, 3.25)).lerp(face, span(t, 3.3, 3.6)).add(bob);
    const popped = t >= popAt;
    this.balloon.visible = shown && !popped;
    this.balloon.position.copy(at);
    this.balloon.rotation.set(Math.sin(t * 1.4) * 0.15, t * 0.5, Math.sin(t * 1.9) * 0.12);
    // The string: hanging from the knot to the hand with a little slack.
    const knot = at.clone().add(new THREE.Vector3(0, -0.28, 0));
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= this.string.length; i++) {
      const k = i / this.string.length;
      pts.push(knot.clone().lerp(this.grip, k).add(new THREE.Vector3(Math.sin(t * 3 + k * 4) * 0.02, -Math.sin(Math.PI * k) * 0.18, 0)));
    }
    this.string.forEach((piece, i) => {
      piece.visible = shown && !popped;
      between(piece, pts[i], pts[i + 1]);
    });
    if (t > 2.75) s.once('giggle', () => s.cue('giggle'));
    if (t > 3.3) s.once('rub', () => s.cue('squeak'));
    // The pin, in the other hand, out at the balloon.
    this.pin.visible = shown && t > 3.0 && t < V.after;
    this.pin.rotation.set(-1.2 * span(t, 3.25, 3.6), 0, 0);
    if (popped) s.once('pop', () => {
      s.cue('burst');
      s.bits.emit(at, t, 26, { color: '#d8283a', speed: 2.4, up: 0.3, size: 0.03, life: 0.9 });
      s.bits.emit(at, t, 8, { color: '#ffffff', speed: 1.6, size: 0.05, grow: 2, life: 0.4 });
    });
    if (t > popAt + 0.5) s.once('float', () => s.cue('float'));
    // The sleeper: a start, then up off the bed, floating and turning, and down with a flop.
    if (popped) {
      const u = t - popAt;
      const rise = span(u, 0.25, 0.9);
      const fall = clamp((t - (V.after + 0.1)) / 0.32, 0, 1);
      pose.dy = (0.5 * rise + 0.05 * Math.sin(t * 2.6) * rise) * (1 - fall * fall);
      if (u < 0.25) {
        pose.dy = 0.35 * Math.sin((Math.PI * u) / 0.25);
        pose.squash = 1 + 0.3 * Math.sin((Math.PI * u) / 0.25);
      }
      pose.spin = 0.9 * Math.sin(u * 1.6) * rise * (1 - fall);
      pose.shake = 0.12 * Math.sin(t * 1.9) * rise * (1 - fall);
      if (fall >= 1) {
        const w = t - (V.after + 0.42);
        pose.squash = 1 - 0.2 * Math.exp(-w * 6) * Math.cos(w * 16);
        pose.dy = 0.06 * Math.abs(Math.sin(w * 10)) * Math.exp(-w * 5);
        s.once('flop', () => s.cue('fwump'));
      }
    }
    const [ra, raz] = this.reach(t, -1, at.clone().add(new THREE.Vector3(0, -0.6, 0)).lerp(this.ahead(t, -0.3, 1.0, 0.3), 0.5));
    const [la, laz] = this.reach(t, 1, at);
    const jab = span(t, 3.2, 3.62) * (1 - span(t, V.after, V.after + 0.4));
    return { la: lerp(-0.25, la, jab), laz: laz * jab, ra: popped ? lerp(ra, -0.25, span(t, popAt, popAt + 0.5)) : ra, raz: popped ? raz * (1 - span(t, popAt, popAt + 0.5)) : raz };
  }
}

/**
 * The claw glove: a red and green striped sleeve and a glove with four long blades. A slow wiggle of the blades, then
 * a long screech down the headboard leaving four scratches and a shower of sparks, and one swipe over the pillow that
 * bursts it into a blizzard of feathers. The sleeper jolts and shivers under the falling down.
 */
class Claws extends Deed {
  private marks: THREE.Mesh[] = [];
  private blades: THREE.Group;
  private board = { x: BED.x - 0.35, z: BED.z - BED.d / 2 + 0.075 };

  constructor(s: Stage) {
    super(s);
    const m = s.material;
    // The stripes round the forearm, and the glove over the bony hand.
    s.right.pivot.add(
      parts(m, (b) => {
        for (let k = 0; k < 5; k++) b.add(new THREE.CylinderGeometry(0.098 + k * 0.004, 0.1 + k * 0.004, 0.06, 12, 1, true), k % 2 ? '#2f6b3a' : '#b8322c', { pos: [0, -0.3 - k * 0.06, 0] });
      }),
    );
    this.blades = new THREE.Group();
    this.blades.add(
      parts(m, (b) => {
        b.add(new THREE.BoxGeometry(0.13, 0.12, 0.08), '#6a4026', { pos: [0, 0.03, 0] });
        b.add(new THREE.BoxGeometry(0.14, 0.03, 0.09), '#4a2c1a', { pos: [0, 0.09, 0] });
        for (let k = 0; k < 4; k++) {
          const x = -0.045 + k * 0.03;
          b.add(new THREE.BoxGeometry(0.018, 0.06, 0.02), '#6a4026', { pos: [x, -0.04, 0.01] });
          b.add(new THREE.BoxGeometry(0.008, 0.34, 0.022), '#d8dde6', { pos: [x * 1.3, -0.24, 0.01], rot: [0, 0, x * 1.2] });
          b.add(new THREE.ConeGeometry(0.011, 0.05, 4), '#ffffff', { pos: [x * 1.55, -0.43, 0.01], rot: [Math.PI, 0, 0], scale: [0.7, 1, 1] });
        }
      }),
    );
    s.right.hand.add(this.blades);
    const markGeo = new THREE.BoxGeometry(0.014, 1, 0.01);
    for (let k = 0; k < 4; k++) {
      const mark = new THREE.Mesh(markGeo, new THREE.MeshBasicMaterial({ color: '#2a1a10' }));
      mark.visible = false;
      this.marks.push(mark);
      s.room.add(mark);
    }
  }

  update(t: number, pose: VictimPose, shown: boolean): Arms {
    const s = this.s;
    const V = VISIT;
    this.blades.visible = shown;
    // The blades wiggled one after another, for show.
    this.blades.rotation.z = span(t, 2.3, 2.5) * (1 - span(t, 2.85, 2.95)) * 0.25 * Math.sin(t * 22);
    // Down the headboard: from high to low, leaving four scratches behind.
    const scr = span(t, 2.95, 3.35);
    const topY = 1.2;
    const lowY = Math.max(BED.top + 0.25, 0.8);
    const y = lerp(topY, lowY, scr);
    const onBoard = new THREE.Vector3(this.board.x, y + 0.35, this.board.z + 0.05);
    this.marks.forEach((mark, k) => {
      const len = Math.max(0.001, (topY - y) * (0.85 + k * 0.05));
      mark.visible = shown && scr > 0 && t < V.vanish + 0.6;
      mark.position.set(this.board.x - 0.07 + k * 0.045 + 0.02 * scr, topY - len / 2 - k * 0.02, this.board.z);
      mark.scale.set(1, len, 1);
      mark.rotation.z = 0.1;
    });
    if (scr > 0 && scr < 1) {
      s.once('scratch', () => s.cue('scratch'));
      s.once(`spark${Math.floor(t / 0.05)}`, () => s.bits.emit(new THREE.Vector3(this.board.x, y, this.board.z + 0.06), t, 3, { color: Math.random() < 0.5 ? '#fff2a0' : '#ffffff', speed: 1.4, up: 0.3, size: 0.018, life: 0.35 }));
    }
    // The swipe over the pillow, across and down.
    const sw = span(t, 3.5, 3.72);
    const from = s.head.clone().add(new THREE.Vector3(-0.35, 0.65, 0.05));
    const to = s.head.clone().add(new THREE.Vector3(0.45, 0.25, 0.2));
    const swipe = from.lerp(to, sw);
    const [ra0, raz0] = this.reach(t, -1, scr > 0 && t < 3.42 ? onBoard : swipe);
    const busy = span(t, 2.75, 2.95) * (1 - span(t, V.after, V.after + 0.4));
    const wave = span(t, 2.2, 2.4) * (1 - span(t, 2.7, 2.9));
    const ra = lerp(-0.25, ra0, busy) - 1.0 * wave;
    const raz = raz0 * busy;
    if (sw > 0.85) s.once('rip', () => {
      s.cue('rip');
      const pillow = new THREE.Vector3(BED.x, BED.top + 0.12, BED.z - BED.d / 2 + 0.4);
      s.bits.emit(pillow, t, 30, { color: '#ffffff', speed: 1.8, up: 1.2, size: 0.035, grow: 1.3, life: 1.6, opacity: 0.9 });
    });
    // Down drifting over the bed for a while after.
    if (t > 3.8 && t < V.vanish + 0.5) {
      s.once(`down${Math.floor(t / 0.09)}`, () => {
        const at = new THREE.Vector3(BED.x + (Math.random() - 0.5) * BED.w, 1.7 + Math.random() * 0.4, s.chest.z + (Math.random() - 0.5) * 1.6);
        s.bits.emit(at, t, 1, { color: '#fbf8f2', speed: 0.35, size: 0.03, life: 2.4, opacity: 0.9, fall: true });
      });
    }
    // The sleeper: a jolt at the swipe, then shivering.
    const u = t - 3.7;
    if (u > 0) {
      pose.dy = 0.14 * Math.exp(-u * 7) * Math.abs(Math.sin(u * 22));
      pose.shake = 0.05 * Math.sin(u * 48) * (0.4 + 0.6 * Math.exp(-u * 1.2)) * (1 - span(t, V.vanish, V.dark));
      pose.squash = 1 - 0.06 * span(u, 0.1, 0.5);
    }
    return { la: -0.25, laz: 0, ra, raz };
  }

  dispose() {
    for (const m of this.marks) (m.material as THREE.Material).dispose();
  }
}

/**
 * The telly: an old wooden television crackles into being on the floor by the bed, all static. Something climbs out
 * of the screen: a girl in a white nightie with long black hair over her face, crawling jerkily across the floor, up
 * onto the bed and over the sleeper, who wakes to find her nose to nose. A shriek, a flicker, and she's gone; the
 * screen shrinks to a dot.
 */
class Telly extends Deed {
  private tv = new THREE.Group();
  private screen: THREE.Mesh;
  private noise: THREE.DataTexture;
  private screenMat: THREE.MeshBasicMaterial;
  private girl = new THREE.Group();
  private arms: THREE.Mesh[] = [];
  /** On the floor beyond the figure, turned to the room, where the camera sees it. */
  private spot = new THREE.Vector3(BED.x - BED.w / 2 - 1.1, 0, BED.z - 0.2);
  private yaw = Math.atan2(1, 0.75);

  constructor(s: Stage) {
    super(s);
    const m = s.material;
    this.tv.add(
      parts(m, (b) => {
        b.add(new THREE.BoxGeometry(0.66, 0.5, 0.46), '#7a5236', { pos: [0, 0.37, 0] });
        b.add(new THREE.BoxGeometry(0.5, 0.36, 0.02), '#3a2a1e', { pos: [-0.04, 0.38, 0.23] });
        for (const x of [0.25]) for (const y of [0.45, 0.32]) b.add(new THREE.CylinderGeometry(0.025, 0.025, 0.03, 10), '#c9a24f', { pos: [x, y, 0.235], rot: [Math.PI / 2, 0, 0] });
        for (const sx of [-1, 1]) {
          b.add(new THREE.CylinderGeometry(0.006, 0.006, 0.42, 5), '#c8ccd4', { pos: [sx * 0.12, 0.78, -0.05], rot: [0, 0, -sx * 0.5] });
          b.add(new THREE.BoxGeometry(0.04, 0.12, 0.04), '#4a3020', { pos: [sx * 0.26, 0.06, sx * 0.15] });
        }
      }),
    );
    const N = 48;
    this.noise = new THREE.DataTexture(new Uint8Array(N * 36 * 4), N, 36);
    this.noise.magFilter = THREE.NearestFilter;
    this.screenMat = new THREE.MeshBasicMaterial({ map: this.noise });
    this.screen = new THREE.Mesh(new THREE.PlaneGeometry(0.46, 0.32), this.screenMat);
    this.screen.position.set(-0.04, 0.38, 0.242);
    this.tv.add(this.screen);
    this.tv.position.copy(this.spot);
    this.tv.rotation.y = this.yaw;
    this.tv.visible = false;
    // The girl, on all fours facing +z: a white nightie, pale arms, and long black hair hanging over her face.
    this.girl.add(
      parts(m, (b) => {
        b.add(new THREE.SphereGeometry(1, 14, 10), '#c9c6bc', { pos: [0, 0.22, 0], scale: [0.13, 0.11, 0.27] });
        b.add(new THREE.ConeGeometry(0.17, 0.3, 12, 1, true), '#bdb9ae', { pos: [0, 0.12, -0.18], rot: [-1.3, 0, 0] });
        b.add(new THREE.SphereGeometry(0.1, 12, 10), '#cfd6d2', { pos: [0, 0.31, 0.28] });
        b.add(new THREE.SphereGeometry(1, 14, 10), '#111015', { pos: [0, 0.34, 0.27], scale: [0.115, 0.1, 0.12] });
        for (let k = 0; k < 9; k++) {
          const x = -0.08 + k * 0.02;
          b.add(new THREE.BoxGeometry(0.03, 0.3, 0.02), '#15131a', { pos: [x, 0.17, 0.36 + Math.abs(x) * -0.3], rot: [-0.25, 0, x * 0.6] });
        }
        for (const sx of [-1, 1]) b.add(new THREE.CylinderGeometry(0.03, 0.025, 0.24, 6), '#cfd6d2', { pos: [sx * 0.08, 0.06, -0.24], rot: [1.2, 0, 0] });
      }),
    );
    const armGeo = tinted(new THREE.CylinderGeometry(0.022, 0.018, 1, 6), '#cfd6d2');
    for (let i = 0; i < 2; i++) {
      const arm = new THREE.Mesh(armGeo, m);
      this.arms.push(arm);
      this.girl.add(arm);
    }
    this.girl.visible = false;
    s.room.add(this.tv, this.girl);
  }

  update(t: number, pose: VictimPose, shown: boolean): Arms {
    const s = this.s;
    const V = VISIT;
    // The set: in with a puff, static until she's gone, then off to a dot and away.
    const there = span(t, 2.35, 2.6) * (1 - span(t, V.vanish - 0.3, V.vanish + 0.1));
    this.tv.visible = shown && there > 0.01;
    this.tv.scale.setScalar(there);
    if (t > 2.35) s.once('tv', () => {
      s.bits.emit(this.spot.clone().setY(0.4), t, 12, { color: '#2a2036', speed: 1.1, size: 0.12, grow: 2, life: 0.8 });
      s.cue('static');
    });
    const off = span(t, 4.85, 5.1);
    this.screen.scale.set(Math.max(0.03, 1 - off), Math.max(0.03, 1 - off * 1.05), 1);
    const data = this.noise.image.data as Uint8Array;
    if (this.tv.visible) {
      for (let i = 0; i < data.length; i += 4) {
        const v = off > 0.9 ? 255 : Math.random() * 255 * (0.55 + 0.45 * Math.sin(t * 30 + i * 0.0007));
        data[i] = data[i + 1] = data[i + 2] = v;
        data[i + 3] = 255;
      }
      this.noise.needsUpdate = true;
    }
    // Her path: out of the screen, across the floor, up the side of the bed and over the sleeper to their face.
    const front = new THREE.Vector3(Math.sin(this.yaw), 0, Math.cos(this.yaw));
    const inScreen = this.spot.clone().addScaledVector(front, 0.1).setY(0.25);
    const onFloor = this.spot.clone().addScaledVector(front, 0.55).add(new THREE.Vector3(0.15, 0, 0));
    const onBed = new THREE.Vector3(BED.x - BED.w / 2 + 0.2, COVERS, clamp(s.chest.z + 0.45, BED.z - BED.d / 2 + 0.5, BED.z + BED.d / 2 - 0.3));
    const atFace = new THREE.Vector3(s.head.x, this.top() + 0.02, Math.min(s.head.z + 0.42, s.chest.z + 0.1));
    const keys: [number, THREE.Vector3][] = [
      [2.9, inScreen],
      [3.12, onFloor],
      [3.38, onBed],
      [3.66, atFace],
    ];
    let p = keys[0][1].clone();
    let dir = front.clone();
    for (let i = 1; i < keys.length; i++) {
      const [a, pa] = keys[i - 1];
      const [b, pb] = keys[i];
      if (t >= a) {
        // (Jerky, in fits and starts, as if frames were missing.)
        const k = clamp((t - a) / (b - a), 0, 1);
        const jerk = Math.floor(k * 9) / 9;
        p = pa.clone().lerp(pb, jerk);
        dir = pb.clone().sub(pa).setY(0).normalize();
      }
    }
    if (t > 3.12 && t < 3.38) p.y = lerp(0, COVERS, span(t, 3.22, 3.36));
    const out = span(t, 2.9, 3.05);
    const flick = t > 4.35 && t < 4.75 ? Math.sin(t * 90) > 0 : true;
    this.girl.visible = shown && t > 2.9 && t < 4.75 && flick;
    this.girl.position.copy(p);
    this.girl.rotation.set(0, Math.atan2(dir.x, dir.z), 0);
    // Rearing up at the face.
    const rear = span(t, 3.62, 3.75);
    this.girl.rotation.x = -0.55 * rear;
    this.girl.scale.setScalar(1.15 * out);
    // The arms: hand over hand while she crawls, reaching out at the end.
    const crawling = t > 3.0 && t < 3.66;
    this.arms.forEach((arm, i) => {
      const sx = i ? 1 : -1;
      const step = crawling ? Math.sin(t * 18 + i * Math.PI) * 0.07 : 0;
      const shoulder = new THREE.Vector3(sx * 0.09, 0.27, 0.2);
      const hand = new THREE.Vector3(sx * 0.13, 0.0, 0.4 + step).lerp(new THREE.Vector3(sx * 0.1, 0.32, 0.52), rear);
      between(arm, shoulder, hand);
    });
    if (t > 3.05) s.once('crawl', () => s.cue('creak'));
    if (t > 3.7) s.once('shriek', () => s.cue('shriek'));
    if (t > 4.35) s.once('gone', () => s.cue('static'));
    if (t > 4.75) s.once('puff', () => s.bits.emit(atFace.clone().setY(atFace.y + 0.2), t, 14, { color: '#d8dcd8', speed: 1.0, size: 0.08, grow: 2, life: 0.7, opacity: 0.6 }));
    // The sleeper: a jolt nose to nose, then shivering, a little shrunk.
    const u = t - 3.72;
    if (u > 0) {
      pose.dy = 0.25 * Math.exp(-u * 6) * Math.abs(Math.sin(u * 14));
      pose.shake = 0.06 * Math.sin(u * 55) * (0.3 + 0.7 * Math.exp(-u * 1.5)) * (1 - span(t, V.vanish, V.dark));
      pose.squash = 1 - 0.12 * span(u, 0.2, 0.8);
    }
    // The figure points the way: at the set, then at the bed.
    const [ra, raz] = this.reach(t, -1, t < 3.3 ? this.spot.clone().setY(0.6) : s.chest);
    const point = span(t, 2.6, 2.85) * (1 - span(t, 3.9, 4.2));
    return { la: -0.25, laz: 0, ra: lerp(-0.25, ra, point), raz: raz * point };
  }

  dispose() {
    this.noise.dispose();
    this.screenMat.dispose();
  }
}

/**
 * The gremlins: the figure holds out a little crate, and when the lid pops a swarm of green imps with huge ears
 * tumbles out over the bed, bouncing on the sleeper and chattering. A camera flash: they shriek and vanish in puffs
 * of green smoke, and the sleeper is left trampled flat.
 */
class Gremlins extends Deed {
  private crate = new THREE.Group();
  private lid = new THREE.Group();
  private imps: THREE.Group[] = [];
  private camera: THREE.Mesh;
  private flash = roomFlash('#fffbe6');
  private n = 7;
  private homes: THREE.Vector3[] = [];

  constructor(s: Stage) {
    super(s);
    const m = s.material;
    this.crate.add(
      parts(m, (b) => {
        b.add(new THREE.BoxGeometry(0.34, 0.26, 0.3), '#a0703f', { pos: [0, 0.13, 0] });
        for (const y of [0.04, 0.22]) b.add(new THREE.BoxGeometry(0.35, 0.04, 0.31), '#7a5236', { pos: [0, y, 0] });
        for (let k = 0; k < 3; k++) b.add(new THREE.CylinderGeometry(0.018, 0.018, 0.01, 8), '#1d1a24', { pos: [-0.1 + k * 0.1, 0.13, 0.152], rot: [Math.PI / 2, 0, 0] });
      }),
    );
    this.lid.position.set(0, 0.26, -0.15);
    this.lid.add(parts(m, (b) => b.add(new THREE.BoxGeometry(0.36, 0.03, 0.32), '#8a5a34', { pos: [0, 0.015, 0.15] })));
    this.crate.add(this.lid);
    const impGeo = (() => {
      const b = new Builder();
      b.add(new THREE.SphereGeometry(1, 12, 9), '#5e9e4a', { pos: [0, 0.09, 0], scale: [0.085, 0.08, 0.075] });
      b.add(new THREE.SphereGeometry(1, 10, 8), '#a8c87a', { pos: [0, 0.08, 0.04], scale: [0.06, 0.06, 0.04] });
      b.add(new THREE.SphereGeometry(0.075, 12, 10), '#5e9e4a', { pos: [0, 0.2, 0.02] });
      for (const sx of [-1, 1]) {
        b.add(new THREE.ConeGeometry(0.045, 0.17, 6), '#5e9e4a', { pos: [sx * 0.13, 0.23, 0], rot: [0, 0, -sx * 1.35], scale: [1, 1, 0.35] });
        b.add(new THREE.ConeGeometry(0.03, 0.12, 6), '#e89aa8', { pos: [sx * 0.125, 0.23, 0.01], rot: [0, 0, -sx * 1.35], scale: [1, 1, 0.3] });
        b.add(new THREE.SphereGeometry(0.02, 8, 6), '#ff3a3a', { pos: [sx * 0.03, 0.22, 0.08] });
        b.add(new THREE.SphereGeometry(0.008, 6, 4), '#ffffff', { pos: [sx * 0.032, 0.228, 0.097] });
        b.add(new THREE.SphereGeometry(0.022, 6, 5), '#4a8a3a', { pos: [sx * 0.05, 0.01, 0.03], scale: [1, 0.5, 1.4] });
        b.add(new THREE.CylinderGeometry(0.012, 0.012, 0.08, 5), '#5e9e4a', { pos: [sx * 0.085, 0.1, 0.03], rot: [0.6, 0, sx * 0.5] });
      }
      b.add(new THREE.BoxGeometry(0.07, 0.014, 0.01), '#ffffff', { pos: [0, 0.175, 0.09] });
      return b.geometry();
    })();
    const r = rng(11);
    for (let i = 0; i < this.n; i++) {
      const g = new THREE.Group();
      g.add(new THREE.Mesh(impGeo, m));
      g.visible = false;
      this.imps.push(g);
      s.room.add(g);
      this.homes.push(new THREE.Vector3(r() - 0.5, 0, r() - 0.5));
    }
    this.camera = parts(m, (b) => {
      b.add(new THREE.BoxGeometry(0.16, 0.1, 0.08), '#2a2a30', { pos: [0, -0.06, 0.04] });
      b.add(new THREE.CylinderGeometry(0.035, 0.035, 0.05, 10), '#55515c', { pos: [0, -0.06, 0.1], rot: [Math.PI / 2, 0, 0] });
      b.add(new THREE.SphereGeometry(0.045, 10, 8), '#f6f1e0', { pos: [0, 0.03, 0.06], scale: [1, 1, 0.5] });
    });
    s.right.hand.add(this.camera);
    s.room.add(this.crate, this.flash.mesh);
  }

  update(t: number, pose: VictimPose, shown: boolean): Arms {
    const s = this.s;
    const V = VISIT;
    const box = s.box;
    // The crate: held out, set down on the edge of the bed, and gone at the end.
    const held = this.ahead(t, 0, 0.95, 0.45);
    const down = new THREE.Vector3(BED.x - BED.w / 2 + 0.22, COVERS, clamp(s.chest.z + 0.45, BED.z - BED.d / 2 + 0.4, BED.z + BED.d / 2 - 0.25));
    const set = span(t, 2.55, 2.85);
    this.crate.position.copy(held.lerp(down, set));
    this.crate.rotation.y = s.figure.rotation.y;
    const there = 1 - span(t, V.vanish - 0.6, V.vanish - 0.3);
    this.crate.visible = shown && there > 0.01;
    this.crate.scale.setScalar(Math.max(0.01, there));
    const open = span(t, 2.95, 3.05);
    this.lid.rotation.x = -2.0 * open - (t < 2.95 ? Math.abs(Math.sin(t * 40)) * 0.15 * span(t, 2.7, 2.9) : 0);
    if (t > 2.95) s.once('lid', () => s.cue('pop'));
    // The imps: out of the crate one after another, onto and round the sleeper, bouncing about, until the flash.
    const flashAt = 4.5;
    this.imps.forEach((g, i) => {
      const t0 = 3.0 + i * 0.07;
      const gone = t > flashAt + 0.05 + i * 0.03;
      g.visible = shown && t > t0 && !gone;
      if (!g.visible) {
        if (gone) s.once(`poof${i}`, () => s.bits.emit(g.position.clone().setY(g.position.y + 0.12), t, 8, { color: '#7fbf5a', speed: 0.9, size: 0.06, grow: 2.2, life: 0.6, opacity: 0.8 }));
        return;
      }
      const h = this.homes[i];
      const wander = new THREE.Vector3(Math.sin(t * 2.3 + i) * 0.08, 0, Math.cos(t * 1.9 + i * 2) * 0.08);
      const spot = new THREE.Vector3(lerp(box.min.x - 0.12, box.max.x + 0.12, h.x + 0.5), 0, lerp(box.min.z, box.max.z, h.z + 0.5)).add(wander);
      spot.x = clamp(spot.x, BED.x - BED.w / 2 + 0.1, BED.x + BED.w / 2 - 0.1);
      const onThem = spot.x > box.min.x && spot.x < box.max.x;
      const surface = onThem ? this.top(pose.squash ?? 1) - 0.03 : COVERS;
      const k = clamp((t - t0) / 0.35, 0, 1);
      const p = down.clone().setY(COVERS + 0.2).lerp(spot.setY(surface), k);
      p.y += Math.sin(Math.PI * k) * 0.35;
      if (k >= 1) p.y += Math.abs(Math.sin(t * 9 + i * 1.3)) * 0.14;
      g.position.copy(p);
      g.rotation.set(0, Math.sin(t * 3 + i) * 1.2 + i, Math.sin(t * 9 + i) * 0.15);
      // (Scared stiff and stretched for a moment by the flash.)
      const fright = t > flashAt ? 1 + 0.3 * span(t, flashAt, flashAt + 0.04) : 1;
      g.scale.set(1.15, 1.15 * fright, 1.15);
    });
    if (t > 3.1) s.once('chitter1', () => s.cue('chitter'));
    if (t > 3.75) s.once('chitter2', () => s.cue('chitter'));
    if (t > 4.15) s.once('chitter3', () => s.cue('chitter'));
    // The camera: up to the eye, and the flash.
    this.camera.visible = shown && t > 4.05 && t < V.after + 0.3;
    const u = t - flashAt;
    const f = u >= 0 && shown ? Math.exp(-u * 5) : 0;
    this.flash.mesh.visible = f > 0.01;
    this.flash.mesh.position.copy(s.chest);
    this.flash.mat.opacity = 0.6 * f;
    if (u >= 0) s.once('flash', () => {
      s.cue('flashbulb');
      s.bits.emit(this.ahead(t, -0.2, 1.5, 0.5), t, 10, { color: '#ffffff', speed: 1.5, size: 0.03, life: 0.3 });
    });
    if (u > 0.05) s.once('shriek', () => s.cue('eek'));
    // The sleeper: bounced on (squashed a little each landing), then left flat and twitching.
    if (t > 3.3 && t < flashAt) {
      pose.squash = 1 - 0.12 * Math.abs(Math.sin(t * 13)) * span(t, 3.3, 3.5);
      pose.shake = 0.04 * Math.sin(t * 31);
    } else if (t >= flashAt) {
      const w = t - flashAt;
      pose.squash = 0.82 + 0.06 * Math.exp(-w * 4) * Math.cos(w * 20);
      pose.shake = 0.03 * Math.sin(w * 40) * Math.exp(-w * 1.2);
    }
    const [ra, raz] = this.reach(t, -1, this.ahead(t, -0.1, 1.55, 0.5));
    const raise = span(t, 4.0, 4.25) * (1 - span(t, V.after, V.after + 0.3));
    const carry = (1 - set) * span(t, 2.3, 2.5) + set * (1 - span(t, 2.85, 3.0));
    const both = this.both(t, this.crate.position.clone().add(new THREE.Vector3(0, 0.15, 0)));
    return {
      la: lerp(-0.25, both.la, carry),
      laz: both.laz * carry,
      ra: lerp(lerp(-0.25, both.ra, carry), ra, raise),
      raz: lerp(both.raz * carry, raz, raise),
    };
  }

  dispose() {
    this.flash.mat.dispose();
  }
}

/**
 * The anvil: the figure points at the ceiling. A whistle, falling; a shadow spreads over the sleeper; and a great
 * black anvil drops out of nowhere, CLANG, flattening them in a cloud of dust. It sits there a while. When it goes
 * with the figure, they pop back up like a concertina.
 */
class Anvil extends Deed {
  private anvil: THREE.Mesh;
  private shadow: THREE.Mesh;
  private shadowMat = new THREE.MeshBasicMaterial({ color: '#000000', transparent: true, opacity: 0, depthWrite: false });
  private flat = 0.22;

  constructor(s: Stage) {
    super(s);
    const m = s.material;
    // Lying across the bed (its length along x), the horn towards the figure.
    this.anvil = parts(m, (b) => {
      const DARK = '#3e4048';
      b.add(new THREE.BoxGeometry(0.46, 0.08, 0.3), DARK, { pos: [0, 0.04, 0] });
      b.add(new THREE.BoxGeometry(0.34, 0.06, 0.24), DARK, { pos: [0, 0.11, 0] });
      b.add(new THREE.BoxGeometry(0.2, 0.12, 0.16), DARK, { pos: [0, 0.2, 0] });
      b.add(new THREE.BoxGeometry(0.5, 0.1, 0.26), DARK, { pos: [0.04, 0.31, 0] });
      b.add(new THREE.BoxGeometry(0.5, 0.012, 0.26), '#6a6e78', { pos: [0.04, 0.362, 0] });
      b.add(new THREE.ConeGeometry(0.11, 0.3, 10), DARK, { pos: [-0.35, 0.31, 0], rot: [0, 0, Math.PI / 2], scale: [1, 1, 0.9] });
      b.add(new THREE.BoxGeometry(0.06, 0.08, 0.27), '#55585f', { pos: [0.3, 0.31, 0] });
      b.add(new THREE.BoxGeometry(0.2, 0.015, 0.02), '#8a8e98', { pos: [0.05, 0.335, 0.131] });
    });
    this.anvil.visible = false;
    this.shadow = new THREE.Mesh(new THREE.CircleGeometry(1, 24), this.shadowMat);
    this.shadow.rotation.x = -Math.PI / 2;
    this.shadow.visible = false;
    s.room.add(this.anvil, this.shadow);
  }

  update(t: number, pose: VictimPose, shown: boolean): Arms {
    const s = this.s;
    const V = VISIT;
    const { w, d } = this.size();
    const sz = clamp(Math.max(w / 0.55, d / 0.9), 1, 2.2);
    const land = V.strike;
    const fallFrom = 3.1;
    // Falling from up out of sight, quicker and quicker.
    const k = clamp((t - fallFrom) / (land - fallFrom), 0, 1);
    const rest = this.top(this.flat);
    const y = t < land ? lerp(rest + 3.6, rest, k * k) : rest + 0.05 * Math.exp(-(t - land) * 12) * Math.abs(Math.sin((t - land) * 30));
    const gone = span(t, V.vanish - 0.5, V.vanish - 0.2);
    this.anvil.visible = shown && t > fallFrom && gone < 0.99;
    this.anvil.position.set(s.chest.x, y, s.chest.z);
    this.anvil.scale.setScalar(sz * (1 - gone));
    this.anvil.rotation.set(t < land ? 0.15 * (1 - k) : 0, 0.15, t < land ? Math.sin(t * 7) * 0.1 * (1 - k) : 0);
    // Its shadow, spreading as it comes.
    this.shadow.visible = shown && t > fallFrom - 0.1 && t < land + 0.05;
    this.shadow.position.set(s.chest.x, this.top() + 0.02, s.chest.z);
    this.shadow.scale.set(0.35 * sz * (0.4 + 0.6 * k), 0.2 * sz * (0.4 + 0.6 * k), 1);
    this.shadowMat.opacity = 0.15 + 0.35 * k;
    if (t > fallFrom - 0.05) s.once('whistle', () => s.cue('drop'));
    if (t > fallFrom) s.once('plaster', () => s.bits.emit(new THREE.Vector3(s.chest.x, 3.0, s.chest.z), t, 10, { color: '#e8e2d6', speed: 0.9, size: 0.03, life: 1.0, fall: true }));
    if (t >= land) s.once('clang', () => {
      s.cue('clang');
      s.bits.emit(new THREE.Vector3(s.chest.x, COVERS + 0.05, s.chest.z), t, 24, { color: '#d8d0c0', speed: 2.0, up: 0.2, size: 0.07, grow: 2.2, life: 0.9, opacity: 0.75 });
    });
    if (t >= land + 0.35) s.once('tweet', () => s.cue('tweet'));
    // The sleeper: flat as a pancake from the clang until the anvil goes, then up like a concertina.
    if (t >= land) {
      const back = V.vanish - 0.25;
      if (t < back) pose.squash = this.flat + 0.06 * Math.exp(-(t - land) * 10) * Math.sin((t - land) * 45);
      else {
        const w2 = t - back;
        pose.squash = 1 - (1 - this.flat) * Math.exp(-w2 * 3.5) * Math.cos(w2 * 16);
        pose.dy = 0.18 * Math.max(0, Math.sin(w2 * 9)) * Math.exp(-w2 * 3);
        s.once('boing', () => s.cue('boing'));
      }
    }
    // Pointing up at the ceiling, then a look down at the work.
    const point = span(t, 2.55, 2.85) * (1 - span(t, land + 0.2, land + 0.6));
    const [ra, raz] = this.reach(t, -1, this.ahead(t, -0.1, 3.4, 0.6));
    s.body.rotation.x -= 0.25 * point;
    return { la: -0.25, laz: 0, ra: lerp(-0.25, ra, point), raz: raz * point };
  }

  dispose() {
    this.shadowMat.dispose();
  }
}

/**
 * The vampire: the figure beckons at the window, and a flurry of bats flies in and gathers into a vampire, cape
 * wrapped round him. He drifts over the bed, throws his cape wide (red inside), stoops to the sleeper's neck: a nip,
 * a long slurp, and they wilt. He swells a little, laughs, and bursts into bats that flutter back out of the window.
 */
class Vampire extends Deed {
  private vamp = new THREE.Group();
  private wings: THREE.Group[] = [];
  private bats: ReturnType<typeof bat>[] = [];
  private window = new THREE.Vector3(0, 2.0, -FLAT_HD + 0.3);

  constructor(s: Stage) {
    super(s);
    const m = s.material;
    const PALE = '#dfe3ea';
    const BLACK = '#17141c';
    this.vamp.add(
      parts(m, (b) => {
        // A long black coat, floating (no feet), a white shirt front and a red bow.
        b.add(new THREE.CylinderGeometry(0.16, 0.27, 1.05, 14), BLACK, { pos: [0, 0.82, 0] });
        b.add(new THREE.ConeGeometry(0.1, 0.36, 3), '#f4f1ea', { pos: [0, 1.18, 0.13], rot: [Math.PI + 0.12, 0, 0], scale: [1, 1, 0.35] });
        b.add(new THREE.SphereGeometry(1, 8, 6), '#b8202c', { pos: [0, 1.3, 0.15], scale: [0.05, 0.025, 0.02] });
        b.add(new THREE.SphereGeometry(1, 14, 10), BLACK, { pos: [0, 1.35, 0], scale: [0.22, 0.09, 0.15] });
        // The head: pale, a black widow's peak, pointed ears, red eyes and two little fangs.
        b.add(new THREE.SphereGeometry(1, 16, 12), PALE, { pos: [0, 1.55, 0.01], scale: [0.13, 0.155, 0.13] });
        b.add(new THREE.SphereGeometry(1, 16, 12), BLACK, { pos: [0, 1.6, -0.02], scale: [0.138, 0.13, 0.14] });
        b.add(new THREE.ConeGeometry(0.05, 0.08, 4), BLACK, { pos: [0, 1.63, 0.105], rot: [Math.PI - 0.3, 0, 0], scale: [1, 1, 0.4] });
        for (const sx of [-1, 1]) {
          b.add(new THREE.ConeGeometry(0.03, 0.09, 5), PALE, { pos: [sx * 0.13, 1.57, -0.01], rot: [0, 0, -sx * 1.2], scale: [1, 1, 0.4] });
          b.add(new THREE.SphereGeometry(0.018, 8, 6), '#ff2a3a', { pos: [sx * 0.045, 1.56, 0.115] });
          b.add(new THREE.BoxGeometry(0.06, 0.012, 0.01), BLACK, { pos: [sx * 0.05, 1.6, 0.12], rot: [0, 0, sx * 0.35] });
          b.add(new THREE.ConeGeometry(0.008, 0.03, 4), '#ffffff', { pos: [sx * 0.022, 1.475, 0.118], rot: [Math.PI, 0, 0] });
          // The tall collar.
          b.add(new THREE.ConeGeometry(0.1, 0.32, 3), BLACK, { pos: [sx * 0.15, 1.55, -0.07], rot: [0, 0, -sx * 0.35], scale: [1, 1, 0.2] });
          b.add(new THREE.ConeGeometry(0.08, 0.28, 3), '#b8202c', { pos: [sx * 0.14, 1.54, -0.05], rot: [0, 0, -sx * 0.35], scale: [1, 1, 0.15] });
        }
        b.add(new THREE.BoxGeometry(0.06, 0.008, 0.01), '#5a2a30', { pos: [0, 1.49, 0.122] });
      }),
    );
    // The cape's two halves, hinged at the shoulders: black outside, red lining.
    for (const side of [1, -1]) {
      const pivot = new THREE.Group();
      pivot.position.set(side * 0.17, 1.38, -0.02);
      pivot.add(
        parts(m, (b) => {
          b.add(new THREE.BoxGeometry(0.42, 1.15, 0.015), BLACK, { pos: [side * 0.18, -0.55, -0.01] });
          b.add(new THREE.BoxGeometry(0.4, 1.12, 0.012), '#a81c28', { pos: [side * 0.18, -0.55, 0.004] });
          for (let k = 0; k < 3; k++) b.add(new THREE.ConeGeometry(0.07, 0.12, 3), BLACK, { pos: [side * (0.05 + k * 0.13), -1.15, -0.005], rot: [Math.PI, 0, 0], scale: [1, 1, 0.15] });
        }),
      );
      this.wings.push(pivot);
      this.vamp.add(pivot);
    }
    this.vamp.visible = false;
    for (let i = 0; i < 8; i++) {
      const b = bat(m);
      b.root.visible = false;
      this.bats.push(b);
      s.room.add(b.root);
    }
    s.room.add(this.vamp);
  }

  update(t: number, pose: VictimPose, shown: boolean): Arms {
    const s = this.s;
    // In: a flutter of bats from the window that gather into him; out: the same, the other way.
    const formAt = 2.55;
    const burstAt = 4.6;
    // Where he stands (his feet, floating): by the window as he forms, then over the head of the bed behind the
    // pillow, facing the room; then stooped over the sleeper's neck, and up again.
    const win = this.window.clone().setY(0.55);
    const hover = new THREE.Vector3(s.head.x + 0.32, COVERS - 0.15, Math.max(BED.z - BED.d / 2 + 0.12, s.head.z - 0.45));
    const face = 0.3;
    const toNeck = Math.atan2(s.head.x - hover.x, s.head.z - hover.z);
    const across = span(t, 2.7, 3.3);
    const down = span(t, 3.45, 3.68) * (1 - span(t, 4.25, 4.5));
    const lean = 0.4 * down;
    const yaw = lerp(lerp(Math.atan2(hover.x - win.x, hover.z - win.z), face, span(t, 3.1, 3.4)), toNeck, down);
    const neck = s.head.clone().add(new THREE.Vector3(0.1, 0.16, 0.08));
    const stoop = neck
      .clone()
      .sub(new THREE.Vector3(0, 1.55 * Math.cos(0.4), 0))
      .sub(new THREE.Vector3(Math.sin(toNeck), 0, Math.cos(toNeck)).multiplyScalar(1.55 * Math.sin(0.4)));
    const where = win.clone().lerp(hover, across).add(new THREE.Vector3(0, Math.sin(Math.PI * across) * 0.35, 0)).lerp(stoop, down);
    where.y += Math.sin(t * 2.2) * 0.04;
    const here = t >= formAt && t < burstAt;
    this.vamp.visible = shown && here;
    this.vamp.position.copy(where);
    this.vamp.rotation.set(0, yaw, 0);
    this.vamp.rotateX(lean);
    const swell = 1 + 0.12 * span(t, 3.85, 4.4);
    this.vamp.scale.setScalar(swell * span(t, formAt, formAt + 0.15));
    const spread = span(t, 3.2, 3.45);
    this.wings.forEach((w, i) => {
      const side = i ? -1 : 1;
      w.rotation.set(0, side * lerp(1.1, -0.1, spread), side * 0.55 * spread + Math.sin(t * 3 + i) * 0.04);
    });
    // The bats.
    const centre = where.clone().add(new THREE.Vector3(0, 1.1, 0));
    const outTo = this.window.clone().add(new THREE.Vector3(0, 0.3, -0.6));
    this.bats.forEach((b, i) => {
      const a = (i / this.bats.length) * Math.PI * 2 + t * 6;
      const ring = new THREE.Vector3(Math.cos(a) * 0.35, Math.sin(a * 1.3 + i) * 0.2, Math.sin(a) * 0.35);
      let p: THREE.Vector3 | null = null;
      if (t > 2.1 && t < formAt) {
        const k = span(t, 2.1 + i * 0.03, formAt);
        p = this.window.clone().add(new THREE.Vector3(0, 0.2, -0.5)).lerp(centre, k).add(ring.multiplyScalar(1 - k * 0.6));
      } else if (t >= burstAt && t < burstAt + 1.2) {
        const k = span(t, burstAt, burstAt + 1.1 - i * 0.03);
        p = centre.clone().add(ring.multiplyScalar(0.5 + k)).lerp(outTo, k * k);
      }
      b.root.visible = shown && p !== null;
      if (!p) return;
      b.root.position.copy(p);
      b.root.rotation.set(0, a + Math.PI / 2, 0.3 * Math.sin(t * 9 + i));
      b.flap(Math.sin(t * 30 + i * 1.7));
      b.root.scale.setScalar(1.4);
    });
    if (t > 2.1) s.once('in', () => s.cue('flutter'));
    if (t > formAt) s.once('form', () => s.bits.emit(centre, t, 14, { color: '#2a2036', speed: 1.0, size: 0.12, grow: 2.2, life: 0.8 }));
    if (t > 3.2) s.once('cape', () => s.cue('whoosh'));
    if (t > 3.7) s.once('bite', () => s.cue('bite'));
    if (t > 3.85) s.once('slurp', () => s.cue('slurp'));
    if (t > 4.4) s.once('laugh', () => s.cue('laugh'));
    if (t >= burstAt) s.once('out', () => {
      s.cue('flutter');
      s.bits.emit(centre, t, 18, { color: '#2a2036', speed: 1.4, size: 0.14, grow: 2.4, life: 0.9 });
    });
    // The sleeper: a start at the nip, then wilting as he drinks.
    const u = t - 3.72;
    if (u > 0) {
      pose.dy = 0.1 * Math.exp(-u * 8) * Math.abs(Math.sin(u * 20));
      pose.squash = 1 - 0.28 * span(u, 0.15, 0.75);
      pose.shake = 0.02 * Math.sin(u * 40) * Math.exp(-u * 1.5);
    }
    // The figure beckons at the window, then folds its hands.
    const beck = span(t, 1.6, 1.9) * (1 - span(t, 2.6, 2.9));
    const [ra, raz] = this.reach(t, -1, this.window);
    const curl = Math.sin(t * 9) * 0.3 * beck;
    return { la: -0.55, laz: -0.3, ra: lerp(-0.55, ra + curl, beck), raz: lerp(0.3, raz, beck) };
  }
}

/**
 * The mummy: the figure hurls a roll of bandage, which whirls round and round the sleeper from their toes to their
 * ears, wrapping them up tight. A low groan from inside, two stiff hops, and they lie there bound like a parcel
 * until the wrappings crumble away after the figure has gone.
 */
class Mummy extends Deed {
  private roll: THREE.Mesh;
  private bands: THREE.Mesh[] = [];
  private strip: THREE.Mesh;
  private n = 11;
  private wrapFrom = 3.0;
  private wrapTo = 4.15;

  constructor(s: Stage) {
    super(s);
    const m = s.material;
    this.roll = parts(m, (b) => {
      b.add(new THREE.CylinderGeometry(0.075, 0.075, 0.14, 14), '#efe8d6');
      b.add(new THREE.CylinderGeometry(0.025, 0.025, 0.145, 8), '#c8bc9e');
    });
    const band = new THREE.TorusGeometry(1, 0.05, 5, 28);
    for (let i = 0; i < this.n; i++) {
      const mesh = parts(m, (b) => b.add(band, i % 3 === 1 ? '#d8ccaa' : '#ebe3cc'));
      mesh.visible = false;
      this.bands.push(mesh);
      s.room.add(mesh);
    }
    this.strip = parts(m, (b) => b.add(new THREE.BoxGeometry(0.1, 1, 0.008), '#ebe3cc'));
    s.room.add(this.roll, this.strip);
  }

  update(t: number, pose: VictimPose, shown: boolean): Arms {
    const s = this.s;
    const V = VISIT;
    const box = s.box;
    const dy = pose.dy;
    // (Hugging them: centred low, so the lower half of each band is down in the mattress.)
    const rx = (box.max.x - box.min.x) / 2 + 0.04;
    // (Measured by their middle, not an ear or a tail that sticks up.)
    const ry = clamp((box.max.y - COVERS) * 0.5, 0.14, 0.32);
    const cy = COVERS + ry * 0.45;
    const cx = (box.min.x + box.max.x) / 2;
    const z0 = box.max.z + 0.02;
    const z1 = box.min.z + 0.02;
    const w = clamp((t - this.wrapFrom) / (this.wrapTo - this.wrapFrom), 0, 1);
    const loops = this.n - 0.5;
    const a = w * Math.PI * 2 * loops;
    // The roll: in the figure's hands, flung, then whirling round them along their length.
    const held = this.ahead(t, 0, 1.05, 0.45);
    const orbit = new THREE.Vector3(cx + Math.cos(a) * rx * 1.15, cy + Math.sin(a) * ry * 1.15, lerp(z0, z1, w));
    const fling = span(t, 2.75, this.wrapFrom);
    const rollAt = t < this.wrapFrom ? held.lerp(orbit, fling) : orbit;
    const loose = t > this.wrapTo ? span(t, this.wrapTo, this.wrapTo + 0.35) : 0;
    rollAt.add(new THREE.Vector3(-0.3 * loose, 0.5 * loose, 0));
    this.roll.visible = shown && t < this.wrapTo + 0.4;
    this.roll.position.copy(rollAt);
    this.roll.rotation.set(t * 12, 0, Math.PI / 2);
    this.roll.scale.setScalar(1 - 0.5 * w);
    // The bands: each one there once the roll has been round, slightly askew, rising and falling with them.
    const fade = span(t, V.vanish + 0.3, V.vanish + 0.8);
    this.bands.forEach((b, i) => {
      const at = (i + 0.5) / this.n;
      b.visible = shown && w >= at && fade < 0.99;
      b.position.set(cx, cy + dy, lerp(z0, z1, at));
      b.rotation.set(i % 2 ? 0.18 : -0.14, (i % 3) * 0.06, 0);
      const sq = pose.squash ?? 1;
      b.scale.set(rx * (1 + (1 - sq) * 0.6) * (1 - fade), ry * sq * (1 - fade), 2.4);
    });
    if (fade > 0) s.once('crumble', () => s.bits.emit(new THREE.Vector3(cx, cy, (z0 + z1) / 2), t, 20, { color: '#e8e0c8', speed: 1.2, up: 0.4, size: 0.06, grow: 2, life: 1.0, opacity: 0.8 }));
    // The strip from the last band to the roll.
    const lastZ = lerp(z0, z1, Math.max(0, Math.floor(w * this.n) - 0.5) / this.n);
    const anchor = new THREE.Vector3(cx, cy + ry, w > 0 ? lastZ : z0);
    this.strip.visible = shown && w > 0 && t < this.wrapTo + 0.4;
    if (this.strip.visible) between(this.strip, anchor, rollAt);
    for (let k = 0; k < this.n; k++) if (w * this.n > k + 0.3) s.once(`wrap${k}`, () => s.cue('wrap'));
    // The sleeper: shaking as they're wound, then a groan and two stiff hops, and lying stiff after.
    if (w > 0 && w < 1) pose.shake = 0.03 * Math.sin(t * 40);
    const hop = (h: number) => (t > h && t < h + 0.3 ? 0.16 * Math.sin((Math.PI * (t - h)) / 0.3) : 0);
    if (t > this.wrapTo) {
      pose.dy = hop(4.35) + hop(4.75);
      pose.squash = 1.04;
      s.once('groan', () => s.cue('groan'));
    }
    // Arms: holding the roll, flinging it, then winding the air like a reel.
    const both = this.both(t, held);
    const holding = 1 - span(t, 2.8, this.wrapFrom);
    const wind = span(t, this.wrapFrom - 0.1, this.wrapFrom + 0.2) * (1 - span(t, this.wrapTo, this.wrapTo + 0.3));
    return {
      la: lerp(-0.25, both.la, holding * span(t, 2.2, 2.5)) - wind * (1.2 + 0.4 * Math.sin(t * 14)),
      ra: lerp(-0.25, both.ra, holding * span(t, 2.2, 2.5)) - wind * (1.2 + 0.4 * Math.sin(t * 14 + Math.PI)),
      laz: both.laz * holding + wind * 0.3,
      raz: both.raz * holding - wind * 0.3,
    };
  }
}

/**
 * The jungle game: a carved wooden board game appears on the end of the bed and opens, drums beating somewhere far
 * off. The figure rolls the dice; the board glows green, and vines burst out of it, snake over the covers and coil
 * round the sleeper, and drag them down into the game. The lid slams. Later their ghost drifts back up out of the bed.
 */
class Jungle extends Deed {
  private game = new THREE.Group();
  private lid = new THREE.Group();
  private glow: THREE.Mesh;
  private glowMat = new THREE.MeshBasicMaterial({ color: '#6aff8a', transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending });
  private dice: THREE.Mesh[] = [];
  private vines: THREE.Mesh[][] = [];
  private leaves: THREE.Mesh[] = [];
  private segs = 12;

  constructor(s: Stage) {
    super(s);
    const m = s.material;
    this.game.add(
      parts(m, (b) => {
        b.add(new THREE.BoxGeometry(0.72, 0.07, 0.5), '#5a3a22', { pos: [0, 0.035, 0] });
        b.add(new THREE.BoxGeometry(0.66, 0.012, 0.44), '#3f6a3a', { pos: [0, 0.075, 0] });
        // A spiral of squares round the middle, and a dark crystal well in the centre.
        for (let k = 0; k < 14; k++) {
          const a = k * 0.75;
          const r = 0.06 + k * 0.012;
          b.add(new THREE.BoxGeometry(0.035, 0.008, 0.035), k % 2 ? '#e8d48a' : '#c9a24f', { pos: [Math.cos(a) * r * 1.3, 0.083, Math.sin(a) * r], rot: [0, a, 0] });
        }
        b.add(new THREE.CylinderGeometry(0.06, 0.07, 0.01, 12), '#1d2a20', { pos: [0, 0.085, 0] });
      }),
    );
    this.lid.position.set(-0.36, 0.07, 0);
    this.lid.add(
      parts(m, (b) => {
        b.add(new THREE.BoxGeometry(0.72, 0.05, 0.5), '#6b4528', { pos: [0.36, 0.025, 0] });
        b.add(new THREE.BoxGeometry(0.5, 0.01, 0.34), '#8a5a34', { pos: [0.36, 0.055, 0] });
        for (const sz of [-1, 1]) b.add(new THREE.ConeGeometry(0.04, 0.12, 4), '#3f6a3a', { pos: [0.36 + sz * 0.15, 0.06, 0], rot: [Math.PI / 2, 0, sz * 0.8], scale: [1, 1, 0.3] });
      }),
    );
    this.game.add(this.lid);
    this.glow = new THREE.Mesh(new THREE.SphereGeometry(0.3, 14, 10), this.glowMat);
    this.glow.scale.set(1.2, 0.4, 1);
    this.glow.position.y = 0.1;
    this.game.add(this.glow);
    this.game.visible = false;
    for (let i = 0; i < 2; i++) {
      const die = parts(m, (b) => {
        b.add(new THREE.BoxGeometry(0.07, 0.07, 0.07), '#f6f1e6');
        for (const [x, y, z] of [
          [0, 0.036, 0],
          [0.036, 0.015, 0.015],
          [0.036, -0.015, -0.015],
          [0, 0, 0.036],
        ])
          b.add(new THREE.SphereGeometry(0.008, 6, 4), '#1d1a24', { pos: [x, y, z] });
      });
      die.visible = false;
      this.dice.push(die);
      s.room.add(die);
    }
    const seg = tinted(new THREE.CylinderGeometry(0.028, 0.034, 1, 7), '#3f7a33');
    const leafGeo = parts(m, (b) => b.add(new THREE.SphereGeometry(1, 8, 5), '#4f9a3a', { scale: [0.06, 0.012, 0.035] })).geometry;
    for (let v = 0; v < 4; v++) {
      const chain: THREE.Mesh[] = [];
      for (let i = 0; i < this.segs; i++) {
        const piece = new THREE.Mesh(seg, m);
        piece.visible = false;
        chain.push(piece);
        s.room.add(piece);
      }
      this.vines.push(chain);
      for (let j = 0; j < 3; j++) {
        const leaf = new THREE.Mesh(leafGeo, m);
        leaf.visible = false;
        this.leaves.push(leaf);
        s.room.add(leaf);
      }
    }
    s.room.add(this.game);
  }

  update(t: number, pose: VictimPose, shown: boolean): Arms {
    const s = this.s;
    const V = VISIT;
    const box = s.box;
    // On the end of the bed, by their feet.
    const at = new THREE.Vector3(BED.x, COVERS, BED.z + BED.d / 2 - 0.34);
    // The game: there with a puff, opened, glowing to the drums, shut with a slam, and gone.
    const there = span(t, 2.3, 2.5) * (1 - span(t, V.vanish - 0.4, V.vanish - 0.1));
    this.game.visible = shown && there > 0.01;
    this.game.position.copy(at);
    this.game.scale.setScalar(Math.max(0.01, there) * 1.15);
    this.game.rotation.y = 0.12;
    if (t > 2.3) s.once('appear', () => s.bits.emit(at.clone().setY(at.y + 0.1), t, 12, { color: '#2a2036', speed: 1.0, size: 0.1, grow: 2, life: 0.7 }));
    const open = span(t, 2.7, 2.95) * (1 - span(t, 4.65, 4.75));
    this.lid.rotation.z = 2.4 * open;
    if (t > 2.55) s.once('drums', () => s.cue('drums'));
    if (t > 4.7) s.once('slam', () => s.cue('slam'));
    const beat = Math.pow(Math.abs(Math.sin(t * (4 + (t - 2.5) * 3))), 6);
    const lit = open * (0.25 + 0.35 * beat + 0.6 * span(t, 3.4, 3.5) * (1 - span(t, 4.3, 4.65)));
    this.glowMat.opacity = lit;
    this.glow.visible = lit > 0.02;
    // The dice: tossed from the hand onto the board, tumbling, and settling.
    const hand = this.ahead(t, -0.25, 1.15, 0.5);
    this.dice.forEach((die, i) => {
      const k = clamp((t - 2.95 - i * 0.05) / 0.4, 0, 1);
      const land = at.clone().add(new THREE.Vector3(-0.1 + i * 0.16, 0.12, 0.05 - i * 0.08));
      const p = hand.clone().lerp(land, k).add(new THREE.Vector3(0, Math.sin(Math.PI * k) * 0.35, 0));
      if (k >= 1) p.y += 0.03 * Math.abs(Math.sin((t - 3.35) * 20)) * Math.exp(-(t - 3.35) * 8);
      die.visible = shown && t > 2.95 && open > 0.5 && t < 4.6;
      die.position.copy(p);
      die.rotation.set(k * 9 + i, k * 7, k * 5 + i * 2);
    });
    if (t > 3.3) s.once('dice', () => s.cue('dice'));
    // The vines: out of the middle of the board, over the covers and round the sleeper; drawn back down with them.
    const pull = span(t, 4.0, 4.5);
    const r = rng(5);
    this.vines.forEach((chain, v) => {
      const grow = span(t, 3.45 + v * 0.06, 3.9 + v * 0.06) * (1 - span(t, 4.4, 4.65));
      const side = v % 2 ? 1 : -1;
      const target = new THREE.Vector3(
        lerp(box.min.x, box.max.x, v % 2 ? 0.85 : 0.15),
        this.top() + 0.04 - pull * 0.6,
        lerp(box.max.z, box.min.z, 0.25 + v * 0.17),
      );
      const start = at.clone().setY(at.y + 0.08);
      const ctrl = start.clone().lerp(target, 0.5).add(new THREE.Vector3(side * 0.35, 0.45 + r() * 0.2, 0));
      const pts: THREE.Vector3[] = [];
      for (let i = 0; i <= this.segs; i++) {
        const k = (i / this.segs) * grow;
        const a = start.clone().lerp(ctrl, k);
        const b = ctrl.clone().lerp(target, k);
        const p = a.lerp(b, k);
        // A coil round them at the far end.
        const coil = span(k, 0.7, 1);
        p.add(new THREE.Vector3(Math.cos(k * 18 + v) * 0.12 * coil, Math.sin(k * 18 + v) * 0.06 * coil + Math.sin(t * 6 + i) * 0.015, 0));
        pts.push(p);
      }
      chain.forEach((piece, i) => {
        piece.visible = shown && grow > 0.02;
        if (piece.visible) between(piece, pts[i], pts[i + 1], 1 - i / (this.segs * 1.4));
      });
      for (let j = 0; j < 3; j++) {
        const leaf = this.leaves[v * 3 + j];
        const p = pts[3 + j * 3];
        leaf.visible = shown && grow > 0.3 + j * 0.2;
        leaf.position.copy(p).add(new THREE.Vector3(0, 0.03, 0));
        leaf.rotation.set(0.3, v + j * 2.1 + Math.sin(t * 4) * 0.2, 0.4);
      }
    });
    if (t > 3.45) s.once('vines', () => {
      s.cue('vines');
      s.bits.emit(at.clone().setY(at.y + 0.15), t, 16, { color: '#8aff9a', speed: 1.4, up: 1, size: 0.03, life: 0.6 });
    });
    if (t > 4.0) s.once('suck', () => s.cue('suck'));
    // The sleeper: struggling in the vines, then dragged down out of sight; back up as a ghost later.
    if (t > 3.85 && t < 4.0) pose.shake = 0.05 * Math.sin(t * 50);
    if (t >= 4.0) {
      pose.dy = -1.6 * pull * pull;
      pose.squash = 1 - 0.3 * pull;
      pose.shake = 0.05 * Math.sin(t * 50) * (1 - pull);
    }
    this.ghostUp(t, pose);
    // The figure: dice in hand, a shake and a throw, then arms raised to the drums.
    const [ra, raz] = this.reach(t, -1, t < 3.0 ? hand.clone().add(new THREE.Vector3(0, 0.08 * Math.sin(t * 30), 0)) : at);
    const toss = span(t, 2.6, 2.8) * (1 - span(t, 3.05, 3.3));
    const drums = this.conduct(t, span(t, 3.3, 3.6) * (1 - span(t, 4.6, 4.9)), 11);
    return { la: drums.la, laz: drums.laz, ra: lerp(drums.ra, ra, toss), raz: lerp(drums.raz, raz, toss) };
  }

  dispose() {
    this.glowMat.dispose();
  }
}

const ACTS: (new (s: Stage) => Act)[] = [Mallet, JackInTheBox, Lightning, Ravens, Snuffer, Trapdoor, Shark, Curtain, Balloon, Claws, Telly, Gremlins, Anvil, Vampire, Mummy, Jungle];
