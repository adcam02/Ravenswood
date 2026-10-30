import * as THREE from 'three';
import type { ExecMethod } from '../../state/types';
import { disposeObject } from '../items';
import type { Anim } from '../types';
import { BakedPiece, bakeAnimal, freeBake } from './bake';
import { Bolts, Dizzy, Mushroom, ease, easeOut, hash, span } from './fx';
import { crater } from './props';
import {
  bath,
  bomb,
  brute,
  cliff,
  cord,
  dove,
  grandPiano,
  hillCross,
  littleCar,
  magicBox,
  magician,
  mincer,
  parachute,
  partner,
  saw,
  shades,
  sniper,
  stretchCord,
  sunset,
  weightBench,
  wordSign,
  type Bath,
  type Bomb,
  type Brute,
  type Car,
  type Cliff,
  type Dove,
  type HillCross,
  type MagicBox,
  type Magician,
  type Mincer,
  type Piano,
  type Sniper,
  type WeightBench,
  type WordSign,
} from './props2';
import { ExecStage, basis } from './stage';

/**
 * The newer ways to be executed, on the same stage as the others (see stage.ts): the bench press, the 360 no scope,
 * the bath and the toaster, the nuclear bomb, the cross on the hill, run over, Bonnie and Clyde, the failed magic
 * trick, the meat grinder, the piano and the big green brute. Slapstick and bloodless like the rest (squashed flat,
 * frazzled, a puff of smoke, a string of sausages), all worked out from the seconds since it began, each with its
 * lucky escape for someone the Storyteller spares.
 */

type More = Exclude<ExecMethod, 'hang' | 'squad' | 'guillotine' | 'chair' | 'missile' | 'roast' | 'kaiju' | 'plane' | 'pigeon' | 'moon'>;

export const MORE_METHODS: readonly More[] = ['bench', 'noscope', 'toaster', 'nuke', 'cross', 'runover', 'cliff', 'magic', 'mincer', 'piano', 'brute'];

const UP = new THREE.Vector3(0, 1, 0);
const Y = new THREE.Vector3(0, 1, 0);
const Z = new THREE.Vector3(0, 0, 1);
const tmpQ = new THREE.Quaternion();

type Shown = { anim: Anim; visible: boolean };

/** A sphere round the camera, drawn over everything: the bomb's white flash, the freeze-frame's warm wash. */
function wash(color: string) {
  const geo = new THREE.SphereGeometry(20, 16, 10);
  const material = new THREE.MeshBasicMaterial({ color, side: THREE.BackSide, transparent: true, opacity: 0, depthTest: false, depthWrite: false, fog: false });
  const mesh = new THREE.Mesh(geo, material);
  mesh.renderOrder = 20;
  mesh.frustumCulled = false;
  mesh.visible = false;
  return { mesh, material, dispose: () => (geo.dispose(), material.dispose()) };
}

export class MoreStage extends ExecStage {
  // Each way's own bits.
  private gym: WeightBench | null = null;
  private shooter: Sniper | null = null;
  private tracer: THREE.Mesh | null = null;
  private tub: Bath | null = null;
  private zap: Bolts | null = null;
  private nukeBomb: Bomb | null = null;
  private whiteout: ReturnType<typeof wash> | null = null;
  private pit2: THREE.Group | null = null;
  private ring2: THREE.Mesh | null = null;
  private sky: ReturnType<typeof sunset> | null = null;
  private hill: HillCross | null = null;
  private bird2: Dove | null = null;
  private car: Car | null = null;
  private bluff: Cliff | null = null;
  private pal: THREE.Group | null = null;
  private glasses: THREE.Group | null = null;
  private chute: THREE.Group | null = null;
  private wheelsOff: THREE.Group[] = [];
  private act: Magician | null = null;
  private box: MagicBox | null = null;
  private blade2: THREE.Group | null = null;
  private grinder: Mincer | null = null;
  private links: THREE.Mesh[] = [];
  private piano: Piano | null = null;
  private keys: THREE.Mesh[] = [];
  private shadow: THREE.Mesh | null = null;
  private hulk: Brute | null = null;
  private stars: Dizzy | null = null;
  /** Signs that pop up, by name. */
  private signs = new Map<string, WordSign>();

  // ---------------------------------------------------------------- shared

  protected override more(t: number): Shown {
    switch (this.method as More) {
      case 'bench':
        return this.bench(t);
      case 'noscope':
        return this.noscope(t);
      case 'toaster':
        return this.toaster(t);
      case 'nuke':
        return this.nuke(t);
      case 'cross':
        return this.cross(t);
      case 'runover':
        return this.runover(t);
      case 'cliff':
        return this.getaway(t);
      case 'magic':
        return this.magic(t);
      case 'mincer':
        return this.mince(t);
      case 'piano':
        return this.pianoDrop(t);
      case 'brute':
        return this.smash(t);
    }
    return { anim: 'idle', visible: true };
  }

  protected override noBody(): boolean {
    return this.method === 'nuke' || this.method === 'mincer' || this.method === 'cliff';
  }

  protected override frazzled(): boolean {
    return this.method === 'toaster';
  }

  /** Turned by `q` with its point `p` (in the animal's own frame, before stretching) at `target`. */
  private put(q: THREE.Quaternion, target: THREE.Vector3, p: THREE.Vector3) {
    this.turn.copy(q);
    this.at.copy(target).sub(p.clone().multiply(this.stretch).applyQuaternion(q));
  }

  /**
   * How thick they are front to back (a tail or a long snout would make the box too deep), and where their back is:
   * for lying them down on something.
   */
  private thick(): { depth: number; back: number } {
    const b = this.size();
    const depth = THREE.MathUtils.clamp((b.box.max.x - b.box.min.x) * 0.8, 0.28, 0.9);
    return { depth, back: Math.max(b.box.min.z, b.head.z - depth * 0.55) };
  }

  /** The middle of them, in their own frame. */
  private mid(): THREE.Vector3 {
    return this.size().box.getCenter(new THREE.Vector3());
  }

  /**
   * About where their eyes are, in their own frame as they're posed now (sitting lowers the head): from the neck
   * bone of the live animal, measured against its root.
   */
  private eyes(): THREE.Vector3 {
    const b = this.size();
    const off = new THREE.Vector3(b.head.x - b.neck.x, b.head.y - b.neck.y + 0.04, b.mouth.z - b.neck.z + 0.01);
    let neck: THREE.Object3D | undefined;
    this.who?.traverse((o) => {
      if (!neck && (o as THREE.Bone).isBone && o.name === 'neck') neck = o;
    });
    if (!neck || !this.who) return b.neck.clone().add(off);
    this.who.updateMatrixWorld(true);
    const at = this.who.worldToLocal(neck.getWorldPosition(new THREE.Vector3()));
    return at.add(off);
  }

  /** Off the platform in a puff, to stand somewhere else for the show (from `from` to `to`, at `at`). */
  private hop(t: number, at: number, from: THREE.Vector3, to: THREE.Vector3): number {
    const k = span(t, at, at + 0.3);
    this.once(`hop${at}`, at, t, () => {
      this.bursts.add(at, 'poof', this.world(from.clone().setY(from.y + 0.5)), 0.8);
      this.bursts.add(at + 0.2, 'poof', this.world(to.clone().setY(to.y + 0.5)), 0.8);
    });
    this.sfx('poof', at, t);
    return k;
  }

  /** A sign that pops up over a spot with a little overshoot, and goes again. */
  private sign(name: string, text: string, w: number, h: number, t: number, from: number, to: number, at: THREE.Vector3, colours?: { bg: string; fg: string; border?: string }) {
    let s = this.signs.get(name);
    if (!s) {
      s = wordSign(text, w, h, colours);
      this.group.add(s.group);
      this.signs.set(name, s);
    }
    const p = t < from ? 0 : t < to ? easeOut((t - from) / 0.22) * (1 + 0.25 * Math.sin(Math.min(1, (t - from) / 0.4) * Math.PI)) : Math.max(0, 1 - (t - to) / 0.18);
    s.group.scale.setScalar(Math.max(0.001, p));
    s.group.visible = p > 0.002;
    s.group.position.copy(at);
    s.group.quaternion.copy(this.face(this.cam));
  }

  /** Something kept in the stage's own group (not popped in with the props), disposed with it. */
  private keep<T extends THREE.Object3D>(o: T): T {
    this.group.add(o);
    this.disposers.push(() => disposeObject(o));
    return o;
  }

  /** Dizzy stars over a spot (or none, with null). */
  private dizzyAt(t: number, at: THREE.Vector3 | null, r = 0.2) {
    if (!this.stars) {
      this.stars = new Dizzy(4);
      this.fx.add(this.stars.group);
      this.disposers.push(() => this.stars?.dispose());
    }
    this.stars.update(t, at ? this.world(at) : null, r, this.camera);
  }

  /** Where the camera is, in the stage's frame (or a spot out in front, without one). */
  private eye(): THREE.Vector3 {
    if (!this.camera) return this.cam.clone().multiplyScalar(8).setY(5);
    return this.group.worldToLocal(this.camera.getWorldPosition(new THREE.Vector3()));
  }

  // ---------------------------------------------------------------- the bench press

