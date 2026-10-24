/**
 * The Velvet Horn's jukebox: six little disco and chiptune loops, made in the browser like the night music. The song
 * on and when it started are the same for everyone (the host keeps them), so everyone in the club hears the same
 * beat at the same moment: the part of the loop playing is worked out from the clock, not from when you came in.
 */

export interface Song {
  id: string;
  name: string;
  emoji: string;
  blurb: string;
  bpm: number;
  /** One chord a bar: the root (MIDI) and the notes to stab or arpeggiate. */
  chords: [number, number[]][];
  /** The bass line over a bar of sixteenths: semitones above the chord's root an octave down, or null for a rest. */
  bass: (number | null)[];
  bassWave: OscillatorType;
  /** The tune, an eighth note a token: a note ('E5', 'C#6', 'Bb4'), '.' for a rest, '-' to hold the last note on. */
  lead: string;
  leadWave: OscillatorType;
  /** Drums over a bar of sixteenths: kick, snare (or clap), hats ('x' closed, 'o' open). */
  kick: string;
  snare: string;
  hats: string;
  /** Sixteenth-note arpeggios of the chord, quietly underneath. */
  arp?: boolean;
  /** Short chord stabs on the off-beats, disco guitar style. */
  stabs?: boolean;
  /** How far each off-beat eighth is pushed late, as a fraction of a sixteenth (a shuffle). */
  swing?: number;
  /** The club's lights for this song. */
  colors: string[];
}

const C = (root: number, ...notes: number[]): [number, number[]] => [root, notes];

