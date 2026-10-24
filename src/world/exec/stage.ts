import * as THREE from 'three';
import type { ExecMethod } from '../../state/types';
import { disposeObject } from '../items';
import type { Anim } from '../types';
import { BakedPiece, bakeAnimal, freeBake, measureAnimal, tintAnimal, type Build } from './bake';
import { Bolts, Bursts, Dizzy, FEATHER, Flames, Mushroom, ease, easeOut, hash, span } from './fx';
import { Builder, matte } from '../build';
import { G } from '../town/kit';
import { signBoard, TextSign } from '../town/sign';
import {
  beamColumn,
  biplane,
  chair,
  crater,
  giantPigeon,
  guillotine,
  haystack,
  kaiju,
  launcher,
  moon,
  nestTree,
  propeller,
  rainCloud,
  roast,
  soldier,
  station,
  type Chair,
  type Cloud,
  type GiantPigeon,
  type Guillotine,
  type Kaiju,
  type Launcher,
  type Moon,
  type NestTree,
  type Plane,
  type Propeller,
  type Roast,
  type Soldier,
  type Station,
} from './props';

/**
 * Every way to be executed but the gallows (which the town draws itself): the props, the effects, and where the
 * condemned is and how they look through it, all worked out from the seconds since it began, so it plays the same
 * on every screen and can be held at any moment. Storybook rather than gory: jolts, flashes, puffs of smoke, soot
 * and a frazzled coat. Then (unless they're spared) their ghost floats slowly up out of what's left of them.
 *
 * The props stand on the gallows platform (or beside it), turned to read well from the meeting camera, and are
 * sized to whoever is condemned, tall or tiny, long or floating.
 */

/**
 * How far back and how high the camera watches a show from (see execCamera), from nearly in front, between the
 * posts. (The gallows itself has its own shot, square on to the condemned: see Engine.gallowsShot.)
 */
export const EXEC_CAM = { dist: 8.5, height: 4.4 };
export const STAGE_YAW = -1.2;

/**
 * Where the camera goes for a framing: looking at its spot from the meeting camera's angle, pulled back far enough
 * for its radius (more so on a narrow screen held upright), and shaken a little when the ground shakes.
 */
export function execCamera(f: ExecFrame, aspect: number, t: number): { pos: THREE.Vector3; look: THREE.Vector3 } {
  let k = f.radius / 3.2;
  if (f.radius > 3 && aspect < 1) k *= Math.min(1.5, 1 / aspect ** 0.5);
  const pos = new THREE.Vector3(Math.sin(STAGE_YAW) * EXEC_CAM.dist * k, EXEC_CAM.height * k * (1 - (f.low ?? 0)), Math.cos(STAGE_YAW) * EXEC_CAM.dist * k).add(f.look);
  if (f.shake > 0) pos.add(new THREE.Vector3(Math.sin(t * 61) * 0.12, Math.sin(t * 53 + 1) * 0.1, Math.sin(t * 47 + 2) * 0.12).multiplyScalar(f.shake));
  return { pos, look: f.look.clone() };
}

/** The ghost floating up: how long the rise takes, then the little pop as it goes. */
export const SOUL = { rise: 3.1, pop: 0.3 };

/** How the condemned looks at a moment of the show. Positions are in the world. */
export interface ExecPose {
  /** Where the animal's root (its feet) goes, and its whole turn and stretch. */
  pos: THREE.Vector3;
  quat: THREE.Quaternion;
  scale: THREE.Vector3;
  anim: Anim;
  /** Drawn at all (a stand-in, cut in two or left behind, is drawn instead). */
  visible: boolean;
  /** Their name tag shows. */
  tag: boolean;
  /** A ghost from now on. */
  ghost: boolean;
}

/** The camera's framing: the spot to look at and how much around it must fit, and a shake. */
export interface ExecFrame {
  look: THREE.Vector3;
  radius: number;
  shake: number;
  /** From 0 (the usual, looking down) to 1 (level): lower, to look up at things in the sky. */
  low?: number;
}

type Sound = (name: string) => void;

const UP = new THREE.Vector3(0, 1, 0);
const tmpQ = new THREE.Quaternion();

/** A turn that takes `a` (and the way `a2` leans about it) to `b` (and `b2`), from two pairs of directions. */
function basis(a: THREE.Vector3, a2: THREE.Vector3, b: THREE.Vector3, b2: THREE.Vector3): THREE.Quaternion {
  const frame = (x: THREE.Vector3, y: THREE.Vector3) => {
    const X = x.clone().normalize();
    const Y = y.clone().sub(X.clone().multiplyScalar(y.dot(X))).normalize();
    const Z = new THREE.Vector3().crossVectors(X, Y);
    return new THREE.Matrix4().makeBasis(X, Y, Z);
  };
  const from = frame(a, a2);
  const to = frame(b, b2);
  return new THREE.Quaternion().setFromRotationMatrix(to.multiply(from.transpose()));
}

/** A smooth path through points, each passed at its own moment (a Catmull-Rom curve, walked a segment at a time). */
class Flight {
  private curve: THREE.CatmullRomCurve3;
  private times: number[];

  constructor(keys: [number, THREE.Vector3][]) {
    this.times = keys.map((k) => k[0]);
    this.curve = new THREE.CatmullRomCurve3(keys.map((k) => k[1]));
  }

  at(t: number, out = new THREE.Vector3()): THREE.Vector3 {
    const n = this.times.length;
    if (t <= this.times[0]) return this.curve.getPoint(0, out);
    if (t >= this.times[n - 1]) return this.curve.getPoint(1, out);
    let i = 0;
    while (t > this.times[i + 1]) i++;
    const k = (t - this.times[i]) / (this.times[i + 1] - this.times[i]);
    return this.curve.getPoint((i + k) / (n - 1), out);
  }

  /** Heading along the path at `t`, and how hard it's turning (its pull towards the inside of the curve). */
  motion(t: number, d = 0.08): { fwd: THREE.Vector3; acc: THREE.Vector3 } {
    const a = this.at(t - d);
    const b = this.at(t);
    const c = this.at(t + d);
    return { fwd: c.clone().sub(a), acc: a.add(c).addScaledVector(b, -2).divideScalar(d * d) };
  }
}

/** The total of a rate that changes in straight lines between (time, rate) points, from the start to `t`. */
function integrate(rates: [number, number][], t: number): number {
  let sum = 0;
  for (let i = 0; i + 1 < rates.length; i++) {
    const [t0, r0] = rates[i];
    const [t1, r1] = rates[i + 1];
    if (t <= t0) break;
    const u = Math.min(t, t1);
    const ru = r0 + ((r1 - r0) * (u - t0)) / (t1 - t0);
    sum += ((r0 + ru) / 2) * (u - t0);
  }
  const [tl, rl] = rates[rates.length - 1];
  if (t > tl) sum += rl * (t - tl);
  return sum;
}

/** The show's timings for each method, in seconds: when the ghost rises (null when spared) and when it ends. */
const TIMES: Record<Exclude<ExecMethod, 'hang'>, { soul: number; spared: number }> = {
  squad: { soul: 4.2, spared: 5.8 },
  guillotine: { soul: 3.7, spared: 5.6 },
  chair: { soul: 4.6, spared: 5.4 },
  missile: { soul: 5.3, spared: 6.2 },
  roast: { soul: 4.6, spared: 6.0 },
  kaiju: { soul: 6.4, spared: 8.0 },
  plane: { soul: 8.2, spared: 6.0 },
  pigeon: { soul: 6.4, spared: 9.0 },
  moon: { soul: 7.1, spared: 8.8 },
};

/** The plane crash: when it hits the ground (unless spared), and the giant pigeon: when it lets go over the nest. */
const PLANE_HIT = 6.8;
const PIGEON_DROP = 4.35;

export class ExecStage {
  /** In the town, at the gallows, turned as it is. Everything the show adds goes in here. */
  readonly group = new THREE.Group();
  /** Seconds it lasts. */
  readonly end: number;
  /** When the ghost starts up (Infinity when spared). */
  readonly soulAt: number;
  private P: number;
  /** In the stage's frame: towards the camera, and the screen's left (both flat). */
  private cam = new THREE.Vector3();
  private left = new THREE.Vector3();
  private bursts = new Bursts();
  /** Holds what's placed in world coordinates (puffs, sparks, what's left behind): it undoes the stage's own place. */
  private fx = new THREE.Group();
  private done = new Set<string>();
  private build: Build | null = null;
  private who: THREE.Object3D | null = null;
  private tinted = false;
  private corpse: BakedPiece | null = null;
  private pieces: BakedPiece[] = [];
  private props = new THREE.Group();
  private disposers: (() => void)[] = [];
  private camera: THREE.Camera | undefined;
  private frame: ExecFrame;
  /** The local pose being built this frame. */
  private at = new THREE.Vector3();
  private turn = new THREE.Quaternion();
  private stretch = new THREE.Vector3(1, 1, 1);

  // Each method's own bits.
  private soldiers: Soldier[] = [];
  private blade: Guillotine | null = null;
  private seat: Chair | null = null;
  private bolts: Bolts | null = null;
  private rocket: Launcher | null = null;
  private spit: Roast | null = null;
  private flames: Flames | null = null;
  private apple: THREE.Mesh | null = null;
  private cloud: Cloud | null = null;
  private beast: Kaiju | null = null;
  private beam: THREE.Group | null = null;
  private dizzy: Dizzy | null = null;
  private crack: THREE.Mesh | null = null;
  private craft: Plane | null = null;
  private flight: Flight | null = null;
  private hay: THREE.Group | null = null;
  private pit: THREE.Group | null = null;
  private loose: Propeller | null = null;
  private mushroom: Mushroom | null = null;
  private bird: GiantPigeon | null = null;
  private tree: NestTree | null = null;
  /** A sign that pops up: YUCK!, or LOW BATTERY. */
  private notice: { group: THREE.Group; dispose(): void } | null = null;
  private feather: THREE.Mesh | null = null;
  private rock: Moon | null = null;
  private base: Station | null = null;
  private columns: { mesh: THREE.Mesh; material: THREE.MeshBasicMaterial }[] = [];
  private rays: THREE.Mesh[] = [];
  private rayMat: THREE.MeshBasicMaterial | null = null;
  private ring: THREE.Mesh | null = null;
  private chunks: THREE.Mesh[] = [];
  /** Worked out once the condemned has been measured. */
  private lay = new THREE.Quaternion();
  private layAt = new THREE.Vector3();
  private extra: Record<string, number> = {};

  constructor(
    readonly method: Exclude<ExecMethod, 'hang'>,
    readonly survives: boolean,
    spot: { x: number; z: number; ry: number; y: number },
    private sound: Sound = () => {},
  ) {
    this.P = spot.y;
    this.group.position.set(spot.x, 0, spot.z);
    this.group.rotation.y = spot.ry;
    this.group.updateMatrixWorld(true);
    // The camera's direction (a compass angle in the world) in the stage's own frame.
    const camWorld = new THREE.Vector3(Math.sin(STAGE_YAW), 0, Math.cos(STAGE_YAW));
    this.cam.copy(camWorld).applyAxisAngle(UP, -spot.ry).normalize();
    // Looking along -cam, the screen's left is this way.
    this.left.set(-this.cam.z, 0, this.cam.x);
    this.fx.matrixAutoUpdate = false;
    this.fx.matrix.copy(this.group.matrix).invert();
    this.fx.add(this.bursts.group);
    this.group.add(this.props, this.fx);
    const t = TIMES[method];
    this.soulAt = survives ? Infinity : t.soul;
    this.end = survives ? t.spared : t.soul + SOUL.rise + SOUL.pop + 0.6;
    this.frame = { look: this.world(new THREE.Vector3(0, this.P + 0.8, 0)), radius: 2.8, shake: 0 };
  }

  /** A point in the stage's frame, in the world. */
  private world(v: THREE.Vector3): THREE.Vector3 {
    return this.group.localToWorld(v.clone());
  }

  /** Runs `fn` once, the first time the show reaches `at`. */
  private once(key: string, at: number, t: number, fn: () => void) {
    if (t < at || this.done.has(key)) return;
    this.done.add(key);
    fn();
  }

  /** A sound, once, as the show passes `at` (not when it's been jumped well past). */
  private sfx(name: string, at: number, t: number) {
    this.once(`sfx:${name}:${at}`, at, t, () => t - at < 0.3 && this.sound(name));
  }

  /** The animal's size, measured once (or a middling animal, if they can't be seen here). */
  private size(): Build {
    if (!this.build && this.who) this.build = measureAnimal(this.who);
    return (
      this.build ?? {
        box: new THREE.Box3(new THREE.Vector3(-0.3, 0, -0.3), new THREE.Vector3(0.3, 1.05, 0.3)),
        neck: new THREE.Vector3(0, 0.6, 0),
        head: new THREE.Vector3(0, 0.82, 0.05),
        mouth: new THREE.Vector3(0, 0.75, 0.3),
      }
    );
  }

  /** Facing this way (in the stage's frame), upright. */
  private face(dir: THREE.Vector3): THREE.Quaternion {
    return new THREE.Quaternion().setFromAxisAngle(UP, Math.atan2(dir.x, dir.z));
  }

  /** The props pop in with a puff at the start and go the same way at the end. */
  private popProps(t: number, where: THREE.Vector3[]) {
    const out = this.end - 0.45;
    this.once('in', 0, t, () => where.forEach((w) => this.bursts.add(0, 'poof', w, 1.1)));
    this.once('out', out, t, () => where.forEach((w) => this.bursts.add(out, 'poof', w, 1.1)));
    this.sfx('poof', 0, t);
    this.sfx('poof', out, t);
    const k = t < out ? Math.min(1, t / 0.28) : Math.max(0, 1 - (t - out) / 0.2);
    // A little overshoot as they land, each about its own spot.
    const s = t < out ? k * (1 + 0.18 * Math.sin(Math.min(1, t / 0.45) * Math.PI)) : k;
    for (const c of this.props.children) c.scale.setScalar(Math.max(0.001, s));
    this.props.visible = s > 0.002;
  }

