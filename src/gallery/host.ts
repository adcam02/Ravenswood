import { create } from 'zustand';
import { changeArt, credit, money, nameKey, profileOf, useProfiles } from '../game/profiles';
import { debugHooks, loadJSON, saveJSON, uid } from '../lib/util';
import { useHost } from '../state/host';
import { ui } from '../state/ui';
import { pickPrompt } from './prompts';
import { artStore } from './store';
import { ART_ID, ART_MAX, LATE_MS, PART, PRIZES, SAVED_MAX, type ArtPart, type GalleryAction, type GalleryView, type PieceView } from './types';

/**
 * The night's drawing and the gallery, run in the Storyteller's browser (see gallery/types.ts for how it goes).
 *
 * Nightfall picks the prompt (and closes the last gallery's voting, paying the top three); drawings sent in the night
 * are kept here; dawn hangs them. Who drew what is kept here and only sent once the voting is over.
 *
 * The pictures themselves are kept apart from everything else: in memory, and in this browser's IndexedDB
 * (gallery/store.ts), by id. A profile keeps only the ids of the pieces its player saved (Profile.art), so the book of
 * profiles, which goes round every player's browser as a backup, stays small. The artist's own browser keeps a copy
 * of each piece it saves too, and sends it back if this browser ever loses it.
 */

interface Entry {
  id: string;
  night: number;
  /** The artist: their seat's name when they sent it, and the key their profile is kept under. */
  name: string;
  key: string;
  at: number;
}

interface Show {
  /** The game (its start time) and night the pieces were drawn on, and what they were asked to draw. */
  game: number;
  night: number;
  prompt: string;
  entries: Entry[];
  /** Votes, by the voter's profile key: the piece each chose. */
  votes: Record<string, string>;
  open: boolean;
  /** When it went up (dawn). */
  since: number;
  /** Once the voting's closed: each piece's votes, and the place and prize of the top three. */
  results?: Record<string, { votes: number; place: number; prize: number }>;
}

interface Kept {
  /** Tonight's prompt, for which game and night. */
  tonight: { game: number; night: number; prompt: string; dawn?: number } | null;
  /** Drawings in for tonight so far. */
  drawn: Entry[];
  show: Show | null;
  /** Prompts used lately, so they don't come round again too soon. */
  used: string[];
}

const KEY = 'ravenswood:gallery';
const NOTE_MS = 8000;
const UPLOAD_MS = 60_000;
const DATA_URL = /^data:image\/(png|webp|jpeg);base64,[A-Za-z0-9+/=]+$/;

function load(): Kept {
  const raw = loadJSON<Partial<Kept> | null>(KEY, null);
  return { tonight: raw?.tonight ?? null, drawn: Array.isArray(raw?.drawn) ? raw.drawn : [], show: raw?.show ?? null, used: Array.isArray(raw?.used) ? raw.used.slice(-120) : [] };
}

/** Everything about the gallery but the pictures; `rev` counts changes, so players are sent their new views. */
export const useGallery = create<Kept & { rev: number }>(() => ({ ...load(), rev: 0 }));

function set(fn: (k: Kept) => Partial<Kept>) {
  useGallery.setState((s) => ({ ...fn(s), rev: s.rev + 1 }));
  const { tonight, drawn, show, used } = useGallery.getState();
  saveJSON(KEY, { tonight, drawn, show, used });
}
const bump = () => useGallery.setState((s) => ({ rev: s.rev + 1 }));

const notes = new Map<string, { text: string; ok: boolean; at: number }>();
function tell(player: string, text: string, ok: boolean) {
  notes.set(player, { text, ok, at: Date.now() });
  bump();
}

/** The seat in the game this browser has, with its name. */
function gameSeat(player: string) {
  const s = useHost.getState().g.seats.find((x) => x.playerId === player);
  return s?.name.trim() ? s : null;
}

const gameOf = () => useHost.getState().g.startedAt ?? 0;

