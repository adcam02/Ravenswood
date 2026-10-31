import * as THREE from 'three';
import { Builder, glow, jitter, rng, soft, wet, type Vec3 } from './build';
import { bentCone, bentTube, brimGeo, cyl, dome, finish, inward, onShell, shellBand, sph, starGeo, torus, warp, type BuiltHat } from './hats';

/**
 * A third shelf of hats from the Lucky Raven's shop: homages to heroes, villains and gags everyone knows, none of
 * them anyone's in particular. Made like the others (see hats.ts), for a reference head about half a metre across
 * with the origin at its top, each saying how it's worn.
 */

const box = () => new THREE.BoxGeometry(1, 1, 1);
const cone = (n = 16) => new THREE.ConeGeometry(1, 1, n);
/** A matrix turning +y to `dir`, at `at`, scaled. */
const along = (at: THREE.Vector3, dir: THREE.Vector3, s: Vec3) => new THREE.Matrix4().compose(at, new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize()), new THREE.Vector3(...s));
/** Adds a mesh built separately (so it can move) to a hat, turning ghostly with it. */
function moving(built: BuiltHat, b: Builder, material = soft()): THREE.Mesh {
  const mesh = b.mesh(material, { cast: true, receive: false });
  built.group.add(mesh);
  built.solid.push({ mesh, material });
  built.materials.push(material);
  return mesh;
}
/** See-through glass, which casts no shadow and isn't ghosted (it's nearly a ghost already). */
function glass(built: BuiltHat, geo: THREE.BufferGeometry, color: string, opacity: number, parent: THREE.Object3D = built.group): THREE.Mesh {
  const mat = new THREE.MeshPhongMaterial({ color, specular: '#ffffff', shininess: 100, transparent: true, opacity, depthWrite: false });
  const m = new THREE.Mesh(geo, mat);
  m.castShadow = false;
  m.renderOrder = 2;
  parent.add(m);
  built.materials.push(mat);
  return m;
}

/**
 * A hood drawn over the whole head (like the reaper's, without its point): a shell round the head with a round hole
 * `hole` radians wide where the face looks out, facing forward and `down` radians below level, a lining inside, and
 * a rolled edge round the opening. Returns where things on it go, from a direction out of its middle.
 */
function hoodShell(b: Builder, C: THREE.Vector3, R: THREE.Vector3, hole: number, down: number, outer: string, lining: string, edge: string, edgeTube = 0.06) {
  const tip = new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.PI / 2 + down, 0, 0));
  const shape = (v: THREE.Vector3) => {
    const d = v.clone().normalize();
    const p = d.clone().multiply(R).multiplyScalar(v.length());
    // Drawn in close under the chin, so on animals that are nearly all head it doesn't swallow the body.
    const floor = -0.3;
    if (p.y + C.y < floor) p.y = floor - C.y + (p.y + C.y - floor) * 0.3;
    return v.copy(p.add(C));
  };
  for (const [r, color, flip] of [
    [1, outer, false],
    [0.94, lining, true],
  ] as [number, string, boolean][]) {
    const g = new THREE.SphereGeometry(r, 26, 14, 0, Math.PI * 2, hole, Math.PI - hole).applyQuaternion(tip);
    b.add(warp(flip ? inward(g) : g, shape), color);
    g.dispose();
  }
  const rim = new THREE.TorusGeometry(Math.sin(hole) * 0.97, edgeTube, 7, 40).rotateX(Math.PI / 2).translate(0, Math.cos(hole) * 0.97, 0).applyQuaternion(tip);
  if (edgeTube > 0.08) jitter(rim, 0.05, 7);
  b.add(warp(rim, shape), edge);
  rim.dispose();
  const open: [number, number, number, number] = [0, Math.cos(Math.PI / 2 + down), Math.sin(Math.PI / 2 + down), Math.cos(hole) + 0.04];
  return { open, at: (dir: Vec3, out = 1) => shape(new THREE.Vector3(...dir).normalize().multiplyScalar(out)) };
}

export function hero(): BuiltHat {
  const b = new Builder();
  const green = '#3f9a3a';
  // A hero's long green cap: a snug crown and a long soft point flopping over behind, a darker seam round the edge.
  const C: Vec3 = [0, -0.13, -0.01];
  const R: Vec3 = [0.27, 0.21, 0.285];
  shellBand(b, C, R, 0, Math.PI / 2, green);
  b.add(torus(0.07, 5, 32), '#2f7a2c', { pos: [0, C[1] + 0.01, C[2]], rot: [Math.PI / 2, 0, 0], scale: [R[0] + 0.004, R[2] + 0.004, 0.2] });
  const { geo } = bentTube([0, -0.05, -0.08], 0.2, 0.52, 12, 3.3, [-1, 0, 0], [0, 1, -0.8]);
  b.add(geo, green);
  geo.dispose();
  return finish(b, { top: 0.2, sit: { kind: 'snug', rim: [-0.13, 0.27, 0.285] } });
}

export function plumber(): BuiltHat {
  const b = new Builder();
  const red = '#d8282c';
  // A plumber's red cap: a rounded crown with a button, a short peak, and a white roundel on the front with a red star.
  const C: Vec3 = [0, -0.12, -0.01];
  const R: Vec3 = [0.268, 0.215, 0.28];
  shellBand(b, C, R, 0, Math.PI / 2, red);
  b.add(torus(0.04, 4, 32), '#b82024', { pos: [C[0], C[1] + 0.012, C[2]], rot: [Math.PI / 2, 0, 0], scale: [R[0], R[2], 0.25] });
  b.add(cyl(14), red, { pos: [C[0], C[1] + R[1] + 0.004, C[2]], scale: [0.03, 0.02, 0.03] });
  const peak = warp(new THREE.CylinderGeometry(1, 1, 1, 22, 1, false, -Math.PI / 2, Math.PI), (v) => v.set(v.x * 0.225, v.y * 0.018 - 0.05 * v.x * v.x, v.z * 0.3));
  b.add(peak, '#c42226', { pos: [0, C[1] + 0.012, 0.11], rot: [0.12, 0, 0] });
  peak.dispose();
  const { p, n } = onShell(R[0], R[1], R[2], 0, 0.5, C[1]);
  p.z += C[2];
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), n);
  const disc = new THREE.CylinderGeometry(1, 1, 1, 24).rotateX(Math.PI / 2);
  b.add(disc, '#fbf8f2', new THREE.Matrix4().compose(p.clone().addScaledVector(n, 0.003), q, new THREE.Vector3(0.075, 0.075, 0.01)));
  disc.dispose();
  const star = starGeo(0.055, 0.42);
  b.add(star, red, new THREE.Matrix4().compose(p.clone().addScaledVector(n, 0.01), q, new THREE.Vector3(1, 1, 0.3)));
  star.dispose();
  return finish(b, { top: 0.1, sit: { kind: 'snug', rim: [-0.12, 0.268, 0.28] } });
}

