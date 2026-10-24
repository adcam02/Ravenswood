import type { Room } from 'trystero';
import { lazyModule } from '../lib/lazy';
import { iceServers } from './peer';

// Most players never need it, so Trystero (and its relays' crypto) is fetched when the route is first opened.
const trystero = lazyModule(() => import('trystero'));

/**
 * The backup route. If the PeerJS lobby server is down, browsers can still find each other through
 * a pool of public Nostr relays (via Trystero). The relays only pass along connection details,
 * encrypted with the room code; game data still travels directly between browsers.
 */
export interface Mesh {
  send: (msg: unknown, peerId: string) => void;
  leave: () => void;
}

export function meshOptions() {
  const p = new URLSearchParams(location.search);
  const relay = p.get('relay');
  return {
    disabled: p.has('nomesh'),
    config: {
      appId: 'ravenswood-town-v1',
      relayConfig: relay ? { urls: [relay], redundancy: 1 } : undefined,
      turnConfig: iceServers().filter((s) => [s.urls].flat().some((u) => u.startsWith('turn'))),
    },
  };
}

export function joinMesh(
  roomCode: string,
  handlers: {
    onJoin: (peerId: string) => void;
    onLeave: (peerId: string) => void;
    onMessage: (msg: unknown, peerId: string) => void;
  },
): Mesh | null {
  const { disabled, config } = meshOptions();
  if (disabled) return null;
  let room: Room | null = null;
  let send: ((data: string, peerId: string) => void) | null = null;
  let left = false;
  const join = ({ joinRoom }: typeof import('trystero')) => {
    if (left) return;
    try {
      room = joinRoom({ ...config, password: `town-${roomCode}` }, roomCode.toLowerCase());
    } catch (e) {
      console.warn('Backup route unavailable', e);
      return;
    }
    const act = room.makeAction<string>('msg');
    act.onMessage = (data, ctx) => {
      try {
        handlers.onMessage(JSON.parse(data), ctx.peerId);
      } catch {
        /* ignore malformed messages */
      }
    };
    send = (data, peerId) => void act.send(data, { target: peerId }).catch(() => {});
    room.onPeerJoin = handlers.onJoin;
    room.onPeerLeave = handlers.onLeave;
  };
  // (If it can't be fetched, offline say, it's tried again in a while.)
  const open = () => trystero.get().then(join, () => !left && setTimeout(open, 15000));
  void open();
  return {
    // (Nothing goes before it has arrived: there's nobody on this route to send to until then.)
    send: (msg, peerId) => send?.(JSON.stringify(msg), peerId),
    leave: () => {
      left = true;
      void room?.leave();
    },
  };
}
