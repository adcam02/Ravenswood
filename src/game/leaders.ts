/**
 * The leaderboard on the tavern wall: the richest players, the most games won, the most achievements and the pet
 * pit's champions. Only the Storyteller's browser has everyone's profile, so it works the board out (leadersNow) and
 * sends it to everyone with the public state; a player's screen reads it from there (useLeaders).
 *
 * It also says who owns the trophy hat, for the little crown by their name.
 */
import { useClient } from '../net/client';
import type { Leaders } from '../state/types';
import { TROPHY_HAT } from '../world/types';
import { nameKey, useProfiles, winsOf, type Profile } from './profiles';

/** How many names on each list. */
const ROWS = 5;

const top = (list: Profile[], n: (p: Profile) => number) =>
  list
    .map((p) => ({ name: p.name, n: n(p) }))
    .filter((r) => r.n > 0)
    .sort((a, b) => b.n - a.n || a.name.localeCompare(b.name))
    .slice(0, ROWS);

let cache: { from: unknown; board: Leaders } | null = null;

/** The board as it stands (the Storyteller's browser: from every profile here). Worked out again only when a profile changes. */
export function leadersNow(): Leaders {
  const { profiles } = useProfiles.getState();
  if (cache?.from === profiles) return cache.board;
  const list = Object.values(profiles);
  const board: Leaders = {
    rich: top(list, (p) => p.coins),
    wins: top(list, winsOf),
    feats: top(list, (p) => p.feats.length),
    pit: top(list, (p) => p.tally.pitwins ?? 0),
    crowns: list.filter((p) => p.items.includes(`hat:${TROPHY_HAT}`)).map((p) => nameKey(p.name)),
  };
  cache = { from: profiles, board };
  return board;
}

/** The board on this screen: sent by the Storyteller to a player, or worked out here on the Storyteller's own. */
export function useLeaders(mode: 'st' | 'player'): Leaders | null {
  const sent = useClient((s) => s.pub?.leaders ?? null);
  const profiles = useProfiles((s) => (mode === 'st' ? s.profiles : null));
  return mode === 'st' ? (profiles ? leadersNow() : null) : sent;
}

/** Whether someone by this name owns the trophy hat (and so has a crown by their name). */
export function crowned(name: string | null | undefined): boolean {
  if (!name) return false;
  const pub = useClient.getState().pub;
  const crowns = pub ? (pub.leaders?.crowns ?? []) : leadersNow().crowns;
  return crowns.includes(nameKey(name));
}
