import * as THREE from 'three';
import type { ExecMethod } from '../../state/types';
import { disposeObject } from '../items';
import { Builder, matte } from '../build';
import { G } from '../town/kit';
import { GALLOWS_BEAM, GALLOWS_KNOT, GALLOWS_ROPE_REST } from '../town';
import type { Anim } from '../types';
import { BakedPiece, bakeAnimal, freeBake } from './bake';
import { ease, easeOut, hash, span } from './fx';
import { cord, stretchCord, wordSign } from './props2';
import {
  blockPiece,
  bubble,
  chomper,
  duck,
  horse,
  kitchen,
  lane,
  paintRig,
  person,
  pool,
  reachFor,
  shark,
  slab,
  slingshot,
  tank,
  undies,
  type Bubble,
  type Chomper,
  type Figure,
  type Horse,
  type Kitchen,
  type Lane,
  type PaintRig,
  type Pool,
  type Shark,
  type Sling,
  type Tank,
  titan,
  type Titan,
} from './props3';
import { basis } from './stage';
import { MoreStage } from './stage2';

/**
 * The third lot of ways to be executed, on the same stage as the others (see stage.ts and stage2.ts): the gallows
 * backflip, the horse's kick, bowling, the tanks, the silent hitman, the paint cans, the paddling pool shark, the
 * chomper, the falling blocks, the slingshot, the TV sting and the titan's snap. Slapstick and bloodless like the rest (a head that
 * pops off like a cork, squashed flat, gobbled whole, cleared away with a line), all worked out from the seconds
 * since it began, each with a lucky escape for someone the Storyteller spares.
 */

type Third = 'backflip' | 'horse' | 'bowling' | 'tanks' | 'hitman' | 'paint' | 'shark' | 'chomp' | 'blocks' | 'sling' | 'sting' | 'titan';

export const THIRD_METHODS: readonly Third[] = ['backflip', 'horse', 'bowling', 'tanks', 'hitman', 'paint', 'shark', 'chomp', 'blocks', 'sling', 'sting', 'titan'];
// (Every one of them is a way to be executed.)
const _check: readonly ExecMethod[] = THIRD_METHODS;
void _check;

const UP = new THREE.Vector3(0, 1, 0);
const X = new THREE.Vector3(1, 0, 0);
const Y = new THREE.Vector3(0, 1, 0);
const Z = new THREE.Vector3(0, 0, 1);

type Shown = { anim: Anim; visible: boolean };

/** A turn of `a` radians about `axis`. */
const about = (axis: THREE.Vector3, a: number) => new THREE.Quaternion().setFromAxisAngle(axis, a);

export class ThirdStage extends MoreStage {
  // Each way's own bits.
  private steed: Horse | null = null;
  private alley: Lane | null = null;
  private column: Tank[] = [];
  private guy: Figure | null = null;
  private costume: THREE.Group | null = null;
  private pants: THREE.Group | null = null;
  private wire: THREE.Mesh[] = [];
  private cans: PaintRig | null = null;
  private paddle: Pool | null = null;
  private fish: Shark | null = null;
  private toy: THREE.Group | null = null;
  private muncher: Chomper | null = null;
  private dots: THREE.Mesh[] = [];
  private pellet: THREE.Mesh | null = null;
  private well: THREE.Group | null = null;
  private pieces3: { group: THREE.Group; from: number; land: number; row: number; clears: boolean }[] = [];
  private fork: Sling | null = null;
  private tower: { group: THREE.Group; home: THREE.Vector3; v: THREE.Vector3; spin: THREE.Vector3; rest: number; up: boolean }[] = [];
  private set: Kitchen | null = null;
  private host: Figure | null = null;
  private cops: Figure[] = [];
  private bubbles = new Map<string, Bubble>();
  private giant: Titan | null = null;
  private dust: BakedPiece | null = null;

  // ---------------------------------------------------------------- shared

  protected override more(t: number): Shown {
    switch (this.method as Third) {
      case 'backflip':
        return this.backflip(t);
      case 'horse':
        return this.kick(t);
      case 'bowling':
        return this.bowl(t);
      case 'tanks':
        return this.tanks(t);
      case 'hitman':
        return this.hit(t);
      case 'paint':
        return this.paint(t);
      case 'shark':
        return this.jaws(t);
      case 'chomp':
        return this.chomp(t);
      case 'blocks':
        return this.blocks(t);
      case 'sling':
        return this.sling(t);
      case 'sting':
        return this.sting(t);
      case 'titan':
        return this.snap(t);
    }
    return super.more(t);
  }

  protected override noBody(): boolean {
    const gone: string[] = ['backflip', 'bowling', 'shark', 'chomp', 'blocks', 'sting', 'titan'];
    return gone.includes(this.method) || super.noBody();
  }

  /** A speech bubble over a spot, popping up with a little overshoot, and going again. */
  private say(name: string, lines: string[], w: number, h: number, t: number, from: number, to: number, at: THREE.Vector3) {
    let s = this.bubbles.get(name);
    if (!s) {
      s = bubble(lines, w, h);
      this.group.add(s.group);
      this.bubbles.set(name, s);
    }
    const p = t < from ? 0 : t < to ? easeOut((t - from) / 0.22) * (1 + 0.2 * Math.sin(Math.min(1, (t - from) / 0.4) * Math.PI)) : Math.max(0, 1 - (t - to) / 0.18);
    s.group.scale.setScalar(Math.max(0.001, p));
    s.group.visible = p > 0.002;
    s.group.position.copy(at);
    s.group.quaternion.copy(this.face(this.cam));
  }

  /** A person's legs and arms swinging as they walk (or still, when not). */
  private stride(f: Figure, t: number, on: boolean, rate = 8, swing = 0.5) {
    const s = on ? Math.sin(t * rate) * swing : 0;
    f.legs[0].rotation.x = s;
    f.legs[1].rotation.x = -s;
    f.arms[0].rotation.set(-s * 0.7, 0, 0);
    f.arms[1].rotation.set(s * 0.7, 0, 0);
    f.body.position.y = 0.86 + (on ? Math.abs(Math.sin(t * rate)) * 0.03 : 0);
  }

  /** The middle of the animal, in the stage's frame, as it's posed this frame. */
  private midNow(): THREE.Vector3 {
    return this.mid().multiply(this.stretch).applyQuaternion(this.turn).add(this.at);
  }

  /** The animal's coat colour (for the hitman's disguise), or a middling brown. */
  private coat(): string {
    let found: THREE.Color | null = null;
    this.who?.traverse((o) => {
      const m = (o as THREE.Mesh).material as THREE.MeshToonMaterial | undefined;
      if (!found && (o as THREE.SkinnedMesh).isSkinnedMesh && m && !Array.isArray(m) && m.color) found = m.color.clone();
    });
    return found ? `#${(found as THREE.Color).getHexString()}` : '#b07a4a';
  }

  // ---------------------------------------------------------------- the gallows backflip

  private backflip(t: number): Shown {
    const b = this.size();
    const P = this.P;
    // Side on to the camera, so the flip reads, and in the rope's own plane (it swings across the gallows).
    const F = new THREE.Vector3(this.cam.x >= 0 ? 1 : -1, 0, 0);
    const edge = F.clone().multiplyScalar(0.88).setY(P);
    const mid = this.mid();
    const tall = b.box.max.y;
    this.frame.look = this.world(new THREE.Vector3(F.x * 0.3, P + 0.8, 0));
    this.frame.radius = 3.0;
    // Out to the edge of the trapdoor with their back to it, a bow to the crowd and their arms up, a bounce on the
    // boards like a diver, and a backflip into the hole.
    const walk = span(t, 0.35, 0.9);
    const open = span(t, 1.0, 1.15);
    const jump = 2.5;
    const flipFor = 0.75;
    let anim: Anim = 'idle';
    let visible = true;
    const facing = this.face(F);
    const stand = () => {
      this.turn.copy(this.face(this.cam).slerp(facing, span(t, 1.0, 1.3)));
      this.at.copy(new THREE.Vector3(0, P, 0).lerp(edge, walk));
    };
    this.sfx('drumroll', 0.4, t);
    this.sfx('clunk', 1.0, t);
    if (t < jump) {
      stand();
      if (t > 1.3 && t < 1.9) anim = 'cheer';
      // Two bounces on their toes.
      if (t > 1.9) {
        const u = (t - 1.9) / (jump - 1.9);
        const hop = Math.abs(Math.sin(u * Math.PI * 2));
        this.at.y += hop * 0.16;
        const squash = Math.max(0, 1 - hop * 4);
        this.stretch.set(1 + squash * 0.08, 1 - squash * 0.14 + hop * 0.06, 1 + squash * 0.08);
      }
    }
    const fall = jump + flipFor;
    const bottom = P - 0.75 - mid.y;
    if (t >= jump) {
      // The flip: up and back over the hole, a whole turn about their middle, and down in, straight as a pin.
      const u = Math.min(1, (t - jump) / flipFor);
      const from = edge.clone().setY(P + mid.y);
      const x = THREE.MathUtils.lerp(from.x, 0, ease(u));
      let y = from.y + 1.15 * 4 * u * (1 - u) - 0.55 * u * u;
      if (t > fall) {
        // Straight down through the hole, until the rope (or, spared, the bungee) takes them.
        const d = t - fall;
        y = Math.max(bottom - (this.survives ? 0.7 : 0), from.y - 0.55 - 2.5 * d - 4.9 * d * d);
      }
      const q = facing.clone().multiply(about(X, -Math.PI * 2 * ease(u)));
      const target = new THREE.Vector3(x, y, 0);
      this.put(q, target, mid);
      anim = u < 1 ? 'cheer' : 'idle';
      this.sfx('whoosh', jump, t);
      const splash = fall + 0.18;
      this.sfx('splash', splash, t);
      this.once('splash', splash, t, () => this.bursts.add(splash, 'splash', this.world(new THREE.Vector3(0, P + 0.05, 0)), 1.6));
      this.sfx('twang', fall + 0.4, t);
      // Taut: a little bounce on the rope, down in the dark.
      const taut = fall + 0.4;
      if (t > taut && !this.survives) this.at.y += Math.exp(-(t - taut) * 5) * Math.sin((t - taut) * 18) * 0.1;
      if (this.survives && t > taut) {
        // A bungee! Down, a great stretch, and back up out of the hole onto the boards, on their feet.
        const up = span(t, taut + 0.15, taut + 0.85);
        const land = edge.clone().multiplyScalar(-1).setY(P);
        const low = this.at.clone();
        const k = up;
        this.at.lerpVectors(low, land, k);
        this.at.y += Math.sin(k * Math.PI) * 1.6;
        this.turn.copy(this.face(F.clone().negate()).multiply(about(X, -Math.PI * 2 * k)));
        if (k >= 1) this.turn.copy(this.face(this.cam));
        this.sfx('boing', taut + 0.1, t);
        this.sfx('thud', taut + 0.85, t);
        anim = k >= 1 ? (t > taut + 1.1 ? 'cheer' : 'idle') : 'cry';
      }
      visible = this.midNow().y + tall * 0.45 > P - 0.05;
    }
    // The trapdoor, and the noose round their neck all along (worked out from where the neck is now).
    const neck = b.neck.clone().multiply(this.stretch).applyQuaternion(this.turn).add(this.at);
    const d = neck.clone().sub(new THREE.Vector3(-GALLOWS_KNOT, P + GALLOWS_BEAM, 0));
    const len = Math.sqrt(Math.max(0.04, d.x * d.x + d.y * d.y - GALLOWS_KNOT * GALLOWS_KNOT));
    const swing = Math.atan2(d.y, d.x) - Math.atan2(-len, GALLOWS_KNOT);
    // Once it's all over the noose is drawn back up, empty, and the trapdoor swings shut.
    const off = this.survives ? span(t, 5.2, 5.8) : span(t, this.soulAt + 0.2, this.soulAt + 1.0);
    const shut = this.survives ? span(t, 4.6, 4.9) : span(t, this.soulAt + 0.6, this.soulAt + 0.9);
    this.gallows = {
      open: open * (1 - shut),
      rope: THREE.MathUtils.lerp(len, GALLOWS_ROPE_REST, off),
      ring: 1 - off,
      swing: swing * (1 - off),
      puff: this.survives ? 0 : Math.max(0, Math.min(1, (t - this.soulAt + 0.2) / 1.0)),
    };
    // The judges hold up their cards.
    const cards = this.survives ? ['10', '10', '10'] : ['10', '10', '9.5'];
    const at0 = this.survives ? 4.2 : fall + 0.7;
    cards.forEach((c, i) => {
      const spot = new THREE.Vector3(0, P + 2.2 + (i === 1 ? 0.15 : 0), 0).addScaledVector(this.left, (i - 1) * 1.0).addScaledVector(this.cam, 1.2);
      this.sign(`card${i}`, c, 0.8, 0.6, t, at0 + i * 0.2, this.end - 0.3, spot, { bg: '#fffaf0', fg: '#2a4a8a', border: '#2a4a8a' });
      this.sfx('ding', at0 + i * 0.2, t);
    });
    this.setExtraVec('soulFrom', new THREE.Vector3(0, P - 0.2, 0));
    return { anim, visible };
  }

