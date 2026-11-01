import * as THREE from 'three';
import { rng } from '../build';
import { buildAnimal, type Rig } from '../animals';
import type { Anim } from '../types';
import { G, Paint, local, pick, shade } from './kit';
import { MARKET, MARKET_CART, MARKET_CROSS, MARKET_HAY, MARKET_POLES, MARKET_STALLS } from './layout';
import { IRON, STONE, STONE_DARK, WOOD, WOOD_DARK, WOOD_LIGHT, barrel, crate } from './props';
import { TextSign, signBoard } from './sign';

/**
 * The market north-east of the square: timber stalls under striped awnings, each with its wares (bolts of cloth,
 * baskets of produce, pots and hanging herbs, bread and cheese, buckets of flowers), round a little stone cross, with
 * a cart, hay and sacks by its open side and bunting strung overhead. All painted into the town's merged meshes in
 * the market's own frame (see MARKET in layout.ts); only its name board and the two stall-keepers are separate.
 */

const CREAM = '#f6ead2';
const WICKER = '#c49a5a';
const SACK = '#c9ad7a';
const PENNANTS = ['#c8423a', '#f6ead2', '#3f6a9a', '#e8b83a', '#4f8a4a'];

/** Where a stall's back posts stand behind its counter (and its keeper), and how high its awning starts and ends. */
const BACK = 0.8;
const POST_FRONT = 2.1;
const POST_BACK = 2.45;
/** The counters' height (low, for animals), and how far the wares on them sit below where they were first drawn. */
const TOP = 0.76;
const DROP = 0.16;
/** The step the stall-keepers stand on behind their counters, to see over them. */
const STEP = 0.22;

/** A shape placed by hand: at a spot, turned (y, then x), and scaled. */
function placed(p: Paint, geo: THREE.BufferGeometry, color: THREE.ColorRepresentation, x: number, y: number, z: number, ry: number, rx: number, sx: number, sy: number, sz: number) {
  const m = new THREE.Matrix4().makeTranslation(x, y, z).multiply(new THREE.Matrix4().makeRotationY(ry)).multiply(new THREE.Matrix4().makeRotationX(rx)).multiply(new THREE.Matrix4().makeScale(sx, sy, sz));
  p.geo(geo, color, m);
}

