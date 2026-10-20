import { memo, useRef, useState } from "react";
import {
  SettleRing,
  clamp,
  useFrame,
  useLater,
  useMain,
  type GameProps,
} from "./shared";
import { sfx } from "./sfx";

const RIM = 20;
const BOWL_TOP = 96;
const BOWL_BOTTOM = 132;
const LINE_Y = 104;
const CLOTH_Y = 158;
const levelY = (fill: number) =>
  BOWL_BOTTOM - (clamp(fill, 0, 100) / 100) * (BOWL_BOTTOM - LINE_Y);

export function ChaliceArt({
  size = 44,
  fill = 70,
}: {
  size?: number;
  fill?: number;
}) {
  const y = 30 - (clamp(fill, 0, 100) / 100) * 16;
  return (
    <svg viewBox="0 0 48 48" width={size} height={size} aria-hidden="true">
      <clipPath id="chalice-art-bowl">
        <path d="M10 12 q0 20 14 22 q14 -2 14 -22 z" />
      </clipPath>
      <path d="M10 12 q0 20 14 22 q14 -2 14 -22 z" fill="#e3b94f" />
      <rect
        x="8"
        y={y}
        width="32"
        height="30"
        fill="#8c1d2f"
        clipPath="url(#chalice-art-bowl)"
      />
      <path
        d="M10 12 q0 20 14 22 q14 -2 14 -22"
        fill="none"
        stroke="#b8891a"
        strokeWidth="1.5"
      />
      <rect x="22" y="33" width="4" height="8" fill="#e3b94f" />
      <ellipse
        cx="24"
        cy="42"
        rx="10"
        ry="3.5"
        fill="#e3b94f"
        stroke="#b8891a"
        strokeWidth="1"
      />
      <path
        d="M14 15 q0 10 6 14"
        stroke="#fff"
        strokeOpacity="0.5"
        strokeWidth="2"
        fill="none"
      />
    </svg>
  );
}

const Altar = memo(function Altar() {
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
      {[60, 260].map((wx) => (
        <g key={wx}>
          <path
            d={`M${wx - 18} 0 h36 v52 a18 18 0 0 1 -36 0 z`}
            fill="#2a2440"
          />
          <path
            d={`M${wx - 14} 0 h28 v50 a14 14 0 0 1 -28 0 z`}
            fill={wx < 160 ? "#d8433b" : "#3f85b8"}
            opacity="0.9"
          />
          <path
            d={`M${wx} 0 v64 M${wx - 14} 30 h28`}
            stroke="#2a2440"
            strokeWidth="2.5"
          />
        </g>
      ))}
      <circle cx="160" cy="120" r="110" fill="url(#wine-glow)" />
      {/* the altar */}
      <rect x="-200" y={CLOTH_Y - 8} width="720" height="60" fill="#fbf6ea" />
      <rect x="-200" y={CLOTH_Y - 8} width="720" height="4" fill="#e3b94f" />
      <rect
        x="-200"
        y={CLOTH_Y + 14}
        width="720"
        height="3"
        fill="#e3b94f"
        opacity="0.7"
      />
      <path d="M-200 190 h720 v30 h-720 z" fill="#6b4528" />
    </g>
  );
});

const Candles = memo(function Candles() {
  return (
    <g>
      {/* candles */}
      {[40, 280].map((wx) => (
        <g key={wx}>
          <rect
            x={wx - 6}
            y="106"
            width="12"
            height="46"
            rx="2"
            fill="#f6ecd8"
          />
          <ellipse
            cx={wx}
            cy="102"
            rx="4"
            ry="8"
            fill="#ffb347"
            className="job-flame"
          />
          <ellipse cx={wx} cy="103" rx="1.8" ry="4" fill="#fff0b0" />
          <ellipse cx={wx} cy={CLOTH_Y - 6} rx="12" ry="3.5" fill="#e3b94f" />
        </g>
      ))}
    </g>
  );
});

