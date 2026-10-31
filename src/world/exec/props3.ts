import * as THREE from 'three';
import { Builder, matte } from '../build';
import { G } from '../town/kit';
import { signBoard, TextSign } from '../town/sign';

/**
 * The props for the third lot of ways to be executed (see stage3.ts), in the same style as props.ts and props2.ts:
 * chunky painted shapes, each in its own frame with the origin on the floor, facing +z, and moving parts as groups
 * of their own. Everyone in them is made up: nobody in particular.
 */

const WOOD = '#8a5a3a';
const IRON = '#3b3a44';
const STEEL = '#c9d2dc';
const SKIN = '#f2c9a0';
const INK = '#1e1c22';

const mesh = (b: Builder, material: THREE.Material = matte()) => b.mesh(material, { cast: true, receive: false });

/** A speech bubble (a line or two), both sides, for someone talking. */
export function bubble(lines: string[], w: number, h: number) {
  const sign = new TextSign({ w: Math.round(256 * (w / h)), h: 256, bg: '#ffffff', fg: INK, border: INK, size: 92, weight: 700, round: false }, lines);
  const board = signBoard(sign, w, h, { lit: true });
  const group = new THREE.Group().add(board.mesh);
  // The little tail under it, pointing down at whoever is talking.
  const tail = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.22, 3), new THREE.MeshBasicMaterial({ color: '#ffffff' }));
  tail.rotation.x = Math.PI;
  tail.position.set(-w * 0.25, -h / 2 - 0.09, 0);
  group.add(tail);
  group.scale.setScalar(0.001);
  return {
    group,
    dispose: () => {
      sign.dispose();
      board.material.dispose();
      group.traverse((o) => (o as THREE.Mesh).geometry?.dispose());
      (tail.material as THREE.Material).dispose();
      group.removeFromParent();
    },
  };
}
export type Bubble = ReturnType<typeof bubble>;

// ---------------------------------------------------------------- people

export interface Figure {
  group: THREE.Group;
  /** Leans and bobs, above the hips. */
  body: THREE.Group;
  head: THREE.Group;
  /** From the shoulders (left then right as they face +z); a hand at the end of each. */
  arms: THREE.Group[];
  hands: THREE.Object3D[];
  /** From the hips. */
  legs: THREE.Group[];
  dispose(): void;
}

/**
 * A made-up person about 1.8 metres tall, in a jacket and trousers: a bald man in a black suit and red tie, a TV
 * presenter in a sports coat, a police officer in a cap. `hair` null for none; `cap` a peaked cap in that colour.
 */
export function person(o: { coat: string; trousers: string; shirt: string; tie?: string; hair?: string | null; cap?: string; badge?: boolean }): Figure {
  const group = new THREE.Group();
  const legs: THREE.Group[] = [];
  for (const sx of [-1, 1]) {
    const leg = new THREE.Group();
    leg.position.set(sx * 0.11, 0.86, 0);
    const b = new Builder();
    b.add(G.cyl(10), o.trousers, { pos: [0, -0.42, 0], scale: [0.085, 0.82, 0.085] });
    b.add(G.rbox(0.3), INK, { pos: [0, -0.81, 0.06], scale: [0.14, 0.1, 0.28] });
    leg.add(mesh(b));
    group.add(leg);
    legs.push(leg);
  }
  const body = new THREE.Group();
  body.position.set(0, 0.86, 0);
  group.add(body);
  const t = new Builder();
  t.add(G.rbox(0.25), o.trousers, { pos: [0, 0.05, 0], scale: [0.36, 0.16, 0.24] });
  t.add(G.rbox(0.3), o.coat, { pos: [0, 0.38, 0], scale: [0.46, 0.58, 0.28] });
  // Shirt front and lapels, and a tie.
  t.add(G.box(), o.shirt, { pos: [0, 0.5, 0.141], scale: [0.14, 0.32, 0.01] });
  for (const sx of [-1, 1]) t.add(G.box(), o.coat, { pos: [sx * 0.07, 0.5, 0.15], rot: [0, 0, sx * -0.3], scale: [0.05, 0.3, 0.012] });
  if (o.tie) {
    t.add(G.box(), o.tie, { pos: [0, 0.48, 0.15], scale: [0.05, 0.26, 0.012] });
    t.add(G.cone(4), o.tie, { pos: [0, 0.33, 0.15], rot: [0, Math.PI / 4, Math.PI], scale: [0.04, 0.06, 0.012] });
  }
  if (o.badge) t.add(G.cyl(6), '#e8c650', { pos: [-0.12, 0.55, 0.15], rot: [Math.PI / 2, 0, 0], scale: [0.04, 0.01, 0.05] });
  t.add(G.cyl(10), SKIN, { pos: [0, 0.71, 0], scale: [0.07, 0.08, 0.07] });
  body.add(mesh(t));
  const head = new THREE.Group();
  head.position.set(0, 0.86, 0);
  const h = new Builder();
  h.add(G.sphere(14, 12), SKIN, { pos: [0, 0.04, 0], scale: [0.15, 0.17, 0.16] });
  for (const sx of [-1, 1]) {
    h.add(G.sphere(8, 6), INK, { pos: [sx * 0.055, 0.06, 0.145], scale: [0.018, 0.024, 0.01] });
    h.add(G.sphere(8, 6), SKIN, { pos: [sx * 0.15, 0.04, 0], scale: [0.03, 0.045, 0.03] });
    h.add(G.box(), INK, { pos: [sx * 0.055, 0.105, 0.15], rot: [0, 0, sx * -0.12], scale: [0.05, 0.012, 0.01] });
  }
  h.add(G.sphere(8, 6), '#e8a888', { pos: [0, 0.02, 0.16], scale: [0.025, 0.035, 0.025] });
  h.add(G.box(), '#a85a4a', { pos: [0, -0.05, 0.15], scale: [0.06, 0.012, 0.01] });
  if (o.hair) h.add(G.sphere(14, 10), o.hair, { pos: [0, 0.1, -0.02], scale: [0.16, 0.12, 0.16] });
  if (o.cap) {
    h.add(G.cyl(14), o.cap, { pos: [0, 0.17, 0], scale: [0.16, 0.1, 0.16] });
    h.add(G.cyl(14), o.cap, { pos: [0, 0.23, 0.02], scale: [0.18, 0.04, 0.19] });
    h.add(G.cyl(14, ), INK, { pos: [0, 0.13, 0.1], scale: [0.13, 0.015, 0.12] });
    h.add(G.cyl(6), '#e8c650', { pos: [0, 0.2, 0.165], rot: [Math.PI / 2, 0, 0], scale: [0.025, 0.01, 0.03] });
  }
  head.add(mesh(h));
  body.add(head);
  const arms: THREE.Group[] = [];
  const hands: THREE.Object3D[] = [];
  for (const sx of [-1, 1]) {
    const arm = new THREE.Group();
    arm.position.set(sx * 0.27, 0.62, 0);
    const a = new Builder();
    a.add(G.cyl(10), o.coat, { pos: [0, -0.27, 0], scale: [0.065, 0.56, 0.065] });
    a.add(G.sphere(10, 8), SKIN, { pos: [0, -0.59, 0], scale: 0.055 });
    arm.add(mesh(a));
    body.add(arm);
    arms.push(arm);
    const hand = new THREE.Object3D();
    hand.position.set(0, -0.6, 0);
    arm.add(hand);
    hands.push(hand);
  }
  return { group, body, head, arms, hands, legs, dispose: () => {} };
}

