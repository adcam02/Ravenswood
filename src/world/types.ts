/**
 * The shared vocabulary of the 3D town: animals, what they hold, the places you can be, and the
 * things players leave around town (drinks on the bar, washing on the line, flowers in the beds).
 * Plain data only, so the game state and network messages can use it without pulling in three.js.
 */

// ---------------------------------------------------------------- animals

export type AnimalId =
  | 'wolf'
  | 'fox'
  | 'bear'
  | 'cat'
  | 'dog'
  | 'pig'
  | 'mouse'
  | 'raccoon'
  | 'deer'
  | 'owl'
  | 'koala'
  | 'hedgehog'
  | 'sheep'
  | 'panda'
  | 'penguin'
  | 'otter'
  | 'frog'
  | 'axolotl'
  | 'shark'
  | 'octopus'
  | 'duck'
  | 'platypus'
  | 'capybara'
  | 'redpanda'
  | 'quokka'
  | 'sloth'
  | 'seal'
  | 'puffin'
  | 'snail'
  | 'fennec'
  | 'chinchilla'
  | 'highland'
  | 'bunny';

export interface AnimalInfo {
  id: AnimalId;
  name: string;
  /** Aquatic animals are glossy and drip a little. */
  aquatic: boolean;
  /** Colour choices for the main coat, natural ones first. The first is the default. */
  colors: string[];
  /** Only one person may be this animal (the bunny is Jarrod's). */
  reservedFor?: string;
}

/** Colours offered for every animal after its natural ones. */
export const EXTRA_COLORS = [
  '#f4efe6', // snow
  '#e8d3a9', // cream
  '#c89b62', // tan
  '#8a5a36', // brown
  '#4d3528', // chocolate
  '#9aa0a8', // grey
  '#3d3f47', // charcoal
  '#e58a3a', // ginger
  '#f2a7b8', // pink
  '#8fc1e8', // sky
  '#7cc28b', // mint
  '#b494dd', // lilac
  '#f2cf5b', // butter
];

export const ANIMALS: AnimalInfo[] = [
  { id: 'wolf', name: 'Wolf', aquatic: false, colors: ['#8d929c', '#5d6069', '#d9d4cc'] },
  { id: 'fox', name: 'Fox', aquatic: false, colors: ['#e2793a', '#c2502c', '#f0e6da'] },
  { id: 'bear', name: 'Bear', aquatic: false, colors: ['#8a5a36', '#4d3528', '#f4efe6'] },
  { id: 'cat', name: 'Cat', aquatic: false, colors: ['#e8a252', '#3d3f47', '#f4efe6'] },
  { id: 'dog', name: 'Dog', aquatic: false, colors: ['#d9a560', '#8a5a36', '#f4efe6'] },
  { id: 'pig', name: 'Pig', aquatic: false, colors: ['#f2a7b8', '#e5c3a8', '#8a6a5a'] },
  { id: 'mouse', name: 'Mouse', aquatic: false, colors: ['#a7a2a0', '#d8c3a5', '#f4efe6'] },
  { id: 'raccoon', name: 'Raccoon', aquatic: false, colors: ['#8a8c94', '#6b625a', '#b8b2aa'] },
  { id: 'deer', name: 'Deer', aquatic: false, colors: ['#c08552', '#9a6a44', '#e2c9a6'] },
  { id: 'owl', name: 'Owl', aquatic: false, colors: ['#9b7653', '#d8c8b0', '#6d6f78'] },
  { id: 'koala', name: 'Koala', aquatic: false, colors: ['#9ea3ab', '#7d828b', '#c9c4bd'] },
  { id: 'hedgehog', name: 'Hedgehog', aquatic: false, colors: ['#7a5a40', '#a88466', '#4a3a30'] },
  { id: 'sheep', name: 'Sheep', aquatic: false, colors: ['#f4efe6', '#3d3f47', '#e8d3a9'] },
  { id: 'panda', name: 'Panda', aquatic: false, colors: ['#f4efe6', '#e8d3a9', '#f2a7b8'] },
  { id: 'penguin', name: 'Penguin', aquatic: true, colors: ['#2e3340', '#3c5a8a', '#6d6f78'] },
  { id: 'otter', name: 'Otter', aquatic: true, colors: ['#7a5236', '#5a3d2a', '#a57a55'] },
  { id: 'frog', name: 'Frog', aquatic: true, colors: ['#6fbf5a', '#3f8f4a', '#d8c84a'] },
  { id: 'axolotl', name: 'Axolotl', aquatic: true, colors: ['#f4a9c0', '#f2e2d8', '#8a7aa8'] },
  { id: 'shark', name: 'Shark', aquatic: true, colors: ['#7d93a8', '#5a6e82', '#9aa0a8'] },
  { id: 'octopus', name: 'Octopus', aquatic: true, colors: ['#c45a7a', '#8a5ab0', '#e2793a'] },
  { id: 'duck', name: 'Duck', aquatic: true, colors: ['#f6d55c', '#f4efe6', '#8a6a4a'] },
  { id: 'platypus', name: 'Platypus', aquatic: true, colors: ['#7a5638', '#5a4030', '#9a7454'] },
  { id: 'capybara', name: 'Capybara', aquatic: false, colors: ['#a97c50', '#8b6a45', '#c49a6c'] },
  { id: 'redpanda', name: 'Red Panda', aquatic: false, colors: ['#c8532e', '#a8402a', '#e07a3a'] },
  { id: 'quokka', name: 'Quokka', aquatic: false, colors: ['#9a8a70', '#b8a080', '#6a5a48'] },
  { id: 'sloth', name: 'Sloth', aquatic: false, colors: ['#b89c7a', '#9a8268', '#d8c4a4'] },
  { id: 'seal', name: 'Seal', aquatic: true, colors: ['#8a9aa6', '#6a7682', '#e8e4dc'] },
  { id: 'puffin', name: 'Puffin', aquatic: true, colors: ['#2e2e36', '#4a4a58', '#f4efe6'] },
  { id: 'snail', name: 'Snail', aquatic: false, colors: ['#c8853a', '#8a5ab0', '#5fae55', '#e0605a'] },
  { id: 'fennec', name: 'Fennec Fox', aquatic: false, colors: ['#e3c89a', '#d4b07a', '#f4efe6'] },
  { id: 'chinchilla', name: 'Chinchilla', aquatic: false, colors: ['#9aa0a8', '#6d6f78', '#e8d3a9'] },
  { id: 'highland', name: 'Highland Cow', aquatic: false, colors: ['#c47a3a', '#3d3f47', '#e8d3a9'] },
  { id: 'bunny', name: 'Bunny', aquatic: false, colors: ['#f4efe6', '#c89b62', '#9aa0a8', '#f2a7b8'], reservedFor: 'jarrod' },
];

