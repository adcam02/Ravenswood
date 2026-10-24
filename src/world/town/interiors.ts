import * as THREE from 'three';
import { Builder, matte, rng } from '../build';
import { BOOTH, BOOTH_SEATS, type ZoneKind } from '../types';
import { G, Paint, pick, shade, smoothMesh } from './kit';
import {
  BACK_DIAL,
  BAR,
  BAR_STOOLS,
  BED,
  BELL_ROPE,
  HOME_CHAIRS,
  HOME_TABLE,
  MOVEMENT,
  OVEN,
  PEW_LEN,
  PEW_ROWS,
  PEW_X,
  ROOMS,
  SHELF,
  SIDE_DIAL,
  TAVERN_TABLES,
  TOWER_BENCH,
  WORKBENCH,
  WORK_STOOL,
  tableChairs,
} from './layout';
import { IRON, WOOD, WOOD_DARK, WOOD_LIGHT, barrel, crate } from './props';
import { makeGlows, type GlowSpot, type Glows } from './fx';
import { beamGeometry, beamMaterial } from './looks';
import { SeatingChart } from './seating';
import { signBoard, TextSign } from './sign';
import { BJ_DEALER, BJ_TABLE, FELT_Y, STEP, PK_DEALER, PK_TABLE, RL_CROUPIER, RL_TABLE, SHOP, SLOTS, bjSeat, pkSeat, rlSeat } from './casinoLayout';
import { BJ_SEATS, PK_SEATS, RL_SEATS } from '../../casino/types';
import { placeMatrix } from '../build';


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
  /** Soft halos round the room's flames and lamps. */
  glows?: Glows;
  /** The same room with the fire out and moonlight through the window, for bedrooms at night. */
  night?: RoomLight;
}

export interface Interiors {
  rooms: Record<Room, Interior>;
  /** Glass that shows the sky outside: bright by day, dark at night. */
  glassMaterial: THREE.MeshBasicMaterial;
  ownerSign: TextSign;
  /** Who sits where round the circle, framed on the bedroom's chimney breast. */
  seatingChart: SeatingChart;
  /** The clock tower's moving parts. */
  clockwork: Clockwork;
  /** The confession booth's curtains, drawn while someone sits on each side. */
  boothCurtains: BoothCurtains;
}

export interface BoothCurtains {
  group: THREE.Group;
  /** 0: tied back at the sides; 1: drawn across both doorways. */
  set(closed: number): void;
}

const WALL_H = 3.3;

/** The halos for the room being built: every flame and lamp adds one where it stands. */
let haloSpots: GlowSpot[] = [];
const haloAt = (p: Paint, x: number, y: number, z: number, size: number, color: string, flicker = false) => {
  const v = new THREE.Vector3(x, y, z).applyMatrix4(p.m);
  haloSpots.push({ x: v.x, y: v.y, z: v.z, size, color, flicker });
};

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
  // Anything running round the three walls: the back piece spans the room and the side pieces butt up to
  // it. No two faces may share a plane (overlapping corners, or a board flush with the panel behind it):
  // the graphics card can't tell which is in front, and they flicker.
  const around = (back: THREE.ColorRepresentation, side: THREE.ColorRepresentation, h: number, d: number, y: number, short = 0) => {
    p.box(back, hw * 2, h, d, 0, y, -hd + d / 2);
    for (const sx of [-1, 1]) p.box(side, d, h, hd * 2 - d - short, sx * (hw - d / 2), y, (d - short) / 2);
  };
  // The panelling stops a little short at the front, so its end isn't flush with the trims' ends.
  around(s.wainscot, shade(s.wainscot, -0.04), 1.0, 0.06, 0.5, 0.012);
  // Panelling: battens over the wainscot, a skirting board standing proud of them, and a rail on top.
  for (let x = -hw + 0.5; x < hw - 0.2; x += 0.5) p.box(shade(s.wainscot, -0.08), 0.05, 0.9, 0.03, x, 0.5, -hd + 0.075);
  for (const sx of [-1, 1]) for (let z = -hd + 0.5; z < hd - 0.2; z += 0.5) p.box(shade(s.wainscot, -0.1), 0.03, 0.9, 0.05, sx * (hw - 0.075), 0.5, z);
  around(s.trim, s.trim, 0.08, 0.1, 1.02);
  around(shade(s.trim, -0.05), shade(s.trim, -0.08), 0.16, 0.11, 0.08);
  around(shade(s.trim, 0.05), shade(s.trim, 0.02), 0.05, 0.06, WALL_H - 0.75);
  // The wall plate along the top, with a moulded cornice just under it.
  p.box(s.trim, hw * 2 + 0.6, 0.16, 0.36, 0, WALL_H + 0.05, -hd - 0.15);
  for (const sx of [-1, 1]) p.box(s.trim, 0.36, 0.16, hd * 2 + 0.27, sx * (hw + 0.15), WALL_H + 0.05, 0.165);
  around(shade(s.trim, 0.08), shade(s.trim, 0.06), 0.08, 0.1, WALL_H - 0.08);
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
  haloAt(p, 0, 0.5, 0.55, 2.6, '#ff9a4a', true);
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
  haloAt(p, x, y + h + 0.08, z, 0.7, '#ffc96a', true);
}

function hangingLamp(p: Paint, glow: Builder, x: number, y: number, z: number) {
  // A chain of links down to an iron shade, with a glass bowl under it.
  for (let k = 0; k < 6; k++) p.torus(IRON, 0.035, 0.008, x, y + 0.3 + k * 0.1, z, 0, k % 2 ? Math.PI / 2 : 0);
  p.cyl(IRON, 0.02, 0.2, x, y + 0.9, z, 6);
  p.cone(IRON, 0.3, 0.18, x, y + 0.12, z, 14);
  p.torus(IRON, 0.29, 0.012, x, y + 0.13, z, Math.PI / 2);
  p.glass.cyl('#fff1c8', 0.14, 0.06, x, y + 0.1, z, 10);
  glow.add(new THREE.IcosahedronGeometry(0.14, 1), '#ffe2a0', { pos: [x, y + 0.05, z] }, p.m);
  haloAt(p, x, y + 0.05, z, 1.3, '#ffc27a');
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
  p.rbox('#a87a4f', len + 0.2, 0.09, BAR.depth + 0.25, cx, BAR.h - 0.08 + 0.045, BAR.z + 0.05, 0.025);
  p.cyl('#d8a845', 0.04, len, cx, 0.2, BAR.z + BAR.depth / 2 + 0.25, 6, 0, 0, Math.PI / 2);
  // Taps, with porcelain handles and a drip tray.
  for (const x of [-4.6, -2.2, 0.2]) {
    p.post('#d8a845', 0.05, 0.35, x, BAR.h, BAR.z - 0.25, 10);
    p.box('#d8a845', 0.05, 0.05, 0.16, x, BAR.h + 0.33, BAR.z - 0.18);
    p.box('#f6efe0', 0.06, 0.2, 0.06, x, BAR.h + 0.46, BAR.z - 0.2, 0.3);
    p.sphere('#a8463f', 0.04, 0.04, 0.04, x, BAR.h + 0.57, BAR.z - 0.23);
  }
  p.box('#9aa0a8', 3.6, 0.03, 0.2, -2.2, BAR.h + 0.02, BAR.z - 0.1);
  // Shelves of bottles (with labels) and glasses behind it, on brackets.
  for (const y of [1.5, 2.2]) {
    p.box(WOOD, 7.0, 0.07, 0.35, -2.0, y, -hd + 0.2);
    for (const x of [-5.2, -2.0, 1.2]) p.box(shade(WOOD, -0.12), 0.06, 0.25, 0.3, x, y - 0.16, -hd + 0.18, 0.6);
    for (let k = 0; k < 11; k++) {
      const c = pick(r, ['#3f7a4f', '#7a3f3f', '#c9a24f', '#4f5f8a', '#e8dcc0']);
      const x = -5.2 + k * 0.62;
      if (k % 4 === 3) {
        // A tankard or a glass now and then.
        p.taper('#d8d8e0', 0.85, 0.06, 0.16, x, y + 0.04, -hd + 0.2, 10);
        p.cyl('#d8d8e0', 0.05, 0.02, x, y + 0.04, -hd + 0.2, 10);
        continue;
      }
      p.post(c, 0.07, 0.3, x, y + 0.04, -hd + 0.2, 10);
      p.taper(c, 0.45, 0.07, 0.08, x, y + 0.34, -hd + 0.2, 10);
      p.post(c, 0.03, 0.1, x, y + 0.4, -hd + 0.2, 8);
      p.cyl(shade(c, -0.3), 0.032, 0.02, x, y + 0.51, -hd + 0.2, 8);
      p.box(pick(r, ['#f6efe0', '#f2d9a0', '#f8c8c8']), 0.09, 0.1, 0.01, x, y + 0.2, -hd + 0.27);
    }
  }
  for (const x of [-5.3, -3.9, 1.6]) {
    p.box(WOOD_DARK, 1.0, 0.25, 0.9, x, 0.12, -hd + 0.5);
    barrel(p.at(x, 0.25, -hd + 0.5, Math.PI / 2), r, true);
  }
  // Stools along the bar: three turned legs, a footring and a padded top.
  for (const s of BAR_STOOLS) {
    for (let k = 0; k < 3; k++) {
      const a = (k / 3) * Math.PI * 2;
      p.cyl(WOOD_DARK, 0.03, 0.74, s.x + Math.cos(a) * 0.14, 0.37, s.z + Math.sin(a) * 0.14, 8, Math.sin(a) * -0.12, 0, Math.cos(a) * 0.12);
    }
    p.torus(IRON, 0.19, 0.012, s.x, 0.28, s.z, Math.PI / 2);
    p.cyl(WOOD_DARK, 0.22, 0.04, s.x, 0.73, s.z, 14);
    p.cyl('#a8463f', 0.26, 0.08, s.x, 0.78, s.z, 14);
    p.torus('#8a3630', 0.24, 0.015, s.x, 0.83, s.z, Math.PI / 2);
  }
  // Tables with chairs around them, with tankards, a plate and a bread roll on each.
  for (const t of TAVERN_TABLES) {
    p.post(WOOD_DARK, 0.12, 0.75, t.x, 0, t.z, 12);
    p.cyl(WOOD_DARK, 0.16, 0.08, t.x, 0.7, t.z, 12);
    p.cyl(WOOD_LIGHT, 0.85, 0.08, t.x, 0.78, t.z, 20);
    p.torus(shade(WOOD_LIGHT, -0.1), 0.84, 0.02, t.x, 0.82, t.z, Math.PI / 2);
    p.cyl(WOOD_DARK, 0.4, 0.05, t.x, 0.03, t.z, 12);
    for (let k = 0; k < 3; k++) {
      const a = (k / 3) * Math.PI * 2;
      p.box(WOOD_DARK, 0.08, 0.05, 0.7, t.x + Math.cos(a) * 0.3, 0.03, t.z + Math.sin(a) * 0.3, 0, -a + Math.PI / 2, 0);
    }
    candle(p, glow, t.x, 0.82, t.z, 0.18);
    for (const [dx, dz] of [
      [0.45, 0.2],
      [-0.4, -0.3],
    ]) {
      p.post('#a8743f', 0.06, 0.14, t.x + dx, 0.82, t.z + dz, 10);
      p.sphere('#fbf3df', 0.065, 0.03, 0.065, t.x + dx, 0.97, t.z + dz, 10, 6);
      p.torus('#a8743f', 0.035, 0.01, t.x + dx + 0.07, 0.89, t.z + dz, 0, Math.PI / 2);
    }
    p.cyl('#e8dcc0', 0.16, 0.015, t.x - 0.3, 0.83, t.z + 0.4, 14);
    p.sphere('#d18b46', 0.07, 0.05, 0.07, t.x - 0.3, 0.86, t.z + 0.4, 10, 6);
    for (const c of tableChairs(t)) chair(p.at(c.x, 0, c.z, c.ry), '#8a5a36', '#7a3f3f');
  }
  // Fireplace on the left wall, antlers over it, and a rug with a fringe.
  fireplace(p.at(-hw + 0.4, 0, 0.4, Math.PI / 2), glow, '#9a8f84');
  {
    const a = p.at(-hw + 0.06, 2.4, 0.4, Math.PI / 2);
    a.box(WOOD_DARK, 0.5, 0.4, 0.05, 0, 0, 0);
    a.sphere('#e8dcc0', 0.12, 0.1, 0.08, 0, 0.0, 0.05);
    for (const sx of [-1, 1]) {
      a.rod('#d8ccb8', 0.025, sx * 0.08, 0.05, 0.06, sx * 0.35, 0.35, 0.1, 6);
      a.rod('#d8ccb8', 0.02, sx * 0.2, 0.18, 0.08, sx * 0.14, 0.4, 0.1, 6);
      a.rod('#d8ccb8', 0.018, sx * 0.3, 0.3, 0.09, sx * 0.45, 0.42, 0.1, 6);
    }
  }
  p.box('#a8463f', 3.4, 0.03, 2.2, -0.8, 0.015, 2.5);
  p.box('#d8a845', 3.0, 0.035, 1.8, -0.8, 0.02, 2.5);
  p.box('#a8463f', 2.6, 0.04, 1.4, -0.8, 0.025, 2.5);
  for (let x = -2.4; x <= 0.8; x += 0.16) for (const sz of [-1, 1]) p.box('#d8a845', 0.04, 0.02, 0.16, x, 0.02, 2.5 + sz * 1.18);
  // Barrels and crates on the right, a dartboard with a chalk score, and a painting.
  barrel(p.at(6.6, 0, -4.2), r);
  barrel(p.at(7.3, 0, -5.0), r);
  barrel(p.at(6.9, 0.95, -4.6), r);
  crate(p.at(6.6, 0, 3.4), r, 0.8);
  crate(p.at(7.3, 0, 3.9), r, 0.6);
  const right = p.at(hw - 0.02, 0, -0.5, -Math.PI / 2);
  right.cyl('#2a1f1a', 0.42, 0.05, 0, 1.9, 0.03, 24, Math.PI / 2);
  right.cyl('#e8dcc0', 0.36, 0.06, 0, 1.9, 0.04, 24, Math.PI / 2);
  for (let k = 0; k < 20; k++) {
    const a = (k / 20) * Math.PI * 2;
    right.box(k % 2 ? '#2a1f1a' : '#e8dcc0', 0.1, 0.1, 0.07, Math.cos(a) * 0.3, 1.9 + Math.sin(a) * 0.3, 0.045, 0, 0, a);
  }
  right.cyl('#a8463f', 0.24, 0.07, 0, 1.9, 0.05, 24, Math.PI / 2);
  for (let k = 0; k < 20; k++) right.box('#3b2f2a', 0.004, 0.84, 0.01, 0, 1.9, 0.085, 0, 0, (k / 20) * Math.PI);
  right.cyl('#3f7a4f', 0.12, 0.08, 0, 1.9, 0.06, 16, Math.PI / 2);
  right.cyl('#a8463f', 0.05, 0.09, 0, 1.9, 0.07, 10, Math.PI / 2);
  right.box('#2a2a2a', 0.5, 0.6, 0.03, 0.8, 1.9, 0.02);
  for (let k = 0; k < 4; k++) right.box('#f6efe0', 0.3 - k * 0.05, 0.02, 0.01, 0.8, 2.1 - k * 0.12, 0.04);
  p.box('#c9a24f', 1.5, 1.0, 0.06, 0, 2.3, -hd + 0.05);
  p.box('#5a7a9a', 1.3, 0.8, 0.07, 0, 2.3, -hd + 0.07);
  p.box('#8aa0b8', 1.3, 0.3, 0.075, 0, 2.55, -hd + 0.07);
  p.ico('#2a2530', 0.18, 0.1, 2.3, -hd + 0.12, 1, 0.8);
  p.sphere('#2a2530', 0.08, 0.08, 0.06, 0.25, 2.42, -hd + 0.12);
  p.cone('#e8c35a', 0.03, 0.1, 0.34, 2.41, -hd + 0.12, 4, 0);
  // A menu board by the door and a coat stand.
  p.box(WOOD_DARK, 0.8, 1.1, 0.05, 4.2, 1.8, -hd + 0.06);
  p.box('#2a2a2a', 0.7, 1.0, 0.03, 4.2, 1.8, -hd + 0.09);
  for (let k = 0; k < 5; k++) p.box('#f6efe0', 0.45 - (k % 2) * 0.1, 0.025, 0.01, 4.2, 2.15 - k * 0.15, -hd + 0.11);
  p.post(WOOD_DARK, 0.04, 1.8, 6.5, 0, 5.2, 10);
  p.cyl(WOOD_DARK, 0.22, 0.05, 6.5, 0.02, 5.2, 12);
  for (let k = 0; k < 4; k++) {
    const a = (k / 4) * Math.PI * 2;
    p.rod(WOOD_DARK, 0.02, 6.5, 1.6, 5.2, 6.5 + Math.cos(a) * 0.2, 1.75, 5.2 + Math.sin(a) * 0.2, 6);
  }
  p.sphere('#3f6f9a', 0.14, 0.12, 0.14, 6.68, 1.65, 5.2, 10, 6);
  hangingLamp(p, glow, -1.8, 2.4, -2.0);
  hangingLamp(p, glow, -4.6, 2.4, 2.6);
  hangingLamp(p, glow, 3.0, 2.4, 2.4);
}

