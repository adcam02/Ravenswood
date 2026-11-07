import * as THREE from 'three';
import type { VictoryId } from './victoryShop';

/**
 * The props and staging for the victory moves that have them (victoryMoves2.ts has how the body goes): a podium, a
 * trophy and confetti, fireworks, an explosion, a jetpack and so on.
 *
 * Like the emotes' extras (emoteFx.ts) they're made when the move starts and taken away when it ends, and every bit
 * is placed from the move's time alone, so everyone watching the same animation sees the same show. Each prop is
 * built once and then cloned (the clones share the geometry and materials, which are kept for good), so a move
 * starting again costs next to nothing. Nothing casts shadows, and there are no lights.
 *
 * Up on a stool in the town (perched) there's no room for the things that stand on the floor (the podium, the deck,
 * the mic stand, the red carpet), so they're left out and the move is done without them.
 */

const smooth = THREE.MathUtils.smoothstep;
const { sin, cos, abs, max, min, PI, sqrt } = Math;
const TAU = PI * 2;

/** Whether a rig is up on something (a stool in the town) rather than on the floor or the lineup's stage. */
export function isPerched(root: THREE.Object3D) {
  return !root.userData.stage && root.position.y > 0.05;
}

/** About how big an animal is, for sizing what's round it (1 for a fox-sized one). */
export function propSize(top: number) {
  return THREE.MathUtils.clamp(top / 0.75, 0.75, 1.9);
}

/** How tall the podium is. */
export function podiumHeight(size: number) {
  return 0.22 * size;
}

/** How high the jetpack has them, `c` seconds into its loop. */
export function jetHeight(top: number, c: number) {
  const up = smooth(c, 0.8, 2) * (1 - smooth(c, 3.6, 4.6));
  return up * top * 0.9 + (c > 1.8 && c < 3.8 ? sin(c * 3) * 0.03 : 0);
}

/** The bits of the rig the props hang off, and its landmarks (body space, at rest). */
export interface WinRig {
  root: THREE.Object3D;
  /** The body, before it's turned or lifted by a pose (where `WinSpots` are). */
  float: THREE.Object3D;
  body: THREE.Object3D;
  neck: THREE.Object3D;
  /** The paws' grips, kept level (held things stand up out of them, +z forward). */
  hand: THREE.Object3D;
  handL(): THREE.Object3D;
  /** Where the bones are at rest, so something can be put on one at a spot in body space. */
  rest: Map<string, THREE.Vector3>;
  shoulder: THREE.Vector3;
  headC: THREE.Vector3;
  headR: THREE.Vector3;
  eyePos: THREE.Vector3;
  mouth: THREE.Vector3;
  front: number;
  back: number;
  pawR: number;
}

/** Where the head and paws are this frame, in the float's space (see emoteFx's EmoteSpots). */
export interface WinSpots {
  top: number;
  head: THREE.Vector3;
  hand: THREE.Vector3;
  handL: THREE.Vector3;
}

// ---------------------------------------------------------------- materials and pictures, made once

const mats = new Map<string, THREE.Material>();
function mat(color: string, extra: THREE.MeshStandardMaterialParameters = {}): THREE.MeshStandardMaterial {
  const key = `s:${color}:${JSON.stringify(extra)}`;
  let m = mats.get(key) as THREE.MeshStandardMaterial | undefined;
  if (!m) mats.set(key, (m = new THREE.MeshStandardMaterial({ color, roughness: 0.6, flatShading: true, ...extra })));
  return m;
}
/** Something that glows: added on top (unless `added` is false, for what must show against a bright day), not in the fog. */
function glow(color: string, opacity = 1, side: THREE.Side = THREE.FrontSide, added = true): THREE.MeshBasicMaterial {
  const key = `g:${color}:${opacity}:${side}:${added}`;
  let m = mats.get(key) as THREE.MeshBasicMaterial | undefined;
  if (!m) mats.set(key, (m = new THREE.MeshBasicMaterial({ color, transparent: true, opacity, depthWrite: false, blending: added ? THREE.AdditiveBlending : THREE.NormalBlending, side, fog: false })));
  return m;
}
/** A picture on a flat face. */
function pictured(key: string, w: number, h: number, draw: (g: CanvasRenderingContext2D) => void): THREE.MeshStandardMaterial {
  let m = mats.get(`p:${key}`) as THREE.MeshStandardMaterial | undefined;
  if (!m) {
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    draw(c.getContext('2d')!);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    mats.set(`p:${key}`, (m = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.7, side: THREE.DoubleSide })));
  }
  return m;
}

/** A soft round glow, or a four-pointed twinkle, for the sprites (drawn over, not added, so they show by day too). */
const texes = new Map<string, THREE.Texture>();
function spriteTex(kind: 'dot' | 'twinkle'): THREE.Texture {
  let t = texes.get(kind);
  if (t) return t;
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const g = c.getContext('2d')!;
  const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, 'rgba(255,255,255,1)');
  grad.addColorStop(kind === 'dot' ? 0.35 : 0.12, 'rgba(255,255,255,0.8)');
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grad;
  if (kind === 'dot') g.fillRect(0, 0, 64, 64);
  else {
    g.beginPath();
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * TAU;
      const r = i % 2 ? 5 : 32;
      g.lineTo(32 + cos(a) * r, 32 + sin(a) * r);
    }
    g.fill();
    g.beginPath();
    g.arc(32, 32, 12, 0, TAU);
    g.fill();
  }
  t = new THREE.CanvasTexture(c);
  texes.set(kind, t);
  return t;
}
function spriteMat(color: string, kind: 'dot' | 'twinkle' = 'dot'): THREE.SpriteMaterial {
  const key = `sp:${kind}:${color}`;
  let m = mats.get(key) as THREE.SpriteMaterial | undefined;
  if (!m) mats.set(key, (m = new THREE.SpriteMaterial({ map: spriteTex(kind), color, transparent: true, depthWrite: false, fog: false })));
  return m;
}
function sprite(color: string, kind: 'dot' | 'twinkle' = 'dot') {
  return new THREE.Sprite(spriteMat(color, kind));
}

// ---------------------------------------------------------------- the props, built once each

const built = new Map<string, THREE.Object3D>();
/** A fresh copy of a prop (sharing its geometry and materials), built the first time it's wanted. */
function prop(name: string, make: () => THREE.Object3D): THREE.Object3D {
  let o = built.get(name);
  if (!o) built.set(name, (o = make()));
  return o.clone();
}
const mesh = (geo: THREE.BufferGeometry, m: THREE.Material, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0) => {
  const o = new THREE.Mesh(geo, m);
  o.position.set(x, y, z);
  o.rotation.set(rx, ry, rz);
  return o;
};
const group = (...kids: THREE.Object3D[]) => {
  const g = new THREE.Group();
  if (kids.length) g.add(...kids);
  return g;
};

// (Not very metallic: with nothing round to reflect, metal comes out dark.)
const GOLD = () => mat('#f2c14e', { metalness: 0.3, roughness: 0.35, emissive: '#7a5410', emissiveIntensity: 0.45 });
const SILVER = () => mat('#c9ced6', { metalness: 0.3, roughness: 0.3 });

