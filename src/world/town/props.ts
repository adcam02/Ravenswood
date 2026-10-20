import { type Paint, shade, pick } from './kit';

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

export function roundTree(p: Paint, r: () => number, autumn = false) {
  const trunkH = 1.4 + r() * 0.8;
  p.taper(shade(WOOD_DARK, (r() - 0.5) * 0.06), 0.7, 0.22, trunkH, 0, 0, 0, 6);
  const green = autumn ? pick(r, AUTUMN) : pick(r, LEAF_GREENS);
  const blobs = 2 + Math.floor(r() * 3);
  for (let i = 0; i < blobs; i++) {
    const a = r() * Math.PI * 2;
    const d = i === 0 ? 0 : 0.5 + r() * 0.4;
    const size = (i === 0 ? 1.25 : 0.8 + r() * 0.35) * (0.9 + r() * 0.2);
    p.ico(shade(green, (r() - 0.5) * 0.1), size, Math.cos(a) * d, trunkH + 0.7 + (i === 0 ? 0.3 : r() * 0.6), Math.sin(a) * d, 0, 0.9, r() * 3);
  }
  // A few apples or blossoms on some trees.
  if (!autumn && r() < 0.3) {
    const fruit = pick(r, ['#e4553f', '#f2a7b8', '#f6d55c']);
    for (let i = 0; i < 4; i++) {
      const a = r() * Math.PI * 2;
      p.ico(fruit, 0.1, Math.cos(a) * 1.05, trunkH + 0.6 + r() * 0.8, Math.sin(a) * 1.05, 0);
    }
  }
}

export function pineTree(p: Paint, r: () => number) {
  const green = pick(r, PINE_GREENS);
  p.post(WOOD_DARK, 0.18, 1.0, 0, 0, 0, 5);
  const tiers = 3 + Math.floor(r() * 2);
  for (let i = 0; i < tiers; i++) {
    const rad = 1.5 - i * 0.32;
    p.cone(shade(green, i * 0.03 + (r() - 0.5) * 0.04), rad, 1.5, 0, 0.8 + i * 0.85, 0, 7, r() * 3);
  }
}

export function bush(p: Paint, r: () => number, flowers = false) {
  const green = pick(r, LEAF_GREENS);
  const n = 2 + Math.floor(r() * 2);
  for (let i = 0; i < n; i++) {
    const a = r() * Math.PI * 2;
    p.ico(shade(green, (r() - 0.5) * 0.08), 0.45 + r() * 0.25, Math.cos(a) * 0.35, 0.35, Math.sin(a) * 0.35, 0, 0.8, r() * 3);
  }
  if (flowers) {
    const c = pick(r, ['#f2a7b8', '#f6d55c', '#ffffff', '#b494dd', '#e4553f']);
    for (let i = 0; i < 6; i++) {
      const a = r() * Math.PI * 2;
      p.ico(c, 0.08, Math.cos(a) * 0.55, 0.45 + r() * 0.35, Math.sin(a) * 0.55, 0);
    }
  }
}

export function rock(p: Paint, r: () => number, size = 1) {
  const c = shade(pick(r, ['#a49d93', '#b5ada2', '#948d84']), (r() - 0.5) * 0.06);
  p.ico(c, 0.5 * size, 0, 0.15 * size, 0, 0, 0.6, r() * 3);
  if (r() < 0.5) p.ico(shade(c, 0.05), 0.3 * size, 0.45 * size, 0.08 * size, 0.2 * size, 0, 0.6, r() * 3);
}

export function flowerPatch(p: Paint, r: () => number) {
  const colors = ['#f2a7b8', '#f6d55c', '#ffffff', '#b494dd', '#ff9a62', '#8fc1e8'];
  const c = pick(r, colors);
  for (let i = 0; i < 5; i++) {
    const x = (r() - 0.5) * 1.2;
    const z = (r() - 0.5) * 1.2;
    p.post('#5f9e47', 0.02, 0.22, x, 0, z, 3);
    p.ico(c, 0.075, x, 0.25, z, 0);
  }
}