/** An arm pointed at a spot (in the world), from its shoulder: its hand reaches that way. */
export function reachFor(arm: THREE.Group, at: THREE.Vector3) {
  arm.parent!.updateMatrixWorld(true);
  const shoulder = arm.parent!.localToWorld(arm.position.clone());
  const inParent = at.clone().sub(shoulder).applyQuaternion(arm.parent!.getWorldQuaternion(new THREE.Quaternion()).invert());
  arm.quaternion.setFromUnitVectors(new THREE.Vector3(0, -1, 0), inParent.normalize());
}

// ---------------------------------------------------------------- the horse

export interface Horse {
  group: THREE.Group;
  body: THREE.Group;
  head: THREE.Group;
  /** Front then back, each pair left and right; they swing about the hips and shoulders. */
  legs: THREE.Group[];
  tail: THREE.Group;
  dispose(): void;
}

/** A chestnut cartoon horse with a white blaze and a dark mane, about 1.7 metres to its ears, nose to +z. */
export function horse(): Horse {
  const COAT = '#a8643a';
  const DARK = '#4a2c1e';
  const group = new THREE.Group();
  const body = new THREE.Group();
  body.position.set(0, 1.05, 0);
  group.add(body);
  const b = new Builder();
  b.add(G.sphere(16, 12), COAT, { scale: [0.36, 0.38, 0.78] });
  b.add(G.box(), '#c23a32', { pos: [0, 0.34, 0.05], scale: [0.5, 0.06, 0.4] });
  body.add(mesh(b));
  const head = new THREE.Group();
  head.position.set(0, 0.25, 0.62);
  const h = new Builder();
  h.add(G.taper(0.7, 12), COAT, { pos: [0, 0.25, 0.08], rot: [0.55, 0, 0], scale: [0.16, 0.55, 0.2] });
  h.add(G.rbox(0.45), COAT, { pos: [0, 0.48, 0.32], rot: [1.2, 0, 0], scale: [0.2, 0.46, 0.24] });
  h.add(G.box(), '#f6efe2', { pos: [0, 0.6, 0.39], rot: [1.2, 0, 0], scale: [0.06, 0.3, 0.01] });
  h.add(G.sphere(10, 8), '#d89a7a', { pos: [0, 0.38, 0.52], scale: [0.13, 0.1, 0.1] });
  for (const sx of [-1, 1]) {
    h.add(G.sphere(8, 6), '#ffffff', { pos: [sx * 0.11, 0.6, 0.3], scale: [0.045, 0.05, 0.03] });
    h.add(G.sphere(8, 6), INK, { pos: [sx * 0.12, 0.6, 0.32], scale: 0.025 });
    h.add(G.cone(6), COAT, { pos: [sx * 0.07, 0.8, 0.2], rot: [-0.3, 0, sx * 0.2], scale: [0.05, 0.14, 0.04] });
    h.add(G.sphere(6, 4), INK, { pos: [sx * 0.05, 0.36, 0.6], scale: 0.018 });
  }
  for (let k = 0; k < 6; k++) h.add(G.cone(4), DARK, { pos: [0, 0.65 - k * 0.11, 0.1 - k * 0.06], rot: [-0.9, 0, 0], scale: [0.04, 0.16, 0.08] });
  head.add(mesh(h));
  body.add(head);
  const tail = new THREE.Group();
  tail.position.set(0, 0.15, -0.74);
  const tb = new Builder();
  tb.add(G.taper(0.3, 8), DARK, { pos: [0, -0.3, -0.08], rot: [0.3, 0, 0], scale: [0.08, 0.62, 0.08] });
  tail.add(mesh(tb));
  body.add(tail);
  const legs: THREE.Group[] = [];
  for (const sz of [1, -1])
    for (const sx of [-1, 1]) {
      const leg = new THREE.Group();
      leg.position.set(sx * 0.18, 1.0, sz * 0.48);
      const l = new Builder();
      l.add(G.taper(0.7, 10), COAT, { pos: [0, -0.45, 0], scale: [0.08, 0.86, 0.08] });
      l.add(G.cyl(10), '#f6efe2', { pos: [0, -0.86, 0], scale: [0.075, 0.12, 0.075] });
      l.add(G.cyl(10), INK, { pos: [0, -0.96, 0.01], scale: [0.08, 0.08, 0.09] });
      leg.add(mesh(l));
      group.add(leg);
      legs.push(leg);
    }
  return { group, body, head, legs, tail, dispose: () => {} };
}

// ---------------------------------------------------------------- bowling

export interface Lane {
  group: THREE.Group;
  pins: THREE.Group[];
  ball: THREE.Group;
  /** The ball's radius. */
  r: number;
  dispose(): void;
}

/**
 * A bowling lane `len` long laid along -x from the pins (at the origin, the head pin spot left for the condemned),
 * with gutters either side, arrows, and a great ball. The pins stand in a triangle behind the head pin.
 */