export const SONGS: Song[] = [
  {
    id: 'moove',
    name: 'Moonlight Moo-ve',
    emoji: '🌙',
    blurb: 'Slinky disco strings and a bassline that won’t sit still',
    bpm: 116,
    chords: [C(48, 64, 67, 71), C(45, 64, 67, 72), C(50, 65, 69, 72), C(43, 65, 67, 71), C(48, 64, 67, 71), C(45, 64, 67, 72), C(50, 65, 69, 72), C(43, 65, 67, 71)],
    bass: [0, null, 12, null, 0, null, 12, null, 0, null, 12, null, 0, null, 12, 10],
    bassWave: 'sawtooth',
    lead: 'E5 - G5 . E5 D5 C5 - A4 . C5 E5 - D5 C5 . D5 - F5 . A5 G5 F5 - G5 . F5 E5 D5 - B4 . E5 - G5 . C6 - B5 A5 G5 - E5 . C5 . E5 G5 A5 - G5 F5 E5 . D5 . D5 E5 F5 G5 - . . .',
    leadWave: 'triangle',
    kick: 'x...x...x...x...',
    snare: '....x.......x...',
    hats: '..o...o...o...o.',
    stabs: true,
    colors: ['#ff5fa2', '#7b6cff', '#3fd6ff', '#ffd25f'],
  },
  {
    id: 'bubblegum',
    name: 'Bubblegum Bounce',
    emoji: '🍬',
    blurb: 'A pocket-sized chiptune that pops like gum',
    bpm: 128,
    chords: [C(41, 65, 69, 72), C(48, 64, 67, 72), C(50, 62, 65, 69), C(46, 62, 65, 70), C(41, 65, 69, 72), C(48, 64, 67, 72), C(50, 62, 65, 69), C(46, 62, 65, 70)],
    bass: [0, null, null, 0, null, null, 0, null, 0, null, null, 0, null, 7, null, null],
    bassWave: 'square',
    lead: 'A5 . C6 . A5 G5 F5 . G5 . E5 . C5 - . . F5 . A5 . D6 C6 A5 . Bb5 - A5 G5 F5 . G5 . A5 A5 C6 . A5 . F5 G5 E5 . G5 . C6 - . . D6 C6 A5 F5 D5 . F5 . G5 - A5 - F5 - . .',
    leadWave: 'square',
    kick: 'x...x...x...x...',
    snare: '....x.......x..x',
    hats: 'x.x.x.x.x.x.x.x.',
    arp: true,
    colors: ['#ff8ad8', '#8affd2', '#fff07a', '#9fb4ff'],
  },
  {
    id: 'froggy',
    name: 'Froggy Funk',
    emoji: '🐸',
    blurb: 'Slap bass from the bottom of the pond',
    bpm: 104,
    chords: [C(40, 62, 67, 71), C(40, 62, 67, 71), C(45, 61, 64, 67), C(45, 61, 64, 67), C(48, 64, 67, 72), C(47, 63, 66, 69), C(40, 62, 67, 71), C(40, 62, 67, 71)],
    bass: [0, null, null, 0, 12, null, 0, null, null, 0, null, 10, 12, null, 7, null],
    bassWave: 'square',
    lead: 'E5 . . G5 . A5 B5 . D6 . B5 . A5 G5 E5 . C#5 . E5 . G5 . A5 . G5 E5 . C#5 . . . . E5 . G5 . C6 . B5 A5 B5 . A5 . F#5 - D#5 . E5 G5 B5 . E6 . D6 B5 G5 . E5 . . . . .',
    leadWave: 'sawtooth',
    kick: 'x..x..x...x..x..',
    snare: '....x.......x...',
    hats: 'xxxxxxoxxxxxxxox',
    stabs: true,
    colors: ['#6dff7a', '#2fd3a0', '#d8ff5a', '#7a8cff'],
  },
  {
    id: 'strawberry',
    name: 'Strawberry Shuffle',
    emoji: '🍓',
    blurb: 'A sunny little skip in your step',
    bpm: 112,
    chords: [C(43, 67, 71, 74), C(40, 64, 67, 71), C(48, 64, 67, 72), C(50, 66, 69, 74), C(43, 67, 71, 74), C(40, 64, 67, 71), C(48, 64, 67, 72), C(50, 66, 69, 74)],
    bass: [0, null, null, null, 7, null, null, null, 12, null, null, null, 7, null, 5, null],
    bassWave: 'triangle',
    lead: 'B4 D5 G5 . G5 A5 B5 . G5 . E5 . B4 . E5 . C5 E5 G5 . A5 G5 E5 . F#5 . A5 . D6 - . . B5 A5 G5 . D5 . G5 . E5 F#5 G5 . B5 . G5 . A5 G5 E5 . C5 . E5 . D5 . F#5 . G5 - . .',
    leadWave: 'triangle',
    kick: 'x.......x.x.....',
    snare: '....x.......x...',
    hats: 'x.xxx.xxx.xxx.xx',
    swing: 0.33,
    arp: true,
    colors: ['#ff5f6d', '#ffb3c1', '#7fe08a', '#fff2a8'],
  },
  {
    id: 'roller',
    name: 'Roller Disco Stars',
    emoji: '🛼',
    blurb: 'Glitter, strings and a big four-on-the-floor',
    bpm: 122,
    chords: [C(50, 62, 65, 69), C(46, 62, 65, 70), C(48, 64, 67, 72), C(45, 61, 64, 69), C(50, 62, 65, 69), C(46, 62, 65, 70), C(48, 64, 67, 72), C(45, 61, 64, 69)],
    bass: [0, null, 12, null, 0, null, 12, null, 0, null, 12, null, 0, 12, 0, 12],
    bassWave: 'sawtooth',
    lead: 'A5 . F5 . D5 . F5 A5 Bb5 . A5 . F5 - D5 . G5 . E5 . C5 . E5 G5 A5 - C#6 . E6 - . . D6 . C6 . A5 . F5 . D6 . Bb5 . F5 . Bb5 . C6 . G5 . E5 . G5 C6 C#6 - A5 - E5 - . .',
    leadWave: 'sawtooth',
    kick: 'x...x...x...x...',
    snare: '....x.......x...',
    hats: '..x...x...x...xo',
    stabs: true,
    colors: ['#c26bff', '#ff6bd6', '#6bc9ff', '#ffffff'],
  },
  {
    id: 'hedgehog',
    name: 'Hedgehog Hustle',
    emoji: '🦔',
    blurb: 'Fast, spiky and impossible not to bop to',
    bpm: 136,
    chords: [C(45, 64, 69, 73), C(42, 61, 66, 69), C(50, 62, 66, 69), C(52, 64, 68, 71), C(45, 64, 69, 73), C(42, 61, 66, 69), C(50, 62, 66, 69), C(52, 64, 68, 71)],
    bass: [0, null, 0, 12, 0, null, 0, 12, 0, null, 0, 12, 0, null, 7, 12],
    bassWave: 'square',
    lead: 'E5 . A5 . C#6 . A5 E5 F#5 . A5 . C#6 . A5 F#5 D5 F#5 A5 . D6 . A5 . E5 G#5 B5 . E6 - . . C#6 B5 A5 . E5 . A5 . C#6 . A5 . F#5 . A5 C#6 D6 C#6 B5 A5 F#5 . A5 . B5 . G#5 . E5 - . .',
    leadWave: 'square',
    kick: 'x...x...x...x...',
    snare: '....x.......x.x.',
    hats: 'x.x.x.x.x.x.x.x.',
    arp: true,
    colors: ['#ffb347', '#ff6b6b', '#6bffb8', '#6b8bff'],
  },
];

