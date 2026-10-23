import * as THREE from 'three';
import type { ExecMethod } from '../../state/types';
import { disposeObject } from '../items';
import type { Anim } from '../types';
import { BakedPiece, bakeAnimal, freeBake, measureAnimal, tintAnimal, type Build } from './bake';
import { Bolts, Bursts, Dizzy, Flames, ease, easeOut, hash, span } from './fx';
import { Builder, matte } from '../build';
import { G } from '../town/kit';
import { chair, guillotine, kaiju, launcher, rainCloud, roast, soldier, type Chair, type Cloud, type Guillotine, type Kaiju, type Launcher, type Roast, type Soldier } from './props';

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
 * Where the camera looks at the gallows from (see Engine.updateCamera): its compass angle, distance, and height
 * above the spot it looks at. The gallows itself is watched from the side, for the drop; everything else from
 * nearly in front, between the posts.
 */
export const EXEC_CAM = { yaw: 0.45, dist: 8.5, height: 4.4 };
export const STAGE_YAW = -1.2;

/**
 * Where the camera goes for a framing: looking at its spot from the meeting camera's angle, pulled back far enough
 * for its radius (more so on a narrow screen held upright), and shaken a little when the ground shakes.
 */
export function execCamera(f: ExecFrame, aspect: number, t: number): { pos: THREE.Vector3; look: THREE.Vector3 } {
  let k = f.radius / 3.2;
  if (f.radius > 3 && aspect < 1) k *= Math.min(1.5, 1 / aspect ** 0.5);
  const pos = new THREE.Vector3(Math.sin(STAGE_YAW) * EXEC_CAM.dist * k, EXEC_CAM.height * k, Math.cos(STAGE_YAW) * EXEC_CAM.dist * k).add(f.look);
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

/** The show's timings for each method, in seconds: when the ghost rises (null when spared) and when it ends. */
const TIMES: Record<Exclude<ExecMethod, 'hang'>, { soul: number; spared: number }> = {
  squad: { soul: 4.2, spared: 5.8 },
  guillotine: { soul: 3.7, spared: 5.6 },
  chair: { soul: 4.6, spared: 5.4 },
  missile: { soul: 5.3, spared: 6.2 },
  roast: { soul: 4.6, spared: 6.0 },
  kaiju: { soul: 6.4, spared: 8.0 },
};

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
    return this.soulFrom().add(new THREE.Vector3(0, 2.6 + this.size().box.max.y * 0.5, 0));
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
    this.at.copy(from).addScaledVector(this.left, sway).add(new THREE.Vector3(0, (2.6 + this.size().box.max.y * 0.5) * rise, 0));
    this.turn.copy(this.face(this.cam)).multiply(tmpQ.setFromAxisAngle(new THREE.Vector3(0, 0, 1), Math.sin(u * 2.3 + 0.6) * 0.12));
    const pop = Math.max(0, (u - SOUL.rise) / SOUL.pop);
    const s = pop > 0 ? Math.max(0.001, 1 - ease(pop)) * (1 + 0.25 * Math.sin(pop * Math.PI)) : 0.85 + 0.15 * Math.min(1, u / 0.5);
    this.stretch.setScalar(s);
  }

  /** What's left of them, baked where it lies, sooted as it is; their own coat goes back to how it was for the ghost. */
  private leaveBody() {
    if (!this.who || this.pieces.length) {
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

  dispose() {
    if (this.who && this.tinted) tintAnimal(this.who, null);
    for (const d of this.disposers) d();
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

