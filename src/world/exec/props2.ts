import * as THREE from 'three';
import { Builder, matte } from '../build';
import { G } from '../town/kit';
import { signBoard, TextSign } from '../town/sign';

/**
 * The props for the newer ways to be executed (see stage2.ts), in the same style as props.ts: chunky painted shapes,
 * each in its own frame with the origin on the floor, facing +z, and moving parts as groups of their own.
 */

const WOOD = '#5a3d2a';
const IRON = '#3b3a44';
const STEEL = '#c9d2dc';
const BRASS = '#d7a943';
const SKIN = '#f2c9a0';
const INK = '#1e1c22';

const mesh = (b: Builder, material: THREE.Material = matte()) => b.mesh(material, { cast: true, receive: false });

/** A board with a word or two on it, both sides, for the signs that pop up ("360!", "Ta-da?!"). */
export function wordSign(text: string, w: number, h: number, colours: { bg: string; fg: string; border?: string } = { bg: '#fffaf0', fg: '#d8402f', border: '#d8402f' }) {
  const sign = new TextSign({ w: Math.round(256 * (w / h)), h: 256, bg: colours.bg, fg: colours.fg, border: colours.border, size: 150, weight: 800, round: true }, text);
  const board = signBoard(sign, w, h, { lit: true });
  const group = new THREE.Group().add(board.mesh);
  group.scale.setScalar(0.001);
  return {
    group,
    dispose: () => {
      sign.dispose();
      board.material.dispose();
      group.traverse((o) => (o as THREE.Mesh).geometry?.dispose());
      group.removeFromParent();
    },
  };
}
export type WordSign = ReturnType<typeof wordSign>;

/** A thin cord between two points (set each frame with `stretchCord`). */
export function cord(color: string, r = 0.015): THREE.Mesh {
  const geo = new THREE.CylinderGeometry(r, r, 1, 6).translate(0, 0.5, 0);
  return new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ color }));
}

const UP = new THREE.Vector3(0, 1, 0);
export function stretchCord(m: THREE.Mesh, a: THREE.Vector3, b: THREE.Vector3) {
  const d = b.clone().sub(a);
  m.position.copy(a);
  m.quaternion.setFromUnitVectors(UP, d.clone().normalize());
  m.scale.set(1, Math.max(0.001, d.length()), 1);
}

// ---------------------------------------------------------------- the bench press

export interface WeightBench {
  group: THREE.Group;
  /** The bar and its plates, resting on the rack's hooks (the bar runs along z). */
  barbell: THREE.Group;
  /** The two great plates, each about its own middle (they let the air out, when spared). */
  plates: THREE.Group[];
  /** Where the bar sits on the hooks, in the bench's frame. */
  rest: THREE.Vector3;
  dispose(): void;
}

/**
 * A gym bench along x (the head end at +x), its pad `padY` up, with the rack (its hooks `hookY` up, `barX` along) and a barbell far too
 * heavy for anyone: plates as big as cartwheels, marked 1000 KG.
 */
export function weightBench(len: number, padY: number, barX: number, hookY: number): WeightBench {
  const group = new THREE.Group();
  const b = new Builder();
  b.add(G.rbox(0.3), '#c4473a', { pos: [0, padY - 0.06, 0], scale: [len, 0.12, 0.42] });
  b.add(G.box(), IRON, { pos: [0, padY - 0.15, 0], scale: [len * 0.9, 0.06, 0.14] });
  for (const sx of [-1, 1]) {
    b.add(G.box(), IRON, { pos: [sx * len * 0.38, (padY - 0.15) / 2, 0], scale: [0.08, padY - 0.15, 0.08] });
    b.add(G.rbox(0.3), IRON, { pos: [sx * len * 0.38, 0.03, 0], scale: [0.12, 0.06, 0.5] });
  }
  // The rack: two uprights either side at the head end, with hooks.
  for (const sz of [-1, 1]) {
    b.add(G.box(), IRON, { pos: [barX, (hookY + 0.1) / 2, sz * 0.62], scale: [0.08, hookY + 0.1, 0.08] });
    b.add(G.rbox(0.3), IRON, { pos: [barX, 0.03, sz * 0.62], scale: [0.4, 0.06, 0.14] });
    b.add(G.box(), STEEL, { pos: [barX + 0.05, hookY - 0.04, sz * 0.62], scale: [0.1, 0.03, 0.06] });
  }
  group.add(mesh(b));
  const barbell = new THREE.Group();
  barbell.position.set(barX, hookY, 0);
  group.add(barbell);
  const bar = new Builder();
  bar.add(G.cyl(10), STEEL, { rot: [Math.PI / 2, 0, 0], scale: [0.028, 2.1, 0.028] });
  for (const sz of [-1, 1]) bar.add(G.cyl(12), '#8e96a2', { pos: [0, 0, sz * 0.62], rot: [Math.PI / 2, 0, 0], scale: [0.05, 0.05, 0.05] });
  barbell.add(mesh(bar));
  const plates: THREE.Group[] = [];
  for (const sz of [-1, 1]) {
    const plate = new THREE.Group();
    plate.position.set(0, 0, sz * 0.8);
    const p = new Builder();
    p.add(G.cyl(24), '#2b2a30', { rot: [Math.PI / 2, 0, 0], scale: [0.4, 0.13, 0.4] });
    p.add(G.torus(0.12, 8, 28), '#45444c', { scale: [0.37, 0.37, 0.6] });
    p.add(G.cyl(14), STEEL, { rot: [Math.PI / 2, 0, 0], scale: [0.08, 0.15, 0.08] });
    plate.add(mesh(p));
    barbell.add(plate);
    plates.push(plate);
  }
  // "1000 KG" on a plate.
  const label = wordSign('1000 KG', 0.56, 0.2, { bg: '#2b2a30', fg: '#ffffff' });
  label.group.scale.setScalar(1);
  // (On the -z plate, facing out: the bench is turned so that one is nearer the camera.)
  label.group.position.set(0, -0.18, -0.03);
  label.group.rotation.y = Math.PI;
  plates[0].add(label.group);
  return { group, barbell, plates, rest: barbell.position.clone(), dispose: label.dispose };
}

// ---------------------------------------------------------------- 360 no scope

export interface Sniper {
  group: THREE.Group;
  /** Everything above the crate: turns round for the spin. */
  body: THREE.Group;
  /** The rifle, about the shoulder: pointing down at rest (rotation.x 1), level along +z at 0. */
  gun: THREE.Group;
  muzzle: THREE.Object3D;
  dispose(): void;
}

