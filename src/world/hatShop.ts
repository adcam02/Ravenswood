import * as THREE from 'three';
import { Builder, jitter, wet, type Vec3 } from './build';
import { brimGeo, cyl, dome, finish, onShell, shellBand, sph, starGeo, torus, warp, type BuiltHat } from './hats';

/**
 * The hats bought at the Lucky Raven's shop rather than earned, and the trophy hat (very dear, and it sparkles).
 * Made like the rest (see hats.ts): for a reference head about half a metre across, origin at the top of it, each
 * saying how it's worn, and fitted to every animal's head by fitHat.
 */

const box = () => new THREE.BoxGeometry(1, 1, 1);

/**
 * A tapering limb that bends as it grows (an antler's beam or tine): `segs` pieces from `r0` down to `r1` across,
 * turning `bend` radians in all about `axis`. Returns the point and heading at the end of each piece.
 */
function limb(b: Builder, color: (i: number) => string, base: THREE.Vector3, dir: THREE.Vector3, r0: number, r1: number, len: number, segs: number, bend: number, axis: THREE.Vector3): { at: THREE.Vector3[]; dirs: THREE.Vector3[] } {
  const at: THREE.Vector3[] = [];
  const dirs: THREE.Vector3[] = [];
  let pos = base.clone();
  let d = dir.clone().normalize();
  const step = len / segs;
  const up = new THREE.Vector3(0, 1, 0);
  for (let i = 0; i < segs; i++) {
    const rb = r0 + ((r1 - r0) * i) / segs;
    const rt = r0 + ((r1 - r0) * (i + 1)) / segs;
    const g = new THREE.CylinderGeometry(rt, rb, step * 1.1, 10, 1, true);
    b.add(g, color(i), new THREE.Matrix4().compose(pos.clone().addScaledVector(d, step / 2), new THREE.Quaternion().setFromUnitVectors(up, d), new THREE.Vector3(1, 1, 1)));
    g.dispose();
    // (A ball at each joint, so the bends never open up.)
    b.add(sph(8, 6), color(i), { pos: pos.toArray(), scale: rb });
    pos = pos.clone().addScaledVector(d, step);
    d = d.clone().applyAxisAngle(axis, bend / segs).normalize();
    at.push(pos.clone());
    dirs.push(d.clone());
  }
  b.add(sph(8, 6), color(segs - 1), { pos: pos.toArray(), scale: r1 });
  return { at, dirs };
}

/** Little four-pointed twinkles that come and go round a hat (the tiara's diamonds, the trophy's gold). */
function twinkles(built: BuiltHat, spots: Vec3[], size: number, color = '#fffbe8'): (t: number) => void {
  const mat = new THREE.MeshBasicMaterial({ color, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
  const star = starGeo(1, 0.22);
  const stars = spots.map((p, i) => {
    const m = new THREE.Mesh(star, mat);
    m.position.set(...p);
    m.castShadow = false;
    m.userData.phase = i * 2.39;
    built.group.add(m);
    return m;
  });
  built.materials.push(mat);
  return (t) => {
    for (const m of stars) {
      // Each flares up now and then, at its own moment, and turns as it does.
      const k = Math.max(0, Math.sin(t * 1.7 + m.userData.phase)) ** 6;
      m.scale.setScalar(size * (0.05 + k));
      m.rotation.z = t * 0.6 + m.userData.phase;
      m.visible = k > 0.02;
    }
  };
}

// ---------------------------------------------------------------- the shop's hats, cheapest first

export function hardhat(): BuiltHat {
  const b = new Builder();
  const yellow = '#f4c430';
  const shade = '#e2ad1e';
  // A builder's hard hat: a yellow shell with three ridges from front to back, a brim all round that juts out a
  // little further over the brow, and a green safety sticker on the front.
  const C: Vec3 = [0, -0.13, -0.01];
  const R: Vec3 = [0.27, 0.22, 0.285];
  shellBand(b, C, R, 0, 1.0, yellow);
  shellBand(b, C, R, 1.0, Math.PI / 2, shade);
  for (const x of [-0.09, 0, 0.09]) {
    const k = Math.sqrt(1 - (x / R[0]) ** 2);
    const ridge = new THREE.TorusGeometry(1, x ? 0.05 : 0.08, 5, 24, Math.PI).rotateY(Math.PI / 2);
    b.add(ridge, yellow, { pos: [x, C[1], C[2]], scale: [0.2, R[1] * k + 0.004, R[2] * k + 0.004] });
    ridge.dispose();
  }
  const brim = warp(
    brimGeo(0.262, 0.312, 0.016, 44, (_x, _z, t) => -0.018 * t),
    (v) => {
      const r = Math.hypot(v.x, v.z);
      const t = THREE.MathUtils.clamp((r - 0.262) / 0.05, 0, 1);
      const out = 1 + (0.075 * Math.max(0, v.z / r) ** 2 * t) / r;
      return v.set(v.x * out, v.y, v.z * out);
    },
  );
  b.add(brim, yellow, { pos: [0, C[1] + 0.004, C[2]], scale: [1, 1, R[2] / R[0]] });
  brim.dispose();
  // The sticker: a green square with a white cross, facing out from the front.
  const { p, n } = onShell(R[0], R[1], R[2], 0.42, 0.42, C[1]);
  p.z += C[2];
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), n);
  b.add(box(), '#2f9a4c', new THREE.Matrix4().compose(p.clone().addScaledVector(n, 0.002), q, new THREE.Vector3(0.05, 0.05, 0.006)));
  for (const [w, h] of [
    [0.034, 0.011],
    [0.011, 0.034],
  ]) {
    b.add(box(), '#f8f6f0', new THREE.Matrix4().compose(p.clone().addScaledVector(n, 0.005), q, new THREE.Vector3(w, h, 0.004)));
  }
  return finish(b, { top: 0.1, sit: { kind: 'snug', rim: [-0.13, 0.27, 0.285] } }, wet());
}

