import * as THREE from 'three';
import type { Builder, Vec3 } from '../build';
import type { GagGraveId, GagStoolId } from '../stoolShop3';
import { G } from './kit';
import { arc, domeSpots, rod } from './stoolBits';
import type { GraveDesign } from './stools';
import { at, boxFaces, flat, FONT, pixels, plaque, plateOf, ring } from './stools2';

/**
 * The gags and the nods to games and the internet (stoolShop3.ts), painted the same way as the rest in stools.ts:
 * seat tops at 0.42, backs behind z = -0.28, gravestones facing +z with a plate.
 */

// ---------------------------------------------------------------- bits

/** The letters stools2.ts has, and the few more wanted here. */
const FONT3: Record<string, string[]> = {
  ...FONT,
  F: ['###', '#..', '##.', '#..', '#..'],
  Y: ['#.#', '#.#', '.#.', '.#.', '.#.'],
  U: ['#.#', '#.#', '#.#', '#.#', '###'],
  D: ['##.', '#.#', '#.#', '#.#', '##.'],
  I: ['###', '.#.', '.#.', '.#.', '###'],
  W: ['#...#', '#...#', '#.#.#', '##.##', '#...#'],
  S: ['###', '#..', '###', '..#', '###'],
  T: ['###', '.#.', '.#.', '.#.', '.#.'],
  N: ['#..#', '##.#', '#.##', '#..#', '#..#'],
  '9': ['###', '#.#', '###', '..#', '###'],
  '%': ['##..#', '##.#.', '..#..', '.#.##', '#..##'],
  ':': ['.', '#', '.', '#', '.'],
  '(': ['.#', '#.', '#.', '#.', '.#'],
  Z: ['###', '..#', '.#.', '#..', '###'],
};

/** Words in the little pixel font, centred on the frame's origin, facing its +z. */
function words(b: Builder, text: string, color: string, px: number, m: THREE.Matrix4, depth = px * 0.5) {
  const rows = ['', '', '', '', ''];
  for (const ch of text) FONT3[ch].forEach((r, i) => (rows[i] += (rows[i] ? '.' : '') + r));
  pixels(b, rows, color, px, m, depth);
}

/** A little sitting figure in a suit, about 0.6 tall, arms up to a shoulder-high load (the pallbearers). */
function bearer(b: Builder, m: THREE.Matrix4, lean: number) {
  const suit = '#1e1e26';
  const skin = '#6a4430';
  const f = at([0, 0, 0], [0, 0, lean]).premultiply(m);
  for (const x of [-1, 1]) {
    b.add(G.box(), suit, { pos: [x * 0.035, 0.13, x * lean * 0.1], rot: [x * 0.25, 0, 0], scale: [0.045, 0.26, 0.05] }, f);
    b.add(G.box(), '#0e0e10', { pos: [x * 0.035, 0.01, 0.02 + x * lean * 0.1], scale: [0.05, 0.025, 0.09] }, f);
  }
  b.add(G.box(), suit, { pos: [0, 0.36, 0], scale: [0.13, 0.22, 0.08] }, f);
  b.add(G.box(), '#f4f4f0', { pos: [0, 0.4, 0.041], scale: [0.03, 0.12, 0.004] }, f);
  b.add(G.sphere(8, 6), skin, { pos: [0, 0.53, 0], scale: [0.05, 0.06, 0.05] }, f);
  b.add(G.box(), '#0e0e10', { pos: [0, 0.54, 0.042], scale: [0.07, 0.016, 0.01] }, f);
  b.add(G.cyl(10), suit, { pos: [0, 0.6, 0], scale: [0.05, 0.04, 0.05] }, f);
  b.add(G.cyl(10), suit, { pos: [0, 0.582, 0], scale: [0.075, 0.008, 0.075] }, f);
  for (const x of [-1, 1]) {
    b.add(G.box(), suit, { pos: [x * 0.08, 0.5, 0], rot: [0, 0, x * -0.2], scale: [0.035, 0.16, 0.04] }, f);
    b.add(G.sphere(6, 4), '#f6f6f2', { pos: [x * 0.095, 0.585, 0], scale: 0.022 }, f);
  }
}

/** A grey stone of the usual shape (a slab with a round top), w across, h to the top of its shoulders. */
function headstone(b: Builder, color: string, w: number, h: number, z = 0, d = 0.14) {
  b.add(G.box(), color, { pos: [0, h / 2, z], scale: [w, h, d] });
  b.add(G.cyl(20), color, { pos: [0, h, z], rot: [Math.PI / 2, 0, 0], scale: [w / 2, d, w / 2] });
}

const stone = '#9a968e';
const rock = '#8a8680';
const ink = '#1e1c1a';

// ---------------------------------------------------------------- the stools

