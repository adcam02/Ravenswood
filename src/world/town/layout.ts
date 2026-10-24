import { BEDS, BED_SPOTS, BOOTHS, BOOTH_HD, BOOTH_HW, LINES, LINE_SLOTS, boothSeats, boothSpot, type Collider, type Door, type Spot, type Station, type ZoneKind } from '../types';
import { local } from './kit';
import { BJ_TABLE, BJ_DEALER, CASHIER, CASINO, CASINO_DOOR, CASINO_ROOM, CHAIR_Y, PK_DEALER, PK_TABLE, RL_CROUPIER, RL_TABLE, SHOP, SLOTS, bjSeat, pkSeat, rlSeat } from './casinoLayout';
import { BJ_SEATS, PK_SEATS, RL_SEATS } from '../../casino/types';

/**
 * Where everything in Ravenswood stands. Metres, y up, north is -z (away from the camera).
 * A facing (ry) of 0 looks towards +z; buildings face the way their front door does.
 */

export const TOWN_R = 36;
export const SQUARE_R = 11;
/**
 * The meeting circle sits in front of the tower (towards the camera), so nobody is hidden behind it, with room
 * between its steps and the tower's front door so walking to the stools doesn't take you inside.
 */
export const MEETING_CENTRE = { x: 0, z: 9.3 };
export const STOOL_R = 3.8;
/**
 * The meeting dais: a round stone platform south of the tower with two steps all the way round. `r` is the
 * top's radius, `r2` and `r1` the outer edges of the inner and outer steps; heights are of their tops.
 */
export const DAIS = { r: 4.35, r2: 4.63, r1: 4.91, top: 0.45, h2: 0.31, h1: 0.17 };
/** Anyone this close to the tower counts as being at the meeting (the furthest stool is about 13.1 m away). */
export const MEETING_R = 14;
export const HOUSE_R = 29;
export const RING_ROAD_R = 25.5;
/** A few cottages for scenery, in the gaps between the public buildings. Bedrooms are elsewhere. */
export const HOUSES = 2;
// (The club stands where Bramble Cottage was, at 40 degrees, the casino where Rose Cottage was, at 296, and Wren Court
// where Ferncroft was, at 68.)
export const COTTAGE_ANGLES = [118, 326];
export const COTTAGE_NAMES = ['The Old Mill', 'Hollow Oak'];
/** The gallows, just to the side of the meeting circle, facing it. */
export const GALLOWS = { x: 8.6, z: 6.2, ry: -Math.PI / 2 };
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
/** The clock tower in the middle of the square, with a door on every side. */
export const TOWER: Building = { x: 0, z: 0, ry: 0, w: 3.4, d: 3.4 };
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

/**
 * The Velvet Horn, a little night club where Bramble Cottage stood (north-east, out past the ring road), facing the
 * middle of town. A velvet rope runs across in front of its door, with the bouncer beside it.
 */
export const CLUB_ANGLE = 40;
export const CLUB: Building = (() => {
  const a = (CLUB_ANGLE * Math.PI) / 180;
  const x = 31 * Math.sin(a);
  const z = -31 * Math.cos(a);
  return { x, z, ry: Math.atan2(-x, -z), w: 7.2, d: 5.4 };
})();
export const CLUB_NAME = 'The Velvet Horn';
/** In the club's own frame: the rope's posts (either side of the path, just out from the door) and where the bouncer stands. */
export const CLUB_ROPE = { lx: 0.85, lz: CLUB.d / 2 + 0.95 };
export const BOUNCER = { lx: 1.85, lz: CLUB.d / 2 + 0.85 };
/**
 * Wren Court, the apartment block: three storeys of flats where Ferncroft cottage stood (north-east, out past the
 * ring road), facing the middle of town. Every player has a flat in it, under their name; the lift in its lobby goes
 * up to any of them, and at night everyone sleeps in their own.
 */
export const FLATS_ANGLE = 68;
export const FLATS: Building = (() => {
  const a = (FLATS_ANGLE * Math.PI) / 180;
  const x = 31.4 * Math.sin(a);
  const z = -31.4 * Math.cos(a);
  return { x, z, ry: Math.atan2(-x, -z), w: 9.2, d: 6.2 };
})();
export const FLATS_NAME = 'Wren Court';

/** The idea box for the Storyteller, on a post beside the noticeboard. */
export const IDEA_BOX = { x: 5.4, z: -13.5, ry: -0.2 };

/** On the open grass south-east of the square, inside the ring road and away from the gallows. */
export const POND = { x: 6.5, z: 17.8, rx: 4.6, rz: 4.0 };
export const DOCK = { x: 6.5, z0: 12.8, z1: 18.1, w: 2.6 };

/**
 * How high the walking surface is at a spot in the town: the square's cobbles and kerb stand a few
 * centimetres proud of the grass, and the pier's deck higher again, so animals stand on them rather than
 * sinking in. (The grass is flat everywhere in town; indoors the floors are at 0.)
 */
export function groundAt(x: number, z: number): number {
  if (Math.abs(x - DOCK.x) < DOCK.w / 2 && z > DOCK.z0 && z < DOCK.z1) return 0.105;
  const d = Math.hypot(x - MEETING_CENTRE.x, z - MEETING_CENTRE.z);
  if (d < DAIS.r) return DAIS.top;
  if (d < DAIS.r2) return DAIS.h2;
  if (d < DAIS.r1) return DAIS.h1;
  const r = Math.hypot(x, z);
  // The tops of the tallest cobbles (they vary between 5 and 6.5 cm) and of the kerb.
  if (r < SQUARE_R - 0.05) return 0.066;
  if (r < SQUARE_R + 0.45) return 0.071;
  return 0;
}
export const FISHING = [
  { x: 5.8, z: 17.3 },
  { x: 7.2, z: 17.3 },
];