export function reindeer(): BuiltHat {
  const b = new Builder();
  const browns = ['#7a4e2a', '#8a5a32', '#9a6a3c', '#aa7a48', '#ba8a56', '#c89c66'];
  // Christmas antlers on a headband: two soft brown antlers, each a beam curving up, out and back with two tines
  // forward off it, a red ribbon bow at each root and a little gold bell hanging from the bow.
  const band = new THREE.TorusGeometry(1, 0.06, 5, 20, Math.PI * 0.56).rotateZ(Math.PI * 0.22);
  b.add(band, '#8a2a26', { pos: [0, -0.22, 0.03], rot: [0.55, 0, 0], scale: [0.268, 0.205, 0.2] });
  band.dispose();
  const back = new THREE.Vector3(-1, 0, 0);
  for (const side of [-1, 1]) {
    const base = new THREE.Vector3(side * 0.1, -0.06, 0.13);
    const beam = limb(b, (i) => browns[i], base, new THREE.Vector3(side * 0.6, 1, 0.15), 0.036, 0.018, 0.34, 6, 0.9, back);
    // Tines off the beam, pointing forward and out.
    limb(b, (i) => browns[i + 2], beam.at[1], new THREE.Vector3(side * 0.3, 0.65, 0.8), 0.022, 0.013, 0.12, 3, -0.5, back);
    limb(b, (i) => browns[i + 3], beam.at[3], new THREE.Vector3(side * 0.65, 0.8, 0.55), 0.019, 0.011, 0.1, 3, -0.4, back);
    b.add(sph(10, 5), browns[0], { pos: [base.x, base.y - 0.004, base.z], scale: [0.055, 0.02, 0.045] });
    // The bow: a knot and two loops, and the bell under it.
    const k: Vec3 = [base.x + side * 0.02, base.y + 0.012, base.z + 0.03];
    b.add(sph(8, 6), '#d42a2e', { pos: k, scale: [0.016, 0.016, 0.012] });
    for (const s of [-1, 1]) b.add(sph(8, 6), '#e03a3c', { pos: [k[0] + s * 0.026, k[1] + 0.006, k[2]], rot: [0, 0, s * 0.4], scale: [0.026, 0.016, 0.009] });
    b.add(sph(10, 8), '#f0c040', { pos: [k[0], k[1] - 0.03, k[2] + 0.004], scale: 0.016 });
    b.add(torus(0.3, 4, 10), '#c8962a', { pos: [k[0], k[1] - 0.042, k[2] + 0.004], rot: [Math.PI / 2, 0, 0], scale: [0.016, 0.016, 0.02] });
  }
  return finish(b, { top: 0.32, sit: { kind: 'perch', rim: [-0.06, 0.16], among: true } });
}

