import { PETS, type PetId } from '../world/types';

/**
 * The pet shop's prices. Each pet has a tier; a pet not listed here (a new one) is a fancy one. A game pays
 * roughly $10 to $40, so the plainest pets are a game or two away and the fanciest a few more.
 */
const TIER: Partial<Record<PetId | string, 1 | 2 | 3 | 4>> = {
  chick: 1,
  mouse: 1,
  snail: 1,
  bee: 2,
  slime: 2,
  ghost: 3,
};

const PRICE = { 1: 20, 2: 35, 3: 50, 4: 80 } as const;

/** What a pet costs at the casino shop, in dollars. */
export const petPrice = (pet: PetId | string): number => PRICE[TIER[pet] ?? 3];

export const petName = (pet: PetId | string) => PETS.find((p) => p.id === pet)?.name ?? 'that pet';

/** The shop's shelves: every pet, cheapest first. */
export const shopPets = () => [...PETS].sort((a, b) => petPrice(a.id) - petPrice(b.id) || a.name.localeCompare(b.name));
