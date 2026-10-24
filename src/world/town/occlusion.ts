import * as THREE from 'three';

/**
 * Which buildings stand between the camera and our animal, for fading them. three's own raycast tests every triangle
 * of each building whose bounding sphere the line touches (the clock tower alone has tens of thousands, and its sphere
 * covers most of the square), which took milliseconds on some frames out in town and left garbage behind every frame.
 * This keeps each building's triangles in runs with a box round each run, so only the runs the line actually crosses
 * are tested; it stops at the first hit and allocates nothing. Buildings don't move, so the boxes are worked out once.
 * The answer is the same as the raycast's: front faces only (as the buildings are drawn), between the two ends.
 */

/** Triangles per run (built one part after another, so neighbouring triangles sit close together). */
const RUN = 48;

interface Prepared {
  pos: ArrayLike<number>;
  index: ArrayLike<number> | null;
  tris: number;
  /** min x, y, z, max x, y, z for each run, then for the whole building. */
  boxes: Float32Array;
  cull: boolean;
  inverse: THREE.Matrix4;
}

const prepared = new WeakMap<THREE.Mesh, Prepared | null>();

function prepare(mesh: THREE.Mesh): Prepared | null {
  const geo = mesh.geometry;
  const attr = geo.getAttribute('position');
  if (!(attr instanceof THREE.BufferAttribute) || attr.itemSize !== 3 || Array.isArray(mesh.material)) return null;
  const pos = attr.array;
  const index = geo.index ? geo.index.array : null;
  const count = index ? geo.index!.count : attr.count;
  const tris = Math.floor(count / 3);
  const runs = Math.ceil(tris / RUN);
  const boxes = new Float32Array((runs + 1) * 6);
  const all = runs * 6;
  boxes.fill(Infinity, all, all + 3);
  boxes.fill(-Infinity, all + 3, all + 6);
  for (let r = 0; r < runs; r++) {
    const o = r * 6;
    let x0 = Infinity, y0 = Infinity, z0 = Infinity, x1 = -Infinity, y1 = -Infinity, z1 = -Infinity;
    const end = Math.min(tris, (r + 1) * RUN) * 3;
    for (let i = r * RUN * 3; i < end; i++) {
      const v = (index ? index[i] : i) * 3;
      const x = pos[v], y = pos[v + 1], z = pos[v + 2];
      if (x < x0) x0 = x;
      if (x > x1) x1 = x;
      if (y < y0) y0 = y;
      if (y > y1) y1 = y;
      if (z < z0) z0 = z;
      if (z > z1) z1 = z;
    }
    boxes[o] = x0;
    boxes[o + 1] = y0;
    boxes[o + 2] = z0;
    boxes[o + 3] = x1;
    boxes[o + 4] = y1;
    boxes[o + 5] = z1;
    for (let k = 0; k < 3; k++) {
      boxes[all + k] = Math.min(boxes[all + k], boxes[o + k]);
      boxes[all + 3 + k] = Math.max(boxes[all + 3 + k], boxes[o + 3 + k]);
    }
  }
  mesh.updateWorldMatrix(true, false);
  const material = mesh.material as THREE.Material;
  return { pos, index, tris, boxes, cull: material.side === THREE.FrontSide, inverse: mesh.matrixWorld.clone().invert() };
}

/** Whether the segment from (ox, oy, oz) along (dx, dy, dz), for t from 0 to 1, crosses box `o`. */
function crossesBox(b: Float32Array, o: number, ox: number, oy: number, oz: number, dx: number, dy: number, dz: number): boolean {
  let t0 = 0;
  let t1 = 1;
  for (let k = 0; k < 3; k++) {
    const s = k === 0 ? ox : k === 1 ? oy : oz;
    const d = k === 0 ? dx : k === 1 ? dy : dz;
    const lo = b[o + k];
    const hi = b[o + 3 + k];
    if (Math.abs(d) < 1e-12) {
      if (s < lo || s > hi) return false;
      continue;
    }
    let a = (lo - s) / d;
    let c = (hi - s) / d;
    if (a > c) {
      const swap = a;
      a = c;
      c = swap;
    }
    if (a > t0) t0 = a;
    if (c < t1) t1 = c;
    if (t0 > t1) return false;
  }
  return true;
}

