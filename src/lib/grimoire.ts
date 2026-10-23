import { getRole } from '../data';
import { isTraveller, seatAlignment } from '../state/host';
import type { GameState, Seat } from '../state/types';

/**
 * Things the Storyteller would read off the grimoire during the night: who died when, who carries which reminder,
 * which way round the table something is. All worked out from the game as it stands, changing nothing.
 */

/** Seats with a reminder from this character (with this text, if given). */
export const withReminder = (g: GameState, roleId: string, text?: string): Seat[] =>
  g.seats.filter((s) => s.reminders.some((r) => r.roleId === roleId && (text === undefined || r.text === text)));

/** Died during the day just gone or so far tonight (at night N, "today" was day N - 1). */
export function diedRecently(g: GameState, seatId: string, tonightToo = true): boolean {
  return g.deaths.some(
    (d) => d.seatId === seatId && ((d.day === g.day - 1 && d.phase === 'day') || (tonightToo && d.day === g.day && d.phase === 'night')),
  );
}

/** Whoever was executed during the day just gone, if anyone died to it. */
export function executedToday(g: GameState): Seat | null {
  const d = [...g.deaths].reverse().find((x) => x.how === 'executed' && x.day === g.day - 1 && x.phase === 'day');
  return (d && g.seats.find((s) => s.id === d.seatId)) ?? null;
}

/** Players in the game (not travellers) whose real character is on this team. */
export const onTeam = (g: GameState, team: string): Seat[] => g.seats.filter((s) => !isTraveller(s.roleId) && getRole(s.roleId)?.team === team);

/**
 * Which way the closest evil player is from this seat, round the table (seats go clockwise). If they're as close
 * both ways, either is true, so it's picked at random.
 */
export function closestEvil(g: GameState, seatId: string): 'clockwise' | 'anticlockwise' | null {
  const n = g.seats.length;
  const i = g.seats.findIndex((s) => s.id === seatId);
  if (i < 0) return null;
  const evil = (k: number) => seatAlignment(g.seats[((k % n) + n) % n]) === 'evil';
  for (let d = 1; d < n; d++) {
    const cw = evil(i + d);
    const acw = evil(i - d);
    if (cw && acw) return Math.random() < 0.5 ? 'clockwise' : 'anticlockwise';
    if (cw) return 'clockwise';
    if (acw) return 'anticlockwise';
  }
  return null;
}

/** The closest Townsfolk each way round from this seat (alive or dead), as the No Dashii's neighbours are. */
export function townsfolkNeighbours(g: GameState, seatId: string): Seat[] {
  const n = g.seats.length;
  const i = g.seats.findIndex((s) => s.id === seatId);
  if (i < 0) return [];
  const out: Seat[] = [];
  for (const step of [1, -1]) {
    for (let d = 1; d < n; d++) {
      const s = g.seats[(((i + step * d) % n) + n) % n];
      if (getRole(s.roleId)?.team === 'townsfolk') {
        if (!out.includes(s)) out.push(s);
        break;
      }
    }
  }
  return out;
}