  private bench(t: number): Shown {
    const b = this.size();
    const P = this.P;
    // Lying face up, head away to the left, on a bench just in front of the trapdoor (so the bar runs across the
    // picture, a plate either side of them).
    const A = this.left.clone().multiplyScalar(0.55).addScaledVector(this.cam, -0.83).normalize();
    const mid = this.mid();
    const { depth, back } = this.thick();
    const len = b.box.max.y - b.box.min.y;
    const padY = 0.5;
    const centre = new THREE.Vector3(0, P, 0).addScaledVector(this.cam, 0.25);
    const chest = (b.neck.y - mid.y) * 0.55;
    const hookY = padY + depth + 0.42;
    if (!this.gym) {
      this.gym = weightBench(Math.max(0.9, len + 0.25), padY, chest, hookY);
      this.gym.group.quaternion.copy(basis(new THREE.Vector3(1, 0, 0), UP, A, UP));
      this.gym.group.position.copy(centre);
      const holder = new THREE.Group().add(this.gym.group);
      this.props.add(holder);
      this.disposers.push(this.gym.dispose);
    }
    const W = this.gym;
    this.popProps(t, [this.world(centre.clone().setY(P + 0.6))]);
    this.frame.look = this.world(centre.clone().setY(P + 0.7));
    this.frame.radius = 2.7;
    // Face up, and turned a little to the camera.
    const lay = basis(Y, Z, A, UP.clone().addScaledVector(this.cam, 0.35).normalize());
    const rest = W.rest.clone();
    const lowBar = padY + depth + 0.1;
    const drop = 2.9;
    // The bar: off the hooks, down to the chest, a long wobbling press up, and then it gets away from them.
    let y = rest.y;
    if (t > 0.5) y = rest.y + 0.08 * span(t, 0.5, 0.8);
    if (t > 0.8) y = THREE.MathUtils.lerp(rest.y + 0.08, lowBar, span(t, 0.8, 1.4));
    if (t > 1.5) y = THREE.MathUtils.lerp(lowBar, lowBar + 0.28, span(t, 1.5, 2.6)) + Math.sin(t * 9) * 0.015;
    const shake = t > 1.5 && t < drop ? span(t, 1.5, 2.6) : 0;
    let squash = 0;
    if (t > drop) {
      const u = t - drop;
      const flat = this.survives ? 0.55 : 0.2;
      const fall = Math.min(1, u / 0.14);
      const bottom = padY + depth * flat + 0.03;
      y = THREE.MathUtils.lerp(lowBar + 0.28, bottom, fall * fall);
      if (u > 0.14) y = bottom + Math.abs(Math.sin((u - 0.14) * 16)) * Math.exp(-(u - 0.14) * 8) * 0.06;
      squash = fall * (1 - flat);
      this.sfx('clank', drop + 0.12, t);
      this.once('bang', drop + 0.12, t, () => {
        this.bursts.add(drop + 0.12, 'dust', this.world(centre.clone().setY(P + padY)), 0.6);
        this.bursts.add(drop + 0.15, 'poof', this.world(centre.clone().addScaledVector(this.cam, 0.4).setY(P + padY)), 0.3);
      });
      this.frame.shake = Math.exp(-u * 5) * 0.4;
    }
    W.barbell.position.set(rest.x + Math.sin(t * 31) * 0.01 * shake, y, rest.z);
    W.barbell.rotation.x = Math.sin(t * 13) * 0.05 * shake;
    this.sfx('strain', 1.6, t);
    for (let k = 0; k < 4; k++) {
      const at = 1.7 + k * 0.3;
      this.once(`sweat${k}`, at, t, () => this.bursts.add(at, 'steam', this.world(centre.clone().addScaledVector(A, len * 0.4).setY(P + padY + depth + 0.15)), 0.35));
    }
    let anim: Anim = t > 1.4 && t < drop ? 'cry' : 'idle';
    if (this.survives && t > drop + 0.3) {
      // The plates were only blow-up ones: they let their air out with a long hiss, and the bar is light as a feather.
      const out = span(t, 3.3, 4.0);
      W.plates.forEach((p, i) => {
        const wob = Math.sin(t * 30 + i) * 0.06 * out * (1 - span(t, 4.0, 4.2));
        p.scale.set(Math.max(0.2, 1 - out * 0.75 + wob), Math.max(0.2, 1 - out * 0.75 - wob), 1);
      });
      this.sfx('hiss', 3.3, t);
      this.sfx('squeak', 3.95, t);
      // Back to their shape with a boing, and the bar tossed aside.
      const back = span(t, 4.1, 4.3);
      squash *= 1 - back;
      this.sfx('boing', 4.1, t);
      const toss = span(t, 4.3, 4.9);
      if (toss > 0) {
        W.barbell.position.y = y + toss * 0.9 - toss * toss * 0.5;
        W.barbell.position.x = rest.x + toss * 0.8;
        W.barbell.rotation.z = toss * 2.2;
        W.barbell.visible = toss < 0.98;
      }
      this.once('tossed', 4.88, t, () => this.bursts.add(4.88, 'poof', W.barbell.getWorldPosition(new THREE.Vector3()), 0.6));
      // Up off the bench, and a flex.
      const up = span(t, 4.6, 5.0);
      this.stretch.set(1 + squash * 0.35, 1 + squash * 0.35, 1 - squash);
      this.put(lay, centre.clone().setY(P + padY), new THREE.Vector3(mid.x, mid.y, back));
      if (up > 0) {
        const stand = new THREE.Vector3(0, P, 0).addScaledVector(this.cam, 0.95);
        this.at.lerp(stand, up);
        this.at.y += Math.sin(up * Math.PI) * 0.35;
        this.turn.slerp(this.face(this.cam), up);
      }
      anim = t > 5.0 ? 'cheer' : 'idle';
      return { anim, visible: true };
    }
    // Squashed flat as a pancake (and a little bigger round), stars going round.
    this.stretch.set(1 + squash * 0.3, 1 + squash * 0.3, 1 - squash);
    this.put(lay, centre.clone().setY(P + padY), new THREE.Vector3(mid.x, mid.y, back));
    if (shake > 0) this.at.add(new THREE.Vector3((hash(Math.floor(t * 40), 1) - 0.5) * 0.03 * shake, 0, 0));
    this.dizzyAt(t, t > drop + 0.3 && t < this.soulAt ? centre.clone().addScaledVector(A, len * 0.42).setY(P + padY + 0.35) : null);
    this.setExtraVec('soulFrom', centre.clone().setY(P + padY + 0.1));
    return { anim, visible: true };
  }

  // ---------------------------------------------------------------- 360 no scope

  private noscope(t: number): Shown {
    const b = this.size();
    const P = this.P;
    // The sniper on a crate out to the right, the condemned on the platform turned half to him.
    const spot = this.V(1.9, -2.7, 0);
    const target = new THREE.Vector3(0, P + b.box.max.y * 0.55, 0);
    if (!this.shooter) {
      this.shooter = sniper();
      this.shooter.group.position.copy(spot);
      this.shooter.group.quaternion.copy(this.face(new THREE.Vector3(-spot.x, 0, -spot.z)));
      const holder = new THREE.Group().add(this.shooter.group);
      this.props.add(holder);
      this.tracer = cord('#fff3a0', 0.03);
      (this.tracer.material as THREE.MeshLambertMaterial).emissive.set('#ffd84a');
      this.tracer.visible = false;
      this.keep(this.tracer);
    }
    const S = this.shooter;
    this.popProps(t, [this.world(spot.clone().setY(0.8))]);
    this.frame.look = this.world(spot.clone().multiplyScalar(0.45).setY(P * 0.7 + 0.5));
    this.frame.radius = 3.5;
    // Aim, a crouch, a leap with a full turn in the air, and fire as he comes round.
    const aim = span(t, 0.6, 1.0);
    S.gun.rotation.x = 1.1 * (1 - aim);
    const leap = span(t, 1.55, 2.25);
    const spin = this.survives ? ease((t - 1.55) / 0.7) * (Math.PI * 2 + 0.7) : ease((t - 1.55) / 0.7) * Math.PI * 2;
    S.body.rotation.y = spin;
    S.body.position.y = Math.sin(leap * Math.PI) * 0.55 - span(t, 1.3, 1.5) * (1 - span(t, 1.5, 1.6)) * 0.1;
    this.sfx('spin', 1.55, t);
    const fire = 2.25;
    this.sfx('snipe', fire, t);
    S.group.updateMatrixWorld(true);
    const muzzle = this.group.worldToLocal(S.muzzle.getWorldPosition(new THREE.Vector3()));
    // The shot: a streak of light, there and gone.
    const aimAt = this.survives ? muzzle.clone().add(new THREE.Vector3(-target.x - 3, 9, -target.z + 4)) : target;
    this.tracer!.visible = t > fire && t < fire + 0.22;
    if (this.tracer!.visible) stretchCord(this.tracer!, muzzle, muzzle.clone().lerp(aimAt, Math.min(1, (t - fire) / 0.06)));
    this.once('flash', fire, t, () => this.bursts.add(fire, 'flash', this.world(muzzle), 0.5));
    this.sign('360', '360!', 0.9, 0.42, t, 1.85, fire + 0.5, spot.clone().setY(2.6), { bg: '#fff3a0', fg: '#d8402f', border: '#d8402f' });
    this.turn.copy(this.face(spot.clone().normalize().lerp(this.cam, 0.5)));
    if (this.survives) {
      // Way off into the sky. A shrug, a sad trombone, and the condemned cheers.
      this.sign('miss', 'MISSED!', 1.3, 0.42, t, 2.7, 4.8, spot.clone().setY(2.6), { bg: '#fffaf0', fg: '#4f6a8a', border: '#4f6a8a' });
      this.sfx('wahwah', 2.8, t);
      S.body.rotation.z = span(t, 2.7, 3.0) * 0.2 * (1 - span(t, 4.3, 4.6));
      const flinch = span(t, fire, fire + 0.1) * (1 - span(t, fire + 0.6, fire + 0.9));
      this.stretch.set(1 + flinch * 0.06, 1 - flinch * 0.12, 1 + flinch * 0.06);
      return { anim: t > 3.3 ? 'cheer' : t > fire ? 'idle' : 'cry', visible: true };
    }
    this.sign('noscope', '360 NO SCOPE!', 2.2, 0.48, t, fire + 0.35, this.soulAt + 0.3, spot.clone().setY(2.6), { bg: '#fff3a0', fg: '#d8402f', border: '#d8402f' });
    this.sfx('airhorn', fire + 0.4, t);
    const hit = t - fire - 0.06;
    if (hit <= 0) return { anim: t > 1.5 ? 'cry' : 'idle', visible: true };
    // Hit: spun right round by it, soot on the nose, then stiff as a board and over backwards.
    this.once('hit', fire + 0.06, t, () => {
      this.bursts.add(fire + 0.06, 'sparkle', this.world(target), 0.7);
      this.bursts.add(fire + 0.08, 'soot', this.world(target), 0.6);
    });
    this.tint('#2a2420', span(hit, 0, 0.2) * 0.6);
    this.turn.multiply(tmpQ.setFromAxisAngle(UP, easeOut(hit / 0.5) * Math.PI * 2));
    const fall = hit > 0.7 ? Math.min(1, ((hit - 0.7) / 0.4) ** 2) : 0;
    const bounce = hit > 1.1 ? Math.exp(-(hit - 1.1) * 8) * Math.sin((hit - 1.1) * 22) * 0.08 : 0;
    const back = this.left.clone();
    const axis = new THREE.Vector3(-back.z, 0, back.x);
    const heel = new THREE.Vector3(0, P, 0).addScaledVector(back, Math.max(0.05, b.box.max.x * 0.8));
    tmpQ.setFromAxisAngle(axis, -((Math.PI / 2 - 0.04) * fall - Math.abs(bounce)));
    this.turn.premultiply(tmpQ);
    this.at.sub(heel).applyQuaternion(tmpQ).add(heel);
    this.sfx('thud', fire + 1.16, t);
    if (fall >= 1) this.once('thud', fire + 1.16, t, () => this.bursts.add(t, 'dust', this.world(heel.clone().addScaledVector(back, b.box.max.y * 0.6)), 0.6));
    this.dizzyAt(t, hit > 1.2 && t < this.soulAt ? heel.clone().addScaledVector(back, b.box.max.y * 0.9).setY(P + 0.35) : null);
    this.setExtraVec('soulFrom', new THREE.Vector3(0, P, 0).addScaledVector(back, b.box.max.y * 0.5));
    return { anim: 'idle', visible: true };
  }

