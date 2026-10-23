/**
 * Playing cards for the casino: a deck, blackjack totals, the best poker hand from seven cards, and how a pot
 * splits into side pots. Plain functions only, so the Storyteller's browser (which deals) and the tests share them.
 *
 * A card is two letters, rank then suit: 'As' is the ace of spades, 'Td' the ten of diamonds, '7h', '2c'.
 */

export type Card = string;
export type Suit = 's' | 'h' | 'd' | 'c';

export const RANKS = '23456789TJQKA';
export const SUITS: Suit[] = ['s', 'h', 'd', 'c'];

/** 2 to 14 (the ace is high; straights also count it low). */
export const rankOf = (c: Card) => RANKS.indexOf(c[0]) + 2;
export const suitOf = (c: Card) => c[1] as Suit;
export const isCard = (c: unknown): c is Card => typeof c === 'string' && c.length === 2 && RANKS.includes(c[0]) && 'shdc'.includes(c[1]);

export const RANK_NAMES: Record<number, [string, string]> = {
  2: ['two', 'twos'],
  3: ['three', 'threes'],
  4: ['four', 'fours'],
  5: ['five', 'fives'],
  6: ['six', 'sixes'],
  7: ['seven', 'sevens'],
  8: ['eight', 'eights'],
  9: ['nine', 'nines'],
  10: ['ten', 'tens'],
  11: ['jack', 'jacks'],
  12: ['queen', 'queens'],
  13: ['king', 'kings'],
  14: ['ace', 'aces'],
};

/** A whole number below `n`, from the browser's proper random source where there is one. */
export function randomBelow(n: number): number {
  const c = (globalThis as { crypto?: Crypto }).crypto;
  if (c?.getRandomValues) {
    // (Rejecting the top sliver keeps every number equally likely.)
    const limit = Math.floor(0x100000000 / n) * n;
    const buf = new Uint32Array(1);
    do c.getRandomValues(buf);
    while (buf[0] >= limit);
    return buf[0] % n;
  }
  return Math.floor(Math.random() * n);
}

/** `decks` fresh packs, shuffled. */
export function newShoe(decks = 1, rand = randomBelow): Card[] {
  const cards: Card[] = [];
  for (let d = 0; d < decks; d++) for (const s of SUITS) for (const r of RANKS) cards.push(r + s);
  for (let i = cards.length - 1; i > 0; i--) {
    const j = rand(i + 1);
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }
  return cards;
}

// ---------------------------------------------------------------- blackjack

/** A blackjack hand's best total, and whether an ace in it is still counting as eleven. */
export function bjTotal(cards: Card[]): { total: number; soft: boolean } {
  let total = 0;
  let aces = 0;
  for (const c of cards) {
    const r = rankOf(c);
    if (r === 14) {
      aces++;
      total += 11;
    } else total += Math.min(10, r);
  }
  while (total > 21 && aces > 0) {
    total -= 10;
    aces--;
  }
  return { total, soft: aces > 0 };
}

export const isBlackjack = (cards: Card[]) => cards.length === 2 && bjTotal(cards).total === 21;

/** The dealer draws to 17 and stands on any 17, soft ones included. */
export const dealerStands = (cards: Card[]) => bjTotal(cards).total >= 17;

// ---------------------------------------------------------------- poker hands

export const HAND_NAMES = ['High card', 'Pair', 'Two pair', 'Three of a kind', 'Straight', 'Flush', 'Full house', 'Four of a kind', 'Straight flush'];

export interface HandValue {
  /** 0 high card … 8 straight flush (a royal flush is the best straight flush). */
  cat: number;
  /** Bigger is better; equal is a tie. */
  score: number;
  /** In words: "Two pair, kings and fives". */
  name: string;
  /** The five cards that make it. */
  best: Card[];
}

const scoreOf = (cat: number, ranks: number[]) => ranks.reduce((s, r) => s * 15 + r, cat) * Math.pow(15, 5 - ranks.length);

