import * as THREE from 'three';
import { Builder, SMOOTH_LOOK, eyeMaterial, glow, rng, soft, wet, type Place, type Vec3 } from './build';
import { all, regionOf, sculptGeometry, type Field, type Markings } from './forms';
import { Sculpt, box, ellipsoid, pyramid, rod, type Probe } from './sculpt';
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
/** Spheres and cones for the little separate bits: round in the smooth finish, faceted with ?look=paper. */
const gem = () => new THREE.IcosahedronGeometry(1, SMOOTH_LOOK ? 2 : 1);
/** How the bodies are shaded: smooth across gentle folds, or flat facets with ?look=paper. */
const CREASE = SMOOTH_LOOK ? 60 : 0;
const spike = (sides = 5) => new THREE.ConeGeometry(1, 1, sides);

/** Each pet's body is cut once, then shared. */
const bodies = new Map<string, THREE.BufferGeometry>();
function sculpted(name: string, make: () => { sc: Sculpt; marks: Markings }, step = 0.026): THREE.BufferGeometry {
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
const patch = (c: Vec3, r: Vec3): Field => (q: Probe) => Math.hypot((q.p.x - c[0]) / r[0], (q.p.y - c[1]) / r[1], (q.p.z - c[2]) / r[2]) - 1;
const either = (...fs: Field[]): Field => (q) => Math.min(...fs.map((f) => f(q)));
const blushes = (y: number, z: number, x: number, r: number): Field => either(patch([x, y, z], [r, r * 0.7, r]), patch([-x, y, z], [r, r * 0.7, r]));
const INK = '#231c1f';
const BLUSH = '#f79aa8';

const GHOST = () =>
  new THREE.MeshStandardMaterial({ color: '#dfe9ff', emissive: '#9fc4ff', emissiveIntensity: 0.5, transparent: true, opacity: 0.55, roughness: 1 });

function addEyes(b: Builder, y: number, z: number, x: number, r: number) {
  for (const s of [-1, 1]) {
    b.add(gem(), INK, { pos: [s * x, y, z], scale: [r, r * 1.15, r * 0.7] });
    b.add(new THREE.IcosahedronGeometry(1, SMOOTH_LOOK ? 1 : 0), '#fffdf8', { pos: [s * x + r * 0.35, y + r * 0.4, z + r * 0.55], scale: r * 0.32 });
  }
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
const hop = (t: number, move: number, height: number, rate = 11) => Math.abs(Math.sin(t * rate)) * height * move;

// ---------------------------------------------------------------- the pets

class Chick extends PetRig {
  constructor() {
    const b = new Builder();
    const yellow = '#f6d55c';
    const orange = '#f39a3a';
    b.addColored(
      sculpted('chick', () => {
        const sc = new Sculpt();
        sc.add(ellipsoid('body', [0, 0.15, 0], [0.14, 0.135, 0.13], { name: 'body' }));
        for (const s of [-1, 1]) sc.add(ellipsoid('body', [s * 0.13, 0.14, -0.01], [0.032, 0.06, 0.05], { rot: [0, 0, s * 0.5], k: 0.02, name: 'wing' }));
        for (const s of [-1, 1]) sc.add(ellipsoid('body', [s * 0.045, 0.014, 0.04], [0.032, 0.014, 0.038], { k: 0.02, name: 'foot' }));
        return {
          sc,
          marks: {
            base: yellow,
            marks: [
              { color: orange, f: regionOf(sc, 'foot') },
              { color: BLUSH, f: blushes(0.14, 0.11, 0.075, 0.022) },
              { color: '#f2c94a', f: regionOf(sc, 'wing') },
              { color: '#fbe58a', f: patch([0, 0.12, 0.13], [0.09, 0.08, 0.06]) },
            ],
          },
        };
      }),
    );
    // A little tuft and a beak.
    for (const [x, rz, h] of [
      [-0.015, 0.4, 0.05],
      [0.005, 0, 0.06],
      [0.022, -0.45, 0.045],
    ]) {
      b.add(spike(4), yellow, { pos: [x, 0.29, 0.0], rot: [0, 0, rz], scale: [0.016, h, 0.014] });
    }
    b.add(spike(4), orange, { pos: [0, 0.165, 0.135], rot: [Math.PI / 2, 0, 0], scale: [0.026, 0.04, 0.02] });
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
    // A soft dome of jelly sat flat on the ground, with a shine on top.
    b.addColored(
      sculpted('slime', () => {
        const sc = new Sculpt();
        sc.add(ellipsoid('body', [0, 0.09, 0], [0.16, 0.12, 0.15], { name: 'dome' }));
        sc.add(ellipsoid('body', [0, 0.04, 0], [0.17, 0.045, 0.16], { k: 0.04, name: 'base' }));
        sc.add(ellipsoid('body', [0, -0.5, 0], [0.6, 0.505, 0.6], { k: 0.01, carve: true }));
        return {
          sc,
          marks: {
            base: mint,
            marks: [
              { color: '#e2fff2', f: patch([-0.06, 0.19, 0.05], [0.035, 0.03, 0.03]) },
              { color: BLUSH, f: blushes(0.09, 0.13, 0.08, 0.022) },
              { color: '#5ac094', f: (q) => q.p.y - 0.035 },
            ],
          },
        };
      }),
    );
    const e = new Builder();
    addEyes(e, 0.12, 0.135, 0.045, 0.02);
    e.add(new THREE.TorusGeometry(1, 0.18, 4, 10, Math.PI), INK, { pos: [0, 0.085, 0.142], rot: [0, 0, Math.PI], scale: 0.016 });
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
    // A round top over a skirt that ends in soft scallops, and two little arms; it floats.
    b.addColored(
      sculpted('ghost', () => {
        const sc = new Sculpt();
        sc.add(ellipsoid('body', [0, 0.22, 0], [0.12, 0.12, 0.115], { name: 'top' }));
        sc.add(rod('body', [0, 0.2, 0], [0, 0.11, 0], 0.118, 0.13, { k: 0.04, name: 'skirt' }));
        for (let i = 0; i < 8; i++) {
          const a = (i / 8) * Math.PI * 2;
          sc.add(ellipsoid('body', [Math.sin(a) * 0.11, 0.085, Math.cos(a) * 0.105], [0.042, 0.038, 0.042], { k: 0.03, name: 'scallop' }));
        }
        for (const s of [-1, 1]) sc.add(ellipsoid('body', [s * 0.13, 0.17, 0.0], [0.026, 0.05, 0.028], { rot: [0, 0, s * 0.6], k: 0.03, name: 'arm' }));
        return { sc, marks: { base: white, marks: [{ color: BLUSH, f: blushes(0.2, 0.11, 0.06, 0.018) }] } };
      }),
    );
    const e = new Builder();
    for (const s of [-1, 1]) e.add(gem(), INK, { pos: [s * 0.04, 0.245, 0.105], scale: [0.016, 0.026, 0.01] });
    e.add(gem(), INK, { pos: [0, 0.2, 0.112], scale: [0.012, 0.014, 0.006] });
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
    b.addColored(
      sculpted('mouse', () => {
        const sc = new Sculpt();
        sc.add(ellipsoid('body', [0, 0.1, -0.01], [0.1, 0.095, 0.12], { name: 'body' }));
        sc.add(ellipsoid('body', [0, 0.15, 0.09], [0.08, 0.075, 0.075], { k: 0.04, name: 'head' }));
        sc.add(rod('body', [0, 0.145, 0.13], [0, 0.14, 0.19], 0.042, 0.016, { k: 0.02, name: 'snout' }));
        for (const s of [-1, 1]) sc.add(ellipsoid('body', [s * 0.07, 0.23, 0.07], [0.05, 0.05, 0.02], { rot: [0, 0, s * -0.3], k: 0.02, name: 'ear' }));
        for (const s of [-1, 1]) sc.add(ellipsoid('body', [s * 0.045, 0.012, 0.06], [0.018, 0.012, 0.026], { k: 0.015, name: 'foot' }));
        return {
          sc,
          marks: {
            base: grey,
            marks: [
              { color: pink, f: (q) => 0.183 - q.p.z },
              { color: pink, f: (q: Probe) => Math.max(regionOf(sc, 'ear')(q), Math.hypot(Math.abs(q.p.x) - 0.07, q.p.y - 0.228) - 0.032, 0.08 - q.p.z) },
              { color: pink, f: regionOf(sc, 'foot') },
              { color: BLUSH, f: blushes(0.13, 0.15, 0.05, 0.014) },
              { color: '#e8e2e6', f: patch([0, 0.08, 0.1], [0.065, 0.06, 0.04]) },
            ],
          },
        };
      }, 0.02),
    );
    for (const s of [-1, 1]) {
      for (const tilt of [-0.12, 0.12]) b.add(new THREE.BoxGeometry(1, 1, 1), '#6a6468', { pos: [s * 0.05, 0.14 + tilt * 0.05, 0.18], rot: [0, s * 0.35, s * tilt], scale: [0.07, 0.003, 0.003] });
    }
    const e = new Builder();
    addEyes(e, 0.17, 0.15, 0.03, 0.013);
    super(b, e, 0.17);
    // The tail, curling up behind, on its own pivot so it can swish.
    const tb = new Builder();
    const curve = new THREE.CatmullRomCurve3([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0.02, -0.08), new THREE.Vector3(0.03, 0.08, -0.14), new THREE.Vector3(0.0, 0.14, -0.12)]);
    const tg = new THREE.TubeGeometry(curve, 10, 0.008, 4, false);
    tb.add(tg, pink);
    tg.dispose();
    const tmat = soft();
    this.tail = this.addMesh(tb.mesh(tmat, { cast: true, receive: false, crease: CREASE }), this.bodyGroup, tmat);
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
    b.addColored(
      sculpted('bee', () => {
        const sc = new Sculpt();
        sc.add(ellipsoid('body', [0, 0, -0.01], [0.075, 0.07, 0.095], { name: 'body' }));
        sc.add(ellipsoid('body', [0, 0.01, 0.085], [0.055, 0.055, 0.055], { k: 0.02, name: 'head' }));
        return {
          sc,
          marks: {
            base: yellow,
            marks: [
              { color: black, f: (q: Probe) => Math.max(regionOf(sc, 'body')(q), Math.min(Math.abs(q.p.z + 0.035), Math.abs(q.p.z - 0.015)) - 0.012) },
              { color: BLUSH, f: blushes(-0.005, 0.12, 0.035, 0.012) },
            ],
          },
        };
      }, 0.018),
    );
    b.add(spike(4), black, { pos: [0, 0, -0.115], rot: [-Math.PI / 2, 0, 0], scale: [0.016, 0.035, 0.016] });
    for (const s of [-1, 1]) {
      const curve = new THREE.CatmullRomCurve3([new THREE.Vector3(s * 0.02, 0.05, 0.1), new THREE.Vector3(s * 0.035, 0.09, 0.12), new THREE.Vector3(s * 0.05, 0.11, 0.11)]);
      const g = new THREE.TubeGeometry(curve, 5, 0.004, 4, false);
      b.add(g, black);
      g.dispose();
      b.add(gem(), black, { pos: [s * 0.05, 0.11, 0.11], scale: 0.01 });
    }
    const e = new Builder();
    addEyes(e, 0.02, 0.13, 0.024, 0.012);
    super(b, e, 0.02);
    // Two see-through wings as one instanced mesh, flapping fast.
    const wb = new Builder();
    wb.add(sph(8, 4), '#f4fbff', { pos: [0.045, 0, 0], scale: [0.05, 0.004, 0.03] });
    wb.add(sph(6, 4), '#f4fbff', { pos: [0.035, 0, -0.035], scale: [0.035, 0.004, 0.022] });
    const wmat = soft();
    wmat.transparent = true;
    wmat.opacity = 0.55;
    wmat.depthWrite = false;
    wmat.side = THREE.DoubleSide;
    this.wings = new THREE.InstancedMesh(wb.geometry(0), wmat, 2);
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
    const sc0: Vec3 = [0, 0.13, -0.03];
    b.addColored(
      sculpted('snail', () => {
        const sc = new Sculpt();
        sc.add(ellipsoid('body', [0, 0.04, 0.02], [0.06, 0.04, 0.15], { name: 'foot' }));
        sc.add(ellipsoid('body', [0, 0.08, 0.12], [0.05, 0.055, 0.05], { k: 0.03, name: 'head' }));
        sc.add(ellipsoid('body', sc0, [0.085, 0.09, 0.085], { k: 0.012, name: 'shell' }));
        const onShell = regionOf(sc, 'shell');
        return {
          sc,
          marks: {
            base: body,
            marks: [
              // The spiral: two rings on each side of the shell.
              { color: line, f: (q: Probe) => Math.max(onShell(q), 0.05 - Math.abs(q.p.x), Math.min(Math.abs(Math.hypot(q.p.y - sc0[1], q.p.z - sc0[2]) - 0.058), Math.abs(Math.hypot(q.p.y - sc0[1] - 0.005, q.p.z - sc0[2] - 0.005) - 0.028)) - 0.009) },
              { color: shell, f: onShell },
              { color: BLUSH, f: blushes(0.075, 0.16, 0.03, 0.012) },
            ],
          },
        };
      }, 0.02),
    );
    for (const s of [-1, 1]) b.add(new THREE.CylinderGeometry(1, 1, 1, 5), body, { pos: [s * 0.022, 0.15, 0.13], rot: [0.2, 0, -s * 0.25], scale: [0.009, 0.09, 0.009] });
    const e = new Builder();
    for (const s of [-1, 1]) {
      e.add(gem(), '#fbf8f2', { pos: [s * 0.034, 0.2, 0.14], scale: 0.017 });
      e.add(gem(), INK, { pos: [s * 0.034, 0.2, 0.152], scale: [0.009, 0.01, 0.007] });
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

// ---------------------------------------------------------------- pop culture pets: fond storybook takes on favourites

const wrap = (a: number) => Math.atan2(Math.sin(a), Math.cos(a));
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const V = (p: Vec3) => new THREE.Vector3(...p);
/** A small round bead for little bits (pupils, irises, lights): fewer facets than `gem`. */
const bead = () => new THREE.IcosahedronGeometry(1, 1);
/** Up and back down over an act (0 to 1), and nothing between acts (-1). */
const bell = (u: number) => (u < 0 ? 0 : Math.sin(Math.PI * u));
/** Inside a marking only where all of these are. */
const both = (...fs: Field[]): Field => (q) => Math.max(...fs.map((f) => f(q)));
/** Cuts off everything below the ground, so a sculpt stands flat. */
const flatBase = (y = 0.004) => box('body', [0, y - 0.3, 0], [0.6, 0.3, 0.6], { carve: true, round: 0.004 });

/** A thin bent tube through some points (an arm, a grin, a twig). */
function tube(b: Builder, pts: Vec3[], r: number, color: THREE.ColorRepresentation, sides = 5, at?: Place | THREE.Matrix4) {
  const g = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map(V)), Math.max(4, pts.length * 3), r, sides, false);
  b.add(g, color, at);
  g.dispose();
}

/** A flat cut-out from an outline (a lightning bolt, a wing), `depth` thick, lying in the x-y plane. */
function cutout(outline: [number, number][] | THREE.Shape, depth: number, curveSegments = 4): THREE.BufferGeometry {
  const s = outline instanceof THREE.Shape ? outline : new THREE.Shape(outline.map(([x, y]) => new THREE.Vector2(x, y)));
  const g = new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: false, curveSegments });
  g.translate(0, 0, -depth / 2);
  return g;
}

/** How far forward a sculpt's surface is at (x, y), plus `lift`. */
function frontZ(sc: Sculpt, x: number, y: number, lift = 0): number {
  let z = 0.45;
  while (z > -0.45 && sc.at(x, y, z) > 0) z -= 0.0015;
  return z + lift;
}
/** Points laid on a sculpt's front, just proud of it (a grin, a scar). */
const onFront = (sc: Sculpt, pts: [number, number][], lift = 0.002): Vec3[] => pts.map(([x, y]) => [x, y, frontZ(sc, x, y, lift)]);
/** A frame sat on a sculpt's front at (x, y), `lift` out along the surface, its z pointing out: for setting eyes and badges on. */
function onSurface(sc: Sculpt, x: number, y: number, lift = 0): THREE.Matrix4 {
  const z = frontZ(sc, x, y);
  const n = sc.grad(x, y, z);
  const across = new THREE.Vector3(0, 1, 0).cross(n).normalize();
  const up = n.clone().cross(across);
  return new THREE.Matrix4().makeBasis(across, up, n).setPosition(new THREE.Vector3(x, y, z).addScaledVector(n, lift));
}