export function captain(): BuiltHat {
  const b = new Builder();
  const red = '#b8282c';
  const leather = '#5a3a24';
  // A rogue captain's battered tricorn over a red spotted bandana, the bandana's knot hanging behind, and a string of
  // beads swinging from the brim.
  const C: Vec3 = [0, -0.13, -0.01];
  const R: Vec3 = [0.272, 0.21, 0.287];
  shellBand(b, C, R, 0, Math.PI / 2, red);
  for (let i = 0; i < 16; i++) {
    const a = i * 2.39996;
    const { p, n } = onShell(R[0] + 0.002, R[1] + 0.002, R[2] + 0.002, a, 0.04 + ((i * 0.41) % 1) * 0.2, C[1]);
    p.z += C[2];
    b.add(sph(6, 4), '#f4eadc', new THREE.Matrix4().compose(p, new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), n), new THREE.Vector3(0.016, 0.016, 0.004)));
  }
  b.add(sph(10, 6), '#a02024', { pos: [0, C[1] + 0.03, -0.29], scale: [0.04, 0.035, 0.03] });
  for (const x of [-1, 1]) b.add(box(), red, { pos: [x * 0.03, C[1] - 0.04, -0.305], rot: [0.25, 0, x * 0.3], scale: [0.04, 0.12, 0.008] });
  // The tricorn: a low crown and a brim turned up into three points, one at the front, the edges a little ragged.
  b.add(dome(24, 8), leather, { pos: [0, -0.065, -0.01], scale: [0.262, 0.2, 0.276] });
  b.add(cyl(24), '#3e2818', { pos: [0, -0.05, -0.01], scale: [0.264, 0.03, 0.278] });
  const brim = warp(brimGeo(0.24, 0.4, 0.02, 60, (_x, _z, t) => t * t * 0.12), (v) => {
    const a = Math.atan2(v.x, v.z);
    const k = 1 - 0.34 * (1 - Math.cos(3 * a)) * 0.5 * Math.min(1, Math.max(0, (Math.hypot(v.x, v.z) - 0.24) / 0.16));
    return v.set(v.x * k, v.y, v.z * k);
  });
  b.add(jitter(brim, 0.008, 3), '#4e321e', { pos: [0, -0.065, -0.01] });
  brim.dispose();
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2;
    b.add(sph(8, 6), '#e8c26a', { pos: [Math.sin(a) * 0.405, 0.06, -0.01 + Math.cos(a) * 0.405], scale: 0.016 });
  }
  // The beads, on a cord from the left of the brim.
  b.add(cyl(5), '#3a2a1e', { pos: [0.29, -0.12, 0.1], rot: [0, 0, 0.1], scale: [0.004, 0.13, 0.004] });
  ['#c84a2a', '#e8d8a8', '#3a7ab8', '#e8c26a'].forEach((c, i) => b.add(sph(8, 6), c, { pos: [0.295 - i * 0.003, -0.08 - i * 0.03, 0.1], scale: [0.016, 0.014, 0.016] }));
  return finish(b, { top: 0.14, sit: { kind: 'snug', rim: [-0.13, 0.272, 0.287] } });
}

export function ogre(): BuiltHat {
  const b = new Builder();
  const green = '#8ab83a';
  // An ogre's bald green head, worn over yours, and his ears: two green trumpets standing out from the sides, dark
  // inside.
  const C: Vec3 = [0, -0.14, -0.01];
  const R: Vec3 = [0.275, 0.215, 0.29];
  shellBand(b, C, R, 0, Math.PI / 2, green);
  for (const side of [-1, 1]) {
    const base = new THREE.Vector3(side * 0.24, -0.08, 0.03);
    const dir = new THREE.Vector3(side * 0.9, 0.42, 0.1).normalize();
    b.add(sph(10, 7), green, { pos: base.toArray(), scale: [0.05, 0.06, 0.06] });
    b.add(cyl(16, 1, 0.38), green, along(base.clone().addScaledVector(dir, 0.1), dir, [0.085, 0.2, 0.085]));
    b.add(torus(0.16, 6, 18), '#7aa82e', along(base.clone().addScaledVector(dir, 0.2), dir, [0.083, 0.083, 0.083]).multiply(new THREE.Matrix4().makeRotationX(Math.PI / 2)));
    b.add(cyl(16), '#3a4a1a', along(base.clone().addScaledVector(dir, 0.196), dir, [0.072, 0.004, 0.072]));
  }
  return finish(b, { top: 0.12, sit: { kind: 'snug', rim: [-0.14, 0.275, 0.29] } });
}

export function buns(): BuiltHat {
  const b = new Builder();
  const hair = '#5a3a22';
  const dark = '#462c18';
  // A rebel princess's hair: a smooth cap parted down the middle, and a great coiled bun over each ear.
  const C: Vec3 = [0, -0.15, -0.01];
  const R: Vec3 = [0.28, 0.22, 0.295];
  shellBand(b, C, R, 0, Math.PI / 2, hair);
  b.add(box(), dark, { pos: [0, C[1] + R[1] + 0.002, 0.08], rot: [0.5, 0, 0], scale: [0.008, 0.004, 0.18] });
  for (const side of [-1, 1]) {
    const at = new THREE.Vector3(side * 0.3, -0.15, -0.02);
    const out = new THREE.Vector3(side, 0, 0);
    b.add(sph(18, 12), hair, { pos: at.toArray(), scale: [0.075, 0.145, 0.145] });
    // The coil: rings getting smaller towards the middle of the bun's face.
    for (let i = 0; i < 4; i++) {
      const r = 0.128 - i * 0.03;
      b.add(torus(0.13, 6, 28), i % 2 ? hair : dark, along(at.clone().addScaledVector(out, 0.04 + i * 0.008), out, [r, r, r]).multiply(new THREE.Matrix4().makeRotationX(Math.PI / 2)));
    }
  }
  return finish(b, { top: 0.08, sit: { kind: 'snug', rim: [-0.15, 0.28, 0.295] } });
}

