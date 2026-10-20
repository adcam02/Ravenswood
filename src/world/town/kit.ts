import * as THREE from 'three';
import { Builder } from '../build';

/** Unit primitives, made once and copied into builders. */
const cache = new Map<string, THREE.BufferGeometry>();
function cached(key: string, make: () => THREE.BufferGeometry): THREE.BufferGeometry {
  let g = cache.get(key);
  if (!g) {
    g = make();
    cache.set(key, g);
  }
  return g;
}

/** A triangular prism: base along z from -0.5 to 0.5, apex at y = 1, length along x from -0.5 to 0.5. */
function prismGeometry(): THREE.BufferGeometry {
  const a = [-0.5, 0, -0.5];
  const b = [-0.5, 0, 0.5];
  const c = [-0.5, 1, 0];
  const d = [0.5, 0, -0.5];
  const e = [0.5, 0, 0.5];
  const f = [0.5, 1, 0];
  const tris = [
    [a, c, b],
    [d, e, f],
    [b, c, f],
    [b, f, e],
    [a, d, f],
    [a, f, c],
    [a, b, e],
    [a, e, d],
  ];
  const pos = new Float32Array(tris.length * 9);
  tris.forEach((t, i) => t.forEach((v, j) => pos.set(v, i * 9 + j * 3)));
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.computeVertexNormals();
  return g;
}

export const G = {
  box: () => cached('box', () => new THREE.BoxGeometry(1, 1, 1)),
  cyl: (n = 8) => cached(`cyl${n}`, () => new THREE.CylinderGeometry(1, 1, 1, n)),
  /** A cylinder that narrows to `top` (as a fraction of the bottom radius). */
  taper: (top: number, n = 8) => cached(`taper${top}:${n}`, () => new THREE.CylinderGeometry(top, 1, 1, n)),
  cone: (n = 8) => cached(`cone${n}`, () => new THREE.ConeGeometry(1, 1, n)),
  ico: (d = 0) => cached(`ico${d}`, () => new THREE.IcosahedronGeometry(1, d)),
  dodeca: () => cached('dodeca', () => new THREE.DodecahedronGeometry(1, 0)),
  sphere: (w = 8, h = 6) => cached(`sph${w}:${h}`, () => new THREE.SphereGeometry(1, w, h)),
  torus: (r = 0.15, rs = 6, ts = 12) => cached(`tor${r}:${rs}:${ts}`, () => new THREE.TorusGeometry(1, r, rs, ts)),
  prism: () => cached('prism', prismGeometry),
  plane: () => cached('plane', () => new THREE.PlaneGeometry(1, 1)),
};

export interface Layers {
  /** Matte, shadow-casting geometry. */
  main: Builder;
  /** Window glass and lamp glass, which glow at night. */
  glass: Builder;
}

const v = new THREE.Vector3();
const q = new THREE.Quaternion();
const e = new THREE.Euler();
const s = new THREE.Vector3();

function mat(x: number, y: number, z: number, rx: number, ry: number, rz: number, sx: number, sy: number, sz: number): THREE.Matrix4 {
  return new THREE.Matrix4().compose(v.set(x, y, z), q.setFromEuler(e.set(rx, ry, rz)), s.set(sx, sy, sz));
}

/**
 * Paints primitives into a set of builders, inside a local frame (a building's position and facing).
 * Boxes, cylinders and cones are given by size and centre; `y` is the centre height unless noted.
 */
export class Paint {
  constructor(
    public layers: Layers,
    public m: THREE.Matrix4 = new THREE.Matrix4(),
  ) {}

  /** A painter for a child frame: moved, turned about y, and scaled. */
  at(x: number, y: number, z: number, ry = 0, scale = 1): Paint {
    const child = this.m.clone().multiply(mat(x, y, z, 0, ry, 0, scale, scale, scale));
    return new Paint(this.layers, child);
  }

  /** The same frame, painting into a different layer. */
  get glass(): Paint {
    return new Paint({ main: this.layers.glass, glass: this.layers.glass }, this.m);
  }

  geo(geo: THREE.BufferGeometry, color: THREE.ColorRepresentation, m: THREE.Matrix4): this {
    this.layers.main.add(geo, color, m, this.m);
    return this;
  }

  box(color: THREE.ColorRepresentation, w: number, h: number, d: number, x: number, y: number, z: number, rx = 0, ry = 0, rz = 0): this {
    return this.geo(G.box(), color, mat(x, y, z, rx, ry, rz, w, h, d));
  }

  /** A box standing on y (its bottom at y). */
  block(color: THREE.ColorRepresentation, w: number, h: number, d: number, x: number, y: number, z: number, ry = 0): this {
    return this.box(color, w, h, d, x, y + h / 2, z, 0, ry, 0);
  }