/** A little act a pet puts on now and then (a puff, a wave, a beep): `step` says how far through it is (0 to 1), or -1 between times. */
class Act {
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
class Homage extends PetRig {
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

/** A yellow electric mouse with red cheeks and a lightning-bolt tail, crackling now and then. */
class Sparky extends Homage {
  private tail: THREE.Group;
  private sparks: THREE.Group;
  private zap = new Act(4, 9, 0.8);
  constructor() {
    const yellow = '#f8d23a';
    const brown = '#94582a';
    const sc = new Sculpt();
    sc.add(ellipsoid('body', [0, 0.1, -0.005], [0.083, 0.09, 0.075], { name: 'body' }));
    sc.add(ellipsoid('body', [0, 0.215, 0.012], [0.098, 0.082, 0.085], { k: 0.035, name: 'head' }));
    for (const s of [-1, 1]) {
      sc.add(rod('body', [s * 0.05, 0.27, -0.005], [s * 0.118, 0.405, -0.02], 0.026, 0.006, { k: 0.02, name: 'ear', squash: [1, 1, 0.7], thin: true }));
      sc.add(ellipsoid('body', [s * 0.055, 0.125, 0.06], [0.022, 0.03, 0.022], { rot: [0.4, 0, s * 0.3], k: 0.015, name: 'arm' }));
      sc.add(ellipsoid('body', [s * 0.045, 0.014, 0.035], [0.03, 0.016, 0.042], { k: 0.02, name: 'foot' }));
    }
    const cheek = (s: number) => patch([s * 0.064, 0.197, frontZ(sc, s * 0.064, 0.197)], [0.021, 0.021, 0.021]);
    const b = new Builder();
    b.addColored(
      sculpted(
        'zapmouse',
        () => {
          const onBody = regionOf(sc, 'body');
          return {
            sc,
            marks: {
              base: yellow,
              marks: [
                { color: INK, f: both(regionOf(sc, 'ear'), (q) => 0.355 - q.p.y) },
                { color: '#e64a3c', f: either(cheek(-1), cheek(1)) },
                // Two brown stripes across the back.
                { color: brown, f: both(onBody, (q) => q.p.z + 0.03, (q) => Math.abs(q.p.x) - 0.062, (q) => Math.min(Math.abs(q.p.y - 0.118), Math.abs(q.p.y - 0.07)) - 0.012) },
              ],
            },
          };
        },
        0.022,
      ),
    );
    b.add(gem(), INK, { pos: [0, 0.212, frontZ(sc, 0, 0.212)], scale: [0.008, 0.006, 0.005] });
    for (const s of [-1, 1]) b.add(new THREE.TorusGeometry(1, 0.2, 3, 8, Math.PI), INK, { pos: [s * 0.0085, 0.197, frontZ(sc, s * 0.0085, 0.197, -0.001)], rot: [0, 0, Math.PI], scale: 0.0085 });
    const e = new Builder();
    addEyes(e, 0.232, frontZ(sc, 0.04, 0.232) - 0.005, 0.04, 0.016);
    super(b, e, 0.232);
    // The tail, a zigzag bolt laid up and back from the rump, brown at the root.
    const tb = new Builder();
    const tailAt: Vec3 = [0, 0.045, -0.058];
    const bolt: [number, number][] = [[0.006, 0.03], [0.042, 0.03], [0.05, 0.05], [0.1, 0.04], [0.15, 0.16], [0.08, 0.19], [0.065, 0.09], [0.02, 0.1]];
    const root: [number, number][] = [[0, 0], [0.03, 0], [0.042, 0.03], [0.006, 0.03]];
    for (const [shape, color] of [[bolt, yellow], [root, brown]] as const) {
      const g = cutout([...shape], 0.016);
      tb.add(g, color, { pos: tailAt, rot: [0, Math.PI / 2, 0] });
      g.dispose();
    }
    this.tail = this.piece(tb, tailAt);
    // Sparks off the cheeks.
    const sb = new Builder();
    for (const s of [-1, 1]) {
      for (const [dy, a] of [[0.01, 0.5], [-0.02, -0.3]]) {
        const g = cutout([[0, 0], [0.014, 0.012], [0.01, 0.016], [0.03, 0.024], [0.012, 0.022], [0.016, 0.018]], 0.004);
        sb.add(g, '#fff6a0', { pos: [s * 0.095, 0.2 + dy, 0.06], rot: [0, s > 0 ? 0 : Math.PI, a] });
        g.dispose();
      }
    }
    this.sparks = this.piece(sb, [0, 0.2, 0.06], this.bodyGroup, glow('#fff3a0', 1.4));
    this.sparks.visible = false;
  }
  protected animate(dt: number, t: number, move: number) {
    const z = this.zap.step(dt, move < 0.3);
    this.bodyGroup.position.y = hop(t, move, 0.05, 12) + Math.sin(t * 2.6) * 0.004 * (1 - move) + bell(z) * 0.015;
    this.bodyGroup.rotation.x = move * 0.14;
    this.bodyGroup.rotation.z = Math.sin(t * 0.8) * 0.07 * (1 - move);
    this.tail.rotation.y = Math.sin(t * 3.1) * 0.22 * (1 - move) + Math.sin(t * 12) * 0.15 * move;
    this.tail.rotation.x = -move * 0.25;
    this.sparks.visible = z >= 0 && Math.sin(z * 70) > -0.3;
    this.sparks.scale.setScalar(0.85 + Math.sin(t * 53) * 0.2);
  }
}

/** A tiny green foundling with great big ears, bundled in a little brown robe. */
class Sage extends Homage {
  private head: THREE.Group;
  constructor() {
    const green = '#a3c48c';
    const robe = new Sculpt();
    robe.add(rod('body', [0, 0.14, 0], [0, 0.06, 0], 0.045, 0.068, { name: 'robe' }));
    robe.add(ellipsoid('body', [0, 0.135, 0], [0.066, 0.03, 0.062], { k: 0.012, name: 'collar' }));
    // Sleeves meeting in front, little hands peeping out of them.
    for (const s of [-1, 1]) {
      robe.add(ellipsoid('body', [s * 0.042, 0.1, 0.042], [0.024, 0.026, 0.032], { rot: [0, -s * 0.5, 0], k: 0.012, name: 'sleeve' }));
      robe.add(ellipsoid('body', [s * 0.022, 0.098, 0.072], [0.015, 0.014, 0.013], { k: 0.004, name: 'hand' }));
    }
    robe.add(flatBase());
    const b = new Builder();
    b.addColored(
      sculpted('sage-robe', () => ({
        sc: robe,
        marks: {
          base: '#a47f57',
          marks: [
            { color: green, f: regionOf(robe, 'hand') },
            { color: '#cbb38c', f: regionOf(robe, 'collar') },
            { color: '#8c6a47', f: (q) => q.p.y - 0.02 },
          ],
        },
      })),
    );
    const head = new Sculpt();
    head.add(ellipsoid('body', [0, 0.205, 0.005], [0.068, 0.058, 0.062], { name: 'head' }));
    head.add(ellipsoid('body', [0, 0.222, -0.006], [0.072, 0.048, 0.057], { k: 0.03, name: 'head' }));
    head.add(ellipsoid('body', [0, 0.19, 0.064], [0.011, 0.008, 0.007], { k: 0.012, name: 'nose' }));
    // The ears: wide at the root, tapering out to points, a touch up and back.
    const earA = 0.055;
    const earB = 0.19;
    for (const s of [-1, 1]) head.add(rod('body', [s * earA, 0.215, -0.004], [s * earB, 0.238, -0.032], 0.034, 0.009, { k: 0.02, name: 'ear', squash: [1, 0.85, 0.55], thin: true }));
    const onEar = regionOf(head, 'ear');
    const inner: Field = (q) => {
      const t = (Math.abs(q.p.x) - earA) / (earB - earA);
      const half = (0.034 + (0.009 - 0.034) * t) * 0.85;
      return Math.max(onEar(q), -0.004 - t * 0.028 + 0.003 - q.p.z, Math.abs(q.p.y - (0.215 + t * 0.023)) - half * 0.55, 0.12 - t, t - 0.8);
    };
    const hb = new Builder();
    hb.addColored(sculpted('sage-head', () => ({ sc: head, marks: { base: green, marks: [{ color: '#d8a89a', f: inner }] } }), 0.018));
    tube(hb, onFront(head, [[-0.012, 0.177], [0, 0.173], [0.012, 0.177]], 0.001), 0.0024, '#5a4a3e', 4);
    // A few wisps of white baby hair.
    for (const [x, lean] of [[-0.02, -0.4], [0.004, 0.1], [0.024, 0.5]]) tube(hb, [[x, 0.262, -0.01], [x + lean * 0.01, 0.282, -0.012], [x + lean * 0.025, 0.29, -0.02]], 0.0022, '#efe9da', 3);
    const e = new Builder();
    addEyes(e, 0.207, frontZ(head, 0.03, 0.207) - 0.007, 0.03, 0.019);
    super(b, e, 0.207);
    this.head = this.piece(hb, [0, 0.15, 0]);
    this.eyesOn(this.head);
  }
  protected animate(_dt: number, t: number, move: number) {
    // A toddler's waddle going along; still, the head tips this way and that, curious.
    this.bodyGroup.position.y = hop(t, move, 0.018, 10);
    this.bodyGroup.rotation.z = Math.sin(t * 10) * 0.09 * move;
    this.bodyGroup.rotation.x = move * 0.08;
    this.head.rotation.z = Math.sin(t * 0.7) * 0.16 * (1 - move) - Math.sin(t * 10) * 0.05 * move;
    this.head.rotation.x = Math.sin(t * 1.1) * 0.05;
    this.head.rotation.y = clamp(this.turn * 0.12, -0.4, 0.4);
  }
}

/** A big round grey forest spirit with a pale chevroned belly and a leaf on its head. */
class Spirit extends Homage {
  private leaf: THREE.Group;
  constructor() {
    const sc = new Sculpt();
    sc.add(ellipsoid('body', [0, 0.175, 0], [0.13, 0.16, 0.115], { name: 'body' }));
    sc.add(ellipsoid('body', [0, 0.105, 0.01], [0.148, 0.1, 0.13], { k: 0.06, name: 'body' }));
    for (const s of [-1, 1]) {
      sc.add(rod('body', [s * 0.055, 0.3, -0.005], [s * 0.072, 0.385, -0.012], 0.024, 0.007, { k: 0.025, name: 'ear', thin: true }));
      sc.add(ellipsoid('body', [s * 0.128, 0.16, 0.02], [0.03, 0.065, 0.036], { rot: [0, 0, s * 0.22], k: 0.03, name: 'arm' }));
      sc.add(ellipsoid('body', [s * 0.06, 0.014, 0.075], [0.038, 0.018, 0.04], { k: 0.03, name: 'foot' }));
    }
    sc.add(flatBase());
    const grey = '#7c8386';
    const b = new Builder();
    b.addColored(
      sculpted('spirit', () => ({
        sc,
        marks: {
          base: grey,
          marks: [
            { color: '#ece5cc', f: both(patch([0, 0.125, 0.125], [0.1, 0.12, 0.09]), (q) => 0.03 - q.p.z) },
            { color: '#f1ece0', f: both(regionOf(sc, 'foot'), (q) => 0.09 - q.p.z) },
          ],
        },
      }), 0.03),
    );
    // The chevrons on the belly: three over four, little arrowheads pointing up.
    const dark = '#5d6467';
    const arm = new THREE.BoxGeometry(1, 1, 1);
    for (const [y, xs] of [[0.19, [-0.034, 0, 0.034]], [0.152, [-0.05, -0.017, 0.017, 0.05]]] as const) {
      for (const x of xs) {
        const at = onSurface(sc, x, y, 0.001);
        for (const s of [-1, 1]) b.add(arm, dark, { pos: [s * 0.0075, -0.004, 0], rot: [0, 0, -s * 0.6], scale: [0.02, 0.0055, 0.004] }, at);
      }
    }
    arm.dispose();
    b.add(bead(), INK, { pos: [0, 0.252, frontZ(sc, 0, 0.252, -0.002)], scale: [0.016, 0.008, 0.007] });
    tube(b, onFront(sc, [[-0.026, 0.232], [-0.012, 0.226], [0, 0.225], [0.012, 0.226], [0.026, 0.232]], 0.001), 0.0026, INK, 4);
    // Whiskers.
    for (const s of [-1, 1]) {
      for (const [dy, a] of [[0.006, 0.15], [-0.004, 0], [-0.014, -0.15]]) {
        const x = s * 0.07;
        const y = 0.24 + dy;
        b.add(new THREE.BoxGeometry(1, 1, 1), '#3b3f42', { pos: [s * 0.096, y + a * 0.03, frontZ(sc, x, y) - 0.012], rot: [0, -s * 0.5, s * a], scale: [0.055, 0.0025, 0.0025] });
      }
    }
    const e = new Builder();
    for (const s of [-1, 1]) {
      const at = onSurface(sc, s * 0.058, 0.265, -0.004);
      e.add(gem(), '#fbf8f0', { scale: [0.022, 0.022, 0.012] }, at);
      e.add(bead(), INK, { pos: [0, 0, 0.009], scale: [0.011, 0.011, 0.006] }, at);
      e.add(new THREE.IcosahedronGeometry(1, 1), '#ffffff', { pos: [0.004, 0.004, 0.014], scale: 0.0035 }, at);
    }
    super(b, e, 0.265);
    // A leaf worn like a hat, with its stalk.
    const lb = new Builder();
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.quadraticCurveTo(0.065, 0.05, 0, 0.13);
    shape.quadraticCurveTo(-0.065, 0.05, 0, 0);
    const g = cutout(shape, 0.006, 5);
    const leafAt = new THREE.Matrix4().compose(V([0.0, 0.338, 0.0]), new THREE.Quaternion().setFromEuler(new THREE.Euler(-0.95, 0.6, 0.15)), new THREE.Vector3(1, 1, 1));
    lb.add(g, '#5ea847', { pos: [0, 0.01, 0] }, leafAt);
    g.dispose();
    tube(lb, [[0, 0.012, 0.004], [0, 0.07, 0.005], [0, 0.125, 0.004]], 0.0018, '#4a8a38', 3, leafAt);
    tube(lb, [[0, 0.012, 0], [0, -0.006, 0.006], [0.004, -0.016, 0.016]], 0.0025, '#4a8a38', 3, leafAt);
    this.leaf = this.piece(lb, [0, 0.335, 0]);
  }
  protected animate(_dt: number, t: number, move: number) {
    // A big contented waddle, side to side; still, it breathes deep and the leaf nods.
    this.bodyGroup.rotation.z = Math.sin(t * 6) * 0.09 * move;
    this.bodyGroup.position.y = Math.abs(Math.sin(t * 6)) * 0.018 * move;
    const breathe = 1 + Math.sin(t * 1.6) * 0.018 * (1 - move);
    this.bodyGroup.scale.set(1 + (breathe - 1) * 0.6, breathe, 1 + (breathe - 1) * 0.6);
    this.leaf.rotation.z = Math.sin(t * 2.2) * 0.1 + Math.sin(t * 6) * 0.12 * move;
    this.leaf.rotation.x = Math.sin(t * 1.7) * 0.06;
  }
}

/** A fuzzy little soot sprite with big round eyes, carrying a star sweet over its head. */
class Soot extends Homage {
  private sweet: THREE.Group;
  private jump = new Act(2, 5, 0.45);
  constructor() {
    const ink = '#1e1a1f';
    const b = new Builder();
    const c: Vec3 = [0, 0.125, 0];
    b.add(sph(12, 9), ink, { pos: c, scale: 0.07 });
    // Fuzz: little spikes all over, except round the eyes.
    const up = new THREE.Vector3(0, 1, 0);
    const n = 64;
    for (let i = 0; i < n; i++) {
      const y = 1 - (2 * (i + 0.5)) / n;
      const r = Math.sqrt(1 - y * y);
      const d = new THREE.Vector3(Math.cos(i * 2.39996) * r, y, Math.sin(i * 2.39996) * r);
      if (d.z > 0.6 && Math.abs(d.y - 0.1) < 0.45) continue;
      const len = 0.03 + ((i * 37) % 7) * 0.003;
      const m = new THREE.Matrix4().compose(V(c).addScaledVector(d, 0.064 + len / 2), new THREE.Quaternion().setFromUnitVectors(up, d), new THREE.Vector3(0.013, len, 0.013));
      b.add(spike(4), i % 3 ? '#262127' : ink, m);
    }
    // Spindly legs.
    for (const s of [-1, 1]) tube(b, [[s * 0.025, 0.07, 0], [s * 0.032, 0.03, 0.006], [s * 0.034, 0.004, 0.012]], 0.0035, ink, 3);
    const e = new Builder();
    for (const s of [-1, 1]) {
      e.add(gem(), '#fbfaf4', { pos: [s * 0.03, 0.138, 0.058], scale: [0.023, 0.025, 0.014] });
      e.add(bead(), INK, { pos: [s * 0.028, 0.136, 0.072], scale: [0.009, 0.01, 0.005] });
      e.add(new THREE.IcosahedronGeometry(1, 0), '#ffffff', { pos: [s * 0.028 + 0.004, 0.141, 0.076], scale: 0.003 });
    }
    super(b, e, 0.138);
    // Arms up, holding a pink star sweet (a sugar sweet with little knobs all over).
    const sb = new Builder();
    for (const s of [-1, 1]) tube(sb, [[s * 0.06, 0.15, 0.02], [s * 0.05, 0.2, 0.03], [s * 0.016, 0.238, 0.034]], 0.0035, ink, 3);
    const sweetAt: Vec3 = [0, 0.252, 0.034];
    sb.add(new THREE.IcosahedronGeometry(1, 0), '#ffb3d2', { pos: sweetAt, scale: 0.02 });
    const ico = new THREE.IcosahedronGeometry(1, 0).toNonIndexed();
    const pos = ico.getAttribute('position');
    const seen = new Set<string>();
    for (let i = 0; i < pos.count; i++) {
      const d = new THREE.Vector3().fromBufferAttribute(pos, i).normalize();
      const key = d.toArray().map((v) => v.toFixed(2)).join();
      if (seen.has(key)) continue;
      seen.add(key);
      sb.add(spike(4), '#ffd3e6', new THREE.Matrix4().compose(V(sweetAt).addScaledVector(d, 0.022), new THREE.Quaternion().setFromUnitVectors(up, d), new THREE.Vector3(0.008, 0.012, 0.008)));
    }
    ico.dispose();
    this.sweet = this.piece(sb, c);
  }
  protected animate(dt: number, t: number, move: number) {
    // Scurries in quick little hops; still, it shivers and now and then jumps for joy.
    const j = this.jump.step(dt, move < 0.3);
    const up = hop(t, move, 0.06, 14) + bell(j) * 0.07;
    this.bodyGroup.position.y = up;
    const land = Math.max(0, 0.02 - up) * 6;
    this.bodyGroup.scale.set(1 + land, 1 - land, 1 + land);
    this.bodyGroup.rotation.z = Math.sin(t * 31) * 0.025 * (1 - move);
    this.bodyGroup.rotation.x = move * 0.12;
    this.sweet.rotation.z = Math.sin(t * 3) * 0.08;
    this.sweet.position.y = 0.125 + Math.sin(t * 5) * 0.004;
  }
}

/** A mischievous blue alien with big ears, a big nose and a cheeky grin. */
class Rascal extends Homage {
  private head: THREE.Group;
  private ears: THREE.Group[] = [];
  private flick = new Act(1.5, 4, 0.5);
  private flickSide = 1;
  constructor() {
    const blue = '#4b7fd6';
    const pale = '#a7c9f2';
    const dark = '#2f5aa8';
    const sc = new Sculpt();
    sc.add(ellipsoid('body', [0, 0.095, -0.005], [0.06, 0.066, 0.055], { name: 'body' }));
    for (const s of [-1, 1]) {
      sc.add(ellipsoid('body', [s * 0.038, 0.035, 0.008], [0.03, 0.032, 0.034], { k: 0.02, name: 'leg' }));
      sc.add(ellipsoid('body', [s * 0.044, 0.011, 0.03], [0.026, 0.012, 0.03], { k: 0.015, name: 'foot' }));
      sc.add(rod('body', [s * 0.05, 0.128, 0.008], [s * 0.074, 0.082, 0.036], 0.02, 0.016, { k: 0.015, name: 'arm' }));
    }
    sc.add(flatBase());
    const b = new Builder();
    b.addColored(
      sculpted('rascal', () => ({
        sc,
        marks: {
          base: blue,
          marks: [
            { color: pale, f: both(patch([0, 0.085, 0.052], [0.04, 0.05, 0.03]), (q) => 0.02 - q.p.z) },
            { color: dark, f: both((q) => q.p.z + 0.03, (q) => Math.abs(q.p.x) - 0.032, (q) => Math.abs(q.p.y - 0.1) - 0.035) },
          ],
        },
      })),
    );
    const hs = new Sculpt();
    hs.add(ellipsoid('body', [0, 0.205, 0.01], [0.094, 0.068, 0.075], { name: 'head' }));
    hs.add(ellipsoid('body', [0, 0.19, 0.08], [0.034, 0.024, 0.022], { k: 0.02, name: 'nose' }));
    const hb = new Builder();
    hb.addColored(
      sculpted(
        'rascal-head',
        () => ({
          sc: hs,
          marks: {
            base: blue,
            marks: [
              { color: '#24365f', f: regionOf(hs, 'nose') },
              { color: '#8db8ef', f: either(patch([0.045, 0.222, 0.07], [0.032, 0.03, 0.03]), patch([-0.045, 0.222, 0.07], [0.032, 0.03, 0.03])) },
              { color: dark, f: (q) => 0.255 - q.p.y },
            ],
          },
        }),
        0.022,
      ),
    );
    // A lopsided grin with one little fang.
    tube(hb, onFront(hs, [[-0.05, 0.176], [-0.026, 0.166], [0, 0.163], [0.028, 0.168], [0.052, 0.184]], 0.0), 0.0045, '#1a2340', 4);
    hb.add(new THREE.BoxGeometry(1, 1, 1), '#ffffff', { pos: [0.02, 0.159, frontZ(hs, 0.02, 0.159, -0.001)], rot: [0, 0, 0.1], scale: [0.007, 0.008, 0.004] });
    // A tuft on top.
    for (const [x, z, rz] of [[0, 0.0, 0], [-0.013, -0.008, 0.4], [0.013, -0.008, -0.4]]) hb.add(spike(4), dark, { pos: [x, 0.275, z], rot: [-0.2, 0, rz], scale: [0.007, 0.022, 0.007] });
    const e = new Builder();
    addEyes(e, 0.224, frontZ(hs, 0.046, 0.224) - 0.007, 0.046, 0.021);
    super(b, e, 0.224);
    this.head = this.piece(hb, [0, 0.15, 0]);
    this.eyesOn(this.head);
    // The ears, each on its own pivot so they can flick and fold back.
    for (const s of [-1, 1]) {
      const es = new Sculpt();
      const ear = ellipsoid('body', [s * 0.13, 0.265, -0.03], [0.07, 0.04, 0.016], { rot: [0, s * 0.3, s * 0.5], name: 'ear', thin: true });
      es.add(ear);
      const eb = new Builder();
      eb.addColored(
        sculpted(
          `rascal-ear${s}`,
          () => ({
            sc: es,
            marks: {
              base: blue,
              marks: [
                {
                  color: '#d98fb8',
                  f: (q) => {
                    const u = ear.unit!(q.p);
                    return Math.max(Math.hypot((u.x - s * 0.12) / 0.7, u.y / 0.55) - 1, -u.z);
                  },
                },
              ],
            },
          }),
          0.016,
        ),
      );
      this.ears.push(this.piece(eb, [s * 0.075, 0.235, -0.015], this.head));
    }
  }
  protected animate(dt: number, t: number, move: number) {
    // Scampers along leaning in, ears folded back; still, a cheeky head tilt and an ear that flicks now and then.
    const f = this.flick.step(dt);
    if (f === 0) this.flickSide = Math.random() < 0.5 ? -1 : 1;
    this.bodyGroup.position.y = hop(t, move, 0.04, 13);
    this.bodyGroup.rotation.x = move * 0.18;
    this.head.rotation.z = Math.sin(t * 0.9) * 0.14 * (1 - move);
    this.head.rotation.x = -move * 0.1 + Math.sin(t * 1.3) * 0.03;
    this.head.rotation.y = clamp(this.turn * 0.12, -0.4, 0.4);
    this.ears.forEach((ear, i) => {
      const s = i ? 1 : -1;
      ear.rotation.y = s * 0.5 * move;
      ear.rotation.z = -s * (s === this.flickSide ? bell(f) * 0.6 : 0) - s * 0.15 * move;
    });
  }
}

/** A little walking tree sapling with a face, that dances when it thinks no one's looking. */
class Sprout extends Homage {
  private arms: THREE.Group[] = [];
  private sprig: THREE.Group;
  private dance = new Act(4, 9, 3.2);
  constructor() {
    const bark = '#8e5f39';
    const sc = new Sculpt();
    sc.add(rod('body', [0, 0.065, 0], [0, 0.15, 0.004], 0.03, 0.028, { name: 'trunk' }));
    sc.add(ellipsoid('body', [0, 0.215, 0.008], [0.066, 0.07, 0.062], { k: 0.03, name: 'head' }));
    sc.add(ellipsoid('body', [0, 0.245, -0.004], [0.06, 0.05, 0.055], { k: 0.03, name: 'head' }));
    for (const s of [-1, 1]) {
      sc.add(rod('body', [s * 0.02, 0.07, 0], [s * 0.026, 0.015, 0.008], 0.016, 0.015, { k: 0.012, name: 'leg' }));
      sc.add(ellipsoid('body', [s * 0.027, 0.01, 0.018], [0.018, 0.01, 0.022], { k: 0.01, name: 'foot' }));
    }
    sc.add(flatBase());
    const face = both(patch([0, 0.205, 0.07], [0.05, 0.052, 0.035]), (q) => 0.03 - q.p.z);
    const b = new Builder();
    b.addColored(
      sculpted(
        'sprout',
        () => ({
          sc,
          marks: {
            base: bark,
            marks: [
              { color: '#a8744a', f: face },
              // Bark grooves running up and round.
              { color: '#6a4427', f: (q) => Math.abs(Math.sin(Math.atan2(q.p.x, q.p.z) * 4 + q.p.y * 18)) - 0.3 },
            ],
          },
        }),
        0.02,
      ),
    );
    tube(b, onFront(sc, [[-0.014, 0.184], [0, 0.179], [0.014, 0.184]], 0.001), 0.0028, '#4a2c18', 4);
    const e = new Builder();
    addEyes(e, 0.215, frontZ(sc, 0.028, 0.215) - 0.006, 0.028, 0.019);
    super(b, e, 0.215);
    // Twiggy arms with little twig fingers.
    for (const s of [-1, 1]) {
      const ab = new Builder();
      tube(ab, [[s * 0.026, 0.142, 0], [s * 0.048, 0.112, 0.006], [s * 0.058, 0.08, 0.014]], 0.009, bark, 5);
      for (const a of [-0.5, 0, 0.5]) ab.add(spike(4), bark, { pos: [s * 0.06, 0.07, 0.016], rot: [Math.PI + a * 0.4, 0, a * s * 0.6], scale: [0.005, 0.022, 0.005] });
      this.arms.push(this.piece(ab, [s * 0.026, 0.142, 0]));
    }
    // A sprig on top with three leaves.
    const lb = new Builder();
    const twig = '#7a5232';
    const leafy = '#7cc04f';
    tube(lb, [[0.006, 0.285, -0.006], [0.014, 0.315, -0.01], [0.03, 0.342, -0.006]], 0.0045, twig, 4);
    tube(lb, [[0.013, 0.31, -0.01], [-0.004, 0.325, -0.008], [-0.016, 0.338, -0.006]], 0.0032, twig, 4);
    lb.add(sph(8, 5), leafy, { pos: [0.044, 0.35, -0.004], rot: [0, 0, 0.45], scale: [0.019, 0.005, 0.011] });
    lb.add(sph(8, 5), leafy, { pos: [-0.026, 0.343, -0.006], rot: [0, 0, -0.5], scale: [0.016, 0.0045, 0.01] });
    lb.add(sph(8, 5), '#8fce62', { pos: [0.02, 0.33, 0.008], rot: [0.5, 0.6, 0.2], scale: [0.013, 0.004, 0.008] });
    this.sprig = this.piece(lb, [0.006, 0.285, -0.006]);
  }
  protected animate(dt: number, t: number, move: number) {
    const d = this.dance.step(dt, move < 0.2);
    const dancing = bell(d) > 0 ? Math.min(1, bell(d) * 4) : 0;
    const beat = d * Math.PI * 12;
    // Stiff little steps going along; the dance is a bob, a sway and arms that pump in turn.
    this.bodyGroup.position.y = hop(t, move, 0.015, 9) + Math.abs(Math.sin(beat)) * 0.015 * dancing;
    this.bodyGroup.rotation.z = Math.sin(t * 9) * 0.1 * move + Math.sin(beat / 2) * 0.14 * dancing;
    this.bodyGroup.rotation.x = move * 0.06;
    this.arms.forEach((arm, i) => {
      const s = i ? 1 : -1;
      arm.rotation.x = s * Math.sin(t * 9) * 0.5 * move + Math.sin(beat + i * Math.PI) * 0.5 * dancing;
      arm.rotation.z = s * (0.15 + Math.sin(t * 1.4 + i) * 0.05) * (1 - dancing) + s * 0.9 * dancing;
    });
    this.sprig.rotation.z = Math.sin(t * 1.9) * 0.1 + Math.sin(beat / 2) * 0.15 * dancing;
  }
}

/** A yellow capsule of a henchman in goggles and denim overalls, who waves hello now and then. */
class Henchling extends Homage {
  private arms: THREE.Group[] = [];
  private wave = new Act(5, 9, 1.6);
  constructor() {
    const denim = '#3f6fb4';
    const sc = new Sculpt();
    sc.add(rod('body', [0, 0.085, 0], [0, 0.21, 0], 0.068, 0.068, { name: 'body' }));
    for (const s of [-1, 1]) {
      sc.add(rod('body', [s * 0.026, 0.035, 0], [s * 0.027, 0.015, 0.004], 0.019, 0.018, { k: 0.012, name: 'leg' }));
      sc.add(ellipsoid('body', [s * 0.028, 0.011, 0.012], [0.021, 0.012, 0.027], { k: 0.01, name: 'shoe' }));
    }
    sc.add(flatBase());
    const b = new Builder();
    b.addColored(
      sculpted(
        'henchling',
        () => {
          const onLeg = regionOf(sc, 'leg');
          return {
            sc,
            marks: {
              base: '#f7d84a',
              marks: [
                { color: '#2a2a2e', f: regionOf(sc, 'shoe') },
                { color: '#335f9e', f: both(patch([0, 0.124, 0.068], [0.017, 0.012, 0.02]), (q) => 0.03 - q.p.z) },
                // Overalls: the trousers, the bib and its straps.
                { color: denim, f: (q) => Math.min(onLeg(q), q.p.y - 0.1, Math.max(Math.abs(q.p.x) - 0.04, q.p.y - 0.152, 0.02 - q.p.z)) },
                { color: denim, f: (q) => Math.max(Math.abs(Math.abs(q.p.x) - (0.034 + (q.p.y - 0.142) * 0.6)) - 0.007, 0.142 - q.p.y, q.p.y - 0.205) },
                { color: '#38373a', f: (q) => Math.abs(q.p.y - 0.212) - 0.011 },
              ],
            },
          };
        },
        0.022,
      ),
    );
    tube(b, onFront(sc, [[-0.026, 0.165], [-0.013, 0.157], [0, 0.155], [0.013, 0.157], [0.026, 0.165]], 0.001), 0.0038, '#5b2b26', 4);
    // A few hairs sprouting on top.
    for (const [x, z, rx, rz] of [[0, 0, 0, 0], [-0.016, 0.006, 0.2, 0.35], [0.016, 0.006, 0.2, -0.35], [-0.008, -0.014, -0.25, 0.2], [0.009, -0.013, -0.25, -0.2]])
      b.add(new THREE.CylinderGeometry(1, 1, 1, 3), '#222024', { pos: [x + rz * -0.02, 0.29, z + rx * 0.02], rot: [rx, 0, rz], scale: [0.0018, 0.035, 0.0018] });
    // Goggles: a silver ring round each eye.
    const e = new Builder();
    for (const s of [-1, 1]) {
      const at = onSurface(sc, s * 0.03, 0.212);
      b.add(new THREE.TorusGeometry(1, 0.27, 6, 14), '#b4b9bf', { pos: [0, 0, 0.004], scale: 0.022 }, at);
      e.add(gem(), '#fbfaf6', { pos: [0, 0, -0.001], scale: [0.02, 0.02, 0.011] }, at);
      e.add(bead(), '#6e4b2a', { pos: [0, 0, 0.009], scale: [0.0095, 0.0095, 0.004] }, at);
      e.add(bead(), INK, { pos: [0, 0, 0.012], scale: [0.005, 0.005, 0.003] }, at);
      e.add(new THREE.IcosahedronGeometry(1, 0), '#ffffff', { pos: [0.004, 0.004, 0.014], scale: 0.0025 }, at);
    }
    super(b, e, 0.212);
    for (const s of [-1, 1]) {
      const ab = new Builder();
      tube(ab, [[s * 0.062, 0.15, 0], [s * 0.082, 0.122, 0.01], [s * 0.088, 0.097, 0.02]], 0.0085, '#f7d84a', 5);
      ab.add(bead(), '#2a2a2e', { pos: [s * 0.089, 0.088, 0.022], scale: [0.013, 0.014, 0.013] });
      this.arms.push(this.piece(ab, [s * 0.064, 0.15, 0]));
    }
  }
  protected animate(dt: number, t: number, move: number) {
    // A busy waddle with swinging arms; still, a little sway, and now and then a wave hello.
    const w = this.wave.step(dt, move < 0.3);
    this.bodyGroup.position.y = hop(t, move, 0.02, 11);
    this.bodyGroup.rotation.z = Math.sin(t * 11) * 0.1 * move + Math.sin(t * 1.2) * 0.03 * (1 - move);
    this.bodyGroup.rotation.x = move * 0.08;
    this.arms.forEach((arm, i) => {
      const s = i ? 1 : -1;
      arm.rotation.x = s * Math.sin(t * 11) * 0.6 * move;
      const up = i ? Math.min(1, bell(w) * 3) : 0;
      arm.rotation.z = s * (0.1 + Math.sin(t * 1.5) * 0.05) * (1 - up) + s * up * (2.4 + Math.sin(w * 30) * 0.3);
    });
  }
}

/** A red arcade ghost with a wavy hem that flickers, and big eyes that look where it's going. */
class ArcadeGhost extends Homage {
  private hem: THREE.Group;
  private pupils: THREE.Mesh;
  private flip = 0;
  constructor() {
    const red = '#ec3a32';
    const sc = new Sculpt();
    sc.add(ellipsoid('body', [0, 0.2, 0], [0.1, 0.095, 0.1], { name: 'top' }));
    sc.add(rod('body', [0, 0.2, 0], [0, 0.12, 0], 0.1, 0.1, { k: 0.01, name: 'skirt' }));
    sc.add(box('body', [0, 0.105 - 0.3, 0], [0.6, 0.3, 0.6], { carve: true, round: 0.004 }));
    const b = new Builder();
    b.addColored(sculpted('arcade', () => ({ sc, marks: { base: red, marks: [] } }), 0.024));
    const e = new Builder();
    const pb = new Builder();
    for (const s of [-1, 1]) {
      e.add(gem(), '#fbfbff', { pos: [0, 0, -0.004], scale: [0.026, 0.033, 0.016] }, onSurface(sc, s * 0.037, 0.215));
      pb.add(bead(), '#2443c9', { scale: [0.012, 0.013, 0.008] }, onSurface(sc, s * 0.037, 0.21, 0.01));
    }
    super(b, e, 0.215);
    // The pupils ride in the eyes (so they blink with them) and slide to look about.
    const pm = eyeMaterial();
    const pg = pb.geometry();
    pg.translate(0, -0.215, 0);
    this.pupils = this.addMesh(new THREE.Mesh(pg, pm), this.eyes, pm);
    // The hem: a ring of points that flicks half a point round and back, like the old arcade frames.
    const hs = new Sculpt();
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      hs.add(rod('body', [Math.sin(a) * 0.066, 0.125, Math.cos(a) * 0.066], [Math.sin(a) * 0.088, 0.032, Math.cos(a) * 0.088], 0.036, 0.008, { k: 0.02, name: 'hem' }));
    }
    const hb = new Builder();
    hb.addColored(sculpted('arcade-hem', () => ({ sc: hs, marks: { base: red, marks: [] } }), 0.02));
    this.hem = this.piece(hb, [0, 0.1, 0]);
  }
  protected animate(dt: number, t: number, move: number) {
    this.bodyGroup.position.y = 0.05 + Math.sin(t * 2.4) * 0.018;
    this.bodyGroup.rotation.x = move * 0.16;
    this.bodyGroup.rotation.z = clamp(-this.turn * 0.06, -0.2, 0.2);
    this.flip += dt;
    if (this.flip > (move > 0.5 ? 0.12 : 0.28)) {
      this.flip = 0;
      this.hem.rotation.y = this.hem.rotation.y ? 0 : Math.PI / 8;
    }
    // Going along, the eyes look ahead and into the turns; still, they glance this way and that.
    const glance = [0, 1, 0, -1][Math.floor(t * 0.8) % 4];
    const lx = move > 0.3 ? clamp(this.turn * 0.4, -1, 1) : glance;
    const ly = move > 0.3 ? -0.4 : 0;
    const k = Math.min(1, dt * 14);
    this.pupils.position.x += (lx * 0.009 - this.pupils.position.x) * k;
    this.pupils.position.y += (ly * 0.008 - this.pupils.position.y) * k;
  }
}

/** A round pink puffball on big red feet, who puffs up and floats a little now and then. */
class Puffball extends Homage {
  private feet: THREE.Group[] = [];
  private puff = new Act(6, 11, 2.6);
  constructor() {
    const pink = '#f6a3c0';
    const sc = new Sculpt();
    sc.add(ellipsoid('body', [0, 0.12, 0], [0.11, 0.104, 0.104], { name: 'body' }));
    for (const s of [-1, 1]) sc.add(ellipsoid('body', [s * 0.106, 0.122, 0.012], [0.034, 0.026, 0.03], { rot: [0, 0, s * 0.5], k: 0.02, name: 'arm' }));
    const cheek = (s: number) => patch([s * 0.062, 0.108, frontZ(sc, s * 0.062, 0.108)], [0.018, 0.012, 0.018]);
    const b = new Builder();
    b.addColored(sculpted('puffball', () => ({ sc, marks: { base: pink, marks: [{ color: '#f0708f', f: either(cheek(-1), cheek(1)) }] } }), 0.024));
    tube(b, onFront(sc, [[-0.011, 0.114], [0, 0.108], [0.011, 0.114]], 0.001), 0.003, '#a3263b', 4);
    const e = new Builder();
    for (const s of [-1, 1]) {
      const at = onSurface(sc, s * 0.026, 0.142, -0.003);
      e.add(gem(), '#1d1d3a', { scale: [0.012, 0.027, 0.009] }, at);
      e.add(bead(), '#3d5fe0', { pos: [0, -0.012, 0.005], scale: [0.0085, 0.01, 0.005] }, at);
      e.add(bead(), '#ffffff', { pos: [0, 0.011, 0.006], scale: [0.006, 0.0095, 0.004] }, at);
    }
    super(b, e, 0.142);
    for (const s of [-1, 1]) {
      const fb = new Builder();
      fb.add(sph(10, 7), '#d8354e', { pos: [s * 0.05, 0.022, 0.02], scale: [0.04, 0.024, 0.056] });
      this.feet.push(this.piece(fb, [s * 0.05, 0.022, 0.02]));
    }
  }
  protected animate(dt: number, t: number, move: number) {
    // Pads along on its big feet; still, it breathes, and now and then puffs right up and floats a while.
    const p = this.puff.step(dt, move < 0.2);
    const puffed = Math.min(1, bell(p) * 2.5);
    this.bodyGroup.position.y = hop(t, move, 0.012, 10) + puffed * (0.07 + Math.sin(t * 4) * 0.01);
    const breathe = Math.sin(t * 2) * 0.015 * (1 - move);
    this.bodyGroup.scale.set(1 + breathe + puffed * 0.16, 1 + breathe * 0.5 + puffed * 0.1 - Math.abs(Math.sin(t * 10)) * 0.04 * move, 1 + breathe + puffed * 0.16);
    this.bodyGroup.rotation.z = Math.sin(t * 10) * 0.06 * move;
    this.feet.forEach((foot, i) => {
      const ph = t * 10 + i * Math.PI;
      foot.position.z = 0.02 + Math.sin(ph) * 0.022 * move;
      foot.position.y = 0.022 + Math.max(0, Math.cos(ph)) * 0.015 * move;
      foot.rotation.x = puffed * 0.5 + Math.sin(ph) * 0.2 * move;
    });
  }
}

/** A grey companion cube with a pink heart on every face, that tumbles along after its owner. */
class Cube extends Homage {
  private spin: THREE.Group;
  private roll = 0;
  private glowMat: THREE.MeshLambertMaterial;
  constructor() {
    const H = 0.1;
    const sc = new Sculpt();
    sc.add(box('body', [0, H, 0], [H, H, H], { round: 0.022, name: 'cube' }));
    // How far out a point is towards each face, largest first.
    const sorted = (q: Probe) => [Math.abs(q.p.x), Math.abs(q.p.y - H), Math.abs(q.p.z)].sort((a, c) => c - a);
    const b = new Builder();
    b.addColored(
      sculpted(
        'cube',
        () => ({
          sc,
          marks: {
            base: '#d3d6da',
            marks: [
              { color: '#676c73', f: (q) => 0.062 - sorted(q)[2] },
              { color: '#949aa1', f: (q) => 0.079 - sorted(q)[1] },
              {
                color: '#a9afb6',
                f: (q) => {
                  const [, m, l] = sorted(q);
                  return Math.abs(Math.hypot(m, l) - 0.044) - 0.006;
                },
              },
            ],
          },
        }),
        0.022,
      ),
    );
    const e = new Builder();
    super(b, e, H);
    // No eyes to blink: drop the empty eye mesh, so nothing trips over a shape with no corners.
    for (const m of [...this.eyes.children]) {
      (m as THREE.Mesh).geometry.dispose();
      m.removeFromParent();
    }
    this.spin = this.pivotBody([0, H, 0]);
    // The hearts, glowing softly, on their own so they can pulse.
    const heart = new THREE.Shape();
    heart.moveTo(0, -0.42);
    heart.bezierCurveTo(0.12, -0.28, 0.5, -0.08, 0.5, 0.16);
    heart.bezierCurveTo(0.5, 0.42, 0.16, 0.5, 0, 0.26);
    heart.bezierCurveTo(-0.16, 0.5, -0.5, 0.42, -0.5, 0.16);
    heart.bezierCurveTo(-0.5, -0.08, -0.12, -0.28, 0, -0.42);
    const hg = new THREE.ShapeGeometry(heart, 4);
    const hb = new Builder();
    for (const r of [[0, 0, 0], [0, Math.PI, 0], [0, Math.PI / 2, 0], [0, -Math.PI / 2, 0], [-Math.PI / 2, 0, 0], [Math.PI / 2, 0, 0]] as Vec3[]) {
      const face = new THREE.Matrix4().compose(V([0, H, 0]), new THREE.Quaternion().setFromEuler(new THREE.Euler(...r)), new THREE.Vector3(1, 1, 1));
      hb.add(hg, '#ef6aa6', { pos: [0, 0, H + 0.0015], scale: 0.05 }, face);
    }
    hg.dispose();
    this.glowMat = new THREE.MeshLambertMaterial({ vertexColors: true, emissive: '#ff4f9a', emissiveIntensity: 0.2 });
    this.piece(hb, [0, H, 0], this.spin, this.glowMat);
  }
  protected animate(dt: number, t: number, move: number) {
    // Going along it hops over onto its next face, a quarter turn at a time; it settles flat when it stops.
    const Q = Math.PI / 2;
    if (move > 0.5) this.roll += (dt * Q) / 0.36;
    else this.roll = Math.min(Math.ceil(this.roll / Q - 1e-3) * Q, this.roll + dt * 5);
    const a = this.roll % Q;
    this.spin.rotation.x = this.roll;
    this.spin.position.y = 0.1 + 0.1 * (Math.abs(Math.cos(a)) + Math.abs(Math.sin(a)) - 1) + Math.sin(a * 2) * 0.025;
    const squash = Math.sin(t * 2) * 0.012 * (1 - move);
    this.spin.scale.set(1 - squash, 1 + squash, 1 - squash);
    this.glowMat.emissiveIntensity = 0.15 + (Math.sin(t * 2.2) * 0.5 + 0.5) * 0.3;
  }
}

/** The pixel face of a blocky green creeper, 8 by 8, top row first: x the mouth, b a blush. */
const CREEPER_FACE = ['........', '........', '........', '........', 'b..xx..b', '..xxxx..', '..xxxx..', '..x..x..'];

/**
 * A box made of square pixels, like a blocky game's: `at` its lowest corner and `size` its size, both in pixels
 * `px` across. Each face is painted pixel by pixel by `paint(face, u, v)` (u across and v up as you look at it;
 * faces are front, back, left, right, top, bottom), skipping any face in `skip`.
 */
function pixelBox(b: Builder, px: number, at: Vec3, size: Vec3, paint: (face: string, u: number, v: number) => THREE.ColorRepresentation, skip: string[] = []) {
  const [w, h, d] = size;
  const quad = new THREE.PlaneGeometry(px, px);
  const faces: [string, Vec3, number, number, (u: number, v: number) => Vec3][] = [
    ['front', [0, 0, 0], w, h, (u, v) => [u + 0.5, v + 0.5, d]],
    ['back', [0, Math.PI, 0], w, h, (u, v) => [w - u - 0.5, v + 0.5, 0]],
    ['left', [0, Math.PI / 2, 0], d, h, (u, v) => [w, v + 0.5, d - u - 0.5]],
    ['right', [0, -Math.PI / 2, 0], d, h, (u, v) => [0, v + 0.5, u + 0.5]],
    ['top', [-Math.PI / 2, 0, 0], w, d, (u, v) => [u + 0.5, h, d - v - 0.5]],
    ['bottom', [Math.PI / 2, 0, 0], w, d, (u, v) => [u + 0.5, 0, v + 0.5]],
  ];
  for (const [face, rot, nu, nv, where] of faces) {
    if (skip.includes(face)) continue;
    for (let u = 0; u < nu; u++) {
      for (let v = 0; v < nv; v++) {
        const p = where(u, v);
        b.add(quad, paint(face, u, v), { pos: [(at[0] + p[0]) * px, (at[1] + p[1]) * px, (at[2] + p[2]) * px], rot });
      }
    }
  }
  quad.dispose();
}

/** A blocky green creeper on four stubby legs, that swells and flashes now and then (and never goes off). */
class Creepling extends Homage {
  private legs: THREE.Group[] = [];
  private hiss = new Act(7, 12, 1.4);
  constructor() {
    const P = 0.018;
    const greens = ['#5cb247', '#4fa43d', '#69c055', '#3f8f33', '#7ccf68', '#4a9b3b', '#a5d996', '#58ad45', '#5cb247', '#4fa43d'];
    let n = 7;
    // Mottled, the same every time.
    const mottle = () => greens[((n = (Math.imul(n, 1103515245) + 12345) >>> 0) >>> 16) % greens.length];
    const b = new Builder();
    pixelBox(b, P, [-4, 9, -4], [8, 8, 8], (face, u, v) => {
      const c = face === 'front' ? CREEPER_FACE[7 - v][u] : '.';
      return c === 'x' ? '#161616' : c === 'b' ? '#e98fa0' : mottle();
    });
    pixelBox(b, P, [-4, 3, -2], [8, 6, 4], mottle, ['top', 'bottom']);
    const e = new Builder();
    for (const s of [-1, 1]) e.add(new THREE.BoxGeometry(1, 1, 1), '#161616', { pos: [s * 2 * P, 14 * P, 4 * P + 0.002], scale: [2 * P, 2 * P, 0.004] });
    super(b, e, 14 * P);
    // Two pairs of legs, each a front and the opposite back, stepping in turn.
    for (const pair of [0, 1]) {
      const lb = new Builder();
      for (const [x0, z0] of pair ? [[-4, 0], [0, -4]] : [[0, 0], [-4, -4]]) pixelBox(lb, P, [x0, 0, z0], [4, 3, 4], mottle, ['bottom']);
      this.legs.push(this.piece(lb, [0, 3 * P, 0]));
    }
  }
  protected animate(dt: number, t: number, move: number) {
    // Shuffles along on its stubby legs; still, now and then it swells up and flashes white, then thinks better of it.
    const h = this.hiss.step(dt, move < 0.2);
    this.bodyGroup.position.y = Math.abs(Math.sin(t * 12)) * 0.008 * move;
    this.legs.forEach((leg, i) => (leg.rotation.x = (i ? 1 : -1) * Math.sin(t * 12) * 0.5 * move));
    const swell = bell(h) * 0.08 + (h >= 0 ? Math.sin(h * 50) * 0.008 : 0);
    this.bodyGroup.scale.set(1 + swell, 1 + swell * 0.6, 1 + swell);
    const flash = h >= 0 && h > 0.3 && h < 0.8 && Math.sin(h * Math.PI * 8) > 0 ? 0.55 : 0;
    const m = this.mat as THREE.MeshLambertMaterial;
    if (m.emissive) {
      m.emissive.setScalar(1);
      m.emissiveIntensity = flash;
    }
  }
}

/** A ball droid: an orange-ringed ball that rolls along under a little domed head that stays on top. */
class BallDroid extends Homage {
  private ball: THREE.Group;
  private head: THREE.Group;
  private wiggle = new Act(5, 9, 0.9);
  constructor() {
    const R = 0.095;
    const orange = '#ec8a2f';
    const sc = new Sculpt();
    sc.add(ellipsoid('body', [0, R, 0], [R, R, R], { name: 'ball' }));
    const axes = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]].map((a) => V(a as Vec3));
    // How square-on a point is to the nearest of the six rings' centres.
    const facing = (q: Probe) => {
      const u = new THREE.Vector3(q.p.x, q.p.y - R, q.p.z).normalize();
      return Math.max(...axes.map((a) => u.dot(a)));
    };
    const b = new Builder();
    b.addColored(
      sculpted(
        'balldroid',
        () => ({
          sc,
          marks: {
            base: '#f1eee6',
            marks: [
              { color: '#aeb4bb', f: (q) => 0.93 - facing(q) },
              { color: orange, f: (q) => Math.abs(facing(q) - 0.85) - 0.06 },
            ],
          },
        }),
        0.022,
      ),
    );
    const hs = new Sculpt();
    hs.add(ellipsoid('body', [0, 0.2, 0], [0.058, 0.05, 0.058], { name: 'head' }));
    hs.add(box('body', [0, 0.198 - 0.3, 0], [0.6, 0.3, 0.6], { carve: true, round: 0.004 }));
    const hb = new Builder();
    hb.addColored(
      sculpted(
        'balldroid-head',
        () => ({
          sc: hs,
          marks: {
            base: '#f1eee6',
            marks: [
              { color: orange, f: (q) => Math.abs(q.p.y - 0.21) - 0.004 },
              { color: '#9aa0a8', f: (q) => Math.abs(q.p.y - 0.224) - 0.002 },
              { color: '#b9bec4', f: (q) => 0.243 - q.p.y },
            ],
          },
        }),
        0.016,
      ),
    );
    hb.add(new THREE.TorusGeometry(1, 0.18, 4, 12), '#8e949c', { pos: [0, 0, 0.001], scale: 0.017 }, onSurface(hs, 0, 0.226));
    for (const [x, h] of [[-0.012, 0.042], [0.01, 0.026]]) hb.add(new THREE.CylinderGeometry(1, 1, 1, 4), '#a7acb3', { pos: [x, 0.247 + h / 2, -0.008], scale: [0.0016, h, 0.0016] });
    const e = new Builder();
    const lens = onSurface(hs, 0, 0.226, -0.002);
    e.add(gem(), '#16171b', { scale: [0.014, 0.014, 0.008] }, lens);
    e.add(new THREE.IcosahedronGeometry(1, 0), '#ffffff', { pos: [0.004, 0.005, 0.007], scale: 0.0028 }, lens);
    e.add(bead(), '#16171b', { scale: [0.006, 0.006, 0.004] }, onSurface(hs, 0.027, 0.212, -0.001));
    super(b, e, 0.226);
    this.ball = this.pivotBody([0, R, 0]);
    this.head = this.piece(hb, [0, R, 0]);
    this.eyesOn(this.head);
  }
  protected animate(dt: number, t: number, move: number) {
    // The ball rolls and the head rides on top, leaning into the going and the turns; still, it looks about.
    const w = this.wiggle.step(dt, move < 0.3);
    this.ball.rotation.x += dt * move * 16;
    this.bodyGroup.rotation.z = clamp(-this.turn * 0.05, -0.15, 0.15);
    this.head.rotation.x = move * 0.25 + Math.sin(t * 1.3) * 0.03;
    this.head.rotation.y = Math.sin(t * 0.5) * 0.7 * (1 - move) + clamp(this.turn * 0.3, -0.6, 0.6) + (w >= 0 ? Math.sin(w * 30) * 0.25 * bell(w) : 0);
    this.head.rotation.z = Math.sin(t * 0.9) * 0.08 * (1 - move);
  }
}