export const songById = (id: string | null | undefined): Song => SONGS.find((s) => s.id === id) ?? SONGS[0];

const hz = (midi: number) => 440 * 2 ** ((midi - 69) / 12);
const NOTE: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
/** 'C#6' → 85. */
function midiOf(name: string): number | null {
  const m = /^([A-G])([#b]?)(\d)$/.exec(name);
  if (!m) return null;
  return NOTE[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0) + (Number(m[3]) + 1) * 12;
}

/** A song's tune as notes on the eighth-note grid: where each starts and how many eighths it lasts. */
function parseLead(s: string): { at: number; midi: number; len: number }[] {
  const out: { at: number; midi: number; len: number }[] = [];
  s.trim()
    .split(/\s+/)
    .forEach((tok, i) => {
      if (tok === '-') {
        if (out.length) out[out.length - 1].len += 1;
        return;
      }
      const midi = midiOf(tok);
      if (midi !== null) out.push({ at: i, midi, len: 1 });
    });
  return out;
}

/** Sixteenths in a bar. */
const STEPS = 16;
/** How far ahead notes are put in the audio clock. */
const AHEAD = 0.25;

class ClubMusic {
  private ctx: AudioContext | null = null;
  private out: GainNode | null = null;
  private muffle: BiquadFilterNode | null = null;
  private noise: AudioBuffer | null = null;
  private timer: ReturnType<typeof setInterval> | null = null;
  private song: Song = SONGS[0];
  private leadNotes = parseLead(SONGS[0].lead);
  /** When the song started, on this browser's clock (ms). */
  private at = 0;
  /** The next sixteenth to schedule, counted from `at`. */
  private next = 0;
  /** This browser's clock (ms) at audio-clock zero, so the two can be matched without jitter. */
  private base: number | null = null;
  private level = 0;
  private muffled = false;

  /** What's on, for the jukebox and the tests. */
  get state() {
    return { song: this.song.id, level: this.level, muffled: this.muffled, playing: this.timer !== null };
  }

  /** The song on and when it started (this browser's clock, ms). A change starts it from the right place in the loop. */
  setSong(id: string, at: number) {
    const song = songById(id);
    if (song === this.song && at === this.at) return;
    this.song = song;
    this.leadNotes = parseLead(song.lead);
    this.at = at;
    this.next = -1;
  }

  /**
   * How loud: 1 on the dance floor, a little outside the door, 0 out of earshot. Muffled, it's heard through a
   * wall: the bass and the kick, and not much else.
   */
  setLevel(level: number, muffled: boolean) {
    const v = Math.max(0, Math.min(1, level));
    if (Math.abs(v - this.level) < 0.01 && muffled === this.muffled) return;
    this.level = v;
    this.muffled = muffled;
    if (v > 0 && !this.timer) this.start();
    if (!this.ctx || !this.out || !this.muffle) return;
    const now = this.ctx.currentTime;
    this.out.gain.setTargetAtTime(v * 0.42, now, 0.15);
    this.muffle.frequency.setTargetAtTime(muffled ? 520 : 16000, now, 0.12);
    if (v === 0) this.stop();
  }

  private start() {
    let ctx: AudioContext;
    try {
      ctx = this.ctx ??= new AudioContext();
      void ctx.resume();
    } catch {
      return; // no sound on this device
    }
    if (!this.out) {
      this.muffle = ctx.createBiquadFilter();
      this.muffle.type = 'lowpass';
      this.muffle.frequency.value = 16000;
      this.out = ctx.createGain();
      this.out.gain.value = 0;
      this.out.connect(this.muffle).connect(ctx.destination);
      const len = Math.floor(ctx.sampleRate * 0.4);
      this.noise = ctx.createBuffer(1, len, ctx.sampleRate);
      const d = this.noise.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    }
    this.next = -1;
    this.base = null;
    this.timer = setInterval(() => this.schedule(), 50);
  }

  private stop() {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
  }

  private schedule() {
    const ctx = this.ctx;
    if (!ctx || ctx.state !== 'running') {
      void ctx?.resume();
      return;
    }
    // Where this browser's clock is on the audio clock, kept steady unless the two drift apart.
    const wallNow = Date.now();
    const guess = wallNow - ctx.currentTime * 1000;
    if (this.base === null || Math.abs(guess - this.base) > 40) {
      this.base = guess;
      this.next = -1;
    }
    const s = this.song;
    const step = 60000 / s.bpm / 4;
    if (this.next < 0) this.next = Math.ceil((wallNow + 30 - this.at) / step);
    const until = wallNow + AHEAD * 1000;
    for (let guard = 0; guard < 64; guard++) {
      const wall = this.at + this.next * step;
      if (wall > until) break;
      // (Late by more than a moment, as after a stall: skip ahead rather than play a pile-up.)
      if (wall >= wallNow - 20) this.play(this.next, (wall - this.base) / 1000, step / 1000);
      this.next += 1;
    }
  }

  private play(n: number, when: number, step: number) {
    const s = this.song;
    const bars = s.chords.length;
    const k = ((n % (bars * STEPS)) + bars * STEPS) % (bars * STEPS);
    const bar = Math.floor(k / STEPS);
    const i = k % STEPS;
    const swing = s.swing && i % 4 === 2 ? s.swing * step : 0;
    const t = Math.max(when + swing, this.ctx!.currentTime);
    const [root, notes] = s.chords[bar];
    if (s.kick[i] === 'x') this.kick(t);
    if (s.snare[i] === 'x') this.snare(t);
    if (s.hats[i] === 'x' || s.hats[i] === 'o') this.hat(t, s.hats[i] === 'o');
    const b = s.bass[i];
    if (b !== null && b !== undefined) this.tone(s.bassWave, root - 12 + b, t, step * 1.6, 0.16, 900);
    if (s.arp) this.tone('triangle', notes[i % notes.length] + 12, t, step * 0.9, 0.035, 6000);
    if (s.stabs && (i === 2 || i === 6 || i === 10 || i === 14)) for (const m of notes) this.tone('square', m, t, step * 0.6, 0.022, 2400);
    // The tune is on the eighth-note grid.
    if (i % 2 === 0) {
      const eighth = bar * 8 + i / 2;
      const note = this.leadNotes.find((x) => x.at === eighth);
      if (note) this.tone(s.leadWave, note.midi, t, note.len * step * 2 * 0.92, s.leadWave === 'triangle' ? 0.11 : 0.055, s.leadWave === 'sawtooth' ? 2600 : 7000, true);
    }
  }

  private tone(wave: OscillatorType, midi: number, at: number, len: number, vol: number, cutoff: number, lead = false) {
    const ctx = this.ctx!;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, at);
    g.gain.exponentialRampToValueAtTime(vol, at + 0.008);
    g.gain.setValueAtTime(vol * 0.8, at + Math.max(0.01, len - 0.04));
    g.gain.exponentialRampToValueAtTime(0.0001, at + len + 0.06);
    const f = ctx.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.value = cutoff;
    f.connect(g).connect(this.out!);
    const o = ctx.createOscillator();
    o.type = wave;
    o.frequency.value = hz(midi);
    o.connect(f);
    o.start(at);
    o.stop(at + len + 0.1);
    // The tune gets a second voice a touch out of tune, for a fatter, friendlier sound.
    if (lead) {
      const o2 = ctx.createOscillator();
      o2.type = wave;
      o2.frequency.value = hz(midi);
      o2.detune.value = 9;
      o2.connect(f);
      o2.start(at);
      o2.stop(at + len + 0.1);
    }
  }

  private kick(at: number) {
    const ctx = this.ctx!;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.frequency.setValueAtTime(150, at);
    o.frequency.exponentialRampToValueAtTime(45, at + 0.12);
    g.gain.setValueAtTime(0.0001, at);
    g.gain.exponentialRampToValueAtTime(0.5, at + 0.004);
    g.gain.exponentialRampToValueAtTime(0.0001, at + 0.28);
    o.connect(g).connect(this.out!);
    o.start(at);
    o.stop(at + 0.3);
  }

  private burst(at: number, len: number, vol: number, type: BiquadFilterType, freq: number) {
    const ctx = this.ctx!;
    const src = ctx.createBufferSource();
    src.buffer = this.noise;
    const f = ctx.createBiquadFilter();
    f.type = type;
    f.frequency.value = freq;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, at);
    g.gain.exponentialRampToValueAtTime(vol, at + 0.003);
    g.gain.exponentialRampToValueAtTime(0.0001, at + len);
    src.connect(f).connect(g).connect(this.out!);
    src.start(at, Math.random() * 0.2);
    src.stop(at + len + 0.02);
  }

  private snare(at: number) {
    this.burst(at, 0.16, 0.22, 'bandpass', 1900);
    this.burst(at + 0.012, 0.1, 0.12, 'bandpass', 1300);
  }

  private hat(at: number, open: boolean) {
    this.burst(at, open ? 0.2 : 0.045, open ? 0.06 : 0.05, 'highpass', 7500);
  }
}

export const clubMusic = new ClubMusic();