export function beerhat(): BuiltHat {
  const b = new Builder();
  const red = '#d8342c';
  const white = '#f6f2ea';
  // A drinking helmet: a red and white plastic cap with a can of beer clipped to each side, and a long bendy straw
  // from each can looping down beside the face.
  const C: Vec3 = [0, -0.13, -0.01];
  const R: Vec3 = [0.27, 0.215, 0.285];
  shellBand(b, C, R, 0, 0.55, white);
  shellBand(b, C, R, 0.55, Math.PI / 2, red);
  b.add(torus(0.18, 6, 36), white, { pos: [0, C[1] + 0.006, C[2]], rot: [Math.PI / 2, 0, 0], scale: [R[0] + 0.004, R[2] + 0.004, 0.14] });
  for (const side of [-1, 1]) {
    const can = new THREE.Vector3(side * 0.33, -0.07, -0.02);
    // The holder: a bracket from the cap and a ring round the can.
    b.add(cyl(10), white, { pos: [side * 0.285, can.y, can.z], rot: [0, 0, Math.PI / 2], scale: [0.018, 0.05, 0.018] });
    b.add(torus(0.18, 5, 22), white, { pos: [can.x, can.y, can.z], rot: [Math.PI / 2, 0, 0], scale: [0.058, 0.058, 0.08] });
    b.add(cyl(18), '#e8b83a', { pos: can.toArray(), scale: [0.05, 0.12, 0.05] });
    b.add(cyl(18), '#2a6a3c', { pos: [can.x, can.y + 0.008, can.z], scale: [0.0505, 0.05, 0.0505] });
    b.add(cyl(18), '#d8dce2', { pos: [can.x, can.y + 0.063, can.z], scale: [0.044, 0.008, 0.044] });
    b.add(cyl(18), '#d8dce2', { pos: [can.x, can.y - 0.063, can.z], scale: [0.044, 0.008, 0.044] });
    // The straw, red and white: up out of the can, over and down past the cheek.
    const curve = new THREE.CatmullRomCurve3(
      [
        [can.x, can.y + 0.05, can.z],
        [can.x + side * 0.01, can.y + 0.12, can.z + 0.03],
        [can.x + side * 0.03, can.y + 0.06, can.z + 0.1],
        [side * 0.3, -0.2, 0.15],
        [side * 0.25, -0.27, 0.2],
      ].map(([x, y, z]) => new THREE.Vector3(x, y, z)),
    );
    const N = 12;
    for (let i = 0; i < N; i++) {
      const piece = new THREE.TubeGeometry(new THREE.CatmullRomCurve3([0, 0.5, 1].map((k) => curve.getPoint(Math.min(1, (i + k * 1.05) / N)))), 4, 0.009, 6, false);
      b.add(piece, i % 2 ? '#e0383a' : white);
      piece.dispose();
    }
  }
  return finish(b, { top: 0.09, sit: { kind: 'snug', rim: [-0.13, 0.27, 0.285] } }, wet());
}

export function sharkhat(): BuiltHat {
  const b = new Builder();
  const grey = '#7d93a8';
  const belly = '#e6edf2';
  // A plush shark swallowing your head: its grey head is the cap, the rim its open jaws with a row of white teeth
  // and pink gums, round black eyes on the sides, gills, a fin on top and its tail sticking up at the back.
  const C: Vec3 = [0, -0.14, -0.02];
  const R: Vec3 = [0.28, 0.23, 0.3];
  shellBand(b, C, R, 0, 1.25, grey);
  shellBand(b, C, R, 1.25, Math.PI / 2, belly);
  // A rounded snout over the brow.
  b.add(sph(18, 10), grey, { pos: [0, -0.04, 0.13], scale: [0.2, 0.13, 0.18] });
  b.add(torus(0.22, 6, 40), '#e87a8a', { pos: [0, C[1] + 0.004, C[2]], rot: [Math.PI / 2, 0, 0], scale: [R[0] + 0.004, R[2] + 0.004, 0.1] });
  for (let i = -7; i <= 7; i++) {
    const a = i * 0.21;
    b.add(new THREE.ConeGeometry(1, 1, 6), '#fbfaf6', { pos: [Math.sin(a) * (R[0] - 0.004), C[1] - 0.012, C[2] + Math.cos(a) * (R[2] - 0.004)], rot: [Math.PI, 0, 0], scale: [0.016, 0.03, 0.016] });
  }
  for (const side of [-1, 1]) {
    const { p, n } = onShell(R[0], R[1], R[2], side * 1.05, 0.34, C[1]);
    p.z += C[2];
    b.add(sph(12, 9), '#1c1e24', { pos: p.addScaledVector(n, 0.004).toArray(), scale: 0.03 });
    b.add(sph(8, 6), '#ffffff', { pos: p.clone().addScaledVector(n, 0.024).add(new THREE.Vector3(0, 0.01, 0.006)).toArray(), scale: 0.008 });
    // Three gill slits behind each eye.
    for (let k = 0; k < 3; k++) {
      const g = onShell(R[0], R[1], R[2], side * (1.55 + k * 0.17), 0.22, C[1]);
      g.p.z += C[2];
      const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), g.n);
      b.add(box(), '#56687a', new THREE.Matrix4().compose(g.p.addScaledVector(g.n, 0.002), q, new THREE.Vector3(0.008, 0.07, 0.006)));
    }
  }
  // The fin: a swept-back triangle, rounded off.
  const fin = new THREE.Shape();
  fin.moveTo(-0.07, 0);
  fin.quadraticCurveTo(0.0, 0.06, 0.07, 0.16);
  fin.quadraticCurveTo(0.06, 0.06, 0.1, 0);
  fin.closePath();
  const finGeo = new THREE.ExtrudeGeometry(fin, { depth: 0.03, bevelEnabled: true, bevelSize: 0.012, bevelThickness: 0.012, bevelSegments: 2, curveSegments: 8 });
  finGeo.translate(0, 0, -0.015);
  b.add(finGeo, grey, { pos: [0, C[1] + R[1] - 0.02, -0.02], rot: [0, Math.PI / 2, 0] });
  // The tail: two fins in a V at the back.
  for (const [lean, len] of [
    [0.55, 0.15],
    [2.3, 0.1],
  ]) {
    b.add(sph(10, 6), grey, { pos: [0, -0.07 + Math.cos(lean) * len * 0.5, -0.31 - Math.sin(lean) * len * 0.5], rot: [-lean, 0, 0], scale: [0.016, len * 0.55, 0.04] });
  }
  b.add(sph(10, 6), grey, { pos: [0, -0.07, -0.3], scale: [0.03, 0.035, 0.035] });
  finGeo.dispose();
  return finish(b, { top: 0.22, sit: { kind: 'snug', rim: [-0.14, 0.28, 0.3] } });
}