/** A sniper in green camouflage, a red cap on backwards and little black shades, with a long rifle and a scope he won't use. */
export function sniper(): Sniper {
  const group = new THREE.Group();
  const body = new THREE.Group();
  group.add(body);
  const b = new Builder();
  const CAMO = '#5f7f3a';
  // A crate to stand on.
  b.add(G.box(), '#8a6a44', { pos: [0, 0.18, 0], scale: [0.62, 0.36, 0.62] });
  b.add(G.box(), WOOD, { pos: [0, 0.18, 0.312], scale: [0.62, 0.05, 0.01] });
  group.add(mesh(b));
  const f = new Builder();
  for (const sx of [-1, 1]) {
    f.add(G.rbox(0.3), INK, { pos: [sx * 0.09, 0.41, 0.03], scale: [0.12, 0.1, 0.22] });
    f.add(G.cyl(10), CAMO, { pos: [sx * 0.09, 0.62, 0], scale: [0.075, 0.38, 0.075] });
  }
  f.add(G.rbox(0.25), CAMO, { pos: [0, 1.0, 0], scale: [0.38, 0.46, 0.26] });
  for (let k = 0; k < 7; k++) f.add(G.sphere(8, 6), k % 2 ? '#3f5a28' : '#8a8a4a', { pos: [Math.sin(k * 2.3) * 0.15, 0.85 + (k % 4) * 0.09, 0.13], scale: [0.07, 0.05, 0.02] });
  f.add(G.box(), '#3f3020', { pos: [0, 0.8, 0], scale: [0.39, 0.05, 0.27] });
  // The left arm hangs; the face, the shades and the cap on backwards.
  f.add(G.cyl(10), CAMO, { pos: [-0.23, 1.0, 0], rot: [0, 0, -0.1], scale: [0.055, 0.34, 0.055] });
  f.add(G.sphere(12, 10), SKIN, { pos: [0, 1.4, 0], scale: [0.15, 0.16, 0.15] });
  f.add(G.rbox(0.4), INK, { pos: [0, 1.43, 0.125], scale: [0.25, 0.06, 0.04] });
  f.add(G.dome(14), '#d8402f', { pos: [0, 1.48, 0], scale: [0.16, 0.12, 0.16] });
  f.add(G.cyl(14), '#d8402f', { pos: [0, 1.49, -0.16], scale: [0.11, 0.015, 0.12] });
  body.add(mesh(f));
  const gun = new THREE.Group();
  gun.position.set(0.2, 1.15, 0.05);
  const g = new Builder();
  g.add(G.cyl(10), CAMO, { pos: [0, -0.12, 0.08], rot: [0.9, 0, 0], scale: [0.055, 0.3, 0.055] });
  g.add(G.rbox(0.3), '#6a4a30', { pos: [0, 0, 0.05], scale: [0.07, 0.11, 0.38] });
  g.add(G.cyl(8), '#2e2d34', { pos: [0, 0.03, 0.62], rot: [Math.PI / 2, 0, 0], scale: [0.025, 0.7, 0.025] });
  g.add(G.cyl(10), INK, { pos: [0, 0.11, 0.3], rot: [Math.PI / 2, 0, 0], scale: [0.04, 0.3, 0.04] });
  g.add(G.cyl(10), '#7ac8ff', { pos: [0, 0.11, 0.455], rot: [Math.PI / 2, 0, 0], scale: [0.035, 0.01, 0.035] });
  gun.add(mesh(g));
  const muzzle = new THREE.Object3D();
  muzzle.position.set(0, 0.03, 0.98);
  gun.add(muzzle);
  body.add(gun);
  return { group, body, gun, muzzle, dispose: () => {} };
}

// ---------------------------------------------------------------- the bath and the toaster

export interface Bath {
  group: THREE.Group;
  duck: THREE.Group;
  toaster: THREE.Group;
  /** Two slices, in the toaster's slots until they pop. */
  slices: THREE.Group[];
  /** The plug in its socket (it pulls free, when spared). */
  plug: THREE.Group;
  /** Where the cord leaves the toaster, in the toaster's frame. */
  tail: THREE.Vector3;
  cord: THREE.Mesh;
  /** The water's surface. */
  water: number;
  /** Where the toaster stands at the start, on its stool. */
  shelf: THREE.Vector3;
  dispose(): void;
}

/** A white claw-foot bath along x, full of bubbles, with a rubber duck, and a toaster on a stool beside it, plugged in. */
export function bath(len: number): Bath {
  const group = new THREE.Group();
  const b = new Builder();
  const water = 0.66;
  b.add(G.rbox(0.45), '#f6f3ee', { pos: [0, 0.46, 0], scale: [len, 0.56, 0.9] });
  b.add(G.rbox(0.45), '#e6e0d6', { pos: [0, 0.73, 0], scale: [len + 0.06, 0.06, 0.96] });
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) b.add(G.sphere(10, 8), BRASS, { pos: [sx * (len / 2 - 0.2), 0.12, sz * 0.3], scale: [0.09, 0.12, 0.09] });
  b.add(G.cyl(20), '#9fd8f0', { pos: [0, water, 0], scale: [len / 2 - 0.06, 0.02, 0.4] });
  // Bubbles heaped round the edges, and a few on top.
  for (let k = 0; k < 34; k++) {
    const a = (k / 34) * Math.PI * 2;
    const r = 0.85 + (k % 3) * 0.06;
    b.add(G.sphere(10, 8), k % 4 ? '#ffffff' : '#eaf6ff', { pos: [Math.cos(a) * (len / 2 - 0.12) * r, water + 0.04 + (k % 3) * 0.04, Math.sin(a) * 0.36 * r], scale: 0.07 + (k % 5) * 0.018 });
  }
  // The taps at the foot end.
  b.add(G.cyl(8), STEEL, { pos: [-len / 2 + 0.05, 0.86, 0], scale: [0.03, 0.22, 0.03] });
  b.add(G.cyl(8), STEEL, { pos: [-len / 2 + 0.12, 0.96, 0], rot: [0, 0, Math.PI / 2], scale: [0.025, 0.16, 0.025] });
  // The stool behind, and the socket on its post.
  const shelf = new THREE.Vector3(0.25, 0.92, -0.78);
  b.add(G.cyl(14), '#c48a52', { pos: [shelf.x, shelf.y - 0.04, shelf.z], scale: [0.22, 0.06, 0.22] });
  for (let k = 0; k < 3; k++) {
    const a = (k / 3) * Math.PI * 2;
    b.add(G.cyl(6), WOOD, { pos: [shelf.x + Math.cos(a) * 0.13, (shelf.y - 0.07) / 2, shelf.z + Math.sin(a) * 0.13], scale: [0.025, shelf.y - 0.07, 0.025] });
  }
  b.add(G.box(), '#d8cbb4', { pos: [0.9, 0.25, -0.75], scale: [0.14, 0.5, 0.1] });
  b.add(G.box(), '#f4efe6', { pos: [0.9, 0.38, -0.69], scale: [0.11, 0.14, 0.02] });
  group.add(mesh(b));
  const duck = new THREE.Group();
  const d = new Builder();
  d.add(G.sphere(12, 10), '#ffd23a', { pos: [0, 0.05, 0], scale: [0.1, 0.07, 0.13] });
  d.add(G.sphere(12, 10), '#ffd23a', { pos: [0, 0.14, 0.07], scale: 0.065 });
  d.add(G.cone(8), '#f08a2a', { pos: [0, 0.13, 0.15], rot: [Math.PI / 2, 0, 0], scale: [0.03, 0.06, 0.02] });
  for (const sx of [-1, 1]) d.add(G.sphere(6, 4), INK, { pos: [sx * 0.035, 0.16, 0.12], scale: 0.012 });
  duck.add(mesh(d));
  group.add(duck);
  const toaster = new THREE.Group();
  toaster.position.copy(shelf);
  const t = new Builder();
  t.add(G.rbox(0.3), STEEL, { pos: [0, 0.12, 0], scale: [0.34, 0.24, 0.2] });
  for (const sx of [-1, 1]) t.add(G.box(), INK, { pos: [sx * 0.06, 0.24, 0], scale: [0.04, 0.01, 0.14] });
  t.add(G.box(), INK, { pos: [0.18, 0.12, 0], scale: [0.03, 0.03, 0.05] });
  t.add(G.box(), '#3b3a44', { pos: [0, 0.01, 0], scale: [0.3, 0.02, 0.18] });
  toaster.add(mesh(t));
  group.add(toaster);
  const slices: THREE.Group[] = [];
  for (const sx of [-1, 1]) {
    const s = new THREE.Group();
    const sb = new Builder();
    sb.add(G.rbox(0.3), '#e0a860', { scale: [0.025, 0.15, 0.13] });
    sb.add(G.rbox(0.3), '#f3dca4', { scale: [0.03, 0.12, 0.1] });
    s.add(mesh(sb));
    s.userData.x = sx * 0.06;
    toaster.add(s);
    slices.push(s);
  }
  const plug = new THREE.Group();
  plug.position.set(0.9, 0.38, -0.66);
  const pb = new Builder();
  pb.add(G.rbox(0.3), '#f4efe6', { scale: [0.07, 0.07, 0.06] });
  plug.add(mesh(pb));
  group.add(plug);
  const wire = cord('#f4efe6');
  group.add(wire);
  return { group, duck, toaster, slices, plug, tail: new THREE.Vector3(0.12, 0.05, -0.08), cord: wire, water, shelf, dispose: () => {} };
}

