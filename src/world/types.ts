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

export interface Look {
  animal: AnimalId;
  /** The main coat colour, as a hex string. */
  color: string;
  /** A hat earned in earlier games, worn on the head. */
  hat?: HatId | null;
  /** Dress-up, free for everyone: something on the face, round the neck, on the back, and a pet. */
  face?: FaceId | null;
  neck?: NeckId | null;
  back?: BackId | null;
  pet?: PetId | null;
}

// ---------------------------------------------------------------- dress-up, free for everyone

export type FaceId = 'glasses' | 'shades' | 'hearts' | 'monocle' | 'moustache' | 'mask';
export type NeckId = 'bowtie' | 'scarf' | 'bandana' | 'bell' | 'lei' | 'pearls';
export type BackId = 'backpack' | 'cape' | 'wings' | 'butterfly' | 'balloon' | 'satchel';
export type PetId = 'chick' | 'slime' | 'ghost' | 'mouse' | 'bee' | 'snail';

export const FACES: { id: FaceId; name: string; icon: string }[] = [
  { id: 'glasses', name: 'Round glasses', icon: '👓' },
  { id: 'shades', name: 'Sunnies', icon: '🕶️' },
  { id: 'hearts', name: 'Heart glasses', icon: '😍' },
  { id: 'monocle', name: 'Monocle', icon: '🧐' },
  { id: 'moustache', name: 'Moustache', icon: '🥸' },
  { id: 'mask', name: 'Hero mask', icon: '🦸' },
];
export const NECKS: { id: NeckId; name: string; icon: string }[] = [
  { id: 'bowtie', name: 'Bow tie', icon: '🎀' },
  { id: 'scarf', name: 'Scarf', icon: '🧣' },
  { id: 'bandana', name: 'Bandana', icon: '🤠' },
  { id: 'bell', name: 'Bell collar', icon: '🔔' },
  { id: 'lei', name: 'Flower lei', icon: '🌺' },
  { id: 'pearls', name: 'Pearls', icon: '📿' },
];
export const BACKS: { id: BackId; name: string; icon: string }[] = [
  { id: 'backpack', name: 'Backpack', icon: '🎒' },
  { id: 'cape', name: 'Cape', icon: '🦹' },
  { id: 'wings', name: 'Angel wings', icon: '🪽' },
  { id: 'butterfly', name: 'Butterfly wings', icon: '🦋' },
  { id: 'balloon', name: 'Balloon', icon: '🎈' },
  { id: 'satchel', name: 'Satchel', icon: '👜' },
];
export const PETS: { id: PetId; name: string; icon: string }[] = [
  { id: 'chick', name: 'Chick', icon: '🐤' },
  { id: 'slime', name: 'Slime', icon: '🟢' },
  { id: 'ghost', name: 'Little ghost', icon: '👻' },
  { id: 'mouse', name: 'Mouse', icon: '🐭' },
  { id: 'bee', name: 'Bee', icon: '🐝' },
  { id: 'snail', name: 'Tiny snail', icon: '🐌' },
];

const pickFrom = <T extends string>(list: { id: T }[], v: unknown): T | null => (list.some((x) => x.id === v) ? (v as T) : null);
/** Keeps only known dress-up pieces. */
export function fixDressUp(look: Partial<Look> | null | undefined): Pick<Look, 'face' | 'neck' | 'back' | 'pet'> {
  return { face: pickFrom(FACES, look?.face), neck: pickFrom(NECKS, look?.neck), back: pickFrom(BACKS, look?.back), pet: pickFrom(PETS, look?.pet) };
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
  | 'pumpkin';

/** What a player has done across all their games, kept in their own browser. */
export interface Progress {
  stars: number;
  records: number;
  ghosts: number;
  nights: number;
  /** The jobs they've done perfectly at least once (by job id). */
  perfect: string[];
  /** Achievements earned (by id, see FEATS). */
  feats: string[];
}

const did = (p: Progress, ...jobs: string[]) => jobs.some((j) => p.perfect.includes(j));
const got = (p: Progress, feat: FeatId) => p.feats.includes(feat);

export const HATS: { id: HatId; name: string; icon: string; how: string; unlocked: (p: Progress) => boolean; secret?: boolean }[] = [
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
];

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
  | 'thriller';

/**
 * Things to do around Ravenswood, kept in the player's own browser with everything else they've earned. Secret ones
 * show as a question mark until they're found; some come with a hat.
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
];

/** The weather the Storyteller can call for. */
export type Weather = 'clear' | 'mist' | 'rain';

/** A valid look: a known animal and colour, and only known hats and dress-up. */
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
export type ItemKind = DrinkKind | BakeKind | 'fish' | 'flower' | 'rod' | 'can' | 'washing' | 'grimoire' | 'water' | 'wine' | 'firewood';

export interface Item {
  k: ItemKind;
  /** A colour, for flowers and washing. */
  c?: string;
}

// ---------------------------------------------------------------- places

/** Every place has its own coordinates. Interiors are centred on 0,0. */
export type ZoneKind = 'town' | 'tavern' | 'bakery' | 'church' | 'tower' | 'house';

/** 'town', 'tavern', 'bakery', 'church', 'tower', 'house:<seatId>' for someone's bedroom, or 'cottage:<n>' for a cottage in town. */
export type ZoneId = string;

export function zoneKind(zone: ZoneId): ZoneKind {
  if (zone.startsWith('house:') || zone.startsWith('cottage:')) return 'house';
  if (zone === 'tavern' || zone === 'bakery' || zone === 'church' || zone === 'tower') return zone;
  return 'town';
}

/**
 * The confession booth in the church's front right corner: two closets side by side with a grille between them,
 * a seat in each. Whoever sits in one hears only whoever sits in the other, and nobody outside hears either.
 */
export const BOOTH = { x0: 2.85, x1: 5.85, z0: -8.87, z1: -7.37 };
export const BOOTH_SEATS: Spot[] = [0, 1].map((i) => ({ x: BOOTH.x0 + 0.75 + i * 1.5, z: -8.12, ry: 0 }));
export const inBooth = (zone: ZoneId, x: number, z: number): boolean =>
  zone === 'church' && x > BOOTH.x0 && x < BOOTH.x1 && z > BOOTH.z0 && z < BOOTH.z1;

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
  | 'notice';

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
}

export const emptyTown = (): TownState => ({ drinks: [], clothes: [], flowers: [], loaves: [], fish: [], records: {} });

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
});
