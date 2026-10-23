import * as THREE from 'three';
import { Builder, soft, wet, type Vec3 } from './build';
import type { HatId } from './types';

/**
 * The hats players earn and wear. Each is modelled for a reference head (0.28 m across, 0.25 m tall) with
 * its origin at the top of that head, so the rig only has to place the origin on its own head and scale.
 * Everything is one vertex-coloured mesh, except the halo and the candle's flame, which glow on their own, and the
 * propeller, which turns.
 */

export interface BuiltHat {
  group: THREE.Group;
  /** Meshes that turn ghostly with the wearer, and the material each normally wears. */
  solid: { mesh: THREE.Mesh; material: THREE.Material }[];
  /** Materials to dispose with the hat. */
  materials: THREE.Material[];
  /** How far the hat reaches above the head top, in reference metres (before the rig's scale). */
  top: number;
  /** Gentle motion, for the halo, the propeller and the candle flame. */
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

/**
 * A cone made of stacked frustums that bends as it rises: `bend` radians in total, spread over the segments. It sets
 * off along `start` (straight up unless told otherwise).
 */
function bentCone(b: Builder, colors: (i: number) => THREE.ColorRepresentation, base: Vec3, r0: number, height: number, segs: number, bend: number, bendDir: Vec3 = [-1, 0, 0], start: Vec3 = [0, 1, 0]): Vec3 {
  let pos = new THREE.Vector3(...base);
  let dir = new THREE.Vector3(...start).normalize();
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

function finish(b: Builder, extra: Partial<BuiltHat> & { top: number }, material = soft()): BuiltHat {
  const group = new THREE.Group();
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
  b.add(dome(22, 9), knit, { pos: [0, -0.13, -0.01], scale: [0.3, 0.2, 0.3] });
  b.add(cyl(28), cuff, { pos: [0, -0.13, -0.01], scale: [0.305, 0.085, 0.305] });
  for (let i = 0; i < 18; i++) {
    const a = (i / 18) * Math.PI * 2;
    b.add(cyl(5), '#c8443f', { pos: [Math.sin(a) * 0.307, -0.13, -0.01 + Math.cos(a) * 0.307], scale: [0.012, 0.08, 0.012] });
  }
  // A cream stripe round the crown, then the pom-pom.
  b.add(torus(0.12, 5, 28), cream, { pos: [0, -0.04, -0.01], rot: [Math.PI / 2, 0, 0], scale: [0.278, 0.278, 0.12] });
  b.add(sph(12, 9), cream, { pos: [0, 0.095, -0.01], scale: 0.075 });
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    b.add(sph(7, 5), cream, { pos: [Math.cos(a) * 0.04, 0.1 + (i % 2) * 0.02, -0.01 + Math.sin(a) * 0.04], scale: 0.045 });
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
  b.add(dome(16, 6), '#8a2030', { pos: [0, -0.04, 0], scale: [R * 0.95, 0.09, R * 0.95] });
  const profile = [new THREE.Vector2(R - 0.012, -0.05), new THREE.Vector2(R + 0.006, -0.05), new THREE.Vector2(R + 0.012, 0.025), new THREE.Vector2(R - 0.006, 0.025), new THREE.Vector2(R - 0.012, -0.05)];
  const band = new THREE.LatheGeometry(profile, 30);
  b.add(band, gold);
  band.dispose();
  b.add(torus(0.3, 4, 30), '#f2c94a', { pos: [0, -0.05, 0], rot: [Math.PI / 2, 0, 0], scale: [R + 0.004, R + 0.004, 0.04] });
  const jewels = ['#d8303c', '#3a6ad8', '#3aa860'];
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const x = Math.sin(a) * (R + 0.002);
    const z = Math.cos(a) * (R + 0.002);
    b.add(new THREE.ConeGeometry(1, 1, 12), gold, { pos: [x, 0.06, z], scale: [0.034, 0.075, 0.03] });
    b.add(sph(7, 5), '#fbf8f2', { pos: [Math.sin(a) * (R + 0.004), 0.105, Math.cos(a) * (R + 0.004)], scale: 0.016 });
    const ja = a + Math.PI / 6;
    b.add(sph(8, 6), jewels[i % 3], { pos: [Math.sin(ja) * (R + 0.012), -0.015, Math.cos(ja) * (R + 0.012)], scale: [0.02, 0.022, 0.012], rot: [0, ja, 0] });
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

// ---------------------------------------------------------------- the job hats, one for doing each job perfectly

/** A point on an ellipsoid (radii rx, ry, rz) at longitude a and latitude e, and the way out from it there. */
function onShell(rx: number, ry: number, rz: number, a: number, e: number, y0: number): { p: THREE.Vector3; n: THREE.Vector3 } {
  const p = new THREE.Vector3(Math.sin(a) * Math.cos(e) * rx, y0 + Math.sin(e) * ry, Math.cos(a) * Math.cos(e) * rz);
  const n = new THREE.Vector3(p.x / (rx * rx), (p.y - y0) / (ry * ry), p.z / (rz * rz)).normalize();
  return { p, n };
}

function lumberjack(): BuiltHat {
  const b = new Builder();
  const red = '#c8302c';
  const black = '#221c20';
  // A red knitted crown checked with black: dark gores up the sides and bands round it, a black ribbed cuff, and a
  // red and black pom-pom.
  b.add(dome(24, 10), red, { pos: [0, -0.13, -0.01], scale: [0.3, 0.2, 0.3] });
  for (let i = 0; i < 8; i++) {
    const g = new THREE.SphereGeometry(1, 3, 10, (i / 8) * Math.PI * 2, Math.PI / 8, 0, Math.PI / 2);
    b.add(g, black, { pos: [0, -0.13, -0.01], scale: [0.303, 0.203, 0.303] });
    g.dispose();
  }
  for (const [y, r] of [
    [-0.075, 0.287],
    [-0.01, 0.235],
  ]) {
    b.add(torus(0.09, 5, 32), black, { pos: [0, y, -0.01], rot: [Math.PI / 2, 0, 0], scale: [r, r, 0.12] });
  }
  b.add(cyl(30), black, { pos: [0, -0.13, -0.01], scale: [0.307, 0.085, 0.307] });
  for (let i = 0; i < 20; i++) {
    const a = (i / 20) * Math.PI * 2;
    b.add(cyl(5), '#3a3036', { pos: [Math.sin(a) * 0.309, -0.13, -0.01 + Math.cos(a) * 0.309], scale: [0.011, 0.08, 0.011] });
  }
  b.add(sph(12, 9), red, { pos: [0, 0.095, -0.01], scale: 0.07 });
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    b.add(sph(7, 5), i % 2 ? red : black, { pos: [Math.cos(a) * 0.042, 0.1 + (i % 2) * 0.02, -0.01 + Math.sin(a) * 0.042], scale: 0.042 });
  }
  return finish(b, { top: 0.17 });
}

function souwester(): BuiltHat {
  const b = new Builder();
  const yellow = '#f2c230';
  const seam = '#d6a41c';
  // A round oilskin crown with stitched seams, and a brim that sweeps down and is longest at the back (to keep the
  // rain off the neck), with a chin strap.
  b.add(dome(24, 10), yellow, { pos: [0, -0.07, -0.005], scale: [0.2, 0.17, 0.21] });
  for (let i = 0; i < 4; i++) b.add(torus(0.05, 4, 24), seam, { pos: [0, -0.07, -0.005], rot: [0, (i * Math.PI) / 4, 0], scale: [0.2, 0.171, 0.05] });
  b.add(cyl(26), seam, { pos: [0, -0.06, -0.005], scale: [0.203, 0.02, 0.213] });
  const brim = new THREE.LatheGeometry(
    [new THREE.Vector2(0.001, -0.06), new THREE.Vector2(0.19, -0.06), new THREE.Vector2(0.28, -0.1), new THREE.Vector2(0.32, -0.13), new THREE.Vector2(0.322, -0.115), new THREE.Vector2(0.28, -0.085), new THREE.Vector2(0.19, -0.045), new THREE.Vector2(0.001, -0.045)],
    40,
  );
  b.add(brim, yellow, { pos: [0, 0, -0.03], scale: [1, 1, 1.18] });
  brim.dispose();
  b.add(torus(0.25, 5, 40), seam, { pos: [0, -0.125, -0.03], rot: [Math.PI / 2, 0, 0], scale: [0.318, 0.318 * 1.18, 0.03] });
  for (const side of [-1, 1]) b.add(cyl(6), '#8a6a1a', { pos: [side * 0.19, -0.15, 0.02], rot: [0, 0, side * 0.1], scale: [0.006, 0.18, 0.006] });
  return finish(b, { top: 0.11 });
}

function mitre(): BuiltHat {
  const b = new Builder();
  const white = '#fbf8f2';
  const gold = '#e2b23a';
  // The tall pointed mitre: a pointed arch from the front, cream with gold bands up the middle and round the
  // bottom, a gold cross, and the two ribbons (lappets) hanging down the back.
  const shape = new THREE.Shape();
  shape.moveTo(-0.16, 0);
  shape.lineTo(-0.16, 0.14);
  shape.quadraticCurveTo(-0.15, 0.3, 0, 0.44);
  shape.quadraticCurveTo(0.15, 0.3, 0.16, 0.14);
  shape.lineTo(0.16, 0);
  shape.closePath();
  const arch = new THREE.ExtrudeGeometry(shape, { depth: 0.22, bevelEnabled: true, bevelThickness: 0.015, bevelSize: 0.012, bevelSegments: 2, curveSegments: 14 });
  arch.translate(0, 0, -0.11);
  b.add(arch, white, { pos: [0, -0.09, 0] });
  arch.dispose();
  b.add(new THREE.BoxGeometry(1, 1, 1), gold, { pos: [0, -0.06, 0], scale: [0.35, 0.06, 0.255] });
  b.add(new THREE.BoxGeometry(1, 1, 1), gold, { pos: [0, 0.1, 0.122], scale: [0.05, 0.3, 0.012] });
  b.add(new THREE.BoxGeometry(1, 1, 1), gold, { pos: [0, 0.1, -0.122], scale: [0.05, 0.3, 0.012] });
  b.add(new THREE.BoxGeometry(1, 1, 1), '#c8302c', { pos: [0, 0.2, 0.13], scale: [0.016, 0.09, 0.006] });
  b.add(new THREE.BoxGeometry(1, 1, 1), '#c8302c', { pos: [0, 0.215, 0.13], scale: [0.06, 0.016, 0.006] });
  for (const side of [-1, 1]) {
    b.add(new THREE.BoxGeometry(1, 1, 1), white, { pos: [side * 0.07, -0.2, -0.13], rot: [0.1, 0, 0], scale: [0.05, 0.22, 0.01] });
    b.add(new THREE.BoxGeometry(1, 1, 1), gold, { pos: [side * 0.07, -0.31, -0.141], rot: [0.1, 0, 0], scale: [0.056, 0.025, 0.012] });
  }
  return finish(b, { top: 0.36 });
}

function chef(): BuiltHat {
  const b = new Builder();
  const white = '#fdfbf6';
  const shade_ = '#e9e4da';
  // A pleated white band and a big soft puff on top.
  b.add(cyl(30), white, { pos: [0, 0.0, 0], scale: [0.17, 0.13, 0.17] });
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    b.add(cyl(5), shade_, { pos: [Math.sin(a) * 0.17, 0.0, Math.cos(a) * 0.17], scale: [0.008, 0.125, 0.008] });
  }
  b.add(sph(20, 12), white, { pos: [0, 0.14, 0], scale: [0.22, 0.12, 0.22] });
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2;
    b.add(sph(12, 8), i % 2 ? white : '#f6f2ea', { pos: [Math.sin(a) * 0.13, 0.16 + (i % 3) * 0.01, Math.cos(a) * 0.13], scale: [0.11, 0.09, 0.11] });
  }
  return finish(b, { top: 0.25 });
}

