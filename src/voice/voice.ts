import type Peer from 'peerjs';
import type { MediaConnection } from 'peerjs';
import { create } from 'zustand';
import { local } from '../game/local';
import { loadJSON, saveJSON, debugHooks } from '../lib/util';

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
  /** How many people we're connected to by voice. */
  links: number;
  /** Voice needs the lobby server; on the backup route there's no voice. */
  available: boolean;
}

const prefs = loadJSON<{ muted?: boolean; pushToTalk?: boolean; volume?: number }>('ravenswood:voice', {});

export const useVoice = create<VoiceUI>(() => ({
  mic: 'off',
  muted: prefs.muted ?? false,
  pushToTalk: prefs.pushToTalk ?? false,
  holding: false,
  volume: prefs.volume ?? 1,
  links: 0,
  available: true,
}));

useVoice.subscribe((s, p) => {
  if (s.muted !== p.muted || s.pushToTalk !== p.pushToTalk || s.volume !== p.volume) {
    saveJSON('ravenswood:voice', { muted: s.muted, pushToTalk: s.pushToTalk, volume: s.volume });
  }
});

/** How long a line stays open after someone wanders out of range, so walking along the edge doesn't redial. */
const LINGER_MS = 12000;

export interface Listener {
  voiceId: string;
  /** 0 to 1, from distance and walls. */
  gain: number;
}

interface Link {
  call: MediaConnection;
  audio: HTMLAudioElement;
  open: boolean;
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
    if (peer === this.peer) return;
    this.closeAll();
    this.peer = peer;
    local.voiceId = peer?.id ?? null;
    if (!peer || this.answering.has(peer)) return;
    this.answering.add(peer);
    peer.on('call', (call) => {
      if (this.peer !== peer) return;
      this.links.get(call.peer)?.call.close();
      call.answer(this.stream());
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
      for (const l of this.links.values()) this.replaceTrack(l.call, track);
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
      track.addEventListener('ended', () => useVoice.setState({ mic: 'error' }));
      useVoice.setState({ mic: 'on' });
      this.applyMute();
    } catch (e) {
      const name = (e as { name?: string }).name;
      useVoice.setState({ mic: name === 'NotAllowedError' || name === 'SecurityError' ? 'denied' : 'error' });
    }
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
    if (!peer || peer.destroyed || !peer.open) return;
    const master = useVoice.getState().volume;
    this.wanted = new Map(listeners.map((l) => [l.voiceId, l.gain]));
    const now = Date.now();
    for (const { voiceId, gain } of listeners) {
      if (voiceId === peer.id) continue;
      const link = this.links.get(voiceId);
      if (link) {
        link.audio.volume = Math.max(0, Math.min(1, gain * master));
        continue;
      }
      // One side calls, so two browsers never call each other at once.
      if (peer.id > voiceId) continue;
      if (now - (this.lastTry.get(voiceId) ?? 0) < 6000) continue;
      this.lastTry.set(voiceId, now);
      try {
        const call = peer.call(voiceId, this.stream());
        if (call) this.track(call);
      } catch (e) {
        console.warn('Voice call failed', e);
      }
    }
    // People who've wandered out of range go quiet at once, and the line is hung up a little later.
    for (const [id, link] of this.links) {
      if (this.wanted.has(id)) {
        this.unwantedSince.delete(id);
        continue;
      }
      const since = this.unwantedSince.get(id) ?? now;
      this.unwantedSince.set(id, since);
      link.audio.volume = 0;
      if (now - since > LINGER_MS) {
        this.unwantedSince.delete(id);
        link.call.close();
        this.drop(id, link);
      }
    }
    useVoice.setState({ links: [...this.links.values()].filter((l) => l.open).length });
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
    const link: Link = { call, audio, open: false };
    this.links.set(id, link);
    call.on('stream', (remote) => {
      if (this.links.get(id) !== link) return;
      audio.srcObject = remote;
      audio.volume = Math.max(0, Math.min(1, (this.wanted.get(id) ?? 0) * useVoice.getState().volume));
      link.open = true;
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
