import { create } from 'zustand';
import type { GameJob } from '../jobs/meta';
import type { Anim, Item } from '../world/types';

/** The shop's shelves. */
export type ShopTab = 'pets' | 'hats' | 'dances';

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
  /** The browser took the graphics away (a GPU reset) and hasn't given them back yet: since when. */
  gfxLost: number | null;
  /** The emote playing, for highlighting its button. */
  emote: Anim | null;
  /** The Dances picker is open (above the emote bar). */
  dances: boolean;
  /** Holding something you can sip. */
  canSip: boolean;
  /** How many people are close enough to hear you right now. */
  hearing: number;
  /** The noticeboard is open. */
  notice: boolean;
  /**
   * At the casino: the shop open (on which shelf; `away` when it was opened from somewhere else, by a dance not
   * bought yet), or sitting at a card table (which seat).
   */
  casino: { kind: 'shop'; tab?: ShopTab; away?: boolean } | { kind: 'blackjack' | 'poker' | 'roulette' | 'slots'; seat: number } | null;
  /** Sitting on your stool at the town meeting. */
  meetingSeated: boolean;
  /** Night in bed: the counting-sheep game is on offer, being played, or done for tonight. */
  sheep: 'offer' | 'playing' | 'done' | null;
  /** Something everyone should be watching is on screen (a hanging, a visit in the night): popups wait. */
  drama: boolean;
  /** Killed in the night: the hooded figure's visit is playing, then the screen goes dark for a moment. */
  visit: 'playing' | 'dark' | null;
  /** In bed at night: the "Pass the time" menu of minigames is open. */
  bedMenu: boolean;
  /** In bed at night: drawing tonight's picture for the gallery. */
  draw: boolean;
  /** Something eaten or drunk lately: a little quicker on your feet until `until` (Date.now()), `mul` times as fast. */
  boost: { until: number; mul: number; kind: 'drink' | 'food' } | null;
  /** A messenger pigeon has just landed on our shoulder: who sent it and where they are. */
  pigeon: { name: string; where: string; key: number } | null;
  /** Dawn: the night's deaths being shown to everyone, which one this is and its caption. */
  dawnReel: { line: string; n: number; of: number; key: string } | null;
}

export const useHud = create<Hud>(() => ({
  place: 'Ravenswood',
  prompt: null,
  job: null,
  fading: false,
  giveTo: null,
  ready: false,
  failed: null,
  gfxLost: null,
  emote: null,
  dances: false,
  canSip: false,
  hearing: 0,
  notice: false,
  casino: null,
  meetingSeated: false,
  sheep: null,
  drama: false,
  visit: null,
  bedMenu: false,
  draw: false,
  boost: null,
  pigeon: null,
  dawnReel: null,
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
  jobDone: (_result: unknown) => {},
  /** In bed at night: play one of the minigames to pass the time. */
  bedGame: (_job: GameJob) => {},
  jobCancel: () => {},
  /** The counting-sheep game is over; right earns tomorrow's gold star. */
  sheepDone: (_correct: boolean) => {},
  /** The Storyteller has sat this player on their stool at the meeting (they hadn't come when the bell rang). */
  calledToStool: () => {},
  /** The Storyteller has called this player over: go and stand beside them. */
  summoned: (_zone: string, _x: number, _z: number) => {},
  /** Storyteller: someone was clicked in the world, so open their seat menu there. */
  pickSeat: (_seatId: string, _clientX: number, _clientY: number) => {},
  /** The item in your paw, as the HUD shows it. */
  item: null as Item | null,
};
