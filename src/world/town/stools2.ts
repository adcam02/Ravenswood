import * as THREE from 'three';
import type { Builder, Vec3 } from '../build';
import type { PopGraveId, PopStoolId } from '../stoolShop2';
import { G } from './kit';
import { bulge, domeSpots, rod, up } from './stoolBits';
import type { GraveDesign, GravePlate } from './stools';

/**
 * The lily pad, and the stools and gravestones that nod to films, shows and games (stoolShop2.ts), painted the same
 * way as the rest in stools.ts: seat tops at 0.42, backs behind z = -0.28, gravestones facing +z with a plate.
 */

// ---------------------------------------------------------------- bits

const X = new THREE.Vector3(1, 0, 0);

/** A matrix at `pos`, turned by Euler angles. */
const at = (pos: Vec3, rot: Vec3 = [0, 0, 0], s = 1) => new THREE.Matrix4().compose(new THREE.Vector3(...pos), new THREE.Quaternion().setFromEuler(new THREE.Euler(...rot)), new THREE.Vector3(s, s, s));

/** The faces of a box of size w, h, d centred at c: a frame on each with +z pointing out (four sides, then the top). */
function boxFaces(c: Vec3, w: number, h: number, d: number, top = true): THREE.Matrix4[] {
  const f = [at([c[0], c[1], c[2] + d / 2]), at([c[0] + w / 2, c[1], c[2]], [0, Math.PI / 2, 0]), at([c[0], c[1], c[2] - d / 2], [0, Math.PI, 0]), at([c[0] - w / 2, c[1], c[2]], [0, -Math.PI / 2, 0])];
  if (top) f.push(at([c[0], c[1] + h / 2, c[2]], [-Math.PI / 2, 0, 0]));
  return f;
}

/** Little square pixels from rows of '#' (top row first), centred on the frame's origin, facing its +z. */
function pixels(b: Builder, rows: string[], color: string, px: number, m: THREE.Matrix4, depth = px * 0.5) {
  const w = Math.max(...rows.map((r) => r.length));
  rows.forEach((row, r) => {
    for (let c = 0; c < row.length; c++) {
      if (row[c] !== '#') continue;
      let e = c;
      while (row[e + 1] === '#') e++;
      b.add(G.box(), color, { pos: [((c + e) / 2 - (w - 1) / 2) * px, ((rows.length - 1) / 2 - r) * px, depth / 2], scale: [(e - c + 1) * px, px, depth] }, m);
      c = e;
    }
  });
}

/** A tiny pixel font, just the letters wanted. */
const FONT: Record<string, string[]> = {
  G: ['###', '#..', '#.#', '#.#', '###'],
  A: ['.#.', '#.#', '###', '#.#', '#.#'],
  M: ['#...#', '##.##', '#.#.#', '#...#', '#...#'],
  E: ['###', '#..', '##.', '#..', '###'],
  O: ['###', '#.#', '#.#', '#.#', '###'],
  V: ['#.#', '#.#', '#.#', '#.#', '.#.'],
  R: ['##.', '#.#', '##.', '#.#', '#.#'],
  '2': ['###', '..#', '###', '#..', '###'],
  '0': ['###', '#.#', '#.#', '#.#', '###'],
  '1': ['.#', '##', '.#', '.#', '.#'],
  '4': ['#.#', '#.#', '###', '..#', '..#'],
  '5': ['###', '#..', '###', '..#', '###'],
  '7': ['###', '..#', '.#.', '.#.', '.#.'],
  '8': ['###', '#.#', '###', '#.#', '###'],
  ' ': ['.', '.', '.', '.', '.'],
};
function pixelText(b: Builder, text: string, color: string, px: number, m: THREE.Matrix4) {
  const rows = ['', '', '', '', ''];
  for (const ch of text) FONT[ch].forEach((r, i) => (rows[i] += (rows[i] ? '.' : '') + r));
  pixels(b, rows, color, px, m);
}

/** A heart in the xy plane facing +z, `s` across. */
function heart(b: Builder, color: string, s: number, m: THREE.Matrix4, depth = 0.01) {
  b.add(G.box(), color, { pos: [0, -0.12 * s, depth / 2], rot: [0, 0, Math.PI / 4], scale: [0.62 * s, 0.62 * s, depth] }, m);
  for (const x of [-1, 1]) b.add(G.cyl(12), color, { pos: [x * 0.22 * s, 0.12 * s, depth / 2], rot: [Math.PI / 2, 0, 0], scale: [0.3 * s, depth, 0.3 * s] }, m);
}

/** A ghost: a body of radius r from y0 up to y0 + h, a round top, and a wavy hem. */
function ghostBody(b: Builder, color: string, r: number, y0: number, h: number, top: number) {
  b.add(G.cyl(16), color, { pos: [0, y0 + h / 2, 0], scale: [r, h, r] });
  b.add(G.dome(16), color, { pos: [0, y0 + h, 0], scale: [r, top, r] });
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    b.add(G.cone(6), color, { pos: [Math.sin(a) * r * 0.8, y0 - r * 0.12, Math.cos(a) * r * 0.8], rot: [Math.PI, 0, 0], scale: [r * 0.24, r * 0.26, r * 0.24] });
  }
}

/** A low slab leaning back in front of a gravestone, for its name when the stone itself has no flat face for it. */
function plaque(b: Builder, color: string, z: number, w = 0.44, h = 0.2) {
  b.add(G.box(), color, { pos: [0, 0.1, z], rot: [-0.2, 0, 0], scale: [w, h, 0.05] });
}
/** The plate on a plaque(). */
const plateOf = (color: string, z: number, fg: string, w = 0.44, h = 0.2): GravePlate => ({ y: 0.1, z: z + 0.032, w: w - 0.04, h: h - 0.03, bg: color, fg, tilt: 0.2 });

/** A flat shape (in x and y) pushed `depth` deep along z, made once. */
const flats = new Map<string, THREE.BufferGeometry>();
function flat(key: string, depth: number, draw: (s: THREE.Shape) => void, segs = 12): THREE.BufferGeometry {
  let g = flats.get(key);
  if (!g) {
    const s = new THREE.Shape();
    draw(s);
    g = new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: false, curveSegments: segs });
    g.translate(0, 0, -depth / 2);
    flats.set(key, g);
  }
  return g;
}

/** A sofa of the given colours: base, seat cushion (top at 0.42), a back and rolled arms. */
function couch(b: Builder, cloth: string, dark: string, legs: string) {
  b.add(G.box(), dark, { pos: [0, 0.2, 0], scale: [0.78, 0.24, 0.52] });
  b.add(G.rbox(0.25), cloth, { pos: [0, 0.37, 0.02], scale: [0.62, 0.1, 0.46] });
  b.add(G.rbox(0.2), cloth, { pos: [0, 0.64, -0.31], rot: [-0.12, 0, 0], scale: [0.78, 0.5, 0.14] });
  for (const x of [-1, 1]) {
    b.add(G.box(), dark, { pos: [x * 0.36, 0.38, 0], scale: [0.1, 0.18, 0.5] });
    b.add(G.cyl(12), cloth, { pos: [x * 0.36, 0.48, 0.01], rot: [Math.PI / 2, 0, 0], scale: [0.075, 0.52, 0.075] });
    for (const z of [-0.2, 0.2]) b.add(G.taper(0.6, 6), legs, { pos: [x * 0.33, 0.04, z], scale: [0.03, 0.08, 0.03] });
  }
}

/** A cube with a heart in a ring on each face, rounded corners darker: the companion cube. */
function companionCube(b: Builder, s: number, m: THREE.Matrix4) {
  const grey = '#c4c8ce';
  const dark = '#6e737c';
  b.add(G.box(), grey, { scale: s }, m);
  for (const x of [-1, 1]) for (const y of [-1, 1]) for (const z of [-1, 1]) b.add(G.box(), dark, { pos: [(x * s) / 2.8, (y * s) / 2.8, (z * s) / 2.8], scale: s * 0.3 }, m);
  for (const f of boxFaces([0, 0, 0], s * 1.01, s * 1.01, s * 1.01)) {
    f.premultiply(m);
    b.add(G.cyl(16), dark, { rot: [Math.PI / 2, 0, 0], scale: [s * 0.24, 0.01, s * 0.24] }, f);
    b.add(G.cyl(16), '#e4e6ea', { pos: [0, 0, 0.004], rot: [Math.PI / 2, 0, 0], scale: [s * 0.19, 0.01, s * 0.19] }, f);
    heart(b, '#ec5aa8', s * 0.26, new THREE.Matrix4().makeTranslation(0, 0, 0.008).premultiply(f));
  }
}

/** A red-and-white ball with a black band and a button facing +z, radius r. */
function catchBall(b: Builder, r: number, c: Vec3, squash = 1) {
  b.add(G.dome(16), '#e2302a', { pos: c, scale: [r, r * squash, r] });
  b.add(G.dome(16), '#f6f4ee', { pos: c, rot: [Math.PI, 0, 0], scale: [r, r * squash, r] });
  b.add(G.cyl(16), '#1e1e24', { pos: c, scale: [r * 1.01, r * 0.1, r * 1.01] });
  b.add(G.cyl(14), '#1e1e24', { pos: [c[0], c[1], c[2] + r * 0.98], rot: [Math.PI / 2, 0, 0], scale: [r * 0.3, r * 0.08, r * 0.3] });
  b.add(G.cyl(14), '#f6f4ee', { pos: [c[0], c[1], c[2] + r * 1.02], rot: [Math.PI / 2, 0, 0], scale: [r * 0.2, r * 0.06, r * 0.2] });
}

/** A pineapple body (radius r, height h, from the ground) with its criss-cross studs. */
function pineappleBody(b: Builder, r: number, h: number) {
  b.add(bulge(0.7), '#e8b03a', { pos: [0, h / 2, 0], scale: [r, h, r] });
  const rows = Math.round(h / 0.1);
  for (let j = 1; j < rows; j++) {
    const y = (j / rows) * h;
    const rr = r * (0.7 + 0.3 * Math.sin((j / rows) * Math.PI)) + 0.005;
    for (let i = 0; i < 10; i++) {
      const a = ((i + (j % 2) * 0.5) / 10) * Math.PI * 2;
      b.add(G.box(), '#b8781a', { pos: [Math.sin(a) * rr, y, Math.cos(a) * rr], rot: [0, a, Math.PI / 4], scale: [0.035, 0.035, 0.02] });
    }
  }
}

/** A big flat-topped tyre or ring standing upright in the xy plane at c. */
const ring = (b: Builder, color: string, c: Vec3, r: number, tube: number, rot: Vec3 = [0, 0, 0]) => b.add(G.torus(tube, 6, 18), color, { pos: c, rot, scale: r });

// ---------------------------------------------------------------- the stools