export function duo(): BuiltHat {
  const b = new Builder();
  // A robot DJ's chrome helmet right over the head, a black visor across the face with a strip of lights running
  // along it, and a black puck over each ear.
  const C = new THREE.Vector3(0, -0.2, 0.005);
  const R: Vec3 = [0.305, 0.3, 0.32];
  const shell = new THREE.SphereGeometry(1, 32, 18, 0, Math.PI * 2, 0, 2.3);
  b.add(shell, '#c4cad4', { pos: C.toArray(), scale: R });
  shell.dispose();
  const visor = new THREE.SphereGeometry(1.02, 30, 8, Math.PI / 2 - 1.0, 2.0, 1.2, 0.62);
  b.add(visor, '#16161c', { pos: C.toArray(), scale: R });
  visor.dispose();
  b.add(torus(0.08, 6, 36), '#8a8e98', { pos: [0, C.y + Math.cos(2.3) * R[1], C.z], rot: [Math.PI / 2, 0, 0], scale: [Math.sin(2.3) * R[0], Math.sin(2.3) * R[2], 0.2] });
  for (const x of [-1, 1]) b.add(cyl(20), '#22222a', { pos: [x * (R[0] + 0.005), C.y, C.z - 0.02], rot: [0, 0, Math.PI / 2], scale: [0.08, 0.02, 0.08] });
  const built = finish(b, { top: 0.1, sit: { kind: 'hood', rim: [-0.2, 0.305, 0.32], clear: true } }, wet());
  // The lights: a row of little bars in the visor, a red glow sweeping to and fro along them.
  const lit = new THREE.MeshBasicMaterial({ color: '#ff3a3a' });
  const dim = new THREE.MeshBasicMaterial({ color: '#4a1218' });
  built.materials.push(lit, dim);
  const bar = new THREE.BoxGeometry(0.03, 0.022, 0.008);
  const bars = Array.from({ length: 9 }, (_, i) => {
    const a = (i - 4) * 0.17;
    const p = new THREE.Vector3(Math.sin(a) * R[0] * 1.03, Math.cos(1.52) * R[1], Math.cos(a) * R[2] * 1.03).add(C);
    const m = new THREE.Mesh(bar, dim);
    m.position.copy(p);
    m.rotation.y = a;
    m.castShadow = false;
    built.group.add(m);
    return m;
  });
  built.update = (t) => {
    const at = 4 + Math.sin(t * 2.4) * 4.4;
    bars.forEach((m, i) => (m.material = Math.abs(i - at) < 1.2 ? lit : dim));
  };
  return built;
}

export function parka(): BuiltHat {
  const b = new Builder();
  // An orange parka hood pulled tight round the face, a thick brown fur trim and the drawstrings hanging down.
  const C = new THREE.Vector3(0, -0.2, -0.015);
  const R = new THREE.Vector3(0.315, 0.285, 0.31);
  const hood = hoodShell(b, C, R, 1.1, 0.15, '#f08a24', '#c86418', '#7a5a3a', 0.16);
  // A seam up the middle, from the trim back over the top.
  const seam = new THREE.TorusGeometry(1, 0.025, 4, 20, Math.PI * 0.62).rotateY(Math.PI / 2).rotateX(-0.2);
  b.add(seam, '#d8761a', { pos: C.toArray(), scale: [1, R.y + 0.004, R.z + 0.004] });
  seam.dispose();
  for (const x of [-1, 1]) {
    const top = hood.at([x * 0.35, -0.75, 0.6], 1.02);
    b.add(cyl(5), '#e8e2d4', { pos: [top.x, top.y - 0.05, top.z + 0.01], scale: [0.006, 0.1, 0.006] });
    b.add(sph(8, 6), '#e8e2d4', { pos: [top.x, top.y - 0.105, top.z + 0.01], scale: [0.014, 0.018, 0.014] });
  }
  return finish(b, { top: 0.1, sit: { kind: 'hood', rim: [-0.2, 0.315, 0.31], open: hood.open, clear: true } });
}

export function cheese(): BuiltHat {
  const b = new Builder();
  // A great wedge of holey yellow cheese worn on the head, its point to the front.
  const tri = new THREE.Shape([new THREE.Vector2(-0.19, 0), new THREE.Vector2(0.23, 0), new THREE.Vector2(-0.19, 0.19)]);
  const wedge = new THREE.ExtrudeGeometry(tri, { depth: 0.34, bevelEnabled: true, bevelSize: 0.008, bevelThickness: 0.008, bevelSegments: 1 }).rotateY(-Math.PI / 2).translate(0.17, -0.025, 0);
  b.add(wedge, '#f6c83a');
  wedge.dispose();
  const hole = '#d8a020';
  const r = rng(11);
  // Holes on both sides, the sloping top and the back.
  for (const x of [-1, 1]) for (let i = 0; i < 4; i++) {
    const z = -0.15 + r() * 0.24;
    const y = -0.01 + r() * Math.max(0.02, (0.23 - z) * 0.42);
    b.add(sph(10, 6), hole, { pos: [x * 0.179, y, z], scale: [0.006, 0.012 + r() * 0.014, 0.012 + r() * 0.014] });
  }
  const slope = Math.atan2(0.19, 0.42);
  for (let i = 0; i < 5; i++) {
    const t = 0.15 + r() * 0.7;
    b.add(sph(10, 6), hole, { pos: [-0.12 + r() * 0.24, -0.025 + 0.19 * (1 - t) + 0.008, -0.19 + 0.42 * t], rot: [-slope, 0, 0], scale: [0.018 + r() * 0.012, 0.005, 0.015 + r() * 0.01] });
  }
  for (let i = 0; i < 3; i++) b.add(sph(10, 6), hole, { pos: [-0.1 + i * 0.1, 0.03 + (i % 2) * 0.07, -0.2], scale: [0.016, 0.014, 0.006] });
  return finish(b, { top: 0.17, sit: { kind: 'brim', rim: [-0.02, 0.17] } });
}

