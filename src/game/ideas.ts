import { create } from 'zustand';
import { loadJSON, saveJSON, uid } from '../lib/util';
import { ui } from '../state/ui';

/**
 * The idea box, on the Storyteller's side: ideas and requests players post, kept in this browser (so they're still
 * here after a reload, and from game to game) until the Storyteller deletes them.
 */
export interface Idea {
  id: string;
  /** Who posted it, by name, and when. */
  who: string;
  text: string;
  at: number;
  /** Ticked off as done. */
  done?: boolean;
}

const KEY = 'ravenswood:ideas';
/** The longest idea, and how many are kept (the oldest go first). */
export const IDEA_MAX = 500;
const KEPT = 300;
/** A player can post one every so often, and only so many a session. */
const IDEA_REST_MS = 10000;
const IDEAS_A_SESSION = 30;

interface Saved {
  list: Idea[];
  /** When the Storyteller last looked at the list, so new ones can be counted. */
  seen: number;
}

export const useIdeas = create<Saved>(() => {
  const s = loadJSON<Partial<Saved>>(KEY, {});
  return { list: Array.isArray(s.list) ? s.list.filter((i) => i && typeof i.text === 'string') : [], seen: Number(s.seen) || 0 };
});
useIdeas.subscribe((s) => saveJSON(KEY, { list: s.list, seen: s.seen }));

/** Ideas that came in since the Storyteller last looked. */
export const unseenIdeas = (s: Saved) => s.list.filter((i) => i.at > s.seen).length;

const posted = new Map<string, { last: number; count: number }>();

export const ideas = {
  /** One in from a player (by their browser's id, for the rate limit). Returns whether it was taken. */
  receive(playerId: string, who: string, raw: string): boolean {
    const text = String(raw ?? '').replace(/\s+\n/g, '\n').trim().slice(0, IDEA_MAX);
    if (!text) return false;
    const p = posted.get(playerId) ?? { last: 0, count: 0 };
    if (Date.now() - p.last < IDEA_REST_MS || p.count >= IDEAS_A_SESSION) return false;
    posted.set(playerId, { last: Date.now(), count: p.count + 1 });
    const name = who.trim().slice(0, 24) || 'Someone';
    useIdeas.setState((s) => ({ list: [...s.list, { id: uid(), who: name, text, at: Date.now() }].slice(-KEPT) }));
    ui.toast(`💡 ${name} left an idea in the idea box`, 'info');
    return true;
  },
  toggle(id: string) {
    useIdeas.setState((s) => ({ list: s.list.map((i) => (i.id === id ? { ...i, done: !i.done } : i)) }));
  },
  remove(id: string) {
    useIdeas.setState((s) => ({ list: s.list.filter((i) => i.id !== id) }));
  },
  /** The Storyteller has looked at the list. */
  seen() {
    useIdeas.setState({ seen: Date.now() });
  },
  /** Every idea as plain text, oldest first, for saving to a file. */
  exportText(): string {
    const list = useIdeas.getState().list;
    return list.map((i) => `${i.done ? '[done] ' : ''}${new Date(i.at).toLocaleString('en-AU')} · ${i.who}\n${i.text}\n`).join('\n');
  },
};
