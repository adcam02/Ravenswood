import { BEDS, BED_SPOTS, LINES, LINE_SLOTS, type Collider, type Door, type Spot, type Station, type ZoneKind } from '../types';
import { local } from './kit';

/**
 * Where everything in Ravenswood stands. Metres, y up, north is -z (away from the camera).
 * A facing (ry) of 0 looks towards +z; buildings face the way their front door does.
 */

export const TOWN_R = 36;
export const SQUARE_R = 11;
/** The meeting circle sits in front of the tower (towards the camera), so nobody is hidden behind it. */
export const MEETING_CENTRE = { x: 0, z: 7.6 };
export const STOOL_R = 4.2;
/** Anyone this close to the tower counts as being at the meeting. */
export const MEETING_R = 12.5;
export const HOUSE_R = 29;
export const RING_ROAD_R = 25.5;
export const HOUSES = 20;
/** The gallows, just to the side of the meeting circle, facing it. */
export const GALLOWS = { x: 8.0, z: 7.4, ry: -Math.PI / 2 };
/** The churchyard beside the church. */
export const GRAVEYARD = { x: -8, z: -23, hw: 2.2, hd: 5.6 };

export const face = (fromX: number, fromZ: number, toX: number, toZ: number) => Math.atan2(toX - fromX, toZ - fromZ);

/** Clockwise from north (seen from above), the same order as the Grimoire's seats. */
export function aroundSquare(i: number, n: number, r: number): Spot {
  const a = (i / Math.max(1, n)) * Math.PI * 2;
  const x = r * Math.sin(a);
  const z = -r * Math.cos(a);
  return { x, z, ry: face(x, z, 0, 0) };
}

/** Seat i of n around the meeting circle, facing its middle. */
export function meetingSpot(i: number, n: number): Spot {
  const a = (i / Math.max(1, n)) * Math.PI * 2;
  const x = MEETING_CENTRE.x + STOOL_R * Math.sin(a);
  const z = MEETING_CENTRE.z - STOOL_R * Math.cos(a);
  return { x, z, ry: face(x, z, MEETING_CENTRE.x, MEETING_CENTRE.z) };
}

// ---------------------------------------------------------------- public buildings

export interface Building {
  x: number;
  z: number;
  ry: number;
  /** Width along the building's own x, depth along its own z (the door is on the +z side). */
  w: number;
  d: number;
}

export const CHURCH: Building = { x: 0, z: -23, ry: 0, w: 9, d: 14.4 };
/** The steeple stands in front of the nave; its front face is the church's door. */
export const STEEPLE = { z: 7.2, size: 3.8 };
export const TAVERN: Building = { x: -20, z: 0, ry: Math.PI / 2, w: 11, d: 8 };
export const BAKERY: Building = { x: 20, z: 0, ry: -Math.PI / 2, w: 9, d: 7 };
export const WASHHOUSE = { x: -14, z: 14, w: 7, d: 4 };
export const TUBS = [
  { x: -15.8, z: 13.7 },
  { x: -12.2, z: 13.7 },
];
export const LINE_POS = [
  { z: 18.6, x0: -20, x1: -10 },
  { z: 21.2, x0: -20, x1: -10 },
].slice(0, LINES);
export const LINE_Y = 1.95;

/** Tucked between the square and the ring road, clear of both. */
export const POND = { x: 13.6, z: 14.2, rx: 4.6, rz: 4.2 };
export const DOCK = { x: 13.6, z0: 9, z1: 14.6, w: 2.6 };
export const FISHING = [
  { x: 12.9, z: 13.8 },
  { x: 14.3, z: 13.8 },
];

export const WELL = { x: -6.5, z: -15.5 };
export const NOTICEBOARD = { x: 3.2, z: -13.6 };
export const GATE_Z = TOWN_R + 0.6;

/** Front-door point of a building, `out` metres in front of its front wall. */
export function doorPoint(b: Building, out: number, frontZ = b.d / 2): { x: number; z: number } {
  return local(b.x, b.z, b.ry, 0, frontZ + out);
}

const churchFront = STEEPLE.z + STEEPLE.size / 2;

// ---------------------------------------------------------------- flower beds, benches, lamps

export const BED_LEN = 4.8;
export const BED_DEPTH = 1.5;
export const BED_H = 0.35;

export const beds = Array.from({ length: BEDS }, (_, i) => {
  const a = ((45 + i * 90) * Math.PI) / 180;
  const r = 14;
  const x = r * Math.sin(a);
  const z = -r * Math.cos(a);
  return { x, z, ry: face(x, z, 0, 0) };
});

