import * as THREE from 'three';
import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import { Builder, matte } from '../build';
import { G, Paint, shade, smoothMesh } from './kit';
import { CLUB, CLUB_BAR, CLUB_ROPE, CLUB_SOFA, CLUB_SPEAKERS, CLUB_STOOLS, CLUB_TABLE, DANCE_FLOOR, DISCO_BALL, JUKEBOX, ROOMS } from './layout';
import { IRON } from './props';
import { TextSign, signBoard } from './sign';

/**
 * The Velvet Horn: the club's front out in town (a plum-painted front with a marquee of bulbs, a lit sign, a red
 * carpet and a velvet rope), the room inside (a dance floor of glowing tiles, a disco ball throwing spots of light,
 * the jukebox between two speakers, a velvet sofa and a juice bar), and Big Moo, the minotaur on the door.
 */

const PLUM = '#6a3f86';
const PLUM_DARK = '#3a2148';
const GOLD = '#d9b04f';
const VELVET = '#8a1f4a';
const CARPET = '#a3203a';
const PINK = '#ff6fcf';
const CYAN = '#5fe8ff';

/** Where to put glow halos and swinging doors, from the town that's being built. */
export interface FrontHooks {
  glow: (p: Paint, x: number, y: number, z: number, size: number, color: string) => void;
  door: (p: Paint, w: number, h: number, color: THREE.ColorRepresentation) => void;
}

/**
 * The front of the club, in its own frame (its door on +z). Plain parts go to `p`; the neon tubes and the marquee's
 * bulbs go to `neon`, which is drawn bright day and night. Returns the lit sign over the door.
 */
export function clubFront(p: Paint, neon: Builder, hooks: FrontHooks): { sign: THREE.Object3D; material: THREE.MeshLambertMaterial } {
  const W = CLUB.w;
  const D = CLUB.d;
  const H = 3.5;
  const front = D / 2;
  const n = new Paint({ main: neon, glass: neon }, p.m);
  // A dark plinth, plum walls with dark corners, and a flat roof behind a stepped false front.
  p.block('#2c2630', W + 0.3, 0.3, D + 0.3, 0, 0, 0);
  p.block(PLUM, W, H, D, 0, 0.3, 0);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) p.block(PLUM_DARK, 0.22, H, 0.22, sx * (W / 2), 0.3, sz * (D / 2));
  p.block(PLUM_DARK, W + 0.4, 0.22, D + 0.4, 0, 0.3 + H, 0);
  p.block(shade(PLUM_DARK, 0.04), W - 0.6, 0.3, D - 0.6, 0, 0.52 + H, 0);
  const top = 0.3 + H;
  p.block(PLUM, W + 0.2, 0.7, 0.3, 0, top, front - 0.05);
  p.block(PLUM, W * 0.55, 0.55, 0.3, 0, top + 0.7, front - 0.05);
  p.block(PLUM_DARK, W + 0.3, 0.08, 0.4, 0, top + 0.7, front - 0.05);
  p.block(PLUM_DARK, W * 0.55 + 0.1, 0.08, 0.4, 0, top + 1.25, front - 0.05);
  // Neon along the false front's steps, pink over cyan.
  n.box(PINK, W + 0.1, 0.05, 0.05, 0, top + 0.66, front + 0.13);
  n.box(CYAN, W * 0.55, 0.05, 0.05, 0, top + 1.21, front + 0.13);
  for (const sx of [-1, 1]) n.box(PINK, 0.05, 0.6, 0.05, sx * (W / 2 + 0.06), top + 0.35, front + 0.13);
  // Gold pin stripes up the front, either side of the door.
  for (const x of [-1.6, 1.6]) p.box(GOLD, 0.06, H - 0.3, 0.04, x, 0.3 + (H - 0.3) / 2, front + 0.02);
  // The double door, padded and studded, under a marquee edged with bulbs.
  const f = p.at(0, 0.3, front + 0.01);
  f.box(PLUM_DARK, 1.75, 2.45, 0.08, 0, 1.22, 0.02);
  const doorColor = '#5a1630';
  f.box(doorColor, 1.45, 2.25, 0.1, 0, 1.12, 0.06);
  hooks.door(f.at(0, 0, 0), 1.45, 2.25, doorColor);
  f.box(shade(doorColor, -0.1), 0.03, 2.2, 0.03, 0, 1.12, 0.12);
  for (const sx of [-1, 1]) {
    for (let row = 0; row < 4; row++) for (let col = 0; col < 2; col++) f.sphere(GOLD, 0.022, 0.022, 0.012, sx * (0.2 + col * 0.3), 0.45 + row * 0.5, 0.12, 8, 6);
    f.box(GOLD, 0.04, 0.32, 0.04, sx * 0.12, 1.15, 0.14);
  }
  f.block('#2c2630', 2.0, 0.08, 0.6, 0, -0.3, 0.32);
  const m = p.at(0, 0, front);
  m.box('#1a1020', 2.8, 0.16, 1.5, 0, 2.95, 0.72);
  m.box(GOLD, 2.86, 0.06, 0.06, 0, 3.05, 1.47);
  for (const sx of [-1, 1]) m.box(GOLD, 0.06, 0.06, 1.5, sx * 1.42, 3.05, 0.72);
  for (const sx of [-1, 1]) m.rod(IRON, 0.015, sx * 1.3, 3.0, 1.4, sx * 1.3, H + 0.2, 0.05);
  for (let k = 0; k <= 11; k++) {
    n.sphere('#fff3c4', 0.045, 0.045, 0.045, -1.38 + k * 0.25, 0.3 + 2.82, front + 1.48, 8, 6);
  }
  for (const sx of [-1, 1]) for (let k = 0; k < 6; k++) n.sphere('#fff3c4', 0.045, 0.045, 0.045, sx * 1.44, 0.3 + 2.82, front + 0.1 + k * 0.26, 8, 6);
  hooks.glow(m, 0, 2.8, 1.2, 1.5, '#ffd6a0');
  // Round porthole windows either side of the door and down the sides, glowing pink inside.
  for (const x of [-2.6, 2.6]) {
    p.torus(GOLD, 0.42, 0.06, x, 1.9, front + 0.04, 0, 0);
    p.glass.cyl('#ff9ad8', 0.4, 0.06, x, 1.9, front + 0.02, 20, Math.PI / 2);
    hooks.glow(p, x, 1.9, front + 0.2, 1.4, '#ff8ad0');
  }
  for (const sx of [-1, 1]) {
    const s = p.at(sx * (W / 2 + 0.01), 0, 0, (sx * Math.PI) / 2);
    for (const z of [-1.2, 1.2]) {
      s.torus(GOLD, 0.36, 0.05, z, 1.9, 0.03, 0, 0);
      s.glass.cyl('#ff9ad8', 0.34, 0.06, z, 1.9, 0.01, 20, Math.PI / 2);
    }
  }
  // Neon music notes either side of the sign, and a pair of neon horns on top of it.
  for (const sx of [-1, 1]) {
    const x = sx * 2.85;
    const y = top + 0.35;
    n.sphere(CYAN, 0.1, 0.075, 0.03, x, y - 0.18, front + 0.14, 10, 6);
    n.box(CYAN, 0.035, 0.42, 0.03, x + 0.08, y + 0.02, front + 0.14);
    n.box(CYAN, 0.16, 0.035, 0.03, x + 0.15, y + 0.22, front + 0.14, 0, 0, -0.5);
  }
  for (const sx of [-1, 1]) {
    n.rod('#ffe7a8', 0.035, sx * 0.55, top + 1.33, front + 0.1, sx * 0.85, top + 1.45, front + 0.1);
    n.rod('#ffe7a8', 0.03, sx * 0.85, top + 1.45, front + 0.1, sx * 0.95, top + 1.7, front + 0.1);
  }
  // The red carpet out to the rope and a little past, and the rope's brass posts.
  p.box(CARPET, 1.5, 0.025, 2.4, 0, 0.0125, front + 1.2);
  for (const sx of [-1, 1]) p.box(GOLD, 0.05, 0.03, 2.4, sx * 0.76, 0.015, front + 1.2);
  for (const sx of [-1, 1]) {
    const x = sx * CLUB_ROPE.lx;
    const z = CLUB_ROPE.lz;
    p.cyl(GOLD, 0.16, 0.05, x, 0.025, z, 16);
    p.post(GOLD, 0.035, 0.92, x, 0.04, z, 10);
    p.sphere(GOLD, 0.07, 0.07, 0.07, x, 0.98, z, 12, 8);
  }
  // Topiary balls in square planters either side of the door.
  for (const sx of [-1, 1]) {
    const x = sx * 1.25;
    p.block('#1a1020', 0.5, 0.45, 0.5, x, 0, front + 0.4);
    p.box(GOLD, 0.54, 0.05, 0.54, x, 0.45, front + 0.4);
    p.post('#5a3a2a', 0.03, 0.5, x, 0.45, front + 0.4, 6);
    p.leaves.blob('#3f7f3f', 0.3, x, 1.15, front + 0.4, 2, 1, 0, 0, true);
  }
  // Round the back: a vent, and crates of empty juice bottles.
  p.block('#5c5a66', 1.0, 0.7, 0.5, 1.4, top - 0.3 + 0.52, -0.6);
  for (let k = 0; k < 3; k++) p.block(shade('#7a5a3a', k * 0.04), 0.6, 0.35, 0.45, -2.6 + k * 0.05, k * 0.35, -front - 0.4);
  // The sign over the door.
  const sign = new TextSign({ w: 768, h: 192, bg: '#1a0f22', fg: '#ff8ad8', border: GOLD, weight: 700, italic: true, size: 112 }, ['The Velvet Horn', 'dancing · juice · good vibes']);
  const board = signBoard(sign, 3.3, 0.82, { lit: true });
  const at = new THREE.Vector3(0, top + 0.35, front + 0.25).applyMatrix4(p.m);
  board.mesh.position.copy(at);
  board.mesh.rotation.y = CLUB.ry;
  return { sign: board.mesh, material: board.material };
}

