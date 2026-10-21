import { memo, useRef, useState } from 'react';
import { useFrame, useLater, useMain, usePops, type GameProps } from './shared';
import { sfx } from './sfx';

const LOG = { x0: 92, x1: 228, y: 110, h: 30 };
const CENTRE = 160;
const PERIODS = [1.4, 1.15, 0.95, 0.8, 0.68];
const TOLERANCE = 9.5;

export function LogArt({ size = 44 }: { size?: number }) {
  return (
    <svg viewBox="0 0 48 48" width={size} height={size} aria-hidden="true">
      <rect x="6" y="16" width="30" height="18" rx="3" fill="#a06a3e" />
      <path d="M10 20 h20 M10 26 h22 M10 30 h16" stroke="#7a4a2a" strokeWidth="1.5" strokeLinecap="round" />
      <ellipse cx="36" cy="25" rx="6" ry="9" fill="#e8c48a" stroke="#7a4a2a" strokeWidth="1.5" />
      <ellipse cx="36" cy="25" rx="3" ry="4.5" fill="none" stroke="#b8894a" strokeWidth="1.2" />
      <path d="M28 8 l6 4 l-10 14 l-4 -3 z" fill="#8c96a2" />
      <path d="M22 24 l-10 16" stroke="#5a3a22" strokeWidth="3.5" strokeLinecap="round" />
    </svg>
  );
}

function LogShape({ x0, x1, clipId, offset }: { x0: number; x1: number; clipId: string; offset: number }) {
  return (
    <g transform={`translate(${offset} 0)`}>
      <clipPath id={clipId}>
        <rect x={x0} y={LOG.y - 6} width={x1 - x0} height={LOG.h + 12} />
      </clipPath>
      <g clipPath={`url(#${clipId})`}>
        <rect x={LOG.x0} y={LOG.y} width={LOG.x1 - LOG.x0} height={LOG.h} rx="6" fill="#a06a3e" />
        <path
          d={`M${LOG.x0 + 10} ${LOG.y + 7} h40 M${LOG.x0 + 60} ${LOG.y + 12} h50 M${LOG.x0 + 20} ${LOG.y + 20} h70`}
          stroke="#7a4a2a"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <ellipse cx={LOG.x1} cy={LOG.y + LOG.h / 2} rx="7" ry={LOG.h / 2} fill="#e8c48a" stroke="#7a4a2a" strokeWidth="1.5" />
        <ellipse cx={LOG.x1} cy={LOG.y + LOG.h / 2} rx="3.5" ry="7" fill="none" stroke="#b8894a" strokeWidth="1.2" />
        <ellipse cx={LOG.x0} cy={LOG.y + LOG.h / 2} rx="7" ry={LOG.h / 2} fill="#e8c48a" stroke="#7a4a2a" strokeWidth="1.5" />
      </g>
    </g>
  );
}

type State = 'sweep' | 'chop' | 'between' | 'done';

const Woodpile = memo(function Woodpile({ pile }: { pile: number }) {
  return (
    <g>
      {/* the woodpile */}
      {Array.from({ length: 6 + pile }, (_, i) => {
        const row = i < 4 ? 0 : i < 7 ? 1 : 2;
        const col = i < 4 ? i : i < 7 ? i - 4 : i - 7;
        const x = 252 + col * 16 + row * 8;
        const y = 160 - row * 14;
        return (
          <g key={i} className={i >= 6 ? 'job-pop-in' : ''}>
            <circle cx={x} cy={y} r="8" fill="#e8c48a" stroke="#7a4a2a" strokeWidth="1.5" />
            <circle cx={x} cy={y} r="4" fill="none" stroke="#b8894a" strokeWidth="1.2" />
          </g>
        );
      })}
    </g>
  );
});

