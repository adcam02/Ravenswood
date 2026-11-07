import * as THREE from 'three';
import { buyEmote, isBuyEmote, type EmoteAnim } from './emotes';
import type { StoolId } from './stoolShop';
import { isDance, type Anim } from './types';

/**
 * The little extras that come with some of the shop's emotes (emotes.ts): props in the paws (a mic, a teacup, a tiny
 * trumpet, fingers for a peace sign) and things that float off (hearts, Z's, sweat, question marks, flames).
 *
 * Made when an emote starts and thrown away when it ends, so an animal not emoting carries nothing. Floating bits are
 * a dozen or so sprites from one shared sheet of pictures, placed each frame from the emote's time alone (nothing to
 * simulate), so everyone watching sees much the same thing. Nothing casts shadows.
 *
 * The free emotes (wave, cheer, laugh, cry, the dance, sitting on your own stool), the dances and a couple of victory
 * moves have theirs here too, worked out the same way from the animation alone, so they reach everyone with the `anim`.
 */

// ---------------------------------------------------------------- the pictures

/** The pictures on one sheet, eight to a row, white with a dark edge (each sprite is tinted its own colour). */
const G = { heart: 0, z: 1, q: 2, drop: 3, flame: 4, note: 5, sparkle: 6, puff: 7, anger: 8, dot: 9, plus: 10, times: 11, divide: 12, pi: 13, root: 14, swirl: 15, shh: 16, star: 17, confetti: 18, lines: 19, bolt: 20, Y: 21, M: 22, C: 23, A: 24, note2: 25 } as const;
/** Words, on a sheet of their own (four times as wide as they're tall), coloured in already: tint them white. */
const WORD = { sob: 0, waaah: 1, ha: 2, lol: 3, wooo: 4, yay: 5, hi: 6 } as const;
type Glyph = keyof typeof G | keyof typeof WORD;
const COLS = 8;
const ROWS = 4;
const S = 64;
const INK = '#3b2a20';

let sheet: THREE.Texture[] | null = null;
function glyphs(): THREE.Texture[] {
  if (sheet) return sheet;
  const c = document.createElement('canvas');
  c.width = S * COLS;
  c.height = S * ROWS;
  const g = c.getContext('2d')!;
  const cell = (i: number, draw: () => void) => {
    g.save();
    g.translate((i % COLS) * S + S / 2, Math.floor(i / COLS) * S + S / 2);
    g.fillStyle = '#fff';
    g.strokeStyle = INK;
    g.lineWidth = 4;
    g.lineJoin = 'round';
    draw();
    g.restore();
  };
  const both = () => {
    g.stroke();
    g.fill();
  };
  const text = (s: string, size: number) => {
    g.font = `900 ${size}px "Arial Black", Arial, sans-serif`;
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.lineWidth = 6;
    g.strokeText(s, 0, 2);
    g.fillText(s, 0, 2);
  };
  cell(G.heart, () => {
    g.beginPath();
    g.moveTo(0, 22);
    g.bezierCurveTo(-30, 2, -22, -26, 0, -10);
    g.bezierCurveTo(22, -26, 30, 2, 0, 22);
    both();
  });
  cell(G.z, () => text('Z', 46));
  cell(G.q, () => text('?', 50));
  cell(G.drop, () => {
    g.beginPath();
    g.moveTo(0, -24);
    g.bezierCurveTo(8, -8, 18, 4, 16, 12);
    g.arc(0, 10, 16, 0.1, Math.PI - 0.1);
    g.bezierCurveTo(-18, 4, -8, -8, 0, -24);
    both();
    g.fillStyle = 'rgba(255,255,255,0.9)';
    g.beginPath();
    g.ellipse(-6, 8, 3, 6, 0.4, 0, Math.PI * 2);
    g.fill();
  });
  cell(G.flame, () => {
    g.beginPath();
    g.moveTo(0, -28);
    g.bezierCurveTo(10, -14, 22, -2, 18, 12);
    g.bezierCurveTo(14, 26, -14, 26, -18, 12);
    g.bezierCurveTo(-20, 0, -8, -6, -6, -16);
    g.bezierCurveTo(-2, -10, 2, -18, 0, -28);
    both();
    // A bright heart, left untinted-ish.
    g.fillStyle = 'rgba(255,255,220,0.9)';
    g.beginPath();
    g.moveTo(0, -4);
    g.bezierCurveTo(8, 4, 10, 16, 0, 18);
    g.bezierCurveTo(-10, 16, -8, 4, 0, -4);
    g.fill();
  });
  cell(G.note, () => {
    g.beginPath();
    g.ellipse(-8, 14, 11, 8, -0.4, 0, Math.PI * 2);
    both();
    g.fillRect(0, -22, 5, 36);
    g.strokeRect(0, -22, 5, 36);
    g.beginPath();
    g.moveTo(3, -22);
    g.quadraticCurveTo(22, -16, 18, 0);
    g.lineWidth = 6;
    g.strokeStyle = '#fff';
    g.stroke();
  });
  cell(G.sparkle, () => {
    g.beginPath();
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2 - Math.PI / 2;
      const r = i % 2 ? 7 : 26;
      g.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    }
    g.closePath();
    both();
  });
  cell(G.puff, () => {
    g.beginPath();
    for (const [x, y, r] of [
      [-12, 4, 13],
      [6, -6, 15],
      [14, 8, 11],
      [0, 10, 12],
    ])
      g.moveTo(x + r, y), g.arc(x, y, r, 0, Math.PI * 2);
    g.lineWidth = 3;
    g.strokeStyle = 'rgba(59,42,32,0.35)';
    both();
  });
  cell(G.anger, () => {
    // The cross of bulging veins.
    g.lineWidth = 9;
    g.lineCap = 'round';
    for (const [sx, sy] of [
      [1, 1],
      [-1, 1],
      [1, -1],
      [-1, -1],
    ]) {
      g.beginPath();
      g.moveTo(sx * 6, sy * 20);
      g.quadraticCurveTo(sx * 6, sy * 6, sx * 20, sy * 6);
      g.strokeStyle = '#fff';
      g.stroke();
    }
  });
  cell(G.dot, () => {
    g.beginPath();
    g.arc(0, 0, 14, 0, Math.PI * 2);
    both();
  });
  cell(G.plus, () => text('+', 54));
  cell(G.times, () => text('×', 50));
  cell(G.divide, () => text('÷', 50));
  cell(G.pi, () => text('π', 46));
  cell(G.root, () => text('√', 46));
  cell(G.swirl, () => {
    g.lineWidth = 7;
    g.lineCap = 'round';
    g.beginPath();
    g.arc(0, 0, 18, -0.4, Math.PI * 1.55);
    g.strokeStyle = '#fff';
    g.stroke();
    g.beginPath();
    g.moveTo(16, -18);
    g.lineTo(18, -6);
    g.lineTo(6, -8);
    g.stroke();
  });
  cell(G.shh, () => text('shh', 28));
  cell(G.star, () => {
    g.beginPath();
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2 - Math.PI / 2;
      const r = i % 2 ? 10 : 24;
      g.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    }
    g.closePath();
    both();
  });
  cell(G.confetti, () => {
    g.lineWidth = 3;
    g.beginPath();
    g.roundRect(-9, -15, 18, 30, 3);
    both();
  });
  cell(G.lines, () => {
    // Three little arcs, for something moving fast to the left of them.
    g.lineWidth = 6;
    g.lineCap = 'round';
    for (const [r, a] of [
      [10, 0.9],
      [19, 0.8],
      [28, 0.7],
    ]) {
      g.beginPath();
      g.arc(-14, 0, r, -a, a);
      g.strokeStyle = INK;
      g.lineWidth = 9;
      g.stroke();
      g.strokeStyle = '#fff';
      g.lineWidth = 4;
      g.stroke();
    }
  });
  cell(G.bolt, () => {
    g.beginPath();
    g.moveTo(6, -28);
    g.lineTo(-12, 2);
    g.lineTo(0, 2);
    g.lineTo(-6, 28);
    g.lineTo(14, -6);
    g.lineTo(2, -6);
    g.closePath();
    g.lineWidth = 3;
    both();
  });
  for (const k of ['Y', 'M', 'C', 'A'] as const) cell(G[k], () => text(k, 48));
  cell(G.note2, () => {
    // Two quavers joined at the top.
    for (const x of [-14, 10]) {
      g.beginPath();
      g.ellipse(x - 6, 16, 9, 7, -0.4, 0, Math.PI * 2);
      both();
      g.fillRect(x, -18, 4, 34);
      g.strokeRect(x, -18, 4, 34);
    }
    g.beginPath();
    g.moveTo(-14, -20);
    g.lineTo(14, -24);
    g.lineTo(14, -14);
    g.lineTo(-14, -10);
    g.closePath();
    both();
  });
  const base = new THREE.CanvasTexture(c);
  base.colorSpace = THREE.SRGBColorSpace;
  // One texture per picture, all sharing the sheet (uploaded once).
  sheet = Object.values(G).map((i) => {
    const t = base.clone();
    t.repeat.set(1 / COLS, 1 / ROWS);
    t.offset.set((i % COLS) / COLS, 1 - (Math.floor(i / COLS) + 1) / ROWS);
    t.needsUpdate = true;
    return t;
  });
  return sheet;
}