/** A planting spot in a bed, in world coordinates. */
export function bedSpot(bed: number, spot: number): { x: number; z: number; ry: number } {
  const b = beds[bed];
  const lx = -BED_LEN / 2 + 0.4 + (spot * (BED_LEN - 0.8)) / Math.max(1, BED_SPOTS - 1);
  return { ...local(b.x, b.z, b.ry, lx, 0), ry: b.ry };
}

export const benches = [70, 110, 250, 290].map((deg) => {
  const a = (deg * Math.PI) / 180;
  const r = 9.6;
  const x = r * Math.sin(a);
  const z = -r * Math.cos(a);
  return { x, z, ry: face(x, z, 0, 0) };
});

export const squareLamps = Array.from({ length: 8 }, (_, i) => {
  const a = ((22.5 + i * 45) * Math.PI) / 180;
  return { x: 11.8 * Math.sin(a), z: -11.8 * Math.cos(a) };
});

export const roadLamps = Array.from({ length: 10 }, (_, i) => i)
  .filter((i) => i !== 0 && i !== 5)
  .map((i) => {
    const a = ((i * 36 + 18) * Math.PI) / 180;
    return { x: 23.8 * Math.sin(a), z: -23.8 * Math.cos(a) };
  });

export const pathLamps = [
  { x: 1.9, z: 18.5 },
  { x: -1.9, z: 29 },
  { x: -1.9, z: -14.6 },
  { x: -14, z: 1.9 },
  { x: 14, z: -1.9 },
];

// ---------------------------------------------------------------- cottages

export interface HouseSlot {
  x: number;
  z: number;
  ry: number;
  door: Spot;
}

export const HOUSE_W = 5.2;
export const HOUSE_D = 4.6;

export const houseSlots: HouseSlot[] = Array.from({ length: HOUSES }, (_, i) => {
  const a = (((i + 0.5) * 360) / HOUSES) * (Math.PI / 180);
  const x = HOUSE_R * Math.sin(a);
  const z = -HOUSE_R * Math.cos(a);
  const ry = face(x, z, 0, 0);
  const d = local(x, z, ry, 0, HOUSE_D / 2 + 2.0);
  return { x, z, ry, door: { x: d.x, z: d.z, ry } };
});

// ---------------------------------------------------------------- interiors

export const ROOMS: Record<Exclude<ZoneKind, 'town'>, { hw: number; hd: number }> = {
  tavern: { hw: 8, hd: 6 },
  bakery: { hw: 6, hd: 5 },
  church: { hw: 6, hd: 9 },
  house: { hw: 5, hd: 4 },
};

/** Inside each room: where the exit is, and where you appear when you come in. */
export const ROOM_DOOR: Record<Exclude<ZoneKind, 'town'>, { exit: { x: number; z: number; r: number }; arrive: Spot }> = {
  tavern: { exit: { x: 0, z: 5.3, r: 1.0 }, arrive: { x: 0, z: 3.7, ry: Math.PI } },
  bakery: { exit: { x: 0, z: 4.3, r: 1.0 }, arrive: { x: 0, z: 2.8, ry: Math.PI } },
  church: { exit: { x: 0, z: 8.3, r: 1.0 }, arrive: { x: 0, z: 6.8, ry: Math.PI } },
  house: { exit: { x: 0, z: 3.3, r: 0.9 }, arrive: { x: 0, z: 1.9, ry: Math.PI } },
};

export const BAR = { x0: -6.2, x1: 2.6, z: -2.6, depth: 0.9, h: 1.1 };
export const counterSpot = (i: number) => ({ x: -5.4 + i * 1.45, y: BAR.h + 0.03, z: BAR.z });
export const BAR_STOOLS = [-5.4, -3.6, -1.8, 0, 1.8].map((x) => ({ x, z: -1.5 }));
export const TAVERN_TABLES = [
  { x: -4.6, z: 2.6 },
  { x: 3.0, z: 2.4 },
];
export const tableChairs = (t: { x: number; z: number }) =>
  [0, 1, 2].map((k) => {
    const a = (k / 3) * Math.PI * 2 + Math.PI / 6;
    const x = t.x + Math.sin(a) * 1.25;
    const z = t.z + Math.cos(a) * 1.25;
    return { x, z, ry: face(x, z, t.x, t.z) };
  });

export const OVEN = { x: -3.4, z: -3.9 };
export const SHELF = { x0: 0.8, x1: 5.2, z: -4.55, ys: [0.95, 1.62] };
export const shelfSpot = (s: number) => {
  const per = Math.ceil(8 / SHELF.ys.length);
  const row = Math.floor(s / per) % SHELF.ys.length;
  const col = s % per;
  return { x: SHELF.x0 + 0.55 + col * 1.1, y: SHELF.ys[row] + 0.04, z: SHELF.z + 0.05 };
};

