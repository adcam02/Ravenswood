import * as THREE from 'three';
import { Builder, SMOOTH_LOOK, eyeMaterial, rng, soft, type Place, type Vec3 } from './build';
import { sculptGeometry, type Field, type Markings } from './forms';
import { Sculpt, box, type Probe } from './sculpt';

/**
 * The kit every pet is built from: the rig that bobs, blinks and turns ghostly, the bases with moving parts
 * (Homage, Jointed, Critter), and the little shared helpers for sculpting faces, eyes and markings.
 */

export interface Pet {
  root: THREE.Object3D;
  update(dt: number, t: number, moving: boolean): void;
  setGhost(on: boolean): void;
  dispose(): void;
}

export const sph = (w: number, h: number) => new THREE.SphereGeometry(1, w, h);
/** Spheres and cones for the little separate bits: round in the smooth finish, faceted with ?look=paper. */
export const gem = () => new THREE.IcosahedronGeometry(1, SMOOTH_LOOK ? 2 : 1);
/** How the bodies are shaded: smooth across gentle folds, or flat facets with ?look=paper. */
export const CREASE = SMOOTH_LOOK ? 60 : 0;
export const spike = (sides = 5) => new THREE.ConeGeometry(1, 1, sides);

/** Each pet's body is cut once, then shared. */
const bodies = new Map<string, THREE.BufferGeometry>();
export function sculpted(name: string, make: () => { sc: Sculpt; marks: Markings }, step = 0.026): THREE.BufferGeometry {
  let g = bodies.get(name);
  if (!g) {
    const { sc, marks } = make();
    g = sculptGeometry(sc, marks, step, name.length * 97);
    // Only position and colour, to merge with the builder's other bits.
    g.deleteAttribute('normal');
    bodies.set(name, g);
  }
  return g;
}

/** Inside a little oval patch (a blush, a shine), centred at `c` with radii `r`. */
export const patch = (c: Vec3, r: Vec3): Field => (q: Probe) => Math.hypot((q.p.x - c[0]) / r[0], (q.p.y - c[1]) / r[1], (q.p.z - c[2]) / r[2]) - 1;
export const either = (...fs: Field[]): Field => (q) => Math.min(...fs.map((f) => f(q)));
export const blushes = (y: number, z: number, x: number, r: number): Field => either(patch([x, y, z], [r, r * 0.7, r]), patch([-x, y, z], [r, r * 0.7, r]));
export const INK = '#231c1f';
export const BLUSH = '#f79aa8';

const GHOST = () =>
  new THREE.MeshStandardMaterial({ color: '#dfe9ff', emissive: '#9fc4ff', emissiveIntensity: 0.5, transparent: true, opacity: 0.55, roughness: 1 });

export function addEyes(b: Builder, y: number, z: number, x: number, r: number) {
  for (const s of [-1, 1]) {
    b.add(gem(), INK, { pos: [s * x, y, z], scale: [r, r * 1.15, r * 0.7] });
    b.add(new THREE.IcosahedronGeometry(1, SMOOTH_LOOK ? 1 : 0), '#fffdf8', { pos: [s * x + r * 0.35, y + r * 0.4, z + r * 0.55], scale: r * 0.32 });
  }
}

/** Common plumbing: a body mesh, an eye mesh that blinks, optional extra moving parts, and a ghost material. */
export class PetRig implements Pet {
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
    this.addMesh(body.mesh(material, { cast: true, receive: false, crease: CREASE }), this.bodyGroup, material);
    this.eyes.position.y = eyeY;
    const eg = eyes.geometry();
    eg.translate(0, -eyeY, 0);
    const em = eyeMaterial();
    this.materials.push(em);
    eg.computeVertexNormals();
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
export const hop = (t: number, move: number, height: number, rate = 11) => Math.abs(Math.sin(t * rate)) * height * move;

export const wrap = (a: number) => Math.atan2(Math.sin(a), Math.cos(a));
export const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
export const V = (p: Vec3) => new THREE.Vector3(...p);
/** A small round bead for little bits (pupils, irises, lights): fewer facets than `gem`. */
export const bead = () => new THREE.IcosahedronGeometry(1, 1);
/** Up and back down over an act (0 to 1), and nothing between acts (-1). */
export const bell = (u: number) => (u < 0 ? 0 : Math.sin(Math.PI * u));
/** Inside a marking only where all of these are. */
export const both = (...fs: Field[]): Field => (q) => Math.max(...fs.map((f) => f(q)));
/** Cuts off everything below the ground, so a sculpt stands flat. */
export const flatBase = (y = 0.004) => box('body', [0, y - 0.3, 0], [0.6, 0.3, 0.6], { carve: true, round: 0.004 });

/** A thin bent tube through some points (an arm, a grin, a twig). */
export function tube(b: Builder, pts: Vec3[], r: number, color: THREE.ColorRepresentation, sides = 5, at?: Place | THREE.Matrix4) {
  const g = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map(V)), Math.max(4, pts.length * 3), r, sides, false);
  b.add(g, color, at);
  g.dispose();
}

