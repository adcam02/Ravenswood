import * as THREE from 'three';
import { Builder, soft } from './build';

/**
 * A messenger pigeon: it flies in from the sky to someone's shoulder, sits there a moment cooing (while they read
 * who sent it), then bursts into confetti. Drawn on every screen where that someone is in sight; only they get the
 * note. Everything runs off `t`, seconds since it set off.
 */

export const PIGEON = { land: 2.2, burst: 6.4, end: 9 };

const GREY = '#8a93a8';
const LIGHT = '#a7afc0';
const DARK = '#5d6578';

const ease = (k: number) => {
  const c = Math.min(1, Math.max(0, k));
  return c * c * (3 - 2 * c);
};

function bird(material: THREE.Material) {
  const root = new THREE.Group();
  const b = new Builder();
  // Body, a paler breast, the shimmering green and purple neck, the head, beak and eyes.
  b.add(new THREE.SphereGeometry(1, 14, 10), GREY, { scale: [0.085, 0.075, 0.125] });
  b.add(new THREE.SphereGeometry(1, 12, 8), LIGHT, { pos: [0, -0.01, 0.04], scale: [0.07, 0.06, 0.09] });
  b.add(new THREE.SphereGeometry(1, 12, 8), '#5aa88a', { pos: [0, 0.05, 0.075], scale: [0.058, 0.05, 0.05] });
  b.add(new THREE.SphereGeometry(1, 12, 8), '#8a5aa8', { pos: [0, 0.035, 0.085], scale: [0.06, 0.035, 0.045] });
  b.add(new THREE.SphereGeometry(1, 12, 10), GREY, { pos: [0, 0.105, 0.1], scale: [0.05, 0.05, 0.055] });
  b.add(new THREE.ConeGeometry(0.014, 0.05, 6), '#e8c27a', { pos: [0, 0.1, 0.165], rot: [Math.PI / 2, 0, 0] });
  b.add(new THREE.SphereGeometry(1, 6, 4), '#f4efe6', { pos: [0, 0.112, 0.145], scale: [0.012, 0.008, 0.012] });
  for (const sx of [-1, 1]) {
    b.add(new THREE.SphereGeometry(1, 8, 6), '#ff8a3a', { pos: [sx * 0.04, 0.115, 0.12], scale: 0.013 });
    b.add(new THREE.SphereGeometry(1, 6, 4), '#1d1612', { pos: [sx * 0.047, 0.116, 0.124], scale: 0.006 });
    // Little pink feet.
    b.add(new THREE.CylinderGeometry(0.006, 0.006, 0.06, 5), '#e8908a', { pos: [sx * 0.03, -0.08, 0.01] });
    b.add(new THREE.BoxGeometry(0.025, 0.006, 0.035), '#e8908a', { pos: [sx * 0.03, -0.11, 0.02] });
  }
  // The tail, and a rolled-up note tied to one leg with a red ribbon.
  b.add(new THREE.BoxGeometry(0.08, 0.015, 0.11), DARK, { pos: [0, 0.0, -0.15], rot: [0.25, 0, 0] });
  b.add(new THREE.CylinderGeometry(0.012, 0.012, 0.05, 8), '#f6efe0', { pos: [0.045, -0.07, 0.015], rot: [0, 0, Math.PI / 2] });
  b.add(new THREE.TorusGeometry(0.013, 0.004, 4, 10), '#d8343a', { pos: [0.045, -0.07, 0.015], rot: [0, Math.PI / 2, 0] });
  const body = b.mesh(material, { cast: false, receive: false });
  root.add(body);
  // Wings on pivots at the shoulders, so they can flap.
  const wings: THREE.Group[] = [];
  for (const sx of [-1, 1]) {
    const pivot = new THREE.Group();
    pivot.position.set(sx * 0.07, 0.03, 0.02);
    const w = new Builder();
    w.add(new THREE.SphereGeometry(1, 10, 6), GREY, { pos: [sx * 0.06, 0, -0.03], scale: [0.075, 0.018, 0.1] });
    for (const k of [0, 1]) w.add(new THREE.BoxGeometry(0.06, 0.02, 0.012), '#3d4250', { pos: [sx * 0.065, 0.004, -0.06 - k * 0.03] });
    w.add(new THREE.SphereGeometry(1, 8, 5), DARK, { pos: [sx * 0.12, 0, -0.06], scale: [0.05, 0.012, 0.07] });
    pivot.add(w.mesh(material, { cast: false, receive: false }));
    root.add(pivot);
    wings.push(pivot);
  }
  return { root, wings };
}

const CONFETTI = 70;
const COLOURS = ['#f6c445', '#ff6a5a', '#5ac8fa', '#7cc28b', '#b494dd', '#ff9ac0', '#ffffff', '#ff9a3a'];