const Yard = memo(function Yard() {
  return (
    <g>
      <rect x="-200" y="-100" width="720" height="400" fill="#efe3c8" />
      {[-200, -130, -60, 0, 70, 140, 210, 280, 350, 420, 490].map((x) => (
        <rect key={x} x={x} y="-100" width="10" height="250" fill="#6b4528" />
      ))}
      <rect x="-200" y="40" width="720" height="8" fill="#6b4528" />
      <rect x="-200" y="100" width="720" height="8" fill="#6b4528" />
      <rect x="150" y="54" width="60" height="44" rx="3" fill="#ffd98a" stroke="#6b4528" strokeWidth="4" />
      <line x1="180" y1="54" x2="180" y2="98" stroke="#6b4528" strokeWidth="3" />
      <line x1="150" y1="76" x2="210" y2="76" stroke="#6b4528" strokeWidth="3" />
      <rect x="-200" y="150" width="720" height="100" fill="#7fb35a" />
      <rect x="-200" y="150" width="720" height="6" fill="#9ccb6e" />
    </g>
  );
});

const Block = memo(function Block() {
  return (
    <g>
      {/* the block */}
      <rect x="118" y="146" width="84" height="40" fill="#8a5a34" />
      <path d="M118 150 h84 M118 164 h84" stroke="#6b4528" strokeWidth="1.5" />
      <ellipse cx="160" cy="146" rx="42" ry="9" fill="#c99a62" stroke="#7a4a2a" strokeWidth="1.5" />
    </g>
  );
});

