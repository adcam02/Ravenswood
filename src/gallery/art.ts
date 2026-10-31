import { create } from 'zustand';
import type { ArtPart } from './types';

/** Pictures we have, by id (null: the Storyteller hasn't got it). Filled by gallery/client.ts and the network. */
export const useArt = create<{ imgs: Record<string, string | null> }>(() => ({ imgs: {} }));
const coming = new Map<string, { parts: string[]; n: number }>();

export function have(id: string, img: string | null) {
  useArt.setState((s) => ({ imgs: { ...s.imgs, [id]: img } }));
}

/** A picture (or a piece of one) from the Storyteller. */
export function receiveArt(p: ArtPart) {
  if (!p || typeof p.id !== 'string' || !Number.isInteger(p.i) || !Number.isInteger(p.n)) return;
  if (p.n === 0) return have(p.id, null);
  const c = coming.get(p.id) ?? { parts: [], n: p.n };
  if (c.n !== p.n) return;
  c.parts[p.i] = String(p.d ?? '');
  coming.set(p.id, c);
  if (c.parts.filter((x) => typeof x === 'string').length < c.n) return;
  coming.delete(p.id);
  have(p.id, c.parts.join(''));
}