let wordSheet: THREE.Texture[] | null = null;
function words(): THREE.Texture[] {
  if (wordSheet) return wordSheet;
  const n = Object.keys(WORD).length;
  const c = document.createElement('canvas');
  c.width = S * 4;
  c.height = S * n;
  const g = c.getContext('2d')!;
  const word = (i: number, s: string, fill: string, size: number, bubble = false) => {
    g.save();
    g.translate(S * 2, i * S + S / 2);
    g.font = `900 ${size}px "Arial Black", Arial, sans-serif`;
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.lineJoin = 'round';
    if (bubble) {
      // A round speech bubble behind, its tail down to the left.
      const w = g.measureText(s).width + 26;
      g.beginPath();
      g.roundRect(-w / 2, -24, w, 44, 20);
      g.moveTo(-w / 2 + 18, 14);
      g.lineTo(-w / 2 + 8, 30);
      g.lineTo(-w / 2 + 32, 18);
      g.fillStyle = '#fff';
      g.strokeStyle = INK;
      g.lineWidth = 4;
      g.stroke();
      g.fill();
      g.fillStyle = fill;
      g.fillText(s, 0, 0);
    } else {
      g.strokeStyle = INK;
      g.lineWidth = 7;
      g.strokeText(s, 0, 2);
      g.fillStyle = fill;
      g.fillText(s, 0, 2);
    }
    g.restore();
  };
  word(WORD.sob, 'sob', '#8fd0ff', 40);
  word(WORD.waaah, 'WAAAH', '#8fd0ff', 40);
  word(WORD.ha, 'HA', '#ffd23f', 46);
  word(WORD.lol, 'LOL', '#ff8a3d', 46);
  word(WORD.wooo, 'WOOO!', '#ff4f8b', 30, true);
  word(WORD.yay, 'YAY!', '#3fa9ff', 30, true);
  word(WORD.hi, 'Hi!', '#2e9e5a', 30, true);
  const base = new THREE.CanvasTexture(c);
  base.colorSpace = THREE.SRGBColorSpace;
  wordSheet = Object.values(WORD).map((i) => {
    const t = base.clone();
    t.repeat.set(1, 1 / n);
    t.offset.set(0, 1 - (i + 1) / n);
    t.needsUpdate = true;
    return t;
  });
  return wordSheet;
}

// ---------------------------------------------------------------- props

/** Where a prop goes: the right paw, the left paw, or (heart hands) between the two; or on the ground underneath. */
interface Props {
  r?: THREE.Object3D;
  l?: THREE.Object3D;
  ground?: THREE.Object3D;
}

/** The top of a stool's seat (town/stools.ts SEAT): how high sitting on your own stool lifts you. */
export const PERCH_Y = 0.42;
/** Makes a player's stool (town/stools.ts hands this over, so the effects don't pull in every design themselves). */
let stoolMaker: ((id: StoolId | null) => THREE.Object3D) | null = null;
export function setEmoteStool(make: (id: StoolId | null) => THREE.Object3D) {
  stoolMaker = make;
}
/** Shapes shared by every play (never freed, like the materials): the puddle, and the power-up's glow. */
let puddleGeo: THREE.BufferGeometry | null = null;
let auraGeo: THREE.BufferGeometry | null = null;
let auraMat: THREE.MeshBasicMaterial | null = null;
function shared(m: THREE.Mesh) {
  m.userData.shared = true;
  return m;
}
function puddle() {
  puddleGeo ??= new THREE.CircleGeometry(1, 20).rotateX(-Math.PI / 2);
  const m = shared(new THREE.Mesh(puddleGeo, mat('#8fd3ff', { transparent: true, opacity: 0.7, roughness: 0.15 })));
  m.name = 'puddle';
  return m;
}
/** A tall flame shape of light round the body, a metre high and wide, scaled to fit. */
function auraShell() {
  auraGeo ??= new THREE.LatheGeometry(
    Array.from({ length: 9 }, (_, i) => {
      const k = i / 8;
      return new THREE.Vector2(0.5 * Math.sin(Math.PI * Math.pow(k, 0.7)) * (1 - k * 0.35) + 0.001, k);
    }),
    20,
  );
  auraMat ??= new THREE.MeshBasicMaterial({ color: '#ffd84a', transparent: true, opacity: 0.22, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide });
  kept.add(auraMat);
  const m = shared(new THREE.Mesh(auraGeo, auraMat));
  m.name = 'aura';
  return m;
}

/**
 * The props' materials are made once and kept (never freed): a fresh one for every emote, freed as it ended, had the
 * graphics card build its shader all over again each time anyone emoted, a stutter of a tenth of a second or more.
 */
