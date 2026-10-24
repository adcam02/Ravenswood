import * as THREE from 'three';
import { Builder, jitter, placeMatrix, rng, soft, wet, type Place, type Vec3 } from './build';
import type { HatId } from './types';
import { bearskin, beerhat, bicorne, birthday, centurion, hardhat, reindeer, sharkhat, tiara, topper, trophy } from './hatShop';

/**
 * The hats players earn and wear. Each is modelled for a reference head about half a metre across, with its origin at
 * the top of that head, and says how it's worn (its `sit`): fitHat, at the bottom, works out from that where it goes
 * on any animal's head. Everything is one vertex-coloured mesh, except the bits that glow on their
 * own (the halo, the candle's flame, the jack-o'-lantern's face, the robot's light strip and spark) and the bits that
 * move (the propeller, the tassels).
 */

export interface BuiltHat {
  group: THREE.Group;
  /** Meshes that turn ghostly with the wearer, and the material each normally wears. */
  solid: { mesh: THREE.Mesh; material: THREE.Material }[];
  /** Materials to dispose with the hat. */
  materials: THREE.Material[];
  /** How far the hat reaches above the head top, in reference metres (before the rig's scale). */
  top: number;
  /** How it's worn (see HatSit). */
  sit: HatSit;
  /** Gentle motion: the halo, the propeller, the candle flame, the tassels, the robot's spark and the lantern's flicker. */
  update?: (t: number) => void;
}

export const sph = (w: number, h: number) => new THREE.SphereGeometry(1, w, h);
export const dome = (w: number, h: number) => new THREE.SphereGeometry(1, w, h, 0, Math.PI * 2, 0, Math.PI / 2);
export const cyl = (n: number, top = 1, bottom = 1) => new THREE.CylinderGeometry(top, bottom, 1, n);
export const torus = (tube: number, radial: number, tubular: number) => new THREE.TorusGeometry(1, tube, radial, tubular);

/** A flat five-pointed star, a little thick, lying in the xy plane. */
export function starGeo(r = 1, inner = 0.45): THREE.BufferGeometry {
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
export function bentCone(b: Builder, colors: (i: number) => THREE.ColorRepresentation, base: Vec3, r0: number, height: number, segs: number, bend: number, bendDir: Vec3 = [-1, 0, 0], start: Vec3 = [0, 1, 0]): Vec3 {
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

/**
 * Like bentCone, but one smooth piece (for a soft cloth cap, where the joins between pieces would show): a cone of
 * `segs` rings round, bending `bend` radians as it rises, more towards the tip (where it's thin enough to fold
 * without creasing). Returns the geometry and where its point ends up.
 */
export function bentTube(base: Vec3, r0: number, height: number, segs: number, bend: number, bendDir: Vec3, start: Vec3, radial = 28): { geo: THREE.BufferGeometry; tip: Vec3 } {
  const rings: { at: THREE.Vector3; q: THREE.Quaternion }[] = [];
  let pos = new THREE.Vector3(...base);
  let dir = new THREE.Vector3(...start).normalize();
  const axis = new THREE.Vector3(...bendDir).normalize();
  const up = new THREE.Vector3(0, 1, 0);
  // Each ring's share of the bend grows with its height.
  const share = (i: number) => (i + 0.5) ** 1.6;
  let total = 0;
  for (let i = 0; i < segs; i++) total += share(i);
  for (let i = 0; i <= segs; i++) {
    rings.push({ at: pos.clone(), q: new THREE.Quaternion().setFromUnitVectors(up, dir) });
    pos = pos.clone().addScaledVector(dir, height / segs);
    dir = dir.clone().applyAxisAngle(axis, (bend * share(i)) / total).normalize();
  }
  const geo = warp(new THREE.CylinderGeometry(0, 1, 1, radial, segs, true), (v) => {
    const k = Math.round((v.y + 0.5) * segs);
    const ring = rings[k];
    return v.set(v.x * r0, 0, v.z * r0).applyQuaternion(ring.q).add(ring.at);
  });
  const tip = rings[segs].at;
  return { geo, tip: [tip.x, tip.y, tip.z] };
}

export function finish(b: Builder, extra: Partial<BuiltHat> & { top: number; sit: HatSit }, material = soft()): BuiltHat {
  const group = new THREE.Group();
  const mesh = b.mesh(material, { cast: true, receive: false });
  group.add(mesh);
  return { group, solid: [{ mesh, material }], materials: [material], ...extra, top: extra.top, sit: extra.sit };
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
  return finish(b, { top: 0.17, sit: { kind: 'snug', rim: [-0.17, 0.3] } });
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
  return finish(b, { top: 0.04, sit: { kind: 'ring', rim: [-0.07, 0.215] } });
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
  return finish(b, { top: H + 0.03, sit: { kind: 'perch', rim: [-0.03, 0.12] } });
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
  return finish(b, { top: 0.4, sit: { kind: 'brim', rim: [-0.03, 0.165] } });
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
  return finish(b, { top: 0.22, sit: { kind: 'brim', rim: [-0.035, 0.13] } });
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
  return finish(b, { top: 0.13, sit: { kind: 'perch', rim: [-0.05, 0.17] } });
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
  return finish(b, { top: 0.38, sit: { kind: 'brim', rim: [-0.02, 0.15] } });
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
    sit: { kind: 'float', rim: [0, 0.17] },
    update: (t) => {
      holder.position.y = 0.13 + Math.sin(t * 2.1) * 0.018;
      holder.rotation.z = Math.sin(t * 1.3) * 0.06;
      glowMat.opacity = 0.24 + Math.sin(t * 3.2) * 0.06;
    },
  };
}

// ---------------------------------------------------------------- the job hats, one for doing each job perfectly

/** A point on an ellipsoid (radii rx, ry, rz) at longitude a and latitude e, and the way out from it there. */
export function onShell(rx: number, ry: number, rz: number, a: number, e: number, y0: number): { p: THREE.Vector3; n: THREE.Vector3 } {
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
  return finish(b, { top: 0.17, sit: { kind: 'snug', rim: [-0.17, 0.3] } });
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
  return finish(b, { top: 0.11, sit: { kind: 'brim', rim: [-0.07, 0.2, 0.21], tilt: 0.35 } });
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
  return finish(b, { top: 0.36, sit: { kind: 'brim', rim: [-0.06, 0.175, 0.13] } });
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
  return finish(b, { top: 0.25, sit: { kind: 'brim', rim: [-0.065, 0.17] } });
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
  return finish(b, { top: 0.13, sit: { kind: 'brim', rim: [-0.04, 0.155, 0.165] } });
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
  return finish(b, { top: 0.1, sit: { kind: 'brim', rim: [-0.04, 0.165] } });
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
  return finish(b, { top: 0.08, sit: { kind: 'snug', rim: [-0.14, 0.3, 0.31] } });
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
  return finish(b, { top: 0.2, sit: { kind: 'brim', rim: [-0.03, 0.17, 0.24] } });
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
  return finish(b, { top: 0.08, sit: { kind: 'brim', rim: [-0.055, 0.17] } });
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
  return finish(b, { top: 0.2, sit: { kind: 'brim', rim: [-0.035, 0.135] } });
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
  return finish(b, { top: 0.21, sit: { kind: 'brim', rim: [-0.035, 0.14] } });
}

// ---------------------------------------------------------------- the achievement hats, and the secret ones

/** Turns a geometry's faces inside out, for linings seen from within. */
export function inward(g: THREE.BufferGeometry): THREE.BufferGeometry {
  const ix = g.getIndex()!;
  for (let i = 0; i < ix.count; i += 3) {
    const a = ix.getX(i + 1);
    ix.setX(i + 1, ix.getX(i + 2));
    ix.setX(i + 2, a);
  }
  return g;
}

/** Moves every vertex of a geometry through `f`. */
export function warp(g: THREE.BufferGeometry, f: (v: THREE.Vector3) => THREE.Vector3): THREE.BufferGeometry {
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
  const built = finish(b, { top: 0.15, sit: { kind: 'snug', rim: [-0.12, 0.27, 0.28] } });
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
  return finish(b, { top: 0.15, sit: { kind: 'hood', rim: [-0.2, 0.31, 0.3], open: [0, -0.52, 0.85, 0.35] } });
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
  return finish(b, { top: 0.12, sit: { kind: 'perch', rim: [-0.06, 0.16], among: true } }, wet());
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
  return finish(b, { top: 0.04, sit: { kind: 'ring', rim: [-0.075, 0.222] } });
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
  return finish(b, { top: 0.11, sit: { kind: 'brim', rim: [-0.04, 0.168, 0.172] } });
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
  return finish(b, { top: 0.19, sit: { kind: 'brim', rim: [-0.12, 0.215] } });
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
  return finish(b, { top: 0.0, sit: { kind: 'band', rim: [-0.14, 0.236] } });
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
  const built = finish(b, { top: 0.36, sit: { kind: 'perch', rim: [-0.03, 0.12] } });
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
  return finish(b, { top: 0.1, sit: { kind: 'brim', rim: [-0.0575, 0.19, 0.195] } });
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
  return finish(b, { top: 0.14, sit: { kind: 'snug', rim: [-0.145, 0.287, 0.297] } });
}

// ---------------------------------------------------------------- the pop-culture hats

/** A copy of a geometry with each triangle painted its own colour (picked by its index and centre), for addColored. */
function paintFaces(geo: THREE.BufferGeometry, paint: (i: number, centre: THREE.Vector3) => THREE.ColorRepresentation): THREE.BufferGeometry {
  const src = geo.index ? geo.toNonIndexed() : geo;
  const pos = src.getAttribute('position') as THREE.BufferAttribute;
  const out = new THREE.BufferGeometry();
  out.setAttribute('position', pos.clone());
  const colors = new Float32Array(pos.count * 3);
  const c = new THREE.Color();
  const m = new THREE.Vector3();
  const v = new THREE.Vector3();
  for (let i = 0; i + 2 < pos.count; i += 3) {
    m.set(0, 0, 0);
    for (let k = 0; k < 3; k++) m.add(v.fromBufferAttribute(pos, i + k));
    c.set(paint(i / 3, m.divideScalar(3)));
    for (let k = 0; k < 3; k++) colors.set([c.r, c.g, c.b], (i + k) * 3);
  }
  out.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  if (src !== geo) src.dispose();
  return out;
}

/** A thin rod from a to b (a cord, a strut), as a placement for a unit cylinder. */
export function rod(a: THREE.Vector3, b: THREE.Vector3, r: number): THREE.Matrix4 {
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize());
  return new THREE.Matrix4().compose(a.clone().add(b).multiplyScalar(0.5), q, new THREE.Vector3(r, a.distanceTo(b), r));
}

/**
 * A brim: a ring from rIn out to rOut with a rounded edge, then bent up or down by `bend` (given where a point is and
 * how far out across the brim, 0 to 1). Longer front to back by `oval`.
 */
export function brimGeo(rIn: number, rOut: number, thick: number, segs: number, bend: (x: number, z: number, t: number) => number, oval = 1): THREE.BufferGeometry {
  const pts: THREE.Vector2[] = [];
  const n = 6;
  for (let i = 0; i <= n; i++) pts.push(new THREE.Vector2(rIn + ((rOut - rIn) * i) / n, -thick / 2));
  pts.push(new THREE.Vector2(rOut + thick * 0.45, 0));
  for (let i = n; i >= 0; i--) pts.push(new THREE.Vector2(rIn + ((rOut - rIn) * i) / n, thick / 2));
  return warp(new THREE.LatheGeometry(pts, segs), (v) => {
    const t = THREE.MathUtils.clamp((Math.hypot(v.x, v.z) - rIn) / (rOut - rIn), 0, 1.05);
    v.y += bend(v.x, v.z, t);
    v.z *= oval;
    return v;
  });
}

/**
 * A cord with a tassel on the end, hanging from `at` (hat space) as its own mesh so it can swing a little about the
 * top of the cord. Returns what to turn.
 */
function hangTassel(built: BuiltHat, at: Vec3, colour: string, knot: string, cord: number, size: number): THREE.Object3D {
  const t = new Builder();
  t.add(cyl(6), colour, { pos: [0, -cord / 2, 0], scale: [0.0055, cord + 0.004, 0.0055] });
  t.add(sph(10, 7), knot, { pos: [0, -cord - size * 0.1, 0], scale: [size * 0.2, size * 0.22, size * 0.2] });
  t.add(cyl(16, 0.45, 1), colour, { pos: [0, -cord - size * 0.62, 0], scale: [size * 0.3, size, size * 0.3] });
  // A few strands loose at the bottom.
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    t.add(cyl(4), colour, { pos: [Math.sin(a) * size * 0.2, -cord - size * 1.12, Math.cos(a) * size * 0.2], rot: [Math.cos(a) * 0.2, 0, -Math.sin(a) * 0.2], scale: [size * 0.05, size * 0.16, size * 0.05] });
  }
  const material = soft();
  const mesh = t.mesh(material, { cast: true, receive: false });
  const holder = new THREE.Group();
  holder.position.set(...at);
  holder.add(mesh);
  built.group.add(holder);
  built.solid.push({ mesh, material });
  built.materials.push(material);
  return holder;
}

/** A gentle swing for a hanging tassel, a little different on every hat. */
const swing = (o: THREE.Object3D, t: number, k = 1) => {
  o.rotation.z = (Math.sin(t * 1.9) * 0.12 + Math.sin(t * 3.1) * 0.04) * k;
  o.rotation.x = Math.sin(t * 1.4 + 1) * 0.08 * k;
};