function bowler(): BuiltHat {
  const b = new Builder();
  const black = '#2a2428';
  // A round black crown, a narrow brim curled up at the sides, a grosgrain band and a little bow.
  b.add(dome(24, 10), black, { pos: [0, -0.04, 0], scale: [0.155, 0.16, 0.165] });
  b.add(cyl(36), black, { pos: [0, -0.04, 0], scale: [0.21, 0.014, 0.22] });
  b.add(torus(0.3, 6, 36), black, { pos: [0, -0.035, 0], rot: [Math.PI / 2, 0, 0], scale: [0.21, 0.22, 0.05] });
  b.add(cyl(30), '#4a3a32', { pos: [0, -0.012, 0], scale: [0.158, 0.035, 0.168] });
  for (const side of [-1, 1]) b.add(sph(10, 7), '#4a3a32', { pos: [-0.15 + side * 0.0, -0.01, 0.04 + side * 0.018], rot: [0.4, 0, 0], scale: [0.012, 0.014, 0.022] });
  return finish(b, { top: 0.13 });
}

function sunhat(): BuiltHat {
  const b = new Builder();
  const straw = '#e8c97a';
  const weave = '#cfa95a';
  // A wide floppy straw brim with rings of weave, a low crown, a pink ribbon and a sunflower on the side.
  const brim = new THREE.LatheGeometry(
    [new THREE.Vector2(0.001, -0.05), new THREE.Vector2(0.17, -0.05), new THREE.Vector2(0.3, -0.07), new THREE.Vector2(0.38, -0.1), new THREE.Vector2(0.385, -0.085), new THREE.Vector2(0.3, -0.055), new THREE.Vector2(0.17, -0.035), new THREE.Vector2(0.001, -0.035)],
    44,
  );
  b.add(brim, straw);
  brim.dispose();
  for (const r of [0.22, 0.28, 0.34]) b.add(torus(0.08, 4, 40), weave, { pos: [0, -0.052 - (r - 0.2) * 0.25, 0], rot: [Math.PI / 2, 0, 0], scale: [r, r, 0.1] });
  b.add(dome(22, 9), straw, { pos: [0, -0.04, 0], scale: [0.165, 0.13, 0.165] });
  for (let i = 0; i < 3; i++) b.add(torus(0.06, 4, 28), weave, { pos: [0, 0.0 + i * 0.03, 0], rot: [Math.PI / 2, 0, 0], scale: [0.16 - i * 0.025, 0.16 - i * 0.025, 0.1] });
  b.add(cyl(28), '#f08aa8', { pos: [0, -0.02, 0], scale: [0.168, 0.035, 0.168] });
  const fx = 0.12;
  const fz = 0.11;
  for (let k = 0; k < 10; k++) {
    const a = (k / 10) * Math.PI * 2;
    b.add(sph(6, 4), '#f6c42c', { pos: [fx + Math.cos(a) * 0.035, 0.0 + Math.sin(a) * 0.035, fz], rot: [0, 0.8, a], scale: [0.026, 0.011, 0.008] });
  }
  b.add(sph(8, 6), '#6a4224', { pos: [fx, 0.0, fz + 0.005], scale: [0.022, 0.022, 0.012] });
  return finish(b, { top: 0.1 });
}