export function lane(len: number): Lane {
  const group = new THREE.Group();
  const b = new Builder();
  const w = 1.4;
  b.add(G.box(), '#e2b878', { pos: [-len / 2 + 1.6, 0.02, 0], scale: [len + 3.2, 0.04, w] });
  for (let k = 0; k < 9; k++) b.add(G.box(), '#c99a5e', { pos: [-len / 2 + 1.6, 0.041, -w / 2 + (k + 0.5) * (w / 9)], scale: [len + 3.2, 0.002, 0.01] });
  for (const sz of [-1, 1]) b.add(G.box(), '#8c8c96', { pos: [-len / 2 + 1.6, 0.03, sz * (w / 2 + 0.15)], scale: [len + 3.2, 0.06, 0.3] });
  for (let k = -2; k <= 2; k++) b.add(G.cone(3), '#3a6ec0', { pos: [-3.2, 0.045, k * 0.25], rot: [-Math.PI / 2, 0, -Math.PI / 2], scale: [0.06, 0.2, 0.01] });
  b.add(G.box(), '#d8402f', { pos: [-4.6, 0.045, 0], scale: [0.04, 0.003, w] });
  group.add(mesh(b));
  const pins: THREE.Group[] = [];
  const spots: [number, number][] = [
    [0.45, -0.28],
    [0.45, 0.28],
    [0.9, -0.55],
    [0.9, 0],
    [0.9, 0.55],
  ];
  for (const [x, z] of spots) {
    const pin = new THREE.Group();
    pin.position.set(x, 0.04, z);
    const p = new Builder();
    p.add(G.sphere(12, 10), '#fbf8f2', { pos: [0, 0.22, 0], scale: [0.12, 0.22, 0.12] });
    p.add(G.cyl(12), '#fbf8f2', { pos: [0, 0.48, 0], scale: [0.05, 0.14, 0.05] });
    p.add(G.sphere(12, 10), '#fbf8f2', { pos: [0, 0.6, 0], scale: [0.07, 0.08, 0.07] });
    p.add(G.cyl(12), '#d8402f', { pos: [0, 0.44, 0], scale: [0.065, 0.03, 0.065] });
    pin.add(mesh(p));
    group.add(pin);
    pins.push(pin);
  }
  const r = 0.55;
  const ball = new THREE.Group();
  const bb = new Builder();
  bb.add(G.sphere(22, 16), '#2f4fa8', { scale: r });
  bb.add(G.sphere(10, 8), '#1a2448', { pos: [0, r * 0.82, r * 0.5], scale: [0.08, 0.04, 0.08] });
  bb.add(G.sphere(10, 8), '#1a2448', { pos: [-0.14, r * 0.62, r * 0.75], scale: [0.07, 0.04, 0.07] });
  bb.add(G.sphere(10, 8), '#1a2448', { pos: [0.14, r * 0.62, r * 0.75], scale: [0.07, 0.04, 0.07] });
  bb.add(G.sphere(8, 6), '#7ab0ff', { pos: [r * 0.45, r * 0.5, -r * 0.5], scale: 0.09 });
  ball.add(mesh(bb));
  group.add(ball);
  return { group, pins, ball, r, dispose: () => {} };
}

// ---------------------------------------------------------------- tanks

export interface Tank {
  group: THREE.Group;
  /** Bounces on its tracks. */
  hull: THREE.Group;
  turret: THREE.Group;
  barrel: THREE.Group;
  /** The road wheels, turned as it rolls (radius 0.2). */
  wheels: THREE.Group[];
  hatch: THREE.Group;
  dispose(): void;
}

/** A chubby cartoon tank, front at +z, olive with a star-free stencil number, tracks on little wheels. */
export function tank(n: number): Tank {
  const OLIVE = '#6b7a3a';
  const DARK = '#4a5428';
  const group = new THREE.Group();
  const hull = new THREE.Group();
  group.add(hull);
  const b = new Builder();
  for (const sx of [-1, 1]) {
    b.add(G.rbox(0.5), '#3a3a3e', { pos: [sx * 0.72, 0.32, 0], scale: [0.36, 0.5, 2.5] });
    b.add(G.box(), DARK, { pos: [sx * 0.72, 0.6, 0], scale: [0.42, 0.06, 2.3] });
  }
  b.add(G.rbox(0.25), OLIVE, { pos: [0, 0.68, 0], scale: [1.3, 0.48, 2.3] });
  b.add(G.rbox(0.3), OLIVE, { pos: [0, 0.62, 1.12], rot: [-0.5, 0, 0], scale: [1.2, 0.4, 0.4] });
  // Headlamps, and a big painted number on the side.
  for (const sx of [-1, 1]) b.add(G.sphere(10, 8), '#fff6c8', { pos: [sx * 0.45, 0.8, 1.17], scale: [0.09, 0.09, 0.05] });
  for (const sx of [-1, 1]) for (let k = 0; k <= n; k++) b.add(G.box(), '#f4efe6', { pos: [sx * 0.656, 0.7, -0.3 + k * 0.14], scale: [0.01, 0.22, 0.05] });
  hull.add(mesh(b));
  const wheels: THREE.Group[] = [];
  for (const sx of [-1, 1])
    for (let k = 0; k < 4; k++) {
      const w = new THREE.Group();
      w.position.set(sx * 0.92, 0.22, -0.8 + k * 0.53);
      const wb = new Builder();
      wb.add(G.cyl(12), '#55555c', { rot: [0, 0, Math.PI / 2], scale: [0.2, 0.06, 0.2] });
      wb.add(G.box(), '#9a9aa2', { scale: [0.07, 0.3, 0.05] });
      w.add(mesh(wb));
      hull.add(w);
      wheels.push(w);
    }
  const turret = new THREE.Group();
  turret.position.set(0, 0.92, -0.1);
  const tb = new Builder();
  tb.add(G.dome(18), OLIVE, { scale: [0.62, 0.42, 0.7] });
  tb.add(G.cyl(16), DARK, { pos: [0, 0.02, 0], scale: [0.64, 0.05, 0.72] });
  turret.add(mesh(tb));
  const barrel = new THREE.Group();
  barrel.position.set(0, 0.2, 0.55);
  const bb = new Builder();
  bb.add(G.cyl(12), DARK, { pos: [0, 0, 0.6], rot: [Math.PI / 2, 0, 0], scale: [0.09, 1.2, 0.09] });
  bb.add(G.cyl(12), DARK, { pos: [0, 0, 1.2], rot: [Math.PI / 2, 0, 0], scale: [0.13, 0.16, 0.13] });
  barrel.add(mesh(bb));
  turret.add(barrel);
  const hatch = new THREE.Group();
  hatch.position.set(-0.22, 0.42, -0.1);
  const hb = new Builder();
  hb.add(G.cyl(14), DARK, { pos: [0.22, 0.02, 0], scale: [0.22, 0.05, 0.22] });
  hatch.add(mesh(hb));
  turret.add(hatch);
  hull.add(turret);
  return { group, hull, turret, barrel, wheels, hatch, dispose: () => {} };
}

