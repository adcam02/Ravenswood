import { useEffect } from 'react';
import { debugHooks, loadJSON, saveJSON, uid } from '../lib/util';
import { player, useClient } from '../net/client';
import { ui } from '../state/ui';
import { galleryForST, hostPicture, useGallery } from './host';
import { artStore } from './store';
import { have, useArt } from './art';
export { useArt };
import { ART_H, ART_MAX, ART_W, PART, type GalleryView } from './types';

/**
 * The night's drawing and the gallery on this screen: the pictures (fetched by id and kept while the page is open),
 * sending a drawing in pieces, the draft kept between openings of the drawing panel (and sent for us at dawn if it
 * was never sent), and our own copies of the pieces we keep.
 */

type Mode = 'st' | 'player' | 'preview';

// ---------------------------------------------------------------- pictures by id

const asked = new Map<string, number>();
const ASK_AGAIN_MS = 15_000;

/** Asks for any of these pictures we haven't got (the Storyteller's own screen reads them from its own store). */
export function wantArt(ids: string[], mode: Mode) {
  if (mode === 'preview') return;
  const imgs = useArt.getState().imgs;
  const now = Date.now();
  const need = ids.filter((id) => id && imgs[id] === undefined && now - (asked.get(id) ?? 0) > ASK_AGAIN_MS);
  if (!need.length) return;
  for (const id of need) asked.set(id, now);
  if (mode === 'st') {
    for (const id of need) void hostPicture(id).then((img) => have(id, img ?? null));
    return;
  }
  // Our own kept pieces may be here already.
  for (const id of need) void artStore.get(`mine:${id}`).then((img) => img && useArt.getState().imgs[id] === undefined && have(id, img));
  player.gallery({ k: 'want', ids: need });
}

/** A picture by id, asked for if we haven't got it: the data URL, null if there's none, undefined while it comes. */
export function useArtImage(id: string | null | undefined, mode: Mode): string | null | undefined {
  const img = useArt((s) => (id ? s.imgs[id] : undefined));
  useEffect(() => {
    if (id && img === undefined) wantArt([id], mode);
  }, [id, img, mode]);
  return id ? img : undefined;
}

// ---------------------------------------------------------------- what we're sent

/** The gallery as this screen sees it. */
export function galleryNow(mode: Mode): (GalleryView & { drawnTonight?: number; voters?: number }) | null {
  if (mode === 'player') return useClient.getState().priv?.gallery ?? null;
  if (mode === 'st') return galleryForST();
  return null;
}

/** The same, kept fresh. */
export function useGalleryView(mode: Mode) {
  const priv = useClient((s) => (mode === 'player' ? (s.priv?.gallery ?? null) : null));
  useGallery((s) => (mode === 'st' ? s.rev : 0));
  return mode === 'player' ? priv : galleryNow(mode);
}

// ---------------------------------------------------------------- sending

/** Sends a picture up in pieces, then `then` names what it's for. */
function upload(img: string, then: (up: string) => void) {
  const up = uid();
  const n = Math.ceil(img.length / PART);
  for (let i = 0; i < n; i++) player.gallery({ k: 'part', up, i, n, d: img.slice(i * PART, (i + 1) * PART) });
  then(up);
}

/** The drawing as a small picture: WebP if this browser makes it, else JPEG, as good as fits under the limit. */
export function encodeArt(canvas: HTMLCanvasElement): string | null {
  for (const type of ['image/webp', 'image/jpeg']) {
    for (const q of [0.9, 0.8, 0.65, 0.5, 0.35]) {
      const url = canvas.toDataURL(type, q);
      // (A browser that can't make this type hands back a PNG instead: try the next type.)
      if (!url.startsWith(`data:${type}`)) break;
      if (url.length <= ART_MAX) return url;
    }
  }
  const png = canvas.toDataURL('image/png');
  return png.length <= ART_MAX ? png : null;
}