  // ---------------------------------------------------------------- the horse's kick

  private kick(t: number): Shown {
    const b = this.size();
    const P = this.P;
    const L = this.left.clone();
    const spot = this.V(2.3, 0.7, 0);
    if (!this.steed) {
      this.steed = horse();
      this.steed.group.visible = false;
      this.keep(this.steed.group);
    }
    const H = this.steed;
    const k = this.hop(t, 0.3, new THREE.Vector3(0, P, 0), spot);
    this.at.copy(k > 0.5 ? spot : new THREE.Vector3(0, P, 0));
    this.frame.look = this.world(spot.clone().addScaledVector(L, 0.3).setY(1.0));
    this.frame.radius = 3.2;
    // Up from behind at a trot, a turn to put its back to them, a look over its shoulder, and a kick.
    const stop = spot.clone().addScaledVector(L, -1.55).addScaledVector(this.cam, -0.1);
    const from = stop.clone().addScaledVector(this.cam, -6).addScaledVector(L, -2);
    const inK = span(t, 0.5, 2.0);
    const leave = this.survives ? span(t, 5.0, 6.4) : span(t, 4.2, 5.6);
    H.group.visible = t > 0.5 && leave < 0.99;
    H.group.position.lerpVectors(from, stop, inK).lerp(from, leave);
    const trotting = (t > 0.5 && t < 2.0) || (leave > 0 && leave < 1);
    const ahead = stop.clone().sub(from).normalize();
    let face = this.face(ahead);
    if (t > 1.9) face = this.face(ahead).slerp(this.face(L.clone().negate()), span(t, 1.9, 2.3));
    if (leave > 0) face = this.face(ahead.clone().negate());
    H.group.quaternion.copy(face);
    const ph = t * 11;
    H.legs.forEach((l, i) => (l.rotation.x = trotting ? Math.sin(ph + (i === 0 || i === 3 ? 0 : Math.PI)) * 0.45 : 0));
    H.body.position.y = 1.05 + (trotting ? Math.abs(Math.sin(ph)) * 0.05 : 0);
    if (trotting) for (let n = 0; n < 8; n++) this.sfx('putt', 0.6 + n * 0.18, t);
    this.sfx('neigh', 2.3, t);
    H.head.rotation.y = span(t, 2.2, 2.4) * 0.6 * (1 - span(t, 2.6, 2.7));
    // The kick: down at the front, both back hooves out behind.
    const kickAt = 2.85;
    const kick = span(t, kickAt - 0.12, kickAt) * (1 - span(t, kickAt + 0.3, kickAt + 0.6));
    H.body.rotation.x = kick * 0.3;
    H.legs[2].rotation.x = H.legs[3].rotation.x = kick * 1.3;
    this.turn.copy(this.face(this.cam));
    const look = span(t, 2.2, 2.5) * (1 - span(t, 2.75, 2.85));
    this.turn.slerp(this.face(L.clone().negate()), look * 0.7);
    if (this.survives) {
      // A duck, just in time: the hooves go over, and the horse, kicking at nothing, sits down hard on its rump.
      const duck = span(t, kickAt - 0.25, kickAt - 0.1) * (1 - span(t, kickAt + 0.4, kickAt + 0.6));
      this.stretch.set(1 + duck * 0.12, 1 - duck * 0.45, 1 + duck * 0.12);
      this.sfx('whoosh', kickAt, t);
      const sit = span(t, kickAt + 0.3, kickAt + 0.6) * (1 - leave);
      H.group.rotateX(-sit * 0.45);
      H.group.position.y = sit * 0.25;
      this.sfx('thud', kickAt + 0.6, t);
      this.dizzyAt(t, t > kickAt + 0.6 && t < 5.0 ? stop.clone().setY(2.1) : null, 0.3);
      return { anim: t > kickAt + 0.9 ? 'cheer' : duck > 0.2 ? 'cry' : 'idle', visible: true };
    }
    if (t < kickAt) return { anim: t > 2.3 ? 'cry' : 'idle', visible: true };
    // POP: off comes the head like a cork, up in an arc and away, bouncing over the cobbles.
    this.sfx('pop', kickAt, t);
    const neckW = b.neck.clone().applyQuaternion(this.face(this.cam)).add(spot);
    this.once('cork', kickAt, t, () => this.uncork(neckW));
    const [body, head] = this.pieces;
    const u = t - kickAt;
    if (head) {
      const rest = spot.clone().addScaledVector(L, 3.0).addScaledVector(this.cam, 0.4);
      const flyFor = 0.75;
      const p = new THREE.Vector3();
      if (u < flyFor) {
        const k2 = u / flyFor;
        p.lerpVectors(neckW, rest, k2 * 0.7);
        p.y = neckW.y + 2.4 * 4 * k2 * (1 - k2) * 0.8 - 0.3 * k2;
      } else {
        // Two little bounces on along the ground, then it rolls to a stop.
        const v = u - flyFor;
        p.copy(neckW).lerp(rest, 0.7 + 0.3 * easeOut(v / 1.2));
        p.y = 0.12 + Math.abs(Math.sin(v * 7)) * Math.exp(-v * 3) * 0.5;
      }
      head.group.position.copy(p).sub(b.head.clone().sub(b.neck).applyQuaternion(this.face(this.cam)).multiplyScalar(0.5)).add(new THREE.Vector3(0, 0, 0));
      head.group.position.copy(p);
      head.group.quaternion.copy(about(this.cam, -Math.min(u, flyFor + 1.2) * 9));
      for (let n = 0; n < 3; n++) this.sfx('boing', kickAt + flyFor + (n * Math.PI) / 7, t);
      this.dizzyAt(t, u > flyFor + 0.4 && t < this.soulAt ? rest.clone().setY(0.55) : null, 0.18);
    }
    if (body) {
      // Stands there a moment, wobbling, wondering; then over it goes, stiff as a board.
      const tip = Math.min(1, Math.max(0, (u - 0.9) / 0.45) ** 2);
      const wob = Math.sin(u * 9) * 0.06 * Math.max(0, 1 - u / 0.9);
      const R = about(new THREE.Vector3().crossVectors(UP, L), (Math.PI / 2 - 0.05) * tip + wob);
      const foot = spot.clone();
      body.group.position.copy(neckW.clone().sub(foot).applyQuaternion(R).add(foot));
      body.group.quaternion.copy(R);
      this.sfx('thud', kickAt + 1.35, t);
      if (tip >= 1) this.once('thud', kickAt + 1.35, t, () => this.bursts.add(t, 'dust', this.world(spot.clone().addScaledVector(L, b.box.max.y * 0.6)), 0.5));
    }
    this.sign('pop', 'POP!', 1.3, 0.6, t, kickAt + 0.05, kickAt + 1.2, spot.clone().setY(2.3).addScaledVector(L, 0.6));
    this.setExtraVec('soulFrom', spot.clone().addScaledVector(L, b.box.max.y * 0.4).setY(0.1));
    return { anim: 'idle', visible: false };
  }

  /** The kick: the animal baked as it stands, cut at the neck into a head and the rest of them. */
  private uncork(neckW: THREE.Vector3) {
    if (!this.who) return;
    const parts = bakeAnimal(this.who);
    const toLocal = this.group.matrixWorld.clone().invert();
    for (const p of parts) p.geometry.applyMatrix4(toLocal);
    const b = this.size();
    const N = b.head.clone().sub(b.neck).applyQuaternion(this.face(this.cam));
    if (N.lengthSq() < 1e-4) N.set(0, 1, 0);
    N.normalize();
    const body = new BakedPiece(parts, neckW, { keep: N.clone().negate() });
    const head = new BakedPiece(parts, neckW, { keep: N });
    freeBake(parts);
    this.group.add(body.group, head.group);
    this.pieces.push(body, head);
    this.bursts.add(2.85, 'poof', this.world(neckW), 0.45);
  }

