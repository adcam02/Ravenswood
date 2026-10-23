import { inBooth, zoneKind, type PoseState } from '../world/types';

/** Full volume this close, in metres. */
const NEAR = 2;
/** Silent beyond this, out in the town. */
export const FAR = 9.5;
/** A shout carries this many times further out in the open (never through a wall, or into or out of a booth). */
export const SHOUT = 2.75;

const smooth = (t: number) => t * t * (3 - 2 * t);

export interface EarshotContext {
  /** A town meeting is on: everyone gathered at the square hears everyone else there. */
  meeting: boolean;
  meetingRadius: number;
  /** The Storyteller is speaking to the whole town. */
  announce: boolean;
}

const atMeeting = (p: PoseState, r: number) => p.zone === 'town' && Math.hypot(p.x, p.z) < r;

/** How loudly `me` hears `other`, from 0 to 1. Walls are absolute: different places never hear each other. */
export function earshot(me: PoseState, other: PoseState, otherIsStoryteller: boolean, ctx: EarshotContext): number {
  if (otherIsStoryteller && ctx.announce) return 1;
  if (me.zone !== other.zone) return 0;
  // The confession booth: the two inside hear each other clearly, and nobody else, either way.
  const booth = inBooth(me.zone, me.x, me.z);
  if (booth !== inBooth(other.zone, other.x, other.z)) return 0;
  if (booth) return 1;
  const d = Math.hypot(me.x - other.x, me.z - other.z);
  if (zoneKind(me.zone) !== 'town') {
    // Rooms are small and cosy: everyone inside can hear, a little quieter across the room.
    return 1 - 0.4 * smooth(Math.min(1, Math.max(0, (d - 4) / 8)));
  }
  if (ctx.meeting && atMeeting(me, ctx.meetingRadius) && atMeeting(other, ctx.meetingRadius)) return 1;
  // Someone shouting is heard the same way, only further off.
  const k = other.shout ? SHOUT : 1;
  if (d <= NEAR * k) return 1;
  if (d >= FAR * k) return 0;
  return 1 - smooth((d - NEAR * k) / ((FAR - NEAR) * k));
}
