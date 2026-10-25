import type { Card } from './cards';

/**
 * The Lucky Raven: the casino's tables and shop, as the players see them. The Storyteller's browser deals every card
 * and moves every dollar (casino/host.ts); each player is sent a CasinoView with only what they may see (their own
 * hole cards, nobody else's until a showdown).
 */

/** Seats at each table. */
export const BJ_SEATS = 5;
export const PK_SEATS = 8;

/** Blackjack bets, in dollars. */
export const BJ_MIN = 1;
export const BJ_MAX = 50;

/** Texas hold'em: the blinds, how much you can bring to the table, and how long each turn may take. */
export const PK = { small: 1, big: 2, minBuy: 10, maxBuy: 100, turnMs: 30000 };

/** A face-down card, as everyone but its owner sees it. */
export const HIDDEN = '??';

export type BjResult = 'blackjack' | 'win' | 'push' | 'lose' | 'bust';

export interface BjSeatView {
  name: string;
  mine: boolean;
  /** Waiting for a bet, playing their hand, the dealer playing theirs, or the hand is over (with how it went). */
  state: 'betting' | 'playing' | 'dealer' | 'done';
  bet: number;
  cards: Card[];
  /** The dealer's hand against this seat (each seat plays its own round), the hole card hidden until it's turned. */
  dealer: Card[];
  result: BjResult | null;
  /** Paid back on the last hand, stake included. */
  paid: number;
  canDouble: boolean;
  /** When the hand stands by itself if nobody moves (host clock). */
  until: number | null;
}

export type PkStage = 'waiting' | 'preflop' | 'flop' | 'turn' | 'river' | 'showdown';

export interface PkSeatView {
  name: string;
  mine: boolean;
  /** Chips in front of them. */
  stack: number;
  /** Put in this betting round. */
  bet: number;
  inHand: boolean;
  folded: boolean;
  allIn: boolean;
  /** Sitting out (missed their turns): skipped until they say they're back. */
  out: boolean;
  /** Their two cards: their own, face down for everyone else, or shown at a showdown. */
  cards: Card[];
  /** What they did last this round: "Check", "Raise to $8". */
  last: string | null;
  /** At the end of a hand: what they won, and their hand in words if it was shown. */
  won: number;
  hand: string | null;
}

export interface PkView {
  seats: (PkSeatView | null)[];
  /** Counts up with each hand, so a click meant for one hand can't land on the next. */
  hand: number;
  stage: PkStage;
  board: Card[];
  /** Everything in the middle, this round's bets included. */
  pot: number;
  /** At the end of a hand: each pot and who took it. */
  pots: { amount: number; winners: string[] }[];
  button: number | null;
  /** Whose turn it is, and when it runs out (host clock). */
  turn: number | null;
  until: number | null;
  /** The table's biggest bet this round. */
  toMatch: number;
  /** For the player whose turn it is: the least they can raise to, and whether they may raise at all. */
  minRaise: number;
  canRaise: boolean;
  /** A line about what's happening: "Waiting for another player", "Abbey wins $24 with two pair". */
  note: string;
}

export const RL_SEATS = 5;
/** Roulette: the most a player can have on the table in one spin, how long betting stays open, and the spin itself. */
export const RL = { max: 100, betMs: 25000, spinMs: 7500, resultMs: 5000 };

export interface RlSeatView {
  name: string;
  mine: boolean;
  /** Their chips on the board, by bet (see casino/roulette.ts). */
  bets: Record<string, number>;
  /** Ready for the wheel to spin. */
  ready: boolean;
  /** On the last spin: what they put down, and what came back. */
  staked: number;
  won: number;
}

export interface RlView {
  seats: (RlSeatView | null)[];
  /** Taking bets, the ball rolling, or the number called. */
  stage: 'betting' | 'spinning' | 'result';
  /** When betting closes (host clock), once the first chip is down. */
  closes: number | null;
  /** The ball: the number it lands on, when it was thrown and when it settles (host clock). Null before the first. */
  spin: { n: number; at: number; until: number; no: number } | null;
  /** The last numbers, newest last. */
  history: number[];
}

/** The slot machines along the right-hand wall. */
export const SL_MACHINES = 3;

export interface SlMachineView {
  /** Who's sitting at it (null: nobody). */
  name: string | null;
  mine: boolean;
  /**
   * The last pull, for everyone in the room to watch: the symbols the reels stop on (see casino/slots.ts), the bet,
   * what came back (stake included), and when the lever was pulled (host clock; each reel stops a set time after).
   */
  spin: { reels: number[]; bet: number; won: number; at: number; no: number } | null;
  /** When the next pull is allowed (host clock). */
  readyAt: number;
}

export interface CasinoView {
  bj: (BjSeatView | null)[];
  pk: PkView;
  rl: RlView;
  sl: SlMachineView[];
  /** Something just for this player ("You need $35 for the slime"), and when. */
  note: { text: string; at: number } | null;
}

/** What a player asks of the casino. `hand` on poker moves is the hand they meant it for. */
export type CasinoAction =
  | { k: 'buy'; pet: string }
  /** A hat or a dance from the shop, by key ('hat:topper', 'dance:worm'). */
  | { k: 'buyItem'; item: string }
  | { k: 'bj'; do: 'sit'; seat: number }
  | { k: 'bj'; do: 'leave' }
  | { k: 'bj'; do: 'deal'; bet: number }
  | { k: 'bj'; do: 'hit' | 'stand' | 'double' }
  | { k: 'pk'; do: 'sit'; seat: number; buyIn: number }
  | { k: 'pk'; do: 'leave' | 'back' }
  | { k: 'pk'; do: 'fold' | 'check' | 'call' | 'allin'; hand: number }
  | { k: 'pk'; do: 'raise'; to: number; hand: number }
  | { k: 'rl'; do: 'sit'; seat: number }
  | { k: 'rl'; do: 'leave' | 'clear' | 'ready' }
  | { k: 'rl'; do: 'bet'; bet: string; amount: number }
  | { k: 'sl'; do: 'sit'; seat: number }
  | { k: 'sl'; do: 'leave' }
  | { k: 'sl'; do: 'spin'; bet: number };
