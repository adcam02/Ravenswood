import { memo, useEffect, useRef, useState } from 'react';
import { clamp, useFrame, useLater, useMain, usePops, type GameProps } from './shared';
import { sfx } from './sfx';

/** Ticks with the pendulum in view and the clock ticking, then ticks to keep with the case shut and the clock quiet. */
const LEAD = 8;
const KEEP = 8;
/** A missed tick or an extra tap counts as this far off (ms), and nothing counts as worse. */
const MISS_MS = 250;
/**
 * A steady lag (or rush) the lead-in can excuse, in ms: screens, speakers and keyboards all run a little behind,
 * some more than others. It's measured from the player's taps along with the ticks.
 */
const LAG_ALLOW = 30;
/** Ticks are booked this far ahead (ms), so they land right on the beat whatever the frame rate. */
const BOOK_AHEAD = 120;
/** Degrees the pendulum swings either side. */
const SWING = 20;

const ESC = { x: 160, y: 46, r: 17 };
const GEAR_L = { x: 125, y: 52, r: 14 };
const GEAR_R = { x: 194, y: 39, r: 13 };
const ANCHOR = { x: 160, y: 22 };
const DIAL = { x: 268, y: 60, r: 32 };
/** The window in the case, where the pendulum hangs. */
const WIN = { x0: 122, x1: 198, y0: 94, y1: 190 };
const PIVOT = { x: 160, y: 98 };
const ROD = 66;

/** Out of 100 from the average miss: 30ms is 88, 75ms is 70, a whole tick missed is 0. */
const accuracyOf = (ms: number) => clamp(Math.round(100 - (ms / MISS_MS) * 100), 0, 100);
/** Three stars for an average miss of about 32ms or less, two for 75ms or less (after any steady lag is excused). */
const starsOf = (accuracy: number) => (accuracy >= 87 ? 3 : accuracy >= 70 ? 2 : accuracy > 0 ? 1 : 0);

const toneOf = (err: number) => {
  const a = Math.abs(err);
  return a <= 25 ? 3 : a <= 60 ? 2 : a <= 120 ? 1 : 0;
};
const wordFor = (err: number) => {
  const a = Math.abs(err);
  const early = err < 0;
  if (a <= 25) return 'Spot on!';
  if (a <= 60) return early ? 'A touch early' : 'A touch late';
  if (a <= 120) return early ? 'Early' : 'Late';
  return early ? 'Way early!' : 'Way late!';
};
const PIP_COLOURS = ['#e8504a', '#4f8fe0', '#5bbf6a', '#f2c14e'];

const smooth = (x: number) => {
  const u = clamp(x, 0, 1);
  return u * u * (3 - 2 * u);
};
/** Eases to 1 with a little overshoot, like a wheel jumping on a tooth and settling. */
const kick = (x: number) => {
  const u = clamp(x, 0, 1) - 1;
  return 1 + 2.7 * u * u * u + 1.7 * u * u;
};

/** A point `r` out from the middle at angle `a` (clockwise from twelve o'clock). */
const pt = (a: number, r: number) => `${(Math.sin(a) * r).toFixed(2)} ${(-Math.cos(a) * r).toFixed(2)}`;

/** A wheel's outline round its middle: `teeth` teeth `depth` deep; `hook` gives the escape wheel's raked teeth. */
function gearPath(teeth: number, r: number, depth: number, hook = false): string {
  const step = (Math.PI * 2) / teeth;
  let d = '';
  for (let i = 0; i < teeth; i++) {
    const a = i * step;
    const pts: [number, number][] = hook
      ? [
          [a, r - depth],
          [a + step * 0.72, r],
          [a + step * 0.8, r - depth],
        ]
      : [
          [a, r - depth],
          [a + step * 0.18, r],
          [a + step * 0.48, r],
          [a + step * 0.66, r - depth],
        ];
    for (const [pa, pr] of pts) d += `${d ? 'L' : 'M'}${pt(pa, pr)} `;
  }
  return `${d}Z`;
}

