import * as THREE from 'three';
import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import type { CasinoView } from '../../casino/types';
import { BJ_SEATS, HIDDEN, PK_SEATS, RL_SEATS } from '../../casino/types';
import { buildAnimal, type Rig } from '../animals';
import type { Anim } from '../types';
import { BJ_DEALER, CASHIER, FELT_Y, STEP, PK_DEALER, PK_TABLE, RL_BOARD, RL_CROUPIER, RL_WHEEL, bjSpot, pkAround, rlCell, rlSeat } from './casinoLayout';
import { BET_KEYS, WHEEL, betName, boardCell, colourOf } from '../../casino/roulette';
import { makeSlotMachines } from './slotReels';
import { shownName, useNicks } from '../../state/nicks';

/**
 * What's on the casino's tables, drawn in the room: the cards (face up where this player may see them, backs
 * otherwise), the chips, the pot and the dealer button, a glow at the seat whose turn it is; and the three staff,
 * a raccoon dealing blackjack, a fox dealing poker and an otter at the pet shop's till; and the slot machines' reels
 * and levers (slotReels.ts). And for whoever is sitting at a table, looking across it from their seat, a plate in front
 * of everyone else there: their name, their chips, and how they stand (folded, to play, bust).
 */

export const CARD_W = 0.19;
export const CARD_H = 0.265;
const COLS = 14;
const ROWS = 4;
const CW = 96;
const CH = 132;
/** The felt's top, with room for the town's builder nudging shapes apart (see kit.ts). */
const TOP = FELT_Y + 0.012;
const SUIT_SYM: Record<string, string> = { s: '♠', h: '♥', d: '♦', c: '♣' };
const RANK_TXT: Record<string, string> = { T: '10', J: 'J', Q: 'Q', K: 'K', A: 'A' };