  // ---------------------------------------------------------------- the bath and the toaster

  private toaster(t: number): Shown {
    const b = this.size();
    const P = this.P;
    // The bath along the screen, its head end to the right; the stool and the toaster behind it.
    const A = this.left.clone().negate();
    const len = 1.6;
    if (!this.tub) {
      this.tub = bath(len);
      this.tub.group.quaternion.copy(basis(new THREE.Vector3(1, 0, 0), UP, A, UP));
      this.tub.group.position.set(0, P, 0);
      const holder = new THREE.Group().add(this.tub.group);
      this.props.add(holder);
      this.zap = new Bolts(30);
      this.fx.add(this.zap.group);
      this.disposers.push(() => this.zap?.dispose());
    }
    const B = this.tub;
    this.popProps(t, [this.world(new THREE.Vector3(0, P + 0.6, 0))]);
    this.frame.look = this.world(new THREE.Vector3(0, P + 0.7, 0));
    this.frame.radius = 2.2;
    // Sat in the water up to the chest, at the head end, facing down the bath and turned to the camera.
    const inTub = (x: number, y: number, z: number) => B.group.localToWorld(new THREE.Vector3(x, y, z)).applyMatrix4(new THREE.Matrix4().copy(this.group.matrixWorld).invert());
    B.group.updateMatrixWorld(true);
    const seat = inTub(0.3, Math.max(0.12, B.water - b.box.max.y * 0.62), 0);
    this.turn.copy(this.face(A.clone().negate().lerp(this.cam, 0.6)));
    this.at.copy(seat);
    // The duck bobs about.
    B.duck.position.set(-0.35 + Math.sin(t * 0.7) * 0.08, B.water - 0.01 + Math.sin(t * 3) * 0.01, 0.12);
    B.duck.rotation.set(Math.sin(t * 2.3) * 0.08, t * 0.4, 0);
    // The toaster: a wobble on its stool, and over it goes, into the water.
    const tip = 2.0;
    const lands = 2.45;
    const T = B.toaster;
    const splash = inTub(0.0, B.water, 0.05);
    const shelf = B.shelf;
    if (t < tip) {
      T.position.copy(shelf);
      T.rotation.set(0, 0, Math.sin(t * 25) * 0.08 * span(t, 1.3, 1.6));
    } else {
      const k = Math.min(1, (t - tip) / (lands - tip));
      T.position.lerpVectors(shelf, new THREE.Vector3(0.0, B.water - 0.18, 0.05), k);
      T.position.y += Math.sin(k * Math.PI) * 0.35;
      T.rotation.set(k * 1.6, 0, k * 0.6);
    }
    this.sfx('rattle', 1.3, t);
    this.sfx('splash', lands, t);
    this.once('splash', lands, t, () => this.bursts.add(lands, 'steam', this.world(splash), 0.45));
    // The plug: it stays in (or, when spared, the cord pulls it out as the toaster goes).
    const plugAt = new THREE.Vector3(0.9, 0.38, -0.66);
    if (this.survives) {
      const k = span(t, 2.15, 2.6);
      B.plug.position.lerpVectors(plugAt, new THREE.Vector3(0.45, 0.06, -0.5), k);
      B.plug.position.y += Math.sin(k * Math.PI) * 0.35;
      B.plug.rotation.z = k * 4;
    } else B.plug.position.copy(plugAt);
    T.updateMatrixWorld(true);
    stretchCord(B.cord, T.localToWorld(B.tail.clone()).applyMatrix4(new THREE.Matrix4().copy(B.group.matrixWorld).invert()), B.plug.position);
    // The toast: up out of the toaster (or the bath), turning over.
    const pop = this.survives ? 3.0 : 3.5;
    B.slices.forEach((s, i) => {
      const u = t - pop - i * 0.08;
      s.position.set(s.userData.x as number, 0.18, 0);
      s.rotation.set(0, 0, 0);
      if (u > 0) {
        const p = Math.min(1, u / 0.9);
        s.position.y += Math.sin(p * Math.PI) * 1.1 + p * (this.survives ? 0.2 : 0.4);
        s.position.x += (i ? 1 : -1) * p * 0.3;
        s.rotation.x = p * Math.PI * 3;
      }
    });
    this.sfx('pop', pop, t);
    if (this.survives) {
      // Nothing: the plug came out. Toast! Then out of the bath and a cheer.
      this.sfx('fizzle', lands + 0.1, t);
      this.sfx('ding', pop + 0.4, t);
      const out = span(t, 4.4, 4.9);
      if (out > 0) {
        const stand = new THREE.Vector3(0, P, 0).addScaledVector(this.cam, 1.0);
        this.at.lerp(stand, out);
        this.at.y += Math.sin(out * Math.PI) * 0.5;
      }
      this.once('drip', 4.9, t, () => this.bursts.add(4.9, 'steam', this.world(this.at.clone().setY(P + 0.5)), 0.6));
      return { anim: t > 3.6 ? 'cheer' : t > 2.0 && t < 3.0 ? 'cry' : t < 1.8 ? 'laugh' : 'sit', visible: true };
    }
    // ZAP: crackling all over the water and them, flashing, and a frazzled, smoking, sooty end.
    const on = lands + 0.05;
    const off = on + 1.3;
    const zapping = t > on && t < off;
    this.sfx('buzz', on, t);
    const head = this.world(seat.clone().add(new THREE.Vector3(0, b.box.max.y * 0.9, 0)));
    const paths: [THREE.Vector3, THREE.Vector3][] = [];
    if (zapping) {
      for (let k = 0; k < 6; k++) {
        const a = (k / 6) * Math.PI * 2 + t * 4;
        paths.push([this.world(splash), this.world(inTub(Math.cos(a) * 0.65, B.water + 0.02, Math.sin(a) * 0.32))]);
      }
      paths.push([this.world(splash), head]);
      const flash = Math.floor(t * 12) % 2 === 0;
      this.tint(flash ? '#fff8d8' : '#1a1416', flash ? 0.5 : 0.75);
      this.at.add(new THREE.Vector3((hash(Math.floor(t * 40), 1) - 0.5) * 0.04, (hash(Math.floor(t * 40), 2) - 0.5) * 0.03, 0));
      this.stretch.set(1 + Math.sin(t * 50) * 0.03, 1 + Math.cos(t * 47) * 0.05, 1);
      for (let k = 0; k < 4; k++) {
        const at = on + 0.1 + k * 0.3;
        this.once(`spark${k}`, at, t, () => this.bursts.add(at, 'sparks', head, 0.7));
      }
      this.frame.shake = 0.2;
    }
    this.zap?.update(t, paths, zapping ? 1 : 0, 0.06);
    if (t >= off) {
      this.tint('#1a1416', 0.88);
      // Hair on end: a little taller, and smoking.
      const frizz = span(t, off, off + 0.2);
      this.stretch.set(1 + frizz * 0.04, 1 + frizz * 0.1, 1 + frizz * 0.04);
      this.sfx('sizzle', off, t);
      for (let k = 0; k < 4; k++) {
        const at = off + k * 0.3;
        this.once(`smoke${k}`, at, t, () => this.bursts.add(at, k ? 'smoke' : 'soot', head, 0.4));
      }
    }
    this.setExtraVec('soulFrom', seat.clone().setY(P + 0.6));
    return { anim: t < 1.8 ? 'laugh' : t < on ? 'cry' : 'sit', visible: true };
  }

  // ---------------------------------------------------------------- the nuclear bomb

  private nuke(t: number): Shown {
    const P = this.P;
    const at = new THREE.Vector3(0, P, 0).addScaledVector(this.left, 0.75).addScaledVector(this.cam, 0.15);
    if (!this.nukeBomb) {
      this.nukeBomb = bomb();
      this.nukeBomb.group.visible = false;
      this.keep(this.nukeBomb.group);
      this.whiteout = wash('#ffffff');
      this.group.add(this.whiteout.mesh);
      this.disposers.push(this.whiteout.dispose);
      if (!this.survives) {
        // What's left of the platform's middle: a scorched crater, and a smoke ring out across the square.
        this.pit2 = crater();
        this.pit2.scale.setScalar(0.42);
        this.pit2.position.set(0, P - 0.06, 0);
        this.pit2.visible = false;
        this.keep(this.pit2);
        this.ring2 = new THREE.Mesh(new THREE.TorusGeometry(1, 0.22, 8, 32), new THREE.MeshLambertMaterial({ color: '#d8d0c8', transparent: true, depthWrite: false }));
        this.ring2.rotation.x = Math.PI / 2;
        this.ring2.visible = false;
        this.keep(this.ring2);
        this.mushroom = new Mushroom(4.0, this.world(new THREE.Vector3(0, P, 0)), 2.1, 5.2);
        this.fx.add(this.mushroom.group);
      }
    }
    const N = this.nukeBomb;
    const W = this.whiteout!;
    // Down out of the sky with a whistle, nose first onto the boards beside them, and a wobble.
    const fallAt = 0.5;
    const lands = 1.35;
    const k = span(t, fallAt, lands);
    const fallK = Math.min(1, Math.max(0, (t - fallAt) / (lands - fallAt)));
    N.group.visible = t > fallAt && t < (this.survives ? this.end - 0.3 : 3.9);
    N.group.position.copy(at).setY(P + 12 * (1 - fallK * fallK));
    const wob = t > lands ? Math.exp(-(t - lands) * 4) * Math.sin((t - lands) * 20) * 0.15 : 0;
    N.group.rotation.set(wob, 0, -wob * 0.5 + (1 - k) * 0.2);
    this.sfx('whistle', fallAt, t);
    this.sfx('thunk', lands, t);
    this.once('land', lands, t, () => this.bursts.add(lands, 'dust', this.world(at), 0.7));
    // The light blinks, faster and faster, beeping.
    // (From one and a half blinks a second up to ten, steadily: the turns so far are the rate's running total.)
    const bu = Math.min(t, 3.8) - lands;
    const phase = 1.5 * bu + (8.5 / (3.8 - lands)) * 0.5 * bu * bu;
    N.light.color.set(t > lands && phase % 1 < 0.5 ? '#ff3a2a' : '#5a1410');
    for (let n = 0; n < 14; n++) {
      const when = lands + 0.3 + n * (n < 6 ? 0.36 : 0.18);
      if (when < 3.75) this.sfx('beep', when, t);
    }
    this.frame.look = this.world(new THREE.Vector3(0, P + 0.8, 0));
    this.frame.radius = 2.9;
    this.turn.copy(this.face(at.clone().normalize().lerp(this.cam, 0.7)));
    const flash = 3.8;
    if (this.survives) {
      // "pop." A puff of confetti out of the top, a little sign, and a very relieved cheer.
      this.sfx('pop', flash, t);
      this.once('pop', flash, t, () => {
        this.bursts.add(flash, 'sparkle', this.world(at.clone().setY(P + 1.6)), 1.3);
        this.bursts.add(flash, 'poof', this.world(at.clone().setY(P + 1.5)), 0.5);
      });
      this.sign('pop', 'pop.', 0.8, 0.4, t, flash + 0.1, this.end - 0.6, at.clone().setY(P + 2.1), { bg: '#fffaf0', fg: '#4f6a8a', border: '#4f6a8a' });
      N.light.color.set(t > flash ? '#3a3a30' : N.light.color.getStyle());
      return { anim: t > flash + 0.8 ? 'cheer' : t > lands ? 'cry' : 'idle', visible: true };
    }
    // The flash: everything goes white, holds, and fades on a crater, a smoke ring and a great mushroom cloud.
    W.mesh.visible = t > flash - 0.05 && t < 6.2;
    if (W.mesh.visible) W.mesh.position.copy(this.eye());
    W.material.opacity = span(t, flash, flash + 0.12) * (1 - span(t, 4.9, 6.1));
    this.sfx('nuke', flash, t);
    const u = t - flash;
    if (u > 0) this.frame.shake = Math.exp(-u * 1.2) * 0.8;
    if (this.pit2) this.pit2.visible = u > 0.1;
    if (this.ring2) {
      this.ring2.visible = u > 0.1 && u < 3.2;
      const r = 0.6 + 7 * easeOut(u / 2.6);
      this.ring2.position.set(0, 0.25 + u * 0.15, 0);
      this.ring2.scale.set(r, r, 1 + u);
      (this.ring2.material as THREE.MeshLambertMaterial).opacity = 0.8 * (1 - span(u, 1.6, 3.2));
    }
    this.mushroom?.update(t);
    if (u > 0.1) {
      // The camera eases back and down to take in the cloud.
      const back = span(t, 4.8, 6.0);
      this.frame.look = this.world(new THREE.Vector3(0, P + 0.8 + back * 4.0, 0));
      this.frame.radius = 2.9 + back * 5.2;
      this.frame.low = back * 0.55;
    }
    this.once('soot', flash + 0.1, t, () => this.bursts.add(flash + 0.1, 'soot', this.world(new THREE.Vector3(0, P + 0.3, 0)), 1.6));
    this.setExtraVec('soulFrom', new THREE.Vector3(0, P - 0.1, 0));
    return { anim: t > lands ? 'cry' : 'idle', visible: u < 0.08 };
  }

