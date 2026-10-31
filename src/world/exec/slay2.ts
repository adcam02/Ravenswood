import * as THREE from 'three';
import type { Anim } from '../types';
import { disposeObject } from '../items';
import { Bolts, easeOut, hash, span } from './fx';
import { basis } from './stage';
import { littleCar, weightBench, type Car, type WeightBench } from './props2';
import { SlayStage } from './slay';
import {
  banana,
  bowlingPin,
  captureBall,
  coin,
  laserSword,
  pie,
  revolver,
  safe,
  springGlove,
  thunderHammer,
  tumbleweed,
  voidDome,
  type Banana,
  type CaptureBall,
  type LaserSword,
  type Revolver,
  type Safe,
  type SpringGlove,
  type ThunderHammer,
} from './slayProps2';

/**
 * The newer Slayer moves, on top of the first nine in slay.ts (whose stage, helpers and timings they share): a little
 * car, a bowling strike, the gym spotter, a standoff at high noon, the pistol taped to their back, Domain Expansion,
 * a laser sword duel, an energy wave, a capture ball, a fireball, the spring glove, a custard pie, a banana peel, a
 * thunder hammer, a head stomp and a falling safe. Each has its comic way of going wrong for when nothing happens.
 */

const X = new THREE.Vector3(1, 0, 0);
const Y = new THREE.Vector3(0, 1, 0);
const Z = new THREE.Vector3(0, 0, 1);
const tmpQ = new THREE.Quaternion();
const DARK = { bg: '#14102a', fg: '#cfe0ff', border: '#9ab8ff' };
const GOLDEN = { bg: '#fff6d8', fg: '#c07a10', border: '#e2b440' };

export class SlayShow extends SlayStage {
  private ride: Car | null = null;
  private pins: THREE.Group[] = [];
  private gym: WeightBench | null = null;
  private weed: THREE.Group | null = null;
  private gun: Revolver | null = null;
  private dome: ReturnType<typeof voidDome> | null = null;
  private blades: LaserSword[] = [];
  private orb: THREE.Group | null = null;
  private ray: THREE.Group | null = null;
  private ball: CaptureBall | null = null;
  private redRay: THREE.Mesh | null = null;
  private jack: SpringGlove | null = null;
  private custard: THREE.Group | null = null;
  private fruit: Banana | null = null;
  private hammer2: ThunderHammer | null = null;
  private zaps: Bolts | null = null;
  private gold: THREE.Group | null = null;
  private box: Safe | null = null;
  private shade: THREE.Mesh | null = null;
  private line: THREE.Mesh | null = null;

  protected override noBody(): boolean {
    return this.move === 'capture' || super.noBody();
  }

  protected override frazzled(): boolean {
    return this.move === 'beam' || this.move === 'hammer' || this.move === 'fireball' || super.frazzled();
  }

  // ---------------------------------------------------------------- helpers

  /** Something kept in the stage's own group (not popped in and out with the props), disposed with it. */
  private keep<T extends THREE.Object3D>(o: T): T {
    this.group.add(o);
    this.disposers.push(() => disposeObject(o));
    return o;
  }

  /** Across the line between them, flat (pointing away from the camera's side of things). */
  private side(): THREE.Vector3 {
    return new THREE.Vector3(-this.fwd.z, 0, this.fwd.x);
  }

  /** The claimer turned by `q` and stretched by `s`, their middle at `centre` (to roll or flip them about it). */
  private actorAbout(centre: THREE.Vector3, q: THREE.Quaternion, s = new THREE.Vector3(1, 1, 1)) {
    const h = this.aSize().box.max.y / 2;
    this.aTurn.copy(q);
    this.aStretch.copy(s);
    this.aAt.copy(centre).sub(new THREE.Vector3(0, h * s.y, 0).applyQuaternion(q));
  }

  /** The same for the one chosen. */
  private targetAbout(centre: THREE.Vector3, q: THREE.Quaternion) {
    const h = this.tall() / 2;
    this.turn.copy(q);
    this.at.copy(centre).sub(new THREE.Vector3(0, h * this.stretch.y, 0).applyQuaternion(q));
  }

  /** Squashed flat as a pancake, wobbling as it settles, with stars going round (as under the mallet). */
  private pancake(t: number, u: number, at: THREE.Vector3, flat = 0.12) {
    const k = easeOut(u / 0.08);
    const wob = u > 0.08 ? Math.exp(-(u - 0.08) * 6) * Math.sin((u - 0.08) * 30) * 0.06 : 0;
    this.stretch.set(1 + 0.7 * k + wob, Math.max(flat, 1 - (1 - flat) * k - wob), 1 + 0.7 * k + wob);
    this.setExtraVec('soulFrom', at.clone().setY(this.P));
    this.daze('t', t, u > 0.3 ? at.clone().setY(this.P + 0.25) : null, 0.3);
  }

  /** Flung back along `away` in an arc and over, landing `dist` off (the topple does the landing). */
  private flung(u: number, away: THREE.Vector3, dist: number, high: number, len = 0.55) {
    const k = span(u, 0, len);
    this.at.addScaledVector(away, dist * k);
    this.at.y += Math.sin(k * Math.PI) * high;
    this.topple(u, away, len * 0.4, len * 0.6);
  }

