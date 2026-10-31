import * as THREE from 'three';
import { Builder, matte, rng } from '../build';
import type { Collider, Station } from '../types';
import { CELL, FLAT_HD, FLAT_HW, cellsOf, floorById, pieceById, placeOf, wallById, type FlatItem, type FlatLayout, type Finish } from '../../flats/catalogue';
import { Paint, pick, shade, smoothMesh, local } from './kit';
import { IRON, STONE, WOOD, WOOD_DARK, WOOD_LIGHT } from './props';
import { LIFT, LOBBY_BENCH, LOBBY_BOARD, LOBBY_STAIRS, ROOMS, FLATS_NAME, roomColliders } from './layout';
import { WALL_H, shell } from './interiors';
import { TextSign, signBoard } from './sign';

/**
 * Inside Wren Court, the apartment block: the lobby (built once), and the flats. Everyone's flat is the same room,
 * furnished on the fly with whatever the flat being visited has in it (flats/catalogue.ts): the walls and floor in
 * its finishes, each piece of furniture where it was put, and the seats in it to sit on.
 */

const GOLD = '#d8b04a';
const BRASS = '#c9a24f';
const CREAM = '#f6efe0';
const BOOKS = ['#a8463f', '#3f6f9a', '#5f8a4f', '#c9a24f', '#7b4f7a', '#e8dcc0', '#d9733f'];

/** Paints into the glowing layer (flames, lamp bulbs, screens), which stays bright whatever the light. */
type Lit = (geo: THREE.BufferGeometry, color: THREE.ColorRepresentation, x: number, y: number, z: number, sx?: number, sy?: number, sz?: number) => void;
const litIn = (glow: Builder, p: Paint): Lit => (geo, color, x, y, z, sx = 1, sy = sx, sz = sx) => glow.add(geo, color, { pos: [x, y, z], scale: [sx, sy, sz] }, p.m);
const BALL = new THREE.IcosahedronGeometry(1, 1);
const FLAME = new THREE.ConeGeometry(1, 1, 5);
const SLAB = new THREE.BoxGeometry(1, 1, 1);

// ---------------------------------------------------------------- the furniture

/** Two cushions, a seat and arms: the shape of an armchair or a sofa `w` wide, facing +z. */
function upholstered(p: Paint, w: number, color: string, accent: string) {
  const d = 0.86;
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) p.post(WOOD_DARK, 0.04, 0.1, sx * (w / 2 - 0.1), 0, sz * (d / 2 - 0.1), 8);
  p.rbox(color, w, 0.3, d, 0, 0.25, 0, 0.06);
  const seats = Math.max(1, Math.round((w - 0.3) / 0.85));
  const sw = (w - 0.34) / seats;
  for (let k = 0; k < seats; k++) p.rbox(shade(color, 0.05), sw - 0.03, 0.14, d - 0.22, -w / 2 + 0.17 + sw * (k + 0.5), 0.46, 0.08, 0.06);
  p.rbox(shade(color, -0.04), w, 0.62, 0.22, 0, 0.6, -d / 2 + 0.11, 0.08);
  for (const sx of [-1, 1]) p.rbox(shade(color, -0.02), 0.17, 0.5, d, sx * (w / 2 - 0.085), 0.45, 0, 0.07);
  if (w > 1.2) for (const sx of [-1, 1]) p.rbox(accent, 0.34, 0.3, 0.12, sx * (w / 2 - 0.42), 0.66, -d / 2 + 0.27, 0.06);
  else p.rbox(accent, 0.32, 0.26, 0.11, 0, 0.66, -d / 2 + 0.27, 0.06);
}

function kitchenChair(p: Paint) {
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) p.post(shade(WOOD, -0.08), 0.025, 0.45, sx * 0.17, 0, sz * 0.17, 8);
  p.block(WOOD, 0.44, 0.05, 0.44, 0, 0.43, 0);
  p.cyl('#d8687a', 0.18, 0.04, 0, 0.5, 0.01, 14);
  for (const sx of [-1, 1]) p.block(shade(WOOD, -0.06), 0.04, 0.55, 0.04, sx * 0.18, 0.47, -0.19);
  for (let k = 0; k < 3; k++) p.box(WOOD, 0.36, 0.06, 0.025, 0, 0.62 + k * 0.15, -0.19);
}

function beanbag(p: Paint) {
  p.sphere('#e4553f', 0.44, 0.24, 0.44, 0, 0.2, 0.02, 16, 10);
  p.sphere('#e4553f', 0.4, 0.34, 0.2, 0, 0.36, -0.24, 16, 10);
  p.sphere(shade('#e4553f', 0.08), 0.3, 0.1, 0.28, 0, 0.36, 0.05, 14, 8);
}

function rocker(p: Paint) {
  // Curved runners under the legs, a cushioned seat, and a tall slatted back leaning out.
  for (const sx of [-1, 1]) {
    for (let k = 0; k < 6; k++) {
      const a0 = -0.6 + k * 0.2;
      const a1 = a0 + 0.2;
      p.rod(WOOD_DARK, 0.03, sx * 0.24, 0.9 - Math.cos(a0) * 0.88, Math.sin(a0) * 0.9, sx * 0.24, 0.9 - Math.cos(a1) * 0.88, Math.sin(a1) * 0.9, 6);
    }
    for (const sz of [-0.2, 0.2]) p.post(WOOD, 0.03, 0.4, sx * 0.24, 0.04, sz, 8);
    p.box(WOOD, 0.05, 0.05, 0.5, sx * 0.26, 0.62, 0.02);
    p.post(WOOD, 0.025, 0.2, sx * 0.26, 0.42, 0.2, 8);
  }
  p.block(WOOD, 0.52, 0.05, 0.48, 0, 0.42, 0);
  p.rbox('#7cc28b', 0.46, 0.08, 0.42, 0, 0.5, 0.02, 0.03);
  const back = p.at(0, 0.45, -0.24);
  for (const sx of [-1, 1]) back.box(WOOD_DARK, 0.05, 0.95, 0.05, sx * 0.24, 0.47, -0.08, -0.17);
  for (let k = -2; k <= 2; k++) back.box(WOOD, 0.05, 0.8, 0.025, k * 0.09, 0.45, -0.07, -0.17);
  back.box(WOOD_DARK, 0.56, 0.08, 0.06, 0, 0.92, -0.16, -0.17);
}

function bed(p: Paint, r: () => number) {
  const w = 1.8;
  const d = 2.3;
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) p.block(WOOD_DARK, 0.1, 0.4, 0.1, sx * (w / 2 - 0.05), 0, sz * (d / 2 - 0.05));
  p.block(WOOD, w, 0.22, d, 0, 0.12, 0.05);
  p.block(WOOD_DARK, w + 0.1, 1.15, 0.1, 0, 0, -d / 2 + 0.05);
  p.cyl(WOOD_DARK, w / 2 + 0.05, 0.1, 0, 1.15, -d / 2 + 0.05, 16, Math.PI / 2);
  for (let k = 0; k < 3; k++) p.box(shade(WOOD_DARK, 0.08), 0.5, 0.6, 0.04, (k - 1) * 0.56, 0.75, -d / 2 + 0.12);
  p.block(CREAM, w - 0.08, 0.2, d - 0.15, 0, 0.32, 0.06);
  for (const sx of [-1, 1]) p.sphere('#ffffff', 0.36, 0.11, 0.22, sx * 0.42, 0.58, -d / 2 + 0.38, 14, 8);
  const quilt = pick(r, [['#8fc1e8', '#5f8fbf'], ['#f2a7b8', '#d8687a'], ['#b494dd', '#7b4f7a'], ['#7cc28b', '#4f8f45']]);
  p.box(quilt[0], w - 0.02, 0.06, 1.5, 0, 0.55, 0.36);
  for (let k = 0; k < 4; k++) p.box(quilt[1], w, 0.065, 0.12, 0, 0.555, -0.25 + k * 0.4);
  p.box(quilt[0], w - 0.02, 0.24, 0.05, 0, 0.42, d / 2 + 0.02);
  p.box(CREAM, w - 0.05, 0.03, 0.26, 0, 0.58, -0.35);
}

function sideTable(p: Paint, lit: Lit) {
  p.post(WOOD_DARK, 0.04, 0.5, 0, 0, 0, 8);
  p.cyl(WOOD_DARK, 0.16, 0.03, 0, 0.01, 0, 14);
  p.cyl(WOOD, 0.22, 0.04, 0, 0.52, 0, 16);
  p.post(BRASS, 0.025, 0.28, 0.02, 0.54, 0, 8);
  p.taper('#f6d9a8', 0.6, 0.15, 0.18, 0.02, 0.76, 0, 14);
  lit(BALL, '#ffe2a0', 0.02, 0.8, 0, 0.06);
  p.box('#3f6f9a', 0.14, 0.03, 0.18, -0.08, 0.555, 0.08, 0, 0.4, 0);
}

