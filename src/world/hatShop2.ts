import * as THREE from 'three';
import { Builder, type Vec3 } from './build';
import { cyl, dome, finish, onShell, shellBand, sph, torus, type BuiltHat } from './hats';

/**
 * A second shelf of hats from the Lucky Raven's shop, sillier than the first: made like the others (see hats.ts),
 * for a reference head about half a metre across with the origin at its top, each saying how it's worn.
 */

const box = () => new THREE.BoxGeometry(1, 1, 1);
const cone = (n = 16) => new THREE.ConeGeometry(1, 1, n);

export function plunger(): BuiltHat {
  const b = new Builder();
  // A sink plunger stuck to the top of the head: a red rubber cup and a long wooden handle, leaning a little.
  const lean = new THREE.Matrix4().makeRotationZ(-0.14);
  b.add(cyl(22, 0.62, 1), '#d8302a', { pos: [0, 0.035, 0], scale: [0.115, 0.075, 0.115] }, lean);
  b.add(dome(22, 6), '#c8261f', { pos: [0, 0.07, 0], scale: [0.072, 0.04, 0.072] }, lean);
  b.add(torus(0.18, 6, 24), '#b01e18', { pos: [0, 0.0, 0], rot: [Math.PI / 2, 0, 0], scale: [0.115, 0.115, 0.08] }, lean);
  b.add(cyl(10), '#c49a6c', { pos: [0, 0.27, 0], scale: [0.018, 0.42, 0.018] }, lean);
  b.add(sph(10, 6), '#b08a58', { pos: [0, 0.48, 0], scale: [0.022, 0.012, 0.022] }, lean);
  return finish(b, { top: 0.48, sit: { kind: 'perch', rim: [-0.005, 0.11] } });
}

export function duck(): BuiltHat {
  const b = new Builder();
  const yellow = '#ffd23a';
  // A rubber duck sitting on your head: round body, its head up at the front, an orange beak, a little tail.
  b.add(sph(16, 10), yellow, { pos: [0, 0.055, -0.01], scale: [0.11, 0.075, 0.135] });
  b.add(sph(14, 10), yellow, { pos: [0, 0.15, 0.06], scale: 0.068 });
  b.add(sph(10, 6), '#f08a24', { pos: [0, 0.14, 0.128], scale: [0.04, 0.014, 0.035] });
  b.add(cone(8), yellow, { pos: [0, 0.1, -0.14], rot: [-1.0, 0, 0], scale: [0.035, 0.07, 0.035] });
  for (const x of [-1, 1]) {
    b.add(sph(8, 6), '#1d1d24', { pos: [x * 0.033, 0.168, 0.112], scale: 0.012 });
    b.add(sph(8, 6), '#f6c41a', { pos: [x * 0.1, 0.07, -0.01], rot: [0, 0, x * 0.4], scale: [0.025, 0.04, 0.07] });
  }
  return finish(b, { top: 0.22, sit: { kind: 'perch', rim: [-0.01, 0.1] } });
}

export function lampshade(): BuiltHat {
  const b = new Builder();
  const pink = '#f2a6b8';
  const gold = '#e2b23a';
  // A party lampshade: a pink drum shade with gold trim round both edges and gold tassels hanging all round.
  b.add(cyl(28, 0.62, 1), pink, { pos: [0, 0.05, 0], scale: [0.2, 0.22, 0.2] });
  b.add(torus(0.12, 5, 28), gold, { pos: [0, -0.06, 0], rot: [Math.PI / 2, 0, 0], scale: [0.2, 0.2, 0.12] });
  b.add(torus(0.12, 5, 28), gold, { pos: [0, 0.16, 0], rot: [Math.PI / 2, 0, 0], scale: [0.124, 0.124, 0.12] });
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    b.add(cyl(5), gold, { pos: [Math.sin(a) * 0.205, -0.085, Math.cos(a) * 0.205], scale: [0.004, 0.04, 0.004] });
    b.add(sph(6, 4), gold, { pos: [Math.sin(a) * 0.205, -0.11, Math.cos(a) * 0.205], scale: [0.012, 0.016, 0.012] });
  }
  return finish(b, { top: 0.17, sit: { kind: 'brim', rim: [-0.06, 0.19] } });
}