  // ---------------------------------------------------------------- bowling

  private bowl(t: number): Shown {
    const P = this.P;
    const L = this.left.clone();
    // The lane runs across the square in front of the gallows, the condemned the head pin at its left-hand end.
    const spot = this.V(2.7, 1.6, 0);
    const len = 8;
    if (!this.alley) {
      this.alley = lane(len);
      this.alley.group.quaternion.copy(basis(X, UP, L, UP));
      this.alley.group.position.copy(spot);
      this.props.add(new THREE.Group().add(this.alley.group));
    }
    const A = this.alley;
    const k = this.hop(t, 0.25, new THREE.Vector3(0, P, 0), spot);
    this.popProps(t, [this.world(spot.clone().addScaledVector(L, -2).setY(0.3))]);
    this.at.copy(k > 0.5 ? spot.clone().setY(0.04) : new THREE.Vector3(0, P, 0));
    this.frame.look = this.world(spot.clone().addScaledVector(L, -2.2).setY(0.8));
    this.frame.radius = 3.6;
    // The ball, from the far end of the lane, rolling all the way.
    const roll = 0.9;
    const hitAt = 2.5;
    const speed = len / (hitAt - roll);
    let x = -len + speed * (t - roll);
    let z = 0;
    if (this.survives) {
      // Drifting, drifting... into the gutter.
      z = 0.85 * span(t, 1.4, 2.1);
    } else if (t > hitAt) x = speed * 0.25 * (1 - Math.exp(-(t - hitAt) * 4)) + 0.05;
    if (this.survives && t > hitAt) x = speed * (t - hitAt);
    A.ball.visible = t > roll - 0.1 && x < 4;
    A.ball.position.set(Math.min(x, 4), A.r + (this.survives && t > 1.4 ? -0.12 * span(t, 1.4, 2.1) : 0.04), z);
    A.ball.rotation.z = -x / A.r;
    this.sfx('rumble', roll, t);
    this.turn.copy(this.face(this.cam).slerp(this.face(L.clone().negate()), span(t, 1.2, 1.5) * 0.7));
    if (this.survives) {
      this.sign('gutter', 'GUTTER BALL', 2.4, 0.55, t, hitAt + 0.1, this.end - 0.3, spot.clone().setY(2.4).addScaledVector(L, -1.2), { bg: '#fffaf0', fg: '#3a6ec0', border: '#3a6ec0' });
      this.sfx('wahwah', hitAt + 0.1, t);
      return { anim: t > hitAt + 0.4 ? 'cheer' : t > 1.5 ? 'cry' : 'idle', visible: true };
    }
    // STRIKE: the pins everywhere, and them flying head over heels, up and away off the end of the lane.
    this.sfx('clatter', hitAt, t);
    this.sfx('tada', hitAt + 0.3, t);
    this.once('strike', hitAt, t, () => this.bursts.add(hitAt + 0.1, 'confetti', this.world(spot.clone().setY(1.2)), 1.4));
    const u = Math.max(0, t - hitAt);
    A.pins.forEach((p, i) => {
      if (u <= 0) return;
      const home = [0.45, 0.45, 0.9, 0.9, 0.9][i];
      const side = [-0.28, 0.28, -0.55, 0, 0.55][i];
      const fly = Math.min(u, 0.9);
      p.position.set(home + (2 + hash(i, 1) * 2.5) * fly, Math.max(0.04, 0.04 + (3 + hash(i, 2) * 2) * fly - 4.9 * fly * fly), side * (1 + 2 * fly) + (hash(i, 3) - 0.5) * fly * 2);
      p.rotation.set(fly * (6 + i * 2), 0, fly * (8 + i));
    });
    let visible = true;
    if (u > 0) {
      const away = new THREE.Vector3().copy(spot).addScaledVector(L, 1.5 + u * 7).setY(0.3 + 8 * u - 3.2 * u * u);
      this.at.copy(away);
      this.turn.copy(this.face(this.cam).multiply(about(Z, u * 14)).multiply(about(X, u * 5)));
      visible = u < 1.6;
    }
    this.sign('strike', 'STRIKE!', 2.0, 0.65, t, hitAt + 0.15, hitAt + 2.0, spot.clone().setY(2.5).addScaledVector(L, -0.8));
    this.setExtraVec('soulFrom', spot.clone().setY(0.1));
    return { anim: u > 0 ? 'cry' : t > 1.5 ? 'cry' : 'idle', visible };
  }

  // ---------------------------------------------------------------- the tanks

  private tanks(t: number): Shown {
    const P = this.P;
    const across = this.left.clone();
    // Down onto the cobbles in front, and a column of tanks rolls in along the road from the right and on over them.
    const spot = this.V(2.5, 0.5, 0);
    if (!this.column.length) {
      for (let i = 0; i < 3; i++) {
        const tk = tank(i + 1);
        tk.group.visible = false;
        tk.group.scale.setScalar(0.85);
        this.keep(tk.group);
        this.disposers.push(tk.dispose);
        this.column.push(tk);
      }
    }
    const k = this.hop(t, 0.3, new THREE.Vector3(0, P, 0), spot);
    this.at.copy(k > 0.5 ? spot : new THREE.Vector3(0, P, 0));
    this.frame.look = this.world(spot.clone().setY(0.7).addScaledVector(across, -0.8).addScaledVector(this.cam, -0.3));
    this.frame.radius = 3.6;
    const hitAt = 2.1;
    const speed = 3.4;
    const gap = 3.1;
    const front = 1.05;
    this.sfx('rumble', 0.6, t);
    this.sfx('engine', 1.0, t);
    this.column.forEach((tk, i) => {
      // `s` is how far past the condemned its middle is, along the road.
      let s = (t - hitAt) * speed - front - i * gap;
      if (this.survives) {
        // Brakes on, all of them, the lead tank's nose just short of theirs; a hatch, a pop of confetti; and back.
        const stopAt = -front - 0.75 - i * (gap - 0.3);
        if (s > stopAt) s = stopAt + Math.exp(-((t - hitAt) * speed - front - i * gap - stopAt) * 1.5) * 0 - 0.0;
        s -= span(t, 4.0, 5.6) * 9;
      }
      tk.group.visible = t > 0.4 && Math.abs(s) < 11 && t < this.end - 0.2;
      tk.group.position.copy(spot).addScaledVector(across, s).addScaledVector(this.cam, 0.05);
      tk.group.quaternion.copy(this.face(across));
      for (const w of tk.wheels) w.rotation.x = s / 0.2;
      tk.hull.position.y = Math.abs(Math.sin(t * 16 + i)) * 0.02;
      tk.turret.rotation.y = Math.sin(t * 1.3 + i * 2) * 0.12;
      tk.barrel.rotation.x = Math.sin(t * 2 + i) * 0.05;
      // Over the bump of them.
      if (!this.survives && Math.abs(s) < 1.1 && t > hitAt - 0.3) tk.hull.position.y += Math.cos((s / 1.1) * (Math.PI / 2)) * 0.12;
      if (this.survives && i === 0) {
        tk.hatch.rotation.z = -span(t, 3.0, 3.3) * 1.9 * (1 - span(t, 3.8, 4.0));
        tk.barrel.rotation.x = -span(t, 3.2, 3.4) * 0.25 * (1 - span(t, 3.8, 4.0));
        this.once('popper', 3.4, t, () => this.bursts.add(3.4, 'confetti', tk.barrel.localToWorld(new THREE.Vector3(0, 0, 1.4)), 1.2));
      }
    });
    this.turn.copy(this.face(this.cam));
    const look = span(t, 1.2, 1.5);
    this.turn.slerp(this.face(across.clone().negate()), look * 0.8);
    if (this.survives) {
      this.sfx('skid', 1.75, t);
      this.sfx('pop', 3.4, t);
      this.sfx('tada', 3.5, t);
      const faint = span(t, 1.9, 2.05) * (1 - span(t, 2.6, 2.9));
      this.stretch.set(1, 1 - faint * 0.12, 1);
      return { anim: t > 3.5 ? 'cheer' : t > 1.3 ? 'cry' : 'idle', visible: true };
    }
    // Flat as a pancake under the tracks (three times over), peeled up and fluttering, stars round them.
    const flatAt = hitAt - 0.15;
    for (let i = 0; i < 3; i++) this.sfx('flump', flatAt + (i * gap) / speed, t);
    this.once('flat', flatAt, t, () => this.bursts.add(flatAt, 'dust', this.world(spot.clone().setY(0.2)), 0.8));
    if (t > flatAt) {
      const lie = basis(Y, Z, this.cam.clone().negate(), UP);
      this.stretch.set(1.4, 1.3, 0.08);
      this.put(lie, spot.clone().setY(0.06), new THREE.Vector3(this.mid().x, this.mid().y, this.thick().back));
      const clear = hitAt + (front + 2 * gap + 1.2) / speed;
      this.dizzyAt(t, t > clear && t < this.soulAt ? spot.clone().setY(0.35) : null, 0.25);
    }
    this.setExtraVec('soulFrom', spot.clone().setY(0.05));
    return { anim: t > 1.3 && t < flatAt ? 'cry' : 'idle', visible: true };
  }

  // ---------------------------------------------------------------- the silent hitman