// ---------------------------------------------------------------- the paint cans

export interface PaintRig {
  group: THREE.Group;
  /** Each can's rope swings about the beam (rotation.x), from the camera's side over to the far side. */
  swings: THREE.Group[];
  /** How far below the beam the cans hang. */
  drop: number;
  dispose(): void;
}

/** A doorway frame with a landing over it and two paint cans on ropes, ready to swing down. `drop` the rope's length. */
export function paintRig(drop: number, beamY: number): PaintRig {
  const group = new THREE.Group();
  const b = new Builder();
  for (const sx of [-1, 1]) b.add(G.box(), WOOD, { pos: [sx * 1.1, beamY / 2, 0], scale: [0.16, beamY, 0.16] });
  b.add(G.box(), WOOD, { pos: [0, beamY, 0], scale: [2.5, 0.18, 0.4] });
  // The landing and a bit of banister.
  b.add(G.box(), '#a87a4e', { pos: [0, beamY + 0.12, -0.4], scale: [2.6, 0.08, 1.0] });
  for (let k = 0; k < 7; k++) b.add(G.box(), '#f4efe6', { pos: [-1.2 + k * 0.4, beamY + 0.42, 0.06], scale: [0.05, 0.56, 0.05] });
  b.add(G.box(), WOOD, { pos: [0, beamY + 0.72, 0.06], scale: [2.6, 0.08, 0.1] });
  group.add(mesh(b));
  const swings: THREE.Group[] = [];
  const colours = ['#3a8ad8', '#e0b02a'];
  for (const sx of [-0.35, 0.35]) {
    const s = new THREE.Group();
    s.position.set(sx, beamY, 0);
    const c = new Builder();
    c.add(G.cyl(6), '#d8c8a0', { pos: [0, -drop / 2, 0], scale: [0.015, drop, 0.015] });
    c.add(G.cyl(16), STEEL, { pos: [0, -drop - 0.17, 0], scale: [0.17, 0.32, 0.17] });
    c.add(G.cyl(16), colours[swings.length], { pos: [0, -drop - 0.17, 0], scale: [0.175, 0.2, 0.175] });
    c.add(G.torus(0.08, 6, 16), IRON, { pos: [0, -drop, 0], rot: [0, 0, 0], scale: [0.16, 0.16, 0.16] });
    s.add(mesh(c));
    group.add(s);
    swings.push(s);
  }
  return { group, swings, drop, dispose: () => {} };
}

// ---------------------------------------------------------------- the paddling pool and the shark

export interface Pool {
  group: THREE.Group;
  water: THREE.Mesh;
  /** The little fin circling, before the big moment. */
  fin: THREE.Group;
  dispose(): void;
}

/** A blow-up paddling pool, striped, about 2 metres across, with a little fin in it. */
export function pool(): Pool {
  const group = new THREE.Group();
  const b = new Builder();
  const R = 1.0;
  for (let k = 0; k < 3; k++) {
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      b.add(G.sphere(10, 8), i % 2 ? '#ff7ab8' : '#5ac0f0', { pos: [Math.cos(a) * R, 0.1 + k * 0.14, Math.sin(a) * R], rot: [0, -a, 0], scale: [0.13, 0.08, 0.3] });
    }
  }
  b.add(G.cyl(24), '#5ac0f0', { pos: [0, 0.015, 0], scale: [R, 0.03, R] });
  group.add(mesh(b));
  const water = new THREE.Mesh(new THREE.CylinderGeometry(R - 0.02, R - 0.02, 0.02, 28), new THREE.MeshLambertMaterial({ color: '#8acff4', transparent: true, opacity: 0.85, emissive: '#2a6a9a', emissiveIntensity: 0.3 }));
  water.position.y = 0.3;
  group.add(water);
  const fin = new THREE.Group();
  const f = new Builder();
  f.add(G.cone(3), '#7a8a9a', { pos: [0, 0.12, 0], rot: [0, Math.PI / 2, 0], scale: [0.1, 0.26, 0.02] });
  fin.add(mesh(f));
  group.add(fin);
  return { group, water, fin, dispose: () => {} };
}

export interface Shark {
  group: THREE.Group;
  /** Opens downwards (rotation.x). */
  jaw: THREE.Group;
  dispose(): void;
}

