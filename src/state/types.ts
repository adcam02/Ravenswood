import type { Alignment, Script } from '../data';
import type { CasinoAction, CasinoView } from '../casino/types';
import type { FlatAction, FlatView } from '../flats/catalogue';
import type { BakeKind, ClothKind, DrinkKind, FlowerKind, Item, Look, PetId, Pose, Progress, TownState, Weather } from '../world/types';

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

/** A player asking to nominate someone. The Storyteller runs nominations, so they start it (or don't). */
export interface NominationRequest {
  id: string;
  /** Seat ids: who wants to nominate, and whom. */
  by: string;
  target: string;
  day: number;
  at: number;
  status: 'pending' | 'started' | 'declined' | 'withdrawn';
  /** Why it didn't go ahead, when another nomination got there first. */
  note?: string;
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

/**
 * What the player is asked to answer, optionally in the Storyteller's own words ("Who do you want to kill?").
 * `optional`: they may choose nobody (the Barber's Demon, the Professor).
 */
export type Ask =
  | (({ kind: 'players'; count: number } | { kind: 'character'; count: number } | { kind: 'yesno' }) & { prompt?: string; optional?: boolean })
  | null;

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
  /** Seats whose player has sat down on their own stool. */
  back: string[];
  /**
   * Everyone has arrived (or the Storyteller stopped the bell): the bell stops, but the meeting goes on,
   * stools and all, until the Storyteller ends it or night falls.
   */
  gathered?: boolean;
}

/** The ways to be executed: the gallows, and the town's other entertainments (see src/game/execution.ts). */
export type ExecMethod = 'hang' | 'squad' | 'guillotine' | 'chair' | 'missile' | 'roast' | 'kaiju' | 'plane' | 'pigeon' | 'moon';

/** A player put to death in front of the town: the show plays for everyone who sees it. */
export interface Execution {
  id: string;
  seatId: string;
  at: number;
  /** They don't die (the Devil's Advocate's choice, the Fool, a Tea Lady's neighbour): a lucky escape. */
  survives?: boolean;
  /**
   * How it's done, once settled. Unset while the town votes on it. (An execution with neither this nor `vote`,
   * from before there was a choice, is a hanging.)
   */
  method?: ExecMethod;
  /** The town's vote on the method: open until `until` (host clock), with each seat's pick. */
  vote?: { until: number; picks: Record<string, ExecMethod> };
  /** When the method was settled (host clock): drawn on the wheel from the votes, or chosen by the Storyteller. */
  drawn?: { at: number; spin: boolean };
}

/** Someone claiming to be the Slayer and choosing a player, in front of the whole town. Anyone can, once a game. */
export interface SlayerShot {
  id: string;
  /** Who claimed it, and who they chose (seat ids). */
  by: string;
  target: string;
  at: number;
  /** Waiting on the Storyteller (or a short pause, when it isn't the Slayer), then what happened. */
  result: 'pending' | 'dies' | 'nothing';
  /** Storyteller only: they really are the Slayer, so the Storyteller decides what happens. */
  real?: boolean;
  /** The day it happened on. */
  day?: number;
}

/** A death this game, for the recap at the end. */
export interface DeathRecord {
  seatId: string;
  day: number;
  phase: Phase;
  /** Hanged at the gallows, killed in the night, slain by the Slayer, or killed by the Storyteller by day. */
  how: 'executed' | 'night' | 'slayer' | 'other';
  at: number;
}

/** A letter posted in someone's letterbox by day, for them to open in bed that night. */
export interface Letter {
  id: string;
  /** Seat ids: who wrote it, and whose letterbox it went in. */
  from: string;
  to: string;
  /** Signed with the writer's name, or null for an anonymous letter. */
  name: string | null;
  text: string;
  /** The night it arrives on: posted on day N, it can be opened in bed from night N + 1. */
  night: number;
  at: number;
}

/** A letter as its reader gets it: who signed it (if anyone), never which seat wrote it. */
export type LetterIn = Omit<Letter, 'from' | 'to'>;

/** A messenger pigeon: someone wants to speak to `to`, and says where they are. */
export interface Pigeon {
  id: string;
  /** Seat ids. */
  from: string;
  to: string;
  /** The sender's name and where they were when they sent it ("by the pond"). */
  name: string;
  where: string;
  at: number;
}