export function sushi(): BuiltHat {
  const b = new Builder();
  // A giant piece of salmon nigiri, set on at a jaunty angle: a mound of rice, a slice of salmon with pale stripes
  // draped over it, and a band of nori round the middle.
  const turn = new THREE.Matrix4().makeRotationY(0.45);
  b.add(sph(16, 10), '#fbf8f0', { pos: [0, 0.04, 0], scale: [0.16, 0.06, 0.095] }, turn);
  for (let i = 0; i < 9; i++) b.add(sph(6, 4), '#f2eee2', { pos: [-0.12 + i * 0.03, 0.02 + (i % 2) * 0.02, (i % 3) * 0.03 - 0.03], scale: 0.022 }, turn);
  b.add(sph(18, 8), '#f2804a', { pos: [0, 0.085, 0], scale: [0.185, 0.032, 0.11] }, turn);
  for (let i = -2; i <= 2; i++) b.add(box(), '#fbd2b8', { pos: [i * 0.055, 0.115, 0], rot: [0, 0.5, 0], scale: [0.012, 0.004, 0.18] }, turn);
  b.add(cyl(18), '#1e2a1e', { pos: [0, 0.055, 0], rot: [0, 0, Math.PI / 2], scale: [0.105, 0.06, 0.11] }, turn);
  return finish(b, { top: 0.13, sit: { kind: 'perch', rim: [-0.005, 0.13] } });
}

export function flowerpot(): BuiltHat {
  const b = new Builder();
  // A terracotta flowerpot worn the right way up, a sunflower growing out of it nodding forward, and two leaves.
  b.add(cyl(24, 1.25, 1), '#c86a3a', { pos: [0, 0.06, 0], scale: [0.14, 0.15, 0.14] });
  b.add(cyl(24), '#b85a2e', { pos: [0, 0.145, 0], scale: [0.185, 0.04, 0.185] });
  b.add(cyl(24), '#4a3424', { pos: [0, 0.16, 0], scale: [0.16, 0.01, 0.16] });
  b.add(cyl(8), '#4e8a34', { pos: [0, 0.29, 0.02], rot: [0.12, 0, 0], scale: [0.012, 0.26, 0.012] });
  for (const x of [-1, 1]) b.add(sph(8, 4), '#5a9a3a', { pos: [x * 0.05, 0.25, 0.015], rot: [0, 0, -x * 0.5], scale: [0.055, 0.012, 0.03] });
  // The flower's face, tipped forward.
  const face = new THREE.Matrix4().compose(new THREE.Vector3(0, 0.43, 0.05), new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.PI / 2 - 0.35, 0, 0)), new THREE.Vector3(1, 1, 1));
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    b.add(sph(8, 4), i % 2 ? '#ffd23a' : '#f6c42a', { pos: [Math.sin(a) * 0.075, 0, Math.cos(a) * 0.075], rot: [0, a, 0], scale: [0.025, 0.008, 0.05] }, face);
  }
  b.add(cyl(16), '#6a4220', { pos: [0, 0.006, 0], scale: [0.05, 0.016, 0.05] }, face);
  return finish(b, { top: 0.5, sit: { kind: 'brim', rim: [-0.015, 0.115] } });
}

export function icecream(): BuiltHat {
  const b = new Builder();
  // A dropped ice cream, upside down on your head: a strawberry scoop melting down round it, the waffle cone sticking
  // straight up, and a few sprinkles.
  b.add(dome(24, 8), '#f4a2bc', { pos: [0, -0.06, 0], scale: [0.21, 0.13, 0.21] });
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2 + 0.2;
    const len = 0.03 + ((i * 7) % 4) * 0.012;
    b.add(sph(8, 6), '#f4a2bc', { pos: [Math.sin(a) * 0.2, -0.06 - len * 0.6, Math.cos(a) * 0.2], rot: [0, a, 0], scale: [0.03, len, 0.02] });
  }
  b.add(cone(18), '#d8a050', { pos: [0, 0.2, 0], scale: [0.1, 0.24, 0.1] });
  for (let i = 0; i < 4; i++) {
    const y = 0.11 + i * 0.045;
    const r = 0.1 * (1 - (y - 0.08) / 0.24) + 0.002;
    b.add(torus(0.05, 4, 18), '#b8803a', { pos: [0, y, 0], rot: [Math.PI / 2, 0, 0], scale: [r, r, 0.4] });
  }
  for (let i = 0; i < 14; i++) {
    const a = i * 2.39996;
    const { p, n } = onShell(0.21, 0.13, 0.21, a, 0.25 + ((i * 0.37) % 1) * 0.6, -0.06);
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), n);
    b.add(box(), ['#ffffff', '#4ab8f0', '#ffd23a', '#6ad06a'][i % 4], new THREE.Matrix4().compose(p, q.multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), a)), new THREE.Vector3(0.026, 0.008, 0.008)));
  }
  return finish(b, { top: 0.33, sit: { kind: 'brim', rim: [-0.06, 0.2] } });
}