// ---------------------------------------------------------------- inside

/** The club's moving parts: the floor's tiles, the disco ball and its spots and beams, and the jukebox's lights. */
export interface ClubRoom {
  group: THREE.Group;
  /**
   * Each frame, in the club: `beat` counts beats since the song began (fractions between), `colors` the song's lights,
   * and `dancers` where anyone dancing on the floor stands.
   */
  update(t: number, beat: number, colors: THREE.Color[], dancers: { x: number; z: number }[]): void;
}

const TILE = 1;
const COLS = DANCE_FLOOR.hw * 2;
const ROWS = DANCE_FLOOR.hd * 2;

/** The room's fixed parts, painted with the rest of it. */
export function clubRoom(p: Paint, glow: Builder, r: () => number, halo: (p: Paint, x: number, y: number, z: number, size: number, color: string) => void) {
  const { hw, hd } = ROOMS.club;
  const WALL = 3.4;
  const wall = '#2c1838';
  const trim = GOLD;
  // A floor of dark tiles (the dance floor's are separate, and light up), and the dark edge under it.
  for (let x = -hw; x < hw - 0.01; x += 1) {
    for (let z = -hd; z < hd - 0.01; z += 1) {
      if (Math.abs(x + 0.5 - DANCE_FLOOR.x) < DANCE_FLOOR.hw && Math.abs(z + 0.5 - DANCE_FLOOR.z) < DANCE_FLOOR.hd) continue;
      const k = (Math.round(x) + Math.round(z)) & 1;
      p.box(shade(k ? '#2a1d33' : '#3a2a46', (r() - 0.5) * 0.02), 0.97, 0.1, 0.97, x + 0.5, -0.05, z + 0.5);
    }
  }
  p.box('#120c16', hw * 2, 0.1, hd * 2, 0, -0.07, 0);
  p.box('#0d0910', hw * 2 + 0.6, 0.6, hd * 2 + 0.3, 0, -0.42, 0.15);
  // The dance floor's frame and the dark under its glowing tiles.
  p.box('#0a070c', DANCE_FLOOR.hw * 2, 0.02, DANCE_FLOOR.hd * 2, DANCE_FLOOR.x, -0.005, DANCE_FLOOR.z);
  for (const sz of [-1, 1]) p.box(trim, DANCE_FLOOR.hw * 2 + 0.16, 0.05, 0.08, DANCE_FLOOR.x, 0.02, DANCE_FLOOR.z + sz * (DANCE_FLOOR.hd + 0.04));
  for (const sx of [-1, 1]) p.box(trim, 0.08, 0.05, DANCE_FLOOR.hd * 2, DANCE_FLOOR.x + sx * (DANCE_FLOOR.hw + 0.04), 0.02, DANCE_FLOOR.z);
  // Walls, buttoned velvet panels between gold strips, a dado rail and a cornice.
  p.box(wall, hw * 2 + 0.6, WALL, 0.3, 0, WALL / 2, -hd - 0.15);
  for (const sx of [-1, 1]) p.box(shade(wall, -0.03), 0.3, WALL, hd * 2 + 0.3, sx * (hw + 0.15), WALL / 2, 0.15);
  for (let x = -hw + 1; x < hw - 0.5; x += 2) {
    if (Math.abs(x) < 1.5) continue;
    p.box(VELVET, 1.6, 1.5, 0.05, x, 1.65, -hd + 0.025);
    for (let row = 0; row < 3; row++) for (let col = 0; col < 3; col++) p.sphere(shade(VELVET, -0.12), 0.03, 0.03, 0.02, x - 0.5 + col * 0.5, 1.15 + row * 0.5, -hd + 0.06, 8, 6);
  }
  for (const sx of [-1, 1]) {
    for (let z = -hd + 1; z < hd - 0.8; z += 2) {
      p.box(VELVET, 0.05, 1.5, 1.6, sx * (hw - 0.025), 1.65, z);
      for (let row = 0; row < 3; row++) for (let col = 0; col < 3; col++) p.sphere(shade(VELVET, -0.12), 0.02, 0.03, 0.03, sx * (hw - 0.06), 1.15 + row * 0.5, z - 0.5 + col * 0.5, 8, 6);
    }
  }
  p.box(trim, hw * 2, 0.06, 0.06, 0, 0.82, -hd + 0.05);
  for (const sx of [-1, 1]) p.box(trim, 0.06, 0.06, hd * 2 - 0.06, sx * (hw - 0.05), 0.82, 0.03);
  p.box(PLUM_DARK, hw * 2, 0.16, 0.12, 0, 0.08, -hd + 0.06);
  for (const sx of [-1, 1]) p.box(PLUM_DARK, 0.12, 0.16, hd * 2 - 0.12, sx * (hw - 0.06), 0.08, 0.06);
  p.box(PLUM_DARK, hw * 2 + 0.6, 0.16, 0.36, 0, WALL + 0.05, -hd - 0.15);
  for (const sx of [-1, 1]) p.box(PLUM_DARK, 0.36, 0.16, hd * 2 + 0.27, sx * (hw + 0.15), WALL + 0.05, 0.165);
  // The way out, on the camera side, and a mat.
  p.box(trim, 0.18, 2.5, 0.25, -0.75, 1.25, hd + 0.05);
  p.box(trim, 0.18, 2.5, 0.25, 0.75, 1.25, hd + 0.05);
  p.box(trim, 1.7, 0.2, 0.25, 0, 2.55, hd + 0.05);
  p.box(CARPET, 1.3, 0.03, 0.9, 0, 0.015, hd - 0.6);
  for (const sx of [-1, 1]) p.box(shade(wall, -0.06), hw - 0.85, 0.35, 0.2, sx * ((hw + 0.85) / 2), 0.175, hd + 0.05);
  // The jukebox: a rounded wooden case with a chrome grille, the record window, and its glowing arch (lit separately).
  {
    const j = p.at(JUKEBOX.x, 0, JUKEBOX.z);
    j.rbox('#8a3a1e', 1.2, 1.35, 0.7, 0, 0.675, 0, 0.08);
    j.cyl('#8a3a1e', 0.6, 0.7, 0, 1.35, 0, 24, Math.PI / 2);
    j.rbox('#c8ccd4', 0.9, 0.55, 0.06, 0, 0.45, 0.35, 0.02);
    for (let k = 0; k < 7; k++) j.box('#7a7e88', 0.04, 0.5, 0.02, -0.36 + k * 0.12, 0.45, 0.39);
    j.glass.box('#ffe9b0', 0.7, 0.32, 0.04, 0, 1.0, 0.35);
    j.cyl('#2a2228', 0.13, 0.02, 0, 1.0, 0.38, 20, Math.PI / 2);
    j.cyl(GOLD, 0.03, 0.025, 0, 1.0, 0.39, 10, Math.PI / 2);
    for (let k = 0; k < 6; k++) j.box(k % 2 ? '#f6e3b0' : '#e8c35a', 0.08, 0.05, 0.03, -0.25 + k * 0.1, 0.8, 0.37);
    j.box('#c8ccd4', 1.24, 0.06, 0.74, 0, 1.36, 0);
    j.block('#2a2228', 1.3, 0.06, 0.8, 0, 0, 0);
    halo(j, 0, 1.4, 0.4, 2.2, '#ff8ad8');
  }
  // Speakers either side: black cabinets with two cones each.
  for (const sp of CLUB_SPEAKERS) {
    const s = p.at(sp.x, 0, sp.z);
    s.rbox('#141016', 0.8, 1.7, 0.7, 0, 0.85, 0, 0.04);
    for (const [y, rad] of [
      [0.5, 0.26],
      [1.25, 0.18],
    ] as [number, number][]) {
      s.cyl('#3a3540', rad + 0.04, 0.03, 0, y, 0.36, 20, Math.PI / 2);
      s.cyl('#2a2630', rad, 0.04, 0, y, 0.35, 20, Math.PI / 2);
      s.sphere('#4a4550', rad * 0.3, rad * 0.3, 0.06, 0, y, 0.37, 12, 8);
    }
  }
  // The neon sign on the back wall, over the jukebox.
  halo(p, 0, 2.75, -hd + 0.3, 3.2, '#ff6fcf');
  // The velvet sofa down the left wall, buttoned, with round arms and cushions, and a low table in front.
  {
    const s = p.at(CLUB_SOFA.x, 0, CLUB_SOFA.z, Math.PI / 2);
    const L = CLUB_SOFA.len;
    s.rbox(VELVET, L, 0.32, 0.8, 0, 0.26, 0, 0.08);
    s.rbox(shade(VELVET, 0.04), L - 0.3, 0.14, 0.62, 0, 0.47, 0.06, 0.05);
    s.rbox(VELVET, L, 0.75, 0.24, 0, 0.75, -0.33, 0.1);
    for (let k = 0; k < 7; k++) for (let row = 0; row < 2; row++) s.sphere(shade(VELVET, -0.14), 0.025, 0.025, 0.02, -L / 2 + 0.4 + k * ((L - 0.8) / 6), 0.72 + row * 0.25, -0.2, 8, 6);
    for (const sx of [-1, 1]) s.cyl(VELVET, 0.2, 0.8, sx * (L / 2 - 0.05), 0.55, 0, 16, Math.PI / 2);
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) s.post(GOLD, 0.03, 0.1, sx * (L / 2 - 0.15), 0, sz * 0.3, 8);
    s.rbox('#ffd25f', 0.45, 0.4, 0.14, -1.3, 0.72, -0.15, 0.06);
    s.rbox('#5fe8ff', 0.42, 0.38, 0.14, 1.4, 0.72, -0.15, 0.06);
  }
  {
    const t = p.at(CLUB_TABLE.x, 0, CLUB_TABLE.z);
    t.cyl('#141016', 0.42, 0.06, 0, 0.42, 0, 24);
    t.torus(GOLD, 0.42, 0.02, 0, 0.45, 0, Math.PI / 2, 0);
    t.post(GOLD, 0.04, 0.4, 0, 0, 0, 10);
    t.cyl(GOLD, 0.2, 0.03, 0, 0.015, 0, 16);
    // Two mocktails with paper umbrellas.
    for (const [x, c] of [
      [-0.15, '#ff7a9a'],
      [0.15, '#7ae0ff'],
    ] as [number, string][]) {
      t.glass.taper(c, 1.3, 0.05, 0.16, x, 0.45, 0.05, 12);
      t.rod('#f6f1e6', 0.005, x, 0.55, 0.05, x + 0.05, 0.72, 0.05, 4);
      t.cone(c === '#ff7a9a' ? '#ffd25f' : '#ff6fcf', 0.07, 0.04, x + 0.05, 0.7, 0.05, 8);
    }
  }
  // The juice bar down the right wall: a gold-topped counter with a neon strip on its front, shelves of bright
  // bottles behind, and chrome stools with red seats.
  {
    const { x, z0, z1, depth, h } = CLUB_BAR;
    const cz = (z0 + z1) / 2;
    const len = z1 - z0;
    p.block('#1a1020', depth, h - 0.06, len, x, 0, cz);
    p.box(GOLD, depth + 0.12, 0.06, len + 0.1, x, h - 0.03, cz);
    for (let k = 0; k < 5; k++) p.box(shade(VELVET, -0.05), 0.03, 0.6, (len - 0.4) / 5 - 0.1, x - depth / 2 - 0.01, 0.5, z0 + 0.2 + (k + 0.5) * ((len - 0.4) / 5));
    for (const y of [1.55, 2.1]) {
      p.box('#5a3a2a', 0.3, 0.05, len, hw - 0.15, y, cz);
      for (let k = 0; k < 9; k++) {
        const c = ['#ff7a9a', '#ffd25f', '#7ae0ff', '#9aff8a', '#c79aff'][(k + Math.round(y * 3)) % 5];
        const bz = z0 + 0.25 + k * ((len - 0.5) / 8);
        p.glass.post(c, 0.05, 0.22 + (k % 3) * 0.04, hw - 0.15, y + 0.025, bz, 8);
        p.post(shade(c, -0.2), 0.02, 0.06, hw - 0.15, y + 0.27 + (k % 3) * 0.04, bz, 6);
      }
    }
    // A juicer and a bowl of oranges on the counter.
    p.cyl('#c8ccd4', 0.1, 0.25, x, h + 0.125, z0 + 0.4, 12);
    p.cyl('#f6f1e6', 0.18, 0.08, x, h + 0.04, z1 - 0.5, 14);
    for (let k = 0; k < 4; k++) p.sphere('#ff9a3a', 0.06, 0.06, 0.06, x + Math.cos(k * 1.6) * 0.08, h + 0.11, z1 - 0.5 + Math.sin(k * 1.6) * 0.08, 10, 8);
    halo(p, x - 0.2, 2.5, cz, 1.3, '#ffd6a0');
  }
  for (const s of CLUB_STOOLS) {
    const q = p.at(s.x, 0, s.z);
    q.cyl('#c8ccd4', 0.2, 0.03, 0, 0.015, 0, 16);
    q.post('#c8ccd4', 0.03, 0.7, 0, 0, 0, 8);
    q.torus('#c8ccd4', 0.14, 0.012, 0, 0.3, 0, Math.PI / 2, 0);
    q.cyl(CARPET, 0.2, 0.08, 0, 0.72, 0, 16);
  }
  // Potted palms in the front corners.
  for (const sx of [-1, 1]) {
    const q = p.at(sx * 6.2, 0, 4.6);
    q.taper(GOLD, 1.2, 0.3, 0.5, 0, 0, 0, 14);
    q.cyl('#3a2a22', 0.3, 0.04, 0, 0.5, 0, 14);
    q.post('#6a4a30', 0.05, 1.2, 0, 0.5, 0, 6);
    for (let k = 0; k < 6; k++) {
      const a = (k / 6) * Math.PI * 2 + r() * 0.3;
      q.leaves.box('#3f8f4f', 0.7, 0.03, 0.18, Math.cos(a) * 0.35, 1.68, Math.sin(a) * 0.35, 0, -a, -0.45);
    }
  }
  // Coat hooks by the door.
  for (let k = 0; k < 3; k++) {
    p.box(GOLD, 0.04, 0.04, 0.16, -hw + 0.1, 1.7, 3.4 + k * 0.35);
  }
  p.box('#e8675a', 0.05, 0.6, 0.3, -hw + 0.13, 1.4, 3.75);
  void glow;
}

