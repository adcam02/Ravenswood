import { memo, useRef, useState } from 'react';
import { RippleRings, clamp, isLeft, isMain, isRight, pickOne, stepRipples, useFrame, useKeys, useLater, usePops, type GameProps, type Ripple } from './shared';
import { sfx } from './sfx';

export const FORTUNES = [
  'The raven remembers who fed it.',
  'Trust the one who laughs last.',
  'An ale shared is a secret kept.',
  'Someone at the table is wearing two faces.',
  'The bell will ring for a friend.',
  'Sleep lightly. The mill creaks at night.',
  'What the well hears, the well keeps.',
  'A borrowed coat hides a borrowed name.',
  'Count the candles before you count your friends.',
  'The quietest cottage has the most to say.',
  'Feed the cat. It knows things.',
  'Your luck turns with the next bell.',
  'Kindness is a lantern. So is a lie.',
];

export function CoinArt({ size = 44 }: { size?: number }) {
  return (
    <svg viewBox="0 0 48 48" width={size} height={size} aria-hidden="true">
      <circle cx="24" cy="24" r="20" fill="#e3b94f" stroke="#b8891a" strokeWidth="2" />
      <circle cx="24" cy="24" r="14" fill="none" stroke="#b8891a" strokeWidth="1.5" />
      <path d="M24 13 l3 7 l7 1 l-5 5 l1 7 l-6 -3 l-6 3 l1 -7 l-5 -5 l7 -1 z" fill="#f7dc8a" stroke="#b8891a" strokeWidth="1" />
      <path d="M12 16 q6 -8 14 -8" stroke="#fff" strokeOpacity="0.6" strokeWidth="2" fill="none" />
    </svg>
  );
}

/*
 * The well from above and a little in front, so the water is a wide oval and the far wall shows inside the rim.
 * Everything is placed on that flat oval (x across, y further away up the screen); a coin in the air is drawn
 * `h` above where it would land.
 */
const HAND = { x: 160, y: 186 };
const RIM = { x: 160, y: 96, rx: 120, ry: 54 };
const WATER = { x: 160, y: 100, rx: 97, ry: 38 };
/** How far a drag throws, for each unit dragged. */
const GAIN = 1.35;
const COINS = 5;
/** Coin by coin: the wish ring shrinks and moves quicker, and the wind gets up (the most it can blow a coin aside). */
const RING_R = [15, 13.5, 12, 11, 10];
const RING_SPEED = [0.75, 0.95, 1.15, 1.35, 1.55];
const WIND_MAX = [8, 18, 28, 38, 46];
/** Points: in the water, on a lily pad, through the wish ring (and each ring in a row is worth two more than the last). */
const PTS = { water: 1, pad: 2, ring: 3 };
/** Points for one, two and three stars. Three takes four rings, or three in a row and a pad or two. */
const STARS_AT = [3, 9, 18];

type Phase = 'aim' | 'fly' | 'wait' | 'done';
type Landing = 'ring' | 'pad' | 'water' | 'rim' | 'over' | 'short';

interface Flight {
  from: { x: number; y: number };
  to: { x: number; y: number };
  u: number;
  dur: number;
  peak: number;
  /** Sideways drift by the end, from the wind. */
  drift: number;
  bounces: number;
}

/** Where a coin went: resting on a pad (riding it about, `x` and `y` from its middle), or a glint under the water. */
interface Rest {
  x: number;
  y: number;
  pad: number | null;
}

const inOval = (x: number, y: number, o: { x: number; y: number; rx: number; ry: number }) => ((x - o.x) / o.rx) ** 2 + ((y - o.y) / o.ry) ** 2 <= 1;
/** Smaller further away. */
const depth = (y: number) => 0.62 + 0.38 * clamp((y - 50) / 136, 0, 1);

const windFor = (i: number) => WIND_MAX[i] * (0.45 + Math.random() * 0.55) * (Math.random() < 0.5 ? -1 : 1);

const padAt = (i: number, t: number) => ({
  x: WATER.x + [-56, 6, 58][i] + 12 * Math.sin(0.27 * t + i * 2.1),
  y: WATER.y + [-9, 15, -3][i] + 4 * Math.sin(0.35 * t + i * 1.3),
});

const ringAt = (phase: number) => ({
  x: WATER.x + 66 * Math.sin(phase),
  y: WATER.y + 2 + 15 * Math.sin(phase * 1.7 + 0.8),
});

