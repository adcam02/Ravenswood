import { useRef, useState } from 'react';
import type { DrinkKind } from '../world/types';
import { ChoiceRow, SettleRing, clamp, useFrame, useLater, useMain, type GameProps } from './shared';
import { sfx } from './sfx';

interface Drink {
  id: DrinkKind;
  label: string;
  noun: string;
  liquid: string;
  deep: string;
  top?: 'foam' | 'bubbles' | 'marsh';
}

export const DRINKS: Drink[] = [
  { id: 'ale', label: 'Ale', noun: 'pint of ale', liquid: '#e3a33a', deep: '#b9761c', top: 'foam' },
  { id: 'cider', label: 'Cider', noun: 'glass of cider', liquid: '#ead35e', deep: '#c6a634', top: 'bubbles' },
  { id: 'milk', label: 'Milk', noun: 'glass of milk', liquid: '#fffaf0', deep: '#efe4d0' },
  { id: 'cocoa', label: 'Cocoa', noun: 'mug of cocoa', liquid: '#8f5a37', deep: '#6b3f22', top: 'marsh' },
];

export const drinkInfo = (id: DrinkKind) => DRINKS.find((d) => d.id === id) ?? DRINKS[0];

export function DrinkIcon({ kind, size = 44 }: { kind: DrinkKind; size?: number }) {
  const d = drinkInfo(kind);
  return (
    <svg viewBox="0 0 40 40" width={size} height={size} aria-hidden="true">
      <path d="M29 15 h3 a5 5 0 0 1 0 12 h-3" fill="none" stroke="#a9cbd9" strokeWidth="3" />
      <rect x="9" y="9" width="21" height="25" rx="4" fill="#e8f5fa" stroke="#a9cbd9" strokeWidth="2" />
      <rect x="11" y="15" width="17" height="17" rx="2.5" fill={d.liquid} />
      <rect x="11" y="27" width="17" height="5" rx="2.5" fill={d.deep} opacity="0.55" />
      {d.top === 'foam' && <path d="M10 16 q2 -5 5 -2 q3 -4 6 0 q3 -4 6 0 q2 -1 3 2 v2 h-20 z" fill="#fffaf0" />}
      {d.top === 'marsh' && (
        <g fill="#fff">
          <rect x="13" y="12" width="5" height="5" rx="1.5" />
          <rect x="20" y="13" width="5" height="5" rx="1.5" transform="rotate(14 22 15)" />
        </g>
      )}
      {d.top === 'bubbles' && (
        <g fill="#fff" opacity="0.8">
          <circle cx="15" cy="22" r="1.2" />
          <circle cx="21" cy="26" r="1" />
          <circle cx="24" cy="20" r="1.3" />
        </g>
      )}
      <rect x="12" y="11" width="3" height="18" rx="1.5" fill="#fff" opacity="0.55" />
    </svg>
  );
}

// The mug's inside, in the scene's coordinates: level 0 is the bottom, 100 the rim.
const IN_L = 121;
const IN_R = 199;
const IN_BOTTOM = 170;
const IN_H = 100;
const yOf = (level: number) => IN_BOTTOM - (clamp(level, 0, 100) / 100) * IN_H;

type Stage = 'pick' | 'pour' | 'done';

