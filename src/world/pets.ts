import * as THREE from 'three';
import { Builder, soft, wet, type Vec3 } from './build';
import { regionOf, sculptGeometry, type Field, type Markings } from './forms';
import { Sculpt, ellipsoid, rod, type Probe } from './sculpt';
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
/** Low, faceted spheres and cones for the little separate bits, to match the sculpted bodies. */
const gem = () => new THREE.IcosahedronGeometry(1, 1);
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
    b.add(new THREE.IcosahedronGeometry(1, 0), '#ffffff', { pos: [s * x + r * 0.35, y + r * 0.4, z + r * 0.55], scale: r * 0.32 });
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
    this.addMesh(body.mesh(material, { cast: true, receive: false, crease: 0 }), this.bodyGroup, material);
    this.eyes.position.y = eyeY;
    const eg = eyes.geometry();
    eg.translate(0, -eyeY, 0);
    const em = soft();
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
    this.tail = this.addMesh(tb.mesh(tmat, { cast: true, receive: false, crease: 0 }), this.bodyGroup, tmat);
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
