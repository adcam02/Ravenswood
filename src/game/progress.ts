import { useEffect } from 'react';
import { create } from 'zustand';
import type { View } from '../state/view';
import { HATS, type HatId, type Progress } from '../world/types';

const KEY = 'ravenswood:progress';

interface Stored extends Progress {
  /** Things already counted, so a reload doesn't count them twice. Oldest drop off. */
  seen: string[];
}

function load(): Stored {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? 'null') as Partial<Stored> | null;
    return {
      stars: Number(raw?.stars) || 0,
      records: Number(raw?.records) || 0,
      ghosts: Number(raw?.ghosts) || 0,
      nights: Number(raw?.nights) || 0,
      perfect: Array.isArray(raw?.perfect) ? raw!.perfect!.filter((x): x is string => typeof x === 'string').slice(0, 40) : [],
      seen: Array.isArray(raw?.seen) ? raw!.seen!.slice(-400) : [],
    };
  } catch {
    return { stars: 0, records: 0, ghosts: 0, nights: 0, perfect: [], seen: [] };
  }
}

/** What this player has done across all their games, kept in their own browser. */
export const useProgress = create<Stored>(() => load());

function count(kind: 'stars' | 'records' | 'ghosts' | 'nights', key: string) {
  const s = useProgress.getState();
  if (s.seen.includes(key)) return;
  save(s, { ...s, [kind]: s[kind] + 1, seen: [...s.seen, key].slice(-400) });
}

/** A job done perfectly (all five logs, a three-star catch…): its hat, the first time. */
export function notePerfect(job: string) {
  const s = useProgress.getState();
  if (s.perfect.includes(job)) return;
  save(s, { ...s, perfect: [...s.perfect, job] });
}

function save(s: Stored, next: Stored) {
  const before = HATS.filter((h) => h.unlocked(s)).map((h) => h.id);
  useProgress.setState(next);
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* storage blocked: progress lasts this visit */
  }
  const fresh = HATS.filter((h) => h.unlocked(next) && !before.includes(h.id));
  for (const h of fresh) onUnlock?.(h.id);
}

let onUnlock: ((hat: HatId) => void) | null = null;
/** Called when something new is unlocked (to say so on screen). */
export function whenHatUnlocked(fn: (hat: HatId) => void) {
  onUnlock = fn;
}

export function hatUnlocked(hat: HatId | null | undefined): boolean {
  if (!hat) return true;
  const h = HATS.find((x) => x.id === hat);
  return Boolean(h?.unlocked(useProgress.getState()));
}

/** Watches the game for things worth remembering: gold stars, town records, nights in bed, ghostly walks. */
export function useProgressTracker(view: View | null) {
  const me = view?.seats.find((s) => s.isMe);
  const room = view?.room ?? '';
  const day = view?.day ?? 0;
  const phase = view?.phase;
  const star = Boolean(me?.star);
  const dead = Boolean(me?.dead);
  const name = me?.name ?? '';
  const records = view?.town.records;
  useEffect(() => {
    if (!me || view?.mode !== 'player') return;
    if (star) count('stars', `star:${room}:${day}:${me.id}`);
    if (dead) count('ghosts', `ghost:${room}:${me.id}`);
    if (phase === 'night' && day > 0) count('nights', `night:${room}:${day}:${me.id}`);
    if (records && name) {
      for (const [game, r] of Object.entries(records)) if (r.by === name) count('records', `record:${room}:${game}:${r.at}`);
    }
  }, [me, view?.mode, star, dead, phase, day, room, records, name]);
}
