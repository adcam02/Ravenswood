import { useEffect, useRef, useState, type ReactNode } from 'react';
import { sfx } from './sfx';

/** How a game reports how it went: the shell shows this for a moment, then hands the result on. */
export interface Summary {
  stars: number;
  /** Defaults to Perfect!, Nice!, Not bad! or Oops! by stars. */
  title?: string;
  line: string;
  art?: ReactNode;
}

export interface GameProps<R> {
  finish: (result: R, summary: Summary) => void;
  setHint: (hint: string) => void;
}

export const isMain = (e: KeyboardEvent) => e.key === ' ' || e.key === 'e' || e.key === 'E' || e.key === 'Enter';
export const isLeft = (e: KeyboardEvent) => e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A';
export const isRight = (e: KeyboardEvent) => e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D';

/**
 * Listens on the window before anything else does (the town listens for WASD and E too), and
 * swallows every key the handler says it used.
 */
export function useKeys(handler: (e: KeyboardEvent, down: boolean) => boolean | void) {
  const ref = useRef(handler);
  ref.current = handler;
  useEffect(() => {
    const make = (down: boolean) => (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
      if (ref.current(e, down)) {
        e.preventDefault();
        e.stopImmediatePropagation();
      }
    };
    const down = make(true);
    const up = make(false);
    window.addEventListener('keydown', down, true);
    window.addEventListener('keyup', up, true);
    return () => {
      window.removeEventListener('keydown', down, true);
      window.removeEventListener('keyup', up, true);
    };
  }, []);
}

/**
 * The main action: Space or E on the keyboard, or pressing on the game with a mouse or finger.
 * Spread the returned props onto the element that should take presses.
 */
export function useMain(opts: { onPress?: () => void; onRelease?: () => void; enabled?: boolean }) {
  const held = useRef(false);
  const ref = useRef(opts);
  ref.current = opts;
  const press = () => {
    if (held.current || ref.current.enabled === false) return;
    held.current = true;
    ref.current.onPress?.();
  };
  const release = () => {
    if (!held.current) return;
    held.current = false;
    ref.current.onRelease?.();
  };
  useKeys((e, down) => {
    if (!isMain(e)) return false;
    if (down) {
      if (!e.repeat) press();
    } else release();
    return true;
  });
  useEffect(() => {
    window.addEventListener('pointerup', release);
    window.addEventListener('pointercancel', release);
    window.addEventListener('blur', release);
    return () => {
      window.removeEventListener('pointerup', release);
      window.removeEventListener('pointercancel', release);
      window.removeEventListener('blur', release);
    };
  }, []);
  return {
    onPointerDown: (e: React.PointerEvent) => {
      if (e.button !== 0) return;
      e.preventDefault();
      press();
    },
  };
}

/** Calls `fn` every animation frame with the seconds since the last one, while `active`. */
export function useFrame(fn: (dt: number, t: number) => void, active = true) {
  const ref = useRef(fn);
  ref.current = fn;
  useEffect(() => {
    if (!active) return;
    let raf = 0;
    let last = performance.now();
    const start = last;
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      ref.current(dt, (now - start) / 1000);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [active]);
}

/** A timer that's cleared if the game closes first. */
export function useLater() {
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  return {
    later: (fn: () => void, ms: number) => {
      const t = setTimeout(fn, ms);
      timers.current.push(t);
      return t;
    },
    cancel: (t: ReturnType<typeof setTimeout> | null) => {
      if (t) clearTimeout(t);
    },
  };
}

export function Stars({ n, of = 3 }: { n: number; of?: number }) {
  return (
    <span className="cosy-stars job-stars" aria-label={`${n} of ${of} stars`}>
      {Array.from({ length: of }, (_, i) => (
        <span key={i} className={i < n ? 'on' : 'off'} style={{ animationDelay: `${0.15 + i * 0.12}s` }}>
          ★
        </span>
      ))}
    </span>
  );
}

export interface ChoiceOption<T extends string> {
  id: T;
  label: string;
  art: ReactNode;
}

/** A row of big choices: click one, or use the arrows and Space, or press its number. */
export function ChoiceRow<T extends string>({
  options,
  onPick,
  className = '',
}: {
  options: ChoiceOption<T>[];
  onPick: (id: T) => void;
  className?: string;
}) {
  const [at, setAt] = useState(0);
  const atRef = useRef(at);
  atRef.current = at;
  const pick = (i: number) => {
    sfx.pop();
    onPick(options[i].id);
  };
  useKeys((e, down) => {
    if (isLeft(e) || e.key === 'ArrowUp') {
      if (down) setAt((a) => (a + options.length - 1) % options.length);
      return true;
    }
    if (isRight(e) || e.key === 'ArrowDown') {
      if (down) setAt((a) => (a + 1) % options.length);
      return true;
    }
    if (isMain(e)) {
      if (down && !e.repeat) pick(atRef.current);
      return true;
    }
    const n = Number(e.key);
    if (n >= 1 && n <= options.length) {
      if (down) pick(n - 1);
      return true;
    }
    return false;
  });
  return (
    <div className={`job-choices ${className}`} role="listbox">
      {options.map((o, i) => (
        <button
          key={o.id}
          role="option"
          aria-selected={i === at}
          className={`job-choice ${i === at ? 'on' : ''}`}
          onClick={() => pick(i)}
          onPointerEnter={() => setAt(i)}
        >
          <span className="job-choice-art">{o.art}</span>
          <span className="job-choice-label">{o.label}</span>
          <span className="job-choice-num">{i + 1}</span>
        </button>
      ))}
    </div>
  );
}

/** A small ring that empties while a game waits to see if you're finished. */
export function SettleRing({ ms, label }: { ms: number; label: string }) {
  return (
    <div className="job-settle">
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="9" className="track" />
        <circle cx="12" cy="12" r="9" className="fill" style={{ animationDuration: `${ms}ms` }} />
      </svg>
      <span>{label}</span>
    </div>
  );
}

export const pickOne = <T,>(list: readonly T[]): T => list[Math.floor(Math.random() * list.length)];
export const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));

/** Little floating words over a scene ("Perfect!", "Miss"): call `pop`, render `pops` inside the scene. */
export function usePops() {
  const [pops, setPops] = useState<{ id: number; text: string; tone: number }[]>([]);
  const { later } = useLater();
  const pop = (text: string, tone: number) => {
    const id = Math.random();
    setPops((p) => [...p.slice(-2), { id, text, tone }]);
    later(() => setPops((p) => p.filter((x) => x.id !== id)), 800);
  };
  return {
    pop,
    pops: pops.map((p) => (
      <span key={p.id} className={`job-pop tone-${p.tone}`}>
        {p.text}
      </span>
    )),
  };
}

/** A set of rings spreading on water; push with `ripple`, step with `step`, draw with `draw`. */
export interface Ripple {
  id: number;
  x: number;
  y: number;
  t: number;
  big: number;
}

export function stepRipples(list: Ripple[], dt: number): Ripple[] {
  for (const r of list) r.t += dt;
  return list.filter((r) => r.t < 1.3);
}

export function RippleRings({ list, color = '#ffffff' }: { list: Ripple[]; color?: string }) {
  return (
    <g fill="none" stroke={color}>
      {list.map((r) => (
        <ellipse key={r.id} cx={r.x} cy={r.y} rx={(3 + r.t * 24) * r.big} ry={(1.2 + r.t * 9) * r.big} strokeOpacity={0.75 * (1 - r.t / 1.3)} strokeWidth="1.5" />
      ))}
    </g>
  );
}