/** Splitting logs by the tavern: the mark sweeps across, press when it's over the centre line. */
export function Firewood({ finish, setHint }: GameProps<{ logs: number; stars: number }>) {
  const [, redraw] = useState(0);
  const [over, setOver] = useState(false);
  const index = useRef(0);
  const time = useRef(0);
  const clean = useRef(0);
  const state = useRef<State>('sweep');
  const chopT = useRef(0);
  const hitX = useRef(CENTRE);
  const wasClean = useRef(false);
  const landed = useRef(false);
  const { pop, pops } = usePops();
  const { later } = useLater();

  const markerX = () => {
    const u = (time.current / PERIODS[Math.min(4, index.current)]) % 1;
    const w = u < 0.5 ? u * 2 : 2 - u * 2;
    return LOG.x0 + 8 + w * (LOG.x1 - LOG.x0 - 16);
  };

  const end = () => {
    const logs = clean.current;
    const stars = logs >= 5 ? 3 : logs >= 4 ? 2 : logs >= 3 ? 1 : 0;
    finish(
      { logs, stars },
      {
        stars,
        title: logs >= 5 ? 'Timber!' : undefined,
        line: logs === 1 ? '1 of 5 logs split clean.' : `${logs} of 5 logs split clean.`,
        art: <LogArt size={64} />,
      },
    );
  };

  const next = () => {
    index.current += 1;
    if (index.current >= 5) {
      setOver(true);
      state.current = 'done';
      setHint(`${clean.current} clean splits.`);
      later(end, 500);
      return;
    }
    state.current = 'sweep';
    time.current = 0;
    landed.current = false;
    setHint(`Log ${index.current + 1} of 5. ${clean.current} clean so far.`);
  };

  const main = useMain({
    enabled: !over,
    onPress: () => {
      if (state.current !== 'sweep') return;
      const x = markerX();
      hitX.current = x;
      wasClean.current = Math.abs(x - CENTRE) <= TOLERANCE;
      state.current = 'chop';
      chopT.current = 0;
      sfx.swing();
    },
  });

  useFrame((dt) => {
    if (state.current === 'sweep') time.current += dt;
    else if (state.current === 'chop') {
      chopT.current += dt;
      if (chopT.current >= 0.14 && !landed.current) {
        landed.current = true;
        sfx.axe();
        const err = Math.abs(hitX.current - CENTRE);
        if (wasClean.current) {
          clean.current += 1;
          sfx.crack();
          pop(err <= 4 ? 'Perfect split!' : 'Clean split!', 3);
        } else pop(err < 30 ? 'Glancing…' : 'Missed!', 0);
        state.current = 'between';
        later(next, 900);
      }
    }
    redraw((n) => (n + 1) % 1e6);
  }, !over);

  const s = state.current;
  const mx = s === 'sweep' ? markerX() : hitX.current;
  const raise = s === 'sweep' ? -36 : s === 'chop' ? -36 + 36 * Math.min(1, chopT.current / 0.14) : 0;
  const split = s === 'between' && wasClean.current;
  const miss = s === 'between' && !wasClean.current;
  const pile = clean.current;

  return (
    <div className="job-scene job-yard" {...main}>
      <svg viewBox="0 0 320 200" preserveAspectRatio="xMidYMid meet" className="job-svg">
        <Yard />
        <Woodpile pile={pile} />
        <Block />
        {/* the log */}
        {!split && (
          <g className={miss ? 'job-log-jump' : ''}>
            <LogShape x0={LOG.x0 - 10} x1={LOG.x1 + 10} clipId="log-whole" offset={0} />
          </g>
        )}
        {split && (
          <g>
            <g className="job-half-l">
              <LogShape x0={LOG.x0 - 10} x1={hitX.current} clipId="log-left" offset={0} />
              <rect x={hitX.current - 3} y={LOG.y + 2} width="3" height={LOG.h - 4} fill="#f0d6a0" />
            </g>
            <g className="job-half-r">
              <LogShape x0={hitX.current} x1={LOG.x1 + 10} clipId="log-right" offset={0} />
              <rect x={hitX.current} y={LOG.y + 2} width="3" height={LOG.h - 4} fill="#f0d6a0" />
            </g>
            {[0, 1, 2, 3].map((i) => (
              <rect
                key={i}
                className="job-chip"
                x={hitX.current - 2 + (i - 1.5) * 4}
                y={LOG.y + 4}
                width="4"
                height="3"
                fill="#e8c48a"
                style={{
                  ['--dx' as string]: `${(i - 1.5) * 22}px`,
                  animationDelay: `${i * 0.03}s`,
                }}
              />
            ))}
          </g>
        )}
        {miss && <rect className="job-chip" x={hitX.current} y={LOG.y} width="5" height="3" fill="#e8c48a" style={{ ['--dx' as string]: '28px' }} />}
        {/* the centre line and the mark */}
        {!over && <line x1={CENTRE} y1={LOG.y - 16} x2={CENTRE} y2={LOG.y + LOG.h + 6} stroke="#fff" strokeWidth="2" strokeDasharray="4 3" opacity="0.9" />}
        {!over && s === 'sweep' && (
          <g transform={`translate(${mx} ${LOG.y - 12})`}>
            <path d="M-7 -8 h14 l-7 9 z" fill={Math.abs(mx - CENTRE) <= TOLERANCE ? '#3f9a49' : '#e8504a'} stroke="#fff" strokeWidth="1.5" />
          </g>
        )}
        {/* the axe */}
        {!over && (
          <g transform={`translate(${mx} ${raise})`} className={s === 'chop' ? 'job-axe-swing' : ''}>
            <rect x="-4" y="8" width="8" height="100" rx="3" fill="#5a3a22" />
            <rect x="-4" y="60" width="8" height="4" fill="#c9a062" />
            <path d="M-4 90 l-20 -4 q-4 14 0 26 l20 -2 z" fill="#8c96a2" stroke="#5a6470" strokeWidth="1.2" />
            <path d="M-20 88 q-5 11 -1 22" stroke="#e6ebf0" strokeWidth="2" fill="none" />
          </g>
        )}
        <text x="18" y="178" className="job-svg-label" fill="#2f4a1e" fontSize="11">
          log {Math.min(5, index.current + 1)} of 5
        </text>
        <text x="18" y="192" className="job-svg-label" fill="#2f4a1e" fontSize="11">
          {clean.current} clean
        </text>
      </svg>
      {pops}
      {index.current === 0 && s === 'sweep' && (
        <div className="job-tip">
          <span className="cosy-key">Space</span> when the mark is on the line
        </div>
      )}
    </div>
  );
}
