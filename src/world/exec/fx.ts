import * as THREE from 'three';

/**
 * The executions' puffs, flashes, sparks and flames. Everything is worked out from the show's clock alone (each
 * burst from when it began and a seed), so the show can be held at any moment and looks the same on every screen.
 */

export const ease = (k: number) => {
  const c = Math.min(1, Math.max(0, k));
  return c * c * (3 - 2 * c);
};
/** 0 before `a`, 1 after `b`, eased between. */
export const span = (t: number, a: number, b: number) => ease((t - a) / (b - a));
export const easeOut = (k: number) => 1 - (1 - Math.min(1, Math.max(0, k))) ** 3;
/** A steady number from 0 up to 1 for an integer (and a salt). */
export function hash(i: number, salt = 0): number {
  const h = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453;
  return h - Math.floor(h);
}

export type BurstKind = 'poof' | 'smoke' | 'soot' | 'dust' | 'fire' | 'steam' | 'sparks' | 'sparkle' | 'flash';

interface BurstLook {
  color: string;
  /** Glows rather than being lit (fire, sparks). */
  glow?: boolean;
  n: number;
  size: number;
  spread: number;
  rise: number;
  life: number;
  /** Pulled down as it goes (sparks). */
  fall?: number;
  grow: number;
}

const LOOKS: Record<BurstKind, BurstLook> = {
  poof: { color: '#f6f2fa', n: 14, size: 0.2, spread: 0.9, rise: 0.5, life: 0.9, grow: 2.2 },
  smoke: { color: '#b8b4bc', n: 8, size: 0.14, spread: 0.45, rise: 1.0, life: 1.4, grow: 2.4 },
  soot: { color: '#4a4448', n: 10, size: 0.18, spread: 0.6, rise: 1.1, life: 1.6, grow: 2.4 },
  dust: { color: '#c9b08a', n: 12, size: 0.22, spread: 1.4, rise: 0.25, life: 1.3, grow: 2.0 },
  fire: { color: '#ffb347', glow: true, n: 16, size: 0.22, spread: 1.0, rise: 0.8, life: 0.7, grow: 2.2 },
  steam: { color: '#ffffff', n: 10, size: 0.14, spread: 0.4, rise: 1.4, life: 1.5, grow: 2.6 },
  sparks: { color: '#ffe680', glow: true, n: 14, size: 0.035, spread: 1.6, rise: 0.9, life: 0.7, fall: 4, grow: 0.6 },
  sparkle: { color: '#fff6c8', glow: true, n: 12, size: 0.05, spread: 0.8, rise: 0.4, life: 1.0, grow: 0.3 },
  flash: { color: '#fffbe8', glow: true, n: 1, size: 0.3, spread: 0, rise: 0, life: 0.16, grow: 2.5 },
};

interface Burst {
  at: number;
  origin: THREE.Vector3;
  look: BurstLook;
  scale: number;
  seed: number;
  /** Which way it leans (a muzzle's puff goes forward). */
  push: THREE.Vector3;
  meshes: THREE.Mesh[];
  material: THREE.MeshLambertMaterial | THREE.MeshBasicMaterial;
}

const BALL = new THREE.IcosahedronGeometry(1, 1);
const STAR = (() => {
  // A little four-pointed twinkle, flat, for sparkles.
  const s = new THREE.Shape();
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const r = i % 2 ? 0.35 : 1;
    if (i === 0) s.moveTo(Math.cos(a) * r, Math.sin(a) * r);
    else s.lineTo(Math.cos(a) * r, Math.sin(a) * r);
  }
  return new THREE.ShapeGeometry(s);
})();

export class Bursts {
  readonly group = new THREE.Group();
  private list: Burst[] = [];
  private n = 0;

