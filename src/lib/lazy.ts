import { lazy, type ComponentType } from 'react';

const loaders: (() => Promise<unknown>)[] = [];

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * A part of the app (a dialog, the minigames) fetched the first time it's needed, so the first visit downloads
 * less. Each deploy gives these files new names, so a page left open across one could ask for a file that's
 * gone: preloadParts fetches them all quietly soon after the page loads, and a failed fetch is tried once more.
 */
export function lazyPart<C extends ComponentType<any>>(load: () => Promise<C>) {
  let pending: Promise<C> | null = null;
  const get = () =>
    (pending ??= load()
      .catch(() => wait(1500).then(load))
      .catch((e) => {
        pending = null;
        throw e;
      }));
  loaders.push(get);
  return lazy(() => get().then((c) => ({ default: c })));
}

/** Fetches every lazy part once the page has settled, so none is left to fetch mid-game. */
export function preloadParts() {
  const go = () => loaders.forEach((get) => get().catch(() => {}));
  setTimeout(() => ('requestIdleCallback' in window ? requestIdleCallback(go, { timeout: 4000 }) : go()), 3000);
}

/** Whether an error is a part of the app failing to download (usually because a newer version went live). */
export const isMissingPart = (e: unknown) =>
  /dynamically imported module|module script failed|error loading dynamically|failed to fetch|unable to preload|chunkloaderror/i.test(
    e instanceof Error ? e.message : String(e),
  );