function coffeeTable(p: Paint) {
  p.rbox(WOOD_LIGHT, 1.3, 0.06, 0.75, 0, 0.4, 0, 0.03);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) p.post(WOOD_DARK, 0.035, 0.38, sx * 0.56, 0, sz * 0.28, 8);
  p.box(shade(WOOD_LIGHT, -0.1), 1.15, 0.03, 0.6, 0, 0.12, 0);
  // A teapot, a cup and a stack of books.
  p.sphere('#8fc1e8', 0.1, 0.09, 0.1, -0.3, 0.52, 0, 12, 8);
  p.box('#8fc1e8', 0.1, 0.03, 0.03, -0.17, 0.53, 0);
  p.post(CREAM, 0.04, 0.06, 0.05, 0.43, 0.12, 10);
  p.box('#a8463f', 0.26, 0.04, 0.2, 0.36, 0.45, -0.08, 0, 0.2, 0);
  p.box('#5f8a4f', 0.22, 0.04, 0.17, 0.36, 0.49, -0.08, 0, -0.1, 0);
}

function diningTable(p: Paint) {
  p.post(WOOD_DARK, 0.08, 0.72, 0, 0, 0, 10);
  p.cyl(WOOD_DARK, 0.3, 0.05, 0, 0.03, 0, 14);
  p.cyl(WOOD_LIGHT, 0.68, 0.06, 0, 0.75, 0, 20);
  p.cyl(CREAM, 0.56, 0.015, 0, 0.785, 0, 20);
  p.taper('#5f8fbf', 0.7, 0.08, 0.22, 0, 0.79, 0, 12);
  for (let k = 0; k < 5; k++) {
    const a = (k / 5) * Math.PI * 2;
    p.rod('#4f8f45', 0.008, 0, 0.98, 0, Math.cos(a) * 0.08, 1.12, Math.sin(a) * 0.08, 4);
    p.ico(['#f2a7b8', '#f6d55c', '#e4553f'][k % 3], 0.04, Math.cos(a) * 0.08, 1.14, Math.sin(a) * 0.08, 0);
  }
}

function desk(p: Paint, lit: Lit) {
  p.rbox(WOOD, 1.4, 0.06, 0.7, 0, 0.75, -0.05, 0.02);
  p.block(shade(WOOD, -0.06), 0.42, 0.72, 0.62, 0.45, 0, -0.05);
  for (let k = 0; k < 3; k++) {
    p.box(shade(WOOD, -0.14), 0.36, 0.18, 0.02, 0.45, 0.14 + k * 0.22, 0.27);
    p.sphere(BRASS, 0.025, 0.025, 0.025, 0.45, 0.14 + k * 0.22, 0.29, 8, 6);
  }
  for (const sz of [-1, 1]) p.post(shade(WOOD, -0.08), 0.03, 0.72, -0.62, 0, -0.05 + sz * 0.28, 8);
  // A lamp, papers, an inkwell and a quill.
  p.cyl(BRASS, 0.08, 0.02, -0.5, 0.79, -0.25, 12);
  p.rod(BRASS, 0.015, -0.5, 0.8, -0.25, -0.42, 1.12, -0.2, 6);
  p.cone('#2f6a4f', 0.1, 0.12, -0.38, 1.04, -0.18, 14);
  lit(BALL, '#ffe2a0', -0.38, 1.04, -0.18, 0.045);
  p.box('#f6f1e6', 0.3, 0.01, 0.22, 0.05, 0.785, 0.05, 0, 0.15, 0);
  p.box('#efe6d0', 0.3, 0.01, 0.22, 0.08, 0.79, 0.04, 0, -0.1, 0);
  p.post('#2a2530', 0.04, 0.06, 0.35, 0.78, -0.22, 10);
  p.rod(CREAM, 0.012, 0.35, 0.82, -0.22, 0.45, 1.0, -0.3, 4);
}

function bookshelf(p: Paint, r: () => number) {
  p.block(WOOD_DARK, 1.4, 1.9, 0.42, 0, 0, -0.02);
  for (let s = 0; s < 4; s++) {
    const y = 0.12 + s * 0.45;
    p.box(WOOD, 1.3, 0.04, 0.38, 0, y, 0.02);
    let x = -0.6;
    while (x < 0.58) {
      const w = 0.06 + r() * 0.05;
      const h = 0.24 + r() * 0.12;
      if (r() < 0.12) {
        // A little ornament now and then.
        p.ico(pick(r, ['#f6d55c', '#8fc1e8', '#f2a7b8']), 0.07, x + 0.07, y + 0.1, 0.04, 0);
        x += 0.16;
        continue;
      }
      p.box(pick(r, BOOKS), w, h, 0.28, x + w / 2, y + 0.02 + h / 2, 0.05, 0, 0, r() < 0.1 ? 0.25 : 0);
      x += w + 0.008;
    }
  }
  p.box(WOOD, 1.46, 0.06, 0.46, 0, 1.92, -0.02);
}

function wardrobe(p: Paint) {
  const c = '#8a6a9a';
  p.block(c, 1.35, 2.0, 0.7, 0, 0.08, -0.05);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) p.block(WOOD_DARK, 0.08, 0.1, 0.08, sx * 0.6, 0, -0.05 + sz * 0.28);
  for (const sx of [-1, 1]) {
    p.box(shade(c, 0.06), 0.6, 1.75, 0.03, sx * 0.33, 1.05, 0.31);
    p.box(shade(c, -0.08), 0.46, 0.6, 0.02, sx * 0.33, 1.45, 0.33);
    p.box(shade(c, -0.08), 0.46, 0.6, 0.02, sx * 0.33, 0.65, 0.33);
    p.sphere(BRASS, 0.03, 0.03, 0.03, sx * 0.07, 1.05, 0.34, 8, 6);
  }
  p.box(shade(c, -0.12), 1.45, 0.1, 0.78, 0, 2.12, -0.05);
  p.prism(shade(c, -0.05), 0.9, 0.2, 0.5, 0, 2.17, 0.05);
}

function chest(p: Paint) {
  p.block(WOOD, 0.9, 0.36, 0.44, 0, 0, 0);
  p.cyl(shade(WOOD, 0.05), 0.22, 0.9, 0, 0.36, 0, 14, 0, 0, Math.PI / 2);
  for (const x of [-0.32, 0, 0.32]) {
    p.box(IRON, 0.05, 0.37, 0.46, x, 0.18, 0);
    p.torus(IRON, 0.225, 0.02, x, 0.36, 0, 0, Math.PI / 2);
  }
  p.box(GOLD, 0.1, 0.12, 0.03, 0, 0.36, 0.235);
  p.ico(GOLD, 0.05, 0.25, 0.62, 0.05, 0);
  p.ico('#e4553f', 0.04, -0.2, 0.6, 0.1, 0);
}

function petBed(p: Paint) {
  p.torus('#c06a48', 0.38, 0.12, 0, 0.12, 0, Math.PI / 2);
  p.cyl('#f2a7b8', 0.38, 0.08, 0, 0.06, 0, 20);
  p.sphere('#f6efe0', 0.3, 0.04, 0.3, 0, 0.11, 0, 16, 6);
  // A bone to chew.
  p.box('#f6efe0', 0.18, 0.04, 0.04, 0.12, 0.15, 0.08, 0, 0.5, 0);
  for (const s of [-1, 1]) p.sphere('#f6efe0', 0.03, 0.03, 0.03, 0.12 + s * 0.08 * Math.cos(0.5), 0.15, 0.08 - s * 0.08 * Math.sin(0.5), 8, 6);
}

function globe(p: Paint) {
  p.cyl(WOOD_DARK, 0.17, 0.04, 0, 0.02, 0, 14);
  p.post(WOOD_DARK, 0.03, 0.55, 0, 0, 0, 8);
  p.torus(BRASS, 0.24, 0.012, 0, 0.82, 0, 0, 0.6);
  p.sphere('#5f8fbf', 0.22, 0.22, 0.22, 0, 0.82, 0, 16, 12);
  for (const [x, y, z, s] of [
    [0.08, 0.9, 0.17, 0.09],
    [-0.12, 0.78, 0.15, 0.08],
    [0.16, 0.74, -0.06, 0.07],
    [-0.05, 0.98, -0.16, 0.06],
  ])
    p.sphere('#7cc28b', s, s * 0.8, s * 0.5, x, y, z, 10, 6);
}

function easel(p: Paint, r: () => number) {
  p.rod(WOOD, 0.025, -0.28, 0, 0.12, -0.05, 1.5, 0, 6);
  p.rod(WOOD, 0.025, 0.28, 0, 0.12, 0.05, 1.5, 0, 6);
  p.rod(WOOD, 0.025, 0, 0, -0.25, 0, 1.45, -0.02, 6);
  p.box(WOOD, 0.6, 0.04, 0.08, 0, 0.62, 0.1);
  p.box('#fffaf0', 0.6, 0.5, 0.03, 0, 0.9, 0.1, -0.1);
  for (let k = 0; k < 6; k++) p.box(pick(r, ['#e4553f', '#f6d55c', '#5f8fbf', '#7cc28b', '#b494dd']), 0.08 + r() * 0.12, 0.06 + r() * 0.1, 0.01, (r() - 0.5) * 0.4, 0.75 + r() * 0.3, 0.12 + 0.01 * k, -0.1);
}

