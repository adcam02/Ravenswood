import * as THREE from 'three';
import { Builder, matte } from '../build';
import { G } from '../town/kit';
import { wordSign } from './props2';

/**
 * The kit for the newer Slayer moves (see slay2.ts), in the same style as slayProps.ts: chunky painted shapes, each
 * held at its origin (the grip, or the floor) and pointing along +z, with the moving parts as groups of their own.
 */

const WOOD = '#6a4630';
const IRON = '#34333c';
const STEEL = '#c9d2dc';
const GOLD = '#e2b440';
const INK = '#1e1c22';
const CREAM = '#fff4d6';

const mesh = (b: Builder, material: THREE.Material = matte()) => b.mesh(material, { cast: true, receive: false });
const glow = (color: string, opacity = 1) =>
  new THREE.MeshBasicMaterial({ color, transparent: opacity < 1, opacity, depthWrite: opacity >= 1, blending: opacity < 1 ? THREE.AdditiveBlending : THREE.NormalBlending });

/** A tumbleweed: a loose ball of twigs (radius 1: scale it). */
export function tumbleweed(): THREE.Group {
  const b = new Builder();
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI;
    b.add(G.torus(0.035, 4, 18), i % 2 ? '#b08a50' : '#8a6a3a', { rot: [a, a * 1.7, a * 0.6], scale: 0.9 + (i % 3) * 0.06 });
  }
  return new THREE.Group().add(mesh(b));
}

export interface Revolver {
  group: THREE.Group;
  /** The end of the barrel, in the gun's frame. */
  muzzle: THREE.Vector3;
  /** A flag on a stick that shoots out of the barrel, "BANG!" on it (scale it up from nothing). */
  flag: THREE.Group;
  dispose(): void;
}

/** A cartoon six-shooter, held by the grip, barrel along +z. `taped` wraps it in grey tape (it was stuck to someone's back). */
export function revolver(taped = false): Revolver {
  const group = new THREE.Group();
  const b = new Builder();
  b.add(G.rbox(0.3), WOOD, { pos: [0, -0.07, -0.02], rot: [0.35, 0, 0], scale: [0.045, 0.14, 0.07] });
  b.add(G.rbox(0.2), IRON, { pos: [0, 0.02, 0.04], scale: [0.05, 0.07, 0.12] });
  b.add(G.cyl(10), '#55545e', { pos: [0, 0.025, 0.06], rot: [Math.PI / 2, 0, 0], scale: [0.045, 0.08, 0.045] });
  b.add(G.cyl(10), IRON, { pos: [0, 0.04, 0.2], rot: [Math.PI / 2, 0, 0], scale: [0.02, 0.24, 0.02] });
  b.add(G.box(), IRON, { pos: [0, 0.065, 0.3], scale: [0.01, 0.02, 0.02] });
  b.add(G.torus(0.2, 5, 12), IRON, { pos: [0, -0.04, 0.05], rot: [0, Math.PI / 2, 0], scale: 0.035 });
  if (taped) for (const z of [-0.01, 0.12]) b.add(G.box(), '#a8a8a0', { pos: [0, 0.02, z], rot: [0, 0, 0.3], scale: [0.09, 0.12, 0.035] });
  group.add(mesh(b));
  const muzzle = new THREE.Vector3(0, 0.04, 0.33);
  // The flag: a stick, and a little banner off the top of it, side on to the barrel so it reads from the camera.
  const flag = new THREE.Group();
  const f = new Builder();
  f.add(G.cyl(5), '#e8e4dc', { pos: [0, 0, 0.16], rot: [Math.PI / 2, 0, 0], scale: [0.01, 0.32, 0.01] });
  flag.add(mesh(f));
  const banner = wordSign('BANG!', 0.5, 0.22, { bg: '#fffaf0', fg: '#d8402f', border: '#d8402f' });
  banner.group.scale.setScalar(1);
  banner.group.position.set(0, 0.12, 0.26);
  banner.group.rotation.y = Math.PI / 2;
  flag.add(banner.group);
  flag.position.copy(muzzle);
  flag.scale.setScalar(0.001);
  group.add(flag);
  return { group, muzzle, flag, dispose: banner.dispose };
}

export interface LaserSword {
  group: THREE.Group;
  /** The blade, about the hilt (scale its z to light it up or put it out). */
  blade: THREE.Group;
}

