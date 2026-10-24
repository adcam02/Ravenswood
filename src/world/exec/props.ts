import * as THREE from 'three';
import { Builder, matte } from '../build';
import { G } from '../town/kit';
import { signBoard, TextSign } from '../town/sign';

/**
 * The props for each way to be executed, built in the town's style (chunky painted wood, brass and iron, soft
 * shapes), each in its own frame: the origin on the floor, facing +z. Moving parts are groups of their own.
 */

const WOOD = '#5a3d2a';
const PLANK = '#7a5236';
const PALE = '#a7774c';
const IRON = '#3b3a44';
const STEEL = '#c9d2dc';
const BRASS = '#d7a943';
const ROPE = '#d8c8a0';
const LEATHER = '#4a3324';

const mesh = (b: Builder, material: THREE.Material = matte()) => b.mesh(material, { cast: true, receive: false });

// ---------------------------------------------------------------- the firing squad

export interface Soldier {
  group: THREE.Group;
  /** Turns the musket from shouldered (0) to levelled at the target (1), about the shoulder. */
  arm: THREE.Group;
  /** At the end of the barrel. */
  muzzle: THREE.Object3D;
  /** Pops out of the barrel instead of a shot. */
  flag: THREE.Group;
  dispose(): void;
}

/** A wooden toy soldier: tall black hat, red coat with white belts, a moustache, and a musket on the right shoulder. */
export function soldier(i: number): Soldier {
  const group = new THREE.Group();
  const b = new Builder();
  const coat = i % 2 ? '#c4473a' : '#b83c33';
  // Boots and trousers.
  for (const sx of [-1, 1]) {
    b.add(G.rbox(0.3), '#1e1c22', { pos: [sx * 0.08, 0.05, 0.03], scale: [0.11, 0.1, 0.2] });
    b.add(G.cyl(10), '#2f4f86', { pos: [sx * 0.08, 0.27, 0], scale: [0.065, 0.36, 0.065] });
  }
  // The coat, its belts, buttons and cuffs.
  b.add(G.rbox(0.25), coat, { pos: [0, 0.62, 0], scale: [0.36, 0.44, 0.26] });
  b.add(G.box(), '#f4efe6', { pos: [0, 0.43, 0], scale: [0.37, 0.05, 0.27] });
  for (const s of [-1, 1]) b.add(G.box(), '#f4efe6', { pos: [0, 0.64, 0.133], rot: [0, 0, s * 0.62], scale: [0.04, 0.46, 0.01] });
  for (let k = 0; k < 3; k++) b.add(G.sphere(8, 6), BRASS, { pos: [0, 0.52 + k * 0.1, 0.135], scale: 0.018 });
  for (const s of [-1, 1]) b.add(G.rbox(0.3), BRASS, { pos: [s * 0.2, 0.83, 0], scale: [0.1, 0.04, 0.16] });
  // The left arm hangs at the side.
  b.add(G.cyl(10), coat, { pos: [-0.21, 0.63, 0], rot: [0, 0, -0.08], scale: [0.055, 0.34, 0.055] });
  b.add(G.sphere(10, 8), '#f4efe6', { pos: [-0.225, 0.44, 0], scale: 0.05 });
  // A round wooden face with rosy cheeks, black dot eyes and a fine moustache.
  b.add(G.sphere(16, 12), '#f2c9a0', { pos: [0, 0.98, 0], scale: [0.14, 0.15, 0.14] });
  for (const s of [-1, 1]) {
    b.add(G.sphere(8, 6), '#e88a7a', { pos: [s * 0.08, 0.94, 0.11], scale: [0.035, 0.025, 0.02] });
    b.add(G.sphere(8, 6), '#1e1c22', { pos: [s * 0.045, 1.0, 0.13], scale: [0.018, 0.022, 0.012] });
    b.add(G.sphere(10, 6), '#4a3020', { pos: [s * 0.04, 0.935, 0.135], rot: [0, 0, s * 0.35], scale: [0.045, 0.016, 0.018] });
  }
  // The tall black hat, with a gold chin strap and a red plume.
  b.add(G.cyl(16), '#1b1a20', { pos: [0, 1.25, 0], scale: [0.15, 0.36, 0.15] });
  b.add(G.sphere(12, 8), '#1b1a20', { pos: [0, 1.43, 0], scale: [0.15, 0.05, 0.15] });
  b.add(G.box(), BRASS, { pos: [0, 1.1, 0.14], scale: [0.2, 0.02, 0.02] });
  b.add(G.sphere(10, 8), '#d8402f', { pos: [0.13, 1.36, 0.02], scale: [0.04, 0.09, 0.04] });
  group.add(mesh(b));

  // The right arm and the musket, about the shoulder: the barrel points up at rest and forward when levelled.
  const arm = new THREE.Group();
  arm.position.set(0.21, 0.8, 0.02);
  const a = new Builder();
  a.add(G.cyl(10), coat, { pos: [0, -0.16, 0], scale: [0.055, 0.34, 0.055] });
  a.add(G.sphere(10, 8), '#f4efe6', { pos: [0, -0.33, 0.02], scale: 0.05 });
  // (The musket: stock at the hand, barrel up past the shoulder.)
  a.add(G.rbox(0.3), PALE, { pos: [-0.02, -0.33, 0.05], rot: [0.12, 0, 0], scale: [0.05, 0.3, 0.07] });
  a.add(G.cyl(8), '#55525c', { pos: [-0.02, 0.12, 0.07], scale: [0.018, 0.68, 0.018] });
  a.add(G.box(), PALE, { pos: [-0.02, -0.05, 0.065], scale: [0.04, 0.3, 0.04] });
  arm.add(mesh(a));
  const muzzle = new THREE.Object3D();
  muzzle.position.set(-0.02, 0.47, 0.07);
  arm.add(muzzle);
  group.add(arm);

  // "BANG!" on a little flag, for the shot that never was.
  const flag = new THREE.Group();
  const stick = new Builder();
  stick.add(G.cyl(6), '#e8e2d4', { pos: [0, 0.2, 0], scale: [0.012, 0.4, 0.012] });
  flag.add(mesh(stick));
  const text = new TextSign({ w: 256, h: 128, bg: '#fffaf0', fg: '#d8402f', border: '#d8402f', size: 84, weight: 800 }, 'BANG!');
  const board = signBoard(text, 0.44, 0.22, { lit: true });
  // (Levelled, the barrel's frame has z pointing down: the flag hangs square to the squad's backs, text upright.)
  board.mesh.position.set(0.22, 0.34, 0);
  board.mesh.rotation.x = -Math.PI / 2;
  flag.add(board.mesh);
  flag.scale.setScalar(0.001);
  muzzle.add(flag);
  return {
    group,
    arm,
    muzzle,
    flag,
    dispose: () => {
      text.dispose();
      board.material.dispose();
    },
  };
}

// ---------------------------------------------------------------- the guillotine

export interface GuillotineSize {
  /** The middle of the neck hole, above the floor. */
  lunette: number;
  /** The neck hole's radius. */
  hole: number;
  /** The top of the bench the body lies on, and how far back it reaches. */
  bench: number;
  benchLen: number;
  /** The basket's radius. */
  basket: number;
}

export interface Guillotine {
  group: THREE.Group;
  /** The blade and its weight; its origin is the blade's lowest point. */
  blade: THREE.Group;
  /** How high the blade's lowest point sits when drawn up. */
  top: number;
  /** The basket's middle, on the floor. */
  basketAt: THREE.Vector3;
  basketDepth: number;
  dispose(): void;
}