/** Paints the market into `p` (the market's frame); `glow` marks where a lantern shines at night. Returns its name board. */
export function market(p: Paint, glow: (p: Paint, x: number, y: number, z: number) => void): { object: THREE.Object3D; material: THREE.MeshLambertMaterial } {
  const r = rng(4242);
  // Trodden earth underfoot, a little paler in the middle, with flagstones round the cross.
  placed(p, G.cyl(24), '#b59a74', 0, 0.01, 0.5, 0, 0, 5.3, 0.02, 4.1);
  placed(p, G.cyl(20), '#c2a882', 0, 0.014, 0.7, 0, 0, 3.4, 0.02, 2.6);
  for (let k = 0; k < 12; k++) {
    const a = (k / 12) * Math.PI * 2;
    p.box(shade(STONE, ((k * 7) % 3) * 0.04 - 0.04), 0.42, 0.04, 0.32, MARKET_CROSS.lx + Math.cos(a) * 1.0, 0.02, MARKET_CROSS.lz + Math.sin(a) * 1.0, 0, -a, 0);
  }

  MARKET_STALLS.forEach((s, i) => stall(p.at(s.lx, 0, s.lz, s.ry), s, i, r, glow));
  marketCross(p.at(MARKET_CROSS.lx, 0, MARKET_CROSS.lz));
  cart(p.at(MARKET_CART.lx, 0, MARKET_CART.lz, MARKET_CART.ry), r);
  hay(p.at(MARKET_HAY.lx, 0, MARKET_HAY.lz, -0.3), r);

  // Barrels, crates and sacks tucked between the stalls.
  barrel(p.at(-1.75, 0, -2.55), r);
  crate(p.at(1.75, 0, -2.5), r, 0.6);
  crate(p.at(1.8, 0.6, -2.45), r, 0.42);
  sack(p.at(-4.55, 0, -0.2), r);
  sack(p.at(-4.2, 0, -0.55), r);
  sack(p.at(4.5, 0, -0.3), r);
  barrel(p.at(4.7, 0, 0.45, 0.4), r);

  // The bunting poles at the open side's corners, with a pennant each on top.
  for (const pole of MARKET_POLES) {
    p.post(WOOD_DARK, 0.06, 3.1, pole.lx, 0, pole.lz, 8);
    p.cyl(shade(WOOD_DARK, -0.1), 0.12, 0.08, pole.lx, 0.04, pole.lz, 8);
    p.sphere('#e8b83a', 0.07, 0.07, 0.07, pole.lx, 3.14, pole.lz, 8, 6);
    // A lantern on a hook, facing into the market.
    const inward = pole.lx < 0 ? 1 : -1;
    p.box(IRON, 0.22, 0.03, 0.03, pole.lx + inward * 0.1, 2.55, pole.lz);
    p.cyl(IRON, 0.08, 0.03, pole.lx + inward * 0.2, 2.45, pole.lz, 6);
    p.glass.cyl('#fff1c8', 0.06, 0.17, pole.lx + inward * 0.2, 2.35, pole.lz, 6);
    p.cyl(IRON, 0.08, 0.03, pole.lx + inward * 0.2, 2.25, pole.lz, 6);
    glow(p, pole.lx + inward * 0.2, 2.35, pole.lz);
  }
  // Bunting: across the open side, and from each pole back to the main stall's awning.
  const main = MARKET_STALLS[0];
  const top = (sx: number) => ({ lx: main.lx + sx * (main.w / 2 + 0.05), lz: main.lz - main.d / 2 - BACK, y: POST_BACK + 0.05 });
  const [L, R] = MARKET_POLES;
  bunting(p, L.lx, 2.95, L.lz, R.lx, 2.95, R.lz, 0.45);
  bunting(p, L.lx, 2.9, L.lz, top(-1).lx, top(-1).y, top(-1).lz, 0.35);
  bunting(p, R.lx, 2.9, R.lz, top(1).lx, top(1).y, top(1).lz, 0.35);
  bunting(p, top(-1).lx, top(-1).y, top(-1).lz, top(1).lx, top(1).y, top(1).lz, 0.1);

  // The name board over the main stall.
  const holder = new THREE.Group();
  holder.position.set(MARKET.x, 0, MARKET.z);
  holder.rotation.y = MARKET.ry;
  holder.name = 'market';
  const sign = new TextSign({ w: 1024, h: 224, bg: '#5a3a24', fg: '#f6d77a', border: '#d8a845', grain: true, round: true }, ['Ravenswood Market']);
  const board = signBoard(sign, 2.3, 0.5, { lit: true });
  board.mesh.position.set(main.lx, POST_BACK + 0.42, main.lz + 0.15);
  holder.add(board.mesh);
  p.box(WOOD_DARK, 0.06, 0.5, 0.06, main.lx - 0.9, POST_BACK + 0.15, main.lz + 0.1);
  p.box(WOOD_DARK, 0.06, 0.5, 0.06, main.lx + 0.9, POST_BACK + 0.15, main.lz + 0.1);
  return { object: holder, material: board.material };
}

