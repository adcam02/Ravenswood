import * as THREE from 'three';
import { CSS2DObject, CSS2DRenderer } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import { getRole, iconUrl } from '../data';
import { game, useHud, type Prompt } from '../game/hud';
import { local, setItem } from '../game/local';
import { presence } from '../game/presence';
import type { GameJob, JobResults } from '../jobs';
import type { Execution, Nomination, TownAction, TownHall } from '../state/types';
import { drumroll, gavel } from '../lib/audio';
import { ui } from '../state/ui';
import { earshot } from '../voice/earshot';
import { useVoice, voice, type Listener } from '../voice/voice';
import { AvatarView, type AvatarInfo } from './avatar';
import { resolve, turnToward } from './collide';
import { createTown, type TownWorld } from './town';
import { COTTAGE_NAMES } from './town/layout';
import {
  cottageSlot,
  cottageZone,
  houseOwner,
  houseZone,
  zoneKind,
  type Anim,
  type Collider,
  type Door,
  type Item,
  type Look,
  type Spot,
  type Station,
  type TownState,
  type ZoneId,
  type ZoneKind,
} from './types';

export interface WorldSeat {
  id: string;
  name: string;
  look: Look | null;
  dead: boolean;
  /** A character to show over their head, if this viewer may see it. */
  roleId: string | null;
  evil: boolean;
}

/** Everything the 3D world needs from the game, refreshed whenever it changes. */
export interface WorldView {
  mode: 'st' | 'player' | 'preview';
  /** The local player has a seat and an animal (always true for the Storyteller). */
  joined: boolean;
  mySeatId: string | null;
  phase: 'day' | 'night';
  /** Characters have been handed out, so night sends everyone home. */
  started: boolean;
  seats: WorldSeat[];
  nomination: Nomination | null;
  marked: { seatId: string } | null;
  townHall: TownHall | null;
  execution: Execution | null;
  town: TownState;
  /** A window or the grimoire is open, so keys belong to it. */
  paused: boolean;
  /** The Storyteller is reading the grimoire: the camera closes in on the book in their hands. */
  reading: boolean;
  /** The join screens cover the town, so it only needs to tick over slowly behind them. */
  dim: boolean;
  /** Storyteller: the latest wake sent, so the ghost can drift to the bedside. */
  lastWake: { id: string; to: string[] } | null;
}

/** What the world asks of the game around it. */
export interface WorldHooks {
  townAction: (a: TownAction) => void;
  give: (to: string, item: Item) => void;
}

const WALK = 4.3;
const RUN = 7.2;
const FLOAT = 6;
const STOOL_Y = 0.42;

const JOB_GAMES: Partial<Record<Station['job'], GameJob>> = {
  bartender: 'bartender',
  laundry: 'laundry',
  fishing: 'fishing',
  baking: 'baking',
  gardening: 'gardening',
};

const JOB_LOOK: Record<GameJob, { anim: Anim; item: Item | null }> = {
  bartender: { anim: 'work', item: null },
  laundry: { anim: 'work', item: { k: 'washing' } },
  fishing: { anim: 'fish', item: { k: 'rod' } },
  baking: { anim: 'work', item: null },
  gardening: { anim: 'water', item: { k: 'can' } },
};

const EMOTE_TIME: Partial<Record<Anim, number>> = { wave: 2.4, cheer: 2.6, laugh: 2.6, cry: 3.2, dance: 8, drink: 1.6 };
const SIPPABLE = new Set(['ale', 'cider', 'milk', 'cocoa', 'loaf', 'pie', 'bun', 'water']);

/** What the signs over the stations say. */
const SIGN_TEXT: Partial<Record<Station['job'], string>> = {
  bartender: '🍺 Pour drinks',
  takeDrink: '🍻 Drinks to take',
  laundry: '🧺 Laundry',
  fishing: '🎣 Fishing',
  baking: '🥖 Baking',
  takeBread: '🍞 Fresh bakes',
  gardening: '🌷 Gardening',
  well: '🪣 The well',
  notice: '📜 Noticeboard',
};

const PLACE_NAMES: Record<Exclude<ZoneKind, 'house'>, string> = {
  town: 'Ravenswood',
  tavern: 'The Raven’s Rest',
  bakery: 'The Bakery',
  church: 'The Church',
};

/** Graphics quality: 'high' has shadows and crisp pixels; 'low' is for laptops that can't keep up. */
export type Quality = 'high' | 'low';

const params = new URLSearchParams(location.search);
/** ?fps=10 caps the frame rate, for tests on machines without a graphics card. */
const FPS_CAP = Number(params.get('fps')) || 0;

const isTyping = () => {
  const el = document.activeElement as HTMLElement | null;
  return Boolean(el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable));
};

export class Engine {
  private renderer: THREE.WebGLRenderer;
  private labels: CSS2DRenderer;
  private scene = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera(40, 1, 0.3, 400);
  private town: TownWorld;
  private clock = new THREE.Clock();
  private raf = 0;
  private ro: ResizeObserver;
  private view: WorldView | null = null;
  private hooks: WorldHooks;

  private me: AvatarView | null = null;
  private others = new Map<string, AvatarView>();
  private keys = new Set<string>();
  private moveTarget: THREE.Vector3 | null = null;
  private stuckFor = 0;

  private time = 0;
  private litAt = -1;
  private yaw = 0;
  private yawTarget = 0;
  private dist = 14;
  private camTarget = new THREE.Vector3();
  private camPos = new THREE.Vector3(0, 12, 14);
  private camLook = new THREE.Vector3();
  private bookOpen = 0;
  private dragging: { x: number; yaw: number } | null = null;

  private emote: { anim: Anim; until: number } | null = null;
  /** Sitting or lying on something: the y to sit at. */
  private seated: { y: number; anim: Anim } | null = null;
  private job: { job: GameJob; station: Station; prevItem: Item | null } | null = null;
  private sips = 0;
  /** Doors stay shut for a moment after arriving somewhere, so you don't bounce straight back through. */
  private doorsShutUntil = 0;
  private frozen = false;
  private lastVoice = 0;
  private lastFish = -1;
  private wasJoined = false;
  private lastPhaseKey = '';
  private hudPrompt = '';
  private quality: Quality = params.get('fx') === 'low' ? 'low' : 'high';
  private slowFrames = 0;
  private lastFrameAt = 0;
  private nearStation: Station | null = null;
  private signs: { station: Station; el: HTMLDivElement; obj: CSS2DObject }[] = [];
  private bellTimer: ReturnType<typeof setTimeout> | null = null;
  private wellTimer: ReturnType<typeof setTimeout> | null = null;
  private hearing = 0;
  private occluderRay = new THREE.Raycaster();
  private occluded = new Set<THREE.Mesh>();
  private lastShowId = new Set<string>();
  private gavelled = false;
  private lastWakeId: string | null = null;
  /** The gallows show in progress: who, and when it started on our clock. */
  private show: { id: string; seatId: string; name: string; start: number; mine: boolean; released: boolean } | null = null;
  /** The Storyteller hovering higher than usual, over someone's bed. */
  private hoverY = 0;
  private nearDoor: { door: Door; locked: string | null } | null = null;

