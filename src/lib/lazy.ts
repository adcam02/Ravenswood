import { lazy, type ComponentType } from 'react';
import { useHud } from '../game/hud';

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

/**
 * A module only some moments need (an execution's props, the hooded figure, the backup route), fetched the first
 * time it's asked for and preloaded quietly with the parts above. `now()` is the module once it has arrived (null
 * until then), for code that runs every frame and can wait a beat; `get()` fetches it.
 */
export function lazyModule<M>(load: () => Promise<M>) {
  let mod: M | null = null;
  let pending: Promise<M> | null = null;
  const get = () =>
    (pending ??= load()
      .catch(() => wait(1500).then(load))
      .then((m) => (mod = m))
      .catch((e) => {
        pending = null;
        throw e;
      }));
  loaders.push(get);
  /** Starts fetching it, if it isn't here or on its way already (cheap enough to call every frame). */
  const want = () => void (mod || pending || get().catch(() => {}));
  return { get, want, now: () => mod };
}

/**
 * Fetches every lazy part once the page has settled, so none is left to fetch mid-game: after the town's first
 * frame (so they don't hold it up on a slow line), or a while after loading where there's no town to wait for.
 */
export function preloadParts() {
  const go = () => loaders.forEach((get) => get().catch(() => {}));
  let started = false;
  const start = () => {
    if (started) return;
    started = true;
    stop();
    setTimeout(() => ('requestIdleCallback' in window ? requestIdleCallback(go, { timeout: 4000 }) : go()), 1500);
  };
  const stop = useHud.subscribe((s) => s.ready && start());
  setTimeout(start, 20000);
}

/** Whether an error is a part of the app failing to download (usually because a newer version went live). */
export const isMissingPart = (e: unknown) =>
  /dynamically imported module|module script failed|error loading dynamically|failed to fetch|unable to preload|chunkloaderror/i.test(
    e instanceof Error ? e.message : String(e),
  );
