import * as THREE from 'three';
import { Builder, matte, rng } from '../build';
import type { ZoneKind } from '../types';
import { Paint, pick, shade } from './kit';
import {
  BAR,
  BAR_STOOLS,
  BED,
  HOME_CHAIRS,
  HOME_TABLE,
  OVEN,
  PEW_LEN,
  PEW_ROWS,
  PEW_X,
  ROOMS,
  SHELF,
  TAVERN_TABLES,
  tableChairs,
} from './layout';
import { IRON, WOOD, WOOD_DARK, WOOD_LIGHT, barrel, crate } from './props';
import { TextSign } from './sign';

export type Room = Exclude<ZoneKind, 'town'>;

export interface PointSpec {
  pos: [number, number, number];
  color: string;
  intensity: number;
  distance: number;
  flicker?: boolean;
}

export interface RoomLight {
  lights: PointSpec[];
  /** Warm or cool fill for the room. */
  hemi: { sky: string; ground: string; intensity: number };
  sun: { color: string; intensity: number; dir: [number, number, number] };
}

export interface Interior extends RoomLight {
  group: THREE.Group;
  /** The same room with the fire out and moonlight through the window, for bedrooms at night. */
  night?: RoomLight;
}

export interface Interiors {
  rooms: Record<Room, Interior>;
  /** Glass that shows the sky outside: bright by day, dark at night. */
  glassMaterial: THREE.MeshBasicMaterial;
  ownerSign: TextSign;
}

const WALL_H = 3.3;

interface Shell {
  floor: string[];
  wall: string;
  wainscot: string;
  trim: string;
  tiles?: boolean;
}

function shell(p: Paint, room: Room, s: Shell, r: () => number) {
  const { hw, hd } = ROOMS[room];
  // Floor: planks or tiles.
  if (s.tiles) {
    const n = 1.0;
    for (let x = -hw; x < hw - 0.01; x += n) for (let z = -hd; z < hd - 0.01; z += n) {
      const k = (Math.round(x / n) + Math.round(z / n)) & 1;
      p.box(shade(s.floor[k % s.floor.length], (r() - 0.5) * 0.03), n - 0.03, 0.1, n - 0.03, x + n / 2, -0.05, z + n / 2);
    }
    p.box('#3a3029', hw * 2, 0.1, hd * 2, 0, -0.07, 0);
  } else {
    const w = 0.5;
    for (let x = -hw; x < hw - 0.01; x += w) {
      // Planks in staggered lengths.
      let z = -hd;
      while (z < hd - 0.01) {
        const len = Math.min(hd - z, 1.6 + r() * 2.2);
        p.box(shade(pick(r, s.floor), (r() - 0.5) * 0.04), w - 0.03, 0.1, len - 0.03, x + w / 2, -0.05, z + len / 2);
        z += len;
      }
    }
    p.box('#2a201a', hw * 2, 0.1, hd * 2, 0, -0.07, 0);
  }
  // A thick dark edge under the floor, so the room reads as a cut-away box.
  p.box('#1d1612', hw * 2 + 0.6, 0.6, hd * 2 + 0.3, 0, -0.42, 0.15);
  // Back wall and side walls.
  p.box(s.wall, hw * 2 + 0.6, WALL_H, 0.3, 0, WALL_H / 2, -hd - 0.15);
  for (const sx of [-1, 1]) p.box(shade(s.wall, -0.04), 0.3, WALL_H, hd * 2 + 0.3, sx * (hw + 0.15), WALL_H / 2, 0.15);
  p.box(s.wainscot, hw * 2, 1.0, 0.06, 0, 0.5, -hd + 0.03);
  for (const sx of [-1, 1]) p.box(shade(s.wainscot, -0.04), 0.06, 1.0, hd * 2, sx * (hw - 0.03), 0.5, 0);
  // Panelling: battens over the wainscot, a skirting board, and a picture rail higher up.
  for (let x = -hw + 0.5; x < hw - 0.2; x += 0.5) p.box(shade(s.wainscot, -0.08), 0.05, 0.9, 0.03, x, 0.5, -hd + 0.075);
  for (const sx of [-1, 1]) for (let z = -hd + 0.5; z < hd - 0.2; z += 0.5) p.box(shade(s.wainscot, -0.1), 0.03, 0.9, 0.05, sx * (hw - 0.075), 0.5, z);
  p.box(s.trim, hw * 2, 0.08, 0.1, 0, 1.02, -hd + 0.05);
  for (const sx of [-1, 1]) p.box(s.trim, 0.1, 0.08, hd * 2, sx * (hw - 0.05), 1.02, 0);
  p.box(shade(s.trim, -0.05), hw * 2, 0.14, 0.06, 0, 0.07, -hd + 0.03);
  for (const sx of [-1, 1]) p.box(shade(s.trim, -0.08), 0.06, 0.14, hd * 2, sx * (hw - 0.03), 0.07, 0);
  p.box(shade(s.trim, 0.05), hw * 2, 0.05, 0.06, 0, WALL_H - 0.75, -hd + 0.03);
  for (const sx of [-1, 1]) p.box(shade(s.trim, 0.02), 0.06, 0.05, hd * 2, sx * (hw - 0.03), WALL_H - 0.75, 0);
  // The wall plate, with corbels and the ends of ceiling joists showing along it.
  p.box(s.trim, hw * 2 + 0.6, 0.16, 0.36, 0, WALL_H + 0.05, -hd - 0.15);
  for (const sx of [-1, 1]) p.box(s.trim, 0.36, 0.16, hd * 2 + 0.3, sx * (hw + 0.15), WALL_H + 0.05, 0.15);
  for (let x = -hw + 0.6; x < hw - 0.3; x += 1.2) p.box(shade(s.trim, -0.1), 0.18, 0.22, 0.3, x, WALL_H - 0.14, -hd + 0.15);
  for (const sx of [-1, 1]) for (let z = -hd + 0.6; z < hd - 0.3; z += 1.2) p.box(shade(s.trim, -0.12), 0.3, 0.22, 0.18, sx * (hw - 0.15), WALL_H - 0.14, z);
  // The way out, on the camera side: a door frame and a mat.
  p.box(s.trim, 0.18, 2.5, 0.25, -0.75, 1.25, hd + 0.05);
  p.box(s.trim, 0.18, 2.5, 0.25, 0.75, 1.25, hd + 0.05);
  p.box(s.trim, 1.7, 0.2, 0.25, 0, 2.55, hd + 0.05);
  p.box('#b85f4a', 1.3, 0.03, 0.8, 0, 0.015, hd - 0.55);
  p.box('#e8c890', 1.0, 0.035, 0.5, 0, 0.02, hd - 0.55);
  for (const sx of [-1, 1]) p.box(shade(s.wall, -0.08), hw - 0.85, 0.35, 0.2, sx * ((hw + 0.85) / 2), 0.175, hd + 0.05);
}

