import * as THREE from 'three';
import type { CasinoView } from '../../casino/types';
import { HIDDEN } from '../../casino/types';
import { buildAnimal, type Rig } from '../animals';
import type { Anim } from '../types';
import { BJ_DEALER, BJ_TABLE, CASHIER, FELT_Y, STEP, PK_DEALER, PK_TABLE, bjSpot, pkAround } from './casinoLayout';

/**
 * What's on the casino's tables, drawn in the room: the cards (face up where this player may see them, backs
 * otherwise), the chips, the pot and the dealer button, a glow at the seat whose turn it is; and the three staff,
 * a raccoon dealing blackjack, a fox dealing poker and an otter at the pet shop's till.
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

export interface CasinoTables {
  group: THREE.Group;
  /** What's on the tables now (null: nothing to show, nobody's playing). */
  set(view: CasinoView | null): void;
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
  // Whose turn it is: a soft gold glow on the felt in front of them.
  const turnGlow = new THREE.Mesh(new THREE.CircleGeometry(0.32, 28), new THREE.MeshBasicMaterial({ color: '#ffd76b', transparent: true, opacity: 0.35, depthWrite: false }));
  turnGlow.rotation.x = -Math.PI / 2;
  turnGlow.visible = false;
  group.add(turnGlow);

  const staff = {
    bj: new Staff({ animal: 'raccoon', color: '#8a8c94', hat: 'tophat' }, BJ_DEALER, group),
    pk: new Staff({ animal: 'fox', color: '#e2793a', hat: 'tophat' }, PK_DEALER, group),
    shop: new Staff({ animal: 'otter', color: '#8a5a36', hat: null }, CASHIER, group),
  };
  // The staff stand on steps behind their counters, to see over them.
  staff.shop.rig.root.position.y = 0.3;
  staff.bj.rig.root.position.y = STEP;
  staff.pk.rig.root.position.y = STEP;

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
    set(view) {
      if (view === last && view) return;
      const k = view ? JSON.stringify([view.bj, view.pk.seats, view.pk.board, view.pk.pot, view.pk.turn, view.pk.button]) : '';
      if (k === key) return;
      key = k;
      // The dealers deal when cards come out; the cashier waves after a sale.
      if (view && last) {
        const count = (v: CasinoView) => v.bj.reduce((n, s) => n + (s ? s.cards.length + s.dealer.length : 0), 0);
        if (count(view) > count(last)) staff.bj.busy('work', 0.9, now);
        const pkCount = (v: CasinoView) => v.pk.board.length + v.pk.seats.reduce((n, s) => n + (s?.cards.length ?? 0), 0);
        if (pkCount(view) !== pkCount(last)) staff.pk.busy('work', 1.1, now);
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
    },
  };
}

/** The table's middle, at felt height, for the seated camera to look across. */
export const tableCentre = (kind: 'blackjack' | 'poker') =>
  kind === 'poker' ? new THREE.Vector3(PK_TABLE.x, FELT_Y, PK_TABLE.z) : new THREE.Vector3(BJ_TABLE.x, FELT_Y, BJ_TABLE.z + 0.45);