/** A tall frame with a slanting blade, a neck board with a round hole, a bench to lie on and a wicker basket in front. */
export function guillotine(s: GuillotineSize): Guillotine {
  const group = new THREE.Group();
  const w = Math.max(0.6, s.hole * 2 + 0.4);
  const top = s.lunette + 1.55;
  const b = new Builder();
  for (const sx of [-1, 1]) {
    b.add(G.box(), WOOD, { pos: [sx * (w / 2 + 0.07), top / 2 + 0.2, 0], scale: [0.14, top + 0.4, 0.16] });
    // The grooves the blade runs in, and a foot to stand it up.
    b.add(G.box(), IRON, { pos: [sx * (w / 2 + 0.005), top / 2 + 0.2, 0], scale: [0.012, top + 0.3, 0.05] });
    b.add(G.box(), WOOD, { pos: [sx * (w / 2 + 0.07), 0.05, 0], scale: [0.2, 0.1, 0.6] });
    b.add(G.box(), WOOD, { pos: [sx * (w / 2 + 0.07), 0.45, -0.16], rot: [-0.75, 0, 0], scale: [0.08, 0.6, 0.08] });
  }
  // The crossbeam, with a little peaked cap and a brass pulley.
  b.add(G.box(), WOOD, { pos: [0, top + 0.42, 0], scale: [w + 0.46, 0.16, 0.22] });
  b.add(G.prism(), PLANK, { pos: [0, top + 0.5, 0], rot: [0, Math.PI / 2, 0], scale: [0.26, 0.14, w + 0.5] });
  b.add(G.cyl(12), BRASS, { pos: [w / 2 + 0.07, top + 0.3, 0.1], rot: [Math.PI / 2, 0, 0], scale: [0.06, 0.04, 0.06] });
  // The rope runs down the side to a cleat.
  b.add(G.cyl(6), ROPE, { pos: [w / 2 + 0.13, top / 2 + 0.6, 0.1], scale: [0.012, top - 0.6, 0.012] });
  b.add(G.box(), IRON, { pos: [w / 2 + 0.15, 0.9, 0.1], scale: [0.04, 0.12, 0.04] });
  // The bench, on its legs, behind the neck board.
  const bz = -0.12 - s.benchLen / 2;
  b.add(G.rbox(0.15), PLANK, { pos: [0, s.bench - 0.05, bz], scale: [0.44, 0.1, s.benchLen] });
  for (const z of [-0.2, -s.benchLen + 0.05]) for (const sx of [-1, 1]) b.add(G.box(), WOOD, { pos: [sx * 0.17, (s.bench - 0.1) / 2, z], scale: [0.07, s.bench - 0.1, 0.07] });
  // A strap across the bench.
  b.add(G.box(), LEATHER, { pos: [0, s.bench + 0.01, bz], scale: [0.46, 0.03, 0.08] });
  group.add(mesh(b));

  // The neck board: a plank with a round hole in it.
  const board = new THREE.Shape();
  const bh = s.hole * 2 + 0.34;
  board.moveTo(-w / 2, -bh / 2);
  board.lineTo(w / 2, -bh / 2);
  board.lineTo(w / 2, bh / 2);
  board.lineTo(-w / 2, bh / 2);
  board.lineTo(-w / 2, -bh / 2);
  const hole = new THREE.Path();
  hole.absarc(0, 0, s.hole, 0, Math.PI * 2, true);
  board.holes.push(hole);
  const boardGeo = new THREE.ExtrudeGeometry(board, { depth: 0.09, bevelEnabled: false, curveSegments: 20 });
  boardGeo.translate(0, s.lunette, -0.045);
  const boardMat = new THREE.MeshLambertMaterial({ color: PLANK });
  const lunette = new THREE.Mesh(boardGeo, boardMat);
  group.add(lunette);
  // The split across the board, where it opens.
  const seam = new Builder();
  seam.add(G.box(), WOOD, { pos: [-(w / 2 + s.hole) / 2, s.lunette, 0], scale: [w / 2 - s.hole, 0.02, 0.1] });
  seam.add(G.box(), WOOD, { pos: [(w / 2 + s.hole) / 2, s.lunette, 0], scale: [w / 2 - s.hole, 0.02, 0.1] });
  group.add(mesh(seam));

  // The blade: slanted steel with a bright edge, under a heavy block. Its origin is the edge's lowest point.
  const blade = new THREE.Group();
  const steel = new THREE.Shape();
  const bw = w - 0.02;
  steel.moveTo(-bw / 2, 0);
  steel.lineTo(bw / 2, 0.26);
  steel.lineTo(bw / 2, 0.52);
  steel.lineTo(-bw / 2, 0.52);
  steel.lineTo(-bw / 2, 0);
  const steelGeo = new THREE.ExtrudeGeometry(steel, { depth: 0.03, bevelEnabled: false });
  steelGeo.translate(0, 0, -0.015);
  const steelMat = new THREE.MeshStandardMaterial({ color: STEEL, metalness: 0.55, roughness: 0.32 });
  blade.add(new THREE.Mesh(steelGeo, steelMat));
  const bb = new Builder();
  bb.add(G.box(), '#f4f7fb', { pos: [0, 0.13, 0], rot: [0, 0, Math.atan2(0.26, bw)], scale: [Math.hypot(bw, 0.26), 0.025, 0.034] });
  bb.add(G.box(), WOOD, { pos: [0, 0.64, 0], scale: [bw + 0.02, 0.24, 0.12] });
  for (const sx of [-1, 1]) bb.add(G.sphere(8, 6), IRON, { pos: [sx * bw * 0.35, 0.64, 0.065], scale: 0.025 });
  blade.add(mesh(bb));
  blade.position.y = top - 0.8;
  group.add(blade);

  // The wicker basket in front, open at the top.
  const basketAt = new THREE.Vector3(0, 0, s.hole + 0.08 + s.basket);
  const depth = Math.max(0.2, s.basket * 0.85);
  const wicker = new Builder();
  wicker.add(new THREE.CylinderGeometry(s.basket, s.basket * 0.82, depth, 18, 1, true), '#c99a5a', { pos: [basketAt.x, depth / 2, basketAt.z] });
  wicker.add(G.cyl(18), '#a87a42', { pos: [basketAt.x, 0.015, basketAt.z], scale: [s.basket * 0.82, 0.03, s.basket * 0.82] });
  for (let k = 1; k < 4; k++) {
    const r = s.basket * (0.82 + 0.18 * (k / 4));
    wicker.add(G.torus(0.12, 6, 24), '#a87a42', { pos: [basketAt.x, (depth * k) / 4, basketAt.z], rot: [Math.PI / 2, 0, 0], scale: [r, r, r * 0.6] });
  }
  wicker.add(G.torus(0.22, 6, 24), '#8a6236', { pos: [basketAt.x, depth, basketAt.z], rot: [Math.PI / 2, 0, 0], scale: [s.basket, s.basket, s.basket * 0.8] });
  const wickerMat = matte();
  wickerMat.side = THREE.DoubleSide;
  group.add(mesh(wicker, wickerMat));
  return {
    group,
    blade,
    top: top - 0.8,
    basketAt,
    basketDepth: depth,
    dispose: () => {
      boardGeo.dispose();
      boardMat.dispose();
      steelGeo.dispose();
      steelMat.dispose();
    },
  };
}

// ---------------------------------------------------------------- the electric chair

export interface ChairSize {
  /** Where the sitter's seat is, and the top of their head. */
  seat: number;
  head: number;
  /** Half the width between the arms. */
  half: number;
}

export interface Chair {
  group: THREE.Group;
  /** The metal cap, hanging from its wire; its origin is the bottom of the rim. */
  cap: THREE.Group;
  /** The big switch's handle, turned from up (0) to down (1) about its hinge. */
  lever: THREE.Group;
  /** The bulb's glow on top of the switch box, and the cap's sparks' spot. */
  bulb: THREE.MeshStandardMaterial;
  /** Where the cable comes out of the box, for sparks. */
  socket: THREE.Vector3;
  /** Where the switch box stands. */
  box: THREE.Vector3;
  wire: THREE.Mesh;
  dispose(): void;
}