/** One stall: a plank counter, four posts, a striped awning with a scalloped edge, and its wares. Front is +z. */
function stall(p: Paint, s: (typeof MARKET_STALLS)[number], i: number, r: () => number, glow: (p: Paint, x: number, y: number, z: number) => void) {
  const { w, d, stripe } = s;
  const hw = w / 2;
  // The counter: a planked box with a top that overhangs a little, and a cloth hung over its front.
  p.block(shade(WOOD, -0.05), w - 0.1, TOP - 0.08, d - 0.1, 0, 0, 0);
  for (let x = -hw + 0.25; x < hw; x += 0.42) p.box(shade(WOOD, ((x * 7) % 2) * 0.04), 0.36, TOP - 0.12, 0.03, x, (TOP - 0.12) / 2, d / 2 - 0.04);
  p.rbox(WOOD_LIGHT, w + 0.08, 0.07, d + 0.08, 0, TOP - 0.04, 0, 0.02);
  p.box(stripe, w * 0.7, 0.32, 0.02, 0, TOP - 0.18, d / 2 + 0.05);
  p.box(shade(stripe, -0.18), w * 0.7, 0.04, 0.025, 0, TOP - 0.34, d / 2 + 0.05);
  // The keeper's step behind it.
  p.block(WOOD_DARK, w * 0.6, STEP, 0.55, 0, 0, -d / 2 - 0.42);
  // Posts: short at the front, taller behind the keeper.
  const backZ = -d / 2 - BACK;
  const frontZ = d / 2 + 0.04;
  for (const sx of [-1, 1]) {
    p.block(WOOD_DARK, 0.1, POST_FRONT, 0.1, sx * (hw + 0.05), 0, frontZ);
    p.block(WOOD_DARK, 0.1, POST_BACK, 0.1, sx * (hw + 0.05), 0, backZ);
    // A rail along the side, up top, to hang things from.
    p.rod(WOOD_DARK, 0.03, sx * (hw + 0.05), POST_FRONT - 0.1, frontZ, sx * (hw + 0.05), POST_BACK - 0.1, backZ, 6);
  }
  p.box(WOOD_DARK, w + 0.2, 0.08, 0.08, 0, POST_FRONT - 0.04, frontZ);
  // The awning, in stripes, sloping out over the counter, and its scalloped edge.
  const z0 = backZ - 0.1;
  const z1 = frontZ + 0.42;
  const y0 = POST_BACK + 0.04;
  const y1 = POST_FRONT - 0.12;
  const len = Math.hypot(z1 - z0, y0 - y1);
  const tilt = Math.atan2(y0 - y1, z1 - z0);
  const n = Math.max(5, Math.round((w + 0.4) / 0.32) | 1);
  const sw = (w + 0.4) / n;
  for (let k = 0; k < n; k++) {
    const x = -(w + 0.4) / 2 + (k + 0.5) * sw;
    const c = k % 2 ? CREAM : stripe;
    p.box(c, sw + 0.005, 0.04, len, x, (y0 + y1) / 2, (z0 + z1) / 2, tilt);
    p.box(c, sw + 0.005, 0.16, 0.025, x, y1 - 0.08, z1);
    p.cyl(c, sw * 0.5, 0.025, x, y1 - 0.16, z1, 8, Math.PI / 2);
  }
  // Wares, a different trade at each stall.
  const on = p.at(0, -DROP, 0);
  if (i === 0) clothStall(p, on, w, d, r, glow);
  else if (i === 1) produceStall(p, on, w, d, r);
  else if (i === 2) potteryStall(p, on, w, d, r);
  else if (i === 3) bakeryStall(p, on, w, d, r);
  else flowerStall(p, on, w, d, r);
}

/** The main stall: bolts of cloth and folded lengths, a pair of scales, a jug, and lanterns on the front posts. */
function clothStall(p: Paint, on: Paint, w: number, d: number, r: () => number, glow: (p: Paint, x: number, y: number, z: number) => void) {
  const colours = ['#c8423a', '#3f6a9a', '#e8b83a', '#4f8a4a', '#8a4f8a', '#e89a7a', '#f6ead2'];
  for (let k = 0; k < 5; k++) {
    const c = colours[k % colours.length];
    const x = -w / 2 + 0.35 + k * 0.26;
    on.cyl(c, 0.1, d * 0.8, x, 1.02, 0, 8, Math.PI / 2);
    on.cyl(shade(c, -0.2), 0.03, d * 0.82, x, 1.02, 0, 6, Math.PI / 2);
  }
  // A second row stacked on the first.
  for (let k = 0; k < 3; k++) {
    const c = colours[(k + 4) % colours.length];
    on.cyl(c, 0.1, d * 0.8, -w / 2 + 0.48 + k * 0.26, 1.19, 0, 8, Math.PI / 2);
  }
  // Folded lengths in little piles, and a length draped over the front.
  for (let k = 0; k < 4; k++) on.box(colours[(k * 3 + 1) % colours.length], 0.4, 0.05, 0.3, 0.55, 0.95 + k * 0.05, -0.05 + (k % 2) * 0.02);
  on.box('#e89a7a', 0.34, 0.05, 0.6, 0.15, 0.94, 0.25, 0, 0.1, 0);
  // Scales: a post, a beam and two pans.
  const sx = w / 2 - 0.3;
  on.post(IRON, 0.02, 0.42, sx, 0.92, -0.1, 6);
  on.box('#d8a845', 0.5, 0.02, 0.02, sx, 1.33, -0.1);
  for (const dx of [-0.23, 0.23]) {
    on.rod(IRON, 0.006, sx + dx, 1.33, -0.1, sx + dx, 1.12, -0.1, 4);
    on.cyl('#d8a845', 0.09, 0.02, sx + dx, 1.12, -0.1, 12);
  }
  on.taper('#a8743f', 0.7, 0.09, 0.24, -w / 2 + 0.25, 0.92, -0.3, 10);
  // Lanterns hanging from the front posts, lit at night.
  for (const side of [-1, 1]) {
    const x = side * (w / 2 + 0.05);
    const z = d / 2 + 0.2;
    p.box(IRON, 0.04, 0.04, 0.2, x, POST_FRONT - 0.25, z - 0.08);
    p.rod(IRON, 0.01, x, POST_FRONT - 0.25, z, x, POST_FRONT - 0.38, z, 4);
    p.cyl(IRON, 0.09, 0.03, x, POST_FRONT - 0.4, z, 6);
    p.glass.cyl('#fff1c8', 0.07, 0.2, x, POST_FRONT - 0.52, z, 6);
    p.cyl(IRON, 0.09, 0.03, x, POST_FRONT - 0.63, z, 6);
    glow(p, x, POST_FRONT - 0.52, z);
  }
  // A bolt leaning on the counter's end.
  p.cyl(pick(r, colours), 0.09, 0.85, -w / 2 - 0.12, 0.42, d / 2 - 0.05, 12, 0, 0, 0.2);
}

