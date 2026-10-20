import { memo, useRef, useState } from "react";
import {
  ChoiceRow,
  RippleRings,
  clamp,
  stepRipples,
  useFrame,
  useMain,
  type GameProps,
  type Ripple,
} from "./shared";
import { sfx } from "./sfx";

export type FishTier = "common" | "uncommon" | "rare" | "legendary";

export interface FishResult {
  kind: string;
  cm: number;
  stars: number;
  tier: FishTier;
}

export const TIER_LABEL: Record<FishTier, string> = {
  common: "Common",
  uncommon: "Uncommon",
  rare: "Rare",
  legendary: "Legendary",
};

interface Fish {
  name: string;
  tier: FishTier;
  /** How often it's the one biting, among its tier. */
  weight: number;
  cm: [number, number];
  body: string;
  belly: string;
  fin: string;
  eye?: string;
  long?: boolean;
  glow?: boolean;
  boot?: boolean;
  stripes?: boolean;
  spots?: boolean;
  whiskers?: boolean;
  crown?: boolean;
}

export const FISH: Fish[] = [
  {
    name: "Minnow",
    tier: "common",
    weight: 30,
    cm: [8, 14],
    body: "#b8c4cc",
    belly: "#e8eef0",
    fin: "#98a6b0",
  },
  {
    name: "Perch",
    tier: "common",
    weight: 28,
    cm: [14, 25],
    body: "#8fae5a",
    belly: "#e8e0a0",
    fin: "#e8823a",
    stripes: true,
  },
  {
    name: "Roach",
    tier: "common",
    weight: 28,
    cm: [10, 22],
    body: "#9fb0b8",
    belly: "#f0f0e8",
    fin: "#d8534a",
  },
  {
    name: "Old Boot",
    tier: "common",
    weight: 14,
    cm: [27, 31],
    body: "#6b4a32",
    belly: "#8a6446",
    fin: "#4a3222",
    boot: true,
  },
  {
    name: "Trout",
    tier: "uncommon",
    weight: 36,
    cm: [25, 50],
    body: "#9aa88a",
    belly: "#f2c4c0",
    fin: "#7d8a70",
    spots: true,
  },
  {
    name: "Carp",
    tier: "uncommon",
    weight: 34,
    cm: [30, 55],
    body: "#b8873e",
    belly: "#e8c98a",
    fin: "#9a6a2a",
  },
  {
    name: "Catfish",
    tier: "uncommon",
    weight: 30,
    cm: [35, 55],
    body: "#5e5a54",
    belly: "#a8a094",
    fin: "#4a4640",
    whiskers: true,
  },
  {
    name: "Pike",
    tier: "rare",
    weight: 36,
    cm: [55, 90],
    body: "#6a8a4a",
    belly: "#d8dca0",
    fin: "#5a7038",
    long: true,
  },
  {
    name: "Golden Carp",
    tier: "rare",
    weight: 34,
    cm: [45, 70],
    body: "#f2b632",
    belly: "#ffe28a",
    fin: "#e8892f",
    glow: true,
  },
  {
    name: "Silver Eel",
    tier: "rare",
    weight: 30,
    cm: [60, 90],
    body: "#aab4c0",
    belly: "#e6ecf2",
    fin: "#8893a0",
    long: true,
  },
  {
    name: "Moonfish",
    tier: "legendary",
    weight: 40,
    cm: [70, 120],
    body: "#bcd6f5",
    belly: "#f4f8ff",
    fin: "#8fb0e8",
    glow: true,
  },
  {
    name: "Raven Carp",
    tier: "legendary",
    weight: 35,
    cm: [75, 130],
    body: "#2d2a3a",
    belly: "#5a5470",
    fin: "#8f7fd0",
    eye: "#f2c94c",
    glow: true,
  },
  {
    name: "The Old One",
    tier: "legendary",
    weight: 25,
    cm: [100, 140],
    body: "#4f6b5a",
    belly: "#9fb8a4",
    fin: "#3a4e42",
    eye: "#e8504a",
    long: true,
    crown: true,
    glow: true,
  },
];

export type LureId = "worm" | "spinner" | "moon";

interface Lure {
  id: LureId;
  label: string;
  blurb: string;
  odds: Record<FishTier, number>;
  /** Scales the hook window: the fancier the lure, the quicker you must be. */
  window: number;
}

