import * as THREE from 'three';
import { Builder, soft, wet, type Vec3 } from './build';
import type { PetId } from './types';

/**
 * Little companions that follow their owner about: a third of an animal's height, built and animated in
 * place. The engine moves `root` (feet on the ground, facing +z) and says whether it's on the move.
 */

export interface Pet {
  root: THREE.Object3D;
  update(dt: number, t: number, moving: boolean): void;
  setGhost(on: boolean): void;
  dispose(): void;
}

const sph = (w: number, h: number) => new THREE.SphereGeometry(1, w, h);
const INK = '#231c1f';
const BLUSH = '#f79aa8';

const GHOST = () =>
  new THREE.MeshStandardMaterial({ color: '#dfe9ff', emissive: '#9fc4ff', emissiveIntensity: 0.5, transparent: true, opacity: 0.55, roughness: 1 });

function addEyes(b: Builder, y: number, z: number, x: number, r: number) {
  for (const s of [-1, 1]) {
    b.add(sph(10, 8), INK, { pos: [s * x, y, z], scale: [r, r * 1.15, r * 0.7] });
    b.add(sph(6, 4), '#ffffff', { pos: [s * x + r * 0.35, y + r * 0.4, z + r * 0.55], scale: r * 0.32 });
  }
}

function blush(b: Builder, y: number, z: number, x: number, r: number) {
  for (const s of [-1, 1]) b.add(sph(8, 6), BLUSH, { pos: [s * x, y, z], scale: [r, r * 0.55, r * 0.4] });
}

/** Common plumbing: a body mesh, an eye mesh that blinks, optional extra moving parts, and a ghost material. */
class PetRig implements Pet {
  root = new THREE.Group();
  /** Bobs and squashes; everything hangs off it. */
  protected bodyGroup = new THREE.Group();
  protected eyes = new THREE.Group();
  private meshes: { mesh: THREE.Mesh; material: THREE.Material }[] = [];
  private ghostMat = GHOST();
  private materials: THREE.Material[] = [this.ghostMat];
  private blinkAt = 1.5 + Math.random() * 3;
  private blinkT = -1;
  protected seed = Math.random() * 10;
  protected moveAmt = 0;
  private ghost = false;

  constructor(body: Builder, eyes: Builder, eyeY: number, material: THREE.Material = soft()) {
    this.root.add(this.bodyGroup);
    this.materials.push(material);
    this.addMesh(body.mesh(material, { cast: true, receive: false }), this.bodyGroup, material);
    this.eyes.position.y = eyeY;
    const eg = eyes.geometry();
    eg.translate(0, -eyeY, 0);
    const em = soft();
    this.materials.push(em);
    this.addMesh(new THREE.Mesh(eg, em), this.eyes, em);
    this.bodyGroup.add(this.eyes);
  }

  protected addMesh(mesh: THREE.Mesh, parent: THREE.Object3D, material: THREE.Material) {
    mesh.castShadow = true;
    parent.add(mesh);
    this.meshes.push({ mesh, material });
    if (!this.materials.includes(material)) this.materials.push(material);
    return mesh;
  }

  update(dt: number, t: number, moving: boolean) {
    this.moveAmt += ((moving ? 1 : 0) - this.moveAmt) * Math.min(1, dt * 6);
    this.blinkAt -= dt;
    if (this.blinkAt <= 0 && this.blinkT < 0) this.blinkT = 0;
    if (this.blinkT >= 0) {
      this.blinkT += dt;
      const b = this.blinkT / 0.13;
      this.eyes.scale.y = b < 1 ? Math.max(0.12, Math.abs(1 - b * 2)) : 1;
      if (b >= 1) {
        this.blinkT = -1;
        this.blinkAt = 2 + Math.random() * 4;
      }
    }
    this.animate(dt, t + this.seed, this.moveAmt);
  }

  /** Per-pet motion. */
  protected animate(_dt: number, _t: number, _move: number) {}