export const PEW_ROWS = [-4.6, -2.6, -0.6, 1.4, 3.4, 5.2];
export const PEW_X = 3.2;
export const PEW_LEN = 3.6;

export const BED = { x: 3.1, z: -2.65, w: 1.7, d: 2.6, top: 0.52 };
export const HOME_TABLE = { x: -2.6, z: 0.7 };
export const HOME_CHAIRS = [
  { x: -3.75, z: 0.7, ry: Math.PI / 2 },
  { x: -1.45, z: 0.7, ry: -Math.PI / 2 },
];

// ---------------------------------------------------------------- doors

export function makeDoors(): Door[] {
  const doors: Door[] = [];
  const pub: [Exclude<ZoneKind, 'town' | 'house'>, Building, number, string][] = [
    ['tavern', TAVERN, TAVERN.d / 2, 'The Raven’s Rest'],
    ['bakery', BAKERY, BAKERY.d / 2, 'Bakery'],
    ['church', CHURCH, churchFront, 'Church'],
  ];
  for (const [kind, b, front, label] of pub) {
    const trigger = doorPoint(b, 0.55, front);
    const outside = doorPoint(b, 2.0, front);
    doors.push({ id: `${kind}-in`, zone: 'town', x: trigger.x, z: trigger.z, r: 1.0, to: kind, spawn: ROOM_DOOR[kind].arrive, label });
    const ex = ROOM_DOOR[kind].exit;
    doors.push({ id: `${kind}-out`, zone: kind, x: ex.x, z: ex.z, r: ex.r, to: 'town', spawn: { ...outside, ry: b.ry }, label: 'Outside' });
  }
  houseSlots.forEach((h, slot) => {
    const trigger = local(h.x, h.z, h.ry, 0, HOUSE_D / 2 + 0.55);
    doors.push({ id: `house-${slot}`, zone: 'town', x: trigger.x, z: trigger.z, r: 1.0, to: 'house', slot, spawn: ROOM_DOOR.house.arrive, label: 'Home' });
  });
  const ex = ROOM_DOOR.house.exit;
  doors.push({ id: 'house-out', zone: 'house', x: ex.x, z: ex.z, r: ex.r, to: 'town', spawn: { x: 0, z: 0, ry: 0 }, label: 'Outside' });
  return doors;
}

// ---------------------------------------------------------------- stations

