import type { Collider } from './types';

export type Bounds = { kind: 'circle'; r: number } | { kind: 'rect'; hw: number; hd: number };

/** Radius of an animal, for bumping into things. */
export const BODY = 0.38;

/** Pushes a point out of every collider it overlaps and back inside the bounds. Returns the corrected point. */
export function resolve(x: number, z: number, colliders: Collider[], bounds: Bounds, r = BODY): [number, number] {
  for (let pass = 0; pass < 2; pass++) {
    for (const c of colliders) {
      if (c.kind === 'circle') {
        const dx = x - c.x;
        const dz = z - c.z;
        const min = c.r + r;
        const d2 = dx * dx + dz * dz;
        if (d2 < min * min) {
          const d = Math.sqrt(d2) || 0.0001;
          x = c.x + (dx / d) * min;
          z = c.z + (dz / d) * min;
        }
      } else {
        // Into the box's own frame, where it's axis-aligned.
        const cos = Math.cos(c.rot);
        const sin = Math.sin(c.rot);
        const dx = x - c.x;
        const dz = z - c.z;
        const lx = dx * cos - dz * sin;
        const lz = dx * sin + dz * cos;
        const hw = c.hw + r;
        const hd = c.hd + r;
        if (Math.abs(lx) < hw && Math.abs(lz) < hd) {
          // Out through the nearest side.
          const px = hw - Math.abs(lx);
          const pz = hd - Math.abs(lz);
          let nx = lx;
          let nz = lz;
          if (px < pz) nx = Math.sign(lx || 1) * hw;
          else nz = Math.sign(lz || 1) * hd;
          x = c.x + nx * cos + nz * sin;
          z = c.z - nx * sin + nz * cos;
        }
      }
    }
  }
  if (bounds.kind === 'circle') {
    const d = Math.hypot(x, z);
    const max = bounds.r - r;
    if (d > max) {
      x = (x / d) * max;
      z = (z / d) * max;
    }
  } else {
    x = Math.max(-bounds.hw + r, Math.min(bounds.hw - r, x));
    z = Math.max(-bounds.hd + r, Math.min(bounds.hd - r, z));
  }
  return [x, z];
}

/** Turns smoothly toward an angle, the short way round. */
export function turnToward(current: number, target: number, maxStep: number): number {
  let d = target - current;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  if (Math.abs(d) <= maxStep) return target;
  return current + Math.sign(d) * maxStep;
}
