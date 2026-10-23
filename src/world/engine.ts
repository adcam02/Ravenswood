import * as THREE from 'three';
import { CSS2DObject, CSS2DRenderer } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import { getRole, iconUrl } from '../data';
import { game, useHud, type Prompt } from '../game/hud';
import { local, setItem } from '../game/local';
import { presence } from '../game/presence';
import { SCORE_OF, type GameJob, type JobResults } from '../jobs/meta';
import { rememberBest } from '../game/bests';
import type { DayTimer, Execution, Nomination, TownAction, TownHall, Visit } from '../state/types';
import { ambience } from '../lib/ambience';
import { doorChime, drumroll, gavel, pigeonSound, ropeSnap, visitSound } from '../lib/audio';
import { NightVisit, VISIT, VISIT_NAMES, bendVictim, type VictimPose } from './visit';
import { PIGEON, PigeonFlight } from './pigeon';
import { ui, useUI } from '../state/ui';
import { earshot } from '../voice/earshot';
import { useVoice, voice, type Listener } from '../voice/voice';
import { AvatarView, type AvatarInfo } from './avatar';
import { resolve, turnToward } from './collide';
import { createTown, GALLOWS_BEAM, GALLOWS_KNOT, GALLOWS_ROPE_REST, type TownWorld } from './town';
import { BED, COTTAGE_NAMES, DAIS, DOCK, FAIRY_RING, GRAVEYARD, MEETING_CENTRE, RING_ROAD_R, SQUARE_R, STOOL_R, TOWER, groundAt } from './town/layout';
import { nearPath } from './town/outdoor';
import { Fireworks } from './fireworks';
import { reportProblem } from '../lib/report';
import { earn, hatBoost, notePerfect, noteTopJob, tally } from '../game/progress';

/** Hats are a player's own: the Storyteller doesn't collect them. */
const isPlayerView = (v: WorldView | null) => v?.mode === 'player';
import { drawless, loadJSON, saveJSON } from '../lib/util';
import { steadyInterval } from '../lib/ticker';

/** Town features that arrive with the effects pass: called only if the town has them. */
interface TownFx {
  setWeather?: (w: Weather) => void;
  setDayProgress?: (p: number) => void;
  consumeShadowDirty?: () => boolean;
  ripple?: (x: number, z: number, size?: number) => void;
}

/** What's underfoot, for the sound of footsteps. */
function surfaceAt(zone: ZoneId, x: number, z: number): 'stone' | 'wood' | 'grass' {
  const kind = zoneKind(zone);
  if (kind === 'church' || kind === 'tower') return 'stone';
  if (kind !== 'town') return 'wood';
  if (Math.abs(x - DOCK.x) < DOCK.w / 2 && z > DOCK.z0 && z < DOCK.z1) return 'wood';
  if (Math.hypot(x, z) < SQUARE_R) return 'stone';
  return 'grass';
}
/** The height of the floor or ground at a spot: the cobbles and the pier are raised a little in town. */
const groundY = (zone: ZoneId, x: number, z: number) => (zoneKind(zone) === 'town' ? groundAt(x, z) : 0);
const onDock = (zone: ZoneId, x: number, z: number) => zone === 'town' && Math.abs(x - DOCK.x) < DOCK.w / 2 && z > DOCK.z0 && z < DOCK.z1;
/** On one of the town's dirt paths (not the square's stones), where running kicks up dust. */
const onDirt = (zone: ZoneId, x: number, z: number) => zone === 'town' && Math.hypot(x, z) > SQUARE_R + 0.5 && nearPath(x, z, 0);

/** Beyond this far from the camera's focus, animals switch to their lighter model; name tags hide beyond the next. */
const LOD_FAR = 20;
const LOD_NEAR = 16;
const TAG_FAR = 26;
/**
 * The hanging, in seconds from the start: the noose comes down onto the neck, the drop, the puff of smoke
 * (the ghost floats up out of the trapdoor over `rise`), and the end. For someone who survives it, the rope snaps
 * `snap` seconds after the drop.
 */
const SHOW = { lower: 0.9, drop: 1.6, puff: 3.3, rise: 0.6, end: 4.3, snap: 0.18 };
/** Even with nothing changing, the shadow map is redrawn this often, just in case. */
const SHADOW_SAFETY_S = 10;
import {
  BOOTH,
  BOOTH_SEATS,
  cottageSlot,
  cottageZone,
  houseOwner,
  houseZone,
  inBooth,
  wrapAngle,
  zoneKind,
  type Anim,
  type Collider,
  type Door,
  type Item,
  type Look,
  type Spot,
  type Station,
  type TownState,
  type Weather,
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
  /** What they really are, when that's not the character they hold (the Drunk's Townsfolk). */
  really?: string | null;
  evil: boolean;
  /** Wearing the gold star for counting the sheep. */
  star: boolean;
  /** Letters are waiting in their letterbox. */
  mail: boolean;
}

/** Everything the 3D world needs from the game, refreshed whenever it changes. */
export interface WorldView {
  mode: 'st' | 'player' | 'preview';
  /** The local player has a seat and an animal (always true for the Storyteller). */
  joined: boolean;
  mySeatId: string | null;
  phase: 'day' | 'night';
  day: number;
  /** Characters have been handed out, so night sends everyone home. */
  started: boolean;
  seats: WorldSeat[];
  nomination: Nomination | null;
  marked: { seatId: string } | null;
  townHall: TownHall | null;
  execution: Execution | null;
  weather: Weather;
  dayTimer: DayTimer | null;
  town: TownState;
  /** A window or the grimoire is open, so keys belong to it. */
  paused: boolean;
  /** The Storyteller is reading the grimoire: the camera closes in on the book in their hands. */
  reading: boolean;
  /** The join screens cover the town, so it only needs to tick over slowly behind them. */
  dim: boolean;
  /** Storyteller: the latest wake sent, so the ghost can drift to the bedside. */
  lastWake: { id: string; to: string[] } | null;
  /** Slayer claims this game: who, at whom, and what came of it. */
  slayer: { id: string; by: string; target: string; result: string }[];
  /** The game is over, and which team won. */
  ended: { winner: 'good' | 'evil'; at: number } | null;
  /** Hooded-figure visits tonight: the player's own (if they've been killed), or all of them for the Storyteller. */
  visits: Visit[];
  /** Messenger pigeons in the air lately (this browser's clock), and the notes from those that came for us. */
  pigeons: { id: string; to: string; at: number }[];
  pigeonNotes: { id: string; name: string; where: string; at: number }[];
}

/** What the world asks of the game around it. */
export interface WorldHooks {
  townAction: (a: TownAction) => void;
  give: (to: string, item: Item) => void;
}

/** Voice lines open to people within this distance in town (earshot fades out at 9.5 m, a shout's at 26 m). */
const VOICE_CONNECT_R = 22;
/** Going in somewhere, you wait this long at the door while it opens and the chime rings inside (then the fade). */
const DOOR_WAIT_MS = 1100;
const WALK = 4.3;
const RUN = 7.2;
const FLOAT = 6;
/** The top of a meeting stool: a stool's height on the dais. */
const STOOL_Y = DAIS.top + 0.42;

const JOB_GAMES: Partial<Record<Station['job'], GameJob>> = {
  bartender: 'bartender',
  laundry: 'laundry',
  fishing: 'fishing',
  baking: 'baking',
  gardening: 'gardening',
  darts: 'darts',
  bread: 'bread',
  wine: 'wine',
  firewood: 'firewood',
  skimming: 'skimming',
  coin: 'coin',
  clock: 'clock',
};

const JOB_LOOK: Record<GameJob, { anim: Anim; item: Item | null }> = {
  bartender: { anim: 'work', item: null },
  laundry: { anim: 'work', item: { k: 'washing' } },
  fishing: { anim: 'fish', item: { k: 'rod' } },
  baking: { anim: 'work', item: null },
  gardening: { anim: 'water', item: { k: 'can' } },
  darts: { anim: 'hand', item: null },
  bread: { anim: 'work', item: null },
  wine: { anim: 'water', item: null },
  firewood: { anim: 'work', item: null },
  skimming: { anim: 'hand', item: null },
  coin: { anim: 'wave', item: null },
  clock: { anim: 'work', item: null },
};

/** Night visits already seen on this screen, so a reload doesn't play one again. */
const VISITS_SEEN_KEY = 'ravenswood:visits-seen';

const EMOTE_TIME: Partial<Record<Anim, number>> = { wave: 2.4, cheer: 2.6, laugh: 2.6, cry: 3.2, dance: 8, drink: 1.6 };
const SIPPABLE = new Set(['ale', 'cider', 'milk', 'cocoa', 'loaf', 'pie', 'bun', 'water', 'wine']);
const DRINKS = new Set(['ale', 'cider', 'milk', 'cocoa', 'water', 'wine']);

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
  coin: '🪙 Make a wish',
  notice: '📜 Noticeboard',
  darts: '🎯 Darts',
  bread: '🍞 Break the bread',
  wine: '🍷 Pour the wine',
  firewood: '🪓 Chop firewood',
  skimming: '🪨 Skim stones',
  clock: '🕰️ Keep time',
  confess: '🕯️ Confession booth',
  post: '✉️ Post office',
};

const PLACE_NAMES: Record<Exclude<ZoneKind, 'house'>, string> = {
  town: 'Ravenswood',
  tavern: 'The Raven’s Rest',
  bakery: 'The Bakery',
  church: 'The Church',
  tower: 'The Clock Tower',
};

/** Graphics quality: 'high' has shadows and crisp pixels; 'low' is for laptops that can't keep up. */
export type Quality = 'high' | 'low';

const params = new URLSearchParams(location.search);
/** ?fps=10 caps the frame rate, for tests on machines without a graphics card. */
const FPS_CAP = Number(params.get('fps')) || 0;
/** How far round (radians, either way) from the clock tower's side of the meeting circle the meeting shot keeps. */
const TOWER_CLEAR = 1.1;

