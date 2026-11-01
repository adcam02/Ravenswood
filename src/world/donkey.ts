import * as THREE from 'three';
import { Builder, soft } from './build';
import { cyl, sph, starGeo } from './hats';
import { BAKERY, CHURCH, CLUB, FLATS, GRAVEYARD, MARKET, MARKET_HAY, TAVERN, type Building } from './town/layout';
import { local } from './town/kit';
import type { ZoneKind } from './types';

/**
 * The golden donkey: a tiny donkey hidden somewhere in town each day (game/donkey.ts picks where and when), who
 * leaves a pile of gold nuggets behind him that grows the longer he goes unfound. The first to find him and press E
 * gets the gold.
 */

/** A hiding place: where he stands, which way he faces, and whether a bush is drawn in front of him. */
export interface DonkeySpot {
  zone: ZoneKind;
  x: number;
  z: number;
  ry: number;
  bush?: boolean;
  /** What the announcement calls it. */
  where: string;
}

/** A spot `lx` across and `lz` out from a building's middle (behind it when negative), facing along the wall. */
const by = (b: Building, lx: number, lz: number, where: string): DonkeySpot => ({ zone: 'town', ...local(b.x, b.z, b.ry, lx, lz), ry: b.ry + Math.PI / 2, where });

/** The good hiding places: behind the buildings, in the churchyard, under the dock, in a bush, and a few indoors. */
export const DONKEY_SPOTS: DonkeySpot[] = [
  { zone: 'town', x: GRAVEYARD.x - 1.2, z: GRAVEYARD.z - 3.6, ry: 0.5, where: 'in the churchyard' },
  by(CHURCH, 2.6, -CHURCH.d / 2 - 0.5, 'behind the church'),
  by(TAVERN, -TAVERN.w / 2 + 0.7, -TAVERN.d / 2 - 0.45, 'behind the tavern'),
  by(BAKERY, BAKERY.w / 2 - 0.7, -BAKERY.d / 2 - 0.45, 'behind the bakery'),
  by(CLUB, -1.6, -CLUB.d / 2 - 0.8, 'behind the club'),
  by(FLATS, FLATS.w / 2 + 1.0, -1.2, 'beside Wren Court'),
  { zone: 'town', x: 5.25, z: 13.3, ry: -0.4, where: 'under the dock' },
  { zone: 'town', x: 17.9, z: 26.1, ry: 2.4, bush: true, where: 'in a bush' },
  { zone: 'town', x: -29.9, z: 10.6, ry: -1.2, bush: true, where: 'in a bush' },
  { zone: 'town', x: -18.7, z: 26.3, ry: 0.8, bush: true, where: 'by the fairy ring' },
  { zone: 'town', x: -15.6, z: 11.0, ry: Math.PI, bush: true, where: 'behind the washhouse' },
  { zone: 'town', ...local(MARKET.x, MARKET.z, MARKET.ry, MARKET_HAY.lx + 0.75, MARKET_HAY.lz + 0.2), ry: MARKET.ry + 1.2, where: 'in the hay by the market' },
  { zone: 'tavern', x: 7.0, z: -5.0, ry: -2.4, where: 'in the tavern' },
  { zone: 'church', x: -5.1, z: 7.7, ry: 2.5, where: 'in the church' },
  { zone: 'bakery', x: -5.0, z: -3.9, ry: 0.7, where: 'in the bakery' },
];

/** He's worth $1 the moment he's hidden, and a little more every moment he goes unfound, up to $50 after five minutes. */
export const DONKEY_MIN = 1;
export const DONKEY_MAX = 50;
export const DONKEY_FULL_MS = 5 * 60_000;
export const donkeyWorth = (ms: number) => Math.round(DONKEY_MIN + (DONKEY_MAX - DONKEY_MIN) * Math.min(1, Math.max(0, ms / DONKEY_FULL_MS)));
/** How close you have to be to catch him (the Storyteller's browser allows a little more, for lag). */
export const DONKEY_REACH = 1.9;

const GOLD = '#f2c230';
const NUGGETS = 22;

/** The little donkey himself, his growing pile of gold, a glint or two, and (in a bush) the bush. */
export class DonkeyView {
  readonly root = new THREE.Group();
  private head = new THREE.Group();
  private tail = new THREE.Group();
  private nuggets: THREE.Mesh[] = [];
  private stars: THREE.Mesh[] = [];
  private bushMesh: THREE.Mesh;
  private materials: THREE.Material[] = [];
  private geos: THREE.BufferGeometry[] = [];