export const LURES: Lure[] = [
  {
    id: "worm",
    label: "Worm",
    blurb: "easy bites",
    odds: { common: 68, uncommon: 30, rare: 2, legendary: 0 },
    window: 1,
  },
  {
    id: "spinner",
    label: "Spinner",
    blurb: "bigger fish, quicker hook",
    odds: { common: 22, uncommon: 50, rare: 26, legendary: 2 },
    window: 0.85,
  },
  {
    id: "moon",
    label: "Moon lure",
    blurb: "legends bite, blink and they’re gone",
    odds: { common: 8, uncommon: 27, rare: 45, legendary: 20 },
    window: 0.7,
  },
];

type Tug = 1 | 2 | 3;
const HOOK_WINDOW: Record<Tug, number> = { 1: 1.0, 2: 0.75, 3: 0.55 };
const FIGHT: Record<
  Tug,
  {
    force: number;
    burst: [number, number];
    rest: [number, number];
    gain: number;
    snapAt: number;
  }
> = {
  1: { force: 22, burst: [0.5, 0.9], rest: [1.6, 3.0], gain: 26, snapAt: 0.9 },
  2: { force: 40, burst: [0.7, 1.3], rest: [1.1, 2.2], gain: 19, snapAt: 0.75 },
  3: { force: 48, burst: [0.9, 1.6], rest: [0.9, 1.7], gain: 15, snapAt: 0.6 },
};
const BAND = { lo: 35, hi: 70, red: 85 };
const rnd = (a: number, b: number) => a + Math.random() * (b - a);

function weighted<T>(items: T[], w: (x: T) => number): T {
  const total = items.reduce((n, x) => n + w(x), 0);
  let r = Math.random() * total;
  for (const x of items) {
    r -= w(x);
    if (r <= 0) return x;
  }
  return items[items.length - 1];
}

interface Catch {
  fish: Fish;
  cm: number;
  tug: Tug;
  window: number;
}

function rollCatch(lure: Lure): Catch {
  const tiers: FishTier[] = ["common", "uncommon", "rare", "legendary"];
  const tier = weighted(tiers, (t) => lure.odds[t]);
  const fish = weighted(
    FISH.filter((f) => f.tier === tier),
    (f) => f.weight,
  );
  const cm = Math.round(
    fish.cm[0] + (fish.cm[1] - fish.cm[0]) * Math.random() ** 1.5,
  );
  const tug: Tug =
    fish.boot || tier === "common"
      ? 1
      : tier === "uncommon"
        ? Math.random() < 0.2
          ? 1
          : 2
        : tier === "rare"
          ? Math.random() < 0.3
            ? 2
            : 3
          : 3;
  return { fish, cm, tug, window: HOOK_WINDOW[tug] * lure.window };
}

/** Stars come from the tier, with a bonus for a big one of its kind. */
export function starsFor(fish: Fish, cm: number): number {
  if (fish.boot) return 0;
  const frac = (cm - fish.cm[0]) / Math.max(1, fish.cm[1] - fish.cm[0]);
  if (fish.tier === "common") return frac >= 0.8 ? 2 : 1;
  if (fish.tier === "uncommon") return frac >= 0.75 ? 3 : 2;
  return 3;
}