/** Sends our drawing for night `night`. */
export function submitArt(img: string, night: number) {
  upload(img, (up) => player.gallery({ k: 'submit', up, night }));
}

export const voteArt = (id: string) => player.gallery({ k: 'vote', id });

/** Keeps one of our own pieces (a copy stays in this browser too, in case the Storyteller's is ever lost). */
export function keepArt(id: string) {
  const img = useArt.getState().imgs[id];
  if (img) void artStore.set(`mine:${id}`, img);
  player.gallery({ k: 'save', id });
}

export function letGoArt(id: string) {
  void artStore.del(`mine:${id}`);
  player.gallery({ k: 'unsave', id });
}

// ---------------------------------------------------------------- the draft

/** The drawing in progress, kept in this browser between openings of the panel (a PNG, so nothing is lost). */
export interface Draft {
  room: string;
  night: number;
  img: string;
  /** Anything drawn on it at all. */
  marks: boolean;
  /** Sent in, as it is now. */
  sent: boolean;
}
const DRAFT_KEY = 'ravenswood:drawing';

export function loadDraft(room: string, night: number): Draft | null {
  const d = loadJSON<Draft | null>(DRAFT_KEY, null);
  return d && d.room === room && d.night === night && typeof d.img === 'string' ? d : null;
}
export function saveDraft(d: Draft) {
  saveJSON(DRAFT_KEY, d);
}

/** Dawn with a drawing left unsent: it goes in for us (if there's anything on it). */
async function sendLeftover(room: string, night: number) {
  const d = loadDraft(room, night);
  if (!d || d.sent || !d.marks) return;
  const img = await new Promise<HTMLImageElement | null>((resolve) => {
    const el = new Image();
    el.onload = () => resolve(el);
    el.onerror = () => resolve(null);
    el.src = d.img;
  });
  if (!img) return;
  const canvas = document.createElement('canvas');
  canvas.width = ART_W;
  canvas.height = ART_H;
  canvas.getContext('2d')?.drawImage(img, 0, 0);
  const small = encodeArt(canvas);
  if (!small) return;
  submitArt(small, night);
  saveDraft({ ...d, sent: true });
  ui.toast('Your drawing from last night went in to the gallery.', 'info');
}

/** Our kept pieces the Storyteller has lost: sent back from our own copies (once each per page). */
const restored = new Set<string>();
function restoreLost(view: GalleryView | null | undefined) {
  for (const a of view?.saved ?? []) {
    if (!a.lost || restored.has(a.id)) continue;
    restored.add(a.id);
    void artStore.get(`mine:${a.id}`).then((img) => img && upload(img, (up) => player.gallery({ k: 'restore', up, id: a.id })));
  }
}

let watching = false;
/** On a player's screen: sends a forgotten drawing at dawn, gives back lost pictures, and says who won. */
export function watchGallery() {
  if (watching) return;
  watching = true;
  useClient.subscribe((s, prev) => {
    const now = s.pub;
    const was = prev.pub;
    if (now && was && was.phase === 'night' && now.phase === 'day' && now.room === was.room) void sendLeftover(now.room, was.day);
    const g = s.priv?.gallery;
    if (g !== prev.priv?.gallery) restoreLost(g);
    // The voting has just closed: a word about who won.
    const show = g?.show;
    const before = prev.priv?.gallery?.show;
    if (show && before && before.open && !show.open && show.night === before.night) {
      const top = show.pieces
        .filter((p) => p.prize && p.place)
        .sort((a, b) => a.place! - b.place!)
        .map((p) => `${p.mine ? 'you' : p.name} ${['1st', '2nd', '3rd'][p.place! - 1]}`);
      ui.toast(top.length ? `🎨 The gallery’s winners: ${top.join(', ')}!` : '🎨 The gallery’s voting has closed.', 'info');
    }
  });
}

if (debugHooks()) Object.assign(window, { __art: { useArt, submitArt, wantArt, loadDraft } });