  setGhost(on: boolean) {
    if (on === this.ghost) return;
    this.ghost = on;
    for (const { mesh, material } of this.meshes) {
      mesh.material = on ? this.ghostMat : material;
      mesh.castShadow = !on;
    }
  }

  dispose() {
    this.root.traverse((o) => (o as THREE.Mesh).isMesh && (o as THREE.Mesh).geometry.dispose());
    for (const m of this.materials) m.dispose();
    this.root.removeFromParent();
  }
}

/** A hop: up and down on a quick beat while moving, and a gentle breathing bob when still. */
const hop = (t: number, move: number, height: number, rate = 11) => Math.abs(Math.sin(t * rate)) * height * move;

// ---------------------------------------------------------------- the pets

class Chick extends PetRig {
  constructor() {
    const b = new Builder();
    const yellow = '#f6d55c';
    const orange = '#f39a3a';
    b.add(sph(18, 14), yellow, { pos: [0, 0.15, 0], scale: [0.14, 0.135, 0.13] });
    b.add(sph(12, 9), '#fbe58a', { pos: [0, 0.12, 0.05], scale: [0.09, 0.08, 0.08] });
    // A little tuft, a beak, wings and feet.
    for (const [x, rz, h] of [
      [-0.015, 0.4, 0.05],
      [0.005, 0, 0.06],
      [0.022, -0.45, 0.045],
    ]) {
      b.add(new THREE.ConeGeometry(1, 1, 10), yellow, { pos: [x, 0.29, 0.0], rot: [0, 0, rz], scale: [0.014, h, 0.012] });
    }
    b.add(new THREE.ConeGeometry(1, 1, 12), orange, { pos: [0, 0.165, 0.135], rot: [Math.PI / 2, 0, 0], scale: [0.025, 0.04, 0.018] });
    for (const s of [-1, 1]) {
      b.add(sph(10, 7), '#f2c94a', { pos: [s * 0.13, 0.14, -0.01], rot: [0, 0, s * 0.5], scale: [0.03, 0.06, 0.05] });
      for (const dx of [-0.015, 0, 0.015]) b.add(sph(6, 4), orange, { pos: [s * 0.045 + dx, 0.012, 0.04 + Math.abs(dx) * -0.5], scale: [0.011, 0.008, 0.022] });
    }
    blush(b, 0.14, 0.115, 0.075, 0.02);
    const e = new Builder();
    addEyes(e, 0.19, 0.118, 0.048, 0.018);
    super(b, e, 0.19);
  }
  protected animate(_dt: number, t: number, move: number) {
    this.bodyGroup.position.y = hop(t, move, 0.06) + Math.sin(t * 2.2) * 0.006 * (1 - move);
    this.bodyGroup.rotation.x = move * 0.12;
    this.bodyGroup.rotation.z = Math.sin(t * 11) * 0.06 * move;
  }
}

class Slime extends PetRig {
  constructor() {
    const b = new Builder();
    const mint = '#7ad8b0';
    // A soft dome of jelly with a darker core and a shine on top.
    b.add(sph(22, 14), mint, { pos: [0, 0.1, 0], scale: [0.16, 0.12, 0.15] });
    b.add(new THREE.CylinderGeometry(0.16, 0.15, 0.06, 24), mint, { pos: [0, 0.035, 0] });
    b.add(sph(12, 8), '#5ac094', { pos: [0, 0.08, -0.02], scale: [0.08, 0.06, 0.07] });
    b.add(sph(10, 7), '#f2fff8', { pos: [-0.06, 0.18, 0.05], scale: [0.03, 0.018, 0.02] });
    blush(b, 0.09, 0.13, 0.08, 0.02);
    const e = new Builder();
    addEyes(e, 0.12, 0.135, 0.045, 0.02);
    e.add(new THREE.TorusGeometry(1, 0.18, 6, 14, Math.PI), INK, { pos: [0, 0.085, 0.142], rot: [0, 0, Math.PI], scale: 0.016 });
    super(b, e, 0.12, wet());
  }
  protected animate(_dt: number, t: number, move: number) {
    // Squash and stretch: breathe when still, bounce along when moving, squashing as it lands.
    const phase = Math.sin(t * 9);
    const air = Math.max(0, phase) * move;
    const squash = 1 + Math.sin(t * 2.4) * 0.04 * (1 - move) + (phase < 0 ? -phase * 0.18 * move : -air * 0.08);
    this.bodyGroup.scale.set(1 / Math.sqrt(squash), squash, 1 / Math.sqrt(squash));
    this.bodyGroup.position.y = air * 0.07;
  }
}

