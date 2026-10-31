/**
 * Players' profiles, kept by the Storyteller's browser: everything each player has earned (the hats come from that),
 * their money and their pets, under their name. Names match however they're written ("Abbey", " abbey "), so a
 * player's progress follows them to any device, as long as the same Storyteller hosts.
 *
 * Players still earn things in their own browser (game/progress.ts) and report each one here; the profile is the
 * one that counts, and each player is sent their own (PrivateState.profile) to keep their copy in step. Money and
 * pets are only ever changed here.
 *
 * For the casino, the pet shop and the pet fights, in the Storyteller's browser:
 *   credit(who, amount, why)  adds money. `why` finishes the player's little pop: 'at the casino' → "+$40 at the casino".
 *   debit(who, amount, why)   takes money if they have that much, and says whether it did (nothing changes if not).
 *   grantPet(who, pet)        gives them a pet to keep; false if they already had it.
 *   grantItem(who, key)       gives them something bought at the shop ('hat:topper', 'dance:worm'); false if they had it.
 *   profileOf(who)            their profile as it stands (read only), or null if there's no such name.
 *   addTally(who, kind, by)   adds to one of their running counts (the pet pit's wins, say).
 *   topTally(kind, n)         the n names with the most of a count, most first.
 *   changeFlat(who, fn)       changes their flat in the apartment block (its furniture and layout, see flats/).
 *   changeArt(who, fn)        changes the drawings they have kept from the gallery (gallery/).
 * `who` is { name } (any spelling), { seat } (a seat id) or { player } (the playerId a message came from).
 * On a player's side, useMoney() and useMyPets() in game/progress.ts are their own money and pets.
 */
import { create } from 'zustand';
import { debugHooks, loadJSON, saveJSON, uid } from '../lib/util';
import { seatAlignment, useHost } from '../state/host';
import type { BackupCopy, GameState, PayLine, ProfileView, ProgressEvent, ProgressSnapshot } from '../state/types';
import { FEATS, PETS, type FeatId, type PetId } from '../world/types';
import { cleanFlat, emptyFlat, type FlatStore } from '../flats/catalogue';
import { GAME_JOBS, JOB_AT, type GameJob } from '../jobs/meta';
import { ART_ID, SAVED_MAX, type SavedArt } from '../gallery/types';

/** What players earn, in dollars: all the amounts in one place. */
export const PAY = {
  /** Playing a game through to the end (seated, with a character, when the Storyteller calls it). */
  finish: 10,
  /** On the winning team. */
  win: 25,
  /** Still alive at the end. */
  survive: 5,
  /** Each new achievement, and a secret one. */
  feat: 5,
  secretFeat: 10,
  /** Each three-star minigame (all five logs, a wish come true…), and each two-star one, up to `jobDaily` in a day. */
  job: 5,
  jobTwo: 2,
  jobDaily: 40,
};

/** Money as it's shown everywhere: "$42" (and "−$5"). */
export const money = (n: number) => `${n < 0 ? '−' : ''}$${Math.abs(Math.round(n)).toLocaleString('en-AU')}`;

/** The name a profile is kept under: trimmed, lower case. */
export const nameKey = (name: string) => name.trim().replace(/\s+/g, ' ').toLowerCase();

const featReward = (id: string) => (FEATS.find((f) => f.id === id)?.secret ? PAY.secretFeat : PAY.feat);
const featName = (id: string) => FEATS.find((f) => f.id === id)?.name ?? 'an achievement';

// ---------------------------------------------------------------- progress, shared with the player's side

export const emptySnapshot = (): ProgressSnapshot => ({ stars: 0, records: 0, ghosts: 0, nights: 0, perfect: [], feats: [], tally: {} });

const count = (v: unknown, max = 1e6) => Math.max(0, Math.min(max, Math.floor(Number(v) || 0)));
const strings = (v: unknown, max: number, len = 24) =>
  Array.isArray(v) ? [...new Set(v.filter((x): x is string => typeof x === 'string' && x.length <= len))].slice(0, max) : [];