function backWindow(p: Paint, x: number, y: number, z: number, w: number, h: number, trim: string) {
  p.box(trim, w + 0.2, h + 0.2, 0.08, x, y, z + 0.02);
  p.glass.box('#ffffff', w, h, 0.06, x, y, z + 0.06);
  p.box(trim, 0.06, h, 0.05, x, y, z + 0.1);
  p.box(trim, w, 0.06, 0.05, x, y, z + 0.1);
  p.box(shade(trim, 0.08), w + 0.35, 0.08, 0.22, x, y - h / 2 - 0.08, z + 0.1);
}

function fireplace(p: Paint, glow: Builder, stone: string) {
  // Faces +z. Origin at the floor in front of the wall.
  p.block(stone, 1.9, 1.5, 0.8, 0, 0, 0);
  // Stone blocks laid in courses either side of the opening.
  for (let c = 0; c < 5; c++) for (const sx of [-1, 1]) {
    const w = c % 2 ? 0.38 : 0.3;
    p.block(shade(stone, ((c * 3 + sx) % 3) * 0.04 - 0.04), w, 0.26, 0.06, sx * (0.95 - w / 2 - (c % 2 ? 0.02 : 0.08)), 0.02 + c * 0.29, 0.4);
  }
  for (let k = -0.6; k <= 0.6; k += 0.3) p.block(shade(stone, (k * 2) % 2 ? 0.03 : -0.03), 0.26, 0.26, 0.06, k, 1.18, 0.4);
  p.block('#2a1f1a', 1.0, 0.85, 0.3, 0, 0.12, 0.3);
  p.block('#3a2a22', 1.0, 0.04, 0.5, 0, 0.1, 0.4);
  p.block(shade(stone, -0.1), 2.2, 0.16, 0.95, 0, 1.5, 0.05);
  p.block(shade(stone, -0.14), 2.3, 0.06, 1.0, 0, 1.66, 0.05);
  p.block(stone, 1.2, 1.6, 0.6, 0, 1.66, -0.1);
  // Andirons, logs on them, a kettle on a crane, and a basket of logs beside.
  for (const sx of [-1, 1]) {
    p.box(IRON, 0.04, 0.3, 0.04, sx * 0.3, 0.27, 0.62);
    p.ico(IRON, 0.05, sx * 0.3, 0.44, 0.62, 1);
    p.box(IRON, 0.04, 0.04, 0.4, sx * 0.3, 0.14, 0.45);
  }
  for (const x of [-0.25, 0.1]) p.cyl(WOOD_DARK, 0.09, 0.7, x, 0.2, 0.45, 10, 0, 0.4, Math.PI / 2);
  p.cyl(shade(WOOD_DARK, -0.1), 0.08, 0.6, -0.05, 0.36, 0.5, 10, 0, 1.2, Math.PI / 2);
  p.box(IRON, 0.04, 0.9, 0.04, 0.42, 0.57, 0.35);
  p.box(IRON, 0.5, 0.04, 0.04, 0.2, 1.0, 0.35);
  p.rod(IRON, 0.01, 0.0, 0.98, 0.35, 0.0, 0.82, 0.35, 4);
  p.sphere(IRON, 0.14, 0.11, 0.14, 0.0, 0.7, 0.38);
  p.cyl(IRON, 0.06, 0.04, 0.0, 0.82, 0.38, 10);
  p.torus(IRON, 0.1, 0.012, 0.0, 0.84, 0.38, 0, 0);
  p.rod(IRON, 0.015, 0.13, 0.74, 0.38, 0.24, 0.8, 0.38, 4);
  const lb = p.at(1.3, 0, 0.5);
  lb.taper('#c9a46a', 1.15, 0.28, 0.32, 0, 0, 0, 12);
  lb.torus('#a8834f', 0.3, 0.015, 0, 0.32, 0, Math.PI / 2);
  for (let k = 0; k < 4; k++) lb.cyl(shade(WOOD_DARK, k * 0.04), 0.06, 0.5, (k - 1.5) * 0.11, 0.35, 0, 8, 0.3, 0, 0.1);
  // Something on the mantel: a jug and a little frame.
  p.taper('#5f8fbf', 0.8, 0.08, 0.2, -0.7, 1.66, 0.1, 10);
  p.cyl('#5f8fbf', 0.07, 0.03, -0.7, 1.87, 0.1, 10);
  p.box('#c9a24f', 0.2, 0.16, 0.02, 0.6, 1.76, 0.05, -0.15);
  p.box('#8fc1e8', 0.15, 0.11, 0.015, 0.6, 1.76, 0.065, -0.15);
  // The flames go through the fireplace's own frame, so they sit in the grate and not in the middle of the room.
  glow.add(new THREE.ConeGeometry(0.22, 0.5, 5), '#ffb347', { pos: [-0.1, 0.48, 0.45] }, p.m);
  glow.add(new THREE.ConeGeometry(0.16, 0.38, 5), '#ffd76b', { pos: [0.15, 0.42, 0.5] }, p.m);
  glow.add(new THREE.ConeGeometry(0.1, 0.28, 4), '#fff1b0', { pos: [0, 0.38, 0.55] }, p.m);
  p.box('#b85f4a', 1.5, 0.03, 0.8, 0, 0.015, 1.0);
}