/** A flat cut-out from an outline (a lightning bolt, a wing), `depth` thick, lying in the x-y plane. */
export function cutout(outline: [number, number][] | THREE.Shape, depth: number, curveSegments = 4): THREE.BufferGeometry {
  const s = outline instanceof THREE.Shape ? outline : new THREE.Shape(outline.map(([x, y]) => new THREE.Vector2(x, y)));
  const g = new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: false, curveSegments });
  g.translate(0, 0, -depth / 2);
  return g;
}

/** How far forward a sculpt's surface is at (x, y), plus `lift`. */
export function frontZ(sc: Sculpt, x: number, y: number, lift = 0): number {
  let z = 0.45;
  while (z > -0.45 && sc.at(x, y, z) > 0) z -= 0.0015;
  return z + lift;
}
/** Points laid on a sculpt's front, just proud of it (a grin, a scar). */
export const onFront = (sc: Sculpt, pts: [number, number][], lift = 0.002): Vec3[] => pts.map(([x, y]) => [x, y, frontZ(sc, x, y, lift)]);
/** A frame sat on a sculpt's front at (x, y), `lift` out along the surface, its z pointing out: for setting eyes and badges on. */
export function onSurface(sc: Sculpt, x: number, y: number, lift = 0): THREE.Matrix4 {
  const z = frontZ(sc, x, y);
  const n = sc.grad(x, y, z);
  const across = new THREE.Vector3(0, 1, 0).cross(n).normalize();
  const up = n.clone().cross(across);
  return new THREE.Matrix4().makeBasis(across, up, n).setPosition(new THREE.Vector3(x, y, z).addScaledVector(n, lift));
}

/** A little act a pet puts on now and then (a puff, a wave, a beep): `step` says how far through it is (0 to 1), or -1 between times. */
export class Act {
  private wait: number;
  private at = -1;
  constructor(
    private min: number,
    private max: number,
    private len: number,
  ) {
    this.wait = 1 + Math.random() * min;
  }
  step(dt: number, can = true): number {
    if (this.at >= 0) {
      this.at += dt / this.len;
      if (this.at < 1) return this.at;
      this.at = -1;
      this.wait = this.min + Math.random() * (this.max - this.min);
    } else if (can && (this.wait -= dt) <= 0) this.at = 0;
    return this.at;
  }
}

/** A pet with moving parts on their own pivots (sharing the body's material), and eyes that can ride on one. */
export class Homage extends PetRig {
  protected mat: THREE.Material;
  /** How fast it's turning, in radians a second (to its left is +), for eyes and heads that look into a turn. */
  protected turn = 0;
  private lastRy: number | null = null;

  constructor(body: Builder, eyes: Builder, eyeY: number, mat: THREE.Material = soft()) {
    super(body, eyes, eyeY, mat);
    this.mat = mat;
  }

  /** A piece built in the pet's own space, hung on a pivot at `at` (also in the pet's space) so it can turn about it. */
  protected piece(b: Builder, at: Vec3, parent: THREE.Object3D = this.bodyGroup, mat = this.mat): THREE.Group {
    const g = new THREE.Group();
    parent.updateWorldMatrix(true, false);
    g.position.copy(parent.worldToLocal(V(at)));
    parent.add(g);
    const mesh = b.mesh(mat, { cast: true, receive: false, crease: CREASE });
    mesh.geometry.translate(-at[0], -at[1], -at[2]);
    this.addMesh(mesh, g, mat);
    return g;
  }

  /** Hangs the main body on a pivot at `at` instead (a ball that rolls, a cube that tumbles). */
  protected pivotBody(at: Vec3): THREE.Group {
    const body = this.bodyGroup.children[0];
    const g = new THREE.Group();
    g.position.set(...at);
    this.bodyGroup.add(g);
    g.add(body);
    body.position.set(-at[0], -at[1], -at[2]);
    return g;
  }

  /** Moves the blinking eyes onto a piece (a head that turns), keeping them where they are. */
  protected eyesOn(g: THREE.Object3D) {
    g.attach(this.eyes);
  }

  update(dt: number, t: number, moving: boolean) {
    const ry = this.root.rotation.y;
    if (this.lastRy !== null && dt > 0) this.turn += (wrap(ry - this.lastRy) / dt - this.turn) * Math.min(1, dt * 6);
    this.lastRy = ry;
    super.update(dt, t, moving);
  }
}

/** A pet with moving parts of its own (wings, ears, a jaw), each hung on a pivot. */
export class Jointed extends PetRig {
  /** A part built by `b` (placed relative to its pivot), on a pivot at `at` inside `parent`. */
  protected part(b: Builder, at: Vec3, parent: THREE.Object3D = this.bodyGroup, mat: THREE.Material = soft()): THREE.Group {
    const g = new THREE.Group();
    g.position.set(...at);
    parent.add(g);
    this.addMesh(b.mesh(mat, { cast: true, receive: false, crease: CREASE }), g, mat);
    return g;
  }

