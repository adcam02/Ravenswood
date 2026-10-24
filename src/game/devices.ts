/**
 * Knowing each player's device, so nobody plays (and spends) under someone else's name.
 *
 * Every browser makes itself a random secret once and sends it to the Storyteller on arriving. The Storyteller keeps
 * only its hash, on the profile of each name the device plays as (game/profiles.ts: admitDevice, trustDevice). The
 * first device to join as a name claims it; a new device joining as a claimed name waits at the door (`useKnocks`)
 * until the Storyteller lets them in or turns them away. The Storyteller's own browser is always let in.
 */
import { create } from 'zustand';
import { loadJSON, saveJSON, uid } from '../lib/util';
import type { Look } from '../world/types';

const KEY = 'ravenswood:device';

/** This browser's own secret, made the first time it's asked for. Never sent to anyone but the Storyteller. */
export function deviceSecret(): string {
  let secret = loadJSON<string | null>(KEY, null);
  if (typeof secret !== 'string' || secret.length < 16) {
    secret = Array.from(crypto.getRandomValues(new Uint8Array(16)), (b) => b.toString(16).padStart(2, '0')).join('');
    saveJSON(KEY, secret);
  }
  return secret;
}

/** A device's secret as the Storyteller keeps it (half a SHA-256, as hex), or null for no secret worth the name. */
export async function hashDevice(secret: unknown): Promise<string | null> {
  if (typeof secret !== 'string' || secret.length < 16 || secret.length > 128) return null;
  const bytes = new TextEncoder().encode(`ravenswood:${secret}`);
  try {
    const digest = await crypto.subtle.digest('SHA-256', bytes);
    return Array.from(new Uint8Array(digest).slice(0, 16), (b) => b.toString(16).padStart(2, '0')).join('');
  } catch {
    // No crypto.subtle (a page served over plain http): a weaker hash, but still not the secret itself.
    let a = 0x811c9dc5;
    let b = 0x01000193;
    for (const byte of bytes) {
      a = Math.imul(a ^ byte, 0x01000193) >>> 0;
      b = Math.imul(b + byte, 0x5bd1e995) >>> 0;
    }
    return `${a.toString(16).padStart(8, '0')}${b.toString(16).padStart(8, '0')}`;
  }
}

/** Someone joining as a name that belongs to another device, waiting for the Storyteller to say. */
export interface Knock {
  id: string;
  playerId: string;
  name: string;
  look: Look;
  at: number;
}

/** The Storyteller's side: who's waiting at the door, first come first. */
export const useKnocks = create<{ list: Knock[] }>(() => ({ list: [] }));

export const knocks = {
  add(k: Omit<Knock, 'id' | 'at'>) {
    const list = useKnocks.getState().list.filter((x) => x.playerId !== k.playerId);
    useKnocks.setState({ list: [...list, { ...k, id: uid(), at: Date.now() }].slice(-20) });
  },
  /** Takes this player's knock away (answered, given up, or gone), returning it. */
  take(playerId: string): Knock | null {
    const list = useKnocks.getState().list;
    const k = list.find((x) => x.playerId === playerId) ?? null;
    if (k) useKnocks.setState({ list: list.filter((x) => x !== k) });
    return k;
  },
};
