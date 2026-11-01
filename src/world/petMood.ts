import * as THREE from 'three';
import { graveSpot } from './town/layout';

/**
 * Pets that feel for their owner, worked out from the game as everyone sees it (no messages of their own), and
 * drawn on any pet's root, so every pet does it without knowing:
 *   hide   their owner is up for a vote: it shrinks behind them, trembling, with a bead of sweat, until the vote ends.
 *   mourn  their owner has died: it sits by their grave in the churchyard, drooping, now and then a tear or a sigh,
 *          and looks up when anyone wanders past.
 *   cheer  their owner's team has won: it hops and twirls in a shower of sparkles.
 */
export type PetMood =
  | { kind: 'hide' }
  | { kind: 'cheer' }
  /** `x`, `z`: where it sits; `ry`: facing the stone; `look`: someone passing to look up at; `shown`: we're in town to see it. */
  | { kind: 'mourn'; x: number; z: number; ry: number; look: { x: number; z: number } | null; shown: boolean };

interface MoodSeat {
  id: string;
  dead: boolean;
  evil: boolean;
}
interface MoodView {
  seats: MoodSeat[];
  nomination: { nomineeId: string; status: string } | null;
  ended: { winner: 'good' | 'evil' } | null;
}

/** Where a mourning pet sits: beside the mound in front of the `i`th grave, turned toward the stone. */
export function mournSpot(i: number) {
  const g = graveSpot(i);
  const x = g.x + 0.52;
  const z = g.z + 0.62;
  return { x, z, ry: Math.atan2(g.x - x, g.z - z) };
}

/**
 * Each owner's pet's mood. `here` is everyone drawn in town where we are (ourselves too), so a mourning pet can look
 * up at whoever walks past its grave, and `inTown` whether we're in town to see the churchyard at all.
 */
export function petMoods(v: MoodView, here: { x: number; z: number }[], inTown: boolean): Map<string, PetMood> {
  const out = new Map<string, PetMood>();
  const nom = v.nomination;
  if (nom && nom.status !== 'done') out.set(nom.nomineeId, { kind: 'hide' });
  // (The graves are the dead in seat order, as town/index.ts lays them out.)
  v.seats.filter((s) => s.dead).forEach((s, i) => {
    const at = mournSpot(i);
    let look: { x: number; z: number } | null = null;
    let best = 2.6;
    for (const p of here) {
      const d = Math.hypot(p.x - at.x, p.z - at.z);
      if (d < best && d > 0.3) {
        best = d;
        look = p;
      }
    }
    out.set(s.id, { kind: 'mourn', ...at, look, shown: inTown });
  });
  // The game's over: winners' pets celebrate (the dead's too, back from the churchyard to join in).
  if (v.ended) for (const s of v.seats) if (s.evil === (v.ended.winner === 'evil')) out.set(s.id, { kind: 'cheer' });
  return out;
}

// ---------------------------------------------------------------- drawing it

const DROP_GEO = (() => {
  // A teardrop: a ball with a point on top.
  const ball = new THREE.SphereGeometry(1, 10, 8);
  const tip = new THREE.ConeGeometry(0.72, 1.3, 10, 1, true);
  tip.translate(0, 0.95, 0);
  const g = new THREE.BufferGeometry();
  const parts = [ball.toNonIndexed(), tip.toNonIndexed()];
  let n = 0;
  for (const p of parts) n += p.getAttribute('position').count;
  const pos = new Float32Array(n * 3);
  let off = 0;
  for (const p of parts) {
    pos.set(p.getAttribute('position').array as Float32Array, off);
    off += p.getAttribute('position').count * 3;
  }
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.computeVertexNormals();
  return g;
})();
const DROP_MAT = new THREE.MeshStandardMaterial({ color: '#8fd3ff', emissive: '#2f7fc4', emissiveIntensity: 0.35, roughness: 0.15, transparent: true, opacity: 0.9 });
const SPARK_GEO = new THREE.OctahedronGeometry(1, 0);
const SPARK_COLOURS = ['#ffd84a', '#ff7eb6', '#7ee0ff', '#a6f07a', '#ffb347'].map(
  (c) => new THREE.MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: 0.6, roughness: 0.4 }),
);
const SIGH_MAT = new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.7, depthWrite: false });
const SIGH_GEO = new THREE.SphereGeometry(1, 8, 6);

/** The bits that float round a pet with feelings (a sweat drop, tears, sighs, sparkles), and its pose. */
export class PetFeel {
  readonly group = new THREE.Group();
  private sweat = new THREE.Mesh(DROP_GEO, DROP_MAT);
  private tear = new THREE.Mesh(DROP_GEO, DROP_MAT);
  private sighs: THREE.Mesh[] = [];
  private sparks: THREE.Mesh[] = [];
  /** How far into each mood it is (0 to 1), so it eases in and out. */
  private amt = { hide: 0, mourn: 0, cheer: 0, perk: 0 };
  private tearAt = 2;
  private tearT = -1;
  private sighAt = 5;
  private sighT = -1;
  /** The pet's height, measured once it's built. */
  height = 0.5;