export class PigeonFlight {
  readonly group = new THREE.Group();
  private material = soft();
  private bird: ReturnType<typeof bird>;
  private confetti: THREE.InstancedMesh;
  private confettiMat = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide, transparent: true });
  private bits: { p: THREE.Vector3; v: THREE.Vector3; spin: THREE.Vector3; r: THREE.Euler }[] = [];
  private from = new THREE.Vector3();
  private fired = new Set<string>();
  private lastT = 0;
  private m = new THREE.Matrix4();
  private q = new THREE.Quaternion();
  private s = new THREE.Vector3(1, 1, 1);

  constructor(
    parent: THREE.Object3D,
    /** Sound cues: 'flap', 'coo', 'pop'. */
    private cue: (name: string) => void = () => {},
    /** Which way it comes in from (radians round), so pigeons don't all arrive from the same side. */
    from = Math.random() * Math.PI * 2,
  ) {
    this.bird = bird(this.material);
    this.bird.root.scale.setScalar(1.25);
    this.from.set(Math.sin(from) * 9, 6, Math.cos(from) * 9);
    this.confetti = new THREE.InstancedMesh(new THREE.PlaneGeometry(0.05, 0.03), this.confettiMat, CONFETTI);
    this.confetti.frustumCulled = false;
    this.confetti.visible = false;
    const c = new THREE.Color();
    for (let i = 0; i < CONFETTI; i++) this.confetti.setColorAt(i, c.set(COLOURS[i % COLOURS.length]));
    this.group.add(this.bird.root, this.confetti);
    this.group.name = 'pigeon';
    parent.add(this.group);
  }

  private once(key: string, fn: () => void) {
    if (this.fired.has(key)) return;
    this.fired.add(key);
    fn();
  }

  /**
   * Moves things on to `t` seconds in. `shoulder` is where to land (world space), and `facing` the way the one it
   * lands on is facing; null while they aren't in sight here. Returns false once it's all over.
   */
  update(t: number, shoulder: THREE.Vector3 | null, facing: number): boolean {
    const dt = Math.max(0, Math.min(0.1, t - this.lastT));
    this.lastT = t;
    const P = PIGEON;
    if (t >= P.end) return false;
    const b = this.bird;
    this.group.visible = Boolean(shoulder);
    if (!shoulder) return true;
    if (t < P.land) {
      // Swooping in along a curve, flapping hard, banking a little.
      const k = ease(t / P.land);
      const start = shoulder.clone().add(this.from);
      const mid = shoulder.clone().lerp(start, 0.5).add(new THREE.Vector3(0, 1.5, 0));
      const a = start.clone().lerp(mid, k);
      const c = mid.clone().lerp(shoulder, k);
      const pos = a.lerp(c, k);
      const ahead = start.clone().lerp(mid, Math.min(1, k + 0.05)).lerp(mid.clone().lerp(shoulder, Math.min(1, k + 0.05)), Math.min(1, k + 0.05));
      b.root.position.copy(pos);
      b.root.rotation.set(0, Math.atan2(ahead.x - pos.x, ahead.z - pos.z), Math.sin(t * 3) * 0.2);
      const flap = Math.sin(t * 28) * 0.9;
      b.wings[0].rotation.z = flap;
      b.wings[1].rotation.z = -flap;
      if (t > 0.1) this.once('flap', () => this.cue('flap'));
    } else if (t < P.burst) {
      // Perched, facing the same way as its person, bobbing its head and cooing; wings folded.
      const u = t - P.land;
      b.root.position.copy(shoulder);
      b.root.position.y += Math.abs(Math.sin(u * 5)) * 0.015;
      b.root.rotation.set(0, facing, 0);
      const settle = Math.max(0, 1 - u * 3);
      b.wings[0].rotation.z = Math.sin(u * 30) * 0.8 * settle;
      b.wings[1].rotation.z = -Math.sin(u * 30) * 0.8 * settle;
      this.once('coo1', () => this.cue('coo'));
      if (u > 2) this.once('coo2', () => this.cue('coo'));
    } else {
      // Pop! Confetti everywhere, and the pigeon's gone.
      b.root.visible = false;
      this.once('burst', () => {
        this.cue('pop');
        this.confetti.visible = true;
        for (let i = 0; i < CONFETTI; i++) {
          const a = Math.random() * Math.PI * 2;
          const up = 1.2 + Math.random() * 2.2;
          const out = 0.6 + Math.random() * 1.6;
          this.bits.push({
            p: shoulder.clone(),
            v: new THREE.Vector3(Math.cos(a) * out, up, Math.sin(a) * out),
            spin: new THREE.Vector3(Math.random() * 12 - 6, Math.random() * 12 - 6, Math.random() * 12 - 6),
            r: new THREE.Euler(Math.random() * 6, Math.random() * 6, Math.random() * 6),
          });
        }
      });
      const age = (t - P.burst) / (P.end - P.burst);
      this.confettiMat.opacity = 1 - Math.max(0, age - 0.6) / 0.4;
      this.bits.forEach((bit, i) => {
        // Up and out, then fluttering down slowly, spinning as it goes.
        bit.v.y -= 4.5 * dt;
        bit.v.multiplyScalar(Math.max(0, 1 - dt * 1.8));
        bit.p.addScaledVector(bit.v, dt);
        bit.r.set(bit.r.x + bit.spin.x * dt, bit.r.y + bit.spin.y * dt, bit.r.z + bit.spin.z * dt);
        this.m.compose(bit.p, this.q.setFromEuler(bit.r), this.s);
        this.confetti.setMatrixAt(i, this.m);
      });
      this.confetti.instanceMatrix.needsUpdate = true;
    }
    return true;
  }

  dispose() {
    this.group.removeFromParent();
    this.group.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (mesh.isMesh) mesh.geometry.dispose();
    });
    this.confetti.dispose();
    this.material.dispose();
    this.confettiMat.dispose();
  }
}
