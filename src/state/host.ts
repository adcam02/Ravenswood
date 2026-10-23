import { create } from 'zustand';
import {
  defaultAlignment,
  editionScript,
  getRole,
  rolesByTeam,
  setCustomRoles,
  type Alignment,
  type Script,
} from '../data';
import { loadJSON, roomCode, saveJSON, shuffle, uid } from '../lib/util';
import { ui } from './ui';
import {
  ANIMALS,
  BED_SPOTS,
  COUNTER_SPOTS,
  emptyTown,
  fixLook,
  LINE_SLOTS,
  LINES,
  SHELF_SLOTS,
  type Item,
  type Look,
  type Weather,
} from '../world/types';
import type {
  Ask,
  DeathRecord,
  GameEnd,
  GameState,
  GrimoireSnapshot,
  Letter,
  Nomination,
  Pigeon,
  Phase,
  PrivateState,
  PublicState,
  Seat,
  TownAction,
  Visit,
  WakeMessage,
  WakePanel,
  WakeReply,
} from './types';

const KEY = 'ravenswood:storyteller';

export function blankSeat(): Seat {
  return {
    id: uid(),
    name: '',
    playerId: null,
    roleId: null,
    shownRoleId: null,
    alignment: null,
    dead: false,
    ghostVote: true,
    reminders: [],
    look: null,
  };
}

function freshGame(prev?: GameState, keepPlayers = true): GameState {
  const seats = prev
    ? prev.seats.map((s) =>
        keepPlayers ? { ...blankSeat(), id: s.id, name: s.name, playerId: s.playerId, look: s.look } : blankSeat(),
      )
    : [];
  return {
    v: 1,
    room: prev?.room ?? roomCode(),
    // The game proper starts with Night 1; before it, the town mingles in the daylight of Day 0.
    phase: 'day',
    day: 0,
    script: prev?.script ?? editionScript('tb'),
    seats,
    bag: [],
    bluffs: [null, null, null],
    fabled: [],
    revealed: false,
    grimoireRevealed: false,
    nomination: null,
    marked: null,
    history: [],
    townHall: null,
    execution: null,
    weather: prev?.weather ?? 'clear',
    dayTimer: null,
    town: prev?.town ?? emptyTown(),
    nightDeaths: [],
    letters: [],
    pigeons: [],
    slayer: [],
    deaths: [],
    ended: null,
    startedAt: Date.now(),
    awake: {},
    wakes: [],
    replies: [],
    nightDone: [],
  };
}

function loadGame(): GameState | null {
  const g = loadJSON<GameState | null>(KEY, null);
  if (!g || g.v !== 1 || !Array.isArray(g.seats)) return null;
  if (g.nomination && (g.nomination.status === 'running' || g.nomination.status === 'countdown')) {
    g.nomination.status = g.nomination.step > 0 ? 'paused' : 'idle';
  }
  g.townHall ??= null;
  g.nightDeaths ??= [];
  g.letters ??= [];
  g.pigeons ??= [];
  g.slayer ??= [];
  // A game saved before deaths were logged: those already dead are noted without a day.
  g.deaths ??= g.seats.filter((s) => s.dead).map((s) => ({ seatId: s.id, day: 0, phase: 'day' as const, how: 'other' as const, at: 0 }));
  g.ended ??= null;
  g.town ??= emptyTown();
  g.town.records ??= {};
  g.execution ??= null;
  g.weather ??= 'clear';
  g.dayTimer ??= null;
  for (const s of g.seats) s.look ??= null;
  // A script picked before untitled ones got a name of their own.
  if (!g.script.name?.trim()) g.script.name = 'Custom script';
  setCustomRoles(g.script.custom);
  return g;
}

// ---------------------------------------------------------------- derived values

export function seatName(g: { seats: { id: string; name: string }[] }, id: string | null | undefined): string {
  if (!id) return 'The Storyteller';
  const i = g.seats.findIndex((s) => s.id === id);
  if (i < 0) return 'Someone';
  return g.seats[i].name || `Seat ${i + 1}`;
}

export function aliveCount(seats: { dead: boolean }[]): number {
  return seats.filter((s) => !s.dead).length;
}

export function majorityOf(seats: { dead: boolean }[]): number {
  return Math.ceil(aliveCount(seats) / 2);
}

export function isTraveller(roleId: string | null | undefined): boolean {
  return getRole(roleId)?.team === 'traveller';
}

export function seatAlignment(s: Seat): Alignment | null {
  return s.alignment ?? defaultAlignment(getRole(s.roleId)?.team);
}

/** Who the Storyteller sees in each night-order role: the real character, plus anyone who thinks they have it. */
export function seatsWithRole(g: GameState, roleId: string): { seat: Seat; believes: boolean }[] {
  const out: { seat: Seat; believes: boolean }[] = [];
  for (const s of g.seats) {
    if (s.roleId === roleId) out.push({ seat: s, believes: false });
    else if (s.shownRoleId === roleId) out.push({ seat: s, believes: true });
  }
  return out;
}

/** The grimoire as the Spy would see it, taken now. */
export function grimoireSnapshot(g: GameState): GrimoireSnapshot {
  return {
    // Laid out as on the table: the Drunk's Townsfolk token, with its Drunk reminder.
    seats: g.seats.map((s, i) => {
      const marked = disguise(s);
      return { id: s.id, name: s.name || `Seat ${i + 1}`, roleId: heldRole(s), dead: s.dead, reminders: [...(marked ? [marked] : []), ...s.reminders.map((r) => r.text)] };
    }),
    bluffs: g.bluffs.filter(Boolean) as string[],
  };
}

export function nightLabel(g: { phase: Phase; day: number }): string {
  if (g.day === 0 && g.phase === 'day') return 'Before the game';
  return `${g.phase === 'night' ? 'Night' : 'Day'} ${g.day}`;
}

/** The latest answer this seat gave tonight, if they've been asked anything. */
export function replyTonight(g: GameState, seatId: string): WakeReply | null {
  const when = nightLabel(g);
  const asked = g.wakes.filter((w) => w.when === when && w.ask && w.to.includes(seatId)).map((w) => w.id);
  return [...g.replies].reverse().find((r) => r.seatId === seatId && asked.includes(r.wakeId)) ?? null;
}