/** Test stand-ins skip drawing (see drawless). */
const DRAW = !drawless();

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
  /** Where the player has swung the camera round them by holding the right mouse button (and how far up or down). */
  private swing = { yaw: 0, pitch: 0, drag: null as { id: number; x: number; y: number } | null };
  private dist = 14;
  private camTarget = new THREE.Vector3();
  private camPos = new THREE.Vector3(0, 12, 14);
  private camLook = new THREE.Vector3();
  private bookOpen = 0;
  private weather: Weather = 'clear';
  private dayProgressAt = -1;
  private lastShadowAt = -999;
  private stepAt = 0;
  private othersStepAt = new Map<string, { at: number; x: number; z: number }>();
  private rippleAt = 0;
  private unsubUI: (() => void) | null = null;

  private emote: { anim: Anim; until: number } | null = null;
  /** Sitting or lying on something: the y to sit at. */
  private seated: { y: number; anim: Anim } | null = null;
  /** The meeting stool we're sat on, as "seat/of", so we can move along if the seats are reordered. */
  private stool: string | null = null;
  private job: { job: GameJob; station: Station; prevItem: Item | null } | null = null;
  private sips = 0;
  /** Doors stay shut for a moment after arriving somewhere, so you don't bounce straight back through. */
  private doorsShutUntil = 0;
  /** Waiting at a door on the way in (see enterBy). */
  private entering: ReturnType<typeof setTimeout> | null = null;
  /** Where each other person was last seen going in through a door, so the chime rings once each time. */
  private doorBells = new Map<string, ZoneId>();
  private frozen = false;
  /** Tucked up in bed for the night: no getting up until morning. */
  private inBed = false;
  private meetingSeated = false;
  /** Voice volumes follow a timer rather than the frames, which stop while the tab is hidden. */
  private stopVoice: (() => void) | null = null;
  /** The end-of-game celebration on our stool: dancing or crying, until then. */
  /** The end-of-game dance (or cry), and how long it has left to run on screen. */
  private party: { anim: Anim; left: number } | null = null;
  private partyTimer: ReturnType<typeof setTimeout> | null = null;
  private lastFish = -1;
  /** Over the square when the game ends. */
  private fireworks = new Fireworks(MEETING_CENTRE);
  /** Slayer claims already seen, with what had come of them (null until the first view). */
  private slayerSeen: Map<string, string> | null = null;
  private wasJoined = false;
  private lastPhaseKey = '';
  private hudPrompt = '';
  private quality: Quality = params.get('fx') === 'low' ? 'low' : 'high';
  private slowFrames = 0;
  private lastFrameAt = 0;
  private nearStation: Station | null = null;
  private signs: { station: Station; el: HTMLDivElement; obj: CSS2DObject }[] = [];
  private wellTimer: ReturnType<typeof setTimeout> | null = null;
  private hearing = 0;
  private occluderRay = new THREE.Raycaster();
  private occluded = new Set<THREE.Mesh>();
  private lastShowId = new Set<string>();
  private gavelled = false;
  private lastWakeId: string | null = null;
  /** The gallows show in progress: who, and when it started on our clock. */
  private show: { id: string; seatId: string; name: string; start: number; mine: boolean; released: boolean; alive: boolean; survives: boolean } | null = null;
  /** The Storyteller hovering higher than usual, over someone's bed. */
  private hoverY = 0;
  /** The ground under us, eased, for walking up and down steps. */
  private groundS = 0;
  private nearDoor: { door: Door; locked: string | null } | null = null;
  /** The clock tower door we last went in by, to come back out of it. */
  private towerDoor: Door | null = null;
  /** The hooded figure's visit playing in this bedroom, and how the one in bed is jolted by it this frame. */
  private visit: { id: string; seatId: string; zone: ZoneId; mine: boolean; scene: NightVisit; start: number } | null = null;
  private victimPose: VictimPose | null = null;
  private visitsSeen = new Set<string>(loadJSON<string[]>(VISITS_SEEN_KEY, []));
  /** Messenger pigeons flying (or perched, or bursting) here, by id, with whose shoulder each is for. */
  private pigeons = new Map<string, { flight: PigeonFlight; to: string; start: number; noted: boolean }>();
  private pigeonsSeen = new Set<string>();
  /** The side of the confession booth we're sitting in, if we are. */
  private booth: Station | null = null;
  /** Since when (on the clock) we've been in the booth with someone on the other side, for the achievement. */
  private boothWith: number | null = null;

  constructor(
    private host: HTMLElement,
    hooks: WorldHooks,
  ) {
    this.hooks = hooks;
    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    // Filmic tone mapping keeps the bright cobbles and the dark rooms from clipping, for a richer picture.
    this.renderer.toneMapping = THREE.NeutralToneMapping;
    this.renderer.toneMappingExposure = 1.06;
    this.applyQuality();
    this.renderer.domElement.className = 'world-canvas';
    host.appendChild(this.renderer.domElement);
    this.labels = new CSS2DRenderer();
    this.labels.domElement.className = 'world-labels';
    host.appendChild(this.labels.domElement);

    this.town = createTown(this.scene, this.renderer);
    this.town.groups.town.add(this.fireworks.points);
    this.town.setLowDetail(this.quality === 'low');
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
    canvas.addEventListener('pointermove', this.onPointerMove);
    canvas.addEventListener('pointerup', this.onPointerUp);
    canvas.addEventListener('pointercancel', this.onPointerUp);
    canvas.addEventListener('wheel', this.onWheel, { passive: false });
    canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    // The browser can take the graphics away (a GPU reset, a driver update, too many tabs). three.js picks up
    // again by itself when they come back; meanwhile the player is told, and can reload if they never do.
    canvas.addEventListener('webglcontextlost', this.onContextLost);
    canvas.addEventListener('webglcontextrestored', this.onContextRestored);

    game.interact = () => this.interact();
    game.emote = (a) => this.startEmote(a);
    game.sip = () => this.sip();
    game.give = () => this.give();
    game.putAway = () => this.putAway();
    game.goTo = (key) => this.goTo(key);
    game.takeMeetingSeat = () => this.takeMeetingSeat();
    game.jobDone = (r) => this.finishJob(r);
    game.jobCancel = () => this.finishJob(undefined);
    game.calledToStool = () => {
      const v = this.view;
      if (!v || v.mode !== 'player' || !(v.townHall || v.nomination) || this.inBed || (this.seated && this.seated.y === STOOL_Y)) return;
      this.takeMeetingSeat();
      this.me?.bubble('The Storyteller sat you down', 2600);
    };
    game.summoned = (zone, x, z) => {
      // Called over by the Storyteller: stand a step in front of them, facing them.
      this.stopEverything();
      this.inBed = false;
      useHud.setState({ sheep: null });
      const a = Math.random() * Math.PI * 2;
      const sx = x + Math.cos(a) * 1.4;
      const sz = z + Math.sin(a) * 1.4;
      this.place(zone as ZoneId, sx, sz, Math.atan2(x - sx, z - sz), true);
      this.me?.bubble('The Storyteller called you over', 2600);
    };
    this.unsubUI = useUI.subscribe((s) => ambience.setEnabled(s.ambience && !s.muted));
    game.sheepDone = (correct) => {
      // The result stays up until they close it (or nod off); the HUD moves to 'done' then.
      if (correct) {
        this.hooks.townAction({ k: 'star' });
        this.me?.bubble('Counted them all!', 3000);
      } else this.me?.bubble('Zzz…', 2000);
    };

    this.stopVoice = steadyInterval(() => {
      try {
        this.syncVoice(this.view);
        this.listenAtDoors();
      } catch (e) {
        console.error(e);
      }
    }, 200);
    this.loop();
  }

  private onContextLost = (e: Event) => {
    e.preventDefault();
    useHud.setState({ gfxLost: Date.now() });
  };

  private onContextRestored = () => {
    useHud.setState({ gfxLost: null });
    // Back on lighter graphics, so it's less likely to happen again; the kept shadows need drawing afresh.
    if (this.quality !== 'low') {
      this.quality = 'low';
      this.applyQuality();
    }
    this.renderer.shadowMap.needsUpdate = true;
    this.lastShadowAt = -999;
    ui.toast('The graphics were reset, so the town is on low graphics now.', 'info');
  };

  dispose() {
    cancelAnimationFrame(this.raf);
    const canvas = this.renderer.domElement;
    canvas.removeEventListener('webglcontextlost', this.onContextLost);
    canvas.removeEventListener('webglcontextrestored', this.onContextRestored);
    this.stopVoice?.();
    if (this.partyTimer) clearTimeout(this.partyTimer);
    useHud.setState({ gfxLost: null });
    this.unsubUI?.();
    ambience.dispose();
    if (this.wellTimer) clearTimeout(this.wellTimer);
    for (const s of this.signs) s.el.remove();
    for (const k of ['interact', 'sip', 'give', 'putAway', 'takeMeetingSeat', 'calledToStool', 'jobCancel'] as const) game[k] = () => {};
    game.emote = game.goTo = game.jobDone = game.sheepDone = () => {};
    this.ro.disconnect();
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    window.removeEventListener('blur', this.onBlur);
    for (const a of this.others.values()) a.dispose();
    this.me?.dispose();
    this.fireworks.dispose();
    this.renderer.dispose();
    // Hand the graphics memory back now rather than whenever the page tidies up (a player's page builds the
    // town twice: once behind the join screens and again once they're in).
    this.renderer.forceContextLoss();
    this.renderer.domElement.remove();
    this.labels.domElement.remove();
  }

  private applyQuality() {
    const low = this.quality === 'low';
    this.renderer.setPixelRatio(low ? 1 : Math.min(window.devicePixelRatio, 1.6));
    this.renderer.shadowMap.enabled = !low;
    // The town exists after the first call (from the constructor), so this only applies on a later switch.
    (this as unknown as { town?: TownWorld }).town?.setLowDetail(low);
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
    this.updateSeating();

    if (!prev || prev.town !== v.town) this.town.setTown(v.town, Date.now());

    const nom = v.nomination;
    const meeting = Boolean(nom || v.townHall);
    const handOn = nom && (nom.status === 'running' || nom.status === 'paused' || nom.status === 'done') ? (nom.step === 0 ? nom.nomineeId : nom.order[nom.step - 1]) : null;
    // (The stools set out for the end of the game aren't a bell call: celebrate() seats everyone itself.)
    const newCall = v.townHall && !v.ended && (!prev?.townHall || prev.townHall.ring !== v.townHall.ring || prev.townHall.id !== v.townHall.id);
    if (newCall) {
      this.town.bellRing();
      if (v.mode === 'player' && zoneKind(local.zone) === 'tower') earn('fez');
      ui.banner('The bell is ringing', 'Everyone to the town square');
      // Players answer it themselves (from the bell card, or by walking up to their stool), so nobody is pulled out
      // of whatever they're in the middle of. The Storyteller can still seat anyone who doesn't come.
      // The Storyteller who rang it from inside a house comes out to the middle of the ring.
      if (v.mode === 'st' && this.me && zoneKind(local.zone) === 'house') this.place('town', MEETING_CENTRE.x, MEETING_CENTRE.z, Math.PI, true);
    }
    if (v.weather !== this.weather) {
      this.weather = v.weather;
      (this.town as TownWorld & TownFx).setWeather?.(v.weather);
      ambience.setWeather(v.weather);
    }
    // What the meeting is about, on a sign over the tower.
    let label = '';
    if (nom) {
      const who = (id: string | null) => (id ? (v.seats.find((s) => s.id === id)?.name ?? 'Someone') : 'The Storyteller');
      const alive = v.seats.filter((s) => !s.dead).length;
      const needs = Math.ceil(alive / 2);
      label = `${who(nom.nominatorId)} nominates ${who(nom.nomineeId)} · ${nom.votes.length} ${nom.votes.length === 1 ? 'vote' : 'votes'} · needs ${needs}`;
      if (nom.status === 'done') label = `${who(nom.nomineeId)}: ${nom.votes.length} ${nom.votes.length === 1 ? 'vote' : 'votes'}, needs ${needs}`;
    } else if (v.ended) {
      label = v.ended.winner === 'good' ? 'Good wins!' : 'Evil wins!';
    } else if (v.townHall?.gathered) {
      label = 'Town meeting';
    } else if (v.townHall) {
      const here = v.seats.filter((s) => v.townHall!.back.includes(s.id)).length;
      label = `Everyone to the square · ${here} of ${v.seats.length} seated`;
    }
    this.town.setGraves(v.seats.filter((s) => s.dead).map((s) => s.name));
    this.town.setPost(v.seats.map((s) => s.name), v.seats.map((s) => s.mail));
    this.town.setMeeting({
      n: v.seats.length,
      active: meeting,
      // While the bell rings, a player's own stool glows until they're sat on it, so they can find it on foot.
      mine: v.mode === 'player' && v.townHall && !v.townHall.gathered && !v.ended && v.mySeatId && !v.townHall.back.includes(v.mySeatId) ? seatIndex(v.mySeatId) : null,
      nominee: nom ? seatIndex(nom.nomineeId) : null,
      nominator: nom?.nominatorId ? seatIndex(nom.nominatorId) : null,
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

    // Someone claiming to be the Slayer calls it out; if nothing comes of it, the one they chose says so.
    const first = !this.slayerSeen;
    this.slayerSeen ??= new Map();
    for (const shot of v.slayer) {
      const was = this.slayerSeen.get(shot.id);
      if (was === shot.result) continue;
      this.slayerSeen.set(shot.id, shot.result);
      if (first) continue;
      const avatarOf = (id: string) => (id === v.mySeatId ? this.me : this.others.get(id));
      const target = v.seats.find((s) => s.id === shot.target)?.name || 'someone';
      if (was === undefined) avatarOf(shot.by)?.bubble(`🗡 I’m the Slayer! I choose ${target}!`, 4500);
      else if (shot.result === 'nothing') avatarOf(shot.target)?.bubble('…nothing happens', 3500);
    }

    this.syncMe(v);
    this.applyPhase(v, prev);
    if (v.ended && prev && !prev.ended) this.celebrate(v, v.ended.winner);
    else if (!v.ended && prev?.ended) {
      this.fireworks.stop();
      this.party = null;
      if (this.partyTimer) clearTimeout(this.partyTimer);
    }
    // On a meeting stool: move along if the Storyteller reorders the seats, and get up when the meeting ends.
    if (this.seated?.y === STOOL_Y && local.zone === 'town' && v.mode === 'player') {
      const i = this.meetingIndex();
      if (!meeting || i < 0) this.standUp();
      else if (this.stool !== `${i}/${v.seats.length}`) this.takeMeetingSeat();
    }
    // An execution: everyone turns to watch.
    const ex = v.execution;
    if (ex && ex.id !== this.show?.id && Date.now() - ex.at < 15000 && !this.lastShowId.has(ex.id)) {
      this.lastShowId.add(ex.id);
      const name = v.seats.find((s) => s.id === ex.seatId)?.name ?? 'Someone';
      this.show = { id: ex.id, seatId: ex.seatId, name, start: this.clock.elapsedTime, mine: ex.seatId === v.mySeatId, released: false, alive: true, survives: Boolean(ex.survives) };
      // (Popups wait from this moment, not from the next frame.)
      useHud.setState({ drama: true });
      // Everyone stops what they're doing to watch, but anyone on a meeting stool stays sat.
      if (this.show.mine || this.seated?.y !== STOOL_Y) this.stopEverything();
      const spot = this.town.gallowsSpot;
      if (this.show.mine) {
        this.place('town', spot.x, spot.z, spot.ry, true);
        this.frozen = true;
        this.me?.setInfo(this.infoFor(ex.seatId, v));
      }
      drumroll(SHOW.drop - 0.1);
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
    const really = s?.really ? getRole(s.really) : undefined;
    let badge: string | null = null;
    if (v.nomination?.nomineeId === key) badge = 'nominated';
    if (v.marked?.seatId === key) badge = 'on the block';
    return {
      name: s?.name ?? 'Someone',
      look: s?.look ?? null,
      // The condemned stay themselves until the puff at the end of the hanging.
      ghost: Boolean(s?.dead) && !(this.show?.alive && this.show.seatId === key),
      storyteller: false,
      isMe: key === v.mySeatId,
      role: role ? { name: really ? `${role.name} (${really.name})` : role.name, icon: iconUrl(role, s?.evil ? 'evil' : 'good'), evil: Boolean(s?.evil) } : null,
      badge,
      star: Boolean(s?.star),
      voting: Boolean(v.nomination && v.nomination.status !== 'done' && v.nomination.votes.includes(key)),
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
    else if (v.mode === 'player' && v.mySeatId && v.townHall && (v.ended || v.townHall.back.includes(v.mySeatId))) {
      // Back from a reload in the middle of a meeting we'd already sat down at (or the end of the game): straight
      // back onto our stool, rather than standing about by the square.
      this.goToSquareSpawn(false);
      this.sitOnStool();
    } else {
      this.goToSquareSpawn(false);
    }
  }

  private applyPhase(v: WorldView, prev: WorldView | null) {
    const key = `${v.started}:${v.phase}`;
    if (key === this.lastPhaseKey) return;
    const first = !this.lastPhaseKey;
    this.lastPhaseKey = key;
    // Morning: the Storyteller leaves the last bedside they visited and comes back out with everyone (inside a
    // house they'd hear nobody).
    if (this.me && v.mode === 'st' && !first && prev && v.phase === 'day' && zoneKind(local.zone) === 'house') this.goToSquareSpawn(true);
    if (!this.me || v.mode !== 'player') return;
    if (first || !prev) {
      // Joining (or reloading) in the night still means bed.
      if (v.started && v.phase === 'night' && !this.inBed) this.goHome(false);
      return;
    }
    if (v.started && v.phase === 'night') {
      this.stopEverything();
      this.goHome(true);
    } else if (v.phase === 'day' && zoneKind(local.zone) === 'house') {
      this.inBed = false;
      useHud.setState({ sheep: null });
      this.stopEverything();
      this.goToSquareSpawn(true);
    } else if (v.phase === 'day') {
      this.inBed = false;
      useHud.setState({ sheep: null });
    }
  }

  /** The morning arrival point by the square, spread out a little so nobody lands on anyone. */
  private goToSquareSpawn(fade: boolean) {
    const s = this.town.spawn;
    const a = Math.random() * Math.PI * 2;
    this.place('town', s.x + Math.cos(a) * 1.8, s.z + Math.sin(a) * 1.2, s.ry, fade);
  }

  /** Night: straight into bed, asleep, until morning. */
  private goHome(fade: boolean) {
    const id = this.view?.mySeatId;
    if (!id) return;
    const bed = this.town.stations.find((s) => s.id === 'bed');
    const h = bed?.stand ?? this.town.homeSpawn;
    this.inBed = true;
    this.place(houseZone(id), h.x, h.z, h.ry, fade, () => {
      if (!this.inBed) return;
      this.seated = { y: bed?.y ?? 0.52, anim: 'sleep' };
      if (this.me) {
        this.me.setTarget(local.x, local.z, local.ry, this.seated.y);
        this.me.snap();
      }
      useHud.setState({ sheep: 'offer' });
    });
  }

  /** Moves the local animal somewhere, optionally through a fade to black. */
  private place(zone: ZoneId, x: number, z: number, ry: number, fade: boolean, then?: () => void) {
    // Moved somewhere else (the bell, bedtime, the Storyteller) while waiting at a door: not going in after all.
    if (this.entering) {
      clearTimeout(this.entering);
      this.entering = null;
      local.entering = null;
    }
    const go = () => {
      this.hoverY = 0;
      this.booth = null;
      local.zone = zone;
      local.x = x;
      local.z = z;
      local.ry = ry;
      this.moveTarget = null;
      this.seated = null;
      // Whatever we were standing at is somewhere else now (the next frame finds what's here).
      this.nearStation = null;
      this.doorsShutUntil = performance.now() + 700;
      this.showZone();
      if (this.me) {
        this.me.setTarget(x, z, ry, 0);
        this.me.snap();
      }
      this.camTarget.set(x, 0, z);
      if (zoneKind(zone) !== 'town') this.yaw = this.swing.yaw = 0;
      then?.();
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
    // A bedroom is only ever visited at night: fire out, moon in the window.
    this.town.show(kind, kind === 'house' && cottageSlot(local.zone) === null);
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
    this.updateSeating();
  }

  /** The bedrooms' seating chart: everyone in the grimoire's order, whoever's room it is marked. */
  private updateSeating() {
    const v = this.view;
    if (!v) return;
    const owner = houseOwner(local.zone);
    // (The world's seats come in the grimoire's order.)
    this.town.setSeating(v.seats.map((s) => ({ name: s.name, dead: s.dead, owner: s.id === owner })));
  }

  // ---------------------------------------------------------------- input

  /** Browsers only allow sound after a click or a key, so the ambience waits for the first one. */
  private wakeAmbience() {
    const s = useUI.getState();
    if (s.ambience && !s.muted) ambience.start();
  }

  private onKeyDown = (e: KeyboardEvent) => {
    this.wakeAmbience();
    if (isTyping() || e.metaKey || e.ctrlKey || e.altKey) return;
    const k = e.key.toLowerCase();
    if (k === 'v') voice.setHolding(true);
    if (k === 'h' && this.view?.mode === 'player') voice.setShouting(true);
    if (useHud.getState().notice) {
      if (k === 'escape') useHud.setState({ notice: false });
      return;
    }
    if (this.view?.paused || this.job) return;
    if (this.inBed) {
      if (k === 'e' || k === ' ' || k === 'enter') {
        e.preventDefault();
        this.interact();
      }
      return;
    }
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
    else if (k === 'm') voice.setMuted(!useVoice.getState().muted);
    else {
      const emote = ({ '1': 'wave', '2': 'dance', '3': 'cheer', '4': 'laugh', '5': 'cry', '6': 'sit' } as Record<string, Anim>)[k];
      if (emote) this.startEmote(emote);
    }
  };

  private onKeyUp = (e: KeyboardEvent) => {
    const k = e.key.toLowerCase();
    if (k === 'v') voice.setHolding(false);
    if (k === 'h') voice.setShouting(false);
    this.keys.delete(k);
  };

  private onBlur = () => {
    this.keys.clear();
    voice.setHolding(false);
    voice.setShouting(false);
  };

  private onPointerDown = (e: PointerEvent) => {
    this.wakeAmbience();
    // Holding the right button and dragging swings the camera round our animal.
    if (e.button === 2) {
      this.swing.drag = { id: e.pointerId, x: e.clientX, y: e.clientY };
      this.renderer.domElement.setPointerCapture?.(e.pointerId);
      return;
    }
    if (e.button !== 0 || !this.me || this.view?.paused || this.job || this.inBed) return;
    // The Storyteller clicking a player opens their menu; anywhere else, a click walks there (not off a meeting stool).
    if (this.pinned()) return;
    const seat = this.view?.mode === 'st' ? this.avatarAt(e.clientX, e.clientY) : null;
    if (seat) game.pickSeat(seat, e.clientX, e.clientY);
    else this.walkTo(e.clientX, e.clientY);
  };

  private onPointerMove = (e: PointerEvent) => {
    const d = this.swing.drag;
    if (!d || d.id !== e.pointerId) return;
    this.swing.yaw -= (e.clientX - d.x) * 0.008;
    // Indoors the rooms are open on one side only: just a little way round either way.
    if (zoneKind(local.zone) !== 'town') this.swing.yaw = Math.max(-0.6, Math.min(0.6, this.swing.yaw));
    this.swing.pitch = Math.max(-0.4, Math.min(0.5, this.swing.pitch + (e.clientY - d.y) * 0.004));
    d.x = e.clientX;
    d.y = e.clientY;
  };

  private onPointerUp = (e: PointerEvent) => {
    if (this.swing.drag?.id === e.pointerId) this.swing.drag = null;
  };

  /** Walks to the ground under a screen point. */
  private walkTo(clientX: number, clientY: number) {
    const rect = this.renderer.domElement.getBoundingClientRect();
    const ndc = new THREE.Vector2(((clientX - rect.left) / rect.width) * 2 - 1, -((clientY - rect.top) / rect.height) * 2 + 1);
    const ray = new THREE.Raycaster();
    ray.setFromCamera(ndc, this.camera);
    const hit = new THREE.Vector3();
    if (ray.ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), hit)) {
      this.moveTarget = hit;
      this.stuckFor = 0;
      this.standUp();
    }
  }

  /** The seat of whoever is under a screen point, if anyone. */
  private avatarAt(clientX: number, clientY: number): string | null {
    const rect = this.renderer.domElement.getBoundingClientRect();
    const ndc = new THREE.Vector2(((clientX - rect.left) / rect.width) * 2 - 1, -((clientY - rect.top) / rect.height) * 2 + 1);
    const ray = new THREE.Raycaster();
    ray.setFromCamera(ndc, this.camera);
    const roots: THREE.Object3D[] = [];
    const keyOf = new Map<THREE.Object3D, string>();
    for (const [key, av] of this.others) {
      if (key === 'st' || !av.rig.root.visible) continue;
      roots.push(av.rig.root);
      keyOf.set(av.rig.root, key);
    }
    for (const hit of ray.intersectObjects(roots, true)) {
      let o: THREE.Object3D | null = hit.object;
      while (o && !keyOf.has(o)) o = o.parent;
      if (o) return keyOf.get(o)!;
    }
    return null;
  }

  /** Footsteps for us and anyone walking close by, and ripples where people cross the pier. */
  private footsteps(t: number, v: WorldView | null) {
    if (!v || v.mode === 'preview') return;
    const stride = this.keys.has('shift') ? 0.27 : 0.36;
    const walking = (local.anim === 'walk' || local.anim === 'run') && !this.seated && this.hoverY === 0 && v.mode !== 'st';
    if (walking && t - this.stepAt > stride) {
      this.stepAt = t;
      ambience.footstep(surfaceAt(local.zone, local.x, local.z), 1);
      if (local.anim === 'run' && onDirt(local.zone, local.x, local.z)) this.town.puff(local.x, 0, local.z);
    }
    let onPier = walking && onDock(local.zone, local.x, local.z) ? [local.x, local.z] : null;
    for (const [key, p] of presence.others) {
      if (key === 'st' || p.zone !== local.zone) continue;
      const d = Math.hypot(p.x - local.x, p.z - local.z);
      const prev = this.othersStepAt.get(key);
      const moved = prev ? Math.hypot(p.x - prev.x, p.z - prev.z) : 0;
      if (!prev || t - prev.at > 0.4) {
        this.othersStepAt.set(key, { at: t, x: p.x, z: p.z });
        if (prev && moved > 0.25 && d < 9) ambience.footstep(surfaceAt(p.zone, p.x, p.z), Math.max(0.15, 1 - d / 9) * 0.6);
        // Faster than a walk: running, so a puff of dust on the paths.
        if (prev && moved / Math.max(0.05, t - prev.at) > (WALK + RUN) / 2 && d < 30 && onDirt(p.zone, p.x, p.z)) this.town.puff(p.x, 0, p.z);
        if (prev && moved > 0.25 && onDock(p.zone, p.x, p.z)) onPier = [p.x, p.z];
      }
    }
    if (onPier && t - this.rippleAt > 0.7) {
      this.rippleAt = t;
      (this.town as TownWorld & TownFx).ripple?.(onPier[0] + (Math.random() - 0.5) * 1.6, onPier[1], 0.45);
    }
  }


  private onWheel = (e: WheelEvent) => {
    e.preventDefault();
    this.dist = Math.max(8, Math.min(26, this.dist + Math.sign(e.deltaY) * 1.2));
  };

  // ---------------------------------------------------------------- doing things

  private stopEverything() {
    if (this.booth) this.leaveBooth();
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
    if (!this.me || this.job || this.inBed) return;
    // On a meeting stool: wave, laugh and the rest happen sitting there, and "sit" doesn't stand them up.
    if (this.pinned()) {
      if (anim !== 'sit') this.emote = { anim, until: this.clock.elapsedTime + (EMOTE_TIME[anim] ?? 2.5) };
      return;
    }
    if (anim === 'sit') {
      this.seated = this.seated ? null : { y: 0, anim: 'sit' };
      this.emote = null;
      return;
    }
    this.seated = null;
    this.emote = { anim, until: this.clock.elapsedTime + (EMOTE_TIME[anim] ?? 2.5) };
    this.moveTarget = null;
    // Dancing right in the middle of the meeting circle, up on the dais.
    if (anim === 'dance' && this.view?.mode === 'player' && local.zone === 'town' && Math.hypot(local.x - MEETING_CENTRE.x, local.z - MEETING_CENTRE.z) < 1.2) earn('disco');
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
          if (this.view?.mode === 'player') tally('snacks');
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

  /** Whoever (else) is sitting in this side of the confession booth: by name for the Storyteller, otherwise just someone. */
  private boothTaken(s: Station): string | null {
    for (const [key, p] of presence.others) {
      if (p.zone !== 'church' || Math.hypot(p.x - s.stand.x, p.z - s.stand.z) > 0.5) continue;
      if (this.view?.mode !== 'st') return 'Someone';
      return key === 'st' ? 'The Storyteller' : this.view?.seats.find((x) => x.id === key)?.name || 'Someone';
    }
    return null;
  }

  /** Whether both sides of the confession booth have someone sitting in them (us included). */
  private boothFull(): boolean {
    return BOOTH_SEATS.every((seat) => {
      if (this.booth && local.zone === 'church' && Math.hypot(local.x - seat.x, local.z - seat.z) < 0.5) return true;
      for (const p of presence.others.values()) if (p.zone === 'church' && Math.hypot(p.x - seat.x, p.z - seat.z) < 0.5) return true;
      return false;
    });
  }

  /** Out through the curtain, to stand in front of the side we were in. */
  private leaveBooth() {
    const s = this.booth;
    this.booth = null;
    if (!s) return;
    this.seated = null;
    local.x = s.stand.x;
    local.z = BOOTH.z1 + 0.55;
    local.ry = 0;
    this.me?.setTarget(local.x, local.z, local.ry, 0);
    this.me?.snap();
    useHud.setState({ place: PLACE_NAMES.church });
  }

  /**
   * In the booth: if two people stepped into the same side at once, the one who sorts later steps back out (both
   * pages decide the same way); and talking with someone on the other side for a while earns its achievement.
   */
  private checkBooth(t: number, v: WorldView) {
    const s = this.booth;
    if (!s) return;
    const myKey = v.mode === 'st' ? 'st' : (v.mySeatId ?? '');
    let other = false;
    for (const [key, p] of presence.others) {
      if (!inBooth(p.zone, p.x, p.z)) continue;
      if (Math.hypot(p.x - s.stand.x, p.z - s.stand.z) < 0.5) {
        if (key < myKey) {
          this.leaveBooth();
          this.me?.bubble('Someone got there first', 2200);
          return;
        }
      } else other = true;
    }
    // (Real time on the clock, not frames, which a slow machine has few of.)
    this.boothWith = other ? (this.boothWith ?? t) : null;
    if (this.boothWith !== null && t - this.boothWith > 20 && v.mode === 'player') earn('confess');
  }

  private give() {
    const item = local.item;
    const near = this.nearestOther(2.6);
    if (!item || item.k === 'grimoire' || !near || this.job) return;
    this.hooks.give(near.key, item);
    setItem(null);
    this.sips = 0;
    this.emote = { anim: 'wave', until: this.clock.elapsedTime + 1.2 };
    // Different people, by name, across games.
    const to = this.view?.seats.find((s) => s.id === near.key)?.name;
    if (this.view?.mode === 'player' && to) tally('gifts', 1, `gift:${to.toLowerCase()}`);
    if (this.view?.mode === 'player' && near.key === 'st') earn('teacher');
    // A tea party: drinks for three different people in one day.
    if (this.view?.mode === 'player' && DRINKS.has(item.k)) {
      const day = this.view.day;
      if (this.teaParty.day !== day) this.teaParty = { day, to: new Set() };
      this.teaParty.to.add(near.key);
      if (this.teaParty.to.size >= 3) earn('teaparty');
    }
  }

  private teaParty = { day: -1, to: new Set<string>() };

  private putAway() {
    if (!local.item || local.item.k === 'grimoire' || this.job) return;
    setItem(null);
    this.sips = 0;
  }

  private interact() {
    if (!this.me || this.view?.paused || this.job || this.frozen || this.pinned()) return;
    if (this.inBed) {
      if (useHud.getState().sheep === 'offer') useHud.setState({ sheep: 'playing' });
      return;
    }
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
        if (this.view?.mode === 'player') tally('buckets');
      }, 1600);
    } else if (s.job === 'notice') {
      useHud.setState({ notice: true });
    } else if (s.job === 'post') {
      if (v?.mode !== 'player') this.me.bubble('Only players post letters', 2000);
      else ui.open({ kind: 'letter' });
    } else if (s.job === 'confess') {
      if (this.booth) return this.leaveBooth();
      const who = this.boothTaken(s);
      if (who) {
        this.me.bubble(`${who} is in that side`, 2200);
        return;
      }
      this.stopEverything();
      this.booth = s;
      this.boothWith = null;
      local.x = s.stand.x;
      local.z = s.stand.z;
      local.ry = s.stand.ry;
      this.seated = { y: s.y ?? 0.48, anim: 'sit' };
      this.me.setTarget(local.x, local.z, local.ry, this.seated.y);
      this.me.snap();
      this.me.bubble('In here, only the other side can hear you', 3200);
      useHud.setState({ place: 'The Confession Booth' });
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
          if (x.cm > 0 && this.view?.mode === 'player') tally('fish');
          if (this.view?.mode === 'player') {
            tally('kinds', 1, `fishkind:${x.kind}`);
            if (x.kind === 'Old Boot') earn('boot');
            if (x.tier === 'legendary') earn('legend');
          }
          if (x.tier === 'rare' || x.tier === 'legendary') this.me?.bubble(`${x.tier === 'legendary' ? '🌙 Legendary' : '✨ Rare'}: ${x.kind}, ${x.cm}cm!`, 5000);
          break;
        }
        case 'darts': {
          const x = r as JobResults['darts'];
          this.me?.bubble(`${x.score} at darts!`, 3000);
          break;
        }
        case 'bread': {
          const x = r as JobResults['bread'];
          item = { k: 'bun' };
          this.me?.bubble(`Broke the bread ${x.evenness}% even`, 3000);
          break;
        }
        case 'wine': {
          const x = r as JobResults['wine'];
          item = { k: 'wine' };
          this.me?.bubble(`Poured the wine: ${x.fill}% full`, 3000);
          break;
        }
        case 'firewood': {
          const x = r as JobResults['firewood'];
          if (x.logs > 0) item = { k: 'firewood' };
          this.me?.bubble(`${x.logs} of 5 logs split clean`, 3000);
          break;
        }
        case 'skimming': {
          const x = r as JobResults['skimming'];
          this.me?.bubble(x.bounces ? `${x.bounces} ${x.bounces === 1 ? 'skip' : 'skips'}!` : 'Plop.', 3000);
          // The stone's skips ripple across the real pond.
          {
            const fx = this.town as TownWorld & TownFx;
            const n = Math.max(1, Math.min(8, x.bounces || 1));
            for (let i = 0; i < n; i++) setTimeout(() => fx.ripple?.(local.x + Math.sin(local.ry) * (1.5 + i * 0.9), local.z + Math.cos(local.ry) * (1.5 + i * 0.9), 0.5), i * 260);
          }
          break;
        }
        case 'coin': {
          const x = r as JobResults['coin'];
          this.me?.bubble(x.wish ? `✨ ${x.fortune}` : 'Clink. Not this time.', 6000);
          if (this.view?.mode === 'player') tally('wishes');
          break;
        }
        case 'clock': {
          const x = r as JobResults['clock'];
          this.me?.bubble(`Kept the clock ${x.accuracy}% in time`, 3000);
          break;
        }
      }
      // Doing a job perfectly earns its hat (all five logs split, three stars, a wish come true).
      const perfect = j.job === 'firewood' ? (r as JobResults['firewood']).logs >= 5 : ((r as { stars?: number }).stars ?? 0) >= 3;
      if (perfect && isPlayerView(this.view)) notePerfect(j.job);
      // (Each one earns a little money too, and having a go at every job is an achievement.)
      if (perfect && isPlayerView(this.view)) noteTopJob(j.job);
      if (isPlayerView(this.view)) tally('jobs', 1, `job:${j.job}`);
      // Anything that beats the town's best is kept on the noticeboard for everyone.
      const score = SCORE_OF?.[j.job]?.(r as never) ?? 0;
      if (score > 0) {
        this.hooks.townAction({ k: 'record', game: j.job, score });
        rememberBest(j.job, score);
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
    // Not while they're on the gallows: they get their stool back once the show is over.
    if (!v || i < 0 || !this.me || this.show?.mine) return;
    this.stopEverything();
    if (local.zone === 'town' && Math.hypot(local.x, local.z) < this.town.meetingRadius * 1.4) this.sitOnStool();
    else {
      // From further off, through a fade, sitting down at the darkest moment: nothing (a key still held down, a
      // click on the ground) gets a frame to move us off the stool between arriving and sitting.
      const spot = this.town.meetingSpot(i, v.seats.length);
      this.place('town', spot.x, spot.z, spot.ry, true, () => this.sitOnStool());
    }
  }

  /**
   * Onto our own stool, worked out as the seats stand now (the Storyteller may have reordered them, or added one,
   * since we set off). We're put exactly on it, not just shown there, and say we're sitting straight away: a tab in
   * the background draws no frames to say so, and everyone else would see us standing in the stool.
   */
  private sitOnStool() {
    const v = this.view;
    const i = this.meetingIndex();
    if (!v || i < 0 || this.show?.mine || local.zone !== 'town') return;
    const spot = this.town.meetingSpot(i, v.seats.length);
    local.x = spot.x;
    local.z = spot.z;
    local.ry = spot.ry;
    local.anim = 'sit';
    this.moveTarget = null;
    this.seated = { y: STOOL_Y, anim: 'sit' };
    this.stool = `${i}/${v.seats.length}`;
    this.me?.setTarget(spot.x, spot.z, spot.ry, STOOL_Y);
    this.me?.snap();
  }

  /**
   * The game is over: fireworks over the square, everyone to their stool in the ring with every character showing,
   * and the winners up dancing on their stools while the losers have a little cry.
   */
  private celebrate(v: WorldView, winner: 'good' | 'evil') {
    this.fireworks.start(winner);
    if (v.mode === 'st') {
      this.stopEverything();
      this.place('town', MEETING_CENTRE.x, MEETING_CENTRE.z, Math.PI, true);
      return;
    }
    if (v.mode !== 'player') return;
    const mine = v.seats.find((s) => s.id === v.mySeatId);
    const won = Boolean(mine) && mine!.evil === (winner === 'evil');
    // Out of the way of any move the dawn makes (out of bed, say), then up on the stool. The celebration is kept
    // apart from ordinary emotes, so being seated again (the seats reordered) doesn't end it.
    if (this.partyTimer) clearTimeout(this.partyTimer);
    this.partyTimer = setTimeout(() => {
      this.partyTimer = null;
      this.takeMeetingSeat();
      this.party = { anim: won ? 'dance' : 'cry', left: won ? 18 : 8 };
    }, 700);
  }

  // ---------------------------------------------------------------- every frame

  private loop = () => {
    this.raf = requestAnimationFrame(this.loop);
    const cap = FPS_CAP;
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
      reportProblem(e, '3D town');
    }
  };

  private frame(dt: number, t: number) {
    const v = this.view;
    // Night falls (and lifts) over a few seconds.
    const night = v && v.started && v.phase === 'night' ? 1 : 0;
    this.time += (night - this.time) * Math.min(1, dt * 0.7);
    ambience.update({ zone: local.zone, x: local.x, z: local.z, night: this.time, yaw: this.yaw });
    if (Math.abs(this.time - this.litAt) > 0.002) {
      this.litAt = this.time;
      this.town.setTime(this.time);
    }

    // The sun crosses the sky as the day's timer runs down (mid-morning when there's no timer).
    const fx = this.town as TownWorld & TownFx;
    if (v && fx.setDayProgress) {
      const timer = v.dayTimer;
      const p = timer && v.phase === 'day' ? Math.min(1, Math.max(0, (Date.now() - timer.start) / Math.max(1, timer.end - timer.start))) : 0.35;
      if (Math.abs(p - this.dayProgressAt) > 0.004) {
        this.dayProgressAt = p;
        fx.setDayProgress(p);
      }
    }

    this.runShow(t);
    this.runVisit(t, v);
    this.runPigeons(t, v);
    // Unlock popups wait while something everyone should watch is on screen.
    const drama = Boolean(this.show || this.visit);
    if (drama !== useHud.getState().drama) useHud.setState({ drama });
    if (this.me && v) this.moveMe(dt, t, v);
    this.updateOthers(dt, t, v);
    this.updateCamera(dt, t);
    this.fadeOccluders(dt);
    this.town.follow(this.camTarget.x, this.camTarget.z);
    // The confession booth's curtains close while someone sits on each side.
    this.town.setBoothCurtains(this.boothFull());
    this.town.update(dt, t);
    this.footsteps(t, v);
    this.fireworks.update(dt);

    // Shadows are baked: the map is only redrawn when the town says something changed (and now and then).
    if (fx.consumeShadowDirty && this.renderer.shadowMap.enabled) {
      this.renderer.shadowMap.autoUpdate = false;
      if (fx.consumeShadowDirty() || t - this.lastShadowAt > SHADOW_SAFETY_S) {
        this.lastShadowAt = t;
        this.renderer.shadowMap.needsUpdate = true;
      }
    }


    for (const s of this.signs) {
      if (s.station.zone !== zoneKind(local.zone)) continue;
      const d = Math.hypot(s.station.x - local.x, s.station.z - local.z);
      const near = this.nearStation && this.nearStation.job === s.station.job && this.nearStation.zone === s.station.zone;
      const a = near || this.job ? 0 : Math.max(0, Math.min(1, (26 - d) / 10));
      s.el.style.opacity = a.toFixed(2);
    }
    if (DRAW) this.draw();
    if (!useHud.getState().ready) useHud.setState({ ready: true });
  }

  /** Draws the frame. A test page that doesn't draw as it goes calls this once for a screenshot. */
  draw() {
    this.renderer.render(this.scene, this.camera);
    this.labels.render(this.scene, this.camera);
  }

  /**
   * At a town meeting (or while a nomination is on), a player on their stool stays there, in grimoire order, until
   * the Storyteller ends it: no walking off, no getting up.
   */
  private pinned(): boolean {
    const v = this.view;
    return Boolean(v && v.mode === 'player' && (v.townHall || v.nomination) && this.seated?.y === STOOL_Y && local.zone === 'town');
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
    const pinned = this.pinned();
    if (pinned) this.moveTarget = null;
    if (!v.paused && !this.job && !this.frozen && !this.inBed && !pinned && !this.entering) {
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
    }
    if (!(ix || iz) && this.moveTarget && !this.frozen && !this.entering) {
      const tx = this.moveTarget.x - local.x;
      const tz = this.moveTarget.z - local.z;
      const d = Math.hypot(tx, tz);
      if (d < 0.25) this.moveTarget = null;
      else {
        dx = tx / d;
        dz = tz / d;
      }
    }
    // Walking off from inside the confession booth: out through the curtain first.
    if ((dx !== 0 || dz !== 0) && this.booth) {
      this.leaveBooth();
      dx = dz = 0;
      this.moveTarget = null;
    }
    const moving = dx !== 0 || dz !== 0;
    if (moving) {
      this.hoverY = 0;
      this.standUp();
      if (this.emote && this.emote.anim !== 'drink') this.emote = null;
      const running = this.keys.has('shift');
      // (Every hat a player has makes them a touch quicker.)
      const speed = st ? (running ? FLOAT * 1.7 : FLOAT) : (running ? RUN : WALK) * hatBoost();
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

    if (!st && local.item?.k === 'grimoire') setItem(null);
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
    else if (this.party && this.party.left > 0 && this.seated?.y === STOOL_Y) {
      // Counted in time actually shown, so a stall or the tab being in the background doesn't eat it.
      this.party.left -= dt;
      anim = this.party.anim;
    }
    else if (this.seated) anim = this.seated.anim;
    local.anim = anim;
    local.speaking = voice.speaking();
    me.setVoiceState(Boolean(local.muted), Boolean(local.shout));
    me.setPrivate(inBooth(local.zone, local.x, local.z));
    useHud.setState((h) => {
      const emote = this.emote?.anim ?? (this.seated?.anim === 'sit' && this.seated.y === 0 ? 'sit' : null);
      const canSip = Boolean(local.item && SIPPABLE.has(local.item.k));
      return h.emote === emote && h.canSip === canSip ? h : { emote, canSip };
    });

    // Standing (or sitting on the ground) on whatever is underfoot; on a seat, at the seat's height. Up and
    // down the dais steps it eases rather than pops (a jump in place, like arriving somewhere, snaps).
    const groundNow = groundY(local.zone, local.x, local.z);
    this.groundS = Math.abs(groundNow - this.groundS) > 0.6 ? groundNow : this.groundS + (groundNow - this.groundS) * (1 - Math.exp(-dt * 18));
    const myGround = this.groundS;
    me.ground = myGround;
    let myY = this.seated ? this.seated.y || myGround : this.hoverY + myGround;
    let dangle: { swing: number; scale: number; hidden: boolean } | null = null;
    if (this.show?.mine) {
      const sp = this.showPose(this.showAge(t), this.bodyOf(me));
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
    me.rig.root.rotation.z = (dangle?.swing ?? 0) + (this.visit?.mine && this.victimPose ? this.victimPose.shake : 0);
    if (this.visit?.mine && this.victimPose) me.rig.root.position.y += this.victimPose.dy;
    me.rig.root.scale.setScalar(dangle?.scale ?? 1);
    if (this.visit?.mine && this.victimPose) bendVictim(me.rig.root, this.victimPose);
    // Down in the dark under the gallows (or through the bed), their name tag goes too.
    me.setTagShown(!dangle?.hidden && !(this.visit?.mine && this.victimPose?.hidden));

    this.checkDoors(v, moving, dx, dz);
    this.checkStations(v);
    this.checkBooth(t, v);
    if (v.mode === 'player') this.checkStool(v);
    if (v.mode === 'player') this.trackFeats(dt, t, v, moving);
  }

  /** While the town meets, walking up to your own stool sits you down on it: the way to answer the bell on foot. */
  private checkStool(v: WorldView) {
    if (!v.townHall || v.ended || this.seated || this.job || this.show || this.frozen || local.zone !== 'town') return;
    const i = this.meetingIndex();
    if (i < 0) return;
    const spot = this.town.meetingSpot(i, v.seats.length);
    if (Math.hypot(spot.x - local.x, spot.z - local.z) < 1) this.takeMeetingSeat();
  }

  /** For the achievements: talk, places visited today, a lap of the ring road, spinning, a ghost among the graves. */
  private feat = {
    talk: 0,
    talkAt: 0,
    places: new Set<string>(),
    day: -1,
    lapAngle: 0,
    lapLast: null as number | null,
    still: 0,
    spin: [] as { t: number; d: number }[],
    lastRy: 0,
    danceSince: null as number | null,
    idleSince: null as number | null,
    zone: '' as ZoneId,
  };
  private trackFeats(dt: number, t: number, v: WorldView, moving: boolean) {
    const f = this.feat;
    // Every ten seconds of talking counts (real time between frames, however few frames there are).
    const since = Math.min(1, Math.max(0, t - f.talkAt));
    f.talkAt = t;
    if (local.speaking) {
      f.talk += since;
      if (f.talk >= 10) {
        f.talk -= 10;
        tally('talk', 10);
      }
    }
    // The four public buildings in one day.
    const day = v.phase === 'day' ? v.day : -1;
    if (day !== f.day) {
      f.day = day;
      f.places.clear();
    }
    const kind = zoneKind(local.zone);
    // Each of the cottages in town, popped into (once each, ever).
    if (local.zone !== f.zone) {
      f.zone = local.zone;
      if (cottageSlot(local.zone) !== null) tally('cottages', 1, local.zone);
    }
    if (v.phase === 'day' && kind !== 'town' && kind !== 'house') {
      f.places.add(kind);
      if (f.places.size >= 4) earn('tourist');
    }
    // A lap of the ring road, keeping going: the angle round the town adds up while on the road and moving.
    const r = Math.hypot(local.x, local.z);
    const onRoad = kind === 'town' && Math.abs(r - RING_ROAD_R) < 2.2;
    f.still = moving ? 0 : f.still + dt;
    if (!onRoad || f.still > 2) {
      f.lapAngle = 0;
      f.lapLast = null;
    } else {
      const a = Math.atan2(local.x, -local.z);
      if (f.lapLast !== null) f.lapAngle += wrapAngle(a - f.lapLast);
      f.lapLast = a;
      if (Math.abs(f.lapAngle) >= Math.PI * 2) earn('lap');
    }
    // Spinning: five whole turns inside six seconds.
    const turn = wrapAngle(local.ry - f.lastRy);
    f.lastRy = local.ry;
    if (Math.abs(turn) > 0.0001) f.spin.push({ t, d: turn });
    while (f.spin.length && t - f.spin[0].t > 6) f.spin.shift();
    if (Math.abs(f.spin.reduce((sum, x) => sum + x.d, 0)) >= Math.PI * 10) earn('dizzy');
    // Dancing a whole minute without a break (each dance lasts a few seconds, so keep it going), and standing
    // stock still, doing nothing at all, for five (real time, however few frames there are).
    const dancing = this.emote?.anim === 'dance' && this.emote.until > this.clock.elapsedTime;
    f.danceSince = dancing ? (f.danceSince ?? t) : null;
    if (f.danceSince !== null && t - f.danceSince >= 60) earn('onemore');
    const idle = !moving && !this.emote && !this.seated && !this.inBed && !this.job && !this.show && Math.abs(turn) < 0.0001;
    f.idleSince = idle ? (f.idleSince ?? t) : null;
    if (f.idleSince !== null && t - f.idleSince >= 300) earn('afk');
    if (kind === 'town') {
      // The fairy ring, out among the trees.
      if (Math.hypot(local.x - FAIRY_RING.x, local.z - FAIRY_RING.z) < FAIRY_RING.r * 0.75) earn('fairyring');
      // A ghost wandering among the graves, and one dancing there.
      const me = v.seats.find((s) => s.id === v.mySeatId);
      if (me?.dead && Math.abs(local.x - GRAVEYARD.x) < GRAVEYARD.hw + 1 && Math.abs(local.z - GRAVEYARD.z) < GRAVEYARD.hd + 1) {
        earn('haunting');
        if (dancing) earn('thriller');
      }
    }
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
    // Out of the clock tower by the door you came in through.
    const back = door.id === 'tower-out' ? this.towerDoor?.back : undefined;
    if (back) return { zone: door.to, x: back.x, z: back.z, ry: back.ry };
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
      // Only walking into a door opens it, not standing next to one. The tower's doors want you heading for the
      // tower itself, so walking round it (or past the front on the way to the stools) doesn't take you in.
      let toward = moving && (door.x - local.x) * dx + (door.z - local.z) * dz > -0.2;
      if (toward && door.id.startsWith('tower-in')) {
        const len = Math.hypot(dx, dz) * Math.hypot(local.x, local.z) || 1;
        toward = (-local.x * dx - local.z * dz) / len > 0.6;
      }
      if (toward && performance.now() >= this.doorsShutUntil && !this.job && !this.entering) {
        this.doorsShutUntil = performance.now() + 1000;
        if (door.id.startsWith('tower-in')) this.towerDoor = door;
        if (zoneKind(target.zone) !== 'town') this.enterBy(door, target);
        else this.place(target.zone, target.x, target.z, target.ry, true);
      }
      return;
    }
  }

  /**
   * Going in somewhere (anywhere but out into town): a moment at the door while it swings open and the chime rings
   * for whoever is inside, so they can stop talking, and then in. The chime goes out with our pose (`entering`).
   */
  private enterBy(door: Door, target: { zone: ZoneId; x: number; z: number; ry: number }) {
    this.moveTarget = null;
    this.emote = null;
    local.ry = Math.atan2(door.x - local.x, door.z - local.z);
    local.entering = target.zone;
    doorChime(0.7);
    this.town.openDoor(door.x, door.z);
    const wait = setTimeout(() => {
      if (this.entering !== wait) return;
      this.entering = null;
      local.entering = null;
      this.place(target.zone, target.x, target.z, target.ry, true);
    }, DOOR_WAIT_MS);
    this.entering = wait;
  }

  /** Someone else coming in through a door: the chime for everyone inside, and the door swinging open for anyone outside. */
  private listenAtDoors() {
    for (const [key, p] of presence.others) {
      const to = p.entering ?? null;
      if (to === (this.doorBells.get(key) ?? null)) continue;
      if (to) this.doorBells.set(key, to);
      else this.doorBells.delete(key);
      if (!to || !this.me) continue;
      if (to === local.zone) doorChime();
      else if (p.zone === local.zone) this.town.openDoor(p.x, p.z);
    }
    for (const key of this.doorBells.keys()) if (!presence.others.has(key)) this.doorBells.delete(key);
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
    else if (this.inBed) {
      const sheep = useHud.getState().sheep;
      prompt = sheep === 'offer' ? { label: 'Count the sheep', key: 'E' } : sheep === 'playing' ? null : { label: 'Fast asleep until morning', key: '', locked: true };
    } else if (this.nearDoor?.locked) prompt = { label: this.nearDoor.locked, key: '', locked: true };
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
      else if (best.job === 'confess') {
        const who = this.booth ? null : this.boothTaken(best);
        if (this.booth) label = 'Step out of the booth';
        else if (who) {
          label = `${who} is in that side`;
          locked = true;
        }
      }
      prompt = { label, key: locked ? '' : 'E', locked };
    } else if (local.item && SIPPABLE.has(local.item.k)) {
      prompt = { label: ['ale', 'cider', 'milk', 'cocoa'].includes(local.item.k) ? 'Have a sip' : 'Have a bite', key: 'E' };
    }
    const near = local.item && local.item.k !== 'grimoire' && !this.job ? this.nearestOther(2.6) : null;
    // (Someone in a booth stays nameless.)
    const at = near ? presence.others.get(near.key) : undefined;
    const nameless = Boolean(at && v.mode !== 'st' && inBooth(at.zone, at.x, at.z));
    const giveTo = near ? { key: near.key, name: nameless ? 'them' : near.key === 'st' ? 'the Storyteller' : v.seats.find((s) => s.id === near.key)?.name || 'them' } : null;
    const json = JSON.stringify([prompt, giveTo]);
    if (json !== this.hudPrompt) {
      this.hudPrompt = json;
      useHud.setState({ prompt, giveTo });
    }
  }

  /**
   * The gallows (timings in SHOW): a short drumroll while the noose comes down, the gavel and the drop, the
   * rope taking the weight with a small bounce and a swing that dies away, then a puff and the ghost let go.
   */
  private runShow(t: number) {
    const show = this.show;
    if (!show) return;
    const age = this.showAge(t);
    const spot = this.town.gallowsSpot;
    if (age >= SHOW.drop && !this.gavelled) {
      this.gavelled = true;
      gavel();
    }
    // The trapdoor snaps open on the drop and swings shut once the ghost is up. For someone who survives it only
    // rattles: it jams, and the rope snaps instead.
    const shut = SHOW.puff + SHOW.rise;
    const after = age - SHOW.drop;
    const open = show.survives
      ? after > 0
        ? 0.07 * Math.exp(-5 * after) * Math.abs(Math.sin(26 * after))
        : 0
      : age < SHOW.drop
        ? 0
        : age < shut
          ? Math.min(1, after / 0.1)
          : Math.max(0, 1 - (age - shut) / 0.3);
    const av = show.mine ? this.me : this.others.get(show.seatId);
    const pose = this.showPose(age, this.bodyOf(av));
    const over = age >= SHOW.end;
    const snapped = show.survives ? after - SHOW.snap : 0;
    if (snapped > 0 && !show.released) {
      show.released = true;
      ropeSnap();
      this.town.puff(pose.x, pose.y, pose.z);
    }
    this.town.setGallows({
      open,
      label: show.survives ? (over ? '' : snapped > 0 ? `${show.name} survives!` : `${show.name} is hanged`) : age < SHOW.puff ? `${show.name} is hanged` : '',
      rope: over ? GALLOWS_ROPE_REST : pose.rope,
      ring: over ? 0 : pose.ring,
      swing: over ? 0 : pose.swing,
      puff: pose.puff,
      snapped: over ? 0 : Math.max(0, snapped),
    });
    // They only become a ghost at the puff, not before the drop (and not at all if they survive).
    if (show.alive && !show.survives && age >= SHOW.puff) {
      show.alive = false;
      const v = this.view;
      if (v) {
        if (show.mine) this.me?.setInfo(this.infoFor(show.seatId, v));
        else this.others.get(show.seatId)?.setInfo(this.infoFor(show.seatId, v));
      }
    }
    // Onlookers keep them hidden a moment longer, until the condemned's new spot has come over the network,
    // then put the ghost straight there rather than popping up on the trapdoor and sliding off.
    if (age > (show.mine ? SHOW.end : SHOW.end + 0.8)) {
      if (show.mine) {
        this.frozen = false;
        const v = this.view;
        // Still in a meeting: back to their own stool, as a ghost. Otherwise they step off beside the gallows.
        if (v && (v.townHall || v.nomination) && this.meetingIndex() >= 0) {
          this.place('town', spot.x + 2.2, spot.z + 1.4, Math.PI, false);
          this.show = null;
          this.gavelled = false;
          this.takeMeetingSeat();
          return;
        }
        this.place('town', spot.x + 2.2, spot.z + 1.4, Math.PI, false);
      } else {
        const gone = this.others.get(show.seatId);
        if (gone) gone.placed = false;
      }
      this.show = null;
      this.gavelled = false;
    }
  }


  /**
   * The hooded figure's visit. It plays for the player who was killed, tucked up in their own bed (with the camera
   * pulled back to watch it), or for the Storyteller if they're at that bedside; once only, on each screen. It stops
   * if whoever is watching leaves the room (dawn, say).
   */
  private runVisit(t: number, v: WorldView | null) {
    if (!this.visit && v && v.phase === 'night' && this.me) {
      for (const vis of v.visits) {
        const zone = houseZone(vis.seatId);
        if (this.visitsSeen.has(vis.id) || local.zone !== zone) continue;
        const mine = v.mode === 'player' && vis.seatId === v.mySeatId;
        if ((mine && !this.inBed) || (!mine && v.mode !== 'st')) continue;
        this.visitsSeen.add(vis.id);
        saveJSON(VISITS_SEEN_KEY, [...this.visitsSeen].slice(-50));
        const variant = Number.isFinite(vis.variant) ? Math.abs(Math.floor(vis.variant)) % VISIT_NAMES.length : 0;
        const scene = new NightVisit(this.town.groups.house, variant, visitSound);
        // Aimed at whoever is in the bed, however their animal lies.
        const victim = mine ? this.me : this.others.get(vis.seatId);
        if (victim) scene.aim(new THREE.Box3().setFromObject(victim.rig.root).translate(this.town.groups.house.position.clone().negate()));
        this.visit = { id: vis.id, seatId: vis.seatId, zone, mine, scene, start: t };
        if (mine) useHud.setState({ sheep: 'done', visit: 'playing' });
        break;
      }
    }
    const vis = this.visit;
    if (!vis) {
      this.victimPose = null;
      return;
    }
    const age = t - vis.start;
    if (local.zone !== vis.zone || age > VISIT.end) {
      vis.scene.dispose();
      this.visit = null;
      this.victimPose = null;
      if (vis.mine) {
        useHud.setState({ visit: null });
        earn('visited');
      }
      return;
    }
    this.victimPose = vis.scene.update(age);
    if (vis.mine && age > VISIT.dark && useHud.getState().visit !== 'dark') useHud.setState({ visit: 'dark' });
  }

  /**
   * Messenger pigeons. Each new one (sent in the last few seconds) flies in to its person's shoulder wherever they
   * are, if they're in sight here, sits a moment, and bursts into confetti. The one it came for also gets the note
   * saying who sent it and where they are, as it lands.
   */
  private runPigeons(t: number, v: WorldView | null) {
    if (!v) return;
    const now = Date.now();
    for (const p of v.pigeons) {
      if (this.pigeonsSeen.has(p.id)) continue;
      this.pigeonsSeen.add(p.id);
      // Long gone by the time we heard (arriving late, or a reload): no pigeon now.
      if (now - p.at > 6000 || this.pigeons.size > 12) continue;
      this.pigeons.set(p.id, { flight: new PigeonFlight(this.scene, pigeonSound), to: p.to, start: t, noted: false });
    }
    for (const [id, p] of this.pigeons) {
      const age = t - p.start;
      const mine = p.to === v.mySeatId && v.mode === 'player';
      const av = mine ? this.me : this.others.get(p.to);
      let shoulder: THREE.Vector3 | null = null;
      if (av && av.shown && (mine || this.others.get(p.to)?.shown)) {
        const ry = av.rig.root.rotation.y;
        // On the right shoulder, just below the top of the head.
        shoulder = new THREE.Vector3(Math.cos(ry) * -0.27, av.rig.headHeight * 0.76, -Math.sin(ry) * -0.27).add(av.rig.root.position);
      }
      // (The note comes separately from the bird, so it may land a moment after it.)
      if (mine && !p.noted && age >= PIGEON.land) {
        const note = v.pigeonNotes.find((n) => n.id === id);
        if (note) {
          p.noted = true;
          useHud.setState({ pigeon: { name: note.name, where: note.where, key: now } });
        }
      }
      const live = p.flight.update(age, shoulder, av?.rig.root.rotation.y ?? 0);
      if (!live) {
        p.flight.dispose();
        this.pigeons.delete(id);
      }
    }
  }

  /** Tests can hold the show at a moment (`showFreeze`, in seconds) to look at it frame by frame. */
  showFreeze: number | null = null;
  private showAge(t: number): number {
    return this.showFreeze ?? (this.show ? t - this.show.start : 0);
  }

  /** How tall this animal is to the top of its head, and roughly where its neck is, from its feet. */
  private bodyOf(av: AvatarView | null | undefined): { top: number; neck: number } {
    const top = av?.rig.headHeight ?? 1.1;
    return { top, neck: Math.min(0.8, Math.max(0.3, top * 0.6)) };
  }

  /**
   * The condemned through the show. The noose comes down from the beam and settles round the neck; on the
   * drop they fall under gravity through the trapdoor into the dark beneath, the rope jolts taut with a
   * small bounce and swings from the beam, settling; then a puff of smoke, the ghost floats up out of the
   * trapdoor and the empty noose is drawn back up. The body swings with the rope (about the beam), so the
   * loop stays round the neck. Everything the gallows needs comes back too (rope, ring, swing, puff).
   */
  private showPose(age: number, body: { top: number; neck: number }) {
    const spot = this.town.gallowsSpot;
    const beam = spot.y + GALLOWS_BEAM;
    const ease = (k: number) => {
      const c = Math.min(1, Math.max(0, k));
      return c * c * (3 - 2 * c);
    };
    const lowered = ease(age / SHOW.lower);
    const atNeck = beam - (spot.y + body.neck);
    let feet = spot.y;
    let swing = 0;
    let ring = lowered;
    let rope = GALLOWS_ROPE_REST + (atNeck - GALLOWS_ROPE_REST) * lowered;
    let anim: Anim = 'cry';
    let hidden = false;
    let puff = 0;
    // Where the feet end up: far enough down that the head is well below the boards, in the dark.
    const bottom = spot.y - 0.3 - body.top;
    const fallFor = Math.sqrt((2 * (spot.y - bottom)) / 9.8);
    const fallT = age - SHOW.drop;
    if (fallT > 0) {
      anim = 'idle';
      if (fallT < fallFor) feet = spot.y - 4.9 * fallT * fallT;
      else {
        const u = fallT - fallFor;
        feet = bottom - 0.08 * Math.exp(-7 * u) * Math.sin(18 * u);
        swing = 0.16 * Math.exp(-0.9 * u) * Math.sin(5 * u);
      }
      rope = beam - (feet + body.neck);
      hidden = fallT > fallFor * 0.8;
    }
    if (this.show?.survives && fallT > 0) {
      // Spared: the drop jolts them, the rope snaps and the noose falls away, and they're left standing. Then a cheer.
      feet = spot.y - 0.07 * Math.exp(-8 * fallT) * Math.abs(Math.sin(20 * fallT));
      anim = fallT < SHOW.snap + 0.7 ? 'idle' : 'cheer';
      hidden = false;
      swing = 0;
      if (fallT < SHOW.snap) {
        rope = beam - (feet + body.neck);
      } else {
        rope = GALLOWS_ROPE_REST;
        ring = 0;
      }
    } else if (age - SHOW.puff > 0) {
      const puffT = age - SHOW.puff;
      puff = Math.min(1, puffT / 0.9);
      const r = ease(puffT / SHOW.rise);
      feet = bottom + (spot.y + 0.12 - bottom) * r;
      swing *= 1 - r;
      const hung = beam - (bottom + body.neck);
      rope = hung + (GALLOWS_ROPE_REST - hung) * r;
      ring = 1 - r;
      hidden = puffT < 0.12;
    }
    // Swinging with the rope: turn the body about the rope's pivot on the beam, beside the head.
    const fx = GALLOWS_KNOT;
    const fy = feet - beam;
    const c = Math.cos(swing);
    const sn = Math.sin(swing);
    const lx = -GALLOWS_KNOT + fx * c - fy * sn;
    const ly = beam + fx * sn + fy * c;
    return {
      x: spot.x + Math.cos(spot.ry) * lx,
      z: spot.z - Math.sin(spot.ry) * lx,
      y: ly,
      ry: spot.ry,
      anim,
      swing,
      scale: 1,
      hidden,
      rope,
      ring,
      puff,
    };
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
      let dangle: { swing: number; scale: number; hidden: boolean } | null = null;
      if (this.show && this.show.seatId === key && local.zone === 'town') {
        const sp = this.showPose(this.showAge(t), this.bodyOf(av));
        av.setTarget(sp.x, sp.z, sp.ry, sp.y);
        av.snap();
        anim = sp.anim;
        dangle = sp;
      } else {
        const y = sitting ? this.seatHeight(p.zone, p.anim, p.x, p.z) : this.upOnStool(p.zone, p.anim, p.x, p.z) ? STOOL_Y : groundY(p.zone, p.x, p.z);
        av.setTarget(p.x, p.z, p.ry, y);
      }
      av.ground = groundY(p.zone, p.x, p.z);
      // Only the Storyteller carries the book.
      av.setItem(key !== 'st' && p.item?.k === 'grimoire' ? null : p.item);
      // Far away: a lighter model, and no name tag (the Storyteller sees every name).
      const far = Math.hypot(av.x - this.camTarget.x, av.z - this.camTarget.z);
      if (far > LOD_FAR) av.setDetail('low');
      else if (far < LOD_NEAR) av.setDetail('high');
      // Nobody but the Storyteller sees who is sitting in a confession booth.
      const hidden = inBooth(p.zone, p.x, p.z) && v.mode !== 'st';
      av.setTagShown(!dangle?.hidden && !hidden && (v.mode === 'st' || key === 'st' || far < TAG_FAR || p.speaking || Boolean(p.shout)));
      av.setVoiceState(Boolean(p.muted), Boolean(p.shout));
      av.update(dt, t, anim, p.speaking, true);
      const jolt = this.visit && !this.visit.mine && this.visit.seatId === key ? this.victimPose : null;
      av.rig.root.rotation.z = (dangle?.swing ?? 0) + (jolt?.shake ?? 0);
      if (jolt) av.rig.root.position.y += jolt.dy;
      av.rig.root.scale.setScalar(dangle?.scale ?? 1);
      if (jolt) {
        bendVictim(av.rig.root, jolt);
        if (jolt.hidden) av.setTagShown(false);
      }
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
      if (s.zone === kind && (s.job === want || (want === 'sit' && s.job === 'confess')) && Math.hypot(s.stand.x - x, s.stand.z - z) < 0.6) return s.y ?? 0.45;
    }
    const v = this.view;
    if (kind === 'town' && v && (v.nomination || v.townHall)) {
      for (let i = 0; i < v.seats.length; i++) {
        const spot = this.town.meetingSpot(i, v.seats.length);
        if (Math.hypot(spot.x - x, spot.z - z) < 0.6) return STOOL_Y;
      }
    }
    return groundY(zone, x, z);
  }

  /**
   * At a meeting, someone right on a stool who isn't walking is up on it: waving, laughing or with a paw up for a
   * vote they stay up there (as they see themselves), rather than sinking into the stool for everyone else.
   */
  private upOnStool(zone: ZoneId, anim: Anim, x: number, z: number): boolean {
    const v = this.view;
    if (anim === 'walk' || anim === 'run' || zoneKind(zone) !== 'town' || !v || !(v.nomination || v.townHall)) return false;
    for (let i = 0; i < v.seats.length; i++) {
      const spot = this.town.meetingSpot(i, v.seats.length);
      if (Math.hypot(spot.x - x, spot.z - z) < 0.25) return true;
    }
    return false;
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
    // The camera looks north from the south of the player unless they've swung it round (holding the right button);
    // only the join screen drifts round on its own.
    this.yaw += (this.swing.yaw - this.yaw) * Math.min(1, dt * 10);
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
      wantPos.set(g.x + Math.sin(0.45) * 8.5, 6.4, g.z + Math.cos(0.45) * 8.5);
      wantLook.set(g.x, g.y + 1.1, g.z);
    } else if (this.pinned()) {
      // On our stool at a town meeting: from behind our seat, looking down into the middle of the circle, far
      // enough back that every stool (and whoever is on it) is in the shot.
      const shot = this.meetingShot();
      wantPos.copy(shot.pos);
      wantLook.copy(shot.look);
    } else if (this.visit?.mine) {
      // The night visit: a low shot from the foot of the room, the bed and the bedside in view.
      const b = BED;
      wantPos.set(b.x + 1.5, 2.6, b.z + 3.3);
      wantLook.set(b.x - 0.6, 0.9, b.z - 0.6);
    } else if (this.view?.reading && this.me) {
      // Over the Storyteller's shoulder, looking down into the open book.
      const root = this.me.rig.root;
      wantPos.set(0.05, 2.05, -0.55).applyAxisAngle(new THREE.Vector3(0, 1, 0), root.rotation.y).add(root.position);
      wantLook.set(0, 1.08, 0.5).applyAxisAngle(new THREE.Vector3(0, 1, 0), root.rotation.y).add(root.position);
    } else {
      const dist = inside ? Math.min(this.dist, 13) : this.me ? this.dist : 30;
      const pitch = Math.max(0.3, Math.min(1.35, (inside ? 0.95 : 0.78) + this.swing.pitch));
      const flat = dist * Math.cos(pitch);
      wantPos.set(this.camTarget.x + Math.sin(this.yaw) * flat, dist * Math.sin(pitch), this.camTarget.z + Math.cos(this.yaw) * flat);
      wantLook.set(this.camTarget.x, 0.8, this.camTarget.z);
    }
    // The near plane sits as far out as the shot allows: depth precision depends mostly on it, and a close
    // near plane makes faces a hair apart (trims on panelling, rugs on floors) shimmer. Only the
    // over-the-shoulder book shot needs to see things right in front of the lens.
    const near = this.view?.reading ? 0.1 : 1.0;
    if (this.camera.near !== near) {
      this.camera.near = near;
      this.camera.updateProjectionMatrix();
    }
    // Closing in on the book (or pulling back over the meeting) is a slow swoop; everything else follows closely.
    let ease = this.view?.reading || this.pinned() ? 1 - Math.exp(-dt * 4) : this.show ? 1 - Math.exp(-dt * 6) : 1 - Math.exp(-dt * 9);
    if (!this.me && !this.view?.reading) ease = 1;
    this.camPos.lerp(wantPos, ease);
    this.camLook.lerp(wantLook, ease);
    this.camera.position.copy(this.camPos);
    this.camera.lookAt(this.camLook);
  }

  private meetCam: { key: string; pos: THREE.Vector3; look: THREE.Vector3 } | null = null;
  private meetProbe = new THREE.PerspectiveCamera();

  /**
   * Where the camera sits for the meeting: out past our own stool, looking at the middle of the circle, and just far
   * enough back that the whole ring fits the screen (worked out for this screen's shape, so it suits phones held
   * upright too). The scroll wheel still pulls it in or out a little.
   */
  private meetingShot(): { pos: THREE.Vector3; look: THREE.Vector3 } {
    const c = MEETING_CENTRE;
    let out = Math.atan2(local.x - c.x, local.z - c.z);
    // Never from over the clock tower just beyond the circle (it would fill the screen, faded or not): from a stool
    // on that side, the shot swings round to beside it.
    const tower = Math.atan2(TOWER.x - c.x, TOWER.z - c.z);
    const off = Math.atan2(Math.sin(out - tower), Math.cos(out - tower));
    if (Math.abs(off) < TOWER_CLEAR) out = tower + (off < 0 ? -TOWER_CLEAR : TOWER_CLEAR);
    const zoom = THREE.MathUtils.clamp(this.dist / 14, 0.8, 1.6);
    const key = `${out.toFixed(2)}:${this.camera.aspect.toFixed(2)}:${this.camera.fov}:${zoom.toFixed(2)}`;
    if (this.meetCam?.key === key) return this.meetCam;
    const pitch = 0.98;
    const look = new THREE.Vector3(c.x, STOOL_Y + 0.3, c.z);
    const dir = new THREE.Vector3(Math.sin(out) * Math.cos(pitch), Math.sin(pitch), Math.cos(out) * Math.cos(pitch));
    // Every stool's place, at the feet and above the head of whoever sits there.
    const pts: THREE.Vector3[] = [];
    const rim = STOOL_R + 0.75;
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2;
      for (const y of [STOOL_Y - 0.3, STOOL_Y + 1.3]) pts.push(new THREE.Vector3(c.x + Math.sin(a) * rim, y, c.z + Math.cos(a) * rim));
    }
    const probe = this.meetProbe;
    probe.fov = this.camera.fov;
    probe.aspect = this.camera.aspect;
    probe.near = 1;
    probe.far = 400;
    probe.updateProjectionMatrix();
    const v = new THREE.Vector3();
    const fits = (d: number) => {
      probe.position.copy(look).addScaledVector(dir, d);
      probe.lookAt(look);
      probe.updateMatrixWorld();
      return pts.every((p) => {
        v.copy(p).project(probe);
        return Math.abs(v.x) < 0.9 && Math.abs(v.y) < 0.82 && v.z < 1;
      });
    };
    let lo = 4;
    let hi = 60;
    for (let i = 0; i < 16; i++) {
      const mid = (lo + hi) / 2;
      if (fits(mid)) hi = mid;
      else lo = mid;
    }
    const pos = look.clone().addScaledVector(dir, hi * zoom);
    this.meetCam = { key, pos, look };
    return this.meetCam;
  }

  private syncVoice(v: WorldView | null) {
    if (!v || v.mode === 'preview' || !this.me) return;
    const meeting = Boolean(v.townHall || (v.nomination && v.nomination.status !== 'done'));
    const ctx = { meeting, meetingRadius: this.town.meetingRadius, announce: presence.announce };
    const list: Listener[] = [];
    let hearing = 0;
    for (const [key, p] of presence.others) {
      const gain = earshot(local, p, key === 'st', ctx);
      // And the other way round: who can hear us (not the same when one of us shouts, or the Storyteller speaks to everyone).
      const heard = earshot(p, local, v.mode === 'st', ctx);
      const av = this.others.get(key);
      const near = heard > 0.02;
      av?.setHearing(near);
      if (near) hearing += 1;
      if (!p.voiceId) continue;
      // Only open voice lines to people in or near earshot (and the Storyteller, who can speak to everyone),
      // rather than to the whole town: far less bandwidth with a big group.
      const inRange = p.zone === local.zone && (zoneKind(p.zone) !== 'town' || Math.hypot(p.x - local.x, p.z - local.z) < VOICE_CONNECT_R);
      if (!(gain > 0 || heard > 0 || inRange || key === 'st' || v.mode === 'st')) continue;
      list.push({ voiceId: p.voiceId, gain, key });
    }
    if (hearing !== this.hearing) {
      this.hearing = hearing;
      useHud.setState({ hearing });
    }
    const meetingSeated = Boolean(this.seated && this.seated.y === STOOL_Y && local.zone === 'town');
    if (meetingSeated !== this.meetingSeated) {
      this.meetingSeated = meetingSeated;
      useHud.setState({ meetingSeated });
    }
    voice.sync(list);
  }
}
