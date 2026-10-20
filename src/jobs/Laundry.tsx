import { useMemo, useRef, useState } from 'react';
import type { ClothKind } from '../world/types';
import { isLeft, isMain, isRight, pickOne, useKeys, useLater, type GameProps } from './shared';
import { sfx } from './sfx';

export const CLOTH_COLORS = ['#e8675a', '#f39ab5', '#6fb0e0', '#7cc28b', '#f2c14e', '#b494dd', '#ff9a62', '#5fc7c0'];
const KINDS: ClothKind[] = ['shirt', 'sock', 'dress', 'towel', 'pants'];
const NAMES: Record<ClothKind, string> = { shirt: 'shirt', sock: 'sock', dress: 'dress', towel: 'towel', pants: 'pair of trousers' };

// Garments are drawn in a 240 × 160 box. Each has spots where mud can land.
const SHAPES: Record<ClothKind, { d: string; spots: [number, number][]; trim?: string }> = {
  shirt: {
    d: 'M78 34 L104 24 Q120 36 136 24 L162 34 L190 62 L170 78 L160 68 L160 138 L80 138 L80 68 L70 78 L50 62 Z',
    trim: 'M104 24 Q120 36 136 24',
    spots: [[100, 56], [140, 56], [96, 92], [120, 80], [144, 96], [104, 120], [136, 122], [66, 60], [176, 62], [120, 110]],
  },
  sock: {
    d: 'M92 26 L136 26 L136 92 Q136 108 152 110 L188 114 Q206 118 204 134 Q202 148 184 148 L120 148 Q92 148 92 122 Z',
    trim: 'M92 34 L136 34',
    spots: [[104, 50], [124, 50], [114, 76], [104, 104], [126, 112], [150, 128], [176, 132], [116, 132], [192, 132]],
  },
  dress: {
    d: 'M100 22 L110 22 L114 40 L126 40 L130 22 L140 22 L146 60 L180 144 L60 144 L94 60 Z',
    trim: 'M94 60 L146 60',
    spots: [[120, 50], [110, 80], [132, 82], [100, 110], [120, 104], [142, 112], [86, 132], [154, 132], [120, 132]],
  },
  towel: {
    d: 'M60 30 Q60 24 66 24 L174 24 Q180 24 180 30 L180 136 Q180 142 174 142 L66 142 Q60 142 60 136 Z',
    trim: 'M60 44 L180 44 M60 122 L180 122',
    spots: [[84, 60], [120, 58], [156, 62], [92, 88], [128, 84], [160, 100], [84, 108], [120, 110], [150, 76]],
  },
  pants: {
    d: 'M80 26 L160 26 L170 144 L134 144 L120 72 L106 144 L70 144 Z',
    trim: 'M80 36 L160 36',
    spots: [[100, 48], [140, 48], [120, 52], [94, 82], [146, 84], [90, 116], [150, 118], [88, 136], [152, 136]],
  },
};

interface Mud {
  x: number;
  y: number;
  r: number;
  dirt: number;
  blobs: [number, number, number][];
}

interface Bubble {
  id: number;
  x: number;
  y: number;
  r: number;
}

const toSvg = (svg: SVGSVGElement, e: { clientX: number; clientY: number }) => {
  const box = svg.getBoundingClientRect();
  // The scene keeps its shape inside the box ("meet"), so work out the scale and the margins.
  const s = Math.min(box.width / 240, box.height / 160);
  const ox = (box.width - 240 * s) / 2;
  const oy = (box.height - 160 * s) / 2;
  return { x: (e.clientX - box.left - ox) / s, y: (e.clientY - box.top - oy) / s };
};

let bubbleId = 0;