/** The room's moving parts. Built once, and moved about only while someone is in the club. */
export function makeClubRoom(): ClubRoom {
  const group = new THREE.Group();
  group.name = 'club-moving';
  // The dance floor: a tile for each square metre, coloured each frame.
  const tileMat = new THREE.MeshBasicMaterial({ color: '#ffffff' });
  const tiles = new THREE.InstancedMesh(new THREE.BoxGeometry(TILE * 0.94, 0.02, TILE * 0.94), tileMat, COLS * ROWS);
  const tmp = new THREE.Object3D();
  for (let i = 0; i < COLS * ROWS; i++) {
    const c = i % COLS;
    const row = Math.floor(i / COLS);
    tmp.position.set(DANCE_FLOOR.x - DANCE_FLOOR.hw + (c + 0.5) * TILE, 0.01, DANCE_FLOOR.z - DANCE_FLOOR.hd + (row + 0.5) * TILE);
    tmp.updateMatrix();
    tiles.setMatrixAt(i, tmp.matrix);
    tiles.setColorAt(i, new THREE.Color('#333'));
  }
  tiles.receiveShadow = false;
  group.add(tiles);
  // The disco ball: little mirror squares round a sphere, on a chain, turning slowly.
  const ball = new THREE.Group();
  ball.position.set(DISCO_BALL.x, DISCO_BALL.y, DISCO_BALL.z);
  {
    const b = new Builder();
    const R = 0.34;
    const rings = 10;
    for (let i = 0; i < rings; i++) {
      const phi = ((i + 0.5) / rings) * Math.PI;
      const n = Math.max(4, Math.round(Math.sin(phi) * 22));
      for (let k = 0; k < n; k++) {
        const th = (k / n) * Math.PI * 2;
        const pos: [number, number, number] = [Math.sin(phi) * Math.cos(th) * R, Math.cos(phi) * R, Math.sin(phi) * Math.sin(th) * R];
        const g = 0.72 + ((i * 7 + k * 3) % 5) * 0.06;
        b.add(G.box(), new THREE.Color(g, g, g * 1.04), { pos, rot: [0, -th, phi - Math.PI / 2], scale: [0.004, 0.085, 0.085 * Math.max(0.5, Math.sin(phi))] });
      }
    }
    b.add(G.sphere(16, 10), '#55555c', { scale: R * 0.97 });
    const mesh = b.mesh(new THREE.MeshPhongMaterial({ vertexColors: true, shininess: 90, specular: '#ffffff', emissive: '#2a2a32' }), { cast: false });
    ball.add(mesh);
    const chain = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 3.6 - DISCO_BALL.y, 6), new THREE.MeshLambertMaterial({ color: '#9aa0a8' }));
    chain.position.y = (3.6 - DISCO_BALL.y) / 2 + R * 0.9;
    group.add(ball);
    const holder = new THREE.Group();
    holder.position.copy(ball.position);
    holder.add(chain);
    group.add(holder);
  }
  // Beams of coloured light from the ball, and the spots they throw on the floor.
  const additive = (color: string, opacity: number) =>
    new THREE.MeshBasicMaterial({ color, transparent: true, opacity, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });
  const beamGeo = new THREE.ConeGeometry(0.28, 1, 10, 1, true);
  beamGeo.translate(0, -0.5, 0);
  const beams: { mesh: THREE.Mesh; mat: THREE.MeshBasicMaterial; phase: number; tilt: number }[] = [];
  for (let k = 0; k < 6; k++) {
    const mat = additive('#ffffff', 0.09);
    const mesh = new THREE.Mesh(beamGeo, mat);
    mesh.renderOrder = 7;
    mesh.position.copy(ball.position);
    group.add(mesh);
    beams.push({ mesh, mat, phase: (k / 6) * Math.PI * 2, tilt: 0.55 + (k % 3) * 0.18 });
  }
  const spotGeo = new THREE.CircleGeometry(0.42, 20);
  spotGeo.rotateX(-Math.PI / 2);
  const spots: { mesh: THREE.Mesh; mat: THREE.MeshBasicMaterial; phase: number; r: number; speed: number }[] = [];
  for (let k = 0; k < 12; k++) {
    const mat = additive('#ffffff', 0.32);
    const mesh = new THREE.Mesh(spotGeo, mat);
    mesh.renderOrder = 6;
    group.add(mesh);
    spots.push({ mesh, mat, phase: (k / 12) * Math.PI * 2, r: 1.2 + (k % 4) * 1.05, speed: 0.35 + (k % 3) * 0.12 });
  }
  // The jukebox's glowing arch and the neon on the walls, which take the song's colours.
  const neonMat = new THREE.MeshBasicMaterial({ color: PINK });
  const neon2Mat = new THREE.MeshBasicMaterial({ color: CYAN });
  {
    const { hw, hd } = ROOMS.club;
    const arch = new THREE.Mesh(new THREE.TorusGeometry(0.56, 0.035, 8, 24, Math.PI), neonMat);
    arch.position.set(JUKEBOX.x, 1.36, JUKEBOX.z + 0.36);
    group.add(arch);
    for (const sx of [-1, 1]) {
      const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.7, 8), neonMat);
      tube.position.set(JUKEBOX.x + sx * 0.56, 1.0, JUKEBOX.z + 0.36);
      group.add(tube);
    }
    const strip = (mat: THREE.Material, w: number, d: number, x: number, z: number, y = 3.05) => {
      const m = new THREE.Mesh(new THREE.BoxGeometry(w, 0.05, d), mat);
      m.position.set(x, y, z);
      group.add(m);
    };
    strip(neonMat, hw * 2 - 0.2, 0.05, 0, -hd + 0.08);
    for (const sx of [-1, 1]) strip(neonMat, 0.05, hd * 2 - 0.3, sx * (hw - 0.08), 0.05);
    strip(neon2Mat, 0.05, CLUB_BAR.z1 - CLUB_BAR.z0 - 0.2, CLUB_BAR.x - CLUB_BAR.depth / 2 - 0.04, (CLUB_BAR.z0 + CLUB_BAR.z1) / 2, 0.85);
  }
  // The neon sign over the jukebox.
  {
    const sign = new TextSign({ w: 768, h: 192, bg: 'rgba(0,0,0,0)', fg: '#ff8ad8', weight: 700, italic: true, size: 130 }, ['The Velvet Horn']);
    const mat = new THREE.MeshBasicMaterial({ map: sign.texture, transparent: true, depthWrite: false });
    const plane = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 0.8), mat);
    plane.position.set(0, 2.72, -ROOMS.club.hd + 0.06);
    group.add(plane);
  }
  // The speakers' cones push out on the beat.
  const coneGeo = new THREE.CircleGeometry(1, 20);
  const coneMat = new THREE.MeshLambertMaterial({ color: '#4a4550' });
  const cones: THREE.Mesh[] = [];
  for (const sp of CLUB_SPEAKERS) {
    for (const [y, rad] of [
      [0.5, 0.2],
      [1.25, 0.13],
    ] as [number, number][]) {
      const c = new THREE.Mesh(coneGeo, coneMat);
      c.position.set(sp.x, y, sp.z + 0.4);
      c.scale.setScalar(rad);
      group.add(c);
      cones.push(c);
    }
  }
  const col = new THREE.Color();
  const dim = new THREE.Color('#1c1424');
  const white = new THREE.Color('#ffffff');
  return {
    group,
    update(t, beat, colors, dancers) {
      const n = colors.length || 1;
      const bar = Math.floor(beat / 4);
      const pulse = Math.pow(1 - (beat - Math.floor(beat)), 2);
      // The floor: a pattern that steps on each beat, brightest on the beat, and lit up under anyone dancing.
      for (let i = 0; i < COLS * ROWS; i++) {
        const c = i % COLS;
        const row = Math.floor(i / COLS);
        const x = DANCE_FLOOR.x - DANCE_FLOOR.hw + (c + 0.5) * TILE;
        const z = DANCE_FLOOR.z - DANCE_FLOOR.hd + (row + 0.5) * TILE;
        const pattern = bar % 2 ? (c + row + Math.floor(beat)) % 3 : (c * 2 + row * 3 + Math.floor(beat)) % 4;
        col.copy(colors[(pattern + bar) % n] ?? white);
        const on = pattern === 0 ? 0.55 + 0.45 * pulse : 0.18 + 0.12 * pulse;
        col.lerp(dim, 1 - on);
        if (dancers.some((d) => Math.abs(d.x - x) < 0.6 && Math.abs(d.z - z) < 0.6)) col.lerp(white, 0.55 + 0.3 * pulse);
        tiles.setColorAt(i, col);
      }
      if (tiles.instanceColor) tiles.instanceColor.needsUpdate = true;
      ball.rotation.y = t * 0.6;
      beams.forEach((b, k) => {
        const a = b.phase + t * 0.6;
        b.mesh.rotation.set(Math.cos(a) * b.tilt, 0, Math.sin(a) * b.tilt);
        b.mesh.scale.set(1, 3.2, 1);
        b.mat.color.copy(colors[k % n] ?? white);
        b.mat.opacity = 0.05 + 0.07 * pulse;
      });
      spots.forEach((s, k) => {
        const a = s.phase + t * s.speed * (k % 2 ? 1 : -1);
        s.mesh.position.set(DISCO_BALL.x + Math.cos(a) * s.r * 1.25, 0.03 + k * 0.001, DISCO_BALL.z + Math.sin(a) * s.r * 0.8);
        s.mat.color.copy(colors[(k + bar) % n] ?? white);
        s.mat.opacity = 0.22 + 0.2 * pulse;
      });
      neonMat.color.copy(colors[bar % n] ?? white).lerp(white, 0.15 * pulse);
      neon2Mat.color.copy(colors[(bar + 1) % n] ?? white);
      cones.forEach((c, k) => c.position.setZ(CLUB_SPEAKERS[0].z + 0.4 + 0.03 * pulse * (k % 2 ? 0.6 : 1)));
    },
  };
}

