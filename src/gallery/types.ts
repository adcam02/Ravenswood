/**
 * The night's drawing and the gallery by the post office: shapes shared by the Storyteller's side (gallery/host.ts)
 * and the players' (gallery/client.ts).
 *
 * Each night everyone gets the same thing to draw, in bed. What they send goes to the Storyteller as a small picture,
 * and the next day it hangs in the gallery with nobody's name on it, for everyone to vote on their favourite. At
 * nightfall (or when the Storyteller closes it) the voting ends, the artists are named and the top three are paid.
 * Artists can keep their own pieces and hang them in their flat.
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
/** Pieces kept in a profile, at most. */
export const SAVED_MAX = 12;
/** First, second and third place, in dollars (a tie shares the place, and each gets its prize). */
export const PRIZES = [15, 10, 5];
/** After dawn, a drawing still on its way (sent as the night ended) still goes up for this long. */
export const LATE_MS = 30_000;
/** What an art id looks like (uid()). */
export const ART_ID = /^[a-z0-9]{6,24}$/;

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
  /** When it was drawn. */
  at: number;
}

/** What a player is sent about the drawing and the gallery (no pictures, only their ids). */
export interface GalleryView {
  /** Tonight's thing to draw, while it's night, and whether ours has gone in. */
  tonight?: { night: number; prompt: string; sent: boolean } | null;
  /** What's hanging in the gallery: from which night, what it was, whether the voting's open, our vote. */
  show?: { night: number; prompt: string; open: boolean; pieces: PieceView[]; vote: string | null } | null;
  /** Our own saved pieces; `lost` when the Storyteller no longer has the picture (we may have a copy). */
  saved: (SavedArt & { lost?: boolean })[];
  /** A word back about the last thing we did. */
  note?: { text: string; ok: boolean; at: number } | null;
}

/** A picture (or a piece of one) on its way to a player. */
export interface ArtPart {
  id: string;
  i: number;
  n: number;
  d: string;
}