  /**
   * Where the condemned is and how they look `t` seconds in (and everything else moved to match). `who` is their
   * animal, if it's here to be seen; `camera` turns sparkles to face it.
   */
  update(t: number, who: { root: THREE.Object3D } | null, camera?: THREE.Camera): ExecPose {
    this.camera = camera;
    if (who) this.who = who.root;
    this.group.updateMatrixWorld(true);
    this.at.set(0, this.P, 0);
    this.turn.copy(this.face(this.cam));
    this.stretch.set(1, 1, 1);
    let anim: Anim = 'cry';
    let visible = true;
    let tag = t < 0.3;
    this.frame.shake = 0;
    this.frame.low = 0;
    switch (this.method) {
      case 'squad':
        anim = this.squad(t);
        break;
      case 'guillotine':
        ({ anim, visible } = this.guillotine(t));
        break;
      case 'chair':
        anim = this.chair(t);
        break;
      case 'missile':
        anim = this.missile(t);
        break;
      case 'roast':
        anim = this.roast(t);
        break;
      case 'kaiju':
        anim = this.kaiju(t);
        break;
      case 'plane':
        ({ anim, visible } = this.plane(t));
        break;
      case 'pigeon':
        ({ anim, visible } = this.pigeon(t));
        break;
      case 'moon':
        ({ anim, visible } = this.moon(t));
        break;
    }
    if (this.survives && t > this.end - 1.6) tag = true;
    // The ghost: the body left where it lies (or the pieces, already cut), and the ghost floating up out of it.
    let ghost = false;
    if (t >= this.soulAt) {
      ghost = true;
      visible = true;
      tag = false;
      this.once('corpse', this.soulAt, t, () => this.leaveBody());
      const u = t - this.soulAt;
      this.sfx('soul', this.soulAt, t);
      this.sfx('twinkle', this.soulAt + SOUL.rise, t);
      this.once('sparkle', this.soulAt + SOUL.rise, t, () => this.bursts.add(this.soulAt + SOUL.rise, 'sparkle', this.world(this.soulTop()), 1.2));
      this.once('rise', this.soulAt, t, () => this.bursts.add(this.soulAt, 'poof', this.world(this.soulFrom()), 0.8));
      this.soulPose(u);
      anim = 'idle';
    }
    this.bursts.update(t, camera);
    for (const p of this.pieces) p.update();
    this.corpse?.update();
    const pos = this.world(this.at);
    const quat = this.group.quaternion.clone().multiply(this.turn);
    return { pos, quat, scale: this.stretch.clone(), anim, visible, tag, ghost };
  }

  /** The camera's framing for this moment. */
  framing(): ExecFrame {
    return this.frame;
  }

  // ---------------------------------------------------------------- the ghost

  /** Where the ghost starts from: the middle of whatever is left, near the floor. */
  private soulFrom(): THREE.Vector3 {
    return this.extraVec('soulFrom') ?? new THREE.Vector3(0, this.P, 0);
  }

  private soulTop(): THREE.Vector3 {
    return this.soulFrom().add(new THREE.Vector3(0, (2.6 + this.size().box.max.y * 0.5) * this.soulWay(), 0));
  }

  /** Up and away, as a rule; but from up on the moon, drifting down. */
  private soulWay(): number {
    return this.method === 'moon' ? -0.8 : 1;
  }

  private extraVec(key: string): THREE.Vector3 | null {
    return key + 'x' in this.extra ? new THREE.Vector3(this.extra[key + 'x'], this.extra[key + 'y'], this.extra[key + 'z']) : null;
  }

  private setExtraVec(key: string, v: THREE.Vector3) {
    this.extra[key + 'x'] = v.x;
    this.extra[key + 'y'] = v.y;
    this.extra[key + 'z'] = v.z;
  }

  /** Slowly up and away, swaying like a cartoon soul, looking out at everyone; then a twinkle and gone. */
  private soulPose(u: number) {
    const from = this.soulFrom();
    const rise = ease(u / SOUL.rise);
    const sway = Math.sin(u * 2.3) * 0.22 * Math.min(1, u / 0.8);
    this.at.copy(from).addScaledVector(this.left, sway).add(new THREE.Vector3(0, (2.6 + this.size().box.max.y * 0.5) * rise * this.soulWay(), 0));
    this.turn.copy(this.face(this.cam)).multiply(tmpQ.setFromAxisAngle(new THREE.Vector3(0, 0, 1), Math.sin(u * 2.3 + 0.6) * 0.12));
    const pop = Math.max(0, (u - SOUL.rise) / SOUL.pop);
    const s = pop > 0 ? Math.max(0.001, 1 - ease(pop)) * (1 + 0.25 * Math.sin(pop * Math.PI)) : 0.85 + 0.15 * Math.min(1, u / 0.5);
    this.stretch.setScalar(s);
  }

  /** What's left of them, baked where it lies, sooted as it is; their own coat goes back to how it was for the ghost. */
  private leaveBody() {
    // (Blown to bits, or gobbled up: nothing is left behind.)
    if (!this.who || this.pieces.length || this.method === 'plane' || this.method === 'pigeon' || this.method === 'moon') {
      if (this.who && this.tinted) tintAnimal(this.who, null);
      return;
    }
    const parts = bakeAnimal(this.who);
    const box = new THREE.Box3();
    for (const p of parts) {
      p.geometry.computeBoundingBox();
      box.union(p.geometry.boundingBox!);
    }
    const mid = box.getCenter(new THREE.Vector3());
    const turnAbout = this.extraVec('pivot');
    const pivot = turnAbout ? this.world(turnAbout) : new THREE.Vector3(mid.x, box.min.y, mid.z);
    const frazzled = this.method === 'chair' || this.method === 'missile' || this.method === 'kaiju';
    this.corpse = new BakedPiece(parts, pivot, { frazzle: frazzled ? 0.045 : 0 });
    freeBake(parts);
    this.fx.add(this.corpse.group);
    if (this.tinted) tintAnimal(this.who, null);
    this.tinted = false;
  }

  /** Darkens the live animal's coat (soot, a toasting), or puts it back. */
  private tint(color: string, k: number) {
    if (!this.who) return;
    tintAnimal(this.who, new THREE.Color(color), k);
    this.tinted = true;
  }

  // ---------------------------------------------------------------- the firing squad

  private squad(t: number): Anim {
    // Between the camera and the gallows, off to the left: their backs to us, muskets at the condemned.
    const squadDir = this.cam.clone().multiplyScalar(0.8).addScaledVector(this.left, 0.6).normalize();
    const centre = squadDir.clone().multiplyScalar(3.1);
    this.frame.look = this.world(centre.clone().multiplyScalar(0.4).setY(this.P + 0.5));
    this.frame.radius = 3.4;
    // Side by side across the screen, each turned to the condemned.
    const across = this.left.clone();
    if (!this.soldiers.length) {
      for (let i = 0; i < 4; i++) {
        const s = soldier(i);
        const at = centre.clone().addScaledVector(across, (i - 1.5) * 0.72).addScaledVector(this.cam, Math.abs(i - 1.5) * 0.1);
        s.group.position.copy(at);
        s.group.rotation.y = Math.atan2(-at.x, -at.z);
        this.props.add(s.group);
        this.soldiers.push(s);
        this.disposers.push(s.dispose);
      }
    }
    this.popProps(t, [this.world(centre)]);
    const fire = 2.7;
    this.sfx('drumroll', 0.4, t);
    this.sfx('ready', 1.0, t);
    this.sfx('aim', 1.8, t);
    // Ready (muskets up and forward), aim (levelled), fire.
    const lift = span(t, 1.0, 1.3) * 0.45 + span(t, 1.8, 2.1) * (Math.PI / 2 - 0.45 - 0.08);
    const lower = this.survives ? span(t, 3.9, 4.4) : span(t, 4.0, 4.6);
    this.soldiers.forEach((s, i) => {
      const kick = t > fire ? Math.exp(-(t - fire) * 9) * 0.25 : 0;
      s.arm.rotation.x = Math.max(0, lift * (1 - lower) - kick);
      // A little march on the spot as they arrive, a jolt as they fire.
      s.group.position.y = t < 0.8 ? Math.abs(Math.sin(t * 14 + i)) * 0.04 * (1 - t / 0.8) : 0;
      // Puzzled, after the flags.
      s.group.rotation.z = this.survives ? Math.sin(i * 2.1 + 1) * 0.12 * span(t, 3.5, 3.9) * (1 - span(t, 5.0, 5.4)) : 0;
      const f = this.survives ? easeOut((t - fire - i * 0.05) / 0.25) : 0;
      s.flag.scale.setScalar(Math.max(0.001, f * (1 + 0.3 * Math.sin(Math.min(1, (t - fire) / 0.5) * Math.PI))));
      this.once(`fire${i}`, fire + i * 0.05, t, () => {
        const muzzle = s.muzzle.getWorldPosition(new THREE.Vector3());
        const ahead = this.world(new THREE.Vector3(0, this.P + 0.7, 0)).sub(muzzle).normalize();
        if (this.survives) this.bursts.add(fire + i * 0.05, 'sparkle', muzzle, 0.6);
        else {
          this.bursts.add(fire + i * 0.05, 'flash', muzzle, 0.5);
          this.bursts.add(fire + i * 0.05, 'smoke', muzzle, 0.9, ahead.multiplyScalar(0.5));
        }
      });
    });
    this.sfx(this.survives ? 'flags' : 'volley', fire, t);
    // The condemned stands facing them, trembling.
    const toSquad = centre.clone().normalize();
    this.turn.copy(this.face(toSquad.clone().lerp(this.cam, 0.35)));
    const body = this.size().box;
    if (this.survives) {
      // A flinch at the flags, a peek, and a cheer.
      const flinch = span(t, fire, fire + 0.12) * (1 - span(t, fire + 0.9, fire + 1.2));
      this.stretch.set(1 + flinch * 0.06, 1 - flinch * 0.12, 1 + flinch * 0.06);
      return t > fire + 1.3 ? 'cheer' : t > fire ? 'idle' : 'cry';
    }
    const hit = t - fire - 0.05;
    if (hit > 0) {
      // Hit: a jolt and shudder, soot all over, then stiff as a board, over backwards onto the boards.
      this.once('hit', fire + 0.05, t, () => this.bursts.add(fire + 0.05, 'soot', this.world(new THREE.Vector3(0, this.P + body.max.y * 0.55, 0)), 0.9));
      this.tint('#2a2420', span(hit, 0, 0.18) * 0.85);
      const shudder = Math.exp(-hit * 4) * Math.sin(hit * 60) * 0.05 * (hit < 0.6 ? 1 : 0);
      const fall = hit > 0.5 ? Math.min(1, ((hit - 0.5) / 0.42) ** 2) : 0;
      const bounce = hit > 0.92 ? Math.exp(-(hit - 0.92) * 8) * Math.sin((hit - 0.92) * 22) * 0.08 : 0;
      const tip = (Math.PI / 2 - 0.04) * fall - Math.abs(bounce);
      // Over sideways, stiff as a board, across the screen (away from the squad's side).
      const back = this.left.clone().negate();
      const axis = new THREE.Vector3(-back.z, 0, back.x);
      const heel = new THREE.Vector3(0, this.P, 0).addScaledVector(back, Math.max(0.05, body.max.x * 0.8));
      tmpQ.setFromAxisAngle(axis, -tip);
      this.turn.premultiply(tmpQ);
      this.at.sub(heel).applyQuaternion(tmpQ).add(heel);
      this.at.addScaledVector(this.left, shudder);
      if (fall >= 1) this.once('thud', fire + 0.05 + 0.92, t, () => this.bursts.add(t, 'dust', this.world(heel.clone().addScaledVector(back, body.max.y * 0.6)), 0.6));
      this.sfx('thud', fire + 0.05 + 0.92, t);
      // The ghost rises from the middle of where they lie.
      this.setExtraVec('soulFrom', new THREE.Vector3(0, this.P, 0).addScaledVector(back, body.max.y * 0.5));
      return 'idle';
    }
    return 'cry';
  }

  // ---------------------------------------------------------------- the guillotine