  private hit(t: number): Shown {
    const b = this.size();
    const P = this.P;
    const L = this.left.clone();
    // Well out on the cobbles, so the black suit stands out against them.
    const spot = this.V(3.3, 0.6, 0);
    const tall = b.box.max.y;
    if (!this.guy) {
      this.guy = person({ coat: '#1e1c22', trousers: '#1e1c22', shirt: '#f4efe6', tie: '#c8202a', hair: null });
      this.guy.group.scale.setScalar(0.85);
      this.guy.group.visible = false;
      this.keep(this.guy.group);
      // The garrotte: a wire from each hand round the front of the neck.
      for (let i = 0; i < 2; i++) {
        const w = cord('#e8ecf0', 0.016);
        w.visible = false;
        this.keep(w);
        this.wire.push(w);
      }
    }
    const M = this.guy;
    const k = this.hop(t, 0.25, new THREE.Vector3(0, P, 0), spot);
    this.at.copy(k > 0.5 ? spot : new THREE.Vector3(0, P, 0));
    this.turn.copy(this.face(this.cam));
    this.frame.look = this.world(spot.clone().setY(0.9).addScaledVector(this.cam, -0.3));
    this.frame.radius = 2.9;
    // On tiptoe from behind and off to the side, in big slow sneaking steps.
    const behind = spot.clone().addScaledVector(this.cam, -0.36).addScaledVector(L, 0.22);
    const from = behind.clone().addScaledVector(this.cam, -3.5).addScaledVector(L, 3);
    const creep = span(t, 0.6, 2.4);
    M.group.visible = t > 0.55;
    M.group.position.lerpVectors(from, behind, creep);
    const sneaking = t > 0.6 && t < 2.4;
    const dir = behind.clone().sub(from).normalize();
    M.group.quaternion.copy(this.face(dir).slerp(this.face(this.cam), span(t, 2.2, 2.45)));
    const ph = t * 4.5;
    M.legs[0].rotation.x = sneaking ? Math.max(0, Math.sin(ph)) * -0.9 : 0;
    M.legs[1].rotation.x = sneaking ? Math.max(0, -Math.sin(ph)) * -0.9 : 0;
    M.body.position.y = 0.86 + (sneaking ? Math.abs(Math.sin(ph)) * 0.06 : 0) - 0.1;
    M.body.rotation.x = 0.32;
    M.arms[0].rotation.set(sneaking ? -1.1 : -0.3, 0, 0);
    M.arms[1].rotation.set(sneaking ? -1.1 : -0.3, 0, 0);
    M.arms.forEach((a) => (a.scale.y = 1));
    M.group.updateMatrixWorld(true);
    // The neck, and a spot just in front of it (the wire goes round there), and one over the head.
    const neck = b.neck.clone().add(new THREE.Vector3(0, 0, 0)).applyQuaternion(this.turn).add(this.at);
    const throat = neck.clone().addScaledVector(this.cam, Math.max(0.1, b.head.z - b.neck.z + 0.08));
    const overHead = spot.clone().setY(tall + 0.35);
    let loop: THREE.Vector3 | null = null;
    if (this.survives) {
      // Up goes the wire... they turn round; he freezes, whips it behind his back, and backs away, whistling.
      if (t > 2.45 && t < 2.9) loop = overHead;
      if (t > 2.9) {
        M.arms[0].rotation.set(0.5, 0, 0.2);
        M.arms[1].rotation.set(0.5, 0, -0.2);
        M.body.rotation.x = -0.05;
        const back = span(t, 3.8, 5.6);
        M.group.position.lerpVectors(behind, from, back);
        M.group.quaternion.copy(this.face(this.cam));
        M.legs[0].rotation.x = back > 0 && back < 1 ? Math.sin(t * 6) * 0.35 : 0;
        M.legs[1].rotation.x = -M.legs[0].rotation.x;
        M.group.visible = back < 0.99;
      }
      this.turn.copy(this.face(this.cam).slerp(this.face(this.cam.clone().negate()), span(t, 2.6, 2.85) * (1 - span(t, 5.0, 5.3))));
      this.sign('innocent', 'Just looking.', 2.3, 0.5, t, 3.0, 4.6, behind.clone().setY(2.35), { bg: '#fffaf0', fg: '#2e2c36', border: '#2e2c36' });
      this.sfx('scratch', 2.75, t);
      this.sfx('tune', 3.2, t);
    } else if (t > 2.45) {
      // Over the head and down round the neck; a long struggle; and they go limp.
      loop = t < 2.85 ? overHead.clone().lerp(throat, span(t, 2.55, 2.85)) : throat;
    }
    if (loop) {
      const hands = [loop.clone().addScaledVector(L, 0.24).addScaledVector(this.cam, -0.35), loop.clone().addScaledVector(L, -0.24).addScaledVector(this.cam, -0.35)];
      if (t > 2.9 && !this.survives) for (const h of hands) h.addScaledVector(this.cam, -0.12 * (1 - span(t, 3.9, 4.2)));
      M.arms.forEach((a, i) => {
        reachFor(a, this.world(hands[i]));
        a.parent!.updateMatrixWorld(true);
        const shoulder = a.parent!.localToWorld(a.position.clone());
        a.scale.y = THREE.MathUtils.clamp(this.world(hands[i]).distanceTo(shoulder) / (0.6 * 0.85), 0.6, 1.8);
      });
      M.body.rotation.x = t > 2.9 && !this.survives ? 0.05 + Math.sin(t * 13) * 0.04 : 0.25;
      M.group.updateMatrixWorld(true);
      const ends = M.hands.map((h) => this.group.worldToLocal(h.getWorldPosition(new THREE.Vector3())));
      this.wire.forEach((w, i) => {
        w.visible = true;
        stretchCord(w, ends[i], loop!);
      });
    } else this.wire.forEach((w) => (w.visible = false));
    if (this.survives) return { anim: t > 5.3 ? 'cheer' : t > 2.6 ? 'cry' : 'idle', visible: true };
    this.sfx('strain', 2.9, t);
    this.sfx('scratch', 2.5, t);
    let anim: Anim = t > 2.6 ? 'cry' : 'idle';
    if (t > 2.9 && t < 4.0) {
      const u = t - 2.9;
      this.at.addScaledVector(L, Math.sin(u * 31) * 0.03);
      this.stretch.set(1 + Math.sin(u * 17) * 0.04, 1 - Math.abs(Math.sin(u * 9)) * 0.06, 1);
    }
    // Limp, over on their back; a cartoon scuffle cloud; and out he comes in their colours and a pair of their ears,
    // while they're left in their polka-dot underpants.
    const slump = span(t, 4.0, 4.4);
    const swap = 4.9;
    if (t > 4.0) {
      this.wire.forEach((w) => (w.visible = t < 4.3));
      const tip = slump * (Math.PI / 2 - 0.05);
      const R = about(new THREE.Vector3().crossVectors(UP, this.cam.clone().negate()), tip);
      this.turn.premultiply(R);
      this.at.copy(spot);
      anim = 'idle';
      this.dizzyAt(t, t > 4.5 && t < this.soulAt ? spot.clone().addScaledVector(this.cam, -tall * 0.85).setY(0.35) : null);
    }
    for (let n = 0; n < 4; n++) {
      const at = 4.45 + n * 0.12;
      this.once(`scuffle${n}`, at, t, () => this.bursts.add(at, n % 2 ? 'poof' : 'dust', this.world(behind.clone().addScaledVector(this.cam, 0.1).setY(0.6 + n * 0.12)), 0.85));
    }
    this.sfx('clatter', 4.45, t);
    this.sfx('poof', 4.9, t);
    if (!this.costume) {
      const c = this.coat();
      const cb = new Builder();
      cb.add(G.rbox(0.3), c, { pos: [0, 0.38, 0], scale: [0.52, 0.64, 0.34] });
      for (const sx of [-1, 1]) cb.add(G.cone(8), c, { pos: [sx * 0.1, 1.02, 0], rot: [0, 0, sx * -0.25], scale: [0.07, 0.17, 0.05] });
      cb.add(G.sphere(10, 8), c, { pos: [0, 0.05, -0.2], scale: [0.09, 0.09, 0.14] });
      this.costume = new THREE.Group().add(cb.mesh(matte()));
      this.costume.visible = false;
      M.body.add(this.costume);
      this.disposers.push(() => this.costume && disposeObject(this.costume));
      this.pants = undies(Math.max(0.3, (b.box.max.x - b.box.min.x) * 0.8));
      this.pants.visible = false;
      this.keep(this.pants);
    }
    this.costume.visible = t > swap;
    // (He's hidden in the cloud while he changes.)
    if (t > 4.45 && t < swap) M.group.visible = false;
    if (this.pants) {
      this.pants.visible = t > swap;
      const hips = new THREE.Vector3(0, tall * 0.3, 0).applyQuaternion(this.turn).add(this.at);
      this.pants.position.copy(hips);
      this.pants.quaternion.copy(this.turn);
    }
    if (t > swap) {
      // Off he shuffles, a waddle and a look back.
      const go = span(t, swap + 0.3, swap + 2.4);
      const out = behind.clone().addScaledVector(L, -4).addScaledVector(this.cam, -1);
      M.group.visible = go < 0.99;
      M.group.position.lerpVectors(behind.clone().addScaledVector(L, -0.6), out, go);
      M.group.quaternion.copy(this.face(out.clone().sub(behind).normalize()).slerp(this.face(this.cam), span(t, swap, swap + 0.3) * (1 - span(t, swap + 0.3, swap + 0.6))));
      M.group.rotateZ(Math.sin(t * 10) * 0.08 * (go > 0 && go < 1 ? 1 : 0));
      M.body.rotation.x = 0;
      M.arms.forEach((a) => (a.scale.y = 1));
      this.stride(M, t, go > 0 && go < 1, 10, 0.3);
      M.body.position.y -= 0.1;
    }
    this.setExtraVec('soulFrom', spot.clone().addScaledVector(this.cam, -tall * 0.5).setY(0.1));
    return { anim, visible: true };
  }

  // ---------------------------------------------------------------- the paint cans