export function FishArt({ kind, size = 64 }: { kind: string; size?: number }) {
  const f = FISH.find((x) => x.name === kind) ?? FISH[0];
  if (f.boot) {
    return (
      <svg viewBox="0 0 60 60" width={size} height={size} aria-hidden="true">
        <path
          d="M18 8 h18 v26 q0 4 4 5 l10 3 q6 2 6 8 v4 h-42 z"
          fill={f.body}
          stroke="#3a2618"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <rect x="14" y="50" width="44" height="5" rx="2" fill={f.fin} />
        <path
          d="M22 16 h10 M22 22 h10 M22 28 h10"
          stroke="#e8d8b0"
          strokeWidth="2"
        />
        <path
          d="M44 44 q4 -3 8 0"
          stroke="#7cc28b"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
        />
      </svg>
    );
  }
  const len = f.long ? 56 : 44;
  const ry = f.long ? 8 : 12;
  const cx = 8 + len / 2;
  return (
    <svg
      viewBox="0 0 76 40"
      width={size}
      height={(size * 40) / 76}
      aria-hidden="true"
      className={f.glow ? "job-glowfish" : ""}
    >
      <path d={`M${6 + len} 20 l11 -11 v22 z`} fill={f.fin} />
      <ellipse cx={cx} cy="20" rx={len / 2} ry={ry} fill={f.body} />
      <ellipse
        cx={cx}
        cy={20 + ry * 0.4}
        rx={len / 2.4}
        ry={ry * 0.5}
        fill={f.belly}
      />
      <path d={`M${cx - 6} ${20 - ry + 1} q8 -7 15 0`} fill={f.fin} />
      {f.stripes &&
        [0, 1, 2].map((i) => (
          <rect
            key={i}
            x={cx - 12 + i * 9}
            y={20 - ry + 2}
            width="3"
            height={ry * 2 - 4}
            rx="1.5"
            fill="#000"
            opacity="0.25"
          />
        ))}
      {f.spots &&
        [0, 1, 2, 3, 4].map((i) => (
          <circle
            key={i}
            cx={cx - 14 + i * 7}
            cy={15 + (i % 2) * 4}
            r="1.4"
            fill="#5a4a3a"
          />
        ))}
      {f.whiskers && (
        <path
          d="M8 22 q-6 2 -7 8 M9 24 q-4 4 -3 9"
          stroke="#3a3632"
          strokeWidth="1.5"
          fill="none"
        />
      )}
      {f.crown && (
        <path
          d={`M${cx - 9} ${20 - ry} l3 -7 l3 4 l3 -7 l3 7 l3 -4 l3 7 z`}
          fill="#f2c94c"
          stroke="#b8891a"
          strokeWidth="1"
        />
      )}
      <circle cx="15" cy="17" r="3.2" fill="#fff" />
      <circle cx="14.4" cy="17" r="1.8" fill={f.eye ?? "#2a2a2a"} />
      <path d="M9 23 q3 2 6 0" stroke="#3a3632" strokeWidth="1.2" fill="none" />
    </svg>
  );
}