/** Killed in the night: the hooded figure's visit to their bedroom, which only they (and the Storyteller) see. */
export interface Visit {
  id: string;
  seatId: string;
  /** Which of the ways it happens. */
  variant: number;
  /** When the Storyteller marked the death (host clock). */
  at: number;
}

/** The game is over: who won, and why. */
export interface GameEnd {
  winner: 'good' | 'evil';
  reason: string;
  at: number;
  day: number;
  /** When this game began (host clock), so the recap leaves out an earlier game's fish. */
  since?: number;
  /** Storyteller only: how things stood, so "carry on playing" puts them back. */
  before?: { phase: Phase; nightDeaths: string[]; revealed: boolean };
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
  /** Players asking to nominate today, oldest first. */
  nomRequests?: NominationRequest[];
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
  /** Letters posted this game. */
  letters?: Letter[];
  /** Messenger pigeons sent lately, newest last. */
  pigeons?: Pigeon[];
  /** Slayer claims this game, oldest first. */
  slayer: SlayerShot[];
  /** Everyone who has died this game, in order. */
  deaths: DeathRecord[];
  /** Set once the Storyteller calls the game. */
  ended: GameEnd | null;
  /** When this game began. */
  startedAt?: number;
  /** The pet fights in the tavern's cellar: challenges, the fight in the ring, the board of wins. */
  pit?: PitState;
  /** The game-over question the Storyteller has answered (or that ending the game settled), so it isn't asked again. */
  winDismissed?: string | null;
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
  /** Once the grimoire is revealed: what they were told they were, when it differs (the Drunk). */
  shownRoleId?: string | null;
  alignment: Alignment | null;
  look: Look | null;
  /** The day number they wear a gold star. */
  star?: number | null;
  /** Letters are waiting in their letterbox (the little flag is up). */
  mail?: boolean;
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
  /** Slayer claims this game (without whether they were the real Slayer). */
  slayer?: SlayerShot[];
  /** Pigeons in the air just now: whose shoulder each is heading for (not who sent it). */
  pigeons?: { id: string; to: string; at: number }[];
  /** The game is over. */
  ended?: GameEnd | null;
  /** Every death this game, once it's over (for the recap). */
  deaths?: DeathRecord[];
  /** The pet pit, without anyone's secret pick. */
  pit?: PitState;
  /** The tavern's leaderboard (from everyone's profile, which only the Storyteller has). */
  leaders?: Leaders;
}

/** One line on the tavern's leaderboard: a name as they write it, and how many (dollars, wins, achievements). */
export interface LeaderRow {
  name: string;
  n: number;
}

export interface Leaders {
  rich: LeaderRow[];
  wins: LeaderRow[];
  feats: LeaderRow[];
  pit: LeaderRow[];
  /** Everyone who owns the trophy hat (names in lower case), for the crown by their name. */
  crowns: string[];
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
  /** Letters that have arrived for this seat (from the first night after they were posted). */
  letters?: LetterIn[];
  /** Killed tonight: the visit to play in their bedroom. */
  visit?: Visit | null;
  /** Pigeons that have come for this seat lately: who sent each, and where they said they were. */
  pigeons?: { id: string; name: string; where: string; at: number }[];
  /** Everything kept under this player's name (or the name they're joining with), with their money and pets. */
  profile?: ProfileView | null;
  /** This seat's own requests to nominate today, and what came of them. */
  nomRequests?: NominationRequest[];
  /** The casino's tables and shop, while they're in it (with only their own cards face up). */
  casino?: CasinoView | null;
  /** The apartment block, while they're in it: the lobby's residents, or the flat they're standing in. */
  flat?: FlatView | null;
}

// ---------------------------------------------------------------- the pet pit

/** What a pet does in a round of a fight: picked in secret by both sides, then shown together. */
export type PitMove = 'attack' | 'block' | 'charge';

/** One pet in the ring, and its owner. */
export interface PitSide {
  seat: string;
  name: string;
  pet: PetId;
  hp: number;
  /** Charges stored for the next attack. */
  charge: number;
  /** Picked this round (what, only the Storyteller's browser knows until the reveal). */
  picked: boolean;
  /** Storyteller only: this round's pick. */
  move?: PitMove | null;
  /** Last round's move (a block can't follow a block). */
  last: PitMove | null;
}

