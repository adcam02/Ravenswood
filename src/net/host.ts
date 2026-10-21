import { debugHooks } from '../lib/util';
import { steadyInterval } from '../lib/ticker';
import { noteProblem } from '../lib/report';
import { ui } from '../state/ui';
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
import { hostPeerId, linkAlive, peerDisabled, peerOptions, type LinkStatus } from './peer';

interface HostNet {
  status: LinkStatus;
  detail: string;
  online: Record<string, true>;
  /** Players whose round trip to us is slow, and how slow (milliseconds, to the nearest hundred). */
  slow: Record<string, number>;
}

export const useHostNet = create<HostNet>(() => ({ status: 'starting', detail: '', online: {}, slow: {} }));

/** A round trip slower than this is worth knowing about: the player will feel the lag. */
export const SLOW_MS = 800;
/** Position updates wait while this much is still queued for a player: they're out of date by the time they'd go. */
const WORLD_BACKLOG = 64 * 1024;

/** One player's connection, over either route. */
interface Link {
  kind: 'peerjs' | 'mesh';
  send: (msg: HostMessage) => void;
  close: () => void;
  isOpen: () => boolean;
  /** The connection underneath is still up, even if the player has gone quiet. */
  alive?: () => boolean;
  /** Bytes queued and not yet sent. */
  backlog?: () => number;
}

interface LinkMeta {
  playerId: string | null;
  lastSeen: number;
  /** Problems this page has reported. */
  oops?: number;
  sentPublic?: string;
  sentPrivate?: string;
  /** What this player has been told about where everyone is. */
  world: WorldLink;
  /** Whether they were last told the Storyteller is speaking to the whole town. */
  annSent?: boolean;
  /** Their page understands updates with only what changed (older pages get everyone, every time). */
  delta?: boolean;
  /** For older pages: the last full update sent, and when. */
  legacyJson?: string;
  legacyAt?: number;
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
  private stopWorld: (() => void) | null = null;
  private stopBeat: (() => void) | null = null;

  /** One "still here" to the lobby server, straight down PeerJS's own socket. */
  private heartbeat() {
    try {
      const socket = (this.peer as unknown as { socket?: { _socket?: WebSocket } } | null)?.socket?._socket;
      if (socket?.readyState === WebSocket.OPEN) socket.send(JSON.stringify({ type: 'HEARTBEAT' }));
    } catch {
      /* PeerJS's own heartbeat still runs */
    }
  }
  private ticks = 0;
  /** Bytes of world updates sent, for the debug stats. */
  private worldBytes = 0;

  /** The lobby connection, which also carries voice (calls carry on through a brief loss of the lobby itself). */
  get peerRef(): Peer | null {
    return this.peer && !this.peer.destroyed ? this.peer : null;
  }

  start(room: string) {
    if (this.room === room) return;
    this.stop();
    this.room = room;
    if (peerDisabled()) useHostNet.setState({ status: 'reconnecting', detail: 'Using the backup route only.' });
    else this.openPeer();
    this.openMesh();
    this.sweepTimer = setInterval(() => this.sweep(), 5000);
    // PeerJS keeps the room registered with the lobby by pinging it on an ordinary timer, which a hidden tab slows
    // to once a minute: long enough for the lobby to drop us. These extra pings keep time in the background.
    this.stopBeat = steadyInterval(() => this.heartbeat(), 5000);
    // Kept steady while this tab is hidden (the Storyteller in another window), so players don't see everyone jump.
    this.stopWorld = steadyInterval(() => {
      try {
        this.sendWorld();
        // About once a second, see whether the day's timer has run out.
        if (++this.ticks % 10 === 0) st.checkDayTimer();
      } catch (e) {
        console.error(e);
      }
    }, 100);
  }

  stop() {
    if (this.retryTimer) clearTimeout(this.retryTimer);
    if (this.sweepTimer) clearInterval(this.sweepTimer);
    this.stopWorld?.();
    this.stopWorld = null;
    this.stopBeat?.();
    this.stopBeat = null;
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

  /**
   * The room's secret with the lobby server, kept for this tab (it survives a reload; a second tab gets its own, so
   * two tabs can't keep taking the room off each other). The lobby only lets a new connection take over the room's
   * id if it brings the same secret: with it, a reload or a reconnect after the lobby dropped us takes the room
   * straight back, rather than being refused until the old registration times out (a minute or more, with every
   * player cut off meanwhile).
   */
  private roomToken(): string {
    const key = `ravenswood:host-token:${this.room}`;
    try {
      const kept = sessionStorage.getItem(key);
      if (kept) return kept;
    } catch {
      /* no session storage: a fresh one each time */
    }
    const token = Array.from(crypto.getRandomValues(new Uint8Array(12)), (b) => b.toString(36).padStart(2, '0')).join('');
    try {
      sessionStorage.setItem(key, token);
    } catch {
      /* fine */
    }
    return token;
  }

  private openPeer() {
    useHostNet.setState({ status: 'starting', detail: 'Opening the room…' });
    const peer = new Peer(hostPeerId(this.room), { ...peerOptions(), token: this.roomToken() });
    this.peer = peer;
    let opened = false;
    peer.on('open', () => {
      opened = true;
      useHostNet.setState({ status: 'open', detail: '' });
    });
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
        // Once the room is open, losing the lobby only matters to new arrivals: everyone here keeps their own
        // channel and voice calls. So reconnect to the lobby rather than start again, which would cut them all
        // off (unless PeerJS gave up on this peer altogether).
        if (!opened) this.reopenPeer(5000);
        else
          setTimeout(() => {
            if (this.peer !== peer) return;
            if (peer.destroyed) this.reopenPeer(0);
            else if (peer.disconnected) peer.reconnect();
          }, 3000);
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
      alive: () => linkAlive(conn),
      backlog: () => conn.dataChannel?.bufferedAmount ?? 0,
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
      this.noteSpeed(pid, null);
    }
    this.refreshOnline();
  }