/** A dome-topped blue and white droid on three legs: it waddles, swivels its dome and flashes its lights as it beeps. */
class AstroDroid extends Homage {
  private dome: THREE.Group;
  private lights: THREE.Group[] = [];
  private beep = new Act(3, 6, 1.1);
  constructor() {
    const blue = '#2e5fbf';
    const white = '#eef1f4';
    const sc = new Sculpt();
    sc.add(rod('body', [0, 0.065, 0], [0, 0.17, 0], 0.068, 0.068, { name: 'body' }));
    sc.add(rod('body', [0, 0.06, 0], [0, 0.04, 0], 0.06, 0.046, { k: 0.01, name: 'skirt' }));
    sc.add(box('body', [0, 0.03 - 0.3, 0], [0.6, 0.3, 0.6], { carve: true, round: 0.004 }));
    const ang = (q: Probe) => Math.abs(Math.atan2(q.p.x, q.p.z));
    const band = (y0: number, y1: number) => (q: Probe) => Math.max(y0 - q.p.y, q.p.y - y1);
    const b = new Builder();
    b.addColored(
      sculpted(
        'astrodroid',
        () => ({
          sc,
          marks: {
            base: white,
            marks: [
              { color: '#9aa1aa', f: regionOf(sc, 'skirt') },
              { color: '#aeb5be', f: band(0.158, 1) },
              { color: '#8e959e', f: both((q) => ang(q) - 0.2, band(0.07, 0.095)) },
              { color: blue, f: both((q) => ang(q) - 0.3, band(0.105, 0.148)) },
              { color: blue, f: both((q) => Math.abs(ang(q) - 0.7) - 0.15, band(0.122, 0.148)) },
              { color: blue, f: both((q) => Math.abs(ang(q) - 1.35) - 0.1, band(0.07, 0.15)) },
              { color: blue, f: both((q) => 2.5 - ang(q), band(0.09, 0.145)) },
            ],
          },
        }),
        0.022,
      ),
    );
    // Legs: a shoulder, a strut and a foot each side, and a little third foot in the middle.
    const cube = new THREE.BoxGeometry(1, 1, 1);
    const cyl = new THREE.CylinderGeometry(1, 1, 1, 12);
    for (const s of [-1, 1]) {
      b.add(cyl, white, { pos: [s * 0.077, 0.148, 0], rot: [0, 0, Math.PI / 2], scale: [0.024, 0.018, 0.024] });
      b.add(cyl, blue, { pos: [s * 0.0865, 0.148, 0], rot: [0, 0, Math.PI / 2], scale: [0.013, 0.004, 0.013] });
      b.add(cube, white, { pos: [s * 0.083, 0.088, 0], scale: [0.016, 0.12, 0.034] });
      b.add(cube, blue, { pos: [s * 0.0915, 0.095, 0], scale: [0.002, 0.07, 0.014] });
      b.add(cube, '#cfd4da', { pos: [s * 0.083, 0.016, 0.006], scale: [0.03, 0.032, 0.058] });
    }
    b.add(cube, '#b9c0c8', { pos: [0, 0.02, 0], scale: [0.028, 0.03, 0.034] });
    cube.dispose();
    cyl.dispose();
    const ds = new Sculpt();
    ds.add(ellipsoid('body', [0, 0.172, 0], [0.071, 0.068, 0.071], { name: 'dome' }));
    ds.add(box('body', [0, 0.17 - 0.3, 0], [0.6, 0.3, 0.6], { carve: true, round: 0.004 }));
    const db = new Builder();
    db.addColored(
      sculpted(
        'astrodroid-dome',
        () => ({
          sc: ds,
          marks: {
            base: '#c9ced5',
            marks: [
              { color: blue, f: both(band(0.18, 0.198), (q) => 0.2 - Math.cos(Math.atan2(q.p.x, q.p.z) * 6 + 0.3)) },
              { color: blue, f: both(band(0.206, 0.222), (q) => 0.5 - Math.cos(Math.atan2(q.p.x, q.p.z) * 5 + 1)) },
              { color: blue, f: both(band(0.232, 1), (q) => -Math.cos(Math.atan2(q.p.x, q.p.z) * 2 + 0.6)) },
            ],
          },
        }),
        0.02,
      ),
    );
    db.add(new THREE.CylinderGeometry(1, 1, 1, 8), '#3a3d44', { pos: [0, 0, 0.004], rot: [Math.PI / 2, 0, 0], scale: [0.007, 0.01, 0.007] }, onSurface(ds, -0.036, 0.19));
    const e = new Builder();
    const eye = onSurface(ds, 0, 0.212, -0.002);
    e.add(gem(), '#121318', { scale: [0.013, 0.013, 0.007] }, eye);
    e.add(new THREE.IcosahedronGeometry(1, 0), '#ffffff', { pos: [0.004, 0.004, 0.006], scale: 0.0026 }, eye);
    super(b, e, 0.212);
    this.dome = this.piece(db, [0, 0.17, 0]);
    this.eyesOn(this.dome);
    for (const [x, y, color] of [[0.03, 0.205, '#ff3b30'], [0.046, 0.186, '#46b4ff']] as const) {
      const lb = new Builder();
      lb.add(bead(), color, { scale: 0.006 }, onSurface(ds, x, y, 0.001));
      this.lights.push(this.piece(lb, [0, 0.17, 0], this.dome, glow(color, 1.3)));
    }
  }
  protected animate(dt: number, t: number, move: number) {
    // A side-to-side waddle on its two legs going along; still, the dome swivels to look about; now and then it beeps.
    const p = this.beep.step(dt);
    this.bodyGroup.rotation.z = Math.sin(t * 8) * 0.07 * move;
    this.bodyGroup.rotation.x = 0.06 * move;
    this.bodyGroup.position.y = bell(p) * 0.008;
    this.dome.rotation.y = Math.sin(t * 0.45) * 0.9 * (1 - move) + clamp(this.turn * 0.25, -0.5, 0.5) + (p >= 0 ? Math.sin(p * 40) * 0.12 : 0);
    this.lights[0].visible = p >= 0 ? Math.sin(p * 37) > 0 : Math.sin(t * 1.7) > 0.6;
    this.lights[1].visible = p >= 0 ? Math.sin(p * 23 + 1) > 0 : true;
  }
}

