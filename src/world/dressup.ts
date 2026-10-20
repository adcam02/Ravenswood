import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { Builder, soft, type Vec3 } from './build';
import type { BackId, FaceId, NeckId } from './types';

/**
 * Dress-up, free for everyone: something on the face, something round the neck, something on the back.
 * Each piece is built for the animal wearing it (where its eyes, nose, neck and back are), as one
 * vertex-coloured mesh, so a full outfit costs at most three extra draw calls.
 */

export interface FaceFit {
  /** Neck space: half the gap between the eyes, their height, how big they are, and where their fronts are. */
  eyeX: number;
  eyeY: number;
  eyeR: number;
  eyeZ: number;
  /** The tip of the nose, if there is one. */
  nose: Vec3 | null;
  /** The head's centre and radii, neck space. */
  hc: Vec3;
  hr: Vec3;
  /** The eyes stand clear of the head (the snail's stalks): no arms or band round the head. */
  floating?: boolean;
}

export interface NeckFit {
  /** Body space: the middle of the ring round the neck, and its radius. */
  centre: Vec3;
  r: number;
  /** Tip the ring forward (radians), so it sits lower at the front. */
  tilt?: number;
}

export interface BackFit {
  /** Body space: the middle of the torso, its half-width and half-depth, and where the shoulders and hips are. */
  centre: Vec3;
  r: number;
  depth: number;
  top: number;
  bottom: number;
  /** Body space height of the top of the head, for the balloon. */
  headTop: number;
}

export interface BuiltPiece {
  group: THREE.Group;
  /** Meshes that turn ghostly with the wearer, and their own materials. */
  solid: { mesh: THREE.Mesh; material: THREE.Material | THREE.Material[] }[];
  materials: THREE.Material[];
  /** Gentle motion: the cape and balloon trail, wings beat. */
  update?: (t: number, dt: number, speed: number) => void;
}

/** The storybook material every animal wears, with a few extra settings (two-sided cloth, see-through wings). */
function softWith(opts: { side?: THREE.Side; transparent?: boolean; opacity?: number; depthWrite?: boolean } = {}): THREE.Material {
  const m = soft();
  if (opts.side !== undefined) m.side = opts.side;
  if (opts.transparent) {
    m.transparent = true;
    m.opacity = opts.opacity ?? 1;
  }
  if (opts.depthWrite !== undefined) m.depthWrite = opts.depthWrite;
  return m;
}

const sph = (w: number, h: number) => new THREE.SphereGeometry(1, w, h);
const cyl = (n: number, top = 1, bottom = 1) => new THREE.CylinderGeometry(top, bottom, 1, n);

/** A cylinder from one point to another. */
function rod(b: Builder, color: THREE.ColorRepresentation, from: Vec3, to: Vec3, r: number, n = 8) {
  const a = new THREE.Vector3(...from);
  const c = new THREE.Vector3(...to);
  const d = c.clone().sub(a);
  const g = cyl(n);
  b.add(g, color, new THREE.Matrix4().compose(a.add(c).multiplyScalar(0.5), new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.clone().normalize()), new THREE.Vector3(r, d.length(), r)));
  g.dispose();
}

/** A tube along a smooth curve through the points. */
function tube(b: Builder, color: THREE.ColorRepresentation, pts: Vec3[], r: number, segs = 20, radial = 6, matrix?: THREE.Matrix4) {
  const curve = new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p)));
  const g = new THREE.TubeGeometry(curve, segs, r, radial, false);
  b.add(g, color, matrix ?? new THREE.Matrix4());
  g.dispose();
}

function heartShape(s = 1): THREE.Shape {
  const h = new THREE.Shape();
  h.moveTo(0, -0.9 * s);
  h.bezierCurveTo(-0.15 * s, -0.7 * s, -1.0 * s, -0.25 * s, -1.0 * s, 0.25 * s);
  h.bezierCurveTo(-1.0 * s, 0.8 * s, -0.25 * s, 0.95 * s, 0, 0.45 * s);
  h.bezierCurveTo(0.25 * s, 0.95 * s, 1.0 * s, 0.8 * s, 1.0 * s, 0.25 * s);
  h.bezierCurveTo(1.0 * s, -0.25 * s, 0.15 * s, -0.7 * s, 0, -0.9 * s);
  return h;
}

function finish(b: Builder, opts: { material?: THREE.Material; update?: BuiltPiece['update']; crease?: number } = {}): BuiltPiece {
  const group = new THREE.Group();
  const material = opts.material ?? soft();
  const mesh = b.mesh(material, { cast: true, receive: false, crease: opts.crease });
  group.add(mesh);
  return { group, solid: [{ mesh, material }], materials: [material], update: opts.update };
}

