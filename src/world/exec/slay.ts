import * as THREE from 'three';
import type { SlayMoveId } from '../../game/slayMoves';
import type { Anim } from '../types';
import { measureAnimal, tintAnimal, type Build } from './bake';
import { Bolts, Dizzy, ease, easeOut, span } from './fx';
import { rainCloud, type Cloud } from './props';
import { wordSign, type WordSign } from './props2';
import { balloon, crossbow, fryingPan, holyGrenade, lasso, mallet, staff, sword, wand, type Crossbow, type Staff, type Sword, type Wand } from './slayProps';
import { ExecStage, type ExecPose } from './stage';

/**
 * A Slayer claim, played in the middle of the dais for the whole town: the claimer (on the screen's left) does their
 * move to the one they chose (on the right). If the Storyteller says they die, they go down like an execution and
 * their ghost floats up; if not, it fizzles (the bolt flops to the ground, the sword bends like rubber) and they
 * laugh it off. All worked out from the seconds since it began, like the executions (see stage.ts), on whose stage
 * it's built: `survives` is a fizzle. The claimer's own pose comes back as `actor`.
 */

/** When each move lands, in seconds; the ghost starts up a moment later, and a fizzle plays out a little longer. */
const HIT: Record<SlayMoveId, number> = {
  crossbow: 2.6,
  balloons: 3.7,
  pan: 2.5,
  sword: 2.6,
  mallet: 2.8,
  lasso: 3.5,
  wand: 2.9,
  lightning: 3.1,
  grenade: 4.6,
};
const DOWN = 1.5;
const FIZZLE = 3.3;

const X = new THREE.Vector3(1, 0, 0);
const Y = new THREE.Vector3(0, 1, 0);
const Z = new THREE.Vector3(0, 0, 1);
const tmpQ = new THREE.Quaternion();
const BALLOONS = ['#e8504a', '#4a9ae8', '#f2c84a'];

/** A middling animal, for one we can't see. */
const someone = (): Build => ({
  box: new THREE.Box3(new THREE.Vector3(-0.3, 0, -0.3), new THREE.Vector3(0.3, 1.05, 0.3)),
  neck: new THREE.Vector3(0, 0.6, 0),
  head: new THREE.Vector3(0, 0.82, 0.05),
  mouth: new THREE.Vector3(0, 0.75, 0.3),
});

export class SlayStage extends ExecStage {
  /** The claimer as the move has them this frame (in the world, like the target's pose). */
  actor: ExecPose;
  readonly hit: number;
  private actorRoot: THREE.Object3D | null = null;
  private aBuild: Build | null = null;
  private actorTinted = false;
  /** Where each stands at the start (in the stage's frame, on the dais) and which way they face. */
  private A = new THREE.Vector3();
  private B = new THREE.Vector3();
  /** From the claimer towards the target, flat. */
  private fwd = new THREE.Vector3();
  private dirA = new THREE.Vector3();
  private dirT = new THREE.Vector3();
  private ready = false;
  // The claimer this frame.
  private aAt = new THREE.Vector3();
  private aTurn = new THREE.Quaternion();
  private aStretch = new THREE.Vector3(1, 1, 1);
  private aAnim: Anim = 'idle';
  /** The move has the claimer doing something of its own after it lands (dizzy, frazzled), not just pleased or not. */
  private aBusy = false;
  // Each move's kit.
  private bow: Crossbow | null = null;
  private balls: THREE.Group[] = [];
  private pan: THREE.Group | null = null;
  private sabre: Sword | null = null;
  private hammer: THREE.Group | null = null;
  private rope: { loop: THREE.Group; rope: THREE.Mesh } | null = null;
  private stick: Wand | null = null;
  private stars: THREE.Mesh[] = [];
  private rod: Staff | null = null;
  private nimbus: Cloud | null = null;
  private zap: Bolts | null = null;
  private bomb: THREE.Group | null = null;
  private dizzyA: Dizzy | null = null;
  private dizzyT: Dizzy | null = null;
  private signs = new Map<string, WordSign>();

  constructor(
    readonly move: SlayMoveId,
    kill: boolean,
    spot: { x: number; z: number; ry: number; y: number },
    sound?: (name: string) => void,
  ) {
    const hit = HIT[move] ?? HIT.crossbow;
    super('slay', !kill, spot, sound, { soul: hit + DOWN, spared: hit + FIZZLE });
    this.hit = hit;
    this.actor = { pos: new THREE.Vector3(), quat: new THREE.Quaternion(), scale: new THREE.Vector3(1, 1, 1), anim: 'idle', visible: true, tag: true, ghost: false };
  }

  /** As the executions' update, with the claimer's animal too (if they can be seen here). */
  override update(t: number, who: { root: THREE.Object3D } | null, camera?: THREE.Camera, actor?: { root: THREE.Object3D } | null): ExecPose {
    if (actor) this.actorRoot = actor.root;
    const pose = super.update(t, who, camera);
    // Both name tags stay up through it (the caption says who's who), until the one chosen goes down.
    pose.tag = !pose.ghost && (this.survives || t < this.hit + 0.2);
    this.actor = {
      pos: this.world(this.aAt),
      quat: this.group.quaternion.clone().multiply(this.aTurn),
      scale: this.aStretch.clone(),
      anim: this.aAnim,
      visible: true,
      tag: true,
      ghost: false,
    };
    return pose;
  }

  protected override noBody(): boolean {
    return this.move === 'wand';
  }

  protected override frazzled(): boolean {
    return this.move === 'lightning' || this.move === 'grenade';
  }

  private aSize(): Build {
    if (!this.aBuild && this.actorRoot) this.aBuild = measureAnimal(this.actorRoot);
    return this.aBuild ?? someone();
  }