/** A great wooden chair with leather straps, a metal cap on a wire, and a switch box with a big lever beside it. */
export function chair(s: ChairSize): Chair {
  const group = new THREE.Group();
  const w = s.half * 2 + 0.24;
  const seatY = Math.max(0.25, s.seat - 0.04);
  const backTop = Math.max(seatY + 0.8, s.head + 0.1);
  const b = new Builder();
  // Legs, seat, back, arms and straps.
  for (const sx of [-1, 1])
    for (const z of [-0.24, 0.24]) b.add(G.box(), WOOD, { pos: [sx * (w / 2 - 0.05), seatY / 2, z], scale: [0.1, seatY, 0.1] });
  b.add(G.rbox(0.12), PLANK, { pos: [0, seatY, 0], scale: [w, 0.09, 0.6] });
  b.add(G.rbox(0.1), PLANK, { pos: [0, (seatY + backTop) / 2, -0.3], scale: [w, backTop - seatY, 0.09] });
  for (const sx of [-1, 1]) b.add(G.box(), WOOD, { pos: [sx * (w / 2 - 0.05), (seatY + backTop) / 2, -0.3], scale: [0.12, backTop - seatY + 0.06, 0.12] });
  b.add(G.box(), WOOD, { pos: [0, backTop + 0.04, -0.3], scale: [w + 0.1, 0.1, 0.14] });
  for (const sx of [-1, 1]) {
    b.add(G.box(), WOOD, { pos: [sx * (w / 2 - 0.05), seatY + 0.13, 0.2], scale: [0.08, 0.26, 0.08] });
    b.add(G.rbox(0.2), PLANK, { pos: [sx * (w / 2 - 0.05), seatY + 0.28, 0], scale: [0.12, 0.06, 0.58] });
    b.add(G.box(), LEATHER, { pos: [sx * (w / 2 - 0.05), seatY + 0.3, 0.12], scale: [0.14, 0.07, 0.06] });
    b.add(G.box(), BRASS, { pos: [sx * (w / 2 - 0.05), seatY + 0.3, 0.12], scale: [0.05, 0.08, 0.065] });
    b.add(G.box(), LEATHER, { pos: [sx * (w / 2 - 0.05), 0.2, 0.24], scale: [0.12, 0.06, 0.12] });
  }
  // A hanger from the back of the chair over the head, for the cap's wire.
  const hang = backTop + 0.55;
  b.add(G.box(), IRON, { pos: [0, (backTop + hang) / 2, -0.33], scale: [0.05, hang - backTop, 0.05] });
  b.add(G.box(), IRON, { pos: [0, hang, -0.15], scale: [0.05, 0.05, 0.4] });
  group.add(mesh(b));

  // The cap: a metal bowl with a band, bolts and a spring on top.
  const cap = new THREE.Group();
  const cb = new Builder();
  const r = Math.max(0.16, s.half * 0.8);
  cb.add(G.dome(16), '#9aa3ad', { pos: [0, 0.02, 0], scale: [r, r * 0.7, r] });
  cb.add(G.cyl(18), '#6f7782', { pos: [0, 0.03, 0], scale: [r * 1.04, 0.05, r * 1.04] });
  for (let k = 0; k < 6; k++) {
    const a = (k / 6) * Math.PI * 2;
    cb.add(G.sphere(6, 4), BRASS, { pos: [Math.cos(a) * r * 1.05, 0.03, Math.sin(a) * r * 1.05], scale: 0.02 });
  }
  for (let k = 0; k < 4; k++) cb.add(G.torus(0.25, 5, 12), BRASS, { pos: [0, r * 0.7 + 0.03 + k * 0.035, 0], rot: [Math.PI / 2, 0, 0], scale: 0.035 });
  cap.add(mesh(cb));
  group.add(cap);
  // The wire from the hanger down to the cap, stretched each frame.
  const wire = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 1, 6).translate(0, -0.5, 0), new THREE.MeshLambertMaterial({ color: '#2a2830' }));
  wire.position.set(0, hang, 0.03);
  group.add(wire);

  // The switch box on a post beside the chair, with its lever, a lightning sign, and a bulb on top.
  const box = new THREE.Vector3(w / 2 + 0.55, 0, 0.25);
  const sb = new Builder();
  sb.add(G.box(), WOOD, { pos: [box.x, 0.45, box.z], scale: [0.1, 0.9, 0.1] });
  sb.add(G.rbox(0.1), '#4a4f58', { pos: [box.x, 1.1, box.z], scale: [0.36, 0.46, 0.18] });
  sb.add(G.box(), '#f2c14e', { pos: [box.x, 1.18, box.z + 0.095], scale: [0.2, 0.16, 0.01] });
  // A zigzag on the sign.
  sb.add(G.box(), '#2a2830', { pos: [box.x - 0.02, 1.2, box.z + 0.102], rot: [0, 0, 0.7], scale: [0.025, 0.09, 0.005] });
  sb.add(G.box(), '#2a2830', { pos: [box.x + 0.02, 1.16, box.z + 0.102], rot: [0, 0, 0.7], scale: [0.025, 0.09, 0.005] });
  sb.add(G.box(), '#2a2830', { pos: [box.x, 1.18, box.z + 0.102], rot: [0, 0, -0.6], scale: [0.02, 0.06, 0.005] });
  sb.add(G.cyl(10), BRASS, { pos: [box.x, 1.38, box.z], scale: [0.05, 0.08, 0.05] });
  // The hinge the lever turns on.
  sb.add(G.cyl(10), IRON, { pos: [box.x + 0.2, 1.02, box.z], rot: [0, 0, Math.PI / 2], scale: [0.04, 0.06, 0.04] });
  group.add(mesh(sb));
  const bulb = new THREE.MeshStandardMaterial({ color: '#fff3c0', emissive: '#ffd86a', emissiveIntensity: 0.2, transparent: true, opacity: 0.9, roughness: 0.3 });
  const glass = new THREE.Mesh(new THREE.SphereGeometry(0.07, 12, 10), bulb);
  glass.position.set(box.x, 1.48, box.z);
  group.add(glass);
  const lever = new THREE.Group();
  lever.position.set(box.x + 0.23, 1.02, box.z);
  const lb = new Builder();
  lb.add(G.box(), '#9aa3ad', { pos: [0, 0.16, 0], scale: [0.03, 0.32, 0.05] });
  lb.add(G.sphere(10, 8), '#d8402f', { pos: [0, 0.34, 0], scale: [0.05, 0.05, 0.05] });
  lever.add(mesh(lb));
  group.add(lever);
  // The cable from the box to the hanger, in a lazy loop along the floor.
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(box.x, 0.95, box.z - 0.1),
    new THREE.Vector3(box.x - 0.1, 0.08, box.z - 0.35),
    new THREE.Vector3(0.1, 0.06, -0.55),
    new THREE.Vector3(0.05, hang - 0.1, -0.36),
  ]);
  const cable = new THREE.Mesh(new THREE.TubeGeometry(curve, 24, 0.022, 6), new THREE.MeshLambertMaterial({ color: '#2a2830' }));
  group.add(cable);
  return {
    group,
    cap,
    lever,
    bulb,
    socket: new THREE.Vector3(box.x, 0.95, box.z - 0.1),
    box,
    wire,
    dispose: () => {
      bulb.dispose();
      glass.geometry.dispose();
      wire.geometry.dispose();
      (wire.material as THREE.Material).dispose();
      cable.geometry.dispose();
      (cable.material as THREE.Material).dispose();
    },
  };
}

// ---------------------------------------------------------------- the missile

export interface Launcher {
  group: THREE.Group;
  /** The rocket, nose along +z, its origin at its middle. */
  rocket: THREE.Group;
  /** Where the rocket sits on the rail (in the launcher's frame), and which way the rail points. */
  rest: THREE.Vector3;
  aim: THREE.Vector3;
  /** The lit end of the fuse. */
  spark: THREE.Mesh;
  /** A little flag that pops out of a dud. */
  dud: THREE.Group;
  dispose(): void;
}

/** A wooden cart with a tilted rail and a big red cartoon rocket on it, fins and all. */
export function launcher(): Launcher {
  const group = new THREE.Group();
  const b = new Builder();
  b.add(G.rbox(0.1), PLANK, { pos: [0, 0.36, 0], scale: [0.7, 0.24, 1.1] });
  b.add(G.box(), WOOD, { pos: [0, 0.5, 0], scale: [0.74, 0.05, 1.14] });
  for (const sx of [-1, 1])
    for (const z of [-0.35, 0.35]) {
      b.add(G.cyl(14), WOOD, { pos: [sx * 0.39, 0.22, z], rot: [0, 0, Math.PI / 2], scale: [0.22, 0.07, 0.22] });
      b.add(G.cyl(10), BRASS, { pos: [sx * 0.43, 0.22, z], rot: [0, 0, Math.PI / 2], scale: [0.06, 0.03, 0.06] });
    }
  // The rail: two beams up at a steep angle, on a trestle.
  const pitch = 0.95;
  const railLen = 1.5;
  const mid = new THREE.Vector3(0, 0.55 + Math.sin(pitch) * railLen * 0.5, -0.25 + Math.cos(pitch) * railLen * 0.5);
  for (const sx of [-1, 1]) b.add(G.box(), WOOD, { pos: [sx * 0.12, mid.y, mid.z], rot: [-pitch, 0, 0], scale: [0.06, 0.06, railLen] });
  b.add(G.box(), WOOD, { pos: [0, 0.55 + 0.45, 0.3], scale: [0.34, 0.9, 0.08] });
  // A little sign on its side.
  b.add(G.box(), '#f2c14e', { pos: [0.355, 0.38, 0], scale: [0.01, 0.14, 0.5] });
  for (let k = 0; k < 4; k++) b.add(G.box(), '#2a2830', { pos: [0.362, 0.38, -0.2 + k * 0.13], rot: [0.7, 0, 0], scale: [0.006, 0.18, 0.04] });
  group.add(mesh(b));

  const rocket = new THREE.Group();
  const r = new Builder();
  r.add(G.cyl(16), '#d8402f', { rot: [Math.PI / 2, 0, 0], scale: [0.15, 0.9, 0.15] });
  for (const z of [-0.2, 0.18]) r.add(G.cyl(16), '#f4efe6', { pos: [0, 0, z], rot: [Math.PI / 2, 0, 0], scale: [0.153, 0.08, 0.153] });
  r.add(G.cone(16), '#f4efe6', { pos: [0, 0, 0.62], rot: [Math.PI / 2, 0, 0], scale: [0.15, 0.36, 0.15] });
  r.add(G.sphere(8, 6), '#d8402f', { pos: [0, 0, 0.8], scale: 0.035 });
  for (let k = 0; k < 4; k++) {
    const a = (k / 4) * Math.PI * 2 + Math.PI / 4;
    r.add(G.box(), '#f2c14e', { pos: [Math.cos(a) * 0.2, Math.sin(a) * 0.2, -0.36], rot: [0, 0, a], scale: [0.16, 0.02, 0.26] });
  }
  r.add(G.taper(0.7, 12), '#4a4f58', { pos: [0, 0, -0.5], rot: [-Math.PI / 2, 0, 0], scale: [0.11, 0.12, 0.11] });
  // A friendly face painted on the nose.
  for (const s of [-1, 1]) r.add(G.sphere(8, 6), '#1e1c22', { pos: [s * 0.05, 0.08, 0.46], scale: [0.022, 0.03, 0.015] });
  rocket.add(mesh(r));
  // The fuse curls out of the back, lit at the end.
  const fuse = new Builder();
  fuse.add(G.cyl(6), '#2a2830', { pos: [0, -0.06, -0.63], rot: [0.9, 0, 0], scale: [0.012, 0.2, 0.012] });
  rocket.add(mesh(fuse));
  const spark = new THREE.Mesh(new THREE.IcosahedronGeometry(0.035, 0), new THREE.MeshBasicMaterial({ color: '#ffd84a' }));
  spark.position.set(0, -0.14, -0.7);
  spark.visible = false;
  rocket.add(spark);
  const dud = new THREE.Group();
  const stick = new Builder();
  stick.add(G.cyl(6), '#e8e2d4', { pos: [0, 0.15, 0], scale: [0.01, 0.3, 0.01] });
  dud.add(mesh(stick));
  const text = new TextSign({ w: 256, h: 128, bg: '#fffaf0', fg: '#3a3630', border: '#3a3630', size: 84, weight: 800 }, 'DUD');
  const board = signBoard(text, 0.3, 0.15, { lit: true });
  board.mesh.position.set(0.15, 0.24, 0);
  dud.add(board.mesh);
  dud.scale.setScalar(0.001);
  rocket.add(dud);
  const aim = new THREE.Vector3(0, Math.sin(pitch), Math.cos(pitch));
  const rest = mid.clone().add(new THREE.Vector3(0, 0.2, 0));
  rocket.position.copy(rest);
  rocket.lookAt(rest.clone().add(aim));
  group.add(rocket);
  return {
    group,
    rocket,
    rest,
    aim,
    spark,
    dud,
    dispose: () => {
      spark.geometry.dispose();
      (spark.material as THREE.Material).dispose();
      text.dispose();
      board.material.dispose();
    },
  };
}

// ---------------------------------------------------------------- the spit roast

export interface Roast {
  group: THREE.Group;
  /** Turns with the spit (about x). */
  spit: THREE.Group;
  dispose(): void;
}