export function Bartender({ finish, setHint }: GameProps<{ kind: DrinkKind; stars: number }>) {
  const [stage, setStage] = useState<Stage>('pick');
  const [drink, setDrink] = useState<Drink>(DRINKS[0]);
  const [, redraw] = useState(0);
  const level = useRef(0);
  const pouring = useRef(false);
  const held = useRef(0);
  const wobble = useRef(0);
  const glug = useRef(0);
  const settle = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [settling, setSettling] = useState(0);
  const target = useRef(68 + Math.random() * 16);
  const { later, cancel } = useLater();

  const evaluate = () => {
    setStage('done');
    setSettling(0);
    const lv = level.current;
    const c = target.current;
    const d = Math.abs(lv - c);
    let stars = 1;
    let title: string | undefined;
    let line: string;
    if (lv > 100) {
      title = 'Whoops!';
      line = `Spilt ${drink.label.toLowerCase()} all over the bar!`;
    } else if (d <= 2.5) {
      stars = 3;
      line = `A perfect ${drink.noun}.`;
    } else if (d <= 7) {
      stars = 2;
      line = `A lovely ${drink.noun}.`;
    } else if (lv < c) {
      line = `A ${drink.noun}, a little short.`;
    } else {
      line = `A very full ${drink.noun}.`;
    }
    finish({ kind: drink.id, stars }, { stars, title, line, art: <DrinkIcon kind={drink.id} size={64} /> });
  };

  const main = useMain({
    enabled: stage === 'pour',
    onPress: () => {
      cancel(settle.current);
      settle.current = null;
      setSettling(0);
      pouring.current = true;
      held.current = 0;
    },
    onRelease: () => {
      if (!pouring.current) return;
      pouring.current = false;
      if (level.current < 3) return;
      setHint('Hold again to top it up, or wait to serve.');
      setSettling((n) => n + 1);
      settle.current = later(evaluate, 1300);
    },
  });

  useFrame(
    (dt) => {
      if (pouring.current) {
        held.current += dt;
        const rate = 30 + 16 * Math.min(1, held.current / 1.2);
        level.current = Math.min(130, level.current + rate * dt);
        wobble.current = Math.min(1, wobble.current + dt * 4);
        glug.current -= dt;
        if (glug.current <= 0) {
          sfx.gurgle();
          glug.current = 0.11;
        }
      } else wobble.current = Math.max(0, wobble.current - dt * 1.4);
      redraw((n) => (n + 1) % 1e6);
    },
    stage !== 'pick',
  );

  if (stage === 'pick') {
    return (
      <div className="job-pick">
        <ChoiceRow
          options={DRINKS.map((d) => ({ id: d.id, label: d.label, art: <DrinkIcon kind={d.id} size={56} /> }))}
          onPick={(id) => {
            setDrink(drinkInfo(id));
            setStage('pour');
            setHint('Hold to pour. Stop at the line!');
          }}
        />
      </div>
    );
  }

  const lv = level.current;
  const top = yOf(lv);
  const t = performance.now() / 1000;
  const amp = 0.6 + wobble.current * 2.4;
  let wave = `M${IN_L} ${IN_BOTTOM + 4} L${IN_L} ${top}`;
  for (let x = IN_L; x <= IN_R; x += 6) wave += ` L${x} ${top + Math.sin(x * 0.13 + t * 9) * amp}`;
  wave += ` L${IN_R} ${top} L${IN_R} ${IN_BOTTOM + 4} Z`;
  const foamH = drink.top === 'foam' ? Math.min(14, lv * 0.16) : 0;
  const lo = yOf(target.current - 5);
  const hi = yOf(target.current + 5);
  const lineY = yOf(target.current);
  const spill = Math.max(0, lv - 100);

  return (
    <div className="job-scene job-bar" {...main}>
      <svg viewBox="0 0 320 200" preserveAspectRatio="xMidYMid meet" className="job-svg">
        <defs>
          <linearGradient id="bar-wall" x1="0" y1="0" x2="0" y2="200" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#8a5733" />
            <stop offset="1" stopColor="#5e3920" />
          </linearGradient>
          <radialGradient id="bar-lamp">
            <stop offset="0" stopColor="#ffd98a" stopOpacity="0.6" />
            <stop offset="1" stopColor="#ffd98a" stopOpacity="0" />
          </radialGradient>
          <clipPath id="bar-mug">
            <rect x={IN_L} y="60" width={IN_R - IN_L} height={IN_BOTTOM - 56} rx="8" />
          </clipPath>
        </defs>
        <rect x="-200" y="-100" width="720" height="400" fill="#5e3920" />
        <rect x="-200" y="0" width="720" height="200" fill="url(#bar-wall)" />
        {[-160, -120, -80, -40, 0, 40, 80, 240, 280, 320, 360, 400, 440, 480].map((x) => (
          <line key={x} x1={x} y1="-100" x2={x} y2="178" stroke="#4d2e18" strokeOpacity="0.35" strokeWidth="2" />
        ))}
        <circle cx="270" cy="40" r="60" fill="url(#bar-lamp)" />
        {/* a shelf of bottles */}
        <rect x="18" y="62" width="80" height="6" rx="2" fill="#4d2e18" />
        {[26, 42, 58, 76].map((x, i) => (
          <g key={x}>
            <rect x={x} y={34 + (i % 2) * 6} width="10" height={28 - (i % 2) * 6} rx="3" fill={['#6a9c78', '#b85a4a', '#d9b25a', '#7a8fc0'][i]} />
            <rect x={x + 3} y={28 + (i % 2) * 6} width="4" height="8" rx="1" fill={['#6a9c78', '#b85a4a', '#d9b25a', '#7a8fc0'][i]} />
          </g>
        ))}
        {/* the tap */}
        <rect x="140" y="0" width="40" height="14" rx="4" fill="#c9a24e" />
        <g className={`job-tap-handle ${pouring.current ? 'on' : ''}`} style={{ transformOrigin: '160px 6px' }}>
          <rect x="156" y="-24" width="8" height="30" rx="4" fill="#7a4b2a" />
        </g>
        <path d="M150 12 h20 v10 q0 6 -6 8 v6 h-8 v-6 q-6 -2 -6 -8 z" fill="#d8b25e" stroke="#9c7a33" strokeWidth="1.5" />
        {/* the stream */}
        {pouring.current && (
          <rect className="job-stream" x="157" y="34" width="6" height={Math.max(0, top - 34)} rx="3" fill={drink.liquid} />
        )}
        {/* counter */}
        <rect x="-200" y="176" width="720" height="124" fill="#a8693c" />
        <rect x="-200" y="176" width="720" height="5" fill="#c98a54" />
        {spill > 0 && <ellipse cx="160" cy="182" rx={50 + spill * 2.2} ry={5 + spill * 0.12} fill={drink.liquid} opacity="0.85" />}
        {/* mug */}
        <path d="M205 82 h10 a20 20 0 0 1 0 50 h-10" fill="none" stroke="#a9cbd9" strokeWidth="9" strokeOpacity="0.9" />
        <rect x="113" y="56" width="94" height="122" rx="12" fill="#e9f6fb" fillOpacity="0.55" stroke="#a9cbd9" strokeWidth="5" />
        <g clipPath="url(#bar-mug)">
          <path d={wave} fill={drink.liquid} />
          <rect x={IN_L} y={IN_BOTTOM - 14} width={IN_R - IN_L} height="20" fill={drink.deep} opacity="0.4" />
          {foamH > 0 && (
            <path
              d={`M${IN_L} ${top + foamH} L${IN_L} ${top} ${Array.from({ length: 7 }, (_, i) => `q6 ${-5 - Math.sin(t * 3 + i) * 1.5} 11 0`).join(' ')} L${IN_R} ${top + foamH} Z`}
              fill="#fffaf0"
            />
          )}
          {drink.top === 'bubbles' && lv > 8 && (
            <g className="job-fizz" fill="#fff">
              {[132, 146, 160, 174, 188, 140, 168, 182].map((x, i) => (
                <circle key={i} cx={x} cy={IN_BOTTOM - 6} r={1.4 + (i % 3) * 0.5} style={{ animationDelay: `${i * 0.23}s`, ['--rise' as string]: `${-(IN_BOTTOM - top - 8)}px` }} />
              ))}
            </g>
          )}
          {drink.top === 'marsh' && !pouring.current && lv > 18 && (
            <g fill="#fff" className="job-marsh">
              <rect x="134" y={top - 7} width="13" height="11" rx="3" />
              <rect x="152" y={top - 6} width="13" height="11" rx="3" transform={`rotate(12 158 ${top})`} />
              <rect x="170" y={top - 8} width="13" height="11" rx="3" transform={`rotate(-10 176 ${top})`} />
            </g>
          )}
        </g>
        <rect x="119" y="62" width="8" height="104" rx="4" fill="#fff" opacity="0.4" />
        {spill > 0 && (
          <g fill={drink.liquid}>
            <rect x="108" y="56" width="7" height={Math.min(120, spill * 9)} rx="3.5" />
            <rect x="205" y="56" width="7" height={Math.min(120, spill * 7)} rx="3.5" />
          </g>
        )}
        {/* the line */}
        <rect x="100" y={hi} width="120" height={lo - hi} fill="#6fbf73" opacity="0.28" rx="3" />
        <line x1="100" y1={lineY} x2="220" y2={lineY} stroke="#3f9a49" strokeWidth="2.5" strokeDasharray="6 5" />
        <g transform={`translate(226 ${lineY})`}>
          <path d="M0 0 l9 -7 h46 a4 4 0 0 1 4 4 v6 a4 4 0 0 1 -4 4 h-46 z" fill="#3f9a49" />
          <text x="34" y="4" textAnchor="middle" className="job-svg-label" fill="#fff">
            the line
          </text>
        </g>
      </svg>
      {stage === 'pour' && settling > 0 && <SettleRing key={settling} ms={1300} label="Serving…" />}
      {stage === 'pour' && lv === 0 && (
        <div className="job-tip">
          Hold <span className="cosy-key">Space</span> or press the mug
        </div>
      )}
    </div>
  );
}