function fez(): BuiltHat {
  const b = new Builder();
  const red = '#b51d2f';
  const ink = '#1b191d';
  // A short deep-red felt fez worn at a jaunty angle off to one side (fezzes are cool), with a black tassel on a
  // button in the middle of the top, its cord running over the edge and the tassel swinging free.
  const F = new THREE.Matrix4().compose(new THREE.Vector3(0.03, -0.07, 0.02), new THREE.Quaternion().setFromEuler(new THREE.Euler(-0.1, 0, -0.3)), new THREE.Vector3(1, 1, 1));
  const H = 0.27;
  const rBot = 0.152;
  const rTop = 0.12;
  b.add(cyl(30, rTop / rBot, 1), red, { pos: [0, H / 2, 0], scale: [rBot, H, rBot] }, F);
  const roll = new THREE.TorusGeometry(rTop - 0.005, 0.006, 4, 30).rotateX(Math.PI / 2);
  b.add(roll, '#a01a2a', { pos: [0, H - 0.001, 0] }, F);
  roll.dispose();
  b.add(cyl(14), ink, { pos: [0, H + 0.008, 0], scale: [0.026, 0.018, 0.026] }, F);
  // The cord over the top and down the low side, where it hangs clear of the felt.
  const edge = new THREE.Vector3(0.088, H + 0.006, 0.075);
  b.add(cyl(6), ink, rod(new THREE.Vector3(0, H + 0.014, 0), edge, 0.0065), F);
  const built = finish(b, { top: 0.2, sit: { kind: 'perch', rim: [-0.07, 0.152] } });
  const hang = edge.clone().add(new THREE.Vector3(0.006, 0, 0.006)).applyMatrix4(F);
  const tassel = hangTassel(built, hang.toArray(), ink, '#2c282e', 0.05, 0.085);
  built.update = (t) => swing(tassel, t);
  return built;
}

function deerstalker(): BuiltHat {
  const b = new Builder();
  const tweed = ['#c4a578', '#94744c', '#5c4430'];
  const flapTweed = ['#dcc39a', '#b08e62', '#7a5c40'];
  // Sherlock Holmes's deerstalker: a snug crown in a brown tweed check, a peak at the front and another at the back,
  // and the ear flaps turned up and tied over the top with a little bow.
  const C: Vec3 = [0, -0.11, -0.005];
  const R: Vec3 = [0.262, 0.205, 0.275];
  const place = (k: number) => placeMatrix({ pos: C, scale: [R[0] * k, R[1] * k, R[2] * k] });
  // The check: light where both stripes are pale, dark where both are dark, in between elsewhere. Cells are counted
  // in longitude (a) and down from the crown (t).
  const check = (v: THREE.Vector3, cellA: number, cellT: number, a0 = 0, t0 = 0, shades = tweed) => {
    const a = Math.atan2(v.x, v.z) + Math.PI - a0;
    const t = Math.acos(THREE.MathUtils.clamp(v.y / v.length(), -1, 1)) - t0;
    const i = Math.floor(a / cellA + 1000);
    const j = Math.floor(t / cellT + 1000);
    return shades[(i % 2) + (j % 2)];
  };
  const crown = new THREE.SphereGeometry(1, 32, 10, 0, Math.PI * 2, 0, Math.PI / 2);
  b.addColored(paintFaces(crown, (_, c) => check(c, Math.PI / 8, Math.PI / 10)), place(1));
  crown.dispose();
  b.add(torus(0.03, 4, 36), tweed[2], { pos: C, rot: [Math.PI / 2, 0, 0], scale: [R[0] + 0.002, R[2] + 0.002, 0.25] });
  // The peaks, curving down a touch, with a dark binding round the edge.
  for (const [side, len] of [
    [1, 0.29],
    [-1, 0.26],
  ]) {
    const peak = warp(new THREE.CylinderGeometry(1, 1, 1, 20, 1, false, -Math.PI / 2, Math.PI), (v) => v.set(v.x * 0.215, v.y * 0.014 - 0.035 * v.z * v.z - 0.012 * v.x * v.x, v.z * len));
    const at: Place = { pos: [0, C[1] + 0.008, C[2] + side * 0.12], rot: [side * 0.12, side > 0 ? 0 : Math.PI, 0] };
    b.add(peak, tweed[1], at);
    peak.dispose();
    const rim = new THREE.CatmullRomCurve3(Array.from({ length: 11 }, (_, i) => {
      const a = -Math.PI / 2 + (i / 10) * Math.PI;
      const x = Math.sin(a);
      const z = Math.cos(a);
      return new THREE.Vector3(x * 0.215, -0.035 * z * z - 0.012 * x * x, z * len);
    }));
    const g = new THREE.TubeGeometry(rim, 20, 0.008, 4, false);
    b.add(g, tweed[2], at);
    g.dispose();
  }
  // The ear flaps, turned up against the sides in a check of their own, bound round the edge.
  const flapA = 0.6;
  const flapT: [number, number] = [0.34, 1.5];
  for (const side of [-1, 1]) {
    const phi = side > 0 ? Math.PI : 0;
    const g = new THREE.SphereGeometry(1, 6, 8, phi - flapA, flapA * 2, flapT[0], flapT[1] - flapT[0]);
    b.addColored(paintFaces(g, (_, c) => check(c, (flapA * 2) / 3, (flapT[1] - flapT[0]) / 4, phi - flapA + Math.PI / 2 + 0.001, flapT[0] + 0.001, flapTweed)), place(1.06));
    g.dispose();
    const k = 1.065;
    const on = (p: number, t: number) => new THREE.Vector3(-Math.cos(p) * Math.sin(t) * R[0] * k, C[1] + Math.cos(t) * R[1] * k, C[2] + Math.sin(p) * Math.sin(t) * R[2] * k);
    const ring: THREE.Vector3[] = [];
    for (let i = 0; i < 5; i++) ring.push(on(phi - flapA + (i / 4) * flapA * 2, flapT[0]));
    for (let i = 1; i < 5; i++) ring.push(on(phi + flapA, flapT[0] + (i / 4) * (flapT[1] - flapT[0])));
    for (let i = 1; i < 5; i++) ring.push(on(phi + flapA - (i / 4) * flapA * 2, flapT[1]));
    for (let i = 1; i < 4; i++) ring.push(on(phi - flapA, flapT[1] - (i / 4) * (flapT[1] - flapT[0])));
    const tube = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(ring, true, 'catmullrom', 0.2), 36, 0.0075, 4, true);
    b.add(tube, tweed[2]);
    tube.dispose();
    // The tie, from the top of the flap up to the bow.
    b.add(cyl(5), tweed[2], rod(on(phi, flapT[0] + 0.05), new THREE.Vector3(side * 0.02, C[1] + R[1] * 1.06 + 0.008, C[2]), 0.006));
  }
  // The bow on top.
  const top = new THREE.Vector3(0, C[1] + R[1] * 1.06 + 0.012, C[2]);
  b.add(sph(8, 6), tweed[2], { pos: top.toArray(), scale: [0.02, 0.017, 0.02] });
  for (const side of [-1, 1]) {
    b.add(sph(10, 6), tweed[2], { pos: [side * 0.034, top.y + 0.008, top.z], rot: [0, 0, side * 0.45], scale: [0.038, 0.019, 0.017] });
    b.add(new THREE.BoxGeometry(1, 1, 1), tweed[2], { pos: [side * 0.012, top.y - 0.008, top.z + side * 0.03], rot: [side * 0.9, side * 0.4, 0], scale: [0.012, 0.004, 0.05] });
  }
  return finish(b, { top: 0.12, sit: { kind: 'snug', rim: [-0.11, 0.262, 0.275] } });
}

function tinfoil(): BuiltHat {
  const b = new Builder();
  const shades = ['#f4f6f8', '#dde2e7', '#c3cad1', '#e9edf0', '#a9b2bb', '#cfd5db'];
  const r = rng(11);
  const pick = () => shades[Math.floor(r() * shades.length)];
  // A tin foil hat: a lopsided cone of crumpled kitchen foil, all irregular facets, scrunched into a lumpy roll round
  // the edge, with the point twisted into a little antenna. Shiny, and lit facet by facet.
  const lean = (v: THREE.Vector3) => {
    const k = Math.max(0, (v.y + 0.07) / 0.34);
    v.x += 0.05 * k * k;
    v.z -= 0.015 * k;
    return v;
  };
  const profile = [
    [0.198, -0.07],
    [0.186, -0.03],
    [0.165, 0.025],
    [0.14, 0.08],
    [0.11, 0.135],
    [0.078, 0.185],
    [0.047, 0.228],
    [0.02, 0.258],
    [0, 0.27],
  ].map(([x, y]) => new THREE.Vector2(x, y));
  const shell = warp(new THREE.LatheGeometry(profile, 15), lean);
  jitter(shell, 0.032, 5);
  b.addColored(paintFaces(shell, pick));
  shell.dispose();
  // The rolled edge, scrunched.
  const roll = new THREE.TorusGeometry(0.2, 0.024, 5, 22).rotateX(Math.PI / 2).translate(0, -0.066, 0);
  jitter(roll, 0.03, 9);
  b.addColored(paintFaces(roll, pick));
  roll.dispose();
  // The antenna: two strands of foil twisted round each other, and a scrunched ball on the end.
  const tip = lean(new THREE.Vector3(0, 0.255, 0));
  for (const phase of [0, Math.PI]) {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 8; i++) {
      const a = phase + i * 1.1;
      pts.push(new THREE.Vector3(tip.x + Math.sin(a) * 0.01 + i * 0.002, tip.y + i * 0.011, tip.z + Math.cos(a) * 0.01));
    }
    const g = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 16, 0.0065, 4, false);
    b.addColored(paintFaces(g, pick));
    g.dispose();
  }
  const ball = new THREE.IcosahedronGeometry(0.024, 1).translate(tip.x + 0.018, tip.y + 0.098, tip.z);
  jitter(ball, 0.012, 3);
  b.addColored(paintFaces(ball, pick));
  ball.dispose();
  const material = new THREE.MeshPhongMaterial({ vertexColors: true, flatShading: true, specular: '#ffffff', shininess: 70, emissive: '#3a4048' });
  const group = new THREE.Group();
  const mesh = b.mesh(material, { cast: true, receive: false, crease: 0 });
  group.add(mesh);
  return { group, solid: [{ mesh, material }], materials: [material], top: 0.36, sit: { kind: 'brim', rim: [-0.07, 0.198] } };
}

function trainer(): BuiltHat {
  const b = new Builder();
  const red = '#d9302c';
  const white = '#f8f6f0';
  // A pocket-monster trainer's cap: a red front and a white back, a button on top, a short peak curving down at the
  // sides, and a green half-moon badge on a white patch on the front.
  const C: Vec3 = [0, -0.12, -0.01];
  const R: Vec3 = [0.265, 0.2, 0.278];
  for (const [start, color] of [
    [0, red],
    [Math.PI, white],
  ] as [number, string][]) {
    const g = new THREE.SphereGeometry(1, 14, 9, start, Math.PI, 0, Math.PI / 2);
    b.add(g, color, { pos: C, scale: R });
    g.dispose();
  }
  // A seam over the top where the red meets the white, and a band round the bottom.
  const seam = new THREE.TorusGeometry(1, 0.03, 4, 20, Math.PI);
  b.add(seam, '#c22a26', { pos: C, scale: [R[0] + 0.003, R[1] + 0.003, 0.28] });
  seam.dispose();
  b.add(torus(0.04, 4, 32), '#c22a26', { pos: [C[0], C[1] + 0.012, C[2]], rot: [Math.PI / 2, 0, 0], scale: [R[0], R[2], 0.25] });
  b.add(cyl(14), red, { pos: [C[0], C[1] + R[1] + 0.004, C[2]], scale: [0.03, 0.022, 0.03] });
  // The peak.
  const peak = warp(new THREE.CylinderGeometry(1, 1, 1, 22, 1, false, -Math.PI / 2, Math.PI), (v) => v.set(v.x * 0.215, v.y * 0.016 - 0.05 * v.x * v.x, v.z * 0.29));
  b.add(peak, red, { pos: [0, C[1] + 0.012, 0.105], rot: [0.1, 0, 0] });
  peak.dispose();
  // The badge, facing out from the front of the crown.
  const { p, n } = onShell(R[0], R[1], R[2], 0, 0.52, C[1]);
  p.z += C[2];
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), n);
  const disc = (thetaStart: number, len: number) => new THREE.CylinderGeometry(1, 1, 1, 22, 1, false, thetaStart, len).rotateX(Math.PI / 2);
  const patch = disc(0, Math.PI * 2);
  b.add(patch, white, new THREE.Matrix4().compose(p.clone().addScaledVector(n, 0.002), q, new THREE.Vector3(0.062, 0.062, 0.01)));
  patch.dispose();
  const moon = disc(Math.PI / 2, Math.PI);
  b.add(moon, '#2fa84f', new THREE.Matrix4().compose(p.clone().addScaledVector(n, 0.006).addScaledVector(new THREE.Vector3(0, 1, 0).applyQuaternion(q), -0.012), q, new THREE.Vector3(0.046, 0.046, 0.01)));
  moon.dispose();
  return finish(b, { top: 0.09, sit: { kind: 'snug', rim: [-0.12, 0.265, 0.278] } });
}