export const POP_STOOL_PAINT: Record<'lilypad' | PopStoolId, (b: Builder) => void> = {
  lilypad(b) {
    // A big lily pad floating just above a puddle on the cobbles: a notch, veins, a pink water lily, a few drips.
    b.add(G.cyl(18), '#4a8a9a', { pos: [0, 0.006, 0], scale: [0.4, 0.012, 0.4] });
    ring(b, '#8cc4ce', [0, 0.014, 0], 0.43, 0.03, [Math.PI / 2, 0, 0]);
    const pad = flat('lilypad', 0.035, (s) => {
      s.moveTo(0, 0);
      s.absarc(0, 0, 1, 0.22, Math.PI * 2 - 0.22, false);
      s.lineTo(0, 0);
    }, 22);
    b.add(pad, '#4f9a3e', { pos: [0, 0.4, 0], rot: [-Math.PI / 2, 0, 0.9], scale: [0.42, 0.42, 1] });
    b.add(G.cyl(18), '#3c7a30', { pos: [0, 0.378, 0], scale: [0.3, 0.012, 0.3] });
    for (let i = 0; i < 7; i++) {
      const a = 0.9 + 0.5 + (i / 7) * (Math.PI * 2 - 1);
      b.add(G.box(), '#74be55', { pos: [Math.cos(a) * 0.19, 0.42, -Math.sin(a) * 0.19], rot: [0, a, 0], scale: [0.36, 0.006, 0.012] });
    }
    // The water lily, at the back where nobody sits on it.
    const fx = -0.22;
    const fz = -0.22;
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      b.add(G.sphere(8, 5), i % 2 ? '#f6a8c4' : '#f4bcd2', { pos: [fx + Math.sin(a) * 0.06, 0.47, fz + Math.cos(a) * 0.06], rot: [Math.cos(a) * 0.9, 0, -Math.sin(a) * 0.9], scale: [0.035, 0.08, 0.02] });
    }
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2 + 0.3;
      b.add(G.sphere(8, 5), '#fbe4ee', { pos: [fx + Math.sin(a) * 0.03, 0.49, fz + Math.cos(a) * 0.03], rot: [Math.cos(a) * 0.4, 0, -Math.sin(a) * 0.4], scale: [0.025, 0.06, 0.016] });
    }
    b.add(G.sphere(8, 5), '#f2c42a', { pos: [fx, 0.5, fz], scale: [0.025, 0.02, 0.025] });
    for (const [x, y, z] of [
      [0.3, 0.3, 0.2],
      [0.33, 0.16, 0.18],
      [-0.36, 0.22, 0.05],
    ]) {
      b.add(G.sphere(6, 4), '#a8dcea', { pos: [x, y, z], scale: [0.018, 0.028, 0.018] });
    }
  },
  grassblock(b) {
    // A blocky grass block: earth with darker and lighter squares, a grass top that drips down the sides.
    const s = 0.5;
    b.add(G.box(), '#8a5a36', { pos: [0, 0.21, 0], scale: [s, 0.42, s] });
    b.add(G.box(), '#5aa83a', { pos: [0, 0.39, 0], scale: [s + 0.006, 0.06, s + 0.006] });
    const px = s / 8;
    boxFaces([0, 0.21, 0], s, 0.42, s, false).forEach((f, k) => {
      for (let i = 0; i < 8; i++) {
        const drip = (i * 5 + k * 3) % 4 === 0;
        if (drip) b.add(G.box(), '#4e9a32', { pos: [(i - 3.5) * px, 0.21 - 0.06 - px / 2, 0.002], scale: [px, px, 0.006] }, f);
      }
      for (let i = 0; i < 9; i++) {
        const x = ((i * 3 + k) % 8) - 3.5;
        const y = ((i * 5 + k * 2) % 5) - 2.5;
        b.add(G.box(), i % 3 ? '#6e4428' : '#a87a52', { pos: [x * px, y * px - 0.02, 0.002], scale: [px, px, 0.006] }, f);
      }
    });
    for (let i = 0; i < 6; i++) b.add(G.box(), '#6cc04a', { pos: [((i * 3) % 8 - 3.5) * px, 0.421, ((i * 5) % 8 - 3.5) * px], scale: [px, 0.004, px] });
  },
  rubik(b) {
    // A puzzle cube: black, with nine coloured squares on each face.
    const s = 0.42;
    b.add(G.rbox(0.08), '#1a1a1e', { pos: [0, s / 2, 0], scale: s });
    const cols = ['#2aa84a', '#d8282a', '#2a5ad8', '#f08a1a', '#f6f6f2'];
    boxFaces([0, s / 2, 0], s, s, s).forEach((f, k) => {
      for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++) b.add(G.box(), cols[(k + (i === 1 && j === 0 ? 1 : 0) + (k === 4 && i === -1 && j === 1 ? 3 : 0)) % 5], { pos: [i * 0.135, j * 0.135, 0.002], scale: [0.12, 0.12, 0.006] }, f);
    });
  },
  brick(b) {
    // A giant red toy brick, two studs by four.
    const u = 0.16;
    b.add(G.box(), '#d8302a', { pos: [0, 0.18, 0], scale: [u * 4, 0.36, u * 2] });
    for (let i = 0; i < 4; i++) for (let j = 0; j < 2; j++) b.add(G.cyl(14), '#e2443a', { pos: [(i - 1.5) * u, 0.39, (j - 0.5) * u], scale: [0.05, 0.06, 0.05] });
  },
  sharkbarrel(b) {
    // A yellow barrel tied with rope, in a puddle of sea, a fin circling behind it.
    b.add(G.cyl(18), '#3a6a8a', { pos: [0, 0.006, 0], scale: [0.44, 0.012, 0.44] });
    ring(b, '#8ab8d0', [0, 0.012, 0], 0.46, 0.03, [Math.PI / 2, 0, 0]);
    b.add(bulge(0.84), '#f2c42a', { pos: [0, 0.21, 0], scale: [0.27, 0.42, 0.27] });
    b.add(G.cyl(), '#e0b020', { pos: [0, 0.41, 0], scale: [0.23, 0.02, 0.23] });
    for (const y of [0.1, 0.32]) b.add(G.cyl(), '#c89a1a', { pos: [0, y, 0], scale: [0.255, 0.025, 0.255] });
    ring(b, '#c8a878', [0, 0.21, 0], 0.275, 0.07, [Math.PI / 2, 0, 0]);
    rod(b, '#c8a878', [0.25, 0.21, 0.08], [0.42, 0.02, 0.18], 0.012, 4);
    b.add(G.prism(), '#5a6a7a', { pos: [0.3, 0.0, -0.3], rot: [0, 0.6, 0], scale: [0.18, 0.16, 0.03] });
  },
  swampstump(b) {
    // A swampy stump with green slime, reeds, an onion, and a crooked keep-out sign behind.
    b.add(G.cyl(16), '#4a5a2a', { pos: [0, 0.008, 0], scale: [0.46, 0.016, 0.42] });
    b.add(G.taper(0.86), '#5a4a2e', { pos: [0, 0.2, 0], scale: [0.36, 0.4, 0.36] });
    b.add(G.cyl(), '#b89a68', { pos: [0, 0.405, 0], scale: [0.31, 0.03, 0.31] });
    ring(b, '#9a7a4a', [0, 0.421, 0], 0.16, 0.08, [Math.PI / 2, 0, 0]);
    for (let i = 0; i < 6; i++) {
      const a = i * 1.1;
      b.add(G.sphere(6, 4), '#7aa83a', { pos: [Math.sin(a) * 0.34, 0.36 - (i % 3) * 0.04, Math.cos(a) * 0.34], scale: [0.05, 0.1, 0.05] });
    }
    for (const [x, z] of [
      [0.38, -0.12],
      [0.42, -0.02],
      [-0.4, 0.1],
    ]) {
      rod(b, '#6a8a3a', [x, 0, z], [x * 1.05, 0.5, z], 0.01, 4);
      b.add(G.cyl(8), '#6a4a2a', { pos: [x * 1.05, 0.46, z], scale: [0.02, 0.1, 0.02] });
    }
    b.add(G.sphere(10, 7), '#d8b070', { pos: [-0.32, 0.07, 0.24], scale: [0.07, 0.065, 0.07] });
    b.add(G.cone(6), '#8a9a4a', { pos: [-0.32, 0.15, 0.24], scale: [0.02, 0.06, 0.02] });
    rod(b, '#7a5a34', [0.12, 0, -0.36], [0.14, 0.95, -0.38], 0.025, 5);
    b.add(G.box(), '#a07a4a', { pos: [0.1, 0.84, -0.36], rot: [0, 0, 0.12], scale: [0.46, 0.2, 0.025] });
    for (const [x, y, w, r] of [
      [-0.04, 0.88, 0.16, 0.1],
      [0.16, 0.89, 0.14, -0.05],
      [0.02, 0.8, 0.2, 0.15],
      [0.22, 0.81, 0.1, 0.1],
    ]) {
      b.add(G.box(), '#b0201a', { pos: [x, y, -0.346], rot: [0, 0, r], scale: [w, 0.025, 0.006] });
    }
  },
  mushroom(b) {
    // The power-up mushroom: a red cap with big white spots, on a cream stalk with two eyes.
    b.add(G.taper(0.9), '#f2e2c0', { pos: [0, 0.13, 0], scale: [0.2, 0.26, 0.2] });
    for (const x of [-1, 1]) b.add(G.sphere(8, 6), '#1e1a18', { pos: [x * 0.06, 0.15, 0.182], scale: [0.022, 0.05, 0.012] });
    b.add(G.cyl(16), '#f6ecd4', { pos: [0, 0.24, 0], scale: [0.36, 0.02, 0.36] });
    const c: Vec3 = [0, 0.24, 0];
    const r: Vec3 = [0.4, 0.18, 0.4];
    b.add(G.dome(16), '#e0282a', { pos: c, scale: r });
    domeSpots(b, '#fbf8f0', c, r, 5, 0.13, 0.5, 0.25);
    b.add(G.sphere(8, 5), '#fbf8f0', { pos: [0, 0.42, 0], scale: [0.11, 0.012, 0.11] });
  },
  qblock(b) {
    // The question block: golden yellow, a rivet in each corner and a question mark on every side.
    const s = 0.46;
    b.add(G.box(), '#f2b22a', { pos: [0, 0.21, 0], scale: [s, 0.42, s] });
    b.add(G.box(), '#d8901a', { pos: [0, 0.02, 0], scale: [s + 0.004, 0.04, s + 0.004] });
    const q = ['.###.', '#...#', '....#', '...#.', '..#..', '.....', '..#..'];
    boxFaces([0, 0.21, 0], s, 0.42, s).forEach((f, k) => {
      for (const x of [-1, 1]) for (const y of [-1, 1]) b.add(G.box(), '#6a3a10', { pos: [x * 0.18, y * (k === 4 ? 0.18 : 0.16), 0.002], scale: [0.03, 0.03, 0.006] }, f);
      if (k < 4) {
        pixels(b, q, '#6a3a10', 0.042, new THREE.Matrix4().makeTranslation(0.006, -0.006, 0).premultiply(f), 0.006);
        pixels(b, q, '#fbf2dc', 0.042, new THREE.Matrix4().makeTranslation(0, 0, 0.004).premultiply(f), 0.006);
      }
    });
  },
  chocbar(b) {
    // A giant chocolate bar, its purple wrapper half off and a golden ticket peeping out.
    b.add(G.box(), '#5a3420', { pos: [0, 0.17, 0], scale: [0.68, 0.34, 0.44] });
    for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) b.add(G.rbox(0.25), '#6a4028', { pos: [-0.24 + i * 0.17, 0.375, -0.1 + j * 0.2], scale: [0.15, 0.08, 0.18] });
    b.add(G.box(), '#5a2a7a', { pos: [0.18, 0.205, 0], scale: [0.34, 0.43, 0.46] });
    b.add(G.box(), '#f2e2a0', { pos: [0.18, 0.21, 0.232], scale: [0.26, 0.1, 0.006] });
    b.add(G.box(), '#c8302a', { pos: [0.18, 0.21, 0.236], scale: [0.18, 0.04, 0.006] });
    b.add(G.box(), '#d8c070', { pos: [0.005, 0.24, 0], rot: [0, 0, 0.3], scale: [0.012, 0.46, 0.47] });
    b.add(G.box(), '#f2d24a', { pos: [0.06, 0.47, 0.06], rot: [0.2, 0.3, -0.5], scale: [0.2, 0.004, 0.11] });
  },
  tetris(b) {
    // Falling blocks, stacked three rows high, and a long one standing on end at the back.
    const c = 0.14;
    const rows = ['TTTOO', 'ZTLOO', 'ZZLLL'];
    const col: Record<string, string> = { T: '#a03ad8', O: '#f2d02a', Z: '#e2302a', L: '#f08a1a', I: '#3ad0e8' };
    rows.forEach((row, r) => {
      for (let i = 0; i < row.length; i++) {
        const x = (i - 2) * c;
        const y = (2 - r + 0.5) * c;
        b.add(G.box(), col[row[i]], { pos: [x, y, 0], scale: [c * 0.98, c * 0.98, 0.38] });
        b.add(G.box(), '#ffffff', { pos: [x - c * 0.3, y + c * 0.3, 0.19], scale: [c * 0.2, c * 0.2, 0.006] });
      }
    });
    for (let j = 0; j < 4; j++) b.add(G.box(), col.I, { pos: [0, 0.42 + (j + 0.5) * c, -0.33], scale: [c * 0.98, c * 0.98, c * 0.98] });
  },
  pokeball(b) {
    // A beanbag in the shape of a catch ball: red top, white bottom, the black band and its button.
    catchBall(b, 0.36, [0, 0.22, 0], 0.56);
    b.add(G.sphere(12, 6), '#c82420', { pos: [0, 0.405, 0], scale: [0.22, 0.02, 0.22] });
  },
  d20(b) {
    // A giant twenty-sided die resting on a face, purple with white numbers.
    const r = 0.265;
    const ico = G.ico(0);
    const pos = ico.getAttribute('position');
    const tri = (i: number) => [0, 1, 2].map((k) => new THREE.Vector3().fromBufferAttribute(pos, i * 3 + k));
    const normal = (t: THREE.Vector3[]) => t[0].clone().add(t[1]).add(t[2]).normalize();
    // Turned so a face is flat on the ground (and the opposite one flat on top).
    const turn = new THREE.Quaternion().setFromUnitVectors(normal(tri(0)), new THREE.Vector3(0, -1, 0));
    const inR = r * 0.7947;
    const m = new THREE.Matrix4().compose(new THREE.Vector3(0, inR, 0), turn, new THREE.Vector3(r, r, r));
    b.add(ico, '#6a3aa8', m);
    // Numbers on the faces round the top half, each on its face's middle.
    const labels = ['20', '8', '14', '2', '11', '17', '5'];
    let n = 0;
    for (let i = 0; i < 20 && n < labels.length; i++) {
      const t = tri(i).map((v) => v.applyMatrix4(m));
      const c = t[0].clone().add(t[1]).add(t[2]).divideScalar(3);
      const nn = new THREE.Vector3().subVectors(t[1], t[0]).cross(new THREE.Vector3().subVectors(t[2], t[0])).normalize();
      if (nn.y < 0.2 || nn.y > 0.99) continue;
      const side = new THREE.Vector3().crossVectors(up, nn).normalize();
      const upOnFace = new THREE.Vector3().crossVectors(nn, side);
      const f = new THREE.Matrix4().makeBasis(side, upOnFace, nn).setPosition(c);
      const text = labels[n++];
      const rows = ['', '', '', '', ''];
      for (const ch of text) FONT[ch].forEach((row, k) => (rows[k] += (rows[k] ? '.' : '') + row));
      pixels(b, rows, '#f6f2ff', 0.018, f, 0.004);
    }
  },
  arcadeghost(b) {
    // A red arcade ghost to sit on: wavy hem, big eyes looking sideways.
    ghostBody(b, '#e2302a', 0.3, 0.06, 0.22, 0.14);
    for (const x of [-1, 1]) {
      b.add(G.sphere(10, 8), '#f8f8ff', { pos: [x * 0.11, 0.24, 0.27], scale: [0.07, 0.09, 0.04] });
      b.add(G.sphere(8, 6), '#2a3ad8', { pos: [x * 0.11 + 0.03, 0.23, 0.302], scale: [0.035, 0.045, 0.02] });
    }
  },
  companion(b) {
    // The companion cube: grey, dark corners, a pink heart in a ring on each face.
    companionCube(b, 0.42, at([0, 0.21, 0]));
  },
  pineapple(b) {
    // An undersea pineapple: criss-crossed, a porthole at the front and tall leaves behind.
    pineappleBody(b, 0.32, 0.4);
    b.add(G.cyl(), '#d8a030', { pos: [0, 0.405, 0], scale: [0.22, 0.03, 0.22] });
    b.add(G.cyl(14), '#8ac8e8', { pos: [0, 0.2, 0.31], rot: [Math.PI / 2, 0, 0], scale: [0.07, 0.03, 0.07] });
    ring(b, '#8a9aa8', [0, 0.2, 0.32], 0.08, 0.2);
    for (let i = 0; i < 6; i++) {
      const a = -0.9 + (i / 5) * 1.8;
      b.add(G.sphere(8, 5), i % 2 ? '#3e8a3a' : '#4e9e3e', { pos: [Math.sin(a) * 0.2, 0.75 - Math.abs(a) * 0.12, -0.32 - Math.cos(a) * 0.02], rot: [-0.2, 0, -a * 0.8], scale: [0.06, 0.36, 0.025] });
    }
  },
  coffin(b) {
    // A vampire's coffin on a stone slab, lid shut but a bit of red velvet showing, brass handles, a bat at its head.
    b.add(G.box(), '#7a7670', { pos: [0, 0.05, 0], scale: [0.5, 0.1, 0.92] });
    const shape = (s: THREE.Shape) => {
      s.moveTo(-0.17, 0.46);
      s.lineTo(0.17, 0.46);
      s.lineTo(0.26, 0.24);
      s.lineTo(0.18, -0.44);
      s.lineTo(-0.18, -0.44);
      s.lineTo(-0.26, 0.24);
      s.closePath();
    };
    const body = flat('coffin', 1, shape);
    // (The shape's head, at its top, ends up at the back.)
    b.add(body, '#3a2420', { pos: [0, 0.23, 0], rot: [-Math.PI / 2, 0, 0], scale: [1, 1, 0.26] });
    b.add(body, '#a01a2a', { pos: [0, 0.37, 0], rot: [-Math.PI / 2, 0, 0], scale: [0.98, 0.98, 0.02] });
    b.add(body, '#4a2e28', { pos: [0, 0.4, 0], rot: [-Math.PI / 2, 0, 0], scale: [1.02, 1.02, 0.045] });
    for (const x of [-1, 1]) for (const z of [-0.2, 0.14]) b.add(G.box(), '#c8a040', { pos: [x * 0.235, 0.24, z], scale: [0.02, 0.025, 0.12] });
    // The bat at the head end, behind the sitter.
    const bat = at([0, 0.44, -0.4]);
    b.add(G.sphere(8, 6), '#2a2230', { pos: [0, 0.04, 0], scale: [0.04, 0.05, 0.035] }, bat);
    for (const x of [-1, 1]) {
      b.add(G.prism(), '#2a2230', { pos: [x * 0.1, 0.04, 0], rot: [0, 0, x * -0.3], scale: [0.14, 0.06, 0.012] }, bat);
      b.add(G.cone(3), '#2a2230', { pos: [x * 0.02, 0.1, 0], scale: [0.012, 0.03, 0.01] }, bat);
      b.add(G.sphere(6, 4), '#e23a3a', { pos: [x * 0.014, 0.06, 0.03], scale: 0.007 });
    }
  },
  familycouch(b) {
    // The famous cartoon family's couch, a muddy mauve, with the sailboat picture behind it.
    couch(b, '#a07892', '#8a6480', '#4a3028');
    b.add(G.box(), '#8a6a3a', { pos: [0, 1.12, -0.45], scale: [0.4, 0.26, 0.03] });
    b.add(G.box(), '#8ac0e8', { pos: [0, 1.12, -0.43], scale: [0.34, 0.2, 0.01] });
    b.add(G.box(), '#3a6a9a', { pos: [0, 1.04, -0.424], scale: [0.34, 0.05, 0.01] });
    b.add(G.prism(), '#fbfbf6', { pos: [0, 1.065, -0.42], rot: [Math.PI / 2, 0, 0], scale: [0.003, 0.012, 0.003] });
    b.add(G.cone(3), '#fbfbf6', { pos: [0.01, 1.13, -0.42], rot: [0, 0, 0], scale: [0.05, 0.12, 0.005] });
    b.add(G.box(), '#6a3a2a', { pos: [0.01, 1.07, -0.42], scale: [0.09, 0.02, 0.005] });
    rod(b, '#6a5a4a', [0, 0.78, -0.42], [0, 1.0, -0.45], 0.008, 4);
  },
  sortingstool(b) {
    // A plain old three-legged stool, and behind it on a peg, the battered talking hat with its frown.
    b.add(G.cyl(), '#8a6a44', { pos: [0, 0.39, 0], scale: [0.27, 0.06, 0.27] });
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * Math.PI * 2 + 0.5;
      rod(b, '#6e4a2a', [Math.sin(a) * 0.14, 0.37, Math.cos(a) * 0.14], [Math.sin(a) * 0.25, 0, Math.cos(a) * 0.25], 0.03);
    }
    rod(b, '#6e4a2a', [0, 0, -0.36], [0, 0.68, -0.36], 0.03, 6);
    const hat = at([0, 0.7, -0.36]);
    const brown = '#6a4e34';
    b.add(G.cyl(16), brown, { pos: [0, 0.01, 0], scale: [0.24, 0.02, 0.24] }, hat);
    b.add(G.taper(0.7, 12), brown, { pos: [0, 0.1, 0], rot: [0.1, 0, 0], scale: [0.14, 0.18, 0.14] }, hat);
    b.add(G.taper(0.55, 10), '#5e4430', { pos: [0.02, 0.25, -0.01], rot: [-0.2, 0, -0.25], scale: [0.1, 0.16, 0.1] }, hat);
    b.add(G.cone(8), brown, { pos: [0.09, 0.36, 0.0], rot: [0, 0, -1.2], scale: [0.055, 0.16, 0.055] }, hat);
    // The face in the folds: two creases for eyes and a wide mouth.
    for (const x of [-1, 1]) b.add(G.box(), '#3a2818', { pos: [x * 0.05, 0.16, 0.13], rot: [0.1, 0, x * 0.3], scale: [0.06, 0.012, 0.01] }, hat);
    b.add(G.box(), '#2a1a10', { pos: [0, 0.08, 0.145], rot: [0.1, 0, 0], scale: [0.14, 0.025, 0.01] }, hat);
    b.add(G.box(), '#a0905a', { pos: [-0.06, 0.12, 0.12], rot: [0.1, 0.3, 0.2], scale: [0.04, 0.04, 0.01] }, hat);
  },
  orangecouch(b) {
    // The coffee house's big orange couch, all velvet, with a giant mug of coffee on the arm.
    couch(b, '#d8742a', '#b85e1e', '#3a2a20');
    b.add(G.cyl(12), '#f4f0e6', { pos: [0.36, 0.6, 0.12], scale: [0.065, 0.1, 0.065] });
    b.add(G.cyl(12), '#6a3a1e', { pos: [0.36, 0.645, 0.12], scale: [0.055, 0.012, 0.055] });
    ring(b, '#f4f0e6', [0.43, 0.6, 0.12], 0.035, 0.25, [0, Math.PI / 2, 0]);
  },
  jeepseat(b) {
    // A dinosaur-park jeep's seat: a khaki tub with red and yellow stripes, a roll bar behind with the spare wheel.
    b.add(G.box(), '#8a8670', { pos: [0, 0.16, 0], scale: [0.6, 0.32, 0.5] });
    b.add(G.box(), '#c8302a', { pos: [0, 0.22, 0.003], scale: [0.605, 0.05, 0.505] });
    b.add(G.box(), '#f2c42a', { pos: [0, 0.27, 0.003], scale: [0.605, 0.03, 0.505] });
    b.add(G.rbox(0.25), '#5a5448', { pos: [0, 0.37, 0.02], scale: [0.46, 0.1, 0.42] });
    b.add(G.rbox(0.2), '#5a5448', { pos: [0, 0.68, -0.25], rot: [-0.15, 0, 0], scale: [0.44, 0.52, 0.1] });
    for (const x of [-1, 1]) rod(b, '#2a2a2e', [x * 0.32, 0.3, -0.36], [x * 0.32, 1.05, -0.36], 0.025, 6);
    rod(b, '#2a2a2e', [-0.32, 1.05, -0.36], [0.32, 1.05, -0.36], 0.025, 6);
    ring(b, '#1e1e22', [0, 0.72, -0.45], 0.19, 0.4);
    b.add(G.cyl(16), '#c8302a', { pos: [0, 0.72, -0.43], rot: [Math.PI / 2, 0, 0], scale: [0.16, 0.06, 0.16] });
    ring(b, '#f2c42a', [0, 0.72, -0.395], 0.11, 0.12);
    // A dinosaur's head in the middle of the cover.
    b.add(G.sphere(8, 6), '#1e1e22', { pos: [0, 0.73, -0.395], scale: [0.06, 0.04, 0.01] });
    b.add(G.box(), '#1e1e22', { pos: [0.04, 0.705, -0.395], rot: [0, 0, -0.2], scale: [0.07, 0.02, 0.01] });
  },
  transporter(b) {
    // A beam-me-up pad: a metal drum with a ring of lights on top, and sparkles hanging in the air above.
    b.add(G.cyl(18), '#7a7e88', { pos: [0, 0.19, 0], scale: [0.36, 0.38, 0.36] });
    b.add(G.cyl(18), '#b8bcc8', { pos: [0, 0.4, 0], scale: [0.34, 0.04, 0.34] });
    ring(b, '#5a5e68', [0, 0.42, 0], 0.34, 0.06, [Math.PI / 2, 0, 0]);
    for (let i = 0; i < 7; i++) {
      const a = (i / 6) * Math.PI * 2;
      const r = i === 6 ? 0 : 0.2;
      b.add(G.cyl(12), '#fff2b0', { pos: [Math.sin(a) * r, 0.421, Math.cos(a) * r], scale: [0.06, 0.006, 0.06] });
    }
    for (let i = 0; i < 8; i++) b.add(G.box(), '#3a3e48', { pos: [0, 0.2, 0], rot: [0, (i / 8) * Math.PI * 2, 0], scale: [0.012, 0.3, 0.725] });
    for (let i = 0; i < 9; i++) {
      const a = i * 2.39996;
      const r = 0.22 + (i % 3) * 0.05;
      b.add(G.ico(0), i % 2 ? '#d8f0ff' : '#fff6c8', { pos: [Math.sin(a) * r, 0.6 + ((i * 0.37) % 1) * 0.6, Math.cos(a) * r - 0.05], scale: [0.025, 0.045, 0.025] });
    }
  },
  policebox(b) {
    // A short blue police box: panelled sides, the black sign band round the top, and its lamp on a post behind.
    const blue = '#1f3f7a';
    b.add(G.box(), blue, { pos: [0, 0.2, 0], scale: [0.5, 0.4, 0.5] });
    b.add(G.box(), '#1a3468', { pos: [0, 0.41, 0], scale: [0.54, 0.03, 0.54] });
    for (const x of [-1, 1]) for (const z of [-1, 1]) b.add(G.box(), '#1a3468', { pos: [x * 0.25, 0.2, z * 0.25], scale: [0.05, 0.4, 0.05] });
    for (const f of boxFaces([0, 0.2, 0], 0.5, 0.4, 0.5, false)) {
      b.add(G.box(), '#121218', { pos: [0, 0.15, 0.002], scale: [0.42, 0.06, 0.006] }, f);
      b.add(G.box(), '#e8ecf2', { pos: [0, 0.15, 0.005], scale: [0.3, 0.02, 0.004] }, f);
      for (const x of [-1, 1]) {
        b.add(G.box(), '#f2f4f6', { pos: [x * 0.1, 0.05, 0.004], scale: [0.15, 0.08, 0.006] }, f);
        b.add(G.box(), '#2a4a88', { pos: [x * 0.1, -0.1, 0.004], scale: [0.15, 0.14, 0.006] }, f);
      }
    }
    rod(b, '#1a3468', [0, 0.3, -0.33], [0, 0.85, -0.33], 0.025);
    b.add(G.cyl(10), '#dfe8ff', { pos: [0, 0.9, -0.33], scale: [0.045, 0.1, 0.045] });
    b.add(G.cone(10), '#1a3468', { pos: [0, 0.97, -0.33], scale: [0.06, 0.05, 0.06] });
  },
  protonpack(b) {
    // A ghost catcher's bench: a metal seat, the pack standing behind it with its hoses and lights, the wand on the side.
    b.add(G.box(), '#5a6058', { pos: [0, 0.2, 0], scale: [0.6, 0.4, 0.42] });
    b.add(G.rbox(0.2), '#3a3e3a', { pos: [0, 0.405, 0], scale: [0.58, 0.04, 0.4] });
    const pack = at([0, 0.42, -0.36]);
    b.add(G.box(), '#2a2a2e', { pos: [0, 0.32, 0], scale: [0.46, 0.64, 0.1] }, pack);
    b.add(G.box(), '#5a5e66', { pos: [0, 0.32, -0.06], scale: [0.4, 0.6, 0.06] }, pack);
    b.add(G.cyl(16), '#3a3a40', { pos: [0, 0.12, 0.06], rot: [Math.PI / 2, 0, 0], scale: [0.17, 0.08, 0.17] }, pack);
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
      b.add(G.cyl(8), '#ff3a2a', { pos: [Math.sin(a) * 0.12, 0.12 + Math.cos(a) * 0.12, 0.1], rot: [Math.PI / 2, 0, 0], scale: [0.03, 0.02, 0.03] }, pack);
    }
    b.add(G.box(), '#9aa0a8', { pos: [0.12, 0.48, 0.06], scale: [0.14, 0.2, 0.04] }, pack);
    b.add(G.box(), '#2ad86a', { pos: [0.08, 0.52, 0.082], scale: [0.03, 0.03, 0.006] }, pack);
    b.add(G.box(), '#f2c42a', { pos: [0.15, 0.52, 0.082], scale: [0.03, 0.03, 0.006] }, pack);
    b.add(G.cyl(10), '#9aa0a8', { pos: [-0.12, 0.5, 0.06], scale: [0.05, 0.22, 0.05] }, pack);
    for (let i = 0; i < 5; i++) b.add(G.torus(0.35, 5, 10), '#2a2a2e', { pos: [-0.2, 0.42 - i * 0.07, 0.1], rot: [Math.PI / 2, 0, 0], scale: 0.035 }, pack);
    // The wand, hung on the side.
    b.add(G.box(), '#2a2a2e', { pos: [0.33, 0.3, 0.02], scale: [0.05, 0.08, 0.3] });
    b.add(G.cyl(8), '#9aa0a8', { pos: [0.33, 0.31, 0.2], rot: [Math.PI / 2, 0, 0], scale: [0.02, 0.12, 0.02] });
    b.add(G.box(), '#d8302a', { pos: [0.33, 0.33, -0.05], scale: [0.04, 0.03, 0.06] });
  },
  falcon(b) {
    // A smuggler's cockpit seat: a padded beige seat on a battered grey saucer with two prongs at the front, the
    // round cockpit off to one side and a little dish.
    const grey = '#b8b8b0';
    b.add(G.cyl(20), grey, { pos: [0, 0.06, 0], scale: [0.44, 0.12, 0.44] });
    b.add(G.taper(0.7, 20), '#a8a8a0', { pos: [0, 0.15, 0], scale: [0.4, 0.06, 0.4] });
    for (const x of [-1, 1]) b.add(G.box(), grey, { pos: [x * 0.12, 0.08, 0.5], scale: [0.14, 0.08, 0.3] });
    b.add(G.box(), '#8a8a84', { pos: [0, 0.08, 0.5], scale: [0.1, 0.06, 0.16] });
    for (let i = 0; i < 6; i++) b.add(G.box(), '#8a8a84', { pos: [0, 0.122, 0], rot: [0, (i / 6) * Math.PI, 0], scale: [0.86, 0.004, 0.02] });
    b.add(G.cyl(10), grey, { pos: [0.42, 0.14, 0.2], rot: [Math.PI / 2, 0, 0], scale: [0.06, 0.26, 0.06] });
    b.add(G.dome(10), '#3a4a5a', { pos: [0.42, 0.14, 0.33], rot: [Math.PI / 2, 0, 0], scale: [0.06, 0.04, 0.06] });
    b.add(G.dome(10), '#9a9a94', { pos: [-0.24, 0.3, -0.2], rot: [Math.PI, 0, 0], scale: [0.1, 0.05, 0.1] });
    rod(b, '#8a8a84', [-0.24, 0.15, -0.2], [-0.24, 0.26, -0.2], 0.012, 4);
    b.add(G.cyl(8), '#5a5a58', { pos: [0, 0.26, 0], scale: [0.08, 0.2, 0.08] });
    b.add(G.rbox(0.3), '#d8c8a0', { pos: [0, 0.38, 0.02], scale: [0.44, 0.08, 0.4] });
    b.add(G.rbox(0.25), '#d8c8a0', { pos: [0, 0.66, -0.28], rot: [-0.15, 0, 0], scale: [0.42, 0.5, 0.08] });
    for (const y of [0.56, 0.72]) b.add(G.box(), '#b8a880', { pos: [0, y, -0.233 - (y - 0.56) * 0.15], rot: [-0.15, 0, 0], scale: [0.38, 0.01, 0.01] });
  },
  lightcycle(b) {
    // A light cycle: a sleek black shell between two wheels, glowing blue lines along it.
    const black = '#18181e';
    const glow = '#5ae8ff';
    for (const z of [-0.36, 0.36]) {
      b.add(G.cyl(16), black, { pos: [0, 0.2, z], rot: [0, 0, Math.PI / 2], scale: [0.2, 0.14, 0.2] });
      ring(b, glow, [0, 0.2, z], 0.17, 0.06, [0, Math.PI / 2, 0]);
      b.add(G.cyl(12), '#3a3a44', { pos: [0, 0.2, z], rot: [0, 0, Math.PI / 2], scale: [0.08, 0.15, 0.08] });
    }
    b.add(G.sphere(16, 8), black, { pos: [0, 0.3, 0], scale: [0.17, 0.14, 0.54] });
    b.add(G.rbox(0.3), '#24242c', { pos: [0, 0.385, -0.02], scale: [0.26, 0.07, 0.36] });
    for (const x of [-1, 1]) {
      b.add(G.box(), glow, { pos: [x * 0.16, 0.3, 0], rot: [0, 0, x * 0.4], scale: [0.006, 0.02, 0.8] });
      b.add(G.box(), glow, { pos: [x * 0.135, 0.37, 0.02], scale: [0.006, 0.012, 0.36] });
    }
    b.add(G.sphere(12, 6), '#1e3a48', { pos: [0, 0.42, 0.3], rot: [-0.3, 0, 0], scale: [0.1, 0.06, 0.18] });
  },
  timecar(b) {
    // A time machine's seat: a brushed steel tub, a black bucket seat, a gull-wing door raised at the side, and the
    // glowing Y of its time circuits on the bulkhead behind.
    const steel = '#b8bcc0';
    b.add(G.box(), steel, { pos: [0, 0.15, 0], scale: [0.62, 0.3, 0.5] });
    for (let i = 0; i < 5; i++) b.add(G.box(), '#9a9ea4', { pos: [0, 0.04 + i * 0.05, 0.252], scale: [0.6, 0.004, 0.004] });
    b.add(G.rbox(0.25), '#2a2a2e', { pos: [0, 0.37, 0.02], scale: [0.44, 0.1, 0.42] });
    for (const x of [-1, 1]) b.add(G.rbox(0.25), '#2a2a2e', { pos: [x * 0.2, 0.42, 0.02], scale: [0.06, 0.08, 0.4] });
    b.add(G.rbox(0.2), '#2a2a2e', { pos: [0, 0.68, -0.27], rot: [-0.15, 0, 0], scale: [0.44, 0.52, 0.08] });
    b.add(G.box(), steel, { pos: [0, 0.6, -0.4], scale: [0.62, 0.6, 0.06] });
    const y0 = 0.72;
    b.add(G.box(), '#3a3a40', { pos: [0, y0, -0.36], scale: [0.26, 0.26, 0.04] });
    for (const a of [-Math.PI / 3, Math.PI / 3, Math.PI]) {
      b.add(G.box(), '#fff6b0', { pos: [Math.sin(a) * 0.05, y0 + Math.cos(a) * 0.05, -0.338], rot: [0, 0, -a], scale: [0.025, 0.1, 0.006] });
    }
    // The door, swung up like a wing.
    const door = at([0.31, 0.32, 0], [0, 0, 1.2]);
    b.add(G.box(), steel, { pos: [0, 0.22, 0], scale: [0.02, 0.44, 0.48] }, door);
    b.add(G.box(), '#2a3a48', { pos: [0.012, 0.32, 0], scale: [0.006, 0.18, 0.36] }, door);
    for (let i = 0; i < 5; i++) b.add(G.box(), '#2a2a2e', { pos: [0, 0.36 + i * 0.04, -0.41], scale: [0.4, 0.015, 0.03] });
  },
  command(b) {
    // A starship captain's chair: a round pedestal, a black seat and back in a grey shell, arms with button panels.
    const grey = '#8a8e96';
    b.add(G.cyl(18), '#3a3e46', { pos: [0, 0.03, 0], scale: [0.32, 0.06, 0.32] });
    b.add(G.taper(0.6, 14), grey, { pos: [0, 0.18, 0], scale: [0.14, 0.26, 0.14] });
    b.add(G.box(), grey, { pos: [0, 0.32, 0], scale: [0.56, 0.06, 0.48] });
    b.add(G.rbox(0.3), '#24242a', { pos: [0, 0.38, 0.01], scale: [0.48, 0.08, 0.44] });
    b.add(G.box(), grey, { pos: [0, 0.68, -0.31], rot: [-0.12, 0, 0], scale: [0.56, 0.68, 0.06] });
    b.add(G.rbox(0.25), '#24242a', { pos: [0, 0.68, -0.27], rot: [-0.12, 0, 0], scale: [0.46, 0.6, 0.06] });
    const btn = ['#e2302a', '#f2c42a', '#2ad86a', '#3a8af0', '#f2f2f2'];
    for (const x of [-1, 1]) {
      b.add(G.box(), grey, { pos: [x * 0.31, 0.48, 0.0], scale: [0.08, 0.26, 0.44] });
      b.add(G.box(), '#3a3e46', { pos: [x * 0.33, 0.62, 0.04], rot: [0.1, 0, 0], scale: [0.14, 0.04, 0.44] });
      for (let i = 0; i < 5; i++) b.add(G.box(), btn[(i + (x > 0 ? 2 : 0)) % 5], { pos: [x * 0.33 + (i % 2 ? 0.03 : -0.03), 0.646, 0.14 - i * 0.045], rot: [0.1, 0, 0], scale: [0.04, 0.012, 0.03] });
    }
  },
  oscar(b) {
    // A black plinth with a gold rim to sit on, and behind it the golden statuette, arms crossed on his sword.
    const gold = '#e8c048';
    b.add(G.cyl(18), '#1e1e22', { pos: [0, 0.19, 0], scale: [0.3, 0.38, 0.3] });
    b.add(G.cyl(18), gold, { pos: [0, 0.4, 0], scale: [0.31, 0.04, 0.31] });
    b.add(G.cyl(18), '#1e1e22', { pos: [0, 0.03, 0], scale: [0.33, 0.06, 0.33] });
    b.add(G.cyl(14), '#1e1e22', { pos: [0, 0.32, -0.36], scale: [0.1, 0.64, 0.1] });
    b.add(G.cyl(14), gold, { pos: [0, 0.665, -0.36], scale: [0.08, 0.05, 0.08] });
    const s = at([0, 0.69, -0.36]);
    b.add(G.taper(1.4, 10), gold, { pos: [0, 0.2, 0], scale: [0.045, 0.4, 0.045] }, s);
    b.add(G.sphere(10, 8), gold, { pos: [0, 0.38, 0], scale: [0.075, 0.06, 0.05] }, s);
    b.add(G.sphere(10, 8), gold, { pos: [0, 0.46, 0], scale: 0.04 }, s);
    b.add(G.box(), gold, { pos: [0, 0.32, 0.04], scale: [0.12, 0.03, 0.03] }, s);
    rod(b, '#c8a030', [0, 0.04 + 0.69, -0.32], [0, 0.34 + 0.69, -0.32], 0.012, 4);
  },
  catbus(b) {
    // A cat bus seat: a long furry stripy body with lots of little legs, a big grinning head at one end and a tail.
    const fur = '#c8903a';
    b.add(G.rbox(0.35), fur, { pos: [0, 0.27, 0], scale: [0.78, 0.3, 0.46] });
    b.add(G.rbox(0.35), '#d8a858', { pos: [0, 0.39, 0.0], scale: [0.6, 0.06, 0.36] });
    for (let i = 0; i < 4; i++) {
      const x = -0.27 + i * 0.18;
      for (const z of [-0.15, 0.15]) b.add(G.taper(0.6, 6), '#a87028', { pos: [x, 0.07, z], scale: [0.045, 0.14, 0.045] });
      b.add(G.box(), '#8a5a20', { pos: [x - 0.04, 0.3, 0.232], rot: [0, 0, 0.3], scale: [0.03, 0.14, 0.006] });
    }
    const head = at([0.42, 0.5, 0.04]);
    b.add(G.sphere(14, 10), fur, { scale: [0.2, 0.18, 0.2] }, head);
    for (const z of [-1, 1]) b.add(G.cone(4), fur, { pos: [0.03, 0.19, z * 0.1], rot: [z * -0.3, 0, 0], scale: [0.05, 0.12, 0.05] }, head);
    for (const z of [-1, 1]) {
      b.add(G.sphere(10, 8), '#ffe060', { pos: [0.12, 0.06, z * 0.09 + 0.06], scale: [0.06, 0.06, 0.05] }, head);
      b.add(G.sphere(6, 4), '#2a2018', { pos: [0.165, 0.06, z * 0.09 + 0.08], scale: [0.02, 0.03, 0.02] }, head);
    }
    // The grin, as wide as the face.
    b.add(G.sphere(12, 6), '#fbf8f0', { pos: [0.11, -0.06, 0.08], rot: [0, -0.5, 0], scale: [0.08, 0.035, 0.14] }, head);
    b.add(G.box(), '#3a2418', { pos: [0.13, -0.035, 0.09], rot: [0, -0.5, 0], scale: [0.006, 0.006, 0.24] }, head);
    rod(b, fur, [-0.38, 0.32, 0], [-0.46, 0.62, -0.1], 0.05, 6);
    b.add(G.sphere(8, 6), '#d8a858', { pos: [-0.46, 0.64, -0.1], scale: 0.06 });
  },
  gauntlet(b) {
    // A golden gauntlet, palm up to sit in, fingers curling up behind, and six coloured stones set in it.
    const gold = '#e2b23a';
    const deep = '#c08a24';
    b.add(G.taper(1.15, 14), deep, { pos: [0, 0.16, 0], scale: [0.2, 0.32, 0.2] });
    b.add(G.rbox(0.3), gold, { pos: [0, 0.37, 0], scale: [0.52, 0.1, 0.46] });
    const stones = ['#a050e8', '#3a7af0', '#e2302a', '#f08a1a', '#2ab84a', '#f2d82a'];
    b.add(G.sphere(10, 8), stones[5], { pos: [0, 0.2, 0.2], scale: [0.05, 0.06, 0.03] });
    for (let i = 0; i < 4; i++) {
      const x = -0.18 + i * 0.12;
      const h = i === 1 || i === 2 ? 0.34 : 0.28;
      b.add(G.cyl(10), gold, { pos: [x, 0.42 + h / 2, -0.26], rot: [0.12, 0, 0], scale: [0.05, h, 0.05] });
      b.add(G.cyl(10), deep, { pos: [x, 0.42 + h + 0.08, -0.22], rot: [0.7, 0, 0], scale: [0.045, 0.18, 0.045] });
      b.add(G.sphere(8, 6), deep, { pos: [x, 0.43, -0.27], scale: 0.06 });
      b.add(G.sphere(8, 6), stones[i], { pos: [x, 0.48, -0.32], scale: [0.03, 0.035, 0.02] });
    }
    rod(b, gold, [0.26, 0.38, 0.04], [0.36, 0.58, 0.02], 0.05, 10);
    b.add(G.sphere(8, 6), stones[4], { pos: [0.33, 0.48, 0.07], scale: [0.025, 0.03, 0.02] });
  },
  swordthrone(b) {
    // A throne of a thousand swords: a dark iron seat and back, blades fanning out behind with their hilts sticking out.
    const iron = '#3c3e44';
    const blade = '#a8aeb8';
    const hilt = '#6a5434';
    b.add(G.box(), '#2e3034', { pos: [0, 0.04, -0.04], scale: [0.78, 0.08, 0.66] });
    b.add(G.box(), iron, { pos: [0, 0.22, 0], scale: [0.62, 0.32, 0.52] });
    b.add(G.box(), '#4a4c52', { pos: [0, 0.4, 0.01], scale: [0.58, 0.04, 0.5] });
    b.add(G.box(), iron, { pos: [0, 0.8, -0.32], scale: [0.6, 0.86, 0.1] });
    const sword = (from: Vec3, dir: Vec3, len: number) => {
      const d = new THREE.Vector3(...dir).normalize();
      const q = new THREE.Quaternion().setFromUnitVectors(up, d);
      const m = new THREE.Matrix4().compose(new THREE.Vector3(...from), q, new THREE.Vector3(1, 1, 1));
      b.add(G.box(), blade, { pos: [0, len / 2, 0], scale: [0.045, len, 0.012] }, m);
      b.add(G.cone(4), blade, { pos: [0, -0.03, 0], rot: [Math.PI, Math.PI / 4, 0], scale: [0.032, 0.06, 0.009] }, m);
      b.add(G.box(), hilt, { pos: [0, len, 0], scale: [0.12, 0.02, 0.025] }, m);
      b.add(G.box(), hilt, { pos: [0, len + 0.05, 0], scale: [0.022, 0.09, 0.022] }, m);
    };
    for (let i = 0; i < 15; i++) {
      const a = -1.05 + (i / 14) * 2.1;
      const len = 0.36 + ((i * 0.37) % 1) * 0.22 + (1 - Math.abs(a) / 1.05) * 0.3;
      sword([Math.sin(a) * 0.15, 0.9 + Math.cos(a) * 0.1, -0.38 - (i % 2) * 0.03], [Math.sin(a), Math.cos(a), -0.2], len);
    }
    for (const x of [-1, 1]) {
      b.add(G.box(), iron, { pos: [x * 0.32, 0.5, -0.02], scale: [0.08, 0.2, 0.5] });
      for (let i = 0; i < 3; i++) sword([x * (0.3 + i * 0.015), 0.56 + i * 0.03, -0.1 + i * 0.07], [x * 0.25, 0.1 + i * 0.05, 1], 0.24 + i * 0.03);
      sword([x * 0.3, 0.3, 0.1], [x * 1, -0.2, 0.3], 0.2);
    }
  },
};