  /** A burst starting at `at` on the show's clock. `scale` makes it bigger or smaller; `push` leans it one way. */
  add(at: number, kind: BurstKind, origin: THREE.Vector3, scale = 1, push = new THREE.Vector3()) {
    const look = LOOKS[kind];
    const material = look.glow
      ? new THREE.MeshBasicMaterial({ color: look.color, transparent: true, depthWrite: false, side: THREE.DoubleSide })
      : new THREE.MeshLambertMaterial({ color: look.color, emissive: kind === 'soot' ? '#1a1618' : '#8a8494', flatShading: true, transparent: true, depthWrite: false });
    const meshes: THREE.Mesh[] = [];
    for (let i = 0; i < look.n; i++) {
      const m = new THREE.Mesh(kind === 'sparkle' ? STAR : BALL, material);
      m.visible = false;
      this.group.add(m);
      meshes.push(m);
    }
    this.list.push({ at, origin: origin.clone(), look, scale, seed: ++this.n * 7.3, push, meshes, material });
  }

  update(t: number, camera?: THREE.Camera) {
    for (const b of this.list) {
      const u = (t - b.at) / b.look.life;
      const on = u >= 0 && u < 1;
      for (const m of b.meshes) m.visible = on;
      if (!on) continue;
      const out = easeOut(u * 1.6);
      b.material.opacity = (b.look.glow ? 1 : 0.92) * Math.pow(1 - u, 1.3);
      b.meshes.forEach((m, i) => {
        const a = hash(i, b.seed) * Math.PI * 2;
        const e = (hash(i, b.seed + 1) - 0.25) * 1.4;
        const r = b.look.spread * b.scale * (0.35 + hash(i, b.seed + 2) * 0.65);
        const dx = Math.cos(a) * Math.cos(e) * r;
        const dy = Math.sin(e) * r * 0.6;
        const dz = Math.sin(a) * Math.cos(e) * r;
        const fall = (b.look.fall ?? 0) * (u * b.look.life) ** 2 * 0.5;
        m.position.set(
          b.origin.x + dx * out + b.push.x * out,
          b.origin.y + dy * out + b.look.rise * b.scale * u - fall + b.push.y * out,
          b.origin.z + dz * out + b.push.z * out,
        );
        const s = b.look.size * b.scale * (0.6 + hash(i, b.seed + 3) * 0.8) * (1 + (b.look.grow - 1) * out);
        m.scale.setScalar(s);
        if (camera && m.geometry === STAR) m.quaternion.copy(camera.quaternion);
        else m.rotation.set(i * 0.7, i * 1.3 + u, 0);
      });
    }
  }

  dispose() {
    for (const b of this.list) b.material.dispose();
    this.list = [];
    this.group.removeFromParent();
  }
}

/** Flickering cartoon flames: a few cones, orange round yellow, licking up from a spot. */
export class Flames {
  readonly group = new THREE.Group();
  private tongues: { mesh: THREE.Mesh; x: number; z: number; h: number; k: number }[] = [];
  private outer = new THREE.MeshBasicMaterial({ color: '#ff8a2a', transparent: true, opacity: 0.92, depthWrite: false });
  private inner = new THREE.MeshBasicMaterial({ color: '#ffd84a', transparent: true, opacity: 0.95, depthWrite: false });
  private cone = new THREE.ConeGeometry(1, 1, 7);

  constructor(width: number, count = 9) {
    this.cone.translate(0, 0.5, 0);
    for (let i = 0; i < count; i++) {
      const outer = i % 3 !== 2;
      const mesh = new THREE.Mesh(this.cone, outer ? this.outer : this.inner);
      const x = (hash(i, 3) - 0.5) * width;
      const z = (hash(i, 5) - 0.5) * width * 0.7;
      const h = outer ? 0.45 + hash(i, 7) * 0.35 : 0.3 + hash(i, 9) * 0.2;
      this.tongues.push({ mesh, x, z, h, k: hash(i, 11) * 10 });
      mesh.renderOrder = outer ? 2 : 3;
      this.group.add(mesh);
    }
  }

  /** `size` 0 is out, 1 a good blaze. */
  update(t: number, size: number) {
    this.group.visible = size > 0.01;
    if (!this.group.visible) return;
    for (const f of this.tongues) {
      const flick = 0.75 + 0.25 * Math.sin(t * 13 + f.k) + 0.12 * Math.sin(t * 29 + f.k * 2);
      const h = f.h * size * flick;
      const w = (0.12 + f.h * 0.18) * Math.sqrt(size);
      f.mesh.scale.set(w, Math.max(0.001, h), w);
      f.mesh.position.set(f.x * (0.6 + 0.4 * size), 0, f.z * (0.6 + 0.4 * size));
      f.mesh.rotation.set(Math.sin(t * 7 + f.k) * 0.12, f.k, Math.sin(t * 9 + f.k) * 0.12);
    }
  }