/** A boxy, rusty little robot on treads with binocular eyes, who tilts its head at things. */
class TidyBot extends Homage {
  private head: THREE.Group;
  private stretch = new Act(5, 9, 1.8);
  constructor() {
    const grey = '#8e9297';
    const sc = new Sculpt();
    sc.add(box('body', [0, 0.115, 0], [0.065, 0.058, 0.058], { round: 0.008, name: 'body' }));
    for (const s of [-1, 1]) sc.add(box('body', [s * 0.082, 0.042, 0], [0.02, 0.042, 0.072], { round: 0.03, name: 'tread' }));
    const b = new Builder();
    b.addColored(
      sculpted(
        'tidybot',
        () => {
          const onBody = regionOf(sc, 'body');
          return {
            sc,
            marks: {
              base: '#dba640',
              marks: [
                { color: '#4a4744', f: regionOf(sc, 'tread') },
                // Rust, in patches.
                { color: '#a3602c', f: both(onBody, (q) => 0.78 - Math.sin(q.p.x * 90 + Math.sin(q.p.y * 70) * 2) * Math.sin(q.p.y * 80 + q.p.z * 60 + 1)) },
                { color: '#c48a2c', f: both(onBody, (q) => 0.052 - q.p.z, (q) => Math.abs(q.p.x) - 0.05, (q) => Math.abs(q.p.y - 0.105) - 0.038) },
              ],
            },
          };
        },
        0.02,
      ),
    );
    const cyl = new THREE.CylinderGeometry(1, 1, 1, 10);
    const cube = new THREE.BoxGeometry(1, 1, 1);
    for (const s of [-1, 1]) {
      // Wheels on the outside of each tread.
      for (const [z, r] of [[-0.046, 0.022], [0, 0.016], [0.046, 0.022]]) {
        b.add(cyl, '#a3a7ab', { pos: [s * 0.102, 0.042, z], rot: [0, 0, Math.PI / 2], scale: [r, 0.004, r] });
        b.add(cyl, '#5d5b58', { pos: [s * 0.105, 0.042, z], rot: [0, 0, Math.PI / 2], scale: [r * 0.4, 0.004, r * 0.4] });
      }
      // Little arms reaching forward, with pincer hands.
      b.add(cube, grey, { pos: [s * 0.074, 0.098, 0.04], scale: [0.012, 0.012, 0.045] });
      for (const dy of [-0.006, 0.006]) b.add(cube, '#6f7378', { pos: [s * 0.074, 0.098 + dy, 0.068], scale: [0.01, 0.004, 0.014] });
    }
    // The neck and head: binocular eyes, their housings drooping outwards a little.
    const hb = new Builder();
    tube(hb, [[0, 0.168, -0.012], [0, 0.195, -0.006], [0, 0.218, 0.006]], 0.007, grey, 5);
    hb.add(cube, '#7d8186', { pos: [0, 0.229, 0.008], scale: [0.018, 0.01, 0.02] });
    const e = new Builder();
    for (const s of [-1, 1]) {
      const m = new THREE.Matrix4().makeTranslation(s * 0.029, 0.235, 0.016).multiply(new THREE.Matrix4().makeRotationZ(s * 0.3)).multiply(new THREE.Matrix4().makeRotationX(Math.PI / 2));
      hb.add(new THREE.CylinderGeometry(1, 1, 1, 9), '#9ea3a9', { scale: [0.025, 0.04, 0.021] }, m);
      e.add(new THREE.CylinderGeometry(1, 1, 1, 12), '#1f2328', { pos: [0, 0.02, 0], scale: [0.019, 0.004, 0.016] }, m);
      e.add(new THREE.CylinderGeometry(1, 1, 1, 12), '#4f6e88', { pos: [0, 0.0225, 0], scale: [0.009, 0.002, 0.008] }, m);
      e.add(new THREE.IcosahedronGeometry(1, 0), '#ffffff', { pos: [s * 0.004, 0.024, -0.005], scale: 0.0028 }, m);
    }
    cyl.dispose();
    cube.dispose();
    super(b, e, 0.235);
    this.head = this.piece(hb, [0, 0.17, -0.008]);
    this.eyesOn(this.head);
  }
  protected animate(dt: number, t: number, move: number) {
    // Trundles along with a busy little judder; still, the head tilts and looks about, and now and then it stretches up.
    const s = this.stretch.step(dt, move < 0.3);
    this.bodyGroup.position.y = move * (Math.abs(Math.sin(t * 37)) * 0.003 + Math.abs(Math.sin(t * 23)) * 0.002);
    this.bodyGroup.rotation.x = -move * 0.05 + Math.sin(t * 13) * 0.012 * move;
    this.head.position.y = 0.17 + bell(s) * 0.025;
    this.head.rotation.z = Math.sin(t * 0.8) * 0.2 * (1 - move);
    this.head.rotation.y = Math.sin(t * 0.5) * 0.5 * (1 - move) + clamp(this.turn * 0.3, -0.6, 0.6);
    this.head.rotation.x = Math.sin(t * 7) * 0.06 * move - bell(s) * 0.2;
  }
}

