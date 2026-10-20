import { joinRoom, type Room } from 'trystero';
import { iceServers } from './peer';

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
  let room: Room;
  try {
    room = joinRoom({ ...config, password: `town-${roomCode}` }, roomCode.toLowerCase());
  } catch (e) {
    console.warn('Backup route unavailable', e);
    return null;
  }
  const action = room.makeAction<string>('msg');
  action.onMessage = (data, ctx) => {
    try {
      handlers.onMessage(JSON.parse(data), ctx.peerId);
    } catch {
      /* ignore malformed messages */
    }
  };
  room.onPeerJoin = handlers.onJoin;
  room.onPeerLeave = handlers.onLeave;
  return {
    send: (msg, peerId) => {
      action.send(JSON.stringify(msg), { target: peerId }).catch(() => {});
    },
    leave: () => {
      void room.leave();
    },
  };
}