/** How far out from the head's centre its surface is, sideways, at a height `dy` above the centre. */
const headSide = (f: FaceFit, dy: number) => f.hr[0] * Math.sqrt(Math.max(0.05, 1 - (dy / f.hr[1]) ** 2));

// ---------------------------------------------------------------- the face

/** The arms of a pair of glasses, from the outer edge of each rim back along the side of the head. */
function glassesArms(b: Builder, f: FaceFit, color: THREE.ColorRepresentation, rimR: number, r = 0.008) {
  if (f.floating) return;
  const dy = f.eyeY - f.hc[1];
  const side = headSide(f, dy) + 0.012;
  for (const s of [-1, 1]) {
    const from: Vec3 = [s * (f.eyeX + rimR * 0.95), f.eyeY + 0.005, f.eyeZ - 0.005];
    const to: Vec3 = [s * Math.max(side, f.eyeX + rimR), f.eyeY + 0.012, f.hc[2] - f.hr[2] * 0.15];
    rod(b, color, from, to, r, 6);
  }
}

function glasses(f: FaceFit): BuiltPiece {
  const b = new Builder();
  const frame = '#4a3226';
  const R = Math.max(0.05, f.eyeR * 1.35);
  const ring = new THREE.TorusGeometry(1, 0.11, 8, 30);
  for (const s of [-1, 1]) b.add(ring, frame, { pos: [s * f.eyeX, f.eyeY, f.eyeZ + 0.01], scale: [R, R, R] });
  ring.dispose();
  // The bridge arches over the nose.
  const gap = Math.max(0.005, f.eyeX - R);
  tube(b, frame, [[-gap - 0.004, f.eyeY + R * 0.25, f.eyeZ + 0.012], [0, f.eyeY + R * 0.45, f.eyeZ + 0.022], [gap + 0.004, f.eyeY + R * 0.25, f.eyeZ + 0.012]], 0.008, 10, 6);
  glassesArms(b, f, frame, R);
  return finish(b);
}

function shades(f: FaceFit): BuiltPiece {
  const b = new Builder();
  const frame = '#1b1820';
  const W = Math.max(0.06, f.eyeR * 1.5);
  const H = W * 0.8;
  for (const s of [-1, 1]) {
    const x = s * f.eyeX;
    // A dark rounded lens with a glint across it, under a straight top bar.
    b.add(sph(18, 10), '#1e1a26', { pos: [x, f.eyeY - H * 0.08, f.eyeZ + 0.012], scale: [W, H, 0.014] });
    b.add(new THREE.BoxGeometry(1, 1, 1), '#d8e6f6', { pos: [x - W * 0.25, f.eyeY + H * 0.25, f.eyeZ + 0.026], rot: [0, 0, -0.6], scale: [W * 0.5, 0.008, 0.004] });
  }
  b.add(new RoundedBoxGeometry(1, 1, 1, 2, 0.4), frame, { pos: [0, f.eyeY + H * 0.62, f.eyeZ + 0.014], scale: [(f.eyeX + W) * 2.02, 0.022, 0.02] });
  glassesArms(b, f, frame, W, 0.009);
  return finish(b);
}

function hearts(f: FaceFit): BuiltPiece {
  const b = new Builder();
  const S = Math.max(0.05, f.eyeR * 1.4);
  const outer = new THREE.ExtrudeGeometry(heartShape(1), { depth: 0.18, bevelEnabled: true, bevelThickness: 0.06, bevelSize: 0.06, bevelSegments: 2, curveSegments: 10 });
  const inner = new THREE.ExtrudeGeometry(heartShape(0.72), { depth: 0.12, bevelEnabled: false, curveSegments: 10 });
  for (const s of [-1, 1]) {
    const x = s * f.eyeX;
    b.add(outer, '#e8306a', { pos: [x, f.eyeY, f.eyeZ + 0.004], scale: [S, S, S * 0.12] });
    b.add(inner, '#ff8fb8', { pos: [x, f.eyeY, f.eyeZ + 0.012], scale: [S, S, S * 0.12] });
    b.add(sph(8, 6), '#ffffff', { pos: [x - S * 0.38, f.eyeY + S * 0.32, f.eyeZ + 0.03], scale: [S * 0.16, S * 0.1, 0.005] });
  }
  outer.dispose();
  inner.dispose();
  const gap = Math.max(0.005, f.eyeX - S);
  rod(b, '#e8306a', [-gap - 0.004, f.eyeY + S * 0.3, f.eyeZ + 0.012], [gap + 0.004, f.eyeY + S * 0.3, f.eyeZ + 0.012], 0.008, 6);
  glassesArms(b, f, '#e8306a', S);
  return finish(b);
}

