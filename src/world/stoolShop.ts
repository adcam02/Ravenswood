/**
 * The seats and gravestones on sale at the Lucky Raven's shop: a design for your stool round the dais in the square,
 * and one for your gravestone in the churchyard when you die (with a line on it, if you like). Bought as 'stool:<id>'
 * and 'grave:<id>' (see casino/shop.ts), chosen in the Shop or Customise, and kept on your look so everyone sees
 * them. The shapes themselves are in town/stools.ts; this is just the names and prices, so it's light to import.
 */

export type StoolId =
  | 'milking'
  | 'hay'
  | 'bucket'
  | 'crate'
  | 'stump'
  | 'ring'
  | 'barrel'
  | 'tyres'
  | 'pouffe'
  | 'pumpkin'
  | 'books'
  | 'beanbag'
  | 'toadstool'
  | 'tractor'
  | 'iceblock'
  | 'barstool'
  | 'drum'
  | 'anvil'
  | 'donut'
  | 'loo'
  | 'teacup'
  | 'cake'
  | 'swing'
  | 'rocking'
  | 'clam'
  | 'chest'
  | 'gaming'
  | 'cloud'
  | 'egg'
  | 'throne';

/** Cheapest first. */
export const STOOLS: { id: StoolId; name: string; icon: string; price: number }[] = [
  { id: 'milking', name: 'Milking stool', icon: '🐄', price: 15 },
  { id: 'hay', name: 'Hay bale', icon: '🌾', price: 15 },
  { id: 'bucket', name: 'Upturned bucket', icon: '🪣', price: 15 },
  { id: 'crate', name: 'Fruit crate', icon: '📦', price: 18 },
  { id: 'stump', name: 'Mossy tree stump', icon: '🌳', price: 20 },
  { id: 'ring', name: 'Rubber ring', icon: '🛟', price: 20 },
  { id: 'barrel', name: 'Barrel', icon: '🛢️', price: 22 },
  { id: 'tyres', name: 'Pile of tyres', icon: '🛞', price: 22 },
  { id: 'pouffe', name: 'Knitted pouffe', icon: '🧶', price: 25 },
  { id: 'pumpkin', name: 'Pumpkin', icon: '🎃', price: 25 },
  { id: 'books', name: 'Stack of books', icon: '📚', price: 28 },
  { id: 'beanbag', name: 'Beanbag', icon: '🫘', price: 30 },
  { id: 'toadstool', name: 'Toadstool', icon: '🍄', price: 30 },
  { id: 'tractor', name: 'Tractor seat', icon: '🚜', price: 32 },
  { id: 'iceblock', name: 'Block of ice', icon: '🧊', price: 35 },
  { id: 'barstool', name: 'Diner bar stool', icon: '🍸', price: 35 },
  { id: 'drum', name: 'Big bass drum', icon: '🥁', price: 38 },
  { id: 'anvil', name: 'Anvil', icon: '⚒️', price: 40 },
  { id: 'donut', name: 'Giant doughnut', icon: '🍩', price: 40 },
  { id: 'loo', name: 'The loo', icon: '🚽', price: 45 },
  { id: 'teacup', name: 'Giant teacup', icon: '☕', price: 50 },
  { id: 'cake', name: 'Layer cake', icon: '🎂', price: 50 },
  { id: 'swing', name: 'Swing', icon: '🎠', price: 55 },
  { id: 'rocking', name: 'Rocking chair', icon: '🪑', price: 60 },
  { id: 'clam', name: 'Giant clam shell', icon: '🐚', price: 65 },
  { id: 'chest', name: 'Treasure chest', icon: '💰', price: 75 },
  { id: 'gaming', name: 'Gaming chair', icon: '🎮', price: 90 },
  { id: 'cloud', name: 'Fluffy cloud', icon: '☁️', price: 110 },
  { id: 'egg', name: 'Dragon egg', icon: '🥚', price: 130 },
  { id: 'throne', name: 'Throne', icon: '👑', price: 160 },
];

export type GraveId = 'cartoon' | 'skull' | 'catstone' | 'obelisk' | 'celtic' | 'tablet' | 'pyramid' | 'angel' | 'crystal' | 'mausoleum';

/** Cheapest first. */
export const GRAVES: { id: GraveId; name: string; icon: string; price: number }[] = [
  { id: 'cartoon', name: 'Cartoon RIP', icon: '🪦', price: 15 },
  { id: 'skull', name: 'Skull and crossbones', icon: '☠️', price: 25 },
  { id: 'catstone', name: 'Cat-shaped stone', icon: '🐈', price: 30 },
  { id: 'obelisk', name: 'Obelisk', icon: '🗼', price: 35 },
  { id: 'celtic', name: 'Celtic cross', icon: '✝️', price: 40 },
  { id: 'tablet', name: 'Grand tombstone', icon: '📜', price: 45 },
  { id: 'pyramid', name: 'Pyramid', icon: '🔺', price: 60 },
  { id: 'angel', name: 'Weeping angel', icon: '👼', price: 75 },
  { id: 'crystal', name: 'Glowing crystal', icon: '🔮', price: 90 },
  { id: 'mausoleum', name: 'Mausoleum', icon: '🏛️', price: 140 },
];

export const stoolKey = (id: StoolId) => `stool:${id}`;
export const graveKey = (id: GraveId) => `grave:${id}`;

/** A known stool design or none (the plain log stool). */
export const fixStool = (v: unknown): StoolId | null => (STOOLS.some((s) => s.id === v) ? (v as StoolId) : null);
/** A known gravestone or none (the plain stone). */
export const fixGrave = (v: unknown): GraveId | null => (GRAVES.some((s) => s.id === v) ? (v as GraveId) : null);

export const EPITAPH_MAX = 40;
/** A line for the gravestone: plain text on one line, 40 characters at most ('' for none). */
export function cleanEpitaph(v: unknown): string {
  if (typeof v !== 'string') return '';
  return v
    .replace(/[\u0000-\u001f\u007f-\u009f\u200b-\u200f\u2028-\u202e\u2066-\u2069]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, EPITAPH_MAX)
    .trim();
}