  // ---------------------------------------------------------------- the cross

  private cross(t: number): Shown {
    const b = this.size();
    const P = this.P;
    // Off to the left of the gallows, a little hill with the cross on it, against a great sunset.
    const hillAt = this.V(-0.4, 4.4, 0);
    const tall = b.box.max.y;
    if (!this.hill) {
      this.hill = hillCross(tall);
      this.hill.group.position.copy(hillAt);
      this.hill.group.quaternion.copy(this.face(this.cam));
      this.hill.material.transparent = true;
      this.keep(this.hill.group);
      this.sky = sunset(26, 13);
      this.sky.mesh.position.copy(this.V(-3.4, 4.4, -0.5));
      this.sky.mesh.quaternion.copy(this.face(this.cam));
      this.group.add(this.sky.mesh);
      this.disposers.push(this.sky.dispose);
      this.bird2 = dove();
      this.keep(this.bird2.group);
    }
    const H = this.hill;
    const fadeIn = span(t, 0.1, 1.3);
    const fadeOut = 1 - span(t, this.end - 1.0, this.end - 0.1);
    const on = fadeIn * fadeOut;
    this.sky!.material.opacity = on;
    H.material.opacity = on;
    H.group.visible = this.sky!.mesh.visible = on > 0.01;
    // Quietly, from low down, the hill and the sky filling the frame.
    this.frame.look = this.world(hillAt.clone().setY(1.5 + tall * 0.5));
    this.frame.radius = 2.6 + tall * 0.4;
    this.frame.low = 0.92;
    const foot = H.group.localToWorld(H.foot.clone());
    const footS = this.group.worldToLocal(foot);
    const top = this.group.worldToLocal(H.group.localToWorld(H.top.clone()));
    // There, in a puff, standing on the footrest with their back to the cross; dark against the sky.
    const k = this.hop(t, 0.5, new THREE.Vector3(0, P, 0), footS);
    this.at.copy(k > 0.5 ? footS : new THREE.Vector3(0, P, 0));
    this.turn.copy(this.face(this.cam));
    this.sfx('toll', 1.4, t);
    const dark = this.survives ? span(t, 0.7, 1.4) * (1 - span(t, 4.3, 5.2)) : span(t, 0.7, 1.4);
    if (dark > 0) this.tint('#0e0a0c', dark);
    // The head bows, slowly.
    const bow = this.survives ? 0 : span(t, 3.0, 4.2);
    this.turn.multiply(tmpQ.setFromAxisAngle(new THREE.Vector3(1, 0, 0), bow * 0.22));
    this.at.y += Math.sin(t * 1.1) * 0.005;
    // The dove: off the top of the cross and away into the sunset (or, when spared, in to settle on their head).
    const D = this.bird2!;
    const perch = top.clone().add(new THREE.Vector3(0, 0.08, 0));
    let flap = 0;
    if (this.survives) {
      const from = this.V(2.5, -4, 4.5);
      const head = footS.clone().add(new THREE.Vector3(0, tall + 0.02, 0));
      const inK = ease((t - 2.2) / 1.0);
      const toHead = ease((t - 3.4) / 0.5);
      const away = ease((t - 6.0) / 1.2);
      D.group.position.lerpVectors(from, perch, inK).lerp(head, toHead);
      if (t > 4.4) D.group.position.copy(head).add(this.at.clone().sub(footS));
      D.group.position.lerp(this.V(1.5, -6, 6), away);
      D.group.visible = t > 2.2 && away < 0.99;
      D.group.quaternion.copy(this.face(t < 3.2 ? perch.clone().sub(from) : this.cam));
      flap = t < 3.2 || (t > 3.4 && t < 3.9) || t > 6.0 ? 1 : 0;
      this.sfx('wings', 2.2, t);
      this.sfx('wings', 6.0, t);
      // Down off the hill, themselves again, and a cheer.
      const down = span(t, 4.6, 5.1);
      if (down > 0) {
        const stand = footS.clone().setY(hillAt.y + 0.5).addScaledVector(this.cam, 1.6);
        this.at.lerp(stand, down);
        this.at.y += Math.sin(down * Math.PI) * 0.4;
      }
      this.sfx('ding', 5.2, t);
      return { anim: t > 5.2 ? 'cheer' : 'idle', visible: true };
    }
    const go = 3.7;
    const u = Math.max(0, t - go);
    D.group.position.copy(perch).add(this.V(0, -1, 0).multiplyScalar(u * 1.4)).add(new THREE.Vector3(0, u * 1.1 + Math.sin(u * 3) * 0.1, 0)).addScaledVector(this.cam, -u * 0.6);
    D.group.quaternion.copy(this.face(u > 0 ? this.left.clone().negate().addScaledVector(this.cam, -0.4) : this.cam));
    D.group.visible = on > 0.05 && u < 4;
    D.group.scale.setScalar(1.2);
    flap = u > 0 ? 1 : 0;
    this.sfx('wings', go, t);
    D.wings.forEach((w, i) => (w.rotation.z = (i ? -1 : 1) * (flap ? Math.sin(t * 22) * 0.8 : 0.1)));
    this.setExtraVec('soulFrom', footS.clone().add(new THREE.Vector3(0, tall * 0.4, 0.1)));
    return { anim: 'idle', visible: true };
  }

  // ---------------------------------------------------------------- run over

  private runover(t: number): Shown {
    const b = this.size();
    const P = this.P;
    // Down off the platform onto the cobbles in front, and a little car comes along the road from the right.
    const spot = this.V(2.4, 0.4, 0);
    const across = this.left.clone();
    if (!this.car) {
      this.car = littleCar('#d8402f');
      this.car.group.visible = false;
      this.keep(this.car.group);
    }
    const C = this.car;
    const k = this.hop(t, 0.3, new THREE.Vector3(0, P, 0), spot);
    this.at.copy(k > 0.5 ? spot : new THREE.Vector3(0, P, 0));
    this.frame.look = this.world(spot.clone().setY(0.6).addScaledVector(this.cam, -0.4));
    this.frame.radius = 3.1;
    // Along the road: in from the right at a fair lick, and on away to the left (or, spared, a skid to a stop).
    const lane = spot.clone().addScaledVector(this.cam, 0.05);
    const enter = 1.3;
    const hitAt = 2.3;
    const speed = 6;
    let s = (t - hitAt) * speed;
    if (this.survives) {
      // Brakes on, hard, to stop with its bumper just short of their nose.
      const stopAt = -1.0 - Math.max(0.2, b.box.max.z);
      const decel = 7.5;
      const stopFor = speed / decel;
      const brake = hitAt + (stopAt - (speed * speed) / (2 * decel)) / speed;
      if (t > brake) {
        const u = Math.min(t - brake, stopFor);
        s = stopAt - (speed * speed) / (2 * decel) + speed * u - 0.5 * decel * u * u;
      }
      // A beep of sorry, and off it backs, round and away.
      const back = span(t, 3.6, 4.6);
      s -= back * 6;
      C.group.quaternion.copy(this.face(across));
    } else C.group.quaternion.copy(this.face(across));
    C.group.position.copy(lane).addScaledVector(across, s);
    C.group.visible = t > enter && t < this.end - 0.2 && Math.abs(s) < 9;
    const rolled = s / C.r;
    for (const w of C.wheels) w.rotation.x = rolled;
    C.body.position.y = Math.abs(Math.sin(t * 18)) * 0.02;
    C.body.rotation.x = 0;
    this.sfx('honk', 1.4, t);
    this.sfx('engine', enter, t);
    this.turn.copy(this.face(this.cam));
    const look = span(t, 1.5, 1.7);
    this.turn.slerp(this.face(across.clone().negate()), look * 0.8);
    if (this.survives) {
      this.sfx('skid', 1.95, t);
      // Nose down as it stops, then a sheepish little meep.
      const stop = span(t, 2.0, 2.4) * (1 - span(t, 2.6, 2.9));
      C.body.rotation.x = stop * 0.12;
      this.sfx('meep', 2.9, t);
      for (let n = 0; n < 4; n++) this.once(`skid${n}`, 2.0 + n * 0.08, t, () => this.bursts.add(t, 'smoke', C.group.getWorldPosition(new THREE.Vector3()).setY(0.2), 0.5));
      const faint = span(t, 2.3, 2.45) * (1 - span(t, 3.0, 3.3));
      this.stretch.set(1, 1 - faint * 0.1, 1);
      return { anim: t > 3.4 ? 'cheer' : t > 1.5 ? 'cry' : 'idle', visible: true };
    }
    // Over them, bump bump: flat as a pancake, peeling up at the edges and fluttering.
    const flat = t > hitAt - 0.15 ? 1 : 0;
    // (Front wheels, then the back ones.)
    for (const at of [hitAt - 0.15, hitAt + 0.05]) {
      const u = t - at;
      if (u > 0 && u < 0.15) C.body.position.y += Math.sin((u / 0.15) * Math.PI) * 0.18;
      this.sfx('flump', at, t);
    }
    this.once('flat', hitAt - 0.15, t, () => this.bursts.add(hitAt - 0.15, 'dust', this.world(spot.clone().addScaledVector(this.cam, -0.5)), 0.4));
    this.sfx('honk', hitAt + 0.5, t);
    if (flat) {
      // Flat on the ground, and a little bigger round: lying down, seen from above.
      const lie = basis(Y, Z, this.cam.clone().negate(), UP);
      const breathe = Math.sin((t - hitAt) * 3) * 0.004;
      this.stretch.set(1.35, 1.25, 0.09 + breathe);
      this.put(lie, spot.clone().setY(0.07), new THREE.Vector3(this.mid().x, this.mid().y, this.thick().back));
      this.dizzyAt(t, t > hitAt + 0.3 && t < this.soulAt ? spot.clone().setY(0.35) : null, 0.25);
    }
    this.setExtraVec('soulFrom', spot.clone().setY(0.05));
    return { anim: flat ? 'idle' : t > 1.5 ? 'cry' : 'idle', visible: true };
  }

