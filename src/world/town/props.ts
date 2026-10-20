import * as THREE from 'three';
import { Paint, shade, pick } from './kit';

/** Small reusable pieces of scenery, painted into a builder at a local origin. */

export const WOOD = '#9a6a43';
export const WOOD_DARK = '#6e4a30';
export const WOOD_LIGHT = '#c49a6c';
export const IRON = '#3b3a44';
export const STONE = '#b9ad9c';
export const STONE_DARK = '#8f8577';

const LEAF_GREENS = ['#6fae4f', '#5f9e47', '#7dbb57', '#4f8f45', '#8cc463'];
const AUTUMN = ['#e0913a', '#d2683a', '#e8b33f'];
const PINE_GREENS = ['#3f7d4f', '#356f47', '#4a8a57'];

export function roundTree(p: Paint, r: () => number, autumn = false, detail = true) {
  const trunkH = 1.4 + r() * 0.8;
  const bark = shade(WOOD_DARK, (r() - 0.5) * 0.06);
  p.taper(bark, 0.7, 0.22, trunkH, 0, 0, 0, detail ? 10 : 7);
  // Roots flaring out at the foot, and a couple of branch stubs under the crown.
  if (detail) {
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 + r();
      p.rod(bark, 0.07, Math.cos(a) * 0.12, 0.18, Math.sin(a) * 0.12, Math.cos(a) * 0.36, 0.0, Math.sin(a) * 0.36, 6);
    }
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * Math.PI * 2 + r() * 1.5;
      p.rod(bark, 0.06, 0, trunkH - 0.25, 0, Math.cos(a) * 0.7, trunkH + 0.45, Math.sin(a) * 0.7, 6);
    }
  }
  const green = autumn ? pick(r, AUTUMN) : pick(r, LEAF_GREENS);
  const blobs = (detail ? 3 : 2) + Math.floor(r() * 3);
  for (let i = 0; i < blobs; i++) {
    const a = r() * Math.PI * 2;
    const d = i === 0 ? 0 : 0.5 + r() * 0.45;
    const size = (i === 0 ? 1.25 : 0.75 + r() * 0.35) * (0.9 + r() * 0.2);
    const c = shade(green, (r() - 0.5) * 0.12);
    const y = trunkH + 0.7 + (i === 0 ? 0.3 : r() * 0.6);
    if (detail) p.blob(c, size, Math.cos(a) * d, y, Math.sin(a) * d, Math.floor(r() * 6), 0.9, r() * 3, r() * 3, true);
    else p.blob(c, size, Math.cos(a) * d, y, Math.sin(a) * d, Math.floor(r() * 6), 0.9, r() * 3);
  }
  // A few apples or blossoms on some trees.
  if (!autumn && r() < 0.3) {
    const fruit = pick(r, ['#e4553f', '#f2a7b8', '#f6d55c']);
    for (let i = 0; i < 6; i++) {
      const a = r() * Math.PI * 2;
      p.ico(fruit, 0.09, Math.cos(a) * 1.1, trunkH + 0.5 + r() * 0.9, Math.sin(a) * 1.1, 1);
    }
  }
}

export function pineTree(p: Paint, r: () => number, detail = true) {
  const green = pick(r, PINE_GREENS);
  p.taper(WOOD_DARK, 0.75, 0.18, 1.1, 0, 0, 0, 8);
  const tiers = 3 + Math.floor(r() * 2);
  for (let i = 0; i < tiers; i++) {
    const rad = 1.5 - i * 0.32;
    const y = 0.8 + i * 0.85;
    const c = shade(green, i * 0.03 + (r() - 0.5) * 0.04);
    // Each tier is a cone with a darker, slightly wider skirt under it, so the boughs read as layers.
    if (detail) p.cone(shade(c, -0.08), rad * 1.05, 0.45, 0, y, 0, 10, r() * 3);
    p.cone(c, rad, 1.5, 0, y + 0.1, 0, 10, r() * 3);
  }
  // A few cones hanging on the lower boughs.
  for (let i = 0; i < (detail ? 3 : 0); i++) {
    const a = r() * Math.PI * 2;
    p.ico('#7a5236', 0.07, Math.cos(a) * 1.05, 1.1 + r() * 0.5, Math.sin(a) * 1.05, 0, 1.6);
  }
}