export const GAG_STOOL_PAINT: Record<GagStoolId, (b: Builder) => void> = {
  whoopee(b) {
    // A giant pink whoopee cushion, its neck pointing out the front and a little puff of air going off.
    const pink = '#e86a9a';
    b.add(G.sphere(18, 10), pink, { pos: [0, 0.21, 0], scale: [0.38, 0.21, 0.36] });
    ring(b, '#c8487a', [0, 0.21, 0], 0.37, 0.04, [Math.PI / 2, 0, 0]);
    b.add(G.taper(0.55, 12), pink, { pos: [0, 0.1, 0.4], rot: [Math.PI / 2 + 0.3, 0, 0], scale: [0.07, 0.16, 0.05] });
    b.add(G.cyl(12), '#c8487a', { pos: [0, 0.08, 0.48], rot: [Math.PI / 2 + 0.3, 0, 0], scale: [0.045, 0.02, 0.035] });
    for (const [x, y, z, s] of [
      [0.04, 0.1, 0.6, 0.05],
      [-0.03, 0.14, 0.68, 0.04],
      [0.05, 0.17, 0.75, 0.03],
    ]) {
      b.add(G.sphere(8, 6), '#c8e0a8', { pos: [x, y, z], scale: s });
    }
  },
  paintcan(b) {
    // A big tin of paint, blue running down its sides, its handle tied to a rope from a post behind.
    b.add(G.cyl(18), '#b8bcc4', { pos: [0, 0.2, 0], scale: [0.27, 0.4, 0.27] });
    b.add(G.cyl(18), '#d0d4da', { pos: [0, 0.405, 0], scale: [0.275, 0.03, 0.275] });
    for (const y of [0.04, 0.38]) b.add(G.cyl(18), '#9aa0a8', { pos: [0, y, 0], scale: [0.278, 0.03, 0.278] });
    b.add(G.cyl(18), '#f4f0e6', { pos: [0, 0.2, 0], scale: [0.274, 0.2, 0.274] });
    b.add(G.box(), '#2a5ad8', { pos: [0, 0.2, 0.26], rot: [0, 0, 0], scale: [0.2, 0.12, 0.03] });
    for (let i = 0; i < 9; i++) {
      const a = 0.3 + i * 0.7;
      const len = 0.06 + ((i * 0.37) % 1) * 0.16;
      b.add(G.box(), '#2a5ad8', { pos: [Math.sin(a) * 0.278, 0.42 - len / 2, Math.cos(a) * 0.278], rot: [0, a, 0], scale: [0.05, len, 0.012] });
      b.add(G.sphere(6, 4), '#2a5ad8', { pos: [Math.sin(a) * 0.278, 0.42 - len, Math.cos(a) * 0.278], scale: [0.028, 0.03, 0.02] });
    }
    // The handle, folded back, and the rope up to the post.
    b.add(arc(0.03, Math.PI, 6, 12), '#6a6e74', { pos: [0, 0.4, 0], rot: [-2.2, 0, 0], scale: 0.27 });
    rod(b, '#c8a878', [0, 0.52, -0.24], [0, 1.24, -0.42], 0.012, 4);
    rod(b, '#6e4a2a', [0, 0, -0.44], [0, 1.3, -0.44], 0.035, 6);
    b.add(G.box(), '#6e4a2a', { pos: [0, 1.28, -0.4], scale: [0.06, 0.06, 0.14] });
    b.add(G.cyl(16), '#2a5ad8', { pos: [0.24, 0.004, 0.3], scale: [0.16, 0.008, 0.12] });
  },
  lawnchair(b) {
    // A folding lawn chair of green and white webbing, shades hooked on its back and a drink with a paper umbrella.
    const metal = '#c4c8ce';
    const web = ['#3a9a5a', '#f4f4ee'];
    for (const x of [-1, 1]) {
      rod(b, metal, [x * 0.27, 0.4, -0.26], [x * 0.27, 0.4, 0.26], 0.015);
      rod(b, metal, [x * 0.27, 0.4, 0.24], [x * 0.27, 0, -0.18], 0.015);
      rod(b, metal, [x * 0.27, 0.4, -0.24], [x * 0.27, 0, 0.2], 0.015);
      rod(b, metal, [x * 0.27, 0.4, -0.26], [x * 0.27, 1.0, -0.42], 0.015);
      rod(b, metal, [x * 0.29, 0.62, 0.2], [x * 0.29, 0.62, -0.32], 0.015);
      rod(b, metal, [x * 0.29, 0.62, 0.2], [x * 0.27, 0.4, 0.22], 0.015);
    }
    for (let i = 0; i < 6; i++) b.add(G.box(), web[i % 2], { pos: [0, 0.41, -0.22 + i * 0.09], scale: [0.54, 0.012, 0.075] });
    for (let i = 0; i < 6; i++) {
      const t = (i + 0.5) / 6;
      b.add(G.box(), web[i % 2], { pos: [0, 0.42 + t * 0.58, -0.26 - t * 0.16], rot: [-0.27, 0, 0], scale: [0.54, 0.08, 0.012] });
    }
    // The shades, hooked over the top.
    for (const x of [-1, 1]) b.add(G.cyl(12), '#1a1a22', { pos: [x * 0.07, 0.98, -0.4], rot: [Math.PI / 2 - 0.27, 0, 0], scale: [0.055, 0.012, 0.045] });
    b.add(G.box(), '#1a1a22', { pos: [0, 0.99, -0.4], scale: [0.04, 0.01, 0.01] });
    // The drink, on the right arm.
    b.add(G.taper(1.2, 10), '#f2a83a', { pos: [0.29, 0.69, 0.08], scale: [0.04, 0.12, 0.04] });
    rod(b, '#e8e8e8', [0.29, 0.7, 0.08], [0.31, 0.86, 0.08], 0.004, 4);
    b.add(G.cone(8), '#e83a6a', { pos: [0.31, 0.87, 0.08], scale: [0.07, 0.035, 0.07] });
  },
  cheese(b) {
    // A cartoon wedge of cheese full of holes, a little mouse nibbling at its back corner.
    const wedge = flat('cheesewedge', 0.4, (s) => {
      s.moveTo(0, 0.38);
      s.absarc(0, 0.38, 0.74, -Math.PI / 2 - 0.42, -Math.PI / 2 + 0.42, false);
      s.lineTo(0, 0.38);
    }, 10);
    b.add(wedge, '#f6c83a', { pos: [0, 0.2, 0], rot: [-Math.PI / 2, 0, 0] });
    const hole = '#d89a1a';
    for (const [x, z, r] of [
      [0.1, 0.12, 0.05],
      [-0.12, 0.2, 0.04],
      [0.02, -0.12, 0.035],
      [-0.06, 0.02, 0.03],
    ]) {
      b.add(G.cyl(12), hole, { pos: [x, 0.4, z], scale: [r, 0.004, r] });
    }
    for (let i = 0; i < 6; i++) {
      const a = -0.36 + i * 0.15;
      b.add(G.sphere(10, 6), hole, { pos: [Math.sin(a) * 0.37, 0.1 + ((i * 0.53) % 1) * 0.22, 0.38 - 0.74 + Math.cos(a) * 0.74 - 0.01], scale: [0.04, 0.04, 0.02] });
    }
    // The mouse.
    const m = at([0.08, 0, -0.42], [0, 0.7, 0]);
    b.add(G.sphere(10, 8), '#9a9aa4', { pos: [0, 0.07, 0], scale: [0.06, 0.06, 0.09] }, m);
    b.add(G.sphere(10, 8), '#9a9aa4', { pos: [0, 0.1, 0.08], scale: [0.04, 0.04, 0.05] }, m);
    for (const x of [-1, 1]) b.add(G.cyl(10), '#e8a8b8', { pos: [x * 0.035, 0.15, 0.07], rot: [Math.PI / 2, 0, 0], scale: [0.025, 0.006, 0.025] }, m);
    b.add(G.sphere(6, 4), '#e86a8a', { pos: [0, 0.1, 0.13], scale: 0.01 }, m);
    rod(b, '#c88a9a', [0.08 - 0.08 * Math.sin(0.7), 0.05, -0.42 - 0.08 * Math.cos(0.7)], [-0.02, 0.1, -0.6], 0.006, 4);
  },
  couchpotato(b) {
    // A giant potato with a cushion on top, the TV remote beside it and a bowl of crisps.
    b.add(G.sphere(16, 10), '#b88a52', { pos: [0, 0.2, 0], scale: [0.4, 0.22, 0.32] });
    domeSpots(b, '#7a5a30', [0, 0.18, 0], [0.4, 0.22, 0.32], 8, 0.03, 2, 0.05);
    b.add(G.rbox(0.3), '#c83a3a', { pos: [0, 0.41, 0], scale: [0.4, 0.06, 0.34] });
    for (const x of [-1, 1]) b.add(G.box(), '#e8d040', { pos: [x * 0.1, 0.442, 0], scale: [0.02, 0.004, 0.34] });
    b.add(G.cone(5), '#9ac04a', { pos: [-0.36, 0.3, 0.1], rot: [0, 0, 0.9], scale: [0.02, 0.07, 0.02] });
    b.add(G.rbox(0.3), '#2a2a30', { pos: [0.32, 0.02, 0.32], rot: [0, 0.5, 0], scale: [0.07, 0.03, 0.2] });
    for (let i = 0; i < 4; i++) b.add(G.cyl(6), i ? '#9a9aa8' : '#d82a2a', { pos: [0.32 + Math.sin(0.5) * (0.07 - i * 0.04), 0.04, 0.32 + Math.cos(0.5) * (0.07 - i * 0.04)], scale: [0.012, 0.01, 0.012] });
    b.add(G.taper(1.5, 14), '#e8e8f0', { pos: [-0.32, 0.04, 0.3], scale: [0.08, 0.08, 0.08] });
    for (let i = 0; i < 6; i++) b.add(G.cyl(8), '#f2c84a', { pos: [-0.32 + Math.sin(i * 2.4) * 0.05, 0.09, 0.3 + Math.cos(i * 2.4) * 0.05], rot: [i * 0.5, 0, i * 0.3], scale: [0.035, 0.005, 0.03] });
  },
  rubberduck(b) {
    // A giant yellow rubber duck to ride side-saddle: head to the right, tail up to the left, an orange beak.
    const y = '#f6d22a';
    b.add(G.sphere(18, 12), y, { pos: [0, 0.2, 0], scale: [0.42, 0.22, 0.32] });
    b.add(G.cone(10), y, { pos: [-0.4, 0.34, 0], rot: [0, 0, 1.1], scale: [0.12, 0.2, 0.1] });
    b.add(G.sphere(14, 10), y, { pos: [0.3, 0.6, 0], scale: [0.17, 0.17, 0.16] });
    b.add(G.cyl(12), y, { pos: [0.3, 0.42, 0], scale: [0.12, 0.12, 0.12] });
    b.add(G.sphere(10, 6), '#f08a1a', { pos: [0.47, 0.56, 0], scale: [0.1, 0.035, 0.08] });
    b.add(G.sphere(10, 6), '#e0701a', { pos: [0.45, 0.53, 0], scale: [0.08, 0.025, 0.065] });
    for (const z of [-1, 1]) {
      b.add(G.sphere(8, 6), '#ffffff', { pos: [0.4, 0.66, z * 0.08], scale: [0.035, 0.04, 0.03] });
      b.add(G.sphere(6, 4), '#1a1a1a', { pos: [0.43, 0.66, z * 0.09], scale: [0.018, 0.022, 0.016] });
      b.add(G.sphere(10, 6), '#e8be1a', { pos: [-0.04, 0.24, z * 0.29], rot: [z * 0.3, 0, 0.3], scale: [0.2, 0.08, 0.05] });
    }
  },
  cupcake(b) {
    // A giant cupcake: a pleated pink paper case, a swirl of icing with sprinkles, and a cherry at the back.
    b.add(G.taper(1.25, 18), '#f08ab0', { pos: [0, 0.13, 0], scale: [0.26, 0.26, 0.26] });
    for (let i = 0; i < 18; i++) {
      const a = (i / 18) * Math.PI * 2;
      rod(b, '#d86a94', [Math.sin(a) * 0.262, 0.005, Math.cos(a) * 0.262], [Math.sin(a) * 0.327, 0.26, Math.cos(a) * 0.327], 0.012, 4);
    }
    b.add(G.sphere(18, 10), '#c88a52', { pos: [0, 0.26, 0], scale: [0.33, 0.05, 0.33] });
    b.add(G.dome(18), '#fbe4ee', { pos: [0, 0.27, 0], scale: [0.34, 0.15, 0.34] });
    ring(b, '#f6d0e0', [0, 0.29, 0], 0.32, 0.12, [Math.PI / 2, 0, 0]);
    const cols = ['#e83a3a', '#3ab8e8', '#f2d02a', '#5ad06a', '#a05ae8'];
    for (let i = 0; i < 22; i++) {
      const a = i * 2.39996;
      const r = 0.06 + ((i * 0.618) % 1) * 0.24;
      const h = 0.27 + 0.15 * Math.sqrt(Math.max(0, 1 - (r / 0.34) ** 2)) + 0.004;
      b.add(G.box(), cols[i % 5], { pos: [Math.sin(a) * r, h, Math.cos(a) * r], rot: [0, a * 1.7, 0], scale: [0.04, 0.012, 0.012] });
    }
    b.add(G.sphere(12, 8), '#d8102a', { pos: [0, 0.44, -0.25], scale: 0.07 });
    rod(b, '#5a8a2a', [0, 0.5, -0.25], [0.04, 0.62, -0.3], 0.008, 4);
  },
  pancakes(b) {
    // A tall stack of pancakes on a plate, a pat of butter and syrup running down, a fork stuck in at the back.
    b.add(G.cyl(20), '#f4f4f0', { pos: [0, 0.015, 0], scale: [0.38, 0.03, 0.38] });
    for (let i = 0; i < 6; i++) {
      const x = Math.sin(i * 2.1) * 0.015;
      const z = Math.cos(i * 1.7) * 0.015;
      b.add(G.cyl(18), '#c8823a', { pos: [x, 0.06 + i * 0.062, z], scale: [0.31, 0.058, 0.31] });
      b.add(G.cyl(18), '#e8b060', { pos: [x, 0.06 + i * 0.062 + 0.026, z], scale: [0.3, 0.008, 0.3] });
    }
    const syrup = '#8a3a10';
    b.add(G.cyl(18), syrup, { pos: [0, 0.405, 0], scale: [0.26, 0.012, 0.26] });
    for (let i = 0; i < 8; i++) {
      const a = i * 0.8 + 0.2;
      const len = 0.08 + ((i * 0.41) % 1) * 0.22;
      b.add(G.box(), syrup, { pos: [Math.sin(a) * 0.312, 0.41 - len / 2, Math.cos(a) * 0.312], rot: [0, a, 0], scale: [0.05, len, 0.01] });
      b.add(G.sphere(6, 4), syrup, { pos: [Math.sin(a) * 0.312, 0.41 - len, Math.cos(a) * 0.312], scale: [0.028, 0.03, 0.02] });
    }
    b.add(G.box(), '#f8e07a', { pos: [0.08, 0.43, -0.16], rot: [0, 0.4, 0], scale: [0.1, 0.04, 0.08] });
    rod(b, '#c8ccd2', [-0.12, 0.3, -0.2], [-0.16, 0.66, -0.3], 0.012, 4);
    for (let i = -1; i <= 1; i++) rod(b, '#c8ccd2', [-0.16 + i * 0.015, 0.64, -0.3], [-0.17 + i * 0.015, 0.76, -0.32], 0.005, 4);
  },
  lava(b) {
    // The floor is lava: a glowing pool with a few stepping stones, and sofa cushions piled up out of it to sit on.
    b.add(G.cyl(20), '#e2501a', { pos: [0, 0.008, 0], scale: [0.5, 0.016, 0.5] });
    for (let i = 0; i < 9; i++) {
      const a = i * 2.2;
      const r = 0.3 + ((i * 0.37) % 1) * 0.16;
      b.add(G.sphere(8, 5), i % 3 ? '#f6a01a' : '#ffd84a', { pos: [Math.sin(a) * r, 0.016, Math.cos(a) * r], scale: [0.06, 0.01, 0.04] });
    }
    for (const [x, z] of [
      [0.38, 0.22],
      [-0.4, -0.18],
    ]) {
      b.add(G.sphere(8, 5), '#3a3434', { pos: [x, 0.02, z], scale: [0.08, 0.04, 0.07] });
    }
    for (const [x, z] of [
      [0.2, 0.38],
      [-0.3, 0.3],
    ]) {
      b.add(G.dome(10), '#ffb02a', { pos: [x, 0.012, z], scale: [0.03, 0.03, 0.03] });
    }
    const cush = ['#5a7ab8', '#6a8ac8', '#4a6aa8'];
    for (let i = 0; i < 3; i++) {
      b.add(G.rbox(0.35), cush[i], { pos: [Math.sin(i * 2) * 0.02, 0.07 + i * 0.13, Math.cos(i * 2) * 0.02], rot: [0, i * 0.3 - 0.3, 0], scale: [0.5, 0.13, 0.42] });
      b.add(G.box(), '#8aa8e0', { pos: [Math.sin(i * 2) * 0.02, 0.07 + i * 0.13, Math.cos(i * 2) * 0.02], rot: [0, i * 0.3 - 0.3, 0], scale: [0.51, 0.012, 0.43] });
    }
  },
  trolley(b) {
    // A shopping trolley to sit in: a wire basket on four castors, the handle at the back with its red grip.
    const wire = '#b8bec6';
    for (const [x, z] of [
      [-0.22, -0.26],
      [0.22, -0.26],
      [-0.2, 0.3],
      [0.2, 0.3],
    ]) {
      b.add(G.cyl(10), '#2a2a30', { pos: [x, 0.05, z], rot: [0, 0, Math.PI / 2], scale: [0.05, 0.03, 0.05] });
      rod(b, wire, [x, 0.05, z], [x, 0.42, z], 0.012, 4);
    }
    for (const x of [-1, 1]) rod(b, wire, [x * 0.22, 0.1, -0.26], [x * 0.2, 0.1, 0.3], 0.012, 4);
    b.add(G.box(), '#8a9098', { pos: [0, 0.405, 0.02], scale: [0.5, 0.03, 0.64] });
    // The basket's sides, a frame and close bars.
    const top = (z: number) => 0.62 + (z + 0.3) * 0.15;
    for (const x of [-1, 1]) {
      rod(b, wire, [x * 0.25, top(-0.3), -0.3], [x * 0.25, top(0.34), 0.34], 0.01, 4);
      for (let i = 0; i <= 8; i++) {
        const z = -0.3 + (i / 8) * 0.64;
        rod(b, wire, [x * 0.25, 0.42, z], [x * 0.25, top(z), z], 0.005, 3);
      }
    }
    rod(b, wire, [-0.25, top(0.34), 0.34], [0.25, top(0.34), 0.34], 0.01, 4);
    for (let i = 0; i <= 6; i++) rod(b, wire, [-0.25 + (i / 6) * 0.5, 0.42, 0.34], [-0.25 + (i / 6) * 0.5, top(0.34), 0.34], 0.005, 3);
    rod(b, wire, [-0.25, top(-0.3), -0.3], [0.25, top(-0.3), -0.3], 0.01, 4);
    for (let i = 0; i <= 6; i++) rod(b, wire, [-0.25 + (i / 6) * 0.5, 0.42, -0.3], [-0.25 + (i / 6) * 0.5, top(-0.3), -0.3], 0.005, 3);
    for (const x of [-1, 1]) rod(b, wire, [x * 0.25, top(-0.3), -0.3], [x * 0.25, 0.78, -0.44], 0.012, 4);
    rod(b, '#d82a2a', [-0.27, 0.78, -0.44], [0.27, 0.78, -0.44], 0.025, 8);
  },
  hamster(b) {
    // A hamster wheel big enough for anyone, on an A-frame; you sit on the rungs at the bottom. A hamster watches.
    const cy = 0.88;
    const r = 0.46;
    for (const x of [-1, 1]) {
      ring(b, '#4ab0e8', [x * 0.28, cy, 0], r, 0.04, [0, Math.PI / 2, 0]);
      rod(b, '#3a8ac0', [x * 0.32, cy, 0], [x * 0.36, 0, 0.32], 0.025);
      rod(b, '#3a8ac0', [x * 0.32, cy, 0], [x * 0.36, 0, -0.32], 0.025);
      for (let i = 0; i < 3; i++) {
        const a = (i / 3) * Math.PI * 2 + 0.5;
        rod(b, '#3a8ac0', [x * 0.28, cy, 0], [x * 0.28, cy + Math.sin(a) * r, Math.cos(a) * r], 0.01, 4);
      }
    }
    rod(b, '#3a8ac0', [-0.34, cy, 0], [0.34, cy, 0], 0.03);
    for (let i = 0; i < 26; i++) {
      const a = (i / 26) * Math.PI * 2;
      rod(b, '#d8dce2', [-0.28, cy + Math.sin(a) * r, Math.cos(a) * r], [0.28, cy + Math.sin(a) * r, Math.cos(a) * r], 0.014, 4);
    }
    const h = at([0.32, 0, 0.36], [0, -0.4, 0]);
    b.add(G.sphere(12, 8), '#e8a85a', { pos: [0, 0.08, 0], scale: [0.08, 0.075, 0.1] }, h);
    b.add(G.sphere(10, 6), '#fbf0e0', { pos: [0, 0.06, 0.04], scale: [0.06, 0.05, 0.07] }, h);
    for (const x of [-1, 1]) {
      b.add(G.sphere(6, 4), '#e89aa8', { pos: [x * 0.045, 0.15, 0.04], scale: [0.025, 0.025, 0.012] }, h);
      b.add(G.sphere(6, 4), '#1a1a1a', { pos: [x * 0.03, 0.1, 0.09], scale: 0.01 }, h);
    }
  },
  tnt(b) {
    // A wooden crate stencilled TNT, a bundle of red sticks on the back with a fuse, and the plunger beside it.
    const wood = '#b8884a';
    b.add(G.box(), wood, { pos: [0, 0.21, 0], scale: [0.52, 0.42, 0.46] });
    boxFaces([0, 0.21, 0], 0.52, 0.42, 0.46, false).forEach((f) => {
      for (const y of [-0.17, 0.17]) b.add(G.box(), '#8a6230', { pos: [0, y, 0.006], scale: [0.52, 0.05, 0.012] }, f);
      b.add(G.box(), '#9a7038', { pos: [0, 0, 0.004], rot: [0, 0, 0.6], scale: [0.5, 0.04, 0.008] }, f);
    });
    words(b, 'TNT', '#c8202a', 0.03, at([0, 0.21, 0.236]), 0.006);
    for (let i = 0; i < 3; i++) b.add(G.cyl(10), '#d8302a', { pos: [-0.06 + i * 0.06, 0.6, -0.3], scale: [0.03, 0.36, 0.03] });
    b.add(G.box(), '#2a2a2a', { pos: [0, 0.62, -0.3], scale: [0.2, 0.03, 0.07] });
    rod(b, '#2a2a2a', [0, 0.78, -0.3], [0.06, 0.88, -0.28], 0.005, 4);
    b.add(G.sphere(6, 4), '#ffd84a', { pos: [0.06, 0.89, -0.28], scale: 0.02 });
    const p = at([0.4, 0, 0.12]);
    b.add(G.box(), '#a03a2a', { pos: [0, 0.08, 0], scale: [0.14, 0.16, 0.12] }, p);
    rod(b, '#5a5a5a', [0, 0.16, 0], [0, 0.32, 0], 0.012, 4);
    b.add(G.box(), '#3a3a3a', { pos: [0, 0.32, 0], scale: [0.14, 0.025, 0.025] }, p);
    rod(b, '#2a2a2a', [0.35, 0.02, 0.12], [0.2, 0.01, 0.3], 0.006, 3);
  },
  meltclock(b) {
    // A pale stump with a gold pocket clock melted over it like a pancake, and another drooping off a dry branch.
    b.add(G.taper(0.85, 14), '#c8b08a', { pos: [0, 0.19, 0], scale: [0.27, 0.38, 0.27] });
    const gold = '#d8a83a';
    const face = '#e8e2c8';
    b.add(G.cyl(20), gold, { pos: [0, 0.395, 0], scale: [0.33, 0.03, 0.33] });
    b.add(G.cyl(20), face, { pos: [0, 0.41, 0], scale: [0.3, 0.008, 0.3] });
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      b.add(G.box(), '#3a3020', { pos: [Math.sin(a) * 0.25, 0.415, Math.cos(a) * 0.25], rot: [0, a, 0], scale: [0.01, 0.004, 0.035] });
    }
    // The part that's run over the front edge.
    for (let i = 0; i < 4; i++) {
      const t = i / 3;
      const y = 0.37 - t * 0.2;
      const z = 0.3 + Math.sin(t * 1.2) * 0.04;
      b.add(G.box(), gold, { pos: [0, y, z], rot: [0.3 + t * 1.1, 0, 0], scale: [0.36 - t * 0.12, 0.03, 0.1] });
      b.add(G.box(), face, { pos: [0, y + 0.012, z + 0.008], rot: [0.3 + t * 1.1, 0, 0], scale: [0.32 - t * 0.12, 0.01, 0.09] });
    }
    b.add(G.sphere(10, 6), gold, { pos: [0, 0.13, 0.36], scale: [0.08, 0.06, 0.04] });
    // The branch and its clock, behind.
    rod(b, '#a8906a', [-0.18, 0.3, -0.18], [-0.24, 1.0, -0.36], 0.03, 6);
    rod(b, '#a8906a', [-0.24, 1.0, -0.36], [0.02, 1.12, -0.38], 0.02, 6);
    b.add(G.box(), gold, { pos: [0.0, 1.13, -0.38], rot: [0, 0, 0.1], scale: [0.18, 0.02, 0.12] });
    for (let i = 0; i < 3; i++) b.add(G.box(), gold, { pos: [0.1 + i * 0.012, 1.08 - i * 0.07, -0.38], rot: [0, 0, 1.4 - i * 0.15], scale: [0.08, 0.02, 0.12] });
    b.add(G.box(), face, { pos: [0.115, 1.03, -0.31], rot: [0, 0, 1.4], scale: [0.18, 0.06, 0.006] });
    for (const [x, z] of [
      [0.1, 0.08],
      [0.14, 0.12],
      [0.08, 0.14],
    ]) {
      b.add(G.sphere(6, 4), '#1a1a1a', { pos: [x, 0.418, z], scale: [0.018, 0.008, 0.012] });
    }
  },
  massage(b) {
    // A big padded massage chair: rollers bulging in the back, deep arms with the buttons, a calf rest at the front.
    const pad = '#3a3436';
    const trim = '#c8ccd2';
    b.add(G.box(), '#2a2628', { pos: [0, 0.18, -0.02], scale: [0.56, 0.36, 0.56] });
    b.add(G.rbox(0.25), pad, { pos: [0, 0.38, 0.0], scale: [0.48, 0.1, 0.5] });
    b.add(G.rbox(0.25), pad, { pos: [0, 0.82, -0.34], rot: [-0.2, 0, 0], scale: [0.5, 0.86, 0.16] });
    for (let i = 0; i < 4; i++) for (const x of [-1, 1]) b.add(G.sphere(10, 6), '#4a4446', { pos: [x * 0.09, 0.56 + i * 0.16, -0.25 + i * 0.033], scale: [0.07, 0.06, 0.04] });
    b.add(G.rbox(0.3), pad, { pos: [0, 1.28, -0.4], rot: [-0.2, 0, 0], scale: [0.36, 0.16, 0.14] });
    for (const x of [-1, 1]) {
      b.add(G.rbox(0.25), pad, { pos: [x * 0.31, 0.46, -0.04], scale: [0.14, 0.3, 0.6] });
      b.add(G.box(), trim, { pos: [x * 0.31, 0.32, -0.04], scale: [0.145, 0.02, 0.605] });
    }
    for (let i = 0; i < 3; i++) b.add(G.cyl(8), ['#3ad06a', '#f2c42a', '#d83a3a'][i], { pos: [0.31, 0.615, 0.12 + i * 0.05], scale: [0.016, 0.01, 0.016] });
    b.add(G.box(), '#1a1a1e', { pos: [0.31, 0.612, 0.02], scale: [0.08, 0.004, 0.06] });
    b.add(G.rbox(0.25), pad, { pos: [0, 0.18, 0.36], rot: [0.35, 0, 0], scale: [0.4, 0.34, 0.14] });
    for (const x of [-1, 1]) b.add(G.box(), '#2a2628', { pos: [x * 0.1, 0.2, 0.4], rot: [0.35, 0, 0], scale: [0.012, 0.3, 0.1] });
  },
  kart(b) {
    // A little racing kart: fat tyres, a red body and bucket seat, the steering wheel, and a banana skin left behind.
    const red = '#d82a2a';
    for (const [x, z, r] of [
      [-0.3, -0.26, 0.12],
      [0.3, -0.26, 0.12],
      [-0.28, 0.3, 0.1],
      [0.28, 0.3, 0.1],
    ]) {
      b.add(G.cyl(14), '#1e1e22', { pos: [x, r, z], rot: [0, 0, Math.PI / 2], scale: [r, 0.12, r] });
      b.add(G.cyl(10), '#d8dce2', { pos: [x + Math.sign(x) * 0.062, r, z], rot: [0, 0, Math.PI / 2], scale: [r * 0.5, 0.01, r * 0.5] });
    }
    b.add(G.box(), '#3a3a40', { pos: [0, 0.1, 0.02], scale: [0.5, 0.04, 0.76] });
    b.add(G.rbox(0.2), red, { pos: [0, 0.18, 0.28], scale: [0.36, 0.14, 0.3] });
    b.add(G.box(), '#f2f2ee', { pos: [0, 0.2, 0.432], scale: [0.14, 0.08, 0.01] });
    b.add(G.rbox(0.3), red, { pos: [0, 0.3, -0.06], scale: [0.4, 0.22, 0.36] });
    b.add(G.rbox(0.25), '#2a2a30', { pos: [0, 0.4, -0.06], scale: [0.34, 0.04, 0.3] });
    b.add(G.rbox(0.25), '#2a2a30', { pos: [0, 0.64, -0.24], rot: [-0.25, 0, 0], scale: [0.36, 0.48, 0.06] });
    rod(b, '#6a6a70', [0, 0.18, 0.28], [0, 0.5, 0.2], 0.014, 4);
    b.add(G.torus(0.12, 6, 16), '#1e1e22', { pos: [0, 0.52, 0.19], rot: [-0.9, 0, 0], scale: 0.09 });
    rod(b, '#8a8a90', [-0.1, 0.16, -0.36], [-0.1, 0.12, -0.44], 0.02, 6);
    // The banana skin.
    const ban = at([0.12, 0, -0.54]);
    b.add(G.sphere(8, 5), '#f2d84a', { pos: [0, 0.03, 0], scale: [0.05, 0.03, 0.05] }, ban);
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * Math.PI * 2;
      b.add(G.sphere(8, 5), '#f2d84a', { pos: [Math.sin(a) * 0.06, 0.012, Math.cos(a) * 0.06], rot: [0, a, 0], scale: [0.025, 0.01, 0.07] }, ban);
    }
    b.add(G.cyl(6), '#6a4a2a', { pos: [0, 0.07, 0], scale: [0.012, 0.03, 0.012] }, ban);
  },
  ejector(b) {
    // A jet's ejector seat sitting on a big coiled spring, the striped pull handle on top and a red button by it.
    b.add(G.cyl(16), '#4a4e54', { pos: [0, 0.03, 0], scale: [0.3, 0.06, 0.3] });
    for (let i = 0; i < 5; i++) ring(b, '#c8ccd2', [0, 0.08 + i * 0.05, 0], 0.18, 0.12, [Math.PI / 2 + 0.12, 0, 0]);
    const olive = '#5a6a3a';
    b.add(G.rbox(0.2), olive, { pos: [0, 0.37, 0.0], scale: [0.48, 0.1, 0.46] });
    b.add(G.rbox(0.2), '#3a3a3e', { pos: [0, 0.43, 0.02], scale: [0.4, 0.04, 0.4] });
    b.add(G.rbox(0.2), olive, { pos: [0, 0.85, -0.27], rot: [-0.08, 0, 0], scale: [0.48, 0.86, 0.1] });
    b.add(G.rbox(0.2), '#3a3a3e', { pos: [0, 0.8, -0.215], rot: [-0.08, 0, 0], scale: [0.36, 0.56, 0.03] });
    b.add(G.box(), '#7a7a6a', { pos: [0, 0.98, -0.37], scale: [0.36, 0.42, 0.12] });
    for (const x of [-1, 1]) b.add(G.box(), olive, { pos: [x * 0.24, 0.52, 0.0], scale: [0.04, 0.16, 0.42] });
    // The pull handle, a loop in yellow and black.
    for (let i = 0; i < 6; i++) b.add(arc(0.08, Math.PI / 6, 6, 3), i % 2 ? '#1a1a1a' : '#f2c42a', { pos: [0, 1.28, -0.24], rot: [0, 0, (i * Math.PI) / 6], scale: 0.14 });
    // The button on its post, cover flipped open.
    rod(b, '#5a5e64', [0.4, 0, 0.1], [0.4, 0.46, 0.1], 0.025, 6);
    b.add(G.box(), '#3a3a40', { pos: [0.4, 0.48, 0.1], scale: [0.12, 0.04, 0.12] });
    b.add(G.cyl(14), '#e2202a', { pos: [0.4, 0.51, 0.1], scale: [0.04, 0.03, 0.04] });
    b.add(G.box(), '#c8d8e0', { pos: [0.4, 0.56, 0.04], rot: [-1.2, 0, 0], scale: [0.11, 0.008, 0.1] });
  },
  sleepybelly(b) {
    // A big dozy creature asleep on its back: you sit on its cream tummy. Its head lolls to one side, feet up.
    const fur = '#2a5a6a';
    const belly = '#f2e2c4';
    b.add(G.sphere(18, 12), fur, { pos: [0, 0.06, 0], scale: [0.48, 0.32, 0.4] });
    b.add(G.sphere(18, 12), belly, { pos: [0, 0.1, 0.02], scale: [0.4, 0.32, 0.34] });
    const h = at([-0.5, 0.2, 0.0], [0, 0, 0.5]);
    b.add(G.sphere(14, 10), fur, { scale: [0.2, 0.18, 0.2] }, h);
    b.add(G.sphere(12, 8), belly, { pos: [0.04, 0.03, 0.06], scale: [0.14, 0.13, 0.14] }, h);
    for (const z of [-1, 1]) {
      b.add(G.cone(4), fur, { pos: [-0.08, 0.17, z * 0.09], rot: [z * 0.3, 0, 0.4], scale: [0.04, 0.08, 0.04] }, h);
      b.add(G.box(), '#1a2a30', { pos: [0.1, 0.11, z * 0.06], rot: [0, 0, -0.6], scale: [0.004, 0.012, 0.05] }, h);
    }
    b.add(G.box(), '#1a2a30', { pos: [0.16, 0.0, 0], rot: [0, 0, -1.2], scale: [0.004, 0.08, 0.012] }, h);
    for (const z of [-1, 1]) b.add(G.cone(4), '#ffffff', { pos: [0.165, 0.015, z * 0.03], rot: [0, 0, -1.3], scale: [0.012, 0.025, 0.012] }, h);
    for (const z of [-1, 1]) {
      b.add(G.sphere(10, 8), belly, { pos: [0.48, 0.2, z * 0.18], rot: [0, 0, -0.6], scale: [0.1, 0.13, 0.09] });
      for (let i = -1; i <= 1; i++) b.add(G.cone(4), '#f8f4ec', { pos: [0.6, 0.3, z * 0.18 + i * 0.04], rot: [0, 0, -0.9], scale: [0.012, 0.04, 0.012] });
      b.add(G.sphere(10, 8), fur, { pos: [0.02, 0.18, z * 0.4], rot: [z * 0.5, 0, 0], scale: [0.16, 0.08, 0.08] });
    }
    // The snores.
    for (const [x, y, s] of [
      [-0.62, 0.52, 0.02],
      [-0.7, 0.68, 0.026],
      [-0.6, 0.86, 0.032],
    ]) {
      words(b, 'Z', '#cfe4ff', s, at([x, y, 0.06], [0, 0, 0.2]), 0.01);
    }
  },
  forestspirit(b) {
    // A big round grey forest spirit sitting up, you in its lap; it holds a leaf over the both of you for a brolly.
    const fur = '#8a8c90';
    const cream = '#f0ead6';
    b.add(G.sphere(18, 12), fur, { pos: [0, 0.6, -0.22], scale: [0.46, 0.6, 0.38] });
    b.add(G.sphere(18, 12), cream, { pos: [0, 0.48, -0.06], scale: [0.38, 0.44, 0.26] });
    b.add(G.sphere(16, 8), cream, { pos: [0, 0.3, 0.02], scale: [0.38, 0.12, 0.3] });
    for (let i = 0; i < 5; i++) b.add(G.prism(), '#6a6c70', { pos: [-0.16 + i * 0.08, 0.76 - (i % 2) * 0.02, 0.17], rot: [Math.PI / 2 - 0.3, 0, Math.PI], scale: [0.05, 0.03, 0.02] });
    for (const x of [-1, 1]) {
      b.add(G.cone(8), fur, { pos: [x * 0.16, 1.24, -0.24], rot: [0, 0, x * -0.15], scale: [0.06, 0.2, 0.05] });
      b.add(G.sphere(10, 8), '#ffffff', { pos: [x * 0.17, 1.0, 0.07], scale: [0.065, 0.065, 0.03] });
      b.add(G.sphere(8, 6), '#1a1a1a', { pos: [x * 0.16, 1.0, 0.095], scale: [0.03, 0.03, 0.015] });
      for (const t of [-0.15, 0, 0.15]) b.add(G.box(), '#3a3a3a', { pos: [x * 0.3, 0.92 + t * 0.2, 0.06], rot: [0, -x * 0.4, t * x], scale: [0.16, 0.006, 0.006] });
      b.add(G.sphere(10, 8), fur, { pos: [x * 0.42, 0.5, -0.14], rot: [0, 0, x * 0.3], scale: [0.09, 0.22, 0.1] });
      b.add(G.sphere(10, 6), fur, { pos: [x * 0.24, 0.07, 0.24], scale: [0.11, 0.07, 0.14] });
    }
    b.add(G.sphere(8, 6), '#2a2a2a', { pos: [0, 0.95, 0.12], scale: [0.04, 0.02, 0.02] });
    rod(b, '#5a7a2a', [0.44, 0.6, -0.12], [0.5, 1.5, -0.14], 0.018, 5);
    b.add(G.dome(14), '#4a9a3a', { pos: [0.48, 1.46, -0.1], scale: [0.36, 0.12, 0.3] });
    for (let i = 0; i < 6; i++) b.add(G.box(), '#3a7a2a', { pos: [0.48, 1.5, -0.1], rot: [0, (i / 6) * Math.PI, 0.25], scale: [0.6, 0.006, 0.01] });
  },
  hoard(b) {
    // A dragon's hoard: a mound of gold coins with gems, a crown and a goblet, a sword stuck in, the tail round it.
    const gold = '#e8b83a';
    const c: Vec3 = [0, 0, 0];
    const r: Vec3 = [0.46, 0.42, 0.44];
    b.add(G.dome(18), '#d8a42a', { pos: c, scale: r });
    domeSpots(b, '#f6d25a', c, r, 40, 0.07, 1, 0.05);
    domeSpots(b, '#c8901a', c, r, 24, 0.06, 4, 0.05);
    domeSpots(b, '#d8202a', c, r, 4, 0.04, 7, 0.1);
    domeSpots(b, '#2ab86a', c, r, 4, 0.04, 9, 0.1);
    for (let i = 0; i < 9; i++) {
      const a = i * 0.7 + 0.3;
      b.add(G.cyl(12), gold, { pos: [Math.sin(a) * (0.5 + (i % 3) * 0.04), 0.01, Math.cos(a) * (0.5 + (i % 3) * 0.04)], rot: [i * 0.2, 0, 0], scale: [0.04, 0.012, 0.04] });
    }
    const cr = at([0.3, 0.2, 0.22], [0.4, 0, -0.5]);
    b.add(G.cyl(12), gold, { scale: [0.08, 0.05, 0.08] }, cr);
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      b.add(G.cone(4), gold, { pos: [Math.sin(a) * 0.07, 0.05, Math.cos(a) * 0.07], scale: [0.02, 0.05, 0.02] }, cr);
    }
    b.add(G.taper(1.6, 10), '#c8c8d0', { pos: [-0.3, 0.32, -0.12], scale: [0.04, 0.08, 0.04] });
    rod(b, '#c8c8d0', [-0.3, 0.2, -0.12], [-0.3, 0.28, -0.12], 0.01, 4);
    rod(b, '#d8dce2', [0.06, 0.3, -0.34], [0.12, 0.84, -0.44], 0.02, 4);
    b.add(G.box(), gold, { pos: [0.115, 0.8, -0.435], rot: [0.18, 0, -0.11], scale: [0.18, 0.025, 0.025] });
    b.add(G.sphere(6, 4), '#d8202a', { pos: [0.125, 0.94, -0.455], scale: 0.025 });
    rod(b, '#5a3a20', [0.12, 0.82, -0.44], [0.125, 0.92, -0.455], 0.014, 4);
    // The dragon's tail, curled round the back.
    b.add(arc(0.12, Math.PI * 1.1, 6, 14), '#3a7a3a', { pos: [0, 0.05, 0], rot: [Math.PI / 2, 0, 0.3], scale: 0.52 });
    for (let i = 0; i < 7; i++) {
      const a = 0.3 + (i / 7) * Math.PI * 1.1;
      b.add(G.cone(4), '#2a5a2a', { pos: [Math.cos(a) * 0.52, 0.11, -Math.sin(a) * 0.52], scale: [0.025, 0.07, 0.025] });
    }
    const tip = 0.3 + Math.PI * 1.1;
    b.add(G.cone(4), '#2a5a2a', { pos: [Math.cos(tip) * 0.52 + 0.03, 0.05, -Math.sin(tip) * 0.52 + 0.06], rot: [Math.PI / 2, 0, -0.5], scale: [0.06, 0.12, 0.02] });
  },
  armourthrone(b) {
    // A throne made like a red-and-gold suit of armour: the round light in its chest, the gold mask on top, arms
    // like gauntlets with glowing palms.
    const red = '#b81e28';
    const gold = '#e8b84a';
    const blue = '#bff4ff';
    b.add(G.box(), '#4a1418', { pos: [0, 0.18, 0], scale: [0.56, 0.36, 0.5] });
    b.add(G.rbox(0.2), red, { pos: [0, 0.38, 0.0], scale: [0.5, 0.08, 0.48] });
    b.add(G.box(), gold, { pos: [0, 0.18, 0.252], scale: [0.4, 0.16, 0.01] });
    b.add(G.rbox(0.25), red, { pos: [0, 0.86, -0.32], scale: [0.6, 0.9, 0.14] });
    for (const x of [-1, 1]) b.add(G.box(), gold, { pos: [x * 0.16, 0.86, -0.248], rot: [0, 0, x * 0.25], scale: [0.14, 0.5, 0.012] });
    b.add(G.cyl(16), '#5a6a70', { pos: [0, 0.98, -0.245], rot: [Math.PI / 2, 0, 0], scale: [0.09, 0.02, 0.09] });
    b.add(G.cyl(16), blue, { pos: [0, 0.98, -0.235], rot: [Math.PI / 2, 0, 0], scale: [0.065, 0.02, 0.065] });
    // The mask on top.
    const m = at([0, 1.42, -0.32]);
    b.add(G.sphere(16, 10), red, { scale: [0.2, 0.22, 0.17] }, m);
    b.add(G.rbox(0.3), gold, { pos: [0, -0.02, 0.1], scale: [0.26, 0.3, 0.1] }, m);
    for (const x of [-1, 1]) b.add(G.box(), blue, { pos: [x * 0.06, 0.03, 0.152], rot: [0, 0, x * -0.15], scale: [0.07, 0.022, 0.01] }, m);
    b.add(G.box(), '#9a7a2a', { pos: [0, -0.1, 0.152], scale: [0.1, 0.008, 0.008] }, m);
    for (const x of [-1, 1]) {
      b.add(G.rbox(0.3), red, { pos: [x * 0.32, 0.56, -0.04], scale: [0.12, 0.12, 0.5] });
      b.add(G.box(), gold, { pos: [x * 0.32, 0.56, -0.04], scale: [0.125, 0.04, 0.4] });
      b.add(G.rbox(0.3), red, { pos: [x * 0.32, 0.36, 0.14], scale: [0.1, 0.32, 0.1] });
      b.add(G.rbox(0.3), red, { pos: [x * 0.32, 0.6, 0.27], scale: [0.14, 0.12, 0.08] });
      b.add(G.cyl(12), blue, { pos: [x * 0.32, 0.6, 0.312], rot: [Math.PI / 2, 0, 0], scale: [0.035, 0.01, 0.035] });
    }
  },
};