function headscarf(): BuiltHat {
  const b = new Builder();
  const blue = '#4a78b8';
  // A blue kerchief with white spots wrapped snugly over the head and pushed a little back off the brow, knotted at
  // the back with its two ends hanging down over the corner of the cloth.
  const R = [0.3, 0.2, 0.31] as const;
  const tilt = new THREE.Matrix4().compose(new THREE.Vector3(0, -0.14, -0.01), new THREE.Quaternion().setFromEuler(new THREE.Euler(-0.12, 0, 0)), new THREE.Vector3(1, 1, 1));
  const at = (pos: THREE.Vector3, q = new THREE.Quaternion(), scale = new THREE.Vector3(1, 1, 1)) => tilt.clone().multiply(new THREE.Matrix4().compose(pos, q, scale));
  const euler = (x: number, y: number, z: number) => new THREE.Quaternion().setFromEuler(new THREE.Euler(x, y, z));
  b.add(dome(24, 10), blue, at(new THREE.Vector3(), undefined, new THREE.Vector3(...R)));
  // Spots spread evenly over the cloth (even area from the edge to the crown, turning by the golden angle).
  const N = 30;
  for (let i = 0; i < N; i++) {
    const e = Math.asin(Math.sin(0.12) + ((i + 0.5) / N) * (Math.sin(1.35) - Math.sin(0.12)));
    const { p, n } = onShell(R[0] + 0.002, R[1] + 0.002, R[2] + 0.002, i * 2.39996, e, 0);
    b.add(sph(7, 5), '#fbf6ee', at(p, new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), n), new THREE.Vector3(0.019, 0.019, 0.005)));
  }
  // The corner of the cloth, the knot over it and the two ends.
  b.add(new THREE.ConeGeometry(1, 1, 3), blue, at(new THREE.Vector3(0, -0.06, -0.29), euler(Math.PI + 0.3, Math.PI / 6, 0), new THREE.Vector3(0.12, 0.13, 0.03)));
  const { p: knot } = onShell(R[0], R[1], R[2], Math.PI, 0.3, 0);
  b.add(sph(10, 8), blue, at(knot.clone().add(new THREE.Vector3(0, 0, -0.012)), undefined, new THREE.Vector3(0.042, 0.036, 0.034)));
  for (const side of [-1, 1]) b.add(sph(10, 8), blue, at(knot.clone().add(new THREE.Vector3(side * 0.045, -0.045, -0.02)), euler(0.25, 0, side * 0.55), new THREE.Vector3(0.026, 0.07, 0.02)));
  return finish(b, { top: 0.08 });
}

function feathercap(): BuiltHat {
  const b = new Builder();
  const green = '#3f8a46';
  // A felt hunter's cap, pointed at the front and turned up at the back, with a long red feather tucked in.
  b.add(sph(22, 12), green, { pos: [0, -0.03, 0.01], scale: [0.17, 0.11, 0.24] });
  b.add(new THREE.ConeGeometry(1, 1, 18), green, { pos: [0, -0.01, 0.25], rot: [Math.PI / 2, 0, 0], scale: [0.07, 0.12, 0.05] });
  b.add(sph(18, 8), '#2f6e36', { pos: [0, -0.06, -0.16], rot: [0.6, 0, 0], scale: [0.17, 0.05, 0.12] });
  b.add(torus(0.12, 5, 30), '#2f6e36', { pos: [0, -0.07, 0.01], rot: [Math.PI / 2, 0, 0], scale: [0.172, 0.242, 0.12] });
  const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(-0.9, 0, -0.35));
  b.add(sph(12, 6), '#d8343a', new THREE.Matrix4().compose(new THREE.Vector3(0.15, 0.07, -0.06), q, new THREE.Vector3(0.024, 0.2, 0.006)));
  b.add(cyl(5), '#f6efe0', new THREE.Matrix4().compose(new THREE.Vector3(0.15, 0.07, -0.06), q, new THREE.Vector3(0.004, 0.36, 0.004)));
  return finish(b, { top: 0.2 });
}

function sailor(): BuiltHat {
  const b = new Builder();
  const white = '#f8f6f0';
  const navy = '#1f2d4f';
  // A captain's cap: a flat white top, a navy band with a gold cord, a shiny black peak and a gold anchor badge.
  b.add(cyl(32), navy, { pos: [0, -0.02, 0], scale: [0.17, 0.07, 0.17] });
  b.add(cyl(36, 1, 0.82), white, { pos: [0, 0.035, -0.01], scale: [0.22, 0.045, 0.23] });
  b.add(cyl(36), white, { pos: [0, 0.06, -0.01], scale: [0.222, 0.012, 0.232] });
  b.add(torus(0.2, 5, 32), '#e2b23a', { pos: [0, 0.008, 0.0], rot: [Math.PI / 2, 0, 0], scale: [0.172, 0.172, 0.06] });
  const peak = new THREE.CylinderGeometry(1, 1, 1, 24, 1, false, -Math.PI / 2, Math.PI);
  b.add(peak, '#14141a', { pos: [0, -0.055, 0.1], rot: [0.35, 0, 0], scale: [0.16, 0.012, 0.13] });
  peak.dispose();
  const az = 0.172;
  b.add(torus(0.25, 4, 14), '#e2b23a', { pos: [0, 0.0, az], scale: [0.018, 0.018, 0.02] });
  b.add(new THREE.BoxGeometry(1, 1, 1), '#e2b23a', { pos: [0, -0.025, az], scale: [0.007, 0.04, 0.006] });
  b.add(new THREE.BoxGeometry(1, 1, 1), '#e2b23a', { pos: [0, -0.045, az], scale: [0.034, 0.007, 0.006] });
  return finish(b, { top: 0.08 });
}