function birdcage(p: Paint, r: () => number) {
  p.cyl(IRON, 0.16, 0.03, 0, 0.015, 0, 12);
  p.post(IRON, 0.02, 1.0, 0, 0, 0, 6);
  p.cyl(BRASS, 0.2, 0.03, 0, 1.0, 0, 16);
  for (let k = 0; k < 12; k++) {
    const a = (k / 12) * Math.PI * 2;
    p.rod(BRASS, 0.007, Math.cos(a) * 0.19, 1.0, Math.sin(a) * 0.19, Math.cos(a) * 0.04, 1.5, Math.sin(a) * 0.04, 4);
  }
  p.torus(BRASS, 0.04, 0.01, 0, 1.53, 0, 0, 0);
  p.rod(WOOD, 0.01, -0.12, 1.15, 0, 0.12, 1.15, 0, 4);
  const c = pick(r, ['#f6d55c', '#7cc28b', '#8fc1e8']);
  p.sphere(c, 0.05, 0.05, 0.06, 0, 1.21, 0, 10, 8);
  p.sphere(c, 0.035, 0.035, 0.035, 0, 1.27, 0.04, 8, 6);
  p.cone('#e8913a', 0.012, 0.03, 0, 1.26, 0.08, 4);
}

function gramophone(p: Paint) {
  p.block(WOOD_DARK, 0.42, 0.55, 0.42, 0, 0, 0);
  p.block(WOOD, 0.4, 0.14, 0.4, 0, 0.55, 0);
  p.cyl('#2a2530', 0.16, 0.015, 0, 0.7, 0, 18);
  p.cyl(GOLD, 0.04, 0.02, 0, 0.71, 0, 10);
  p.rod(BRASS, 0.015, 0.15, 0.7, -0.12, 0.05, 0.98, -0.12, 6);
  // The horn, flaring out over the front.
  const h = p.at(0.05, 0.98, -0.08);
  h.geo(new THREE.ConeGeometry(0.2, 0.45, 16, 1, true), GOLD, new THREE.Matrix4().compose(new THREE.Vector3(0, 0.12, 0.18), new THREE.Quaternion().setFromEuler(new THREE.Euler(-2.2, 0, 0)), new THREE.Vector3(1, 1, 1)));
  h.cyl(GOLD, 0.21, 0.02, 0, 0.27, 0.36, 18, -0.6);
}

function festiveTree(p: Paint, r: () => number, lit: Lit) {
  p.taper('#c06a48', 1.2, 0.2, 0.25, 0, 0, 0, 12);
  p.post(WOOD_DARK, 0.06, 0.3, 0, 0.2, 0, 8);
  for (let k = 0; k < 4; k++) p.cone(shade('#3f7d4f', k * 0.03), 0.62 - k * 0.12, 0.6, 0, 0.35 + k * 0.38, 0, 12, k * 0.4);
  for (let k = 0; k < 14; k++) {
    const y = 0.45 + r() * 1.3;
    const rad = (0.62 - ((y - 0.35) / 1.75) * 0.5) * 0.85;
    const a = r() * Math.PI * 2;
    p.sphere(pick(r, ['#e4553f', GOLD, '#8fc1e8', '#f2a7b8']), 0.05, 0.05, 0.05, Math.cos(a) * rad, y, Math.sin(a) * rad, 8, 6);
  }
  lit(BALL, '#ffe27a', 0, 2.05, 0, 0.11);
  for (let k = 0; k < 3; k++) {
    const a = (k / 3) * Math.PI * 2 + 0.5;
    p.block(['#e4553f', '#5f8fbf', '#b494dd'][k], 0.2, 0.16, 0.2, Math.cos(a) * 0.55, 0, Math.sin(a) * 0.55, a);
    p.box(GOLD, 0.21, 0.02, 0.05, Math.cos(a) * 0.55, 0.165, Math.sin(a) * 0.55, 0, a, 0);
  }
}

function bath(p: Paint) {
  p.rbox('#f6f6f2', 1.7, 0.55, 0.78, 0, 0.42, 0, 0.18);
  p.rbox('#8fd0e8', 1.5, 0.05, 0.6, 0, 0.6, 0, 0.1);
  for (let k = 0; k < 6; k++) p.sphere('#ffffff', 0.08, 0.05, 0.08, -0.5 + k * 0.2, 0.64, ((k * 7) % 5) * 0.06 - 0.12, 8, 6);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    p.sphere(GOLD, 0.06, 0.08, 0.06, sx * 0.7, 0.1, sz * 0.27, 8, 6);
    p.rod(GOLD, 0.03, sx * 0.7, 0.12, sz * 0.27, sx * 0.62, 0.2, sz * 0.24, 6);
  }
  p.rod(GOLD, 0.03, -0.75, 0.6, 0, -0.75, 0.9, 0, 6);
  p.rod(GOLD, 0.025, -0.75, 0.9, 0, -0.62, 0.86, 0, 6);
  // A rubber duck.
  p.sphere('#f6d55c', 0.06, 0.05, 0.07, 0.3, 0.66, 0.1, 10, 8);
  p.sphere('#f6d55c', 0.04, 0.04, 0.04, 0.3, 0.72, 0.15, 8, 6);
  p.cone('#e8913a', 0.015, 0.03, 0.3, 0.71, 0.19, 4);
}

function grandfatherClock(p: Paint) {
  p.block(WOOD_DARK, 0.42, 0.3, 0.32, 0, 0, 0);
  p.block(WOOD, 0.34, 1.25, 0.26, 0, 0.3, 0);
  p.block(WOOD_DARK, 0.44, 0.5, 0.34, 0, 1.55, 0);
  p.prism(WOOD_DARK, 0.48, 0.15, 0.36, 0, 2.05, 0);
  p.cyl(CREAM, 0.16, 0.02, 0, 1.8, 0.17, 16, Math.PI / 2);
  p.torus(BRASS, 0.165, 0.015, 0, 1.8, 0.18, 0, 0);
  p.box('#2a2530', 0.015, 0.11, 0.01, 0, 1.84, 0.185);
  p.box('#2a2530', 0.015, 0.08, 0.01, 0.03, 1.79, 0.185, 0, 0, 1.2);
  // The window down the case with the pendulum behind it.
  p.box('#3a2a22', 0.2, 0.8, 0.02, 0, 0.92, 0.13);
  p.rod(BRASS, 0.008, 0, 1.25, 0.14, 0.03, 0.75, 0.14, 4);
  p.cyl(GOLD, 0.06, 0.015, 0.03, 0.72, 0.145, 14, Math.PI / 2);
}

function telescope(p: Paint) {
  for (let k = 0; k < 3; k++) {
    const a = (k / 3) * Math.PI * 2;
    p.rod(WOOD_DARK, 0.025, Math.cos(a) * 0.35, 0, Math.sin(a) * 0.35, 0, 0.95, 0, 6);
  }
  p.sphere(BRASS, 0.05, 0.05, 0.05, 0, 0.98, 0, 8, 6);
  p.rod(BRASS, 0.075, -0.1, 0.92, 0.35, 0.12, 1.12, -0.45, 14);
  p.rod('#3f6f9a', 0.09, -0.02, 0.99, 0.05, 0.12, 1.12, -0.45, 14);
  p.cyl(GOLD, 0.1, 0.05, 0.13, 1.13, -0.47, 14, 0.7, 0, 0);
}

function fishTank(p: Paint, r: () => number, lit: Lit) {
  p.block(WOOD_DARK, 1.4, 0.6, 0.6, 0, 0, 0);
  p.box(shade(WOOD_DARK, -0.1), 1.2, 0.4, 0.02, 0, 0.3, 0.3);
  p.block('#2f3833', 1.36, 0.04, 0.56, 0, 0.6, 0);
  // Water lit from inside, with sand, weed, a castle and the fish.
  lit(SLAB, '#7fd0e8', 0, 0.95, -0.24, 1.3, 0.62, 0.02);
  p.box('#9fdcef', 1.3, 0.02, 0.5, 0, 1.22, 0);
  p.block('#e8d8a8', 1.3, 0.06, 0.5, 0, 0.64, 0);
  for (let k = 0; k < 5; k++) {
    const x = -0.55 + k * 0.27;
    p.rod('#4f8f45', 0.02, x, 0.66, -0.1 + (k % 2) * 0.12, x + 0.03, 0.95 + r() * 0.2, -0.1 + (k % 2) * 0.12, 4);
  }
  p.block(STONE, 0.18, 0.2, 0.14, 0.4, 0.66, -0.08);
  p.cone('#c06a48', 0.08, 0.1, 0.4, 0.86, -0.08, 6);
  for (let k = 0; k < 5; k++) {
    const c = pick(r, ['#ff8a3d', '#f6d55c', '#e4553f', '#5fc8e8']);
    const x = -0.5 + r();
    const y = 0.78 + r() * 0.3;
    const z = 0.18 - r() * 0.3;
    p.sphere(c, 0.05, 0.035, 0.02, x, y, z, 10, 6);
    p.cone(c, 0.03, 0.05, x - 0.06, y - 0.025, z, 4);
  }
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) p.box('#2f3833', 0.03, 0.66, 0.03, sx * 0.68, 0.95, sz * 0.27);
  p.box('#2f3833', 1.38, 0.04, 0.58, 0, 1.28, 0);
}