  /** Where each stands: far enough apart for whoever they are, facing each other and a little towards us. */
  private setup() {
    if (this.ready && (this.aBuild || !this.actorRoot)) return;
    this.ready = true;
    const a = this.aSize().box;
    const b = this.size().box;
    const g = THREE.MathUtils.clamp(1.0 + Math.max(a.max.z, -a.min.z, b.max.z, -b.min.z) * 0.9, 1.15, 1.9);
    const mid = new THREE.Vector3(0, this.P, 0).addScaledVector(this.cam, -0.2);
    this.A.copy(mid).addScaledVector(this.left, g);
    this.B.copy(mid).addScaledVector(this.left, -g);
    this.fwd.copy(this.B).sub(this.A).setY(0).normalize();
    this.dirA.copy(this.fwd).multiplyScalar(0.85).addScaledVector(this.cam, 0.5).normalize();
    this.dirT.copy(this.fwd).multiplyScalar(-0.85).addScaledVector(this.cam, 0.5).normalize();
  }

  // ---------------------------------------------------------------- the two of them

  /** The claimer's paw, out in front at chest height (in the stage's frame), wherever they've got to. */
  private paw(up = 0.5, out = 1): THREE.Vector3 {
    const b = this.aSize();
    return this.aAt
      .clone()
      .addScaledVector(this.fwd, (b.box.max.z * 0.55 + 0.12) * out)
      .addScaledVector(this.cam, 0.14)
      .addScaledVector(Y, Math.max(0.3, b.box.max.y * up));
  }

  /** A spot on the target's body (by fractions of their height), wherever their pose has taken them. */
  private onTarget(up: number, front = 0.3): THREE.Vector3 {
    const b = this.size();
    const local = new THREE.Vector3(0, b.box.max.y * up, b.box.max.z * front).multiply(this.stretch).applyQuaternion(this.turn);
    return this.at.clone().add(local);
  }

  private tall(): number {
    return this.size().box.max.y;
  }

  /** Points `o` (its +z) from `from` at `to`, both in the stage's frame, and turns it `roll` about that. */
  private aim(o: THREE.Object3D, from: THREE.Vector3, to: THREE.Vector3, roll = 0) {
    const d = to.clone().sub(from);
    o.position.copy(from);
    o.quaternion.setFromAxisAngle(Y, Math.atan2(d.x, d.z)).multiply(tmpQ.setFromAxisAngle(X, -Math.atan2(d.y, Math.hypot(d.x, d.z))));
    if (roll) o.quaternion.multiply(tmpQ.setFromAxisAngle(Z, roll));
  }

  /** Over they go, stiff as a board, towards `away` (in the stage's frame), `u` seconds after the hit. */
  private topple(u: number, away: THREE.Vector3, from = 0.12, len = 0.45) {
    const body = this.size().box;
    const fall = u > from ? Math.min(1, ((u - from) / len) ** 2) : 0;
    const land = from + len;
    const bounce = u > land ? Math.exp(-(u - land) * 8) * Math.sin((u - land) * 22) * 0.08 : 0;
    const tip = (Math.PI / 2 - 0.04) * fall - Math.abs(bounce);
    const axis = new THREE.Vector3(-away.z, 0, away.x);
    const base = this.at.clone();
    const heel = base.clone().addScaledVector(away, Math.max(0.05, body.max.x * 0.8));
    tmpQ.setFromAxisAngle(axis, -tip);
    this.turn.premultiply(tmpQ);
    this.at.sub(heel).applyQuaternion(tmpQ).add(heel);
    const at = this.hit + land;
    this.sfx('thud', at, this.hit + u);
    this.once(`thud${at}`, at, this.hit + u, () => this.bursts.add(at, 'dust', this.world(base.clone().addScaledVector(away, body.max.y * 0.6)), 0.6));
    this.setExtraVec('soulFrom', base.clone().addScaledVector(away, body.max.y * 0.5));
  }

  private daze(which: 'a' | 't', t: number, at: THREE.Vector3 | null, r = 0.22) {
    let d = which === 'a' ? this.dizzyA : this.dizzyT;
    if (!d) {
      d = new Dizzy(4);
      this.fx.add(d.group);
      this.disposers.push(() => d!.dispose());
      if (which === 'a') this.dizzyA = d;
      else this.dizzyT = d;
    }
    d.update(t, at ? this.world(at) : null, r, this.camera);
  }

  /** A sign that pops up over a spot with a little overshoot, and goes again. */
  private sign(name: string, text: string, t: number, from: number, to: number, at: THREE.Vector3, w = 0.9, h = 0.42) {
    let s = this.signs.get(name);
    if (!s) {
      s = wordSign(text, w, h);
      this.group.add(s.group);
      this.signs.set(name, s);
      this.disposers.push(s.dispose);
    }
    const p = t < from ? 0 : t < to ? easeOut((t - from) / 0.22) * (1 + 0.25 * Math.sin(Math.min(1, (t - from) / 0.4) * Math.PI)) : Math.max(0, 1 - (t - to) / 0.18);
    s.group.scale.setScalar(Math.max(0.001, p));
    s.group.visible = p > 0.002;
    s.group.position.copy(at);
    s.group.quaternion.copy(this.face(this.cam));
  }

  private tintActor(color: string, k: number) {
    if (!this.actorRoot) return;
    tintAnimal(this.actorRoot, new THREE.Color(color), k);
    this.actorTinted = true;
  }

  /** A prop of the move's own, popped in and out with the rest (and a size bigger than life, to read from afar). */
  private prop<T extends THREE.Object3D>(o: T, size = this.kit()): T {
    o.userData.size = size;
    this.props.add(o);
    return o;
  }

