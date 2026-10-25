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
  | 'raccoon'
  | 'deer'
  | 'hedgehog'
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
  | 'snail'
  | 'highland'
  | 'squid'
  | 'bat'
  | 'jellyfish'
  | 'gecko'
  | 'ferret'
  | 'dugong'
  | 'seacucumber'
  | 'ibis'
  | 'crab'
  | 'turtle'
  | 'kaiju'
  | 'robot'
  | 'homunculus'
  | 'fungi'
  | 'dragon'
  | 'bee'
  | 'chameleon'
  | 'whaleshark'
  | 'prawn'
  | 'meerkat'
  | 'skeleton';

export interface AnimalInfo {
  id: AnimalId;
  name: string;
  /** Aquatic animals are glossy. */
  aquatic: boolean;
  /** Colour choices for the main coat, natural ones first. The first is the default. */
  colors: string[];
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
  { id: 'raccoon', name: 'Raccoon', aquatic: false, colors: ['#8a8c94', '#6b625a', '#b8b2aa'] },
  { id: 'deer', name: 'Deer', aquatic: false, colors: ['#c08552', '#9a6a44', '#e2c9a6'] },
  { id: 'hedgehog', name: 'Hedgehog', aquatic: false, colors: ['#7a5a40', '#a88466', '#4a3a30'] },
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
  { id: 'snail', name: 'Snail', aquatic: false, colors: ['#c8853a', '#8a5ab0', '#5fae55', '#e0605a'] },
  { id: 'highland', name: 'Highland Cow', aquatic: false, colors: ['#c47a3a', '#3d3f47', '#e8d3a9'] },
  { id: 'squid', name: 'Squid', aquatic: true, colors: ['#e07a6a', '#8a5ab0', '#3fa8a0', '#f2e2d8'] },
  { id: 'bat', name: 'Bat', aquatic: false, colors: ['#4a3f55', '#2e2a34', '#8a5a36', '#c9b8a0'] },
  { id: 'jellyfish', name: 'Jellyfish', aquatic: true, colors: ['#f4a9c0', '#8ad0f0', '#b494dd', '#f6d55c'] },
  { id: 'gecko', name: 'Gecko', aquatic: false, colors: ['#f2c14e', '#6fbf5a', '#f08a3a', '#b494dd'] },
  { id: 'ferret', name: 'Ferret', aquatic: false, colors: ['#dcc49a', '#b88a5a', '#f4efe6', '#8a6a4a'] },
  { id: 'dugong', name: 'Dugong', aquatic: true, colors: ['#9a8f86', '#7d7a78', '#b8aea2'] },
  { id: 'seacucumber', name: 'Sea Cucumber', aquatic: true, colors: ['#8a4a3a', '#e8a04a', '#6a4a7a', '#4a5a3a'] },
  { id: 'ibis', name: 'Ibis', aquatic: false, colors: ['#f2efe8', '#e6dccb', '#d8c8ae'] },
  { id: 'crab', name: 'Crab', aquatic: true, colors: ['#e0563a', '#e8843a', '#4a6a8a', '#8a5a3a'] },
  { id: 'turtle', name: 'Turtle', aquatic: true, colors: ['#7a7a3a', '#8a6238', '#4f7a6a'] },
  { id: 'kaiju', name: 'Kaiju', aquatic: false, colors: ['#5d7a5a', '#4a4f55', '#3f7a7a', '#6a5a8a'] },
  { id: 'robot', name: 'Little Robot', aquatic: false, colors: ['#3f9c98', '#b4ada2', '#d4543e', '#dca33a'] },
  { id: 'homunculus', name: 'Homunculus', aquatic: false, colors: ['#e3a48c', '#b9856a', '#8e6250', '#b4cc98'] },
  { id: 'fungi', name: 'Fungi', aquatic: false, colors: ['#d4402f', '#9a6a44', '#8a5ab0', '#3f9ee6'] },
  { id: 'dragon', name: 'Pudgy Dragon', aquatic: false, colors: ['#74b45a', '#d65a4a', '#9468c4', '#e6b04a'] },
  { id: 'bee', name: 'Bee', aquatic: false, colors: ['#f4c230', '#ee9c38', '#f2df96'] },
  { id: 'chameleon', name: 'Chameleon', aquatic: false, colors: ['#76b84a', '#3ea89e', '#e2803c', '#5a86d0'] },
  { id: 'whaleshark', name: 'Whale Shark', aquatic: true, colors: ['#5f7f99', '#34476b', '#3f7f88', '#a59d8c'] },
  { id: 'prawn', name: 'Prawn', aquatic: true, colors: ['#f2906e', '#a9b9c6', '#f0705a', '#e8b448'] },
  { id: 'meerkat', name: 'Meerkat', aquatic: false, colors: ['#c79d68', '#a8845c', '#dcc093', '#9c8b73'] },
  { id: 'skeleton', name: 'Skeleton', aquatic: false, colors: ['#efe8d6', '#e2d3b0', '#d6e2e6', '#d4e8c4'] },
];

export const animalInfo = (id: AnimalId | string | null | undefined): AnimalInfo =>
  ANIMALS.find((a) => a.id === id) ?? ANIMALS[0];

/** The animals in alphabetical order of their names, the way players see them to choose from. */
export const ANIMALS_ABC: AnimalInfo[] = [...ANIMALS].sort((a, b) => a.name.localeCompare(b.name));

export interface Look {
  animal: AnimalId;
  /** The main coat colour, as a hex string. */
  color: string;
  /** A hat earned in earlier games, worn on the head. */
  hat?: HatId | null;
  /** A pet that trots along beside them. */
  pet?: PetId | null;
}

// ---------------------------------------------------------------- pets, bought at the casino (see casino/shop.ts)

export type PetId =
  | 'chick' | 'slime' | 'ghost' | 'mouse' | 'bee' | 'snail'
  // Fond storybook takes on pop culture favourites.
  | 'zapmouse' | 'sage' | 'spirit' | 'soot' | 'rascal' | 'sprout' | 'henchling' | 'arcade'
  | 'puffball' | 'cube' | 'creepling' | 'balldroid' | 'astrodroid' | 'tidybot' | 'dragon'
  // A second set.
  | 'owl' | 'poptart' | 'doge' | 'grumpy' | 'duck' | 'pocketpal' | 'shroom' | 'kweh'
  | 'mogwai' | 'clip' | 'tribble' | 'luckdragon' | 'skybison' | 'volleyball' | 'feedme'
  // Storybook critters from the players' own wish list.
  | 'gecko' | 'golem' | 'pengling' | 'puffdragon' | 'cockatoo' | 'ent' | 'piglet' | 'noodle'
  | 'raven' | 'scorpion' | 'tinyrex'
  // A third set of pop-culture favourites (pets4.ts).
  | 'doghouse' | 'lasagne' | 'lullaby' | 'bulbtoad' | 'flametail' | 'squirt' | 'fluff' | 'headache'
  | 'teddy' | 'porg' | 'snowman' | 'crab' | 'luckyfin' | 'rooster' | 'raccoon'
  // A fifth set (pets5.ts).
  | 'eggprobe' | 'nursebot' | 'hedgehog' | 'chomper' | 'fairy' | 'moogle' | 'cactus' | 'bean'
  | 'turret' | 'catbus' | 'faceless' | 'hearth' | 'niffler' | 'platypus' | 'dug';