/** Pouring the wine at the altar: the chalice won't hold still, and the cloth is very white. */
export function Wine({
  finish,
  setHint,
}: GameProps<{ fill: number; stars: number }>) {
  const [, redraw] = useState(0);
  const [settling, setSettling] = useState(0);
  const [over, setOver] = useState(false);
  const time = useRef(0);
  const theta = useRef(0);
  const cx = useRef(160);
  const fill = useRef(0);
  const spill = useRef(0);
  const overflow = useRef(0);
  const pouring = useRef(false);
  const glug = useRef(0);
  const splashT = useRef(0);
  const drops = useRef<
    { id: number; x: number; y: number; vx: number; vy: number; t: number }[]
  >([]);
  const settle = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { later, cancel } = useLater();

  const evaluate = () => {
    setOver(true);
    setSettling(0);
    const f = Math.min(100, fill.current);
    const sp = spill.current;
    const result = clamp(Math.round(f - sp * 0.8), 0, 100);
    const stars = result >= 95 ? 3 : result >= 85 ? 2 : result >= 70 ? 1 : 0;
    let line: string;
    if (sp < 1 && f >= 99) line = "Filled to the line, not a drop spilt.";
    else if (sp < 1) line = `${Math.round(f)}% to the line, not a drop spilt.`;
    else
      line = `${Math.round(f)}% to the line, and ${Math.round(sp)}% on the cloth.`;
    finish(
      { fill: result, stars },
      {
        stars,
        title: sp > 30 ? "What a mess!" : undefined,
        line,
        art: <ChaliceArt size={64} fill={f} />,
      },
    );
  };

  const main = useMain({
    enabled: !over,
    onPress: () => {
      cancel(settle.current);
      settle.current = null;
      setSettling(0);
      pouring.current = true;
    },
    onRelease: () => {
      if (!pouring.current) return;
      pouring.current = false;
      if (fill.current + spill.current < 3) return;
      setHint("Pour again, or wait to serve.");
      setSettling((n) => n + 1);
      settle.current = later(evaluate, 2200);
    },
  });

  useFrame((dt) => {
    time.current += dt;
    const omega = 2.1 + 0.6 * Math.sin(time.current * 0.7);
    theta.current += omega * dt;
    cx.current = 160 + 70 * Math.sin(theta.current);
    if (pouring.current) {
      const under = Math.abs(cx.current - 160) <= RIM;
      if (under && fill.current < 100) {
        fill.current += 70 * dt;
        glug.current -= dt;
        if (glug.current <= 0) {
          sfx.gurgle();
          glug.current = 0.11;
        }
      } else {
        spill.current += 55 * dt;
        if (under) overflow.current = Math.min(1, overflow.current + dt * 2);
        splashT.current -= dt;
        if (splashT.current <= 0) {
          sfx.spill();
          splashT.current = 0.16;
          const y = under ? BOWL_TOP : CLOTH_Y;
          const x = under
            ? cx.current + (Math.random() < 0.5 ? -RIM : RIM)
            : 160;
          for (let i = 0; i < 3; i++)
            drops.current.push({
              id: Math.random(),
              x,
              y,
              vx: (Math.random() - 0.5) * 90,
              vy: -30 - Math.random() * 50,
              t: 0,
            });
        }
      }
    }
    for (const d of drops.current) {
      d.t += dt;
      d.x += d.vx * dt;
      d.y += d.vy * dt;
      d.vy += 300 * dt;
    }
    drops.current = drops.current.filter(
      (d) => d.t < 0.6 && d.y < CLOTH_Y + 30,
    );
    redraw((n) => (n + 1) % 1e6);
  }, !over);

  const x = cx.current;
  const under = Math.abs(x - 160) <= RIM;
  const lv = levelY(fill.current);
  const streamTo = pouring.current
    ? under && fill.current < 100
      ? lv
      : under
        ? BOWL_TOP
        : CLOTH_Y
    : 0;
  const stain = spill.current > 0 ? Math.min(70, 6 + spill.current * 1.5) : 0;
  const t = time.current;
  const lean = Math.sin(theta.current) * 4;

  return (
    <div className="job-scene job-church" {...main}>
      <svg
        viewBox="0 0 320 200"
        preserveAspectRatio="xMidYMid meet"
        className="job-svg"
      >
        <defs>
          <clipPath id="wine-bowl">
            <path d={`M${x - 22} ${BOWL_TOP} q0 34 22 36 q22 -2 22 -36 z`} />
          </clipPath>
          <radialGradient id="wine-glow">
            <stop offset="0" stopColor="#fff0c4" stopOpacity="0.5" />
            <stop offset="1" stopColor="#fff0c4" stopOpacity="0" />
          </radialGradient>
        </defs>
        <Altar />
        {stain > 0 && (
          <ellipse
            cx="160"
            cy={CLOTH_Y + 4}
            rx={stain}
            ry={stain * 0.28}
            fill="#8c1d2f"
            opacity="0.85"
          />
        )}
        <Candles />
        {/* the jug */}
        <g
          className={`job-jug ${pouring.current ? "on" : ""}`}
          style={{ transformOrigin: "160px 40px" }}
        >
          <path d="M138 22 h44 l-4 40 h-36 z" fill="#8a5a34" />
          <path d="M138 22 h44 v6 h-44 z" fill="#a06a3e" />
          <path
            d="M146 30 q-2 12 2 20"
            stroke="#c98a54"
            strokeWidth="3"
            fill="none"
            strokeOpacity="0.6"
          />
          <path
            d="M182 30 h12 a6 6 0 0 1 0 12 h-10"
            fill="none"
            stroke="#6b4528"
            strokeWidth="5"
          />
          <path d="M152 62 h16 l-4 6 h-8 z" fill="#6b4528" />
          <ellipse cx="160" cy="22" rx="22" ry="4" fill="#5a3a22" />
          <ellipse cx="160" cy="22" rx="17" ry="2.5" fill="#8c1d2f" />
        </g>
        {pouring.current && streamTo > 0 && (
          <path
            d={`M157 68 Q ${157 + Math.sin(t * 14) * 1.5} ${(68 + streamTo) / 2} 157 ${streamTo} h6 Q ${163 + Math.sin(t * 14 + 1) * 1.5} ${(68 + streamTo) / 2} 163 68 z`}
            fill="#8c1d2f"
            opacity="0.92"
          />
        )}
        {/* the chalice */}
        <g transform={`rotate(${lean} ${x} 150)`}>
          <ellipse
            cx={x}
            cy="152"
            rx="17"
            ry="5"
            fill="#e3b94f"
            stroke="#b8891a"
            strokeWidth="1.2"
          />
          <rect x={x - 3.5} y="128" width="7" height="24" fill="#e3b94f" />
          <path
            d={`M${x - 22} ${BOWL_TOP} q0 34 22 36 q22 -2 22 -36 z`}
            fill="#e3b94f"
          />
          <g clipPath="url(#wine-bowl)">
            <path
              d={`M${x - 24} ${BOWL_BOTTOM + 4} L${x - 24} ${lv} ${Array.from({ length: 6 }, (_, i) => `L${x - 24 + (i + 1) * 8} ${lv + Math.sin(i * 1.3 + t * (pouring.current ? 11 : 4)) * (pouring.current && under ? 2 : 0.8)}`).join(" ")} L${x + 24} ${lv} L${x + 24} ${BOWL_BOTTOM + 4} Z`}
              fill="#8c1d2f"
            />
            <ellipse
              cx={x}
              cy={lv}
              rx="22"
              ry="2.5"
              fill="#b03a4c"
              opacity={fill.current > 2 ? 0.8 : 0}
            />
          </g>
          <path
            d={`M${x - 22} ${BOWL_TOP} q0 34 22 36 q22 -2 22 -36`}
            fill="none"
            stroke="#b8891a"
            strokeWidth="1.5"
          />
          <ellipse
            cx={x}
            cy={BOWL_TOP}
            rx="22"
            ry="4"
            fill="#f2d070"
            stroke="#b8891a"
            strokeWidth="1.2"
          />
          <line
            x1={x - 20}
            y1={LINE_Y}
            x2={x + 20}
            y2={LINE_Y}
            stroke="#3f9a49"
            strokeWidth="2"
            strokeDasharray="4 3"
          />
          <path
            d={`M${x - 16} ${BOWL_TOP + 6} q0 14 6 20`}
            stroke="#fff"
            strokeOpacity="0.45"
            strokeWidth="2.5"
            fill="none"
          />
          {overflow.current > 0 && (
            <g fill="#8c1d2f" opacity={overflow.current}>
              <rect x={x - 22} y={BOWL_TOP} width="4" height={34} rx="2" />
              <rect x={x + 18} y={BOWL_TOP} width="4" height={26} rx="2" />
            </g>
          )}
        </g>
        <g transform={`translate(${x + 26} ${LINE_Y})`}>
          <path
            d="M0 0 l7 -6 h40 a4 4 0 0 1 4 4 v4 a4 4 0 0 1 -4 4 h-40 z"
            fill="#3f9a49"
          />
          <text
            x="26"
            y="3"
            textAnchor="middle"
            className="job-svg-label"
            fill="#fff"
            fontSize="9"
          >
            the line
          </text>
        </g>
        <g fill="#8c1d2f">
          {drops.current.map((d) => (
            <circle key={d.id} cx={d.x} cy={d.y} r="2.2" />
          ))}
        </g>
      </svg>
      {settling > 0 && <SettleRing key={settling} ms={2200} label="Serving…" />}
      {fill.current + spill.current === 0 && (
        <div className="job-tip">
          Hold <span className="cosy-key">Space</span> when the chalice is under
          the jug
        </div>
      )}
    </div>
  );
}