const Scenery = memo(function Scenery() {
  const stones = Array.from({ length: 22 }, (_, i) => (i / 22) * Math.PI * 2);
  return (
    <g>
      <rect x="-200" y="-100" width="720" height="400" fill="#7fb35a" />
      <path d="M-200 168 q80 -8 160 0 q80 8 160 0 q80 -8 160 0 q80 8 240 0 v100 h-720 z" fill="#8cc066" />
      {[18, 62, 250, 300, 8, 312].map((x, i) => (
        <g key={x} transform={`translate(${x} ${150 + (i % 3) * 14})`}>
          <circle r="3.5" fill={['#e8505b', '#fffaf0', '#f6c936'][i % 3]} />
          <line x1="0" y1="3" x2="0" y2="9" stroke="#4f8a3a" strokeWidth="1.5" />
        </g>
      ))}
      {/* the posts and the beam, the crank, and the bucket tied up out of the way */}
      <rect x="24" y="8" width="9" height="104" fill="#6b4528" />
      <rect x="287" y="8" width="9" height="104" fill="#6b4528" />
      <rect x="16" y="2" width="288" height="10" rx="3" fill="#8a5a34" />
      <rect x="16" y="10" width="288" height="3" fill="#5a3a22" opacity="0.5" />
      <path d="M296 7 h10 v10" stroke="#5a3a22" strokeWidth="3" fill="none" strokeLinecap="round" />
      <line x1="230" y1="12" x2="230" y2="24" stroke="#d9c3a0" strokeWidth="1.5" />
      <path d="M223 24 h14 l-2 10 h-10 z" fill="#8a5a34" stroke="#5a3a22" strokeWidth="1" />
      {/* the rim: stones round the top, the far wall going down inside, and the water */}
      <ellipse cx={RIM.x} cy={RIM.y + 5} rx={RIM.rx + 2} ry={RIM.ry + 2} fill="#5f7a44" opacity="0.6" />
      <ellipse cx={RIM.x} cy={RIM.y} rx={RIM.rx} ry={RIM.ry} fill="#b9ad99" stroke="#7d7264" strokeWidth="2" />
      {stones.map((a) => (
        <line
          key={a}
          x1={RIM.x + Math.cos(a) * 100}
          y1={RIM.y + Math.sin(a) * 42}
          x2={RIM.x + Math.cos(a) * RIM.rx}
          y2={RIM.y + Math.sin(a) * RIM.ry}
          stroke="#8d8270"
          strokeWidth="1.5"
        />
      ))}
      <ellipse cx={RIM.x} cy={RIM.y} rx="100" ry="42" fill="#5d5448" />
      <path d={`M${RIM.x - 100} ${RIM.y} a100 42 0 0 1 200 0`} fill="none" stroke="#4a4238" strokeWidth="5" strokeDasharray="14 3" opacity="0.6" />
      <ellipse cx={WATER.x} cy={WATER.y} rx={WATER.rx} ry={WATER.ry} fill="url(#well-water)" />
      <ellipse cx={WATER.x - 30} cy={WATER.y - 12} rx="26" ry="5" fill="#cfe9f2" opacity="0.18" />
    </g>
  );
});

function Pad({ x, y, dip }: { x: number; y: number; dip: number }) {
  return (
    <g transform={`translate(${x} ${y + dip}) scale(${depth(y)})`}>
      <ellipse rx="14" ry="5.6" fill="#3f8a3a" />
      <ellipse rx="12.5" ry="4.6" fill="#5fae4c" />
      <path d="M0 0 L11 -3.5 L12 -1 z" fill="#2f5f50" />
      <path d="M-6 -1 q4 -2 9 -1" stroke="#9fdc7a" strokeWidth="1" fill="none" />
    </g>
  );
}

