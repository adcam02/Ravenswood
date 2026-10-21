import { create } from 'zustand';

/** A problem a player's game ran into, as the Storyteller hears of it. */
export interface Problem {
  who: string;
  message: string;
  where: string;
  /** Their page's build, to tell an out-of-date page from a real bug. */
  build: string;
  at: number;
}

/** Storyteller: problems players' games have reported this session (not saved). */
export const useProblems = create<{ list: Problem[] }>(() => ({ list: [] }));

export function noteProblem(p: Problem) {
  useProblems.setState((s) => ({ list: [...s.list.slice(-29), p] }));
}

let send: ((message: string, where: string) => void) | null = null;
const sent = new Set<string>();

/** Where reports go: set by a player's connection (the Storyteller sees their own problems on screen). */
export function reportTo(fn: ((message: string, where: string) => void) | null) {
  send = fn;
}

/** Noise from the browser or its extensions rather than the game. */
const IGNORE = /ResizeObserver loop|Script error\.?$|extension:\/\/|Could not connect to peer|Lost connection to server|play\(\) (request|failed)|The play\(\) request|AbortError/i;

/**
 * Tells the Storyteller something went wrong in this player's game, quietly: each different problem once, and
 * no more than a handful a session.
 */
export function reportProblem(error: unknown, where: string) {
  const message = (error instanceof Error ? `${error.name}: ${error.message}` : String(error)).slice(0, 300);
  if (!send || IGNORE.test(message) || sent.has(message) || sent.size >= 8) return;
  sent.add(message);
  try {
    send(message, where.slice(0, 80));
  } catch {
    /* never let reporting cause trouble of its own */
  }
}

/** Reports anything that slips past everything else on the page. */
export function watchForProblems() {
  window.addEventListener('error', (e) => reportProblem(e.error ?? e.message, 'page'));
  window.addEventListener('unhandledrejection', (e) => reportProblem(e.reason, 'promise'));
}
