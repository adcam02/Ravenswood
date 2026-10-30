import * as THREE from 'three';
import { CSS2DObject, CSS2DRenderer } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import { getRole, iconUrl } from '../data';
import { game, useHud, type Prompt } from '../game/hud';
import { local, setItem } from '../game/local';
import { presence } from '../game/presence';
import { SCORE_OF, type GameJob, type JobResults } from '../jobs/meta';
import { rememberBest } from '../game/bests';
import type { DawnReel, DayTimer, ExecMethod, Execution, Nomination, TownAction, TownHall, Visit } from '../state/types';
import { ambience } from '../lib/ambience';
import { doorChime, drumroll, execSound, gavel, gulpSound, munchSound, pigeonSound, ropeSnap, visitSound } from '../lib/audio';
import { clubMusic, songById } from '../lib/disco';
import { execMethod, showStartAt } from '../game/execution';
import type { ExecStage, ExecPose } from './exec/stage';
import { SOUL } from './exec/soul';
import type { NightVisit, VictimPose } from './visit';
import { lazyModule } from '../lib/lazy';
import { PIGEON, PigeonFlight } from './pigeon';
import { ui, useUI } from '../state/ui';
import { earshot } from '../voice/earshot';
import { useVoice, voice, type Listener } from '../voice/voice';
import { AvatarView, type AvatarInfo } from './avatar';
import { buildAnimal, type Rig } from './animals';
import { resolve, turnToward } from './collide';
import { createTown, GALLOWS_BEAM, GALLOWS_KNOT, GALLOWS_ROPE_REST, type TownWorld } from './town';
import { BED, BOUNCER, CLUB, CLUB_NAME, COTTAGE_NAMES, DAIS, DOCK, FAIRY_RING, FLATS, FLATS_NAME, GRAVEYARD, MEETING_CENTRE, PIT_CORNERS, PIT_RINGS, ROOM_DOOR, SQUARE_R, STOOL_R, TOWER, TRAPDOOR, doorPoint, groundAt, onDanceFloor, roadDistance } from './town/layout';
import { local as localSpot } from './town/kit';
import { nearPath } from './town/outdoor';
import { blocksLine } from './town/occlusion';
import { Fireworks } from './fireworks';
import { reportProblem } from '../lib/report';
import { earn, hatBoost, notePerfect, noteTopJob, tally, useProgress } from '../game/progress';
import { setHatFxLow } from './hatFx';
import { crowned } from '../game/leaders';
import { PitShow, pitFightFor } from './pitfight';
import type { PitState } from '../state/types';

/** Hats are a player's own: the Storyteller doesn't collect them. */
const isPlayerView = (v: WorldView | null) => v?.mode === 'player';
import { drawless, joinNames, loadJSON, saveJSON } from '../lib/util';
import { steadyInterval } from '../lib/ticker';
import { casino, casinoNow, hostNow } from '../casino/client';
import { TableCam } from './tablecam';
import { CHAIR_Y, FELT_Y, PK_TABLE, RL_LOOK, SLOTS, bjSpot } from './town/casinoLayout';
import type { CasinoView } from '../casino/types';
import { decor, flatNav, flatNow, useDecor } from '../flats/client';
import { useClient } from '../net/client';
import { emptyLayout, whyNot } from '../flats/catalogue';
import { shownName } from '../state/nicks';
import { nameKey } from '../game/profiles';

type TableKind = 'blackjack' | 'poker' | 'roulette' | 'slots';
/** Who's in a seat at one of the casino's tables (or at a slot machine). */
const sittingAt = (cv: CasinoView, kind: TableKind, seat: number): { name: string; mine: boolean } | null => {
  if (kind === 'slots') {
    const m = cv.sl?.[seat];
    return m?.name ? { name: m.name, mine: m.mine } : null;
  }
  return (kind === 'blackjack' ? cv.bj[seat] : kind === 'poker' ? cv.pk.seats[seat] : cv.rl?.seats[seat]) ?? null;
};
const TABLE_ACTION = { blackjack: 'bj', poker: 'pk', roulette: 'rl', slots: 'sl' } as const;

/** Town features that arrive with the effects pass: called only if the town has them. */
interface TownFx {
  setWeather?: (w: Weather) => void;
  setDayProgress?: (p: number) => void;
  consumeShadowDirty?: () => boolean;
  consumeShadowUrgent?: () => boolean;
  ripple?: (x: number, z: number, size?: number) => void;
}