/** Progress from storage or the network: known shapes and sensible sizes only. */
export function cleanSnapshot(raw: unknown): ProgressSnapshot {
  const r = (raw && typeof raw === 'object' ? raw : {}) as Partial<ProgressSnapshot>;
  const tally: Record<string, number> = {};
  if (r.tally && typeof r.tally === 'object') {
    for (const [k, v] of Object.entries(r.tally).slice(0, 40)) if (/^[a-z]{1,16}$/.test(k)) tally[k] = count(v);
  }
  return {
    stars: count(r.stars),
    records: count(r.records),
    ghosts: count(r.ghosts),
    nights: count(r.nights),
    perfect: strings(r.perfect, 40),
    feats: strings(r.feats, 120).filter((f) => FEATS.some((x) => x.id === f)),
    tally,
  };
}

/** Both at once: every achievement and perfect job either has, and the higher of each count. */
export function mergeSnapshot<T extends ProgressSnapshot>(into: T, p: ProgressSnapshot): T {
  const tally = { ...into.tally };
  for (const [k, v] of Object.entries(p.tally)) tally[k] = Math.max(tally[k] ?? 0, v);
  return {
    ...into,
    stars: Math.max(into.stars, p.stars),
    records: Math.max(into.records, p.records),
    ghosts: Math.max(into.ghosts, p.ghosts),
    nights: Math.max(into.nights, p.nights),
    perfect: [...new Set([...into.perfect, ...p.perfect])],
    feats: [...new Set([...into.feats, ...p.feats])],
    tally,
  };
}

/** One report applied to some progress (the same on both sides, so the player's copy matches). */
export function applyEvent<T extends ProgressSnapshot>(p: T, ev: ProgressEvent): T {
  switch (ev.e) {
    case 'feat':
      return p.feats.includes(ev.id) ? p : { ...p, feats: [...p.feats, ev.id] };
    case 'perfect':
      return p.perfect.includes(ev.job) ? p : { ...p, perfect: [...p.perfect, ev.job] };
    case 'count':
      return { ...p, [ev.kind]: p[ev.kind] + 1 };
    case 'tally':
      return { ...p, tally: { ...p.tally, [ev.kind]: (p.tally[ev.kind] ?? 0) + ev.by } };
    case 'merge':
      return mergeSnapshot(p, ev.p);
    case 'top':
      return p;
  }
}

/** Counts only ever kept here (the pet pit's wins), which a player's own reports can't add to. */
const HOST_TALLIES = ['pitwins'];

/** A report from the network, checked, or null. */
function cleanEvent(raw: unknown): ProgressEvent | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  const k = typeof r.k === 'string' ? r.k.slice(0, 80) : '';
  const word = (v: unknown) => (typeof v === 'string' && /^[a-z]{1,20}$/i.test(v) ? v : null);
  if (!k) return null;
  switch (r.e) {
    case 'feat':
      return FEATS.some((f) => f.id === r.id) ? { k, e: 'feat', id: r.id as string } : null;
    case 'perfect': {
      const job = word(r.job);
      return job ? { k, e: r.e, job } : null;
    }
    case 'top': {
      // Only the minigames pay, for two or three stars (a report from before two stars paid has no stars: three).
      const job = GAME_JOBS.find((j) => j === r.job);
      const stars = r.stars === undefined ? 3 : typeof r.stars === 'number' ? r.stars : 0;
      return job && (stars === 2 || stars === 3) && k.startsWith(`top:${job}:`) ? { k, e: 'top', job, stars } : null;
    }
    case 'count':
      return ['stars', 'records', 'ghosts', 'nights'].includes(r.kind as string) ? { k, e: 'count', kind: r.kind as 'stars' } : null;
    case 'tally': {
      const kind = word(r.kind);
      // (Talk comes ten seconds at a time; nothing else more than one.)
      const by = Math.max(1, Math.min(60, Math.floor(Number(r.by) || 1)));
      return kind && !HOST_TALLIES.includes(kind.toLowerCase()) ? { k, e: 'tally', kind: kind.toLowerCase(), by } : null;
    }
    case 'merge': {
      const p = cleanSnapshot(r.p);
      for (const kind of HOST_TALLIES) delete p.tally[kind];
      return { k, e: 'merge', p };
    }
  }
  return null;
}

// ---------------------------------------------------------------- the book of profiles

