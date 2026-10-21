import type { PeerOptions } from 'peerjs';

declare global {
  interface Window {
    RAVENSWOOD_CONFIG?: { peer?: Partial<PeerOptions> | null; relay?: RTCIceServer[] | null };
  }
}

/**
 * How browsers reach each other. Direct first (STUN), then through a relay (TURN) when a network won't
 * allow a direct line. A relay of your own in config.js comes first; the free shared PeerJS relay is the
 * fallback.
 */
export function iceServers(): RTCIceServer[] {
  const own = window.RAVENSWOOD_CONFIG?.relay ?? [];
  return [
    ...own,
    { urls: ['stun:stun.l.google.com:19302', 'stun:stun1.l.google.com:19302', 'stun:stun.cloudflare.com:3478'] },
    { urls: ['turn:eu-0.turn.peerjs.com:3478', 'turn:us-0.turn.peerjs.com:3478'], username: 'peerjs', credential: 'peerjsp' },
  ];
}

/** Every room shares the public PeerJS server, so room ids carry a prefix of their own. */
export function hostPeerId(room: string): string {
  return `ravenswood-town-${room.toLowerCase()}`;
}

export function peerOptions(): PeerOptions {
  // ?peer=localhost:9000 points at a local PeerServer, for testing.
  const local = new URLSearchParams(location.search).get('peer');
  if (local) {
    const [host, port] = local.split(':');
    return { host, port: Number(port) || 9000, path: '/', secure: false, debug: 1 };
  }
  return { ...(window.RAVENSWOOD_CONFIG?.peer ?? {}), config: { iceServers: iceServers() }, debug: 1 };
}

/** ?nopeer skips the PeerJS route, to test the backup route. */
export function peerDisabled(): boolean {
  return new URLSearchParams(location.search).has('nopeer');
}

export type LinkStatus = 'starting' | 'open' | 'reconnecting' | 'waiting' | 'error';

/**
 * Whether a PeerJS channel's connection itself is still up (its WebRTC link connected and the data channel open),
 * as opposed to merely quiet. A busy page can go quiet for a while; that's no reason to tear down a healthy link.
 */
export function linkAlive(conn: { peerConnection?: RTCPeerConnection | null; dataChannel?: RTCDataChannel | null } | null | undefined): boolean {
  const pc = conn?.peerConnection;
  const state = pc?.connectionState ?? pc?.iceConnectionState;
  return conn?.dataChannel?.readyState === 'open' && (state === 'connected' || state === 'completed');
}