/** A ring of stones with crossed logs, and a long spit across two forked posts with a crank on the end. */
export function roast(spitY: number, len: number): Roast {
  const group = new THREE.Group();
  const b = new Builder();
  b.add(G.cyl(18), '#3a3330', { pos: [0, 0.02, 0], scale: [0.62, 0.04, 0.5] });
  for (let k = 0; k < 11; k++) {
    const a = (k / 11) * Math.PI * 2;
    b.add(G.dodeca(), k % 2 ? '#8f8a84' : '#a39d94', { pos: [Math.cos(a) * 0.66, 0.08, Math.sin(a) * 0.55], rot: [k, k * 2, 0], scale: [0.13, 0.1, 0.12] });
  }
  for (let k = 0; k < 4; k++) {
    const a = (k / 4) * Math.PI;
    b.add(G.cyl(8), k % 2 ? '#6a4630' : '#5a3a26', { pos: [0, 0.1 + k * 0.03, 0], rot: [0, a, Math.PI / 2 - 0.25], scale: [0.06, 0.95, 0.06] });
  }
  b.add(G.sphere(10, 8), '#ff9a3a', { pos: [0, 0.08, 0], scale: [0.3, 0.06, 0.24] });
  const post = len / 2 + 0.25;
  for (const sx of [-1, 1]) {
    b.add(G.cyl(8), '#6a4630', { pos: [sx * post, spitY / 2, 0], scale: [0.045, spitY, 0.045] });
    for (const s of [-1, 1]) b.add(G.cyl(8), '#6a4630', { pos: [sx * post, spitY + 0.08, s * 0.06], rot: [s * 0.6, 0, 0], scale: [0.035, 0.2, 0.035] });
  }
  group.add(mesh(b));
  const spit = new THREE.Group();
  spit.position.set(0, spitY, 0);
  const sp = new Builder();
  sp.add(G.cyl(8), '#55525c', { rot: [0, 0, Math.PI / 2], scale: [0.022, len + 0.9, 0.022] });
  // The crank on one end.
  const end = len / 2 + 0.45;
  sp.add(G.cyl(8), '#55525c', { pos: [end, -0.1, 0], scale: [0.02, 0.2, 0.02] });
  sp.add(G.cyl(8), PALE, { pos: [end + 0.06, -0.2, 0], rot: [0, 0, Math.PI / 2], scale: [0.03, 0.12, 0.03] });
  // Rope ties near each end of whoever is on it.
  for (const sx of [-1, 1]) sp.add(G.torus(0.25, 6, 14), ROPE, { pos: [sx * (len / 2 - 0.05), 0, 0], rot: [0, Math.PI / 2, 0], scale: 0.09 });
  spit.add(mesh(sp));
  group.add(spit);
  return { group, spit, dispose: () => {} };
}

/** A little grey rain cloud, and its rain. */
export interface Cloud {
  group: THREE.Group;
  drops: THREE.InstancedMesh;
  dispose(): void;
}

export function rainCloud(): Cloud {
  const group = new THREE.Group();
  const b = new Builder();
  for (let k = 0; k < 7; k++) {
    const x = (k - 3) * 0.17;
    const s = 0.2 + (k % 3) * 0.05 - Math.abs(k - 3) * 0.02;
    b.add(G.blob(k), k % 2 ? '#8e96a4' : '#a2aab6', { pos: [x, (k % 2) * 0.06, ((k * 7) % 3) * 0.05 - 0.05], scale: [s, s * 0.8, s] });
  }
  b.add(G.sphere(12, 6), '#737b88', { pos: [0, -0.08, 0], scale: [0.55, 0.08, 0.22] });
  const m = new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true });
  group.add(b.mesh(m, { cast: false, receive: false }));
  const dropMat = new THREE.MeshBasicMaterial({ color: '#8ac8f0' });
  const drops = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.008, 0.008, 0.12, 4), dropMat, 24);
  drops.frustumCulled = false;
  group.add(drops);
  return {
    group,
    drops,
    dispose: () => {
      m.dispose();
      dropMat.dispose();
      drops.geometry.dispose();
    },
  };
}

// ---------------------------------------------------------------- the kaiju

export interface Kaiju {
  group: THREE.Group;
  /** Bends at the waist (forward to roar or blast). */
  body: THREE.Group;
  head: THREE.Group;
  jaw: THREE.Group;
  tail: THREE.Group[];
  arms: THREE.Group[];
  /** The glowing plates along its back, in order from the tail to the head. */
  plates: THREE.MeshLambertMaterial[];
  /** Inside the mouth, where the breath comes from. */
  mouth: THREE.Object3D;
  mouthGlow: THREE.MeshBasicMaterial;
  dispose(): void;
}

/**
 * Our own big monster: a chunky slate-green lizard about eight metres tall, with a pale belly, stubby arms, a long
 * tail, amber eyes under a heavy brow, and rows of crystal plates down its back that glow blue when it breathes.
 */
