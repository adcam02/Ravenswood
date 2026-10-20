import { useEffect, useRef, useState } from 'react';
import { game, useHud } from '../../game/hud';
import { useClient } from '../../net/client';

/**
 * Counting sheep, in bed at night. Sheep (and a few goats) run across and jump the fence; keep the count in your
 * head and say it at the end. Goats don't count, and a sheep that jumps back comes off the count. Right earns a
 * gold star to wear through the next day; it's meant to be hard, so one go a night.
 */

type Kind = 'sheep' | 'black' | 'goat';

interface Runner {
  kind: Kind;
  /** Left to right, or back the other way (which uncounts a sheep). */
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

function plan(seed: number): { runners: Runner[]; answer: number; length: number } {
  let s = seed >>> 0 || 1;
  const r = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
  const runners: Runner[] = [];
  const n = 18 + Math.floor(r() * 10);
  let t = 1.2;
  let answer = 0;
  const crossed: Runner[] = [];
  for (let i = 0; i < n; i++) {
    const roll = r();
    let kind: Kind = 'sheep';
    if (roll < 0.14) kind = 'goat';
    else if (roll < 0.26) kind = 'black';
    // Now and then a sheep that already crossed comes back over.
    const back = kind !== 'goat' && crossed.length > 0 && r() < 0.16;
    const speedUp = Math.min(1, i / n);
    const dur = (2.4 - speedUp * 1.0) * (0.8 + r() * 0.4);
    const runner: Runner = { kind, dir: back ? -1 : 1, at: t, dur, lane: Math.floor(r() * 3), bob: r() * Math.PI * 2 };
    runners.push(runner);
    if (kind !== 'goat') {
      answer += back ? -1 : 1;
      if (!back) crossed.push(runner);
      else crossed.pop();
    }
    // Sometimes two run close together, which is where people lose count.
    t += r() < 0.3 ? 0.35 + r() * 0.3 : 0.75 + r() * 0.9;
  }
  const length = t + 2.8;
  return { runners, answer: Math.max(0, answer), length };
}

function drawRunner(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, kind: Kind, dir: number, phase: number, airborne: boolean) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(dir * size, size);
  const wool = kind === 'black' ? '#3b3340' : kind === 'goat' ? '#b9b1a6' : '#f7f2ea';
  const face = kind === 'black' ? '#f7f2ea' : kind === 'goat' ? '#8d8378' : '#3b3340';
  const legSwing = airborne ? 0.6 : Math.sin(phase) * 0.9;
  ctx.strokeStyle = '#2a2230';
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  for (const [lx, k] of [
    [-12, 1],
    [-4, -1],
    [6, 1],
    [14, -1],
  ]) {
    ctx.beginPath();
    ctx.moveTo(lx, 6);
    ctx.lineTo(lx + legSwing * 5 * k, 20);
    ctx.stroke();
  }
  ctx.fillStyle = wool;
  if (kind === 'goat') {
    ctx.beginPath();
    ctx.ellipse(0, 0, 24, 13, 0, 0, Math.PI * 2);
    ctx.fill();
  } else {
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
  }
  // Head out the front.
  ctx.fillStyle = face;
  ctx.beginPath();
  ctx.ellipse(24, -6, 9, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = wool;
  ctx.beginPath();
  ctx.ellipse(20, -12, 5, 3, -0.4, 0, Math.PI * 2);
  ctx.fill();
  if (kind === 'goat') {
    ctx.strokeStyle = '#5a4a3a';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(24, -12);
    ctx.quadraticCurveTo(20, -24, 14, -22);
    ctx.moveTo(27, -12);
    ctx.quadraticCurveTo(26, -24, 20, -26);
    ctx.stroke();
    ctx.fillStyle = '#5a4a3a';
    ctx.beginPath();
    ctx.ellipse(26, 3, 3, 5, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = kind === 'black' ? '#2a2230' : '#ffffff';
  ctx.beginPath();
  ctx.arc(27, -8, 2.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export function SheepGame() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [stage, setStage] = useState<'rules' | 'run' | 'guess' | 'done'>('rules');
  const [guess, setGuess] = useState('');
  const [result, setResult] = useState<{ right: boolean; answer: number } | null>(null);
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
    setResult({ right, answer: planRef.current.answer });
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
            <li>Count every sheep that jumps the fence, white or black.</li>
            <li>
              <b>Goats don’t count.</b> They’re grey, with horns and a beard.
            </li>
            <li>If a sheep jumps back over the other way, take it off the count again.</li>
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
          <p>How many sheep jumped the fence?</p>
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
          <strong>{result.right ? 'Spot on!' : `It was ${result.answer}.`}</strong>
          <span>{result.right ? 'A gold star for you in the morning.' : 'Sleep tight. Try again tomorrow night.'}</span>
          <button className="cosy-btn primary" onClick={sleepNow} autoFocus>
            Back to sleep
          </button>
        </div>
      )}
    </div>
  );
}