export interface Profile extends ProgressSnapshot {
  /** As the player last wrote it. */
  name: string;
  coins: number;
  pets: PetId[];
  /** Hats, dances and the like bought at the shop, by key ('hat:topper', 'dance:worm'). */
  items: string[];
  /** Games won (counted here as each is paid for, from when the tavern's leaderboard went up). */
  wins?: number;
  /** Reports already counted, newest last, so one sent twice counts once. */
  seen: string[];
  /** Money in and out lately, newest last. */
  pay: PayLine[];
  /** Achievements given here (by the Storyteller, or a one-off gift), for the player's screen to make a moment of. */
  news: { id: string; feat: string; at: number }[];
  /** Two- and three-star minigames paid for on one day (the host's calendar), in dollars. */
  jobPay?: { day: string; paid: number };
  /** What each game paid them for, so calling a game again only pays (or takes back) the difference. */
  games?: Record<string, string[]>;
  /** The devices this name plays on, as hashes (never the devices' own secrets): see admitDevice(). */
  devices?: string[];
  /** Their flat in Wren Court, the apartment block: the furniture they've bought and how it's laid out (flats/). */
  flat?: FlatStore;
  /** Their own drawings from the night's gallery that they've kept (only ids and prompts: the pictures are kept apart, see gallery/host.ts). */
  art?: SavedArt[];
  created: number;
  updated: number;
}

interface Book {
  v: 1;
  /** This browser's book of profiles: a player's browser notes which books its older progress has gone into. */
  book: string;
  profiles: Record<string, Profile>;
  /** One-off gifts already given. */
  done: string[];
}

const KEY = 'ravenswood:profiles';
const SEEN_KEPT = 200;
const PAY_KEPT = 8;
/** Devices remembered for one name, at most (the oldest is forgotten). */
const DEVICES_KEPT = 8;
/** Gifts and achievements handed out here are worth a moment on the player's screen for this long. */
const NEWS_MS = 60 * 60000;

function blank(name: string): Profile {
  const now = Date.now();
  return { ...emptySnapshot(), name: name.trim().slice(0, 24), coins: 0, pets: [], items: [], seen: [], pay: [], news: [], created: now, updated: now };
}

export function cleanProfile(raw: unknown, key: string): Profile {
  const r = (raw && typeof raw === 'object' ? raw : {}) as Partial<Profile>;
  const p = { ...blank(typeof r.name === 'string' && r.name.trim() ? r.name : key), ...cleanSnapshot(r) };
  p.coins = count(r.coins, 1e9);
  p.pets = strings(r.pets, PETS.length).filter((x) => PETS.some((pet) => pet.id === x)) as PetId[];
  p.items = strings(r.items, 200, 40).filter((x) => ITEM_KEY.test(x));
  if (r.wins) p.wins = count(r.wins);
  p.seen = strings(r.seen, SEEN_KEPT, 80);
  p.pay = Array.isArray(r.pay) ? r.pay.filter((l) => l && typeof l.id === 'string' && Number.isFinite(l.amount)).slice(-PAY_KEPT) : [];
  p.news = Array.isArray(r.news) ? r.news.filter((n) => n && typeof n.feat === 'string').slice(-PAY_KEPT) : [];
  if (r.jobPay && typeof r.jobPay.day === 'string') p.jobPay = { day: r.jobPay.day, paid: count(r.jobPay.paid) };
  if (r.games && typeof r.games === 'object') p.games = Object.fromEntries(Object.entries(r.games).slice(-10).map(([g, items]) => [g, strings(items, 8)]));
  const devices = strings(r.devices, DEVICES_KEPT, 64).filter((h) => /^[0-9a-f]{16,64}$/.test(h));
  if (devices.length) p.devices = devices;
  if (r.flat && typeof r.flat === 'object') p.flat = cleanFlat(r.flat);
  if (Array.isArray(r.art)) {
    const art = r.art
      .filter((a) => a && typeof a.id === 'string' && ART_ID.test(a.id))
      .slice(-SAVED_MAX)
      .map((a) => ({ id: a.id, prompt: String(a.prompt ?? '').slice(0, 80), at: Number(a.at) || 0 }));
    if (art.length) p.art = art;
  }
  p.created = Number(r.created) || Date.now();
  p.updated = Number(r.updated) || p.created;
  return p;
}

