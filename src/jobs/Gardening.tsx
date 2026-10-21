import { useRef, useState } from 'react';
import type { FlowerKind } from '../world/types';
import { ChoiceRow, SettleRing, clamp, useFrame, useLater, useMain, type GameProps } from './shared';
import { sfx } from './sfx';

export const FLOWERS: { id: FlowerKind; label: string; colors: [string, string][] }[] = [
  {
    id: 'tulip',
    label: 'Tulip',
    colors: [
      ['#e8505b', 'Red'],
      ['#f39ab5', 'Pink'],
      ['#f6d55c', 'Yellow'],
      ['#a77bd6', 'Purple'],
      ['#fff6ea', 'White'],
    ],
  },
  {
    id: 'daisy',
    label: 'Daisy',
    colors: [
      ['#fffaf0', 'White'],
      ['#f7b6cf', 'Pink'],
      ['#f6e27a', 'Lemon'],
      ['#c9b4f0', 'Lilac'],
      ['#a9d6f5', 'Sky'],
    ],
  },
  {
    id: 'sunflower',
    label: 'Sunflower',
    colors: [
      ['#f6c936', 'Sunny'],
      ['#f2a33a', 'Gold'],
      ['#f7e06a', 'Lemon'],
      ['#e8892f', 'Amber'],
      ['#c8693a', 'Bronze'],
    ],
  },
  {
    id: 'rose',
    label: 'Rose',
    colors: [
      ['#d8343f', 'Red'],
      ['#f39ab5', 'Pink'],
      ['#fff3e6', 'White'],
      ['#f8b590', 'Peach'],
      ['#9e1f3a', 'Crimson'],
    ],
  },
];

const colourName = (kind: FlowerKind, color: string) =>
  FLOWERS.find((f) => f.id === kind)?.colors.find(([c]) => c === color)?.[1].toLowerCase() ?? '';

/** A flower drawn in a 60 × 80 box, standing on its stem. */
export function FlowerHead({ kind, color }: { kind: FlowerKind; color: string }) {
  if (kind === 'tulip') {
    return (
      <g>
        <path d="M17 16 q-1 20 13 23 q14 -3 13 -23 l-7 7 l-6 -12 l-6 12 z" fill={color} stroke="rgba(0,0,0,0.15)" strokeWidth="1.2" />
        <path d="M24 22 q2 10 6 14" stroke="#fff" strokeOpacity="0.4" strokeWidth="2" fill="none" />
      </g>
    );
  }
  if (kind === 'daisy') {
    return (
      <g>
        {Array.from({ length: 11 }, (_, i) => (
          <ellipse key={i} cx="30" cy="16" rx="3.6" ry="9" fill={color} stroke="rgba(0,0,0,0.12)" transform={`rotate(${(i * 360) / 11} 30 26)`} />
        ))}
        <circle cx="30" cy="26" r="6" fill={color === '#f6e27a' ? '#e8892f' : '#f6c936'} />
      </g>
    );
  }
  if (kind === 'sunflower') {
    return (
      <g>
        {Array.from({ length: 14 }, (_, i) => (
          <path key={i} d="M30 26 l-4 -14 l4 -6 l4 6 z" fill={color} stroke="rgba(0,0,0,0.12)" transform={`rotate(${(i * 360) / 14} 30 26)`} />
        ))}
        <circle cx="30" cy="26" r="9" fill="#6b4226" />
        <circle cx="30" cy="26" r="5.5" fill="#4a2c18" />
      </g>
    );
  }
  return (
    <g>
      <circle cx="30" cy="26" r="12" fill={color} stroke="rgba(0,0,0,0.15)" strokeWidth="1.2" />
      <path d="M30 26 m-2 -1 a3 3 0 1 1 4 3 a6 6 0 1 1 -8 -6 a9 9 0 1 1 12 10" stroke="rgba(80,0,20,0.35)" strokeWidth="1.8" fill="none" />
    </g>
  );
}

