/**
 * PeerJS's JSON channel refuses any message of about 16 KB or more (it raises an error, and a link that errors is
 * dropped). So a big message (the profile backup, a crowded game's state) goes in numbered parts, each well under
 * that, and is put back together on the other side. Small messages go as they are.
 */

/** A piece of a big message. */
export interface Part {
  t: '_part';
  id: string;
  i: number;
  n: number;
  d: string;
}

/** Characters per part: even at four bytes each, and doubled by escaping, safely under the limit. */
const PART = 3000;
/** Bytes above which a message is sent in parts. */
const BIG = 15000;

const enc = new TextEncoder();
let seq = 0;

/** Sends `msg` with `send`, in parts if it's too big for one. */
export function sendBig(send: (m: unknown) => void, msg: unknown) {
  const json = JSON.stringify(msg);
  if (json.length < BIG / 4 || enc.encode(json).length < BIG) {
    send(msg);
    return;
  }
  const id = `${Date.now().toString(36)}${(seq++).toString(36)}`;
  const n = Math.ceil(json.length / PART);
  for (let i = 0; i < n; i++) send({ t: '_part', id, i, n, d: json.slice(i * PART, (i + 1) * PART) } satisfies Part);
}

/** Puts parts back together: give it every message that arrives; it returns the message to handle, or null. */
export function joiner() {
  const pending = new Map<string, { parts: string[]; got: number; at: number }>();
  return (raw: unknown): unknown => {
    const p = raw as Part;
    if (!p || typeof p !== 'object' || p.t !== '_part') return raw;
    if (typeof p.id !== 'string' || !Number.isInteger(p.i) || !Number.isInteger(p.n) || p.n < 1 || p.n > 2000 || p.i < 0 || p.i >= p.n || typeof p.d !== 'string') return null;
    // Forget half-arrived messages that will never finish.
    const now = Date.now();
    for (const [id, e] of pending) if (now - e.at > 60000) pending.delete(id);
    let e = pending.get(p.id);
    if (!e) pending.set(p.id, (e = { parts: new Array(p.n), got: 0, at: now }));
    if (e.parts[p.i] === undefined) {
      e.parts[p.i] = p.d;
      e.got++;
    }
    if (e.got < p.n) return null;
    pending.delete(p.id);
    try {
      return JSON.parse(e.parts.join(''));
    } catch {
      return null;
    }
  };
}