/** A round as it was revealed. Index 0 and 1 follow the fight's sides. */
export interface PitRound {
  n: number;
  moves: [PitMove, PitMove];
  /** Picked at random, as time ran out. */
  random: [boolean, boolean];
  /** Damage each side took. */
  dmg: [number, number];
  /** Each side's block that caught the other's attack (and hit back). */
  countered: [boolean, boolean];
  /** How hard each side's attack was (1 plus the charges it spent). */
  power: [number, number];
  /** Hearts and charges before the round, and after it. */
  was: [number, number];
  had: [number, number];
  hp: [number, number];
  charge: [number, number];
}

export interface PitFight {
  id: string;
  /** The challenger first. */
  sides: [PitSide, PitSide];
  /** Walking into the ring, picking, the reveal playing out, and the result. */
  stage: 'intro' | 'pick' | 'reveal' | 'over';
  round: number;
  /** When this stage ends (host clock). */
  until: number;
  last: PitRound | null;
  /** How it ended: the winner (index), or null for a draw or a fight called off. */
  result?: { winner: 0 | 1 | null; why: 'ko' | 'draw' | 'left' | 'off'; prize: number };
  at: number;
}

export interface PitChallenge {
  id: string;
  /** Seat ids. */
  from: string;
  to: string;
  at: number;
}

export interface PitState {
  fight: PitFight | null;
  challenges: PitChallenge[];
  /** The chalk board: most wins first. */
  board: { name: string; wins: number }[];
  /** Storyteller only: prizes paid today, by player name. */
  paid?: Record<string, { day: string; wins: number }>;
}

/** Something a player does in the pit. */
export type PitAction =
  | { k: 'challenge'; to: string }
  | { k: 'answer'; id: string; yes: boolean }
  | { k: 'withdraw'; id: string }
  | { k: 'move'; move: PitMove };

// ---------------------------------------------------------------- profiles, kept by the Storyteller

/** What a player has earned, as numbers and lists: the hats come from these. */
export interface ProgressSnapshot extends Progress {
  /** Running counts toward achievements (fish caught, votes, letters…). */
  tally: Record<string, number>;
}

/** Money in or out, with why, for the little "+$25 for the win" on the player's screen (`at` is the host's clock). */
export interface PayLine {
  id: string;
  amount: number;
  why: string;
  at: number;
}

/** A player's profile as they're sent it. */
export interface ProfileView extends ProgressSnapshot {
  /** The name it's kept under (lower case), and as they last wrote it. */
  key: string;
  name: string;
  coins: number;
  pets: PetId[];
  /** Hats, dances and the like bought at the shop ('hat:topper', 'dance:worm'). */
  items?: string[];
  /** Money in and out lately, newest last. */
  pay: PayLine[];
  /** Achievements given on the Storyteller's side (not earned in the player's own browser), to make a moment of. */
  news: { id: string; feat: string; at: number }[];
  /** Which Storyteller's book of profiles this is. */
  book: string;
  /** The player's latest reports that are now counted. */
  acks: string[];
}

/**
 * One thing a player earned, reported to the Storyteller to keep under their name. `k` is its own key, so a report
 * sent twice (after a reconnect, say) counts once.
 */
export type ProgressEvent =
  | { k: string; e: 'feat'; id: string }
  /** A job done perfectly, the first time. */
  | { k: string; e: 'perfect'; job: string }
  | { k: string; e: 'count'; kind: 'stars' | 'records' | 'ghosts' | 'nights' }
  | { k: string; e: 'tally'; kind: string; by: number }
  /** Any three-star job, which pays a little (up to a cap a day). */
  | { k: string; e: 'top'; job: string }
  /** What this browser had earned before the Storyteller kept it by name: merged in once (nobody loses anything). */
  | { k: string; e: 'merge'; p: ProgressSnapshot };

/**
 * The Storyteller's book of profiles as players' browsers keep it, in case the Storyteller's is lost: only what's
 * needed to carry on (no history), and of each device only its hash.
 */
export interface BackupCopy {
  /** Which book it is, and when the Storyteller sent it (their clock). */
  book: string;
  at: number;
  done: string[];
  /** By name key: each as the Storyteller keeps it, less the history. */
  profiles: Record<string, unknown>;
}