function candle(p: Paint, glow: Builder, x: number, y: number, z: number, h = 0.25) {
  // A brass dish with a thumb ring, the candle, a run of wax, and the flame.
  p.cyl('#c9a24f', 0.07, 0.015, x, y + 0.008, z, 12);
  p.cyl('#c9a24f', 0.045, 0.02, x, y + 0.025, z, 12);
  p.torus('#c9a24f', 0.03, 0.008, x + 0.075, y + 0.015, z, Math.PI / 2);
  p.post('#f6efe0', 0.035, h, x, y + 0.02, z, 10);
  p.sphere('#f6efe0', 0.015, 0.035, 0.015, x + 0.03, y + h - 0.02, z);
  p.post('#2a1f1a', 0.005, 0.03, x, y + h + 0.02, z, 4);
  glow.add(new THREE.ConeGeometry(0.035, 0.1, 6), '#ffd76b', { pos: [x, y + h + 0.08, z] }, p.m);
}

function hangingLamp(p: Paint, glow: Builder, x: number, y: number, z: number) {
  // A chain of links down to an iron shade, with a glass bowl under it.
  for (let k = 0; k < 6; k++) p.torus(IRON, 0.035, 0.008, x, y + 0.3 + k * 0.1, z, 0, k % 2 ? Math.PI / 2 : 0);
  p.cyl(IRON, 0.02, 0.2, x, y + 0.9, z, 6);
  p.cone(IRON, 0.3, 0.18, x, y + 0.12, z, 14);
  p.torus(IRON, 0.29, 0.012, x, y + 0.13, z, Math.PI / 2);
  p.glass.cyl('#fff1c8', 0.14, 0.06, x, y + 0.1, z, 10);
  glow.add(new THREE.IcosahedronGeometry(0.14, 1), '#ffe2a0', { pos: [x, y + 0.05, z] }, p.m);
}

function chair(p: Paint, color: string, cushion: string | null = null) {
  // Faces +z (someone sitting looks along +z); the back is at -z.
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    p.cyl(shade(color, -0.1), 0.03, 0.45, sx * 0.2, 0.225, sz * 0.2, 8);
    p.cyl(shade(color, -0.04), 0.04, 0.06, sx * 0.2, 0.12, sz * 0.2, 8);
  }
  for (const sx of [-1, 1]) p.box(shade(color, -0.12), 0.02, 0.02, 0.4, sx * 0.2, 0.2, 0);
  p.block(color, 0.5, 0.06, 0.5, 0, 0.43, 0);
  if (cushion) p.box(cushion, 0.42, 0.05, 0.42, 0, 0.515, 0.02);
  // The back: two uprights and three slats.
  for (const sx of [-1, 1]) p.block(shade(color, -0.06), 0.05, 0.6, 0.05, sx * 0.21, 0.49, -0.22);
  for (let k = 0; k < 3; k++) p.box(color, 0.4, 0.07, 0.03, 0, 0.62 + k * 0.17, -0.22);
}

// ---------------------------------------------------------------- the tavern