  constructor(
    private host: HTMLElement,
    hooks: WorldHooks,
  ) {
    this.hooks = hooks;
    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.applyQuality();
    this.renderer.domElement.className = 'world-canvas';
    host.appendChild(this.renderer.domElement);
    this.labels = new CSS2DRenderer();
    this.labels.domElement.className = 'world-labels';
    host.appendChild(this.labels.domElement);

    this.town = createTown(this.scene, this.renderer);
    this.town.show('town');
    for (const station of this.town.stations) {
      const text = SIGN_TEXT[station.job];
      if (!text) continue;
      // One sign per kind of thing in a place, not one per bench or tub.
      if (this.signs.some((s) => s.station.job === station.job && s.station.zone === station.zone && Math.hypot(s.station.x - station.x, s.station.z - station.z) < 5)) continue;
      const el = document.createElement('div');
      el.className = 'station-sign';
      el.textContent = text;
      const obj = new CSS2DObject(el);
      obj.position.set(station.x, 2.1, station.z);
      obj.center.set(0.5, 1);
      this.town.groups[station.zone].add(obj);
      this.signs.push({ station, el, obj });
    }

    this.ro = new ResizeObserver(() => this.resize());
    this.ro.observe(host);
    this.resize();

    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
    window.addEventListener('blur', this.onBlur);
    const canvas = this.renderer.domElement;
    canvas.addEventListener('pointerdown', this.onPointerDown);
    window.addEventListener('pointermove', this.onPointerMove);
    window.addEventListener('pointerup', this.onPointerUp);
    canvas.addEventListener('wheel', this.onWheel, { passive: false });
    canvas.addEventListener('contextmenu', (e) => e.preventDefault());

    game.interact = () => this.interact();
    game.emote = (a) => this.startEmote(a);
    game.sip = () => this.sip();
    game.give = () => this.give();
    game.putAway = () => this.putAway();
    game.goTo = (key) => this.goTo(key);
    game.takeMeetingSeat = () => this.takeMeetingSeat();
    game.goToSquare = () => this.goToSquare();
    game.jobDone = (r) => this.finishJob(r);
    game.jobCancel = () => this.finishJob(undefined);

    this.loop();
  }

  dispose() {
    cancelAnimationFrame(this.raf);
    if (this.bellTimer) clearTimeout(this.bellTimer);
    if (this.wellTimer) clearTimeout(this.wellTimer);
    for (const s of this.signs) s.el.remove();
    for (const k of ['interact', 'sip', 'give', 'putAway', 'takeMeetingSeat', 'goToSquare', 'jobCancel'] as const) game[k] = () => {};
    game.emote = game.goTo = game.jobDone = () => {};
    this.ro.disconnect();
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    window.removeEventListener('blur', this.onBlur);
    window.removeEventListener('pointermove', this.onPointerMove);
    window.removeEventListener('pointerup', this.onPointerUp);
    for (const a of this.others.values()) a.dispose();
    this.me?.dispose();
    this.renderer.dispose();
    this.renderer.domElement.remove();
    this.labels.domElement.remove();
  }

  private applyQuality() {
    const low = this.quality === 'low';
    this.renderer.setPixelRatio(low ? 1 : Math.min(window.devicePixelRatio, 1.6));
    this.renderer.shadowMap.enabled = !low;
    // Materials compiled with shadows need rebuilding once they're off.
    this.scene.traverse((o) => {
      const m = (o as THREE.Mesh).material as THREE.Material | THREE.Material[] | undefined;
      if (!m) return;
      for (const mat of Array.isArray(m) ? m : [m]) mat.needsUpdate = true;
    });
  }

  /** Drops to low graphics when the machine clearly can't keep up. */
  private watchFrameRate(dt: number) {
    if (this.quality === 'low' || FPS_CAP) return;
    if (dt > 0.09) this.slowFrames += 1;
    else this.slowFrames = Math.max(0, this.slowFrames - 2);
    if (this.slowFrames > 40) {
      this.quality = 'low';
      this.applyQuality();
      ui.toast('Switched to low graphics so the town runs smoothly.', 'info');
    }
  }

  private resize() {
    const w = this.host.clientWidth || 1;
    const h = this.host.clientHeight || 1;
    this.renderer.setSize(w, h, false);
    this.labels.setSize(w, h);
    this.camera.aspect = w / h;
    // Narrow phone screens get pulled back a bit so the town still fits.
    this.camera.fov = w / h < 0.8 ? 52 : 40;
    this.camera.updateProjectionMatrix();
  }

  // ---------------------------------------------------------------- the game around us