/** Every card face (and the back) drawn once on one canvas. Column 13 of the first row is the back. */
function cardAtlas(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = CW * COLS;
  canvas.height = CH * ROWS;
  const g = canvas.getContext('2d')!;
  const round = (x: number, y: number, w: number, h: number, r: number) => {
    g.beginPath();
    g.moveTo(x + r, y);
    g.arcTo(x + w, y, x + w, y + h, r);
    g.arcTo(x + w, y + h, x, y + h, r);
    g.arcTo(x, y + h, x, y, r);
    g.arcTo(x, y, x + w, y, r);
    g.closePath();
  };
  const ranks = '23456789TJQKA';
  ['s', 'h', 'd', 'c'].forEach((suit, row) => {
    for (let k = 0; k < 13; k++) {
      const x = k * CW;
      const y = row * CH;
      round(x + 3, y + 3, CW - 6, CH - 6, 10);
      g.fillStyle = '#fffaf0';
      g.fill();
      g.lineWidth = 2;
      g.strokeStyle = '#d8cbb0';
      g.stroke();
      const red = suit === 'h' || suit === 'd';
      g.fillStyle = red ? '#c8303a' : '#1d1a24';
      const rank = RANK_TXT[ranks[k]] ?? ranks[k];
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      g.font = `700 ${rank.length > 1 ? 30 : 36}px Fredoka, "Trebuchet MS", sans-serif`;
      g.fillText(rank, x + 24, y + 28);
      g.font = '28px "Segoe UI Symbol", "DejaVu Sans", sans-serif';
      g.fillText(SUIT_SYM[suit], x + 24, y + 58);
      g.font = '62px "Segoe UI Symbol", "DejaVu Sans", sans-serif';
      g.fillText(SUIT_SYM[suit], x + CW / 2 + 8, y + CH / 2 + 22);
    }
  });
  // The back: deep red with a gold lattice and a gold border.
  const x = 13 * CW;
  round(x + 3, 3, CW - 6, CH - 6, 10);
  g.fillStyle = '#fffaf0';
  g.fill();
  round(x + 9, 9, CW - 18, CH - 18, 7);
  g.fillStyle = '#8a1f33';
  g.fill();
  g.save();
  g.clip();
  g.strokeStyle = 'rgba(246, 215, 122, 0.55)';
  g.lineWidth = 2;
  for (let d = -CH; d < CW + CH; d += 12) {
    g.beginPath();
    g.moveTo(x + d, 0);
    g.lineTo(x + d + CH, CH);
    g.moveTo(x + d + CH, 0);
    g.lineTo(x + d, CH);
    g.stroke();
  }
  g.restore();
  g.fillStyle = '#f6d77a';
  g.font = '36px "Segoe UI Symbol", "DejaVu Sans", sans-serif';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillText('♦', x + CW / 2, CH / 2);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

/** One flat card's geometry, its UVs on the atlas. */
const cardGeos = new Map<string, THREE.BufferGeometry>();
function cardGeo(card: string): THREE.BufferGeometry {
  let geo = cardGeos.get(card);
  if (geo) return geo;
  const back = card === HIDDEN;
  const col = back ? 13 : '23456789TJQKA'.indexOf(card[0]);
  const row = back ? 0 : 'shdc'.indexOf(card[1]);
  geo = new THREE.PlaneGeometry(CARD_W, CARD_H);
  // Lying flat, its top towards -z.
  geo.rotateX(-Math.PI / 2);
  const uv = geo.getAttribute('uv') as THREE.BufferAttribute;
  for (let i = 0; i < uv.count; i++) {
    const u = (col + uv.getX(i)) / COLS;
    const v = 1 - (row + 1 - uv.getY(i)) / ROWS;
    uv.setXY(i, u, v);
  }
  cardGeos.set(card, geo);
  return geo;
}

const CHIP_COLORS: [number, string][] = [
  [25, '#2f7a4f'],
  [5, '#c8303a'],
  [1, '#f4efe6'],
];

/** A stack (or a few) of chips for an amount: greens for 25s, reds for fives, whites for ones. */
function chipColors(amount: number): string[] {
  const out: string[] = [];
  let left = Math.max(0, Math.round(amount));
  for (const [value, color] of CHIP_COLORS) {
    while (left >= value && out.length < 24) {
      out.push(color);
      left -= value;
    }
  }
  return out;
}

class Staff {
  rig: Rig;
  private busyUntil = 0;
  private anim: Anim = 'idle';
  constructor(animal: Parameters<typeof buildAnimal>[0], at: { x: number; z: number; ry: number }, group: THREE.Group) {
    this.rig = buildAnimal(animal);
    this.rig.root.position.set(at.x, 0, at.z);
    this.rig.root.rotation.y = at.ry;
    group.add(this.rig.root);
  }
  /** A moment of dealing (or waving), from now. */
  busy(anim: Anim, s: number, t: number) {
    this.anim = anim;
    this.busyUntil = t + s;
  }
  update(dt: number, t: number) {
    if (t > this.busyUntil) this.anim = 'idle';
    this.rig.update({ anim: this.anim, speed: 0, dt, t });
  }
}

/** Where a blackjack seat's bet sits: on its ring, to the right of the cards (so it never hides them). */
const betSpot = (i: number) => {
  const p = bjSpot(i, 1.3);
  return { x: p.x + Math.cos(p.ry) * 0.3, z: p.z - Math.sin(p.ry) * 0.3 };
};

// ---------------------------------------------------------------- roulette

const RL_COLOURS = { red: '#c8303a', black: '#1d1a24', green: '#2f8a4f' };

/** The betting board, painted on a canvas to lie on the felt (the same cells as the panel's board). */
function boardTexture(): THREE.CanvasTexture {
  const S = 64;
  const canvas = document.createElement('canvas');
  canvas.width = 14 * S;
  canvas.height = 5 * Math.round(S * (RL_BOARD.ch / RL_BOARD.cw));
  const H = canvas.height / 5;
  const g = canvas.getContext('2d')!;
  g.fillStyle = '#2f7a4f';
  g.fillRect(0, 0, canvas.width, canvas.height);
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  for (const key of BET_KEYS) {
    const c = boardCell(key);
    const x = c.col * S;
    const y = c.row * H;
    const w = c.w * S;
    const h = c.h * H;
    const n = key[0] === 'n' ? Number(key.slice(1)) : null;
    if (n !== null || key === 'red' || key === 'black') {
      const col = n !== null ? colourOf(n) : (key as 'red' | 'black');
      g.fillStyle = RL_COLOURS[col];
      if (n !== null) g.fillRect(x + 5, y + 5, w - 10, h - 10);
      else {
        // A diamond of the colour, as on a real layout.
        g.beginPath();
        g.moveTo(x + w / 2, y + 8);
        g.lineTo(x + w - 14, y + h / 2);
        g.lineTo(x + w / 2, y + h - 8);
        g.lineTo(x + 14, y + h / 2);
        g.closePath();
        g.fill();
      }
    }
    g.strokeStyle = '#f6efe0';
    g.lineWidth = 3;
    g.strokeRect(x + 1.5, y + 1.5, w - 3, h - 3);
    if (key !== 'red' && key !== 'black') {
      g.fillStyle = '#f6efe0';
      g.font = `600 ${n !== null ? 34 : 30}px Fredoka, "Trebuchet MS", sans-serif`;
      // (Upright for the players along the front.)
      g.fillText(betName(key), x + w / 2, y + h / 2);
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

/** The wheel's face: 37 pockets in their colours, numbered round the rim. */
function rotorTexture(): THREE.CanvasTexture {
  const S = 512;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = S;
  const g = canvas.getContext('2d')!;
  const c = S / 2;
  const step = (Math.PI * 2) / 37;
  // A pocket at angle φ on the wheel lies at (sin φ, cos φ), which on this face is (c + r sin φ, c + r cos φ).
  const at = (phi: number, r: number) => [c + r * Math.sin(phi), c + r * Math.cos(phi)] as const;
  WHEEL.forEach((n, k) => {
    const a0 = k * step - step / 2;
    g.beginPath();
    g.moveTo(...at(a0, c * 0.55));
    for (let j = 0; j <= 6; j++) g.lineTo(...at(a0 + (step * j) / 6, c));
    for (let j = 6; j >= 0; j--) g.lineTo(...at(a0 + (step * j) / 6, c * 0.55));
    g.closePath();
    g.fillStyle = RL_COLOURS[colourOf(n)];
    g.fill();
    g.save();
    const [x, y] = at(k * step, c * 0.87);
    g.translate(x, y);
    g.rotate(-k * step + Math.PI);
    g.fillStyle = '#f6efe0';
    g.font = '600 26px Fredoka, "Trebuchet MS", sans-serif';
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillText(String(n), 0, 0);
    g.restore();
  });
  g.beginPath();
  g.arc(c, c, c * 0.55, 0, Math.PI * 2);
  g.fillStyle = '#7a4a2a';
  g.fill();
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

const POCKET_R = 0.235;
const TRACK_R = 0.355;
const ROTOR_R = 0.3;
/** The rotor turns slowly all the time, and three whole turns more over a spin. */
const IDLE_SPIN = 0.6;
const ease = (p: number) => 1 - Math.pow(1 - p, 3);
const smooth01 = (p: number) => (p <= 0 ? 0 : p >= 1 ? 1 : p * p * (3 - 2 * p));

/** The wheel at the end of the roulette table, its ball, and the croupier's marker on the winning number. */
function makeWheel(group: THREE.Group) {
  const w = new THREE.Group();
  w.position.set(RL_WHEEL.x, FELT_Y, RL_WHEEL.z);
  group.add(w);
  const wood = new THREE.MeshLambertMaterial({ color: '#6a3a22' });
  const bowl = new THREE.Mesh(
    new THREE.LatheGeometry([new THREE.Vector2(RL_WHEEL.r + 0.02, 0), new THREE.Vector2(RL_WHEEL.r + 0.03, 0.12), new THREE.Vector2(RL_WHEEL.r - 0.01, 0.13), new THREE.Vector2(TRACK_R, 0.1), new THREE.Vector2(ROTOR_R + 0.01, 0.07), new THREE.Vector2(ROTOR_R, 0.06)], 48),
    wood,
  );
  bowl.receiveShadow = true;
  bowl.castShadow = true;
  w.add(bowl);
  const rotor = new THREE.Group();
  rotor.position.y = 0.06;
  w.add(rotor);
  const face = new THREE.Mesh(new THREE.CircleGeometry(ROTOR_R, 74), new THREE.MeshLambertMaterial({ map: rotorTexture() }));
  face.rotation.x = -Math.PI / 2;
  face.position.y = 0.002;
  rotor.add(face);
  const gold = new THREE.MeshLambertMaterial({ color: '#d8b04a', emissive: '#5a4010', emissiveIntensity: 0.3 });
  // The frets between the pockets, and the turret in the middle with its cross.
  const fretGeo = new THREE.BoxGeometry(0.004, 0.018, 0.075);
  for (let k = 0; k < 37; k++) {
    const a = ((k + 0.5) / 37) * Math.PI * 2;
    const f = new THREE.Mesh(fretGeo, gold);
    f.position.set(Math.sin(a) * (ROTOR_R * 0.775), 0.009, Math.cos(a) * (ROTOR_R * 0.775));
    f.rotation.y = a;
    rotor.add(f);
  }
  const turret = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.07, 24), gold);
  turret.position.y = 0.035;
  rotor.add(turret);
  for (const ry of [0, Math.PI / 2]) {
    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.012, 0.012), gold);
    arm.position.y = 0.08;
    arm.rotation.y = ry;
    rotor.add(arm);
  }
  const ball = new THREE.Mesh(new THREE.SphereGeometry(0.014, 12, 8), new THREE.MeshLambertMaterial({ color: '#fbf8f0', emissive: '#444444' }));
  ball.castShadow = true;
  ball.visible = false;
  w.add(ball);
  const dolly = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.04, 0.07, 16), gold);
  dolly.visible = false;
  group.add(dolly);
  const pocketOf = (n: number) => (WHEEL.indexOf(n) / 37) * Math.PI * 2;
  return {
    /** Where everything is at this moment, on the host's clock (ms). */
    update(ms: number, spin: CasinoView['rl']['spin'], stage: CasinoView['rl']['stage'] | null) {
      const rotorAt = (t: number) => {
        const p = spin ? Math.min(1, Math.max(0, (t - spin.at) / (spin.until - spin.at))) : 1;
        return ((t / 1000) * IDLE_SPIN) % (Math.PI * 2) + Math.PI * 6 * ease(p);
      };
      rotor.rotation.y = rotorAt(ms);
      ball.visible = Boolean(spin);
      dolly.visible = Boolean(spin && stage === 'result');
      if (!spin) return;
      const p = Math.min(1, Math.max(0, (ms - spin.at) / (spin.until - spin.at)));
      // The ball runs the other way round the track, slows, drops in, bounces once and rides in its pocket.
      const settled = rotor.rotation.y + pocketOf(spin.n);
      const angle = settled + Math.PI * 2 * 7 * (1 - p) * (1 - p);
      const drop = smooth01((p - 0.62) / 0.2);
      const bounce = p > 0.82 && p < 0.95 ? Math.sin(((p - 0.82) / 0.13) * Math.PI) * 0.03 : 0;
      const r = TRACK_R + (POCKET_R - TRACK_R) * drop + bounce;
      ball.position.set(Math.sin(angle) * r, 0.105 - 0.035 * drop + bounce * 0.5 + 0.014, Math.cos(angle) * r);
      if (dolly.visible) {
        const c = boardCell(`n${spin.n}`);
        const at = rlCell(c.col + c.w / 2 - 0.5, c.row + c.h / 2 - 0.5);
        dolly.position.set(at.x, TOP + 0.035, at.z);
      }
    },
  };
}