  private guillotine(t: number): { anim: Anim; visible: boolean } {
    const b = this.size();
    // The body lies along F, head first through the hole, seen three-quarters on.
    const F = this.left.clone().multiplyScalar(0.8).addScaledVector(this.cam, 0.6).normalize();
    if (!this.blade) {
      const d = b.head.clone().sub(b.neck);
      if (d.lengthSq() < 1e-4) d.set(0, 1, 0);
      d.normalize();
      // Face down into the basket, turned a little towards the camera; long animals keep their backs up.
      const second = Math.abs(d.z) < 0.7 ? new THREE.Vector3(0, 0, 1) : new THREE.Vector3(0, -1, 0);
      const down = new THREE.Vector3(0, -1, 0).addScaledVector(this.cam, 0.55).normalize();
      this.lay.copy(basis(d, second, F, down));
      // How far below the neck the lowest part of them lies, laid down like that.
      let low = 0;
      let back = 0;
      const corner = new THREE.Vector3();
      for (let i = 0; i < 8; i++) {
        corner.set(i & 1 ? b.box.max.x : b.box.min.x, i & 2 ? b.box.max.y : b.box.min.y, i & 4 ? b.box.max.z : b.box.min.z).sub(b.neck).applyQuaternion(this.lay);
        low = Math.min(low, corner.y);
        back = Math.max(back, -corner.dot(F));
      }
      const headR = Math.max(0.12, Math.min(0.32, b.head.distanceTo(b.neck) * 0.9));
      const hole = Math.max(0.09, Math.min(0.24, headR * 0.6));
      const lunette = Math.max(0.55, 0.3 - low);
      this.blade = guillotine({ lunette, hole, bench: lunette + low, benchLen: Math.max(0.5, back + 0.1), basket: Math.max(0.22, headR * 1.25) });
      this.blade.group.quaternion.copy(basis(new THREE.Vector3(0, 0, 1), UP, F, UP));
      this.blade.group.position.set(0, this.P, 0).addScaledVector(F, Math.min(0.35, back * 0.3));
      this.props.add(this.blade.group);
      this.disposers.push(this.blade.dispose);
      this.layAt.copy(this.blade.group.position).add(new THREE.Vector3(0, lunette, 0));
      this.extra.hole = hole;
      this.extra.lunette = lunette;
    }
    const g = this.blade;
    this.popProps(t, [this.world(this.layAt)]);
    // Lying in place, the neck in the hole.
    const neckW = this.layAt.clone();
    const placeLying = () => {
      this.turn.copy(this.lay);
      this.at.copy(neckW).sub(b.neck.clone().applyQuaternion(this.lay));
    };
    placeLying();
    const drop = 1.9;
    const cut = 2.06;
    this.sfx('drumroll', 0.35, t);
    const top = g.top;
    const low = this.extra.lunette - this.extra.hole * 0.7;
    const rattle = t > 1.55 && t < drop ? Math.sin(t * 70) * 0.006 : 0;
    g.blade.position.x = rattle;
    if (this.survives) {
      // It jams on the way down with a clunk and a wobble... and drops (onto nothing) once they're clear.
      const jam = this.extra.lunette + 0.45;
      let y = top;
      if (t > drop) y = Math.max(jam, top - 4.9 * (t - drop) ** 2 * 3);
      const stuck = t - (drop + Math.sqrt((top - jam) / (4.9 * 3)));
      if (stuck > 0) y = jam + Math.exp(-stuck * 6) * Math.sin(stuck * 30) * 0.03;
      const late = 4.4;
      if (t > late) y = Math.max(low, jam - 4.9 * (t - late) ** 2 * 3);
      g.blade.position.y = y;
      g.blade.rotation.z = stuck > 0 && t < late ? Math.exp(-stuck * 5) * Math.sin(stuck * 24) * 0.05 : 0;
      this.sfx('blade', drop, t);
      this.sfx('jam', drop + 0.12, t);
      this.sfx('chop', late + 0.2, t);
      this.once('dust', drop + 0.12, t, () => this.bursts.add(drop + 0.12, 'dust', this.world(this.layAt.clone().add(new THREE.Vector3(0, 0.5, 0))), 0.4));
      // Out of the stocks and up on their feet beside it, then a cheer.
      const out = span(t, 3.0, 3.5);
      if (out > 0) {
        const stand = this.layAt.clone().setY(this.P).addScaledVector(this.cam, 0.85).addScaledVector(this.left, -0.3);
        const from = this.at.clone();
        this.at.lerpVectors(from, stand, out);
        this.at.y += Math.sin(out * Math.PI) * 0.35;
        this.turn.slerp(this.face(this.cam), out);
      }
      return { anim: t > 3.6 ? 'cheer' : 'cry', visible: true };
    }
    // The drop, the chop, the head into the basket.
    g.blade.position.y = t < drop ? top : Math.max(low, top - 4.9 * 3 * (t - drop) ** 2);
    this.sfx('blade', drop, t);
    this.sfx('chop', cut, t);
    this.once('cut', cut, t, () => this.cut(F, neckW));
    if (t < cut) return { anim: 'cry', visible: true };
    const [body, head] = this.pieces;
    const u = t - cut;
    if (head) {
      // Off it pops, a tumble into the basket, a bump and a bounce, and dizzy stars.
      const start = neckW.clone().addScaledVector(F, 0.04);
      const rest = g.group.position.clone().add(g.basketAt.clone().applyQuaternion(g.group.quaternion)).setY(this.P + g.basketDepth * 0.45);
      const fallFor = 0.42;
      const k = Math.min(1, u / fallFor);
      const p = start.clone().lerp(rest, k);
      p.y = start.y + (rest.y - start.y) * k * k + Math.sin(k * Math.PI) * 0.12;
      const land = u - fallFor;
      if (land > 0) p.y = rest.y + Math.abs(Math.sin(land * 14)) * Math.exp(-land * 7) * 0.12;
      head.group.position.copy(p);
      // From lying face-down to sitting up in the basket, looking out at the camera.
      const sitUp = basis(F, new THREE.Vector3(0, -1, 0).addScaledVector(this.cam, 0.55), UP, this.cam);
      const e = ease(k);
      head.group.quaternion.identity().slerp(sitUp, e).premultiply(tmpQ.setFromAxisAngle(new THREE.Vector3(-F.z, 0, F.x), e * Math.PI * 2));
      if (land > 0) this.once('bonk', cut + fallFor, t, () => this.bursts.add(cut + fallFor, 'dust', this.world(rest), 0.35));
      this.sfx('boing', cut + fallFor, t);
      if (!this.dizzy) {
        this.dizzy = new Dizzy(4);
        this.fx.add(this.dizzy.group);
      }
      const hb = this.extra.headTop ?? 0.25;
      this.dizzy.update(t, land > 0.1 && t < this.soulAt ? this.world(p.clone().add(new THREE.Vector3(0, hb + 0.08, 0))) : null, 0.16, this.camera);
    }
    if (body) {
      // A last little quiver.
      body.group.rotation.set(0, 0, Math.exp(-u * 5) * Math.sin(u * 40) * 0.015);
    }
    this.setExtraVec('soulFrom', neckW.clone().addScaledVector(F, -0.2).setY(this.layAt.y - 0.2));
    return { anim: 'idle', visible: false };
  }

  /** The chop: the animal baked as it lies, cut at the neck into two pieces that go their own ways. */
  private cut(F: THREE.Vector3, neckW: THREE.Vector3) {
    if (!this.who) return;
    const parts = bakeAnimal(this.who);
    // Into the stage's frame: the pieces live in its group.
    const toLocal = this.group.matrixWorld.clone().invert();
    for (const p of parts) p.geometry.applyMatrix4(toLocal);
    const at = neckW.clone().addScaledVector(F, 0.03);
    const body = new BakedPiece(parts, at, { keep: F.clone().negate() });
    const head = new BakedPiece(parts, at, { keep: F.clone() });
    freeBake(parts);
    // The planes are kept in the world: the pieces' groups are inside the stage's.
    this.group.add(body.group, head.group);
    this.pieces.push(body, head);
    // How far the head reaches above its cut, once sitting up (for the stars).
    this.extra.headTop = this.size().head.distanceTo(this.size().neck) * 1.6 + 0.05;
    this.bursts.add(2.06, 'poof', this.world(at), 0.35);
  }

  // ---------------------------------------------------------------- the electric chair

