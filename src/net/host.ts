import { debugHooks } from '../lib/util';
import Peer, { type DataConnection } from 'peerjs';
import { create } from 'zustand';
import { st, toPrivate, toPublic, useHost } from '../state/host';
import type { ClientMessage, HostMessage } from '../state/types';
import { local, receiveItem } from '../game/local';
import { presence } from '../game/presence';
import { MEETING_RADIUS } from '../game/rules';
import { fromPose, toPose, type Item, type Pose } from '../world/types';
import { joinMesh, type Mesh } from './mesh';
import { newWorldLink, worldUpdate, type WorldLink } from './world';
import { useUpdate } from '../lib/version';
import { hostPeerId, peerDisabled, peerOptions, type LinkStatus } from './peer';

interface HostNet {
  status: LinkStatus;
  detail: string;
  online: Record<string, true>;
}

export const useHostNet = create<HostNet>(() => ({ status: 'starting', detail: '', online: {} }));

/** One player's connection, over either route. */
interface Link {
  kind: 'peerjs' | 'mesh';
  send: (msg: HostMessage) => void;
  close: () => void;
  isOpen: () => boolean;
}

interface LinkMeta {
  playerId: string | null;
  lastSeen: number;
  sentPublic?: string;
  sentPrivate?: string;
  /** What this player has been told about where everyone is. */
  world: WorldLink;
  /** Whether they were last told the Storyteller is speaking to the whole town. */
  annSent?: boolean;
}

const RETRYABLE = new Set(['network', 'server-error', 'socket-error', 'socket-closed', 'disconnected']);

class HostLink {
  private peer: Peer | null = null;
  private mesh: Mesh | null = null;
  private meshLinks = new Map<string, Link>();
  private room = '';
  private links = new Map<Link, LinkMeta>();
  private retryTimer: ReturnType<typeof setTimeout> | null = null;
  private broadcastTimer: ReturnType<typeof setTimeout> | null = null;
  private sweepTimer: ReturnType<typeof setInterval> | null = null;
  private worldTimer: ReturnType<typeof setInterval> | null = null;
  private ticks = 0;
  /** Bytes of world updates sent, for the debug stats. */
  private worldBytes = 0;

  /** The lobby connection, which also carries voice. */
  get peerRef(): Peer | null {
    return this.peer && this.peer.open ? this.peer : null;
  }

  start(room: string) {
    if (this.room === room) return;
    this.stop();
    this.room = room;
    if (peerDisabled()) useHostNet.setState({ status: 'reconnecting', detail: 'Using the backup route only.' });
    else this.openPeer();
    this.openMesh();
    this.sweepTimer = setInterval(() => this.sweep(), 5000);
    this.worldTimer = setInterval(() => {
      this.sendWorld();
      // About once a second, see whether the day's timer has run out.
      if (++this.ticks % 10 === 0) st.checkDayTimer();
    }, 100);
  }

  stop() {
    if (this.retryTimer) clearTimeout(this.retryTimer);
    if (this.sweepTimer) clearInterval(this.sweepTimer);
    if (this.worldTimer) clearInterval(this.worldTimer);
    for (const l of this.links.keys()) l.close();
    this.links.clear();
    this.meshLinks.clear();
    this.peer?.destroy();
    this.peer = null;
    this.mesh?.leave();
    this.mesh = null;
    this.room = '';
  }

  // ---------------------------------------------------------------- PeerJS, the main route

  private openPeer() {
    useHostNet.setState({ status: 'starting', detail: 'Opening the room…' });
    const peer = new Peer(hostPeerId(this.room), peerOptions());
    this.peer = peer;
    peer.on('open', () => useHostNet.setState({ status: 'open', detail: '' }));
    peer.on('connection', (conn) => this.acceptPeer(conn));
    peer.on('disconnected', () => {
      if (peer.destroyed || this.peer !== peer) return;
      useHostNet.setState({ status: 'reconnecting', detail: 'Lost the lobby server. Reconnecting… Players can still join through the backup route.' });
      setTimeout(() => !peer.destroyed && peer.disconnected && peer.reconnect(), 1500);
    });
    peer.on('error', (err) => {
      const type = (err as { type?: string }).type ?? '';
      if (this.peer !== peer) return;
      if (type === 'unavailable-id') {
        // The previous tab still holds the room for a few seconds after a reload.
        useHostNet.setState({ status: 'reconnecting', detail: 'Reclaiming the room from your last visit…' });
        this.reopenPeer(4000);
      } else if (RETRYABLE.has(type)) {
        useHostNet.setState({ status: 'reconnecting', detail: 'Can’t reach the lobby server. Retrying… Players can still join through the backup route.' });
        this.reopenPeer(5000);
      } else if (type !== 'peer-unavailable') {
        console.warn('Peer error', type, err);
      }
    });
  }

  private reopenPeer(delay: number) {
    this.peer?.destroy();
    if (this.retryTimer) clearTimeout(this.retryTimer);
    this.retryTimer = setTimeout(() => this.room && this.openPeer(), delay);
  }