export const animalInfo = (id: AnimalId | string | null | undefined): AnimalInfo =>
  ANIMALS.find((a) => a.id === id) ?? ANIMALS[0];

export interface Look {
  animal: AnimalId;
  /** The main coat colour, as a hex string. */
  color: string;
}

/** Jarrod is always the bunny, and nobody else can be. */
export function isJarrod(name: string): boolean {
  return name.trim().toLowerCase() === 'jarrod';
}

export function fixLook(name: string, look: Partial<Look> | null | undefined): Look {
  if (isJarrod(name)) {
    const color = look?.animal === 'bunny' && look.color ? look.color : animalInfo('bunny').colors[0];
    return { animal: 'bunny', color };
  }
  const info = ANIMALS.find((a) => a.id === look?.animal && !a.reservedFor) ?? ANIMALS[0];
  const color = /^#[0-9a-f]{6}$/i.test(look?.color ?? '') ? look!.color! : info.colors[0];
  return { animal: info.id, color };
}

// ---------------------------------------------------------------- what an animal is doing

export type Anim =
  | 'idle'
  | 'walk'
  | 'run'
  | 'sit'
  | 'sleep'
  | 'wave'
  | 'dance'
  | 'cheer'
  | 'laugh'
  | 'cry'
  /** A paw in the air, for votes. */
  | 'hand'
  /** Busy with both paws in front: pouring, scrubbing, kneading. */
  | 'work'
  /** Holding a fishing rod out over the water. */
  | 'fish'
  /** Tipping a watering can. */
  | 'water'
  /** A sip from whatever is in the right paw. */
  | 'drink';

export const EMOTES: { anim: Anim; label: string; key: string }[] = [
  { anim: 'wave', label: 'Wave', key: '1' },
  { anim: 'dance', label: 'Dance', key: '2' },
  { anim: 'cheer', label: 'Cheer', key: '3' },
  { anim: 'laugh', label: 'Laugh', key: '4' },
  { anim: 'cry', label: 'Cry', key: '5' },
  { anim: 'sit', label: 'Sit', key: '6' },
];

export type DrinkKind = 'ale' | 'cider' | 'milk' | 'cocoa';
export type BakeKind = 'loaf' | 'pie' | 'bun';
export type ClothKind = 'shirt' | 'sock' | 'dress' | 'towel' | 'pants';
export type FlowerKind = 'tulip' | 'daisy' | 'sunflower' | 'rose';

/** Something held in the right paw. The grimoire is the Storyteller's; `c: 'open'` while they read it. */
export type ItemKind = DrinkKind | BakeKind | 'fish' | 'flower' | 'rod' | 'can' | 'washing' | 'grimoire' | 'water';

export interface Item {
  k: ItemKind;
  /** A colour, for flowers and washing. */
  c?: string;
}

// ---------------------------------------------------------------- places

