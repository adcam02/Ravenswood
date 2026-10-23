import { angle, coord, fromPose, type Pose, type PoseState } from '../world/types';

export interface Presence extends PoseState {
  /** When we last heard where they are. */
  at: number;
}

/**
 * Where everyone else is, keyed by seat id ('st' for the Storyteller). The 3D world reads this every
 * frame, so it's a plain map rather than a React store.
 */
export const presence = {
  others: new Map<string, Presence>(),
  /** The Storyteller is speaking to the whole town. */
  announce: false,

  set(key: string, pose: Pose) {
    this.others.set(key, { ...fromPose(pose), at: Date.now() });
  },

  /** A player's whole view of the world from the Storyteller, minus themselves. */
  replace(all: Record<string, Pose | [number, number, number]>, skip: string | null) {
    const now = Date.now();
    for (const key of [...this.others.keys()]) if (!(key in all) || key === skip) this.others.delete(key);
    for (const [key, pose] of Object.entries(all)) {
      if (key === skip || !Array.isArray(pose) || pose.length < 8) continue;
      this.others.set(key, { ...fromPose(pose as Pose), at: now });
    }
  },

  /**
   * Just the people who changed since the last message (a whole pose, or only x, z and facing for someone
   * who merely moved), and anyone who left.
   */
  merge(changed: Record<string, Pose | [number, number, number]>, gone: string[] | undefined, skip: string | null) {
    const now = Date.now();
    for (const [key, pose] of Object.entries(changed)) {
      if (key === skip || !Array.isArray(pose)) continue;
      if (pose.length === 3) {
        const p = this.others.get(key);
        if (!p) continue;
        p.x = coord(pose[0]);
        p.z = coord(pose[1]);
        p.ry = angle(pose[2]);
        p.at = now;
      } else this.others.set(key, { ...fromPose(pose as Pose), at: now });
    }
    for (const key of gone ?? []) this.others.delete(key);
  },

  remove(key: string) {
    this.others.delete(key);
  },
};