  constructor() {
    this.sweat.scale.setScalar(0.045);
    this.tear.scale.setScalar(0.03);
    this.group.add(this.sweat, this.tear);
    for (let i = 0; i < 3; i++) {
      const m = new THREE.Mesh(SIGH_GEO, SIGH_MAT);
      this.sighs.push(m);
      this.group.add(m);
    }
    for (let i = 0; i < 8; i++) {
      const m = new THREE.Mesh(SPARK_GEO, SPARK_COLOURS[i % SPARK_COLOURS.length]);
      m.scale.setScalar(0.045);
      this.sparks.push(m);
      this.group.add(m);
    }
    for (const c of this.group.children) c.visible = false;
  }

  measure(root: THREE.Object3D) {
    const box = new THREE.Box3().setFromObject(root);
    if (!box.isEmpty()) this.height = Math.max(0.2, box.max.y - box.min.y);
    // Tilts (drooping, peeking) are turned with the pet, so it nods the way it faces.
    root.rotation.order = 'YXZ';
  }

  /** Poses the pet's root (already placed and turned) for its mood, and moves the floating bits along. */
  apply(root: THREE.Object3D, mood: PetMood | null, dt: number, t: number) {
    const k = Math.min(1, dt * 5);
    const ease = (key: keyof PetFeel['amt'], on: boolean) => (this.amt[key] += ((on ? 1 : 0) - this.amt[key]) * k);
    const hide = ease('hide', mood?.kind === 'hide');
    const mourn = ease('mourn', mood?.kind === 'mourn');
    const cheer = ease('cheer', mood?.kind === 'cheer');
    const perk = ease('perk', mood?.kind === 'mourn' && Boolean(mood.look));
    const h = this.height;
    const p = root.position;
    this.group.visible = root.visible;
    this.group.position.copy(p);
    this.group.rotation.y = root.rotation.y;

    // Hiding: squashed down and trembling.
    const tremble = Math.sin(t * 47) * 0.05 * hide;
    // Mourning: sat low, head bowed (unless someone's passing), with a slow sad breath.
    const droop = mourn * (1 - perk);
    const breath = Math.sin(t * 1.3) * 0.02 * mourn;
    // Cheering: hops, and a twirl every few seconds.
    const hop = Math.abs(Math.sin(t * 7)) * 0.22 * cheer;
    const twirlT = (t % 4) / 0.6;
    const twirl = twirlT < 1 ? twirlT * Math.PI * 2 * cheer : 0;
    const sy = 1 - 0.24 * hide - 0.12 * droop + breath + 0.08 * cheer * Math.sin(t * 14);
    const sxz = 1 + 0.08 * hide + 0.05 * droop;
    root.scale.set(sxz, sy, sxz);
    root.rotation.x = 0.3 * droop - 0.18 * perk * mourn + 0.12 * hide;
    root.rotation.z = tremble;
    root.rotation.y += twirl;
    p.y += hop + perk * mourn * Math.abs(Math.sin(t * 9)) * 0.05;
    p.x += Math.sin(t * 61) * 0.012 * hide;

    // The bead of sweat, sliding down the side of its head.
    this.sweat.visible = hide > 0.3;
    if (this.sweat.visible) {
      const slide = (t * 0.7) % 1;
      this.sweat.position.set(h * 0.32, h * (0.95 - slide * 0.25), h * 0.12);
      this.sweat.scale.setScalar(0.035 + h * 0.04);
    }

    // Now and then a tear, rolling off its face to the ground.
    this.tear.visible = false;
    if (mourn > 0.5 && mood?.kind === 'mourn') {
      this.tearAt -= dt;
      if (this.tearAt <= 0 && this.tearT < 0) this.tearT = 0;
      if (this.tearT >= 0) {
        this.tearT += dt;
        const f = this.tearT / 1.1;
        this.tear.visible = true;
        this.tear.position.set(h * 0.12, h * (0.62 - f * 0.6), h * 0.36 + f * 0.04);
        this.tear.scale.setScalar((0.02 + h * 0.03) * (f < 0.2 ? f / 0.2 : 1));
        if (f >= 1) {
          this.tearT = -1;
          this.tearAt = 2.5 + Math.random() * 3;
        }
      }
      // And a sigh: three little puffs drifting up.
      this.sighAt -= dt;
      if (this.sighAt <= 0 && this.sighT < 0) this.sighT = 0;
    }
    for (const s of this.sighs) s.visible = false;
    if (this.sighT >= 0) {
      this.sighT += dt;
      const f = this.sighT / 1.8;
      this.sighs.forEach((s, i) => {
        const g = f * 1.4 - i * 0.18;
        if (g <= 0 || g >= 1) return;
        s.visible = mourn > 0.5;
        s.position.set(h * 0.1 + g * 0.12, h * 0.8 + g * 0.35, h * 0.4 + g * 0.08);
        s.scale.setScalar((0.025 + i * 0.012) * (1 - g * 0.5));
      });
      if (f >= 1) {
        this.sighT = -1;
        this.sighAt = 5 + Math.random() * 5;
      }
    }

    // Sparkles bursting up and round.
    this.sparks.forEach((s, i) => {
      s.visible = cheer > 0.3;
      if (!s.visible) return;
      const f = (t * 0.9 + i / this.sparks.length) % 1;
      const a = i * 2.4 + t * 1.5;
      const r = 0.15 + f * 0.35;
      s.position.set(Math.cos(a) * r, h * 0.9 + f * 0.7, Math.sin(a) * r);
      s.rotation.set(t * 3 + i, t * 2, 0);
      s.scale.setScalar(0.05 * (1 - f));
    });
  }

  dispose() {
    this.group.removeFromParent();
  }
}
