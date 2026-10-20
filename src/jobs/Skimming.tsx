import { memo, useRef, useState } from "react";
import {
  RippleRings,
  clamp,
  stepRipples,
  useFrame,
  useLater,
  useMain,
  type GameProps,
  type Ripple,
} from "./shared";
import { sfx } from "./sfx";

const HAND = { x: 36, y: 150 };
const contact = (k: number) => {
  const x = HAND.x + (70 * (1 - 0.76 ** k)) / 0.24;
  return { x, y: HAND.y - (x - HAND.x) * 0.36 };
};

export function StoneArt({ size = 44 }: { size?: number }) {
  return (
    <svg viewBox="0 0 48 48" width={size} height={size} aria-hidden="true">
      <ellipse
        cx="24"
        cy="34"
        rx="18"
        ry="5"
        fill="none"
        stroke="#7fcbe0"
        strokeWidth="2"
      />
      <ellipse
        cx="24"
        cy="34"
        rx="9"
        ry="2.6"
        fill="none"
        stroke="#7fcbe0"
        strokeWidth="2"
      />
      <ellipse
        cx="24"
        cy="22"
        rx="12"
        ry="7"
        fill="#8a9099"
        stroke="#5a6470"
        strokeWidth="1.5"
        transform="rotate(-14 24 22)"
      />
      <path
        d="M16 20 q6 -5 12 -2"
        stroke="#fff"
        strokeOpacity="0.5"
        strokeWidth="2"
        fill="none"
      />
    </svg>
  );
}

type Stage = "angle" | "power" | "fly" | "done";

interface Flight {
  from: { x: number; y: number };
  to: { x: number; y: number };
  k: number;
  u: number;
  bounces: number;
  count: number;
  sunk: boolean;
}

const FarBank = memo(function FarBank() {
  return (
    <g>
      <rect x="-200" y="-100" width="720" height="156" fill="#bfe3ef" />
      {[-180, -120, -60, 20, 80, 150, 220, 290, 350, 410, 470].map((x, i) => (
        <g key={x}>
          <rect x={x - 3} y={34} width="6" height="22" fill="#6b4528" />
          <circle
            cx={x}
            cy={26 + (i % 2) * 4}
            r={16 + (i % 3) * 3}
            fill="#5f9a46"
          />
          <circle cx={x + 6} cy={20 + (i % 2) * 4} r={10} fill="#79b35a" />
        </g>
      ))}
      <rect x="-200" y="52" width="720" height="100" fill="url(#skim-pond)" />
      <path
        d="M-200 52 h720 v6 q-80 6 -160 2 q-80 -4 -160 2 q-80 6 -160 2 q-80 -4 -160 2 q-60 4 -80 0 z"
        fill="#79b35a"
      />
      <g
        className="job-glint"
        stroke="#fff"
        strokeOpacity="0.35"
        strokeWidth="2"
        strokeLinecap="round"
      >
        <line x1="200" y1="80" x2="222" y2="80" />
        <line x1="120" y1="110" x2="136" y2="110" />
        <line x1="250" y1="120" x2="270" y2="120" />
      </g>
    </g>
  );
});

const NearBank = memo(function NearBank() {
  return (
    <g>
      <path
        d="M-200 150 q60 -10 120 0 q50 6 80 0 q60 -10 120 0 q80 10 200 -4 q60 -4 120 2 q50 6 80 0 v70 h-720 z"
        fill="#7fb35a"
      />
      <path
        d="M0 158 q60 -8 120 2 q80 8 200 -2 v6 q-120 10 -200 2 q-60 -8 -120 0 z"
        fill="#c9a062"
        opacity="0.6"
      />
      <ellipse cx="22" cy="172" rx="14" ry="6" fill="#8a9099" />
      <ellipse cx="44" cy="178" rx="10" ry="4.5" fill="#7a8089" />
    </g>
  );
});

