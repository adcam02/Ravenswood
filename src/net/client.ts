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
import { hostPeerId, linkAlive, peerDisabled, peerOptions, type LinkStatus } from './peer';
import { reportTo } from '../lib/report';

interface ClientState {
  status: LinkStatus;
  pub: PublicState | null;
  priv: PrivateState | null;
  /** The Storyteller's clock minus ours, to keep a shared video in step. */
  clockOffset: number;
  /** The Storyteller's page is an older version than this one, so newer features won't work. */
  hostOutdated: boolean;
  /** How long a message takes there and back to the Storyteller (milliseconds, smoothed), once known. */
  rtt: number | null;
  /** The line to the Storyteller is slow (or has gone quiet) enough that the player will notice. */
  slow: boolean;
}

export const useClient = create<ClientState>(() => ({ status: 'starting', pub: null, priv: null, clockOffset: 0, hostOutdated: false, rtt: null, slow: false }));

/** Slower than this there and back, things lag noticeably (the Storyteller sees it too). */
const SLOW_MS = 800;
/** Nothing at all from the Storyteller for this long, on an open line, counts as slow too. */
const QUIET_MS = 8000;

/** The host's answer to the last letter posted: whether it went in, and when it came. */
export const usePosted = create<{ ok: boolean | null; at: number }>(() => ({ ok: null, at: 0 }));

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
  /** Times in a row the Storyteller's room wasn't there: each try waits a little longer, so a dozen players
   * waiting on a reloading Storyteller don't hammer the shared lobby server. */
  private missing = 0;
  private rtt: number | null = null;
  /**
   * Taking a seat ("Into town!") is kept until the Storyteller confirms it: sent again whenever the channel
   * opens, and every few seconds, so a click during a reconnect doesn't leave the player stuck on the join screen.
   */
  private pendingJoin: { msg: Extract<ClientMessage, { t: 'join' }>; at: number; tries: number } | null = null;

  /** The lobby connection, which also carries voice. */
  get peerRef(): Peer | null {
    // Once it has opened: calls carry on through a brief loss of the lobby itself (when PeerJS clears its id).
    return this.peer && !this.peer.destroyed && this.peerOpened ? this.peer : null;
  }
  private peerOpened = false;

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
    let opened = false;
    this.peerOpened = false;
    // (Also after reconnecting to the lobby, when the channel to the Storyteller is usually still fine.)
    peer.on('open', () => {
      opened = true;
      if (this.peer === peer) this.peerOpened = true;
      if (!this.conn?.open) this.connect();
    });
    peer.on('disconnected', () => {
      if (this.peer !== peer || peer.destroyed) return;
      setTimeout(() => !peer.destroyed && peer.disconnected && peer.reconnect(), 1500);
    });
    peer.on('error', (err) => {
      if (this.peer !== peer) return;
      const type = (err as { type?: string }).type ?? '';
      if (type === 'peer-unavailable') {
        // Voice calls to someone who has just left say this too: only the Storyteller being missing matters here.
        const message = String((err as { message?: string }).message ?? '');
        if (this.conn?.open || (message && !message.includes(hostPeerId(this.room)))) return;
        this.setPeerState('waiting');
        this.missing += 1;
        this.later(() => this.connect(), Math.min(10000, 2000 + this.missing * 1500));
      } else if (RETRYABLE.has(type)) {
        this.setPeerState('reconnecting');
        // A lost lobby doesn't touch the open channel to the Storyteller or the voice calls: reconnect to it
        // rather than start again (unless PeerJS gave up on this peer altogether).
        if (!opened) this.later(() => this.openPeer(), 4000);
        else
          this.later(() => {
            if (this.peer !== peer) return;
            if (peer.destroyed) this.openPeer();
            else if (peer.disconnected) peer.reconnect();
          }, 3000);
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
      this.missing = 0;
      this.setPeerState('open');
      conn.send({ t: 'hello', playerId: playerId(), v: __BUILD__, delta: true } satisfies ClientMessage);
      this.resendJoin(true);
      this.flushOutbox();
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
          this.mesh?.send({ t: 'hello', playerId: playerId(), v: __BUILD__, delta: true } satisfies ClientMessage, peerId);
          this.refresh();
          this.resendJoin(true);
          this.flushOutbox();
          return;
        }
        if (peerId === this.meshHost) this.receive(msg);
      },
    });
  }

  // ---------------------------------------------------------------- shared

  private lastTick = Date.now();
  private tick() {
    const conn = this.conn;
    const now = Date.now();
    // A late tick means this page was stalled: the Storyteller's messages may be waiting right behind it.
    const late = now - this.lastTick > 6000;
    this.lastTick = now;
    if (conn?.open) {
      // Quiet on a connection that's still up is a busy Storyteller (or a busy us): give it much longer. The ping
      // still goes on a late tick (a hidden tab's timers are slowed right down); only the judgement waits.
      if (!late && now - this.lastPong > (linkAlive(conn) ? 45000 : 15000)) {
        conn.close();
        this.conn = null;
        this.setPeerState('reconnecting');
        this.connect();
      } else conn.send({ t: 'ping', at: now, rtt: this.rtt === null ? undefined : Math.round(this.rtt) } satisfies ClientMessage);
    }
    this.judgeSpeed(late);
    if (this.downSince && Date.now() - this.downSince > BACKUP_AFTER_MS) this.ensureMesh();
    this.resendJoin(false);
  }

  /** Takes a seat with this name and animal, until the Storyteller confirms it. */
  join(msg: Extract<ClientMessage, { t: 'join' }>) {
    this.pendingJoin = { msg, at: Date.now(), tries: 0 };
    this.send(msg);
  }

  private resendJoin(now: boolean) {
    const p = this.pendingJoin;
    if (!p || (!now && Date.now() - p.at < 4000)) return;
    if (p.tries >= 10) {
      this.pendingJoin = null;
      return;
    }
    if (this.send(p.msg)) {
      p.at = Date.now();
      p.tries += 1;
    }
  }

  /** The seat is ours, with the animal we asked for: nothing more to send. */
  private checkJoined() {
    const p = this.pendingJoin;
    if (!p) return;
    const { pub, priv } = useClient.getState();
    const seat = priv?.seatId ? pub?.seats.find((s) => s.id === priv.seatId) : undefined;
    if (seat?.look && seat.name === p.msg.name && seat.look.animal === p.msg.look.animal) this.pendingJoin = null;
  }

  /** Slow if the round trip is long, or the open line has gone quiet (not just because this page was stalled). */
  private judgeSpeed(late = false) {
    const open = Boolean(this.conn?.open);
    const quiet = open && !late && Date.now() - this.lastPong > QUIET_MS;
    const slow = open && (quiet || (this.rtt !== null && this.rtt > SLOW_MS));
    const rtt = this.rtt === null ? null : Math.round(this.rtt);
    const s = useClient.getState();
    if (s.slow !== slow || s.rtt !== rtt) useClient.setState({ slow, rtt });
  }

  private receive(msg: HostMessage) {
    if (msg.t === 'pong') {
      if (typeof msg.at === 'number') {
        const sample = Date.now() - msg.at;
        if (sample >= 0 && sample < 60000) this.rtt = this.rtt === null ? sample : this.rtt * 0.7 + sample * 0.3;
        this.judgeSpeed();
      }
      return;
    }
    if (msg.t === 'state') {
      setCustomRoles(msg.s.script.custom);
      useClient.setState({
        pub: msg.s,
        clockOffset: msg.now ? msg.now - Date.now() : useClient.getState().clockOffset,
        hostOutdated: !msg.v || msg.v < __BUILD__,
      });
      this.checkJoined();
    } else if (msg.t === 'private') {
      useClient.setState({ priv: msg.p });
      this.checkJoined();
    } else if (msg.t === 'world') {
      const me = useClient.getState().priv?.seatId ?? null;
      // An older Storyteller page sends everyone every time, without `d`.
      if (!msg.d || msg.full) presence.replace(msg.a ?? {}, me);
      else presence.merge(msg.a ?? {}, Array.isArray(msg.gone) ? msg.gone : undefined, me);
      presence.announce = Boolean(msg.ann);
    } else if (msg.t === 'gift') {
      if (msg.item && typeof msg.item.k === 'string') receiveItem(msg.item, msg.from ?? null);
    } else if (msg.t === 'taken') {
      // That animal's someone else's: the player picks again, so stop asking for this one.
      this.pendingJoin = null;
      if (typeof msg.animal === 'string') useTaken.setState({ animal: msg.animal, by: String(msg.by ?? 'Someone'), at: Date.now() });
    } else if (msg.t === 'posted') {
      usePosted.setState({ ok: msg.ok === true, at: Date.now() });
    } else if (msg.t === 'summon') {
      if (typeof msg.zone === 'string' && Number.isFinite(msg.x) && Number.isFinite(msg.z)) game.summoned(msg.zone, msg.x, msg.z);
    }
  }

  send(msg: ClientMessage) {
    if (this.deliver(msg)) return true;
    // Something the player did (a vote, a Slayer claim, an answer) waits for the channel to come back, briefly.
    if (OUTBOX.has(msg.t)) {
      this.outbox = [...this.outbox.filter((m) => Date.now() - m.at < OUTBOX_MS).slice(-19), { msg, at: Date.now() }];
    }
    return false;
  }

  private deliver(msg: ClientMessage) {
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

  /** What the player did while the channel was down, sent on once it's back (if still fresh). */
  private outbox: { msg: ClientMessage; at: number }[] = [];
  private flushOutbox() {
    const waiting = this.outbox.filter((m) => Date.now() - m.at < OUTBOX_MS);
    this.outbox = [];
    for (const m of waiting) if (!this.deliver(m.msg)) this.outbox.push(m);
  }
}

