import { useRef, useState } from 'react';
import type { BakeKind } from '../world/types';
import { ChoiceRow, clamp, useFrame, useLater, useMain, type GameProps } from './shared';
import { sfx } from './sfx';

const BAKES: { id: BakeKind; label: string; noun: string }[] = [
  { id: 'loaf', label: 'Loaf', noun: 'loaf of bread' },
  { id: 'pie', label: 'Pie', noun: 'pie' },
  { id: 'bun', label: 'Buns', noun: 'batch of buns' },
];

// How done it is, 0 (raw) to 100 (burnt), as a crust colour.
const CRUST: [number, [number, number, number]][] = [
  [0, [243, 223, 184]],
  [40, [240, 200, 128]],
  [62, [222, 158, 66]],
  [80, [166, 98, 44]],
  [100, [58, 42, 34]],
];

export function crust(p: number): string {
  const v = clamp(p, 0, 100);
  for (let i = 1; i < CRUST.length; i++) {
    const [b, cb] = CRUST[i];
    const [a, ca] = CRUST[i - 1];
    if (v <= b) {
      const k = (v - a) / (b - a);
      const c = ca.map((x, j) => Math.round(x + (cb[j] - x) * k));
      return `rgb(${c[0]},${c[1]},${c[2]})`;
    }
  }
  return 'rgb(58,42,34)';
}

/** A bake drawn around 0,0, about 76 wide. */
function BakeShape({ kind, done }: { kind: BakeKind; done: number }) {
  const c = crust(done);
  const line = 'rgba(90,50,20,0.45)';
  if (kind === 'pie') {
    return (
      <g>
        <ellipse cx="0" cy="10" rx="40" ry="13" fill="#d8dfe6" stroke="#9aa6b2" strokeWidth="2" />
        <ellipse cx="0" cy="4" rx="36" ry="14" fill={c} />
        {[-20, -7, 6, 19].map((x) => (
          <path key={x} d={`M${x - 6} -8 L${x + 8} 16`} stroke={line} strokeWidth="3" strokeLinecap="round" />
        ))}
        {[-20, -7, 6, 19].map((x) => (
          <path key={`b${x}`} d={`M${x + 8} -8 L${x - 6} 16`} stroke={line} strokeWidth="3" strokeLinecap="round" opacity="0.7" />
        ))}
        <ellipse cx="0" cy="4" rx="36" ry="14" fill="none" stroke={line} strokeWidth="4" />
      </g>
    );
  }
  if (kind === 'bun') {
    return (
      <g>
        {[
          [-22, 6],
          [0, 0],
          [22, 6],
        ].map(([x, y], i) => (
          <g key={i}>
            <ellipse cx={x} cy={y + 8} rx="18" ry="13" fill={c} />
            <ellipse cx={x - 4} cy={y + 3} rx="7" ry="3" fill="#fff" opacity="0.25" />
            {[-6, 0, 6].map((sx) => (
              <ellipse key={sx} cx={x + sx} cy={y + 4 + Math.abs(sx) * 0.3} rx="1.6" ry="1" fill="#fff6dc" />
            ))}
          </g>
        ))}
      </g>
    );
  }
  return (
    <g>
      <path d="M-38 16 q0 -36 38 -36 q38 0 38 36 z" fill={c} />
      {[-16, 0, 16].map((x) => (
        <path key={x} d={`M${x - 7} -6 q7 -6 14 4`} stroke={line} strokeWidth="3" fill="none" strokeLinecap="round" />
      ))}
      <path d="M-26 -6 q8 -10 22 -12" stroke="#fff" strokeOpacity="0.3" strokeWidth="4" fill="none" strokeLinecap="round" />
    </g>
  );
}

export function BakeArt({ kind, done = 62, size = 64 }: { kind: BakeKind; done?: number; size?: number }) {
  return (
    <svg viewBox="-46 -30 92 56" width={size} height={(size * 56) / 92} aria-hidden="true">
      <BakeShape kind={kind} done={done} />
    </svg>
  );
}

type Stage = 'pick' | 'knead' | 'oven' | 'done';
const KNEADS = 4;
const RING_FROM = 2.1;
const RING_TO = 0.42;
/** How long the ring takes to close, knead by knead: each one quicker than the last. */
const RING_SECS = [1.2, 1.05, 0.92, 0.8];