// ---------------------------------------------------------------- the gravestones

const rock = '#8a8680';

export const POP_GRAVE_PAINT: Record<PopGraveId, GraveDesign> = {
  blockgrave: {
    // A blocky mossy stone, and a wooden sign on a stick in front with the name on it.
    paint(b) {
      const s = 0.48;
      const px = s / 8;
      b.add(G.box(), '#8a8a8a', { pos: [0, s / 2, -0.12], scale: s });
      boxFaces([0, s / 2, -0.12], s, s, s).forEach((f, k) => {
        for (let i = 0; i < 14; i++) {
          const x = ((i * 3 + k * 5) % 8) - 3.5;
          const y = ((i * 5 + k) % 8) - 3.5;
          b.add(G.box(), i % 3 === 0 ? '#5a8a3a' : i % 2 ? '#6e6e6e' : '#a0a0a0', { pos: [x * px, y * px, 0.002], scale: [px, px, 0.006] }, f);
        }
      });
      b.add(G.box(), '#a07a4a', { pos: [0, 0.22, 0.2], scale: [0.04, 0.44, 0.04] });
      b.add(G.box(), '#b08a52', { pos: [0, 0.56, 0.2], scale: [0.52, 0.28, 0.04] });
    },
    plate: { y: 0.56, z: 0.222, w: 0.48, h: 0.24, bg: '#b08a52', fg: '#2a1a0a' },
  },
  volleyball: {
    // A castaway's volleyball with a face painted in a red hand, on the sand in front of a driftwood plank.
    paint(b) {
      b.add(G.sphere(12, 6), '#e2d0a0', { pos: [0, 0, 0.05], scale: [0.42, 0.08, 0.42] });
      b.add(G.box(), '#b8a07a', { pos: [0, 0.42, -0.12], rot: [-0.05, 0, 0.04], scale: [0.5, 0.84, 0.06] });
      b.add(G.box(), '#9a8462', { pos: [0, 0.82, -0.12], rot: [-0.05, 0, 0.04], scale: [0.52, 0.06, 0.07] });
      const c: Vec3 = [0.08, 0.2, 0.18];
      b.add(G.sphere(16, 12), '#f6f2e8', { pos: c, scale: 0.19 });
      for (const r of [0, Math.PI / 2]) ring(b, '#b8b0a0', c, 0.191, 0.03, [r, 0.4, 0]);
      const face = at([c[0], c[1] + 0.02, c[2] + 0.185]);
      b.add(G.sphere(8, 6), '#c8202a', { pos: [0, -0.02, 0], scale: [0.06, 0.06, 0.012] }, face);
      for (let i = 0; i < 4; i++) b.add(G.box(), '#c8202a', { pos: [-0.045 + i * 0.03, 0.06, -0.004], rot: [0, 0, (i - 1.5) * 0.15], scale: [0.02, 0.07, 0.012] }, face);
      b.add(G.box(), '#c8202a', { pos: [0.07, -0.02, -0.006], rot: [0, 0, -0.9], scale: [0.02, 0.06, 0.012] }, face);
    },
    plate: { y: 0.6, z: -0.085, w: 0.44, h: 0.24, bg: '#b8a07a', fg: '#3a2a18', roll: 0.04 },
  },
  tblock: {
    // A falling T-block come to rest upside down: three purple squares and one on top.
    paint(b) {
      const c = 0.24;
      const purple = '#a03ad8';
      for (const [x, y] of [
        [-1, 0],
        [0, 0],
        [1, 0],
        [0, 1],
      ]) {
        b.add(G.box(), purple, { pos: [x * c, (y + 0.5) * c, 0], scale: c * 0.98 });
        b.add(G.box(), '#c06af0', { pos: [x * c, (y + 0.5) * c + c * 0.47, 0], scale: [c * 0.8, 0.008, c * 0.8] });
        b.add(G.box(), '#7a28a8', { pos: [x * c + c * 0.47, (y + 0.5) * c, 0], scale: [0.008, c * 0.8, c * 0.8] });
      }
      b.add(G.box(), '#c06af0', { pos: [0, 1.5 * c, c / 2 + 0.002], scale: [c * 0.7, c * 0.7, 0.006] });
    },
    plate: { y: 0.12, z: 0.124, w: 0.66, h: 0.17, bg: '#a03ad8', fg: '#ffffff' },
  },
  orangehood: {
    // An orange parka zipped right up: the hood, a dark fur-rimmed hole with two eyes in it, mittens, drawstrings.
    paint(b) {
      const orange = '#f08a2a';
      plaque(b, '#8a8680', 0.36);
      b.add(G.taper(0.75, 14), orange, { pos: [0, 0.2, 0], scale: [0.24, 0.4, 0.2] });
      b.add(G.sphere(14, 10), orange, { pos: [0, 0.56, 0], scale: [0.25, 0.24, 0.22] });
      b.add(G.sphere(12, 8), '#6a4a2a', { pos: [0, 0.55, 0.15], scale: [0.14, 0.15, 0.08] });
      b.add(G.sphere(12, 8), '#f2d0a8', { pos: [0, 0.55, 0.17], scale: [0.1, 0.1, 0.06] });
      for (const x of [-1, 1]) {
        b.add(G.sphere(8, 6), '#ffffff', { pos: [x * 0.035, 0.57, 0.222], scale: [0.03, 0.035, 0.01] });
        b.add(G.sphere(6, 4), '#1e1e1e', { pos: [x * 0.03, 0.57, 0.23], scale: 0.01 });
        b.add(G.sphere(8, 6), '#5a3a1a', { pos: [x * 0.22, 0.12, 0.08], scale: [0.06, 0.07, 0.06] });
        rod(b, '#4a3420', [x * 0.04, 0.42, 0.21], [x * 0.05, 0.32, 0.2], 0.008, 4);
      }
      b.add(G.box(), '#c86a1a', { pos: [0, 0.22, 0.17], rot: [0.25, 0, 0], scale: [0.008, 0.34, 0.01] });
    },
    plate: plateOf('#8a8680', 0.36, '#1e1c1a'),
  },
  blueghost: {
    // A frightened arcade ghost, gone blue, with a wobbly mouth.
    paint(b) {
      plaque(b, '#2a3ad8', 0.34);
      ghostBody(b, '#2a46e8', 0.26, 0.08, 0.36, 0.26);
      for (const x of [-1, 1]) b.add(G.box(), '#f4d0a8', { pos: [x * 0.08, 0.56, 0.255], scale: [0.05, 0.05, 0.012] });
      for (let i = 0; i < 6; i++) b.add(G.box(), '#f4d0a8', { pos: [-0.125 + i * 0.05, 0.4 + (i % 2) * 0.03, 0.257], scale: [0.04, 0.02, 0.01] });
    },
    plate: plateOf('#2a3ad8', 0.34, '#ffffff'),
  },
  pirateflag: {
    // A pirate flag on a pole, skull and crossbones over the name, and a red X on the ground where they're buried.
    paint(b) {
      rod(b, '#6a4a2e', [-0.34, 0, 0], [-0.34, 1.36, 0], 0.025, 6);
      b.add(G.sphere(6, 4), '#c8a040', { pos: [-0.34, 1.38, 0], scale: 0.03 });
      b.add(G.box(), '#1a1a1e', { pos: [0, 1.06, 0], scale: [0.64, 0.58, 0.02] });
      const bone = '#f2ece0';
      b.add(G.sphere(10, 8), bone, { pos: [0, 1.24, 0.012], scale: [0.07, 0.065, 0.015] });
      b.add(G.box(), bone, { pos: [0, 1.18, 0.012], scale: [0.06, 0.03, 0.012] });
      for (const s of [-1, 1]) b.add(G.box(), bone, { pos: [0, 1.22, 0.008], rot: [0, 0, s * 0.6], scale: [0.26, 0.022, 0.01] });
      for (const x of [-1, 1]) b.add(G.sphere(6, 4), '#1a1a1e', { pos: [x * 0.025, 1.25, 0.025], scale: [0.018, 0.02, 0.008] });
      for (const s of [-1, 1]) b.add(G.box(), '#c8202a', { pos: [0, 0.008, 0.3], rot: [0, s * 0.7, 0], scale: [0.36, 0.012, 0.05] });
      b.add(G.sphere(10, 6), '#7a5a3a', { pos: [0, 0, 0.3], scale: [0.3, 0.06, 0.22] });
    },
    plate: { y: 0.95, z: 0.061, w: 0.56, h: 0.2, bg: '#1a1a1e', fg: '#f2ece0' },
  },
  catchball: {
    // A big catch ball on a stone base.
    paint(b) {
      b.add(G.box(), rock, { pos: [0, 0.11, 0], scale: [0.6, 0.22, 0.42] });
      catchBall(b, 0.3, [0, 0.5, -0.02]);
    },
    plate: { y: 0.11, z: 0.212, w: 0.54, h: 0.17, bg: rock, fg: '#1e1c1a' },
  },
  pipe: {
    // A green warp pipe rising out of a brick block.
    paint(b) {
      const green = '#2aa83a';
      b.add(G.box(), '#b8682a', { pos: [0, 0.12, 0.02], scale: [0.7, 0.24, 0.56] });
      for (const y of [0.06, 0.18]) b.add(G.box(), '#6a3a18', { pos: [0, y, 0.02], scale: [0.704, 0.008, 0.564] });
      b.add(G.cyl(16), green, { pos: [0, 0.48, -0.02], scale: [0.22, 0.5, 0.22] });
      b.add(G.cyl(16), green, { pos: [0, 0.8, -0.02], scale: [0.28, 0.16, 0.28] });
      b.add(G.cyl(16), '#0e2a12', { pos: [0, 0.881, -0.02], scale: [0.22, 0.004, 0.22] });
      b.add(G.box(), '#7ae88a', { pos: [-0.12, 0.48, 0.17], rot: [0, -0.6, 0], scale: [0.04, 0.48, 0.01] });
      b.add(G.box(), '#7ae88a', { pos: [-0.15, 0.8, 0.23], rot: [0, -0.6, 0], scale: [0.05, 0.14, 0.01] });
    },
    plate: { y: 0.12, z: 0.302, w: 0.62, h: 0.18, bg: '#b8682a', fg: '#2a1408' },
  },
  cubegrave: {
    // A companion cube, a little sunk and leaning, on a step with the name.
    paint(b) {
      b.add(G.box(), rock, { pos: [0, 0.07, 0.04], scale: [0.62, 0.14, 0.5] });
      companionCube(b, 0.46, at([0, 0.36, -0.04], [0, 0.25, 0.08]));
    },
    plate: { y: 0.07, z: 0.292, w: 0.56, h: 0.12, bg: rock, fg: '#1e1c1a' },
  },
  gameover: {
    // An arcade cabinet: the name on its screen, GAME OVER lit up on the marquee, a joystick and buttons.
    paint(b, glow) {
      const body = '#2a2a44';
      b.add(G.box(), body, { pos: [0, 0.6, -0.06], scale: [0.5, 1.2, 0.4] });
      for (const x of [-1, 1]) {
        b.add(G.box(), '#e83a9a', { pos: [x * 0.252, 0.6, -0.06], scale: [0.004, 1.1, 0.06] });
        b.add(G.box(), '#3ad0e8', { pos: [x * 0.252, 0.4, -0.06], rot: [0.5, 0, 0], scale: [0.004, 0.4, 0.05] });
      }
      b.add(G.box(), '#121218', { pos: [0, 0.8, 0.14], rot: [-0.15, 0, 0], scale: [0.44, 0.34, 0.02] });
      b.add(G.box(), '#121220', { pos: [0, 1.1, 0.15], scale: [0.48, 0.14, 0.02] });
      pixelText(glow, 'GAME OVER', '#ffd23a', 0.011, at([0, 1.1, 0.162]));
      b.add(G.box(), '#3a3a5a', { pos: [0, 0.55, 0.2], rot: [0.35, 0, 0], scale: [0.5, 0.06, 0.2] });
      rod(b, '#1e1e1e', [-0.1, 0.58, 0.22], [-0.1, 0.66, 0.24], 0.01, 4);
      b.add(G.sphere(8, 6), '#e2302a', { pos: [-0.1, 0.67, 0.24], scale: 0.03 });
      for (const [x, c] of [
        [0.05, '#f2c42a'],
        [0.12, '#2a8af0'],
        [0.19, '#2ad86a'],
      ] as const) {
        b.add(G.cyl(8), c, { pos: [x, 0.59, 0.22], rot: [0.35, 0, 0], scale: [0.02, 0.02, 0.02] });
      }
      b.add(G.box(), '#1a1a2a', { pos: [0, 0.25, 0.142], scale: [0.2, 0.16, 0.01] });
      for (const x of [-0.04, 0.04]) b.add(G.box(), '#f08a1a', { pos: [x, 0.27, 0.148], scale: [0.025, 0.04, 0.004] });
    },
    plate: { y: 0.8, z: 0.2, w: 0.38, h: 0.28, bg: '#101418', fg: '#6af06a', tilt: 0.15 },
  },
  noghost: {
    // A no-ghosts sign: a little white ghost in a red ring with a bar across, on a post with the name below.
    paint(b) {
      b.add(G.box(), '#6a6e74', { pos: [0, 0.6, -0.04], scale: [0.05, 1.2, 0.05] });
      b.add(G.box(), '#f2f2ee', { pos: [0, 0.48, 0], scale: [0.48, 0.2, 0.03] });
      const c = at([0, 1.0, 0]);
      b.add(G.cyl(20), '#f8f8f6', { rot: [Math.PI / 2, 0, 0], scale: [0.27, 0.02, 0.27] }, c);
      b.add(G.torus(0.14, 6, 24), '#d8202a', { pos: [0, 0, 0.012], scale: [0.26, 0.26, 0.15] }, c);
      const g = at([0, 0, 0.014]).premultiply(c);
      b.add(G.sphere(10, 8), '#e8eef8', { pos: [0, 0.04, 0], scale: [0.09, 0.1, 0.01] }, g);
      b.add(G.box(), '#e8eef8', { pos: [0, -0.06, 0], scale: [0.18, 0.14, 0.01] }, g);
      for (const x of [-1, 1]) b.add(G.sphere(6, 4), '#1e1e24', { pos: [x * 0.035, 0.05, 0.006], scale: [0.018, 0.026, 0.006] }, g);
      b.add(G.sphere(6, 4), '#1e1e24', { pos: [0, -0.01, 0.006], scale: [0.025, 0.02, 0.006] }, g);
      b.add(G.box(), '#d8202a', { pos: [0, 0, 0.03], rot: [0, 0, -Math.PI / 4], scale: [0.5, 0.06, 0.01] }, c);
    },
    plate: { y: 0.48, z: 0.016, w: 0.44, h: 0.17, bg: '#f2f2ee', fg: '#b8202a' },
  },
  purpleshorts: {
    // A plain stone with a pair of torn purple shorts draped over it, and a big green hand gripping one side.
    paint(b) {
      const s = '#9a968e';
      b.add(G.box(), s, { pos: [0, 0.38, 0], scale: [0.6, 0.76, 0.16] });
      b.add(G.cyl(20), s, { pos: [0, 0.76, 0], rot: [Math.PI / 2, 0, 0], scale: [0.3, 0.16, 0.3] });
      const purple = '#7a3aa8';
      b.add(G.box(), purple, { pos: [0, 0.98, 0], rot: [0, 0, 0.08], scale: [0.38, 0.08, 0.2] });
      for (const z of [-1, 1]) {
        for (const x of [-1, 1]) b.add(G.box(), purple, { pos: [x * 0.09, 0.88, z * 0.1], rot: [z * 0.12, 0, x * 0.1], scale: [0.16, 0.2, 0.025] });
        for (let i = 0; i < 5; i++) b.add(G.cone(3), purple, { pos: [-0.16 + i * 0.08, 0.76, z * 0.11], rot: [Math.PI, 0, 0], scale: [0.03, 0.05, 0.01] });
      }
      const green = '#4aa83a';
      for (let i = 0; i < 4; i++) rod(b, green, [0.33, 0.5 + i * 0.07, -0.1], [0.27, 0.5 + i * 0.07, 0.1], 0.03, 6);
      b.add(G.sphere(10, 8), green, { pos: [0.37, 0.58, -0.06], scale: [0.07, 0.16, 0.1] });
    },
    plate: { y: 0.4, z: 0.081, w: 0.48, h: 0.26, bg: '#9a968e', fg: '#262420' },
  },
  pumpkinking: {
    // A dark spiral hill curling up at the top, and a jack-o'-lantern at its foot with a glowing face.
    paint(b, glow) {
      plaque(b, '#5a5660', 0.38);
      const dark = '#2a2834';
      // The hill climbs from the ground on the right, then rolls over into a curl that winds in on itself.
      const pts: Vec3[] = [
        [0.42, 0.02, -0.1],
        [0.3, 0.2, -0.1],
      ];
      for (let i = 0; i <= 24; i++) {
        const u = i / 24;
        const a = -0.6 + u * Math.PI * 2.6;
        const r = 0.28 * (1 - u * 0.8);
        pts.push([0.0 + Math.cos(a) * r, 0.68 + Math.sin(a) * r, -0.1]);
      }
      pts.forEach((p, i) => i && rod(b, dark, pts[i - 1], p, 0.06 * (1 - (i / pts.length) * 0.65), 6));
      b.add(G.dome(10), dark, { pos: [0.4, 0, -0.1], scale: [0.18, 0.16, 0.14] });
      const c: Vec3 = [-0.2, 0.13, 0.12];
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        b.add(G.sphere(10, 6), i % 2 ? '#e8822a' : '#de7420', { pos: [c[0] + Math.sin(a) * 0.07, c[1], c[2] + Math.cos(a) * 0.07], rot: [0, a, 0], scale: [0.08, 0.12, 0.1] });
      }
      b.add(G.cyl(6), '#5a7a2a', { pos: [c[0], c[1] + 0.13, c[2]], scale: [0.015, 0.06, 0.015] });
      const face = at([c[0], c[1], c[2] + 0.17]);
      for (const x of [-1, 1]) glow.add(G.cone(3), '#ffd84a', { pos: [x * 0.04, 0.03, 0], rot: [Math.PI / 2, 0, 0], scale: [0.025, 0.01, 0.025] }, face);
      glow.add(G.box(), '#ffd84a', { pos: [0, -0.04, 0], scale: [0.1, 0.02, 0.01] }, face);
    },
    plate: plateOf('#5a5660', 0.38, '#f2ece0'),
  },
  excalibur: {
    // A sword in a big stone, waiting to be pulled out.
    paint(b) {
      plaque(b, '#7a766e', 0.36);
      b.add(G.blob(2), '#8e8a82', { pos: [0, 0.18, -0.04], scale: [0.4, 0.3, 0.3] });
      b.add(G.box(), '#9a968e', { pos: [0, 0.36, -0.04], scale: [0.5, 0.16, 0.36] });
      b.add(G.box(), '#c8ccd2', { pos: [0, 0.56, -0.04], scale: [0.06, 0.3, 0.012] });
      b.add(G.box(), '#c8a040', { pos: [0, 0.72, -0.04], scale: [0.3, 0.035, 0.04] });
      b.add(G.cyl(8), '#5a3a20', { pos: [0, 0.82, -0.04], scale: [0.022, 0.16, 0.022] });
      b.add(G.sphere(8, 6), '#c8a040', { pos: [0, 0.92, -0.04], scale: 0.035 });
      b.add(G.sphere(6, 4), '#3a8af0', { pos: [0, 0.72, -0.016], scale: [0.02, 0.02, 0.008] });
    },
    plate: plateOf('#7a766e', 0.36, '#1e1c1a'),
  },
  staff: {
    // A wizard's staff struck into a narrow stone bridge, its crystal shining.
    paint(b, glow) {
      b.add(G.box(), '#6a6670', { pos: [0, 0.12, 0], scale: [0.86, 0.24, 0.4] });
      b.add(G.box(), '#5a5660', { pos: [0, 0.02, 0], scale: [0.6, 0.04, 0.38] });
      for (const x of [-0.2, 0.25]) b.add(G.box(), '#3a3640', { pos: [x, 0.243, 0.05], rot: [0, x * 3, 0], scale: [0.18, 0.004, 0.012] });
      rod(b, '#8a8a8e', [0.02, 0.24, -0.04], [-0.02, 1.2, -0.06], 0.025, 6);
      rod(b, '#8a8a8e', [-0.02, 1.2, -0.06], [0.06, 1.3, -0.06], 0.022, 6);
      rod(b, '#8a8a8e', [0.06, 1.3, -0.06], [0.1, 1.22, -0.06], 0.02, 6);
      glow.add(G.ico(0), '#f4faff', { pos: [0.03, 1.21, -0.06], scale: [0.06, 0.1, 0.06] });
    },
    plate: { y: 0.12, z: 0.202, w: 0.76, h: 0.18, bg: '#6a6670', fg: '#f2f2f6' },
  },
  triforce: {
    // A grey-blue stone with three golden triangles in a triangle on it.
    paint(b) {
      const s = '#8a92a0';
      b.add(G.box(), '#7a8290', { pos: [0, 0.06, 0], scale: [0.7, 0.12, 0.3] });
      b.add(G.box(), s, { pos: [0, 0.52, 0], scale: [0.6, 0.84, 0.16] });
      b.add(G.prism(), s, { pos: [0, 0.94, 0], rot: [0, Math.PI / 2, 0], scale: [0.16, 0.22, 0.6] });
      const r = 0.105;
      const a = Math.sqrt(3) * r;
      const h = 1.5 * r;
      for (const [x, y] of [
        [-a / 2, 0],
        [a / 2, 0],
        [0, h],
      ]) {
        b.add(G.cyl(3), '#e8c040', { pos: [x, 0.62 + y, 0.09], rot: [-Math.PI / 2, 0, 0], scale: [r, 0.02, r] });
      }
    },
    plate: { y: 0.33, z: 0.081, w: 0.52, h: 0.2, bg: '#8a92a0', fg: '#1e2430' },
  },
  llama: {
    // A loot llama on a plinth: purple and blue with stripy fringes and a pink saddle, looking at you.
    paint(b) {
      b.add(G.box(), rock, { pos: [0, 0.1, 0], scale: [0.7, 0.2, 0.36] });
      const blue = '#6a7ae8';
      const purple = '#9a5ad8';
      b.add(G.rbox(0.3), blue, { pos: [-0.04, 0.48, 0], scale: [0.46, 0.22, 0.24] });
      for (const x of [-0.2, 0.12]) for (const z of [-0.08, 0.08]) b.add(G.box(), purple, { pos: [x, 0.29, z], scale: [0.06, 0.2, 0.06] });
      b.add(G.box(), blue, { pos: [0.18, 0.7, 0], rot: [0, 0, -0.15], scale: [0.12, 0.34, 0.12] });
      b.add(G.rbox(0.3), purple, { pos: [0.24, 0.86, 0.03], scale: [0.16, 0.12, 0.14] });
      for (const z of [-1, 1]) b.add(G.box(), blue, { pos: [0.2, 0.96, z * 0.04], rot: [z * 0.2, 0, 0], scale: [0.03, 0.1, 0.03] });
      for (const z of [-1, 1]) b.add(G.sphere(6, 4), '#1e1e2a', { pos: [0.26, 0.88, 0.03 + z * 0.04 + 0.04], scale: 0.016 });
      b.add(G.box(), '#f26ab8', { pos: [-0.06, 0.6, 0], scale: [0.22, 0.03, 0.26] });
      for (const [y, c] of [
        [0.42, '#f2d02a'],
        [0.38, '#f26ab8'],
        [0.34, '#5ad8f0'],
      ] as const) {
        b.add(G.box(), c, { pos: [-0.04, y, 0], scale: [0.47, 0.03, 0.25] });
      }
    },
    plate: { y: 0.1, z: 0.182, w: 0.62, h: 0.16, bg: rock, fg: '#1e1c1a' },
  },
  pineapplehouse: {
    // An undersea pineapple house: a round-topped door, two porthole windows, leaves on top.
    paint(b) {
      plaque(b, '#c8a86a', 0.42);
      pineappleBody(b, 0.3, 0.8);
      for (let i = 0; i < 7; i++) {
        const a = (i / 7) * Math.PI * 2;
        b.add(G.sphere(8, 5), i % 2 ? '#3e8a3a' : '#5aa848', { pos: [Math.sin(a) * 0.1, 0.98, Math.cos(a) * 0.1], rot: [Math.cos(a) * 0.5, 0, -Math.sin(a) * 0.5], scale: [0.05, 0.24, 0.025] });
      }
      const door = flat('archdoor', 0.03, (s) => {
        s.moveTo(-1, 0);
        s.lineTo(1, 0);
        s.lineTo(1, 1);
        s.absarc(0, 1, 1, 0, Math.PI, false);
        s.closePath();
      }, 10);
      b.add(door, '#3a7a8a', { pos: [0, 0.02, 0.27], scale: [0.09, 0.14, 1] });
      for (const [x, y] of [
        [-0.17, 0.5],
        [0.14, 0.62],
      ]) {
        const z = Math.sqrt(Math.max(0, 0.3 * 0.3 - x * x)) + 0.01;
        const a = Math.asin(x / 0.3);
        b.add(G.cyl(12), '#8ac8e8', { pos: [x, y, z], rot: [Math.PI / 2, 0, -a], scale: [0.06, 0.02, 0.06] });
        ring(b, '#8a9aa8', [x, y, z + 0.005], 0.065, 0.2, [0, a, 0]);
      }
    },
    plate: plateOf('#c8a86a', 0.42, '#3a2410'),
  },
  priderock: {
    // Pride rock: a heap of rock with its long flat ledge jutting out and up, and a little lion on the end of it.
    paint(b) {
      const r = '#a08a6a';
      b.add(G.blob(1), r, { pos: [-0.12, 0.2, -0.12], scale: [0.36, 0.3, 0.3] });
      b.add(G.blob(3), '#8e7a5c', { pos: [-0.22, 0.42, -0.16], scale: [0.18, 0.26, 0.18] });
      b.add(G.box(), '#9a8464', { pos: [0, 0.12, 0.19], rot: [-0.1, 0, 0], scale: [0.5, 0.24, 0.06] });
      // The ledge: a long slab rising out to the right, thick at the root and thinning to its tip.
      const ledge = at([-0.12, 0.42, -0.08], [0, -0.35, 0.32]);
      b.add(G.box(), '#b09a78', { pos: [0.3, 0, 0], scale: [0.62, 0.06, 0.2] }, ledge);
      b.add(G.prism(), r, { pos: [0.24, -0.03, 0], rot: [Math.PI, 0, 0], scale: [0.5, 0.2, 0.18] }, ledge);
      const lion = at([0.5, 0.06, 0], [0, 0.35, -0.32]).premultiply(ledge);
      b.add(G.sphere(8, 6), '#d8a050', { pos: [0, 0.05, 0], scale: [0.08, 0.045, 0.04] }, lion);
      for (const x of [-0.05, 0.05]) b.add(G.box(), '#d8a050', { pos: [x, 0.02, 0], scale: [0.02, 0.05, 0.05] }, lion);
      b.add(G.sphere(8, 6), '#8a4a20', { pos: [0.07, 0.1, 0], scale: [0.045, 0.05, 0.045] }, lion);
      b.add(G.sphere(8, 6), '#e2b060', { pos: [0.09, 0.1, 0], scale: [0.03, 0.03, 0.028] }, lion);
      rod(b, '#d8a050', [-0.08, 0.06, 0], [-0.12, 0.1, 0], 0.008, 4);
    },
    plate: { y: 0.13, z: 0.226, w: 0.44, h: 0.18, bg: '#9a8464', fg: '#2a1e10', tilt: -0.1 },
  },
  idol: {
    // A golden idol on a temple pedestal, and the bag of sand somebody meant to swap it for.
    paint(b) {
      const stone = '#8a7a5a';
      b.add(G.box(), '#7a6a4a', { pos: [0, 0.05, 0], scale: [0.56, 0.1, 0.46] });
      b.add(G.box(), stone, { pos: [0, 0.32, 0], scale: [0.44, 0.48, 0.36] });
      b.add(G.box(), '#9a8a68', { pos: [0, 0.58, 0], scale: [0.5, 0.06, 0.42] });
      const gold = '#e2b23a';
      b.add(G.taper(1.3, 10), gold, { pos: [0, 0.7, 0], scale: [0.08, 0.18, 0.07] });
      b.add(G.sphere(12, 8), gold, { pos: [0, 0.86, 0], scale: [0.1, 0.1, 0.09] });
      for (const x of [-1, 1]) {
        b.add(G.sphere(6, 4), '#7a5a1a', { pos: [x * 0.035, 0.88, 0.082], scale: [0.02, 0.012, 0.008] });
        b.add(G.sphere(8, 6), gold, { pos: [x * 0.1, 0.86, 0], scale: [0.025, 0.04, 0.025] });
        b.add(G.sphere(8, 6), gold, { pos: [x * 0.06, 0.66, 0.04], scale: [0.03, 0.04, 0.04] });
      }
      b.add(G.box(), '#7a5a1a', { pos: [0, 0.83, 0.088], scale: [0.05, 0.008, 0.006] });
      b.add(G.sphere(10, 6), '#c8b080', { pos: [0.4, 0.08, 0.1], scale: [0.08, 0.08, 0.07] });
      b.add(G.cone(6), '#c8b080', { pos: [0.4, 0.17, 0.1], scale: [0.03, 0.06, 0.03] });
    },
    plate: { y: 0.33, z: 0.182, w: 0.38, h: 0.2, bg: '#8a7a5a', fg: '#2a2010' },
  },
  witchlegs: {
    // A little farmhouse fallen out of the sky, and the stripy legs and ruby slippers sticking out from under it.
    paint(b) {
      const lean = new THREE.Matrix4().makeRotationZ(0.12);
      b.add(G.box(), '#c8b08a', { pos: [0, 0.3, -0.1], scale: [0.64, 0.5, 0.5] }, lean);
      b.add(G.prism(), '#8a4a3a', { pos: [0, 0.55, -0.1], scale: [0.7, 0.3, 0.58] }, lean);
      b.add(G.box(), '#6a4a34', { pos: [0.2, 0.28, 0.152], scale: [0.12, 0.26, 0.01] }, lean);
      b.add(G.box(), '#a8d0e0', { pos: [-0.2, 0.4, 0.152], scale: [0.1, 0.1, 0.01] }, lean);
      b.add(G.box(), '#7a7a7a', { pos: [0.18, 0.78, -0.2], scale: [0.08, 0.16, 0.08] }, lean);
      for (const x of [-1, 1]) {
        const lx = x * 0.07 - 0.04;
        for (let i = 0; i < 5; i++) b.add(G.cyl(8), i % 2 ? '#f6f2ec' : '#d8202a', { pos: [lx, 0.035, 0.18 + i * 0.05], rot: [Math.PI / 2, 0, 0], scale: [0.025, 0.05, 0.025] });
        b.add(G.sphere(8, 6), '#c81838', { pos: [lx, 0.04, 0.46], scale: [0.035, 0.03, 0.05] });
        b.add(G.sphere(6, 4), '#ff6a8a', { pos: [lx, 0.07, 0.46], scale: 0.012 });
      }
    },
    plate: { y: 0.24, z: 0.152, w: 0.26, h: 0.14, bg: '#c8b08a', fg: '#3a2410', roll: 0.12 },
  },
  amber: {
    // A chunk of glowing amber on a black cane-top stand, a mosquito caught in it.
    paint(b, glow) {
      b.add(G.box(), '#1e1e22', { pos: [0, 0.1, 0], scale: [0.48, 0.2, 0.36] });
      b.add(G.cyl(10), '#2a2a2e', { pos: [0, 0.38, 0], scale: [0.04, 0.4, 0.04] });
      b.add(G.cyl(10), '#c8a040', { pos: [0, 0.58, 0], scale: [0.07, 0.04, 0.07] });
      glow.add(G.dodeca(), '#f0a030', { pos: [0, 0.82, 0], rot: [0.3, 0.4, 0], scale: [0.22, 0.26, 0.19] });
      const m = at([0, 0.84, 0.2]);
      b.add(G.sphere(6, 4), '#3a2010', { pos: [0, 0, 0], scale: [0.01, 0.04, 0.01] }, m);
      b.add(G.sphere(6, 4), '#3a2010', { pos: [0, 0.045, 0], scale: 0.012 }, m);
      for (let i = 0; i < 3; i++) for (const x of [-1, 1]) b.add(G.box(), '#3a2010', { pos: [x * 0.025, 0.01 - i * 0.015, 0], rot: [0, 0, x * (0.6 - i * 0.5)], scale: [0.05, 0.004, 0.004] }, m);
      for (const x of [-1, 1]) b.add(G.box(), '#8a6a4a', { pos: [x * 0.02, 0.025, 0.004], rot: [0, 0, x * 0.5], scale: [0.03, 0.012, 0.002] }, m);
    },
    plate: { y: 0.1, z: 0.182, w: 0.44, h: 0.16, bg: '#1e1e22', fg: '#f0c060' },
  },
  hobbitdoor: {
    // A round green door in a grassy hillside, brass knob in the middle, a round window and some flowers.
    paint(b) {
      plaque(b, '#a07a4a', 0.44);
      b.add(G.dome(18), '#5a9a3a', { pos: [0, 0, -0.14], scale: [0.56, 0.62, 0.4] });
      ring(b, '#9a8a6a', [0, 0.28, 0.2], 0.24, 0.12);
      b.add(G.cyl(18), '#2a7a3a', { pos: [0, 0.28, 0.2], rot: [Math.PI / 2, 0, 0], scale: [0.23, 0.03, 0.23] });
      b.add(G.sphere(8, 6), '#e2b23a', { pos: [0, 0.28, 0.225], scale: 0.025 });
      for (let i = 0; i < 6; i++) b.add(G.box(), '#24683a', { pos: [0, 0.28, 0.217], rot: [0, 0, (i / 6) * Math.PI], scale: [0.44, 0.006, 0.004] });
      b.add(G.cyl(12), '#a8d0e0', { pos: [0.36, 0.34, 0.06], rot: [Math.PI / 2, 0.8, 0], scale: [0.07, 0.02, 0.07] });
      ring(b, '#6a4a2a', [0.365, 0.34, 0.065], 0.075, 0.2, [0, 0.8, 0]);
      for (const [x, c] of [
        [-0.32, '#f2c42a'],
        [-0.26, '#e2302a'],
        [0.28, '#f2f2f2'],
      ] as const) {
        b.add(G.sphere(6, 4), c, { pos: [x, 0.05, 0.22], scale: 0.03 });
      }
    },
    plate: plateOf('#a07a4a', 0.44, '#2a1a0a'),
  },
  lasersword: {
    // A rock with a laser sword stuck in it, its blade shining.
    paint(b, glow) {
      plaque(b, '#5a5660', 0.36);
      b.add(G.dodeca(), '#6a6670', { pos: [0, 0.16, -0.04], scale: [0.34, 0.22, 0.28] });
      const m = at([0.02, 0.32, -0.04], [0, 0, -0.18]);
      b.add(G.cyl(10), '#c8ccd2', { pos: [0, 0.04, 0], scale: [0.032, 0.18, 0.032] }, m);
      for (let i = 0; i < 4; i++) b.add(G.cyl(10), '#1e1e22', { pos: [0, 0.0 + i * 0.03, 0], scale: [0.035, 0.012, 0.035] }, m);
      b.add(G.cyl(10), '#8a8e96', { pos: [0, 0.14, 0], scale: [0.04, 0.03, 0.04] }, m);
      glow.add(G.cyl(10), '#9be7ff', { pos: [0, 0.52, 0], scale: [0.03, 0.74, 0.03] }, m);
      glow.add(G.sphere(10, 6), '#d8f8ff', { pos: [0, 0.89, 0], scale: 0.03 }, m);
    },
    plate: plateOf('#5a5660', 0.36, '#d8f4ff'),
  },
  thumbsup: {
    // A steel arm sinking into a pool of molten metal, thumb up, the pool glowing.
    paint(b, glow) {
      b.add(G.torus(0.25, 6, 20), '#3a3634', { pos: [0, 0.03, -0.02], rot: [Math.PI / 2, 0, 0], scale: [0.4, 0.4, 0.2] });
      glow.add(G.cyl(20), '#ff8a20', { pos: [0, 0.03, -0.02], scale: [0.38, 0.03, 0.38] });
      for (const [x, z, r] of [
        [0.12, 0.1, 0.08],
        [-0.15, -0.12, 0.06],
        [-0.05, 0.16, 0.05],
      ]) {
        glow.add(G.sphere(8, 4), '#ffd25a', { pos: [x, 0.04, z], scale: [r, 0.012, r] });
      }
      const steel = '#a8acb4';
      rod(b, steel, [0, 0.02, -0.04], [0.02, 0.5, -0.02], 0.065, 10);
      b.add(G.rbox(0.3), steel, { pos: [0.02, 0.57, -0.02], scale: [0.14, 0.13, 0.12] });
      for (let i = 0; i < 4; i++) b.add(G.box(), '#7a7e86', { pos: [0.02, 0.53 + i * 0.03, 0.04], scale: [0.12, 0.004, 0.004] });
      b.add(G.rbox(0.3), steel, { pos: [0.03, 0.7, -0.02], rot: [0, 0, -0.1], scale: [0.05, 0.14, 0.05] });
      glow.add(G.sphere(8, 6), '#ff6a2a', { pos: [0.02, 0.07, -0.02], scale: [0.1, 0.03, 0.1] });
      plaque(b, '#5a5452', 0.48);
    },
    plate: plateOf('#5a5452', 0.48, '#f2c8a0'),
  },
  pepperpot: {
    // A pepper-pot robot: bronze skirt dotted with domes, a sucker arm and a gun stick, a dome head with an eye stalk.
    paint(b, glow) {
      plaque(b, '#4a4a4e', 0.44);
      const bronze = '#a8763a';
      b.add(G.box(), '#2a2a2e', { pos: [0, 0.04, 0], scale: [0.62, 0.08, 0.6] });
      b.add(G.taper(0.62, 8), bronze, { pos: [0, 0.32, 0], rot: [0, Math.PI / 8, 0], scale: [0.3, 0.48, 0.3] });
      for (let i = 0; i < 6; i++) {
        const a = -Math.PI / 2 + (i / 5) * Math.PI;
        for (let j = 0; j < 3; j++) {
          const y = 0.16 + j * 0.13;
          const r = 0.27 - (y - 0.08) * 0.24 + 0.005;
          b.add(G.sphere(8, 5), '#d8a050', { pos: [Math.sin(a) * r, y, Math.cos(a) * r], scale: 0.035 });
        }
      }
      b.add(G.cyl(14), '#6a5030', { pos: [0, 0.6, 0], scale: [0.2, 0.08, 0.2] });
      b.add(G.cyl(8), '#c8c8cc', { pos: [-0.09, 0.6, 0.27], rot: [Math.PI / 2, 0, 0], scale: [0.015, 0.2, 0.015] });
      b.add(G.dome(10), '#1e1e22', { pos: [-0.09, 0.6, 0.38], rot: [-Math.PI / 2, 0, 0], scale: [0.05, 0.025, 0.05] });
      b.add(G.cyl(6), '#3a3a3e', { pos: [0.09, 0.6, 0.25], rot: [Math.PI / 2, 0, 0], scale: [0.01, 0.16, 0.01] });
      for (let i = 0; i < 3; i++) b.add(G.cyl(14), i % 2 ? '#3a3a3e' : '#9a9aa0', { pos: [0, 0.67 + i * 0.03, 0], scale: [0.17 - i * 0.005, 0.025, 0.17 - i * 0.005] });
      b.add(G.dome(14), '#9a9aa0', { pos: [0, 0.75, 0], scale: [0.16, 0.15, 0.16] });
      rod(b, '#3a3a3e', [0, 0.8, 0.12], [0, 0.82, 0.26], 0.01, 4);
      b.add(G.cyl(10), '#3a6ae8', { pos: [0, 0.82, 0.27], rot: [Math.PI / 2, 0, 0], scale: [0.025, 0.01, 0.025] });
      for (const x of [-1, 1]) glow.add(G.cyl(8), '#ffe880', { pos: [x * 0.1, 0.9, 0], rot: [0, 0, x * -0.5], scale: [0.02, 0.05, 0.02] });
    },
    plate: plateOf('#4a4a4e', 0.44, '#f2e2a0'),
  },
  onering: {
    // A plain gold ring standing on a plinth of black volcanic rock, cracks in the rock glowing.
    paint(b, glow) {
      const r = '#3a3434';
      b.add(G.box(), r, { pos: [0, 0.24, 0], scale: [0.46, 0.48, 0.36] });
      b.add(G.box(), '#2a2626', { pos: [0, 0.05, 0], scale: [0.54, 0.1, 0.44] });
      b.add(G.cyl(14), '#4a4444', { pos: [0, 0.5, 0], scale: [0.12, 0.04, 0.12] });
      b.add(G.torus(0.14, 8, 24), '#f2c440', { pos: [0, 0.72, 0], scale: 0.18 });
      for (const [x, y, a] of [
        [-0.17, 0.42, 0.8],
        [0.15, 0.4, -0.6],
        [0.2, 0.22, 0.2],
      ]) {
        glow.add(G.box(), '#ff7a20', { pos: [x, y, 0.181], rot: [0, 0, a], scale: [0.09, 0.008, 0.004] });
      }
      glow.add(G.torus(0.04, 4, 24), '#ffb040', { pos: [0, 0.72, 0.02], scale: 0.18 });
    },
    plate: { y: 0.27, z: 0.181, w: 0.4, h: 0.2, bg: '#3a3434', fg: '#f0c060' },
  },
  darkhelm: {
    // A dark lord's black helmet on a plinth: the dome and flared back, the masked face with its grille.
    paint(b) {
      const black = '#18181c';
      b.add(G.box(), '#3a3a40', { pos: [0, 0.2, 0], scale: [0.48, 0.4, 0.38] });
      b.add(G.box(), '#2a2a30', { pos: [0, 0.42, 0], scale: [0.52, 0.04, 0.42] });
      b.add(G.taper(0.62, 14), black, { pos: [0, 0.56, -0.04], scale: [0.27, 0.24, 0.25] });
      b.add(G.sphere(14, 10), black, { pos: [0, 0.7, -0.03], scale: [0.2, 0.2, 0.21] });
      b.add(G.box(), black, { pos: [0, 0.74, 0.14], rot: [0.35, 0, 0], scale: [0.3, 0.05, 0.1] });
      // The mask: grey-black, two big angled eyes, a nose ridge, the triangular grille and its flared chin.
      const mask = '#34343c';
      b.add(G.box(), mask, { pos: [0, 0.6, 0.17], rot: [0.1, 0, 0], scale: [0.24, 0.2, 0.08] });
      for (const x of [-1, 1]) {
        b.add(G.box(), '#0c0c10', { pos: [x * 0.06, 0.66, 0.215], rot: [0.1, x * 0.15, x * -0.25], scale: [0.1, 0.055, 0.02] });
        b.add(G.box(), '#8a8a9a', { pos: [x * 0.06 - 0.02, 0.672, 0.226], rot: [0.1, 0, x * -0.25], scale: [0.02, 0.008, 0.004] });
        b.add(G.box(), mask, { pos: [x * 0.1, 0.5, 0.18], rot: [0.2, 0, x * 0.5], scale: [0.08, 0.05, 0.06] });
      }
      b.add(G.box(), mask, { pos: [0, 0.64, 0.22], rot: [0.1, 0, 0], scale: [0.025, 0.08, 0.02] });
      b.add(G.cone(3), '#9a9aa4', { pos: [0, 0.54, 0.215], rot: [Math.PI, 0, 0], scale: [0.075, 0.1, 0.02] });
      for (let i = 0; i < 3; i++) b.add(G.box(), '#1e1e22', { pos: [-0.02 + i * 0.02, 0.555, 0.226], scale: [0.006, 0.05, 0.004] });
    },
    plate: { y: 0.2, z: 0.192, w: 0.42, h: 0.18, bg: '#3a3a40', fg: '#e8e8f0' },
  },
  deathstar: {
    // A battle moon on a stand: grey, the trench round its middle and the big dish in its upper half.
    paint(b) {
      b.add(G.box(), '#2a2a30', { pos: [0, 0.1, 0], scale: [0.5, 0.2, 0.4] });
      b.add(G.taper(0.5, 10), '#3a3a40', { pos: [0, 0.27, 0], scale: [0.08, 0.16, 0.08] });
      const c: Vec3 = [0, 0.66, -0.02];
      b.add(G.sphere(18, 12), '#9a9ea6', { pos: c, scale: 0.32 });
      b.add(G.cyl(24), '#4a4e56', { pos: c, scale: [0.322, 0.025, 0.322] });
      const n = new THREE.Vector3(0.45, 0.5, 0.74).normalize();
      const q = new THREE.Quaternion().setFromUnitVectors(up, n);
      const d = new THREE.Vector3(...c).addScaledVector(n, 0.3);
      b.add(G.cyl(16), '#6a6e76', new THREE.Matrix4().compose(d, q, new THREE.Vector3(0.1, 0.03, 0.1)));
      b.add(G.dome(12), '#7a7e86', new THREE.Matrix4().compose(d.clone().addScaledVector(n, -0.005), q.clone().multiply(new THREE.Quaternion().setFromAxisAngle(X, Math.PI)), new THREE.Vector3(0.08, 0.02, 0.08)));
      b.add(G.sphere(6, 4), '#3a3e46', new THREE.Matrix4().compose(d.clone().addScaledVector(n, 0.012), q, new THREE.Vector3(0.015, 0.015, 0.015)));
      for (let i = 0; i < 10; i++) {
        const a = i * 2.39996;
        const y = ((i * 0.37) % 1) * 1.4 - 0.7;
        const r = Math.sqrt(1 - y * y);
        const p = new THREE.Vector3(Math.sin(a) * r, y, Math.cos(a) * r);
        const qq = new THREE.Quaternion().setFromUnitVectors(up, p);
        b.add(G.box(), '#82868e', new THREE.Matrix4().compose(p.multiplyScalar(0.322).add(new THREE.Vector3(...c)), qq, new THREE.Vector3(0.06, 0.006, 0.03)));
      }
    },
    plate: { y: 0.1, z: 0.202, w: 0.44, h: 0.16, bg: '#2a2a30', fg: '#d8dce4' },
  },
  phonebox: {
    // A blue police box: panelled walls, frosted windows that glow at night, the sign over the door, a lamp on top.
    paint(b, glow) {
      const blue = '#1f3f7a';
      const deep = '#1a3468';
      b.add(G.box(), deep, { pos: [0, 0.03, 0], scale: [0.62, 0.06, 0.62] });
      b.add(G.box(), blue, { pos: [0, 0.6, 0], scale: [0.52, 1.1, 0.52] });
      for (const x of [-1, 1]) for (const z of [-1, 1]) b.add(G.box(), deep, { pos: [x * 0.27, 0.62, z * 0.27], scale: [0.07, 1.16, 0.07] });
      b.add(G.box(), deep, { pos: [0, 1.22, 0], scale: [0.6, 0.06, 0.6] });
      b.add(G.box(), deep, { pos: [0, 1.28, 0], scale: [0.48, 0.06, 0.48] });
      b.add(G.cyl(10), '#2a2a30', { pos: [0, 1.33, 0], scale: [0.05, 0.04, 0.05] });
      glow.add(G.cyl(10), '#eaf2ff', { pos: [0, 1.39, 0], scale: [0.04, 0.09, 0.04] });
      b.add(G.cone(10), deep, { pos: [0, 1.46, 0], scale: [0.05, 0.05, 0.05] });
      for (const f of boxFaces([0, 0.6, 0], 0.52, 1.1, 0.52, false)) {
        b.add(G.box(), '#121218', { pos: [0, 0.52, 0.004], scale: [0.48, 0.09, 0.008] }, f);
        b.add(G.box(), deep, { pos: [0, 0.0, 0.003], scale: [0.02, 1.0, 0.006] }, f);
        for (const x of [-1, 1]) {
          for (const r of [0, 1, 2]) b.add(G.box(), '#2a4a88', { pos: [x * 0.115, -0.38 + r * 0.22, 0.003], scale: [0.18, 0.18, 0.006] }, f);
          for (const c of [-1, 0, 1]) for (const r of [-1, 1]) glow.add(G.box(), '#f2f4ee', { pos: [x * 0.115 + c * 0.055, 0.3 + r * 0.04, 0.006], scale: [0.045, 0.035, 0.004] }, f);
        }
      }
      b.add(G.box(), '#f2f2ee', { pos: [-0.115, 0.08, 0.265], scale: [0.12, 0.12, 0.006] });
    },
    plate: { y: 1.12, z: 0.268, w: 0.46, h: 0.085, bg: '#121218', fg: '#f2f4f6' },
  },
};