function leprechaun(): BuiltHat {
  const b = new Builder();
  const green = '#2f9a4a';
  // A green top hat, a little flared, with a black band, a big gold buckle and a shamrock tucked in.
  b.add(cyl(36), green, { pos: [0, -0.035, 0], scale: [0.23, 0.016, 0.23] });
  b.add(torus(0.3, 6, 36), green, { pos: [0, -0.03, 0], rot: [Math.PI / 2, 0, 0], scale: [0.23, 0.23, 0.04] });
  b.add(cyl(32, 1.12, 1), green, { pos: [0, 0.08, 0], scale: [0.135, 0.22, 0.135] });
  b.add(cyl(32), '#257a3a', { pos: [0, 0.19, 0], scale: [0.15, 0.006, 0.15] });
  b.add(cyl(32), '#1e1a1e', { pos: [0, 0.0, 0], scale: [0.14, 0.055, 0.14] });
  const bz = 0.142;
  for (const [x, y, w, h] of [
    [0, 0.024, 0.07, 0.012],
    [0, -0.024, 0.07, 0.012],
    [-0.03, 0, 0.012, 0.06],
    [0.03, 0, 0.012, 0.06],
  ]) {
    b.add(new THREE.BoxGeometry(1, 1, 1), '#f2c94c', { pos: [x, y, bz], scale: [w, h, 0.012] });
  }
  for (let k = 0; k < 3; k++) {
    const a = (k / 3) * Math.PI * 2 + Math.PI / 2;
    b.add(sph(8, 6), '#4cc35a', { pos: [0.1 + Math.cos(a) * 0.022, 0.06 + Math.sin(a) * 0.022, 0.1], rot: [0, 0.8, 0], scale: [0.022, 0.022, 0.007] });
  }
  b.add(cyl(5), '#3a8a3a', { pos: [0.1, 0.03, 0.1], rot: [0, 0, 0.3], scale: [0.004, 0.04, 0.004] });
  return finish(b, { top: 0.2 });
}

function clockmaker(): BuiltHat {
  const b = new Builder();
  const felt = '#3e4a45';
  const brass = '#c9a24f';
  const dark = '#24282a';
  // A low topper in the tower's iron green with a brass band, a little clock on the front, a brass cog on the side,
  // a jeweller's loupe resting on the brim and a pocket watch's winding crown and bow on top.
  b.add(cyl(36), felt, { pos: [0, -0.035, 0], scale: [0.21, 0.016, 0.21] });
  b.add(torus(0.3, 6, 36), felt, { pos: [0, -0.03, 0], rot: [Math.PI / 2, 0, 0], scale: [0.21, 0.21, 0.04] });
  b.add(cyl(32, 1.06, 1), felt, { pos: [0, 0.045, 0], scale: [0.14, 0.16, 0.14] });
  b.add(cyl(32), '#48554f', { pos: [0, 0.126, 0], scale: [0.149, 0.006, 0.149] });
  b.add(cyl(32), brass, { pos: [0, -0.008, 0], scale: [0.143, 0.04, 0.143] });
  // The clock: a cream face in a brass bezel, with twelve marks and its hands at ten past ten.
  const face: Vec3 = [0, 0.068, 0.149];
  const front = (x: number, y: number, z = 0) => [face[0] + x, face[1] + y, face[2] + z] as Vec3;
  b.add(cyl(26), '#f6efe0', { pos: face, rot: [Math.PI / 2, 0, 0], scale: [0.046, 0.01, 0.046] });
  b.add(torus(0.18, 5, 26), brass, { pos: front(0, 0, 0.004), scale: [0.048, 0.048, 0.035] });
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    b.add(new THREE.BoxGeometry(1, 1, 1), dark, { pos: front(Math.sin(a) * 0.036, Math.cos(a) * 0.036, 0.006), rot: [0, 0, -a], scale: [0.004, i % 3 ? 0.006 : 0.011, 0.004] });
  }
  for (const [a, len] of [
    [Math.PI / 3, 0.034],
    [-Math.PI / 3, 0.024],
  ]) {
    b.add(new THREE.BoxGeometry(1, 1, 1), dark, { pos: front((Math.sin(a) * len) / 2, (Math.cos(a) * len) / 2, 0.008), rot: [0, 0, -a], scale: [0.005, len, 0.004] });
  }
  b.add(sph(8, 6), brass, { pos: front(0, 0, 0.009), scale: 0.006 });
  // A brass cog standing on the left side of the crown.
  const cog: Vec3 = [-0.148, 0.06, -0.01];
  b.add(cyl(24), brass, { pos: cog, rot: [0, 0, Math.PI / 2], scale: [0.045, 0.012, 0.045] });
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2;
    b.add(new THREE.BoxGeometry(1, 1, 1), brass, { pos: [cog[0], cog[1] + Math.cos(a) * 0.05, cog[2] + Math.sin(a) * 0.05], rot: [a, 0, 0], scale: [0.012, 0.016, 0.014] });
  }
  b.add(cyl(14), '#8a6a2a', { pos: [cog[0] - 0.004, cog[1], cog[2]], rot: [0, 0, Math.PI / 2], scale: [0.016, 0.012, 0.016] });
  // The loupe: a little black tube with a glass end, resting on the brim and looking out to the right.
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(0.55, 0.35, 0.75).normalize());
  b.add(cyl(14, 1, 1.25), dark, new THREE.Matrix4().compose(new THREE.Vector3(0.15, -0.005, 0.12), q, new THREE.Vector3(0.022, 0.04, 0.022)));
  b.add(cyl(14), '#bfe3f0', new THREE.Matrix4().compose(new THREE.Vector3(0.15, -0.005, 0.12).addScaledVector(new THREE.Vector3(0.55, 0.35, 0.75).normalize(), 0.021), q, new THREE.Vector3(0.023, 0.004, 0.023)));
  // The winding crown and bow on top.
  b.add(cyl(12), brass, { pos: [0, 0.14, 0], scale: [0.022, 0.026, 0.022] });
  b.add(cyl(12), '#e2c06a', { pos: [0, 0.155, 0], scale: [0.026, 0.008, 0.026] });
  b.add(torus(0.18, 6, 22), brass, { pos: [0, 0.185, 0], scale: [0.027, 0.027, 0.035] });
  return finish(b, { top: 0.21 });
}

// ---------------------------------------------------------------- the achievement hats, and the secret ones

/** Turns a geometry's faces inside out, for linings seen from within. */
function inward(g: THREE.BufferGeometry): THREE.BufferGeometry {
  const ix = g.getIndex()!;
  for (let i = 0; i < ix.count; i += 3) {
    const a = ix.getX(i + 1);
    ix.setX(i + 1, ix.getX(i + 2));
    ix.setX(i + 2, a);
  }
  return g;
}