// ---------------------------------------------------------------- the nuclear bomb

export interface Bomb {
  group: THREE.Group;
  light: THREE.MeshBasicMaterial;
  dispose(): void;
}

/** A fat yellow cartoon bomb, nose down, with tail fins, black trefoils and a red light that blinks faster and faster. */
export function bomb(): Bomb {
  const group = new THREE.Group();
  const b = new Builder();
  const Y = '#e8c832';
  b.add(G.sphere(20, 16), Y, { pos: [0, 0.62, 0], scale: [0.42, 0.62, 0.42] });
  b.add(G.cyl(20), INK, { pos: [0, 0.7, 0], scale: [0.425, 0.12, 0.425] });
  b.add(G.taper(0.5, 14), '#b89a22', { pos: [0, 1.32, 0], scale: [0.22, 0.24, 0.22] });
  for (let k = 0; k < 4; k++) {
    const a = (k / 4) * Math.PI * 2 + Math.PI / 4;
    b.add(G.box(), '#b89a22', { pos: [Math.sin(a) * 0.24, 1.38, Math.cos(a) * 0.24], rot: [0, a, 0], scale: [0.03, 0.3, 0.26] });
  }
  b.add(G.torus(0.15, 6, 20), '#b89a22', { pos: [0, 1.53, 0], rot: [Math.PI / 2, 0, 0], scale: [0.25, 0.25, 0.25] });
  // The trefoil, on the front and the back.
  for (const side of [1, -1]) {
    const m = new THREE.Matrix4().makeRotationY(side > 0 ? 0 : Math.PI);
    for (let k = 0; k < 3; k++) {
      const sector = new THREE.CylinderGeometry(0.2, 0.2, 0.02, 12, 1, false, (k / 3) * Math.PI * 2 - Math.PI / 6, Math.PI / 3);
      b.add(sector, INK, { pos: [0, 0.48, 0.405], rot: [Math.PI / 2, 0, 0] }, m);
      sector.dispose();
    }
    b.add(G.cyl(14), Y, { pos: [0, 0.48, 0.41], rot: [Math.PI / 2, 0, 0], scale: [0.06, 0.02, 0.06] }, m);
    b.add(G.cyl(14), INK, { pos: [0, 0.48, 0.415], rot: [Math.PI / 2, 0, 0], scale: [0.04, 0.02, 0.04] }, m);
  }
  group.add(mesh(b));
  const light = new THREE.MeshBasicMaterial({ color: '#ff3a2a' });
  const lb = new Builder();
  lb.add(G.sphere(10, 8), '#ffffff', { pos: [0, 1.0, 0.36], scale: 0.06 });
  const bulb = new THREE.Mesh(lb.geometry(), light);
  group.add(bulb);
  return { group, light, dispose: () => {} };
}

// ---------------------------------------------------------------- the sunset

/** A great painted sky for the cross to stand against: deep violet up top, a low orange sun, gold and rose at the horizon. */
export function sunset(w: number, h: number): { mesh: THREE.Mesh; material: THREE.MeshBasicMaterial; dispose(): void } {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 256;
  const x = c.getContext('2d')!;
  const sky = x.createLinearGradient(0, 0, 0, 256);
  sky.addColorStop(0, '#2b1d4a');
  sky.addColorStop(0.45, '#9a3f6a');
  sky.addColorStop(0.75, '#f08a4a');
  sky.addColorStop(1, '#ffd48a');
  x.fillStyle = sky;
  x.fillRect(0, 0, 512, 256);
  const glow = x.createRadialGradient(256, 214, 10, 256, 214, 150);
  glow.addColorStop(0, 'rgba(255,240,190,0.9)');
  glow.addColorStop(1, 'rgba(255,200,120,0)');
  x.fillStyle = glow;
  x.fillRect(0, 0, 512, 256);
  x.fillStyle = '#fff2c8';
  x.beginPath();
  x.arc(256, 222, 44, 0, Math.PI * 2);
  x.fill();
  // Long thin clouds across the sun.
  x.fillStyle = 'rgba(120,50,90,0.45)';
  for (const [cx, cy, cw] of [
    [150, 150, 180],
    [360, 175, 150],
    [250, 200, 240],
    [90, 95, 120],
  ]) {
    x.beginPath();
    x.ellipse(cx, cy, cw / 2, 5, 0, 0, Math.PI * 2);
    x.fill();
  }
  const texture = new THREE.CanvasTexture(c);
  texture.colorSpace = THREE.SRGBColorSpace;
  const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true, opacity: 0, fog: false });
  const geo = new THREE.PlaneGeometry(w, h).translate(0, h / 2, 0);
  const mesh = new THREE.Mesh(geo, material);
  mesh.renderOrder = -1;
  return {
    mesh,
    material,
    dispose: () => {
      texture.dispose();
      material.dispose();
      geo.dispose();
    },
  };
}

export interface HillCross {
  group: THREE.Group;
  /** Black against the sky. */
  material: THREE.MeshBasicMaterial;
  /** Where they stand, on the little footrest; and the top of the cross. */
  foot: THREE.Vector3;
  top: THREE.Vector3;
  dispose(): void;
}