/** The podium's top step, 1 m across (scaled to fit), standing on y = 0. */
function podium() {
  const box = new THREE.BoxGeometry(1, 1, 0.7);
  box.translate(0, 0.5, 0);
  const trim = new THREE.BoxGeometry(1.04, 0.06, 0.74);
  const one = pictured('podium1', 128, 128, (g) => {
    g.fillStyle = '#f6efe0';
    g.fillRect(0, 0, 128, 128);
    g.fillStyle = '#c23b3b';
    g.beginPath();
    g.arc(64, 64, 52, 0, TAU);
    g.fill();
    g.strokeStyle = '#e8b440';
    g.lineWidth = 8;
    g.stroke();
    g.fillStyle = '#fff6dc';
    g.font = '900 78px "Arial Black", Arial, sans-serif';
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillText('1', 64, 70);
  });
  const face = mesh(new THREE.PlaneGeometry(0.62, 0.62), one, 0, 0.5, 0.351);
  return group(mesh(box, mat('#f3ead8')), mesh(trim, GOLD(), 0, 0.97, 0), face);
}

/** A fry scoop (held by the handle, the scoop out in front) with chips in it, named so they can be shown. */
function scoop() {
  const steel = mat('#c4c9cf', { metalness: 0.3, roughness: 0.35, side: THREE.DoubleSide });
  const pan = new THREE.CylinderGeometry(0.07, 0.05, 0.035, 4, 1, true);
  const bottom = new THREE.BoxGeometry(0.075, 0.006, 0.075);
  const handle = new THREE.CylinderGeometry(0.009, 0.009, 0.1, 6);
  const chipGeo = new THREE.BoxGeometry(0.012, 0.07, 0.012);
  const chipMat = mat('#f2c04a', { emissive: '#7a4e08', emissiveIntensity: 0.25 });
  const chips = group(...Array.from({ length: 7 }, (_, i) => mesh(chipGeo, chipMat, ((i % 4) - 1.5) * 0.016, 0.03, (Math.floor(i / 4) - 0.5) * 0.02, 0.25 * sin(i * 2.1), 0, 0.35 * cos(i * 1.7))));
  chips.name = 'chips';
  const head = group(mesh(pan, steel, 0, 0.018, 0, 0, PI / 4), mesh(bottom, steel, 0, 0.002, 0), chips);
  head.position.set(0, 0.01, 0.11);
  return group(mesh(handle, mat('#2b2b30'), 0, 0.005, 0.03, PI / 2), head);
}

/** The paper bag, open at the top, with chips that show once they're in. */
function bag() {
  const paper = mat('#c99a63');
  const body = new THREE.BoxGeometry(0.11, 0.13, 0.07);
  body.translate(0, 0.065, 0);
  const logo = pictured('bagLogo', 64, 64, (g) => {
    g.fillStyle = '#c99a63';
    g.fillRect(0, 0, 64, 64);
    g.fillStyle = '#c23b3b';
    g.beginPath();
    g.arc(32, 32, 24, 0, TAU);
    g.fill();
    g.fillStyle = '#ffd34d';
    g.font = '900 34px "Arial Black", Arial, sans-serif';
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillText('R', 32, 34);
  });
  const chipGeo = new THREE.BoxGeometry(0.012, 0.08, 0.012);
  const chipMat = mat('#f2c04a', { emissive: '#7a4e08', emissiveIntensity: 0.25 });
  const chips = group(...Array.from({ length: 9 }, (_, i) => mesh(chipGeo, chipMat, ((i % 3) - 1) * 0.025, 0.13, (Math.floor(i / 3) - 1) * 0.018, 0.2 * sin(i * 2.3), 0, 0.25 * cos(i * 1.3))));
  chips.name = 'chips';
  const g = group(mesh(body, paper), mesh(new THREE.PlaneGeometry(0.07, 0.07), logo, 0, 0.065, 0.036), chips);
  g.position.set(0, -0.02, 0.05);
  return group(g);
}

/** A little steel chip station on legs with a heat lamp over it, its top at y = 0. */
function chipStation() {
  const steel = mat('#b9bec5', { metalness: 0.3, roughness: 0.35 });
  const top = new THREE.BoxGeometry(0.26, 0.05, 0.22);
  const leg = new THREE.CylinderGeometry(0.01, 0.01, 1, 6);
  leg.translate(0, -0.5, 0);
  const heap = new THREE.ConeGeometry(0.09, 0.05, 7);
  const g = group(mesh(top, steel, 0, -0.025, 0), mesh(heap, mat('#f2c04a', { emissive: '#7a4e08', emissiveIntensity: 0.3 }), 0, 0.02, 0));
  for (const [x, z] of [[-0.11, -0.09], [0.11, -0.09], [-0.11, 0.09], [0.11, 0.09]]) {
    const l = mesh(leg, steel, x, -0.05, z);
    l.name = 'leg';
    g.add(l);
  }
  const lamp = sprite('#ff8a3a');
  lamp.position.y = 0.14;
  lamp.scale.setScalar(0.12);
  g.add(lamp);
  return g;
}

/** A gold medal on a red ribbon: the ribbon a loop round the neck at y = 0, the medal hanging at the front. */
function medal() {
  const ribbon = new THREE.TorusGeometry(1, 0.13, 4, 18);
  const ring = mesh(ribbon, mat('#c8323c'), 0, 0, 0, PI / 2);
  ring.name = 'ring';
  const disc = new THREE.CylinderGeometry(0.045, 0.045, 0.012, 14);
  const star = new THREE.Shape();
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * TAU + PI / 2;
    const r = i % 2 ? 0.012 : 0.03;
    star[i ? 'lineTo' : 'moveTo'](cos(a) * r, sin(a) * r);
  }
  const starGeo = new THREE.ExtrudeGeometry(star, { depth: 0.006, bevelEnabled: false });
  const m = group(mesh(disc, GOLD(), 0, 0, 0, PI / 2), mesh(starGeo, mat('#fff1b8', { emissive: '#8a6a10', emissiveIntensity: 0.5 }), 0, 0, 0.004), mesh(new THREE.BoxGeometry(0.03, 0.05, 0.006), mat('#2f5fb3'), 0, 0.045, -0.004));
  m.name = 'disc';
  return group(ring, m);
}

/** The big cup: standing on its base at y = 0, about 0.4 m tall. */
function trophy() {
  const pts = [
    [0.0, 0.0],
    [0.06, 0.0],
    [0.05, 0.03],
    [0.02, 0.06],
    [0.018, 0.13],
    [0.05, 0.16],
    [0.1, 0.22],
    [0.12, 0.32],
    [0.125, 0.36],
    [0.115, 0.36],
  ].map(([x, y]) => new THREE.Vector2(x, y));
  const cup = new THREE.LatheGeometry(pts, 14);
  const handle = new THREE.TorusGeometry(0.055, 0.012, 6, 12, PI);
  const base = new THREE.BoxGeometry(0.15, 0.06, 0.15);
  const plate = mat('#3a2418', { roughness: 0.5 });
  return group(
    mesh(base, plate, 0, 0.03, 0),
    mesh(cup, GOLD(), 0, 0.06, 0),
    mesh(handle, GOLD(), 0.12, 0.33, 0, 0, 0, -PI / 2),
    mesh(handle, GOLD(), -0.12, 0.33, 0, 0, 0, PI / 2),
  );
}

