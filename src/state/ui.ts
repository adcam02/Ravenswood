import { create } from 'zustand';
import { loadJSON, saveJSON } from '../lib/util';
import type { Ask, WakePanel } from './types';

export type Modal =
  | { kind: 'script' }
  | { kind: 'bag' }
  | { kind: 'wake' }
  /** 'note' is a player's private guess at what someone really is; 'claim' what they say they are. */
  | { kind: 'character'; seatId: string; purpose: 'role' | 'shown' | 'note' | 'claim' }
  | { kind: 'reminder'; seatId: string }
  | { kind: 'bluff'; index: number }
  | { kind: 'fabled' }
  | { kind: 'rename'; seatId: string }
  | { kind: 'share' }
  | { kind: 'settings' }
  | { kind: 'role'; roleId: string }
  | { kind: 'dawnCheck' }
  /** A player claiming to be the Slayer, choosing who to kill. */
  | { kind: 'slayer' }
  /** Who was who and how it went, once the game is over. */
  | { kind: 'recap' }
  /** Writing a letter at the post office. */
  | { kind: 'letter' }
  /** Opening the letters that have come, in bed at night. */
  | { kind: 'letters' }
  /** Hats and achievements: what's been earned, and what's still to find. */
  | { kind: 'awards' }
  /** Sending a messenger pigeon to someone. */
  | { kind: 'pigeon' }
  | null;

export type Pick =
  | { kind: 'nominee'; nominatorId: string | null }
  | { kind: 'swap'; seatId: string }
  | { kind: 'move'; seatId: string }
  /** `alignments`: during the game, alignments go with the characters too (a Snake Charmer), not stay put (a Barber). */
  | { kind: 'swapRole'; seatId: string; alignments?: boolean }
  | null;

export type Panel = 'night' | 'reference' | 'history' | 'notes' | 'journal' | null;

export interface WakeDraft {
  to: string[];
  panels: WakePanel[];
  active: number;
  ask: Ask;
  /** Cards only some of the people woken will see, by seat. */
  extra: Record<string, WakePanel[]>;
  sentId: string | null;
  /** The guided night's step this wake is for (its night-sheet key), if it came from there. */
  step?: string | null;
}

export const emptyPanel = (): WakePanel => ({ card: null, signs: [], roleIds: [], seatIds: [], text: '' });

interface UI {
  modal: Modal;
  panel: Panel;
  menuSeat: string | null;
  pick: Pick;
  hideGrimoire: boolean;
  /** Storyteller: the grimoire (the circle of tokens) is open over the town. */
  grimoireOpen: boolean;
  /** Storyteller: the night guide is open (rather than tucked away to a small tab). */
  nightGuide: boolean;
  muted: boolean;
  /** Soft background sound around the town. */
  ambience: boolean;
  draft: WakeDraft;
  toasts: { id: number; text: string; tone?: 'good' | 'evil' | 'info' }[];
  banner: { text: string; sub: string; key: number } | null;
}

const prefs = loadJSON<{ muted?: boolean; ambience?: boolean; panel?: Panel; nightGuide?: boolean }>('ravenswood:prefs', {});

export const useUI = create<UI>(() => ({
  modal: null,
  panel: prefs.panel ?? null,
  menuSeat: null,
  pick: null,
  hideGrimoire: false,
  grimoireOpen: false,
  nightGuide: prefs.nightGuide ?? true,
  muted: prefs.muted ?? false,
  ambience: prefs.ambience ?? true,
  draft: { to: [], panels: [emptyPanel()], active: 0, ask: null, extra: {}, sentId: null },
  toasts: [],
  banner: null,
}));

useUI.subscribe((s, p) => {
  if (s.muted !== p.muted || s.panel !== p.panel || s.ambience !== p.ambience || s.nightGuide !== p.nightGuide)
    saveJSON('ravenswood:prefs', { muted: s.muted, ambience: s.ambience, panel: s.panel, nightGuide: s.nightGuide });
});

export const ui = {
  open: (modal: Modal) => useUI.setState({ modal, menuSeat: null }),
  close: () => useUI.setState({ modal: null }),
  togglePanel: (panel: Exclude<Panel, null>) => useUI.setState((s) => ({ panel: s.panel === panel ? null : panel })),
  menu: (seatId: string | null) => useUI.setState({ menuSeat: seatId }),
  pick: (pick: Pick) => useUI.setState({ pick, menuSeat: null }),
  setDraft: (fn: (d: WakeDraft) => WakeDraft) => useUI.setState((s) => ({ draft: fn(s.draft) })),
  /** Opens the wake screen for these seats, optionally with cards already laid out (and the night step it's for). */
  wake: (to: string[], panels?: WakePanel[], ask: Ask = null, extra: Record<string, WakePanel[]> = {}, step: string | null = null) =>
    useUI.setState((s) => ({
      modal: { kind: 'wake' },
      menuSeat: null,
      draft: panels
        ? { to, panels, active: panels.length - 1, ask, extra, sentId: null, step }
        : { ...s.draft, to, sentId: s.draft.to.join() === to.join() ? s.draft.sentId : null },
    })),
  banner: (text: string, sub = '') => {
    const key = Date.now();
    useUI.setState({ banner: { text, sub, key } });
    setTimeout(() => useUI.setState((s) => (s.banner?.key === key ? { banner: null } : {})), 3200);
  },
  toast: (text: string, tone?: 'good' | 'evil' | 'info') => {
    const id = Date.now() + Math.random();
    useUI.setState((s) => ({ toasts: [...s.toasts.slice(-3), { id, text, tone }] }));
    setTimeout(() => useUI.setState((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })), 4200);
  },
};