export function kaiju(): Kaiju {
  const SKIN = '#4d6f5a';
  const DARK = '#3b5848';
  const BELLY = '#b7c596';
  const CLAW = '#efe6d2';
  const group = new THREE.Group();
  const owned: THREE.Material[] = [];
  const own = <M extends THREE.Material>(m: M) => (owned.push(m), m);
  const skin = own(matte());

  // Legs stay planted; the body above the hips leans.
  const legs = new Builder();
  for (const sx of [-1, 1]) {
    legs.add(G.sphere(16, 12), SKIN, { pos: [sx * 1.0, 1.55, -0.2], scale: [0.85, 1.1, 1.0] });
    legs.add(G.taper(0.85, 14), SKIN, { pos: [sx * 1.05, 0.55, 0.05], scale: [0.62, 1.1, 0.68] });
    legs.add(G.sphere(14, 10), DARK, { pos: [sx * 1.05, 0.2, 0.35], scale: [0.62, 0.3, 0.85] });
    for (let k = -1; k <= 1; k++) legs.add(G.cone(8), CLAW, { pos: [sx * 1.05 + k * 0.28, 0.14, 1.12], rot: [Math.PI / 2, 0, 0], scale: [0.09, 0.26, 0.09] });
  }
  group.add(legs.mesh(skin));

  const body = new THREE.Group();
  body.position.set(0, 2.0, -0.2);
  group.add(body);
  const t = new Builder();
  t.add(G.sphere(18, 14), SKIN, { pos: [0, 1.2, 0], scale: [1.55, 2.1, 1.35] });
  t.add(G.sphere(16, 12), BELLY, { pos: [0, 1.0, 0.55], scale: [1.15, 1.75, 0.9] });
  // Belly bands.
  for (let k = 0; k < 6; k++) t.add(G.box(), '#a3b282', { pos: [0, 0.1 + k * 0.38, 1.38 - Math.abs(k - 2.5) * 0.1], scale: [1.4 - Math.abs(k - 2.5) * 0.18, 0.05, 0.1] });
  t.add(G.sphere(16, 12), SKIN, { pos: [0, 2.9, 0.35], scale: [0.95, 1.05, 0.95] });
  // Bumps of darker scales across the back and shoulders.
  for (let k = 0; k < 14; k++) {
    const a = (k / 14) * Math.PI * 2;
    t.add(G.sphere(8, 6), DARK, { pos: [Math.cos(a) * 1.3, 1.4 + Math.sin(k * 1.7) * 0.8, -0.55 + Math.sin(a) * 0.4], scale: 0.18 + (k % 3) * 0.04 });
  }
  body.add(t.mesh(skin));

  // Stubby arms with three claws, bent forward.
  const arms: THREE.Group[] = [];
  for (const sx of [-1, 1]) {
    const arm = new THREE.Group();
    arm.position.set(sx * 1.25, 2.3, 0.55);
    const a = new Builder();
    a.add(G.sphere(12, 10), SKIN, { pos: [0, -0.3, 0.15], rot: [0.6, 0, 0], scale: [0.32, 0.55, 0.32] });
    a.add(G.sphere(12, 10), SKIN, { pos: [0, -0.6, 0.6], rot: [1.3, 0, 0], scale: [0.26, 0.45, 0.26] });
    for (let k = -1; k <= 1; k++) a.add(G.cone(8), CLAW, { pos: [k * 0.12, -0.72, 1.0], rot: [Math.PI / 2 + 0.3, 0, 0], scale: [0.05, 0.2, 0.05] });
    arm.add(a.mesh(skin));
    body.add(arm);
    arms.push(arm);
  }

  // The tail: tapering segments sweeping back and down to the ground, each turning a little on the last.
  const tail: THREE.Group[] = [];
  let parent: THREE.Object3D = group;
  const segs = 7;
  for (let k = 0; k < segs; k++) {
    const seg = new THREE.Group();
    const r = 0.95 * (1 - k / (segs + 1));
    if (k === 0) seg.position.set(0, 1.9, -1.2);
    else seg.position.set(0, -0.12, -0.95 * (1 - (k - 1) / (segs + 2)) - 0.2);
    seg.rotation.x = k === 0 ? 0.35 : 0.06;
    const sb = new Builder();
    sb.add(G.sphere(14, 10), SKIN, { pos: [0, 0, -0.5 * r], scale: [r, r * 0.9, r * 1.4] });
    sb.add(G.sphere(8, 6), DARK, { pos: [0, r * 0.75, -0.4 * r], scale: [r * 0.3, r * 0.2, r * 0.6] });
    seg.add(sb.mesh(skin));
    parent.add(seg);
    parent = seg;
    tail.push(seg);
  }

  // The plates: rows of jagged crystal down the back from the neck to the tail, each glowing on its own.
  const plates: THREE.MeshLambertMaterial[] = [];
  const plateGeo = (() => {
    // A flat, jagged leaf of crystal: a fan of points, thick enough to read from the side.
    const s = new THREE.Shape();
    const pts = [
      [-0.5, 0],
      [-0.42, 0.45],
      [-0.25, 0.4],
      [-0.12, 0.9],
      [0.02, 0.62],
      [0.18, 1.0],
      [0.3, 0.55],
      [0.48, 0.6],
      [0.5, 0],
    ];
    pts.forEach(([x, y], i) => (i ? s.lineTo(x, y) : s.moveTo(x, y)));
    const g = new THREE.ExtrudeGeometry(s, { depth: 0.14, bevelEnabled: true, bevelSize: 0.04, bevelThickness: 0.04, bevelSegments: 1 });
    g.translate(0, 0, -0.07);
    g.rotateY(Math.PI / 2);
    return g;
  })();
  const placeRow = (holder: THREE.Object3D, spots: [number, number, number, number][], tilt = 0) => {
    for (const [x, y, z, size] of spots) {
      const m = own(new THREE.MeshLambertMaterial({ color: '#cfe4dc', emissive: '#58d8ff', emissiveIntensity: 0, flatShading: true }));
      plates.unshift(m);
      for (const sx of x ? [-1, 1] : [0]) {
        const p = new THREE.Mesh(plateGeo, m);
        p.position.set(sx * x, y, z);
        p.rotation.set(tilt, 0, -sx * 0.18);
        p.scale.setScalar(size);
        holder.add(p);
      }
    }
  };
  // Neck down to the hips, along the body.
  placeRow(
    body,
    [
      [0, 3.75, -0.25, 0.6],
      [0.32, 3.3, -0.6, 0.75],
      [0, 2.85, -0.95, 1.0],
      [0.38, 2.3, -1.15, 1.05],
      [0, 1.75, -1.3, 1.1],
      [0.36, 1.15, -1.32, 0.95],
    ].reverse() as [number, number, number, number][],
    -0.35,
  );
  // And on along the tail, smaller and smaller.
  tail.slice(0, 5).forEach((seg, k) => {
    const r = 0.95 * (1 - k / (segs + 1));
    placeRow(seg, [[0, r * 0.75, -0.5 * r, 0.75 - k * 0.12]], -0.2);
  });

  // The head, on the neck, with a jaw that drops open.
  const head = new THREE.Group();
  head.position.set(0, 3.55, 0.75);
  body.add(head);
  const h = new Builder();
  h.add(G.sphere(16, 12), SKIN, { pos: [0, 0.35, 0.2], scale: [0.85, 0.72, 0.95] });
  h.add(G.sphere(16, 12), SKIN, { pos: [0, 0.25, 0.85], scale: [0.62, 0.45, 0.7] });
  // A heavy brow, nostrils, and teeth along the top jaw.
  for (const sx of [-1, 1]) {
    h.add(G.box(), DARK, { pos: [sx * 0.36, 0.72, 0.62], rot: [0.2, sx * 0.3, sx * -0.35], scale: [0.42, 0.12, 0.22] });
    h.add(G.sphere(12, 10), '#ffcf3a', { pos: [sx * 0.42, 0.55, 0.72], scale: [0.15, 0.13, 0.1] });
    h.add(G.box(), '#1e1c22', { pos: [sx * 0.44, 0.55, 0.81], scale: [0.035, 0.18, 0.02] });
    h.add(G.sphere(8, 6), '#2a3a30', { pos: [sx * 0.18, 0.5, 1.5], scale: [0.06, 0.04, 0.04] });
    for (let k = 0; k < 5; k++) h.add(G.cone(6), CLAW, { pos: [sx * (0.18 + k * 0.08), -0.08, 1.38 - k * 0.2], rot: [Math.PI, 0, 0], scale: [0.05, 0.14, 0.05] });
  }
  h.add(G.cone(6), CLAW, { pos: [0, -0.08, 1.45], rot: [Math.PI, 0, 0], scale: [0.05, 0.14, 0.05] });
  // The dark of the mouth's roof.
  h.add(G.sphere(12, 8), '#5a2a32', { pos: [0, 0.0, 0.95], scale: [0.48, 0.1, 0.55] });
  head.add(h.mesh(skin));
  const jaw = new THREE.Group();
  jaw.position.set(0, 0.0, 0.25);
  head.add(jaw);
  const j = new Builder();
  j.add(G.sphere(14, 10), SKIN, { pos: [0, -0.18, 0.62], scale: [0.55, 0.22, 0.78] });
  j.add(G.sphere(12, 8), '#7a3a42', { pos: [0, -0.06, 0.66], scale: [0.42, 0.08, 0.62] });
  for (const sx of [-1, 1]) for (let k = 0; k < 4; k++) j.add(G.cone(6), CLAW, { pos: [sx * (0.16 + k * 0.08), 0.0, 1.1 - k * 0.2], scale: [0.045, 0.12, 0.045] });
  jaw.add(j.mesh(skin));
  const mouth = new THREE.Object3D();
  mouth.position.set(0, 0.05, 1.35);
  head.add(mouth);
  const mouthGlow = own(new THREE.MeshBasicMaterial({ color: '#9ff0ff', transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending }));
  const glowBall = new THREE.Mesh(new THREE.SphereGeometry(0.42, 14, 10), mouthGlow);
  glowBall.position.set(0, 0.0, 1.0);
  head.add(glowBall);
  group.traverse((o) => {
    if ((o as THREE.Mesh).isMesh) o.castShadow = true;
  });
  return {
    group,
    body,
    head,
    jaw,
    tail,
    arms,
    plates,
    mouth,
    mouthGlow,
    dispose: () => {
      for (const m of owned) m.dispose();
      plateGeo.dispose();
      glowBall.geometry.dispose();
    },
  };
}

// ---------------------------------------------------------------- the plane crash

export interface Propeller {
  group: THREE.Group;
  /** The blades (they turn about z), and a blur of them for when it's going fast. */
  blades: THREE.Group;
  blur: THREE.MeshBasicMaterial;
}

/** A two-bladed wooden propeller on a brass hub, facing +z, with a faint disc for its blur. */
export function propeller(): Propeller {
  const group = new THREE.Group();
  const blades = new THREE.Group();
  const b = new Builder();
  for (const s of [-1, 1]) {
    b.add(G.rbox(0.4), PALE, { pos: [0, s * 0.19, 0], rot: [0, s * 0.35, 0], scale: [0.1, 0.36, 0.035] });
    b.add(G.sphere(10, 6), '#d8402f', { pos: [0, s * 0.36, 0], rot: [0, s * 0.35, 0], scale: [0.05, 0.03, 0.02] });
  }
  b.add(G.sphere(12, 8), BRASS, { pos: [0, 0, 0.03], scale: [0.07, 0.07, 0.09] });
  blades.add(mesh(b));
  group.add(blades);
  const blur = new THREE.MeshBasicMaterial({ color: '#f4efe6', transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide });
  const disc = new THREE.Mesh(new THREE.CircleGeometry(0.4, 24), blur);
  disc.position.z = 0.01;
  group.add(disc);
  return { group, blades, blur };
}

export interface Plane {
  group: THREE.Group;
  prop: Propeller;
  /** Where the pilot sits (their feet, sitting), and where the smoke comes out. */
  seat: THREE.Vector3;
  exhaust: THREE.Object3D;
  /** From the plane's middle down to the bottom of its wheels. */
  wheels: number;
  /** The scarf's pieces, each hung on the last, flapping in the wind. */
  scarf: THREE.Group[];
  dispose(): void;
}

/**
 * A little cartoon biplane, a metre and a half long: a red body tapering to the tail, cream wings above and below
 * held apart by struts, a round black engine with a wooden propeller, fat wheels, and an open cockpit (the pilot's
 * long scarf streams out behind). Its origin is the middle of the body at the cockpit, nose along +z.
 */
