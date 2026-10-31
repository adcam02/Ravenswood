/**
 * The Slayer's moves: how a Slayer claim plays out in the square (see world/exec/slay.ts). The crossbow is free;
 * the rest are bought in the Shop, kept on the profile as 'slay:<id>', and chosen in the Slayer box when claiming.
 * Only the show changes: whether anyone dies is the Storyteller's call, as ever.
 */
export const SLAY_IDS = ['crossbow', 'balloons', 'pan', 'sword', 'mallet', 'lasso', 'wand', 'lightning', 'grenade'] as const;
export type SlayMoveId = (typeof SLAY_IDS)[number];

export interface SlayMove {
  id: SlayMoveId;
  name: string;
  icon: string;
  /** Free when there's none. */
  price?: number;
  /** For the caption: "Abbey claims to be the Slayer and {verb} Bob…". */
  verb: string;
  blurb: string;
}

export const SLAY_MOVES: SlayMove[] = [
  { id: 'crossbow', name: 'The crossbow', icon: '🏹', verb: 'fires a bolt at', blurb: 'The Slayer’s classic: one bolt, straight and true. Everyone has it.' },
  { id: 'balloons', name: 'Water balloons', icon: '🎈', price: 20, verb: 'lobs water balloons at', blurb: 'Three balloons, each bigger than the last. Splash!' },
  { id: 'pan', name: 'Frying pan', icon: '🍳', price: 25, verb: 'swings a frying pan at', blurb: 'One mighty swing and a BONG they’ll hear in the churchyard.' },
  { id: 'sword', name: 'Sword lunge', icon: '🗡️', price: 30, verb: 'lunges with a sword at', blurb: 'En garde! A dashing run and a lunge. (The blade is a bit bendy.)' },
  { id: 'mallet', name: 'Giant mallet', icon: '🔨', price: 35, verb: 'brings a giant mallet down on', blurb: 'A mallet three times your size, straight down on the head. Squish.' },
  { id: 'lasso', name: 'Lasso and yank', icon: '🪢', price: 40, verb: 'throws a lasso at', blurb: 'Yee-haw: round and round, a throw, and a yank right off their feet.' },
  { id: 'wand', name: 'Magic wand', icon: '🪄', price: 45, verb: 'waves a magic wand at', blurb: 'A swish, a flick and a stream of stars. Bibbidi-bobbidi-gone.' },
  { id: 'lightning', name: 'Wizard’s lightning', icon: '⚡', price: 50, verb: 'calls down lightning on', blurb: 'A staff raised to a little storm cloud, and a crack of lightning.' },
  { id: 'grenade', name: 'Holy hand grenade', icon: '✝️', price: 60, verb: 'counts to three and lobs a holy hand grenade at', blurb: 'One, two, five! Three, sir! Three! A golden blessing, and a big bang.' },
];

export const slayKey = (id: SlayMoveId) => `slay:${id}`;
export const slayMove = (id: string | null | undefined): SlayMove => SLAY_MOVES.find((m) => m.id === id) ?? SLAY_MOVES[0];
export const isSlayMove = (id: unknown): id is SlayMoveId => typeof id === 'string' && (SLAY_IDS as readonly string[]).includes(id);
/** Whether someone with these items may use this move (the free one, or one they've bought). */
export const ownsSlay = (id: SlayMoveId, items: readonly string[] | undefined) => !slayMove(id).price || Boolean(items?.includes(slayKey(id)));
