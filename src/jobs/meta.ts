// The light part of the minigames: names, results and how they score. The games themselves load on demand.
import type { BakeKind, ClothKind, DrinkKind, FlowerKind } from '../world/types';
import type { FishTier } from './Fishing';

export type { FishTier };

export type GameJob = 'bartender' | 'laundry' | 'fishing' | 'baking' | 'gardening' | 'darts' | 'bread' | 'wine' | 'firewood' | 'skimming' | 'coin';

export interface JobResults {
  bartender: { kind: DrinkKind; stars: number };
  laundry: { kind: ClothKind; color: string; stars: number };
  /** null when it got away or the line snapped. */
  fishing: { kind: string; cm: number; stars: number; tier: FishTier } | null;
  baking: { kind: BakeKind; stars: number };
  gardening: { kind: FlowerKind; color: string; stars: number };
  darts: { score: number; stars: number };
  /** evenness 0..100 */
  bread: { evenness: number; stars: number };
  /** fill 0..100, what ended up in the chalice */
  wine: { fill: number; stars: number };
  /** clean splits out of 5 */
  firewood: { logs: number; stars: number };
  skimming: { bounces: number; stars: number };
  /** landed in the well → a one-line fortune */
  coin: { wish: boolean; stars: number; fortune: string };
}

/** The number that counts for records, per game. */
export const SCORE_OF: {
  [J in GameJob]: (r: NonNullable<JobResults[J]>) => number;
} = {
  bartender: (r) => r.stars,
  laundry: (r) => r.stars,
  fishing: (r) => r.cm,
  baking: (r) => r.stars,
  gardening: (r) => r.stars,
  darts: (r) => r.score,
  bread: (r) => r.evenness,
  wine: (r) => r.fill,
  firewood: (r) => r.logs,
  skimming: (r) => r.bounces,
  coin: (r) => (r.wish ? 1 : 0),
};

const starsLabel = (s: number) => `${s} star${s === 1 ? '' : 's'}`;

/** "42cm", "120 points", "87% even", "4 skips"… */
export const SCORE_LABEL: Record<GameJob, (score: number) => string> = {
  bartender: starsLabel,
  laundry: starsLabel,
  fishing: (s) => `${s}cm`,
  baking: starsLabel,
  gardening: starsLabel,
  darts: (s) => `${s} points`,
  bread: (s) => `${s}% even`,
  wine: (s) => `${s}% full`,
  firewood: (s) => `${s} of 5 logs`,
  skimming: (s) => `${s} skip${s === 1 ? '' : 's'}`,
  coin: (s) => (s ? 'a wish' : 'no wish'),
};

export const JOB_TITLES: Record<GameJob, string> = {
  bartender: 'Bartending',
  laundry: 'Laundry',
  fishing: 'Fishing',
  baking: 'Baking',
  gardening: 'Gardening',
  darts: 'Darts',
  bread: 'Breaking bread',
  wine: 'Pouring the wine',
  firewood: 'Chopping wood',
  skimming: 'Stone skimming',
  coin: 'Wishing well',
};

/** What to beat: your own best and the town's, in the game's score. */
export interface Bests {
  personal?: number;
  town?: { by: string; score: number };
}