export function biplane(): Plane {
  const RED = '#d8402f';
  const CREAM = '#f4e6c4';
  const group = new THREE.Group();
  const b = new Builder();
  // The body, a tapering tail, and a yellow stripe round it.
  b.add(G.sphere(18, 12), RED, { pos: [0, 0, 0.05], scale: [0.3, 0.3, 0.75] });
  b.add(G.taper(0.25, 16), RED, { pos: [0, 0.03, -0.62], rot: [-Math.PI / 2, 0, 0], scale: [0.25, 0.75, 0.22] });
  b.add(G.cyl(18), '#f2c14e', { pos: [0, 0, -0.42], rot: [Math.PI / 2, 0, 0], scale: [0.262, 0.07, 0.25] });
  // The cockpit's padded rim and a little windscreen.
  b.add(G.torus(0.22, 6, 18), LEATHER, { pos: [0, 0.24, -0.16], rot: [Math.PI / 2, 0, 0], scale: [0.21, 0.24, 0.2] });
  b.add(G.box(), '#bfe0f0', { pos: [0, 0.34, 0.14], rot: [-0.45, 0, 0], scale: [0.22, 0.12, 0.012] });
  // The engine: a black drum with a brass ring, and a pipe out of the side.
  b.add(G.cyl(18), '#2f2d36', { pos: [0, 0, 0.66], rot: [Math.PI / 2, 0, 0], scale: [0.27, 0.22, 0.27] });
  b.add(G.torus(0.12, 6, 20), BRASS, { pos: [0, 0, 0.77], scale: 0.24 });
  b.add(G.cyl(8), IRON, { pos: [0.26, -0.08, 0.45], rot: [Math.PI / 2, 0, 0], scale: [0.04, 0.32, 0.04] });
  // The wings: two long cream boards with red tips, held apart by struts, with wires crossed between.
  // (The top one sits well forward, over the engine, so the pilot's face shows over it from above.)
  for (const [y, z] of [
    [-0.2, 0.25],
    [0.55, 0.62],
  ]) {
    b.add(G.rbox(0.3), CREAM, { pos: [0, y, z], scale: [1.95, 0.05, 0.4] });
    for (const sx of [-1, 1]) b.add(G.rbox(0.3), RED, { pos: [sx * 0.9, y, z], scale: [0.18, 0.055, 0.405] });
  }
  for (const sx of [-1, 1]) {
    for (const dz of [-0.12, 0.12]) b.add(G.cyl(6), WOOD, { pos: [sx * 0.68, 0.175, 0.435 + dz], rot: [0.44, 0, 0], scale: [0.018, 0.83, 0.018] });
    for (const s of [-1, 1]) b.add(G.cyl(4), IRON, { pos: [sx * 0.42, 0.175, 0.435], rot: [0.44, 0, s * 0.9], scale: [0.006, 0.98, 0.006] });
    // Struts from the body up to the top wing.
    b.add(G.cyl(6), WOOD, { pos: [sx * 0.13, 0.42, 0.6], rot: [0, 0, sx * -0.35], scale: [0.016, 0.3, 0.016] });
  }
  // The tail: a fin and a tailplane.
  b.add(G.rbox(0.3), CREAM, { pos: [0, 0.2, -0.98], rot: [0.2, 0, 0], scale: [0.04, 0.34, 0.28] });
  b.add(G.rbox(0.3), RED, { pos: [0, 0.32, -1.02], rot: [0.2, 0, 0], scale: [0.045, 0.1, 0.2] });
  b.add(G.rbox(0.3), CREAM, { pos: [0, 0.04, -1.0], scale: [0.72, 0.035, 0.24] });
  // The wheels on their legs, and a skid under the tail.
  for (const sx of [-1, 1]) {
    b.add(G.cyl(6), IRON, { pos: [sx * 0.16, -0.36, 0.38], rot: [0, 0, sx * 0.4], scale: [0.02, 0.36, 0.02] });
    b.add(G.cyl(16), '#24222a', { pos: [sx * 0.3, -0.48, 0.38], rot: [0, 0, Math.PI / 2], scale: [0.13, 0.07, 0.13] });
    b.add(G.cyl(12), CREAM, { pos: [sx * 0.34, -0.48, 0.38], rot: [0, 0, Math.PI / 2], scale: [0.06, 0.012, 0.06] });
  }
  b.add(G.cyl(8), IRON, { pos: [0, -0.48, 0.38], rot: [0, 0, Math.PI / 2], scale: [0.015, 0.6, 0.015] });
  b.add(G.cyl(6), IRON, { pos: [0, -0.2, -1.02], rot: [-0.5, 0, 0], scale: [0.018, 0.4, 0.018] });
  group.add(mesh(b));
  const prop = propeller();
  prop.group.position.set(0, 0, 0.82);
  group.add(prop.group);
  const exhaust = new THREE.Object3D();
  exhaust.position.set(0.26, -0.08, 0.28);
  group.add(exhaust);
  // The pilot's scarf: red and white bands, each piece hung from the one before.
  const scarf: THREE.Group[] = [];
  let parent: THREE.Object3D = group;
  for (let k = 0; k < 6; k++) {
    const seg = new THREE.Group();
    seg.position.set(0, 0, k ? -0.13 : -0.36);
    if (!k) seg.position.y = 0.3;
    const sb = new Builder();
    sb.add(G.box(), k % 2 ? '#f4efe6' : RED, { pos: [0, 0, -0.065], scale: [0.09, 0.012, 0.135] });
    seg.add(mesh(sb));
    parent.add(seg);
    parent = seg;
    scarf.push(seg);
  }
  return { group, prop, seat: new THREE.Vector3(0, -0.06, -0.16), exhaust, wheels: 0.61, scarf, dispose: () => {} };
}

/** A round haystack, with a few loose wisps of straw about it. Its top is about 0.8 up. */
export function haystack(): THREE.Group {
  const group = new THREE.Group();
  const b = new Builder();
  b.add(G.blob(2, true), '#e3c25a', { pos: [0, 0.32, 0], scale: [0.85, 0.5, 0.75] });
  b.add(G.blob(4, true), '#d9b24a', { pos: [0.05, 0.62, -0.04], scale: [0.6, 0.28, 0.55] });
  for (let k = 0; k < 16; k++) {
    const a = (k / 16) * Math.PI * 2;
    const r = 0.55 + (k % 3) * 0.12;
    b.add(G.box(), k % 2 ? '#c9a040' : '#f0d070', { pos: [Math.cos(a) * r, 0.25 + (k % 4) * 0.12, Math.sin(a) * r * 0.9], rot: [k, a, 0.9], scale: [0.012, 0.22, 0.012] });
  }
  for (let k = 0; k < 6; k++) b.add(G.box(), '#e3c25a', { pos: [Math.cos(k * 1.9) * 1.0, 0.01, Math.sin(k * 1.9) * 0.9], rot: [0, k, 0], scale: [0.2, 0.012, 0.015] });
  group.add(mesh(b));
  return group;
}

/** A crater in the grass: a scorched ring, a dark hole and lumps of earth thrown up round its rim. */
export function crater(): THREE.Group {
  const group = new THREE.Group();
  const scorch = new THREE.Mesh(new THREE.CircleGeometry(1.7, 28), new THREE.MeshBasicMaterial({ color: '#2e2a26', transparent: true, opacity: 0.6, depthWrite: false }));
  scorch.rotation.x = -Math.PI / 2;
  scorch.position.y = 0.04;
  scorch.renderOrder = 1;
  const hole = new THREE.Mesh(new THREE.CircleGeometry(0.85, 24), new THREE.MeshBasicMaterial({ color: '#16120f' }));
  hole.rotation.x = -Math.PI / 2;
  hole.position.y = 0.06;
  group.add(scorch, hole);
  const b = new Builder();
  for (let k = 0; k < 14; k++) {
    const a = (k / 14) * Math.PI * 2 + (k % 2) * 0.2;
    const r = 0.95 + (k % 3) * 0.08;
    b.add(G.dodeca(), k % 2 ? '#6a4a30' : '#7d5a3a', { pos: [Math.cos(a) * r, 0.06, Math.sin(a) * r], rot: [k, k * 2, 0], scale: [0.2 + (k % 3) * 0.04, 0.14 + (k % 2) * 0.05, 0.18] });
  }
  for (let k = 0; k < 7; k++) {
    const a = k * 0.9 + 0.3;
    b.add(G.dodeca(), '#5a3e28', { pos: [Math.cos(a) * 1.5, 0.03, Math.sin(a) * 1.45], rot: [k, k, 0], scale: [0.09, 0.06, 0.08] });
  }
  group.add(mesh(b));
  return group;
}

// ---------------------------------------------------------------- the giant pigeon

// The messenger pigeon's colours (see pigeon.ts).
const DOVE = '#8a93a8';
const DOVE_LIGHT = '#a7afc0';
const DOVE_DARK = '#5d6578';

export interface GiantPigeon {
  group: THREE.Group;
  head: THREE.Group;
  /** Wings on pivots at the shoulders: turning them about z flaps them (left one positive for down). */
  wings: THREE.Group[];
  /** The legs swing about x (back to tuck them up, forward to reach); the toes curl about x to grip. */
  legs: THREE.Group[];
  toes: THREE.Group[];
  /** Between the feet, where whatever it carries hangs from. */
  talons: THREE.Object3D;
  dispose(): void;
}

/**
 * The messenger pigeon's enormous cousin: the same grey with a shimmering green and purple neck, orange eyes and
 * a pale beak, but a body as big as a cart, wings five metres across, and great pink feet for carrying things off.
 * Its origin is the middle of its body, facing +z.
 */