  // ---------------------------------------------------------------- Bonnie and Clyde

  private getaway(t: number): Shown {
    const b = this.size();
    const P = this.P;
    const tall = b.box.max.y;
    // A bluff back to the right of the gallows, its road running out towards us and dropping away at the end.
    const D = this.cam.clone().addScaledVector(this.left, -0.45).normalize();
    const base = this.V(-2.4, -3.6, 0);
    const top = 2.5;
    const len = 4.2;
    if (!this.bluff) {
      this.bluff = cliff(top, len);
      this.bluff.group.position.copy(base);
      this.bluff.group.quaternion.copy(basis(new THREE.Vector3(1, 0, 0), UP, D, UP));
      this.props.add(new THREE.Group().add(this.bluff.group));
      this.car = littleCar('#3f9a8c', true);
      this.car.group.visible = false;
      this.keep(this.car.group);
      this.pal = partner();
      this.pal.scale.setScalar(Math.max(0.8, tall * 0.85));
      this.car.body.add(this.pal);
      this.pal.position.set(0.24, 0.6, -0.32);
      this.glasses = shades(0.32);
      this.glasses.visible = false;
      this.keep(this.glasses);
      this.whiteout = wash('#d8a860');
      this.group.add(this.whiteout.mesh);
      this.disposers.push(this.whiteout.dispose);
      if (this.survives) {
        this.chute = parachute();
        this.chute.scale.setScalar(0.001);
        this.car.body.add(this.chute);
        this.chute.position.set(0, 0.7, -0.6);
      } else {
        for (let i = 0; i < 2; i++) {
          const w = this.car.wheels[i].clone();
          w.visible = false;
          this.wheelsOff.push(this.keep(w));
        }
      }
    }
    const C = this.car!;
    const L = this.bluff!;
    this.popProps(t, [this.world(base.clone().setY(1.5))]);
    const edge = base.clone().addScaledVector(D, L.edge);
    const startAt = base.clone().addScaledVector(D, -L.edge + 0.8).setY(L.top);
    // The run along the top: still for a moment (shades on), then away, faster and faster, and off the edge.
    const go = 1.4;
    const leave = 2.6;
    const accel = (2 * (L.edge * 2 - 0.8)) / (leave - go) ** 2;
    // (Slower through the air than along the road, so it comes down in the middle of the picture.)
    const vx = Math.min(3.6, accel * (leave - go));
    const vy = 3.2;
    const g = 9.8;
    const apex = leave + vy / g;
    const hold = this.survives ? 1.0 : 1.2;
    // The show's clock, stopped for the freeze-frame.
    const ft = t < apex ? t : t < apex + hold ? apex : t - hold;
    const pos = new THREE.Vector3();
    let pitch = 0;
    if (ft < go) pos.copy(startAt);
    else if (ft < leave) pos.copy(startAt).addScaledVector(D, 0.5 * accel * (ft - go) ** 2);
    else {
      const u = ft - leave;
      pos.copy(edge).setY(L.top).addScaledVector(D, vx * u);
      pos.y += vy * u - 0.5 * g * u * u;
      pitch = Math.atan2(-(vy - g * u), vx) * 0.8;
    }
    const crashAt = leave + (vy + Math.sqrt(vy * vy + 2 * g * L.top)) / g;
    let landed = false;
    if (this.survives) {
      // The parachute: out of the boot as the picture runs on, and a gentle float down.
      const open = apex + hold + 0.15;
      if (t > open) {
        const u = t - open;
        const fallen = Math.min(L.top + 1.0, 1.6 + u * 0.9);
        const k = span(t, open, open + 0.4);
        pos.copy(edge).addScaledVector(D, vx * (open - hold - leave) + Math.min(1.8, u * 0.6)).setY(Math.max(0, L.top + 0.9 - (fallen - 1.6) - k * 0.1));
        pitch *= 1 - k;
        landed = pos.y <= 0.001;
      }
      this.chute!.scale.setScalar(Math.max(0.001, span(t, open, open + 0.3) * (1 - span(t, this.end - 1.4, this.end - 1.0))));
      this.chute!.rotation.z = Math.sin(t * 2) * 0.05;
      this.sfx('pop', open, t);
      this.sfx('boing', open + 3.2, t);
    } else if (ft >= crashAt) {
      pos.copy(edge).addScaledVector(D, vx * (crashAt - leave)).setY(0);
      landed = true;
    }
    C.group.visible = t > 0.25 && t < this.end - 0.2;
    C.group.position.copy(pos);
    C.group.quaternion.copy(this.face(D)).multiply(tmpQ.setFromAxisAngle(new THREE.Vector3(1, 0, 0), pitch));
    const rolled = ft < leave ? (0.5 * accel * Math.max(0, ft - go) ** 2) / C.r : 99;
    for (const w of C.wheels) w.rotation.x = rolled + (ft > leave && !landed ? ft * 20 : 0);
    // The freeze-frame: everything stops, warm and grainy, with a record scratch.
    const W = this.whiteout!;
    const frozen = t > apex && t < apex + hold;
    W.mesh.visible = frozen;
    if (frozen) W.mesh.position.copy(this.eye());
    W.material.opacity = frozen ? 0.38 : 0;
    this.sfx('scratch', apex, t);
    this.sfx('engine', go, t);
    this.sfx('chord', apex + 0.05, t);
    // The camera takes in the bluff and the drop, and follows the car's flight.
    this.frame.look = this.world(base.clone().addScaledVector(D, L.edge + 1.2).setY(1.3));
    this.frame.radius = 4.4;
    this.frame.low = 0.3;
    // In the passenger seat, from the waist up, shades on, a little wave.
    const seat = new THREE.Vector3(-0.24, 0.55, -0.32);
    C.group.updateMatrixWorld(true);
    const seatW = this.group.worldToLocal(C.body.localToWorld(seat.clone()));
    const k = this.hop(t, 0.25, new THREE.Vector3(0, P, 0), seatW);
    this.at.copy(k > 0.5 ? seatW : new THREE.Vector3(0, P, 0));
    this.turn.copy(this.face(D)).multiply(tmpQ.setFromAxisAngle(new THREE.Vector3(1, 0, 0), pitch)).multiply(tmpQ.setFromAxisAngle(UP, -0.6));
    // The shades: down from above onto the nose.
    const G = this.glasses!;
    const drop = span(t, 0.7, 1.0);
    const onNose = this.eyes().applyQuaternion(this.turn).add(this.at);
    G.visible = t > 0.6 && C.group.visible && !(landed && !this.survives && t > crashAt + 0.2 && t > this.soulAt);
    G.position.copy(onNose).add(new THREE.Vector3(0, (1 - drop) * 1.2, 0));
    G.quaternion.copy(this.turn);
    G.scale.setScalar(THREE.MathUtils.clamp(((b.box.max.x - b.box.min.x) * 0.62) / 0.32, 0.8, 1.8));
    if (this.survives) {
      return { anim: landed ? 'cheer' : t > apex + hold ? 'cry' : 'sit', visible: true };
    }
    // The crash: a great puff, soot, wheels bouncing off, and the car on its nose.
    this.sfx('crash', crashAt, t);
    this.once('crash', crashAt, t, () => {
      const at = this.world(pos.clone().setY(0.5));
      this.bursts.add(crashAt, 'poof', at, 1.8);
      this.bursts.add(crashAt + 0.05, 'soot', at, 1.4);
      this.bursts.add(crashAt + 0.1, 'dust', this.world(pos.clone().setY(0.1)), 1.6);
    });
    if (landed) {
      const u = ft - crashAt;
      this.frame.shake = Math.exp(-u * 4) * 0.5;
      C.group.quaternion.copy(this.face(D)).multiply(tmpQ.setFromAxisAngle(new THREE.Vector3(1, 0, 0), 0.5 + Math.exp(-u * 6) * Math.sin(u * 20) * 0.1));
      C.body.scale.set(1.08, 0.8, 0.82);
      this.tint('#1a1416', 0.85);
      this.once('sooty', crashAt, t, () => this.pal!.traverse((o) => ((o as THREE.Mesh).material as THREE.MeshLambertMaterial | undefined)?.color?.set('#5a5458')));
      this.wheelsOff.forEach((w, i) => {
        w.visible = u < 2.0;
        const dir = this.cam.clone().multiplyScalar(i ? 1 : -0.6).addScaledVector(D, 0.8);
        w.position.copy(pos).addScaledVector(dir, u * 1.6).setY(0.26 + Math.abs(Math.sin(u * 6 + i)) * Math.exp(-u * 1.5) * 0.8);
        w.rotation.set(u * 9, 0, 0);
      });
      C.wheels.slice(0, 2).forEach((w) => (w.visible = false));
      for (let n = 0; n < 3; n++) {
        const when = crashAt + 0.6 + n * 0.5;
        this.once(`wisp${n}`, when, t, () => this.bursts.add(when, 'smoke', this.world(pos.clone().setY(0.9)), 0.7));
      }
      this.dizzyAt(t, t < this.soulAt ? this.at.clone().add(new THREE.Vector3(0, tall + 0.1, 0)) : null);
    }
    this.setExtraVec('soulFrom', pos.clone().setY(0.4));
    return { anim: t < apex + hold ? 'sit' : 'cry', visible: true };
  }