  private acceptPeer(conn: DataConnection) {
    const link: Link = {
      kind: 'peerjs',
      send: (msg) => conn.open && conn.send(msg),
      close: () => conn.close(),
      isOpen: () => conn.open,
    };
    this.links.set(link, { playerId: null, lastSeen: Date.now(), world: newWorldLink() });
    conn.on('data', (raw) => this.receive(link, raw as ClientMessage));
    conn.on('close', () => this.drop(link));
    conn.on('error', () => this.drop(link));
  }

  // ---------------------------------------------------------------- Trystero, the backup route

  private openMesh() {
    this.mesh = joinMesh(this.room, {
      onJoin: (peerId) => {
        let open = true;
        const link: Link = {
          kind: 'mesh',
          send: (msg) => open && this.mesh?.send(msg, peerId),
          close: () => void (open = false),
          isOpen: () => open,
        };
        this.meshLinks.set(peerId, link);
        this.links.set(link, { playerId: null, lastSeen: Date.now(), world: newWorldLink() });
        // Other players are in this room too; tell this one which browser is the Storyteller.
        link.send({ t: 'host' });
      },
      onLeave: (peerId) => {
        const link = this.meshLinks.get(peerId);
        this.meshLinks.delete(peerId);
        if (link) {
          link.close();
          this.drop(link);
        }
      },
      onMessage: (msg, peerId) => {
        const link = this.meshLinks.get(peerId);
        if (link) this.receive(link, msg as ClientMessage);
      },
    });
  }

  // ---------------------------------------------------------------- shared

  private drop(link: Link) {
    const meta = this.links.get(link);
    if (!this.links.delete(link)) return;
    // Their animal leaves town too, unless the same player is still here on the other route.
    const pid = meta?.playerId;
    if (pid && ![...this.links.values()].some((m) => m.playerId === pid)) {
      const seat = useHost.getState().g.seats.find((s) => s.playerId === pid);
      if (seat) presence.remove(seat.id);
      // Anything they were holding in the animal picker is free again.
      st.fromPlayer.dropped(pid);
    }
    this.refreshOnline();
  }

  private sweep() {
    const now = Date.now();
    // The backup route notices departures itself; PeerJS channels can go quiet without closing.
    for (const [link, meta] of this.links) {
      if (link.kind === 'peerjs' && now - meta.lastSeen > 20000) {
        link.close();
        this.drop(link);
      }
    }
  }

  private receive(link: Link, msg: ClientMessage) {
    const meta = this.links.get(link);
    if (!meta || !msg || typeof msg !== 'object') return;
    meta.lastSeen = Date.now();
    if (msg.t === 'ping') {
      link.send({ t: 'pong' });
      return;
    }
    if (msg.t === 'hello') {
      meta.playerId = String(msg.playerId).slice(0, 40);
      // A player on a newer version means this page is out of date.
      if (msg.v && msg.v > __BUILD__) useUpdate.setState({ available: true });
      meta.sentPublic = meta.sentPrivate = undefined;
      meta.world = newWorldLink();
      // A refreshed tab replaces its old connection on the same route.
      for (const [other, m] of this.links) {
        if (other !== link && other.kind === link.kind && m.playerId === meta.playerId) {
          this.links.delete(other);
          other.close();
        }
      }
      this.refreshOnline();
      this.flushTo(link, meta);
      return;
    }
    const pid = meta.playerId;
    if (!pid) return;
    const p = st.fromPlayer;
    switch (msg.t) {
      case 'join': {
        const refused = p.join(pid, String(msg.name ?? ''), msg.look ?? {});
        if (refused) link.send({ t: 'taken', animal: refused.taken, by: refused.by });
        break;
      }
      case 'hold': {
        const refused = p.hold(pid, String(msg.name ?? ''), typeof msg.animal === 'string' ? msg.animal : null);
        if (refused) link.send({ t: 'taken', animal: refused.taken, by: refused.by });
        break;
      }
      case 'pose':
        this.pose(pid, msg.p);
        break;
      case 'town': {
        const item = msg.a && typeof msg.a === 'object' ? p.town(pid, msg.a) : null;
        if (item) link.send({ t: 'gift', item, from: null });
        break;
      }
      case 'give':
        this.give(pid, String(msg.to), msg.item);
        break;
      case 'leave':
        p.leave(pid);
        break;
      case 'rename':
        p.rename(pid, String(msg.name ?? ''));
        break;
      case 'vote':
        p.vote(pid, Boolean(msg.up));
        break;
      case 'ack':
        p.ack(pid, msg.wakeId);
        break;
      case 'reply':
        p.reply(pid, msg.wakeId, { seatIds: msg.seatIds, roleIds: msg.roleIds, answer: msg.answer });
        break;
    }
  }

  private pose(playerId: string, p: Pose) {
    if (!Array.isArray(p)) return;
    const g = useHost.getState().g;
    const seat = g.seats.find((s) => s.playerId === playerId);
    if (!seat) return;
    presence.set(seat.id, p);
    // Reaching the square answers the bell.
    const pose = fromPose(p);
    if (g.townHall && !g.townHall.back.includes(seat.id) && pose.zone === 'town' && Math.hypot(pose.x, pose.z) < MEETING_RADIUS) {
      st.arrived(seat.id);
    }
  }