// ---------------------------------------------------------------- the pictures

/** Pictures in memory, by id; `stored` lists those in IndexedDB too (read once at the start). */
const pictures = new Map<string, string>();
const stored = new Set<string>();

async function pictureOf(id: string): Promise<string | undefined> {
  const mem = pictures.get(id);
  if (mem) return mem;
  if (!stored.has(id)) return undefined;
  const img = await artStore.get(id);
  if (img) pictures.set(id, img);
  return img;
}

function keepPicture(id: string, img: string) {
  pictures.set(id, img);
  stored.add(id);
  void artStore.set(id, img);
}

/** Whether anyone still wants a picture: on show, in tonight's drawings, or kept in a profile. */
function wanted(id: string) {
  const { drawn, show } = useGallery.getState();
  if (drawn.some((e) => e.id === id) || show?.entries.some((e) => e.id === id)) return true;
  return Object.values(useProfiles.getState().profiles).some((p) => p.art?.some((a) => a.id === id));
}

function dropPicture(id: string) {
  if (wanted(id)) return;
  pictures.delete(id);
  stored.delete(id);
  void artStore.del(id);
}

/** Pictures on their way in, by player and upload. */
const uploads = new Map<string, { parts: string[]; n: number; at: number }>();

function receivePart(player: string, up: string, i: number, n: number, d: string) {
  if (!/^[a-z0-9]{4,24}$/.test(up) || !(n >= 1 && n <= Math.ceil(ART_MAX / PART)) || !(i >= 0 && i < n) || d.length > PART) return;
  const key = `${player}:${up}`;
  const now = Date.now();
  for (const [k, u] of uploads) if (now - u.at > UPLOAD_MS) uploads.delete(k);
  const u = uploads.get(key) ?? { parts: [], n, at: now };
  if (u.n !== n) return;
  u.parts[i] = d;
  u.at = now;
  uploads.set(key, u);
}

/** A whole picture, once all its pieces are in (and it's a picture of a sensible size), or null. */
function takeUpload(player: string, up: string): string | null {
  const key = `${player}:${up}`;
  const u = uploads.get(key);
  if (!u) return null;
  uploads.delete(key);
  if (u.parts.length !== u.n || u.parts.some((p) => typeof p !== 'string')) return null;
  const img = u.parts.join('');
  return img.length <= ART_MAX && DATA_URL.test(img) ? img : null;
}

/** Set by the network: sends one player a message. */
let sendArt: (player: string, part: ArtPart) => boolean = () => false;

async function sendPictures(player: string, ids: string[]) {
  for (const id of ids.slice(0, 40)) {
    if (!ART_ID.test(id)) continue;
    const img = await pictureOf(id);
    // (Nothing for an id we don't have: the asker shows an empty frame.)
    if (!img) {
      sendArt(player, { id, i: 0, n: 0, d: '' });
      continue;
    }
    const n = Math.ceil(img.length / PART);
    for (let i = 0; i < n; i++) sendArt(player, { id, i, n, d: img.slice(i * PART, (i + 1) * PART) });
    // A breath between pictures, so the world's updates aren't stuck behind a dozen of them.
    await new Promise((r) => setTimeout(r, 40));
  }
}

// ---------------------------------------------------------------- the night and the day

/** Night has fallen: the last gallery's voting closes, and there's something new to draw. */
function nightfall() {
  const g = useHost.getState().g;
  closeVoting();
  const { tonight, used } = useGallery.getState();
  if (tonight && tonight.game === gameOf() && tonight.night === g.day) return;
  const prompt = pickPrompt(used);
  set(() => ({ tonight: { game: gameOf(), night: g.day, prompt }, drawn: [], used: [...used, prompt].slice(-120) }));
}

/** Morning: the night's drawings go up in the gallery, anonymously, for everyone to vote on. */
function hang() {
  const { tonight, drawn, show } = useGallery.getState();
  if (!tonight || tonight.dawn || (show && show.game === tonight.game && show.night === tonight.night)) return;
  set(() => ({ tonight: { ...tonight, dawn: Date.now() } }));
  // (Nobody drew anything, or not yet: what's up stays up until a drawing comes.)
  if (drawn.length) putUp(drawn);
}

