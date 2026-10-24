/**
 * European roulette: one zero, 37 pockets. The bets players can make, what each covers, what it pays, and where it
 * sits on the betting board (the same places on the felt in the room and in the panel).
 */

/** The pockets round the wheel, clockwise from the zero. */
export const WHEEL = [0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26];

const REDS = new Set([1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]);
export const colourOf = (n: number): 'red' | 'black' | 'green' => (n === 0 ? 'green' : REDS.has(n) ? 'red' : 'black');

/**
 * A bet, by its key: a single number 'n0'..'n36'; 'red', 'black', 'odd', 'even', 'low' (1-18), 'high' (19-36);
 * a dozen 'd1'..'d3'; a column 'c1'..'c3' (c1 is 1, 4, 7 … 34).
 */
export type BetKey = string;

export const OUTSIDE: BetKey[] = ['low', 'even', 'red', 'black', 'odd', 'high'];
export const BET_KEYS: BetKey[] = [...Array.from({ length: 37 }, (_, n) => `n${n}`), ...OUTSIDE, 'd1', 'd2', 'd3', 'c1', 'c2', 'c3'];
export const isBet = (k: unknown): k is BetKey => typeof k === 'string' && BET_KEYS.includes(k);

/** Whether a bet wins when the ball lands on n. Every bet but a straight-up zero loses on zero. */
export function covers(key: BetKey, n: number): boolean {
  if (key[0] === 'n') return Number(key.slice(1)) === n;
  if (n === 0) return false;
  switch (key) {
    case 'red':
      return REDS.has(n);
    case 'black':
      return !REDS.has(n);
    case 'odd':
      return n % 2 === 1;
    case 'even':
      return n % 2 === 0;
    case 'low':
      return n <= 18;
    case 'high':
      return n >= 19;
  }
  const k = Number(key.slice(1));
  if (key[0] === 'd') return Math.ceil(n / 12) === k;
  if (key[0] === 'c') return ((n - 1) % 3) + 1 === k;
  return false;
}

/** What a bet pays to one: 35 on a single number, 2 on a dozen or a column, 1 on the even-money bets. */
export const odds = (key: BetKey) => (key[0] === 'n' ? 35 : key[0] === 'd' || key[0] === 'c' ? 2 : 1);

/** What comes back from a set of bets when the ball lands on n: each winning stake, and its winnings. */
export function payout(bets: Record<BetKey, number>, n: number): number {
  let back = 0;
  for (const [key, amount] of Object.entries(bets)) if (amount > 0 && covers(key, n)) back += amount * (odds(key) + 1);
  return back;
}

export const BET_NAMES: Record<string, string> = { low: '1 to 18', high: '19 to 36', even: 'Even', odd: 'Odd', red: 'Red', black: 'Black', d1: '1st 12', d2: '2nd 12', d3: '3rd 12', c1: '2 to 1', c2: '2 to 1', c3: '2 to 1' };
export const betName = (key: BetKey) => (key[0] === 'n' ? key.slice(1) : (BET_NAMES[key] ?? key));

/**
 * Where a bet sits on the board, in cells: 14 across (the zero, twelve columns of numbers, the column bets) and five
 * down (three rows of numbers with 3, 6 … 36 at the top, the dozens, the even-money bets). `w` and `h` are its size.
 */
export function boardCell(key: BetKey): { col: number; row: number; w: number; h: number } {
  if (key === 'n0') return { col: 0, row: 0, w: 1, h: 3 };
  if (key[0] === 'n') {
    const n = Number(key.slice(1));
    return { col: Math.ceil(n / 3), row: 2 - ((n - 1) % 3), w: 1, h: 1 };
  }
  if (key[0] === 'c') return { col: 13, row: 3 - Number(key.slice(1)), w: 1, h: 1 };
  if (key[0] === 'd') return { col: 1 + (Number(key.slice(1)) - 1) * 4, row: 3, w: 4, h: 1 };
  const i = OUTSIDE.indexOf(key);
  return { col: 1 + i * 2, row: 4, w: 2, h: 1 };
}
