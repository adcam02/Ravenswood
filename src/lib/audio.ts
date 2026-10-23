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

/** The shop-door chime when someone comes in: a soft "ding-dong", high then low. */
export function doorChime(volume = 1) {
  const c = audio();
  if (!c) return;
  const t0 = c.currentTime;
  const out = c.createGain();
  out.gain.value = 0.16 * volume;
  out.connect(c.destination);
  // Each strike: the note, a quiet octave and twelfth over it, ringing away over a second or two.
  const strike = (freq: number, at: number) => {
    for (const [ratio, amp, len] of [
      [1, 1, 1.9],
      [2, 0.22, 0.9],
      [3, 0.07, 0.5],
    ]) {
      const osc = c.createOscillator();
      const g = c.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq * ratio;
      g.gain.setValueAtTime(0.0001, t0 + at);
      g.gain.exponentialRampToValueAtTime(amp, t0 + at + 0.006);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + at + len);
      osc.connect(g).connect(out);
      osc.start(t0 + at);
      osc.stop(t0 + at + len + 0.05);
    }
  };
  strike(659.3, 0);
  strike(523.3, 0.42);
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

/** A burst of filtered noise, for whooshes and the like. */
function noise(c: AudioContext, seconds: number): AudioBufferSourceNode {
  const buf = c.createBuffer(1, Math.ceil(c.sampleRate * seconds), c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  const src = c.createBufferSource();
  src.buffer = buf;
  return src;
}

/** A rope snapping: a sharp crack, then the slither of it falling and a soft thump on the boards. */
export function ropeSnap() {
  const c = audio();
  if (!c) return;
  const t = c.currentTime;
  const out = c.createGain();
  out.connect(c.destination);
  [
    [0, 0.06, 2600, 0.3],
    [0.05, 0.35, 900, 0.06],
    [0.38, 0.12, 180, 0.12],
  ].forEach(([at, len, freq, vol]) => {
    const src = noise(c, len);
    const f = c.createBiquadFilter();
    f.type = 'bandpass';
    f.frequency.value = freq;
    f.Q.value = 0.9;
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, t + at);
    g.gain.exponentialRampToValueAtTime(vol, t + at + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t + at + len);
    src.connect(f).connect(g).connect(out);
    src.start(t + at);
  });
}

/**
 * The night visit's sounds: a door creaking open, a rush of cloak, the moment itself, a gasp, and a puff; and the
 * newer ways' own (a bonk and a boing, a music box and a pop, thunder, ravens, a snuffing, a lever and a long drop).
 */