  // ---------------------------------------------------------------- the failed magic trick

  private magic(t: number): Shown {
    const b = this.size();
    const P = this.P;
    // The box lies across the screen on its table, head end to the left; the magician behind it.
    const A = this.left.clone();
    const mid = this.mid();
    const len = b.box.max.y - b.box.min.y;
    const deep = Math.max(0.5, b.box.max.x - b.box.min.x + 0.14);
    const high = Math.max(0.42, this.thick().depth + 0.16);
    const boxLen = Math.max(0.7, len * 0.62);
    const centre = new THREE.Vector3(0, P, 0).addScaledVector(this.cam, 0.35);
    if (!this.box) {
      this.box = magicBox(boxLen, high, deep);
      this.box.group.quaternion.copy(basis(new THREE.Vector3(1, 0, 0), UP, A, UP));
      this.box.group.position.copy(centre);
      this.props.add(new THREE.Group().add(this.box.group));
      this.act = magician();
      this.act.group.position.copy(centre).addScaledVector(this.cam, -0.85).addScaledVector(A, -0.2);
      this.act.group.quaternion.copy(this.face(this.cam));
      this.props.add(new THREE.Group().add(this.act.group));
      this.blade2 = saw(1.1);
      this.blade2.visible = false;
      this.keep(this.blade2);
    }
    const X = this.box;
    const M = this.act!;
    this.popProps(t, [this.world(centre.clone().setY(P + 1)), this.world(M.group.position.clone().setY(P + 1))]);
    this.frame.look = this.world(centre.clone().setY(P + 1.0).addScaledVector(this.cam, -0.3));
    this.frame.radius = 2.8;
    // Lying in the box, face up and turned to us, the middle of them at the cut.
    const lay = basis(Y, Z, A, UP.clone().addScaledVector(this.cam, 0.6).normalize());
    const inside = centre.clone().setY(P + X.floor + high / 2);
    const k = this.hop(t, 0.3, new THREE.Vector3(0, P, 0), inside);
    if (k > 0.5) this.put(lay, inside, mid);
    else this.at.set(0, P, 0);
    // The magician: a flourish, the saw (back and forth, down through the middle), apart, Ta-da!
    const [right, left] = M.arms;
    const flourish = span(t, 0.6, 0.9) * (1 - span(t, 1.2, 1.4));
    left.rotation.set(-flourish * 2.4, 0, flourish * 0.5);
    right.rotation.set(-flourish * 2.4, 0, -flourish * 0.5);
    this.once('sparkle', 0.9, t, () => this.bursts.add(0.9, 'sparkle', this.world(M.group.position.clone().setY(P + 2.0)), 0.8));
    this.sfx('tada', 0.8, t);
    const sawFrom = 1.4;
    const sawTo = 3.0;
    const S = this.blade2!;
    S.visible = t > sawFrom - 0.1 && t < sawTo + 0.3;
    const through = span(t, sawFrom + 0.2, sawTo);
    const stroke = Math.sin((t - sawFrom) * 14) * 0.25 * (t < sawTo ? 1 : 0);
    // The saw stands across the box, teeth down, cutting in from above; its handle towards the magician.
    S.position.copy(centre).setY(P + X.floor + high + 0.12 - through * (high + 0.1)).addScaledVector(this.cam, -0.6 + stroke);
    S.quaternion.copy(basis(new THREE.Vector3(1, 0, 0), UP, this.cam, UP));
    right.rotation.set(t > sawFrom && t < sawTo ? -1.0 + stroke : right.rotation.x, 0, 0);
    this.sfx('saw', sawFrom + 0.1, t);
    this.sfx('saw', sawFrom + 0.9, t);
    if (t < sawTo + 0.05) {
      if (k > 0.5 && t > sawFrom) this.at.add(new THREE.Vector3((hash(Math.floor(t * 20)) - 0.5) * 0.02, 0, 0));
      return { anim: t > sawFrom ? 'cry' : 'idle', visible: true };
    }
    // Cut in two: each half of them goes with its half of the box.
    this.once('cut', sawTo + 0.05, t, () => this.cutAt(A, inside.clone()));
    const apart = this.apartBy(t);
    X.halves[0].position.set(-apart, X.floor, 0);
    X.halves[1].position.set(apart, X.floor, 0);
    const [feet, head] = this.pieces;
    if (feet) feet.group.position.copy(inside).addScaledVector(A, -apart);
    if (head) head.group.position.copy(inside).addScaledVector(A, apart);
    // The feet wiggle in their half.
    if (feet) feet.group.rotation.set(0, 0, Math.sin(t * 9) * 0.02);
    if (head) head.group.rotation.set(0, 0, Math.sin(t * 7 + 1) * 0.015);
    const both = span(t, 3.1, 3.4) * (1 - span(t, 3.9, 4.1));
    left.rotation.set(-both * 1.2, 0, both * 0.9);
    right.rotation.set(-both * 1.2, 0, -both * 0.9);
    const signAt = centre.clone().setY(P + 2.45);
    if (this.survives) {
      // Pushed back together... and it works! A puff, the box opens, out they hop.
      this.sign('tada', 'Ta-da!', 1.1, 0.42, t, 3.5, this.end - 0.6, signAt);
      this.sfx('tada', 3.5, t);
      const whole = t > 5.0;
      this.once('whole', 5.0, t, () => this.bursts.add(5.0, 'poof', this.world(inside), 1.0));
      this.sfx('poof', 5.0, t);
      for (const p of this.pieces) p.group.visible = !whole;
      const out = span(t, 5.4, 5.9);
      if (out > 0) {
        const stand = new THREE.Vector3(0, P, 0).addScaledVector(this.cam, 1.05);
        this.put(lay.clone().slerp(this.face(this.cam), out), inside.clone().lerp(stand.clone().add(mid), out), mid);
        this.at.y += Math.sin(out * Math.PI) * 0.4;
      }
      X.group.visible = t < 5.4 || this.end - t > 0.5;
      return { anim: t > 5.9 ? 'cheer' : 'idle', visible: whole };
    }
    // Pushed back together, twice; they bounce apart. A shrug. "Ta-da?!"
    this.sign('tada', 'Ta-da!', 1.1, 0.42, t, 3.5, 4.4, signAt);
    this.sign('tada2', 'Ta-da?!', 1.3, 0.42, t, 5.6, this.end - 0.6, signAt);
    this.sfx('tada', 3.5, t);
    this.sfx('boing', 4.75, t);
    this.sfx('boing', 5.25, t);
    this.sfx('wahwah', 5.6, t);
    const shrug = span(t, 5.5, 5.8);
    left.rotation.set(-shrug * 0.5, 0, shrug * 1.1);
    right.rotation.set(-shrug * 0.5, 0, -shrug * 1.1);
    M.group.position.y = P + Math.sin(shrug * Math.PI) * 0.05;
    this.setExtraVec('soulFrom', inside.clone().setY(P + X.floor));
    return { anim: 'idle', visible: false };
  }

  /** How far each half of the box has slid from the middle. */
  private apartBy(t: number): number {
    const out = 0.42 * span(t, 3.15, 3.6);
    if (this.survives) return out * (1 - span(t, 4.5, 4.9));
    // Pushed in, a bump, bounced back out; and again.
    const push = (a: number) => {
      const u = (t - a) / 0.5;
      return u > 0 && u < 1 ? Math.sin(u * Math.PI) * 0.36 : 0;
    };
    return out - push(4.5) - push(5.0);
  }

  /** Cut in two across the middle, as they lie in the box: two baked pieces, each half kept. */
  private cutAt(A: THREE.Vector3, at: THREE.Vector3) {
    if (!this.who) return;
    const parts = bakeAnimal(this.who);
    const toLocal = this.group.matrixWorld.clone().invert();
    for (const p of parts) p.geometry.applyMatrix4(toLocal);
    const feet = new BakedPiece(parts, at, { keep: A.clone().negate() });
    const head = new BakedPiece(parts, at, { keep: A.clone() });
    freeBake(parts);
    this.group.add(feet.group, head.group);
    this.pieces.push(feet, head);
    this.bursts.add(3.05, 'poof', this.world(at), 0.4);
  }

  // ---------------------------------------------------------------- the meat grinder

