import { create } from 'zustand';
import type { GameJob } from '../jobs';
import type { Anim, Item } from '../world/types';

export interface Prompt {
  label: string;
  key: string;
  /** Greyed out, with the reason as the label. */
  locked?: boolean;
}

/** What the 3D world tells the on-screen controls. */
interface Hud {
  /** Where you are: "Town square", "The Raven's Rest", "Abbey's home". */
  place: string;
  prompt: Prompt | null;
  /** The minigame being played. */
  job: { job: GameJob; station: string } | null;
  /** The screen fades to black while walking through a door. */
  fading: boolean;
  /** Someone close enough to hand your item to. */
  giveTo: { key: string; name: string } | null;
  /** True once the 3D town has drawn its first frame. */
  ready: boolean;
  /** WebGL is missing or failed. */
  failed: string | null;
  /** The emote playing, for highlighting its button. */
  emote: Anim | null;
  /** Holding something you can sip. */
  canSip: boolean;
  /** How many people are close enough to hear you right now. */
  hearing: number;
  /** The noticeboard is open. */
  notice: boolean;
}

export const useHud = create<Hud>(() => ({
  place: 'Ravenswood',
  prompt: null,
  job: null,
  fading: false,
  giveTo: null,
  ready: false,
  failed: null,
  emote: null,
  canSip: false,
  hearing: 0,
  notice: false,
}));

/** Commands from the on-screen buttons to the 3D world. The world fills these in when it starts. */
export const game = {
  interact: () => {},
  emote: (_anim: Anim) => {},
  sip: () => {},
  give: () => {},
  putAway: () => {},
  /** Storyteller: float over to someone. */
  goTo: (_key: string) => {},
  /** Walk (well, hop) to your own stool at the town meeting. */
  takeMeetingSeat: () => {},
  /** Head straight to the square when the bell rings. */
  goToSquare: () => {},
  jobDone: (_result: unknown) => {},
  jobCancel: () => {},
  /** The item in your paw, as the HUD shows it. */
  item: null as Item | null,
};
