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
};