function monocle(f: FaceFit): BuiltPiece {
  const b = new Builder();
  const gold = '#d8a83a';
  // On the right eye (the animal's right: -x), with a chain looping down the side of the face.
  const R = Math.max(0.05, f.eyeR * 1.4);
  const x = -f.eyeX;
  const ringGeo = new THREE.TorusGeometry(1, 0.13, 8, 32);
  b.add(ringGeo, gold, { pos: [x, f.eyeY, f.eyeZ + 0.012], scale: [R, R, R] });
  ringGeo.dispose();
  b.add(sph(10, 6), '#cfe6f2', { pos: [x, f.eyeY, f.eyeZ + 0.006], scale: [R * 0.9, R * 0.9, 0.004] });
  const out = f.floating ? 0.04 : headSide(f, f.eyeY - f.hc[1] - 0.12) + 0.02;
  tube(
    b,
    gold,
    [
      [x - R * 0.7, f.eyeY - R * 0.7, f.eyeZ + 0.01],
      [x - R * 1.1, f.eyeY - R * 2.2, f.eyeZ - 0.01],
      [-out, f.eyeY - 0.2, f.hc[2] + f.hr[2] * 0.2],
      [-out * 0.98, f.eyeY - 0.12, f.hc[2] - f.hr[2] * 0.1],
    ],
    0.0045,
    24,
    5,
  );
  return finish(b);
}

function moustache(f: FaceFit): BuiltPiece {
  const b = new Builder();
  const brown = '#4a2e22';
  const k = THREE.MathUtils.clamp(f.hr[0] / 0.28, 0.6, 1.2);
  const n: Vec3 = f.nose ?? [0, f.hc[1] - 0.05, f.hc[2] + f.hr[2] * 0.97];
  const y = n[1] - 0.035 * k;
  const z = n[2] - 0.006;
  // Two curls sweeping out from under the nose and rolling up at the tips.
  for (const s of [-1, 1]) {
    const pts: Vec3[] = [
      [s * 0.006 * k, y, z],
      [s * 0.04 * k, y - 0.012 * k, z - 0.004],
      [s * 0.085 * k, y - 0.006 * k, z - 0.018 * k],
      [s * 0.115 * k, y + 0.022 * k, z - 0.03 * k],
      [s * 0.1 * k, y + 0.042 * k, z - 0.032 * k],
      [s * 0.082 * k, y + 0.03 * k, z - 0.028 * k],
    ];
    tube(b, brown, pts, 0.017 * k, 26, 8);
    b.add(sph(8, 6), brown, { pos: pts[pts.length - 1], scale: 0.016 * k });
  }
  b.add(sph(10, 8), brown, { pos: [0, y, z], scale: [0.022 * k, 0.018 * k, 0.016 * k] });
  return finish(b);
}

function mask(f: FaceFit): BuiltPiece {
  const b = new Builder();
  const cloth = '#2a2434';
  const R = Math.max(0.05, f.eyeR * 1.55);
  // A fat flattened ring round each eye, joined over the nose, then a band round the head knotted at the back.
  const ringGeo = new THREE.TorusGeometry(1, 0.42, 10, 30);
  for (const s of [-1, 1]) b.add(ringGeo, cloth, { pos: [s * f.eyeX, f.eyeY, f.eyeZ + 0.004], rot: [0, s * 0.18, 0], scale: [R, R * 0.82, R * 0.35] });
  ringGeo.dispose();
  const gap = Math.max(0.005, f.eyeX - R);
  b.add(sph(12, 8), cloth, { pos: [0, f.eyeY + R * 0.15, f.eyeZ + 0.008], scale: [gap + R * 0.4, R * 0.45, R * 0.25] });
  if (!f.floating) {
    const dy = f.eyeY - f.hc[1];
    const side = headSide(f, dy) + 0.01;
    const band = new THREE.TorusGeometry(1, 0.035, 6, 40);
    b.add(band, cloth, { pos: [0, f.eyeY, f.hc[2]], rot: [Math.PI / 2, 0, 0], scale: [side, f.hr[2] * Math.sqrt(Math.max(0.05, 1 - (dy / f.hr[1]) ** 2)) + 0.012, side] });
    band.dispose();
    const back = f.hc[2] - f.hr[2] * Math.sqrt(Math.max(0.05, 1 - (dy / f.hr[1]) ** 2)) - 0.008;
    b.add(sph(8, 6), cloth, { pos: [0, f.eyeY, back], scale: 0.025 });
    for (const s of [-1, 1]) b.add(new RoundedBoxGeometry(1, 1, 1, 1, 0.3), cloth, { pos: [s * 0.03, f.eyeY - 0.06, back - 0.012], rot: [0.2, 0, s * 0.35], scale: [0.03, 0.11, 0.008] });
  }
  return finish(b);
}

const FACE_MAKERS: Record<FaceId, (f: FaceFit) => BuiltPiece> = { glasses, shades, hearts, monocle, moustache, mask };

