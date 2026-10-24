import { create } from 'zustand';
import { presence } from '../game/presence';
import { changeFlat, debit, money, nameKey, profileOf, residents, useProfiles } from '../game/profiles';
import { debugHooks } from '../lib/util';
import { useHost } from '../state/host';
import { flatOwner, flatZone } from '../world/types';
import { FLOORS, MAX_EACH, MAX_OWNED, WALLS, cleanLayout, emptyFlat, pieceById, type FlatAction, type FlatLayout, type FlatView } from './catalogue';

/**
 * Wren Court, on the Storyteller's side: the furniture shop's till and the flats' layouts, all kept in the players'
 * profiles (game/profiles.ts), so a flat is theirs in every game this Storyteller hosts. Each player is sent only what
 * they need where they are (their FlatView): the residents' list in the lobby, the flat they're standing in, and in
 * their own flat what they own. Only the owner, standing in their own flat, can buy for it or change it.
 */

/** Bumped whenever what someone should be sent changes (the profiles' own changes go out by themselves). */
export const useFlats = create<{ rev: number }>(() => ({ rev: 0 }));
const bump = () => useFlats.setState((s) => ({ rev: s.rev + 1 }));

const NOTE_MS = 8000;
const notes = new Map<string, { text: string; ok: boolean; at: number }>();
function tell(player: string, text: string, ok: boolean) {
  notes.set(player, { text, ok, at: Date.now() });
  bump();
}

/** The seat in the game this browser has, with its name. */
function gameSeat(player: string) {
  const s = useHost.getState().g.seats.find((x) => x.playerId === player);
  return s?.name.trim() ? s : null;
}

/** Where a seated player is, by the poses they send. */
const zoneOf = (seatId: string) => presence.others.get(seatId)?.zone ?? null;

function buy(player: string, id: string) {
  const seat = gameSeat(player);
  if (!seat) return;
  const piece = pieceById(id);
  const finish = [...WALLS, ...FLOORS].find((f) => f.id === id);
  if (!piece && !finish) return;
  if (zoneOf(seat.id) !== flatZone(nameKey(seat.name))) return tell(player, 'Furniture is bought from your own flat.', false);
  const p = profileOf({ name: seat.name });
  const flat = p?.flat ?? emptyFlat();
  const name = (piece ?? finish)!.name.toLowerCase();
  if (piece) {
    if ((flat.owned[id] ?? 0) >= MAX_EACH) return tell(player, `You have ${MAX_EACH} of those already: that’s plenty!`, false);
    if (Object.values(flat.owned).reduce((a, b) => a + b, 0) >= MAX_OWNED) return tell(player, 'Your storage is full to the ceiling.', false);
  } else if (finish && (finish.price === 0 || flat.finishes.includes(id))) return tell(player, `You have the ${name} already.`, false);
  const price = (piece ?? finish)!.price;
  if (!debit({ name: seat.name }, price, `for the ${name}`)) return tell(player, `The ${name} is ${money(price)}, and you have ${money(p?.coins ?? 0)}.`, false);
  changeFlat({ name: seat.name }, (f) => {
    if (piece) f.owned[id] = (f.owned[id] ?? 0) + 1;
    else if (finish) {
      f.finishes = [...f.finishes, id];
      // Up straight away.
      if (WALLS.includes(finish)) f.layout.wall = id;
      else f.layout.floor = id;
    }
  });
  tell(player, piece ? `The ${name} is yours! It’s in your storage.` : `The ${name} is yours!`, true);
}

function arrange(player: string, raw: unknown) {
  const seat = gameSeat(player);
  if (!seat || zoneOf(seat.id) !== flatZone(nameKey(seat.name))) return;
  changeFlat({ name: seat.name }, (f) => {
    const next = cleanLayout(raw, f.owned, f.finishes);
    if (JSON.stringify(next) === JSON.stringify(f.layout)) return false;
    f.layout = next;
  });
}

/** A player's message about their flat. */
export function receiveFlats(player: string, raw: unknown) {
  if (!raw || typeof raw !== 'object') return;
  const a = raw as FlatAction;
  if (a.k === 'buy') buy(player, String(a.id ?? '').slice(0, 24));
  else if (a.k === 'arrange') arrange(player, a.layout);
}

/** Everyone with a flat, by name. */
export function directory(): { key: string; name: string }[] {
  return residents()
    .slice(0, 300)
    .sort((a, b) => a.name.localeCompare(b.name));
}

/** A flat as anyone in it sees it (whose, and its layout), or null if there's nobody by that name. */
export function flatShown(key: string): { key: string; name: string; layout: FlatLayout } | null {
  const p = useProfiles.getState().profiles[key];
  // (Laid out again on the way: a piece put where the bedroom's things now stand goes back into storage.)
  return p ? { key, name: p.name, layout: p.flat ? cleanLayout(p.flat.layout, p.flat.owned, p.flat.finishes) : emptyFlat().layout } : null;
}

/** What a player is sent of the apartment block: nothing unless they're in it. */
export function flatFor(player: string): FlatView | null {
  const seat = gameSeat(player);
  if (!seat) return null;
  const zone = zoneOf(seat.id);
  const n = notes.get(player);
  const note = n && Date.now() - n.at < NOTE_MS ? n : null;
  if (zone === 'lobby') return { dir: directory(), note };
  const owner = zone ? flatOwner(zone) : null;
  if (!owner) return null;
  const shown = flatShown(owner);
  const mine = owner === nameKey(seat.name);
  if (!shown) return mine ? { flat: { key: owner, name: seat.name, layout: emptyFlat().layout, mine }, own: { owned: {}, finishes: [] }, note } : null;
  const own = mine ? (profileOf({ name: seat.name })?.flat ?? emptyFlat()) : null;
  return { flat: { ...shown, mine }, own: own ? { owned: own.owned, finishes: own.finishes } : undefined, note };
}

let started = false;
/** Opens the block, in the Storyteller's browser: watches who goes in and out, so each is sent what's there. */
export function startFlats() {
  if (started) return;
  started = true;
  let was = '';
  setInterval(() => {
    const sig = useHost
      .getState()
      .g.seats.map((s) => {
        const z = zoneOf(s.id);
        return z === 'lobby' || z?.startsWith('flat:') ? `${s.id}=${z}` : '';
      })
      .join('|');
    const now = Date.now();
    let stale = false;
    for (const [p, n] of notes) {
      if (now - n.at < NOTE_MS) continue;
      notes.delete(p);
      stale = true;
    }
    if (sig !== was || stale) {
      was = sig;
      bump();
    }
  }, 400);
}

if (debugHooks()) Object.assign(window, { __flats: { receiveFlats, flatFor, directory, store: useFlats } });
