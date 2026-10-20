import { useRef, useState } from 'react';
import { clamp, useFrame, useMain, type GameProps } from './shared';
import { sfx } from './sfx';

interface Fish {
  name: string;
  weight: number;
  cm: [number, number];
  /** How hard it fights: speeds up the green zone and shrinks it. */
  fight: number;
  stars: number;
  body: string;
  belly: string;
  fin: string;
  long?: boolean;
  glow?: boolean;
  boot?: boolean;
}

export const FISH: Fish[] = [
  { name: 'Minnow', weight: 22, cm: [4, 9], fight: 0.55, stars: 1, body: '#b8c4cc', belly: '#e8eef0', fin: '#98a6b0' },
  { name: 'Perch', weight: 20, cm: [14, 30], fight: 0.8, stars: 1, body: '#8fae5a', belly: '#e8e0a0', fin: '#e8823a' },
  { name: 'Trout', weight: 18, cm: [25, 55], fight: 1, stars: 2, body: '#9aa88a', belly: '#f2c4c0', fin: '#7d8a70' },
  { name: 'Carp', weight: 14, cm: [30, 70], fight: 0.9, stars: 2, body: '#b8873e', belly: '#e8c98a', fin: '#9a6a2a' },
  { name: 'Catfish', weight: 10, cm: [40, 90], fight: 1.1, stars: 2, body: '#5e5a54', belly: '#a8a094', fin: '#4a4640' },
  { name: 'Pike', weight: 7, cm: [50, 110], fight: 1.3, stars: 3, body: '#6a8a4a', belly: '#d8dca0', fin: '#5a7038', long: true },
  { name: 'Golden Carp', weight: 4, cm: [35, 65], fight: 1.3, stars: 3, body: '#f2b632', belly: '#ffe28a', fin: '#e8892f' },
  { name: 'Old Boot', weight: 4, cm: [27, 31], fight: 0.5, stars: 0, body: '#6b4a32', belly: '#8a6446', fin: '#4a3222', boot: true },
  { name: 'Moonfish', weight: 1, cm: [60, 120], fight: 1.5, stars: 3, body: '#bcd6f5', belly: '#f4f8ff', fin: '#8fb0e8', glow: true },
];

function rollFish(): Fish {
  const total = FISH.reduce((n, f) => n + f.weight, 0);
  let r = Math.random() * total;
  for (const f of FISH) {
    r -= f.weight;
    if (r <= 0) return f;
  }
  return FISH[0];
}

export function FishArt({ kind, size = 64 }: { kind: string; size?: number }) {
  const f = FISH.find((x) => x.name === kind) ?? FISH[0];
  if (f.boot) {
    return (
      <svg viewBox="0 0 60 60" width={size} height={size} aria-hidden="true">
        <path d="M18 8 h18 v26 q0 4 4 5 l10 3 q6 2 6 8 v4 h-42 z" fill={f.body} stroke="#3a2618" strokeWidth="2" strokeLinejoin="round" />
        <rect x="14" y="50" width="44" height="5" rx="2" fill={f.fin} />
        <path d="M22 16 h10 M22 22 h10 M22 28 h10" stroke="#e8d8b0" strokeWidth="2" />
        <path d="M44 44 q4 -3 8 0" stroke="#7cc28b" strokeWidth="3" fill="none" strokeLinecap="round" />
      </svg>
    );
  }
  const len = f.long ? 54 : 44;
  return (
    <svg viewBox="0 0 70 40" width={size} height={(size * 40) / 70} aria-hidden="true" className={f.glow ? 'job-glowfish' : ''}>
      <path d={`M${8 + len} 20 l10 -10 v20 z`} fill={f.fin} />
      <ellipse cx={8 + len / 2} cy="20" rx={len / 2} ry={f.long ? 9 : 12} fill={f.body} />
      <ellipse cx={8 + len / 2} cy="25" rx={len / 2.4} ry={f.long ? 4 : 6} fill={f.belly} />
      <path d={`M${len / 2} ${f.long ? 11 : 8} q8 -6 14 0`} fill={f.fin} />
      {f.name === 'Perch' && [0, 1, 2].map((i) => <rect key={i} x={20 + i * 9} y="10" width="3" height="14" rx="1.5" fill="#4d6a30" opacity="0.6" />)}
      {f.name === 'Trout' && [0, 1, 2, 3, 4].map((i) => <circle key={i} cx={18 + i * 7} cy={15 + (i % 2) * 4} r="1.4" fill="#5a4a3a" />)}
      {f.name === 'Catfish' && <path d="M8 22 q-6 2 -7 8 M9 24 q-4 4 -3 9" stroke="#3a3632" strokeWidth="1.5" fill="none" />}
      <circle cx="15" cy="17" r="3.2" fill="#fff" />
      <circle cx="14.4" cy="17" r="1.8" fill="#2a2a2a" />
      <path d="M9 23 q3 2 6 0" stroke="#3a3632" strokeWidth="1.2" fill="none" />
    </svg>
  );
}

