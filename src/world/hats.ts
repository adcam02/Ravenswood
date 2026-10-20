import * as THREE from 'three';
import { Builder, soft, type Vec3 } from './build';
import type { HatId } from './types';

/**
 * The hats players earn and wear. Each is modelled for a reference head (0.28 m across, 0.25 m tall) with
 * its origin at the top of that head, so the rig only has to place the origin on its own head and scale.
 * Everything is one vertex-coloured mesh, except the halo, which glows on its own.
 */

export interface BuiltHat {
  group: THREE.Group;
  /** Meshes that turn ghostly with the wearer, and the material each normally wears. */
  solid: { mesh: THREE.Mesh; material: THREE.Material }[];
  /** Materials to dispose with the hat. */
  materials: THREE.Material[];
  /** How far the hat reaches above the head top, in reference metres (before the rig's scale). */
  top: number;
  /** Gentle motion, for the halo. */
  update?: (t: number) => void;
}

const sph = (w: number, h: number) => new THREE.SphereGeometry(1, w, h);
const dome = (w: number, h: number) => new THREE.SphereGeometry(1, w, h, 0, Math.PI * 2, 0, Math.PI / 2);
const cyl = (n: number, top = 1, bottom = 1) => new THREE.CylinderGeometry(top, bottom, 1, n);
const torus = (tube: number, radial: number, tubular: number) => new THREE.TorusGeometry(1, tube, radial, tubular);

/** A flat five-pointed star, a little thick, lying in the xy plane. */
function starGeo(r = 1, inner = 0.45): THREE.BufferGeometry {
  const shape = new THREE.Shape();
  for (let i = 0; i < 10; i++) {
    const rr = i % 2 === 0 ? r : r * inner;
    const a = (i / 10) * Math.PI * 2 + Math.PI / 2;
    if (i === 0) shape.moveTo(Math.cos(a) * rr, Math.sin(a) * rr);
    else shape.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
  }
  shape.closePath();
  const g = new THREE.ExtrudeGeometry(shape, { depth: 0.25 * r, bevelEnabled: false });
  g.translate(0, 0, -0.125 * r);
  return g;
}

/** A cone made of stacked frustums that bends as it rises: `bend` radians in total, spread over the segments. */
function bentCone(b: Builder, colors: (i: number) => THREE.ColorRepresentation, base: Vec3, r0: number, height: number, segs: number, bend: number, bendDir: Vec3 = [-1, 0, 0]): Vec3 {
  let pos = new THREE.Vector3(...base);
  let dir = new THREE.Vector3(0, 1, 0);
  const axis = new THREE.Vector3(...bendDir).normalize();
  const segH = height / segs;
  for (let i = 0; i < segs; i++) {
    const rb = r0 * (1 - i / segs);
    const rt = r0 * (1 - (i + 1) / segs);
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
    const centre = pos.clone().addScaledVector(dir, segH / 2);
    // Overlap a touch so the joins never show a gap as the cone bends.
    const g = new THREE.CylinderGeometry(Math.max(rt, 0.004), rb, segH * 1.08, 20, 1, i < segs - 1);
    b.add(g, colors(i), new THREE.Matrix4().compose(centre, q, new THREE.Vector3(1, 1, 1)));
    g.dispose();
    pos = pos.addScaledVector(dir, segH);
    dir = dir.applyAxisAngle(axis, bend / segs).normalize();
  }
  return [pos.x, pos.y, pos.z];
}

function finish(b: Builder, extra: Partial<BuiltHat> & { top: number }): BuiltHat {
  const group = new THREE.Group();
  const material = soft();
  const mesh = b.mesh(material, { cast: true, receive: false });
  group.add(mesh);
  return { group, solid: [{ mesh, material }], materials: [material], ...extra, top: extra.top };
}

// ---------------------------------------------------------------- the hats