/** A great grey cartoon shark about 3 metres long, nose up along +y (it comes straight up out of the water). */
export function shark(): Shark {
  const GREY = '#7a8a9a';
  const group = new THREE.Group();
  const b = new Builder();
  b.add(G.sphere(18, 14), GREY, { pos: [0, 1.1, 0], scale: [0.62, 1.4, 0.6] });
  b.add(G.sphere(18, 14), '#f2f0ea', { pos: [0, 1.1, 0.18], scale: [0.5, 1.25, 0.46] });
  b.add(G.cone(3), GREY, { pos: [0, 1.0, -0.62], rot: [-0.2, Math.PI / 2, 0], scale: [0.12, 0.6, 0.38] });
  for (const sx of [-1, 1]) {
    b.add(G.cone(3), GREY, { pos: [sx * 0.6, 0.9, 0.05], rot: [0, 0, sx * 1.6], scale: [0.1, 0.6, 0.3] });
    b.add(G.sphere(8, 6), '#ffffff', { pos: [sx * 0.34, 2.15, 0.38], scale: [0.09, 0.1, 0.05] });
    b.add(G.sphere(8, 6), INK, { pos: [sx * 0.34, 2.15, 0.42], scale: 0.05 });
    for (let k = 0; k < 3; k++) b.add(G.box(), '#5a6a7a', { pos: [sx * 0.5, 1.75 - k * 0.1, 0.18], rot: [0, sx * 0.6, 0], scale: [0.01, 0.06, 0.16] });
  }
  // The tail, down in the water.
  b.add(G.cone(3), GREY, { pos: [0, -0.3, 0], rot: [0, Math.PI / 2, Math.PI], scale: [0.1, 0.6, 0.6] });
  // The upper jaw: the snout, the open mouth's dark inside, and teeth.
  b.add(G.sphere(16, 10), GREY, { pos: [0, 2.35, 0.05], scale: [0.5, 0.45, 0.5] });
  b.add(G.sphere(14, 10), '#7a2a3a', { pos: [0, 2.0, 0.38], scale: [0.4, 0.32, 0.18] });
  for (let k = 0; k < 9; k++) {
    const a = -1.1 + (k / 8) * 2.2;
    b.add(G.cone(4), '#ffffff', { pos: [Math.sin(a) * 0.38, 2.12, 0.33 + Math.cos(a) * 0.14], rot: [Math.PI, 0, 0], scale: [0.045, 0.1, 0.045] });
  }
  group.add(mesh(b));
  const jaw = new THREE.Group();
  jaw.position.set(0, 1.85, 0.2);
  const j = new Builder();
  j.add(G.sphere(14, 10), '#f2f0ea', { pos: [0, -0.05, 0.22], scale: [0.42, 0.14, 0.3] });
  for (let k = 0; k < 7; k++) {
    const a = -0.9 + (k / 6) * 1.8;
    j.add(G.cone(4), '#ffffff', { pos: [Math.sin(a) * 0.34, 0.06, 0.2 + Math.cos(a) * 0.12], scale: [0.04, 0.09, 0.04] });
  }
  jaw.add(mesh(j));
  group.add(jaw);
  return { group, jaw, dispose: () => {} };
}

/** A yellow rubber duck. */
export function duck(): THREE.Group {
  const b = new Builder();
  b.add(G.sphere(12, 10), '#ffd23a', { pos: [0, 0.09, 0], scale: [0.11, 0.09, 0.14] });
  b.add(G.sphere(12, 10), '#ffd23a', { pos: [0, 0.2, 0.08], scale: 0.07 });
  b.add(G.cone(6), '#ff8a2a', { pos: [0, 0.19, 0.17], rot: [Math.PI / 2, 0, 0], scale: [0.03, 0.06, 0.02] });
  for (const sx of [-1, 1]) b.add(G.sphere(6, 4), INK, { pos: [sx * 0.035, 0.23, 0.14], scale: 0.012 });
  return new THREE.Group().add(mesh(b));
}

// ---------------------------------------------------------------- the chomper

export interface Chomper {
  group: THREE.Group;
  /** The top and bottom halves, opening about the middle (rotation.x). */
  top: THREE.Group;
  bottom: THREE.Group;
  /** Its colour: yellow, or blue when it's frightened. */
  material: THREE.MeshLambertMaterial;
  dispose(): void;
}

/** A big round yellow chomper about 1.6 metres across, mouth to +z, a dark mouth inside. */
export function chomper(): Chomper {
  const R = 0.8;
  const group = new THREE.Group();
  const material = new THREE.MeshLambertMaterial({ color: '#ffd52a', emissive: '#6a5000', emissiveIntensity: 0.25 });
  const inside = new THREE.MeshLambertMaterial({ color: '#3a1218', side: THREE.DoubleSide });
  const half = new THREE.SphereGeometry(R, 28, 12, 0, Math.PI * 2, 0, Math.PI / 2);
  const disc = new THREE.CircleGeometry(R * 0.995, 28);
  const eyeGeo = new THREE.SphereGeometry(0.09, 10, 8);
  const eyeMat = new THREE.MeshLambertMaterial({ color: INK });
  const make = (up: boolean) => {
    const g = new THREE.Group();
    const shell = new THREE.Mesh(half, material);
    shell.castShadow = true;
    if (!up) shell.rotation.x = Math.PI;
    const lip = new THREE.Mesh(disc, inside);
    lip.rotation.x = -Math.PI / 2;
    g.add(shell, lip);
    if (up) {
      const eye = new THREE.Mesh(eyeGeo, eyeMat);
      eye.position.set(0.22, R * 0.62, R * 0.55);
      const eye2 = eye.clone();
      eye2.position.x = -0.22;
      g.add(eye, eye2);
    }
    return g;
  };
  const top = make(true);
  const bottom = make(false);
  top.position.y = bottom.position.y = R;
  group.add(top, bottom);
  return {
    group,
    top,
    bottom,
    material,
    dispose: () => {
      half.dispose();
      disc.dispose();
      eyeGeo.dispose();
      eyeMat.dispose();
      inside.dispose();
      material.dispose();
    },
  };
}

// ---------------------------------------------------------------- the falling blocks

/** A falling block piece of square cells `s` across, painted `color`, from cells [column, row] (row 0 at the bottom). */
export function blockPiece(cells: [number, number][], s: number, color: string): THREE.Group {
  const b = new Builder();
  const light = new THREE.Color(color).lerp(new THREE.Color('#ffffff'), 0.35);
  for (const [c, r] of cells) {
    b.add(G.rbox(0.12), color, { pos: [(c + 0.5) * s, (r + 0.5) * s, 0], scale: [s * 0.96, s * 0.96, s * 0.96] });
    b.add(G.box(), light, { pos: [(c + 0.5) * s, (r + 0.5) * s, s * 0.485], scale: [s * 0.6, s * 0.6, 0.01] });
  }
  return new THREE.Group().add(mesh(b));
}

// ---------------------------------------------------------------- the slingshot

export interface Sling {
  group: THREE.Group;
  /** Where the bands are tied, either fork (in the slingshot's frame). */
  forks: THREE.Vector3[];
  bands: THREE.Mesh[];
  pouch: THREE.Mesh;
  dispose(): void;
}