export function bush(p: Paint, r: () => number, flowers = false, detail = true) {
  const green = pick(r, LEAF_GREENS);
  const n = 2 + Math.floor(r() * (detail ? 3 : 2));
  for (let i = 0; i < n; i++) {
    const a = r() * Math.PI * 2;
    const c = shade(green, (r() - 0.5) * 0.1);
    p.blob(c, 0.45 + r() * 0.25, Math.cos(a) * 0.35, 0.35, Math.sin(a) * 0.35, Math.floor(r() * 6), 0.8, r() * 3, 0, detail);
  }
  if (flowers) {
    const c = pick(r, ['#f2a7b8', '#f6d55c', '#ffffff', '#b494dd', '#e4553f']);
    for (let i = 0; i < 7; i++) {
      const a = r() * Math.PI * 2;
      p.ico(c, 0.075, Math.cos(a) * 0.55, 0.45 + r() * 0.35, Math.sin(a) * 0.55, 0);
    }
  } else if (r() < 0.3) {
    for (let i = 0; i < 5; i++) {
      const a = r() * Math.PI * 2;
      p.ico('#c0392b', 0.04, Math.cos(a) * 0.58, 0.4 + r() * 0.3, Math.sin(a) * 0.58, 0);
    }
  }
}

export function rock(p: Paint, r: () => number, size = 1) {
  const c = shade(pick(r, ['#a49d93', '#b5ada2', '#948d84']), (r() - 0.5) * 0.06);
  p.blob(c, 0.5 * size, 0, 0.15 * size, 0, Math.floor(r() * 6), 0.6, r() * 3);
  if (r() < 0.5) p.blob(shade(c, 0.05), 0.3 * size, 0.45 * size, 0.08 * size, 0.2 * size, Math.floor(r() * 6), 0.6, r() * 3);
  // A patch of moss on the shady side.
  if (r() < 0.5) p.blob('#5f9e47', 0.22 * size, -0.2 * size, 0.3 * size, 0.1 * size, Math.floor(r() * 6), 0.4, r() * 3);
}

/** One flower: a stem, a leaf, a ring of petals and a centre. */
export function flowerStem(p: Paint, r: () => number, x: number, z: number, color: string, h = 0.26) {
  p.post('#5f9e47', 0.014, h, x, 0, z, 4);
  p.box('#6fae4f', 0.07, 0.01, 0.035, x + 0.04, h * 0.45, z, 0, r(), 0.3);
  // Five petals as one flat star, with a round middle.
  p.cyl(shade(color, (r() - 0.5) * 0.08), 0.055, 0.012, x, h + 0.01, z, 5, 0, r() * 2, 0);
  p.ico('#f6d04d', 0.024, x, h + 0.03, z, 0);
}

export function flowerPatch(p: Paint, r: () => number) {
  const colors = ['#f2a7b8', '#f6d55c', '#ffffff', '#b494dd', '#ff9a62', '#8fc1e8'];
  const c = pick(r, colors);
  for (let i = 0; i < 4; i++) {
    const x = (r() - 0.5) * 1.2;
    const z = (r() - 0.5) * 1.2;
    flowerStem(p, r, x, z, c, 0.2 + r() * 0.12);
  }
  // Grass about the stems.
  for (let i = 0; i < 3; i++) p.cone('#7dbb57', 0.04, 0.18 + r() * 0.1, (r() - 0.5) * 1.3, 0, (r() - 0.5) * 1.3, 3, r() * 3);
}

export function tuft(p: Paint, r: () => number) {
  const g = shade('#6fae4f', (r() - 0.5) * 0.1);
  for (let i = 0; i < 5; i++) p.cone(g, 0.05, 0.28 + r() * 0.22, (r() - 0.5) * 0.3, 0, (r() - 0.5) * 0.3, 3, r() * 3);
}

export function mushroom(p: Paint, r: () => number) {
  const cap = pick(r, ['#d9473f', '#c9853f', '#e8b33f']);
  const n = 1 + Math.floor(r() * 3);
  for (let i = 0; i < n; i++) {
    const s = i === 0 ? 1 : 0.55 + r() * 0.3;
    const x = i === 0 ? 0 : (r() - 0.5) * 0.4;
    const z = i === 0 ? 0 : (r() - 0.5) * 0.4;
    p.post('#f3ead8', 0.05 * s, 0.16 * s, x, 0, z, 6);
    p.cyl('#e8dcc0', 0.1 * s, 0.03 * s, x, 0.15 * s, z, 8);
    p.dome(cap, 0.15 * s, x, 0.15 * s, z, 0.75, 8);
    if (cap === '#d9473f' && i === 0) for (let k = 0; k < 4; k++) {
      const a = (k / 4) * Math.PI * 2 + r();
      p.ico('#fff6e6', 0.025 * s, x + Math.cos(a) * 0.08 * s, 0.24 * s, z + Math.sin(a) * 0.08 * s, 0, 0.5);
    }
  }
}