/** Every place has its own coordinates. Interiors are centred on 0,0. */
export type ZoneKind = 'town' | 'tavern' | 'bakery' | 'church' | 'house';

/** 'town', 'tavern', 'bakery', 'church', 'house:<seatId>' for someone's bedroom, or 'cottage:<n>' for a cottage in town. */
export type ZoneId = string;

export function zoneKind(zone: ZoneId): ZoneKind {
  if (zone.startsWith('house:') || zone.startsWith('cottage:')) return 'house';
  if (zone === 'tavern' || zone === 'bakery' || zone === 'church') return zone;
  return 'town';
}

export const houseZone = (seatId: string): ZoneId => `house:${seatId}`;
export const cottageZone = (slot: number): ZoneId => `cottage:${slot}`;
export const cottageSlot = (zone: ZoneId): number | null => (zone.startsWith('cottage:') ? Number(zone.slice(8)) : null);
export const houseOwner = (zone: ZoneId): string | null => (zone.startsWith('house:') ? zone.slice(6) : null);

export type Collider =
  | { kind: 'box'; x: number; z: number; hw: number; hd: number; rot: number }
  | { kind: 'circle'; x: number; z: number; r: number };

export interface Spot {
  x: number;
  z: number;
  /** Facing, in radians, where 0 looks towards +z. */
  ry: number;
}

export interface Door {
  id: string;
  zone: ZoneKind;
  x: number;
  z: number;
  r: number;
  /** Where it leads. 'house' doors lead to the home of whoever lives in `slot`. */
  to: ZoneKind;
  /** For house doors outside: which house. */
  slot?: number;
  /** Where you appear on the other side. */
  spawn: Spot;
  label: string;
}

export type JobId = 'bartender' | 'laundry' | 'fishing' | 'baking' | 'gardening' | 'takeDrink' | 'takeBread' | 'sleep' | 'sit' | 'well' | 'notice';

export interface Station {
  id: string;
  zone: ZoneKind;
  x: number;
  z: number;
  /** How close you need to be to use it. */
  r: number;
  job: JobId;
  /** Where to stand and face while using it. */
  stand: Spot;
  /** Seat height for 'sit' and 'sleep' stations. */
  y?: number;
  /** For gardening: which flower bed. */
  bed?: number;
  label: string;
}

// ---------------------------------------------------------------- things left around town

export const COUNTER_SPOTS = 6;
export const LINES = 2;
export const LINE_SLOTS = 8;
export const BEDS = 4;
export const BED_SPOTS = 6;
export const SHELF_SLOTS = 8;

export interface TownState {
  /** Drinks poured and waiting on the bar. */
  drinks: { id: string; kind: DrinkKind; stars: number; by: string; spot: number }[];
  /** Washing hung out to dry. */
  clothes: { id: string; kind: ClothKind; color: string; by: string; line: number; slot: number }[];
  /** Flowers in the beds around the square; they grow for a minute after `at`. */
  flowers: { id: string; bed: number; spot: number; kind: FlowerKind; color: string; by: string; at: number }[];
  /** Fresh bakes on the bakery shelf. */
  loaves: { id: string; kind: BakeKind; stars: number; by: string; slot: number }[];
  /** Recent catches, newest last. */
  fish: { by: string; kind: string; cm: number; at: number }[];
}

export const emptyTown = (): TownState => ({ drinks: [], clothes: [], flowers: [], loaves: [], fish: [] });

// ---------------------------------------------------------------- where everyone is

/**
 * One avatar's state on the wire: [x, z, ry, zone, anim, item, speaking, voiceId].
 * Sent about ten times a second while moving.
 */
export type Pose = [number, number, number, ZoneId, Anim, Item | null, boolean, string | null];

export interface PoseState {
  x: number;
  z: number;
  ry: number;
  zone: ZoneId;
  anim: Anim;
  item: Item | null;
  speaking: boolean;
  voiceId: string | null;
}

export const toPose = (p: PoseState): Pose => [
  Math.round(p.x * 100) / 100,
  Math.round(p.z * 100) / 100,
  Math.round(p.ry * 100) / 100,
  p.zone,
  p.anim,
  p.item,
  p.speaking,
  p.voiceId,
];

export const fromPose = (p: Pose): PoseState => ({
  x: Number(p[0]) || 0,
  z: Number(p[1]) || 0,
  ry: Number(p[2]) || 0,
  zone: typeof p[3] === 'string' ? p[3].slice(0, 60) : 'town',
  anim: (typeof p[4] === 'string' ? p[4] : 'idle') as Anim,
  item: p[5] && typeof p[5] === 'object' && typeof p[5].k === 'string' ? { k: p[5].k, c: typeof p[5].c === 'string' ? p[5].c.slice(0, 9) : undefined } : null,
  speaking: Boolean(p[6]),
  voiceId: typeof p[7] === 'string' ? p[7].slice(0, 80) : null,
});