// ---------------------------------------------------------------- the rope and the bouncer

/** The velvet rope across the door: hooked between its posts, or unhooked and hanging from the left post. */
export function makeRope(): { group: THREE.Group; set(open: number): void } {
  const group = new THREE.Group();
  const mat = new THREE.MeshLambertMaterial({ color: '#a3203a' });
  const hookMat = new THREE.MeshLambertMaterial({ color: GOLD });
  const N = 10;
  const geo = new THREE.CylinderGeometry(0.03, 0.03, 1, 8);
  const pieces = Array.from({ length: N }, () => {
    const m = new THREE.Mesh(geo, mat);
    m.castShadow = true;
    group.add(m);
    return m;
  });
  const hook = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 6), hookMat);
  group.add(hook);
  const a = new THREE.Vector3(-CLUB_ROPE.lx, 0.92, CLUB_ROPE.lz);
  const shut = new THREE.Vector3(CLUB_ROPE.lx, 0.92, CLUB_ROPE.lz);
  // Unhooked, its free end hangs down beside the left post, out of the way.
  const hang = new THREE.Vector3(-CLUB_ROPE.lx - 0.12, 0.12, CLUB_ROPE.lz + 0.1);
  const p0 = new THREE.Vector3();
  const p1 = new THREE.Vector3();
  const end = new THREE.Vector3();
  const up = new THREE.Vector3(0, 1, 0);
  const set = (open: number) => {
    const k = open * open * (3 - 2 * open);
    end.lerpVectors(shut, hang, k);
    // Hooked, it sags in the middle; hanging, it falls nearly straight.
    const sag = 0.28 * (1 - k);
    for (let i = 0; i < N; i++) {
      const pt = (s: number, out: THREE.Vector3) => {
        out.lerpVectors(a, end, s);
        out.y -= Math.sin(s * Math.PI) * sag;
        // On its way down, it swings out a little.
        out.z += Math.sin(s * Math.PI) * 0.2 * Math.sin(k * Math.PI);
        return out;
      };
      pt(i / N, p0);
      pt((i + 1) / N, p1);
      const m = pieces[i];
      m.position.lerpVectors(p0, p1, 0.5);
      const len = p0.distanceTo(p1);
      m.scale.set(1, len + 0.02, 1);
      m.quaternion.setFromUnitVectors(up, p1.clone().sub(p0).normalize());
    }
    hook.position.copy(end);
  };
  set(0);
  return { group, set };
}

