/**
 * Like setInterval, but it keeps time while the tab is hidden. Browsers slow a hidden page's own timers to about
 * once a second (and less after a while), but not a worker's: the worker just says when, and the page does the
 * work. Falls back to an ordinary interval where workers aren't allowed. Returns a function that stops it.
 */
export function steadyInterval(fn: () => void, ms: number): () => void {
  try {
    const src = 'let t = null; onmessage = (e) => { clearInterval(t); if (e.data > 0) t = setInterval(() => postMessage(0), e.data); };';
    const url = URL.createObjectURL(new Blob([src], { type: 'text/javascript' }));
    const worker = new Worker(url);
    URL.revokeObjectURL(url);
    worker.onmessage = () => fn();
    worker.postMessage(ms);
    return () => worker.terminate();
  } catch {
    const t = setInterval(fn, ms);
    return () => clearInterval(t);
  }
}
