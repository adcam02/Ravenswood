import { memo, useRef, useState } from "react";
import {
  clamp,
  useFrame,
  useLater,
  useMain,
  usePops,
  type GameProps,
} from "./shared";
import { sfx } from "./sfx";

const L = 70;
const W = 180;
const TOP = 96;
const BOTTOM = 140;
const pctOf = (x: number) => ((x - L) / W) * 100;
const xOf = (p: number) => L + (p / 100) * W;

export function BreadArt({
  size = 44,
  cut = true,
}: {
  size?: number;
  cut?: boolean;
}) {
  return (
    <svg viewBox="0 0 48 48" width={size} height={size} aria-hidden="true">
      <path d="M5 30 v-8 q0 -9 10 -9 h18 q10 0 10 9 v8 z" fill="#c98a4a" />
      <path d="M5 30 h38 v5 q0 4 -4 4 h-30 q-4 0 -4 -4 z" fill="#a86a32" />
      <path
        d="M12 16 l6 8 M20 14 l6 8 M28 14 l6 8"
        stroke="#e8c48a"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {cut && (
        <g>
          <rect x="22" y="13" width="3" height="26" fill="#f6e4b8" />
          <rect x="33" y="13" width="3" height="26" fill="#f6e4b8" />
        </g>
      )}
    </svg>
  );
}

function Loaf({ b0, b1, shift }: { b0: number; b1: number; shift: number }) {
  const x0 = xOf(b0);
  const x1 = xOf(b1);
  const id = `bread-${Math.round(b0)}-${Math.round(b1)}`;
  return (
    <g transform={`translate(${shift} 0)`}>
      <clipPath id={id}>
        <rect x={x0} y={TOP - 10} width={x1 - x0} height={BOTTOM - TOP + 16} />
      </clipPath>
      <g clipPath={`url(#${id})`}>
        <path
          d={`M${L} ${BOTTOM} v-26 q0 -18 22 -18 h${W - 44} q22 0 22 18 v26 z`}
          fill="#c98a4a"
        />
        <path
          d={`M${L} ${BOTTOM - 10} h${W} v6 q0 4 -4 4 h${-(W - 8)} q-4 0 -4 -4 z`}
          fill="#a86a32"
        />
        <path
          d={`M${L} ${BOTTOM - 26} q0 -18 22 -18 h${W - 44} q22 0 22 18`}
          fill="none"
          stroke="#e8b97a"
          strokeWidth="3"
          strokeOpacity="0.6"
        />
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <path
            key={i}
            d={`M${L + 28 + i * 24} ${TOP + 4} l10 10`}
            stroke="#f0cf96"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        ))}
      </g>
      {b0 > 0 && (
        <rect
          x={x0 - 1}
          y={TOP + 2}
          width="4"
          height={BOTTOM - TOP - 2}
          fill="#f6e4b8"
        />
      )}
      {b1 < 100 && (
        <rect
          x={x1 - 3}
          y={TOP + 2}
          width="4"
          height={BOTTOM - TOP - 2}
          fill="#f6e4b8"
        />
      )}
    </g>
  );
}

