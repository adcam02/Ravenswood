import * as THREE from 'three';
import { Builder, matte, rng } from '../build';
import { buildItem, disposeObject } from '../items';
import { BED_SPOTS, type Collider, type Door, type Spot, type Station, type TownState, type ZoneKind } from '../types';
import { G, shade } from './kit';
import { buildInteriors, type Room } from './interiors';
import {
  BED,
  BED_H,
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
  meetingSpot,
  bedSpot,
  counterSpot,
  houseSlots,
  makeDoors,
  makeStations,
  roomColliders,
  shelfSpot,
  townColliders,
} from './layout';
import { buildOutdoor } from './outdoor';
import { signBoard, TextSign } from './sign';
import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';

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
  show(kind: ZoneKind): void;
  setTime(t: number): void;
  setHouses(list: ({ name: string; dead: boolean } | null)[]): void;
  setHomeOwner(name: string): void;
  setTown(state: TownState, now: number): void;
  setMeeting(m: { n: number; nominee: number | null; hand: number | null; active: boolean; votes: number[]; label?: string }): void;
  /** Gravestones for the dead, by seat name. */
  setGraves(names: string[]): void;
  /** Where the condemned stands, on the trapdoor. */
  gallowsSpot: Spot & { y: number };
  /** Opens the trapdoor: 0 shut, 1 fully open. */
  setGallows(open: number, label: string): void;
  follow(x: number, z: number): void;
  update(dt: number, t: number): void;
  bellRing(): void;
}

// ---------------------------------------------------------------- the day and the night

