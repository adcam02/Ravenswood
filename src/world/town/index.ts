import * as THREE from 'three';
import { Builder, matte, rng } from '../build';
import { buildItem, disposeObject } from '../items';
import { BED_SPOTS, wrapAngle, type Collider, type Door, type Spot, type Station, type TownState, type Weather, type ZoneKind } from '../types';
import { glowUniforms, makeBirds, makeGlows, makeMist, makeRain, makeRipples, makeSky, swayUniforms } from './fx';
import { G, shade } from './kit';
import { buildInteriors, turnClockwork, type Room } from './interiors';
import {
  BED,
  BED_H,
  COTTAGE_NAMES,
  DOCK,
  GALLOWS,
  GRAVEYARD,
  LINE_Y,
  LINE_SLOT_X,
  MEETING_R,
  POND,
  ROOMS,
  MEETING_CENTRE,
  STOOL_R,
  TOWN_R,
  DAIS,
  meetingSpot,
  bedSpot,
  counterSpot,
  houseSlots,
  makeDoors,
  makeStations,
  roomColliders,
  shelfSpot,
  townColliders,
  groundAt,
  pondContains,
  SQUARE_R,
} from './layout';
import { PATHS, buildOutdoor } from './outdoor';
import { postFront } from './post';
import { addCloudShadow, beamUniforms, makeClouds, makeContactShadows, makeDust, makePuddles, type Footprint, type PuddleSpot } from './looks';
import { signBoard, TextSign } from './sign';
import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';

/** How the gallows looks at a moment of the hanging. */
export interface GallowsState {
  /** The trapdoor: 0 shut, 1 hanging open. */
  open: number;
  /** The sign over the gallows ('' for none). */
  label: string;
  /** Metres from the beam down to the knot (GALLOWS_ROPE_REST when the noose hangs empty). */
  rope?: number;
  /** 0: the empty loop hangs upright; 1: it lies flat, round a neck. */
  ring?: number;
  /** The rope's swing from the beam, in radians, side to side. */
  swing?: number;
  /** A puff of smoke from the trapdoor, 0 to 1 through it (0 for none). */
  puff?: number;
  /** Seconds since the rope snapped, for someone who survives the hanging (0: it hasn't). */
  snapped?: number;
}
/**
 * The beam's underside above the platform; the rope's length to the knot when the noose hangs empty; and how
 * far to the side of the neck the knot sits (beside the ear, as hangmen tie it), so the rope clears the head.
 */
export const GALLOWS_BEAM = 2.92;
export const GALLOWS_ROPE_REST = 0.97;
export const GALLOWS_KNOT = 0.34;

export interface TownWorld {
  groups: Record<ZoneKind, THREE.Group>;
  colliders: Record<ZoneKind, Collider[]>;
  bounds: Record<ZoneKind, { kind: 'circle'; r: number } | { kind: 'rect'; hw: number; hd: number }>;
  doors: Door[];
  stations: Station[];
  houseSlots: { x: number; z: number; ry: number; door: Spot }[];
  spawn: Spot;
  homeSpawn: Spot;
  meetingSpot(i: number, n: number): Spot;
  meetingRadius: number;
  /** Shows a place. `night` is for bedrooms: the fire out, the lamps off, moon and stars in the window. */
  show(kind: ZoneKind, night?: boolean): void;
  setTime(t: number): void;
  setHouses(list: ({ name: string; dead: boolean } | null)[]): void;
  /** The sign above the bed: "<name>'s home", or any lines you like. */
  setHomeOwner(name: string, lines?: string[]): void;
  setTown(state: TownState, now: number): void;
  setMeeting(m: { n: number; nominee: number | null; nominator?: number | null; hand: number | null; active: boolean; votes: number[]; label?: string }): void;
  /** Gravestones for the dead, by seat name. */
  setGraves(names: string[]): void;
  /** The post office's letterboxes: everyone's name in grimoire order, and whose have letters waiting. */
  setPost(names: string[], mail: boolean[]): void;
  /** Buildings that can be faded when they hide a player. */
  occluders: THREE.Mesh[];
  /** Where the condemned stands, on the trapdoor. */
  gallowsSpot: Spot & { y: number };
  /** The gallows during a hanging: see GallowsState. */
  setGallows(s: GallowsState): void;
  follow(x: number, z: number): void;
  update(dt: number, t: number): void;
  bellRing(): void;
  /** Low graphics: the forest beyond the fence, the night glows, the birds and the mist sheets are left out. */
  setLowDetail(on: boolean): void;
  /** A little puff of dust kicked up at someone's feet (in town). */
  puff(x: number, y: number, z: number): void;
  /** Rain, mist or clear skies, fading in over a couple of seconds. */
  setWeather(w: Weather): void;
  /** How far through the day it is, 0 (morning) to 1 (evening). The sun moves with it, and from about 0.75 the light turns golden. */
  setDayProgress(p: number): void;
  /** A ring spreading on the pond at x, z (ignored off the water). `size` is roughly its final radius in metres. */
  ripple(x: number, z: number, size?: number): void;
  /**
   * True, once, when the sun's shadow map needs redrawing (the town's shadows are drawn once and kept). The
   * engine sets `renderer.shadowMap.autoUpdate = false` and `renderer.shadowMap.needsUpdate = true` on this.
   */
  consumeShadowDirty(): boolean;
}

// ---------------------------------------------------------------- the day and the night

const DAY = {
  sky: new THREE.Color('#9fd3ef'),
  fog: new THREE.Color('#c3e4f4'),
  hemiSky: new THREE.Color('#cfe8ff'),
  // Bright enough that faces turned away from the sun (gable ends, ridge caps) never go black.
  hemiGround: new THREE.Color('#a2c486'),
  hemi: 1.35,
  sun: new THREE.Color('#fff1d2'),
  sunPower: 2.4,
  sunDir: new THREE.Vector3(0.55, 1, 0.35),
};
const NIGHT = {
  sky: new THREE.Color('#0b1030'),
  fog: new THREE.Color('#141a3c'),
  hemiSky: new THREE.Color('#5668a8'),
  hemiGround: new THREE.Color('#1c2238'),
  hemi: 0.95,
  sun: new THREE.Color('#aebeff'),
  sunPower: 1.15,
  // The moon sits high, so the tower's shadow doesn't swallow the square.
  sunDir: new THREE.Vector3(-0.3, 1, -0.22),
};

const smooth = (x: number) => x * x * (3 - 2 * x);
const step = (a: number, b: number, x: number) => smooth(THREE.MathUtils.clamp((x - a) / (b - a), 0, 1));

/** The outdoor light at one moment: sky (top and horizon), fog, the sky light and the sun. */
interface Pal {
  top: THREE.Color;
  horizon: THREE.Color;
  fog: THREE.Color;
  hemiSky: THREE.Color;
  hemiGround: THREE.Color;
  hemi: number;
  sun: THREE.Color;
  sunPower: number;
}
const pal = (top: string, horizon: string, fog: string, hemiSky: string, hemiGround: string, hemi: number, sun: string, sunPower: number): Pal => ({
  top: new THREE.Color(top),
  horizon: new THREE.Color(horizon),
  fog: new THREE.Color(fog),
  hemiSky: new THREE.Color(hemiSky),
  hemiGround: new THREE.Color(hemiGround),
  hemi,
  sun: new THREE.Color(sun),
  sunPower,
});
// Through the day (golden late on), then sunset, dusk and night as night falls.
const P_DAY = pal('#86c3ec', '#c6e5f4', '#c3e4f4', '#cfe8ff', '#a2c486', 1.35, '#fff1d2', 2.4);
const P_GOLDEN = pal('#8aaed8', '#f4c597', '#eecba6', '#f2dcc0', '#b2b27c', 1.22, '#ffc078', 2.15);
const P_SUNSET = pal('#5d69a8', '#f19364', '#df9f7c', '#e9b49a', '#82785c', 1.02, '#ff9450', 1.45);
const P_DUSK = pal('#252c66', '#a4628a', '#55497a', '#7a6aa8', '#2e2c48', 0.95, '#a898d8', 0.95);
const P_NIGHT = pal('#060a24', '#1b2350', '#141a3c', '#5668a8', '#1c2238', 0.95, '#aebeff', 1.15);
// Weather greys, by day and by night.
const RAIN_DAY = { top: new THREE.Color('#8f99a6'), horizon: new THREE.Color('#b3bbc3'), ground: new THREE.Color('#8a9a80') };
const RAIN_NIGHT = { top: new THREE.Color('#0a0e1c'), horizon: new THREE.Color('#1a2030'), ground: new THREE.Color('#1a2030') };
const MIST_DAY = { top: new THREE.Color('#c4d0d8'), fog: new THREE.Color('#dde3e6') };
const MIST_NIGHT = { top: new THREE.Color('#121830'), fog: new THREE.Color('#2a3046') };

function copyPal(out: Pal, a: Pal) {
  out.top.copy(a.top);
  out.horizon.copy(a.horizon);
  out.fog.copy(a.fog);
  out.hemiSky.copy(a.hemiSky);
  out.hemiGround.copy(a.hemiGround);
  out.hemi = a.hemi;
  out.sun.copy(a.sun);
  out.sunPower = a.sunPower;
}
function mixPal(out: Pal, a: Pal, b: Pal, k: number) {
  out.top.copy(a.top).lerp(b.top, k);
  out.horizon.copy(a.horizon).lerp(b.horizon, k);
  out.fog.copy(a.fog).lerp(b.fog, k);
  out.hemiSky.copy(a.hemiSky).lerp(b.hemiSky, k);
  out.hemiGround.copy(a.hemiGround).lerp(b.hemiGround, k);
  out.hemi = THREE.MathUtils.lerp(a.hemi, b.hemi, k);
  out.sun.copy(a.sun).lerp(b.sun, k);
  out.sunPower = THREE.MathUtils.lerp(a.sunPower, b.sunPower, k);
}

