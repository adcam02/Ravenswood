/** Little sounds for the job minigames, made in the browser so there's nothing to download. */

let ctx: AudioContext | null = null;
let muted = false;
let noiseBuf: AudioBuffer | null = null;

export function setJobsMuted(m: boolean) {
  muted = m;
}

/** The audio context is only made once someone presses something, since browsers block sound before that. */
function ac(): AudioContext | null {
  if (muted) return null;
  try {
    ctx ??= new AudioContext();
    if (ctx.state === 'suspended') void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

function noise(c: AudioContext): AudioBuffer {
  if (!noiseBuf || noiseBuf.sampleRate !== c.sampleRate) {
    noiseBuf = c.createBuffer(1, c.sampleRate, c.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  return noiseBuf;
}

interface ToneOpts {
  type?: OscillatorType;
  vol?: number;
  slideTo?: number;
  delay?: number;
  attack?: number;
}

function tone(freq: number, dur: number, o: ToneOpts = {}) {
  const c = ac();
  if (!c) return;
  const t = c.currentTime + (o.delay ?? 0);
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = o.type ?? 'sine';
  osc.frequency.setValueAtTime(freq, t);
  if (o.slideTo) osc.frequency.exponentialRampToValueAtTime(o.slideTo, t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(o.vol ?? 0.1, t + (o.attack ?? 0.008));
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(g).connect(c.destination);
  osc.start(t);
  osc.stop(t + dur + 0.05);
}

interface BurstOpts {
  freq?: number;
  q?: number;
  vol?: number;
  type?: BiquadFilterType;
  slideTo?: number;
  delay?: number;
}

function burst(dur: number, o: BurstOpts = {}) {
  const c = ac();
  if (!c) return;
  const t = c.currentTime + (o.delay ?? 0);
  const src = c.createBufferSource();
  src.buffer = noise(c);
  const f = c.createBiquadFilter();
  f.type = o.type ?? 'bandpass';
  f.frequency.setValueAtTime(o.freq ?? 1000, t);
  if (o.slideTo) f.frequency.exponentialRampToValueAtTime(o.slideTo, t + dur);
  f.Q.value = o.q ?? 1;
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(o.vol ?? 0.1, t + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(f).connect(g).connect(c.destination);
  src.start(t, Math.random() * 0.5);
  src.stop(t + dur + 0.05);
}

const rand = (a: number, b: number) => a + Math.random() * (b - a);

export const sfx = {
  /** One glug of a pour; played over and over while pouring. */
  gurgle: () => tone(rand(240, 480), 0.08, { vol: 0.07, slideTo: rand(500, 700) }),
  pop: () => tone(rand(700, 1200), 0.06, { vol: 0.06, slideTo: rand(1500, 2200) }),
  scrub: () => burst(0.08, { freq: rand(2000, 3200), q: 1.4, vol: 0.05 }),
  swish: () => burst(0.35, { freq: 600, slideTo: 3000, q: 0.8, vol: 0.06 }),
  plop: () => tone(560, 0.2, { vol: 0.14, slideTo: 140 }),
  splash: () => {
    burst(0.5, { freq: 1400, slideTo: 380, q: 0.6, vol: 0.12 });
    tone(320, 0.18, { vol: 0.06, slideTo: 120 });
  },
  click: () => tone(rand(1700, 1900), 0.025, { type: 'square', vol: 0.025 }),
  tick: () => tone(1200, 0.04, { type: 'triangle', vol: 0.05, slideTo: 700 }),
  ding: () => {
    tone(1318.5, 0.7, { vol: 0.07 });
    tone(1975.5, 0.5, { vol: 0.035, delay: 0.015 });
  },
  ovenDing: () => {
    tone(1568, 0.6, { vol: 0.07 });
    tone(1568, 0.8, { vol: 0.07, delay: 0.22 });
  },
  thud: () => {
    tone(150, 0.2, { vol: 0.2, slideTo: 50 });
    burst(0.14, { freq: 500, q: 0.7, vol: 0.07, type: 'lowpass' });
  },
  trickle: () => burst(0.12, { freq: rand(2600, 4200), q: 5, vol: 0.035 }),
  squish: () => tone(rand(180, 240), 0.14, { vol: 0.12, slideTo: 90, type: 'triangle' }),
  miss: () => tone(220, 0.18, { vol: 0.06, type: 'triangle', slideTo: 160 }),
  success: () => [523.3, 659.3, 784, 1046.5].forEach((f, i) => tone(f, 0.35, { vol: 0.07, delay: i * 0.08, type: 'triangle' })),
  okay: () => [523.3, 659.3, 784].forEach((f, i) => tone(f, 0.3, { vol: 0.06, delay: i * 0.08, type: 'triangle' })),
  fail: () => [392, 329.6, 261.6].forEach((f, i) => tone(f, 0.32, { vol: 0.06, delay: i * 0.12, type: 'triangle' })),

  // ---- fishing
  cast: () => burst(0.35, { freq: 700, slideTo: 2600, q: 0.9, vol: 0.05 }),
  nibble: () => tone(rand(820, 980), 0.05, { vol: 0.03, slideTo: 600 }),
  tugLight: () => {
    tone(760, 0.1, { vol: 0.1, slideTo: 520 });
    burst(0.08, { freq: 1600, q: 1, vol: 0.04 });
  },
  tugMedium: () => {
    tone(520, 0.12, { vol: 0.14, slideTo: 300, type: 'triangle' });
    tone(520, 0.12, { vol: 0.14, slideTo: 300, type: 'triangle', delay: 0.13 });
    burst(0.12, { freq: 900, q: 0.8, vol: 0.06 });
  },
  tugHeavy: () => {
    [0, 0.11, 0.22].forEach((d) => tone(240, 0.16, { vol: 0.2, slideTo: 110, type: 'triangle', delay: d }));
    burst(0.3, { freq: 500, q: 0.6, vol: 0.09, type: 'lowpass' });
  },
  /** One click of the reel; played over and over while winding. */
  reel: () => tone(rand(1400, 1600), 0.02, { type: 'square', vol: 0.02 }),
  strain: () => tone(rand(150, 190), 0.12, { type: 'sawtooth', vol: 0.03, slideTo: 230 }),
  snap: () => {
    tone(1800, 0.08, { vol: 0.12, slideTo: 300 });
    burst(0.18, { freq: 3000, q: 0.5, vol: 0.1, type: 'highpass' });
    tone(140, 0.25, { vol: 0.08, slideTo: 60, delay: 0.05 });
  },
  escape: () => {
    tone(420, 0.3, { vol: 0.07, slideTo: 180, type: 'triangle' });
    burst(0.3, { freq: 1200, slideTo: 400, q: 0.7, vol: 0.06, delay: 0.1 });
  },

  // ---- darts
  throwDart: () => burst(0.22, { freq: 900, slideTo: 2800, q: 0.9, vol: 0.05 }),
  dartThunk: () => {
    tone(210, 0.07, { vol: 0.18, slideTo: 90 });
    burst(0.06, { freq: 1800, q: 1.2, vol: 0.06 });
  },

  // ---- bread
  slice: () => {
    burst(0.14, { freq: 2600, slideTo: 700, q: 0.9, vol: 0.07 });
    tone(300, 0.08, { vol: 0.05, slideTo: 150, type: 'triangle', delay: 0.04 });
  },

  // ---- wine
  spill: () => {
    burst(0.22, { freq: 2200, slideTo: 600, q: 0.8, vol: 0.06 });
    tone(rand(300, 380), 0.12, { vol: 0.04, slideTo: 160 });
  },

  // ---- firewood
  swing: () => burst(0.2, { freq: 400, slideTo: 1800, q: 0.9, vol: 0.05 }),
  axe: () => {
    tone(130, 0.22, { vol: 0.24, slideTo: 45 });
    burst(0.12, { freq: 600, q: 0.7, vol: 0.08, type: 'lowpass' });
  },
  crack: () => {
    burst(0.14, { freq: 2400, q: 2.2, vol: 0.12 });
    tone(900, 0.1, { vol: 0.06, slideTo: 260, type: 'triangle', delay: 0.02 });
  },

  // ---- skimming
  /** The nth skip rings a little higher than the one before. */
  skip: (n: number) => {
    tone(900 + n * 110, 0.07, { vol: 0.07, slideTo: 500 + n * 60 });
    burst(0.07, { freq: 3000, q: 1.5, vol: 0.035 });
  },
  sink: () => {
    tone(380, 0.22, { vol: 0.12, slideTo: 110 });
    burst(0.3, { freq: 1100, slideTo: 300, q: 0.7, vol: 0.07, delay: 0.03 });
  },
  lock: () => tone(1050, 0.05, { type: 'square', vol: 0.035, slideTo: 1400 }),

  // ---- the well
  clink: () => {
    tone(2600, 0.12, { vol: 0.06 });
    tone(3900, 0.09, { vol: 0.03, delay: 0.01 });
  },
  wellSplash: () => {
    tone(500, 0.16, { vol: 0.08, slideTo: 180 });
    burst(0.35, { freq: 1200, slideTo: 300, q: 0.7, vol: 0.06 });
    tone(500, 0.16, { vol: 0.03, slideTo: 180, delay: 0.18 });
  },
  shimmer: () => [1568, 1975.5, 2349.3, 3136].forEach((f, i) => tone(f, 0.4, { vol: 0.035, delay: i * 0.06 })),

  // ---- records and legends
  fanfare: () => {
    [523.3, 659.3, 784, 1046.5, 784, 1046.5, 1318.5].forEach((f, i) => tone(f, i === 6 ? 0.8 : 0.22, { vol: 0.07, delay: i * 0.09, type: 'triangle' }));
    [2093, 2637, 3136].forEach((f, i) => tone(f, 0.5, { vol: 0.02, delay: 0.6 + i * 0.05 }));
  },
};