  /** How big the kit is drawn: a size up from life, more for a bigger claimer. */
  private kit(): number {
    return THREE.MathUtils.clamp(this.aSize().box.max.y * 1.2, 1.25, 1.9);
  }

  protected override popProps(t: number, where: THREE.Vector3[]) {
    super.popProps(t, where);
    for (const c of this.props.children) c.scale.multiplyScalar(c.userData.size ?? 1);
  }

  // ---------------------------------------------------------------- the show

  protected override more(t: number): { anim: Anim; visible: boolean } {
    this.setup();
    const kill = !this.survives;
    const u = t - this.hit;
    this.aAt.copy(this.A);
    this.aTurn.copy(this.face(this.dirA));
    this.aStretch.set(1, 1, 1);
    this.aAnim = 'idle';
    this.aBusy = false;
    this.at.copy(this.B);
    this.turn.copy(this.face(this.dirT));
    // Both of them in the shot, and whatever's overhead.
    const top = Math.max(this.tall(), this.aSize().box.max.y);
    const half = this.A.distanceTo(this.B) / 2;
    this.frame.look = this.world(this.A.clone().lerp(this.B, 0.5).setY(this.P + Math.min(1.2, top * 0.6)));
    this.frame.radius = Math.max(2.0, half + 0.8 + Math.max(0, top - 1.2) * 0.6);
    let anim: Anim = u > -1.1 && u < 0 ? 'cry' : 'idle';
    if (!kill && u > 0.45) anim = 'laugh';
    // The one chosen, after it lands (before any kit, which may be stuck to them).
    if (kill && u >= 0) anim = this.downs(t, u);
    else if (!kill) this.shrugs(t, u);
    switch (this.move) {
      case 'crossbow':
        this.crossbow(t, kill);
        break;
      case 'balloons':
        this.balloons(t, kill);
        break;
      case 'pan':
        this.panSwing(t, kill);
        break;
      case 'sword':
        this.lunge(t, kill);
        break;
      case 'mallet':
        this.bonk(t, kill);
        break;
      case 'lasso':
        this.yeehaw(t, kill);
        break;
      case 'wand':
        this.magicWand(t, kill);
        break;
      case 'lightning':
        this.storm(t, kill);
        break;
      case 'grenade':
        this.grenade(t, kill);
        break;
    }
    // Pleased with themselves, or not.
    if (u > 0.6 && !this.aBusy) this.aAnim = kill ? 'cheer' : 'cry';
    return { anim, visible: true };
  }

  /** How the one chosen goes down, by move. */
  private downs(t: number, u: number): Anim {
    const away = this.fwd.clone();
    switch (this.move) {
      case 'mallet': {
        // Squashed flat as a pancake.
        const k = easeOut(u / 0.08);
        const wob = u > 0.08 ? Math.exp(-(u - 0.08) * 6) * Math.sin((u - 0.08) * 30) * 0.06 : 0;
        this.stretch.set(1 + 0.7 * k + wob, Math.max(0.12, 1 - 0.88 * k - wob), 1 + 0.7 * k + wob);
        this.setExtraVec('soulFrom', this.B.clone());
        this.daze('t', t, u > 0.3 ? this.B.clone().setY(this.P + 0.25) : null, 0.3);
        return 'idle';
      }
      case 'wand': {
        // A spin, smaller and smaller, and gone in a twinkle.
        const k = span(u, 0, 0.9);
        this.turn.multiply(tmpQ.setFromAxisAngle(Y, ease(k) * Math.PI * 6));
        this.stretch.setScalar(Math.max(0.001, 1 - k));
        this.at.y += Math.sin(k * Math.PI) * 0.3;
        this.once('gone', this.hit + 0.9, t, () => this.bursts.add(this.hit + 0.9, 'sparkle', this.world(this.B.clone().setY(this.P + 0.4)), 1.4));
        this.sfx('pop', this.hit + 0.9, t);
        this.setExtraVec('soulFrom', this.B.clone());
        return 'cry';
      }
      case 'pan': {
        // Round and round with the clang, then over sideways.
        const k = easeOut(u / 0.7);
        this.turn.multiply(tmpQ.setFromAxisAngle(Y, k * Math.PI * 4));
        this.daze('t', t, u < 0.9 ? this.B.clone().setY(this.P + this.tall() + 0.05) : null);
        if (u > 0.7) this.topple(u - 0.7, away, 0, 0.4);
        return 'idle';
      }
      case 'lasso': {
        // Yanked off their feet towards the claimer, and flat on their face.
        const k = span(u, 0, 0.45);
        const to = this.B.clone().lerp(this.A, 0.42);
        this.at.lerpVectors(this.B, to, k);
        this.at.y += Math.sin(k * Math.PI) * 0.45;
        this.topple(u, this.fwd.clone().negate(), 0, 0.4);
        return 'cry';
      }
      case 'grenade': {
        // Up and over in the blast, sooty, flat on their back.
        const k = span(u, 0, 0.6);
        this.at.addScaledVector(away, 0.7 * k);
        this.at.y += Math.sin(k * Math.PI) * 1.1;
        this.tint('#2a2420', span(u, 0, 0.15) * 0.8);
        this.topple(u, away, 0, 0.6);
        return 'cry';
      }
      case 'lightning': {
        // A buzzing, glowing shudder, sooty, then over.
        this.tint('#2a2420', span(u, 0.1, 0.4) * 0.85);
        const shake = u < 0.7 ? Math.sin(u * 70) * 0.04 : 0;
        this.at.addScaledVector(this.left, shake);
        this.topple(u, away, 0.7, 0.45);
        return 'cry';
      }
      case 'balloons': {
        // Soaked through and bowled over.
        this.topple(u, away, 0.05, 0.5);
        return 'idle';
      }
      default: {
        // A jolt back as it lands, then over backwards.
        const jolt = Math.exp(-u * 10) * Math.min(1, u * 20) * 0.08;
        this.at.addScaledVector(away, jolt);
        this.topple(u, away, 0.25, 0.45);
        return 'idle';
      }
    }
  }