function fireplace(p: Paint, lit: Lit) {
  const stone = '#c9b8a6';
  p.block(stone, 1.9, 1.3, 0.7, 0, 0, -0.1);
  for (let c = 0; c < 4; c++) for (const sx of [-1, 1]) p.block(shade(stone, ((c + sx) % 2) * 0.05 - 0.03), 0.34, 0.28, 0.05, sx * 0.76, 0.03 + c * 0.31, 0.27);
  p.block('#2a1f1a', 0.95, 0.8, 0.3, 0, 0.1, 0.12);
  p.block(shade(stone, -0.12), 2.1, 0.14, 0.85, 0, 1.3, -0.08);
  p.block(shade(stone, -0.05), 1.3, 0.12, 0.9, 0, 0, 0.25);
  for (const x of [-0.25, 0.1]) p.cyl(WOOD_DARK, 0.08, 0.6, x, 0.2, 0.15, 10, 0, 0.4, Math.PI / 2);
  lit(FLAME, '#ffb347', -0.1, 0.45, 0.17, 0.2, 0.45, 0.2);
  lit(FLAME, '#ffd76b', 0.15, 0.4, 0.2, 0.14, 0.34, 0.14);
  lit(FLAME, '#fff1b0', 0, 0.36, 0.24, 0.09, 0.25, 0.09);
  // Candles and a little frame on the mantel.
  for (const x of [-0.75, 0.75]) {
    p.post(CREAM, 0.035, 0.2, x, 1.44, 0.05, 10);
    lit(FLAME, '#ffd76b', x, 1.69, 0.05, 0.03, 0.08, 0.03);
  }
  p.box(GOLD, 0.24, 0.18, 0.02, 0.2, 1.53, -0.05, -0.15);
  p.box('#8fc1e8', 0.18, 0.12, 0.015, 0.2, 1.53, -0.035, -0.15);
}

function arcade(p: Paint, r: () => number, lit: Lit) {
  const c = pick(r, ['#5f3fa8', '#2f6aa8', '#c0304a']);
  p.block(c, 0.75, 1.75, 0.75, 0, 0, -0.05);
  p.box(shade(c, -0.12), 0.8, 0.3, 0.78, 0, 1.65, -0.05);
  lit(SLAB, '#f6d55c', 0, 1.65, 0.34, 0.66, 0.2, 0.02);
  p.box('#1d1a24', 0.62, 0.5, 0.05, 0, 1.18, 0.33, -0.25);
  lit(SLAB, '#5fe8ff', 0, 1.18, 0.36, 0.52, 0.4, 0.02);
  lit(BALL, '#ff6fcf', -0.1, 1.2, 0.38, 0.04);
  lit(BALL, '#f6d55c', 0.12, 1.12, 0.38, 0.03);
  p.box(shade(c, 0.1), 0.72, 0.08, 0.3, 0, 0.88, 0.42, 0.3);
  p.post('#1d1a24', 0.015, 0.1, -0.18, 0.9, 0.42, 6);
  p.sphere('#e4553f', 0.035, 0.035, 0.035, -0.18, 1.01, 0.42, 8, 6);
  for (const [x, col] of [
    [0.05, '#5fe8ff'],
    [0.15, '#f6d55c'],
    [0.25, '#7cc28b'],
  ] as [number, string][])
    p.cyl(col, 0.03, 0.03, x, 0.93, 0.42, 10);
}

function jukebox(p: Paint, lit: Lit) {
  const c = '#a3304a';
  p.block(c, 0.85, 1.2, 0.6, 0, 0, -0.05);
  p.cyl(c, 0.425, 0.6, 0, 1.2, -0.05, 20, Math.PI / 2);
  p.cyl(GOLD, 0.44, 0.08, 0, 1.2, 0.22, 20, Math.PI / 2);
  // Glowing tubes round the arch and down the sides, and the grille.
  for (let k = 0; k <= 10; k++) {
    const a = (k / 10) * Math.PI;
    lit(BALL, k % 2 ? '#5fe8ff' : '#ff6fcf', Math.cos(a) * 0.36, 1.2 + Math.sin(a) * 0.36, 0.27, 0.05);
  }
  for (const sx of [-1, 1]) lit(SLAB, '#f6d55c', sx * 0.36, 0.7, 0.27, 0.06, 0.9, 0.04);
  p.box('#3a2a22', 0.55, 0.45, 0.04, 0, 0.45, 0.26);
  for (let k = 0; k < 5; k++) p.box(GOLD, 0.5, 0.025, 0.02, 0, 0.27 + k * 0.09, 0.29);
  lit(SLAB, '#fff1c8', 0, 1.0, 0.27, 0.5, 0.18, 0.02);
}

function piano(p: Paint) {
  const c = '#2a2530';
  p.block(c, 1.6, 1.25, 0.5, 0, 0, -0.2);
  p.block(shade(c, 0.06), 1.65, 0.06, 0.55, 0, 1.25, -0.2);
  p.block(c, 1.6, 0.12, 0.3, 0, 0.66, 0.15);
  p.block(CREAM, 1.5, 0.03, 0.2, 0, 0.78, 0.17);
  for (let k = 0; k < 21; k++) if (k % 7 !== 2 && k % 7 !== 6) p.box('#1d1a24', 0.035, 0.03, 0.12, -0.72 + k * 0.071 + 0.035, 0.81, 0.13);
  for (const sx of [-1, 1]) p.block(c, 0.08, 0.66, 0.08, sx * 0.76, 0, 0.26);
  p.box('#f6f1e6', 0.36, 0.26, 0.02, 0, 1.0, 0.06, -0.2);
  p.post(BRASS, 0.035, 0.18, -0.55, 1.28, -0.2, 8);
  p.taper('#f6d9a8', 0.6, 0.1, 0.12, -0.55, 1.45, -0.2, 12);
  // The stool.
  p.rbox(c, 0.6, 0.08, 0.32, 0, 0.46, 0.68, 0.03);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) p.post(c, 0.025, 0.44, sx * 0.25, 0, 0.68 + sz * 0.12, 8);
}

function pot(p: Paint, rad: number, h: number, color = '#c06a48') {
  p.taper(color, 1.25, rad, h, 0, 0, 0, 14);
  p.torus(shade(color, -0.1), rad * 1.25, 0.025, 0, h, 0, Math.PI / 2);
  p.cyl('#5e4130', rad * 1.15, 0.02, 0, h - 0.01, 0, 14);
}

function cactus(p: Paint) {
  pot(p, 0.12, 0.2, '#e8c890');
  p.post('#5f9e47', 0.07, 0.42, 0, 0.18, 0, 10);
  p.sphere('#5f9e47', 0.07, 0.07, 0.07, 0, 0.6, 0, 10, 6);
  for (const sx of [-1, 1]) {
    p.rod('#5f9e47', 0.035, 0, 0.36 + sx * 0.04, 0, sx * 0.12, 0.38 + sx * 0.04, 0, 8);
    p.rod('#5f9e47', 0.035, sx * 0.12, 0.36 + sx * 0.04, 0, sx * 0.12, 0.5 + sx * 0.04, 0, 8);
  }
  p.ico('#f2a7b8', 0.035, 0, 0.67, 0, 0);
}

function pottedPlant(p: Paint, r: () => number) {
  pot(p, 0.14, 0.3);
  for (let k = 0; k < 7; k++) {
    const a = (k / 7) * Math.PI * 2 + r();
    p.sphere(pick(r, ['#5f9e47', '#4f8f45', '#6fae4f']), 0.12, 0.3, 0.07, Math.cos(a) * 0.14, 0.6, Math.sin(a) * 0.14, 8, 6);
    p.rod('#4f8f45', 0.01, 0, 0.3, 0, Math.cos(a) * 0.14, 0.6, Math.sin(a) * 0.14, 4);
  }
}

function floorLamp(p: Paint, lit: Lit) {
  p.cyl(BRASS, 0.16, 0.03, 0, 0.015, 0, 14);
  p.post(BRASS, 0.02, 1.45, 0, 0, 0, 8);
  p.taper('#f6d9a8', 0.6, 0.22, 0.28, 0, 1.38, 0, 14);
  p.torus('#e8b878', 0.22, 0.015, 0, 1.39, 0, Math.PI / 2);
  lit(BALL, '#ffe2a0', 0, 1.45, 0, 0.08);
}

function fern(p: Paint, r: () => number) {
  pot(p, 0.26, 0.42, '#5f8fbf');
  for (let k = 0; k < 12; k++) {
    const a = (k / 12) * Math.PI * 2 + r() * 0.3;
    const len = 0.5 + r() * 0.2;
    const lean = 0.6 + r() * 0.4;
    p.rod(pick(r, ['#4f8f45', '#5f9e47', '#3f7d4f']), 0.04, 0, 0.42, 0, Math.cos(a) * len * lean, 0.42 + len * 0.9, Math.sin(a) * len * lean, 5);
    p.sphere(pick(r, ['#5f9e47', '#6fae4f']), 0.13, 0.05, 0.08, Math.cos(a) * len * lean, 0.42 + len * 0.9, Math.sin(a) * len * lean, 8, 4);
  }
}