export function buildFace(face: FaceId, fit: FaceFit): BuiltPiece | null {
  return FACE_MAKERS[face]?.(fit) ?? null;
}

// ---------------------------------------------------------------- round the neck

/** A matrix for a point on the neck ring at angle `a` (0 at the front), lying on the ring's tilted plane. */
function onRing(f: NeckFit, a: number, out = 0, dy = 0): THREE.Vector3 {
  const tilt = f.tilt ?? 0;
  const x = Math.sin(a) * (f.r + out);
  const zl = Math.cos(a) * (f.r + out);
  // Tip forward about x: the front sits lower.
  return new THREE.Vector3(x, f.centre[1] + dy - Math.sin(tilt) * zl, f.centre[2] + Math.cos(tilt) * zl);
}

function ringBand(b: Builder, f: NeckFit, color: THREE.ColorRepresentation, tube: number, out = 0, radial = 6, tubular = 36) {
  const g = new THREE.TorusGeometry(1, tube / (f.r + out), radial, tubular);
  b.add(g, color, { pos: f.centre, rot: [Math.PI / 2 + (f.tilt ?? 0), 0, 0], scale: [f.r + out, f.r + out, f.r + out] });
  g.dispose();
}

function bowtie(f: NeckFit): BuiltPiece {
  const b = new Builder();
  const red = '#c8303a';
  const k = f.r / 0.16;
  ringBand(b, f, '#e8e0d0', 0.008);
  const p = onRing(f, 0, 0.012);
  for (const s of [-1, 1]) {
    // Each wing is a cone lying on its side, its point at the knot.
    b.add(cyl(16, 0.2, 1), red, { pos: [p.x + s * 0.045 * k, p.y, p.z], rot: [0, 0, (s * Math.PI) / 2], scale: [0.04 * k, 0.07 * k, 0.018 * k] });
    for (const [dx, dy] of [
      [0.055, 0.014],
      [0.04, -0.016],
      [0.07, -0.004],
    ]) {
      b.add(sph(6, 4), '#fbf8f2', { pos: [p.x + s * dx * k, p.y + dy * k, p.z + 0.016 * k], scale: [0.007 * k, 0.007 * k, 0.003] });
    }
  }
  b.add(sph(12, 8), '#a8242e', { pos: [p.x, p.y, p.z + 0.006], scale: [0.02 * k, 0.024 * k, 0.018 * k] });
  return finish(b);
}

function scarf(f: NeckFit): BuiltPiece {
  const b = new Builder();
  const k = f.r / 0.16;
  const a = '#3a8a5a';
  const c = '#f2e4c8';
  // A thick knitted ring in stripes, with two ends hanging down the front, fringed.
  const arcs = 10;
  for (let i = 0; i < arcs; i++) {
    const g = new THREE.TorusGeometry(1, 0.26, 8, 6, (Math.PI * 2) / arcs + 0.02);
    b.add(g, i % 2 ? c : a, { pos: f.centre, rot: [Math.PI / 2 + (f.tilt ?? 0), 0, (i / arcs) * Math.PI * 2], scale: [f.r + 0.012, f.r + 0.012, (f.r + 0.012) * 0.9] });
    g.dispose();
  }
  const top = onRing(f, -0.45, 0.03);
  for (const [s, len, swing] of [
    [0, 0.22, 0.08],
    [1, 0.17, -0.12],
  ] as const) {
    const x = top.x + s * 0.05 * k;
    const y = top.y - 0.02;
    const z = top.z + 0.01;
    const L = len * k;
    for (let j = 0; j < 4; j++) {
      b.add(new RoundedBoxGeometry(1, 1, 1, 1, 0.3), j % 2 ? c : a, { pos: [x + Math.sin(swing) * (j + 0.5) * (L / 4), y - (j + 0.5) * (L / 4), z], rot: [0.12, 0, swing], scale: [0.06 * k, L / 4 + 0.004, 0.022 * k] });
    }
    for (let t = 0; t < 4; t++) {
      const tx = x + Math.sin(swing) * L - 0.022 * k + t * 0.015 * k;
      rod(b, a, [tx, y - L, z], [tx + Math.sin(swing) * 0.03, y - L - 0.04 * k, z + 0.004], 0.0045 * k, 5);
    }
  }
  return finish(b);
}