  /** Nothing happens: a flinch at most, and they laugh it off. */
  private shrugs(t: number, u: number) {
    if (this.move === 'pan') {
      // A duck just in time.
      const d = span(u, -0.3, -0.1) * (1 - span(u, 0.25, 0.5));
      this.stretch.set(1 + d * 0.15, 1 - d * 0.4, 1 + d * 0.15);
    } else if (this.move === 'mallet' && u > 0) {
      // Boing: squashed for a moment, then springing back.
      const k = u < 0.08 ? u / 0.08 : Math.exp(-(u - 0.08) * 5) * Math.cos((u - 0.08) * 22);
      this.stretch.set(1 + k * 0.25, 1 - k * 0.35, 1 + k * 0.25);
      this.sfx('boing', this.hit + 0.05, t);
    } else if (this.move === 'grenade' && u > -0.5 && u < 0.1) {
      // Eyes shut, waiting for the bang.
      this.stretch.set(1.04, 0.9, 1.04);
    }
  }

  // ---------------------------------------------------------------- the moves

  private crossbow(t: number, kill: boolean) {
    if (!this.bow) this.bow = crossbow();
    const B = this.bow;
    if (!B.group.parent) this.prop(B.group);
    const grip = this.paw(0.55);
    this.popProps(t, [this.world(grip)]);
    this.aAnim = t > 0.3 ? 'fish' : 'idle';
    // Up from pointing at the ground to aimed, with a little wobble while aiming.
    const aimK = span(t, 0.4, 1.4);
    const wob = t < 2.1 ? Math.sin(t * 5) * 0.05 * (1 - span(t, 1.5, 2.0)) : 0;
    const target = this.B.clone().setY(this.P + this.tall() * 0.55);
    const down = grip.clone().addScaledVector(this.fwd, 1).setY(this.P);
    const look = down.lerp(target, aimK).add(new THREE.Vector3(0, wob, 0));
    const kick = t > 2.1 ? Math.exp(-(t - 2.1) * 10) * 0.25 : 0;
    this.aim(B.group, grip, look.add(new THREE.Vector3(0, kick, 0)));
    this.sfx('twang', 2.1, t);
    if (t < 2.1) {
      // Loaded.
      if (B.bolt.parent !== B.group) B.group.add(B.bolt);
      B.bolt.position.copy(B.nock);
      B.bolt.quaternion.identity();
      return;
    }
    if (B.bolt.parent !== this.props) this.prop(B.bolt);
    const muzzle = grip.clone().addScaledVector(this.fwd, 0.3).setY(grip.y + 0.05);
    if (kill) {
      // Straight and true, and stuck there as they go over.
      const chest = this.onTarget(0.55, 0.3);
      if (t < this.hit) {
        const k = (t - 2.1) / (this.hit - 2.1);
        const tip = muzzle.clone().lerp(chest, k);
        const way = chest.clone().sub(muzzle).normalize();
        this.aim(B.bolt, tip.clone().addScaledVector(way, -0.45), tip);
      } else {
        const way = this.onTarget(0.55, -0.6).sub(chest).normalize();
        this.aim(B.bolt, chest.clone().addScaledVector(way, -0.36), chest);
      }
      this.sfx('thunk', this.hit, t);
      return;
    }
    // Off it goes... runs out of puff halfway, and noses down onto the boards with a plink.
    const drop = this.A.clone().lerp(this.B, 0.6).setY(this.P + 0.08);
    const lands = this.hit + 0.3;
    const k = Math.min(1, (t - 2.1) / (lands - 2.1));
    const p = muzzle.clone().lerp(drop, k);
    p.y = THREE.MathUtils.lerp(muzzle.y, drop.y, k * k) + Math.sin(k * Math.PI) * 0.12;
    const way = this.fwd.clone().addScaledVector(Y, -1.6 * k);
    if (k < 1) this.aim(B.bolt, p, p.clone().add(way));
    else this.aim(B.bolt, drop.clone().addScaledVector(this.fwd, -0.2), drop.clone().addScaledVector(this.fwd, 1));
    this.sfx('ding', lands, t);
  }