export function thinking(): BuiltHat {
  const b = new Builder();
  // A thinking cap: a snug navy skullcap with a gold band and cogs round it, and a light bulb on a spring that wobbles
  // and every so often lights up with a bright idea.
  const C: Vec3 = [0, -0.13, -0.01];
  const R: Vec3 = [0.268, 0.2, 0.28];
  shellBand(b, C, R, 0, Math.PI / 2, '#2a3a6a');
  b.add(cyl(32), '#e2b23a', { pos: [0, C[1] + 0.02, C[2]], scale: [R[0] + 0.006, 0.04, R[2] + 0.006] });
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + 0.3;
    const at = new THREE.Vector3(Math.sin(a) * (R[0] + 0.008), C[1] + 0.02, C[2] + Math.cos(a) * (R[2] + 0.008));
    const cog = new THREE.Matrix4().compose(at, new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.PI / 2, 0, -a, 'YXZ')).premultiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), a)), new THREE.Vector3(1, 1, 1));
    b.add(cyl(10), '#c8962a', { scale: [0.03, 0.012, 0.03] }, cog);
    for (let k = 0; k < 8; k++) b.add(box(), '#c8962a', { pos: [Math.sin((k / 8) * Math.PI * 2) * 0.032, 0, Math.cos((k / 8) * Math.PI * 2) * 0.032], rot: [0, (k / 8) * Math.PI * 2, 0], scale: [0.01, 0.012, 0.012] }, cog);
  }
  b.add(cyl(14), '#2a3a6a', { pos: [0, 0.075, -0.01], scale: [0.03, 0.02, 0.03] });
  const built = finish(b, { top: 0.38, sit: { kind: 'snug', rim: [-0.13, 0.268, 0.28] } });
  // The spring and the bulb's screw base, which wobble together from the top of the cap.
  const holder = new THREE.Group();
  holder.position.set(0, 0.08, -0.01);
  built.group.add(holder);
  const s = new Builder();
  const coil: THREE.Vector3[] = [];
  for (let i = 0; i <= 80; i++) coil.push(new THREE.Vector3(Math.sin(i * 0.47) * 0.018, i * 0.0015, Math.cos(i * 0.47) * 0.018));
  const spring = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(coil), 120, 0.004, 4, false);
  s.add(spring, '#b8bcc4');
  spring.dispose();
  s.add(cyl(14), '#9aa0aa', { pos: [0, 0.135, 0], scale: [0.032, 0.035, 0.032] });
  for (let i = 0; i < 3; i++) s.add(torus(0.18, 4, 16), '#c8ccd4', { pos: [0, 0.125 + i * 0.01, 0], rot: [Math.PI / 2, 0, 0], scale: [0.033, 0.033, 0.02] });
  holder.add(moving(built, s));
  const bulbMat = new THREE.MeshStandardMaterial({ color: '#fff8d8', emissive: '#ffd84a', emissiveIntensity: 0.1, transparent: true, opacity: 0.85, roughness: 0.2 });
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.07, 18, 14), bulbMat);
  bulb.scale.set(1, 1.15, 1);
  bulb.position.y = 0.215;
  bulb.castShadow = false;
  holder.add(bulb);
  built.materials.push(bulbMat);
  built.update = (t) => {
    holder.rotation.z = Math.sin(t * 2.3) * 0.12;
    holder.rotation.x = Math.sin(t * 1.7 + 1) * 0.08;
    // An idea every five seconds or so: a flicker, then on bright for a moment.
    const k = t % 5.2;
    const on = k > 3.6 ? (k < 3.8 ? (Math.floor(k * 40) % 2 ? 1 : 0.2) : 1) : 0.08;
    bulbMat.emissiveIntensity = on * 2.2;
    bulb.scale.setScalar(on > 0.5 ? 1.08 : 1).y *= 1.15;
  };
  return built;
}

export function blocky(): BuiltHat {
  const b = new Builder();
  // A blocky carved pumpkin: a cube in two oranges, ridged with darker stripes, a stubby square stalk, and a square
  // carved face on the front.
  const S = 0.36;
  const y = S / 2 - 0.02;
  b.add(box(), '#e8821e', { pos: [0, y, 0], scale: S });
  for (const [ax, sign] of [
    [0, 1],
    [0, -1],
    [2, 1],
    [2, -1],
  ] as [number, number][]) {
    for (let i = 0; i < 4; i++) {
      const u = -S / 2 + S * (0.125 + i * 0.25);
      const pos: Vec3 = ax === 0 ? [sign * (S / 2 + 0.002), y, u] : [u, y, sign * (S / 2 + 0.002)];
      const scale: Vec3 = ax === 0 ? [0.004, S, 0.03] : [0.03, S, 0.004];
      if (!(ax === 2 && sign === 1)) b.add(box(), '#c86a14', { pos, scale });
    }
  }
  b.add(box(), '#f29a34', { pos: [0, S - 0.02 + 0.002, 0], scale: [S * 0.7, 0.004, S * 0.7] });
  b.add(box(), '#5a7a2a', { pos: [0, S - 0.02 + 0.025, 0], scale: [0.05, 0.05, 0.05] });
  // The face: square eyes, a square nose and a wide jagged mouth, cut dark.
  const F = S / 2 + 0.003;
  const cut = '#2a1606';
  for (const x of [-1, 1]) b.add(box(), cut, { pos: [x * 0.09, y + 0.07, F], scale: [0.07, 0.055, 0.004] });
  b.add(box(), cut, { pos: [0, y + 0.015, F], scale: [0.04, 0.03, 0.004] });
  b.add(box(), cut, { pos: [0, y - 0.07, F], scale: [0.22, 0.045, 0.004] });
  for (const x of [-0.08, 0, 0.08]) b.add(box(), cut, { pos: [x, y - 0.035, F], scale: [0.04, 0.03, 0.004] });
  for (const x of [-0.11, 0.11]) b.add(box(), cut, { pos: [x, y - 0.035, F], scale: [0.03, 0.035, 0.004] });
  return finish(b, { top: S + 0.03, sit: { kind: 'brim', rim: [-0.015, 0.18] } });
}

export function ratchef(): BuiltHat {
  const b = new Builder();
  const grey = '#8a8a96';
  // A little rat in charge of the cooking, hidden under a chef's toque: its body under the hat, its tail hanging out
  // behind, its paws gripping the band, and its head peeking out at the front, looking about.
  b.add(sph(14, 10), grey, { pos: [0, 0.035, -0.01], scale: [0.1, 0.055, 0.12] });
  const tail = new THREE.TubeGeometry(
    new THREE.CatmullRomCurve3([
      [0, 0.03, -0.11],
      [0.02, 0.0, -0.17],
      [0.05, -0.07, -0.22],
      [0.04, -0.14, -0.25],
      [0.0, -0.17, -0.24],
    ].map(([x, y, z]) => new THREE.Vector3(x, y, z))),
    20,
    0.008,
    5,
    false,
  );
  b.add(tail, '#e0a0a8');
  tail.dispose();
  b.add(cyl(26), '#f6f4ee', { pos: [0, 0.115, 0], scale: [0.13, 0.11, 0.13] });
  b.add(cyl(26), '#e2ded4', { pos: [0, 0.064, 0], scale: [0.133, 0.012, 0.133] });
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2;
    b.add(cyl(4), '#e6e2d8', { pos: [Math.sin(a) * 0.131, 0.12, Math.cos(a) * 0.131], scale: [0.004, 0.1, 0.004] });
  }
  b.add(sph(18, 12), '#fbfaf6', { pos: [0, 0.27, 0], scale: [0.16, 0.1, 0.16] });
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2;
    b.add(sph(12, 8), '#f6f4ee', { pos: [Math.sin(a) * 0.1, 0.235, Math.cos(a) * 0.1], scale: [0.075, 0.07, 0.075] });
  }
  for (const x of [-1, 1]) b.add(sph(8, 6), '#e8a8b0', { pos: [x * 0.04, 0.07, 0.13], scale: [0.016, 0.012, 0.014] });
  // Made at a rat's size, then scaled up to a hat's.
  const K = 1.45;
  const built = finish(b, { top: 0.37 * K, sit: { kind: 'brim', rim: [-0.01 * K, 0.12 * K] } });
  built.group.children[0].scale.setScalar(K);
  // The head, turning on its neck.
  const h = new Builder();
  h.add(sph(14, 10), grey, { pos: [0, 0, 0.03], scale: [0.05, 0.045, 0.055] });
  h.add(cone(12), grey, { pos: [0, -0.008, 0.085], rot: [Math.PI / 2, 0, 0], scale: [0.032, 0.06, 0.028] });
  h.add(sph(8, 6), '#e87890', { pos: [0, -0.008, 0.115], scale: 0.011 });
  for (const x of [-1, 1]) {
    h.add(sph(8, 6), '#121218', { pos: [x * 0.026, 0.014, 0.068], scale: 0.009 });
    h.add(sph(12, 8), grey, { pos: [x * 0.04, 0.038, 0.01], rot: [0, 0, -x * 0.4], scale: [0.03, 0.03, 0.008] });
    h.add(sph(12, 8), '#e8a8b0', { pos: [x * 0.04, 0.037, 0.016], rot: [0, 0, -x * 0.4], scale: [0.021, 0.021, 0.004] });
    for (const dy of [-0.004, 0.004]) h.add(cyl(4), '#d8d8e0', { pos: [x * 0.035, -0.01 + dy, 0.098], rot: [0, 0, x * (Math.PI / 2 - dy * 20)], scale: [0.0016, 0.06, 0.0016] });
  }
  const head = moving(built, h);
  head.scale.setScalar(K);
  head.position.set(0, 0.05 * K, 0.08 * K);
  built.update = (t) => {
    head.rotation.y = Math.sin(t * 0.7) * 0.45 + Math.sin(t * 2.9) * 0.05;
    head.rotation.x = Math.sin(t * 1.3) * 0.08 - 0.05;
    head.position.z = (0.08 + Math.max(0, Math.sin(t * 0.45)) * 0.015) * K;
  };
  return built;
}