function beanie(): BuiltHat {
  const b = new Builder();
  const knit = '#d8504a';
  const cuff = '#b83c38';
  const cream = '#f6ead8';
  // The crown hugs the head; the cuff is folded up round the bottom, ribbed.
  b.add(dome(24, 10), knit, { pos: [0, -0.13, -0.01], scale: [0.3, 0.2, 0.3] });
  b.add(cyl(28), cuff, { pos: [0, -0.13, -0.01], scale: [0.305, 0.085, 0.305] });
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * Math.PI * 2;
    b.add(cyl(6), i % 2 ? cuff : '#c8443f', { pos: [Math.sin(a) * 0.307, -0.13, -0.01 + Math.cos(a) * 0.307], scale: [0.012, 0.08, 0.012] });
  }
  // A cream stripe round the crown, then the pom-pom.
  b.add(torus(0.12, 6, 32), cream, { pos: [0, -0.04, -0.01], rot: [Math.PI / 2, 0, 0], scale: [0.278, 0.278, 0.12] });
  b.add(sph(14, 10), cream, { pos: [0, 0.095, -0.01], scale: 0.075 });
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    b.add(sph(8, 6), cream, { pos: [Math.cos(a) * 0.04, 0.1 + (i % 2) * 0.02, -0.01 + Math.sin(a) * 0.04], scale: 0.045 });
  }
  return finish(b, { top: 0.17 });
}

function flowerCrown(): BuiltHat {
  const b = new Builder();
  const vine = '#5f9e47';
  const leaf = '#78b85a';
  const petals = ['#f39ab5', '#fbf8f2', '#f6d55c', '#c7a3e8', '#f39ab5', '#fbf8f2'];
  const R = 0.215;
  const y = -0.07;
  b.add(torus(0.1, 6, 28), vine, { pos: [0, y, 0], rot: [Math.PI / 2 + 0.12, 0, 0], scale: [R, R, 0.2] });
  const tilt = 0.12;
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + 0.3;
    const cx = Math.sin(a) * R;
    const cz = Math.cos(a) * R;
    const cy = y + Math.cos(a) * Math.sin(tilt) * R * 0.9 + 0.02;
    // Five petals round a yellow middle, facing out and a little up.
    const out = new THREE.Vector3(Math.sin(a), 0.6, Math.cos(a)).normalize();
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), out);
    const right = new THREE.Vector3(1, 0, 0).applyQuaternion(q);
    const up = new THREE.Vector3(0, 1, 0).applyQuaternion(q);
    for (let k = 0; k < 5; k++) {
      const pa = (k / 5) * Math.PI * 2;
      const p = new THREE.Vector3(cx, cy, cz).addScaledVector(right, Math.cos(pa) * 0.03).addScaledVector(up, Math.sin(pa) * 0.03);
      b.add(sph(6, 4), petals[i], new THREE.Matrix4().compose(p, q, new THREE.Vector3(0.026, 0.026, 0.01)));
    }
    b.add(sph(6, 4), '#f2b234', new THREE.Matrix4().compose(new THREE.Vector3(cx, cy, cz).addScaledVector(out, 0.008), q, new THREE.Vector3(0.016, 0.016, 0.012)));
    // A leaf between this flower and the next.
    const la = a + Math.PI / 6;
    const lq = new THREE.Quaternion().setFromEuler(new THREE.Euler(0.3, la, 0.6));
    b.add(sph(6, 4), leaf, new THREE.Matrix4().compose(new THREE.Vector3(Math.sin(la) * (R + 0.01), y + Math.cos(la) * Math.sin(tilt) * R * 0.9 + 0.005, Math.cos(la) * (R + 0.01)), lq, new THREE.Vector3(0.038, 0.012, 0.02)));
  }
  return finish(b, { top: 0.04 });
}

function partyHat(): BuiltHat {
  const b = new Builder();
  const bands = ['#f06a9a', '#5ec4c8', '#f6d55c', '#f06a9a', '#5ec4c8', '#f6d55c'];
  const H = 0.32;
  const R = 0.12;
  const n = bands.length;
  for (let i = 0; i < n; i++) {
    const rb = R * (1 - i / n);
    const rt = R * (1 - (i + 1) / n);
    b.add(new THREE.CylinderGeometry(Math.max(rt, 0.004), rb, H / n, 22, 1, i < n - 1), bands[i], { pos: [0, -0.03 + (H / n) * (i + 0.5), 0] });
  }
  // A rolled rim, a pom-pom, and dots.
  b.add(torus(0.18, 6, 28), '#fbf8f2', { pos: [0, -0.03, 0], rot: [Math.PI / 2, 0, 0], scale: [R, R, 0.16] });
  b.add(sph(12, 9), '#fbf8f2', { pos: [0, -0.03 + H + 0.02, 0], scale: 0.04 });
  for (let i = 0; i < 5; i++) b.add(sph(8, 6), '#fbf8f2', { pos: [Math.sin(i * 1.9) * 0.025, -0.03 + H + 0.02 + Math.cos(i * 1.3) * 0.02, Math.cos(i * 1.9) * 0.025], scale: 0.025 });
  // The elastic, a thin loop dropping down each side.
  for (const side of [-1, 1]) b.add(cyl(6), '#e8e0d0', { pos: [side * 0.13, -0.11, 0.02], rot: [0, 0, side * 0.12], scale: [0.004, 0.16, 0.004] });
  return finish(b, { top: H + 0.03 });
}

