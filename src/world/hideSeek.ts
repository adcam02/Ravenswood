/**
 * Hide and seek in the 3D world (the round itself is run by the host, game/hideSeek.ts): hiders who've turned into
 * a barrel, a bush or a crate drawn as one, the seekers taken to the square and held there blindfolded while the rest
 * hide, hiders' names kept off seekers' screens (and the map), taunts heard from where they went off, and a cheer
 * for the winners at the end.
 */
import * as THREE from 'three';
import { HIDE } from '../game/hideRules';
import { hideSound } from '../lib/audio';
import type { HidePropKind, HideRound } from '../state/types';
import type { AvatarView } from './avatar';
import { MEETING_CENTRE } from './town/layout';
import type { Anim, ZoneId } from './types';

/** What the rest of the page reads each frame: who's hidden from us (the map leaves them off), and whether we can tag. */
export const hideLocal = {
  concealed: new Set<string>(),
  /** A hider is in reach (a seeker's tag would land, as far as this browser can tell). */
  canTag: false,
};

interface Hooks {
  place: (zone: ZoneId, x: number, z: number, ry: number) => void;
  emote: (anim: Anim) => void;
  stop: () => void;
  ground: (zone: ZoneId, x: number, z: number) => number;
}

const wood = new THREE.MeshStandardMaterial({ color: 0x9a6a3c, roughness: 0.85 });
const band = new THREE.MeshStandardMaterial({ color: 0x4b4a52, roughness: 0.5, metalness: 0.4 });
const plank = new THREE.MeshStandardMaterial({ color: 0xc69a5c, roughness: 0.9 });
const leaf = new THREE.MeshStandardMaterial({ color: 0x4f8f3a, roughness: 0.95, flatShading: true });
const leafDark = new THREE.MeshStandardMaterial({ color: 0x3c7430, roughness: 0.95, flatShading: true });

function barrel(): THREE.Object3D {
  const g = new THREE.Group();
  // A bellied stave barrel with two iron hoops.
  const pts = [0, 0.25, 0.5, 0.75, 1].map((k) => new THREE.Vector2(0.4 + Math.sin(k * Math.PI) * 0.08, k * 0.95));
  const body = new THREE.Mesh(new THREE.LatheGeometry(pts, 14), wood);
  const lid = new THREE.Mesh(new THREE.CircleGeometry(0.4, 14), plank);
  lid.rotation.x = -Math.PI / 2;
  lid.position.y = 0.95;
  g.add(body, lid);
  for (const y of [0.2, 0.75]) {
    const hoop = new THREE.Mesh(new THREE.TorusGeometry(0.465, 0.025, 6, 18), band);
    hoop.rotation.x = Math.PI / 2;
    hoop.position.y = y;
    g.add(hoop);
  }
  return g;
}

function bush(): THREE.Object3D {
  const g = new THREE.Group();
  const balls: [number, number, number, number][] = [
    [0, 0.42, 0, 0.5],
    [0.38, 0.32, 0.1, 0.36],
    [-0.36, 0.3, 0.05, 0.38],
    [0.05, 0.3, 0.36, 0.34],
    [-0.08, 0.72, -0.08, 0.32],
  ];
  balls.forEach(([x, y, z, r], i) => {
    const m = new THREE.Mesh(new THREE.IcosahedronGeometry(r, 1), i % 2 ? leafDark : leaf);
    m.position.set(x, y, z);
    g.add(m);
  });
  return g;
}

function crate(): THREE.Object3D {
  const g = new THREE.Group();
  const s = 0.82;
  const box = new THREE.Mesh(new THREE.BoxGeometry(s, s, s), plank);
  box.position.y = s / 2;
  g.add(box);
  // The darker frame round each face, and a brace across the front and back.
  const edge = (w: number, h: number, d: number, x: number, y: number, z: number, rz = 0) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), wood);
    m.position.set(x, y, z);
    m.rotation.z = rz;
    g.add(m);
  };
  const e = 0.09;
  for (const z of [-1, 1]) {
    edge(s + 0.02, e, e, 0, e / 2, (z * s) / 2);
    edge(s + 0.02, e, e, 0, s - e / 2, (z * s) / 2);
    edge(s * 1.25, e, 0.04, 0, s / 2, (z * (s + 0.02)) / 2, Math.PI / 4);
  }
  for (const x of [-1, 1]) for (const z of [-1, 1]) edge(e, s, e, (x * s) / 2, s / 2, (z * s) / 2);
  return g;
}

const BUILD: Record<HidePropKind, () => THREE.Object3D> = { barrel, bush, crate };

/** A little hash of a seat id: which noise a hider makes. */
const voiceOf = (seat: string) => ([...seat].reduce((a, c) => a + c.charCodeAt(0), 0) % 2 ? 'quack' : 'squeak');

export class HideShow {
  private props = new Map<string, { kind: HidePropKind; obj: THREE.Object3D; bounce: number }>();
  private heard = new Set<string>();
  private round = '';
  private stage = '';
  private feedSeen = 0;
  private cheerAt = 0;
  /** We're held where we are: a seeker blindfolded while the rest hide, or a hider who's turned into a prop. */
  held = false;

  constructor(
    private scene: THREE.Scene,
    private hooks: Hooks,
  ) {}