/** A little round hill with a plain wooden cross on top, all in silhouette. `tall` fits the cross to whoever stands on it. */
export function hillCross(tall: number): HillCross {
  const group = new THREE.Group();
  const material = new THREE.MeshBasicMaterial({ color: '#1a1216', fog: false });
  const b = new Builder();
  b.add(G.dome(24), '#000000', { scale: [2.4, 1.1, 1.6] });
  for (let k = 0; k < 7; k++) b.add(G.cone(4), '#000000', { pos: [-1.9 + k * 0.6, 0.35 + Math.sin(k) * 0.1, 0.9 - (k % 2) * 0.2], scale: [0.04, 0.2, 0.04] });
  const base = 1.08;
  const footY = base + 0.35;
  const H = footY + tall + 0.45;
  b.add(G.box(), '#000000', { pos: [0, (base + H) / 2, -0.08], scale: [0.16, H - base + 0.2, 0.1] });
  b.add(G.box(), '#000000', { pos: [0, footY + tall * 0.78, -0.08], scale: [Math.max(1.0, tall * 1.3), 0.14, 0.1] });
  b.add(G.box(), '#000000', { pos: [0, footY - 0.04, 0.0], scale: [0.36, 0.06, 0.2] });
  group.add(new THREE.Mesh(b.geometry(), material));
  return { group, material, foot: new THREE.Vector3(0, footY, 0.06), top: new THREE.Vector3(0, H, -0.08), dispose: () => {} };
}

export interface Dove {
  group: THREE.Group;
  wings: THREE.Group[];
  dispose(): void;
}

/** A small white dove, facing +z, its wings either side to flap. */
export function dove(): Dove {
  const group = new THREE.Group();
  const b = new Builder();
  b.add(G.sphere(12, 10), '#ffffff', { scale: [0.08, 0.08, 0.15] });
  b.add(G.sphere(10, 8), '#ffffff', { pos: [0, 0.06, 0.12], scale: 0.06 });
  b.add(G.cone(6), '#f0a040', { pos: [0, 0.055, 0.19], rot: [Math.PI / 2, 0, 0], scale: [0.015, 0.04, 0.015] });
  b.add(G.box(), '#f4f4f8', { pos: [0, 0.01, -0.19], rot: [-0.2, 0, 0], scale: [0.1, 0.02, 0.1] });
  group.add(mesh(b, new THREE.MeshBasicMaterial({ vertexColors: true, fog: false })));
  const wings: THREE.Group[] = [];
  for (const sx of [-1, 1]) {
    const w = new THREE.Group();
    w.position.set(sx * 0.05, 0.03, 0);
    const wb = new Builder();
    wb.add(G.sphere(10, 6), '#ffffff', { pos: [sx * 0.13, 0, -0.01], scale: [0.14, 0.015, 0.08] });
    w.add(mesh(wb, new THREE.MeshBasicMaterial({ vertexColors: true, fog: false })));
    group.add(w);
    wings.push(w);
  }
  return { group, wings, dispose: () => {} };
}

// ---------------------------------------------------------------- run over

export interface Car {
  group: THREE.Group;
  /** Bounces on its springs. */
  body: THREE.Group;
  wheels: THREE.Group[];
  /** The wheels' radius. */
  r: number;
  dispose(): void;
}

/** A little round car, front at +z, with big headlamp eyes and a grille that grins. `color` is its paint. */
export function littleCar(color = '#d8402f', open = false): Car {
  const group = new THREE.Group();
  const body = new THREE.Group();
  group.add(body);
  const b = new Builder();
  const r = 0.26;
  b.add(G.rbox(0.35), color, { pos: [0, 0.52, 0], scale: [1.05, 0.46, 1.9] });
  if (open) {
    // A convertible: a windscreen, two seats and the boot.
    b.add(G.rbox(0.3), '#bfe6f4', { pos: [0, 0.92, 0.32], rot: [-0.35, 0, 0], scale: [0.9, 0.36, 0.04] });
    for (const sx of [-1, 1]) b.add(G.rbox(0.3), '#7a3a2a', { pos: [sx * 0.24, 0.84, -0.32], scale: [0.4, 0.42, 0.14] });
    b.add(G.cyl(14), INK, { pos: [-0.24, 0.9, 0.1], rot: [1.1, 0, 0], scale: [0.15, 0.03, 0.15] });
  } else {
    b.add(G.rbox(0.4), color, { pos: [0, 0.95, -0.15], scale: [0.88, 0.42, 1.0] });
    b.add(G.rbox(0.3), '#bfe6f4', { pos: [0, 0.98, 0.33], rot: [-0.4, 0, 0], scale: [0.78, 0.3, 0.03] });
    for (const sx of [-1, 1]) b.add(G.rbox(0.3), '#bfe6f4', { pos: [sx * 0.445, 0.98, -0.15], scale: [0.02, 0.26, 0.8] });
  }
  // Headlamp eyes and a grinning grille, a bumper either end.
  for (const sx of [-1, 1]) {
    b.add(G.sphere(14, 10), '#fffbe8', { pos: [sx * 0.3, 0.6, 0.93], scale: [0.15, 0.15, 0.08] });
    b.add(G.sphere(10, 8), INK, { pos: [sx * 0.28, 0.62, 0.995], scale: [0.06, 0.07, 0.03] });
    b.add(G.sphere(8, 6), '#ffffff', { pos: [sx * 0.26, 0.65, 1.02], scale: 0.018 });
  }
  b.add(G.torus(0.25, 6, 18), INK, { pos: [0, 0.42, 0.95], rot: [0, 0, Math.PI], scale: [0.2, 0.08, 0.1] });
  for (const sz of [-1, 1]) b.add(G.rbox(0.4), STEEL, { pos: [0, 0.32, sz * 0.97], scale: [1.08, 0.1, 0.1] });
  body.add(mesh(b));
  const wheels: THREE.Group[] = [];
  for (const sx of [-1, 1])
    for (const sz of [-1, 1]) {
      const w = new THREE.Group();
      w.position.set(sx * 0.48, r, sz * 0.6);
      const wb = new Builder();
      wb.add(G.cyl(16), INK, { rot: [0, 0, Math.PI / 2], scale: [r, 0.18, r] });
      wb.add(G.cyl(10), STEEL, { pos: [sx * 0.07, 0, 0], rot: [0, 0, Math.PI / 2], scale: [r * 0.45, 0.06, r * 0.45] });
      wb.add(G.box(), '#8e96a2', { pos: [sx * 0.1, 0, 0], scale: [0.02, r * 0.8, 0.05] });
      w.add(mesh(wb));
      group.add(w);
      wheels.push(w);
    }
  return { group, body, wheels, r, dispose: () => {} };
}

// ---------------------------------------------------------------- Bonnie and Clyde