/** A little black dragon with big green eyes and a gummy smile, who bounds and flaps along. */
class Dragon extends Homage {
  private wings: THREE.Group[] = [];
  private tail: THREE.Group;
  private stretch = new Act(6, 11, 1.8);
  constructor() {
    const black = '#2c2d37';
    const sc = new Sculpt();
    sc.add(ellipsoid('body', [0, 0.1, -0.025], [0.056, 0.058, 0.082], { name: 'body' }));
    sc.add(ellipsoid('body', [0, 0.125, 0.035], [0.05, 0.055, 0.045], { k: 0.03, name: 'body' }));
    sc.add(rod('body', [0, 0.14, 0.04], [0, 0.18, 0.065], 0.036, 0.034, { k: 0.03, name: 'neck' }));
    sc.add(ellipsoid('body', [0, 0.208, 0.075], [0.068, 0.055, 0.058], { k: 0.03, name: 'head' }));
    sc.add(ellipsoid('body', [0, 0.19, 0.112], [0.05, 0.034, 0.034], { k: 0.025, name: 'snout' }));
    for (const s of [-1, 1]) {
      // Ear flaps sweeping back off the head, two big and two small.
      sc.add(rod('body', [s * 0.035, 0.245, 0.055], [s * 0.07, 0.275, -0.015], 0.017, 0.005, { k: 0.015, name: 'flap', squash: [1, 0.45, 1], thin: true }));
      sc.add(rod('body', [s * 0.05, 0.225, 0.045], [s * 0.088, 0.24, -0.005], 0.011, 0.004, { k: 0.012, name: 'flap', squash: [1, 0.45, 1], thin: true }));
      sc.add(rod('body', [s * 0.035, 0.1, 0.05], [s * 0.04, 0.014, 0.06], 0.019, 0.016, { k: 0.02, name: 'leg' }));
      sc.add(ellipsoid('body', [s * 0.041, 0.01, 0.07], [0.02, 0.011, 0.022], { k: 0.01, name: 'paw' }));
      sc.add(ellipsoid('body', [s * 0.042, 0.075, -0.06], [0.028, 0.045, 0.042], { k: 0.025, name: 'leg' }));
      sc.add(ellipsoid('body', [s * 0.046, 0.01, -0.04], [0.02, 0.011, 0.026], { k: 0.012, name: 'paw' }));
    }
    sc.add(flatBase());
    const b = new Builder();
    b.addColored(sculpted('dragon', () => ({ sc, marks: { base: black, marks: [] } }), 0.02));
    // The gummy smile: pink gums, no teeth.
    tube(b, onFront(sc, [[-0.038, 0.19], [-0.025, 0.178], [0, 0.173], [0.025, 0.178], [0.038, 0.19]], 0.0), 0.0055, '#e8879a', 4);
    // Little spines down the back.
    for (let i = 0; i < 4; i++) b.add(spike(4), '#3a3c48', { pos: [0, 0.155 - i * 0.012, 0.0 - i * 0.03], rot: [-0.5, 0, 0], scale: [0.006, 0.016, 0.006] });
    const e = new Builder();
    for (const s of [-1, 1]) {
      const at = onSurface(sc, s * 0.034, 0.218, -0.004);
      e.add(gem(), '#8fcf45', { scale: [0.021, 0.024, 0.012] }, at);
      e.add(bead(), INK, { pos: [0, 0, 0.01], scale: [0.0055, 0.018, 0.005] }, at);
      e.add(new THREE.IcosahedronGeometry(1, 1), '#ffffff', { pos: [0.006, 0.009, 0.012], scale: 0.0045 }, at);
    }
    super(b, e, 0.218);
    // The tail, with a fin each side at the tip: one black, one red.
    const ts = new Sculpt();
    ts.add(rod('body', [0, 0.095, -0.085], [0, 0.075, -0.16], 0.026, 0.016, { name: 'tail' }));
    ts.add(rod('body', [0, 0.075, -0.16], [0.012, 0.06, -0.235], 0.016, 0.01, { k: 0.01, name: 'tail' }));
    const tb = new Builder();
    tb.addColored(sculpted('dragon-tail', () => ({ sc: ts, marks: { base: black, marks: [] } }), 0.018));
    for (const s of [-1, 1]) {
      const fin = cutout([[0, 0], [s * 0.04, 0.014], [s * 0.042, -0.02], [s * 0.012, -0.012]].map(([x, y]) => [x, y] as [number, number]), 0.004);
      tb.add(fin, s > 0 ? '#c4302b' : black, { pos: [0.01 + s * 0.004, 0.062, -0.222], rot: [Math.PI / 2, 0, 0] });
      fin.dispose();
    }
    this.tail = this.piece(tb, [0, 0.092, -0.085]);
    // Wings, on hinges at the shoulders.
    for (const s of [-1, 1]) {
      const wb = new Builder();
      const outline: [number, number][] = [[0, 0.02], [0.05, 0.03], [0.13, 0.0], [0.11, -0.025], [0.085, -0.03], [0.07, -0.055], [0.045, -0.05], [0.025, -0.065], [0, -0.04]];
      const g = cutout(outline.map(([u, v]) => [s * u, v] as [number, number]), 0.005);
      wb.add(g, '#363846', { pos: [s * 0.04, 0.145, 0.0], rot: [Math.PI / 2, 0, 0] });
      g.dispose();
      const wing = this.piece(wb, [s * 0.04, 0.145, 0.0]);
      wing.rotation.order = 'YZX';
      this.wings.push(wing);
    }
  }
  protected animate(dt: number, t: number, move: number) {
    // Bounds along in hops, flapping as it goes; still, the wings fold, the tail swishes, and now and then it stretches them out.
    const st = this.stretch.step(dt, move < 0.3);
    const h = hop(t, move, 0.06, 9);
    this.bodyGroup.position.y = h;
    this.bodyGroup.rotation.x = move * 0.1 - h * 1.2;
    this.bodyGroup.rotation.z = Math.sin(t * 0.7) * 0.05 * (1 - move);
    const spread = Math.max(move, Math.min(1, bell(st) * 2));
    const beat = move > 0.3 ? Math.sin(t * 18) : Math.sin(t * 6);
    this.wings.forEach((wing, i) => {
      const s = i ? 1 : -1;
      wing.rotation.y = s * (0.95 - spread * 0.8);
      wing.rotation.z = s * (0.5 * (1 - spread) + spread * (0.2 + beat * 0.6));
    });
    this.tail.rotation.y = Math.sin(t * 2) * 0.35 * (1 - move) + Math.sin(t * 9) * 0.2 * move;
  }
}

// ---------------------------------------------------------------- pop-culture pets (a second set)