/** Skimming stones off the bank: pick an angle, then the power, then watch it go. */
export function Skimming({
  finish,
  setHint,
}: GameProps<{ bounces: number; stars: number }>) {
  const [stage, setStageState] = useState<Stage>("angle");
  const stageRef = useRef<Stage>("angle");
  const [, redraw] = useState(0);
  const time = useRef(0);
  const angle = useRef(30);
  const power = useRef(0);
  const flight = useRef<Flight | null>(null);
  const ripples = useRef<Ripple[]>([]);
  const tooHard = useRef(false);
  const { later } = useLater();

  const setStage = (s: Stage) => {
    stageRef.current = s;
    setStageState(s);
  };
  const angleAt = (t: number) =>
    32.5 + 27.5 * Math.cos((t * Math.PI * 2) / 1.7);
  const powerAt = (t: number) =>
    50 + 50 * Math.sin((t * Math.PI * 2) / 1.4 - Math.PI / 2);

  const end = () => {
    const f = flight.current;
    const bounces = f?.bounces ?? 0;
    const stars = bounces >= 7 ? 3 : bounces >= 5 ? 2 : bounces >= 3 ? 1 : 0;
    let line =
      bounces === 1
        ? "1 skip across the pond."
        : `${bounces} skips across the pond.`;
    if (tooHard.current) line = "Plunk! Too hard, it sank straight away.";
    else if (bounces === 0) line = "Plunk. Straight to the bottom.";
    else if (bounces >= 8) line = "8 skips, all the way to the far bank!";
    finish(
      { bounces, stars },
      {
        stars,
        title: bounces >= 8 ? "All the way across!" : undefined,
        line,
        art: <StoneArt size={64} />,
      },
    );
  };

  const throwStone = () => {
    const a = angle.current;
    const p = power.current;
    let bounces: number;
    tooHard.current = p > 88;
    if (tooHard.current) bounces = 0;
    else {
      const angleScore = clamp(1 - Math.abs(a - 15) / 40, 0, 1);
      const b =
        (p / 100) * 8.6 * angleScore * (0.85 + Math.random() * 0.35) +
        Math.random() * 0.8;
      bounces = clamp(Math.round(b), 0, 8);
      if (a > 45) bounces = Math.min(bounces, 1);
    }
    flight.current = {
      from: HAND,
      to: contact(1),
      k: 1,
      u: 0,
      bounces,
      count: 0,
      sunk: false,
    };
    setStage("fly");
    sfx.swish();
    setHint("Skip, skip, skip…");
  };

  const main = useMain({
    enabled: stage === "angle" || stage === "power",
    onPress: () => {
      const s = stageRef.current;
      if (s === "angle") {
        angle.current = angleAt(time.current);
        sfx.lock();
        setStage("power");
        time.current = 0;
        setHint(
          `${Math.round(angle.current)}°. Now the power: press to lock it.`,
        );
      } else if (s === "power") {
        power.current = powerAt(time.current);
        sfx.lock();
        throwStone();
      }
    },
  });

  useFrame(
    (dt) => {
      time.current += dt;
      ripples.current = stepRipples(ripples.current, dt);
      const f = flight.current;
      if (f && !f.sunk) {
        const dur = 0.42 * 0.86 ** (f.k - 1);
        f.u += dt / dur;
        if (f.u >= 1) {
          const at = f.to;
          if (f.k <= f.bounces) {
            f.count = f.k;
            sfx.skip(f.k);
            ripples.current.push({
              id: Math.random(),
              x: at.x,
              y: at.y,
              t: 0,
              big: 0.7 * 0.9 ** f.k,
            });
            f.k += 1;
            f.u = 0;
            f.from = at;
            f.to = contact(f.k);
          } else {
            f.sunk = true;
            sfx.sink();
            ripples.current.push({
              id: Math.random(),
              x: at.x,
              y: at.y,
              t: 0,
              big: tooHard.current ? 1.6 : 1,
            });
            ripples.current.push({
              id: Math.random(),
              x: at.x,
              y: at.y,
              t: -0.25,
              big: tooHard.current ? 1.3 : 0.8,
            });
            setStage("done");
            setHint(f.count === 1 ? "1 skip." : `${f.count} skips.`);
            later(end, 900);
          }
        }
      }
      redraw((n) => (n + 1) % 1e6);
    },
    stage !== "done" || ripples.current.length > 0,
  );

  const t = time.current;
  const a = stage === "angle" ? angleAt(t) : angle.current;
  const p =
    stage === "power" ? powerAt(t) : stage === "angle" ? 0 : power.current;
  const f = flight.current;
  let stone = { x: HAND.x, y: HAND.y - 6 };
  if (f) {
    const h = 26 * 0.78 ** (f.k - 1) * (0.6 + power.current / 200);
    stone = f.sunk
      ? { x: f.to.x, y: f.to.y + 8 }
      : {
          x: f.from.x + (f.to.x - f.from.x) * f.u,
          y: f.from.y + (f.to.y - f.from.y) * f.u - Math.sin(f.u * Math.PI) * h,
        };
  }
  const stoneScale = f ? 1 - (f.to.x - HAND.x) / 600 : 1;

  return (
    <div className="job-scene job-pond" {...main}>
      <svg
        viewBox="0 0 320 200"
        preserveAspectRatio="xMidYMid meet"
        className="job-svg"
      >
        <defs>
          <linearGradient
            id="skim-pond"
            x1="0"
            y1="52"
            x2="0"
            y2="152"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0" stopColor="#8ad2e6" />
            <stop offset="1" stopColor="#3a8fa8" />
          </linearGradient>
        </defs>
        <FarBank />
        <RippleRings list={ripples.current} />
        <NearBank />
        {/* the stone */}
        {!(f && f.sunk) && (
          <g
            transform={`translate(${stone.x} ${stone.y}) scale(${stoneScale}) rotate(${f ? f.u * 200 + f.k * 90 : 0})`}
          >
            <ellipse
              rx="9"
              ry="5"
              fill="#8a9099"
              stroke="#5a6470"
              strokeWidth="1.2"
            />
            <path
              d="M-5 -2 q4 -3 8 -1"
              stroke="#fff"
              strokeOpacity="0.5"
              strokeWidth="1.5"
              fill="none"
            />
          </g>
        )}
        {/* the angle */}
        {stage === "angle" && (
          <g>
            <path
              d={`M${HAND.x} ${HAND.y} L${HAND.x + 46 * Math.cos(0.1)} ${HAND.y - 46 * Math.sin(0.1)}`}
              stroke="#fff"
              strokeOpacity="0.3"
              strokeWidth="2"
              strokeDasharray="3 4"
            />
            <path
              d={`M${HAND.x} ${HAND.y} L${HAND.x + 46 * Math.cos(1.05)} ${HAND.y - 46 * Math.sin(1.05)}`}
              stroke="#fff"
              strokeOpacity="0.3"
              strokeWidth="2"
              strokeDasharray="3 4"
            />
            <path
              d={`M${HAND.x + 30 * Math.cos(0.1)} ${HAND.y - 30 * Math.sin(0.1)} A30 30 0 0 0 ${HAND.x + 30 * Math.cos(0.45)} ${HAND.y - 30 * Math.sin(0.45)}`}
              fill="none"
              stroke="#3f9a49"
              strokeWidth="5"
              strokeOpacity="0.8"
            />
            <g transform={`translate(${HAND.x} ${HAND.y}) rotate(${-a})`}>
              <line
                x1="0"
                y1="0"
                x2="58"
                y2="0"
                stroke="#fff"
                strokeWidth="4"
                strokeLinecap="round"
              />
              <path d="M58 0 l-10 -7 v14 z" fill="#fff" />
            </g>
            <text
              x={HAND.x + 70}
              y={HAND.y - 30}
              className="job-svg-label"
              fill="#fff"
              fontSize="13"
            >
              {Math.round(a)}°
            </text>
            <text
              x={HAND.x + 70}
              y={HAND.y - 16}
              className="job-svg-label"
              fill="#eaf6ff"
              fontSize="9"
            >
              low and flat is best
            </text>
          </g>
        )}
        {/* the power */}
        {stage === "power" && (
          <g>
            <g transform={`translate(${HAND.x} ${HAND.y}) rotate(${-a})`}>
              <line
                x1="0"
                y1="0"
                x2="40"
                y2="0"
                stroke="#fff"
                strokeOpacity="0.5"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray="4 4"
              />
            </g>
            <rect
              x="262"
              y="64"
              width="18"
              height="90"
              rx="6"
              fill="#10303a"
              opacity="0.7"
            />
            <rect x="265" y="67" width="12" height="84" rx="4" fill="#20404a" />
            <rect
              x="265"
              y="67"
              width="12"
              height={84 * 0.12}
              rx="2"
              fill="#e8504a"
              opacity="0.85"
            />
            <rect
              x="265"
              y={151 - (84 * p) / 100}
              width="12"
              height={(84 * p) / 100}
              rx="4"
              fill={p > 88 ? "#e8504a" : p > 55 ? "#5bbf6a" : "#f2c14e"}
            />
            <text
              x="271"
              y="166"
              textAnchor="middle"
              className="job-svg-label"
              fill="#fff"
              fontSize="10"
            >
              power
            </text>
            <text
              x="254"
              y="78"
              textAnchor="end"
              className="job-svg-label"
              fill="#ffd0d0"
              fontSize="8"
            >
              too hard
            </text>
          </g>
        )}
        {f && (
          <text
            x="160"
            y="186"
            textAnchor="middle"
            className="job-svg-label"
            fill="#1f3d12"
            fontSize="14"
            fontWeight="700"
          >
            {f.count === 0 ? "" : f.count === 1 ? "1 skip" : `${f.count} skips`}
          </text>
        )}
      </svg>
      {stage === "angle" && (
        <div className="job-tip">
          <span className="cosy-key">Space</span> to lock the angle
        </div>
      )}
      {stage === "power" && (
        <div className="job-tip">
          <span className="cosy-key">Space</span> to lock the power
        </div>
      )}
    </div>
  );
}
