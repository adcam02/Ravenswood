/**
 * Nomination moves: the little cutscene everyone at the meeting sees when a nomination starts (see world/nomShow.ts).
 * The paper aeroplane is free; the rest are bought in the Shop, kept on the profile as 'nom:<id>', and chosen in
 * Customise (on the look, as `nom`). The host puts the nominator's move on the nomination itself, so every screen
 * plays the same one. Only the show changes: the nomination runs as ever.
 */
export const NOM_IDS = [
  'plane',
  'finger',
  'gauntlet',
  'card',
  'pigeon',
  'jaccuse',
  'wanted',
  'foam',
  'objection',
  'wantyou',
  'laser',
  'lasso',
  'gavel',
  'meme',
  'unmask',
  'confetti',
] as const;
export type NomMoveId = (typeof NOM_IDS)[number];

/**
 * How the one nominated takes it, at the end, in close-up: a startled jump, a tremble with sweat drops, a gasp, a
 * faint, clutching their pearls, frozen like a deer in the headlights, or three dramatic zooms (dun dun DUN).
 */
export type NomReaction = 'jump' | 'tremble' | 'gasp' | 'faint' | 'pearls' | 'freeze' | 'dun';

export interface NomMove {
  id: NomMoveId;
  name: string;
  icon: string;
  /** Free when there's none. */
  price?: number;
  /** What the nominator calls out as they do it. */
  shout: string;
  /** And what the one nominated says. */
  reply: string;
  react: NomReaction;
  blurb: string;
}

export const NOM_MOVES: NomMove[] = [
  { id: 'plane', name: 'Paper aeroplane', icon: '✈️', shout: 'You!', reply: '?!', react: 'jump', blurb: 'A neatly folded accusation, sailing across the circle. Everyone has it.' },
  { id: 'finger', name: 'The finger of blame', icon: '👉', price: 10, shout: 'That one!', reply: 'Gasp!', react: 'gasp', blurb: 'A big glowing pointing finger, straight across the circle. No hiding now.' },
  { id: 'gauntlet', name: 'Glove slap', icon: '🧤', price: 15, shout: 'I challenge you!', reply: 'Well I never!', react: 'pearls', blurb: 'A gentleman’s glove, flung with feeling. A slap across the cheek, terribly polite.' },
  { id: 'card', name: 'Yellow card', icon: '🟨', price: 15, shout: 'Foul!', reply: '…me?', react: 'freeze', blurb: 'A blast on the whistle and a yellow card, held high. The referee’s decision is final.' },
  { id: 'pigeon', name: 'Summons by pigeon', icon: '🕊️', price: 20, shout: 'Deliver it!', reply: 'Oh no…', react: 'faint', blurb: 'A pigeon flaps over with a sealed summons. It’s too much for some.' },
  { id: 'jaccuse', name: 'J’accuse!', icon: '🔦', price: 25, shout: 'J’accuse!', reply: '!!', react: 'freeze', blurb: 'The lights go down and a spotlight swings onto them. Very French, very dramatic.' },
  { id: 'wanted', name: 'Wanted poster', icon: '📜', price: 25, shout: 'Wanted!', reply: 'Eep…', react: 'tremble', blurb: 'A wanted poster with their face on it, slapped right onto them. Dead or alive?' },
  { id: 'foam', name: 'Giant foam finger', icon: '☝️', price: 30, shout: 'Boop!', reply: '?!', react: 'jump', blurb: 'A foam finger that grows, and grows, and grows… all the way over to boop them.' },
  { id: 'objection', name: 'OBJECTION!', icon: '💢', price: 35, shout: 'OBJECTION!', reply: 'Eep!', react: 'tremble', blurb: 'A courtroom shout so loud the words fly across the circle and hit them. Sweaty.' },
  { id: 'wantyou', name: 'I want YOU', icon: '🎩', price: 35, shout: 'I want YOU!', reply: 'Gasp!', react: 'gasp', blurb: 'The old recruiting poster: a stern finger, a tall hat, and you are the one.' },
  { id: 'laser', name: 'Laser and cat', icon: '🐈', price: 40, shout: 'Get them, puss!', reply: 'Ack!', react: 'jump', blurb: 'A red dot dances over to them, and a little cat comes pouncing after it.' },
  { id: 'lasso', name: 'Lasso', icon: '🪢', price: 45, shout: 'Yee-haw!', reply: 'Whoa!', react: 'gasp', blurb: 'Round and round, a throw, and they’re roped in. Nobody escapes the round-up.' },
  { id: 'gavel', name: 'Courtroom gavel', icon: '⚖️', price: 50, shout: 'Order!', reply: 'Dun dun DUN', react: 'dun', blurb: 'A giant gavel comes down from the sky beside them. Order in the square!' },
  { id: 'meme', name: 'Freeze-frame', icon: '🖼️', price: 55, shout: 'This one.', reply: 'Dun dun DUN', react: 'dun', blurb: 'A gold frame snaps round you as you point, and then round them. Instant classic.' },
  { id: 'unmask', name: 'Unmasking', icon: '🎭', price: 65, shout: 'Let’s see who you really are!', reply: 'Jinkies!', react: 'faint', blurb: 'A grab, a pull, and their mask comes off! (It was them all along.)' },
  { id: 'confetti', name: 'Confetti cannon', icon: '🎉', price: 80, shout: 'Congratulations!', reply: 'For me?!', react: 'pearls', blurb: 'A cannon of confetti and streamers: congratulations, you’re nominated!' },
];

/** How long the show runs (the talking stick waits for it), in milliseconds. */
export const NOM_SHOW_MS = 5600;

export const nomKey = (id: NomMoveId) => `nom:${id}`;
export const nomMove = (id: string | null | undefined): NomMove => NOM_MOVES.find((m) => m.id === id) ?? NOM_MOVES[0];
export const isNomMove = (id: unknown): id is NomMoveId => typeof id === 'string' && (NOM_IDS as readonly string[]).includes(id);
/** A known move or none (the paper aeroplane), for a look. */
export const fixNom = (v: unknown): NomMoveId | null => (isNomMove(v) && v !== 'plane' ? v : null);
/** Whether someone with these items may use this move (the free one, or one they've bought). */
export const ownsNom = (id: NomMoveId, items: readonly string[] | undefined) => !nomMove(id).price || Boolean(items?.includes(nomKey(id)));