  setView(v: WorldView) {
    const prev = this.view;
    this.view = v;
    const seatIndex = (id: string | null) => v.seats.findIndex((s) => s.id === id);

    if (!prev || prev.town !== v.town) this.town.setTown(v.town, Date.now());

    const nom = v.nomination;
    const meeting = Boolean(nom || v.townHall);
    const handOn = nom && (nom.status === 'running' || nom.status === 'paused' || nom.status === 'done') ? (nom.step === 0 ? nom.nomineeId : nom.order[nom.step - 1]) : null;
    const newCall = v.townHall && (!prev?.townHall || prev.townHall.ring !== v.townHall.ring || prev.townHall.id !== v.townHall.id);
    if (newCall) {
      this.town.bellRing();
      // Players head to their stool on their own after a moment, so the circle matches the grimoire.
      if (v.mode === 'player' && v.mySeatId && v.townHall && !v.townHall.back.includes(v.mySeatId)) {
        if (this.bellTimer) clearTimeout(this.bellTimer);
        this.bellTimer = setTimeout(() => this.goToSquare(), 2500);
      }
    }
    // What the meeting is about, on a sign over the tower.
    let label = '';
    if (nom) {
      const who = (id: string | null) => (id ? (v.seats.find((s) => s.id === id)?.name ?? 'Someone') : 'The Storyteller');
      const alive = v.seats.filter((s) => !s.dead).length;
      const needs = Math.ceil(alive / 2);
      label = `${who(nom.nominatorId)} nominates ${who(nom.nomineeId)} · ${nom.votes.length} ${nom.votes.length === 1 ? 'vote' : 'votes'} · needs ${needs}`;
      if (nom.status === 'done') label = `${who(nom.nomineeId)}: ${nom.votes.length} ${nom.votes.length === 1 ? 'vote' : 'votes'}, needs ${needs}`;
    } else if (v.townHall) {
      const here = v.seats.filter((s) => v.townHall!.back.includes(s.id)).length;
      label = `Everyone to the square · ${here} of ${v.seats.length} here`;
    }
    this.town.setGraves(v.seats.filter((s) => s.dead).map((s) => s.name));
    this.town.setMeeting({
      n: v.seats.length,
      active: meeting,
      nominee: nom ? seatIndex(nom.nomineeId) : null,
      hand: handOn ? seatIndex(handOn) : null,
      votes: nom ? nom.votes.map(seatIndex).filter((i) => i >= 0) : [],
      label,
    });

    // Fish caught since we last looked get a bubble over whoever caught them.
    if (this.lastFish < 0) this.lastFish = v.town.fish.length;
    for (const f of v.town.fish.slice(this.lastFish)) {
      const seat = v.seats.find((s) => s.name === f.by);
      const av = seat ? (seat.id === v.mySeatId ? this.me : this.others.get(seat.id)) : this.others.get('st');
      av?.bubble(f.cm ? `Caught a ${f.cm}cm ${f.kind}!` : `Caught ${f.kind}…`);
    }
    this.lastFish = v.town.fish.length;

    this.syncMe(v);
    this.applyPhase(v, prev);
    // An execution: everyone turns to watch.
    const ex = v.execution;
    if (ex && ex.id !== this.show?.id && Date.now() - ex.at < 15000 && !this.lastShowId.has(ex.id)) {
      this.lastShowId.add(ex.id);
      const name = v.seats.find((s) => s.id === ex.seatId)?.name ?? 'Someone';
      this.show = { id: ex.id, seatId: ex.seatId, name, start: this.clock.elapsedTime, mine: ex.seatId === v.mySeatId, released: false };
      this.stopEverything();
      const spot = this.town.gallowsSpot;
      if (this.show.mine) {
        this.place('town', spot.x, spot.z, spot.ry, true);
        this.frozen = true;
      }
      drumroll(2.8);
      ui.banner(`${name} is to be hanged`, 'The town has spoken');
    }
    // Waking someone at night takes the Storyteller to their bedside.
    if (v.mode === 'st' && v.lastWake && v.lastWake.id !== this.lastWakeId) {
      this.lastWakeId = v.lastWake.id;
      const first = v.lastWake.to.find((id) => presence.others.get(id)?.zone === houseZone(id));
      if (first && local.zone !== houseZone(first)) this.goTo(first);
    }
    for (const [key, av] of this.others) av.setInfo(this.infoFor(key, v));
  }

  private infoFor(key: string, v: WorldView): AvatarInfo {
    if (key === 'st') return { name: 'The Storyteller', look: null, ghost: false, storyteller: true, isMe: v.mode === 'st', role: null, badge: null };
    const s = v.seats.find((x) => x.id === key);
    const role = s?.roleId ? getRole(s.roleId) : undefined;
    let badge: string | null = null;
    if (v.nomination?.nomineeId === key) badge = 'nominated';
    if (v.marked?.seatId === key) badge = 'on the block';
    return {
      name: s?.name ?? 'Someone',
      look: s?.look ?? null,
      ghost: Boolean(s?.dead),
      storyteller: false,
      isMe: key === v.mySeatId,
      role: role ? { name: role.name, icon: iconUrl(role, s?.evil ? 'evil' : 'good'), evil: Boolean(s?.evil) } : null,
      badge,
    };
  }

  private syncMe(v: WorldView) {
    const key = v.mode === 'st' ? 'st' : v.mySeatId;
    if (!v.joined || !key || v.mode === 'preview') {
      if (this.me) {
        this.me.dispose();
        this.me = null;
      }
      this.wasJoined = false;
      return;
    }
    const info = this.infoFor(key, v);
    if (!this.me) this.me = new AvatarView(this.scene, info);
    else this.me.setInfo(info);
    if (!this.wasJoined) {
      this.wasJoined = true;
      this.spawn(v);
    }
  }

  /** Where you appear when you arrive: at home if it's night, otherwise near the square. */
  private spawn(v: WorldView) {
    if (v.mode === 'player' && v.started && v.phase === 'night' && v.mySeatId) this.goHome(false);
    else {
      this.goToSquareSpawn(false);
    }
  }

  private applyPhase(v: WorldView, prev: WorldView | null) {
    const key = `${v.started}:${v.phase}`;
    if (key === this.lastPhaseKey) return;
    const first = !this.lastPhaseKey;
    this.lastPhaseKey = key;
    if (first || !this.me || v.mode !== 'player' || !prev) return;
    if (v.started && v.phase === 'night') {
      this.stopEverything();
      this.goHome(true);
    } else if (v.phase === 'day' && zoneKind(local.zone) === 'house') {
      this.stopEverything();
      this.goToSquareSpawn(true);
    }
  }

  /** The morning arrival point by the square, spread out a little so nobody lands on anyone. */
  private goToSquareSpawn(fade: boolean) {
    const s = this.town.spawn;
    const a = Math.random() * Math.PI * 2;
    this.place('town', s.x + Math.cos(a) * 1.8, s.z + Math.sin(a) * 1.2, s.ry, fade);
  }

  private goHome(fade: boolean) {
    const id = this.view?.mySeatId;
    if (!id) return;
    const h = this.town.homeSpawn;
    this.place(houseZone(id), h.x, h.z, h.ry, fade);
  }

  /** Moves the local animal somewhere, optionally through a fade to black. */
  private place(zone: ZoneId, x: number, z: number, ry: number, fade: boolean) {
    const go = () => {
      this.hoverY = 0;
      local.zone = zone;
      local.x = x;
      local.z = z;
      local.ry = ry;
      this.moveTarget = null;
      this.seated = null;
      this.doorsShutUntil = performance.now() + 700;
      this.showZone();
      if (this.me) {
        this.me.setTarget(x, z, ry, 0);
        this.me.snap();
      }
      this.camTarget.set(x, 0, z);
      if (zoneKind(zone) !== 'town') this.yaw = this.yawTarget = 0;
    };
    if (!fade) return go();
    this.frozen = true;
    this.moveTarget = null;
    useHud.setState({ fading: true });
    setTimeout(() => {
      go();
      this.frozen = false;
      setTimeout(() => useHud.setState({ fading: false }), 120);
    }, 260);
  }