export function LureArt({ id, size = 52 }: { id: LureId; size?: number }) {
  if (id === "worm") {
    return (
      <svg viewBox="0 0 48 48" width={size} height={size} aria-hidden="true">
        <path
          d="M8 30 q6 -16 14 -4 q6 10 12 -2 q4 -8 8 -2"
          fill="none"
          stroke="#d98a7a"
          strokeWidth="7"
          strokeLinecap="round"
        />
        <path
          d="M8 30 q6 -16 14 -4 q6 10 12 -2 q4 -8 8 -2"
          fill="none"
          stroke="#f0b0a0"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="3 5"
        />
        <circle cx="9.5" cy="28" r="1.4" fill="#3a2a2a" />
        <path
          d="M40 22 q6 2 4 8 q-2 4 -6 2"
          fill="none"
          stroke="#9aa6b0"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    );
  }
  if (id === "spinner") {
    return (
      <svg viewBox="0 0 48 48" width={size} height={size} aria-hidden="true">
        <line
          x1="24"
          y1="4"
          x2="24"
          y2="16"
          stroke="#9aa6b0"
          strokeWidth="1.5"
        />
        <ellipse
          cx="24"
          cy="24"
          rx="8"
          ry="11"
          fill="#d9dde3"
          stroke="#8c96a2"
          strokeWidth="1.5"
        />
        <path
          d="M20 16 q8 6 0 16"
          fill="none"
          stroke="#fff"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <circle cx="24" cy="37" r="3.2" fill="#e8504a" />
        <path
          d="M24 40 v3 q0 4 -4 3 q-2 -1 -2 -3"
          fill="none"
          stroke="#9aa6b0"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 48 48" width={size} height={size} aria-hidden="true">
      <circle cx="24" cy="24" r="22" fill="#2b2a4a" />
      <path
        d="M30 6 a16 16 0 1 0 0 32 a12 12 0 1 1 0 -32 z"
        fill="#ffe9a8"
        stroke="#f2c94c"
        strokeWidth="1.5"
        className="job-glowfish"
      />
      <circle cx="12" cy="14" r="1.4" fill="#fff" />
      <circle cx="9" cy="27" r="1" fill="#fff" />
      <circle cx="38" cy="36" r="1.2" fill="#fff" />
      <path
        d="M27 38 v3 q0 4 -4 3 q-2 -1 -2 -3"
        fill="none"
        stroke="#c9d2dc"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

type Phase = "lure" | "ready" | "cast" | "wait" | "bite" | "reel" | "done";

const ROD_BASE = { x: 58, y: 168 };
const LANDING = { x: 132, y: 142 };
const BAR = { x0: 30, x1: 290 };
const bx = (v: number) => BAR.x0 + (clamp(v, 0, 100) / 100) * (BAR.x1 - BAR.x0);

const Pond = memo(function Pond() {
  return (
    <g>
      <rect x="-200" y="-100" width="720" height="400" fill="url(#fish-pond)" />
      <path
        d="M-200 -100 h720 v130 q-50 14 -110 8 q-70 -8 -210 10 q-100 -8 -200 6 q-100 10 -200 -6 z"
        fill="#79b35a"
      />
      <path d="M-200 150 q60 -10 120 0 q40 8 80 4 v60 h-200 z" fill="#79b35a" />
      <path d="M320 150 q60 -10 120 0 q40 8 80 4 v60 h-200 z" fill="#79b35a" />
      {[40, 120, 230, 290].map((x, i) => (
        <ellipse
          key={x}
          cx={x}
          cy={18 + (i % 2) * 6}
          rx={22 + (i % 3) * 6}
          ry={13}
          fill="#5f9a46"
        />
      ))}
      <g
        className="job-glint"
        stroke="#fff"
        strokeOpacity="0.35"
        strokeWidth="2"
        strokeLinecap="round"
      >
        <line x1="150" y1="60" x2="172" y2="60" />
        <line x1="250" y1="80" x2="262" y2="80" />
        <line x1="180" y1="140" x2="206" y2="140" />
      </g>
      {[
        [272, 64],
        [292, 94],
        [250, 150],
      ].map(([x, y]) => (
        <path
          key={x}
          d={`M${x} ${y} m-11 0 a11 11 0 1 1 22 0 l-9 -2 z`}
          fill="#4f9a4a"
          stroke="#3b7a38"
          strokeWidth="1"
        />
      ))}
      <g stroke="#5a7a32" strokeWidth="2.5" strokeLinecap="round">
        <line x1="300" y1="170" x2="306" y2="128" />
        <line x1="310" y1="176" x2="312" y2="132" />
        <line x1="292" y1="178" x2="294" y2="142" />
      </g>
      <rect x="303" y="118" width="6" height="14" rx="3" fill="#7a4a2a" />
      <rect x="309" y="122" width="6" height="14" rx="3" fill="#7a4a2a" />
    </g>
  );
});

const Pier = memo(function Pier() {
  return (
    <g>
      {/* the pier */}
      <rect x="112" y="150" width="8" height="50" fill="#5a3a22" />
      <rect x="40" y="146" width="8" height="54" fill="#5a3a22" />
      <polygon points="0,136 128,146 128,158 0,150" fill="#a06a3e" />
      <polygon points="0,150 128,158 128,200 0,200" fill="#8a5a34" />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <line
          key={i}
          x1={i * 22}
          y1={136 + i * 1.6}
          x2={i * 22}
          y2="200"
          stroke="#6f4528"
          strokeWidth="1.5"
        />
      ))}
    </g>
  );
});