  private paint(t: number): Shown {
    const b = this.size();
    const P = this.P;
    const L = this.left.clone();
    // A doorway under a landing, down on the cobbles; they stand under it with their back to us, looking up.
    const spot = this.V(2.4, 0.3, 0);
    const beamY = 2.7;
    const headY = Math.max(0.4, b.head.y);
    if (!this.cans) {
      this.cans = paintRig(Math.max(0.4, beamY - headY - 0.2), beamY);
      this.cans.group.quaternion.copy(basis(X, UP, L, UP));
      this.cans.group.position.copy(spot);
      this.props.add(new THREE.Group().add(this.cans.group));
    }
    const C = this.cans;
    const k = this.hop(t, 0.25, new THREE.Vector3(0, P, 0), spot);
    this.popProps(t, [this.world(spot.clone().setY(1.3))]);
    // (In the rig's frame z is towards the camera, so a can held up behind swings down into their face.)
    const toward = new THREE.Vector3(0, 0, 1).applyQuaternion(C.group.quaternion);
    const stand = spot.clone().addScaledVector(toward, Math.max(0.12, b.mouth.z) + 0.02);
    this.at.copy(k > 0.5 ? stand : new THREE.Vector3(0, P, 0));
    this.turn.copy(this.face(this.cam).slerp(this.face(toward.clone().negate()), span(t, 0.7, 1.0)));
    this.turn.multiply(about(X, -span(t, 1.0, 1.3) * 0.3));
    this.frame.look = this.world(spot.clone().setY(1.3));
    this.frame.radius = 3.0;
    // Each can: held up level behind, let go, down in an arc into the face, and swinging back.
    const hits = [1.9, 3.3];
    const swingTo = (i: number) => {
      const hitAt = hits[i];
      const rel = hitAt - 0.55;
      if (t < rel) return Math.PI / 2;
      if (t < hitAt) return (Math.PI / 2) * Math.cos(((t - rel) / 0.55) * (Math.PI / 2));
      const u = t - hitAt;
      return 1.0 * Math.sin((u / 1.1) * Math.PI) * Math.exp(-u * 0.7) * (this.survives ? -1 : 1);
    };
    C.swings.forEach((s, i) => (s.rotation.x = swingTo(i)));
    hits.forEach((h) => this.sfx('whoosh', h - 0.4, t));
    if (this.survives) {
      // Ducks the first (it sails over) and steps aside from the second.
      const duck = span(t, hits[0] - 0.25, hits[0] - 0.1) * (1 - span(t, hits[0] + 0.3, hits[0] + 0.5));
      this.stretch.set(1 + duck * 0.15, 1 - duck * 0.5, 1 + duck * 0.15);
      const aside = span(t, hits[1] - 0.45, hits[1] - 0.2);
      this.at.addScaledVector(L, aside * 0.8).addScaledVector(toward, aside * 0.4);
      if (t > hits[1] + 0.3) this.turn.copy(this.face(this.cam));
      return { anim: t > hits[1] + 0.5 ? 'cheer' : t > 1.0 ? 'cry' : 'idle', visible: true };
    }
    // BONK: back a step, dizzy, a wobble forward again... BONK, and flat on their back.
    hits.forEach((h) => this.sfx('bong', h, t));
    hits.forEach((h, i) => this.once(`bonk${i}`, h, t, () => this.bursts.add(h, 'sparkle', this.world(stand.clone().setY(headY + 0.1)), 0.7)));
    const reel = span(t, hits[0], hits[0] + 0.3) * (1 - span(t, hits[0] + 0.8, hits[1]));
    this.at.addScaledVector(toward, reel * 0.4);
    this.turn.multiply(about(X, -reel * 0.25 + Math.sin(t * 6) * 0.08 * reel));
    let anim: Anim = t > 1.0 ? 'cry' : 'idle';
    if (t > hits[0] && t < hits[1]) this.dizzyAt(t, stand.clone().addScaledVector(toward, reel * 0.4).setY(b.box.max.y + 0.15));
    if (t > hits[1]) {
      // Over backwards, stiff as a board, onto the cobbles towards us.
      const fall = Math.min(1, ((t - hits[1]) / 0.4) ** 2);
      const R = about(new THREE.Vector3().crossVectors(UP, toward), (Math.PI / 2 - 0.05) * fall);
      this.turn.copy(this.face(toward.clone().negate())).premultiply(R);
      this.at.copy(stand);
      this.sfx('thud', hits[1] + 0.4, t);
      this.once('fall', hits[1] + 0.4, t, () => this.bursts.add(hits[1] + 0.4, 'dust', this.world(stand.clone().addScaledVector(toward, b.box.max.y * 0.6)), 0.6));
      this.dizzyAt(t, t > hits[1] + 0.4 && t < this.soulAt ? stand.clone().addScaledVector(toward, b.box.max.y * 0.85).setY(0.35) : null);
      anim = 'idle';
    }
    this.setExtraVec('soulFrom', stand.clone().addScaledVector(toward, b.box.max.y * 0.5).setY(0.1));
    return { anim, visible: true };
  }

  // ---------------------------------------------------------------- the paddling pool shark

  private jaws(t: number): Shown {
    const b = this.size();
    const P = this.P;
    const L = this.left.clone();
    const spot = this.V(2.4, 0.3, 0);
    if (!this.paddle) {
      this.paddle = pool();
      this.paddle.group.position.copy(spot);
      this.props.add(new THREE.Group().add(this.paddle.group));
      this.fish = shark();
      this.fish.group.visible = false;
      this.keep(this.fish.group);
      this.toy = duck();
      this.toy.visible = false;
      this.keep(this.toy);
    }
    const S = this.fish!;
    const T = this.paddle;
    const k = this.hop(t, 0.25, new THREE.Vector3(0, P, 0), spot);
    this.popProps(t, [this.world(spot.clone().setY(0.4))]);
    this.at.copy(k > 0.5 ? spot.clone().setY(0.1) : new THREE.Vector3(0, P, 0));
    this.turn.copy(this.face(this.cam));
    this.frame.look = this.world(spot.clone().setY(1.2));
    this.frame.radius = 3.0;
    this.frame.low = 0.15;
    // A little fin, round and round, closer and faster; then it's gone under.
    const circle = t > 0.6 && t < 2.3;
    const a = t * (2 + t * 0.9);
    const r = 0.7 - span(t, 0.6, 2.3) * 0.15;
    T.fin.visible = circle;
    T.fin.position.set(Math.cos(a) * r, 0.3, Math.sin(a) * r);
    T.fin.rotation.y = -a;
    T.water.position.y = 0.3 + Math.sin(t * 5) * 0.01;
    this.sfx('dundun', 0.7, t);
    this.sfx('dundun', 1.6, t);
    this.sfx('dundun', 2.1, t);
    // Shifting from foot to foot, looking down.
    if (circle) this.turn.multiply(about(Y, Math.sin(a) * 0.4)).multiply(about(X, 0.2));
    // Up it comes, enormous, mouth wide, out of the little pool; snap; and back down.
    const up = 2.4;
    const snap = 2.85;
    const down = 3.4;
    const rise = span(t, up, up + 0.3) * (1 - span(t, down, down + 0.45));
    S.group.visible = t > up && t < down + 0.5;
    S.group.position.copy(spot).setY(-3.2 + rise * 3.0);
    S.group.quaternion.copy(this.face(this.cam));
    S.group.rotateZ(Math.sin(t * 8) * 0.04);
    S.jaw.rotation.x = t < snap - 0.1 ? 0.7 * span(t, up, up + 0.2) : 0.7 * (1 - span(t, snap - 0.1, snap));
    this.sfx('splash', up, t);
    this.once('up', up, t, () => this.bursts.add(up, 'splash', this.world(spot.clone().setY(0.4)), 2.2));
    this.once('down', down + 0.3, t, () => this.bursts.add(down + 0.3, 'splash', this.world(spot.clone().setY(0.4)), 1.8));
    this.sfx('splash', down + 0.3, t);
    if (this.survives) {
      // A leap out, sideways, just in time; the jaws close on nothing; and a rubber duck is spat out.
      const out = span(t, up - 0.1, up + 0.3);
      const land = spot.clone().addScaledVector(L, 1.6).addScaledVector(this.cam, 0.4);
      if (out > 0) {
        this.at.lerpVectors(spot.clone().setY(0.1), land, out);
        this.at.y += Math.sin(out * Math.PI) * 0.8;
      }
      this.sfx('chop', snap, t);
      const ptoo = 3.0;
      this.sfx('ptoo', ptoo, t);
      this.sfx('squeak', ptoo + 0.6, t);
      if (this.toy) {
        const u = t - ptoo;
        this.toy.visible = u > 0;
        const f = Math.min(1, u / 0.6);
        this.toy.position.copy(spot).setY(2.2).lerp(land.clone().addScaledVector(L, -0.6), f);
        this.toy.position.y = 2.2 * (1 - f) + 2.0 * Math.sin(f * Math.PI) * 0.4;
        this.toy.rotation.set(0, Math.PI, u < 0.6 ? u * 12 : 0);
        this.toy.scale.setScalar(1.6);
      }
      return { anim: t > up + 0.5 ? 'cheer' : t > 1.2 ? 'cry' : 'idle', visible: true };
    }
    // Lifted up into the great mouth on its way out of the water, and gulp.
    this.sfx('gobble', snap, t);
    this.sfx('burp', 4.0, t);
    let visible = true;
    if (t > up) {
      const into = span(t, up, snap);
      const mouth = S.group.position.clone().add(new THREE.Vector3(0, 1.95, 0)).addScaledVector(this.cam, 0.25);
      const from = spot.clone().setY(0.1);
      this.at.lerpVectors(from, mouth.clone().setY(mouth.y - b.box.max.y * 0.4), into);
      this.stretch.setScalar(1 - into * 0.45);
      this.turn.multiply(about(X, -into * 0.6));
      visible = t < snap;
    }
    this.setExtraVec('soulFrom', spot.clone().setY(0.3));
    return { anim: t > 1.2 ? 'cry' : 'idle', visible };
  }

  // ---------------------------------------------------------------- the chomper