function madhatter(): BuiltHat {
  const b = new Builder();
  const felt = '#4c7656';
  const band = '#df8a35';
  const card = '#f6eedb';
  const ink = '#2b2328';
  // The Mad Hatter's hat: a tall top hat, flaring as it rises and leaning crooked, worn and patched, with a wide
  // ribbon band and the 10/6 price card still tucked in it.
  const H = 0.44;
  const y0 = -0.04;
  const rAt = (y: number) => 0.128 + 0.068 * Math.max(0, (y - y0) / H) ** 1.3;
  // Crooked: it leans over to one side and a little back, wobbles, and the top is knocked askew.
  const crook = (v: THREE.Vector3) => {
    const k = Math.max(0, (v.y - y0) / H);
    const a = Math.atan2(v.x, v.z);
    const w = 1 + 0.03 * Math.sin(3 * a + k * 7) * k;
    v.x *= w;
    v.z *= w;
    v.x += 0.085 * k * k - 0.02 * Math.sin(k * Math.PI);
    v.z -= 0.025 * k;
    v.y += 0.04 * k * k * (v.x / 0.2);
    return v;
  };
  const brim = brimGeo(0.1, 0.225, 0.016, 44, (x, z, t) => -0.035 + 0.055 * t * t * (x * x) / (x * x + z * z + 1e-6) - 0.006 * t);
  b.add(brim, felt);
  brim.dispose();
  const prof: THREE.Vector2[] = [];
  for (let i = 0; i <= 10; i++) {
    const y = y0 + (H * i) / 10;
    prof.push(new THREE.Vector2(rAt(y), y));
  }
  prof.push(new THREE.Vector2(rAt(y0 + H) - 0.012, y0 + H + 0.006), new THREE.Vector2(0.001, y0 + H - 0.006));
  const crown = warp(new THREE.LatheGeometry(prof, 32), crook);
  b.add(crown, felt);
  crown.dispose();
  // The wide ribbon band round the bottom of the crown.
  const bandTop = 0.085;
  const ring = warp(
    new THREE.LatheGeometry(
      [
        [rAt(-0.03) + 0.004, -0.03],
        [rAt(-0.02) + 0.011, -0.02],
        [rAt(bandTop - 0.01) + 0.011, bandTop - 0.01],
        [rAt(bandTop) + 0.003, bandTop],
      ].map(([x, y]) => new THREE.Vector2(x, y)),
      32,
    ),
    crook,
  );
  b.add(ring, band);
  ring.dispose();
  // Two patches sewn on, with big stitches round them.
  for (const [a, y, color, tilt] of [
    [-0.95, 0.21, '#8a4f8f', 0.25],
    [2.5, 0.28, '#d8b456', -0.3],
  ] as [number, number, string, number][]) {
    const p = crook(new THREE.Vector3(Math.sin(a) * (rAt(y) + 0.003), y, Math.cos(a) * (rAt(y) + 0.003)));
    const M = new THREE.Matrix4().compose(p, new THREE.Quaternion().setFromEuler(new THREE.Euler(-0.05, a, tilt, 'YXZ')), new THREE.Vector3(1, 1, 1));
    b.add(new THREE.BoxGeometry(1, 1, 1), color, { scale: [0.07, 0.065, 0.006] }, M);
    for (let i = 0; i < 4; i++) {
      const s = -0.024 + i * 0.016;
      for (const [x, y2, rz] of [
        [s, 0.03, 0],
        [s, -0.03, 0],
        [0.033, s, Math.PI / 2],
        [-0.033, s, Math.PI / 2],
      ]) {
        b.add(new THREE.BoxGeometry(1, 1, 1), '#f2e8d2', { pos: [x, y2, 0.004], rot: [0, 0, rz + 0.5], scale: [0.009, 0.0028, 0.003] }, M);
      }
    }
  }
  // The card, tucked in behind the band at the front and leaning out, with "10/6" on it in seven-segment strokes and
  // two lines of small print over it.
  const a = 0.22;
  const base = crook(new THREE.Vector3(Math.sin(a) * (rAt(0.03) + 0.0015), 0.03, Math.cos(a) * (rAt(0.03) + 0.0015)));
  const K = new THREE.Matrix4().compose(base, new THREE.Quaternion().setFromEuler(new THREE.Euler(0.22, a, -0.2, 'YXZ')), new THREE.Vector3(1, 1, 1));
  b.add(new THREE.BoxGeometry(1, 1, 1), card, { pos: [0, 0.07, 0], scale: [0.095, 0.14, 0.003] }, K);
  const w = 0.016;
  const h = 0.03;
  const st = 0.0046;
  const seg: Record<string, [number, number, boolean]> = {
    a: [0, h / 2, true],
    b: [w / 2, h / 4, false],
    c: [w / 2, -h / 4, false],
    d: [0, -h / 2, true],
    e: [-w / 2, -h / 4, false],
    f: [-w / 2, h / 4, false],
    g: [0, 0, true],
  };
  const ty = 0.095;
  for (const [x0, segs] of [
    [-0.039, 'bc'],
    [-0.016, 'abcdef'],
    [0.028, 'acdefg'],
  ] as [number, string][]) {
    for (const s of segs) {
      const [x, y, flat] = seg[s];
      b.add(new THREE.BoxGeometry(1, 1, 1), ink, { pos: [x0 + x, ty + y, 0.002], scale: flat ? [w + st * 0.6, st, 0.002] : [st, h / 2 + st * 0.6, 0.002] }, K);
    }
  }
  b.add(new THREE.BoxGeometry(1, 1, 1), ink, { pos: [0.006, ty, 0.002], rot: [0, 0, -0.45], scale: [st, h + 0.006, 0.002] }, K);
  for (const [y, len] of [
    [0.128, 0.06],
    [0.12, 0.044],
  ]) {
    b.add(new THREE.BoxGeometry(1, 1, 1), '#8a7e74', { pos: [0, y, 0.002], scale: [len, 0.0022, 0.002] }, K);
  }
  return finish(b, { top: 0.44, sit: { kind: 'brim', rim: [-0.04, 0.128] } });
}

function cowboy(): BuiltHat {
  const b = new Builder();
  const felt = '#8a5a34';
  const dark = '#3e2618';
  // A cowboy hat (a nod to a certain toy sheriff): a brown felt crown creased down the middle and pinched in at the
  // front, a dark band with a little brass buckle, and a wide brim curled up at the sides and dipping front and back.
  const prof = [
    [0.152, -0.04],
    [0.156, 0.0],
    [0.156, 0.04],
    [0.152, 0.08],
    [0.143, 0.115],
    [0.128, 0.145],
    [0.105, 0.165],
    [0.07, 0.178],
    [0.035, 0.183],
    [0.001, 0.184],
  ].map(([x, y]) => new THREE.Vector2(x, y));
  const crown = warp(new THREE.LatheGeometry(prof, 40), (v) => {
    const h = THREE.MathUtils.smoothstep(v.y, 0.03, 0.17);
    // The crease down the middle, deepest at the front, and the pinch either side of the front.
    v.y -= 0.06 * h * Math.exp(-((v.x / 0.055) ** 2)) * (0.75 + 0.25 * (v.z / 0.16)) + 0.02 * h * Math.max(0, v.z / 0.16);
    const f = Math.max(0, v.z / 0.156);
    v.x *= 1 - 0.3 * f * f * h;
    v.x *= 0.95;
    v.z *= 1.1;
    return v;
  });
  b.add(crown, felt);
  crown.dispose();
  b.add(cyl(40, 1.01, 1), dark, { pos: [0, -0.005, 0], scale: [0.155 * 0.95 + 0.004, 0.04, 0.156 * 1.1 + 0.004] });
  b.add(new THREE.BoxGeometry(1, 1, 1), '#d8b45a', { pos: [0.153, -0.005, 0.03], rot: [0, 1.4, 0], scale: [0.03, 0.03, 0.006] });
  b.add(new THREE.BoxGeometry(1, 1, 1), dark, { pos: [0.155, -0.005, 0.03], rot: [0, 1.4, 0], scale: [0.018, 0.018, 0.007] });
  // The brim: sides rolled right up, front and back dipping.
  const bend = (x: number, z: number, t: number) => {
    const side = (x * x) / (x * x + z * z + 1e-6);
    return -0.035 + 0.15 * t * t * side * side - 0.03 * t * t * (1 - side);
  };
  const rOut = 0.33;
  const brim = brimGeo(0.12, rOut, 0.016, 48, bend, 1.12);
  b.add(brim, felt);
  brim.dispose();
  const edge: THREE.Vector3[] = [];
  for (let i = 0; i < 40; i++) {
    const a = (i / 40) * Math.PI * 2;
    const x = Math.sin(a) * (rOut + 0.006);
    const z = Math.cos(a) * (rOut + 0.006);
    edge.push(new THREE.Vector3(x, bend(x, z, 1.03), z * 1.12));
  }
  const binding = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(edge, true), 64, 0.008, 4, true);
  b.add(binding, '#6e4426');
  binding.dispose();
  return finish(b, { top: 0.17, sit: { kind: 'brim', rim: [-0.04, 0.148, 0.172] } });
}

function robot(): BuiltHat {
  const b = new Builder();
  // A sleek, glossy robot helmet (a nod to a certain French duo): a chrome shell over the top and back of the head,
  // a black visor band round the brow, little round pods at the temples, and a thin strip of light across the visor
  // with a bright spark sweeping to and fro along it.
  const C = new THREE.Vector3(0, -0.15, -0.01);
  const R = new THREE.Vector3(0.29, 0.235, 0.3);
  // Fifteen of the shell's thirty-six steps round are the visor, so the pieces meet edge to edge.
  const front = (15 * Math.PI) / 36;
  const visor: [number, number] = [0.94, 1.3];
  const fr: [number, number] = [Math.PI / 2 - front, front * 2];
  const back: [number, number] = [Math.PI / 2 + front, Math.PI * 2 - front * 2];
  const shell = (phi: [number, number], t0: number, t1: number, color: string, k = 1, n = 36) => {
    const g = new THREE.SphereGeometry(1, Math.max(4, Math.round((n * phi[1]) / (Math.PI * 2))), Math.max(2, Math.round((t1 - t0) * 7)), phi[0], phi[1], t0, t1 - t0);
    b.add(g, color, { pos: C.toArray(), scale: [R.x * k, R.y * k, R.z * k] });
    g.dispose();
  };
  // Chrome: bands of light and shade, as if it mirrors the sky above and the ground below.
  const ring: [number, number] = [fr[0], Math.PI * 2];
  shell(ring, 0, 0.5, '#e6eaf0');
  shell(ring, 0.5, visor[0], '#c0c8d2');
  shell(back, visor[0], 1.28, '#8e99a6');
  shell(back, 1.28, 1.66, '#b8c1cc');
  // The visor, standing a little proud of the shell, and the light strip across it.
  shell(fr, visor[0] - 0.02, visor[1], '#15171d', 1.025);
  // The temple pods: a grey disc with a dark middle each side.
  for (const side of [-1, 1]) {
    const e = Math.PI / 2 - 1.22;
    const at = new THREE.Vector3(side * Math.cos(e) * R.x, C.y + Math.sin(e) * R.y, C.z - 0.03);
    b.add(cyl(22), '#8c96a2', { pos: at.toArray(), rot: [0, 0, Math.PI / 2], scale: [0.058, 0.03, 0.058] });
    b.add(cyl(22), '#2a2e36', { pos: [at.x + side * 0.016, at.y, at.z], rot: [0, 0, Math.PI / 2], scale: [0.034, 0.004, 0.034] });
  }
  const built = finish(b, { top: 0.1, sit: { kind: 'snug', rim: [-0.17, 0.29, 0.3] } }, new THREE.MeshPhongMaterial({ vertexColors: true, specular: '#ffffff', shininess: 90 }));
  const mid = (visor[0] + visor[1]) / 2 - 0.02;
  const strip = new THREE.SphereGeometry(1, 24, 1, fr[0] + 0.12, fr[1] - 0.24, mid - 0.022, 0.044);
  const stripMat = new THREE.MeshBasicMaterial({ color: '#ff3c46' });
  const light = new THREE.Mesh(strip, stripMat);
  light.position.copy(C);
  light.scale.copy(R).multiplyScalar(1.032);
  light.castShadow = false;
  // The spark, and a soft glow round it.
  const sparkMat = new THREE.MeshBasicMaterial({ color: '#fff0e8' });
  const spark = new THREE.Mesh(new THREE.SphereGeometry(0.014, 10, 7), sparkMat);
  const haloMat = new THREE.MeshBasicMaterial({ color: '#ff5a5a', transparent: true, opacity: 0.35, depthWrite: false, blending: THREE.AdditiveBlending });
  const halo = new THREE.Mesh(new THREE.SphereGeometry(0.032, 10, 7), haloMat);
  spark.add(halo);
  spark.castShadow = false;
  halo.castShadow = false;
  spark.scale.set(1.6, 0.8, 0.8);
  built.group.add(light, spark);
  built.materials.push(stripMat, sparkMat, haloMat);
  const place = (phi: number) => {
    const k = 1.04;
    spark.position.set(-Math.cos(phi) * Math.sin(mid) * R.x * k + C.x, Math.cos(mid) * R.y * k + C.y, Math.sin(phi) * Math.sin(mid) * R.z * k + C.z);
    spark.rotation.y = phi - Math.PI / 2;
  };
  place(Math.PI / 2);
  built.update = (t) => place(Math.PI / 2 + Math.sin(t * 2.2) * (front - 0.22));
  return built;
}

function trafficCone(): BuiltHat {
  const b = new Builder();
  const orange = '#f2661c';
  const white = '#f7f7f2';
  // A traffic cone, worn on the head (a classic): an orange cone with two white reflective bands and an open tip,
  // on a square black rubber base that droops over the head a little.
  const H = 0.43;
  const r0 = 0.15;
  const r1 = 0.032;
  const y0 = -0.032;
  const stops: [number, string][] = [
    [0, orange],
    [0.36, white],
    [0.53, orange],
    [0.66, white],
    [0.77, orange],
    [1, orange],
  ];
  for (let i = 0; i < stops.length - 1; i++) {
    const [t0, color] = stops[i];
    const t1 = stops[i + 1][0];
    const g = new THREE.CylinderGeometry(r0 + (r1 - r0) * t1, r0 + (r1 - r0) * t0, H * (t1 - t0), 28, 1, true);
    b.add(g, color, { pos: [0, y0 + (H * (t0 + t1)) / 2, 0] });
    g.dispose();
  }
  // The open tip: a lip round it and the dark inside.
  b.add(torus(0.22, 4, 18), '#e85a14', { pos: [0, y0 + H, 0], rot: [Math.PI / 2, 0, 0], scale: [r1, r1, 0.03] });
  b.add(cyl(16), '#4a1e08', { pos: [0, y0 + H - 0.004, 0], scale: [r1 * 0.95, 0.004, r1 * 0.95] });
  // The base: a square slab, its corners drooping, with a raised collar where the cone meets it.
  const droop = (r: number) => -0.42 * Math.max(0, r - 0.13) ** 1.3;
  const pts: THREE.Vector2[] = [];
  const rs = [0.001, 0.13, 0.19, 0.25, 0.3];
  for (const r of rs) pts.push(new THREE.Vector2(r, y0 - 0.012 + droop(r)));
  pts.push(new THREE.Vector2(0.31, y0 - 0.002 + droop(0.31)));
  for (const r of [...rs].reverse()) pts.push(new THREE.Vector2(r, y0 + 0.01 + droop(r)));
  const slab = new THREE.LatheGeometry(pts, 4).rotateY(Math.PI / 4);
  b.add(slab, '#1f1f24');
  slab.dispose();
  b.add(cyl(28, 1, 1.12), '#2a2a30', { pos: [0, y0 + 0.02, 0], scale: [r0 + 0.012, 0.02, r0 + 0.012] });
  return finish(b, { top: 0.4, sit: { kind: 'brim', rim: [-0.032, 0.15] } });
}