/** What a bought thing is kept as: its kind and its id. */
const ITEM_KEY = /^[a-z]{1,12}:[a-z0-9]{1,24}$/;

function loadBook(): Book {
  const raw = loadJSON<Partial<Book> | null>(KEY, null);
  const profiles: Record<string, Profile> = {};
  for (const [key, p] of Object.entries(raw?.profiles ?? {})) if (nameKey(key)) profiles[nameKey(key)] = cleanProfile(p, key);
  return { v: 1, book: typeof raw?.book === 'string' ? raw.book : uid(), profiles, done: strings(raw?.done, 2000, 60) };
}

interface ProfilesStore extends Book {
  /** Each player's latest reports that are now counted, by playerId (sent back so they stop sending them). */
  acks: Record<string, string[]>;
}

export const useProfiles = create<ProfilesStore>(() => ({ ...loadBook(), acks: {} }));

let saveTimer: ReturnType<typeof setTimeout> | null = null;
const flush = () => {
  if (!saveTimer) return;
  clearTimeout(saveTimer);
  saveTimer = null;
  const { v, book, profiles, done } = useProfiles.getState();
  saveJSON(KEY, { v, book, profiles, done });
};

/** Changes one profile, by name or key (making it if it's new). Only that profile is copied, so a big book stays quick. */
function change(name: string, fn: (p: Profile) => void): Profile {
  const key = nameKey(name);
  const s = useProfiles.getState();
  const p = s.profiles[key] ? structuredClone(s.profiles[key]) : blank(name);
  fn(p);
  p.updated = Date.now();
  useProfiles.setState({ profiles: { ...s.profiles, [key]: p } });
  return p;
}

function addPay(p: Profile, amount: number, why: string) {
  const was = p.coins;
  p.coins = Math.max(0, Math.round(p.coins + amount));
  const moved = p.coins - was;
  if (moved) p.pay = [...p.pay, { id: uid(), amount: moved, why: why.slice(0, 60), at: Date.now() }].slice(-PAY_KEPT);
}

/** A new achievement (and its money). `announce`: given here rather than earned in the player's browser. */
function addFeat(p: Profile, feat: string, announce: boolean): boolean {
  if (p.feats.includes(feat) || !FEATS.some((f) => f.id === feat)) return false;
  p.feats = [...p.feats, feat];
  addPay(p, featReward(feat), `for ${featName(feat)}`);
  if (announce) p.news = [...p.news.filter((n) => Date.now() - n.at < NEWS_MS), { id: uid(), feat, at: Date.now() }].slice(-PAY_KEPT);
  return true;
}

/**
 * Gifts for particular players, given once (when their profile is next loaded or made here): earned before the game
 * could tell, or couldn't be earned at the time (the church cut the ring road off for the fun run).
 */
const ONE_OFFS: { id: string; name: string; feats: FeatId[]; coins?: number; why?: string }[] = [
  { id: 'xengeath:fanmail+lap', name: 'xengeath', feats: ['fanmail', 'lap'] },
  // Earned in games before profiles kept count.
  {
    id: 'xengeath:earned-before',
    name: 'xengeath',
    feats: ['goodwin', 'evilwin', 'offhook', 'detective', 'suspect', 'lastone', 'gutfeel', 'scratch'],
  },
  { id: 'jaydon:200', name: 'jaydon', feats: [], coins: 200, why: 'from the Storyteller' },
];

function oneOffs(key: string) {
  for (const gift of ONE_OFFS) {
    const s = useProfiles.getState();
    if (gift.name !== key || !s.profiles[key] || s.done.includes(gift.id)) continue;
    useProfiles.setState({ done: [...s.done, gift.id] });
    change(key, (p) => {
      for (const f of gift.feats) addFeat(p, f, true);
      if (gift.coins) addPay(p, gift.coins, gift.why ?? 'a gift');
    });
  }
}

/** The profile for this name, made if it's new. Returns its key. */
function ensure(name: string): string {
  const key = nameKey(name);
  const s = useProfiles.getState();
  const p = s.profiles[key];
  if (!p) change(name, () => {});
  // (Keep the way they write it now.)
  else if (p.name !== name.trim().slice(0, 24)) change(name, (x) => void (x.name = name.trim().slice(0, 24)));
  oneOffs(key);
  welcome(key);
  return key;
}

