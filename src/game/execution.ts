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
  { id: 'plane', name: 'Plane crash', icon: '🛩️', color: '#4f8fd0', sign: (n) => `${n} takes a last flight` },
  { id: 'pigeon', name: 'Giant pigeon', icon: '🕊️', color: '#8e7cb8', sign: (n) => `${n} is fed to the chicks` },
  { id: 'moon', name: 'Moon blast', icon: '🌕', color: '#5c6a9a', sign: (n) => `${n} is sent to the moon` },
  { id: 'bench', name: 'Bench press', icon: '🏋️', color: '#b0563c', sign: (n) => `${n} hits the gym` },
  { id: 'noscope', name: '360 no scope', icon: '🎯', color: '#5f7f3a', sign: (n) => `${n} gets no-scoped` },
  { id: 'toaster', name: 'Bath and toaster', icon: '🛁', color: '#4c9cc0', sign: (n) => `${n} takes a last bath` },
  { id: 'nuke', name: 'Nuclear bomb', icon: '☢️', color: '#c2a826', sign: (n) => `${n} goes nuclear` },
  { id: 'cross', name: 'Crucified', icon: '✝️', color: '#b0714e', sign: (n) => `${n} is crucified` },
  { id: 'runover', name: 'Run over', icon: '🚗', color: '#d0473f', sign: (n) => `${n} is run over` },
  { id: 'cliff', name: 'Bonnie and Clyde', icon: '🕶️', color: '#8a6a9c', sign: (n) => `${n} goes out in style` },
  { id: 'magic', name: 'Failed magic trick', icon: '🎩', color: '#7b4fa8', sign: (n) => `${n} is sawn in half` },
  { id: 'mincer', name: 'Meat grinder', icon: '🌭', color: '#c4687a', sign: (n) => `${n} goes through the mincer` },
  { id: 'piano', name: 'Piano', icon: '🎹', color: '#45455a', sign: (n) => `${n} is under the piano` },
  { id: 'brute', name: 'Big green brute', icon: '💪', color: '#5c9a3a', sign: (n) => `${n} meets the brute` },
  { id: 'backflip', name: 'Gallows backflip', icon: '🤸', color: '#c08a3e', sign: (n) => `${n} dives for a perfect ten` },
  { id: 'horse', name: 'Horse kick', icon: '🐴', color: '#8a5a3a', sign: (n) => `${n} is kicked by a horse` },
  { id: 'bowling', name: 'Bowling', icon: '🎳', color: '#3a6ec0', sign: (n) => `${n} is bowled over` },
  { id: 'tanks', name: 'Tanks', icon: '🪖', color: '#6b7a3a', sign: (n) => `${n} meets the tanks` },
  { id: 'hitman', name: 'Silent hitman', icon: '👔', color: '#2e2c36', sign: (n) => `${n} is quietly dealt with` },
  { id: 'paint', name: 'Paint cans', icon: '🪣', color: '#c85a9a', sign: (n) => `${n} is home alone` },
  { id: 'shark', name: 'Paddling pool shark', icon: '🦈', color: '#3a8ab0', sign: (n) => `${n} needs a bigger pool` },
  { id: 'chomp', name: 'Wakka wakka', icon: '🟡', color: '#e6c22a', sign: (n) => `${n} is chomped` },
  { id: 'blocks', name: 'Falling blocks', icon: '🧱', color: '#a050c0', sign: (n) => `${n} is cleared away` },
  { id: 'sling', name: 'Slingshot', icon: '🐦', color: '#d04a3a', sign: (n) => `${n} is slingshotted` },
  { id: 'sting', name: 'Take a seat', icon: '📺', color: '#4a6a8a', sign: (n) => `${n} is asked to take a seat` },
  { id: 'titan', name: 'The snap', icon: '🫰', color: '#7a4aa8', sign: (n) => `${n} is snapped away` },
];

export const isExecMethod = (m: unknown): m is ExecMethod => EXEC_METHODS.some((x) => x.id === m);
export const execMethod = (m: ExecMethod | undefined | null) => EXEC_METHODS.find((x) => x.id === m) ?? EXEC_METHODS[0];

/** How long the vote is open; how long the wheel spins, and stays on its result before the show; a Storyteller's pick shown. */
export const VOTE_MS = 5000;
export const SPIN_MS = 2600;
export const LAND_MS = 900;
export const PICK_MS = 1600;

/** How many ways go on the wheel when nobody voted (all of them would be slices too thin to read). */
export const WHEEL_UNVOTED = 8;
/** How many ways each execution offers to vote on. */
export const OFFER_N = 5;

/**
 * The ways an execution offers, drawn at random by the host: ones not yet used this game first (so each game has
 * some variety), topped up from the used ones once fewer than OFFER_N are left. In wheel order.
 */
export function offerMethods(used: readonly ExecMethod[] = [], r: () => number = Math.random): ExecMethod[] {
  const draw = (list: ExecMethod[]) => {
    const out = [...list];
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(r() * (i + 1));
      [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
  };
  const fresh = draw(EXEC_METHODS.map((x) => x.id).filter((m) => !used.includes(m)));
  const old = draw(EXEC_METHODS.map((x) => x.id).filter((m) => used.includes(m)));
  const pick = [...fresh, ...old].slice(0, OFFER_N);
  return EXEC_METHODS.map((x) => x.id).filter((m) => pick.includes(m));
}

/** The ways on offer at an execution: its own five, or (from before there was an offer) every way. */
export const offered = (ex: Execution | null | undefined): typeof EXEC_METHODS =>
  ex?.offer?.length ? EXEC_METHODS.filter((x) => ex.offer!.includes(x.id)) : EXEC_METHODS;

/**
 * Each method's share of the votes, in wheel order, leaving out those nobody chose. When nobody voted, the ways
 * on offer get a slice each (or, from before there was an offer, a handful chosen by the execution's `id`, the
 * same on every screen).
 */
export function methodShares(picks: Record<string, ExecMethod> | undefined, id = '', offer?: readonly ExecMethod[]): { id: ExecMethod; share: number }[] {
  const counts = new Map<ExecMethod, number>();
  for (const m of Object.values(picks ?? {})) if (isExecMethod(m)) counts.set(m, (counts.get(m) ?? 0) + 1);
  const total = [...counts.values()].reduce((a, b) => a + b, 0);
  if (!total && offer?.length) {
    const some = EXEC_METHODS.filter((x) => offer.includes(x.id));
    return some.map((x) => ({ id: x.id, share: 1 / some.length }));
  }
  if (!total) {
    const order = EXEC_METHODS.map((x, i) => ({ id: x.id, i, r: idFraction(`${id}:${x.id}`) })).sort((a, b) => a.r - b.r);
    const some = order.slice(0, WHEEL_UNVOTED).sort((a, b) => a.i - b.i);
    return some.map((x) => ({ id: x.id, share: 1 / some.length }));
  }
  return EXEC_METHODS.filter((x) => counts.has(x.id)).map((x) => ({ id: x.id, share: counts.get(x.id)! / total }));
}

/** The host's draw: a method at random, weighted by the votes. `r` is a number from 0 up to 1. */
export function drawMethod(picks: Record<string, ExecMethod> | undefined, r = Math.random(), id = '', offer?: readonly ExecMethod[]): ExecMethod {
  const shares = methodShares(picks, id, offer);
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
  const shares = methodShares(ex.vote?.picks, ex.id, ex.offer);
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