  private lastSweep = Date.now();
  private sweep() {
    const now = Date.now();
    // If this page was itself stalled, the quiet may be ours: let the waiting messages through first.
    const late = now - this.lastSweep > 10000;
    this.lastSweep = now;
    if (late) return;
    // The backup route notices departures itself; PeerJS channels can go quiet without closing. A player whose
    // connection is still up is only busy (a slow laptop, a heavy moment), so they get much longer.
    for (const [link, meta] of this.links) {
      const quiet = now - meta.lastSeen;
      if (link.kind === 'peerjs' && quiet > (link.alive?.() ? 90000 : 20000)) {
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
      link.send({ t: 'pong', at: typeof msg.at === 'number' ? msg.at : undefined });
      if (meta.playerId && typeof msg.rtt === 'number' && Number.isFinite(msg.rtt)) this.noteSpeed(meta.playerId, msg.rtt);
      return;
    }
    if (msg.t === 'hello') {
      meta.playerId = String(msg.playerId).slice(0, 40);
      // A player on a newer version means this page is out of date.
      if (msg.v && msg.v > __BUILD__) useUpdate.setState({ available: true });
      meta.sentPublic = meta.sentPrivate = undefined;
      meta.world = newWorldLink();
      meta.delta = msg.delta === true;
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
      case 'slay':
        p.slay(pid, String(msg.seatId));
        break;
      case 'oops': {
        // A handful per connection at most: a broken page mustn't bury the Storyteller in notes.
        meta.oops = (meta.oops ?? 0) + 1;
        if (meta.oops > 10) break;
        const who = useHost.getState().g.seats.find((s) => s.playerId === pid)?.name || 'A player';
        const message = String(msg.message ?? '').slice(0, 300);
        if (!message) break;
        const old = typeof msg.v === 'string' && msg.v < __BUILD__;
        noteProblem({ who, message, where: String(msg.where ?? '').slice(0, 80), build: String(msg.v ?? ''), at: Date.now() });
        ui.toast(old ? `${who}’s game hit a problem. Their page is out of date: ask them to reload.` : `${who}’s game hit a problem (details in Settings).`, 'info');
        break;
      }
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
    let legacy: { msg: HostMessage; json: string } | null = null;
    for (const [link, meta] of this.links) {
      if (!meta.playerId || !link.isOpen()) continue;
      // A player whose connection can't keep up skips a beat or two rather than falling further behind: what's
      // queued is already stale, and the next update says where everyone is now.
      if ((link.backlog?.() ?? 0) > WORLD_BACKLOG) continue;
      if (!meta.delta) {
        // An older page (open since before this version): everyone, as before, whenever anything changed.
        legacy ??= (() => {
          const msg: HostMessage = { t: 'world', a: Object.fromEntries(poses), ann };
          return { msg, json: JSON.stringify(msg) };
        })();
        if (legacy.json === meta.legacyJson && now - (meta.legacyAt ?? 0) < 1000) continue;
        meta.legacyJson = legacy.json;
        meta.legacyAt = now;
        try {
          link.send(legacy.msg);
          if (debug) this.worldBytes += legacy.json.length;
        } catch {
          /* a closing channel */
        }
        continue;
      }
      const at = presence.others.get(seatOf.get(meta.playerId) ?? '');
      const update = worldUpdate(now, meta.world, poses, jsons, at ? { zone: at.zone, x: at.x, z: at.z } : { zone: 'town', x: 0, z: 0 });
      // Nothing moved and the announce flag is as they last heard: nothing to send.
      if (!update && Boolean(ann) === Boolean(meta.annSent)) continue;
      meta.annSent = Boolean(ann);
      const msg: HostMessage = { t: 'world', a: update?.a ?? {}, gone: update?.gone, full: update?.full, d: 1, ann };
      try {
        link.send(msg);
        if (debug) this.worldBytes += JSON.stringify(msg).length;
      } catch {
        /* a closing channel; the sweep tidies it up */
      }
    }
  }

  /** Keeps the list of slow players, changing it only when someone crosses the line or slows by a lot. */
  private noteSpeed(playerId: string, rtt: number | null) {
    const slow = useHostNet.getState().slow;
    const now = rtt !== null && rtt > SLOW_MS ? Math.round(rtt / 100) * 100 : null;
    if ((slow[playerId] ?? null) === now) return;
    const next = { ...slow };
    if (now === null) delete next[playerId];
    else next[playerId] = now;
    useHostNet.setState({ slow: next });
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
      // Everyone gets the same public state: build and encode it once, not once per player.
      const shared = this.publicNow();
      for (const [link, meta] of this.links) this.flushTo(link, meta, shared);
    }, 15);
  }

  /** Sends a player the public state and their own private state, if either changed. */
  private publicNow() {
    const g = useHost.getState().g;
    const pub = toPublic(g, new Set(Object.keys(useHostNet.getState().online)));
    return { pub, pubJson: JSON.stringify(pub) };
  }

  private flushTo(link: Link, meta: LinkMeta, shared?: { pub: ReturnType<typeof toPublic>; pubJson: string }) {
    if (!meta.playerId || !link.isOpen()) return;
    const g = useHost.getState().g;
    const { pub, pubJson } = shared ?? this.publicNow();
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