function tavern(p: Paint, glow: Builder, r: () => number) {
  const { hw, hd } = ROOMS.tavern;
  shell(p, 'tavern', { floor: ['#7a5236', '#6e4a30', '#83593b'], wall: '#ead9bb', wainscot: '#6e4a30', trim: '#4f3423' }, r);
  // Timber beams on the walls.
  for (const x of [-5.5, -1.8, 1.8, 5.5]) p.box('#4f3423', 0.22, WALL_H - 1.0, 0.1, x, 1.0 + (WALL_H - 1.0) / 2, -hd + 0.06);
  for (const sx of [-1, 1]) for (const z of [-2, 2]) p.box('#4f3423', 0.1, WALL_H - 1.0, 0.22, sx * (hw - 0.06), 1.0 + (WALL_H - 1.0) / 2, z);
  backWindow(p, -6.6, 2.1, -hd, 0.9, 0.9, '#4f3423');
  backWindow(p, 4.6, 2.1, -hd, 0.9, 0.9, '#4f3423');
  // The bar.
  const len = BAR.x1 - BAR.x0;
  const cx = (BAR.x0 + BAR.x1) / 2;
  p.block('#5e3d27', len, BAR.h - 0.08, BAR.depth, cx, 0, BAR.z);
  for (let x = BAR.x0 + 0.5; x < BAR.x1; x += 1.0) p.box('#6e4a30', 0.8, 0.7, 0.04, x, 0.5, BAR.z + BAR.depth / 2 + 0.02);
  p.block('#a87a4f', len + 0.2, 0.09, BAR.depth + 0.25, cx, BAR.h - 0.08, BAR.z + 0.05);
  p.cyl('#d8a845', 0.04, len, cx, 0.2, BAR.z + BAR.depth / 2 + 0.25, 6, 0, 0, Math.PI / 2);
  // Taps.
  for (const x of [-4.6, -2.2, 0.2]) {
    p.post('#d8a845', 0.05, 0.35, x, BAR.h, BAR.z - 0.25, 6);
    p.box('#2a1f1a', 0.06, 0.18, 0.06, x, BAR.h + 0.42, BAR.z - 0.2);
  }
  // Shelves of bottles and kegs behind it.
  for (const y of [1.5, 2.2]) {
    p.box(WOOD, 7.0, 0.07, 0.35, -2.0, y, -hd + 0.2);
    for (let k = 0; k < 11; k++) {
      const c = pick(r, ['#3f7a4f', '#7a3f3f', '#c9a24f', '#4f5f8a', '#e8dcc0']);
      p.post(c, 0.07, 0.3, -5.2 + k * 0.62, y + 0.04, -hd + 0.2, 6);
      p.post(c, 0.03, 0.1, -5.2 + k * 0.62, y + 0.34, -hd + 0.2, 4);
    }
  }
  for (const x of [-5.3, -3.9, 1.6]) {
    p.box(WOOD_DARK, 1.0, 0.25, 0.9, x, 0.12, -hd + 0.5);
    barrel(p.at(x, 0.25, -hd + 0.5, Math.PI / 2), r, true);
  }
  // Stools along the bar.
  for (const s of BAR_STOOLS) {
    p.post(WOOD_DARK, 0.05, 0.72, s.x, 0, s.z, 6);
    p.cyl('#a8463f', 0.26, 0.08, s.x, 0.75, s.z, 10);
    p.cyl(IRON, 0.18, 0.03, s.x, 0.3, s.z, 8);
  }
  // Tables with chairs around them.
  for (const t of TAVERN_TABLES) {
    p.post(WOOD_DARK, 0.12, 0.75, t.x, 0, t.z, 6);
    p.cyl(WOOD_LIGHT, 0.85, 0.08, t.x, 0.78, t.z, 12);
    p.cyl(WOOD_DARK, 0.4, 0.05, t.x, 0.03, t.z, 8);
    candle(p, glow, t.x, 0.82, t.z, 0.18);
    for (const c of tableChairs(t)) chair(p.at(c.x, 0, c.z, c.ry), '#8a5a36');
  }
  // Fireplace on the left wall, and a rug.
  fireplace(p.at(-hw + 0.4, 0, 0.4, Math.PI / 2), glow, '#9a8f84');
  p.box('#a8463f', 3.4, 0.03, 2.2, -0.8, 0.015, 2.5);
  p.box('#d8a845', 3.0, 0.035, 1.8, -0.8, 0.02, 2.5);
  p.box('#a8463f', 2.6, 0.04, 1.4, -0.8, 0.025, 2.5);
  // Barrels and crates on the right, a dartboard and a painting.
  barrel(p.at(6.6, 0, -4.2), r);
  barrel(p.at(7.3, 0, -5.0), r);
  barrel(p.at(6.9, 0.95, -4.6), r);
  crate(p.at(6.6, 0, 3.4), r, 0.8);
  crate(p.at(7.3, 0, 3.9), r, 0.6);
  const right = p.at(hw - 0.02, 0, -0.5, -Math.PI / 2);
  right.cyl('#2a1f1a', 0.42, 0.05, 0, 1.9, 0.03, 16, Math.PI / 2);
  right.cyl('#e8dcc0', 0.36, 0.06, 0, 1.9, 0.04, 16, Math.PI / 2);
  right.cyl('#a8463f', 0.24, 0.07, 0, 1.9, 0.05, 16, Math.PI / 2);
  right.cyl('#3f7a4f', 0.12, 0.08, 0, 1.9, 0.06, 12, Math.PI / 2);
  p.box('#c9a24f', 1.5, 1.0, 0.06, 0, 2.3, -hd + 0.05);
  p.box('#5a7a9a', 1.3, 0.8, 0.07, 0, 2.3, -hd + 0.07);
  p.ico('#2a2530', 0.18, 0.1, 2.3, -hd + 0.12, 0, 0.8);
  hangingLamp(p, glow, -1.8, 2.4, -2.0);
  hangingLamp(p, glow, -4.6, 2.4, 2.6);
  hangingLamp(p, glow, 3.0, 2.4, 2.4);
}

// ---------------------------------------------------------------- the bakery