// ---------------------------------------------------------------- the bakery

function bakery(p: Paint, glow: Builder, r: () => number) {
  const { hd } = ROOMS.bakery;
  shell(p, 'bakery', { floor: ['#f1e2c8', '#c97a5a'], wall: '#f7e6cc', wainscot: '#e3a77f', trim: '#8a5a3a', tiles: true }, r);
  backWindow(p, -0.6, 2.0, -hd, 1.0, 1.0, '#8a5a3a');
  // The brick oven, in proper brickwork, with a chimney and an ash door.
  const o = p.at(OVEN.x, 0, OVEN.z);
  o.block('#b5603f', 2.8, 1.0, 2.2, 0, 0, 0);
  for (let k = 0; k < 6; k++) {
    o.box('#a3523a', 2.82, 0.04, 2.22, 0, 0.15 + k * 0.16, 0);
    const off = k % 2 ? 0.15 : 0;
    for (let x = -1.25 + off; x < 1.3; x += 0.3) o.box('#a3523a', 0.03, 0.14, 0.03, x, 0.075 + k * 0.16, 1.105);
    for (let z = -0.95 + off; z < 1.05; z += 0.3) for (const sx of [-1, 1]) o.box('#a3523a', 0.03, 0.14, 0.03, sx * 1.405, 0.075 + k * 0.16, z);
  }
  o.dome('#c06a48', 1.35, 0, 1.0, -0.05, 0.78, 20);
  for (let k = 1; k < 5; k++) o.torus('#a3523a', 1.35 * Math.sqrt(1 - (k / 5) ** 2) + 0.01, 0.015, 0, 1.0 + (k / 5) * 1.05 * 0.78, -0.05, Math.PI / 2);
  o.post('#7a3a2a', 0.25, 1.8, 0.5, 1.6, -0.5, 12);
  o.cyl('#5a2a1a', 0.3, 0.08, 0.5, 3.4, -0.5, 12);
  o.box('#2a1a14', 1.1, 0.7, 0.2, 0, 0.75, 1.02);
  o.cyl('#2a1a14', 0.55, 0.2, 0, 1.1, 1.02, 16, Math.PI / 2);
  o.box(IRON, 0.5, 0.25, 0.04, 0, 0.3, 1.12);
  o.box(shade(IRON, 0.2), 0.08, 0.04, 0.03, 0.15, 0.3, 1.15);
  glow.add(new THREE.ConeGeometry(0.2, 0.4, 5), '#ffb347', { pos: [OVEN.x - 0.15, 0.62, OVEN.z + 1.0] });
  glow.add(new THREE.ConeGeometry(0.16, 0.32, 5), '#ffd76b', { pos: [OVEN.x + 0.2, 0.58, OVEN.z + 1.02] });
  glow.add(new THREE.BoxGeometry(0.9, 0.1, 0.1), '#ff8a3d', { pos: [OVEN.x, 0.46, OVEN.z + 1.05] });
  haloAt(p, OVEN.x, 0.6, OVEN.z + 1.1, 2.4, '#ff8a3d', true);
  o.box('#e3a77f', 3.0, 0.12, 0.3, 0, 1.05, 1.2);
  // A baker's peel leaning on the oven.
  p.box(WOOD_LIGHT, 0.06, 1.6, 0.06, OVEN.x + 1.75, 0.8, OVEN.z + 0.9, 0.15, 0, -0.2);
  p.box(WOOD_LIGHT, 0.4, 0.4, 0.04, OVEN.x + 1.6, 0.25, OVEN.z + 0.95, 0.15, 0, -0.2);
  // Shelves for the day's bakes.
  const len = SHELF.x1 - SHELF.x0;
  const scx = (SHELF.x0 + SHELF.x1) / 2;
  for (const y of SHELF.ys) {
    p.box(WOOD, len, 0.07, 0.6, scx, y, SHELF.z);
    p.box(shade(WOOD, -0.1), len, 0.03, 0.02, scx, y + 0.05, SHELF.z + 0.3);
  }
  for (const x of [SHELF.x0, scx, SHELF.x1]) p.block(WOOD_DARK, 0.08, 2.1, 0.6, x, 0, SHELF.z);
  p.box(WOOD, len + 0.1, 0.07, 0.6, scx, 2.1, SHELF.z);
  for (let k = 0; k < 4; k++) {
    // Baskets of rolls on the top shelf.
    const bx = SHELF.x0 + 0.5 + k * 1.1;
    p.taper('#c9a46a', 1.25, 0.2, 0.18, bx, 2.14, SHELF.z, 12);
    p.torus('#a8834f', 0.24, 0.012, bx, 2.32, SHELF.z, Math.PI / 2);
    for (let j = 0; j < 4; j++) {
      const a = (j / 4) * Math.PI * 2;
      p.sphere('#d8964e', 0.07, 0.05, 0.07, bx + Math.cos(a) * 0.1, 2.33, SHELF.z + Math.sin(a) * 0.1, 10, 6);
    }
  }
  // The shop counter with a panelled front, a cake under a glass dome, scales and a till.
  p.block('#e3a77f', 3.4, 0.95, 0.9, 3.2, 0, 1.1);
  for (let x = 1.75; x < 4.7; x += 0.7) p.box(shade('#e3a77f', -0.1), 0.5, 0.6, 0.03, x, 0.5, 1.56);
  p.block('#fff3e0', 3.5, 0.06, 1.0, 3.2, 0.95, 1.1);
  p.box(shade('#fff3e0', -0.1), 3.5, 0.03, 0.03, 3.2, 1.0, 1.6);
  p.post('#d8d0c0', 0.25, 0.2, 2.2, 1.0, 1.1, 14);
  p.cyl('#f2a7b8', 0.3, 0.3, 2.2, 1.35, 1.1, 16);
  p.cyl('#fff3e0', 0.31, 0.06, 2.2, 1.5, 1.1, 16);
  for (let k = 0; k < 6; k++) {
    const a = (k / 6) * Math.PI * 2;
    p.ico('#e4553f', 0.045, 2.2 + Math.cos(a) * 0.2, 1.56, 1.1 + Math.sin(a) * 0.2, 1);
  }
  p.glass.dome('#ffffff', 0.4, 2.2, 1.21, 1.1, 1.0, 16);
  p.glass.sphere('#ffffff', 0.04, 0.04, 0.04, 2.2, 1.62, 1.1, 8, 6);
  // Brass scales.
  p.cyl('#c9a24f', 0.14, 0.03, 3.1, 1.0, 1.1, 12);
  p.post('#c9a24f', 0.02, 0.35, 3.1, 1.0, 1.1, 8);
  p.box('#c9a24f', 0.5, 0.02, 0.02, 3.1, 1.36, 1.1);
  for (const sx of [-1, 1]) {
    p.cyl('#c9a24f', 0.1, 0.015, 3.1 + sx * 0.24, 1.15 + (sx > 0 ? 0.04 : 0), 1.1, 12);
    for (let k = 0; k < 3; k++) {
      const a = (k / 3) * Math.PI * 2;
      p.rod('#c9a24f', 0.004, 3.1 + sx * 0.24 + Math.cos(a) * 0.09, 1.15 + (sx > 0 ? 0.04 : 0), 1.1 + Math.sin(a) * 0.09, 3.1 + sx * 0.24, 1.35, 1.1, 4);
    }
  }
  p.sphere('#d18b46', 0.06, 0.045, 0.06, 2.86, 1.18, 1.1, 10, 6);
  p.box('#7a5a3a', 0.6, 0.35, 0.45, 4.2, 1.17, 1.1);
  p.block('#d8a845', 0.5, 0.15, 0.3, 4.2, 1.35, 1.0);
  for (let k = 0; k < 6; k++) p.cyl('#f6efe0', 0.03, 0.02, 4.0 + (k % 3) * 0.2, 1.37, 0.9 + Math.floor(k / 3) * 0.12, 8);
  // The work table, with dough, a rolling pin, a flour dusting, and eggs in a bowl.
  p.block(WOOD_LIGHT, 2.2, 0.85, 1.3, -3.3, 0, 1.3);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) p.block(shade(WOOD_LIGHT, -0.15), 0.12, 0.85, 0.12, -3.3 + sx * 1.0, 0, 1.3 + sz * 0.55);
  p.box(shade(WOOD_LIGHT, -0.1), 2.0, 0.05, 1.1, -3.3, 0.3, 1.3);
  p.box('#f6efe0', 1.6, 0.02, 0.9, -3.3, 0.86, 1.3);
  p.sphere('#f3dcb0', 0.3, 0.16, 0.25, -3.6, 0.92, 1.3);
  p.cyl(WOOD_LIGHT, 0.06, 0.8, -2.8, 0.92, 1.3, 10, 0, 0.3, Math.PI / 2);
  p.cyl(shade(WOOD_LIGHT, -0.15), 0.035, 0.12, -2.8 + Math.cos(0.3) * 0.46, 0.92, 1.3 - Math.sin(0.3) * 0.46, 8, 0, 0.3, Math.PI / 2);
  p.cyl(shade(WOOD_LIGHT, -0.15), 0.035, 0.12, -2.8 - Math.cos(0.3) * 0.46, 0.92, 1.3 + Math.sin(0.3) * 0.46, 8, 0, 0.3, Math.PI / 2);
  p.taper('#8fc1e8', 1.3, 0.14, 0.1, -2.6, 0.86, 1.8, 12);
  for (let k = 0; k < 3; k++) p.sphere('#f6e7c8', 0.045, 0.055, 0.045, -2.6 + (k - 1) * 0.07, 0.98, 1.8 + (k % 2) * 0.05, 8, 6);
  // Pans and a whisk hanging on a rail over the table.
  p.cyl(IRON, 0.015, 2.0, -3.3, 2.3, 0.65, 6, 0, 0, Math.PI / 2);
  for (const x of [-3.9, -3.3, -2.7]) {
    p.rod(IRON, 0.008, x, 2.3, 0.65, x, 2.1, 0.65, 4);
    p.cyl(x === -3.3 ? '#c9a24f' : '#4a4a52', 0.16, 0.05, x, 1.9, 0.65, 14, Math.PI / 2);
    p.box('#4a4a52', 0.03, 0.2, 0.02, x, 2.1, 0.65);
  }
  // Jars of jam and spices on a shelf on the left wall.
  const js = p.at(-ROOMS.bakery.hw + 0.25, 0, -1.5, Math.PI / 2);
  js.box(WOOD, 1.8, 0.05, 0.3, 0, 1.6, 0);
  for (let k = 0; k < 6; k++) {
    const c = pick(r, ['#a8463f', '#d8a845', '#7a3f6f', '#5f8a4f', '#e07a4a']);
    js.post(c, 0.07, 0.16, -0.75 + k * 0.3, 1.63, 0, 10);
    js.cyl('#f6efe0', 0.075, 0.03, -0.75 + k * 0.3, 1.8, 0, 10);
    js.box('#f6efe0', 0.08, 0.06, 0.01, -0.75 + k * 0.3, 1.7, 0.075);
  }
  // Flour sacks, tied at the neck.
  for (const [x, z] of [
    [-5.2, 2.6],
    [-5.1, 3.4],
  ]) {
    p.sphere('#efe4cc', 0.42, 0.5, 0.38, x, 0.48, z, 12, 8);
    p.box('#c9a46a', 0.3, 0.08, 0.3, x, 0.95, z);
    p.torus('#a8834f', 0.14, 0.015, x, 0.92, z, Math.PI / 2);
  }
  p.sphere('#efe4cc', 0.38, 0.45, 0.35, -5.25, 1.2, 3.0, 12, 8);
  p.box('#8a2f3a', 0.3, 0.1, 0.02, -5.25, 1.1, 3.35);
  hangingLamp(p, glow, 2.5, 2.4, -1.2);
  hangingLamp(p, glow, -1.0, 2.4, 1.5);
}