/** Baskets of apples, cabbages and carrots, and a crate of pumpkins in front. */
function produceStall(p: Paint, on: Paint, w: number, d: number, r: () => number) {
  const baskets: [string, (q: Paint) => void][] = [
    ['apples', (q) => { for (let k = 0; k < 7; k++) q.ico(k % 3 ? '#c8423a' : '#9ac04a', 0.07, Math.cos(k * 2.4) * 0.11 * (k ? 1 : 0), 0.24, Math.sin(k * 2.4) * 0.11 * (k ? 1 : 0), 0); }],
    ['cabbages', (q) => { for (let k = 0; k < 3; k++) q.blob('#7aae4a', 0.1, (k - 1) * 0.12, 0.26, (k % 2) * 0.05, k, 0.85); }],
    ['carrots', (q) => { for (let k = 0; k < 6; k++) { const a = k * 1.05; q.geo(G.cone(6), '#e8813a', new THREE.Matrix4().makeTranslation(Math.cos(a) * 0.08, 0.26, Math.sin(a) * 0.08).multiply(new THREE.Matrix4().makeRotationZ(Math.PI / 2 + Math.cos(a) * 0.4)).multiply(new THREE.Matrix4().makeScale(0.03, 0.22, 0.03))); } q.blob('#5f9a3a', 0.08, 0, 0.3, 0, 2, 0.6); }],
  ];
  baskets.forEach(([, fill], k) => {
    const q = on.at(-w / 2 + 0.35 + k * ((w - 0.7) / 2), 0.92, -0.05 + (k % 2) * 0.12);
    basket(q);
    fill(q);
  });
  const c = p.at(-0.45, 0, d / 2 + 0.45, 0.2);
  crate(c, r, 0.5);
  for (let k = 0; k < 3; k++) c.sphere('#e8813a', 0.13, 0.1, 0.13, (k - 1) * 0.14, 0.56, (k % 2) * 0.08, 10, 6);
  basket(p.at(0.5, 0, d / 2 + 0.35), 1.3);
  for (let k = 0; k < 5; k++) p.ico('#c8423a', 0.08, 0.5 + Math.cos(k * 1.3) * 0.12, 0.32, d / 2 + 0.35 + Math.sin(k * 1.3) * 0.12, 0);
}