export function lampPost(p: Paint) {
  // A moulded base, a fluted post with collars, a scroll bracket, and a six-sided lantern.
  p.post(IRON, 0.16, 0.12, 0, 0, 0, 8);
  p.post(IRON, 0.12, 0.25, 0, 0.12, 0, 10);
  p.cyl(IRON, 0.1, 0.06, 0, 0.4, 0, 10);
  p.post(IRON, 0.06, 2.5, 0, 0.37, 0, 10);
  for (const y of [1.2, 2.3]) p.cyl(IRON, 0.085, 0.05, 0, y, 0, 10);
  p.post(IRON, 0.09, 0.08, 0, 2.5, 0, 10);
  // The cross-arm the lantern hangs from, with a curl at each end.
  p.box(IRON, 0.36, 0.06, 0.36, 0, 2.62, 0);
  for (const sx of [-1, 1]) p.box(IRON, 0.06, 0.1, 0.06, sx * 0.17, 2.55, 0);
  // Lantern: glass box with an iron frame, cap and finial.
  p.glass.cyl('#fff1c8', 0.17, 0.36, 0, 2.86, 0, 6);
  for (let k = 0; k < 6; k++) {
    const a = (k / 6) * Math.PI * 2 + Math.PI / 6;
    p.box(IRON, 0.025, 0.4, 0.025, Math.cos(a) * 0.165, 2.86, Math.sin(a) * 0.165);
  }
  p.cyl(IRON, 0.19, 0.03, 0, 2.67, 0, 6);
  p.cone(IRON, 0.22, 0.18, 0, 3.04, 0, 6);
  p.ico(IRON, 0.045, 0, 3.26, 0, 1);
}

export function bench(p: Paint) {
  // Two cast-iron ends with a curl, slats with gaps, armrests, and a backrest. Faces +z.
  for (const x of [-0.85, 0.85]) {
    p.box(IRON, 0.08, 0.45, 0.5, x, 0.22, 0);
    p.box(IRON, 0.08, 0.5, 0.08, x, 0.7, -0.22);
    p.box(IRON, 0.12, 0.05, 0.6, x, 0.03, 0);
    p.torus(IRON, 0.07, 0.02, x, 0.1, 0.2, 0, Math.PI / 2);
    // Armrest.
    p.box(IRON, 0.07, 0.05, 0.5, x, 0.72, -0.02);
    p.box(IRON, 0.07, 0.24, 0.05, x, 0.6, 0.2);
  }
  for (let i = 0; i < 3; i++) p.rbox(WOOD_LIGHT, 2.0, 0.06, 0.14, 0, 0.46, -0.17 + i * 0.17, 0.015);
  for (let i = 0; i < 2; i++) p.box(WOOD_LIGHT, 2.0, 0.13, 0.05, 0, 0.68 + i * 0.2, -0.27, -0.12);
  for (const x of [-0.6, 0, 0.6]) for (const z of [-0.17, 0, 0.17]) p.cyl(IRON, 0.012, 0.015, x, 0.495, z, 6);
}

export function barrel(p: Paint, r: () => number, lying = false) {
  const wood = shade(WOOD, (r() - 0.5) * 0.06);
  const staves = 14;
  const paint = (q2: Paint) => {
    // A barrel is a stack of staves, a little fatter in the middle, with two iron hoops and a lid.
    for (let k = 0; k < staves; k++) {
      const a = (k / staves) * Math.PI * 2;
      const c = shade(wood, ((k * 5) % 3) * 0.03 - 0.03);
      q2.box(c, 0.17, 0.95, 0.07, Math.cos(a) * 0.36, 0.475, Math.sin(a) * 0.36, 0, Math.PI / 2 - a, 0);
    }
    q2.taper(wood, 0.92, 0.37, 0.93, 0, 0.01, 0, 14);
    for (const y of [0.16, 0.5, 0.8]) q2.cyl(IRON, 0.4, 0.05, 0, y, 0, 16);
    q2.cyl(shade(wood, 0.1), 0.34, 0.03, 0, 0.955, 0, 14);
    q2.cyl(shade(wood, -0.2), 0.05, 0.02, 0.3, 0.965, 0, 8);
  };
  if (lying) {
    // Build it upright in a child frame that's been tipped onto its side along x.
    const m = p.m.clone().multiply(new THREE.Matrix4().makeTranslation(0, 0.38, 0)).multiply(new THREE.Matrix4().makeRotationZ(Math.PI / 2)).multiply(new THREE.Matrix4().makeTranslation(0, -0.475, 0));
    paint(new Paint(p.layers, m));
    // Chocks so it doesn't roll.
    for (const sx of [-1, 1]) p.box(WOOD_DARK, 0.3, 0.1, 0.1, sx * 0.25, 0.05, 0.36);
    return;
  }
  paint(p);
}