  private chomp(t: number): Shown {
    const P = this.P;
    const L = this.left.clone();
    const spot = this.V(2.5, 1.3, 0);
    const n = 13;
    if (!this.muncher) {
      this.muncher = chomper();
      this.muncher.group.visible = false;
      this.keep(this.muncher.group);
      this.disposers.push(this.muncher.dispose);
      const geo = new THREE.SphereGeometry(0.09, 10, 8);
      const mat = new THREE.MeshLambertMaterial({ color: '#ffe8b0', emissive: '#806a40', emissiveIntensity: 0.5 });
      for (let i = 0; i < n; i++) {
        const m = new THREE.Mesh(geo, mat);
        m.position.copy(spot).addScaledVector(L, -1.0 - i * 0.55).setY(0.45);
        m.visible = false;
        this.group.add(m);
        this.dots.push(m);
      }
      this.pellet = new THREE.Mesh(new THREE.SphereGeometry(0.22, 14, 10), mat);
      this.pellet.position.copy(spot).addScaledVector(L, -0.6).addScaledVector(this.cam, 0.35).setY(0.45);
      this.pellet.visible = false;
      this.group.add(this.pellet);
      this.disposers.push(() => {
        geo.dispose();
        mat.dispose();
        this.pellet?.geometry.dispose();
        for (const m of this.dots) m.removeFromParent();
        this.pellet?.removeFromParent();
      });
    }
    const C = this.muncher;
    const k = this.hop(t, 0.25, new THREE.Vector3(0, P, 0), spot);
    this.at.copy(k > 0.5 ? spot : new THREE.Vector3(0, P, 0));
    this.turn.copy(this.face(this.cam));
    this.frame.look = this.world(spot.clone().addScaledVector(L, -2.0).setY(0.8));
    this.frame.radius = 3.4;
    // In from the right, gobbling its way along the dots, mouth going.
    const enter = 0.5;
    const speed = 3.4;
    const start = -9;
    const eatAt = 1.9;
    const chompAt = enter + (-0.7 - start) / speed;
    let x = start + speed * Math.max(0, t - enter);
    let fleeing = false;
    if (this.survives && t > eatAt) {
      // The power pellet: it stops dead, turns blue, and runs away the way it came.
      const at = start + speed * (eatAt - enter);
      x = at - Math.max(0, t - eatAt - 0.4) * speed * 1.2;
      fleeing = t > eatAt + 0.25;
    } else if (!this.survives && t > chompAt + 0.2) x = Math.min(0, -0.7 + speed * 0.2) + Math.max(0, t - chompAt - 0.9) * speed;
    C.group.visible = t > enter && x > start - 1 && x < 9;
    C.group.position.copy(spot).addScaledVector(L, x);
    C.group.quaternion.copy(this.face(fleeing ? L.clone().negate() : L));
    const open = 0.55 * Math.abs(Math.sin(t * 11));
    C.top.rotation.x = -open;
    C.bottom.rotation.x = open;
    C.group.position.y = Math.abs(Math.sin(t * 11)) * 0.04;
    this.dots.forEach((d, i) => (d.visible = t > 0.3 && C.group.position.clone().sub(spot).dot(L) < -1.0 - i * 0.55 - 0.3 && t < this.end - 0.3));
    for (let w = 0; w < 9; w++) this.sfx('wakka', enter + 0.2 + w * 0.26, t);
    const scared = fleeing;
    C.material.color.set(scared ? (Math.floor(t * 6) % 2 && t > 3.6 ? '#f4f4ff' : '#2a4ad8') : '#ffd52a');
    if (this.pellet) {
      this.pellet.visible = this.survives && t > 0.3 && t < 1.9;
      this.pellet.scale.setScalar(1 + Math.sin(t * 8) * 0.12);
    }
    if (this.survives) {
      // A quick gobble of the big pellet beside them, and the tables are turned.
      const eat = span(t, 1.6, 1.9);
      this.at.addScaledVector(L, -eat * 0.3 * (1 - span(t, 2.2, 2.5)));
      this.sfx('gulp', 1.9, t);
      this.sfx('charge', 2.0, t);
      return { anim: t > 2.3 ? 'cheer' : t > 1.3 ? 'cry' : 'idle', visible: true };
    }
    // CHOMP: they're inside it; it chews, swallows, and trundles on away.
    this.sfx('gobble', chompAt + 0.1, t);
    this.sfx('gulp', chompAt + 0.7, t);
    if (t > chompAt) {
      const chew = Math.max(0, t - chompAt);
      C.group.scale.set(1 + Math.sin(chew * 12) * 0.06 * Math.exp(-chew * 2), 1 - Math.sin(chew * 12) * 0.06 * Math.exp(-chew * 2), 1);
    }
    this.sign('score', '+200', 1.4, 0.55, t, chompAt + 0.5, chompAt + 1.8, spot.clone().setY(2.3), { bg: '#1e1c22', fg: '#ffd52a', border: '#ffd52a' });
    this.setExtraVec('soulFrom', spot.clone().setY(0.2));
    return { anim: t > 1.3 ? 'cry' : 'idle', visible: t < chompAt + 0.08 };
  }

  // ---------------------------------------------------------------- the falling blocks

  private blocks(t: number): Shown {
    const b = this.size();
    const P = this.P;
    const L = this.left.clone();
    const spot = this.V(2.4, 0.2, 0);
    const s = 0.5;
    // Six cells across and seven high, the condemned standing in the middle two, against a dark grid.
    const corner = spot.clone().addScaledVector(L, 3 * s).addScaledVector(this.cam, -0.3);
    const q = basis(X, UP, L.clone().negate(), UP);
    if (!this.well) {
      const gb = new Builder();
      gb.add(G.box(), '#20223a', { pos: [3 * s, 3.5 * s, -0.32], scale: [6 * s + 0.1, 7 * s + 0.1, 0.04] });
      for (let c = 0; c <= 6; c++) gb.add(G.box(), '#3a3e66', { pos: [c * s, 3.5 * s, -0.295], scale: [0.02, 7 * s, 0.01] });
      for (let r = 0; r <= 7; r++) gb.add(G.box(), '#3a3e66', { pos: [3 * s, r * s, -0.295], scale: [6 * s, 0.02, 0.01] });
      for (const sx of [-0.06, 6 * s + 0.06]) gb.add(G.box(), '#8a8ab0', { pos: [sx, 3.5 * s, -0.1], scale: [0.12, 7 * s + 0.1, 0.5] });
      this.well = new THREE.Group().add(gb.mesh(matte()));
      this.well.quaternion.copy(q);
      this.well.position.copy(corner);
      this.props.add(new THREE.Group().add(this.well));
      // Two squares either side, a third to finish it (two halves, so one half can stay when the lines clear).
      const add = (cells: [number, number][], color: string, from: number, land: number, row: number, clears: boolean) => {
        const g = blockPiece(cells, s, color);
        g.quaternion.copy(q);
        g.visible = false;
        this.keep(g);
        this.pieces3.push({ group: g, from, land, row, clears });
      };
      add([[0, 0], [1, 0], [0, 1], [1, 1]], '#f2c22a', 0.5, 1.1, 0, true);
      add([[4, 0], [5, 0], [4, 1], [5, 1]], '#3ac0e0', 1.2, 1.8, 0, true);
      const r0 = this.survives ? 0 : 1;
      add([[2, r0], [3, r0]], '#a050c0', 2.1, 2.8, r0, true);
      add([[2, r0 + 1], [3, r0 + 1]], '#a050c0', 2.1, 2.8, r0 + 1, this.survives);
    }
    const k = this.hop(t, 0.25, new THREE.Vector3(0, P, 0), spot);
    this.popProps(t, [this.world(spot.clone().setY(1.2))]);
    this.at.copy(k > 0.5 ? spot : new THREE.Vector3(0, P, 0));
    this.turn.copy(this.face(this.cam));
    this.frame.look = this.world(spot.clone().setY(1.3));
    this.frame.radius = 3.0;
    const clearAt = 3.2;
    const goneAt = 3.75;
    // A flash, three blinks, and the full lines are gone; what's over them drops down.
    const blink = t > clearAt && t < goneAt && Math.floor((t - clearAt) * 8) % 2 === 1;
    for (const p of this.pieces3) {
      const fallK = Math.min(1, Math.max(0, (t - p.from) / (p.land - p.from)));
      let y = 7 * s * (1 - fallK * fallK);
      // (The top half of the last piece, left when the lines below it clear, drops into the gap.)
      if (!p.clears && t > goneAt) y = -Math.min(1, (t - goneAt) / 0.2) * 2 * s;
      p.group.position.copy(corner).add(new THREE.Vector3(0, y, 0));
      p.group.visible = t > p.from && t < this.end - 0.25 && !(p.clears && t > goneAt);
      if (blink && p.clears) p.group.visible = false;
      this.sfx('thunk', p.land, t);
    }
    this.sfx('clear', clearAt, t);
    this.once('clear', goneAt, t, () => {
      for (let c = 0; c < 6; c++) this.bursts.add(goneAt, 'sparkle', this.world(corner.clone().addScaledVector(L, -(c + 0.5) * s).setY(s)), 0.6);
    });
    this.sign('lines', 'DOUBLE!', 1.9, 0.6, t, clearAt + 0.1, clearAt + 1.6, spot.clone().setY(7 * s + 0.5).addScaledVector(this.cam, 0.3), { bg: '#20223a', fg: '#ffd52a', border: '#ffd52a' });
    const tall = Math.max(0.3, b.box.max.y);
    const last = this.pieces3[3];
    if (this.survives) {
      // Up onto the yellow square as the last piece comes down where they stood; the lines clear under them, and
      // down they drop onto the cobbles.
      const up = span(t, 1.9, 2.2);
      const perch = spot.clone().addScaledVector(L, 2 * s);
      if (up > 0) {
        this.at.lerpVectors(spot, perch.clone().setY(2 * s), up);
        this.at.y += Math.sin(up * Math.PI) * 0.5;
      }
      if (t > goneAt) this.at.copy(perch).setY(2 * s * (1 - Math.min(1, ((t - goneAt) / 0.3) ** 2)));
      this.sfx('thud', goneAt + 0.3, t);
      return { anim: t > goneAt + 0.4 ? 'cheer' : t > 1.2 ? 'cry' : 'idle', visible: true };
    }
    // Squashed down to one cell high by the last piece, part of the line; and cleared away with it.
    if (last) {
      const bottom = last.group.position.y - corner.y + s;
      const squash = Math.min(1, bottom / tall);
      this.stretch.set(1 + (1 - squash) * 0.4, Math.max(0.2, squash), 1 + (1 - squash) * 0.4);
    }
    if (blink) return { anim: 'cry', visible: false };
    this.setExtraVec('soulFrom', spot.clone().setY(0.2));
    return { anim: t > 1.0 ? 'cry' : 'idle', visible: t < goneAt };
  }

  // ---------------------------------------------------------------- the slingshot