export function visitSound(name: string) {
  const c = audio();
  if (!c) return;
  const t = c.currentTime;
  const out = c.createGain();
  out.connect(c.destination);
  if (name === 'creak') {
    // A wobbling, scraping squeak that bends down.
    const osc = c.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(420, t);
    osc.frequency.linearRampToValueAtTime(260, t + 0.9);
    const wob = c.createOscillator();
    const depth = c.createGain();
    wob.frequency.value = 23;
    depth.gain.value = 40;
    wob.connect(depth).connect(osc.frequency);
    const band = c.createBiquadFilter();
    band.type = 'bandpass';
    band.frequency.value = 900;
    band.Q.value = 4;
    out.gain.setValueAtTime(0.0001, t);
    out.gain.exponentialRampToValueAtTime(0.06, t + 0.08);
    out.gain.exponentialRampToValueAtTime(0.0001, t + 1.0);
    osc.connect(band).connect(out);
    osc.start(t);
    wob.start(t);
    osc.stop(t + 1.05);
    wob.stop(t + 1.05);
  } else if (name === 'whoosh' || name === 'vanish') {
    const src = noise(c, 1.2);
    const f = c.createBiquadFilter();
    f.type = 'bandpass';
    f.Q.value = 1.2;
    f.frequency.setValueAtTime(name === 'vanish' ? 1800 : 300, t);
    f.frequency.exponentialRampToValueAtTime(name === 'vanish' ? 200 : 1400, t + 0.9);
    out.gain.setValueAtTime(0.0001, t);
    out.gain.exponentialRampToValueAtTime(0.12, t + 0.25);
    out.gain.exponentialRampToValueAtTime(0.0001, t + 1.1);
    src.connect(f).connect(out);
    src.start(t);
  } else if (name === 'strike') {
    // A low thump with a sting on top.
    const osc = c.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(160, t);
    osc.frequency.exponentialRampToValueAtTime(40, t + 0.4);
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.4, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
    osc.connect(g).connect(out);
    osc.start(t);
    osc.stop(t + 0.55);
    for (const [freq, delay] of [
      [622, 0],
      [659, 0.02],
    ]) {
      const s = c.createOscillator();
      const sg = c.createGain();
      s.type = 'triangle';
      s.frequency.value = freq;
      sg.gain.setValueAtTime(0.0001, t + delay);
      sg.gain.exponentialRampToValueAtTime(0.07, t + delay + 0.01);
      sg.gain.exponentialRampToValueAtTime(0.0001, t + delay + 1.4);
      s.connect(sg).connect(out);
      s.start(t + delay);
      s.stop(t + delay + 1.45);
    }
  } else if (name === 'gasp') {
    const src = noise(c, 0.6);
    const f = c.createBiquadFilter();
    f.type = 'bandpass';
    f.frequency.setValueAtTime(1200, t);
    f.frequency.linearRampToValueAtTime(700, t + 0.45);
    f.Q.value = 3;
    out.gain.setValueAtTime(0.0001, t);
    out.gain.exponentialRampToValueAtTime(0.09, t + 0.05);
    out.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
    src.connect(f).connect(out);
    src.start(t);
  } else if (name === 'windup') {
    // A slide whistle going up, wavering.
    tone(c, out, t, 0.75, 300, 1500, 0.05, 'sine', 7, 18, 0.7);
  } else if (name === 'bonk') {
    // A hollow wooden BONK: a knock, a deep thump under it, and a clack on top.
    tone(c, out, t, 0.14, 560, 190, 0.3, 'sine');
    tone(c, out, t, 0.3, 240, 70, 0.3, 'triangle');
    rush(c, out, t, 0.04, 2200, 1200, 0.25);
  } else if (name === 'boing') {
    // A spring: bwoing.
    tone(c, out, t, 0.55, 150, 460, 0.12, 'sine', 24, 60);
  } else if (name === 'tweet') {
    // Little birds going round: quick chirps, up and down.
    for (let i = 0; i < 7; i++) tone(c, out, t + i * 0.14, 0.07, i % 2 ? 2900 : 2300, i % 2 ? 3500 : 3100, 0.035, 'sine');
  } else if (name === 'crank') {
    // A music box, wound: a little tune that stops short, with the ratchet ticking under it.
    const tune = [659.3, 784, 880, 784, 659.3, 523.3, 587.3, 659.3];
    tune.forEach((f, i) => {
      const at = t + i * 0.11;
      tone(c, out, at, 0.45, f * 2, f * 2, 0.045, 'sine');
      tone(c, out, at, 0.25, f * 4, f * 4, 0.012, 'sine');
      rush(c, out, at, 0.015, 5000, 4000, 0.02, 'highpass');
    });
  } else if (name === 'pop') {
    // POP, and the spring boinging out.
    rush(c, out, t, 0.05, 1800, 900, 0.3, 'highpass');
    tone(c, out, t, 0.09, 900, 300, 0.15, 'sine');
    tone(c, out, t + 0.03, 0.6, 220, 560, 0.1, 'sine', 20, 70);
  } else if (name === 'eek') {
    // A frightened squeak.
    tone(c, out, t, 0.2, 700, 1700, 0.05, 'sine', 30, 40, 0.6);
    tone(c, out, t + 0.18, 0.15, 1700, 1300, 0.04, 'sine');
  } else if (name === 'cackle') {
    // The jester laughing: hee-hee-hee, falling away.
    for (let i = 0; i < 5; i++) {
      const at = t + i * 0.15;
      const f = c.createBiquadFilter();
      f.type = 'bandpass';
      f.frequency.value = 1500;
      f.Q.value = 2;
      f.connect(out);
      tone(c, f, at, 0.1, 900 - i * 60, 760 - i * 60, 0.08, 'square');
    }
  } else if (name === 'spell') {
    // The book falling open: a shimmer of rising notes.
    [660, 880, 1109, 1319, 1760].forEach((f, i) => {
      tone(c, out, t + i * 0.07, 0.7, f, f, 0.03, 'sine', 6, 6);
      tone(c, out, t + i * 0.07, 0.6, f * 1.005, f * 1.005, 0.02, 'triangle');
    });
  } else if (name === 'crackle') {
    // Static gathering in the cloud: ticks and a rising hum.
    for (let i = 0; i < 14; i++) rush(c, out, t + Math.random() * 0.5, 0.012, 4000, 3000, 0.02 + Math.random() * 0.06, 'highpass');
    tone(c, out, t, 0.55, 55, 110, 0.04, 'sawtooth');
  } else if (name === 'thunder') {
    // A crack of lightning, and the rumble rolling after it.
    rush(c, out, t, 0.18, 3000, 1200, 0.35, 'highpass');
    rush(c, out, t + 0.03, 1.8, 320, 70, 0.32, 'lowpass');
    tone(c, out, t, 0.5, 90, 35, 0.25, 'sine');
  } else if (name === 'fizzle') {
    // A sizzle dying away.
    rush(c, out, t, 1.0, 5200, 2500, 0.05, 'bandpass', 0.7);
  } else if (name === 'flock' || name === 'scatter') {
    // A flurry of wings (and on the way in, a caw or two).
    for (let i = 0; i < 16; i++) rush(c, out, t + i * 0.055 + Math.random() * 0.03, 0.06, 600 + Math.random() * 400, 500, 0.06, 'bandpass', 0.8);
    if (name === 'flock') {
      caw(c, out, t + 0.15, 560);
      caw(c, out, t + 0.5, 500);
    }
  } else if (name === 'caw') {
    caw(c, out, t, 520 + Math.random() * 80);
  } else if (name === 'fwump') {
    // A big muffled thump, and the brass ringing.
    tone(c, out, t, 0.35, 130, 45, 0.35, 'sine');
    rush(c, out, t, 0.25, 500, 150, 0.15, 'lowpass');
    tone(c, out, t + 0.01, 1.4, 1180, 1180, 0.025, 'sine');
    tone(c, out, t + 0.01, 1.1, 2960, 2960, 0.01, 'sine');
  } else if (name === 'hiss') {
    // A flame snuffed out.
    rush(c, out, t, 0.7, 2500, 6000, 0.06, 'highpass');
  } else if (name === 'lever') {
    // Clunk-clack.
    rush(c, out, t, 0.05, 900, 700, 0.2);
    tone(c, out, t, 0.09, 320, 120, 0.15, 'triangle');
    rush(c, out, t + 0.1, 0.03, 1800, 1500, 0.12);
  } else if (name === 'drop') {
    // The cartoon fall: a long whistle going down.
    tone(c, out, t, 1.0, 1500, 240, 0.06, 'sine', 0, 0, 0.75);
  } else if (name === 'thud') {
    // A thump far down below.
    tone(c, out, t, 0.4, 95, 40, 0.25, 'sine');
    rush(c, out, t, 0.3, 260, 120, 0.12, 'lowpass');
  } else if (name === 'slam') {
    rush(c, out, t, 0.14, 520, 300, 0.3);
    tone(c, out, t, 0.22, 150, 60, 0.3, 'sine');
  }
}