/** A sword of humming light: a silver hilt and a glowing blade along +z, `len` long, a core and a soft glow round it. */
export function laserSword(color: string, len = 0.7): LaserSword {
  const group = new THREE.Group();
  const b = new Builder();
  b.add(G.cyl(10), STEEL, { pos: [0, 0, -0.02], rot: [Math.PI / 2, 0, 0], scale: [0.025, 0.2, 0.025] });
  for (const z of [-0.08, -0.03, 0.02]) b.add(G.cyl(10), INK, { pos: [0, 0, z], rot: [Math.PI / 2, 0, 0], scale: [0.028, 0.02, 0.028] });
  b.add(G.cyl(10), '#8e96a2', { pos: [0, 0, 0.08], rot: [Math.PI / 2, 0, 0], scale: [0.032, 0.03, 0.032] });
  b.add(G.box(), '#d8402f', { pos: [0, 0.03, -0.01], scale: [0.012, 0.012, 0.03] });
  group.add(mesh(b));
  const blade = new THREE.Group();
  blade.position.z = 0.09;
  const rod = new THREE.CylinderGeometry(1, 1, 1, 10).rotateX(Math.PI / 2).translate(0, 0, 0.5);
  const core = new THREE.Mesh(rod, glow('#ffffff'));
  core.scale.set(0.018, 0.018, len);
  const halo = new THREE.Mesh(rod, glow(color, 0.75));
  halo.scale.set(0.05, 0.05, len + 0.03);
  blade.add(core, halo);
  group.add(blade);
  return { group, blade };
}

export interface CaptureBall {
  group: THREE.Group;
  /** The top half, hinged at the back: rotation.x below 0 opens it. */
  lid: THREE.Group;
  /** The light inside, seen when it opens. */
  light: THREE.Mesh;
}

/** The red and white capture ball (radius 0.12, its middle at the origin), the button facing +z. */
export function captureBall(): CaptureBall {
  const group = new THREE.Group();
  const r = 0.12;
  const b = new Builder();
  b.add(G.sphere(18, 12), '#f4f2ee', { scale: [r, r, r], rot: [Math.PI, 0, 0] });
  b.add(G.cyl(24), INK, { scale: [r * 1.02, 0.018, r * 1.02] });
  b.add(G.cyl(14), INK, { pos: [0, 0, r * 0.95], rot: [Math.PI / 2, 0, 0], scale: [0.045, 0.03, 0.045] });
  b.add(G.cyl(14), '#f4f2ee', { pos: [0, 0, r * 1.02], rot: [Math.PI / 2, 0, 0], scale: [0.03, 0.02, 0.03] });
  group.add(mesh(b));
  // (The white half is a whole ball turned over, its top showing as a dome under the red lid.)
  const lid = new THREE.Group();
  lid.position.set(0, 0.009, -r);
  const l = new Builder();
  l.add(G.dome(18), '#d8302a', { pos: [0, 0, r], scale: [r * 1.01, r * 1.01, r * 1.01] });
  lid.add(mesh(l));
  group.add(lid);
  const light = new THREE.Mesh(new THREE.SphereGeometry(r * 0.8, 12, 8), glow('#ff6a6a'));
  light.visible = false;
  group.add(light);
  return { group, lid, light };
}

export interface SpringGlove {
  group: THREE.Group;
  /** The spring, from the box's mouth along +z (scale its z to stretch it). */
  spring: THREE.Group;
  /** The glove, on the end of the spring. */
  glove: THREE.Group;
  /** The crank, turning about x. */
  crank: THREE.Group;
  /** Where the spring comes out, in the box's frame. */
  mouth: THREE.Vector3;
}