export function frog(): BuiltHat {
  const b = new Builder();
  const green = '#5ab84a';
  // A plush frog cap: a green cap with a paler band, two big eyes on top, a wide smile and rosy cheeks.
  const C: Vec3 = [0, -0.13, -0.01];
  const R: Vec3 = [0.27, 0.22, 0.285];
  shellBand(b, C, R, 0, 1.25, green);
  shellBand(b, C, R, 1.25, Math.PI / 2, '#a8dc8a');
  for (const x of [-1, 1]) {
    b.add(sph(16, 12), green, { pos: [x * 0.11, 0.04, 0.08], scale: 0.075 });
    b.add(sph(12, 10), '#fbfbf6', { pos: [x * 0.11, 0.055, 0.125], scale: 0.05 });
    b.add(sph(10, 8), '#1d1d24', { pos: [x * 0.11, 0.06, 0.165], scale: 0.025 });
    const { p, n } = onShell(R[0], R[1], R[2], x * 0.75, 0.55, C[1]);
    p.z += C[2];
    b.add(sph(8, 6), '#f28a9a', { pos: p.addScaledVector(n, 0.002).toArray(), scale: [0.03, 0.018, 0.01] });
  }
  // The smile: a curve across the front.
  b.add(new THREE.TorusGeometry(1, 0.06, 5, 16, Math.PI * 0.5), '#2a4a22', { pos: [0, 0.05, 0.155], rot: [-0.5, 0, Math.PI * 1.25], scale: [0.1, 0.1, 0.1] });
  return finish(b, { top: 0.12, sit: { kind: 'snug', rim: [-0.13, 0.27, 0.285] } });
}

export function bobby(): BuiltHat {
  const b = new Builder();
  const navy = '#1e2a4a';
  // A British police officer's helmet: a tall navy dome, a band round the bottom, a silver knob on top and a silver
  // star badge on the front.
  b.add(sph(24, 14), navy, { pos: [0, 0.03, -0.01], scale: [0.2, 0.26, 0.225] });
  b.add(cyl(28), '#16203a', { pos: [0, -0.03, -0.01], scale: [0.205, 0.05, 0.23] });
  b.add(torus(0.18, 5, 28), '#16203a', { pos: [0, -0.055, -0.01], rot: [Math.PI / 2, 0, 0], scale: [0.215, 0.24, 0.1] });
  b.add(cyl(12), '#c8ccd2', { pos: [0, 0.29, -0.01], scale: [0.025, 0.03, 0.025] });
  b.add(sph(10, 6), '#d8dce2', { pos: [0, 0.31, -0.01], scale: 0.028 });
  const star = new THREE.Shape();
  for (let i = 0; i < 16; i++) {
    const r = i % 2 ? 0.026 : 0.05;
    const a = (i / 16) * Math.PI * 2;
    if (i === 0) star.moveTo(Math.sin(a) * r, Math.cos(a) * r);
    else star.lineTo(Math.sin(a) * r, Math.cos(a) * r);
  }
  const badge = new THREE.ExtrudeGeometry(star, { depth: 0.01, bevelEnabled: false });
  b.add(badge, '#d8dce2', { pos: [0, 0.07, 0.2], rot: [-0.35, 0, 0] });
  badge.dispose();
  b.add(cyl(14), '#2a4a9a', { pos: [0, 0.07, 0.21], rot: [Math.PI / 2 - 0.35, 0, 0], scale: [0.018, 0.006, 0.018] });
  return finish(b, { top: 0.33, sit: { kind: 'brim', rim: [-0.06, 0.2, 0.225] } });
}