/** A great wooden Y of a slingshot, about 2 metres tall, with two red bands and a leather pouch. Forks across x. */
export function slingshot(): Sling {
  const group = new THREE.Group();
  const b = new Builder();
  b.add(G.taper(0.8, 10), '#6a4428', { pos: [0, 0.6, 0], scale: [0.14, 1.2, 0.14] });
  for (const sx of [-1, 1]) b.add(G.taper(0.75, 10), '#6a4428', { pos: [sx * 0.24, 1.48, 0], rot: [0, 0, sx * -0.5], scale: [0.11, 0.7, 0.11] });
  group.add(mesh(b));
  const forks = [new THREE.Vector3(-0.42, 1.8, 0), new THREE.Vector3(0.42, 1.8, 0)];
  const bandMat = new THREE.MeshLambertMaterial({ color: '#c23a32' });
  const bandGeo = new THREE.CylinderGeometry(0.035, 0.035, 1, 6).translate(0, 0.5, 0);
  const bands = forks.map(() => {
    const m = new THREE.Mesh(bandGeo, bandMat);
    group.add(m);
    return m;
  });
  const pouch = new THREE.Mesh(new THREE.SphereGeometry(0.2, 12, 8, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), new THREE.MeshLambertMaterial({ color: '#5a3a24', side: THREE.DoubleSide }));
  group.add(pouch);
  return { group, forks, bands, pouch, dispose: () => (bandGeo.dispose(), bandMat.dispose()) };
}

/** A plank (wood) or slab (stone) for the tower, `w` by `h` by `d`. */
export function slab(w: number, h: number, d: number, stone = false): THREE.Group {
  const b = new Builder();
  b.add(G.rbox(0.15), stone ? '#a8a8b0' : '#c8904e', { scale: [w, h, d] });
  if (!stone) for (const k of [-0.25, 0.25]) b.add(G.box(), '#a87038', { pos: w > h ? [k * w, 0, d / 2 + 0.003] : [0, k * h, d / 2 + 0.003], scale: w > h ? [0.02, h * 0.7, 0.003] : [w * 0.7, 0.02, 0.003] });
  return new THREE.Group().add(mesh(b));
}

// ---------------------------------------------------------------- the kitchen set

export interface Kitchen {
  group: THREE.Group;
  /** The window's glass (it shatters), and the middle of the window in the kitchen's frame. */
  glass: THREE.Mesh;
  window: THREE.Vector3;
  /** Where the stool is (they sit on it), and its seat's height. */
  stool: THREE.Vector3;
  seat: number;
  dispose(): void;
}

/**
 * A little kitchen set, open to the front (+z) like a TV set: a back wall with a window, a counter with a fruit
 * bowl, a fridge, a table and a stool, and lamps on stands.
 */
export function kitchen(): Kitchen {
  const group = new THREE.Group();
  const b = new Builder();
  const W = 4.2;
  const H = 2.6;
  // The back wall in two halves and above and below the window (1.0 to 1.9 high, 1.0 wide, left of middle).
  const wx = -0.7;
  const ww = 1.0;
  const sill = 0.95;
  const top = 1.95;
  const wall = '#f2e2b8';
  const leftW = wx - ww / 2 + W / 2;
  const rightW = W / 2 - (wx + ww / 2);
  b.add(G.box(), wall, { pos: [-W / 2 + leftW / 2, H / 2, 0], scale: [leftW, H, 0.12] });
  b.add(G.box(), wall, { pos: [W / 2 - rightW / 2, H / 2, 0], scale: [rightW, H, 0.12] });
  b.add(G.box(), wall, { pos: [wx, sill / 2, 0], scale: [ww, sill, 0.12] });
  b.add(G.box(), wall, { pos: [wx, (top + H) / 2, 0], scale: [ww, H - top, 0.12] });
  // Tiles along the back, and the window frame.
  for (let k = 0; k < 6; k++) b.add(G.box(), '#9ac8d8', { pos: [0.9 + (k % 3) * 0.3, 0.98 + Math.floor(k / 3) * 0.3, 0.065], scale: [0.27, 0.27, 0.01] });
  for (const dy of [sill, top]) b.add(G.box(), '#f8f6f0', { pos: [wx, dy, 0.07], scale: [ww + 0.12, 0.08, 0.06] });
  for (const dx of [-1, 1]) b.add(G.box(), '#f8f6f0', { pos: [wx + (dx * ww) / 2, (sill + top) / 2, 0.07], scale: [0.08, top - sill, 0.06] });
  b.add(G.box(), '#f8f6f0', { pos: [wx, (sill + top) / 2, 0.07], scale: [0.04, top - sill, 0.04] });
  // Curtains.
  for (const dx of [-1, 1]) b.add(G.box(), '#e86a5a', { pos: [wx + dx * (ww / 2 + 0.12), (sill + top) / 2 + 0.1, 0.12], scale: [0.2, top - sill + 0.3, 0.03] });
  // A floor of black and white tiles.
  for (let i = 0; i < 7; i++) for (let j = 0; j < 4; j++) b.add(G.box(), (i + j) % 2 ? '#f4efe6' : '#3a3a44', { pos: [-W / 2 + (i + 0.5) * (W / 7), 0.02, 0.3 + j * 0.45], scale: [W / 7, 0.04, 0.45] });
  // The counter and the fridge on the right, a fruit bowl.
  b.add(G.box(), '#c87a4a', { pos: [1.2, 0.45, 0.4], scale: [1.4, 0.9, 0.6] });
  b.add(G.box(), '#f4efe6', { pos: [1.2, 0.92, 0.4], scale: [1.46, 0.06, 0.66] });
  b.add(G.dome(14), '#5a8ac0', { pos: [1.0, 0.95, 0.4], rot: [Math.PI, 0, 0], scale: [0.18, 0.1, 0.18] });
  for (let k = 0; k < 3; k++) b.add(G.sphere(8, 6), ['#e84a3a', '#ffb02a', '#7ac04a'][k], { pos: [0.93 + k * 0.07, 0.99, 0.4 + (k - 1) * 0.04], scale: 0.06 });
  b.add(G.rbox(0.15), '#e8eef4', { pos: [1.85, 0.95, 0.4], scale: [0.5, 1.9, 0.6] });
  b.add(G.box(), STEEL, { pos: [1.65, 1.2, 0.71], scale: [0.03, 0.4, 0.03] });
  // A table with a jug of lemonade and a plate of cookies (the stool by it).
  b.add(G.cyl(18), '#f4efe6', { pos: [-0.4, 0.74, 1.05], scale: [0.4, 0.04, 0.4] });
  b.add(G.cyl(10), IRON, { pos: [-0.4, 0.37, 1.05], scale: [0.05, 0.74, 0.05] });
  b.add(G.cyl(14), '#f4d24a', { pos: [-0.5, 0.86, 1.0], scale: [0.07, 0.2, 0.07] });
  b.add(G.cyl(14), '#ffffff', { pos: [-0.28, 0.77, 1.12], scale: [0.12, 0.01, 0.12] });
  for (let k = 0; k < 3; k++) b.add(G.cyl(10), '#c8904e', { pos: [-0.31 + k * 0.04, 0.785 + k * 0.012, 1.1 + k * 0.03], scale: [0.04, 0.012, 0.04] });
  const stool = new THREE.Vector3(0.45, 0, 1.15);
  const seat = 0.5;
  b.add(G.cyl(14), '#c23a32', { pos: [stool.x, seat - 0.03, stool.z], scale: [0.22, 0.06, 0.22] });
  for (let k = 0; k < 3; k++) {
    const a = (k / 3) * Math.PI * 2;
    b.add(G.cyl(6), STEEL, { pos: [stool.x + Math.cos(a) * 0.12, seat / 2, stool.z + Math.sin(a) * 0.12], scale: [0.02, seat, 0.02] });
  }
  // Studio lamps on stands at the front corners, turned in.
  for (const dx of [-1, 1]) {
    b.add(G.cyl(8), IRON, { pos: [dx * (W / 2 + 0.3), 1.0, 2.2], scale: [0.03, 2.0, 0.03] });
    b.add(G.taper(0.6, 12), IRON, { pos: [dx * (W / 2 + 0.3), 2.05, 2.2], rot: [0.5, 0, dx * 0.4], scale: [0.18, 0.26, 0.18] });
  }
  group.add(mesh(b));
  const glass = new THREE.Mesh(new THREE.PlaneGeometry(ww, top - sill), new THREE.MeshLambertMaterial({ color: '#cfeaf8', transparent: true, opacity: 0.45, emissive: '#6aa8c8', emissiveIntensity: 0.3, side: THREE.DoubleSide }));
  glass.position.set(wx, (sill + top) / 2, 0.06);
  group.add(glass);
  return { group, glass, window: new THREE.Vector3(wx, (sill + top) / 2, 0), stool, seat, dispose: () => {} };
}