  private showZone() {
    const kind = zoneKind(local.zone);
    this.town.show(kind);
    let place = kind === 'house' ? '' : PLACE_NAMES[kind];
    if (kind === 'house') {
      const slot = cottageSlot(local.zone);
      if (slot !== null) {
        const name = COTTAGE_NAMES[slot % COTTAGE_NAMES.length];
        this.town.setHomeOwner(name, [name]);
        place = name;
      } else {
        const owner = houseOwner(local.zone);
        const seat = this.view?.seats.find((s) => s.id === owner);
        const name = seat?.name || 'Someone';
        this.town.setHomeOwner(name);
        place = owner === this.view?.mySeatId ? 'Your bedroom' : `${name}’s bedroom`;
      }
    }
    useHud.setState({ place });
  }

  // ---------------------------------------------------------------- input

  private onKeyDown = (e: KeyboardEvent) => {
    if (isTyping() || e.metaKey || e.ctrlKey || e.altKey) return;
    const k = e.key.toLowerCase();
    if (k === 'v') voice.setHolding(true);
    if (useHud.getState().notice) {
      if (k === 'escape') useHud.setState({ notice: false });
      return;
    }
    if (this.view?.paused || this.job) return;
    if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'shift'].includes(k)) {
      this.keys.add(k);
      if (k.startsWith('arrow')) e.preventDefault();
      return;
    }
    if (e.repeat) return;
    if (k === 'e' || k === ' ' || k === 'enter') {
      e.preventDefault();
      this.interact();
    } else if (k === 'g') this.give();
    else if (k === 'q') this.putAway();
    else if (k === '[') this.yawTarget -= Math.PI / 4;
    else if (k === ']') this.yawTarget += Math.PI / 4;
    else if (k === 'm') voice.setMuted(!useVoice.getState().muted);
    else {
      const emote = ({ '1': 'wave', '2': 'dance', '3': 'cheer', '4': 'laugh', '5': 'cry', '6': 'sit' } as Record<string, Anim>)[k];
      if (emote) this.startEmote(emote);
    }
  };

  private onKeyUp = (e: KeyboardEvent) => {
    const k = e.key.toLowerCase();
    if (k === 'v') voice.setHolding(false);
    this.keys.delete(k);
  };

  private onBlur = () => {
    this.keys.clear();
    voice.setHolding(false);
  };

  private onPointerDown = (e: PointerEvent) => {
    if (e.button === 2 || e.button === 1) {
      if (zoneKind(local.zone) === 'town') this.dragging = { x: e.clientX, yaw: this.yawTarget };
      return;
    }
    if (e.button !== 0 || !this.me || this.view?.paused || this.job) return;
    const rect = this.renderer.domElement.getBoundingClientRect();
    const ndc = new THREE.Vector2(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
    const ray = new THREE.Raycaster();
    ray.setFromCamera(ndc, this.camera);
    const hit = new THREE.Vector3();
    if (ray.ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), hit)) {
      this.moveTarget = hit;
      this.stuckFor = 0;
      this.standUp();
    }
  };

  private onPointerMove = (e: PointerEvent) => {
    if (!this.dragging) return;
    this.yawTarget = this.dragging.yaw - (e.clientX - this.dragging.x) * 0.008;
  };

  private onPointerUp = () => {
    this.dragging = null;
  };

  private onWheel = (e: WheelEvent) => {
    e.preventDefault();
    this.dist = Math.max(8, Math.min(26, this.dist + Math.sign(e.deltaY) * 1.2));
  };

  // ---------------------------------------------------------------- doing things

  private stopEverything() {
    if (this.job) {
      useHud.setState({ job: null });
      setItem(this.job.prevItem);
      this.job = null;
    }
    this.emote = null;
    this.seated = null;
    this.moveTarget = null;
  }

  private startEmote(anim: Anim) {
    if (!this.me || this.job) return;
    if (anim === 'sit') {
      this.seated = this.seated ? null : { y: 0, anim: 'sit' };
      this.emote = null;
      return;
    }
    this.seated = null;
    this.emote = { anim, until: this.clock.elapsedTime + (EMOTE_TIME[anim] ?? 2.5) };
    this.moveTarget = null;
  }

  private standUp() {
    if (this.seated) {
      this.seated = null;
      if (this.me) this.me.ty = 0;
    }
    if (this.emote?.anim === 'dance') this.emote = null;
  }

  private sip() {
    const item = local.item;
    if (!item || !SIPPABLE.has(item.k) || this.job) return;
    this.emote = { anim: 'drink', until: this.clock.elapsedTime + 1.6 };
    this.sips += 1;
    if (this.sips >= 4) {
      this.sips = 0;
      setTimeout(() => {
        if (local.item === item) {
          setItem(null);
          this.me?.bubble(['ale', 'cider', 'milk', 'cocoa'].includes(item.k) ? 'Ahh!' : 'Yum!', 1800);
        }
      }, 1500);
    }
  }

  /** The station's spot, or a slot beside it if someone is already standing there, so people work side by side. */
  private freeStand(s: Station): Spot {
    const taken = (x: number, z: number) => {
      for (const [, p] of presence.others) if (p.zone === local.zone && Math.hypot(p.x - x, p.z - z) < 0.7) return true;
      return false;
    };
    if (!taken(s.stand.x, s.stand.z)) return s.stand;
    // Sideways from the way the station faces, alternating left and right, a little further each time.
    const sx = Math.cos(s.stand.ry);
    const sz = -Math.sin(s.stand.ry);
    for (const k of [1, -1, 2, -2]) {
      const x = s.stand.x + sx * 0.9 * k;
      const z = s.stand.z + sz * 0.9 * k;
      if (!taken(x, z)) return { x, z, ry: s.stand.ry };
    }
    return s.stand;
  }

  private nearestOther(maxDist: number): { key: string; av: AvatarView } | null {
    let best: { key: string; av: AvatarView } | null = null;
    let bestD = maxDist;
    for (const [key, av] of this.others) {
      if (!av.shown) continue;
      const d = Math.hypot(av.x - local.x, av.z - local.z);
      if (d < bestD) {
        bestD = d;
        best = { key, av };
      }
    }
    return best;
  }

  private give() {
    const item = local.item;
    const near = this.nearestOther(2.6);
    if (!item || item.k === 'grimoire' || !near || this.job) return;
    this.hooks.give(near.key, item);
    setItem(null);
    this.sips = 0;
    this.emote = { anim: 'wave', until: this.clock.elapsedTime + 1.2 };
  }

  private putAway() {
    if (!local.item || local.item.k === 'grimoire' || this.job) return;
    setItem(null);
    this.sips = 0;
  }

  private interact() {
    if (!this.me || this.view?.paused || this.job || this.frozen) return;
    const s = this.nearStation;
    if (!s) {
      if (local.item && SIPPABLE.has(local.item.k)) this.sip();
      return;
    }
    const game_ = JOB_GAMES[s.job];
    if (game_) {
      this.standUp();
      this.emote = null;
      this.moveTarget = null;
      const stand = this.freeStand(s);
      local.x = stand.x;
      local.z = stand.z;
      local.ry = stand.ry;
      const look = JOB_LOOK[game_];
      this.job = { job: game_, station: s, prevItem: local.item };
      if (look.item) setItem(look.item);
      useHud.setState({ job: { job: game_, station: s.id } });
      return;
    }
    const v = this.view;
    if (s.job === 'takeDrink') {
      const d = v?.town.drinks[0];
      if (d) this.hooks.townAction({ k: 'takeDrink', id: d.id });
      this.sips = 0;
    } else if (s.job === 'takeBread') {
      const l = v?.town.loaves[0];
      if (l) this.hooks.townAction({ k: 'takeBake', id: l.id });
      this.sips = 0;
    } else if (s.job === 'well') {
      // Wind the bucket up: a moment's work, then fresh water in your paw.
      this.moveTarget = null;
      const stand = this.freeStand(s);
      local.x = stand.x;
      local.z = stand.z;
      local.ry = stand.ry;
      this.emote = { anim: 'work', until: this.clock.elapsedTime + 1.8 };
      if (this.wellTimer) clearTimeout(this.wellTimer);
      this.wellTimer = setTimeout(() => {
        setItem({ k: 'water' });
        this.sips = 0;
        this.me?.bubble('Fresh well water!', 2200);
      }, 1600);
    } else if (s.job === 'notice') {
      useHud.setState({ notice: true });
    } else if (s.job === 'sit' || s.job === 'sleep') {
      if (this.seated) return this.standUp();
      local.x = s.stand.x;
      local.z = s.stand.z;
      local.ry = s.stand.ry;
      this.moveTarget = null;
      this.emote = null;
      this.seated = { y: s.y ?? 0.45, anim: s.job === 'sleep' ? 'sleep' : 'sit' };
      if (this.me) {
        this.me.setTarget(local.x, local.z, local.ry, this.seated.y);
        this.me.snap();
      }
    }
  }

  private finishJob(result: unknown) {
    const j = this.job;
    if (!j) return;
    this.job = null;
    useHud.setState({ job: null });
    let item = j.prevItem;
    if (result !== undefined && result !== null) {
      const r = result as JobResults[GameJob];
      switch (j.job) {
        case 'bartender': {
          const x = r as JobResults['bartender'];
          this.hooks.townAction({ k: 'pour', kind: x.kind, stars: x.stars });
          break;
        }
        case 'laundry': {
          const x = r as JobResults['laundry'];
          this.hooks.townAction({ k: 'wash', kind: x.kind, color: x.color, stars: x.stars });
          break;
        }
        case 'baking': {
          const x = r as JobResults['baking'];
          this.hooks.townAction({ k: 'bake', kind: x.kind, stars: x.stars });
          break;
        }
        case 'gardening': {
          const x = r as NonNullable<JobResults['gardening']>;
          this.hooks.townAction({ k: 'plant', bed: j.station.bed ?? 0, kind: x.kind, color: x.color, stars: x.stars });
          break;
        }
        case 'fishing': {
          const x = r as NonNullable<JobResults['fishing']>;
          this.hooks.townAction({ k: 'fish', kind: x.kind, cm: x.cm });
          if (x.cm > 0) item = { k: 'fish' };
          break;
        }
      }
    }
    setItem(item);
    this.sips = 0;
    this.emote = result ? { anim: 'cheer', until: this.clock.elapsedTime + 1.6 } : null;
  }

  private goTo(key: string) {
    if (!this.me) return;
    const p = presence.others.get(key);
    if (!p) return;
    if (zoneKind(p.zone) === 'house') {
      // Float at the foot of the bed, looking over whoever is sleeping in it.
      const bed = this.town.stations.find((s) => s.zone === 'house' && s.job === 'sleep');
      const bx = bed?.stand.x ?? p.x;
      const bz = bed?.stand.z ?? p.z;
      this.place(p.zone, bx - 1.2, bz + 0.9, Math.atan2(bx - (bx - 1.2), bz - (bz + 0.9)), true);
      setTimeout(() => (this.hoverY = 0.95), 300);
      return;
    }
    const a = Math.random() * Math.PI * 2;
    this.place(p.zone, p.x + Math.cos(a) * 1.6, p.z + Math.sin(a) * 1.6, Math.atan2(-Math.cos(a), -Math.sin(a)), true);
  }

  private meetingIndex(): number {
    const v = this.view;
    return v ? v.seats.findIndex((s) => s.id === v.mySeatId) : -1;
  }

  private takeMeetingSeat() {
    const v = this.view;
    const i = this.meetingIndex();
    if (!v || i < 0 || !this.me) return;
    const spot = this.town.meetingSpot(i, v.seats.length);
    const inTown = local.zone === 'town';
    const sit = () => {
      this.seated = { y: STOOL_Y, anim: 'sit' };
      this.me?.setTarget(spot.x, spot.z, spot.ry, STOOL_Y);
      this.me?.snap();
    };
    this.stopEverything();
    if (inTown && Math.hypot(local.x, local.z) < this.town.meetingRadius * 1.4) {
      local.x = spot.x;
      local.z = spot.z;
      local.ry = spot.ry;
      sit();
    } else {
      this.place('town', spot.x, spot.z, spot.ry, true);
      setTimeout(sit, 420);
    }
  }

  private goToSquare() {
    if (!this.me) return;
    if (this.meetingIndex() >= 0) return this.takeMeetingSeat();
    const s = this.town.spawn;
    this.stopEverything();
    this.place('town', s.x, s.z, s.ry, true);
  }

  // ---------------------------------------------------------------- every frame

  private loop = () => {
    this.raf = requestAnimationFrame(this.loop);
    const cap = this.view?.dim ? 4 : FPS_CAP;
    if (cap) {
      const now = performance.now();
      if (now - this.lastFrameAt < 1000 / cap) return;
      this.lastFrameAt = now;
    }
    const raw = this.clock.getDelta();
    const dt = Math.min(0.05, raw);
    const t = this.clock.elapsedTime;
    this.watchFrameRate(raw);
    try {
      this.frame(dt, t);
    } catch (e) {
      console.error(e);
    }
  };

  private frame(dt: number, t: number) {
    const v = this.view;
    // Night falls (and lifts) over a few seconds.
    const night = v && v.started && v.phase === 'night' ? 1 : 0;
    this.time += (night - this.time) * Math.min(1, dt * 0.7);
    if (Math.abs(this.time - this.litAt) > 0.002) {
      this.litAt = this.time;
      this.town.setTime(this.time);
    }

    this.runShow(t);
    if (this.me && v) this.moveMe(dt, t, v);
    this.updateOthers(dt, t, v);
    this.updateCamera(dt, t);
    this.fadeOccluders(dt);
    this.town.follow(this.camTarget.x, this.camTarget.z);
    this.town.update(dt, t);

    if (t - this.lastVoice > 0.2) {
      this.lastVoice = t;
      this.syncVoice(v);
    }

    for (const s of this.signs) {
      if (s.station.zone !== zoneKind(local.zone)) continue;
      const d = Math.hypot(s.station.x - local.x, s.station.z - local.z);
      const near = this.nearStation && this.nearStation.job === s.station.job && this.nearStation.zone === s.station.zone;
      const a = near || this.job ? 0 : Math.max(0, Math.min(1, (26 - d) / 10));
      s.el.style.opacity = a.toFixed(2);
    }
    this.renderer.render(this.scene, this.camera);
    this.labels.render(this.scene, this.camera);
    if (!useHud.getState().ready) useHud.setState({ ready: true });
  }

  private moveMe(dt: number, t: number, v: WorldView) {
    const me = this.me!;
    const zone = zoneKind(local.zone);
    const colliders = this.town.colliders[zone];
    const bounds = this.town.bounds[zone];
    const st = v.mode === 'st';

    // Keyboard direction, relative to the camera.
    let ix = 0;
    let iz = 0;
    if (!v.paused && !this.job && !this.frozen) {
      if (this.keys.has('w') || this.keys.has('arrowup')) iz -= 1;
      if (this.keys.has('s') || this.keys.has('arrowdown')) iz += 1;
      if (this.keys.has('a') || this.keys.has('arrowleft')) ix -= 1;
      if (this.keys.has('d') || this.keys.has('arrowright')) ix += 1;
    }
    let dx = 0;
    let dz = 0;
    if (ix || iz) {
      this.moveTarget = null;
      const len = Math.hypot(ix, iz);
      ix /= len;
      iz /= len;
      const cos = Math.cos(this.yaw);
      const sin = Math.sin(this.yaw);
      dx = ix * cos + iz * sin;
      dz = -ix * sin + iz * cos;
    } else if (this.moveTarget && !this.frozen) {
      const tx = this.moveTarget.x - local.x;
      const tz = this.moveTarget.z - local.z;
      const d = Math.hypot(tx, tz);
      if (d < 0.25) this.moveTarget = null;
      else {
        dx = tx / d;
        dz = tz / d;
      }
    }
    const moving = dx !== 0 || dz !== 0;
    if (moving) {
      this.hoverY = 0;
      this.standUp();
      if (this.emote && this.emote.anim !== 'drink') this.emote = null;
      const running = this.keys.has('shift');
      const speed = st ? (running ? FLOAT * 1.7 : FLOAT) : running ? RUN : WALK;
      const nx = local.x + dx * speed * dt;
      const nz = local.z + dz * speed * dt;
      // Animals bump gently off each other; the Storyteller's ghost drifts through anyone.
      const people: Collider[] = [];
      if (!st) {
        for (const [key, p] of presence.others) {
          if (key === 'st' || p.zone !== local.zone) continue;
          if (Math.hypot(p.x - local.x, p.z - local.z) < 3) people.push({ kind: 'circle', x: p.x, z: p.z, r: 0.3 });
        }
      }
      const [rx, rz] = resolve(nx, nz, people.length ? [...colliders, ...people] : colliders, bounds);
      const progress = Math.hypot(rx - local.x, rz - local.z);
      if (this.moveTarget && progress < speed * dt * 0.2) {
        this.stuckFor += dt;
        if (this.stuckFor > 0.4) this.moveTarget = null;
      } else this.stuckFor = 0;
      local.x = rx;
      local.z = rz;
      local.ry = turnToward(local.ry, Math.atan2(dx, dz), dt * 12);
    }

    if (st) {
      const open = v.reading;
      if (!local.item || local.item.k === 'grimoire') local.item = { k: 'grimoire', c: open ? 'open' : undefined };
      this.bookOpen += ((open ? 1 : 0) - this.bookOpen) * Math.min(1, dt * 4);
      const book = me.rig.root.getObjectByName('item:grimoire');
      (book?.userData.setOpen as ((t: number) => void) | undefined)?.(this.bookOpen);
    }

    // What we're doing, in order of importance.
    const nom = v.nomination;
    const voting = Boolean(nom && v.mySeatId && nom.votes.includes(v.mySeatId) && nom.status !== 'done');
    if (this.emote && t > this.emote.until) this.emote = null;
    let anim: Anim = moving ? (this.keys.has('shift') ? 'run' : 'walk') : 'idle';
    if (this.job) anim = JOB_LOOK[this.job.job].anim;
    else if (st && v.reading) anim = 'fish';
    else if (voting) anim = 'hand';
    else if (this.emote) anim = this.emote.anim;
    else if (this.seated) anim = this.seated.anim;
    local.anim = anim;
    local.speaking = voice.speaking();
    useHud.setState((h) => {
      const emote = this.emote?.anim ?? (this.seated?.anim === 'sit' && this.seated.y === 0 ? 'sit' : null);
      const canSip = Boolean(local.item && SIPPABLE.has(local.item.k));
      return h.emote === emote && h.canSip === canSip ? h : { emote, canSip };
    });

    let myY = this.seated?.y ?? this.hoverY;
    let dangle: { swing: number; scale: number } | null = null;
    if (this.show?.mine) {
      const sp = this.showPose(t - this.show.start);
      local.x = sp.x;
      local.z = sp.z;
      local.ry = sp.ry;
      myY = sp.y;
      anim = sp.anim;
      local.anim = anim;
      dangle = sp;
    }
    me.setTarget(local.x, local.z, local.ry, myY);
    me.setItem(local.item);
    me.setVisible(true);
    me.update(dt, t, anim, local.speaking, false);
    me.rig.root.rotation.z = dangle?.swing ?? 0;
    me.rig.root.scale.setScalar(dangle?.scale ?? 1);

    this.checkDoors(v, moving, dx, dz);
    this.checkStations(v);
  }

  private doorTarget(door: Door, v: WorldView): { zone: ZoneId; x: number; z: number; ry: number } | { locked: string } {
    const st = v.mode === 'st';
    const nightLocked = !st && v.started && v.phase === 'night';
    if (door.to === 'house') {
      if (nightLocked) return { locked: 'It’s night. Everyone is in bed' };
      return { zone: cottageZone(door.slot ?? 0), x: door.spawn.x, z: door.spawn.z, ry: door.spawn.ry };
    }
    if (door.zone === 'house' && door.to === 'town') {
      const slot = cottageSlot(local.zone);
      if (slot !== null) {
        if (nightLocked) return { locked: 'It’s night. Time for bed' };
        const spot = this.town.houseSlots[slot % this.town.houseSlots.length].door;
        return { zone: 'town', x: spot.x, z: spot.z, ry: spot.ry };
      }
      if (nightLocked) return { locked: 'It’s night. Stay in bed until morning' };
      return { zone: 'town', ...this.town.spawn };
    }
    if (nightLocked) return { locked: 'It’s night. Stay home' };
    return { zone: door.to, x: door.spawn.x, z: door.spawn.z, ry: door.spawn.ry };
  }

  private checkDoors(v: WorldView, moving: boolean, dx: number, dz: number) {
    const zone = zoneKind(local.zone);
    this.nearDoor = null;
    for (const door of this.town.doors) {
      if (door.zone !== zone) continue;
      const d = Math.hypot(door.x - local.x, door.z - local.z);
      if (d > door.r) continue;
      const target = this.doorTarget(door, v);
      if ('locked' in target) {
        this.nearDoor = { door, locked: target.locked };
        return;
      }
      // Only walking into a door opens it, not standing next to one.
      const toward = moving && (door.x - local.x) * dx + (door.z - local.z) * dz > -0.2;
      if (toward && performance.now() >= this.doorsShutUntil && !this.job) {
        this.doorsShutUntil = performance.now() + 1000;
        this.place(target.zone, target.x, target.z, target.ry, true);
      }
      return;
    }
  }

  private checkStations(v: WorldView) {
    const zone = zoneKind(local.zone);
    let best: Station | null = null;
    let bestD = Infinity;
    for (const s of this.town.stations) {
      if (s.zone !== zone) continue;
      const d = Math.hypot(s.x - local.x, s.z - local.z);
      if (d < s.r && d < bestD) {
        best = s;
        bestD = d;
      }
    }
    this.nearStation = best;
    let prompt: Prompt | null = null;
    if (this.job) prompt = null;
    else if (this.nearDoor?.locked) prompt = { label: this.nearDoor.locked, key: '', locked: true };
    else if (best) {
      let label = best.label;
      let locked = false;
      if (best.job === 'takeDrink' && !v.town.drinks.length) {
        label = 'No drinks on the bar yet';
        locked = true;
      } else if (best.job === 'takeBread' && !v.town.loaves.length) {
        label = 'The shelf is empty';
        locked = true;
      } else if ((best.job === 'sit' || best.job === 'sleep') && this.seated) label = 'Get up';
      prompt = { label, key: locked ? '' : 'E', locked };
    } else if (local.item && SIPPABLE.has(local.item.k)) {
      prompt = { label: ['ale', 'cider', 'milk', 'cocoa'].includes(local.item.k) ? 'Have a sip' : 'Have a bite', key: 'E' };
    }
    const near = local.item && local.item.k !== 'grimoire' && !this.job ? this.nearestOther(2.6) : null;
    const giveTo = near ? { key: near.key, name: near.key === 'st' ? 'the Storyteller' : v.seats.find((s) => s.id === near.key)?.name || 'them' } : null;
    const json = JSON.stringify([prompt, giveTo]);
    if (json !== this.hudPrompt) {
      this.hudPrompt = json;
      useHud.setState({ prompt, giveTo });
    }
  }

  /**
   * The gallows: a drumroll while the condemned waits on the trapdoor, the drop at three seconds, the rope
   * snapping taut and a dangle with a swing, a puff at six, and the ghost let go after.
   */
  private runShow(t: number) {
    const show = this.show;
    if (!show) return;
    const age = t - show.start;
    const spot = this.town.gallowsSpot;
    const open = Math.max(0, Math.min(1, (age - 2.9) / 0.25));
    if (age >= 2.9 && !this.gavelled) {
      this.gavelled = true;
      gavel();
    }
    const rope = Math.max(0, Math.min(1, (age - 3.1) / 0.3)) * 1.15;
    this.town.setGallows(open, age < 6.6 ? `${show.name} is hanged` : '', age > 7 ? 0 : rope);
    if (age > 7) {
      if (show.mine) {
        this.frozen = false;
        this.place('town', spot.x + 2.2, spot.z + 1.4, Math.PI, true);
      }
      this.show = null;
      this.gavelled = false;
    }
  }

  /** Where the condemned is during the show: on the trapdoor, dropping, yanked up by the rope, dangling, then gone. */
  private showPose(age: number): { x: number; z: number; y: number; ry: number; anim: Anim; swing: number; scale: number } {
    const spot = this.town.gallowsSpot;
    let y = spot.y;
    let swing = 0;
    let scale = 1;
    if (age > 2.9 && age < 3.3) y = spot.y - 0.7 * ((age - 2.9) / 0.4);
    else if (age >= 3.3) {
      // The rope takes the weight: a bounce up to hang just under the noose, then a slow swing.
      const k = Math.min(1, (age - 3.3) / 0.35);
      const hang = spot.y + 0.55;
      y = -0.7 + spot.y + (hang - (spot.y - 0.7)) * (1 - Math.pow(1 - k, 2)) + Math.sin(k * Math.PI) * 0.25;
      swing = Math.sin((age - 3.3) * 3.2) * 0.14 * Math.max(0, 1 - (age - 3.3) / 4);
    }
    if (age > 6.1) scale = Math.max(0.001, 1 - (age - 6.1) / 0.45);
    return { x: spot.x, z: spot.z, y, ry: spot.ry, anim: age < 2.9 ? 'cry' : age < 3.3 ? 'idle' : 'cry', swing, scale };
  }

  private updateOthers(dt: number, t: number, v: WorldView | null) {
    const seen = new Set<string>();
    const myKey = v?.mode === 'st' ? 'st' : v?.mySeatId;
    const nom = v?.nomination;
    for (const [key, p] of presence.others) {
      if (key === myKey || !v) continue;
      if (key !== 'st' && !v.seats.some((s) => s.id === key)) continue;
      seen.add(key);
      let av = this.others.get(key);
      if (!av) {
        av = new AvatarView(this.scene, this.infoFor(key, v));
        this.others.set(key, av);
      }
      const here = p.zone === local.zone;
      av.setVisible(here);
      if (!here) {
        av.placed = false;
        continue;
      }
      const sitting = p.anim === 'sit' || p.anim === 'sleep';
      let anim: Anim = nom && nom.status !== 'done' && nom.votes.includes(key) ? 'hand' : p.anim;
      let dangle: { swing: number; scale: number } | null = null;
      if (this.show && this.show.seatId === key && local.zone === 'town') {
        const sp = this.showPose(t - this.show.start);
        av.setTarget(sp.x, sp.z, sp.ry, sp.y);
        av.snap();
        anim = sp.anim;
        dangle = sp;
      } else av.setTarget(p.x, p.z, p.ry, sitting ? this.seatHeight(p.zone, p.anim, p.x, p.z) : 0);
      av.setItem(p.item);
      av.update(dt, t, anim, p.speaking, true);
      av.rig.root.rotation.z = dangle?.swing ?? 0;
      av.rig.root.scale.setScalar(dangle?.scale ?? 1);
    }
    for (const [key, av] of this.others) {
      if (!seen.has(key)) {
        av.dispose();
        this.others.delete(key);
      }
    }
  }

  /** How high someone sitting here is: on a bench, a bed, a meeting stool, or just the ground. */
  private seatHeight(zone: ZoneId, anim: Anim, x: number, z: number): number {
    const kind = zoneKind(zone);
    const want = anim === 'sleep' ? 'sleep' : 'sit';
    for (const s of this.town.stations) {
      if (s.zone === kind && s.job === want && Math.hypot(s.stand.x - x, s.stand.z - z) < 0.6) return s.y ?? 0.45;
    }
    const v = this.view;
    if (kind === 'town' && v && (v.nomination || v.townHall)) {
      for (let i = 0; i < v.seats.length; i++) {
        const spot = this.town.meetingSpot(i, v.seats.length);
        if (Math.hypot(spot.x - x, spot.z - z) < 0.6) return STOOL_Y;
      }
    }
    return 0;
  }

  /** Anything standing between the camera and our animal turns see-through, so we're never hidden behind the church. */
  private fadeOccluders(dt: number) {
    const inTown = zoneKind(local.zone) === 'town' && this.me;
    this.occluded.clear();
    if (inTown) {
      const head = new THREE.Vector3(local.x, 1.1, local.z);
      const origin = this.camera.position;
      const dir = head.clone().sub(origin);
      const far = dir.length();
      this.occluderRay.set(origin, dir.normalize());
      this.occluderRay.far = far;
      for (const hit of this.occluderRay.intersectObjects(this.town.occluders, false)) this.occluded.add(hit.object as THREE.Mesh);
    }
    for (const m of this.town.occluders) {
      const mat = m.material as THREE.Material;
      const want = this.occluded.has(m) ? 0.22 : 1;
      if (Math.abs(mat.opacity - want) < 0.005) continue;
      mat.opacity += (want - mat.opacity) * Math.min(1, dt * 8);
    }
  }

  private updateCamera(dt: number, t: number) {
    const inside = zoneKind(local.zone) !== 'town';
    if (inside) this.yawTarget = 0;
    this.yaw += (this.yawTarget - this.yaw) * Math.min(1, dt * 6);
    let tx: number;
    let tz: number;
    if (this.me) {
      tx = local.x;
      tz = local.z;
    } else {
      // Nobody to follow yet: drift slowly round the square.
      const a = t * 0.05;
      tx = Math.sin(a) * 6;
      tz = Math.cos(a) * 6;
      this.yaw = a;
    }
    const k = this.me ? 1 - Math.exp(-dt * 6) : 1;
    this.camTarget.x += (tx - this.camTarget.x) * k;
    this.camTarget.z += (tz - this.camTarget.z) * k;
    const wantPos = new THREE.Vector3();
    const wantLook = new THREE.Vector3();
    if (this.show && zoneKind(local.zone) === 'town') {
      const g = this.town.gallowsSpot;
      wantPos.set(g.x + Math.sin(this.yaw + 0.5) * 9, 7.5, g.z + Math.cos(this.yaw + 0.5) * 9);
      wantLook.set(g.x, 1.6, g.z);
    } else if (this.view?.reading && this.me) {
      // Over the Storyteller's shoulder, looking down into the open book.
      const root = this.me.rig.root;
      wantPos.set(0.05, 2.05, -0.55).applyAxisAngle(new THREE.Vector3(0, 1, 0), root.rotation.y).add(root.position);
      wantLook.set(0, 1.08, 0.5).applyAxisAngle(new THREE.Vector3(0, 1, 0), root.rotation.y).add(root.position);
    } else {
      const dist = inside ? Math.min(this.dist, 13) : this.me ? this.dist : 30;
      const pitch = inside ? 0.95 : 0.78;
      const flat = dist * Math.cos(pitch);
      wantPos.set(this.camTarget.x + Math.sin(this.yaw) * flat, dist * Math.sin(pitch), this.camTarget.z + Math.cos(this.yaw) * flat);
      wantLook.set(this.camTarget.x, 0.8, this.camTarget.z);
    }
    // Closing in on the book is a slow swoop; everything else follows closely.
    let ease = this.view?.reading || this.show ? 1 - Math.exp(-dt * 4) : 1 - Math.exp(-dt * 9);
    if (!this.me && !this.view?.reading) ease = 1;
    this.camPos.lerp(wantPos, ease);
    this.camLook.lerp(wantLook, ease);
    this.camera.position.copy(this.camPos);
    this.camera.lookAt(this.camLook);
  }

  private syncVoice(v: WorldView | null) {
    if (!v || v.mode === 'preview' || !this.me) return;
    const meeting = Boolean(v.townHall || (v.nomination && v.nomination.status !== 'done'));
    const ctx = { meeting, meetingRadius: this.town.meetingRadius, announce: presence.announce };
    const list: Listener[] = [];
    let hearing = 0;
    for (const [key, p] of presence.others) {
      const gain = earshot(local, p, key === 'st', ctx);
      // Distance and walls work both ways, so this is also roughly who can hear us.
      const av = this.others.get(key);
      const near = gain > 0.02 && (!p.voiceId || key !== 'st' || !presence.announce);
      av?.setHearing(near);
      if (near) hearing += 1;
      if (!p.voiceId) continue;
      list.push({ voiceId: p.voiceId, gain });
    }
    if (hearing !== this.hearing) {
      this.hearing = hearing;
      useHud.setState({ hearing });
    }
    voice.sync(list);
  }
}
