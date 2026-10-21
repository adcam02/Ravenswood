import { useEffect, useRef, useState } from 'react';
import { game, useHud } from '../../game/hud';
import { useClient } from '../../net/client';

/**
 * Counting sheep, in bed at night. White sheep run across and jump the fence, from the left or from the right; every
 * jump is one more, whichever way it goes. Goats and wolves come over too, and don't count. Keep the count in your
 * head and say it at the end. Right earns a gold star to wear through the next day; one go a night.
 */

type Kind = 'sheep' | 'goat' | 'wolf';

interface Runner {
  kind: Kind;
  /** Left to right, or right to left. */
  dir: 1 | -1;
  /** When it starts, in seconds, and how long the crossing takes. */
  at: number;
  dur: number;
  /** Which lane (depth), 0 front to 2 back. */
  lane: number;
  bob: number;
}

const W = 640;
const H = 300;
const FENCE_X = W / 2;

/** The least room between two runners, as a share of the field's width. */
const SEP = 0.34;

interface Plan {
  runners: Runner[];
  answer: number;
  length: number;
  /** For showing the working afterwards. */
  fromLeft: number;
  fromRight: number;
  goats: number;
  wolves: number;
}

/**
 * One night's runners. They come in little bunches going one way; the field clears before anyone comes the other
 * way, and everyone on the field moves at the same speed and keeps well apart, so every runner is always fully in
 * view: nothing overtakes, nothing passes another, nothing hides. The speed creeps up through the run.
 */
function plan(seed: number): Plan {
  let s = seed >>> 0 || 1;
  const r = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
  const runners: Runner[] = [];
  const n = 18 + Math.floor(r() * 8);
  const tally = { fromLeft: 0, fromRight: 0, goats: 0, wolves: 0 };
  let dir: 1 | -1 = r() < 0.5 ? 1 : -1;
  let bunch = 0;
  let t = 1.2;
  // When the field is clear of everyone so far.
  let clearAt = 0;
  for (let i = 0; i < n; i++) {
    // A new bunch of one to four, more often than not the other way.
    if (bunch === 0) {
      if (runners.length && r() < 0.6) dir = dir === 1 ? -1 : 1;
      bunch = 1 + Math.floor(r() * 4);
    }
    bunch -= 1;
    // The crossing time shortens through the run: from 2.6 s down to 1.6 s.
    const dur = 2.6 - Math.min(1, i / n) * 1.0;
    const roll = r();
    const kind: Kind = roll < 0.13 ? 'goat' : roll < 0.23 ? 'wolf' : 'sheep';
    const prev = runners[runners.length - 1];
    let at = t;
    if (prev && prev.dir === dir) {
      // A third of the screen behind the one ahead as it comes on (at least, usually more) ...
      const gap = r() < 0.3 ? 0.36 + r() * 0.1 : 0.6 + r() * 0.7;
      at = Math.max(at, prev.at + gap * prev.dur);
      // ... and, being a little faster, still a third behind when the one ahead leaves the screen.
      at = Math.max(at, prev.at + prev.dur - (1 - SEP) * dur);
    } else if (prev) {
      // The other way: only once the field is clear.
      at = Math.max(at, clearAt + 0.4);
    }
    runners.push({ kind, dir, at, dur, lane: Math.floor(r() * 3), bob: r() * Math.PI * 2 });
    if (kind === 'goat') tally.goats += 1;
    else if (kind === 'wolf') tally.wolves += 1;
    else if (dir === 1) tally.fromLeft += 1;
    else tally.fromRight += 1;
    clearAt = Math.max(clearAt, at + dur);
    t = at;
  }
  return { runners, answer: tally.fromLeft + tally.fromRight, length: clearAt + 1.2, ...tally };
}

/** Legs, trotting or tucked up over the fence. */
function legs(ctx: CanvasRenderingContext2D, xs: number[], phase: number, airborne: boolean, colour: string) {
  const swing = airborne ? 0.6 : Math.sin(phase) * 0.9;
  ctx.strokeStyle = colour;
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  xs.forEach((lx, i) => {
    const k = i % 2 ? -1 : 1;
    ctx.beginPath();
    ctx.moveTo(lx, 6);
    ctx.lineTo(lx + swing * 5 * k, 20);
    ctx.stroke();
  });
}