/** Moves every vertex of a geometry through `f`. */
function warp(g: THREE.BufferGeometry, f: (v: THREE.Vector3) => THREE.Vector3): THREE.BufferGeometry {
  const pos = g.getAttribute('position') as THREE.BufferAttribute;
  const v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    const p = f(v.fromBufferAttribute(pos, i));
    pos.setXYZ(i, p.x, p.y, p.z);
  }
  return g;
}

function propeller(): BuiltHat {
  const b = new Builder();
  const panels = ['#e2423c', '#f4c430', '#3a78d8', '#4cae4c'];
  const white = '#fbf8f2';
  // A snug cap in four bright panels (red at the front), white piping down the seams and round the edge, and a
  // button on top with a little post for the propeller.
  for (let i = 0; i < 4; i++) {
    const g = new THREE.SphereGeometry(1, 7, 9, Math.PI / 4 + (i * Math.PI) / 2, Math.PI / 2, 0, Math.PI / 2);
    b.add(g, panels[i], { pos: [0, -0.12, -0.01], scale: [0.27, 0.19, 0.28] });
    g.dispose();
  }
  const seam = new THREE.TorusGeometry(1, 0.035, 4, 20, Math.PI);
  for (const a of [Math.PI / 4, (3 * Math.PI) / 4]) b.add(seam, white, { pos: [0, -0.12, -0.01], rot: [0, Math.PI + a, 0], scale: [0.274, 0.193, 0.28] });
  seam.dispose();
  b.add(torus(0.08, 5, 32), white, { pos: [0, -0.12, -0.01], rot: [Math.PI / 2, 0, 0], scale: [0.272, 0.282, 0.25] });
  b.add(cyl(14), white, { pos: [0, 0.074, -0.01], scale: [0.032, 0.02, 0.032] });
  b.add(cyl(8), '#c8c2b8', { pos: [0, 0.1, -0.01], scale: [0.009, 0.05, 0.009] });
  // The propeller turns on its own: a red hub and two pitched blades, one yellow and one blue.
  const p = new Builder();
  p.add(sph(10, 7), panels[0], { scale: [0.026, 0.02, 0.026] });
  for (const side of [-1, 1]) {
    p.add(sph(12, 6), side < 0 ? panels[2] : panels[1], { pos: [side * 0.092, 0, 0], rot: [side * 0.4, 0, 0], scale: [0.085, 0.013, 0.036] });
  }
  const built = finish(b, { top: 0.15 });
  const material = soft();
  const blades = p.mesh(material, { cast: true, receive: false });
  blades.position.set(0, 0.128, -0.01);
  built.group.add(blades);
  built.solid.push({ mesh: blades, material });
  built.materials.push(material);
  // Spinning in a breeze that comes and goes.
  built.update = (t) => {
    blades.rotation.y = t * 7 + Math.sin(t * 0.9) * 1.6;
  };
  return built;
}

function reaper(): BuiltHat {
  const b = new Builder();
  const cloth = '#2f2a38';
  // A deep cowl pulled down over the head: a shell round it with a round hole cut where the face looks out (tipped
  // down, so it's open underneath too), its crown drawn up and back into a soft point, and its back hanging down over
  // the neck. A dark lining inside and a rolled edge round the opening.
  const C = new THREE.Vector3(0, -0.2, -0.015);
  const R = new THREE.Vector3(0.31, 0.27, 0.3);
  const hole = 1.28;
  const tip = new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.PI / 2 + 0.55, 0, 0));
  const peak = new THREE.Vector3(0, 0.8, -0.6).normalize();
  const pull = new THREE.Vector3(0, 0.5, -0.85).normalize();
  // Where a point of the round shell (1 = the shell, a little less = inside it) ends up.
  const cowl = (v: THREE.Vector3) => {
    const d = v.clone().normalize();
    const p = d.clone().multiply(R).multiplyScalar(v.length());
    const k = Math.max(0, (d.dot(peak) - 0.5) / 0.5);
    p.addScaledVector(pull, 0.22 * k * k);
    // Only a short drape at the back: on animals that are nearly all head (a frog, a jellyfish) a long one swallowed
    // the whole body. Anything still below the neck line is drawn up close under it.
    const hang = Math.max(0, -d.y) ** 2 * (0.5 - 0.5 * d.z);
    p.x *= 1 + 0.12 * hang;
    p.z *= 1 + 0.12 * hang;
    p.y -= 0.08 * hang;
    const floor = -0.3;
    if (p.y < floor) p.y = floor + (p.y - floor) * 0.3;
    return v.copy(p.add(C));
  };
  for (const [r, color, flip] of [
    [1, cloth, false],
    [0.93, '#141118', true],
  ] as [number, string, boolean][]) {
    const g = new THREE.SphereGeometry(r, 24, 12, 0, Math.PI * 2, hole, Math.PI - hole).applyQuaternion(tip);
    b.add(warp(flip ? inward(g) : g, cowl), color);
    g.dispose();
  }
  const rim = new THREE.TorusGeometry(Math.sin(hole) * 0.965, 0.06, 6, 36).rotateX(Math.PI / 2).translate(0, Math.cos(hole) * 0.965, 0).applyQuaternion(tip);
  b.add(warp(rim, cowl), '#3d3648');
  rim.dispose();
  return finish(b, { top: 0.15 });
}

function horns(): BuiltHat {
  const b = new Builder();
  const reds = ['#6e1420', '#8a1a26', '#a8202c', '#c42834', '#d8343c', '#e84a4c'];
  // A thin black band arching over the head from ear to ear, and on it two little horns, tipped outwards and curling
  // back in at the points, dark at the root and bright at the tip. The wet finish gives them a glossy glint.
  const band = new THREE.TorusGeometry(1, 0.06, 5, 20, Math.PI * 0.56).rotateZ(Math.PI * 0.22);
  b.add(band, '#2a2026', { pos: [0, -0.22, 0.03], rot: [0.55, 0, 0], scale: [0.268, 0.205, 0.2] });
  band.dispose();
  // They stand well forward and close together, so tall ears behind them don't hide them.
  for (const side of [-1, 1]) {
    const base: Vec3 = [side * 0.064, -0.06, 0.145];
    b.add(sph(12, 7), reds[0], { pos: [base[0], base[1] + 0.016, base[2]], scale: [0.06, 0.026, 0.06] });
    bentCone(b, (i) => reds[i], base, 0.053, 0.18, 6, 1.2, [0, 0, side], [side * 0.65, 1, 0.3]);
  }
  return finish(b, { top: 0.12 }, wet());
}