  private chair(t: number): Anim {
    const b = this.size();
    const faceDir = this.cam.clone().applyAxisAngle(UP, 0.45);
    if (!this.seat) {
      const half = Math.max(0.24, Math.max(-b.box.min.x, b.box.max.x) * 0.9);
      this.seat = chair({ seat: 0.45, head: 0.45 + b.box.max.y * 0.85, half });
      this.seat.group.quaternion.copy(this.face(faceDir));
      this.seat.group.position.set(0, this.P, 0).addScaledVector(faceDir, -0.05);
      this.props.add(this.seat.group);
      this.disposers.push(this.seat.dispose);
      this.bolts = new Bolts(36);
      this.fx.add(this.bolts.group);
      this.extra.capTop = this.P + 0.45 + b.box.max.y * 0.95;
    }
    const c = this.seat;
    this.popProps(t, [this.world(new THREE.Vector3(0, this.P + 0.6, 0))]);
    // Sat in the chair.
    this.turn.copy(this.face(faceDir));
    this.at.set(0, this.P + 0.45, 0);
    // Once sat, measure where the top of the head is, for the cap.
    if (this.who && t > 0.35 && !('headY' in this.extra)) {
      const box = new THREE.Box3().setFromObject(this.who, true);
      this.extra.headY = box.max.y - this.P;
    }
    const headY = this.extra.headY ?? 0.45 + b.box.max.y * 0.8;
    const hang = c.wire.position.y;
    const capLow = Math.max(0.6, headY - 0.06);
    const on = 1.6;
    const off = this.survives ? 2.0 : 3.6;
    const capUp = this.survives ? span(t, 2.6, 3.0) : 0;
    const capY = hang - 0.25 + (capLow - hang + 0.25) * span(t, 0.4, 1.0) * (1 - capUp);
    c.cap.position.set(0, capY, 0.03);
    c.wire.scale.y = Math.max(0.01, hang - capY - 0.12);
    c.lever.rotation.z = span(t, on - 0.12, on) * -2.2;
    this.sfx('drumroll', 0.5, t);
    this.sfx('clunk', on, t);
    const zap = t > on + 0.05 && t < off;
    // The bulb: a glow, then flickering with the power, then dark.
    c.bulb.emissiveIntensity = t < on ? 0.3 : zap ? (this.survives ? 0.4 + hash(Math.floor(t * 20)) * 1.2 : 0.8 + hash(Math.floor(t * 24)) * 2) : 0.02;
    const head = this.world(new THREE.Vector3(0, capY + 0.05, 0.03));
    if (this.survives) {
      // A fizzle, a few feeble sparks from the socket, and the lights go out.
      this.sfx('fizzle', on + 0.05, t);
      this.sfx('wahwah', 2.4, t);
      this.once('pfft', on + 0.1, t, () => this.bursts.add(on + 0.1, 'sparks', this.world(c.group.position.clone().add(c.socket.clone().applyQuaternion(c.group.quaternion))), 0.4));
      this.once('pfft2', on + 0.4, t, () => this.bursts.add(on + 0.4, 'smoke', this.world(c.group.position.clone().add(c.socket.clone().applyQuaternion(c.group.quaternion))), 0.5));
      const jolt = span(t, on + 0.05, on + 0.15) * (1 - span(t, on + 0.3, on + 0.5));
      this.stretch.set(1, 1 + jolt * 0.08, 1);
      this.bolts?.update(t, [], 0);
      // Up out of the chair, and a cheer.
      const up = span(t, 3.1, 3.5);
      if (up > 0) {
        const stand = new THREE.Vector3(0, this.P, 0).addScaledVector(faceDir, 0.7);
        this.at.lerp(stand, up);
        this.at.y += Math.sin(up * Math.PI) * 0.3;
      }
      return t > 3.6 ? 'cheer' : up > 0 ? 'idle' : 'sit';
    }
    // The power: crackling bolts all over, a fierce shake, flashing white and black, and soot.
    this.sfx('buzz', on + 0.05, t);
    const body = this.world(new THREE.Vector3(0, this.P + 0.45 + b.box.max.y * 0.4, 0));
    const paths: [THREE.Vector3, THREE.Vector3][] = [];
    if (zap) {
      const r = Math.max(0.25, b.box.max.x);
      for (let k = 0; k < 5; k++) {
        const a = (k / 5) * Math.PI * 2 + t * 3;
        paths.push([head, body.clone().add(new THREE.Vector3(Math.cos(a) * r, (hash(k, 4) - 0.5) * 0.4, Math.sin(a) * r))]);
      }
      paths.push([this.world(c.group.position.clone().add(c.socket.clone().applyQuaternion(c.group.quaternion))), head]);
    }
    this.bolts?.update(t, paths, zap ? 1 : 0, 0.07);
    if (zap) {
      const shake = 0.035;
      this.at.add(new THREE.Vector3((hash(Math.floor(t * 40), 1) - 0.5) * shake, (hash(Math.floor(t * 40), 2) - 0.5) * shake, (hash(Math.floor(t * 40), 3) - 0.5) * shake));
      this.turn.multiply(tmpQ.setFromAxisAngle(new THREE.Vector3(0, 0, 1), (hash(Math.floor(t * 30), 5) - 0.5) * 0.25));
      const flash = Math.floor(t * 12) % 2 === 0;
      const soot = span(t, on, off) * 0.9;
      this.tint(flash ? '#fff8d8' : '#1a1416', flash ? 0.55 * (1 - soot) : Math.max(soot, 0.6));
      this.stretch.set(1 + Math.sin(t * 50) * 0.03, 1 + Math.cos(t * 47) * 0.04, 1);
      for (let k = 0; k < 6; k++) {
        const at = on + 0.15 + k * 0.32;
        this.once(`spark${k}`, at, t, () => this.bursts.add(at, 'sparks', head, 0.7));
      }
    }
    if (t >= off) {
      // Slumped, smoking gently, charred black with white eyes.
      this.tint('#1a1416', 0.9);
      const slump = span(t, off, off + 0.35);
      this.turn.multiply(tmpQ.setFromAxisAngle(new THREE.Vector3(1, 0, 0), slump * 0.3));
      this.turn.multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), slump * 0.12));
      this.sfx('sizzle', off, t);
      for (let k = 0; k < 3; k++) {
        const at = off + k * 0.35;
        this.once(`smoke${k}`, at, t, () => this.bursts.add(at, k ? 'smoke' : 'soot', head, 0.8));
      }
    }
    this.setExtraVec('soulFrom', new THREE.Vector3(0, this.P + 0.3, 0));
    return 'sit';
  }

  // ---------------------------------------------------------------- the missile

  private missile(t: number): Anim {
    const b = this.size();
    const side = this.left.clone().multiplyScalar(3.4).addScaledVector(this.cam, 1.3);
    if (!this.rocket) {
      this.rocket = launcher();
      this.rocket.group.position.copy(side);
      const toThem = side.clone().negate().normalize();
      this.rocket.group.rotation.y = Math.atan2(toThem.x, toThem.z);
      this.props.add(this.rocket.group);
      this.disposers.push(this.rocket.dispose);
    }
    const L = this.rocket;
    this.popProps(t, [this.world(side.clone().setY(0.5)), this.world(new THREE.Vector3(0, this.P + 0.4, 0))]);
    const lit = 0.5;
    const go = 1.7;
    const hitAt = 3.3;
    const target = new THREE.Vector3(0, this.P + Math.min(0.6, b.box.max.y * 0.5), 0);
    if (this.survives) target.set(0, this.P, 0).addScaledVector(this.left, -0.55).addScaledVector(this.cam, 0.25);
    // The rocket's path: up off the rail in a great arc, and down onto them.
    const restW = L.group.localToWorld(L.rest.clone());
    const startL = this.group.worldToLocal(restW.clone());
    const aimL = L.aim.clone().applyQuaternion(L.group.quaternion);
    const p0 = startL;
    const p1 = startL.clone().addScaledVector(aimL, 7);
    const p2 = target.clone().add(new THREE.Vector3(0, 13, 0));
    const p3 = target;
    const bez = (k: number) => {
      const a = 1 - k;
      return p0.clone().multiplyScalar(a * a * a).addScaledVector(p1, 3 * a * a * k).addScaledVector(p2, 3 * a * k * k).addScaledVector(p3, k * k * k);
    };
    const along = (k: number) => k * k * (1.6 - 0.6 * k);
    L.spark.visible = t > lit && t < go;
    L.spark.position.set(0, -0.14 + Math.min(1, (t - lit) / (go - lit)) * 0.12, -0.7 + Math.min(1, (t - lit) / (go - lit)) * 0.06);
    L.spark.scale.setScalar(0.8 + hash(Math.floor(t * 30)) * 0.6);
    this.sfx('fuse', lit, t);
    this.sfx('launch', go, t);
    this.sfx('whistle', 2.45, t);
    if (t >= go) {
      const k = Math.min(1, (t - go) / (hitAt - go));
      const at = bez(along(k));
      const ahead = bez(Math.min(1, along(k) + 0.01));
      L.rocket.position.copy(L.group.worldToLocal(this.world(at)));
      L.rocket.lookAt(this.world(ahead));
      for (let n = 0; n < 22; n++) {
        const when = go + n * 0.07;
        if (when > hitAt - 0.05) break;
        this.once(`trail${n}`, when, t, () => this.bursts.add(when, 'smoke', this.world(bez(along((when - go) / (hitAt - go)))), 0.55));
      }
      this.once('blastoff', go, t, () => this.bursts.add(go, 'smoke', restW, 1.3));
      // The cart rocks back as it goes.
      L.group.rotation.x = -Math.exp(-(t - go) * 6) * Math.sin((t - go) * 18) * 0.06;
    }
    L.rocket.visible = !(t >= hitAt && !this.survives);
    this.turn.copy(this.face(side.clone().normalize().lerp(this.cam, 0.6)));
    if (this.survives) {
      // Down it comes, nose into the boards beside them, a wobble... a fizzle... DUD.
      if (t >= hitAt) {
        const stuck = t - hitAt;
        L.rocket.position.copy(L.group.worldToLocal(this.world(target.clone().add(new THREE.Vector3(0, 0.5, 0)))));
        const down = new THREE.Vector3(0, -1, 0).addScaledVector(this.cam, 0.3).normalize().applyQuaternion(this.group.quaternion);
        L.rocket.lookAt(L.rocket.getWorldPosition(new THREE.Vector3()).add(down));
        L.rocket.rotateY(Math.exp(-stuck * 4) * Math.sin(stuck * 26) * 0.18);
        const flag = easeOut((t - 4.2) / 0.3);
        L.dud.position.set(0, 0, -0.55);
        L.dud.rotation.set(-Math.PI / 2, 0, 0);
        L.dud.scale.setScalar(Math.max(0.001, flag * (1 + 0.3 * Math.sin(Math.min(1, (t - 4.2) / 0.5) * Math.PI))));
        this.sfx('thunk', hitAt, t);
        this.sfx('boing', hitAt + 0.05, t);
        this.sfx('fizzle', 3.8, t);
        this.sfx('squeak', 4.2, t);
        this.once('dudpuff', 3.8, t, () => this.bursts.add(3.8, 'smoke', this.world(target.clone().add(new THREE.Vector3(0, 1.0, 0))), 0.5));
        this.once('splinters', hitAt, t, () => this.bursts.add(hitAt, 'dust', this.world(target), 0.5));
      }
      const cower = span(t, 2.5, 2.8) * (1 - span(t, 4.4, 4.7));
      this.stretch.set(1 + cower * 0.06, 1 - cower * 0.15, 1 + cower * 0.06);
      return t > 4.7 ? 'cheer' : t > 2.5 ? 'cry' : 'idle';
    }
    if (t < hitAt) return t > 2.5 ? 'cry' : 'idle';
    // BOOM: a flash, a fireball and a cloud of soot; up they go, spinning, and down they come, flat and frazzled.
    this.sfx('boom', hitAt, t);
    this.once('boom', hitAt, t, () => {
      const at = this.world(target);
      this.bursts.add(hitAt, 'flash', at, 2.2);
      this.bursts.add(hitAt, 'fire', at, 1.0);
      this.bursts.add(hitAt + 0.15, 'soot', at, 1.4);
      this.bursts.add(hitAt + 0.05, 'dust', this.world(new THREE.Vector3(0, this.P, 0)), 1.1);
    });
    const u = t - hitAt;
    this.frame.shake = Math.exp(-u * 3) * 0.6;
    this.tint('#1a1416', 0.92);
    const flight = 1.3;
    // Lying flat on their back at the end, along the screen, the middle of them where they stood.
    const across = this.cam.clone().applyAxisAngle(UP, Math.PI / 2);
    const lie = basis(UP, new THREE.Vector3(0, 0, 1), across, UP);
    const mid = new THREE.Vector3(0, b.box.max.y * 0.5, 0);
    const startC = new THREE.Vector3(0, this.P, 0).add(mid);
    const endC = new THREE.Vector3(0, this.P + Math.max(0.08, -b.box.min.z), 0).addScaledVector(this.left, -0.2);
    const k = Math.min(1, u / flight);
    const e = ease(k);
    // A cartwheel across the screen on the way up and down.
    this.turn.copy(this.face(this.cam)).slerp(lie, e).premultiply(tmpQ.setFromAxisAngle(this.cam, e * Math.PI * 2));
    const centre = startC.clone().lerp(endC, k);
    centre.y += 3.6 * 4 * k * (1 - k);
    const landed = u - flight;
    if (landed > 0) centre.y += Math.abs(Math.sin(landed * 16)) * Math.exp(-landed * 8) * 0.15;
    this.at.copy(centre).sub(mid.clone().applyQuaternion(this.turn));
    if (landed > 0) {
      this.sfx('thud', hitAt + flight, t);
      this.once('land', hitAt + flight, t, () => this.bursts.add(hitAt + flight, 'dust', this.world(endC.clone().setY(this.P)), 0.7));
    }
    for (let n = 0; n < 3; n++) {
      const when = hitAt + flight + 0.25 + n * 0.4;
      this.once(`wisp${n}`, when, t, () => this.bursts.add(when, 'smoke', this.world(new THREE.Vector3(0, this.P + 0.2, 0).addScaledVector(this.left, -0.2)), 0.6));
    }
    this.setExtraVec('soulFrom', new THREE.Vector3(0, this.P, 0).addScaledVector(this.left, -0.2));
    return 'idle';
  }

  // ---------------------------------------------------------------- the spit roast

  private roast(t: number): Anim {
    const b = this.size();
    // The spit runs across the screen; they lie along it, head to one end, turning over the fire.
    const A = this.left.clone();
    const radius = Math.max(0.2, Math.max(-b.box.min.x, b.box.max.x, -b.box.min.z, b.box.max.z));
    const len = Math.max(0.6, b.box.max.y - b.box.min.y);
    const spitY = 0.62 + radius;
    if (!this.spit) {
      this.spit = roast(spitY, len);
      this.spit.group.quaternion.copy(basis(new THREE.Vector3(1, 0, 0), UP, A, UP));
      this.spit.group.position.set(0, this.P, 0);
      this.props.add(this.spit.group);
      this.flames = new Flames(0.9, 11);
      this.flames.group.position.set(0, this.P + 0.08, 0);
      this.props.add(this.flames.group);
      this.disposers.push(this.spit.dispose);
      // And an apple in the mouth, of course.
      const ab = new Builder();
      ab.add(G.sphere(12, 10), '#d8402f', { scale: [0.075, 0.07, 0.075] });
      ab.add(G.cyl(5), '#5a3d2a', { pos: [0, 0.075, 0], scale: [0.008, 0.04, 0.008] });
      ab.add(G.sphere(6, 4), '#6fbf5a', { pos: [0.025, 0.085, 0], rot: [0, 0, -0.6], scale: [0.03, 0.012, 0.018] });
      this.apple = ab.mesh(matte(), { cast: false });
      this.group.add(this.apple);
    }
    const R = this.spit;
    this.popProps(t, [this.world(new THREE.Vector3(0, this.P + spitY, 0))]);
    const stop = this.survives ? 2.8 : 4.6;
    // The turning: quicker and quicker, then easing off.
    const turnAt = (x: number) => {
      const s = Math.min(x, stop);
      return 0.6 * s + 0.22 * s * s + (x > stop ? (0.6 + 0.44 * stop) * 0.4 * (1 - Math.exp(-(x - stop) * 2.5)) : 0);
    };
    const phi = this.survives ? turnAt(t) : turnAt(t);
    R.spit.rotation.x = phi;
    // Laid along the spit, face up to start with, middle on the spit.
    const mid = b.box.getCenter(new THREE.Vector3());
    const lay = basis(UP, new THREE.Vector3(0, 0, 1), A, UP);
    const spin = new THREE.Quaternion().setFromAxisAngle(A, phi);
    this.turn.copy(spin).multiply(lay);
    const centre = new THREE.Vector3(0, this.P + spitY, 0);
    this.at.copy(centre).sub(mid.clone().applyQuaternion(this.turn));
    if (this.apple) {
      this.apple.position.copy(b.mouth).add(new THREE.Vector3(0, 0, 0.03)).applyQuaternion(this.turn).add(this.at);
      this.apple.quaternion.copy(this.turn);
      const s = Math.min(1, t / 0.28) * (this.survives ? 1 - span(t, 3.25, 3.35) : 1);
      this.apple.scale.setScalar(Math.max(0.001, s * (t < this.end - 0.45 ? 1 : 0)));
    }
    this.sfx('crackle', 0.2, t);
    let size = span(t, 0.1, 1.0);
    if (this.survives) {
      // A little rain cloud, and the fire goes out in a hiss of steam.
      if (!this.cloud) {
        this.cloud = rainCloud();
        this.group.add(this.cloud.group);
        this.disposers.push(this.cloud.dispose);
      }
      const C = this.cloud;
      const inAt = 1.6;
      const gone = 4.0;
      const cs = t < inAt ? 0.001 : t < gone ? easeOut((t - inAt) / 0.3) : Math.max(0.001, 1 - (t - gone) / 0.25);
      C.group.scale.setScalar(cs * 1.5);
      C.group.position.set(0, this.P + spitY + radius + 1.0 + Math.sin(t * 2) * 0.04, 0);
      this.once('cloud', inAt, t, () => this.bursts.add(inAt, 'poof', this.world(C.group.position), 0.8));
      this.sfx('poof', inAt, t);
      this.sfx('rain', 1.8, t);
      this.sfx('hiss', 2.2, t);
      const m = new THREE.Matrix4();
      const raining = t > 1.8 && t < gone;
      for (let i = 0; i < 24; i++) {
        const fall = ((t * 3 + hash(i, 7)) % 1) * (spitY + radius + 0.9);
        m.makeTranslation((hash(i, 1) - 0.5) * 0.9, -0.1 - fall / 1.5, (hash(i, 2) - 0.5) * 0.35);
        C.drops.setMatrixAt(i, raining ? m : m.makeScale(0, 0, 0));
      }
      C.drops.instanceMatrix.needsUpdate = true;
      size *= 1 - span(t, 2.0, 2.7);
      for (let k = 0; k < 4; k++) {
        const at = 2.1 + k * 0.25;
        this.once(`steam${k}`, at, t, () => this.bursts.add(at, 'steam', this.world(new THREE.Vector3((hash(k) - 0.5) * 0.6, this.P + 0.3, 0)), 1.0));
      }
      this.tint('#9a5a2e', span(t, 0.6, 2.0) * 0.3 * (1 - span(t, 3.2, 4.0)));
      // The ropes give, and down they hop, and a cheer.
      const off = span(t, 3.3, 3.75);
      if (off > 0) {
        const stand = new THREE.Vector3(0, this.P, 0).addScaledVector(this.cam, 0.9);
        this.at.lerp(stand, off);
        this.at.y += Math.sin(off * Math.PI) * 0.4;
        this.turn.slerp(this.face(this.cam), off);
      }
      this.sfx('pop', 3.3, t);
      this.flames?.update(t, size);
      return t > 3.9 ? 'cheer' : t > 3.3 ? 'idle' : 'cry';
    }
    // Browning nicely, then rather too much: a ding, a puff of black smoke, and the fire burns low.
    this.tint(t < 3.0 ? '#9a5a2e' : '#3a2418', t < 3.0 ? span(t, 0.6, 3.0) * 0.7 : 0.7 + span(t, 3.0, 4.2) * 0.25);
    size *= 1 - span(t, 4.2, 4.8) * 0.6;
    this.flames?.update(t, size);
    for (let k = 0; k < 6; k++) {
      const at = 1.2 + k * 0.5;
      this.once(`wisp${k}`, at, t, () => this.bursts.add(at, 'smoke', this.world(centre.clone().add(new THREE.Vector3(0, radius * 0.8, 0))), 0.6));
    }
    this.sfx('sizzle', 1.6, t);
    this.sfx('ding', 4.1, t);
    this.once('done', 4.1, t, () => this.bursts.add(4.1, 'soot', this.world(centre), 1.0));
    this.setExtraVec('soulFrom', centre.clone().add(new THREE.Vector3(0, -radius * 0.5, 0)));
    // What's left keeps turning on the spit once the ghost is away, gently.
    this.setExtraVec('pivot', centre);
    this.once('pivot', this.soulAt, t, () => (this.extra.spitPhi = phi));
    if (this.corpse) {
      const ang = phi - (this.extra.spitPhi ?? phi);
      this.corpse.group.quaternion.setFromAxisAngle(A.clone().applyQuaternion(this.group.quaternion), ang);
    }
    return t > 1.5 ? 'idle' : 'cry';
  }

  // ---------------------------------------------------------------- the kaiju

  private kaiju(t: number): Anim {
    const b = this.size();
    const home = this.cam.clone().multiplyScalar(-7.5).addScaledVector(this.left, 2.4);
    if (!this.beast) {
      this.beast = kaiju();
      this.beast.group.scale.setScalar(1.25);
      this.beast.group.position.copy(home);
      const toThem = home.clone().negate().normalize();
      this.beast.group.rotation.y = Math.atan2(toThem.x, toThem.z);
      this.group.add(this.beast.group);
      this.disposers.push(this.beast.dispose);
      // Cracks in the cobbles where it comes up.
      const s = new THREE.Shape();
      for (let i = 0; i < 18; i++) {
        const a = (i / 18) * Math.PI * 2;
        const r = (i % 2 ? 1.6 : 3.2) * (0.7 + hash(i, 3) * 0.5);
        if (i) s.lineTo(Math.cos(a) * r, Math.sin(a) * r);
        else s.moveTo(Math.cos(a) * r, Math.sin(a) * r);
      }
      this.crack = new THREE.Mesh(new THREE.ShapeGeometry(s), new THREE.MeshBasicMaterial({ color: '#2a2622', transparent: true, opacity: 0, depthWrite: false }));
      this.crack.rotation.x = -Math.PI / 2;
      this.crack.position.copy(home).setY(0.09);
      this.crack.renderOrder = 1;
      this.group.add(this.crack);
      this.beam = new THREE.Group();
      const core = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 1, 14, 1, true).translate(0, 0.5, 0).rotateX(Math.PI / 2), new THREE.MeshBasicMaterial({ color: '#e8fbff', transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
      const glow = new THREE.Mesh(core.geometry, new THREE.MeshBasicMaterial({ color: '#48c8ff', transparent: true, opacity: 0.45, depthWrite: false, blending: THREE.AdditiveBlending }));
      core.name = 'core';
      glow.name = 'glow';
      this.beam.add(core, glow);
      this.beam.visible = false;
      this.group.add(this.beam);
      this.disposers.push(() => {
        this.crack?.geometry.dispose();
        (this.crack?.material as THREE.Material).dispose();
        core.geometry.dispose();
        (core.material as THREE.Material).dispose();
        (glow.material as THREE.Material).dispose();
      });
    }
    const K = this.beast;
    // The camera pulls back to take it all in.
    this.frame.look = this.world(new THREE.Vector3(0, 2.6, 0).addScaledVector(home, 0.45));
    this.frame.radius = 6.4;
    // Up out of the ground, with a rumble and a shake, and back down at the end.
    const rise = easeOut((t - 0.2) / 2.0);
    const sink = this.survives ? span(t, 5.9, 7.6) : span(t, this.soulAt + 0.6, this.end - 0.3);
    const wobble = t < 2.3 ? Math.sin(t * 25) * 0.05 * (1 - rise) : 0;
    K.group.position.set(home.x + wobble, -12.5 * (1 - rise) - 12.5 * sink, home.z);
    K.group.visible = t > 0.15 && sink < 0.999;
    (this.crack!.material as THREE.MeshBasicMaterial).opacity = 0.55 * span(t, 0.2, 0.6) * (1 - span(t, this.end - 0.6, this.end));
    this.sfx('rumble', 0.1, t);
    this.frame.shake = (t > 0.2 && t < 2.3 ? 0.35 : 0) + (sink > 0 && sink < 1 ? 0.25 : 0);
    for (let n = 0; n < 7; n++) {
      const at = 0.3 + n * 0.3;
      this.once(`dust${n}`, at, t, () => this.bursts.add(at, 'dust', this.world(home.clone().add(new THREE.Vector3((hash(n) - 0.5) * 3, 0.2, (hash(n, 2) - 0.5) * 3))), 2.6));
    }
    // The roar: head up, jaw wide, arms out.
    const roar = span(t, 2.4, 2.75) * (1 - span(t, 3.3, 3.6));
    this.sfx('roar', 2.45, t);
    if (roar > 0) this.frame.shake = Math.max(this.frame.shake, roar * 0.3);
    // Charging: the plates light from the tail up to the head, and the mouth fills with light.
    const chargeAt = 3.6;
    const fireAt = 4.6;
    const fireEnd = 5.8;
    this.sfx('charge', chargeAt, t);
    const n = K.plates.length;
    const fade = this.survives ? 1 - span(t, 4.95, 5.05) : 1 - span(t, fireEnd, fireEnd + 0.5);
    K.plates.forEach((m, i) => {
      const on = span(t, chargeAt + (i / n) * 0.8, chargeAt + (i / n) * 0.8 + 0.2) * fade;
      const flick = t > fireAt && t < fireEnd && !this.survives ? 0.75 + 0.25 * Math.sin(t * 40 + i) : 1;
      m.emissiveIntensity = on * 1.6 * flick;
    });
    const charge = span(t, chargeAt + 0.4, fireAt) * fade;
    K.mouthGlow.opacity = this.survives ? charge * 0.5 : (t < fireEnd ? charge : 1 - span(t, fireEnd, fireEnd + 0.3)) * 0.85;
    // The body leans in and the head drops to aim, then rocks back.
    const lean = this.survives ? 0 : span(t, chargeAt, fireAt) * (1 - span(t, fireEnd + 0.2, fireEnd + 0.8));
    K.body.rotation.x = 0.08 + lean * 0.22 - roar * 0.15;
    K.head.rotation.x = -roar * 0.55 + lean * 0.35;
    K.jaw.rotation.x = roar * 0.75 + (t > fireAt - 0.2 && t < fireEnd + 0.1 && !this.survives ? 0.55 : 0) + Math.sin(t * 3) * 0.03;
    K.arms.forEach((a, i) => (a.rotation.x = -roar * 0.6 + Math.sin(t * 2 + i) * 0.05));
    K.tail.forEach((s, i) => (s.rotation.y = Math.sin(t * 1.4 - i * 0.6) * 0.09));
    this.turn.copy(this.face(home.clone().normalize().lerp(this.cam, 0.4)));
    K.group.updateMatrixWorld(true);
    const them = new THREE.Vector3(0, this.P + b.box.max.y * 0.5, 0);
    if (this.survives) {
      // "Ahh... ahh..." and a great sneeze: a harmless gust of sparkly mist, and a sheepish look.
      const ahh = span(t, 3.9, 4.2) * (1 - span(t, 4.35, 4.45)) + span(t, 4.45, 4.75) * (1 - span(t, 4.85, 4.95));
      const choo = span(t, 4.85, 4.95) * (1 - span(t, 5.3, 5.8));
      K.head.rotation.x += -ahh * 0.45 + choo * 0.5;
      K.body.rotation.x += -ahh * 0.12 + choo * 0.15;
      K.jaw.rotation.x += ahh * 0.35 + choo * 0.4;
      K.head.rotation.z = span(t, 5.5, 5.9) * 0.25 * (1 - span(t, 6.8, 7.2));
      this.sfx('ahh', 3.95, t);
      this.sfx('ahh', 4.5, t);
      this.sfx('sneeze', 4.88, t);
      this.once('choo', 4.9, t, () => {
        const mouth = K.mouth.getWorldPosition(new THREE.Vector3());
        const at = this.world(them);
        const push = at.clone().sub(mouth).multiplyScalar(0.55);
        this.bursts.add(4.9, 'steam', mouth.clone().lerp(at, 0.45), 2.6, push);
        this.bursts.add(4.95, 'sparkle', mouth.clone().lerp(at, 0.75), 2.2, push.multiplyScalar(0.5));
        this.bursts.add(5.0, 'steam', at, 1.6);
      });
      this.frame.shake = Math.max(this.frame.shake, choo * 0.35);
      // Blown back a step, fur on end; then a cheer.
      const blown = span(t, 4.95, 5.2);
      this.at.addScaledVector(home.clone().normalize(), -blown * 0.3);
      const fluff = blown * (1 - span(t, 5.6, 6.2));
      this.stretch.set(1 + fluff * 0.1, 1 + fluff * 0.06, 1 + fluff * 0.1);
      return t > 6.0 ? 'cheer' : t > 2.4 ? 'cry' : 'idle';
    }
    // The breath: a roaring beam of blue light straight at them.
    const beamOn = t > fireAt && t < fireEnd;
    this.beam!.visible = beamOn;
    this.sfx('beam', fireAt, t);
    if (beamOn) {
      const mouth = this.group.worldToLocal(K.mouth.getWorldPosition(new THREE.Vector3()));
      const len = mouth.distanceTo(them);
      this.beam!.position.copy(mouth);
      this.beam!.lookAt(this.world(them));
      const grow = easeOut((t - fireAt) / 0.15) * (1 - span(t, fireEnd - 0.15, fireEnd));
      const pulse = 1 + Math.sin(t * 45) * 0.12;
      const core = this.beam!.getObjectByName('core')!;
      const glow = this.beam!.getObjectByName('glow')!;
      core.scale.set(0.13 * grow * pulse, 0.13 * grow * pulse, len);
      glow.scale.set(0.34 * grow * pulse, 0.34 * grow * pulse, len);
      this.frame.shake = Math.max(this.frame.shake, 0.25);
      for (let k = 0; k < 6; k++) {
        const at = fireAt + 0.1 + k * 0.18;
        this.once(`zap${k}`, at, t, () => this.bursts.add(at, k % 2 ? 'sparks' : 'flash', this.world(them), k % 2 ? 1.2 : 1.6));
      }
      // Lit up blue-white, shaking, and charred by the end of it.
      const flash = Math.floor(t * 14) % 2 === 0;
      const soot = span(t, fireAt, fireEnd);
      this.tint(flash ? '#d8f4ff' : '#141012', flash ? 0.7 * (1 - soot) : Math.max(0.5, soot));
      this.at.add(new THREE.Vector3((hash(Math.floor(t * 40), 1) - 0.5) * 0.04, 0, (hash(Math.floor(t * 40), 2) - 0.5) * 0.04));
    }
    if (t >= fireEnd) {
      this.tint('#141012', 0.95);
      for (let k = 0; k < 3; k++) {
        const at = fireEnd + 0.1 + k * 0.3;
        this.once(`smoke${k}`, at, t, () => this.bursts.add(at, 'smoke', this.world(them.clone().add(new THREE.Vector3(0, b.box.max.y * 0.5, 0))), 0.8));
      }
    }
    // Once the ghost is away, what's left crumbles to a little heap of ash.
    if (this.corpse) {
      const crumble = span(t, this.soulAt + SOUL.rise - 0.2, this.soulAt + SOUL.rise + 0.3);
      this.corpse.group.scale.set(1 + crumble * 0.4, Math.max(0.05, 1 - crumble * 0.9), 1 + crumble * 0.4);
      this.once('ash', this.soulAt + SOUL.rise - 0.1, t, () => this.bursts.add(t, 'soot', this.world(new THREE.Vector3(0, this.P + 0.2, 0)), 0.9));
    }
    this.setExtraVec('soulFrom', new THREE.Vector3(0, this.P + 0.1, 0));
    return t > 2.4 && t < fireAt ? 'cry' : 'idle';
  }

  // ---------------------------------------------------------------- the plane crash

  /** A point in the stage's frame: so far towards the camera, so far to the screen's left, and so high. */
  private V(c: number, l: number, y: number): THREE.Vector3 {
    return this.cam.clone().multiplyScalar(c).addScaledVector(this.left, l).setY(y);
  }

  /**
   * Where the plane comes down: out on the open grass beyond the gallows and to the right of it, between the
   * bakery, the pond and the cottages, well clear of them all (and of the square and its tower).
   */
  private crashAt(): THREE.Vector3 {
    return this.V(-3.8, -6.6, 0);
  }

  private plane(t: number): { anim: Anim; visible: boolean } {
    const b = this.size();
    const P = this.P;
    // Facing out over the front of the platform, towards the square, turned a little to the screen's left.
    const F = this.cam.clone().multiplyScalar(0.9).addScaledVector(this.left, 0.45).normalize();
    // The plane's own left: tipping about it puts the nose down.
    const W = new THREE.Vector3(F.z, 0, -F.x);
    const restQ = this.face(F);
    if (!this.craft) {
      // Sized so whoever is in it fits the cockpit, tall or wide or long.
      const s = THREE.MathUtils.clamp(Math.max((b.box.max.x - b.box.min.x) / 0.62, (b.box.max.y - b.box.min.y) / 1.2, (b.box.max.z - b.box.min.z) / 1.1), 0.8, 2.6);
      this.extra.planeS = s;
      this.craft = biplane();
      this.craft.group.scale.setScalar(s);
      this.props.add(new THREE.Group().add(this.craft.group));
      this.disposers.push(this.craft.dispose);
      // Further forward when it's big, so the wings clear the posts.
      const rest = this.V(0.35 + 0.35 * (s - 1), 0, P + this.craft.wheels * s);
      this.setExtraVec('planeRest', rest);
      const keys: [number, THREE.Vector3][] = [
        [1.15, rest.clone()],
        [1.7, rest.clone().addScaledVector(F, 0.9)],
        [2.0, rest.clone().addScaledVector(F, 1.95).setY(rest.y - 0.25)],
        [2.3, this.V(2.9, 1.4, P + 1.0)],
        [2.6, this.V(3.05, 2.1, P + 1.5)],
      ];
      // The loop, over the square: up, over the top upside down and round, drifting a little as it goes.
      for (let j = 0; j <= 8; j++) {
        const a = (j / 8) * Math.PI * 2;
        keys.push([2.9 + j * 0.15, this.V(2.9 - j * 0.06, 3.2 + Math.sin(a) * 1.3, P + 2.8 - Math.cos(a) * 1.3)]);
      }
      // A wide turn back behind the gallows and on out over the grass, coughing, till it stalls and dives.
      keys.push(
        [4.4, this.V(2.0, 4.6, P + 2.0)],
        [4.7, this.V(0.8, 5.2, P + 2.8)],
        [5.0, this.V(-0.6, 4.6, P + 3.5)],
        [5.3, this.V(-1.3, 3.2, P + 4.1)],
        [5.6, this.V(-1.6, 1.6, P + 4.5)],
        [5.9, this.V(-1.9, -0.5, P + 4.7)],
        [6.25, this.V(-2.2, -1.9, P + 4.6)],
        [6.5, this.V(-2.7, -3.4, P + 3.4)],
        [6.68, this.V(-3.3, -5.0, P + 1.6)],
        [PLANE_HIT, this.crashAt().setY(0.3 * s)],
      );
      this.flight = new Flight(keys);
      if (this.survives) {
        this.hay = haystack();
        const hs = Math.max(1, s * 0.85);
        this.hay.scale.set(hs, hs * 0.75, hs);
        const spot = rest.clone().addScaledVector(F, 1.3 + 0.9 * s).setY(0.06);
        this.setExtraVec('hay', spot);
        this.extra.hayTop = 0.06 + 0.68 * hs;
        const holder = new THREE.Group().add(this.hay);
        holder.position.copy(spot);
        this.props.add(holder);
      } else {
        this.pit = crater();
        this.pit.visible = false;
        const holder = new THREE.Group().add(this.pit);
        holder.position.copy(this.crashAt());
        this.props.add(holder);
        this.loose = propeller();
        this.loose.group.scale.setScalar(s);
        this.props.add(new THREE.Group().add(this.loose.group));
        this.loose.group.visible = false;
      }
    }
    const C = this.craft;
    const s = this.extra.planeS;
    const rest = this.extraVec('planeRest')!;
    const holder = C.group.parent!;
    const hay = this.extraVec('hay');
    this.popProps(t, hay ? [this.world(rest), this.world(hay.clone().setY(0.5))] : [this.world(rest)]);
    // The propeller: a jerk or two as it's cranked and a cough, then away; it stops when the engine does.
    const rates: [number, number][] = [
      [0.35, 0],
      [0.4, 22],
      [0.55, 0],
      [0.75, 0],
      [0.8, 30],
      [0.95, 3],
      [1.05, 3],
      [1.15, 45],
      ...((this.survives
        ? [
            [1.9, 45],
            [2.25, 0],
          ]
        : [
            [5.95, 45],
            [6.25, 0],
            [6.4, 0],
            [6.8, 12],
          ]) as [number, number][]),
    ];
    const rate = (integrate(rates, t + 0.01) - integrate(rates, t)) / 0.01;
    C.prop.blades.rotation.z = integrate(rates, t);
    C.prop.blur.opacity = 0.35 * THREE.MathUtils.clamp((rate - 18) / 20, 0, 1);
    this.sfx('crank', 0.35, t);
    this.sfx('sputter', 0.75, t);
    // The scarf streams out behind once it's going, and hangs down when it isn't.
    const wind = THREE.MathUtils.clamp(rate / 30, 0, 1);
    C.scarf.forEach((g, k) => {
      g.rotation.x = (k ? 0.25 : -1.3) * (1 - wind) + wind * (Math.sin(t * 13 - k * 0.9) * 0.3 - (k ? 0 : 0.1));
      g.rotation.y = wind * Math.sin(t * 9 - k * 1.1) * 0.25;
    });
    const pos = rest.clone();
    const quat = restQ.clone();
    // Shaking on the boards while the engine coughs into life.
    const cough = t > 0.35 && t < 1.3 ? Math.exp(-((t - 0.35) % 0.4) * 8) * 0.03 : 0;
    pos.y += Math.abs(Math.sin(t * 60)) * cough;
    let anim: Anim = 'sit';
    let visible = true;
    this.frame.look = this.world(this.V(0.8, 0, P + 1.1));
    this.frame.radius = 3.3;
    if (!this.survives) {
      const path = this.flight!;
      if (t >= 1.15) {
        const T = Math.min(t, PLANE_HIT);
        path.at(T, pos);
        const { fwd, acc } = path.motion(T);
        if (fwd.lengthSq() < 1e-8) fwd.copy(F);
        // Level on the boards; once off, it banks into its turns as a real plane does.
        const air = span(T, 1.75, 2.1);
        const up = acc.multiplyScalar(air).add(new THREE.Vector3(0, 9.8, 0));
        quat.copy(basis(new THREE.Vector3(0, 0, 1), UP, fwd, up));
        // Wobbly all the way round, and spinning in the dive.
        const dive = Math.max(0, T - 6.3);
        quat.multiply(tmpQ.setFromAxisAngle(new THREE.Vector3(0, 0, 1), air * Math.sin(T * 8) * 0.16 + dive * dive * 30));
        quat.multiply(tmpQ.setFromAxisAngle(new THREE.Vector3(1, 0, 0), air * Math.sin(T * 6.3) * 0.07));
      }
      holder.position.copy(pos);
      holder.quaternion.copy(quat);
      holder.visible = t < PLANE_HIT;
      holder.updateMatrixWorld(true);
      const exhaust = () => C.exhaust.getWorldPosition(new THREE.Vector3());
      this.sfx('engine', 1.05, t);
      for (let n = 0; n < 16; n++) {
        const when = 1.15 + n * 0.3;
        if (when > 5.9) break;
        this.once(`puff${n}`, when, t, () => this.bursts.add(when, 'smoke', exhaust(), 0.35 * s));
      }
      for (const when of [3.6, 5.75, 6.0]) {
        this.sfx(when < 6 ? 'cough' : 'stall', when, t);
        this.once(`cough${when}`, when, t, () => this.bursts.add(when, 'soot', exhaust(), (when < 6 ? 0.6 : 0.9) * s));
      }
      this.sfx('whistle', 6.1, t);
      // The camera follows it round, pulled back to take in the loop.
      const fly = span(t, 1.2, 2.2);
      const base = this.V(0.8, 0, P + 1.1);
      this.frame.radius = 3.3 + 1.6 * fly;
      const crash = this.crashAt();
      if (t < PLANE_HIT) {
        this.frame.look = this.world(base.clone().lerp(pos, 0.3 * fly));
        // In the cockpit, holding on.
        this.at.copy(C.seat).multiplyScalar(s).applyQuaternion(quat).add(pos);
        this.turn.copy(quat);
        return { anim: 'sit', visible: true };
      }
      // BOOM: a flash, a fireball, a mushroom of smoke, and a crater where it went in.
      const u = t - PLANE_HIT;
      this.frame.look = this.world(base.clone().lerp(crash.clone().setY(1.6), 0.5));
      this.frame.radius = 5.4;
      this.frame.shake = Math.exp(-u * 2.5) * 0.8;
      this.sfx('crash', PLANE_HIT, t);
      this.once('crash', PLANE_HIT, t, () => {
        const at = this.world(crash.clone().setY(0.3));
        this.bursts.add(PLANE_HIT, 'flash', at, 3);
        this.bursts.add(PLANE_HIT, 'fire', at, 1.8);
        this.bursts.add(PLANE_HIT + 0.05, 'sparks', at, 1.6);
        this.bursts.add(PLANE_HIT + 0.1, 'soot', at, 1.8);
        this.bursts.add(PLANE_HIT + 0.05, 'dust', this.world(crash), 2.2);
        this.mushroom = new Mushroom(PLANE_HIT + 0.1, this.world(crash), 1 + 0.3 * (s - 1), 3.4);
        this.fx.add(this.mushroom.group);
      });
      this.mushroom?.update(t);
      this.pit!.visible = true;
      this.pit!.scale.setScalar((1 + 0.25 * (s - 1)) * Math.max(0.001, easeOut(u / 0.15)));
      for (let n = 0; n < 6; n++) {
        const when = PLANE_HIT + 1.2 + n * 0.55;
        this.once(`wisp${n}`, when, t, () => this.bursts.add(when, 'smoke', this.world(crash.clone().setY(0.2)), 0.8));
      }
      this.once('pitOut', this.end - 0.45, t, () => this.bursts.add(this.end - 0.45, 'poof', this.world(crash.clone().setY(0.3)), 1.4));
      // The propeller, flung back up onto the platform: a bounce, and spinning down flat like a dropped coin.
      const L = this.loose!;
      const lh = L.group.parent!;
      L.group.visible = true;
      const land = this.V(0.55, -0.35, P + 0.04 * s);
      const fly2 = 0.95;
      if (u < fly2) {
        const k = u / fly2;
        lh.position.lerpVectors(crash.clone().setY(0.8), land, k);
        lh.position.y += 5.5 * 4 * k * (1 - k);
        L.group.rotation.set(u * 17, u * 11, u * 5);
      } else {
        const v = u - fly2;
        lh.position.copy(land).addScaledVector(this.left, -0.5 * easeOut(v / 0.6));
        lh.position.y += Math.abs(Math.sin(v * 9)) * Math.exp(-v * 5) * 0.4;
        const spin = 9 * (1 - Math.exp(-v * 1.6));
        L.group.rotation.set(-Math.PI / 2 + Math.exp(-v * 2.5) * 0.4 * Math.sin(spin * 2.2), 0, spin);
        this.once('propland', PLANE_HIT + fly2, t, () => this.bursts.add(PLANE_HIT + fly2, 'dust', this.world(land), 0.4));
      }
      this.sfx('boing', PLANE_HIT + fly2, t);
      this.sfx('clatter', PLANE_HIT + fly2 + 0.45, t);
      this.setExtraVec('soulFrom', crash.clone().setY(0.15));
      this.at.copy(crash);
      return { anim: 'idle', visible: false };
    }
    // Spared: it trundles to the edge, the engine conks out with a bang and a puff of soot, it teeters... and
    // tips off, flopping onto the haystack. Out they climb, and cheer.
    const edge = 1.9;
    const tipAt = 2.7;
    const off = 3.0;
    const flop = 3.35;
    const hop = 3.9;
    this.frame.look = this.world(this.V(1.5, 0.2, P + 0.4));
    this.frame.radius = 3.5;
    this.sfx('putt', 1.05, t);
    this.sfx('conk', edge, t);
    this.sfx('flump', flop, t);
    this.sfx('wahwah', 3.6, t);
    this.sfx('pop', hop, t);
    const roll = 0.6 * Math.min(1, Math.max(0, (t - 1.15) / (edge - 1.15))) ** 2;
    pos.addScaledVector(F, roll);
    // Teetering on the edge, about the wheels.
    const pivot = rest.clone().addScaledVector(F, 0.6 + 0.38 * s).setY(P);
    let tilt = 0;
    if (t > edge) tilt = Math.max(0, 0.14 + 0.2 * Math.sin((t - edge) * 9) * Math.exp(-(t - edge) * 1.5));
    if (t > tipAt) tilt = THREE.MathUtils.lerp(tilt, 1.0, ease((t - tipAt) / (off - tipAt)));
    const tipQ = new THREE.Quaternion().setFromAxisAngle(W, Math.min(tilt, 1.0));
    const tipped = (x: number) => {
      const q = new THREE.Quaternion().setFromAxisAngle(W, x);
      return { p: rest.clone().addScaledVector(F, 0.6).sub(pivot).applyQuaternion(q).add(pivot), q: q.multiply(restQ) };
    };
    if (t > edge && t <= off) {
      pos.copy(rest).addScaledVector(F, 0.6).sub(pivot).applyQuaternion(tipQ).add(pivot);
      quat.copy(tipQ).multiply(restQ);
    }
    const h = hay!;
    const lie = new THREE.Quaternion().setFromAxisAngle(W, 0.4).multiply(restQ).multiply(tmpQ.setFromAxisAngle(new THREE.Vector3(0, 0, 1), 0.25));
    const onHay = h.clone().setY(this.extra.hayTop + 0.18 * s).addScaledVector(F, -0.15);
    if (t > off) {
      const from = tipped(1.0);
      const k = Math.min(1, (t - off) / (flop - off));
      pos.lerpVectors(from.p, onHay, k);
      pos.y = from.p.y + (onHay.y - from.p.y) * k * k;
      quat.copy(from.q).slerp(lie, ease(k));
      const v = t - flop;
      if (v > 0) pos.y += Math.abs(Math.sin(v * 12)) * Math.exp(-v * 6) * 0.15 * s;
      // The stack squashes as it lands.
      if (this.hay) this.hay.scale.y = Math.max(1, s * 0.85) * 0.75 * (1 - (v > 0 ? Math.exp(-v * 6) * Math.abs(Math.sin(v * 12)) * 0.25 : 0));
    }
    holder.position.copy(pos);
    holder.quaternion.copy(quat);
    holder.updateMatrixWorld(true);
    this.once('conk', edge, t, () => this.bursts.add(edge, 'soot', C.exhaust.getWorldPosition(new THREE.Vector3()), 0.9 * s));
    this.once('hay', flop, t, () => this.bursts.add(flop, 'hay', this.world(onHay), 1.2 * s));
    // Sooty from the bang, until they shake it off.
    if (t > edge) this.tint('#2a2420', span(t, edge, edge + 0.1) * 0.55 * (1 - span(t, 4.4, 5.0)));
    const seat = C.seat.clone().multiplyScalar(s).applyQuaternion(quat).add(pos);
    if (t < hop) {
      this.at.copy(seat);
      this.turn.copy(quat);
    } else {
      // Out of the cockpit and down beside the haystack, facing everyone.
      const k = Math.min(1, (t - hop) / 0.45);
      const ground = h.clone().addScaledVector(W, -(0.95 * Math.max(1, s * 0.85) + 0.35)).setY(0.07);
      const from = C.seat.clone().multiplyScalar(s).applyQuaternion(lie).add(onHay);
      this.at.lerpVectors(from, ground, k);
      this.at.y += Math.sin(k * Math.PI) * 0.6;
      this.turn.copy(lie).slerp(this.face(this.cam), ease(k));
      anim = t > hop + 0.5 ? 'cheer' : 'idle';
    }
    return { anim, visible };
  }

  // ---------------------------------------------------------------- the giant pigeon

  private pigeon(t: number): { anim: Anim; visible: boolean } {
    const b = this.size();
    const P = this.P;
    const A = b.box.max.y;
    // Beyond the gallows and to its right, clear of the flower bed and the bakery: a tree with a nest on top
    // grows up out of the ground, and sinks back into it at the end.
    const foot = this.V(-3.0, -2.8, 0);
    if (!this.tree) {
      const ns = THREE.MathUtils.clamp(Math.max((b.box.max.x - b.box.min.x) / 0.6, A / 1.05, (b.box.max.z - b.box.min.z) / 1.0), 1, 2.2);
      this.extra.pigS = ns;
      this.tree = nestTree();
      this.tree.group.scale.setScalar(ns);
      this.tree.group.position.copy(foot);
      this.group.add(this.tree.group);
      // Three chicks round the nest facing its middle: one at the back looking out at the camera, two at the sides.
      this.tree.chicks.forEach((c, k) => {
        const d = this.cam.clone().negate().applyAxisAngle(UP, (k * Math.PI * 2) / 3);
        c.group.position.copy(this.tree!.nest).addScaledVector(d, this.tree!.radius * 0.58).add(new THREE.Vector3(0, -0.12, 0));
        c.group.userData.ry = Math.atan2(-d.x, -d.z);
      });
      this.bird = giantPigeon();
      this.bird.group.scale.setScalar(ns);
      this.group.add(this.bird.group);
      const nest = this.tree.nest.clone().multiplyScalar(ns).add(foot);
      this.setExtraVec('nest', nest);
      const hover = P + A + 0.92 * ns - 0.05;
      const over = nest.y + A + 0.92 * ns + 0.25;
      const at = (v: THREE.Vector3, y: number) => v.clone().setY(y);
      this.flight = new Flight([
        [0.95, this.V(-6, 7, 12)],
        [1.6, this.V(-2.5, 4, 7.5)],
        [2.1, this.V(0.4, 1.3, hover + 1.4)],
        [2.45, this.V(0, 0, hover + 0.15)],
        [2.85, this.V(0, 0, hover)],
        [3.2, this.V(-0.5, -0.5, hover + 1.0)],
        [3.65, at(foot.clone().multiplyScalar(0.6), over + 0.9)],
        [4.05, at(nest.clone().addScaledVector(this.cam, 0.25), over + 0.3)],
        [4.45, at(nest, over)],
        [4.9, at(foot.clone().add(this.V(-1.5, -1.7, 0)), over + 2.5)],
        [5.6, this.V(-8, -9, 12)],
        [6.3, this.V(-12, -13, 16)],
      ]);
      if (this.survives) {
        const text = new TextSign({ w: 256, h: 128, bg: '#fffaf0', fg: '#4f8a2e', border: '#4f8a2e', size: 76, weight: 800 }, 'YUCK!');
        const board = signBoard(text, 1.1, 0.55, { lit: true });
        const group = new THREE.Group().add(board.mesh);
        group.position.copy(nest).add(new THREE.Vector3(0, 1.7 * ns, 0));
        group.quaternion.copy(this.face(this.cam));
        group.scale.setScalar(0.001);
        this.group.add(group);
        this.notice = {
          group,
          dispose: () => {
            text.dispose();
            board.material.dispose();
            disposeObject(group);
          },
        };
      }
    }
    const T = this.tree;
    const B = this.bird!;
    const ns = this.extra.pigS;
    const nest = this.extraVec('nest')!;
    this.frame.look = this.world(new THREE.Vector3(0, P + 0.8, 0).lerp(nest.clone().add(new THREE.Vector3(0, 1.0, 0)), 0.55));
    this.frame.radius = 0.42 * nest.distanceTo(new THREE.Vector3(0, P, 0)) + 1.9;
    // The tree: up out of the ground with a rumble, and back down at the end.
    const rise = easeOut((t - 0.15) / 1.4);
    const sinkFrom = this.survives ? 7.6 : this.soulAt + SOUL.rise - 0.2;
    const sink = span(t, sinkFrom, this.end - 0.25);
    const drop = (T.nest.y + 1.2) * ns;
    T.group.position.y = -drop * (1 - rise) - drop * sink + (t < 1.6 ? Math.sin(t * 40) * 0.03 * (1 - rise) : 0);
    T.group.visible = t > 0.12 && sink < 0.999;
    this.sfx('rumble', 0.1, t);
    this.sfx('rumble', sinkFrom, t);
    if (t > 0.2 && t < 1.5) this.frame.shake = 0.25;
    if (sink > 0 && sink < 1) this.frame.shake = 0.2;
    for (let n = 0; n < 5; n++) {
      const at = 0.2 + n * 0.28;
      this.once(`dust${n}`, at, t, () => this.bursts.add(at, 'dust', this.world(foot.clone().add(new THREE.Vector3((hash(n) - 0.5) * 1.2, 0.1, (hash(n, 2) - 0.5) * 1.2))), 1.3));
      const back = sinkFrom + 0.1 + n * 0.2;
      this.once(`sinkdust${n}`, back, t, () => this.bursts.add(back, 'dust', this.world(foot.clone().add(new THREE.Vector3((hash(n, 5) - 0.5) * 1.2, 0.1, (hash(n, 6) - 0.5) * 1.2))), 1.3));
    }
    // The bird: in from the sky, a hover over the platform, off to the nest with its catch, and away.
    const path = this.flight!;
    const flying = t > 0.95 && t < 6.3;
    B.group.visible = flying;
    const pos = path.at(t);
    const { fwd } = path.motion(t);
    const flat = fwd.clone().setY(0);
    const speed = flat.length() / 0.16;
    const w = THREE.MathUtils.clamp(speed / 3, 0, 1);
    const dir = this.cam.clone().lerp(flat.normalize(), w).normalize();
    const climb = fwd.y / 0.16;
    B.group.position.copy(pos);
    B.group.quaternion.copy(this.face(dir)).multiply(tmpQ.setFromAxisAngle(new THREE.Vector3(1, 0, 0), -THREE.MathUtils.clamp(climb * 0.06, -0.5, 0.5) - (1 - w) * 0.45));
    // Gliding down out of the sky, then beating hard to hover and to lift.
    const glide = t < 1.9 ? 0.3 : 1;
    const flap = Math.sin(t * (w < 0.5 ? 17 : 12)) * 0.85 * glide;
    B.wings[0].rotation.z = flap;
    B.wings[1].rotation.z = -flap;
    const grab = 2.65;
    const legs = t < 1.9 ? 1.0 : t < grab ? THREE.MathUtils.lerp(1.0, -0.35, span(t, 1.9, 2.3)) : t < PIGEON_DROP ? 0.15 : THREE.MathUtils.lerp(0.15, 1.0, span(t, PIGEON_DROP + 0.2, PIGEON_DROP + 0.7));
    const grip = t > grab && t < PIGEON_DROP ? 0.6 * span(t, grab, grab + 0.12) : -0.6;
    B.legs.forEach((l) => (l.rotation.x = legs));
    B.toes.forEach((f) => (f.rotation.x = grip));
    B.head.rotation.x = t > 2.0 && t < 2.9 ? 0.45 : Math.sin(t * 5) * 0.08;
    B.group.updateMatrixWorld(true);
    this.sfx('peeps', 0.9, t);
    this.sfx('bigcoo', 1.0, t);
    this.sfx('wings', 1.5, t);
    this.sfx('grab', grab, t);
    this.sfx('wings', 3.0, t);
    this.sfx('peeps', 4.3, t);
    this.sfx('thud', PIGEON_DROP + 0.3, t);
    this.once('grab', grab, t, () => this.bursts.add(grab, 'feathers', this.world(new THREE.Vector3(0, P + A, 0)), 0.6 * ns));
    // The chicks: bobbing and squawking for food with their beaks wide open, then...
    const land = PIGEON_DROP + 0.3;
    T.chicks.forEach((c, k) => {
      const hungry = (t > 0.9 && t < 2.2) || (t > 4.2 && t < land + 0.15);
      const gape = hungry ? 0.45 + 0.3 * Math.sin(t * 14 + k * 2) : 0.06;
      let look = -0.5 + Math.sin(t * 3 + k) * 0.1;
      let lean = 0;
      let turn = 0;
      let open = gape;
      c.group.scale.setScalar(1.2);
      if (!this.survives && t > land) {
        // ...in they dive, pecking, and it's all gone.
        const peck = span(t, land, land + 0.1) * (1 - span(t, 5.3, 5.4));
        look = THREE.MathUtils.lerp(look, 0.75 + 0.25 * Math.sin(t * 26 + k * 2), peck);
        lean = 0.35 * peck;
        open = THREE.MathUtils.lerp(open, 0.3 + 0.3 * Math.sin(t * 26 + k), peck);
        if (k === 0) {
          // The gulp (a bulge going down) and the burp.
          const bulge = span(t, 5.35, 5.45) * (1 - span(t, 5.6, 5.9));
          c.group.scale.set(1.2 + bulge * 0.26, 1.2 - bulge * 0.1, 1.2 + bulge * 0.26);
          const burp = span(t, 5.85, 5.95) * (1 - span(t, 6.25, 6.5));
          look -= span(t, 5.35, 5.45) * 0.4 + burp * 0.4;
          open = Math.max(open, burp * 0.9);
          lean -= burp * 0.25;
        }
      } else if (this.survives && t > land) {
        // ...a sniff, a recoil, heads turned away in disgust, and one spits them out.
        const sniff = span(t, land, land + 0.4) * (1 - span(t, 5.25, 5.35));
        const yuck = span(t, 5.25, 5.4) * (1 - span(t, 7.4, 7.8));
        look = THREE.MathUtils.lerp(look, 0.5, sniff) - yuck * 0.2;
        lean = 0.25 * sniff - 0.15 * yuck;
        turn = yuck * (k === 0 ? Math.sin(t * 9) * 0.5 : k === 1 ? 0.9 : -0.9);
        open = sniff > 0.5 ? 0.05 : yuck > 0 ? 0.02 : open;
        if (k === 0) {
          const spit = span(t, 5.75, 5.85) * (1 - span(t, 6.1, 6.3));
          look += spit * 0.9;
          open = Math.max(open, spit * 0.7);
          lean += spit * 0.3;
        }
      }
      c.group.position.y = T.nest.y - 0.12 + Math.abs(Math.sin(t * 6 + k * 2)) * (hungry ? 0.05 : 0.015);
      c.head.rotation.set(look, turn, 0);
      c.upper.rotation.x = -open * 0.85;
      c.lower.rotation.x = open * 0.85;
      // (A lean is a turn about the chick's own left, toward the middle.)
      c.group.quaternion.setFromAxisAngle(UP, c.group.userData.ry).multiply(tmpQ.setFromAxisAngle(new THREE.Vector3(1, 0, 0), lean));
    });
    // Where the condemned is.
    let anim: Anim = t > 1.6 ? 'cry' : 'idle';
    let visible = true;
    const talons = this.group.worldToLocal(B.talons.getWorldPosition(new THREE.Vector3()));
    const hang = talons.clone().add(new THREE.Vector3(0, -A * 0.95, 0));
    if (t > grab && t < PIGEON_DROP) {
      // Snatched up and carried off, swinging under its feet.
      const k = span(t, grab, grab + 0.18);
      this.at.lerp(hang, k);
      const swing = Math.sin((t - grab) * 5) * 0.25 * k;
      this.turn.copy(this.face(dir)).multiply(tmpQ.setFromAxisAngle(new THREE.Vector3(1, 0, 0), swing));
    } else if (t >= PIGEON_DROP) {
      // Dropped into the nest.
      if (!this.extraVec('dropFrom')) this.setExtraVec('dropFrom', hang);
      const from = this.extraVec('dropFrom')!;
      const k = Math.min(1, (t - PIGEON_DROP) / 0.3);
      this.at.lerpVectors(from, nest, k);
      this.at.y = from.y + (nest.y - from.y) * k * k;
      const v = t - land;
      if (v > 0) this.at.y += Math.abs(Math.sin(v * 13)) * Math.exp(-v * 7) * 0.15;
      this.turn.copy(this.face(this.cam));
      this.once('nestland', land, t, () => this.bursts.add(land, 'feathers', this.world(nest.clone().add(new THREE.Vector3(0, 0.4, 0))), 0.6 * ns));
      if (!this.survives) {
        // A flurry of feathers, a gulp, a burp, and one feather drifting down.
        this.sfx('gobble', land + 0.1, t);
        this.sfx('gulp', 5.4, t);
        this.sfx('burp', 5.9, t);
        for (let n = 0; n < 4; n++) {
          const at = land + 0.1 + n * 0.17;
          this.once(`flurry${n}`, at, t, () => this.bursts.add(at, n % 2 ? 'poof' : 'feathers', this.world(nest.clone().add(new THREE.Vector3((hash(n) - 0.5) * 0.4, 0.5 * ns, 0))), (n % 2 ? 0.6 : 1.3) * ns));
        }
        if (t > land) this.at.add(new THREE.Vector3((hash(Math.floor(t * 30), 1) - 0.5) * 0.08, 0, (hash(Math.floor(t * 30), 2) - 0.5) * 0.08));
        visible = t < 5.3;
        const beak = this.group.worldToLocal(T.chicks[0].upper.getWorldPosition(new THREE.Vector3()));
        this.once('burp', 5.95, t, () => this.bursts.add(5.95, 'poof', this.world(beak), 0.4 * ns));
        if (t > 5.95) {
          if (!this.feather) {
            this.feather = new THREE.Mesh(FEATHER, new THREE.MeshLambertMaterial({ color: '#eef0f6', emissive: '#6a6a78', side: THREE.DoubleSide }));
            this.feather.scale.setScalar(0.32 * ns);
            this.group.add(this.feather);
            this.setExtraVec('featherFrom', beak.clone().add(new THREE.Vector3(0, 0.3 * ns, 0)));
          }
          // Rocking from side to side all the way down, like a falling leaf, and settling on the grass.
          const f = this.extraVec('featherFrom')!;
          const u = t - 5.95;
          const y = Math.max(0.03, f.y + 0.3 - u * 1.1 - 0.3 * Math.exp(-u * 4));
          const down = y <= 0.03;
          this.feather.position.copy(f).addScaledVector(this.cam, Math.min(u, 3.5) * 0.35).addScaledVector(this.left, Math.sin(u * 3.2) * 0.4).setY(y);
          this.feather.rotation.set(down ? -Math.PI / 2 : 1.2 + Math.sin(u * 3.2) * 0.8, u * 0.4, down ? 0.3 : Math.cos(u * 3.2) * 0.5);
          this.feather.visible = t < this.end - 0.4;
        }
        this.setExtraVec('soulFrom', nest);
        return { anim: 'cry', visible };
      }
      // Spared: sniffed at, a disgusted "YUCK!", and spat back down onto the platform with a ptoo.
      this.sfx('yuck', 5.3, t);
      this.sfx('ptoo', 5.85, t);
      const sign = this.notice!.group;
      const pop = t < 5.35 ? 0 : t < 7.3 ? easeOut((t - 5.35) / 0.25) * (1 + 0.25 * Math.sin(Math.min(1, (t - 5.35) / 0.45) * Math.PI)) : Math.max(0, 1 - (t - 7.3) / 0.2);
      sign.scale.setScalar(Math.max(0.001, pop * ns));
      sign.position.y = nest.y + 1.7 * ns + Math.sin(t * 4) * 0.05;
      const spat = 5.85;
      const back = 6.75;
      const deck = this.V(0.35, 0.1, P);
      if (t > spat) {
        const k = Math.min(1, (t - spat) / (back - spat));
        this.at.lerpVectors(nest, deck, k);
        this.at.y += Math.sin(k * Math.PI) * 2.2 + (deck.y - nest.y) * (k * k - k);
        this.turn.copy(this.face(this.cam)).multiply(tmpQ.setFromAxisAngle(new THREE.Vector3(1, 0, 0), -k * Math.PI * 2));
        const v = t - back;
        if (v > 0) this.at.y += Math.abs(Math.sin(v * 12)) * Math.exp(-v * 6) * 0.2;
        this.once('spit', spat, t, () => this.bursts.add(spat, 'poof', this.world(nest.clone().add(new THREE.Vector3(0, 0.5 * ns, 0))), 0.5 * ns));
        this.once('backdust', back, t, () => this.bursts.add(back, 'dust', this.world(deck), 0.6));
        this.sfx('thud', back, t);
        this.sfx('boing', back + 0.05, t);
        if (!this.dizzy) {
          this.dizzy = new Dizzy(4);
          this.fx.add(this.dizzy.group);
        }
        this.dizzy.update(t, v > 0.05 && t < 7.5 ? this.world(deck.clone().add(new THREE.Vector3(0, A + 0.12, 0))) : null, 0.22, this.camera);
        anim = t > 7.5 ? 'cheer' : v > 0 ? 'idle' : 'cry';
      }
      return { anim, visible };
    }
    return { anim, visible };
  }

  // ---------------------------------------------------------------- the moon

  /** A transporter beam at a spot: the column of light, and them fading out of it (or into it). */
  private beamAt(col: { mesh: THREE.Mesh; material: THREE.MeshBasicMaterial }, at: THREE.Vector3, from: number, to: number, t: number, r: number, h: number) {
    const on = span(t, from, from + 0.25) * (1 - span(t, to - 0.3, to));
    col.mesh.visible = on > 0.01;
    col.mesh.position.copy(at);
    col.mesh.scale.set(r * (0.8 + 0.2 * on), h, r * (0.8 + 0.2 * on));
    col.material.opacity = on * (0.4 + 0.12 * Math.sin(t * 30));
    for (let k = 0; k < 3; k++) {
      const when = from + 0.15 + k * 0.3;
      if (when < to) this.once(`spk${from}:${k}`, when, t, () => this.bursts.add(when, 'sparkle', this.world(at.clone().add(new THREE.Vector3(0, h * (0.3 + k * 0.25), 0))), 0.8));
    }
  }

  private moon(t: number): { anim: Anim; visible: boolean } {
    const b = this.size();
    const P = this.P;
    const A = b.box.max.y;
    if (!this.rock) {
      // Big enough for whoever stands on it.
      const ms = THREE.MathUtils.clamp(Math.max(b.box.max.x - b.box.min.x, b.box.max.z - b.box.min.z) * 1.15, 0.75, 2.4);
      this.extra.moonS = ms;
      this.rock = moon();
      this.rock.group.scale.setScalar(0.001);
      this.group.add(this.rock.group);
      this.base = station();
      this.base.group.visible = false;
      this.group.add(this.base.group);
      this.disposers.push(this.rock.dispose, this.base.dispose);
      this.columns = [beamColumn(), beamColumn()];
      for (const c of this.columns) this.group.add(c.mesh);
      // The station's beams: six that meet in front of the dish, and the great one from there.
      const ray = new THREE.CylinderGeometry(1, 1, 1, 8, 1, true).translate(0, 0.5, 0).rotateX(Math.PI / 2);
      this.rayMat = new THREE.MeshBasicMaterial({ color: '#4dff5a', transparent: true, opacity: 0.9, depthWrite: false, blending: THREE.AdditiveBlending });
      const core = new THREE.MeshBasicMaterial({ color: '#d8ffd8', transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
      for (let k = 0; k < 8; k++) {
        const m = new THREE.Mesh(ray, k === 7 ? core : this.rayMat);
        m.visible = false;
        this.rays.push(m);
        this.group.add(m);
      }
      // The ring the moon goes out in, and the bits of it.
      this.ring = new THREE.Mesh(new THREE.TorusGeometry(1, 0.035, 6, 48), new THREE.MeshBasicMaterial({ color: '#f4fff0', transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
      this.ring.visible = false;
      this.group.add(this.ring);
      const rockGeo = new THREE.DodecahedronGeometry(1, 0);
      const rockMat = new THREE.MeshLambertMaterial({ color: '#a8a6a0', flatShading: true });
      for (let k = 0; k < 26; k++) {
        const m = new THREE.Mesh(rockGeo, rockMat);
        m.visible = false;
        this.chunks.push(m);
        this.group.add(m);
      }
      this.disposers.push(() => {
        ray.dispose();
        this.rayMat?.dispose();
        core.dispose();
        rockGeo.dispose();
        rockMat.dispose();
        for (const c of this.columns) {
          c.mesh.geometry.dispose();
          c.material.dispose();
        }
        disposeObject(this.ring!);
      });
      if (this.survives) {
        const text = new TextSign({ w: 512, h: 128, bg: '#fffaf0', fg: '#d8402f', border: '#d8402f', size: 64, weight: 800 }, 'LOW BATTERY');
        const board = signBoard(text, 1.8, 0.45, { lit: true });
        const group = new THREE.Group().add(board.mesh);
        group.scale.setScalar(0.001);
        this.group.add(group);
        this.notice = {
          group,
          dispose: () => {
            text.dispose();
            board.material.dispose();
            disposeObject(group);
          },
        };
      }
    }
    const M = this.rock;
    const S = this.base!;
    const ms = this.extra.moonS;
    // The moon: floating over the square, up to the left of the gallows, bobbing gently.
    const centre = this.V(1.2, 2.6, P + 3.4 + ms);
    centre.y += Math.sin(t * 1.3) * 0.08;
    const top = centre.clone().add(new THREE.Vector3(0, ms * 0.98, 0));
    const boom = 6.3;
    const gone = !this.survives && t >= boom;
    const pop = t < this.end - 0.45 ? easeOut((t - 0.2) / 0.4) : Math.max(0, 1 - (t - (this.end - 0.45)) / 0.25);
    M.group.scale.setScalar(Math.max(0.001, pop * ms));
    M.group.position.copy(centre);
    M.group.rotation.y = t * 0.08;
    M.group.visible = pop > 0.002 && !gone;
    this.once('moonIn', 0.2, t, () => this.bursts.add(0.2, 'poof', this.world(centre), 1.4 * ms));
    this.once('moonOut', this.end - 0.45, t, () => !gone && this.bursts.add(this.end - 0.45, 'poof', this.world(centre), 1.4 * ms));
    this.sfx('poof', 0.2, t);
    // The station: sliding into the sky from the right, turning its dish on the moon.
    // (Well back, so its dish, turned on the moon, is half turned to the camera too.)
    const home = this.V(-4.2, -2.6, P + 6.6);
    const away = this.V(-5, -12, P + 8.5);
    const leave = this.survives ? span(t, 6.6, 7.8) : span(t, 7.4, 8.8);
    const sp = home.clone().lerp(away, 1 - easeOut((t - 3.0) / 1.2)).lerp(away.clone().setY(away.y + 2), leave);
    if (this.survives) sp.y -= span(t, 5.4, 6.2) * 0.5;
    S.group.position.copy(sp);
    S.group.quaternion.copy(basis(S.aim, UP, centre.clone().sub(sp), UP));
    if (this.survives) S.group.quaternion.multiply(tmpQ.setFromAxisAngle(new THREE.Vector3(1, 0, 0), span(t, 5.4, 6.2) * 0.35));
    S.group.visible = t > 3.0 && leave < 0.99;
    S.group.updateMatrixWorld(true);
    this.sfx('station', 3.0, t);
    // The camera: between the platform and the moon for the beaming, then up at the sky for the station.
    const low = this.world(new THREE.Vector3(0, P + 0.8, 0).lerp(centre, 0.5));
    const sky = this.world(centre.clone().lerp(home, 0.45));
    const up = span(t, 2.6, 3.6) * (this.survives ? 1 - span(t, 6.0, 6.8) : 1);
    this.frame.look = low.lerp(sky, up);
    this.frame.radius = THREE.MathUtils.lerp(0.5 * centre.distanceTo(new THREE.Vector3(0, P, 0)) + 2.0, 0.55 * centre.distanceTo(home) + 2.0, up);
    this.frame.low = 0.25 + 0.4 * up;
    // Beamed up: the column on the platform, then on the moon.
    const [c1, c2] = this.columns;
    const r = Math.max(0.45, (b.box.max.x - b.box.min.x) * 0.75);
    const deck = new THREE.Vector3(0, P, 0);
    this.sfx('teleport', 0.35, t);
    let anim: Anim = 'idle';
    let visible = true;
    // How far through being beamed away (1 is gone).
    let fade = span(t, 0.9, 1.3) * (1 - span(t, 1.7, 2.1));
    let at = t < 1.5 ? deck : top;
    this.beamAt(c1, deck, 0.35, 1.8, t, r, A + 1.4);
    this.beamAt(c2, top, 1.5, 2.5, t, r, A + 1.4);
    if (this.survives && t > 5.9) {
      // ...and beamed back down again.
      this.sfx('teleport', 5.9, t);
      this.beamAt(c2, top, 5.9, 6.9, t, r, A + 1.4);
      this.beamAt(c1, deck, 6.7, 7.7, t, r, A + 1.4);
      fade = span(t, 6.2, 6.55) * (1 - span(t, 6.9, 7.3));
      at = t < 6.7 ? top : deck;
    }
    this.at.copy(at);
    visible = fade < 0.98 && !gone;
    this.stretch.set(1 - fade, 1 + fade * 0.35, 1 - fade);
    // On the moon: a look round, and the station comes.
    const around = span(t, 2.3, 2.5) * (1 - span(t, 3.4, 3.6));
    this.turn.copy(this.face(this.cam)).multiply(tmpQ.setFromAxisAngle(UP, Math.sin((t - 2.3) * 2.6) * 0.9 * around));
    if (t > 2.1 && t < 6.5) anim = t > 3.8 ? 'cry' : 'idle';
    // Charging: six beams reach out from round the dish and meet, the dish glowing brighter.
    const chargeAt = 4.4;
    const fireAt = 5.6;
    const dud = this.survives;
    this.sfx('charge', chargeAt, t);
    const flicker = dud && t > 5.0 ? (hash(Math.floor(t * 18)) > 0.45 ? 1 : 0.15) * (1 - span(t, 5.25, 5.4)) : 1;
    const focus = this.group.worldToLocal(S.group.localToWorld(S.focus.clone()));
    S.emitters.forEach((e, k) => {
      const m = this.rays[k];
      const grow = span(t, chargeAt + k * 0.12, chargeAt + k * 0.12 + 0.35) * (dud ? flicker : 1 - span(t, fireAt + 0.6, fireAt + 0.8));
      m.visible = grow > 0.01 && S.group.visible;
      if (!m.visible) return;
      const from = this.group.worldToLocal(S.group.localToWorld(e.clone()));
      m.position.copy(from);
      m.lookAt(this.world(focus));
      m.scale.set(0.03, 0.03, from.distanceTo(focus) * grow);
    });
    S.glow.opacity = span(t, chargeAt, fireAt) * 0.9 * (dud ? flicker : 1 - span(t, fireAt + 0.6, fireAt + 1.0));
    S.lights.color.set(dud && t > 5.2 && t < 6.4 && hash(Math.floor(t * 10), 3) > 0.5 ? '#3a3a30' : '#fff3b0');
    if (dud) {
      // The beams flicker and die: LOW BATTERY. The station droops, and slinks off.
      this.sfx('lowbat', 5.15, t);
      this.sfx('wahwah', 5.9, t);
      for (const m of this.rays.slice(6)) m.visible = false;
      const sign = this.notice!.group;
      const p = t < 5.3 ? 0 : t < 7.0 ? easeOut((t - 5.3) / 0.25) * (1 + 0.25 * Math.sin(Math.min(1, (t - 5.3) / 0.45) * Math.PI)) : Math.max(0, 1 - (t - 7.0) / 0.2);
      sign.scale.setScalar(Math.max(0.001, p * 1.4));
      sign.position.copy(sp).add(new THREE.Vector3(0, -2.0, 0)).addScaledVector(this.cam, 0.8);
      sign.quaternion.copy(this.face(this.cam));
      if (t > 7.4) anim = 'cheer';
      else if (t > 6.5) anim = 'idle';
      return { anim, visible };
    }
    // The beam: from where they meet, straight at the moon.
    const beamOn = t > fireAt && t < boom;
    const [glowRay, coreRay] = this.rays.slice(6);
    glowRay.visible = coreRay.visible = beamOn;
    this.sfx('beam', fireAt, t);
    if (beamOn) {
      const len = focus.distanceTo(centre);
      const grow = easeOut((t - fireAt) / 0.15);
      const pulse = 1 + Math.sin(t * 45) * 0.12;
      for (const m of [glowRay, coreRay]) {
        m.position.copy(focus);
        m.lookAt(this.world(centre));
      }
      glowRay.scale.set(0.32 * pulse * grow, 0.32 * pulse * grow, len * grow);
      coreRay.scale.set(0.12 * pulse * grow, 0.12 * pulse * grow, len * grow);
      this.frame.shake = 0.25;
      // Lit up green, shaking, and cracks of light opening all over the moon.
      this.tint('#d8ffd0', Math.floor(t * 14) % 2 ? 0.5 : 0.15);
      this.at.add(new THREE.Vector3((hash(Math.floor(t * 40), 1) - 0.5) * 0.05, 0, (hash(Math.floor(t * 40), 2) - 0.5) * 0.05));
      M.group.position.add(new THREE.Vector3((hash(Math.floor(t * 40), 3) - 0.5) * 0.06, 0, (hash(Math.floor(t * 40), 4) - 0.5) * 0.06));
      for (let k = 0; k < 4; k++) {
        const when = fireAt + 0.1 + k * 0.15;
        this.once(`zap${k}`, when, t, () => this.bursts.add(when, k % 2 ? 'sparks' : 'flash', this.world(centre), 1.2 * ms));
      }
    }
    M.cracks.opacity = span(t, fireAt + 0.15, boom - 0.05);
    // KABOOM: a great flash, a ring flying out, and bits of moon everywhere.
    this.sfx('boom', boom, t);
    this.once('boom', boom, t, () => {
      const at = this.world(centre);
      this.bursts.add(boom, 'flash', at, 2.6 * ms);
      this.bursts.add(boom, 'fire', at, 1.5 * ms);
      this.bursts.add(boom + 0.05, 'sparkle', at, 2.4 * ms);
      this.bursts.add(boom + 0.1, 'soot', at, 1.6 * ms);
      this.bursts.add(boom + 0.15, 'smoke', at, 2.4 * ms);
    });
    const u = t - boom;
    // The ring lies square to the camera, tipped back a little, so it reads as a ring.
    const normal = this.cam.clone().add(new THREE.Vector3(0, 0.6, 0)).normalize();
    const ringQ = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal);
    this.ring!.visible = u > 0 && u < 1.8;
    if (this.ring!.visible) {
      const k = easeOut(u / 1.6);
      this.ring!.position.copy(centre);
      this.ring!.quaternion.copy(ringQ);
      this.ring!.scale.set(ms + 6 * k, ms + 6 * k, 1 + 3 * k);
      (this.ring!.material as THREE.MeshBasicMaterial).opacity = 1 - u / 1.8;
      this.frame.shake = Math.exp(-u * 2.5) * 0.7;
    }
    this.chunks.forEach((m, k) => {
      m.visible = u > 0 && u < 2.2;
      if (!m.visible) return;
      const a = (k / this.chunks.length) * Math.PI * 2 + hash(k, 1) * 0.3;
      const out = new THREE.Vector3(Math.cos(a), Math.sin(a), (hash(k, 2) - 0.5) * 0.5).applyQuaternion(ringQ);
      const d = (ms * 0.6 + (5 + hash(k, 3) * 2.5) * easeOut(u / 1.8)) * (k % 3 ? 1 : 0.6);
      m.position.copy(centre).addScaledVector(out, d);
      m.position.y -= u * u * 0.6;
      m.rotation.set(u * (3 + k), u * (2 + k * 0.5), k);
      m.scale.setScalar(ms * (0.1 + hash(k, 4) * 0.16) * (1 - span(u, 1.5, 2.2)));
    });
    if (gone) {
      this.setExtraVec('soulFrom', centre.clone().add(new THREE.Vector3(0, -0.3, 0)));
      return { anim: 'idle', visible: false };
    }
    return { anim, visible };
  }

  dispose() {
    if (this.who && this.tinted) tintAnimal(this.who, null);
    for (const d of this.disposers) d();
    this.mushroom?.dispose();
    this.notice?.dispose();
    (this.feather?.material as THREE.Material | undefined)?.dispose();
    if (this.bird) disposeObject(this.bird.group);
    if (this.tree) disposeObject(this.tree.group);
    if (this.rock) disposeObject(this.rock.group);
    if (this.base) disposeObject(this.base.group);
    this.bursts.dispose();
    this.bolts?.dispose();
    this.flames?.dispose();
    this.dizzy?.dispose();
    for (const p of this.pieces) p.dispose();
    this.corpse?.dispose();
    disposeObject(this.props);
    if (this.beast) disposeObject(this.beast.group);
    this.group.removeFromParent();
  }
}

