import { useUI } from '../state/ui';

let ctx: AudioContext | null = null;

function audio(): AudioContext | null {
  if (useUI.getState().muted) return null;
  try {
    ctx ??= new AudioContext();
    if (ctx.state === 'suspended') void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

/** Browsers only allow sound after the page has been clicked, so wake the audio on the first click. */
export function primeAudio() {
  const once = () => {
    try {
      ctx ??= new AudioContext();
      void ctx.resume();
    } catch {
      /* no audio on this device */
    }
    window.removeEventListener('pointerdown', once);
  };
  window.addEventListener('pointerdown', once);
}

// Partials of a church bell: hum, prime, tierce, quint, nominal and a few above.
const BELL = [
  [0.5, 0.55],
  [1, 1],
  [1.19, 0.55],
  [1.5, 0.35],
  [2, 0.45],
  [2.51, 0.22],
  [2.66, 0.18],
  [3.01, 0.12],
  [4.07, 0.08],
];

export function bell(freq = 196, duration = 5, volume = 0.18, delay = 0) {
  const c = audio();
  if (!c) return;
  const t = c.currentTime + delay;
  const out = c.createGain();
  out.gain.value = volume;
  out.connect(c.destination);
  BELL.forEach(([ratio, amp], i) => {
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq * ratio * (1 + (Math.random() - 0.5) * 0.002);
    const d = duration * (1 - i * 0.08);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(amp, t + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    osc.connect(g).connect(out);
    osc.start(t);
    osc.stop(t + d + 0.05);
  });
}

export function nightfall() {
  bell(130.8, 6, 0.2);
  bell(130.8, 6, 0.14, 1.6);
}

export function dawn() {
  bell(392, 3, 0.1);
  bell(493.9, 3, 0.09, 0.22);
  bell(587.3, 3.5, 0.09, 0.44);
}

export function wakeChime() {
  bell(659.3, 2.2, 0.08);
  bell(880, 2.4, 0.07, 0.16);
  bell(1318.5, 2.6, 0.05, 0.32);
}

export function tick() {
  const c = audio();
  if (!c) return;
  const t = c.currentTime;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(1900, t);
  osc.frequency.exponentialRampToValueAtTime(700, t + 0.05);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.25, t + 0.003);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.08);
  osc.connect(g).connect(c.destination);
  osc.start(t);
  osc.stop(t + 0.1);
}

export function countBeat(final = false) {
  bell(final ? 523.3 : 261.6, final ? 2.5 : 1.2, 0.1);
}

export function gavel() {
  bell(98, 3.5, 0.22);
}

/** A drumroll that quickens, for the gallows. */
export function drumroll(seconds = 2.6) {
  const c = audio();
  if (!c) return;
  const t0 = c.currentTime;
  let t = 0;
  let gap = 0.16;
  while (t < seconds) {
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(110, t0 + t);
    osc.frequency.exponentialRampToValueAtTime(55, t0 + t + 0.08);
    g.gain.setValueAtTime(0.0001, t0 + t);
    g.gain.exponentialRampToValueAtTime(0.16, t0 + t + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + t + 0.12);
    osc.connect(g).connect(c.destination);
    osc.start(t0 + t);
    osc.stop(t0 + t + 0.14);
    t += gap;
    gap = Math.max(0.05, gap * 0.93);
  }
}

/** A quick round on six bells, to call everyone to the town square. */
export function townBells() {
  const notes = [659.3, 587.3, 523.3, 493.9, 440, 392];
  for (let round = 0; round < 2; round++) {
    notes.forEach((f, i) => bell(f, 2.6, 0.075, round * 1.9 + i * 0.27));
  }
}

/** A short brass fanfare and then the bells, for the end of the game: bright and major for good, dark for evil. */
export function fanfare(good: boolean) {
  const c = audio();
  if (!c) return;
  const t0 = c.currentTime + 0.05;
  // Semitones above the root, then the beat it starts on and how many beats it lasts.
  const tune: [number, number, number][] = good
    ? [
        [0, 0, 0.5],
        [4, 0.5, 0.5],
        [7, 1, 0.5],
        [12, 1.5, 1.5],
        [7, 3, 0.5],
        [12, 3.5, 3],
      ]
    : [
        [0, 0, 0.75],
        [3, 0.75, 0.75],
        [7, 1.5, 0.75],
        [6, 2.25, 0.75],
        [3, 3, 0.5],
        [0, 3.5, 3],
      ];
  const root = good ? 261.6 : 196;
  const beat = good ? 0.2 : 0.28;
  const out = c.createGain();
  out.gain.value = 0.09;
  const soft = c.createBiquadFilter();
  soft.type = 'lowpass';
  soft.frequency.value = good ? 2600 : 1500;
  soft.connect(out).connect(c.destination);
  // A brassy reed, an octave of shine and a little body underneath.
  const voices: [number, OscillatorType, number][] = [
    [1, 'sawtooth', 0.5],
    [2, 'triangle', 0.22],
    [0.5, 'triangle', 0.35],
  ];
  for (const [semi, start, len] of tune) {
    const f = root * 2 ** (semi / 12);
    const s = t0 + start * beat;
    const e = s + len * beat;
    for (const [mul, type, amp] of voices) {
      const osc = c.createOscillator();
      const g = c.createGain();
      osc.type = type;
      osc.frequency.value = f * mul;
      g.gain.setValueAtTime(0.0001, s);
      g.gain.exponentialRampToValueAtTime(amp, s + 0.03);
      g.gain.setValueAtTime(amp * 0.8, e - 0.04);
      g.gain.exponentialRampToValueAtTime(0.0001, e + 0.3);
      osc.connect(g).connect(soft);
      osc.start(s);
      osc.stop(e + 0.35);
    }
  }
  const after = (tune[tune.length - 1][1] + 1.5) * beat;
  const peal = good ? [784, 659.3, 587.3, 523.3, 392] : [261.6, 233.1, 196, 174.6, 130.8];
  for (let round = 0; round < 3; round++) peal.forEach((f, i) => bell(f, 3, 0.07, after + round * 1.6 + i * 0.3));
}
