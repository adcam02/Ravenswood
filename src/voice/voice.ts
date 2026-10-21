import type Peer from 'peerjs';
import type { MediaConnection } from 'peerjs';
import { create } from 'zustand';
import { local } from '../game/local';
import { botMode, loadJSON, saveJSON, debugHooks } from '../lib/util';

/** A test stand-in (?debug&bot) takes no calls: a dozen of them on one machine would spend it all on audio. */
const QUIET = botMode();

export type MicState = 'off' | 'asking' | 'on' | 'denied' | 'error';

interface VoiceUI {
  mic: MicState;
  muted: boolean;
  /** Hold V to talk, instead of an open mic. */
  pushToTalk: boolean;
  /** V is held down. */
  holding: boolean;
  /** How loud everyone else is, 0 to 1. */
  volume: number;
  /** How loud each person is, 0 to 1, by seat id ('st' for the Storyteller); anyone not here is at full. */
  people: Record<string, number>;
  /** How many people we're connected to by voice. */
  links: number;
  /** Voice needs the lobby server; on the backup route there's no voice. */
  available: boolean;
}

const prefs = loadJSON<{ muted?: boolean; pushToTalk?: boolean; volume?: number; people?: Record<string, number> }>('ravenswood:voice', {});

export const useVoice = create<VoiceUI>(() => ({
  mic: 'off',
  muted: prefs.muted ?? false,
  pushToTalk: prefs.pushToTalk ?? false,
  holding: false,
  volume: prefs.volume ?? 1,
  people: prefs.people ?? {},
  links: 0,
  available: true,
}));

useVoice.subscribe((s, p) => {
  if (s.muted !== p.muted || s.pushToTalk !== p.pushToTalk || s.volume !== p.volume || s.people !== p.people) {
    saveJSON('ravenswood:voice', { muted: s.muted, pushToTalk: s.pushToTalk, volume: s.volume, people: s.people });
  }
});

/**
 * How long a line stays open after someone wanders out of range. An idle line carries nothing (neither side sends
 * once out of earshot), so it's kept a good while: walking back into range, or the next meeting, is then instant,
 * rather than every browser dialling every other at once whenever the bell rings.
 */
const LINGER_MS = 120000;
/** At most this many lines open at once; past it, the ones idle longest are hung up first. */
const MAX_LINES = 30;
/** New calls started per sync (five a second): a meeting's worth of calls goes out over a couple of seconds, not in one burst. */
const NEW_CALLS_PER_SYNC = 2;

/** Opus bitrates, in bits per second: plenty for speech, and lower once a crowd is on the line. */
const BITRATE = 24000;
const CROWD_BITRATE = 16000;
const CROWD = 6;

/**
 * Tunes the Opus audio in a call's SDP: mono speech at a modest bitrate, and DTX (discontinuous
 * transmission), so a quiet mic sends almost nothing. With everyone connected to everyone, that is
 * most of the voice bandwidth saved: only the people actually talking cost anything.
 */
export function tuneOpus(sdp: string): string {
  const pts = [...sdp.matchAll(/^a=rtpmap:(\d+) opus\/48000/gim)].map((m) => m[1]);
  if (!pts.length) return sdp;
  const want: Record<string, string> = { usedtx: '1', maxaveragebitrate: String(BITRATE), stereo: '0', 'sprop-stereo': '0', useinbandfec: '1' };
  const lines = sdp.split(/\r?\n/);
  for (const pt of pts) {
    const i = lines.findIndex((l) => l.startsWith(`a=fmtp:${pt} `));
    if (i >= 0) {
      const params = Object.fromEntries(
        lines[i]
          .slice(`a=fmtp:${pt} `.length)
          .split(';')
          .map((kv) => kv.trim().split('=') as [string, string])
          .filter(([k]) => k),
      );
      Object.assign(params, want);
      lines[i] = `a=fmtp:${pt} ${Object.entries(params).map(([k, v]) => `${k}=${v}`).join(';')}`;
    } else {
      const at = lines.findIndex((l) => l.startsWith(`a=rtpmap:${pt} `));
      lines.splice(at + 1, 0, `a=fmtp:${pt} ${Object.entries(want).map(([k, v]) => `${k}=${v}`).join(';')}`);
    }
  }
  return lines.join('\r\n');
}