/** The novelty cheque, 1 m wide (scaled), facing +z. */
function cheque() {
  const face = pictured('cheque', 512, 224, (g) => {
    g.fillStyle = '#fbf6e6';
    g.fillRect(0, 0, 512, 224);
    g.fillStyle = '#e9dfc0';
    for (let y = 0; y < 224; y += 8) g.fillRect(0, y, 512, 3);
    g.strokeStyle = '#2f6b4f';
    g.lineWidth = 10;
    g.strokeRect(8, 8, 496, 208);
    g.fillStyle = '#2f6b4f';
    g.font = '700 22px Georgia, serif';
    g.fillText('BANK OF RAVENSWOOD', 26, 44);
    g.textAlign = 'right';
    g.font = '18px Georgia, serif';
    g.fillText('Date: Game over', 486, 44);
    g.textAlign = 'left';
    g.fillStyle = '#3b2a20';
    g.font = '20px Georgia, serif';
    g.fillText('Pay', 26, 96);
    g.font = 'italic 700 30px Georgia, serif';
    g.fillText('The Winner', 74, 98);
    g.fillRect(70, 106, 260, 2);
    g.font = 'italic 22px Georgia, serif';
    g.fillText('One million dollars only', 26, 146);
    g.fillRect(26, 154, 300, 2);
    g.strokeStyle = '#3b2a20';
    g.lineWidth = 3;
    g.strokeRect(350, 76, 140, 48);
    g.font = '900 30px "Arial Black", Arial, sans-serif';
    g.textAlign = 'center';
    g.fillText('$1,000,000', 420, 112);
    g.font = 'italic 26px "Brush Script MT", cursive';
    g.fillText('The Storyteller', 410, 190);
    g.fillRect(340, 196, 150, 2);
  });
  const card = new THREE.BoxGeometry(1, 0.44, 0.012);
  return group(mesh(card, mat('#fbf6e6')), mesh(new THREE.PlaneGeometry(1, 0.44), face, 0, 0, 0.007));
}

/** A crown 1 m across (scaled), its band's bottom at y = 0. */
function crown() {
  const band = new THREE.CylinderGeometry(0.5, 0.46, 0.3, 10, 1, true);
  band.translate(0, 0.15, 0);
  const spike = new THREE.ConeGeometry(0.11, 0.28, 4);
  const ball = new THREE.IcosahedronGeometry(0.05, 0);
  const gem = new THREE.OctahedronGeometry(0.07, 0);
  const g = group(mesh(band, mat('#f2c14e', { metalness: 0.3, roughness: 0.35, emissive: '#7a5410', emissiveIntensity: 0.45, side: THREE.DoubleSide })));
  g.add(mesh(new THREE.SphereGeometry(0.42, 10, 6, 0, TAU, 0, PI / 2), mat('#7a2a8a'), 0, 0.12, 0));
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * TAU;
    g.add(mesh(spike, GOLD(), sin(a) * 0.48, 0.42, cos(a) * 0.48));
    g.add(mesh(ball, GOLD(), sin(a) * 0.48, 0.58, cos(a) * 0.48));
    g.add(mesh(gem, mat(i % 2 ? '#3a7be0' : '#d8304a', { roughness: 0.2, metalness: 0.2 }), sin(a + 0.63) * 0.5, 0.15, cos(a + 0.63) * 0.5));
  }
  return g;
}

/** The royal cape: red velvet round the back, hanging 1 m from y = 0 (scaled), with an ermine collar. */
function cape() {
  const cloth = new THREE.CylinderGeometry(1, 1.5, 1, 12, 3, true, PI * 0.58, PI * 0.84);
  cloth.translate(0, -0.5, 0);
  const collar = new THREE.TorusGeometry(1.02, 0.1, 5, 12, PI * 0.9);
  const g = group(mesh(cloth, mat('#a51f34', { side: THREE.DoubleSide, roughness: 0.8 })), mesh(collar, mat('#f6f1e6', { roughness: 0.9 }), 0, 0, 0, PI / 2, 0, -PI * 0.95));
  return g;
}

/** A gold post with a red velvet rope across to the next one, `len` apart along z (made once, scaled after). */
function rope() {
  const post = new THREE.CylinderGeometry(0.02, 0.02, 0.42, 8);
  post.translate(0, 0.21, 0);
  const foot = new THREE.CylinderGeometry(0.07, 0.08, 0.02, 10);
  const knob = new THREE.SphereGeometry(0.03, 8, 6);
  const curve = new THREE.QuadraticBezierCurve3(new THREE.Vector3(0, 0.4, 0), new THREE.Vector3(0, 0.22, 0.5), new THREE.Vector3(0, 0.4, 1));
  const cord = new THREE.TubeGeometry(curve, 10, 0.014, 5);
  const g = group(mesh(cord, mat('#b3233a', { roughness: 0.8 })));
  for (const z of [0, 1]) g.add(mesh(post, GOLD(), 0, 0, z), mesh(foot, GOLD(), 0, 0.01, z), mesh(knob, GOLD(), 0, 0.43, z));
  return g;
}

/** A mic stand 1 m tall to the mic (scaled), standing on y = 0. */
function micStand() {
  const pole = new THREE.CylinderGeometry(0.012, 0.012, 1, 8);
  pole.translate(0, 0.5, 0);
  const foot = new THREE.CylinderGeometry(0.12, 0.13, 0.03, 12);
  const clip = new THREE.CylinderGeometry(0.015, 0.012, 0.1, 8);
  const head = new THREE.SphereGeometry(0.04, 12, 8);
  const black = mat('#26262b', { metalness: 0.3, roughness: 0.4 });
  return group(mesh(pole, black), mesh(foot, black, 0, 0.015, 0), mesh(clip, black, 0, 1.0, 0.03, PI / 3), mesh(head, mat('#9a9ea6', { metalness: 0.3, roughness: 0.35 }), 0, 1.04, 0.06));
}

/** A rose on its stem, 0.2 m long along +y. */
function rose() {
  const stem = new THREE.CylinderGeometry(0.006, 0.006, 0.2, 5);
  stem.translate(0, 0.1, 0);
  const bud = new THREE.IcosahedronGeometry(0.03, 0);
  const leaf = new THREE.ConeGeometry(0.018, 0.05, 3);
  return group(mesh(stem, mat('#3f8a3a')), mesh(bud, mat('#d82a45', { roughness: 0.5 }), 0, 0.21, 0), mesh(leaf, mat('#4ea248'), 0.02, 0.1, 0, 0, 0, -0.9));
}

/** A cone of light coming down from 1 m up onto a pool on the floor (scaled). */
function spotlight() {
  const cone = new THREE.ConeGeometry(0.55, 1, 20, 1, true);
  cone.translate(0, 0.5, 0);
  const pool = new THREE.CircleGeometry(0.55, 24);
  return group(mesh(cone, glow('#fff1c8', 0.09, THREE.DoubleSide)), mesh(pool, glow('#fff1c8', 0.25), 0, 0.006, 0, -PI / 2));
}

function coin() {
  return mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.01, 10), mat('#ffd34d', { metalness: 0.2, roughness: 0.35, emissive: '#a07010', emissiveIntensity: 0.6 }), 0, 0, 0, PI / 2);
}

function note() {
  const face = pictured('note', 64, 32, (g) => {
    g.fillStyle = '#7fc27a';
    g.fillRect(0, 0, 64, 32);
    g.strokeStyle = '#2f6b3a';
    g.lineWidth = 3;
    g.strokeRect(3, 3, 58, 26);
    g.fillStyle = '#2f6b3a';
    g.font = '900 22px Arial, sans-serif';
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillText('$', 32, 17);
  });
  return mesh(new THREE.PlaneGeometry(0.09, 0.045), face);
}

/** A wad of notes, held in the paw. */
function wad() {
  const stack = new THREE.BoxGeometry(0.09, 0.03, 0.05);
  const band = new THREE.BoxGeometry(0.02, 0.032, 0.052);
  return group(mesh(stack, mat('#7fc27a'), 0, 0.02, 0.03), mesh(band, mat('#e8d9a0'), 0, 0.02, 0.03));
}