  private balloons(t: number, kill: boolean) {
    if (!this.balls.length) {
      for (let i = 0; i < 3; i++) {
        const b = balloon(BALLOONS[i]);
        this.prop(b, 1);
        this.balls.push(b);
      }
    }
    const grip = this.paw(0.55);
    this.popProps(t, [this.world(grip)]);
    // Each one appears in the paw, is thrown, and lands: the last one much bigger.
    const throws = [0.6, 1.6, 2.7];
    const air = this.hit - throws[2];
    this.aAnim = 'work';
    throws.forEach((at, i) => {
      const ball = this.balls[i];
      const land = at + air;
      const size = i === 2 ? 2.4 : 1;
      if (t > at - 0.25 && t < at + 0.25) this.aAnim = 'hand';
      const hitAt = this.B.clone().setY(this.P + this.tall() * (i === 2 ? 0.45 : 0.75)).addScaledVector(this.fwd, -0.1);
      this.sfx('whoosh', at, t);
      if (t < at - 0.5) {
        ball.visible = false;
        return;
      }
      ball.visible = true;
      const s = size * easeOut((t - (at - 0.5)) / 0.3);
      ball.children[0].scale.setScalar(Math.max(0.001, s));
      if (t < at) {
        ball.position.copy(grip).addScaledVector(Y, -0.1 * size);
        return;
      }
      const k = Math.min(1, (t - at) / air);
      if (kill || i < 2) {
        // Splat, every one.
        ball.position.lerpVectors(grip, hitAt, k).addScaledVector(Y, Math.sin(k * Math.PI) * 0.9);
        ball.visible = k < 1;
        this.sfx('splash', land, t);
        this.once(`splash${i}`, land, t, () => this.bursts.add(land, 'splash', this.world(hitAt), i === 2 ? 1.6 : 0.8));
        return;
      }
      // The big one just bounces off them, and rolls away.
      const bounceAt = hitAt.clone().addScaledVector(this.fwd, -0.15);
      if (k < 1) ball.position.lerpVectors(grip, bounceAt, k).addScaledVector(Y, Math.sin(k * Math.PI) * 0.9);
      else {
        const v = t - land;
        const away = this.cam.clone().multiplyScalar(0.7).addScaledVector(this.fwd, -0.5);
        ball.position.copy(bounceAt).addScaledVector(away, Math.min(1.4, v * 1.6));
        ball.position.y = Math.max(this.P, bounceAt.y + v * 2.2 - 9 * v * v + Math.abs(Math.sin(v * 7)) * 0.12 * Math.exp(-v * 2));
      }
      this.sfx('boing', land, t);
    });
    // Wetter with every one that bursts.
    const soak = throws.reduce((sum, at, i) => sum + span(t, at + air, at + air + 0.2) * (i < 2 ? 0.12 : kill ? 0.2 : 0), 0);
    if (soak > 0) this.tint('#5a8fd0', soak);
  }

  private panSwing(t: number, kill: boolean) {
    if (!this.pan) this.pan = this.prop(fryingPan());
    const b = this.aSize().box;
    // Up close: right in front of them.
    const reach = this.B.clone().addScaledVector(this.fwd, -(Math.max(b.max.z, 0.3) + Math.max(this.size().box.max.z, 0.3) + 0.25));
    const walk = span(t, 0.5, 1.4);
    this.aAt.lerpVectors(this.A, reach, walk);
    if (t > 0.5 && t < 1.4) this.aAnim = 'run';
    else this.aAnim = 'work';
    this.aTurn.copy(this.face(t > 0.5 ? this.fwd.clone().addScaledVector(this.cam, 0.25).normalize() : this.dirA));
    const grip = this.paw(0.55, 0.8);
    this.popProps(t, [this.world(this.paw(0.55))]);
    // Wound back over the shoulder, then round in a flat arc.
    const head = this.B.clone().setY(this.P + this.tall() * 0.8);
    const wind = span(t, 1.5, 2.1);
    const swing = span(t, this.hit - 0.25, this.hit + (kill ? 0 : 0.3));
    const back = -1.9 * wind;
    let ang = back + (Math.abs(back) + (kill ? 0 : 1.8)) * swing;
    this.sfx('whoosh', this.hit - 0.25, t);
    if (!kill && t > this.hit) {
      // Swung right round, and the claimer with it, dizzy.
      const v = t - this.hit;
      const spin = easeOut(v / 1.0) * Math.PI * 2;
      this.aTurn.multiply(tmpQ.setFromAxisAngle(Y, -spin));
      ang += spin;
      this.daze('a', t, v > 0.4 && v < 2.6 ? this.aAt.clone().setY(this.P + this.aSize().box.max.y + 0.05) : null);
      this.sfx('wahwah', this.hit + 0.9, t);
      this.aAnim = v > 1.0 ? 'cry' : 'work';
      this.aBusy = true;
    }
    const dir = this.fwd.clone().applyAxisAngle(Y, ang);
    const at = grip.clone().setY(Math.max(grip.y, head.y - 0.15));
    this.aim(this.pan, at, at.clone().add(dir));
    if (kill) {
      this.sfx('bong', this.hit, t);
      this.once('bong', this.hit, t, () => this.bursts.add(this.hit, 'sparkle', this.world(head), 0.8));
    }
  }

  private lunge(t: number, kill: boolean) {
    if (!this.sabre) this.sabre = sword();
    const S = this.sabre;
    if (!S.group.parent) this.prop(S.group);
    const b = this.aSize().box;
    const reach = this.B.clone().addScaledVector(this.fwd, -(Math.max(b.max.z, 0.3) + Math.max(this.size().box.max.z, 0.3) + 0.55));
    // En garde (point up), then a dash and a lunge.
    const dash = span(t, 1.7, this.hit - 0.1);
    this.aAt.lerpVectors(this.A, reach, dash);
    this.aAnim = t > 1.7 && t < this.hit - 0.1 ? 'run' : t > 0.3 ? 'fish' : 'idle';
    if (t > 1.7) this.aTurn.copy(this.face(this.fwd.clone().addScaledVector(this.cam, 0.2).normalize()));
    const grip = this.paw(0.55);
    this.popProps(t, [this.world(this.paw(0.55))]);
    const up = span(t, 0.3, 0.8) * (1 - span(t, 1.5, 1.8));
    const chest = this.onTarget(0.5, 0.1);
    const ahead = grip.clone().addScaledVector(this.fwd, 1).lerp(grip.clone().addScaledVector(Y, 1), up);
    const point = t > 1.8 ? chest : ahead;
    const twirl = t < 1.6 ? Math.sin(t * 9) * 0.2 * up : 0;
    this.aim(S.group, grip, point, twirl);
    this.sfx('whoosh', 1.7, t);
    if (kill) {
      this.sfx('thunk', this.hit, t);
      S.segs.forEach((s) => s.rotation.set(0, 0, 0));
      return;
    }
    // Boing: the blade folds up against them like rubber, and wobbles.
    const u = t - this.hit + 0.1;
    const bend = u > 0 ? Math.min(1, u / 0.12) * 0.75 + Math.exp(-u * 4) * Math.sin(u * 26) * 0.25 : 0;
    S.segs.forEach((s, i) => s.rotation.set(bend * (0.6 + i * 0.4), 0, 0));
    this.sfx('boing', this.hit, t);
  }