export interface Listener {
  voiceId: string;
  /** 0 to 1, from distance and walls. */
  gain: number;
  /** Who it is (a seat id, or 'st'), for their own volume. */
  key: string;
}

/** Sets how loud one person is for us (1 is as they come). */
export function setPersonVolume(key: string, level: number) {
  useVoice.setState((s) => {
    const people = { ...s.people };
    if (level >= 0.999) delete people[key];
    else people[key] = Math.max(0, level);
    return { people };
  });
}

interface Link {
  call: MediaConnection;
  audio: HTMLAudioElement;
  open: boolean;
  /** Whether we're sending our voice down this line (not while it only lingers out of earshot). */
  sending: boolean;
}

/**
 * Proximity voice. Every browser connects straight to every other one (through the same PeerJS lobby the
 * game uses) and sets each person's volume from how far away they are. Remote voices play through
 * ordinary audio elements, so the browser's echo cancellation keeps working.
 */
class Voice {
  private peer: Peer | null = null;
  private links = new Map<string, Link>();
  private lastTry = new Map<string, number>();
  private ctx: AudioContext | null = null;
  private silent: MediaStreamTrack | null = null;
  private mic: MediaStream | null = null;
  private analyser: AnalyserNode | null = null;
  private levels: Float32Array<ArrayBuffer> | null = null;
  private loudUntil = 0;
  private sendStream: MediaStream | null = null;
  private wanted = new Map<string, number>();
  /** When a line stopped being wanted: it stays open, silent, for a while in case they come back. */
  private unwantedSince = new Map<string, number>();
  private answering = new WeakSet<Peer>();

  /** Starts answering calls on this peer. Safe to call again with the same or a new peer. */
  attach(peer: Peer | null) {
    useVoice.setState({ available: Boolean(peer) });
    if (peer === this.peer) {
      // (PeerJS forgets the id while the lobby is away; it's the same one when it comes back.)
      if (peer?.id) local.voiceId = peer.id;
      return;
    }
    this.closeAll();
    this.peer = peer;
    local.voiceId = peer?.id ?? null;
    if (!peer || this.answering.has(peer)) return;
    this.answering.add(peer);
    peer.on('call', (call) => {
      if (this.peer !== peer) return;
      if (QUIET) {
        call.close();
        return;
      }
      this.links.get(call.peer)?.call.close();
      call.answer(this.stream(), { sdpTransform: tuneOpus });
      this.track(call);
    });
  }

  /** Must be called from a click: browsers only allow audio after one. */
  unlock() {
    try {
      this.ctx ??= new AudioContext();
      void this.ctx.resume();
    } catch {
      /* no audio */
    }
    for (const l of this.links.values()) void l.audio.play().catch(() => {});
  }

