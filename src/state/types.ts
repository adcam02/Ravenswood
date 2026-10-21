import type { Alignment, Script } from '../data';
import type { BakeKind, ClothKind, DrinkKind, FlowerKind, Item, Look, Pose, TownState, Weather } from '../world/types';

export type Phase = 'night' | 'day';

export interface Reminder {
  id: string;
  roleId: string;
  text: string;
}

export interface Seat {
  id: string;
  name: string;
  /** The browser that took this seat. */
  playerId: string | null;
  /** The character the player really has. */
  roleId: string | null;
  /** What the player was told they are, when that differs (the Drunk, the Lunatic). */
  shownRoleId: string | null;
  /** Alignment when it differs from the character's team. */
  alignment: Alignment | null;
  dead: boolean;
  ghostVote: boolean;
  reminders: Reminder[];
  /** The player's animal and colour. */
  look: Look | null;
  /** The day they wear a gold star, for counting the sheep right the night before. */
  star?: number | null;
}

export type NominationStatus = 'idle' | 'countdown' | 'running' | 'paused' | 'done';

export interface Nomination {
  nominatorId: string | null;
  nomineeId: string;
  /** Seats with a hand raised. */
  votes: string[];
  /** Seats the clock hand has moved past, whose vote is final. */
  locked: string[];
  /** Dead players whose ghost vote this nomination used. */
  spentGhosts: string[];
  /** Voting order: the player after the nominee, clockwise, ending with the nominee. */
  order: string[];
  /** The seat the hand is on: 0 is the nominee before voting starts, then order[step - 1]. */
  step: number;
  status: NominationStatus;
  countdown: number;
  secondsPerPlayer: number;
}

export interface VoteRecord {
  id: string;
  day: number;
  nominatorId: string | null;
  nomineeId: string;
  nominatorName: string;
  nomineeName: string;
  voters: string[];
  votes: number;
  majority: number;
}

export type InfoCard =
  | 'useAbility'
  | 'makeChoice'
  | 'notInPlay'
  | 'thisIsDemon'
  | 'theseAreMinions'
  | 'youAre'
  | 'thisPlayerIs'
  | 'selectedYou';

/** gotIt, yes, no, good, evil, or a number written as n0, n1, … */
export type Sign = string;

/** The grimoire as it stands, for the Spy: every seat's real character and reminders. */
export interface GrimoireSnapshot {
  seats: { id: string; name: string; roleId: string | null; dead: boolean; reminders: string[] }[];
  bluffs: string[];
}

export interface WakePanel {
  card: InfoCard | null;
  signs: Sign[];
  roleIds: string[];
  seatIds: string[];
  text: string;
  grimoire?: GrimoireSnapshot;
}

/** What the player is asked to answer, optionally in the Storyteller's own words ("Who do you want to kill?"). */
export type Ask = (({ kind: 'players'; count: number } | { kind: 'character'; count: number } | { kind: 'yesno' }) & { prompt?: string }) | null;

export interface WakeMessage {
  id: string;
  to: string[];
  panels: WakePanel[];
  ask: Ask;
  at: number;
  when: string;
  /** Cards only some of the people woken see, by seat: the Demon's bluffs when the evil team wakes together. */
  extra?: Record<string, WakePanel[]>;
}

export interface WakeReply {
  wakeId: string;
  seatId: string;
  seatIds?: string[];
  roleIds?: string[];
  answer?: boolean;
  at: number;
}

export interface AwakeState {
  wakeId: string;
  seen: boolean;
}

/** The Storyteller ringing the bell to call everyone to the town square. */
export interface TownHall {
  id: string;
  at: number;
  /** Bumped by "ring again", which only alerts players who aren't back yet. */
  ring: number;
  /** Seats whose player has reached the square. */
  back: string[];
  /**
   * Everyone has arrived (or the Storyteller stopped the bell): the bell stops, but the meeting goes on,
   * stools and all, until the Storyteller ends it or night falls.
   */
  gathered?: boolean;
}

/** A player put to death in front of the town: the gallows show plays for everyone who sees it. */
export interface Execution {
  id: string;
  seatId: string;
  at: number;
}

export interface GameState {
  v: 1;
  room: string;
  phase: Phase;
  day: number;
  script: Script;
  seats: Seat[];
  bag: string[];
  bluffs: (string | null)[];
  fabled: string[];
  revealed: boolean;
  grimoireRevealed: boolean;
  nomination: Nomination | null;
  marked: { seatId: string; votes: number } | null;
  history: VoteRecord[];
  townHall: TownHall | null;
  execution: Execution | null;
  /** The weather the Storyteller has called for. */
  weather: Weather;
  /** Animals being looked at in the picker right now, by animal: one player each, so nobody doubles up. */
  picking?: Record<string, { playerId: string; name: string; until: number }>;
  /** A countdown for the day, shown as the sun crossing the sky; the bell can ring itself when it ends. */
  dayTimer: DayTimer | null;
  /** Drinks on the bar, washing on the line, flowers in the beds. */
  town: TownState;
  /** Seats killed during this night. Players don't see these deaths until the day begins. */
  nightDeaths: string[];
  awake: Record<string, AwakeState>;
  wakes: WakeMessage[];
  replies: WakeReply[];
  nightDone: string[];
}