/** Little black shades with a glint, to sit on a nose (the lenses face +z). `w` is the width across. */
export function shades(w: number): THREE.Group {
  const group = new THREE.Group();
  const b = new Builder();
  for (const sx of [-1, 1]) {
    b.add(G.rbox(0.45), INK, { pos: [sx * w * 0.26, 0, 0], scale: [w * 0.42, w * 0.24, 0.03] });
    b.add(G.box(), '#ffffff', { pos: [sx * w * 0.26 - w * 0.08, w * 0.04, 0.017], rot: [0, 0, 0.6], scale: [w * 0.05, w * 0.14, 0.005] });
    b.add(G.box(), INK, { pos: [sx * w * 0.5, w * 0.05, -w * 0.25], scale: [0.02, 0.02, w * 0.5] });
  }
  b.add(G.box(), INK, { pos: [0, w * 0.06, 0], scale: [w * 0.14, 0.025, 0.025] });
  group.add(mesh(b));
  return group;
}

/** The partner in crime: a round fellow in a pinstripe suit and a fedora, with shades on, sat down (from the waist up). */
export function partner(): THREE.Group {
  const group = new THREE.Group();
  const b = new Builder();
  b.add(G.sphere(14, 10), '#3a3a4a', { pos: [0, 0.2, 0], scale: [0.24, 0.28, 0.2] });
  for (let k = -2; k <= 2; k++) b.add(G.box(), '#8a8aa0', { pos: [k * 0.08, 0.22, 0.17 - Math.abs(k) * 0.025], scale: [0.008, 0.36, 0.01] });
  b.add(G.prism(), '#f4efe6', { pos: [0, 0.36, 0.17], rot: [0, 0, Math.PI], scale: [0.12, 0.12, 0.02] });
  b.add(G.box(), '#c4473a', { pos: [0, 0.32, 0.19], scale: [0.03, 0.12, 0.01] });
  b.add(G.sphere(14, 10), '#e8b48a', { pos: [0, 0.6, 0.02], scale: [0.17, 0.18, 0.17] });
  b.add(G.sphere(8, 6), '#d89a70', { pos: [0, 0.58, 0.19], scale: [0.04, 0.035, 0.03] });
  b.add(G.cyl(16), '#4a3a2a', { pos: [0, 0.74, 0.02], scale: [0.27, 0.02, 0.27] });
  b.add(G.taper(0.85, 16), '#4a3a2a', { pos: [0, 0.82, 0.02], scale: [0.15, 0.15, 0.15] });
  b.add(G.cyl(16), INK, { pos: [0, 0.77, 0.02], scale: [0.155, 0.035, 0.155] });
  group.add(mesh(b));
  const s = shades(0.26);
  s.position.set(0, 0.63, 0.18);
  group.add(s);
  return group;
}

export interface Cliff {
  group: THREE.Group;
  /** How high its top is, and how far along x its edge is (the top runs from -edge to +edge). */
  top: number;
  edge: number;
  dispose(): void;
}

/** A tall rocky bluff with a dirt road along its flat top, running along x and ending in a sheer drop at +x. */
export function cliff(top: number, len: number): Cliff {
  const group = new THREE.Group();
  const b = new Builder();
  b.add(G.box(), '#9a8466', { pos: [0, top / 2, 0], scale: [len, top, 2.2] });
  for (let k = 0; k < 16; k++) {
    const x = -len / 2 + (k / 15) * len;
    const s = 0.5 + (k % 3) * 0.15;
    b.add(G.blob(k), k % 2 ? '#8a7458' : '#a8906e', { pos: [x * 0.98, top * (0.2 + (k % 4) * 0.2), 1.05], scale: [s, s * 0.8, s * 0.6] });
    b.add(G.blob(k + 3), '#8a7458', { pos: [x * 0.98, top * (0.3 + (k % 3) * 0.2), -1.05], scale: [s, s * 0.8, s * 0.6] });
  }
  for (let k = 0; k < 4; k++) b.add(G.blob(k + 1), '#a8906e', { pos: [len / 2 + 0.05, top * (0.15 + k * 0.24), (k % 2 ? 0.4 : -0.4)], scale: [0.4, 0.5, 0.7] });
  b.add(G.box(), '#7aa04a', { pos: [0, top + 0.03, 0], scale: [len, 0.06, 2.24] });
  b.add(G.box(), '#c9a878', { pos: [0, top + 0.065, 0], scale: [len, 0.02, 1.2] });
  for (let k = 0; k < 5; k++) b.add(G.blob(k), '#5f8a3a', { pos: [-len / 2 + 0.4 + k * (len / 5), top + 0.15, (k % 2 ? 0.95 : -0.95)], scale: [0.25, 0.2, 0.25] });
  group.add(mesh(b));
  return { group, top: top + 0.075, edge: len / 2, dispose: () => {} };
}

/** A striped parachute, its canopy up at +y with cords down to the origin. */
export function parachute(): THREE.Group {
  const group = new THREE.Group();
  const b = new Builder();
  for (let k = 0; k < 8; k++) {
    const sector = new THREE.SphereGeometry(1, 4, 6, (k / 8) * Math.PI * 2, Math.PI / 4, 0, Math.PI / 2.4);
    b.add(sector, k % 2 ? '#ffffff' : '#d8402f', { pos: [0, 1.6, 0], scale: [1.1, 0.6, 1.1] });
    sector.dispose();
    const a = (k / 8) * Math.PI * 2;
    const end = new THREE.Vector3(Math.sin(a) * 0.95, 1.85, Math.cos(a) * 0.95);
    const m = new THREE.Matrix4().lookAt(new THREE.Vector3(), end, UP);
    m.setPosition(end.clone().multiplyScalar(0.5));
    b.add(G.box(), '#f4efe6', m.multiply(new THREE.Matrix4().makeScale(0.01, 0.01, end.length())));
  }
  group.add(mesh(b));
  return group;
}

// ---------------------------------------------------------------- the failed magic trick

export interface Magician {
  group: THREE.Group;
  arms: THREE.Group[];
  /** In the right hand. */
  hand: THREE.Object3D;
  dispose(): void;
}