  async enableMic() {
    if (this.mic) return;
    this.unlock();
    useVoice.setState({ mic: 'asking' });
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      });
      this.mic = stream;
      const track = stream.getAudioTracks()[0];
      for (const l of this.links.values()) if (l.sending) this.replaceTrack(l.call, track);
      if (this.sendStream) {
        for (const t of this.sendStream.getAudioTracks()) this.sendStream.removeTrack(t);
        this.sendStream.addTrack(track);
      }
      if (this.ctx) {
        const src = this.ctx.createMediaStreamSource(stream);
        this.analyser = this.ctx.createAnalyser();
        this.analyser.fftSize = 512;
        this.levels = new Float32Array(this.analyser.fftSize);
        src.connect(this.analyser);
      }
      track.addEventListener('ended', () => this.micLost(stream));
      useVoice.setState({ mic: 'on' });
      this.applyMute();
    } catch (e) {
      const name = (e as { name?: string }).name;
      useVoice.setState({ mic: name === 'NotAllowedError' || name === 'SecurityError' ? 'denied' : 'error' });
    }
  }

  /**
   * The mic went away (a headset unplugged or switched off, the laptop slept): calls go back to carrying silence,
   * and pressing the mic button asks for it afresh.
   */
  private micLost(stream: MediaStream) {
    if (this.mic !== stream) return;
    this.mic = null;
    this.analyser = null;
    this.levels = null;
    const silent = this.silentTrack();
    if (this.sendStream) {
      for (const t of this.sendStream.getAudioTracks()) this.sendStream.removeTrack(t);
      if (silent) this.sendStream.addTrack(silent);
    }
    if (silent) for (const l of this.links.values()) if (l.sending) this.replaceTrack(l.call, silent);
    useVoice.setState({ mic: 'error' });
  }

  setMuted(muted: boolean) {
    useVoice.setState({ muted });
    this.applyMute();
  }

  setHolding(holding: boolean) {
    if (useVoice.getState().holding === holding) return;
    useVoice.setState({ holding });
    this.applyMute();
  }

  setPushToTalk(on: boolean) {
    useVoice.setState({ pushToTalk: on, holding: false });
    this.applyMute();
  }

  /** True while our own mic is actually sending. */
  get live(): boolean {
    const s = useVoice.getState();
    return Boolean(this.mic) && !s.muted && (!s.pushToTalk || s.holding);
  }

  private applyMute() {
    const live = this.live;
    for (const t of this.mic?.getAudioTracks() ?? []) t.enabled = live;
  }

  /** Whether we're making noise right now, for the little speaking ring. */
  speaking(): boolean {
    if (!this.live || !this.analyser || !this.levels) return false;
    this.analyser.getFloatTimeDomainData(this.levels);
    let sum = 0;
    for (const v of this.levels) sum += v * v;
    const rms = Math.sqrt(sum / this.levels.length);
    const now = performance.now();
    if (rms > 0.02) this.loudUntil = now + 280;
    return now < this.loudUntil;
  }

  /**
   * Called a few times a second with everyone we could hear and how loudly. Connects to new people,
   * drops people who've gone, and sets each voice's volume.
   */
  sync(listeners: Listener[]) {
    const peer = this.peer;
    if (!peer || peer.destroyed) return;
    if (QUIET) listeners = [];
    // Without the lobby (a brief blip) open calls carry on and keep their volumes, but new ones can't be made.
    const canCall = peer.open;
    const { volume: master, people } = useVoice.getState();
    // Each voice's own level is part of how loud it plays.
    const level = (l: Listener) => l.gain * (people[l.key] ?? 1);
    this.wanted = new Map(listeners.map((l) => [l.voiceId, level(l)]));
    const now = Date.now();
    let dialled = 0;
    // The loudest (nearest) first, so the people right beside us connect before those across the square.
    for (const l of [...listeners].sort((a, b) => level(b) - level(a))) {
      const { voiceId } = l;
      const gain = level(l);
      if (voiceId === peer.id) continue;
      const link = this.links.get(voiceId);
      if (link) {
        link.audio.volume = Math.max(0, Math.min(1, gain * master));
        this.setSending(link, true);
        continue;
      }
      // One side calls, so two browsers never call each other at once.
      if (!canCall || peer.id > voiceId) continue;
      if (dialled >= NEW_CALLS_PER_SYNC) continue;
      if (now - (this.lastTry.get(voiceId) ?? 0) < 6000) continue;
      dialled += 1;
      this.lastTry.set(voiceId, now);
      try {
        const call = peer.call(voiceId, this.stream(), { sdpTransform: tuneOpus });
        if (call) this.track(call);
      } catch (e) {
        console.warn('Voice call failed', e);
      }
    }
    // People who've wandered out of range go quiet at once (and stop getting our voice), and the line is
    // hung up later (sooner if there are too many open).
    const idle: [string, number][] = [];
    for (const [id, link] of this.links) {
      if (this.wanted.has(id)) {
        this.unwantedSince.delete(id);
        continue;
      }
      const since = this.unwantedSince.get(id) ?? now;
      this.unwantedSince.set(id, since);
      link.audio.volume = 0;
      this.setSending(link, false);
      idle.push([id, since]);
    }
    let spare = this.links.size - MAX_LINES;
    for (const [id, since] of idle.sort((a, b) => a[1] - b[1])) {
      if (now - since <= LINGER_MS && spare <= 0) break;
      spare -= 1;
      const link = this.links.get(id)!;
      this.unwantedSince.delete(id);
      link.call.close();
      this.drop(id, link);
    }
    this.capBitrate();
    useVoice.setState({ links: [...this.links.values()].filter((l) => l.open).length });
  }

  /** Sends our voice down a line, or stops (the line stays open, carrying nothing). */
  private setSending(link: Link, on: boolean) {
    if (link.sending === on) return;
    link.sending = on;
    const pc = link.call.peerConnection;
    if (!pc) return;
    const track = on ? (this.stream().getAudioTracks()[0] ?? null) : null;
    for (const sender of pc.getSenders()) {
      if (!sender.track || sender.track.kind === 'audio') void sender.replaceTrack(track).catch(() => {});
    }
  }

  private bitrateCap = 0;
  /** With a crowd in earshot (a town meeting), each voice is sent a little smaller. Idle lines don't count. */
  private capBitrate() {
    const heard = [...this.links.keys()].filter((id) => this.wanted.has(id)).length;
    const cap = heard > CROWD ? CROWD_BITRATE : BITRATE;
    if (cap === this.bitrateCap) return;
    this.bitrateCap = cap;
    for (const link of this.links.values()) this.applyBitrate(link, cap);
  }

  private applyBitrate(link: Link, cap: number) {
    const pc = link.call.peerConnection;
    if (!pc) return;
    for (const sender of pc.getSenders()) {
      if (sender.track && sender.track.kind !== 'audio') continue;
      try {
        const params = sender.getParameters();
        if (!params.encodings?.length) continue;
        params.encodings[0].maxBitrate = cap;
        void sender.setParameters(params).catch(() => {});
      } catch {
        /* not supported here */
      }
    }
  }

  private stream(): MediaStream {
    if (this.sendStream) return this.sendStream;
    const track = this.mic?.getAudioTracks()[0] ?? this.silentTrack();
    this.sendStream = new MediaStream(track ? [track] : []);
    return this.sendStream;
  }

  /** Until the mic is on, calls carry silence, so people can still listen. */
  private silentTrack(): MediaStreamTrack | null {
    if (this.silent) return this.silent;
    try {
      this.ctx ??= new AudioContext();
      const dest = this.ctx.createMediaStreamDestination();
      this.silent = dest.stream.getAudioTracks()[0] ?? null;
    } catch {
      this.silent = null;
    }
    return this.silent;
  }

  private replaceTrack(call: MediaConnection, track: MediaStreamTrack) {
    const pc = call.peerConnection;
    if (!pc) return;
    for (const sender of pc.getSenders()) {
      if (!sender.track || sender.track.kind === 'audio') void sender.replaceTrack(track).catch(() => {});
    }
  }

  private track(call: MediaConnection) {
    const id = call.peer;
    const audio = new Audio();
    audio.autoplay = true;
    const link: Link = { call, audio, open: false, sending: true };
    this.links.set(id, link);
    call.on('stream', (remote) => {
      if (this.links.get(id) !== link) return;
      audio.srcObject = remote;
      audio.volume = Math.max(0, Math.min(1, (this.wanted.get(id) ?? 0) * useVoice.getState().volume));
      link.open = true;
      if (this.bitrateCap) this.applyBitrate(link, this.bitrateCap);
      void audio.play().catch(() => {});
    });
    const lost = () => this.drop(id, link);
    call.on('close', lost);
    call.on('error', lost);
    // Media connections don't always report a dead line, so watch the connection itself too.
    const watch = setInterval(() => {
      if (this.links.get(id) !== link) return clearInterval(watch);
      const state = call.peerConnection?.iceConnectionState;
      if (state === 'failed' || state === 'closed') {
        call.close();
        lost();
      }
    }, 3000);
  }

  private drop(id: string, link: Link) {
    if (this.links.get(id) !== link) return;
    this.links.delete(id);
    link.audio.srcObject = null;
    link.audio.remove();
    this.lastTry.set(id, Date.now() - 3000);
  }

  private closeAll() {
    for (const [id, l] of this.links) {
      l.call.close();
      this.drop(id, l);
    }
  }
}

export const voice = new Voice();

if (debugHooks()) {
  Object.assign(window, {
    __voice: voice,
    __voiceLinks: () => [...(voice as unknown as { links: Map<string, Link> }).links].map(([id, l]) => ({ id, volume: l.audio.volume, open: l.open })),
  });
}
