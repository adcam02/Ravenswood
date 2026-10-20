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
import {
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
  GameState,
  GrimoireSnapshot,
  Nomination,
  Phase,
  PrivateState,
  PublicState,
  Seat,
  TownAction,
  WakeMessage,
  WakePanel,
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
  g.town ??= emptyTown();
  g.town.records ??= {};
  g.execution ??= null;
  g.weather ??= 'clear';
  g.dayTimer ??= null;
  for (const s of g.seats) s.look ??= null;
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
    seats: g.seats.map((s, i) => ({ id: s.id, name: s.name || `Seat ${i + 1}`, roleId: s.roleId, dead: s.dead, reminders: s.reminders.map((r) => r.text) })),
    bluffs: g.bluffs.filter(Boolean) as string[],
  };
}

export function nightLabel(g: { phase: Phase; day: number }): string {
  if (g.day === 0 && g.phase === 'day') return 'Before the game';
  return `${g.phase === 'night' ? 'Night' : 'Day'} ${g.day}`;
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
        alignment: g.grimoireRevealed ? seatAlignment(s) : null,
        look: s.look,
        star: s.star ?? null,
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
    town: g.town,
  };
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
  };
}

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
const flush = () => {
  if (!saveTimer) return;
  clearTimeout(saveTimer);
  saveTimer = null;
  saveJSON(KEY, useHost.getState().g);
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
      if (s.look) s.look = fixLook(s.name, s.look);
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
  swapRoles(a: string, b: string) {
    update((g) => {
      const x = seatOf(g, a);
      const y = seatOf(g, b);
      if (!x || !y) return;
      [x.roleId, y.roleId] = [y.roleId, x.roleId];
      [x.shownRoleId, y.shownRoleId] = [y.shownRoleId, x.shownRoleId];
      [x.alignment, y.alignment] = [y.alignment, x.alignment];
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
      if (s.dead && g.phase === 'day' && g.marked?.seatId === id) {
        g.execution = { id: uid(), seatId: id, at: Date.now() };
        g.marked = null;
      }
    });
  },
  /** Hangs a player at the gallows in front of the town, whoever is on the block. */
  execute(id: string) {
    update((g) => {
      const s = seatOf(g, id);
      if (!s || s.dead) return;
      s.dead = true;
      g.execution = { id: uid(), seatId: id, at: Date.now() };
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
  /** Rings the bell on every player's screen until they say they're back. */
  callTownHall() {
    update((g) => {
      if (g.townHall) {
        g.townHall.ring += 1;
        g.townHall.at = Date.now();
      } else g.townHall = { id: uid(), at: Date.now(), ring: 0, back: [] };
    });
  },
  endTownHall() {
    update((g) => void (g.townHall = null));
  },
  /** A player has reached the square while the bell is ringing. */
  arrived(seatId: string) {
    update((g) => {
      if (g.townHall && !g.townHall.back.includes(seatId)) g.townHall.back.push(seatId);
    });
  },
  revealGrimoire(on: boolean) {
    update((g) => void (g.grimoireRevealed = on));
  },

  // things players ask for
  fromPlayer: {
    /** A player arriving with their name and animal: back to their own seat, or the first empty one, or a new one. */
    join(playerId: string, name: string, look: Partial<Look>) {
      const clean = name.trim().slice(0, 24);
      if (!clean) return;
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
        seat.look = fixLook(clean, look);
      });
    },
    leave(playerId: string) {
      update((g) => {
        for (const s of g.seats) if (s.playerId === playerId) s.playerId = null;
      });
    },
    rename(playerId: string, name: string) {
      update((g) => {
        const s = g.seats.find((x) => x.playerId === playerId);
        if (!s) return;
        if (name.trim()) s.name = name.trim().slice(0, 24);
        if (s.look) s.look = fixLook(s.name, s.look);
      });
    },
    vote(playerId: string, up: boolean) {
      const s = hostGame().seats.find((x) => x.playerId === playerId);
      if (s) st.setVote(s.id, up);
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
      update((g) => {
        const s = g.seats.find((x) => x.playerId === playerId);
        const a = s && g.awake[s.id];
        if (a && a.wakeId === wakeId) a.seen = true;
      });
    },
    reply(playerId: string, wakeId: string, r: { seatIds?: string[]; roleIds?: string[]; answer?: boolean }) {
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