export function giantPigeon(): GiantPigeon {
  const group = new THREE.Group();
  const material = matte();
  const b = new Builder();
  b.add(G.sphere(18, 14), DOVE, { scale: [0.55, 0.5, 0.8] });
  b.add(G.sphere(16, 12), DOVE_LIGHT, { pos: [0, -0.08, 0.24], scale: [0.47, 0.42, 0.6] });
  b.add(G.sphere(16, 12), '#5aa88a', { pos: [0, 0.32, 0.5], scale: [0.38, 0.33, 0.34] });
  b.add(G.sphere(16, 12), '#8a5aa8', { pos: [0, 0.22, 0.57], scale: [0.4, 0.24, 0.3] });
  // The tail, banded dark at its end.
  b.add(G.rbox(0.2), DOVE, { pos: [0, 0.02, -0.9], rot: [0.22, 0, 0], scale: [0.5, 0.08, 0.6] });
  b.add(G.rbox(0.2), DOVE_DARK, { pos: [0, -0.04, -1.18], rot: [0.22, 0, 0], scale: [0.52, 0.085, 0.16] });
  group.add(new THREE.Mesh(b.geometry(), material));
  const head = new THREE.Group();
  head.position.set(0, 0.62, 0.62);
  const h = new Builder();
  h.add(G.sphere(16, 12), DOVE, { scale: [0.32, 0.32, 0.36] });
  h.add(G.cone(10), '#e8c27a', { pos: [0, -0.04, 0.44], rot: [Math.PI / 2, 0, 0], scale: [0.085, 0.26, 0.07] });
  h.add(G.sphere(10, 8), '#f4efe6', { pos: [0, 0.03, 0.33], scale: [0.07, 0.05, 0.07] });
  for (const sx of [-1, 1]) {
    h.add(G.sphere(12, 10), '#ff8a3a', { pos: [sx * 0.2, 0.08, 0.2], scale: [0.09, 0.09, 0.07] });
    h.add(G.sphere(10, 8), '#1d1612', { pos: [sx * 0.235, 0.09, 0.235], scale: [0.045, 0.05, 0.035] });
    h.add(G.sphere(6, 4), '#ffffff', { pos: [sx * 0.24, 0.115, 0.26], scale: 0.014 });
  }
  head.add(new THREE.Mesh(h.geometry(), material));
  group.add(head);
  const wings: THREE.Group[] = [];
  for (const sx of [-1, 1]) {
    const pivot = new THREE.Group();
    pivot.position.set(sx * 0.42, 0.18, 0.1);
    const w = new Builder();
    w.add(G.sphere(14, 8), DOVE, { pos: [sx * 0.75, 0, -0.1], scale: [0.85, 0.11, 0.5] });
    for (const k of [0, 1]) w.add(G.rbox(0.3), '#3d4250', { pos: [sx * 0.8, 0.04, -0.3 - k * 0.2], scale: [0.6, 0.06, 0.08] });
    w.add(G.sphere(12, 6), DOVE_DARK, { pos: [sx * 1.65, 0, -0.25], scale: [0.65, 0.08, 0.38] });
    for (let k = 0; k < 4; k++) w.add(G.sphere(8, 4), DOVE_DARK, { pos: [sx * (1.85 + k * 0.1), 0, -0.45 + k * 0.12], rot: [0, sx * (0.5 - k * 0.2), 0], scale: [0.35, 0.05, 0.1] });
    pivot.add(new THREE.Mesh(w.geometry(), material));
    group.add(pivot);
    wings.push(pivot);
  }
  const legs: THREE.Group[] = [];
  const toes: THREE.Group[] = [];
  for (const sx of [-1, 1]) {
    const leg = new THREE.Group();
    leg.position.set(sx * 0.2, -0.3, 0.05);
    const l = new Builder();
    l.add(G.sphere(12, 8), DOVE, { pos: [0, -0.05, 0], scale: [0.16, 0.2, 0.18] });
    l.add(G.cyl(8), '#e8908a', { pos: [0, -0.38, 0], scale: [0.045, 0.5, 0.045] });
    leg.add(new THREE.Mesh(l.geometry(), material));
    const foot = new THREE.Group();
    foot.position.set(0, -0.62, 0);
    const f = new Builder();
    for (const a of [-0.45, 0, 0.45]) {
      f.add(G.cyl(6), '#e8908a', { pos: [Math.sin(a) * 0.13, 0, Math.cos(a) * 0.13], rot: [Math.PI / 2, a, 0], scale: [0.032, 0.26, 0.032] });
      f.add(G.cone(6), '#3d3a40', { pos: [Math.sin(a) * 0.27, 0, Math.cos(a) * 0.27], rot: [Math.PI / 2, a, 0], scale: [0.026, 0.07, 0.026] });
    }
    f.add(G.cyl(6), '#e8908a', { pos: [0, 0, -0.1], rot: [Math.PI / 2, 0, 0], scale: [0.03, 0.2, 0.03] });
    foot.add(new THREE.Mesh(f.geometry(), material));
    leg.add(foot);
    group.add(leg);
    legs.push(leg);
    toes.push(foot);
  }
  const talons = new THREE.Object3D();
  talons.position.set(0, -0.62, 0.1);
  legs[0].add(talons);
  group.traverse((o) => {
    if ((o as THREE.Mesh).isMesh) o.castShadow = true;
  });
  return { group, head, wings, legs, toes, talons, dispose: () => material.dispose() };
}

export interface Chick {
  group: THREE.Group;
  /** Turns to look up (negative x) or dive in; the beak's halves open about x. */
  head: THREE.Group;
  upper: THREE.Group;
  lower: THREE.Group;
}

/** A giant baby pigeon: a ball of yellow fluff with tufts on top, beady eyes, stubby wings and an enormous beak. */
function chick(material: THREE.Material, k: number): Chick {
  const FLUFF = k % 2 ? '#ecdc9a' : '#e4d08a';
  const group = new THREE.Group();
  const b = new Builder();
  b.add(G.blob(k, true), FLUFF, { pos: [0, 0.42, 0], scale: [0.46, 0.44, 0.44] });
  b.add(G.blob(k + 2, true), '#d8c07a', { pos: [0, 0.3, -0.1], scale: [0.4, 0.3, 0.4] });
  for (const sx of [-1, 1]) b.add(G.sphere(10, 6), '#c9b06a', { pos: [sx * 0.42, 0.45, -0.05], rot: [0, 0, sx * 0.6], scale: [0.08, 0.2, 0.14] });
  group.add(new THREE.Mesh(b.geometry(), material));
  const head = new THREE.Group();
  head.position.set(0, 0.78, 0.05);
  const h = new Builder();
  h.add(G.blob(k + 1, true), FLUFF, { pos: [0, 0.16, 0], scale: [0.3, 0.28, 0.29] });
  for (let i = 0; i < 5; i++) h.add(G.cone(5), '#f2e6b0', { pos: [(i - 2) * 0.05, 0.44, -0.02 + (i % 2) * 0.04], rot: [(i % 2) * 0.3 - 0.15, 0, (i - 2) * 0.35], scale: [0.025, 0.14, 0.025] });
  for (const sx of [-1, 1]) {
    h.add(G.sphere(10, 8), '#1d1612', { pos: [sx * 0.15, 0.26, 0.21], scale: [0.06, 0.07, 0.04] });
    h.add(G.sphere(6, 4), '#ffffff', { pos: [sx * 0.16, 0.29, 0.245], scale: 0.018 });
  }
  head.add(new THREE.Mesh(h.geometry(), material));
  // The beak: two great soft halves, pink inside, hinged at the face.
  const upper = new THREE.Group();
  upper.position.set(0, 0.13, 0.22);
  const u = new Builder();
  u.add(G.sphere(12, 8), '#f2c24a', { pos: [0, 0.03, 0.22], scale: [0.21, 0.08, 0.28] });
  u.add(G.sphere(10, 6), '#e8404a', { pos: [0, -0.02, 0.2], scale: [0.17, 0.035, 0.23] });
  upper.add(new THREE.Mesh(u.geometry(), material));
  const lower = new THREE.Group();
  lower.position.set(0, 0.1, 0.22);
  const lo = new Builder();
  lo.add(G.sphere(12, 8), '#f6d060', { pos: [0, -0.03, 0.2], scale: [0.2, 0.07, 0.25] });
  lo.add(G.sphere(10, 6), '#d8303e', { pos: [0, 0.015, 0.18], scale: [0.16, 0.03, 0.2] });
  lower.add(new THREE.Mesh(lo.geometry(), material));
  head.add(upper, lower);
  group.add(head);
  return { group, head, upper, lower };
}

export interface NestTree {
  group: THREE.Group;
  /** The middle of the nest's floor, in the tree's frame, and the nest's radius. */
  nest: THREE.Vector3;
  radius: number;
  chicks: Chick[];
  dispose(): void;
}

/**
 * A gnarled old tree with a couple of leafy branches and, on top, an enormous nest of sticks with three giant
 * chicks in it, sitting round the edge facing the middle. Its origin is at the foot of the trunk.
 */
export function nestTree(): NestTree {
  const group = new THREE.Group();
  const material = matte();
  const H = 3.3;
  const R = 1.45;
  const b = new Builder();
  b.add(G.taper(0.62, 10), '#6a4a32', { pos: [0, H / 2, 0], scale: [0.42, H, 0.42] });
  for (let k = 0; k < 5; k++) {
    const a = (k / 5) * Math.PI * 2;
    b.add(G.cone(8), '#5d4029', { pos: [Math.cos(a) * 0.36, 0.2, Math.sin(a) * 0.36], rot: [Math.sin(a) * 0.9, 0, -Math.cos(a) * 0.9], scale: [0.14, 0.6, 0.14] });
  }
  // Knots in the bark, and two branches with clumps of leaves.
  for (let k = 0; k < 4; k++) b.add(G.sphere(8, 6), '#4e3523', { pos: [Math.cos(k * 2.1) * 0.32, 0.8 + k * 0.6, Math.sin(k * 2.1) * 0.32], scale: [0.08, 0.12, 0.08] });
  for (const [a, y, l] of [
    [0.6, 1.9, 1.3],
    [3.6, 2.4, 1.1],
  ]) {
    b.add(G.taper(0.5, 8), '#6a4a32', { pos: [Math.cos(a) * l * 0.45, y + l * 0.25, Math.sin(a) * l * 0.45], rot: [Math.sin(a) * 1.1, 0, -Math.cos(a) * 1.1], scale: [0.13, l, 0.13] });
    for (let k = 0; k < 3; k++) b.add(G.blob(k + 1, true), k % 2 ? '#6aa04a' : '#5a9440', { pos: [Math.cos(a) * l * 0.95 + (k - 1) * 0.2, y + l * 0.55 + (k % 2) * 0.15, Math.sin(a) * l * 0.95 + (k - 1) * 0.12], scale: 0.38 - k * 0.04 });
  }
  // The nest: a deep bowl with a thick rim of sticks going every which way.
  b.add(G.sphere(18, 10), '#8a6640', { pos: [0, H + 0.05, 0], scale: [R * 0.95, 0.42, R * 0.95] });
  b.add(G.cyl(18), '#5a4028', { pos: [0, H + 0.3, 0], scale: [R * 0.82, 0.04, R * 0.82] });
  for (let k = 0; k < 46; k++) {
    const a = (k / 46) * Math.PI * 2;
    const r = R * (0.88 + (k % 3) * 0.06);
    b.add(G.cyl(5), ['#7a5634', '#9a7448', '#6a4a2c'][k % 3], {
      pos: [Math.cos(a) * r, H + 0.3 + (k % 4) * 0.07, Math.sin(a) * r],
      rot: [0.4 * Math.sin(k * 1.7), -a, Math.PI / 2 + 0.5 * Math.cos(k * 2.3)],
      scale: [0.045, 0.85 + (k % 5) * 0.12, 0.045],
    });
  }
  b.add(G.torus(0.3, 8, 28), '#8a6640', { pos: [0, H + 0.36, 0], rot: [Math.PI / 2, 0, 0], scale: [R * 0.92, R * 0.92, R * 0.9] });
  // A few old feathers stuck in the sticks.
  for (let k = 0; k < 3; k++) b.add(G.sphere(8, 4), '#eef0f6', { pos: [Math.cos(k * 2.4 + 1) * R * 1.02, H + 0.5, Math.sin(k * 2.4 + 1) * R * 1.02], rot: [0.8, k * 2.4, 0.6], scale: [0.04, 0.2, 0.012] });
  group.add(new THREE.Mesh(b.geometry(), material));
  const nest = new THREE.Vector3(0, H + 0.32, 0);
  const chicks: Chick[] = [];
  for (let k = 0; k < 3; k++) {
    const c = chick(material, k);
    chicks.push(c);
    group.add(c.group);
  }
  group.traverse((o) => {
    if ((o as THREE.Mesh).isMesh) o.castShadow = true;
  });
  return { group, nest, radius: R, chicks, dispose: () => material.dispose() };
}

