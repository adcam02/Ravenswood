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