function mortarboard(): BuiltHat {
  const b = new Builder();
  const black = '#25242c';
  const gold = '#f2bc3c';
  // A graduate's mortarboard: a snug black skull cap and a flat square board on top, set corner to the front, with a
  // gold tassel on a button in the middle, its cord running out to the corner on the right and hanging down over it.
  b.add(dome(26, 7), black, { pos: [0, -0.1, -0.005], scale: [0.232, 0.14, 0.242] });
  b.add(torus(0.12, 4, 32), '#1c1b22', { pos: [0, -0.095, -0.005], rot: [Math.PI / 2, 0, 0], scale: [0.233, 0.243, 0.15] });
  const yb = 0.045;
  const side = 0.46;
  b.add(new THREE.BoxGeometry(1, 1, 1), '#2b2a33', { pos: [0, yb, 0], rot: [0, Math.PI / 4, 0], scale: [side, 0.018, side] });
  b.add(new THREE.BoxGeometry(1, 1, 1), '#34333d', { pos: [0, yb + 0.0095, 0], rot: [0, Math.PI / 4, 0], scale: [side - 0.03, 0.002, side - 0.03] });
  b.add(cyl(14), gold, { pos: [0, yb + 0.016, 0], scale: [0.022, 0.012, 0.022] });
  const corner = (side / 2) * Math.SQRT2;
  const end = new THREE.Vector3(corner - 0.004, yb + 0.011, 0);
  b.add(cyl(6), gold, rod(new THREE.Vector3(0, yb + 0.016, 0), end, 0.006));
  const built = finish(b, { top: 0.07, sit: { kind: 'snug', rim: [-0.1, 0.232, 0.242] } });
  const tassel = hangTassel(built, [corner + 0.006, yb + 0.008, 0], gold, '#d8a028', 0.05, 0.085);
  built.update = (t) => swing(tassel, t + 2, 0.8);
  return built;
}

function pumpkin(): BuiltHat {
  const b = new Builder();
  // A jack-o'-lantern perched on the head: a squat ribbed pumpkin, its lobes in two oranges, with triangle eyes, a
  // nose and a toothy grin carved in the front that glow and flicker as if a candle burns inside. A curly stalk on
  // top, a leaf and a twist of tendril.
  const R = 0.215;
  const Ry = 0.165;
  const y0 = 0.08;
  const lobe = (a: number) => 0.9 + 0.1 * Math.sqrt(Math.abs(Math.cos(5 * a)));
  // A point on the pumpkin at longitude a (0 at the front) and latitude e, lifted `out` off the skin.
  const dip = (c: number, e: number) => (e > 0 ? 0.045 * Math.max(0, 1 - c / 0.4) ** 2 : 0);
  const at = (a: number, e: number, out = 0) => {
    const c = Math.cos(e);
    const k = R * lobe(a) + out;
    return new THREE.Vector3(Math.sin(a) * c * k, y0 + Math.sin(e) * (Ry + out) - dip(c, e), Math.cos(a) * c * k);
  };
  const N = 10;
  for (let i = 0; i < N; i++) {
    const g = new THREE.SphereGeometry(1, 3, 10, Math.PI / 2 - Math.PI / N + (i * Math.PI * 2) / N, (Math.PI * 2) / N);
    b.add(
      warp(g, (v) => at(Math.atan2(v.x, v.z), Math.asin(THREE.MathUtils.clamp(v.y, -1, 1)))),
      i % 2 ? '#ec7a1e' : '#f58c2a',
    );
    g.dispose();
  }
  // The stalk, curling over, with a pale cut end.
  const stalkCurve = new THREE.CatmullRomCurve3(
    [
      [0, -0.06, 0],
      [0.002, -0.025, 0],
      [0.01, 0.008, -0.004],
      [0.03, 0.03, -0.008],
      [0.057, 0.036, -0.01],
      [0.076, 0.022, -0.008],
    ].map(([x, y, z]) => new THREE.Vector3(x, y0 + Ry + y, z)),
  );
  const stalk = new THREE.TubeGeometry(stalkCurve, 10, 0.024, 7, false);
  b.add(stalk, '#6b7a36');
  stalk.dispose();
  const tipAt = stalkCurve.getPoint(1);
  const tipDir = stalkCurve.getTangent(1);
  b.add(cyl(9), '#c8b47a', new THREE.Matrix4().compose(tipAt, new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), tipDir), new THREE.Vector3(0.022, 0.006, 0.022)));
  // A leaf lying over the top, with a vein, and a curl of tendril.
  const la = -0.75;
  const leafAt = at(la, 1.0, 0.008);
  const leafQ = new THREE.Quaternion().setFromEuler(new THREE.Euler(0.15, la - Math.PI / 2, -0.5, 'YXZ'));
  b.add(sph(10, 6), '#4f9a3a', new THREE.Matrix4().compose(leafAt, leafQ, new THREE.Vector3(0.075, 0.01, 0.045)));
  b.add(new THREE.BoxGeometry(1, 1, 1), '#3c7c2c', new THREE.Matrix4().compose(leafAt.clone().add(new THREE.Vector3(0, 0.007, 0)), leafQ, new THREE.Vector3(0.12, 0.004, 0.004)));
  const curl: THREE.Vector3[] = [];
  for (let i = 0; i <= 14; i++) {
    const s = i / 14;
    const a = s * Math.PI * 3.2;
    curl.push(new THREE.Vector3(0.02 + 0.03 * s + Math.cos(a) * 0.018 * (1 - s * 0.4), y0 + Ry - 0.02 + Math.sin(a) * 0.018 + s * 0.02, 0.02 + s * 0.05));
  }
  const tendril = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(curl), 24, 0.0045, 4, false);
  b.add(tendril, '#5aa040');
  tendril.dispose();
  const built = finish(b, { top: 0.29, sit: { kind: 'perch', rim: [-0.04, 0.147] } });
  // The carving: shapes laid out in longitude and latitude on the front, each a dark cut rim round a glowing hole.
  const tris: [number, number][][] = [];
  const tri = (pts: [number, number][]) => {
    // Split once into four, so the shape bends round the pumpkin.
    const [p, r0, r1] = pts;
    // Counter-clockwise from the front, so the faces look out.
    const ccw = (r0[0] - p[0]) * (r1[1] - p[1]) - (r0[1] - p[1]) * (r1[0] - p[0]) > 0;
    const [q, r] = ccw ? [r0, r1] : [r1, r0];
    const m = (u: [number, number], v: [number, number]): [number, number] => [(u[0] + v[0]) / 2, (u[1] + v[1]) / 2];
    tris.push([p, m(p, q), m(p, r)], [m(p, q), q, m(q, r)], [m(p, r), m(q, r), r], [m(p, q), m(q, r), m(p, r)]);
  };
  const quad = (p: [number, number], q: [number, number], r: [number, number], s: [number, number]) => {
    tri([p, q, r]);
    tri([p, r, s]);
  };
  const shapes: { pts: [number, number][]; centre: [number, number] }[] = [];
  for (const side of [-1, 1]) {
    shapes.push({ pts: [[side * 0.13, 0.12], [side * 0.5, 0.1], [side * 0.3, 0.42]], centre: [side * 0.31, 0.21] });
  }
  shapes.push({ pts: [[-0.08, -0.06], [0.08, -0.06], [0, 0.08]], centre: [0, -0.01] });
  const grin = (rim: number) => {
    const cols = [-1, -0.8, -0.6, -0.46, -0.26, -0.1, 0.1, 0.26, 0.46, 0.6, 0.8, 1];
    const span = 0.66 + rim;
    for (let i = 0; i < cols.length - 1; i++) {
      const t0 = cols[i];
      const t1 = cols[i + 1];
      const tm = (t0 + t1) / 2;
      const toothTop = Math.abs(tm) > 0.26 && Math.abs(tm) < 0.46 ? 0.09 : 0;
      const toothBot = Math.abs(tm) < 0.1 ? 0.09 : 0;
      const top = (t: number) => -0.2 + 0.13 * t * t - (rim ? 0 : toothTop) + rim;
      const bot = (t: number) => -0.48 + 0.4 * t * t + (rim ? 0 : toothBot) - rim;
      const a0 = t0 * span;
      const a1 = t1 * span;
      quad([a0, bot(t0)], [a1, bot(t1)], [a1, top(t1)], [a0, top(t0)]);
    }
  };
  // The rims: each shape grown a little from its middle; the grin drawn a little bigger.
  for (const s of shapes) tri(s.pts.map(([u, v]) => [s.centre[0] + (u - s.centre[0]) * 1.22, s.centre[1] + (v - s.centre[1]) * 1.22] as [number, number]) as [number, number][]);
  grin(0.035);
  const rimCount = tris.length;
  for (const s of shapes) tri(s.pts);
  grin(0);
  const lay = (list: [number, number][][], out: number) => {
    const pos: number[] = [];
    for (const t of list) for (const [u, v] of t) pos.push(...at(u, v, out).toArray());
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    return g;
  };
  const cut = new Builder();
  const rimGeo = lay(tris.slice(0, rimCount), 0.003);
  cut.add(rimGeo, '#8a3410');
  rimGeo.dispose();
  const holes = lay(tris.slice(rimCount), 0.0055);
  cut.add(holes, '#ffcf4a');
  holes.dispose();
  const glowMat = new THREE.MeshBasicMaterial({ vertexColors: true });
  const face = cut.mesh(glowMat, { cast: false, receive: false, crease: 0 });
  built.group.add(face);
  built.materials.push(glowMat);
  built.update = (t) => {
    const k = 0.86 + Math.sin(t * 9.3) * 0.06 + Math.sin(t * 15.1) * 0.05 + Math.sin(t * 2.3) * 0.03;
    glowMat.color.setRGB(k, k * 0.96, k * 0.9);
  };
  return built;
}

// ---------------------------------------------------------------- more pop-culture hats, each for its own achievement

/** Bands of a shell (part of an ellipsoid at C, radii R), from t0 to t1 down from the crown, all the way round. */
export function shellBand(b: Builder, C: Vec3, R: Vec3, t0: number, t1: number, color: string, w = 32) {
  const g = new THREE.SphereGeometry(1, w, Math.max(2, Math.round((t1 - t0) * 7)), 0, Math.PI * 2, t0, t1 - t0);
  b.add(g, color, { pos: C, scale: R });
  g.dispose();
}

function viking(): BuiltHat {
  const b = new Builder();
  const steel = ['#e2e6ea', '#c2c8d0', '#9aa2ae'];
  const bronze = '#c8913a';
  const horn = ['#a88a58', '#c4a874', '#d8c294', '#e6d6b0', '#efe4c8', '#f6eedc', '#fbf6ea'];
  // A Norse warrior's helmet (as worn by everyone who ever shouted a dragon off a mountain): a steel dome, light on
  // top and darker round the sides, a bronze band round the brow studded with rivets, a bronze ridge from front to
  // back, and a great pair of horns curling up and out, each with a bronze ring at the root.
  const C: Vec3 = [0, -0.14, -0.01];
  const R: Vec3 = [0.272, 0.215, 0.282];
  shellBand(b, C, R, 0, 0.62, steel[0]);
  shellBand(b, C, R, 0.62, 1.12, steel[1]);
  shellBand(b, C, R, 1.12, Math.PI / 2, steel[2]);
  b.add(cyl(36), bronze, { pos: [0, -0.142, -0.01], scale: [R[0] + 0.012, 0.055, R[2] + 0.012] });
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    b.add(sph(6, 4), '#e8b860', { pos: [Math.sin(a) * (R[0] + 0.014), -0.142, -0.01 + Math.cos(a) * (R[2] + 0.014)], scale: 0.011 });
  }
  const ridge = new THREE.TorusGeometry(1, 0.07, 5, 24, Math.PI).rotateY(Math.PI / 2);
  b.add(ridge, bronze, { pos: C, scale: [0.2, R[1] + 0.006, R[2] + 0.006] });
  ridge.dispose();
  for (const side of [-1, 1]) {
    const root: Vec3 = [side * 0.235, -0.06, -0.02];
    b.add(torus(0.3, 6, 18), bronze, { pos: root, rot: [0, 0, side * 1.25], scale: [0.058, 0.058, 0.05] });
    bentCone(b, (i) => horn[i], root, 0.056, 0.27, 7, 1.7, [0, 0, side], [side, 0.25, 0.12]);
  }
  return finish(b, { top: 0.16, sit: { kind: 'snug', rim: [-0.17, 0.284, 0.294] } }, wet());
}