export const WELL = { x: -6.5, z: -15.5 };
/** A chopping block and a stack of logs beside the tavern. */
export const WOODPILE = { x: -13.4, z: -3.6, ry: Math.PI / 2 };
/** Where you stand to skim stones, on the pond's near bank. */
export const SKIMMING = { x: 3.2, z: 20.6 };
export const NOTICEBOARD = { x: 3.2, z: -13.6 };
/**
 * The post office: a wall of letterboxes, one for each player, beside the road south of the meeting circle (its
 * front faces the road), with a red pillar box beside it.
 */
export const POST = { x: -3.1, z: 16.6, ry: Math.PI / 2 };
/** A ring of toadstools out among the trees past the washing lines, for anyone who goes looking. Stand in it. */
export const FAIRY_RING = { x: -17.8, z: 25.4, r: 0.95 };
export const POST_COLS = 6;
export const POST_ROWS = 4;
export const GATE_Z = TOWN_R + 0.6;

/**
 * The ring road, as a closed loop of points clockwise from north. It runs round at RING_ROAD_R, except at the top of
 * town, where the church stands across it: there it bends out round the back of the church, squeezing between the
 * churchyard and Hollow Oak on the way.
 */
export const ROAD_LOOP: { x: number; z: number }[] = (() => {
  const ring = (deg: number) => {
    const a = (deg * Math.PI) / 180;
    return { x: RING_ROAD_R * Math.sin(a), z: -RING_ROAD_R * Math.cos(a) };
  };
  const pts = [
    { x: 5.5, z: -32.6 },
    { x: 9.8, z: -31.4 },
    { x: 12.6, z: -28.6 },
    { x: 13.6, z: -25.0 },
  ];
  for (let deg = 32; deg < 333; deg += 5) pts.push(ring(deg));
  pts.push(ring(333), { x: -11.5, z: -26.0 }, { x: -11.7, z: -29.6 }, { x: -9.6, z: -31.6 }, { x: -5.5, z: -32.6 }, { x: 0, z: -32.8 });
  return pts;
})();
/** The narrow bit of the road, between the churchyard wall and Hollow Oak (indexes into ROAD_LOOP's segments). */
export const ROAD_NARROW = (i: number) => {
  const a = ROAD_LOOP[i];
  return a.x < -11 && a.z < -22 && a.z > -30;
};
/** How far a spot is from the middle of the ring road. */
export function roadDistance(x: number, z: number): number {
  let best = Infinity;
  for (let i = 0; i < ROAD_LOOP.length; i++) {
    const a = ROAD_LOOP[i];
    const b = ROAD_LOOP[(i + 1) % ROAD_LOOP.length];
    const dx = b.x - a.x;
    const dz = b.z - a.z;
    const t = Math.max(0, Math.min(1, ((x - a.x) * dx + (z - a.z) * dz) / (dx * dx + dz * dz || 1)));
    best = Math.min(best, Math.hypot(x - (a.x + dx * t), z - (a.z + dz * t)));
  }
  return best;
}

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

// The south-east bench sits at 100 rather than 110 degrees, so it's well clear of the gallows platform.
export const benches = [70, 100, 250, 290].map((deg) => {
  const a = (deg * Math.PI) / 180;
  const r = 9.6;
  const x = r * Math.sin(a);
  const z = -r * Math.cos(a);
  return { x, z, ry: face(x, z, 0, 0) };
});