function roundRug(p: Paint) {
  p.sphere('#5f8fbf', 0.98, 0.012, 0.98, 0, 0.006, 0, 28, 2);
  p.sphere(CREAM, 0.8, 0.016, 0.8, 0, 0.008, 0, 28, 2);
  p.sphere('#f6d55c', 0.55, 0.02, 0.55, 0, 0.01, 0, 28, 2);
  p.sphere('#e4553f', 0.25, 0.024, 0.25, 0, 0.012, 0, 20, 2);
}

function runner(p: Paint) {
  p.box('#a3304a', 2.9, 0.012, 0.9, 0, 0.006, 0);
  p.box(GOLD, 2.7, 0.016, 0.7, 0, 0.008, 0);
  p.box('#a3304a', 2.6, 0.02, 0.6, 0, 0.01, 0);
  for (let k = -3; k <= 3; k++) p.box(CREAM, 0.16, 0.024, 0.16, k * 0.36, 0.012, 0, 0, Math.PI / 4, 0);
  for (const sx of [-1, 1]) for (let k = 0; k < 9; k++) p.box(CREAM, 0.1, 0.008, 0.025, sx * 1.5, 0.004, -0.4 + k * 0.1);
}

function bigRug(p: Paint) {
  p.box('#3f6f6a', 2.9, 0.012, 1.9, 0, 0.006, 0);
  p.box('#e8dcc0', 2.7, 0.016, 1.7, 0, 0.008, 0);
  p.box('#c0603a', 2.5, 0.02, 1.5, 0, 0.01, 0);
  p.box('#f6d55c', 0.9, 0.024, 0.9, 0, 0.012, 0, 0, Math.PI / 4, 0);
  p.box('#3f6f6a', 0.5, 0.028, 0.5, 0, 0.014, 0, 0, Math.PI / 4, 0);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) p.box('#e8dcc0', 0.3, 0.024, 0.3, sx * 0.95, 0.012, sz * 0.5, 0, Math.PI / 4, 0);
}

// On the walls: painted at the foot of the wall, facing into the room (+z), hanging at about head height.

function bunting(p: Paint) {
  p.rope('#f6efe0', 0.01, -0.95, 2.4, 0.1, 0.95, 2.4, 0.1, 0.18, 8);
  const colours = ['#e4553f', '#f6d55c', '#5f8fbf', '#7cc28b', '#f2a7b8'];
  for (let k = 0; k < 9; k++) {
    const t = (k + 0.5) / 9;
    const x = -0.95 + 1.9 * t;
    const y = 2.4 - Math.sin(t * Math.PI) * 0.18;
    p.geo(new THREE.ConeGeometry(0.08, 0.2, 3), colours[k % colours.length], new THREE.Matrix4().compose(new THREE.Vector3(x, y - 0.1, 0.11), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, Math.PI)), new THREE.Vector3(1, 1, 0.25)));
  }
}

function plantShelf(p: Paint, r: () => number) {
  p.box(WOOD_LIGHT, 0.9, 0.04, 0.22, 0, 1.7, 0.13);
  for (const sx of [-1, 1]) p.box(IRON, 0.03, 0.18, 0.15, sx * 0.35, 1.6, 0.1);
  for (let k = 0; k < 3; k++) {
    const pp = p.at(-0.28 + k * 0.28, 1.72, 0.14, 0, 0.6);
    pot(pp, 0.12, 0.2, pick(r, ['#c06a48', '#5f8fbf', '#e8c890']));
    for (let j = 0; j < 4; j++) pp.sphere('#5f9e47', 0.08, 0.16, 0.05, Math.cos(j * 1.6) * 0.08, 0.32, Math.sin(j * 1.6) * 0.06, 8, 6);
  }
  // A trailing vine over the edge.
  for (let k = 0; k < 4; k++) p.sphere('#4f8f45', 0.04, 0.05, 0.03, 0.3, 1.62 - k * 0.09, 0.2, 8, 6);
}

function wallClock(p: Paint) {
  p.cyl(WOOD_DARK, 0.22, 0.05, 0, 2.0, 0.08, 18, Math.PI / 2);
  p.cyl(CREAM, 0.18, 0.06, 0, 2.0, 0.09, 18, Math.PI / 2);
  for (let k = 0; k < 12; k++) {
    const a = (k / 12) * Math.PI * 2;
    p.box('#2a2530', 0.015, 0.035, 0.01, Math.sin(a) * 0.15, 2.0 + Math.cos(a) * 0.15, 0.125, 0, 0, -a);
  }
  p.box('#2a2530', 0.018, 0.12, 0.01, 0, 2.05, 0.13);
  p.box('#2a2530', 0.018, 0.08, 0.01, 0.03, 1.98, 0.13, 0, 0, 1.4);
}

function framed(p: Paint, w: number, h: number, frame: string, y = 1.85) {
  p.box(frame, w + 0.1, h + 0.1, 0.05, 0, y, 0.08);
  p.box(shade(frame, -0.15), w, h, 0.05, 0, y, 0.09);
}

/** Where the drawing sits in a "Your art" frame (4:3, like the drawings), in the piece's own frame. */
const ART_PIC = { w: 0.8, h: 0.6, y: 1.85, z: 0.122 };

/** A "Your art" frame: a warm wooden frame and a cream mount (the drawing itself goes in over it, see makeFlatRoom). */
function artFrame(p: Paint) {
  framed(p, ART_PIC.w + 0.08, ART_PIC.h + 0.08, '#a8743f', ART_PIC.y);
  p.box('#f6efe0', ART_PIC.w + 0.04, ART_PIC.h + 0.04, 0.01, 0, ART_PIC.y, 0.115);
}

function landscape(p: Paint) {
  framed(p, 0.8, 0.55, GOLD);
  p.box('#9fd0ef', 0.78, 0.3, 0.01, 0, 1.97, 0.12);
  p.box('#7cc28b', 0.78, 0.26, 0.01, 0, 1.72, 0.12);
  p.sphere('#5f9e47', 0.25, 0.12, 0.01, -0.18, 1.82, 0.125, 14, 6);
  p.sphere('#6fae4f', 0.3, 0.1, 0.01, 0.2, 1.8, 0.127, 14, 6);
  p.sphere('#f6d55c', 0.06, 0.06, 0.01, 0.25, 2.03, 0.125, 12, 6);
  p.box('#f6efe0', 0.14, 0.04, 0.01, -0.15, 2.05, 0.126);
}

function mirror(p: Paint) {
  p.sphere(GOLD, 0.34, 0.46, 0.03, 0, 1.85, 0.08, 20, 10);
  p.sphere('#d8e8ef', 0.28, 0.4, 0.03, 0, 1.85, 0.1, 20, 10);
  p.box('#ffffff', 0.05, 0.3, 0.005, -0.1, 1.95, 0.135, 0, 0, -0.3);
}

function portrait(p: Paint, r: () => number) {
  framed(p, 0.55, 0.72, '#8a5a36', 1.9);
  p.box('#3f5a4a', 0.53, 0.7, 0.01, 0, 1.9, 0.12);
  // Someone very distinguished in a ruff.
  const fur = pick(r, ['#c49a6c', '#8a8a96', '#e8913a', '#f6efe0']);
  p.sphere(fur, 0.14, 0.16, 0.01, 0, 1.98, 0.13, 14, 6);
  for (const sx of [-1, 1]) p.sphere(fur, 0.05, 0.08, 0.01, sx * 0.1, 2.13, 0.128, 10, 6);
  p.sphere('#2a2530', 0.2, 0.12, 0.01, 0, 1.68, 0.13, 14, 6);
  p.sphere('#ffffff', 0.12, 0.04, 0.01, 0, 1.8, 0.133, 14, 4);
  for (const sx of [-1, 1]) p.sphere('#2a2530', 0.015, 0.015, 0.005, sx * 0.05, 2.0, 0.14, 6, 4);
  p.box(GOLD, 0.3, 0.06, 0.01, 0, 2.29, 0.13);
}

function neonHeart(p: Paint, lit: Lit) {
  p.box('#2a2530', 0.8, 0.7, 0.02, 0, 1.9, 0.07);
  for (let k = 0; k < 28; k++) {
    const t = (k / 28) * Math.PI * 2;
    const x = 16 * Math.pow(Math.sin(t), 3);
    const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
    lit(BALL, '#ff6fcf', x * 0.018, 1.92 + y * 0.018, 0.1, 0.03);
  }
}

function trophyShelf(p: Paint) {
  p.box(WOOD_DARK, 1.4, 0.05, 0.25, 0, 1.6, 0.13);
  for (const sx of [-1, 1]) p.box(IRON, 0.03, 0.15, 0.18, sx * 0.55, 1.52, 0.1);
  [-0.45, 0, 0.45].forEach((x, k) => {
    const h = [0.32, 0.42, 0.28][k];
    const c = [GOLD, '#d8d8e0', '#c0804a'][k];
    p.block(WOOD_DARK, 0.14, 0.06, 0.12, x, 1.625, 0.14);
    p.post(c, 0.02, h * 0.35, x, 1.685, 0.14, 8);
    p.taper(c, 1.6, 0.06, h * 0.45, x, 1.685 + h * 0.35, 0.14, 12);
    for (const sx of [-1, 1]) p.torus(c, 0.04, 0.01, x + sx * 0.09, 1.685 + h * 0.65, 0.14, 0, 0);
  });
  p.box('#a3304a', 0.6, 0.12, 0.01, 0, 1.45, 0.13);
}