/** Jugs, pots and bowls on the counter, and bunches of herbs hanging from the awning's front beam. */
function potteryStall(p: Paint, on: Paint, w: number, d: number, r: () => number) {
  const clays = ['#b8643f', '#c98a5a', '#8a5a3a', '#d9c3a0', '#5f7f9a'];
  for (let k = 0; k < 5; k++) {
    const x = -w / 2 + 0.25 + k * ((w - 0.5) / 4);
    const z = (k % 2) * 0.15 - 0.05;
    const c = pick(r, clays);
    if (k % 2) {
      // A jug: a round belly and a neck.
      on.sphere(c, 0.11, 0.12, 0.11, x, 1.03, z, 10, 6);
      on.taper(c, 0.7, 0.06, 0.12, x, 1.1, z, 8);
    } else {
      // A bowl, or a pot.
      on.taper(c, 1.4, 0.08, 0.1 + (k % 3) * 0.06, x, 0.92, z, 10);
    }
  }
  // Herbs drying upside down: a stalk tied at the top, a bunch of leaves below.
  const greens = ['#5f8a4a', '#7aa05a', '#9a8a5a', '#8a6f9a'];
  for (let k = 0; k < 6; k++) {
    const x = -w / 2 + 0.2 + k * ((w - 0.4) / 5);
    const z = d / 2 + 0.04;
    p.rod('#d9c3a0', 0.006, x, POST_FRONT - 0.08, z, x, POST_FRONT - 0.3, z, 4);
    placed(p, G.cone(6), greens[k % greens.length], x, POST_FRONT - 0.42, z, 0, Math.PI, 0.07, 0.24, 0.07);
  }
  // Big pots on the ground in front.
  p.taper('#b8643f', 0.75, 0.2, 0.45, 0.55, 0, d / 2 + 0.35, 10);
  p.sphere('#b8643f', 0.21, 0.08, 0.21, 0.55, 0.43, d / 2 + 0.35, 10, 4);
  p.taper('#8a5a3a', 1.3, 0.13, 0.22, 0.15, 0, d / 2 + 0.45, 10);
}

/** Loaves, a pyramid of buns, and cheese wheels, with a cut wedge showing. */
function bakeryStall(p: Paint, on: Paint, w: number, d: number, r: () => number) {
  for (let k = 0; k < 4; k++) on.sphere(shade('#c98a45', (r() - 0.5) * 0.1), 0.15, 0.08, 0.09, -w / 2 + 0.3 + k * 0.22, 0.97, -0.1 + (k % 2) * 0.1, 10, 6);
  for (const [x, y, z] of [
    [0.25, 0.97, 0.05],
    [0.4, 0.97, 0.05],
    [0.32, 0.97, -0.1],
    [0.33, 1.07, 0],
  ]) on.sphere('#d9a05a', 0.07, 0.06, 0.07, x, y, z, 8, 5);
  for (let k = 0; k < 2; k++) {
    on.cyl('#f0c85a', 0.17, 0.12, 0.62, 0.98 + k * 0.12, -0.05, 14);
    on.cyl('#e0b04a', 0.172, 0.02, 0.62, 1.04 + k * 0.12, -0.05, 14);
  }
  on.box('#f6d77a', 0.12, 0.1, 0.12, 0.62, 1.22, 0.18, 0, 0.6, 0);
  basket(p.at(-0.5, 0, d / 2 + 0.35), 1.2);
  for (let k = 0; k < 3; k++) p.sphere('#c98a45', 0.13, 0.07, 0.07, -0.5 + (k - 1) * 0.08, 0.32, d / 2 + 0.35, 8, 5);
}

/** Buckets of flowers on the counter and the ground: posies of every colour. */
function flowerStall(p: Paint, on: Paint, w: number, d: number, r: () => number) {
  const blooms = ['#f28fb0', '#f6d77a', '#e85a5a', '#b88ae8', '#f6f2ea', '#f2a05a'];
  const bucket = (q: Paint, s = 1) => {
    q.taper('#8a9aa8', 1.25, 0.1 * s, 0.22 * s, 0, 0, 0, 10);
    for (let k = 0; k < 5; k++) {
      const a = (k / 5) * Math.PI * 2;
      q.rod('#4f8a3a', 0.008, 0, 0.1 * s, 0, Math.cos(a) * 0.07 * s, 0.38 * s, Math.sin(a) * 0.07 * s, 4);
      q.ico(pick(r, blooms), 0.05 * s, Math.cos(a) * 0.07 * s, 0.4 * s, Math.sin(a) * 0.07 * s, 0);
    }
    q.ico(pick(r, blooms), 0.055 * s, 0, 0.45 * s, 0, 0);
  };
  for (let k = 0; k < 3; k++) bucket(on.at(-w / 2 + 0.35 + k * ((w - 0.7) / 2), 0.92, (k % 2) * 0.12 - 0.05));
  bucket(p.at(-0.35, 0, d / 2 + 0.35), 1.5);
  bucket(p.at(0.25, 0, d / 2 + 0.4), 1.3);
  // A tub of greenery at the end.
  p.taper(WOOD, 1.15, 0.22, 0.32, 0.75, 0, d / 2 + 0.3, 10);
  p.blob('#5f9a4a', 0.26, 0.75, 0.48, d / 2 + 0.3, 3, 0.8);
}

