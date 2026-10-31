/**
 * Pictures kept in this browser, in IndexedDB rather than localStorage: a dozen drawings would crowd out everything
 * else in localStorage's few megabytes. Every call is safe to make anywhere: without IndexedDB (a private window,
 * blocked storage) reads find nothing and writes do nothing.
 */

const DB = 'ravenswood-art';
const STORE = 'art';

let opening: Promise<IDBDatabase | null> | null = null;
function db(): Promise<IDBDatabase | null> {
  opening ??= new Promise((resolve) => {
    try {
      const req = indexedDB.open(DB, 1);
      req.onupgradeneeded = () => req.result.createObjectStore(STORE);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
      req.onblocked = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
  return opening;
}

function run<T>(mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T>): Promise<T | undefined> {
  return db().then(
    (d) =>
      new Promise<T | undefined>((resolve) => {
        if (!d) return resolve(undefined);
        try {
          const req = fn(d.transaction(STORE, mode).objectStore(STORE));
          req.onsuccess = () => resolve(req.result);
          req.onerror = () => resolve(undefined);
        } catch {
          resolve(undefined);
        }
      }),
  );
}

export const artStore = {
  get: (key: string) => run<string>('readonly', (s) => s.get(key) as IDBRequest<string>).then((v) => (typeof v === 'string' ? v : undefined)),
  set: (key: string, value: string) => run('readwrite', (s) => s.put(value, key)).then(() => undefined),
  del: (key: string) => run('readwrite', (s) => s.delete(key)).then(() => undefined),
  keys: () => run<IDBValidKey[]>('readonly', (s) => s.getAllKeys()).then((k) => (k ?? []).map(String)),
};