function drawRunner(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, kind: Kind, dir: number, phase: number, airborne: boolean) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(dir * size, size);
  if (kind === 'sheep') {
    // A round white woolly cloud with a dark face.
    legs(ctx, [-12, -4, 6, 14], phase, airborne, '#2a2230');
    ctx.fillStyle = '#f7f2ea';
    for (const [bx, by, br] of [
      [-16, 0, 11],
      [-6, -6, 12],
      [6, -5, 12],
      [16, 1, 11],
      [0, 4, 13],
    ]) {
      ctx.beginPath();
      ctx.arc(bx, by, br, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = '#3b3340';
    ctx.beginPath();
    ctx.ellipse(24, -6, 9, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f7f2ea';
    ctx.beginPath();
    ctx.ellipse(20, -12, 5, 3, -0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(27, -8, 2.2, 0, Math.PI * 2);
    ctx.fill();
  } else if (kind === 'goat') {
    // Tan and lanky, with curly horns, a beard and a little tail up.
    legs(ctx, [-14, -6, 8, 16], phase, airborne, '#4a3424');
    ctx.fillStyle = '#c08d55';
    ctx.beginPath();
    ctx.ellipse(0, 0, 24, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-22, -4);
    ctx.lineTo(-30, -14);
    ctx.lineTo(-24, -2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(27, -9, 8, 9, 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#5a3f28';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(25, -16);
    ctx.quadraticCurveTo(18, -32, 8, -26);
    ctx.moveTo(29, -16);
    ctx.quadraticCurveTo(26, -34, 16, -32);
    ctx.stroke();
    ctx.fillStyle = '#efe6d6';
    ctx.beginPath();
    ctx.moveTo(28, -2);
    ctx.lineTo(34, 10);
    ctx.lineTo(25, 1);
    ctx.fill();
    ctx.fillStyle = '#2a2230';
    ctx.beginPath();
    ctx.arc(30, -11, 2, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // Grey and low, with pointed ears, a long snout, a bushy tail and yellow eyes.
    legs(ctx, [-14, -6, 8, 16], phase, airborne, '#3c3f48');
    ctx.fillStyle = '#7d828f';
    ctx.beginPath();
    ctx.moveTo(-24, 0);
    ctx.quadraticCurveTo(-46, -4, -50, -16);
    ctx.quadraticCurveTo(-36, -8, -22, -8);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(0, 0, 25, 11, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#5e626d';
    ctx.beginPath();
    ctx.ellipse(-2, -6, 20, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#7d828f';
    ctx.beginPath();
    ctx.ellipse(26, -8, 10, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(30, -10);
    ctx.lineTo(46, -4);
    ctx.lineTo(30, -2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(19, -12);
    ctx.lineTo(21, -28);
    ctx.lineTo(27, -14);
    ctx.moveTo(26, -14);
    ctx.lineTo(31, -29);
    ctx.lineTo(34, -12);
    ctx.fill();
    ctx.fillStyle = '#2a2230';
    ctx.beginPath();
    ctx.arc(46, -4, 2.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f2c94c';
    ctx.beginPath();
    ctx.arc(30, -10, 2.4, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

/** "7 from the left and 5 from the right. The 2 goats and 1 wolf didn't count." */
function working(p: Plan): string {
  const sides = `${p.fromLeft} from the left and ${p.fromRight} from the right`;
  const others = [p.goats && `${p.goats} ${p.goats === 1 ? 'goat' : 'goats'}`, p.wolves && `${p.wolves} ${p.wolves === 1 ? 'wolf' : 'wolves'}`].filter(Boolean);
  const not = others.length ? ` The ${others.join(' and ')} didn’t count.` : '';
  return `${sides}.${not}`;
}

export function SheepGame() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [stage, setStage] = useState<'rules' | 'run' | 'guess' | 'done'>('rules');
  const [guess, setGuess] = useState('');
  const [result, setResult] = useState<{ right: boolean; answer: number; guess: number } | null>(null);
  const planRef = useRef(plan(Date.now()));
  // The Storyteller is talking to them (a wake is open): the sheep wait, and keys are left alone.
  const awake = useClient((s) => Boolean(s.priv?.wake));
  const startRef = useRef(0);
  const pausedAtRef = useRef<number | null>(null);
  // For the headless tests: the answer, when the page runs with ?debug.
  if (location.search.includes('debug')) (window as unknown as { __sheepAnswer: number }).__sheepAnswer = planRef.current.answer;

  useEffect(() => {
    if (stage !== 'run') return;
    const el = canvas.current;
    if (!el) return;
    const ctx = el.getContext('2d');
    if (!ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    el.width = W * dpr;
    el.height = H * dpr;
    const { runners, length } = planRef.current;
    if (awake) {
      // Hold the clock while they're being woken; the sheep pick up where they left off.
      pausedAtRef.current ??= performance.now();
      return;
    }
    if (pausedAtRef.current !== null) {
      startRef.current += performance.now() - pausedAtRef.current;
      pausedAtRef.current = null;
    }
    const start = startRef.current;
    let raf = 0;
    const draw = () => {
      const t = (performance.now() - start) / 1000;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      // Night sky, a moon, a dark hill and the fence.
      const sky = ctx.createLinearGradient(0, 0, 0, H);
      sky.addColorStop(0, '#121833');
      sky.addColorStop(1, '#2b3566');
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#f8efc4';
      ctx.beginPath();
      ctx.arc(W - 80, 52, 26, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#121833';
      ctx.beginPath();
      ctx.arc(W - 68, 44, 22, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      for (let i = 0; i < 26; i++) {
        const sx = ((i * 97) % W) + 4;
        const sy = ((i * 53) % 120) + 8;
        const tw = 0.6 + 0.4 * Math.sin(t * 3 + i);
        ctx.globalAlpha = tw;
        ctx.fillRect(sx, sy, 2, 2);
      }
      ctx.globalAlpha = 1;
      ctx.fillStyle = '#2f4a3a';
      ctx.beginPath();
      ctx.moveTo(0, 190);
      ctx.quadraticCurveTo(W / 2, 140, W, 200);
      ctx.lineTo(W, H);
      ctx.lineTo(0, H);
      ctx.fill();
      ctx.fillStyle = '#3f6a4a';
      ctx.fillRect(0, 230, W, H - 230);
      // Fence.
      ctx.fillStyle = '#8a5a36';
      for (const fx of [-18, 18]) ctx.fillRect(FENCE_X + fx - 4, 170, 8, 72);
      ctx.fillRect(FENCE_X - 30, 186, 60, 8);
      ctx.fillRect(FENCE_X - 30, 212, 60, 8);
      // Runners, back lanes first.
      const active = runners.filter((rn) => t >= rn.at && t <= rn.at + rn.dur).sort((a, b) => b.lane - a.lane);
      for (const rn of active) {
        const k = (t - rn.at) / rn.dur;
        const dirK = rn.dir === 1 ? k : 1 - k;
        const x = -60 + dirK * (W + 120);
        const laneY = 236 - rn.lane * 14;
        const size = 1 - rn.lane * 0.14;
        // The hop: an arc centred on the fence.
        const dx = (x - FENCE_X) / 90;
        const hop = Math.max(0, 1 - dx * dx) * 70;
        const airborne = hop > 2;
        const y = laneY - hop - (airborne ? 0 : Math.abs(Math.sin(t * 14 + rn.bob)) * 3);
        drawRunner(ctx, x, y, size, rn.kind, rn.dir, t * 14 + rn.bob, airborne);
      }
      // A little bar of how long is left.
      ctx.fillStyle = 'rgba(255,255,255,0.18)';
      ctx.fillRect(16, H - 12, W - 32, 5);
      ctx.fillStyle = '#f6c445';
      ctx.fillRect(16, H - 12, (W - 32) * Math.min(1, t / length), 5);
      if (t < length) raf = requestAnimationFrame(draw);
      else setStage('guess');
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [stage, awake]);

  useEffect(() => {
    if (stage !== 'guess' || awake) return;
    const down = (e: KeyboardEvent) => {
      if (/^[0-9]$/.test(e.key)) setGuess((g) => (g.length < 2 ? g + e.key : g));
      else if (e.key === 'Backspace') setGuess((g) => g.slice(0, -1));
      else if (e.key === 'Enter') answer();
      else return;
      e.preventDefault();
      e.stopPropagation();
    };
    window.addEventListener('keydown', down, true);
    return () => window.removeEventListener('keydown', down, true);
  });

  const answer = () => {
    if (guess === '') return;
    const right = Number(guess) === planRef.current.answer;
    setResult({ right, answer: planRef.current.answer, guess: Number(guess) });
    setStage('done');
    game.sheepDone(right);
  };
  const sleepNow = () => useHud.setState({ sheep: 'done' });

  // The result lingers a while, then they nod off.
  useEffect(() => {
    if (stage !== 'done') return;
    const t = setTimeout(sleepNow, 9000);
    return () => clearTimeout(t);
  }, [stage]);

  return (
    <div className="sheep-game cosy-panel" role="dialog" aria-label="Counting sheep">
      <div className="sheep-head">
        <span className="sheep-icon">🐑</span>
        <div>
          <strong>Counting sheep</strong>
          <span>One go a night. Get it right and you wear a gold star tomorrow.</span>
        </div>
      </div>
      {stage === 'rules' && (
        <div className="sheep-rules">
          <ol>
            <li>
              Count every <b>white sheep</b> that jumps the fence, from the left or from the right: each jump is one more.
            </li>
            <li>
              <b>Goats and wolves don’t count.</b> Goats are brown with horns and a beard; wolves are grey with pointy ears.
            </li>
          </ol>
          <p>They come in bunches and speed up. No pausing, no second go.</p>
          <button
            className="cosy-btn primary"
            onClick={() => {
              startRef.current = performance.now();
              pausedAtRef.current = null;
              setStage('run');
            }}
            autoFocus
          >
            Start counting
          </button>
        </div>
      )}
      {stage === 'run' && (
        <div className="sheep-stage">
          <canvas ref={canvas} className="sheep-canvas" style={{ width: W, height: H }} />
          {awake && <div className="sheep-paused">Paused while the Storyteller talks to you</div>}
        </div>
      )}
      {stage === 'guess' && awake && <div className="sheep-paused inline">Paused while the Storyteller talks to you</div>}
      {stage === 'guess' && (
        <div className="sheep-guess">
          <p>How many white sheep jumped the fence?</p>
          <div className="sheep-number">{guess || '–'}</div>
          <div className="sheep-pad">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', '⌫', '0', 'OK'].map((k) => (
              <button
                key={k}
                className={`cosy-btn ${k === 'OK' ? 'primary' : ''}`}
                onClick={() => {
                  if (k === 'OK') answer();
                  else if (k === '⌫') setGuess((g) => g.slice(0, -1));
                  else setGuess((g) => (g.length < 2 ? g + k : g));
                }}
              >
                {k}
              </button>
            ))}
          </div>
        </div>
      )}
      {stage === 'done' && result && (
        <div className={`sheep-result ${result.right ? 'is-right' : ''}`}>
          <span className="sheep-big">{result.right ? '⭐' : '💤'}</span>
          <strong>{result.right ? `Spot on: ${result.answer}!` : `You said ${result.guess}; it was ${result.answer}.`}</strong>
          <span className="sheep-working">{working(planRef.current)}</span>
          <span>{result.right ? 'A gold star for you in the morning.' : 'Sleep tight. Try again tomorrow night.'}</span>
          <button className="cosy-btn primary" onClick={sleepNow} autoFocus>
            Back to sleep
          </button>
        </div>
      )}
    </div>
  );
}