function bandana(f: NeckFit): BuiltPiece {
  const b = new Builder();
  const red = '#d8403a';
  const k = f.r / 0.16;
  ringBand(b, f, red, 0.014, 0.004);
  // The triangle hangs over the chest, dotted, and the knot sits at the back.
  const p = onRing(f, 0, 0.01);
  const tri = new THREE.Shape();
  tri.moveTo(-0.11, 0);
  tri.lineTo(0.11, 0);
  tri.lineTo(0, -0.13);
  tri.closePath();
  const g = new THREE.ExtrudeGeometry(tri, { depth: 0.01, bevelEnabled: true, bevelThickness: 0.004, bevelSize: 0.008, bevelSegments: 2 });
  b.add(g, red, { pos: [p.x, p.y + 0.01 * k, p.z], rot: [-0.25, 0, 0], scale: [k, k, k] });
  g.dispose();
  for (const [dx, dy] of [
    [-0.05, -0.02],
    [0.05, -0.02],
    [0, -0.05],
    [-0.025, -0.08],
    [0.025, -0.08],
    [0, -0.015],
  ]) {
    b.add(sph(6, 4), '#fbf8f2', { pos: [p.x + dx * k, p.y + (0.01 + dy) * k + dy * 0.25 * k, p.z + 0.02 * k + dy * 0.25 * k], scale: [0.009 * k, 0.009 * k, 0.003] });
  }
  const back = onRing(f, Math.PI, 0.01);
  b.add(sph(10, 7), '#b8302a', { pos: [back.x, back.y, back.z], scale: 0.022 * k });
  for (const s of [-1, 1]) b.add(cyl(10, 0.3, 1), red, { pos: [back.x + s * 0.02 * k, back.y - 0.035 * k, back.z - 0.01], rot: [-0.3, 0, s * 0.4], scale: [0.016 * k, 0.06 * k, 0.008 * k] });
  return finish(b);
}

function bellCollar(f: NeckFit): BuiltPiece {
  const b = new Builder();
  const k = f.r / 0.16;
  ringBand(b, f, '#3a6ad8', 0.016, 0.004, 8, 40);
  const p = onRing(f, 0, 0.03);
  const gold = '#e8b83a';
  b.add(sph(16, 12), gold, { pos: [p.x, p.y - 0.035 * k, p.z], scale: 0.036 * k });
  b.add(new THREE.BoxGeometry(1, 1, 1), '#6a4a12', { pos: [p.x, p.y - 0.045 * k, p.z + 0.033 * k], scale: [0.04 * k, 0.006, 0.006] });
  b.add(sph(6, 4), '#6a4a12', { pos: [p.x, p.y - 0.06 * k, p.z + 0.026 * k], scale: 0.008 * k });
  const loop = new THREE.TorusGeometry(1, 0.3, 6, 14);
  b.add(loop, gold, { pos: [p.x, p.y - 0.002, p.z - 0.004], scale: 0.014 * k });
  loop.dispose();
  return finish(b);
}

function lei(f: NeckFit): BuiltPiece {
  const b = new Builder();
  const k = f.r / 0.16;
  const fit: NeckFit = { ...f, tilt: (f.tilt ?? 0) + 0.35 };
  const colours = ['#f05a7a', '#f6c445', '#f08a3a', '#c7a3e8', '#f05a7a', '#fbf8f2', '#f08a3a', '#f6c445'];
  const n = 8;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const c = onRing(fit, a, 0.012);
    const out = new THREE.Vector3(Math.sin(a), 0.5, Math.cos(a)).normalize();
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), out);
    const right = new THREE.Vector3(1, 0, 0).applyQuaternion(q);
    const up = new THREE.Vector3(0, 1, 0).applyQuaternion(q);
    for (let p = 0; p < 5; p++) {
      const pa = (p / 5) * Math.PI * 2 + i;
      const pos = c.clone().addScaledVector(right, Math.cos(pa) * 0.022 * k).addScaledVector(up, Math.sin(pa) * 0.022 * k);
      b.add(sph(6, 4), colours[i], new THREE.Matrix4().compose(pos, q, new THREE.Vector3(0.022 * k, 0.022 * k, 0.008 * k)));
    }
    b.add(sph(6, 4), '#f6e07a', new THREE.Matrix4().compose(c.clone().addScaledVector(out, 0.008 * k), q, new THREE.Vector3(0.01 * k, 0.01 * k, 0.012 * k)));
    const la = a + Math.PI / n;
    const lp = onRing(fit, la, 0.006);
    b.add(sph(6, 4), '#4f9a4a', new THREE.Matrix4().compose(lp, new THREE.Quaternion().setFromEuler(new THREE.Euler(0, la, 0.8)), new THREE.Vector3(0.03 * k, 0.01 * k, 0.014 * k)));
  }
  return finish(b);
}

