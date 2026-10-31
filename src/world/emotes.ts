/**
 * Emotes bought at the Lucky Raven's shop (items 'emote:<id>'), and the emote hotbar: the eight slots along the bottom
 * of the screen, keys 1 to 8, each holding an emote, a dance or one of the pickers. A player's hotbar is kept in their
 * profile by the Storyteller (Profile.hotbar), so it follows them by name; the free emotes are everyone's to start with.
 *
 * Bought emotes are short (a couple of seconds) and work on every animal; some come with a little prop or effect
 * (emoteFx.ts). Like every animation they reach other players as the animal's `anim`.
 * Plain data only (see types.ts).
 */
import { DANCES, EMOTES, owns, type Anim } from './types';

export type EmoteAnim =
  | 'facepalm'
  | 'shrug'
  | 'slowclap'
  | 'thumbsup'
  | 'salute'
  | 'bow'
  | 'blowkiss'
  | 'micdrop'
  | 'dab'
  | 'loser'
  | 'think'
  | 'shush'
  | 'ragequit'
  | 'yawn'
  | 'sneeze'
  | 'hearthands'
  | 'flex'
  | 'eyeroll'
  | 'peace'
  | 'fingerguns'
  | 'thisisfine'
  | 'sweat'
  | 'teasip'
  | 'confused'
  | 'sigh'
  | 'crylaugh'
  | 'doot';

/** Every emote on sale: its picture for the buttons, its price and how long it plays (seconds). */
export const BUY_EMOTES: { anim: EmoteAnim; label: string; icon: string; price: number; time: number; blurb: string }[] = [
  { anim: 'facepalm', label: 'Facepalm', icon: '🤦', price: 5, time: 2.4, blurb: 'For when someone claims Virgin on day one.' },
  { anim: 'shrug', label: 'Shrug', icon: '🤷', price: 5, time: 1.8, blurb: 'Who knows? Not you.' },
  { anim: 'sigh', label: 'Tired sigh', icon: '😮‍💨', price: 5, time: 2.6, blurb: 'A long, slumped breath out, with a little puff.' },
  { anim: 'eyeroll', label: 'Eye roll', icon: '🙄', price: 5, time: 2, blurb: 'The whole head rolls with it.' },
  { anim: 'think', label: 'Thinking', icon: '🤔', price: 5, time: 2.8, blurb: 'A chin rub while the dots go round.' },
  { anim: 'thumbsup', label: 'Thumbs up', icon: '👍', price: 5, time: 1.8, blurb: 'Nice one.' },
  { anim: 'salute', label: 'Salute', icon: '🫡', price: 10, time: 2.2, blurb: 'Chest out, paw to brow.' },
  { anim: 'bow', label: 'Bow', icon: '🙇', price: 10, time: 2.4, blurb: 'A deep and gracious bow.' },
  { anim: 'slowclap', label: 'Slow clap', icon: '👏', price: 10, time: 3, blurb: 'Clap. … Clap. … Clap.' },
  { anim: 'shush', label: 'Shush', icon: '🤫', price: 10, time: 2.2, blurb: 'Shh! A paw to the lips.' },
  { anim: 'yawn', label: 'Sleepy yawn', icon: '🥱', price: 10, time: 3, blurb: 'A big stretch, then the Z’s.' },
  { anim: 'sneeze', label: 'Sneeze', icon: '🤧', price: 10, time: 2.2, blurb: 'Ah… ah… ACHOO!' },
  { anim: 'blowkiss', label: 'Blow a kiss', icon: '😘', price: 10, time: 2, blurb: 'Mwah! A little heart floats off.' },
  { anim: 'peace', label: 'Peace sign', icon: '✌️', price: 10, time: 2, blurb: 'Two fingers up and a tilt of the head.' },
  { anim: 'hearthands', label: 'Heart hands', icon: '🫶', price: 15, time: 2.6, blurb: 'Paws together in a heart, hearts rising.' },
  { anim: 'flex', label: 'Flex', icon: '💪', price: 15, time: 2.4, blurb: 'Both arms up. Sparkles.' },
  { anim: 'dab', label: 'Dab', icon: '🫵', price: 15, time: 1.6, blurb: 'Still got it.' },
  { anim: 'loser', label: 'The L', icon: '🫲', price: 15, time: 2.2, blurb: 'An L on the forehead, for whoever just lost.' },
  { anim: 'fingerguns', label: 'Finger guns', icon: '👉', price: 15, time: 2, blurb: 'Pew pew. Ayyy.' },
  { anim: 'confused', label: 'Doing the maths', icon: '🧮', price: 15, time: 3, blurb: 'Question marks and sums swirling round the head.' },
  { anim: 'crylaugh', label: 'Crying laughing', icon: '😂', price: 15, time: 2.8, blurb: 'Laughing so hard the tears squirt out.' },
  { anim: 'ragequit', label: 'Rage quit', icon: '😤', price: 20, time: 2.4, blurb: 'Stomp, stomp, steam out the ears.' },
  { anim: 'sweat', label: 'Nervous sweat', icon: '😅', price: 20, time: 2.8, blurb: 'Collar tug, shifty eyes, beads of sweat.' },
  { anim: 'teasip', label: 'Sip of tea', icon: '🍵', price: 20, time: 3, blurb: 'Not my business. Sip.' },
  { anim: 'thisisfine', label: 'This is fine', icon: '🔥', price: 30, time: 3, blurb: 'Sat with a cuppa while little flames dance round.' },
  { anim: 'micdrop', label: 'Mic drop', icon: '🎤', price: 35, time: 2.6, blurb: 'Hold it out. Let it go. Walk away.' },
  { anim: 'doot', label: 'Tiny trumpet', icon: '🎺', price: 40, time: 2.4, blurb: 'Doot doot! Notes fly out.' },
];

