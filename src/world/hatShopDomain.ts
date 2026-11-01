import * as THREE from 'three';
import { Builder, type Vec3 } from './build';
import { finish, onShell, shellBand, sph, type BuiltHat } from './hats';

/**
 * The dearest hat in the Lucky Raven's shop, made like the others (see hats.ts) for a reference head about half a
 * metre across with the origin at its top. Whoever wears it can open a Domain (see game/domain.ts).
 */

const cone = (n = 8) => new THREE.ConeGeometry(1, 1, n);
const UP = new THREE.Vector3(0, 1, 0);

/**
 * The Domain Expansioner: a shock of spiky white hair standing straight up out of a wide black blindfold worn round
 * the brow, as worn by a certain unbeatable sorcerer.
 */
export function domain(): BuiltHat {
  const b = new Builder();
  const whites = ['#f6f8fc', '#e8edf6', '#dfe5f0'];
  const black = '#15151b';
  // The hair's crown, hugging the head, its bottom hidden in the band.
  const C: Vec3 = [0, -0.14, -0.01];
  const R: Vec3 = [0.285, 0.205, 0.3];
  shellBand(b, C, R, 0, Math.PI / 2, whites[0]);
  // Spikes all over it, swept up and back: a ring of short ones low down, longer ones higher, the tallest on top.
  const spike = (a: number, e: number, len: number, w: number, color: string, lift = 0.75) => {
    const { p, n } = onShell(R[0], R[1], R[2], a, e, C[1]);
    p.z += C[2];
    const dir = n.clone().lerp(UP, lift).add(new THREE.Vector3(0, 0, -0.18)).normalize();
    const q = new THREE.Quaternion().setFromUnitVectors(UP, dir);
    b.add(cone(7), color, new THREE.Matrix4().compose(p.clone().addScaledVector(dir, len * 0.4), q, new THREE.Vector3(w, len, w)));
  };
  for (let i = 0; i < 14; i++) spike((i / 14) * Math.PI * 2 + 0.1, 0.42, 0.13 + (i % 3) * 0.025, 0.05, whites[i % 3], 0.55);
  for (let i = 0; i < 10; i++) spike((i / 10) * Math.PI * 2 + 0.35, 0.85, 0.17 + (i % 2) * 0.04, 0.055, whites[(i + 1) % 3], 0.7);
  for (let i = 0; i < 5; i++) spike((i / 5) * Math.PI * 2, 1.25, 0.2 + (i % 2) * 0.03, 0.06, whites[i % 3], 0.85);
  spike(0, Math.PI / 2, 0.22, 0.065, whites[0], 1);
  // A few locks falling forward over the top of the band.
  for (const a of [-0.45, -0.15, 0.15, 0.45]) {
    const { p } = onShell(R[0], R[1], R[2], a, 0.25, C[1]);
    p.z += C[2] + 0.012;
    const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.PI - 0.3, a, 0));
    b.add(cone(6), whites[1], new THREE.Matrix4().compose(p.add(new THREE.Vector3(0, -0.02, 0)), q, new THREE.Vector3(0.04, 0.09, 0.025)));
  }
  // The blindfold: a wide black band round the brow, tipped down a little at the front, a fold along its middle,
  // and its two ends tucked in at the back.
  const tilt = new THREE.Matrix4().makeRotationX(0.16);
  const band = new THREE.LatheGeometry(
    [
      [0.288, -0.205],
      [0.302, -0.2],
      [0.31, -0.17],
      [0.306, -0.14],
      [0.31, -0.11],
      [0.302, -0.082],
      [0.288, -0.078],
      [0.288, -0.205],
    ].map(([r, y]) => new THREE.Vector2(r, y)),
    44,
  );
  b.add(band, black, { pos: [0, 0, -0.01], scale: [1, 1, 1.04] }, tilt);
  band.dispose();
  const knot = new THREE.Vector3(0, -0.14, -0.33).applyMatrix4(tilt);
  b.add(sph(10, 7), '#1d1d25', { pos: knot.toArray(), scale: [0.05, 0.04, 0.025] });
  return finish(b, { top: 0.28, sit: { kind: 'snug', rim: [-0.2, 0.3, 0.315] } });
}