function bakery(p: Paint, glow: Builder, r: () => number) {
  const { hd } = ROOMS.bakery;
  shell(p, 'bakery', { floor: ['#f1e2c8', '#c97a5a'], wall: '#f7e6cc', wainscot: '#e3a77f', trim: '#8a5a3a', tiles: true }, r);
  backWindow(p, -0.6, 2.0, -hd, 1.0, 1.0, '#8a5a3a');
  // The brick oven.
  const o = p.at(OVEN.x, 0, OVEN.z);
  o.block('#b5603f', 2.8, 1.0, 2.2, 0, 0, 0);
  for (let k = 0; k < 6; k++) o.box('#a3523a', 2.82, 0.04, 2.22, 0, 0.15 + k * 0.16, 0);
  o.sphere('#c06a48', 1.35, 1.05, 1.05, 0, 1.0, -0.05, 10, 6);
  o.post('#7a3a2a', 0.25, 1.8, 0.5, 1.6, -0.5, 6);
  o.box('#2a1a14', 1.1, 0.7, 0.2, 0, 0.75, 1.02);
  o.cyl('#2a1a14', 0.55, 0.2, 0, 1.1, 1.02, 10, Math.PI / 2);
  glow.add(new THREE.ConeGeometry(0.2, 0.4, 5), '#ffb347', { pos: [OVEN.x - 0.15, 0.62, OVEN.z + 1.0] });
  glow.add(new THREE.ConeGeometry(0.16, 0.32, 5), '#ffd76b', { pos: [OVEN.x + 0.2, 0.58, OVEN.z + 1.02] });
  glow.add(new THREE.BoxGeometry(0.9, 0.1, 0.1), '#ff8a3d', { pos: [OVEN.x, 0.46, OVEN.z + 1.05] });
  o.box('#e3a77f', 3.0, 0.12, 0.3, 0, 1.05, 1.2);
  // A baker's peel leaning on the oven.
  p.box(WOOD_LIGHT, 0.06, 1.6, 0.06, OVEN.x + 1.75, 0.8, OVEN.z + 0.9, 0.15, 0, -0.2);
  p.box(WOOD_LIGHT, 0.4, 0.4, 0.04, OVEN.x + 1.6, 0.25, OVEN.z + 0.95, 0.15, 0, -0.2);
  // Shelves for the day's bakes.
  const len = SHELF.x1 - SHELF.x0;
  const scx = (SHELF.x0 + SHELF.x1) / 2;
  for (const y of SHELF.ys) p.box(WOOD, len, 0.07, 0.6, scx, y, SHELF.z);
  for (const x of [SHELF.x0, scx, SHELF.x1]) p.block(WOOD_DARK, 0.08, 2.1, 0.6, x, 0, SHELF.z);
  p.box(WOOD, len + 0.1, 0.07, 0.6, scx, 2.1, SHELF.z);
  for (let k = 0; k < 4; k++) p.taper('#c9a46a', 1.25, 0.2, 0.18, SHELF.x0 + 0.5 + k * 1.1, 2.14, SHELF.z, 8);
  // The shop counter, with a cake and a till.
  p.block('#e3a77f', 3.4, 0.95, 0.9, 3.2, 0, 1.1);
  p.block('#fff3e0', 3.5, 0.06, 1.0, 3.2, 0.95, 1.1);
  p.post('#d8d0c0', 0.25, 0.2, 2.2, 1.0, 1.1, 8);
  p.cyl('#f2a7b8', 0.3, 0.3, 2.2, 1.35, 1.1, 10);
  p.cyl('#fff3e0', 0.31, 0.06, 2.2, 1.5, 1.1, 10);
  for (let k = 0; k < 6; k++) {
    const a = (k / 6) * Math.PI * 2;
    p.ico('#e4553f', 0.045, 2.2 + Math.cos(a) * 0.2, 1.56, 1.1 + Math.sin(a) * 0.2, 0);
  }
  p.block('#7a5a3a', 0.6, 0.35, 0.45, 4.2, 1.0, 1.1);
  p.block('#d8a845', 0.5, 0.15, 0.3, 4.2, 1.35, 1.0);
  // The work table, with dough and a rolling pin.
  p.block(WOOD_LIGHT, 2.2, 0.85, 1.3, -3.3, 0, 1.3);
  p.box('#f6efe0', 1.6, 0.02, 0.9, -3.3, 0.86, 1.3);
  p.sphere('#f3dcb0', 0.3, 0.16, 0.25, -3.6, 0.92, 1.3);
  p.cyl(WOOD_LIGHT, 0.06, 0.8, -2.8, 0.92, 1.3, 6, 0, 0.3, Math.PI / 2);
  // Flour sacks.
  for (const [x, z] of [
    [-5.2, 2.6],
    [-5.1, 3.4],
  ]) {
    p.sphere('#efe4cc', 0.42, 0.5, 0.38, x, 0.48, z, 8, 6);
    p.box('#c9a46a', 0.3, 0.08, 0.3, x, 0.95, z);
  }
  p.sphere('#efe4cc', 0.38, 0.45, 0.35, -5.25, 1.2, 3.0, 8, 6);
  hangingLamp(p, glow, 2.5, 2.4, -1.2);
  hangingLamp(p, glow, -1.0, 2.4, 1.5);
}

// ---------------------------------------------------------------- the church