/** What's underfoot, for the sound of footsteps. */
function surfaceAt(zone: ZoneId, x: number, z: number): 'stone' | 'wood' | 'grass' {
  const kind = zoneKind(zone);
  if (kind === 'church' || kind === 'tower' || kind === 'cellar') return 'stone';
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
 * The hanging, in seconds from the start: the noose comes down onto the neck, the drop, the puff of smoke (the
 * empty noose is drawn back up over `rise`, as the ghost floats slowly up out of the trapdoor), and the end. For
 * someone who survives it, the rope snaps `snap` seconds after the drop, and it's over at `spared`.
 */
const SHOW = { lower: 0.9, drop: 1.6, puff: 3.3, rise: 0.6, end: 3.3 + SOUL.rise + SOUL.pop + 0.5, spared: 4.3, snap: 0.18 };
/** Still no method this long after the vote should have closed, something went astray: the show is called off. */
const SHOW_WAIT_S = 20;
/**
 * The dawn reel's timings, in seconds: how long each death with a visit is shown, and how far into the visit it
 * starts (the figure already gliding in); how long one without a visit is, and when they slip away in it.
 */
const DAWN = { visit: 6.4, from: 1.2, quiet: 3.4, quietAt: 1.0 };
// Every way but the gallows, and the hooded figure's visits, arrive when first needed (or soon after the page
// loads, whichever comes first): nobody needs them for the first look at the town.
const execShows = lazyModule(() => import('./exec/shows'));
const nightVisits = lazyModule(() => import('./visit'));
/** Even with nothing changing, the shadow map is redrawn this often, just in case. */
const SHADOW_SAFETY_S = 10;
/** Out in town, at least this long between redraws of the shadow map for things changing (see frame). */
const SHADOW_GAP_S = 0.5;
/** And this long for a slow drift (the sun creeping round) to be drawn while the camera is still. */
const SHADOW_DRIFT_GAP_S = 3;
import {
  BOOTHS,
  BOOTH_HD,
  HATS,
  boothAt,
  boothSeats,
  cottageSlot,
  cottageZone,
  DANCES,
  danceOwned,
  DANCES_KEY,
  houseOwner,
  flatOwner,
  flatZone,
  isDance,
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
  /** The name to show (this viewer's nickname for them, if they gave one). */
  name: string;
  /** Their real name, for matching up with names in the game's records. */
  real?: string;
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
  /** Today they've nominated someone (`by`), or been nominated (`of`): each happens once a day. */
  noms?: { by: boolean; of: boolean };
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
  /** The pet pit in the tavern's cellar (this browser's clock). */
  pit?: PitState | null;
  /** The song on at the club, since when (this browser's clock), and who put it on. */
  club: { song: string; at: number; by: string };
  /** This morning's replay of the night's deaths (this browser's clock). */
  dawn: DawnReel | null;
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
/** Where we were as the page went (a refresh, the tab closed), and how long that's worth going back to. */
const PLACE_KEY = 'ravenswood:last-place';
const PLACE_KEEP_MS = 3 * 60_000;
type LastPlace = { seat: string; when: string; zone: ZoneId; x: number; z: number; ry: number; at: number };
/** The part of the game a remembered spot belongs to: a spot from yesterday, or from before the night, is no use. */
const phaseKey = (v: WorldView) => `${v.started}:${v.phase}:${v.day}`;

const EMOTE_TIME: Partial<Record<Anim, number>> = { wave: 2.4, cheer: 2.6, laugh: 2.6, cry: 3.2, dance: 8, drink: 1.6 };
/** How long an emote plays: a dance goes on until you move or do something else (on a meeting stool, a while). */
const emoteTime = (anim: Anim, pinned = false) => (isDance(anim) ? (pinned ? 8 : Infinity) : (EMOTE_TIME[anim] ?? 2.5));
const SIPPABLE = new Set(['ale', 'cider', 'milk', 'cocoa', 'loaf', 'pie', 'bun', 'water', 'wine']);
const DRINKS = new Set(['ale', 'cider', 'milk', 'cocoa', 'water', 'wine']);
/** Seconds to eat or drink something down. */
const EAT_TIME = 1.3;
/** A little burst of speed after: a drink is the bigger kick, food lasts longer. */
const EAT_BOOST = { drink: { mul: 1.25, secs: 20 }, food: { mul: 1.2, secs: 30 } };

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
  flats: '🛗 Up to the flats',
  jukebox: '🎶 Jukebox',
  ideas: '💡 Idea box',
  shop: '🛍️ Shop',
  leaders: '🏆 Leaderboard',
  blackjack: '🃏 Blackjack',
  poker: '♠️ Texas hold’em',
  roulette: '🎡 Roulette',
  slots: '🎰 Slots',
};

/**
 * Big Moo's little chats on the door: what he says, what you say back, and what he says as he lifts the rope.
 * `{song}` is what's on inside; `{hat}` what you're wearing on your head. A `dance` one has you show him your moves.
 */
const BOUNCER_TALK: { moo: string; you: string; then: string; dance?: boolean; hat?: boolean }[] = [
  { moo: 'Evening. You on the list?', you: 'Um… which list?', then: 'The list of nice people. You’re on it. In you go.' },
  { moo: 'Hold up. What’s the password?', you: '…please?', then: 'Close enough. Have a good night.' },
  { moo: 'I’ll need to see some moves first.', you: 'Like this?', then: 'Okay, okay! You’re in. Save some for the floor.', dance: true },
  { moo: 'No horns, no entry.', you: 'But I don’t have horns…', then: 'Kidding. Get in there, the floor’s warm.' },
  { moo: 'Nice {hat}. Very sharp.', you: 'Thanks! You too.', then: 'I know. In you go.', hat: true },
  { moo: 'You like {song}? It’s on right now.', you: 'I love it!', then: 'Then what are you waiting for?' },
  { moo: 'Shoes off, please. …Hooves? Paws? Never mind.', you: 'Phew.', then: 'Go on in. Mind the glitter.' },
  { moo: 'Name?', you: 'You know my name, Moo.', then: 'I do. I just like hearing it. Enjoy.' },
  { moo: 'Strictly juice only in there. No funny business.', you: 'Promise.', then: 'Good. In you pop.' },
];

const PLACE_NAMES: Record<Exclude<ZoneKind, 'house'>, string> = {
  town: 'Ravenswood',
  tavern: 'The Raven’s Rest',
  bakery: 'The Bakery',
  church: 'The Church',
  tower: 'The Clock Tower',
  cellar: 'The Pet Pit',
  club: CLUB_NAME,
  casino: 'The Lucky Raven',
  lobby: FLATS_NAME,
  flat: 'A flat',
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
  /** When a slow change first asked for the shadows to be redrawn (they wait for the camera to stop). */
  private shadowDriftAt: number | null = null;
  /** Something changed that casts a shadow, and the map hasn't been redrawn for it yet. */
  private shadowWanted = false;
  /** Where the camera was last frame, to tell when it's still. */
  private lastCamAt = new THREE.Vector3();
  private stepAt = 0;
  private othersStepAt = new Map<string, { at: number; x: number; z: number }>();
  private rippleAt = 0;
  private unsubUI: (() => void) | null = null;
  private unsubShout: (() => void) | null = null;
  private unsubWake: (() => void) | null = null;

  /** `face`: the way to turn while it plays (twerking turns its back to the camera). */
  private emote: { anim: Anim; until: number; face?: number } | null = null;
  /** Sitting or lying on something: the y to sit at. */
  private seated: { y: number; anim: Anim } | null = null;
  /** The meeting stool we're sat on, as "seat/of", so we can move along if the seats are reordered. */
  private stool: string | null = null;
  private job: { job: GameJob; station: Station; prevItem: Item | null } | null = null;
  /** Eating or drinking what's in the paw, since when (see sip). */
  private eating: { item: Item; start: number } | null = null;
  /** The minigame being played in bed at night, if any (see startBedGame). */
  private bedGame: GameJob | null = null;
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
  /** Sitting at a card table in the casino: the seat's-eye camera. */
  private tableCam: TableCam | null = null;
  private tableKind: TableKind = 'poker';
  /** Everyone else at the table we're sitting at (their plates on the table name them, so their tags are hidden). */
  private tablemates = new Set<string>();
  private hidSelf = false;
  private signs: { station: Pick<Station, 'zone' | 'x' | 'z'> & { job?: Station['job'] }; el: HTMLDivElement; obj: CSS2DObject }[] = [];
  private wellTimer: ReturnType<typeof setTimeout> | null = null;
  private hearing = 0;
  private occluderHead = new THREE.Vector3();
  private occluded = new Set<THREE.Mesh>();
  private lastShowId = new Set<string>();
  private gavelled = false;
  private lastWakeId: string | null = null;
  /**
   * The execution in progress: who, and when the show itself started on our clock (null while the town votes on how
   * and the wheel spins). Ways other than the gallows are run by a stage, and `pose` is where it has them this frame.
   */
  private show: {
    id: string;
    seatId: string;
    name: string;
    start: number | null;
    /** When to give up waiting for the method (on our clock). */
    giveUp: number;
    mine: boolean;
    released: boolean;
    alive: boolean;
    survives: boolean;
    method: ExecMethod | null;
    stage: ExecStage | null;
    pose: ExecPose | null;
    drum: boolean;
  } | null = null;
  /** The Storyteller hovering higher than usual, over someone's bed. */
  private hoverY = 0;
  /** The ground under us, eased, for walking up and down steps. */
  private groundS = 0;
  private nearDoor: { door: Door; locked: string | null } | null = null;
  /** The clock tower door we last went in by, to come back out of it. */
  private towerDoor: Door | null = null;
  /** The hooded figure's visit playing in this bedroom, and how the one in bed is jolted by it this frame. */
  private visit: { id: string; seatId: string; zone: ZoneId; mine: boolean; scene: NightVisit; start: number; kit: typeof import('./visit') } | null = null;
  private victimPose: VictimPose | null = null;
  private visitsSeen = new Set<string>(loadJSON<string[]>(VISITS_SEEN_KEY, []));
  /**
   * Dawn: the night's deaths played for everyone in turn, each in the victim's bedroom (a stand-in of them in bed
   * and the hooded figure's visit again), before the day carries on. `slot` is the death on screen (-1 before the
   * first).
   */
  private dawn: {
    id: string;
    /** How far through it is, and when it was last moved on (our clock). */
    age: number;
    last: number;
    slots: { seatId: string; variant: number | null; from: number; to: number }[];
    slot: number;
    zone: ZoneId | null;
    rig: Rig | null;
    scene: NightVisit | null;
    kit: typeof import('./visit') | null;
    pose: VictimPose | null;
    cut: boolean;
  } | null = null;
  /** Messenger pigeons flying (or perched, or bursting) here, by id, with whose shoulder each is for. */
  private pigeons = new Map<string, { flight: PigeonFlight; to: string; start: number; noted: boolean }>();
  private pigeonsSeen = new Set<string>();
  /** The side of the confession booth we're sitting in, if we are. */
  private booth: Station | null = null;
  /** The pet fights in the cellar's rings, and which fight we last went to our corner for. */
  private pitShow: PitShow;
  private pitCorner = '';
  /** Since when (on the clock) we've been in the booth with someone on the other side, for the achievement. */
  private boothWith: number | null = null;
  /** Let into the club by Big Moo: good until the night comes (the day and phase it was given on). */
  private clubPass: string | null = null;
  /** Which of Big Moo's little chats comes next, and until when (performance clock) he's busy with one. */
  private bouncerLine = Math.floor(Math.random() * BOUNCER_TALK.length);
  private bouncerBusy = 0;
  private bouncerTimers: ReturnType<typeof setTimeout>[] = [];
  /** The song the club's lights last heard about. */
  private clubSongKey = '';

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
    // The guillotine cuts an animal in two with clipping planes.
    this.renderer.localClippingEnabled = true;
    this.applyQuality();
    this.renderer.domElement.className = 'world-canvas';
    host.appendChild(this.renderer.domElement);
    this.labels = new CSS2DRenderer();
    this.labels.domElement.className = 'world-labels';
    host.appendChild(this.labels.domElement);

    this.town = createTown(this.scene, this.renderer);
    this.pitShow = new PitShow(this.town.groups.cellar);
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
    // The trapdoor down to the Pet Pit gets a sign of its own, like the things to do.
    {
      const el = document.createElement('div');
      el.className = 'station-sign';
      el.textContent = '🐾 Pet Pit (down the hatch)';
      const obj = new CSS2DObject(el);
      obj.position.set(TRAPDOOR.x, 2.1, TRAPDOOR.z);
      obj.center.set(0.5, 1);
      this.town.groups.tavern.add(obj);
      this.signs.push({ station: { zone: 'tavern', x: TRAPDOOR.x, z: TRAPDOOR.z }, el, obj });
    }

    this.ro = new ResizeObserver(() => this.resize());
    this.ro.observe(host);
    this.resize();

    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('pagehide', this.rememberPlace);
    document.addEventListener('visibilitychange', this.rememberPlace);
    // (And every few seconds, for a tab closed or a phone's browser killed without a word.)
    this.placeTimer = setInterval(() => this.notePlace(), 4000);
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
    flatNav.go = (key) => this.goToFlat(key);
    game.emote = (a) => this.startEmote(a);
    game.sip = () => this.sip();
    game.give = () => this.give();
    game.putAway = () => this.putAway();
    game.goTo = (key) => this.goTo(key);
    game.takeMeetingSeat = () => this.takeMeetingSeat();
    game.jobDone = (r) => (this.bedGame ? this.finishBedGame(r) : this.finishJob(r));
    game.jobCancel = () => (this.bedGame ? this.finishBedGame(undefined) : this.finishJob(undefined));
    game.bedGame = (job) => this.startBedGame(job);
    // Woken by the Storyteller: whatever was being played in bed stops at once.
    this.unsubWake = useClient.subscribe((s, prev) => {
      if (s.priv?.wake && !prev.priv?.wake) this.closeBedGame();
    });
    game.calledToStool = () => {
      const v = this.view;
      if (!v || v.mode !== 'player' || !(v.townHall || v.nomination) || this.inBed || (this.seated && this.seated.y === STOOL_Y)) return;
      this.takeMeetingSeat();
      this.me?.bubble('The Storyteller sat you down', 2600);
    };
    game.summoned = (zone, x, z) => {
      // Called over by the Storyteller: stand a step in front of them, facing them.
      this.stopEverything();
      this.closeBedGame();
      this.inBed = false;
      useHud.setState({ sheep: null });
      const a = Math.random() * Math.PI * 2;
      const sx = x + Math.cos(a) * 1.4;
      const sz = z + Math.sin(a) * 1.4;
      this.place(zone as ZoneId, sx, sz, Math.atan2(x - sx, z - sz), true);
      this.me?.bubble('The Storyteller called you over', 2600);
    };
    this.unsubUI = useUI.subscribe((s) => ambience.setEnabled(s.ambience && !s.muted));
    // Three shouts inside ten seconds (counted as each starts, however few frames there are).
    this.unsubShout = useVoice.subscribe((s, prev) => {
      if (!s.shouting || prev.shouting || !isPlayerView(this.view)) return;
      const now = performance.now() / 1000;
      this.feat.shouts = [...this.feat.shouts.filter((at) => now - at < 10), now];
      if (this.feat.shouts.length >= 3) earn('fusrodah');
    });
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
    this.unsubShout?.();
    this.unsubWake?.();
    ambience.dispose();
    if (this.wellTimer) clearTimeout(this.wellTimer);
    for (const tm of this.bouncerTimers) clearTimeout(tm);
    clubMusic.setLevel(0, false);
    for (const s of this.signs) s.el.remove();
    for (const k of ['interact', 'sip', 'give', 'putAway', 'takeMeetingSeat', 'calledToStool', 'jobCancel'] as const) game[k] = () => {};
    game.emote = game.goTo = game.jobDone = game.sheepDone = game.bedGame = () => {};
    this.ro.disconnect();
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('pagehide', this.rememberPlace);
    document.removeEventListener('visibilitychange', this.rememberPlace);
    clearInterval(this.placeTimer);
    window.removeEventListener('keyup', this.onKeyUp);
    window.removeEventListener('blur', this.onBlur);
    for (const a of this.others.values()) a.dispose();
    this.me?.dispose();
    this.fireworks.dispose();
    this.pitShow.dispose();
    this.renderer.dispose();
    // Hand the graphics memory back now rather than whenever the page tidies up (a player's page builds the
    // town twice: once behind the join screens and again once they're in).
    this.renderer.forceContextLoss();
    this.renderer.domElement.remove();
    this.labels.domElement.remove();
  }

  private applyQuality() {
    const low = this.quality === 'low';
    setHatFxLow(low);
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
      if (v.mode === 'st' && this.me && (zoneKind(local.zone) === 'house' || zoneKind(local.zone) === 'flat')) this.place('town', MEETING_CENTRE.x, MEETING_CENTRE.z, Math.PI, true);
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
      if (nom.speech) {
        label =
          nom.speech.kind === 'accuse'
            ? `${who(nom.nominatorId)} accuses ${who(nom.nomineeId)}`
            : nom.speech.kind === 'defend'
              ? `${who(nom.nomineeId)}’s defence`
              : `Open discussion · ${who(nom.nomineeId)}`;
      }
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
      speaker: nom?.speech && nom.speech.kind !== 'discuss' ? seatIndex(nom.speech.seatId) : null,
    });
    // Who sits where round the dais, by the names this viewer calls them.
    this.town.setStoolNames(v.seats.map((s, i) => ({ name: s.name || `Seat ${i + 1}`, dead: s.dead, me: s.id === v.mySeatId })));

    // Fish caught since we last looked get a bubble over whoever caught them.
    if (this.lastFish < 0) this.lastFish = v.town.fish.length;
    for (const f of v.town.fish.slice(this.lastFish)) {
      const seat = v.seats.find((s) => (s.real ?? s.name) === f.by);
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
    // An execution: everyone turns to watch (while the town votes on how, the wheel spins, and the show plays).
    const ex = v.execution;
    if (ex && ex.id !== this.show?.id && this.freshExecution(ex) && !this.lastShowId.has(ex.id)) {
      if (this.show) this.endShow();
      this.lastShowId.add(ex.id);
      const name = v.seats.find((s) => s.id === ex.seatId)?.name ?? 'Someone';
      this.show = {
        id: ex.id,
        seatId: ex.seatId,
        name,
        start: null,
        giveUp: this.clock.elapsedTime + SHOW_WAIT_S + Math.max(0, ((ex.vote?.until ?? 0) - Date.now()) / 1000),
        mine: ex.seatId === v.mySeatId,
        released: false,
        alive: true,
        survives: Boolean(ex.survives),
        method: null,
        stage: null,
        pose: null,
        drum: false,
      };
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
      // Without a vote (an older game, or a method chosen outright), straight to it.
      if (!ex.vote && !ex.drawn) ui.banner(execMethod(ex.method ?? 'hang').sign(name), 'The town has spoken');
    }
    // The method is settled: the show starts once the wheel has landed on it, at the same moment on every screen.
    const show = this.show;
    if (show && !show.method && ex?.id === show.id && (ex.method || (!ex.vote && !ex.drawn))) {
      const method = ex.method ?? 'hang';
      show.method = method;
      show.start = this.clock.elapsedTime + Math.max(-2, (showStartAt(ex) - Date.now()) / 1000);
      // Any other way's stage goes up in runShow, once its props have arrived. If they can't be fetched at all, the
      // gallows does it.
      if (method !== 'hang' && !execShows.now()) execShows.get().catch(() => this.show === show && !show.stage && (show.method = 'hang'));
    } else if (show && !show.method && (!ex || ex.id !== show.id)) {
      // Called off before it was settled (night fell, say).
      this.endShow();
    }
    // Waking someone at night takes the Storyteller to their bedside.
    if (v.mode === 'st' && v.lastWake && v.lastWake.id !== this.lastWakeId) {
      this.lastWakeId = v.lastWake.id;
      const first = v.lastWake.to.find((id) => presence.others.get(id)?.zone === this.homeOf(id));
      if (first && local.zone !== this.homeOf(first)) this.goTo(first);
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
    // Whoever holds the talking stick before the vote.
    const sp = v.nomination?.speech;
    if (sp && sp.kind !== 'discuss' && sp.seatId === key) badge = sp.kind === 'accuse' ? '🎤 accusing' : '🎤 defending';
    if (v.marked?.seatId === key) badge = 'on the block';
    // Who has nominated and been nominated today, on the name plates at a meeting.
    const meeting = Boolean(v.townHall || v.nomination);
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
      crown: crowned(s?.name),
      noms: meeting ? s?.noms : undefined,
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
      // Back from a refresh a moment ago, at the same point in the game: where we were, rather than the square.
      const back = loadJSON<LastPlace | null>(PLACE_KEY, null);
      const fresh = back && v.mode === 'player' && back.seat === v.mySeatId && back.when === phaseKey(v) && Date.now() - back.at < PLACE_KEEP_MS;
      if (fresh && typeof back.zone === 'string' && [back.x, back.z, back.ry].every(Number.isFinite)) this.place(back.zone, back.x, back.z, back.ry, false);
      else this.goToSquareSpawn(false);
    }
  }

  /** Notes where we are as the page goes out of sight or away, for spawn to come back to. */
  private rememberPlace = (e: Event) => {
    if (e.type !== 'visibilitychange' || document.visibilityState !== 'visible') this.notePlace();
  };
  private placeTimer: ReturnType<typeof setInterval> | undefined;
  private notePlace() {
    const v = this.view;
    if (v?.mode !== 'player' || !v.mySeatId || !this.me) return;
    saveJSON(PLACE_KEY, { seat: v.mySeatId, when: phaseKey(v), zone: local.zone, x: local.x, z: local.z, ry: local.ry, at: Date.now() } satisfies LastPlace);
  }

  private applyPhase(v: WorldView, prev: WorldView | null) {
    const key = `${v.started}:${v.phase}`;
    if (key === this.lastPhaseKey) return;
    const first = !this.lastPhaseKey;
    this.lastPhaseKey = key;
    // Dawn, seen as it happens (not on arriving or reloading in the middle of it, when it's simply day): everyone
    // watches the night's deaths first. (A line that dropped all through the dawn doesn't bring it back much later;
    // the window is wide, since a busy line can put the host's clock seconds out.)
    if (!first && prev?.phase === 'night' && v.phase === 'day' && v.dawn?.deaths.length && !v.ended && this.me && Math.abs(Date.now() - v.dawn.at) < 45000) this.startDawn(v.dawn);
    // A flat's lights go down at nightfall (and up again at dawn) for whoever is in one.
    if (zoneKind(local.zone) === 'flat') this.showZone();
    // Morning: the Storyteller leaves the last bedside they visited and comes back out with everyone (inside a
    // house they'd hear nobody).
    if (this.me && v.mode === 'st' && !first && prev && v.phase === 'day' && (zoneKind(local.zone) === 'house' || zoneKind(local.zone) === 'flat')) this.goToSquareSpawn(true);
    if (!this.me || v.mode !== 'player') return;
    if (first || !prev) {
      // Joining (or reloading) in the night still means bed.
      if (v.started && v.phase === 'night' && !this.inBed) this.goHome(false);
      return;
    }
    if (v.started && v.phase === 'night') {
      this.stopEverything();
      this.goHome(true);
    } else if (v.phase === 'day' && (this.inBed || zoneKind(local.zone) === 'flat')) {
      this.closeBedGame();
      this.inBed = false;
      useHud.setState({ sheep: null });
      this.stopEverything();
      this.goToSquareSpawn(true);
    } else if (v.phase === 'day') {
      this.closeBedGame();
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

  /**
   * Where a seat sleeps at night: their own flat in Wren Court, by the name they play under. (Names are one to a game;
   * should two ever match, the second gets a flat of their own for the night.)
   */
  private homeOf(seatId: string | null | undefined): ZoneId | null {
    const seats = this.view?.seats ?? [];
    const seat = seats.find((s) => s.id === seatId);
    if (!seat) return null;
    const key = nameKey(seat.name) || seat.id;
    const first = seats.find((s) => (nameKey(s.name) || s.id) === key);
    return flatZone(first === seat ? key : `${key}#${seat.id}`);
  }

  /** Night: straight into bed in our own flat, asleep, until morning. */
  private goHome(fade: boolean) {
    const id = this.view?.mySeatId;
    const home = this.homeOf(id);
    if (!id || !home) return;
    if (useDecor.getState().draft) decor.finish();
    useDecor.setState({ dir: false });
    const bed = this.town.stations.find((s) => s.id === 'flat-bed');
    const h = bed?.stand ?? this.town.homeSpawn;
    this.inBed = true;
    this.place(home, h.x, h.z, h.ry, fade, () => {
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
    // (The dawn reel keeps last night's bedroom up, wherever we've been moved to meanwhile.)
    if (this.dawn) return this.town.show('flat', true);
    const kind = zoneKind(local.zone);
    // A flat at night is somebody's bedroom: fire out, moon in the window.
    const night = Boolean(this.view?.started && this.view.phase === 'night');
    this.town.show(kind, (kind === 'house' && cottageSlot(local.zone) === null) || (kind === 'flat' && night));
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
    this.town.setSeating(v.seats.map((s) => ({ name: s.name, dead: s.dead, owner: s.id === owner || this.homeOf(s.id) === local.zone })));
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
    // At the pet shop or a card table, the panel has the keys (leaving the table is a button, so a stray Escape can't cash anyone out).
    if (useHud.getState().casino) return;
    // Choosing a flat in the lobby, or decorating one: the panel has the keys, and the arrows move the piece in hand.
    if (useDecor.getState().dir) return;
    if (useDecor.getState().draft) {
      this.decorKey(e, k);
      return;
    }
    if (this.view?.paused || this.job || this.bedGame) return;
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
    else if (k === DANCES_KEY) useHud.setState((h) => ({ dances: !h.dances }));
    else if (useHud.getState().dances && /^[1-9]$/.test(k)) {
      // The Dances picker is open: its own numbers.
      const dance = DANCES[Number(k) - 1];
      if (dance) this.startEmote(dance.anim);
      useHud.setState({ dances: false });
    } else {
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
    if (e.button !== 0 || !this.me || this.view?.paused || this.job || this.inBed || this.tableCam) return;
    // Decorating: a tap on the floor moves the piece in hand there, or picks up whatever's there.
    if (useDecor.getState().draft) {
      const hit = this.floorAt(e.clientX, e.clientY);
      if (hit) decor.tap(hit.x, hit.z);
      return;
    }
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

  /** The floor (or the ground) under a screen point. */
  private floorAt(clientX: number, clientY: number): THREE.Vector3 | null {
    const rect = this.renderer.domElement.getBoundingClientRect();
    const ndc = new THREE.Vector2(((clientX - rect.left) / rect.width) * 2 - 1, -((clientY - rect.top) / rect.height) * 2 + 1);
    const ray = new THREE.Raycaster();
    ray.setFromCamera(ndc, this.camera);
    const hit = new THREE.Vector3();
    return ray.ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), hit);
  }

  /** The keys while decorating: arrows (or WASD) move the piece in hand, R turns it, Enter puts it down. */
  private decorKey(e: KeyboardEvent, k: string) {
    const move: Record<string, [number, number]> = { arrowleft: [-1, 0], a: [-1, 0], arrowright: [1, 0], d: [1, 0], arrowup: [0, -1], w: [0, -1], arrowdown: [0, 1], s: [0, 1] };
    const held = useDecor.getState().held;
    if (move[k]) {
      e.preventDefault();
      if (held) decor.nudge(...move[k]);
    } else if (k === 'r') decor.turn();
    else if (k === 'enter' || k === ' ') {
      e.preventDefault();
      if (held) decor.place();
    } else if (k === 'delete' || k === 'backspace') decor.putAway();
    else if (k === 'escape') {
      if (held) decor.cancel();
      else decor.finish();
    }
  }

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
    // A skeleton's bones rattle as it goes.
    const rattles = (key: string | null | undefined) => v.seats.find((x) => x.id === key)?.look?.animal === 'skeleton';
    if (walking && t - this.stepAt > stride) {
      this.stepAt = t;
      ambience.footstep(surfaceAt(local.zone, local.x, local.z), 1);
      if (rattles(v.mySeatId)) ambience.rattle(0.8);
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
        if (prev && moved > 0.25 && d < 9) {
          ambience.footstep(surfaceAt(p.zone, p.x, p.z), Math.max(0.15, 1 - d / 9) * 0.6);
          if (rattles(key)) ambience.rattle(Math.max(0.15, 1 - d / 9) * 0.5);
        }
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
    // A dance from the shop not bought yet: the shop opens on it instead (the Storyteller has them all).
    if (this.view?.mode === 'player' && !danceOwned(anim, useProgress.getState())) {
      useHud.setState({ dances: false, casino: { kind: 'shop', tab: 'dances', away: zoneKind(local.zone) !== 'casino' } });
      return;
    }
    // On a meeting stool: wave, laugh and the rest happen sitting there, and "sit" doesn't stand them up.
    if (this.pinned()) {
      if (anim !== 'sit') this.emote = { anim, until: this.clock.elapsedTime + emoteTime(anim, true) };
      return;
    }
    if (anim === 'sit') {
      this.seated = this.seated ? null : { y: 0, anim: 'sit' };
      this.emote = null;
      return;
    }
    this.seated = null;
    this.emote = { anim, until: this.clock.elapsedTime + emoteTime(anim), face: anim === 'twerk' ? this.yaw + Math.PI : undefined };
    this.moveTarget = null;
    // Waving hello to five different players in one day.
    const near = anim === 'wave' && isPlayerView(this.view) ? this.nearestOther(4) : null;
    if (near && near.key !== 'st' && this.view) {
      if (this.waves.day !== this.view.day) this.waves = { day: this.view.day, to: new Set() };
      this.waves.to.add(near.key);
      if (this.waves.to.size >= 5) earn('friendship');
    }
    // Dancing right in the middle of the meeting circle, up on the dais.
    if (isDance(anim) && this.view?.mode === 'player' && local.zone === 'town' && Math.hypot(local.x - MEETING_CENTRE.x, local.z - MEETING_CENTRE.z) < 1.2) earn('disco');
  }

  private standUp() {
    if (this.seated) {
      this.seated = null;
      if (this.me) this.me.ty = 0;
    }
    if (isDance(this.emote?.anim)) this.emote = null;
  }

  /** Eaten or drunk in one go (E, or the button in the paw): a moment's gulp, then a little burst of speed. */
  private sip() {
    const item = local.item;
    if (!item || !SIPPABLE.has(item.k) || this.job || this.eating) return;
    const t = this.clock.elapsedTime;
    this.emote = { anim: 'drink', until: t + EAT_TIME + 0.15 };
    this.eating = { item, start: t };
    if (DRINKS.has(item.k)) gulpSound();
    else munchSound();
  }

  /** The item in the paw shrinks away as it goes down; once it's gone, the boost starts (or starts again). */
  private eatStep(t: number) {
    const e = this.eating;
    if (!e) return;
    const held = this.me?.rig.root.getObjectByName(`item:${e.item.k}`);
    // Given away, put away, swapped for something else or off to a job first: not eaten after all.
    if (local.item !== e.item || this.job) {
      this.eating = null;
      held?.scale.setScalar(1);
      return;
    }
    const k = (t - e.start) / EAT_TIME;
    if (held) held.scale.setScalar(Math.max(0.05, 1 - Math.max(0, k - 0.25) / 0.75));
    if (k < 1) return;
    this.eating = null;
    setItem(null);
    const drink = DRINKS.has(e.item.k);
    this.me?.bubble(drink ? 'Ahh!' : 'Yum!', 1800);
    if (this.view?.mode === 'player') tally('snacks');
    // One boost at a time: another snack starts it afresh rather than adding to it.
    const b = drink ? EAT_BOOST.drink : EAT_BOOST.food;
    useHud.setState({ boost: { until: Date.now() + b.secs * 1000, mul: b.mul, kind: drink ? 'drink' : 'food' } });
  }

  /** How much quicker something eaten or drunk lately makes us (only on this screen: speed isn't shared). */
  private snackBoost(): number {
    const b = useHud.getState().boost;
    return b && Date.now() < b.until ? b.mul : 1;
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

  /** Whoever (else) is sitting in this side of a confession booth: by name for the Storyteller, otherwise just someone. */
  private boothTaken(s: Station): string | null {
    for (const [key, p] of presence.others) {
      if (p.zone !== s.zone || Math.hypot(p.x - s.stand.x, p.z - s.stand.z) > 0.5) continue;
      if (this.view?.mode !== 'st') return 'Someone';
      return key === 'st' ? 'The Storyteller' : this.view?.seats.find((x) => x.id === key)?.name || 'Someone';
    }
    return null;
  }

  /** Whether both sides of a confession booth have someone sitting in them (us included). */
  private boothFull(booth: number): boolean {
    const zone = BOOTHS[booth].zone;
    return boothSeats(booth).every((seat) => {
      if (this.booth && local.zone === zone && Math.hypot(local.x - seat.x, local.z - seat.z) < 0.5) return true;
      for (const p of presence.others.values()) if (p.zone === zone && Math.hypot(p.x - seat.x, p.z - seat.z) < 0.5) return true;
      return false;
    });
  }

  /** Out through the curtain, to stand in front of the side we were in. */
  private leaveBooth() {
    const s = this.booth;
    this.booth = null;
    if (!s) return;
    this.seated = null;
    const out = BOOTH_HD + 0.55;
    local.x = s.stand.x + Math.sin(s.stand.ry) * out;
    local.z = s.stand.z + Math.cos(s.stand.ry) * out;
    local.ry = s.stand.ry;
    this.me?.setTarget(local.x, local.z, local.ry, 0);
    this.me?.snap();
    useHud.setState({ place: PLACE_NAMES[s.zone === 'house' ? 'town' : s.zone] });
  }

  /**
   * In the booth: if two people stepped into the same side at once, the one who sorts later steps back out (both
   * pages decide the same way); and talking with someone on the other side for a while earns its achievement.
   */
  private checkBooth(t: number, v: WorldView) {
    const s = this.booth;
    if (!s) return;
    const myKey = v.mode === 'st' ? 'st' : (v.mySeatId ?? '');
    const mine = s.booth ?? 0;
    let other = false;
    for (const [key, p] of presence.others) {
      if (boothAt(p.zone, p.x, p.z) !== mine) continue;
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

  private hasClubPass(v: WorldView): boolean {
    return this.clubPass === `${v.day}:${v.phase}`;
  }

  /**
   * A word with Big Moo on the club's door: he says something, you answer, and he lifts the rope (a different little
   * chat each time). Once he's let you in, he lets you in until night falls.
   */
  private talkToBouncer() {
    const v = this.view;
    if (!v || !this.me || performance.now() < this.bouncerBusy) return;
    const moo = this.town.bouncer;
    const at = localSpot(CLUB.x, CLUB.z, CLUB.ry, BOUNCER.lx, BOUNCER.lz);
    local.ry = Math.atan2(at.x - local.x, at.z - local.z);
    this.moveTarget = null;
    moo.lookAt(local.x, local.z);
    if (v.mode !== 'player' || this.hasClubPass(v)) {
      moo.say(['Back again? Go on in.', 'Looking good. In you go.', 'Rope’s up for you.'][Math.floor(Math.random() * 3)], 2600);
      return;
    }
    const hatId = v.seats.find((s) => s.id === v.mySeatId)?.look?.hat;
    const hat = hatId ? (HATS.find((h) => h.id === hatId)?.name.toLowerCase() ?? null) : null;
    let line = BOUNCER_TALK[this.bouncerLine++ % BOUNCER_TALK.length];
    while (line.hat && !hat) line = BOUNCER_TALK[this.bouncerLine++ % BOUNCER_TALK.length];
    const fill = (text: string) => text.replace('{song}', songById(v.club.song).name).replace('{hat}', hat ?? 'hat');
    const pass = `${v.day}:${v.phase}`;
    this.bouncerBusy = performance.now() + 4300;
    moo.say(fill(line.moo), 2300);
    const later = (ms: number, fn: () => void) => this.bouncerTimers.push(setTimeout(fn, ms));
    later(1500, () => {
      this.me?.bubble(fill(line.you), 2200);
      if (line.dance) this.startEmote('dance');
    });
    later(3500, () => {
      moo.say(fill(line.then), 3400);
      this.clubPass = pass;
    });
  }

  /**
   * The club: its music (inside, and faintly through the walls out by the door), its lights keeping time, the rope,
   * and Big Moo keeping an eye on whoever comes close.
   */
  private runClub(v: WorldView) {
    const song = songById(v.club.song);
    const key = `${song.id}:${v.club.at}`;
    if (key !== this.clubSongKey) {
      this.clubSongKey = key;
      this.town.setClubMusic(song.bpm, v.club.at, song.colors);
    }
    const kind = zoneKind(local.zone);
    let level = 0;
    let muffled = false;
    if (kind === 'club') level = 1;
    else if (kind === 'town') {
      const door = doorPoint(CLUB, 1);
      const d = Math.hypot(local.x - door.x, local.z - door.z);
      if (d < 11) {
        level = 0.35 * Math.pow(1 - d / 11, 1.5);
        muffled = true;
      }
    }
    if (useUI.getState().muted || v.mode === 'preview' || !v.joined || v.dim) level = 0;
    clubMusic.setSong(song.id, v.club.at);
    clubMusic.setLevel(level, muffled);
    // The rope is up for anyone Big Moo has let in (and for the Storyteller, who goes where they like).
    this.town.setClubRope(v.mode === 'st' || this.hasClubPass(v));
    const moo = this.town.bouncer;
    if (kind === 'town') {
      const b = localSpot(CLUB.x, CLUB.z, CLUB.ry, BOUNCER.lx, BOUNCER.lz);
      const d = Math.hypot(local.x - b.x, local.z - b.z);
      if (performance.now() >= this.bouncerBusy) {
        if (d < 5 && this.me) moo.lookAt(local.x, local.z);
        else moo.lookAway();
      }
      moo.setNear(d < 16);
    } else if (kind === 'club') {
      // The tiles light up under anyone on the dance floor.
      const spots: { x: number; z: number }[] = [];
      if (this.me && onDanceFloor(local.x, local.z)) spots.push({ x: local.x, z: local.z });
      for (const p of presence.others.values()) if (p.zone === 'club' && onDanceFloor(p.x, p.z)) spots.push({ x: p.x, z: p.z });
      this.town.setClubDancers(spots);
    }
  }

  private give() {
    const item = local.item;
    const near = this.nearestOther(2.6);
    if (!item || item.k === 'grimoire' || !near || this.job) return;
    this.hooks.give(near.key, item);
    setItem(null);
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
  private waves = { day: -1, to: new Set<string>() };

  private putAway() {
    if (!local.item || local.item.k === 'grimoire' || this.job) return;
    setItem(null);
  }

  private interact() {
    if (!this.me || this.view?.paused || this.job || this.bedGame || this.frozen || this.dawn || this.pinned()) return;
    if (this.inBed) {
      if (useHud.getState().sheep === 'offer' && !useHud.getState().bedMenu) useHud.setState({ sheep: 'playing' });
      return;
    }
    const s = this.nearStation;
    if (!s) {
      if (local.item && SIPPABLE.has(local.item.k)) this.sip();
      return;
    }
    if (s.job === 'shop') {
      useHud.setState({ casino: { kind: 'shop' } });
      return;
    }
    if (s.job === 'flats') {
      this.standUp();
      useDecor.setState({ dir: true });
      return;
    }
    if (s.job === 'blackjack' || s.job === 'poker' || s.job === 'roulette' || s.job === 'slots') return this.sitAtTable(s);
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
    } else if (s.job === 'takeBread') {
      const l = v?.town.loaves[0];
      if (l) this.hooks.townAction({ k: 'takeBake', id: l.id });
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
        this.me?.bubble('Fresh well water!', 2200);
        if (this.view?.mode === 'player') tally('buckets');
      }, 1600);
    } else if (s.job === 'notice') {
      useHud.setState({ notice: true });
    } else if (s.job === 'bouncer') {
      this.talkToBouncer();
    } else if (s.job === 'jukebox') {
      ui.open({ kind: 'jukebox' });
    } else if (s.job === 'leaders') {
      ui.open({ kind: 'leaders' });
    } else if (s.job === 'ideas') {
      ui.open({ kind: v?.mode === 'st' ? 'ideas' : 'idea' });
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
      // Every different seat about town counts (once each, ever).
      if (s.job === 'sit' && isPlayerView(v)) tally('seats', 1, `seat:${s.id}`);
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

  /** Sits down at a card table and brings the camera in to the seat's-eye view (see TableCam). */
  private sitAtTable(s: Station) {
    const v = this.view;
    if (!this.me || !v) return;
    const kind = s.job as TableKind;
    const seat = Number(s.id.split('-')[1]);
    if (v.mode !== 'player') {
      this.me.bubble('The tables are for the players', 2200);
      return;
    }
    const cv = casinoNow(v.mode);
    const there = cv ? sittingAt(cv, kind, seat) : null;
    if (there && !there.mine) {
      this.me.bubble(`${there.name} is sitting there`, 2200);
      return;
    }
    this.stopEverything();
    local.x = s.stand.x;
    local.z = s.stand.z;
    local.ry = s.stand.ry;
    this.seated = { y: s.y ?? CHAIR_Y, anim: 'sit' };
    this.me.setTarget(local.x, local.z, local.ry, this.seated.y);
    this.me.snap();
    useHud.setState({ casino: { kind, seat } });
    this.tableCam?.dispose();
    this.tableKind = kind;
    // (The town camera's own swing starts again from straight behind when we get up.)
    this.swing.yaw = this.swing.pitch = 0;
    // The eyes: above the seat, a little in towards the table, at about the height of a sitting animal's head. (At a
    // slot machine, back behind the stool instead, so the top of the machine shows above the panel.)
    const ahead = kind === 'slots' ? -0.95 : 0.18;
    const eyeY = this.seated.y + THREE.MathUtils.clamp(this.me.rig.headHeight * 0.75, 0.65, 1.05);
    const eye = new THREE.Vector3(local.x + Math.sin(local.ry) * ahead, eyeY, local.z + Math.cos(local.ry) * ahead);
    // Looking down past our own cards towards the middle of the table. (At poker, at the middle itself, so the faces
    // round it are in view and not just the felt; at a slot machine, at its reels.)
    const at = kind === 'blackjack' ? bjSpot(seat, 0.8) : kind === 'poker' ? PK_TABLE : kind === 'slots' ? { x: SLOTS[seat].x - 0.3, z: SLOTS[seat].z } : RL_LOOK;
    this.tableCam = new TableCam(this.renderer.domElement, eye, new THREE.Vector3(at.x, kind === 'slots' ? 1.15 : FELT_Y, at.z));
  }

  /**
   * Wren Court: the flat on show (as decorated so far, while we're decorating ours), and its name. Leaving our flat
   * puts down whatever's in hand and stops decorating; leaving the lobby closes its list.
   */
  private syncFlats(v: WorldView | null) {
    if (this.dawn) return;
    const kind = zoneKind(local.zone);
    const d = useDecor.getState();
    if (kind !== 'lobby' && d.dir) useDecor.setState({ dir: false });
    const key = flatOwner(local.zone);
    const mode = v?.mode ?? 'preview';
    const fv = key && mode !== 'preview' ? flatNow(mode, { key }) : null;
    const shown = fv?.flat && fv.flat.key === key ? fv.flat : null;
    if (d.draft && !shown?.mine) decor.finish();
    if (kind !== 'flat') return;
    const draft = shown?.mine ? useDecor.getState().draft : null;
    const held = draft ? useDecor.getState().held : null;
    this.town.setFlat({
      layout: draft ?? shown?.layout ?? emptyLayout(),
      held: draft && held ? { ...held, ok: !whyNot(draft.items, held.item, held.index) } : null,
      grid: Boolean(draft),
    });
    // At night it's somebody's bedroom (the letters and the music in bed go by the place's name).
    const night = Boolean(v?.started && v.phase === 'night');
    const sleeper = v?.seats.find((s) => this.homeOf(s.id) === local.zone);
    const mine = Boolean(shown?.mine) || (sleeper !== undefined && sleeper.id === v?.mySeatId);
    const name = shown?.name ?? sleeper?.name ?? null;
    this.town.setHomeOwner(name ? shownName(name) : 'Wren Court');
    const room = night ? 'bedroom' : 'flat';
    const place = mine ? `Your ${room}` : name ? `${shownName(name)}’s ${room}` : PLACE_NAMES.flat;
    if (useHud.getState().place !== place) useHud.setState({ place });
  }

  /** Up in the lobby's lift to someone's flat, with a ding for whoever's in it. */
  private goToFlat(key: string) {
    if (!this.me || zoneKind(local.zone) !== 'lobby' || this.entering) return;
    useDecor.setState({ dir: false });
    this.stopEverything();
    const zone = flatZone(key);
    const at = ROOM_DOOR.flat.arrive;
    local.entering = zone;
    doorChime(0.7);
    const wait = setTimeout(() => {
      if (this.entering !== wait) return;
      this.entering = null;
      local.entering = null;
      this.place(zone, at.x, at.z, at.ry, true);
    }, DOOR_WAIT_MS * 0.6);
    this.entering = wait;
  }

  /** Keeps the card table, its panel and the camera together: closing the panel stands us up, and standing up closes it. */
  private syncCasino(v: WorldView | null) {
    const at = useHud.getState().casino;
    const atTable = at && at.kind !== 'shop';
    if (this.tableCam && (!atTable || !this.seated || zoneKind(local.zone) !== 'casino')) {
      this.tableCam.dispose();
      this.tableCam = null;
      if (this.seated) this.standUp();
      // However we got up, the seat is given up (the host finishes or folds a hand in play, and cashes out the chips).
      if (v?.mode === 'player') casino({ k: TABLE_ACTION[this.tableKind], do: 'leave' });
      if (atTable) useHud.setState({ casino: null });
    } else if (atTable && !this.tableCam) useHud.setState({ casino: null });
    if (at?.kind === 'shop' && !at.away && zoneKind(local.zone) !== 'casino') useHud.setState({ casino: null });
    if (zoneKind(local.zone) === 'casino' && v && v.mode !== 'preview') this.town.setCasino(casinoNow(v.mode), v.mode === 'st' ? 0 : hostNow() - Date.now());
    // From a seat at a card table, everyone else round it gets a plate saying who they are (in place of their name
    // tag, which would sit just above it).
    const plated = this.tableCam && this.tableKind !== 'slots' ? this.tableKind : null;
    this.town.setCasinoSeat(plated);
    this.tablemates.clear();
    const cv = plated && v && v.mode !== 'preview' ? casinoNow(v.mode) : null;
    if (cv && plated) {
      const names = (plated === 'blackjack' ? cv.bj : plated === 'poker' ? cv.pk.seats : cv.rl.seats).filter((s) => s && !s.mine).map((s) => s!.name);
      for (const s of v?.seats ?? []) if (names.includes(s.real ?? s.name)) this.tablemates.add(s.id);
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
          if (isPlayerView(this.view)) tally('flowers');
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
            if (x.kind === 'Silver Eel') earn('snakes');
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
      this.creditJob(j.job, r);
    }
    setItem(item);
    this.emote = result ? { anim: 'cheer', until: this.clock.elapsedTime + 1.6 } : null;
  }

  /** What any finished minigame earns, by day or from bed: its hat, a little money, the all-rounder count, records. */
  private creditJob(job: GameJob, r: JobResults[GameJob]) {
    // Doing a job perfectly earns its hat (all five logs split, three stars, a wish come true).
    const stars = (r as { stars?: number }).stars ?? 0;
    if (stars >= 3 && isPlayerView(this.view)) notePerfect(job);
    // (Two or three stars earn a little money too, and having a go at every job is an achievement.)
    if (stars >= 2 && isPlayerView(this.view)) noteTopJob(job, stars >= 3 ? 3 : 2);
    if (isPlayerView(this.view)) tally('jobs', 1, `job:${job}`);
    // Anything that beats the town's best is kept on the noticeboard for everyone.
    const score = SCORE_OF?.[job]?.(r as never) ?? 0;
    if (score > 0) {
      this.hooks.townAction({ k: 'record', game: job, score });
      rememberBest(job, score);
    }
  }

  /**
   * Passing the time in bed at night: one of the minigames, played lying down (nobody else sees anything but a
   * sleeper). It pays as by day but leaves nothing in the town (no drinks on the bar, no flowers in the beds).
   */
  private startBedGame(job: GameJob) {
    const v = this.view;
    if (!this.inBed || this.job || this.bedGame || this.visit?.mine || !v || v.mode !== 'player' || v.phase !== 'night') return;
    if (useClient.getState().priv?.wake || useHud.getState().sheep === 'playing' || useHud.getState().visit) return;
    this.bedGame = job;
    useHud.setState({ job: { job, station: `bed:${job}` }, bedMenu: false });
  }

  /** A game in bed over (or stopped): back to the menu for another, unless `interrupted`. */
  private finishBedGame(result: unknown, interrupted = false) {
    const job = this.bedGame;
    if (!job) return;
    this.bedGame = null;
    useHud.setState({ job: null, bedMenu: !interrupted });
    if (result !== undefined && result !== null) this.creditJob(job, result as JobResults[GameJob]);
  }

  /** A wake, the hooded figure, dawn: the game in bed (and its menu) closes straight away, with nothing paid. */
  private closeBedGame() {
    this.finishBedGame(undefined, true);
    if (useHud.getState().bedMenu) useHud.setState({ bedMenu: false });
  }

  private goTo(key: string) {
    if (!this.me) return;
    const p = presence.others.get(key);
    if (!p) return;
    if (zoneKind(p.zone) === 'house' || (zoneKind(p.zone) === 'flat' && p.anim === 'sleep')) {
      // Float at the foot of the bed, looking over whoever is sleeping in it.
      const bed = this.town.stations.find((s) => s.zone === zoneKind(p.zone) && s.job === 'sleep');
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
    ambience.update({ zone: this.dawn?.zone ?? local.zone, x: local.x, z: local.z, night: this.dawn ? 1 : this.time, yaw: this.yaw });
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
    this.runDawn(t, v);
    this.runPigeons(t, v);
    this.runPit(dt, t, v);
    // Unlock popups wait while something everyone should watch is on screen.
    const drama = Boolean(this.show || this.visit || this.dawn);
    if (drama !== useHud.getState().drama) useHud.setState({ drama });
    if (this.me && v) this.moveMe(dt, t, v);
    if (v) this.runClub(v);
    this.updateOthers(dt, t, v);
    this.syncCasino(v);
    this.syncFlats(v);
    this.updateCamera(dt, t);
    this.fadeOccluders(dt);
    this.town.follow(this.camTarget.x, this.camTarget.z);
    // A confession booth's curtains close while someone sits on each side.
    for (let i = 0; i < BOOTHS.length; i++) this.town.setBoothCurtains(this.boothFull(i), i);
    this.town.update(dt, t);
    this.footsteps(t, v);
    this.fireworks.update(dt);

    // Shadows are baked: the map is only redrawn when the town says something changed (and now and then). Drawing
    // the whole town's takes long enough to show as a hitch while walking, so slow changes (the sun creeping round,
    // the now-and-then) wait until the camera stops moving (and SHADOW_DRIFT_GAP_S since the last), or
    // SHADOW_SAFETY_S at most.
    if (fx.consumeShadowDirty && this.renderer.shadowMap.enabled) {
      this.renderer.shadowMap.autoUpdate = false;
      if ((fx.consumeShadowDrift() || t - this.lastShadowAt > SHADOW_SAFETY_S) && this.shadowDriftAt === null) this.shadowDriftAt = t;
      if (fx.consumeShadowDirty()) this.shadowWanted = true;
      const arrived = fx.consumeShadowUrgent();
      const since = t - this.lastShadowAt;
      // (Still: drifting less than 10 cm a second, as it settles after we stop.)
      const still = this.camera.position.distanceTo(this.lastCamAt) < 0.1 * Math.max(dt, 0.001);
      const drift = this.shadowDriftAt !== null && ((still && since > SHADOW_DRIFT_GAP_S) || t - this.shadowDriftAt > SHADOW_SAFETY_S);
      // Out in town a change waits until SHADOW_GAP_S after the last redraw: dusk and dawn move the sun on every
      // frame, and so does a hanging's rope, and redrawing the town's shadows on every one of those frames stuttered.
      // Arriving somewhere can't wait, and a room's own shadows are cheap to draw.
      const due = this.shadowWanted && (arrived || since >= SHADOW_GAP_S || zoneKind(local.zone) !== 'town');
      if (due || drift) {
        this.lastShadowAt = t;
        this.shadowDriftAt = null;
        this.shadowWanted = false;
        this.renderer.shadowMap.needsUpdate = true;
        fx.shadowsDrawn();
      }
    }
    this.lastCamAt.copy(this.camera.position);


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
    if (!v.paused && !this.job && !this.frozen && !this.dawn && !this.inBed && !pinned && !this.entering) {
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
    if (!(ix || iz) && this.moveTarget && !this.frozen && !this.dawn && !this.entering) {
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
      // (And something eaten or drunk lately, for a little while.)
      const speed = st ? (running ? FLOAT * 1.7 : FLOAT) : (running ? RUN : WALK) * hatBoost() * this.snackBoost();
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

    this.eatStep(t);
    // What we're doing, in order of importance.
    const nom = v.nomination;
    const voting = Boolean(nom && v.mySeatId && nom.votes.includes(v.mySeatId) && nom.status !== 'done');
    // Dancing on the club's floor keeps going until you walk off it.
    if (this.emote?.anim === 'dance' && local.zone === 'club' && onDanceFloor(local.x, local.z) && this.emote.until - t < 1) this.emote.until = t + (EMOTE_TIME.dance ?? 8);
    if (this.emote && t > this.emote.until) this.emote = null;
    let anim: Anim = moving ? (this.keys.has('shift') ? 'run' : 'walk') : 'idle';
    if (this.job) anim = JOB_LOOK[this.job.job].anim;
    else if (st && v.reading) anim = 'fish';
    else if (voting) anim = 'hand';
    else if (this.emote) {
      anim = this.emote.anim;
      if (this.emote.face !== undefined && !moving) local.ry = turnToward(local.ry, this.emote.face, dt * 8);
    } else if (this.party && this.party.left > 0 && this.seated?.y === STOOL_Y) {
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
    const staged = this.show?.mine ? this.stagePose() : null;
    if (staged) {
      local.x = staged.pos.x;
      local.z = staged.pos.z;
      myY = staged.pos.y;
      anim = staged.anim;
      local.anim = anim;
    } else if (this.show?.mine) {
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
    // (Nobody is drawn while the dawn reel shows last night's deaths, but the stand-in in bed.)
    me.setVisible(!this.dawn);
    // (A prestige hat's glow would only get in the way of the show.)
    me.setHatFxShown(!this.show?.mine);
    me.update(dt, t, anim, local.speaking, false);
    me.rig.root.rotation.z = (dangle?.swing ?? 0) + (this.visit?.mine && this.victimPose ? this.victimPose.shake : 0);
    if (this.visit?.mine && this.victimPose) me.rig.root.position.y += this.victimPose.dy;
    me.rig.root.scale.setScalar(dangle?.scale ?? 1);
    if (this.visit?.mine && this.victimPose) this.visit.kit.bendVictim(me.rig.root, this.victimPose);
    // Down in the dark under the gallows (or through the bed), their name tag goes too.
    me.setTagShown(!dangle?.hidden && !(this.visit?.mine && this.victimPose?.hidden));
    if (staged) this.applyStagePose(me, staged);

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
    // For the hats with achievements of their own: shouts lately (counted in the constructor), out in bad weather
    // since, lying on a bed with company since, looking down from on high since, and someone we're creeping up behind.
    shouts: [] as number[],
    coldSince: null as number | null,
    posedSince: null as number | null,
    highSince: null as number | null,
    sneak: null as { key: string; since: number; ry: number } | null,
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
    if (v.phase === 'day' && kind !== 'town' && kind !== 'house' && kind !== 'flat') {
      f.places.add(kind);
      if (f.places.size >= 4) earn('tourist');
    }
    // A lap of the ring road, keeping going: the angle round the town adds up while on the road and moving.
    // (It bends round the back of the church, so it's the road itself that counts, not a circle.)
    const onRoad = kind === 'town' && roadDistance(local.x, local.z) < 2.2;
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
    // Dancing a whole minute without a break (switching dances is fine), and standing
    // stock still, doing nothing at all, for five (real time, however few frames there are).
    const dancing = isDance(this.emote?.anim) && this.emote!.until > this.clock.elapsedTime;
    f.danceSince = dancing ? (f.danceSince ?? t) : null;
    if (f.danceSince !== null && t - f.danceSince >= 60) earn('onemore');
    const idle = !moving && !this.emote && !this.seated && !this.inBed && !this.job && !this.show && Math.abs(turn) < 0.0001;
    f.idleSince = idle ? (f.idleSince ?? t) : null;
    if (f.idleSince !== null && t - f.idleSince >= 300) earn('afk');
    // Dancing with two others dancing right beside us.
    if (dancing) {
      let amigos = 0;
      for (const [key, p] of presence.others) if (key !== 'st' && p.zone === local.zone && isDance(p.anim) && Math.hypot(p.x - local.x, p.z - local.z) < 3) amigos++;
      if (amigos >= 2) earn('amigos');
    }
    // Lying on a bed (in the day, not tucked in for the night) while someone else is in the room.
    const posing = (kind === 'house' || kind === 'flat') && this.seated?.anim === 'sleep' && !this.inBed && [...presence.others.values()].some((p) => p.zone === local.zone);
    f.posedSince = posing ? (f.posedSince ?? t) : null;
    if (f.posedSince !== null && t - f.posedSince >= 5) earn('portrait');
    // Out in the rain or the mist for three whole minutes, without going in.
    const cold = kind === 'town' && (this.weather === 'rain' || this.weather === 'mist');
    f.coldSince = cold ? (f.coldSince ?? t) : null;
    if (f.coldSince !== null && t - f.coldSince >= 180) earn('letitgo');
    // The camera swung right up overhead and zoomed all the way out, for a few seconds.
    const high = kind === 'town' && this.dist >= 25.5 && this.swing.pitch >= 0.45;
    f.highSince = high ? (f.highSince ?? t) : null;
    if (f.highSince !== null && t - f.highSince >= 4) earn('majortom');
    // Standing right behind someone, close, for five seconds without them turning round (both on our feet: sat on
    // neighbouring stools at a meeting doesn't count).
    let behind: { key: string; ry: number } | null = null;
    const standing = !this.seated && !this.inBed && !this.job;
    for (const [key, p] of standing ? presence.others : []) {
      const d = Math.hypot(local.x - p.x, local.z - p.z);
      if (p.zone !== local.zone || d > 1.4 || d < 0.2 || p.anim === 'sit' || p.anim === 'sleep') continue;
      if ((Math.sin(p.ry) * (local.x - p.x) + Math.cos(p.ry) * (local.z - p.z)) / d < -0.7) behind = { key, ry: p.ry };
    }
    if (!behind || f.sneak?.key !== behind.key || Math.abs(wrapAngle(behind.ry - f.sneak.ry)) > 0.8) f.sneak = behind && { ...behind, since: t };
    if (f.sneak && t - f.sneak.since >= 5) earn('ninja');
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
    // Into the club only once Big Moo has let you in.
    if (door.to === 'club' && !st && !this.hasClubPass(v)) return { locked: 'Big Moo wants a word first' };
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
      // tower itself, so walking round it (or past the front on the way to the stools) doesn't take you in; the
      // cottages' and the club's want you heading for the building too, so running along the ring road past their
      // doors doesn't either.
      let toward = moving && (door.x - local.x) * dx + (door.z - local.z) * dz > -0.2;
      const heading = (cx: number, cz: number) => ((cx - local.x) * dx + (cz - local.z) * dz) / (Math.hypot(dx, dz) * Math.hypot(cx - local.x, cz - local.z) || 1);
      if (toward && door.id.startsWith('tower-in')) toward = heading(0, 0) > 0.6;
      else if (toward && door.id.startsWith('house-')) {
        const h = this.town.houseSlots[door.slot ?? 0];
        toward = heading(h.x, h.z) > 0.6;
      } else if (toward && door.id === 'club-in') toward = heading(CLUB.x, CLUB.z) > 0.6;
      else if (toward && door.id === 'lobby-in') toward = heading(FLATS.x, FLATS.z) > 0.6;
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
    if (this.job || useHud.getState().casino || useDecor.getState().dir || useDecor.getState().draft) prompt = null;
    else if (this.inBed) {
      const sheep = useHud.getState().sheep;
      prompt = sheep === 'offer' ? { label: 'Count the sheep', key: 'E' } : sheep === 'playing' ? null : { label: 'Fast asleep until morning', key: '', locked: true };
    } else if (this.nearDoor?.locked && best?.job !== 'bouncer') prompt = { label: this.nearDoor.locked, key: '', locked: true };
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
      else if (best.job === 'bouncer' && (v.mode === 'st' || this.hasClubPass(v))) label = 'Say hello to Big Moo';
      else if (best.job === 'bouncer' && performance.now() < this.bouncerBusy) {
        label = 'Big Moo is thinking it over…';
        locked = true;
      } else if (best.job === 'ideas' && v.mode === 'st') label = 'Read the ideas';
      else if (best.job === 'blackjack' || best.job === 'poker' || best.job === 'roulette' || best.job === 'slots') {
        const cv = v.mode === 'preview' ? null : casinoNow(v.mode);
        const there = cv ? sittingAt(cv, best.job, Number(best.id.split('-')[1])) : null;
        if (there && !there.mine) {
          label = `${there.name}’s seat`;
          locked = true;
        }
      }
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
      prompt = { label: DRINKS.has(local.item.k) ? 'Drink it' : 'Eat it', key: 'E' };
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

  /** An execution worth showing: still being voted on, or its show not long started (a late arrival just finds them dead). */
  private freshExecution(ex: Execution): boolean {
    const now = Date.now();
    if (!ex.method && ex.vote) return now < ex.vote.until + 4000 && now - ex.at < 20000;
    return now - showStartAt(ex) < (ex.drawn ? 4000 : 12000);
  }

  /** Over (or called off): the condemned carries on, as a ghost or not, and whatever the show put up comes down. */
  private endShow() {
    const show = this.show;
    if (!show) return;
    this.show = null;
    this.gavelled = false;
    show.stage?.dispose();
    const spot = this.town.gallowsSpot;
    this.town.setGallows({ open: 0, label: '', rope: GALLOWS_ROPE_REST });
    const av = show.mine ? this.me : this.others.get(show.seatId);
    if (av) av.rig.root.rotation.set(0, av.rig.root.rotation.y, 0);
    const v = this.view;
    if (v) av?.setInfo(this.infoFor(show.seatId, v));
    if (show.mine) {
      this.frozen = false;
      // Still in a meeting: back to their own stool, as a ghost. Otherwise they step off beside the gallows.
      this.place('town', spot.x + 2.2, spot.z + 1.4, Math.PI, false);
      if (v && (v.townHall || v.nomination) && this.meetingIndex() >= 0) this.takeMeetingSeat();
    } else if (av) {
      // Onlookers put them straight where their own screen has sent them, rather than sliding off the gallows.
      av.placed = false;
    }
  }

  /**
   * The execution. While the town votes on how and the wheel spins, the condemned waits on the trapdoor. Then the
   * gallows (timings in SHOW): a short drumroll while the noose comes down, the gavel and the drop, the rope taking
   * the weight with a small bounce and a swing that dies away, then a puff and the ghost let go. Any other way is
   * run by its stage (see exec/stage.ts), with the gallows' noose tied up out of the way.
   */
  private runShow(t: number) {
    const show = this.show;
    if (!show) return;
    if (show.method && show.method !== 'hang' && !show.stage && show.start !== null) {
      const shows = execShows.now();
      if (shows) {
        show.stage = shows.makeStage(show.method, show.survives, this.town.gallowsSpot, execSound);
        this.town.groups.town.add(show.stage.group);
      } else {
        // Its props are still on their way (a slow line): they wait on the trapdoor and it starts as they arrive,
        // a beat behind everyone else.
        show.start = Math.max(show.start, t + 0.1);
      }
    }
    const age = this.showAge(t);
    const av = show.mine ? this.me : this.others.get(show.seatId);
    if (show.start === null || age < 0) {
      // Something went astray (the vote never closed): called off rather than left standing there.
      if (show.start === null && t > show.giveUp) this.endShow();
      else this.town.setGallows({ open: 0, label: `${show.name} is to be executed`, rope: GALLOWS_ROPE_REST });
      return;
    }
    if (show.stage) {
      const stage = show.stage;
      const pose = stage.update(age, av?.shown ? av.rig : null, this.camera);
      show.pose = pose;
      const sign = execMethod(show.method).sign(show.name);
      const label = show.survives ? (age > stage.end - 1.8 ? `${show.name} survives!` : sign) : age < stage.soulAt ? sign : '';
      this.town.setGallows({ open: 0, label: age > stage.end - 0.3 ? '' : label, rope: 0.25 });
      if (show.alive && pose.ghost) this.becomeGhost(show);
      if (age > (show.mine ? stage.end : stage.end + 0.8)) this.endShow();
      return;
    }
    if (!show.drum) {
      show.drum = true;
      if (age < 0.5) drumroll(SHOW.drop - 0.1);
    }
    if (age >= SHOW.drop && !this.gavelled) {
      this.gavelled = true;
      gavel();
    }
    // The trapdoor snaps open on the drop and swings shut once the ghost is up. For someone who survives it only
    // rattles: it jams, and the rope snaps instead.
    const end = show.survives ? SHOW.spared : SHOW.end;
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
    const pose = this.showPose(age, this.bodyOf(av));
    const over = age >= end;
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
    if (show.alive && !show.survives && age >= SHOW.puff) this.becomeGhost(show);
    // (`released` is the rope snapping for one who survives, and the ghost's twinkle for one who doesn't.)
    if (age >= SHOW.puff + SOUL.rise && !show.released && !show.survives) {
      show.released = true;
      execSound('twinkle');
    }
    if (age > (show.mine ? end : end + 0.8)) this.endShow();
  }

  /** From now on they're drawn as the ghost they are (until now they've been kept as they were). */
  private becomeGhost(show: NonNullable<Engine['show']>) {
    show.alive = false;
    const v = this.view;
    if (!v) return;
    if (show.mine) this.me?.setInfo(this.infoFor(show.seatId, v));
    else this.others.get(show.seatId)?.setInfo(this.infoFor(show.seatId, v));
    if (show.method === 'hang') execSound('soul');
  }

  /**
   * The hooded figure's visit. It plays for the player who was killed, tucked up in their own bed (with the camera
   * pulled back to watch it), or for the Storyteller if they're at that bedside; once only, on each screen. It stops
   * if whoever is watching leaves the room (dawn, say).
   */
  private runVisit(t: number, v: WorldView | null) {
    const visits = nightVisits.now();
    // (Fetched as soon as there's a visit to play, if it hasn't arrived already.)
    if (!visits && v?.visits.length) nightVisits.want();
    if (!this.visit && visits && v && v.phase === 'night' && this.me) {
      for (const vis of v.visits) {
        const zone = this.homeOf(vis.seatId);
        if (!zone || this.visitsSeen.has(vis.id) || local.zone !== zone) continue;
        const mine = v.mode === 'player' && vis.seatId === v.mySeatId;
        if ((mine && !this.inBed) || (!mine && v.mode !== 'st')) continue;
        this.visitsSeen.add(vis.id);
        saveJSON(VISITS_SEEN_KEY, [...this.visitsSeen].slice(-50));
        const variant = Number.isFinite(vis.variant) ? Math.abs(Math.floor(vis.variant)) % visits.VISIT_NAMES.length : 0;
        const scene = new visits.NightVisit(this.town.groups.flat, variant, visitSound);
        // Aimed at whoever is in the bed, however their animal lies.
        const victim = mine ? this.me : this.others.get(vis.seatId);
        if (victim) scene.aim(new THREE.Box3().setFromObject(victim.rig.root).translate(this.town.groups.flat.position.clone().negate()));
        this.visit = { id: vis.id, seatId: vis.seatId, zone, mine, scene, start: t, kit: visits };
        if (mine) {
          this.closeBedGame();
          useHud.setState({ sheep: 'done', visit: 'playing' });
        }
        break;
      }
    }
    const vis = this.visit;
    if (!vis) {
      this.victimPose = null;
      return;
    }
    const age = t - vis.start;
    if (local.zone !== vis.zone || age > vis.kit.VISIT.end) {
      vis.scene.dispose();
      this.visit = null;
      this.victimPose = null;
      if (vis.mine) {
        // A slow frame can jump right past the dark moment: then it shows now, for a few seconds.
        if (useHud.getState().visit === 'dark') useHud.setState({ visit: null });
        else {
          useHud.setState({ visit: 'dark' });
          setTimeout(() => useHud.getState().visit === 'dark' && !this.visit && useHud.setState({ visit: null }), 3500);
        }
        earn('visited');
      }
      return;
    }
    this.victimPose = vis.scene.update(age);
    if (vis.mine && age > vis.kit.VISIT.dark && useHud.getState().visit !== 'dark') useHud.setState({ visit: 'dark' });
  }

  // ---------------------------------------------------------------- the dawn reel

  private startDawn(reel: DawnReel) {
    if (this.dawn) this.endDawn(false);
    let at = 0;
    const slots = reel.deaths.map((d) => {
      const len = d.variant === null ? DAWN.quiet : DAWN.visit;
      const slot = { seatId: d.seatId, variant: d.variant, from: at, to: at + len };
      at += len;
      return slot;
    });
    this.dawn = { id: reel.id, age: 0, last: this.clock.elapsedTime, slots, slot: -1, zone: null, rig: null, scene: null, kit: null, pose: null, cut: true };
    nightVisits.want();
    this.stopEverything();
  }

  /**
   * The dawn reel: each of the night's deaths in turn, in the victim's bedroom, with a caption. The Storyteller can
   * skip it (for everyone); night falling, the game ending or the reel running out ends it too.
   */
  private runDawn(t: number, v: WorldView | null) {
    const d = this.dawn;
    if (!d) return;
    if (!v || v.dawn?.id !== d.id || v.phase !== 'day' || v.ended) return this.endDawn(true);
    // (A slow frame moves it on a little at most, so a struggling screen still sees each death, only later.)
    d.age += Math.min(0.25, Math.max(0, t - d.last));
    d.last = t;
    const age = d.age;
    const i = d.slots.findIndex((s) => age < s.to);
    if (i < 0) return this.endDawn(true);
    if (i !== d.slot) this.dawnSlot(i, v);
    const slot = d.slots[i];
    const u = age - slot.from;
    const rig = d.rig;
    if (rig) {
      rig.update({ anim: 'sleep', speed: 0, dt: 1 / 30, t });
      rig.root.rotation.z = 0;
      rig.root.scale.setScalar(1);
    }
    if (d.scene) {
      const pose = d.scene.update(u + DAWN.from);
      if (rig && d.kit) {
        rig.root.position.y = this.dawnBedY() + pose.dy;
        rig.root.rotation.z = pose.shake;
        d.kit.bendVictim(rig.root, pose);
        rig.root.visible = !pose.hidden;
      }
    } else if (u > DAWN.quietAt && rig) {
      // No visit: they slip away in their sleep, a little ghost rising out of the bed and gone.
      const k = Math.min(1, (u - DAWN.quietAt) / 1.6);
      if (!rig.root.userData.ghost) {
        rig.root.userData.ghost = true;
        rig.setGhost(true);
        execSound('soul');
        this.town.puff(rig.root.position.x, rig.root.position.y + 0.3, rig.root.position.z);
      }
      rig.root.position.y = this.dawnBedY() + k * 1.4;
      rig.root.scale.setScalar(Math.max(0.001, 1 - Math.max(0, k - 0.7) / 0.3));
    } else if (u > DAWN.quietAt && !rig) {
      this.once(`dawnpuff:${d.id}:${i}`, () => {
        const bed = this.dawnBed();
        this.town.puff(bed.x, this.dawnBedY() + 0.4, bed.z);
        execSound('soul');
      });
    }
  }

  /** Something done once only, by key (for the dawn reel's moments). */
  private onceKeys = new Set<string>();
  private once(key: string, fn: () => void) {
    if (this.onceKeys.has(key)) return;
    this.onceKeys.add(key);
    fn();
  }

  private dawnBed() {
    const bed = this.town.stations.find((s) => s.id === 'flat-bed');
    return { x: bed?.stand?.x ?? BED.x, z: bed?.stand?.z ?? BED.z, ry: bed?.stand?.ry ?? 0, y: bed?.y ?? BED.top };
  }

  private dawnBedY() {
    return this.dawnBed().y;
  }

  /** On to the next death: their bedroom, them in bed (a stand-in: they're out in the square by now), and the visit. */
  private dawnSlot(i: number, v: WorldView) {
    const d = this.dawn!;
    this.clearDawnSet(d);
    d.slot = i;
    d.cut = true;
    const slot = d.slots[i];
    const seat = v.seats.find((s) => s.id === slot.seatId);
    const name = seat ? shownName(seat.name) : 'Someone';
    d.zone = this.homeOf(slot.seatId);
    // Their own flat as it's furnished, where we can see it (the Storyteller can); a plain one otherwise.
    const key = d.zone ? flatOwner(d.zone) : null;
    const fv = key && v.mode === 'st' ? flatNow('st', { key }) : null;
    this.town.setFlat({ layout: fv?.flat?.layout ?? emptyLayout(), held: null, grid: false });
    this.town.setHomeOwner(name);
    this.town.show('flat', true);
    const bed = this.dawnBed();
    if (seat?.look) {
      const rig = buildAnimal({ ...seat.look, pet: null });
      rig.root.position.set(bed.x, bed.y, bed.z);
      rig.root.rotation.y = bed.ry;
      rig.update({ anim: 'sleep', speed: 0, dt: 1, t: 0 });
      this.scene.add(rig.root);
      d.rig = rig;
    }
    const kit = nightVisits.now();
    if (slot.variant !== null && kit && d.rig) {
      const variant = Math.abs(Math.floor(slot.variant)) % kit.VISIT_NAMES.length;
      d.scene = new kit.NightVisit(this.town.groups.flat, variant, visitSound);
      d.rig.root.updateMatrixWorld(true);
      d.scene.aim(new THREE.Box3().setFromObject(d.rig.root).translate(this.town.groups.flat.position.clone().negate()));
      d.kit = kit;
    }
    const line = d.scene ? `Last night, at ${name}’s flat…` : `Last night, ${name} slipped away in their sleep…`;
    useHud.setState({ dawnReel: { line, n: i + 1, of: d.slots.length, key: `${d.id}:${i}` } });
  }

  private clearDawnSet(d: NonNullable<Engine['dawn']>) {
    d.scene?.dispose();
    d.scene = null;
    d.kit = null;
    if (d.rig) {
      d.rig.root.removeFromParent();
      d.rig.dispose();
      d.rig = null;
    }
  }

  /** The reel is over (or skipped): the bedroom comes down, and it's morning in town, everyone in the square. */
  private endDawn(news: boolean) {
    const d = this.dawn;
    if (!d) return;
    this.clearDawnSet(d);
    this.dawn = null;
    useHud.setState({ dawnReel: null });
    this.showZone();
    const v = this.view;
    if (news && v && v.phase === 'day' && !v.ended) {
      // The morning's news, held back while the reel played.
      const died = d.slots.map((s) => v.seats.find((x) => x.id === s.seatId)?.name).filter((x): x is string => Boolean(x)).map((n) => shownName(n));
      ui.banner(`Day ${v.day}`, `${joinNames(died)} died in the night`);
    }
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

  /**
   * The pet pit: the fight in the ring (for everyone, though it's only seen and heard in the cellar), the fighters'
   * own pets hidden from their heels meanwhile, a fighter taken to their corner as their fight starts, and the
   * achievements for winning.
   */
  private runPit(dt: number, t: number, v: WorldView | null) {
    const pit = v?.pit ?? null;
    const here = zoneKind(local.zone) === 'cellar';
    this.pitShow.update(dt, t, pit, here, local, (seat) => Boolean(v?.seats.find((s) => s.id === seat)?.dead), this.pitFreeze);
    const away = new Set(this.pitShow.inRing);
    // (The condemned's pet keeps out of the way of the show too.)
    if (this.show) away.add(this.show.seatId);
    for (const [key, av] of this.others) av.setPetAway(away.has(key));
    this.me?.setPetAway(Boolean(v?.mySeatId && away.has(v.mySeatId)));
    if (!v || v.mode !== 'player' || !v.mySeatId) return;
    const f = pit?.rings?.find((x) => x?.sides.some((s) => s.seat === v.mySeatId));
    if (!f) return;
    const i = f.sides.findIndex((s) => s.seat === v.mySeatId);
    if (f.stage === 'intro' && this.pitCorner !== f.id && here) {
      this.pitCorner = f.id;
      const c = PIT_CORNERS[f.ring][i];
      this.stopEverything();
      this.place('cellar', c.x, c.z, c.ry, true);
    }
    if (f.stage === 'over' && f.result?.winner === i) {
      earn('pitwin');
      if ((useProgress.getState().tally.pitwins ?? 0) >= 5) earn('pitchamp');
    }
  }

  /** Tests can hold a pet fight's reveal at a moment (`pitFreeze`, in seconds into it), likewise. */
  pitFreeze: number | null = null;

  /** Tests can hold the show at a moment (`showFreeze`, in seconds) to look at it frame by frame. */
  showFreeze: number | null = null;
  /** Seconds into the show itself (below 0 while the town votes and the wheel spins). */
  private showAge(t: number): number {
    if (!this.show || this.show.start === null) return -1;
    return this.showFreeze ?? t - this.show.start;
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
    let sway = 0;
    let scale = 1;
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
      // The empty noose is drawn back up, as the ghost floats slowly up out of the trapdoor like a cartoon soul,
      // swaying as it goes, high over the gallows; then a twinkle and it's gone.
      const puffT = age - SHOW.puff;
      puff = Math.min(1, puffT / 0.9);
      const r = ease(puffT / SHOW.rise);
      feet = bottom + (spot.y + 2.4 + body.top * 0.5 - bottom) * ease(puffT / SOUL.rise);
      swing *= 1 - r;
      sway = Math.sin(puffT * 2.3) * 0.22 * Math.min(1, puffT / 0.8);
      const pop = (puffT - SOUL.rise) / SOUL.pop;
      if (pop > 0) scale = Math.max(0.001, 1 - ease(pop)) * (1 + 0.25 * Math.sin(Math.min(1, pop) * Math.PI));
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
      x: spot.x + Math.cos(spot.ry) * lx + Math.sin(spot.ry) * sway,
      z: spot.z - Math.sin(spot.ry) * lx + Math.cos(spot.ry) * sway,
      y: ly,
      ry: spot.ry,
      anim,
      swing,
      scale,
      hidden,
      rope,
      ring,
      puff,
    };
  }

  /**
   * The gallows (and the wait on the trapdoor while the town votes): from in front of the condemned, a little below
   * their eyes, their face in full view with the noose above. At the drop the camera rises a touch and tips down
   * to follow them through the trapdoor, and then the ghost back up out of it.
   */
  private gallowsShot(t: number): { pos: THREE.Vector3; look: THREE.Vector3 } {
    const g = this.town.gallowsSpot;
    const show = this.show!;
    const av = show.mine ? this.me : this.others.get(show.seatId);
    const body = this.bodyOf(av);
    const age = show.start === null ? -1 : this.showAge(t);
    const pose = show.method === 'hang' && age >= 0 ? this.showPose(age, body) : null;
    const head = g.y + body.top * 0.85;
    // Their head, wherever it is (but no lower than just under the boards).
    const y = pose ? Math.max(g.y - 0.2, pose.y + body.top * 0.85) : head;
    const dropped = pose && !show.survives ? Math.min(1, Math.max(0, (age - SHOW.drop) / 0.3)) : 0;
    // Further back for the tall, and on a screen held upright.
    const dist = Math.min(7, Math.max(4.2, 2.6 + body.top * 1.8)) * (this.camera.aspect < 1 ? 1.3 : 1);
    // Straight on, turned a hair to the side so the rope doesn't cross their face.
    const yaw = g.ry + 0.2;
    const look = new THREE.Vector3(pose?.x ?? g.x, y - 0.1 * (1 - dropped), pose?.z ?? g.z);
    const pos = new THREE.Vector3(look.x + Math.sin(yaw) * dist, head - 0.2 + dropped * 0.9, look.z + Math.cos(yaw) * dist);
    return { pos, look };
  }

  /** Where the stage has the condemned this frame, once its show has begun (null on the gallows, or before). */
  private stagePose(): ExecPose | null {
    const show = this.show;
    return show?.stage && show.pose && show.start !== null && this.showAge(this.clock.elapsedTime) >= 0 ? show.pose : null;
  }

  /** Puts the condemned exactly where (and how) the stage has them: turned any way at all, stretched, or not drawn. */
  private applyStagePose(av: AvatarView, pose: ExecPose) {
    const root = av.rig.root;
    root.position.copy(pose.pos);
    root.quaternion.copy(pose.quat);
    root.scale.copy(pose.scale);
    root.visible = pose.visible && av.shown;
    av.setTagShown(pose.tag);
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
      av.setVisible(here && !this.dawn);
      if (!here) {
        av.placed = false;
        continue;
      }
      const sitting = p.anim === 'sit' || p.anim === 'sleep';
      let anim: Anim = nom && nom.status !== 'done' && nom.votes.includes(key) ? 'hand' : p.anim;
      let dangle: { swing: number; scale: number; hidden: boolean } | null = null;
      const staged = this.show?.seatId === key && local.zone === 'town' ? this.stagePose() : null;
      if (staged) {
        av.setTarget(staged.pos.x, staged.pos.z, av.ry, staged.pos.y);
        av.snap();
        anim = staged.anim;
      } else if (this.show && this.show.seatId === key && local.zone === 'town') {
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
      // A prestige hat's glow would give away who's in the booth, and gets in the way of an execution.
      av.setHatFxShown(!hidden && this.show?.seatId !== key);
      av.setTagShown(!dangle?.hidden && !hidden && !this.tablemates.has(key) && (v.mode === 'st' || key === 'st' || far < TAG_FAR || p.speaking || Boolean(p.shout)));
      av.setVoiceState(Boolean(p.muted), Boolean(p.shout));
      av.update(dt, t, anim, p.speaking, true);
      const jolt = this.visit && !this.visit.mine && this.visit.seatId === key ? this.victimPose : null;
      av.rig.root.rotation.z = (dangle?.swing ?? 0) + (jolt?.shake ?? 0);
      if (jolt) av.rig.root.position.y += jolt.dy;
      av.rig.root.scale.setScalar(dangle?.scale ?? 1);
      if (jolt && this.visit) {
        this.visit.kit.bendVictim(av.rig.root, jolt);
        if (jolt.hidden) av.setTagShown(false);
      }
      if (staged) this.applyStagePose(av, staged);
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
      // (The casino's chairs and stools count too: someone at a table sits up at it, not on the floor under it.)
      const seat = want === 'sit' && (s.job === 'confess' || s.job === 'blackjack' || s.job === 'poker' || s.job === 'roulette' || s.job === 'slots');
      if (s.zone === kind && (s.job === want || seat) && Math.hypot(s.stand.x - x, s.stand.z - z) < 0.6) return s.y ?? 0.45;
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
      // (Not three's raycast, which tests every triangle of the clock tower and made the town stutter: see blocksLine.)
      this.occluderHead.set(local.x, 1.1, local.z);
      for (const m of this.town.occluders) if (blocksLine(m, this.camera.position, this.occluderHead)) this.occluded.add(m);
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
      // In the cellar while a fight is on in the ring we're by (or ours), the camera leans over to keep it in the shot.
      const fight = zoneKind(local.zone) === 'cellar' ? pitFightFor(this.view?.pit, this.view?.mySeatId ?? null, local) : null;
      if (fight) {
        const R = PIT_RINGS[fight.ring];
        tx = local.x * 0.35 + R.x * 0.65;
        tz = local.z * 0.35 + R.z * 0.65;
      }
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
    const shows = execShows.now();
    if (this.dawn && this.dawn.slot >= 0) {
      // The dawn reel: the night visit's shot, from the foot of the bedroom.
      const b = BED;
      wantPos.set(b.x + 1.5, 2.6, b.z + 3.3);
      wantLook.set(b.x - 0.6, 0.9, b.z - 0.6);
    } else if (this.show?.stage && shows && this.showAge(t) >= 0 && zoneKind(local.zone) === 'town') {
      // The other ways: from nearly in front, between the posts, framed to take in the props.
      const shot = shows.execCamera(this.show.stage.framing(), this.camera.aspect, t);
      wantPos.copy(shot.pos);
      wantLook.copy(shot.look);
    } else if (this.show && zoneKind(local.zone) === 'town') {
      const shot = this.gallowsShot(t);
      wantPos.copy(shot.pos);
      wantLook.copy(shot.look);
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
    } else if (this.decorating()) {
      // Decorating: the whole flat from up in front, the panel along the bottom.
      const tall = this.camera.aspect < 0.8;
      wantPos.set(0, tall ? 15.5 : 11.2, tall ? 9.5 : 9.4);
      wantLook.set(0, 0, tall ? -0.6 : -0.2);
    } else if (this.tableCam) {
      this.tableCam.shot(wantPos, wantLook);
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
    const near = this.view?.reading || this.tableCam ? 0.1 : 1.0;
    if (this.camera.near !== near) {
      this.camera.near = near;
      this.camera.updateProjectionMatrix();
    }
    // A wider view from a seat at the card table, so the felt and the people round it fit.
    const fov = this.tableCam ? (this.camera.aspect < 0.8 ? 74 : 58) : this.camera.aspect < 0.8 ? 52 : 40;
    if (this.camera.fov !== fov) {
      this.camera.fov = fov;
      this.camera.updateProjectionMatrix();
    }
    // The table's panel covers the bottom of the screen, so the picture is shifted up to keep the felt in sight.
    const lift = this.tableCam ? (this.camera.aspect < 0.8 ? 0.26 : 0.17) : this.decorating() ? (this.camera.aspect < 0.8 ? 0.14 : 0.12) : 0;
    if (lift !== (this.camera.view?.enabled ? this.camera.view.offsetY / Math.max(1, this.camera.view.fullHeight) : 0)) {
      // (In the canvas's own shape: a view offset sets the camera's aspect to its full width over its full height.)
      const w = this.host.clientWidth || 1;
      const h = this.host.clientHeight || 1;
      if (lift) this.camera.setViewOffset(w, h, 0, lift * h, w, h);
      else {
        this.camera.clearViewOffset();
        this.camera.aspect = w / h;
        this.camera.updateProjectionMatrix();
      }
    }
    // Our own animal steps out of the way of the lens once the camera is close to the seat.
    // (Again if our animal is built afresh while we sit, a new hat say.)
    const hide = Boolean(this.tableCam && this.camPos.distanceTo(wantPos) < 1.6);
    if (this.me && (hide !== this.hidSelf || (hide && this.me.rig.root.visible))) {
      this.hidSelf = hide;
      this.me.rig.root.visible = !hide;
    }
    // Closing in on the book (or pulling back over the meeting) is a slow swoop; everything else follows closely.
    let ease = this.view?.reading || this.pinned() || this.tableCam ? 1 - Math.exp(-dt * 4) : this.show ? 1 - Math.exp(-dt * 6) : 1 - Math.exp(-dt * 9);
    if (!this.me && !this.view?.reading) ease = 1;
    // (A cut, from one death to the next.)
    if (this.dawn?.cut) {
      this.dawn.cut = false;
      ease = 1;
    }
    this.camPos.lerp(wantPos, ease);
    this.camLook.lerp(wantLook, ease);
    this.camera.position.copy(this.camPos);
    this.camera.lookAt(this.camLook);
  }

  private decorating = () => Boolean(useDecor.getState().draft) && zoneKind(local.zone) === 'flat';

  /** How loud each person is to us and we to them, by seat id, as of the last voice sync (for tests and debugging). */
  gains: Record<string, { gain: number; heard: number }> = {};

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
    // (Before a vote, whoever holds the talking stick is heard by the whole meeting, and nobody else.)
    const sp = v.nomination?.speech;
    const ctx = { meeting, meetingRadius: this.town.meetingRadius, announce: presence.announce, speaker: sp && sp.kind !== 'discuss' ? sp.seatId : null };
    const myKey = v.mode === 'st' ? 'st' : v.mySeatId;
    const list: Listener[] = [];
    let hearing = 0;
    this.gains = {};
    for (const [key, p] of presence.others) {
      const gain = earshot(local, p, key === 'st', ctx, key);
      // And the other way round: who can hear us (not the same when one of us shouts, or the Storyteller speaks to everyone).
      const heard = earshot(p, local, v.mode === 'st', ctx, myKey);
      this.gains[key] = { gain, heard };
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