export function makeStations(): Station[] {
  const st: Station[] = [];
  // Tavern.
  st.push({ id: 'bar', zone: 'tavern', x: -1.8, z: -4.3, r: 2.2, job: 'bartender', stand: { x: -1.8, z: -4.0, ry: 0 }, label: 'Pour a drink' });
  st.push({ id: 'bar-front', zone: 'tavern', x: -1.8, z: -1.0, r: 3.0, job: 'takeDrink', stand: { x: -1.8, z: -1.75, ry: Math.PI }, label: 'Take a drink' });
  BAR_STOOLS.forEach((s, i) =>
    st.push({ id: `stool-${i}`, zone: 'tavern', x: s.x, z: s.z, r: 0.9, job: 'sit', stand: { x: s.x, z: s.z, ry: Math.PI }, y: 0.78, label: 'Sit' }),
  );
  TAVERN_TABLES.forEach((t, ti) =>
    tableChairs(t).forEach((c, i) =>
      st.push({ id: `chair-${ti}-${i}`, zone: 'tavern', x: c.x, z: c.z, r: 0.9, job: 'sit', stand: c, y: 0.47, label: 'Sit' }),
    ),
  );
  // Bakery.
  st.push({ id: 'oven', zone: 'bakery', x: OVEN.x, z: OVEN.z + 1.7, r: 1.8, job: 'baking', stand: { x: OVEN.x, z: OVEN.z + 1.7, ry: Math.PI }, label: 'Bake something' });
  st.push({ id: 'shelf', zone: 'bakery', x: 3.0, z: -3.3, r: 2.0, job: 'takeBread', stand: { x: 3.0, z: -3.4, ry: Math.PI }, label: 'Take a bake' });
  // Church pews.
  PEW_ROWS.forEach((z, row) =>
    [-PEW_X - 0.9, -PEW_X + 0.9, PEW_X - 0.9, PEW_X + 0.9].forEach((x, k) =>
      st.push({ id: `pew-${row}-${k}`, zone: 'church', x, z, r: 0.8, job: 'sit', stand: { x, z, ry: Math.PI }, y: 0.46, label: 'Sit' }),
    ),
  );
  // Home.
  st.push({ id: 'bed', zone: 'house', x: BED.x, z: BED.z + 0.3, r: 1.9, job: 'sleep', stand: { x: BED.x, z: BED.z + 0.25, ry: 0 }, y: BED.top, label: 'Sleep' });
  HOME_CHAIRS.forEach((c, i) => st.push({ id: `home-chair-${i}`, zone: 'house', x: c.x, z: c.z, r: 0.9, job: 'sit', stand: c, y: 0.47, label: 'Sit' }));
  // Town: washing, fishing, gardening, benches.
  TUBS.forEach((t, i) =>
    st.push({ id: `tub-${i}`, zone: 'town', x: t.x, z: t.z - 1.0, r: 1.5, job: 'laundry', stand: { x: t.x, z: t.z - 1.05, ry: 0 }, label: 'Do the washing' }),
  );
  FISHING.forEach((f, i) => st.push({ id: `dock-${i}`, zone: 'town', x: f.x, z: f.z, r: 1.1, job: 'fishing', stand: { x: f.x, z: f.z, ry: 0 }, label: 'Go fishing' }));
  beds.forEach((b, i) => {
    const p = local(b.x, b.z, b.ry, 0, BED_DEPTH / 2 + 0.75);
    st.push({ id: `bed-${i}`, zone: 'town', x: p.x, z: p.z, r: 2.7, job: 'gardening', stand: { x: p.x, z: p.z, ry: b.ry + Math.PI }, bed: i, label: 'Plant a flower' });
  });
  st.push({ id: 'well', zone: 'town', x: WELL.x, z: WELL.z + 1.6, r: 1.5, job: 'well', stand: { x: WELL.x, z: WELL.z + 1.55, ry: Math.PI }, label: 'Draw some water' });
  st.push({ id: 'notice', zone: 'town', x: NOTICEBOARD.x, z: NOTICEBOARD.z + 1.1, r: 1.6, job: 'notice', stand: { x: NOTICEBOARD.x, z: NOTICEBOARD.z + 1.0, ry: Math.PI }, label: 'Read the noticeboard' });
  benches.forEach((b, i) =>
    [-0.5, 0.5].forEach((lx, k) => {
      const p = local(b.x, b.z, b.ry, lx, -0.05);
      st.push({ id: `bench-${i}-${k}`, zone: 'town', x: p.x, z: p.z, r: 0.8, job: 'sit', stand: { x: p.x, z: p.z, ry: b.ry }, y: 0.45, label: 'Sit' });
    }),
  );
  return st;
}

// ---------------------------------------------------------------- colliders

function box(b: Building | { x: number; z: number; ry: number }, hw: number, hd: number, lx = 0, lz = 0): Collider {
  const c = local(b.x, b.z, b.ry, lx, lz);
  return { kind: 'box', x: c.x, z: c.z, hw, hd, rot: b.ry };
}

export function pondContains(x: number, z: number, shrink = 0): boolean {
  const dx = (x - POND.x) / (POND.rx - shrink);
  const dz = (z - POND.z) / (POND.rz - shrink);
  return dx * dx + dz * dz <= 1;
}