const a = new THREE.Vector3();
const b = new THREE.Vector3();

/** Whether the line from `from` to `to` (world space) passes through the mesh. */
export function blocksLine(mesh: THREE.Mesh, from: THREE.Vector3, to: THREE.Vector3): boolean {
  let p = prepared.get(mesh);
  if (p === undefined) {
    p = prepare(mesh);
    prepared.set(mesh, p);
  }
  if (!p) return fallback(mesh, from, to);
  a.copy(from).applyMatrix4(p.inverse);
  b.copy(to).applyMatrix4(p.inverse);
  const ox = a.x, oy = a.y, oz = a.z;
  const dx = b.x - ox, dy = b.y - oy, dz = b.z - oz;
  const { pos, index, tris, boxes, cull } = p;
  const runs = Math.ceil(tris / RUN);
  if (!crossesBox(boxes, runs * 6, ox, oy, oz, dx, dy, dz)) return false;
  for (let r = 0; r < runs; r++) {
    if (!crossesBox(boxes, r * 6, ox, oy, oz, dx, dy, dz)) continue;
    const end = Math.min(tris, (r + 1) * RUN);
    for (let t = r * RUN; t < end; t++) {
      const i0 = (index ? index[t * 3] : t * 3) * 3;
      const i1 = (index ? index[t * 3 + 1] : t * 3 + 1) * 3;
      const i2 = (index ? index[t * 3 + 2] : t * 3 + 2) * 3;
      const v0x = pos[i0], v0y = pos[i0 + 1], v0z = pos[i0 + 2];
      // Möller-Trumbore, as three's Ray.intersectTriangle does it.
      const e1x = pos[i1] - v0x, e1y = pos[i1 + 1] - v0y, e1z = pos[i1 + 2] - v0z;
      const e2x = pos[i2] - v0x, e2y = pos[i2 + 1] - v0y, e2z = pos[i2 + 2] - v0z;
      const nx = e1y * e2z - e1z * e2y, ny = e1z * e2x - e1x * e2z, nz = e1x * e2y - e1y * e2x;
      let ddn = dx * nx + dy * ny + dz * nz;
      let sign: number;
      if (ddn > 0) {
        if (cull) continue;
        sign = 1;
      } else if (ddn < 0) {
        sign = -1;
        ddn = -ddn;
      } else continue;
      const qx = ox - v0x, qy = oy - v0y, qz = oz - v0z;
      // d . (q x e2)
      const u = sign * (dx * (qy * e2z - qz * e2y) + dy * (qz * e2x - qx * e2z) + dz * (qx * e2y - qy * e2x));
      if (u < 0) continue;
      // d . (e1 x q)
      const v = sign * (dx * (e1y * qz - e1z * qy) + dy * (e1z * qx - e1x * qz) + dz * (e1x * qy - e1y * qx));
      if (v < 0 || u + v > ddn) continue;
      const qdn = -sign * (qx * nx + qy * ny + qz * nz);
      if (qdn < 0 || qdn > ddn) continue;
      return true;
    }
  }
  return false;
}

const ray = new THREE.Raycaster();
const hits: THREE.Intersection[] = [];
const dir = new THREE.Vector3();

/** Anything unusual (several materials, odd vertex data): three's raycast. */
function fallback(mesh: THREE.Mesh, from: THREE.Vector3, to: THREE.Vector3): boolean {
  dir.copy(to).sub(from);
  ray.far = dir.length();
  ray.set(from, dir.normalize());
  hits.length = 0;
  mesh.raycast(ray, hits);
  return hits.length > 0;
}