export function Laundry({ finish, setHint }: GameProps<{ kind: ClothKind; color: string; stars: number }>) {
  const garment = useMemo(() => {
    const kind = pickOne(KINDS);
    const color = pickOne(CLOTH_COLORS);
    const spots = [...SHAPES[kind].spots].sort(() => Math.random() - 0.5).slice(0, 5 + Math.floor(Math.random() * 3));
    const mud: Mud[] = spots.map(([x, y]) => ({
      x,
      y,
      r: 9 + Math.random() * 4,
      dirt: 1,
      blobs: Array.from({ length: 3 }, () => [(Math.random() - 0.5) * 12, (Math.random() - 0.5) * 10, 4 + Math.random() * 4] as [number, number, number]),
    }));
    return { kind, color, mud };
  }, []);
  const [, redraw] = useState(0);
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [clean, setClean] = useState(false);
  const [hung, setHung] = useState(false);
  const started = useRef(0);
  const took = useRef(0);
  const lastKey = useRef<'l' | 'r' | null>(null);
  const lastPt = useRef<{ x: number; y: number } | null>(null);
  const lastSound = useRef(0);
  const svgRef = useRef<SVGSVGElement>(null);
  const { later } = useLater();

  const bubble = (x: number, y: number) => {
    const b = { id: ++bubbleId, x: x + (Math.random() - 0.5) * 14, y: y + (Math.random() - 0.5) * 10, r: 3 + Math.random() * 5 };
    setBubbles((list) => [...list.slice(-24), b]);
    later(() => setBubbles((list) => list.filter((o) => o.id !== b.id)), 900);
  };

  const scrubbed = (m: Mud, amount: number, x: number, y: number) => {
    if (clean || m.dirt <= 0) return;
    if (!started.current) started.current = performance.now();
    m.dirt = Math.max(0, m.dirt - amount);
    const now = performance.now();
    if (now - lastSound.current > 90) {
      lastSound.current = now;
      if (Math.random() < 0.5) sfx.scrub();
      else sfx.pop();
      bubble(x, y);
    }
    if (m.dirt === 0) {
      sfx.pop();
      for (let i = 0; i < 3; i++) bubble(m.x, m.y);
    }
    if (garment.mud.every((o) => o.dirt === 0)) {
      took.current = (performance.now() - started.current) / 1000;
      setClean(true);
      sfx.ding();
      setHint('Squeaky clean! Hang it out to dry.');
    }
    redraw((n) => n + 1);
  };

  const hangOut = () => {
    if (!clean || hung) return;
    setHung(true);
    sfx.swish();
    const s = took.current;
    const stars = s <= 7 ? 3 : s <= 12 ? 2 : 1;
    later(
      () =>
        finish(
          { kind: garment.kind, color: garment.color, stars },
          {
            stars,
            line: `A fresh ${NAMES[garment.kind]}, washed in ${s.toFixed(1)}s.`,
            art: <ClothArt kind={garment.kind} color={garment.color} size={72} />,
          },
        ),
      500,
    );
  };

  const next = garment.mud.find((m) => m.dirt > 0) ?? null;

  useKeys((e, down) => {
    if (isLeft(e) || isRight(e)) {
      if (down && !e.repeat && next) {
        const side = isLeft(e) ? 'l' : 'r';
        if (side !== lastKey.current) scrubbed(next, 0.13, next.x, next.y);
        lastKey.current = side;
      }
      return true;
    }
    if (isMain(e)) {
      if (down && !e.repeat) hangOut();
      return true;
    }
    return false;
  });

  const onMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!svgRef.current || !(e.buttons & 1)) {
      lastPt.current = null;
      return;
    }
    const p = toSvg(svgRef.current, e);
    const prev = lastPt.current;
    lastPt.current = p;
    if (!prev) return;
    const moved = Math.hypot(p.x - prev.x, p.y - prev.y);
    for (const m of garment.mud) {
      if (Math.hypot(p.x - m.x, p.y - m.y) < m.r + 10) scrubbed(m, moved / 120, p.x, p.y);
    }
  };

  const shape = SHAPES[garment.kind];

  return (
    <div className="job-scene job-wash">
      <svg
        ref={svgRef}
        viewBox="0 0 240 160"
        preserveAspectRatio="xMidYMid meet"
        className={`job-svg job-scrub ${clean ? 'is-clean' : ''} ${hung ? 'is-hung' : ''}`}
        onPointerDown={(e) => {
          if (!svgRef.current) return;
          e.currentTarget.setPointerCapture?.(e.pointerId);
          lastPt.current = toSvg(svgRef.current, e);
        }}
        onPointerMove={onMove}
        onPointerUp={() => (lastPt.current = null)}
      >
        <defs>
          <radialGradient id="wash-water" cx="0.5" cy="0.45">
            <stop offset="0" stopColor="#bfe6f2" />
            <stop offset="1" stopColor="#8ccbe0" />
          </radialGradient>
        </defs>
        <rect x="-200" y="-100" width="640" height="220" fill="#cfe7c6" />
        <rect x="-200" y="120" width="640" height="140" fill="#b7d8a8" />
        {[-150, -90, -30, 270, 330, 390].map((x, i) => (
          <g key={x} opacity="0.9">
            <circle cx={x} cy={128 - (i % 2) * 6} r="16" fill="#9fcf8c" />
            <circle cx={x + 18} cy={132} r="11" fill="#a9d796" />
          </g>
        ))}
        {/* the tub */}
        <ellipse cx="120" cy="88" rx="118" ry="74" fill="#9a6337" />
        <ellipse cx="120" cy="86" rx="108" ry="66" fill="url(#wash-water)" />
        {[-70, -24, 24, 70].map((dx) => (
          <path key={dx} d={`M${120 + dx} 14 q${dx * 0.05} 74 0 146`} stroke="#7d4c26" strokeWidth="2" opacity="0.3" fill="none" />
        ))}
        <ellipse cx="120" cy="86" rx="108" ry="66" fill="none" stroke="#c48a55" strokeWidth="4" />
        <g className="job-garment">
          <path d={shape.d} fill={garment.color} stroke="rgba(0,0,0,0.18)" strokeWidth="2" strokeLinejoin="round" />
          {shape.trim && <path d={shape.trim} stroke="#fff" strokeOpacity="0.6" strokeWidth="4" fill="none" strokeLinecap="round" />}
          {garment.mud.map((m, i) => (
            <g key={i} opacity={m.dirt} className="job-mud">
              <circle cx={m.x} cy={m.y} r={m.r} fill="#7a5233" />
              {m.blobs.map(([dx, dy, r], j) => (
                <circle key={j} cx={m.x + dx} cy={m.y + dy} r={r} fill="#6a4529" />
              ))}
            </g>
          ))}
          {next && !clean && (
            <circle className="job-target" cx={next.x} cy={next.y} r={next.r + 7} fill="none" stroke="#fff" strokeWidth="2.5" strokeDasharray="4 4" />
          )}
        </g>
        {bubbles.map((b) => (
          <g key={b.id} className="job-bubble" style={{ transformOrigin: `${b.x}px ${b.y}px` }}>
            <circle cx={b.x} cy={b.y} r={b.r} fill="#fff" fillOpacity="0.55" stroke="#fff" strokeWidth="1.2" />
            <circle cx={b.x - b.r * 0.35} cy={b.y - b.r * 0.35} r={b.r * 0.25} fill="#fff" />
          </g>
        ))}
        {clean &&
          [
            [60, 40],
            [184, 52],
            [70, 124],
            [176, 118],
            [120, 22],
          ].map(([x, y], i) => (
            <path key={i} className="job-sparkle" style={{ animationDelay: `${i * 0.12}s`, transformOrigin: `${x}px ${y}px` }} d={`M${x} ${y - 8} L${x + 2} ${y - 2} L${x + 8} ${y} L${x + 2} ${y + 2} L${x} ${y + 8} L${x - 2} ${y + 2} L${x - 8} ${y} L${x - 2} ${y - 2} Z`} fill="#fff" />
          ))}
      </svg>
      {!clean && (
        <div className="job-tip">
          Drag to scrub, or tap <span className="cosy-key">A</span> <span className="cosy-key">D</span> in turn
        </div>
      )}
      {clean && (
        <div className="job-action">
          <button className="cosy-btn primary big" onClick={hangOut} disabled={hung}>
            Hang it out! <span className="cosy-key">Space</span>
          </button>
        </div>
      )}
    </div>
  );
}

export function ClothArt({ kind, color, size = 48 }: { kind: ClothKind; color: string; size?: number }) {
  const shape = SHAPES[kind];
  return (
    <svg viewBox="40 14 170 140" width={size} height={size} aria-hidden="true">
      <path d={shape.d} fill={color} stroke="rgba(0,0,0,0.2)" strokeWidth="3" strokeLinejoin="round" />
      {shape.trim && <path d={shape.trim} stroke="#fff" strokeOpacity="0.6" strokeWidth="5" fill="none" strokeLinecap="round" />}
    </svg>
  );
}
