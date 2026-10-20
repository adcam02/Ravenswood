import Peer, { type DataConnection } from 'peerjs';
import { create } from 'zustand';
import { setCustomRoles } from '../data';
import { loadJSON, saveJSON, uid, debugHooks } from '../lib/util';
import type { ClientMessage, HostMessage, PrivateState, PublicState, TownAction } from '../state/types';
import { receiveItem } from '../game/local';
import { game } from '../game/hud';
import { presence } from '../game/presence';
import type { Item, Look, Pose } from '../world/types';
import { joinMesh, type Mesh } from './mesh';
import { hostPeerId, peerDisabled, peerOptions, type LinkStatus } from './peer';

interface ClientState {
  status: LinkStatus;
  pub: PublicState | null;
  priv: PrivateState | null;
  /** The Storyteller's clock minus ours, to keep a shared video in step. */
  clockOffset: number;
  /** The Storyteller's page is an older version than this one, so newer features won't work. */
  hostOutdated: boolean;
}

export const useClient = create<ClientState>(() => ({ status: 'starting', pub: null, priv: null, clockOffset: 0, hostOutdated: false }));

/** The host's last "that animal is taken" answer, for the picker to react to. */
export const useTaken = create<{ animal: string | null; by: string; at: number }>(() => ({ animal: null, by: '', at: 0 }));

export function playerId(): string {
  let id = loadJSON<string | null>('ravenswood:player-id', null);
  if (!id) {
    id = uid();
    saveJSON('ravenswood:player-id', id);
  }
  return id;
}

const RETRYABLE = new Set(['network', 'server-error', 'socket-error', 'socket-closed', 'disconnected']);
/** How long to wait on the main route before also trying the backup route. */
const BACKUP_AFTER_MS = 6000;

class ClientLink {
  private peer: Peer | null = null;
  private conn: DataConnection | null = null;
  private mesh: Mesh | null = null;
  private meshHost: string | null = null;
  private room = '';
  private lastPong = 0;
  private downSince = Date.now();
  /** What the main route is doing, when it isn't connected. */
  private peerState: LinkStatus = 'starting';
  private connectTimer: ReturnType<typeof setTimeout> | null = null;

  /** The lobby connection, which also carries voice. */
  get peerRef(): Peer | null {
    return this.peer && this.peer.open && !this.peer.destroyed ? this.peer : null;
  }

  start(room: string) {
    if (this.room === room) return;
    this.room = room;
    if (peerDisabled()) this.ensureMesh();
    else this.openPeer();
    setInterval(() => this.tick(), 2000);
  }

  private setPeerState(s: LinkStatus) {
    this.peerState = s;
    this.refresh();
  }

  private refresh() {
    const open = Boolean(this.conn?.open || this.meshHost);
    if (open) this.downSince = 0;
    else if (!this.downSince) this.downSince = Date.now();
    useClient.setState({ status: open ? 'open' : this.peerState === 'open' ? 'reconnecting' : this.peerState });
  }

  // ---------------------------------------------------------------- PeerJS, the main route

  private openPeer() {
    this.peer?.destroy();
    this.setPeerState('starting');
    const peer = new Peer(peerOptions());
    this.peer = peer;
    peer.on('open', () => this.connect());
    peer.on('disconnected', () => {
      if (this.peer !== peer || peer.destroyed) return;
      setTimeout(() => !peer.destroyed && peer.disconnected && peer.reconnect(), 1500);
    });
    peer.on('error', (err) => {
      if (this.peer !== peer) return;
      const type = (err as { type?: string }).type ?? '';
      if (type === 'peer-unavailable') {
        this.setPeerState('waiting');
        this.later(() => this.connect(), 3000);
      } else if (RETRYABLE.has(type)) {
        this.setPeerState('reconnecting');
        this.later(() => this.openPeer(), 4000);
      } else {
        console.warn('Peer error', type, err);
      }
    });
  }

  private later(fn: () => void, ms: number) {
    if (this.connectTimer) clearTimeout(this.connectTimer);
    this.connectTimer = setTimeout(fn, ms);
  }