  cyl(color: THREE.ColorRepresentation, r: number, h: number, x: number, y: number, z: number, n = 8, rx = 0, ry = 0, rz = 0): this {
    return this.geo(G.cyl(n), color, mat(x, y, z, rx, ry, rz, r, h, r));
  }

  /** A cylinder standing on y. */
  post(color: THREE.ColorRepresentation, r: number, h: number, x: number, y: number, z: number, n = 6): this {
    return this.cyl(color, r, h, x, y + h / 2, z, n);
  }

  taper(color: THREE.ColorRepresentation, top: number, r: number, h: number, x: number, y: number, z: number, n = 8): this {
    return this.geo(G.taper(top, n), color, mat(x, y + h / 2, z, 0, 0, 0, r, h, r));
  }

  /** A cone standing on y. */
  cone(color: THREE.ColorRepresentation, r: number, h: number, x: number, y: number, z: number, n = 8, ry = 0): this {
    return this.geo(G.cone(n), color, mat(x, y + h / 2, z, 0, ry, 0, r, h, r));
  }

  ico(color: THREE.ColorRepresentation, r: number, x: number, y: number, z: number, detail = 0, sy = 1, ry = 0): this {
    return this.geo(G.ico(detail), color, mat(x, y, z, 0, ry, 0, r, r * sy, r));
  }

  sphere(color: THREE.ColorRepresentation, rx: number, ry: number, rz: number, x: number, y: number, z: number, w = 8, h = 6): this {
    return this.geo(G.sphere(w, h), color, mat(x, y, z, 0, 0, 0, rx, ry, rz));
  }

  /** A gable: triangular prism `len` long (x), `base` wide (z), `h` tall, standing on y. */
  prism(color: THREE.ColorRepresentation, len: number, h: number, base: number, x: number, y: number, z: number, ry = 0): this {
    return this.geo(G.prism(), color, mat(x, y, z, 0, ry, 0, len, h, base));
  }

  torus(color: THREE.ColorRepresentation, r: number, tube: number, x: number, y: number, z: number, rx = 0, ry = 0): this {
    return this.geo(G.torus(tube / r, 6, 14), color, mat(x, y, z, rx, ry, 0, r, r, r));
  }

  /**
   * A pitched roof over a rectangle `len` (x) by `depth` (z) whose eaves sit at `y`, rising `h` to the
   * ridge, with an overhang. Two slabs meeting along a ridge that runs along x.
   */
  roof(color: THREE.ColorRepresentation, len: number, depth: number, h: number, y: number, overhang = 0.4, thick = 0.18, x = 0, z = 0, ry = 0): this {
    const half = depth / 2;
    const slope = Math.hypot(h, half);
    const ang = Math.atan2(h, half);
    for (const side of [1, -1]) {
      const p = this.at(x, 0, z, ry + (side < 0 ? Math.PI : 0));
      const length = slope + overhang;
      // Centre of the slab, starting at the ridge and running down past the eave.
      const cz = (Math.cos(ang) * length) / 2;
      const cy = y + h - (Math.sin(ang) * length) / 2;
      // Lift the slab off the gable along its normal so the wall doesn't poke through.
      const nz = Math.sin(ang) * thick * 0.5;
      const ny = Math.cos(ang) * thick * 0.5;
      p.box(color, len + overhang * 1.4, thick, length, 0, cy + ny, cz + nz, ang);
    }
    // A ridge beam to close the seam.
    this.at(x, 0, z, ry).box(shade(color, -0.12), len + overhang * 1.5, thick * 1.2, thick * 1.6, 0, y + h + thick * 0.75, 0);
    return this;
  }
}

/** Lightens (+) or darkens (-) a colour. */
export function shade(color: THREE.ColorRepresentation, amount: number): THREE.Color {
  const c = new THREE.Color(color);
  const hsl = { h: 0, s: 0, l: 0 };
  c.getHSL(hsl);
  c.setHSL(hsl.h, hsl.s, THREE.MathUtils.clamp(hsl.l + amount, 0, 1));
  return c;
}

/** Picks from a list with a random function. */
export const pick = <T>(r: () => number, list: T[]): T => list[Math.floor(r() * list.length) % list.length];

/** World frame for a building at x, z facing ry. */
export function frame(x: number, z: number, ry: number): THREE.Matrix4 {
  return mat(x, 0, z, 0, ry, 0, 1, 1, 1);
}

/** Turns a local offset in a building's frame into world x, z. */
export function local(x: number, z: number, ry: number, lx: number, lz: number): { x: number; z: number } {
  const c = Math.cos(ry);
  const sn = Math.sin(ry);
  return { x: x + lx * c + lz * sn, z: z - lx * sn + lz * c };
}