/**
 * A tone for the night visit's sounds: `type` of wave sliding `from` one pitch `to` another over `len` seconds, with a
 * quick swell and a fade (held full for the first `hold` of it), and if asked a wobble (`wob` times a second, `depth`
 * Hz either way).
 */
function tone(c: AudioContext, out: AudioNode, at: number, len: number, from: number, to: number, vol: number, type: OscillatorType = 'sine', wob = 0, depth = 0, hold = 0) {
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(from, at);
  osc.frequency.exponentialRampToValueAtTime(to, at + len);
  g.gain.setValueAtTime(0.0001, at);
  g.gain.exponentialRampToValueAtTime(vol, at + Math.min(0.02, len * 0.2));
  if (hold) g.gain.setValueAtTime(vol, at + len * hold);
  g.gain.exponentialRampToValueAtTime(0.0001, at + len);
  osc.connect(g).connect(out);
  osc.start(at);
  osc.stop(at + len + 0.05);
  if (wob) {
    const lfo = c.createOscillator();
    const d = c.createGain();
    lfo.frequency.value = wob;
    d.gain.value = depth;
    lfo.connect(d).connect(osc.frequency);
    lfo.start(at);
    lfo.stop(at + len + 0.05);
  }
}

/** A burst of noise through a filter whose frequency slides `from` `to`, for the night visit's sounds. */
function rush(c: AudioContext, out: AudioNode, at: number, len: number, from: number, to: number, vol: number, type: BiquadFilterType = 'bandpass', q = 1) {
  const src = noise(c, len);
  const f = c.createBiquadFilter();
  f.type = type;
  f.Q.value = q;
  f.frequency.setValueAtTime(from, at);
  f.frequency.exponentialRampToValueAtTime(to, at + len);
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, at);
  g.gain.exponentialRampToValueAtTime(vol, at + Math.min(0.01, len * 0.1));
  g.gain.exponentialRampToValueAtTime(0.0001, at + len);
  src.connect(f).connect(g).connect(out);
  src.start(at);
}