/** The tables you can sit at and look across. */
export type SeatTable = 'blackjack' | 'poker' | 'roulette';

export interface CasinoTables {
  group: THREE.Group;
  /** What's on the tables now (null: nothing to show, nobody's playing), and how far the host's clock is ahead of ours. */
  set(view: CasinoView | null, hostOffset?: number): void;
  /** The table we're sitting at, looking across it from our seat (null: not sitting at one): its plates show. */
  seatView(table: SeatTable | null): void;
  update(dt: number, t: number): void;
}

export function makeCasinoTables(): CasinoTables {
  const group = new THREE.Group();
  group.name = 'casino-tables';
  const atlas = cardAtlas();
  const cardMat = new THREE.MeshLambertMaterial({ map: atlas, transparent: true, alphaTest: 0.3 });
  const chipGeo = new THREE.CylinderGeometry(0.048, 0.048, 0.016, 18);
  const chipMats = new Map<string, THREE.MeshLambertMaterial>();
  const chipMat = (c: string) => {
    let m = chipMats.get(c);
    if (!m) chipMats.set(c, (m = new THREE.MeshLambertMaterial({ color: c, emissive: c, emissiveIntensity: 0.08 })));
    return m;
  };
  const items = new THREE.Group();
  group.add(items);

  // Felt markings: a betting ring at each blackjack seat, and the board's outline on the poker table.
  const ringMat = new THREE.MeshBasicMaterial({ color: '#f6d77a', transparent: true, opacity: 0.55 });
  for (let i = 0; i < 5; i++) {
    const p = betSpot(i);
    const ring = new THREE.Mesh(new THREE.RingGeometry(0.1, 0.12, 28), ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.set(p.x, TOP, p.z);
    group.add(ring);
  }
  {
    // A gold line round the poker felt, inside the rail.
    const line = new THREE.Mesh(new THREE.RingGeometry(0.975, 1, 72), ringMat);
    line.rotation.x = -Math.PI / 2;
    line.scale.set(PK_TABLE.rx - 0.28, PK_TABLE.rz - 0.28, 1);
    line.position.set(PK_TABLE.x, TOP, PK_TABLE.z);
    group.add(line);
    const board = new THREE.Mesh(new THREE.PlaneGeometry(1.15, 0.33), new THREE.MeshBasicMaterial({ color: '#f6d77a', transparent: true, opacity: 0.12 }));
    board.rotation.x = -Math.PI / 2;
    board.position.set(PK_TABLE.x, TOP, PK_TABLE.z);
    group.add(board);
  }
  // The roulette board on its felt, and the wheel.
  {
    const board = new THREE.Mesh(new THREE.PlaneGeometry(14 * RL_BOARD.cw, 5 * RL_BOARD.ch), new THREE.MeshLambertMaterial({ map: boardTexture() }));
    board.rotation.x = -Math.PI / 2;
    board.position.set(RL_BOARD.x, TOP, RL_BOARD.z);
    board.receiveShadow = true;
    group.add(board);
  }
  const wheel = makeWheel(group);
  const slots = makeSlotMachines(group);
  let offset = 0;
  // Whose turn it is: a soft gold glow on the felt in front of them.
  const turnGlow = new THREE.Mesh(new THREE.CircleGeometry(0.32, 28), new THREE.MeshBasicMaterial({ color: '#ffd76b', transparent: true, opacity: 0.35, depthWrite: false }));
  turnGlow.rotation.x = -Math.PI / 2;
  turnGlow.visible = false;
  group.add(turnGlow);

  const plates = makePlates(group);

  const staff = {
    bj: new Staff({ animal: 'raccoon', color: '#8a8c94', hat: 'tophat' }, BJ_DEALER, group),
    pk: new Staff({ animal: 'fox', color: '#e2793a', hat: 'tophat' }, PK_DEALER, group),
    shop: new Staff({ animal: 'otter', color: '#8a5a36', hat: null }, CASHIER, group),
    rl: new Staff({ animal: 'penguin', color: '#2a2a33', hat: 'tophat' }, RL_CROUPIER, group),
  };
  // The staff stand on steps behind their counters, to see over them.
  staff.shop.rig.root.position.y = 0.3;
  staff.bj.rig.root.position.y = STEP;
  staff.pk.rig.root.position.y = STEP;
  staff.rl.rig.root.position.y = STEP;

  const card = (c: string, x: number, z: number, ry: number, lift = 0) => {
    const m = new THREE.Mesh(cardGeo(c), cardMat);
    m.position.set(x, TOP + 0.004 + lift, z);
    m.rotation.y = ry;
    m.receiveShadow = true;
    items.add(m);
  };
  /** A hand fanned sideways along the direction `ry` faces (cards overlapping, each a hair higher). */
  const hand = (cards: string[], x: number, z: number, ry: number, gap = 0.06) => {
    const n = cards.length;
    const ax = Math.cos(ry);
    const az = -Math.sin(ry);
    cards.forEach((c, k) => {
      const o = (k - (n - 1) / 2) * gap;
      card(c, x + ax * o, z + az * o, ry, k * 0.0015);
    });
  };
  const chips = (amount: number, x: number, z: number) => {
    const cols = chipColors(amount);
    // Up to eight a stack, stacks side by side.
    cols.forEach((c, k) => {
      const m = new THREE.Mesh(chipGeo, chipMat(c));
      const stack = Math.floor(k / 8);
      m.position.set(x + stack * 0.1, TOP + 0.008 + (k % 8) * 0.017, z + (stack % 2) * 0.03);
      m.castShadow = true;
      items.add(m);
    });
  };
  let button: THREE.Mesh | null = null;

  let key = '';
  let last: CasinoView | null = null;
  let now = 0;

  return {
    group,
    seatView(table) {
      plates.show(table);
    },
    set(view, hostOffset = 0) {
      offset = hostOffset;
      plates.set(view);
      if (view === last && view) return;
      slots.set(view?.sl ?? null);
      const k = view ? JSON.stringify([view.bj, view.pk.seats, view.pk.board, view.pk.pot, view.pk.turn, view.pk.button, view.rl?.seats, view.rl?.stage]) : '';
      if (k === key) return;
      key = k;
      // The dealers deal when cards come out; the cashier waves after a sale.
      if (view && last) {
        const count = (v: CasinoView) => v.bj.reduce((n, s) => n + (s ? s.cards.length + s.dealer.length : 0), 0);
        if (count(view) > count(last)) staff.bj.busy('work', 0.9, now);
        const pkCount = (v: CasinoView) => v.pk.board.length + v.pk.seats.reduce((n, s) => n + (s?.cards.length ?? 0), 0);
        if (pkCount(view) !== pkCount(last)) staff.pk.busy('work', 1.1, now);
        // The croupier throws the ball, and waves the winners in.
        if (view.rl?.stage !== last.rl?.stage && view.rl?.stage !== 'betting') staff.rl.busy(view.rl?.stage === 'spinning' ? 'work' : 'wave', 1.4, now);
      }
      last = view;
      items.clear();
      turnGlow.visible = false;
      if (!view) return;
      view.bj.forEach((s, i) => {
        if (!s) return;
        // The cards' tops point away from the seat, towards the dealer.
        const ry = bjSpot(i, 1).ry;
        const mine = bjSpot(i, 1.12);
        if (s.cards.length) hand(s.cards, mine.x, mine.z, ry, 0.08);
        const theirs = bjSpot(i, 0.62);
        if (s.dealer.length) hand(s.dealer, theirs.x, theirs.z, ry, 0.06);
        const bet = betSpot(i);
        if (s.bet && s.state !== 'betting') chips(s.state === 'done' ? s.paid : s.bet, bet.x, bet.z);
        if (s.mine && s.state === 'playing') {
          turnGlow.visible = true;
          turnGlow.position.set(mine.x, TOP + 0.001, mine.z);
        }
      });
      const pk = view.pk;
      pk.seats.forEach((s, i) => {
        if (!s) return;
        const at = pkAround(i, -0.42);
        // (Facing the middle; the cards' tops point that way too.)
        const ry = at.ry + Math.PI;
        if (s.cards.length) hand(s.cards, at.x, at.z, ry, 0.1);
        const stack = pkAround(i, -0.16);
        const side = { x: Math.cos(at.ry) * 0.32, z: -Math.sin(at.ry) * 0.32 };
        if (s.stack) chips(s.stack, stack.x + side.x, stack.z + side.z);
        const bet = pkAround(i, -0.72);
        if (s.bet) chips(s.bet, bet.x, bet.z);
        if (pk.turn === i) {
          turnGlow.visible = true;
          turnGlow.position.set(at.x, TOP + 0.001, at.z);
        }
      });
      if (pk.board.length) hand(pk.board, PK_TABLE.x, PK_TABLE.z, 0, CARD_W + 0.02);
      const inPot = pk.pot - pk.seats.reduce((n, s) => n + (s?.bet ?? 0), 0);
      if (inPot > 0 && pk.stage !== 'showdown') chips(inPot, PK_TABLE.x - 0.08, PK_TABLE.z - 0.32);
      // Everyone's chips on the roulette board, each seat's a little apart from the others'.
      view.rl?.seats.forEach((s, i) => {
        if (!s) return;
        for (const [key, amount] of Object.entries(s.bets)) {
          const c = boardCell(key);
          const at = rlCell(c.col + c.w / 2 - 0.5, c.row + c.h / 2 - 0.5);
          chips(amount, at.x + ((i % 3) - 1) * 0.025, at.z + (Math.floor(i / 3) - 0.5) * 0.03);
        }
      });
      if (pk.button !== null && pk.seats[pk.button]) {
        button ??= new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.02, 20), new THREE.MeshLambertMaterial({ color: '#fffaf0' }));
        const b = pkAround(pk.button, -0.3);
        const side = { x: Math.cos(b.ry) * -0.24, z: -Math.sin(b.ry) * -0.24 };
        button.position.set(b.x + side.x, TOP + 0.01, b.z + side.z);
        items.add(button);
      }
    },
    update(dt, t) {
      now = t;
      staff.bj.update(dt, t);
      staff.pk.update(dt, t);
      staff.shop.update(dt, t);
      staff.rl.update(dt, t);
      wheel.update(Date.now() + offset, last?.rl?.spin ?? null, last?.rl?.stage ?? null);
      slots.update(Date.now() + offset);
    },
  };
}