const mats = new Map<string, THREE.MeshStandardMaterial>();
const kept = new Set<THREE.Material>();
function mat(color: string, extra: THREE.MeshStandardMaterialParameters = {}) {
  const key = `${color}:${JSON.stringify(extra)}`;
  let m = mats.get(key);
  if (!m) {
    m = new THREE.MeshStandardMaterial({ color, roughness: 0.6, flatShading: true, ...extra });
    mats.set(key, m);
    kept.add(m);
  }
  return m;
}
/** The effects' sprites, kept the same way between emotes (and shared by everyone's), up to this many spare. */
const spareSprites: THREE.Sprite[] = [];
const SPARE_SPRITES = 96;
/** Fingers, in the animal's own coat (the material isn't the prop's to free). */
function finger(skin: THREE.Material, len: number, r = 0.016) {
  const m = new THREE.Mesh(new THREE.CapsuleGeometry(r, len, 3, 6), skin);
  m.userData.skin = true;
  // (Standing up from the grip.)
  m.geometry.translate(0, len / 2 + r, 0);
  // The coat is painted by vertex, so the finger needs paint of its own: a soft tan until it's first drawn, then
  // the colour of the paw it's on.
  const paint = new Float32Array(m.geometry.getAttribute('position').count * 3);
  m.geometry.setAttribute('color', new THREE.BufferAttribute(paint, 3));
  fill(m.geometry, FINGER_TAN);
  m.onBeforeRender = () => {
    m.onBeforeRender = () => {};
    const c = pawColour(m);
    if (c) fill(m.geometry, c);
  };
  return m;
}
const FINGER_TAN = new THREE.Color('#d9b48c');
function fill(geo: THREE.BufferGeometry, c: THREE.Color) {
  const a = geo.getAttribute('color') as THREE.BufferAttribute;
  for (let i = 0; i < a.count; i++) a.setXYZ(i, c.r, c.g, c.b);
  a.needsUpdate = true;
}

/** Paw colours already found, by the animal's body and the bone the paw is on. */
const pawColours = new WeakMap<THREE.BufferGeometry, Map<number, THREE.Color | null>>();
/**
 * The colour at the end of the arm this prop is held by: the far end of the arm bone it hangs from, read off the
 * animal's own painted body (null if there's no telling).
 */
function pawColour(o: THREE.Object3D): THREE.Color | null {
  let bone: THREE.Bone | null = null;
  let body: THREE.SkinnedMesh | null = null;
  for (let p = o.parent, n = 0; p && n < 14 && !body; p = p.parent, n++) {
    if (!bone && (p as THREE.Bone).isBone) bone = p as THREE.Bone;
    if (bone) body = (p.children.find((k) => (k as THREE.SkinnedMesh).isSkinnedMesh) as THREE.SkinnedMesh | undefined) ?? null;
  }
  if (!bone || !body?.skeleton) return null;
  const geo = body.geometry;
  const at = body.skeleton.bones.indexOf(bone);
  let known = pawColours.get(geo);
  if (!known) pawColours.set(geo, (known = new Map()));
  if (known.has(at)) return known.get(at)!;
  const pos = geo.getAttribute('position');
  const col = geo.getAttribute('color');
  const idx = geo.getAttribute('skinIndex');
  const wt = geo.getAttribute('skinWeight');
  let found: THREE.Color | null = null;
  if (at >= 0 && pos && col && idx && wt) {
    // The vertices mostly on this bone, measured out along it from its joint; the farthest few are the paw.
    const inv = body.skeleton.boneInverses[at];
    const v = new THREE.Vector3();
    const near: { d: number; i: number }[] = [];
    for (let i = 0; i < pos.count; i++) {
      for (let k = 0; k < 4; k++) {
        if (idx.getComponent(i, k) !== at || wt.getComponent(i, k) < 0.5) continue;
        near.push({ d: v.fromBufferAttribute(pos, i).applyMatrix4(inv).length(), i });
        break;
      }
    }
    near.sort((a, b) => b.d - a.d);
    const few = near.slice(0, Math.max(1, Math.ceil(near.length * 0.15)));
    if (few.length) {
      found = new THREE.Color(0, 0, 0);
      for (const { i } of few) found.add(new THREE.Color(col.getX(i), col.getY(i), col.getZ(i)));
      found.multiplyScalar(1 / few.length);
    }
  }
  known.set(at, found);
  return found;
}

function buildProps(anim: Anim, skin: THREE.Material, pawR: number, stool: StoolId | null): Props {
  const up = pawR * 0.7;
  const at = (o: THREE.Object3D, x: number, y: number, z: number, rx = 0, rz = 0) => {
    o.position.set(x, y, z);
    o.rotation.set(rx, 0, rz);
    return o;
  };
  const group = (...kids: THREE.Object3D[]) => {
    const g = new THREE.Group();
    g.add(...kids);
    return g;
  };
  switch (anim) {
    case 'thumbsup':
      return { r: group(at(finger(skin, 0.035, 0.018), 0, up, 0.01)) };
    case 'shush':
      return { r: group(at(finger(skin, 0.04), 0, up, 0.02)) };
    case 'peace':
      return { r: group(at(finger(skin, 0.05), 0.012, up, 0, 0, -0.32), at(finger(skin, 0.05), -0.012, up, 0, 0, 0.32)) };
    case 'loser':
      // The L, seen from in front: one finger up, the thumb out across the brow.
      return { r: group(at(finger(skin, 0.06), 0, up, 0.03), at(finger(skin, 0.045), 0.005, up * 0.6, 0.03, 0, -Math.PI / 2)) };
    case 'fingerguns': {
      const gun = () => group(at(finger(skin, 0.05), 0, 0, pawR * 0.6, Math.PI / 2), at(finger(skin, 0.02), 0, up, 0));
      return { r: gun(), l: gun() };
    }
    case 'cry':
      return { ground: puddle() };
    case 'perch': {
      // Their own stool round the dais (or the plain log), or a log of our own if there's no maker.
      const seat = stoolMaker?.(stool) ?? at(new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, PERCH_Y, 14), mat('#8a5a36')), 0, PERCH_Y / 2, 0);
      const g = group(seat);
      g.name = 'stool';
      return { ground: g };
    }
    case 'win:micdrop':
    case 'micdrop': {
      const m = group(
        at(new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.01, 0.12, 8), mat('#2b2b30')), 0, 0, 0),
        at(new THREE.Mesh(new THREE.SphereGeometry(0.03, 10, 8), mat('#8d9096', { metalness: 0.6, roughness: 0.35 })), 0, 0.075, 0),
      );
      m.name = 'mic';
      return { r: m };
    }
    case 'teasip':
    case 'thisisfine': {
      const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.03, 0.055, 12, 1, true), mat(anim === 'teasip' ? '#f4f1ea' : '#e9e2d0', { side: THREE.DoubleSide }));
      const tea = new THREE.Mesh(new THREE.CircleGeometry(0.037, 12), mat('#8a5a2b'));
      tea.rotation.x = -Math.PI / 2;
      tea.position.y = 0.018;
      const base = new THREE.Mesh(new THREE.CircleGeometry(0.03, 12), cup.material);
      base.rotation.x = Math.PI / 2;
      base.position.y = -0.027;
      const handle = new THREE.Mesh(new THREE.TorusGeometry(0.016, 0.005, 5, 10), cup.material);
      handle.position.set(-0.045, 0, 0);
      handle.rotation.y = Math.PI / 2;
      // (Held by the handle, so the cup sits just in front of the paw.)
      return { r: at(group(cup, tea, base, handle), 0, 0.03, 0.05) };
    }
    case 'doot': {
      const brass = mat('#e2b33c', { metalness: 0.7, roughness: 0.3 });
      const tube = at(new THREE.Mesh(new THREE.CylinderGeometry(0.009, 0.009, 0.16, 6), brass), 0, 0, 0.08, Math.PI / 2);
      const bell = at(new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.01, 0.07, 12, 1, true), brass), 0, 0, 0.19, Math.PI / 2);
      (bell as THREE.Mesh).material = mat('#e2b33c', { metalness: 0.7, roughness: 0.3, side: THREE.DoubleSide });
      const valves = at(new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.035, 0.05), brass), 0, 0.022, 0.07);
      return { r: group(tube, bell, valves) };
    }
    case 'hearthands': {
      const shape = new THREE.Shape();
      shape.moveTo(0, -0.04);
      shape.bezierCurveTo(-0.055, -0.005, -0.04, 0.045, 0, 0.022);
      shape.bezierCurveTo(0.04, 0.045, 0.055, -0.005, 0, -0.04);
      const geo = new THREE.ExtrudeGeometry(shape, { depth: 0.02, bevelEnabled: true, bevelSize: 0.006, bevelThickness: 0.006, bevelSegments: 1 });
      geo.translate(0, 0.01, -0.01);
      const heart = new THREE.Mesh(geo, mat('#ff5a8a', { emissive: '#ff2f6b', emissiveIntensity: 0.35 }));
      heart.name = 'heart';
      return { r: heart };
    }
  }
  return {};
}