/** A pet with moving parts of its own (wings, ears, a jaw), each hung on a pivot. */
class Jointed extends PetRig {
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
function placeCopy(m: THREE.InstancedMesh, i: number, pos: Vec3, rot: Vec3 = [0, 0, 0], scale: Vec3 = [1, 1, 1]) {
  m.setMatrixAt(i, M4.compose(V4.set(...pos), Q4.setFromEuler(E4.set(...rot)), S4.set(...scale)));
}

/** Little spots scattered over an ellipsoid's surface (where `keep` likes the direction), for speckles and fur. */
function spots(seed: number, n: number, c: Vec3, r: Vec3, size: Vec3, keep: (d: THREE.Vector3) => boolean = () => true): Field {
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
function irisEyes(b: Builder, y: number, z: number, x: number, r: number, iris: string, pupil = 0.55) {
  for (const s of [-1, 1]) {
    b.add(gem(), iris, { pos: [s * x, y, z], scale: [r, r * 1.08, r * 0.6] });
    b.add(gem(), INK, { pos: [s * x, y, z + r * 0.32], scale: [r * pupil, r * pupil * 1.1, r * 0.4] });
    b.add(new THREE.IcosahedronGeometry(1, SMOOTH_LOOK ? 1 : 0), '#fffdf8', { pos: [s * x + r * 0.3, y + r * 0.35, z + r * 0.62], scale: r * 0.3 });
  }
}

/** A little arc of a line (a mouth): `up` true for a frown, false for a smile. */
const arc = (b: Builder, pos: Vec3, r: number, color: string, up: boolean, open = Math.PI, rot: Vec3 = [0, 0, 0]) =>
  b.add(new THREE.TorusGeometry(1, 0.2, 4, 10, open), color, { pos, rot: [rot[0], rot[1], (up ? 0 : Math.PI) + (Math.PI - open) / 2 + rot[2]], scale: r });

/** 1. A snowy owl with a letter in its beak: it flies when on the move, and turns its head right round when still. */
class Owl extends Jointed {
  private head: THREE.Group;
  private wings: THREE.Group[] = [];
  constructor() {
    const b = new Builder();
    const white = '#f7f6f0';
    const fleck = '#4a4446';
    b.addColored(
      sculpted('owl', () => {
        const sc = new Sculpt();
        sc.add(ellipsoid('body', [0, 0.13, 0], [0.105, 0.12, 0.1], { name: 'body' }));
        sc.add(ellipsoid('body', [0, 0.07, -0.1], [0.05, 0.022, 0.055], { rot: [0.5, 0, 0], k: 0.03, name: 'tail' }));
        for (const s of [-1, 1]) sc.add(ellipsoid('body', [s * 0.042, 0.014, 0.05], [0.028, 0.014, 0.032], { k: 0.02, name: 'foot' }));
        return {
          sc,
          marks: {
            base: white,
            marks: [
              { color: fleck, f: spots(11, 16, [0, 0.13, 0], [0.105, 0.12, 0.1], [0.013, 0.007, 0.013], (d) => d.z < 0.55 && d.y > -0.6) },
              { color: '#ebe6dc', f: regionOf(sc, 'foot') },
            ],
          },
        };
      }),
    );
    // Little dark talons.
    for (const s of [-1, 1]) for (const dx of [-0.014, 0, 0.014]) b.add(spike(4), '#3b3436', { pos: [s * 0.042 + dx, 0.01, 0.083], rot: [Math.PI / 2, 0, 0], scale: [0.005, 0.014, 0.005] });
    const e = new Builder();
    irisEyes(e, 0.262, 0.088, 0.036, 0.022, '#f2c230');
    super(b, e, 0.262);
    // The head, with its beak and the letter, turns on its own.
    const hb = new Builder();
    const at: Vec3 = [0, 0.245, 0.01];
    hb.addColored(
      sculpted('owl-head', () => {
        const sc = new Sculpt();
        sc.add(ellipsoid('body', [0, 0, 0], [0.092, 0.078, 0.082], { name: 'head' }));
        sc.add(ellipsoid('body', [0, -0.004, 0.04], [0.078, 0.062, 0.045], { k: 0.02, name: 'face' }));
        return {
          sc,
          marks: {
            base: white,
            marks: [
              { color: fleck, f: spots(5, 6, [0, 0, 0], [0.092, 0.078, 0.082], [0.01, 0.006, 0.01], (d) => d.z < -0.2 && d.y > 0) },
              { color: BLUSH, f: blushes(-0.02, 0.07, 0.055, 0.014) },
              { color: '#fffefa', f: regionOf(sc, 'face') },
            ],
          },
        };
      }),
    );
    hb.add(spike(4), '#3b3436', { pos: [0, -0.012, 0.09], rot: [Math.PI / 2 + 0.6, 0, 0], scale: [0.013, 0.03, 0.011] });
    // The letter: a cream envelope with its flap and a red seal, held crosswise in the beak.
    const letter = new THREE.Matrix4().compose(new THREE.Vector3(0.02, -0.045, 0.1), new THREE.Quaternion().setFromEuler(new THREE.Euler(0.15, 0, -0.18)), new THREE.Vector3(1, 1, 1));
    hb.add(new THREE.BoxGeometry(1, 1, 1), '#f3e6c4', { scale: [0.1, 0.06, 0.006] }, letter);
    for (const s of [-1, 1]) hb.add(new THREE.BoxGeometry(1, 1, 1), '#d9c8a0', { pos: [s * 0.024, 0.012, 0.0035], rot: [0, 0, s * -0.5], scale: [0.056, 0.004, 0.002] }, letter);
    hb.add(new THREE.CylinderGeometry(1, 1, 1, 8), '#c0392b', { pos: [0, -0.002, 0.004], rot: [Math.PI / 2, 0, 0], scale: [0.009, 0.004, 0.009] }, letter);
    this.head = this.part(hb, at);
    this.eyesOn(this.head);
    for (const s of [-1, 1]) {
      const wb = new Builder();
      wb.addColored(
        sculpted('owl-wing', () => {
          const sc = new Sculpt();
          sc.add(ellipsoid('body', [0, -0.065, -0.012], [0.02, 0.07, 0.058], { name: 'wing' }));
          sc.add(ellipsoid('body', [0, -0.125, -0.04], [0.014, 0.04, 0.034], { k: 0.02, name: 'tip' }));
          return { sc, marks: { base: white, marks: [{ color: fleck, f: (q) => Math.max(-0.11 - q.p.y, Math.abs(Math.sin(q.p.z * 160)) - 0.35) }] } };
        }, 0.02),
      );
      this.wings.push(this.part(wb, [s * 0.092, 0.205, -0.005]));
    }
  }
  protected animate(_dt: number, t: number, move: number) {
    // On the move it takes off and flaps; still, it perches, ruffles now and then, and turns its head about.
    this.bodyGroup.position.y = move * (0.24 + Math.sin(t * 6.5) * 0.025) + Math.sin(t * 2) * 0.004;
    this.bodyGroup.rotation.x = move * 0.3;
    const ruffle = Math.pow(Math.max(0, Math.sin(t * 0.8)), 24) * 0.5;
    const spread = 0.1 + ruffle + move * (1.15 + Math.sin(t * 13) * 0.75);
    this.wings.forEach((w, i) => (w.rotation.z = (i ? 1 : -1) * spread));
    const still = 1 - move;
    this.head.rotation.y = Math.tanh(Math.sin(t * 0.45) * 5) * 0.9 * still;
    this.head.rotation.z = Math.sin(t * 0.7) * 0.18 * still;
    this.head.rotation.x = -move * 0.2;
  }
}

/** 2. A grey cat with a pop-tart for a body, floating along on a rainbow. */
class PopTart extends Jointed {
  private legs: THREE.InstancedMesh;
  private trail: THREE.InstancedMesh;
  private tail: THREE.Group;
  constructor() {
    const b = new Builder();
    const grey = '#9b9aa2';
    const crust = '#f3c58c';
    const icing = '#f7a3d2';
    b.addColored(
      sculpted('poptart', () => {
        const sc = new Sculpt();
        sc.add(box('body', [0, 0.1, -0.025], [0.06, 0.075, 0.09], { round: 0.018, name: 'tart' }));
        sc.add(ellipsoid('body', [0, 0.072, 0.1], [0.066, 0.054, 0.05], { k: 0.012, name: 'head' }));
        for (const s of [-1, 1]) sc.add(pyramid('body', [s * 0.036, 0.106, 0.1], 0.022, 0.042, 0.012, { rot: [0, 0, -s * 0.25], k: 0.01, name: 'ear' }));
        const tart = regionOf(sc, 'tart');
        const icingF: Field = (q) => Math.max(tart(q), 0.045 - Math.abs(q.p.x), Math.abs(q.p.y - 0.1) - 0.056, Math.abs(q.p.z + 0.025) - 0.07);
        return {
          sc,
          marks: {
            base: grey,
            marks: [
              { color: icing, f: icingF },
              { color: crust, f: tart },
              { color: '#f4a6b4', f: (q) => Math.max(regionOf(sc, 'ear')(q), 0.103 - q.p.z) },
              { color: BLUSH, f: blushes(0.062, 0.14, 0.044, 0.012) },
            ],
          },
        };
      }, 0.02),
    );
    for (const s of [-1, 1]) arc(b, [s * 0.0085, 0.058, 0.147], 0.0085, INK, false);
    // Sprinkles scattered over the icing on both sides.
    const R = rng(7);
    for (let i = 0; i < 20; i++) {
      const s = i % 2 ? 1 : -1;
      b.add(new THREE.BoxGeometry(1, 1, 1), '#e2337f', { pos: [s * 0.0605, 0.058 + R() * 0.084, -0.085 + R() * 0.12], rot: [R() * Math.PI, 0, 0], scale: [0.003, 0.004, 0.012] });
    }
    const e = new Builder();
    addEyes(e, 0.083, 0.14, 0.026, 0.011);
    super(b, e, 0.083);
    // Four stubby legs, paddling the air.
    const lb = new Builder();
    lb.add(gem(), grey, { pos: [0, -0.018, 0], scale: [0.017, 0.026, 0.017] });
    this.legs = this.copies(lb, 4);
    const tb = new Builder();
    tb.add(new THREE.CapsuleGeometry(1, 2, 2, 6), grey, { pos: [0, 0.012, -0.03], rot: [-1.0, 0, 0], scale: [0.012, 0.012, 0.012] });
    this.tail = this.part(tb, [0, 0.08, -0.11]);
    // The rainbow: six stripes in one piece, a few copies end to end stepping up and down behind.
    const rb = new Builder();
    ['#ff4d4d', '#ff9f2e', '#ffe03d', '#5fd65a', '#3fa6ff', '#8b5cff'].forEach((c, i) => rb.add(new THREE.BoxGeometry(1, 1, 1), c, { pos: [0, 0.14 - i * 0.016, 0], scale: [0.026, 0.016, 1] }));
    const rmat = new THREE.MeshBasicMaterial({ vertexColors: true });
    this.trail = this.copies(rb, 6, rmat);
    this.trail.castShadow = false;
  }
  protected animate(_dt: number, t: number, move: number) {
    // It floats, bobbing on a two-step beat, its legs paddling; the rainbow stretches out behind as it goes.
    const step = Math.floor(t * 5) % 2;
    this.bodyGroup.position.y = 0.12 + step * 0.012 + Math.sin(t * 1.7) * 0.012 + move * 0.03;
    this.bodyGroup.rotation.x = move * 0.06;
    [
      [-0.035, 0.04],
      [0.035, 0.04],
      [-0.035, -0.085],
      [0.035, -0.085],
    ].forEach(([x, z], i) => placeCopy(this.legs, i, [x, 0.03, z], [Math.sin(t * (8 + move * 6) + i * 1.6) * 0.6, 0, 0]));
    this.legs.instanceMatrix.needsUpdate = true;
    this.tail.rotation.y = Math.sin(t * 5) * 0.5;
    const len = 0.04 + move * 0.05;
    for (let i = 0; i < 6; i++) {
      const y = ((i + step) % 2 ? 0.006 : -0.006) - 0.012;
      placeCopy(this.trail, i, [0, y, -0.11 - (i + 0.5) * len], [0, 0, 0], [1, 1, len * (1 - i * 0.04)]);
    }
    this.trail.instanceMatrix.needsUpdate = true;
  }
}

/** 3. A shiba inu giving you the side-eye, curly tail wagging. */
class Doge extends Jointed {
  private tail: THREE.Group;
  constructor() {
    const b = new Builder();
    const tan = '#dc9149';
    const cream = '#f8ead2';
    b.addColored(
      sculpted('doge', () => {
        const sc = new Sculpt();
        sc.add(ellipsoid('body', [0, 0.1, -0.025], [0.062, 0.058, 0.088], { name: 'torso' }));
        sc.add(ellipsoid('body', [0, 0.2, 0.06], [0.082, 0.072, 0.072], { k: 0.03, name: 'head' }));
        for (const s of [-1, 1]) sc.add(ellipsoid('body', [s * 0.042, 0.17, 0.09], [0.04, 0.034, 0.04], { k: 0.02, name: 'cheek' }));
        sc.add(ellipsoid('body', [0, 0.172, 0.13], [0.038, 0.03, 0.036], { k: 0.02, name: 'muzzle' }));
        for (const s of [-1, 1]) sc.add(pyramid('body', [s * 0.048, 0.252, 0.055], 0.024, 0.058, 0.013, { rot: [0.1, 0, -s * 0.3], k: 0.008, thin: true, name: 'ear' }));
        for (const s of [-1, 1]) for (const z of [0.035, -0.085]) sc.add(rod('body', [s * 0.034, 0.07, z], [s * 0.035, 0.014, z + 0.008], 0.021, 0.018, { k: 0.015, name: 'leg' }));
        return {
          sc,
          marks: {
            base: tan,
            marks: [
                            { color: cream, f: either(regionOf(sc, 'muzzle'), (q) => Math.max(regionOf(sc, 'cheek')(q), q.p.y - 0.185 + (q.p.z - 0.09) * 0.3)) },
              { color: cream, f: either(patch([0, 0.115, 0.05], [0.05, 0.05, 0.04]), (q) => q.p.y - 0.032) },
              { color: cream, f: either(patch([0.03, 0.242, 0.112], [0.009, 0.006, 0.008]), patch([-0.03, 0.242, 0.112], [0.009, 0.006, 0.008])) },
              { color: BLUSH, f: blushes(0.175, 0.12, 0.06, 0.013) },
            ],
          },
        };
      }, 0.022),
    );
    b.add(gem(), INK, { pos: [0, 0.188, 0.165], scale: [0.014, 0.01, 0.01] });
    // A knowing little smirk, off to one side.
    arc(b, [0.012, 0.164, 0.158], 0.012, INK, false, Math.PI * 0.7, [0.2, 0.2, 0.25]);
    const e = new Builder();
    // The side-eye: white showing, pupils hard over to one side.
    for (const s of [-1, 1]) {
      e.add(gem(), '#fffdf8', { pos: [s * 0.032, 0.212, 0.122], scale: [0.017, 0.012, 0.009] });
      e.add(gem(), INK, { pos: [s * 0.032 + 0.009, 0.212, 0.128], scale: [0.009, 0.011, 0.007] });
    }
    super(b, e, 0.212);
    const tb = new Builder();
    tb.add(new THREE.TorusGeometry(0.03, 0.015, 6, 12, Math.PI * 1.5), tan, { pos: [0, 0.03, 0], rot: [0, Math.PI / 2, -0.4] });
    tb.add(gem(), cream, { pos: [0, 0.03 + 0.03 * Math.sin(1.1), 0.03 * Math.cos(1.1) - 0.0], scale: 0.016 });
    this.tail = this.part(tb, [0, 0.13, -0.1]);
  }
  protected animate(_dt: number, t: number, move: number) {
    this.bodyGroup.position.y = hop(t, move, 0.03, 13) + Math.sin(t * 2.4) * 0.003;
    this.bodyGroup.rotation.x = move * 0.08;
    // A doubtful head tilt when still.
    this.bodyGroup.rotation.z = Math.tanh(Math.sin(t * 0.6) * 3) * 0.08 * (1 - move);
    this.tail.rotation.z = Math.sin(t * (10 + move * 8)) * 0.35;
  }
}

/** 4. A flat-faced cat who is not impressed, and shakes its head about it now and then. */
class Grumpy extends Jointed {
  private head: THREE.Group;
  constructor() {
    const b = new Builder();
    const cream = '#efe3cf';
    const dusk = '#8a776a';
    b.addColored(
      sculpted('grumpy', () => {
        const sc = new Sculpt();
        sc.add(ellipsoid('body', [0, 0.09, -0.02], [0.085, 0.088, 0.1], { name: 'body' }));
        for (const s of [-1, 1]) sc.add(ellipsoid('body', [s * 0.036, 0.018, 0.075], [0.024, 0.018, 0.034], { k: 0.015, name: 'paw' }));
        sc.add(rod('body', [0.075, 0.03, -0.085], [0.07, 0.022, 0.07], 0.021, 0.017, { k: 0.015, name: 'tail' }));
        return {
          sc,
          marks: {
            base: cream,
            marks: [
              { color: dusk, f: either(regionOf(sc, 'tail'), (q) => Math.max(regionOf(sc, 'body')(q), 0.14 - q.p.y - q.p.z * 1.2)) },
              { color: '#fbf7ef', f: regionOf(sc, 'paw') },
            ],
          },
        };
      }),
    );
    const e = new Builder();
    // Blue eyes under heavy, cross lids.
    for (const s of [-1, 1]) {
      e.add(gem(), '#79b4e0', { pos: [s * 0.032, 0.208, 0.107], scale: [0.016, 0.014, 0.008] });
      e.add(gem(), INK, { pos: [s * 0.032, 0.206, 0.112], scale: [0.008, 0.009, 0.005] });
      e.add(gem(), '#6e5e54', { pos: [s * 0.032, 0.216, 0.109], rot: [0, 0, s * 0.35], scale: [0.02, 0.009, 0.01] });
    }
    super(b, e, 0.208);
    const hb = new Builder();
    const at: Vec3 = [0, 0.18, 0.03];
    hb.addColored(
      sculpted('grumpy-head', () => {
        const sc = new Sculpt();
        sc.add(ellipsoid('body', [0, 0.02, 0.01], [0.09, 0.074, 0.074], { name: 'head' }));
        sc.add(ellipsoid('body', [0, -0.005, 0.066], [0.042, 0.026, 0.025], { k: 0.02, name: 'muzzle' }));
        for (const s of [-1, 1]) sc.add(pyramid('body', [s * 0.05, 0.07, 0.0], 0.03, 0.055, 0.013, { rot: [0, 0, -s * 0.42], k: 0.01, name: 'ear' }));
        return {
          sc,
          marks: {
            base: cream,
            marks: [
              { color: '#fbf7ef', f: regionOf(sc, 'muzzle') },
              { color: dusk, f: either(regionOf(sc, 'ear'), patch([0.032, 0.03, 0.07], [0.024, 0.019, 0.03]), patch([-0.032, 0.03, 0.07], [0.024, 0.019, 0.03]), patch([0, 0.035, 0.08], [0.011, 0.03, 0.02]), (q) => Math.max(-0.03 - q.p.z, 0.03 - q.p.y)) },
            ],
          },
        };
      }),
    );
    hb.add(gem(), '#d68a8e', { pos: [0, 0.01, 0.089], scale: [0.011, 0.007, 0.006] });
    // The famous frown.
    arc(hb, [0, -0.026, 0.086], 0.026, '#3a2a28', true, Math.PI * 0.8);
    this.head = this.part(hb, at);
    this.eyesOn(this.head);
  }
  protected animate(_dt: number, t: number, move: number) {
    // A reluctant plod, a heavy sigh, and now and then a slow shake of the head.
    this.bodyGroup.position.y = hop(t, move, 0.018, 8);
    this.bodyGroup.rotation.z = Math.sin(t * 8) * 0.05 * move;
    const sigh = 1 + Math.sin(t * 1.4) * 0.025 * (1 - move);
    this.bodyGroup.scale.set(sigh, 1 / sigh, sigh);
    const no = Math.pow(Math.max(0, Math.sin(t * 0.45)), 20);
    this.head.rotation.y = Math.sin(t * 9) * 0.3 * no;
    this.head.rotation.x = 0.05 + move * 0.05;
  }
}

/** 5. A yellow rubber duck: bobs as if on bathwater, and gives a squeak (a squash) now and then. */
class Duck extends PetRig {
  constructor() {
    const b = new Builder();
    const yellow = '#ffd43b';
    const orange = '#f5932a';
    b.addColored(
      sculpted('duck', () => {
        const sc = new Sculpt();
        sc.add(ellipsoid('body', [0, 0.085, -0.015], [0.1, 0.075, 0.12], { name: 'body' }));
        sc.add(ellipsoid('body', [0, 0.125, -0.115], [0.045, 0.04, 0.035], { rot: [0.7, 0, 0], k: 0.04, name: 'tail' }));
        sc.add(ellipsoid('body', [0, 0.2, 0.045], [0.07, 0.068, 0.066], { k: 0.035, name: 'head' }));
        for (const s of [-1, 1]) sc.add(ellipsoid('body', [s * 0.088, 0.1, -0.025], [0.024, 0.042, 0.065], { rot: [0.25, 0, 0], k: 0.02, name: 'wing' }));
        sc.add(ellipsoid('body', [0, 0.183, 0.11], [0.044, 0.016, 0.04], { k: 0.012, name: 'beak' }));
        sc.add(ellipsoid('body', [0, -0.5, 0], [0.6, 0.505, 0.6], { k: 0.01, carve: true }));
        return {
          sc,
          marks: {
            base: yellow,
            marks: [
              { color: '#c96a1c', f: (q) => Math.max(regionOf(sc, 'beak')(q), Math.abs(q.p.y - 0.181) - 0.0025, 0.11 - q.p.z) },
              { color: orange, f: regionOf(sc, 'beak') },
              { color: '#f6c22a', f: regionOf(sc, 'wing') },
              { color: BLUSH, f: blushes(0.19, 0.095, 0.05, 0.014) },
            ],
          },
        };
      }),
    );
    const e = new Builder();
    addEyes(e, 0.218, 0.1, 0.034, 0.014);
    super(b, e, 0.218);
  }
  protected animate(_dt: number, t: number, move: number) {
    const squeak = Math.pow(Math.max(0, Math.sin(t * 1.6)), 30);
    this.bodyGroup.scale.set(1 + squeak * 0.12, 1 - squeak * 0.2, 1 + squeak * 0.12);
    this.bodyGroup.position.y = hop(t, move, 0.025, 10);
    this.bodyGroup.rotation.x = Math.sin(t * 2.1) * 0.09 + move * 0.08;
    this.bodyGroup.rotation.z = Math.sin(t * 1.7) * 0.06 + Math.sin(t * 10) * 0.08 * move;
  }
}

/** 6. An egg-shaped pocket pet gadget, a little pixel critter on its screen, hopping on stubby feet. */
class PocketPal extends PetRig {
  constructor() {
    const b = new Builder();
    const shell = '#f59cc4';
    b.addColored(
      sculpted('pocketpal', () => {
        const sc = new Sculpt();
        sc.add(ellipsoid('body', [0, 0.155, 0], [0.105, 0.125, 0.058], { name: 'shell' }));
        sc.add(ellipsoid('body', [0, 0.115, 0], [0.11, 0.088, 0.06], { k: 0.05, name: 'shell' }));
        for (const s of [-1, 1]) sc.add(ellipsoid('body', [s * 0.042, 0.016, 0.008], [0.022, 0.014, 0.024], { k: 0.015, name: 'foot' }));
        return {
          sc,
          marks: {
            base: shell,
            marks: [
              { color: '#fff3f8', f: (q) => Math.max(patch([0, 0.15, 0.05], [0.078, 0.098, 0.05])(q), 0.02 - q.p.z) },
              { color: '#ffd6e7', f: spots(3, 10, [0, 0.15, 0], [0.105, 0.125, 0.058], [0.011, 0.011, 0.011], (d) => d.z < 0.2) },
              { color: '#e07aa8', f: regionOf(sc, 'foot') },
            ],
          },
        };
      }, 0.02),
    );
    // The screen in its frame, and three buttons under it.
    b.add(new THREE.BoxGeometry(1, 1, 1), '#6a5378', { pos: [0, 0.17, 0.058], scale: [0.092, 0.076, 0.016] });
    b.add(new THREE.BoxGeometry(1, 1, 1), '#c9dfb0', { pos: [0, 0.17, 0.06], scale: [0.08, 0.064, 0.016] });
    for (const x of [-0.032, 0, 0.032]) b.add(gem(), '#ffcf4a', { pos: [x, 0.088 - Math.abs(x) * 0.25, 0.06], scale: [0.011, 0.011, 0.008] });
    // A keyring loop on top.
    b.add(new THREE.TorusGeometry(1, 0.2, 5, 12), '#c9ccd6', { pos: [0, 0.292, 0], rot: [0, Math.PI / 2, 0], scale: 0.02 });
    // The pixel critter: a round little blob, its eyes (in the eye mesh, to blink) and a smile.
    const art = ['..####..', '.#....#.', '#.e..e.#', '#......#', '#..##..#', '.######.'];
    const px = 0.0074;
    const top = 0.19;
    const e = new Builder();
    art.forEach((row, r) =>
      [...row].forEach((c, i) => {
        if (c === '.') return;
        (c === 'e' ? e : b).add(new THREE.BoxGeometry(1, 1, 1), '#2f3b2a', { pos: [(i - 3.5) * px, top - r * px, 0.0685], scale: [px * 0.9, px * 0.9, 0.002] });
      }),
    );
    super(b, e, top - 2 * px);
  }
  protected animate(_dt: number, t: number, move: number) {
    const air = hop(t, move, 0.05, 9);
    this.bodyGroup.position.y = air;
    const land = move * Math.max(0, 0.02 - air) * 6;
    this.bodyGroup.scale.set(1 + land, 1 - land, 1 + land);
    this.bodyGroup.rotation.z = Math.sin(t * 2.2) * 0.08 * (1 - move);
    this.bodyGroup.rotation.x = move * 0.1;
  }
}

/** 7. A cross little brown mushroom on big feet, stomping along. */
class Shroom extends Jointed {
  private feet: THREE.InstancedMesh;
  constructor() {
    const b = new Builder();
    const brown = '#8e5530';
    const tan = '#f1d09c';
    b.addColored(
      sculpted('shroom', () => {
        const sc = new Sculpt();
        sc.add(ellipsoid('body', [0, 0.205, 0], [0.14, 0.085, 0.125], { name: 'cap' }));
        sc.add(ellipsoid('body', [0, 0.145, 0.012], [0.11, 0.075, 0.1], { k: 0.04, name: 'face' }));
        sc.add(ellipsoid('body', [0, 0.075, 0], [0.058, 0.05, 0.052], { k: 0.02, name: 'stem' }));
        return {
          sc,
          marks: {
            base: brown,
            marks: [
              { color: '#3a2420', f: (q) => Math.max(Math.abs(Math.hypot(q.p.x, q.p.y - 0.165) - 0.05) - 0.003, q.p.y - 0.123, 0.06 - q.p.z) },
              { color: tan, f: (q) => q.p.y - 0.135 - Math.max(0, -q.p.z) * 0.4 },
            ],
          },
        };
      }, 0.022),
    );
    // Thick cross brows and two little fangs.
    for (const s of [-1, 1]) {
      b.add(new THREE.BoxGeometry(1, 1, 1), '#2a1c18', { pos: [s * 0.034, 0.212, 0.113], rot: [-0.3, 0, s * 0.42], scale: [0.042, 0.013, 0.014] });
      b.add(spike(4), '#fffaf0', { pos: [s * 0.03, 0.124, 0.099], scale: [0.009, 0.02, 0.008] });
    }
    const e = new Builder();
    for (const s of [-1, 1]) {
      e.add(gem(), '#fffdf8', { pos: [s * 0.024, 0.18, 0.112], scale: [0.019, 0.03, 0.011] });
      e.add(gem(), INK, { pos: [s * 0.021, 0.177, 0.12], scale: [0.009, 0.016, 0.006] });
    }
    super(b, e, 0.18);
    const fb = new Builder();
    fb.add(gem(), '#4a2b1d', { pos: [0, 0.02, 0.012], scale: [0.034, 0.022, 0.045] });
    this.feet = this.copies(fb, 2);
  }
  protected animate(_dt: number, t: number, move: number) {
    // A side-to-side stomp, each foot lifting in turn; still, a cross little bounce now and then.
    const w = Math.sin(t * 9);
    const huff = Math.pow(Math.max(0, Math.sin(t * 1.1)), 16) * 0.025 * (1 - move);
    this.bodyGroup.position.y = Math.abs(w) * 0.012 * move + huff;
    this.bodyGroup.rotation.z = w * 0.1 * move;
    [-1, 1].forEach((s, i) => placeCopy(this.feet, i, [s * 0.045, Math.max(0, w * s) * 0.03 * move - this.bodyGroup.position.y, 0], [-Math.max(0, w * s) * 0.4 * move, 0, -this.bodyGroup.rotation.z]));
    this.feet.instanceMatrix.needsUpdate = true;
  }
}

/** 8. A fluffy yellow chocobo chick with a feathery crest, running about. */
class Kweh extends Jointed {
  private crest: THREE.Group;
  constructor() {
    const b = new Builder();
    const yellow = '#ffd23f';
    const orange = '#f08a24';
    b.addColored(
      sculpted('kweh', () => {
        const sc = new Sculpt();
        sc.add(ellipsoid('body', [0, 0.115, -0.015], [0.08, 0.075, 0.088], { name: 'body' }));
        sc.add(ellipsoid('body', [0, 0.215, 0.03], [0.075, 0.07, 0.07], { k: 0.04, name: 'head' }));
        for (const s of [-1, 1]) sc.add(ellipsoid('body', [s * 0.08, 0.125, -0.025], [0.018, 0.045, 0.05], { rot: [0.3, 0, s * 0.5], k: 0.015, name: 'wing' }));
        sc.add(ellipsoid('body', [0, 0.14, -0.1], [0.04, 0.022, 0.045], { rot: [-0.7, 0, 0], k: 0.02, name: 'tail' }));
        sc.add(ellipsoid('body', [0, 0.196, 0.1], [0.03, 0.018, 0.04], { rot: [0.15, 0, 0], k: 0.012, name: 'beak' }));
        for (const s of [-1, 1]) {
          sc.add(rod('body', [s * 0.03, 0.06, 0], [s * 0.032, 0.014, 0.008], 0.011, 0.009, { k: 0.008, name: 'leg' }));
          sc.add(ellipsoid('body', [s * 0.033, 0.009, 0.03], [0.022, 0.009, 0.03], { k: 0.01, name: 'leg' }));
        }
        return {
          sc,
          marks: {
            base: yellow,
            marks: [
              { color: orange, f: regionOf(sc, 'leg') },
              { color: '#f5a84a', f: regionOf(sc, 'beak') },
              { color: '#f4b52a', f: regionOf(sc, 'wing', 'tail') },
              { color: BLUSH, f: blushes(0.2, 0.085, 0.055, 0.014) },
            ],
          },
        };
      }, 0.022),
    );
    const e = new Builder();
    irisEyes(e, 0.232, 0.087, 0.036, 0.019, '#3d8fb0');
    super(b, e, 0.232);
    // The crest: three long feathers swept back, bouncing as it runs.
    const cb = new Builder();
    for (const [x, rz, len] of [
      [-0.016, 0.35, 0.05],
      [0, 0, 0.065],
      [0.016, -0.35, 0.05],
    ]) {
      cb.add(gem(), yellow, { pos: [x, len * 0.85, -len * 0.4], rot: [-0.55, 0, rz], scale: [0.011, len, 0.016] });
    }
    this.crest = this.part(cb, [0, 0.27, 0.025]);
  }
  protected animate(_dt: number, t: number, move: number) {
    this.bodyGroup.position.y = hop(t, move, 0.045, 14) + Math.sin(t * 2.5) * 0.004;
    this.bodyGroup.rotation.x = move * 0.18;
    this.bodyGroup.rotation.z = Math.sin(t * 14) * 0.08 * move;
    this.crest.rotation.x = Math.sin(t * 14) * 0.25 * move + Math.sin(t * 1.9) * 0.08;
  }
}

/** 9. A brown-and-white mogwai with great wide ears that twitch; it hums along, swaying. */
class Mogwai extends Jointed {
  private ears: THREE.Group[] = [];
  constructor() {
    const b = new Builder();
    const brown = '#8a5a3a';
    const white = '#f7f0e6';
    b.addColored(
      sculpted('mogwai', () => {
        const sc = new Sculpt();
        sc.add(ellipsoid('body', [0, 0.08, -0.01], [0.068, 0.07, 0.064], { name: 'body' }));
        sc.add(ellipsoid('body', [0, 0.19, 0.02], [0.08, 0.072, 0.072], { k: 0.03, name: 'head' }));
        sc.add(ellipsoid('body', [0, 0.165, 0.076], [0.04, 0.028, 0.026], { k: 0.02, name: 'muzzle' }));
        for (const s of [-1, 1]) sc.add(ellipsoid('body', [s * 0.062, 0.09, 0.03], [0.019, 0.035, 0.02], { rot: [0.3, 0, s * 0.45], k: 0.012, name: 'arm' }));
        for (const s of [-1, 1]) sc.add(ellipsoid('body', [s * 0.034, 0.013, 0.038], [0.024, 0.013, 0.03], { k: 0.015, name: 'foot' }));
        return {
          sc,
          marks: {
            base: brown,
            marks: [
              { color: '#e8c4b0', f: regionOf(sc, 'foot') },
              // Brown round the eyes, a white blaze up the middle, white cheeks, muzzle and tummy.
              { color: '#6a4028', f: either(patch([0.034, 0.2, 0.07], [0.03, 0.026, 0.03]), patch([-0.034, 0.2, 0.07], [0.03, 0.026, 0.03])) },
              { color: white, f: either(regionOf(sc, 'muzzle'), patch([0, 0.2, 0.08], [0.012, 0.07, 0.03]), patch([0, 0.155, 0.06], [0.07, 0.03, 0.04]), patch([0, 0.08, 0.06], [0.045, 0.05, 0.03])) },
              { color: BLUSH, f: blushes(0.165, 0.08, 0.055, 0.012) },
            ],
          },
        };
      }, 0.022),
    );
    b.add(gem(), '#6b3a32', { pos: [0, 0.178, 0.1], scale: [0.011, 0.007, 0.007] });
    arc(b, [0, 0.157, 0.098], 0.012, '#5a3226', false, Math.PI * 0.7);
    const e = new Builder();
    for (const s of [-1, 1]) {
      e.add(gem(), '#2e1a12', { pos: [s * 0.034, 0.2, 0.085], scale: [0.023, 0.025, 0.014] });
      e.add(new THREE.IcosahedronGeometry(1, SMOOTH_LOOK ? 1 : 0), '#fffdf8', { pos: [s * 0.034 + 0.008, 0.209, 0.097], scale: 0.0075 });
      e.add(new THREE.IcosahedronGeometry(1, 0), '#fffdf8', { pos: [s * 0.034 - 0.007, 0.192, 0.098], scale: 0.0035 });
    }
    super(b, e, 0.2);
    for (const s of [-1, 1]) {
      const eb = new Builder();
      eb.addColored(
        sculpted(`mogwai-ear${s}`, () => {
          const sc = new Sculpt();
          sc.add(ellipsoid('body', [s * 0.058, 0, 0], [0.062, 0.038, 0.011], { rot: [0.35, 0, s * -0.15], name: 'ear' }));
          return {
            sc,
            marks: {
              base: brown,
              marks: [
                { color: '#6a4028', f: patch([s * 0.075, 0.012, 0.01], [0.012, 0.01, 0.02]) },
                { color: '#f0b9ae', f: (q) => Math.max(patch([s * 0.055, -0.003, 0], [0.05, 0.028, 0.03])(q), -q.p.z + 0.002 - (q.p.y) * 0.3) },
              ],
            },
          };
        }, 0.016),
      );
      this.ears.push(this.part(eb, [s * 0.07, 0.21, 0.01]));
    }
  }
  protected animate(_dt: number, t: number, move: number) {
    this.bodyGroup.position.y = hop(t, move, 0.025, 11) + Math.sin(t * 3.2) * 0.003;
    this.bodyGroup.rotation.z = Math.sin(t * 1.6) * 0.07 * (1 - move) + Math.sin(t * 11) * 0.06 * move;
    this.bodyGroup.rotation.x = move * 0.1;
    const twitch = Math.pow(Math.max(0, Math.sin(t * 1.3)), 12);
    this.ears.forEach((ear, i) => {
      const s = i ? 1 : -1;
      ear.rotation.z = s * (Math.sin(t * 22) * 0.2 * twitch - 0.12 * move + Math.sin(t * 2.1) * 0.05);
    });
  }
}

/** 10. A paperclip helper with googly eyes and busy eyebrows, hopping along on its bottom curve. */
class Clip extends Jointed {
  private brows: THREE.Group;
  constructor() {
    const b = new Builder();
    // The wire: down the outer side, round the big bottom loop, up and over the top, round the small loop, up the middle.
    const w = 0.055;
    const g = 0.022;
    const pts: THREE.Vector3[] = [];
    const line = (x: number, y0: number, y1: number) => {
      for (let i = 0; i <= 4; i++) pts.push(new THREE.Vector3(x, y0 + ((y1 - y0) * i) / 4, 0));
    };
    const turn = (cx: number, cy: number, r: number, a0: number, a1: number) => {
      for (let i = 1; i < 10; i++) {
        const a = a0 + ((a1 - a0) * i) / 10;
        pts.push(new THREE.Vector3(cx + Math.cos(a) * r, cy + Math.sin(a) * r, 0));
      }
    };
    const yb = 0.072;
    const yt = 0.25;
    line(-w, 0.2, yb);
    turn(0, yb, w, Math.PI, Math.PI * 2);
    line(w, yb, yt);
    turn(g / 2, yt, w - g / 2, 0, Math.PI);
    line(-w + g, yt, yb + 0.03);
    turn(-g / 2, yb + 0.03, w - 1.5 * g, Math.PI, Math.PI * 2);
    line(w - 2 * g, yb + 0.03, 0.2);
    const path = new THREE.CurvePath<THREE.Vector3>();
    for (let i = 1; i < pts.length; i++) if (pts[i].distanceTo(pts[i - 1]) > 1e-5) path.add(new THREE.LineCurve3(pts[i - 1], pts[i]));
    const tube = new THREE.TubeGeometry(path, 90, 0.0085, 6, false);
    b.add(tube, '#c7ccd6', { rot: [-0.12, 0, 0] });
    tube.dispose();
    const e = new Builder();
    for (const s of [-1, 1]) {
      e.add(gem(), '#fffdf8', { pos: [s * 0.022, 0.2, 0.004], scale: [0.02, 0.023, 0.014] });
      e.add(gem(), INK, { pos: [s * 0.022 - 0.004, 0.196, 0.016], scale: [0.008, 0.009, 0.005] });
    }
    super(b, e, 0.2);
    const bb = new Builder();
    for (const s of [-1, 1]) arc(bb, [s * 0.024, 0, 0], 0.016, '#2a2228', true, Math.PI * 0.75, [0, 0, s * -0.25]);
    this.brows = this.part(bb, [0, 0.222, 0.004]);
  }
  protected animate(_dt: number, t: number, move: number) {
    const air = hop(t, move, 0.06, 9);
    this.bodyGroup.position.y = air;
    const land = move * Math.max(0, 0.02 - air) * 5;
    this.bodyGroup.scale.set(1 + land, 1 - land, 1);
    this.bodyGroup.rotation.x = move * 0.15;
    this.bodyGroup.rotation.z = Math.sin(t * 1.5) * 0.1 * (1 - move);
    // The eyebrows go up when it has a suggestion (often).
    const idea = Math.pow(Math.max(0, Math.sin(t * 1.2)), 6);
    this.brows.position.y = 0.222 + (idea * (1 - move) + move * 0.5) * 0.014;
    this.brows.rotation.z = Math.sin(t * 2.4) * 0.12 * idea;
  }
}

/** 11. A round fluffy tribble, no face to speak of, that purrs (a quick shiver) and wobbles. */
class Tribble extends PetRig {
  constructor() {
    const b = new Builder();
    const fur = '#a87e54';
    const c: Vec3 = [0, 0.085, 0];
    const r: Vec3 = [0.12, 0.08, 0.11];
    // A soft oval covered all over in little puffs of fur, in a few shades, so its outline is fluffy.
    b.addColored(
      sculpted('tribble', () => {
        const sc = new Sculpt();
        sc.add(ellipsoid('body', c, r, { name: 'fur' }));
        const R = rng(17);
        for (let i = 0; i < 70; i++) {
          const a = R() * Math.PI * 2;
          const up = Math.asin(R() * 1.15 - 0.2);
          const d = new THREE.Vector3(Math.cos(a) * Math.cos(up), Math.sin(up), Math.sin(a) * Math.cos(up));
          const s = 0.018 + R() * 0.012;
          sc.add(ellipsoid('body', [c[0] + d.x * r[0], c[1] + d.y * r[1], c[2] + d.z * r[2]], [s, s * 0.9, s], { k: 0.012, name: ['puff', 'light', 'dark'][i % 3] }));
        }
        sc.add(ellipsoid('body', [0, -0.5, 0], [0.6, 0.508, 0.6], { k: 0.01, carve: true }));
        return { sc, marks: { base: fur, marks: [{ color: '#b78d61', f: regionOf(sc, 'light') }, { color: '#9a7149', f: regionOf(sc, 'dark') }, { color: '#8a6440', f: (q) => q.p.y - 0.025 }] } };
      }, 0.018),
    );
    super(b, new Builder(), 0.1);
    // No eyes to blink (an empty mesh is left out altogether).
    this.eyes.removeFromParent();
  }
  protected animate(_dt: number, t: number, move: number) {
    // The purr: a fine fast shiver; a slow wobble on top; and when on the move, a scooting squash.
    const purr = Math.sin(t * 40) * 0.014 * (1 - move);
    const scoot = Math.sin(t * 10);
    const sq = 1 + purr + scoot * 0.08 * move;
    this.bodyGroup.scale.set(1 / Math.sqrt(sq), sq, 1 / Math.sqrt(sq));
    this.bodyGroup.position.y = Math.max(0, scoot) * 0.025 * move;
    this.bodyGroup.rotation.z = Math.sin(t * 2.6) * 0.09;
    this.bodyGroup.rotation.x = Math.sin(t * 1.9) * 0.05 + move * 0.08;
  }
}

/** 12. A small white furry luck dragon with a dog's face, its long body rippling as it flies. */
class LuckDragon extends Jointed {
  private head: THREE.Group;
  private segs: THREE.InstancedMesh;
  private readonly n = 10;
  constructor() {
    const white = '#fbf7ef';
    const cream = '#efe4d2';
    const pink = '#f2c4c8';
    const b = new Builder();
    // Two little front paws, tucked up under its chin.
    for (const x of [-0.03, 0.03]) b.add(gem(), white, { pos: [x, -0.005, 0.04], rot: [0.4, 0, 0], scale: [0.016, 0.026, 0.018] });
    const e = new Builder();
    irisEyes(e, 0.075, 0.107, 0.03, 0.017, '#9a3a2a', 0.5);
    super(b, e, 0.075);
    const hb = new Builder();
    hb.addColored(
      sculpted('luckdragon', () => {
        const sc = new Sculpt();
        sc.add(ellipsoid('body', [0, 0, 0], [0.06, 0.055, 0.058], { name: 'head' }));
        sc.add(ellipsoid('body', [0, -0.018, 0.058], [0.036, 0.03, 0.045], { k: 0.03, name: 'muzzle' }));
        for (const s of [-1, 1]) sc.add(ellipsoid('body', [s * 0.058, -0.022, -0.01], [0.014, 0.048, 0.028], { rot: [0.2, 0, s * 0.35], k: 0.01, name: 'ear' }));
        sc.add(ellipsoid('body', [0, 0.05, -0.015], [0.03, 0.026, 0.04], { k: 0.025, name: 'mane' }));
        sc.add(ellipsoid('body', [0, 0.035, -0.055], [0.026, 0.024, 0.035], { k: 0.025, name: 'mane' }));
        return {
          sc,
          marks: {
            base: white,
            marks: [
              { color: pink, f: (q) => Math.max(regionOf(sc, 'ear')(q), Math.abs(q.p.x) - 0.052) },
              { color: cream, f: regionOf(sc, 'ear') },
              { color: cream, f: regionOf(sc, 'mane') },
              { color: BLUSH, f: blushes(-0.015, 0.06, 0.045, 0.012) },
            ],
          },
        };
      }, 0.018),
    );
    hb.add(gem(), '#5a3a3a', { pos: [0, -0.008, 0.102], scale: [0.012, 0.009, 0.008] });
    hb.add(gem(), '#ef8a96', { pos: [0.008, -0.044, 0.085], rot: [0.5, 0, 0], scale: [0.011, 0.004, 0.014] });
    arc(hb, [0, -0.034, 0.093], 0.014, '#6a4a4a', false, Math.PI * 0.8);
    this.head = this.part(hb, [0, 0.06, 0.06]);
    this.eyesOn(this.head);
    // The body: furry beads, white over a pink belly with a tuft of mane on each.
    const sb = new Builder();
    sb.addColored(
      sculpted('luckdragon-seg', () => {
        const sc = new Sculpt();
        sc.add(ellipsoid('body', [0, 0, 0], [0.048, 0.044, 0.042], { name: 'seg' }));
        sc.add(ellipsoid('body', [0, 0.04, -0.005], [0.016, 0.022, 0.026], { k: 0.015, name: 'tuft' }));
        return { sc, marks: { base: white, marks: [{ color: cream, f: regionOf(sc, 'tuft') }, { color: pink, f: (q) => q.p.y + 0.022 }] } };
      }, 0.018),
    );
    this.segs = this.copies(sb, this.n);
  }
  protected animate(_dt: number, t: number, move: number) {
    this.bodyGroup.position.y = 0.17 + Math.sin(t * 1.8) * 0.03 + move * 0.04;
    this.bodyGroup.rotation.x = move * 0.12;
    const speed = 3 + move * 3;
    // Each bead follows a ripple running back along the body, smaller towards the tail.
    let prev: Vec3 = [0, 0.05, 0.03];
    for (let i = 0; i < this.n; i++) {
      const k = i / (this.n - 1);
      const z = -0.02 - i * 0.04;
      const y = 0.03 + Math.sin(t * speed - i * 0.9) * (0.02 + k * 0.03);
      const x = Math.sin(t * speed * 0.6 - i * 0.7) * k * 0.035;
      const pitch = Math.atan2(prev[1] - y, prev[2] - z);
      const s = 1 - k * 0.5;
      placeCopy(this.segs, i, [x, y, z], [-pitch, 0, 0], [s, s, s]);
      prev = [x, y, z];
    }
    this.segs.instanceMatrix.needsUpdate = true;
    this.head.rotation.x = Math.sin(t * speed - 0.9) * 0.12;
    this.head.rotation.z = Math.sin(t * 1.1) * 0.1;
  }
}

/** 13. A fluffy white flying bison with six legs and a brown arrow, drifting along on the air. */
class SkyBison extends Jointed {
  private tail: THREE.Group;
  constructor() {
    const b = new Builder();
    const white = '#f6f2e9';
    const arrow = '#7b5233';
    b.addColored(
      sculpted('skybison', () => {
        const sc = new Sculpt();
        sc.add(ellipsoid('body', [0, 0.13, -0.02], [0.115, 0.09, 0.135], { name: 'body' }));
        sc.add(ellipsoid('body', [0, 0.15, 0.125], [0.075, 0.065, 0.058], { k: 0.04, name: 'head' }));
        sc.add(ellipsoid('body', [0, 0.122, 0.172], [0.05, 0.032, 0.028], { k: 0.03, name: 'muzzle' }));
        for (const s of [-1, 1]) {
          sc.add(rod('body', [s * 0.05, 0.19, 0.12], [s * 0.088, 0.228, 0.142], 0.014, 0.007, { k: 0.008, name: 'horn' }));
          sc.add(ellipsoid('body', [s * 0.075, 0.172, 0.095], [0.026, 0.01, 0.017], { rot: [0, 0, -s * 0.4], k: 0.01, name: 'ear' }));
          for (const z of [0.065, -0.02, -0.105]) sc.add(rod('body', [s * 0.07, 0.075, z], [s * 0.074, 0.03, z + 0.006], 0.026, 0.022, { k: 0.02, name: 'leg' }));
        }
        const head = regionOf(sc, 'head');
        const body = regionOf(sc, 'body');
        // Arrows pointing forward: a shaft and a head, on the crown and down the back.
        const arrowAt = (z0: number, z1: number, wShaft: number, wHead: number, len: number): Field => (q) => {
          const z = q.p.z;
          const shaft = Math.max(Math.abs(q.p.x) - wShaft, z0 - z, z - (z1 - len));
          const tip = Math.max(Math.abs(q.p.x) - (z1 - z) * (wHead / len), z1 - len - z, z - z1);
          return Math.min(shaft, tip);
        };
        return {
          sc,
          marks: {
            base: white,
            marks: [
              { color: '#c9a77a', f: regionOf(sc, 'horn') },
              { color: arrow, f: all(head, (q) => 0.16 - q.p.y, arrowAt(0.07, 0.185, 0.016, 0.04, 0.05)) },
              { color: arrow, f: all(body, (q) => 0.175 - q.p.y, arrowAt(-0.14, 0.08, 0.034, 0.07, 0.07)) },
              { color: '#8a7f78', f: patch([0, 0.128, 0.2], [0.022, 0.012, 0.012]) },
              { color: '#d7cbbb', f: (q) => Math.max(regionOf(sc, 'leg')(q), q.p.y - 0.042) },
              { color: BLUSH, f: blushes(0.135, 0.165, 0.05, 0.012) },
            ],
          },
        };
      }, 0.024),
    );
    const e = new Builder();
    addEyes(e, 0.165, 0.172, 0.038, 0.011);
    super(b, e, 0.165);
    const tb = new Builder();
    tb.addColored(
      sculpted('skybison-tail', () => {
        const sc = new Sculpt();
        sc.add(ellipsoid('body', [0, 0, -0.06], [0.085, 0.016, 0.065], { name: 'tail' }));
        sc.add(ellipsoid('body', [0, 0, -0.005], [0.03, 0.02, 0.03], { k: 0.02, name: 'root' }));
        return { sc, marks: { base: white, marks: [{ color: '#e9e1d2', f: (q) => -0.09 - q.p.z }] } };
      }, 0.018),
    );
    this.tail = this.part(tb, [0, 0.14, -0.145]);
  }
  protected animate(_dt: number, t: number, move: number) {
    // Always aloft, higher and leaning in when it travels, rolling lazily; the broad tail beats slowly.
    this.bodyGroup.position.y = 0.07 + move * 0.13 + Math.sin(t * 1.2) * 0.025;
    this.bodyGroup.rotation.x = move * 0.08 + Math.sin(t * 1.2 + 1) * 0.04;
    this.bodyGroup.rotation.z = Math.sin(t * 0.8) * 0.07;
    this.tail.rotation.x = Math.sin(t * (2 + move * 1.5)) * (0.15 + move * 0.25);
  }
}

/** 14. A castaway's volleyball friend with a red handprint face: it rolls along, and rights itself to look at you. */
class Volleyball extends PetRig {
  private roll = 0;
  private static R = 0.115;
  constructor() {
    const b = new Builder();
    const R = Volleyball.R;
    const red = '#b8372c';
    const finger = (x: number, top: number, tilt: number): Field => (q) => {
      const dy = q.p.y - 0.045;
      const dx = q.p.x - x - dy * tilt;
      return Math.max(Math.abs(dx) - 0.0085 * (1 - dy * 6), Math.abs(dy) - top, 0.06 - q.p.z);
    };
    b.addColored(
      sculpted('volleyball', () => {
        const sc = new Sculpt();
        sc.add(ellipsoid('body', [0, 0, 0], [R, R, R], { name: 'ball' }));
        return {
          sc,
          marks: {
            base: '#f6f3ea',
            marks: [
              // The face drawn into the print: a nose and a smile.
              { color: '#5e1712', f: (q) => Math.max(Math.abs(Math.hypot(q.p.x, q.p.y + 0.012) - 0.03) - 0.0035, q.p.y + 0.028, 0.06 - q.p.z) },
              { color: '#5e1712', f: (q) => Math.max(Math.abs(q.p.x) - 0.003, Math.abs(q.p.y + 0.012) - 0.01, 0.06 - q.p.z) },
              { color: red, f: either(patch([0, -0.018, R], [0.052, 0.05, 0.05]), finger(-0.034, 0.042, -0.25), finger(-0.012, 0.05, -0.08), finger(0.011, 0.052, 0.08), finger(0.033, 0.044, 0.25), patch([0.062, -0.035, 0.09], [0.028, 0.014, 0.05])) },
            ],
          },
        };
      }, 0.018),
    );
    // The panel seams, as fine raised lines: on each face of a cube around the ball, its edges and two strips
    // across it (turning a quarter from face to face). The face is drawn over the front panel, so not its strips.
    for (let i = 0; i < 3; i++) {
      for (const sign of [-1, 1]) {
        for (const u of [-1, -1 / 3, 1 / 3, 1]) {
          if (i === 2 && sign > 0 && Math.abs(u) < 1) continue;
          const pts: THREE.Vector3[] = [];
          for (let n = 0; n <= 6; n++) {
            const c = [0, 0, 0];
            c[i] = sign;
            c[(i + 1) % 3] = u;
            c[(i + 2) % 3] = n / 3 - 1;
            pts.push(new THREE.Vector3(...c).setLength(R));
          }
          const seam = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 10, 0.0017, 3, false);
          b.add(seam, '#a3acb8');
          seam.dispose();
        }
      }
    }
    const e = new Builder();
    for (const s of [-1, 1]) e.add(gem(), '#5e1712', { pos: [s * 0.022, 0.012, Math.sqrt(R * R - 0.022 ** 2 - 0.012 ** 2)], scale: [0.0095, 0.012, 0.005] });
    super(b, e, 0.012);
  }
  protected animate(dt: number, t: number, move: number) {
    const R = Volleyball.R;
    // Rolling while it goes (about the pace of a walk); still, it rocks back round to face its friend.
    if (move > 0.05) this.roll += dt * move * 7;
    else {
      const home = Math.round(this.roll / (Math.PI * 2)) * Math.PI * 2;
      this.roll += (home - this.roll) * Math.min(1, dt * 3);
    }
    this.bodyGroup.position.y = R + Math.abs(Math.sin(t * 2.2)) * 0.01 * (1 - move);
    this.bodyGroup.rotation.set(this.roll, 0, Math.sin(t * 1.3) * 0.08 * (1 - move));
  }
}

/** 15. A potted snapping plant: it sways on its stem, its pod jaws slowly opening and then snapping shut. */
class FeedMe extends Jointed {
  private stem: THREE.Group;
  private head: THREE.Group;
  private lid: THREE.Group;
  constructor() {
    const b = new Builder();
    const pot = '#c4673d';
    const leaf = '#4f9a3a';
    b.add(new THREE.CylinderGeometry(0.068, 0.05, 0.09, 12), pot, { pos: [0, 0.045, 0] });
    b.add(new THREE.CylinderGeometry(0.078, 0.076, 0.026, 12), '#b55a33', { pos: [0, 0.095, 0] });
    b.add(new THREE.CylinderGeometry(0.068, 0.068, 0.01, 12), '#4a3324', { pos: [0, 0.104, 0] });
    for (const a of [0.4, 2.3, 4.3]) b.add(gem(), leaf, { pos: [Math.sin(a) * 0.06, 0.112, Math.cos(a) * 0.06], rot: [0, a, 0], scale: [0.03, 0.008, 0.05] });
    super(b, new Builder(), 0.2);
    this.eyes.removeFromParent();
    const sb = new Builder();
    const stemCurve = new THREE.CatmullRomCurve3([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0.008, 0.04, 0), new THREE.Vector3(-0.004, 0.075, 0.008), new THREE.Vector3(0, 0.095, 0.012)]);
    const stemGeo = new THREE.TubeGeometry(stemCurve, 8, 0.012, 6, false);
    sb.add(stemGeo, '#3f8a35');
    stemGeo.dispose();
    for (const s of [-1, 1]) sb.add(gem(), leaf, { pos: [s * 0.03, 0.045, 0], rot: [0, 0, s * 0.5], scale: [0.03, 0.007, 0.016] });
    this.stem = this.part(sb, [0, 0.105, 0]);
    // The pod: a lower jaw and a lid hinged at the back, green outside, red inside, teeth round the lips.
    const shell = (name: string, up: number) =>
      sculpted(name, () => {
        const sc = new Sculpt();
        const f = up > 0 ? 0.82 : 1;
        sc.add(ellipsoid('body', [0, 0, 0.065], [0.078, 0.058 * f, 0.082], { name: 'pod' }));
        sc.add(ellipsoid('body', [0, 0, 0.065], [0.057, 0.036 * f, 0.061], { carve: true }));
        sc.add(box('body', [0, -up * 0.1, 0.065], [0.2, 0.1, 0.2], { round: 0.001, carve: true }));
        return {
          sc,
          marks: {
            base: '#6cae4c',
            marks: [
              { color: '#d23d58', f: (q) => Math.abs(q.p.y) - 0.005 },
              { color: '#8e1f3c', f: patch([0, 0, 0.065], [0.067, 0.047 * f, 0.071]) },
              { color: '#3f7a2e', f: spots(up > 0 ? 3 : 4, 10, [0, 0, 0.065], [0.078, 0.058 * f, 0.082], [0.01, 0.01, 0.01], (d) => d.y * up > 0.2) },
            ],
          },
        };
      }, 0.014);
    const jb = new Builder();
    jb.addColored(shell('feedme-jaw', -1));
    const lb = new Builder();
    lb.addColored(shell('feedme-lid', 1), { pos: [0, 0, 0.0] });
    for (let i = 0; i < 7; i++) {
      const a = (i / 6 - 0.5) * 2.6;
      const p: Vec3 = [Math.sin(a) * 0.066, 0, 0.065 + Math.cos(a) * 0.07];
      jb.add(spike(4), '#fffaf0', { pos: [p[0], 0.009, p[2]], scale: [0.007, 0.018, 0.006] });
      lb.add(spike(4), '#fffaf0', { pos: [Math.sin(a + 0.2) * 0.066, -0.009, 0.065 + Math.cos(a + 0.2) * 0.07], rot: [Math.PI, 0, 0], scale: [0.007, 0.018, 0.006] });
    }
    jb.add(gem(), '#e0607a', { pos: [0, -0.01, 0.07], scale: [0.03, 0.01, 0.045] });
    this.head = this.part(jb, [0, 0.095, -0.045], this.stem);
    this.lid = this.part(lb, [0, 0, 0], this.head);
  }
  protected animate(_dt: number, t: number, move: number) {
    // It opens wide slowly (feed me...), then snaps shut; faster and hungrier on the move.
    const p = (t * (0.6 + move * 0.8)) % 1;
    const open = p < 0.75 ? Math.sin((p / 0.75) * Math.PI * 0.5) * 0.85 : Math.max(0, 1 - (p - 0.75) / 0.05) * 0.85;
    const snap = p > 0.75 ? Math.exp(-(p - 0.8) * 30) * 0.15 : 0;
    this.lid.rotation.x = -open;
    this.head.rotation.x = 0.15 - open * 0.25 + snap;
    this.stem.rotation.z = Math.sin(t * 1.3) * 0.14;
    this.stem.rotation.x = Math.sin(t * 0.9) * 0.08 + move * 0.15;
    this.bodyGroup.position.y = hop(t, move, 0.02, 9);
    this.bodyGroup.rotation.z = Math.sin(t * 9) * 0.04 * move;
  }
}