/** Tonight's drawings go up in place of whatever was hanging. */
function putUp(entries: Entry[]) {
  const { tonight, show } = useGallery.getState();
  if (!tonight) return;
  const old = show?.entries.map((e) => e.id) ?? [];
  set(() => ({ show: { game: tonight.game, night: tonight.night, prompt: tonight.prompt, entries, votes: {}, open: true, since: Date.now() }, drawn: [] }));
  for (const id of old) dropPicture(id);
}

/** The voting's over: who drew what is shown, and the top three are paid (a tie shares the place). */
export function closeVoting() {
  const { show } = useGallery.getState();
  if (!show?.open) return;
  const count: Record<string, number> = {};
  for (const id of Object.values(show.votes)) count[id] = (count[id] ?? 0) + 1;
  const results: NonNullable<Show['results']> = {};
  for (const e of show.entries) {
    const votes = count[e.id] ?? 0;
    const place = 1 + show.entries.filter((o) => (count[o.id] ?? 0) > votes).length;
    const prize = votes > 0 && place <= PRIZES.length ? PRIZES[place - 1] : 0;
    results[e.id] = { votes, place, prize };
    if (prize) credit({ name: e.name }, prize, `for your drawing (${['first', 'second', 'third'][place - 1]})`);
  }
  set(() => ({ show: { ...show, open: false, results } }));
  const top = winners(show.entries, results);
  ui.toast(top ? `The gallery’s voting has closed: ${top}` : 'The gallery’s voting has closed, with no votes this time.', 'info');
}

/** "Abbey won first prize ($15), …" for the top three, or '' if nobody had a vote. */
export function winners(entries: { id: string; name: string }[], results: NonNullable<Show['results']>) {
  return entries
    .filter((e) => results[e.id]?.prize)
    .sort((a, b) => results[a.id].place - results[b.id].place)
    .map((e) => `${e.name} ${['1st', '2nd', '3rd'][results[e.id].place - 1]} (${money(results[e.id].prize)})`)
    .join(', ');
}

/** Storyteller: another thing to draw tonight (only before anyone has sent one in). */
export function newPrompt() {
  const { tonight, drawn, used } = useGallery.getState();
  if (!tonight || drawn.length) return false;
  const prompt = pickPrompt([...used, tonight.prompt]);
  set(() => ({ tonight: { ...tonight, prompt }, used: [...used, prompt].slice(-120) }));
  return true;
}

let was: { phase: string; day: number; ended: boolean } | null = null;
function watchGame() {
  const g = useHost.getState().g;
  const now = { phase: g.phase, day: g.day, ended: Boolean(g.ended) };
  const prev = was;
  was = now;
  const night = now.phase === 'night' && !now.ended;
  if (!prev) {
    // (The Storyteller's page opening in the middle of a night.)
    if (night) nightfall();
    return;
  }
  if (night && (prev.phase !== 'night' || prev.ended || prev.day !== now.day)) nightfall();
  // Morning, or the game called in the night: up go the drawings.
  else if (prev.phase === 'night' && !prev.ended && (now.phase === 'day' || now.ended)) hang();
}

// ---------------------------------------------------------------- from players