/** The jetpack: two tanks side by side on a back plate, nozzles at the bottom, flames below them (named). */
function jetpack() {
  const tank = new THREE.CapsuleGeometry(0.045, 0.16, 3, 10);
  const plate = new THREE.BoxGeometry(0.2, 0.2, 0.025);
  const nozzle = new THREE.CylinderGeometry(0.025, 0.04, 0.05, 10);
  const flame = new THREE.ConeGeometry(0.04, 1, 10, 1, true);
  flame.rotateX(PI);
  flame.translate(0, -0.5, 0);
  const g = group(mesh(plate, mat('#5a5f69'), 0, 0, 0.03));
  for (const x of [-0.075, 0.075]) {
    g.add(mesh(tank, mat('#d64a3a', { metalness: 0.3, roughness: 0.4 }), x, 0, 0), mesh(nozzle, SILVER(), x, -0.15, 0));
    const f = group(mesh(flame, glow('#ff9a2e', 0.85, THREE.FrontSide, false)), mesh(new THREE.ConeGeometry(0.022, 0.6, 8, 1, true).rotateX(PI).translate(0, -0.3, 0), glow('#fff3c0', 0.95, THREE.FrontSide, false)));
    f.position.set(x, -0.175, 0);
    f.name = 'flame';
    g.add(f);
  }
  return g;
}

/** A grey puff of smoke (or, in the explosion's colours, of fire). */
const puffGeo = () => (built.get('puffGeo') as THREE.Mesh | undefined)?.geometry ?? (built.set('puffGeo', new THREE.Mesh(new THREE.IcosahedronGeometry(1, 1))), (built.get('puffGeo') as THREE.Mesh).geometry);
function puff(color: string, emissive = '#000000') {
  return mesh(puffGeo(), mat(color, { emissive, emissiveIntensity: emissive === '#000000' ? 0 : 0.8, roughness: 0.9 }));
}

/** The cartoon explosion: a heap of fire puffs round a bright middle, under a cap of smoke (1 m high, scaled). */
function explosion() {
  const g = group();
  const fire = ['#ffd24a', '#ff9a2e', '#f2552c'];
  for (let i = 0; i < 9; i++) {
    const a = i * 2.4;
    const r = 0.18 + (i % 3) * 0.08;
    const p = puff(fire[i % 3], fire[i % 3]);
    p.position.set(sin(a) * r, 0.25 + (i % 4) * 0.12, cos(a) * r * 0.5);
    p.scale.setScalar(0.17 + (2 - (i % 3)) * 0.04);
    p.userData.s = p.scale.x;
    p.name = 'fire';
    g.add(p);
  }
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * TAU;
    const p = puff(i % 2 ? '#6d6470' : '#857b86');
    p.position.set(sin(a) * 0.22, 0.78 + (i % 2) * 0.06, cos(a) * 0.12);
    p.scale.setScalar(0.16);
    p.userData.s = p.scale.x;
    p.name = 'smoke';
    g.add(p);
  }
  // (A flat spiky star behind, the cartoon "boom".)
  const star = new THREE.Shape();
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * TAU;
    const r = i % 2 ? 0.28 : 0.55;
    star[i ? 'lineTo' : 'moveTo'](cos(a) * r, sin(a) * r);
  }
  const boom = mesh(new THREE.ShapeGeometry(star), glow('#ffe066', 0.85, THREE.DoubleSide), 0, 0.45, -0.25);
  boom.name = 'boom';
  g.add(boom);
  return g;
}

/** A cartoon storm cloud. */
function cloud() {
  const g = group();
  for (let i = 0; i < 5; i++) {
    const p = puff(i % 2 ? '#4a4d5c' : '#5c6070');
    p.position.set((i - 2) * 0.15, abs(i - 2) < 1 ? 0.06 : 0, (i % 2) * 0.05);
    p.scale.setScalar(abs(i - 2) < 1 ? 0.17 : 0.13);
    g.add(p);
  }
  return g;
}

/** A sword, the grip in the paw and the blade straight up, about 0.6 m. */
function sword() {
  const blade = new THREE.CylinderGeometry(0.004, 0.022, 0.48, 4);
  blade.scale(1, 1, 0.3);
  blade.translate(0, 0.32, 0);
  const guard = new THREE.BoxGeometry(0.13, 0.02, 0.025);
  const grip = new THREE.CylinderGeometry(0.012, 0.012, 0.09, 6);
  const pommel = new THREE.OctahedronGeometry(0.02, 0);
  return group(
    mesh(blade, mat('#dfe6f0', { metalness: 0.35, roughness: 0.2, emissive: '#3a4a66', emissiveIntensity: 0.3 })),
    mesh(guard, GOLD(), 0, 0.075, 0),
    mesh(grip, mat('#5a3420'), 0, 0.02, 0),
    mesh(pommel, GOLD(), 0, -0.035, 0),
  );
}

/** A shared thin box, one long along y, for the lightning's zig-zags and the selfie stick. */
function rod() {
  const geo = new THREE.CylinderGeometry(1, 1, 1, 5);
  geo.translate(0, 0.5, 0);
  return geo;
}
const rodGeo = () => (built.get('rod') as THREE.Mesh | undefined)?.geometry ?? (built.set('rod', new THREE.Mesh(rod())), (built.get('rod') as THREE.Mesh).geometry);

function phone() {
  const body = new THREE.BoxGeometry(0.055, 0.1, 0.01);
  const screen = new THREE.PlaneGeometry(0.047, 0.088);
  const lens = new THREE.CylinderGeometry(0.008, 0.008, 0.004, 8);
  return group(
    mesh(body, mat('#2a2c33')),
    mesh(screen, glow('#8fd0ff', 0.9), 0, 0, 0.0055),
    mesh(lens, mat('#111'), 0.015, 0.035, -0.006, PI / 2),
  );
}

/** Headphones 1 m across (scaled): a band over the top and a cup each side, centred on the head. */
function headphones() {
  const band = new THREE.TorusGeometry(0.5, 0.05, 5, 16, PI);
  const cup = new THREE.CylinderGeometry(0.17, 0.17, 0.12, 12);
  const dark = mat('#2a2c33', { roughness: 0.5 });
  const pad = mat('#e0505a', { roughness: 0.6 });
  return group(mesh(band, dark), mesh(cup, pad, 0.5, 0, 0, 0, 0, PI / 2), mesh(cup, pad, -0.5, 0, 0, 0, 0, PI / 2));
}

/** The DJ's booth: a front panel lit up, the deck on top with two turntables and a mixer, its top at y = 0. */
function booth() {
  const front = new THREE.BoxGeometry(1, 1, 0.05);
  front.translate(0, -0.5, 0);
  const top = new THREE.BoxGeometry(1.04, 0.05, 0.42);
  const deck = new THREE.CylinderGeometry(0.15, 0.15, 0.03, 16);
  const record = new THREE.CylinderGeometry(0.13, 0.13, 0.01, 16);
  const label = new THREE.CylinderGeometry(0.04, 0.04, 0.012, 10);
  const mixer = new THREE.BoxGeometry(0.2, 0.04, 0.24);
  const knob = new THREE.BoxGeometry(0.025, 0.02, 0.025);
  const bar = new THREE.BoxGeometry(0.07, 1, 0.01);
  bar.translate(0, 0.5, 0);
  const g = group(mesh(front, mat('#2a2633')), mesh(top, mat('#3a3545'), 0, 0.025, -0.19));
  const face = pictured('booth', 256, 64, (c) => {
    c.fillStyle = '#2a2633';
    c.fillRect(0, 0, 256, 64);
    c.fillStyle = '#ffd34d';
    c.font = '900 40px "Arial Black", Arial, sans-serif';
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    c.fillText('DJ WIN', 128, 34);
  });
  g.add(mesh(new THREE.PlaneGeometry(0.6, 0.15), face, 0, -0.12, 0.027));
  for (const x of [-0.31, 0.31]) {
    g.add(mesh(deck, mat('#5a5f69', { metalness: 0.5 }), x, 0.065, -0.2));
    const r = group(mesh(record, mat('#16161a', { roughness: 0.3 })), mesh(label, mat(x < 0 ? '#e0505a' : '#ffd34d'), 0, 0.002, 0), mesh(knob, mat('#c9ced6'), 0.09, 0.01, 0));
    r.position.set(x, 0.085, -0.2);
    r.name = 'record';
    g.add(r);
  }
  g.add(mesh(mixer, mat('#1d1b24'), 0, 0.07, -0.2));
  const lights = ['#ff5d6c', '#ffd34d', '#7cff9a', '#7cc4ff', '#b46bff'];
  for (let i = 0; i < 6; i++) g.add(mesh(knob, glow(lights[i % lights.length]), -0.06 + (i % 3) * 0.06, 0.095, -0.26 + Math.floor(i / 3) * 0.1));
  for (let i = 0; i < 5; i++) {
    const b = mesh(bar, glow(lights[i]), -0.36 + i * 0.18, -0.95, 0.03);
    b.name = 'bar';
    g.add(b);
  }
  return g;
}