export function pharaoh(): BuiltHat {
  const b = new Builder();
  const gold = '#e2b23a';
  const blue = '#2a4aa8';
  // A pharaoh's striped headdress: blue and gold bands over the head, a gold brow band, the striped flaps falling
  // behind the ears to the shoulders, and a golden cobra rearing at the front.
  const C: Vec3 = [0, -0.13, -0.01];
  const R: Vec3 = [0.275, 0.225, 0.29];
  // Stripes running down from the crown, each a slice of the cap.
  const stripes = 18;
  for (let i = 0; i < stripes; i++) {
    const g = new THREE.SphereGeometry(1, 3, 7, (i / stripes) * Math.PI * 2, (Math.PI * 2) / stripes, 0, Math.PI / 2);
    b.add(g, i % 2 ? gold : blue, { pos: C, scale: R });
    g.dispose();
  }
  b.add(sph(12, 6), gold, { pos: [0, C[1] + R[1] - 0.005, C[2]], scale: [0.05, 0.012, 0.05] });
  b.add(cyl(36), gold, { pos: [0, C[1] - 0.005, C[2]], scale: [R[0] + 0.008, 0.03, R[2] + 0.008] });
  for (const x of [-1, 1]) {
    for (let k = 0; k < 5; k++) {
      b.add(box(), k % 2 ? gold : blue, { pos: [x * 0.255, C[1] - 0.04 - k * 0.04, -0.09 - k * 0.006], rot: [0.1, 0, x * 0.12], scale: [0.03, 0.04, 0.16 + k * 0.012] });
    }
  }
  b.add(box(), blue, { pos: [0, C[1] - 0.06, -0.27], rot: [0.2, 0, 0], scale: [0.14, 0.14, 0.03] });
  // The cobra: coiled body up the brow, its hood and head.
  b.add(sph(10, 8), gold, { pos: [0, C[1] + 0.06, 0.28], scale: [0.025, 0.05, 0.02] });
  b.add(sph(10, 8), '#f2c84a', { pos: [0, C[1] + 0.12, 0.29], scale: [0.035, 0.04, 0.012] });
  b.add(sph(8, 6), gold, { pos: [0, C[1] + 0.15, 0.3], scale: [0.016, 0.014, 0.022] });
  return finish(b, { top: 0.12, sit: { kind: 'snug', rim: [-0.13, 0.275, 0.29] } });
}

export function ufo(): BuiltHat {
  const b = new Builder();
  // A little flying saucer hovering over your head: a silver saucer with a glass dome and an alien peeping out,
  // a ring of lights chasing round its rim, and a faint beam down onto you.
  b.add(sph(28, 10), '#c8ccd6', { pos: [0, 0, 0], scale: [0.2, 0.04, 0.2] });
  b.add(torus(0.1, 5, 32), '#9aa0ae', { pos: [0, -0.005, 0], rot: [Math.PI / 2, 0, 0], scale: [0.195, 0.195, 0.2] });
  b.add(cyl(20, 0.7, 1), '#8a909e', { pos: [0, -0.04, 0], scale: [0.08, 0.03, 0.08] });
  b.add(sph(12, 10), '#6ad06a', { pos: [0, 0.055, 0], scale: [0.04, 0.045, 0.04] });
  for (const x of [-1, 1]) b.add(sph(8, 6), '#1d1d24', { pos: [x * 0.017, 0.065, 0.032], scale: [0.012, 0.016, 0.008] });
  const built = finish(b, { top: 0.32, sit: { kind: 'float', rim: [0, 0.17] } });
  const body = built.group.children[0];
  const holder = new THREE.Group();
  holder.position.y = 0.18;
  built.group.remove(body);
  holder.add(body);
  built.group.add(holder);
  // The glass dome over the alien.
  const glass = new THREE.MeshStandardMaterial({ color: '#bfe8ff', transparent: true, opacity: 0.4, roughness: 0.1, depthWrite: false });
  const dm = new THREE.Mesh(new THREE.SphereGeometry(0.075, 18, 8, 0, Math.PI * 2, 0, Math.PI / 2), glass);
  dm.position.y = 0.025;
  dm.castShadow = false;
  holder.add(dm);
  // The lights round the rim, one lit after another.
  const lightGeo = new THREE.SphereGeometry(0.014, 8, 6);
  const lights = Array.from({ length: 8 }, (_, i) => {
    const mat = new THREE.MeshBasicMaterial({ color: ['#ff5a5a', '#ffd23a', '#5ad0ff', '#7aff7a'][i % 4] });
    const m = new THREE.Mesh(lightGeo, mat);
    const a = (i / 8) * Math.PI * 2;
    m.position.set(Math.sin(a) * 0.17, 0.012, Math.cos(a) * 0.17);
    m.castShadow = false;
    holder.add(m);
    built.materials.push(mat);
    return m;
  });
  // The beam: a soft cone of light down from the bottom.
  const beamMat = new THREE.MeshBasicMaterial({ color: '#c8ffd8', transparent: true, opacity: 0.1, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide });
  const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.13, 0.16, 20, 1, true), beamMat);
  beam.position.y = -0.12;
  beam.castShadow = false;
  holder.add(beam);
  built.materials.push(glass, beamMat);
  built.update = (t) => {
    holder.position.y = 0.18 + Math.sin(t * 1.9) * 0.015;
    holder.rotation.y = t * 0.8;
    holder.rotation.z = Math.sin(t * 1.3) * 0.05;
    lights.forEach((m, i) => m.scale.setScalar(Math.floor(t * 8) % 8 === i ? 1.5 : 0.8));
    beamMat.opacity = 0.08 + Math.sin(t * 4.1) * 0.03;
  };
  return built;
}