// ---------------------------------------------------------------- the church

function church(p: Paint, glow: Builder, r: () => number): THREE.Object3D {
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
      // Lead lines between the panes, a stone sill and a pointed arch.
      w.box('#3a3330', 0.03, 2.0, 0.03, 0, 2.0, 0.09);
      for (let k = 0; k < 4; k++) w.box('#3a3330', 0.9, 0.03, 0.03, 0, 1.02 + k * 0.66, 0.09);
      w.box(shade('#8f8070', 0.06), 1.2, 0.1, 0.2, 0, 0.95, 0.1);
      w.glass.cyl(stained[(i + 3) % stained.length], 0.4, 0.06, 0, 3.05, 0.06, 16, Math.PI / 2);
      w.torus('#8f8070', 0.45, 0.04, 0, 3.05, 0.08, 0, 0);
      for (let k = 0; k < 3; k++) w.box('#3a3330', 0.025, 0.8, 0.03, 0, 3.05, 0.09, 0, 0, (k / 3) * Math.PI);
    });
    // Banners hanging from the pillars, and a sconce on each.
    for (const z of [-2.5, 1.5]) {
      const b = p.at(sx * (hw - 0.5), 0, z, -sx * (Math.PI / 2));
      b.box('#8a2f3a', 0.5, 1.4, 0.03, 0, 2.2, 0.05);
      b.box('#c9a24f', 0.44, 0.08, 0.035, 0, 2.8, 0.05);
      b.ico('#c9a24f', 0.1, 0, 2.3, 0.07, 1, 0.5);
      b.cyl(WOOD_DARK, 0.02, 0.6, 0, 2.92, 0.05, 8, 0, 0, Math.PI / 2);
    }
  }
  // A stone font by the door, with water in the bowl.
  p.post('#bdb3a4', 0.3, 0.3, -4.5, 0, hd - 1.6, 12);
  p.post('#cfc6b8', 0.18, 0.5, -4.5, 0.3, hd - 1.6, 12);
  p.taper('#cfc6b8', 1.3, 0.3, 0.35, -4.5, 0.8, hd - 1.6, 16);
  p.cyl('#8fc1e8', 0.33, 0.02, -4.5, 1.13, hd - 1.6, 16);
  p.torus('#bdb3a4', 0.39, 0.03, -4.5, 1.15, hd - 1.6, Math.PI / 2);
  // The lectern, with an open book on it.
  const lec = p.at(-2.4, 0, -hd + 2.3, 0.4);
  lec.cyl('#7a5236', 0.25, 0.06, 0, 0.03, 0, 12);
  lec.post('#7a5236', 0.06, 1.1, 0, 0.06, 0, 10);
  lec.cyl('#c9a24f', 0.08, 0.03, 0, 0.5, 0, 10);
  lec.box('#7a5236', 0.6, 0.04, 0.45, 0, 1.2, 0, -0.5);
  lec.box(shade('#7a5236', -0.1), 0.6, 0.06, 0.03, 0, 1.08, 0.2, -0.5);
  lec.box('#efe3c6', 0.5, 0.05, 0.36, 0, 1.25, 0, -0.5);
  lec.box('#3b2a36', 0.02, 0.06, 0.37, 0, 1.25, 0, -0.5);
  for (const sx of [-1, 1]) for (let k = 0; k < 4; k++) lec.box('#2a1d12', 0.17, 0.003, 0.01, sx * 0.12, 1.28 + (k - 1.5) * -0.04, (k - 1.5) * 0.07, -0.5);
  // A kneeler and a stack of hymn books by the front pew.
  p.box('#8a2f3a', 0.9, 0.08, 0.3, 3.2, 0.04, -4.95);
  for (let k = 0; k < 3; k++) p.box(pick(r, ['#3b2a36', '#8a2f3a', '#3f6f9a']), 0.18, 0.04, 0.24, -3.9, 0.22 + k * 0.045, -hd + 0.3 + 0.1, 0, (k - 1) * 0.15, 0);
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
  confessional(p, glow);
  // Pews, in two columns, facing the altar.
  for (const z of PEW_ROWS) {
    for (const sx of [-1, 1]) {
      const q = p.at(sx * PEW_X, 0, z);
      q.box('#7a5236', PEW_LEN, 0.08, 0.5, 0, 0.44, 0);
      q.box('#7a5236', PEW_LEN, 0.55, 0.08, 0, 0.75, 0.27);
      q.box('#6a4630', PEW_LEN + 0.06, 0.06, 0.12, 0, 1.04, 0.27);
      for (const ex of [-1, 1]) {
        q.block('#6a4630', 0.08, 0.95, 0.6, ex * (PEW_LEN / 2), 0, 0.03);
        q.cyl('#6a4630', 0.3, 0.08, ex * (PEW_LEN / 2), 0.9, -0.1, 14, 0, 0, Math.PI / 2);
      }
      q.box('#6a4630', PEW_LEN - 0.2, 0.05, 0.05, 0, 0.2, -0.2);
      q.box('#a8463f', PEW_LEN - 0.2, 0.04, 0.42, 0, 0.5, 0);
      // A hymn book left on the seat, and a little shelf on the back.
      q.box('#3b2a36', 0.16, 0.03, 0.22, (sx > 0 ? 1 : -1) * 0.9, 0.54, 0, 0, 0.2, 0);
      q.box(shade('#7a5236', -0.08), PEW_LEN - 0.3, 0.03, 0.12, 0, 0.85, 0.38);
    }
  }
  // Sunbeams slanting in through the windows on the sunny side, tinted by the glass, with bright patches on the floor.
  const beams = [-4.5, -0.5, 3.5].map((z, i) => {
    const x = -hw + 0.06;
    return {
      corners: [new THREE.Vector3(x, 1.05, z - 0.42), new THREE.Vector3(x, 1.05, z + 0.42), new THREE.Vector3(x, 2.95, z + 0.42), new THREE.Vector3(x, 2.95, z - 0.42)],
      dir: new THREE.Vector3(0.62, -0.74, -0.22),
      color: new THREE.Color('#fff1cf').lerp(new THREE.Color(stained[(i * 2) % stained.length]), 0.3).multiplyScalar(0.16),
      floorGlow: 1.7,
    };
  });
  const sunbeams = new THREE.Mesh(beamGeometry(beams), beamMaterial());
  sunbeams.renderOrder = 6;
  sunbeams.name = 'sunbeams';
  // Hanging candle wheels.
  for (const z of [-3.5, 2.5]) {
    p.torus(IRON, 0.6, 0.03, 0, 2.7, z, Math.PI / 2);
    p.cyl(IRON, 0.01, 0.6, 0, 3.0, z, 3);
    for (let k = 0; k < 6; k++) {
      const a = (k / 6) * Math.PI * 2;
      candle(p, glow, Math.cos(a) * 0.6, 2.72, z + Math.sin(a) * 0.6, 0.12);
    }
  }
  return sunbeams;
}

/**
 * The confession booth in the front corner: two closets in dark polished wood side by side, open at the top so the
 * camera can see who's inside, with half doors and red velvet curtains drawn back at the front, a seat in each, and
 * a latticed grille in the wall between them.
 */