/** Sunglasses 1 m across (scaled), centred between the eyes, facing +z. */
function shades() {
  const lens = new THREE.BoxGeometry(0.4, 0.24, 0.05);
  const bridge = new THREE.BoxGeometry(0.2, 0.05, 0.04);
  const arm = new THREE.BoxGeometry(0.04, 0.04, 0.6);
  const black = mat('#141418', { roughness: 0.15, metalness: 0.4 });
  return group(mesh(lens, black, 0.27, 0, 0), mesh(lens, black, -0.27, 0, 0), mesh(bridge, black, 0, 0.06, 0), mesh(arm, black, 0.49, 0.06, -0.3), mesh(arm, black, -0.49, 0.06, -0.3));
}

// ---------------------------------------------------------------- the shows

/** A fixed random number from 0 to 1 for each `i` (and `salt`), so everyone's confetti falls the same. */
const rnd = (i: number, salt = 0) => {
  const x = sin(i * 127.1 + salt * 311.7) * 43758.5453;
  return x - Math.floor(x);
};
const FIREWORK = ['#ff6b8a', '#ffd34d', '#7cc4ff', '#9dff8a', '#c58bff', '#ff9a3a'];
const CONFETTI = ['#ff5d6c', '#ffd34d', '#7cc4ff', '#7cff9a', '#ff9ae0', '#ffffff'];

type Tick = (d: number, s: WinSpots, perched: boolean) => void;
type Put = (parent: THREE.Object3D, o: THREE.Object3D) => THREE.Object3D;