function submit(player: string, up: string, night: number) {
  const img = takeUpload(player, up);
  const seat = gameSeat(player);
  if (!img || !seat) return tell(player, 'Your drawing didn’t arrive. Try sending it again.', false);
  const g = useHost.getState().g;
  const { tonight, drawn, show } = useGallery.getState();
  if (!tonight || tonight.game !== gameOf() || tonight.night !== night) return tell(player, 'That drawing was for another night.', false);
  const key = nameKey(seat.name);
  const entry: Entry = { id: uid(), night, name: seat.name, key, at: Date.now() };
  keepPicture(entry.id, img);
  if (g.phase === 'night' && !g.ended && g.day === night && !(show && show.night === night && show.game === tonight.game)) {
    const old = drawn.find((e) => e.key === key);
    set((k) => ({ drawn: [...k.drawn.filter((e) => e.key !== key), entry] }));
    if (old) dropPicture(old.id);
    return tell(player, old ? 'Your new drawing is in, in place of the first.' : 'Your drawing is in! It goes up in the gallery in the morning.', true);
  }
  // Just after dawn: one sent as the night ended (or left unsent, and sent for us) still goes up, if nobody has voted yet.
  if (tonight.dawn && Date.now() - tonight.dawn < LATE_MS) {
    if (!show || show.game !== tonight.game || show.night !== night) {
      putUp([entry]);
      return tell(player, 'Your drawing made it into the gallery!', true);
    }
    if (show.open && !Object.keys(show.votes).length) {
      // (In place of the one they sent earlier, if they changed it since.)
      const old = show.entries.find((e) => e.key === key);
      set((k) => ({ show: k.show && { ...k.show, entries: [...k.show.entries.filter((e) => e.key !== key), entry] } }));
      if (old) dropPicture(old.id);
      return tell(player, 'Your drawing made it into the gallery!', true);
    }
  }
  dropPicture(entry.id);
  tell(player, 'The night is over, so that drawing missed the gallery.', false);
}

function vote(player: string, id: string) {
  const seat = gameSeat(player);
  const { show } = useGallery.getState();
  if (!seat || !show?.open) return;
  const key = nameKey(seat.name);
  const entry = show.entries.find((e) => e.id === id);
  if (!entry) return;
  if (entry.key === key) return tell(player, 'That one’s yours! Vote for someone else’s.', false);
  if (show.votes[key] === id) return;
  set((k) => ({ show: k.show && { ...k.show, votes: { ...k.show.votes, [key]: id } } }));
}

function save(player: string, id: string) {
  const seat = gameSeat(player);
  if (!seat) return;
  const key = nameKey(seat.name);
  const { drawn, show } = useGallery.getState();
  const entry = [...drawn, ...(show?.entries ?? [])].find((e) => e.id === id);
  if (!entry || entry.key !== key) return;
  const prompt = show?.entries.includes(entry) ? show.prompt : (useGallery.getState().tonight?.prompt ?? '');
  const had = profileOf({ name: seat.name })?.art ?? [];
  if (had.some((a) => a.id === id)) return;
  if (had.length >= SAVED_MAX) return tell(player, `You’ve kept ${SAVED_MAX} drawings already. Let one go to keep this one.`, false);
  changeArt({ name: seat.name }, (art) => [...art, { id, prompt, at: entry.at }]);
  tell(player, 'Kept! Hang it in your flat with a “Your art” frame.', true);
}

function unsave(player: string, id: string) {
  const seat = gameSeat(player);
  if (!seat) return;
  if (!changeArt({ name: seat.name }, (art) => (art.some((a) => a.id === id) ? art.filter((a) => a.id !== id) : false))) return;
  dropPicture(id);
}

function restore(player: string, up: string, id: string) {
  const img = takeUpload(player, up);
  const seat = gameSeat(player);
  if (!img || !seat || pictures.has(id) || stored.has(id)) return;
  if (!profileOf({ name: seat.name })?.art?.some((a) => a.id === id)) return;
  keepPicture(id, img);
  bump();
}

/** A player's message about the drawing or the gallery. */
export function receiveGallery(player: string, raw: unknown) {
  if (!raw || typeof raw !== 'object') return;
  const a = raw as GalleryAction;
  const str = (v: unknown, max = 24) => String(v ?? '').slice(0, max);
  if (a.k === 'part') receivePart(player, str(a.up), Number(a.i), Number(a.n), typeof a.d === 'string' ? a.d : '');
  else if (a.k === 'submit') submit(player, str(a.up), Number(a.night));
  else if (a.k === 'restore') restore(player, str(a.up), str(a.id));
  else if (a.k === 'vote') vote(player, str(a.id));
  else if (a.k === 'want' && Array.isArray(a.ids)) void sendPictures(player, a.ids.map((x) => str(x)));
  else if (a.k === 'save') save(player, str(a.id));
  else if (a.k === 'unsave') unsave(player, str(a.id));
}