/** Actions worth holding for a moment while reconnecting; positions and pings just go stale. */
const OUTBOX = new Set<ClientMessage['t']>(['vote', 'slay', 'reply', 'ack', 'town', 'give', 'rename', 'sleep', 'hold', 'letter']);
/** Long enough for a reconnect, short enough that an old vote can't land on a later nomination. */
const OUTBOX_MS = 20000;

export const clientLink = new ClientLink();

// A player's problems go quietly to the Storyteller.
reportTo((message, where) => clientLink.send({ t: 'oops', message, where, v: __BUILD__ }));

if (debugHooks()) Object.assign(window, { __client: useClient, __clientLink: clientLink });

export const player = {
  join: (name: string, look: Look) => clientLink.join({ t: 'join', name, look }),
  /** Holds an animal while looking at it in the picker, so nobody else takes it (null lets go). */
  hold: (name: string, animal: string | null) => clientLink.send({ t: 'hold', name, animal }),
  pose: (p: Pose) => clientLink.send({ t: 'pose', p }),
  town: (a: TownAction) => clientLink.send({ t: 'town', a }),
  give: (to: string, item: Item) => clientLink.send({ t: 'give', to, item }),
  leave: () => clientLink.send({ t: 'leave' }),
  rename: (name: string) => clientLink.send({ t: 'rename', name }),
  vote: (up: boolean) => clientLink.send({ t: 'vote', up }),
  /** Claim to be the Slayer and choose this seat. */
  slay: (seatId: string) => clientLink.send({ t: 'slay', seatId }),
  /** Post a letter in someone's letterbox. */
  letter: (to: string, text: string, signed: boolean) => clientLink.send({ t: 'letter', to, text, signed }),
  ack: (wakeId: string) => clientLink.send({ t: 'ack', wakeId }),
  reply: (wakeId: string, r: { seatIds?: string[]; roleIds?: string[]; answer?: boolean }) =>
    clientLink.send({ t: 'reply', wakeId, ...r }),
};