export const PETS: { id: PetId; name: string; icon: string }[] = [
  { id: 'chick', name: 'Chick', icon: '🐤' },
  { id: 'slime', name: 'Slime', icon: '🟢' },
  { id: 'ghost', name: 'Little ghost', icon: '👻' },
  { id: 'mouse', name: 'Mouse', icon: '🐭' },
  { id: 'bee', name: 'Bee', icon: '🐝' },
  { id: 'snail', name: 'Tiny snail', icon: '🐌' },
  { id: 'zapmouse', name: 'Sparky', icon: '⚡' },
  { id: 'sage', name: 'Little Sage', icon: '👽' },
  { id: 'spirit', name: 'Forest Spirit', icon: '🍃' },
  { id: 'soot', name: 'Soot Sprite', icon: '⚫' },
  { id: 'rascal', name: 'Blue Rascal', icon: '🌺' },
  { id: 'sprout', name: 'I Am Sprout', icon: '🌱' },
  { id: 'henchling', name: 'Henchling', icon: '🍌' },
  { id: 'arcade', name: 'Arcade Ghost', icon: '🕹️' },
  { id: 'puffball', name: 'Puffball', icon: '🌸' },
  { id: 'cube', name: 'Cuddle Cube', icon: '💟' },
  { id: 'creepling', name: 'Creepling', icon: '🟩' },
  { id: 'balldroid', name: 'Rolly Droid', icon: '🟠' },
  { id: 'astrodroid', name: 'Astro Droid', icon: '🔵' },
  { id: 'tidybot', name: 'Tidy Bot', icon: '🤖' },
  { id: 'dragon', name: 'Gummy Dragon', icon: '🐉' },
  { id: 'owl', name: 'Post owl', icon: '🦉' },
  { id: 'poptart', name: 'Pop-tart cat', icon: '🌈' },
  { id: 'doge', name: 'Such doge', icon: '🐕' },
  { id: 'grumpy', name: 'Grumpy cat', icon: '😾' },
  { id: 'duck', name: 'Squeaky duck', icon: '🦆' },
  { id: 'pocketpal', name: 'Pocket pal', icon: '🥚' },
  { id: 'shroom', name: 'Stompy shroom', icon: '🍄' },
  { id: 'kweh', name: 'Kweh chick', icon: '🐥' },
  { id: 'mogwai', name: 'Mogwai', icon: '🐹' },
  { id: 'clip', name: 'Paperclip pal', icon: '📎' },
  { id: 'tribble', name: 'Tribble', icon: '🟤' },
  { id: 'luckdragon', name: 'Luck dragon', icon: '🐉' },
  { id: 'skybison', name: 'Sky bison', icon: '🦬' },
  { id: 'volleyball', name: 'Castaway ball', icon: '🏐' },
  { id: 'feedme', name: 'Feed-me plant', icon: '🪴' },
  { id: 'gecko', name: 'Push-up gecko', icon: '🦎' },
  { id: 'golem', name: 'Pebble golem', icon: '🪨' },
  { id: 'pengling', name: 'Slidey penguin', icon: '🐧' },
  { id: 'puffdragon', name: 'Dumpling dragon', icon: '🐲' },
  { id: 'cockatoo', name: 'Head-bob cockatoo', icon: '🦜' },
  { id: 'ent', name: 'Old Oakbeard', icon: '🌳' },
  { id: 'piglet', name: 'Truffle piglet', icon: '🐷' },
  { id: 'noodle', name: 'Noodle snake', icon: '🐍' },
  { id: 'raven', name: 'Nevermore', icon: '🐦‍⬛' },
  { id: 'scorpion', name: 'Snippy scorpion', icon: '🦂' },
  { id: 'tinyrex', name: 'Tiny rex', icon: '🦖' },
  { id: 'doghouse', name: 'Doghouse beagle', icon: '🐶' },
  { id: 'lasagne', name: 'Lasagne cat', icon: '🐈' },
  { id: 'lullaby', name: 'Lullaby puff', icon: '🎤' },
  { id: 'bulbtoad', name: 'Bulb toad', icon: '🌷' },
  { id: 'flametail', name: 'Flame-tail', icon: '🔥' },
  { id: 'squirt', name: 'Squirt turtle', icon: '🐢' },
  { id: 'fluff', name: 'Fluff fox', icon: '🦊' },
  { id: 'headache', name: 'Headache duck', icon: '🤕' },
  { id: 'teddy', name: 'Forest teddy', icon: '🐻' },
  { id: 'porg', name: 'Porgling', icon: '🐦' },
  { id: 'snowman', name: 'Summer snowman', icon: '⛄' },
  { id: 'crab', name: 'Calypso crab', icon: '🦀' },
  { id: 'luckyfin', name: 'Lucky fin', icon: '🐠' },
  { id: 'rooster', name: 'Derpy rooster', icon: '🐓' },
  { id: 'raccoon', name: 'Space raccoon', icon: '🦝' },
  { id: 'eggprobe', name: 'Egg probe', icon: '🛰️' },
  { id: 'nursebot', name: 'Huggy nurse bot', icon: '🩹' },
  { id: 'hedgehog', name: 'Speedy hedgehog', icon: '🦔' },
  { id: 'chomper', name: 'Chain chomper', icon: '⛓️' },
  { id: 'fairy', name: 'Hey-listen fairy', icon: '🧚' },
  { id: 'moogle', name: 'Kupo moogle', icon: '🎈' },
  { id: 'cactus', name: 'Sprinting cactus', icon: '🌵' },
  { id: 'bean', name: 'Sus bean', icon: '🧑‍🚀' },
  { id: 'turret', name: 'Turret pal', icon: '🎯' },
  { id: 'catbus', name: 'Cat bus', icon: '🚌' },
  { id: 'faceless', name: 'Faceless spirit', icon: '🎭' },
  { id: 'hearth', name: 'Hearth fire', icon: '🔥' },
  { id: 'niffler', name: 'Shiny snatcher', icon: '🪙' },
  { id: 'platypus', name: 'Agent platypus', icon: '🕵️' },
  { id: 'dug', name: 'Squirrel! dog', icon: '🦮' },
];

