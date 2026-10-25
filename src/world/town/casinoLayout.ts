import { BJ_SEATS, PK_SEATS, SL_MACHINES } from '../../casino/types';
import type { Spot } from '../types';

/**
 * Where the Lucky Raven stands, and where everything inside it is. It stands out past the ring road to the
 * north-west, facing the square, where Hollow Oak was (the cottage went to its old spot behind the tavern, where
 * walking up to its door faded the tavern out every time). Here nothing stands between its door and the camera.
 * Inside, like every room, it's centred on 0,0 with the way out on the camera side (+z).
 */

const face = (fromX: number, fromZ: number, toX: number, toZ: number) => Math.atan2(toX - fromX, toZ - fromZ);

/**
 * The building: a little further out than the cottage was and a touch further round from the church, so its wider
 * front stays clear of the road where it bends round the churchyard.
 */
export const CASINO = (() => {
  const a = (322 * Math.PI) / 180;
  const r = 31;
  const x = r * Math.sin(a);
  const z = -r * Math.cos(a);
  return { x, z, ry: face(x, z, 0, 0), w: 8.4, d: 6.2 };
})();

/** The room inside. */
export const CASINO_ROOM = { hw: 9, hd: 7 };
export const CASINO_DOOR = { exit: { x: 0, z: 6.3, r: 1.0 }, arrive: { x: 0, z: 4.8, ry: Math.PI } };

/** How high the felt is, and the seats round it. */
export const FELT_Y = 0.8;
export const CHAIR_Y = 0.52;
/** The dealers stand on a step behind their tables, to see over them. */
export const STEP = 0.24;

/** The shop counter along the back wall on the left, with the cashier behind it. */
export const SHOP = { x: -5.4, z: -5.1, w: 4.6, d: 0.9, h: 1.05 };
export const CASHIER: Spot = { x: -5.4, z: -6.15, ry: 0 };

/** The blackjack table: a half moon on the right, round from the middle of its straight edge, the dealer behind that. */
export const BJ_TABLE = { x: 4.4, z: -3.8, r: 1.75 };
export const BJ_DEALER: Spot = { x: BJ_TABLE.x, z: BJ_TABLE.z - 0.45, ry: 0 };
/** Each seat's angle round the curve (0 faces the dealer straight on), left to right as the camera sees it. */
const BJ_ANGLES = [-64, -32, 0, 32, 64].slice(0, BJ_SEATS);
/** On the felt (or past its edge) at seat i's angle, `r` metres from the middle of the straight edge. */
export const bjSpot = (i: number, r: number): Spot => {
  const a = (BJ_ANGLES[i] * Math.PI) / 180;
  return { x: BJ_TABLE.x + Math.sin(a) * r, z: BJ_TABLE.z + Math.cos(a) * r, ry: a };
};
export const bjSeat = (i: number): Spot => {
  const p = bjSpot(i, BJ_TABLE.r + 0.55);
  return { x: p.x, z: p.z, ry: face(p.x, p.z, BJ_TABLE.x, BJ_TABLE.z) };
};

/** The poker table: an oval in front on the left, the dealer at its back. Nine places round it: the dealer's, then eight seats. */
export const PK_TABLE = { x: -3.7, z: 1.5, rx: 2.15, rz: 1.25 };
const pkAngle = (i: number) => ((i + 1) / (PK_SEATS + 1)) * Math.PI * 2;
/** A point round the oval, `out` metres beyond the table's edge, at seat i's angle (-1 is the dealer). */
export const pkAround = (i: number, out: number) => {
  const a = pkAngle(i);
  const x = PK_TABLE.x + Math.sin(a) * (PK_TABLE.rx + out);
  const z = PK_TABLE.z - Math.cos(a) * (PK_TABLE.rz + out);
  return { x, z, ry: face(x, z, PK_TABLE.x, PK_TABLE.z) };
};
export const pkSeat = (i: number): Spot => pkAround(i, 0.62);
export const PK_DEALER: Spot = pkAround(-1, 0.5);

/** Slot machines in a row along the right-hand wall, facing into the room, each with a stool in front. */
export const SLOTS = [-0.4, 0.9, 2.2].slice(0, SL_MACHINES).map((z) => ({ x: CASINO_ROOM.hw - 0.55, z }));
export const slStool = (i: number): Spot => ({ x: SLOTS[i].x - 0.85, z: SLOTS[i].z, ry: Math.PI / 2 });

/**
 * The roulette table, front right: a long table with the wheel at its right-hand end and the betting board on the
 * felt, four seats along the front and one at the left end, the croupier behind the wheel.
 */
export const RL_TABLE = { x: 4.1, z: 2.5, hw: 1.55, hd: 0.68 };
export const RL_WHEEL = { x: RL_TABLE.x + 0.98, z: RL_TABLE.z, r: 0.42 };
/** The board on the felt: its middle, and the size of one cell (14 across, 5 down; see casino/roulette.ts). */
export const RL_BOARD = { x: RL_TABLE.x - 0.52, z: RL_TABLE.z, cw: 0.13, ch: 0.21 };
export const RL_CROUPIER: Spot = { x: RL_WHEEL.x - 0.1, z: RL_TABLE.z - RL_TABLE.hd - 0.5, ry: 0 };
export const rlSeat = (i: number): Spot => {
  if (i === 4) {
    const x = RL_TABLE.x - RL_TABLE.hw - 0.55;
    return { x, z: RL_TABLE.z, ry: Math.PI / 2 };
  }
  return { x: RL_BOARD.x - 0.85 + i * 0.6, z: RL_TABLE.z + RL_TABLE.hd + 0.55, ry: Math.PI };
};
/** Where a seat at the roulette table looks to begin with: between the board and the wheel. */
export const RL_LOOK = { x: (RL_BOARD.x + RL_WHEEL.x) / 2 + 0.1, z: RL_TABLE.z - 0.25 };
/** A board cell's middle on the felt (cells counted from the board's back left corner). */
export const rlCell = (col: number, row: number) => ({ x: RL_BOARD.x + (col - 7) * RL_BOARD.cw, z: RL_BOARD.z + (row - 2.5) * RL_BOARD.ch });