  private bonk(t: number, kill: boolean) {
    const b = this.aSize().box;
    const len = THREE.MathUtils.clamp(this.tall() * 1.2 + 0.4, 1.0, 2.2);
    if (!this.hammer) this.hammer = this.prop(mallet(len), 1);
    // Over beside them, then up and over, straight down on their head.
    const reach = this.B.clone().addScaledVector(this.fwd, -(len * 0.85 + Math.max(b.max.z, 0.25) * 0.3));
    const walk = span(t, 0.5, 1.3);
    this.aAt.lerpVectors(this.A, reach, walk);
    this.aAnim = t > 0.5 && t < 1.3 ? 'walk' : t > 1.3 ? 'cheer' : 'work';
    this.aTurn.copy(this.face(t > 0.5 ? this.fwd.clone().addScaledVector(this.cam, 0.25).normalize() : this.dirA));
    const grip = this.paw(0.6, 0.7);
    this.popProps(t, [this.world(this.paw(0.5))]);
    // The angle of the handle from straight ahead: down at the floor, up and back over the shoulder, then down.
    const lift = span(t, 1.4, 2.4);
    const slam = span(t, this.hit - 0.18, this.hit);
    let pitch = -0.3 + lift * 2.4 - slam * (2.1 + 0.15);
    if (!kill && t > this.hit) pitch += Math.exp(-(t - this.hit) * 5) * Math.sin((t - this.hit) * 16) * 0.35 + span(t, this.hit, this.hit + 0.15) * 0.25;
    const dir = this.fwd.clone().multiplyScalar(Math.cos(pitch)).addScaledVector(Y, Math.sin(pitch));
    this.aim(this.hammer, grip, grip.clone().add(dir));
    this.sfx('whoosh', this.hit - 0.18, t);
    if (kill) {
      this.sfx('thunk', this.hit, t);
      this.once('bonk', this.hit, t, () => this.bursts.add(this.hit, 'dust', this.world(this.B.clone().setY(this.P + 0.1)), 0.9));
      if (t > this.hit) this.frame.shake = Math.exp(-(t - this.hit) * 6) * 0.8;
    } else this.sfx('squeak', this.hit, t);
  }

  private yeehaw(t: number, kill: boolean) {
    if (!this.rope) {
      this.rope = lasso();
      this.prop(this.rope.loop, 1);
      this.prop(this.rope.rope, 1);
    }
    const R = this.rope;
    const grip = this.paw(0.6);
    this.popProps(t, [this.world(grip)]);
    const throwAt = 2.5;
    const land = this.hit - 0.35;
    const overhead = this.aAt.clone().setY(this.P + this.aSize().box.max.y + 0.35);
    const ring = 0.38;
    let at: THREE.Vector3;
    let r = ring;
    let tilt = 0;
    this.aAnim = t > 0.3 && t < throwAt + 0.2 ? 'hand' : 'work';
    if (t < throwAt) {
      // Round and round over their head.
      const a = t * 9;
      at = overhead.clone().add(new THREE.Vector3(Math.cos(a) * 0.18, Math.sin(a * 2) * 0.03, Math.sin(a) * 0.18));
      tilt = 0.2;
      for (let n = 0; n < 4; n++) this.sfx('whoosh', 0.5 + n * 0.5, t);
    } else {
      const target = kill ? this.B.clone().setY(this.P + this.tall() + 0.15) : this.A.clone().lerp(this.B, 0.82).setY(this.P + 0.08);
      const k = span(t, throwAt, land);
      at = overhead.clone().lerp(target, k).addScaledVector(Y, Math.sin(k * Math.PI) * 0.6);
      if (t > land) {
        const v = t - land;
        if (kill) {
          // Down over them, pulled tight round the middle, and then the yank (they go with it).
          const drop = span(v, 0, 0.25);
          at = this.onTarget(0.5 - 0.1 * (1 - drop) + (1 - drop) * 0.6, 0);
          r = THREE.MathUtils.lerp(ring, Math.max(0.16, this.size().box.max.x * 1.05), span(v, 0.15, 0.35));
        } else {
          // Flop. Nothing in it: pulled back in, empty.
          const back = span(v, 0.5, 1.4);
          at = target.clone().lerp(this.A.clone().lerp(this.B, 0.6).setY(this.P + 0.08), back);
          r = ring * (1 - back * 0.4);
          this.sfx('flump', land, t);
          this.sfx('wahwah', land + 0.6, t);
        }
      }
    }
    R.loop.position.copy(at);
    R.loop.rotation.set(tilt, 0, 0);
    R.loop.children[0].scale.setScalar(r);
    // The rope from the paw to the loop's knot.
    const knot = at.clone().addScaledVector(this.fwd.clone().negate(), r);
    const d = knot.clone().sub(grip);
    R.rope.position.copy(grip);
    R.rope.quaternion.setFromUnitVectors(Y, d.clone().normalize());
    R.rope.scale.set(1, Math.max(0.001, d.length()), 1);
    if (kill) {
      this.sfx('grab', this.hit, t);
      if (t > this.hit - 0.1 && t < this.hit + 0.5) this.aAnim = 'work';
      // Leaning back into the yank.
      const lean = span(t, this.hit - 0.1, this.hit + 0.1) * (1 - span(t, this.hit + 0.5, this.hit + 0.8));
      this.aTurn.multiply(tmpQ.setFromAxisAngle(new THREE.Vector3(1, 0, 0), -lean * 0.3));
    }
  }

