/**
 * The night's drawing and the gallery by the post office: shapes shared by the Storyteller's side (gallery/host.ts)
 * and the players' (gallery/client.ts).
 *
 * Each night everyone gets the same thing to draw, in bed. What they send goes to the Storyteller as a small picture,
 * and the next day it hangs in the gallery with nobody's name on it, for everyone to vote on their favourite. At
 * nightfall (or when the Storyteller closes it) the voting ends, the artists are named and the top three are paid.
 * Anyone can keep a piece (their own any time, anyone's once the artists are named) and hang it in their flat.
 *
 * Pictures never go out with the regular state: each player's view carries only ids, and the pictures themselves are
 * fetched once, by id, in pieces small enough for the data channel (PeerJS's JSON channel refuses a message over
 * about 16 KB).
 */

/** The drawing's own size, in pixels (it's scaled to fit the screen). */
export const ART_W = 480;
export const ART_H = 360;
/** The longest picture accepted, as a data URL. */
export const ART_MAX = 80_000;
/** Pictures travel in pieces this long. */
export const PART = 12_000;
/** Pieces kept in a profile, at most (their own and other people's). */
export const SAVED_MAX = 20;
/** First, second and third place, in dollars (a tie shares the place, and each gets its prize). */
export const PRIZES = [15, 10, 5];
/** After dawn, a drawing still on its way (sent as the night ended) still goes up for this long. */
export const LATE_MS = 30_000;
/** What an art id looks like (uid()). */
export const ART_ID = /^[a-z0-9]{6,24}$/;
/** A picture's little copy is asked for by its id with this on the end (for the game's art, a grid of them). */
export const THUMB = ':t';
export const THUMB_W = 160;
export const THUMB_H = 120;
/** Nightfall's vote on what to draw: how many prompts are offered, and how long the vote runs (a late idea adds a little, up to the most). */
export const PROMPT_CHOICES = 5;
export const CHOOSE_MS = 15_000;
export const CHOOSE_ADD_MS = 5_000;
export const CHOOSE_MAX_MS = 25_000;
/** Ideas of their own that players (and the Storyteller) can add to the vote: how long each, and how many a night. */
export const IDEA_MAX = 60;
export const IDEAS_MAX = 5;

/** An idea for tonight's prompt as typed: one line, no markup, not too long ('' if there's nothing sensible left). */
export function cleanIdea(raw: unknown): string {
  const text = String(raw ?? '')
    .normalize('NFC')
    // (Anything that looks like markup goes altogether, then any stray brackets.)
    .replace(/<[^>]*>/g, '')
    .replace(/[\u0000-\u001f\u007f-\u009f<>{}\[\]\\`]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, IDEA_MAX)
    .trim();
  return text.length >= 3 && /\p{L}/u.test(text) ? text : '';
}

/** What a heart on a drawing pays its artist, in dollars, and the most an artist's drawings earn in hearts in a game. */
export const HEART_PAY = 3;
export const HEART_CAP = 24;

/** What a player does about the drawing and the gallery. */
export type GalleryAction =
  /** A piece of a picture on its way (`up` names the upload), `i` of `n`. */
  | { k: 'part'; up: string; i: number; n: number; d: string }
  /** The picture uploaded as `up` is our drawing for night `night`. */
  | { k: 'submit'; up: string; night: number }
  /** A saved picture the Storyteller has lost (their browser's storage cleared), from the artist's own copy. */
  | { k: 'restore'; up: string; id: string }
  /** Our vote, for the piece `id` (one each, and it can be moved while the voting is open). */
  | { k: 'vote'; id: string }
  /** A heart for a piece in the game's art, or taking ours back. */
  | { k: 'heart'; id: string }
  /** At nightfall: our vote for tonight's prompt (an option's id), or an idea of our own to add to the vote. */
  | { k: 'choose'; id: string }
  | { k: 'idea'; text: string }
  /** Please send these pictures. */
  | { k: 'want'; ids: string[] }
  /** Keep one of our own pieces in our profile, or let one go. */
  | { k: 'save'; id: string }
  | { k: 'unsave'; id: string };

/** One piece hanging in the gallery, as a player sees it. */
export interface PieceView {
  id: string;
  /** Ours. */
  mine?: boolean;
  /** Once the voting has closed: who drew it, its votes, and its place and prize if it came in the top three. */
  name?: string;
  votes?: number;
  place?: number;
  prize?: number;
}

/** A piece kept in a profile (the picture itself is kept apart from the profile, see gallery/host.ts). */
export interface SavedArt {
  id: string;
  prompt: string;
  /** Who drew it (kept with someone else's piece, for the plate on its frame). */
  by?: string;
  /** When it was drawn. */
  at: number;
}

/**
 * Every drawing of the game that's just ended, night by night, with the artists named and each piece's hearts. Sent
 * once the game is over, until the next one starts (hearts can be given and taken back until then).
 */
export interface BookView {
  nights: { night: number; prompt: string; pieces: BookPiece[] }[];
}
export interface BookPiece {
  id: string;
  name: string;
  hearts: number;
  /** Ours, and whether we've given it a heart. */
  mine?: boolean;
  hearted?: boolean;
}

/** What a player is sent about the drawing and the gallery (no pictures, only their ids). */
export interface GalleryView {
  /**
   * Tonight's thing to draw, while it's night, and whether ours has gone in. For the first few seconds of the night
   * there's no prompt yet, only `choosing`: the vote on it.
   */
  tonight?: { night: number; prompt: string; sent: boolean; choosing?: ChoosingView } | null;
  /** What's hanging in the gallery: from which night, what it was, whether the voting's open, our vote. */
  show?: { night: number; prompt: string; open: boolean; pieces: PieceView[]; vote: string | null } | null;
  /** Our own saved pieces; `lost` when the Storyteller no longer has the picture (we may have a copy). */
  saved: (SavedArt & { lost?: boolean })[];
  /** The game's art, once it's over. */
  book?: BookView | null;
  /** A word back about the last thing we did. */
  note?: { text: string; ok: boolean; at: number } | null;
}

/** Nightfall's vote on the prompt, as a player sees it. */
export interface ChoosingView {
  /** When it closes (host clock). */
  until: number;
  /** The prompts on offer, then anyone's own ideas (`by`: whose), with their votes so far. */
  options: { id: string; text: string; by?: string; votes: number }[];
  /** Our vote (an option's id), and whether we've added an idea tonight. */
  vote: string | null;
  idea: boolean;
}

/** A picture (or a piece of one) on its way to a player. */
export interface ArtPart {
  id: string;
  i: number;
  n: number;
  d: string;
}