const DAY = {
  sky: new THREE.Color('#9fd3ef'),
  fog: new THREE.Color('#c3e4f4'),
  hemiSky: new THREE.Color('#cfe8ff'),
  hemiGround: new THREE.Color('#86b063'),
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
const col = new THREE.Color();
const lerpColor = (a: THREE.Color, b: THREE.Color, t: number) => col.copy(a).lerp(b, t);

/** Four point lights that serve as the square's lamps outside and the lamps and fires inside. */
const POINT_LIGHTS = 4;

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
  b.add(G.cyl(5), stem, { pos: [0, h / 2, 0], scale: [0.025, h, 0.025] });
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
    b.add(G.cyl(8), '#f2c14e', { pos: [0, h + 0.01, 0], scale: [0.045, 0.03, 0.045] });
  } else if (kind === 'sunflower') {
    for (let k = 0; k < 12; k++) {
      const a = (k / 12) * Math.PI * 2;
      b.add(G.ico(0), c, { pos: [Math.cos(a) * 0.15, h, Math.sin(a) * 0.15], rot: [0, -a, 0], scale: [0.1, 0.015, 0.05] });
    }
    b.add(G.cyl(10), '#5a3a1a', { pos: [0, h + 0.01, 0], scale: [0.1, 0.04, 0.1] });
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
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.near = 1;
  sun.shadow.camera.far = 160;
  sun.shadow.camera.left = sun.shadow.camera.bottom = -26;
  sun.shadow.camera.right = sun.shadow.camera.top = 26;
  sun.shadow.bias = -0.0008;
  sun.shadow.normalBias = 0.03;
  scene.add(hemi, sun, sun.target);
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
  const puffs = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(0.28, 1), puffMat, PUFFS);
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
    b.add(G.cyl(10), '#a8a196', { pos: [0, 0.8, 0], rot: [Math.PI / 2, 0, 0], scale: [0.3, 0.14, 0.3] });
    b.add(G.box(), '#7aa85a', { pos: [0, 0.03, 0.75], scale: [0.7, 0.06, 1.3] });
    return b.geometry();
  })();
  const stoneMat = matte();
  const graves = new Keeper<{ id: string; name: string; i: number }>(outdoor.group, (g) => {
    const group = new THREE.Group();
    const stone = new THREE.Mesh(stoneGeo, stoneMat);
    stone.castShadow = true;
    group.add(stone);
    const label = new TextSign({ w: 256, h: 128, bg: '#a8a196', fg: '#3a3630', size: 54 }, g.name);
    const { mesh } = signBoard(label, 0.5, 0.25);
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
    b.add(G.box(), plank, { pos: [0, PLAT_H - 0.06, -0.85], scale: [2.6, 0.12, 0.9] });
    b.add(G.box(), plank, { pos: [0, PLAT_H - 0.06, 0.85], scale: [2.6, 0.12, 0.9] });
    b.add(G.box(), plank, { pos: [-0.95, PLAT_H - 0.06, 0], scale: [0.7, 0.12, 0.8] });
    b.add(G.box(), plank, { pos: [0.95, PLAT_H - 0.06, 0], scale: [0.7, 0.12, 0.8] });
    // Dark underneath, so the drop looks deep.
    b.add(G.box(), '#120d10', { pos: [0, PLAT_H / 2 - 0.1, 0], scale: [2.5, PLAT_H - 0.2, 2.5] });
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) b.add(G.box(), wood, { pos: [sx * 1.2, PLAT_H / 2, sz * 1.2], scale: [0.16, PLAT_H, 0.16] });
    // Steps at the back.
    for (let i = 0; i < 3; i++) b.add(G.box(), plank, { pos: [0, 0.15 + i * 0.3, -1.5 - (2 - i) * 0.32], scale: [1.0, 0.1, 0.34] });
    // Posts and a beam, and a rope with a loop.
    for (const sx of [-1, 1]) b.add(G.box(), wood, { pos: [sx * 1.1, PLAT_H + 1.5, 0], scale: [0.16, 3.0, 0.16] });
    b.add(G.box(), wood, { pos: [0, PLAT_H + 3.0, 0], scale: [2.5, 0.16, 0.16] });
    b.add(G.cyl(5), '#d8c8a0', { pos: [0, PLAT_H + 2.45, 0], scale: [0.025, 1.0, 0.025] });
    b.add(G.torus(0.14, 5, 10), '#d8c8a0', { pos: [0, PLAT_H + 1.8, 0], rot: [0, Math.PI / 2, 0], scale: [0.16, 0.16, 0.16] });
    gallows.add(b.mesh(matte()));
  }
  const trap = new THREE.Group();
  trap.position.set(-0.6, PLAT_H, 0);
  {
    const b = new Builder();
    b.add(G.box(), '#8a5a3a', { pos: [0.6, -0.05, 0], scale: [1.2, 0.1, 1.1] });
    b.add(G.box(), '#3b3a44', { pos: [0.08, 0.01, 0], scale: [0.1, 0.03, 1.1] });
    trap.add(b.mesh(matte()));
  }
  gallows.add(trap);
  const gallowsLabelEl = document.createElement('div');
  gallowsLabelEl.className = 'meeting-sign cosy-panel gallows-sign';
  const gallowsLabel = new CSS2DObject(gallowsLabelEl);
  gallowsLabel.position.set(0, PLAT_H + 3.6, 0);
  gallowsLabel.visible = false;
  gallows.add(gallowsLabel);
  outdoor.group.add(gallows);

  // Meeting stools around the tower, the hand on the cobbles, and a mark by each raised hand.
  const stoolGeo = (() => {
    const b = new Builder();
    b.add(G.cyl(9), '#7a5236', { pos: [0, 0.2, 0], scale: [0.4, 0.4, 0.4] });
    b.add(G.cyl(9), '#c49a6c', { pos: [0, 0.41, 0], scale: [0.4, 0.03, 0.4] });
    b.add(G.torus(0.18, 5, 10), '#a3794f', { pos: [0, 0.425, 0], rot: [Math.PI / 2, 0, 0], scale: [0.24, 0.24, 0.24] });
    return b.geometry();
  })();
  const stoolMat = matte();
  const nomineeMat = new THREE.MeshLambertMaterial({ vertexColors: true, emissive: '#d8303a', emissiveIntensity: 0.55 });
  const stools: THREE.Mesh[] = [];
  const voteMarks: THREE.Mesh[] = [];
  const markGeo = new THREE.TorusGeometry(0.62, 0.05, 6, 20);
  const markMat = new THREE.MeshBasicMaterial({ color: '#f2c14e' });
  const meeting = new THREE.Group();
  meeting.visible = false;
  const handRing = new THREE.Mesh(new THREE.TorusGeometry(0.7, 0.06, 6, 20), new THREE.MeshBasicMaterial({ color: '#ffffff' }));
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
    // A ring of red stones marking the circle, there whether or not a meeting is on.
    const b = new Builder();
    b.add(G.torus(0.09, 4, 48), '#b98e74', { pos: [MEETING_CENTRE.x, 0.075, MEETING_CENTRE.z], rot: [Math.PI / 2, 0, 0], scale: [STOOL_R, STOOL_R, 1] });
    const ring = b.mesh(matte(), { cast: false });
    outdoor.group.add(ring);
  }
  const hand = (() => {
    const b = new Builder();
    b.add(G.box(), '#2a211c', { pos: [0, 0, 1.3], scale: [0.22, 0.05, 2.2] });
    b.add(G.cone(3), '#2a211c', { pos: [0, 0, 2.75], rot: [Math.PI / 2, 0, 0], scale: [0.45, 0.9, 0.4] });
    b.add(G.cyl(10), '#2a211c', { pos: [0, 0, 0], scale: [0.5, 0.05, 0.5] });
    const m = new THREE.Mesh(b.geometry(), matte());
    m.position.set(MEETING_CENTRE.x, 0.13, MEETING_CENTRE.z);
    m.visible = false;
    return m;
  })();
  meeting.add(hand);
  outdoor.group.add(meeting);

  // The state the world keeps between calls.
  const groups: Record<ZoneKind, THREE.Group> = {
    town: outdoor.group,
    tavern: interiors.rooms.tavern.group,
    bakery: interiors.rooms.bakery.group,
    church: interiors.rooms.church.group,
    house: interiors.rooms.house.group,
  };
  let zone: ZoneKind = 'town';
  let time = 0;
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
    if (!room) {
      scene.fog = fogTown;
      (scene.background as THREE.Color | null)?.copy(lerpColor(DAY.sky, NIGHT.sky, t)) ?? (scene.background = lerpColor(DAY.sky, NIGHT.sky, t).clone());
      fogTown.color.copy(lerpColor(DAY.fog, NIGHT.fog, t));
      fogTown.near = 55 - 20 * t;
      fogTown.far = 140 - 40 * t;
      hemi.color.copy(lerpColor(DAY.hemiSky, NIGHT.hemiSky, t));
      hemi.groundColor.copy(lerpColor(DAY.hemiGround, NIGHT.hemiGround, t));
      hemi.intensity = THREE.MathUtils.lerp(DAY.hemi, NIGHT.hemi, t);
      sun.color.copy(lerpColor(DAY.sun, NIGHT.sun, t));
      sun.intensity = THREE.MathUtils.lerp(DAY.sunPower, NIGHT.sunPower, t);
      placeSun();
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
      starMat.opacity = Math.max(0, t - 0.3) / 0.7;
      moonMat.opacity = t;
      sunMat.opacity = 1 - t;
      flyMat.opacity = Math.max(0, t - 0.5) * 2;
      sky.visible = true;
    } else {
      scene.fog = null;
      scene.background = (scene.background as THREE.Color | null)?.set('#100d16') ?? new THREE.Color('#100d16');
      hemi.color.set(room.hemi.sky);
      hemi.groundColor.set(room.hemi.ground);
      hemi.intensity = room.hemi.intensity;
      sun.color.set(room.sun.color);
      sun.intensity = room.sun.intensity;
      sun.position.set(room.sun.dir[0] * 40, room.sun.dir[1] * 40, room.sun.dir[2] * 40);
      sun.target.position.set(0, 0, 0);
      sun.target.updateMatrixWorld();
      lamps.forEach((l, i) => {
        const spec = room.lights[i];
        if (!spec) {
          lampSpecs[i] = { base: 0, flicker: false };
          return;
        }
        l.position.set(...spec.pos);
        l.color.set(spec.color);
        l.distance = spec.distance;
        lampSpecs[i] = { base: spec.intensity, flicker: Boolean(spec.flicker) };
      });
      // Outside the windows it's day or night.
      interiors.glassMaterial.color.setScalar(1 - 0.85 * t);
      sky.visible = false;
    }
    lamps.forEach((l, i) => (l.intensity = lampSpecs[i].base));
  }

  function placeSun() {
    const t = smooth(time);
    const dir = DAY.sunDir.clone().lerp(NIGHT.sunDir, t).normalize();
    sun.position.copy(followAt).addScaledVector(dir, 80);
    sun.target.position.copy(followAt);
    sun.target.updateMatrixWorld();
  }

  const world: TownWorld = {
    groups,
    colliders: {
      town: townColliders(outdoor.colliders),
      tavern: roomColliders('tavern'),
      bakery: roomColliders('bakery'),
      church: roomColliders('church'),
      house: roomColliders('house'),
    },
    bounds: {
      town: { kind: 'circle', r: TOWN_R - 0.4 },
      tavern: { kind: 'rect', hw: ROOMS.tavern.hw - 0.45, hd: ROOMS.tavern.hd - 0.45 },
      bakery: { kind: 'rect', hw: ROOMS.bakery.hw - 0.45, hd: ROOMS.bakery.hd - 0.45 },
      church: { kind: 'rect', hw: ROOMS.church.hw - 0.45, hd: ROOMS.church.hd - 0.45 },
      house: { kind: 'rect', hw: ROOMS.house.hw - 0.45, hd: ROOMS.house.hd - 0.45 },
    },
    doors: makeDoors(),
    stations: makeStations(),
    houseSlots,
    spawn: { x: 0, z: 13.2, ry: Math.PI },
    homeSpawn: { x: BED.x - 1.7, z: BED.z + 1.1, ry: Math.PI / 2 },
    meetingSpot,
    meetingRadius: MEETING_R,

    show(kind) {
      zone = kind;
      for (const [k, g] of Object.entries(groups)) g.visible = k === kind;
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

    setHomeOwner(name) {
      if (name === ownerKey) return;
      ownerKey = name;
      interiors.ownerSign.set([`${name}’s`, 'home']);
    },

    setTown(state, now) {
      void now;
      drinks.sync(state.drinks);
      loaves.sync(state.loaves);
      clothes.sync(state.clothes);
      flowers.sync(state.flowers);
    },

    setMeeting(m) {
      meeting.visible = m.active;
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
      if (m.hand !== null && m.hand >= 0 && m.hand < m.n) {
        const spot = meetingSpot(m.hand, m.n);
        const angle = Math.atan2(spot.x - MEETING_CENTRE.x, spot.z - MEETING_CENTRE.z);
        if (!hand.visible) hand.rotation.y = angle;
        handTarget = angle;
        hand.visible = true;
        handRing.visible = true;
        handRing.position.set(spot.x, 0.11, spot.z);
      } else {
        hand.visible = false;
        handRing.visible = false;
      }
      signEl.textContent = m.label ?? '';
      sign.visible = Boolean(m.label);
    },

    setGraves(names) {
      graves.sync(names.map((name, i) => ({ id: `${i}:${name}`, name, i })));
    },

    gallowsSpot: { x: GALLOWS.x, z: GALLOWS.z, ry: GALLOWS.ry, y: PLAT_H },

    setGallows(open, label) {
      trap.rotation.z = -Math.PI * 0.52 * THREE.MathUtils.clamp(open, 0, 1);
      gallowsLabelEl.textContent = label;
      gallowsLabel.visible = Boolean(label);
    },

    follow(x, z) {
      if (Math.abs(followAt.x - x) < 0.5 && Math.abs(followAt.z - z) < 0.5) return;
      followAt.set(x, 0, z);
      if (zone === 'town') placeSun();
    },

    update(dt, t) {
      // Lamp flicker and the fires inside.
      lamps.forEach((l, i) => {
        const s = lampSpecs[i];
        l.intensity = s.flicker ? s.base * (0.82 + 0.18 * Math.sin(t * 17 + i * 3) * Math.sin(t * 7.3 + i)) : s.base;
      });
      if (zone !== 'town') return;
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
      // The hand swings round to the next stool rather than jumping.
      if (hand.visible) {
        let d = handTarget - hand.rotation.y;
        while (d > Math.PI) d -= Math.PI * 2;
        while (d < -Math.PI) d += Math.PI * 2;
        hand.rotation.y += d * Math.min(1, dt * 5);
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
      if (bellPending) {
        bellPending = false;
        bellStart = t;
        bellUntil = t + 5;
      }
      if (t < bellUntil) {
        const k = (bellUntil - t) / (bellUntil - bellStart);
        outdoor.bell.rotation.z = Math.sin((t - bellStart) * 9) * 0.55 * k;
      } else outdoor.bell.rotation.z *= 0.9;
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

    bellRing() {
      bellPending = true;
    },
  };

  world.show('town');
  world.setTime(0);
  return world;
}