function laurel(): BuiltHat {
  const b = new Builder();
  // A victor's wreath in gold, which shows on any coat (green leaves vanished on the frog), with a red bow.
  const greens = ['#e8b83a', '#d49a24', '#f4cd5c'];
  const gold = '#c8302c';
  const R = 0.222;
  // Two sprigs of paired leaves round the head, from a gold bow at the back to the brow, where they part.
  const at = (a: number) => new THREE.Vector3(Math.sin(a) * R, -0.075 - Math.cos(a) * 0.02, Math.cos(a) * R);
  const leaf = sph(5, 4);
  const N = 8;
  const gap = 0.32;
  for (const side of [-1, 1]) {
    const twig: THREE.Vector3[] = [];
    for (let k = 0; k <= N; k++) {
      const a = side * (Math.PI - 0.1 - (k / N) * (Math.PI - 0.1 - gap));
      const p = at(a);
      twig.push(p);
      // Each pair points on towards the front, one leaf tipped up and one down, both lying along the head.
      const fwd = at(a - side * 0.01).sub(p).normalize();
      const out = new THREE.Vector3(Math.sin(a), 0, Math.cos(a));
      const pairs = k === N ? [0] : [0.62, -0.62];
      for (const [j, lift] of pairs.entries()) {
        const along = fwd.clone().multiplyScalar(Math.cos(lift)).add(new THREE.Vector3(0, Math.sin(lift), 0)).addScaledVector(out, 0.22).normalize();
        const face = out.clone().addScaledVector(along, -out.dot(along)).normalize();
        const m = new THREE.Matrix4().makeBasis(new THREE.Vector3().crossVectors(along, face), along, face);
        m.setPosition(p.clone().addScaledVector(along, 0.036));
        b.add(leaf, greens[(k + j) % 3], m.multiply(new THREE.Matrix4().makeScale(0.025, 0.048, 0.007)));
      }
    }
    const curve = new THREE.CatmullRomCurve3(twig);
    const g = new THREE.TubeGeometry(curve, 18, 0.008, 4, false);
    b.add(g, '#a8741c');
    g.dispose();
  }
  leaf.dispose();
  // The bow: a knot, two loops and two tails hanging down.
  const k = at(Math.PI).add(new THREE.Vector3(0, 0, -0.012));
  b.add(sph(8, 6), gold, { pos: k.toArray(), scale: [0.018, 0.018, 0.014] });
  for (const side of [-1, 1]) {
    b.add(sph(8, 6), gold, { pos: [k.x + side * 0.03, k.y + 0.008, k.z], rot: [0, 0, side * 0.35], scale: [0.028, 0.017, 0.01] });
    b.add(new THREE.BoxGeometry(1, 1, 1), '#a82424', { pos: [k.x + side * 0.018, k.y - 0.042, k.z - 0.004], rot: [0.15, 0, side * 0.3], scale: [0.016, 0.066, 0.004] });
  }
  return finish(b, { top: 0.04 });
}

function tricorn(): BuiltHat {
  const b = new Builder();
  const felt = '#25212b';
  const gold = '#e2b23a';
  const bone = '#f6f0e2';
  // A round brim turned up all the way round, then pushed in at three places and pulled out between them, so from
  // above it's a triangle with a corner over the brow, its edge dipping to each corner. Gold braid round the edge, a
  // low round crown inside with a dark band, and a skull and crossbones on the front.
  const corner = (a: number) => ((1 + Math.cos(3 * a)) / 2) ** 2;
  const pinch = (v: THREE.Vector3) => {
    const a = Math.atan2(v.x, v.z);
    const k = corner(a);
    const r = Math.hypot(v.x, v.z);
    const rr = r <= 0.16 ? r : 0.16 + (r - 0.16) * (0.5 + 1.0 * k);
    const y = v.y <= -0.035 ? v.y : -0.035 + (v.y + 0.035) * (1 - 0.5 * k);
    return v.set(Math.sin(a) * rr, y, Math.cos(a) * rr);
  };
  const profile = [
    [0.15, -0.05],
    [0.235, -0.052],
    [0.258, -0.04],
    [0.268, 0.0],
    [0.277, 0.08],
    [0.272, 0.093],
    [0.26, 0.087],
    [0.25, 0.0],
    [0.24, -0.032],
    [0.15, -0.035],
  ].map(([r, y]) => new THREE.Vector2(r, y));
  const brim = new THREE.LatheGeometry(profile, 48);
  b.add(warp(brim, pinch), felt);
  brim.dispose();
  const edge: THREE.Vector3[] = [];
  for (let i = 0; i < 48; i++) {
    const a = (i / 48) * Math.PI * 2;
    edge.push(pinch(new THREE.Vector3(Math.sin(a) * 0.268, 0.093, Math.cos(a) * 0.268)));
  }
  const braid = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(edge, true, 'catmullrom', 0.3), 72, 0.011, 4, true);
  b.add(braid, gold);
  braid.dispose();
  b.add(dome(22, 8), felt, { pos: [0, -0.04, 0], scale: [0.168, 0.15, 0.172] });
  b.add(cyl(28), '#1a171e', { pos: [0, -0.03, 0], scale: [0.17, 0.02, 0.174] });
  // The skull and crossbones, facing out and a little up from the front of the crown.
  const F = new THREE.Matrix4().compose(new THREE.Vector3(0, 0.055, 0.142), new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), new THREE.Vector3(0, 0.45, 1).normalize()), new THREE.Vector3(1.3, 1.3, 1.3));
  for (const side of [-1, 1]) {
    const a = side * 0.8;
    const along = new THREE.Vector3(-Math.sin(a), Math.cos(a), 0);
    const across = new THREE.Vector3(Math.cos(a), Math.sin(a), 0);
    b.add(cyl(6), bone, { pos: [0, 0, 0.004], rot: [0, 0, a], scale: [0.0055, 0.07, 0.0055] }, F);
    for (const end of [-1, 1]) {
      for (const s of [-1, 1]) {
        const p = along.clone().multiplyScalar(end * 0.035).addScaledVector(across, s * 0.0055);
        b.add(sph(5, 4), bone, { pos: [p.x, p.y, 0.004], scale: 0.0075 }, F);
      }
    }
  }
  b.add(sph(10, 8), bone, { pos: [0, 0.006, 0.008], scale: [0.024, 0.022, 0.012] }, F);
  b.add(sph(8, 6), bone, { pos: [0, -0.013, 0.008], scale: [0.014, 0.011, 0.01] }, F);
  for (const side of [-1, 1]) b.add(sph(6, 4), '#1a1618', { pos: [side * 0.009, 0.004, 0.018], scale: [0.0065, 0.0075, 0.004] }, F);
  return finish(b, { top: 0.11 });
}