/** Sets each move's props up on the rig, and returns what moves them each frame. */
function stage(id: VictoryId, r: WinRig, put: Put): Tick | null {
  const top = r.headC.y + r.headR.y;
  const size = propSize(top);
  /** A spot in body space, as a place on a bone. */
  const on = (bone: 'body' | 'neck', x: number, y: number, z: number) => {
    const b = r.rest.get(bone) ?? new THREE.Vector3();
    return new THREE.Vector3(x - b.x, y - b.y, z - b.z);
  };
  const hipY = r.rest.get('legL')?.y ?? r.shoulder.y * 0.5;
  const sh = r.shoulder;
  /** Small things in the paw grow a little with the animal, but not as much. */
  const hs = 0.75 + 0.25 * size;
  switch (id) {
    case 'skyshow': {
      // Three rockets a loop, going up behind and bursting where the paw points (see victoryMoves2.ts).
      const bursts = [0, 1, 2].map((k) => {
        const trail = put(r.root, sprite('#ffcf7a'));
        const stars = Array.from({ length: 14 }, (_, i) => put(r.root, sprite(FIREWORK[(k * 2 + (i % 2)) % FIREWORK.length], i % 3 ? 'dot' : 'twinkle')));
        return { trail, stars };
      });
      const sides = [0.5, -0.6, 0.1];
      return (d) => {
        const c = d % 4.5;
        bursts.forEach((b, k) => {
          const u = (c - k * 1.5 + 4.5) % 4.5;
          const at = new THREE.Vector3(sides[k] * 1.1 * size, top + (1.05 + (k % 2) * 0.3) * size, -1.4 * size);
          const rise = u < 0.45;
          b.trail.visible = rise;
          if (rise) {
            const k2 = smooth(u, 0, 0.45);
            b.trail.position.set(at.x * k2, top * 0.6 + (at.y - top * 0.6) * k2, at.z);
            b.trail.scale.setScalar(0.12 * size);
          }
          const v = u - 0.45;
          const live = v > 0 && v < 1.3;
          b.stars.forEach((s, i) => {
            s.visible = live;
            if (!live) return;
            // (Spread round a ball, by the golden angle.)
            const y = 1 - (i + 0.5) / 7;
            const ring = sqrt(max(0, 1 - y * y));
            const a = i * 2.4;
            const out = (1 - Math.exp(-v * 5)) * 0.85 * size;
            s.position.set(at.x + cos(a) * ring * out, at.y + y * out * 0.85 - v * v * 0.25, at.z + sin(a) * ring * out * 0.6);
            s.scale.setScalar((0.16 + (i % 3 ? 0 : 0.08)) * size * (1 - smooth(v, 0.7, 1.3)));
          });
        });
      };
    }
    case 'coolwalk': {
      const glasses = put(r.neck, prop('shades', shades));
      const ew = max(abs(r.eyePos.x) * 2.6, 0.08);
      glasses.scale.setScalar(ew);
      glasses.position.copy(on('neck', 0, r.eyePos.y + 0.005, max(r.eyePos.z, r.headC.z + r.headR.z * 0.8) + 0.02));
      const boom = put(r.root, prop('explosion', explosion));
      const flash = put(r.root, sprite('#fff3c0'));
      const fire: THREE.Object3D[] = [];
      const smoke: THREE.Object3D[] = [];
      boom.traverse((o) => (o.name === 'fire' ? fire.push(o) : o.name === 'smoke' ? smoke.push(o) : 0));
      const star = boom.getObjectByName('boom')!;
      return (d) => {
        const c = d % 5;
        // In with a bang (overshooting a little), rumbling, then dying down into the smoke.
        const grow = c < 0.4 ? 1.15 * smooth(c, 0, 0.25) - 0.15 * smooth(c, 0.25, 0.4) : 1;
        const fade = 1 - smooth(c, 3.7, 4.8);
        const s = 1.15 * size;
        boom.scale.setScalar(s * grow);
        boom.position.set(0, 0, -1.05 * size);
        fire.forEach((p, i) => p.scale.setScalar(p.userData.s * fade * (1 + sin(d * 9 + i * 1.7) * 0.08)));
        smoke.forEach((p, i) => {
          p.scale.setScalar(p.userData.s * (0.8 + smooth(c, 0.3, 4.6) * 0.8) * (1 - smooth(c, 4.6, 5)));
          p.position.y = 0.78 + (i % 2) * 0.06 + smooth(c, 0.3, 4.8) * 0.3;
        });
        star.visible = c < 2.4;
        star.scale.setScalar((1 + sin(d * 20) * 0.04) * (1 - smooth(c, 1.6, 2.4)));
        flash.visible = c < 0.5;
        flash.position.set(0, top * 0.8, -0.9 * size);
        flash.scale.setScalar(2.4 * size * (1 - smooth(c, 0.05, 0.5)));
      };
    }
    case 'podium': {
      const p = put(r.root, prop('podium', podium));
      const w = max(0.7 * size, abs(sh.x) * 2 + 0.3);
      return (d, _s, perched) => {
        p.visible = !perched;
        p.scale.set(w, podiumHeight(size) * smooth(d, 0, 0.6) + 0.001, w);
      };
    }
    case 'fries': {
      const sc = put(r.hand, prop('scoop', scoop));
      const bg = put(r.handL(), prop('bag', bag));
      sc.scale.setScalar(hs * 1.4);
      bg.scale.setScalar(hs * 1.3);
      const station = put(r.root, prop('chipStation', chipStation));
      station.scale.setScalar(hs);
      station.position.set(-0.16, hipY - 0.02, r.front + 0.12 + 0.15 * hs);
      station.traverse((o) => o.name === 'leg' && o.scale.set(1, (hipY - 0.07) / hs, 1));
      const inScoop = sc.getObjectByName('chips')!;
      const inBag = bg.getObjectByName('chips')!;
      // (A few chips that fall from the scoop into the bag as it's tipped.)
      const falling = [0, 1, 2, 3].map(() => put(r.float, prop('chip', () => mesh(new THREE.BoxGeometry(0.012, 0.07, 0.012), mat('#f2c04a', { emissive: '#7a4e08', emissiveIntensity: 0.25 })))));
      return (d, s, perched) => {
        const c = d % 4;
        station.visible = !perched;
        inScoop.visible = c > 0.5 && c < 1.65;
        inBag.visible = c > 1.85 || c < 0.2;
        inBag.scale.y = c > 1.85 ? smooth(c, 1.85, 2.1) : 1;
        falling.forEach((f, i) => {
          const u = (c - 1.5 - i * 0.07) / 0.35;
          f.visible = u > 0 && u < 1;
          if (!f.visible) return;
          f.position.lerpVectors(s.hand, s.handL, u);
          f.position.y += 0.06 * hs + sin(u * PI) * 0.04 - u * 0.04;
          f.rotation.set(u * 4 + i, i, u * 3);
          f.scale.setScalar(hs);
        });
      };
    }
    case 'medal': {
      const m = put(r.neck, prop('medal', medal));
      const ring = m.getObjectByName('ring')!;
      const disc = m.getObjectByName('disc')!;
      // A loop round the neck, from the back of it down to the chest at the front, where the medal hangs.
      const R = max(r.headR.x * 0.7, abs(sh.x) * 0.75, 0.07);
      const neck = r.rest.get('neck')!;
      const mid = new THREE.Vector3(0, neck.y + 0.02, neck.z);
      const backAt = new THREE.Vector3(0, mid.y, min(mid.z - R * 0.7, r.back + 0.02));
      const chest = new THREE.Vector3(0, min(sh.y - 0.02, neck.y - 0.05), r.front + 0.01);
      const span = new THREE.Vector3().subVectors(chest, backAt);
      ring.scale.set(R, span.length() / 2, R);
      ring.rotation.set(Math.atan2(span.z, span.y), 0, 0);
      ring.position.addVectors(backAt, chest).multiplyScalar(0.5).sub(mid);
      disc.position.copy(chest).sub(mid).setZ(chest.z - mid.z + 0.012);
      disc.scale.setScalar(hs * 1.4);
      const drop = mid.y - chest.y;
      const twinkle = put(r.neck, sprite('#fff3b0', 'twinkle'));
      const base = on('neck', mid.x, mid.y, mid.z);
      return (d) => {
        const c = d % 5;
        // Down from above the head, onto the neck.
        const fall = 1 - smooth(c, 0.1, 1.1);
        m.position.copy(base).setY(base.y + fall * (top - mid.y + 0.5 * size));
        m.visible = c < 4.85;
        const tw = smooth(c, 1.1, 1.3) * (1 - smooth(c, 1.5, 2)) + (c > 2.2 && c < 4 ? 0.4 + 0.3 * sin(d * 7) : 0);
        twinkle.visible = tw > 0.02;
        twinkle.position.set(base.x + 0.02, base.y - drop + 0.02, base.z + (chest.z - mid.z) + 0.03);
        twinkle.scale.setScalar(0.12 * tw * hs);
      };
    }
    case 'trophy': {
      const cup = put(r.float, prop('trophy', trophy));
      cup.scale.setScalar(hs);
      const bits = Array.from({ length: 36 }, (_, i) =>
        put(r.root, prop(`confetti${i % CONFETTI.length}`, () => mesh(new THREE.PlaneGeometry(0.035, 0.02), mat(CONFETTI[i % CONFETTI.length], { side: THREE.DoubleSide, emissive: CONFETTI[i % CONFETTI.length], emissiveIntensity: 0.25 })))),
      );
      return (d, s) => {
        // Between the paws, the base sat in them, never down into the head.
        cup.position.set((s.hand.x + s.handL.x) / 2, max((s.hand.y + s.handL.y) / 2 - 0.04, s.top + 0.02), (s.hand.z + s.handL.z) / 2);
        cup.rotation.y = sin(d * 1.5) * 0.3;
        bits.forEach((b, i) => {
          const period = 2.2 + rnd(i) * 0.8;
          const u = ((d + rnd(i, 1) * period) % period) / period;
          const a = rnd(i, 2) * TAU;
          const rr = (0.15 + rnd(i, 3) * 0.6) * size;
          b.position.set(cos(a) * rr + sin(d * 2 + i) * 0.05, (top + 1.1 * size) * (1 - u), sin(a) * rr * 0.7 + 0.15);
          b.rotation.set(d * (3 + rnd(i, 4) * 4), d * 2 + i, d * (2 + rnd(i, 5) * 3));
          b.visible = d > 0.3;
        });
      };
    }
    case 'cheque': {
      const card = put(r.float, prop('cheque', cheque));
      const w = max(0.62 * size, abs(sh.x) * 2 + 0.25);
      card.scale.setScalar(w);
      const q = new THREE.Quaternion();
      const qf = new THREE.Quaternion();
      const turn = new THREE.Euler();
      return (_d, s) => {
        card.position.set((s.hand.x + s.handL.x) / 2, (s.hand.y + s.handL.y) / 2 + 0.03, (s.hand.z + s.handL.z) / 2 + 0.02);
        // (Turned as the body turns: the paws can be anywhere, a snail's crossed.)
        r.body.getWorldQuaternion(q).premultiply(r.float.getWorldQuaternion(qf).invert());
        turn.setFromQuaternion(q, 'YXZ');
        card.rotation.set(-0.08, turn.y, 0);
      };
    }
    case 'crowned': {
      const c0 = put(r.neck, prop('crown', crown));
      const cr = max(r.headR.x * 1.25, 0.12);
      c0.scale.set(cr, cr * 0.9, cr);
      const seat = on('neck', 0, top - r.headR.y * 0.12, r.headC.z);
      const robe = put(r.body, prop('cape', cape));
      const R = max(abs(sh.x) + 0.03, (r.front - r.back) / 2 + 0.03);
      const H = max(0.15, sh.y * 0.88);
      robe.scale.set(R, H, R);
      robe.position.copy(on('body', 0, sh.y + 0.02, (r.front + r.back) / 2));
      const sparkle = [0, 1, 2].map(() => put(r.neck, sprite('#fff3b0', 'twinkle')));
      return (d) => {
        const c = d % 5;
        const fall = 1 - smooth(c, 0.1, 1.1);
        c0.position.copy(seat).setY(seat.y + fall * 0.55 * size);
        c0.visible = c < 4.85;
        c0.rotation.y = fall * 1.2;
        const sw = smooth(c, 1.5, 2.6);
        const flare = sin(sw * PI);
        robe.rotation.set(0.15 + flare * 0.6, -flare * 0.6, flare * 0.15);
        sparkle.forEach((sp, i) => {
          const k = smooth(c, 1.05 + i * 0.1, 1.2 + i * 0.1) * (1 - smooth(c, 1.4 + i * 0.1, 1.9 + i * 0.1));
          sp.visible = k > 0.02;
          sp.position.copy(seat).add(new THREE.Vector3((i - 1) * cr * 0.6, 0.35 * cr + (i % 2) * 0.04, 0.3 * cr));
          sp.scale.setScalar(0.12 * k * hs);
        });
      };
    }
    case 'redcarpet': {
      const w = 0.95 * size;
      const carpet = put(r.root, prop('carpet', () => mesh(new THREE.BoxGeometry(1, 0.01, 1).translate(0, 0.005, 0), mat('#b3233a', { roughness: 0.95 }))));
      carpet.scale.set(w, 1, 1.9 * size);
      carpet.position.set(0, 0, 0.35 * size);
      const ropes = [1, -1].map((side) => {
        const o = put(r.root, prop('rope', rope));
        o.scale.set(hs, hs, 0.9 * size);
        o.position.set(side * (w / 2 + 0.06), 0, -0.05 * size);
        return o;
      });
      const flashes = Array.from({ length: 10 }, (_, i) => put(r.root, sprite(i % 3 ? '#ffffff' : '#fff6c8', 'twinkle')));
      return (d, _s, perched) => {
        carpet.visible = !perched;
        for (const o of ropes) o.visible = !perched;
        // Each flash goes off at its own moment in the loop (a few at once, now and then), from in front.
        const c = d % 4;
        flashes.forEach((f, i) => {
          let best = 1;
          for (let k = 0; k < 3; k++) {
            const at = rnd(i * 3 + k, 7) * 4;
            const u = (c - at + 4) % 4;
            if (u < 0.18) best = min(best, u);
          }
          f.visible = best < 0.18;
          if (!f.visible) return;
          const side = i % 2 ? 1 : -1;
          f.position.set(side * (0.5 + rnd(i, 8) * 0.35) * size, (0.25 + rnd(i, 9) * 0.9) * top + 0.1, (0.55 + rnd(i, 10) * 0.6) * size);
          f.scale.setScalar(0.6 * size * (1 - best / 0.18));
        });
      };
    }
    case 'encore': {
      const stand = put(r.root, prop('micStand', micStand));
      const standH = max(0.2, r.mouth.y - 0.06);
      stand.scale.set(hs, standH, hs);
      // (Its mic would be squashed with the pole: it's put back to size.)
      stand.children.slice(2).forEach((o) => o.scale.set(1, hs / standH, 1));
      stand.position.set(0, 0, r.front + r.pawR + 0.13);
      const light = put(r.root, prop('spotlight', spotlight));
      light.scale.set(size, top + 2.2 * size, size);
      const roses = Array.from({ length: 7 }, () => put(r.root, prop('rose', rose)));
      return (d, _s, perched) => {
        stand.visible = !perched;
        const c = d % 5;
        roses.forEach((o, i) => {
          const t0 = 1.75 + i * 0.17;
          const u = (c - t0) / 0.6;
          o.visible = u > 0 && c < 4.85;
          if (!o.visible) return;
          o.scale.setScalar(hs * 1.6 * (1 - smooth(c, 4.5, 4.85)));
          const a = (rnd(i, 11) - 0.5) * 2.2;
          const land = new THREE.Vector3(sin(a) * (0.25 + rnd(i, 12) * 0.3) * size, 0.02, (0.25 + rnd(i, 13) * 0.35) * size);
          const from = new THREE.Vector3((rnd(i, 14) - 0.5) * 1.2 * size, 0.4 * size, 2.4 * size);
          if (u < 1) {
            o.position.lerpVectors(from, land, u);
            o.position.y += sin(u * PI) * 0.7 * size;
            o.rotation.set(u * 9 + i, i, u * 5);
          } else {
            o.position.copy(land);
            o.rotation.set(PI / 2, 0, a + i);
          }
        });
      };
    }
    case 'makeitrain': {
      const stack = put(r.hand, prop('wad', wad));
      stack.scale.setScalar(hs);
      const coins = Array.from({ length: 22 }, () => put(r.root, prop('coin', coin)));
      const notes = Array.from({ length: 10 }, () => put(r.float, prop('note', note)));
      return (d, s) => {
        coins.forEach((o, i) => {
          const period = 1.4 + rnd(i, 20) * 0.6;
          const u = ((d + rnd(i, 21) * period) % period) / period;
          const a = rnd(i, 22) * TAU;
          const rr = (0.15 + rnd(i, 23) * 0.6) * size;
          o.position.set(cos(a) * rr, (top + 1.2 * size) * (1 - u), sin(a) * rr * 0.8 + 0.1);
          o.rotation.set(d * 7 + i, d * 3, 0);
          o.visible = d > 0.2;
          o.scale.setScalar(hs * 1.2);
        });
        // A note flicked off the wad every quarter second, up and out, then fluttering down.
        notes.forEach((o, i) => {
          const u = (d * 4 - i + 80) % 10;
          o.visible = u < 2 && d > 0.25;
          if (!o.visible) return;
          const k = u / 2;
          o.position.set(s.hand.x - (0.1 + k * 0.4) * size + sin(k * 9 + i) * 0.05, s.hand.y + 0.05 + sin(k * PI * 0.7) * 0.25 * size - k * k * (s.hand.y + 0.1), s.hand.z + 0.1 + k * 0.25);
          o.rotation.set(k * 6 + i, k * 4, k * 3 + i);
          o.scale.setScalar(hs * 1.7);
        });
      };
    }
    case 'jetpack': {
      const pack = put(r.body, prop('jetpack', jetpack));
      pack.scale.setScalar(hs * 1.3);
      pack.position.copy(on('body', 0, sh.y - 0.12 * hs, r.back - 0.05 * hs));
      const flames: THREE.Object3D[] = [];
      pack.traverse((o) => o.name === 'flame' && flames.push(o));
      const puffs = Array.from({ length: 6 }, () => put(r.root, prop('smoke', () => puff('#d8d2cc'))));
      return (d) => {
        const c = d % 5;
        const lit = smooth(c, 0.3, 0.6) * (1 - smooth(c, 4.6, 4.8));
        const burn = lit * (0.25 + 0.15 * smooth(c, 0.6, 0.9) * (1 - smooth(c, 1.9, 2.4)) + 0.1 * smooth(c, 3.4, 3.8) * (1 - smooth(c, 4.4, 4.7)));
        flames.forEach((f, i) => {
          f.visible = burn > 0.01;
          f.scale.set(1, max(0.01, burn * 1.2 * (1 + sin(d * 40 + i * 2) * 0.15)) * size, 1);
        });
        // Smoke billowing out round the feet at take-off and on landing.
        puffs.forEach((p, i) => {
          const at = i < 3 ? 0.6 : 4.1;
          const u = (c - at - (i % 3) * 0.08) / 1.1;
          p.visible = u > 0 && u < 1;
          if (!p.visible) return;
          const a = (i % 3) * 2.1 + (i < 3 ? 0 : 1);
          p.position.set(cos(a) * u * 0.45 * size, 0.06 + u * 0.08, sin(a) * u * 0.3 * size);
          p.scale.setScalar((0.08 + u * 0.1) * size * (1 - smooth(u, 0.6, 1)));
        });
      };
    }
    case 'djset': {
      const cans = put(r.neck, prop('headphones', headphones));
      const hw = r.headR.x + 0.015;
      cans.scale.setScalar(hw * 2);
      cans.position.copy(on('neck', 0, r.headC.y + 0.01, r.headC.z));
      const deck = put(r.root, prop('booth', booth));
      const deckY = hipY + (sh.y - hipY) * 0.7 - 0.03;
      const dw = max(0.7 * size, abs(sh.x) * 2 + 0.3);
      deck.scale.set(dw, deckY, dw);
      // (Scaled to reach the floor, then the deck on top put back to its own proportions.)
      // (The turntable under the paw, the front panel facing out.)
      deck.position.set(0, deckY, r.front + r.pawR + 0.17 + 0.2 * dw);
      for (const o of deck.children) {
        if (o.position.y <= 0) continue;
        o.scale.set(1, dw / deckY, 1);
        o.position.y *= dw / deckY;
      }
      const records: THREE.Object3D[] = [];
      const bars: THREE.Object3D[] = [];
      deck.traverse((o) => (o.name === 'record' ? records.push(o) : o.name === 'bar' ? bars.push(o) : 0));
      return (d, _s, perched) => {
        deck.visible = !perched;
        records.forEach((o, i) => (o.rotation.y = d * (i ? 3.5 : 3.5 + sin(d * 14) * 3)));
        bars.forEach((o, i) => (o.scale.y = 0.1 + 0.55 * abs(sin(d * PI * 2 + i * 0.9)) * (0.6 + 0.4 * abs(sin(d * 3.1 + i)))));
      };
    }
    case 'selfie': {
      const stick = put(r.float, mesh(rodGeo(), mat('#2a2c33', { metalness: 0.5 })));
      const ph = put(r.float, prop('phone', phone));
      ph.scale.setScalar(hs * 1.5);
      const flash = put(r.float, sprite('#ffffff', 'twinkle'));
      const head = new THREE.Vector3();
      const at = new THREE.Vector3();
      const dir = new THREE.Vector3();
      const up = new THREE.Vector3(0, 1, 0);
      return (d, s) => {
        head.copy(s.head);
        at.set(s.hand.x * 0.4, s.top + 0.22 * size, s.head.z + 0.55 * size);
        dir.subVectors(at, s.hand);
        const len = dir.length();
        stick.position.copy(s.hand);
        stick.scale.set(0.007 * hs, len, 0.007 * hs);
        stick.quaternion.setFromUnitVectors(up, dir.normalize());
        ph.position.copy(at);
        // (The camera on its back looks at the face; the screen faces out.)
        ph.lookAt(ph.parent!.localToWorld(head.clone()));
        ph.rotateY(PI);
        const c = d % 4;
        const u = (c % (4 / 3)) - 1.0;
        flash.visible = u > 0 && u < 0.15;
        flash.position.copy(at).add(new THREE.Vector3(0, 0.03, -0.02));
        flash.scale.setScalar(0.45 * size * (1 - max(0, u) / 0.15));
      };
    }
    case 'excalibur': {
      const blade = put(r.hand, prop('sword', sword));
      blade.scale.setScalar(hs * 1.5);
      const sky = put(r.root, prop('cloud', cloud));
      const shine = put(r.float, sprite('#bfe3ff'));
      const tip = put(r.float, sprite('#ffffff', 'twinkle'));
      const bolt = Array.from({ length: 7 }, () => put(r.float, mesh(rodGeo(), glow('#fffbe0', 1, THREE.FrontSide, false))));
      const halo = Array.from({ length: 7 }, () => put(r.float, mesh(rodGeo(), glow('#8fd0ff', 0.5, THREE.FrontSide, false))));
      // (The bright core drawn over its glow.)
      for (const o of bolt) o.renderOrder = 1;
      const a = new THREE.Vector3();
      const b = new THREE.Vector3();
      const dir = new THREE.Vector3();
      const up = new THREE.Vector3(0, 1, 0);
      return (d, s) => {
        const c = d % 4;
        const loop = Math.floor(d / 4);
        const end = new THREE.Vector3(s.hand.x, s.hand.y + 0.56 * hs * 1.5, s.hand.z);
        const cloudK = smooth(c, 0.2, 0.6) * (1 - smooth(c, 3.4, 3.9));
        sky.visible = cloudK > 0.01;
        sky.scale.setScalar(size * 1.4 * cloudK);
        sky.position.set(end.x, end.y + 0.95 * size, end.z);
        // The strike, flickering, and a smaller one after.
        const strike = (c > 0.72 && c < 1.15) || (c > 2.3 && c < 2.48);
        const on = strike && sin(c * 90) > -0.7;
        const skyY = end.y + 0.9 * size;
        let prev = a.set(end.x, skyY, end.z);
        bolt.forEach((seg, i) => {
          const k = (i + 1) / bolt.length;
          const next = i === bolt.length - 1 ? b.copy(end) : b.set(end.x + (rnd(i, loop * 2 + (c > 2 ? 1 : 0)) - 0.5) * 0.35 * size, skyY + (end.y - skyY) * k, end.z + (rnd(i, 40 + loop) - 0.5) * 0.15);
          dir.subVectors(next, prev);
          for (const [m, w] of [
            [seg, 0.02],
            [halo[i], 0.05],
          ] as const) {
            m.visible = on;
            m.position.copy(prev);
            m.scale.set(w * size, dir.length(), w * size);
            m.quaternion.setFromUnitVectors(up, dir.clone().normalize());
          }
          prev = a.copy(next);
        });
        const charged = smooth(c, 0.75, 0.85) * (1 - smooth(c, 3.4, 3.9));
        shine.visible = charged > 0.01;
        shine.position.set(end.x, (end.y + s.hand.y) / 2 + 0.05, end.z);
        shine.scale.set(0.12 * size * charged, 0.9 * hs * charged * (1 + sin(d * 25) * 0.08), 1);
        tip.visible = charged > 0.01;
        tip.position.copy(end);
        tip.scale.setScalar((on ? 0.6 : 0.22 + sin(d * 17) * 0.05) * size * charged);
      };
    }
  }
  return null;
}

