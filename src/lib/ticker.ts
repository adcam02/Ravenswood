/**
 * Like setInterval, but it keeps time while the tab is hidden. Browsers slow a hidden page's own timers to about
 * once a second (and less after a while), but not a worker's: the worker just says when, and the page does the
 * work. Falls back to an ordinary interval wherever the worker can't start. Returns a function that stops it.
 */
export function steadyInterval(fn: () => void, ms: number): () => void {
  let plain: ReturnType<typeof setInterval> | null = null;
  const fallBack = () => {
    plain ??= setInterval(fn, ms);
  };
  let worker: Worker | null = null;
  try {
    const src = 'let t = null; onmessage = (e) => { clearInterval(t); if (e.data > 0) t = setInterval(() => postMessage(0), e.data); };';
    const url = URL.createObjectURL(new Blob([src], { type: 'text/javascript' }));
    worker = new Worker(url);
    let heard = false;
    worker.onmessage = () => {
      if (!heard) URL.revokeObjectURL(url);
      heard = true;
      fn();
    };
    // A worker that can't load says so later, not by throwing here.
    worker.onerror = () => {
      worker?.terminate();
      worker = null;
      fallBack();
    };
    worker.postMessage(ms);
  } catch {
    fallBack();
  }
  return () => {
    worker?.terminate();
    if (plain) clearInterval(plain);
  };
}