export function Baking({ finish, setHint }: GameProps<{ kind: BakeKind; stars: number }>) {
  const [stage, setStageState] = useState<Stage>('pick');
  const stageRef = useRef<Stage>('pick');
  const [kind, setKind] = useState<BakeKind>('loaf');
  const [, redraw] = useState(0);
  const ring = useRef(RING_FROM);
  const resting = useRef(0);
  const scores = useRef<number[]>([]);
  const [pops, setPops] = useState<{ id: number; text: string; tone: number }[]>([]);
  const [squish, setSquish] = useState(0);
  const oven = useRef(0);
  const { later } = useLater();

  const setStage = (s: Stage) => {
    stageRef.current = s;
    setStageState(s);
  };

  const pop = (text: string, tone: number) => {
    const id = Math.random();
    setPops((p) => [...p.slice(-2), { id, text, tone }]);
    later(() => setPops((p) => p.filter((x) => x.id !== id)), 800);
  };

  const knead = (score: number) => {
    scores.current.push(score);
    pop(['Miss', 'Okay', 'Good', 'Perfect!'][score], score);
    if (score > 0) {
      sfx.squish();
      setSquish((n) => n + 1);
    } else sfx.miss();
    resting.current = 0.45;
    ring.current = RING_FROM;
    if (scores.current.length >= KNEADS) {
      later(() => {
        setStage('oven');
        oven.current = 0;
        setHint('Into the oven! Tap or press Space when it’s golden.');
      }, 650);
    } else setHint(`Tap or press Space when the ring meets the dough (${scores.current.length + 1}/${KNEADS})`);
  };

  const takeOut = () => {
    setStage('done');
    sfx.ovenDing();
    const p = oven.current;
    const ovenStars = Math.abs(p - 62.5) <= 2.5 ? 3 : p >= 55 && p <= 70 ? 2 : 1;
    const avg = scores.current.reduce((a, b) => a + b, 0) / KNEADS;
    // Three stars: perfect kneading (one slip allowed) and taken out right on golden.
    const stars = avg >= 2.75 && ovenStars === 3 ? 3 : avg >= 1.75 && ovenStars >= 2 ? 2 : 1;
    const noun = BAKES.find((b) => b.id === kind)!.noun;
    const line =
      p < 54 ? `A pale ${noun}, a bit doughy.` : p > 71 ? (p > 90 ? `A very crispy ${noun}…` : `A crunchy ${noun}.`) : `A golden ${noun}, fresh from the oven!`;
    finish({ kind, stars }, { stars, title: p > 90 ? 'Oops!' : undefined, line, art: <BakeArt kind={kind} done={p} size={96} /> });
  };

  const main = useMain({
    onPress: () => {
      const s = stageRef.current;
      if (s === 'knead' && resting.current <= 0) {
        const off = Math.abs(ring.current - 1);
        knead(off <= 0.07 ? 3 : off <= 0.16 ? 2 : off <= 0.33 ? 1 : 0);
      } else if (s === 'oven') takeOut();
    },
  });

  useFrame(
    (dt) => {
      const s = stageRef.current;
      if (s === 'knead' && scores.current.length < KNEADS) {
        if (resting.current > 0) resting.current -= dt;
        else {
          ring.current -= ((RING_FROM - RING_TO) / RING_SECS[Math.min(scores.current.length, KNEADS - 1)]) * dt;
          if (ring.current <= RING_TO) knead(0);
        }
      } else if (s === 'oven') {
        oven.current += (17 + oven.current * 0.36) * dt;
        if (oven.current >= 100) {
          oven.current = 100;
          takeOut();
        }
      }
      redraw((n) => (n + 1) % 1e6);
    },
    stage === 'knead' || stage === 'oven',
  );

  if (stage === 'pick') {
    return (
      <div className="job-pick">
        <ChoiceRow
          options={BAKES.map((b) => ({ id: b.id, label: b.label, art: <BakeArt kind={b.id} size={56} /> }))}
          onPick={(id) => {
            setKind(id);
            setStage('knead');
            ring.current = RING_FROM;
            resting.current = 0.6;
            setHint(`Tap or press Space when the ring meets the dough (1/${KNEADS})`);
          }}
        />
      </div>
    );
  }

  if (stage === 'knead') {
    const s = ring.current;
    const near = Math.abs(s - 1) <= 0.18;
    return (
      <div className="job-scene job-knead" {...main}>
        <svg viewBox="0 0 320 200" preserveAspectRatio="xMidYMid meet" className="job-svg">
          <rect x="-200" y="-100" width="720" height="400" fill="#c99358" />
          {[-120, -80, -40, 0, 40, 80, 120, 160, 200, 240].map((y) => (
            <rect key={y} x="-200" y={y} width="720" height="38" fill={(y + 160) % 80 ? '#d39e60' : '#dcab70'} />
          ))}
          {[
            [70, 60, 14],
            [250, 150, 18],
            [240, 52, 10],
            [86, 160, 12],
          ].map(([x, y, r], i) => (
            <circle key={i} cx={x} cy={y} r={r} fill="#fff" opacity="0.35" />
          ))}
          <g key={squish} className="job-dough" style={{ transformOrigin: '160px 120px' }}>
            <ellipse cx="160" cy="112" rx="54" ry="40" fill="#f3dfb8" />
            <ellipse cx="146" cy="98" rx="20" ry="9" fill="#fff" opacity="0.4" />
            <path d="M136 120 q24 10 48 0" stroke="#e2c79a" strokeWidth="3" fill="none" strokeLinecap="round" />
          </g>
          <ellipse cx="160" cy="112" rx="54" ry="40" fill="none" stroke="#5a4434" strokeOpacity="0.45" strokeWidth="2.5" strokeDasharray="5 5" />
          {resting.current <= 0 && (
            <ellipse cx="160" cy="112" rx={54 * s} ry={40 * s} fill="none" stroke={near ? '#6fbf73' : '#ff9a62'} strokeWidth="5" />
          )}
          {/* your paws, ready to knead */}
          {[96, 224].map((x) => (
            <g key={x} className={`job-paw ${squish % 2 ? 'a' : 'b'}`}>
              <ellipse cx={x} cy="190" rx="26" ry="20" fill="#fff8ea" stroke="#e7d3b0" strokeWidth="2" />
              <ellipse cx={x} cy="190" rx="10" ry="8" fill="#f6b8c6" />
              {[-14, 0, 14].map((dx) => (
                <circle key={dx} cx={x + dx} cy={dx ? 176 : 172} r="4.5" fill="#f6b8c6" />
              ))}
            </g>
          ))}
        </svg>
        <div className="job-count">
          {Array.from({ length: KNEADS }, (_, i) => (
            <span key={i} className={`job-pip ${i < scores.current.length ? `on s${scores.current[i]}` : ''}`} />
          ))}
        </div>
        {pops.map((p) => (
          <span key={p.id} className={`job-pop tone-${p.tone}`}>
            {p.text}
          </span>
        ))}
      </div>
    );
  }

  const p = oven.current;
  return (
    <div className="job-scene job-oven" {...main}>
      <svg viewBox="0 0 320 200" preserveAspectRatio="xMidYMid meet" className="job-svg">
        <defs>
          <radialGradient id="oven-fire" cx="0.5" cy="1">
            <stop offset="0" stopColor="#ffcf5a" />
            <stop offset="0.5" stopColor="#ff7a3a" stopOpacity="0.8" />
            <stop offset="1" stopColor="#3a1a10" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="oven-bar" x1="0" x2="1">
            <stop offset="0" stopColor={crust(0)} />
            <stop offset="0.4" stopColor={crust(40)} />
            <stop offset="0.62" stopColor={crust(62)} />
            <stop offset="0.8" stopColor={crust(80)} />
            <stop offset="1" stopColor={crust(100)} />
          </linearGradient>
        </defs>
        <rect x="-200" y="-100" width="720" height="400" fill="#c4683f" />
        {Array.from({ length: 16 }, (_, row) =>
          Array.from({ length: 19 }, (_, col) => (
            <rect key={`${row}-${col}`} x={col * 40 - 200 - (row % 2) * 20} y={row * 24 - 96} width="38" height="22" rx="3" fill="#b65c38" />
          )),
        )}
        <path d="M70 156 L70 80 Q160 6 250 80 L250 156 Z" fill="#3a1f16" />
        <path d="M70 156 L70 80 Q160 6 250 80 L250 156 Z" fill="url(#oven-fire)" className="job-fire" />
        <rect x="80" y="126" width="160" height="6" rx="3" fill="#6b6b70" />
        <g transform={`translate(160 ${112}) scale(${1 + p / 600})`}>
          <BakeShape kind={kind} done={p} />
        </g>
        {p > 74 && (
          <g className="job-smoke" fill="#8a8a8a">
            <circle cx="150" cy="70" r="8" />
            <circle cx="170" cy="60" r="10" style={{ animationDelay: '0.4s' }} />
          </g>
        )}
        <rect x="60" y="150" width="200" height="10" rx="4" fill="#8a4a2e" />
        {/* the doneness bar */}
        <rect x="30" y="168" width="260" height="20" rx="10" fill="url(#oven-bar)" stroke="#fff8ea" strokeWidth="3" />
        <rect x={30 + 260 * 0.54} y="164" width={260 * 0.17} height="28" rx="8" fill="none" stroke="#fff" strokeWidth="3" />
        <g transform={`translate(${30 + 260 * 0.625} 154)`}>
          <rect x="-24" y="-9" width="48" height="15" rx="7.5" fill="#fff8ea" />
          <text y="2.5" textAnchor="middle" className="job-svg-label" fill="#b06a1a">
            golden
          </text>
        </g>
        <g transform={`translate(${30 + (260 * p) / 100} 0)`}>
          <rect x="-2" y="166" width="4" height="24" rx="2" fill="#5a4434" />
          <path d="M-8 199 h16 l-8 -9 z" fill="#5a4434" />
        </g>
      </svg>
    </div>
  );
}