function pearls(f: NeckFit): BuiltPiece {
  const b = new Builder();
  const k = f.r / 0.16;
  const fit: NeckFit = { ...f, tilt: (f.tilt ?? 0) + 0.3 };
  const n = 22;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const p = onRing(fit, a, 0.012);
    b.add(sph(7, 5), i % 2 ? '#f6f0e6' : '#ece4dc', { pos: [p.x, p.y, p.z], scale: 0.016 * k });
  }
  const front = onRing(fit, 0, 0.018);
  b.add(sph(12, 9), '#f8f2ea', { pos: [front.x, front.y - 0.03 * k, front.z + 0.004], scale: [0.022 * k, 0.027 * k, 0.022 * k] });
  b.add(sph(7, 5), '#d8b84a', { pos: [front.x, front.y - 0.006 * k, front.z + 0.004], scale: 0.009 * k });
  return finish(b);
}

const NECK_MAKERS: Record<NeckId, (f: NeckFit) => BuiltPiece> = { bowtie, scarf, bandana, bell: bellCollar, lei, pearls };

export function buildNeck(neck: NeckId, fit: NeckFit): BuiltPiece | null {
  return NECK_MAKERS[neck]?.(fit) ?? null;
}

// ---------------------------------------------------------------- on the back

const backZ = (f: BackFit) => f.centre[2] - f.depth;

function backpack(f: BackFit): BuiltPiece {
  const b = new Builder();
  const k = THREE.MathUtils.clamp(f.r / 0.2, 0.7, 1.3);
  const bag = '#e8a83a';
  const strap = '#8a5a2a';
  const z = backZ(f) - 0.05 * k;
  const y = (f.top + f.bottom) / 2 + 0.02;
  b.add(new RoundedBoxGeometry(1, 1, 1, 3, 0.25), bag, { pos: [0, y, z], scale: [0.26 * k, 0.28 * k, 0.12 * k] });
  b.add(new RoundedBoxGeometry(1, 1, 1, 2, 0.3), '#d8962a', { pos: [0, y + 0.08 * k, z - 0.035 * k], rot: [-0.25, 0, 0], scale: [0.27 * k, 0.13 * k, 0.07 * k] });
  b.add(new RoundedBoxGeometry(1, 1, 1, 2, 0.3), '#d8962a', { pos: [0, y - 0.07 * k, z - 0.06 * k], scale: [0.16 * k, 0.09 * k, 0.04 * k] });
  for (const s of [-1, 1]) {
    b.add(new THREE.BoxGeometry(1, 1, 1), '#5a3a1e', { pos: [s * 0.06 * k, y + 0.02 * k, z - 0.075 * k], scale: [0.025 * k, 0.07 * k, 0.008] });
    b.add(new THREE.BoxGeometry(1, 1, 1), '#e8c26a', { pos: [s * 0.06 * k, y - 0.01 * k, z - 0.08 * k], scale: [0.03 * k, 0.018 * k, 0.006] });
    // Straps over each shoulder, round to the front.
    tube(
      b,
      strap,
      [
        [s * 0.07 * k, y + 0.12 * k, z + 0.04 * k],
        [s * 0.09 * k, f.top + 0.03, f.centre[2] - f.depth * 0.4],
        [s * 0.1 * k, f.top + 0.02, f.centre[2] + f.depth * 0.5],
        [s * 0.12 * k, f.top - 0.12, f.centre[2] + f.depth * 0.95],
        [s * 0.13 * k, y - 0.08 * k, f.centre[2] + f.depth * 0.6],
        [s * 0.11 * k, y - 0.1 * k, z + 0.05 * k],
      ],
      0.013 * k,
      20,
      5,
    );
  }
  return finish(b);
}

function cape(f: BackFit): BuiltPiece {
  const b = new Builder();
  const red = '#b8303a';
  const lining = '#e8c26a';
  const top = f.top + 0.02;
  const H = top - Math.max(0.06, f.bottom - 0.08);
  const r0 = f.r * 0.85;
  const r1 = f.r * 1.45;
  const arc = Math.PI * 1.15;
  // Hung from a pivot at the shoulders so it can trail behind; outer cloth and a gold lining inside.
  const outer = new THREE.CylinderGeometry(r0, r1, H, 28, 4, true, Math.PI - arc / 2, arc);
  b.add(outer, red, { pos: [0, -H / 2, 0] });
  const inner = new THREE.CylinderGeometry(r0 * 0.97, r1 * 0.97, H, 28, 4, true, Math.PI - arc / 2, arc);
  b.add(inner, lining, { pos: [0, -H / 2, 0], scale: [-1, 1, 1] });
  outer.dispose();
  inner.dispose();
  // A rolled hem along the bottom edge, following the cloth's own curve, then a collar and a gold clasp.
  const hemPts: Vec3[] = [];
  for (let i = 0; i <= 16; i++) {
    const th = Math.PI - arc / 2 + (i / 16) * arc;
    hemPts.push([Math.sin(th) * r1, -H, Math.cos(th) * r1]);
  }
  tube(b, '#9a2830', hemPts, 0.012, 40, 5);
  const collar = new THREE.TorusGeometry(1, 0.12, 6, 30);
  b.add(collar, red, { pos: [0, 0.01, 0], rot: [Math.PI / 2, 0, 0], scale: [r0 * 0.95, r0 * 0.95, r0] });
  collar.dispose();
  b.add(sph(12, 8), '#e8c26a', { pos: [0, 0.0, r0 * 0.95], scale: 0.026 });
  const material = softWith({ side: THREE.DoubleSide });
  const built = finish(b, { material });
  const pivot = new THREE.Group();
  pivot.position.set(0, top, f.centre[2]);
  pivot.add(built.solid[0].mesh);
  built.group.add(pivot);
  let flow = 0;
  built.update = (t, dt, speed) => {
    flow += (Math.min(speed, 5) - flow) * Math.min(1, dt * 3);
    pivot.rotation.x = -(0.06 + flow * 0.075) + Math.sin(t * 2.3) * 0.03 * (1 + flow * 0.4);
    pivot.rotation.z = Math.sin(t * 1.7) * 0.025;
  };
  return built;
}

