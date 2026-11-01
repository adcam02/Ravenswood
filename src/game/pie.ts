/**
 * The pie-eating contest, run by the Storyteller's browser (rules in pieRules.ts): it keeps who's at the table, the
 * stages' clocks, everyone's bites, and pays the winner. Players send their running count of bites a few times a
 * second; it's held to what anyone could honestly tap, and only goes into the game state on the tick, so a table of
 * eight hungry players doesn't flood everyone with updates.
 */
import { debugHooks, uid } from '../lib/util';
import { useHost } from '../state/host';
import type { GameState, PieAction, PieContest, Seat } from '../state/types';
import { presence } from './presence';
import { addTally, payGame } from './profiles';
import { PIE, PIE_BITES, PIE_ZONE, pieBlocked, pieOn } from './pieRules';

const update = (fn: (g: GameState) => void) => useHost.getState().update(fn);

/** In the tavern, by what they last said of where they are (a quiet phone isn't counted gone for a while). */
function atTable(seatId: string, now = Date.now()): boolean {
  const p = presence.others.get(seatId);
  return Boolean(p && p.zone === PIE_ZONE && now - p.at < 30000);
}

/** Bites sent in since the last tick, by seat. */
const fresh = new Map<string, number>();

const eater = (s: Seat) => ({ seat: s.id, name: s.name || 'Someone', bites: 0 });

/** It's over: the winner's prize and everyone else's ribbon. */
function finish(p: PieContest, winner: string | null, why: 'won' | 'time' | 'few' | 'off', now: number) {
  let prize = 0;
  if (winner && (why === 'won' || why === 'time')) {
    prize = payGame({ seat: winner }, 'pies', PIE.prize, 'for winning the pie-eating contest');
    addTally({ seat: winner }, 'piewins');
    for (const e of p.eaters) if (e.seat !== winner && e.bites > 0) addTally({ seat: e.seat }, 'ribbons');
  }
  p.result = { winner, prize, why };
  p.stage = 'over';
  p.until = now + PIE.overMs;
  fresh.clear();
}

export const pie = {
  /** A player calling a contest, joining or leaving one, or their bites. Anything out of place is ignored. */
  fromPlayer(playerId: string, raw: PieAction) {
    if (!raw || typeof raw !== 'object') return;
    const g = useHost.getState().g;
    const me = g.seats.find((s) => s.playerId === playerId);
    if (!me) return;
    const now = Date.now();
    const c = g.pie;
    switch (raw.k) {
      case 'start':
      case 'join': {
        if (!atTable(me.id, now) || pieBlocked(g, now)) return;
        update((g) => {
          const p = g.pie;
          if (!pieOn(p)) {
            if (raw.k !== 'start') return;
            g.pie = { id: uid(), stage: 'join', until: now + PIE.joinMs, by: me.id, eaters: [eater(me)] };
            return;
          }
          if (p!.stage !== 'join' || p!.eaters.length >= PIE.maxEaters || p!.eaters.some((e) => e.seat === me.id)) return;
          p!.eaters.push(eater(me));
        });
        break;
      }
      case 'leave':
        if (c?.stage !== 'join') return;
        update((g) => {
          const p = g.pie;
          if (p?.stage !== 'join') return;
          p.eaters = p.eaters.filter((e) => e.seat !== me.id);
          // The last one out puts the chairs back.
          if (!p.eaters.length) g.pie = null;
        });
        break;
      case 'bites': {
        if (c?.stage !== 'eat' || !c.began || typeof raw.n !== 'number' || !Number.isFinite(raw.n)) return;
        const e = c.eaters.find((x) => x.seat === me.id);
        if (!e) return;
        const most = Math.floor(((now - c.began) / 1000) * PIE.maxRate) + 3;
        fresh.set(me.id, Math.max(fresh.get(me.id) ?? e.bites, Math.min(Math.floor(raw.n), most, PIE_BITES)));
        break;
      }
    }
  },

  /** Keeps the contest moving: called several times a second by the Storyteller's browser. */
  tick() {
    const g = useHost.getState().g;
    const c = g.pie;
    if (!c) return;
    const now = Date.now();
    // Night falling, a nomination or an execution calls it off.
    if (pieOn(c) && pieBlocked(g, now)) return update((g) => void (g.pie && pieOn(g.pie) && finish(g.pie, null, 'off', now)));
    if (c.stage === 'eat') {
      // Everyone's bites since the last tick go up together, so the whole table sees the pies go down.
      const ate = c.eaters.some((e) => (fresh.get(e.seat) ?? e.bites) > e.bites);
      if (ate || now >= c.until) {
        update((g) => {
          const p = g.pie;
          if (p?.stage !== 'eat') return;
          for (const e of p.eaters) e.bites = Math.max(e.bites, fresh.get(e.seat) ?? 0);
          // The first to finish (the most bites, if several finished between ticks), or the most eaten at the bell.
          const best = [...p.eaters].sort((a, b) => b.bites - a.bites);
          if (best[0].bites >= PIE_BITES) finish(p, best[0].seat, 'won', now);
          else if (now >= p.until) finish(p, best[0].bites > 0 && best[0].bites > (best[1]?.bites ?? 0) ? best[0].seat : null, 'time', now);
        });
      }
      return;
    }
    if (now < c.until) {
      // Anyone who wanders off before it starts gives up their chair.
      if (c.stage === 'join' && c.eaters.some((e) => !atTable(e.seat, now)))
        update((g) => {
          if (g.pie?.stage !== 'join') return;
          g.pie.eaters = g.pie.eaters.filter((e) => atTable(e.seat, now));
          if (!g.pie.eaters.length) g.pie = null;
        });
      return;
    }
    update((g) => {
      const p = g.pie;
      if (!p || now < p.until) return;
      if (p.stage === 'join') {
        if (p.eaters.length < PIE.minEaters) finish(p, null, 'few', now);
        else {
          p.stage = 'count';
          p.until = now + PIE.countMs;
        }
      } else if (p.stage === 'count') {
        p.stage = 'eat';
        p.began = now;
        p.until = now + PIE.eatMs;
        fresh.clear();
      } else g.pie = null;
    });
  },
};

// (Tests can stretch the clock: `__pie.PIE.joinMs = 3000`.)
if (debugHooks()) Object.assign(window, { __pie: { PIE, pie, fresh } });