/** Everyone starts with enough for one of the cheaper pets (once a name, new or not: pets used to be free). */
const WELCOME = 25;
function welcome(key: string) {
  const s = useProfiles.getState();
  const id = `welcome:${key}`;
  if (!s.profiles[key] || s.done.includes(id)) return;
  useProfiles.setState({ done: [...s.done, id] });
  change(key, (p) => addPay(p, WELCOME, 'to start you off'));
}

// ---------------------------------------------------------------- the API for the casino, pets and the rest

export type Who = { name: string } | { seat: string } | { player: string };

/** The name a `who` stands for, or null. */
function nameOf(who: Who): string | null {
  if ('name' in who) return nameKey(who.name) ? who.name : null;
  const g = useHost.getState().g;
  const seat = 'seat' in who ? g.seats.find((s) => s.id === who.seat) : g.seats.find((s) => s.playerId === who.player);
  return seat?.name.trim() ? seat.name : null;
}

/** Games a player has won: counted since the leaderboard went up, or before that, the wins among their last few games. */
export const winsOf = (p: Readonly<Profile>) => p.wins ?? Object.values(p.games ?? {}).filter((items) => items.includes('win')).length;

/** Adds money (a whole number of dollars) to a player. False if there's nobody by that name or seat. */
export function credit(who: Who, amount: number, why: string): boolean {
  const name = nameOf(who);
  const n = Math.round(amount);
  if (!name || !(n > 0)) return false;
  ensure(name);
  change(name, (p) => addPay(p, n, why));
  return true;
}

/** Takes money from a player if they have that much. Returns whether it did; if not, nothing changes. */
export function debit(who: Who, amount: number, why: string): boolean {
  const name = nameOf(who);
  const n = Math.round(amount);
  if (!name || !(n > 0)) return false;
  const p = useProfiles.getState().profiles[nameKey(name)];
  if (!p || p.coins < n) return false;
  change(name, (x) => addPay(x, -n, why));
  return true;
}

/** Gives a player a pet to keep. False if they already have it (or there's nobody by that name). */
export function grantPet(who: Who, pet: PetId): boolean {
  const name = nameOf(who);
  if (!name || !PETS.some((x) => x.id === pet)) return false;
  ensure(name);
  if (useProfiles.getState().profiles[nameKey(name)].pets.includes(pet)) return false;
  change(name, (p) => void (p.pets = [...p.pets, pet]));
  return true;
}

/** Gives a player something bought at the shop (by key, see Profile.items). False if they already have it, or there's nobody. */
export function grantItem(who: Who, key: string): boolean {
  const name = nameOf(who);
  if (!name || !ITEM_KEY.test(key)) return false;
  ensure(name);
  if (useProfiles.getState().profiles[nameKey(name)].items.includes(key)) return false;
  change(name, (p) => void (p.items = [...p.items, key]));
  return true;
}

/** A player's profile as it stands, or null. Read only: change it through the functions here. */
export function profileOf(who: Who): Readonly<Profile> | null {
  const name = nameOf(who);
  return name ? (useProfiles.getState().profiles[nameKey(name)] ?? null) : null;
}

/** Adds to one of a player's running counts (kept here, so it's the Storyteller's word). False if there's nobody. */
export function addTally(who: Who, kind: string, by = 1): boolean {
  const name = nameOf(who);
  if (!name || !/^[a-z]{1,16}$/.test(kind)) return false;
  ensure(name);
  change(name, (p) => void (p.tally = { ...p.tally, [kind]: (p.tally[kind] ?? 0) + by }));
  return true;
}

/** The names with the most of a running count, most first (nobody with none). */
export function topTally(kind: string, n: number): { name: string; count: number }[] {
  return Object.values(useProfiles.getState().profiles)
    .map((p) => ({ name: p.name, count: p.tally[kind] ?? 0 }))
    .filter((x) => x.count > 0)
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
    .slice(0, n);
}

/**
 * Changes a player's flat (made empty if they've none yet). `fn` returns false to change nothing. Returns whether it
 * changed. The caller checks what goes in (flats/catalogue.ts cleans it).
 */