export function birthday(): BuiltHat {
  const b = new Builder();
  const pink = '#f4a2bc';
  const cream = '#fff6ee';
  // A birthday cake on a gold board: pink sponge, cream piped round the top and dripping down the sides, hundreds
  // and thousands, a cherry in the middle and three striped candles, their flames flickering.
  b.add(cyl(36), '#e8c050', { pos: [0, -0.036, 0], scale: [0.175, 0.012, 0.175] });
  b.add(cyl(36), pink, { pos: [0, 0.02, 0], scale: [0.14, 0.1, 0.14] });
  b.add(cyl(36), '#e88aa6', { pos: [0, 0.02, 0], scale: [0.1405, 0.012, 0.1405] });
  b.add(cyl(36), cream, { pos: [0, 0.072, 0], scale: [0.138, 0.008, 0.138] });
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    b.add(sph(8, 6), cream, { pos: [Math.sin(a) * 0.128, 0.078, Math.cos(a) * 0.128], scale: [0.022, 0.018, 0.022] });
    // Drips of different lengths down the side.
    const len = 0.014 + ((i * 7) % 5) * 0.006;
    b.add(sph(8, 6), cream, { pos: [Math.sin(a + 0.2) * 0.141, 0.068 - len, Math.cos(a + 0.2) * 0.141], scale: [0.013, len, 0.008], rot: [0, a + 0.2, 0] });
  }
  for (let i = 0; i < 26; i++) {
    const a = i * 2.4;
    const r = 0.03 + ((i * 37) % 9) * 0.009;
    b.add(box(), ['#f04a4a', '#4aa8f0', '#f6d23a', '#5ac85a', '#b86af0'][i % 5], { pos: [Math.sin(a) * r, 0.078, Math.cos(a) * r], rot: [0, a * 1.7, 0], scale: [0.012, 0.004, 0.004] });
  }
  b.add(sph(12, 9), '#c81830', { pos: [0, 0.098, 0], scale: 0.022 });
  b.add(cyl(5), '#4a7a2a', { pos: [0.006, 0.124, 0], rot: [0, 0, -0.4], scale: [0.003, 0.03, 0.003] });
  const candles: Vec3[] = [0, 1, 2].map((i) => {
    const a = (i / 3) * Math.PI * 2 + 0.5;
    return [Math.sin(a) * 0.075, 0.076, Math.cos(a) * 0.075];
  });
  for (const [x, y, z] of candles) {
    for (let k = 0; k < 4; k++) b.add(cyl(10), k % 2 ? '#fbf8f2' : '#5aa8e8', { pos: [x, y + 0.009 + k * 0.016, z], scale: [0.011, 0.017, 0.011] });
    b.add(cyl(4), '#2a2220', { pos: [x, y + 0.076, z], scale: [0.003, 0.014, 0.003] });
  }
  const built = finish(b, { top: 0.22, sit: { kind: 'brim', rim: [-0.036, 0.15] } });
  // The flames glow on their own and flicker, each a little differently.
  const flameMat = new THREE.MeshBasicMaterial({ color: '#ffc04a' });
  const glowMat = new THREE.MeshBasicMaterial({ color: '#ff9a40', transparent: true, opacity: 0.22, depthWrite: false, blending: THREE.AdditiveBlending });
  const flameGeo = new THREE.SphereGeometry(1, 8, 6);
  const flames = candles.map(([x, y, z]) => {
    const f = new THREE.Mesh(flameGeo, flameMat);
    f.position.set(x, y + 0.098, z);
    f.scale.set(0.011, 0.022, 0.011);
    const g = new THREE.Mesh(flameGeo, glowMat);
    g.position.copy(f.position);
    g.scale.setScalar(0.03);
    f.castShadow = g.castShadow = false;
    built.group.add(f, g);
    return f;
  });
  built.materials.push(flameMat, glowMat);
  built.update = (t) => {
    flames.forEach((f, i) => {
      const s = 1 + Math.sin(t * 11 + i * 2) * 0.12 + Math.sin(t * 17.3 + i) * 0.06;
      f.scale.set(0.011 / Math.sqrt(s), 0.022 * s, 0.011 / Math.sqrt(s));
      f.rotation.z = Math.sin(t * 3.7 + i) * 0.12;
    });
    glowMat.opacity = 0.18 + Math.sin(t * 13) * 0.05;
  };
  return built;
}