/** Exactly five cards. */
export function evaluate5(cards: Card[]): HandValue {
  const ranks = cards.map(rankOf).sort((a, b) => b - a);
  const flush = cards.every((c) => suitOf(c) === suitOf(cards[0]));
  const distinct = [...new Set(ranks)];
  let straightHigh = 0;
  if (distinct.length === 5) {
    if (ranks[0] - ranks[4] === 4) straightHigh = ranks[0];
    // The wheel: A-2-3-4-5, where the ace is low.
    else if (ranks[0] === 14 && ranks[1] === 5) straightHigh = 5;
  }
  // Ranks grouped by how many of each, the bigger groups first, then the higher rank.
  const counts = new Map<number, number>();
  for (const r of ranks) counts.set(r, (counts.get(r) ?? 0) + 1);
  const groups = [...counts.entries()].sort((a, b) => b[1] - a[1] || b[0] - a[0]);
  const order = groups.map((g) => g[0]);
  const n = (r: number, many = false) => RANK_NAMES[r][many ? 1 : 0];
  const make = (cat: number, keys: number[], name: string): HandValue => ({ cat, score: scoreOf(cat, keys), name, best: cards });
  if (straightHigh && flush) return make(8, [straightHigh], straightHigh === 14 ? 'Royal flush' : `Straight flush, ${n(straightHigh)} high`);
  if (groups[0][1] === 4) return make(7, order, `Four of a kind, ${n(order[0], true)}`);
  if (groups[0][1] === 3 && groups[1][1] === 2) return make(6, order, `Full house, ${n(order[0], true)} full of ${n(order[1], true)}`);
  if (flush) return make(5, ranks, `Flush, ${n(ranks[0])} high`);
  if (straightHigh) return make(4, [straightHigh], `Straight, ${n(straightHigh)} high`);
  if (groups[0][1] === 3) return make(3, order, `Three of a kind, ${n(order[0], true)}`);
  if (groups[0][1] === 2 && groups[1][1] === 2) return make(2, order, `Two pair, ${n(order[0], true)} and ${n(order[1], true)}`);
  if (groups[0][1] === 2) return make(1, order, `Pair of ${n(order[0], true)}`);
  return make(0, ranks, `High card, ${n(ranks[0])}`);
}

/** The best five-card hand from five to seven cards (hole cards and the board). */
export function bestHand(cards: Card[]): HandValue {
  if (cards.length < 5 || cards.length > 7) throw new Error(`bestHand needs 5 to 7 cards, not ${cards.length}`);
  let best: HandValue | null = null;
  // Every choice of five (21 of them from seven).
  for (let mask = 0; mask < 1 << cards.length; mask++) {
    let bits = 0;
    for (let m = mask; m; m &= m - 1) bits++;
    if (bits !== 5) continue;
    const v = evaluate5(cards.filter((_, i) => mask & (1 << i)));
    if (!best || v.score > best.score) best = v;
  }
  return best!;
}

// ---------------------------------------------------------------- pots

export interface Contribution {
  id: string;
  /** Chips put in over the whole hand. */
  amount: number;
  /** Folded: their chips stay in the pot, but they can't win it. */
  folded: boolean;
}

export interface Pot {
  amount: number;
  /** Who can win it. */
  eligible: string[];
}

/**
 * The main pot and side pots: each player still in can only win, from each other player, as much as they put in
 * themselves. A pot only one player can win is their own chips coming back (an uncalled bet). Folded players'
 * chips go into the pots at the levels they reached.
 */
export function splitPots(list: Contribution[]): Pot[] {
  const live = list.filter((c) => !c.folded && c.amount > 0);
  const levels = [...new Set(live.map((c) => c.amount))].sort((a, b) => a - b);
  const pots: Pot[] = [];
  let prev = 0;
  for (const level of levels) {
    const amount = list.reduce((sum, c) => sum + Math.max(0, Math.min(c.amount, level) - prev), 0);
    const eligible = live.filter((c) => c.amount >= level).map((c) => c.id);
    // Pots with the same players in them are one pot.
    const last = pots[pots.length - 1];
    if (last && last.eligible.join() === eligible.join()) last.amount += amount;
    else if (amount > 0) pots.push({ amount, eligible });
    prev = level;
  }
  // Folded chips above everyone still in (rare: someone folds after putting in more than an all-in caller had) go
  // to the last pot.
  const over = list.reduce((sum, c) => sum + Math.max(0, c.amount - prev), 0);
  if (over > 0 && pots.length) pots[pots.length - 1].amount += over;
  return pots;
}

/**
 * Shares a pot between its winners: equal shares, and any odd chips one each to the winners first round from the
 * button (`order` is everyone in seat order starting left of the button).
 */
export function sharePot(amount: number, winners: string[], order: string[]): Record<string, number> {
  const out: Record<string, number> = {};
  if (!winners.length) return out;
  const each = Math.floor(amount / winners.length);
  let odd = amount - each * winners.length;
  for (const w of winners) out[w] = each;
  for (const id of order) {
    if (odd <= 0) break;
    if (winners.includes(id)) {
      out[id] += 1;
      odd--;
    }
  }
  return out;
}