/** Four windows cut between a wheel's spokes, from radius `r0` out to `r1`. */
function spokeHoles(r0: number, r1: number, gap: number): string {
  let d = '';
  for (let i = 0; i < 4; i++) {
    const a0 = (i * Math.PI) / 2 + gap;
    const a1 = ((i + 1) * Math.PI) / 2 - gap;
    d += `M${pt(a0, r1)} A${r1} ${r1} 0 0 1 ${pt(a1, r1)} L${pt(a1, r0)} A${r0} ${r0} 0 0 0 ${pt(a0, r0)} Z `;
  }
  return d;
}

const ESC_PATH = gearPath(15, ESC.r, 4.5, true);
const ESC_HOLES = spokeHoles(3.5, ESC.r - 7.5, 0.28);
const GEAR_L_PATH = gearPath(20, GEAR_L.r, 2.6);
const GEAR_R_PATH = gearPath(18, GEAR_R.r, 2.6);

export function ClockArt({ size = 44 }: { size?: number }) {
  return (
    <svg viewBox="0 0 48 48" width={size} height={size} aria-hidden="true">
      <path d="M13 4 h22 a4 4 0 0 1 4 4 v15 l-4 3 v16 a3 3 0 0 1 -3 3 h-16 a3 3 0 0 1 -3 -3 v-16 l-4 -3 v-15 a4 4 0 0 1 4 -4 z" fill="#8a5a34" stroke="#5e3a22" strokeWidth="1.5" />
      <circle cx="24" cy="15" r="8.5" fill="#f6efe0" stroke="#c9a24f" strokeWidth="2" />
      <path d="M24 15 v-6 M24 15 l4 2.5" stroke="#2f3833" strokeWidth="1.8" strokeLinecap="round" />
      <rect x="18" y="27" width="12" height="15" rx="2" fill="#3a3028" />
      <path d="M24 27 l-3 10" stroke="#9aa0a8" strokeWidth="1.3" />
      <circle cx="21" cy="37.5" r="2.8" fill="#c9a24f" />
    </svg>
  );
}

const Room = memo(function Room() {
  return (
    <g>
      <rect x="-200" y="-100" width="720" height="400" fill="url(#clock-wall)" />
      {/* big wheels high on the back wall, faint in the dim */}
      <g fill="none" stroke="#b9ab92" strokeWidth="5" opacity="0.6">
        <circle cx="-34" cy="40" r="44" />
        <circle cx="-34" cy="40" r="8" />
        <path d="M-34 -4 v88 M-78 40 h88" />
        <circle cx="352" cy="128" r="30" />
        <path d="M352 98 v60 M322 128 h60" />
      </g>
      {/* a slit window and the light coming in */}
      <path d="M26 96 h18 L118 200 h-60 z" fill="#fff6d8" opacity="0.13" />
      <path d="M24 98 v-64 a11 11 0 0 1 22 0 v64 z" fill="#5e4a3a" />
      <path d="M27 95 v-61 a8 8 0 0 1 16 0 v61 z" fill="#bfe0ef" />
      <path d="M27 70 q8 -6 16 -2 v27 h-16 z" fill="#9cc98a" />
      <path d="M35 26 v69 M27 60 h16" stroke="#5e4a3a" strokeWidth="2" />
      {/* the bell rope and its sally */}
      <line x1="76" y1="-100" x2="76" y2="132" stroke="#c9b48a" strokeWidth="3" />
      {['#b8323a', '#f2ece0', '#2f4f8f', '#f2ece0', '#b8323a', '#f2ece0', '#2f4f8f'].map((c, i) => (
        <rect key={i} x="72.5" y={96 + i * 5} width="7" height="5.2" rx="1.5" fill={c} />
      ))}
      <path d="M73 132 l3 8 l3 -8 z" fill="#c9b48a" />
      {/* panelling and the floor */}
      <rect x="-200" y="150" width="720" height="150" fill="#7d6a58" />
      {Array.from({ length: 30 }, (_, i) => (
        <line key={i} x1={-196 + i * 24} y1="154" x2={-196 + i * 24} y2="196" stroke="#6c5a4a" strokeWidth="2" />
      ))}
      <rect x="-200" y="147" width="720" height="6" fill="#5e4a3a" />
      <rect x="-200" y="195" width="720" height="105" fill="#958f85" />
    </g>
  );
});