function church(p: Paint, glow: Builder, r: () => number) {
  const { hw, hd } = ROOMS.church;
  shell(p, 'church', { floor: ['#cfc6b8', '#bdb3a4'], wall: '#e3dccf', wainscot: '#b8ae9e', trim: '#8f8070', tiles: true }, r);
  // The aisle carpet.
  p.box('#8a2f3a', 1.5, 0.03, hd * 2 - 1.4, 0, 0.015, 0.4);
  p.box('#c9a24f', 1.2, 0.035, hd * 2 - 1.6, 0, 0.02, 0.4);
  p.box('#8a2f3a', 1.05, 0.04, hd * 2 - 1.6, 0, 0.025, 0.4);
  // Pillars and tall stained-glass windows.
  const stained = ['#4f6fb8', '#b84f5a', '#e0b84f', '#5aa06a', '#8a5ab8'];
  for (const sx of [-1, 1]) {
    for (const z of [-6.5, -2.5, 1.5, 5.5]) p.block('#cfc6b8', 0.45, WALL_H, 0.45, sx * (hw - 0.22), 0, z);
    [-4.5, -0.5, 3.5].forEach((z, i) => {
      const w = p.at(sx * (hw - 0.01), 0, z, -sx * (Math.PI / 2));
      w.box('#8f8070', 1.0, 2.1, 0.08, 0, 2.0, 0.02);
      for (let k = 0; k < 6; k++) w.glass.box(stained[(i * 2 + k + (sx > 0 ? 1 : 0)) % stained.length], 0.38, 0.62, 0.06, (k % 2 ? 0.2 : -0.2), 1.35 + Math.floor(k / 2) * 0.66, 0.06);
      w.glass.cyl(stained[(i + 3) % stained.length], 0.4, 0.06, 0, 3.05, 0.06, 8, Math.PI / 2);
    });
  }
  // The rose window above the altar.
  const back = p.at(0, 2.45, -hd + 0.02);
  back.cyl('#8f8070', 0.95, 0.06, 0, 0, 0.02, 16, Math.PI / 2);
  for (let k = 0; k < 8; k++) {
    const a = (k / 8) * Math.PI * 2;
    back.glass.box(stained[k % stained.length], 0.36, 0.36, 0.05, Math.cos(a) * 0.55, Math.sin(a) * 0.55, 0.06, 0, 0, a);
  }
  back.glass.cyl('#e0b84f', 0.3, 0.07, 0, 0, 0.07, 10, Math.PI / 2);
  // The altar, candles and organ pipes.
  p.block('#bdb3a4', 2.6, 0.2, 1.4, 0, 0, -hd + 1.2);
  p.block('#d9d0c0', 2.4, 0.95, 1.0, 0, 0.2, -hd + 1.2);
  p.block('#f6f1e6', 2.5, 0.06, 1.05, 0, 1.15, -hd + 1.2);
  p.box('#8a2f3a', 0.8, 0.8, 0.02, 0, 0.75, -hd + 1.72);
  p.box('#c9a24f', 0.12, 0.5, 0.03, 0, 0.8, -hd + 1.74);
  p.box('#c9a24f', 0.36, 0.1, 0.03, 0, 0.9, -hd + 1.74);
  p.box('#7a3f3f', 0.5, 0.08, 0.36, 0.5, 1.22, -hd + 1.2);
  for (const x of [-0.9, -0.6]) candle(p, glow, x, 1.21, -hd + 1.2, 0.3);
  for (const sx of [-1, 1]) {
    p.post('#c9a24f', 0.04, 1.3, sx * 2.2, 0, -hd + 1.6, 6);
    p.cyl('#c9a24f', 0.2, 0.05, sx * 2.2, 0.03, -hd + 1.6, 8);
    candle(p, glow, sx * 2.2, 1.3, -hd + 1.6, 0.3);
  }
  for (let k = 0; k < 7; k++) p.post('#c9a24f', 0.1, 1.6 + Math.sin((k / 6) * Math.PI) * 1.1, -4.6 + k * 0.24, 0.2, -hd + 0.25, 8);
  p.block(WOOD_DARK, 2.0, 0.2, 0.5, -3.9, 0, -hd + 0.3);
  // Pews, in two columns, facing the altar.
  for (const z of PEW_ROWS) {
    for (const sx of [-1, 1]) {
      const q = p.at(sx * PEW_X, 0, z);
      q.box('#7a5236', PEW_LEN, 0.08, 0.5, 0, 0.44, 0);
      q.box('#7a5236', PEW_LEN, 0.55, 0.08, 0, 0.75, 0.27);
      q.box('#6a4630', PEW_LEN + 0.06, 0.06, 0.12, 0, 1.04, 0.27);
      for (const ex of [-1, 1]) q.block('#6a4630', 0.08, 0.95, 0.6, ex * (PEW_LEN / 2), 0, 0.03);
      q.box('#a8463f', PEW_LEN - 0.2, 0.04, 0.42, 0, 0.5, 0);
    }
  }
  // Hanging candle wheels.
  for (const z of [-3.5, 2.5]) {
    p.torus(IRON, 0.6, 0.03, 0, 2.7, z, Math.PI / 2);
    p.cyl(IRON, 0.01, 0.6, 0, 3.0, z, 3);
    for (let k = 0; k < 6; k++) {
      const a = (k / 6) * Math.PI * 2;
      candle(p, glow, Math.cos(a) * 0.6, 2.72, z + Math.sin(a) * 0.6, 0.12);
    }
  }
}

// ---------------------------------------------------------------- home

