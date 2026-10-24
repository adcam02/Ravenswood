/**
 * Players' browsers keep a copy of the Storyteller's book of profiles, so nobody loses their money, pets and
 * achievements if the Storyteller's browser loses the book (its storage cleared, or someone else hosting).
 *
 * The Storyteller sends a copy as each player arrives and, while things change, at most every 30 seconds
 * (net/host.ts). Each browser keeps the latest copy of each of the last few books it has seen.
 *
 * A Storyteller whose book is new (nothing here from before this visit), or older than the players' copies, asks the
 * players for their copies as they arrive and offers to restore them. Each name comes back as the version most copies
 * agree on, the newest if it's a tie, so one player editing their own copy can't give themselves a fortune. Books are
 * never mixed: of several, the one most players keep is offered. The Storyteller decides (RestorePrompt), and a
 * restore works just like importing a file.
 */
import { useMemo } from 'react';
import { create } from 'zustand';
import { debugHooks, loadJSON, saveJSON } from '../lib/util';
import type { BackupCopy, BackupSummary } from '../state/types';
import { cleanProfile, nameKey, profiles, useProfiles, type Profile } from './profiles';

// ---------------------------------------------------------------- a player's side: keeping copies

const KEY = 'ravenswood:backups';
/** Books kept at once: a player might play in more than one Storyteller's town. */
const BOOKS_KEPT = 3;
const PROFILES_MAX = 500;

type Kept = Record<string, BackupCopy & { last: number; got: number }>;

const latest = (c: BackupCopy) => Object.values(c.profiles).reduce<number>((m, p) => Math.max(m, Number((p as Profile)?.updated) || 0), 0);

/** Keeps a copy sent by the Storyteller, in place of any older one of the same book. */
export function keepCopy(raw: unknown) {
  const c = raw as BackupCopy | null;
  if (!c || typeof c.book !== 'string' || !c.profiles || typeof c.profiles !== 'object' || !Object.keys(c.profiles).length) return;
  const kept = loadJSON<Kept>(KEY, {});
  const copy = { book: c.book.slice(0, 40), at: Number(c.at) || Date.now(), done: Array.isArray(c.done) ? c.done : [], profiles: c.profiles };
  const all = { ...kept, [copy.book]: { ...copy, last: latest(copy), got: Date.now() } };
  const keep = Object.values(all)
    .sort((a, b) => b.got - a.got)
    .slice(0, BOOKS_KEPT);
  saveJSON(KEY, Object.fromEntries(keep.map((k) => [k.book, k])));
}

/** The copies kept here, in brief (sent on arriving, so the Storyteller can ask for the ones they need). */
export function keptSummary(): BackupSummary[] {
  return Object.values(loadJSON<Kept>(KEY, {})).map((k) => ({ book: k.book, n: Object.keys(k.profiles ?? {}).length, last: k.last }));
}

/** The copies kept here of these books (or all of them). */
export function keptCopies(books?: string[]): BackupCopy[] {
  return Object.values(loadJSON<Kept>(KEY, {}))
    .filter((k) => !books || books.includes(k.book))
    .map(({ book, at, done, profiles: list }) => ({ book, at, done, profiles: list }));
}

// ---------------------------------------------------------------- the Storyteller's side: gathering them

interface Copy {
  book: string;
  at: number;
  done: string[];
  profiles: Record<string, Profile>;
}

interface Gathered {
  /** Copies players sent, by playerId (one of each book each). */
  copies: Record<string, Copy[]>;
  /** The Storyteller asked for every copy ("Restore from players"), not only the ones worth offering unasked. */
  asked: boolean;
  /** The last offer the Storyteller said no to (or took), so it isn't offered again. */
  answered: string;
}

export const useBackups = create<Gathered>(() => ({ copies: {}, asked: false, answered: '' }));

/** When this page opened: profiles made since are this visit's, so a book with no older ones is a new book. */
const opened = Date.now();
const isNew = (book: Record<string, Profile>) => Object.values(book).every((p) => p.created >= opened);
const newest = (book: Record<string, Profile>) => Object.values(book).reduce((m, p) => Math.max(m, p.updated), 0);

function cleanCopy(raw: unknown): Copy | null {
  const c = raw as BackupCopy | null;
  if (!c || typeof c.book !== 'string' || !c.profiles || typeof c.profiles !== 'object') return null;
  const list: Record<string, Profile> = {};
  for (const [key, p] of Object.entries(c.profiles).slice(0, PROFILES_MAX)) if (nameKey(key)) list[nameKey(key)] = cleanProfile(p, key);
  const done = Array.isArray(c.done) ? c.done.filter((x): x is string => typeof x === 'string' && x.length <= 60).slice(0, 100) : [];
  return { book: c.book.slice(0, 40), at: Math.min(Number(c.at) || 0, Date.now()), done, profiles: list };
}