  constructor() {
    const mat = soft();
    this.materials.push(mat);
    const coat = '#cdb06e';
    const pale = '#eee2c4';
    const dark = '#5a4a36';
    const body = new Builder();
    // A round little body, gold-tinged dun with a pale belly, four short legs with dark hooves, a stripe down his back.
    body.add(sph(16, 12), coat, { pos: [0, 0.27, 0], scale: [0.12, 0.11, 0.19] });
    body.add(sph(12, 8), pale, { pos: [0, 0.22, 0.01], scale: [0.1, 0.07, 0.15] });
    body.add(sph(10, 6), '#a88e5a', { pos: [0, 0.37, -0.02], scale: [0.03, 0.012, 0.16] });
    for (const [x, z] of [
      [-0.06, 0.11],
      [0.06, 0.11],
      [-0.06, -0.11],
      [0.06, -0.11],
    ]) {
      body.add(cyl(8), coat, { pos: [x, 0.11, z], scale: [0.03, 0.2, 0.03] });
      body.add(cyl(8), dark, { pos: [x, 0.015, z], scale: [0.034, 0.03, 0.034] });
    }
    // A neck up to his head, and a little gold bell on a red collar.
    body.add(cyl(10), coat, { pos: [0, 0.38, 0.15], rot: [0.6, 0, 0], scale: [0.05, 0.16, 0.06] });
    body.add(new THREE.TorusGeometry(1, 0.2, 5, 16), '#c0392b', { pos: [0, 0.37, 0.16], rot: [Math.PI / 2 + 0.6, 0, 0], scale: [0.056, 0.064, 0.06] });
    body.add(sph(8, 6), GOLD, { pos: [0, 0.33, 0.21], scale: 0.022 });
    const bodyMesh = body.mesh(mat, { cast: true, receive: false });
    this.root.add(bodyMesh);
    this.geos.push(bodyMesh.geometry);

    const head = new Builder();
    // His head (long, with a pale muzzle and dark nostrils), big ears tipped dark, eyes and a tuft of mane.
    head.add(sph(14, 10), coat, { pos: [0, 0, 0.03], rot: [0.5, 0, 0], scale: [0.065, 0.07, 0.1] });
    head.add(sph(12, 8), pale, { pos: [0, -0.05, 0.11], rot: [0.5, 0, 0], scale: [0.05, 0.045, 0.05] });
    for (const x of [-1, 1]) {
      head.add(sph(6, 4), '#2a2018', { pos: [x * 0.02, -0.045, 0.155], scale: 0.009 });
      head.add(sph(8, 6), '#1d1d24', { pos: [x * 0.052, 0.025, 0.06], scale: 0.014 });
      head.add(sph(10, 6), coat, { pos: [x * 0.04, 0.1, -0.02], rot: [-0.2, 0, x * -0.35], scale: [0.025, 0.09, 0.016] });
      head.add(sph(8, 6), dark, { pos: [x * 0.068, 0.175, -0.04], rot: [-0.2, 0, x * -0.35], scale: [0.012, 0.03, 0.01] });
    }
    for (let i = 0; i < 4; i++) head.add(sph(6, 4), dark, { pos: [0, 0.06 - i * 0.03, -0.05 - i * 0.03], scale: [0.012, 0.03, 0.02] });
    const headMesh = head.mesh(mat, { cast: true, receive: false });
    this.head.add(headMesh);
    this.head.position.set(0, 0.47, 0.22);
    this.root.add(this.head);
    this.geos.push(headMesh.geometry);

    const tail = new Builder();
    tail.add(cyl(6), coat, { pos: [0, -0.06, 0], scale: [0.012, 0.12, 0.012] });
    tail.add(sph(8, 6), dark, { pos: [0, -0.13, 0], scale: [0.022, 0.04, 0.022] });
    const tailMesh = tail.mesh(mat, { cast: false, receive: false });
    this.tail.add(tailMesh);
    this.tail.position.set(0, 0.32, -0.19);
    this.tail.rotation.x = 0.4;
    this.root.add(this.tail);
    this.geos.push(tailMesh.geometry);

    // The gold: nuggets heaped beside him, the first ones at the bottom of the pile, shown as his worth grows.
    const gold = new THREE.MeshStandardMaterial({ color: GOLD, metalness: 0.85, roughness: 0.32, emissive: '#6a4a00', emissiveIntensity: 0.35, flatShading: true });
    this.materials.push(gold);
    const nug = new THREE.DodecahedronGeometry(1, 0);
    this.geos.push(nug);
    let seed = 7;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    for (let i = 0; i < NUGGETS; i++) {
      const m = new THREE.Mesh(nug, gold);
      // A rough cone: a ring at the bottom, smaller rings up it, one on top.
      const layer = i < 10 ? 0 : i < 17 ? 1 : i < 21 ? 2 : 3;
      const inRing = [10, 7, 4, 1][layer];
      const k = i - [0, 10, 17, 21][layer];
      const a = (k / inRing) * Math.PI * 2 + layer * 0.7 + rnd() * 0.3;
      const r = [0.085, 0.058, 0.032, 0][layer];
      m.position.set(-0.24 + Math.cos(a) * r, 0.02 + layer * 0.03, -0.12 + Math.sin(a) * r);
      m.rotation.set(rnd() * 3, rnd() * 3, rnd() * 3);
      m.scale.set(0.022 + rnd() * 0.01, 0.018 + rnd() * 0.008, 0.022 + rnd() * 0.01);
      m.castShadow = true;
      m.visible = false;
      this.nuggets.push(m);
      this.root.add(m);
    }

    // Glints: a few four-pointed twinkles round him and the gold, flaring now and then.
    const glint = new THREE.MeshBasicMaterial({ color: '#fff6c8', transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
    this.materials.push(glint);
    const star = starGeo(1, 0.22);
    this.geos.push(star);
    const spots: [number, number, number][] = [
      [0.1, 0.5, 0.1],
      [-0.12, 0.38, -0.1],
      [-0.26, 0.16, -0.08],
      [-0.2, 0.1, -0.2],
      [0.05, 0.62, 0.25],
    ];
    spots.forEach((p, i) => {
      const m = new THREE.Mesh(star, glint);
      m.position.set(...p);
      m.userData.phase = i * 2.39;
      this.stars.push(m);
      this.root.add(m);
    });

    // A bush to hide in: a few leafy blobs in front of him, about his height.
    const bush = new Builder();
    const greens = ['#4f8a3c', '#5a9a44', '#467d36'];
    for (let i = 0; i < 6; i++) {
      const a = -0.9 + (i / 5) * 1.8;
      bush.add(new THREE.IcosahedronGeometry(1, 1), greens[i % 3], { pos: [Math.sin(a) * 0.32, 0.2 + (i % 2) * 0.1, 0.18 + Math.cos(a) * 0.14], scale: [0.2, 0.22 + (i % 3) * 0.04, 0.18] });
    }
    this.bushMesh = bush.mesh(mat, { cast: true, receive: true });
    this.geos.push(this.bushMesh.geometry);
    this.root.add(this.bushMesh);
    this.root.visible = false;
  }

  /** Stand him at a hiding place (or hide him away with null). */
  place(spot: DonkeySpot | null, groundY = 0) {
    this.root.visible = Boolean(spot);
    if (!spot) return;
    this.root.position.set(spot.x, groundY, spot.z);
    this.root.rotation.y = spot.ry;
    this.bushMesh.visible = Boolean(spot.bush);
  }

  /** How much gold is piled beside him, by what he's worth. */
  setWorth(dollars: number) {
    const n = Math.max(1, Math.round((Math.min(DONKEY_MAX, dollars) / DONKEY_MAX) * NUGGETS));
    this.nuggets.forEach((m, i) => (m.visible = i < n));
  }

  update(t: number) {
    if (!this.root.visible) return;
    // Breathing, a nod now and then, an ear flick, and his tail swishing.
    this.root.children[0].scale.y = 1 + Math.sin(t * 2.2) * 0.015;
    this.head.rotation.x = Math.max(0, Math.sin(t * 0.7)) ** 8 * 0.5;
    this.head.rotation.z = Math.sin(t * 1.3) * 0.05;
    this.tail.rotation.z = Math.sin(t * 3.1) * 0.35;
    for (const m of this.stars) {
      const k = Math.max(0, Math.sin(t * 1.5 + m.userData.phase)) ** 6;
      m.scale.setScalar(0.05 * (0.1 + k));
      m.rotation.z = t * 0.6 + m.userData.phase;
      m.visible = k > 0.03;
    }
  }

  dispose() {
    this.root.removeFromParent();
    for (const g of this.geos) g.dispose();
    for (const m of this.materials) m.dispose();
  }
}