export function bicorne(): BuiltHat {
  const b = new Builder();
  const felt = '#1e1b22';
  const gold = '#e2b23a';
  // An emperor's bicorne, worn sideways with its points over the ears: two half-moon flaps of black felt leaning
  // together over a low crown, gold braid along their edges, and a blue, white and red cockade on the front.
  const W = 0.27;
  const H = 0.17;
  const arc = (k: number) => {
    const out: THREE.Vector2[] = [];
    for (let i = 0; i <= 24; i++) {
      const a = Math.PI - (i / 24) * Math.PI;
      // Pointed at the ends: the curve pinched in towards them.
      out.push(new THREE.Vector2(Math.cos(a) * W * k, Math.sin(a) ** 1.25 * H * k));
    }
    return out;
  };
  const shape = new THREE.Shape(arc(1));
  shape.quadraticCurveTo(0, 0.03, -W, 0);
  const flapGeo = new THREE.ExtrudeGeometry(shape, { depth: 0.018, bevelEnabled: true, bevelSize: 0.006, bevelThickness: 0.006, bevelSegments: 2, curveSegments: 12 });
  flapGeo.translate(0, 0, -0.009);
  const braid = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(arc(1).map((v) => new THREE.Vector3(v.x, v.y, 0))), 48, 0.009, 5, false);
  for (const side of [-1, 1]) {
    const m = new THREE.Matrix4().compose(new THREE.Vector3(0, -0.045, side * 0.075), new THREE.Quaternion().setFromEuler(new THREE.Euler(-side * 0.36, 0, 0)), new THREE.Vector3(1, 1, 1));
    b.add(flapGeo, felt, m);
    b.add(braid, gold, m.clone().multiply(new THREE.Matrix4().makeTranslation(0, 0, side * 0.012)));
  }
  flapGeo.dispose();
  braid.dispose();
  b.add(dome(24, 8), felt, { pos: [0, -0.045, 0], scale: [0.2, 0.15, 0.1] });
  // The cockade, on the front flap off to one side, with a gold loop over it.
  const F = new THREE.Matrix4().compose(new THREE.Vector3(-0.13, 0.06, 0.06), new THREE.Quaternion().setFromEuler(new THREE.Euler(-0.36, 0, 0)), new THREE.Vector3(1, 1, 1));
  for (const [r, c, z] of [
    [0.05, '#d02a34', 0.012],
    [0.034, '#f8f6f0', 0.016],
    [0.018, '#2a4aa8', 0.02],
  ] as [number, string, number][]) {
    b.add(cyl(20), c, { pos: [0, 0, z], rot: [Math.PI / 2, 0, 0], scale: [r, 0.006, r] }, F);
  }
  b.add(box(), gold, { pos: [0, 0.01, 0.025], scale: [0.016, 0.1, 0.006] }, F);
  b.add(sph(8, 6), gold, { pos: [0, -0.04, 0.026], scale: 0.01 }, F);
  return finish(b, { top: 0.15, sit: { kind: 'brim', rim: [-0.045, 0.18, 0.1] } });
}

export function bearskin(): BuiltHat {
  const b = new Builder();
  // A guardsman's bearskin: a tall black fur hat, rounded over the top and shaggy all over, with a red plume up the
  // right side and a gold chain looped across the front.
  const profile = [
    [0.287, -0.17],
    [0.298, -0.06],
    [0.305, 0.08],
    [0.293, 0.2],
    [0.262, 0.3],
    [0.2, 0.37],
    [0.11, 0.405],
    [0.001, 0.415],
  ].map(([r, y]) => new THREE.Vector2(r, y));
  // (Its seam round the back, where any crack the shagginess opens can't be seen.)
  const fur = jitter(new THREE.LatheGeometry(profile, 28, Math.PI + 0.1), 0.022, 7);
  b.add(fur, '#25212a', { scale: [1, 1, 1.03] });
  fur.dispose();
  // Tufts all over, a little lighter, so it reads as fur.
  for (let i = 0; i < 40; i++) {
    const a = i * 2.39996;
    const y = -0.12 + ((i * 53) % 40) * 0.0125;
    const t = THREE.MathUtils.clamp((y + 0.17) / 0.585, 0, 1);
    const r = 0.3 * Math.sqrt(Math.max(0.05, 1 - Math.max(0, (t - 0.4) / 0.6) ** 2));
    b.add(sph(6, 4), i % 3 ? '#242026' : '#1a171c', { pos: [Math.sin(a) * r * 0.97, y, Math.cos(a) * r * 0.97 * 1.03], rot: [0, a, 0], scale: [0.045, 0.034, 0.016] });
  }
  // The plume: red feathers up the right side from a gold socket.
  b.add(cyl(10), '#d8a838', { pos: [0.296, -0.06, -0.03], scale: [0.016, 0.03, 0.016] });
  for (let i = 0; i < 6; i++) {
    const y = -0.03 + i * 0.05;
    b.add(sph(10, 6), i % 2 ? '#c41e2a' : '#e0303a', { pos: [0.31 - i * 0.004, y, -0.03 - i * 0.004], rot: [0.15, 0, -0.08], scale: [0.03, 0.06, 0.026] });
  }
  // The chain, in a swag across the front.
  for (let i = 0; i <= 18; i++) {
    const a = -0.95 + (i / 18) * 1.9;
    const sag = Math.cos((a / 0.95) * (Math.PI / 2));
    b.add(torus(0.35, 4, 8), '#e8b83a', { pos: [Math.sin(a) * 0.31, -0.1 - sag * 0.045, Math.cos(a) * 0.32], rot: [0, a + (i % 2 ? Math.PI / 2 : 0), 0], scale: 0.011 });
  }
  return finish(b, { top: 0.42, sit: { kind: 'snug', rim: [-0.17, 0.287, 0.296] } });
}