function confessional(p: Paint, glow: Builder) {
  const wood = '#5a3a26';
  const trim = '#45291a';
  const panel = shade(wood, 0.07);
  const velvet = '#7a1f2e';
  const gold = '#c9a24f';
  const { x0, x1, z0, z1 } = BOOTH;
  const cx = (x0 + x1) / 2;
  const cz = (z0 + z1) / 2;
  const w = x1 - x0;
  const d = z1 - z0;
  const base = 0.08;
  const top = 2.3;
  const mid = BOOTH_SEATS[0].x + (BOOTH_SEATS[1].x - BOOTH_SEATS[0].x) / 2;
  // The plinth it stands on, and the back against the wall.
  p.block(trim, w + 0.1, base, d + 0.06, cx, 0, cz);
  p.box(wood, w, top - base, 0.07, cx, base + (top - base) / 2, z0 + 0.035);
  // The two outer walls, with a raised panel on the outside of each.
  for (const x of [x0 + 0.04, x1 - 0.04]) {
    p.box(wood, 0.08, top - base, d, x, base + (top - base) / 2, cz);
    p.box(panel, 0.1, 0.9, d - 0.4, x, 0.75, cz);
    p.box(panel, 0.1, 0.7, d - 0.4, x, 1.7, cz);
  }
  // The wall between the two sides: solid below and above, a latticed grille at head height between.
  const gy0 = 1.0;
  const gy1 = 1.62;
  const gz0 = cz - 0.36;
  const gz1 = cz + 0.36;
  p.box(wood, 0.07, gy0 - base, d, mid, base + (gy0 - base) / 2, cz);
  p.box(wood, 0.07, top - gy1, d, mid, gy1 + (top - gy1) / 2, cz);
  p.box(wood, 0.07, gy1 - gy0, gz0 - z0, mid, (gy0 + gy1) / 2, (z0 + gz0) / 2);
  p.box(wood, 0.07, gy1 - gy0, z1 - gz1, mid, (gy0 + gy1) / 2, (gz1 + z1) / 2);
  p.box(gold, 0.09, 0.04, gz1 - gz0 + 0.08, mid, gy0, cz);
  p.box(gold, 0.09, 0.04, gz1 - gz0 + 0.08, mid, gy1, cz);
  for (const z of [gz0, gz1]) p.box(gold, 0.09, gy1 - gy0, 0.04, mid, (gy0 + gy1) / 2, z);
  for (let z = gz0 + 0.09; z < gz1 - 0.04; z += 0.09) p.box(trim, 0.03, gy1 - gy0, 0.018, mid, (gy0 + gy1) / 2, z);
  for (let y = gy0 + 0.09; y < gy1 - 0.04; y += 0.09) p.box(trim, 0.026, 0.018, gz1 - gz0, mid, y, cz);
  // Posts at the front corners and in the middle (their tops hidden in the cornice), each with a turned finial.
  for (const x of [x0 + 0.04, mid, x1 - 0.04]) {
    p.box(trim, 0.14, top - base, 0.14, x, base + (top - base) / 2, z1 - 0.04);
    p.post(gold, 0.05, 0.06, x, top + 0.08, z1 - 0.04, 10);
    p.sphere(trim, 0.07, 0.07, 0.07, x, top + 0.19, z1 - 0.04, 10, 7);
  }
  // A moulded cornice all round the top (the pieces butt up rather than overlap, so their tops can't flicker), and
  // a rounded crest on the back with a little gold cross.
  p.box(trim, w + 0.16, 0.12, 0.16, cx, top + 0.02, z1 - 0.04);
  p.box(trim, w + 0.16, 0.12, 0.16, cx, top + 0.02, z0 + 0.04);
  for (const x of [x0 + 0.04, x1 - 0.04]) p.box(trim, 0.16, 0.12, d - 0.24, x, top + 0.02, cz);
  p.box(trim, 0.12, 0.1, d - 0.24, mid, top + 0.02, cz);
  p.cyl(wood, 0.55, 0.06, cx, top + 0.08, z0 + 0.03, 20, Math.PI / 2);
  p.torus(gold, 0.55, 0.025, cx, top + 0.08, z0 + 0.08, 0, 0);
  p.box(gold, 0.05, 0.36, 0.04, cx, top + 0.3, z0 + 0.09);
  p.box(gold, 0.22, 0.05, 0.04, cx, top + 0.38, z0 + 0.09);
  // Each side: a half door with two raised panels and a brass knob, the curtains drawn back, and a seat inside.
  for (const seat of BOOTH_SEATS) {
    const left = seat.x < mid ? x0 + 0.11 : mid + 0.04;
    const right = seat.x < mid ? mid - 0.04 : x1 - 0.11;
    const dx = (left + right) / 2;
    const dw = right - left;
    p.box(wood, dw, 0.86, 0.06, dx, base + 0.43, z1 - 0.06);
    for (const k of [-1, 1]) p.box(panel, dw / 2 - 0.16, 0.56, 0.02, dx + k * (dw / 4), base + 0.43, z1 - 0.025);
    p.box(trim, dw, 0.06, 0.09, dx, base + 0.88, z1 - 0.06);
    p.sphere(gold, 0.035, 0.035, 0.035, dx + dw / 2 - 0.12, base + 0.6, z1 - 0.01, 8, 6);
    // The curtain rail and the velvet, bunched at each side with a gold tie.
    p.cyl(gold, 0.018, dw, dx, top - 0.12, z1 - 0.12, 8, 0, 0, Math.PI / 2);
    for (const k of [-1, 1]) {
      const fx = dx + k * (dw / 2 - 0.13);
      for (let f = 0; f < 3; f++) p.cyl(shade(velvet, (f - 1) * 0.05), 0.055, top - 0.2 - base - 0.9, fx + (f - 1) * 0.06 * k, base + 0.9 + (top - 0.2 - base - 0.9) / 2, z1 - 0.13 - f * 0.02, 8);
      p.torus(gold, 0.09, 0.018, fx, 1.35, z1 - 0.13, Math.PI / 2, 0);
    }
    // A bench at the back with a red cushion, where whoever is inside sits facing out.
    p.block(shade(wood, 0.04), dw - 0.1, 0.36, 0.52, dx, base, seat.z - 0.06);
    p.box(velvet, dw - 0.2, 0.05, 0.44, dx, base + 0.385, seat.z - 0.06);
  }
  // A candle on a bracket on the open side, for the dim corner.
  p.box(gold, 0.14, 0.03, 0.04, x0 - 0.07, 1.86, z1 - 0.25);
  candle(p, glow, x0 - 0.12, 1.875, z1 - 0.25, 0.16);
}

/**
 * Velvet that draws across both doorways of the confession booth while someone sits on each side: each half hangs
 * from beside its tied-back curtain and slides across to meet the other, over the half door.
 */
function boothCurtains(): BoothCurtains {
  const { x0, x1, z1 } = BOOTH;
  const mid = BOOTH_SEATS[0].x + (BOOTH_SEATS[1].x - BOOTH_SEATS[0].x) / 2;
  const y0 = 0.08 + 0.92;
  const h = 2.3 - 0.13 - y0;
  const group = new THREE.Group();
  group.name = 'booth-curtains';
  const halves: THREE.Object3D[] = [];
  const material = matte();
  for (const seat of BOOTH_SEATS) {
    const left = seat.x < mid ? x0 + 0.11 : mid + 0.04;
    const right = seat.x < mid ? mid - 0.04 : x1 - 0.11;
    const span = (right - left) / 2 + 0.02;
    for (const k of [-1, 1]) {
      const half = new THREE.Group();
      half.position.set(k < 0 ? left : right, y0, z1 - 0.1);
      const b = new Builder();
      const n = 6;
      for (let i = 0; i < n; i++) {
        // Pleats of slightly different lengths, so no two caps share a plane.
        const len = h - (i % 2) * 0.02;
        b.add(new THREE.CylinderGeometry(1, 1, 1, 8), shade('#7a1f2e', (i % 2) * 0.07 - 0.035), { pos: [-k * span * ((i + 0.5) / n), h - len / 2, 0], scale: [(span / n) * 0.66, len, 0.045] });
      }
      // A gold fringe along the hem.
      b.add(new THREE.BoxGeometry(1, 1, 1), '#c9a24f', { pos: [-k * span * 0.5, 0.025, 0.012], scale: [span, 0.035, 0.07] });
      half.add(b.mesh(material));
      group.add(half);
      halves.push(half);
    }
  }
  const set = (closed: number) => {
    group.visible = closed > 0.01;
    for (const half of halves) half.scale.x = 0.12 + 0.88 * closed;
  };
  set(0);
  return { group, set };
}

// ---------------------------------------------------------------- the clock tower

/** Teeth are this far apart on every gear, so any two of them mesh. */
const PITCH = 0.08;
const BRASS = '#c9a24f';
const STEEL = '#9aa0a8';
/** Cast iron, painted a dark green. */
const CAST = '#2f3833';
const NUMERAL = '#2a2420';

/** The clock room's moving parts, turned by `turnClockwork`. */
export interface Clockwork {
  hands: { hour: THREE.Object3D; minute: THREE.Object3D }[];
  gears: { obj: THREE.Object3D; phase: number; rate: number }[];
  pendulum: THREE.Object3D;
  rope: THREE.Object3D;
}

const gearR = (n: number) => (n * PITCH) / (2 * Math.PI);

/** A gear's place, and the way it turns: `psi` is where its first tooth points, `rate` its turn per turn of the escape wheel. */
interface GearAt {
  n: number;
  x: number;
  y: number;
  psi: number;
  rate: number;
}

/** The gear of `n` teeth meshing with `from`, off in direction `angle`: placed so its gaps meet the other's teeth. */
function meshWith(from: GearAt, n: number, angle: number, d = gearR(from.n) + gearR(n)): GearAt {
  return {
    n,
    x: from.x + Math.cos(angle) * d,
    y: from.y + Math.sin(angle) * d,
    psi: angle + Math.PI - (from.psi - angle) * (from.n / n) + Math.PI / n,
    rate: (-from.rate * from.n) / n,
  };
}

/** A gear of `n` teeth facing +z, centred on the origin: big ones spoked, small ones solid. */
function gear(p: Paint, n: number, color: string, thick = 0.05) {
  const r = gearR(n);
  const seg = (2 * Math.PI) / n;
  const rim = r - 0.075;
  for (let k = 0; k < n; k++) {
    const a = k * seg;
    const b = a + seg / 2;
    p.box(color, PITCH * 0.42, 0.095, thick, -Math.sin(a) * (r - 0.0025), Math.cos(a) * (r - 0.0025), 0, 0, 0, a);
    p.box(shade(color, -0.04), ((2 * Math.PI * rim) / n) * 1.08, 0.05, thick * 1.1, -Math.sin(b) * rim, Math.cos(b) * rim, 0, 0, 0, b);
  }
  const hub = 0.05 + r * 0.12;
  if (r < 0.3) p.cyl(shade(color, -0.1), r - 0.08, thick * 0.6, 0, 0, 0, Math.max(10, n), Math.PI / 2);
  else {
    const spokes = r > 0.5 ? 6 : 5;
    for (let k = 0; k < spokes; k++) {
      const a = (k / spokes) * Math.PI * 2;
      const mid = (hub + rim) / 2;
      p.box(shade(color, -0.06), 0.045, rim - hub, thick * 0.8, -Math.sin(a) * mid, Math.cos(a) * mid, 0, 0, 0, a);
    }
  }
  p.cyl(shade(color, 0.06), hub, thick * 1.6, 0, 0, 0, 12, Math.PI / 2);
}

/** A Roman numeral's strokes, upright and centred on the origin, `h` tall. */
function numeral(text: string, h: number): { x: number; len: number; rz: number }[] {
  const adv = (c: string) => (c === 'I' ? 0.32 : 0.78) * h;
  const width = [...text].reduce((w, c) => w + adv(c), 0);
  const strokes: { x: number; len: number; rz: number }[] = [];
  let x = -width / 2;
  for (const c of text) {
    const cx = x + adv(c) / 2;
    const w = 0.6 * h;
    if (c === 'I') strokes.push({ x: cx, len: h, rz: 0 });
    else if (c === 'V') {
      const lean = Math.atan2(w / 2, h);
      const len = Math.hypot(w / 2, h);
      strokes.push({ x: cx - w / 4, len, rz: lean }, { x: cx + w / 4, len, rz: -lean });
    } else {
      const lean = Math.atan2(w, h);
      const len = Math.hypot(w, h);
      strokes.push({ x: cx, len, rz: lean }, { x: cx, len, rz: -lean });
    }
    x += adv(c);
  }
  return strokes;
}

