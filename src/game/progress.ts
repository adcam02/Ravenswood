import { useEffect } from 'react';
import { create } from 'zustand';
import { getRole } from '../data';
import { uid } from '../lib/util';
import { clientLink, useClient } from '../net/client';
import { useNotes } from '../state/notes';
import type { PayLine, PrivateState, ProfileView, ProgressEvent, ProgressSnapshot, VoteRecord } from '../state/types';
import type { View } from '../state/view';
import { FEATS, HAT_SPEED, HATS, PETS, hatsOwned, type FeatId, type HatId, type PetId } from '../world/types';
import { applyEvent, cleanSnapshot, mergeSnapshot } from './profiles';

const KEY = 'ravenswood:progress';

/**
 * This browser's copy of the player's profile. The Storyteller keeps the real one under their name (game/profiles.ts):
 * things earned here are added straight away and reported (`pending`) until the Storyteller has counted them, and
 * whatever the Storyteller sends back is what's kept.
 */
interface Stored extends ProgressSnapshot {
  /** Things already counted, so a reload doesn't count them twice. Oldest drop off. */
  seen: string[];
  /** Money, and pets owned, as the Storyteller last said (only they change these). */
  coins: number;
  pets: PetId[];
  /** Whose profile this is (a name, lower case); null for progress from before profiles, not yet anyone's. */
  owner: string | null;
  /** The Storytellers' books (and names) this browser's progress has gone into, so it's only merged in once. */
  merged: string[];
  /** Reports the Storyteller hasn't counted yet. */
  pending: ProgressEvent[];
}

function load(): Stored {
  let raw: Partial<Stored> | null = null;
  try {
    raw = JSON.parse(localStorage.getItem(KEY) ?? 'null') as Partial<Stored> | null;
  } catch {
    /* storage blocked: progress lasts this visit */
  }
  const list = <T,>(v: unknown, n: number): T[] => (Array.isArray(v) ? (v.slice(-n) as T[]) : []);
  return {
    ...cleanSnapshot(raw),
    seen: list<string>(raw?.seen, 400).filter((x) => typeof x === 'string'),
    coins: Math.max(0, Math.floor(Number(raw?.coins) || 0)),
    pets: list<PetId>(raw?.pets, 40).filter((x) => PETS.some((p) => p.id === x)),
    owner: typeof raw?.owner === 'string' ? raw.owner : null,
    merged: list<string>(raw?.merged, 20).filter((x) => typeof x === 'string'),
    pending: list<ProgressEvent>(raw?.pending, 300).filter((e) => e && typeof e === 'object' && typeof e.k === 'string'),
  };
}

/** What's kept in this browser. */
let real: Stored = load();
/** The profile of the name being joined with, before taking a seat (so the hat picker shows their hats). */
let preview: ProfileView | null = null;

const fromView = (p: ProfileView) => ({
  stars: p.stars,
  records: p.records,
  ghosts: p.ghosts,
  nights: p.nights,
  perfect: p.perfect,
  feats: p.feats,
  tally: p.tally,
  coins: p.coins,
  pets: p.pets,
});

/** What to show: our own copy, or while joining, that with the profile of the name we're joining as. */
function shown(): Stored {
  if (!preview) return real;
  const base = { ...real, ...fromView(preview) };
  return real.owner === null || real.owner === preview.key ? mergeSnapshot(base, real) : base;
}

/** What this player has done across all their games (their profile, as this browser has it). */
export const useProgress = create<Stored>(() => real);

/** My money and my pets, as the Storyteller last said. */
export const useMoney = () => useProgress((s) => s.coins);
export const useMyPets = () => useProgress((s) => s.pets);

/** Money in and out lately (newest last, `at` on the Storyteller's clock), for the little pops by the money. */
export const usePay = create<{ pay: PayLine[] }>(() => ({ pay: [] }));

function keep(next: Stored) {
  real = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* storage blocked: progress lasts this visit */
  }
  useProgress.setState(shown(), true);
}

const hatsOf = (p: Stored) => HATS.filter((h) => h.unlocked(p)).map((h) => h.id);

/** Something earned here: counted straight away, and reported to the Storyteller. */
function record(ev: ProgressEvent, seen?: string) {
  const before = hatsOf(useProgress.getState());
  keep(applyEvent({ ...real, seen: seen ? [...real.seen, seen].slice(-400) : real.seen, pending: [...real.pending, ev].slice(-300) }, ev));
  const after = useProgress.getState();
  for (const h of HATS) if (h.unlocked(after) && !before.includes(h.id)) onUnlock?.(h.id);
  sendSoon(400);
}

function count(kind: 'stars' | 'records' | 'ghosts' | 'nights', key: string) {
  if (real.seen.includes(key)) return;
  record({ k: key, e: 'count', kind }, key);
}

/** A job done perfectly (all five logs, a three-star catch…): its hat, the first time. */
export function notePerfect(job: string) {
  if (useProgress.getState().perfect.includes(job)) return;
  record({ k: `perfect:${job}:${uid()}`, e: 'perfect', job });
}