  private sling(t: number): Shown {
    const b = this.size();
    const P = this.P;
    // The slingshot down on the left, the tower of planks off to the right.
    const A = this.V(2.4, 2.4, 0);
    const T = this.V(1.4, -2.6, 0);
    const dir = T.clone().sub(A).setY(0).normalize();
    const tall = b.box.max.y;
    if (!this.fork) {
      this.fork = slingshot();
      this.fork.group.position.copy(A);
      this.fork.group.quaternion.copy(this.face(dir));
      this.props.add(new THREE.Group().add(this.fork.group));
      // Two storeys of uprights and planks, and a stone on top.
      const side = new THREE.Vector3().crossVectors(UP, dir).normalize();
      const add = (o: THREE.Object3D, at: THREE.Vector3, up: boolean, rest: number, i: number) => {
        o.position.copy(at);
        o.quaternion.copy(this.face(dir));
        this.keep(o);
        const away = at.clone().sub(T).setY(0).normalize().add(dir).normalize();
        this.tower.push({ group: o as THREE.Group, home: at.clone(), v: away.multiplyScalar(1.2 + hash(i, 1) * 1.6).setY(1 + hash(i, 2) * 2), spin: new THREE.Vector3(hash(i, 3) - 0.5, hash(i, 4) - 0.5, 0).multiplyScalar(6), rest, up });
      };
      let i = 0;
      for (let f = 0; f < 2; f++) {
        const y0 = f * 1.35;
        for (const sx of [-0.55, 0.55]) add(slab(0.18, 1.2, 0.18), T.clone().addScaledVector(side, sx).setY(y0 + 0.6), true, 0.09, i++);
        add(slab(1.5, 0.15, 0.4), T.clone().setY(y0 + 1.27), false, 0.075, i++);
      }
      add(slab(0.5, 0.5, 0.5, true), T.clone().setY(2.95), false, 0.25, i++);
    }
    const S = this.fork;
    this.popProps(t, [this.world(A.clone().setY(1.2))]);
    this.frame.look = this.world(A.clone().lerp(T, 0.5).setY(1.4));
    this.frame.radius = 4.0;
    // Into the pouch, pulled right back, let go, and up over in an arc into the tower.
    const pouchRest = new THREE.Vector3(0, 1.75, 0);
    const pouchBack = new THREE.Vector3(0, 1.35, -1.25);
    const pull = span(t, 0.9, 1.8);
    const fire = 2.1;
    const flyFor = 0.75;
    let pouch = pouchRest.clone().lerp(pouchBack, pull);
    if (t > fire) {
      const u = t - fire;
      pouch = pouchRest.clone().addScaledVector(Z, Math.exp(-u * 6) * Math.sin(u * 30) * 0.3);
    }
    const toWorld = (v: THREE.Vector3) => v.clone().applyQuaternion(S.group.quaternion).add(S.group.position);
    S.pouch.position.copy(pouch);
    S.forks.forEach((f, i) => stretchCord(S.bands[i], f, pouch));
    const k = this.hop(t, 0.3, new THREE.Vector3(0, P, 0), toWorld(pouchRest).setY(toWorld(pouchRest).y - 0.1));
    const seat = toWorld(pouch).setY(toWorld(pouch).y - 0.12);
    this.at.copy(k > 0.5 ? seat : new THREE.Vector3(0, P, 0));
    this.turn.copy(this.face(dir.clone().lerp(this.cam, 0.5).normalize()));
    this.sfx('strain', 1.0, t);
    this.sfx('twang', fire, t);
    this.sfx('whoosh', fire + 0.05, t);
    const hitAt = fire + flyFor;
    const impact = T.clone().addScaledVector(dir, -0.4).setY(1.3);
    let anim: Anim = t > 0.9 ? 'cry' : 'idle';
    if (t > fire) {
      const u = Math.min(1, (t - fire) / flyFor);
      const from = toWorld(pouchBack);
      this.at.lerpVectors(from, impact, u);
      this.at.y += Math.sin(u * Math.PI) * 2.2;
      this.turn.copy(this.face(dir)).multiply(about(X, u * Math.PI * 4));
      anim = 'cry';
    }
    this.sfx('crash', hitAt, t);
    this.once('crash', hitAt, t, () => this.bursts.add(hitAt, 'dust', this.world(impact), 1.2));
    const after = t - hitAt;
    if (this.survives) {
      // The tower wobbles... and holds; off they bounce, and land on their feet.
      const wob = after > 0 ? Math.exp(-after * 3) * Math.sin(after * 12) * 0.08 : 0;
      for (const blk of this.tower) {
        blk.group.position.copy(blk.home.clone().sub(T).applyAxisAngle(new THREE.Vector3().crossVectors(UP, dir).normalize(), wob).add(T));
      }
      this.sfx('boing', hitAt, t);
      if (after > 0) {
        const u = Math.min(1, after / 0.7);
        const land = T.clone().addScaledVector(dir, -2.0);
        this.at.lerpVectors(impact, land, u);
        this.at.y = THREE.MathUtils.lerp(impact.y, 0, u) + Math.sin(u * Math.PI) * 1.0;
        this.turn.copy(this.face(this.cam)).multiply(about(X, -(1 - u) * Math.PI * 2));
        anim = u >= 1 ? (after > 0.9 ? 'cheer' : 'idle') : 'cry';
      }
      return { anim, visible: true };
    }
    // Down it all comes, them underneath, planks everywhere.
    for (const blk of this.tower) {
      if (after <= 0) {
        blk.group.position.copy(blk.home);
        continue;
      }
      const g = 9.8;
      const land = (blk.v.y + Math.sqrt(blk.v.y * blk.v.y + 2 * g * (blk.home.y - blk.rest))) / g;
      const u = Math.min(after, land);
      blk.group.position.copy(blk.home).addScaledVector(blk.v, u).setY(Math.max(blk.rest, blk.home.y + blk.v.y * u - 0.5 * g * u * u));
      blk.group.quaternion.copy(this.face(dir));
      if (blk.up) blk.group.rotateX((Math.PI / 2) * Math.min(1, u / land) * (blk.spin.x > 0 ? 1 : -1));
      else blk.group.rotateY(blk.spin.y * u * 0.3);
    }
    this.sfx('clatter', hitAt + 0.3, t);
    if (after > 0) {
      const lieAt = T.clone().addScaledVector(dir, -0.2);
      const fall = Math.min(1, after / 0.5);
      const lie = basis(Y, Z, dir, UP);
      this.stretch.set(1, 1, 1);
      const p = impact.clone().lerp(lieAt.clone().setY(0.05), fall);
      this.put(fall >= 1 ? lie : lie.clone().slerp(this.turn, 1 - fall), p, new THREE.Vector3(0, 0, this.thick().back));
      this.dizzyAt(t, after > 0.7 && t < this.soulAt ? lieAt.clone().addScaledVector(dir, tall * 0.8).setY(0.5) : null);
      anim = 'idle';
    }
    this.setExtraVec('soulFrom', T.clone().addScaledVector(dir, tall * 0.3).setY(0.1));
    return { anim, visible: true };
  }

  // ---------------------------------------------------------------- the TV sting