/** Paints one piece at the frame's origin (the middle of the cells it covers, on the floor), facing +z. */
export function paintPiece(p: Paint, glow: Builder, id: string, seed: number) {
  const r = rng(seed);
  const lit = litIn(glow, p);
  switch (id) {
    case 'chair':
      return kitchenChair(p);
    case 'beanbag':
      return beanbag(p);
    case 'armchair':
      return upholstered(p, 0.92, '#5f8fbf', '#f6d55c');
    case 'rocker':
      return rocker(p);
    case 'sofa':
      return upholstered(p, 1.9, '#7cae6a', '#f2a7b8');
    case 'bed':
      return bed(p, r);
    case 'side':
      return sideTable(p, lit);
    case 'coffee':
      return coffeeTable(p);
    case 'dining':
      return diningTable(p);
    case 'desk':
      return desk(p, lit);
    case 'bookshelf':
      return bookshelf(p, r);
    case 'wardrobe':
      return wardrobe(p);
    case 'chest':
      return chest(p);
    case 'petbed':
      return petBed(p);
    case 'globe':
      return globe(p);
    case 'easel':
      return easel(p, r);
    case 'birdcage':
      return birdcage(p, r);
    case 'gramophone':
      return gramophone(p);
    case 'tree':
      return festiveTree(p, r, lit);
    case 'bath':
      return bath(p);
    case 'clock':
      return grandfatherClock(p);
    case 'telescope':
      return telescope(p);
    case 'fishtank':
      return fishTank(p, r, lit);
    case 'fireplace':
      return fireplace(p, lit);
    case 'arcade':
      return arcade(p, r, lit);
    case 'jukebox':
      return jukebox(p, lit);
    case 'piano':
      return piano(p);
    case 'cactus':
      return cactus(p);
    case 'plant':
      return pottedPlant(p, r);
    case 'lamp':
      return floorLamp(p, lit);
    case 'fern':
      return fern(p, r);
    case 'rugRound':
      return roundRug(p);
    case 'runner':
      return runner(p);
    case 'rugBig':
      return bigRug(p);
    case 'bunting':
      return bunting(p);
    case 'shelf':
      return plantShelf(p, r);
    case 'wallclock':
      return wallClock(p);
    case 'painting':
      return landscape(p);
    case 'mirror':
      return mirror(p);
    case 'portrait':
      return portrait(p, r);
    case 'neon':
      return neonHeart(p, lit);
    case 'trophies':
      return trophyShelf(p);
    case 'myart':
      return artFrame(p);
  }
}

// ---------------------------------------------------------------- the room itself

/** The floor in a finish, laid over the room's bare boards (its top at 0, like every room's). */
function paintFloor(p: Paint, f: Finish, r: () => number) {
  const hw = FLAT_HW;
  const hd = FLAT_HD;
  const tile = (x: number, z: number, w: number, d: number, c: THREE.ColorRepresentation) => p.box(c, w - 0.03, 0.1, d - 0.03, x + w / 2, -0.05, z + d / 2);
  if (f.pattern === 'planks') {
    for (let x = -hw; x < hw - 0.01; x += 0.5) {
      let z = -hd;
      while (z < hd - 0.01) {
        const len = Math.min(hd - z, 1.6 + r() * 2.2);
        tile(x, z, 0.5, len, shade(r() < 0.5 ? f.a : f.b, (r() - 0.5) * 0.05));
        z += len;
      }
    }
  } else if (f.pattern === 'tiles' || f.pattern === 'marble') {
    const n = f.pattern === 'marble' ? 1 : 0.5;
    for (let x = -hw; x < hw - 0.01; x += n)
      for (let z = -hd; z < hd - 0.01; z += n) {
        const k = (Math.round((x + hw) / n) + Math.round((z + hd) / n)) & 1;
        tile(x, z, n, n, shade(f.pattern === 'marble' ? f.a : k ? f.a : f.b, (r() - 0.5) * 0.03));
        if (f.pattern === 'marble') for (let v = 0; v < 2; v++) p.box(f.b, 0.6 * r() + 0.2, 0.004, 0.02, x + 0.2 + r() * 0.6, 0.001, z + 0.2 + r() * 0.6, 0, r() * Math.PI, 0);
      }
  } else if (f.pattern === 'herring') {
    // Parquet: squares of four short boards, each square turned the other way to its neighbours.
    for (let x = -hw; x < hw - 0.01; x += 1)
      for (let z = -hd; z < hd - 0.01; z += 1) {
        const turn = (Math.round(x + hw) + Math.round(z + hd)) & 1;
        for (let k = 0; k < 4; k++) {
          const c = shade(k % 2 ? f.a : f.b, (r() - 0.5) * 0.05);
          if (turn) p.box(c, 0.97, 0.1, 0.22, x + 0.5, -0.05, z + 0.125 + k * 0.25);
          else p.box(c, 0.22, 0.1, 0.97, x + 0.125 + k * 0.25, -0.05, z + 0.5);
        }
      }
  } else {
    // Carpet: wall to wall, with a slightly darker edge.
    p.box(shade(f.a, -0.06), hw * 2, 0.1, hd * 2, 0, -0.05, 0);
    p.box(f.a, hw * 2 - 0.3, 0.1, hd * 2 - 0.3, 0, -0.048, 0.15);
  }
}

/** The wallpaper's pattern over the plain colour, on the back wall and both side walls, above the panelling. */
function paintWallpaper(p: Paint, f: Finish, r: () => number) {
  const hw = FLAT_HW;
  const hd = FLAT_HD;
  const y0 = 1.12;
  const y1 = WALL_H - 0.82;
  // Each wall, as a frame looking out from it into the room: its length, and where it starts.
  const walls = [
    { m: p.at(0, 0, -hd), len: hw * 2 },
    { m: p.at(-hw, 0, 0.15, Math.PI / 2), len: hd * 2 - 0.3 },
    { m: p.at(hw, 0, 0.15, -Math.PI / 2), len: hd * 2 - 0.3 },
  ];
  for (const { m, len } of walls) {
    if (f.pattern === 'stripes') for (let x = -len / 2 + 0.3; x < len / 2 - 0.1; x += 0.6) m.box(f.b, 0.22, y1 - y0, 0.02, x, (y0 + y1) / 2, 0.012);
    else if (f.pattern === 'dots')
      for (let y = y0 + 0.2, row = 0; y < y1 - 0.1; y += 0.32, row++) for (let x = -len / 2 + 0.2 + (row % 2) * 0.2; x < len / 2 - 0.1; x += 0.4) m.cyl(f.b, 0.05, 0.02, x, y, 0.012, 10, Math.PI / 2);
    else if (f.pattern === 'stars')
      for (let k = 0; k < len * 4; k++) {
        const x = (r() - 0.5) * (len - 0.3);
        const y = y0 + 0.15 + r() * (y1 - y0 - 0.3);
        const s = 0.03 + r() * 0.04;
        m.box(f.b, s * 2, s * 0.5, 0.02, x, y, 0.012, 0, 0, Math.PI / 4);
        m.box(f.b, s * 2, s * 0.5, 0.02, x, y, 0.012, 0, 0, -Math.PI / 4);
      }
    else if (f.pattern === 'brick')
      for (let y = y0 + 0.24, row = 0; y < y1; y += 0.24, row++) {
        m.box(f.b, len, 0.025, 0.02, 0, y, 0.012);
        for (let x = -len / 2 + (row % 2 ? 0.25 : 0.5); x < len / 2; x += 0.5) m.box(f.b, 0.025, 0.22, 0.02, x, y - 0.12, 0.012);
      }
  }
}

/** The back wall's window, with curtains, and a radiator under it. */
function paintWindow(p: Paint, glass: Builder) {
  const w = 1.3;
  const h = 1.1;
  const y = 2.05;
  const z = -FLAT_HD;
  p.box('#f6efe0', w + 0.2, h + 0.2, 0.08, 0, y, z + 0.02);
  new Paint({ main: glass, glass }, p.m).box('#ffffff', w, h, 0.06, 0, y, z + 0.06);
  p.box('#f6efe0', 0.06, h, 0.05, 0, y, z + 0.1);
  p.box('#f6efe0', w, 0.06, 0.05, 0, y, z + 0.1);
  p.box('#f6efe0', w + 0.35, 0.08, 0.22, 0, y - h / 2 - 0.08, z + 0.1);
  for (const sx of [-1, 1]) {
    const x = sx * 0.85;
    p.box('#e8a8b4', 0.3, 1.4, 0.06, x, 2.1, z + 0.14);
    for (let k = 0; k < 4; k++) p.box(shade('#e8a8b4', k % 2 ? -0.08 : 0.04), 0.05, 1.4, 0.07, x - 0.11 + k * 0.075, 2.1, z + 0.14);
  }
  p.cyl(WOOD_DARK, 0.025, 2.1, 0, 2.82, z + 0.14, 8, 0, 0, Math.PI / 2);
  // A radiator under the sill.
  for (let k = 0; k < 8; k++) p.rbox('#f6f6f2', 0.1, 0.55, 0.1, -0.42 + k * 0.12, 0.65, z + 0.12, 0.03);
}