/** Where the sun is: east in the morning, high at midday, low in the west by evening; sinking, then the moon, as night falls. */
function sunDirAt(p: number, night: number, out: THREE.Vector3): THREE.Vector3 {
  const az = THREE.MathUtils.lerp(2.2, -1.6, p);
  let el = 0.25 + 0.8 * Math.sin(Math.PI * THREE.MathUtils.clamp(0.1 + 0.85 * p, 0, 1));
  el *= 1 - 0.78 * step(0, 0.5, night);
  out.set(Math.sin(az) * Math.cos(el), Math.sin(el), Math.cos(az) * Math.cos(el));
  const moon = step(0.5, 0.85, night);
  if (moon > 0) out.lerp(NIGHT.sunDir.clone().normalize(), moon).normalize();
  return out;
}

/** Four point lights that serve as the square's lamps outside and the lamps and fires inside. */
const POINT_LIGHTS = 4;
/** The sun's shadow map: big, since it covers the whole town, but drawn only when something changes. */
const SHADOW_MAP = 4096;
/** Half the width of the square of ground the sun's shadows cover, centred on the town. */
const SHADOW_HALF = 46;

// ---------------------------------------------------------------- small things that come and go

function clothGeometry(kind: string, color: string): THREE.BufferGeometry {
  const b = new Builder();
  const c = new THREE.Color(color);
  const dark = shade(c, -0.1);
  const peg = '#d8b48a';
  switch (kind) {
    case 'shirt':
      b.add(G.box(), c, { pos: [0, -0.36, 0], scale: [0.5, 0.6, 0.05] });
      b.add(G.box(), dark, { pos: [-0.33, -0.16, 0], rot: [0, 0, 0.5], scale: [0.22, 0.2, 0.05] });
      b.add(G.box(), dark, { pos: [0.33, -0.16, 0], rot: [0, 0, -0.5], scale: [0.22, 0.2, 0.05] });
      break;
    case 'dress':
      b.add(G.box(), c, { pos: [0, -0.2, 0], scale: [0.34, 0.3, 0.05] });
      b.add(G.taper(0.5, 4), c, { pos: [0, -0.6, 0], rot: [Math.PI, Math.PI / 4, 0], scale: [0.4, 0.55, 0.06] });
      break;
    case 'towel':
      b.add(G.box(), c, { pos: [0, -0.3, 0], scale: [0.7, 0.5, 0.05] });
      b.add(G.box(), dark, { pos: [0, -0.12, 0.03], scale: [0.7, 0.06, 0.02] });
      b.add(G.box(), dark, { pos: [0, -0.48, 0.03], scale: [0.7, 0.06, 0.02] });
      break;
    case 'pants':
      b.add(G.box(), c, { pos: [0, -0.16, 0], scale: [0.44, 0.24, 0.05] });
      b.add(G.box(), c, { pos: [-0.12, -0.5, 0], scale: [0.18, 0.46, 0.05] });
      b.add(G.box(), c, { pos: [0.12, -0.5, 0], scale: [0.18, 0.46, 0.05] });
      break;
    default:
      // A sock.
      b.add(G.box(), c, { pos: [0, -0.26, 0], scale: [0.2, 0.44, 0.05] });
      b.add(G.box(), c, { pos: [0.1, -0.5, 0], scale: [0.36, 0.16, 0.05] });
      b.add(G.box(), dark, { pos: [0, -0.06, 0], scale: [0.22, 0.08, 0.06] });
  }
  // Two pegs over the line.
  for (const x of [-0.14, 0.14]) b.add(G.box(), peg, { pos: [x, 0.02, 0], scale: [0.05, 0.14, 0.09] });
  return b.geometry();
}

function flowerGeometry(kind: string, color: string, seed: number): THREE.BufferGeometry {
  const b = new Builder();
  const r = rng(seed);
  const stem = '#4f8f3f';
  const leaf = '#5fa34a';
  const h = kind === 'sunflower' ? 0.95 : kind === 'rose' ? 0.6 : 0.5;
  b.add(G.cyl(10), stem, { pos: [0, h / 2, 0], scale: [0.025, h, 0.025] });
  b.add(G.ico(0), leaf, { pos: [0.08, h * 0.4, 0], rot: [0, r() * 3, 0.6], scale: [0.09, 0.03, 0.05] });
  b.add(G.ico(0), leaf, { pos: [-0.07, h * 0.6, 0.02], rot: [0, r() * 3, -0.6], scale: [0.08, 0.03, 0.05] });
  const c = new THREE.Color(color);
  if (kind === 'tulip') {
    b.add(G.taper(0.75, 6), c, { pos: [0, h + 0.08, 0], scale: [0.09, 0.17, 0.09] });
    b.add(G.taper(0.7, 6), shade(c, -0.08), { pos: [0, h + 0.1, 0], rot: [0, 0.5, 0], scale: [0.08, 0.16, 0.08] });
  } else if (kind === 'daisy') {
    for (let k = 0; k < 8; k++) {
      const a = (k / 8) * Math.PI * 2;
      b.add(G.ico(0), c, { pos: [Math.cos(a) * 0.09, h, Math.sin(a) * 0.09], rot: [0, -a, 0], scale: [0.07, 0.015, 0.035] });
    }
    b.add(G.cyl(16), '#f2c14e', { pos: [0, h + 0.01, 0], scale: [0.045, 0.03, 0.045] });
  } else if (kind === 'sunflower') {
    for (let k = 0; k < 12; k++) {
      const a = (k / 12) * Math.PI * 2;
      b.add(G.ico(0), c, { pos: [Math.cos(a) * 0.15, h, Math.sin(a) * 0.15], rot: [0, -a, 0], scale: [0.1, 0.015, 0.05] });
    }
    b.add(G.cyl(18), '#5a3a1a', { pos: [0, h + 0.01, 0], scale: [0.1, 0.04, 0.1] });
  } else {
    b.add(G.ico(1), c, { pos: [0, h + 0.05, 0], scale: [0.09, 0.08, 0.09] });
    b.add(G.ico(0), shade(c, -0.12), { pos: [0, h + 0.1, 0], rot: [0.3, 0.5, 0], scale: [0.05, 0.04, 0.05] });
  }
  const geo = b.geometry();
  geo.scale(1.8, 1.8, 1.8);
  return geo;
}

interface Tracked {
  id: string;
  obj: THREE.Object3D;
  at?: number;
}

/** Keeps a group of small meshes in step with a list of records, by id. */
class Keeper<T extends { id: string }> {
  private have = new Map<string, Tracked>();
  constructor(
    private parent: THREE.Object3D,
    private make: (rec: T) => THREE.Object3D,
  ) {}
  sync(list: T[]) {
    const want = new Set(list.map((l) => l.id));
    for (const [id, t] of this.have) {
      if (want.has(id)) continue;
      this.parent.remove(t.obj);
      disposeObject(t.obj);
      this.have.delete(id);
    }
    for (const rec of list) {
      if (this.have.has(rec.id)) continue;
      const obj = this.make(rec);
      this.parent.add(obj);
      this.have.set(rec.id, { id: rec.id, obj, at: (rec as { at?: number }).at });
    }
  }
  each(fn: (t: Tracked) => void) {
    for (const t of this.have.values()) fn(t);
  }
}

// ---------------------------------------------------------------- assembly

/** Where puddles gather in the rain: along the paths and on the square, clear of the dais, the tower and the pond. */
function puddleSpots(): PuddleSpot[] {
  const r = rng(131);
  const out: PuddleSpot[] = [];
  const clear = (x: number, z: number, rad: number) =>
    Math.hypot(x, z) < TOWN_R - 3 &&
    Math.hypot(x, z) > 3.4 + rad &&
    Math.hypot(x - MEETING_CENTRE.x, z - MEETING_CENTRE.z) > DAIS.r1 + rad + 0.3 &&
    !pondContains(x, z, -1.5) &&
    out.every((p) => Math.hypot(p.x - x, p.z - z) > (p.r + rad * 2) / 2 + 0.3);
  for (let tries = 0; out.length < 34 && tries < 800; tries++) {
    let x: number;
    let z: number;
    if (r() < 0.3) {
      const a = r() * Math.PI * 2;
      const d = 3.5 + r() * (SQUARE_R - 4.5);
      x = d * Math.sin(a);
      z = -d * Math.cos(a);
    } else {
      const { seg, w } = PATHS[Math.floor(r() * PATHS.length)];
      const [x0, z0, x1, z1] = seg;
      const t = r();
      const len = Math.hypot(x1 - x0, z1 - z0) || 1;
      const side = (r() - 0.5) * w * 0.6;
      x = x0 + (x1 - x0) * t - ((z1 - z0) / len) * side;
      z = z0 + (z1 - z0) * t + ((x1 - x0) / len) * side;
    }
    const rad = 0.5 + r() * 0.8;
    if (!clear(x, z, rad)) continue;
    out.push({ x, y: groundAt(x, z) + 0.04, z, r: rad * 2 });
  }
  return out;
}