export const backups = {
  /** Of the copies a player keeps, the books worth asking them for. */
  wanted(kept: unknown): string[] {
    if (!Array.isArray(kept)) return [];
    const { book, profiles: here } = useProfiles.getState();
    const { asked } = useBackups.getState();
    const fresh = isNew(here);
    const last = newest(here);
    return kept
      .filter((k): k is BackupSummary => Boolean(k) && typeof k.book === 'string' && Number(k.n) > 0)
      .filter((k) => (k.book === book ? Number(k.last) > last + 1000 : fresh || asked))
      .map((k) => k.book)
      .slice(0, BOOKS_KEPT);
  },
  /** Copies a player sent. */
  receive(playerId: string, raw: unknown) {
    if (!Array.isArray(raw)) return;
    const copies = raw.slice(0, BOOKS_KEPT).map(cleanCopy).filter((c): c is Copy => Boolean(c));
    if (!copies.length) return;
    useBackups.setState((s) => ({ copies: { ...s.copies, [playerId]: copies } }));
  },
  /** "Restore from players": every copy, from everyone here and everyone who arrives. */
  ask() {
    useBackups.setState({ asked: true, answered: '' });
  },
  /** Not now. */
  dismiss(o: Offer) {
    useBackups.setState({ asked: false, answered: o.sig });
  },
  /** Restores an offer, as an import (into a new book, the players' book is taken over whole). */
  restore(o: Offer): number | string {
    const text = JSON.stringify({ ravenswood: 'profiles', v: 1, book: o.book, done: o.done, profiles: o.profiles });
    const got = profiles.importJSON(text, isNew(useProfiles.getState().profiles));
    useBackups.setState({ asked: false, answered: o.sig });
    return got;
  },
};

/** What restoring the players' copies would bring back. */
export interface Offer {
  book: string;
  /** It's this browser's own book (players have newer copies of some of it). */
  ours: boolean;
  /** Only the profiles that would change, by name key. */
  profiles: Record<string, Profile>;
  done: string[];
  /** How many players' copies of this book there are. */
  copies: number;
  /** The latest change in it. */
  at: number;
  sig: string;
}

/**
 * Many copies of one book, made into one: for each name, the version most copies agree on (the newest of those if
 * there's a tie). Kept achievements (the `done` list) need half the copies to agree.
 */
function agree(copies: Copy[]): { profiles: Record<string, Profile>; done: string[] } {
  const now = Date.now();
  const versions = new Map<string, Map<string, { p: Profile; n: number }>>();
  const doneCount = new Map<string, number>();
  for (const c of copies) {
    for (const [key, p] of Object.entries(c.profiles)) {
      const forKey = versions.get(key) ?? new Map<string, { p: Profile; n: number }>();
      versions.set(key, forKey);
      const sig = JSON.stringify(p);
      const v = forKey.get(sig);
      if (v) v.n += 1;
      else forKey.set(sig, { p, n: 1 });
    }
    for (const d of new Set(c.done)) doneCount.set(d, (doneCount.get(d) ?? 0) + 1);
  }
  const out: Record<string, Profile> = {};
  for (const [key, forKey] of versions) {
    const best = [...forKey.values()].sort((a, b) => b.n - a.n || Math.min(b.p.updated, now) - Math.min(a.p.updated, now))[0];
    out[key] = best.p;
  }
  const done = [...doneCount].filter(([, n]) => n * 2 >= copies.length).map(([d]) => d);
  return { profiles: out, done };
}

/** The best offer among the copies gathered, or null if there's nothing worth restoring. */
function bestOffer(g: Gathered, book: string, here: Record<string, Profile>): Offer | null {
  const byBook = new Map<string, Copy[]>();
  for (const list of Object.values(g.copies)) for (const c of list) byBook.set(c.book, [...(byBook.get(c.book) ?? []), c]);
  const offers: Offer[] = [];
  const others = isNew(here) || g.asked;
  for (const [b, copies] of byBook) {
    const ours = b === book;
    if (!ours && !others) continue;
    const merged = agree(copies);
    // Of this browser's own book, only what the players have newer; of another, all of it.
    const list = ours ? Object.fromEntries(Object.entries(merged.profiles).filter(([key, p]) => p.updated > (here[key]?.updated ?? -1))) : merged.profiles;
    const n = Object.keys(list).length;
    if (!n) continue;
    const at = newest(list);
    offers.push({ book: b, ours, profiles: list, done: merged.done, copies: copies.length, at, sig: `${b}:${at}:${n}` });
  }
  // Our own book first; otherwise the one most players keep, the newest if tied.
  return offers.sort((a, b) => Number(b.ours) - Number(a.ours) || b.copies - a.copies || b.at - a.at)[0] ?? null;
}

/** The offer to put to the Storyteller, if any (including one they've already answered: see `answered`). */
export function useOffer(): Offer | null {
  const g = useBackups();
  const book = useProfiles((s) => s.book);
  const here = useProfiles((s) => s.profiles);
  return useMemo(() => bestOffer(g, book, here), [g, book, here]);
}

/** The offer to put to the Storyteller now, if there's one they haven't answered. */
export function currentOffer(): Offer | null {
  const g = useBackups.getState();
  const { book, profiles: here } = useProfiles.getState();
  const o = bestOffer(g, book, here);
  return o && o.sig !== g.answered ? o : null;
}

/** The copies gathered so far, and from how many players (for the Profiles panel). */
export function useGathered(): number {
  return useBackups((s) => Object.keys(s.copies).length);
}

if (debugHooks()) Object.assign(window, { __backups: { store: useBackups, backups, currentOffer, kept: keptCopies } });