function CoinShape({ x, y, s, spin = 1 }: { x: number; y: number; s: number; spin?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s * Math.max(0.15, Math.abs(spin))} ${s})`}>
      <circle r="6" fill="#e3b94f" stroke="#b8891a" strokeWidth="1.3" />
      <circle r="3.6" fill="none" stroke="#b8891a" strokeWidth="0.9" />
    </g>
  );
}

/**
 * The wishing well: five coins, flicked in by dragging up from anywhere and letting go (or aimed with the arrows,
 * with Space held to choose how hard). A splash in the water scores a little, settling on a lily pad more, and best
 * of all is dropping through the lit wish ring as it drifts about, worth more for every one in a row. Coin by coin
 * the ring shrinks and quickens and the wind gets up; a coin that lands on the stones hops on, sometimes in, and
 * sometimes off the far lip back into the water.
 */
export function Coin({ finish, setHint }: GameProps<{ wish: boolean; stars: number; fortune: string; points: number }>) {
  const [, redraw] = useState(0);
  const phase = useRef<Phase>('aim');
  const time = useRef(0);
  const ring = useRef(0);
  const k = useRef(0);
  const points = useRef(0);
  const streak = useRef(0);
  const best = useRef(0);
  const rings = useRef(0);
  const wind = useRef(windFor(0));
  const flight = useRef<Flight | null>(null);
  const coin = useRef({ x: HAND.x, y: HAND.y, h: 0, spin: 1 });
  const rests = useRef<Rest[]>([]);
  const ripples = useRef<Ripple[]>([]);
  const dips = useRef([0, 0, 0]);
  const flash = useRef(0);
  const drag = useRef<{ id: number; x0: number; y0: number; x: number; y: number } | null>(null);
  const keys = useRef({ aim: 0, left: false, right: false, charging: false, charge: 0, held: 0, used: false });
  const svg = useRef<SVGSVGElement>(null);
  const { later } = useLater();
  const { pop, pops } = usePops();

  /** A pointer's place in the scene's own units. */
  const toScene = (e: { clientX: number; clientY: number }) => {
    const m = svg.current?.getScreenCTM();
    if (!m) return { x: 0, y: 0 };
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse());
    return { x: p.x, y: p.y };
  };

  /** Throws the coin at a spot on the water (before the wind and a little wobble have their say). */
  const toss = (tx: number, ty: number) => {
    if (phase.current !== 'aim') return;
    const dist = Math.hypot(tx - HAND.x, ty - HAND.y);
    const wobble = dist * 0.014;
    const to = { x: tx + (Math.random() - 0.5) * 2 * wobble, y: ty + (Math.random() - 0.5) * 2 * wobble };
    const dur = 0.5 + dist / 320;
    flight.current = { from: { ...HAND }, to, u: 0, dur, peak: 26 + dist * 0.36, drift: wind.current * (dur / 0.95), bounces: 0 };
    phase.current = 'fly';
    sfx.swish();
    setHint('…');
  };

  /** Where a dragged throw goes: along the drag, further. */
  const aimOf = (d: { x0: number; y0: number; x: number; y: number }) => ({ x: HAND.x + (d.x - d.x0) * GAIN, y: HAND.y + (d.y - d.y0) * GAIN });

  /** The keys' throw: along the aim, as far as the charge says. */
  const keyAim = () => {
    const kk = keys.current;
    const dist = 22 + kk.charge * 150;
    return { x: HAND.x + Math.sin(kk.aim) * dist, y: HAND.y - Math.cos(kk.aim) * dist };
  };

  useKeys((e, down) => {
    const kk = keys.current;
    if (isLeft(e) || isRight(e)) {
      if (isLeft(e)) kk.left = down;
      else kk.right = down;
      kk.used = true;
      return true;
    }
    if (!isMain(e)) return false;
    if (down && !e.repeat && phase.current === 'aim' && !kk.charging) {
      kk.charging = true;
      kk.used = true;
      kk.charge = 0;
      kk.held = 0;
    } else if (!down && kk.charging) {
      kk.charging = false;
      const at = keyAim();
      toss(at.x, at.y);
    }
    return true;
  });

  /** On to the next coin, or the end. */
  const next = () => {
    if (k.current + 1 >= COINS) {
      phase.current = 'done';
      setHint(`${points.current} points.`);
      later(end, 1100);
      return;
    }
    // (A moment to see where it went before the next is in hand.)
    phase.current = 'wait';
    later(() => {
      k.current += 1;
      wind.current = windFor(k.current);
      coin.current = { x: HAND.x, y: HAND.y, h: 0, spin: 1 };
      phase.current = 'aim';
      setHint(`Coin ${k.current + 1} of ${COINS}. ${streak.current ? `${streak.current} in a row: keep it going!` : 'The glowing ring scores most.'}`);
    }, 650);
  };

  /** Where the coin came down (going `vx`, `vy`): what it hit, and so how it scores. */
  const land = (x: number, y: number, vx: number, vy: number) => {
    const f = flight.current!;
    const r = ringAt(ring.current);
    const rr = RING_R[k.current];
    let what: Landing;
    let pad = -1;
    if (inOval(x, y, WATER)) {
      if (inOval(x, y, { x: r.x, y: r.y, rx: rr + 3, ry: rr * 0.42 + 1.5 })) what = 'ring';
      else {
        pad = [0, 1, 2].find((i) => {
          const p = padAt(i, time.current);
          return inOval(x, y, { x: p.x, y: p.y, rx: 14 * depth(p.y) + 2, ry: 5.6 * depth(p.y) + 1 });
        }) ?? -1;
        what = pad >= 0 ? 'pad' : 'water';
      }
    } else if (inOval(x, y, RIM) && f.bounces < 2) {
      // Off the stones: on over a near stone, or back off the far lip when it's going outwards already.
      const nx = (x - RIM.x) / RIM.rx ** 2;
      const ny = (y - RIM.y) / RIM.ry ** 2;
      const n = Math.hypot(nx, ny) || 1;
      const out = (vx * nx + vy * ny) / n;
      let bx = vx;
      let by = vy;
      if (out > 0) {
        bx -= (2 * out * nx) / n;
        by -= (2 * out * ny) / n;
      }
      const a = (Math.random() - 0.5) * 0.8;
      const hop = (out > 0 ? 0.4 : 0.3) * 0.38;
      const to = { x: x + (bx * Math.cos(a) - by * Math.sin(a)) * hop, y: y + (bx * Math.sin(a) + by * Math.cos(a)) * hop };
      flight.current = { from: { x, y }, to, u: 0, dur: 0.38, peak: 11, drift: 0, bounces: f.bounces + 1 };
      sfx.clink();
      return;
    } else what = inOval(x, y, RIM) ? 'rim' : y < RIM.y ? 'over' : 'short';
    flight.current = null;
    let got = 0;
    if (what === 'ring') {
      streak.current += 1;
      rings.current += 1;
      best.current = Math.max(best.current, streak.current);
      got = PTS.ring + (streak.current - 1) * 2;
      flash.current = 1;
      sfx.wellSplash();
      sfx.shimmer();
      pop(streak.current > 1 ? `${streak.current} in a row! +${got}` : `Wish ring! +${got}`, 3);
      rests.current.push({ x, y, pad: null });
    } else {
      streak.current = 0;
      if (what === 'pad') {
        got = PTS.pad;
        dips.current[pad] = 1;
        sfx.plop();
        pop(`Lily pad +${got}`, 2);
        const p = padAt(pad, time.current);
        rests.current.push({ x: x - p.x, y: y - p.y, pad });
      } else if (what === 'water') {
        got = PTS.water;
        sfx.wellSplash();
        pop(`Splash +${got}`, 1);
        rests.current.push({ x, y, pad: null });
      } else {
        sfx.miss();
        pop(what === 'over' ? 'Over!' : what === 'short' ? 'Short!' : 'On the rim', 0);
      }
    }
    if (what === 'ring' || what === 'water') {
      ripples.current.push({ id: Math.random(), x, y, t: 0, big: what === 'ring' ? 1.1 : 0.7 });
      ripples.current.push({ id: Math.random(), x, y, t: -0.2, big: 0.5 });
    }
    points.current += got;
    next();
  };

  const end = () => {
    const p = points.current;
    const stars = p >= STARS_AT[2] ? 3 : p >= STARS_AT[1] ? 2 : p >= STARS_AT[0] ? 1 : 0;
    const wish = stars > 0;
    const fortune = wish ? pickOne(FORTUNES) : 'Clink. Not this time.';
    const title = rings.current === COINS ? 'Every wish at once!' : stars === 3 ? 'A wish!' : stars === 0 ? 'Clink.' : undefined;
    const how = rings.current ? `${rings.current} through the ring${best.current > 1 ? `, ${best.current} in a row` : ''}. ` : '';
    finish(
      { wish, stars, fortune, points: p },
      {
        stars,
        title,
        line: wish ? `${p} points. ${how}${fortune}` : `${p} point${p === 1 ? '' : 's'}. Not this time. The well keeps its secrets.`,
        art: <CoinArt size={64} />,
      },
    );
  };

  useFrame((dt) => {
    time.current += dt;
    ring.current += dt * RING_SPEED[k.current];
    ripples.current = stepRipples(ripples.current, dt);
    flash.current = Math.max(0, flash.current - dt / 1.1);
    dips.current = dips.current.map((d) => Math.max(0, d - dt / 0.6));
    const kk = keys.current;
    if (kk.left) kk.aim = Math.max(-0.75, kk.aim - dt * 0.9);
    if (kk.right) kk.aim = Math.min(0.75, kk.aim + dt * 0.9);
    if (kk.charging) {
      // Up and down again until it's let go.
      kk.held += dt;
      kk.charge = 0.5 - 0.5 * Math.cos((kk.held * Math.PI * 2) / 1.7);
    }
    const f = flight.current;
    if (f) {
      f.u = Math.min(1, f.u + dt / f.dur);
      const u = f.u;
      const x = f.from.x + (f.to.x - f.from.x) * u + f.drift * u * u;
      const y = f.from.y + (f.to.y - f.from.y) * u;
      coin.current = { x, y, h: Math.sin(u * Math.PI) * f.peak, spin: Math.cos(u * Math.PI * (f.bounces ? 3 : 7)) };
      if (u >= 1) land(x, y, (f.to.x - f.from.x + 2 * f.drift) / f.dur, (f.to.y - f.from.y) / f.dur);
    }
    redraw((n) => (n + 1) % 1e6);
  });

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0 || phase.current !== 'aim' || drag.current) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture?.(e.pointerId);
    const p = toScene(e);
    drag.current = { id: e.pointerId, x0: p.x, y0: p.y, x: p.x, y: p.y };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    const p = toScene(e);
    d.x = p.x;
    d.y = p.y;
  };
  const onPointerUp = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    drag.current = null;
    // A tap, or a drag downwards, throws nothing.
    if (d.y0 - d.y < 8) {
      if (phase.current === 'aim') setHint('Drag up towards the well and let go to flick the coin.');
      return;
    }
    const at = aimOf(d);
    toss(at.x, at.y);
  };

  const t = time.current;
  const r = ringAt(ring.current);
  const rr = RING_R[k.current];
  const rs = depth(r.y);
  const c = coin.current;
  const d = drag.current;
  const kk = keys.current;
  const aiming = phase.current === 'aim';
  // The arrow while aiming: along the drag (or the keys' aim), half as long as the throw.
  let arrow: { x: number; y: number } | null = null;
  if (aiming && d && d.y0 - d.y > 2) {
    const at = aimOf(d);
    arrow = { x: (HAND.x + at.x) / 2, y: (HAND.y + at.y) / 2 };
  } else if (aiming && kk.used) {
    const at = kk.charging ? keyAim() : { x: HAND.x + Math.sin(kk.aim) * 60, y: HAND.y - Math.cos(kk.aim) * 60 };
    arrow = { x: (HAND.x + at.x) / 2, y: (HAND.y + at.y) / 2 };
  }
  const w = wind.current;
  const gust = Math.round(Math.abs(w) / 12);
  const sway = Math.sin(t * 9) * 0.15;
  const flag = clamp(w / 46, -1, 1);
  const spent = k.current + (aiming ? 0 : 1);

  return (
    <div className="job-scene job-well" onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={() => (drag.current = null)}>
      <svg ref={svg} viewBox="0 0 320 200" preserveAspectRatio="xMidYMid meet" className="job-svg">
        <defs>
          <radialGradient id="well-water" cx="0.5" cy="0.45" r="0.55">
            <stop offset="0" stopColor="#2c6a78" />
            <stop offset="0.75" stopColor="#1d4a58" />
            <stop offset="1" stopColor="#123440" />
          </radialGradient>
          <radialGradient id="well-glow" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor="#fff2b0" stopOpacity="0.55" />
            <stop offset="1" stopColor="#ffd75a" stopOpacity="0" />
          </radialGradient>
        </defs>
        <Scenery />
        {/* coins gone before: glints under the water */}
        {rests.current.map((s, i) =>
          s.pad === null ? <ellipse key={i} cx={s.x} cy={s.y + 3} rx={3.4 * depth(s.y)} ry={1.4 * depth(s.y)} fill="#e3b94f" opacity="0.4" /> : null,
        )}
        <RippleRings list={ripples.current} color="#cfeaf2" />
        {[0, 1, 2].map((i) => {
          const p = padAt(i, t);
          const dip = dips.current[i] * 2.5 * Math.sin(dips.current[i] * 10);
          return (
            <g key={i}>
              <Pad x={p.x} y={p.y} dip={dip} />
              {rests.current.map((s, j) => (s.pad === i ? <CoinShape key={j} x={p.x + s.x} y={p.y + s.y + dip - 1} s={depth(p.y) * 0.75} /> : null))}
            </g>
          );
        })}
        {/* the wish ring, glowing as it drifts */}
        <g transform={`translate(${r.x} ${r.y})`}>
          <ellipse rx={(rr + 9) * rs} ry={(rr * 0.42 + 5) * rs} fill="url(#well-glow)" opacity={0.7 + 0.3 * Math.sin(t * 5)} />
          <ellipse rx={rr * rs} ry={rr * 0.42 * rs} fill="none" stroke="#ffe28a" strokeWidth={2.6 + flash.current * 3} />
          <ellipse rx={rr * rs} ry={rr * 0.42 * rs} fill="none" stroke="#fffbe6" strokeWidth="0.9" strokeDasharray="3 4" strokeDashoffset={t * 12} />
          {flash.current > 0 &&
            [0, 1, 2, 3, 4, 5].map((i) => (
              <text key={i} x={Math.cos(i * 1.05) * (rr + 6)} y={-6 - (1 - flash.current) * (18 + i * 4)} textAnchor="middle" fontSize={7 + (i % 2) * 4} fill="#ffe28a" opacity={flash.current}>
                ✦
              </text>
            ))}
        </g>
        {/* the wind: a pennant off the beam, and leaves blowing past */}
        <path
          d={`M160 12 q${flag * 9} ${2 + sway * 4} ${flag * 22 + (flag >= 0 ? 4 : -4)} ${4 + (1 - Math.abs(flag)) * 10} l${-flag * 20} ${4 - (1 - Math.abs(flag)) * 2} z`}
          fill="#d8504a"
        />
        {gust > 0 &&
          [0, 1, 2].map((i) => {
            const along = (t * Math.abs(w) * 2.2 + i * 130) % 380;
            const x = w > 0 ? -30 + along : 350 - along;
            const y = 30 + i * 52 + Math.sin(t * 3 + i) * 6;
            return <ellipse key={i} cx={x} cy={y} rx="3.5" ry="1.8" fill="#9ccb6e" opacity="0.8" transform={`rotate(${t * 200 + i * 60} ${x} ${y})`} />;
          })}
        <g transform="translate(8 30)">
          <rect width="58" height="18" rx="9" fill="#fff8ea" opacity="0.92" />
          <text x="29" y="12.5" textAnchor="middle" className="job-svg-label" fill="#3a5a6a" fontSize="9">
            {gust === 0 ? 'still' : `wind ${(w < 0 ? '◂' : '▸').repeat(Math.min(3, gust))}`}
          </text>
        </g>
        {/* the score, the streak, and the coins left */}
        <g transform="translate(254 30)">
          <rect width="58" height="18" rx="9" fill="#fff8ea" opacity="0.92" />
          <text x="29" y="12.5" textAnchor="middle" className="job-svg-label" fill="#7a5a10" fontSize="9" fontWeight="700">
            {points.current} pts{streak.current > 1 ? ` ×${streak.current}` : ''}
          </text>
        </g>
        {Array.from({ length: COINS }, (_, i) => (
          <circle key={i} cx={263 + i * 9} cy={56} r="3.4" fill={i < spent ? '#c9c2b4' : '#e3b94f'} stroke="#b8891a" strokeWidth="0.8" opacity={i < spent ? 0.45 : 1} />
        ))}
        {arrow && (
          <g>
            <line x1={HAND.x} y1={HAND.y} x2={arrow.x} y2={arrow.y} stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeDasharray="5 5" opacity="0.85" />
            <circle cx={arrow.x} cy={arrow.y} r="3" fill="#fff" />
          </g>
        )}
        {kk.charging && (
          <g transform="translate(190 160)">
            <rect width="44" height="8" rx="4" fill="#10303a" opacity="0.6" />
            <rect width={44 * kk.charge} height="8" rx="4" fill="#f2c14e" />
          </g>
        )}
        {/* the coin: up in the air with its shadow below, or in the hand */}
        {(aiming || flight.current) && (
          <g>
            {c.h > 0 && <ellipse cx={c.x} cy={c.y} rx={5 * depth(c.y)} ry={2 * depth(c.y)} fill="#000" opacity={0.2} />}
            <CoinShape x={c.x} y={c.y - c.h - (aiming ? 4 : 0)} s={depth(c.y) * (1.25 + c.h / 90)} spin={c.spin} />
          </g>
        )}
      </svg>
      {pops}
      {aiming && k.current === 0 && !kk.used && !d && (
        <div className="job-tip">
          Drag up and let go, or <span className="cosy-key">←</span>
          <span className="cosy-key">→</span>
          <span className="cosy-key">Space</span>
        </div>
      )}
    </div>
  );
}