export function centurion(): BuiltHat {
  const b = new Builder();
  const bronze = ['#e2b25a', '#c8913a', '#a8762c'];
  // A Roman centurion's helmet: a polished bronze bowl with a rolled brow, a neck guard flaring out at the back,
  // studs round it, and the great red crest running across the top from ear to ear.
  const C: Vec3 = [0, -0.14, -0.01];
  const R: Vec3 = [0.275, 0.22, 0.285];
  shellBand(b, C, R, 0, 0.6, bronze[0]);
  shellBand(b, C, R, 0.6, 1.15, bronze[1]);
  shellBand(b, C, R, 1.15, Math.PI / 2, bronze[2]);
  b.add(torus(0.2, 6, 36), bronze[0], { pos: [0, C[1] + 0.004, C[2]], rot: [Math.PI / 2, 0, 0], scale: [R[0] + 0.006, R[2] + 0.006, 0.16] });
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2;
    b.add(sph(6, 4), '#f2d080', { pos: [Math.sin(a) * (R[0] + 0.012), C[1] + 0.03, C[2] + Math.cos(a) * (R[2] + 0.012)], scale: 0.01 });
  }
  const guard = warp(new THREE.CylinderGeometry(1, 1, 1, 24, 1, false, Math.PI / 2 + 0.25, Math.PI - 0.5), (v) => v.set(v.x * 0.335, v.y * 0.014 - 0.05 * Math.max(0, -v.z), v.z * 0.35));
  b.add(guard, bronze[1], { pos: [0, C[1] + 0.006, C[2]] });
  guard.dispose();
  // The crest: a bronze holder across the top, and the bristles fanning out of it.
  const holder = new THREE.TorusGeometry(1, 0.06, 5, 24, Math.PI);
  b.add(holder, bronze[2], { pos: C, scale: [R[0] + 0.008, R[1] + 0.008, 0.25] });
  holder.dispose();
  const up = new THREE.Vector3(0, 1, 0);
  for (let i = 0; i <= 26; i++) {
    const a = 0.12 + (i / 26) * (Math.PI - 0.24);
    const from = new THREE.Vector3(Math.cos(a) * (R[0] + 0.01), C[1] + Math.sin(a) * (R[1] + 0.01), C[2]);
    const dir = new THREE.Vector3(Math.cos(a) * 0.8, Math.sin(a), 0).normalize();
    const len = 0.12 + Math.sin(a) * 0.04;
    const m = new THREE.Matrix4().compose(from.clone().addScaledVector(dir, len / 2), new THREE.Quaternion().setFromUnitVectors(up, dir), new THREE.Vector3(0.035, len, 0.055 - (i % 2) * 0.01));
    b.add(box(), i % 3 ? '#c41e2a' : '#a8141e', m);
  }
  return finish(b, { top: 0.24, sit: { kind: 'snug', rim: [-0.14, 0.275, 0.285] } }, wet());
}