/** The Great Something: tailcoat and top hat, a red bow tie, a grand moustache, a white-tipped wand. Arms hang from the shoulders. */
export function magician(): Magician {
  const group = new THREE.Group();
  const b = new Builder();
  const COAT = '#262330';
  for (const sx of [-1, 1]) {
    b.add(G.rbox(0.3), INK, { pos: [sx * 0.1, 0.05, 0.04], scale: [0.13, 0.1, 0.24] });
    b.add(G.cyl(10), COAT, { pos: [sx * 0.1, 0.38, 0], scale: [0.07, 0.62, 0.07] });
  }
  b.add(G.rbox(0.25), COAT, { pos: [0, 0.95, 0], scale: [0.42, 0.56, 0.28] });
  // Tails at the back, a white shirt front, the bow tie.
  for (const sx of [-1, 1]) b.add(G.box(), COAT, { pos: [sx * 0.1, 0.55, -0.13], rot: [0.12, 0, 0], scale: [0.16, 0.42, 0.03] });
  b.add(G.box(), '#f4efe6', { pos: [0, 1.0, 0.14], scale: [0.14, 0.4, 0.01] });
  for (const sx of [-1, 1]) b.add(G.cone(4), '#d8402f', { pos: [sx * 0.05, 1.19, 0.16], rot: [0, 0, sx * Math.PI / 2], scale: [0.05, 0.08, 0.02] });
  b.add(G.sphere(12, 10), SKIN, { pos: [0, 1.42, 0], scale: [0.17, 0.19, 0.17] });
  for (const sx of [-1, 1]) {
    b.add(G.sphere(8, 6), INK, { pos: [sx * 0.06, 1.46, 0.15], scale: [0.02, 0.025, 0.012] });
    b.add(G.sphere(10, 6), INK, { pos: [sx * 0.07, 1.37, 0.16], rot: [0, 0, sx * -0.4], scale: [0.08, 0.025, 0.025] });
    b.add(G.sphere(8, 6), INK, { pos: [sx * 0.14, 1.4, 0.13], scale: 0.025 });
  }
  b.add(G.sphere(8, 6), '#e8a888', { pos: [0, 1.41, 0.17], scale: 0.035 });
  b.add(G.cyl(18), INK, { pos: [0, 1.58, 0], scale: [0.25, 0.02, 0.25] });
  b.add(G.cyl(18), INK, { pos: [0, 1.74, 0], scale: [0.15, 0.32, 0.15] });
  b.add(G.cyl(18), '#d8402f', { pos: [0, 1.62, 0], scale: [0.155, 0.05, 0.155] });
  // A cape, red inside.
  b.add(G.taper(0.55, 16), '#7a1f2a', { pos: [0, 0.82, -0.08], scale: [0.36, 0.86, 0.26] });
  group.add(mesh(b));
  const arms: THREE.Group[] = [];
  let hand = new THREE.Object3D();
  for (const sx of [-1, 1]) {
    const arm = new THREE.Group();
    arm.position.set(sx * 0.25, 1.17, 0);
    const a = new Builder();
    a.add(G.cyl(10), COAT, { pos: [0, -0.2, 0], scale: [0.06, 0.4, 0.06] });
    a.add(G.sphere(10, 8), '#ffffff', { pos: [0, -0.43, 0], scale: 0.06 });
    if (sx > 0) {
      a.add(G.cyl(8), INK, { pos: [0, -0.5, 0.14], rot: [Math.PI / 2, 0, 0], scale: [0.015, 0.3, 0.015] });
      a.add(G.cyl(8), '#ffffff', { pos: [0, -0.5, 0.3], rot: [Math.PI / 2, 0, 0], scale: [0.016, 0.05, 0.016] });
    }
    arm.add(mesh(a));
    group.add(arm);
    arms.push(arm);
    if (sx > 0) {
      hand = new THREE.Object3D();
      hand.position.set(0, -0.45, 0.05);
      arm.add(hand);
    }
  }
  return { group, arms, hand, dispose: () => {} };
}

export interface MagicBox {
  group: THREE.Group;
  /** The two halves of the box, foot end (-x) and head end (+x), each about the middle of its cut end. */
  halves: THREE.Group[];
  /** The top of the table, where the box's floor is. */
  floor: number;
  dispose(): void;
}

/** A trick table, and on it a long box in two halves, purple with gold stars, open at the ends for a head and feet. */
export function magicBox(len: number, high: number, deep: number): MagicBox {
  const group = new THREE.Group();
  const floor = 0.78;
  const b = new Builder();
  b.add(G.rbox(0.2), '#d8402f', { pos: [0, floor - 0.05, 0], scale: [len + 0.6, 0.1, deep + 0.3] });
  b.add(G.box(), BRASS, { pos: [0, floor - 0.11, 0], scale: [len + 0.62, 0.03, deep + 0.32] });
  for (const sx of [-1, 1]) {
    b.add(G.taper(0.6, 10), BRASS, { pos: [sx * (len / 2), (floor - 0.12) / 2, 0], scale: [0.07, floor - 0.12, 0.07] });
    b.add(G.cyl(12), BRASS, { pos: [sx * (len / 2), 0.02, 0], scale: [0.18, 0.04, 0.18] });
  }
  group.add(mesh(b));
  const halves: THREE.Group[] = [];
  for (const sx of [-1, 1]) {
    const half = new THREE.Group();
    half.position.set(0, floor, 0);
    const h = new Builder();
    const L = len / 2;
    const c = (x: number) => sx * x;
    // Walls (front, back, top, floor) and the end with its hole, leaving the cut end open.
    h.add(G.box(), '#6a3a9a', { pos: [c(L / 2), high / 2, deep / 2], scale: [L, high, 0.04] });
    h.add(G.box(), '#6a3a9a', { pos: [c(L / 2), high / 2, -deep / 2], scale: [L, high, 0.04] });
    h.add(G.box(), '#7b4fa8', { pos: [c(L / 2), high, 0], scale: [L, 0.04, deep + 0.04] });
    h.add(G.box(), '#5a2e86', { pos: [c(L / 2), 0.01, 0], scale: [L, 0.02, deep] });
    for (const sz of [-1, 1]) h.add(G.box(), '#7b4fa8', { pos: [c(L), high / 2, sz * (deep / 2 - 0.06)], scale: [0.04, high, 0.12] });
    h.add(G.box(), '#7b4fa8', { pos: [c(L), high - 0.05, 0], scale: [0.04, 0.1, deep] });
    h.add(G.box(), BRASS, { pos: [c(0.01), high / 2, 0], scale: [0.02, high + 0.04, deep + 0.06] });
    for (let k = 0; k < 3; k++) {
      const x = c(L * (0.25 + k * 0.28));
      const y = high * (0.3 + (k % 2) * 0.35);
      h.add(G.cone(5), BRASS, { pos: [x, y, deep / 2 + 0.025], rot: [Math.PI / 2, 0, 0], scale: [0.07, 0.01, 0.07] });
    }
    half.add(mesh(h));
    group.add(half);
    halves.push(half);
  }
  return { group, halves, floor, dispose: () => {} };
}

/** A big carpenter's saw: a wooden handle at the origin and the toothed blade out along +x. */
export function saw(len: number): THREE.Group {
  const group = new THREE.Group();
  const b = new Builder();
  b.add(G.rbox(0.3), '#a7774c', { pos: [-0.05, 0, 0], scale: [0.16, 0.2, 0.05] });
  b.add(G.box(), STEEL, { pos: [len / 2 + 0.03, 0.02, 0], scale: [len, 0.18, 0.012] });
  for (let k = 0; k < 14; k++) b.add(G.cone(3), STEEL, { pos: [0.1 + (k / 13) * (len - 0.1), -0.085, 0], rot: [0, 0, Math.PI], scale: [0.025, 0.04, 0.008] });
  group.add(mesh(b));
  return group;
}

// ---------------------------------------------------------------- the meat grinder

export interface Mincer {
  group: THREE.Group;
  crank: THREE.Group;
  /** The top of the hopper (where they go in) and the outlet's middle (where the sausages come out). */
  mouth: THREE.Vector3;
  outlet: THREE.Vector3;
  dispose(): void;
}

