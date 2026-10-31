/**
 * Still more seats and gravestones for the shop: classic gags, and nods to games, the internet and films (none of
 * them the real thing). Added to STOOLS and GRAVES in stoolShop.ts after the rest. Their shapes are in town/stools3.ts.
 */

export type GagStoolId =
  | 'whoopee'
  | 'paintcan'
  | 'lawnchair'
  | 'cheese'
  | 'couchpotato'
  | 'rubberduck'
  | 'cupcake'
  | 'pancakes'
  | 'lava'
  | 'trolley'
  | 'hamster'
  | 'tnt'
  | 'meltclock'
  | 'massage'
  | 'kart'
  | 'ejector'
  | 'sleepybelly'
  | 'forestspirit'
  | 'hoard'
  | 'armourthrone';

/** Cheapest first. */
export const GAG_STOOLS: { id: GagStoolId; name: string; icon: string; price: number }[] = [
  { id: 'whoopee', name: 'Whoopee cushion', icon: '💨', price: 15 },
  { id: 'paintcan', name: 'Burglar-trap paint tin', icon: '🎨', price: 20 },
  { id: 'lawnchair', name: 'Lawn chair and shades', icon: '😎', price: 25 },
  { id: 'cheese', name: 'Cartoon cheese wedge', icon: '🧀', price: 25 },
  { id: 'couchpotato', name: 'Couch potato', icon: '🥔', price: 30 },
  { id: 'rubberduck', name: 'Giant rubber duck', icon: '🦆', price: 30 },
  { id: 'cupcake', name: 'Giant cupcake', icon: '🧁', price: 35 },
  { id: 'pancakes', name: 'Stack of pancakes', icon: '🥞', price: 35 },
  { id: 'lava', name: 'The floor is lava', icon: '🌋', price: 40 },
  { id: 'trolley', name: 'Shopping trolley', icon: '🛒', price: 40 },
  { id: 'hamster', name: 'Hamster wheel', icon: '🐹', price: 45 },
  { id: 'tnt', name: 'Cartoon dynamite crate', icon: '🧨', price: 45 },
  { id: 'meltclock', name: 'Melting clock', icon: '🕰️', price: 60 },
  { id: 'massage', name: 'Massage chair', icon: '💆', price: 70 },
  { id: 'kart', name: 'Racing kart', icon: '🏎️', price: 75 },
  { id: 'ejector', name: 'Spy’s ejector seat', icon: '🔴', price: 80 },
  { id: 'sleepybelly', name: 'Sleeping giant’s belly', icon: '😴', price: 90 },
  { id: 'forestspirit', name: 'Forest spirit’s lap', icon: '🌱', price: 100 },
  { id: 'hoard', name: 'Dragon’s hoard', icon: '🪙', price: 120 },
  { id: 'armourthrone', name: 'Red-and-gold armour throne', icon: '🦾', price: 140 },
];

export type GagGraveId =
  | 'petrock'
  | 'sock'
  | 'notfound'
  | 'pressf'
  | 'ragequit'
  | 'floppy'
  | 'snowman'
  | 'brickphone'
  | 'loading'
  | 'cakelie'
  | 'hourglass'
  | 'jenga'
  | 'anvildrop'
  | 'bluescreen'
  | 'pocketpet'
  | 'youdied'
  | 'wasted'
  | 'grumpycat'
  | 'tpose'
  | 'coffindance';

/** Cheapest first. */
export const GAG_GRAVES: { id: GagGraveId; name: string; icon: string; price: number }[] = [
  { id: 'petrock', name: 'Pet rock', icon: '🪨', price: 15 },
  { id: 'sock', name: 'The odd sock', icon: '🧦', price: 20 },
  { id: 'notfound', name: 'Page not found', icon: '❔', price: 25 },
  { id: 'pressf', name: 'Press F to pay respects', icon: '⌨️', price: 25 },
  { id: 'ragequit', name: 'Rage-quit controller', icon: '🎮', price: 30 },
  { id: 'floppy', name: 'Never saved', icon: '💾', price: 30 },
  { id: 'snowman', name: 'Melted snowman', icon: '⛄', price: 30 },
  { id: 'brickphone', name: 'Unbreakable brick phone', icon: '📱', price: 35 },
  { id: 'loading', name: 'Stuck at 99%', icon: '⏳', price: 35 },
  { id: 'cakelie', name: 'The cake was a lie', icon: '🎂', price: 40 },
  { id: 'hourglass', name: 'Run-out hourglass', icon: '⌛', price: 40 },
  { id: 'jenga', name: 'Fallen block tower', icon: '🪵', price: 40 },
  { id: 'anvildrop', name: 'Cartoon anvil', icon: '💫', price: 45 },
  { id: 'bluescreen', name: 'Blue screen', icon: '🖥️', price: 45 },
  { id: 'pocketpet', name: 'Neglected pocket pet', icon: '🥚', price: 45 },
  { id: 'youdied', name: 'You died', icon: '🩸', price: 50 },
  { id: 'wasted', name: 'Wasted', icon: '🚓', price: 50 },
  { id: 'grumpycat', name: 'Grumpy cat', icon: '😾', price: 55 },
  { id: 'tpose', name: 'Glitched T-pose', icon: '🧍', price: 60 },
  { id: 'coffindance', name: 'Dancing pallbearers', icon: '⚰️', price: 120 },
];
