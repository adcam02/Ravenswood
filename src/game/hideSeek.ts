/**
 * Town-wide hide and seek, run by the Storyteller's browser (the rules and timings are in hideRules.ts). Anyone can
 * start a round between games of Clocktower (during one only if the Storyteller allows it), everyone online is in
 * unless they sit it out, and the host decides everything: who seeks, who's close enough to be tagged (from where
 * everyone last said they were), the last minute's taunts, and the prizes. Everyone sees it through the game's state.
 */
import { debugHooks, uid } from '../lib/util';
import { animalsLocked, useHost } from '../state/host';
import type { GameState, HideAction, HidePlayer, HideRound, HideSeekState } from '../state/types';
import { creditDaily } from './profiles';
import { presence } from './presence';
import { HIDE, PROPS, hidersLeft, offLimits } from './hideRules';

const update = (fn: (g: GameState) => void) => useHost.getState().update(fn);

function hideOf(g: GameState): HideSeekState {
  g.hide ??= { round: null, out: [] };
  g.hide.out ??= [];
  return g.hide;
}

/** Where someone is, if we've heard lately. */
function whereIs(seat: string, now = Date.now()) {
  const p = presence.others.get(seat);
  return p && now - p.at < HIDE.goneMs ? p : null;
}

/** A game of Clocktower is on, and the Storyteller hasn't said hide and seek can go on during it. */
const busy = (g: GameState) => animalsLocked(g) && !g.hide?.allowed;
const live = (r: HideRound | null | undefined): r is HideRound => Boolean(r && r.stage !== 'over');

/** When each hider still out there squeaks next, in the last minute (kept here: it changes too often for the game). */
const nextForced = new Map<string, number>();
/** Each seeker's last try at a tag. */
const lastTag = new Map<string, number>();