  private sting(t: number): Shown {
    const P = this.P;
    // A little kitchen set down on the cobbles, open to the camera, lamps on stands.
    const K = this.V(2.8, 0.2, 0);
    const kq = this.face(this.cam);
    const kp = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z).applyQuaternion(kq).add(K);
    const kd = (x: number, z: number) => new THREE.Vector3(x, 0, z).applyQuaternion(kq).normalize();
    if (!this.set) {
      this.set = kitchen();
      this.set.group.position.copy(K);
      this.set.group.quaternion.copy(kq);
      this.props.add(new THREE.Group().add(this.set.group));
      this.host = person({ coat: '#8a5a3e', trousers: '#4a4a52', shirt: '#cfe0f4', tie: '#2a4a8a', hair: '#9a9aa4' });
      // A folder under his arm.
      const f = new Builder();
      f.add(G.box(), '#e8d8a8', { pos: [0, 0, 0.05], scale: [0.04, 0.32, 0.24] });
      this.host.hands[0].add(f.mesh(matte()));
      this.host.group.visible = false;
      this.keep(this.host.group);
      for (let i = 0; i < 2; i++) {
        const c = person({ coat: '#22386a', trousers: '#22386a', shirt: '#c4d4ea', tie: '#14204a', cap: '#14204a', badge: true });
        c.group.visible = false;
        this.keep(c.group);
        this.cops.push(c);
      }
    }
    const Kt = this.set;
    const Hm = this.host!;
    this.popProps(t, [this.world(K.clone().setY(1.2))]);
    this.frame.look = this.world(kp(0.2, 1.1, 0.9));
    this.frame.radius = 3.4;
    const counter = kp(0.7, 0, 1.0);
    const k = this.hop(t, 0.3, new THREE.Vector3(0, P, 0), counter);
    this.at.copy(k > 0.5 ? counter : new THREE.Vector3(0, P, 0));
    this.turn.copy(this.face(this.cam));
    // In he walks, folder under his arm, and stops by the table.
    const hostAt = kp(-1.35, 0, 1.45);
    const hostFrom = kp(-3.6, 0, 1.9);
    const walkIn = span(t, 0.5, 1.7);
    Hm.group.visible = t > 0.45;
    Hm.group.position.lerpVectors(hostFrom, hostAt, walkIn);
    Hm.group.quaternion.copy(this.face(walkIn < 1 ? hostAt.clone().sub(hostFrom).normalize() : kd(0.6, 0.4)));
    this.stride(Hm, t, walkIn > 0 && walkIn < 1);
    Hm.arms[0].rotation.set(-0.3, 0, 0.35);
    // "Why don't you take a seat over there?", pointing at the stool.
    const ask = [1.9, 3.7] as const;
    const point = span(t, ask[0], ask[0] + 0.3) * (1 - span(t, ask[1] - 0.6, ask[1] - 0.3));
    if (point > 0) {
      Hm.group.updateMatrixWorld(true);
      const want = this.world(kp(Kt.stool.x, 0.7, Kt.stool.z));
      const was = Hm.arms[1].quaternion.clone();
      reachFor(Hm.arms[1], want);
      Hm.arms[1].quaternion.copy(was.slerp(Hm.arms[1].quaternion, point));
    }
    const over = Hm.group.position.clone().setY(2.55).addScaledVector(this.left, -0.3);
    this.say('seat', ['Why don’t you take', 'a seat over there?'], 2.4, 0.8, t, ask[0], ask[1], over);
    const look = [4.0, 5.6] as const;
    this.say('looks', ['You see how this', 'looks, right?'], 2.2, 0.8, t, look[0], look[1], over);
    this.sfx('hmm', ask[0], t);
    this.sfx('hmm', look[0], t);
    Hm.head.rotation.y = t > look[0] && t < look[1] ? Math.sin((t - look[0]) * 5) * 0.2 : 0;
    // Over to the stool, and a sit, a little sheepish.
    const stool = kp(Kt.stool.x, Kt.seat - 0.08, Kt.stool.z);
    const go = span(t, 2.6, 3.2);
    let anim: Anim = t > 2.0 && t < 2.6 ? 'cry' : 'idle';
    if (go > 0) {
      this.at.lerpVectors(counter, stool, go);
      this.at.y += Math.sin(go * Math.PI) * 0.2;
      if (go >= 1) anim = 'sit';
      this.turn.copy(this.face(kd(-0.5, 1)));
    }
    // The police burst in, the condemned leaps up, and dives for the window.
    const burst = 5.8;
    this.sfx('siren', burst - 0.2, t);
    this.sfx('slam', burst, t);
    this.cops.forEach((c, i) => {
      const to = kp(2.0 + i * 0.5, 0, 0.8 + i * 0.7);
      const from = kp(4.6 + i * 0.4, 0, 1.0 + i * 0.6);
      const run = span(t, burst + i * 0.1, burst + 0.5 + i * 0.1);
      c.group.visible = t > burst - 0.05 + i * 0.1;
      c.group.position.lerpVectors(from, to, run);
      c.group.quaternion.copy(this.face(run < 1 ? to.clone().sub(from).normalize() : kd(-1, -0.2)));
      this.stride(c, t, run > 0 && run < 1, 12, 0.6);
      if (run >= 1) {
        // "Freeze!": both hands up and out.
        c.arms[0].rotation.set(-1.4, 0, 0.3);
        c.arms[1].rotation.set(-1.4, 0, -0.3);
      }
    });
    if (t > burst) Hm.group.quaternion.copy(this.face(kd(0.8, -0.2)));
    const leap = burst + 0.35;
    const win = kp(Kt.window.x, Kt.window.y, 0);
    const outside = kp(Kt.window.x, 0.15, -1.4);
    this.sfx('crash', leap + 0.35, t);
    this.once('glass', leap + 0.35, t, () => this.bursts.add(leap + 0.35, 'sparkle', this.world(win), 1.2));
    Kt.glass.visible = t < leap + 0.35;
    if (t > burst) {
      anim = 'cry';
      this.at.copy(stool).setY(stool.y + span(t, burst, burst + 0.15) * 0.25);
      this.turn.copy(this.face(kd(-0.5, 1)));
    }
    if (t > leap) {
      // Head first, flat out like a diver, through the glass.
      const u = span(t, leap, leap + 0.45);
      const q = this.face(kd(0, -1)).multiply(about(X, Math.PI / 2 * Math.min(1, u * 1.5)));
      const mid = this.mid();
      const p = stool.clone().setY(stool.y + mid.y).lerp(win, u);
      p.y += Math.sin(u * Math.PI) * 0.3;
      if (this.survives && t > leap + 0.45) {
        // Stuck in the frame, back legs kicking... and out with a pop.
        const pop = 7.2;
        const wig = t < pop ? Math.sin(t * 24) * 0.04 : 0;
        p.copy(win).addScaledVector(kd(1, 0), wig);
        this.stretch.set(1 - (t < pop ? 0.2 : 0), 1, 1);
        if (t > pop) p.copy(win).add(kd(0, -1).multiplyScalar(0.6));
        this.sfx('strain', leap + 0.6, t);
        this.sfx('pop', pop, t);
        if (t > pop + 0.15) {
          // Out round the side of the set at a run, and a cheer from a safe distance.
          const run = span(t, pop + 0.15, pop + 1.0);
          const a0 = kp(Kt.window.x, 0, -0.9);
          const a1 = kp(-3.4, 0, -0.6);
          const a2 = kp(-3.6, 0, 2.2);
          this.at.copy(run < 0.5 ? a0.clone().lerp(a1, run * 2) : a1.clone().lerp(a2, (run - 0.5) * 2));
          this.turn.copy(this.face(run < 1 ? (run < 0.5 ? a1.clone().sub(a0) : a2.clone().sub(a1)).normalize() : this.cam));
          this.stretch.set(1, 1, 1);
          return { anim: run >= 1 ? 'cheer' : 'run', visible: true };
        }
      }
      this.put(q, p, mid);
      anim = 'cry';
    }
    if (this.survives) return { anim, visible: true };
    // Gone, out of sight behind the wall... SPLAT, and a cloud of dust.
    const splat = leap + 0.75;
    this.sfx('splat', splat, t);
    this.once('splat', splat, t, () => this.bursts.add(splat, 'dust', this.world(outside.clone().setY(0.4)), 1.6));
    this.sign('splat', 'SPLAT!', 1.7, 0.6, t, splat, splat + 1.2, kp(Kt.window.x, 2.95, -0.2));
    this.setExtraVec('soulFrom', outside);
    return { anim, visible: t < leap + 0.6 };
  }

  // ---------------------------------------------------------------- the titan's snap

  private snap(t: number): Shown {
    const b = this.size();
    const P = this.P;
    const L = this.left.clone();
    // He stomps in on the cobbles to the right of the gallows, turns to them, and raises the gauntlet.
    const at = this.V(0.9, -2.9, 0);
    const from = at.clone().addScaledVector(L, -5);
    if (!this.giant) {
      this.giant = titan();
      this.giant.group.scale.setScalar(0.9);
      this.giant.group.visible = false;
      this.keep(this.giant.group);
      this.disposers.push(this.giant.dispose);
    }
    const T = this.giant;
    const centre = new THREE.Vector3(0, P, 0);
    this.frame.look = this.world(at.clone().lerp(centre, 0.55).setY(1.5));
    this.frame.radius = 3.5;
    const walkIn = span(t, 0.3, 1.7);
    const leave = this.survives ? span(t, 4.8, 6.0) : span(t, 5.6, 7.0);
    T.group.visible = t > 0.3 && leave < 0.99;
    T.group.position.lerpVectors(from, at, walkIn).lerp(from, leave);
    const walking = (walkIn > 0 && walkIn < 1) || (leave > 0 && leave < 1);
    const toThem = centre.clone().sub(at).setY(0).normalize().lerp(this.cam, 0.35).normalize();
    T.group.quaternion.copy(leave > 0 ? this.face(L.clone().negate()) : walkIn < 0.85 ? this.face(L) : this.face(L).slerp(this.face(toThem), span(t, 1.5, 1.9)));
    const ph = t * 6;
    T.legs[0].rotation.x = walking ? Math.sin(ph) * 0.4 : 0;
    T.legs[1].rotation.x = walking ? -Math.sin(ph) * 0.4 : 0;
    T.body.position.y = 1.1 + (walking ? Math.abs(Math.sin(ph)) * 0.05 : 0);
    if (walking) for (let n = 0; n < 6; n++) this.sfx('stomp', 0.4 + (n * Math.PI) / 6, t);
    if (walking) this.frame.shake = 0.08;
    // Up goes the gauntlet, the stones glowing brighter; then the snap.
    const snapAt = 2.8;
    const raise = span(t, 1.9, 2.4) * (1 - span(t, this.survives ? 4.4 : 5.2, this.survives ? 4.8 : 5.6));
    const glove = T.arms[1];
    const shake = this.survives && t > 3.2 && t < 4.3 ? Math.sin(t * 30) * 0.25 : 0;
    glove.rotation.set(-raise * 2.1 + shake, 0, -raise * 0.3 + shake * 0.5);
    T.arms[0].rotation.set(walking ? -Math.sin(ph) * 0.3 : 0, 0, 0.1);
    T.stones.emissiveIntensity = 0.15 + raise * (0.6 + 0.3 * Math.sin(t * 9)) * (this.survives && t > snapAt ? 0.3 : 1);
    T.head.rotation.x = this.survives && t > snapAt ? span(t, snapAt + 0.2, snapAt + 0.5) * 0.35 * (1 - span(t, 4.2, 4.5)) : 0;
    this.sfx('charge', 2.0, t);
    T.group.updateMatrixWorld(true);
    const fistAt = this.group.worldToLocal(T.fist.getWorldPosition(new THREE.Vector3()));
    this.turn.copy(this.face(this.cam).slerp(this.face(at.clone().sub(centre).setY(0).normalize()), span(t, 1.0, 1.4) * 0.7));
    if (this.survives) {
      // ...snap? A fizzle and a wisp of smoke, a good shake of the glove, and off he goes, grumbling.
      this.sfx('fizzle', snapAt, t);
      this.once('pfft', snapAt, t, () => this.bursts.add(snapAt, 'smoke', this.world(fistAt), 0.5));
      this.sfx('wahwah', 3.3, t);
      this.sfx('hmph', 4.5, t);
      this.sign('fizzle', '\u2026snap?', 1.6, 0.6, t, snapAt + 0.15, 4.6, at.clone().setY(3.6), { bg: '#fffaf0', fg: '#7a4aa8', border: '#7a4aa8' });
      return { anim: t > 4.2 ? 'cheer' : t > 1.2 ? 'cry' : 'idle', visible: true };
    }
    this.sfx('snap', snapAt, t);
    this.once('snap', snapAt, t, () => {
      this.bursts.add(snapAt, 'flash', this.world(fistAt), 0.9);
      this.bursts.add(snapAt + 0.02, 'sparkle', this.world(fistAt), 1.0);
    });
    if (t > snapAt && t < snapAt + 0.3) this.frame.shake = 0.3;
    // A beat. A look down at their paws. Grey as ash; and away they drift on the wind, from the edge in.
    const look = span(t, 3.1, 3.4);
    this.turn.multiply(about(X, look * 0.35));
    this.tint('#a8a098', span(t, 3.4, 3.9) * 0.8);
    const crumble = [4.0, 5.7] as const;
    const w = Math.max(0.3, Math.max(-b.box.min.x, b.box.max.x, -b.box.min.z, b.box.max.z) + 0.1);
    if (t >= crumble[0]) {
      this.once('ash', crumble[0], t, () => {
        if (!this.who) return;
        const parts = bakeAnimal(this.who);
        const toLocal = this.group.matrixWorld.clone().invert();
        for (const p of parts) p.geometry.applyMatrix4(toLocal);
        this.dust = new BakedPiece(parts, centre, { keep: L.clone().negate() });
        this.dust.soot(0.8, '#a8a098');
        freeBake(parts);
        this.group.add(this.dust.group);
        this.pieces.push(this.dust);
      });
      // (The cut goes from the left-hand edge across to the right; what's kept is to its right.)
      const c = THREE.MathUtils.lerp(w, -w, span(t, crumble[0], crumble[1]));
      this.dust?.slide(-c);
      for (let n = 0; n < 16; n++) {
        const when = crumble[0] + (n / 16) * (crumble[1] - crumble[0]);
        this.once(`ash${n}`, when, t, () => {
          const cc = THREE.MathUtils.lerp(w, -w, span(when, crumble[0], crumble[1]));
          const spot = centre.clone().addScaledVector(L, cc).setY(P + b.box.max.y * (0.2 + hash(n, 5) * 0.7));
          this.bursts.add(when, 'dust', this.world(spot), 0.45, L.clone().multiplyScalar(0.9).add(new THREE.Vector3(0, 0.25, 0)));
        });
      }
      this.sfx('hiss', crumble[0], t);
      this.setExtraVec('soulFrom', centre.clone());
      return { anim: 'idle', visible: false };
    }
    return { anim: t > 3.4 ? 'cry' : t > 1.2 ? 'cry' : 'idle', visible: true };
  }

  override dispose() {
    for (const s of this.bubbles.values()) s.dispose();
    this.bubbles.clear();
    super.dispose();
  }
}

// (Kept here so the word signs' kit loads with these shows.)
void wordSign;