/** Fishing off the pier: pick a lure, cast, hook the tug in time, then play the fish on the line. */
export function Fishing({ finish, setHint }: GameProps<FishResult | null>) {
  const [phase, setPhaseState] = useState<Phase>("lure");
  const phaseRef = useRef<Phase>("lure");
  const [, redraw] = useState(0);
  const lure = useRef<Lure>(LURES[0]);
  const spot = useRef({ x: 220, y: 108 });
  const hooked = useRef<Catch | null>(null);
  /** Cast time, then seconds until the bite, then seconds since the bite. */
  const timer = useRef(0);
  const nibbleT = useRef(0);
  const dip = useRef(0);
  const scares = useRef(0);
  const holding = useRef(false);
  const ripples = useRef<Ripple[]>([]);
  const reel = useRef({
    tension: 0,
    progress: 0,
    bursting: false,
    burstT: 0,
    fray: 0,
    stall: 0,
    clickT: 0,
    strainT: 0,
    shake: 0,
    jx: 0,
    jy: 0,
  });

  const setPhase = (p: Phase) => {
    phaseRef.current = p;
    setPhaseState(p);
  };
  const ripple = (x: number, y: number, big = 1) =>
    ripples.current.push({ id: Math.random(), x, y, t: 0, big });
  const lose = (title: string, line: string) => {
    setPhase("done");
    finish(null, { stars: 0, title, line });
  };
  const fishAt = () => {
    const r = reel.current;
    const s = spot.current;
    const k = r.progress / 100;
    return {
      x: s.x + (LANDING.x - s.x) * k + r.jx,
      y: s.y + (LANDING.y - s.y) * k + r.jy,
    };
  };

  const land = () => {
    const c = hooked.current;
    if (!c) return;
    const f = c.fish;
    setPhase("done");
    sfx.splash();
    ripple(LANDING.x, LANDING.y, 2);
    const art = <FishArt kind={f.name} size={84} />;
    if (f.boot) {
      finish(
        { kind: f.name, cm: c.cm, stars: 0, tier: f.tier },
        {
          stars: 0,
          title: "An old boot…",
          line: `Someone lost this years ago. ${c.cm}cm of soggy leather.`,
          art,
        },
      );
      return;
    }
    const stars = starsFor(f, c.cm);
    const title =
      f.tier === "legendary"
        ? "LEGENDARY!"
        : f.tier === "rare"
          ? "Rare catch!"
          : undefined;
    finish(
      { kind: f.name, cm: c.cm, stars, tier: f.tier },
      {
        stars,
        title,
        line: `${f.name}, ${c.cm}cm · ${TIER_LABEL[f.tier]}`,
        art,
      },
    );
  };

  const main = useMain({
    enabled: phase !== "lure" && phase !== "done",
    onPress: () => {
      const p = phaseRef.current;
      if (p === "ready") {
        spot.current = {
          x: 196 + Math.random() * 60,
          y: 96 + Math.random() * 26,
        };
        timer.current = 0;
        setPhase("cast");
        sfx.cast();
        setHint("Casting…");
      } else if (p === "wait") {
        scares.current += 1;
        sfx.escape();
        ripple(spot.current.x, spot.current.y, 0.8);
        if (scares.current >= 3) {
          lose("Spooked!", "You scared every fish in the pond.");
          return;
        }
        timer.current = rnd(2, 8);
        setHint(
          `Too soon! Scared it off… (${3 - scares.current} more and they’re gone)`,
        );
      } else if (p === "bite") {
        setPhase("reel");
        holding.current = true;
        const r = reel.current;
        Object.assign(r, {
          tension: 20,
          progress: 0,
          bursting: false,
          burstT: rnd(0.6, 1.2),
          fray: 0,
          stall: 0,
          clickT: 0,
          strainT: 0,
          shake: 0,
        });
        sfx.lock();
        setHint("Hooked! Hold to reel, let go when the line strains.");
      } else if (p === "reel") holding.current = true;
    },
    onRelease: () => {
      holding.current = false;
    },
  });

  const reelStep = (dt: number) => {
    const c = hooked.current;
    if (!c) return;
    const f = FIGHT[c.tug];
    const r = reel.current;
    const legend = c.fish.tier === "legendary";
    const force = f.force + (legend ? 8 : 0);
    const gain = legend ? f.gain * 0.8 : f.gain;
    r.burstT -= dt;
    if (r.burstT <= 0) {
      r.bursting = !r.bursting;
      r.burstT = r.bursting ? rnd(...f.burst) : rnd(...f.rest);
      if (r.bursting) {
        [sfx.tugLight, sfx.tugMedium, sfx.tugHeavy][c.tug - 1]();
        r.shake = 1;
        const at = fishAt();
        ripple(at.x, at.y, 0.9 + c.tug * 0.3);
        setHint(
          c.tug === 3
            ? "It’s running! Ease off!"
            : "It’s fighting! Ease off a little…",
        );
      } else setHint("Reel! Keep the tension in the green.");
    }
    r.shake = Math.max(0, r.shake - dt * 2);
    if (r.bursting) {
      r.jx = Math.sin(performance.now() / 40) * 3 * c.tug;
      r.jy = Math.cos(performance.now() / 55) * 1.5 * c.tug;
    } else {
      r.jx *= 0.8;
      r.jy *= 0.8;
    }
    const before = r.progress;
    if (holding.current) {
      r.tension += (38 + (r.bursting ? force : 0)) * dt;
      r.clickT -= dt;
      if (r.clickT <= 0) {
        sfx.reel();
        r.clickT = 0.09;
      }
      if (r.tension >= BAND.lo && r.tension <= BAND.hi) r.progress += gain * dt;
      else if (r.tension > BAND.hi && r.tension <= BAND.red)
        r.progress += gain * 0.5 * dt;
    } else {
      r.tension -= (r.bursting ? 40 : 50) * dt;
      r.progress -= (r.bursting ? 4 : 2) * dt;
    }
    r.tension = clamp(r.tension, 0, 100);
    r.progress = clamp(r.progress, 0, 100);
    if (r.tension > BAND.red) {
      r.fray += dt;
      r.strainT -= dt;
      if (r.strainT <= 0) {
        sfx.strain();
        r.strainT = 0.22;
      }
      if (r.fray >= f.snapAt) {
        sfx.snap();
        lose(
          "Snap!",
          c.fish.tier === "common"
            ? "The line snapped. Over a tiddler, too."
            : "The line snapped! That was a big one…",
        );
        return;
      }
    } else if (r.tension > BAND.hi) {
      r.strainT -= dt;
      if (r.strainT <= 0) {
        sfx.strain();
        r.strainT = 0.4;
      }
      r.fray = Math.max(0, r.fray - dt * 0.3);
    } else r.fray = Math.max(0, r.fray - dt * 0.6);
    if (r.progress > before) r.stall = 0;
    else r.stall += dt;
    if (r.stall > 6) {
      sfx.escape();
      lose("Slipped off!", "It wriggled free while the line was slack.");
      return;
    }
    if (r.progress >= 100) land();
  };

  useFrame(
    (dt) => {
      const p = phaseRef.current;
      ripples.current = stepRipples(ripples.current, dt);
      dip.current = Math.max(0, dip.current - dt * 3);
      if (p === "cast") {
        timer.current += dt;
        if (timer.current >= 0.6) {
          setPhase("wait");
          timer.current = rnd(2, 8);
          nibbleT.current = rnd(1, 2.5);
          sfx.plop();
          ripple(spot.current.x, spot.current.y, 1);
          setHint("Wait for the tug…");
        }
      } else if (p === "wait") {
        timer.current -= dt;
        nibbleT.current -= dt;
        if (nibbleT.current <= 0 && timer.current > 0.6) {
          nibbleT.current = rnd(1.2, 3);
          dip.current = 0.5;
          sfx.nibble();
          ripple(spot.current.x, spot.current.y, 0.5);
        }
        if (timer.current <= 0) {
          const c = rollCatch(lure.current);
          hooked.current = c;
          setPhase("bite");
          timer.current = 0;
          dip.current = 1 + c.tug * 0.3;
          [sfx.tugLight, sfx.tugMedium, sfx.tugHeavy][c.tug - 1]();
          ripple(spot.current.x, spot.current.y, 0.8 + c.tug * 0.5);
          setHint(
            [
              "A nibble! Hook it!",
              "A bite! Hook it!",
              "A BIG one! Hook it NOW!",
            ][c.tug - 1],
          );
        }
      } else if (p === "bite") {
        timer.current += dt;
        if (hooked.current && timer.current > hooked.current.window) {
          sfx.escape();
          lose("Got away!", "Too slow. It spat the hook and swam off.");
        }
      } else if (p === "reel") reelStep(dt);
      redraw((n) => (n + 1) % 1e6);
    },
    phase !== "lure" && phase !== "done",
  );

  if (phase === "lure") {
    return (
      <div className="job-pick job-lures">
        <ChoiceRow
          options={LURES.map((l) => ({
            id: l.id,
            label: l.label,
            art: <LureArt id={l.id} />,
          }))}
          onPick={(id) => {
            lure.current = LURES.find((l) => l.id === id) ?? LURES[0];
            setPhase("ready");
            setHint("Tap the water or press Space to cast.");
          }}
        />
        <div className="job-caption">
          {LURES.map((l) => (
            <span key={l.id}>
              <b>{l.label}</b> {l.blurb}
            </span>
          ))}
        </div>
      </div>
    );
  }

  const r = reel.current;
  const c = hooked.current;
  const reeling = phase === "reel";
  const tension = reeling ? r.tension : 0;
  const at = reeling ? fishAt() : spot.current;
  const floatY = at.y + dip.current * 6;
  const tip = { x: 118 + tension * 0.08, y: 62 + tension * 0.32 };
  const sag = Math.max(tip.y, floatY) + 6 + (1 - tension / 100) * 16;
  const lineColor = r.fray > 0.05 ? "#e8504a" : "#ffffff";
  const castK = phase === "cast" ? Math.min(1, timer.current / 0.6) : 1;
  const showFloat =
    phase === "wait" || phase === "bite" || reeling || phase === "cast";
  const flyX = tip.x + (at.x - tip.x) * castK;
  const flyY =
    phase === "cast"
      ? tip.y + (floatY - tip.y) * castK - Math.sin(castK * Math.PI) * 50
      : floatY;
  const ringR = 15;
  const ringLeft =
    c && phase === "bite" ? Math.max(0, 1 - timer.current / c.window) : 0;
  const tug = c?.tug ?? 1;

  return (
    <div className="job-scene job-pond" {...main}>
      <svg
        viewBox="0 0 320 200"
        preserveAspectRatio="xMidYMid meet"
        className="job-svg"
      >
        <defs>
          <linearGradient
            id="fish-pond"
            x1="0"
            y1="0"
            x2="0"
            y2="200"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0" stopColor="#7fcbe0" />
            <stop offset="1" stopColor="#2f7f99" />
          </linearGradient>
        </defs>
        <Pond />
        <RippleRings list={ripples.current} />
        {reeling && (
          <g className={r.bursting ? "job-shake" : ""}>
            <ellipse
              cx={at.x}
              cy={at.y + 6}
              rx={14 + tug * 5 + (c?.fish.long ? 8 : 0)}
              ry={5 + tug}
              fill="#143844"
              opacity="0.55"
            />
            {r.bursting && (
              <text
                x={at.x + 10}
                y={at.y - 10}
                className="job-svg-bang job-bang"
                fontSize={14 + tug * 3}
              >
                {"!".repeat(tug)}
              </text>
            )}
          </g>
        )}
        <Pier />
        {/* the rod and line */}
        <path
          d={`M${ROD_BASE.x} ${ROD_BASE.y} Q 100 ${104 + tension * 0.2} ${tip.x} ${tip.y}`}
          fill="none"
          stroke="#5a3a22"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        <path
          d={`M${ROD_BASE.x} ${ROD_BASE.y} Q 100 ${104 + tension * 0.2} ${tip.x} ${tip.y}`}
          fill="none"
          stroke="#c9a062"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeDasharray="2 12"
        />
        <line
          x1={ROD_BASE.x - 6}
          y1={ROD_BASE.y + 10}
          x2={ROD_BASE.x + 8}
          y2={ROD_BASE.y - 12}
          stroke="#3a2414"
          strokeWidth="7"
          strokeLinecap="round"
        />
        {showFloat && (
          <path
            d={`M${tip.x} ${tip.y} Q ${(tip.x + flyX) / 2} ${phase === "cast" ? Math.min(tip.y, flyY) : sag} ${flyX} ${flyY}`}
            fill="none"
            stroke={lineColor}
            strokeOpacity="0.85"
            strokeWidth={1.2 + r.fray}
          />
        )}
        {showFloat && (
          <g transform={`translate(${flyX} ${flyY})`}>
            <path d="M-5 0 a5 5 0 0 1 10 0 z" fill="#e8504a" />
            <path d="M-5 0 a5 5 0 0 0 10 0 z" fill="#fff" />
            <rect x="-1" y="-10" width="2" height="6" fill="#e8504a" />
          </g>
        )}
        {phase === "wait" && (
          <text
            x={at.x}
            y={at.y - 16}
            textAnchor="middle"
            className="job-svg-label job-dots"
            fill="#fff"
            fontSize="16"
          >
            …
          </text>
        )}
        {phase === "bite" && c && (
          <g>
            <circle
              cx={flyX}
              cy={flyY}
              r={ringR}
              fill="none"
              stroke="#fff"
              strokeOpacity="0.4"
              strokeWidth="3"
            />
            <circle
              cx={flyX}
              cy={flyY}
              r={ringR}
              fill="none"
              stroke={["#ffe66d", "#ffa94d", "#ff5d5d"][tug - 1]}
              strokeWidth="3"
              strokeDasharray={`${2 * Math.PI * ringR * ringLeft} ${2 * Math.PI * ringR}`}
              transform={`rotate(-90 ${flyX} ${flyY})`}
            />
            <text
              x={flyX}
              y={flyY - 22}
              textAnchor="middle"
              className="job-svg-bang job-bang"
              fontSize={18 + tug * 5}
              fill={["#ffe66d", "#ffa94d", "#ff5d5d"][tug - 1]}
              stroke="#3a1a1a"
              strokeWidth="0.8"
            >
              {"!".repeat(tug)}
            </text>
          </g>
        )}
        {reeling && (
          <g>
            <rect
              x="20"
              y="148"
              width="280"
              height="48"
              rx="10"
              fill="#10303a"
              opacity="0.78"
            />
            <text
              x={BAR.x0}
              y="160"
              className="job-svg-label"
              fill="#cfe8f0"
              fontSize="9"
            >
              line tension
            </text>
            <text
              x={BAR.x1}
              y="160"
              textAnchor="end"
              className="job-svg-label"
              fill={r.fray > 0.05 ? "#ff7a7a" : "#cfe8f0"}
              fontSize="9"
            >
              {r.fray > 0.05
                ? "FRAYING!"
                : r.bursting
                  ? "fighting!"
                  : "green = reel"}
            </text>
            <rect
              x={bx(0)}
              y="163"
              width={bx(BAND.lo) - bx(0)}
              height="10"
              fill="#5f7f98"
            />
            <rect
              x={bx(BAND.lo)}
              y="163"
              width={bx(BAND.hi) - bx(BAND.lo)}
              height="10"
              fill="#5bbf6a"
            />
            <rect
              x={bx(BAND.hi)}
              y="163"
              width={bx(BAND.red) - bx(BAND.hi)}
              height="10"
              fill="#f2c14e"
            />
            <rect
              x={bx(BAND.red)}
              y="163"
              width={bx(100) - bx(BAND.red)}
              height="10"
              fill="#e8504a"
            />
            {r.fray > 0.05 && (
              <rect
                x={BAR.x0 - 2}
                y="161"
                width={BAR.x1 - BAR.x0 + 4}
                height="14"
                rx="4"
                fill="none"
                stroke="#ff5d5d"
                strokeWidth="2"
                className="job-dots"
              />
            )}
            <rect
              x={bx(r.tension) - 3}
              y="159"
              width="6"
              height="18"
              rx="3"
              fill="#fff"
              stroke="#10303a"
              strokeWidth="1.2"
            />
            <text
              x={BAR.x0}
              y="184"
              className="job-svg-label"
              fill="#cfe8f0"
              fontSize="9"
            >
              {c?.tug === 3
                ? "a big one"
                : c?.tug === 2
                  ? "a good one"
                  : "something small"}
            </text>
            <rect
              x={BAR.x0 + 70}
              y="179"
              width={BAR.x1 - BAR.x0 - 70}
              height="8"
              rx="4"
              fill="#20404a"
            />
            <rect
              x={BAR.x0 + 70}
              y="179"
              width={Math.max(0, ((BAR.x1 - BAR.x0 - 70) * r.progress) / 100)}
              height="8"
              rx="4"
              fill="#9ad4ff"
            />
            <path
              d={`M${BAR.x0 + 70 + ((BAR.x1 - BAR.x0 - 70) * r.progress) / 100} 183 l-7 -5 v10 z`}
              fill="#fff"
            />
          </g>
        )}
      </svg>
      {phase === "ready" && (
        <div className="job-tip">
          <span className="cosy-key">Space</span> to cast with the{" "}
          {lure.current.label.toLowerCase()}
        </div>
      )}
      {phase === "wait" && scares.current === 0 && (
        <div className="job-tip">
          Wait for the <b>!</b>, then press
        </div>
      )}
    </div>
  );
}