function sombrero(): BuiltHat {
  const b = new Builder();
  const straw = '#e8c46a';
  const weave = '#d0a84a';
  const bright = ['#d8343c', '#2f9a4a', '#f6d55c', '#f8f6f0'];
  // A big fiesta sombrero: a tall round crown, a wide straw brim that sweeps up at the edge, bands of red, white and
  // green, stitched dots round the brim and little pom-poms dangling all the way round.
  const crown = new THREE.LatheGeometry(
    [
      [0.152, -0.04],
      [0.15, 0.05],
      [0.14, 0.14],
      [0.122, 0.21],
      [0.096, 0.26],
      [0.064, 0.292],
      [0.03, 0.31],
      [0.001, 0.314],
    ].map(([r, y]) => new THREE.Vector2(r, y)),
    32,
  );
  b.add(crown, straw);
  crown.dispose();
  b.add(cyl(32, 0.97, 1), bright[0], { pos: [0, 0.005, 0], scale: [0.153, 0.05, 0.153] });
  for (const [y, r, c] of [
    [0.035, 0.149, bright[3]],
    [0.05, 0.146, bright[1]],
  ] as [number, number, string][]) {
    b.add(torus(0.14, 3, 28), c, { pos: [0, y, 0], rot: [Math.PI / 2, 0, 0], scale: [r, r, 0.08] });
  }
  b.add(torus(0.07, 3, 26), weave, { pos: [0, 0.16, 0], rot: [Math.PI / 2, 0, 0], scale: [0.136, 0.136, 0.1] });
  // The brim, dipping a little and then curling right up at the edge.
  const rOut = 0.42;
  const bend = (_x: number, _z: number, t: number) => -0.04 - 0.025 * t + 0.15 * t ** 3.5;
  const brim = brimGeo(0.13, rOut, 0.016, 36, bend);
  b.add(brim, straw);
  brim.dispose();
  const rw = 0.27;
  b.add(torus(0.1, 3, 32), weave, { pos: [0, bend(0, 0, (rw - 0.13) / (rOut - 0.13)) + 0.008, 0], rot: [Math.PI / 2, 0, 0], scale: [rw, rw, 0.08] });
  const edge: THREE.Vector3[] = [];
  for (let i = 0; i < 40; i++) {
    const a = (i / 40) * Math.PI * 2;
    edge.push(new THREE.Vector3(Math.sin(a) * (rOut + 0.006), bend(0, 0, 1.02), Math.cos(a) * (rOut + 0.006)));
  }
  const binding = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(edge, true), 48, 0.012, 4, true);
  b.add(binding, bright[0]);
  binding.dispose();
  // Stitched dots round the brim near the crown, and the pom-poms hanging off the edge.
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    const r = 0.185;
    b.add(sph(5, 3), bright[i % 3], { pos: [Math.sin(a) * r, bend(0, 0, (r - 0.13) / (rOut - 0.13)) + 0.012, Math.cos(a) * r], scale: [0.014, 0.006, 0.014] });
  }
  for (let i = 0; i < 12; i++) {
    const a = ((i + 0.5) / 12) * Math.PI * 2;
    const x = Math.sin(a) * (rOut + 0.012);
    const z = Math.cos(a) * (rOut + 0.012);
    const y = bend(0, 0, 1.02);
    b.add(cyl(3), '#3a2a1a', { pos: [x, y - 0.022, z], scale: [0.003, 0.04, 0.003] });
    b.add(sph(6, 4), bright[(i + 1) % 3], { pos: [x, y - 0.05, z], scale: 0.018 });
  }
  return finish(b, { top: 0.31, sit: { kind: 'brim', rim: [-0.04, 0.152] } });
}

function beret(): BuiltHat {
  const b = new Builder();
  const felt = '#8a2a48';
  const band = '#6c1e36';
  // An artist's beret: a soft felt disc slouched over to one side on a narrow band round the head, a little stalk in
  // the middle, dabs of paint here and there, and a paintbrush tucked in at the side.
  b.add(cyl(32), band, { pos: [0, -0.095, -0.005], scale: [0.262, 0.032, 0.272] });
  const tip = new THREE.Euler(0.04, 0, -0.17);
  const top: Vec3 = [0.04, -0.02, -0.01];
  b.add(sph(28, 12), felt, { pos: top, rot: [tip.x, tip.y, tip.z], scale: [0.33, 0.092, 0.335] });
  // Where the top of the disc is, a way out from its middle.
  const on = (x: number, z: number, lift = 0) => {
    const k = 1 - (x * x) / (0.33 * 0.33) - (z * z) / (0.335 * 0.335);
    return new THREE.Vector3(x, Math.sqrt(Math.max(0, k)) * 0.092 + lift, z).applyEuler(tip).add(new THREE.Vector3(...top));
  };
  b.add(cyl(8, 0.7, 1), band, { pos: on(0, 0, 0.012).toArray(), rot: [0, 0, -0.17], scale: [0.012, 0.028, 0.012] });
  for (const [x, z, s, c] of [
    [0.14, 0.08, 0.034, '#3a7bd5'],
    [-0.09, 0.15, 0.026, '#f6d55c'],
    [0.05, -0.17, 0.03, '#f8f6f0'],
    [-0.16, -0.06, 0.022, '#4cb860'],
  ] as [number, number, number, string][]) {
    b.add(sph(8, 4), c, { pos: on(x, z, -0.006).toArray(), rot: [tip.x, x * 3, tip.z], scale: [s, 0.009, s * 0.8] });
  }
  // The brush: a red handle, a silver ferrule and blue-dipped bristles, tucked under the band on the left.
  const from = new THREE.Vector3(-0.27, -0.12, 0.05);
  const to = new THREE.Vector3(-0.245, 0.11, -0.13);
  const dir = to.clone().sub(from).normalize();
  const ferrule = to.clone().addScaledVector(dir, 0.03);
  b.add(cyl(8), '#c8343a', rod(from, to, 0.011));
  b.add(cyl(8), '#c8ccd4', rod(to, ferrule, 0.013));
  b.add(cyl(8, 0.4, 1), '#e8d8b0', rod(ferrule, ferrule.clone().addScaledVector(dir, 0.03), 0.012));
  b.add(cyl(8, 0.1, 1), '#3a7bd5', rod(ferrule.clone().addScaledVector(dir, 0.03), ferrule.clone().addScaledVector(dir, 0.05), 0.0055));
  return finish(b, { top: 0.12, sit: { kind: 'snug', rim: [-0.11, 0.262, 0.272] } });
}

function astronaut(): BuiltHat {
  const b = new Builder();
  const white = '#f4f4f0';
  const grey = '#a8b0bc';
  // A space-age fishbowl helmet: a clear glass bubble right over the head, on a chunky white collar ring with a grey
  // seal, a little air valve and a pair of lights, and a gleam of light on the glass.
  const C = new THREE.Vector3(0, -0.23, 0.015);
  const R = 0.37;
  const cut = 2.42;
  const yc = C.y + Math.cos(cut) * R;
  const rc = Math.sin(cut) * R;
  b.add(torus(0.22, 8, 36), white, { pos: [0, yc - 0.02, C.z], rot: [Math.PI / 2, 0, 0], scale: [rc + 0.02, rc + 0.02, 0.2] });
  b.add(torus(0.16, 6, 36), grey, { pos: [0, yc + 0.012, C.z], rot: [Math.PI / 2, 0, 0], scale: [rc - 0.004, rc - 0.004, 0.12] });
  b.add(cyl(14), grey, { pos: [0.15, yc - 0.03, C.z + rc * 0.82], rot: [Math.PI / 2 - 0.3, 0, 0], scale: [0.02, 0.04, 0.02] });
  b.add(cyl(14), '#3a3e48', { pos: [0.15, yc - 0.026, C.z + rc * 0.82 + 0.022], rot: [Math.PI / 2 - 0.3, 0, 0], scale: [0.012, 0.008, 0.012] });
  for (const [x, c] of [
    [-0.12, '#ff5a4a'],
    [-0.07, '#5ad87a'],
  ] as [number, string][]) {
    b.add(sph(8, 6), c, { pos: [x, yc - 0.03, C.z + rc * 0.92 + 0.028], scale: 0.013 });
  }
  // The gleam: a curved streak and a dot, high on the glass at the front left.
  for (const [a, e, sx, sy] of [
    [-0.55, 0.62, 0.06, 0.02],
    [-0.3, 0.38, 0.018, 0.018],
  ]) {
    const n = new THREE.Vector3(Math.sin(a) * Math.cos(e), Math.sin(e), Math.cos(a) * Math.cos(e));
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), n);
    b.add(sph(10, 6), '#ffffff', new THREE.Matrix4().compose(C.clone().addScaledVector(n, R + 0.002), q, new THREE.Vector3(sx, sy, 0.004)));
  }
  const built = finish(b, { top: 0.15, sit: { kind: 'hood', rim: [-0.2, 0.31, 0.31], clear: true } });
  const glassMat = new THREE.MeshPhongMaterial({ color: '#d8ecff', specular: '#ffffff', shininess: 110, transparent: true, opacity: 0.22, depthWrite: false });
  const glass = new THREE.Mesh(new THREE.SphereGeometry(R, 30, 16, 0, Math.PI * 2, 0, cut), glassMat);
  glass.position.copy(C);
  glass.castShadow = false;
  glass.renderOrder = 2;
  built.group.add(glass);
  built.materials.push(glassMat);
  return built;
}

function ushanka(): BuiltHat {
  const b = new Builder();
  const fur = ['#a07a56', '#94704e', '#ac8660', '#9a7452'];
  const cloth = '#5a4436';
  const r = rng(7);
  // A fur trapper's ushanka: a dark quilted crown, the fur flap at the front turned up with a little brass star on it, the
  // back flap turned up too, and the ear flaps folded up at the sides and tied over the top.
  const C: Vec3 = [0, -0.12, -0.005];
  const R: Vec3 = [0.272, 0.2, 0.282];
  b.add(dome(24, 9), cloth, { pos: C, scale: R });
  for (let i = 0; i < 4; i++) b.add(torus(0.04, 4, 24), '#4c3a2e', { pos: C, rot: [0, (i * Math.PI) / 4, 0], scale: [R[0] + 0.002, R[1] + 0.002, 0.05] });
  // The turned-up flaps, front and back: thick fur rolls hugging the head.
  for (const [start, len, y, h] of [
    [-1.15, 2.3, -0.1, 0.1],
    [Math.PI - 1.35, 2.7, -0.115, 0.075],
  ]) {
    const g = jitter(new THREE.CylinderGeometry(1, 1.03, 1, 22, 2, false, start, len), 0.025, 5);
    b.addColored(paintFaces(g, () => fur[Math.floor(r() * fur.length)]), placeMatrix({ pos: [0, y, -0.005], scale: [R[0] + 0.035, h, R[2] + 0.035] }));
    g.dispose();
    // Tufts along the top of the roll, so it reads as fur.
    const n = Math.round(len * 7);
    for (let i = 0; i < n; i++) {
      const a = start + ((i + 0.5) / n) * len;
      const tuft = jitter(new THREE.IcosahedronGeometry(1, 0), 0.25, 20 + i);
      b.add(tuft, fur[i % fur.length], { pos: [Math.sin(a) * (R[0] + 0.03), y + h / 2, -0.005 + Math.cos(a) * (R[2] + 0.03)], rot: [i, a, 0], scale: [0.036, 0.026, 0.036] });
      tuft.dispose();
    }
  }
  // The ear flaps, folded up against the sides, and the ties up over the top to a bow.
  for (const side of [-1, 1]) {
    const g = jitter(new THREE.SphereGeometry(1, 12, 8), 0.04, side > 0 ? 9 : 11);
    b.addColored(paintFaces(g, () => fur[Math.floor(r() * fur.length)]), placeMatrix({ pos: [side * 0.268, -0.08, -0.02], rot: [0, 0, side * 0.32], scale: [0.045, 0.11, 0.13] }));
    g.dispose();
    b.add(cyl(5), '#4a3424', rod(new THREE.Vector3(side * 0.275, -0.02, -0.02), new THREE.Vector3(side * 0.03, C[1] + R[1] + 0.012, -0.02), 0.005));
  }
  const knot = C[1] + R[1] + 0.018;
  b.add(sph(8, 6), '#4a3424', { pos: [0, knot, -0.02], scale: [0.016, 0.013, 0.016] });
  for (const side of [-1, 1]) b.add(sph(8, 5), '#4a3424', { pos: [side * 0.026, knot + 0.004, -0.02], rot: [0, 0, side * 0.4], scale: [0.028, 0.013, 0.012] });
  const star = starGeo(1);
  b.add(star, '#e2b23a', { pos: [0, -0.055, R[2] + 0.04], rot: [-0.25, 0, 0], scale: 0.03 });
  star.dispose();
  return finish(b, { top: 0.1, sit: { kind: 'snug', rim: [-0.15, 0.272, 0.282] } });
}

function santa(): BuiltHat {
  const b = new Builder();
  const red = '#d6302f';
  const white = '#fbf8f2';
  // Father Christmas's hat: a long red stocking cap flopping over to one side, a thick white fur trim, a fluffy
  // pom-pom on the end and a sprig of holly at the front.
  const { geo: cap, tip } = bentTube([0, -0.12, -0.01], 0.27, 0.5, 12, 2.0, [0.25, 0, 1], [0, 1, -0.1]);
  b.add(cap, red);
  cap.dispose();
  const trim = jitter(new THREE.TorusGeometry(1, 0.13, 8, 36), 0.03, 2).rotateX(Math.PI / 2);
  b.add(trim, white, { pos: [0, -0.13, -0.01], scale: [0.285, 0.3, 0.295] });
  trim.dispose();
  const pom = jitter(new THREE.IcosahedronGeometry(1, 2), 0.18, 4);
  b.add(pom, white, { pos: [tip[0], tip[1] - 0.02, tip[2]], scale: 0.065 });
  pom.dispose();
  // Holly: two leaves and three berries on the trim at the front left.
  for (const side of [-1, 1]) {
    b.add(sph(8, 4), '#2f7a3a', { pos: [-0.1 + side * 0.035, -0.11, 0.29], rot: [-0.3, 0, side * 0.5], scale: [0.042, 0.018, 0.008] });
  }
  for (let i = 0; i < 3; i++) b.add(sph(8, 6), '#c81e2a', { pos: [-0.1 + (i - 1) * 0.014, -0.098 + (i % 2) * 0.012, 0.3], scale: 0.012 });
  return finish(b, { top: 0.22, sit: { kind: 'snug', rim: [-0.17, 0.285, 0.295] } });
}