export function FlowerArt({ kind, color, size = 64 }: { kind: FlowerKind; color: string; size?: number }) {
  return (
    <svg viewBox="0 0 60 80" width={(size * 60) / 80} height={size} aria-hidden="true">
      <path d="M30 78 L30 34" stroke="#4f9a4a" strokeWidth="4" strokeLinecap="round" />
      <path d="M30 60 q-14 -2 -16 -12 q12 0 16 10 z" fill="#6fbf5a" />
      <path d="M30 52 q14 -2 16 -12 q-12 0 -16 10 z" fill="#6fbf5a" />
      <FlowerHead kind={kind} color={color} />
    </svg>
  );
}

type Stage = 'flower' | 'color' | 'dig' | 'water' | 'done';
const DIGS = 3;
/** After the can's tipped back, the last of the water still runs out for this long (seconds, give or take). */
const RUN_ON = 0.22;
/** A perfect watering takes at most this many goes. */
const PERFECT_GOES = 2;

export function Gardening({ finish, setHint }: GameProps<{ kind: FlowerKind; color: string; stars: number }>) {
  const [stage, setStageState] = useState<Stage>('flower');
  const stageRef = useRef<Stage>('flower');
  const [kind, setKind] = useState<FlowerKind>('tulip');
  const [color, setColor] = useState('#e8505b');
  const [digs, setDigs] = useState(0);
  const digsRef = useRef(0);
  const [seed, setSeed] = useState(false);
  const [, redraw] = useState(0);
  const moisture = useRef(0);
  const pouring = useRef(false);
  const held = useRef(0);
  const drip = useRef(0);
  const goes = useRef(0);
  const runOn = useRef(0);
  const runOnFor = useRef(RUN_ON);
  const lastRate = useRef(0);
  const settle = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [settling, setSettling] = useState(0);
  const target = useRef(56 + Math.random() * 18);
  const { later, cancel } = useLater();

  const setStage = (s: Stage) => {
    stageRef.current = s;
    setStageState(s);
  };

  const evaluate = () => {
    setStage('done');
    setSettling(0);
    const m = moisture.current;
    const d = Math.abs(m - target.current);
    const stars = m > 100 ? 1 : d <= 2.5 && goes.current <= PERFECT_GOES ? 3 : d <= 6 ? 2 : 1;
    const name = `${colourName(kind, color)} ${kind}`.trim();
    const line =
      m > 100
        ? `A soggy ${name}. Glub glub.`
        : d <= 8
          ? `A happy ${name}, planted with love.`
          : m < target.current
            ? `A thirsty little ${name}.`
            : `A well-soaked ${name}.`;
    finish({ kind, color, stars }, { stars, title: m > 100 ? 'Splosh!' : undefined, line, art: <FlowerArt kind={kind} color={color} size={96} /> });
  };

  const main = useMain({
    onPress: () => {
      const s = stageRef.current;
      if (s === 'dig') {
        if (digsRef.current >= DIGS) return;
        sfx.thud();
        digsRef.current += 1;
        setDigs(digsRef.current);
        if (digsRef.current === DIGS) {
          later(() => {
            setSeed(true);
            sfx.plop();
          }, 350);
          later(() => {
            setStage('water');
            setHint('Hold to water. It keeps trickling a moment after you stop, so ease off just before the green band’s middle!');
          }, 1000);
        }
      } else if (s === 'water') {
        cancel(settle.current);
        settle.current = null;
        setSettling(0);
        pouring.current = true;
        held.current = 0;
        goes.current += 1;
        runOn.current = 0;
      }
    },
    onRelease: () => {
      if (!pouring.current) return;
      pouring.current = false;
      runOnFor.current = RUN_ON * (0.85 + Math.random() * 0.35);
      runOn.current = runOnFor.current;
      if (moisture.current < 3) return;
      setSettling((n) => n + 1);
      setHint('Hold again for a bit more, or wait.');
      settle.current = later(evaluate, 1200);
    },
  });

  useFrame(
    (dt) => {
      if (pouring.current) {
        held.current += dt;
        lastRate.current = 24 + 14 * Math.min(1, held.current);
        moisture.current = Math.min(125, moisture.current + lastRate.current * dt);
        drip.current -= dt;
        if (drip.current <= 0) {
          sfx.trickle();
          drip.current = 0.09;
        }
      } else if (runOn.current > 0) {
        // The last of it still running out of the spout, tailing off.
        moisture.current = Math.min(125, moisture.current + lastRate.current * (runOn.current / runOnFor.current) * dt);
        runOn.current -= dt;
      }
      redraw((n) => (n + 1) % 1e6);
    },
    stage === 'water' || stage === 'done',
  );

  if (stage === 'flower') {
    return (
      <div className="job-pick">
        <ChoiceRow
          options={FLOWERS.map((f) => ({ id: f.id, label: f.label, art: <FlowerArt kind={f.id} color={f.colors[0][0]} size={56} /> }))}
          onPick={(id) => {
            setKind(id);
            setStage('color');
            setHint('Now pick a colour.');
          }}
        />
      </div>
    );
  }

  if (stage === 'color') {
    const f = FLOWERS.find((x) => x.id === kind)!;
    return (
      <div className="job-pick">
        <ChoiceRow
          className="job-swatches"
          options={f.colors.map(([c, label]) => ({ id: c, label, art: <FlowerArt kind={kind} color={c} size={48} /> }))}
          onPick={(c) => {
            setColor(c);
            setStage('dig');
            setHint('Tap or press Space to dig a hole (3 scoops).');
          }}
        />
      </div>
    );
  }

  const m = moisture.current;
  const wetness = clamp(m / 100, 0, 1);
  const soil = `rgb(${Math.round(150 - wetness * 60)},${Math.round(104 - wetness * 44)},${Math.round(70 - wetness * 30)})`;
  const gy = (v: number) => 170 - (clamp(v, 0, 100) / 100) * 130;

  return (
    <div className={`job-scene job-garden stage-${stage}`} {...main}>
      <svg viewBox="0 0 320 200" preserveAspectRatio="xMidYMid meet" className="job-svg">
        <rect x="-200" y="-100" width="720" height="210" fill="#bfe3f2" />
        <circle cx="40" cy="30" r="18" fill="#fff3c4" />
        {/* the fence */}
        {Array.from({ length: 26 }, (_, i) => (
          <path key={i} d={`M${i * 28 - 192} 112 v-44 l8 -8 l8 8 v44 z`} fill="#f4ead8" stroke="#d6c4a6" strokeWidth="1.5" />
        ))}
        <rect x="-200" y="78" width="720" height="6" fill="#e7d8bd" />
        <rect x="-200" y="100" width="720" height="200" fill="#8fcf74" />
        {[-140, -70, 380, 450].map((x) => (
          <g key={x}>
            <circle cx={x} cy="128" r="9" fill="#f39ab5" />
            <circle cx={x + 16} cy="136" r="7" fill="#f6d55c" />
            <circle cx={x - 12} cy="140" r="6" fill="#fff6ea" />
          </g>
        ))}
        {/* the bed */}
        <ellipse cx="150" cy="150" rx="110" ry="34" fill="#8a5a36" />
        <ellipse cx="150" cy="146" rx="102" ry="28" fill={soil} />
        {/* a hole, deeper with each scoop */}
        {digs > 0 && <ellipse cx="150" cy="148" rx={10 + digs * 6} ry={4 + digs * 2.4} fill="#4a2e1c" />}
        {seed && stage === 'dig' && <ellipse className="job-seed" cx="150" cy="140" rx="4" ry="5" fill="#d9b25a" />}
        {stage !== 'dig' && (
          <g>
            <ellipse cx="150" cy="148" rx="20" ry="6" fill="#5a3a24" opacity="0.6" />
            <g transform={`translate(150 148) scale(${0.25 + Math.min(1, m / 80) * 0.35}) translate(-30 -78)`}>
              <path d="M30 78 L30 40" stroke="#4f9a4a" strokeWidth="4" strokeLinecap="round" />
              <path d="M30 60 q-14 -2 -16 -12 q12 0 16 10 z" fill="#6fbf5a" />
              <path d="M30 52 q14 -2 16 -12 q-12 0 -16 10 z" fill="#6fbf5a" />
            </g>
          </g>
        )}
        {m > 100 && <ellipse cx="150" cy="156" rx={60 + (m - 100) * 2} ry={8 + (m - 100) * 0.3} fill="#7fb6d6" opacity="0.7" />}
        {stage === 'dig' && (
          <g key={digs} className="job-trowel" style={{ transformOrigin: '186px 120px' }}>
            <path d="M178 96 l14 -40 l10 4 l-14 40 z" fill="#8a5a36" />
            <path d="M172 98 q4 26 -10 40 q-12 -18 0 -42 z" fill="#b8c2cc" stroke="#7d8a96" strokeWidth="1.5" />
          </g>
        )}
        {stage === 'dig' &&
          digs > 0 &&
          [0, 1, 2, 3, 4].map((i) => (
            <circle key={`${digs}-${i}`} className="job-dirt" cx="150" cy="142" r={2.5 + (i % 3)} fill="#6a4529" style={{ ['--dx' as string]: `${(i - 2) * 22}px`, animationDelay: `${i * 0.02}s` }} />
          ))}
        {/* the watering can */}
        {stage !== 'dig' && (
          <g className={`job-can ${pouring.current ? 'on' : ''}`} style={{ transformOrigin: '96px 70px' }}>
            <path d="M118 66 l40 -22 l4 6 l-36 26 z" fill="#5fa0c8" />
            <rect x="66" y="52" width="56" height="44" rx="10" fill="#6fb0e0" />
            <path d="M74 52 q22 -26 44 0" stroke="#4f8ab0" strokeWidth="6" fill="none" />
            <ellipse cx="160" cy="46" rx="5" ry="7" fill="#4f8ab0" transform="rotate(-30 160 46)" />
          </g>
        )}
        {pouring.current &&
          [0, 1, 2, 3, 4, 5].map((i) => (
            <line key={i} className="job-drop" x1={140 + i * 4} y1="80" x2={140 + i * 4} y2="88" stroke="#6fb0e0" strokeWidth="2.5" strokeLinecap="round" style={{ animationDelay: `${i * 0.07}s` }} />
          ))}
        {/* the moisture gauge */}
        {stage !== 'dig' && (
          <g>
            <rect x="272" y="36" width="26" height="138" rx="13" fill="#fff8ea" stroke="#e7d3b0" strokeWidth="3" />
            <rect x="278" y={gy(m)} width="14" height={170 - gy(m)} rx="6" fill={m > 100 ? '#e0605a' : '#6fb0e0'} />
            <rect
              x="268"
              y={gy(target.current + 6)}
              width="34"
              height={gy(target.current - 6) - gy(target.current + 6)}
              rx="5"
              fill="#6fbf73"
              fillOpacity="0.35"
              stroke="#3f9a49"
              strokeWidth="2.5"
              className="job-band"
            />
            <path d="M285 24 q-6 8 0 12 q6 -4 0 -12 z" fill="#6fb0e0" />
          </g>
        )}
      </svg>
      {stage === 'water' && settling > 0 && <SettleRing key={settling} ms={1200} label="Soaking in…" />}
      {stage === 'dig' && (
        <div className="job-tip">
          <span className="cosy-key">Space</span> to dig · {digs}/{DIGS}
        </div>
      )}
    </div>
  );
}