const pickFrom = <T extends string>(list: { id: T }[], v: unknown): T | null => (list.some((x) => x.id === v) ? (v as T) : null);
/** Keeps only a known pet (anything else an older page sends, like the face, neck and back pieces there once were, goes). */
export function fixDressUp(look: Partial<Look> | null | undefined): Pick<Look, 'pet'> {
  return { pet: pickFrom(PETS, look?.pet) };
}

// ---------------------------------------------------------------- hats, earned and kept between games

export type HatId =
  | 'beanie'
  | 'flower'
  | 'party'
  | 'wizard'
  | 'tophat'
  | 'crown'
  | 'halo'
  | 'witch'
  // One for each of the jobs around town, for doing it perfectly.
  | 'lumberjack'
  | 'souwester'
  | 'mitre'
  | 'chef'
  | 'bowler'
  | 'sunhat'
  | 'headscarf'
  | 'feathercap'
  | 'sailor'
  | 'leprechaun'
  | 'clockmaker'
  // Earned with achievements (some of them secret).
  | 'propeller'
  | 'reaper'
  | 'horns'
  | 'laurel'
  | 'tricorn'
  | 'toadstool'
  | 'headband'
  | 'candle'
  | 'postie'
  | 'jester'
  // Pop-culture hats (how each is earned is still to come).
  | 'fez'
  | 'deerstalker'
  | 'tinfoil'
  | 'trainer'
  | 'madhatter'
  | 'cowboy'
  | 'robot'
  | 'cone'
  | 'mortarboard'
  | 'pumpkin'
  // More pop-culture hats, each with an achievement of its own.
  | 'viking'
  | 'sombrero'
  | 'beret'
  | 'astronaut'
  | 'ushanka'
  | 'santa'
  | 'catears'
  | 'ninja'
  | 'knight'
  | 'gnome'
  | 'fedora'
  | 'unicorn'
  // Bought at the Lucky Raven's shop, and the trophy (very dear, for showing off).
  | 'bearskin'
  | 'bicorne'
  | 'hardhat'
  | 'beerhat'
  | 'reindeer'
  | 'tiara'
  | 'birthday'
  | 'centurion'
  | 'topper'
  | 'sharkhat'
  | 'trophy';

/** What a player has done across all their games, kept by the Storyteller under their name. */
export interface Progress {
  stars: number;
  records: number;
  ghosts: number;
  nights: number;
  /** The jobs they've done perfectly at least once (by job id). */
  perfect: string[];
  /** Achievements earned (by id, see FEATS). */
  feats: string[];
  /** Things bought at the shop, by key: 'hat:topper', 'dance:worm' (see owns). */
  items?: string[];
}

/** Whether a player has bought something (a key like 'hat:topper' or 'dance:worm'). */
export const owns = (p: { items?: string[] }, key: string) => Boolean(p.items?.includes(key));
const bought = (hat: HatId) => (p: Progress) => owns(p, `hat:${hat}`);

const did = (p: Progress, ...jobs: string[]) => jobs.some((j) => p.perfect.includes(j));
const got = (p: Progress, feat: FeatId) => p.feats.includes(feat);

