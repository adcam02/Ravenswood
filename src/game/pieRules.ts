/**
 * The pie-eating contest's rules, on their own so both sides share them. Anyone in the tavern calls a contest at the
 * pie table; for the next while anyone else in the tavern can pull up a chair (two to eight eaters). Then a count of
 * three, and everyone taps as fast as they can: each tap is a bite, `bites` of them to a pie, and the first to finish
 * `pies` pies wins (or whoever has eaten most when time runs out). The winner gets `prize` from the house, once a day
 * and inside the day's minigame cap; everyone else gets a participation ribbon.
 */
import type { PieContest } from '../state/types';

export const PIE = {
  minEaters: 2,
  maxEaters: 8,
  /** Pulling up a chair, before it starts. */
  joinMs: 15000,
  /** Three, two, one. */
  countMs: 3000,
  /** Time to eat, before whoever's eaten most wins. */
  eatMs: 40000,
  /** The result, before the table's free again. */
  overMs: 9000,
  bites: 10,
  pies: 3,
  /** The fastest anyone can honestly tap (bites a second), so a page sending more is held to it. */
  maxRate: 13,
  prize: 3,
  /** Bites are sent this often while eating (not every tap). */
  sendMs: 250,
};

/** Everything it takes to finish. */
export const PIE_BITES = PIE.bites * PIE.pies;

/** Where the contest is held. */
export const PIE_ZONE = 'tavern';

/** Why a contest can't be held just now (null: it can). Not by night, nor while the town is deciding someone's fate. */
export function pieBlocked(
  g: { phase: string; day: number; revealed?: boolean; nomination: { status: string } | null; execution: { at: number; vote?: { until: number }; drawn?: { at: number } } | null },
  now = Date.now(),
): string | null {
  if (g.phase === 'night' && (g.revealed || g.day > 0)) return 'Not at night: everyone’s home in bed.';
  if (g.nomination && g.nomination.status !== 'done') return 'Not while there’s a nomination on.';
  // (The execution stays on the books all day; its vote and show are what count.)
  const ex = g.execution;
  if (ex && (now < (ex.vote?.until ?? 0) || now - Math.max(ex.at, ex.drawn?.at ?? 0) < EXEC_MS)) return 'Not during an execution.';
  return null;
}

/** How long an execution's show is given, once its method is settled. */
const EXEC_MS = 90000;

/** Whether a contest is still going (gathering, counting down or eating). */
export const pieOn = (p: PieContest | null | undefined) => Boolean(p && p.stage !== 'over');