const HOURS = ['XII', 'I', 'II', 'III', 'IIII', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI'];

/**
 * A clock dial seen from inside the tower: lit glass in a stone surround, with the iron tracery, the numerals
 * and the hands showing through backwards. Painted in a frame whose +z faces into the room, on the wall's face.
 */
function dial(p: Paint, lit: Paint, y: number, R: number, works: Clockwork, place: { x: number; z: number; ry: number }) {
  p.cyl('#a8a196', R + 0.2, 0.06, 0, y, 0.14, 40, Math.PI / 2);
  p.torus('#8f887c', R + 0.2, 0.035, 0, y, 0.17);
  lit.cyl('#fff3d6', R, 0.02, 0, y, 0.185, 40, Math.PI / 2);
  haloAt(p, 0, y, 0.3, R * 2.2, '#c9b68a');
  // Iron rings and spokes holding the glass, then the minute and hour marks.
  p.torus(NUMERAL, R, 0.035, 0, y, 0.2);
  p.torus(NUMERAL, R * 0.66, 0.016, 0, y, 0.2);
  p.torus(NUMERAL, R * 0.3, 0.016, 0, y, 0.2);
  for (let k = 0; k < 12; k++) {
    const a = (k / 12) * Math.PI * 2;
    const mid = R * 0.48;
    p.box(NUMERAL, 0.016, R * 0.36, 0.01, -Math.sin(a) * mid, y + Math.cos(a) * mid, 0.203, 0, 0, a);
  }
  for (let k = 0; k < 60; k++) {
    const a = (k / 60) * Math.PI * 2;
    const big = k % 5 === 0;
    const len = big ? 0.09 : 0.045;
    const at = R * 0.94 - len / 2;
    p.box(NUMERAL, big ? 0.024 : 0.012, len, 0.01, -Math.sin(a) * at, y + Math.cos(a) * at, 0.203, 0, 0, a);
  }
  // From inside, each numeral sits where its mirror image would, and reads backwards.
  HOURS.forEach((text, h) => {
    const a = (h / 12) * Math.PI * 2;
    const cx = -Math.sin(a) * R * 0.79;
    const cy = y + Math.cos(a) * R * 0.79;
    for (const s of numeral([...text].reverse().join(''), R * 0.15)) {
      p.box(NUMERAL, 0.022, s.len, 0.01, cx + Math.cos(a) * s.x, cy + Math.sin(a) * s.x, 0.203, 0, 0, a + s.rz);
    }
  });
  p.cyl(CAST, 0.1, 0.05, 0, y, 0.22, 14, Math.PI / 2);
  // The hands turn in a holder at the dial's centre.
  const holder = new THREE.Group();
  holder.position.set(place.x + Math.sin(place.ry) * 0.25, y, place.z + Math.cos(place.ry) * 0.25);
  holder.rotation.y = place.ry;
  const hand = (len: number, w: number, tip: number, z: number) =>
    part((q) => {
      q.box(NUMERAL, w, len + 0.14, 0.02, 0, (len - 0.14) / 2, z);
      q.box(NUMERAL, tip, tip, 0.02, 0, len * 0.82, z, 0, 0, Math.PI / 4);
      q.cyl(NUMERAL, w * 1.1, 0.025, 0, -0.12, z, 10, Math.PI / 2);
    });
  const hour = hand(R * 0.52, 0.07, 0.15, 0);
  const minute = hand(R * 0.84, 0.045, 0.09, 0.025);
  holder.add(hour, minute);
  works.hands.push({ hour, minute });
  return holder;
}

const partMaterial = matte();

/** A moving part: its own mesh, painted about its own origin. It casts no shadow, as the shadows are drawn once. */
function part(paint: (p: Paint) => void): THREE.Mesh {
  const b = new Builder();
  paint(new Paint({ main: b, glass: b }));
  return smoothMesh(b, partMaterial, { cast: false });
}

/** A pigeon facing +z, roosting on whatever is at the origin. */
function pigeon(p: Paint) {
  p.sphere('#8a8f9a', 0.08, 0.075, 0.13, 0, 0.08, 0);
  p.sphere('#6f7480', 0.06, 0.03, 0.1, 0, 0.1, -0.12);
  p.sphere('#5f8a7a', 0.055, 0.05, 0.05, 0, 0.14, 0.08);
  p.sphere('#9aa0aa', 0.045, 0.045, 0.05, 0, 0.19, 0.11);
  p.cone('#d9a35a', 0.015, 0.04, 0, 0.19, 0.17, 6);
  for (const sx of [-1, 1]) p.sphere('#ff8c3a', 0.01, 0.01, 0.01, sx * 0.035, 0.2, 0.13);
}

function tower(p: Paint, glow: Builder, r: () => number, works: Clockwork): THREE.Object3D {
  const { hw, hd } = ROOMS.tower;
  const lit = new Paint({ main: glow, glass: glow });
  const moving = new THREE.Group();
  shell(p, 'tower', { floor: ['#a39d93', '#958f85'], wall: '#d8cfc0', wainscot: '#7d6a58', trim: '#5e4a3a', tiles: true }, r);
  // The dials: a big one on the back wall and one on each side.
  moving.add(dial(p.at(0, 0, -hd), lit.at(0, 0, -hd), BACK_DIAL.y, BACK_DIAL.r, works, { x: 0, z: -hd, ry: 0 }));
  for (const sx of [-1, 1]) {
    const ry = (-sx * Math.PI) / 2;
    const f = [sx * hw, 0, SIDE_DIAL.z, ry] as const;
    moving.add(dial(p.at(...f), lit.at(...f), SIDE_DIAL.y, SIDE_DIAL.r, works, { x: sx * hw, z: SIDE_DIAL.z, ry }));
  }

  // The movement: a low cast-iron frame on a stone plinth, the going train inside it, kept below the back dial.
  const M = MOVEMENT;
  const top = 2.05;
  const bed = 0.75;
  p.block('#8f8a80', M.hw * 2 + 0.5, 0.14, M.hd * 2 + 0.5, M.x, 0, M.z);
  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) {
      p.box(CAST, 0.1, top - 0.14, 0.1, M.x + sx * M.hw, (top + 0.14) / 2, M.z + sz * M.hd);
      p.cyl(shade(CAST, 0.08), 0.09, 0.08, M.x + sx * M.hw, 0.18, M.z + sz * M.hd, 10);
      p.ico(BRASS, 0.065, M.x + sx * M.hw, top + 0.1, M.z + sz * M.hd, 1);
    }
    for (const y of [bed, top]) p.box(CAST, 0.08, 0.1, M.hd * 2, M.x + sx * M.hw, y, M.z);
  }
  for (const sz of [-1, 1]) for (const y of [bed, top]) p.box(CAST, M.hw * 2 + 0.1, 0.1, 0.08, M.x, y, M.z + sz * M.hd);
  p.box('#46524c', M.hw * 2 - 0.1, top - bed - 0.1, 0.04, M.x, (top + bed) / 2, M.z - M.hd + 0.06);
  // The going train: the escape wheel in the middle, wheels running off either side.
  const gz = M.z;
  const deg = Math.PI / 180;
  const esc: GearAt = { n: 15, x: M.x, y: 1.35, psi: Math.PI / 2, rate: -1 };
  const left1 = meshWith(esc, 24, 200 * deg);
  const left2 = meshWith(left1, 30, 150 * deg);
  const right1 = meshWith(esc, 32, 0);
  const right2 = meshWith(right1, 18, 20 * deg);
  const train: [GearAt, string][] = [
    [esc, STEEL],
    [left1, BRASS],
    [left2, BRASS],
    [right1, BRASS],
    [right2, STEEL],
  ];
  const addGear = (g: GearAt, color: string, z: number, back: number) => {
    const mesh = part((q) => gear(q, g.n, color));
    mesh.position.set(g.x, g.y, z);
    moving.add(mesh);
    works.gears.push({ obj: mesh, phase: g.psi - Math.PI / 2, rate: g.rate });
    // Its arbor, from the plate behind, with a brass cap.
    p.rod(STEEL, 0.022, g.x, g.y, back, g.x, g.y, z + 0.07, 8);
    p.ico(BRASS, 0.035, g.x, g.y, z + 0.075, 1);
  };
  for (const [g, color] of train) addGear(g, color, gz, M.z - M.hd + 0.08);
  // The pendulum hangs from the anchor over the escape wheel and swings under the frame.
  const pend = works.pendulum;
  pend.position.set(M.x, esc.y + 0.45, gz + 0.08);
  pend.add(
    part((q) => {
      q.cyl(CAST, 0.05, 0.06, 0, 0, 0, 12, Math.PI / 2);
      for (const sx of [-1, 1]) {
        q.rod(CAST, 0.02, 0, 0, 0, sx * 0.15, -0.2, 0, 8);
        q.box(STEEL, 0.035, 0.08, 0.04, sx * 0.15, -0.24, 0, 0, 0, sx * 0.3);
      }
      q.rod(STEEL, 0.014, 0, 0, 0, 0, -1.35, 0, 8);
      q.cyl(BRASS, 0.18, 0.06, 0, -1.38, 0, 24, Math.PI / 2);
      q.torus(shade(BRASS, -0.12), 0.18, 0.02, 0, -1.38, 0);
    }),
  );
  moving.add(pend);
  // A brass beat scale under the bob.
  for (let k = -3; k <= 3; k++) p.box(k ? BRASS : '#8a2f3a', 0.012, k ? 0.03 : 0.05, 0.01, M.x + k * 0.05, 0.205, gz + 0.06);
  p.box(shade(BRASS, -0.1), 0.4, 0.02, 0.02, M.x, 0.18, gz + 0.06);
  // Rods off to the dials, with bevel boxes where they turn.
  p.rod(STEEL, 0.03, M.x, BACK_DIAL.y, M.z - M.hd, 0, BACK_DIAL.y, -hd + 0.2, 8);
  p.box(CAST, 0.18, 0.18, 0.14, M.x, BACK_DIAL.y, M.z - M.hd - 0.07);
  for (const sx of [-1, 1]) {
    p.rod(STEEL, 0.03, M.x + sx * M.hw, SIDE_DIAL.y, SIDE_DIAL.z, sx * (hw - 0.2), SIDE_DIAL.y, SIDE_DIAL.z, 8);
    p.box(CAST, 0.14, 0.18, 0.18, M.x + sx * (M.hw + 0.07), SIDE_DIAL.y, SIDE_DIAL.z);
  }
  // Two pigeons that have found their way in.
  pigeon(p.at(-0.9, top + 0.05, M.z + M.hd, 0.4));
  pigeon(p.at(1.05, top + 0.05, M.z - M.hd, -2.4));

  // Big wheels on the back wall, turning with the clock.
  const wz = -hd + 0.2;
  const w1: GearAt = { n: 48, x: -3.3, y: 1.75, psi: Math.PI / 2, rate: 0.1 };
  const w2 = meshWith(w1, 24, Math.PI / 4);
  const w3 = meshWith(w1, 16, -Math.PI / 3);
  for (const [g, color] of [
    [w1, BRASS],
    [w2, STEEL],
    [w3, BRASS],
  ] as [GearAt, string][]) {
    addGear(g, color, wz, -hd);
    p.cyl(CAST, 0.12, 0.04, g.x, g.y, -hd + 0.02, 12, Math.PI / 2);
  }
  // The weights that drive it all, hanging down from the dark above.
  for (const [x, h] of [
    [2.3, 1.3],
    [2.9, 1.8],
  ]) {
    p.cyl('#5a5a60', 0.014, 14 - h, x, (14 + h) / 2, -hd + 0.45, 6);
    p.cyl(CAST, 0.17, 0.8, x, h - 0.45, -hd + 0.45, 14);
    p.cyl(BRASS, 0.12, 0.05, x, h - 0.03, -hd + 0.45, 12);
    p.torus(BRASS, 0.04, 0.012, x, h + 0.02, -hd + 0.45);
  }
  // A ladder up to the bells.
  for (const sx of [-1, 1]) p.rod(WOOD_DARK, 0.035, 4.0 + sx * 0.25, 0, -hd + 0.4, 4.0 + sx * 0.25, WALL_H + 0.2, -hd + 0.12, 6);
  for (let y = 0.3; y < WALL_H; y += 0.32) p.box(WOOD, 0.5, 0.04, 0.05, 4.0, y, -hd + 0.4 - (y / (WALL_H + 0.2)) * 0.28);

  // The bell rope, down from the bells far above, with its woolly sally to hold.
  const rope = works.rope;
  rope.position.set(BELL_ROPE.x, 0, BELL_ROPE.z);
  rope.add(
    part((q) => {
      q.cyl('#c9b48a', 0.022, 14 - 0.95, 0, (14 + 0.95) / 2, 0, 6);
      ['#b8323a', '#f2ece0', '#2f4f8f', '#f2ece0', '#b8323a', '#f2ece0', '#2f4f8f'].forEach((c, k) => q.cyl(c, 0.06, 0.09, 0, 1.3 + k * 0.09, 0, 10));
      q.sphere('#c9b48a', 0.05, 0.045, 0.05, 0, 0.95, 0);
    }),
  );
  moving.add(rope);

  // The clockmaker's bench along the left wall.
  const B = WORKBENCH;
  p.block(WOOD, B.hw * 2, 0.08, B.hd * 2, B.x, B.top - 0.08, B.z);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) p.box(WOOD_DARK, 0.08, B.top - 0.08, 0.08, B.x + sx * (B.hw - 0.08), (B.top - 0.08) / 2, B.z + sz * (B.hd - 0.1));
  p.box(WOOD_DARK, B.hw * 2 - 0.1, 0.04, B.hd * 2 - 0.2, B.x, 0.25, B.z);
  crate(p.at(B.x, 0.27, B.z + 0.5), r, 0.42);
  // A vice, an oil can, loose wheels, and a little clock being mended.
  const top0 = B.top;
  p.box(IRON, 0.16, 0.12, 0.2, B.x + 0.25, top0 + 0.06, B.z - 0.85);
  p.box(IRON, 0.05, 0.14, 0.24, B.x + 0.36, top0 + 0.07, B.z - 0.85);
  p.rod(STEEL, 0.012, B.x + 0.4, top0 + 0.08, B.z - 0.98, B.x + 0.4, top0 + 0.08, B.z - 0.72, 6);
  p.taper('#4f7a5a', 0.06, 0.1, 0.16, B.x - 0.1, top0, B.z - 0.45, 12);
  p.rod('#4f7a5a', 0.01, B.x - 0.1, top0 + 0.16, B.z - 0.45, B.x + 0.05, top0 + 0.3, B.z - 0.4, 6);
  [
    [0.1, -0.1, 0.11, BRASS],
    [-0.15, 0.15, 0.08, STEEL],
    [0.15, 0.25, 0.06, BRASS],
  ].forEach(([dx, dz, rr, c]) => {
    const x = B.x + (dx as number);
    const z = B.z + (dz as number);
    p.cyl(c as string, rr as number, 0.015, x, top0 + 0.008, z, 14);
    p.cyl(shade(c as string, -0.3), (rr as number) * 0.3, 0.02, x, top0 + 0.01, z, 10);
  });
  const mend = p.at(B.x + 0.05, top0, B.z + 0.55, Math.PI / 2);
  mend.rbox(WOOD_DARK, 0.34, 0.4, 0.16, 0, 0.2, 0, 0.03);
  mend.cyl('#f3ead6', 0.12, 0.02, 0, 0.24, 0.085, 20, Math.PI / 2);
  mend.torus(BRASS, 0.12, 0.012, 0, 0.24, 0.095);
  mend.box(NUMERAL, 0.012, 0.09, 0.01, 0, 0.27, 0.1);
  mend.box(NUMERAL, 0.012, 0.06, 0.01, 0.02, 0.23, 0.1, 0, 0, -1.2);
  candle(p, glow, B.x + 0.1, top0, B.z + 0.95, 0.22);
  // Tools hung on a board above it.
  p.box(WOOD_LIGHT, 0.04, 0.7, 1.7, -hw + 0.13, 1.75, B.z);
  for (let k = 0; k < 5; k++) {
    const z = B.z - 0.6 + k * 0.3;
    const len = 0.3 + (k % 2) * 0.12;
    p.box(k % 2 ? IRON : STEEL, 0.03, len, 0.04, -hw + 0.17, 1.95 - len / 2, z);
    p.box(k % 2 ? WOOD_DARK : '#8a2f3a', 0.04, 0.12, 0.06, -hw + 0.17, 1.95 - len - 0.04, z);
  }
  // Its stool.
  const S = WORK_STOOL;
  p.cyl(WOOD, 0.2, 0.06, S.x, 0.59, S.z, 14);
  for (let k = 0; k < 3; k++) {
    const a = (k / 3) * Math.PI * 2;
    p.rod(WOOD_DARK, 0.025, S.x + Math.cos(a) * 0.12, 0.57, S.z + Math.sin(a) * 0.12, S.x + Math.cos(a) * 0.2, 0, S.z + Math.sin(a) * 0.2, 6);
  }

  // A bench along the right wall, a spare wheel leaning by it, and crates of parts.
  const T = TOWER_BENCH;
  const len = T.z1 - T.z0;
  p.box(WOOD, 0.5, 0.07, len, T.x, 0.42, (T.z0 + T.z1) / 2);
  p.box(WOOD, 0.06, 0.45, len, hw - 0.12, 0.85, (T.z0 + T.z1) / 2);
  for (const z of [T.z0 + 0.15, T.z1 - 0.15]) p.box(WOOD_DARK, 0.42, 0.4, 0.06, T.x, 0.2, z);
  gear(p.at(hw - 0.13, 0.66, 2.5, -Math.PI / 2), 48, '#8a6a3a', 0.06);
  crate(p.at(4.2, 0, 3.6, 0.2), r, 0.8);
  crate(p.at(4.25, 0.8, 3.6, -0.1), r, 0.5);
  barrel(p.at(3.2, 0, 4.05), r);
  return moving;
}