/** A raven: kraa, harsh and falling, with a rattle in it. */
function caw(c: AudioContext, out: AudioNode, at: number, pitch: number) {
  const f = c.createBiquadFilter();
  f.type = 'bandpass';
  f.frequency.value = 1150;
  f.Q.value = 2.5;
  const rattle = c.createGain();
  rattle.gain.value = 0.6;
  const lfo = c.createOscillator();
  const d = c.createGain();
  lfo.frequency.value = 34;
  d.gain.value = 0.4;
  lfo.connect(d).connect(rattle.gain);
  f.connect(rattle).connect(out);
  tone(c, f, at, 0.3, pitch, pitch * 0.75, 0.16, 'sawtooth');
  lfo.start(at);
  lfo.stop(at + 0.35);
}

/** The messenger pigeon: a flurry of wingbeats, a soft coo, and the pop of confetti. */
export function pigeonSound(name: string) {
  const c = audio();
  if (!c) return;
  const t = c.currentTime;
  const out = c.createGain();
  out.connect(c.destination);
  if (name === 'flap') {
    for (let i = 0; i < 7; i++) {
      const src = noise(c, 0.08);
      const f = c.createBiquadFilter();
      f.type = 'bandpass';
      f.frequency.value = 700 + i * 30;
      f.Q.value = 0.8;
      const g = c.createGain();
      const at = t + i * 0.11;
      g.gain.setValueAtTime(0.0001, at);
      g.gain.exponentialRampToValueAtTime(0.05, at + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, at + 0.07);
      src.connect(f).connect(g).connect(out);
      src.start(at);
    }
  } else if (name === 'coo') {
    // Two soft, throaty notes: "roo-coo".
    [
      [330, 0, 0.28],
      [290, 0.3, 0.45],
    ].forEach(([freq, delay, len]) => {
      const osc = c.createOscillator();
      osc.type = 'sine';
      const wob = c.createOscillator();
      const depth = c.createGain();
      wob.frequency.value = 18;
      depth.gain.value = 12;
      wob.connect(depth).connect(osc.frequency);
      osc.frequency.setValueAtTime(freq, t + delay);
      osc.frequency.linearRampToValueAtTime(freq * 0.85, t + delay + len);
      const g = c.createGain();
      g.gain.setValueAtTime(0.0001, t + delay);
      g.gain.exponentialRampToValueAtTime(0.08, t + delay + 0.05);
      g.gain.exponentialRampToValueAtTime(0.0001, t + delay + len);
      osc.connect(g).connect(out);
      osc.start(t + delay);
      wob.start(t + delay);
      osc.stop(t + delay + len + 0.05);
      wob.stop(t + delay + len + 0.05);
    });
  } else if (name === 'pop') {
    const src = noise(c, 0.25);
    const f = c.createBiquadFilter();
    f.type = 'highpass';
    f.frequency.value = 900;
    out.gain.setValueAtTime(0.0001, t);
    out.gain.exponentialRampToValueAtTime(0.16, t + 0.005);
    out.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);
    src.connect(f).connect(out);
    src.start(t);
    // And a little sparkle.
    [1047, 1319, 1568].forEach((freq, i) => {
      const s = c.createOscillator();
      const g = c.createGain();
      s.type = 'triangle';
      s.frequency.value = freq;
      const at = t + 0.03 + i * 0.06;
      g.gain.setValueAtTime(0.0001, at);
      g.gain.exponentialRampToValueAtTime(0.05, at + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, at + 0.5);
      s.connect(g).connect(c.destination);
      s.start(at);
      s.stop(at + 0.55);
    });
  }
}

