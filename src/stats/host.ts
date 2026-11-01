import { debugHooks, loadJSON, saveJSON } from '../lib/util';
import { useHost } from '../state/host';
import type { Execution } from '../state/types';
import { isExecMethod } from '../game/execution';

/**
 * The Storyteller's stats: what gets bought, which executions the town picks, which minigames are played, and so
 * on, counted in this browser (alongside the profiles) so the game can be tuned and the duds taken out. Only small
 * running counts are kept, never a log of every event, and nothing here is ever sent to players.
 *
 * Everything that counts something calls one of the `stats.*` functions below; the executions and Slayer claims
 * are watched from the game itself (startStats), so the code that runs them doesn't need to know.
 *
 * Bought things are counted by key: the shop's own keys ('hat:topper', 'dance:worm', 'slay:pan', 'win:…'), and
 * 'pet:<id>', 'furn:<id>', 'wall:<id>', 'floor:<id>' for pets and the flats' furniture.
 */

export interface ExecCount {
  /** On the ballot (the methods the town was offered). */
  offered: number;
  /** Votes cast for it. */
  votes: number;
  /** How often it was what happened, and how many of those the Storyteller chose by hand. */
  chosen: number;
  picked: number;
}

export interface Stats {
  v: 1;
  /** Counting since. */
  since: number;
  /** Games called (good or evil won). */
  games: number;
  bought: Record<string, number>;
  /** Executions counted, and each method's share of them. */
  execs: number;
  exec: Record<string, ExecCount>;
  /** Slayer claims, by move. */
  slay: Record<string, number>;
  /** Minigames: how often each was played, and how many times each score (0 to 3 stars) came up. */
  jobs: Record<string, { played: number; stars: [number, number, number, number] }>;
  /** Pet pit fights, and each pet's fights and wins. */
  pit: { fights: number; pets: Record<string, { fights: number; wins: number }> };
  /** Casino games: rounds played, money staked and money paid back out (players' net is out minus in). */
  casino: Record<string, { played: number; staked: number; paid: number }>;
  /** The night gallery: drawings sent in, nights hung, votes, hearts given (and taken back). */
  art: { drawings: number; nights: number; votes: number; hearts: number; unhearts: number };
  /** The last few executions and Slayer claims already counted, so a reload doesn't count them twice. */
  seen: string[];
}

const KEY = 'ravenswood:stats';
const SEEN_KEPT = 40;

const fresh = (): Stats => ({
  v: 1,
  since: Date.now(),
  games: 0,
  bought: {},
  execs: 0,
  exec: {},
  slay: {},
  jobs: {},
  pit: { fights: 0, pets: {} },
  casino: {},
  art: { drawings: 0, nights: 0, votes: 0, hearts: 0, unhearts: 0 },
  seen: [],
});

function load(): Stats {
  const raw = loadJSON<Partial<Stats> | null>(KEY, null);
  const s = fresh();
  if (!raw || raw.v !== 1) return s;
  return {
    ...s,
    ...raw,
    pit: { ...s.pit, ...raw.pit },
    art: { ...s.art, ...raw.art },
    seen: Array.isArray(raw.seen) ? raw.seen.slice(-SEEN_KEPT) : [],
  };
}

let data: Stats = load();
let timer: ReturnType<typeof setTimeout> | null = null;
const listeners = new Set<() => void>();
/** Counts changes, for the Stats panel to know when to look again. */
let rev = 0;

/** Saved a moment after the last change (counts come in bursts: a casino round, a vote). */
function changed() {
  rev++;
  for (const fn of listeners) fn();
  if (timer) return;
  timer = setTimeout(() => {
    timer = null;
    saveJSON(KEY, data);
  }, 1500);
}

/** A key from the network or the game, kept short and plain. */
const clean = (v: unknown, max = 40) => String(v ?? '').slice(0, max).replace(/[^a-z0-9:_-]/gi, '');
const add = (rec: Record<string, number>, k: string, by = 1) => void (rec[k] = (rec[k] ?? 0) + by);
const execOf = (m: string) => (data.exec[m] ??= { offered: 0, votes: 0, chosen: 0, picked: 0 });

/** Whether an execution or claim is counted already (and notes it if not). */
function firstTime(id: string): boolean {
  if (data.seen.includes(id)) return false;
  data.seen = [...data.seen, id].slice(-SEEN_KEPT);
  return true;
}