function catEars(): BuiltHat {
  const b = new Builder();
  const dark = '#2e2832';
  // A cat-ear headband: a thin glossy band arching over the head, and on it two pointed cat ears, dark with pink
  // insides and a little white tuft, standing forward so real ears behind them don't hide them.
  const band = new THREE.TorusGeometry(1, 0.06, 5, 20, Math.PI * 0.56).rotateZ(Math.PI * 0.22);
  b.add(band, dark, { pos: [0, -0.22, 0.03], rot: [0.55, 0, 0], scale: [0.268, 0.205, 0.2] });
  band.dispose();
  for (const side of [-1, 1]) {
    const base = new THREE.Vector3(side * 0.085, -0.055, 0.14);
    const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(-0.2, side * -0.25, side * -0.32));
    const ear = (dz: number, s: Vec3, color: string, y = 0) => b.add(new THREE.ConeGeometry(1, 1, 10), color, new THREE.Matrix4().compose(base.clone().add(new THREE.Vector3(0, s[1] / 2 + y, dz).applyQuaternion(q)), q, new THREE.Vector3(...s)));
    ear(0, [0.065, 0.13, 0.026], dark);
    ear(0.016, [0.042, 0.09, 0.012], '#f29ab4', -0.005);
    b.add(sph(6, 4), '#fbf8f2', new THREE.Matrix4().compose(base.clone().add(new THREE.Vector3(0, 0.022, 0.026).applyQuaternion(q)), q, new THREE.Vector3(0.02, 0.012, 0.006)));
    b.add(sph(10, 5), dark, { pos: [base.x, base.y + 0.005, base.z], scale: [0.06, 0.018, 0.03] });
  }
  return finish(b, { top: 0.1, sit: { kind: 'perch', rim: [-0.06, 0.16], among: true } }, wet());
}

function ninja(): BuiltHat {
  const b = new Builder();
  const cloth = '#25356a';
  const steel = '#c4cad4';
  // A ninja's headband: a dark blue cloth band round the brow with a steel plate on the front engraved with a
  // swirling leaf, knotted at the back with its two long tails fluttering behind.
  const tilt = new THREE.Matrix4().makeRotationX(0.16);
  const ring = new THREE.LatheGeometry(
    [
      [0.236, -0.134],
      [0.25, -0.138],
      [0.256, -0.12],
      [0.256, -0.084],
      [0.25, -0.068],
      [0.236, -0.064],
      [0.236, -0.134],
    ].map(([r, y]) => new THREE.Vector2(r, y)),
    40,
  );
  b.add(ring, cloth, {}, tilt);
  ring.dispose();
  // The plate, curved round the brow, with a rivet in each corner.
  const plate = new THREE.CylinderGeometry(0.266, 0.266, 0.056, 14, 1, true, -0.42, 0.84);
  b.add(plate, steel, { pos: [0, -0.1, 0] }, tilt);
  plate.dispose();
  for (const [a, y] of [
    [-0.36, -0.08],
    [0.36, -0.08],
    [-0.36, -0.12],
    [0.36, -0.12],
  ]) {
    b.add(sph(6, 4), '#8a92a0', { pos: [Math.sin(a) * 0.268, y, Math.cos(a) * 0.268], scale: 0.0065 }, tilt);
  }
  // The leaf: a spiral swirl ending in a point.
  const swirl = new THREE.TorusGeometry(1, 0.2, 4, 18, Math.PI * 1.6);
  b.add(swirl, '#3a4250', { pos: [0, -0.1, 0.27], rot: [0, 0, 0.6], scale: [0.016, 0.016, 0.02] }, tilt);
  swirl.dispose();
  b.add(sph(6, 4), '#3a4250', { pos: [0, -0.1, 0.271], scale: 0.006 }, tilt);
  b.add(new THREE.ConeGeometry(1, 1, 4), '#3a4250', { pos: [0.018, -0.087, 0.27], rot: [0, 0, -0.8], scale: [0.006, 0.026, 0.004] }, tilt);
  // The knot at the back.
  const knot = new THREE.Vector3(0, -0.1, -0.255).applyMatrix4(tilt);
  b.add(sph(10, 7), cloth, { pos: knot.toArray(), scale: [0.03, 0.026, 0.022] });
  const built = finish(b, { top: 0.0, sit: { kind: 'band', rim: [-0.14, 0.236] } });
  // The tails, each its own mesh so they can flutter.
  const tails: THREE.Object3D[] = [];
  for (const side of [-1, 1]) {
    const t = new Builder();
    let p = new THREE.Vector3();
    let dir = new THREE.Vector3(side * 0.35, -0.55, -0.75).normalize();
    for (let i = 0; i < 4; i++) {
      const len = 0.06;
      const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, -1, 0), dir);
      t.add(new THREE.BoxGeometry(1, 1, 1), i % 2 ? '#2a3c76' : cloth, new THREE.Matrix4().compose(p.clone().addScaledVector(dir, len / 2), q, new THREE.Vector3(0.036 - i * 0.003, len * 1.06, 0.006)));
      p = p.addScaledVector(dir, len);
      dir = dir.add(new THREE.Vector3(0, -0.35, 0)).normalize();
    }
    const material = soft();
    const mesh = t.mesh(material, { cast: true, receive: false });
    const holder = new THREE.Group();
    holder.position.copy(knot);
    holder.add(mesh);
    built.group.add(holder);
    built.solid.push({ mesh, material });
    built.materials.push(material);
    tails.push(holder);
  }
  built.update = (t) => {
    tails.forEach((o, i) => {
      o.rotation.x = Math.sin(t * 2.3 + i * 1.7) * 0.12 + Math.sin(t * 5.1 + i) * 0.04;
      o.rotation.z = Math.sin(t * 1.7 + i * 2.1) * 0.08;
    });
  };
  return built;
}

function knight(): BuiltHat {
  const b = new Builder();
  const steel = ['#e6eaee', '#c8ced6', '#a4acb8', '#7e8694'];
  // A knight's helm: a polished steel helmet with a raised comb from front to back, a rolled brow band, the pointed
  // visor swung up out of the way (eye slits and breathing holes and all) on rivets at the sides, and a tall plume of
  // red and white feathers streaming back from the crown.
  const C: Vec3 = [0, -0.14, -0.01];
  const R: Vec3 = [0.275, 0.225, 0.285];
  shellBand(b, C, R, 0, 0.55, steel[0]);
  shellBand(b, C, R, 0.55, 1.1, steel[1]);
  shellBand(b, C, R, 1.1, Math.PI / 2, steel[2]);
  b.add(torus(0.18, 6, 36), steel[3], { pos: [0, -0.15, -0.01], rot: [Math.PI / 2, 0, 0], scale: [R[0] + 0.006, R[2] + 0.006, 0.15] });
  const comb = new THREE.TorusGeometry(1, 0.05, 4, 24, Math.PI).rotateY(Math.PI / 2);
  b.add(comb, steel[1], { pos: C, scale: [0.4, R[1] + 0.012, R[2] + 0.012] });
  comb.dispose();
  // The visor, swung up: a shell of its own over the front of the crown, a ridge down its middle, eye slits along its
  // lower edge and breathing holes to one side, on rivets at the sides.
  const V: Vec3 = [R[0] * 1.06, R[1] * 1.06, R[2] * 1.06];
  const visor = new THREE.SphereGeometry(1, 14, 5, Math.PI / 2 - 1.05, 2.1, 0.32, 0.78);
  b.add(visor, steel[1], { pos: C, scale: V });
  b.add(inward(visor), steel[3], { pos: C, scale: [V[0] - 0.004, V[1] - 0.004, V[2] - 0.004] });
  visor.dispose();
  const beak = new THREE.TorusGeometry(1, 0.035, 4, 10, 0.78).rotateZ(Math.PI / 2 - 0.32 - 0.78).rotateY(-Math.PI / 2);
  b.add(beak, steel[0], { pos: C, scale: [0.4, V[1] + 0.006, V[2] + 0.006] });
  beak.dispose();
  const onVisor = (a: number, e: number) => {
    const { p, n } = onShell(V[0], V[1], V[2], a, e, C[1]);
    p.z += C[2];
    return { p: p.addScaledVector(n, 0.003), q: new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), n) };
  };
  for (const side of [-1, 1]) {
    const { p, q } = onVisor(side * 0.3, 0.6);
    b.add(new THREE.BoxGeometry(1, 1, 1), '#2a2e36', new THREE.Matrix4().compose(p, q, new THREE.Vector3(0.075, 0.012, 0.008)));
    b.add(cyl(14), steel[3], { pos: [side * (V[0] + 0.004), -0.1, 0.0], rot: [0, 0, Math.PI / 2], scale: [0.03, 0.02, 0.03] });
  }
  for (let i = 0; i < 4; i++) {
    const { p } = onVisor(0.55 + (i % 2) * 0.13, 0.62 + Math.floor(i / 2) * 0.13);
    b.add(sph(6, 4), '#2a2e36', { pos: p.toArray(), scale: 0.008 });
  }
  // The plume, in a socket at the back of the crown.
  const socket = new THREE.Vector3(0, C[1] + R[1] - 0.01, -0.07);
  b.add(cyl(10), steel[2], { pos: socket.toArray(), rot: [-0.4, 0, 0], scale: [0.022, 0.05, 0.022] });
  for (let i = 0; i < 7; i++) {
    const a = (i - 3) * 0.16;
    const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(-0.75 - Math.abs(i - 3) * 0.08, 0, a));
    const len = 0.2 - Math.abs(i - 3) * 0.02;
    const at = socket.clone().add(new THREE.Vector3(0, len * 0.9, 0).applyQuaternion(q));
    b.add(sph(10, 7), i % 2 ? '#f6efe4' : '#d02a34', new THREE.Matrix4().compose(at, q, new THREE.Vector3(0.03, len, 0.022)));
  }
  return finish(b, { top: 0.24, sit: { kind: 'snug', rim: [-0.17, 0.281, 0.291] } }, wet());
}

function gnome(): BuiltHat {
  const b = new Builder();
  const red = '#d23a2e';
  // A garden gnome's hat: a tall pointed red felt cap that leans back and droops a little at the tip, a rolled edge,
  // and a patch sewn on the side with big stitches.
  const { geo: cap } = bentTube([0, -0.13, -0.01], 0.278, 0.6, 12, 0.75, [-1, 0, 0], [0, 1, -0.18]);
  b.add(cap, red);
  cap.dispose();
  b.add(torus(0.12, 6, 36), '#b02e24', { pos: [0, -0.13, -0.01], rot: [Math.PI / 2, 0, 0], scale: [0.282, 0.292, 0.22] });
  const { p, n } = onShell(0.24, 0.3, 0.25, 1.15, 0.45, -0.13);
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), n);
  b.add(new THREE.BoxGeometry(1, 1, 1), '#7a5a3a', new THREE.Matrix4().compose(p.clone().addScaledVector(n, 0.002), q.clone().multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, 0.2))), new THREE.Vector3(0.06, 0.055, 0.008)));
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + 0.2;
    const o = new THREE.Vector3(Math.cos(a) * 0.03, Math.sin(a) * 0.028, 0.005).applyQuaternion(q);
    b.add(new THREE.BoxGeometry(1, 1, 1), '#f2e6c8', new THREE.Matrix4().compose(p.clone().add(o), q.clone().multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, a))), new THREE.Vector3(0.016, 0.004, 0.004)));
  }
  return finish(b, { top: 0.42, sit: { kind: 'snug', rim: [-0.16, 0.278, 0.288] } });
}

function fedora(): BuiltHat {
  const b = new Builder();
  const felt = '#86613e';
  const dark = '#3a2618';
  // An adventurer's fedora (whip and bullwhip not included): a battered brown felt crown with a dent down the middle
  // and pinched at the front, a dark band, and a brim snapped down at the front and turned up a touch at the back.
  const prof = [
    [0.15, -0.04],
    [0.153, 0.0],
    [0.152, 0.05],
    [0.146, 0.09],
    [0.132, 0.12],
    [0.105, 0.138],
    [0.07, 0.146],
    [0.035, 0.149],
    [0.001, 0.15],
  ].map(([x, y]) => new THREE.Vector2(x, y));
  const crown = warp(new THREE.LatheGeometry(prof, 40), (v) => {
    const h = THREE.MathUtils.smoothstep(v.y, 0.03, 0.14);
    v.y -= 0.05 * h * Math.exp(-((v.x / 0.05) ** 2)) * (0.8 + 0.2 * (v.z / 0.15)) + 0.015 * h * Math.max(0, v.z / 0.15);
    const f = Math.max(0, v.z / 0.153);
    v.x *= (1 - 0.32 * f * f * h) * 0.95;
    v.z *= 1.1;
    return v;
  });
  b.add(crown, felt);
  crown.dispose();
  b.add(cyl(40, 1.01, 1), dark, { pos: [0, -0.008, 0], scale: [0.153 * 0.95 + 0.004, 0.036, 0.153 * 1.1 + 0.004] });
  for (const side of [-1, 1]) b.add(sph(8, 5), dark, { pos: [-0.148, -0.006, -0.02 + side * 0.016], rot: [0, 0, 0.2], scale: [0.006, 0.018, 0.014] });
  const bend = (x: number, z: number, t: number) => {
    const r = Math.hypot(x, z) + 1e-6;
    const side = (x * x) / (r * r);
    return -0.035 + t * t * (0.02 * side - 0.045 * Math.max(0, z / r) ** 1.5 + 0.03 * Math.max(0, -z / r) ** 2);
  };
  const rOut = 0.28;
  const brim = brimGeo(0.12, rOut, 0.014, 48, bend, 1.1);
  b.add(brim, felt);
  brim.dispose();
  const edge: THREE.Vector3[] = [];
  for (let i = 0; i < 40; i++) {
    const a = (i / 40) * Math.PI * 2;
    const x = Math.sin(a) * (rOut + 0.005);
    const z = Math.cos(a) * (rOut + 0.005);
    edge.push(new THREE.Vector3(x, bend(x, z, 1.02), z * 1.1));
  }
  const binding = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(edge, true), 60, 0.006, 4, true);
  b.add(binding, '#6e4e30');
  binding.dispose();
  return finish(b, { top: 0.15, sit: { kind: 'brim', rim: [-0.04, 0.145, 0.168] } });
}