/** A note shaped by a quick rise and a fall, sliding from `f0` to `f1` over its length. */
function blip(c: AudioContext, out: AudioNode, at: number, len: number, type: OscillatorType, f0: number, f1: number, vol: number) {
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(f0, at);
  osc.frequency.exponentialRampToValueAtTime(Math.max(20, f1), at + len);
  g.gain.setValueAtTime(0.0001, at);
  g.gain.exponentialRampToValueAtTime(vol, at + Math.min(0.02, len / 4));
  g.gain.exponentialRampToValueAtTime(0.0001, at + len);
  osc.connect(g).connect(out);
  osc.start(at);
  osc.stop(at + len + 0.05);
  return osc;
}

/** Noise through a filter, swept from `f0` to `f1`, rising and falling over its length. */
function hush(c: AudioContext, out: AudioNode, at: number, len: number, kind: BiquadFilterType, f0: number, f1: number, vol: number, q = 1, attack = 0.01) {
  const src = noise(c, len + 0.05);
  const f = c.createBiquadFilter();
  f.type = kind;
  f.Q.value = q;
  f.frequency.setValueAtTime(f0, at);
  f.frequency.exponentialRampToValueAtTime(Math.max(20, f1), at + len);
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, at);
  g.gain.exponentialRampToValueAtTime(vol, at + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, at + len);
  src.connect(f).connect(g).connect(out);
  src.start(at);
  return src;
}

/**
 * The executions' sounds, by name: puffs, drums, volleys and corks, blades and clunks, the buzz of the chair, the
 * rocket's fuse, whistle and boom, the fire, a rain cloud, the kaiju's rumble, roar, breath and sneeze, and the
 * soul floating up. Plus the vote's ticks and the wheel's clicks.
 */