// ---------------------------------------------------------------- what floats off

/** Where things are this frame, in the space the effects are drawn in (the animal's, before it's turned). */
export interface EmoteSpots {
  /** The top of the head, and its middle. */
  top: number;
  head: THREE.Vector3;
  mouth: THREE.Vector3;
  eyeL: THREE.Vector3;
  eyeR: THREE.Vector3;
  /** The paws' grips. */
  hand: THREE.Vector3;
  handL: THREE.Vector3;
  /** About how wide the head is. */
  size: number;
}

/** (`glow`: added onto what's behind, like light, rather than painted over it.) */
type Add = (g: Glyph, color: string, x: number, y: number, z: number, size: number, opacity?: number, rot?: number, glow?: boolean) => void;
const ss = THREE.MathUtils.smoothstep;
const frac = (x: number) => x - Math.floor(x);
/** 0 to 1 and back over [a, b]: in quickly, out at the end. */
const life = (u: number, a: number, b: number) => (u < a || u > b ? 0 : Math.min(1, (u - a) / 0.12) * Math.min(1, (b - u) / 0.25));
/** How big something popping in is, `k` of the way through its life: up quickly with a little overshoot. */
const pop = (k: number) => {
  const j = Math.min(1, Math.max(0, k) * 6);
  return Math.max(0.01, j + Math.sin(j * Math.PI) * 0.3);
};
const TAU = Math.PI * 2;
const NOTES = ['#ffd23f', '#c48cff', '#7fd0ff', '#ff8fb1'];
const PARTY = ['#ff4f8b', '#ffd23f', '#3fa9ff', '#59d36b', '#b77bff', '#ff8a3d'];
/** The dances that kick up dust as they go (the rest just have notes, and a few something of their own). */
const DUSTY = new Set<Anim>(['griddy', 'moonwalk', 'horse', 'runningman', 'worm', 'riverdance', 'eslide', 'cart', 'charleston']);

