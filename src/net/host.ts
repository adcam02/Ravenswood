import { debugHooks } from '../lib/util';
import { steadyInterval } from '../lib/ticker';
import { noteProblem } from '../lib/report';
import { ideas } from '../game/ideas';
import { ui } from '../state/ui';
import Peer, { type DataConnection } from 'peerjs';
import { create } from 'zustand';
import { st, toPrivate, toPublic, useHost } from '../state/host';
import { admitDevice, backupCopy, nameKey, profileFor, profileOf, receiveProgress, startProfiles, trustDevice, useProfiles } from '../game/profiles';
import { backups, currentOffer, useBackups } from '../game/backup';
import { deviceSecret, hashDevice, knocks } from '../game/devices';
import { pit } from '../game/pit';
import { casinoFor, receiveCasino, startCasino, useCasino } from '../casino/host';
import { hatKey, isShopHat } from '../casino/shop';
import { leadersNow } from '../game/leaders';
import { flatFor, receiveFlats, startFlats, useFlats } from '../flats/host';
import type { ClientMessage, HostMessage } from '../state/types';
import { local, receiveItem } from '../game/local';
import { presence } from '../game/presence';
import { fromPose, toPose, type Item, type Look, type Pose } from '../world/types';
import { meetingSpot } from '../world/town/layout';
import { joinMesh, type Mesh } from './mesh';
import { newWorldLink, worldUpdate, type WorldLink } from './world';
import { useUpdate } from '../lib/version';
import { hostPeerId, linkAlive, peerDisabled, peerOptions, routeOf, type LinkStatus, type Route } from './peer';

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
  /** How the connection is going underneath (PeerJS only). */
  route?: () => Promise<Route | null>;
}

/** One player's line to the Storyteller, for the list in Settings. */
export interface PlayerLine {
  playerId: string;
  route: Route['route'] | 'backup';
  ms: number | null;
  via?: string;
}

interface LinkMeta {
  playerId: string | null;
  lastSeen: number;
  /** Problems this page has reported. */
  oops?: number;
  /** Their latest round trip to us as they measure it (milliseconds). */
  rtt?: number;
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
  /** Their device, as the hash kept on profiles (null for an older page that doesn't say). */
  device?: Promise<string | null>;
}

const RETRYABLE = new Set(['network', 'server-error', 'socket-error', 'socket-closed', 'disconnected']);
/** Players' copies of the profiles are brought up to date at most this often while things change. */
const BACKUP_EVERY_MS = 30000;