const Lectern = memo(function Lectern() {
  return (
    <g>
      <rect x="-200" y="-100" width="720" height="400" fill="#8b8597" />
      {[-3, -2, -1, 0, 1, 2, 3, 4, 5].map((row) => (
        <g key={row}>
          <line
            x1="-200"
            y1={row * 28}
            x2="520"
            y2={row * 28}
            stroke="#6f6980"
            strokeWidth="1.5"
          />
          {[-4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((c) => (
            <line
              key={c}
              x1={c * 50 + (row % 2) * 25}
              y1={row * 28}
              x2={c * 50 + (row % 2) * 25}
              y2={row * 28 + 28}
              stroke="#6f6980"
              strokeWidth="1.5"
            />
          ))}
        </g>
      ))}
      {/* the window */}
      <path d="M118 0 h84 v70 a42 42 0 0 1 -84 0 z" fill="#2a2440" />
      <path d="M124 0 h72 v68 a36 36 0 0 1 -72 0 z" fill="#f2b632" />
      <path
        d="M124 0 h36 v68 a36 36 0 0 1 -36 36 z"
        fill="#d8433b"
        opacity="0.85"
      />
      <path
        d="M160 0 h36 v68 a36 36 0 0 1 -36 36 z"
        fill="#3f85b8"
        opacity="0.85"
      />
      <circle cx="160" cy="40" r="14" fill="#ffe9a8" />
      <path
        d="M124 40 h72 M160 0 v104 M130 70 h60"
        stroke="#2a2440"
        strokeWidth="3"
      />
      <rect x="60" y="80" width="200" height="60" fill="url(#bread-glow)" />
      {/* the lectern */}
      <path d="M-200 150 h720 v60 h-720 z" fill="#4e3220" />
      <path d="M30 150 l260 0 l16 50 l-292 0 z" fill="#6b4528" />
      <rect x="26" y="146" width="268" height="10" rx="3" fill="#8a5a34" />
      <rect x="40" y="140" width="240" height="8" rx="2" fill="#d9c3a0" />
      <rect x="40" y="140" width="240" height="3" rx="1" fill="#f1e3c7" />
      {/* candles */}
      {[24, 296].map((x) => (
        <g key={x}>
          <rect
            x={x - 5}
            y="100"
            width="10"
            height="46"
            rx="2"
            fill="#f6ecd8"
          />
          <ellipse
            cx={x}
            cy="96"
            rx="3.5"
            ry="7"
            fill="#ffb347"
            className="job-flame"
          />
          <ellipse cx={x} cy="97" rx="1.6" ry="3.5" fill="#fff0b0" />
        </g>
      ))}
    </g>
  );
});

/** Breaking the bread at the lectern: one loaf in half, a second into thirds, with a knife that won't hold still. */
export function Bread({
  finish,
  setHint,
}: GameProps<{ evenness: number; stars: number }>) {
  const [, redraw] = useState(0);
  const [over, setOver] = useState(false);
  const round = useRef(1);
  const cuts = useRef<number[]>([]);
  const errs = useRef<number[]>([]);
  const sweep = useRef(0);
  const pause = useRef(0);
  const drop = useRef(0);
  const loafIn = useRef(0);
  const { pop, pops } = usePops();
  const { later } = useLater();

  const period = () =>
    round.current === 1 ? 1.7 : cuts.current.length === 0 ? 1.4 : 1.2;
  const knifeX = () => {
    const u = (sweep.current / period()) % 1;
    const w = u < 0.5 ? u * 2 : 2 - u * 2;
    return L - 14 + w * (W + 28);
  };
  const target = () =>
    round.current === 1
      ? 50
      : cuts.current.length === 0
        ? 100 / 3
        : (cuts.current[0] + 100) / 2;

  const end = () => {
    const mean =
      errs.current.reduce((n, e) => n + e, 0) /
      Math.max(1, errs.current.length);
    const evenness = clamp(Math.round(100 - mean), 0, 100);
    const stars =
      evenness >= 96 ? 3 : evenness >= 90 ? 2 : evenness >= 80 ? 1 : 0;
    finish(
      { evenness, stars },
      {
        stars,
        title: evenness >= 98 ? "Blessed hands!" : undefined,
        line:
          evenness >= 96
            ? `${evenness}% even. Nobody gets the small piece.`
            : `${evenness}% even over three cuts.`,
        art: <BreadArt size={64} />,
      },
    );
  };

  const main = useMain({
    enabled: !over,
    onPress: () => {
      if (over || pause.current > 0) return;
      const p = clamp(pctOf(knifeX()), 0, 100);
      const err = Math.abs(p - target());
      cuts.current.push(p);
      errs.current.push(err);
      drop.current = 1;
      sfx.slice();
      pop(
        err <= 1.5
          ? "Perfect!"
          : err <= 4
            ? "Lovely!"
            : err <= 10
              ? "Close"
              : "Wonky…",
        err <= 1.5 ? 3 : err <= 4 ? 2 : err <= 10 ? 1 : 0,
      );
      if (err <= 1.5) sfx.shimmer();
      pause.current = 1.2;
      if (round.current === 1) {
        setHint("Now a fresh loaf into thirds. First cut at a third…");
        later(() => {
          round.current = 2;
          cuts.current = [];
          loafIn.current = 1;
          sweep.current = 0;
        }, 1000);
      } else if (cuts.current.length === 1)
        setHint("Now cut what’s left down the middle.");
      else {
        setOver(true);
        setHint("Three cuts made.");
        later(end, 1100);
      }
    },
  });

  useFrame((dt) => {
    if (pause.current > 0) pause.current -= dt;
    else sweep.current += dt;
    drop.current = Math.max(0, drop.current - dt / 0.35);
    loafIn.current = Math.max(0, loafIn.current - dt / 0.4);
    redraw((n) => (n + 1) % 1e6);
  }, !over);

  const kx =
    pause.current > 0 && cuts.current.length
      ? xOf(cuts.current[cuts.current.length - 1])
      : knifeX();
  const ky = 50 * Math.sin(Math.PI * (1 - drop.current));
  const bounds = [0, ...[...cuts.current].sort((a, b) => a - b), 100];
  const slide = loafIn.current * loafIn.current * 160;
  const guide = xOf(target());

  return (
    <div className="job-scene job-church" {...main}>
      <svg
        viewBox="0 0 320 200"
        preserveAspectRatio="xMidYMid meet"
        className="job-svg"
      >
        <defs>
          <linearGradient id="bread-glow" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fff3c4" stopOpacity="0.5" />
            <stop offset="1" stopColor="#fff3c4" stopOpacity="0" />
          </linearGradient>
        </defs>
        <Lectern />
        {/* the loaf, in pieces */}
        <g transform={`translate(${slide} 0)`}>
          {bounds.slice(0, -1).map((b0, i) => (
            <Loaf
              key={`${round.current}-${i}-${bounds.length}`}
              b0={b0}
              b1={bounds[i + 1]}
              shift={i * 7}
            />
          ))}
          {!over && pause.current <= 0 && (
            <line
              x1={guide}
              y1={TOP - 6}
              x2={guide}
              y2={BOTTOM + 4}
              stroke="#fff"
              strokeOpacity="0.35"
              strokeWidth="1.5"
              strokeDasharray="3 4"
            />
          )}
          {cuts.current.length > 0 &&
            bounds.slice(0, -1).map((b0, i) => (
              <text
                key={i}
                x={(xOf(b0) + xOf(bounds[i + 1])) / 2 + i * 7}
                y={BOTTOM + 20}
                textAnchor="middle"
                className="job-svg-label"
                fill="#fff"
                fontSize="11"
              >
                {Math.round(bounds[i + 1] - b0)}%
              </text>
            ))}
        </g>
        {/* the knife */}
        <g transform={`translate(${kx} ${ky})`}>
          <path
            d="M-3 86 l0 -46 q0 -3 3 -3 q4 0 4 4 l0 45 q-1 8 -4 10 q-3 -2 -3 -10 z"
            fill="#d8dde3"
            stroke="#8c96a2"
            strokeWidth="1"
          />
          <rect x="-5" y="12" width="10" height="28" rx="3" fill="#5a3a22" />
          <rect x="-5" y="22" width="10" height="3" fill="#c9a062" />
        </g>
      </svg>
      {pops}
      {cuts.current.length === 0 && round.current === 1 && (
        <div className="job-tip">
          <span className="cosy-key">Space</span> when the knife is in the
          middle
        </div>
      )}
    </div>
  );
}