export function execSound(name: string) {
  const c = audio();
  if (!c) return;
  const t = c.currentTime;
  const out = c.createGain();
  out.gain.value = 1;
  out.connect(c.destination);
  switch (name) {
    case 'poof':
      hush(c, out, t, 0.45, 'bandpass', 2400, 500, 0.12, 0.8);
      break;
    case 'drumroll':
      drumroll(1.3);
      break;
    case 'ready':
    case 'aim':
      // A snare's crack and the stamp of boots.
      hush(c, out, t, 0.12, 'highpass', 1800, 1800, 0.14);
      blip(c, out, t, 0.18, 'triangle', 140, 60, 0.18);
      break;
    case 'volley':
      for (let k = 0; k < 4; k++) {
        const at = t + k * 0.05;
        hush(c, out, at, 0.5, 'lowpass', 3000, 300, 0.3);
        blip(c, out, at, 0.25, 'sine', 120, 40, 0.35);
      }
      break;
    case 'flags':
      // Four little pops and a silly kazoo.
      for (let k = 0; k < 4; k++) {
        hush(c, out, t + k * 0.05, 0.08, 'highpass', 2500, 2500, 0.12);
        blip(c, out, t + k * 0.05, 0.08, 'sine', 900, 500, 0.08);
      }
      blip(c, out, t + 0.3, 0.5, 'sawtooth', 300, 420, 0.04);
      break;
    case 'thud':
      blip(c, out, t, 0.3, 'sine', 110, 40, 0.35);
      hush(c, out, t, 0.2, 'lowpass', 600, 150, 0.15);
      break;
    case 'blade':
      // A long metal shhhing down.
      hush(c, out, t, 0.25, 'bandpass', 5200, 1600, 0.14, 3);
      break;
    case 'chop':
      blip(c, out, t, 0.35, 'sine', 95, 45, 0.4);
      hush(c, out, t, 0.12, 'bandpass', 1400, 700, 0.2);
      break;
    case 'jam':
    case 'clunk':
      blip(c, out, t, 0.12, 'square', 220, 150, 0.08);
      blip(c, out, t, 0.25, 'sine', 160, 70, 0.3);
      hush(c, out, t, 0.08, 'bandpass', 2400, 1200, 0.12, 2);
      if (name === 'jam') {
        const b = blip(c, out, t + 0.08, 0.7, 'triangle', 330, 280, 0.08);
        const wob = c.createOscillator();
        const d = c.createGain();
        wob.frequency.value = 14;
        d.gain.value = 60;
        wob.connect(d).connect(b.frequency);
        wob.start(t + 0.08);
        wob.stop(t + 0.85);
      }
      break;
    case 'boing': {
      const b = blip(c, out, t, 0.6, 'sine', 180, 520, 0.12);
      const wob = c.createOscillator();
      const d = c.createGain();
      wob.frequency.value = 18;
      d.gain.value = 50;
      wob.connect(d).connect(b.frequency);
      wob.start(t);
      wob.stop(t + 0.65);
      break;
    }
    case 'buzz': {
      // The chair: a fierce mains hum with crackles over it.
      const hum = c.createOscillator();
      hum.type = 'sawtooth';
      hum.frequency.value = 60;
      const hum2 = c.createOscillator();
      hum2.type = 'square';
      hum2.frequency.value = 121;
      const g = c.createGain();
      const f = c.createBiquadFilter();
      f.type = 'lowpass';
      f.frequency.value = 1400;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.09, t + 0.05);
      g.gain.setValueAtTime(0.09, t + 1.8);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 2.0);
      hum.connect(f);
      hum2.connect(f);
      f.connect(g).connect(out);
      hum.start(t);
      hum2.start(t);
      hum.stop(t + 2.05);
      hum2.stop(t + 2.05);
      for (let k = 0; k < 16; k++) hush(c, out, t + k * 0.12 + Math.random() * 0.05, 0.05, 'highpass', 3000, 3000, 0.1);
      break;
    }
    case 'fizzle':
      hush(c, out, t, 0.6, 'bandpass', 3000, 900, 0.08, 1.5);
      for (let k = 0; k < 3; k++) hush(c, out, t + 0.1 + k * 0.13, 0.04, 'highpass', 3500, 3500, 0.06);
      break;
    case 'wahwah':
      // The sad trombone.
      [
        [311, 0],
        [294, 0.35],
        [277, 0.7],
        [262, 1.05],
      ].forEach(([f, at], i) => {
        const o = blip(c, out, t + at, i === 3 ? 1.0 : 0.38, 'sawtooth', f, i === 3 ? f * 0.94 : f, 0.05);
        if (i === 3) {
          const wob = c.createOscillator();
          const d = c.createGain();
          wob.frequency.value = 6;
          d.gain.value = 6;
          wob.connect(d).connect(o.frequency);
          wob.start(t + at);
          wob.stop(t + at + 1.05);
        }
      });
      break;
    case 'sizzle':
      hush(c, out, t, 1.6, 'highpass', 4000, 6000, 0.05, 1, 0.2);
      break;
    case 'fuse':
      hush(c, out, t, 1.2, 'bandpass', 5000, 7000, 0.06, 2, 0.05);
      break;
    case 'launch':
      hush(c, out, t, 1.0, 'bandpass', 300, 2600, 0.25, 0.7, 0.03);
      blip(c, out, t, 0.4, 'sine', 90, 50, 0.25);
      break;
    case 'whistle':
      // Coming down: the falling whistle.
      blip(c, out, t, 0.85, 'sine', 2200, 700, 0.06);
      break;
    case 'boom':
      blip(c, out, t, 1.2, 'sine', 80, 28, 0.6);
      hush(c, out, t, 1.6, 'lowpass', 2500, 120, 0.45, 0.7, 0.005);
      break;
    case 'thunk':
      blip(c, out, t, 0.2, 'sine', 140, 60, 0.35);
      hush(c, out, t, 0.1, 'bandpass', 900, 600, 0.18);
      break;
    case 'squeak':
      blip(c, out, t, 0.25, 'sine', 900, 1500, 0.07);
      break;
    case 'crackle':
      for (let k = 0; k < 30; k++) hush(c, out, t + Math.random() * 4, 0.03 + Math.random() * 0.04, 'bandpass', 1500 + Math.random() * 2500, 1500, 0.05 + Math.random() * 0.05, 1.5);
      hush(c, out, t, 4.2, 'lowpass', 500, 400, 0.04, 0.7, 0.4);
      break;
    case 'rain':
      for (let k = 0; k < 40; k++) hush(c, out, t + Math.random() * 1.8, 0.03, 'bandpass', 2500 + Math.random() * 3000, 2000, 0.04, 2);
      break;
    case 'hiss':
      hush(c, out, t, 1.4, 'highpass', 3000, 2000, 0.12, 0.8, 0.05);
      break;
    case 'pop':
      hush(c, out, t, 0.08, 'highpass', 2000, 2000, 0.15);
      blip(c, out, t, 0.1, 'sine', 700, 300, 0.1);
      break;
    case 'ding':
      bell(1568, 1.6, 0.08);
      bell(2093, 1.2, 0.05, 0.01);
      break;
    case 'rumble':
      hush(c, out, t, 2.6, 'lowpass', 120, 90, 0.5, 0.6, 0.4);
      blip(c, out, t, 2.4, 'sine', 45, 32, 0.25);
      break;
    case 'roar': {
      // A great growling roar: a low saw that rises and falls, rough with noise, and a rumble under it.
      const o = c.createOscillator();
      o.type = 'sawtooth';
      o.frequency.setValueAtTime(70, t);
      o.frequency.linearRampToValueAtTime(130, t + 0.4);
      o.frequency.linearRampToValueAtTime(95, t + 1.3);
      const rough = c.createOscillator();
      const d = c.createGain();
      rough.frequency.value = 31;
      d.gain.value = 25;
      rough.connect(d).connect(o.frequency);
      const f = c.createBiquadFilter();
      f.type = 'lowpass';
      f.frequency.setValueAtTime(400, t);
      f.frequency.linearRampToValueAtTime(1600, t + 0.4);
      f.frequency.linearRampToValueAtTime(500, t + 1.4);
      const g = c.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.22, t + 0.15);
      g.gain.setValueAtTime(0.22, t + 1.0);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 1.5);
      o.connect(f).connect(g).connect(out);
      o.start(t);
      rough.start(t);
      o.stop(t + 1.55);
      rough.stop(t + 1.55);
      hush(c, out, t, 1.4, 'bandpass', 600, 900, 0.18, 0.6, 0.15);
      blip(c, out, t, 1.5, 'sine', 50, 38, 0.3);
      break;
    }
    case 'charge':
      blip(c, out, t, 1.0, 'sine', 220, 1200, 0.05);
      blip(c, out, t, 1.0, 'triangle', 330, 1800, 0.03);
      break;
    case 'beam':
      hush(c, out, t, 1.25, 'bandpass', 900, 1400, 0.3, 0.5, 0.03);
      blip(c, out, t, 1.2, 'sawtooth', 110, 90, 0.08);
      blip(c, out, t, 1.2, 'sine', 1600, 1300, 0.04);
      break;
    case 'ahh':
      hush(c, out, t, 0.45, 'bandpass', 500, 800, 0.12, 2, 0.15);
      break;
    case 'sneeze':
      hush(c, out, t, 0.6, 'bandpass', 2500, 900, 0.35, 0.8, 0.01);
      blip(c, out, t, 0.3, 'sawtooth', 220, 110, 0.08);
      break;
    case 'soul': {
      // A soft rising harp, and a hushed choir under it.
      [523.3, 659.3, 784, 1046.5, 1318.5].forEach((f, i) => bell(f, 1.6, 0.035, i * 0.13));
      for (const f of [261.6, 329.6, 392]) {
        const o = c.createOscillator();
        o.type = 'triangle';
        o.frequency.setValueAtTime(f, t);
        o.frequency.linearRampToValueAtTime(f * 1.06, t + 2.8);
        const g = c.createGain();
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(0.025, t + 0.6);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 3.0);
        o.connect(g).connect(out);
        o.start(t);
        o.stop(t + 3.05);
      }
      break;
    }
    case 'twinkle':
      [1568, 2093, 2637].forEach((f, i) => blip(c, out, t + i * 0.06, 0.4, 'triangle', f, f, 0.04));
      break;
    case 'tick':
      blip(c, out, t, 0.06, 'triangle', 1400, 900, 0.08);
      break;
    case 'click':
      blip(c, out, t, 0.03, 'square', 2200, 1600, 0.03);
      break;
    case 'land':
      bell(784, 1.2, 0.07);
      bell(1175, 1.2, 0.05, 0.08);
      break;
  }
}