/** Polka-dot underpants, about `w` across the hips, for someone who has lost the rest of their look. */
export function undies(w: number): THREE.Group {
  const b = new Builder();
  b.add(G.cyl(16), '#ffffff', { scale: [w * 0.55, w * 0.32, w * 0.42] });
  for (let k = 0; k < 10; k++) {
    const a = (k / 10) * Math.PI * 2;
    b.add(G.sphere(6, 4), '#d8402f', { pos: [Math.cos(a) * w * 0.55, (k % 2 ? 0.07 : -0.07) * w, Math.sin(a) * w * 0.42], scale: w * 0.05 });
  }
  return new THREE.Group().add(mesh(b));
}

// ---------------------------------------------------------------- the titan

export interface Titan {
  group: THREE.Group;
  body: THREE.Group;
  head: THREE.Group;
  /** Left then right (as he faces +z), from the shoulders; the right wears the gauntlet. */
  arms: THREE.Group[];
  /** The gauntlet's fist, at the end of the right arm. */
  fist: THREE.Object3D;
  legs: THREE.Group[];
  /** The stones in the gauntlet, which glow. */
  stones: THREE.MeshLambertMaterial;
  dispose(): void;
}

/**
 * A big purple titan about three metres tall, with a heavy ridged chin, gold armour on his shoulders and helmet, blue
 * trousers, and one golden gauntlet set with six coloured stones. Not anybody in particular.
 */