export function changeFlat(who: Who, fn: (f: FlatStore) => boolean | void): boolean {
  const name = nameOf(who);
  if (!name) return false;
  ensure(name);
  const f = structuredClone(useProfiles.getState().profiles[nameKey(name)].flat ?? emptyFlat());
  if (fn(f) === false) return false;
  change(name, (p) => void (p.flat = f));
  return true;
}

/** Changes the drawings a player has kept (their ids and prompts). `fn` returns false to change nothing. */
export function changeArt(who: Who, fn: (art: SavedArt[]) => SavedArt[] | false): boolean {
  const name = nameOf(who);
  if (!name) return false;
  ensure(name);
  const next = fn([...(useProfiles.getState().profiles[nameKey(name)].art ?? [])]);
  if (next === false) return false;
  change(name, (p) => void (p.art = next.slice(-SAVED_MAX)));
  return true;
}

/** Everyone with a profile, by the key it's kept under: who has a flat in the apartment block. */
export function residents(): { key: string; name: string }[] {
  return Object.entries(useProfiles.getState().profiles).map(([key, p]) => ({ key, name: p.name }));
}

// ---------------------------------------------------------------- from players, and to them

/** A player's reports of what they've earned, for the profile of the name in their seat. */
export function receiveProgress(playerId: string, raw: unknown) {
  if (!Array.isArray(raw)) return;
  const seat = useHost.getState().g.seats.find((s) => s.playerId === playerId);
  if (!seat?.name.trim()) return;
  const events = raw.slice(0, 100).map(cleanEvent).filter((e): e is ProgressEvent => Boolean(e));
  if (!events.length) return;
  ensure(seat.name);
  change(seat.name, (p) => {
    for (const ev of events) applyHere(p, ev);
  });
  useProfiles.setState((s) => ({ acks: { ...s.acks, [playerId]: events.map((e) => e.k) } }));
}

const today = () => new Date().toLocaleDateString('en-CA');

function applyHere(p: Profile, ev: ProgressEvent) {
  if (p.seen.includes(ev.k)) return;
  p.seen = [...p.seen, ev.k].slice(-SEEN_KEPT);
  if (ev.e === 'feat') {
    addFeat(p, ev.id, false);
    return;
  }
  if (ev.e === 'top') {
    // Up to the day's cap (the last of it paid in part, so the cap is reached exactly).
    const day = today();
    const paid = p.jobPay?.day === day ? p.jobPay.paid : 0;
    const amount = Math.min(ev.stars === 2 ? PAY.jobTwo : PAY.job, PAY.jobDaily - paid);
    if (amount <= 0) return;
    p.jobPay = { day, paid: paid + amount };
    const at = JOB_AT[ev.job as GameJob] ?? '';
    addPay(p, amount, ev.job === 'coin' ? 'for a wish come true' : `for ${ev.stars === 2 ? 'two' : 'three'} stars ${at}`);
    return;
  }
  const fresh = ev.e === 'merge' ? ev.p.feats.filter((f) => !p.feats.includes(f)) : [];
  Object.assign(p, applyEvent(p, ev));
  // What they'd earned before money: paid for now, all at once.
  const owed = fresh.reduce((sum, f) => sum + featReward(f), 0);
  if (owed) addPay(p, owed, fresh.length === 1 ? `for ${featName(fresh[0])}` : `for the ${fresh.length} achievements you had`);
}

/** What a player is sent: the profile of the name in their seat, or of the name they're joining with. */
export function profileFor(playerId: string): ProfileView | null {
  const g = useHost.getState().g;
  const seat = g.seats.find((s) => s.playerId === playerId);
  const name = seat?.name.trim() ? seat.name : Object.values(g.picking ?? {}).find((h) => h.playerId === playerId)?.name;
  if (!name?.trim()) return null;
  const key = nameKey(name);
  const s = useProfiles.getState();
  const p = s.profiles[key] ?? blank(name);
  const now = Date.now();
  return {
    key,
    name: p.name,
    stars: p.stars,
    records: p.records,
    ghosts: p.ghosts,
    nights: p.nights,
    perfect: p.perfect,
    feats: p.feats,
    tally: p.tally,
    coins: p.coins,
    pets: p.pets,
    items: p.items,
    pay: p.pay.filter((l) => now - l.at < NEWS_MS),
    jobPaid: p.jobPay?.day === today() ? p.jobPay.paid : 0,
    news: p.news.filter((n) => now - n.at < NEWS_MS),
    book: s.book,
    acks: s.acks[playerId] ?? [],
  };
}