export function tiara(): BuiltHat {
  const b = new Builder();
  const silver = '#e2e6ee';
  const diamond = '#f6fcff';
  // A princess's diamond tiara: a fine silver circlet round the head, rising at the front in scrolls and points to a
  // tall middle, a diamond on every point, a big pale blue one in the middle, and pearls along the bottom. The
  // diamonds twinkle.
  const Y = -0.075;
  const RR = 0.222;
  const on = (a: number, y: number, out = 0): THREE.Vector3 => new THREE.Vector3(Math.sin(a) * (RR + out), Y + y, Math.cos(a) * (RR + out));
  // (The circlet only goes round to the ears: the back would be hidden in the hair.)
  const circlet = new THREE.TorusGeometry(1, 0.035, 5, 40, 3.3).rotateZ(Math.PI / 2 - 1.65);
  b.add(circlet, silver, { pos: [0, Y, 0], rot: [Math.PI / 2, 0, 0], scale: [RR, RR, 0.18] });
  circlet.dispose();
  for (const side of [-1, 1]) b.add(sph(8, 6), '#fbf6ec', { pos: on(side * 1.65, 0).toArray(), scale: 0.011 });
  const height = (a: number) => 0.035 + 0.08 * Math.cos(Math.min(1, Math.abs(a) / 1.0) * (Math.PI / 2)) ** 2;
  const tips: Vec3[] = [];
  for (let i = -5; i <= 5; i++) {
    const a = i * 0.19;
    const h = height(a);
    // Leaning back a little, as it would on a real head.
    const face = new THREE.Quaternion().setFromEuler(new THREE.Euler(-0.15, a, 0, 'YXZ'));
    const up = new THREE.Vector3(0, 1, 0).applyQuaternion(face);
    // A point standing up from the band with a diamond on top, and a scroll between it and the next.
    const base = on(a, 0);
    b.add(new THREE.ConeGeometry(1, 1, 6), silver, new THREE.Matrix4().compose(base.clone().addScaledVector(up, h / 2), face, new THREE.Vector3(0.009, h, 0.006)));
    const tip = base.clone().addScaledVector(up, h + (i ? 0.008 : 0.02));
    b.add(new THREE.OctahedronGeometry(1), i ? diamond : '#bfe4ff', new THREE.Matrix4().compose(tip, face, new THREE.Vector3(i ? 0.012 : 0.026, i ? 0.016 : 0.034, i ? 0.01 : 0.016)));
    if (Math.abs(i) <= 4 && i % 2 === 0) tips.push([tip.x * 1.06, tip.y + 0.004, tip.z * 1.06]);
    if (i < 5) {
      const hm = Math.min(h, height(a + 0.19)) * 0.5;
      const mid = on(a + 0.095, 0).addScaledVector(up, hm * 0.9);
      b.add(torus(0.18, 4, 14), silver, new THREE.Matrix4().compose(mid, face, new THREE.Vector3(0.021, hm, 0.021)));
      b.add(sph(8, 6), '#fbf6ec', { pos: on(a + 0.095, -0.004, 0.004).toArray(), scale: 0.0085 });
    }
  }
  const built = finish(b, { top: 0.04, sit: { kind: 'ring', rim: [-0.14, RR], tilt: 0.05 } }, wet());
  built.update = twinkles(built, tips, 0.03);
  return built;
}

export function topper(): BuiltHat {
  const b = new Builder();
  const silk = '#2e1a34';
  const gold = '#e2b23a';
  // The finest topper in town: tall plum silk with curled brim edges and a gold band, and a gold-rimmed monocle
  // tucked into the band, its fine chain draped round to the brim.
  b.add(cyl(36), silk, { pos: [0, -0.035, 0], scale: [0.22, 0.016, 0.22] });
  b.add(torus(0.35, 6, 36), silk, { pos: [0, -0.03, 0], rot: [Math.PI / 2, 0, 0], scale: [0.22, 0.22, 0.045] });
  b.add(cyl(32, 1.06, 1), silk, { pos: [0, 0.125, 0], scale: [0.135, 0.32, 0.135] });
  b.add(cyl(32), '#4a2c52', { pos: [0, 0.287, 0], scale: [0.145, 0.006, 0.145] });
  b.add(cyl(32), gold, { pos: [0, 0.008, 0], scale: [0.14, 0.055, 0.14] });
  b.add(cyl(32), '#1a1018', { pos: [0, 0.03, 0], scale: [0.1405, 0.008, 0.1405] });
  // The monocle, tucked in the band at the front, a little skew.
  const at = new THREE.Vector3(0.065, 0.018, 0.134);
  const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(0.05, 0.42, 0.3));
  b.add(torus(0.16, 6, 24), gold, new THREE.Matrix4().compose(at, q, new THREE.Vector3(0.042, 0.042, 0.034)));
  b.add(cyl(24), '#cfe8f4', new THREE.Matrix4().compose(at, q.clone().multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.PI / 2, 0, 0))), new THREE.Vector3(0.039, 0.003, 0.039)));
  // Its chain, in little links, down from the monocle and round the side of the crown to the brim.
  const chain = new THREE.CatmullRomCurve3(
    [
      [0.09, -0.004, 0.122],
      [0.13, -0.02, 0.105],
      [0.16, -0.022, 0.05],
      [0.155, -0.012, -0.02],
    ].map(([x, y, z]) => new THREE.Vector3(x, y, z)),
  );
  for (let i = 0; i <= 16; i++) {
    const p = chain.getPoint(i / 16);
    const tq = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(1, 0, 0), chain.getTangent(i / 16));
    if (i % 2) tq.multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.PI / 2, 0, 0)));
    b.add(torus(0.3, 4, 8), gold, new THREE.Matrix4().compose(p, tq, new THREE.Vector3(0.007, 0.0045, 0.0045)));
  }
  return finish(b, { top: 0.3, sit: { kind: 'brim', rim: [-0.035, 0.135] } }, wet());
}

// ---------------------------------------------------------------- the trophy