function home(p: Paint, glow: Builder, r: () => number, sign: TextSign): THREE.Object3D {
  const { hw, hd } = ROOMS.house;
  shell(p, 'house', { floor: ['#b07a4f', '#a4704a', '#ba845a'], wall: '#f4e4cf', wainscot: '#c9a27a', trim: '#7a5236' }, r);
  // Wallpaper stripes.
  for (let x = -hw + 0.3; x < hw; x += 0.6) p.box('#efd9bf', 0.22, WALL_H - 1.1, 0.02, x, 1.1 + (WALL_H - 1.1) / 2, -hd + 0.02);
  backWindow(p, 0.5, 2.0, -hd, 1.1, 1.0, '#7a5236');
  for (const sx of [-1, 1]) p.box('#d8687a', 0.35, 1.3, 0.06, 0.5 + sx * 0.78, 2.05, -hd + 0.12);
  p.box(WOOD_DARK, 2.0, 0.05, 0.05, 0.5, 2.72, -hd + 0.12);
  // The bed.
  const b = p.at(BED.x, 0, BED.z);
  b.block(WOOD, BED.w, 0.3, BED.d, 0, 0.05, 0);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) b.block(WOOD_DARK, 0.1, 0.35, 0.1, sx * (BED.w / 2 - 0.05), 0, sz * (BED.d / 2 - 0.05));
  b.block(WOOD_DARK, BED.w + 0.1, 1.25, 0.12, 0, 0, -BED.d / 2);
  b.cyl(WOOD_DARK, BED.w / 2 + 0.05, 0.12, 0, 1.25, -BED.d / 2, 10, Math.PI / 2);
  b.block('#f6f1e6', BED.w - 0.1, 0.17, BED.d - 0.1, 0, 0.35, 0);
  b.sphere('#ffffff', 0.55, 0.13, 0.28, 0, BED.top + 0.05, -BED.d / 2 + 0.38);
  const quilt = ['#f2a7b8', '#8fc1e8', '#f6d55c', '#b494dd', '#7cc28b', '#ff9a62'];
  for (let i = 0; i < 4; i++) for (let k = 0; k < 4; k++) b.box(quilt[(i * 3 + k) % quilt.length], (BED.w - 0.05) / 4, 0.06, 0.4, -BED.w / 2 + 0.03 + ((i + 0.5) * (BED.w - 0.05)) / 4, BED.top + 0.01, -0.35 + k * 0.4);
  b.box('#e8dcc0', BED.w + 0.02, 0.2, 0.06, 0, BED.top - 0.08, BED.d / 2 - 0.28);
  // Bedside table and lamp.
  p.block(WOOD, 0.6, 0.6, 0.5, 4.45, 0, -3.5);
  p.post('#d8a845', 0.04, 0.3, 4.45, 0.6, -3.5, 6);
  p.taper('#f6d9a8', 0.6, 0.18, 0.22, 4.45, 0.88, -3.5, 8);
  glow.add(new THREE.IcosahedronGeometry(0.08, 0), '#ffe2a0', { pos: [4.45, 0.92, -3.5] });
  // Fireplace with a rug before it.
  fireplace(p.at(-2.4, 0, -hd + 0.4), glow, '#b5a99a');
  candle(p, glow, -2.9, 1.66, -hd + 0.4, 0.2);
  candle(p, glow, -1.9, 1.66, -hd + 0.4, 0.15);
  // Bookshelf on the left wall.
  const bs = p.at(-hw + 0.3, 0, -1.6, Math.PI / 2);
  bs.block(WOOD_DARK, 1.9, 2.2, 0.5, 0, 0, 0);
  for (let s = 0; s < 4; s++) {
    bs.box(WOOD, 1.8, 0.05, 0.45, 0, 0.35 + s * 0.5, 0.05);
    let x = -0.8;
    while (x < 0.8) {
      const w = 0.08 + r() * 0.06;
      const h = 0.28 + r() * 0.12;
      bs.box(pick(r, ['#a8463f', '#3f6f9a', '#5f8a4f', '#c9a24f', '#7b4f7a', '#e8dcc0']), w, h, 0.32, x + w / 2, 0.38 + s * 0.5 + h / 2, 0.1);
      x += w + 0.01;
    }
  }
  // Table, chairs and tea.
  p.post(WOOD_DARK, 0.1, 0.72, HOME_TABLE.x, 0, HOME_TABLE.z, 6);
  p.cyl(WOOD_LIGHT, 0.75, 0.07, HOME_TABLE.x, 0.75, HOME_TABLE.z, 12);
  p.cyl('#f6f1e6', 0.6, 0.02, HOME_TABLE.x, 0.79, HOME_TABLE.z, 12);
  p.sphere('#8fc1e8', 0.14, 0.12, 0.14, HOME_TABLE.x, 0.9, HOME_TABLE.z);
  p.box('#8fc1e8', 0.14, 0.04, 0.04, HOME_TABLE.x + 0.18, 0.93, HOME_TABLE.z);
  for (const dx of [-0.35, 0.35]) p.post('#ffffff', 0.06, 0.07, HOME_TABLE.x + dx, 0.8, HOME_TABLE.z + 0.2, 8);
  for (const c of HOME_CHAIRS) chair(p.at(c.x, 0, c.z, c.ry), '#c98a5a');
  // A big oval rug and a potted plant.
  p.sphere('#7cc28b', 1.8, 0.02, 1.2, 0.4, 0.02, 0.7, 12, 2);
  p.sphere('#f6efe0', 1.5, 0.025, 0.95, 0.4, 0.025, 0.7, 12, 2);
  p.sphere('#f2a7b8', 1.1, 0.03, 0.65, 0.4, 0.03, 0.7, 12, 2);
  p.taper('#c06a48', 1.3, 0.28, 0.45, 4.5, 0, 1.6, 8);
  for (let k = 0; k < 5; k++) {
    const a = (k / 5) * Math.PI * 2;
    p.sphere('#5f9e47', 0.18, 0.4, 0.12, 4.5 + Math.cos(a) * 0.18, 0.85, 1.6 + Math.sin(a) * 0.18);
  }
  // A coat hook by the door and a little clock.
  p.box(WOOD_DARK, 0.9, 0.08, 0.06, -2.2, 1.9, hd - 0.1);
  p.cyl('#c9a24f', 0.2, 0.05, -1.0, 2.5, -hd + 0.05, 10, Math.PI / 2);
  p.cyl('#f6efe0', 0.16, 0.06, -1.0, 2.5, -hd + 0.06, 10, Math.PI / 2);
  // The owner's name, embroidered on a hoop above the bed.
  const hoop = new THREE.Group();
  const face = new THREE.Mesh(
    new THREE.CircleGeometry(0.55, 24),
    new THREE.MeshLambertMaterial({ map: sign.texture, emissive: '#ffffff', emissiveMap: sign.texture, emissiveIntensity: 0.25 }),
  );
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.57, 0.04, 6, 24), new THREE.MeshLambertMaterial({ color: '#c49a6c', flatShading: true }));
  hoop.add(face, ring);
  hoop.position.set(BED.x, 2.3, -hd + 0.05);
  const extra = new THREE.Group();
  extra.add(hoop, nightWindow(0.5, 2.0, -hd + 0.093, 1.1, 1.0));
  return extra;
}

/** What the bedroom window shows at night: a deep blue sky, a crescent moon and a scatter of stars. */
function nightWindow(x: number, y: number, z: number, w: number, h: number): THREE.Group {
  const g = new THREE.Group();
  g.name = 'nightWindow';
  const sky = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: '#141b3f' }));
  sky.position.set(x, y, z);
  g.add(sky);
  const moonMat = new THREE.MeshBasicMaterial({ color: '#f8efc4' });
  const moon = new THREE.Mesh(new THREE.CircleGeometry(0.14, 24), moonMat);
  moon.position.set(x + 0.28, y + 0.26, z + 0.004);
  const bite = new THREE.Mesh(new THREE.CircleGeometry(0.12, 24), new THREE.MeshBasicMaterial({ color: '#141b3f' }));
  bite.position.set(x + 0.36, y + 0.3, z + 0.008);
  g.add(moon, bite);
  const starMat = new THREE.MeshBasicMaterial({ color: '#ffffff' });
  const star = new THREE.CircleGeometry(0.014, 6);
  const r = rng(7);
  for (let i = 0; i < 22; i++) {
    const m = new THREE.Mesh(star, starMat);
    const s = 0.5 + r() * 1.1;
    m.scale.setScalar(s);
    m.position.set(x - w / 2 + 0.06 + r() * (w - 0.12), y - h / 2 + 0.06 + r() * (h - 0.12), z + 0.004);
    g.add(m);
  }
  // A glow around the moon, so the room gets a little moonlight through the glass.
  const halo = new THREE.Mesh(new THREE.CircleGeometry(0.26, 24), new THREE.MeshBasicMaterial({ color: '#f8efc4', transparent: true, opacity: 0.12 }));
  halo.position.set(x + 0.28, y + 0.26, z + 0.002);
  g.add(halo);
  g.visible = false;
  return g;
}