// ---------------------------------------------------------------- following the game

/** Each claimed seat's player and name, to notice renames. */
let seated = new Map<string, { player: string; key: string }>();
let seatSig = '';

/**
 * Makes sure every seated player has a profile, and follows renames: renaming to a name nobody has used takes the
 * profile along (a typo fixed, a new nickname); renaming to a name that has one switches to it, and the old one waits
 * under the old name. Only a player renaming their own seat counts (a Storyteller naming empty seats moves nothing).
 */
function syncSeats(g: GameState) {
  const sig = g.seats.map((s) => (s.playerId ? `${s.id}:${s.playerId}:${s.name}` : '')).join('|');
  if (sig === seatSig) return;
  seatSig = sig;
  const now = new Map<string, { player: string; key: string }>();
  for (const s of g.seats) {
    if (!s.playerId || !nameKey(s.name)) continue;
    const key = nameKey(s.name);
    const was = seated.get(s.id);
    if (was && was.player === s.playerId && was.key !== key) {
      const book = useProfiles.getState().profiles;
      const stillUsed = g.seats.some((x) => x.playerId && nameKey(x.name) === was.key);
      if (!book[key] && book[was.key] && !stillUsed) {
        const { [was.key]: moving, ...rest } = book;
        useProfiles.setState({ profiles: { ...rest, [key]: { ...moving, name: s.name.trim().slice(0, 24), updated: Date.now() } } });
      }
    }
    ensure(s.name);
    now.set(s.id, { player: s.playerId, key });
  }
  seated = now;
}

/**
 * The game's been called: everyone who played it (seated, with a character) is paid for finishing, winning and
 * surviving. Calling it again (after "carry on playing") pays or takes back only what changed.
 */
function payOut(g: GameState) {
  const end = g.ended;
  if (!end) return;
  const game = `${g.room}:${g.startedAt ?? 0}`;
  const WHY: Record<string, [number, string]> = {
    finish: [PAY.finish, 'for playing to the end'],
    win: [PAY.win, 'for the win'],
    survive: [PAY.survive, 'for surviving'],
  };
  for (const s of g.seats) {
    if (!s.playerId || !nameKey(s.name) || !s.roleId) continue;
    const due = ['finish', ...(seatAlignment(s) === end.winner ? ['win'] : []), ...(s.dead ? [] : ['survive'])];
    ensure(s.name);
    change(s.name, (p) => {
      const paid = p.games?.[game] ?? [];
      for (const item of due) if (!paid.includes(item)) addPay(p, WHY[item][0], WHY[item][1]);
      for (const item of paid) if (!due.includes(item) && WHY[item]) addPay(p, -WHY[item][0], `${WHY[item][1]}, taken back`);
      // (For the leaderboard: a win taken back is one fewer.)
      if (due.includes('win') !== paid.includes('win')) p.wins = Math.max(0, winsOf(p) + (due.includes('win') ? 1 : -1));
      const games = { ...(p.games ?? {}), [game]: due };
      p.games = Object.fromEntries(Object.entries(games).slice(-10));
    });
  }
}

let started = false;
/** Starts keeping profiles: in the Storyteller's browser, once the room opens. */
export function startProfiles() {
  if (started) return;
  started = true;
  for (const key of Object.keys(useProfiles.getState().profiles)) oneOffs(key);
  syncSeats(useHost.getState().g);
  useHost.subscribe((s, prev) => {
    syncSeats(s.g);
    if (s.g.ended && s.g.ended.at !== prev.g.ended?.at) payOut(s.g);
  });
  useProfiles.subscribe((s, prev) => {
    if (s.profiles === prev.profiles && s.done === prev.done) return;
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(flush, 300);
  });
  window.addEventListener('pagehide', flush);
  document.addEventListener('visibilitychange', () => document.visibilityState === 'hidden' && flush());
}

// ---------------------------------------------------------------- devices, and the copies players keep

/**
 * Whether a device (its hash) may play as this name: yes if it's one of the name's own, or if the name has none yet
 * (the first device to come claims it). If not, the Storyteller is asked (trustDevice() if they say yes).
 */
