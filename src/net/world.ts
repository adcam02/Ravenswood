import type { Pose } from '../world/types';

/** Just a new position for someone the receiver already knows: x, z and facing. */
export type Move = [number, number, number];

/**
 * What the Storyteller's browser sends each player about where everyone is. Rather than the whole town ten
 * times a second, each player gets only the poses that changed since their last message: someone standing
 * still costs nothing, and at night, with everyone in bed, almost nothing goes out at all. People in a
 * different place from the receiver (another house, or indoors while they're out) are sent at most a couple
 * of times a second, since only the map shows them. A full snapshot goes every few seconds regardless, so a
 * lost message can't leave a stale animal behind.
 */

/** A full snapshot at least this often. */
export const FULL_EVERY_MS = 3000;
/** People somewhere else are sent at most this often. */
export const FAR_EVERY_MS = 500;
/** People in the same place but this far off (small on screen) are sent at most every AWAY_EVERY_MS. */
export const AWAY_M = 24;
export const AWAY_EVERY_MS = 250;

export interface WorldLink {
  /** The last pose sent for each key, as JSON. */
  sent: Map<string, string>;
  sentAt: Map<string, number>;
  lastFullAt: number;
}

export const newWorldLink = (): WorldLink => ({ sent: new Map(), sentAt: new Map(), lastFullAt: 0 });

export interface WorldUpdate {
  /** Whole poses, or just a move (x, z, facing) when nothing else about them changed. */
  a: Record<string, Pose | Move>;
  /** Keys that have left (only on partial updates). */
  gone?: string[];
  /** Everything, not just what changed: replace what you have. */
  full?: true;
}

/** Where the receiving player is. */
export interface Receiver {
  zone: string;
  x: number;
  z: number;
}

/** Everything about a pose but where it is, for telling a move from a real change. */
const restOf = (json: string) => json.slice(json.indexOf(',', json.indexOf(',', json.indexOf(',') + 1) + 1));

/**
 * The next update for one player, or null if there's nothing to say. `poses` is everyone (by key) and
 * `jsons` their JSON, computed once per tick for all players; `me` is where this player is.
 */
export function worldUpdate(now: number, link: WorldLink, poses: Map<string, Pose>, jsons: Map<string, string>, me: Receiver): WorldUpdate | null {
  if (now - link.lastFullAt >= FULL_EVERY_MS) {
    link.lastFullAt = now;
    link.sent.clear();
    const a: Record<string, Pose> = {};
    for (const [key, pose] of poses) {
      a[key] = pose;
      link.sent.set(key, jsons.get(key)!);
      link.sentAt.set(key, now);
    }
    return { a, full: true };
  }
  const a: Record<string, Pose | Move> = {};
  let any = false;
  for (const [key, pose] of poses) {
    const json = jsons.get(key)!;
    const last = link.sent.get(key);
    if (json === last) continue;
    const since = now - (link.sentAt.get(key) ?? 0);
    if (pose[3] !== me.zone) {
      if (since < FAR_EVERY_MS) continue;
    } else if (since < AWAY_EVERY_MS && Math.hypot(pose[0] - me.x, pose[1] - me.z) > AWAY_M) continue;
    // Only moved (same place, animation, item and so on): three numbers rather than the lot.
    a[key] = last && restOf(last) === restOf(json) ? [pose[0], pose[1], pose[2]] : pose;
    link.sent.set(key, json);
    link.sentAt.set(key, now);
    any = true;
  }
  let gone: string[] | undefined;
  for (const key of link.sent.keys()) {
    if (poses.has(key)) continue;
    (gone ??= []).push(key);
    link.sent.delete(key);
    link.sentAt.delete(key);
  }
  if (!any && !gone) return null;
  return gone ? { a, gone } : { a };
}