const BY_ANIM = new Map<string, (typeof BUY_EMOTES)[number]>(BUY_EMOTES.map((e) => [e.anim, e]));
export const buyEmote = (anim: string | null | undefined) => (anim ? BY_ANIM.get(anim) : undefined);
export const isBuyEmote = (anim: string | null | undefined): anim is EmoteAnim => Boolean(anim && BY_ANIM.has(anim));
export const emoteKey = (anim: EmoteAnim) => `emote:${anim}`;
/** Whether a player may do this: anything that isn't a bought emote, or one they've bought. */
export const emoteOwned = (anim: Anim, p: { items?: string[] }) => !isBuyEmote(anim) || owns(p, emoteKey(anim));

// ---------------------------------------------------------------- the hotbar

export const HOTBAR_SIZE = 8;
/** A slot that opens a picker rather than playing something. */
export const PICK_DANCES = 'dances';
export const PICK_EMOTES = 'emotes';
/** What everyone starts with: the free emotes, then the two pickers. */
export const DEFAULT_HOTBAR: string[] = [...EMOTES.map((e) => e.anim), PICK_DANCES, PICK_EMOTES];

export const FREE_ICON: Record<string, string> = { wave: '👋', dance: '💃', cheer: '🙌', laugh: '😂', cry: '😢', sit: '🪑' };

/** One thing a slot can hold: its picture, its name and where it comes from. */
export interface HotChoice {
  id: string;
  label: string;
  icon: string;
  kind: 'free' | 'dance' | 'emote' | 'picker';
  price?: number;
}

/** Everything a slot can hold, in the order they're offered. */
export function hotChoices(): HotChoice[] {
  return [
    { id: PICK_DANCES, label: 'Dances', icon: '🪩', kind: 'picker' },
    { id: PICK_EMOTES, label: 'Emotes', icon: '🎭', kind: 'picker' },
    ...EMOTES.map((e) => ({ id: e.anim, label: e.label, icon: FREE_ICON[e.anim] ?? '✨', kind: 'free' as const })),
    ...DANCES.map((d) => ({ id: d.anim, label: d.label, icon: d.icon, kind: 'dance' as const, price: d.price })),
    ...BUY_EMOTES.map((e) => ({ id: e.anim, label: e.label, icon: e.icon, kind: 'emote' as const, price: e.price })),
  ];
}
export const hotChoice = (id: string) => hotChoices().find((c) => c.id === id);

/** Whether a slot's choice is this player's to use (the Storyteller has everything). */
export function hotOwned(id: string, p: { items?: string[] }, st = false): boolean {
  const c = hotChoice(id);
  if (!c) return false;
  if (st || !c.price) return true;
  return owns(p, `${c.kind === 'dance' ? 'dance' : 'emote'}:${id}`);
}

/** A hotbar from storage or the network: eight known choices or blanks (''), each used once at most. */
export function cleanHotbar(raw: unknown): string[] | null {
  if (!Array.isArray(raw)) return null;
  const seen = new Set<string>();
  const out = Array.from({ length: HOTBAR_SIZE }, (_, i) => {
    const id = raw[i];
    if (typeof id !== 'string' || !id || seen.has(id) || !hotChoice(id)) return '';
    seen.add(id);
    return id;
  });
  return out;
}

/**
 * The hotbar as it's used: the saved one (or the default), with anything not owned (a profile from another
 * Storyteller, say) put back to that slot's default if that's free, and otherwise left blank.
 */
export function shownHotbar(saved: string[] | null | undefined, p: { items?: string[] }, st = false): string[] {
  const slots = cleanHotbar(saved) ?? DEFAULT_HOTBAR;
  const out = slots.map((id) => (id && hotOwned(id, p, st) ? id : ''));
  return out.map((id, i) => (id || slots[i] === '' || out.includes(DEFAULT_HOTBAR[i]) ? id : DEFAULT_HOTBAR[i]));
}