// ---------------------------------------------------------------- assembly

export function buildInteriors(): Interiors {
  const glassMaterial = new THREE.MeshBasicMaterial({ vertexColors: true });
  const glowMaterial = new THREE.MeshBasicMaterial({ vertexColors: true });
  const ownerSign = new TextSign({ w: 512, h: 512, bg: '#fbf4e6', fg: '#b8506a', round: true, italic: false, size: 120 }, ['Home', 'sweet home']);
  const make = (room: Room, fill: (p: Paint, glow: Builder, r: () => number) => THREE.Object3D | void): THREE.Group => {
    const main = new Builder();
    const glass = new Builder();
    const glow = new Builder();
    const p = new Paint({ main, glass });
    const extra = fill(p, glow, rng(room.length * 97 + 3));
    const g = new THREE.Group();
    g.name = room;
    g.add(main.mesh(matte()));
    if (!glass.empty) g.add(glass.mesh(glassMaterial, { cast: false, receive: false }));
    if (!glow.empty) {
      const flames = glow.mesh(glowMaterial, { cast: false, receive: false });
      flames.name = 'glow';
      g.add(flames);
    }
    if (extra) g.add(extra);
    g.visible = false;
    return g;
  };
  const rooms: Record<Room, Interior> = {
    tavern: {
      group: make('tavern', tavern),
      hemi: { sky: '#ffe2b8', ground: '#5a3a2a', intensity: 1.1 },
      sun: { color: '#ffd9a0', intensity: 1.3, dir: [0.4, 1, 0.6] },
      lights: [
        { pos: [-7.0, 1.0, 0.4], color: '#ff9a4a', intensity: 22, distance: 10, flicker: true },
        { pos: [-1.8, 2.3, -2.0], color: '#ffd48a', intensity: 14, distance: 9 },
        { pos: [-4.6, 2.3, 2.6], color: '#ffd48a', intensity: 10, distance: 8 },
        { pos: [3.0, 2.3, 2.4], color: '#ffd48a', intensity: 10, distance: 8 },
      ],
    },
    bakery: {
      group: make('bakery', bakery),
      hemi: { sky: '#fff0d8', ground: '#7a5a40', intensity: 1.25 },
      sun: { color: '#fff1d8', intensity: 1.4, dir: [0.3, 1, 0.6] },
      lights: [
        { pos: [OVEN.x, 0.8, OVEN.z + 1.6], color: '#ff8a3d', intensity: 18, distance: 8, flicker: true },
        { pos: [2.5, 2.3, -1.2], color: '#ffe2a8', intensity: 12, distance: 9 },
        { pos: [-1.0, 2.3, 1.5], color: '#ffe2a8', intensity: 10, distance: 8 },
        { pos: [3.5, 2.0, 3.0], color: '#ffe2a8', intensity: 4, distance: 6 },
      ],
    },
    church: {
      group: make('church', church),
      hemi: { sky: '#e8e4ff', ground: '#6a5a50', intensity: 1.05 },
      sun: { color: '#e8e8ff', intensity: 1.2, dir: [-0.3, 1, 0.5] },
      lights: [
        { pos: [-2.2, 1.9, -7.2], color: '#ffd48a', intensity: 8, distance: 6, flicker: true },
        { pos: [2.2, 1.9, -7.2], color: '#ffd48a', intensity: 8, distance: 6, flicker: true },
        { pos: [0, 2.6, -3.5], color: '#ffe2a8', intensity: 10, distance: 9 },
        { pos: [0, 2.6, 2.5], color: '#ffe2a8', intensity: 10, distance: 9 },
      ],
    },
    house: {
      group: make('house', (p, glow, r) => home(p, glow, r, ownerSign)),
      hemi: { sky: '#fff0dc', ground: '#6a4a36', intensity: 1.15 },
      sun: { color: '#ffe8c8', intensity: 1.3, dir: [0.35, 1, 0.6] },
      lights: [
        { pos: [-2.4, 0.9, -3.0], color: '#ff9a4a', intensity: 16, distance: 8, flicker: true },
        { pos: [4.45, 1.2, -3.2], color: '#ffd48a', intensity: 5, distance: 5 },
        { pos: [0.4, 2.6, 0.6], color: '#ffe8c0', intensity: 8, distance: 9 },
        { pos: [-3.6, 2.2, 2.4], color: '#ffe8c0', intensity: 3, distance: 6 },
      ],
      night: {
        hemi: { sky: '#2b3660', ground: '#0e0b16', intensity: 0.32 },
        sun: { color: '#8fa6e8', intensity: 0.35, dir: [0.15, 1, -0.7] },
        lights: [
          // Moonlight falling in through the window, and the last embers in the grate.
          { pos: [0.5, 2.0, -3.4], color: '#a9bcff', intensity: 6, distance: 9 },
          { pos: [-2.4, 0.5, -3.3], color: '#ff6a2a', intensity: 1.2, distance: 3, flicker: true },
        ],
      },
    },
  };
  return { rooms, glassMaterial, ownerSign };
}