/** Any three-star job (or all five logs, or a wish come true), which earns a little money. */
export function noteTopJob(job: string) {
  record({ k: `top:${job}:${uid()}`, e: 'top', job });
}

/** An achievement, the first time (its hat, if it has one, unlocks with it). */
export function earn(feat: FeatId) {
  if (useProgress.getState().feats.includes(feat) || !FEATS.some((f) => f.id === feat)) return;
  record({ k: `feat:${feat}:${uid()}`, e: 'feat', id: feat });
  onFeat?.(feat);
}

/** Running counts toward achievements, and the count each needs. */
export type TallyKey = 'fish' | 'kinds' | 'wishes' | 'snacks' | 'votes' | 'letters' | 'games' | 'talk' | 'gifts' | 'cottages' | 'pigeons' | 'buckets' | 'jobs' | 'flowers' | 'seats';
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
  cottages: [5, 'nosy'],
  pigeons: [5, 'pigeons'],
  buckets: [10, 'bucket'],
  // Every job with a game to it (see jobs/meta).
  jobs: [12, 'allrounder'],
  flowers: [15, 'gnomed'],
  seats: [9, 'sits'],
};

/** Adds to a count (once per `key`, if one is given, so a reload doesn't count it twice). */
export function tally(kind: TallyKey, by = 1, key?: string) {
  if (key && real.seen.includes(key)) return;
  record({ k: key ?? `~${uid()}`, e: 'tally', kind, by }, key);
  const [goal, feat] = GOALS[kind];
  if ((useProgress.getState().tally[kind] ?? 0) >= goal) earn(feat);
}

// ---------------------------------------------------------------- to and from the Storyteller

const isSeated = () => Boolean(useClient.getState().priv?.seatId);
let sendTimer: ReturnType<typeof setTimeout> | null = null;
let sentAt = 0;
function sendSoon(ms: number) {
  if (sendTimer) return;
  sendTimer = setTimeout(() => {
    sendTimer = null;
    send();
  }, ms);
}
function send() {
  if (!isSeated() || !real.pending.length) return;
  sentAt = Date.now();
  clientLink.send({ t: 'progress', events: real.pending.slice(0, 60) });
}
// Anything not yet counted goes again every little while (a dropped connection, a Storyteller who reloaded).
let resend: ReturnType<typeof setInterval> | null = null;

let lastProfile = '';
/** The Storyteller's latest word on our profile: kept, with anything we've earned since that they haven't counted. */
function fromHost(priv: PrivateState | null) {
  const p = priv?.profile;
  const json = p ? `${priv?.seatId ?? ''}${JSON.stringify(p)}` : '';
  if (json === lastProfile) return;
  lastProfile = json;
  if (!p || !priv?.seatId) {
    preview = p ?? null;
    useProgress.setState(shown(), true);
    return;
  }
  preview = null;
  resend ??= setInterval(() => real.pending.length && Date.now() - sentAt > 5000 && send(), 5000);
  const book = `${p.book}:${p.key}`;
  let pending = real.pending.filter((e) => !p.acks.includes(e.k));
  // The first time this Storyteller hears from this browser as this player, what it had earned before goes in too
  // (unless it was someone else's).
  if ((real.owner === null || real.owner === p.key) && !real.merged.includes(book)) {
    const { stars, records, ghosts, nights, perfect, feats, tally: counts } = real;
    pending = [...pending, { k: `merge:${uid()}`, e: 'merge', p: { stars, records, ghosts, nights, perfect, feats, tally: counts } }];
  }
  // Achievements given on the Storyteller's side get their moment here (once).
  const news = p.news.filter((n) => !real.seen.includes(`news:${n.id}`));
  const seen = news.length ? [...real.seen, ...news.map((n) => `news:${n.id}`)].slice(-400) : real.seen;
  const merged = real.merged.includes(book) ? real.merged : [...real.merged, book].slice(-20);
  keep(pending.reduce<Stored>((s, ev) => applyEvent(s, ev), { ...real, ...fromView(p), owner: p.key, merged, pending, seen }));
  for (const n of news) announce(n.feat as FeatId);
  usePay.setState({ pay: p.pay });
  if (real.coins >= 100) earn('moneybags');
  if (pending.length) sendSoon(50);
}
useClient.subscribe((s, prev) => s.priv !== prev.priv && fromHost(s.priv));

// ---------------------------------------------------------------- saying so on screen

let onUnlock: ((hat: HatId) => void) | null = null;
/** Called when something new is unlocked (to say so on screen). */
export function whenHatUnlocked(fn: (hat: HatId) => void) {
  onUnlock = fn;
}

let onFeat: ((feat: FeatId) => void) | null = null;
/** Ones that came before anything was listening (a gift waiting as the player arrives). */
const held: (() => void)[] = [];
/** Called when an achievement is earned (to say so on screen). */
export function whenFeat(fn: (feat: FeatId) => void) {
  onFeat = fn;
  for (const f of held.splice(0)) f();
}

/** An achievement from the Storyteller's side: shown as its hat, if it has one. */
function announce(feat: FeatId) {
  const hat = FEATS.find((f) => f.id === feat)?.hat;
  const show = () => (hat ? onUnlock?.(hat) : onFeat?.(feat));
  if (onFeat && onUnlock) show();
  else held.push(show);
}