export function talking(): BuiltHat {
  const b = new Builder();
  const browns = ['#6e5032', '#74563a'];
  // An old talking wizard's hat, patched and crumpled: a wide floppy brim, a tall crown folded over at the tip, and a
  // face in its creases that blinks and mutters.
  const brim = brimGeo(0.15, 0.31, 0.025, 44, (x, z, t) => -t * t * 0.06 + 0.02 * Math.sin(5 * Math.atan2(x, z)) * t);
  b.add(brim, '#6a4c30');
  brim.dispose();
  const crown = bentTube([0, 0, 0], 0.18, 0.62, 12, 2.1, [-1, 0, 0], [0, 1, 0.08]);
  b.add(jitter(crown.geo, 0.012, 4), browns[1]);
  crown.geo.dispose();
  b.add(torus(0.1, 5, 26), '#5a3e26', { pos: [0, 0.02, 0], rot: [Math.PI / 2, 0, 0], scale: [0.165, 0.165, 0.2] });
  // Patches, and the brows and nose of the face.
  b.add(box(), '#9a7a50', { pos: [-0.1, 0.12, -0.06], rot: [0.2, -1.0, 0.25], scale: [0.06, 0.05, 0.006] });
  b.add(box(), '#5a4a3a', { pos: [0.09, 0.2, -0.04], rot: [0.3, 1.1, -0.2], scale: [0.045, 0.04, 0.006] });
  for (const x of [-1, 1]) b.add(sph(10, 6), '#4e3420', { pos: [x * 0.05, 0.17, 0.13], rot: [-0.33, 0, x * -0.35], scale: [0.055, 0.016, 0.024] });
  b.add(sph(10, 8), '#5e4228', { pos: [0, 0.11, 0.16], rot: [-0.33, 0, 0], scale: [0.03, 0.045, 0.028] });
  const built = finish(b, { top: 0.5, sit: { kind: 'brim', rim: [-0.03, 0.165] } });
  const e = new Builder();
  for (const x of [-1, 1]) e.add(sph(10, 6), '#1e140c', { pos: [x * 0.05, 0, 0], rot: [0, 0, x * 0.25], scale: [0.04, 0.016, 0.014] });
  const eyes = moving(built, e);
  eyes.position.set(0, 0.14, 0.148);
  eyes.rotation.x = -0.33;
  const m = new Builder();
  m.add(sph(12, 6), '#1e140c', { scale: [0.075, 0.016, 0.016] });
  const mouth = moving(built, m);
  mouth.position.set(0, 0.06, 0.168);
  mouth.rotation.x = -0.33;
  built.update = (t) => {
    // A slow blink now and then, and muttering in bursts.
    eyes.scale.y = t % 3.7 < 0.15 ? 0.15 : 1;
    const talk = Math.sin(t * 0.8) > 0.2 ? Math.abs(Math.sin(t * 11) * Math.sin(t * 4.3)) : 0;
    mouth.scale.y = 1 + talk * 2.2;
    mouth.scale.x = 1 - talk * 0.2;
  };
  return built;
}

export function fries(): BuiltHat {
  const b = new Builder();
  const red = '#d8282c';
  // A crown of chips: a red carton cut into crown points along the top, gold studs on the points, and golden chips
  // standing up out of it every which way.
  b.add(new THREE.CylinderGeometry(0.16, 0.135, 1, 28, 1, true), red, { pos: [0, 0.06, 0], scale: [1, 0.14, 1] });
  b.add(cyl(28), '#b82024', { pos: [0, -0.008, 0], scale: [0.137, 0.006, 0.137] });
  b.add(cyl(26), '#f6d070', { pos: [0, 0.1, 0], scale: [0.15, 0.01, 0.15] });
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2;
    b.add(cone(4), red, { pos: [Math.sin(a) * 0.158, 0.16, Math.cos(a) * 0.158], rot: [0, a + Math.PI / 4, 0], scale: [0.05, 0.06, 0.012] });
    b.add(sph(8, 6), '#ffd23a', { pos: [Math.sin(a) * 0.165, 0.11, Math.cos(a) * 0.165], scale: 0.014 });
  }
  const r = rng(5);
  for (let i = 0; i < 26; i++) {
    const a = r() * Math.PI * 2;
    const d = Math.sqrt(r()) * 0.12;
    const h = 0.14 + r() * 0.14;
    const lean = new THREE.Euler((r() - 0.5) * 0.5 + Math.cos(a) * d * 2.5, r() * Math.PI, (r() - 0.5) * 0.5 - Math.sin(a) * d * 2.5);
    b.add(box(), i % 5 ? '#f2c040' : '#e0a830', new THREE.Matrix4().compose(new THREE.Vector3(Math.sin(a) * d, 0.08 + h / 2, Math.cos(a) * d), new THREE.Quaternion().setFromEuler(lean), new THREE.Vector3(0.024, h, 0.024)));
  }
  const K = 1.25;
  const built = finish(b, { top: 0.3 * K, sit: { kind: 'brim', rim: [-0.01 * K, 0.137 * K] } });
  built.group.children[0].scale.setScalar(K);
  return built;
}