// ---------------------------------------------------------------- to players

/** The pieces in the order they hang: by id, which says nothing about who sent theirs first. */
const hanging = (show: Show) => [...show.entries].sort((a, b) => a.id.localeCompare(b.id));

function piecesOf(show: Show, key: string | null): PieceView[] {
  return hanging(show).map((e) => {
    const r = show.results?.[e.id];
    const p: PieceView = { id: e.id };
    if (key && e.key === key) p.mine = true;
    if (!show.open && r) Object.assign(p, { name: e.name, votes: r.votes, place: r.place, prize: r.prize || undefined });
    return p;
  });
}

/** What a player is sent: tonight's prompt in the night, what's hanging, and their own kept pieces. */
export function galleryFor(player: string): GalleryView | null {
  const seat = gameSeat(player);
  if (!seat) return null;
  const key = nameKey(seat.name);
  const g = useHost.getState().g;
  const { tonight, drawn, show } = useGallery.getState();
  const n = notes.get(player);
  const art = profileOf({ name: seat.name })?.art ?? [];
  return {
    tonight:
      tonight && g.phase === 'night' && !g.ended && tonight.night === g.day && tonight.game === gameOf()
        ? { night: tonight.night, prompt: tonight.prompt, sent: drawn.some((e) => e.key === key) }
        : null,
    show: show && { night: show.night, prompt: show.prompt, open: show.open, pieces: piecesOf(show, key), vote: show.votes[key] ?? null },
    saved: art.map((a) => (pictures.has(a.id) || stored.has(a.id) ? a : { ...a, lost: true })),
    note: n && Date.now() - n.at < NOTE_MS ? n : null,
  };
}

/** The Storyteller's own view: the same as anyone's, with how many have drawn tonight and voted today. */
export function galleryForST(): GalleryView & { drawnTonight: number; voters: number } {
  const g = useHost.getState().g;
  const { tonight, drawn, show } = useGallery.getState();
  return {
    tonight: tonight && g.phase === 'night' && !g.ended && tonight.night === g.day ? { night: tonight.night, prompt: tonight.prompt, sent: false } : null,
    show: show && { night: show.night, prompt: show.prompt, open: show.open, pieces: piecesOf(show, null), vote: null },
    saved: [],
    drawnTonight: drawn.length,
    voters: show ? Object.keys(show.votes).length : 0,
  };
}

/** For the Storyteller's own screen: a picture by id, from memory or storage. */
export const hostPicture = pictureOf;

let started = false;
/** Opens the gallery, in the Storyteller's browser; `send` passes a picture on to one player. */
export function startGallery(send: (player: string, part: ArtPart) => boolean) {
  sendArt = send;
  if (started) return;
  started = true;
  void artStore.keys().then((keys) => {
    for (const k of keys) stored.add(k);
    bump();
  });
  watchGame();
  useHost.subscribe((s, prev) => {
    if (s.g.phase !== prev.g.phase || s.g.day !== prev.g.day || s.g.ended !== prev.g.ended) watchGame();
  });
  setInterval(() => {
    const now = Date.now();
    let stale = false;
    for (const [p, n] of notes) {
      if (now - n.at < NOTE_MS) continue;
      notes.delete(p);
      stale = true;
    }
    if (stale) bump();
  }, 1000);
}

export const gallery = { close: closeVoting, newPrompt };

if (debugHooks()) Object.assign(window, { __gallery: { store: useGallery, receiveGallery, galleryFor, close: closeVoting, newPrompt, pictures } });