export function toPublic(g: GameState, online: Set<string>): PublicState {
  return {
    room: g.room,
    phase: g.phase,
    day: g.day,
    script: g.script,
    seats: g.seats.map((s) => {
      const traveller = isTraveller(s.roleId);
      const show = g.grimoireRevealed || traveller;
      // A death in the night stays secret until dawn.
      const secret = g.phase === 'night' && g.nightDeaths.includes(s.id);
      return {
        id: s.id,
        name: s.name,
        claimed: Boolean(s.playerId),
        connected: Boolean(s.playerId && online.has(s.playerId)),
        dead: s.dead && !secret,
        ghostVote: secret ? true : s.ghostVote,
        roleId: show ? s.roleId : null,
        shownRoleId: g.grimoireRevealed ? s.shownRoleId : null,
        alignment: g.grimoireRevealed ? seatAlignment(s) : null,
        look: s.look,
        star: s.star ?? null,
        mail: (g.letters ?? []).some((l) => l.to === s.id && l.night > g.day) || undefined,
      };
    }),
    fabled: g.fabled,
    revealed: g.revealed,
    grimoireRevealed: g.grimoireRevealed,
    nomination: g.nomination,
    marked: g.marked,
    history: g.history,
    townHall: g.townHall,
    execution: g.execution,
    weather: g.weather,
    dayTimer: g.dayTimer,
    picking: Object.fromEntries(
      Object.entries(g.picking ?? {})
        .filter(([, h]) => h.until > Date.now())
        .map(([animal, h]) => [animal, h.name]),
    ),
    town: g.town,
    slayer: g.slayer.map(({ real: _, ...shot }) => shot),
    pigeons: recentPigeons(g).map(({ id, to, at }) => ({ id, to, at })),
    ended: g.ended && { winner: g.ended.winner, reason: g.ended.reason, at: g.ended.at, day: g.ended.day, since: g.ended.since },
    // Night deaths stay secret until dawn, so the list only goes out once the game is over.
    deaths: g.ended ? g.deaths : undefined,
  };
}

/** Characters are out and the first night has begun: a change to someone's character now is news to them. */
export const underway = (g: { revealed: boolean; phase: Phase; day: number }) => g.revealed && !(g.day === 0 && g.phase === 'day');

/** Whether a player can claim to be the Slayer right now: the script has one, and it's a day of the game. */
export function slayerOpen(g: { script: { roles: string[] }; phase: Phase; day: number; ended?: GameEnd | null }): boolean {
  return g.script.roles.includes('slayer') && g.phase === 'day' && g.day > 0 && !g.ended;
}

export interface WinCheck {
  winner: 'good' | 'evil';
  reason: string;
  key: string;
  /** More about it, when the usual words don't fit. */
  note?: string;
  /** A Demon that died tonight by its own ability can hand on: who could take over, and as which Demon. */
  pass?: { roleId: string; seatIds: string[] };
}

/** Whoever could take over from a Demon that died tonight: a living Minion for the Imp, an Outsider for the Fang Gu. */
function demonPass(g: GameState, demons: Seat[]): WinCheck['pass'] {
  if (g.phase !== 'night') return undefined;
  const team = (s: Seat) => (isTraveller(s.roleId) ? null : getRole(s.roleId)?.team);
  for (const d of demons) {
    if (!g.nightDeaths.includes(d.id)) continue;
    if (d.roleId === 'imp') {
      const minions = g.seats.filter((s) => !s.dead && team(s) === 'minion');
      if (minions.length) return { roleId: 'imp', seatIds: minions.map((s) => s.id) };
    }
    // The Fang Gu jumps once, to the Outsider it chose (if it said who).
    if (d.roleId === 'fanggu' && !g.seats.some((s) => s.reminders.some((r) => r.roleId === 'fanggu' && r.text === 'Once'))) {
      const outsiders = g.seats.filter((s) => !s.dead && team(s) === 'outsider');
      const chose = replyTonight(g, d.id)?.seatIds?.[0];
      const target = outsiders.filter((s) => s.id === chose);
      if (outsiders.length) return { roleId: 'fanggu', seatIds: (target.length ? target : outsiders).map((s) => s.id) };
    }
  }
  return undefined;
}

/**
 * Whether the grimoire says the game is over, for the Storyteller to confirm: every Demon dead (good wins), the
 * Goblin executed today (evil wins, if they claimed), or only two players left alive with the Demon among them (evil
 * wins). `key` changes whenever the reason does, so "not yet" holds until something moves on (a Scarlet Woman or a
 * starpass makes a new Demon, say). A Demon killed tonight that could hand on says who could take over.
 */
export function winCheck(g: GameState): WinCheck | null {
  if (g.ended || !underway(g)) return null;
  const players = g.seats.filter((s) => s.roleId && !isTraveller(s.roleId));
  const demons = players.filter((s) => getRole(s.roleId)?.team === 'demon');
  if (!demons.length) return null;
  const living = players.filter((s) => !s.dead);
  if (demons.every((s) => s.dead)) {
    const name = demons.length === 1 ? `The ${getRole(demons[0].roleId)?.name ?? 'Demon'}` : 'The Demon';
    const pass = demonPass(g, demons);
    const note =
      pass?.roleId === 'imp'
        ? 'If the Imp chose itself tonight, a living Minion becomes the Imp and the game goes on. Who?'
        : pass?.roleId === 'fanggu'
          ? 'If the Fang Gu chose an Outsider tonight, the Fang Gu dies instead and they become an evil Fang Gu. Who?'
          : undefined;
    return { winner: 'good', reason: `${name} is dead`, key: `good:${demons.map((d) => d.id).join()}`, note, pass };
  }
  // The Goblin's team wins if they claimed to be the Goblin when nominated (the Storyteller marks it with the Claimed
  // reminder) and are executed that day. Executed is enough: one who survives the hanging (the Devil's Advocate's
  // choice, say) still counts. (Today's execution is cleared at each change of phase.)
  const hanged = g.phase === 'day' ? g.deaths.filter((d) => d.how === 'executed' && d.day === g.day && d.phase === 'day').map((d) => d.seatId) : [];
  if (g.phase === 'day' && g.execution?.survives) hanged.push(g.execution.seatId);
  const goblin = g.seats.find((s) => s.roleId === 'goblin' && hanged.includes(s.id) && s.reminders.some((r) => r.roleId === 'goblin' && r.text === 'Claimed'));
  if (goblin) {
    return {
      winner: 'evil',
      reason: 'The Goblin claimed and was executed',
      key: `evil:goblin:${goblin.id}:${g.day}`,
      note: 'They claimed to be the Goblin when they were nominated today, so evil wins (unless they were drunk or poisoned).',
    };
  }
  if (living.length <= 2) return { winner: 'evil', reason: 'Only two players are left alive', key: `evil:${living.map((s) => s.id).join()}` };
  return null;
}

/** Notes a death for the recap (and forgets the latest one if they're brought back). */
function died(g: GameState, seatId: string, how: DeathRecord['how']) {
  g.deaths.push({ seatId, day: g.day, phase: g.phase, how, at: Date.now() });
}
function revived(g: GameState, seatId: string) {
  for (let i = g.deaths.length - 1; i >= 0; i--) {
    if (g.deaths[i].seatId !== seatId) continue;
    g.deaths.splice(i, 1);
    return;
  }
}

/** How long an animal stays held for someone looking at it in the picker, without them choosing. */
const HOLD_MS = 120000;