  dispose() {
    this.outer.dispose();
    this.inner.dispose();
    this.cone.dispose();
    this.group.removeFromParent();
  }
}

/** Crackling bolts of electricity between points, jumping to a new zigzag several times a second. */
export class Bolts {
  readonly group = new THREE.Group();
  private segs: THREE.Mesh[] = [];
  private mat = new THREE.MeshBasicMaterial({ color: '#d8f4ff', transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
  private glowMat = new THREE.MeshBasicMaterial({ color: '#5ac8ff', transparent: true, opacity: 0.45, depthWrite: false, blending: THREE.AdditiveBlending });
  private rod = new THREE.CylinderGeometry(1, 1, 1, 5);

  constructor(private count = 40) {
    this.rod.translate(0, 0.5, 0);
    this.rod.rotateX(Math.PI / 2);
    for (let i = 0; i < count; i++) {
      const core = new THREE.Mesh(this.rod, this.mat);
      const glow = new THREE.Mesh(this.rod, this.glowMat);
      core.add(glow);
      glow.scale.set(3, 3, 1);
      core.visible = false;
      this.group.add(core);
      this.segs.push(core);
    }
  }

  /** Zigzags from each `from` to its `to`, `jag` metres wild, redrawn `rate` times a second; `on` 0 to 1 thins them out. */
  update(t: number, paths: [THREE.Vector3, THREE.Vector3][], on: number, jag = 0.12, rate = 18) {
    const frame = Math.floor(t * rate);
    let used = 0;
    const steps = 5;
    const a = new THREE.Vector3();
    const b = new THREE.Vector3();
    paths.forEach(([from, to], p) => {
      if (on <= 0 || hash(frame * 13 + p, 2) > on + 0.15) return;
      a.copy(from);
      for (let s = 1; s <= steps && used < this.count; s++) {
        b.lerpVectors(from, to, s / steps);
        if (s < steps) b.add(new THREE.Vector3(hash(frame + s * 3 + p * 17, 1) - 0.5, hash(frame + s * 5 + p * 19, 2) - 0.5, hash(frame + s * 7 + p * 23, 3) - 0.5).multiplyScalar(jag * 2));
        const seg = this.segs[used++];
        seg.visible = true;
        seg.position.copy(a);
        seg.lookAt(b);
        const w = 0.012 + 0.01 * hash(frame + s, p);
        seg.scale.set(w, w, a.distanceTo(b));
        a.copy(b);
      }
    });
    for (let i = used; i < this.count; i++) this.segs[i].visible = false;
  }

  dispose() {
    this.mat.dispose();
    this.glowMat.dispose();
    this.rod.dispose();
    this.group.removeFromParent();
  }
}

/** Dizzy stars going round a spot, as after a bump on the head. */
export class Dizzy {
  readonly group = new THREE.Group();
  private stars: THREE.Mesh[] = [];
  private mat = new THREE.MeshBasicMaterial({ color: '#ffe066', side: THREE.DoubleSide });

  constructor(n = 4) {
    for (let i = 0; i < n; i++) {
      const m = new THREE.Mesh(STAR, this.mat);
      m.scale.setScalar(0.07);
      this.stars.push(m);
      this.group.add(m);
    }
    this.group.visible = false;
  }

  update(t: number, at: THREE.Vector3 | null, r: number, camera?: THREE.Camera) {
    this.group.visible = Boolean(at);
    if (!at) return;
    this.stars.forEach((m, i) => {
      const a = t * 4 + (i / this.stars.length) * Math.PI * 2;
      m.position.set(at.x + Math.cos(a) * r, at.y + Math.sin(a * 2) * 0.03, at.z + Math.sin(a) * r);
      if (camera) m.quaternion.copy(camera.quaternion);
    });
  }

  dispose() {
    this.mat.dispose();
    this.group.removeFromParent();
  }
}
