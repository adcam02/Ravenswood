/**
 * The pet pit's rules, on their own so both sides (and a quick test) share them. Each round both owners pick in
 * secret, then both picks are shown together:
 *   Attack  1 damage, plus 1 for every charge stored (an attack spends them all, even one that's blocked).
 *   Block   catches an attack: it does nothing, and the blocker hits back for a flat 2. Against anything else it
 *           does nothing. A block can't follow a block (no hiding behind it every round).
 *   Charge  stores +1 for the next attack, up to three. Charging while being attacked takes the hit, but the
 *           charge still goes in.
 * Five hearts each; the first to none loses, and both at once is a draw.
 */
import type { PitFight, PitMove, PitRound, PitState } from '../state/types';

export const PIT = {
  hearts: 5,
  maxCharge: 3,
  /** A block's hit back. */
  counter: 2,
  /** Walking into the ring. */
  introMs: 3500,
  /** Time to pick, before a pick is made for you. */
  pickMs: 10000,
  /** The reveal playing out (the lunge, the hit, the hearts). */
  revealMs: 3800,
  /** The result, before the ring is free again. */
  overMs: 8000,
  /** A challenge left unanswered goes away. */
  challengeMs: 30000,
  /** From the house: the winner's prize, and each side's for a draw (nothing: nobody won). */
  prize: 5,
  drawPrize: 0,
  /** Prizes a player can win in a day (the house isn't made of money, and fighting a friend over and over shouldn't
   * pay more than playing a game). */
  dailyWins: 5,
  /** Out of the cellar (or gone quiet) this long and you've walked out of the fight. */
  leaveMs: 3000,
};

export const MOVES: PitMove[] = ['attack', 'block', 'charge'];

/** Whether a move is allowed after last round's. */
export const allowed = (move: PitMove, last: PitMove | null) => !(move === 'block' && last === 'block');

/** A move picked for someone who ran out of time: any they're allowed. */
export function randomMove(last: PitMove | null, rand = Math.random): PitMove {
  const ok = MOVES.filter((m) => allowed(m, last));
  return ok[Math.floor(rand() * ok.length) % ok.length];
}

/** One round: what each side does to the other, and how they stand after it. */
export function resolveRound(
  n: number,
  sides: [{ hp: number; charge: number }, { hp: number; charge: number }],
  moves: [PitMove, PitMove],
  random: [boolean, boolean] = [false, false],
): PitRound {
  const dmg: [number, number] = [0, 0];
  const countered: [boolean, boolean] = [false, false];
  const power: [number, number] = [0, 0];
  const charge: [number, number] = [sides[0].charge, sides[1].charge];
  for (const i of [0, 1] as const) {
    const o = i === 0 ? 1 : 0;
    if (moves[i] === 'attack') {
      power[i] = 1 + sides[i].charge;
      charge[i] = 0;
      if (moves[o] === 'block') {
        countered[o] = true;
        dmg[i] += PIT.counter;
      } else dmg[o] += power[i];
    } else if (moves[i] === 'charge') charge[i] = Math.min(PIT.maxCharge, sides[i].charge + 1);
  }
  const hp: [number, number] = [Math.max(0, sides[0].hp - dmg[0]), Math.max(0, sides[1].hp - dmg[1])];
  return { n, moves, random, dmg, countered, power, was: [sides[0].hp, sides[1].hp], had: [sides[0].charge, sides[1].charge], hp, charge };
}

/**
 * When things happen as a round is revealed, in seconds from the reveal: both moves shown, the lunge, the blow
 * landing, and a block's two hits back. Everything watching (the ring, the hearts on screen) keeps to these.
 */
export const BEATS = { lunge: 0.5, impact: 0.8, counter: [1.45, 1.9] as const, home: 2.6 };

/** A side's hearts as shown `age` seconds into a round's reveal. */
export function heartsAt(r: PitRound, i: 0 | 1, age: number): number {
  const o = i === 0 ? 1 : 0;
  if (r.countered[o]) {
    const hits = BEATS.counter.filter((at) => age >= at).length;
    return Math.max(r.hp[i], r.was[i] - hits * (PIT.counter / BEATS.counter.length));
  }
  return age >= BEATS.impact ? r.hp[i] : r.was[i];
}

/** Who has won after a round: a side's index, 'draw', or null while both are standing. */
export function outcome(hp: [number, number]): 0 | 1 | 'draw' | null {
  if (hp[0] <= 0 && hp[1] <= 0) return 'draw';
  if (hp[1] <= 0) return 0;
  if (hp[0] <= 0) return 1;
  return null;
}

/** The pit as players see it: nobody's pick, and none of the house's books. */
export function pitPublic(p: PitState): PitState {
  const hide = (f: PitFight | null): PitFight | null => f && { ...f, sides: [{ ...f.sides[0], move: undefined }, { ...f.sides[1], move: undefined }] };
  return { rings: (p.rings ?? []).map(hide), challenges: p.challenges, board: p.board };
}