/** A woven basket (open top), `s` times the size of one on a counter. */
function basket(p: Paint, s = 1) {
  p.taper(WICKER, 1.3, 0.13 * s, 0.17 * s, 0, 0, 0, 10);
  p.torus(shade(WICKER, -0.12), 0.17 * s, 0.018, 0, 0.17 * s, 0, Math.PI / 2);
  p.torus(shade(WICKER, -0.06), 0.15 * s, 0.012, 0, 0.08 * s, 0, Math.PI / 2);
}

/** A full sack, tied at the top. */
function sack(p: Paint, r: () => number) {
  const c = shade(SACK, (r() - 0.5) * 0.1);
  p.sphere(c, 0.26, 0.3, 0.22, 0, 0.27, 0, 8, 6);
  p.cone(shade(c, -0.08), 0.1, 0.18, 0, 0.5, 0, 6);
  p.torus(shade(c, -0.3), 0.06, 0.015, 0, 0.53, 0, Math.PI / 2);
}

/** The market cross: an eight-sided stepped base, a shaft and a little cross on top. */
function marketCross(p: Paint) {
  p.cyl(STONE_DARK, 0.6, 0.18, 0, 0.09, 0, 8);
  p.cyl(STONE, 0.44, 0.18, 0, 0.27, 0, 8);
  p.cyl(shade(STONE, 0.05), 0.24, 0.16, 0, 0.44, 0, 8);
  p.box(STONE, 0.16, 1.5, 0.16, 0, 1.27, 0);
  p.box(shade(STONE, 0.05), 0.22, 0.1, 0.22, 0, 2.02, 0);
  p.box(STONE, 0.1, 0.42, 0.1, 0, 2.28, 0);
  p.box(STONE, 0.34, 0.1, 0.1, 0, 2.32, 0);
  // A garland round the shaft, and posies at its foot.
  p.torus('#5f9a4a', 0.12, 0.035, 0, 1.4, 0, Math.PI / 2);
  for (let k = 0; k < 5; k++) {
    const a = (k / 5) * Math.PI * 2;
    p.ico(PENNANTS[k], 0.045, Math.cos(a) * 0.12, 1.42, Math.sin(a) * 0.12, 0);
    p.ico(['#f28fb0', '#f6d77a', '#b88ae8'][k % 3], 0.06, Math.cos(a + 0.3) * 0.33, 0.39, Math.sin(a + 0.3) * 0.33, 0);
  }
}

/** A two-wheeled hand cart, resting on its shafts, loaded with sacks and pumpkins. Front (shafts) is +z. */
function cart(p: Paint, r: () => number) {
  const bed = p.at(0, 0, 0);
  bed.box(WOOD, 1.1, 0.08, 1.5, 0, 0.62, -0.1, -0.12);
  for (const sx of [-1, 1]) bed.box(shade(WOOD, -0.06), 0.06, 0.28, 1.5, sx * 0.55, 0.78, -0.1, -0.12);
  bed.box(shade(WOOD, -0.06), 1.1, 0.28, 0.06, 0, 0.88, -0.84, -0.12);
  for (const sx of [-1, 1]) {
    // Wheels: rim, hub and spokes.
    const x = sx * 0.66;
    bed.torus(WOOD_DARK, 0.42, 0.04, x, 0.44, -0.2, 0, Math.PI / 2);
    bed.cyl(IRON, 0.07, 0.12, x, 0.44, -0.2, 8, 0, 0, Math.PI / 2);
    for (let k = 0; k < 6; k++) bed.box(WOOD_DARK, 0.03, 0.8, 0.03, x, 0.44, -0.2, (k / 6) * Math.PI);
    // Shafts down to the ground in front.
    bed.rod(WOOD_DARK, 0.035, sx * 0.4, 0.6, 0.55, sx * 0.4, 0.05, 1.35, 6);
  }
  bed.box(IRON, 1.3, 0.04, 0.04, 0, 0.44, -0.2);
  sack(bed.at(-0.22, 0.62, -0.35), r);
  sack(bed.at(0.2, 0.62, -0.5), r);
  for (let k = 0; k < 3; k++) bed.sphere('#e8813a', 0.16, 0.12, 0.16, -0.25 + k * 0.25, 0.8, 0.25 + (k % 2) * 0.08, 10, 6);
  bed.cone('#5f8a3a', 0.02, 0.06, 0, 0.9, 0.25, 4);
}

