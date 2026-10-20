/**
 * Soft ambient sound, all made in the browser so there's nothing to download: a gentle tune and birds by day,
 * crickets and an owl by night, a breath of wind, water and frogs at the pond, a creaking rope at the gallows,
 * a fire in the tavern and the bakery, and a hush in the church. Everything sits well under the voices.
 */
import { GALLOWS, POND } from '../world/town/layout';
import { zoneKind } from '../world/types';

/** How loud each layer can get at most (the master sits on top of these). */
const LEVEL = {
  master: 0.7,
  wind: 0.028,
  tune: 0.05,
  pad: 0.03,
  birds: 0.05,
  crickets: 0.05,
  owl: 0.035,
  pond: 0.12,
  frog: 0.07,
  creak: 0.085,
  fire: 0.06,
  crackle: 0.08,
  clink: 0.012,
  hum: 0.028,
};

const hz = (midi: number) => 440 * 2 ** ((midi - 69) / 12);
// C major pentatonic across two octaves: the tune wanders along it.
const SCALE = [60, 62, 64, 67, 69, 72, 74, 76, 79, 81];
// Slow pad chords under the tune: C, Am, F, G.
const PADS = [
  [48, 55, 64],
  [45, 52, 60],
  [41, 48, 57],
  [43, 50, 59],
];

export interface AmbienceState {
  zone: string;
  x: number;
  z: number;
  /** 0 by day to 1 at night. */
  night: number;
  /** The camera's yaw, so sounds sit left or right of what you see. */
  yaw: number;
}

/** Distance falloff: full inside `near`, silent past `far`. */
const falloff = (d: number, near: number, far: number) => (d <= near ? 1 : d >= far ? 0 : 1 - (d - near) / (far - near));

class Ambience {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private wet: ConvolverNode | null = null;
  private muffle: BiquadFilterNode | null = null;
  private layers: Record<string, GainNode> = {};
  private pan: Record<string, StereoPannerNode> = {};
  private timer: ReturnType<typeof setInterval> | null = null;
  private state: AmbienceState = { zone: 'town', x: 0, z: 0, night: 0, yaw: 0 };
  private next: Record<string, number> = {};
  private lastNote = 4;
  private padIndex = 0;
  private padUntil = 0;
  private enabled = true;
  private started = false;

  /** Call after a click or key, as browsers only allow sound after a gesture. */
  start() {
    if (this.started || !this.enabled) return;
    try {
      this.ctx = new AudioContext();
    } catch {
      return;
    }
    this.started = true;
    const ctx = this.ctx;
    void ctx.resume();
    this.master = ctx.createGain();
    this.master.gain.value = 0;
    this.master.gain.setTargetAtTime(LEVEL.master, ctx.currentTime + 0.5, 2);
    this.master.connect(ctx.destination);
    // Indoors the outside gets muffled: outdoor layers go through this lowpass, whose cutoff opens and closes.
    this.muffle = ctx.createBiquadFilter();
    this.muffle.type = 'lowpass';
    this.muffle.frequency.value = 18000;
    this.muffle.connect(this.master);
    this.wet = ctx.createConvolver();
    this.wet.buffer = this.impulse(2.6);
    const wetGain = ctx.createGain();
    wetGain.gain.value = 0.45;
    this.wet.connect(wetGain).connect(this.muffle);
    for (const name of ['wind', 'tune', 'pad', 'birds', 'crickets', 'owl', 'pond', 'frog', 'creak']) this.layer(name, this.muffle);
    for (const name of ['fire', 'crackle', 'clink', 'hum']) this.layer(name, this.master);
    this.wind();
    this.pondWater();
    this.fireBed();
    this.churchHum();
    this.pad();
    const now = ctx.currentTime;
    this.next = { note: now + 1.5, bird: now + 2, cricket: now + 1, owl: now + 12, frog: now + 4, creak: now + 2, crackle: now + 0.5, clink: now + 9 };
    this.timer = setInterval(() => this.tick(), 120);
  }

  setEnabled(on: boolean) {
    this.enabled = on;
    if (!on && this.ctx && this.master) this.master.gain.setTargetAtTime(0, this.ctx.currentTime, 0.3);
    if (on && this.ctx && this.master) this.master.gain.setTargetAtTime(LEVEL.master, this.ctx.currentTime, 0.6);
  }