/** Moves with a hat that would be in the way: it's taken off while they play. */
const NO_HAT: VictoryId[] = ['crowned', 'djset'];
/** Moves with something in the paws (whatever was held is put away). */
const HANDS_FULL: VictoryId[] = ['fries', 'trophy', 'cheque', 'makeitrain', 'selfie', 'excalibur'];

export class VictoryFx {
  private owned: THREE.Object3D[] = [];
  private tick: Tick | null;
  readonly hidesHat: boolean;
  readonly handsFull: boolean;

  constructor(
    readonly id: VictoryId,
    private rig: WinRig,
  ) {
    this.hidesHat = NO_HAT.includes(id);
    this.handsFull = HANDS_FULL.includes(id);
    this.tick = stage(id, rig, (parent, o) => {
      parent.add(o);
      this.owned.push(o);
      return o;
    });
  }

  /** Whether a victory move has any props (the others are left alone). */
  static wanted(id: VictoryId) {
    return STAGED.has(id);
  }

  update(d: number, spots: WinSpots) {
    this.tick?.(d, spots, isPerched(this.rig.root));
  }

  dispose() {
    // (The geometry and materials are shared and kept: only the copies go.)
    for (const o of this.owned) o.removeFromParent();
    this.owned = [];
    this.tick = null;
  }
}

const STAGED = new Set<VictoryId>(['skyshow', 'coolwalk', 'podium', 'fries', 'medal', 'trophy', 'cheque', 'crowned', 'redcarpet', 'encore', 'makeitrain', 'jetpack', 'djset', 'selfie', 'excalibur']);
