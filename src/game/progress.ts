import { useEffect } from 'react';
import { create } from 'zustand';
import { useNotes } from '../state/notes';
import type { View } from '../state/view';
import { FEATS, HATS, type FeatId, type HatId, type Progress } from '../world/types';

const KEY = 'ravenswood:progress';

interface Stored extends Progress {
  /** Things already counted, so a reload doesn't count them twice. Oldest drop off. */
  seen: string[];
  /** Running counts toward achievements. */
  tally: Partial<Record<TallyKey, number>>;
}

function tallyOf(raw: unknown): Stored['tally'] {
  const out: Stored['tally'] = {};
  if (!raw || typeof raw !== 'object') return out;
  for (const [k, v] of Object.entries(raw)) if (Number.isFinite(Number(v))) out[k as TallyKey] = Number(v);
  return out;
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
      feats: Array.isArray(raw?.feats) ? raw!.feats!.filter((x): x is string => typeof x === 'string').slice(0, 80) : [],
      seen: Array.isArray(raw?.seen) ? raw!.seen!.slice(-400) : [],
      tally: tallyOf(raw?.tally),
    };
  } catch {
    return { stars: 0, records: 0, ghosts: 0, nights: 0, perfect: [], feats: [], seen: [], tally: {} };
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

/** An achievement, the first time (its hat, if it has one, unlocks with it). */
export function earn(feat: FeatId) {
  const s = useProgress.getState();
  if (s.feats.includes(feat) || !FEATS.some((f) => f.id === feat)) return;
  save(s, { ...s, feats: [...s.feats, feat] });
  onFeat?.(feat);
}

/** Running counts toward achievements, and the count each needs. */
export type TallyKey = 'fish' | 'kinds' | 'wishes' | 'snacks' | 'votes' | 'letters' | 'games' | 'talk' | 'gifts';
const GOALS: Record<TallyKey, [number, FeatId]> = {
  fish: [10, 'angler'],
  kinds: [8, 'trainer'],
  wishes: [10, 'lucky'],
  snacks: [20, 'peckish'],
  votes: [10, 'voter'],
  letters: [5, 'postie'],
  games: [5, 'regular'],
  talk: [600, 'chatterbox'],
  gifts: [5, 'generous'],
};

/** Adds to a count (once per `key`, if one is given, so a reload doesn't count it twice). */
export function tally(kind: TallyKey, by = 1, key?: string) {
  const s = useProgress.getState();
  if (key && s.seen.includes(key)) return;
  const n = (s.tally[kind] ?? 0) + by;
  save(s, { ...s, tally: { ...s.tally, [kind]: n }, seen: key ? [...s.seen, key].slice(-400) : s.seen });
  const [goal, feat] = GOALS[kind];
  if (n >= goal) earn(feat);
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

let onFeat: ((feat: FeatId) => void) | null = null;
/** Called when an achievement is earned (to say so on screen). */
export function whenFeat(fn: (feat: FeatId) => void) {
  onFeat = fn;
}

export function hatUnlocked(hat: HatId | null | undefined): boolean {
  if (!hat) return true;
  const h = HATS.find((x) => x.id === hat);
  return Boolean(h?.unlocked(useProgress.getState()));
}

/** ↑ ↑ ↓ ↓ ← → ← → B A, typed anywhere but a text box. */
const KONAMI = ['arrowup', 'arrowup', 'arrowdown', 'arrowdown', 'arrowleft', 'arrowright', 'arrowleft', 'arrowright', 'b', 'a'];
function useSecretCode(on: boolean) {
  useEffect(() => {
    if (!on) return;
    let at = 0;
    const onKey = (e: KeyboardEvent) => {
      const el = document.activeElement as HTMLElement | null;
      if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable)) return;
      const k = e.key.toLowerCase();
      at = k === KONAMI[at] ? at + 1 : k === KONAMI[0] ? 1 : 0;
      if (at === KONAMI.length) {
        at = 0;
        earn('konami');
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [on]);
}

/**
 * Watches the game for things worth remembering: gold stars, town records, nights in bed, ghostly walks, and the
 * achievements that come from how the game goes (votes, nominations, the gallows, winning and losing).
 */
export function useProgressTracker(view: View | null) {
  const player = view?.mode === 'player';
  useSecretCode(player);
  const meNow = view?.seats.find((s) => s.isMe);
  const ended = view?.ended;
  const history = view?.history;
  const nom = view?.nomination;
  const execution = view?.execution;
  useEffect(() => {
    if (!player || !meNow) return;
    const room = view?.room ?? '';
    if (nom?.nomineeId === meNow.id) earn('nominated');
    if (nom?.nominatorId === meNow.id) earn('nominator');
    if (execution?.seatId === meNow.id) earn(execution.survives ? 'spared' : 'gallows');
    for (const r of history ?? []) if (r.voters.includes(meNow.id)) tally('votes', 1, `vote:${room}:${r.id}`);
    // A dead player whose ghost vote is gone has used it.
    if (meNow.dead && !meNow.ghostVote) earn('ghostvote');
    // Three different players put up for execution by us in one game.
    const accused = new Set((history ?? []).filter((r) => r.nominatorId === meNow.id).map((r) => r.nomineeId));
    if (nom?.nominatorId === meNow.id) accused.add(nom.nomineeId);
    if (accused.size >= 3) earn('conspiracy');
    // (Months count from nought: 9 is October.)
    if (new Date().getMonth() === 9) earn('spooky');
    if (ended) {
      tally('games', 1, `game:${room}:${ended.at}`);
      // Our notepad's guesses against who everyone really was, now it's all out in the open.
      const guesses = useNotes.getState().notes;
      const right = (view?.seats ?? []).filter((s) => !s.isMe && s.roleId && guesses[s.id]?.guess === s.roleId).length;
      if (right >= 3) earn('detective');
      if (!meNow.dead) earn('survivor');
      if (meNow.alignment && meNow.alignment === ended.winner) earn(ended.winner === 'good' ? 'goodwin' : 'evilwin');
    }
  }, [player, meNow, ended, history, nom, execution, view?.room]);

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
