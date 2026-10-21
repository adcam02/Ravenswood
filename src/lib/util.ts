export function uid(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
}

const LETTERS = 'ABCDEFGHJKLMNPQRSTUVWXYZ';

export function roomCode(): string {
  let s = '';
  for (let i = 0; i < 5; i++) s += LETTERS[Math.floor(Math.random() * LETTERS.length)];
  return s;
}

export function shuffle<T>(list: T[]): T[] {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}

export function plural(n: number, one: string, many = `${one}s`): string {
  return `${n} ${n === 1 ? one : many}`;
}

export function joinNames(names: string[]): string {
  if (names.length <= 1) return names[0] ?? '';
  return `${names.slice(0, -1).join(', ')} & ${names[names.length - 1]}`;
}

export function loadJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

/** Saves to this browser. Returns false if it couldn't (storage full or blocked); the game carries on either way. */
export function saveJSON(key: string, value: unknown): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    // Full, most likely: the animal pictures kept from the join screen are the big thing to let go of.
    try {
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const k = localStorage.key(i);
        if (k?.startsWith('ravenswood:thumb')) localStorage.removeItem(k);
      }
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  }
}

/** Test hooks on window: always in development, and on the published site with ?debug. */
export const debugHooks = (): boolean => import.meta.env.DEV || new URLSearchParams(location.search).has('debug');

/**
 * Tests only (?debug&bot): a stand-in player that does everything but draw (no 3D, no animal pictures), so a
 * machine without a graphics card can run a whole town of them.
 */
export const botMode = (): boolean => debugHooks() && new URLSearchParams(location.search).has('bot');