/** Wings as one instanced mesh of two (the left a mirror of the right), so each can beat on its own. */
function pairedWings(f: BackFit, geo: THREE.BufferGeometry, material: THREE.Material, pivotX: number, beat: (t: number, speed: number) => number, rest: number): BuiltPiece {
  const group = new THREE.Group();
  const mesh = new THREE.InstancedMesh(geo, material, 2);
  mesh.castShadow = true;
  mesh.frustumCulled = false;
  group.add(mesh);
  const y = f.top - 0.04;
  const z = backZ(f) + 0.02;
  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const e = new THREE.Euler();
  const pos = new THREE.Vector3();
  const scl = new THREE.Vector3();
  let flow = 0;
  const update = (t: number, dt: number, speed: number) => {
    flow += (Math.min(speed, 5) - flow) * Math.min(1, dt * 3);
    const a = rest + beat(t, flow);
    for (const s of [-1, 1]) {
      pos.set(s * pivotX, y, z);
      e.set(0, s * a, 0);
      q.setFromEuler(e);
      scl.set(s, 1, 1);
      m.compose(pos, q, scl);
      mesh.setMatrixAt(s < 0 ? 0 : 1, m);
    }
    mesh.instanceMatrix.needsUpdate = true;
  };
  update(0, 0, 0);
  return { group, solid: [{ mesh, material }], materials: [material], update };
}

function wings(f: BackFit): BuiltPiece {
  const b = new Builder();
  const k = THREE.MathUtils.clamp(f.r / 0.2, 0.75, 1.25);
  // A right wing (+x), swept back and up: rows of soft feathers, longest at the bottom tip.
  const feathers = [
    [0.05, 0.06, 0.07, 0.035, -0.3],
    [0.1, 0.07, 0.085, 0.035, -0.55],
    [0.15, 0.06, 0.1, 0.033, -0.8],
    [0.19, 0.03, 0.11, 0.03, -1.05],
    [0.08, 0.1, 0.06, 0.03, 0.2],
    [0.13, 0.11, 0.06, 0.028, 0.0],
  ];
  for (const [x, y, len, w, rz] of feathers) {
    b.add(sph(10, 6), y > 0.09 ? '#ffffff' : '#f4f0ff', { pos: [x * k, y * k, -0.04 * k], rot: [0.25, 0, rz], scale: [w * k, len * k, 0.014 * k] });
  }
  b.add(sph(10, 7), '#ffffff', { pos: [0.05 * k, 0.1 * k, -0.03 * k], rot: [0.25, 0, -0.6], scale: [0.07 * k, 0.04 * k, 0.025 * k] });
  const geo = b.geometry();
  const material = softWith({ side: THREE.DoubleSide });
  return pairedWings(f, geo, material, 0.04 * k, (t, flow) => Math.sin(t * (3 + flow * 1.5)) * (0.18 + flow * 0.04), 0.35);
}

function butterfly(f: BackFit): BuiltPiece {
  const b = new Builder();
  const k = THREE.MathUtils.clamp(f.r / 0.2, 0.75, 1.25);
  // An upper and a lower wing, each a coloured disc with a lighter middle and dark edge spots.
  const disc = new THREE.CircleGeometry(1, 24);
  const layers: [Vec3, Vec3, number, string][] = [
    [[0.13, 0.11, 0], [0.14, 0.1, 1], 0.5, '#3a7ad8'],
    [[0.12, 0.11, 0.003], [0.1, 0.07, 1], 0.5, '#7ac8f0'],
    [[0.1, -0.04, 0], [0.09, 0.075, 1], -0.5, '#3a7ad8'],
    [[0.095, -0.04, 0.003], [0.06, 0.05, 1], -0.5, '#f6a8d8'],
  ];
  for (const [p, s, rz, c] of layers) b.add(disc, c, { pos: [p[0] * k, p[1] * k, p[2]], rot: [0, 0, rz], scale: [s[0] * k, s[1] * k, 1] });
  for (const [x, y] of [
    [0.22, 0.16],
    [0.24, 0.1],
    [0.15, -0.08],
  ]) {
    b.add(disc, '#1e1a2a', { pos: [x * k, y * k, 0.005], scale: [0.016 * k, 0.016 * k, 1] });
  }
  disc.dispose();
  const geo = b.geometry(0);
  const material = softWith({ side: THREE.DoubleSide, transparent: true, opacity: 0.82, depthWrite: false });
  return pairedWings(f, geo, material, 0.02 * k, (t, flow) => Math.abs(Math.sin(t * (7 + flow * 2))) * 0.9, 0.25);
}

