import { create } from 'zustand';
import { loadJSON, saveJSON } from '../lib/util';

const KEY = 'ravenswood:bests';

/** Your own best at each game, kept in this browser. */
export const useBests = create<{ bests: Record<string, number> }>(() => ({ bests: loadJSON<Record<string, number>>(KEY, {}) }));

export function rememberBest(game: string, score: number) {
  const bests = useBests.getState().bests;
  if (score <= (bests[game] ?? 0)) return;
  const next = { ...bests, [game]: score };
  useBests.setState({ bests: next });
  saveJSON(KEY, next);
}