/** Two bales of hay, one on the other, with loose wisps about. */
function hay(p: Paint, r: () => number) {
  const HAY = '#d9b65a';
  p.rbox(HAY, 1.0, 0.45, 0.6, 0, 0.225, 0, 0.06);
  p.rbox(shade(HAY, 0.05), 0.95, 0.45, 0.58, 0.1, 0.675, 0.02, 0.06, 0.3);
  for (const x of [-0.25, 0.25]) p.box('#8a6a3a', 0.02, 0.46, 0.62, x, 0.225, 0);
  for (let k = 0; k < 6; k++) {
    const a = r() * Math.PI * 2;
    const d = 0.55 + r() * 0.35;
    p.box(HAY, 0.03, 0.01, 0.22, Math.cos(a) * d, 0.01, Math.sin(a) * d, 0, a, 0);
  }
}

/** Bunting: a sagging cord between two points, with little pennants of every colour hanging off it. */
function bunting(p: Paint, ax: number, ay: number, az: number, bx: number, by: number, bz: number, sag: number) {
  p.rope('#f6ead2', 0.01, ax, ay, az, bx, by, bz, sag, 8);
  const len = Math.hypot(bx - ax, bz - az);
  const turn = Math.atan2(bx - ax, bz - az) - Math.PI / 2;
  const n = Math.max(3, Math.round(len / 0.45));
  for (let k = 1; k < n; k++) {
    const t = k / n;
    const x = ax + (bx - ax) * t;
    const z = az + (bz - az) * t;
    const y = ay + (by - ay) * t - Math.sin(t * Math.PI) * sag;
    // A flat three-sided cone, point down, facing across the cord.
    placed(p, G.cone(3), PENNANTS[k % PENNANTS.length], x, y - 0.12, z, turn, Math.PI, 0.13, 0.22, 0.025);
  }
}

// ---------------------------------------------------------------- the stall-keepers

/** Past this far from the market, its keepers aren't animated (nobody could tell they'd stopped). */
const KEEPERS_STILL = 32;

/** The keepers behind the main stall and the pottery stall: they stand about, and wave now and then. */
export function marketKeepers() {
  const group = new THREE.Group();
  group.name = 'market-keepers';
  const keepers: { rig: Rig; wave: number; anim: Anim }[] = [];
  const add = (stall: number, look: Parameters<typeof buildAnimal>[0], wave: number) => {
    const s = MARKET_STALLS[stall];
    const at = local(s.lx, s.lz, s.ry, 0, -s.d / 2 - 0.42);
    const w = local(MARKET.x, MARKET.z, MARKET.ry, at.x, at.z);
    const rig = buildAnimal(look);
    rig.root.position.set(w.x, STEP, w.z);
    rig.root.rotation.y = MARKET.ry + s.ry;
    group.add(rig.root);
    keepers.push({ rig, wave, anim: 'idle' });
  };
  add(0, { animal: 'highland', color: '#b8743f', hat: 'headscarf' }, 0);
  add(2, { animal: 'hedgehog', color: '#8a6a4a', hat: 'sunhat' }, 5);
  return {
    group,
    /** `far`: how far the camera's looking from the market (from across town they keep still, saving the work). */
    update(dt: number, t: number, far: number) {
      if (far > KEEPERS_STILL) return;
      for (const k of keepers) {
        // A wave for a second and a half every twelve.
        k.anim = (t + k.wave) % 12 < 1.5 ? 'wave' : 'idle';
        k.rig.update({ anim: k.anim, speed: 0, dt, t });
      }
    },
  };
}
