/**
 * Town-wide hide and seek: the timings and rules both sides share. A round gathers everyone online (anyone can sit
 * it out), the host picks a seeker (two from eight players), the seekers are blindfolded in the square while the
 * rest hide anywhere in town, then the seekers have three minutes to tag them. Anyone found seeks too. Hiders can
 * squeak a taunt now and then, and in the last minute they squeak whether they like it or not.
 */
import type { HidePropKind, HideRound } from '../state/types';

export const HIDE = {
  /** Everyone's in unless they say not, for this long. */
  gatherMs: 10000,
  hideMs: 45000,
  seekMs: 180000,
  /** The result, before the town's back to normal. */
  overMs: 14000,
  /** From this many players, two seek. */
  twoSeekersFrom: 8,
  /** A seeker tags a hider this close (metres, in the same place). */
  tagR: 2.4,
  /** Between a seeker's tries. */
  tagGapMs: 700,
  /** Between a hider's own taunts. */
  tauntGapMs: 8000,
  /** In the last minute everyone still hidden squeaks this often (each a little after the last). */
  forcedFromMs: 60000,
  forcedGapMs: 12000,
  /** A taunt is heard this far off (metres, in the same place), fading out. */
  tauntR: 32,
  /** Prizes, from the house: within the day's minigame allowance (profiles.ts PAY.jobDaily). */
  survivePrize: 5,
  lastPrize: 3,
  bestPrize: 3,
  /** Gone this long (no word of where they are) and you've left the round. */
  goneMs: 30000,
};

export const PROPS: { kind: HidePropKind; label: string; icon: string }[] = [
  { kind: 'barrel', label: 'Barrel', icon: '🛢️' },
  { kind: 'bush', label: 'Bush', icon: '🌳' },
  { kind: 'crate', label: 'Crate', icon: '📦' },
];

/** A round with its times moved onto this browser's clock. */
export function hideHere(r: HideRound | null | undefined, offset: number): HideRound | null {
  if (!r) return null;
  return {
    ...r,
    until: r.until - offset,
    seekAt: r.seekAt === undefined ? undefined : r.seekAt - offset,
    players: r.players.map((p) => ({ ...p, foundAt: p.foundAt === undefined ? undefined : p.foundAt - offset, tauntAt: p.tauntAt === undefined ? undefined : p.tauntAt - offset })),
    feed: r.feed.map((f) => ({ ...f, at: f.at - offset })),
    taunts: r.taunts.map((t) => ({ ...t, at: t.at - offset })),
  };
}

/** Hiders still out there. */
export const hidersLeft = (r: HideRound) => r.players.filter((p) => p.role === 'hider').length;

/** Somewhere out of bounds: your own flat (or the old bedrooms), where nobody else can come looking. */
export const offLimits = (zone: string) => zone.startsWith('flat:') || zone.startsWith('house:');