// Evenly round the square, except the two either side of the meeting circle, which stand a little wider of it.
export const squareLamps = [22.5, 67.5, 112.5, 150, 210, 247.5, 292.5, 337.5].map((deg) => {
  const a = (deg * Math.PI) / 180;
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
  const a = COTTAGE_ANGLES[i] * (Math.PI / 180);
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
  tower: { hw: 5, hd: 5 },
  cellar: { hw: 7, hd: 6 },
  house: { hw: 5, hd: 4 },
  club: { hw: 7, hd: 5.5 },
  casino: CASINO_ROOM,
  lobby: { hw: 5.5, hd: 4 },
  // (The same as flats/catalogue.ts's grid: 20 by 16 half-metre cells.)
  flat: { hw: 5, hd: 4 },
};

/** Inside each room: where the exit is, and where you appear when you come in. */
export const ROOM_DOOR: Record<Exclude<ZoneKind, 'town'>, { exit: { x: number; z: number; r: number }; arrive: Spot }> = {
  tavern: { exit: { x: 0, z: 5.3, r: 1.0 }, arrive: { x: 0, z: 3.7, ry: Math.PI } },
  bakery: { exit: { x: 0, z: 4.3, r: 1.0 }, arrive: { x: 0, z: 2.8, ry: Math.PI } },
  church: { exit: { x: 0, z: 8.3, r: 1.0 }, arrive: { x: 0, z: 6.8, ry: Math.PI } },
  tower: { exit: { x: 0, z: 4.3, r: 1.0 }, arrive: { x: 0, z: 2.8, ry: Math.PI } },
  // The cellar's way out is the foot of its stairs, up to the tavern.
  cellar: { exit: { x: -6.1, z: 5.25, r: 0.8 }, arrive: { x: -4.7, z: 4.4, ry: Math.PI / 2 } },
  house: { exit: { x: 0, z: 3.3, r: 0.9 }, arrive: { x: 0, z: 1.9, ry: Math.PI } },
  club: { exit: { x: 0, z: 4.8, r: 1.0 }, arrive: { x: 0, z: 3.3, ry: Math.PI } },
  casino: CASINO_DOOR,
  lobby: { exit: { x: 0, z: 3.3, r: 1.0 }, arrive: { x: 0, z: 2.0, ry: Math.PI } },
  // A flat's front door, which leads back down to the lobby (the cells in front of it are kept clear).
  flat: { exit: { x: 0, z: 3.4, r: 0.9 }, arrive: { x: 0, z: 2.1, ry: Math.PI } },
};

export const BAR = { x0: -6.2, x1: 2.6, z: -2.6, depth: 0.9, h: 1.1 };
export const counterSpot = (i: number) => ({ x: -5.4 + i * 1.45, y: BAR.h + 0.03, z: BAR.z });
export const BAR_STOOLS = [-5.4, -3.6, -1.8, 0, 1.8].map((x) => ({ x, z: -1.5 }));
/** The leaderboard on the tavern's left wall, between the fireplace and the front corner. */
export const LEADERBOARD = { x: -8, z: 3.95 };
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

/**
 * The clock room inside the tower. The movement stands in the middle near the back, with its pendulum swinging
 * under it and rods running off to the dials on the back and side walls (seen from inside, so they read backwards).
 */
export const MOVEMENT = { x: 0, z: -2.4, hw: 1.6, hd: 0.35 };
export const BACK_DIAL = { y: 1.75, r: 1.3 };
export const SIDE_DIAL = { y: 2.0, r: 1.05, z: MOVEMENT.z };
export const BELL_ROPE = { x: -3.2, z: -0.6 };
export const WORKBENCH = { x: -4.45, z: 1.5, hw: 0.4, hd: 1.1, top: 0.9 };
export const WORK_STOOL = { x: -3.55, z: 1.5, ry: -Math.PI / 2 };
export const TOWER_BENCH = { x: 4.5, z0: 0, z1: 1.8 };

/**
 * The cellar under the tavern, where pets fight. The pit is a sanded ring with a low rail round it; the two owners
 * stand at its front corners, and the benches face it from the sides and back. The stairs up run along the left wall.
 * In the tavern, an open trapdoor by the right wall leads down.
 */
export const PIT_RING = { x: 0.8, z: -0.4, r: 2.0, rail: 0.42 };
export const PIT_CORNERS: Spot[] = [-1, 1].map((sx) => {
  const x = PIT_RING.x + sx * 2.1;
  const z = PIT_RING.z + 1.75;
  return { x, z, ry: face(x, z, PIT_RING.x, PIT_RING.z) };
});
export const PIT_BENCHES: Spot[] = [
  [-3.3, -0.3],
  [3.3, -0.3],
  [-2.2, -2.7],
  [2.2, -2.7],
].map(([dx, dz]) => {
  const x = PIT_RING.x + dx;
  const z = PIT_RING.z + dz;
  return { x, z, ry: face(x, z, PIT_RING.x, PIT_RING.z) };
});
export const PIT_BENCH_LEN = 1.8;
export const CELLAR_STAIRS = { x: -6.1, w: 1.3, z0: 4.6, z1: 0.2, h: 3.3 };
export const TALLY_BOARD = { x: PIT_RING.x, y: 2.0, w: 2.6, h: 1.5 };
export const TRAPDOOR = { x: 6.3, z: 1.75, w: 1.0, d: 1.1 };

export const BED = { x: 3.1, z: -2.65, w: 1.7, d: 2.6, top: 0.52 };
export const HOME_TABLE = { x: -2.6, z: 0.7 };
export const HOME_CHAIRS = [
  { x: -3.75, z: 0.7, ry: Math.PI / 2 },
  { x: -1.45, z: 0.7, ry: -Math.PI / 2 },
];

/**
 * Inside the Velvet Horn: a dance floor of glowing tiles under the disco ball, the jukebox against the back wall
 * between two speakers, a long velvet sofa down the left wall, and a juice bar with stools down the right.
 */
export const DANCE_FLOOR = { x: 0, z: -1.2, hw: 3, hd: 2 };
export const DISCO_BALL = { x: 0, y: 2.75, z: -1.2 };
export const JUKEBOX = { x: 0, z: -4.95 };
export const CLUB_SPEAKERS = [-1.95, 1.95].map((x) => ({ x, z: -4.95 }));
export const CLUB_SOFA = { x: -6.3, z: 0, len: 4.4 };
export const CLUB_SOFA_SEATS: Spot[] = [-1.35, 0, 1.35].map((z) => ({ x: -5.95, z, ry: Math.PI / 2 }));
export const CLUB_TABLE = { x: -4.75, z: 0 };
export const CLUB_BAR = { x: 6.3, z0: -3.6, z1: 0.6, depth: 0.8, h: 1.05 };
export const CLUB_STOOLS: Spot[] = [-2.8, -1.5, -0.2].map((z) => ({ x: 5.25, z, ry: Math.PI / 2 }));
/**
 * Wren Court's lobby: the lift at the back with the residents' board beside it, the mailboxes down the left wall
 * with a bench in front of them, and the stairs up the right.
 */
export const LIFT = { x: 0, z: -3.75 };
export const LOBBY_BOARD = { x: -2.3, y: 1.75 };
export const LOBBY_BENCH = { x: -4.85, z: 1.3, len: 2.0 };
export const LOBBY_BENCH_SEATS: Spot[] = [-0.5, 0.5].map((dz) => ({ x: LOBBY_BENCH.x + 0.1, z: LOBBY_BENCH.z + dz, ry: Math.PI / 2 }));
export const LOBBY_STAIRS = { x: 4.45, z0: 1.2, z1: -3.9, w: 1.5, h: 3.3 };
/** Where you step out of the lift, coming down from a flat. */
export const LIFT_OUT: Spot = { x: 0, z: -2.4, ry: 0 };

export const onDanceFloor = (x: number, z: number) => Math.abs(x - DANCE_FLOOR.x) < DANCE_FLOOR.hw && Math.abs(z - DANCE_FLOOR.z) < DANCE_FLOOR.hd;

// ---------------------------------------------------------------- doors

export function makeDoors(): Door[] {
  const doors: Door[] = [];
  const pub: [Exclude<ZoneKind, 'town' | 'house' | 'tower'>, Building, number, string][] = [
    ['tavern', TAVERN, TAVERN.d / 2, 'The Raven’s Rest'],
    ['bakery', BAKERY, BAKERY.d / 2, 'Bakery'],
    ['church', CHURCH, churchFront, 'Church'],
    ['club', CLUB, CLUB.d / 2, CLUB_NAME],
    ['casino', CASINO, CASINO.d / 2, 'The Lucky Raven'],
    ['lobby', FLATS, FLATS.d / 2, FLATS_NAME],
  ];
  for (const [kind, b, front, label] of pub) {
    const trigger = doorPoint(b, 0.55, front);
    const outside = doorPoint(b, 2.0, front);
    doors.push({ id: `${kind}-in`, zone: 'town', x: trigger.x, z: trigger.z, r: 1.0, to: kind, spawn: ROOM_DOOR[kind].arrive, label });
    const ex = ROOM_DOOR[kind].exit;
    doors.push({ id: `${kind}-out`, zone: kind, x: ex.x, z: ex.z, r: ex.r, to: 'town', spawn: { ...outside, ry: b.ry }, label: 'Outside' });
  }
  // The clock tower opens on all four sides, and you come back out of the door you went in by. Its steps keep
  // everyone a little way off, so each doorway sits just past them.
  const sides: [string, number][] = [
    ['s', 0],
    ['e', Math.PI / 2],
    ['n', Math.PI],
    ['w', -Math.PI / 2],
  ];
  for (const [side, ry] of sides) {
    const b = { ...TOWER, ry };
    const trigger = doorPoint(b, 1.15);
    const outside = doorPoint(b, 2.65);
    doors.push({ id: `tower-in-${side}`, zone: 'town', x: trigger.x, z: trigger.z, r: 0.8, to: 'tower', spawn: ROOM_DOOR.tower.arrive, back: { ...outside, ry }, label: 'Clock tower' });
  }
  {
    const ex = ROOM_DOOR.tower.exit;
    const outside = doorPoint(TOWER, 2.65);
    doors.push({ id: 'tower-out', zone: 'tower', x: ex.x, z: ex.z, r: ex.r, to: 'town', spawn: { ...outside, ry: 0 }, label: 'Outside' });
  }
  houseSlots.forEach((h, slot) => {
    const trigger = local(h.x, h.z, h.ry, 0, HOUSE_D / 2 + 0.55);
    doors.push({ id: `house-${slot}`, zone: 'town', x: trigger.x, z: trigger.z, r: 1.0, to: 'house', slot, spawn: ROOM_DOOR.house.arrive, label: COTTAGE_NAMES[slot] });
  });
  // Down the trapdoor in the tavern to the cellar, and back up its stairs.
  doors.push({ id: 'cellar-in', zone: 'tavern', x: TRAPDOOR.x, z: TRAPDOOR.z, r: 0.7, to: 'cellar', spawn: ROOM_DOOR.cellar.arrive, label: 'The cellar' });
  {
    const ex = ROOM_DOOR.cellar.exit;
    doors.push({ id: 'cellar-out', zone: 'cellar', x: ex.x, z: ex.z, r: ex.r, to: 'tavern', spawn: { x: TRAPDOOR.x - 1.2, z: TRAPDOOR.z, ry: -Math.PI / 2 }, label: 'Up to the tavern' });
  }
  // Out of a flat's front door and down to the lobby, by the lift.
  {
    const ex = ROOM_DOOR.flat.exit;
    doors.push({ id: 'flat-out', zone: 'flat', x: ex.x, z: ex.z, r: ex.r, to: 'lobby', spawn: LIFT_OUT, label: 'Down to the lobby' });
  }
  const ex = ROOM_DOOR.house.exit;
  doors.push({ id: 'house-out', zone: 'house', x: ex.x, z: ex.z, r: ex.r, to: 'town', spawn: { x: 0, z: 0, ry: 0 }, label: 'Outside' });
  return doors;
}

// ---------------------------------------------------------------- stations

export function makeStations(): Station[] {
  const st: Station[] = [];
  // Tavern.
  st.push({ id: 'bar', zone: 'tavern', x: -1.8, z: -4.3, r: 2.2, job: 'bartender', stand: { x: -1.8, z: -4.0, ry: 0 }, label: 'Pour a drink' });
  // (Its spot is in the gap between two stools: right by one, the stool's "Sit" is the nearer.)
  st.push({ id: 'bar-front', zone: 'tavern', x: -1.8, z: -1.0, r: 3.0, job: 'takeDrink', stand: { x: -0.9, z: -1.15, ry: Math.PI }, label: 'Take a drink' });
  BAR_STOOLS.forEach((s, i) =>
    st.push({ id: `stool-${i}`, zone: 'tavern', x: s.x, z: s.z, r: 0.9, job: 'sit', stand: { x: s.x, z: s.z, ry: Math.PI }, y: 0.78, label: 'Sit' }),
  );
  TAVERN_TABLES.forEach((t, ti) =>
    tableChairs(t).forEach((c, i) =>
      st.push({ id: `chair-${ti}-${i}`, zone: 'tavern', x: c.x, z: c.z, r: 0.9, job: 'sit', stand: c, y: 0.47, label: 'Sit' }),
    ),
  );
  st.push({ id: 'darts', zone: 'tavern', x: 5.4, z: -0.5, r: 1.6, job: 'darts', stand: { x: 5.4, z: -0.5, ry: Math.PI / 2 }, label: 'Throw some darts' });
  st.push({ id: 'leaders', zone: 'tavern', x: LEADERBOARD.x + 1.1, z: LEADERBOARD.z, r: 1.6, job: 'leaders', stand: { x: LEADERBOARD.x + 1.0, z: LEADERBOARD.z, ry: -Math.PI / 2 }, label: 'Read the leaderboard' });
  // Bakery.
  st.push({ id: 'oven', zone: 'bakery', x: OVEN.x, z: OVEN.z + 1.7, r: 1.8, job: 'baking', stand: { x: OVEN.x, z: OVEN.z + 1.7, ry: Math.PI }, label: 'Bake something' });
  st.push({ id: 'shelf', zone: 'bakery', x: 3.0, z: -3.3, r: 2.0, job: 'takeBread', stand: { x: 3.0, z: -3.4, ry: Math.PI }, label: 'Take a bake' });
  // The altar: bread on the left, wine on the right.
  st.push({ id: 'bread', zone: 'church', x: -0.9, z: -6.3, r: 1.4, job: 'bread', stand: { x: -0.9, z: -6.3, ry: Math.PI }, label: 'Break the bread' });
  st.push({ id: 'wine', zone: 'church', x: 0.9, z: -6.3, r: 1.4, job: 'wine', stand: { x: 0.9, z: -6.3, ry: Math.PI }, label: 'Pour the wine' });
  // Church pews.
  PEW_ROWS.forEach((z, row) =>
    [-PEW_X - 0.9, -PEW_X + 0.9, PEW_X - 0.9, PEW_X + 0.9].forEach((x, k) =>
      st.push({ id: `pew-${row}-${k}`, zone: 'church', x, z, r: 0.8, job: 'sit', stand: { x, z, ry: Math.PI }, y: 0.46, label: 'Sit' }),
    ),
  );
  // The confession booths: step in at the front of either side, to sit inside (and again to come out).
  BOOTHS.forEach((b, booth) =>
    boothSeats(booth).forEach((seat, i) => {
      const at = boothSpot(booth, i ? 0.75 : -0.75, BOOTH_HD - 0.05);
      const id = booth ? `booth-${booth}-${i}` : `booth-${i}`;
      st.push({ id, zone: b.zone as ZoneKind, x: at.x, z: at.z, r: 1.0, job: 'confess', stand: seat, y: 0.48, booth, label: 'Step into the confession booth' });
    }),
  );
  // The club: a word with the bouncer outside, and inside, the jukebox, the sofa and the stools at the juice bar.
  {
    const at = local(CLUB.x, CLUB.z, CLUB.ry, BOUNCER.lx - 0.9, BOUNCER.lz + 1.1);
    const b = local(CLUB.x, CLUB.z, CLUB.ry, BOUNCER.lx, BOUNCER.lz);
    st.push({ id: 'bouncer', zone: 'town', x: at.x, z: at.z, r: 1.5, job: 'bouncer', stand: { ...at, ry: face(at.x, at.z, b.x, b.z) }, label: 'Have a word with Big Moo' });
  }
  st.push({ id: 'jukebox', zone: 'club', x: JUKEBOX.x, z: JUKEBOX.z + 1.0, r: 1.6, job: 'jukebox', stand: { x: JUKEBOX.x, z: JUKEBOX.z + 1.0, ry: Math.PI }, label: 'Choose a song' });
  CLUB_SOFA_SEATS.forEach((c, i) => st.push({ id: `club-sofa-${i}`, zone: 'club', x: c.x, z: c.z, r: 0.9, job: 'sit', stand: c, y: 0.46, label: 'Sit' }));
  CLUB_STOOLS.forEach((c, i) => st.push({ id: `club-stool-${i}`, zone: 'club', x: c.x, z: c.z, r: 0.8, job: 'sit', stand: c, y: 0.74, label: 'Sit' }));
  // The clock tower: a stool at the clockmaker's bench and a bench along the wall.
  st.push({ id: 'tower-stool', zone: 'tower', x: WORK_STOOL.x, z: WORK_STOOL.z, r: 0.9, job: 'sit', stand: WORK_STOOL, y: 0.62, label: 'Sit' });
  [0.45, 1.35].forEach((z, i) =>
    st.push({ id: `tower-bench-${i}`, zone: 'tower', x: TOWER_BENCH.x, z, r: 0.8, job: 'sit', stand: { x: TOWER_BENCH.x, z, ry: -Math.PI / 2 }, y: 0.45, label: 'Sit' }),
  );
  // In front of the movement, facing it: keep the clock in time.
  {
    const z = MOVEMENT.z + MOVEMENT.hd + 0.75;
    st.push({ id: 'clock', zone: 'tower', x: MOVEMENT.x, z, r: 1.5, job: 'clock', stand: { x: MOVEMENT.x, z, ry: Math.PI }, label: 'Keep the clock in time' });
  }
  // The cellar: benches round the pit, two to a bench.
  PIT_BENCHES.forEach((b, i) =>
    [-0.45, 0.45].forEach((along, k) => {
      const p = local(b.x, b.z, b.ry, along, 0);
      st.push({ id: `pit-bench-${i}-${k}`, zone: 'cellar', x: p.x, z: p.z, r: 0.7, job: 'sit', stand: { x: p.x, z: p.z, ry: b.ry }, y: 0.46, label: 'Sit' });
    }),
  );
  // Wren Court: the lift, and the bench by the mailboxes.
  st.push({ id: 'lift', zone: 'lobby', x: LIFT.x, z: LIFT.z + 1.25, r: 1.6, job: 'flats', stand: { x: LIFT.x, z: LIFT.z + 1.2, ry: Math.PI }, label: 'Take the lift' });
  LOBBY_BENCH_SEATS.forEach((c, i) => st.push({ id: `lobby-bench-${i}`, zone: 'lobby', x: c.x, z: c.z, r: 0.8, job: 'sit', stand: c, y: 0.46, label: 'Sit' }));
  // Home.
  st.push({ id: 'bed', zone: 'house', x: BED.x, z: BED.z + 0.3, r: 1.9, job: 'sleep', stand: { x: BED.x, z: BED.z + 0.25, ry: 0 }, y: BED.top, label: 'Sleep' });
  // Every flat's bed, where its owner sleeps at night.
  st.push({ id: 'flat-bed', zone: 'flat', x: BED.x, z: BED.z + 0.3, r: 1.9, job: 'sleep', stand: { x: BED.x, z: BED.z + 0.25, ry: 0 }, y: BED.top, label: 'Sleep' });
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
  st.push({ id: 'coin', zone: 'town', x: WELL.x, z: WELL.z - 1.6, r: 1.5, job: 'coin', stand: { x: WELL.x, z: WELL.z - 1.55, ry: 0 }, label: 'Toss a coin and make a wish' });
  {
    const p = local(WOODPILE.x, WOODPILE.z, WOODPILE.ry, 0, 1.1);
    st.push({ id: 'firewood', zone: 'town', x: p.x, z: p.z, r: 1.5, job: 'firewood', stand: { x: p.x, z: p.z, ry: WOODPILE.ry + Math.PI }, label: 'Chop firewood' });
  }
  st.push({ id: 'skimming', zone: 'town', x: SKIMMING.x, z: SKIMMING.z, r: 1.5, job: 'skimming', stand: { x: SKIMMING.x, z: SKIMMING.z, ry: face(SKIMMING.x, SKIMMING.z, POND.x, POND.z) }, label: 'Skim stones' });
  {
    const at = local(POST.x, POST.z, POST.ry, 0, 1.05);
    const stand = local(POST.x, POST.z, POST.ry, 0, 0.85);
    st.push({ id: 'post', zone: 'town', x: at.x, z: at.z, r: 1.5, job: 'post', stand: { ...stand, ry: POST.ry + Math.PI }, label: 'Write a letter' });
  }
  st.push({ id: 'ideas', zone: 'town', x: IDEA_BOX.x, z: IDEA_BOX.z + 1.0, r: 1.4, job: 'ideas', stand: { x: IDEA_BOX.x, z: IDEA_BOX.z + 0.9, ry: Math.PI }, label: 'Post an idea for the Storyteller' });
  st.push({ id: 'notice', zone: 'town', x: NOTICEBOARD.x, z: NOTICEBOARD.z + 1.1, r: 1.6, job: 'notice', stand: { x: NOTICEBOARD.x, z: NOTICEBOARD.z + 1.0, ry: Math.PI }, label: 'Read the noticeboard' });
  benches.forEach((b, i) =>
    [-0.5, 0.5].forEach((lx, k) => {
      const p = local(b.x, b.z, b.ry, lx, -0.05);
      st.push({ id: `bench-${i}-${k}`, zone: 'town', x: p.x, z: p.z, r: 0.8, job: 'sit', stand: { x: p.x, z: p.z, ry: b.ry }, y: 0.45, label: 'Sit' });
    }),
  );
  // The casino: the pet shop's counter, and the seats at the card tables.
  st.push({ id: 'shop', zone: 'casino', x: SHOP.x, z: SHOP.z + 1.2, r: 1.6, job: 'shop', stand: { x: SHOP.x, z: SHOP.z + 1.15, ry: Math.PI }, label: 'Visit the shop' });
  for (let i = 0; i < BJ_SEATS; i++) {
    const c = bjSeat(i);
    st.push({ id: `bj-${i}`, zone: 'casino', x: c.x, z: c.z, r: 0.85, job: 'blackjack', stand: c, y: CHAIR_Y, label: 'Sit down for blackjack' });
  }
  for (let i = 0; i < PK_SEATS; i++) {
    const c = pkSeat(i);
    st.push({ id: `pk-${i}`, zone: 'casino', x: c.x, z: c.z, r: 0.85, job: 'poker', stand: c, y: CHAIR_Y, label: 'Sit down for poker' });
  }
  for (let i = 0; i < RL_SEATS; i++) {
    const c = rlSeat(i);
    st.push({ id: `rl-${i}`, zone: 'casino', x: c.x, z: c.z, r: 0.85, job: 'roulette', stand: c, y: CHAIR_Y, label: 'Sit down for roulette' });
  }
  // Activities are easy to step into: a generous area round each (the nearest wins where two overlap).
  // Seats and beds keep a small one, so walking past doesn't keep offering to sit.
  for (const s of st) if (s.job !== 'sit' && s.job !== 'sleep' && s.job !== 'blackjack' && s.job !== 'poker' && s.job !== 'roulette') s.r = Math.min(3.2, Math.max(2.4, s.r * 1.6));
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
  // The club, the posts of its velvet rope, and the bouncer.
  c.push(box(CLUB, CLUB.w / 2 + 0.2, CLUB.d / 2 + 0.2));
  for (const sx of [-1, 1]) {
    const p = local(CLUB.x, CLUB.z, CLUB.ry, sx * CLUB_ROPE.lx, CLUB_ROPE.lz);
    c.push({ kind: 'circle', x: p.x, z: p.z, r: 0.16 });
  }
  {
    const p = local(CLUB.x, CLUB.z, CLUB.ry, BOUNCER.lx, BOUNCER.lz);
    c.push({ kind: 'circle', x: p.x, z: p.z, r: 0.5 });
  }
  // The confession booths out in town, and the idea box.
  BOOTHS.forEach((b, i) => {
    if (b.zone === 'town') c.push(box(boothSpot(i, 0, 0), BOOTH_HW + 0.05, BOOTH_HD + 0.05));
  });
  c.push({ kind: 'circle', x: IDEA_BOX.x, z: IDEA_BOX.z, r: 0.35 });
  c.push(box(CASINO, CASINO.w / 2 + 0.15, CASINO.d / 2 + 0.15));
  c.push(box(FLATS, FLATS.w / 2 + 0.15, FLATS.d / 2 + 0.15));
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
  c.push({ kind: 'box', x: WOODPILE.x, z: WOODPILE.z, hw: 1.1, hd: 0.6, rot: WOODPILE.ry });
  c.push({ kind: 'box', x: GALLOWS.x, z: GALLOWS.z, hw: 1.5, hd: 1.5, rot: GALLOWS.ry });
  c.push({ kind: 'box', x: NOTICEBOARD.x, z: NOTICEBOARD.z, hw: 1.0, hd: 0.25, rot: 0 });
  c.push(box(POST, 1.3, 0.32));
  const pillar = local(POST.x, POST.z, POST.ry, 1.75, 0.05);
  c.push({ kind: 'circle', x: pillar.x, z: pillar.z, r: 0.3 });
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
    // The trapdoor's lid, propped open against the wall.
    c.push(at(TRAPDOOR.x + TRAPDOOR.w / 2 + 0.12, TRAPDOOR.z, 0.12, TRAPDOOR.d / 2));
  } else if (kind === 'cellar') {
    // Nobody but the pets goes in the ring.
    c.push({ kind: 'circle', x: PIT_RING.x, z: PIT_RING.z, r: PIT_RING.r + 0.15 });
    for (const b of PIT_BENCHES) c.push(at(b.x, b.z, PIT_BENCH_LEN / 2, 0.3, b.ry));
    c.push(at(CELLAR_STAIRS.x, (CELLAR_STAIRS.z0 + CELLAR_STAIRS.z1) / 2 - 0.2, CELLAR_STAIRS.w / 2 + 0.1, (CELLAR_STAIRS.z0 - CELLAR_STAIRS.z1) / 2 + 0.4));
    // Barrels and crates in the corners and along the right wall.
    c.push(at(-4.6, -5.2, 1.5, 0.8));
    c.push(at(5.6, -5.0, 1.4, 1.0));
    c.push(at(6.3, 2.6, 0.7, 1.3));
    c.push({ kind: 'circle', x: 5.9, z: 4.9, r: 0.55 });
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
    c.push(at(BOOTHS[0].x, BOOTHS[0].z, BOOTH_HW, BOOTH_HD));
  } else if (kind === 'tower') {
    c.push(at(MOVEMENT.x, MOVEMENT.z, MOVEMENT.hw + 0.15, MOVEMENT.hd + 0.2));
    // The rod from the movement to the back dial runs at head height, so nobody walks through it.
    c.push(at(0, (MOVEMENT.z - MOVEMENT.hd - 5) / 2, 0.15, (5 - MOVEMENT.hd + MOVEMENT.z) / 2));
    c.push({ kind: 'circle', x: BELL_ROPE.x, z: BELL_ROPE.z, r: 0.2 });
    c.push(at(WORKBENCH.x, WORKBENCH.z, WORKBENCH.hw + 0.05, WORKBENCH.hd + 0.05));
    c.push({ kind: 'circle', x: WORK_STOOL.x, z: WORK_STOOL.z, r: 0.22 });
    c.push(at(TOWER_BENCH.x + 0.05, (TOWER_BENCH.z0 + TOWER_BENCH.z1) / 2, 0.3, (TOWER_BENCH.z1 - TOWER_BENCH.z0) / 2));
    c.push(at(4.7, 2.5, 0.25, 0.6));
    c.push(at(4.2, 3.6, 0.5, 0.5));
    c.push({ kind: 'circle', x: 3.2, z: 4.05, r: 0.4 });
  } else if (kind === 'house') {
    c.push(at(BED.x, BED.z, BED.w / 2 + 0.05, BED.d / 2 + 0.05));
    c.push({ kind: 'circle', x: HOME_TABLE.x, z: HOME_TABLE.z, r: 0.75 });
    for (const ch of HOME_CHAIRS) c.push({ kind: 'circle', x: ch.x, z: ch.z, r: 0.28 });
    c.push(at(-2.4, -3.6, 0.95, 0.5));
    c.push(at(-4.65, -1.6, 0.35, 1.0));
    c.push(at(4.5, 1.6, 0.4, 0.4));
  } else if (kind === 'club') {
    c.push(at(JUKEBOX.x, JUKEBOX.z, 0.65, 0.45));
    for (const sp of CLUB_SPEAKERS) c.push(at(sp.x, sp.z, 0.45, 0.4));
    c.push(at(CLUB_SOFA.x, CLUB_SOFA.z, 0.5, CLUB_SOFA.len / 2));
    c.push({ kind: 'circle', x: CLUB_TABLE.x, z: CLUB_TABLE.z, r: 0.45 });
    c.push(at(CLUB_BAR.x, (CLUB_BAR.z0 + CLUB_BAR.z1) / 2, CLUB_BAR.depth / 2, (CLUB_BAR.z1 - CLUB_BAR.z0) / 2));
    for (const s of CLUB_STOOLS) c.push({ kind: 'circle', x: s.x, z: s.z, r: 0.22 });
    // Big potted palms in the front corners.
    for (const sx of [-1, 1]) c.push({ kind: 'circle', x: sx * 6.2, z: 4.6, r: 0.45 });
  } else if (kind === 'flat') {
    // The bedroom's things every flat has (the furniture bought for it comes and goes: see town/flats.ts).
    c.push(at(BED.x, BED.z, BED.w / 2 + 0.05, BED.d / 2 + 0.05));
    c.push(at(4.45, -3.5, 0.32, 0.27));
    c.push(at(-2.4, -3.6, 0.95, 0.5));
  } else if (kind === 'lobby') {
    c.push(at(LIFT.x, LIFT.z, 1.15, 0.3));
    c.push(at(-5.25, -0.6, 0.3, 1.5));
    c.push(at(LOBBY_BENCH.x, LOBBY_BENCH.z, 0.3, LOBBY_BENCH.len / 2));
    c.push(at(LOBBY_STAIRS.x, (LOBBY_STAIRS.z0 + LOBBY_STAIRS.z1) / 2, LOBBY_STAIRS.w / 2 + 0.1, (LOBBY_STAIRS.z0 - LOBBY_STAIRS.z1) / 2 + 0.1));
    // Potted plants either side of the lift, and in the front corners.
    for (const [x, z] of [
      [-1.6, -3.5],
      [1.6, -3.5],
      [-5.0, 3.4],
      [3.2, 3.4],
    ])
      c.push({ kind: 'circle', x, z, r: 0.35 });
  } else if (kind === 'casino') {
    c.push(at(SHOP.x, SHOP.z, SHOP.w / 2, SHOP.d / 2));
    c.push({ kind: 'circle', x: CASHIER.x, z: CASHIER.z, r: 0.35 });
    // The half-moon table as a few circles along its curve, and the dealer behind it.
    for (const a of [-1.1, -0.55, 0, 0.55, 1.1]) c.push({ kind: 'circle', x: BJ_TABLE.x + Math.sin(a) * 0.95, z: BJ_TABLE.z + Math.cos(a) * 0.95 - 0.1, r: 0.85 });
    c.push(at(BJ_TABLE.x, BJ_DEALER.z, 1.0, 0.3));
    // The oval poker table, the same way, and its dealer.
    for (const k of [-1, -0.5, 0, 0.5, 1]) c.push({ kind: 'circle', x: PK_TABLE.x + k * (PK_TABLE.rx - PK_TABLE.rz * 0.8), z: PK_TABLE.z, r: PK_TABLE.rz * (1 - Math.abs(k) * 0.12) + 0.05 });
    c.push({ kind: 'circle', x: PK_DEALER.x, z: PK_DEALER.z, r: 0.35 });
    for (const sl of SLOTS) c.push(at(sl.x, sl.z, 0.4, 0.45));
    c.push(at(RL_TABLE.x, RL_TABLE.z, RL_TABLE.hw + 0.05, RL_TABLE.hd + 0.05));
    c.push({ kind: 'circle', x: RL_CROUPIER.x, z: RL_CROUPIER.z, r: 0.35 });
    // Potted palms in the corners.
    for (const [x, z] of [
      [-8.3, 5.9],
      [8.3, 5.9],
      [8.3, -6.3],
      [-0.9, -6.3],
    ])
      c.push({ kind: 'circle', x, z, r: 0.45 });
  }
  return c;
}