function toadstool(): BuiltHat {
  const b = new Builder();
  const red = '#d8343a';
  const pale = '#f2e8d4';
  // A short pale stalk round the head with a frilly ring at its foot, and a big red cap domed over it, a good deal
  // wider than the head and curling under at the rim, with cream gills underneath and white spots.
  b.add(cyl(28, 0.93, 1), pale, { pos: [0, -0.075, 0], scale: [0.215, 0.09, 0.215] });
  b.add(torus(0.22, 5, 24), '#e8dcc4', { pos: [0, -0.115, 0], rot: [Math.PI / 2, 0, 0], scale: [0.222, 0.222, 0.12] });
  const Rc = 0.345;
  const Hc = 0.215;
  const y0 = -0.035;
  const capAt = (t: number) => new THREE.Vector2(Rc * Math.sin(t), y0 + Hc * Math.cos(t));
  const cap: THREE.Vector2[] = [];
  for (let i = 0; i <= 10; i++) cap.push(capAt(1.72 * (1 - i / 10)));
  cap[cap.length - 1].x = 0.001;
  const outer = new THREE.LatheGeometry(cap, 36);
  b.add(outer, red);
  outer.dispose();
  const rim = capAt(1.72);
  const under = new THREE.LatheGeometry([new THREE.Vector2(0.19, -0.03), new THREE.Vector2(0.27, -0.05), rim], 36);
  b.add(under, '#ecdcbc');
  under.dispose();
  for (let i = 0; i < 18; i++) {
    const a = (i / 18) * Math.PI * 2;
    b.add(new THREE.BoxGeometry(1, 1, 1), '#d2bf98', { pos: [Math.sin(a) * 0.265, -0.05, Math.cos(a) * 0.265], rot: [0, a, 0], scale: [0.004, 0.006, 0.13] });
  }
  // Spots of all sizes spread over the cap (even area from the rim to the top, turning by the golden angle).
  const spot = sph(6, 4);
  const N = 15;
  for (let i = 0; i < N; i++) {
    const t = Math.acos(Math.cos(0.1) - ((i + 0.5) / N) * (Math.cos(0.1) - Math.cos(1.45)));
    const a = i * 2.39996;
    const p2 = capAt(t);
    const n = new THREE.Vector3(Math.sin(a) * (Math.sin(t) / Rc), Math.cos(t) / Hc, Math.cos(a) * (Math.sin(t) / Rc)).normalize();
    const s = 0.03 + ((i * 7) % 5) * 0.006;
    const p = new THREE.Vector3(Math.sin(a) * p2.x, p2.y, Math.cos(a) * p2.x).addScaledVector(n, 0.002);
    b.add(spot, '#fbf8f2', new THREE.Matrix4().compose(p, new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), n), new THREE.Vector3(s, s, s * 0.3)));
  }
  spot.dispose();
  return finish(b, { top: 0.19 });
}

function headband(): BuiltHat {
  const b = new Builder();
  const teal = '#1fb3a6';
  // A thick, puffy terry sweatband round the brow, tipped down a little at the front, ribbed, with a white stripe
  // round the middle. The top of the head stays bare.
  const tilt = new THREE.Matrix4().makeRotationX(0.16);
  const ring = new THREE.LatheGeometry(
    [
      [0.236, -0.136],
      [0.25, -0.143],
      [0.263, -0.13],
      [0.268, -0.1],
      [0.258, -0.068],
      [0.242, -0.06],
      [0.224, -0.066],
      [0.236, -0.136],
    ].map(([r, y]) => new THREE.Vector2(r, y)),
    40,
  );
  b.add(ring, teal, {}, tilt);
  ring.dispose();
  for (let i = 0; i < 30; i++) {
    const a = (i / 30) * Math.PI * 2;
    b.add(cyl(4), '#189e93', { pos: [Math.sin(a) * 0.262, -0.1, Math.cos(a) * 0.262], rot: [0, a, 0], scale: [0.006, 0.06, 0.006] }, tilt);
  }
  b.add(new THREE.CylinderGeometry(1, 1, 1, 40, 1, true), '#fbf8f2', { pos: [0, -0.1, 0], scale: [0.272, 0.024, 0.272] }, tilt);
  return finish(b, { top: 0.0 });
}

function candle(): BuiltHat {
  const b = new Builder();
  const brass = '#e0b44e';
  const wax = '#f6ecd2';
  // A brass chamberstick sat on the head: a shallow dish with a rolled rim and a finger ring, a socket, and a cream
  // candle with a drip of wax down the front. The flame glows on its own and flickers.
  const dish = new THREE.LatheGeometry(
    [
      [0.001, -0.03],
      [0.12, -0.03],
      [0.146, -0.016],
      [0.154, 0.008],
      [0.142, 0.012],
      [0.13, -0.01],
      [0.001, -0.014],
    ].map(([r, y]) => new THREE.Vector2(r, y)),
    32,
  );
  b.add(dish, brass);
  dish.dispose();
  b.add(torus(0.25, 5, 32), '#f0c862', { pos: [0, 0.01, 0], rot: [Math.PI / 2, 0, 0], scale: [0.149, 0.149, 0.04] });
  b.add(torus(0.28, 5, 20), '#f0c862', { pos: [0.19, 0.0, 0], scale: [0.042, 0.042, 0.036] });
  b.add(cyl(16), '#c0923e', { pos: [0, 0.018, 0], scale: [0.056, 0.064, 0.056] });
  b.add(torus(0.25, 5, 18), brass, { pos: [0, 0.05, 0], rot: [Math.PI / 2, 0, 0], scale: [0.058, 0.058, 0.07] });
  b.add(cyl(16), wax, { pos: [0, 0.12, 0], scale: [0.042, 0.18, 0.042] });
  b.add(torus(0.3, 4, 16), '#fbf4e2', { pos: [0, 0.207, 0], rot: [Math.PI / 2, 0, 0], scale: [0.04, 0.04, 0.035] });
  b.add(cyl(5), '#2a2220', { pos: [0, 0.222, 0], scale: [0.005, 0.028, 0.005] });
  // The drip: a dribble from the top down the front and a bead at the end of it.
  const d = new THREE.Vector3(Math.sin(0.5), 0, Math.cos(0.5));
  b.add(sph(8, 6), wax, { pos: [d.x * 0.041, 0.18, d.z * 0.041], rot: [0, 0.5, 0], scale: [0.013, 0.035, 0.009] });
  b.add(sph(8, 6), wax, { pos: [d.x * 0.045, 0.145, d.z * 0.045], scale: 0.013 });
  const built = finish(b, { top: 0.36 });
  // The flame: a pale yellow bulb with an orange tip, and a soft glow round it.
  const f = new Builder();
  const drop = new THREE.LatheGeometry(
    [
      [0.001, 0.0],
      [0.022, 0.012],
      [0.031, 0.036],
      [0.026, 0.066],
      [0.013, 0.094],
      [0.001, 0.12],
    ].map(([r, y]) => new THREE.Vector2(r, y)),
    12,
  );
  f.add(drop, '#ffa23a');
  drop.dispose();
  f.add(sph(10, 7), '#fff2a8', { pos: [0, 0.033, 0], scale: [0.032, 0.034, 0.032] });
  const flameMat = new THREE.MeshBasicMaterial({ vertexColors: true });
  const flame = f.mesh(flameMat, { cast: false, receive: false });
  const glowMat = new THREE.MeshBasicMaterial({ color: '#ff9a40', transparent: true, opacity: 0.2, depthWrite: false, blending: THREE.AdditiveBlending });
  const glow = new THREE.Mesh(new THREE.SphereGeometry(0.052, 12, 9), glowMat);
  glow.position.y = 0.045;
  glow.castShadow = false;
  const holder = new THREE.Group();
  holder.position.y = 0.232;
  holder.add(flame, glow);
  built.group.add(holder);
  built.materials.push(flameMat, glowMat);
  built.update = (t) => {
    const s = 1 + Math.sin(t * 11) * 0.07 + Math.sin(t * 17.3) * 0.04;
    flame.scale.set(1 / Math.sqrt(s), s, 1 / Math.sqrt(s));
    flame.rotation.z = Math.sin(t * 3.7) * 0.08 + Math.sin(t * 9.1) * 0.03;
    glowMat.opacity = 0.17 + Math.sin(t * 13) * 0.04;
  };
  return built;
}