const FrameBack = memo(function FrameBack() {
  return (
    <g>
      <rect x="104" y="15" width="112" height="62" rx="2" fill="#46524c" />
      <path d="M104 15 h112 v4 h-112 z" fill="#3a443f" />
      {/* the rod off to the dial */}
      <rect x="220" y={DIAL.y - 2} width={DIAL.x - DIAL.r - 220} height="4" fill="#9aa0a8" />
      <rect x="221" y={DIAL.y - 5} width="8" height="10" rx="1.5" fill="#2f3833" />
    </g>
  );
});

const FrameFront = memo(function FrameFront() {
  return (
    <g fill="#2f3833">
      <rect x="98" y="10" width="124" height="7" rx="2" />
      <rect x="98" y="75" width="124" height="7" rx="2" />
      <rect x="98" y="10" width="6" height="72" />
      <rect x="216" y="10" width="6" height="72" />
      {[101, 219].map((x) => (
        <g key={x}>
          <circle cx={x} cy="9" r="3.6" fill="#c9a24f" />
          <circle cx={x} cy="83" r="3.6" fill="#c9a24f" />
        </g>
      ))}
    </g>
  );
});

const Case = memo(function Case() {
  return (
    <g>
      {/* the dark inside, behind the pendulum */}
      <rect x={WIN.x0} y={WIN.y0} width={WIN.x1 - WIN.x0} height={WIN.y1 - WIN.y0} fill="url(#clock-inside)" />
      {/* the beat scale, with the red mark the pendulum should pass on every tick */}
      <rect x="134" y="186" width="52" height="3" rx="1" fill="#a8843a" />
      {[-3, -2, -1, 1, 2, 3].map((k) => (
        <rect key={k} x={159.25 + k * 8} y="182" width="1.5" height="4" fill="#c9a24f" />
      ))}
      <rect x="158.5" y="179" width="3" height="8" rx="1" fill="#b8323a" />
      {/* the suspension the pendulum hangs from */}
      <rect x="152" y="93" width="16" height="6" rx="1.5" fill="#c9a24f" />
    </g>
  );
});

const CaseFront = memo(function CaseFront() {
  return (
    <g>
      <path d={`M110 84 h100 v114 h-100 z M${WIN.x0} ${WIN.y0} v${WIN.y1 - WIN.y0} h${WIN.x1 - WIN.x0} v${WIN.y0 - WIN.y1} z`} fill="#8a5a34" fillRule="evenodd" />
      <rect x={WIN.x0 - 2} y={WIN.y0 - 2} width={WIN.x1 - WIN.x0 + 4} height={WIN.y1 - WIN.y0 + 4} fill="none" stroke="#5e3a22" strokeWidth="2.5" rx="2" />
      <rect x="105" y="79" width="110" height="8" rx="2" fill="#6b4528" />
      <rect x="105" y="194" width="110" height="5" rx="1.5" fill="#6b4528" />
      {/* the glass */}
      <path d={`M${WIN.x0 + 8} ${WIN.y1} L${WIN.x0 + 40} ${WIN.y0} h10 L${WIN.x0 + 18} ${WIN.y1} z`} fill="#fff" opacity="0.07" />
      <path d={`M${WIN.x0 + 46} ${WIN.y1} L${WIN.x0 + 72} ${WIN.y0 + 14} v8 L${WIN.x0 + 52} ${WIN.y1} z`} fill="#fff" opacity="0.05" />
    </g>
  );
});

const DialFace = memo(function DialFace() {
  return (
    <g>
      <circle cx={DIAL.x} cy={DIAL.y} r={DIAL.r + 5} fill="#c9a24f" stroke="#8a6a2a" strokeWidth="1.5" />
      <circle cx={DIAL.x} cy={DIAL.y} r={DIAL.r} fill="#f6efe0" />
      {Array.from({ length: 60 }, (_, i) => {
        const big = i % 5 === 0;
        const a = (i / 60) * 360;
        return (
          <rect
            key={i}
            x={DIAL.x - (big ? 1.2 : 0.5)}
            y={DIAL.y - DIAL.r + 2}
            width={big ? 2.4 : 1}
            height={big ? 6 : 3}
            fill="#2f3833"
            transform={`rotate(${a} ${DIAL.x} ${DIAL.y})`}
          />
        );
      })}
      <text x={DIAL.x} y={DIAL.y - DIAL.r + 17} textAnchor="middle" className="job-svg-label" fill="#2f3833" fontSize="8">
        XII
      </text>
      {/* the hour hand, near enough ten */}
      <path d={`M${DIAL.x} ${DIAL.y} l-1.8 0 l1.8 -15 l1.8 15 z`} fill="#2f3833" transform={`rotate(-62 ${DIAL.x} ${DIAL.y})`} />
    </g>
  );
});