export const stats = {
  /** The stats as they stand (read only). */
  get: (): Readonly<Stats> => data,
  rev: () => rev,
  subscribe(fn: () => void) {
    listeners.add(fn);
    return () => void listeners.delete(fn);
  },
  /** Something bought: a shop key, or 'pet:<id>', 'furn:<id>', 'wall:<id>', 'floor:<id>'. */
  bought(key: string) {
    const k = clean(key);
    if (!k) return;
    add(data.bought, k);
    changed();
  },
  /** A minigame finished, with its stars (0 to 3). */
  played(job: string, stars: number) {
    const j = clean(job, 20);
    if (!/^[a-z]+$/.test(j)) return;
    const s = Math.max(0, Math.min(3, Math.round(Number(stars) || 0)));
    const rec = (data.jobs[j] ??= { played: 0, stars: [0, 0, 0, 0] });
    rec.played++;
    rec.stars[s]++;
    changed();
  },
  /** A pet pit fight over: the two pets, and which side won (null for a draw or a walk-out). */
  pitFight(pets: [string, string], winner: 0 | 1 | null) {
    data.pit.fights++;
    pets.forEach((p, i) => {
      const rec = (data.pit.pets[clean(p, 24)] ??= { fights: 0, wins: 0 });
      rec.fights++;
      if (winner === i) rec.wins++;
    });
    changed();
  },
  /** Money staked at a casino game (`round`: a new round, not a double or a raise). */
  staked(game: string, amount: number, round = true) {
    const rec = (data.casino[clean(game, 20)] ??= { played: 0, staked: 0, paid: 0 });
    if (round) rec.played++;
    rec.staked += Math.max(0, Math.round(amount));
    changed();
  },
  /** Money paid out at a casino game (winnings, chips cashed out). */
  paid(game: string, amount: number) {
    const rec = (data.casino[clean(game, 20)] ??= { played: 0, staked: 0, paid: 0 });
    rec.paid += Math.max(0, Math.round(amount));
    changed();
  },
  /** The night gallery: a drawing in, a night hung, a vote, a heart given or taken back. */
  art(what: 'drawings' | 'nights' | 'votes' | 'hearts' | 'unhearts') {
    data.art[what]++;
    changed();
  },
  /** The execution methods put to the town for one execution (once per execution). */
  offered(id: string, methods: string[]) {
    if (!firstTime(`offer:${id}`)) return;
    for (const m of methods) if (isExecMethod(m)) execOf(m).offered++;
    changed();
  },
  /** How an execution went: the method, the votes, and whether the Storyteller chose it by hand. */
  executed(ex: Execution) {
    if (!ex.method || !firstTime(`exec:${ex.id}`)) return;
    data.execs++;
    const rec = execOf(ex.method);
    rec.chosen++;
    if (ex.drawn && !ex.drawn.spin) rec.picked++;
    for (const m of Object.values(ex.vote?.picks ?? {})) if (isExecMethod(m)) execOf(m).votes++;
    changed();
  },
  /** Starts counting afresh. */
  reset() {
    data = fresh();
    changed();
  },
};

/**
 * The methods an execution offered, wherever the execution keeps them: any list of methods on it (or on its vote).
 * Before ballots there was no list: every method was on offer, which says nothing, so nothing is counted.
 */
function offeredOf(ex: Execution): string[] {
  if (ex.offer?.length) return ex.offer;
  for (const o of [ex, ex.vote] as unknown[]) {
    if (!o || typeof o !== 'object') continue;
    for (const v of Object.values(o)) if (Array.isArray(v) && v.length && v.every(isExecMethod)) return v;
  }
  return [];
}

/** Watches the game for executions, Slayer claims and games called. */
function watch() {
  const g = useHost.getState().g;
  const ex = g.execution;
  if (ex) {
    const offer = offeredOf(ex);
    if (offer.length) stats.offered(ex.id, offer);
    if (ex.method) stats.executed(ex);
  }
  for (const shot of g.slayer ?? []) {
    if (!firstTime(`slay:${shot.id}`)) continue;
    add(data.slay, clean(shot.move || 'crossbow', 24));
    changed();
  }
  if (g.ended && firstTime(`game:${g.ended.at}`)) {
    data.games++;
    changed();
  }
}

let started = false;
/** Starts watching the game, in the Storyteller's browser. */
export function startStats() {
  if (started) return;
  started = true;
  watch();
  useHost.subscribe((s, prev) => {
    if (s.g.execution !== prev.g.execution || s.g.slayer !== prev.g.slayer || s.g.ended !== prev.g.ended) watch();
  });
  addEventListener('pagehide', () => saveJSON(KEY, data));
}

if (debugHooks()) Object.assign(window, { __stats: stats });