/** Each emote's floating bits at time `u` (seconds in). */
function particles(anim: Anim, u: number, T: number, P: EmoteSpots, add: Add, self: EmoteFx) {
  const r = P.size;
  /** Words a bit bigger on a big head. */
  const ws = THREE.MathUtils.clamp(r / 0.13, 1, 1.8);
  /** A note now and then off the top of the head (one every `every` seconds, `n` up at once), to either side. */
  const notes = (every: number, n = 2) => {
    for (let i = 0; i < n; i++) {
      const c = u / (every * n) + i / n;
      const k = frac(c);
      const m = Math.floor(c) * n + i;
      const side = m % 2 ? 1 : -1;
      add(m % 3 === 2 ? 'note2' : 'note', NOTES[m % NOTES.length], P.head.x + side * (r * 0.8 + k * 0.18) + Math.sin(k * 6 + m) * 0.03, P.top + k * 0.38, P.head.z, (0.06 + k * 0.02) * pop(k), Math.min(1, k * 5) * (1 - ss(k, 0.6, 1)) * life(u, 0.3, Infinity));
    }
  };
  /** Little puffs of dust off the feet, one side then the other. */
  const dust = (every: number) => {
    const w = Math.max(0.08, r * 0.7);
    for (const side of [-1, 1]) {
      const k = frac(u / every + (side > 0 ? 0.5 : 0));
      add('puff', '#eee4d2', side * (w + 0.04 + k * 0.14), 0.03 + k * 0.08, 0.02 - k * 0.08, 0.05 + k * 0.06, 0.7 * (1 - k) * life(u, 0.2, Infinity));
    }
  };
  switch (anim) {
    // ---- the free emotes
    case 'wave': {
      // "Hi!" up by the paw, and motion lines flicking either side of it as it goes.
      add('hi', '#ffffff', P.hand.x - 0.2, P.hand.y + 0.13 + Math.sin(u * 4) * 0.01, P.hand.z + 0.02, 0.08 * ws * pop((u - 0.15) / 1.2), life(u, 0.15, 2.3));
      const k = frac(u * 1.43);
      const side = k < 0.5 ? 1 : -1;
      add('lines', '#ffffff', P.hand.x + side * 0.13, P.hand.y + 0.02, P.hand.z, 0.075, Math.sin(frac(k * 2) * Math.PI) * life(u, 0.1, 2.35), side > 0 ? 0 : Math.PI);
      break;
    }
    case 'cheer': {
      // A burst of confetti off the top of the head every so often, and a WOOO! or a YAY!
      const c = u / 1.3;
      const n = Math.floor(c);
      const k = frac(c);
      for (let i = 0; i < 14; i++) {
        const a = (i / 14) * TAU + n * 0.7;
        const sp = (0.25 + ((i * 7) % 5) * 0.06) * k;
        const up = 0.9 + ((i * 3) % 4) * 0.15;
        add('confetti', PARTY[(i + n) % PARTY.length], P.head.x + Math.cos(a) * sp, P.top + 0.05 + 1.1 * up * k - 1.6 * k * k, P.head.z + Math.sin(a) * sp, 0.036, 1 - ss(k, 0.75, 1), u * 7 + i);
      }
      add(n % 2 ? 'yay' : 'wooo', '#ffffff', P.head.x + r + 0.12, P.top + 0.16 + k * 0.04, P.head.z, 0.08 * ws * pop(k), life(k, 0, 0.95));
      break;
    }
    case 'laugh': {
      // Tears of joy out sideways, and HA HA popping out either side, with the odd LOL.
      for (const [eye, side] of [
        [P.eyeL, 1],
        [P.eyeR, -1],
      ] as const)
        for (let i = 0; i < 2; i++) {
          const k = frac(u * 1.8 + i / 2 + (side > 0 ? 0.25 : 0));
          add('drop', '#7fd0ff', eye.x + side * (0.04 + k * 0.25), eye.y + k * 0.1 - k * k * 0.32, eye.z + 0.02, 0.03, (1 - k) * life(u, 0.3, Infinity));
        }
      for (let i = 0; i < 2; i++) {
        const c = u / 0.9 + i / 2;
        const k = frac(c);
        const lol = Math.floor(c) % 3 === 2 && i === 1;
        const side = i ? 1 : -1;
        add(lol ? 'lol' : 'ha', '#ffffff', P.head.x + side * (r + 0.1 + k * 0.12), P.top - 0.02 + k * 0.22, P.head.z + 0.05, (lol ? 0.085 : 0.075) * ws * pop(k), (1 - ss(k, 0.7, 1)) * life(u, 0.1, Infinity));
      }
      break;
    }
    case 'cry': {
      // Tears streaming down past the paws into a puddle at the feet, and a sob (or a WAAAH) now and then.
      for (const [eye, side] of [
        [P.eyeL, 1],
        [P.eyeR, -1],
      ] as const)
        for (let i = 0; i < 4; i++) {
          const k = frac(u * 1.2 + i / 4 + (side > 0 ? 0.12 : 0));
          add('drop', '#7fd0ff', eye.x + side * (r * 0.45 + k * 0.04), eye.y - k * k * (eye.y - 0.03), eye.z + 0.04 + k * 0.05, 0.028, (1 - ss(k, 0.85, 1)) * life(u, 0.2, Infinity));
        }
      self.puddleAt(u, P);
      const c = u / 1.4;
      const n = Math.floor(c);
      const k = frac(c);
      add(n % 3 === 1 ? 'waaah' : 'sob', '#ffffff', P.head.x + (n % 2 ? 1 : -1) * (r + 0.16), P.top + 0.02 + k * 0.12, P.head.z, (n % 3 === 1 ? 0.08 : 0.075) * ws * pop(k), (1 - ss(k, 0.7, 1)) * life(u, 0.4, Infinity));
      break;
    }
    case 'dance':
      // Notes, and disco sparkles turning round about.
      notes(0.5, 3);
      for (let i = 0; i < 4; i++) {
        const a = (i / 4) * TAU + u * 0.8;
        const tw = Math.max(0, Math.sin(u * 5 + i * 1.7));
        add('sparkle', ['#ff7ad9', '#7ae7ff', '#fff27a', '#a6ff7a'][i], Math.cos(a) * (r + 0.3), P.head.y * 0.55 + (i % 2) * 0.22, Math.sin(a) * (r + 0.3), 0.04 + tw * 0.05, tw * life(u, 0.2, Infinity));
      }
      break;
    case 'perch':
      // The stool pops up out of a puff of smoke.
      self.perchAt(u);
      if (u < 0.6) {
        const k = u / 0.6;
        for (let i = 0; i < 7; i++) {
          const a = (i / 7) * TAU + 0.3;
          add('puff', '#f4efe6', Math.cos(a) * (0.3 + k * 0.3), 0.08 + k * 0.3, Math.sin(a) * (0.3 + k * 0.3), 0.07 + k * 0.07, 0.95 * (1 - k));
        }
      }
      break;
    // ---- the victory moves with something extra (victoryMoves.ts), in their own loop
    case 'win:micdrop': {
      const c = u % 5;
      self.dropMic(c, P, 2.9);
      if (c > 3.27 && c < 3.85) {
        const k = (c - 3.27) / 0.58;
        const d = self.dropAt;
        for (let i = 0; i < 5; i++) {
          const a = (i / 5) * TAU + 0.4;
          add('star', '#ffd23f', d.x + Math.cos(a) * k * 0.25, 0.03 + Math.sin(k * Math.PI) * 0.14, d.z + Math.sin(a) * k * 0.25, 0.05, 1 - k);
        }
      }
      break;
    }
    case 'win:powerup': {
      // Building for 2.2 seconds, the burst, and again (as the pose does).
      const c = u % 3;
      const build = ss(c, 0, 2.2);
      const burst = ss(c, 2.2, 2.4) * (1 - ss(c, 2.8, 3));
      const w = Math.max(0.2, r * 1.4);
      const h = P.top + 0.1;
      self.glow(build, burst, w, h, u);
      // Flames licking up round the body, more and taller as it builds.
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * TAU + i * 0.4;
        const k = frac(u * 1.8 + i * 0.37);
        const rr = w * (0.85 + 0.3 * build + 0.4 * burst) * (1 - k * 0.3);
        add('flame', i % 3 ? '#ffb020' : '#ffe24a', Math.cos(a) * rr, 0.03 + k * h * (0.5 + 0.6 * build + 0.3 * burst), Math.sin(a) * rr, (0.03 + 0.04 * build + 0.03 * burst) * (1 - k * 0.5), Math.min(1, k * 4) * (1 - k) * (0.2 + 0.7 * build), 0, true);
      }
      // Crackles: little bolts flicking on and off round it.
      if (build > 0.3)
        for (let i = 0; i < 3; i++) {
          const f = u * 9 + i * 3.3;
          const hsh = frac(Math.sin(Math.floor(f) * 12.9898 + i) * 43758.5);
          const a = hsh * TAU;
          add('bolt', i % 2 ? '#bfe9ff' : '#fff6b0', Math.cos(a) * w * 1.15, h * (0.3 + 0.6 * frac(hsh * 7)), Math.sin(a) * w * 1.15, 0.045 + 0.035 * build, frac(f) < 0.55 ? 1 : 0, hsh * 2 - 1, true);
        }
      // Dust and grit lifting off the ground.
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * TAU + 0.5;
        const k = frac(u * 0.9 + i / 8);
        const out = w * (1.1 + k * 0.6);
        add(i % 2 ? 'dot' : 'puff', i % 2 ? '#8a7a66' : '#e8dcc4', Math.cos(a) * out, 0.02 + k * h * 0.5 * build, Math.sin(a) * out, i % 2 ? 0.015 : 0.035 + k * 0.05, (1 - k) * build * 0.9);
      }
      // The burst: a ring of stars flung out.
      if (c > 2.2 && c < 2.9) {
        const k = (c - 2.2) / 0.7;
        for (let i = 0; i < 8; i++) {
          const a = (i / 8) * TAU;
          add('star', '#ffe04a', Math.cos(a) * (w + k * 0.6), h * 0.5 + Math.sin(k * Math.PI) * 0.1, Math.sin(a) * (w + k * 0.6), 0.07, 1 - k, 0, true);
        }
      }
      break;
    }
    // ---- the dances: a light touch
    case 'ymca': {
      // The letter over the head, two beats each.
      const bar = (u * 2) % 8;
      const i = Math.floor(bar / 2);
      const k = (bar % 2) / 2;
      add((['Y', 'M', 'C', 'A'] as const)[i], PARTY[i], P.head.x, P.top + 0.2, P.head.z, 0.09 * pop(k), (1 - ss(k, 0.85, 1)) * life(u, 0.1, Infinity));
      break;
    }
    case 'sprinkler': {
      // Water from the paw, sweeping round.
      const a = Math.sin(u * 3) * 1.1;
      for (let i = 0; i < 5; i++) {
        const k = frac(u * 2 + i / 5);
        add('drop', '#7fd0ff', P.hand.x + Math.sin(a - 0.6) * k * 0.4, P.hand.y + k * 0.14 - k * k * 0.42, P.hand.z + Math.cos(a - 0.6) * k * 0.4, 0.035, (1 - k) * life(u, 0.3, Infinity));
      }
      notes(1.2, 1);
      break;
    }
    case 'robot': {
      // Sparks off the head, now and then: bzzt.
      const f = u * 3;
      if (frac(f) < 0.25) for (const side of [-1, 1]) add('bolt', '#bfe9ff', P.head.x + side * (r + 0.06), P.head.y + 0.06, P.head.z, 0.05, life(u, 0.3, Infinity), side * 0.4);
      notes(1.2, 1);
      break;
    }
    case 'vogue':
      // Camera flashes.
      for (let i = 0; i < 3; i++) {
        const k = frac(u * 0.9 + i / 3);
        if (k < 0.2) add('star', '#ffffff', (i - 1) * (r + 0.35), P.head.y + (i % 2) * 0.15, 0.25, 0.04 + (0.2 - k) * 0.4, 1 - k / 0.2);
      }
      notes(1.2, 1);
      break;
    case 'windmill':
      add('swirl', '#ffffff', P.head.x, P.top + 0.12, P.head.z, 0.07, 0.8 * life(u, 0.3, Infinity), -u * 6);
      notes(1.2, 1);
      break;
    case 'slowclap': {
      // A little burst where the paws meet, each clap.
      const k = frac(u / 1.0 - 0.5);
      if (k < 0.3) {
        const mx = (P.hand.x + P.handL.x) / 2;
        const my = (P.hand.y + P.handL.y) / 2;
        const mz = (P.hand.z + P.handL.z) / 2 + 0.04;
        for (let i = 0; i < 3; i++) {
          const a = (i / 3) * Math.PI * 2 + 0.6;
          add('sparkle', '#fff3a6', mx + Math.cos(a) * k * 0.4, my + Math.sin(a) * k * 0.4, mz, 0.06, 1 - k / 0.3);
        }
      }
      break;
    }
    case 'thumbsup':
    case 'peace': {
      const o = life(u, 0.35, T - 0.2);
      add('sparkle', '#fff3a6', P.hand.x - 0.05, P.hand.y + 0.12 + Math.sin(u * 6) * 0.01, P.hand.z + 0.03, 0.06 + Math.sin(u * 9) * 0.015, o);
      add('sparkle', '#ffffff', P.hand.x + 0.06, P.hand.y + 0.06, P.hand.z + 0.05, 0.04 + Math.sin(u * 11 + 1) * 0.012, o);
      break;
    }
    case 'blowkiss': {
      const k = (u - 0.75) / (T - 0.75);
      if (k > 0) add('heart', '#ff5a8a', P.mouth.x + Math.sin(k * 7) * 0.03, P.mouth.y + k * 0.25, P.mouth.z + 0.06 + k * 0.7, 0.07 + k * 0.08, 1 - ss(k, 0.7, 1));
      break;
    }
    case 'micdrop':
      self.dropMic(u, P);
      if (u > 1.72 && u < 2.3) {
        const k = (u - 1.72) / 0.58;
        const d = self.dropAt;
        for (let i = 0; i < 4; i++) {
          const a = (i / 4) * Math.PI * 2 + 0.4;
          add('star', '#ffd23f', d.x + Math.cos(a) * k * 0.22, 0.03 + Math.sin(k * Math.PI) * 0.12, d.z + Math.sin(a) * k * 0.22, 0.05, 1 - k);
        }
      }
      break;
    case 'think':
      // Thought dots, one by one, up and off to the side.
      for (let i = 0; i < 3; i++) {
        const on = frac(u / 1.2) * 4 > i + 0.5 ? 1 : 0;
        add('dot', '#ffffff', P.head.x - 0.12 - i * 0.06, P.top + 0.04 + i * 0.07, P.head.z, 0.04 + i * 0.02, on * life(u, 0.3, T - 0.1));
      }
      break;
    case 'shush': {
      const k = frac(u / 1.1);
      add('shh', '#bfe3ff', P.mouth.x - 0.1 - k * 0.15, P.mouth.y + 0.05 + k * 0.12, P.mouth.z + 0.05, 0.12, life(u, 0.4, T) * (1 - k));
      break;
    }
    case 'ragequit': {
      const beat = 1 + Math.abs(Math.sin(u * 10)) * 0.25;
      add('anger', '#e8302a', P.head.x - r * 0.55, P.top - 0.02, P.head.z + 0.05, 0.11 * beat, life(u, 0.15, T));
      for (const side of [-1, 1])
        for (let i = 0; i < 2; i++) {
          const k = frac(u * 1.6 + i * 0.5);
          add('puff', '#f2f2f2', P.head.x + side * (r * 0.6 + k * 0.12), P.head.y + k * 0.25, P.head.z - 0.02, 0.06 + k * 0.08, (1 - k) * life(u, 0.2, T));
        }
      break;
    }
    case 'yawn':
      for (let i = 0; i < 3; i++) {
        const k = frac((u - 1.1) / 1.2 + i / 3);
        if (u < 1.1 + (i / 3) * 1.2) continue;
        add('z', '#bcd0ff', P.head.x - 0.08 - k * 0.15 + Math.sin(k * 6) * 0.03, P.top + 0.02 + k * 0.32, P.head.z, 0.06 + k * 0.07, Math.min(1, k * 5) * (1 - ss(k, 0.7, 1)));
      }
      break;
    case 'sneeze': {
      const k = (u - 1.12) / 0.8;
      if (k > 0 && k < 1) {
        add('puff', '#ffffff', P.mouth.x, P.mouth.y, P.mouth.z + 0.06 + k * 0.25, 0.08 + k * 0.18, 0.9 * (1 - k));
        for (let i = 0; i < 6; i++) {
          const a = (i / 6 - 0.5) * 1.6;
          add('drop', '#9fe0ff', P.mouth.x + Math.sin(a) * k * 0.35, P.mouth.y + 0.04 - k * k * 0.35 + Math.cos(i * 3) * 0.04, P.mouth.z + 0.05 + Math.cos(a) * k * 0.45, 0.035, 1 - k);
        }
      }
      break;
    }
    case 'hearthands':
      for (let i = 0; i < 3; i++) {
        const k = frac(u / 1.3 + i / 3);
        if (u < 0.4 + (i / 3) * 1.3) continue;
        add('heart', i === 1 ? '#ff8fb1' : '#ff5a8a', P.hand.x * 0.3 + Math.sin(k * 5 + i) * 0.08, P.hand.y + 0.08 + k * 0.45, P.hand.z + 0.06, 0.05 + k * 0.05, 1 - ss(k, 0.6, 1));
      }
      break;
    case 'flex':
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI * 2 + u * 1.5;
        const tw = Math.max(0, Math.sin(u * 7 + i * 2.1));
        add('sparkle', i % 2 ? '#fff3a6' : '#ffffff', P.head.x + Math.cos(a) * (r + 0.22), P.head.y - 0.05 + Math.sin(a * 2) * 0.12, P.head.z + Math.sin(a) * 0.15, 0.03 + tw * 0.05, tw * life(u, 0.25, T));
      }
      break;
    case 'eyeroll':
      add('swirl', '#ffffff', P.head.x, P.top + 0.1, P.head.z, 0.1, life(u, 0.2, 1.4));
      break;
    case 'fingerguns':
      for (const t0 of [0.45, 1.05, 1.6]) {
        const k = (u - t0) / 0.25;
        if (k < 0 || k > 1) continue;
        for (const h of [P.hand, P.handL]) add('sparkle', '#ffe27a', h.x, h.y + 0.02, h.z + 0.12 + k * 0.08, 0.05 + k * 0.03, 1 - k);
      }
      break;
    case 'thisisfine':
      // Little flames round about, flickering.
      for (let i = 0; i < 9; i++) {
        const a = (i / 9) * Math.PI * 2 + 0.3;
        const fl = 0.85 + Math.sin(u * 13 + i * 2.7) * 0.15;
        const rr = 0.55 + (i % 3) * 0.12;
        add('flame', i % 3 === 0 ? '#ffb02e' : '#ff6a1f', Math.cos(a) * rr, 0.06 * fl, Math.sin(a) * rr, 0.13 * fl, life(u, 0.05, T));
      }
      // And steam from the cup.
      add('puff', '#ffffff', P.hand.x, P.hand.y + 0.1 + frac(u) * 0.12, P.hand.z + 0.05, 0.04 + frac(u) * 0.04, 0.6 * (1 - frac(u)));
      break;
    case 'teasip':
      for (let i = 0; i < 2; i++) {
        const k = frac(u * 0.8 + i * 0.5);
        add('puff', '#ffffff', P.hand.x + Math.sin(k * 6 + i) * 0.02, P.hand.y + 0.08 + k * 0.16, P.hand.z + 0.05, 0.03 + k * 0.04, 0.55 * (1 - k));
      }
      break;
    case 'sweat': {
      // One bead running down the brow, and drops flicking off either side.
      const k = frac(u / 1.4);
      add('drop', '#7fd0ff', P.head.x - r * 0.45, P.head.y + r * 0.4 - k * r * 0.5, P.head.z + r * 0.75, 0.05, life(u, 0.1, T));
      for (const side of [-1, 1]) {
        const j = frac(u * 1.3 + (side > 0 ? 0.5 : 0));
        add('drop', '#9fe0ff', P.head.x + side * (r * 0.7 + j * 0.25), P.head.y + r * 0.3 + j * 0.15 - j * j * 0.35, P.head.z, 0.04, (1 - j) * life(u, 0.2, T));
      }
      break;
    }
    case 'confused': {
      const marks: [Glyph, string][] = [
        ['q', '#ffd23f'],
        ['plus', '#9be37a'],
        ['q', '#ffd23f'],
        ['times', '#ff8a8a'],
        ['pi', '#8fc8ff'],
        ['divide', '#d6a6ff'],
        ['root', '#ffb86b'],
      ];
      marks.forEach(([gl, col], i) => {
        const a = (i / marks.length) * Math.PI * 2 + u * 1.1;
        add(gl, col, P.head.x + Math.cos(a) * (r + 0.2), P.head.y + 0.05 + Math.sin(u * 3 + i) * 0.05 + (i % 2) * 0.08, P.head.z + Math.sin(a) * (r + 0.2), gl === 'q' ? 0.1 : 0.08, life(u, 0.1 + i * 0.08, T));
      });
      break;
    }
    case 'sigh': {
      const k = (u - 0.85) / 1.3;
      if (k > 0 && k < 1) add('puff', '#ffffff', P.mouth.x, P.mouth.y - k * 0.08, P.mouth.z + 0.08 + k * 0.3, 0.06 + k * 0.14, 0.8 * (1 - k));
      break;
    }
    case 'crylaugh':
      // Tears squirting out sideways in arcs.
      for (const [eye, side] of [
        [P.eyeL, 1],
        [P.eyeR, -1],
      ] as const)
        for (let i = 0; i < 3; i++) {
          const k = frac(u * 2.2 + i / 3);
          add('drop', '#7fd0ff', eye.x + side * k * 0.3, eye.y + k * 0.12 - k * k * 0.3, eye.z + 0.02, 0.035, (1 - k) * life(u, 0.25, T));
        }
      break;
    case 'doot':
      // A note out of the bell for each doot.
      for (const t0 of [0.3, 0.9, 1.45]) {
        const k = (u - t0) / 0.9;
        if (k < 0 || k > 1) continue;
        add('note', t0 === 0.9 ? '#ffd23f' : '#c48cff', P.hand.x + Math.sin(k * 8) * 0.04, P.hand.y + 0.05 + k * 0.3, P.hand.z + 0.24 + k * 0.25, 0.07 + k * 0.03, 1 - ss(k, 0.7, 1));
      }
      break;
    default:
      if (!isDance(anim)) break;
      if (DUSTY.has(anim)) {
        dust(0.5);
        notes(1.2, 1);
      } else notes(0.9, 2);
      break;
  }
}