export const LINE_SLOT_X = (line: number, slot: number) => {
  const l = LINE_POS[line % LINE_POS.length];
  return { x: l.x0 + ((l.x1 - l.x0) * (slot + 0.5)) / LINE_SLOTS, z: l.z };
};

// ---------------------------------------------------------------- where someone is, in words

/**
 * Where a spot is, said the way a person would ("by the pond", "in the church"), for a messenger pigeon's note.
 * Buildings by name; out in town, the nearest landmark. (The fairy ring stays a secret: it's just "the woods".)
 */
export function whereIs(zone: string, x: number, z: number): string {
  if (zone === 'tavern') return 'in the Raven’s Rest';
  if (zone === 'bakery') return 'in the bakery';
  if (zone === 'church') return 'in the church';
  if (zone === 'tower') return 'up in the clock tower';
  if (zone === 'cellar') return 'down in the tavern’s cellar';
  if (zone === 'club') return `in ${CLUB_NAME}`;
  if (zone === 'casino') return 'in the Lucky Raven';
  if (zone === 'lobby' || zone.startsWith('flat:')) return `in ${FLATS_NAME}`;
  if (zone.startsWith('cottage:')) return `in ${COTTAGE_NAMES[Number(zone.slice(8)) % COTTAGE_NAMES.length]}`;
  if (zone.startsWith('house:')) return 'at home';
  const near = (p: { x: number; z: number }, r: number) => Math.hypot(x - p.x, z - p.z) < r;
  if (near(MEETING_CENTRE, DAIS.r1 + 1)) return 'at the meeting circle';
  if (Math.hypot(x, z) < SQUARE_R) return 'in the town square';
  if (pondContains(x, z, -2.5)) return 'by the pond';
  if (near(POST, 3.2)) return 'at the post office';
  if (near(GALLOWS, 3.5)) return 'by the gallows';
  if (near(WELL, 3)) return 'at the well';
  if (near(NOTICEBOARD, 2.5)) return 'at the noticeboard';
  if (near(IDEA_BOX, 2)) return 'at the idea box';
  if (near(WOODPILE, 3)) return 'at the woodpile';
  if (Math.abs(x - GRAVEYARD.x) < GRAVEYARD.hw + 2 && Math.abs(z - GRAVEYARD.z) < GRAVEYARD.hd + 2) return 'in the graveyard';
  if (near(doorPoint(CHURCH, 3, churchFront), 6)) return 'outside the church';
  if (near(doorPoint(TAVERN, 3), 7)) return 'outside the Raven’s Rest';
  if (near(doorPoint(CLUB, 2), 6)) return `outside ${CLUB_NAME}`;
  if (BOOTHS.some((b) => b.zone === 'town' && near(b, 4))) return 'by a confession booth in the trees';
  if (near(doorPoint(BAKERY, 3), 7)) return 'outside the bakery';
  if (near(doorPoint(CASINO, 3), 7)) return 'outside the Lucky Raven';
  if (near(doorPoint(FLATS, 3), 7)) return `outside ${FLATS_NAME}`;
  if (Math.abs(x - WASHHOUSE.x) < WASHHOUSE.w / 2 + 3 && Math.abs(z - WASHHOUSE.z) < WASHHOUSE.d / 2 + 3) return 'at the washhouse';
  if (LINE_POS.some((l) => x > l.x0 - 1 && x < l.x1 + 1 && Math.abs(z - l.z) < 1.5)) return 'by the washing lines';
  if (beds.some((b) => near(b, 3))) return 'by the flower beds';
  const cottage = houseSlots.findIndex((h) => near(h, 6));
  if (cottage >= 0) return `by ${COTTAGE_NAMES[cottage % COTTAGE_NAMES.length]}`;
  const r = Math.hypot(x, z);
  if (roadDistance(x, z) < 2) return 'on the ring road';
  if (r > RING_ROAD_R + 2) return 'out in the woods';
  return 'around town';
}