/** A jack-in-the-box held out in front, a crank on its side, with a boxing glove on a spring inside it. */
export function springGlove(): SpringGlove {
  const group = new THREE.Group();
  const b = new Builder();
  b.add(G.rbox(0.15), '#3a7ad8', { pos: [0, 0, 0.12], scale: [0.24, 0.24, 0.24] });
  for (const sx of [-1, 1]) b.add(G.box(), '#f2c84a', { pos: [sx * 0.121, 0, 0.12], scale: [0.004, 0.14, 0.14] });
  b.add(G.box(), '#d8402f', { pos: [0, 0.121, 0.12], scale: [0.14, 0.004, 0.14] });
  group.add(mesh(b));
  const crank = new THREE.Group();
  crank.position.set(0.13, 0, 0.12);
  const c = new Builder();
  c.add(G.cyl(6), GOLD, { pos: [0.02, 0, 0], rot: [0, 0, Math.PI / 2], scale: [0.012, 0.04, 0.012] });
  c.add(G.box(), GOLD, { pos: [0.04, 0.04, 0], scale: [0.015, 0.09, 0.015] });
  c.add(G.cyl(6), '#d8402f', { pos: [0.065, 0.08, 0], rot: [0, 0, Math.PI / 2], scale: [0.018, 0.05, 0.018] });
  crank.add(mesh(c));
  group.add(crank);
  const mouth = new THREE.Vector3(0, 0, 0.24);
  const spring = new THREE.Group();
  spring.position.copy(mouth);
  // A coil one unit long along +z (it's stretched to length).
  const pts: THREE.Vector3[] = [];
  for (let i = 0; i <= 120; i++) {
    const a = (i / 120) * Math.PI * 2 * 8;
    pts.push(new THREE.Vector3(Math.cos(a) * 0.05, Math.sin(a) * 0.05, i / 120));
  }
  const coil = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 240, 0.008, 5), new THREE.MeshLambertMaterial({ color: STEEL }));
  spring.add(coil);
  group.add(spring);
  const glove = new THREE.Group();
  const g = new Builder();
  g.add(G.sphere(16, 12), '#d8302a', { pos: [0, 0, 0.12], scale: [0.13, 0.12, 0.14] });
  g.add(G.sphere(10, 8), '#d8302a', { pos: [0.1, 0.03, 0.1], scale: [0.05, 0.06, 0.07] });
  g.add(G.cyl(14), '#f4f2ee', { pos: [0, 0, 0.0], rot: [Math.PI / 2, 0, 0], scale: [0.09, 0.07, 0.09] });
  g.add(G.box(), '#b8221e', { pos: [0, 0.07, 0.2], scale: [0.12, 0.012, 0.04] });
  glove.add(mesh(g));
  group.add(glove);
  return { group, spring, glove, crank, mouth };
}

/** A custard pie in its tin, cream piled high and a cherry on top, flat side up (its middle at the origin). */
export function pie(): THREE.Group {
  const b = new Builder();
  b.add(G.taper(1.2, 18), '#b8bcc4', { pos: [0, -0.02, 0], scale: [0.15, 0.04, 0.15] });
  b.add(G.cyl(18), '#d8a050', { pos: [0, 0.0, 0], scale: [0.165, 0.025, 0.165] });
  b.add(G.dome(14), CREAM, { pos: [0, 0.01, 0], scale: [0.16, 0.07, 0.16] });
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    b.add(G.sphere(8, 6), CREAM, { pos: [Math.cos(a) * 0.13, 0.03, Math.sin(a) * 0.13], scale: 0.035 });
  }
  b.add(G.sphere(10, 8), '#d8202a', { pos: [0, 0.09, 0], scale: 0.03 });
  return new THREE.Group().add(mesh(b));
}

export interface Banana {
  group: THREE.Group;
  /** The fruit inside (it's eaten: scale it down). */
  fruit: THREE.Group;
  /** The three bits of peel, each hinged at the bottom (rotation.x opens them out). */
  flaps: THREE.Group[];
}

/** A banana standing on its end, the stalk up; the peel opens out in three flaps. */
export function banana(): Banana {
  const group = new THREE.Group();
  // (A big one, to read from across the square.)
  const inner = new THREE.Group();
  inner.scale.setScalar(1.5);
  group.add(inner);
  const b = new Builder();
  b.add(G.sphere(8, 6), '#e0c040', { pos: [0, 0.02, 0], scale: [0.045, 0.03, 0.045] });
  inner.add(mesh(b));
  const fruit = new THREE.Group();
  const f = new Builder();
  f.add(G.sphere(12, 10), '#fff2c0', { pos: [0, 0.13, 0], scale: [0.036, 0.12, 0.036] });
  fruit.add(mesh(f));
  inner.add(fruit);
  const flaps: THREE.Group[] = [];
  for (let i = 0; i < 3; i++) {
    const hinge = new THREE.Group();
    hinge.rotation.y = (i / 3) * Math.PI * 2;
    const flap = new THREE.Group();
    flap.position.z = 0.035;
    const p = new Builder();
    p.add(G.sphere(10, 8), '#f2d040', { pos: [0, 0.12, 0], scale: [0.04, 0.13, 0.016] });
    p.add(G.sphere(6, 4), '#6a4a20', { pos: [0, 0.245, 0], scale: [0.012, 0.012, 0.012] });
    flap.add(mesh(p));
    hinge.add(flap);
    inner.add(hinge);
    flaps.push(flap);
  }
  return { group, fruit, flaps };
}