export function crate(p: Paint, r: () => number, size = 0.7) {
  const c = shade(WOOD_LIGHT, (r() - 0.5) * 0.08);
  const ry = r() * 0.5;
  const q = p.at(0, 0, 0, ry);
  q.block(shade(c, -0.06), size - 0.04, size - 0.04, size - 0.04, 0, 0.02, 0);
  // Three boards a side with gaps, and corner battens.
  const bw = size / 3 - 0.02;
  for (let k = 0; k < 3; k++) {
    const y = (k + 0.5) * (size / 3);
    q.box(c, size, bw, 0.04, 0, y, size / 2 - 0.02);
    q.box(c, size, bw, 0.04, 0, y, -size / 2 + 0.02);
    q.box(shade(c, 0.03), 0.04, bw, size, size / 2 - 0.02, y, 0);
    q.box(shade(c, 0.03), 0.04, bw, size, -size / 2 + 0.02, y, 0);
  }
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) q.block(shade(c, -0.12), 0.07, size, 0.07, sx * (size / 2 - 0.02), 0, sz * (size / 2 - 0.02));
  q.box(shade(c, -0.1), size + 0.02, 0.05, size + 0.02, 0, size - 0.025, 0);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) q.cyl(IRON, 0.012, 0.012, sx * (size / 2 - 0.1), size + 0.002, sz * (size / 2 - 0.1), 6);
}

export function picketFence(p: Paint, len: number, color = '#f1e6d2') {
  const n = Math.max(2, Math.round(len / 0.35));
  for (let i = 0; i < n; i++) {
    const x = -len / 2 + (i + 0.5) * (len / n);
    p.block(color, 0.12, 0.7, 0.05, x, 0, 0);
    p.cone(color, 0.085, 0.12, x, 0.7, 0, 4, Math.PI / 4);
  }
  for (const y of [0.25, 0.52]) p.box(shade(color, -0.06), len, 0.07, 0.04, 0, y, -0.04);
  for (const x of [-len / 2, len / 2]) {
    p.block(shade(color, -0.1), 0.14, 0.85, 0.14, x, 0, -0.04);
    p.cone(shade(color, -0.1), 0.11, 0.1, x, 0.85, -0.04, 4, Math.PI / 4);
  }
}

/** A rustic split-rail fence segment along x. */
export function railFence(p: Paint, len: number) {
  p.block(WOOD_DARK, 0.18, 1.0, 0.18, -len / 2, 0, 0);
  p.cone(shade(WOOD_DARK, -0.08), 0.13, 0.1, -len / 2, 1.0, 0, 4, Math.PI / 4);
  // Two split rails, slightly out of true like real ones.
  p.cyl(WOOD, 0.055, len + 0.1, 0, 0.75, 0.0, 7, 0, 0, Math.PI / 2);
  p.cyl(shade(WOOD, -0.05), 0.055, len + 0.1, 0, 0.42, 0.02, 7, 0.1, 0, Math.PI / 2);
  p.box(shade(WOOD, -0.15), 0.26, 0.05, 0.05, -len / 2, 0.75, 0.1);
}

/** A little bird perched somewhere: a sparrow or a robin, facing +x. */
export function bird(p: Paint, r: () => number) {
  const robin = r() < 0.4;
  const back = robin ? '#8a6a4a' : '#7a6a5a';
  p.sphere(back, 0.09, 0.08, 0.13, 0, 0.09, 0);
  p.sphere(robin ? '#e07a4a' : '#d8ccb8', 0.07, 0.06, 0.1, 0.01, 0.07, 0.02, 10, 6);
  p.sphere(back, 0.065, 0.065, 0.065, 0.1, 0.16, 0, 10, 8);
  p.cone('#e8c35a', 0.02, 0.06, 0.16, 0.145, 0, 4, 0);
  p.box('#2a2530', 0.015, 0.015, 0.015, 0.13, 0.18, 0.03);
  p.box('#2a2530', 0.015, 0.015, 0.015, 0.13, 0.18, -0.03);
  p.box(shade(back, -0.1), 0.1, 0.02, 0.05, -0.14, 0.12, 0, 0, 0, 0.3);
}