/** A hat with a `price` is bought at the Lucky Raven's shop rather than earned. */
export const HATS: { id: HatId; name: string; icon: string; how: string; unlocked: (p: Progress) => boolean; secret?: boolean; price?: number }[] = [
  { id: 'beanie', name: 'Beanie', icon: '🧶', how: 'Free for everyone', unlocked: () => true },
  { id: 'flower', name: 'Flower crown', icon: '🌸', how: 'Earn a gold star counting sheep', unlocked: (p) => p.stars >= 1 },
  { id: 'party', name: 'Party hat', icon: '🥳', how: 'Earn 3 gold stars', unlocked: (p) => p.stars >= 3 },
  { id: 'witch', name: 'Witch hat', icon: '🧹', how: 'Sleep through 10 nights', unlocked: (p) => p.nights >= 10 },
  { id: 'wizard', name: 'Wizard hat', icon: '🧙', how: 'Earn 5 gold stars', unlocked: (p) => p.stars >= 5 },
  { id: 'tophat', name: 'Top hat', icon: '🎩', how: 'Set a town record at any job', unlocked: (p) => p.records >= 1 },
  { id: 'halo', name: 'Halo', icon: '😇', how: 'Walk the town as a ghost', unlocked: (p) => p.ghosts >= 1 },
  { id: 'crown', name: 'Crown', icon: '👑', how: 'Earn 10 gold stars', unlocked: (p) => p.stars >= 10 },
  { id: 'lumberjack', name: 'Lumberjack beanie', icon: '🪓', how: 'Split all five logs cleanly chopping wood', unlocked: (p) => did(p, 'firewood') },
  { id: 'souwester', name: 'Fisherman’s sou’wester', icon: '🎣', how: 'Land a three-star catch fishing', unlocked: (p) => did(p, 'fishing') },
  { id: 'mitre', name: 'Pope’s mitre', icon: '⛪', how: 'Get three stars breaking bread or pouring the wine at church', unlocked: (p) => did(p, 'bread', 'wine') },
  { id: 'chef', name: 'Chef’s hat', icon: '🥖', how: 'Bake something worth three stars', unlocked: (p) => did(p, 'baking') },
  { id: 'bowler', name: 'Bowler hat', icon: '🍺', how: 'Pour a three-star drink behind the bar', unlocked: (p) => did(p, 'bartender') },
  { id: 'sunhat', name: 'Straw sun hat', icon: '🌻', how: 'Plant a three-star flower', unlocked: (p) => did(p, 'gardening') },
  { id: 'headscarf', name: 'Polka-dot headscarf', icon: '🧺', how: 'Do a three-star wash at the laundry', unlocked: (p) => did(p, 'laundry') },
  { id: 'feathercap', name: 'Feathered cap', icon: '🎯', how: 'Score three stars at darts', unlocked: (p) => did(p, 'darts') },
  { id: 'sailor', name: 'Sailor’s cap', icon: '⚓', how: 'Get three stars skimming stones', unlocked: (p) => did(p, 'skimming') },
  { id: 'leprechaun', name: 'Leprechaun hat', icon: '🍀', how: 'Make a wish at the wishing well', unlocked: (p) => did(p, 'coin') },
  { id: 'clockmaker', name: 'Clockmaker’s cap', icon: '🕰️', how: 'Get three stars keeping time in the clock tower', unlocked: (p) => did(p, 'clock') },
  { id: 'laurel', name: 'Laurel wreath', icon: '🌿', how: 'Win a game on the good team', unlocked: (p) => got(p, 'goodwin') },
  { id: 'horns', name: 'Devil horns', icon: '😈', how: 'Win a game on the evil team', unlocked: (p) => got(p, 'evilwin') },
  { id: 'tricorn', name: 'Pirate’s tricorn', icon: '🏴‍☠️', how: 'Catch 10 fish', unlocked: (p) => got(p, 'angler') },
  { id: 'headband', name: 'Jogger’s headband', icon: '🏃', how: 'Run a whole lap of the ring road without stopping', unlocked: (p) => got(p, 'lap') },
  { id: 'candle', name: 'Confessor’s candle', icon: '🕯️', how: 'Talk with someone through the confession booth', unlocked: (p) => got(p, 'confess') },
  { id: 'postie', name: 'Postie’s cap', icon: '✉️', how: 'Post 5 letters', unlocked: (p) => got(p, 'postie') },
  { id: 'propeller', name: 'Propeller beanie', icon: '🚁', how: '↑ ↑ ↓ ↓ ← → ← → B A', unlocked: (p) => got(p, 'konami'), secret: true },
  { id: 'reaper', name: 'Reaper’s hood', icon: '💀', how: 'Have a visitor in the night', unlocked: (p) => got(p, 'visited'), secret: true },
  { id: 'toadstool', name: 'Toadstool cap', icon: '🍄', how: 'Find the fairy ring', unlocked: (p) => got(p, 'fairyring'), secret: true },
  { id: 'jester', name: 'Jester’s cap', icon: '🃏', how: 'Spin round and round and round', unlocked: (p) => got(p, 'dizzy'), secret: true },
  { id: 'fez', name: 'Fez', icon: '🕰️', how: 'Be inside the clock tower when the bell rings', unlocked: (p) => got(p, 'fez'), secret: true },
  { id: 'deerstalker', name: 'Deerstalker', icon: '🔍', how: 'Guess three players’ characters right in your notepad by the end of a game', unlocked: (p) => got(p, 'detective') },
  { id: 'tinfoil', name: 'Tin foil hat', icon: '🛸', how: 'Nominate three different players in one game', unlocked: (p) => got(p, 'conspiracy'), secret: true },
  { id: 'trainer', name: 'Trainer’s cap', icon: '🧢', how: 'Catch 8 different kinds of fish', unlocked: (p) => got(p, 'trainer') },
  { id: 'madhatter', name: 'Mad Hatter’s hat', icon: '🫖', how: 'Hand drinks to three different players in one day', unlocked: (p) => got(p, 'teaparty'), secret: true },
  { id: 'cowboy', name: 'Cowboy hat', icon: '🤠', how: 'Fish up an old boot', unlocked: (p) => got(p, 'boot'), secret: true },
  { id: 'robot', name: 'Robot helmet', icon: '🤖', how: 'Dance for a whole minute without stopping', unlocked: (p) => got(p, 'onemore'), secret: true },
  { id: 'cone', name: 'Traffic cone', icon: '🚧', how: 'Stand perfectly still for five minutes', unlocked: (p) => got(p, 'afk'), secret: true },
  { id: 'mortarboard', name: 'Mortarboard', icon: '🎓', how: 'Get three stars at six different jobs', unlocked: (p) => p.perfect.length >= 6 },
  { id: 'pumpkin', name: 'Jack-o’-lantern', icon: '🎃', how: 'Dance among the graves as a ghost', unlocked: (p) => got(p, 'thriller'), secret: true },
  { id: 'viking', name: 'Viking helmet', icon: '⚔️', how: 'Shout three times inside ten seconds', unlocked: (p) => got(p, 'fusrodah'), secret: true },
  { id: 'sombrero', name: 'Sombrero', icon: '🌵', how: 'Dance with two other players dancing right beside you', unlocked: (p) => got(p, 'amigos'), secret: true },
  { id: 'beret', name: 'Artist’s beret', icon: '🎨', how: 'Lie on a bed while someone else is in the room', unlocked: (p) => got(p, 'portrait'), secret: true },
  { id: 'astronaut', name: 'Astronaut’s helmet', icon: '🧑‍🚀', how: 'Look down on Ravenswood from as high up as you can go', unlocked: (p) => got(p, 'majortom'), secret: true },
  { id: 'ushanka', name: 'Ushanka', icon: '❄️', how: 'Stay out in the rain or the mist for three whole minutes', unlocked: (p) => got(p, 'letitgo') },
  { id: 'santa', name: 'Santa hat', icon: '🎅', how: 'Note down a claim and a guess for every other player in your notepad (five or more)', unlocked: (p) => got(p, 'nicelist') },
  { id: 'catears', name: 'Cat ears', icon: '🐱', how: 'Sit in nine different seats around town', unlocked: (p) => got(p, 'sits'), secret: true },
  { id: 'ninja', name: 'Ninja headband', icon: '🥷', how: 'Stand right behind someone for five seconds without them turning round', unlocked: (p) => got(p, 'ninja'), secret: true },
  { id: 'knight', name: 'Knight’s helm', icon: '🏰', how: 'Be nominated three times in one game and live to see the end', unlocked: (p) => got(p, 'scratch') },
  { id: 'gnome', name: 'Gnome’s hat', icon: '🌱', how: 'Plant 15 flowers', unlocked: (p) => got(p, 'gnomed') },
  { id: 'fedora', name: 'Adventurer’s fedora', icon: '🏺', how: 'Reel in a silver eel', unlocked: (p) => got(p, 'snakes'), secret: true },
  { id: 'unicorn', name: 'Unicorn horn', icon: '🦄', how: 'Wave hello to five different players in one day', unlocked: (p) => got(p, 'friendship'), secret: true },
  // From the shop, cheapest first.
  { id: 'hardhat', name: 'Hard hat', icon: '👷', how: 'Buy it at the Lucky Raven’s shop', unlocked: bought('hardhat'), price: 30 },
  { id: 'reindeer', name: 'Reindeer antlers', icon: '🦌', how: 'Buy it at the Lucky Raven’s shop', unlocked: bought('reindeer'), price: 35 },
  { id: 'beerhat', name: 'Drinking helmet', icon: '🍻', how: 'Buy it at the Lucky Raven’s shop', unlocked: bought('beerhat'), price: 40 },
  { id: 'sharkhat', name: 'Shark hat', icon: '🦈', how: 'Buy it at the Lucky Raven’s shop', unlocked: bought('sharkhat'), price: 45 },
  { id: 'birthday', name: 'Birthday cake', icon: '🎂', how: 'Buy it at the Lucky Raven’s shop', unlocked: bought('birthday'), price: 50 },
  { id: 'bicorne', name: 'Emperor’s bicorne', icon: '⚜️', how: 'Buy it at the Lucky Raven’s shop', unlocked: bought('bicorne'), price: 60 },
  { id: 'bearskin', name: 'Guardsman’s bearskin', icon: '💂', how: 'Buy it at the Lucky Raven’s shop', unlocked: bought('bearskin'), price: 70 },
  { id: 'centurion', name: 'Centurion’s helmet', icon: '🏛️', how: 'Buy it at the Lucky Raven’s shop', unlocked: bought('centurion'), price: 85 },
  { id: 'tiara', name: 'Diamond tiara', icon: '💎', how: 'Buy it at the Lucky Raven’s shop', unlocked: bought('tiara'), price: 100 },
  { id: 'topper', name: 'Topper and monocle', icon: '🧐', how: 'Buy it at the Lucky Raven’s shop', unlocked: bought('topper'), price: 120 },
  { id: 'trophy', name: 'Crown of Midas', icon: '✨', how: 'Buy it at the Lucky Raven’s shop, if you can afford it', unlocked: bought('trophy'), price: 500 },
];