  /** Where the listener is and what the day is doing; call every frame, it's cheap. */
  update(s: AmbienceState) {
    this.state = s;
    if (!this.ctx || !this.master) return;
    const ctx = this.ctx;
    const kind = zoneKind(s.zone);
    const outside = kind === 'town';
    const t = ctx.currentTime;
    const set = (name: string, v: number, over = 0.6) => this.layers[name]?.gain.setTargetAtTime(v, t, over / 3);
    const day = 1 - s.night;
    // Outside the walls everything is muffled and far away; the bedroom at night keeps its own music.
    this.muffle!.frequency.setTargetAtTime(outside ? 18000 : 700, t, 0.3);
    const outdoorLevel = outside ? 1 : kind === 'house' ? 0.12 : 0.3;
    set('wind', LEVEL.wind * (0.6 + 0.4 * day) * outdoorLevel);
    set('tune', LEVEL.tune * day * outdoorLevel);
    set('pad', LEVEL.pad * day * outdoorLevel);
    set('birds', LEVEL.birds * day * outdoorLevel);
    set('crickets', LEVEL.crickets * s.night * outdoorLevel);
    set('owl', LEVEL.owl * s.night * outdoorLevel);
    // Positional sources only count outdoors.
    const pondD = Math.hypot(s.x - POND.x, s.z - POND.z);
    const pondGain = outside ? falloff(pondD, 4.5, 15) : 0;
    set('pond', LEVEL.pond * pondGain);
    set('frog', LEVEL.frog * pondGain);
    this.panTo('pond', POND.x, POND.z);
    this.panTo('frog', POND.x, POND.z);
    const gallowsD = Math.hypot(s.x - GALLOWS.x, s.z - GALLOWS.z);
    set('creak', LEVEL.creak * (outside ? falloff(gallowsD, 2.5, 10) : 0));
    this.panTo('creak', GALLOWS.x, GALLOWS.z);
    // Rooms: fire in the tavern and bakery, a hush in the church.
    const fire = kind === 'tavern' ? 1 : kind === 'bakery' ? 0.8 : 0;
    set('fire', LEVEL.fire * fire);
    set('crackle', LEVEL.crackle * fire);
    set('clink', LEVEL.clink * (kind === 'tavern' ? 1 : 0));
    set('hum', LEVEL.hum * (kind === 'church' ? 1 : 0));
  }

  dispose() {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
    void this.ctx?.close();
    this.ctx = null;
    this.started = false;
  }

  // ---------------------------------------------------------------- plumbing

  private layer(name: string, to: AudioNode) {
    const ctx = this.ctx!;
    const g = ctx.createGain();
    g.gain.value = 0;
    const p = ctx.createStereoPanner();
    g.connect(p).connect(to);
    this.layers[name] = g;
    this.pan[name] = p;
  }

  /** Pans a layer to where its source sits relative to the camera. */
  private panTo(name: string, sx: number, sz: number) {
    const p = this.pan[name];
    if (!p || !this.ctx) return;
    const { x, z, yaw } = this.state;
    const dx = sx - x;
    const dz = sz - z;
    const d = Math.hypot(dx, dz) || 1;
    // The camera's right-hand vector, for a camera sat behind the player at this yaw.
    const right = (dx * Math.cos(yaw) - dz * Math.sin(yaw)) / d;
    p.pan.setTargetAtTime(Math.max(-0.8, Math.min(0.8, right * Math.min(1, d / 6))), this.ctx.currentTime, 0.2);
  }

