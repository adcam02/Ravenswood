/**
 * The pet pit, run by the Storyteller's browser: players in the tavern's cellar challenge each other, the fight's
 * rounds are timed and resolved here (so everyone watching sees the same fight), and the house pays the winner.
 * The rules themselves are in pitRules.ts.
 */
import { debugHooks, uid } from '../lib/util';
import { useHost } from '../state/host';
import type { GameState, PitAction, PitFight, PitMove, PitSide, PitState, Seat } from '../state/types';
import { PETS, type PetId } from '../world/types';
import { addTally, credit, nameKey, topTally } from './profiles';
import { presence } from './presence';
import { MOVES, PIT, allowed, outcome, randomMove, resolveRound } from './pitRules';

/** The zone the pit is in. */
export const PIT_ZONE = 'cellar';
/** The running count each player's wins are kept under. */
const WINS = 'pitwins';
const BOARD_SIZE = 6;

const update = (fn: (g: GameState) => void) => useHost.getState().update(fn);
const today = () => new Date().toLocaleDateString('en-CA');

function pitOf(g: GameState): PitState {
  g.pit ??= { fight: null, challenges: [], board: board() };
  return g.pit;
}

const board = () => topTally(WINS, BOARD_SIZE).map(({ name, count }) => ({ name, wins: count }));

/**
 * Down in the cellar, by what they last said of where they are. A busy phone can go quiet for a few seconds without
 * having gone anywhere (and a dropped connection takes them out of `presence` altogether), so only a long silence counts.
 */
function inPit(seatId: string, now = Date.now()): boolean {
  const p = presence.others.get(seatId);
  return Boolean(p && p.zone === PIT_ZONE && now - p.at < 30000);
}

const petOf = (s: Seat | undefined): PetId | null => (s?.look?.pet && PETS.some((p) => p.id === s.look!.pet) ? s.look.pet : null);
const fighting = (pit: PitState, seatId: string) => Boolean(pit.fight && pit.fight.stage !== 'over' && pit.fight.sides.some((s) => s.seat === seatId));

function side(s: Seat, pet: PetId): PitSide {
  return { seat: s.id, name: s.name || 'Someone', pet, hp: PIT.hearts, charge: 0, picked: false, move: null, last: null };
}

/** The round's picks are in (or time's up): show them, and what they did. */
function resolve(f: PitFight, now: number) {
  const random: [boolean, boolean] = [!f.sides[0].move, !f.sides[1].move];
  const moves = f.sides.map((s) => s.move ?? randomMove(s.last)) as [PitMove, PitMove];
  const r = resolveRound(f.round, [f.sides[0], f.sides[1]], moves, random);
  f.sides.forEach((s, i) => {
    s.hp = r.hp[i];
    s.charge = r.charge[i];
    s.last = moves[i];
    s.move = null;
    s.picked = false;
  });
  f.last = r;
  f.stage = 'reveal';
  f.until = now + PIT.revealMs;
}

/** Pays a prize, unless they've had all their prizes today. Returns what was paid. */
function pay(pit: PitState, s: PitSide, amount: number, why: string): number {
  const key = nameKey(s.name);
  const day = today();
  const had = pit.paid?.[key]?.day === day ? pit.paid[key].wins : 0;
  if (had >= PIT.dailyWins) return 0;
  pit.paid = { ...Object.fromEntries(Object.entries(pit.paid ?? {}).filter(([, v]) => v.day === day)), [key]: { day, wins: had + 1 } };
  return credit({ seat: s.seat }, amount, why) ? amount : 0;
}

/** The fight is over: who won, the prize, and the board. */
function finish(pit: PitState, f: PitFight, winner: 0 | 1 | null, why: 'ko' | 'draw' | 'left' | 'off', now: number) {
  let prize = 0;
  // A walk-out before a blow was struck wins nothing.
  if (winner !== null && (why === 'ko' || f.last)) {
    prize = pay(pit, f.sides[winner], PIT.prize, 'for winning a pet fight');
    addTally({ seat: f.sides[winner].seat }, WINS);
  } else if (why === 'draw') for (const s of f.sides) prize = pay(pit, s, PIT.drawPrize, 'for a draw in the pet pit');
  f.result = { winner, why, prize };
  f.stage = 'over';
  f.until = now + PIT.overMs;
  pit.board = board();
}

/** Since when each fighter has been out of the cellar (kept here, not in the game: it changes too often). */
const away = new Map<string, number>();

