/**
 * The Lucky Raven's slot machines: three reels, one line, a bet of $1, $2 or $5 a pull. Each reel stops on a symbol
 * drawn by weight (the Storyteller's browser draws them, see casino/host.ts), and the line pays by the table below.
 * Over many pulls about 94 cents of every dollar comes back; three lucky sevens (about one pull in 2,200) pay 100 times
 * the bet.
 */

export interface SlotSymbol {
  id: string;
  /** How it's drawn: an emoji, or for the seven, the figure itself (drawn big and red). */
  glyph: string;
  /** What three of them are called ("Three bells"). */
  name: string;
  /** How many of the 26 stops on each reel it has. */
  weight: number;
}

export const SYMBOLS: SlotSymbol[] = [
  { id: 'cherry', glyph: '🍒', name: 'Cherries', weight: 4 },
  { id: 'lemon', glyph: '🍋', name: 'Lemons', weight: 6 },
  { id: 'bell', glyph: '🔔', name: 'Bells', weight: 5 },
  { id: 'clover', glyph: '🍀', name: 'Clovers', weight: 4 },
  { id: 'star', glyph: '⭐', name: 'Stars', weight: 3 },
  { id: 'diamond', glyph: '💎', name: 'Diamonds', weight: 2 },
  { id: 'seven', glyph: '7', name: 'Lucky sevens', weight: 2 },
];
const CHERRY = 0;
export const SEVEN = 6;
const STOPS = SYMBOLS.reduce((n, s) => n + s.weight, 0);

/** The bets on offer, how long the reels spin (each stops this long after the lever's pulled), and the wait between pulls. */
export const SL = { bets: [1, 2, 5], stops: [1300, 1900, 2500], pullMs: 350, coolMs: 900, winMs: 4000 };
/** From pulling the lever to the last reel stopping. */
export const SL_SPIN_MS = SL.pullMs + SL.stops[2];

/** Three of a kind pays this many times the bet (the stake included); two cherries pay 4, one cherry gives the bet back. */
export const PAYS: Record<string, number> = { seven: 100, diamond: 50, star: 25, clover: 15, cherry: 10, bell: 10, lemon: 8 };

/** One reel's symbol, drawn by weight from a random whole number below STOPS. */
export function symbolAt(stop: number): number {
  let n = ((stop % STOPS) + STOPS) % STOPS;
  for (let i = 0; i < SYMBOLS.length; i++) {
    if (n < SYMBOLS[i].weight) return i;
    n -= SYMBOLS[i].weight;
  }
  return 0;
}
export const SLOT_STOPS = STOPS;

/** What a line pays, as a multiple of the bet (0 for nothing), and what to call it. */
export function linePays(reels: number[]): { times: number; what: string } {
  const [a, b, c] = reels;
  if (a === b && b === c) return { times: PAYS[SYMBOLS[a].id] ?? 0, what: a === SEVEN ? 'JACKPOT! Three lucky sevens' : `Three ${SYMBOLS[a].name.toLowerCase()}` };
  const cherries = reels.filter((r) => r === CHERRY).length;
  if (cherries === 2) return { times: 4, what: 'Two cherries' };
  if (cherries === 1) return { times: 1, what: 'A cherry: your bet back' };
  return { times: 0, what: '' };
}

/** The paytable, best first, for the panel. */
export const PAYTABLE: { reels: number[]; times: number; label?: string }[] = [
  ...Object.entries(PAYS)
    .sort((x, y) => y[1] - x[1])
    .map(([id, times]) => {
      const i = SYMBOLS.findIndex((s) => s.id === id);
      return { reels: [i, i, i], times };
    }),
  { reels: [CHERRY, CHERRY], times: 4, label: 'any two' },
  { reels: [CHERRY], times: 1, label: 'any one' },
];

export const isSlotBet = (v: unknown): v is number => typeof v === 'number' && SL.bets.includes(v);
