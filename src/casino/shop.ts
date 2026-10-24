import { PETS, type PetId } from '../world/types';

/**
 * The pet shop's prices. Each pet has a tier; a pet not listed here (a new one) is a fancy one. A game pays
 * roughly $10 to $40, so the plainest pets are a game or two away and the fanciest a few more.
 */
const TIER: Record<string, 1 | 2 | 3 | 4> = {
  // Little ones.
  chick: 1,
  mouse: 1,
  snail: 1,
  duck: 1,
  clip: 1,
  tribble: 1,
  volleyball: 1,
  soot: 1,
  // A bit special.
  bee: 2,
  slime: 2,
  sprout: 2,
  puffball: 2,
  cube: 2,
  creepling: 2,
  shroom: 2,
  kweh: 2,
  pocketpal: 2,
  doge: 2,
  grumpy: 2,
  owl: 2,
  henchling: 2,
  // Fancy.
  ghost: 3,
  zapmouse: 3,
  sage: 3,
  spirit: 3,
  rascal: 3,
  arcade: 3,
  balldroid: 3,
  tidybot: 3,
  poptart: 3,
  mogwai: 3,
  feedme: 3,
  // The grandest.
  astrodroid: 4,
  dragon: 4,
  luckdragon: 4,
  skybison: 4,
};

const PRICE = { 1: 20, 2: 35, 3: 50, 4: 80 } as const;

/** What a pet costs at the casino shop, in dollars. */
export const petPrice = (pet: PetId | string): number => PRICE[TIER[pet] ?? 3];

export const petName = (pet: PetId | string) => PETS.find((p) => p.id === pet)?.name ?? 'that pet';

/** The shop's shelves: every pet, cheapest first. */
export const shopPets = () => [...PETS].sort((a, b) => petPrice(a.id) - petPrice(b.id) || a.name.localeCompare(b.name));