/**
 * Turns the clock room's parts. The going train steps forward on each beat (once a second, as the pendulum
 * passes the middle) and rests between; the hands show the time; `ring` (-1 to 1) tugs the bell rope.
 */
const BEAT_FROM = Math.floor(Date.now() / 1000) * 1000;
export function turnClockwork(c: Clockwork, ring: number) {
  const now = Date.now();
  const d = new Date(now);
  const hr = ((d.getHours() % 12) + d.getMinutes() / 60) / 12;
  const mn = (d.getMinutes() + d.getSeconds() / 60) / 60;
  // Seen from inside, the hands go round the other way.
  for (const h of c.hands) {
    h.hour.rotation.z = hr * Math.PI * 2;
    h.minute.rotation.z = mn * Math.PI * 2;
  }
  const sec = (now - BEAT_FROM) / 1000;
  const beat = Math.floor(sec);
  const f = Math.min(1, (sec - beat) / 0.12);
  const turned = (beat + f * f * (3 - 2 * f)) * (Math.PI / 15);
  for (const g of c.gears) g.obj.rotation.z = g.phase + g.rate * turned;
  c.pendulum.rotation.z = 0.1 * Math.sin(Math.PI * sec);
  c.rope.position.y = ring * 0.35;
}

// ---------------------------------------------------------------- home

function home(p: Paint, glow: Builder, r: () => number, sign: TextSign, chart: SeatingChart): THREE.Object3D {
  const { hw, hd } = ROOMS.house;
  shell(p, 'house', { floor: ['#b07a4f', '#a4704a', '#ba845a'], wall: '#f4e4cf', wainscot: '#c9a27a', trim: '#7a5236' }, r);
  // Wallpaper stripes.
  for (let x = -hw + 0.3; x < hw; x += 0.6) p.box('#efd9bf', 0.22, WALL_H - 1.1, 0.02, x, 1.1 + (WALL_H - 1.1) / 2, -hd + 0.02);
  backWindow(p, 0.5, 2.0, -hd, 1.1, 1.0, '#7a5236');
  // Curtains gathered with tiebacks, on a pole with finials, and a picture beside the window.
  for (const sx of [-1, 1]) {
    const x = 0.5 + sx * 0.78;
    p.box('#d8687a', 0.35, 1.3, 0.06, x, 2.05, -hd + 0.12);
    for (let k = 0; k < 4; k++) p.box(shade('#d8687a', k % 2 ? -0.08 : 0.04), 0.06, 1.3, 0.07, x - 0.13 + k * 0.085, 2.05, -hd + 0.12);
    p.box('#c9a24f', 0.3, 0.06, 0.09, x, 1.7, -hd + 0.12);
    p.cyl('#c9a24f', 0.05, 0.1, x, 1.7, -hd + 0.17, 10, Math.PI / 2);
  }
  p.cyl(WOOD_DARK, 0.03, 2.1, 0.5, 2.72, -hd + 0.12, 8, 0, 0, Math.PI / 2);
  for (const sx of [-1, 1]) p.sphere(WOOD_DARK, 0.06, 0.06, 0.06, 0.5 + sx * 1.08, 2.72, -hd + 0.12, 10, 8);
  p.box('#c9a24f', 0.5, 0.4, 0.04, -1.6, 2.2, -hd + 0.06);
  p.box('#5f8fbf', 0.42, 0.32, 0.045, -1.6, 2.2, -hd + 0.06);
  p.box('#8bc366', 0.42, 0.12, 0.05, -1.6, 2.1, -hd + 0.06);
  p.ico('#f6d55c', 0.04, -1.5, 2.28, -hd + 0.09, 0);
  // The bed.
  const b = p.at(BED.x, 0, BED.z);
  b.block(WOOD, BED.w, 0.3, BED.d, 0, 0.05, 0);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) b.block(WOOD_DARK, 0.1, 0.35, 0.1, sx * (BED.w / 2 - 0.05), 0, sz * (BED.d / 2 - 0.05));
  b.block(WOOD_DARK, BED.w + 0.1, 1.25, 0.12, 0, 0, -BED.d / 2);
  b.cyl(WOOD_DARK, BED.w / 2 + 0.05, 0.12, 0, 1.25, -BED.d / 2, 10, Math.PI / 2);
  b.block('#f6f1e6', BED.w - 0.1, 0.17, BED.d - 0.1, 0, 0.35, 0);
  b.sphere('#ffffff', 0.55, 0.13, 0.28, 0, BED.top + 0.05, -BED.d / 2 + 0.38, 14, 8);
  // Headboard panels and knobs on the posts.
  for (let k = 0; k < 3; k++) b.box(shade(WOOD_DARK, 0.08), 0.42, 0.7, 0.04, (k - 1) * 0.5, 0.75, -BED.d / 2 + 0.06);
  for (const sx of [-1, 1]) b.sphere(WOOD_DARK, 0.08, 0.08, 0.08, sx * (BED.w / 2 - 0.05), 1.4, -BED.d / 2, 10, 8);
  // A patchwork quilt with stitching between the patches, turned down at the top.
  const quilt = ['#f2a7b8', '#8fc1e8', '#f6d55c', '#b494dd', '#7cc28b', '#ff9a62'];
  for (let i = 0; i < 4; i++) for (let k = 0; k < 4; k++) b.box(quilt[(i * 3 + k) % quilt.length], (BED.w - 0.05) / 4, 0.06, 0.4, -BED.w / 2 + 0.03 + ((i + 0.5) * (BED.w - 0.05)) / 4, BED.top + 0.01, -0.35 + k * 0.4);
  for (let i = 1; i < 4; i++) b.box('#f6f1e6', 0.015, 0.012, 1.6, -BED.w / 2 + 0.03 + (i * (BED.w - 0.05)) / 4, BED.top + 0.045, 0.25);
  for (let k = 1; k < 4; k++) b.box('#f6f1e6', BED.w - 0.05, 0.012, 0.015, 0, BED.top + 0.045, -0.55 + k * 0.4);
  b.box('#e8dcc0', BED.w + 0.02, 0.2, 0.06, 0, BED.top - 0.08, BED.d / 2 - 0.28);
  b.box('#f6f1e6', BED.w - 0.05, 0.03, 0.3, 0, BED.top + 0.05, -0.7);
  // A teddy sitting on the pillow, and slippers on the floor beside the bed.
  const ted = b.at(0.45, BED.top + 0.08, -BED.d / 2 + 0.5, 0.4);
  ted.sphere('#c49a6c', 0.1, 0.11, 0.09, 0, 0.1, 0);
  ted.sphere('#c49a6c', 0.085, 0.08, 0.08, 0, 0.26, 0.01);
  ted.sphere('#e8c8a0', 0.045, 0.035, 0.03, 0, 0.23, 0.08, 8, 6);
  for (const sx of [-1, 1]) {
    ted.sphere('#c49a6c', 0.035, 0.035, 0.02, sx * 0.07, 0.33, 0, 8, 6);
    ted.sphere('#c49a6c', 0.035, 0.08, 0.035, sx * 0.1, 0.12, 0.03, 8, 6);
    ted.sphere('#c49a6c', 0.04, 0.035, 0.07, sx * 0.07, 0.03, 0.08, 8, 6);
    ted.sphere('#2a2530', 0.012, 0.012, 0.012, sx * 0.03, 0.28, 0.075, 6, 4);
  }
  ted.box('#a8463f', 0.12, 0.03, 0.03, 0, 0.19, 0.06);
  for (const sx of [-1, 1]) {
    b.sphere('#8a5a7a', 0.07, 0.03, 0.14, -BED.w / 2 - 0.25 + sx * 0.09, 0.03, 0.4, 10, 6);
    b.sphere('#f2a7b8', 0.07, 0.03, 0.05, -BED.w / 2 - 0.25 + sx * 0.09, 0.055, 0.32, 10, 6);
  }
  // Bedside table with a drawer, a lamp with a fringed shade, and a book.
  p.block(WOOD, 0.6, 0.6, 0.5, 4.45, 0, -3.5);
  p.box(shade(WOOD, -0.1), 0.46, 0.18, 0.02, 4.45, 0.42, -3.24);
  p.sphere('#c9a24f', 0.025, 0.025, 0.025, 4.45, 0.42, -3.22, 8, 6);
  p.box(shade(WOOD, 0.06), 0.64, 0.04, 0.54, 4.45, 0.62, -3.5);
  p.post('#d8a845', 0.04, 0.3, 4.45, 0.6, -3.5, 8);
  p.cyl('#d8a845', 0.09, 0.02, 4.45, 0.65, -3.5, 12);
  p.taper('#f6d9a8', 0.6, 0.18, 0.22, 4.45, 0.88, -3.5, 14);
  p.torus('#e8b878', 0.18, 0.012, 4.45, 0.89, -3.5, Math.PI / 2);
  p.box('#3f6f9a', 0.2, 0.04, 0.26, 4.3, 0.66, -3.3, 0, 0.3, 0);
  glow.add(new THREE.IcosahedronGeometry(0.08, 1), '#ffe2a0', { pos: [4.45, 0.92, -3.5] });
  haloAt(p, 4.45, 0.92, -3.5, 1.0, '#ffd890', true);
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
  // A big oval rug with a fringe, and a potted plant in a glazed pot.
  p.sphere('#7cc28b', 1.8, 0.02, 1.2, 0.4, 0.02, 0.7, 24, 2);
  p.sphere('#f6efe0', 1.5, 0.025, 0.95, 0.4, 0.025, 0.7, 24, 2);
  p.sphere('#f2a7b8', 1.1, 0.03, 0.65, 0.4, 0.03, 0.7, 24, 2);
  for (let k = 0; k < 40; k++) {
    const a = (k / 40) * Math.PI * 2;
    p.box('#e8dcc0', 0.04, 0.015, 0.14, 0.4 + Math.cos(a) * 1.86, 0.015, 0.7 + Math.sin(a) * 1.26, 0, -a + Math.PI / 2, 0);
  }
  p.taper('#c06a48', 1.3, 0.28, 0.45, 4.5, 0, 1.6, 14);
  p.torus('#a8503a', 0.36, 0.03, 4.5, 0.45, 1.6, Math.PI / 2);
  p.cyl('#5e4130', 0.33, 0.02, 4.5, 0.45, 1.6, 14);
  for (let k = 0; k < 7; k++) {
    const a = (k / 7) * Math.PI * 2;
    p.sphere('#5f9e47', 0.16, 0.42, 0.1, 4.5 + Math.cos(a) * 0.2, 0.85, 1.6 + Math.sin(a) * 0.2, 8, 6);
    p.rod('#4f8f45', 0.012, 4.5, 0.5, 1.6, 4.5 + Math.cos(a) * 0.2, 0.85, 1.6 + Math.sin(a) * 0.2, 4);
  }
  // A coat hook by the door with a coat and a hat on it, a mirror, and a little clock with hands.
  p.box(WOOD_DARK, 0.9, 0.08, 0.06, -2.2, 1.9, hd - 0.1);
  for (let k = 0; k < 3; k++) p.rod(IRON, 0.012, -2.5 + k * 0.3, 1.86, hd - 0.1, -2.5 + k * 0.3, 1.8, hd - 0.2, 4);
  p.box('#3f6f9a', 0.3, 0.6, 0.08, -2.2, 1.5, hd - 0.2);
  p.sphere('#8a5a36', 0.14, 0.05, 0.14, -2.5, 1.9, hd - 0.2, 12, 6);
  p.cyl('#8a5a36', 0.09, 0.08, -2.5, 1.94, hd - 0.2, 12);
  p.box(WOOD_DARK, 0.5, 0.7, 0.04, -3.6, 2.0, -hd + 0.05);
  p.box('#cfe0ec', 0.42, 0.62, 0.045, -3.6, 2.0, -hd + 0.05);
  p.cyl('#c9a24f', 0.2, 0.05, -1.0, 2.5, -hd + 0.05, 16, Math.PI / 2);
  p.cyl('#f6efe0', 0.16, 0.06, -1.0, 2.5, -hd + 0.06, 16, Math.PI / 2);
  p.box('#2a2530', 0.02, 0.1, 0.01, -1.0, 2.55, -hd + 0.095);
  p.box('#2a2530', 0.02, 0.07, 0.01, -1.03, 2.52, -hd + 0.095, 0, 0, 1.0);
  for (let k = 0; k < 12; k++) {
    const a = (k / 12) * Math.PI * 2;
    p.box('#2a2530', 0.012, 0.025, 0.008, -1.0 + Math.sin(a) * 0.13, 2.5 + Math.cos(a) * 0.13, -hd + 0.095, 0, 0, -a);
  }
  // The owner's name, embroidered on a hoop above the bed.
  const hoop = new THREE.Group();
  const face = new THREE.Mesh(
    new THREE.CircleGeometry(0.55, 24),
    new THREE.MeshLambertMaterial({ map: sign.texture, emissive: '#ffffff', emissiveMap: sign.texture, emissiveIntensity: 0.25 }),
  );
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.57, 0.04, 10, 32), new THREE.MeshLambertMaterial({ color: '#c49a6c' }));
  // A little brass hook it hangs from.
  const hook = new THREE.Mesh(new THREE.TorusGeometry(0.05, 0.012, 6, 12, Math.PI), new THREE.MeshLambertMaterial({ color: '#c9a24f' }));
  hook.position.set(0, 0.6, -0.03);
  hoop.add(face, ring, hook);
  // Out in front of the picture rail (which stands 6 cm off the wall), so the rail doesn't cut across the name.
  hoop.position.set(BED.x, 2.3, -hd + 0.11);
  // Who sits where round the circle, framed on the wall above the bedside table, where it's in view from the bed,
  // and lit enough to read at night. Out in front of the picture rail, like the hoop.
  const chartFrame = new THREE.Group();
  const board = new THREE.Mesh(new THREE.BoxGeometry(1.06, 1.06, 0.04), new THREE.MeshLambertMaterial({ color: '#6a4228' }));
  const paper = new THREE.Mesh(
    new THREE.PlaneGeometry(0.97, 0.97),
    new THREE.MeshLambertMaterial({ map: chart.texture, emissive: '#ffffff', emissiveMap: chart.texture, emissiveIntensity: 0.45 }),
  );
  paper.position.z = 0.03;
  chartFrame.add(board, paper);
  chartFrame.position.set(4.36, 2.08, -hd + 0.11);
  const extra = new THREE.Group();
  extra.add(hoop, chartFrame, nightWindow(0.5, 2.0, -hd + 0.093, 1.1, 1.0));
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