// ---------------------------------------------------------------- the flat, furnished on the fly

export interface FlatScene {
  layout: FlatLayout;
  /** Decorating: the piece in hand, where it would go and whether it fits there; `index` is the one it was (or -1). */
  held?: { item: FlatItem; index: number; ok: boolean } | null;
  /** Decorating: show the grid on the floor. */
  grid?: boolean;
  /** The drawings in the "Your art" frames, by id (undefined while one is on its way, null if it's missing). */
  art?: Record<string, string | null | undefined>;
}

export interface FlatRoom {
  /** Goes in the flat room's group. */
  group: THREE.Group;
  /** The furniture's colliders: the same array, kept up to date. */
  colliders: Collider[];
  /** Somewhere to sit in the flat as it's furnished now. */
  seats: Station[];
  /** Returns whether anything changed. */
  set(scene: FlatScene | null): boolean;
  update(t: number): void;
}

const mat = matte();
const glowMat = new THREE.MeshBasicMaterial({ vertexColors: true });

export function makeFlatRoom(glassMaterial: THREE.Material): FlatRoom {
  const group = new THREE.Group();
  const shellGroup = new THREE.Group();
  const furniture = new THREE.Group();
  const ghost = new THREE.Group();
  const pictures = new THREE.Group();
  group.add(shellGroup, furniture, ghost, pictures);
  const colliders: Collider[] = [];
  const seats: Station[] = [];
  let shellKey = '';
  let itemsKey = '';
  let heldKey = '';
  let artKey = '';

  // The decorating grid: a line every half metre, the doorway's cells tinted.
  const gridTex = (() => {
    const c = document.createElement('canvas');
    c.width = 20 * 32;
    c.height = 16 * 32;
    const g = c.getContext('2d')!;
    g.fillStyle = 'rgba(255, 120, 90, 0.22)';
    g.fillRect(8 * 32, 11 * 32, 4 * 32, 5 * 32);
    g.strokeStyle = 'rgba(255, 255, 255, 0.55)';
    g.lineWidth = 2;
    for (let x = 0; x <= 20; x++) g.strokeRect(x * 32, 0, 0.01, c.height);
    for (let z = 0; z <= 16; z++) g.strokeRect(0, z * 32, c.width, 0.01);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  })();
  const grid = new THREE.Mesh(new THREE.PlaneGeometry(FLAT_HW * 2, FLAT_HD * 2), new THREE.MeshBasicMaterial({ map: gridTex, transparent: true, depthWrite: false }));
  grid.rotation.x = -Math.PI / 2;
  grid.position.y = 0.03;
  grid.visible = false;
  group.add(grid);
  const markMat = new THREE.MeshBasicMaterial({ color: '#7cdc7c', transparent: true, opacity: 0.45, depthWrite: false });
  const mark = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), markMat);
  mark.rotation.x = -Math.PI / 2;
  mark.position.y = 0.04;
  mark.visible = false;
  group.add(mark);
  const ghostMat = new THREE.MeshLambertMaterial({ vertexColors: true, transparent: true, opacity: 0.85 });

  const dispose = (g: THREE.Group) => {
    for (const o of [...g.children]) {
      g.remove(o);
      (o as THREE.Mesh).geometry?.dispose();
    }
  };
  /** Meshes for a set of pieces: the solid ones, and their glowing bits. */
  const meshes = (items: FlatItem[], material: THREE.Material, seedOf: (i: number) => number): THREE.Object3D[] => {
    const main = new Builder();
    const glow = new Builder();
    items.forEach((it, i) => {
      const at = placeOf(it);
      if (!at) return;
      paintPiece(new Paint({ main, glass: main }).at(at.x, 0, at.z, at.ry), glow, it.id, seedOf(i));
    });
    const out: THREE.Object3D[] = [];
    if (!main.empty) out.push(smoothMesh(main, material));
    if (!glow.empty) out.push(glow.mesh(glowMat, { cast: false, receive: false }));
    return out;
  };

  function buildShell(wallId: string, floorId: string) {
    dispose(shellGroup);
    const wall = wallById(wallId);
    const floor = floorById(floorId);
    const main = new Builder();
    const glass = new Builder();
    const p = new Paint({ main, glass });
    const r = rng(11);
    shell(p, 'flat', { floor: [], bare: true, wall: wall.a, wainscot: '#efe6d6', trim: '#8a6a4a' }, r);
    paintFloor(p, floor, r);
    paintWallpaper(p, wall, r);
    paintWindow(p, glass);
    shellGroup.add(smoothMesh(main, mat));
    if (!glass.empty) shellGroup.add(glass.mesh(glassMaterial, { cast: false, receive: false }));
  }

  function buildFurniture(items: FlatItem[], skip: number) {
    dispose(furniture);
    const shown = items.filter((_, i) => i !== skip);
    for (const m of meshes(shown, mat, (i) => i * 31 + shown[i].x * 7 + shown[i].z)) furniture.add(m);
    colliders.length = 0;
    colliders.push(...roomColliders('flat'));
    seats.length = 0;
    shown.forEach((it, i) => {
      const piece = pieceById(it.id);
      const at = placeOf(it);
      const box = cellsOf(it, piece);
      if (!piece || !at || !box || piece.kind !== 'floor') return;
      const hw = ((box[2] - box[0]) * CELL) / 2 - 0.08;
      const hd = ((box[3] - box[1]) * CELL) / 2 - 0.08;
      colliders.push({ kind: 'box', x: at.x, z: at.z, hw: Math.max(0.12, hw), hd: Math.max(0.12, hd), rot: 0 });
      piece.seats?.forEach((s, k) => {
        const spot = local(at.x, at.z, at.ry, s.x, s.z);
        seats.push({ id: `flat-seat-${i}-${k}`, zone: 'flat', x: spot.x, z: spot.z, r: 0.8, job: 'sit', stand: { x: spot.x, z: spot.z, ry: at.ry }, y: s.y, label: 'Sit' });
      });
    });
  }

  /** The drawings in the "Your art" frames, each a picture on the mount. */
  const picGeo = new THREE.PlaneGeometry(ART_PIC.w, ART_PIC.h);
  function buildPictures(items: FlatItem[], art: FlatScene['art']) {
    for (const o of [...pictures.children]) {
      pictures.remove(o);
      const m = (o as THREE.Mesh).material as THREE.MeshLambertMaterial;
      m.map?.dispose();
      m.dispose();
    }
    for (const it of items) {
      const img = it.art ? art?.[it.art] : null;
      const at = placeOf(it);
      if (!img || !at) continue;
      const tex = new THREE.Texture();
      tex.colorSpace = THREE.SRGBColorSpace;
      const mesh = new THREE.Mesh(picGeo, new THREE.MeshLambertMaterial({ map: tex, emissive: '#ffffff', emissiveMap: tex, emissiveIntensity: 0.1 }));
      // (Hidden until the picture has loaded, rather than a black square for a moment.)
      mesh.visible = false;
      const el = new Image();
      el.onload = () => {
        tex.image = el;
        tex.needsUpdate = true;
        mesh.visible = true;
      };
      el.src = img;
      const spot = local(at.x, at.z, at.ry, 0, ART_PIC.z);
      mesh.position.set(spot.x, ART_PIC.y, spot.z);
      mesh.rotation.y = at.ry;
      mesh.receiveShadow = true;
      pictures.add(mesh);
    }
  }

  function buildHeld(held: FlatScene['held']) {
    dispose(ghost);
    mark.visible = false;
    if (!held) return;
    for (const m of meshes([held.item], ghostMat, () => 7)) {
      m.castShadow = false;
      ghost.add(m);
    }
    const box = cellsOf(held.item);
    if (!box) return;
    const piece = pieceById(held.item.id);
    // On the wall, the mark shows along the foot of it.
    const w = (box[2] - box[0]) * CELL;
    const d = (box[3] - box[1]) * CELL;
    mark.scale.set(w, piece?.kind === 'wall' ? Math.min(d, CELL) : d, 1);
    mark.position.set(-FLAT_HW + box[0] * CELL + w / 2, 0.04, -FLAT_HD + box[1] * CELL + d / 2);
    markMat.color.set(held.ok ? '#7cdc7c' : '#ff6a5a');
    mark.visible = true;
  }

  return {
    group,
    colliders,
    seats,
    set(scene) {
      let changed = false;
      const layout = scene?.layout ?? { wall: 'cream', floor: 'oak', items: [] };
      const sk = `${layout.wall}|${layout.floor}`;
      if (sk !== shellKey) {
        shellKey = sk;
        buildShell(layout.wall, layout.floor);
        changed = true;
      }
      const skip = scene?.held ? scene.held.index : -1;
      const ik = `${skip}:${JSON.stringify(layout.items)}`;
      if (ik !== itemsKey) {
        itemsKey = ik;
        buildFurniture(layout.items, skip);
        changed = true;
      }
      // The drawings: again whenever a frame moves, or a picture arrives.
      const framed = layout.items.filter((it, i) => it.art && i !== skip);
      const ak = JSON.stringify(framed.map((it) => [it.art, it.x, it.z, it.r, scene?.art?.[it.art!]?.length ?? 0]));
      if (ak !== artKey) {
        artKey = ak;
        buildPictures(framed, scene?.art);
        changed = true;
      }
      const hk = JSON.stringify(scene?.held ?? null);
      if (hk !== heldKey) {
        heldKey = hk;
        buildHeld(scene?.held ?? null);
        changed = true;
      }
      grid.visible = Boolean(scene?.grid);
      return changed;
    },
    update(t) {
      // The piece in hand bobs a little, so it's clear which one it is.
      ghost.position.y = mark.visible ? 0.04 + Math.abs(Math.sin(t * 3)) * 0.06 : 0;
    },
  };
}