  private magicWand(t: number, kill: boolean) {
    if (!this.stick) this.stick = wand();
    const W = this.stick;
    if (!W.group.parent) this.prop(W.group);
    const grip = this.paw(0.6);
    this.popProps(t, [this.world(grip)]);
    this.aAnim = t > 0.3 ? 'fish' : 'idle';
    // A swish round in circles, then a flick at them.
    const target = this.B.clone().setY(this.P + this.tall() * 0.6);
    const circling = t > 0.5 && t < 2.0 ? 1 : 0;
    const a = t * 7;
    const point = grip.clone().addScaledVector(this.fwd, 1).add(new THREE.Vector3(0, 0.6 + Math.sin(a) * 0.25 * circling, 0).addScaledVector(this.cam, Math.cos(a) * 0.25 * circling));
    const flick = span(t, 2.0, 2.2);
    this.aim(W.group, grip, point.lerp(target, flick));
    const tip = this.world(W.tip.clone().applyQuaternion(W.group.quaternion).add(W.group.position));
    for (let n = 0; n < 5; n++) {
      const at = 0.6 + n * 0.28;
      this.once(`trail${n}`, at, t, () => this.bursts.add(at, 'sparkle', tip, 0.35));
    }
    this.sfx('twinkle', 0.6, t);
    this.sfx('beam', 2.2, t);
    // The stars, streaming across (or, when it fizzles, a little bunch of flowers out of the end).
    if (!this.stars.length) {
      const mat = new THREE.MeshBasicMaterial({ color: '#fff2a0' });
      const geo = new THREE.OctahedronGeometry(0.06, 0);
      this.disposers.push(() => (geo.dispose(), mat.dispose()));
      for (let i = 0; i < 7; i++) {
        const m = new THREE.Mesh(geo, mat);
        this.group.add(m);
        this.stars.push(m);
      }
    }
    const from = W.tip.clone().applyQuaternion(W.group.quaternion).add(W.group.position);
    this.stars.forEach((m, i) => {
      const k = (t - 2.2 - i * 0.07) / (this.hit - 2.2);
      m.visible = kill && k > 0 && k < 1;
      if (!m.visible) return;
      m.position.lerpVectors(from, target, k).add(new THREE.Vector3(0, Math.sin(k * Math.PI * 2 + i) * 0.1, 0));
      m.rotation.set(t * 5 + i, t * 3, 0);
    });
    if (kill) return;
    const bloom = span(t, this.hit - 0.1, this.hit + 0.2) * (1 + 0.3 * Math.sin(Math.min(1, Math.max(0, t - this.hit) / 0.3) * Math.PI));
    W.posy.scale.setScalar(Math.max(0.001, bloom * 1.6));
    this.sfx('pop', this.hit - 0.1, t);
    this.once('posy', this.hit, t, () => this.bursts.add(this.hit, 'confetti', tip, 0.5));
  }

  private storm(t: number, kill: boolean) {
    if (!this.rod) this.rod = staff();
    const S = this.rod;
    if (!S.group.parent) this.prop(S.group);
    if (!this.nimbus) {
      this.nimbus = rainCloud();
      this.nimbus.drops.visible = false;
      this.group.add(this.nimbus.group);
      this.disposers.push(() => {
        this.nimbus?.dispose();
        this.nimbus?.group.removeFromParent();
      });
    }
    if (!this.zap) {
      this.zap = new Bolts(30);
      this.fx.add(this.zap.group);
      this.disposers.push(() => this.zap?.dispose());
    }
    const grip = this.paw(0.45, 0.8);
    this.popProps(t, [this.world(grip)]);
    // The staff raised high, the orb glowing brighter and brighter.
    const raise = span(t, 0.3, 0.9);
    this.aAnim = t > 0.3 ? 'hand' : 'idle';
    S.group.position.copy(grip).addScaledVector(Y, raise * 0.35 - 0.2);
    S.group.rotation.set(0, 0, 0);
    S.group.quaternion.premultiply(tmpQ.setFromAxisAngle(new THREE.Vector3(-this.fwd.z, 0, this.fwd.x), -0.25 * raise));
    const glow = span(t, 0.6, 2.6);
    (S.orb.material as THREE.MeshBasicMaterial).color.setRGB(0.6 + glow * 0.4, 0.85 + glow * 0.15, 1);
    S.orb.scale.setScalar(1 + glow * 0.5 + Math.sin(t * 20) * 0.08 * glow);
    // A little storm cloud gathering over them (or, when it fizzles, drifting over to the claimer instead).
    const over = (p: THREE.Vector3, h: number) => p.clone().setY(this.P + h + 0.8);
    const tH = this.tall();
    const aH = this.aSize().box.max.y;
    const C = this.nimbus.group;
    const gather = span(t, 0.8, 2.0);
    let cloudAt = over(this.B, tH);
    if (!kill) cloudAt = cloudAt.lerp(over(this.A, aH), span(t, this.hit - 0.7, this.hit - 0.1));
    C.position.copy(cloudAt);
    C.quaternion.copy(this.face(this.cam));
    C.scale.setScalar(Math.max(0.001, gather * 1.15 * (t > this.end - 0.5 ? Math.max(0, (this.end - 0.2 - t) / 0.3) : 1)));
    C.visible = gather > 0.01;
    this.sfx('rumble', 1.0, t);
    this.sfx('charge', 2.2, t);
    this.frame.low = 0.12;
    const u = t - this.hit;
    const strike = kill ? (u > 0 && u < 0.7 ? 1 : 0) : u > 0 && u < 0.25 ? 0.6 : 0;
    const from = this.world(cloudAt.clone().addScaledVector(Y, -0.15));
    const to = kill ? this.world(this.onTarget(0.8, 0)) : this.world(this.aAt.clone().setY(this.P + aH * 0.95));
    const paths: [THREE.Vector3, THREE.Vector3][] = strike ? [[from, to]] : [];
    if (kill && strike) paths.push([this.world(S.top.clone().applyQuaternion(S.group.quaternion).add(S.group.position)), from]);
    this.zap.update(t, paths, strike, kill ? 0.14 : 0.06);
    if (kill) {
      this.sfx('boom', this.hit, t);
      this.sfx('crackle', this.hit + 0.05, t);
      this.once('flash', this.hit, t, () => this.bursts.add(this.hit, 'flash', to, 2.2));
      if (u > 0 && u < 0.4) this.frame.shake = 0.5;
      return;
    }
    // Fizzle: a feeble little zap on the claimer's own head, a puff of soot, and a frazzled look.
    this.sfx('fizzle', this.hit, t);
    this.once('own', this.hit, t, () => this.bursts.add(this.hit, 'soot', to, 0.6));
    this.tintActor('#2a2420', span(u, 0, 0.1) * 0.6 * (1 - span(u, 2.0, 2.8)));
    if (u > 0) this.aAnim = u < 0.5 ? 'idle' : 'cry';
    this.aBusy = u > 0;
    if (u > 0 && u < 0.5) this.aStretch.set(1.05, 1.08 + Math.sin(u * 50) * 0.04, 1.05);
  }

