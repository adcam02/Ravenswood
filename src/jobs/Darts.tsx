import { useRef, useState } from 'react';
import { useFrame, useLater, useMain, usePops, type GameProps } from './shared';
import { sfx } from './sfx';

const NUMS = [20, 1, 18, 4, 13, 6, 10, 15, 2, 17, 3, 19, 7, 16, 8, 11, 14, 9, 12, 5];
const CX = 160;
const CY = 100;
const RING = { bull: 4.5, outer: 11, tIn: 40, tOut: 47, dIn: 68, dOut: 76 };
const pt = (r: number, deg: number): [number, number] => [CX + r * Math.sin((deg * Math.PI) / 180), CY - r * Math.cos((deg * Math.PI) / 180)];

function sector(r0: number, r1: number, a0: number, a1: number) {
  const [x0, y0] = pt(r1, a0);
  const [x1, y1] = pt(r1, a1);
  const [x2, y2] = pt(r0, a1);
  const [x3, y3] = pt(r0, a0);
  return `M${x0} ${y0} A${r1} ${r1} 0 0 1 ${x1} ${y1} L${x2} ${y2} A${r0} ${r0} 0 0 0 ${x3} ${y3} Z`;
}

const BOARD = NUMS.flatMap((_, i) => {
  const a0 = i * 18 - 9;
  const a1 = a0 + 18;
  const dark = i % 2 === 0;
  const single = dark ? '#23232a' : '#f3e7c8';
  const ring = dark ? '#d8433b' : '#2f9c5a';
  return [
    { d: sector(RING.outer, RING.tIn, a0, a1), fill: single },
    { d: sector(RING.tIn, RING.tOut, a0, a1), fill: ring },
    { d: sector(RING.tOut, RING.dIn, a0, a1), fill: single },
    { d: sector(RING.dIn, RING.dOut, a0, a1), fill: ring },
  ];
});

function scoreAt(dx: number, dy: number): { points: number; label: string } {
  const r = Math.hypot(dx, dy);
  if (r > RING.dOut) return { points: 0, label: 'Miss!' };
  if (r <= RING.bull) return { points: 50, label: 'BULLSEYE!' };
  if (r <= RING.outer) return { points: 25, label: 'Outer bull' };
  const ang = ((Math.atan2(dx, -dy) * 180) / Math.PI + 360 + 9) % 360;
  const n = NUMS[Math.floor(ang / 18)];
  if (r >= RING.tIn && r <= RING.tOut) return { points: n * 3, label: `Triple ${n}!` };
  if (r >= RING.dIn && r <= RING.dOut) return { points: n * 2, label: `Double ${n}!` };
  return { points: n, label: `${n}` };
}

export function DartsArt({ size = 44 }: { size?: number }) {
  return (
    <svg viewBox="0 0 48 48" width={size} height={size} aria-hidden="true">
      <circle cx="24" cy="24" r="22" fill="#23232a" />
      <circle cx="24" cy="24" r="17" fill="#f3e7c8" />
      <circle cx="24" cy="24" r="12" fill="#d8433b" />
      <circle cx="24" cy="24" r="7" fill="#2f9c5a" />
      <circle cx="24" cy="24" r="3" fill="#d8433b" />
      <line x1="25" y1="23" x2="38" y2="10" stroke="#6b7280" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M35 13 l7 -3 l-1 7 z" fill="#4f8fe0" />
    </svg>
  );
}

const DART_COLORS = ['#4f8fe0', '#e8a33a', '#d85ab0'];