const money = (n: number) => `$${n}`;

/** One plate's lines: the name, then the chips and how they stand; `kind` colours it (their turn, folded, a win). */
type Plate = { name: string; chips: string; state: string; kind: string } | null;

/** What each table's plates say, seat by seat (nobody's own: they're the one looking). */
function plateLines(view: CasinoView, table: SeatTable): Plate[] {
  if (table === 'poker') {
    const pk = view.pk;
    return pk.seats.map((s, i) => {
      if (!s || s.mine) return null;
      const turn = pk.turn === i;
      const showdown = pk.stage === 'showdown';
      const state = s.out
        ? 'Sitting out'
        : showdown && s.won > 0
          ? `Wins ${money(s.won)}`
          : s.folded
            ? 'Folded'
            : s.allIn
              ? 'All in'
              : turn
                ? 'To play…'
                : !s.inHand && pk.stage !== 'waiting'
                  ? 'Next hand'
                  : (s.last ?? '');
      const kind = turn ? 'turn' : showdown && s.won > 0 ? 'won' : s.folded || s.out ? 'folded' : '';
      const chips = `${money(s.stack)}${s.bet ? ` · bet ${money(s.bet)}` : ''}${pk.button === i ? ' · D' : ''}`;
      return { name: s.name, chips, state, kind };
    });
  }
  if (table === 'blackjack') {
    return view.bj.map((s) => {
      if (!s || s.mine) return null;
      const said: Record<string, string> = { blackjack: 'Blackjack!', win: 'Wins', push: 'Push', lose: 'Loses', bust: 'Bust' };
      const state = s.state === 'betting' ? 'Betting…' : s.state === 'playing' ? 'Playing…' : s.state === 'dealer' ? 'Dealer’s turn' : s.result ? said[s.result] : '';
      const kind = s.state === 'playing' ? 'turn' : s.result === 'blackjack' || s.result === 'win' ? 'won' : s.result === 'bust' || s.result === 'lose' ? 'folded' : '';
      return { name: s.name, chips: s.bet ? `bet ${money(s.bet)}` : '', state, kind };
    });
  }
  return view.rl.seats.map((s) => {
    if (!s || s.mine) return null;
    const down = Object.values(s.bets).reduce((n, b) => n + b, 0);
    const result = view.rl.stage === 'result' && s.staked ? (s.won ? `Wins ${money(s.won)}` : 'No luck') : '';
    const state = result || (s.ready ? 'Ready' : down ? 'Betting…' : '');
    return { name: s.name, chips: down ? `on the board ${money(down)}` : '', state, kind: result ? (s.won ? 'won' : 'folded') : s.ready ? 'ready' : '' };
  });
}