/** Who has this animal, other than `playerId`: a seated player's name, someone holding it, or null. */
export function animalTakenBy(g: GameState, animal: string, playerId: string): string | null {
  const seat = g.seats.find((s) => s.playerId && s.playerId !== playerId && s.look?.animal === animal);
  if (seat) return seat.name || 'Someone';
  const hold = g.picking?.[animal];
  if (hold && hold.playerId !== playerId && hold.until > Date.now()) return hold.name;
  return null;
}

function releaseHolds(g: GameState, playerId: string) {
  if (!g.picking) return;
  for (const [animal, h] of Object.entries(g.picking)) if (h.playerId === playerId || h.until <= Date.now()) delete g.picking[animal];
}

export function toPrivate(g: GameState, playerId: string): PrivateState {
  const seat = g.seats.find((s) => s.playerId === playerId) ?? null;
  if (!seat) return { seatId: null, roleId: null, alignment: null, wake: null, wakeSeen: false, log: [], replies: [] };
  const shown = seat.shownRoleId ?? seat.roleId;
  const awake = g.awake[seat.id];
  const visible = g.revealed || isTraveller(seat.roleId);
  // Each player gets the shared cards plus any meant only for them, and never anyone else's.
  const forSeat = (w: WakeMessage): WakeMessage => ({
    id: w.id,
    to: w.to,
    panels: [...w.panels, ...(w.extra?.[seat.id] ?? [])],
    ask: w.ask,
    at: w.at,
    when: w.when,
  });
  const current = awake ? g.wakes.find((w) => w.id === awake.wakeId) : undefined;
  return {
    seatId: seat.id,
    roleId: visible ? shown : null,
    alignment: visible ? seat.alignment ?? defaultAlignment(getRole(shown)?.team) : null,
    wake: current ? forSeat(current) : null,
    wakeSeen: awake?.seen ?? false,
    log: g.wakes.filter((w) => w.to.includes(seat.id)).map(forSeat),
    replies: g.replies.filter((r) => r.seatId === seat.id),
    letters: (g.letters ?? []).filter((l) => l.to === seat.id && l.night <= g.day).map(({ id, name, text, night, at }) => ({ id, name, text, night, at })),
    pigeons: recentPigeons(g)
      .filter((p) => p.to === seat.id)
      .map(({ id, name, where, at }) => ({ id, name, where, at })),
    visit: visitFor(g, seat.id),
  };
}

/** How many ways the hooded figure has of doing it (see the town's night visits). */
export const VISIT_KINDS = 4;

/**
 * Killed tonight: the hooded figure's visit to their bedroom. Which way it goes is picked from the seat and the
 * night, so it stays the same however often it's worked out.
 */
export function visitFor(g: GameState, seatId: string): Visit | null {
  if (g.phase !== 'night' || g.ended || !g.nightDeaths.includes(seatId)) return null;
  const death = [...g.deaths].reverse().find((d) => d.seatId === seatId && d.phase === 'night');
  let h = g.day * 7;
  for (const ch of seatId) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return { id: `${g.day}:${seatId}`, seatId, variant: h % VISIT_KINDS, at: death?.at ?? Date.now() };
}

/** Pigeons still worth showing: sent in the last minute. */
const PIGEON_SHOWN_MS = 60000;
/** How long a player's pigeon rests between flights. */
export const PIGEON_REST_MS = 20000;
const recentPigeons = (g: GameState): Pigeon[] => (g.pigeons ?? []).filter((p) => Date.now() - p.at < PIGEON_SHOWN_MS);

/** A letter's longest, and how many a player can post in a day. */
export const LETTER_MAX = 600;
export const LETTERS_PER_DAY = 8;
/** The oldest go once a game has this many. */
const LETTERS_KEPT = 300;

function votingOrder(seats: Seat[], nomineeId: string): string[] {
  const i = seats.findIndex((s) => s.id === nomineeId);
  const n = seats.length;
  return Array.from({ length: n }, (_, k) => seats[(i + 1 + k) % n].id);
}

function pickRandom<T>(list: T[]): T | null {
  return list.length ? list[Math.floor(Math.random() * list.length)] : null;
}

/** The Drunk, Lunatic and Marionette are told they are something else. */
function suggestShown(g: GameState, seat: Seat): string | null {
  const inPlay = new Set(g.seats.map((s) => s.roleId).filter(Boolean) as string[]);
  const byTeam = rolesByTeam(g.script.roles);
  const unused = (team: 'townsfolk' | 'outsider' | 'demon') => byTeam[team].map((r) => r.id).filter((id) => !inPlay.has(id));
  if (seat.roleId === 'drunk') return pickRandom(unused('townsfolk'));
  if (seat.roleId === 'marionette') return pickRandom([...unused('townsfolk'), ...unused('outsider')]);
  if (seat.roleId === 'lunatic') {
    const demon = g.seats.find((s) => getRole(s.roleId)?.team === 'demon');
    return demon?.roleId ?? pickRandom(byTeam.demon.map((r) => r.id));
  }
  return null;
}

export const NEEDS_SHOWN = new Set(['drunk', 'lunatic', 'marionette']);

/**
 * Characters whose player holds another character's token instead, as at a real table: the Drunk's player gets a
 * Townsfolk token from the bag. The grimoire shows the token they hold, with this reminder of what they really are.
 * (Not the Lunatic: the Demon they think they are is in play, so that would show the Demon twice.)
 */
export const DISGUISED: Record<string, string> = { drunk: 'Is the Drunk', marionette: 'Is the Marionette' };

/** The token on a seat as the Storyteller lays out the grimoire: the one its player holds. */
export const heldRole = (s: { roleId: string | null; shownRoleId?: string | null }): string | null =>
  s.roleId && DISGUISED[s.roleId] && s.shownRoleId ? s.shownRoleId : s.roleId;

/** The reminder that goes with a disguised character's token, if the seat has one. */
export const disguise = (s: { roleId: string | null; shownRoleId?: string | null }): string | null =>
  s.roleId && DISGUISED[s.roleId] && s.shownRoleId ? DISGUISED[s.roleId] : null;

// ---------------------------------------------------------------- the store

interface HostStore {
  g: GameState;
  update: (fn: (g: GameState) => void) => void;
}

export const useHost = create<HostStore>((set, get) => ({
  g: loadGame() ?? freshGame(),
  update: (fn) => {
    const g = structuredClone(get().g);
    fn(g);
    set({ g });
  },
}));

let saveTimer: ReturnType<typeof setTimeout> | null = null;
let saveWarned = false;
const flush = () => {
  if (!saveTimer) return;
  clearTimeout(saveTimer);
  saveTimer = null;
  const ok = saveJSON(KEY, useHost.getState().g);
  // Say so (once) if the game can't be kept: a refresh would lose it.
  if (!ok && !saveWarned) {
    saveWarned = true;
    ui.toast('This browser won’t save the game (its storage is full or blocked), so don’t refresh the page.', 'evil');
  }
  if (ok) saveWarned = false;
};
useHost.subscribe(() => {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(flush, 150);
});
// Don't lose the last change if the tab is closed or refreshed straight after it.
window.addEventListener('pagehide', flush);
document.addEventListener('visibilitychange', () => document.visibilityState === 'hidden' && flush());