/**
 * Builds the effects' shaders in the background a little after the town loads (the props' two kinds of material and
 * the sprites), so not even the first emote anyone does stutters. They're kept from then on (see mat).
 */
export function warmEmoteFx(renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.Camera) {
  const box = new THREE.BoxGeometry(0.01, 0.01, 0.01);
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ transparent: true, depthWrite: false, map: glyphs()[0] }));
  const g = new THREE.Group();
  g.add(new THREE.Mesh(box, mat('#ffffff')), new THREE.Mesh(box, mat('#ffffff', { side: THREE.DoubleSide })), new THREE.Mesh(box, auraShell().material), sprite);
  const done = () => {
    // (Without the graphics card's background compiling, the work would still wait for the first draw: done now.)
    for (const p of renderer.info.programs ?? []) p.getUniforms();
    g.clear();
    box.dispose();
    spareSprites.push(sprite);
  };
  try {
    renderer.compileAsync(g, camera, scene).then(done, done);
  } catch {
    done();
  }
}

/** Whether an emote has anything for EmoteFx to do. */
const NONE: EmoteAnim[] = ['facepalm', 'shrug', 'salute', 'bow', 'dab', 'loser'];
const FREE = new Set<Anim>(['wave', 'cheer', 'laugh', 'cry', 'dance', 'perch', 'win:micdrop', 'win:powerup']);
/** Whether an animation comes with props or effects here: the shop's emotes, the free ones, dances, two victory moves. */
export const hasEmoteFx = (anim: Anim): boolean => isBuyEmote(anim) || FREE.has(anim) || isDance(anim);