function postie(): BuiltHat {
  const b = new Builder();
  const navy = '#24365f';
  const red = '#c8302c';
  // A postie's peaked cap: a red band, a navy crown a little wider at the top with red piping round it, a shiny black
  // peak with a strap and two brass buttons above it, and a red and white envelope badge on the front.
  b.add(cyl(32), red, { pos: [0, -0.03, 0], scale: [0.19, 0.055, 0.195] });
  b.add(cyl(36, 1, 0.9), navy, { pos: [0, 0.03, -0.004], scale: [0.225, 0.065, 0.231] });
  b.add(dome(28, 5), navy, { pos: [0, 0.0625, -0.004], scale: [0.225, 0.03, 0.231] });
  b.add(torus(0.035, 5, 36), red, { pos: [0, 0.0625, -0.004], rot: [Math.PI / 2, 0, 0], scale: [0.226, 0.232, 0.226] });
  const peak = new THREE.CylinderGeometry(1, 1, 1, 24, 1, false, -Math.PI / 2, Math.PI);
  b.add(peak, '#15151a', { pos: [0, -0.055, 0.12], rot: [0.22, 0, 0], scale: [0.18, 0.014, 0.15] });
  peak.dispose();
  const strap = new THREE.TorusGeometry(1, 0.04, 4, 18, (Math.PI * 2) / 3).rotateZ(Math.PI / 6);
  b.add(strap, '#1e1e24', { pos: [0, -0.042, 0], rot: [Math.PI / 2, 0, 0], scale: [0.194, 0.199, 0.16] });
  strap.dispose();
  for (const side of [-1, 1]) b.add(sph(8, 6), '#e2b23a', { pos: [side * 0.168, -0.042, 0.1], scale: 0.011 });
  // The badge: a white disc with a red edge and a little red and white envelope.
  const F = new THREE.Matrix4().compose(new THREE.Vector3(0, 0.03, 0.217), new THREE.Quaternion().setFromEuler(new THREE.Euler(0.2, 0, 0)), new THREE.Vector3(1, 1, 1));
  b.add(cyl(20), red, { rot: [Math.PI / 2, 0, 0], scale: [0.03, 0.008, 0.03] }, F);
  b.add(cyl(20), '#fbf8f2', { pos: [0, 0, 0.002], rot: [Math.PI / 2, 0, 0], scale: [0.024, 0.008, 0.024] }, F);
  b.add(new THREE.BoxGeometry(1, 1, 1), red, { pos: [0, 0, 0.006], scale: [0.028, 0.019, 0.004] }, F);
  b.add(new THREE.BoxGeometry(1, 1, 1), '#fbf8f2', { pos: [0, 0, 0.008], scale: [0.022, 0.013, 0.003] }, F);
  for (const side of [-1, 1]) b.add(new THREE.BoxGeometry(1, 1, 1), red, { pos: [side * 0.0055, 0.002, 0.0098], rot: [0, 0, side * 0.6], scale: [0.014, 0.0028, 0.002] }, F);
  return finish(b, { top: 0.1 });
}

function jester(): BuiltHat {
  const b = new Builder();
  const purple = '#7a3eb0';
  const gold = '#eebc3a';
  const red = '#d4343c';
  // A snug cap, purple on one side and red on the other, with a gold band; then three floppy points, purple and red
  // to either side and gold to the back, each drooping under its own weight to a little gold bell.
  for (const [start, color] of [
    [-Math.PI / 2, purple],
    [Math.PI / 2, red],
  ] as [number, string][]) {
    const g = new THREE.SphereGeometry(1, 12, 9, start, Math.PI, 0, Math.PI / 2);
    b.add(g, color, { pos: [0, -0.12, -0.01], scale: [0.28, 0.18, 0.29] });
    g.dispose();
  }
  b.add(cyl(30), gold, { pos: [0, -0.12, -0.01], scale: [0.287, 0.05, 0.297] });
  b.add(torus(0.12, 5, 30), '#d8a42e', { pos: [0, -0.095, -0.01], rot: [Math.PI / 2, 0, 0], scale: [0.287, 0.297, 0.1] });
  const points: [Vec3, Vec3, Vec3, string, string][] = [
    [[-0.09, 0.0, 0.0], [-0.7, 1, 0], [0, 0, 1], purple, '#6a34a0'],
    [[0.09, 0.0, 0.0], [0.7, 1, 0], [0, 0, -1], red, '#bc2c36'],
    [[0, 0.0, -0.09], [0, 1, -0.7], [-1, 0, 0], gold, '#d8a42e'],
  ];
  for (const [base, start, bendDir, c0, c1] of points) {
    const end = bentCone(b, (i) => (i % 2 ? c1 : c0), base, 0.085, 0.42, 7, 2.2, bendDir, start);
    // The bell hangs straight down from the tip on a little loop.
    b.add(torus(0.3, 3, 8), '#c8962a', { pos: [end[0], end[1] - 0.012, end[2]], scale: [0.012, 0.012, 0.012] });
    b.add(sph(9, 7), '#f4c94a', { pos: [end[0], end[1] - 0.04, end[2]], scale: 0.03 });
    b.add(torus(0.2, 3, 12), '#b8862a', { pos: [end[0], end[1] - 0.046, end[2]], rot: [Math.PI / 2, 0, 0], scale: [0.026, 0.026, 0.02] });
  }
  return finish(b, { top: 0.14 });
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
  lumberjack,
  souwester,
  mitre,
  chef,
  bowler,
  sunhat,
  headscarf,
  feathercap,
  sailor,
  leprechaun,
  clockmaker,
  propeller,
  reaper,
  horns,
  laurel,
  tricorn,
  toadstool,
  headband,
  candle,
  postie,
  jester,
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