/** This browser's own device: the Storyteller can always play as any name from here. */
let ownDevice: Promise<string | null> | null = null;

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
    // Players' profiles are kept from here on (their money, hats and achievements, by name).
    startProfiles();
    // The casino's tables, played for that money.
    startCasino(() => useHostNet.getState().online);
    // The apartment block's flats, furnished with it.
    startFlats();
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
        // The pet pit's rounds keep time a little more finely.
        if (this.ticks % 2 === 0) pit.tick();
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
      route: () => routeOf(conn.peerConnection),
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
      // Anything they were holding in the animal picker is free again, and they've stopped knocking.
      st.fromPlayer.dropped(pid);
      knocks.take(pid);
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
      if (meta.playerId && typeof msg.rtt === 'number' && Number.isFinite(msg.rtt)) {
        meta.rtt = msg.rtt;
        this.noteSpeed(meta.playerId, msg.rtt);
      }
      return;
    }
    if (msg.t === 'hello') {
      meta.playerId = String(msg.playerId).slice(0, 40);
      // A player on a newer version means this page is out of date.
      if (msg.v && msg.v > __BUILD__) useUpdate.setState({ available: true });
      meta.sentPublic = meta.sentPrivate = undefined;
      meta.world = newWorldLink();
      meta.delta = msg.delta === true;
      meta.device = hashDevice(msg.device);
      // Back in their seat (a reload, a reconnect): a name with no device yet becomes this one's.
      void meta.device.then((hash) => {
        const seat = useHost.getState().g.seats.find((s) => s.playerId === meta.playerId);
        if (hash && seat && nameKey(seat.name)) admitDevice(seat.name, hash);
      });
      // The copies of the profiles they keep that could be worth restoring (asked for), and ours for them to keep.
      const books = useBackups.getState().asked ? undefined : backups.wanted(msg.kept);
      if (!books || books.length) link.send({ t: 'backupWanted', books });
      // A refreshed tab replaces its old connection on the same route.
      for (const [other, m] of this.links) {
        if (other !== link && other.kind === link.kind && m.playerId === meta.playerId) {
          this.links.delete(other);
          other.close();
        }
      }
      this.refreshOnline();
      this.flushTo(link, meta);
      this.sendBackup(link);
      return;
    }
    const pid = meta.playerId;
    if (!pid) return;
    const p = st.fromPlayer;
    switch (msg.t) {
      case 'join': {
        const name = String(msg.name ?? '');
        const look = msg.look ?? {};
        void this.admit(meta, name).then((ok) => {
          if (!ok) {
            // Someone else's name, from a device we don't know: they wait while the Storyteller is asked.
            knocks.add({ playerId: pid, name: name.trim().slice(0, 24), look: look as Look });
            link.send({ t: 'door', name: name.trim().slice(0, 24), ok: null });
          } else this.seat(link, pid, name, look);
        });
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
        knocks.take(pid);
        break;
      case 'rename': {
        const name = String(msg.name ?? '');
        void this.admit(meta, name).then((ok) => {
          if (ok) p.rename(pid, name);
          else link.send({ t: 'door', name: name.trim().slice(0, 24), ok: false });
        });
        break;
      }
      case 'vote':
        p.vote(pid, Boolean(msg.up));
        break;
      case 'slay':
        p.slay(pid, String(msg.seatId));
        break;
      case 'nominate': {
        const why = p.nominate(pid, String(msg.seatId ?? ''));
        link.send({ t: 'nominated', ok: !why, why: why ?? undefined });
        break;
      }
      case 'withdrawNomination':
        p.withdrawNomination(pid, String(msg.id ?? ''));
        break;
      case 'method':
        p.method(pid, msg.m);
        break;
      case 'pigeon': {
        const why = p.pigeon(pid, String(msg.to ?? ''), String(msg.where ?? ''));
        link.send({ t: 'pigeoned', ok: !why, why: why ?? undefined });
        break;
      }
      case 'letter':
        link.send({ t: 'posted', ok: p.letter(pid, String(msg.to ?? ''), String(msg.text ?? ''), msg.signed === true) });
        break;
      case 'idea': {
        const who = useHost.getState().g.seats.find((s) => s.playerId === pid)?.name || 'A player';
        link.send({ t: 'ideaIn', ok: ideas.receive(pid, who, String(msg.text ?? '')) });
        break;
      }
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
      case 'progress':
        receiveProgress(pid, msg.events);
        break;
      case 'pit':
        pit.fromPlayer(pid, msg.a);
        break;
      case 'casino':
        receiveCasino(pid, msg.a);
        break;
      case 'backup':
        backups.receive(pid, msg.copies);
        break;
      case 'flat':
        receiveFlats(pid, msg.a);
        break;
    }
  }

  /**
   * Whether this player's device may play as this name (claiming it if nobody has): false if not, so the Storyteller
   * must be asked. Their own name stays theirs, and the Storyteller's own browser may be anyone.
   */
  private async admit(meta: LinkMeta, name: string): Promise<boolean> {
    const hash = (await meta.device) ?? null;
    const seated = useHost.getState().g.seats.some((s) => s.playerId === meta.playerId && nameKey(s.name) === nameKey(name));
    ownDevice ??= hashDevice(deviceSecret());
    if (hash && hash === (await ownDevice)) return true;
    if (!hash) return seated || !profileOf({ name })?.devices?.length;
    return admitDevice(name, hash) || seated;
  }

  /** Takes a seat with a name and a look (once the device is known to be theirs). */
  private seat(link: Link, playerId: string, name: string, raw: Partial<Look>) {
    // Pets are bought at the casino: one they don't own stays at home.
    const look = { ...raw };
    if (look.pet && !profileOf({ name })?.pets.includes(look.pet)) look.pet = null;
    // So are the shop's hats.
    if (isShopHat(look.hat) && !profileOf({ name })?.items.includes(hatKey(look.hat!))) look.hat = null;
    const refused = st.fromPlayer.join(playerId, name, look);
    if (refused) link.send({ t: 'taken', animal: refused.taken, by: refused.by });
  }

  /** The Storyteller's answer to someone joining as a name from a new device: in they come (a device to remember), or not. */
  async answerKnock(playerId: string, letIn: boolean) {
    const k = knocks.take(playerId);
    if (!k) return;
    const hash = await [...this.links.values()].find((m) => m.playerId === playerId)?.device;
    for (const [link, meta] of this.links) {
      if (meta.playerId !== playerId) continue;
      link.send({ t: 'door', name: k.name, ok: letIn });
    }
    if (!letIn) return;
    if (hash) trustDevice(k.name, hash);
    const link = [...this.links].find(([l, m]) => m.playerId === playerId && l.isOpen())?.[0];
    if (link) this.seat(link, playerId, k.name, k.look);
  }

  /** Asks everyone here for every copy of the profiles they keep ("Restore from players"). */
  askForBackups() {
    backups.ask();
    for (const [link, meta] of this.links) if (meta.playerId) link.send({ t: 'backupWanted' });
  }

  /** A copy of the profiles for this player (or everyone) to keep. */
  private sendBackup(to?: Link) {
    const s = useProfiles.getState();
    // Nothing to keep yet, or a new book that the players' copies of an older one may be about to replace.
    const offer = currentOffer();
    if (!Object.keys(s.profiles).length || (offer && !offer.ours)) return;
    const msg: HostMessage = { t: 'backup', b: backupCopy() };
    this.backupAt = Date.now();
    for (const [link, meta] of this.links) if ((!to || link === to) && meta.playerId && link.isOpen()) link.send(msg);
  }
  private backupAt = 0;
  private backupTimer: ReturnType<typeof setTimeout> | null = null;

  /** The profiles changed: everyone's copies follow, a few seconds later and at most every 30 seconds. */
  scheduleBackup() {
    if (this.backupTimer || !this.room) return;
    const wait = Math.max(3000, this.backupAt + BACKUP_EVERY_MS - Date.now());
    this.backupTimer = setTimeout(() => {
      this.backupTimer = null;
      this.sendBackup();
    }, wait);
  }

  private pose(playerId: string, p: Pose) {
    if (!Array.isArray(p)) return;
    const g = useHost.getState().g;
    const seat = g.seats.find((s) => s.playerId === playerId);
    if (!seat) return;
    presence.set(seat.id, p);
    // Sitting down on their own stool answers the bell (just passing through the square, or standing chatting by
    // the well, doesn't).
    const pose = fromPose(p);
    if (g.townHall && !g.townHall.back.includes(seat.id) && pose.zone === 'town') {
      const spot = meetingSpot(g.seats.indexOf(seat), g.seats.length);
      if (Math.hypot(pose.x - spot.x, pose.z - spot.z) < 0.6) st.arrived(seat.id);
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

  /**
   * Sits players on their stools at the meeting, wherever they are: these seats, or everyone who hasn't sat down
   * yet. For stragglers the bell didn't bring.
   */
  seatAtMeeting(seatIds?: string[]) {
    const g = useHost.getState().g;
    const call = g.townHall;
    const want = new Set(seatIds ?? g.seats.filter((s) => !call?.back.includes(s.id)).map((s) => s.id));
    const players = new Set(g.seats.filter((s) => s.playerId && want.has(s.id)).map((s) => s.playerId));
    for (const [link, meta] of this.links) if (meta.playerId && players.has(meta.playerId)) link.send({ t: 'seat' });
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

  /**
   * Every player's line: direct or through a relay (or the backup route, which has no voice), and the round trip.
   * The connection's own measure where there is one; otherwise the player's.
   */
  async lines(): Promise<PlayerLine[]> {
    const out: PlayerLine[] = [];
    for (const [link, meta] of [...this.links]) {
      if (!meta.playerId || !link.isOpen()) continue;
      if (link.kind === 'mesh') {
        out.push({ playerId: meta.playerId, route: 'backup', ms: meta.rtt ?? null });
        continue;
      }
      const r = await link.route?.();
      out.push({ playerId: meta.playerId, route: r?.route ?? 'direct', ms: r?.ms ?? meta.rtt ?? null, via: r?.via });
    }
    return out;
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
    const pub = { ...toPublic(g, new Set(Object.keys(useHostNet.getState().online))), leaders: leadersNow() };
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
      const priv = { ...toPrivate(g, meta.playerId), profile: profileFor(meta.playerId), casino: casinoFor(meta.playerId), flat: flatFor(meta.playerId) };
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
useProfiles.subscribe((s, prev) => {
  hostLink.scheduleBroadcast();
  if (s.profiles !== prev.profiles || s.book !== prev.book) hostLink.scheduleBackup();
});
useCasino.subscribe(() => hostLink.scheduleBroadcast());
useFlats.subscribe(() => hostLink.scheduleBroadcast());

if (debugHooks()) Object.assign(window, { __host: useHost, __hostNet: useHostNet, __netStats: () => hostLink.stats() });