/** A giant old hand-cranked mincer on a stand: a hopper on top, the crank at -x, the holed plate at +x, and a dish below. */
export function mincer(): Mincer {
  const group = new THREE.Group();
  const b = new Builder();
  const BODY = '#c0c6cc';
  const H = 1.5;
  // The stand, clamped to a little table, and a dish under the outlet.
  b.add(G.box(), '#8a6a44', { pos: [0, 0.55, 0], scale: [1.3, 0.1, 0.9] });
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) b.add(G.box(), WOOD, { pos: [sx * 0.55, 0.25, sz * 0.35], scale: [0.08, 0.5, 0.08] });
  b.add(G.taper(0.7, 14), BODY, { pos: [0, 0.95, 0], scale: [0.32, 0.75, 0.32] });
  b.add(G.cyl(20), BODY, { pos: [0, H, 0], rot: [0, 0, Math.PI / 2], scale: [0.45, 1.5, 0.45] });
  for (let k = 0; k < 5; k++) b.add(G.torus(0.12, 6, 20), '#9aa2aa', { pos: [-0.6 + k * 0.3, H, 0], rot: [0, Math.PI / 2, 0], scale: [0.46, 0.46, 0.3] });
  b.add(G.cyl(20), '#9aa2aa', { pos: [0.78, H, 0], rot: [0, 0, Math.PI / 2], scale: [0.5, 0.08, 0.5] });
  for (let k = 0; k < 7; k++) {
    const a = (k / 6) * Math.PI * 2;
    const r = k === 6 ? 0 : 0.25;
    b.add(G.cyl(10), '#3a3a44', { pos: [0.83, H + Math.sin(a) * r, Math.cos(a) * r], rot: [0, 0, Math.PI / 2], scale: [0.07, 0.02, 0.07] });
  }
  // The hopper: a great funnel up top.
  b.add(G.taper(2.4, 20), BODY, { pos: [-0.15, H + 0.75, 0], scale: [0.38, 0.6, 0.38] });
  b.add(G.torus(0.08, 8, 28), '#9aa2aa', { pos: [-0.15, H + 1.06, 0], rot: [Math.PI / 2, 0, 0], scale: [0.92, 0.92, 0.6] });
  b.add(G.cyl(20), '#2a2a30', { pos: [-0.15, H + 1.04, 0], scale: [0.86, 0.02, 0.86] });
  b.add(G.cyl(14), '#f4efe6', { pos: [1.1, 0.64, 0], scale: [0.55, 0.04, 0.55] });
  group.add(mesh(b));
  const crank = new THREE.Group();
  crank.position.set(-0.8, H, 0);
  const c = new Builder();
  c.add(G.cyl(10), BODY, { pos: [-0.08, 0, 0], rot: [0, 0, Math.PI / 2], scale: [0.08, 0.2, 0.08] });
  c.add(G.box(), '#9aa2aa', { pos: [-0.2, 0.35, 0], scale: [0.06, 0.8, 0.1] });
  c.add(G.cyl(12), '#d8402f', { pos: [-0.38, 0.7, 0], rot: [0, 0, Math.PI / 2], scale: [0.08, 0.3, 0.08] });
  crank.add(mesh(c));
  group.add(crank);
  return { group, crank, mouth: new THREE.Vector3(-0.15, H + 1.06, 0), outlet: new THREE.Vector3(0.84, H, 0), dispose: () => {} };
}

// ---------------------------------------------------------------- the piano

export interface Piano {
  group: THREE.Group;
  lid: THREE.Group;
  /** The legs, each about the top of it (the front left one breaks off). */
  legs: THREE.Group[];
  /** How high the underside of the case is off the ground. */
  under: number;
  dispose(): void;
}

/**
 * A black grand piano, keyboard at +z: the case a flat curve (straight along -x, swept round at +x), its lid propped
 * open, three legs and a music stand.
 */
export function grandPiano(): Piano {
  const group = new THREE.Group();
  const under = 0.62;
  const s = new THREE.Shape();
  // In the case's plan, x across and y away from the keyboard.
  s.moveTo(-0.75, 0);
  s.lineTo(0.75, 0);
  s.lineTo(0.75, 0.55);
  s.bezierCurveTo(0.75, 1.1, 0.15, 1.1, 0.0, 1.6);
  s.bezierCurveTo(-0.15, 2.0, -0.5, 2.1, -0.75, 2.05);
  s.lineTo(-0.75, 0);
  const caseGeo = new THREE.ExtrudeGeometry(s, { depth: 0.32, bevelEnabled: true, bevelSize: 0.03, bevelThickness: 0.03, bevelSegments: 2, curveSegments: 10 });
  // Lying flat: the plan's y runs to -z, the depth up.
  caseGeo.rotateX(-Math.PI / 2);
  caseGeo.translate(0, under, 0.2);
  // Inside, under the lid: the gold frame and the strings.
  const inside = new THREE.ShapeGeometry(s, 10);
  inside.rotateX(-Math.PI / 2);
  inside.scale(0.92, 1, 0.92);
  inside.translate(0, under + 0.335, 0.15);
  const b = new Builder();
  b.add(caseGeo, '#24222c');
  b.add(inside, '#c8a060');
  caseGeo.dispose();
  inside.dispose();
  for (let k = 0; k < 9; k++) b.add(G.box(), '#e8dcc0', { pos: [-0.55 + k * 0.1, under + 0.345, -0.6 + Math.abs(k - 4) * 0.05], scale: [0.008, 0.006, 1.3 - Math.abs(k - 4) * 0.12] });
  // The keyboard: a shelf of white keys with black ones on top, in front of the case.
  b.add(G.box(), '#1c1a22', { pos: [0, under + 0.18, 0.38], scale: [1.56, 0.12, 0.36] });
  b.add(G.box(), '#f6f2e8', { pos: [0, under + 0.255, 0.4], scale: [1.4, 0.04, 0.24] });
  for (let k = 0; k < 20; k++) {
    if ([2, 6, 9, 13, 16].includes(k % 21)) continue;
    b.add(G.box(), INK, { pos: [-0.66 + k * 0.07, under + 0.285, 0.36], scale: [0.035, 0.03, 0.14] });
  }
  for (let k = 0; k < 20; k++) b.add(G.box(), '#d8d0c0', { pos: [-0.665 + k * 0.07, under + 0.276, 0.4], scale: [0.004, 0.002, 0.24] });
  b.add(G.box(), '#1c1a22', { pos: [0, under + 0.48, 0.12], rot: [-0.25, 0, 0], scale: [0.7, 0.26, 0.03] });
  // Pedals.
  b.add(G.box(), '#1c1a22', { pos: [0, 0.2, 0.0], scale: [0.06, 0.4, 0.06] });
  b.add(G.box(), BRASS, { pos: [0, 0.03, 0.06], scale: [0.2, 0.02, 0.1] });
  group.add(mesh(b));
  // The lid, hinged along the straight side: turning it about z lifts it open.
  const lid = new THREE.Group();
  lid.position.set(-0.75, under + 0.36, 0);
  const l = new Builder();
  const lidGeo = new THREE.ExtrudeGeometry(s, { depth: 0.03, bevelEnabled: false, curveSegments: 10 });
  lidGeo.rotateX(-Math.PI / 2);
  lidGeo.translate(0.75, 0, 0.2);
  l.add(lidGeo, '#2c2a34');
  lidGeo.dispose();
  lid.add(mesh(l));
  group.add(lid);
  const legs: THREE.Group[] = [];
  for (const [x, z] of [
    [-0.62, 0.15],
    [0.62, 0.15],
    [-0.5, -1.5],
  ]) {
    const leg = new THREE.Group();
    leg.position.set(x, under, z);
    const lb = new Builder();
    lb.add(G.taper(0.7, 10), '#1c1a22', { pos: [0, -under / 2, 0], scale: [0.07, under, 0.07] });
    lb.add(G.cyl(10), BRASS, { pos: [0, -under + 0.04, 0], scale: [0.06, 0.06, 0.06] });
    leg.add(mesh(lb));
    group.add(leg);
    legs.push(leg);
  }
  return { group, lid, legs, under, dispose: () => {} };
}