function unicorn(): BuiltHat {
  const b = new Builder();
  const pastel = ['#ffc8de', '#e4c8ff', '#c4dcff', '#c8f2e0', '#fff0b8'];
  // A unicorn's horn: a spiralled horn, pearly on its ridges and running through the pastels of a rainbow in its
  // grooves, rising from a gold cuff on the forehead with little flowers round it, and a sparkle twinkling at the tip.
  const H = 0.34;
  const r0 = 0.062;
  const turns = 3.6;
  const raw = new THREE.CylinderGeometry(0.003, r0, H, 16, 22, false);
  const horn = warp(raw, (v) => {
    const t = (v.y + H / 2) / H;
    const a = Math.atan2(v.x, v.z);
    const k = 0.84 + 0.16 * Math.cos(2 * (a - t * turns * Math.PI * 2));
    v.x *= k;
    v.z *= k;
    return v;
  });
  const painted = paintFaces(horn, (_, c) => {
    const t = (c.y + H / 2) / H;
    const a = Math.atan2(c.x, c.z);
    const ridge = Math.cos(2 * (a - t * turns * Math.PI * 2)) > 0.2;
    return ridge ? '#fffaf0' : pastel[Math.min(pastel.length - 1, Math.floor(t * pastel.length))];
  });
  horn.dispose();
  const base = new THREE.Vector3(0, -0.035, 0.1);
  const lean = new THREE.Quaternion().setFromEuler(new THREE.Euler(0.42, 0, 0));
  const up = new THREE.Vector3(0, 1, 0).applyQuaternion(lean);
  b.addColored(painted, new THREE.Matrix4().compose(base.clone().addScaledVector(up, H / 2 + 0.01), lean, new THREE.Vector3(1, 1, 1)));
  painted.dispose();
  b.add(torus(0.3, 6, 22), '#e8b83a', new THREE.Matrix4().compose(base.clone().addScaledVector(up, 0.012), lean.clone().multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.PI / 2, 0, 0))), new THREE.Vector3(r0 + 0.006, r0 + 0.006, 0.05)));
  b.add(sph(14, 6), '#e8b83a', new THREE.Matrix4().compose(base, lean, new THREE.Vector3(r0 + 0.012, 0.02, r0 + 0.012)));
  // Little flowers and leaves round the foot of the horn.
  for (const [a, c] of [
    [-1.1, pastel[0]],
    [1.2, pastel[1]],
    [Math.PI, pastel[2]],
  ] as [number, string][]) {
    const at = base.clone().add(new THREE.Vector3(Math.sin(a) * 0.085, 0.006, Math.cos(a) * 0.065 - 0.012));
    const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(-0.5, a, 0));
    for (let k = 0; k < 5; k++) {
      const pa = (k / 5) * Math.PI * 2;
      const p = at.clone().add(new THREE.Vector3(Math.cos(pa) * 0.018, Math.sin(pa) * 0.018, 0).applyQuaternion(q));
      b.add(sph(6, 4), c, new THREE.Matrix4().compose(p, q, new THREE.Vector3(0.016, 0.016, 0.007)));
    }
    b.add(sph(6, 4), '#f6c42c', new THREE.Matrix4().compose(at.clone().add(new THREE.Vector3(0, 0, 0.005).applyQuaternion(q)), q, new THREE.Vector3(0.01, 0.01, 0.008)));
    b.add(sph(6, 4), '#78b85a', { pos: [at.x + Math.sin(a + 0.5) * 0.03, at.y - 0.006, at.z + Math.cos(a + 0.5) * 0.025], rot: [0.3, a + 0.5, 0.5], scale: [0.026, 0.008, 0.012] });
  }
  const built = finish(b, { top: 0.32, sit: { kind: 'brim', rim: [-0.035, 0.11, 0.13] } });
  const sparkMat = new THREE.MeshBasicMaterial({ color: '#fffbe8' });
  const spark = new THREE.Mesh(starGeo(0.022, 0.35), sparkMat);
  spark.position.copy(base.clone().addScaledVector(up, H + 0.035));
  spark.castShadow = false;
  built.group.add(spark);
  built.materials.push(sparkMat);
  built.update = (t) => {
    const k = 0.75 + 0.25 * Math.sin(t * 3.7) * Math.sin(t * 1.3 + 1);
    spark.scale.setScalar(k);
    spark.rotation.z = t * 0.8;
  };
  return built;
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
  fez,
  deerstalker,
  tinfoil,
  trainer,
  madhatter,
  cowboy,
  robot,
  cone: trafficCone,
  mortarboard,
  pumpkin,
  viking,
  sombrero,
  beret,
  astronaut,
  ushanka,
  santa,
  catears: catEars,
  ninja,
  knight,
  gnome,
  fedora,
  unicorn,
  hardhat,
  reindeer,
  beerhat,
  sharkhat,
  birthday,
  bicorne,
  bearskin,
  centurion,
  tiara,
  topper,
  trophy,
};

export function buildHat(hat: HatId): BuiltHat | null {
  const make = MAKERS[hat];
  return make ? make() : null;
}

// ---------------------------------------------------------------- fitting a hat to a head

/**
 * How a hat is worn. `rim` is where it meets the head, in the hat's own units: how high (from its origin, the top of
 * the reference head) and how far out from the middle, side to side and front to back (if different).
 * - snug: pulled down over the crown to just above the eyes and stretched to hug the head there (beanies, caps,
 *   the headscarf, the helmet). Ears under it fold away inside.
 * - band: round the head just above the eyes, stretched to hug it (the sweatband).
 * - ring: round the top of the head as it was modelled, stretched to hug it (the wreaths), ears standing up inside.
 * - brim: set down on the crown as far as its opening lets it, at the head's size. Ears under it fold away.
 * - perch: a little thing set on the crown the same way, which would rather be made smaller to sit between the
 *   ears than fold them away (a crown, a candle).
 * - hood: drawn over the whole head, the face looking out through its opening (the reaper's cowl); `rim` is the
 *   middle of it, and `open` the way its opening faces and how wide it is (the cosine of the angle out to its edge).
 * - float: hovering over the head, clear of everything on it (the halo).
 * Whatever the kind, it's then tipped back, lifted, moved back or made smaller, as little as it can be, until it
 * keeps clear of the eyes (and of the town camera's view of them, from above), eye stalks, horns and antlers.
 * `among` says it's worn among the ears, which stay up through it (the devil horns' band), and `tilt` how far back
 * it's worn to start with, if further than usual (radians). `clear` says it can be seen through (the astronaut's glass
 * bubble), so it may go right over the eyes.
 */
export interface HatSit {
  kind: 'snug' | 'band' | 'ring' | 'brim' | 'perch' | 'hood' | 'float';
  rim: [number, number, number?];
  among?: boolean;
  tilt?: number;
  open?: [number, number, number, number];
  clear?: boolean;
}

/**
 * Part of a head (neck space): points on the skull itself (`head`), or on something standing off it, by the bone it
 * moves with: an ear that can fold away under a hat, an eye, or anything else a hat has to keep clear of.
 */
export interface HatBit {
  bone: string;
  is: 'head' | 'fold' | 'eye' | 'solid';
  pts: THREE.Vector3[];
}

/** A head, as a hat sees it (neck space). */
export interface HatHead {
  /** The skull as an ellipsoid (centre and radii): what hats sit on and hug. */
  c: Vec3;
  r: Vec3;
  /** How big the hats that aren't stretched to fit are made (1 for the reference head). */
  size: number;
  /** One eye (the other is its mirror image across x = 0): its centre and radius. */
  eye: { at: Vec3; r: number };
  /** How high a snug hat's rim comes at the front, if not just above the eyes. */
  brow?: number;
  /** How far the head hangs forward (radians) when standing about, if it does. */
  droop?: number;
  bits: HatBit[];
}

/** A nudge for one head (or one hat on it): moved, resized, tipped back (radians), or left exactly where it's put. */
export interface HatNudge {
  dx?: number;
  dy?: number;
  dz?: number;
  scale?: number;
  tilt?: number;
  fixed?: boolean;
}

/** Where a hat goes on one head (neck space), how big (stretched along its own axes), its tilt, and the bones it folds away. */
export interface HatFit {
  pos: Vec3;
  rot: Vec3;
  scale: Vec3;
  fold: string[];
}

const NY = 130;
const Y0 = -0.6;
const DY = 0.01;
const NS = 32;
const NG = 60;
const G0 = -0.6;
const DG = 0.02;
const sector = (x: number, z: number) => Math.floor(((Math.atan2(x, z) + Math.PI) / (Math.PI * 2)) * NS) % NS;

/**
 * A hat's shape, for fitting (hat units): at each height and each way round, how far out from the middle it reaches
 * (and how far in, for a ring), and how high it reaches over each spot seen from above. Somewhere is inside the hat if
 * the hat reaches out past it and also over it, which counts the inside of a crown or a beanie but not the gap under
 * a dangling tassel. Each is spread a cell each way, so sampling gaps don't matter.
 */
class Outline {
  private out = new Float32Array(NY * NS).fill(-1);
  private in = new Float32Array(NY * NS).fill(9);
  private over = new Float32Array(NG * NG).fill(-9);

  constructor(group: THREE.Object3D) {
    group.updateMatrixWorld(true);
    const inv = group.matrixWorld.clone().invert();
    const a = new THREE.Vector3();
    const b = new THREE.Vector3();
    const c = new THREE.Vector3();
    const p = new THREE.Vector3();
    const out = new Float32Array(NY * NS).fill(-1);
    const inn = new Float32Array(NY * NS).fill(9);
    const over = new Float32Array(NG * NG).fill(-9);
    const mark = (p: THREE.Vector3) => {
      const iy = Math.floor((p.y - Y0) / DY);
      if (iy < 0 || iy >= NY) return;
      const r = Math.hypot(p.x, p.z);
      const j = iy * NS + sector(p.x, p.z);
      if (r > out[j]) out[j] = r;
      if (r < inn[j]) inn[j] = r;
      const gx = Math.floor((p.x - G0) / DG);
      const gz = Math.floor((p.z - G0) / DG);
      if (gx >= 0 && gx < NG && gz >= 0 && gz < NG && p.y > over[gz * NG + gx]) over[gz * NG + gx] = p.y;
    };
    group.traverse((o) => {
      const m = o as THREE.Mesh;
      if (!m.isMesh) return;
      const toHat = m.matrixWorld.clone().premultiply(inv);
      const pos = m.geometry.getAttribute('position') as THREE.BufferAttribute;
      const ix = m.geometry.getIndex();
      const n = ix ? ix.count : pos.count;
      for (let i = 0; i + 2 < n; i += 3) {
        a.fromBufferAttribute(pos, ix ? ix.getX(i) : i).applyMatrix4(toHat);
        b.fromBufferAttribute(pos, ix ? ix.getX(i + 1) : i + 1).applyMatrix4(toHat).sub(a);
        c.fromBufferAttribute(pos, ix ? ix.getX(i + 2) : i + 2).applyMatrix4(toHat).sub(a);
        // Points all over the face, about a centimetre apart.
        const k = Math.min(30, Math.ceil(Math.max(b.length(), c.length(), b.distanceTo(c)) / 0.012));
        for (let u = 0; u <= k; u++) for (let v = 0; u + v <= k; v++) mark(p.copy(a).addScaledVector(b, u / k).addScaledVector(c, v / k));
      }
    });
    for (let iy = 1; iy < NY - 1; iy++) {
      for (let is = 0; is < NS; is++) {
        let o = -1;
        let i = 9;
        for (let dy = -1; dy <= 1; dy++) {
          for (let ds = -1; ds <= 1; ds++) {
            const j = (iy + dy) * NS + ((is + ds + NS) % NS);
            o = Math.max(o, out[j]);
            i = Math.min(i, inn[j]);
          }
        }
        this.out[iy * NS + is] = o;
        this.in[iy * NS + is] = i;
      }
    }
    for (let gz = 0; gz < NG; gz++) {
      for (let gx = 0; gx < NG; gx++) {
        let o = -9;
        for (let dz = -1; dz <= 1; dz++) for (let dx = -1; dx <= 1; dx++) if (gx + dx >= 0 && gx + dx < NG && gz + dz >= 0 && gz + dz < NG) o = Math.max(o, over[(gz + dz) * NG + gx + dx]);
        this.over[gz * NG + gx] = o;
      }
    }
  }

  /** Where a point (hat units) is, across a ring-shaped hat: 0 if the hat isn't there at all, 1 in the hole in the middle, 2 in the stuff of it, 3 outside it. */
  across(x: number, y: number, z: number): number {
    const iy = Math.floor((y - Y0) / DY);
    if (iy < 1 || iy >= NY - 1) return 0;
    const j = iy * NS + sector(x, z);
    if (this.out[j] < 0) return 0;
    const r = Math.sqrt(x * x + z * z);
    return r > this.out[j] + 0.004 ? 3 : r > this.in[j] - 0.004 ? 2 : 1;
  }

  /** How far out from the middle the hat reaches anywhere between two heights, the way round a point is (hat units). */
  reach(x: number, z: number, y0: number, y1: number): number {
    let r = -1;
    const is = sector(x, z);
    for (let iy = Math.max(0, Math.floor((y0 - Y0) / DY)); iy <= Math.min(NY - 1, Math.floor((y1 - Y0) / DY)); iy++) r = Math.max(r, this.out[iy * NS + is]);
    return r;
  }

  /** Whether a point (hat units) is inside the hat, or in the stuff of it if it's a ring (not the hole in the middle). */
  inside(x: number, y: number, z: number, ring = false): boolean {
    const iy = Math.floor((y - Y0) / DY);
    if (iy < 1 || iy >= NY - 1) return false;
    const r = Math.sqrt(x * x + z * z);
    const j = iy * NS + sector(x, z);
    if (r > this.out[j] + 0.006) return false;
    if (ring) return r > this.in[j] - 0.006;
    const gx = Math.floor((x - G0) / DG);
    const gz = Math.floor((z - G0) / DG);
    return gx >= 0 && gx < NG && gz >= 0 && gz < NG && y < this.over[gz * NG + gx] + 0.006;
  }
}

/** Hats' shapes for fitting, by what they're made by (they're all the same shape every time). */
const outlines = new Map<string, Outline>();

/**
 * The town camera looks down on everyone from about this high (radians), from wherever it is round them, and
 * indoors from higher still: how much it matters that a hat keeps out of the way of each.
 */