// ---------------------------------------------------------------- the moon

/** A matrix placing a part on a sphere's surface at `n` (a direction), its own y along the surface's normal. */
function onSurface(n: THREE.Vector3, r: number, scale: THREE.Vector3): THREE.Matrix4 {
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), n.clone().normalize());
  return new THREE.Matrix4().compose(n.clone().normalize().multiplyScalar(r), q, scale);
}

export interface Moon {
  group: THREE.Group;
  /** Glowing cracks all over it, faded in (0 to 1) just before it goes. */
  cracks: THREE.MeshBasicMaterial;
  dispose(): void;
}

/** A little grey moon a metre across, pocked with craters, with cracks of light ready to split it open. */
export function moon(): Moon {
  const group = new THREE.Group();
  const b = new Builder();
  b.add(G.blob(3, true), '#b8b6b0', { scale: 1 });
  const dirs = [
    [0.2, 1, 0.3],
    [-0.7, 0.4, 0.6],
    [0.8, 0.2, 0.5],
    [0.1, -0.3, 1],
    [-0.4, -0.8, 0.4],
    [0.6, -0.6, -0.3],
    [-0.9, 0.1, -0.4],
    [0.3, 0.5, -0.8],
    [-0.2, 0.9, -0.4],
    [0.9, 0.6, -0.2],
  ];
  dirs.forEach(([x, y, z], k) => {
    const n = new THREE.Vector3(x, y, z).normalize();
    const r = 0.16 + (k % 3) * 0.07;
    b.add(G.sphere(14, 8), '#8e8c88', onSurface(n, 0.93, new THREE.Vector3(r, 0.06, r)));
    b.add(G.torus(0.15, 6, 16), '#c8c6c0', onSurface(n, 0.97, new THREE.Vector3(r * 1.05, 0.25, r * 1.05)).multiply(new THREE.Matrix4().makeRotationX(Math.PI / 2)));
  });
  group.add(mesh(b));
  // The cracks: zigzags of light across its face.
  const c = new Builder();
  for (let k = 0; k < 9; k++) {
    let p = new THREE.Vector3(Math.sin(k * 2.3), Math.cos(k * 1.7), Math.sin(k * 3.1 + 1)).normalize();
    let d = new THREE.Vector3(Math.cos(k * 1.3), Math.sin(k * 2.9), Math.cos(k * 0.7)).cross(p).normalize();
    for (let i = 0; i < 4; i++) {
      d.applyAxisAngle(p, (i % 2 ? 1 : -1) * 0.7);
      const next = p.clone().addScaledVector(d, 0.28).normalize();
      const a = p.clone().multiplyScalar(1.01);
      const e = next.clone().multiplyScalar(1.01);
      const m = new THREE.Matrix4().lookAt(a, e, p);
      m.setPosition(a.clone().add(e).multiplyScalar(0.5));
      c.add(G.box(), '#ffffff', m.multiply(new THREE.Matrix4().makeScale(0.035, 0.035, a.distanceTo(e) + 0.02)));
      d = d.sub(next.clone().multiplyScalar(d.dot(next))).normalize();
      p = next;
    }
  }
  const cracks = new THREE.MeshBasicMaterial({ color: '#d8ffd0', transparent: true, opacity: 0, depthWrite: false });
  group.add(new THREE.Mesh(c.geometry(), cracks));
  return { group, cracks, dispose: () => {} };
}

export interface Station {
  group: THREE.Group;
  /** The middle of the dish, the way it faces (both in the station's frame), and where its beams meet. */
  dish: THREE.Vector3;
  aim: THREE.Vector3;
  focus: THREE.Vector3;
  /** Round the dish's rim, where the beams start. */
  emitters: THREE.Vector3[];
  /** The dish's glow, and the little lights round the middle. */
  glow: THREE.MeshBasicMaterial;
  lights: THREE.MeshBasicMaterial;
  dispose(): void;
}

/**
 * A battle station: a great round grey ball with a trench round its middle, panel lines and lights all over, and
 * a big round dish set into its upper face (which faces +z, tilted up). Three metres across.
 */
export function station(): Station {
  const R = 1.5;
  const group = new THREE.Group();
  const b = new Builder();
  b.add(G.sphere(28, 20), '#a4a9b1', { scale: R });
  // The trench round the middle, and lines of panels above and below it.
  b.add(G.cyl(32), '#4a4e56', { scale: [R * 1.004, 0.07, R * 1.004] });
  for (let k = 0; k < 60; k++) {
    const n = new THREE.Vector3(Math.sin(k * 2.39) * Math.sqrt(1 - ((k / 60) * 2 - 1) ** 2), (k / 60) * 2 - 1, Math.cos(k * 2.39) * Math.sqrt(1 - ((k / 60) * 2 - 1) ** 2));
    b.add(G.box(), k % 3 ? '#a3a8b0' : '#73787f', onSurface(n, R, new THREE.Vector3(0.14 + (k % 4) * 0.05, 0.04, 0.1 + (k % 3) * 0.05)));
  }
  // The dish: set into the upper face, a darker bowl with rings and a rim.
  const aim = new THREE.Vector3(0, 0.42, 1).normalize();
  const dish = aim.clone().multiplyScalar(R * 0.9);
  b.add(G.sphere(24, 10), '#5d626a', onSurface(aim, R * 0.88, new THREE.Vector3(0.6, 0.1, 0.6)));
  for (const r of [0.6, 0.42, 0.24]) b.add(G.torus(0.08, 4, 28), r === 0.6 ? '#b0b5bc' : '#4a4e56', onSurface(aim, R * (0.9 + (0.6 - r) * 0.04), new THREE.Vector3(r, 0.3, r)).multiply(new THREE.Matrix4().makeRotationX(Math.PI / 2)));
  b.add(G.cone(10), '#4a4e56', onSurface(aim, R * 0.9, new THREE.Vector3(0.06, 0.35, 0.06)).multiply(new THREE.Matrix4().makeTranslation(0, 0.5, 0)));
  // (A little light of its own, so its shady side still reads against the sky.)
  group.add(mesh(b, new THREE.MeshLambertMaterial({ vertexColors: true, emissive: '#3a3e48' })));
  const glow = new THREE.MeshBasicMaterial({ color: '#7dff6a', transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending });
  const glowBall = new THREE.Mesh(new THREE.SphereGeometry(0.3, 14, 10), glow);
  glowBall.position.copy(dish).addScaledVector(aim, 0.1);
  group.add(glowBall);
  // Little lit windows round the trench.
  const lights = new THREE.MeshBasicMaterial({ color: '#fff3b0' });
  const l = new Builder();
  for (let k = 0; k < 26; k++) {
    const a = (k / 26) * Math.PI * 2;
    l.add(G.box(), '#ffffff', { pos: [Math.sin(a) * R * 1.01, (k % 2) * 0.05 - 0.02, Math.cos(a) * R * 1.01], rot: [0, a, 0], scale: [0.05, 0.025, 0.01] });
  }
  group.add(new THREE.Mesh(l.geometry(), lights));
  const u = new THREE.Vector3().crossVectors(aim, new THREE.Vector3(0, 1, 0)).normalize();
  const v = new THREE.Vector3().crossVectors(u, aim).normalize();
  const emitters = Array.from({ length: 6 }, (_, k) => {
    const a = (k / 6) * Math.PI * 2;
    return dish.clone().addScaledVector(u, Math.cos(a) * 0.55).addScaledVector(v, Math.sin(a) * 0.55).addScaledVector(aim, 0.05);
  });
  return {
    group,
    dish,
    aim,
    focus: dish.clone().addScaledVector(aim, 1.1),
    emitters,
    glow,
    lights,
    dispose: () => {
      glowBall.geometry.dispose();
    },
  };
}

/** A transporter's column of light: a tall glowing tube, open at both ends, its origin at its foot. */
export function beamColumn(): { mesh: THREE.Mesh; material: THREE.MeshBasicMaterial } {
  const material = new THREE.MeshBasicMaterial({ color: '#bff4ff', transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending });
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 1, 20, 1, true).translate(0, 0.5, 0), material);
  mesh.renderOrder = 3;
  return { mesh, material };
}