/** Three darts at the tavern board: the sight wanders, press to throw when it's on something good. */
export function Darts({ finish, setHint }: GameProps<{ score: number; stars: number }>) {
  const [, redraw] = useState(0);
  const [over, setOver] = useState(false);
  const time = useRef(0);
  const thrown = useRef<{ x: number; y: number; points: number; label: string }[]>([]);
  const flight = useRef<{ x0: number; y0: number; x1: number; y1: number; t: number } | null>(null);
  const { pop, pops } = usePops();
  const { later } = useLater();

  const total = () => thrown.current.reduce((n, d) => n + d.points, 0);
  const sightAt = (t: number) => {
    const n = thrown.current.length;
    const s = [1, 1.2, 1.45][Math.min(2, n)];
    return { x: CX + 66 * Math.sin(1.1 * s * t + 0.8), y: CY + 58 * Math.sin(1.7 * s * t + 2.1) };
  };

  const end = () => {
    const score = total();
    const stars = score >= 140 ? 3 : score >= 100 ? 2 : score >= 60 ? 1 : 0;
    finish(
      { score, stars },
      { stars, title: score >= 140 ? 'Sharp shooting!' : undefined, line: `${score} points with three darts.`, art: <DartsArt size={64} /> },
    );
  };

  const main = useMain({
    enabled: !over,
    onPress: () => {
      if (flight.current || thrown.current.length >= 3) return;
      const s = sightAt(time.current);
      flight.current = { x0: 160, y0: 215, x1: s.x + (Math.random() - 0.5) * 6, y1: s.y + (Math.random() - 0.5) * 6, t: 0 };
      sfx.throwDart();
    },
  });

  useFrame(
    (dt) => {
      time.current += dt;
      const f = flight.current;
      if (f) {
        f.t += dt / 0.3;
        if (f.t >= 1) {
          flight.current = null;
          const sc = scoreAt(f.x1 - CX, f.y1 - CY);
          thrown.current.push({ x: f.x1, y: f.y1, ...sc });
          if (sc.points === 0) sfx.thud();
          else sfx.dartThunk();
          if (sc.points >= 50) sfx.shimmer();
          pop(sc.label, sc.points >= 40 ? 3 : sc.points >= 20 ? 2 : sc.points > 0 ? 1 : 0);
          const n = thrown.current.length;
          if (n >= 3) {
            setOver(true);
            setHint(`${total()} points.`);
            later(end, 900);
          } else setHint(`${3 - n} dart${3 - n === 1 ? '' : 's'} left. ${total()} so far.`);
        }
      }
      redraw((n) => (n + 1) % 1e6);
    },
    !over,
  );

  const sight = sightAt(time.current);
  const f = flight.current;
  const fx = f ? f.x0 + (f.x1 - f.x0) * f.t : 0;
  const fy = f ? f.y0 + (f.y1 - f.y0) * f.t - Math.sin(f.t * Math.PI) * 28 : 0;
  const fs = f ? 1.6 - f.t * 0.6 : 1;

  return (
    <div className="job-scene job-darts" {...main}>
      <svg viewBox="0 0 320 200" preserveAspectRatio="xMidYMid meet" className="job-svg">
        <defs>
          <linearGradient id="darts-wall" x1="0" y1="0" x2="0" y2="200" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#7a4a2c" />
            <stop offset="1" stopColor="#52301a" />
          </linearGradient>
          <radialGradient id="darts-lamp">
            <stop offset="0" stopColor="#ffd98a" stopOpacity="0.55" />
            <stop offset="1" stopColor="#ffd98a" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect x="-200" y="-100" width="720" height="400" fill="url(#darts-wall)" />
        {[-4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((i) => (
          <line key={i} x1={i * 44} y1="-100" x2={i * 44} y2="300" stroke="#3d2412" strokeOpacity="0.4" strokeWidth="2" />
        ))}
        <circle cx="286" cy="40" r="70" fill="url(#darts-lamp)" />
        <path d="M274 16 h24 l6 20 h-36 z" fill="#e8c27a" />
        <rect x="284" y="36" width="4" height="30" fill="#5a3a22" />
        {/* the chalkboard */}
        <rect x="8" y="30" width="68" height="124" rx="5" fill="#6b4528" />
        <rect x="12" y="34" width="60" height="116" rx="3" fill="#2b3a33" />
        <text x="42" y="50" textAnchor="middle" className="job-svg-label" fill="#f3e7c8" fontSize="12">
          darts
        </text>
        <line x1="18" y1="55" x2="66" y2="55" stroke="#f3e7c8" strokeOpacity="0.5" />
        {[0, 1, 2].map((i) => (
          <text key={i} x="20" y={74 + i * 20} className="job-svg-label" fill={thrown.current[i] ? '#fff' : '#8fa39a'} fontSize="12">
            {i + 1}. {thrown.current[i] ? thrown.current[i].points : '–'}
          </text>
        ))}
        <line x1="18" y1="122" x2="66" y2="122" stroke="#f3e7c8" strokeOpacity="0.5" />
        <text x="42" y="140" textAnchor="middle" className="job-svg-label" fill="#ffe28a" fontSize="15" fontWeight="700">
          {total()}
        </text>
        {/* the board */}
        <circle cx={CX} cy={CY} r={RING.dOut + 14} fill="#1a1510" />
        <circle cx={CX} cy={CY} r={RING.dOut + 2} fill="#0f0d0a" />
        {BOARD.map((s, i) => (
          <path key={i} d={s.d} fill={s.fill} stroke="#c9c2b2" strokeWidth="0.6" />
        ))}
        <circle cx={CX} cy={CY} r={RING.outer} fill="#2f9c5a" stroke="#c9c2b2" strokeWidth="0.6" />
        <circle cx={CX} cy={CY} r={RING.bull} fill="#d8433b" stroke="#c9c2b2" strokeWidth="0.6" />
        {NUMS.map((n, i) => {
          const [x, y] = pt(RING.dOut + 8, i * 18);
          return (
            <text key={n} x={x} y={y + 3} textAnchor="middle" className="job-svg-label" fill="#f3e7c8" fontSize="8">
              {n}
            </text>
          );
        })}
        {/* darts in the board */}
        {thrown.current.map((d, i) => (
          <g key={i} transform={`translate(${d.x} ${d.y})`}>
            <g className="job-dart-in">
              <circle r="1.6" fill="#333" />
              <line x1="0" y1="0" x2="10" y2="12" stroke="#8a8f99" strokeWidth="2.2" strokeLinecap="round" />
              <path d="M8 9 l7 -2 l2 8 l-7 2 z" fill={DART_COLORS[i]} stroke="#2a2a2a" strokeWidth="0.6" />
            </g>
          </g>
        ))}
        {/* the one in the air */}
        {f && (
          <g transform={`translate(${fx} ${fy}) scale(${fs})`}>
            <circle r="2" fill="#333" />
            <line x1="0" y1="0" x2="4" y2="14" stroke="#8a8f99" strokeWidth="2.4" strokeLinecap="round" />
            <path d="M2 11 l7 1 l-2 8 l-7 -2 z" fill={DART_COLORS[thrown.current.length]} />
          </g>
        )}
        {/* the sight */}
        {!over && !f && thrown.current.length < 3 && (
          <g transform={`translate(${sight.x} ${sight.y})`} className="job-sight">
            <circle r="9" fill="none" stroke="#fff" strokeWidth="2" />
            <circle r="9" fill="none" stroke="#e8504a" strokeWidth="2" strokeDasharray="5 9" />
            <line x1="-14" y1="0" x2="-5" y2="0" stroke="#fff" strokeWidth="2" />
            <line x1="5" y1="0" x2="14" y2="0" stroke="#fff" strokeWidth="2" />
            <line x1="0" y1="-14" x2="0" y2="-5" stroke="#fff" strokeWidth="2" />
            <line x1="0" y1="5" x2="0" y2="14" stroke="#fff" strokeWidth="2" />
            <circle r="1.5" fill="#fff" />
          </g>
        )}
      </svg>
      {pops}
      {thrown.current.length === 0 && !f && (
        <div className="job-tip">
          <span className="cosy-key">Space</span> to throw
        </div>
      )}
    </div>
  );
}