export function loo(): BuiltHat {
  const b = new Builder();
  // A toilet roll stood on end, its cardboard tube showing, and a length of paper trailing down the back.
  b.add(cyl(28), '#f8f6f0', { pos: [0, 0.055, 0], scale: [0.1, 0.13, 0.1] });
  for (const y of [0.0, 0.04, 0.08]) b.add(torus(0.04, 3, 28), '#e8e4da', { pos: [0, y, 0], rot: [Math.PI / 2, 0, 0], scale: [0.1, 0.1, 0.12] });
  b.add(cyl(18), '#b88a5a', { pos: [0, 0.056, 0], scale: [0.036, 0.132, 0.036] });
  b.add(cyl(18), '#3a2a1e', { pos: [0, 0.06, 0], scale: [0.03, 0.13, 0.03] });
  const K = 1.3;
  const built = finish(b, { top: 0.13 * K, sit: { kind: 'brim', rim: [-0.005 * K, 0.1 * K] } });
  built.group.children[0].scale.setScalar(K);
  // The loose end: sheets curving over the back edge and hanging down, swaying.
  const curve = new THREE.CatmullRomCurve3([
    [0, 0.0, 0],
    [0, -0.01, -0.03],
    [0, -0.08, -0.06],
    [0.01, -0.18, -0.1],
    [0.02, -0.3, -0.13],
  ].map(([x, y, z]) => new THREE.Vector3(x, y, z)));
  const s = new Builder();
  const n = 16;
  for (let i = 0; i < n; i++) {
    const p = curve.getPoint((i + 0.5) / n);
    const d = curve.getTangent((i + 0.5) / n);
    s.add(box(), '#f8f6f0', new THREE.Matrix4().compose(p, new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d), new THREE.Vector3(0.085, curve.getLength() / n + 0.003, 0.004)));
    if (i % 4 === 3) s.add(box(), '#dcd8ce', new THREE.Matrix4().compose(p, new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d), new THREE.Vector3(0.086, 0.003, 0.005)));
  }
  const sheet = moving(built, s);
  sheet.scale.setScalar(K);
  sheet.position.set(0, 0.11 * K, -0.1 * K);
  built.update = (t) => {
    sheet.rotation.z = Math.sin(t * 1.4) * 0.12;
    sheet.rotation.x = Math.sin(t * 1.1 + 1) * 0.06;
  };
  return built;
}

export function goose(): BuiltHat {
  const b = new Builder();
  const white = '#f6f4ee';
  const orange = '#f08a24';
  // A goose, sat on your head as if it owns it: a plump white body, grey-tipped wings, its tail cocked, orange feet
  // tucked in, and its long neck swaying about until it lunges forward and honks.
  b.add(sph(18, 12), white, { pos: [0, 0.06, -0.03], scale: [0.11, 0.08, 0.15] });
  for (const x of [-1, 1]) {
    b.add(sph(14, 8), '#e6e4de', { pos: [x * 0.085, 0.075, -0.05], rot: [0.15, 0, x * 0.25], scale: [0.04, 0.06, 0.13] });
    b.add(sph(10, 6), '#a8acb4', { pos: [x * 0.09, 0.09, -0.15], rot: [0.4, 0, x * 0.25], scale: [0.03, 0.035, 0.05] });
    b.add(sph(10, 6), orange, { pos: [x * 0.05, 0.0, 0.08], scale: [0.03, 0.01, 0.04] });
  }
  b.add(cone(10), white, { pos: [0, 0.11, -0.18], rot: [-1.0, 0, 0], scale: [0.05, 0.08, 0.035] });
  const K = 1.45;
  const built = finish(b, { top: 0.32 * K, sit: { kind: 'brim', rim: [-0.01 * K, 0.12 * K] } });
  built.group.children[0].scale.setScalar(K);
  const n = new Builder();
  const neck = new THREE.TubeGeometry(
    new THREE.CatmullRomCurve3([
      [0, 0, 0],
      [0, 0.06, 0.025],
      [0, 0.13, 0.0],
      [0, 0.19, 0.02],
    ].map(([x, y, z]) => new THREE.Vector3(x, y, z))),
    14,
    0.026,
    10,
    false,
  );
  n.add(neck, white);
  neck.dispose();
  n.add(sph(14, 10), white, { pos: [0, 0.205, 0.035], scale: [0.036, 0.036, 0.048] });
  n.add(cone(10), orange, { pos: [0, 0.198, 0.1], rot: [Math.PI / 2, 0, 0], scale: [0.02, 0.05, 0.014] });
  n.add(sph(8, 6), '#d0601a', { pos: [0, 0.2, 0.12], scale: [0.008, 0.007, 0.008] });
  for (const x of [-1, 1]) n.add(sph(8, 6), '#121218', { pos: [x * 0.03, 0.214, 0.052], scale: 0.008 });
  const head = moving(built, n);
  head.scale.setScalar(K);
  head.position.set(0, 0.09 * K, 0.08 * K);
  built.update = (t) => {
    // A honk every six seconds: neck stretched forward and the head shaking; otherwise looking about.
    const k = t % 6;
    const honk = k > 5 ? Math.sin(((k - 5) / 1) * Math.PI) : 0;
    head.rotation.x = Math.sin(t * 1.1) * 0.12 + honk * 0.7;
    head.rotation.y = Math.sin(t * 0.6) * 0.5 * (1 - honk) + honk * Math.sin(t * 30) * 0.08;
  };
  return built;
}