// ---------------------------------------------------------------- the big green brute

export interface Brute {
  group: THREE.Group;
  /** Above the hips: leans and twists. */
  body: THREE.Group;
  head: THREE.Group;
  /** Shoulders: hanging down at rest, raised by turning about x (forward) and z (out to the side). */
  arms: THREE.Group[];
  /** In each fist. */
  fists: THREE.Object3D[];
  legs: THREE.Group[];
  dispose(): void;
}

/**
 * A huge green brute about three metres tall: a vast chest and shoulders, little legs in ragged brown trousers, a
 * small head with a heavy brow, a shock of black hair and a scowl. Not anybody in particular.
 */
export function brute(): Brute {
  const GREEN = '#5c9a3a';
  const DARK = '#4a8030';
  const group = new THREE.Group();
  const skin = matte();
  const legs: THREE.Group[] = [];
  for (const sx of [-1, 1]) {
    const leg = new THREE.Group();
    leg.position.set(sx * 0.32, 1.05, 0);
    const b = new Builder();
    b.add(G.taper(0.8, 12), '#7a5a3a', { pos: [0, -0.32, 0], scale: [0.3, 0.64, 0.3] });
    for (let k = 0; k < 4; k++) b.add(G.cone(3), '#7a5a3a', { pos: [Math.sin(k * 1.6) * 0.22, -0.68, Math.cos(k * 1.6) * 0.22], rot: [Math.PI, k, 0], scale: [0.08, 0.12, 0.05] });
    b.add(G.taper(0.8, 12), GREEN, { pos: [0, -0.82, 0], scale: [0.2, 0.42, 0.2] });
    b.add(G.sphere(12, 8), GREEN, { pos: [0, -1.0, 0.1], scale: [0.2, 0.09, 0.3] });
    leg.add(b.mesh(skin));
    group.add(leg);
    legs.push(leg);
  }
  const body = new THREE.Group();
  body.position.set(0, 1.1, 0);
  group.add(body);
  const t = new Builder();
  t.add(G.box(), '#7a5a3a', { pos: [0, 0.02, 0], scale: [0.95, 0.24, 0.6] });
  t.add(G.sphere(16, 12), GREEN, { pos: [0, 0.45, 0], scale: [0.55, 0.5, 0.42] });
  t.add(G.sphere(18, 14), GREEN, { pos: [0, 1.05, 0.02], scale: [0.85, 0.62, 0.55] });
  // Chest, belly and shoulders.
  for (const sx of [-1, 1]) {
    t.add(G.sphere(14, 10), DARK, { pos: [sx * 0.3, 1.12, 0.38], scale: [0.34, 0.24, 0.18] });
    t.add(G.sphere(14, 10), GREEN, { pos: [sx * 0.82, 1.38, 0], scale: [0.36, 0.3, 0.36] });
  }
  for (let k = 0; k < 3; k++) for (const sx of [-1, 1]) t.add(G.sphere(8, 6), DARK, { pos: [sx * 0.1, 0.32 + k * 0.17, 0.39], scale: [0.09, 0.07, 0.05] });
  t.add(G.taper(0.8, 12), GREEN, { pos: [0, 1.62, 0.02], scale: [0.26, 0.2, 0.26] });
  body.add(t.mesh(skin));
  const head = new THREE.Group();
  head.position.set(0, 1.75, 0.08);
  const h = new Builder();
  h.add(G.sphere(14, 12), GREEN, { pos: [0, 0.18, 0], scale: [0.27, 0.3, 0.27] });
  h.add(G.rbox(0.4), GREEN, { pos: [0, 0.06, 0.12], scale: [0.4, 0.2, 0.28] });
  h.add(G.rbox(0.4), DARK, { pos: [0, 0.27, 0.22], rot: [0.2, 0, 0], scale: [0.44, 0.08, 0.12] });
  for (const sx of [-1, 1]) {
    h.add(G.sphere(8, 6), '#ffffff', { pos: [sx * 0.1, 0.21, 0.24], scale: [0.045, 0.03, 0.02] });
    h.add(G.sphere(8, 6), INK, { pos: [sx * 0.1, 0.21, 0.255], scale: 0.017 });
    h.add(G.sphere(8, 6), GREEN, { pos: [sx * 0.28, 0.17, 0], scale: [0.04, 0.07, 0.05] });
  }
  h.add(G.box(), '#f4efe6', { pos: [0, 0.03, 0.26], scale: [0.2, 0.04, 0.02] });
  h.add(G.box(), INK, { pos: [0, 0.05, 0.255], scale: [0.24, 0.015, 0.02] });
  for (let k = 0; k < 9; k++) h.add(G.cone(4), INK, { pos: [Math.sin(k * 0.9 - 3.6) * 0.22, 0.4 + (k % 2) * 0.03, Math.cos(k * 0.9 - 3.6) * 0.18 - 0.04], rot: [Math.cos(k * 0.9) * 0.5, 0, Math.sin(k * 0.9 - 3.6) * 0.6], scale: [0.08, 0.16, 0.08] });
  head.add(h.mesh(skin));
  body.add(head);
  const arms: THREE.Group[] = [];
  const fists: THREE.Object3D[] = [];
  for (const sx of [-1, 1]) {
    const arm = new THREE.Group();
    arm.position.set(sx * 0.88, 1.4, 0);
    const a = new Builder();
    a.add(G.sphere(14, 10), GREEN, { pos: [sx * 0.05, -0.38, 0], scale: [0.26, 0.42, 0.26] });
    a.add(G.sphere(14, 10), GREEN, { pos: [sx * 0.05, -0.9, 0.02], scale: [0.22, 0.38, 0.22] });
    a.add(G.sphere(12, 10), DARK, { pos: [sx * 0.05, -1.3, 0.04], scale: [0.22, 0.2, 0.22] });
    arm.add(a.mesh(skin));
    body.add(arm);
    arms.push(arm);
    const fist = new THREE.Object3D();
    fist.position.set(sx * 0.05, -1.38, 0.05);
    arm.add(fist);
    fists.push(fist);
  }
  return { group, body, head, arms, fists, legs, dispose: () => skin.dispose() };
}