/** The trophy hat: owning it puts a little crown by your name. */
export const TROPHY_HAT: HatId = 'trophy';

/** Each hat a player has unlocked makes them a touch quicker about town, walking and running: 0.1% a hat. */
export const HAT_SPEED = 0.001;
export const hatsOwned = (p: Progress) => HATS.filter((h) => h.unlocked(p)).length;
/** "+0.7%", for telling players what their hats are worth. */
export const hatSpeedLabel = (hats: number) => `+${(hats * HAT_SPEED * 100).toFixed(1)}%`;

// ---------------------------------------------------------------- achievements

export type FeatId =
  | 'goodwin'
  | 'evilwin'
  | 'angler'
  | 'lap'
  | 'confess'
  | 'postie'
  | 'konami'
  | 'visited'
  | 'fairyring'
  | 'dizzy'
  | 'survivor'
  | 'gallows'
  | 'slayer'
  | 'nominated'
  | 'nominator'
  | 'voter'
  | 'ghostvote'
  | 'chatterbox'
  | 'tourist'
  | 'generous'
  | 'regular'
  | 'fanmail'
  | 'lucky'
  | 'peckish'
  | 'disco'
  | 'haunting'
  | 'spared'
  | 'fez'
  | 'detective'
  | 'conspiracy'
  | 'trainer'
  | 'teaparty'
  | 'boot'
  | 'onemore'
  | 'afk'
  | 'thriller'
  // How a game goes, on any script.
  | 'offhook'
  | 'everyvote'
  | 'suspect'
  | 'lastone'
  | 'ghostwin'
  | 'gutfeel'
  | 'lonevoice'
  | 'firstgo'
  | 'pickme'
  // Around town.
  | 'earlybird'
  | 'allrounder'
  | 'nosy'
  | 'pigeons'
  | 'bucket'
  | 'admirer'
  | 'legend'
  | 'teacher'
  | 'moneybags'
  | 'pitwin'
  | 'pitchamp'
  // Pop-culture ones, each with a hat.
  | 'fusrodah'
  | 'amigos'
  | 'portrait'
  | 'majortom'
  | 'letitgo'
  | 'nicelist'
  | 'sits'
  | 'ninja'
  | 'scratch'
  | 'gnomed'
  | 'snakes'
  | 'friendship';

/**
 * Things to do around Ravenswood, kept by the Storyteller under the player's name with everything else they've earned
 * (and a copy in the player's own browser). Secret ones show as a question mark until they're found; some come with a
 * hat. Each new one pays a little money too (see PAY in game/profiles.ts).
 */