// ---------------------------------------------------------------- the casino

const FELT = '#2f7a4f';
const RAIL = '#5a2a2a';
const GOLD = '#d8b04a';
const VELVET = '#a3304a';
/** A half disc, flat edge along x through the middle and round towards +z (the blackjack table). */
const HALF_DISC = new THREE.CylinderGeometry(1, 1, 1, 40, 1, false, -Math.PI / 2, Math.PI);

/** A chandelier of brass arms and glass drops, with candles all round. */
function chandelier(p: Paint, glow: Builder, x: number, y: number, z: number) {
  for (let k = 0; k < 5; k++) p.torus(GOLD, 0.035, 0.008, x, y + 0.5 + k * 0.1, z, 0, k % 2 ? Math.PI / 2 : 0);
  p.sphere(GOLD, 0.12, 0.1, 0.12, x, y + 0.35, z);
  p.torus(GOLD, 0.45, 0.02, x, y + 0.2, z, Math.PI / 2);
  for (let k = 0; k < 6; k++) {
    const a = (k / 6) * Math.PI * 2;
    const cx = x + Math.cos(a) * 0.45;
    const cz = z + Math.sin(a) * 0.45;
    p.rod(GOLD, 0.012, x, y + 0.33, z, cx, y + 0.2, cz, 6);
    p.cyl(GOLD, 0.04, 0.03, cx, y + 0.22, cz, 10);
    p.post('#fff6e0', 0.02, 0.1, cx, y + 0.23, cz, 8);
    glow.add(new THREE.ConeGeometry(0.025, 0.07, 6), '#ffd76b', { pos: [cx, y + 0.37, cz] }, p.m);
    p.glass.sphere('#e8f4ff', 0.025, 0.045, 0.025, x + Math.cos(a + 0.5) * 0.33, y + 0.06, z + Math.sin(a + 0.5) * 0.33, 6, 4);
  }
  p.glass.sphere('#e8f4ff', 0.06, 0.1, 0.06, x, y + 0.05, z, 8, 6);
  haloAt(p, x, y + 0.3, z, 1.8, '#ffd27a');
}

function velvetChair(p: Paint) {
  // Faces +z. A gold frame, a red seat, and a round back.
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) p.cyl(GOLD, 0.025, 0.42, sx * 0.19, 0.21, sz * 0.19, 8);
  p.rbox(VELVET, 0.48, 0.1, 0.48, 0, 0.47, 0, 0.04);
  p.box(GOLD, 0.5, 0.03, 0.5, 0, 0.42, 0);
  for (const sx of [-1, 1]) p.box(GOLD, 0.04, 0.5, 0.04, sx * 0.2, 0.7, -0.22);
  p.sphere(VELVET, 0.24, 0.22, 0.06, 0, 0.82, -0.23);
  p.torus(GOLD, 0.235, 0.015, 0, 0.82, -0.2, 0, 0);
}

function slotMachine(p: Paint, glow: Builder, r: () => number) {
  // Faces +z: a cabinet with three reels behind glass, a lit crown on top, and a lever on its right.
  const body = pick(r, ['#c0392b', '#2e6fa8', '#7a3fa0']);
  p.rbox(body, 0.75, 1.35, 0.6, 0, 0.68, 0, 0.05);
  p.box(GOLD, 0.78, 0.06, 0.63, 0, 1.0, 0);
  p.box('#1d1a24', 0.6, 0.32, 0.04, 0, 1.18, 0.3);
  for (let k = 0; k < 3; k++) {
    p.box('#fff8e8', 0.16, 0.26, 0.03, (k - 1) * 0.19, 1.18, 0.32);
    p.ico(pick(r, ['#e0605a', '#f2c14e', '#6fbf73', '#6f8fe0']), 0.045, (k - 1) * 0.19, 1.18, 0.34, 0);
  }
  p.dome(GOLD, 0.32, 0, 1.36, 0, 0.6, 16);
  glow.add(new THREE.IcosahedronGeometry(0.11, 1), '#ffe08a', { pos: [0, 1.5, 0.05] }, p.m);
  haloAt(p, 0, 1.5, 0.1, 0.9, '#ffcf6a');
  p.box('#1d1a24', 0.5, 0.1, 0.12, 0, 0.82, 0.32);
  p.cyl(GOLD, 0.03, 0.4, 0.44, 1.05, 0, 8);
  p.sphere('#e0605a', 0.07, 0.07, 0.07, 0.44, 1.28, 0);
}

function pottedPalm(p: Paint, r: () => number) {
  p.taper('#c9a24f', 1.2, 0.26, 0.5, 0, 0, 0, 14);
  p.cyl('#4a3424', 0.27, 0.03, 0, 0.5, 0, 14);
  p.post('#8a6a42', 0.05, 1.4, 0, 0.5, 0, 8);
  for (let k = 0; k < 7; k++) {
    const a = (k / 7) * Math.PI * 2 + r();
    p.box('#3f8a4a', 0.12, 0.03, 0.75, Math.cos(a) * 0.32, 1.85, Math.sin(a) * 0.32, 0.5, Math.PI / 2 - a, 0);
  }
}