  private grenade(t: number, kill: boolean) {
    if (!this.bomb) this.bomb = this.prop(holyGrenade());
    const G = this.bomb;
    const grip = this.paw(0.6);
    this.popProps(t, [this.world(grip)]);
    const top = this.aAt.clone().setY(this.P + this.aSize().box.max.y + 0.3);
    // Held up high to a heavenly "ahh", then the count (getting it wrong), and the lob.
    const lift = span(t, 0.3, 0.8);
    const lob = 3.4;
    const lands = this.hit - 0.6;
    this.aAnim = t > 0.3 && t < lob + 0.2 ? 'hand' : 'idle';
    this.sfx('ahh', 0.4, t);
    const held = grip.clone().lerp(top, lift);
    const floor = this.B.clone().addScaledVector(this.fwd, -0.55).setY(this.P);
    if (t < lob) G.position.copy(held);
    else {
      const k = span(t, lob, lands);
      G.position.lerpVectors(held, floor, k).addScaledVector(Y, Math.sin(k * Math.PI) * 1.0);
      if (t > lands) {
        // A bounce and a roll, then sat there fizzing.
        const v = t - lands;
        G.position.copy(floor).addScaledVector(this.fwd, Math.min(0.25, v * 0.8));
        G.position.y = this.P + Math.max(0, Math.sin(Math.min(1, v / 0.25) * Math.PI) * 0.12);
      }
    }
    G.rotation.set(t > lob ? (t - lob) * 6 : 0, 0, 0);
    if (t > lob + (lands - lob) * 0.99) G.rotation.set(0, 0, Math.sin(t * 30) * 0.08);
    const sign = this.aAt.clone().setY(this.P + this.aSize().box.max.y + 0.75).addScaledVector(this.cam, 0.2);
    const counts: [string, number, number][] = [
      ['One…', 1.0, 1.55],
      ['Two…', 1.6, 2.15],
      ['Five!', 2.2, 2.65],
      ['Three!', 2.7, 3.4],
    ];
    counts.forEach(([word, from, to]) => {
      this.sign(word, word, t, from, to, sign, 0.9, 0.42);
      this.sfx('tick', from, t);
    });
    this.sfx('whoosh', lob, t);
    this.sfx('land', lands, t);
    this.sfx('fuse', lands + 0.05, t);
    const at = this.world(G.position.clone().setY(this.P + 0.25));
    if (t > lands && t < this.hit) this.once('fizz', lands, t, () => this.bursts.add(lands, 'sparks', at, 0.4));
    const u = t - this.hit;
    if (kill) {
      G.visible = u < 0;
      this.sfx('boom', this.hit, t);
      this.once('blast', this.hit, t, () => {
        this.bursts.add(this.hit, 'flash', at, 1.4);
        this.bursts.add(this.hit, 'fire', at, 0.6);
        this.bursts.add(this.hit + 0.1, 'smoke', at, 1.0);
        this.bursts.add(this.hit + 0.05, 'soot', at, 0.8);
      });
      if (u > 0 && u < 0.6) this.frame.shake = 0.9 * (1 - u / 0.6);
      return;
    }
    // A party popper: confetti, a little flag, and a sorry toot.
    this.sfx('flags', this.hit, t);
    this.once('popper', this.hit, t, () => {
      this.bursts.add(this.hit, 'confetti', at, 1);
      this.bursts.add(this.hit + 0.05, 'sparkle', at, 0.8);
    });
    this.sign('bang', 'bang.', t, this.hit + 0.05, this.end - 0.6, this.B.clone().addScaledVector(this.fwd, -0.55).setY(this.P + 0.55).addScaledVector(this.cam, 0.25), 0.6, 0.3);
  }

  override dispose() {
    if (this.actorRoot && this.actorTinted) tintAnimal(this.actorRoot, null);
    super.dispose();
  }
}

export const SLAY_HIT = HIT;