  /** A soft glowing ball (a fireball, an energy wave's charge): a white core in a coloured glow (radius 1: scale it). */
  private glowBall(color: string): THREE.Group {
    const g = new THREE.Group();
    const geo = new THREE.IcosahedronGeometry(1, 2);
    const core = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: '#ffffff' }));
    core.scale.setScalar(0.55);
    const halo = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.55, depthWrite: false, blending: THREE.AdditiveBlending }));
    g.add(core, halo);
    return g;
  }

  /** Where the claimer's head is now (in the stage's frame), roughly. */
  private aHead(): THREE.Vector3 {
    return this.aAt.clone().addScaledVector(Y, this.aSize().box.max.y * 0.85 * this.aStretch.y);
  }

  // ---------------------------------------------------------------- the moves

  protected override newer(t: number, kill: boolean): Anim | void {
    switch (this.move) {
      case 'car':
        return this.drive(t, kill);
      case 'bowling':
        return this.bowl(t, kill);
      case 'spotter':
        return this.spot(t, kill);
      case 'standoff':
        return this.highNoon(t, kill);
      case 'taped':
        return this.taped(t, kill);
      case 'domain':
        return this.domain(t, kill);
      case 'laser':
        return this.duel(t, kill);
      case 'beam':
        return this.wave(t, kill);
      case 'capture':
        return this.capture(t, kill);
      case 'fireball':
        return this.fireball(t, kill);
      case 'glove':
        return this.boing(t, kill);
      case 'pie':
        return this.custardPie(t, kill);
      case 'banana':
        return this.slip(t, kill);
      case 'hammer':
        return this.thunder(t, kill);
      case 'stomp':
        return this.stomp(t, kill);
      case 'safe':
        return this.safeDrop(t, kill);
    }
  }

  protected override downsNewer(t: number, u: number): Anim | null {
    const away = this.fwd.clone();
    switch (this.move) {
      // (Posed by the move itself.)
      case 'spotter':
      case 'capture':
      case 'banana':
      case 'safe':
      case 'domain':
        return 'idle';
      case 'car':
      case 'stomp':
        this.pancake(t, u, this.B);
        return 'idle';
      case 'bowling': {
        // Sent flying like a pin: up, spinning end over end, and down on their back well behind.
        const k = span(u, 0, 0.9);
        const flight = away.clone().addScaledVector(this.side(), -0.4).normalize();
        const centre = this.B.clone().addScaledVector(flight, 1.3 * k).setY(this.P + this.tall() / 2 + Math.sin(k * Math.PI) * 1.2);
        const spin = tmpQ.setFromAxisAngle(new THREE.Vector3(-flight.z, 0, flight.x), -easeOut(k) * (Math.PI * 2 + Math.PI / 2 - 0.04));
        this.targetAbout(centre, spin.clone().multiply(this.face(this.dirT)));
        if (k >= 1) this.targetAbout(centre.setY(this.P + Math.max(0.12, this.size().box.max.z * 0.6)), this.turn.clone());
        this.sfx('thud', this.hit + 0.9, t);
        this.once('land', this.hit + 0.9, t, () => this.bursts.add(this.hit + 0.9, 'dust', this.world(centre.clone().setY(this.P)), 0.7));
        this.setExtraVec('soulFrom', centre.clone().setY(this.P));
        return 'cry';
      }
      case 'standoff':
      case 'laser': {
        // A slow spin round, and over.
        const k = easeOut(u / 0.8);
        this.turn.multiply(tmpQ.setFromAxisAngle(Y, k * Math.PI * 2.5));
        if (u > 0.8) this.topple(u - 0.8, away, 0, 0.45);
        return 'cry';
      }
      case 'beam':
      case 'fireball':
      case 'hammer': {
        // Sooty, frazzled and blown back.
        this.tint('#2a2420', span(u, 0, 0.15) * 0.8);
        this.flung(u, away, this.move === 'beam' ? 1.3 : 0.8, this.move === 'beam' ? 0.9 : 0.5);
        return 'cry';
      }
      case 'glove':
        this.flung(u, away, 1.5, 0.8, 0.6);
        return 'cry';
      case 'pie': {
        // Splat: a stagger with a faceful of cream, and over backwards.
        const wob = Math.sin(u * 9) * 0.12 * (1 - span(u, 0.5, 0.9));
        this.turn.multiply(tmpQ.setFromAxisAngle(Z, wob));
        this.topple(u, away, 0.8, 0.45);
        return 'cry';
      }
      case 'taped': {
        const jolt = Math.exp(-u * 10) * Math.min(1, u * 20) * 0.12;
        this.at.addScaledVector(away, jolt);
        this.topple(u, away, 0.25, 0.45);
        return 'cry';
      }
    }
    return null;
  }

  protected override shrugsNewer(t: number, u: number) {
    if ((this.move === 'car' || this.move === 'glove') && u > 0 && u < 0.6) {
      // A little bump, and a wobble.
      const k = Math.exp(-u * 6) * Math.sin(u * 30);
      this.turn.multiply(tmpQ.setFromAxisAngle(X, k * 0.12));
    } else if (this.move === 'stomp' && u > 0) {
      const k = u < 0.06 ? u / 0.06 : Math.exp(-(u - 0.06) * 5) * Math.cos((u - 0.06) * 22);
      this.stretch.set(1 + k * 0.25, 1 - k * 0.35, 1 + k * 0.25);
      this.sfx('boing', this.hit, t);
    }
  }

  // ---------------------------------------------------------------- a little red car

  private drive(t: number, kill: boolean) {
    const s = THREE.MathUtils.clamp(this.aSize().box.max.y * 0.75, 0.7, 1.1);
    if (!this.ride) {
      this.ride = littleCar('#d8402f', true);
      this.prop(this.ride.group, s);
    }
    const C = this.ride;
    const half = 1.0 * s;
    const start = this.A.clone().addScaledVector(this.fwd, -0.5);
    const depth = Math.max(this.size().box.max.z, 0.22);
    // How far along it is when its bumper meets them.
    const meet = start.distanceTo(this.B) - half - depth * 0.6;
    const go = 2.2;
    let along = -0.25 * span(t, 1.0, 1.5) * (1 - span(t, go - 0.1, go));
    let lift = 0;
    let pitch = 0;
    this.sfx('honk', 0.7, t);
    for (let n = 0; n < 3; n++) this.sfx('putt', 1.1 + n * 0.35, t);
    // Revving: shaking on its springs, a puff out the back each time.
    const rev = t > 1.0 && t < go ? Math.sin(t * 40) * 0.025 : 0;
    for (let n = 0; n < 3; n++) {
      const at = 1.15 + n * 0.35;
      this.once(`rev${n}`, at, t, () => this.bursts.add(at, 'smoke', this.world(start.clone().addScaledVector(this.fwd, -half - 0.1).setY(this.P + 0.25)), 0.5));
    }
    if (kill) {
      this.sfx('skid', go, t);
      const T = this.hit - go;
      const v = (2 * meet) / T;
      const over = 2 * half + depth * 1.6 + 0.6;
      const stop = (2 * over) / v;
      if (t > go && t < this.hit) along = meet * ((t - go) / T) ** 2;
      else if (t >= this.hit) {
        const u = Math.min(stop, t - this.hit);
        along = meet + v * u - (v / (2 * stop)) * u * u;
      }
      // Up and over them: nose up, then down.
      const k = THREE.MathUtils.clamp((along - meet) / (2 * half), 0, 1);
      lift = Math.sin(k * Math.PI) * 0.18 * s;
      pitch = -Math.sin(k * Math.PI * 2) * 0.18;
      this.sfx('skid', this.hit + stop - 0.4, t);
      this.sfx('honk', this.hit + stop + 0.2, t);
    } else {
      // A cough, a splutter, and a crawl the rest of the way, to bump them ever so gently.
      this.sfx('sputter', go, t);
      if (t > go) {
        const k = span(t, go, this.hit);
        along = meet * k + Math.sin(k * Math.PI * 6) * 0.04 * (1 - k);
      }
      this.sfx('meep', this.hit, t);
      this.once('stall', this.hit + 0.3, t, () => this.bursts.add(this.hit + 0.3, 'soot', this.world(start.clone().addScaledVector(this.fwd, meet + half * 0.7).setY(this.P + 0.6 * s)), 0.7));
      this.sfx('fizzle', this.hit + 0.3, t);
    }
    const at = start.clone().addScaledVector(this.fwd, along).setY(this.P + lift);
    C.group.position.copy(at);
    C.group.quaternion.copy(this.face(this.fwd)).multiply(tmpQ.setFromAxisAngle(X, pitch));
    C.body.position.y = rev + (!kill && t > this.hit + 0.3 ? -0.05 * span(t, this.hit + 0.3, this.hit + 0.6) : 0);
    C.wheels.forEach((w) => (w.rotation.x = (along / (C.r * s)) % (Math.PI * 2)));
    this.popProps(t, [this.world(at.clone().setY(this.P + 0.6))]);
    // The claimer at the wheel (in from the side, as the car arrives).
    const seat = new THREE.Vector3(-0.24, 0.3 + C.body.position.y, -0.02).multiplyScalar(s).applyQuaternion(C.group.quaternion);
    this.aAt.copy(at).add(seat);
    this.aTurn.copy(C.group.quaternion);
    this.aAnim = 'sit';
    this.aVisible = t > 0.15 && t < this.end - 0.45;
    if (!kill && t > this.hit + 0.6) this.aAnim = 'cry';
    this.aBusy = true;
    this.frame.radius += 0.4;
  }

  // ---------------------------------------------------------------- bowling

  private bowl(t: number, kill: boolean) {
    const aH = this.aSize().box.max.y;
    const side = this.side();
    // Two more pins either side, a little behind, so it reads as a lane.
    if (!this.pins.length) {
      for (let i = 0; i < 2; i++) {
        const p = bowlingPin();
        this.prop(p, 1);
        this.pins.push(p);
      }
    }
    const pinH = THREE.MathUtils.clamp(this.tall() * 0.8, 0.55, 1.1);
    const homes = [-1, 1].map((sx) => this.B.clone().addScaledVector(this.fwd, 0.4).addScaledVector(side, sx * 0.55));
    this.popProps(t, homes.map((h) => this.world(h.clone().setY(this.P + 0.4))));
    // The one chosen stands in for the head pin: chalky white.
    this.tint('#ffffff', span(t, 0.3, 0.8) * 0.8);
    this.once('pin', 0.3, t, () => this.bursts.add(0.3, 'poof', this.world(this.B.clone().setY(this.P + this.tall() * 0.6)), 0.8));
    // A crouch, curled up into a ball, and away.
    const curl = span(t, 0.9, 1.4);
    const s = new THREE.Vector3(1 - 0.12 * curl, 1 - 0.38 * curl, 1 - 0.12 * curl);
    const r = (aH / 2) * s.y;
    const back = this.A.clone().addScaledVector(this.fwd, -0.3 * span(t, 0.4, 0.9));
    const roll = 1.5;
    const reach = this.B.clone().addScaledVector(this.fwd, -(Math.max(this.size().box.max.z, 0.2) + r * 0.8));
    let centre = back.clone().setY(this.P + r);
    let dist = 0;
    let wobble = 0;
    if (t > roll) {
      const T = this.hit - roll;
      const k = Math.min(1, (t - roll) / T);
      const d = back.distanceTo(reach);
      dist = d * (k * k * 0.5 + k * 0.5);
      if (kill) {
        if (t > this.hit) dist = d + Math.min(1.2, (t - this.hit) * 1.6) * (1 - Math.min(1, (t - this.hit) / 2.2) * 0.4);
        centre = back.clone().addScaledVector(this.fwd, dist).setY(this.P + r);
      } else {
        // Hooking off to the side, into the gutter, and past.
        dist = d * (k * k * 0.5 + k * 0.5) + Math.max(0, t - this.hit) * 1.2 * (1 - span(t, this.hit + 0.6, this.hit + 1.2) * 0.6);
        const hook = Math.max(0, (dist - d * 0.45) / (d * 0.55));
        centre = back.clone().addScaledVector(this.fwd, dist).addScaledVector(side, -Math.min(1.1, hook * hook * 0.9)).setY(this.P + r);
        wobble = t > this.hit ? 1 : 0;
      }
    }
    const spin = tmpQ.setFromAxisAngle(X, dist / Math.max(0.2, r));
    // Up again, unrolled, at the far end.
    const up = span(t, this.hit + (kill ? 1.1 : 1.3), this.hit + (kill ? 1.5 : 1.7));
    const q = this.face(this.fwd).multiply(spin);
    if (up > 0) q.slerp(this.face(kill ? this.cam : this.fwd.clone().negate().addScaledVector(this.cam, 0.6).normalize()), up);
    s.lerp(new THREE.Vector3(1, 1, 1), up);
    this.actorAbout(centre.clone().setY(this.P + (aH / 2) * s.y + Math.sin(up * Math.PI) * 0.2), q, s);
    this.aAnim = t < roll ? (t > 0.4 ? 'work' : 'idle') : 'idle';
    this.aBusy = up < 1 || !kill;
    this.sfx('whoosh', roll, t);
    this.sfx('rumble', roll + 0.1, t);
    // The other pins: a clatter every which way, or a wobble and still standing.
    this.pins.forEach((p, i) => {
      const home = homes[i];
      const sx = i ? 1 : -1;
      p.children.forEach((c) => c.scale.setScalar(pinH / 0.4));
      p.position.copy(home);
      p.rotation.set(0, 0, 0);
      const u = t - this.hit - 0.05;
      if (kill && u > 0) {
        const k = span(u, 0, 0.8);
        p.position.addScaledVector(this.fwd, 0.8 * k).addScaledVector(side, sx * 0.9 * k);
        p.position.y = this.P + Math.sin(k * Math.PI) * 0.9;
        p.rotateOnAxis(this.fwd.clone().cross(Y).normalize(), -sx * easeOut(k) * (Math.PI * 2.5));
        if (k >= 1) p.rotation.set(0, Math.atan2(this.fwd.x, this.fwd.z), sx * (Math.PI / 2));
      } else if (!kill && u > 0 && wobble) {
        p.rotation.z = Math.sin(u * 14 + i) * 0.15 * Math.exp(-u * 2);
      }
    });
    const sign = this.B.clone().setY(this.P + this.tall() + 0.7).addScaledVector(this.cam, 0.3);
    if (kill) {
      this.sfx('clatter', this.hit, t);
      this.sfx('flags', this.hit + 0.25, t);
      this.once('strike', this.hit, t, () => this.bursts.add(this.hit, 'sparkle', this.world(this.B.clone().setY(this.P + 0.5)), 1));
      this.sign('strike', 'STRIKE!', t, this.hit + 0.2, this.end - 0.6, sign, 1.2, 0.42, GOLDEN);
    } else {
      this.sfx('rumble', this.hit, t);
      this.sfx('wahwah', this.hit + 0.6, t);
      this.sign('gutter', 'Gutter ball…', t, this.hit + 0.4, this.end - 0.5, sign, 1.4, 0.36);
      if (up > 0) this.daze('a', t, up > 0.5 && t < this.end - 0.5 ? this.aHead().addScaledVector(Y, 0.15) : null);
      if (up >= 1) this.aAnim = 'cry';
    }
    if (up >= 1 && kill) this.aAnim = 'cheer';
    this.frame.radius += 0.5;
  }

  // ---------------------------------------------------------------- the gym spotter

  private spot(t: number, kill: boolean): Anim {
    const b = this.size();
    const P = this.P;
    const mid = b.box.getCenter(new THREE.Vector3());
    const depth = THREE.MathUtils.clamp((b.box.max.x - b.box.min.x) * 0.8, 0.28, 0.9);
    const back = Math.max(b.box.min.z, b.head.z - depth * 0.55);
    const len = b.box.max.y - b.box.min.y;
    const padY = 0.5;
    // The bench end on to us, its head end (and the rack) away from the camera, so the bar runs across the picture
    // and the spotter stands behind it, facing us.
    const head = this.cam.clone().negate().multiplyScalar(0.9).addScaledVector(this.fwd, -0.3).normalize();
    const centre = this.B.clone().addScaledVector(this.fwd, -0.2).addScaledVector(this.cam, 0.3).setY(P);
    const chest = (b.neck.y - mid.y) * 0.55;
    const hookY = padY + depth + 0.42;
    if (!this.gym) {
      this.gym = weightBench(Math.max(0.9, len + 0.25), padY, chest, hookY);
      this.gym.group.quaternion.copy(basis(X, Y, head, Y));
      this.gym.group.position.copy(centre);
      this.prop(new THREE.Group().add(this.gym.group), 1);
      this.disposers.push(this.gym.dispose);
    }
    const W = this.gym;
    this.popProps(t, [this.world(centre.clone().setY(P + 0.6))]);
    // Onto the bench with a hop, face up.
    const hop = span(t, 0.5, 0.8);
    this.once('hop', 0.5, t, () => this.bursts.add(0.5, 'poof', this.world(this.B.clone().setY(P + 0.5)), 0.7));
    const lay = basis(Y, Z, head, Y.clone().addScaledVector(this.cam, 0.35).normalize());
    const put = () => {
      this.turn.copy(lay);
      this.at.copy(centre).setY(P + padY).sub(new THREE.Vector3(mid.x, mid.y, back).multiply(this.stretch).applyQuaternion(lay));
    };
    // The spotter behind the rack, paws under the bar.
    const post = centre.clone().addScaledVector(head, Math.max(0.9, len + 0.25) / 2 + chest + 0.45);
    const walk = span(t, 0.6, 1.4);
    this.aAt.lerpVectors(this.A, post, walk);
    this.aTurn.copy(this.face(walk > 0.5 ? head.clone().negate().addScaledVector(this.cam, 0.3).normalize() : this.fwd));
    this.aAnim = t > 0.6 && t < 1.4 ? 'walk' : t > 1.4 && t < 2.95 ? 'work' : 'idle';
    this.aBusy = true;
    const rest = W.rest.clone();
    const low = padY + depth + 0.1;
    const top = low + 0.3;
    // Off the hooks, down to the chest, and a few wobbly reps, slower and slower.
    let y = rest.y;
    if (t > 1.4) y = THREE.MathUtils.lerp(rest.y, low, span(t, 1.4, 1.8));
    if (t > 1.8) y = low + (top - low) * Math.abs(Math.sin((t - 1.8) * 2.6));
    const letGo = 2.95;
    if (t > letGo) y = THREE.MathUtils.lerp(low + (top - low) * Math.abs(Math.sin((letGo - 1.8) * 2.6)), top, span(t, letGo, this.hit - 0.1));
    this.sfx('strain', 1.9, t);
    const over = this.aAt.clone().setY(P + this.aSize().box.max.y + 0.55).addScaledVector(this.cam, 0.2);
    this.sign('got', 'I’ve got you!', t, 1.5, 2.3, over, 1.3, 0.34);
    this.sign('one', 'One more!', t, 2.35, 2.95, over, 1.1, 0.34);
    this.sign('oops', 'Oops.', t, letGo + 0.05, this.hit + 0.9, over, 0.7, 0.34);
    if (t > letGo) this.aAnim = 'wave';
    let squash = 0;
    let anim: Anim = t > 1.8 && t < this.hit ? 'cry' : 'idle';
    if (t > this.hit) {
      const u = t - this.hit;
      if (kill) {
        const fall = Math.min(1, u / 0.14);
        const bottom = padY + depth * 0.2 + 0.03;
        y = THREE.MathUtils.lerp(top, bottom, fall * fall);
        if (u > 0.14) y = bottom + Math.abs(Math.sin((u - 0.14) * 16)) * Math.exp(-(u - 0.14) * 8) * 0.06;
        squash = fall * 0.8;
        this.sfx('clank', this.hit + 0.12, t);
        this.once('bang', this.hit + 0.12, t, () => this.bursts.add(this.hit + 0.12, 'dust', this.world(centre.clone().setY(P + padY)), 0.6));
        this.frame.shake = Math.exp(-u * 5) * 0.4;
      } else {
        // Caught with one paw, as if it were nothing, and pumped like a feather.
        const fall = Math.min(1, u / 0.1);
        y = THREE.MathUtils.lerp(top, low + 0.05, fall);
        if (u > 0.3) y = low + 0.05 + Math.abs(Math.sin((u - 0.3) * 8)) * 0.35 * (1 - span(u, 1.6, 1.9));
        this.sfx('boing', this.hit + 0.1, t);
        this.sign('light', 'Light weight!', t, this.hit + 0.4, this.end - 0.5, centre.clone().setY(P + padY + depth + 0.9).addScaledVector(this.cam, 0.3), 1.4, 0.36, GOLDEN);
        anim = u > 0.3 ? 'laugh' : 'idle';
        if (u > 0.6) this.aAnim = 'cry';
      }
    }
    W.barbell.position.set(rest.x, y, rest.z);
    W.barbell.rotation.x = t > 1.8 && t < this.hit ? Math.sin(t * 13) * 0.06 : 0;
    if (t < 0.5) return t > 0.3 ? 'cry' : 'idle';
    this.stretch.set(1 + squash * 0.3, 1 + squash * 0.3, 1 - squash);
    put();
    if (hop < 1) {
      // (Mid-hop: from standing to lying, up and over.)
      const stand = this.B.clone();
      const standTurn = this.face(this.dirT);
      this.at.lerpVectors(stand, this.at, hop).addScaledVector(Y, Math.sin(hop * Math.PI) * 0.4);
      this.turn.slerpQuaternions(standTurn, lay, hop);
    }
    if (kill) {
      this.daze('t', t, t > this.hit + 0.3 && t < this.soulAt ? centre.clone().addScaledVector(head, len * 0.42).setY(P + padY + 0.35) : null);
      this.setExtraVec('soulFrom', centre.clone().setY(P + padY + 0.1));
    }
    return anim;
  }

  // ---------------------------------------------------------------- high noon

  private highNoon(t: number, kill: boolean): Anim | void {
    // Ten paces apart (well, a few), a tumbleweed between them, a lonely whistle, and the draw.
    const apart = span(t, 0.3, 1.3) * 0.45;
    this.aAt.addScaledVector(this.fwd, -apart);
    this.at.addScaledVector(this.fwd, apart);
    const walking = t > 0.3 && t < 1.3;
    this.aAnim = walking ? 'walk' : 'idle';
    this.aTurn.copy(this.face(walking ? this.fwd.clone().negate() : this.dirA));
    if (walking) this.turn.copy(this.face(this.fwd));
    const half = this.A.distanceTo(this.B) / 2 + 0.45;
    this.frame.radius = Math.max(this.frame.radius, half + 0.9);
    this.sfx('whistletune', 1.0, t);
    if (!this.weed) this.weed = this.prop(tumbleweed(), 1);
    if (!this.gun) {
      this.gun = revolver();
      this.prop(this.gun.group);
      this.disposers.push(this.gun.dispose);
    }
    const mid = this.A.clone().lerp(this.B, 0.5);
    // The tumbleweed bowls across between them (and back again if it all goes quiet).
    const across = (k: number) => mid.clone().addScaledVector(this.cam, THREE.MathUtils.lerp(-2.6, 2.6, k));
    let wk = span(t, 1.3, 3.2);
    if (!kill) wk = wk - span(t, this.hit + 0.6, this.hit + 2.4);
    const wAt = across(wk);
    wAt.y = this.P + 0.22 + Math.abs(Math.sin(t * 5)) * 0.25;
    this.weed.position.copy(wAt);
    this.weed.rotation.set(t * 4, 0, 0);
    this.weed.children[0].scale.setScalar(0.22);
    this.weed.visible = wk > 0.001 && wk < 0.999;
    // The six-shooter at the hip, and the draw: up and level in a blink.
    const draw = this.hit - 0.3;
    const hip = this.paw(0.35, 0.5).addScaledVector(this.cam, 0.05);
    const grip = this.paw(0.55);
    const d = span(t, draw, draw + 0.12);
    const G = this.gun;
    const from = hip.clone().lerp(grip, d);
    const chest = this.B.clone().addScaledVector(this.fwd, apart).setY(this.P + this.tall() * 0.55);
    const down = from.clone().addScaledVector(Y, -1);
    const kick = t > this.hit ? Math.exp(-(t - this.hit) * 10) * 0.3 : 0;
    this.aim(G.group, from, down.lerp(chest, d).addScaledVector(Y, kick));
    this.popProps(t, [this.world(hip), this.world(wAt)]);
    // Twitchy paws while it's quiet; then "Draw!".
    if (t > 2.4 && t < draw) this.aAnim = Math.sin(t * 6) > 0.6 ? 'hand' : 'idle';
    if (t > draw) this.aAnim = 'fish';
    this.sign('draw', 'DRAW!', t, draw - 0.7, draw + 0.1, mid.clone().setY(this.P + Math.max(this.tall(), this.aSize().box.max.y) + 0.7), 0.9, 0.4);
    const muzzle = this.world(G.muzzle.clone().multiplyScalar(this.kit()).applyQuaternion(G.group.quaternion).add(G.group.position));
    if (kill) {
      this.sfx('bang', this.hit, t);
      this.once('shot', this.hit, t, () => {
        this.bursts.add(this.hit, 'flash', muzzle, 0.7);
        this.bursts.add(this.hit + 0.03, 'smoke', muzzle, 0.6);
      });
      if (t > this.hit) this.aAnim = 'fish';
      // Blowing the smoke off the end.
      if (t > this.hit + 1.0) this.aAnim = 'cheer';
    } else {
      this.sfx('click', this.hit, t);
      this.sfx('click', this.hit + 0.25, t);
      this.sign('click', 'click.', t, this.hit + 0.1, this.end - 0.5, grip.clone().addScaledVector(Y, 0.55).addScaledVector(this.cam, 0.2), 0.6, 0.28);
      this.sfx('wahwah', this.hit + 0.7, t);
      if (t > this.hit + 0.5) this.aAnim = 'cry';
      this.aBusy = true;
    }
    if (t > 1.3 && t < this.hit) return 'idle';
  }

  // ---------------------------------------------------------------- the pistol taped to their back

  private taped(t: number, kill: boolean) {
    if (!this.gun) {
      this.gun = revolver(true);
      this.prop(this.gun.group);
      this.disposers.push(this.gun.dispose);
    }
    const G = this.gun;
    const aB = this.aSize().box;
    // Hands up, turned round to show they've nothing on them (and the pistol taped to their back for all to see).
    const turn = span(t, 0.4, 0.9) * (1 - span(t, 2.2, 2.5));
    const away = this.cam.clone().negate().addScaledVector(this.fwd, 0.3).normalize();
    const facing = this.dirA.clone().lerp(away, turn).normalize();
    this.aTurn.copy(this.face(facing));
    this.aAnim = t > 0.3 && t < 2.5 ? 'cheer' : 'idle';
    this.sign('unarmed', 'I’m unarmed!', t, 0.9, 2.2, this.aAt.clone().setY(this.P + aB.max.y + 0.6).addScaledVector(this.cam, 0.2), 1.3, 0.34);
    // On their back, pointing up the spine.
    const backDir = new THREE.Vector3(0, 0, -1).applyQuaternion(this.aTurn);
    const onBack = this.aAt.clone().addScaledVector(backDir, Math.max(0.12, -aB.min.z * 0.6) + 0.04).addScaledVector(Y, aB.max.y * 0.5);
    const grip = this.paw(0.55);
    const chest = this.onTarget(0.55, 0.1);
    const whip = span(t, 2.55, 2.8);
    const kick = t > this.hit ? Math.exp(-(t - this.hit) * 10) * 0.3 : 0;
    if (whip <= 0) {
      this.aim(G.group, onBack, onBack.clone().addScaledVector(Y, 1), Math.PI / 2);
    } else {
      const at = onBack.clone().lerp(grip, whip).addScaledVector(Y, Math.sin(whip * Math.PI) * 0.3);
      const look = at.clone().addScaledVector(Y, 1).lerp(chest.clone().addScaledVector(Y, kick), whip);
      this.aim(G.group, at, look, (1 - whip) * Math.PI * 2.5);
      if (t > 2.6) this.aAnim = 'fish';
    }
    this.sfx('whoosh', 2.55, t);
    this.popProps(t, [this.world(onBack)]);
    const muzzleLocal = G.muzzle.clone().multiplyScalar(this.kit()).applyQuaternion(G.group.quaternion).add(G.group.position);
    if (kill) {
      this.sfx('bang', this.hit, t);
      this.once('shot', this.hit, t, () => {
        this.bursts.add(this.hit, 'flash', this.world(muzzleLocal), 0.8);
        this.bursts.add(this.hit + 0.03, 'smoke', this.world(muzzleLocal), 0.7);
      });
      this.sign('bang', 'BANG!', t, this.hit, this.hit + 1.2, muzzleLocal.clone().addScaledVector(Y, 0.45).addScaledVector(this.cam, 0.2), 0.9, 0.4);
      return;
    }
    // Out pops a little flag on a stick: BANG! It droops.
    const out = span(t, this.hit, this.hit + 0.15);
    G.flag.scale.setScalar(Math.max(0.001, out * (1 + 0.2 * Math.sin(Math.min(1, Math.max(0, t - this.hit) / 0.3) * Math.PI))));
    G.flag.rotation.x = span(t, this.hit + 0.9, this.hit + 1.4) * 0.9;
    this.sfx('pop', this.hit, t);
    this.sfx('wahwah', this.hit + 0.9, t);
    if (t > this.hit + 1.0) this.aAnim = 'cry';
    this.aBusy = t > this.hit;
  }

  // ---------------------------------------------------------------- Domain Expansion

  private domain(t: number, kill: boolean): Anim {
    const aH = this.aSize().box.max.y;
    const mid = this.A.clone().lerp(this.B, 0.5).setY(this.P);
    const R = this.A.distanceTo(this.B) / 2 + 1.6;
    if (!this.dome) {
      this.dome = voidDome();
      this.group.add(this.dome.group);
      this.disposers.push(this.dome.dispose);
    }
    // A hand sign, the words, and the void opening out round the two of them.
    this.aAnim = t > 0.3 && t < 2.6 ? 'hand' : 'idle';
    this.aBusy = true;
    const over = mid.clone().setY(this.P + Math.max(aH, this.tall()) + 0.9).addScaledVector(this.cam, 0.4);
    this.sign('de', 'Domain Expansion', t, 0.8, 2.3, over, 1.9, 0.36, DARK);
    this.sign('iv', 'Infinite Void', t, 2.5, this.hit - 0.1, over, 1.6, 0.36, DARK);
    this.sfx('chord', 0.8, t);
    this.sfx('void', 2.0, t);
    const open = easeOut(span(t, 2.0, 2.7));
    const close = kill ? span(t, this.hit + 1.2, this.hit + 1.8) : span(t, this.hit - 0.5, this.hit);
    let r = R * open * (1 - close);
    let at = mid;
    if (!kill) {
      // It folds up small... around the claimer's own head, and pops.
      const head = this.aHead().setY(this.aHead().y - 0.2);
      at = mid.clone().lerp(head, close);
      r = THREE.MathUtils.lerp(R * open, 0.3, close) * (1 - span(t, this.hit + 0.5, this.hit + 0.6));
      this.sfx('pop', this.hit + 0.5, t);
      this.once('pop', this.hit + 0.5, t, () => this.bursts.add(this.hit + 0.5, 'sparkle', this.world(head.clone().addScaledVector(Y, 0.2)), 0.8));
      this.sign('out', 'Out of cursed energy…', t, this.hit + 0.6, this.end - 0.5, over, 2.0, 0.34, DARK);
    }
    this.dome.group.position.copy(at);
    this.dome.group.scale.setScalar(Math.max(0.001, r));
    this.dome.group.visible = r > 0.01;
    this.dome.group.rotation.y = t * 0.15;
    // Stars streaming into them: everything there is to know, all at once.
    let anim: Anim = 'idle';
    if (t > 2.7 && t < this.hit && kill) {
      for (let n = 0; n < 6; n++) {
        const a = 2.8 + n * 0.28;
        this.once(`know${n}`, a, t, () => this.bursts.add(a, 'sparkle', this.world(this.onTarget(0.85, 0.1)), 0.5 + n * 0.1));
      }
      // Frozen stiff, eyes wide: just a tremble.
      this.at.addScaledVector(this.left, Math.sin(t * 60) * 0.01 * span(t, 2.8, 3.4));
    }
    if (kill && t > this.hit) {
      const u = t - this.hit;
      this.sfx('twinkle', this.hit, t);
      this.once('over', this.hit, t, () => this.bursts.add(this.hit, 'flash', this.world(this.onTarget(0.7, 0)), 1.6));
      // Overwhelmed: a long slow tip over, as stiff as a board.
      this.topple(u, this.fwd.clone(), 0.3, 0.7);
      this.daze('t', t, u > 1.0 ? this.B.clone().setY(this.P + 0.3) : null, 0.3);
      this.aAnim = u > 0.5 ? 'cheer' : 'hand';
    }
    if (!kill && t > this.hit + 0.6) this.aAnim = 'cry';
    if (!kill && t > this.hit) anim = 'laugh';
    this.frame.low = 0.2 * open * (1 - close);
    return anim;
  }

  // ---------------------------------------------------------------- the laser sword duel

  private duel(t: number, kill: boolean) {
    if (!this.blades.length) {
      for (const color of ['#4aa8ff', '#ff3a3a']) {
        const s = laserSword(color, 0.62);
        this.prop(s.group);
        this.blades.push(s);
      }
    }
    const [mine, theirs] = this.blades;
    // Closer, for the clashes.
    const near = this.A.clone().lerp(this.B, 0.22);
    const step = span(t, 0.9, 1.3);
    this.aAt.lerpVectors(this.A, near, step);
    this.aAnim = t > 0.9 && t < 1.3 ? 'run' : t > 0.3 ? 'fish' : 'idle';
    const grip = this.paw(0.55);
    // (The one chosen holds theirs out the same way, towards the claimer.)
    const tb = this.size().box;
    const tGrip = this.at.clone().addScaledVector(this.fwd, -(tb.max.z * 0.55 + 0.12)).addScaledVector(this.cam, 0.14).addScaledVector(Y, Math.max(0.3, tb.max.y * 0.55));
    this.popProps(t, [this.world(grip), this.world(tGrip)]);
    // Lit with a snap-hiss.
    const lit = (k: number) => Math.max(0.001, k);
    mine.blade.scale.z = lit(span(t, 0.4, 0.6));
    theirs.blade.scale.z = lit(span(t, 0.55, 0.75));
    this.sfx('saber', 0.4, t);
    // Three clashes in the middle (high, low, high), sparks each time; then a twirl and the last swing.
    const meet = grip.clone().lerp(tGrip, 0.5);
    const clashes = [1.5, 2.1, 2.7];
    let up = 0.6;
    let at = meet.clone().addScaledVector(Y, 0.5);
    clashes.forEach((c, i) => {
      const k = Math.exp(-((t - c) ** 2) * 30);
      const h = i === 1 ? -0.1 : 0.45;
      if (Math.abs(t - c) < 0.3) at = meet.clone().addScaledVector(Y, h + (1 - k) * 0.3);
      this.sfx('clash', c, t);
      this.once(`spark${i}`, c, t, () => this.bursts.add(c, 'sparks', this.world(meet.clone().addScaledVector(Y, h)), 0.6));
    });
    if (t < 1.3) at = grip.clone().addScaledVector(Y, 1).addScaledVector(this.fwd, 0.3);
    const twirl = span(t, 2.9, this.hit - 0.15);
    if (t > 2.9) {
      this.aTurn.multiply(tmpQ.setFromAxisAngle(Y, -twirl * Math.PI * 2));
      up = 0.6 - twirl * 0.4;
      at = grip.clone().addScaledVector(this.fwd, 1).addScaledVector(Y, up);
    }
    const swing = span(t, this.hit - 0.15, this.hit + 0.05);
    if (t > this.hit - 0.15) at = grip.clone().addScaledVector(this.fwd, 1).addScaledVector(Y, 0.8 - swing * 1.2).addScaledVector(this.cam, -0.5 + swing);
    this.aim(mine.group, grip, at);
    const theirAt = t > 1.3 && t < 2.9 ? at.clone() : tGrip.clone().addScaledVector(this.fwd, -1).addScaledVector(Y, 0.6);
    this.aim(theirs.group, tGrip, theirAt);
    this.sfx('whoosh', this.hit - 0.15, t);
    if (kill) {
      // Their blade goes out as they spin away.
      theirs.blade.scale.z = lit(theirs.blade.scale.z * (1 - span(t, this.hit, this.hit + 0.2)));
      theirs.group.visible = t < this.hit + 0.6;
      this.sfx('fizzle', this.hit + 0.05, t);
      this.once('hit', this.hit, t, () => this.bursts.add(this.hit, 'sparks', this.world(this.onTarget(0.55, 0.3)), 0.8));
      return;
    }
    // A splutter, a flicker, and out: the battery's flat.
    const flick = t > this.hit - 0.1 ? (hash(Math.floor(t * 20), 3) > 0.5 ? 1 : 0.3) * (1 - span(t, this.hit, this.hit + 0.5)) : 1;
    if (t > this.hit - 0.1) mine.blade.scale.z = lit(flick);
    this.sfx('fizzle', this.hit, t);
    this.sign('batt', 'Low battery', t, this.hit + 0.5, this.end - 0.5, grip.clone().addScaledVector(Y, 0.9).addScaledVector(this.cam, 0.3), 1.2, 0.32, DARK);
    if (t > this.hit + 0.6) this.aAnim = 'cry';
    this.aBusy = t > this.hit;
  }

  // ---------------------------------------------------------------- the energy wave

  private wave(t: number, kill: boolean) {
    if (!this.orb) this.orb = this.keep(this.glowBall('#5ab8ff'));
    if (!this.ray) {
      this.ray = new THREE.Group();
      const rod = new THREE.CylinderGeometry(1, 1, 1, 14).rotateX(Math.PI / 2).translate(0, 0, 0.5);
      const core = new THREE.Mesh(rod, new THREE.MeshBasicMaterial({ color: '#ffffff' }));
      core.scale.set(0.5, 0.5, 1);
      const halo = new THREE.Mesh(rod, new THREE.MeshBasicMaterial({ color: '#5ab8ff', transparent: true, opacity: 0.6, depthWrite: false, blending: THREE.AdditiveBlending }));
      this.ray.add(core, halo);
      this.keep(this.ray);
    }
    const O = this.orb;
    const aB = this.aSize().box;
    // Paws cupped at the hip, turned away a little, the glow growing and growing.
    const charge = span(t, 0.5, 2.6);
    const push = 2.8;
    this.aAnim = t > 0.4 && t < push ? 'work' : 'hand';
    if (t < push) this.aTurn.multiply(tmpQ.setFromAxisAngle(Y, 0.5 * span(t, 0.3, 0.6)));
    const hip = this.aAt.clone().addScaledVector(this.fwd, -0.05).addScaledVector(this.cam, Math.max(0.25, aB.max.x + 0.08)).addScaledVector(Y, aB.max.y * 0.45);
    const paws = this.paw(0.5, 1.1);
    const at = t < push ? hip : hip.clone().lerp(paws, span(t, push, push + 0.12));
    const pulse = 1 + Math.sin(t * 25) * 0.08;
    O.position.copy(at);
    O.scale.setScalar(Math.max(0.001, (0.04 + 0.16 * charge) * pulse * (t > push + 0.1 && !kill ? 0.3 : 1) * (1 - span(t, this.end - 0.6, this.end - 0.4))));
    O.visible = t > 0.5;
    for (let n = 0; n < 5; n++) {
      const a = 0.8 + n * 0.35;
      this.once(`gather${n}`, a, t, () => this.bursts.add(a, 'sparkle', this.world(at), 0.5));
    }
    this.sfx('charge', 0.6, t);
    this.sfx('charge', 1.6, t);
    const over = this.aAt.clone().setY(this.P + aB.max.y + 0.6).addScaledVector(this.cam, 0.25);
    this.sign('ha1', 'Haaa…', t, 0.7, 1.6, over, 0.9, 0.36, DARK);
    this.sign('ha2', 'HAAAA…', t, 1.7, push, over, 1.1, 0.4, DARK);
    const R = this.ray;
    if (kill) {
      this.sign('ha3', 'HAAAAAA!', t, push, this.hit + 0.6, over, 1.4, 0.44, DARK);
      this.sfx('beam', push, t);
      this.sfx('roar', push, t);
      // The beam: out from the paws, reaching them as it lands, then on through for a moment, and thinning away.
      const tip = this.onTarget(0.5, 0);
      const len = paws.distanceTo(tip) * span(t, push, this.hit) + Math.max(0, t - this.hit) * 1.2;
      const thick = (0.12 + Math.sin(t * 40) * 0.01) * (1 - span(t, this.hit + 0.5, this.hit + 0.9));
      R.visible = t > push && thick > 0.005;
      this.aim(R, paws, tip.clone().addScaledVector(this.fwd, 0.1));
      R.scale.set(thick, thick, Math.max(0.001, len));
      if (t > this.hit && t < this.hit + 0.7) this.frame.shake = 0.5;
      this.sfx('boom', this.hit, t);
      this.once('blast', this.hit, t, () => {
        this.bursts.add(this.hit, 'flash', this.world(tip), 1.8);
        this.bursts.add(this.hit + 0.1, 'smoke', this.world(tip), 1.0);
      });
      if (t > this.hit + 0.8) this.aAnim = 'cheer';
      return;
    }
    // Out drifts one small bubble, which floats over to their nose, and pops.
    R.visible = false;
    this.sign('ha3', '…ha?', t, push + 0.1, this.hit + 0.8, over, 0.8, 0.36, DARK);
    if (t > push) {
      const nose = this.onTarget(0.8, 0.6);
      const k = span(t, push, this.hit);
      O.position.lerpVectors(paws, nose, k).addScaledVector(Y, Math.sin(k * Math.PI * 3) * 0.08);
      O.scale.setScalar(Math.max(0.001, 0.05 * (1 - span(t, this.hit, this.hit + 0.05))));
      this.sfx('pop', this.hit, t);
      this.once('pop', this.hit, t, () => this.bursts.add(this.hit, 'sparkle', this.world(nose), 0.4));
    }
    this.sfx('wahwah', this.hit + 0.5, t);
    if (t > this.hit + 0.5) this.aAnim = 'cry';
    this.aBusy = t > push;
  }

  // ---------------------------------------------------------------- the capture ball

  private capture(t: number, kill: boolean): Anim {
    if (!this.ball) {
      this.ball = captureBall();
      this.prop(this.ball.group);
    }
    if (!this.redRay) {
      const geo = new THREE.CylinderGeometry(1, 1, 1, 10).translate(0, 0.5, 0);
      this.redRay = this.keep(new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: '#ff5050', transparent: true, opacity: 0.7, depthWrite: false, blending: THREE.AdditiveBlending })));
    }
    const B = this.ball;
    const k = this.kit();
    const grip = this.paw(0.6);
    this.popProps(t, [this.world(grip)]);
    // A wind-up, the throw, and it hangs open over them.
    const wind = 1.0;
    const toss = 1.4;
    const open = 2.0;
    this.aAnim = t > 0.3 && t < toss + 0.2 ? 'hand' : 'idle';
    const above = this.B.clone().addScaledVector(this.fwd, -0.3).setY(this.P + this.tall() + 0.35);
    const floor = this.B.clone().addScaledVector(this.fwd, -0.1).setY(this.P + 0.12 * k);
    let at = grip.clone().addScaledVector(Y, 0.25 * span(t, wind, toss));
    let lid = 0;
    let rock = 0;
    if (t > toss) {
      const f = span(t, toss, open);
      at = grip.clone().lerp(above, f).addScaledVector(Y, Math.sin(f * Math.PI) * 0.7);
    }
    if (t > open) lid = -1.6 * span(t, open, open + 0.15) * (1 - span(t, this.hit - 0.05, this.hit + 0.05));
    // In: the one chosen goes all red and shrinks into it.
    const suck = span(t, open + 0.15, this.hit - 0.05);
    let shown = 1 - suck;
    this.sfx('whoosh', toss, t);
    this.sfx('beam', open + 0.1, t);
    if (t > this.hit) {
      // Down onto the boards, and the wobbles.
      const u = t - this.hit;
      at = above.clone().lerp(floor, span(u, 0, 0.2));
      if (u > 0.2) at.y = floor.y + Math.abs(Math.sin((u - 0.2) * 12)) * 0.05 * Math.exp(-(u - 0.2) * 6);
      const wobbles = kill ? [0.45, 0.85, 1.25] : [0.45, 0.85];
      wobbles.forEach((w) => {
        rock += Math.sin(span(u, w, w + 0.3) * Math.PI * 2) * 0.35;
        this.sfx('tick', this.hit + w, t);
      });
      if (kill) {
        this.sfx('ding', this.hit + 1.6, t);
        this.once('caught', this.hit + 1.6, t, () => this.bursts.add(this.hit + 1.6, 'sparkle', this.world(floor.clone().addScaledVector(Y, 0.3)), 1));
        this.sign('got', 'Gotcha!', t, this.hit + 1.6, this.end - 0.5, floor.clone().addScaledVector(Y, 0.9).addScaledVector(this.cam, 0.3), 1.0, 0.38, GOLDEN);
        this.setExtraVec('soulFrom', floor.clone().setY(this.P));
        if (u > 1.6) this.aAnim = 'cheer';
        this.aBusy = u < 1.6;
      } else {
        // Pop! Open it bursts, and out they come again, full size.
        const out = 1.3;
        lid = u > out ? -1.6 * span(u, out, out + 0.08) : lid;
        shown = span(u, out, out + 0.25);
        this.sfx('pop', this.hit + out, t);
        this.once('out', this.hit + out, t, () => this.bursts.add(this.hit + out, 'poof', this.world(floor.clone().addScaledVector(Y, 0.4)), 1));
        this.sign('nope', 'Nope!', t, this.hit + out + 0.2, this.end - 0.5, this.B.clone().setY(this.P + this.tall() + 0.6).addScaledVector(this.cam, 0.3), 0.8, 0.36);
        if (u > out + 0.4) this.aAnim = 'cry';
        this.aBusy = u > out;
      }
    }
    B.group.position.copy(at);
    B.group.quaternion.copy(this.face(this.cam)).multiply(tmpQ.setFromAxisAngle(Z, rock));
    if (t > toss && t < open) B.group.rotateX(-(t - toss) * 12);
    B.lid.rotation.x = lid;
    // The red light from the ball down over them.
    const R = this.redRay!;
    const on = t > open && t < this.hit;
    R.visible = on;
    if (on) {
      const foot = this.B.clone().setY(this.P + this.tall() * 0.5 * shown);
      const d = at.clone().sub(foot);
      R.position.copy(foot);
      R.quaternion.setFromUnitVectors(Y, d.clone().normalize());
      const w = Math.max(0.02, this.size().box.max.x * shown);
      R.scale.set(w, d.length(), w);
    }
    this.tint('#ff4040', Math.min(1, suck * 3) * 0.8 * (shown < 1 && !(t > this.hit && shown > 0.9) ? 1 : 0));
    // Shrinking into the ball (and drawn up towards it).
    const s = Math.max(0.001, shown);
    this.stretch.setScalar(s);
    this.at.lerp(at.clone().setY(at.y - this.tall() * 0.5 * s), 1 - shown);
    if (!kill && t > this.hit + 1.3) this.at.copy(this.B);
    return t > open && t < this.hit ? 'cry' : !kill && t > this.hit + 1.7 ? 'laugh' : 'idle';
  }

  // ---------------------------------------------------------------- the fireball

  private fireball(t: number, kill: boolean) {
    if (!this.orb) this.orb = this.keep(this.glowBall('#4a9aff'));
    const O = this.orb;
    // A low stance, paws back, then both forward.
    const push = 1.6;
    this.aAnim = t > 0.4 && t < push ? 'work' : t >= push ? 'hand' : 'idle';
    if (t > 0.4) this.aStretch.set(1.06, 0.9 + 0.1 * span(t, push, push + 0.2), 1.06);
    const paws = this.paw(0.45, 1.1);
    const tip = this.onTarget(0.5, 0.2);
    this.sign('ha', 'HA!', t, push, push + 0.8, this.aAt.clone().setY(this.P + this.aSize().box.max.y + 0.55).addScaledVector(this.cam, 0.2), 0.7, 0.4);
    this.sfx('whoosh', push, t);
    this.sfx('charge', 0.5, t);
    if (t < push) {
      O.visible = t > 0.6;
      O.position.copy(paws).addScaledVector(this.fwd, -0.25);
      O.scale.setScalar(0.04 + 0.08 * span(t, 0.6, push));
      return;
    }
    const k = (t - push) / (this.hit - push);
    O.rotation.set(t * 8, t * 5, 0);
    if (kill) {
      O.visible = k < 1;
      O.position.lerpVectors(paws, tip, Math.min(1, k)).addScaledVector(Y, Math.sin(t * 20) * 0.02);
      O.scale.setScalar(0.18 + Math.sin(t * 30) * 0.015);
      for (let n = 0; n < 6; n++) {
        const a = push + n * 0.17;
        if (a < this.hit) this.once(`trail${n}`, a, t, () => this.bursts.add(a, 'sparkle', this.world(O.position), 0.3));
      }
      this.sfx('boom', this.hit, t);
      this.once('hit', this.hit, t, () => {
        this.bursts.add(this.hit, 'flash', this.world(tip), 1.2);
        this.bursts.add(this.hit + 0.05, 'fire', this.world(tip), 0.6);
        this.bursts.add(this.hit + 0.1, 'smoke', this.world(tip), 0.8);
      });
      return;
    }
    // Slower and smaller, and out it goes, halfway, in a sad puff.
    const out = 0.55;
    O.visible = k < out;
    O.position.lerpVectors(paws, tip, k * 0.8);
    O.position.y -= k * k * 0.3;
    O.scale.setScalar(Math.max(0.001, 0.12 * (1 - k / out)));
    const at = push + out * (this.hit - push);
    this.sfx('fizzle', at, t);
    this.once('puff', at, t, () => this.bursts.add(at, 'smoke', this.world(paws.clone().lerp(tip, out * 0.8).addScaledVector(Y, -0.1)), 0.5));
    this.sign('pff', 'pfff…', t, this.hit, this.end - 0.5, this.A.clone().lerp(this.B, 0.5).setY(this.P + 0.9).addScaledVector(this.cam, 0.3), 0.8, 0.32);
    if (t > this.hit + 0.4) this.aAnim = 'cry';
    this.aBusy = t > this.hit;
  }

  // ---------------------------------------------------------------- the spring glove

  private boing(t: number, kill: boolean) {
    if (!this.jack) {
      this.jack = springGlove();
      this.prop(this.jack.group);
    }
    const J = this.jack;
    const k = this.kit();
    const grip = this.paw(0.5);
    this.popProps(t, [this.world(grip)]);
    this.aAnim = t > 0.3 ? 'work' : 'idle';
    const face = this.onTarget(0.8, 0.5);
    this.aim(J.group, grip, kill ? face.clone() : grip.clone().addScaledVector(this.fwd, 1).addScaledVector(Y, 0.05));
    // Round goes the crank, a plinky tune, and POP.
    const pop = this.hit - 0.12;
    J.crank.rotation.x = t > 0.4 ? -Math.min(t, pop) * 9 : 0;
    this.sfx('musicbox', 0.45, t);
    const mouth = J.group.position.clone().add(J.mouth.clone().multiplyScalar(k).applyQuaternion(J.group.quaternion));
    // (Lengths in the box's own size, from the mouth.)
    const reach = Math.max(0.05, (mouth.distanceTo(face) - 0.15 * k) / k);
    let len = 0.02;
    let droop = 0;
    if (t > pop) {
      const u = t - pop;
      if (kill) {
        len = reach * Math.min(1, u / 0.12);
        // Then a slow wobbly pull back in.
        len *= 1 - span(u, 1.0, 1.8) * 0.9;
        len += Math.exp(-u * 6) * Math.sin(u * 30) * 0.05;
      } else {
        // Half way, and it flops.
        len = reach * 0.45 * Math.min(1, u / 0.12) + Math.exp(-u * 4) * Math.sin(u * 26) * 0.06;
        droop = span(u, 0.25, 0.7) * 1.25;
      }
    }
    J.spring.scale.set(1, 1, Math.max(0.02, len));
    J.spring.rotation.x = droop;
    const end = new THREE.Vector3(0, 0, Math.max(0.02, len)).applyAxisAngle(X, droop).add(J.mouth);
    J.glove.position.copy(end);
    J.glove.rotation.x = droop + Math.sin(t * 20) * 0.05 * (t > pop ? 1 : 0);
    this.sfx('boing', pop, t);
    if (kill) {
      this.sfx('thunk', this.hit, t);
      this.once('pow', this.hit, t, () => this.bursts.add(this.hit, 'sparkle', this.world(face), 1));
      this.sign('pow', 'POW!', t, this.hit, this.hit + 1.0, face.clone().addScaledVector(Y, 0.5).addScaledVector(this.cam, 0.3), 0.8, 0.4, GOLDEN);
      return;
    }
    this.sfx('wahwah', this.hit + 0.6, t);
    if (t > this.hit + 0.6) this.aAnim = 'cry';
    this.aBusy = t > this.hit;
  }

  // ---------------------------------------------------------------- a custard pie

  private custardPie(t: number, kill: boolean): Anim | void {
    if (!this.custard) this.custard = this.prop(pie());
    const P = this.custard;
    const grip = this.paw(0.6);
    this.popProps(t, [this.world(grip)]);
    // Held up flat on a paw, wound back over the shoulder, and thrown.
    const wind = span(t, 0.9, 1.5);
    const toss = 1.6;
    this.aAnim = t > 0.3 && t < toss + 0.2 ? 'hand' : 'idle';
    const back = grip.clone().addScaledVector(this.fwd, -0.35).addScaledVector(Y, 0.35);
    const face = this.onTarget(0.82, 0.55);
    let at = grip.clone().lerp(back, wind);
    // Flat side up in the paw, then turned to face them as it flies.
    let q = new THREE.Quaternion();
    if (t > toss) {
      const k = span(t, toss, this.hit);
      at = back.clone().lerp(kill ? face : this.onTarget(0.55, 0.9), k).addScaledVector(Y, Math.sin(k * Math.PI) * 0.35);
      q = this.face(this.fwd).multiply(tmpQ.setFromAxisAngle(X, Math.PI / 2 * Math.min(1, k * 1.5)));
    }
    this.sfx('whoosh', toss, t);
    if (kill) {
      if (t > this.hit) {
        // Stuck on their face (and slowly sliding off).
        const slide = span(t, this.hit + 0.4, this.hit + 1.2);
        at = this.onTarget(0.82 - slide * 0.25, 0.55 + slide * 0.2);
        q = this.face(this.fwd.clone().negate()).multiply(tmpQ.setFromAxisAngle(X, -Math.PI / 2 + slide * 0.6)).premultiply(this.turn).premultiply(this.face(this.dirT).invert());
      }
      this.sfx('splash', this.hit, t);
      this.once('splat', this.hit, t, () => this.bursts.add(this.hit, 'poof', this.world(face), 0.7));
      this.sign('splat', 'SPLAT!', t, this.hit, this.hit + 1.1, face.clone().addScaledVector(Y, 0.55).addScaledVector(this.cam, 0.3), 0.9, 0.4);
      P.position.copy(at);
      P.quaternion.copy(q);
      return;
    }
    // Caught! And eaten, in three bites.
    let anim: Anim | void = undefined;
    if (t > this.hit) {
      const tb = this.size().box;
      const paw = this.at.clone().addScaledVector(this.fwd, -(tb.max.z * 0.55 + 0.1)).addScaledVector(this.cam, 0.14).addScaledVector(Y, Math.max(0.3, tb.max.y * 0.6));
      at = paw;
      q = new THREE.Quaternion();
      const bites = [0.5, 0.9, 1.3];
      const left = 1 - bites.filter((b) => t - this.hit > b).length / 3;
      P.children[0].scale.setScalar(Math.max(0.001, left));
      bites.forEach((b) => this.sfx('gulp', this.hit + b, t));
      anim = t - this.hit < 1.5 ? 'drink' : 'laugh';
      this.sign('yum', 'Yum!', t, this.hit + 1.5, this.end - 0.5, this.B.clone().setY(this.P + tb.max.y + 0.6).addScaledVector(this.cam, 0.3), 0.7, 0.36, GOLDEN);
      if (t > this.hit + 0.6) this.aAnim = 'cry';
      this.aBusy = true;
    }
    P.position.copy(at);
    P.quaternion.copy(q);
    return anim;
  }

  // ---------------------------------------------------------------- a banana peel

  private slip(t: number, kill: boolean): Anim {
    if (!this.fruit) {
      this.fruit = banana();
      this.prop(this.fruit.group);
    }
    const F = this.fruit;
    const grip = this.paw(0.65, 0.8);
    this.popProps(t, [this.world(grip)]);
    // Peeled and eaten, the peel tossed over a shoulder in front of them.
    const eat = span(t, 0.5, 1.4);
    F.flaps.forEach((f) => (f.rotation.x = 1.9 * span(t, 0.4, 0.7) - 0.35 * span(t, 1.9, 2.1)));
    F.fruit.scale.set(1, Math.max(0.001, 1 - eat), 1);
    F.fruit.visible = eat < 1;
    this.aAnim = t > 0.4 && t < 1.4 ? 'drink' : t > 1.5 && t < 1.8 ? 'hand' : 'idle';
    this.sfx('gobble', 0.6, t);
    const toss = 1.6;
    const lands = 2.1;
    const spot = this.B.clone().addScaledVector(this.fwd, -0.5).setY(this.P);
    let at = grip;
    let q = new THREE.Quaternion();
    if (t > toss) {
      const f = span(t, toss, lands);
      at = grip.clone().lerp(spot, f).addScaledVector(Y, Math.sin(f * Math.PI) * 0.6);
      q.setFromAxisAngle(X, f * Math.PI * 3);
      if (f >= 1) q.identity();
    }
    this.sfx('flump', lands, t);
    // The one chosen strolls over to have a word... and steps right on it.
    const walk = span(t, 2.2, this.hit);
    const onPeel = spot.clone().addScaledVector(this.fwd, 0.05);
    let anim: Anim = t > 2.2 && t < this.hit ? 'walk' : 'idle';
    const u = t - this.hit;
    if (kill) {
      this.at.lerpVectors(this.B, onPeel, walk);
      this.turn.copy(this.face(t > 2.2 ? this.fwd.clone().negate() : this.dirT));
      if (u > 0) {
        // Feet out from under them, up in the air, and flat on their back.
        const f = span(u, 0, 0.5);
        const axis = this.side();
        const flip = tmpQ.setFromAxisAngle(axis, f * (Math.PI / 2 - 0.05));
        const centre = onPeel.clone().addScaledVector(this.fwd, 0.25 * f).setY(this.P + this.tall() / 2 + Math.sin(f * Math.PI) * 0.6 - f * (this.tall() / 2 - Math.max(0.12, this.size().box.max.z * 0.6)));
        this.targetAbout(centre, flip.clone().multiply(this.turn));
        this.sfx('skid', this.hit, t);
        this.sfx('thud', this.hit + 0.5, t);
        this.once('land', this.hit + 0.5, t, () => this.bursts.add(this.hit + 0.5, 'dust', this.world(centre.clone().setY(this.P)), 0.7));
        this.setExtraVec('soulFrom', centre.clone().setY(this.P));
        this.daze('t', t, u > 0.7 ? centre.clone().setY(this.P + 0.35) : null, 0.25);
        // The peel flies up and lands on them.
        const p = span(u, 0, 0.9);
        at = spot.clone().lerp(centre.clone().setY(this.P + Math.max(0.2, this.size().box.max.z)), p).addScaledVector(Y, Math.sin(p * Math.PI) * 1.0);
        q.setFromAxisAngle(X, p * Math.PI * 4);
        anim = 'cry';
      }
    } else {
      // They see it, and hop neatly over it; a kick sends it skidding back under the claimer, who goes over.
      this.at.lerpVectors(this.B, onPeel.clone().addScaledVector(this.fwd, -0.55), walk);
      const hop = span(t, this.hit - 0.45, this.hit - 0.05);
      this.at.y += Math.sin(hop * Math.PI) * 0.35;
      this.turn.copy(this.face(t > 2.2 ? this.fwd.clone().negate() : this.dirT));
      if (u > 0) {
        const s = span(u, 0.1, 0.6);
        const under = this.A.clone().setY(this.P);
        at = spot.clone().lerp(under, s);
        q.setFromAxisAngle(Y, s * Math.PI * 3);
        this.sfx('whoosh', this.hit + 0.1, t);
        if (u > 0.6) {
          // Down goes the claimer, on their bottom.
          const v = u - 0.6;
          const f = span(v, 0, 0.35);
          this.aStretch.set(1 + f * 0.1, 1 - f * 0.25, 1 + f * 0.1);
          this.aAt.y += Math.sin(f * Math.PI) * 0.4;
          this.aTurn.multiply(tmpQ.setFromAxisAngle(X, -f * 0.5));
          this.aAnim = 'sit';
          this.sfx('thud', this.hit + 0.95, t);
          this.daze('a', t, v > 0.4 ? this.aHead().addScaledVector(Y, 0.1) : null);
        }
        this.aBusy = true;
        anim = u > 0.7 ? 'laugh' : 'idle';
      }
    }
    F.group.position.copy(at);
    F.group.quaternion.copy(q);
    return anim;
  }

  // ---------------------------------------------------------------- the thunder hammer

  private thunder(t: number, kill: boolean) {
    if (!this.hammer2) {
      this.hammer2 = thunderHammer();
      this.prop(this.hammer2.group);
    }
    if (!this.zaps) {
      this.zaps = new Bolts(30);
      this.fx.add(this.zaps.group);
      this.disposers.push(() => this.zaps?.dispose());
    }
    const H = this.hammer2;
    const k = this.kit();
    const grip = this.paw(0.6);
    const aH = this.aSize().box.max.y;
    if (!kill) {
      // Only the worthy can lift it: it's stuck fast on the boards, and they heave and heave, and fall over.
      const floorAt = this.A.clone().addScaledVector(this.fwd, 0.55).setY(this.P);
      this.popProps(t, [this.world(floorAt.clone().setY(this.P + 0.3))]);
      this.aim(H.group, floorAt.clone().addScaledVector(Y, 0.45 * k), floorAt);
      this.aTurn.copy(this.face(this.fwd));
      const heave = t > 0.6 && t < this.hit ? Math.sin(t * 9) : 0;
      this.aAnim = t > 0.5 && t < this.hit ? 'work' : 'idle';
      this.aStretch.set(1 - heave * 0.04, 1 + heave * 0.06, 1 - heave * 0.04);
      this.aTurn.multiply(tmpQ.setFromAxisAngle(X, -0.25 * span(t, 0.6, 0.9) + heave * 0.05));
      this.sfx('strain', 0.8, t);
      this.sfx('strain', 2.0, t);
      this.sign('worthy', 'Not worthy', t, this.hit + 0.2, this.end - 0.5, this.aAt.clone().setY(this.P + aH + 0.6).addScaledVector(this.cam, 0.2), 1.2, 0.34);
      if (t > this.hit) {
        // Their paws slip off, and over backwards they go.
        const f = span(t, this.hit, this.hit + 0.35);
        this.aAt.addScaledVector(this.fwd, -0.3 * f);
        this.aTurn.copy(this.face(this.fwd)).multiply(tmpQ.setFromAxisAngle(X, -f * 1.2));
        this.aStretch.set(1, 1, 1);
        this.aAnim = 'cry';
        this.sfx('thud', this.hit + 0.35, t);
        this.daze('a', t, t > this.hit + 0.5 ? this.aAt.clone().addScaledVector(this.fwd, -aH * 0.5).setY(this.P + 0.35) : null);
      }
      this.aBusy = true;
      return;
    }
    this.popProps(t, [this.world(grip)]);
    // Held high to the sky; a crack of lightning down into it; then thrown, spinning, and back to the paw.
    const raise = span(t, 0.4, 0.8);
    this.aAnim = t > 0.3 && t < 2.1 ? 'hand' : 'idle';
    const high = this.aAt.clone().setY(this.P + aH + 0.25).addScaledVector(this.cam, 0.15);
    const throwAt = 2.2;
    const head = this.onTarget(0.6, 0.3);
    let at = grip.clone().lerp(high, raise);
    let look = at.clone().addScaledVector(Y, 1);
    if (t > throwAt) {
      const f = span(t, throwAt, this.hit);
      const back = span(t, this.hit + 0.3, this.hit + 1.1);
      at = high.clone().lerp(head, f).addScaledVector(Y, Math.sin(f * Math.PI) * 0.3);
      if (back > 0) at = head.clone().lerp(grip, back).addScaledVector(Y, Math.sin(back * Math.PI) * 0.4);
      const spin = (t - throwAt) * 16 * (1 - (back >= 1 ? 1 : 0));
      look = at.clone().add(new THREE.Vector3(0, Math.cos(spin), 0).addScaledVector(this.fwd, Math.sin(spin)));
      if (back >= 1) look = at.clone().addScaledVector(Y, 1);
    }
    H.group.position.copy(at);
    this.aim(H.group, at, look);
    // The lightning: from a spot up high, into the hammer.
    const sky = high.clone().addScaledVector(Y, 3.5).addScaledVector(this.cam, -0.5);
    const strike = t > 1.0 && t < 1.7 ? 1 : 0;
    const hit = t > this.hit && t < this.hit + 0.5 ? 1 : 0;
    const paths: [THREE.Vector3, THREE.Vector3][] = [];
    if (strike) paths.push([this.world(sky), this.world(at.clone().addScaledVector(Y, 0.3 * k))]);
    if (hit) for (let n = 0; n < 3; n++) paths.push([this.world(head), this.world(this.onTarget(0.1 + n * 0.35, -0.3).addScaledVector(this.side(), (n - 1) * 0.3))]);
    this.zaps.update(t, paths, strike || hit, 0.14);
    this.sfx('boom', 1.0, t);
    this.sfx('crackle', 1.05, t);
    this.once('charged', 1.0, t, () => this.bursts.add(1.0, 'flash', this.world(at), 1.2));
    this.sfx('whoosh', throwAt, t);
    this.sfx('thunk', this.hit, t);
    this.sfx('crackle', this.hit, t);
    this.once('hit', this.hit, t, () => this.bursts.add(this.hit, 'flash', this.world(head), 1.4));
    if (t > this.hit && t < this.hit + 0.4) this.frame.shake = 0.6;
    if (t > this.hit + 1.1) this.aAnim = 'cheer';
    this.aBusy = t < this.hit + 1.1;
  }

  // ---------------------------------------------------------------- the head stomp

  private stomp(t: number, kill: boolean) {
    if (!this.gold) this.gold = this.prop(coin(), 1);
    // A run up, a crouch, and a great jump, straight down on their head.
    const run = span(t, 0.4, 1.3);
    const launch = this.A.clone().lerp(this.B, 0.35);
    this.aAt.lerpVectors(this.A, launch, run);
    this.aTurn.copy(this.face(t > 0.4 ? this.fwd : this.dirA));
    this.aAnim = t > 0.4 && t < 1.3 ? 'run' : 'idle';
    const crouch = span(t, 1.3, 1.45) * (1 - span(t, 1.45, 1.55));
    this.aStretch.set(1 + crouch * 0.15, 1 - crouch * 0.3, 1 + crouch * 0.15);
    const jump = 1.5;
    const top = this.B.clone().setY(this.P + this.tall() * 0.92);
    this.sfx('jump', jump, t);
    if (t > jump && t < this.hit) {
      const f = (t - jump) / (this.hit - jump);
      this.aAt.lerpVectors(launch, top, f);
      this.aAt.y = THREE.MathUtils.lerp(this.P, top.y, f) + Math.sin(f * Math.PI) * 1.3;
      this.aAnim = 'cheer';
    }
    const u = t - this.hit;
    this.popProps(t, [this.world(this.B.clone().setY(this.P + this.tall() + 0.4))]);
    this.gold.visible = false;
    if (u >= 0) {
      if (kill) {
        // Down they squash; up bounces the claimer, landing beside them; and a coin pops out.
        const b = span(u, 0, 0.6);
        const land = this.B.clone().addScaledVector(this.fwd, -(Math.max(this.size().box.max.z, 0.3) + 0.45));
        this.aAt.lerpVectors(top.clone().setY(this.P + this.tall() * 0.12), land, b).addScaledVector(Y, Math.sin(b * Math.PI) * 0.7);
        this.aStretch.set(1, 1, 1);
        this.aAnim = u > 0.6 ? 'cheer' : 'idle';
        this.sfx('stomp', this.hit, t);
        this.sfx('ding', this.hit + 0.1, t);
        const c = span(u, 0.05, 0.7);
        this.gold.visible = u > 0.05 && u < 1.6;
        this.gold.position.copy(this.B).setY(this.P + 0.3 + c * 1.1);
        this.gold.rotation.set(0, u * 14, 0);
        this.gold.children[0].scale.setScalar(1 - span(u, 1.3, 1.6));
        this.once('coin', this.hit + 0.1, t, () => this.bursts.add(this.hit + 0.1, 'sparkle', this.world(this.B.clone().setY(this.P + 0.6)), 0.6));
      } else {
        // Boing! Off their head and right back where they came from, onto their bottom.
        const b = span(u, 0, 0.8);
        this.aAt.lerpVectors(top, this.A, b).addScaledVector(Y, Math.sin(b * Math.PI) * 1.1);
        this.aAt.y = Math.max(this.P, this.aAt.y);
        this.aTurn.multiply(tmpQ.setFromAxisAngle(X, -b * Math.PI * 2));
        if (u > 0.8) {
          this.aTurn.copy(this.face(this.fwd));
          this.aAnim = 'sit';
          this.daze('a', t, u > 1.0 ? this.aHead().addScaledVector(Y, 0.1) : null);
        }
        this.sfx('thud', this.hit + 0.8, t);
        this.aBusy = true;
      }
    }
    this.frame.radius += 0.3;
    this.frame.look.y += 0.3;
  }

  // ---------------------------------------------------------------- the falling safe

  private safeDrop(t: number, kill: boolean): Anim {
    const tb = this.size().box;
    const w = THREE.MathUtils.clamp((tb.max.x - tb.min.x) * 1.5, 0.75, 1.25);
    if (!this.box) {
      this.box = safe(w);
      this.prop(this.box.group, 1);
      this.disposers.push(this.box.dispose);
    }
    if (!this.shade) {
      this.shade = this.keep(new THREE.Mesh(new THREE.CircleGeometry(1, 28).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: '#000000', transparent: true, opacity: 0.4, depthWrite: false })));
      this.line = this.keep(new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 1, 5).translate(0, 0.5, 0), new THREE.MeshLambertMaterial({ color: '#c9a46a' })));
    }
    const S = this.box;
    // Pointing up at the sky (they know what's coming); a whistle from above, and a shadow growing on the boards.
    this.aAnim = t > 0.4 && t < 2.6 ? 'hand' : 'idle';
    this.sign('look', 'Look up!', t, 0.6, 1.6, this.aAt.clone().setY(this.P + this.aSize().box.max.y + 0.6).addScaledVector(this.cam, 0.2), 1.0, 0.34);
    const fall = 1.6;
    this.sfx('whistle', fall - 0.2, t);
    const head = this.P + this.tall() * 1.02;
    const stopAt = kill ? head : head + 0.18;
    const k = span(t, fall, this.hit);
    // (Falling faster and faster.)
    const f = Math.min(1, Math.max(0, (t - fall) / (this.hit - fall)));
    let y = THREE.MathUtils.lerp(this.P + 9, stopAt, f * f);
    const at = this.B.clone();
    const u = t - this.hit;
    let anim: Anim = t > fall + 0.6 && t < this.hit ? 'cry' : 'idle';
    if (kill && u >= 0) {
      // Down onto the boards, flattening them, a thump and a bounce.
      const flat = Math.max(0.08, 0.1);
      const crush = span(u, 0, 0.06);
      y = THREE.MathUtils.lerp(stopAt, this.P + this.tall() * flat, crush) + (u > 0.06 ? Math.abs(Math.sin((u - 0.06) * 14)) * Math.exp(-(u - 0.06) * 7) * 0.12 : 0);
      this.stretch.set(1 + crush * 0.6, Math.max(flat, 1 - crush * (1 - flat)), 1 + crush * 0.6);
      this.sfx('slam', this.hit, t);
      this.once('crash', this.hit, t, () => {
        this.bursts.add(this.hit, 'dust', this.world(at.clone().setY(this.P + 0.1)), 1.2);
        this.bursts.add(this.hit + 0.05, 'poof', this.world(at.clone().setY(this.P + 0.2)), 0.8);
      });
      if (u < 0.6) this.frame.shake = 0.9 * (1 - u / 0.6);
      // The door swings open, and out flutters a moth.
      S.door.rotation.y = -span(u, 0.7, 1.0) * 1.9;
      this.sfx('squeak', this.hit + 0.7, t);
      this.once('moth', this.hit + 0.9, t, () => this.bursts.add(this.hit + 0.9, 'feathers', this.world(at.clone().addScaledVector(this.cam, w * 0.5).setY(this.P + w * 0.6)), 0.3));
      this.setExtraVec('soulFrom', at.clone().setY(this.P));
      anim = 'idle';
    } else if (!kill && u >= 0) {
      // Stopped dead on its rope, a hair above them, and bouncing; they look up, and step out from under it.
      y = stopAt + Math.sin(u * 14) * Math.exp(-u * 3) * 0.12;
      this.sfx('boing', this.hit, t);
      const step = span(u, 0.8, 1.4);
      this.at.addScaledVector(this.side(), step * (w * 0.6 + 0.35)).addScaledVector(this.cam, step * 0.3);
      if (u > 0.8 && u < 1.4) anim = 'walk';
      else if (u > 1.4) anim = 'laugh';
      this.sign('phew', 'Phew!', t, this.hit + 1.4, this.end - 0.5, this.at.clone().setY(this.P + this.tall() + 0.6).addScaledVector(this.cam, 0.3), 0.8, 0.34);
      if (u > 0.6) this.aAnim = 'cry';
      this.aBusy = true;
    }
    S.group.position.copy(at).setY(y);
    S.group.quaternion.copy(this.face(this.cam.clone().addScaledVector(this.fwd, 0.4).normalize()));
    S.group.rotation.y += t > fall && t < this.hit ? Math.sin(t * 3) * 0.1 : 0;
    this.popProps(t, [this.world(at.clone().setY(Math.min(y, this.P + 4) + w * 0.5))]);
    // (Not the pop in at the start: it comes from the sky.)
    S.group.visible = t > fall - 0.1;
    const sh = this.shade!;
    sh.position.copy(at).setY(this.P + 0.015);
    sh.scale.setScalar(Math.max(0.001, w * 0.7 * k));
    sh.visible = t > fall && (kill ? u < 0.1 : t < this.end - 0.4);
    (sh.material as THREE.MeshBasicMaterial).opacity = 0.15 + 0.35 * k;
    const L = this.line!;
    L.visible = !kill && t > fall && t < this.end - 0.45;
    L.position.copy(at).setY(y + S.h);
    L.scale.set(1, 12, 1);
    // The camera looks up a little, to see it coming.
    this.frame.look.y += 0.4 * (1 - span(t, this.hit - 0.4, this.hit));
    this.frame.radius += 0.4;
    return anim;
  }
}