  private mince(t: number): Shown {
    const b = this.size();
    const P = this.P;
    const X = this.left.clone().negate();
    if (!this.grinder) {
      this.grinder = mincer();
      this.grinder.group.quaternion.copy(basis(new THREE.Vector3(1, 0, 0), UP, X, UP));
      this.grinder.group.position.set(0, P, 0).addScaledVector(this.cam, 0.15);
      this.props.add(new THREE.Group().add(this.grinder.group));
      if (!this.survives) {
        const geo = new THREE.CapsuleGeometry(0.09, 0.24, 4, 10).rotateZ(Math.PI / 2);
        const mat = new THREE.MeshLambertMaterial({ color: '#c8705a' });
        for (let i = 0; i < 16; i++) {
          const m = new THREE.Mesh(geo, mat);
          m.visible = false;
          this.links.push(m);
          this.group.add(m);
        }
        this.disposers.push(() => {
          geo.dispose();
          mat.dispose();
          for (const m of this.links) m.removeFromParent();
        });
      }
    }
    const M = this.grinder;
    this.popProps(t, [this.world(new THREE.Vector3(0, P + 1.5, 0))]);
    M.group.updateMatrixWorld(true);
    const local = (v: THREE.Vector3) => this.group.worldToLocal(M.group.localToWorld(v.clone()));
    const mouth = local(M.mouth);
    const outlet = local(M.outlet);
    this.frame.look = this.world(new THREE.Vector3(0, P + 1.4, 0).addScaledVector(X, 0.4));
    this.frame.radius = 3.3;
    // Up in a hop, over the hopper, and down in.
    const up = 0.7;
    const over = 1.5;
    const sink = 2.1;
    const start = new THREE.Vector3(0, P, 0).addScaledVector(this.cam, 1.0);
    const above = mouth.clone().add(new THREE.Vector3(0, 0.2, 0));
    let visible = true;
    this.turn.copy(this.face(this.cam));
    if (t < up) this.at.copy(start);
    else if (t < over) {
      const k = ease((t - up) / (over - up));
      this.at.lerpVectors(start, above, k);
      this.at.y += Math.sin(k * Math.PI) * 1.0;
      this.turn.multiply(tmpQ.setFromAxisAngle(new THREE.Vector3(1, 0, 0), -k * Math.PI * 2));
    } else {
      const k = span(t, over + 0.15, sink);
      this.at.copy(above).add(new THREE.Vector3(0, -k * (b.box.max.y + 0.4), 0));
      this.at.add(new THREE.Vector3(Math.sin(t * 20) * 0.02 * k, 0, 0));
      visible = k < 0.98;
    }
    this.sfx('boing', up, t);
    this.sfx('slurp', over + 0.2, t);
    // The crank goes round (backwards and stuck, when spared), the whole thing chugging.
    const stop = this.survives ? 2.95 : 4.9;
    const turning = t > 2.2 && t < stop ? 1 : 0;
    // (Jammed, it kicks back a little way.)
    M.crank.rotation.x = -(Math.min(t, stop) - 2.2 > 0 ? Math.min(t, stop) - 2.2 : 0) * 7 + (this.survives ? span(t, 2.95, 3.2) * 1.2 : 0);
    M.group.position.y = P + (turning > 0 ? Math.abs(Math.sin(t * 24)) * 0.02 : 0);
    if (turning > 0.2) this.frame.shake = 0.08;
    this.sfx('grind', 2.2, t);
    if (this.survives) {
      // A clunk, a shudder, the crank kicks back... and ptoo, out they come, onto the boards.
      this.sfx('clunk', 2.95, t);
      this.sfx('ptoo', 3.6, t);
      M.group.rotation.z = span(t, 2.95, 3.05) * (1 - span(t, 3.4, 3.6)) * Math.sin(t * 40) * 0.03;
      const fly = span(t, 3.6, 4.4);
      if (t > 3.6) {
        const land = new THREE.Vector3(0, P, 0).addScaledVector(this.cam, 1.0).addScaledVector(X, -0.6);
        const k = Math.min(1, (t - 3.6) / 0.8);
        this.at.lerpVectors(above, land, k);
        this.at.y += Math.sin(k * Math.PI) * 1.4;
        this.turn.copy(this.face(this.cam)).multiply(tmpQ.setFromAxisAngle(new THREE.Vector3(1, 0, 0), k * Math.PI * 2));
        visible = true;
        if (k >= 1) this.at.y += Math.abs(Math.sin((t - 4.4) * 12)) * Math.exp(-(t - 4.4) * 6) * 0.2;
      }
      this.once('spat', 3.6, t, () => this.bursts.add(3.6, 'poof', this.world(above), 0.7));
      this.sfx('boing', 4.4, t);
      this.dizzyAt(t, fly >= 1 && t < 5.4 ? this.at.clone().add(new THREE.Vector3(0, b.box.max.y + 0.12, 0)) : null);
      return { anim: t > 5.4 ? 'cheer' : t > 4.4 ? 'idle' : 'cry', visible };
    }
    // Out of the plate: a string of sausages, down onto the dish and coiling round it.
    const made = Math.max(0, (t - 2.7) / 2.0) * this.links.length;
    const dish = local(new THREE.Vector3(1.1, 0.72, 0));
    this.links.forEach((m, i) => {
      const s = made - i;
      m.visible = s > 0;
      if (!m.visible) return;
      // Out along the plate's axis, then a droop down to the dish, then round in a coil.
      const u = Math.min(s, 3.0);
      let p: THREE.Vector3;
      if (u < 1) p = outlet.clone().addScaledVector(X, 0.12 + u * 0.18).add(new THREE.Vector3(0, -u * u * 0.3, 0));
      else {
        const a = (u - 1) * 1.6 + i * 0.4;
        const r = 0.35 - Math.min(0.2, i * 0.012);
        p = dish.clone().add(new THREE.Vector3(Math.cos(a) * r, 0.06 + Math.floor(i / 8) * 0.12, Math.sin(a) * r));
        p.lerp(outlet.clone().addScaledVector(X, 0.3).setY(outlet.y - 0.3), Math.max(0, 2 - u) * 0.5);
      }
      m.position.copy(p);
      m.rotation.set(0, i * 0.7 + u, 0);
      m.scale.setScalar(Math.min(1, s * 2));
    });
    for (let n = 0; n < 6; n++) this.sfx('plop', 2.8 + n * 0.33, t);
    this.sfx('ding', 4.9, t);
    this.setExtraVec('soulFrom', mouth.clone().add(new THREE.Vector3(0, -0.3, 0)));
    return { anim: 'cry', visible };
  }

  // ---------------------------------------------------------------- the piano

  private pianoDrop(t: number): Shown {
    const P = this.P;
    const at = new THREE.Vector3(0, P, 0);
    if (!this.piano) {
      this.piano = grandPiano();
      this.piano.group.visible = false;
      this.keep(this.piano.group);
      this.shadow = new THREE.Mesh(new THREE.CircleGeometry(1, 28), new THREE.MeshBasicMaterial({ color: '#000000', transparent: true, opacity: 0, depthWrite: false }));
      this.shadow.rotation.x = -Math.PI / 2;
      this.shadow.position.set(0, P + 0.015, 0);
      this.keep(this.shadow);
      const keyGeo = new THREE.BoxGeometry(0.05, 0.03, 0.2);
      const white = new THREE.MeshLambertMaterial({ color: '#f6f2e8' });
      const black = new THREE.MeshLambertMaterial({ color: '#1e1c22' });
      for (let i = 0; i < 14; i++) {
        const m = new THREE.Mesh(keyGeo, i % 3 ? white : black);
        m.visible = false;
        this.keys.push(m);
        this.group.add(m);
      }
      this.disposers.push(() => {
        keyGeo.dispose();
        white.dispose();
        black.dispose();
        for (const m of this.keys) m.removeFromParent();
      });
    }
    const Pn = this.piano;
    this.frame.look = this.world(new THREE.Vector3(0, P + 1.0, 0));
    this.frame.radius = 2.9;
    // A shadow grows under them; they look up; a whistle; and down it comes.
    const fall = 1.55;
    const hit = 2.05;
    const shadowK = span(t, 0.4, hit);
    (this.shadow!.material as THREE.MeshBasicMaterial).opacity = 0.35 * shadowK * (t < hit + 0.1 ? 1 : 0);
    this.shadow!.scale.setScalar(0.2 + shadowK * 0.9);
    this.sfx('whistle', fall - 0.3, t);
    const k = Math.min(1, Math.max(0, (t - fall) / (hit - fall)));
    // Keyboard to the camera, the middle of the case over them.
    const home = at.clone().addScaledVector(this.cam, 0.8).addScaledVector(this.left, 0.1);
    const landed = t >= hit;
    Pn.group.visible = t > fall - 0.05 && t < this.end - 0.25;
    Pn.group.quaternion.copy(this.face(this.cam));
    Pn.group.position.copy(home).setY(P + 14 * (1 - k * k));
    this.turn.copy(this.face(this.cam));
    const lookUp = span(t, 0.9, 1.2);
    this.turn.multiply(tmpQ.setFromAxisAngle(new THREE.Vector3(1, 0, 0), -lookUp * 0.25));
    if (this.survives) {
      // A step back just in time; it lands right in front of them with a great BONNNG, all in one piece.
      const step = span(t, 1.8, 2.0);
      this.at.copy(at).addScaledVector(this.cam, step * 1.45).addScaledVector(this.left, -step * 0.2);
      this.turn.copy(this.face(this.cam.clone().negate().lerp(this.cam, 1 - span(t, 3.0, 3.4))));
      if (landed) {
        const u = t - hit;
        Pn.group.position.y = P + Math.abs(Math.sin(u * 14)) * Math.exp(-u * 7) * 0.12;
        Pn.lid.rotation.z = 0.6 + Math.exp(-u * 6) * Math.sin(u * 20) * 0.2;
      } else Pn.lid.rotation.z = 0.6;
      this.sfx('bonng', hit, t);
      this.once('dust', hit, t, () => this.bursts.add(hit, 'dust', this.world(home.clone().setY(P)), 1.2));
      // Then a happy little tune on it.
      this.sfx('tune', 3.6, t);
      if (t > 3.4) this.at.copy(home).addScaledVector(this.cam, 1.0).setY(P);
      if (t > 3.4) this.turn.copy(this.face(this.cam.clone().negate()));
      if (t > 4.8) this.turn.copy(this.face(this.cam));
      this.frame.shake = landed ? Math.exp(-(t - hit) * 5) * 0.4 : 0;
      return { anim: t > 4.8 ? 'cheer' : t > 3.4 ? 'work' : t > 1.2 ? 'cry' : 'idle', visible: true };
    }
    this.at.copy(at);
    if (!landed) return { anim: t > 1.0 ? 'cry' : 'idle', visible: true };
    // CRASH: down on its belly, legs splayed, the lid slammed, keys everywhere, and them flat underneath.
    const u = t - hit;
    this.sfx('piano', hit, t);
    this.frame.shake = Math.exp(-u * 4) * 0.6;
    Pn.group.position.y = P - Pn.under + 0.12 + Math.abs(Math.sin(u * 14)) * Math.exp(-u * 7) * 0.12;
    Pn.group.quaternion.multiply(tmpQ.setFromAxisAngle(new THREE.Vector3(0, 0, 1), 0.06));
    Pn.lid.rotation.z = 0.35 + Math.exp(-u * 3) * 0.5 * Math.abs(Math.sin(u * 9));
    Pn.legs.forEach((l, i) => l.rotation.set(i === 2 ? -1.3 : 0, 0, i === 0 ? 1.3 : i === 1 ? -1.3 : 0));
    this.once('crash', hit, t, () => {
      this.bursts.add(hit, 'dust', this.world(home.clone().setY(P)), 0.8);
      this.bursts.add(hit + 0.05, 'poof', this.world(home.clone().addScaledVector(this.cam, 0.8).setY(P + 0.2)), 0.45);
    });
    this.keys.forEach((m, i) => {
      m.visible = u < 2.5;
      const a = (i / this.keys.length) * Math.PI * 2 + hash(i, 1);
      const v = 1.4 + hash(i, 2) * 1.6;
      const fly = Math.min(u, 1.1);
      m.position.copy(home).add(new THREE.Vector3(Math.cos(a) * v * fly, P + 0.4 + (3 + hash(i, 3) * 2) * fly - 4.9 * fly * fly, Math.sin(a) * v * fly));
      m.position.y = Math.max(P + 0.02, m.position.y);
      m.rotation.set(fly * (5 + i), fly * 3, i);
    });
    // Flat as a pancake, under there.
    this.stretch.set(1.3, 0.12, 1.3);
    this.dizzyAt(t, u > 0.3 && t < this.soulAt ? at.clone().addScaledVector(this.cam, 1.35).setY(P + 0.5) : null);
    this.setExtraVec('soulFrom', at.clone().setY(P + 0.4));
    return { anim: 'idle', visible: true };
  }

  // ---------------------------------------------------------------- the big green brute