export const pit = {
  /** A player's challenge, answer or move. Anything that doesn't make sense right now is ignored. */
  fromPlayer(playerId: string, raw: PitAction) {
    if (!raw || typeof raw !== 'object') return;
    const g = useHost.getState().g;
    const me = g.seats.find((s) => s.playerId === playerId);
    if (!me) return;
    const now = Date.now();
    switch (raw.k) {
      case 'challenge': {
        const them = g.seats.find((s) => s.id === raw.to);
        if (!them?.playerId || them.id === me.id || !petOf(me) || !petOf(them) || !inPit(me.id) || !inPit(them.id)) return;
        update((g) => {
          const p = pitOf(g);
          if (fighting(p, me.id) || fighting(p, them.id)) return;
          // One challenge out at a time: a new one replaces the last.
          p.challenges = [...p.challenges.filter((c) => c.from !== me.id), { id: uid(), from: me.id, to: them.id, at: now }].slice(-20);
        });
        break;
      }
      case 'withdraw':
        update((g) => {
          const p = pitOf(g);
          p.challenges = p.challenges.filter((c) => !(c.id === raw.id && c.from === me.id));
        });
        break;
      case 'answer': {
        const c = g.pit?.challenges.find((x) => x.id === raw.id && x.to === me.id);
        if (!c) return;
        if (!raw.yes) {
          update((g) => {
            const p = pitOf(g);
            p.challenges = p.challenges.filter((x) => x.id !== c.id);
          });
          return;
        }
        const them = g.seats.find((s) => s.id === c.from);
        const a = petOf(them);
        const b = petOf(me);
        // The ring takes one fight at a time.
        if (!them || !a || !b || !inPit(them.id) || !inPit(me.id) || (g.pit?.fight && g.pit.fight.stage !== 'over')) return;
        update((g) => {
          const p = pitOf(g);
          p.challenges = p.challenges.filter((x) => ![x.from, x.to].some((id) => id === me.id || id === them.id));
          p.fight = { id: uid(), sides: [side(them, a), side(me, b)], stage: 'intro', round: 0, until: now + PIT.introMs, last: null, at: now };
        });
        away.clear();
        break;
      }
      case 'move': {
        const move = raw.move;
        if (!MOVES.includes(move)) return;
        update((g) => {
          const f = g.pit?.fight;
          if (!f || f.stage !== 'pick') return;
          const s = f.sides.find((x) => x.seat === me.id);
          if (!s || s.picked || !allowed(move, s.last)) return;
          s.move = move;
          s.picked = true;
          if (f.sides.every((x) => x.picked)) resolve(f, Date.now());
        });
        break;
      }
    }
  },

  /** Keeps the pit moving: called often (several times a second) by the Storyteller's browser. */
  tick() {
    const g = useHost.getState().g;
    const p = g.pit;
    // (The board goes up as soon as the room opens.)
    if (!p) return update((g) => void pitOf(g));
    const now = Date.now();
    // Challenges go when they're old, or either side has left the cellar.
    const stale = p.challenges.some((c) => now - c.at > PIT.challengeMs || !inPit(c.from, now) || !inPit(c.to, now));
    if (stale) update((g) => void (pitOf(g).challenges = pitOf(g).challenges.filter((c) => now - c.at <= PIT.challengeMs && inPit(c.from, now) && inPit(c.to, now))));
    const f = p.fight;
    if (!f) return;
    if (f.stage !== 'over') {
      // Night sends everyone home: the fight's off. Otherwise, a fighter out of the cellar for long has walked out.
      const night = g.phase === 'night' && (g.revealed || g.day > 0);
      for (const s of f.sides) {
        if (inPit(s.seat, now)) away.delete(s.seat);
        else if (!away.has(s.seat)) away.set(s.seat, now);
      }
      const gone = f.sides.map((s) => now - (away.get(s.seat) ?? now) >= PIT.leaveMs);
      if (night || gone[0] || gone[1]) {
        update((g) => {
          const p = pitOf(g);
          const x = p.fight;
          if (!x || x.stage === 'over') return;
          if (night || (gone[0] && gone[1])) finish(p, x, null, 'off', now);
          else finish(p, x, gone[0] ? 1 : 0, 'left', now);
        });
        return;
      }
    }
    if (now < f.until) return;
    update((g) => {
      const p = pitOf(g);
      const x = p.fight;
      if (!x || now < x.until) return;
      if (x.stage === 'intro') {
        x.stage = 'pick';
        x.round = 1;
        x.until = now + PIT.pickMs;
      } else if (x.stage === 'pick') resolve(x, now);
      else if (x.stage === 'reveal') {
        const won = outcome([x.sides[0].hp, x.sides[1].hp]);
        if (won === null) {
          x.stage = 'pick';
          x.round += 1;
          x.until = now + PIT.pickMs;
        } else finish(p, x, won === 'draw' ? null : won, won === 'draw' ? 'draw' : 'ko', now);
      } else p.fight = null;
    });
  },
};

// (Tests can stretch the clock: `__pit.PIT.pickMs = 60000`.)
if (debugHooks()) Object.assign(window, { __pit: { PIT, pit } });