  private impulse(seconds: number) {
    const ctx = this.ctx!;
    const len = Math.floor(ctx.sampleRate * seconds);
    const buf = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const data = buf.getChannelData(ch);
      for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len) ** 3;
    }
    return buf;
  }

  private noise(seconds = 2) {
    const ctx = this.ctx!;
    const len = Math.floor(ctx.sampleRate * seconds);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.loop = true;
    return src;
  }

  // ---------------------------------------------------------------- the beds that run all the time

  /** A breath of air: filtered noise that swells and fades very slowly. */
  private wind() {
    const ctx = this.ctx!;
    const src = this.noise(3);
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 320;
    lp.Q.value = 0.4;
    const swell = ctx.createGain();
    swell.gain.value = 0.7;
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.07;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 0.3;
    lfo.connect(lfoGain).connect(swell.gain);
    const lfo2 = ctx.createOscillator();
    lfo2.frequency.value = 0.045;
    const lfo2Gain = ctx.createGain();
    lfo2Gain.gain.value = 140;
    lfo2.connect(lfo2Gain).connect(lp.frequency);
    src.connect(lp).connect(swell).connect(this.layers.wind);
    src.start();
    lfo.start();
    lfo2.start();
  }

  /** Water lapping at the bank: a band of noise rising and falling, with a second slower swell. */
  private pondWater() {
    const ctx = this.ctx!;
    const src = this.noise(2.5);
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 900;
    bp.Q.value = 0.8;
    const lap = ctx.createGain();
    lap.gain.value = 0.5;
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.35;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 0.35;
    lfo.connect(lfoGain).connect(lap.gain);
    const lfo2 = ctx.createOscillator();
    lfo2.frequency.value = 0.11;
    const lfo2Gain = ctx.createGain();
    lfo2Gain.gain.value = 300;
    lfo2.connect(lfo2Gain).connect(bp.frequency);
    src.connect(bp).connect(lap).connect(this.layers.pond);
    src.start();
    lfo.start();
    lfo2.start();
  }

  /** The low roar of a fire, for the tavern hearth and the bakery oven. */
  private fireBed() {
    const ctx = this.ctx!;
    const src = this.noise(2);
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 180;
    const flicker = ctx.createGain();
    flicker.gain.value = 0.8;
    const lfo = ctx.createOscillator();
    lfo.type = 'triangle';
    lfo.frequency.value = 1.7;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 0.2;
    lfo.connect(lfoGain).connect(flicker.gain);
    src.connect(lp).connect(flicker).connect(this.layers.fire);
    src.start();
    lfo.start();
  }

  /** A hush under the church roof: two very low sines, slowly beating. */
  private churchHum() {
    const ctx = this.ctx!;
    for (const f of [110, 164.8, 220.5]) {
      const o = ctx.createOscillator();
      o.type = 'sine';
      o.frequency.value = f;
      const g = ctx.createGain();
      g.gain.value = f > 200 ? 0.12 : 0.3;
      o.connect(g).connect(this.layers.hum);
      o.start();
    }
  }

  /** A slow chord under the tune, changing every so often. */
  private pad() {
    const ctx = this.ctx!;
    this.padIndex = 0;
    this.padUntil = ctx.currentTime + 18;
    this.padVoices(PADS[0], ctx.currentTime, 18);
  }

  private padVoices(notes: number[], at: number, seconds: number) {
    const ctx = this.ctx!;
    for (const n of notes) {
      for (const detune of [-4, 4]) {
        const o = ctx.createOscillator();
        o.type = 'triangle';
        o.frequency.value = hz(n);
        o.detune.value = detune;
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.0001, at);
        g.gain.exponentialRampToValueAtTime(0.12, at + 3);
        g.gain.setValueAtTime(0.12, at + seconds - 3);
        g.gain.exponentialRampToValueAtTime(0.0001, at + seconds + 0.5);
        o.connect(g).connect(this.layers.pad);
        o.start(at);
        o.stop(at + seconds + 0.6);
      }
    }
  }

  // ---------------------------------------------------------------- the little things that happen now and then

  private tick() {
    const ctx = this.ctx;
    if (!ctx) return;
    const t = ctx.currentTime;
    const { night } = this.state;
    const kind = zoneKind(this.state.zone);
    const outside = kind === 'town';
    if (t >= this.padUntil - 0.5) {
      this.padIndex = (this.padIndex + 1) % PADS.length;
      this.padVoices(PADS[this.padIndex], this.padUntil, 18);
      this.padUntil += 18;
    }
    if (t >= this.next.note) {
      this.tuneNote(t);
      this.next.note = t + 1.4 + Math.random() * 2.2 + (Math.random() < 0.2 ? 2.5 : 0);
    }
    if (t >= this.next.bird) {
      if (night < 0.5 && outside) this.bird(t);
      this.next.bird = t + 3 + Math.random() * 7;
    }
    if (t >= this.next.cricket) {
      if (night > 0.5) this.cricket(t);
      this.next.cricket = t + 0.9 + Math.random() * 0.8;
    }
    if (t >= this.next.owl) {
      if (night > 0.5) this.owl(t);
      this.next.owl = t + 14 + Math.random() * 20;
    }
    if (t >= this.next.frog) {
      if (outside) this.frog(t);
      this.next.frog = t + 3 + Math.random() * 7;
    }
    if (t >= this.next.creak) {
      if (outside) this.creak(t);
      this.next.creak = t + 2.4 + Math.random() * 2.2;
    }
    if (t >= this.next.crackle) {
      if (kind === 'tavern' || kind === 'bakery') this.crackle(t);
      this.next.crackle = t + 0.15 + Math.random() * 0.6;
    }
    if (t >= this.next.clink) {
      if (kind === 'tavern') this.clink(t);
      this.next.clink = t + 7 + Math.random() * 12;
    }
  }

  /** The tune: a plucked note wandering along the scale, mostly stepwise, with a little room on it. */
  private tuneNote(at: number) {
    const ctx = this.ctx!;
    const step = Math.random() < 0.7 ? (Math.random() < 0.5 ? -1 : 1) : Math.random() < 0.5 ? -2 : 2;
    this.lastNote = Math.max(0, Math.min(SCALE.length - 1, this.lastNote + step));
    if (Math.random() < 0.12) this.lastNote = 4;
    const f = hz(SCALE[this.lastNote]);
    const g = ctx.createGain();
    const vel = 0.5 + Math.random() * 0.5;
    g.gain.setValueAtTime(0.0001, at);
    g.gain.exponentialRampToValueAtTime(vel, at + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, at + 2.4);
    for (const [ratio, amp] of [
      [1, 1],
      [2, 0.25],
      [3, 0.08],
    ]) {
      const o = ctx.createOscillator();
      o.type = 'sine';
      o.frequency.value = f * ratio;
      const og = ctx.createGain();
      og.gain.value = amp;
      o.connect(og).connect(g);
      o.start(at);
      o.stop(at + 2.6);
    }
    g.connect(this.layers.tune);
    g.connect(this.wet!);
  }

  /** A few quick chirps, somewhere off to one side. */
  private bird(at: number) {
    const ctx = this.ctx!;
    const n = 2 + Math.floor(Math.random() * 4);
    const base = 2600 + Math.random() * 1600;
    const pan = ctx.createStereoPanner();
    pan.pan.value = Math.random() * 1.6 - 0.8;
    pan.connect(this.layers.birds);
    for (let i = 0; i < n; i++) {
      const t0 = at + i * (0.11 + Math.random() * 0.09);
      const o = ctx.createOscillator();
      o.type = 'sine';
      o.frequency.setValueAtTime(base, t0);
      o.frequency.exponentialRampToValueAtTime(base * (1.25 + Math.random() * 0.3), t0 + 0.04);
      o.frequency.exponentialRampToValueAtTime(base * 0.9, t0 + 0.09);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(0.5, t0 + 0.012);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.1);
      o.connect(g).connect(pan);
      o.start(t0);
      o.stop(t0 + 0.12);
    }
  }

  /** Crickets: a short pulsing trill, very high and very quiet. */
  private cricket(at: number) {
    const ctx = this.ctx!;
    const o = ctx.createOscillator();
    o.type = 'sine';
    o.frequency.value = 4200 + Math.random() * 600;
    const g = ctx.createGain();
    const pulses = 6 + Math.floor(Math.random() * 6);
    g.gain.setValueAtTime(0.0001, at);
    for (let i = 0; i < pulses; i++) {
      const t0 = at + i * 0.055;
      g.gain.exponentialRampToValueAtTime(0.35, t0 + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.045);
    }
    const pan = ctx.createStereoPanner();
    pan.pan.value = Math.random() * 1.4 - 0.7;
    o.connect(g).connect(pan).connect(this.layers.crickets);
    o.start(at);
    o.stop(at + pulses * 0.055 + 0.05);
  }

  /** Two soft hoots. */
  private owl(at: number) {
    const ctx = this.ctx!;
    for (const [dt, len] of [
      [0, 0.35],
      [0.45, 0.6],
    ]) {
      const o = ctx.createOscillator();
      o.type = 'sine';
      o.frequency.setValueAtTime(420, at + dt);
      o.frequency.exponentialRampToValueAtTime(380, at + dt + len);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, at + dt);
      g.gain.exponentialRampToValueAtTime(0.6, at + dt + 0.08);
      g.gain.exponentialRampToValueAtTime(0.0001, at + dt + len);
      o.connect(g).connect(this.layers.owl);
      o.start(at + dt);
      o.stop(at + dt + len + 0.05);
    }
  }

  /** A frog's croak, or a small plop in the water. */
  private frog(at: number) {
    const ctx = this.ctx!;
    if (Math.random() < 0.4) {
      // Plop: a quick sine drop.
      const o = ctx.createOscillator();
      o.type = 'sine';
      o.frequency.setValueAtTime(700, at);
      o.frequency.exponentialRampToValueAtTime(180, at + 0.09);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, at);
      g.gain.exponentialRampToValueAtTime(0.5, at + 0.008);
      g.gain.exponentialRampToValueAtTime(0.0001, at + 0.14);
      o.connect(g).connect(this.layers.frog);
      o.start(at);
      o.stop(at + 0.16);
      return;
    }
    const o = ctx.createOscillator();
    o.type = 'sawtooth';
    const f = 120 + Math.random() * 60;
    o.frequency.setValueAtTime(f, at);
    o.frequency.linearRampToValueAtTime(f * 0.8, at + 0.3);
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 420;
    bp.Q.value = 3;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, at);
    const pulses = 5;
    for (let i = 0; i < pulses; i++) {
      g.gain.exponentialRampToValueAtTime(0.5, at + i * 0.06 + 0.015);
      g.gain.exponentialRampToValueAtTime(0.05, at + i * 0.06 + 0.055);
    }
    g.gain.exponentialRampToValueAtTime(0.0001, at + 0.36);
    o.connect(bp).connect(g).connect(this.layers.frog);
    o.start(at);
    o.stop(at + 0.4);
  }

  /** The rope swinging on the gallows: a slow stick-slip creak, with the wood answering. */
  private creak(at: number) {
    const ctx = this.ctx!;
    const o = ctx.createOscillator();
    o.type = 'sawtooth';
    const f = 70 + Math.random() * 50;
    o.frequency.setValueAtTime(f, at);
    o.frequency.exponentialRampToValueAtTime(f * (0.6 + Math.random() * 0.2), at + 0.5);
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 650 + Math.random() * 400;
    bp.Q.value = 7;
    // The creak's grain: the gain stutters.
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, at);
    const grains = 10 + Math.floor(Math.random() * 10);
    const len = 0.35 + Math.random() * 0.3;
    for (let i = 0; i < grains; i++) {
      const t0 = at + (i / grains) * len;
      const env = Math.sin((i / grains) * Math.PI);
      g.gain.exponentialRampToValueAtTime(0.1 + 0.5 * env, t0 + 0.01);
      g.gain.exponentialRampToValueAtTime(0.03, t0 + len / grains);
    }
    g.gain.exponentialRampToValueAtTime(0.0001, at + len + 0.08);
    o.connect(bp).connect(g).connect(this.layers.creak);
    o.start(at);
    o.stop(at + len + 0.1);
    // The beam, a low knock.
    const k = ctx.createOscillator();
    k.type = 'sine';
    k.frequency.setValueAtTime(140, at + len * 0.8);
    k.frequency.exponentialRampToValueAtTime(60, at + len * 0.8 + 0.12);
    const kg = ctx.createGain();
    kg.gain.setValueAtTime(0.0001, at + len * 0.8);
    kg.gain.exponentialRampToValueAtTime(0.25, at + len * 0.8 + 0.01);
    kg.gain.exponentialRampToValueAtTime(0.0001, at + len * 0.8 + 0.18);
    k.connect(kg).connect(this.layers.creak);
    k.start(at + len * 0.8);
    k.stop(at + len * 0.8 + 0.2);
  }

  /** A pop from the fire. */
  private crackle(at: number) {
    const ctx = this.ctx!;
    const src = this.noise(0.1);
    src.loop = false;
    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = 1500 + Math.random() * 2500;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, at);
    g.gain.exponentialRampToValueAtTime(0.3 + Math.random() * 0.5, at + 0.004);
    g.gain.exponentialRampToValueAtTime(0.0001, at + 0.03 + Math.random() * 0.05);
    src.connect(hp).connect(g).connect(this.layers.crackle);
    src.start(at);
    src.stop(at + 0.12);
  }

  /** Glasses meeting across the room. */
  private clink(at: number) {
    const ctx = this.ctx!;
    for (const f of [2400 + Math.random() * 600, 3600 + Math.random() * 800]) {
      const o = ctx.createOscillator();
      o.type = 'sine';
      o.frequency.value = f;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, at);
      g.gain.exponentialRampToValueAtTime(0.5, at + 0.005);
      g.gain.exponentialRampToValueAtTime(0.0001, at + 0.5);
      const pan = ctx.createStereoPanner();
      pan.pan.value = Math.random() * 1.2 - 0.6;
      o.connect(g).connect(pan).connect(this.layers.clink);
      o.start(at);
      o.stop(at + 0.55);
    }
  }
}

export const ambience = new Ambience();