// ---------------------------------------------------------------- the lobby

export function lobbyRoom(p: Paint, glow: Builder, r: () => number): THREE.Object3D {
  const { hw, hd } = ROOMS.lobby;
  shell(p, 'lobby', { floor: ['#2f2a2e', '#f2ece0'], wall: '#e9dcc4', wainscot: '#5f7a64', trim: '#4a3a2c', tiles: true }, r);
  // Green-and-cream wallpaper stripes over the panelling.
  for (let x = -hw + 0.3; x < hw; x += 0.6) p.box('#dfcfb2', 0.2, WALL_H - 1.9, 0.02, x, 1.1 + (WALL_H - 1.9) / 2, -hd + 0.012);
  // The lift: brass doors in a dark frame, an arrow dial above, and the call button beside it.
  const l = p.at(LIFT.x, 0, -hd);
  l.box('#3a2a22', 2.0, 2.7, 0.2, 0, 1.35, 0.1);
  l.box(GOLD, 1.7, 2.3, 0.05, 0, 1.15, 0.2);
  for (const sx of [-1, 1]) {
    l.box(BRASS, 0.76, 2.2, 0.05, sx * 0.39, 1.12, 0.23);
    for (let k = 0; k < 3; k++) l.box(shade(BRASS, -0.12), 0.56, 0.6, 0.02, sx * 0.39, 0.5 + k * 0.7, 0.26);
  }
  l.cyl(GOLD, 0.3, 0.05, 0, 2.6, 0.22, 20, Math.PI / 2);
  l.cyl(CREAM, 0.25, 0.06, 0, 2.6, 0.23, 20, Math.PI / 2);
  for (let k = 0; k < 4; k++) {
    const a = -Math.PI / 2 + (k / 3) * Math.PI;
    l.box('#2a2530', 0.02, 0.05, 0.01, Math.sin(a) * 0.19, 2.6 + Math.cos(a) * 0.19, 0.265, 0, 0, -a);
  }
  l.box('#a3304a', 0.02, 0.18, 0.01, 0.05, 2.65, 0.27, 0, 0, -0.5);
  l.box(BRASS, 0.14, 0.24, 0.03, 1.15, 1.25, 0.21);
  glow.add(new THREE.IcosahedronGeometry(0.035, 1), '#ffb347', { pos: [1.15, 1.29, 0.24] }, p.m.clone().multiply(new THREE.Matrix4().makeTranslation(LIFT.x, 0, -hd)));
  glow.add(new THREE.IcosahedronGeometry(0.035, 1), '#7cdc7c', { pos: [1.15, 1.2, 0.24] }, p.m.clone().multiply(new THREE.Matrix4().makeTranslation(LIFT.x, 0, -hd)));
  // The residents' board: rows of little name plates.
  const b = p.at(LOBBY_BOARD.x, LOBBY_BOARD.y, -hd);
  b.box('#4a3a2c', 1.2, 1.0, 0.06, 0, 0, 0.05);
  b.box('#2a2530', 1.08, 0.88, 0.04, 0, 0, 0.08);
  for (let row = 0; row < 7; row++) for (const sx of [-1, 1]) b.box(r() < 0.8 ? '#e8dcc0' : GOLD, 0.44, 0.07, 0.02, sx * 0.26, 0.33 - row * 0.11, 0.105);
  // Mailboxes down the left wall, a little brass door each.
  const mb = p.at(-hw, 0, -0.6, Math.PI / 2);
  mb.block(WOOD_DARK, 2.9, 1.5, 0.5, 0, 0.35, 0.25);
  for (let row = 0; row < 4; row++)
    for (let col = 0; col < 7; col++) {
      mb.box(BRASS, 0.34, 0.28, 0.02, -1.23 + col * 0.41, 0.55 + row * 0.35, 0.51);
      mb.box(shade(BRASS, -0.2), 0.16, 0.03, 0.01, -1.23 + col * 0.41, 0.6 + row * 0.35, 0.525);
    }
  // The bench in front of them.
  const bench = p.at(LOBBY_BENCH.x, 0, LOBBY_BENCH.z, Math.PI / 2);
  bench.rbox('#a3304a', LOBBY_BENCH.len, 0.14, 0.5, 0, 0.42, 0, 0.05);
  bench.rbox(shade('#a3304a', -0.05), LOBBY_BENCH.len, 0.45, 0.12, 0, 0.7, -0.22, 0.05);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) bench.post(WOOD_DARK, 0.04, 0.36, sx * (LOBBY_BENCH.len / 2 - 0.12), 0, sz * 0.18, 8);
  // The stairs up the right, with a banister.
  const st = LOBBY_STAIRS;
  const steps = 14;
  for (let k = 0; k < steps; k++) {
    const z = st.z0 - ((k + 0.5) * (st.z0 - st.z1)) / steps;
    const y = ((k + 1) * st.h) / steps;
    p.block(k % 2 ? '#8a6a4a' : '#7a5a40', st.w, y, (st.z0 - st.z1) / steps + 0.01, st.x, 0, z);
    p.box('#a3304a', st.w - 0.4, 0.02, (st.z0 - st.z1) / steps - 0.05, st.x, y + 0.005, z);
  }
  p.rod(WOOD_DARK, 0.04, st.x - st.w / 2, 1.0, st.z0, st.x - st.w / 2, st.h + 0.9, st.z1 + 0.2, 8);
  for (let k = 0; k <= 6; k++) {
    const t = k / 6;
    const z = st.z0 + (st.z1 + 0.2 - st.z0) * t;
    const y = (st.h * (st.z0 - z)) / (st.z0 - st.z1);
    p.post(CREAM, 0.025, 0.9, st.x - st.w / 2, y + 0.1, z, 6);
  }
  p.post(WOOD_DARK, 0.07, 1.1, st.x - st.w / 2, 0, st.z0 + 0.05, 8);
  p.sphere(BRASS, 0.08, 0.08, 0.08, st.x - st.w / 2, 1.15, st.z0 + 0.05, 10, 8);
  // A runner from the door to the lift, plants, and wall lamps either side of the lift.
  p.box('#a3304a', 1.3, 0.012, 6.6, 0, 0.006, 0.1);
  p.box(GOLD, 1.1, 0.016, 6.4, 0, 0.008, 0.1);
  p.box('#a3304a', 1.0, 0.02, 6.3, 0, 0.01, 0.1);
  for (const [x, z, k] of [
    [-1.6, -3.5, 0],
    [1.6, -3.5, 1],
    [-5.0, 3.4, 2],
    [3.2, 3.4, 3],
  ]) {
    const pp = p.at(x, 0, z);
    pot(pp, 0.25, 0.45, k % 2 ? '#5f8fbf' : '#c06a48');
    for (let j = 0; j < 9; j++) {
      const a = (j / 9) * Math.PI * 2 + k;
      pp.rod('#4f8f45', 0.03, 0, 0.45, 0, Math.cos(a) * 0.35, 1.15 + (j % 3) * 0.1, Math.sin(a) * 0.35, 5);
      pp.sphere(pick(r, ['#5f9e47', '#6fae4f', '#4f8f45']), 0.16, 0.06, 0.09, Math.cos(a) * 0.35, 1.15 + (j % 3) * 0.1, Math.sin(a) * 0.35, 8, 4);
    }
  }
  for (const x of [-3.7, 2.7]) {
    p.box(BRASS, 0.1, 0.25, 0.08, x, 2.1, -hd + 0.06);
    p.taper('#f6d9a8', 0.7, 0.13, 0.22, x, 2.15, -hd + 0.2, 12);
    glow.add(new THREE.IcosahedronGeometry(0.06, 1), '#ffe2a0', { pos: [x, 2.22, -hd + 0.2] }, p.m);
  }
  // The block's name over the lift.
  const sign = new TextSign({ w: 512, h: 128, bg: '#2a2530', fg: '#f6d77a', border: GOLD }, [FLATS_NAME]);
  const { mesh } = signBoard(sign, 1.8, 0.45, { lit: true });
  mesh.position.set(LIFT.x, 3.0, -hd + 0.12);
  return mesh;
}
