import { create } from 'zustand';
import { loadJSON, saveJSON } from '../lib/util';

/**
 * Nicknames a player has given other players, which only they see (Luke can call Xengeath "Tyler" on his own
 * screen; everyone else still sees Xengeath). Kept in this browser, keyed by the other player's name in lower case,
 * so they last across reloads and new games. They never go to the Storyteller or change the game.
 */
const KEY = 'ravenswood:nicknames';

export const useNicks = create<Record<string, string>>(() => loadJSON<Record<string, string>>(KEY, {}));

const keyOf = (name: string) => name.trim().toLowerCase();

export const nicks = {
  /** Call `name` this from now on (empty, or their own name, clears it). */
  set(name: string, nick: string | null) {
    const k = keyOf(name);
    if (!k) return;
    const nn = (nick ?? '').trim().slice(0, 24);
    const next = { ...useNicks.getState() };
    if (nn && nn.toLowerCase() !== k) next[k] = nn;
    else delete next[k];
    useNicks.setState(next, true);
    saveJSON(KEY, next);
  },
};

/** The nickname this player has given someone with this name, if any. */
export function nickFor(name: string | null | undefined, map = useNicks.getState()): string | null {
  return (name && map[keyOf(name)]) || null;
}

/**
 * The name to show for someone on this screen: the nickname this player gave them, or their own name. Everything
 * that puts a player's name in front of the viewer should go through this (or a seat's `label`, which does).
 */
export function shownName(name: string | null | undefined, fallback = 'Someone', map = useNicks.getState()): string {
  return nickFor(name, map) ?? (name || fallback);
}

/** The nickname with the real name beside it ("Tyler (Xengeath)"), for menus and lists with room for both. */
export function withReal(name: string | null | undefined, fallback = 'Someone', map = useNicks.getState()): string {
  const nick = nickFor(name, map);
  return nick ? `${nick} (${name})` : name || fallback;
}
