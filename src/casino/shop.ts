import { DANCES, HATS, PETS, type Anim, type HatId, type PetId } from '../world/types';
import { GRAVES, STOOLS } from '../world/stoolShop';

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
  piglet: 1,
  noodle: 1,
  porg: 1,
  crab: 1,
  rooster: 1,
  headache: 1,
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
  gecko: 2,
  golem: 2,
  pengling: 2,
  cockatoo: 2,
  scorpion: 2,
  lasagne: 2,
  fluff: 2,
  squirt: 2,
  bulbtoad: 2,
  teddy: 2,
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
  puffdragon: 3,
  raven: 3,
  tinyrex: 3,
  doghouse: 3,
  lullaby: 3,
  flametail: 3,
  raccoon: 3,
  // The grandest.
  astrodroid: 4,
  dragon: 4,
  luckdragon: 4,
  skybison: 4,
  ent: 4,
  snowman: 4,
  luckyfin: 4,
  // The fifth set: little ones cheap, special ones dear.
  fairy: 1,
  cactus: 1,
  bean: 1,
  hedgehog: 2,
  chomper: 2,
  moogle: 2,
  platypus: 2,
  dug: 2,
  nursebot: 3,
  eggprobe: 3,
  turret: 3,
  faceless: 3,
  hearth: 3,
  niffler: 3,
  catbus: 4,
};

const PRICE = { 1: 20, 2: 35, 3: 50, 4: 80 } as const;

/** What a pet costs at the casino shop, in dollars. */
export const petPrice = (pet: PetId | string): number => PRICE[TIER[pet] ?? 3];

export const petName = (pet: PetId | string) => PETS.find((p) => p.id === pet)?.name ?? 'that pet';

/** The shop's shelves: every pet, cheapest first. */
export const shopPets = () => [...PETS].sort((a, b) => petPrice(a.id) - petPrice(b.id) || a.name.localeCompare(b.name));

// ---------------------------------------------------------------- hats and dances

/** The hats on sale (cheapest first, the trophy last) and the dances. Prices are in HATS and DANCES (world/types.ts). */
export const shopHats = () => HATS.filter((h) => h.price).sort((a, b) => a.price! - b.price!);
export const shopDances = () => DANCES.filter((d) => d.price).sort((a, b) => a.price! - b.price!);

/** Something on sale besides pets, by its key ('hat:topper', 'dance:worm'): what it is, its name and its price. */
export function wareOf(key: string): { kind: 'hat' | 'dance' | 'stool' | 'grave'; id: string; name: string; price: number } | null {
  const [kind, id] = key.split(':');
  if (kind === 'hat') {
    const h = HATS.find((x) => x.id === id && x.price);
    return h ? { kind, id: h.id, name: h.name, price: h.price! } : null;
  }
  if (kind === 'dance') {
    const d = DANCES.find((x) => x.anim === id && x.price);
    return d ? { kind, id: d.anim, name: d.label, price: d.price! } : null;
  }
  // A design for your stool round the dais, or for your gravestone.
  if (kind === 'stool' || kind === 'grave') {
    const w = (kind === 'stool' ? STOOLS : GRAVES).find((x) => x.id === id);
    return w ? { kind, id: w.id, name: w.name, price: w.price } : null;
  }
  return null;
}
export const hatKey = (hat: HatId) => `hat:${hat}`;
export const danceKey = (anim: Anim) => `dance:${anim}`;
/** A hat that's bought, not earned. */
export const isShopHat = (hat: string | null | undefined) => Boolean(hat && HATS.some((h) => h.id === hat && h.price));

/** What the player's told once something's theirs. */
export function boughtNote(ware: NonNullable<ReturnType<typeof wareOf>>): string {
  if (ware.kind === 'hat') return `${ware.name}: yours! Wear it from here or from Customise.`;
  if (ware.kind === 'stool') return `${ware.name}: yours! Sit on it from here or from Customise.`;
  if (ware.kind === 'grave') return `${ware.name}: yours! Choose it from here or from Customise.`;
  return `${ware.name}: yours! It’s in your Dances now.`;
}
