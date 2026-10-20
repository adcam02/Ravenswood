import * as THREE from 'three';
import { mergeGeometries, toCreasedNormals } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

export type Vec3 = [number, number, number];

export interface Place {
  pos?: Vec3;
  /** Euler angles in radians, applied in XYZ order. */
  rot?: Vec3;
  scale?: number | Vec3;
}

const tmpColor = new THREE.Color();

export function placeMatrix(p: Place = {}): THREE.Matrix4 {
  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(...(p.rot ?? [0, 0, 0])));
  const s = typeof p.scale === 'number' ? new THREE.Vector3(p.scale, p.scale, p.scale) : new THREE.Vector3(...(p.scale ?? [1, 1, 1]));
  m.compose(new THREE.Vector3(...(p.pos ?? [0, 0, 0])), q, s);
  return m;
}

/**
 * Collects coloured, positioned primitives and merges them into one geometry with vertex colours, so a
 * whole building (or an animal's head) is a single draw call. Everything is flat shaded and low-poly.
 */
export class Builder {
  private parts: THREE.BufferGeometry[] = [];

  /** Adds a copy of `geo`, painted `color`, placed by `p` (or a matrix), optionally inside a parent matrix. */
  add(geo: THREE.BufferGeometry, color: THREE.ColorRepresentation, p: Place | THREE.Matrix4 = {}, parent?: THREE.Matrix4): this {
    let g = geo.index ? geo.toNonIndexed() : geo.clone();
    const m = p instanceof THREE.Matrix4 ? p.clone() : placeMatrix(p);
    if (parent) m.premultiply(parent);
    g.applyMatrix4(m);
    // Only position and colour are kept, so any primitive merges with any other.
    const pos = g.getAttribute('position') as THREE.BufferAttribute;
    const clean = new THREE.BufferGeometry();
    clean.setAttribute('position', pos);
    tmpColor.set(color);
    const colors = new Float32Array(pos.count * 3);
    for (let i = 0; i < pos.count; i++) {
      colors[i * 3] = tmpColor.r;
      colors[i * 3 + 1] = tmpColor.g;
      colors[i * 3 + 2] = tmpColor.b;
    }
    clean.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    g.dispose();
    g = clean;
    this.parts.push(g);
    return this;
  }

  /** Adds an already-coloured geometry from another builder. */
  addColored(geo: THREE.BufferGeometry, p: Place | THREE.Matrix4 = {}): this {
    const g = geo.clone();
    g.applyMatrix4(p instanceof THREE.Matrix4 ? p : placeMatrix(p));
    this.parts.push(g);
    return this;
  }

  get empty(): boolean {
    return this.parts.length === 0;
  }

  /**
   * The merged geometry. Normals are smoothed across edges gentler than `creaseDeg` (round things read as
   * smooth), and kept hard across sharper ones (boxes keep their corners). 0 gives flat facets everywhere.
   */
  geometry(creaseDeg = SMOOTH_DEG): THREE.BufferGeometry {
    let g = this.parts.length ? mergeGeometries(this.parts, false) ?? new THREE.BufferGeometry() : new THREE.BufferGeometry();
    for (const p of this.parts) p.dispose();
    this.parts = [];
    if (creaseDeg > 0 && g.getAttribute('position')?.count) {
      const smoothed = toCreasedNormals(g, THREE.MathUtils.degToRad(creaseDeg));
      g.dispose();
      g = smoothed;
    } else g.computeVertexNormals();
    g.computeBoundingSphere();
    return g;
  }

  mesh(material: THREE.Material, opts: { cast?: boolean; receive?: boolean; crease?: number } = {}): THREE.Mesh {
    const mesh = new THREE.Mesh(this.geometry(opts.crease), material);
    mesh.castShadow = opts.cast ?? true;
    mesh.receiveShadow = opts.receive ?? true;
    return mesh;
  }
}

/** Deterministic random numbers, so the town looks the same on every screen. */
export function rng(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Nudges every vertex a little, for rocks, bushes and tree crowns that shouldn't look machine-made. */
export function jitter(geo: THREE.BufferGeometry, amount: number, seed = 1): THREE.BufferGeometry {
  const pos = geo.getAttribute('position') as THREE.BufferAttribute;
  const r = rng(seed);
  // Shared corners must move together or the faces split, so offsets are keyed by position.
  const seen = new Map<string, Vec3>();
  for (let i = 0; i < pos.count; i++) {
    const key = `${pos.getX(i).toFixed(3)},${pos.getY(i).toFixed(3)},${pos.getZ(i).toFixed(3)}`;
    let o = seen.get(key);
    if (!o) {
      o = [(r() - 0.5) * amount, (r() - 0.5) * amount, (r() - 0.5) * amount];
      seen.set(key, o);
    }
    pos.setXYZ(i, pos.getX(i) + o[0], pos.getY(i) + o[1], pos.getZ(i) + o[2]);
  }
  pos.needsUpdate = true;
  return geo;
}

// ---------------------------------------------------------------- shared materials

/** Edges gentler than this are shaded smooth; sharper ones stay crisp. */
export const SMOOTH_DEG = 38;

/** The standard matte look, coloured by vertex, smooth where the geometry is round. */
export const matte = () => new THREE.MeshLambertMaterial({ vertexColors: true });

/** A softer look for characters, with a little sheen. */
export const soft = () => new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.82, metalness: 0 });

/** Glossy and slightly wet, for aquatic animals. */
export const wet = () =>
  new THREE.MeshPhysicalMaterial({
    vertexColors: true,
    roughness: 0.28,
    metalness: 0,
    clearcoat: 1,
    clearcoatRoughness: 0.12,
  });

/** Things that glow on their own (lit windows, lanterns, the Storyteller). */
export const glow = (color: THREE.ColorRepresentation, intensity = 1) =>
  new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: intensity, flatShading: true, roughness: 1 });