  private connect() {
    const peer = this.peer;
    if (!peer || peer.destroyed || !peer.open) return;
    this.conn?.close();
    const conn = peer.connect(hostPeerId(this.room), { reliable: true, serialization: 'json' });
    this.conn = conn;
    // If the channel never opens (blocked network, stale room), try again.
    this.later(() => {
      if (this.conn === conn && !conn.open) this.connect();
    }, 12000);
    conn.on('open', () => {
      if (this.conn !== conn) return;
      this.lastPong = Date.now();
      this.setPeerState('open');
      conn.send({ t: 'hello', playerId: playerId(), v: __BUILD__ } satisfies ClientMessage);
    });
    conn.on('data', (raw) => {
      if (this.conn !== conn) return;
      this.lastPong = Date.now();
      this.receive(raw as HostMessage);
    });
    const lost = () => {
      if (this.conn !== conn) return;
      this.conn = null;
      this.setPeerState('reconnecting');
      this.later(() => this.connect(), 2000);
    };
    conn.on('close', lost);
    conn.on('error', lost);
  }

  // ---------------------------------------------------------------- Trystero, the backup route

  private ensureMesh() {
    if (this.mesh) return;
    this.mesh = joinMesh(this.room, {
      onJoin: () => {},
      onLeave: (peerId) => {
        if (peerId !== this.meshHost) return;
        this.meshHost = null;
        this.refresh();
      },
      onMessage: (raw, peerId) => {
        const msg = raw as HostMessage;
        if (msg.t === 'host') {
          this.meshHost = peerId;
          this.mesh?.send({ t: 'hello', playerId: playerId(), v: __BUILD__ } satisfies ClientMessage, peerId);
          this.refresh();
          return;
        }
        if (peerId === this.meshHost) this.receive(msg);
      },
    });
  }

  // ---------------------------------------------------------------- shared

  private tick() {
    const conn = this.conn;
    if (conn?.open) {
      if (Date.now() - this.lastPong > 15000) {
        conn.close();
        this.conn = null;
        this.setPeerState('reconnecting');
        this.connect();
      } else conn.send({ t: 'ping' } satisfies ClientMessage);
    }
    if (this.downSince && Date.now() - this.downSince > BACKUP_AFTER_MS) this.ensureMesh();
  }

  private receive(msg: HostMessage) {
    if (msg.t === 'state') {
      setCustomRoles(msg.s.script.custom);
      useClient.setState({
        pub: msg.s,
        clockOffset: msg.now ? msg.now - Date.now() : useClient.getState().clockOffset,
        hostOutdated: !msg.v || msg.v < __BUILD__,
      });
    } else if (msg.t === 'private') {
      useClient.setState({ priv: msg.p });
    } else if (msg.t === 'world') {
      presence.replace(msg.a ?? {}, useClient.getState().priv?.seatId ?? null);
      presence.announce = Boolean(msg.ann);
    } else if (msg.t === 'gift') {
      if (msg.item && typeof msg.item.k === 'string') receiveItem(msg.item, msg.from ?? null);
    } else if (msg.t === 'taken') {
      if (typeof msg.animal === 'string') useTaken.setState({ animal: msg.animal, by: String(msg.by ?? 'Someone'), at: Date.now() });
    } else if (msg.t === 'summon') {
      if (typeof msg.zone === 'string' && Number.isFinite(msg.x) && Number.isFinite(msg.z)) game.summoned(msg.zone, msg.x, msg.z);
    }
  }

  send(msg: ClientMessage) {
    try {
      if (this.conn?.open) {
        this.conn.send(msg);
        return true;
      }
      if (this.mesh && this.meshHost) {
        this.mesh.send(msg, this.meshHost);
        return true;
      }
    } catch {
      /* fall through */
    }
    return false;
  }
}

export const clientLink = new ClientLink();

if (debugHooks()) (window as unknown as { __client: typeof useClient }).__client = useClient;

export const player = {
  join: (name: string, look: Look) => clientLink.send({ t: 'join', name, look }),
  /** Holds an animal while looking at it in the picker, so nobody else takes it (null lets go). */
  hold: (name: string, animal: string | null) => clientLink.send({ t: 'hold', name, animal }),
  pose: (p: Pose) => clientLink.send({ t: 'pose', p }),
  town: (a: TownAction) => clientLink.send({ t: 'town', a }),
  give: (to: string, item: Item) => clientLink.send({ t: 'give', to, item }),
  leave: () => clientLink.send({ t: 'leave' }),
  rename: (name: string) => clientLink.send({ t: 'rename', name }),
  vote: (up: boolean) => clientLink.send({ t: 'vote', up }),
  ack: (wakeId: string) => clientLink.send({ t: 'ack', wakeId }),
  reply: (wakeId: string, r: { seatIds?: string[]; roleIds?: string[]; answer?: boolean }) =>
    clientLink.send({ t: 'reply', wakeId, ...r }),
};