type Phase = 'ready' | 'cast' | 'wait' | 'bite' | 'reel' | 'done';

const TIP = { x: 104, y: 64 };

export function Fishing({ finish, setHint }: GameProps<{ kind: string; cm: number; stars: number } | null>) {
  const [phase, setPhaseState] = useState<Phase>('ready');
  const phaseRef = useRef<Phase>('ready');
  const [, redraw] = useState(0);
  const spot = useRef({ x: 200 + Math.random() * 50, y: 104 + Math.random() * 20 });
  const castT = useRef(0);
  const waitLeft = useRef(0);
  const biteLeft = useRef(0);
  const misses = useRef(0);
  const nibble = useRef(0);
  const ripples = useRef<{ id: number; x: number; y: number; t: number }[]>([]);
  const fish = useRef<Fish>(FISH[0]);
  const reel = useRef({ marker: 20, v: 0, zone: 30, zoneW: 28, zoneTo: 50, retarget: 1, progress: 30, click: 0 });
  const holding = useRef(false);

  const setPhase = (p: Phase) => {
    phaseRef.current = p;
    setPhaseState(p);
  };

  const ripple = (x: number, y: number) => {
    ripples.current.push({ id: Math.random(), x, y, t: 0 });
  };

  const gotAway = (title: string, line: string) => {
    setPhase('done');
    sfx.miss();
    finish(null, { stars: 0, title, line });
  };

  const main = useMain({
    onPress: () => {
      holding.current = true;
      const p = phaseRef.current;
      if (p === 'ready') {
        setPhase('cast');
        castT.current = 0;
        sfx.swish();
        setHint('Whoosh…');
      } else if (p === 'wait') {
        gotAway('Too soon!', 'You splashed and scared the fish away.');
      } else if (p === 'bite') {
        fish.current = rollFish();
        const f = fish.current;
        reel.current = { marker: 18, v: 0, zone: 35, zoneW: 32 - f.fight * 7, zoneTo: 50, retarget: 0.6, progress: 30, click: 0 };
        setPhase('reel');
        sfx.splash();
        setHint('Hold to pull right, let go to drift. Stay in the green!');
      }
    },
    onRelease: () => {
      holding.current = false;
    },
  });

  useFrame((dt) => {
    const p = phaseRef.current;
    for (const r of ripples.current) r.t += dt;
    ripples.current = ripples.current.filter((r) => r.t < 1.6);
    if (p === 'cast') {
      castT.current += dt / 0.6;
      if (castT.current >= 1) {
        castT.current = 1;
        sfx.plop();
        ripple(spot.current.x, spot.current.y);
        waitLeft.current = 2 + Math.random() * 5;
        setPhase('wait');
        setHint('Wait for a bite… don’t move a fin!');
      }
    } else if (p === 'wait') {
      waitLeft.current -= dt;
      nibble.current = Math.max(0, nibble.current - dt);
      if (waitLeft.current > 0.8 && Math.random() < dt * 0.45) {
        nibble.current = 0.18;
        ripple(spot.current.x, spot.current.y);
      }
      if (waitLeft.current <= 0) {
        biteLeft.current = 0.75;
        setPhase('bite');
        sfx.splash();
        ripple(spot.current.x, spot.current.y);
        setHint('Now! Tap or press Space!');
      }
    } else if (p === 'bite') {
      biteLeft.current -= dt;
      if (biteLeft.current <= 0) {
        misses.current += 1;
        if (misses.current >= 2) gotAway('It got away…', 'Too slow! Better luck next cast.');
        else {
          waitLeft.current = 1.5 + Math.random() * 2.5;
          setPhase('wait');
          sfx.miss();
          setHint('Missed it! Wait for another nibble…');
        }
      }
    } else if (p === 'reel') {
      const r = reel.current;
      const f = fish.current;
      r.v += (holding.current ? 250 : -210) * dt;
      r.v = clamp(r.v, -95, 95);
      r.marker += r.v * dt;
      if (r.marker < 0) {
        r.marker = 0;
        r.v = 0;
      }
      if (r.marker > 100) {
        r.marker = 100;
        r.v = 0;
      }
      r.retarget -= dt;
      if (r.retarget <= 0) {
        r.zoneTo = Math.random() * (100 - r.zoneW);
        r.retarget = 0.8 + Math.random() * 0.9;
      }
      const speed = 22 * f.fight;
      const dz = r.zoneTo - r.zone;
      r.zone += clamp(dz, -speed * dt, speed * dt);
      const inZone = r.marker >= r.zone && r.marker <= r.zone + r.zoneW;
      r.progress += (inZone ? 25 : -15) * dt;
      r.click -= dt;
      if (holding.current && r.click <= 0) {
        sfx.click();
        r.click = 0.09;
      }
      if (Math.random() < dt * 2) ripple(spot.current.x + (Math.random() - 0.5) * 16, spot.current.y);
      if (r.progress >= 100) {
        setPhase('done');
        sfx.splash();
        const cm = Math.round(f.cm[0] + Math.random() * (f.cm[1] - f.cm[0]));
        const big = (cm - f.cm[0]) / Math.max(1, f.cm[1] - f.cm[0]) > 0.75;
        const stars = f.boot ? 0 : Math.min(3, f.stars + (big ? 1 : 0));
        finish(
          { kind: f.name, cm, stars },
          f.boot
            ? { stars: 0, title: 'Oh no…', line: 'You fished up an old boot!', art: <FishArt kind={f.name} size={72} /> }
            : { stars, title: f.stars >= 3 ? 'Wow!' : undefined, line: `Caught a ${cm}cm ${f.name}!`, art: <FishArt kind={f.name} size={96} /> },
        );
      } else if (r.progress <= 0) gotAway('It got away…', 'The line went slack. Better luck next cast.');
    }
    redraw((n) => (n + 1) % 1e6);
  });

  // Where the float is right now.
  const now = performance.now() / 1000;
  let bx = TIP.x;
  let by = TIP.y + 30;
  if (phase !== 'ready') {
    const k = phase === 'cast' ? castT.current : 1;
    bx = TIP.x + (spot.current.x - TIP.x) * k;
    by = TIP.y + 30 + (spot.current.y - TIP.y - 30) * k - Math.sin(Math.PI * k) * 46;
    if (phase === 'wait') by += Math.sin(now * 3) * 1.4 + nibble.current * 18;
    if (phase === 'bite') {
      by += 7 + Math.sin(now * 30) * 1.5;
    }
    if (phase === 'reel' || phase === 'done') {
      bx += Math.sin(now * 13) * 3;
      by += 5 + Math.sin(now * 17) * 2;
    }
  }
  const r = reel.current;

  return (
    <div className={`job-scene job-fish phase-${phase}`} {...main}>
      <svg viewBox="0 0 320 200" preserveAspectRatio="xMidYMid meet" className="job-svg">
        <defs>
          <linearGradient id="pond" x1="0" y1="0" x2="0" y2="200" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#8fd0e2" />
            <stop offset="1" stopColor="#4a99bd" />
          </linearGradient>
          <clipPath id="above-water">
            <rect x="0" y="0" width="320" height={spot.current.y + 1} />
          </clipPath>
        </defs>
        <rect x="-200" y="-100" width="720" height="400" fill="url(#pond)" />
        {/* far bank */}
        <path
          d="M-200 -100 H520 V24 q-60 8 -120 0 q-40 -4 -80 2 q-40 10 -80 4 q-50 -8 -90 6 q-60 12 -150 -2 q-60 -6 -120 2 q-40 4 -80 -4 Z"
          fill="#86c26e"
        />
        {[-150, -96, -40, 30, 70, 250, 292, 350, 410, 470].map((x, i) => (
          <circle key={x} cx={x} cy={10 + (i % 2) * 4} r={16 + (i % 2) * 5} fill="#5fa25a" />
        ))}
        {/* sparkles on the water */}
        {[60, 140, 230, 280, 180].map((x, i) => (
          <path key={x} d={`M${x} ${60 + i * 17} h14`} stroke="#fff" strokeOpacity="0.5" strokeWidth="2" strokeLinecap="round" className="job-glint" style={{ animationDelay: `${i * 0.4}s` }} />
        ))}
        {/* lily pads */}
        {[
          [52, 120, 13],
          [270, 64, 10],
          [290, 150, 12],
        ].map(([x, y, s], i) => (
          <g key={i}>
            <path d={`M${x} ${y} l${s} -3 a${s} ${s * 0.6} 0 1 1 -2 -6 z`} fill="#5fae5a" />
            {i === 0 && <circle cx={x - 3} cy={y - 5} r="4" fill="#f7b6cf" />}
          </g>
        ))}
        {/* reeds */}
        {[8, 16, 24, 300, 310].map((x, i) => (
          <g key={x}>
            <path d={`M${x} 200 q${(i % 2 ? 4 : -4)} -50 ${(i % 2 ? 2 : -2)} -86`} stroke="#5f8f45" strokeWidth="3" fill="none" />
            <rect x={x - 3 + (i % 2 ? 2 : -2)} y={112 + (i % 3) * 6} width="6" height="18" rx="3" fill="#8a5a36" />
          </g>
        ))}
        {ripples.current.map((rp) => (
          <ellipse
            key={rp.id}
            cx={rp.x}
            cy={rp.y + 4}
            rx={6 + rp.t * 26}
            ry={2 + rp.t * 7}
            fill="none"
            stroke="#fff"
            strokeWidth="1.6"
            opacity={Math.max(0, 0.8 - rp.t * 0.5)}
          />
        ))}
        {/* the dock */}
        <rect x="-200" y="170" width="390" height="130" fill="#b07a48" />
        {[-190, -152, -114, -76, -38, 0, 38, 76, 114, 152].map((x) => (
          <rect key={x} x={x + 1} y="170" width="36" height="30" fill="#c08a56" stroke="#8a5a32" strokeWidth="1" />
        ))}
        <rect x="186" y="164" width="9" height="36" rx="2" fill="#8a5a32" />
        {/* rod and line */}
        <path d={`M${TIP.x} ${TIP.y} Q${(TIP.x + bx) / 2} ${Math.max(TIP.y, by) + 18} ${bx} ${by - 6}`} stroke="#f4f4f4" strokeWidth="1.2" fill="none" opacity="0.9" />
        <path d={`M22 210 L${TIP.x} ${TIP.y}`} stroke="#7a4b2a" strokeWidth="5" strokeLinecap="round" className={phase === 'reel' ? 'job-rod-bend' : ''} />
        <circle cx="38" cy="186" r="7" fill="#c9a24e" stroke="#7a4b2a" strokeWidth="2" />
        {/* the float, red and white */}
        <g clipPath={phase !== 'ready' && phase !== 'cast' ? 'url(#above-water)' : undefined}>
          <g transform={`translate(${bx} ${by})`}>
            <circle cx="0" cy="-2" r="7" fill="#fff" />
            <path d="M-7 -2 a7 7 0 0 1 14 0 z" fill="#e8504a" />
            <rect x="-1" y="-14" width="2" height="6" fill="#e8504a" />
          </g>
        </g>
        {phase === 'bite' && (
          <g transform={`translate(${bx + 14} ${by - 30})`}>
            <g className="job-bang">
              <circle r="13" fill="#fff" stroke="#e8504a" strokeWidth="3" />
              <text y="6" textAnchor="middle" className="job-svg-bang">
                !
              </text>
            </g>
          </g>
        )}
        {phase === 'reel' && (
          <g className="job-reel">
            <rect x="18" y="138" width="284" height="54" rx="14" fill="#fff8ea" stroke="#e7d3b0" strokeWidth="3" />
            <rect x="34" y="148" width="252" height="8" rx="4" fill="#e7d3b0" />
            <rect x="34" y="148" width={(252 * clamp(r.progress, 0, 100)) / 100} height="8" rx="4" fill="#ff9a62" />
            <rect x="34" y="164" width="252" height="18" rx="9" fill="#d6e8ef" />
            <rect x={34 + (252 * r.zone) / 100} y="164" width={(252 * r.zoneW) / 100} height="18" rx="9" fill="#6fbf73" />
            <g transform={`translate(${34 + (252 * r.marker) / 100} 173)`}>
              <circle r="8" fill="#fff" stroke="#5a4434" strokeWidth="2" />
              <path d="M-8 0 a8 8 0 0 1 16 0 z" fill="#e8504a" />
            </g>
          </g>
        )}
      </svg>
      {phase === 'ready' && (
        <div className="job-tip">
          <span className="cosy-key">Space</span> to cast
        </div>
      )}
    </div>
  );
}