export class EmoteFx {
  readonly group = new THREE.Group();
  readonly props: Props;
  private sprites: THREE.Sprite[] = [];
  private used = 0;
  private T: number;
  /** The mic, once it's been let go: where it fell from (the effects' space), and where it lands. */
  private dropped: THREE.Object3D | null = null;
  private dropFrom = new THREE.Vector3();
  readonly dropAt = new THREE.Vector3();

  /** Set once the animation has ended and what's on the ground is going (see leave). */
  private gone = -1;
  private goneScale = new THREE.Vector3();

  constructor(
    readonly anim: Anim,
    skin: THREE.Material,
    pawR: number,
    stool: StoolId | null = null,
  ) {
    this.T = buyEmote(anim)?.time ?? 2.5;
    this.props = buildProps(anim, skin, pawR, stool);
    this.group.name = 'emoteFx';
  }

  static wanted(anim: Anim) {
    return !NONE.includes(anim as EmoteAnim);
  }

  /** One of the floating pictures this frame (sprites reused from frame to frame, and between emotes). */
  private put: Add = (g, color, x, y, z, size, opacity = 1, rot = 0, glow = false) => {
    if (opacity <= 0.01) return;
    let s = this.sprites[this.used];
    if (!s) {
      s = spareSprites.pop() ?? new THREE.Sprite(new THREE.SpriteMaterial({ transparent: true, depthWrite: false }));
      this.sprites.push(s);
      this.group.add(s);
    }
    this.used++;
    const word = g in WORD;
    const map = word ? words()[WORD[g as keyof typeof WORD]] : glyphs()[G[g as keyof typeof G]];
    const m = s.material;
    if (m.map !== map) {
      m.map = map;
      m.needsUpdate = true;
    }
    m.color.set(color);
    m.opacity = opacity;
    m.rotation = rot;
    m.blending = glow ? THREE.AdditiveBlending : THREE.NormalBlending;
    s.position.set(x, y, z);
    s.scale.set(size * (word ? 8 : 2), size * 2, 1);
    s.visible = true;
  };