export const hostGame = () => useHost.getState().g;
const update = (fn: (g: GameState) => void) => useHost.getState().update(fn);
const seatOf = (g: GameState, id: string) => g.seats.find((s) => s.id === id);

// ---------------------------------------------------------------- voting clock

let clock: ReturnType<typeof setTimeout> | null = null;

function stopClock() {
  if (clock) clearTimeout(clock);
  clock = null;
}

function lockSeat(g: GameState, nom: Nomination, seatId: string) {
  if (nom.locked.includes(seatId)) return;
  nom.locked.push(seatId);
  const seat = seatOf(g, seatId);
  if (seat?.dead && nom.votes.includes(seatId)) {
    seat.ghostVote = false;
    nom.spentGhosts.push(seatId);
  }
}

function runClock() {
  stopClock();
  const nom = hostGame().nomination;
  if (!nom) return;
  if (nom.status === 'countdown') {
    clock = setTimeout(() => {
      update((g) => {
        const n = g.nomination;
        if (!n || n.status !== 'countdown') return;
        if (n.countdown > 1) n.countdown -= 1;
        else {
          n.countdown = 0;
          n.status = 'running';
        }
      });
      runClock();
    }, 1000);
  } else if (nom.status === 'running') {
    clock = setTimeout(() => {
      update((g) => {
        const n = g.nomination;
        if (!n || n.status !== 'running') return;
        // The hand has rested on this player for a whole turn, so their vote is final as it moves on.
        if (n.step >= 1) lockSeat(g, n, n.order[n.step - 1]);
        if (n.step >= n.order.length) n.status = 'done';
        else n.step += 1;
      });
      runClock();
    }, nom.secondsPerPlayer * 1000);
  }
}

// ---------------------------------------------------------------- around town

const MAX_FISH_LOG = 20;
const clip = (v: unknown, n = 24) => String(v ?? '').slice(0, n);
const stars = (v: unknown) => Math.max(0, Math.min(3, Math.round(Number(v) || 0)));
const COLOR = /^#[0-9a-f]{6}$/i;

/** Applies one thing someone did around town, by name. Returns an item if it goes into their paw. */
export function townAction(by: string, a: TownAction): Item | null {
  let item: Item | null = null;
  update((g) => {
    const t = g.town;
    switch (a.k) {
      case 'pour': {
        if (!['ale', 'cider', 'milk', 'cocoa'].includes(a.kind)) return;
        // A full bar pushes the oldest drink off the end.
        if (t.drinks.length >= COUNTER_SPOTS) t.drinks.shift();
        const used = new Set(t.drinks.map((d) => d.spot));
        const spot = Array.from({ length: COUNTER_SPOTS }, (_, i) => i).find((i) => !used.has(i)) ?? 0;
        t.drinks.push({ id: uid(), kind: a.kind, stars: stars(a.stars), by: clip(by), spot });
        break;
      }
      case 'takeDrink': {
        const d = t.drinks.find((x) => x.id === a.id);
        if (!d) return;
        t.drinks = t.drinks.filter((x) => x !== d);
        item = { k: d.kind };
        break;
      }
      case 'wash': {
        if (!['shirt', 'sock', 'dress', 'towel', 'pants'].includes(a.kind) || !COLOR.test(a.color)) return;
        if (t.clothes.length >= LINES * LINE_SLOTS) t.clothes.shift();
        const used = new Set(t.clothes.map((c) => c.line * LINE_SLOTS + c.slot));
        const free = Array.from({ length: LINES * LINE_SLOTS }, (_, i) => i).find((i) => !used.has(i)) ?? 0;
        t.clothes.push({ id: uid(), kind: a.kind, color: a.color, by: clip(by), line: Math.floor(free / LINE_SLOTS), slot: free % LINE_SLOTS });
        break;
      }
      case 'plant': {
        if (!['tulip', 'daisy', 'sunflower', 'rose'].includes(a.kind) || !COLOR.test(a.color)) return;
        const bed = Math.max(0, Math.min(3, Math.floor(Number(a.bed) || 0)));
        const inBed = t.flowers.filter((f) => f.bed === bed);
        // A full bed loses its oldest flower to make room.
        if (inBed.length >= BED_SPOTS) t.flowers = t.flowers.filter((f) => f !== inBed[0]);
        const used = new Set(t.flowers.filter((f) => f.bed === bed).map((f) => f.spot));
        const spot = Array.from({ length: BED_SPOTS }, (_, i) => i).find((i) => !used.has(i)) ?? 0;
        t.flowers.push({ id: uid(), bed, spot, kind: a.kind, color: a.color, by: clip(by), at: Date.now() });
        break;
      }
      case 'bake': {
        if (!['loaf', 'pie', 'bun'].includes(a.kind)) return;
        if (t.loaves.length >= SHELF_SLOTS) t.loaves.shift();
        const used = new Set(t.loaves.map((l) => l.slot));
        const slot = Array.from({ length: SHELF_SLOTS }, (_, i) => i).find((i) => !used.has(i)) ?? 0;
        t.loaves.push({ id: uid(), kind: a.kind, stars: stars(a.stars), by: clip(by), slot });
        break;
      }
      case 'takeBake': {
        const l = t.loaves.find((x) => x.id === a.id);
        if (!l) return;
        t.loaves = t.loaves.filter((x) => x !== l);
        item = { k: l.kind };
        break;
      }
      case 'fish': {
        t.fish.push({ by: clip(by), kind: clip(a.kind, 30), cm: Math.max(0, Math.min(500, Math.round(Number(a.cm) || 0))), at: Date.now() });
        if (t.fish.length > MAX_FISH_LOG) t.fish.splice(0, t.fish.length - MAX_FISH_LOG);
        break;
      }
      case 'record': {
        const game = clip(a.game, 20);
        const score = Math.max(0, Math.min(100000, Math.round(Number(a.score) || 0)));
        if (!/^[a-z]+$/.test(game) || score <= 0) return;
        const prev = t.records[game];
        if (!prev || score > prev.score) t.records = { ...t.records, [game]: { by: clip(by), score, at: Date.now() } };
        break;
      }
    }
  });
  return item;
}

// ---------------------------------------------------------------- actions