export function trophy(): BuiltHat {
  const b = new Builder();
  const gold = ['#f6d04a', '#e8b83a', '#d49a24'];
  // The Crown of Midas, for showing off: solid gold, tall, with two arches crossing over a red velvet cap, an orb and
  // a great diamond on top, ermine round the bottom and fat jewels all round the band. Glints come and go all over
  // it, and the diamond turns slowly, catching the light.
  const R = 0.175;
  b.add(dome(18, 7), '#6e1430', { pos: [0, -0.03, 0], scale: [R * 0.96, 0.19, R * 0.96] });
  const band = new THREE.LatheGeometry(
    [
      [R - 0.012, -0.045],
      [R + 0.008, -0.045],
      [R + 0.016, 0.0],
      [R + 0.012, 0.05],
      [R - 0.004, 0.05],
      [R - 0.012, -0.045],
    ].map(([r, y]) => new THREE.Vector2(r, y)),
    36,
  );
  b.add(band, gold[1]);
  band.dispose();
  b.add(torus(0.25, 5, 36), gold[0], { pos: [0, 0.052, 0], rot: [Math.PI / 2, 0, 0], scale: [R + 0.006, R + 0.006, 0.05] });
  // Ermine: a white roll with black flecks.
  b.add(torus(0.3, 8, 36), '#fbf8f2', { pos: [0, -0.048, 0], rot: [Math.PI / 2, 0, 0], scale: [R + 0.016, R + 0.016, 0.1] });
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2 + 0.13;
    b.add(sph(6, 4), '#1c1a1e', { pos: [Math.sin(a) * (R + 0.04), -0.046, Math.cos(a) * (R + 0.04)], rot: [0, a, 0], scale: [0.008, 0.012, 0.005] });
  }
  const jewels = ['#d8203a', '#2a5ae0', '#20b060', '#d8203a', '#8a3ae0', '#20b060', '#d8203a', '#2a5ae0'];
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const x = Math.sin(a);
    const z = Math.cos(a);
    // A point with a pearl on every one, a fleur standing taller on every other, and a fat jewel below each.
    const tall = i % 2 === 0;
    b.add(new THREE.ConeGeometry(1, 1, 10), gold[0], { pos: [x * (R + 0.004), tall ? 0.11 : 0.085, z * (R + 0.004)], scale: [0.04, tall ? 0.12 : 0.07, 0.03], rot: [0, a, 0] });
    b.add(sph(8, 6), '#fbf8f2', { pos: [x * (R + 0.004), tall ? 0.176 : 0.126, z * (R + 0.004)], scale: 0.019 });
    b.add(sph(10, 8), jewels[i], { pos: [x * (R + 0.018), 0.004, z * (R + 0.018)], rot: [0, a, 0], scale: [0.026, 0.03, 0.014] });
    b.add(torus(0.25, 4, 16), gold[2], { pos: [x * (R + 0.017), 0.004, z * (R + 0.017)], rot: [0, a, 0], scale: [0.03, 0.034, 0.03] });
  }
  // Two arches crossing over the top, pearls along them.
  const H = 0.24;
  for (const turn of [0, Math.PI / 2]) {
    const arch = new THREE.TorusGeometry(1, 0.1, 6, 28, Math.PI);
    b.add(arch, gold[1], { pos: [0, 0.05, 0], rot: [0, turn, 0], scale: [R - 0.004, H, 0.24] });
    arch.dispose();
    for (let k = 1; k < 8; k++) {
      const a = (k / 8) * Math.PI;
      const p = new THREE.Vector3(Math.cos(a) * (R - 0.004), 0.05 + Math.sin(a) * H + 0.012, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), turn);
      b.add(sph(6, 4), '#fbf8f2', { pos: p.toArray(), scale: 0.009 });
    }
  }
  // The orb, and a little cross on it.
  const top = 0.05 + H;
  b.add(sph(16, 12), gold[0], { pos: [0, top + 0.03, 0], scale: 0.035 });
  b.add(torus(0.18, 4, 20), gold[2], { pos: [0, top + 0.03, 0], rot: [Math.PI / 2, 0, 0], scale: 0.036 });
  const built = finish(b, { top: top + 0.13, sit: { kind: 'brim', rim: [-0.045, R + 0.016] } }, wet());
  // The diamond, glowing faintly on its own, turning.
  const gemMat = new THREE.MeshStandardMaterial({ color: '#eaf8ff', emissive: '#bfe8ff', emissiveIntensity: 0.6, roughness: 0.15, metalness: 0.1, flatShading: true });
  const gem = new THREE.Mesh(new THREE.OctahedronGeometry(1, 0), gemMat);
  gem.scale.set(0.034, 0.05, 0.034);
  gem.position.set(0, top + 0.11, 0);
  gem.castShadow = false;
  built.group.add(gem);
  built.materials.push(gemMat);
  const glints = twinkles(
    built,
    [
      [0, top + 0.13, 0.03],
      [R + 0.03, 0.03, 0.02],
      [-R - 0.01, 0.12, 0.05],
      [0.06, 0.16, R],
      [-0.08, -0.01, R + 0.04],
      [0.1, 0.2, -0.06],
      [-R, 0.0, -0.08],
    ],
    0.045,
  );
  built.update = (t) => {
    gem.rotation.y = t * 0.7;
    gemMat.emissiveIntensity = 0.5 + Math.max(0, Math.sin(t * 1.3)) ** 8 * 0.9;
    glints(t);
  };
  return built;
}