function shuffle<T>(xs: T[]): T[] {
  const a = [...xs];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Who plays this round: everyone with an animal who's around, less anyone sitting it out. */
function gather(g: GameState, h: HideSeekState, now: number): HidePlayer[] {
  return g.seats
    .filter((s) => s.playerId && s.look && !h.out.includes(s.id) && whereIs(s.id, now))
    .map((s) => ({ seat: s.id, name: s.name || 'Someone', role: 'hider' as const, finds: 0 }));
}

/** The round's over: who survived, who was found last, who found the most, and their prizes. */
function finish(h: HideSeekState, r: HideRound, why: 'time' | 'found' | 'off' | 'few', now: number) {
  const survivors = why === 'time' ? r.players.filter((p) => p.role === 'hider').map((p) => p.seat) : [];
  const found = r.players.filter((p) => !p.first && p.foundAt !== undefined).sort((a, b) => (b.foundAt ?? 0) - (a.foundAt ?? 0));
  const last = why === 'found' ? (found[0]?.seat ?? null) : null;
  const best = [...r.players].filter((p) => p.finds > 0).sort((a, b) => b.finds - a.finds || Number(!a.first) - Number(!b.first))[0] ?? null;
  const prizes: Record<string, number> = {};
  const pay = (seat: string, amount: number, why: string) => {
    const paid = creditDaily({ seat }, amount, why);
    if (paid) prizes[seat] = (prizes[seat] ?? 0) + paid;
  };
  if (why === 'time' || why === 'found') {
    for (const seat of survivors) pay(seat, HIDE.survivePrize, 'for never being found');
    if (last) pay(last, HIDE.lastPrize, 'for hiding longest');
    if (best) pay(best.seat, HIDE.bestPrize, 'for the best seeking');
  }
  r.result = { why, survivors, last, best: best?.seat ?? null, bestFinds: best?.finds ?? 0, prizes };
  r.stage = 'over';
  r.until = now + HIDE.overMs;
  h.lastSeekers = r.players.filter((p) => p.first).map((p) => p.seat);
  nextForced.clear();
  lastTag.clear();
}

/** Starts a round (gathering first), if one can start. `by` is a name for the banner. */
function begin(by: string): boolean {
  const g = useHost.getState().g;
  if (live(g.hide?.round) || busy(g)) return false;
  update((g) => {
    const h = hideOf(g);
    h.round = { id: uid(), stage: 'gather', until: Date.now() + HIDE.gatherMs, by: by.slice(0, 24), players: [], feed: [], taunts: [] };
  });
  return true;
}

/** A hider is found: by a seeker (a seat), or by nobody (they went home, out of bounds). */
function found(r: HideRound, who: HidePlayer, by: HidePlayer | null, now: number) {
  who.role = 'seeker';
  who.foundAt = now;
  who.foundBy = by?.seat ?? null;
  who.prop = null;
  if (by) by.finds += 1;
  r.feed = [...r.feed, { by: by?.seat ?? null, who: who.seat, at: now }].slice(-12);
  nextForced.delete(who.seat);
}

function squeak(r: HideRound, p: HidePlayer, now: number, forced: boolean) {
  const at = p.prop ?? whereIs(p.seat, now);
  if (!at) return;
  r.taunts = [...r.taunts.filter((t) => now - t.at < 10000), { id: uid(), seat: p.seat, at: now, zone: at.zone, x: at.x, z: at.z, forced: forced || undefined }].slice(-12);
}

export const hideSeek = {
  /** A player's start, opt-out, tag, taunt or prop. Anything that doesn't make sense right now is ignored. */
  fromPlayer(playerId: string, raw: HideAction) {
    if (!raw || typeof raw !== 'object') return;
    const g = useHost.getState().g;
    const me = g.seats.find((s) => s.playerId === playerId);
    if (!me) return;
    const now = Date.now();
    const r = g.hide?.round;
    switch (raw.k) {
      case 'start':
        if (me.look) begin(me.name || 'Someone');
        break;
      case 'out': {
        const out = Boolean(raw.out);
        update((g) => {
          const h = hideOf(g);
          h.out = out ? [...new Set([...h.out, me.id])] : h.out.filter((s) => s !== me.id);
          // Sitting out mid-round leaves it (a seeker too: the others carry on).
          const r = h.round;
          if (out && live(r) && r.stage !== 'gather' && r.players.some((p) => p.seat === me.id)) {
            r.players = r.players.filter((p) => p.seat !== me.id);
            checkOver(h, r, now);
          }
        });
        break;
      }
      case 'tag': {
        if (r?.stage !== 'seeking') return;
        const mine = r.players.find((p) => p.seat === me.id && p.role === 'seeker');
        const at = whereIs(me.id, now);
        if (!mine || !at || now - (lastTag.get(me.id) ?? 0) < HIDE.tagGapMs) return;
        lastTag.set(me.id, now);
        // The nearest hider in reach, where they are (or where their prop stands).
        let near: { seat: string; d: number } | null = null;
        for (const p of r.players) {
          if (p.role !== 'hider') continue;
          const there = p.prop ?? whereIs(p.seat, now);
          if (!there || there.zone !== at.zone) continue;
          const d = Math.hypot(there.x - at.x, there.z - at.z);
          if (d <= HIDE.tagR && (!near || d < near.d)) near = { seat: p.seat, d };
        }
        if (!near) return;
        const hit = near.seat;
        update((g) => {
          const h = hideOf(g);
          const r = h.round;
          if (r?.stage !== 'seeking') return;
          const who = r.players.find((p) => p.seat === hit && p.role === 'hider');
          const by = r.players.find((p) => p.seat === me.id);
          if (!who || !by) return;
          found(r, who, by, now);
          checkOver(h, r, now);
        });
        break;
      }
      case 'taunt': {
        if (r?.stage !== 'seeking') return;
        const mine = r.players.find((p) => p.seat === me.id && p.role === 'hider');
        if (!mine || now - (mine.tauntAt ?? 0) < HIDE.tauntGapMs) return;
        update((g) => {
          const r = hideOf(g).round;
          const p = r?.players.find((x) => x.seat === me.id && x.role === 'hider');
          if (!r || !p) return;
          p.tauntAt = now;
          squeak(r, p, now, false);
        });
        // A squeak of your own puts off the next one you'd be made to do.
        if (nextForced.has(me.id)) nextForced.set(me.id, Math.max(nextForced.get(me.id)!, now + HIDE.forcedGapMs));
        break;
      }
      case 'prop': {
        if (r?.stage !== 'hiding' && r?.stage !== 'seeking') return;
        const kind = PROPS.find((p) => p.kind === raw.kind)?.kind;
        const at = whereIs(me.id, now);
        if (!kind || !at || offLimits(at.zone)) return;
        update((g) => {
          const p = hideOf(g).round?.players.find((x) => x.seat === me.id && x.role === 'hider');
          if (!p || p.prop) return;
          p.prop = { kind, zone: at.zone, x: at.x, z: at.z, ry: at.ry };
        });
        break;
      }
    }
  },

  /** Storyteller: start a round. */
  start: () => begin('the Storyteller'),

  /** Storyteller: call the round off (no prizes). */
  stop() {
    update((g) => {
      const h = hideOf(g);
      if (live(h.round)) finish(h, h.round, 'off', Date.now());
      else h.round = null;
    });
  },

  /** Storyteller: let hide and seek go on while a game of Clocktower is being played (or not). */
  allow(on: boolean) {
    update((g) => void (hideOf(g).allowed = on));
  },

  /** Keeps the round moving: called a couple of times a second by the Storyteller's browser. */
  tick() {
    const g = useHost.getState().g;
    const r = g.hide?.round;
    if (!r) return;
    const now = Date.now();
    if (r.stage === 'over') {
      if (now >= r.until) update((g) => void (hideOf(g).round = null));
      return;
    }
    // A game of Clocktower has begun (or the round was left over from before a reload): it's off.
    if (busy(g) || now > r.until + 30000) return update((g) => live(g.hide?.round) && finish(hideOf(g), g.hide!.round!, 'off', now));
    if (r.stage === 'gather') {
      if (now < r.until) return;
      return update((g) => {
        const h = hideOf(g);
        const r = h.round!;
        const players = gather(g, h, now);
        r.players = players;
        if (players.length < 2) {
          finish(h, r, 'few', now);
          r.until = now + 6000;
          return;
        }
        const n = players.length >= HIDE.twoSeekersFrom ? 2 : 1;
        // Not whoever sought first last time, if there's anyone else.
        const fresh = shuffle(players.filter((p) => !h.lastSeekers?.includes(p.seat)));
        const pick = [...fresh, ...shuffle(players.filter((p) => h.lastSeekers?.includes(p.seat)))].slice(0, n);
        for (const p of pick) {
          p.role = 'seeker';
          p.first = true;
        }
        r.stage = 'hiding';
        r.until = now + HIDE.hideMs;
      });
    }
    // Anyone gone quiet for long has left; a hider gone home is out of bounds (found by nobody).
    const gone = r.players.filter((p) => !whereIs(p.seat, now)).map((p) => p.seat);
    const home = r.stage === 'seeking' ? r.players.filter((p) => p.role === 'hider' && !p.prop && offLimits(whereIs(p.seat, now)?.zone ?? '')).map((p) => p.seat) : [];
    if (gone.length || home.length) {
      update((g) => {
        const h = hideOf(g);
        const r = h.round;
        if (!live(r)) return;
        r.players = r.players.filter((p) => !gone.includes(p.seat));
        for (const p of r.players) if (home.includes(p.seat) && p.role === 'hider') found(r, p, null, now);
        checkOver(h, r, now);
      });
      return;
    }
    if (r.stage === 'hiding' && now >= r.until) {
      return update((g) => {
        const r = hideOf(g).round;
        if (r?.stage !== 'hiding') return;
        r.stage = 'seeking';
        r.seekAt = now;
        r.until = now + HIDE.seekMs;
      });
    }
    if (r.stage !== 'seeking') return;
    if (now >= r.until) return update((g) => live(g.hide?.round) && finish(hideOf(g), g.hide!.round!, 'time', now));
    // The last minute: everyone still hidden squeaks now and then, a little after each other.
    if (r.until - now <= HIDE.forcedFromMs) {
      const hiders = r.players.filter((p) => p.role === 'hider');
      hiders.forEach((p, i) => !nextForced.has(p.seat) && nextForced.set(p.seat, now + i * 1500));
      const due = hiders.filter((p) => now >= (nextForced.get(p.seat) ?? Infinity));
      if (!due.length) return;
      for (const p of due) nextForced.set(p.seat, now + HIDE.forcedGapMs);
      update((g) => {
        const r = hideOf(g).round;
        if (r?.stage !== 'seeking') return;
        for (const p of r.players) if (due.some((d) => d.seat === p.seat) && p.role === 'hider') squeak(r, p, now, true);
      });
    }
  },
};

/** Ends the round if there's nobody left to find, or nobody left to look. */
function checkOver(h: HideSeekState, r: HideRound, now: number) {
  if (r.stage === 'gather' || r.stage === 'over') return;
  if (!r.players.some((p) => p.role === 'seeker') || r.players.length < 2) finish(h, r, 'off', now);
  else if (!hidersLeft(r)) finish(h, r, 'found', now);
}

// (Tests can shorten the clock: `__hide.HIDE.hideMs = 5000`.)
if (debugHooks()) Object.assign(window, { __hide: { HIDE, hideSeek } });