export function createTown(scene: THREE.Scene, renderer: THREE.WebGLRenderer): TownWorld {
  void renderer;
  // Window glass outside: sky-tinted by day, glowing warm at night.
  const windowMat = new THREE.MeshLambertMaterial({ vertexColors: true, emissive: '#ffc46b', emissiveIntensity: 0 });
  const outdoor = buildOutdoor(windowMat);
  const interiors = buildInteriors();
  scene.add(outdoor.group);
  for (const room of Object.values(interiors.rooms)) scene.add(room.group);

  // Lights: one sky, one sun or moon, and a few lamps that move with the scene.
  const hemi = new THREE.HemisphereLight(DAY.hemiSky, DAY.hemiGround, DAY.hemi);
  const sun = new THREE.DirectionalLight(DAY.sun, DAY.sunPower);
  sun.castShadow = true;
  // The shadow camera covers the whole town (or the whole room) and stays put, so the shadow map only needs
  // drawing again when the sun moves or something that casts a shadow changes.
  sun.shadow.mapSize.set(SHADOW_MAP, SHADOW_MAP);
  sun.shadow.bias = -0.0006;
  sun.shadow.normalBias = 0.045;
  scene.add(hemi, sun, sun.target);
  let shadowDirty = true;
  const shadowDir = new THREE.Vector3();
  let shadowZone = '';
  const shadowBox = (half: number, dist: number) => {
    const c = sun.shadow.camera;
    if (c.right === half && c.far === dist * 2) return;
    c.left = c.bottom = -half;
    c.right = c.top = half;
    c.near = 1;
    c.far = dist * 2;
    c.updateProjectionMatrix();
    shadowDirty = true;
  };
  /** Notes where the sun now is; a noticeable move means the shadows need drawing again. */
  const noteSun = () => {
    const d = sun.position.clone().sub(sun.target.position).normalize();
    const key = `${zone}:${homeNight}`;
    if (key !== shadowZone || shadowDir.angleTo(d) > 0.004) {
      shadowDir.copy(d);
      shadowZone = key;
      shadowDirty = true;
    }
  };
  const lamps = Array.from({ length: POINT_LIGHTS }, () => {
    const l = new THREE.PointLight('#ffb561', 0, 11, 1.6);
    scene.add(l);
    return l;
  });
  const lampSpecs: { base: number; flicker: boolean }[] = lamps.map(() => ({ base: 0, flicker: false }));

  // Sky: stars, a moon and a sun, all beyond the fog.
  const sky = new THREE.Group();
  const starGeo = new THREE.BufferGeometry();
  {
    const r = rng(77);
    const pos: number[] = [];
    for (let i = 0; i < 700; i++) {
      const a = r() * Math.PI * 2;
      const el = Math.asin(r() * 0.95 + 0.05);
      const d = 230;
      pos.push(Math.cos(el) * Math.sin(a) * d, Math.sin(el) * d, Math.cos(el) * Math.cos(a) * d);
    }
    starGeo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  }
  const starMat = new THREE.PointsMaterial({ color: '#ffffff', size: 2.2, sizeAttenuation: false, transparent: true, opacity: 0, fog: false, depthWrite: false });
  const stars = new THREE.Points(starGeo, starMat);
  const moonMat = new THREE.MeshBasicMaterial({ color: '#f6f1d6', transparent: true, opacity: 0, fog: false });
  const moon = new THREE.Mesh(new THREE.SphereGeometry(7, 12, 8), moonMat);
  moon.position.set(-100, 85, -140);
  const sunMat = new THREE.MeshBasicMaterial({ color: '#fff6dc', transparent: true, opacity: 1, fog: false });
  const sunDisc = new THREE.Mesh(new THREE.SphereGeometry(8, 12, 8), sunMat);
  sunDisc.position.set(110, 120, 70);
  sky.add(stars, moon, sunDisc);
  scene.add(sky);
  // The sky itself: a gradient dome with a glow round the sun.
  const dome = makeSky();
  scene.add(dome.mesh);

  // Weather, night glows, birds and rings on the pond.
  const rain = makeRain();
  const mist = makeMist();
  const glows = makeGlows(outdoor.glowSpots);
  const birds = makeBirds(outdoor.perches, 9);
  const ripples = makeRipples();
  outdoor.group.add(rain.group, mist.group, glows.mesh, birds.group, ripples.mesh);
  // The cobbles shine a little when wet; the paths and grass darken.
  const cobbles = outdoor.group.getObjectByName('cobbles') as THREE.Mesh | undefined;
  const cobbleMat = new THREE.MeshPhongMaterial({ vertexColors: true, specular: '#000000', shininess: 46 });
  const dampen = ['paths', 'ground']
    .map((n) => outdoor.group.getObjectByName(n) as THREE.Mesh | undefined)
    .map((m) => m?.material as THREE.MeshLambertMaterial | undefined)
    .filter((m): m is THREE.MeshLambertMaterial => Boolean(m));

  // Soft shadows where things meet the ground, in town and in every room.
  const townFootprints = townColliders(outdoor.colliders);
  const footprint = (c: Collider, y: number, inside: boolean): Footprint | null => {
    // Nothing stands in the pond: its colliders (and the dock's side rails) are invisible walls.
    if (!inside && pondContains(c.x, c.z)) return null;
    if (c.kind === 'circle') {
      const big = c.r > 1.5;
      return { x: c.x, z: c.z, y, hw: c.r, hd: c.r, rot: 0, round: true, soft: big ? 1.0 : Math.max(0.35, c.r * 1.6), strength: big ? 0.3 : 0.26 };
    }
    if (!inside && Math.hypot(c.x - GRAVEYARD.x, c.z - GRAVEYARD.z) < 0.5) return null;
    const big = Math.min(c.hw, c.hd) > 1.5;
    return { x: c.x, z: c.z, y, hw: c.hw, hd: c.hd, rot: c.rot, round: false, soft: big ? 1.1 : 0.5, strength: big ? 0.32 : 0.26 };
  };
  outdoor.group.add(
    makeContactShadows(townFootprints.map((c) => footprint(c, groundAt(c.x, c.z), false)).filter((f): f is Footprint => Boolean(f))),
  );
  for (const room of Object.keys(interiors.rooms) as Room[]) {
    const { hw, hd } = ROOMS[room];
    const list = roomColliders(room).map((c) => footprint(c, 0, true)).filter((f): f is Footprint => Boolean(f));
    // Where the walls meet the floor.
    list.push({ x: 0, z: -hd, y: 0, hw, hd: 0.01, rot: 0, round: false, soft: 0.8, strength: 0.22 });
    for (const sx of [-1, 1]) list.push({ x: sx * hw, z: 0, y: 0, hw: 0.01, hd, rot: 0, round: false, soft: 0.8, strength: 0.22 });
    interiors.rooms[room].group.add(makeContactShadows(list, 0.05));
  }

  // Clouds drifting over, their shadows sliding across the ground and the buildings.
  const clouds = makeClouds();
  outdoor.group.add(clouds.group);
  if (cobbles) cobbles.material = cobbleMat;
  outdoor.group.traverse((o) => {
    const m = o as THREE.Mesh;
    if (!m.isMesh || !['ground', 'paths', 'cobbles', 'chunk', 'building', 'foliage', 'dais'].includes(m.name)) return;
    for (const mat of Array.isArray(m.material) ? m.material : [m.material]) addCloudShadow(mat);
  });

  // Puddles along the paths and on the square, for rainy days.
  const puddles = makePuddles(puddleSpots());
  // Dust kicked up on the paths.
  const dust = makeDust();
  outdoor.group.add(puddles.mesh, dust.points);
  let wetK = 0;
  let lowDetail = false;

  // Fireflies by the pond, only at night.
  const flyGeo = new THREE.BufferGeometry();
  const FLIES = 40;
  const flyBase = new Float32Array(FLIES * 3);
  {
    const r = rng(5);
    for (let i = 0; i < FLIES; i++) {
      const a = r() * Math.PI * 2;
      const d = 0.4 + r() * 0.9;
      flyBase.set([POND.x + Math.cos(a) * POND.rx * d, 0.4 + r() * 1.6, POND.z + Math.sin(a) * POND.rz * d], i * 3);
    }
  }
  flyGeo.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(flyBase), 3));
  const flyMat = new THREE.PointsMaterial({ color: '#d8ff7a', size: 5, sizeAttenuation: false, transparent: true, opacity: 0, depthWrite: false });
  const flies = new THREE.Points(flyGeo, flyMat);
  outdoor.group.add(flies);

  // Chimney smoke: a shared pool of puffs rising from whichever chimneys are nearest the camera.
  const PUFFS = 48;
  const puffMat = new THREE.MeshLambertMaterial({ color: '#e8e4de', transparent: true, opacity: 0.55, depthWrite: false });
  const puffs = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(0.28, 3), puffMat, PUFFS);
  puffs.castShadow = false;
  puffs.frustumCulled = false;
  const puffState = Array.from({ length: PUFFS }, (_, i) => ({ chimney: i % Math.max(1, outdoor.chimneys.length), age: (i * 0.37) % 4, dx: 0, dz: 0 }));
  outdoor.group.add(puffs);
  const mat4 = new THREE.Matrix4();
  const pv = new THREE.Vector3();
  const pq = new THREE.Quaternion();
  const ps = new THREE.Vector3();

  // Things players leave around town.
  const drinks = new Keeper<TownState['drinks'][number]>(interiors.rooms.tavern.group, (d) => {
    const o = buildItem({ k: d.kind });
    const s = counterSpot(d.spot);
    o.position.set(s.x, s.y, s.z);
    o.rotation.y = (d.spot % 3) * 0.4;
    return o;
  });
  const loaves = new Keeper<TownState['loaves'][number]>(interiors.rooms.bakery.group, (l) => {
    const o = buildItem({ k: l.kind });
    const s = shelfSpot(l.slot);
    o.position.set(s.x, s.y, s.z);
    o.rotation.y = 0.2 + (l.slot % 2) * 0.5;
    return o;
  });
  const clothMat = matte();
  const clothes = new Keeper<TownState['clothes'][number]>(outdoor.group, (c) => {
    const m = new THREE.Mesh(clothGeometry(c.kind, c.color), clothMat);
    m.castShadow = true;
    const s = LINE_SLOT_X(c.line, c.slot);
    m.position.set(s.x, LINE_Y, s.z);
    return m;
  });
  const flowerMat = matte();
  const flowers = new Keeper<TownState['flowers'][number]>(outdoor.group, (f) => {
    const m = new THREE.Mesh(flowerGeometry(f.kind, f.color, f.spot * 31 + f.bed * 7), flowerMat);
    m.castShadow = true;
    const s = bedSpot(f.bed, Math.min(BED_SPOTS - 1, f.spot));
    m.position.set(s.x, BED_H, s.z);
    m.rotation.y = s.ry + f.spot;
    m.scale.setScalar(0.45);
    return m;
  });

  // A stone for each of the dead, in the churchyard, with their name on it.
  const stoneGeo = (() => {
    const b = new Builder();
    b.add(G.box(), '#a8a196', { pos: [0, 0.4, 0], scale: [0.6, 0.8, 0.14] });
    b.add(G.cyl(20), '#a8a196', { pos: [0, 0.8, 0], rot: [Math.PI / 2, 0, 0], scale: [0.3, 0.14, 0.3] });
    b.add(G.box(), '#7aa85a', { pos: [0, 0.03, 0.75], scale: [0.7, 0.06, 1.3] });
    return b.geometry();
  })();
  const stoneMat = matte();
  const graves = new Keeper<{ id: string; name: string; i: number }>(outdoor.group, (g) => {
    const group = new THREE.Group();
    const stone = new THREE.Mesh(stoneGeo, stoneMat);
    stone.castShadow = true;
    // Every stone shares these, so taking one away mustn't free them.
    stone.userData.shared = true;
    group.add(stone);
    const label = new TextSign({ w: 256, h: 128, bg: '#a8a196', fg: '#3a3630', size: 54 }, g.name);
    const { mesh } = signBoard(label, 0.5, 0.25);
    group.userData.onDispose = () => label.dispose();
    mesh.position.set(0, 0.5, 0.075);
    group.add(mesh);
    // Down the middle of the churchyard, oldest nearest the church.
    const col = Math.floor(g.i / 8);
    group.position.set(GRAVEYARD.x + col * 1.3 - 0.65 * Math.min(col, 1), 0, GRAVEYARD.z - 4.4 + (g.i % 8) * 1.25);
    return group;
  });

  // The gallows: a platform with a trapdoor, two posts and a beam, and a noose for effect.
  const gallows = new THREE.Group();
  gallows.position.set(GALLOWS.x, 0, GALLOWS.z);
  gallows.rotation.y = GALLOWS.ry;
  const PLAT_H = 0.9;
  {
    const b = new Builder();
    const wood = '#5a3d2a';
    const plank = '#7a5236';
    // The platform, with a square hole in the middle, as four slabs.
    // The hole matches the trapdoor (1.2 by 1.1), so the door never overlaps the boards.
    b.add(G.box(), plank, { pos: [0, PLAT_H - 0.06, -0.925], scale: [2.6, 0.12, 0.75] });
    b.add(G.box(), plank, { pos: [0, PLAT_H - 0.06, 0.925], scale: [2.6, 0.12, 0.75] });
    b.add(G.box(), plank, { pos: [-0.95, PLAT_H - 0.06, 0], scale: [0.7, 0.12, 1.1] });
    b.add(G.box(), plank, { pos: [0.95, PLAT_H - 0.06, 0], scale: [0.7, 0.12, 1.1] });
    // Dark underneath, so the drop looks deep.
    b.add(G.box(), '#120d10', { pos: [0, PLAT_H / 2 - 0.1, 0], scale: [2.5, PLAT_H - 0.2, 2.5] });
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) b.add(G.box(), wood, { pos: [sx * 1.2, PLAT_H / 2, sz * 1.2], scale: [0.16, PLAT_H, 0.16] });
    // Steps at the back.
    for (let i = 0; i < 3; i++) b.add(G.box(), plank, { pos: [0, 0.15 + i * 0.3, -1.5 - (2 - i) * 0.32], scale: [1.0, 0.1, 0.34] });
    // Posts and a beam, and a rope with a loop.
    for (const sx of [-1, 1]) b.add(G.box(), wood, { pos: [sx * 1.1, PLAT_H + 1.5, 0], scale: [0.16, 3.0, 0.16] });
    b.add(G.box(), wood, { pos: [0, PLAT_H + 3.0, 0], scale: [2.5, 0.16, 0.16] });
    // A wrap of rope round the beam where the noose hangs from.
    b.add(G.cyl(10), '#c8b890', { pos: [0, PLAT_H + 3.0, 0], rot: [0, 0, Math.PI / 2], scale: [0.11, 0.14, 0.11] });
    gallows.add(b.mesh(matte()));
  }
  const trap = new THREE.Group();
  trap.position.set(-0.6, PLAT_H, 0);
  {
    const b = new Builder();
    b.add(G.box(), '#8a5a3a', { pos: [0.6, -0.05, 0], scale: [1.18, 0.1, 1.08] });
    b.add(G.box(), '#3b3a44', { pos: [0.08, 0.01, 0], scale: [0.1, 0.03, 1.08] });
    trap.add(b.mesh(matte()));
  }
  gallows.add(trap);
  // The rope and its noose hang from the beam and swing from there; the loop lies flat round a neck.
  const ropeMat = new THREE.MeshLambertMaterial({ color: '#d8c8a0' });
  // The rope hangs from the beam beside the trapdoor's middle, so it falls beside the head, not through it.
  const ropeRig = new THREE.Group();
  ropeRig.position.set(-GALLOWS_KNOT, PLAT_H + GALLOWS_BEAM, 0);
  const rope = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 1, 10), ropeMat);
  const NOOSE_R = 0.15;
  const noose = new THREE.Mesh(new THREE.TorusGeometry(NOOSE_R, 0.024, 8, 24), ropeMat);
  const knot = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.16, 10), ropeMat);
  const tie = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 1, 8), ropeMat);
  tie.rotation.z = Math.PI / 2;
  ropeRig.add(rope, noose, knot, tie);
  gallows.add(ropeRig);
  // `ring` 0: the empty loop hangs upright under the knot. 1: it lies flat round a neck GALLOWS_KNOT to the side.
  // Once it has snapped, a frayed stub is left on the beam and the noose drops to the boards round their feet.
  let nooseY = -GALLOWS_ROPE_REST;
  const placeRope = (len: number, ring: number, swing: number, snapped = 0) => {
    if (snapped > 0) {
      const stub = 0.42;
      ropeRig.rotation.z = 0;
      rope.scale.y = stub;
      rope.position.y = -stub / 2;
      knot.position.set(0, -stub, 0);
      const floor = -GALLOWS_BEAM + 0.03;
      noose.position.set(GALLOWS_KNOT, Math.max(floor, nooseY - 4.9 * snapped * snapped), 0);
      noose.rotation.set(Math.PI / 2, 0, 0);
      tie.visible = false;
      return;
    }
    nooseY = -len;
    ropeRig.rotation.z = swing;
    rope.scale.y = Math.max(0.001, len);
    rope.position.y = -len / 2;
    knot.position.set(0, -len, 0);
    noose.position.set(GALLOWS_KNOT * ring, -len - NOOSE_R * (1 - ring), 0);
    noose.rotation.set((Math.PI / 2) * ring, (Math.PI / 2) * (1 - ring), 0);
    const reach = Math.max(0.001, (GALLOWS_KNOT - NOOSE_R) * ring);
    tie.scale.y = reach;
    tie.position.set(reach / 2, -len, 0);
    tie.visible = ring > 0.02;
  };
  placeRope(GALLOWS_ROPE_REST, 0, 0);
  // A puff of smoke from the trapdoor when it's over.
  // Soft faceted clouds, lit but glowing a little so they read as white smoke, not grey balls.
  const puffMatG = new THREE.MeshLambertMaterial({ color: '#f6f2fa', emissive: '#9a94a6', flatShading: true, transparent: true, opacity: 0, depthWrite: false });
  const gallowsPuff = new THREE.Group();
  gallowsPuff.position.set(0, PLAT_H + 0.05, 0);
  const puffDirs: THREE.Vector3[] = [];
  const PUFF_N = 16;
  for (let i = 0; i < PUFF_N; i++) {
    const a = (i / PUFF_N) * Math.PI * 2 + (i % 3) * 0.4;
    const out = i < 6 ? 0.25 : 0.6 + (i % 3) * 0.18;
    puffDirs.push(new THREE.Vector3(Math.cos(a) * out, 0.25 + (i % 5) * 0.22, Math.sin(a) * out * 0.8));
    const m = new THREE.Mesh(new THREE.IcosahedronGeometry(0.16 + (i % 4) * 0.05, 1), puffMatG);
    m.rotation.set(i * 0.7, i * 1.3, 0);
    gallowsPuff.add(m);
  }
  gallowsPuff.visible = false;
  gallows.add(gallowsPuff);
  const gallowsLabelEl = document.createElement('div');
  gallowsLabelEl.className = 'meeting-sign cosy-panel gallows-sign';
  const gallowsLabel = new CSS2DObject(gallowsLabelEl);
  gallowsLabel.position.set(0, PLAT_H + 3.6, 0);
  gallowsLabel.visible = false;
  gallows.add(gallowsLabel);
  outdoor.group.add(gallows);

  // The post office's front: a letterbox for each player.
  const postBoxes = postFront();
  postBoxes.set([], []);
  outdoor.group.add(postBoxes.object);
  document.fonts?.ready.then(() => postBoxes.redraw()).catch(() => {});

  // Meeting stools around the tower, the hand on the cobbles, and a mark by each raised hand.
  const stoolGeo = (() => {
    const b = new Builder();
    // A round log stool: bark round the side, a pale cut top with a ring or two.
    b.add(G.cyl(24), '#7a5236', { pos: [0, 0.2, 0], scale: [0.4, 0.4, 0.4] });
    b.add(G.cyl(24), '#c49a6c', { pos: [0, 0.41, 0], scale: [0.4, 0.03, 0.4] });
    b.add(G.torus(0.18, 8, 24), '#a3794f', { pos: [0, 0.425, 0], rot: [Math.PI / 2, 0, 0], scale: [0.24, 0.24, 0.24] });
    return b.geometry();
  })();
  const stoolMat = matte();
  const nomineeMat = new THREE.MeshLambertMaterial({ vertexColors: true, emissive: '#d8303a', emissiveIntensity: 0.55 });
  const stools: THREE.Mesh[] = [];
  const voteMarks: THREE.Mesh[] = [];
  const markGeo = new THREE.TorusGeometry(0.62, 0.05, 10, 40);
  const markMat = new THREE.MeshBasicMaterial({ color: '#f2c14e' });
  const meeting = new THREE.Group();
  meeting.name = 'meeting';
  meeting.visible = false;
  const handRing = new THREE.Mesh(new THREE.TorusGeometry(0.7, 0.06, 10, 40), new THREE.MeshBasicMaterial({ color: '#ffffff' }));
  handRing.rotation.x = Math.PI / 2;
  handRing.position.y = 0.11;
  handRing.visible = false;
  meeting.add(handRing);
  let handTarget = 0;
  const signEl = document.createElement('div');
  signEl.className = 'meeting-sign cosy-panel';
  const sign = new CSS2DObject(signEl);
  sign.position.set(MEETING_CENTRE.x, 3.4, MEETING_CENTRE.z);
  sign.visible = false;
  meeting.add(sign);
  {
    // The meeting dais: a round platform of cut stone with two steps all the way round, built block by block
    // (the steps' treads paved, their faces coursed like brickwork, with recessed mortar joints), a coping round
    // the top, a ring of red stones where the stools go, and a bronze compass at the centre. Always there.
    const b = new Builder();
    const at = { x: MEETING_CENTRE.x, z: MEETING_CENTRE.z };
    let seed = 11;
    const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    const P = (a: number, r: number, y: number) => [at.x + r * Math.sin(a), y, at.z - r * Math.cos(a)];
    const tris = (pts: number[][], color: THREE.ColorRepresentation) => {
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute(pts.flat(), 3));
      b.add(g, color);
    };
    // One cut stone: the part of a ring between two angles and two radii, from y0 up to y1.
    const stone = (r0: number, r1: number, a0: number, a1: number, y0: number, y1: number, color: THREE.ColorRepresentation) => {
      const A0 = P(a0, r0, y0), A1 = P(a0, r0, y1), B0 = P(a0, r1, y0), B1 = P(a0, r1, y1);
      const D0 = P(a1, r0, y0), D1 = P(a1, r0, y1), C0 = P(a1, r1, y0), C1 = P(a1, r1, y1);
      tris([A1, C1, B1, A1, D1, C1, B0, B1, C1, B0, C1, C0, A0, D1, A1, A0, D0, D1, A0, A1, B1, A0, B1, B0, D0, C1, D1, D0, C0, C1], color);
    };
    // A ring of stones, `size` long each, with mortar joints between them.
    const course = (r0: number, r1: number, y0: number, y1: number, size: number, colors: string[], vary = 0.05) => {
      const n = Math.max(8, Math.round((Math.PI * 2 * r1) / size));
      const off = rnd() * Math.PI;
      for (let j = 0; j < n; j++) {
        const gap = 0.022 / r1;
        const a0 = off + (j / n) * Math.PI * 2 + gap;
        const a1 = off + ((j + 1) / n) * Math.PI * 2 - gap;
        stone(r0, r1, a0, a1, y0, y1, shade(colors[Math.floor(rnd() * colors.length)], (rnd() - 0.5) * vary));
      }
    };
    // The mortar core of each tier, a little lower and inset, so the joints read as recessed.
    const core = (r: number, top: number) => {
      const h = top + 0.05;
      b.add(G.cyl(64), '#8a7e6c', { pos: [at.x, top - h / 2, at.z], scale: [r, h, r] });
    };
    const stepStones = ['#a99c89', '#b2a591', '#a2947f', '#b8ab96'];
    const topStones = ['#d0c3ae', '#c8baa5', '#d6cab6', '#c2b49e'];
    core(DAIS.r1 - 0.03, DAIS.h1 - 0.012);
    core(DAIS.r2 - 0.03, DAIS.h2 - 0.012);
    core(DAIS.r - 0.03, DAIS.top - 0.012);
    // The outer step and the inner step: one course of blocks each, reaching in under the tier above.
    course(DAIS.r2 - 0.12, DAIS.r1, -0.05, DAIS.h1, 0.62, stepStones, 0.07);
    course(DAIS.r - 0.12, DAIS.r2, DAIS.h1 - 0.02, DAIS.h2, 0.58, stepStones, 0.07);
    // The coping round the top: bigger stones standing a little proud.
    course(DAIS.r - 0.34, DAIS.r, DAIS.h2 - 0.02, DAIS.top + 0.014, 0.74, ['#b3a58f', '#aa9c86', '#bbae98'], 0.05);
    // The top paved in rings of slabs, clear of the red ring, the coping and the compass.
    const pave = (r0: number, r1: number) => {
      for (let r = r0; r < r1 - 0.05; r += 0.66) course(r, Math.min(r + 0.66, r1), DAIS.top - 0.03, DAIS.top, 0.8, topStones, 0.05);
    };
    pave(0.72, STOOL_R - 0.25);
    pave(STOOL_R + 0.25, DAIS.r - 0.36);
    // The red ring of stones the stools stand on.
    course(STOOL_R - 0.24, STOOL_R + 0.24, DAIS.top - 0.03, DAIS.top + 0.004, 0.46, ['#b98e74', '#b08367', '#c0977c'], 0.05);
    // A bronze compass at the centre: a ring, a darker disc and a four-pointed star.
    course(0.52, 0.68, DAIS.top - 0.03, DAIS.top + 0.006, 0.3, ['#9a7a45', '#a58450'], 0.03);
    b.add(G.cyl(40), '#8c7d68', { pos: [at.x, DAIS.top - 0.012, at.z], scale: [0.53, 0.03, 0.53] });
    // The star's points overlap near the middle, so each sits at its own height (the long ones above the
    // short), and a bronze boss covers the middle: no two pieces share a plane, so nothing flickers.
    for (let k = 0; k < 8; k++) {
      const a = (k / 8) * Math.PI * 2;
      const long = k % 2 === 0 ? 0.48 : 0.26;
      const side = 0.07;
      const y = DAIS.top + 0.006 + (k % 2 === 0 ? 0.004 : 0) + k * 0.0004;
      tris([P(a - 0.0001, 0, y), P(a, long, y), P(a - Math.atan2(side, 0.1), 0.12, y)], '#c9a35c');
      tris([P(a, 0, y), P(a + Math.atan2(side, 0.1), 0.12, y), P(a, long, y)], '#a8843e');
    }
    b.add(G.cyl(24), '#9a7a45', { pos: [at.x, DAIS.top + 0.012, at.z], scale: [0.11, 0.012, 0.11] });
    // A little moss where the steps meet, here and there.
    for (let k = 0; k < 16; k++) {
      const a = rnd() * Math.PI * 2;
      const outer = k % 2 === 0;
      const r = outer ? DAIS.r2 + 0.05 + rnd() * 0.04 : DAIS.r + 0.05 + rnd() * 0.04;
      const y = outer ? DAIS.h1 : DAIS.h2;
      const [x, , z] = P(a, r, y);
      b.add(G.sphere(10, 6), k % 3 ? '#6c8548' : '#5d7640', { pos: [x, y + 0.004, z], rot: [0, a, 0], scale: [0.16 + rnd() * 0.12, 0.022, 0.07 + rnd() * 0.05] });
    }
    const ring = b.mesh(matte(), { cast: true });
    ring.name = 'dais';
    outdoor.group.add(ring);
  }
  // The clock hands from the grimoire's vote clock, laid on the cobbles: an antique spade hand each for the
  // nominator (blue) and the nominee (red), and the gold hand that sweeps round as the votes are taken.
  const handMat = new THREE.MeshStandardMaterial({ vertexColors: true, metalness: 0.25, roughness: 0.45 });
  const spadeHand = (colour: string, L: number, y: number) => {
    const b = new Builder();
    const dark = '#1a1410';
    const s = L - 1.1; // where the spade starts
    // A slim stem from the pin to the spade, a small collar part way, and a ring round the pin.
    b.add(G.box(), colour, { pos: [0, 0.03, (s + 0.1) / 2], scale: [0.11, 0.05, s + 0.1] });
    b.add(G.box(), colour, { pos: [0, 0.03, s * 0.42], scale: [0.26, 0.05, 0.14] });
    b.add(G.torus(0.09, 6, 18), colour, { pos: [0, 0.03, -0.45], rot: [Math.PI / 2, 0, 0], scale: [0.2, 0.2, 1] });
    // The spade: a leaf with a dark hole in it, then a little point at the tip.
    b.add(G.sphere(16, 8), colour, { pos: [0, 0.03, s + 0.45], scale: [0.34, 0.05, 0.52] });
    b.add(G.sphere(16, 8), dark, { pos: [0, 0.065, s + 0.42], scale: [0.12, 0.02, 0.24] });
    b.add(G.cone(6), colour, { pos: [0, 0.03, L - 0.2], rot: [Math.PI / 2, 0, 0], scale: [0.08, 0.4, 0.05] });
    const m = new THREE.Mesh(b.geometry(), handMat);
    // Flat on the cobbles and always moving, so no shadow (the town's shadows are drawn once and kept).
    m.castShadow = false;
    m.position.set(MEETING_CENTRE.x, y, MEETING_CENTRE.z);
    m.visible = false;
    meeting.add(m);
    return m;
  };
  const nominatorHand = spadeHand('#4c94ea', STOOL_R - 1.05, 0.1);
  const nomineeHand = spadeHand('#d4334a', STOOL_R - 0.75, 0.12);
  const hand = spadeHand('#e8c778', STOOL_R - 0.45, 0.14);
  {
    // The pin they all turn on: gold with a dark edge.
    const b = new Builder();
    b.add(G.cyl(24), '#2a1d12', { pos: [0, 0.08, 0], scale: [0.34, 0.16, 0.34] });
    b.add(G.cyl(24), '#e8c778', { pos: [0, 0.17, 0], scale: [0.28, 0.04, 0.28] });
    const pin = new THREE.Mesh(b.geometry(), handMat);
    pin.position.set(MEETING_CENTRE.x, 0, MEETING_CENTRE.z);
    meeting.add(pin);
  }
  const angleOf = (i: number, n: number) => {
    const spot = meetingSpot(i, n);
    return Math.atan2(spot.x - MEETING_CENTRE.x, spot.z - MEETING_CENTRE.z);
  };
  let handVel = 0;
  // The arc the hand has swept since the nominee: a gold band of small tiles just inside the stools.
  const SWEEP_N = 72;
  const sweepGeo = new THREE.BoxGeometry(0.22, 0.04, 0.34);
  const sweepMat = new THREE.MeshStandardMaterial({ color: '#f2c14e', emissive: '#c98a12', emissiveIntensity: 0.5, roughness: 0.4, metalness: 0.3, transparent: true, opacity: 0.85 });
  const sweep = new THREE.InstancedMesh(sweepGeo, sweepMat, SWEEP_N);
  sweep.position.set(MEETING_CENTRE.x, 0.1, MEETING_CENTRE.z);
  sweep.visible = false;
  meeting.add(sweep);
  let sweepFrom = 0;
  let sweepDir = 1;
  const sweepTmp = new THREE.Object3D();
  const sweepAngle = (i: number) => (i / SWEEP_N) * Math.PI * 2;
  const placeSweep = (upTo: number, lit: boolean) => {
    const r = STOOL_R - 0.75;
    let arc = ((upTo - sweepFrom) * sweepDir) % (Math.PI * 2);
    if (arc < 0) arc += Math.PI * 2;
    for (let i = 0; i < SWEEP_N; i++) {
      const a = sweepAngle(i);
      let off = ((a - sweepFrom) * sweepDir) % (Math.PI * 2);
      if (off < 0) off += Math.PI * 2;
      const on = lit && off > 0.05 && off <= arc + 0.02;
      sweepTmp.position.set(Math.sin(a) * r, 0, Math.cos(a) * r);
      sweepTmp.rotation.set(0, a, 0);
      sweepTmp.scale.setScalar(on ? 1 : 0.0001);
      sweepTmp.updateMatrix();
      sweep.setMatrixAt(i, sweepTmp.matrix);
    }
    sweep.instanceMatrix.needsUpdate = true;
  };
  // Everything for a meeting stands on the dais.
  meeting.position.y = DAIS.top;
  outdoor.group.add(meeting);

  // The state the world keeps between calls.
  const groups: Record<ZoneKind, THREE.Group> = {
    town: outdoor.group,
    tavern: interiors.rooms.tavern.group,
    bakery: interiors.rooms.bakery.group,
    church: interiors.rooms.church.group,
    tower: interiors.rooms.tower.group,
    house: interiors.rooms.house.group,
  };
  let zone: ZoneKind = 'town';
  let homeNight = false;
  let time = 0;
  let dayP = 0.35;
  let weather: Weather = 'clear';
  let rainK = 0;
  let mistK = 0;
  let nowT = 0;
  let nextFish = 3;
  let nextShadowTick = 0;
  let gallowsKey = '';
  let townKey = '';
  let meetKey = '';
  let gravesKey = '';
  const P = pal('#000', '#000', '#000', '#000', '#000', 0, '#000', 0);
  const P0 = pal('#000', '#000', '#000', '#000', '#000', 0, '#000', 0);
  const sunDir = new THREE.Vector3();
  const tmpC = new THREE.Color();
  let housesKey = '';
  let ownerKey = '';
  let bellUntil = -1;
  let bellStart = 0;
  let bellPending = false;
  const followAt = new THREE.Vector3();
  const fogTown = new THREE.Fog(DAY.fog.clone(), 55, 140);

  function applyLight() {
    const room = zone === 'town' ? null : interiors.rooms[zone as Room];
    const t = smooth(time);
    const dark = Boolean(room?.night && homeNight);
    const light = room ? (dark && room.night ? room.night : room) : null;
    if (room) {
      const flames = room.group.getObjectByName('glow');
      if (flames) flames.visible = !dark;
      const win = room.group.getObjectByName('nightWindow');
      if (win) win.visible = dark;
    }
    if (!room || !light) {
      // The day's light (warming late in the day), then sunset, dusk and night as night falls.
      const golden = step(0.62, 1, dayP);
      mixPal(P, P_DAY, P_GOLDEN, golden);
      if (t > 0) {
        copyPal(P0, P);
        if (t < 0.35) mixPal(P, P0, P_SUNSET, smooth(t / 0.35));
        else if (t < 0.65) mixPal(P, P_SUNSET, P_DUSK, smooth((t - 0.35) / 0.3));
        else mixPal(P, P_DUSK, P_NIGHT, smooth((t - 0.65) / 0.35));
      }
      // Weather greys it over.
      const dim = step(0.3, 0.9, t);
      if (rainK > 0) {
        P.top.lerp(tmpC.copy(RAIN_DAY.top).lerp(RAIN_NIGHT.top, dim), 0.85 * rainK);
        P.horizon.lerp(tmpC.copy(RAIN_DAY.horizon).lerp(RAIN_NIGHT.horizon, dim), 0.85 * rainK);
        P.fog.lerp(tmpC.copy(RAIN_DAY.horizon).lerp(RAIN_NIGHT.horizon, dim), 0.8 * rainK);
        P.hemiSky.lerp(tmpC.copy(RAIN_DAY.horizon).lerp(RAIN_NIGHT.horizon, dim), 0.45 * rainK);
        P.hemiGround.lerp(tmpC.copy(RAIN_DAY.ground).lerp(RAIN_NIGHT.ground, dim), 0.45 * rainK);
        P.sun.lerp(tmpC.set('#dfe6ee'), 0.6 * rainK);
        P.sunPower *= 1 - 0.68 * rainK;
        P.hemi += 0.12 * rainK * (1 - dim);
      }
      if (mistK > 0) {
        const mf = tmpC.copy(MIST_DAY.fog).lerp(MIST_NIGHT.fog, dim);
        P.fog.lerp(mf, 0.9 * mistK);
        P.horizon.lerp(mf, 0.9 * mistK);
        P.top.lerp(tmpC.copy(MIST_DAY.top).lerp(MIST_NIGHT.top, dim), 0.55 * mistK);
        P.sunPower *= 1 - 0.35 * mistK;
      }
      scene.fog = fogTown;
      if (scene.background instanceof THREE.Color) scene.background.copy(P.horizon);
      else scene.background = P.horizon.clone();
      fogTown.color.copy(P.fog);
      fogTown.near = THREE.MathUtils.lerp(THREE.MathUtils.lerp(THREE.MathUtils.lerp(55, 35, t), 28, rainK), 5, mistK);
      fogTown.far = THREE.MathUtils.lerp(THREE.MathUtils.lerp(THREE.MathUtils.lerp(140, 100, t), 105, rainK), 48, mistK);
      hemi.color.copy(P.hemiSky);
      hemi.groundColor.copy(P.hemiGround);
      hemi.intensity = P.hemi;
      sun.color.copy(P.sun);
      sun.intensity = P.sunPower;
      // The sun (then the moon) over the middle of town, far enough out that its fixed shadow box covers it all.
      sunDirAt(dayP, t, sunDir);
      sun.position.copy(sunDir).multiplyScalar(120);
      sun.target.position.set(0, 0, 0);
      sun.target.updateMatrixWorld();
      shadowBox(SHADOW_HALF, 120);
      noteSun();
      // The sky dome follows the same colours, with a glow round the sun that's strongest at golden hour and sunset.
      dome.top.copy(P.top);
      dome.horizon.copy(P.horizon);
      dome.bottom.copy(P.fog);
      dome.sunDir.copy(sunDir);
      dome.sunColor.copy(P.sun);
      const sunset = Math.max(golden * (1 - t), Math.sin(Math.PI * THREE.MathUtils.clamp(t / 0.6, 0, 1)));
      dome.setGlow((0.3 + 0.9 * sunset) * (1 - step(0.55, 0.8, t)) * (1 - 0.85 * rainK) * (1 - 0.6 * mistK) + 0.12 * step(0.7, 1, t));
      dome.mesh.visible = true;
      sunDisc.position.copy(sunDir).multiplyScalar(200);
      sunMat.color.copy(P.sun).lerp(tmpC.set('#ffffff'), 0.35);
      // Wet cobbles shine and darken; paths and grass darken a touch.
      cobbleMat.specular.setScalar(0.32 * rainK);
      cobbleMat.color.setScalar(1 - 0.2 * rainK);
      for (const m of dampen) m.color.setScalar(1 - 0.14 * rainK);
      // Windows, lamp pools and the real lamps come on as it gets dark.
      windowMat.emissiveIntensity = t * 1.1;
      windowMat.color.setScalar(1 - 0.5 * t);
      (outdoor.pools.material as THREE.MeshBasicMaterial).opacity = 0.75 * t;
      for (const m of outdoor.signMaterials) m.emissiveIntensity = 0.1 + 0.45 * t;
      lamps.forEach((l, i) => {
        const at = outdoor.lampLights[i];
        if (at) l.position.copy(at);
        lampSpecs[i] = { base: 14 * t, flicker: false };
        l.color.set('#ffb561');
        l.distance = 12;
      });
      const clear = (1 - 0.9 * rainK) * (1 - 0.75 * mistK);
      starMat.opacity = (Math.max(0, t - 0.3) / 0.7) * clear;
      moonMat.opacity = step(0.45, 0.85, t) * clear;
      sunMat.opacity = (1 - step(0.3, 0.55, t)) * clear;
      flyMat.opacity = Math.max(0, t - 0.5) * 2 * (1 - rainK);
      glows.set(lowDetail ? 0 : step(0.35, 0.95, t), fogTown.near, fogTown.far * 1.2);
      sky.visible = true;
    } else {
      scene.fog = null;
      scene.background = (scene.background as THREE.Color | null)?.set('#100d16') ?? new THREE.Color('#100d16');
      hemi.color.set(light.hemi.sky);
      hemi.groundColor.set(light.hemi.ground);
      hemi.intensity = light.hemi.intensity;
      sun.color.set(light.sun.color);
      sun.intensity = light.sun.intensity;
      sun.position.set(light.sun.dir[0] * 40, light.sun.dir[1] * 40, light.sun.dir[2] * 40);
      sun.target.position.set(0, 0, 0);
      sun.target.updateMatrixWorld();
      const rs = ROOMS[zone as Room];
      shadowBox(Math.max(rs.hw, rs.hd) + 2, 40);
      noteSun();
      dome.mesh.visible = false;
      lamps.forEach((l, i) => {
        const spec = light.lights[i];
        if (!spec) {
          lampSpecs[i] = { base: 0, flicker: false };
          return;
        }
        l.position.set(...spec.pos);
        l.color.set(spec.color);
        l.distance = spec.distance;
        lampSpecs[i] = { base: spec.intensity, flicker: Boolean(spec.flicker) };
      });
      // Outside the windows it's day or night, and greyer in the rain; sunbeams only on a bright day.
      interiors.glassMaterial.color.setScalar(dark ? 0.08 : (1 - 0.85 * t) * (1 - 0.35 * rainK) * (1 - 0.2 * mistK));
      beamUniforms.uBeam.value = dark ? 0 : (1 - smooth(Math.min(1, t * 1.6))) * (1 - 0.7 * rainK) * (1 - 0.4 * mistK);
      // Halos round the flames and lamps, stronger after dark (on the higher graphics only).
      room.glows?.set(dark || lowDetail ? 0 : 0.35 + 0.35 * t, 200, 400);
      sky.visible = false;
    }
    lamps.forEach((l, i) => (l.intensity = lampSpecs[i].base));
  }

  const world: TownWorld = {
    groups,
    colliders: {
      town: townColliders(outdoor.colliders),
      tavern: roomColliders('tavern'),
      bakery: roomColliders('bakery'),
      church: roomColliders('church'),
      tower: roomColliders('tower'),
      house: roomColliders('house'),
    },
    bounds: {
      town: { kind: 'circle', r: TOWN_R - 0.4 },
      tavern: { kind: 'rect', hw: ROOMS.tavern.hw - 0.45, hd: ROOMS.tavern.hd - 0.45 },
      bakery: { kind: 'rect', hw: ROOMS.bakery.hw - 0.45, hd: ROOMS.bakery.hd - 0.45 },
      church: { kind: 'rect', hw: ROOMS.church.hw - 0.45, hd: ROOMS.church.hd - 0.45 },
      tower: { kind: 'rect', hw: ROOMS.tower.hw - 0.45, hd: ROOMS.tower.hd - 0.45 },
      house: { kind: 'rect', hw: ROOMS.house.hw - 0.45, hd: ROOMS.house.hd - 0.45 },
    },
    doors: makeDoors(),
    stations: makeStations(),
    houseSlots,
    spawn: { x: 0, z: 15.6, ry: Math.PI },
    homeSpawn: { x: BED.x - 1.7, z: BED.z + 1.1, ry: Math.PI / 2 },
    meetingSpot,
    meetingRadius: MEETING_R,

    show(kind, night = false) {
      zone = kind;
      homeNight = night;
      for (const [k, g] of Object.entries(groups)) g.visible = k === kind;
      shadowDirty = true;
      applyLight();
    },

    setTime(t) {
      time = THREE.MathUtils.clamp(t, 0, 1);
      applyLight();
    },

    setHouses(list) {
      const key = JSON.stringify(list);
      if (key === housesKey) return;
      housesKey = key;
      outdoor.houseSigns.forEach((sign, i) => {
        const h = list[i];
        sign.set(h ? h.name : 'For sale');
        outdoor.wreaths[i].visible = Boolean(h?.dead);
      });
    },

    setHomeOwner(name, lines) {
      const key = lines ? lines.join('|') : name;
      if (key === ownerKey) return;
      ownerKey = key;
      interiors.ownerSign.set(lines ?? [`${name}’s`, 'home']);
    },

    setTown(state, now) {
      void now;
      drinks.sync(state.drinks);
      loaves.sync(state.loaves);
      clothes.sync(state.clothes);
      flowers.sync(state.flowers);
      // New washing, flowers, drinks or bread cast new shadows.
      const key = [state.drinks, state.loaves, state.clothes, state.flowers].map((l) => l.map((x) => x.id).join(',')).join('|');
      if (key !== townKey) {
        townKey = key;
        shadowDirty = true;
      }
    },

    setMeeting(m) {
      meeting.visible = m.active;
      const mk = m.active ? `${m.n}:${m.nominee}` : '';
      if (mk !== meetKey) {
        meetKey = mk;
        shadowDirty = true;
      }
      if (!m.active) return;
      while (stools.length < m.n) {
        const s = new THREE.Mesh(stoolGeo, stoolMat);
        s.castShadow = true;
        s.receiveShadow = true;
        meeting.add(s);
        stools.push(s);
        const mark = new THREE.Mesh(markGeo, markMat);
        mark.rotation.x = Math.PI / 2;
        mark.position.y = 0.12;
        mark.visible = false;
        meeting.add(mark);
        voteMarks.push(mark);
      }
      stools.forEach((s, i) => {
        const on = i < m.n;
        s.visible = on;
        voteMarks[i].visible = on && m.votes.includes(i);
        if (!on) return;
        const spot = meetingSpot(i, m.n);
        s.position.set(spot.x, 0, spot.z);
        s.rotation.y = spot.ry;
        voteMarks[i].position.set(spot.x, 0.12, spot.z);
        s.material = i === m.nominee ? nomineeMat : stoolMat;
      });
      // The fixed hands: blue to the nominator, red to the nominee.
      const nomineeIdx = m.nominee !== null && m.nominee >= 0 && m.nominee < m.n ? m.nominee : null;
      const nominatorIdx = m.nominator !== null && m.nominator !== undefined && m.nominator >= 0 && m.nominator < m.n ? m.nominator : null;
      nomineeHand.visible = m.active && nomineeIdx !== null;
      if (nomineeIdx !== null) nomineeHand.rotation.y = angleOf(nomineeIdx, m.n);
      nominatorHand.visible = m.active && nominatorIdx !== null;
      if (nominatorIdx !== null) nominatorHand.rotation.y = angleOf(nominatorIdx, m.n);
      if (m.hand !== null && m.hand >= 0 && m.hand < m.n) {
        const spot = meetingSpot(m.hand, m.n);
        const angle = Math.atan2(spot.x - MEETING_CENTRE.x, spot.z - MEETING_CENTRE.z);
        if (!hand.visible) {
          hand.rotation.y = angle;
          handVel = 0;
        }
        handTarget = angle;
        hand.visible = true;
        handRing.visible = true;
        handRing.position.set(spot.x, 0.11, spot.z);
        // The sweep runs from the nominee's stool, the way the seats go round.
        const nomSpot = meetingSpot(m.nominee ?? m.hand, m.n);
        sweepFrom = Math.atan2(nomSpot.x - MEETING_CENTRE.x, nomSpot.z - MEETING_CENTRE.z);
        if (m.n > 1) {
          const s0 = meetingSpot(0, m.n);
          const s1 = meetingSpot(1, m.n);
          let d = Math.atan2(s1.x - MEETING_CENTRE.x, s1.z - MEETING_CENTRE.z) - Math.atan2(s0.x - MEETING_CENTRE.x, s0.z - MEETING_CENTRE.z);
          d = wrapAngle(d);
          sweepDir = d >= 0 ? 1 : -1;
        }
        sweep.visible = true;
      } else {
        hand.visible = false;
        handRing.visible = false;
        sweep.visible = false;
      }
      signEl.textContent = m.label ?? '';
      sign.visible = Boolean(m.label);
    },

    setPost(names, mail) {
      postBoxes.set(names, mail);
    },

    setGraves(names) {
      graves.sync(names.map((name, i) => ({ id: `${i}:${name}`, name, i })));
      const key = names.join('|');
      if (key !== gravesKey) {
        gravesKey = key;
        shadowDirty = true;
      }
    },

    gallowsSpot: { x: GALLOWS.x, z: GALLOWS.z, ry: GALLOWS.ry, y: PLAT_H },
    occluders: outdoor.occluders,

    setGallows({ open, label, rope: len = GALLOWS_ROPE_REST, ring = 0, swing = 0, puff = 0, snapped = 0 }) {
      // (`rope` is beam to knot; see GallowsState.)
      const key = `${open.toFixed(3)}:${len.toFixed(3)}:${ring.toFixed(3)}:${swing.toFixed(3)}:${Math.min(1, snapped).toFixed(3)}`;
      if (key !== gallowsKey) {
        gallowsKey = key;
        shadowDirty = true;
      }
      trap.rotation.z = -Math.PI * 0.52 * THREE.MathUtils.clamp(open, 0, 1);
      placeRope(len, ring, swing, snapped);
      gallowsPuff.visible = puff > 0 && puff < 1;
      if (gallowsPuff.visible) {
        // Billows out fast, then drifts up and thins away.
        const out = 1 - (1 - puff) * (1 - puff);
        puffMatG.opacity = 0.92 * Math.pow(1 - puff, 1.4);
        gallowsPuff.children.forEach((m, i) => {
          const d = puffDirs[i];
          m.position.set(d.x * (0.3 + 1.1 * out), d.y * (0.5 + 1.2 * out) + 0.5 * puff, d.z * (0.3 + 1.1 * out));
          m.scale.setScalar(0.7 + 1.5 * out);
        });
      }
      if (gallowsLabelEl.textContent !== label) gallowsLabelEl.textContent = label;
      gallowsLabel.visible = Boolean(label);
    },

    follow(x, z) {
      followAt.set(x, 0, z);
    },

    update(dt, t) {
      nowT = t;
      // Lamp flicker and the fires inside.
      lamps.forEach((l, i) => {
        const s = lampSpecs[i];
        l.intensity = s.flicker ? s.base * (0.82 + 0.18 * Math.sin(t * 17 + i * 3) * Math.sin(t * 7.3 + i)) : s.base;
      });
      // The weather fades in and out over a couple of seconds.
      const wantRain = weather === 'rain' ? 1 : 0;
      const wantMist = weather === 'mist' ? 1 : 0;
      if (rainK !== wantRain || mistK !== wantMist) {
        const k = dt / 2;
        rainK = wantRain > rainK ? Math.min(wantRain, rainK + k) : Math.max(wantRain, rainK - k);
        mistK = wantMist > mistK ? Math.min(wantMist, mistK + k) : Math.max(wantMist, mistK - k);
        applyLight();
      }
      // Puddles fill while it rains and dry slowly after; arriving in the rain, they're already there.
      wetK = rainK > 0.5 ? (t < 8 ? 1 : Math.min(1, wetK + dt / 25)) : Math.max(0, wetK - dt / 90);
      glowUniforms.uGlowTime.value = t;
      if (bellPending) {
        bellPending = false;
        bellStart = t;
        bellUntil = t + 5;
      }
      const ringK = t < bellUntil ? (bellUntil - t) / (bellUntil - bellStart) : 0;
      const ring = Math.sin((t - bellStart) * 9) * ringK;
      if (zone === 'tower') turnClockwork(interiors.clockwork, ring);
      if (zone !== 'town') return;
      const dusk = smooth(time);
      clouds.update(dt, (1 - dusk) * (1 - rainK) * (1 - 0.7 * mistK), !lowDetail);
      puddles.set(wetK, rainK, t, fogTown.color);
      dust.update(dt, 1 - 0.75 * dusk);
      // Rain, mist, swaying leaves, birds and the pond.
      rain.set(rainK, t, followAt);
      mist.set(mistK, dt, followAt, fogTown.color);
      swayUniforms.uSwayTime.value = t;
      swayUniforms.uSway.value = 1 + 1.3 * rainK;
      birds.update(dt, t, followAt, true);
      ripples.setTime(t);
      if (t > nextFish) {
        // A fish rising somewhere on the open water (not under the pier).
        const a = Math.random() * Math.PI * 2;
        const d = Math.sqrt(Math.random()) * 0.75;
        const x = POND.x + Math.cos(a) * POND.rx * d;
        const z = POND.z + Math.sin(a) * POND.rz * d;
        if (!(Math.abs(x - DOCK.x) < DOCK.w / 2 + 0.4 && z < DOCK.z1 + 0.4)) ripples.spawn(x, z, 0.5 + Math.random() * 0.5, t);
        nextFish = t + 2.5 + Math.random() * 4;
      }
      // Slow changes that cast shadows (a ringing bell, growing flowers) redraw the shadows now and then.
      if (t > nextShadowTick) {
        nextShadowTick = t + 2;
        let growing = false;
        const now0 = Date.now();
        flowers.each((f) => {
          if (f.at && now0 - f.at < 32000) growing = true;
        });
        if (growing || t < bellUntil) shadowDirty = true;
      }
      // Water.
      const w = outdoor.water;
      const pos = w.mesh.geometry.getAttribute('position') as THREE.BufferAttribute;
      for (let i = 0; i < pos.count; i++) {
        const x = w.base[i * 3];
        const z = w.base[i * 3 + 2];
        pos.setY(i, w.base[i * 3 + 1] + Math.sin(x * 0.7 + t * 0.9) * 0.012 + Math.sin(z * 0.9 + t * 0.7 + 1) * 0.012);
      }
      pos.needsUpdate = true;
      w.material.opacity = 0.88 + Math.sin(t * 0.8) * 0.03;
      // The hand swings round to the next stool on a spring, with a little overshoot, and the band follows it.
      if (hand.visible) {
        let d = handTarget - hand.rotation.y;
        d = wrapAngle(d);
        handVel += d * 42 * dt;
        handVel *= Math.max(0, 1 - 9 * dt);
        hand.rotation.y += handVel * dt;
        placeSweep(hand.rotation.y, true);
        const pulse = 1 + Math.sin(t * 5) * 0.06;
        handRing.scale.set(pulse, pulse, 1);
        sweepMat.emissiveIntensity = 0.45 + Math.sin(t * 3) * 0.15;
      }
      // The flag, the clock and the bell.
      outdoor.flag.rotation.y = Math.sin(t * 1.7) * 0.25 + Math.sin(t * 4.1) * 0.08;
      const d = new Date();
      const hr = ((d.getHours() % 12) + d.getMinutes() / 60) / 12;
      const mn = (d.getMinutes() + d.getSeconds() / 60) / 60;
      for (const h of outdoor.clockHands) {
        h.hour.rotation.z = -hr * Math.PI * 2;
        h.minute.rotation.z = -mn * Math.PI * 2;
      }
      if (t < bellUntil) outdoor.bell.rotation.z = ring * 0.55;
      else outdoor.bell.rotation.z *= 0.9;
      // Smoke.
      if (outdoor.chimneys.length) {
        for (let i = 0; i < PUFFS; i++) {
          const p = puffState[i];
          p.age += dt * 0.7;
          if (p.age > 4) {
            p.age = 0;
            p.dx = (Math.random() - 0.5) * 0.4;
            p.dz = (Math.random() - 0.5) * 0.4;
          }
          const c = outdoor.chimneys[p.chimney];
          const life = p.age / 4;
          pv.set(c.x + p.dx + Math.sin(t + i) * 0.3 * life, c.y + 0.2 + life * 3.2, c.z + p.dz + life * 0.8);
          const s = life < 0.1 ? life * 10 : 1 - (life - 0.1) * 0.55;
          ps.setScalar(Math.max(0.001, s * (0.5 + life)));
          mat4.compose(pv, pq, ps);
          puffs.setMatrixAt(i, mat4);
        }
        puffs.instanceMatrix.needsUpdate = true;
      }
      // Fireflies.
      if (flyMat.opacity > 0) {
        const fp = flyGeo.getAttribute('position') as THREE.BufferAttribute;
        for (let i = 0; i < FLIES; i++) {
          fp.setXYZ(i, flyBase[i * 3] + Math.sin(t * 0.7 + i) * 0.8, flyBase[i * 3 + 1] + Math.sin(t * 1.3 + i * 2) * 0.3, flyBase[i * 3 + 2] + Math.cos(t * 0.5 + i * 1.7) * 0.8);
        }
        fp.needsUpdate = true;
        flyMat.opacity = Math.max(0, smooth(time) - 0.5) * 2 * (0.6 + 0.4 * Math.sin(t * 3));
      }
      // Washing sways; flowers grow.
      clothes.each((c) => {
        c.obj.rotation.x = Math.sin(t * 1.5 + c.obj.position.x) * 0.12;
      });
      const now = Date.now();
      flowers.each((f) => {
        const age = f.at ? (now - f.at) / 30000 : 1;
        const g = smooth(THREE.MathUtils.clamp(age, 0, 1));
        f.obj.scale.setScalar(0.45 + 0.55 * g);
      });
    },

    setLowDetail(on) {
      lowDetail = on;
      const extras = new Set(['forest', 'night-glow', 'birds', 'mist']);
      scene.traverse((o) => {
        if (extras.has(o.name)) o.visible = !on;
      });
      // The glows are shown and hidden with the light, so that has to know too.
      applyLight();
    },

    puff(x, y, z) {
      if (zone === 'town') dust.puff(x, y, z);
    },

    bellRing() {
      bellPending = true;
    },

    setWeather(w) {
      weather = w;
    },

    setDayProgress(p) {
      const v = THREE.MathUtils.clamp(p, 0, 1);
      if (Math.abs(v - dayP) < 0.0005) return;
      dayP = v;
      if (zone === 'town') applyLight();
    },

    ripple(x, z, size = 1) {
      const e = ((x - POND.x) / POND.rx) ** 2 + ((z - POND.z) / POND.rz) ** 2;
      if (e > 1.02) return;
      ripples.spawn(x, z, size, nowT);
    },

    consumeShadowDirty() {
      const d = shadowDirty;
      shadowDirty = false;
      return d;
    },
  };

  world.show('town');
  world.setTime(0);
  world.setHouses(COTTAGE_NAMES.map((name) => ({ name, dead: false })));
  return world;
}