export const FEATS: { id: FeatId; name: string; icon: string; how: string; secret?: boolean; hat?: HatId }[] = [
  { id: 'goodwin', name: 'Hero of Ravenswood', icon: '🌿', how: 'Win a game on the good team', hat: 'laurel' },
  { id: 'evilwin', name: 'Wicked', icon: '😈', how: 'Win a game on the evil team', hat: 'horns' },
  { id: 'survivor', name: 'Survivor', icon: '🛡️', how: 'Still be alive when a game ends' },
  { id: 'regular', name: 'Regular', icon: '🏡', how: 'Play 5 games to the end' },
  { id: 'gallows', name: 'Hung out to dry', icon: '🪢', how: 'Be hanged at the gallows' },
  { id: 'nominated', name: 'In the hot seat', icon: '🔥', how: 'Be nominated' },
  { id: 'nominator', name: 'J’accuse!', icon: '👉', how: 'Nominate someone' },
  { id: 'voter', name: 'Hands up', icon: '✋', how: 'Raise your hand in 10 votes' },
  { id: 'ghostvote', name: 'Voice from beyond', icon: '👻', how: 'Use your ghost vote' },
  { id: 'slayer', name: 'Bold claim', icon: '🗡️', how: 'Claim to be the Slayer' },
  { id: 'chatterbox', name: 'Chatterbox', icon: '🗣️', how: 'Talk for 10 minutes in all' },
  { id: 'tourist', name: 'Tourist', icon: '🗺️', how: 'Visit the tavern, bakery, church and clock tower in one day' },
  { id: 'generous', name: 'Generous', icon: '🎁', how: 'Hand things to 5 different players' },
  { id: 'peckish', name: 'Peckish', icon: '🥧', how: 'Eat or drink 20 things' },
  { id: 'lucky', name: 'Lucky', icon: '🪙', how: 'Make 10 wishes at the well' },
  { id: 'angler', name: 'Angler', icon: '🎣', how: 'Catch 10 fish', hat: 'tricorn' },
  { id: 'lap', name: 'Fun run', icon: '🏃', how: 'Run a whole lap of the ring road without stopping', hat: 'headband' },
  { id: 'confess', name: 'Bless me', icon: '🕯️', how: 'Talk with someone through the confession booth', hat: 'candle' },
  { id: 'postie', name: 'Pen pal', icon: '✉️', how: 'Post 5 letters', hat: 'postie' },
  { id: 'fanmail', name: 'Fan mail', icon: '💌', how: 'Get 3 letters in one night' },
  { id: 'konami', name: 'Old school', icon: '🎮', how: 'Enter the secret code', secret: true, hat: 'propeller' },
  { id: 'visited', name: 'A knock in the night', icon: '💀', how: 'Have a visitor in the night', secret: true, hat: 'reaper' },
  { id: 'fairyring', name: 'Away with the fairies', icon: '🍄', how: 'Find the fairy ring', secret: true, hat: 'toadstool' },
  { id: 'dizzy', name: 'Dizzy', icon: '😵‍💫', how: 'Spin round and round and round', secret: true, hat: 'jester' },
  { id: 'disco', name: 'Dance floor', icon: '🪩', how: 'Dance in the middle of the meeting circle', secret: true },
  { id: 'haunting', name: 'Haunting', icon: '🪦', how: 'Visit the graveyard as a ghost', secret: true },
  { id: 'spared', name: 'Not today', icon: '🍀', how: 'Walk away from the gallows', secret: true },
  { id: 'detective', name: 'Elementary', icon: '🔍', how: 'Guess three players’ characters right in your notepad by the end of a game', hat: 'deerstalker' },
  { id: 'trainer', name: 'Gotta catch ’em all', icon: '🐟', how: 'Catch 8 different kinds of fish', hat: 'trainer' },
  { id: 'fez', name: 'Fezzes are cool', icon: '🕰️', how: 'Be inside the clock tower when the bell rings', secret: true, hat: 'fez' },
  { id: 'conspiracy', name: 'They’re onto me', icon: '🛸', how: 'Nominate three different players in one game', secret: true, hat: 'tinfoil' },
  { id: 'teaparty', name: 'A very merry unbirthday', icon: '🫖', how: 'Hand drinks to three different players in one day', secret: true, hat: 'madhatter' },
  { id: 'boot', name: 'There’s a snake in my boot!', icon: '🥾', how: 'Fish up an old boot', secret: true, hat: 'cowboy' },
  { id: 'onemore', name: 'One more time', icon: '🪩', how: 'Dance for a whole minute without stopping', secret: true, hat: 'robot' },
  { id: 'afk', name: 'AFK', icon: '🚧', how: 'Stand perfectly still for five minutes', secret: true, hat: 'cone' },
  { id: 'thriller', name: 'Thriller', icon: '🧟', how: 'Dance among the graves as a ghost', secret: true, hat: 'pumpkin' },
  { id: 'offhook', name: 'Off the hook', icon: '😮‍💨', how: 'Be nominated and not get enough votes' },
  { id: 'everyvote', name: 'Every hand counts', icon: '🙋', how: 'Raise your hand in every vote of a day with three or more nominations' },
  { id: 'suspect', name: 'Usual suspect', icon: '🕵️', how: 'Be nominated three days running' },
  { id: 'lastone', name: 'Last one standing', icon: '🧍', how: 'Be the last of your team alive when a game ends' },
  { id: 'ghostwin', name: 'From beyond the grave', icon: '⚰️', how: 'Win a game as a ghost' },
  { id: 'gutfeel', name: 'Gut feeling', icon: '🎯', how: 'Nominate the Demon' },
  { id: 'lonevoice', name: 'Lone voice', icon: '☝️', how: 'Be the only hand raised in a vote', secret: true },
  { id: 'firstgo', name: 'First to go', icon: '🥀', how: 'Be the first to die in a game', secret: true },
  { id: 'pickme', name: 'Pick me!', icon: '🙋‍♀️', how: 'Nominate yourself', secret: true },
  { id: 'earlybird', name: 'Early bird', icon: '🐦', how: 'Be first to the square when the bell rings' },
  { id: 'allrounder', name: 'Jack of all trades', icon: '🧰', how: 'Have a go at every job in town' },
  { id: 'nosy', name: 'Nosy neighbour', icon: '🏘️', how: 'Pop into every cottage in town' },
  { id: 'pigeons', name: 'Pigeon fancier', icon: '🕊️', how: 'Send 5 messenger pigeons' },
  { id: 'bucket', name: 'Thirsty work', icon: '🪣', how: 'Draw 10 buckets of water from the well' },
  { id: 'admirer', name: 'Secret admirer', icon: '💘', how: 'Post a letter without signing it', secret: true },
  { id: 'legend', name: 'Once in a blue moon', icon: '🌙', how: 'Catch a legendary fish', secret: true },
  { id: 'teacher', name: 'Teacher’s pet', icon: '🍎', how: 'Give the Storyteller a present', secret: true },
  { id: 'moneybags', name: 'Money bags', icon: '💰', how: 'Have $100 at once' },
  { id: 'pitwin', name: 'Top dog', icon: '🥊', how: 'Win a pet fight in the tavern’s cellar' },
  { id: 'pitchamp', name: 'Champion of the pit', icon: '🏆', how: 'Win 5 pet fights' },
  // Pop-culture ones, each with a hat.
  { id: 'fusrodah', name: 'Fus Ro Dah!', icon: '📣', how: 'Shout three times inside ten seconds', secret: true, hat: 'viking' },
  { id: 'amigos', name: 'Three Amigos', icon: '💃', how: 'Dance with two other players dancing right beside you', secret: true, hat: 'sombrero' },
  { id: 'portrait', name: 'Draw me like one of your French girls', icon: '🖼️', how: 'Lie on a bed while someone else is in the room', secret: true, hat: 'beret' },
  { id: 'majortom', name: 'Ground Control to Major Tom', icon: '🚀', how: 'Look down on Ravenswood from as high up as you can go', secret: true, hat: 'astronaut' },
  { id: 'letitgo', name: 'The cold never bothered me anyway', icon: '🌧️', how: 'Stay out in the rain or the mist for three whole minutes', hat: 'ushanka' },
  { id: 'nicelist', name: 'Making a list, checking it twice', icon: '📜', how: 'Note down a claim and a guess for every other player in your notepad (five or more)', hat: 'santa' },
  { id: 'sits', name: 'If I fits, I sits', icon: '🐈', how: 'Sit in nine different seats around town', secret: true, hat: 'catears' },
  { id: 'ninja', name: 'Nothing personal, kid', icon: '👤', how: 'Stand right behind someone for five seconds without them turning round', secret: true, hat: 'ninja' },
  { id: 'scratch', name: '’Tis but a scratch', icon: '🩹', how: 'Be nominated three times in one game and live to see the end', hat: 'knight' },
  { id: 'gnomed', name: 'You’ve been gnomed', icon: '🌷', how: 'Plant 15 flowers', hat: 'gnome' },
  { id: 'snakes', name: 'Snakes. Why’d it have to be snakes?', icon: '🐍', how: 'Reel in a silver eel', secret: true, hat: 'fedora' },
  { id: 'friendship', name: 'Friendship is magic', icon: '🌈', how: 'Wave hello to five different players in one day', secret: true, hat: 'unicorn' },
];

/** The weather the Storyteller can call for. */
export type Weather = 'clear' | 'mist' | 'rain';

/** A valid look: a known animal and colour, and only a known hat and pet. */
export function fixLook(look: Partial<Look> | null | undefined): Look {
  const info = ANIMALS.find((a) => a.id === look?.animal) ?? ANIMALS[0];
  const color = /^#[0-9a-f]{6}$/i.test(look?.color ?? '') ? look!.color! : info.colors[0];
  return { animal: info.id, color, hat: fixHat(look?.hat), ...fixDressUp(look) };
}