  private smash(t: number): Shown {
    const b = this.size();
    const P = this.P;
    const L = this.left.clone();
    // Down onto the cobbles in front of the gallows: room for a brute to swing someone about.
    const B = this.V(2.3, -0.5, 0);
    const spot = B.clone().addScaledVector(L, 1.05).addScaledVector(this.cam, 0.6);
    const tall = b.box.max.y;
    if (!this.hulk) {
      this.hulk = brute();
      this.hulk.group.scale.setScalar(0.88);
      this.hulk.group.visible = false;
      this.keep(this.hulk.group);
      this.disposers.push(this.hulk.dispose);
    }
    const H = this.hulk;
    const k = this.hop(t, 0.25, new THREE.Vector3(0, P, 0), spot);
    this.at.copy(k > 0.5 ? spot : new THREE.Vector3(0, P, 0));
    this.turn.copy(this.face(this.cam));
    this.frame.look = this.world(B.clone().setY(1.3).addScaledVector(this.cam, -0.3));
    this.frame.radius = 3.6;
    // In from the right, stomping, the ground shaking at every step.
    const walkIn = [0.4, 2.0] as const;
    const walkOut = this.survives ? ([6.3, 7.4] as const) : ([7.0, 8.2] as const);
    const from = B.clone().addScaledVector(L, -6);
    const inK = span(t, walkIn[0], walkIn[1]);
    const outK = span(t, walkOut[0], walkOut[1]);
    H.group.visible = t > walkIn[0] && outK < 0.99;
    H.group.position.lerpVectors(from, B, inK).lerp(from, outK);
    const walking = (t > walkIn[0] && t < walkIn[1]) || (t > walkOut[0] && t < walkOut[1]);
    const stepPhase = t * 7;
    H.legs[0].rotation.x = walking ? Math.sin(stepPhase) * 0.5 : 0;
    H.legs[1].rotation.x = walking ? -Math.sin(stepPhase) * 0.5 : 0;
    H.body.position.y = 1.1 + (walking ? Math.abs(Math.sin(stepPhase)) * 0.06 : 0);
    H.group.quaternion.copy(this.face(t < walkIn[1] - 0.3 ? L : t > walkOut[0] ? L.clone().negate() : this.cam));
    if (walking) for (let n = 0; n < 12; n++) {
      const at = walkIn[0] + n * (Math.PI / 7);
      if (at < walkIn[1]) this.sfx('stomp', at, t);
    }
    if (walking) this.frame.shake = 0.12;
    this.sfx('roar', 2.1, t);
    const roar = span(t, 2.0, 2.2) * (1 - span(t, 2.7, 2.9));
    H.head.rotation.x = -roar * 0.4;
    // The grip: where the fist (and their feet) are, round a circle over the brute's head.
    // (A little in front of it, so they're not lost behind it.)
    const C = B.clone().addScaledVector(this.cam, 0.6).setY(1.45);
    const R = 1.25;
    const grabAt = 2.9;
    const liftTo = 3.3;
    const slams = this.survives ? 0 : 5;
    const swing = 0.42;
    const pause = 0.14;
    const slamsFrom = liftTo + 0.05;
    const done = slamsFrom + slams * (swing + pause);
    // The grip is on a circle over the brute's head: `theta` is how far round (0 out to the left, 90 straight up), and
    // `psi` the way their body points from it. Each slam whips them down until their head meets the cobbles.
    const rad = (d: number) => THREE.MathUtils.degToRad(d);
    const reachDown = THREE.MathUtils.radToDeg(Math.asin(Math.min(1, (C.y + Math.sin(rad(200)) * R - 0.12) / Math.max(0.3, tall))));
    const off = reachDown - 20;
    const side = (i: number) => (i % 2 ? -20 : 200);
    const ground = (a: number) => (a > 90 ? 180 + reachDown : -reachDown);
    const onCircle = (th: number) => C.clone().addScaledVector(L, Math.cos(rad(th)) * R).add(new THREE.Vector3(0, Math.sin(rad(th)) * R, 0));
    let grip = spot.clone();
    let psi = 90;
    let held = false;
    let hitNow = false;
    let reach: THREE.Vector3 | null = t > grabAt - 0.35 && t < grabAt ? spot.clone().setY(0.15) : null;
    if (t > grabAt && t < done) {
      held = true;
      if (t < liftTo) {
        // By the ankles, and up into the air, upside down.
        const u = span(t, grabAt, liftTo);
        grip = spot.clone().lerp(onCircle(90), u);
        grip.y += Math.sin(u * Math.PI) * 0.3;
        psi = THREE.MathUtils.lerp(90, 270, u);
      } else if (t < slamsFrom || slams === 0) {
        grip = onCircle(90);
        psi = 270;
      } else {
        const i = Math.min(slams - 1, Math.floor((t - slamsFrom) / (swing + pause)));
        const u = Math.min(1, (t - slamsFrom - i * (swing + pause)) / swing);
        const a0 = i === 0 ? 90 : side(i - 1);
        const a1 = side(i);
        const e = u * u;
        const theta = THREE.MathUtils.lerp(a0, a1, e);
        grip = onCircle(theta);
        // Trailing out as it swings, and whipped down flat at the end.
        const radial = theta - (off / 0.94) * Math.cos(rad(theta));
        psi = i === 0 ? THREE.MathUtils.lerp(270, ground(a1), e) : THREE.MathUtils.lerp(radial, ground(a1), span(u, 0.5, 1));
        hitNow = u >= 1;
      }
      reach = grip;
    }
    for (let n = 0; n < slams; n++) {
      const at = slamsFrom + n * (swing + pause) + swing;
      this.sfx('slam', at, t);
      this.once(`slam${n}`, at, t, () => {
        const g = onCircle(side(n));
        this.bursts.add(at, 'dust', this.world(g.addScaledVector(L, Math.sign(Math.cos(rad(side(n)))) * tall * 0.5).setY(0.1)), 1.0);
      });
    }
    if (this.survives && t > grabAt) {
      // Held up high... a long look... then set down again, gently.
      held = t < 4.6;
      const down = span(t, 4.0, 4.6);
      grip = onCircle(90).lerp(spot.clone().setY(tall), down);
      psi = THREE.MathUtils.lerp(270, 450, down);
      reach = held ? grip : null;
      H.head.rotation.z = span(t, 3.4, 3.7) * 0.3 * (1 - span(t, 3.9, 4.1));
    }
    if (held) {
      const dir = L.clone().multiplyScalar(Math.cos(rad(psi))).add(new THREE.Vector3(0, Math.sin(rad(psi)), 0)).normalize();
      this.turn.copy(basis(Y, Z, dir, this.cam));
      this.at.copy(grip);
      if (this.survives && t > 4.0) {
        // (Upright again by the end of it: held by the scruff, feet down.)
        this.at.copy(grip).addScaledVector(dir, -tall * span(t, 4.0, 4.6));
      }
      if (hitNow) {
        this.stretch.set(1.15, 0.85, 1.15);
        this.frame.shake = 0.5;
      }
    }
    // The arm reaches for the grip (the brute's right, on the left of the screen as it faces us).
    const arm = H.arms[0];
    H.group.updateMatrixWorld(true);
    if (reach) {
      const shoulder = arm.parent!.localToWorld(arm.position.clone());
      const want = this.world(reach).sub(shoulder);
      const inBody = want.clone().applyQuaternion(arm.parent!.getWorldQuaternion(new THREE.Quaternion()).invert());
      arm.quaternion.setFromUnitVectors(new THREE.Vector3(0, -1, 0), inBody.clone().normalize());
      arm.scale.y = THREE.MathUtils.clamp(inBody.length() / (1.38 * 0.88), 0.6, 1.5);
      // Leaning into each slam.
      H.body.rotation.z = THREE.MathUtils.clamp((reach.clone().sub(B).dot(L) / R) * -0.18, -0.3, 0.3);
    } else {
      arm.quaternion.identity();
      arm.scale.y = 1;
      H.body.rotation.z = 0;
    }
    H.arms[1].rotation.set(walking ? Math.sin(stepPhase) * 0.4 : -roar * 1.2, 0, roar * 0.4);
    if (!walking && !reach) arm.rotation.set(-roar * 1.2, 0, -roar * 0.4);
    if (this.survives) {
      // The pat, a little sign, and off it goes; and a cheer.
      const pat = t > 4.7 && t < 5.4 ? Math.abs(Math.sin((t - 4.7) * 9)) : 0;
      if (t > 4.6 && t < 5.5) {
        const shoulder = arm.parent!.localToWorld(arm.position.clone());
        const want = this.world(spot.clone().add(new THREE.Vector3(0, tall + 0.1 + pat * 0.1, 0))).sub(shoulder);
        const inBody = want.applyQuaternion(arm.parent!.getWorldQuaternion(new THREE.Quaternion()).invert());
        arm.quaternion.setFromUnitVectors(new THREE.Vector3(0, -1, 0), inBody.clone().normalize());
        arm.scale.y = THREE.MathUtils.clamp(inBody.length() / (1.38 * 0.88), 0.6, 1.5);
        this.stretch.set(1 + pat * 0.06, 1 - pat * 0.12, 1 + pat * 0.06);
      }
      this.sign('cute', 'Cute animal.', 2.3, 0.55, t, 5.3, 6.6, B.clone().setY(3.2), { bg: '#fffaf0', fg: '#4f8a2e', border: '#4f8a2e' });
      this.sfx('hmm', 3.5, t);
      if (!held && t > liftTo) {
        this.at.copy(spot);
        this.turn.copy(this.face(this.cam));
      }
      return { anim: t > 5.6 ? 'cheer' : held ? 'cry' : 'idle', visible: true };
    }
    // Dropped in a heap at the end, flat out on the ground; dusting off its hands, "Puny animal.", and away.
    if (!held && t > done) {
      const lie = basis(Y, Z, L, UP);
      const end = onCircle(side(slams - 1)).setY(0);
      this.stretch.set(1.1, 1.0, 0.75);
      this.put(lie, end.clone().addScaledVector(L, 0.1).setY(0), new THREE.Vector3(0, 0, this.thick().back));
      this.setExtraVec('soulFrom', end.clone().addScaledVector(L, tall * 0.5).setY(0.1));
      this.dizzyAt(t, t < this.soulAt ? end.clone().addScaledVector(L, tall * 0.8).setY(0.4) : null);
    }
    this.sign('puny', 'Puny animal.', 2.4, 0.55, t, done + 0.3, walkOut[0] + 0.5, B.clone().setY(3.2), { bg: '#fffaf0', fg: '#4f8a2e', border: '#4f8a2e' });
    this.sfx('hmph', done + 0.3, t);
    return { anim: held ? 'idle' : t > 2.0 ? 'cry' : 'idle', visible: true };
  }

  override dispose() {
    for (const s of this.signs.values()) s.dispose();
    this.signs.clear();
    super.dispose();
  }
}

