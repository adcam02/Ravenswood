import * as THREE from 'three';
import type { Builder, Vec3 } from '../build';
import { G } from './kit';

/** Bits the stools and gravestones are made of (stools.ts, stools2.ts). */

export const up = new THREE.Vector3(0, 1, 0);

/** A round rod from one point to another (a leg, a rope, a spoke). */
export function rod(b: Builder, color: string, from: Vec3, to: Vec3, r: number, sides = 6) {
  const a = new THREE.Vector3(...from);
  const d = new THREE.Vector3(...to).sub(a);
  const len = d.length();
  const m = new THREE.Matrix4().compose(a.addScaledVector(d, 0.5), new THREE.Quaternion().setFromUnitVectors(up, d.normalize()), new THREE.Vector3(r, len, r));
  b.add(G.cyl(sides), color, m);
}

/** A piece of a torus: `arc` radians of a ring of radius 1, tube `tube`, lying in the xy plane from the +x axis. */
const arcs = new Map<string, THREE.BufferGeometry>();
export function arc(tube: number, angle: number, sides = 6, segs = 10): THREE.BufferGeometry {
  const k = `${tube}:${angle}:${sides}:${segs}`;
  let g = arcs.get(k);
  if (!g) arcs.set(k, (g = new THREE.TorusGeometry(1, tube, sides, segs, angle)));
  return g;
}

/** A barrel's bulging side: radius 1 at the middle, `ends` at top and bottom, height 1 centred on 0. */
const bulges = new Map<number, THREE.BufferGeometry>();
export function bulge(ends: number): THREE.BufferGeometry {
  let g = bulges.get(ends);
  if (!g) {
    const pts = [0, 0.25, 0.5, 0.75, 1].map((t) => new THREE.Vector2(ends + (1 - ends) * Math.sin(t * Math.PI), t - 0.5));
    pts.unshift(new THREE.Vector2(0, -0.5));
    pts.push(new THREE.Vector2(0, 0.5));
    bulges.set(ends, (g = new THREE.LatheGeometry(pts, 14)));
  }
  return g;
}

/** Half a disc (a clam's open shell), the flat side down, thickness along y before it's turned. */
export const halfDisc = new THREE.CylinderGeometry(1, 1, 1, 12, 1, false, -Math.PI / 2, Math.PI);

/** A six-sided prism and point, for crystals (the kit rounds anything over five sides up to fourteen). */
export const hex = new THREE.CylinderGeometry(1, 1, 1, 6);
export const hexTip = new THREE.ConeGeometry(1, 1, 6);

/** Spots scattered over the top of a dome of radii rx, ry, rz sitting at y (the toadstool's, the egg's). */
export function domeSpots(b: Builder, color: string, c: Vec3, r: Vec3, n: number, size: number, seed = 1, minUp = 0.15) {
  for (let i = 0; i < n; i++) {
    const a = i * 2.39996 + seed;
    const h = minUp + (1 - minUp) * (((i * 0.618 + seed * 0.31) % 1) * 0.85);
    const ring = Math.sqrt(1 - h * h);
    const n3 = new THREE.Vector3((Math.cos(a) * ring) / r[0], h / r[1], (Math.sin(a) * ring) / r[2]).normalize();
    const p = new THREE.Vector3(c[0] + Math.cos(a) * ring * r[0], c[1] + h * r[1], c[2] + Math.sin(a) * ring * r[2]);
    const q = new THREE.Quaternion().setFromUnitVectors(up, n3);
    b.add(G.sphere(6, 4), color, new THREE.Matrix4().compose(p, q, new THREE.Vector3(size, size * 0.3, size)));
  }
}