export const st = {
  newGame(keepPlayers: boolean) {
    stopClock();
    const prev = hostGame();
    useHost.setState({ g: freshGame(prev, keepPlayers) });
  },
  newRoom() {
    stopClock();
    useHost.setState({ g: { ...freshGame(), room: roomCode() } });
  },

  setScript(script: Script) {
    setCustomRoles(script.custom);
    update((g) => {
      g.script = script;
      g.bag = [];
      g.bluffs = [null, null, null];
    });
  },

  // seats
  addSeat() {
    update((g) => void g.seats.push(blankSeat()));
  },
  setSeatCount(n: number) {
    update((g) => {
      while (g.seats.length < n) g.seats.push(blankSeat());
      // Remove empty, unclaimed seats from the end first.
      for (let i = g.seats.length - 1; i >= 0 && g.seats.length > n; i--) {
        if (!g.seats[i].playerId && !g.seats[i].name) g.seats.splice(i, 1);
      }
      while (g.seats.length > n) g.seats.pop();
    });
  },
  removeSeat(id: string) {
    update((g) => {
      g.seats = g.seats.filter((s) => s.id !== id);
      delete g.awake[id];
      if (g.nomination && (g.nomination.nomineeId === id || g.nomination.nominatorId === id)) g.nomination = null;
      if (g.marked?.seatId === id) g.marked = null;
    });
  },
  renameSeat(id: string, name: string) {
    update((g) => {
      const s = seatOf(g, id);
      if (!s) return;
      s.name = name.trim().slice(0, 24);
    });
  },
  swapSeats(a: string, b: string) {
    update((g) => {
      const i = g.seats.findIndex((s) => s.id === a);
      const j = g.seats.findIndex((s) => s.id === b);
      if (i < 0 || j < 0) return;
      [g.seats[i], g.seats[j]] = [g.seats[j], g.seats[i]];
    });
  },
  moveSeat(id: string, toId: string) {
    update((g) => {
      const i = g.seats.findIndex((s) => s.id === id);
      const j = g.seats.findIndex((s) => s.id === toId);
      if (i < 0 || j < 0) return;
      const [s] = g.seats.splice(i, 1);
      g.seats.splice(j, 0, s);
    });
  },
  vacateSeat(id: string) {
    update((g) => {
      const s = seatOf(g, id);
      if (s) s.playerId = null;
    });
  },

  // characters
  setRole(id: string, roleId: string | null) {
    update((g) => {
      const s = seatOf(g, id);
      if (!s) return;
      s.roleId = roleId;
      s.shownRoleId = null;
      s.alignment = null;
      if (roleId && NEEDS_SHOWN.has(roleId)) s.shownRoleId = suggestShown(g, s);
      if (!g.revealed && roleId) {
        // Handing out the Demon after the Lunatic: the Lunatic thinks they're this Demon, not one that isn't in play.
        if (getRole(roleId)?.team === 'demon') {
          const demons = new Set(g.seats.filter((x) => getRole(x.roleId)?.team === 'demon').map((x) => x.roleId));
          for (const x of g.seats) if (x.roleId === 'lunatic' && !demons.has(x.shownRoleId)) x.shownRoleId = roleId;
        }
        // A Drunk who was to think they're this Townsfolk needs another that isn't in play.
        for (const x of g.seats) if (x !== s && x.shownRoleId === roleId && DISGUISED[x.roleId ?? '']) x.shownRoleId = suggestShown(g, x);
      }
    });
  },
  /** A Demon handing on in the night: this seat becomes it, evil (an Imp's starpass, a Fang Gu's jump, once only). */
  becomeDemon(seatId: string, roleId: string) {
    update((g) => {
      const s = seatOf(g, seatId);
      if (!s) return;
      s.roleId = roleId;
      s.shownRoleId = null;
      s.alignment = null;
      if (roleId === 'fanggu') s.reminders.push({ id: uid(), roleId: 'fanggu', text: 'Once' });
    });
  },
  setShownRole(id: string, roleId: string | null) {
    update((g) => {
      const s = seatOf(g, id);
      if (s) s.shownRoleId = roleId && roleId !== s.roleId ? roleId : null;
    });
  },
  setAlignment(id: string, alignment: Alignment | null) {
    update((g) => {
      const s = seatOf(g, id);
      if (!s) return;
      s.alignment = alignment === defaultAlignment(getRole(s.roleId)?.team) ? null : alignment;
    });
  },
  /**
   * Swaps two seats' characters. Their alignments go with the tokens (as when dealing, or for a Snake Charmer), or
   * with `keepAlignments` each player stays on their own side, as with the Barber: a Minion swapped with a Townsfolk
   * is an evil Townsfolk.
   */
  swapRoles(a: string, b: string, keepAlignments = false) {
    update((g) => {
      const x = seatOf(g, a);
      const y = seatOf(g, b);
      if (!x || !y) return;
      const sides = [seatAlignment(x), seatAlignment(y)];
      [x.roleId, y.roleId] = [y.roleId, x.roleId];
      [x.shownRoleId, y.shownRoleId] = [y.shownRoleId, x.shownRoleId];
      [x.alignment, y.alignment] = [y.alignment, x.alignment];
      if (!keepAlignments) return;
      [x, y].forEach((s, i) => {
        const natural = defaultAlignment(getRole(s.roleId)?.team);
        s.alignment = sides[i] && sides[i] !== natural ? sides[i] : null;
      });
    });
  },
  clearRoles() {
    update((g) => {
      for (const s of g.seats) {
        s.roleId = null;
        s.shownRoleId = null;
        s.alignment = null;
        s.reminders = [];
      }
      g.revealed = false;
    });
  },
  toggleDead(id: string) {
    update((g) => {
      const s = seatOf(g, id);
      if (!s) return;
      s.dead = !s.dead;
      if (!s.dead) s.ghostVote = true;
      g.nightDeaths = g.nightDeaths.filter((x) => x !== id);
      if (s.dead && g.phase === 'night') g.nightDeaths.push(id);
      // Killing the player on the block by day is an execution: the whole town watches.
      const executed = s.dead && g.phase === 'day' && g.marked?.seatId === id;
      if (executed) {
        g.execution = { id: uid(), seatId: id, at: Date.now() };
        g.marked = null;
      }
      if (s.dead) died(g, id, g.phase === 'night' ? 'night' : executed ? 'executed' : 'other');
      else revived(g, id);
    });
  },
  /** Hangs a player at the gallows in front of the town, whoever is on the block. */
  execute(id: string) {
    update((g) => {
      const s = seatOf(g, id);
      if (!s || s.dead) return;
      s.dead = true;
      died(g, id, 'executed');
      g.execution = { id: uid(), seatId: id, at: Date.now() };
      if (g.marked?.seatId === id) g.marked = null;
    });
  },
  /**
   * An execution that doesn't kill, for the Devil's Advocate's choice, the Fool, a Tea Lady's neighbour and the
   * like: the whole town watches the hanging, and the rope snaps. They stay alive.
   */
  spare(id: string) {
    update((g) => {
      const s = seatOf(g, id);
      if (!s || s.dead) return;
      g.execution = { id: uid(), seatId: id, at: Date.now(), survives: true };
      if (g.marked?.seatId === id) g.marked = null;
    });
  },
  toggleGhostVote(id: string) {
    update((g) => {
      const s = seatOf(g, id);
      if (s) s.ghostVote = !s.ghostVote;
    });
  },
  addReminder(seatId: string, roleId: string, text: string) {
    update((g) => void seatOf(g, seatId)?.reminders.push({ id: uid(), roleId, text }));
  },
  removeReminder(seatId: string, reminderId: string) {
    update((g) => {
      const s = seatOf(g, seatId);
      if (s) s.reminders = s.reminders.filter((r) => r.id !== reminderId);
    });
  },

  // the bag
  setBag(ids: string[]) {
    update((g) => void (g.bag = ids));
  },
  addToBag(id: string) {
    update((g) => void g.bag.push(id));
  },
  removeFromBag(id: string) {
    update((g) => {
      const i = g.bag.lastIndexOf(id);
      if (i >= 0) g.bag.splice(i, 1);
    });
  },
  /** Hand the bag out at random to every seat that isn't a traveller. */
  dealRandom() {
    update((g) => {
      const seats = g.seats.filter((s) => !isTraveller(s.roleId));
      const bag = shuffle(g.bag).slice(0, seats.length);
      seats.forEach((s, i) => {
        s.roleId = bag[i] ?? null;
        s.shownRoleId = null;
        s.alignment = null;
        s.reminders = [];
      });
      for (const s of seats) if (s.roleId && NEEDS_SHOWN.has(s.roleId)) s.shownRoleId = suggestShown(g, s);
    });
  },
  suggestShown(id: string) {
    update((g) => {
      const s = seatOf(g, id);
      if (s) s.shownRoleId = suggestShown(g, s);
    });
  },
  reveal(on: boolean) {
    update((g) => void (g.revealed = on));
  },

  // bluffs & fabled
  setBluff(i: number, id: string | null) {
    update((g) => void (g.bluffs[i] = id));
  },
  randomBluffs() {
    update((g) => {
      const inPlay = new Set(g.seats.flatMap((s) => [s.roleId, s.shownRoleId]).filter(Boolean) as string[]);
      const byTeam = rolesByTeam(g.script.roles);
      const pool = [...byTeam.townsfolk, ...byTeam.outsider].map((r) => r.id).filter((id) => !inPlay.has(id));
      const tf = shuffle(byTeam.townsfolk.map((r) => r.id).filter((id) => !inPlay.has(id)));
      // Two Townsfolk and one Townsfolk-or-Outsider reads like a believable spread.
      const picks = [...tf.slice(0, 2)];
      for (const id of shuffle(pool)) if (picks.length < 3 && !picks.includes(id)) picks.push(id);
      g.bluffs = [picks[0] ?? null, picks[1] ?? null, picks[2] ?? null];
    });
  },
  toggleFabled(id: string) {
    update((g) => {
      g.fabled = g.fabled.includes(id) ? g.fabled.filter((f) => f !== id) : [...g.fabled, id];
    });
  },

  // day & night
  setPhase(phase: Phase) {
    stopClock();
    update((g) => {
      if (g.phase === phase) return;
      if (phase === 'night' && g.phase === 'day') g.day += 1;
      g.phase = phase;
      g.nomination = null;
      g.marked = null;
      g.nightDone = [];
      g.townHall = null;
      g.nightDeaths = [];
      g.execution = null;
      // A day timer belongs to the day it was set for.
      g.dayTimer = null;
      if (phase === 'day') g.awake = {};
    });
  },
  /** Rain, mist or clear skies over the town. */
  setWeather(w: Weather) {
    if (!['clear', 'mist', 'rain'].includes(w)) return;
    update((g) => void (g.weather = w));
  },
  /** Starts (or clears, with null) a countdown for the day. */
  setDayTimer(minutes: number | null, autoBell = true) {
    update((g) => {
      if (minutes === null || !(minutes > 0)) {
        g.dayTimer = null;
        return;
      }
      const now = Date.now();
      g.dayTimer = { start: now, end: now + Math.round(minutes * 60000), autoBell, rang: false };
    });
  },
  /** Adds (or takes away) minutes from a running day timer. */
  nudgeDayTimer(minutes: number) {
    update((g) => {
      if (!g.dayTimer) return;
      g.dayTimer.end = Math.max(Date.now() + 10000, g.dayTimer.end + minutes * 60000);
      g.dayTimer.rang = false;
    });
  },
  /** The host's clock tick: rings the bell once when a day timer with the bell on runs out. */
  checkDayTimer() {
    const g = useHost.getState().g;
    const t = g.dayTimer;
    if (!t || t.rang || Date.now() < t.end || g.phase !== 'day') return;
    update((g) => {
      if (g.dayTimer) g.dayTimer.rang = true;
    });
    if (t.autoBell) st.callTownHall();
  },
  setDay(day: number) {
    update((g) => void (g.day = Math.max(0, day)));
  },
  toggleNightDone(key: string) {
    update((g) => {
      g.nightDone = g.nightDone.includes(key) ? g.nightDone.filter((k) => k !== key) : [...g.nightDone, key];
    });
  },
  setNightDone(key: string, done: boolean) {
    update((g) => {
      if (done === g.nightDone.includes(key)) return;
      g.nightDone = done ? [...g.nightDone, key] : g.nightDone.filter((k) => k !== key);
    });
  },

  // nominations
  nominate(nominatorId: string | null, nomineeId: string) {
    stopClock();
    update((g) => {
      const prev = g.nomination;
      g.nomination = {
        nominatorId,
        nomineeId,
        votes: [],
        locked: [],
        spentGhosts: [],
        order: votingOrder(g.seats, nomineeId),
        step: 0,
        status: 'idle',
        countdown: 0,
        secondsPerPlayer: prev?.secondsPerPlayer ?? 2,
      };
    });
  },
  setVote(seatId: string, up: boolean, force = false) {
    update((g) => {
      const n = g.nomination;
      const seat = seatOf(g, seatId);
      if (!n || !seat || n.status === 'done') return;
      if (!force && n.locked.includes(seatId)) return;
      if (!force && up && seat.dead && !seat.ghostVote) return;
      n.votes = n.votes.filter((v) => v !== seatId);
      if (up) n.votes.push(seatId);
      if (force && n.locked.includes(seatId) && seat.dead) {
        // The Storyteller corrected a locked dead vote; keep the ghost vote in step.
        const spent = n.spentGhosts.includes(seatId);
        if (up && !spent) {
          seat.ghostVote = false;
          n.spentGhosts.push(seatId);
        } else if (!up && spent) {
          seat.ghostVote = true;
          n.spentGhosts = n.spentGhosts.filter((x) => x !== seatId);
        }
      }
    });
  },
  countdown() {
    update((g) => {
      const n = g.nomination;
      if (!n || n.status === 'done') return;
      n.status = 'countdown';
      n.countdown = 3;
    });
    runClock();
  },
  startVote() {
    update((g) => {
      const n = g.nomination;
      if (n && n.status !== 'done') n.status = 'running';
    });
    runClock();
  },
  pauseVote() {
    stopClock();
    update((g) => {
      const n = g.nomination;
      if (n && (n.status === 'running' || n.status === 'countdown')) n.status = 'paused';
    });
  },
  resetVote() {
    stopClock();
    update((g) => {
      const n = g.nomination;
      if (!n) return;
      for (const id of n.spentGhosts) {
        const s = seatOf(g, id);
        if (s) s.ghostVote = true;
      }
      Object.assign(n, { votes: [], locked: [], spentGhosts: [], step: 0, status: 'idle', countdown: 0 });
    });
  },
  setSecondsPerPlayer(secs: number) {
    update((g) => {
      if (g.nomination) g.nomination.secondsPerPlayer = Math.max(1, Math.min(10, secs));
    });
  },
  closeNomination() {
    stopClock();
    update((g) => {
      const n = g.nomination;
      if (!n) return;
      if (n.status === 'done') {
        const voters = n.order.filter((id) => n.votes.includes(id));
        g.history.push({
          id: uid(),
          day: g.day,
          nominatorId: n.nominatorId,
          nomineeId: n.nomineeId,
          nominatorName: seatName(g, n.nominatorId),
          nomineeName: seatName(g, n.nomineeId),
          voters,
          votes: voters.length,
          majority: majorityOf(g.seats),
        });
      }
      g.nomination = null;
    });
  },
  markSeat(seatId: string, votes?: number) {
    update((g) => {
      const n = g.nomination;
      g.marked = { seatId, votes: votes ?? (n && n.nomineeId === seatId ? n.votes.length : 0) };
    });
  },
  clearMark() {
    update((g) => void (g.marked = null));
  },

  // waking players
  wake(to: string[], panels: WakePanel[], ask: Ask, extra: Record<string, WakePanel[]> = {}): string {
    const id = uid();
    const mine = Object.fromEntries(Object.entries(extra).filter(([seat, p]) => to.includes(seat) && p.length));
    update((g) => {
      const msg: WakeMessage = { id, to, panels, ask, at: Date.now(), when: nightLabel(g) };
      if (Object.keys(mine).length) msg.extra = mine;
      g.wakes.push(msg);
      for (const seatId of to) g.awake[seatId] = { wakeId: id, seen: false };
    });
    return id;
  },
  sleep(seatIds?: string[]) {
    update((g) => {
      if (!seatIds) g.awake = {};
      else for (const id of seatIds) delete g.awake[id];
    });
  },
  /**
   * Rings the bell on every player's screen until they're on their stools. Ringing again during a meeting
   * calls everyone back to their stools (anyone already sitting counts straight away).
   */
  callTownHall() {
    update((g) => {
      if (g.townHall?.gathered) g.townHall = { ...g.townHall, ring: g.townHall.ring + 1, at: Date.now(), back: [], gathered: false };
      else if (g.townHall) {
        g.townHall.ring += 1;
        g.townHall.at = Date.now();
      } else g.townHall = { id: uid(), at: Date.now(), ring: 0, back: [] };
    });
  },
  /** Stops the bell but keeps the meeting going with whoever is there. */
  stopBell() {
    update((g) => void (g.townHall && (g.townHall.gathered = true)));
  },
  /** Ends the meeting: the stools go and everyone is free to wander. */
  endTownHall() {
    update((g) => void (g.townHall = null));
  },
  /** A player has reached the square while the bell is ringing; once everyone has, the bell stops. */
  arrived(seatId: string) {
    update((g) => {
      const call = g.townHall;
      if (!call || call.back.includes(seatId)) return;
      call.back.push(seatId);
      const players = g.seats.filter((s) => s.playerId);
      if (players.length && players.every((s) => call.back.includes(s.id))) call.gathered = true;
    });
  },
  revealGrimoire(on: boolean) {
    update((g) => void (g.grimoireRevealed = on));
  },
  /**
   * Calls the game: everyone's character is revealed and the town gathers on the stools around the clock tower
   * for the celebrations (by daylight, so nobody's stuck in bed). Night deaths come out now too.
   */
  endGame(winner: 'good' | 'evil', reason: string) {
    stopClock();
    update((g) => {
      if (g.ended) return;
      // Whatever the grimoire said is settled now, so the question doesn't come back after "carry on playing".
      g.winDismissed = winCheck(g)?.key ?? g.winDismissed ?? null;
      g.ended = {
        winner,
        reason,
        at: Date.now(),
        day: g.day,
        since: g.startedAt,
        before: { phase: g.phase, nightDeaths: [...g.nightDeaths], revealed: g.grimoireRevealed },
      };
      g.grimoireRevealed = true;
      g.phase = 'day';
      g.nightDeaths = [];
      g.awake = {};
      g.nomination = null;
      g.marked = null;
      g.dayTimer = null;
      g.execution = null;
      g.townHall = { id: uid(), at: Date.now(), ring: 0, back: [], gathered: true };
    });
  },
  /** Takes back calling the game, to carry on playing just as things were (mid-night, if that's when it was). */
  reopenGame() {
    update((g) => {
      const before = g.ended?.before;
      g.ended = null;
      g.grimoireRevealed = before?.revealed ?? false;
      if (before) {
        g.phase = before.phase;
        g.nightDeaths = before.nightDeaths;
      }
      g.townHall = null;
    });
  },
  /** "Not yet": the game-over question waits until something changes. */
  dismissWin(key: string) {
    update((g) => void (g.winDismissed = key));
  },
  /** What came of a Slayer claim: the chosen player dies, or nothing happens. */
  settleSlayer(id: string, kill: boolean) {
    update((g) => {
      const shot = g.slayer.find((s) => s.id === id);
      if (!shot || shot.result !== 'pending') return;
      shot.result = kill && shot.real ? 'dies' : 'nothing';
      const target = seatOf(g, shot.target);
      if (shot.result === 'dies' && target) {
        // (A Zombuul that has already "died" is shown dead already; this is the death that counts.)
        target.dead = true;
        died(g, target.id, 'slayer');
        if (g.marked?.seatId === target.id) g.marked = null;
      }
      // The real Slayer's ability is spent either way, so the grimoire says so.
      const by = seatOf(g, shot.by);
      if (shot.real && by && !by.reminders.some((r) => r.roleId === 'slayer')) by.reminders.push({ id: uid(), roleId: 'slayer', text: 'No Ability' });
    });
  },

  // things players ask for
  fromPlayer: {
    /** A player arriving with their name and animal: back to their own seat, or the first empty one, or a new one. */
    /**
     * Takes a seat with a name and a look. Each animal belongs to one player: if someone else already has
     * this one (or is holding it in their picker), the seat is kept but the look isn't, and the answer
     * says who has it, so the player picks again.
     */
    join(playerId: string, name: string, look: Partial<Look>): { taken: string; by: string } | null {
      const clean = name.trim().slice(0, 24);
      if (!clean) return null;
      const g0 = hostGame();
      const fixed = fixLook(look);
      const by = animalTakenBy(g0, fixed.animal, playerId);
      update((g) => {
        let seat = g.seats.find((s) => s.playerId === playerId);
        seat ??= g.seats.find((s) => !s.playerId && s.name.toLowerCase() === clean.toLowerCase());
        seat ??= g.seats.find((s) => !s.playerId && !s.name);
        if (!seat) {
          seat = blankSeat();
          g.seats.push(seat);
        }
        seat.playerId = playerId;
        seat.name = clean;
        if (!by) seat.look = fixed;
        else if (seat.look && animalTakenBy(g, seat.look.animal, playerId)) seat.look = null;
        // Their pick is settled (or refused): let go of anything they were holding.
        releaseHolds(g, playerId);
      });
      return by ? { taken: fixed.animal, by } : null;
    },
    /** Holds an animal while a player looks at it in the picker. The first to ask gets it. */
    hold(playerId: string, name: string, animal: string | null): { taken: string; by: string } | null {
      const g0 = hostGame();
      if (animal !== null) {
        const info = ANIMALS.find((a) => a.id === animal);
        if (!info) return null;
        const by = animalTakenBy(g0, animal, playerId);
        if (by) return { taken: animal, by };
      }
      update((g) => {
        releaseHolds(g, playerId);
        if (animal) (g.picking ??= {})[animal] = { playerId, name: name.trim().slice(0, 24) || 'Someone', until: Date.now() + HOLD_MS };
      });
      return null;
    },
    leave(playerId: string) {
      update((g) => {
        for (const s of g.seats) if (s.playerId === playerId) s.playerId = null;
        releaseHolds(g, playerId);
      });
    },
    /** A player's connection dropped: their picker holds go (their seat and animal stay theirs). */
    dropped(playerId: string) {
      if (!Object.values(hostGame().picking ?? {}).some((h) => h.playerId === playerId)) return;
      update((g) => releaseHolds(g, playerId));
    },
    rename(playerId: string, name: string) {
      update((g) => {
        const s = g.seats.find((x) => x.playerId === playerId);
        if (!s) return;
        if (name.trim()) s.name = name.trim().slice(0, 24);
      });
    },
    vote(playerId: string, up: boolean) {
      const s = hostGame().seats.find((x) => x.playerId === playerId);
      if (s) st.setVote(s.id, up);
    },
    /**
     * A player claims to be the Slayer and chooses someone (once a game each). The Storyteller answers every claim,
     * so the wait for the outcome is the same whoever made it: for the real Slayer they decide (the Slayer might be
     * drunk or poisoned, or the target might register as the Demon); for anyone else, nothing happens.
     */
    slay(playerId: string, targetId: string) {
      const g = hostGame();
      const s = g.seats.find((x) => x.playerId === playerId);
      const target = seatOf(g, targetId);
      if (!s || s.dead || !target || target.id === s.id || !slayerOpen(g) || g.slayer.some((x) => x.by === s.id)) return;
      const id = uid();
      const real = s.roleId === 'slayer';
      update((g) => void g.slayer.push({ id, by: s.id, target: target.id, at: Date.now(), result: 'pending', real, day: g.day }));
    },
    /**
     * A letter posted in someone's letterbox. By day only, to another seat, a few a day each, and kept short; it
     * arrives that night. Unsigned letters keep the writer's seat with the game (the Storyteller's) but never send it on.
     */
    letter(playerId: string, to: string, text: string, signed: boolean): boolean {
      const g = hostGame();
      const s = g.seats.find((x) => x.playerId === playerId);
      const clean = text.replace(/\r/g, '').trim().slice(0, LETTER_MAX);
      if (!s || !clean || to === s.id || !seatOf(g, to) || g.phase !== 'day' || g.ended) return false;
      const today = (g.letters ?? []).filter((l) => l.from === s.id && l.night === g.day + 1).length;
      if (today >= LETTERS_PER_DAY) return false;
      const letter: Letter = { id: uid(), from: s.id, to, name: signed ? s.name || 'Someone' : null, text: clean, night: g.day + 1, at: Date.now() };
      update((g) => {
        g.letters = [...(g.letters ?? []), letter].slice(-LETTERS_KEPT);
      });
      return true;
    },
    /**
     * A messenger pigeon to another player, saying who wants to speak to them and where they are. By day only, to
     * someone actually playing, and one every little while each. Returns why not, if it can't fly.
     */
    pigeon(playerId: string, to: string, where: string): string | null {
      const g = hostGame();
      const s = g.seats.find((x) => x.playerId === playerId);
      const target = seatOf(g, to);
      if (!s || !target || target.id === s.id || !target.playerId) return 'They aren’t here to find';
      if (g.phase !== 'day' || g.ended) return 'Pigeons only fly by day';
      const last = [...(g.pigeons ?? [])].reverse().find((p) => p.from === s.id);
      if (last && Date.now() - last.at < PIGEON_REST_MS) return 'Your pigeon needs a little rest first';
      const pigeon: Pigeon = { id: uid(), from: s.id, to: target.id, name: s.name || 'Someone', where: clip(where, 48) || 'around town', at: Date.now() };
      update((g) => {
        g.pigeons = [...(g.pigeons ?? []).filter((p) => Date.now() - p.at < PIGEON_SHOWN_MS * 5), pigeon].slice(-30);
      });
      return null;
    },
    /** Whatever a player did around town. Returns an item when it ends up in their paw. */
    town(playerId: string, action: TownAction): Item | null {
      const s = hostGame().seats.find((x) => x.playerId === playerId);
      if (!s) return null;
      if (action.k === 'star') {
        // Only at night, and the star is worn through the day that follows.
        update((g) => {
          const seat = g.seats.find((x) => x.id === s.id);
          if (seat && g.phase === 'night') seat.star = g.day;
        });
        return null;
      }
      return townAction(s.name || 'Someone', action);
    },
    ack(playerId: string, wakeId: string) {
      if (typeof wakeId !== 'string') return;
      update((g) => {
        const s = g.seats.find((x) => x.playerId === playerId);
        const a = s && g.awake[s.id];
        if (a && a.wakeId === wakeId) a.seen = true;
      });
    },
    reply(playerId: string, wakeId: string, raw: { seatIds?: unknown; roleIds?: unknown; answer?: unknown }) {
      // Straight from the network, and kept with the game: only short lists of ids, and a true or false.
      const ids = (v: unknown) => (Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string').slice(0, 20).map((x) => x.slice(0, 40)) : undefined);
      const r = {
        ...(ids(raw.seatIds) && { seatIds: ids(raw.seatIds) }),
        ...(ids(raw.roleIds) && { roleIds: ids(raw.roleIds) }),
        ...(typeof raw.answer === 'boolean' && { answer: raw.answer }),
      };
      if (typeof wakeId !== 'string') return;
      update((g) => {
        const s = g.seats.find((x) => x.playerId === playerId);
        if (!s || !g.wakes.some((w) => w.id === wakeId && w.to.includes(s.id))) return;
        g.replies = g.replies.filter((x) => !(x.wakeId === wakeId && x.seatId === s.id));
        g.replies.push({ wakeId, seatId: s.id, ...r, at: Date.now() });
        const a = g.awake[s.id];
        if (a && a.wakeId === wakeId) a.seen = true;
      });
    },
  },
};
