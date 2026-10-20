import { useRef, useState } from 'react';
import { pickOne, useFrame, useLater, useMain, type GameProps } from './shared';
import { sfx } from './sfx';

const WELL = { x: 160, y: 118, rx: 54, ry: 19 };

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

interface Toss {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  u: number;
  inWell: boolean;
  /** 0..1 once it's falling into the dark. */
  fell: number;
  /** 0..1 for the bounce off the rim. */
  bounce: number;
  fortune: string;
}

/** A coin for the well: the coin drifts over the mouth of the well, press to toss it in. */
export function Coin({ finish, setHint }: GameProps<{ wish: boolean; stars: number; fortune: string }>) {
  const [, redraw] = useState(0);
  const [over, setOver] = useState(false);
  const time = useRef(0);
  const toss = useRef<Toss | null>(null);
  const sparkle = useRef(0);
  const { later } = useLater();

  const markerAt = (t: number) => ({ x: 160 + 104 * Math.sin(0.95 * t + 1.2), y: WELL.y + 10 * Math.sin(2.1 * t) });

  const main = useMain({
    enabled: !over,
    onPress: () => {
      if (toss.current) return;
      const m = markerAt(time.current);
      const x1 = m.x + (Math.random() - 0.5) * 10;
      const y1 = m.y + (Math.random() - 0.5) * 6;
      const inWell = ((x1 - WELL.x) / (WELL.rx - 6)) ** 2 + ((y1 - WELL.y) / (WELL.ry - 3)) ** 2 <= 1;
      toss.current = { x0: 160, y0: 198, x1, y1, u: 0, inWell, fell: 0, bounce: 0, fortune: pickOne(FORTUNES) };
      sfx.swish();
      setHint('…');
    },
  });

  useFrame(
    (dt) => {
      time.current += dt;
      const c = toss.current;
      if (c) {
        if (c.u < 1) {
          c.u = Math.min(1, c.u + dt / 0.62);
          if (c.u >= 1) {
            if (c.inWell) {
              later(() => {
                sfx.wellSplash();
                sparkle.current = 1;
              }, 420);
              later(() => {
                setOver(true);
                setHint('The well has heard you.');
                finish({ wish: true, stars: 3, fortune: c.fortune }, { stars: 3, title: 'A wish!', line: c.fortune, art: <CoinArt size={64} /> });
              }, 1300);
            } else {
              sfx.clink();
              later(() => {
                setOver(true);
                setHint('Clink.');
                finish({ wish: false, stars: 0, fortune: 'Clink. Not this time.' }, { stars: 0, title: 'Clink.', line: 'Not this time. The well keeps its secrets.', art: <CoinArt size={64} /> });
              }, 1000);
            }
          }
        } else if (c.inWell) c.fell = Math.min(1, c.fell + dt / 0.5);
        else c.bounce = Math.min(1, c.bounce + dt / 0.45);
      }
      sparkle.current = Math.max(0, sparkle.current - dt / 1.2);
      redraw((n) => (n + 1) % 1e6);
    },
    !over,
  );

  const m = markerAt(time.current);
  const c = toss.current;
  let coin = { x: 160, y: 198, s: 1, o: 1, spin: 1 };
  if (c) {
    if (c.u < 1) coin = { x: c.x0 + (c.x1 - c.x0) * c.u, y: c.y0 + (c.y1 - c.y0) * c.u - Math.sin(c.u * Math.PI) * 76, s: 1.5 - c.u * 0.5, o: 1, spin: Math.cos(c.u * Math.PI * 5) };
    else if (c.inWell) coin = { x: c.x1, y: c.y1 + c.fell * 14, s: 1 - c.fell * 0.5, o: 1 - c.fell, spin: Math.cos(c.fell * Math.PI * 3) };
    else {
      const b = c.bounce;
      const side = c.x1 < WELL.x ? -1 : 1;
      coin = { x: c.x1 + side * b * 24, y: c.y1 - Math.sin(b * Math.PI) * 18 + b * 40, s: 1, o: 1, spin: Math.cos(b * Math.PI * 2) };
    }
  }
  const sp = sparkle.current;

  return (
    <div className="job-scene job-well" {...main}>
      <svg viewBox="0 0 320 200" preserveAspectRatio="xMidYMid meet" className="job-svg">
        <defs>
          <linearGradient id="well-sky" x1="0" y1="0" x2="0" y2="200" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#a9ddf0" />
            <stop offset="1" stopColor="#d7eef7" />
          </linearGradient>
          <radialGradient id="well-dark" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor="#0a1620" />
            <stop offset="0.7" stopColor="#1a2c38" />
            <stop offset="1" stopColor="#3a4e5c" />
          </radialGradient>
        </defs>
        <rect x="-200" y="-100" width="720" height="400" fill="url(#well-sky)" />
        <rect x="-200" y="80" width="720" height="150" fill="#7fb35a" />
        <path d="M-200 80 h720 v6 q-60 8 -160 2 q-100 -6 -160 4 q-60 8 -160 2 q-100 -6 -160 4 q-40 4 -80 0 z" fill="#9ccb6e" />
        {[-170, -110, -50, 30, 70, 250, 292, 360, 420, 480].map((x, i) => (
          <g key={x}>
            <circle cx={x} cy={62 + (i % 2) * 6} r={16 + (i % 3) * 4} fill="#5f9a46" />
            <rect x={x - 3} y={70 + (i % 2) * 6} width="6" height="16" fill="#6b4528" />
          </g>
        ))}
        {[40, 90, 240, 280, 120, 200].map((x, i) => (
          <g key={x} transform={`translate(${x} ${150 + (i % 3) * 14})`}>
            <circle r="3.5" fill={['#e8505b', '#fffaf0', '#f6c936'][i % 3]} />
            <line x1="0" y1="3" x2="0" y2="10" stroke="#4f8a3a" strokeWidth="1.5" />
          </g>
        ))}
        {/* the well */}
        <rect x="112" y="40" width="7" height="80" fill="#6b4528" />
        <rect x="201" y="40" width="7" height="80" fill="#6b4528" />
        <path d="M100 44 l60 -26 l60 26 z" fill="#8a4a2a" />
        <path d="M104 44 l56 -22 l56 22 l-6 0 l-50 -18 l-50 18 z" fill="#b05a32" />
        <rect x="112" y="60" width="96" height="5" fill="#8a5a34" />
        <line x1="160" y1="65" x2="160" y2="92" stroke="#d9c3a0" strokeWidth="1.5" />
        <path d="M152 92 h16 l-2 12 h-12 z" fill="#8a5a34" stroke="#5a3a22" strokeWidth="1" />
        <rect x={WELL.x - WELL.rx} y={WELL.y} width={WELL.rx * 2} height="58" fill="#a99c89" />
        {[0, 1, 2].map((row) => (
          <g key={row} stroke="#7d7264" strokeWidth="1.5">
            <line x1={WELL.x - WELL.rx} y1={WELL.y + 16 + row * 16} x2={WELL.x + WELL.rx} y2={WELL.y + 16 + row * 16} />
            {[0, 1, 2, 3, 4].map((i) => (
              <line key={i} x1={WELL.x - WELL.rx + 12 + i * 22 + (row % 2) * 11} y1={WELL.y + row * 16 + 2} x2={WELL.x - WELL.rx + 12 + i * 22 + (row % 2) * 11} y2={WELL.y + 16 + row * 16} />
            ))}
          </g>
        ))}
        <ellipse cx={WELL.x} cy={WELL.y + 58} rx={WELL.rx} ry="12" fill="#8f8474" />
        <ellipse cx={WELL.x} cy={WELL.y} rx={WELL.rx} ry={WELL.ry} fill="#bfb3a0" stroke="#7d7264" strokeWidth="2" />
        <ellipse cx={WELL.x} cy={WELL.y} rx={WELL.rx - 8} ry={WELL.ry - 6} fill="url(#well-dark)" />
        <ellipse cx={WELL.x - 10} cy={WELL.y + 2} rx="9" ry="2.5" fill="#6fa0c0" opacity="0.5" />
        {sp > 0 && (
          <g className="job-wish" opacity={sp}>
            {[0, 1, 2, 3, 4].map((i) => (
              <text key={i} x={WELL.x - 30 + i * 15} y={WELL.y - 6 - (1 - sp) * (30 + i * 8)} textAnchor="middle" fontSize={10 + (i % 2) * 4} fill="#ffe28a">
                ✦
              </text>
            ))}
          </g>
        )}
        {/* the coin */}
        <g transform={`translate(${coin.x} ${coin.y}) scale(${coin.s * Math.max(0.12, Math.abs(coin.spin))} ${coin.s})`} opacity={coin.o}>
          <circle r="8" fill="#e3b94f" stroke="#b8891a" strokeWidth="1.5" />
          <circle r="5" fill="none" stroke="#b8891a" strokeWidth="1" />
        </g>
        {/* the mark */}
        {!c && (
          <g transform={`translate(${m.x} ${m.y})`} className="job-sight">
            <circle r="11" fill="none" stroke="#fff" strokeWidth="2.5" />
            <circle r="11" fill="none" stroke="#e3b94f" strokeWidth="2.5" strokeDasharray="6 8" />
            <circle r="2" fill="#fff" />
          </g>
        )}
        <text x="160" y="190" textAnchor="middle" className="job-svg-label" fill="#1f3d12" fontSize="11">
          {c ? (c.inWell && c.u >= 1 ? 'plip…' : '') : 'press when the ring is over the well'}
        </text>
      </svg>
      {!c && (
        <div className="job-tip">
          <span className="cosy-key">Space</span> to toss the coin
        </div>
      )}
    </div>
  );
}
