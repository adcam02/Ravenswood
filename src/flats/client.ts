import { create } from 'zustand';
import { player, useClient } from '../net/client';
import { useProfiles } from '../game/profiles';
import { directory, flatShown } from './host';
import { centreOn, emptyLayout, freeSpot, itemAt, cellAt, pieceById, whyNot, type FlatItem, type FlatLayout, type FlatView } from './catalogue';

/**
 * Wren Court on this screen: what's to be seen in the block (a player's view from the Storyteller, or for the
 * Storyteller, straight from the profiles), and the owner's decorating, which is done here and sent whole to the
 * Storyteller after every change.
 */

/** The block as this screen sees it, for the lobby or the flat `key` it's in. */
export function flatNow(mode: 'st' | 'player' | 'preview', where: 'lobby' | { key: string }): FlatView | null {
  if (mode === 'player') return useClient.getState().priv?.flat ?? null;
  if (mode !== 'st') return null;
  if (where === 'lobby') return { dir: directory() };
  const shown = flatShown(where.key);
  return shown ? { flat: { ...shown, mine: false } } : null;
}

/** The residents' list for the lobby's panel, kept fresh. */
export function useDirectory(mode: 'st' | 'player'): { key: string; name: string }[] | null {
  const priv = useClient((s) => (mode === 'player' ? (s.priv?.flat?.dir ?? null) : null));
  const book = useProfiles((s) => (mode === 'st' ? s.profiles : null));
  return mode === 'player' ? priv : book ? directory() : null;
}

/** This player's flat view (in their own flat, with what they own), kept fresh. */
export const useFlatView = () => useClient((s) => s.priv?.flat ?? null);

export const flatAction = player.flat;

/** Set by the 3D world: goes up in the lift to someone's flat. */
export const flatNav = { go: (_key: string) => {} };

// ---------------------------------------------------------------- decorating

export type DecorTab = 'shop' | 'storage' | 'room';

interface Decor {
  /** The lobby's list of flats is open. */
  dir: boolean;
  /** Decorating our own flat: the layout as it's being changed (sent to the Storyteller after each change). */
  draft: FlatLayout | null;
  /** The piece in hand: where it would go, and which placed piece it was (-1: just out of storage). */
  held: { item: FlatItem; index: number } | null;
  tab: DecorTab;
  /** Something to say about the last move ("Keep the doorway clear"). */
  hint: string | null;
  /** Bought and waiting to arrive in storage, to take it straight out: the piece, and how many we had. */
  waiting: { id: string; had: number } | null;
}

export const useDecor = create<Decor>(() => ({ dir: false, draft: null, held: null, tab: 'shop', hint: null, waiting: null }));

const send = (layout: FlatLayout) => flatAction({ k: 'arrange', layout });
const set = (d: Partial<Decor>) => useDecor.setState(d);

export const decor = {
  start(layout: FlatLayout | null) {
    set({ draft: structuredClone(layout ?? emptyLayout()), held: null, hint: null, tab: 'shop' });
  },
  /** Puts down whatever's in hand if it fits, and stops. */
  finish() {
    const s = useDecor.getState();
    if (s.held && s.draft && !whyNot(s.draft.items, s.held.item, s.held.index)) decor.place();
    set({ draft: null, held: null, hint: null, waiting: null });
  },
  tab(tab: DecorTab) {
    set({ tab });
  },
  /** Takes a piece out of storage, into the room wherever there's space. */
  takeOut(id: string) {
    const { draft } = useDecor.getState();
    if (!draft) return;
    const spot = freeSpot(draft.items, id);
    if (!spot) return set({ hint: `There’s no room for the ${pieceById(id)?.name.toLowerCase() ?? 'piece'}` });
    set({ held: { item: spot, index: -1 }, hint: null });
  },
  /** Picks up a piece that's out in the room. */
  pickUp(index: number) {
    const { draft } = useDecor.getState();
    const it = draft?.items[index];
    if (it) set({ held: { item: { ...it }, index }, hint: null });
  },
  /** A tap on the floor (in metres): moves the piece in hand there, or picks up whatever's there. */
  tap(x: number, z: number) {
    const { draft, held } = useDecor.getState();
    if (!draft) return;
    if (held) {
      const { cx, cz } = cellAt(x, z);
      return set({ held: { ...held, item: centreOn(held.item, cx, cz) }, hint: null });
    }
    const i = itemAt(draft.items, x, z);
    if (i >= 0) decor.pickUp(i);
  },
  /** Nudges the piece in hand a cell (wall pieces slide along their wall, and round the corner). */
  nudge(dx: number, dz: number) {
    const { held } = useDecor.getState();
    if (!held) return;
    const piece = pieceById(held.item.id);
    if (!piece) return;
    const it = held.item;
    let next: FlatItem;
    if (piece.kind === 'wall') {
      // From the middle of it, to the nearest wall to the next cell: along the wall, and round the corner at the end.
      const half = Math.floor(piece.w / 2);
      const [cx, cz] = it.r === 0 ? [it.x + half, 0] : [it.x, it.z + half];
      next = centreOn(it, cx + dx, cz + dz);
    } else {
      const [w, d] = it.r % 2 ? [piece.d, piece.w] : [piece.w, piece.d];
      next = centreOn(it, it.x + Math.floor((w - 1) / 2) + dx, it.z + Math.floor((d - 1) / 2) + dz);
    }
    set({ held: { ...held, item: next }, hint: null });
  },
  /** A quarter turn (floor pieces), keeping it about where it was. */
  turn() {
    const { held } = useDecor.getState();
    const piece = held && pieceById(held.item.id);
    if (!held || !piece || piece.kind === 'wall') return;
    const it = held.item;
    const [w, d] = it.r % 2 ? [piece.d, piece.w] : [piece.w, piece.d];
    const cx = it.x + Math.floor((w - 1) / 2);
    const cz = it.z + Math.floor((d - 1) / 2);
    set({ held: { ...held, item: centreOn({ ...it, r: (it.r + 1) % 4 }, cx, cz) }, hint: null });
  },
  /** Puts the piece in hand down where it is, if it fits. */
  place() {
    const { draft, held } = useDecor.getState();
    if (!draft || !held) return;
    const why = whyNot(draft.items, held.item, held.index);
    if (why) return set({ hint: why });
    const items = [...draft.items];
    if (held.index >= 0) items[held.index] = held.item;
    else items.push(held.item);
    const next = { ...draft, items };
    set({ draft: next, held: null, hint: null });
    send(next);
  },
  /** Back into storage. */
  putAway() {
    const { draft, held } = useDecor.getState();
    if (!draft || !held) return;
    if (held.index < 0) return set({ held: null, hint: null });
    const next = { ...draft, items: draft.items.filter((_, i) => i !== held.index) };
    set({ draft: next, held: null, hint: null });
    send(next);
  },
  /** Puts it back where it was. */
  cancel() {
    set({ held: null, hint: null });
  },
  finishes(kind: 'wall' | 'floor', id: string) {
    const { draft } = useDecor.getState();
    if (!draft || draft[kind] === id) return;
    const next = { ...draft, [kind]: id };
    set({ draft: next });
    send(next);
  },
  /** Buys something; a piece of furniture comes straight out of storage into the room once it's ours. */
  buy(id: string, had: number) {
    flatAction({ k: 'buy', id });
    if (pieceById(id)) set({ waiting: { id, had } });
  },
};