export function townColliders(extra: Collider[]): Collider[] {
  const c: Collider[] = [];
  c.push({ kind: 'circle', x: 0, z: 0, r: 2.7 });
  c.push(box(CHURCH, CHURCH.w / 2 + 0.2, CHURCH.d / 2 + 0.2));
  c.push(box(CHURCH, STEEPLE.size / 2 + 0.05, STEEPLE.size / 2 + 0.05, 0, STEEPLE.z));
  c.push(box(TAVERN, TAVERN.w / 2 + 0.15, TAVERN.d / 2 + 0.15));
  c.push(box(BAKERY, BAKERY.w / 2 + 0.15, BAKERY.d / 2 + 0.15));
  for (const h of houseSlots) c.push(box(h, HOUSE_W / 2 + 0.2, HOUSE_D / 2 + 0.2));
  // The pond, as overlapping circles, leaving the dock clear.
  for (let x = POND.x - POND.rx; x <= POND.x + POND.rx; x += 1.6) {
    for (let z = POND.z - POND.rz; z <= POND.z + POND.rz; z += 1.6) {
      if (!pondContains(x, z, 0.9)) continue;
      if (Math.abs(x - DOCK.x) < 1.9 && z < DOCK.z1 + 0.2) continue;
      c.push({ kind: 'circle', x, z, r: 1.15 });
    }
  }
  for (const side of [-1, 1]) c.push({ kind: 'box', x: DOCK.x + side * 1.65, z: 19.9, hw: 0.3, hd: 3.3, rot: 0 });
  // Washhouse posts and tubs, washing line posts.
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) c.push({ kind: 'circle', x: WASHHOUSE.x + sx * (WASHHOUSE.w / 2 - 0.2), z: WASHHOUSE.z + sz * (WASHHOUSE.d / 2 - 0.2), r: 0.25 });
  for (const t of TUBS) c.push({ kind: 'circle', x: t.x, z: t.z, r: 0.75 });
  for (const l of LINE_POS) for (const x of [l.x0, l.x1]) c.push({ kind: 'circle', x, z: l.z, r: 0.2 });
  for (const b of beds) c.push(box(b, BED_LEN / 2, BED_DEPTH / 2));
  for (const b of benches) c.push(box(b, 1.05, 0.35));
  for (const l of [...squareLamps, ...roadLamps, ...pathLamps]) c.push({ kind: 'circle', x: l.x, z: l.z, r: 0.22 });
  c.push({ kind: 'circle', x: WELL.x, z: WELL.z, r: 1.2 });
  c.push({ kind: 'box', x: GALLOWS.x, z: GALLOWS.z, hw: 1.5, hd: 1.5, rot: GALLOWS.ry });
  c.push({ kind: 'box', x: NOTICEBOARD.x, z: NOTICEBOARD.z, hw: 1.0, hd: 0.25, rot: 0 });
  for (const sx of [-1, 1]) c.push({ kind: 'circle', x: sx * 2.6, z: GATE_Z, r: 0.35 });
  return [...c, ...extra];
}

export function roomColliders(kind: Exclude<ZoneKind, 'town'>): Collider[] {
  const c: Collider[] = [];
  const at = (x: number, z: number, hw: number, hd: number, rot = 0): Collider => ({ kind: 'box', x, z, hw, hd, rot });
  if (kind === 'tavern') {
    c.push(at((BAR.x0 + BAR.x1) / 2, BAR.z, (BAR.x1 - BAR.x0) / 2, BAR.depth / 2));
    for (const s of BAR_STOOLS) c.push({ kind: 'circle', x: s.x, z: s.z, r: 0.25 });
    for (const t of TAVERN_TABLES) {
      c.push({ kind: 'circle', x: t.x, z: t.z, r: 0.85 });
      for (const ch of tableChairs(t)) c.push({ kind: 'circle', x: ch.x, z: ch.z, r: 0.28 });
    }
    c.push(at(-7.55, 0.4, 0.5, 1.3));
    c.push(at(0, -5.5, 8, 0.5));
    c.push(at(6.9, -4.6, 0.9, 1.2));
    c.push(at(6.8, 3.6, 1.0, 0.9));
  } else if (kind === 'bakery') {
    c.push(at(OVEN.x, OVEN.z, 1.45, 1.1));
    c.push(at((SHELF.x0 + SHELF.x1) / 2, SHELF.z, (SHELF.x1 - SHELF.x0) / 2, 0.4));
    c.push(at(3.2, 1.1, 1.75, 0.5));
    c.push(at(-3.3, 1.3, 1.1, 0.65));
    c.push(at(-5.2, 3.0, 0.6, 0.9));
  } else if (kind === 'church') {
    c.push(at(0, -7.7, 1.4, 0.65));
    for (const z of PEW_ROWS) for (const sx of [-1, 1]) c.push(at(sx * PEW_X, z + 0.1, PEW_LEN / 2, 0.38));
    for (const sx of [-1, 1]) c.push({ kind: 'circle', x: sx * 2.2, z: -7.4, r: 0.25 });
  } else if (kind === 'house') {
    c.push(at(BED.x, BED.z, BED.w / 2 + 0.05, BED.d / 2 + 0.05));
    c.push({ kind: 'circle', x: HOME_TABLE.x, z: HOME_TABLE.z, r: 0.75 });
    for (const ch of HOME_CHAIRS) c.push({ kind: 'circle', x: ch.x, z: ch.z, r: 0.28 });
    c.push(at(-2.4, -3.6, 0.95, 0.5));
    c.push(at(-4.65, -1.6, 0.35, 1.0));
    c.push(at(4.5, 1.6, 0.4, 0.4));
  }
  return c;
}

export const LINE_SLOT_X = (line: number, slot: number) => {
  const l = LINE_POS[line % LINE_POS.length];
  return { x: l.x0 + ((l.x1 - l.x0) * (slot + 0.5)) / LINE_SLOTS, z: l.z };
};