export interface ThunderHammer {
  group: THREE.Group;
  /** The far end of the head, in the hammer's frame (along +z, from the grip). */
  head: THREE.Vector3;
}

/** A short, square-headed hammer of silver steel, its handle wrapped in leather with a loop on the end. */
export function thunderHammer(): ThunderHammer {
  const b = new Builder();
  b.add(G.cyl(8), '#6a4026', { pos: [0, 0, 0.12], rot: [Math.PI / 2, 0, 0], scale: [0.026, 0.32, 0.026] });
  for (let i = 0; i < 5; i++) b.add(G.torus(0.25, 5, 12), '#4a2a18', { pos: [0, 0, 0.02 + i * 0.05], scale: [0.03, 0.03, 0.06] });
  b.add(G.torus(0.2, 5, 14), '#4a2a18', { pos: [0, 0, -0.08], rot: [0, Math.PI / 2, 0], scale: 0.04 });
  b.add(G.rbox(0.12), '#a8b0bc', { pos: [0, 0, 0.32], scale: [0.3, 0.17, 0.17] });
  for (const sx of [-1, 1]) b.add(G.rbox(0.2), '#d4dbe4', { pos: [sx * 0.155, 0, 0.32], scale: [0.02, 0.19, 0.19] });
  b.add(G.box(), '#7a828e', { pos: [0, 0.086, 0.32], scale: [0.2, 0.004, 0.06] });
  return { group: new THREE.Group().add(mesh(b)), head: new THREE.Vector3(0, 0, 0.4) };
}

export interface Safe {
  group: THREE.Group;
  /** The door on the front, hinged at its left edge (rotation.y opens it). */
  door: THREE.Group;
  /** How tall it is. */
  h: number;
  dispose(): void;
}

/** A great iron safe, `w` wide, the floor at its origin, the door with a dial and handle facing +z, ONE TON on the side. */
export function safe(w: number): Safe {
  const group = new THREE.Group();
  const h = w * 1.1;
  const b = new Builder();
  b.add(G.rbox(0.08), '#3a5a48', { pos: [0, h / 2, 0], scale: [w, h, w * 0.9] });
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) b.add(G.sphere(8, 6), GOLD, { pos: [sx * w * 0.42, 0.03, sz * w * 0.38], scale: [0.06, 0.04, 0.06] });
  group.add(mesh(b));
  const door = new THREE.Group();
  door.position.set(-w * 0.38, h / 2, w * 0.45);
  const d = new Builder();
  d.add(G.rbox(0.1), '#4a6a58', { pos: [w * 0.38, 0, 0.02], scale: [w * 0.76, h * 0.8, 0.04] });
  d.add(G.cyl(18), '#d4dbe4', { pos: [w * 0.38, h * 0.08, 0.05], rot: [Math.PI / 2, 0, 0], scale: [w * 0.13, 0.03, w * 0.13] });
  d.add(G.cyl(18), INK, { pos: [w * 0.38, h * 0.08, 0.065], rot: [Math.PI / 2, 0, 0], scale: [w * 0.04, 0.02, w * 0.04] });
  d.add(G.box(), GOLD, { pos: [w * 0.38, -h * 0.18, 0.06], scale: [w * 0.22, 0.03, 0.03] });
  door.add(mesh(d));
  group.add(door);
  // ONE TON on the side towards the camera, and on the door's back for good measure.
  const label = wordSign('ONE TON', w * 0.7, w * 0.22, { bg: '#3a5a48', fg: '#f2e6c0' });
  label.group.scale.setScalar(1);
  label.group.position.set(-w * 0.505, h * 0.62, 0);
  label.group.rotation.y = -Math.PI / 2;
  group.add(label.group);
  return { group, door, h, dispose: label.dispose };
}