function wizardHat(): BuiltHat {
  const b = new Builder();
  const blue = '#3a4ab0';
  const deep = '#2e3b94';
  // A soft round brim, a gold band, then the tall cone flopping back at the tip.
  b.add(cyl(32), blue, { pos: [0, -0.04, 0], scale: [0.27, 0.018, 0.27] });
  b.add(torus(0.4, 6, 36), deep, { pos: [0, -0.04, 0], rot: [Math.PI / 2, 0, 0], scale: [0.27, 0.27, 0.03] });
  b.add(cyl(28), '#e8c26a', { pos: [0, -0.005, 0], scale: [0.165, 0.045, 0.165] });
  bentCone(b, (i) => (i % 2 ? blue : '#3646a6'), [0, -0.03, 0], 0.16, 0.46, 7, 1.1, [1, 0, 0]);
  // Stars and a crescent moon on the cone.
  const star = starGeo(1);
  for (const [x, y, z, s] of [
    [0.06, 0.08, 0.12, 0.03],
    [-0.08, 0.15, 0.08, 0.022],
    [0.03, 0.22, 0.07, 0.018],
    [-0.1, 0.04, 0.08, 0.02],
  ] as [number, number, number, number][]) {
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), new THREE.Vector3(x, 0.2, z).normalize());
    b.add(star, '#f6d55c', new THREE.Matrix4().compose(new THREE.Vector3(x, y, z), q, new THREE.Vector3(s, s, s)));
  }
  star.dispose();
  b.add(torus(0.28, 6, 18), '#f6d55c', { pos: [0.11, 0.03, 0.06], rot: [0, 1.0, 0.6], scale: [0.03, 0.03, 0.03] });
  return finish(b, { top: 0.4 });
}

function topHat(): BuiltHat {
  const b = new Builder();
  const black = '#26222a';
  // A brim with its edges curled up, a slightly flared crown, a red band with a little bow.
  b.add(cyl(36), black, { pos: [0, -0.035, 0], scale: [0.21, 0.016, 0.21] });
  b.add(torus(0.35, 6, 36), black, { pos: [0, -0.03, 0], rot: [Math.PI / 2, 0, 0], scale: [0.21, 0.21, 0.04] });
  b.add(cyl(32, 1.08, 1), black, { pos: [0, 0.085, 0], scale: [0.13, 0.24, 0.13] });
  b.add(cyl(32), '#3a3540', { pos: [0, 0.207, 0], scale: [0.14, 0.006, 0.14] });
  b.add(cyl(32), '#a8303a', { pos: [0, -0.002, 0], scale: [0.134, 0.05, 0.134] });
  const bow: Vec3 = [0.1, 0.0, 0.09];
  for (const side of [-1, 1]) b.add(sph(10, 7), '#a8303a', { pos: [bow[0] + side * 0.022, bow[1], bow[2]], rot: [0, 0.8, side * 0.4], scale: [0.026, 0.017, 0.012] });
  b.add(sph(8, 6), '#8a2430', { pos: bow, scale: 0.012 });
  return finish(b, { top: 0.22 });
}

function crown(): BuiltHat {
  const b = new Builder();
  const gold = '#e8b83a';
  const R = 0.17;
  // Red velvet inside, a gold band (a hollow ring, so its inside shows), points with pearls, and jewels.
  b.add(dome(20, 8), '#8a2030', { pos: [0, -0.04, 0], scale: [R * 0.95, 0.09, R * 0.95] });
  const profile = [new THREE.Vector2(R - 0.012, -0.05), new THREE.Vector2(R + 0.006, -0.05), new THREE.Vector2(R + 0.012, 0.025), new THREE.Vector2(R - 0.006, 0.025), new THREE.Vector2(R - 0.012, -0.05)];
  const band = new THREE.LatheGeometry(profile, 36);
  b.add(band, gold);
  band.dispose();
  b.add(torus(0.3, 6, 36), '#f2c94a', { pos: [0, -0.05, 0], rot: [Math.PI / 2, 0, 0], scale: [R + 0.004, R + 0.004, 0.04] });
  const jewels = ['#d8303c', '#3a6ad8', '#3aa860'];
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const x = Math.sin(a) * (R + 0.002);
    const z = Math.cos(a) * (R + 0.002);
    b.add(new THREE.ConeGeometry(1, 1, 14), gold, { pos: [x, 0.06, z], scale: [0.034, 0.075, 0.03] });
    b.add(sph(10, 8), '#fbf8f2', { pos: [Math.sin(a) * (R + 0.004), 0.105, Math.cos(a) * (R + 0.004)], scale: 0.016 });
    const ja = a + Math.PI / 6;
    b.add(sph(10, 8), jewels[i % 3], { pos: [Math.sin(ja) * (R + 0.012), -0.015, Math.cos(ja) * (R + 0.012)], scale: [0.02, 0.022, 0.012], rot: [0, ja, 0] });
  }
  return finish(b, { top: 0.13 });
}