  update(dt: number, t: number, r: HideRound | null | undefined, mode: 'st' | 'player' | 'preview', mySeat: string | null, local: { zone: ZoneId; x: number; z: number }, me: AvatarView | null, others: Map<string, AvatarView>) {
    hideLocal.concealed.clear();
    hideLocal.canTag = false;
    this.held = false;
    if (!r) {
      this.clearProps();
      this.round = this.stage = '';
      return;
    }
    const now = Date.now();
    const mine = mySeat ? r.players.find((p) => p.seat === mySeat) : undefined;
    const playing = r.stage === 'hiding' || r.stage === 'seeking';
    this.held = Boolean(playing && mine && ((mine.first && mine.role === 'seeker' && r.stage === 'hiding') || (mine.role === 'hider' && mine.prop)));

    // A new stage: the seekers to the square, a sound for each, a cheer for the winners.
    if (r.id !== this.round || r.stage !== this.stage) {
      const fresh = r.id !== this.round;
      this.round = r.id;
      this.stage = r.stage;
      if (fresh) {
        this.heard.clear();
        this.feedSeen = r.feed.length;
      }
      if (r.stage === 'hiding' && mine) {
        hideSound('hide');
        if (mine.first && mine.role === 'seeker') {
          const firsts = r.players.filter((p) => p.first);
          const i = firsts.findIndex((p) => p.seat === mine.seat);
          const off = firsts.length > 1 ? (i ? 1.4 : -1.4) : 0;
          this.hooks.stop();
          this.hooks.place('town', MEETING_CENTRE.x + off, MEETING_CENTRE.z + 2.6, Math.PI);
        }
      } else if (r.stage === 'seeking' && mine) hideSound('seek');
      else if (r.stage === 'over' && r.result && (r.result.why === 'time' || r.result.why === 'found')) {
        hideSound('end', mine ? 1 : 0.5);
        const res = r.result;
        if (mySeat && (res.survivors.includes(mySeat) || res.last === mySeat || res.best === mySeat)) {
          this.hooks.emote('cheer');
          this.cheerAt = t + 2.4;
        }
      }
    }
    if (this.cheerAt && t >= this.cheerAt) {
      this.cheerAt = 0;
      if (r.stage === 'over') this.hooks.emote('dance');
    }

    // Someone found: a boing (louder when it's us, or ours).
    if (r.feed.length !== this.feedSeen) {
      for (const f of r.feed.slice(this.feedSeen)) if (now - f.at < 4000) hideSound('found', f.who === mySeat || f.by === mySeat ? 1 : 0.35);
      this.feedSeen = r.feed.length;
    }

    // Who's hidden from us: hiders, from anyone but another hider (and the Storyteller, who sees all).
    const seeing = mode === 'st' || mine?.role === 'hider';
    if (playing && !seeing) for (const p of r.players) if (p.role === 'hider') hideLocal.concealed.add(p.seat);
    for (const seat of hideLocal.concealed) others.get(seat)?.setTagShown(false);

    // Props: drawn where the hider turned, with their animal (and its pet and name) out of sight.
    const want = new Set<string>();
    for (const p of r.players) {
      if (!p.prop || p.role !== 'hider' || !playing || p.prop.zone !== local.zone) continue;
      want.add(p.seat);
      let prop = this.props.get(p.seat);
      if (!prop || prop.kind !== p.prop.kind) {
        if (prop) this.scene.remove(prop.obj);
        prop = { kind: p.prop.kind, obj: BUILD[p.prop.kind](), bounce: 0 };
        prop.obj.traverse((o) => {
          if ((o as THREE.Mesh).isMesh) o.castShadow = o.receiveShadow = true;
        });
        this.scene.add(prop.obj);
        this.props.set(p.seat, prop);
      }
      prop.obj.position.set(p.prop.x, this.hooks.ground(p.prop.zone, p.prop.x, p.prop.z), p.prop.z);
      prop.obj.rotation.y = p.prop.ry;
      // A squeak makes it hop.
      prop.bounce = Math.max(0, prop.bounce - dt);
      const k = prop.bounce > 0 ? Math.sin((0.6 - prop.bounce) * 22) * prop.bounce * 0.25 : 0;
      prop.obj.scale.set(1 - k * 0.5, 1 + k, 1 - k * 0.5);
      const av = p.seat === mySeat ? me : others.get(p.seat);
      if (av) {
        av.rig.root.visible = false;
        av.setTagShown(false);
        av.setPetAway(true);
      }
    }
    for (const [seat, prop] of this.props) {
      if (want.has(seat)) continue;
      this.scene.remove(prop.obj);
      this.props.delete(seat);
    }

    // Taunts: heard from where they went off, fading with distance (a hop for a prop, a word over an animal).
    for (const tn of r.taunts) {
      if (this.heard.has(tn.id)) continue;
      this.heard.add(tn.id);
      if (now - tn.at > 3000) continue;
      const d = tn.zone === local.zone ? Math.hypot(tn.x - local.x, tn.z - local.z) : Infinity;
      const vol = tn.seat === mySeat ? 0.8 : Math.max(0, 1 - d / HIDE.tauntR) ** 1.4;
      const noise = voiceOf(tn.seat);
      hideSound(noise, vol);
      const prop = this.props.get(tn.seat);
      if (prop) prop.bounce = 0.6;
      else if (vol > 0) others.get(tn.seat)?.bubble(noise === 'quack' ? 'Quack!' : 'Squeak!', 1500);
    }

    // Whether a tag would land: a hider within reach, in the same place.
    if (r.stage === 'seeking' && mine?.role === 'seeker') {
      for (const p of r.players) {
        if (p.role !== 'hider') continue;
        const at = p.prop ?? (others.get(p.seat)?.shown ? { zone: local.zone, x: others.get(p.seat)!.x, z: others.get(p.seat)!.z } : null);
        if (at && at.zone === local.zone && Math.hypot(at.x - local.x, at.z - local.z) <= HIDE.tagR) hideLocal.canTag = true;
      }
    }
  }

  private clearProps() {
    for (const prop of this.props.values()) this.scene.remove(prop.obj);
    this.props.clear();
  }

  dispose() {
    this.clearProps();
  }
}
