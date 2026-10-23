import type { ExecMethod, Execution } from '../state/types';

/**
 * The ways to go at an execution, in the order they sit on the wheel. When someone is executed the whole town
 * (the condemned too) gets a few seconds to vote on how; then a wheel spins, each method's slice its share of
 * the votes, and lands on one drawn at random by those shares. The Storyteller may simply choose instead.
 */
export const EXEC_METHODS: { id: ExecMethod; name: string; icon: string; color: string; sign: (name: string) => string }[] = [
  { id: 'hang', name: 'Gallows', icon: '🪢', color: '#a77c52', sign: (n) => `${n} is hanged` },
  { id: 'squad', name: 'Firing squad', icon: '🔫', color: '#c4473a', sign: (n) => `${n} faces the firing squad` },
  { id: 'guillotine', name: 'Guillotine', icon: '🪓', color: '#6f86a8', sign: (n) => `${n} meets the guillotine` },
  { id: 'chair', name: 'Electric chair', icon: '⚡', color: '#e0ad2a', sign: (n) => `${n} gets the electric chair` },
  { id: 'missile', name: 'Missile', icon: '🚀', color: '#7a9c4a', sign: (n) => `${n} is sent sky high` },
  { id: 'roast', name: 'Spit roast', icon: '🔥', color: '#e07a2e', sign: (n) => `${n} is roasted` },
  { id: 'kaiju', name: 'Kaiju', icon: '🦖', color: '#3f9a8c', sign: (n) => `${n} faces the kaiju` },
];

export const isExecMethod = (m: unknown): m is ExecMethod => EXEC_METHODS.some((x) => x.id === m);
export const execMethod = (m: ExecMethod | undefined | null) => EXEC_METHODS.find((x) => x.id === m) ?? EXEC_METHODS[0];

/** How long the vote is open; how long the wheel spins, and stays on its result before the show; a Storyteller's pick shown. */
export const VOTE_MS = 5000;
export const SPIN_MS = 2600;
export const LAND_MS = 900;
export const PICK_MS = 1600;

/** Each method's share of the votes, in wheel order, leaving out those nobody chose (every method alike when nobody voted). */
export function methodShares(picks: Record<string, ExecMethod> | undefined): { id: ExecMethod; share: number }[] {
  const counts = new Map<ExecMethod, number>();
  for (const m of Object.values(picks ?? {})) if (isExecMethod(m)) counts.set(m, (counts.get(m) ?? 0) + 1);
  const total = [...counts.values()].reduce((a, b) => a + b, 0);
  if (!total) return EXEC_METHODS.map((x) => ({ id: x.id, share: 1 / EXEC_METHODS.length }));
  return EXEC_METHODS.filter((x) => counts.has(x.id)).map((x) => ({ id: x.id, share: counts.get(x.id)! / total }));
}

/** The host's draw: a method at random, weighted by the votes. `r` is a number from 0 up to 1. */
export function drawMethod(picks: Record<string, ExecMethod> | undefined, r = Math.random()): ExecMethod {
  const shares = methodShares(picks);
  let at = 0;
  for (const s of shares) {
    at += s.share;
    if (r < at) return s.id;
  }
  return shares[shares.length - 1].id;
}

/** A number from 0 up to 1 from an id, the same on every screen. */
export function idFraction(id: string): number {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) h = Math.imul(h ^ id.charCodeAt(i), 16777619);
  return ((h >>> 0) % 10007) / 10007;
}

/**
 * Where the wheel comes to rest, in turns: several whole turns, then far enough that the pointer (at the top)
 * sits inside the chosen method's slice, at a spot taken from the execution's id so every screen agrees.
 */
export function wheelTurns(ex: Execution): number {
  const shares = methodShares(ex.vote?.picks);
  let start = 0;
  let width = 1;
  for (const s of shares) {
    if (s.id === ex.method) {
      width = s.share;
      break;
    }
    start += s.share;
  }
  const spot = start + width * (0.18 + 0.64 * idFraction(ex.id));
  // The wheel turns clockwise; the slice at `spot` (measured clockwise from the top) comes round to the pointer.
  return 5 + (1 - spot);
}

/** Being voted on right now: no method yet, and the vote still open. */
export const methodPending = (ex: Execution | null | undefined): boolean => Boolean(ex && !ex.method && ex.vote);

/**
 * When the show itself begins (in the same clock as the execution's times): after the wheel and its result, or
 * the Storyteller's pick, or straight away for an execution that came with its method.
 */
export function showStartAt(ex: Execution): number {
  if (!ex.drawn) return ex.at;
  return ex.drawn.at + (ex.drawn.spin ? SPIN_MS + LAND_MS : PICK_MS);
}