// ---------------------------------------------------------------- the gravestones

export const GAG_GRAVE_PAINT: Record<GagGraveId, GraveDesign> = {
  petrock: {
    // A pet rock with googly eyes in its cardboard box, on a bed of straw.
    paint(b) {
      const card = '#c8a070';
      b.add(G.box(), card, { pos: [0, 0.12, 0], scale: [0.5, 0.24, 0.36] });
      b.add(G.box(), '#e2c48a', { pos: [0, 0.236, 0], scale: [0.46, 0.01, 0.32] });
      for (const z of [-1, 1]) b.add(G.box(), card, { pos: [0, 0.3, z * 0.22], rot: [z * 0.7, 0, 0], scale: [0.5, 0.012, 0.16] });
      b.add(G.sphere(12, 8), '#7a7670', { pos: [0, 0.3, -0.01], scale: [0.16, 0.1, 0.12] });
      for (const x of [-1, 1]) {
        b.add(G.cyl(12), '#ffffff', { pos: [x * 0.05, 0.34, 0.1], rot: [Math.PI / 2 - 0.4, 0, 0], scale: [0.035, 0.01, 0.035] });
        b.add(G.sphere(6, 4), '#1a1a1a', { pos: [x * 0.05 + 0.01, 0.335, 0.11], scale: [0.016, 0.016, 0.01] });
      }
      for (let i = 0; i < 10; i++) b.add(G.box(), '#e8cc6a', { pos: [-0.2 + i * 0.045, 0.25, 0.12 - (i % 3) * 0.1], rot: [0, i * 0.9, 0.2], scale: [0.1, 0.006, 0.006] });
    },
    plate: { y: 0.12, z: 0.182, w: 0.44, h: 0.16, bg: '#c8a070', fg: '#3a2410' },
  },
  sock: {
    // A washing line with one lonely striped sock pegged out, the name on a board hung below.
    paint(b) {
      for (const x of [-1, 1]) rod(b, '#8a6a44', [x * 0.38, 0, 0], [x * 0.38, 1.0, 0], 0.025, 6);
      rod(b, '#e8e8e8', [-0.38, 0.96, 0], [0.38, 0.96, 0], 0.005, 4);
      const s = at([0.06, 0.96, 0.01]);
      const cols = ['#d8302a', '#f4f0e6', '#2a6ad8'];
      for (let i = 0; i < 5; i++) b.add(G.box(), cols[i % 3], { pos: [0, -0.03 - i * 0.05, 0], scale: [0.1, 0.05, 0.03] }, s);
      b.add(G.box(), cols[0], { pos: [0.05, -0.29, 0], rot: [0, 0, 0.1], scale: [0.18, 0.08, 0.03] }, s);
      b.add(G.sphere(8, 5), '#f4f0e6', { pos: [0.13, -0.29, 0], scale: [0.04, 0.04, 0.016] }, s);
      for (const x of [-0.04, 0.04]) b.add(G.box(), '#c8a060', { pos: [x, 0.01, 0.018], scale: [0.012, 0.06, 0.012] }, s);
      for (const x of [-0.2, -0.12]) b.add(G.box(), '#c8a060', { pos: [x, 0.95, 0.008], scale: [0.012, 0.06, 0.012] });
      rod(b, '#c8a878', [-0.34, 0.96, 0], [-0.24, 0.62, 0.02], 0.004, 3);
      rod(b, '#c8a878', [0.34, 0.96, 0], [0.24, 0.62, 0.02], 0.004, 3);
      b.add(G.box(), '#b08a52', { pos: [0, 0.52, 0.02], scale: [0.52, 0.22, 0.03] });
    },
    plate: { y: 0.52, z: 0.036, w: 0.48, h: 0.18, bg: '#b08a52', fg: '#2a1a0a' },
  },
  notfound: {
    // A big browser window on legs: an empty page, 404 in grey, and the name underneath.
    paint(b) {
      for (const x of [-1, 1]) b.add(G.box(), '#5a5e64', { pos: [x * 0.26, 0.15, -0.02], scale: [0.04, 0.3, 0.04] });
      b.add(G.box(), '#f4f6f8', { pos: [0, 0.6, 0], scale: [0.7, 0.66, 0.05] });
      b.add(G.box(), '#c4cad2', { pos: [0, 0.9, 0.002], scale: [0.7, 0.07, 0.052] });
      for (const [x, c] of [
        [-0.3, '#e8584a'],
        [-0.26, '#f2c03a'],
        [-0.22, '#4ac05a'],
      ] as const) {
        b.add(G.cyl(10), c, { pos: [x, 0.9, 0.03], rot: [Math.PI / 2, 0, 0], scale: [0.013, 0.006, 0.013] });
      }
      words(b, '404', '#8a96a6', 0.034, at([0, 0.66, 0.026]), 0.01);
    },
    plate: { y: 0.39, z: 0.027, w: 0.56, h: 0.15, bg: '#f4f6f8', fg: '#4a5666' },
  },
  pressf: {
    // One big keyboard key with an F on it, on a dark slab with the name, and a few flowers laid by it.
    paint(b) {
      b.add(G.box(), '#2a2c30', { pos: [0, 0.1, 0], scale: [0.68, 0.2, 0.5] });
      b.add(G.taper(0.78, 4), '#5a5e66', { pos: [0, 0.32, -0.04], rot: [0, Math.PI / 4, 0], scale: [0.3, 0.24, 0.3] });
      b.add(G.taper(0.86, 4), '#e8eaee', { pos: [0, 0.35, -0.04], rot: [0, Math.PI / 4, 0], scale: [0.27, 0.26, 0.27] });
      words(b, 'F', '#2a2c30', 0.04, at([0, 0.482, -0.04], [-Math.PI / 2, 0, 0]), 0.006);
      for (const [x, c] of [
        [0.24, '#e8584a'],
        [0.28, '#f2d04a'],
        [0.21, '#f4f4f4'],
      ] as const) {
        rod(b, '#4a8a3a', [x, 0.2, 0.18], [x + 0.06, 0.21, -0.02], 0.006, 3);
        b.add(G.sphere(8, 5), c, { pos: [x, 0.215, 0.19], scale: [0.03, 0.02, 0.03] });
      }
    },
    plate: { y: 0.1, z: 0.252, w: 0.6, h: 0.15, bg: '#2a2c30', fg: '#e8eaee' },
  },
  ragequit: {
    // A short stone, and a game controller smashed in front of it: two halves, buttons and the cable everywhere.
    paint(b) {
      headstone(b, stone, 0.5, 0.42, -0.12, 0.12);
      for (const [x, a] of [
        [-0.12, 0.5],
        [0.14, -0.4],
      ]) {
        const h = at([x, 0.05, 0.2], [0, a, x > 0 ? 0.3 : -0.2], 1.5);
        b.add(G.rbox(0.3), '#2a2a30', { pos: [0, 0, 0], scale: [0.14, 0.05, 0.1] }, h);
        b.add(G.sphere(10, 6), '#2a2a30', { pos: [Math.sign(x) * 0.07, -0.01, 0.05], scale: [0.05, 0.035, 0.07] }, h);
        b.add(G.cyl(8), '#4a4a50', { pos: [0, 0.03, 0], scale: [0.025, 0.02, 0.025] }, h);
      }
      for (const [x, z, c] of [
        [0.0, 0.32, '#e2302a'],
        [0.06, 0.38, '#2ad06a'],
        [-0.2, 0.36, '#2a8af0'],
        [0.28, 0.3, '#f2c42a'],
      ] as const) {
        b.add(G.cyl(8), c, { pos: [x, 0.01, z], scale: [0.02, 0.015, 0.02] });
      }
      rod(b, '#1a1a1a', [-0.14, 0.03, 0.12], [-0.3, 0.01, 0.0], 0.008, 4);
      rod(b, '#1a1a1a', [-0.3, 0.01, 0.0], [-0.34, 0.01, 0.22], 0.008, 4);
      for (let i = 0; i < 4; i++) b.add(G.box(), '#4a4640', { pos: [-0.06 + i * 0.05, 0.56 - i * 0.04, -0.058], rot: [0, 0, 0.6 - i * 0.5], scale: [0.08, 0.008, 0.004] });
    },
    plate: { y: 0.22, z: -0.058, w: 0.42, h: 0.18, bg: stone, fg: ink },
  },
  floppy: {
    // A floppy disk the size of a gravestone (never saved): the metal shutter, the label with the name.
    paint(b) {
      b.add(G.box(), rock, { pos: [0, 0.05, 0], scale: [0.66, 0.1, 0.24] });
      const disk = flat('floppy', 0.06, (s) => {
        s.moveTo(-0.3, -0.3);
        s.lineTo(0.3, -0.3);
        s.lineTo(0.3, 0.25);
        s.lineTo(0.25, 0.3);
        s.lineTo(-0.3, 0.3);
        s.closePath();
      });
      b.add(disk, '#1e2a4a', { pos: [0, 0.4, 0] });
      b.add(G.box(), '#b8bec6', { pos: [0.03, 0.6, 0], scale: [0.3, 0.2, 0.064] });
      b.add(G.box(), '#2a2e36', { pos: [0.08, 0.6, 0], scale: [0.07, 0.14, 0.066] });
      b.add(G.box(), '#f4f2ea', { pos: [0, 0.3, 0], scale: [0.48, 0.24, 0.062] });
      b.add(G.box(), '#1a1a22', { pos: [-0.25, 0.14, 0], scale: [0.04, 0.04, 0.066] });
    },
    plate: { y: 0.3, z: 0.032, w: 0.44, h: 0.2, bg: '#f4f2ea', fg: '#1e2a4a' },
  },
  snowman: {
    // All that's left of a snowman: a slushy puddle, a lump, his carrot, coal, hat and scarf, two twig arms.
    paint(b) {
      b.add(G.cyl(18), '#bcd8ea', { pos: [0, 0.006, 0.02], scale: [0.42, 0.012, 0.36] });
      b.add(G.sphere(12, 8), '#f4f8fc', { pos: [-0.04, 0.05, -0.06], scale: [0.24, 0.1, 0.2] });
      b.add(G.sphere(10, 6), '#eef4fa', { pos: [0.12, 0.04, 0.04], scale: [0.12, 0.06, 0.1] });
      b.add(G.cone(8), '#f08a1a', { pos: [0.14, 0.03, 0.22], rot: [0, 0, Math.PI / 2 - 0.1], scale: [0.03, 0.14, 0.03] });
      for (const [x, z] of [
        [-0.04, 0.12],
        [0.03, 0.15],
        [-0.2, 0.18],
        [-0.12, 0.25],
      ]) {
        b.add(G.sphere(6, 4), '#1a1a1a', { pos: [x, 0.03, z], scale: 0.025 });
      }
      const hat = at([-0.18, 0.12, -0.12], [0, 0, 1.3]);
      b.add(G.cyl(14), '#1a1a1e', { scale: [0.1, 0.18, 0.1] }, hat);
      b.add(G.cyl(14), '#1a1a1e', { pos: [0, -0.09, 0], scale: [0.16, 0.012, 0.16] }, hat);
      b.add(G.cyl(14), '#c8202a', { pos: [0, -0.06, 0], scale: [0.102, 0.03, 0.102] }, hat);
      b.add(G.box(), '#2a8a4a', { pos: [0.1, 0.11, -0.06], rot: [0, 0.5, 0.2], scale: [0.36, 0.03, 0.08] });
      b.add(G.box(), '#2a8a4a', { pos: [0.26, 0.04, 0.0], rot: [0, 0.9, -0.6], scale: [0.16, 0.025, 0.07] });
      for (const [a, x] of [
        [0.4, -0.3],
        [-0.3, 0.28],
      ]) {
        rod(b, '#5a3a20', [x, 0.03, -0.1], [x + Math.sin(a) * 0.2, 0.02, -0.1 + Math.cos(a) * 0.2], 0.008, 4);
      }
      plaque(b, rock, 0.36, 0.4, 0.18);
    },
    plate: plateOf(rock, 0.36, ink, 0.4, 0.18),
  },
  brickphone: {
    // An old brick of a mobile phone standing as the stone, the name on its little green screen; the slab it fell on
    // is cracked, the phone's fine.
    paint(b) {
      b.add(G.box(), rock, { pos: [0, 0.05, 0], scale: [0.6, 0.1, 0.36] });
      for (let i = 0; i < 4; i++) b.add(G.box(), '#4a4640', { pos: [-0.18 + i * 0.1, 0.101, 0.1 - (i % 2) * 0.05], rot: [0, 0.7 - i * 0.5, 0], scale: [0.12, 0.004, 0.008] });
      b.add(G.rbox(0.15), '#4a5260', { pos: [0, 0.54, 0], scale: [0.38, 0.88, 0.16] });
      b.add(G.box(), '#2a2e36', { pos: [0, 0.74, 0.08], scale: [0.32, 0.26, 0.01] });
      for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 3; c++) b.add(G.box(), '#c8ccd2', { pos: [(c - 1) * 0.09, 0.44 - r * 0.07, 0.085], scale: [0.065, 0.045, 0.02] });
      }
      b.add(G.rbox(0.3), '#3ab04a', { pos: [-0.09, 0.53, 0.085], scale: [0.07, 0.04, 0.02] });
      b.add(G.rbox(0.3), '#d83a3a', { pos: [0.09, 0.53, 0.085], scale: [0.07, 0.04, 0.02] });
      b.add(G.cyl(8), '#2a2e36', { pos: [0.12, 1.06, 0], scale: [0.025, 0.2, 0.025] });
    },
    plate: { y: 0.74, z: 0.086, w: 0.28, h: 0.2, bg: '#9ab84a', fg: '#1a2a10' },
  },
  loading: {
    // A loading screen on a stand, its bar stuck at 99% for ever, a spinner beside it and the name below.
    paint(b, glow) {
      for (const x of [-1, 1]) b.add(G.box(), '#3a3e46', { pos: [x * 0.26, 0.2, -0.02], scale: [0.04, 0.4, 0.04] });
      b.add(G.box(), '#1a1e26', { pos: [0, 0.68, 0], scale: [0.74, 0.58, 0.06] });
      b.add(G.box(), '#3a404c', { pos: [0, 0.78, 0.032], scale: [0.6, 0.08, 0.004] });
      glow.add(G.box(), '#3ad86a', { pos: [-0.004, 0.78, 0.036], scale: [0.584, 0.06, 0.004] });
      words(glow, '99%', '#f4f4f4', 0.02, at([0.18, 0.89, 0.034]), 0.004);
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        glow.add(G.sphere(6, 4), i < 3 ? '#f4f4f4' : '#6a7080', { pos: [-0.22 + Math.sin(a) * 0.04, 0.89 + Math.cos(a) * 0.04, 0.034], scale: 0.012 });
      }
    },
    plate: { y: 0.55, z: 0.032, w: 0.6, h: 0.16, bg: '#1a1e26', fg: '#e8ecf4' },
  },
  cakelie: {
    // A chocolate cake on a stand, white icing running down, a cherry and one candle still burning. A lie.
    paint(b, glow) {
      b.add(G.cyl(14), '#f4f4f0', { pos: [0, 0.12, -0.04], scale: [0.06, 0.24, 0.06] });
      b.add(G.cyl(18), '#f4f4f0', { pos: [0, 0.02, -0.04], scale: [0.16, 0.04, 0.16] });
      b.add(G.cyl(20), '#f4f4f0', { pos: [0, 0.25, -0.04], scale: [0.3, 0.02, 0.3] });
      b.add(G.cyl(20), '#4a2618', { pos: [0, 0.38, -0.04], scale: [0.25, 0.24, 0.25] });
      b.add(G.cyl(20), '#f4eee4', { pos: [0, 0.38, -0.04], scale: [0.252, 0.025, 0.252] });
      b.add(G.cyl(20), '#f8f4ec', { pos: [0, 0.5, -0.04], scale: [0.255, 0.02, 0.255] });
      for (let i = 0; i < 10; i++) {
        const a = (i / 10) * Math.PI * 2;
        const len = 0.04 + (i % 3) * 0.03;
        b.add(G.box(), '#f8f4ec', { pos: [Math.sin(a) * 0.252, 0.5 - len / 2, -0.04 + Math.cos(a) * 0.252], rot: [0, a, 0], scale: [0.04, len, 0.01] });
        b.add(G.sphere(8, 5), '#d8202a', { pos: [Math.sin(a) * 0.2, 0.52, -0.04 + Math.cos(a) * 0.2], scale: 0.025 });
      }
      b.add(G.cyl(8), '#f4f4f0', { pos: [0, 0.57, -0.04], scale: [0.015, 0.12, 0.015] });
      for (let i = 0; i < 3; i++) b.add(G.box(), '#e85a8a', { pos: [0, 0.53 + i * 0.04, -0.04], rot: [0, 0, 0.4], scale: [0.032, 0.008, 0.032] });
      glow.add(G.sphere(8, 6), '#ffd25a', { pos: [0, 0.66, -0.04], scale: [0.02, 0.035, 0.02] });
      plaque(b, rock, 0.32, 0.44, 0.2);
    },
    plate: plateOf(rock, 0.32, ink),
  },
  hourglass: {
    // An hourglass whose sand has all run out, its frame on a stone plinth with the name.
    paint(b) {
      b.add(G.box(), rock, { pos: [0, 0.1, 0], scale: [0.5, 0.2, 0.4] });
      const wood = '#7a4a2a';
      for (const y of [0.23, 0.97]) b.add(G.cyl(16), wood, { pos: [0, y, 0], scale: [0.2, 0.05, 0.2] });
      for (let i = 0; i < 3; i++) {
        const a = (i / 3) * Math.PI * 2 + 0.3;
        b.add(G.cyl(8), wood, { pos: [Math.sin(a) * 0.17, 0.6, Math.cos(a) * 0.17], scale: [0.016, 0.72, 0.016] });
      }
      // The glass, drawn only as its outline (it's clear), and the sand all in the bottom half.
      b.add(G.cone(16), '#e8c87a', { pos: [0, 0.34, 0], scale: [0.12, 0.17, 0.12] });
      b.add(G.cyl(16), '#e8c87a', { pos: [0, 0.27, 0], scale: [0.12, 0.04, 0.12] });
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        for (const s of [-1, 1]) {
          const yA = s < 0 ? 0.255 : 0.945;
          rod(b, '#d8eef6', [Math.sin(a) * 0.13, yA, Math.cos(a) * 0.13], [Math.sin(a) * 0.14, 0.6 + s * 0.2, Math.cos(a) * 0.14], 0.004, 3);
          rod(b, '#d8eef6', [Math.sin(a) * 0.14, 0.6 + s * 0.2, Math.cos(a) * 0.14], [Math.sin(a) * 0.018, 0.6, Math.cos(a) * 0.018], 0.004, 3);
        }
      }
    },
    plate: { y: 0.1, z: 0.202, w: 0.44, h: 0.15, bg: rock, fg: ink },
  },
  jenga: {
    // A wooden block tower that's lost its last game: half still standing, the top half tumbled over the grass.
    paint(b) {
      const wood = ['#e2c08a', '#d8b47a', '#ecca94'];
      const bw = 0.075;
      const bl = 0.24;
      const bh = 0.045;
      const gone = new Set(['2:1', '4:0', '5:2', '7:1', '8:0']);
      for (let l = 0; l < 10; l++) {
        for (let i = 0; i < 3; i++) {
          if (gone.has(`${l}:${i}`)) continue;
          const o = (i - 1) * bw;
          const y = (l + 0.5) * bh;
          b.add(G.box(), wood[(l + i) % 3], l % 2 ? { pos: [o, y, -0.1], scale: [bw * 0.97, bh * 0.96, bl] } : { pos: [0, y, -0.1 + o], scale: [bl, bh * 0.96, bw * 0.97] });
        }
      }
      for (let i = 0; i < 9; i++) {
        const a = i * 2.3;
        const r = 0.2 + ((i * 0.37) % 1) * 0.15;
        b.add(G.box(), wood[i % 3], { pos: [Math.sin(a) * r, bh / 2 + (i === 4 ? bh : 0), -0.05 + Math.cos(a) * r * 0.6], rot: [0, a * 1.3, i === 2 ? 0.3 : 0], scale: [bl, bh * 0.96, bw * 0.97] });
      }
      plaque(b, rock, 0.34);
    },
    plate: plateOf(rock, 0.34, ink),
  },
  anvildrop: {
    // A cartoon anvil dropped from a great height into a crater, stars spinning over it and a little white flag
    // poking out from underneath.
    paint(b) {
      b.add(G.cyl(18), '#6a5a42', { pos: [0, 0.006, 0], scale: [0.4, 0.012, 0.34] });
      ring(b, '#8a7a5a', [0, 0.02, 0], 0.4, 0.08, [Math.PI / 2, 0, 0]);
      const dark = '#3a3c42';
      b.add(G.box(), dark, { pos: [0, 0.06, -0.04], scale: [0.36, 0.12, 0.26] });
      b.add(G.box(), dark, { pos: [0, 0.18, -0.04], scale: [0.18, 0.14, 0.16] });
      b.add(G.box(), dark, { pos: [-0.04, 0.3, -0.04], scale: [0.44, 0.1, 0.2] });
      b.add(G.cone(10), dark, { pos: [0.26, 0.3, -0.04], rot: [0, 0, -Math.PI / 2], scale: [0.07, 0.18, 0.05] });
      b.add(G.box(), '#5a5c64', { pos: [-0.04, 0.352, -0.04], scale: [0.42, 0.004, 0.18] });
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI * 2;
        const m = at([Math.sin(a) * 0.2, 0.62 + Math.cos(a * 2) * 0.02, -0.04 + Math.cos(a) * 0.14], [0, a, 0]);
        b.add(G.cone(5), '#ffd23a', { pos: [0, 0, 0], rot: [Math.PI / 2, 0, 0], scale: [0.04, 0.012, 0.04] }, m);
      }
      rod(b, '#8a6a44', [-0.16, 0.02, 0.1], [-0.24, 0.24, 0.14], 0.006, 4);
      b.add(G.box(), '#f8f8f4', { pos: [-0.2, 0.2, 0.14], rot: [0, 0, -0.35], scale: [0.09, 0.06, 0.004] });
      plaque(b, rock, 0.38, 0.42, 0.18);
    },
    plate: plateOf(rock, 0.38, ink, 0.42, 0.18),
  },
  bluescreen: {
    // An old computer on a stone desk, its screen gone blue with a sad face, the name where the error would be.
    paint(b, glow) {
      b.add(G.box(), rock, { pos: [0, 0.2, 0], scale: [0.66, 0.4, 0.44] });
      b.add(G.box(), '#d8d4c8', { pos: [0, 0.42, -0.02], scale: [0.3, 0.04, 0.2] });
      b.add(G.box(), '#d8d4c8', { pos: [0, 0.48, -0.02], scale: [0.06, 0.08, 0.06] });
      b.add(G.box(), '#d8d4c8', { pos: [0, 0.75, -0.04], scale: [0.6, 0.46, 0.12] });
      b.add(G.box(), '#c4c0b4', { pos: [0, 0.75, -0.14], scale: [0.4, 0.3, 0.12] });
      glow.add(G.box(), '#1a5ad8', { pos: [0, 0.76, 0.022], scale: [0.52, 0.38, 0.004] });
      words(glow, ':(', '#ffffff', 0.024, at([-0.18, 0.86, 0.026]), 0.004);
      b.add(G.box(), '#c8c4b8', { pos: [0, 0.41, 0.15], rot: [0.1, 0, 0], scale: [0.4, 0.02, 0.12] });
    },
    plate: { y: 0.71, z: 0.028, w: 0.46, h: 0.15, bg: '#1a5ad8', fg: '#ffffff' },
  },
  pocketpet: {
    // A giant egg-shaped pocket pet, its little pixel creature on the screen gone to a ghost. Feed them next time.
    paint(b, glow) {
      b.add(G.sphere(18, 12), '#b86ad8', { pos: [0, 0.48, -0.06], scale: [0.3, 0.42, 0.16] });
      domeSpots(b, '#e8a8f4', [0, 0.48, -0.06], [0.3, 0.42, 0.16], 10, 0.03, 3, -0.6);
      b.add(G.rbox(0.2), '#3a2a4a', { pos: [0, 0.54, 0.07], scale: [0.3, 0.28, 0.04] });
      glow.add(G.box(), '#c8d8a8', { pos: [0, 0.54, 0.092], scale: [0.24, 0.22, 0.004] });
      pixels(glow, ['..###..', '.#####.', '.#.#.#.', '.#####.', '.#####.', '.#.#.#.'], '#3a4a2a', 0.022, at([0, 0.55, 0.094]), 0.004);
      for (let i = 0; i < 3; i++) b.add(G.cyl(10), '#f2d04a', { pos: [(i - 1) * 0.08, 0.3, 0.07 - Math.abs(i - 1) * 0.01], rot: [Math.PI / 2 - 0.4, 0, 0], scale: [0.03, 0.02, 0.03] });
      ring(b, '#c8ccd2', [0, 0.92, -0.06], 0.07, 0.15, [0, Math.PI / 2, 0]);
      plaque(b, rock, 0.32);
    },
    plate: plateOf(rock, 0.32, ink),
  },
  youdied: {
    // A long dark stone with YOU DIED glowing red across it, and a little bonfire with a coiled sword in its ashes.
    paint(b, glow) {
      b.add(G.box(), '#2a2828', { pos: [0, 0.3, -0.06], scale: [0.72, 0.6, 0.12] });
      b.add(G.box(), '#121010', { pos: [0, 0.46, 0.002], scale: [0.72, 0.13, 0.002] });
      words(glow, 'YOU DIED', '#b81a1a', 0.014, at([0, 0.46, 0.006]), 0.004);
      const f = at([0.24, 0, 0.26]);
      b.add(G.cyl(12), '#3a3430', { pos: [0, 0.02, 0], scale: [0.12, 0.04, 0.12] }, f);
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        b.add(G.box(), '#5a5048', { pos: [Math.sin(a) * 0.08, 0.05, Math.cos(a) * 0.08], rot: [0, a, 0.6], scale: [0.02, 0.1, 0.02] }, f);
      }
      rod(b, '#6a6a70', [0.24, 0.04, 0.26], [0.22, 0.34, 0.24], 0.012, 4);
      for (let i = 0; i < 3; i++) b.add(G.torus(0.2, 4, 10), '#8a8a90', { pos: [0, 0.1 + i * 0.06, 0], rot: [Math.PI / 2, 0, 0], scale: 0.02 }, f);
      b.add(G.box(), '#3a3a40', { pos: [-0.01, 0.34, 0], scale: [0.08, 0.012, 0.012] }, f);
      glow.add(G.cone(6), '#f08a1a', { pos: [0, 0.1, 0], scale: [0.06, 0.14, 0.06] }, f);
      glow.add(G.cone(6), '#ffd25a', { pos: [0.01, 0.08, 0.01], scale: [0.035, 0.09, 0.035] }, f);
    },
    plate: { y: 0.24, z: 0.002, w: 0.6, h: 0.16, bg: '#2a2828', fg: '#d8d0c0' },
  },
  wasted: {
    // A grey stone with WASTED glowing red across a black band, a traffic cone knocked over by it.
    paint(b, glow) {
      headstone(b, '#8a8a8a', 0.62, 0.66, 0, 0.14);
      b.add(G.box(), '#121212', { pos: [0, 0.6, 0.002], scale: [0.62, 0.14, 0.142] });
      words(glow, 'WASTED', '#e2302a', 0.017, at([0, 0.6, 0.074]), 0.004);
      const c = at([0.34, 0.08, 0.2], [0, 0.4, Math.PI / 2]);
      b.add(G.cone(12), '#f0701a', { pos: [0, 0, 0], scale: [0.07, 0.2, 0.07] }, c);
      b.add(G.cyl(12), '#f4f4f0', { pos: [0, 0.02, 0], scale: [0.046, 0.03, 0.046] }, c);
      b.add(G.box(), '#f0701a', { pos: [0, -0.1, 0], scale: [0.14, 0.015, 0.14] }, c);
    },
    plate: { y: 0.36, z: 0.072, w: 0.52, h: 0.18, bg: '#8a8a8a', fg: ink },
  },
  grumpycat: {
    // A statue of a very cross little cat on a plinth: the dark mask, half-shut eyes and the frown.
    paint(b) {
      b.add(G.box(), rock, { pos: [0, 0.12, 0], scale: [0.5, 0.24, 0.4] });
      const fur = '#f0e6d6';
      const mask = '#8a6a4e';
      b.add(G.sphere(14, 10), fur, { pos: [0, 0.42, -0.04], scale: [0.16, 0.2, 0.14] });
      for (const x of [-1, 1]) b.add(G.sphere(10, 6), fur, { pos: [x * 0.08, 0.27, 0.08], scale: [0.05, 0.04, 0.07] });
      b.add(G.sphere(10, 6), mask, { pos: [-0.13, 0.28, -0.12], rot: [0, 0.6, 0.4], scale: [0.04, 0.04, 0.14] });
      const h = at([0, 0.66, 0.0]);
      b.add(G.sphere(16, 12), fur, { scale: [0.17, 0.14, 0.15] }, h);
      b.add(G.sphere(12, 8), mask, { pos: [0, 0.01, 0.08], scale: [0.12, 0.08, 0.08] }, h);
      for (const x of [-1, 1]) {
        b.add(G.cone(4), mask, { pos: [x * 0.1, 0.14, -0.02], rot: [0, Math.PI / 4, x * -0.3], scale: [0.06, 0.08, 0.05] }, h);
        b.add(G.sphere(8, 6), '#4a7ab8', { pos: [x * 0.055, 0.03, 0.138], scale: [0.03, 0.022, 0.02] }, h);
        b.add(G.box(), mask, { pos: [x * 0.055, 0.05, 0.15], rot: [0, 0, x * 0.25], scale: [0.065, 0.014, 0.012] }, h);
        b.add(G.sphere(8, 6), fur, { pos: [x * 0.035, -0.045, 0.13], scale: [0.04, 0.03, 0.03] }, h);
      }
      b.add(G.sphere(6, 4), '#d88a9a', { pos: [0, -0.015, 0.152], scale: [0.018, 0.012, 0.01] }, h);
      b.add(arc(0.12, Math.PI, 6, 8), '#3a2a1e', { pos: [0, -0.085, 0.146], scale: [0.045, 0.03, 0.03] }, h);
    },
    plate: { y: 0.12, z: 0.202, w: 0.44, h: 0.16, bg: rock, fg: ink },
  },
  tpose: {
    // A glitch: a grey stone with a blank grey figure stuck half through it in a T-pose, tilted, and a cube of
    // the missing-texture check floating at its corner.
    paint(b) {
      headstone(b, stone, 0.56, 0.62, -0.06, 0.14);
      const f = at([0.08, 0.0, 0.1], [0.2, 0.3, -0.18]);
      const grey = '#c8c8cc';
      for (const x of [-1, 1]) b.add(G.box(), grey, { pos: [x * 0.05, 0.2, 0], scale: [0.07, 0.4, 0.08] }, f);
      b.add(G.box(), grey, { pos: [0, 0.54, 0], scale: [0.2, 0.3, 0.1] }, f);
      b.add(G.box(), grey, { pos: [0, 0.66, 0], scale: [0.66, 0.06, 0.07] }, f);
      b.add(G.sphere(10, 8), grey, { pos: [0, 0.78, 0], scale: [0.07, 0.08, 0.07] }, f);
      const cube = at([-0.3, 0.9, 0.0], [0.4, 0.6, 0.2]);
      for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) for (let k = 0; k < 2; k++) b.add(G.box(), (i + j + k) % 2 ? '#1a1a1a' : '#f02af0', { pos: [(i - 0.5) * 0.06, (j - 0.5) * 0.06, (k - 0.5) * 0.06], scale: 0.06 }, cube);
    },
    plate: { y: 0.3, z: 0.012, w: 0.46, h: 0.16, bg: stone, fg: ink },
  },
  coffindance: {
    // Six little pallbearers in suits and hats, dancing as they carry the coffin on their shoulders, the name on its side.
    paint(b) {
      b.add(G.box(), '#6a8a4a', { pos: [0, 0.01, 0], scale: [0.86, 0.02, 0.46] });
      for (let i = 0; i < 3; i++) {
        for (const z of [-1, 1]) {
          const x = (i - 1) * 0.26;
          bearer(b, at([x, 0, z * 0.15], [0, z > 0 ? 0 : Math.PI, 0]), (i + (z > 0 ? 0 : 1)) % 2 ? 0.14 : -0.14);
        }
      }
      b.add(G.box(), '#5a3424', { pos: [0, 0.68, 0], scale: [0.86, 0.12, 0.3] });
      b.add(G.box(), '#6a4030', { pos: [0, 0.76, 0], scale: [0.88, 0.04, 0.32] });
      for (const x of [-1, 1]) for (const z of [-1, 1]) b.add(G.box(), '#c8a040', { pos: [x * 0.36, 0.68, z * 0.152], scale: [0.08, 0.02, 0.01] });
    },
    plate: { y: 0.68, z: 0.151, w: 0.5, h: 0.1, bg: '#5a3424', fg: '#e8c870' },
  },
};
