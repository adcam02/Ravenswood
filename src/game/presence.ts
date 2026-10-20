import { fromPose, type Pose, type PoseState } from '../world/types';

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
  replace(all: Record<string, Pose>, skip: string | null) {
    const now = Date.now();
    for (const key of [...this.others.keys()]) if (!(key in all) || key === skip) this.others.delete(key);
    for (const [key, pose] of Object.entries(all)) {
      if (key === skip || !Array.isArray(pose)) continue;
      this.others.set(key, { ...fromPose(pose), at: now });
    }
  },

  remove(key: string) {
    this.others.delete(key);
  },
};