export function admitDevice(name: string, hash: string): boolean {
  const key = nameKey(name);
  if (!key) return true;
  const devices = useProfiles.getState().profiles[key]?.devices ?? [];
  if (devices.includes(hash)) return true;
  if (devices.length) return false;
  trustDevice(name, hash);
  return true;
}

/** Remembers a device for this name. */
export function trustDevice(name: string, hash: string) {
  ensure(name);
  change(name, (p) => void (p.devices = [...(p.devices ?? []).filter((h) => h !== hash), hash].slice(-DEVICES_KEPT)));
}

/** The book as players' browsers keep it: everything but the history. */
export function backupCopy(): BackupCopy {
  const { book, profiles: list, done } = useProfiles.getState();
  const out: BackupCopy['profiles'] = {};
  for (const [key, p] of Object.entries(list)) {
    const { pay: _pay, news: _news, games: _games, seen, ...rest } = p;
    // A few of the latest reports, so one counted just before the book was lost isn't counted twice.
    out[key] = { ...rest, seen: seen.slice(-10) };
  }
  return { book, at: Date.now(), done, profiles: out };
}

// ---------------------------------------------------------------- the Storyteller's panel

export const profiles = {
  /** Gives an achievement (with its money), which pops up on their screen if they're here. */
  grantFeat(key: string, feat: FeatId) {
    const p = useProfiles.getState().profiles[key];
    if (p) change(key, (x) => addFeat(x, feat, true));
  },
  /** Takes an achievement away (they can earn it again). Its money stays with them. */
  takeFeat(key: string, feat: FeatId) {
    const p = useProfiles.getState().profiles[key];
    if (p?.feats.includes(feat)) change(key, (x) => void (x.feats = x.feats.filter((f) => f !== feat)));
  },
  /** More money or less, from the Storyteller (never below nothing). */
  adjust(key: string, amount: number) {
    const p = useProfiles.getState().profiles[key];
    const n = Math.round(amount);
    if (p && n) change(key, (x) => addPay(x, n, n > 0 ? 'from the Storyteller' : 'taken by the Storyteller'));
  },
  forget(key: string) {
    const { [key]: _, ...rest } = useProfiles.getState().profiles;
    useProfiles.setState({ profiles: rest });
  },
  /** Forgets the devices a name plays on: the next one to join as them claims it. */
  forgetDevices(key: string) {
    if (useProfiles.getState().profiles[key]?.devices) change(key, (p) => void delete p.devices);
  },
  /** Every profile, for keeping safe or moving to another browser. */
  exportJSON(): string {
    const { book, profiles: list, done } = useProfiles.getState();
    return JSON.stringify({ ravenswood: 'profiles', v: 1, exported: new Date().toISOString(), book, done, profiles: list }, null, 1);
  },
  /**
   * Profiles from a file: each replaces any of the same name, and the rest stay. Returns how many, or what's wrong.
   * `adopt`: this browser takes the file's book over (restoring a book players kept, into a browser that had lost it).
   */
  importJSON(text: string, adopt = false): number | string {
    let raw: Partial<Book> & { ravenswood?: string };
    try {
      raw = JSON.parse(text);
    } catch {
      return 'That file isn’t a profiles file.';
    }
    if (!raw || raw.ravenswood !== 'profiles' || !raw.profiles || typeof raw.profiles !== 'object') return 'That file isn’t a profiles file.';
    const s = useProfiles.getState();
    const incoming: Record<string, Profile> = {};
    for (const [key, p] of Object.entries(raw.profiles).slice(0, 500)) if (nameKey(key)) incoming[nameKey(key)] = cleanProfile(p, key);
    useProfiles.setState({
      profiles: { ...s.profiles, ...incoming },
      done: [...new Set([...s.done, ...strings(raw.done, 2000, 60)])],
      // A browser with no profiles of its own takes the book over whole, so players' browsers know it.
      book: typeof raw.book !== 'string' || (Object.keys(s.profiles).length && !adopt) ? s.book : raw.book,
    });
    for (const key of Object.keys(incoming)) oneOffs(key);
    return Object.keys(incoming).length;
  },
};

if (debugHooks()) Object.assign(window, { __profiles: { store: useProfiles, credit, debit, grantPet, profileOf, ...profiles } });
