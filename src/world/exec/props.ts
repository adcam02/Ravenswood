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