/**
 * Where a seat's plate stands (its bottom edge): just above the table's edge in front of them, below their face and
 * clear of their cards. (Across the poker table it's kept low, to stay in the seat's view.)
 */
function plateSpot(table: SeatTable, i: number): { x: number; y: number; z: number } {
  if (table === 'poker') return { ...pkAround(i, 0.05), y: TOP + 0.1 };
  if (table === 'blackjack') return { ...bjSpot(i, 1.78), y: TOP + 0.3 };
  const s = rlSeat(i);
  return { x: s.x - Math.sin(s.ry) * 0.38, y: TOP + 0.3, z: s.z - Math.cos(s.ry) * 0.38 };
}

/** The plates round each table, shown only while we're sitting at it. */
function makePlates(group: THREE.Group) {
  const counts: Record<SeatTable, number> = { poker: PK_SEATS, blackjack: BJ_SEATS, roulette: RL_SEATS };
  const all = {} as Record<SeatTable, { obj: CSS2DObject; el: HTMLDivElement; key: string }[]>;
  for (const table of Object.keys(counts) as SeatTable[]) {
    all[table] = Array.from({ length: counts[table] }, (_, i) => {
      const el = document.createElement('div');
      el.className = 'seat-plate';
      const obj = new CSS2DObject(el);
      obj.center.set(0.5, 1);
      const at = plateSpot(table, i);
      obj.position.set(at.x, at.y, at.z);
      obj.visible = false;
      group.add(obj);
      return { obj, el, key: '' };
    });
  }
  let table: SeatTable | null = null;
  let last: CasinoView | null = null;
  let nicks = useNicks.getState();
  const draw = () => {
    for (const t of Object.keys(all) as SeatTable[]) {
      const lines = t === table && last ? plateLines(last, t) : [];
      all[t].forEach((p, i) => {
        const l = lines[i] ?? null;
        p.obj.visible = Boolean(l);
        if (!l) return;
        const key = `${l.name}|${l.chips}|${l.state}|${l.kind}|${shownName(l.name)}`;
        if (key === p.key) return;
        p.key = key;
        p.el.className = `seat-plate${l.kind ? ` is-${l.kind}` : ''}`;
        p.el.replaceChildren();
        const name = document.createElement('b');
        name.textContent = shownName(l.name);
        p.el.append(name);
        for (const [text, cls] of [
          [l.chips, 'seat-plate-chips'],
          [l.state, 'seat-plate-state'],
        ]) {
          if (!text) continue;
          const span = document.createElement('span');
          span.className = cls;
          span.textContent = text;
          p.el.append(span);
        }
      });
    }
  };
  return {
    show(t: SeatTable | null) {
      if (t === table) return;
      table = t;
      draw();
    },
    set(view: CasinoView | null) {
      const n = useNicks.getState();
      if (view === last && n === nicks) return;
      last = view;
      nicks = n;
      draw();
    },
  };
}