/** A bowling pin, standing (its own height about 0.4: scale it). */
export function bowlingPin(): THREE.Group {
  const pts = [
    [0, 0],
    [0.06, 0],
    [0.085, 0.07],
    [0.09, 0.14],
    [0.065, 0.24],
    [0.035, 0.29],
    [0.04, 0.34],
    [0.035, 0.39],
    [0, 0.4],
  ].map(([x, y]) => new THREE.Vector2(x, y));
  const geo = new THREE.LatheGeometry(pts, 14);
  const group = new THREE.Group();
  const m = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ color: '#f6f4ee' }));
  m.castShadow = true;
  group.add(m);
  for (const y of [0.27, 0.3]) {
    const band = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.042, 0.014, 14), new THREE.MeshLambertMaterial({ color: '#d8302a' }));
    band.position.y = y;
    group.add(band);
  }
  return group;
}

/** A spinning gold coin, face on to +z. */
export function coin(): THREE.Group {
  const b = new Builder();
  b.add(G.cyl(18), GOLD, { rot: [Math.PI / 2, 0, 0], scale: [0.11, 0.025, 0.11] });
  b.add(G.box(), '#fff2a0', { pos: [0, 0, 0.014], scale: [0.025, 0.11, 0.004] });
  const material = new THREE.MeshLambertMaterial({ vertexColors: true, emissive: '#5a4410' });
  return new THREE.Group().add(mesh(b, material));
}

/**
 * The Infinite Void: a great starry dome round the two of them (seen from inside, so from the camera it's the dark
 * sky behind them), a dark starry floor, and a ring of light where it meets the boards. Radius 1: scale it.
 */
export function voidDome(): { group: THREE.Group; materials: THREE.MeshBasicMaterial[]; dispose(): void } {
  const group = new THREE.Group();
  const sky = glow('#0a0820');
  sky.side = THREE.BackSide;
  sky.transparent = true;
  const dome = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 16), sky);
  const floorMat = glow('#120e2a');
  floorMat.transparent = true;
  const floor = new THREE.Mesh(new THREE.CircleGeometry(1, 40).rotateX(-Math.PI / 2), floorMat);
  floor.position.y = 0.012;
  // Stars: small flat twinkles scattered over the inside of the dome, and swirls of tiny ones on the floor.
  const pos: number[] = [];
  const col: number[] = [];
  const c = new THREE.Color();
  for (let i = 0; i < 700; i++) {
    const u = Math.sin(i * 12.9898) * 43758.5453;
    const v = Math.sin(i * 78.233) * 12345.678;
    const a = (u - Math.floor(u)) * Math.PI * 2;
    const y = (v - Math.floor(v)) * 0.95 + 0.02;
    const r = Math.sqrt(1 - y * y) * 0.985;
    pos.push(Math.cos(a) * r, y * 0.985, Math.sin(a) * r);
    c.setHSL(0.55 + (i % 7) * 0.04, 0.6, 0.75 + (i % 3) * 0.08);
    col.push(c.r, c.g, c.b);
  }
  for (let i = 0; i < 260; i++) {
    const a = i * 0.37;
    const r = 0.05 + ((i * 0.618) % 1) * 0.9;
    pos.push(Math.cos(a + r * 3) * r, 0.02, Math.sin(a + r * 3) * r);
    col.push(0.8, 0.85, 1);
  }
  const starGeo = new THREE.BufferGeometry();
  starGeo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  starGeo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  const starMat = new THREE.PointsMaterial({ size: 0.06, vertexColors: true, transparent: true, depthWrite: false, sizeAttenuation: true });
  const stars = new THREE.Points(starGeo, starMat);
  const rimMat = glow('#9ab8ff', 0.8);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(1, 0.012, 6, 64).rotateX(Math.PI / 2), rimMat);
  rim.position.y = 0.02;
  group.add(dome, floor, stars, rim);
  const materials = [sky, floorMat, rimMat, starMat as unknown as THREE.MeshBasicMaterial];
  return {
    group,
    materials,
    dispose: () => {
      group.traverse((o) => (o as THREE.Mesh).geometry?.dispose());
      materials.forEach((m) => m.dispose());
      group.removeFromParent();
    },
  };
}