class Ghosty extends PetRig {
  constructor() {
    const b = new Builder();
    const white = '#f6f8ff';
    // A round top over a skirt that ends in soft scallops; it floats.
    b.add(sph(20, 12), white, { pos: [0, 0.22, 0], scale: [0.12, 0.12, 0.115] });
    b.add(new THREE.CylinderGeometry(0.12, 0.14, 0.13, 24, 1, true), white, { pos: [0, 0.155, 0] });
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      b.add(sph(10, 7), white, { pos: [Math.sin(a) * 0.115, 0.09, Math.cos(a) * 0.11], scale: [0.04, 0.035, 0.04] });
    }
    for (const s of [-1, 1]) b.add(sph(10, 7), white, { pos: [s * 0.13, 0.17, 0.0], rot: [0, 0, s * 0.6], scale: [0.025, 0.05, 0.025] });
    blush(b, 0.2, 0.11, 0.06, 0.018);
    const e = new Builder();
    for (const s of [-1, 1]) e.add(sph(10, 8), INK, { pos: [s * 0.04, 0.245, 0.105], scale: [0.016, 0.026, 0.01] });
    e.add(sph(8, 6), INK, { pos: [0, 0.2, 0.112], scale: [0.012, 0.014, 0.006] });
    const mat = soft();
    mat.transparent = true;
    mat.opacity = 0.9;
    super(b, e, 0.235, mat);
  }
  protected animate(_dt: number, t: number, move: number) {
    this.bodyGroup.position.y = 0.16 + Math.sin(t * 2.1) * 0.035;
    this.bodyGroup.rotation.z = Math.sin(t * 1.4) * 0.08;
    this.bodyGroup.rotation.x = move * 0.25;
  }
}

class Mouse extends PetRig {
  private tail: THREE.Object3D;
  constructor() {
    const b = new Builder();
    const grey = '#a8a2a8';
    const pink = '#f4a6b4';
    b.add(sph(18, 12), grey, { pos: [0, 0.1, -0.01], scale: [0.1, 0.095, 0.12] });
    b.add(sph(16, 12), grey, { pos: [0, 0.15, 0.09], scale: [0.08, 0.075, 0.075] });
    b.add(new THREE.ConeGeometry(1, 1, 14), grey, { pos: [0, 0.14, 0.17], rot: [Math.PI / 2, 0, 0], scale: [0.045, 0.05, 0.04] });
    b.add(sph(8, 6), pink, { pos: [0, 0.145, 0.198], scale: 0.014 });
    b.add(sph(12, 8), '#e8e2e6', { pos: [0, 0.08, 0.06], scale: [0.065, 0.06, 0.06] });
    for (const s of [-1, 1]) {
      b.add(sph(14, 9), grey, { pos: [s * 0.07, 0.23, 0.07], rot: [0, 0, s * -0.3], scale: [0.05, 0.05, 0.012] });
      b.add(sph(12, 8), pink, { pos: [s * 0.07, 0.228, 0.08], rot: [0, 0, s * -0.3], scale: [0.034, 0.034, 0.006] });
      for (const tilt of [-0.12, 0.12]) b.add(new THREE.BoxGeometry(1, 1, 1), '#6a6468', { pos: [s * 0.05, 0.14 + tilt * 0.05, 0.18], rot: [0, s * 0.35, s * tilt], scale: [0.07, 0.003, 0.003] });
      b.add(sph(8, 6), pink, { pos: [s * 0.045, 0.012, 0.06], scale: [0.016, 0.01, 0.025] });
    }
    blush(b, 0.13, 0.155, 0.05, 0.013);
    const e = new Builder();
    addEyes(e, 0.17, 0.15, 0.03, 0.013);
    super(b, e, 0.17);
    // The tail, curling up behind, on its own pivot so it can swish.
    const tb = new Builder();
    const curve = new THREE.CatmullRomCurve3([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0.02, -0.08), new THREE.Vector3(0.03, 0.08, -0.14), new THREE.Vector3(0.0, 0.14, -0.12)]);
    const tg = new THREE.TubeGeometry(curve, 18, 0.008, 6, false);
    tb.add(tg, pink);
    tg.dispose();
    const tmat = soft();
    this.tail = this.addMesh(tb.mesh(tmat, { cast: true, receive: false }), this.bodyGroup, tmat);
    this.tail.position.set(0, 0.07, -0.12);
  }
  protected animate(_dt: number, t: number, move: number) {
    this.bodyGroup.position.y = hop(t, move, 0.035, 14) + Math.sin(t * 3) * 0.004;
    this.bodyGroup.rotation.x = Math.sin(t * 5) * 0.03 * (1 - move);
    this.tail.rotation.y = Math.sin(t * 2.5) * 0.4;
  }
}