export function hatUnlocked(hat: HatId | null | undefined): boolean {
  if (!hat) return true;
  const h = HATS.find((x) => x.id === hat);
  return Boolean(h?.unlocked(useProgress.getState()));
}

let boostFor: Stored | null = null;
let boost = 1;
/** How much quicker this player's hats make them about town (1.007 for seven hats), worked out again when they change. */
export function hatBoost(): number {
  const s = useProgress.getState();
  if (s !== boostFor) {
    boostFor = s;
    boost = 1 + hatsOwned(s) * HAT_SPEED;
  }
  return boost;
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
  const deaths = view?.deaths;
  const today = view?.day ?? 0;
  useEffect(() => {
    if (!player || !meNow) return;
    const room = view?.room ?? '';
    const votes = history ?? [];
    if (nom?.nomineeId === meNow.id) earn('nominated');
    if (nom?.nominatorId === meNow.id) earn('nominator');
    if (execution?.seatId === meNow.id) earn(execution.survives ? 'spared' : 'gallows');
    for (const r of votes) if (r.voters.includes(meNow.id)) tally('votes', 1, `vote:${room}:${r.id}`);
    // A dead player whose ghost vote is gone has used it.
    if (meNow.dead && !meNow.ghostVote) earn('ghostvote');
    // Three different players put up for execution by us in one game.
    const accused = new Set(votes.filter((r) => r.nominatorId === meNow.id).map((r) => r.nomineeId));
    if (nom?.nominatorId === meNow.id) accused.add(nom.nomineeId);
    if (accused.size >= 3) earn('conspiracy');
    // Putting ourselves up.
    if ((nom?.nominatorId === meNow.id && nom.nomineeId === meNow.id) || votes.some((r) => r.nominatorId === meNow.id && r.nomineeId === meNow.id)) earn('pickme');
    // Put up and let go again (too few hands), and put up three days running.
    if (votes.some((r) => r.nomineeId === meNow.id && r.votes < r.majority)) earn('offhook');
    const onTrial = new Set(votes.filter((r) => r.nomineeId === meNow.id).map((r) => r.day));
    if ([...onTrial].some((d) => onTrial.has(d + 1) && onTrial.has(d + 2))) earn('suspect');
    if (votes.some((r) => r.voters.length === 1 && r.voters[0] === meNow.id)) earn('lonevoice');
    // A hand up in every vote of a day that's over, when it had three or more.
    const byDay = new Map<number, VoteRecord[]>();
    for (const r of votes) byDay.set(r.day, [...(byDay.get(r.day) ?? []), r]);
    for (const [d, list] of byDay) if ((d < today || ended) && list.length >= 3 && list.every((r) => r.voters.includes(meNow.id))) earn('everyvote');
    if (ended) {
      tally('games', 1, `game:${room}:${ended.at}`);
      // Our notepad's guesses against who everyone really was, now it's all out in the open.
      const seats = view?.seats ?? [];
      const guesses = useNotes.getState().notes;
      const right = seats.filter((s) => !s.isMe && s.roleId && guesses[s.id]?.guess === s.roleId).length;
      if (right >= 3) earn('detective');
      if (!meNow.dead) earn('survivor');
      const won = Boolean(meNow.alignment && meNow.alignment === ended.winner);
      if (won) earn(ended.winner === 'good' ? 'goodwin' : 'evilwin');
      if (won && meNow.dead) earn('ghostwin');
      // The last of a team of two or more still standing.
      const team = seats.filter((s) => s.roleId && meNow.alignment && s.alignment === meNow.alignment);
      if (!meNow.dead && team.length >= 2 && team.filter((s) => !s.dead).length === 1) earn('lastone');
      // Every character is out now: did we ever put the Demon up?
      const demon = (id: string) => getRole(seats.find((s) => s.id === id)?.roleId)?.team === 'demon';
      if (votes.some((r) => r.nominatorId === meNow.id && demon(r.nomineeId))) earn('gutfeel');
      if (deaths?.[0]?.seatId === meNow.id) earn('firstgo');
      // Put up three times and still standing at the end.
      if (!meNow.dead && votes.filter((r) => r.nomineeId === meNow.id).length >= 3) earn('scratch');
    }
  }, [player, meNow, ended, history, nom, execution, deaths, today, view?.room, view?.seats]);

  // A claim and a guess in our notepad for everyone else in a game of six or more.
  const notesNow = useNotes((s) => s.notes);
  const everyone = view?.seats;
  useEffect(() => {
    if (!player || !everyone) return;
    const others = everyone.filter((s) => !s.isMe && s.claimed);
    if (others.length >= 5 && others.every((s) => notesNow[s.id]?.claim && notesNow[s.id]?.guess)) earn('nicelist');
  }, [player, everyone, notesNow]);

  // First to the square when the bell rings (with someone else there after).
  const call = view?.townHall;
  useEffect(() => {
    if (player && meNow && call && call.back[0] === meNow.id && call.back.length >= 2) earn('earlybird');
  }, [player, meNow, call]);

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
