/**
 * The golden donkey, run by the Storyteller's browser. Each day, a little while after it begins, he's hidden at one
 * of the hiding places (world/donkey.ts DONKEY_SPOTS, a different one from yesterday's, indoors only now and then).
 * He's worth $1 to start with and more the longer he goes unfound, up to $50 after five minutes. The first player to
 * reach him and press E gets the gold (checked here by where they last said they were), and he's gone until the
 * next day. Never by night.
 */
import { useHost } from '../state/host';
import type { DonkeyState, GameState } from '../state/types';
import { DONKEY_REACH, DONKEY_SPOTS, donkeyWorth } from '../world/donkey';
import { presence } from './presence';
import { credit } from './profiles';

/** He comes out somewhere between these long after the day begins (ms). */
const HIDE_AFTER: [number, number] = [20_000, 90_000];
/** One time in this many he's somewhere indoors. */
const INDOORS = 4;

const update = (fn: (g: GameState) => void) => useHost.getState().update(fn);

/** Somewhere to hide today: not where he was yesterday, and indoors now and then. */
function pickSpot(last: number | undefined): number {
  const indoors = Math.random() < 1 / INDOORS;
  const choices = DONKEY_SPOTS.map((s, i) => ({ s, i })).filter(({ s, i }) => i !== last && (s.zone === 'town') !== indoors);
  return choices[Math.floor(Math.random() * choices.length)].i;
}

/** About once a second: hide today's donkey once the day is under way. */
export function tickDonkey() {
  const g = useHost.getState().g;
  if (g.phase !== 'day') return;
  if (g.donkey?.day === g.day) {
    // Out he comes.
    if (!g.donkey.out && Date.now() >= g.donkey.at) update((g) => void (g.donkey && (g.donkey.out = true)));
    return;
  }
  const wait = HIDE_AFTER[0] + Math.random() * (HIDE_AFTER[1] - HIDE_AFTER[0]);
  const donkey: DonkeyState = { day: g.day, spot: pickSpot(g.donkey?.spot), at: Date.now() + wait, found: null };
  update((g) => {
    g.donkey = donkey;
  });
}

/** A player says they've caught him. Returns what he paid them, or why not. */
export function donkeyFromPlayer(playerId: string): { ok: true; amount: number } | { ok: false; why: string } {
  const g = useHost.getState().g;
  const seat = g.seats.find((s) => s.playerId === playerId);
  const d = g.donkey;
  const now = Date.now();
  if (!seat) return { ok: false, why: 'Take a seat first' };
  if (!d || g.phase !== 'day' || d.day !== g.day || !d.out) return { ok: false, why: 'No golden donkey here' };
  if (d.found) return { ok: false, why: `${d.found.name} got there first!` };
  const spot = DONKEY_SPOTS[d.spot];
  const p = presence.others.get(seat.id);
  // (A little further than the prompt shows, for the time their last word on where they are took to arrive.)
  if (!spot || !p || now - p.at > 10_000 || p.zone !== spot.zone || Math.hypot(p.x - spot.x, p.z - spot.z) > DONKEY_REACH + 0.8) {
    return { ok: false, why: 'Get a little closer' };
  }
  const amount = donkeyWorth(now - d.at);
  const name = seat.name || 'Someone';
  update((g) => {
    if (g.donkey && !g.donkey.found) g.donkey.found = { seat: seat.id, name, amount, at: now };
  });
  credit({ seat: seat.id }, amount, 'for finding the golden donkey');
  return { ok: true, amount };
}