  /** Several copies of one part (legs, trail pieces, body segments), moved each frame with setMatrixAt. */
  protected copies(b: Builder, n: number, mat: THREE.Material = soft()): THREE.InstancedMesh {
    const m = new THREE.InstancedMesh(b.geometry(CREASE), mat, n);
    m.frustumCulled = false;
    this.addMesh(m, this.bodyGroup, mat);
    return m;
  }

  /** Moves the blinking eyes onto a part that turns (a head), leaving them where they were. */
  protected eyesOn(pivot: THREE.Group) {
    const p = pivot.position;
    this.eyes.position.set(-p.x, this.eyes.position.y - p.y, -p.z);
    pivot.add(this.eyes);
  }
}

const M4 = new THREE.Matrix4();
const Q4 = new THREE.Quaternion();
const E4 = new THREE.Euler();
const V4 = new THREE.Vector3();
const S4 = new THREE.Vector3();
/** Places copy `i` of an instanced part. */
export function placeCopy(m: THREE.InstancedMesh, i: number, pos: Vec3, rot: Vec3 = [0, 0, 0], scale: Vec3 = [1, 1, 1]) {
  m.setMatrixAt(i, M4.compose(V4.set(...pos), Q4.setFromEuler(E4.set(...rot)), S4.set(...scale)));
}

/** Little spots scattered over an ellipsoid's surface (where `keep` likes the direction), for speckles and fur. */
export function spots(seed: number, n: number, c: Vec3, r: Vec3, size: Vec3, keep: (d: THREE.Vector3) => boolean = () => true): Field {
  const R = rng(seed);
  const fs: Field[] = [];
  for (let tries = 0; fs.length < n && tries < n * 60; tries++) {
    const d = new THREE.Vector3(R() * 2 - 1, R() * 2 - 1, R() * 2 - 1);
    if (d.lengthSq() > 1 || d.lengthSq() < 0.01) continue;
    d.normalize();
    if (keep(d)) fs.push(patch([c[0] + d.x * r[0], c[1] + d.y * r[1], c[2] + d.z * r[2]], size));
  }
  return either(...fs);
}

/** Eyes with a coloured iris, a pupil and a shine (owls, chocobos, mogwai). */
export function irisEyes(b: Builder, y: number, z: number, x: number, r: number, iris: string, pupil = 0.55) {
  for (const s of [-1, 1]) {
    b.add(gem(), iris, { pos: [s * x, y, z], scale: [r, r * 1.08, r * 0.6] });
    b.add(gem(), INK, { pos: [s * x, y, z + r * 0.32], scale: [r * pupil, r * pupil * 1.1, r * 0.4] });
    b.add(new THREE.IcosahedronGeometry(1, SMOOTH_LOOK ? 1 : 0), '#fffdf8', { pos: [s * x + r * 0.3, y + r * 0.35, z + r * 0.62], scale: r * 0.3 });
  }
}

/** A little arc of a line (a mouth): `up` true for a frown, false for a smile. */
export const arc = (b: Builder, pos: Vec3, r: number, color: string, up: boolean, open = Math.PI, rot: Vec3 = [0, 0, 0]) =>
  b.add(new THREE.TorusGeometry(1, 0.2, 4, 10, open), color, { pos, rot: [rot[0], rot[1], (up ? 0 : Math.PI) + (Math.PI - open) / 2 + rot[2]], scale: r });

/** A tiny faceted pip (a toe, a pad): just twenty faces. */
export const pip = () => new THREE.IcosahedronGeometry(1, 0);

/** A pet with pieces on pivots and instanced copies (legs), that knows how fast it's going over the ground. */
export class Critter extends Homage {
  /** Its speed over the ground, smoothed, in metres a second (so a penguin can tell a walk from a run). */
  protected speed = 0;
  private lastAt: THREE.Vector3 | null = null;

  /** Several copies of one part (legs), moved each frame with placeCopy. */
  protected copies(b: Builder, n: number, mat = this.mat): THREE.InstancedMesh {
    const m = new THREE.InstancedMesh(b.geometry(CREASE), mat, n);
    m.frustumCulled = false;
    this.addMesh(m, this.bodyGroup, mat);
    return m;
  }

  update(dt: number, t: number, moving: boolean) {
    const p = this.root.position;
    if (this.lastAt && dt > 0) {
      const v = Math.min(12, Math.hypot(p.x - this.lastAt.x, p.z - this.lastAt.z) / dt);
      this.speed += (v - this.speed) * Math.min(1, dt * 4);
    }
    (this.lastAt ??= new THREE.Vector3()).copy(p);
    super.update(dt, t, moving);
  }
}