export function fruit(): BuiltHat {
  const b = new Builder();
  // A samba dancer's fruit turban: a pink turban wrapped with an orange sash, and piled on top a pineapple, bananas,
  // grapes hanging over the side, an orange and a pair of cherries.
  const C: Vec3 = [0, -0.13, -0.01];
  const R: Vec3 = [0.28, 0.2, 0.29];
  shellBand(b, C, R, 0, Math.PI / 2, '#d83a8a');
  for (const [tilt, y, c] of [
    [0.2, -0.1, '#f4a020'],
    [-0.16, -0.07, '#f6c030'],
  ] as [number, number, string][]) {
    b.add(torus(0.12, 6, 36), c, { pos: [0, y, -0.01], rot: [Math.PI / 2 + tilt, 0, 0], scale: [0.262, 0.27, 0.2] });
  }
  // Everything above sits on the top of the turban.
  const up = new THREE.Matrix4().makeTranslation(0, 0.06, 0);
  // The pineapple, at the back, with a crown of leaves.
  b.add(sph(16, 12), '#d8a030', { pos: [0, 0.14, -0.06], scale: [0.07, 0.1, 0.07] }, up);
  for (let i = 0; i < 18; i++) {
    const a = i * 2.39996;
    const e = -0.8 + ((i * 0.37) % 1) * 1.6;
    b.add(sph(6, 4), '#a8701a', { pos: [Math.sin(a) * Math.cos(e) * 0.071, 0.14 + Math.sin(e) * 0.1, -0.06 + Math.cos(a) * Math.cos(e) * 0.071], scale: 0.009 }, up);
  }
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2;
    b.add(cone(6), i % 2 ? '#3a8a2a' : '#4ea03a', along(new THREE.Vector3(Math.sin(a) * 0.015, 0.25, -0.06 + Math.cos(a) * 0.015), new THREE.Vector3(Math.sin(a) * 0.5, 1, Math.cos(a) * 0.5), [0.018, 0.13, 0.008]).multiply(new THREE.Matrix4().makeTranslation(0, 0.5, 0)), up);
  }
  // Bananas, curving out to each side.
  for (const [x, z, lean] of [
    [-1, 0.03, 0.9],
    [1, 0.02, 0.9],
    [-1, -0.04, 0.6],
  ] as [number, number, number][]) {
    const tip = bentCone(b, (i) => (i < 5 ? '#f6d23a' : '#e8c22a'), [x * 0.04, 0.1, z], 0.028, 0.2, 6, 0.9, [0, 0, -x], [x * lean, 1, 0.1]);
    b.add(sph(6, 4), '#5a4020', { pos: tip, scale: 0.008 });
  }
  // Grapes hanging over the right, an orange at the front left, and the cherries.
  const r = rng(9);
  for (let i = 0; i < 11; i++) b.add(sph(10, 8), i % 3 ? '#7a3a9a' : '#8a4aaa', { pos: [0.19 + r() * 0.05, 0.03 - (i / 11) * 0.12 + r() * 0.02, 0.06 + r() * 0.06], scale: 0.024 }, up);
  b.add(sph(16, 12), '#f08a20', { pos: [-0.11, 0.06, 0.1], scale: 0.055 }, up);
  b.add(sph(8, 6), '#4ea03a', { pos: [-0.11, 0.115, 0.1], scale: [0.015, 0.006, 0.01] }, up);
  for (const x of [-1, 1]) {
    b.add(sph(12, 10), '#d81e2a', { pos: [0.04 + x * 0.025, 0.05, 0.16], scale: 0.022 }, up);
    b.add(cyl(4), '#4e7a2a', { pos: [0.04 + x * 0.012, 0.09, 0.15], rot: [0.2, 0, x * -0.35], scale: [0.003, 0.08, 0.003] }, up);
  }
  return finish(b, { top: 0.38, sit: { kind: 'snug', rim: [-0.13, 0.28, 0.29] } });
}

export function ghosthunter(): BuiltHat {
  const b = new Builder();
  const black = '#26262c';
  // A ghost hunter's goggle headset: a black strap round the brow, a pair of goggles on hinged arms flipped up over
  // the forehead, a little box on one side with a blinking light and a whip aerial.
  const ring = new THREE.LatheGeometry(
    [
      [0.238, -0.14],
      [0.252, -0.14],
      [0.252, -0.08],
      [0.238, -0.08],
      [0.238, -0.14],
    ].map(([r, y]) => new THREE.Vector2(r, y)),
    40,
  );
  b.add(ring, black);
  ring.dispose();
  for (const x of [-1, 1]) {
    b.add(cyl(14), '#5a5e66', { pos: [x * 0.255, -0.11, 0.0], rot: [0, 0, Math.PI / 2], scale: [0.03, 0.02, 0.03] });
    b.add(box(), '#5a5e66', new THREE.Matrix4().compose(new THREE.Vector3(x * 0.2, 0.0, 0.1), new THREE.Quaternion().setFromEuler(new THREE.Euler(-0.95, x * 0.4, 0)), new THREE.Vector3(0.012, 0.012, 0.25)));
  }
  // The goggles, tipped up to look at the sky.
  const g = new THREE.Matrix4().compose(new THREE.Vector3(0, 0.07, 0.17), new THREE.Quaternion().setFromEuler(new THREE.Euler(-1.05, 0, 0)), new THREE.Vector3(1.45, 1.45, 1.45));
  b.add(box(), '#3a3e46', { scale: [0.2, 0.03, 0.05] }, g);
  for (const x of [-1, 1]) {
    b.add(cyl(18), '#4a4e56', { pos: [x * 0.06, 0, 0.035], rot: [Math.PI / 2, 0, 0], scale: [0.04, 0.07, 0.04] }, g);
    b.add(cyl(18), '#c8302a', { pos: [x * 0.06, 0, 0.072], rot: [Math.PI / 2, 0, 0], scale: [0.032, 0.006, 0.032] }, g);
    b.add(torus(0.18, 5, 18), '#8a8e98', { pos: [x * 0.06, 0, 0.07], scale: [0.038, 0.038, 0.03] }, g);
  }
  // The box on the right, and its aerial.
  b.add(box(), '#e8c22a', { pos: [-0.27, -0.06, -0.03], scale: [0.03, 0.06, 0.07] });
  b.add(box(), black, { pos: [-0.272, -0.06, -0.03], scale: [0.032, 0.02, 0.072] });
  b.add(cyl(5), '#9aa0aa', { pos: [-0.275, 0.06, -0.06], rot: [-0.2, 0, 0.1], scale: [0.004, 0.2, 0.004] });
  b.add(sph(6, 4), '#9aa0aa', { pos: [-0.285, 0.16, -0.08], scale: 0.009 });
  const built = finish(b, { top: 0.16, sit: { kind: 'band', rim: [-0.14, 0.238] } });
  const lightMat = new THREE.MeshBasicMaterial({ color: '#ff3a2a' });
  const light = new THREE.Mesh(new THREE.SphereGeometry(0.012, 8, 6), lightMat);
  light.position.set(-0.29, -0.03, 0.0);
  light.castShadow = false;
  built.group.add(light);
  built.materials.push(lightMat);
  built.update = (t) => {
    light.visible = Math.floor(t * 2.5) % 3 !== 0;
  };
  return built;
}

export function sparky(): BuiltHat {
  const b = new Builder();
  const yellow = '#f8d030';
  // An electric mouse hood: a yellow hood with long black-tipped ears, rosy red cheeks either side of the face, and
  // two brown stripes across the back.
  const C = new THREE.Vector3(0, -0.2, -0.015);
  const R = new THREE.Vector3(0.315, 0.285, 0.31);
  const hood = hoodShell(b, C, R, 1.05, 0.15, yellow, '#e0b020', '#f0c428', 0.07);
  for (const x of [-1, 1]) {
    const base = hood.at([x * 0.45, 0.85, -0.05], 0.97);
    bentCone(b, (i) => (i < 5 ? yellow : '#1e1e22'), [base.x, base.y, base.z], 0.065, 0.44, 7, 0.35, [0, 0, x], [x * 0.5, 1, -0.05]);
    const cheek = hood.at([x * 0.72, -0.35, 0.62], 1.005);
    const n = cheek.clone().sub(C).normalize();
    b.add(new THREE.CylinderGeometry(1, 1, 1, 20), '#e83a2a', along(cheek, n, [0.05, 0.006, 0.05]));
  }
  for (const [y, w] of [
    [0.5, 0.12],
    [0.15, 0.1],
  ]) {
    const at = hood.at([0, y, -1], 1.005);
    b.add(sph(12, 6), '#7a4a1a', along(at, at.clone().sub(C).normalize(), [w, 0.006, 0.035]));
  }
  return finish(b, { top: 0.45, sit: { kind: 'hood', rim: [-0.2, 0.315, 0.31], open: hood.open } });
}