function balloon(f: BackFit): BuiltPiece {
  const b = new Builder();
  const red = '#e8304a';
  const tieY = (f.top + f.bottom) / 2 + 0.04;
  const z = backZ(f) - 0.01;
  const rise = f.headTop + 0.9 - tieY;
  const R = 0.17;
  // A heart balloon on a long string, all hung from the tie on the back so it can sway as one.
  rod(b, '#f6f0e6', [0, 0, 0], [0, rise - R * 0.9, -0.08], 0.004, 5);
  const heart = new THREE.ExtrudeGeometry(heartShape(1), { depth: 0.55, bevelEnabled: true, bevelThickness: 0.35, bevelSize: 0.25, bevelSegments: 4, curveSegments: 14 });
  heart.translate(0, 0, -0.275);
  b.add(heart, red, { pos: [0, rise, -0.08], scale: [R, R, R * 0.55] });
  heart.dispose();
  b.add(cyl(10, 0.3, 1), '#c8243a', { pos: [0, rise - R * 0.95, -0.08], scale: [0.02, 0.03, 0.02] });
  b.add(sph(8, 6), '#ffffff', { pos: [-R * 0.42, rise + R * 0.38, -0.08 + R * 0.38], scale: [0.03, 0.045, 0.012] });
  const built = finish(b, { crease: 60 });
  const pivot = new THREE.Group();
  pivot.position.set(0, tieY, z);
  pivot.add(built.solid[0].mesh);
  built.group.add(pivot);
  let flow = 0;
  built.update = (t, dt, speed) => {
    flow += (Math.min(speed, 5) - flow) * Math.min(1, dt * 2);
    pivot.rotation.x = -0.12 - flow * 0.06 + Math.sin(t * 1.1) * 0.05;
    pivot.rotation.z = Math.sin(t * 0.8) * 0.07;
    pivot.position.y = tieY + Math.sin(t * 1.6) * 0.01;
  };
  return built;
}

function satchel(f: BackFit): BuiltPiece {
  const b = new Builder();
  const k = THREE.MathUtils.clamp(f.r / 0.2, 0.7, 1.3);
  const leather = '#9a6a3a';
  // A strap from the right shoulder across the chest to the left hip, and the bag hanging there.
  const strap = new THREE.TorusGeometry(1, 0.05, 6, 40);
  const cy = (f.top + f.bottom) / 2;
  b.add(strap, '#7a4e26', { pos: [0, cy + 0.02, f.centre[2]], rot: [Math.PI / 2, -0.75, 0], scale: [f.r + 0.015, f.depth + 0.015, f.r + 0.015] });
  strap.dispose();
  const bx = f.r * 0.92 + 0.02;
  const by = f.bottom + 0.06;
  b.add(new RoundedBoxGeometry(1, 1, 1, 3, 0.25), leather, { pos: [bx, by, f.centre[2] + 0.02], rot: [0, Math.PI / 2 - 0.25, 0], scale: [0.17 * k, 0.13 * k, 0.06 * k] });
  b.add(new RoundedBoxGeometry(1, 1, 1, 2, 0.3), '#86582e', { pos: [bx + 0.03 * k, by + 0.035 * k, f.centre[2] + 0.025], rot: [0, Math.PI / 2 - 0.25, 0.25], scale: [0.175 * k, 0.07 * k, 0.012 * k] });
  b.add(new THREE.BoxGeometry(1, 1, 1), '#e8c26a', { pos: [bx + 0.04 * k, by + 0.01 * k, f.centre[2] + 0.03], rot: [0, Math.PI / 2 - 0.25, 0], scale: [0.025 * k, 0.025 * k, 0.008] });
  return finish(b);
}

const BACK_MAKERS: Record<BackId, (f: BackFit) => BuiltPiece> = { backpack, cape, wings, butterfly, balloon, satchel };

export function buildBack(back: BackId, fit: BackFit): BuiltPiece | null {
  return BACK_MAKERS[back]?.(fit) ?? null;
}
