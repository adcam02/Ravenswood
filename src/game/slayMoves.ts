/**
 * The Slayer's moves: how a Slayer claim plays out in the square (see world/exec/slay.ts). The crossbow is free;
 * the rest are bought in the Shop, kept on the profile as 'slay:<id>', and chosen in the Slayer box when claiming.
 * Only the show changes: whether anyone dies is the Storyteller's call, as ever.
 */
export const SLAY_IDS = [
  'crossbow',
  'balloons',
  'pan',
  'sword',
  'mallet',
  'lasso',
  'wand',
  'lightning',
  'grenade',
  'car',
  'bowling',
  'spotter',
  'standoff',
  'taped',
  'domain',
  'laser',
  'beam',
  'capture',
  'fireball',
  'glove',
  'pie',
  'banana',
  'hammer',
  'stomp',
  'safe',
] as const;
export type SlayMoveId = (typeof SLAY_IDS)[number];

/** The shelves they're grouped on, in the Slayer box and the Shop. */
export type SlayKind = 'duel' | 'slapstick' | 'powers';
export const SLAY_KINDS: [SlayKind, string][] = [
  ['duel', 'Weapons and duels'],
  ['slapstick', 'Slapstick'],
  ['powers', 'Magic and powers'],
];

export interface SlayMove {
  id: SlayMoveId;
  kind: SlayKind;
  name: string;
  icon: string;
  /** Free when there's none. */
  price?: number;
  /** For the caption: "Abbey claims to be the Slayer and {verb} Bob…". */
  verb: string;
  blurb: string;
}