export function titan(): Titan {
  const PURPLE = '#8a5aa8';
  const DARK = '#6a4088';
  const GOLD = '#e0b03a';
  const BLUE = '#3a4a8a';
  const group = new THREE.Group();
  const skin = matte();
  const legs: THREE.Group[] = [];
  for (const sx of [-1, 1]) {
    const leg = new THREE.Group();
    leg.position.set(sx * 0.3, 1.1, 0);
    const b = new Builder();
    b.add(G.taper(0.8, 12), BLUE, { pos: [0, -0.5, 0], scale: [0.24, 1.0, 0.24] });
    b.add(G.rbox(0.3), GOLD, { pos: [0, -1.02, 0.08], scale: [0.3, 0.16, 0.44] });
    leg.add(b.mesh(skin));
    group.add(leg);
    legs.push(leg);
  }
  const body = new THREE.Group();
  body.position.set(0, 1.1, 0);
  group.add(body);
  const t = new Builder();
  t.add(G.rbox(0.3), BLUE, { pos: [0, 0.1, 0], scale: [0.8, 0.3, 0.5] });
  t.add(G.box(), GOLD, { pos: [0, 0.22, 0], scale: [0.84, 0.08, 0.54] });
  t.add(G.sphere(18, 14), BLUE, { pos: [0, 0.75, 0], scale: [0.62, 0.6, 0.42] });
  t.add(G.sphere(16, 12), GOLD, { pos: [0, 0.82, 0.18], scale: [0.4, 0.38, 0.26] });
  for (const sx of [-1, 1]) t.add(G.sphere(14, 10), GOLD, { pos: [sx * 0.62, 1.22, 0], scale: [0.3, 0.22, 0.3] });
  t.add(G.taper(0.8, 12), PURPLE, { pos: [0, 1.36, 0.02], scale: [0.22, 0.2, 0.22] });
  body.add(t.mesh(skin));
  const head = new THREE.Group();
  head.position.set(0, 1.5, 0.04);
  const h = new Builder();
  h.add(G.sphere(16, 12), PURPLE, { pos: [0, 0.22, 0], scale: [0.26, 0.3, 0.26] });
  // The great ridged chin, and lines down it.
  h.add(G.rbox(0.45), PURPLE, { pos: [0, 0.05, 0.08], scale: [0.36, 0.22, 0.3] });
  for (const sx of [-1, 0, 1]) h.add(G.box(), DARK, { pos: [sx * 0.07, 0.04, 0.231], scale: [0.02, 0.16, 0.01] });
  for (const sx of [-1, 1]) {
    h.add(G.sphere(8, 6), '#ffffff', { pos: [sx * 0.09, 0.27, 0.22], scale: [0.045, 0.028, 0.02] });
    h.add(G.sphere(8, 6), INK, { pos: [sx * 0.09, 0.27, 0.235], scale: 0.016 });
    h.add(G.box(), DARK, { pos: [sx * 0.09, 0.32, 0.23], rot: [0, 0, sx * 0.25], scale: [0.11, 0.025, 0.02] });
  }
  h.add(G.box(), '#4a2a5a', { pos: [0, 0.13, 0.235], scale: [0.14, 0.02, 0.01] });
  // A golden helmet with fins.
  h.add(G.dome(16), GOLD, { pos: [0, 0.32, -0.02], scale: [0.28, 0.26, 0.28] });
  for (const sx of [-1, 1]) h.add(G.cone(4), GOLD, { pos: [sx * 0.3, 0.46, -0.04], rot: [0, 0, sx * -0.5], scale: [0.06, 0.26, 0.04] });
  head.add(h.mesh(skin));
  body.add(head);
  const stones = new THREE.MeshLambertMaterial({ vertexColors: true, emissive: '#ffffff', emissiveIntensity: 0.15 });
  const arms: THREE.Group[] = [];
  let fist = new THREE.Object3D();
  for (const sx of [-1, 1]) {
    const arm = new THREE.Group();
    arm.position.set(sx * 0.72, 1.22, 0);
    const a = new Builder();
    a.add(G.sphere(14, 10), PURPLE, { pos: [0, -0.35, 0], scale: [0.2, 0.4, 0.2] });
    const glove = sx > 0;
    a.add(G.sphere(14, 10), glove ? GOLD : PURPLE, { pos: [0, -0.82, 0.02], scale: [0.18, 0.36, 0.18] });
    a.add(G.sphere(12, 10), glove ? GOLD : PURPLE, { pos: [0, -1.2, 0.04], scale: [0.2, 0.18, 0.2] });
    arm.add(a.mesh(skin));
    if (glove) {
      // Six stones: one on the back of the hand, one on each knuckle.
      const s = new Builder();
      const colours = ['#e8d040', '#d83a3a', '#3a6ad8', '#e88a2a', '#3ac06a', '#a050e0'];
      s.add(G.sphere(10, 8), colours[0], { pos: [0, -1.18, 0.21], scale: [0.07, 0.07, 0.04] });
      for (let k = 0; k < 5; k++) s.add(G.sphere(8, 6), colours[k + 1], { pos: [-0.12 + k * 0.06, -1.32, 0.15], scale: 0.035 });
      arm.add(s.mesh(stones));
      fist = new THREE.Object3D();
      fist.position.set(0, -1.25, 0.08);
      arm.add(fist);
    }
    body.add(arm);
    arms.push(arm);
  }
  return { group, body, head, arms, fist, legs, stones, dispose: () => (skin.dispose(), stones.dispose()) };
}

// ---------------------------------------------------------------- the MLG 360

/** A falling party: a red bag of triangle chips, a single chip, or a green fizzy can. `kind` 0, 1 or 2. */
export function snack(kind: number): THREE.Group {
  const b = new Builder();
  if (kind === 0) {
    b.add(G.rbox(0.3), '#d8302a', { scale: [0.36, 0.48, 0.12] });
    b.add(G.cone(3), '#f2a02a', { pos: [0, 0, 0.065], rot: [Math.PI / 2, 0, 0], scale: [0.11, 0.01, 0.11] });
    b.add(G.box(), '#f4efe6', { pos: [0, 0.17, 0.062], scale: [0.26, 0.06, 0.005] });
  } else if (kind === 1) {
    b.add(G.cone(3), '#f2a02a', { rot: [Math.PI / 2, 0, 0], scale: [0.12, 0.02, 0.12] });
  } else {
    b.add(G.cyl(14), '#3ac03a', { scale: [0.09, 0.26, 0.09] });
    b.add(G.cyl(14), STEEL, { pos: [0, 0.135, 0], scale: [0.085, 0.015, 0.085] });
    b.add(G.box(), '#1e5a1e', { pos: [0, 0.02, 0.089], scale: [0.1, 0.08, 0.005] });
  }
  return new THREE.Group().add(mesh(b));
}

/** Pixel shades, black squares with a white glint, about `w` across (the lenses face +z). */
export function pixelShades(w: number): THREE.Group {
  const b = new Builder();
  const px = w / 10;
  // Two rows: the bar across the top, then the lenses with a gap for the nose.
  for (let i = 0; i < 10; i++) b.add(G.box(), INK, { pos: [(i - 4.5) * px, px / 2, 0], scale: [px, px, px] });
  for (const i of [0, 1, 2, 3, 6, 7, 8, 9]) b.add(G.box(), i === 1 || i === 7 ? '#ffffff' : INK, { pos: [(i - 4.5) * px, -px / 2, 0], scale: [px, px, px] });
  for (const i of [1, 2, 7, 8]) b.add(G.box(), INK, { pos: [(i - 4.5) * px, -px * 1.5, 0], scale: [px, px, px] });
  return new THREE.Group().add(b.mesh(matte(), { crease: 0 }));
}

/** A hit marker: four short white bars round a gap, in an X, flat facing +z. */
export function hitMarker(r: number): THREE.Group {
  const b = new Builder();
  for (let k = 0; k < 4; k++) {
    const a = Math.PI / 4 + (k * Math.PI) / 2;
    b.add(G.box(), '#ffffff', { pos: [Math.cos(a) * r, Math.sin(a) * r, 0], rot: [0, 0, a], scale: [r * 0.9, r * 0.18, 0.01] });
  }
  return new THREE.Group().add(b.mesh(new THREE.MeshBasicMaterial({ vertexColors: true, depthTest: false }), { cast: false, receive: false }));
}