/** A known hat or none. (Unlocks are checked in the player's own browser; this is a friendly game.) */
export function fixHat(hat: unknown): HatId | null {
  return HATS.some((h) => h.id === hat) ? (hat as HatId) : null;
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
  | 'drink'
  /** The dances in the Dances picker (see DANCES). */
  | 'twerk'
  | 'griddy'
  | 'floss'
  | 'robot'
  | 'moonwalk'
  | 'horse'
  | 'macarena'
  /** Dances bought at the shop. */
  | 'chicken'
  | 'sprinkler'
  | 'runningman'
  | 'ymca'
  | 'carlton'
  | 'worm';

export const EMOTES: { anim: Anim; label: string; key: string }[] = [
  { anim: 'wave', label: 'Wave', key: '1' },
  { anim: 'dance', label: 'Dance', key: '2' },
  { anim: 'cheer', label: 'Cheer', key: '3' },
  { anim: 'laugh', label: 'Laugh', key: '4' },
  { anim: 'cry', label: 'Cry', key: '5' },
  { anim: 'sit', label: 'Sit', key: '6' },
];

/** The key that opens the Dances picker; while it's open, 1 to 7 pick from it. */
export const DANCES_KEY = '7';

/**
 * More dances, in the picker behind the Dances button. They loop until you move or do something else. One with a
 * `price` is bought at the Lucky Raven's shop (the rest are free).
 */
export const DANCES: { anim: Anim; label: string; icon: string; price?: number }[] = [
  { anim: 'twerk', label: 'Twerk', icon: '🍑' },
  { anim: 'griddy', label: 'Griddy', icon: '🥽' },
  { anim: 'floss', label: 'Floss', icon: '🦷' },
  { anim: 'robot', label: 'Robot', icon: '🤖' },
  { anim: 'moonwalk', label: 'Moonwalk', icon: '🌙' },
  { anim: 'horse', label: 'Horse ride', icon: '🐎' },
  { anim: 'macarena', label: 'Macarena', icon: '🎶' },
  { anim: 'chicken', label: 'Chicken dance', icon: '🐔', price: 15 },
  { anim: 'sprinkler', label: 'Sprinkler', icon: '💦', price: 20 },
  { anim: 'runningman', label: 'Running man', icon: '🏃', price: 20 },
  { anim: 'ymca', label: 'Y.M.C.A.', icon: '🙆', price: 25 },
  { anim: 'carlton', label: 'The Carlton', icon: '🕺', price: 30 },
  { anim: 'worm', label: 'The worm', icon: '🪱', price: 40 },
];

/** Whether a player may do this dance: a free one, or one they've bought. */
export const danceOwned = (anim: Anim, p: { items?: string[] }): boolean => !DANCES.find((d) => d.anim === anim)?.price || owns(p, `dance:${anim}`);

/** Any dance, the plain one or one from the picker (they all count for the dancing achievements). */
export const isDance = (a: Anim | null | undefined): boolean => a === 'dance' || DANCES.some((d) => d.anim === a);

export type DrinkKind = 'ale' | 'cider' | 'milk' | 'cocoa';
export type BakeKind = 'loaf' | 'pie' | 'bun';
export type ClothKind = 'shirt' | 'sock' | 'dress' | 'towel' | 'pants';
export type FlowerKind = 'tulip' | 'daisy' | 'sunflower' | 'rose';

/** Something held in the right paw. The grimoire is the Storyteller's; `c: 'open'` while they read it. */
export type ItemKind = DrinkKind | BakeKind | 'fish' | 'flower' | 'rod' | 'can' | 'washing' | 'grimoire' | 'water' | 'wine' | 'firewood';

export interface Item {
  k: ItemKind;
  /** A colour, for flowers and washing. */
  c?: string;
}

// ---------------------------------------------------------------- places

/** Every place has its own coordinates. Interiors are centred on 0,0. */
export type ZoneKind = 'town' | 'tavern' | 'bakery' | 'church' | 'tower' | 'cellar' | 'house' | 'club' | 'casino' | 'lobby' | 'flat';

/**
 * 'town', 'tavern', 'bakery', 'church', 'tower', 'cellar' (under the tavern), 'club', 'cottage:<n>' for a cottage in
 * town, 'lobby' for the apartment block's hall, or 'flat:<name key>' for a player's flat in it (where they sleep at
 * night). ('house:<seatId>' was a bedroom off screen, before everyone had a flat.)
 */
export type ZoneId = string;

export function zoneKind(zone: ZoneId): ZoneKind {
  if (zone.startsWith('house:') || zone.startsWith('cottage:')) return 'house';
  if (zone.startsWith('flat:')) return 'flat';
  if (zone === 'tavern' || zone === 'bakery' || zone === 'church' || zone === 'tower' || zone === 'cellar' || zone === 'club' || zone === 'casino' || zone === 'lobby') return zone;
  return 'town';
}

/**
 * A confession booth: two closets side by side with a grille between them, a seat in each, both doorways on its
 * front (its own +z). `x, z` is its middle and `ry` the way it faces. Whoever sits in one side hears only whoever
 * sits in the other, and nobody outside hears either. One stands in the church's front right corner, and two more
 * out among the trees in quiet corners of town.
 */
export interface Booth {
  zone: ZoneId;
  x: number;
  z: number;
  ry: number;
}
/** Half a booth's width (across both sides) and half its depth. */
export const BOOTH_HW = 1.5;
export const BOOTH_HD = 0.75;
/** Out in town, facing the middle of town, this far out at these angles (clockwise from north). */
const outdoorBooth = (deg: number, r: number): Booth => {
  const a = (deg * Math.PI) / 180;
  const x = r * Math.sin(a);
  const z = -r * Math.cos(a);
  return { zone: 'town', x, z, ry: Math.atan2(-x, -z) };
};
export const BOOTHS: Booth[] = [{ zone: 'church', x: 4.35, z: -8.12, ry: 0 }, outdoorBooth(150, 30.5), outdoorBooth(255, 30.5)];

/** A point in a booth's own frame (the inverse of placing something at lx, lz in it). */
function boothLocal(b: Booth, x: number, z: number): { lx: number; lz: number } {
  const dx = x - b.x;
  const dz = z - b.z;
  const c = Math.cos(b.ry);
  const s = Math.sin(b.ry);
  return { lx: dx * c - dz * s, lz: dx * s + dz * c };
}
/** A spot in a booth's own frame, in the world, facing out of its front. */
export function boothSpot(i: number, lx: number, lz: number): Spot {
  const b = BOOTHS[i];
  const c = Math.cos(b.ry);
  const s = Math.sin(b.ry);
  return { x: b.x + lx * c + lz * s, z: b.z - lx * s + lz * c, ry: b.ry };
}
/** The seat in each side of booth `i` (left, then right, seen from the front). */
export const boothSeats = (i: number): Spot[] => [-0.75, 0.75].map((lx) => boothSpot(i, lx, 0));
/** Which booth this spot is inside, or -1. */
export function boothAt(zone: ZoneId, x: number, z: number): number {
  for (let i = 0; i < BOOTHS.length; i++) {
    const b = BOOTHS[i];
    if (b.zone !== zone) continue;
    const { lx, lz } = boothLocal(b, x, z);
    if (Math.abs(lx) < BOOTH_HW && Math.abs(lz) < BOOTH_HD) return i;
  }
  return -1;
}
export const inBooth = (zone: ZoneId, x: number, z: number): boolean => boothAt(zone, x, z) >= 0;
/** The church's booth, as a rectangle and its two seats (it stands square to the room). */
export const BOOTH = { x0: BOOTHS[0].x - BOOTH_HW, x1: BOOTHS[0].x + BOOTH_HW, z0: BOOTHS[0].z - BOOTH_HD, z1: BOOTHS[0].z + BOOTH_HD };
export const BOOTH_SEATS: Spot[] = boothSeats(0);

export const cottageZone = (slot: number): ZoneId => `cottage:${slot}`;
export const cottageSlot = (zone: ZoneId): number | null => (zone.startsWith('cottage:') ? Number(zone.slice(8)) : null);
export const houseOwner = (zone: ZoneId): string | null => (zone.startsWith('house:') ? zone.slice(6) : null);
/** A player's flat in the apartment block, by the name their profile is kept under (lower case). */
export const flatZone = (key: string): ZoneId => `flat:${key}`;
export const flatOwner = (zone: ZoneId): string | null => (zone.startsWith('flat:') ? zone.slice(5) : null);

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
  /** For a way in: where you come back out again, when the way out depends on which door you used. */
  back?: Spot;
  label: string;
}