export interface Bouncer {
  group: THREE.Group;
  /** Says something, in a speech bubble over his head. */
  say(text: string, ms?: number): void;
  /** Turns his head (and a little of his body) to someone, or back to watching the road (null). */
  lookAt(x: number, z: number): void;
  lookAway(): void;
  /** Nods along, on the beat, when the music's loud enough at the door. */
  update(dt: number, t: number, beat: number | null): void;
  /** His name shows up close, like anyone's. */
  setNear(near: boolean): void;
}

/**
 * Big Moo: a chunky little minotaur in a tight black tee, dark jeans and shades, arms folded, with a gold nose ring, a
 * chain and an earpiece. He breathes, looks up and down the road, flicks his tail and nods along to the music.
 */
export function makeBouncer(): Bouncer {
  const FUR = '#7a4a2e';
  const MUZZLE = '#e3c39a';
  const TEE = '#18161d';
  const JEANS = '#2b3446';
  const HORN = '#efe3c8';
  const root = new THREE.Group();
  root.name = 'bouncer';
  const mat = matte();
  const part = (fill: (b: Builder) => void, smooth = true) => {
    const b = new Builder();
    fill(b);
    const mesh = smooth ? smoothMesh(b, mat) : b.mesh(mat);
    mesh.castShadow = true;
    return mesh;
  };
  // Legs and hooves, his jeans and a belt with a gold buckle.
  root.add(
    part((b) => {
      for (const sx of [-1, 1]) {
        b.add(G.cyl(), JEANS, { pos: [sx * 0.17, 0.3, 0], scale: [0.14, 0.5, 0.15] });
        b.add(G.cyl(), '#2a2220', { pos: [sx * 0.17, 0.05, 0.03], scale: [0.14, 0.1, 0.16] });
        b.add(G.box(), '#121014', { pos: [sx * 0.17, 0.05, 0.16], scale: [0.03, 0.09, 0.06] });
      }
      b.add(G.sphere(), JEANS, { pos: [0, 0.6, 0], scale: [0.36, 0.2, 0.27] });
      b.add(G.cyl(), '#111014', { pos: [0, 0.68, 0], scale: [0.37, 0.07, 0.28] });
      b.add(G.box(), GOLD, { pos: [0, 0.68, 0.28], scale: [0.1, 0.07, 0.02] });
    }),
  );
  // The tail, swinging from behind.
  const tail = new THREE.Group();
  tail.position.set(0, 0.7, -0.24);
  tail.add(
    part((b) => {
      b.add(G.cyl(), FUR, { pos: [0, -0.2, -0.06], rot: [0.35, 0, 0], scale: [0.025, 0.42, 0.025] });
      b.add(G.blob(1, true), '#3a2418', { pos: [0, -0.42, -0.13], scale: [0.07, 0.1, 0.07] });
    }),
  );
  root.add(tail);
  // The body breathes; the arms are folded across it.
  const body = new THREE.Group();
  body.position.y = 0.66;
  root.add(body);
  body.add(
    part((b) => {
      b.add(G.sphere(), TEE, { pos: [0, 0.4, 0], scale: [0.45, 0.46, 0.33] });
      for (const sx of [-1, 1]) b.add(G.sphere(), '#232029', { pos: [sx * 0.15, 0.5, 0.2], scale: [0.18, 0.13, 0.12] });
      // Sleeves, tight round big shoulders, and the fur of the upper arms.
      for (const sx of [-1, 1]) {
        b.add(G.sphere(), TEE, { pos: [sx * 0.43, 0.57, 0], scale: [0.18, 0.16, 0.18] });
        b.add(G.cyl(), FUR, { pos: [sx * 0.48, 0.42, 0.03], rot: [0.25, 0, sx * 0.15], scale: [0.11, 0.26, 0.11] });
      }
      // Forearms crossed in front, fists tucked by the elbows.
      const arm = (ax: number, ay: number, az: number, bx: number, by: number, bz: number) => {
        const d = new THREE.Vector3(bx - ax, by - ay, bz - az);
        const len = d.length();
        const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize());
        const m = new THREE.Matrix4().compose(new THREE.Vector3((ax + bx) / 2, (ay + by) / 2, (az + bz) / 2), q, new THREE.Vector3(0.1, len, 0.1));
        b.add(G.cyl(), FUR, m);
        b.add(G.sphere(), FUR, { pos: [bx, by, bz], scale: 0.1 });
      };
      arm(-0.48, 0.3, 0.12, 0.25, 0.34, 0.36);
      arm(0.48, 0.34, 0.12, -0.25, 0.4, 0.38);
      // A white "SECURITY" band across the back, and a gold chain.
      b.add(G.box(), '#f4efe6', { pos: [0, 0.55, -0.31], rot: [-0.25, 0, 0], scale: [0.4, 0.08, 0.02] });
      b.add(G.torus(0.08, 6, 20), GOLD, { pos: [0, 0.77, 0.08], rot: [Math.PI / 2 - 0.35, 0, 0], scale: [0.19, 0.19, 0.19] });
      // The thick neck.
      b.add(G.cyl(), FUR, { pos: [0, 0.8, 0], scale: [0.19, 0.16, 0.18] });
    }),
  );
  // The head turns; it's a bull's, with horns, a broad muzzle, a nose ring and dark glasses.
  const head = new THREE.Group();
  head.position.set(0, 0.86, 0.02);
  body.add(head);
  head.add(
    part((b) => {
      b.add(G.sphere(), FUR, { pos: [0, 0.18, 0], scale: [0.27, 0.26, 0.27] });
      b.add(G.sphere(), MUZZLE, { pos: [0, 0.07, 0.22], scale: [0.21, 0.15, 0.16] });
      for (const sx of [-1, 1]) b.add(G.sphere(), '#3a2418', { pos: [sx * 0.07, 0.07, 0.37], scale: [0.03, 0.025, 0.02] });
      b.add(G.torus(0.18, 6, 16), GOLD, { pos: [0, 0.0, 0.37], rot: [0.2, 0, 0], scale: [0.05, 0.05, 0.05] });
      // Ears out to the sides, droopy.
      for (const sx of [-1, 1]) b.add(G.sphere(), FUR, { pos: [sx * 0.31, 0.22, -0.02], rot: [0, 0, sx * -0.5], scale: [0.11, 0.05, 0.07] });
      for (const sx of [-1, 1]) b.add(G.sphere(), '#c98a7a', { pos: [sx * 0.31, 0.225, 0.01], rot: [0, 0, sx * -0.5], scale: [0.08, 0.03, 0.04] });
      // A tuft between the horns.
      for (let k = 0; k < 3; k++) b.add(G.blob(k, true), '#4a2c1c', { pos: [(k - 1) * 0.06, 0.42, 0.02], scale: [0.07, 0.06, 0.07] });
      // Shades: two dark lenses with a bridge, and arms back to the ears.
      for (const sx of [-1, 1]) {
        b.add(G.rbox(0.3), '#0e0e14', { pos: [sx * 0.105, 0.24, 0.245], rot: [0, sx * 0.2, 0], scale: [0.14, 0.085, 0.03] });
        b.add(G.box(), '#3b5aa0', { pos: [sx * 0.08 + 0.02, 0.26, 0.262], rot: [0, sx * 0.2, 0], scale: [0.03, 0.02, 0.005] });
        b.add(G.box(), '#0e0e14', { pos: [sx * 0.22, 0.25, 0.12], rot: [0, sx * -1.2, 0], scale: [0.2, 0.015, 0.012] });
      }
      b.add(G.box(), '#0e0e14', { pos: [0, 0.26, 0.26], scale: [0.07, 0.02, 0.015] });
      // An earpiece, with its coiled wire running down into his collar.
      b.add(G.sphere(), '#1a1a1a', { pos: [0.27, 0.15, 0.05], scale: 0.025 });
      b.add(G.cyl(), '#4a4a52', { pos: [0.25, 0.02, 0.02], rot: [0.1, 0, 0.15], scale: [0.006, 0.25, 0.006] });
    }),
  );
  head.add(
    part((b) => {
      // Horns: out, then up and a touch forward, to a point.
      for (const sx of [-1, 1]) {
        const seg = (ax: number, ay: number, az: number, bx: number, by: number, bz: number, r0: number) => {
          const d = new THREE.Vector3(bx - ax, by - ay, bz - az);
          const len = d.length();
          const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize());
          b.add(G.taper(0.78), HORN, new THREE.Matrix4().compose(new THREE.Vector3((ax + bx) / 2, (ay + by) / 2, (az + bz) / 2), q, new THREE.Vector3(r0, len, r0)));
        };
        seg(sx * 0.2, 0.33, 0, sx * 0.4, 0.4, 0.02, 0.055);
        seg(sx * 0.4, 0.4, 0.02, sx * 0.5, 0.56, 0.04, 0.043);
        seg(sx * 0.5, 0.56, 0.04, sx * 0.5, 0.7, 0.07, 0.033);
        b.add(G.cone(), HORN, { pos: [sx * 0.5, 0.75, 0.08], rot: [0.3, 0, 0], scale: [0.026, 0.08, 0.026] });
      }
    }),
  );
  // His name, and what he says, over his head.
  const el = document.createElement('div');
  el.className = 'tag npc-tag';
  const bubble = document.createElement('div');
  bubble.className = 'tag-bubble';
  const plate = document.createElement('div');
  plate.className = 'tag-plate';
  const name = document.createElement('span');
  name.className = 'tag-name';
  name.textContent = 'Big Moo · bouncer';
  plate.append(name);
  el.append(bubble, plate);
  const label = new CSS2DObject(el);
  label.center.set(0.5, 1);
  label.position.set(0, 2.45, 0);
  root.add(label);
  let bubbleTimer: ReturnType<typeof setTimeout> | null = null;
  let want: { x: number; z: number } | null = null;
  let yaw = 0;
  const v = new THREE.Vector3();
  return {
    group: root,
    say(text, ms = 3200) {
      bubble.textContent = text;
      bubble.classList.remove('on');
      void bubble.offsetWidth;
      bubble.classList.add('on');
      if (bubbleTimer) clearTimeout(bubbleTimer);
      bubbleTimer = setTimeout(() => bubble.classList.remove('on'), ms);
    },
    lookAt(x, z) {
      want = { x, z };
    },
    lookAway() {
      want = null;
    },
    setNear(near) {
      plate.style.display = near ? '' : 'none';
    },
    update(dt, t, beat) {
      // Breathing, a flick of the tail, and a slow look up and down the road when nobody is talking to him.
      body.scale.set(1 + Math.sin(t * 1.7) * 0.012, 1 + Math.sin(t * 1.7) * 0.02, 1 + Math.sin(t * 1.7) * 0.015);
      tail.rotation.z = Math.sin(t * 2.3) * 0.35 + Math.sin(t * 5.1) * 0.08;
      let target = Math.sin(t * 0.35) * 0.6 + Math.sin(t * 0.13) * 0.3;
      if (want) {
        root.updateMatrixWorld();
        v.set(want.x, 0, want.z);
        root.worldToLocal(v);
        target = Math.max(-1.2, Math.min(1.2, Math.atan2(v.x, v.z)));
      }
      yaw += (target - yaw) * Math.min(1, dt * 4);
      head.rotation.y = yaw * 0.8;
      body.rotation.y = yaw * 0.2;
      // On the beat, a little nod.
      head.rotation.x = beat === null ? 0 : Math.exp(-(beat - Math.floor(beat)) * 7) * 0.12;
    },
  };
}