// ---------------------------------------------------------------- what players receive

export interface PublicSeat {
  id: string;
  name: string;
  claimed: boolean;
  connected: boolean;
  dead: boolean;
  ghostVote: boolean;
  /** Only travellers' characters are public, until the grimoire is revealed at the end. */
  roleId: string | null;
  alignment: Alignment | null;
  look: Look | null;
  /** The day number they wear a gold star. */
  star?: number | null;
}

export interface PublicState {
  room: string;
  phase: Phase;
  day: number;
  script: Script;
  seats: PublicSeat[];
  fabled: string[];
  revealed: boolean;
  grimoireRevealed: boolean;
  nomination: Nomination | null;
  marked: { seatId: string; votes: number } | null;
  history: VoteRecord[];
  townHall: TownHall | null;
  execution: Execution | null;
  weather?: Weather;
  dayTimer?: DayTimer | null;
  /** Animals someone is choosing right now, with their name. */
  picking?: Record<string, string>;
  town: TownState;
}

export interface DayTimer {
  /** When the day started and when it ends, as host clock times (ms). */
  start: number;
  end: number;
  /** Ring the bell for a town meeting when it runs out. */
  autoBell: boolean;
  /** Set once the bell has rung for this timer. */
  rang?: boolean;
}

export interface PrivateState {
  seatId: string | null;
  roleId: string | null;
  alignment: Alignment | null;
  wake: WakeMessage | null;
  wakeSeen: boolean;
  /** Everything the Storyteller has shown this seat, oldest first. */
  log: WakeMessage[];
  /** Replies this seat has sent. */
  replies: WakeReply[];
}

// ---------------------------------------------------------------- messages

/** Something a player did around town that everyone can see. */
export type TownAction =
  | { k: 'pour'; kind: DrinkKind; stars: number }
  | { k: 'takeDrink'; id: string }
  | { k: 'wash'; kind: ClothKind; color: string; stars: number }
  | { k: 'plant'; bed: number; kind: FlowerKind; color: string; stars: number }
  | { k: 'bake'; kind: BakeKind; stars: number }
  | { k: 'takeBake'; id: string }
  | { k: 'fish'; kind: string; cm: number }
  /** A score at one of the games; the host keeps it if it beats the town record. */
  | { k: 'record'; game: string; score: number }
  /** Counted the sheep right tonight: a gold star to wear tomorrow. */
  | { k: 'star' };

export type HostMessage =
  | { t: 'state'; s: PublicState; now?: number; v?: string }
  | { t: 'private'; p: PrivateState }
  /**
   * Where everyone is, by seat id ('st' for the Storyteller): everything when `full`, otherwise only who moved
   * since the last message, with `gone` for anyone who left. `ann` is set while the Storyteller speaks to the whole town.
   */
  | { t: 'world'; a: Record<string, Pose | [number, number, number]>; gone?: string[]; full?: true; ann?: boolean }
  /** Something put in this player's paw: handed over by `from`, or taken from the bar or the shelf. */
  | { t: 'gift'; item: Item; from: string | null }
  /** The Storyteller calls this player over: they're brought to stand beside the Storyteller. */
  | { t: 'summon'; zone: string; x: number; z: number }
  /** That animal is already someone else's (or being chosen by them): pick another. */
  | { t: 'taken'; animal: string; by: string }
  | { t: 'pong' }
  | { t: 'host' }
  | { t: 'error'; message: string };

export type ClientMessage =
  | { t: 'hello'; playerId: string; v?: string }
  | { t: 'join'; name: string; look: Look }
  /** Looking at an animal in the picker: hold it so nobody else takes it meanwhile (null lets it go). */
  | { t: 'hold'; name: string; animal: string | null }
  | { t: 'leave' }
  | { t: 'rename'; name: string }
  | { t: 'vote'; up: boolean }
  | { t: 'ack'; wakeId: string }
  | { t: 'reply'; wakeId: string; seatIds?: string[]; roleIds?: string[]; answer?: boolean }
  | { t: 'sleep' }
  | { t: 'pose'; p: Pose }
  | { t: 'town'; a: TownAction }
  /** Hand whatever is in your paw to someone (a seat id, or 'st'). */
  | { t: 'give'; to: string; item: Item }
  | { t: 'ping' };