const CAMERA_PITCHES: [number, number][] = [
  [0.78, 5],
  [0.95, 2],
];

/**
 * Works out where a hat goes on a head: first by its kind (see HatSit), then by trying it tipped further back,
 * lifted (or, for a ring, lowered), moved back and made smaller, keeping whichever does least to keep clear of the
 * eyes, the town camera's view of them and anything rigid standing off the head, without baring the top of the head
 * it was covering. Ears it still covers fold away (a perched hat or a ring would rather move than fold them).
 */
export function fitHat(hat: HatId, built: BuiltHat, head: HatHead, nudge: HatNudge = {}): HatFit {
  const { kind, rim } = built.sit;
  const [ry0, rx0, rz0 = rx0] = rim;
  const [cx, cy, cz] = head.c;
  const [hx, hy, hz] = head.r;
  const top = cy + hy;
  let shape = outlines.get(hat);
  if (!shape) outlines.set(hat, (shape = new Outline(built.group)));
  const outline = shape;
  const eye = head.eye;
  // (Eyes up on top of the head, or on stalks, don't make a snug hat any shallower than this.)
  const brow = head.brow ?? Math.min(eye.at[1] + eye.r * 0.9 + 0.012, top - hy * 0.4);
  // The head's half-width and half-depth at a height.
  const cut = (y: number): [number, number] => {
    const t = THREE.MathUtils.clamp((y - cy) / hy, -0.95, 0.95);
    const k = Math.sqrt(1 - t * t);
    return [hx * k, hz * k];
  };
  const hugging = kind === 'snug' || kind === 'band' || kind === 'ring';
  const ring = kind === 'ring' || kind === 'band' || kind === 'float';
  // (A band is made tipped down at the front, which this sets level.)
  const baseTilt = nudge.tilt ?? built.sit.tilt ?? (kind === 'snug' || kind === 'band' ? 0.15 : kind === 'float' || kind === 'hood' ? 0 : 0.12);
  const size = head.size * (nudge.scale ?? 1);
  const shift = new THREE.Vector3(nudge.dx ?? 0, nudge.dy ?? 0, nudge.dz ?? 0);

  let grow = 1;
  /** Where it sits by its kind, made `k` times smaller (a ring `lift` higher, still hugging the head there). */
  const base = (k: number, lift = 0): { pos: THREE.Vector3; scale: THREE.Vector3 } => {
    if (hugging) {
      // Round the head, a little loose, as far down as the brow at the front (a ring as far down as it was made).
      let yc = kind === 'ring' ? Math.max(brow, top + ry0 * size) + lift : brow;
      let sx = 1;
      let sz = 1;
      for (let i = 0; i < 3; i++) {
        const [w, d] = cut(yc);
        sx = ((w * 1.04 + 0.006) / rx0) * k;
        sz = ((d * 1.04 + 0.006) / rz0) * k;
        if (kind !== 'ring') yc = brow - rz0 * sz * Math.sin(baseTilt);
      }
      // Let out until the head (not just the ellipsoid it's roughly) fits inside.
      sx *= grow;
      sz *= grow;
      const mean = (sx + sz) / 2;
      // A snug hat's crown comes down over the top of the head; a band or a ring keeps its own height.
      const sy = kind === 'snug' ? THREE.MathUtils.clamp((top + 0.006 - yc) / -ry0, mean * 0.8, mean * 1.25) : mean;
      const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(-baseTilt, 0, 0));
      return { pos: new THREE.Vector3(cx, yc, cz).sub(new THREE.Vector3(0, ry0 * sy, 0).applyQuaternion(q)).add(shift), scale: new THREE.Vector3(sx, sy, sz) };
    }
    if (kind === 'hood') {
      // Its middle on the head's, a little bigger all round (and let out to cover the head).
      const sx = ((hx * 1.08) / rx0) * k * grow;
      const sz = ((hz * 1.08) / rz0) * k * grow;
      const sy = (sx + sz) / 2;
      const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(-baseTilt, 0, 0));
      return { pos: new THREE.Vector3(cx, cy, cz).sub(new THREE.Vector3(0, ry0 * sy, 0).applyQuaternion(q)).add(shift), scale: new THREE.Vector3(sx, sy, sz) };
    }
    const s = size * k;
    if (kind === 'float') return { pos: new THREE.Vector3(cx, top, cz).add(shift), scale: new THREE.Vector3(s, s, s) };
    // Set down until its opening meets the head (whichever way across meets it first).
    const sink = (q: number, r: number) => hy * (1 - Math.sqrt(1 - Math.min(0.98, (q * s) / r) ** 2));
    const rimY = top - Math.min(sink(rx0, hx), sink(rz0, hz));
    return { pos: new THREE.Vector3(cx, rimY - ry0 * s, cz).add(shift), scale: new THREE.Vector3(s, s, s) };
  };

  // (A crest, the robot's antenna, folds away under anything but a halo; ears only under a hat that covers them.)
  const crests = head.bits.filter((b) => b.is === 'fold' && b.bone.startsWith('crest') && kind !== 'float').map((b) => b.bone);
  // Ears stand up through a wreath or a band (or anything worn `among` them).
  const fold = built.sit.among || kind === 'ring' || kind === 'band' ? [] : head.bits.filter((b) => b.is === 'fold' && !crests.includes(b.bone));
  const skin = head.bits.filter((b) => b.is === 'head').flatMap((b) => b.pts);
  const eyes = head.bits.filter((b) => b.is === 'eye').flatMap((b) => b.pts);
  const solid = head.bits.filter((b) => b.is === 'solid');
  // Looking at each eye from the town camera, from straight in front and from that eye's side, and from in front: from
  // just over the top of the eye under a brim (so all of it shows, not just a sliver), from its middle under anything
  // snug (whose rim is just above it anyway). A band round the brow is only kept off the eyes themselves.
  // (Turned into the head's own space, for a head that hangs forward.)
  const looks: [THREE.Vector3, THREE.Vector3, number][] = [];
  const droop = new THREE.Matrix3().setFromMatrix4(new THREE.Matrix4().makeRotationX(-(head.droop ?? 0)));
  for (const side of kind === 'band' || built.sit.clear ? [] : [1, -1]) {
    const e = new THREE.Vector3(side * eye.at[0], eye.at[1] + (hugging ? eye.r * 0.3 : eye.r + 0.015), eye.at[2] + 0.01);
    for (const [p, w] of CAMERA_PITCHES) for (const az of [0, side * 0.6]) looks.push([e, new THREE.Vector3(Math.sin(az) * Math.cos(p), Math.sin(p), Math.cos(az) * Math.cos(p)).applyMatrix3(droop), w]);
    looks.push([e, new THREE.Vector3(0, 0.15, 1).normalize().applyMatrix3(droop), 5]);
  }
  const m = new THREE.Matrix4();
  const inv = new THREE.Matrix4();
  const lin = new THREE.Matrix3();
  const h = new THREE.Vector3();
  const d = new THREE.Vector3();
  const q = new THREE.Quaternion();
  const euler = new THREE.Euler();
  const place = (pos: THREE.Vector3, scale: THREE.Vector3, tilt: number) => {
    m.compose(pos, q.setFromEuler(euler.set(-tilt, 0, 0)), scale);
    inv.copy(m).invert();
    lin.setFromMatrix4(inv);
  };
  const isIn = (p: THREE.Vector3) => {
    h.copy(p).applyMatrix4(inv);
    return outline.inside(h.x, h.y, h.z, ring);
  };
  /** Whether a point is in the hat or passes through its edge there (a thin brim, which points either side of miss). */
  const touches = (p: THREE.Vector3) => {
    h.copy(p).applyMatrix4(inv);
    return outline.inside(h.x, h.y, h.z, ring) || Math.hypot(h.x, h.z) < outline.reach(h.x, h.z, h.y - 0.02, h.y + 0.02);
  };
  /**
   * How much of the head shows through the hat: a hat that covers the head (all but a ring or a halo) should have
   * all of it that's above its rim and within its reach there inside it, a hood all but the face; a ring should have
   * it all through the hole in the middle.
   */
  const [fx, fy, fz, fw] = built.sit.open ?? [0, 0, 1, 1];
  const face = Object.assign(new THREE.Vector3(fx, fy, fz).normalize(), { w: fw });
  const bare = (worst = Infinity) => {
    let n = 0;
    if (kind === 'float') return 0;
    for (const p of skin) {
      h.copy(p).applyMatrix4(inv);
      const shows = ring
        ? outline.across(h.x, h.y, h.z) > 2
        : kind === 'hood'
          ? new THREE.Vector3(h.x, h.y - ry0, h.z).normalize().dot(face) < face.w && !outline.inside(h.x, h.y, h.z)
          : h.y > ry0 + 0.02 && Math.hypot(h.x, h.z) < outline.reach(h.x, h.z, ry0 - 0.03, ry0 + 0.03) && !outline.inside(h.x, h.y, h.z);
      if (shows && ++n > worst) return n;
    }
    return n;
  };
  const foldCost = kind === 'perch' || kind === 'ring' || kind === 'band' ? 25 : kind === 'float' ? 60 : 0.5;
  /** What it costs to move it from where its kind puts it. */
  const moved = (k: number, tilt: number, lift: number, back: number) => (tilt - baseTilt) * 5 + Math.abs(lift) * 70 + back * 50 + (1 - k) * (kind === 'perch' ? 7 : 25);
  /** How badly it's in the way, given up on once it's worse than `worst`. */
  const clash = (worst: number) => {
    let cost = 0;
    if (!built.sit.clear) for (const p of eyes) if (isIn(p) && (cost += 12) > worst) return cost;
    // Something rigid standing off the head (a horn, a stalk) can be hidden right inside the hat, or stand clear of
    // it, but not go through it (even a thin brim).
    for (const b of solid) {
      let n = 0;
      for (const p of b.pts) if (touches(p)) n++;
      if (n && n < b.pts.length && (cost += 8 + Math.min(n, b.pts.length - n)) > worst) return cost;
    }
    if ((cost += bare((worst - cost) / 1.5) * 1.5) > worst) return cost;
    // Each look from an eye stops at the first bit of hat in the way.
    for (const [e, dir, w] of looks) {
      h.copy(e).applyMatrix4(inv);
      d.copy(dir).applyMatrix3(lin);
      for (let t = 0.02; t < 0.5; t += 0.012) {
        if (outline.inside(h.x + d.x * t, h.y + d.y * t, h.z + d.z * t, ring)) {
          if ((cost += w) > worst) return cost;
          break;
        }
      }
    }
    // (Antlers only fold away under something that covers the head; anything else would rather fit between them.)
    for (const f of fold) {
      const antler = f.bone.startsWith('antler') && kind !== 'snug' && kind !== 'hood';
      if ((antler ? f.pts.some(touches) : f.pts.some(isIn)) && (cost += antler ? 25 : foldCost) > worst) return cost;
    }
    return cost;
  };
  if (hugging || kind === 'hood') {
    // Let out until none of the head shows through (nor any of a horn it mostly covers, or a hood any of), and a touch
    // more.
    const through = () => {
      let n = bare();
      for (const b of solid) {
        const k = b.pts.filter(isIn).length;
        if (k >= (kind === 'hood' ? 1 : b.pts.length / 2)) n += b.pts.length - k;
      }
      return n;
    };
    for (; grow < 1.3; grow += 0.025) {
      const b = base(1);
      place(b.pos, b.scale, baseTilt);
      if (!through()) break;
    }
    grow = Math.min(1.3, grow + 0.025);
  }
  // Every way of moving it, cheapest first, until even moving it costs more than the best found.
  const shrinks = kind === 'perch' ? [1, 0.9, 0.8, 0.7, 0.6, 0.5] : kind === 'ring' || kind === 'hood' ? [1] : kind === 'brim' ? [1, 0.92, 0.84, 0.76, 0.68, 0.6] : [1, 0.92, 0.84, 0.76];
  const lifts = kind === 'float' ? [0, 0.02, 0.04, 0.07, 0.1, 0.14, 0.19, 0.25] : kind === 'ring' ? [0, -0.01, -0.02, -0.03, 0.01, 0.02, 0.035, 0.05] : [0, 0.01, 0.02, 0.035, 0.05, 0.07];
  const tilts = kind === 'float' ? [0] : [0, 0.1, 0.2, 0.3, 0.4];
  const tries: { k: number; tilt: number; lift: number; back: number; cost: number }[] = [];
  for (const k of shrinks) for (const t of tilts) for (const lift of lifts) for (const back of [0, 0.02, 0.04, 0.06]) tries.push({ k, tilt: baseTilt + t, lift, back, cost: moved(k, baseTilt + t, lift, back) });
  tries.sort((a, b) => a.cost - b.cost);
  const bases = new Map<string, { pos: THREE.Vector3; scale: THREE.Vector3 }>();
  /** Puts it there (a ring is refitted where it's moved to), and says where that is. */
  const at = (k: number, tilt: number, lift: number, back: number) => {
    const key = kind === 'ring' ? `${k} ${lift}` : `${k}`;
    let b = bases.get(key);
    if (!b) bases.set(key, (b = kind === 'ring' ? base(k, lift) : base(k)));
    const pos = new THREE.Vector3(b.pos.x, b.pos.y + (kind === 'ring' ? 0 : lift), b.pos.z - back);
    place(pos, b.scale, tilt);
    return { pos, scale: b.scale };
  };
  let best = tries[0];
  let bestCost = Infinity;
  if (nudge.fixed) bestCost = 0;
  for (const t of tries) {
    if (t.cost >= bestCost) break;
    at(t.k, t.tilt, t.lift, t.back);
    const cost = t.cost + clash(bestCost - t.cost);
    if (cost < bestCost) {
      best = t;
      bestCost = cost;
    }
  }
  const b = at(best.k, best.tilt, best.lift, best.back);
  return {
    pos: [b.pos.x, b.pos.y, b.pos.z],
    rot: [-best.tilt, 0, 0],
    scale: [b.scale.x, b.scale.y, b.scale.z],
    fold: [...crests, ...fold.filter((f) => f.pts.some(f.bone.startsWith('antler') ? touches : isIn)).map((f) => f.bone)],
  };
}