function witchHat(): BuiltHat {
  const b = new Builder();
  const black = '#2e2438';
  const purple = '#7a4ab0';
  // A wide, slightly droopy brim; a crooked cone; a purple band with a gold buckle.
  const brim = new THREE.LatheGeometry([new THREE.Vector2(0.001, -0.03), new THREE.Vector2(0.18, -0.03), new THREE.Vector2(0.3, -0.05), new THREE.Vector2(0.34, -0.07), new THREE.Vector2(0.345, -0.06), new THREE.Vector2(0.3, -0.035), new THREE.Vector2(0.18, -0.015), new THREE.Vector2(0.001, -0.015)], 40);
  b.add(brim, black);
  brim.dispose();
  bentCone(b, (i) => (i % 2 ? black : '#342a40'), [0, -0.02, 0], 0.15, 0.42, 7, 1.4, [0, 0, 1]);
  b.add(cyl(30), purple, { pos: [0, 0.02, 0], scale: [0.143, 0.05, 0.143] });
  // The buckle: a square gold frame on the front of the band.
  const bz = 0.145;
  for (const [x, y, w, h] of [
    [0, 0.042, 0.06, 0.01],
    [0, -0.002, 0.06, 0.01],
    [-0.026, 0.02, 0.01, 0.054],
    [0.026, 0.02, 0.01, 0.054],
  ]) {
    b.add(new THREE.BoxGeometry(1, 1, 1), '#e8c26a', { pos: [x, y, bz], scale: [w, h, 0.012] });
  }
  return finish(b, { top: 0.38 });
}

function halo(): BuiltHat {
  const group = new THREE.Group();
  const ring = new THREE.MeshStandardMaterial({ color: '#ffe9a0', emissive: '#ffd85a', emissiveIntensity: 1.4, roughness: 0.3, metalness: 0.2 });
  const glowMat = new THREE.MeshBasicMaterial({ color: '#fff2b8', transparent: true, opacity: 0.28, depthWrite: false, blending: THREE.AdditiveBlending });
  const inner = new THREE.Mesh(new THREE.TorusGeometry(0.17, 0.022, 10, 40), ring);
  const outer = new THREE.Mesh(new THREE.TorusGeometry(0.17, 0.055, 8, 40), glowMat);
  for (const m of [inner, outer]) m.rotation.x = Math.PI / 2;
  inner.castShadow = false;
  outer.castShadow = false;
  const holder = new THREE.Group();
  holder.position.y = 0.13;
  holder.rotation.x = -0.15;
  holder.add(inner, outer);
  group.add(holder);
  return {
    group,
    solid: [],
    materials: [ring, glowMat],
    top: 0.19,
    update: (t) => {
      holder.position.y = 0.13 + Math.sin(t * 2.1) * 0.018;
      holder.rotation.z = Math.sin(t * 1.3) * 0.06;
      glowMat.opacity = 0.24 + Math.sin(t * 3.2) * 0.06;
    },
  };
}

const MAKERS: Record<HatId, () => BuiltHat> = {
  beanie,
  flower: flowerCrown,
  party: partyHat,
  wizard: wizardHat,
  tophat: topHat,
  crown,
  halo,
  witch: witchHat,
};

export function buildHat(hat: HatId): BuiltHat | null {
  const make = MAKERS[hat];
  return make ? make() : null;
}

/** How a hat sits on one animal: where the head top is (neck space), how big, and any tilt. */
export interface HatFit {
  pos: Vec3;
  scale: number;
  rot: Vec3;
}