/** A kept copy in brief: its book, how many names, and its latest change (the Storyteller's clock). */
export interface BackupSummary {
  book: string;
  n: number;
  last: number;
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
  | { k: 'star' }
  /** Put a song on at the club's jukebox (for everyone in there). */
  | { k: 'song'; song: string };

export type HostMessage =
  | { t: 'state'; s: PublicState; now?: number; v?: string }
  | { t: 'private'; p: PrivateState }
  /**
   * Where everyone is, by seat id ('st' for the Storyteller). With `d` set (pages that said they understand it):
   * everything when `full`, otherwise only who moved since the last message, with `gone` for anyone who left.
   * Without `d` it's everyone, every time (older pages). `ann` is set while the Storyteller speaks to the whole town.
   */
  | { t: 'world'; a: Record<string, Pose | [number, number, number]>; gone?: string[]; full?: true; d?: 1; ann?: boolean }
  /** Something put in this player's paw: handed over by `from`, or taken from the bar or the shelf. */
  | { t: 'gift'; item: Item; from: string | null }
  /** The Storyteller calls this player over: they're brought to stand beside the Storyteller. */
  | { t: 'summon'; zone: string; x: number; z: number }
  /** The Storyteller seats this player on their stool at the meeting (they hadn't answered the bell). */
  | { t: 'seat' }
  /** That animal is already someone else's (or being chosen by them): pick another. */
  | { t: 'taken'; animal: string; by: string }
  /** Whether the letter just posted went in (it can't by night, or past the day's limit). */
  | { t: 'posted'; ok: boolean }
  /** Whether the request to nominate just sent reached the Storyteller, or why not. */
  | { t: 'nominated'; ok: boolean; why?: string }
  /** Whether the idea just posted in the idea box reached the Storyteller. */
  | { t: 'ideaIn'; ok: boolean }
  /** Whether the pigeon just sent took off (they only fly by day, and need a rest between flights). */
  | { t: 'pigeoned'; ok: boolean; why?: string }
  /** `at` is the ping's own time, sent back so the player can tell how long the round trip took. */
  | { t: 'pong'; at?: number }
  | { t: 'host' }
  | { t: 'error'; message: string }
  /** A copy of the Storyteller's book of profiles, for this browser to keep in case theirs is lost. */
  | { t: 'backup'; b: BackupCopy }
  /** The Storyteller would like this browser's copies of these books (all of them, without `books`). */
  | { t: 'backupWanted'; books?: string[] }
  /**
   * Joining as a name that belongs to another device: `ok` null while the Storyteller is asked, then whether they
   * let this one in.
   */
  | { t: 'door'; name: string; ok: boolean | null };

export type ClientMessage =
  /** `delta`: this page understands world updates that carry only what changed. */
  | {
      t: 'hello';
      playerId: string;
      v?: string;
      delta?: boolean;
      /** This browser's own secret (the Storyteller keeps only its hash), to know the device next time. */
      device?: string;
      /** The copies of Storytellers' books of profiles this browser keeps, in brief. */
      kept?: BackupSummary[];
    }
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
  /** Claim to be the Slayer and choose this seat. */
  | { t: 'slay'; seatId: string }
  /** Ask the Storyteller to start a nomination of this seat, or take back a request still waiting. */
  | { t: 'nominate'; seatId: string }
  | { t: 'withdrawNomination'; id: string }
  /** A vote on how the one being executed goes. */
  | { t: 'method'; m: ExecMethod }
  /** Post a letter in someone's letterbox (by day), signed or not. */
  | { t: 'letter'; to: string; text: string; signed: boolean }
  /** An idea or a request for the Storyteller, from the idea box. */
  | { t: 'idea'; text: string }
  /** Send a messenger pigeon to someone: "<name> wants to speak to you", and where the sender is. */
  | { t: 'pigeon'; to: string; where: string }
  /** Something went wrong in this player's game, so the Storyteller knows. */
  | { t: 'oops'; message: string; where?: string; v?: string }
  /** `at`: when it was sent (for the round trip); `rtt`: the player's latest measure of it, in milliseconds. */
  | { t: 'ping'; at?: number; rtt?: number }
  /** Things earned since the last report, for the Storyteller to keep under this player's name. */
  | { t: 'progress'; events: ProgressEvent[] }
  /** Challenging someone in the pet pit, answering, or picking a move. */
  | { t: 'pit'; a: PitAction }
  /** A bet, a card, a pet from the shop: everything at the casino. */
  | { t: 'casino'; a: CasinoAction }
  /** The copies of books of profiles the Storyteller asked for. */
  | { t: 'backup'; copies: BackupCopy[] }
  /** Buying furniture for your flat, or laying it out. */
  | { t: 'flat'; a: FlatAction };