export type JobId =
  | 'bartender'
  | 'laundry'
  | 'fishing'
  | 'baking'
  | 'gardening'
  | 'darts'
  | 'bread'
  | 'wine'
  | 'firewood'
  | 'skimming'
  | 'coin'
  | 'clock'
  /** Step into one side of the confession booth (or back out). */
  | 'confess'
  /** Write a letter and post it in someone's letterbox. */
  | 'post'
  | 'takeDrink'
  | 'takeBread'
  | 'sleep'
  | 'sit'
  | 'well'
  | 'notice'
  /** Have a word with the club's bouncer, to be let in. */
  | 'bouncer'
  /** Choose the song at the club's jukebox. */
  | 'jukebox'
  /** Post an idea or a request for the Storyteller in the idea box. */
  | 'ideas'
  /** Read the leaderboard on the tavern wall. */
  | 'leaders'
  /** The casino: the shop's counter (pets, hats, dances), and a seat at either card table. */
  | 'shop'
  | 'blackjack'
  | 'poker'
  | 'roulette'
  /** Sit at one of the casino's slot machines. */
  | 'slots'
  /** The apartment block's lift: choose whose flat to go up to. */
  | 'flats';

/** The town's best at each game: who, the score, and when. */
export interface TownRecord {
  by: string;
  score: number;
  at: number;
}

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
  /** For a confession booth's side: which booth. */
  booth?: number;
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
  /** Town records by game. */
  records: Record<string, TownRecord>;
  /** The song on at the club, since when (host clock), and who chose it. Nothing chosen yet: the first song, from the start. */
  club?: { song: string; at: number; by: string };
}

export const emptyTown = (): TownState => ({ drinks: [], clothes: [], flowers: [], loaves: [], fish: [], records: {} });

// ---------------------------------------------------------------- where everyone is

/**
 * One avatar's state on the wire: [x, z, ry, zone, anim, item, speaking, voiceId, flags, entering].
 * Sent about ten times a second while moving. The last two are left off while there's nothing in them (most of
 * the time), so pages from before them still read everyone.
 */
export type Pose = [number, number, number, ZoneId, Anim, Item | null, boolean, string | null, number?, ZoneId?];

/** Pose flags: the mic is muted (or off), and shouting. */
export const POSE_MUTED = 1;
export const POSE_SHOUT = 2;

export interface PoseState {
  x: number;
  z: number;
  ry: number;
  zone: ZoneId;
  anim: Anim;
  item: Item | null;
  speaking: boolean;
  voiceId: string | null;
  /** Can't be heard: muted, or no mic. */
  muted?: boolean;
  /** Shouting: heard much further off out in town. */
  shout?: boolean;
  /** Going in through a door to this place: the door chime rings for whoever is inside. */
  entering?: ZoneId | null;
}

export const toPose = (p: PoseState): Pose => {
  const pose: Pose = [Math.round(p.x * 100) / 100, Math.round(p.z * 100) / 100, Math.round(p.ry * 100) / 100, p.zone, p.anim, p.item, p.speaking, p.voiceId];
  const flags = (p.muted ? POSE_MUTED : 0) | (p.shout ? POSE_SHOUT : 0);
  if (p.entering) pose.push(flags, p.entering);
  else if (flags) pose.push(flags);
  return pose;
};

/** The town and every room fit well inside this, so anything further out is a bad message. */
const WORLD_EDGE = 500;

/** A coordinate from the network: a finite number within the world, or 0. */
export const coord = (v: unknown): number => {
  const n = Number(v);
  return Number.isFinite(n) ? Math.max(-WORLD_EDGE, Math.min(WORLD_EDGE, n)) : 0;
};

/** An angle from the network, brought into -π..π (a huge value would otherwise hang the code that turns to face it). */
export const angle = (v: unknown): number => {
  const n = Number(v);
  return Number.isFinite(n) ? wrapAngle(n) : 0;
};

/** Any angle, as the same direction between -π and π. */
export function wrapAngle(a: number): number {
  const t = Math.PI * 2;
  const r = (((a + Math.PI) % t) + t) % t;
  return r - Math.PI;
}

export const fromPose = (p: Pose): PoseState => ({
  x: coord(p[0]),
  z: coord(p[1]),
  ry: angle(p[2]),
  zone: typeof p[3] === 'string' ? p[3].slice(0, 60) : 'town',
  anim: (typeof p[4] === 'string' ? p[4].slice(0, 24) : 'idle') as Anim,
  item: p[5] && typeof p[5] === 'object' && typeof p[5].k === 'string' ? { k: p[5].k.slice(0, 24) as Item['k'], c: typeof p[5].c === 'string' ? p[5].c.slice(0, 9) : undefined } : null,
  speaking: Boolean(p[6]),
  voiceId: typeof p[7] === 'string' ? p[7].slice(0, 80) : null,
  muted: (Number(p[8]) & POSE_MUTED) !== 0,
  shout: (Number(p[8]) & POSE_SHOUT) !== 0,
  entering: typeof p[9] === 'string' ? p[9].slice(0, 60) : null,
});