interface Plan {
  bpm: number;
  /** One beat, in ms. */
  T: number;
  /** When the pendulum is let go, and when it first passes the mark (performance.now() times). */
  release: number;
  t0: number;
}

type Stage = 'lead' | 'keep' | 'reveal';

/**
 * Keeping time in the clock tower: catch the beat from the pendulum and its ticks, then keep tapping in time with
 * the case shut and the clock gone quiet. Every tap moves the escapement on, so the clock only runs as well as you do.
 */
export function Clock({ finish, setHint }: GameProps<{ accuracy: number; ms: number; bpm: number; stars: number }>) {
  const [plan] = useState<Plan>(() => {
    const bpm = 70 + Math.floor(Math.random() * 31);
    const T = 60000 / bpm;
    const release = performance.now() + 900;
    return { bpm, T, release, t0: release + T / 2 };
  });
  const [, redraw] = useState(0);
  const [over, setOver] = useState(false);
  const stage = useRef<Stage>('lead');
  /** How far off the taps along with the ticks were (signed ms), for the player's own steady lag. */
  const leadErrs = useRef<number[]>([]);
  const lag = useRef<number | null>(null);
  /** Each tick kept with the case shut: how far off its tap was (signed ms), or null if it hasn't had one. */
  const kept = useRef<(number | null)[]>(Array.from({ length: KEEP }, () => null));
  const extra = useRef(0);
  const taps = useRef(0);
  /** The escapement: how many ticks it has moved on, when it last did, and which way the anchor last rocked. */
  const steps = useRef(0);
  const stepAt = useRef(0);
  const side = useRef(1);
  const nextBook = useRef(0);
  const nextBeat = useRef(0);
  const booked = useRef<{ at: number; stop: () => void }[]>([]);
  const revealAt = useRef(0);
  const { pop, pops } = usePops();
  const { later } = useLater();

  const beatAt = (k: number) => plan.t0 + k * plan.T;
  const keepFrom = beatAt(LEAD) - plan.T / 2;
  const keepTo = beatAt(LEAD + KEEP - 1) + plan.T / 2;
  const shutFrom = beatAt(LEAD - 1) + plan.T * 0.08;
  const shutTo = beatAt(LEAD - 1) + plan.T * 0.55;
  /** The pendulum's angle: held out to one side, then let go to pass the mark on every beat. */
  const swingAt = (now: number) => (now < plan.release ? -SWING : SWING * Math.sin((Math.PI * (now - plan.t0)) / plan.T));

  // Ticks already booked with the speakers are silenced if the game closes first.
  useEffect(
    () => () => {
      for (const b of booked.current) b.stop();
      booked.current = [];
    },
    [],
  );

  /** The player's steady lag, from the middle of their taps along with the ticks; none if they didn't tap along. */
  const lagOf = () => {
    if (lag.current === null) {
      const e = [...leadErrs.current].sort((a, b) => a - b);
      const n = e.length;
      const mid = n >= 3 ? (n % 2 ? e[(n - 1) / 2] : (e[n / 2 - 1] + e[n / 2]) / 2) : 0;
      lag.current = clamp(mid, -LAG_ALLOW, LAG_ALLOW);
    }
    return lag.current;
  };

  const end = () => {
    const errs = kept.current.map((e) => (e === null ? MISS_MS : Math.min(MISS_MS, Math.abs(e))));
    for (let i = 0; i < extra.current; i++) errs.push(MISS_MS);
    const mean = errs.reduce((n, e) => n + e, 0) / errs.length;
    const accuracy = accuracyOf(mean);
    const ms = Math.round(mean);
    const stars = starsOf(accuracy);
    const missed = kept.current.filter((e) => e === null).length;
    const notes: string[] = [];
    if (missed) notes.push(`${missed} ${missed === 1 ? 'tick' : 'ticks'} missed.`);
    if (extra.current) notes.push(`${extra.current} extra ${extra.current === 1 ? 'tap' : 'taps'}.`);
    finish(
      { accuracy, ms, bpm: plan.bpm, stars },
      {
        stars,
        title: missed === KEEP ? 'The clock stopped!' : accuracy >= 95 ? 'Like clockwork!' : undefined,
        line:
          missed === KEEP
            ? 'Keep tapping on the beat once the case shuts.'
            : [`${accuracy}% in time: off by ${ms}ms a tick at ${plan.bpm} beats a minute.`, ...notes].join(' '),
        art: <ClockArt size={64} />,
      },
    );
  };

  const main = useMain({
    enabled: !over,
    onPress: (at) => {
      // (Taps count by when they happened, so one just before the case opens still counts if it's handled after.)
      if (at >= keepTo) return;
      if (at < keepFrom) {
        // Tapping along with the ticks: practice, and a measure of the player's own lag.
        sfx.clockTap(true);
        if (at < plan.t0 - plan.T / 2) {
          pop('Not yet!', 1);
          return;
        }
        const k = Math.round((at - plan.t0) / plan.T);
        const err = at - beatAt(k);
        if (k >= 2 && Math.abs(err) <= 150 && leadErrs.current.length < 32) leadErrs.current.push(err);
        pop(wordFor(err), toneOf(err));
        return;
      }
      // With the case shut, every tap moves the clock on a tick.
      sfx.clockTap();
      steps.current += 1;
      stepAt.current = at;
      side.current = -side.current;
      const lagMs = lagOf();
      const k = clamp(Math.round((at - lagMs - plan.t0) / plan.T), LEAD, LEAD + KEEP - 1);
      if (kept.current[k - LEAD] !== null) {
        extra.current = Math.min(99, extra.current + 1);
        pop('Extra tick!', 0);
        return;
      }
      const err = at - lagMs - beatAt(k);
      kept.current[k - LEAD] = err;
      taps.current += 1;
      pop(wordFor(err), toneOf(err));
    },
  });

  useFrame(() => {
    const now = performance.now();
    // The clock's own ticks: heard through the lead-in and again once the case opens, silent in between.
    while (nextBook.current < LEAD + KEEP + 4 && beatAt(nextBook.current) <= now + BOOK_AHEAD) {
      const k = nextBook.current++;
      const at = beatAt(k);
      if ((k < LEAD || k >= LEAD + KEEP) && at >= now - 15) {
        const stop = sfx.clockTick(k % 2 === 1, at);
        if (stop) booked.current.push({ at, stop });
      }
    }
    if (booked.current.length && booked.current[0].at < now - 250) booked.current = booked.current.filter((b) => b.at >= now - 250);
    // While it can be heard, the clock moves itself on with every tick.
    while (nextBeat.current < LEAD + KEEP + 4 && beatAt(nextBeat.current) <= now) {
      const k = nextBeat.current++;
      if (k < LEAD || k >= LEAD + KEEP) {
        steps.current += 1;
        stepAt.current = beatAt(k);
      }
      if (k === 0) setHint('Tap along with the ticks to catch the beat.');
      if (k === LEAD - 5) setHint('Four more ticks, then the case shuts and the clock goes quiet. Keep tapping!');
    }
    if (stage.current === 'lead' && now >= keepFrom) {
      stage.current = 'keep';
      lagOf();
      side.current = swingAt(now) >= 0 ? 1 : -1;
      setHint(`On your own now: keep tapping in time for ${KEEP} ticks.`);
    }
    if (stage.current === 'keep' && now >= keepTo) {
      stage.current = 'reveal';
      revealAt.current = now;
      setHint('Opening the case to check…');
      later(() => {
        setOver(true);
        end();
      }, 1300);
    }
    redraw((n) => (n + 1) % 1e6);
  }, !over);

  const now = performance.now();
  const s = stage.current;
  const theta = swingAt(now);
  const jump = steps.current > 0 ? kick((now - stepAt.current) / 70) : 1;
  const turns = steps.current - 1 + jump;
  const anchor = s === 'keep' ? side.current * SWING * 0.35 * (2 * smooth((now - stepAt.current) / 70) - 1) : theta * 0.35;
  const shut = s === 'reveal' ? 1 - smooth((now - revealAt.current) / 350) : smooth((now - shutFrom) / (shutTo - shutFrom));
  const last = Math.floor((now - plan.t0) / plan.T);
  const heard = last >= 0 && (last < LEAD || last >= LEAD + KEEP);
  const flash = heard && shut < 0.5 ? Math.max(0, 1 - (now - beatAt(last)) / 220) : 0;
  const door = 38 * shut;
  const label =
    s === 'keep'
      ? ['on your own', `${taps.current} of ${KEEP} ticks`]
      : s === 'reveal'
        ? ['the real beat', `${plan.bpm} a minute`]
        : last < 0
          ? ['watch the', 'pendulum']
          : ['tap along', `tick ${Math.min(LEAD, last + 1)} of ${LEAD}`];

  return (
    <div className="job-scene job-tower" {...main} data-bpm={plan.bpm} data-beat={plan.T} data-t0={plan.t0} data-lead={LEAD} data-keep={KEEP} data-stage={s}>
      <svg viewBox="0 0 320 200" preserveAspectRatio="xMidYMid meet" className="job-svg">
        <defs>
          <linearGradient id="clock-wall" x1="0" y1="0" x2="0" y2="200" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#c2b6a0" />
            <stop offset="1" stopColor="#ddd3c1" />
          </linearGradient>
          <linearGradient id="clock-inside" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#2a221c" />
            <stop offset="1" stopColor="#3e342b" />
          </linearGradient>
        </defs>
        <Room />
        {/* the movement: wheels, the escape wheel and the anchor rocking over it */}
        <FrameBack />
        {/* the crutch, down behind the wheels to the pendulum */}
        <line x1={ANCHOR.x} y1={ANCHOR.y} x2={ANCHOR.x} y2="86" stroke="#7d848c" strokeWidth="2" transform={`rotate(${anchor} ${ANCHOR.x} ${ANCHOR.y})`} />
        <g transform={`translate(${GEAR_L.x} ${GEAR_L.y}) rotate(${(-turns * 12 * 15) / 20})`}>
          <path d={GEAR_L_PATH} fill="#c9a24f" stroke="#a8843a" strokeWidth="0.8" />
          {[0, 1, 2, 3, 4].map((i) => (
            <circle key={i} cx={Math.sin(i * 1.2566) * 7} cy={-Math.cos(i * 1.2566) * 7} r="2.6" fill="#46524c" />
          ))}
        </g>
        <g transform={`translate(${GEAR_R.x} ${GEAR_R.y}) rotate(${(-turns * 12 * 15) / 18})`}>
          <path d={GEAR_R_PATH} fill="#c9a24f" stroke="#a8843a" strokeWidth="0.8" />
          {[0, 1, 2, 3].map((i) => (
            <circle key={i} cx={Math.sin(i * 1.5708) * 6.5} cy={-Math.cos(i * 1.5708) * 6.5} r="2.6" fill="#46524c" />
          ))}
        </g>
        <g transform={`translate(${ESC.x} ${ESC.y}) rotate(${turns * 12})`}>
          <path d={ESC_PATH} fill="#b4bac2" stroke="#7d848c" strokeWidth="0.8" />
          <path d={ESC_HOLES} fill="#46524c" />
        </g>
        {[GEAR_L, GEAR_R, ESC].map((g) => (
          <circle key={g.x} cx={g.x} cy={g.y} r="2.6" fill="#e2c06a" stroke="#8a6a2a" strokeWidth="0.8" />
        ))}
        <g transform={`rotate(${anchor} ${ANCHOR.x} ${ANCHOR.y})`}>
          <path d={`M${ANCHOR.x} ${ANCHOR.y} L145 32 L142 38 M${ANCHOR.x} ${ANCHOR.y} L175 32 L178 38`} fill="none" stroke="#2f3833" strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="142" cy="38.5" r="2" fill="#b8323a" />
          <circle cx="178" cy="38.5" r="2" fill="#b8323a" />
          <circle cx={ANCHOR.x} cy={ANCHOR.y} r="3.2" fill="#e2c06a" stroke="#8a6a2a" strokeWidth="0.8" />
        </g>
        <FrameFront />
        {/* the dial: its hand jumps on with every tick */}
        <DialFace />
        <g transform={`rotate(${turns * 30} ${DIAL.x} ${DIAL.y})`}>
          <path d={`M${DIAL.x - 1.4} ${DIAL.y + 7} L${DIAL.x} ${DIAL.y - DIAL.r + 5} L${DIAL.x + 1.4} ${DIAL.y + 7} z`} fill="#2f3833" />
          <circle cx={DIAL.x} cy={DIAL.y - DIAL.r + 9} r="2.2" fill="#b8323a" />
        </g>
        <circle cx={DIAL.x} cy={DIAL.y} r="2.8" fill="#c9a24f" stroke="#8a6a2a" strokeWidth="0.8" />
        {/* the pendulum in its case */}
        <Case />
        {flash > 0 && <circle cx="160" cy="183" r={5 + flash * 4} fill="#ff7a5c" opacity={flash * 0.7} />}
        <g transform={`rotate(${theta} ${PIVOT.x} ${PIVOT.y})`}>
          <rect x={PIVOT.x - 1.2} y={PIVOT.y} width="2.4" height={ROD + 15} fill="#9aa0a8" />
          <circle cx={PIVOT.x} cy={PIVOT.y + ROD} r="12" fill="#c9a24f" stroke="#a8843a" strokeWidth="2" />
          <circle cx={PIVOT.x - 3.5} cy={PIVOT.y + ROD - 4} r="3.5" fill="#ecd08a" opacity="0.8" />
          <path d={`M${PIVOT.x - 2} ${PIVOT.y + ROD + 15} l2 4 l2 -4 z`} fill="#7d848c" />
        </g>
        <CaseFront />
        {/* the doors that shut on it */}
        {door > 0.2 &&
          [WIN.x0, WIN.x1 - door].map((x, i) => (
            <g key={i}>
              <rect x={x} y={WIN.y0} width={door} height={WIN.y1 - WIN.y0} fill="#93613a" stroke="#5e3a22" strokeWidth="1.5" />
              <rect x={x + 5 * shut} y={WIN.y0 + 7} width={Math.max(0, door - 10 * shut)} height={WIN.y1 - WIN.y0 - 14} rx="2" fill="#7a4e2e" />
              <rect x={x + 8 * shut} y={WIN.y0 + 11} width={Math.max(0, door - 16 * shut)} height="3" rx="1" fill="#a8744a" opacity="0.6" />
            </g>
          ))}
        {shut > 0.98 && (
          <g>
            <rect x="157" y="136" width="6" height="12" rx="2" fill="#c9a24f" stroke="#8a6a2a" strokeWidth="0.8" />
            <circle cx="160" cy="140" r="1.1" fill="#2f3833" />
          </g>
        )}
        {/* how it's going */}
        <text x="16" y="172" className="job-svg-label" fill="#f6ead2" fontSize="11">
          {label[0]}
        </text>
        <text x="16" y="186" className="job-svg-label" fill="#f6ead2" fontSize="11">
          {label[1]}
        </text>
        {kept.current.map((e, i) => {
          const miss = e === null && s === 'reveal';
          return (
            <circle
              key={i}
              cx={230 + i * 10}
              cy="180"
              r="3.8"
              fill={e !== null ? PIP_COLOURS[toneOf(e)] : miss ? PIP_COLOURS[0] : 'none'}
              stroke={e !== null || miss ? '#5e4a3a' : '#f6ead2'}
              strokeWidth="1.2"
            />
          );
        })}
      </svg>
      {pops}
      {s === 'lead' && last < 2 && (
        <div className="job-tip">
          <span className="cosy-key">Space</span> on every tick
        </div>
      )}
    </div>
  );
}