class Bee extends PetRig {
  private wings: THREE.InstancedMesh;
  constructor() {
    const b = new Builder();
    const yellow = '#f6c83a';
    const black = '#2a2228';
    // A plump striped body with a sting, a fuzzy head and antennae.
    b.add(sph(18, 12), yellow, { pos: [0, 0, -0.01], scale: [0.075, 0.07, 0.095] });
    for (const z of [-0.035, 0.015]) b.add(new THREE.CylinderGeometry(1, 1, 1, 22), black, { pos: [0, 0, z], rot: [Math.PI / 2, 0, 0], scale: [0.074, 0.022, 0.07] });
    b.add(new THREE.ConeGeometry(1, 1, 12), black, { pos: [0, 0, -0.115], rot: [-Math.PI / 2, 0, 0], scale: [0.015, 0.035, 0.015] });
    b.add(sph(16, 12), yellow, { pos: [0, 0.01, 0.085], scale: 0.055 });
    for (const s of [-1, 1]) {
      const curve = new THREE.CatmullRomCurve3([new THREE.Vector3(s * 0.02, 0.05, 0.1), new THREE.Vector3(s * 0.035, 0.09, 0.12), new THREE.Vector3(s * 0.05, 0.11, 0.11)]);
      const g = new THREE.TubeGeometry(curve, 8, 0.004, 5, false);
      b.add(g, black);
      g.dispose();
      b.add(sph(8, 6), black, { pos: [s * 0.05, 0.11, 0.11], scale: 0.01 });
    }
    blush(b, -0.005, 0.13, 0.035, 0.012);
    const e = new Builder();
    addEyes(e, 0.02, 0.13, 0.024, 0.012);
    super(b, e, 0.02);
    // Two see-through wings as one instanced mesh, flapping fast.
    const wb = new Builder();
    wb.add(sph(14, 8), '#f4fbff', { pos: [0.045, 0, 0], scale: [0.05, 0.004, 0.03] });
    wb.add(sph(12, 6), '#f4fbff', { pos: [0.035, 0, -0.035], scale: [0.035, 0.004, 0.022] });
    const wmat = soft();
    wmat.transparent = true;
    wmat.opacity = 0.55;
    wmat.depthWrite = false;
    wmat.side = THREE.DoubleSide;
    this.wings = new THREE.InstancedMesh(wb.geometry(), wmat, 2);
    this.wings.frustumCulled = false;
    this.addMesh(this.wings, this.bodyGroup, wmat);
    this.wings.castShadow = false;
  }
  protected animate(_dt: number, t: number, move: number) {
    // Hovers about head height of its owner's knees, buzzing about in little loops.
    this.bodyGroup.position.set(Math.sin(t * 1.7) * 0.05, 0.4 + Math.sin(t * 2.3) * 0.04 + Math.sin(t * 7.1) * 0.008, Math.sin(t * 1.3) * 0.04);
    this.bodyGroup.rotation.set(0.15 + move * 0.25, Math.sin(t * 0.9) * 0.3, Math.sin(t * 2.3) * 0.08);
    const flap = Math.sin(t * 60) * 0.6;
    const m = new THREE.Matrix4();
    for (const s of [-1, 1]) {
      m.compose(new THREE.Vector3(s * 0.02, 0.06, 0.0), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, s * (0.35 + flap))), new THREE.Vector3(s, 1, 1));
      this.wings.setMatrixAt(s < 0 ? 0 : 1, m);
    }
    this.wings.instanceMatrix.needsUpdate = true;
  }
}