export function tuft(p: Paint, r: () => number) {
  const g = shade('#6fae4f', (r() - 0.5) * 0.1);
  for (let i = 0; i < 3; i++) p.cone(g, 0.06, 0.3 + r() * 0.2, (r() - 0.5) * 0.25, 0, (r() - 0.5) * 0.25, 3, r() * 3);
}

export function mushroom(p: Paint, r: () => number) {
  p.post('#f3ead8', 0.05, 0.16, 0, 0, 0, 5);
  p.sphere(pick(r, ['#d9473f', '#c9853f']), 0.14, 0.08, 0.14, 0, 0.17, 0, 6, 4);
}

export function lampPost(p: Paint) {
  p.post(IRON, 0.12, 0.25, 0, 0, 0, 6);
  p.post(IRON, 0.06, 2.8, 0, 0, 0, 6);
  p.box(IRON, 0.36, 0.06, 0.36, 0, 2.62, 0);
  // Lantern: glass box with an iron cap.
  p.glass.box('#fff1c8', 0.26, 0.36, 0.26, 0, 2.86, 0);
  p.cone(IRON, 0.26, 0.2, 0, 3.04, 0, 4, Math.PI / 4);
  p.box(IRON, 0.06, 0.06, 0.06, 0, 3.27, 0);
}

export function bench(p: Paint) {
  // Two iron legs, slats and a backrest. Faces +z.
  for (const x of [-0.85, 0.85]) {
    p.box(IRON, 0.08, 0.45, 0.5, x, 0.22, 0);
    p.box(IRON, 0.08, 0.5, 0.08, x, 0.7, -0.22);
  }
  for (let i = 0; i < 3; i++) p.box(WOOD_LIGHT, 2.0, 0.06, 0.15, 0, 0.46, -0.17 + i * 0.17);
  for (let i = 0; i < 2; i++) p.box(WOOD_LIGHT, 2.0, 0.13, 0.05, 0, 0.68 + i * 0.2, -0.27, -0.12);
}

export function barrel(p: Paint, r: () => number, lying = false) {
  const wood = shade(WOOD, (r() - 0.5) * 0.06);
  if (lying) {
    p.cyl(wood, 0.38, 0.95, 0, 0.38, 0, 10, 0, 0, Math.PI / 2);
    for (const x of [-0.3, 0.3]) p.cyl(IRON, 0.395, 0.06, x, 0.38, 0, 10, 0, 0, Math.PI / 2);
    p.cyl(shade(wood, 0.08), 0.3, 0.02, 0.48, 0.38, 0, 10, 0, 0, Math.PI / 2);
    return;
  }
  p.post(wood, 0.38, 0.95, 0, 0, 0, 10);
  for (const y of [0.18, 0.78]) p.cyl(IRON, 0.395, 0.06, 0, y, 0, 10);
  p.cyl(shade(wood, 0.1), 0.34, 0.02, 0, 0.955, 0, 10);
}

export function crate(p: Paint, r: () => number, size = 0.7) {
  const c = shade(WOOD_LIGHT, (r() - 0.5) * 0.08);
  p.block(c, size, size, size, 0, 0, 0, r() * 0.5);
  p.block(shade(c, -0.1), size + 0.02, 0.08, size + 0.02, 0, size * 0.45, 0, 0);
}

export function picketFence(p: Paint, len: number, color = '#f1e6d2') {
  const n = Math.max(2, Math.round(len / 0.35));
  for (let i = 0; i < n; i++) {
    const x = -len / 2 + (i + 0.5) * (len / n);
    p.block(color, 0.12, 0.7, 0.05, x, 0, 0);
    p.cone(color, 0.085, 0.12, x, 0.7, 0, 4, Math.PI / 4);
  }
  for (const y of [0.25, 0.52]) p.box(shade(color, -0.06), len, 0.07, 0.04, 0, y, -0.04);
}

/** A rustic split-rail fence segment along x. */
export function railFence(p: Paint, len: number) {
  p.block(WOOD_DARK, 0.18, 1.0, 0.18, -len / 2, 0, 0);
  p.box(WOOD, len, 0.1, 0.08, 0, 0.75, 0);
  p.box(WOOD, len, 0.1, 0.08, 0, 0.42, 0);
}