const MAKERS: Record<PetId, () => PetRig> = {
  chick: () => new Chick(),
  slime: () => new Slime(),
  ghost: () => new Ghosty(),
  mouse: () => new Mouse(),
  bee: () => new Bee(),
  snail: () => new Snail(),
  zapmouse: () => new Sparky(),
  sage: () => new Sage(),
  spirit: () => new Spirit(),
  soot: () => new Soot(),
  rascal: () => new Rascal(),
  sprout: () => new Sprout(),
  henchling: () => new Henchling(),
  arcade: () => new ArcadeGhost(),
  puffball: () => new Puffball(),
  cube: () => new Cube(),
  creepling: () => new Creepling(),
  balldroid: () => new BallDroid(),
  astrodroid: () => new AstroDroid(),
  tidybot: () => new TidyBot(),
  dragon: () => new Dragon(),
  owl: () => new Owl(),
  poptart: () => new PopTart(),
  doge: () => new Doge(),
  grumpy: () => new Grumpy(),
  duck: () => new Duck(),
  pocketpal: () => new PocketPal(),
  shroom: () => new Shroom(),
  kweh: () => new Kweh(),
  mogwai: () => new Mogwai(),
  clip: () => new Clip(),
  tribble: () => new Tribble(),
  luckdragon: () => new LuckDragon(),
  skybison: () => new SkyBison(),
  volleyball: () => new Volleyball(),
  feedme: () => new FeedMe(),
};

export function buildPet(pet: PetId): Pet {
  const make = MAKERS[pet] ?? MAKERS.chick;
  return make();
}