  update(u: number, spots: EmoteSpots) {
    this.used = 0;
    particles(this.anim, u, this.T, spots, this.put, this);
    for (let i = this.used; i < this.sprites.length; i++) this.sprites[i].visible = false;
  }

  /** Sitting on your own stool: it pops up under you. */
  perchAt(u: number) {
    const k = Math.min(1, u / 0.28);
    // (Out past full size and back.)
    const s = k < 1 ? 1 + 2.7 * Math.pow(k - 1, 3) + 1.7 * Math.pow(k - 1, 2) : 1;
    this.props.ground?.scale.setScalar(Math.max(0.001, s));
  }

  /** The puddle of tears, spreading under the face. */
  puddleAt(u: number, spots: EmoteSpots) {
    const p = this.props.ground;
    if (!p) return;
    const r = Math.min(spots.size, 0.18) * (0.35 + 1.1 * ss(u, 0.6, 3.2)) * (1 + Math.sin(u * 5) * 0.03);
    p.position.set(spots.head.x, 0.006, Math.max(spots.eyeL.z, 0.05) + 0.06);
    p.scale.set(r, 1, r * 0.8);
  }

  /** The power-up's glow round the body: grows as the power builds, flares at the burst, flickering all the while. */
  glow(build: number, burst: number, w: number, h: number, u: number) {
    let shell = this.group.getObjectByName('aura') as THREE.Mesh | undefined;
    if (!shell) {
      shell = auraShell();
      this.group.add(shell);
    }
    const fl = 1 + Math.sin(u * 31) * 0.04 + Math.sin(u * 17) * 0.03;
    const across = w * 2.4 * (0.35 + 0.65 * build + 0.35 * burst) * fl;
    shell.scale.set(across, h * (0.6 + 0.6 * build + 0.3 * burst) * fl, across);
    shell.rotation.y = u * 3;
    shell.visible = build + burst > 0.03;
  }

  /**
   * The animation's over: anything left on the ground (a stool, a puddle) stays where it was in the world and goes
   * in a moment, rather than with the animal. False if there's nothing to wait for.
   */
  leave(root: THREE.Object3D, t: number): boolean {
    const g = this.props.ground;
    if (!g) return false;
    const world = root.parent;
    if (world) {
      world.attach(g);
      world.attach(this.group);
    }
    this.props.r?.removeFromParent();
    this.props.l?.removeFromParent();
    this.gone = t;
    this.goneScale.copy(g.scale);
    return true;
  }

  /** On its way (after leave): shrinking away, the stool in a puff. False once it's gone. */
  leaving(t: number): boolean {
    const k = (t - this.gone) / 0.35;
    const g = this.props.ground;
    if (!g || k >= 1 || k < 0) return false;
    this.used = 0;
    if (this.anim === 'perch') {
      g.scale.setScalar(Math.max(0.001, (1 + Math.sin(k * Math.PI) * 0.15) * (1 - ss(k, 0.3, 1))));
      for (let i = 0; i < 7; i++) {
        const a = (i / 7) * TAU + 0.3;
        this.put('puff', '#f4efe6', Math.cos(a) * (0.25 + k * 0.3), 0.15 + k * 0.3, Math.sin(a) * (0.25 + k * 0.3), 0.08 + k * 0.08, 0.95 * (1 - k));
      }
    } else g.scale.copy(this.goneScale).multiplyScalar(Math.max(0.001, 1 - ss(k, 0, 1)));
    for (let i = this.used; i < this.sprites.length; i++) this.sprites[i].visible = false;
    return true;
  }

  /** The mic drop: in the paw until it's let go, then down to the floor with a bounce, and it stays there. */
  dropMic(u: number, spots: EmoteSpots, LET_GO = 1.35) {
    const mic = this.props.r;
    if (!mic) return;
    if (u < LET_GO) {
      mic.visible = true;
      if (this.dropped) this.dropped.visible = false;
      return;
    }
    mic.visible = false;
    if (!this.dropped) {
      this.dropped = mic.clone();
      this.group.add(this.dropped);
    }
    if (!this.dropped.visible) {
      this.dropped.visible = true;
      this.dropFrom.copy(spots.hand);
      this.dropAt.set(spots.hand.x, 0.02, spots.hand.z);
    }
    const k = u - LET_GO;
    const fall = 0.5 * 9.8 * k * k;
    const h = this.dropFrom.y - 0.02;
    let y = this.dropFrom.y - fall;
    let tip = Math.min(1, k * 4) * 0.6;
    if (y <= 0.02) {
      // (A small bounce, then it lies there.)
      const tf = Math.sqrt((2 * h) / 9.8);
      const kb = k - tf;
      y = 0.02 + Math.max(0, 0.06 * Math.sin(Math.min(1, kb / 0.22) * Math.PI));
      tip = 0.6 + Math.min(1, kb / 0.2) * (Math.PI / 2 - 0.6);
    }
    this.dropped.position.set(this.dropFrom.x, y + 0.015, this.dropFrom.z);
    this.dropped.rotation.set(tip, 0, 0.3);
  }

  dispose() {
    for (const s of this.sprites) {
      s.removeFromParent();
      if (spareSprites.length < SPARE_SPRITES) spareSprites.push(s);
      else s.material.dispose();
    }
    this.sprites = [];
    const free = (o: THREE.Object3D) =>
      o.traverse((x) => {
        const m = x as THREE.Mesh;
        // (A stool's shape is shared with the ones round the dais, and the puddle's and the glow's kept.)
        if (!m.isMesh || m.userData.shared) return;
        m.geometry.dispose();
        // (Fingers are the animal's own coat.)
        if (!m.userData.skin && !kept.has(m.material as THREE.Material)) (m.material as THREE.Material).dispose();
      });
    if (this.props.r) free(this.props.r);
    if (this.props.l) free(this.props.l);
    if (this.props.ground) free(this.props.ground);
    this.props.r?.removeFromParent();
    this.props.l?.removeFromParent();
    this.props.ground?.removeFromParent();
    // (The dropped mic is a clone sharing the mic's geometry and materials, freed above.)
    this.group.removeFromParent();
  }
}