export function lavalamp(): BuiltHat {
  const b = new Builder();
  const silver = '#c0c6d0';
  // A lava lamp stood on the head: a silver base and cap, the glass between them full of purple liquid, and glowing
  // orange blobs rising and sinking in it.
  b.add(cyl(24, 0.6, 1), silver, { pos: [0, 0.035, 0], scale: [0.075, 0.08, 0.075] });
  b.add(torus(0.12, 4, 24), '#9aa0aa', { pos: [0, 0.075, 0], rot: [Math.PI / 2, 0, 0], scale: [0.046, 0.046, 0.05] });
  b.add(cyl(20, 0.5, 1), silver, { pos: [0, 0.325, 0], scale: [0.05, 0.05, 0.05] });
  const K = 1.4;
  const built = finish(b, { top: 0.36 * K, sit: { kind: 'brim', rim: [-0.005 * K, 0.075 * K] } });
  built.group.scale.setScalar(K);
  const profile = (y: number) => 0.044 + Math.sin(((y - 0.078) / 0.226) * Math.PI) * 0.018 - ((y - 0.078) / 0.226) * 0.02;
  const pts: THREE.Vector2[] = [];
  for (let i = 0; i <= 12; i++) {
    const y = 0.078 + (i / 12) * 0.226;
    pts.push(new THREE.Vector2(profile(y), y));
  }
  glass(built, new THREE.LatheGeometry(pts, 24), '#9a4ae0', 0.5);
  const blobMat = glow('#ff8a2a', 0.9);
  built.materials.push(blobMat);
  const blobGeo = new THREE.SphereGeometry(1, 12, 10);
  const blobs = [0, 1, 2, 3].map((i) => {
    const m = new THREE.Mesh(blobGeo, blobMat);
    m.castShadow = false;
    built.group.add(m);
    return { m, speed: 0.35 + i * 0.13, phase: i * 1.7, size: 0.016 + (i % 2) * 0.008 };
  });
  built.update = (t) => {
    for (const { m, speed, phase, size } of blobs) {
      const s = (Math.sin(t * speed + phase) + 1) / 2;
      const y = 0.1 + s * 0.18;
      const r = profile(y) - size - 0.004;
      m.position.set(Math.sin(t * 0.3 + phase) * r * 0.5, y, Math.cos(t * 0.4 + phase) * r * 0.5);
      // Stretched tall as they travel, squat at the ends.
      const k = Math.abs(Math.cos(t * speed + phase));
      m.scale.set(size * (1 - k * 0.2), size * (1 + k * 0.5), size * (1 - k * 0.2));
    }
  };
  return built;
}

export function fishbowl(): BuiltHat {
  const b = new Builder();
  // A round goldfish bowl balanced on the head: coloured gravel and a waving weed at the bottom, water nearly to the
  // brim, and a goldfish swimming round and round.
  const R = 0.165;
  const cy = 0.15;
  const r = rng(13);
  for (let i = 0; i < 26; i++) {
    const a = r() * Math.PI * 2;
    const d = Math.sqrt(r()) * 0.075;
    b.add(sph(6, 4), ['#e8c86a', '#c86a4a', '#6a9ad8', '#f4f0e8'][i % 4], { pos: [Math.sin(a) * d, 0.012 + r() * 0.012, Math.cos(a) * d], scale: 0.014 });
  }
  b.add(cyl(24), '#d8c8a0', { pos: [0, 0.008, 0], scale: [0.078, 0.012, 0.078] });
  for (let i = 0; i < 3; i++) bentCone(b, () => (i % 2 ? '#3a9a4a' : '#4eb05a'), [-0.04 + i * 0.012, 0.015, -0.03 + i * 0.01], 0.012, 0.13 - i * 0.02, 5, 0.8 * (i % 2 ? 1 : -1), [0, 0, 1]);
  b.add(torus(0.12, 6, 32), '#d8eef8', { pos: [0, cy + Math.cos(0.6) * R, 0], rot: [Math.PI / 2, 0, 0], scale: [Math.sin(0.6) * R, Math.sin(0.6) * R, 0.15] });
  b.add(cyl(24), '#cfe6f2', { pos: [0, 0.0, 0], scale: [0.072, 0.008, 0.072] });
  const built = finish(b, { top: cy + R, sit: { kind: 'brim', rim: [-0.005, 0.075] } });
  const bowl = glass(built, new THREE.SphereGeometry(R, 30, 16, 0, Math.PI * 2, 0.6, Math.PI - 0.6 - 0.45), '#e0f2ff', 0.25);
  bowl.position.y = cy;
  const water = glass(built, new THREE.SphereGeometry(R - 0.004, 30, 14, 0, Math.PI * 2, 0.95, Math.PI - 0.95 - 0.45), '#5aaee8', 0.38);
  water.position.y = cy;
  const surf = glass(built, new THREE.CircleGeometry(Math.sin(0.95) * (R - 0.004), 30).rotateX(-Math.PI / 2), '#8ad0f4', 0.35);
  surf.position.y = cy + Math.cos(0.95) * (R - 0.004);
  // The goldfish, swimming round.
  const f = new Builder();
  const gold = '#f4821e';
  f.add(sph(14, 10), gold, { scale: [0.03, 0.04, 0.06] });
  f.add(cone(8), '#f8a040', { pos: [0, 0, -0.075], rot: [-Math.PI / 2, 0, 0], scale: [0.005, 0.035, 0.045] });
  f.add(sph(8, 6), '#f8a040', { pos: [0, 0.04, -0.005], scale: [0.005, 0.022, 0.026] });
  for (const x of [-1, 1]) {
    f.add(sph(8, 6), '#121218', { pos: [x * 0.022, 0.01, 0.04], scale: 0.008 });
    f.add(sph(8, 6), '#f8a040', { pos: [x * 0.03, -0.015, 0.015], rot: [0, x * 0.6, 0], scale: [0.005, 0.015, 0.02] });
  }
  const swim = new THREE.Group();
  built.group.add(swim);
  const fish = moving(built, f, wet());
  swim.add(fish);
  built.update = (t) => {
    const a = t * 0.9;
    swim.position.set(Math.sin(a) * 0.07, cy - 0.01 + Math.sin(t * 1.3) * 0.02, Math.cos(a) * 0.07);
    swim.rotation.y = a + Math.PI / 2;
    fish.rotation.y = Math.sin(t * 9) * 0.15;
  };
  return built;
}