  /** Hands an item from one player to another (or to the Storyteller). */
  private give(playerId: string, to: string, raw: Item) {
    const g = useHost.getState().g;
    const from = g.seats.find((s) => s.playerId === playerId);
    const item = fromPose([0, 0, 0, '', 'idle', raw, false, null]).item;
    if (!from || !item) return;
    const name = from.name || 'Someone';
    if (to === 'st') {
      receiveItem(item, name);
      return;
    }
    const target = g.seats.find((s) => s.id === to);
    if (!target?.playerId) return;
    for (const [link, meta] of this.links) if (meta.playerId === target.playerId) link.send({ t: 'gift', item, from: name });
  }

  /** The Storyteller's own hand-outs (from the bar, or to a player). */
  giveFromStoryteller(to: string, item: Item) {
    const target = useHost.getState().g.seats.find((s) => s.id === to);
    if (!target?.playerId) return;
    for (const [link, meta] of this.links) if (meta.playerId === target.playerId) link.send({ t: 'gift', item, from: 'The Storyteller' });
  }

  /** Brings a player to stand beside the Storyteller, wherever they are. */
  summon(to: string, zone: string, x: number, z: number) {
    const target = useHost.getState().g.seats.find((s) => s.id === to);
    if (!target?.playerId) return;
    for (const [link, meta] of this.links) if (meta.playerId === target.playerId) link.send({ t: 'summon', zone, x, z });
  }

  /** Where everyone is, ten times a second: each player gets just what changed for them (see world.ts). */
  private sendWorld() {
    const now = Date.now();
    const poses = new Map<string, Pose>();
    const jsons = new Map<string, string>();
    for (const [key, p] of presence.others) if (now - p.at < 20000) poses.set(key, toPose(p));
    poses.set('st', toPose(local));
    for (const [key, pose] of poses) jsons.set(key, JSON.stringify(pose));
    const seatOf = new Map<string, string>();
    for (const s of useHost.getState().g.seats) if (s.playerId) seatOf.set(s.playerId, s.id);
    const ann = presence.announce || undefined;
    const debug = debugHooks();
    for (const [link, meta] of this.links) {
      if (!meta.playerId || !link.isOpen()) continue;
      const at = presence.others.get(seatOf.get(meta.playerId) ?? '');
      const update = worldUpdate(now, meta.world, poses, jsons, at ? { zone: at.zone, x: at.x, z: at.z } : { zone: 'town', x: 0, z: 0 });
      // Nothing moved and the announce flag is as they last heard: nothing to send.
      if (!update && Boolean(ann) === Boolean(meta.annSent)) continue;
      meta.annSent = Boolean(ann);
      const msg: HostMessage = { t: 'world', a: update?.a ?? {}, gone: update?.gone, full: update?.full, ann };
      try {
        link.send(msg);
        if (debug) this.worldBytes += JSON.stringify(msg).length;
      } catch {
        /* a closing channel; the sweep tidies it up */
      }
    }
  }

  /** For the debug console: how much the world updates have cost so far, in bytes. */
  stats() {
    return { worldBytes: this.worldBytes, links: this.links.size };
  }

  private refreshOnline() {
    const online: Record<string, true> = {};
    for (const m of this.links.values()) if (m.playerId) online[m.playerId] = true;
    useHostNet.setState({ online });
  }

  scheduleBroadcast() {
    if (this.broadcastTimer) return;
    this.broadcastTimer = setTimeout(() => {
      this.broadcastTimer = null;
      for (const [link, meta] of this.links) this.flushTo(link, meta);
    }, 15);
  }

  /** Sends a player the public state and their own private state, if either changed. */
  private flushTo(link: Link, meta: LinkMeta) {
    if (!meta.playerId || !link.isOpen()) return;
    const g = useHost.getState().g;
    const online = new Set(Object.keys(useHostNet.getState().online));
    const pub = toPublic(g, online);
    const pubJson = JSON.stringify(pub);
    try {
      if (pubJson !== meta.sentPublic) {
        meta.sentPublic = pubJson;
        link.send({ t: 'state', s: pub, now: Date.now(), v: __BUILD__ });
      }
      const priv = toPrivate(g, meta.playerId);
      const privJson = JSON.stringify(priv);
      if (privJson !== meta.sentPrivate) {
        meta.sentPrivate = privJson;
        link.send({ t: 'private', p: priv });
      }
    } catch (e) {
      console.warn('Send failed', e);
    }
  }
}

export const hostLink = new HostLink();

useHost.subscribe(() => hostLink.scheduleBroadcast());
useHostNet.subscribe((s, prev) => s.online !== prev.online && hostLink.scheduleBroadcast());

if (debugHooks()) Object.assign(window, { __host: useHost, __hostNet: useHostNet, __netStats: () => hostLink.stats() });