function casino(p: Paint, glow: Builder, r: () => number): THREE.Object3D {
  const { hw, hd } = ROOMS.casino;
  shell(p, 'casino', { floor: ['#7a1f33', '#5e1828'], wall: '#2f5a48', wainscot: '#4a2a22', trim: GOLD, tiles: true }, r);
  // A gold diamond in the middle of every carpet square.
  for (let x = -hw + 0.5; x < hw; x += 1) for (let z = -hd + 0.5; z < hd; z += 1) p.box(shade(GOLD, -0.15), 0.18, 0.012, 0.18, x, 0.006, z, 0, Math.PI / 4, 0);
  // Damask: rows of little gold diamonds up the walls.
  for (let x = -hw + 0.6; x < hw - 0.3; x += 0.9) for (let y = 1.4; y < WALL_H - 0.9; y += 0.6) p.box(shade('#2f5a48', 0.12), 0.12, 0.12, 0.02, x + (y * 2.2) % 0.45, y, -hd + 0.02, 0, 0, Math.PI / 4);
  for (const sx of [-1, 1]) for (let z = -hd + 0.6; z < hd - 0.6; z += 0.9) for (let y = 1.4; y < WALL_H - 0.9; y += 0.6) p.box(shade('#2f5a48', 0.08), 0.02, 0.12, 0.12, sx * (hw - 0.02), y, z + (y * 2.2) % 0.45, Math.PI / 4, 0, 0);

  // The wheel of fortune on the back wall, between the shop and the blackjack table.
  {
    const w = p.at(0.6, 2.05, -hd + 0.12);
    w.cyl('#3a2418', 0.95, 0.08, 0, 0, 0, 32, Math.PI / 2);
    const cols = ['#c0392b', '#1d1a24', '#c0392b', '#1d1a24', '#2f7a4f'];
    for (let k = 0; k < 20; k++) {
      const a = (k / 20) * Math.PI * 2;
      w.box(cols[k % cols.length], 0.24, 0.66, 0.03, Math.sin(a) * 0.5, Math.cos(a) * 0.5, 0.05, 0, 0, -a);
      w.sphere('#fff1b0', 0.03, 0.03, 0.03, Math.sin(a) * 0.9, Math.cos(a) * 0.9, 0.06, 6, 4);
    }
    w.torus(GOLD, 0.88, 0.03, 0, 0, 0.06, 0, 0);
    w.cyl(GOLD, 0.14, 0.08, 0, 0, 0.08, 16, Math.PI / 2);
    w.cone(GOLD, 0.08, 0.22, 0, 0.92, 0.1, 4, 0);
    haloAt(w, 0, 0, 0.3, 2.4, '#ffcf6a');
  }

  // The shop: a counter with a glass case of treats and toys, shelves of pet beds behind, and a till.
  {
    const s = p.at(SHOP.x, 0, SHOP.z);
    s.block('#4a2a22', SHOP.w, SHOP.h - 0.08, SHOP.d, 0, 0, 0);
    for (let x = -SHOP.w / 2 + 0.45; x < SHOP.w / 2; x += 0.75) s.box(shade('#4a2a22', 0.1), 0.55, 0.6, 0.03, x, 0.5, SHOP.d / 2 + 0.01);
    s.rbox(GOLD, SHOP.w + 0.12, 0.08, SHOP.d + 0.12, 0, SHOP.h - 0.04, 0, 0.02);
    s.glass.box('#dff0ff', 1.6, 0.35, 0.6, -1.1, SHOP.h + 0.18, 0);
    for (let k = 0; k < 5; k++) s.ico(pick(r, ['#f2a7b8', '#8fc1e8', '#f2cf5b', '#7cc28b']), 0.06, -1.7 + k * 0.3, SHOP.h + 0.08, (k % 2) * 0.15 - 0.05, 1);
    s.box('#7a5a3a', 0.5, 0.3, 0.4, 1.3, SHOP.h + 0.15, 0);
    s.block(GOLD, 0.42, 0.12, 0.28, 1.3, SHOP.h + 0.3, -0.05);
    s.sphere('#e8c35a', 0.05, 0.05, 0.05, 0.7, SHOP.h + 0.05, 0.2);
    // The cashier's step behind the counter.
    s.block('#3a2418', 1.4, 0.3, 0.7, 0, 0, -1.05);
    // A little brass bell to ring for service.
    s.dome(GOLD, 0.08, 0.4, SHOP.h, 0.1, 1, 12);
    s.sphere(GOLD, 0.015, 0.015, 0.015, 0.4, SHOP.h + 0.09, 0.1, 6, 4);
    // Shelves on the back wall, with cushions for pets and toys.
    for (const y of [1.25, 1.85]) {
      s.box('#4a2a22', SHOP.w, 0.06, 0.4, 0, y, -1.65);
      for (let k = 0; k < 4; k++) {
        const x = -SHOP.w / 2 + 0.6 + k * 1.15;
        s.sphere(pick(r, ['#8fc1e8', '#f2a7b8', '#b494dd', '#f2cf5b']), 0.24, 0.07, 0.17, x, y + 0.08, -1.65, 12, 6);
      }
    }
  }

  // The blackjack table: a half moon of green felt with a padded rail, a chip tray by the dealer, and a shoe.
  {
    const t = p.at(BJ_TABLE.x, 0, BJ_TABLE.z);
    t.geo(HALF_DISC, RAIL, placeMatrix({ pos: [0, FELT_Y - 0.06, 0], scale: [BJ_TABLE.r + 0.12, 0.12, BJ_TABLE.r + 0.12] }));
    t.geo(HALF_DISC, FELT, placeMatrix({ pos: [0, FELT_Y - 0.01, 0], scale: [BJ_TABLE.r - 0.05, 0.03, BJ_TABLE.r - 0.05] }));
    t.box(RAIL, (BJ_TABLE.r + 0.12) * 2, 0.16, 0.12, 0, FELT_Y - 0.04, -0.03);
    t.box('#3a2418', 2.2, FELT_Y - 0.1, 0.5, 0, (FELT_Y - 0.1) / 2, 0.45);
    t.cyl('#3a2418', 0.3, FELT_Y - 0.1, 0, (FELT_Y - 0.1) / 2, 0.9, 14);
    t.box('#2a1a12', 1.0, 0.04, 0.22, 0, FELT_Y + 0.005, 0.16);
    for (let k = 0; k < 6; k++) t.box(['#f4efe6', '#e0605a', '#5fae6a', '#2a2a30'][k % 4], 0.12, 0.03, 0.18, -0.4 + k * 0.16, FELT_Y + 0.03, 0.16);
    t.rbox('#6a1f2f', 0.2, 0.14, 0.32, 0.75, FELT_Y + 0.07, 0.25, 0.03);
    for (let i = 0; i < BJ_SEATS; i++) {
      const c = bjSeat(i);
      velvetChair(p.at(c.x, 0, c.z, c.ry));
    }
    chandelier(p, glow, BJ_TABLE.x, 2.5, BJ_TABLE.z + 0.9);
    // The dealer's spot: a step behind the table.
    p.block('#3a2418', 1.8, STEP, 0.7, BJ_DEALER.x, 0, BJ_DEALER.z - 0.1);
  }

  // The poker table: an oval of felt on one pedestal, a padded rail, and velvet chairs all round.
  {
    const { x, z, rx, rz } = PK_TABLE;
    p.geo(G.cyl(40), RAIL, placeMatrix({ pos: [x, FELT_Y - 0.06, z], scale: [rx + 0.12, 0.12, rz + 0.12] }));
    p.geo(G.cyl(40), '#8a2f3a', placeMatrix({ pos: [x, FELT_Y - 0.01, z], scale: [rx - 0.05, 0.03, rz - 0.05] }));
    p.taper('#3a2418', 1.6, 0.35, FELT_Y - 0.12, x, 0, z, 14);
    p.cyl('#3a2418', 0.8, 0.06, x, 0.03, z, 18);
    for (let i = 0; i < PK_SEATS; i++) {
      const c = pkSeat(i);
      velvetChair(p.at(c.x, 0, c.z, c.ry));
    }
    chandelier(p, glow, x, 2.5, z);
    p.block('#3a2418', 0.9, STEP, 0.7, PK_DEALER.x, 0, PK_DEALER.z - 0.05);
  }

  // The roulette table: a long green table on turned legs, with the wheel's bowl at the right-hand end (the wheel
  // itself turns, so it's drawn with the cards and chips) and velvet chairs along the front and at the far end.
  {
    const { x, z, hw, hd } = RL_TABLE;
    p.rbox(RAIL, hw * 2 + 0.2, 0.12, hd * 2 + 0.2, x, FELT_Y - 0.08, z, 0.05);
    // (A touch lower than the card tables' felt: the betting board lies on it.)
    p.box(FELT, hw * 2 - 0.08, 0.03, hd * 2 - 0.08, x, FELT_Y - 0.022, z);
    p.block('#3a2418', hw * 2 - 0.3, 0.14, hd * 2 - 0.3, x, FELT_Y - 0.26, z);
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
      p.post('#3a2418', 0.07, FELT_Y - 0.12, x + sx * (hw - 0.2), 0, z + sz * (hd - 0.15), 10);
      p.sphere(GOLD, 0.08, 0.05, 0.08, x + sx * (hw - 0.2), 0.05, z + sz * (hd - 0.15), 10, 6);
    }
    for (let i = 0; i < RL_SEATS; i++) {
      const c = rlSeat(i);
      velvetChair(p.at(c.x, 0, c.z, c.ry));
    }
    chandelier(p, glow, x, 2.5, z);
    p.block('#3a2418', 1.0, STEP, 0.7, RL_CROUPIER.x, 0, RL_CROUPIER.z - 0.05);
  }
  for (const sl of SLOTS) slotMachine(p.at(sl.x, 0, sl.z, -Math.PI / 2), glow, r);
  for (const [x, z] of [
    [-8.3, 5.9],
    [8.3, 5.9],
    [8.3, -6.3],
    [-0.9, -6.3],
  ])
    pottedPalm(p.at(x, 0, z), r);
  // A red carpet from the door.
  p.box('#b0283f', 1.4, 0.02, 3.2, 0, 0.012, hd - 1.9);
  for (const sx of [-1, 1]) p.box(GOLD, 0.06, 0.022, 3.2, sx * 0.67, 0.013, hd - 1.9);
  // Lamps on the walls.
  for (const [x, z, ry] of [
    [-hw + 0.15, -1.5, Math.PI / 2],
    [-hw + 0.15, 3.5, Math.PI / 2],
    [hw - 0.15, -2.5, -Math.PI / 2],
  ]) {
    const l = p.at(x, 2.1, z, ry);
    l.box(GOLD, 0.12, 0.25, 0.06, 0, 0, 0);
    l.rod(GOLD, 0.015, 0, 0, 0.02, 0, 0.12, 0.22, 6);
    l.glass.cone('#fff1c8', 0.1, 0.16, 0, 0.12, 0.22, 10);
    haloAt(l, 0, 0.2, 0.22, 1.0, '#ffcf6a');
  }

  // Signs: the casino's name over the wheel, and the shop's over its counter.
  const signs = new THREE.Group();
  const name = new TextSign({ w: 1024, h: 256, bg: '#1d1a24', fg: '#f6d77a', border: GOLD, round: true }, ['The Lucky Raven']);
  const n = signBoard(name, 3.0, 0.75, { lit: true });
  n.mesh.position.set(0.6, 3.0, -hd + 0.18);
  const shop = new TextSign({ w: 768, h: 192, bg: '#f6ead2', fg: '#7a1f33', border: GOLD, round: true }, ['🐾 Pet Shop']);
  const sh = signBoard(shop, 2.2, 0.55, { lit: true });
  sh.mesh.position.set(SHOP.x, 2.7, -hd + 0.18);
  const bjSign = new TextSign({ w: 768, h: 192, bg: '#1d1a24', fg: '#f6d77a', border: GOLD, round: true }, ['Blackjack · pays 3 to 2']);
  const bs = signBoard(bjSign, 2.2, 0.55, { lit: true });
  bs.mesh.position.set(BJ_TABLE.x, 2.75, -hd + 0.18);
  signs.add(n.mesh, sh.mesh, bs.mesh);
  return signs;
}

// ---------------------------------------------------------------- assembly

export function buildInteriors(): Interiors {
  const glassMaterial = new THREE.MeshBasicMaterial({ vertexColors: true });
  const glowMaterial = new THREE.MeshBasicMaterial({ vertexColors: true });
  const clockwork: Clockwork = { hands: [], gears: [], pendulum: new THREE.Group(), rope: new THREE.Group() };
  const ownerSign = new TextSign({ w: 512, h: 512, bg: '#fbf4e6', fg: '#b8506a', round: true, italic: false, size: 120 }, ['Home', 'sweet home']);
  const seatingChart = new SeatingChart();
  const halos: Partial<Record<Room, Glows>> = {};
  const make = (room: Room, fill: (p: Paint, glow: Builder, r: () => number) => THREE.Object3D | void): THREE.Group => {
    const main = new Builder();
    const glass = new Builder();
    const glow = new Builder();
    const p = new Paint({ main, glass });
    haloSpots = [];
    const extra = fill(p, glow, rng(room.length * 97 + 3));
    halos[room] = haloSpots.length ? makeGlows(haloSpots) : undefined;
    const g = new THREE.Group();
    g.name = room;
    if (halos[room]) g.add(halos[room].mesh);
    g.add(smoothMesh(main, matte()));
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
    tower: {
      group: make('tower', (p, glow, r) => tower(p, glow, r, clockwork)),
      hemi: { sky: '#efe8f6', ground: '#5a4e46', intensity: 1.0 },
      sun: { color: '#fff4e0', intensity: 1.1, dir: [0.2, 1, 0.6] },
      lights: [
        // Daylight (or the dial lamps at night) through the back of the faces, and a candle at the bench.
        { pos: [0, BACK_DIAL.y, -3.9], color: '#fff2d8', intensity: 12, distance: 9 },
        { pos: [-4.0, SIDE_DIAL.y, SIDE_DIAL.z], color: '#fff2d8', intensity: 6, distance: 6 },
        { pos: [4.0, SIDE_DIAL.y, SIDE_DIAL.z], color: '#fff2d8', intensity: 6, distance: 6 },
        { pos: [WORKBENCH.x + 0.4, 1.4, WORKBENCH.z + 0.9], color: '#ffb35a', intensity: 7, distance: 6, flicker: true },
      ],
    },
    house: {
      group: make('house', (p, glow, r) => home(p, glow, r, ownerSign, seatingChart)),
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
    casino: {
      group: make('casino', casino),
      hemi: { sky: '#ffe2c8', ground: '#5a2a30', intensity: 1.05 },
      sun: { color: '#ffe0b8', intensity: 1.15, dir: [0.3, 1, 0.6] },
      lights: [
        { pos: [PK_TABLE.x, 2.3, PK_TABLE.z], color: '#ffd48a', intensity: 16, distance: 9 },
        { pos: [BJ_TABLE.x, 2.3, BJ_TABLE.z + 0.9], color: '#ffd48a', intensity: 15, distance: 9 },
        { pos: [SHOP.x, 2.4, SHOP.z + 1.2], color: '#ffe2a8', intensity: 9, distance: 7 },
        { pos: [RL_TABLE.x, 2.3, RL_TABLE.z], color: '#ffd48a', intensity: 13, distance: 8 },
      ],
    },
  };
  for (const room of Object.keys(rooms) as Room[]) rooms[room].glows = halos[room];
  const curtains = boothCurtains();
  rooms.church.group.add(curtains.group);
  return { rooms, glassMaterial, ownerSign, seatingChart, clockwork, boothCurtains: curtains };
}