export const SLAY_MOVES: SlayMove[] = [
  { id: 'crossbow', kind: 'duel', name: 'The crossbow', icon: '🏹', verb: 'fires a bolt at', blurb: 'The Slayer’s classic: one bolt, straight and true. Everyone has it.' },
  { id: 'balloons', kind: 'slapstick', name: 'Water balloons', icon: '🎈', price: 20, verb: 'lobs water balloons at', blurb: 'Three balloons, each bigger than the last. Splash!' },
  { id: 'pan', kind: 'slapstick', name: 'Frying pan', icon: '🍳', price: 25, verb: 'swings a frying pan at', blurb: 'One mighty swing and a BONG they’ll hear in the churchyard.' },
  { id: 'sword', kind: 'duel', name: 'Sword lunge', icon: '🗡️', price: 30, verb: 'lunges with a sword at', blurb: 'En garde! A dashing run and a lunge. (The blade is a bit bendy.)' },
  { id: 'mallet', kind: 'slapstick', name: 'Giant mallet', icon: '🔨', price: 35, verb: 'brings a giant mallet down on', blurb: 'A mallet three times your size, straight down on the head. Squish.' },
  { id: 'lasso', kind: 'duel', name: 'Lasso and yank', icon: '🪢', price: 40, verb: 'throws a lasso at', blurb: 'Yee-haw: round and round, a throw, and a yank right off their feet.' },
  { id: 'wand', kind: 'powers', name: 'Magic wand', icon: '🪄', price: 45, verb: 'waves a magic wand at', blurb: 'A swish, a flick and a stream of stars. Bibbidi-bobbidi-gone.' },
  { id: 'lightning', kind: 'powers', name: 'Wizard’s lightning', icon: '⚡', price: 50, verb: 'calls down lightning on', blurb: 'A staff raised to a little storm cloud, and a crack of lightning.' },
  { id: 'grenade', kind: 'duel', name: 'Holy hand grenade', icon: '✝️', price: 60, verb: 'counts to three and lobs a holy hand grenade at', blurb: 'One, two, five! Three, sir! Three! A golden blessing, and a big bang.' },
  { id: 'pie', kind: 'slapstick', name: 'Custard pie', icon: '🥧', price: 20, verb: 'throws a custard pie at', blurb: 'A wind-up, a throw, and SPLAT, right in the kisser.' },
  { id: 'glove', kind: 'slapstick', name: 'Spring glove', icon: '🥊', price: 20, verb: 'springs a boxing glove at', blurb: 'A box with a crank. Round and round goes the tune, and out pops the glove. BOING!' },
  { id: 'banana', kind: 'slapstick', name: 'Banana peel', icon: '🍌', price: 25, verb: 'drops a banana peel in front of', blurb: 'Eat the banana, toss the peel, and wait. Whoops-a-daisy!' },
  { id: 'stomp', kind: 'slapstick', name: 'Head stomp', icon: '🍄', price: 30, verb: 'jumps on', blurb: 'A run, a mighty jump, and straight down on their head. Boing!' },
  { id: 'standoff', kind: 'duel', name: 'High noon', icon: '🤠', price: 30, verb: 'calls out for a standoff with', blurb: 'Back to back, ten paces, a tumbleweed and a lonely whistle. Then: draw!' },
  { id: 'spotter', kind: 'slapstick', name: 'Gym spotter', icon: '🏋️', price: 35, verb: 'offers to spot', blurb: '“I’ve got you, mate. One more rep!” They haven’t got you.' },
  { id: 'fireball', kind: 'powers', name: 'Fireball', icon: '🔥', price: 35, verb: 'throws a fireball at', blurb: 'A low stance, both paws forward, and a ball of blue fire. Ha-DOO-ken-ish!' },
  { id: 'bowling', kind: 'slapstick', name: 'Bowling strike', icon: '🎳', price: 40, verb: 'bowls themselves at', blurb: 'Curl up into a ball and roll. They’re the pin. STRIKE!' },
  { id: 'car', kind: 'slapstick', name: 'Little red car', icon: '🚗', price: 45, verb: 'drives a little car at', blurb: 'Parp parp! A tiny convertible, a rev, and straight over the top of them.' },
  { id: 'capture', kind: 'powers', name: 'Capture ball', icon: '🔴', price: 45, verb: 'throws a capture ball at', blurb: 'A red and white ball, a flash of red light, a wobble, a wobble, a wobble… Gotcha!' },
  { id: 'laser', kind: 'duel', name: 'Laser sword duel', icon: '⚔️', price: 50, verb: 'draws a laser sword on', blurb: 'Two humming blades of light, a clash or three, and a twirl to finish.' },
  { id: 'taped', kind: 'duel', name: 'Taped-on pistol', icon: '🔫', price: 55, verb: 'puts their hands up in front of', blurb: 'Hands up, nothing to see here… then the pistol taped to their back. BANG!' },
  { id: 'beam', kind: 'powers', name: 'Energy wave', icon: '💥', price: 60, verb: 'charges up an energy wave at', blurb: 'Paws cupped at the hip, a glow that grows and grows, then one huge blue beam.' },
  { id: 'hammer', kind: 'powers', name: 'Thunder hammer', icon: '⚒️', price: 65, verb: 'hurls a thunder hammer at', blurb: 'Only the worthy can lift it. Up to the sky, a crack of thunder, and a spinning throw.' },
  { id: 'safe', kind: 'slapstick', name: 'Falling safe', icon: '🔒', price: 70, verb: 'points up at the sky above', blurb: 'A whistle from above, a shadow growing on the boards, and a ONE TON safe.' },
  { id: 'domain', kind: 'powers', name: 'Domain Expansion', icon: '🌌', price: 80, verb: 'opens Domain Expansion: Infinite Void on', blurb: 'A hand sign, and the world goes dark and starry around the two of them. Infinite Void.' },
];

export const slayKey = (id: SlayMoveId) => `slay:${id}`;
export const slayMove = (id: string | null | undefined): SlayMove => SLAY_MOVES.find((m) => m.id === id) ?? SLAY_MOVES[0];
export const isSlayMove = (id: unknown): id is SlayMoveId => typeof id === 'string' && (SLAY_IDS as readonly string[]).includes(id);
/** Whether someone with these items may use this move (the free one, or one they've bought). */
export const ownsSlay = (id: SlayMoveId, items: readonly string[] | undefined) => !slayMove(id).price || Boolean(items?.includes(slayKey(id)));