class Snail extends PetRig {
  constructor() {
    const b = new Builder();
    const body = '#ddd2a8';
    const shell = '#c8783a';
    const line = '#7a4422';
    // A long low foot, a round shell with a spiral, and eyes on stalks (in the eye mesh, so they blink).
    b.add(sph(16, 10), body, { pos: [0, 0.04, 0.02], scale: [0.06, 0.04, 0.15] });
    b.add(sph(14, 10), body, { pos: [0, 0.08, 0.12], scale: [0.05, 0.055, 0.05] });
    const sc: Vec3 = [0, 0.13, -0.03];
    b.add(sph(20, 14), shell, { pos: sc, scale: [0.085, 0.09, 0.085] });
    for (const s of [-1, 1]) {
      const ring = new THREE.TorusGeometry(1, 0.2, 8, 24);
      b.add(ring, line, { pos: [s * 0.072, sc[1], sc[2]], rot: [0, Math.PI / 2, 0], scale: [0.06, 0.06, 0.03] });
      b.add(ring, line, { pos: [s * 0.084, sc[1] + 0.005, sc[2] + 0.005], rot: [0, Math.PI / 2, 0], scale: [0.032, 0.032, 0.02] });
      ring.dispose();
      b.add(new THREE.CylinderGeometry(1, 1, 1, 8), body, { pos: [s * 0.022, 0.15, 0.13], rot: [0.2, 0, -s * 0.25], scale: [0.009, 0.09, 0.009] });
    }
    blush(b, 0.075, 0.165, 0.03, 0.012);
    const e = new Builder();
    for (const s of [-1, 1]) {
      e.add(sph(10, 8), '#fbf8f2', { pos: [s * 0.034, 0.2, 0.14], scale: 0.017 });
      e.add(sph(8, 6), INK, { pos: [s * 0.034, 0.2, 0.152], scale: [0.009, 0.01, 0.007] });
    }
    super(b, e, 0.2);
  }
  protected animate(_dt: number, t: number, move: number) {
    // It slides: the foot stretches and gathers as it goes, and the eye stalks wobble.
    const slide = Math.sin(t * 5) * 0.06 * move;
    this.bodyGroup.scale.set(1, 1 - slide * 0.3, 1 + slide);
    this.eyes.rotation.z = Math.sin(t * 2.2) * 0.08;
    this.eyes.rotation.x = Math.sin(t * 1.6) * 0.05;
  }
}

const MAKERS: Record<PetId, () => PetRig> = {
  chick: () => new Chick(),
  slime: () => new Slime(),
  ghost: () => new Ghosty(),
  mouse: () => new Mouse(),
  bee: () => new Bee(),
  snail: () => new Snail(),
};

export function buildPet(pet: PetId): Pet {
  const make = MAKERS[pet] ?? MAKERS.chick;
  return make();
}
