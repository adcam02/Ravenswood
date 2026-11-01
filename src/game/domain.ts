/**
 * Domains, run by the Storyteller's browser. Whoever has bought the Domain Expansioner and is wearing it can open one
 * where they stand, out in town by day, once a day: a portable confession booth under a starry dome (see
 * world/types.ts DomainState and boothAt, and voice/earshot.ts). The first other player to step in is its guest;
 * the two hear only each other, nobody outside hears them, and their names are hidden like the booths'. Anyone
 * else is kept out (each page pushes its own player back out, see the engine). It closes when its owner steps out,
 * closes it, takes the hat off, or after three minutes, and when a meeting, a vote, an execution or the night begins.
 */
import { uid } from '../lib/util';
import { useHost } from '../state/host';
import type { GameState } from '../state/types';
import { BOOTHS, DOMAIN_HAT, DOMAIN_R, owns, type DomainState } from '../world/types';
import { MEETING_CENTRE, MEETING_R } from '../world/town/layout';
import { presence } from './presence';
import { profileOf } from './profiles';

/** How long a Domain stays open, at most. */
export const DOMAIN_MS = 3 * 60_000;
/** An execution's vote on how and its show are over by this long after it began. */
const EXECUTION_MS = 3 * 60_000;
/** A player's last word on where they are older than this, and they aren't anywhere as far as a Domain cares. */
const STALE_MS = 15_000;

const update = (fn: (g: GameState) => void) => useHost.getState().update(fn);

/** Why nobody can open a Domain just now (night, a meeting, a vote, an execution), or null. Players see it too. */
export function domainBlock(g: { phase: string; townHall: unknown; nomination: { status: string } | null; execution: { at: number } | null }): string | null {
  if (g.phase !== 'day') return 'Domains can only be opened by day';
  if (g.townHall) return 'Not during a town meeting';
  if (g.nomination && g.nomination.status !== 'done') return 'Not while a nomination is on';
  // (The execution stays on the day's record afterwards: it's the vote on how and the show itself that count.)
  if (g.execution && Date.now() - g.execution.at < EXECUTION_MS) return 'Not during an execution';
  return null;
}

/** Whether a seat could open a Domain at all: wearing the hat they bought. */
function wearsIt(g: GameState, seatId: string): boolean {
  const seat = g.seats.find((s) => s.id === seatId);
  return Boolean(seat?.look?.hat === DOMAIN_HAT && owns(profileOf({ seat: seatId }) ?? {}, `hat:${DOMAIN_HAT}`));
}

/** A player asks to open a Domain where they stand (or to close theirs). Returns why not, or null. */
export function domainFromPlayer(playerId: string, open: boolean): string | null {
  const g = useHost.getState().g;
  const seat = g.seats.find((s) => s.playerId === playerId);
  if (!seat) return 'Take a seat first';
  const mine = (g.domains ?? []).find((d) => d.owner === seat.id);
  if (!open) {
    if (mine) closeDomain(mine.id);
    return null;
  }
  if (mine) return 'Your Domain is already open';
  if (!wearsIt(g, seat.id)) return 'Only whoever wears the Domain Expansioner can open a Domain';
  const blocked = domainBlock(g);
  if (blocked) return blocked;
  if ((g.domainDay ?? {})[seat.id] === g.day) return 'You’ve opened your Domain today already. Tomorrow!';
  const p = presence.others.get(seat.id);
  if (!p || Date.now() - p.at > STALE_MS) return 'Where are you? Try again in a moment';
  if (p.zone !== 'town') return 'Domains can only be opened outdoors, out in town';
  // Clear of the meeting ring, the booths and anyone else's Domain.
  if (Math.hypot(p.x - MEETING_CENTRE.x, p.z - MEETING_CENTRE.z) < MEETING_R * 0.45) return 'Not in the middle of the square';
  if (BOOTHS.some((b) => b.zone === 'town' && Math.hypot(b.x - p.x, b.z - p.z) < DOMAIN_R + 2)) return 'Too close to a confession booth';
  if ((g.domains ?? []).some((d) => Math.hypot(d.x - p.x, d.z - p.z) < DOMAIN_R * 2 + 0.5)) return 'Too close to another Domain';
  // Its middle a little to the owner's right, so they stand on one side of the grille and their guest on the other.
  const now = Date.now();
  const side = DOMAIN_R * 0.42;
  const d: DomainState = { id: uid(), owner: seat.id, guest: null, x: p.x + Math.cos(p.ry) * side * -1, z: p.z + Math.sin(p.ry) * side, ry: p.ry, at: now, until: now + DOMAIN_MS };
  update((g) => {
    g.domains = [...(g.domains ?? []), d];
    g.domainDay = { ...(g.domainDay ?? {}), [seat.id]: g.day };
  });
  return null;
}

export function closeDomain(id: string) {
  update((g) => {
    g.domains = (g.domains ?? []).filter((d) => d.id !== id);
  });
}

/** Inside a Domain, by where they last said they are. */
function inside(d: DomainState, seatId: string, margin = 0): boolean {
  const p = presence.others.get(seatId);
  return Boolean(p && Date.now() - p.at < STALE_MS && p.zone === 'town' && Math.hypot(p.x - d.x, p.z - d.z) < DOMAIN_R + margin);
}

/**
 * About once a second: Domains whose time is up, whose owner has gone (or taken the hat off), or that the day's
 * business has overtaken, close; a guest who has stepped out makes room for another; the first to step into a Domain
 * without a guest becomes its guest.
 */
export function tickDomains() {
  const g = useHost.getState().g;
  const list = g.domains ?? [];
  if (!list.length) return;
  const now = Date.now();
  const blocked = Boolean(domainBlock(g)) || Boolean(g.ended && g.phase !== 'day');
  let changed = false;
  const next: DomainState[] = [];
  for (const d of list) {
    if (blocked || now > d.until || !wearsIt(g, d.owner) || !inside(d, d.owner, 0.35)) {
      changed = true;
      continue;
    }
    let guest = d.guest;
    if (guest && !inside(d, guest, 0.35)) guest = null;
    if (!guest) {
      for (const s of g.seats) {
        if (s.id !== d.owner && s.playerId && inside(d, s.id)) {
          guest = s.id;
          break;
        }
      }
    }
    if (guest !== d.guest) changed = true;
    next.push(guest === d.guest ? d : { ...d, guest });
  }
  if (changed) {
    update((g) => {
      g.domains = next;
    });
  }
}
