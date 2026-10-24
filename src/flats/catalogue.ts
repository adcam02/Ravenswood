/**
 * Wren Court, the apartment block: every player has a flat in it, under the name their profile is kept by, which they
 * furnish with things bought with their money. This is the furniture shop's catalogue, the grid a flat is laid out
 * on, and the checks a layout has to pass (the same on the Storyteller's side, which keeps it, and the player's,
 * which shows what will fit before sending it).
 *
 * A flat is 10 by 8 metres, cut into half-metre cells: 20 across (x, left to right as the camera sees it) and 16
 * deep (z, from the back wall towards the camera). The door is in the middle of the front, and the cells in front of
 * it stay clear. Floor pieces stand on the cells they cover and can't overlap; rugs lie under them; wall pieces hang
 * on the back wall or either side wall.
 */

export const CELL = 0.5;
export const COLS = 20;
export const ROWS = 16;
/** Half the room's width and depth, in metres (it's centred on 0,0, like every room). */
export const FLAT_HW = (COLS * CELL) / 2;
export const FLAT_HD = (ROWS * CELL) / 2;
/** At most this many pieces out in a flat, and owned in all. */
export const MAX_PLACED = 60;
export const MAX_OWNED = 150;
/** At most this many of any one piece. */
export const MAX_EACH = 12;

export type PieceKind = 'floor' | 'rug' | 'wall';
export type Shelf = 'seat' | 'table' | 'fun' | 'green' | 'rug' | 'wall';

export interface Piece {
  id: string;
  name: string;
  icon: string;
  price: number;
  kind: PieceKind;
  shelf: Shelf;
  /** Cells it covers, across (w) and deep (d), facing the camera; along the wall for wall pieces (d is 1). */
  w: number;
  d: number;
  /** Where you can sit on it, in metres from its middle as it faces the camera, and how high. */
  seats?: { x: number; z: number; y: number }[];
}

const P = (id: string, name: string, icon: string, price: number, shelf: Shelf, w: number, d: number, seats?: Piece['seats']): Piece => ({
  id,
  name,
  icon,
  price,
  kind: shelf === 'rug' ? 'rug' : shelf === 'wall' ? 'wall' : 'floor',
  shelf,
  w,
  d,
  seats,
});

export const PIECES: Piece[] = [
  // Somewhere to sit.
  P('chair', 'Kitchen chair', '🪑', 6, 'seat', 1, 1, [{ x: 0, z: 0, y: 0.47 }]),
  P('beanbag', 'Bean bag', '🫘', 10, 'seat', 2, 2, [{ x: 0, z: 0.05, y: 0.32 }]),
  P('armchair', 'Armchair', '💺', 15, 'seat', 2, 2, [{ x: 0, z: 0.08, y: 0.46 }]),
  P('rocker', 'Rocking chair', '🪑', 22, 'seat', 2, 2, [{ x: 0, z: 0.05, y: 0.47 }]),
  P('sofa', 'Sofa', '🛋️', 40, 'seat', 4, 2, [
    { x: -0.45, z: 0.08, y: 0.46 },
    { x: 0.45, z: 0.08, y: 0.46 },
  ]),
  P('bed', 'Double bed', '🛏️', 60, 'seat', 4, 5, [
    { x: -0.42, z: 0.5, y: 0.56 },
    { x: 0.42, z: 0.5, y: 0.56 },
  ]),
  // Tables and storage.
  P('side', 'Side table & lamp', '🛋️', 14, 'table', 1, 1),
  P('coffee', 'Coffee table', '☕', 12, 'table', 3, 2),
  P('dining', 'Round table', '🍽️', 20, 'table', 3, 3),
  P('desk', 'Writing desk', '✒️', 22, 'table', 3, 2),
  P('bookshelf', 'Bookshelf', '📚', 30, 'table', 3, 1),
  P('wardrobe', 'Wardrobe', '🚪', 35, 'table', 3, 2),
  P('chest', 'Treasure chest', '🧰', 35, 'table', 2, 1),
  // Fun things.
  P('petbed', 'Pet bed', '🐾', 12, 'fun', 2, 2),
  P('globe', 'Globe', '🌍', 16, 'fun', 1, 1),
  P('easel', 'Easel', '🎨', 18, 'fun', 2, 1),
  P('birdcage', 'Birdcage', '🐦', 24, 'fun', 1, 1),
  P('gramophone', 'Gramophone', '📯', 28, 'fun', 1, 1),
  P('tree', 'Festive tree', '🎄', 30, 'fun', 2, 2),
  P('bath', 'Claw-foot bath', '🛁', 50, 'fun', 4, 2),
  P('clock', 'Grandfather clock', '🕰️', 55, 'fun', 1, 1),
  P('telescope', 'Telescope', '🔭', 65, 'fun', 2, 2),
  P('fishtank', 'Fish tank', '🐠', 70, 'fun', 3, 2),
  P('fireplace', 'Fireplace', '🔥', 90, 'fun', 4, 2),
  P('arcade', 'Arcade machine', '🕹️', 110, 'fun', 2, 2),
  P('jukebox', 'Jukebox', '🎵', 120, 'fun', 2, 2),
  P('piano', 'Piano', '🎹', 150, 'fun', 4, 2),
  // Plants and lights.
  P('cactus', 'Cactus', '🌵', 5, 'green', 1, 1),
  P('plant', 'Potted plant', '🪴', 8, 'green', 1, 1),
  P('lamp', 'Floor lamp', '💡', 10, 'green', 1, 1),
  P('fern', 'Big fern', '🌿', 18, 'green', 2, 2),
  // Rugs.
  P('rugRound', 'Round rug', '⭕', 8, 'rug', 4, 4),
  P('runner', 'Runner rug', '🟫', 12, 'rug', 6, 2),
  P('rugBig', 'Patterned rug', '🟥', 22, 'rug', 6, 4),
  // On the walls.
  P('bunting', 'Bunting', '🎏', 9, 'wall', 4, 1),
  P('shelf', 'Plant shelf', '🪴', 12, 'wall', 2, 1),
  P('wallclock', 'Wall clock', '🕐', 14, 'wall', 1, 1),
  P('painting', 'Landscape painting', '🖼️', 18, 'wall', 2, 1),
  P('mirror', 'Mirror', '🪞', 20, 'wall', 2, 1),
  P('portrait', 'Portrait', '👑', 25, 'wall', 2, 1),
  P('neon', 'Neon heart', '💖', 40, 'wall', 2, 1),
  P('trophies', 'Trophy shelf', '🏆', 45, 'wall', 3, 1),
];

export const SHELVES: { id: Shelf; name: string }[] = [
  { id: 'seat', name: 'Seats & beds' },
  { id: 'table', name: 'Tables & storage' },
  { id: 'fun', name: 'Fun things' },
  { id: 'green', name: 'Plants & lights' },
  { id: 'rug', name: 'Rugs' },
  { id: 'wall', name: 'On the walls' },
];

export const pieceById = (id: string): Piece | undefined => PIECES.find((p) => p.id === id);

// ---------------------------------------------------------------- wallpaper and floors

export interface Finish {
  id: string;
  name: string;
  price: number;
  /** The main colour, and a second one for the pattern. */
  a: string;
  b: string;
  pattern: 'plain' | 'stripes' | 'dots' | 'stars' | 'brick' | 'planks' | 'tiles' | 'carpet' | 'herring' | 'marble';
}

export const WALLS: Finish[] = [
  { id: 'cream', name: 'Cream', price: 0, a: '#f4e4cf', b: '#efd9bf', pattern: 'stripes' },
  { id: 'sage', name: 'Sage green', price: 8, a: '#c9d8b6', b: '#bccca6', pattern: 'plain' },
  { id: 'sky', name: 'Sky blue', price: 8, a: '#cfe3f2', b: '#ffffff', pattern: 'dots' },
  { id: 'mustard', name: 'Mustard', price: 10, a: '#ecc76a', b: '#e2b84f', pattern: 'plain' },
  { id: 'blush', name: 'Blush stripes', price: 12, a: '#f6d3d8', b: '#efbcc5', pattern: 'stripes' },
  { id: 'mint', name: 'Mint stripes', price: 12, a: '#d4efe2', b: '#bfe3d1', pattern: 'stripes' },
  { id: 'lavender', name: 'Lavender dots', price: 12, a: '#e2d6f2', b: '#c9b6e6', pattern: 'dots' },
  { id: 'brick', name: 'Red brick', price: 20, a: '#b8624a', b: '#d9cbb8', pattern: 'brick' },
  { id: 'night', name: 'Starry night', price: 25, a: '#2f3a6a', b: '#f6e3a0', pattern: 'stars' },
];

export const FLOORS: Finish[] = [
  { id: 'oak', name: 'Oak boards', price: 0, a: '#b07a4f', b: '#ba845a', pattern: 'planks' },
  { id: 'walnut', name: 'Walnut boards', price: 10, a: '#6e4a30', b: '#7a5236', pattern: 'planks' },
  { id: 'pink', name: 'Pink carpet', price: 12, a: '#e8a8b4', b: '#e09aa8', pattern: 'carpet' },
  { id: 'green', name: 'Green carpet', price: 12, a: '#7fae78', b: '#74a46e', pattern: 'carpet' },
  { id: 'blue', name: 'Blue tiles', price: 14, a: '#7fa8cf', b: '#e8eef4', pattern: 'tiles' },
  { id: 'checker', name: 'Black & white', price: 15, a: '#2f2a2e', b: '#f2ece0', pattern: 'tiles' },
  { id: 'herring', name: 'Herringbone', price: 20, a: '#c08a5a', b: '#a8744a', pattern: 'herring' },
  { id: 'marble', name: 'Marble', price: 30, a: '#eeeae4', b: '#cfc8c0', pattern: 'marble' },
];

export const DEFAULT_WALL = 'cream';
export const DEFAULT_FLOOR = 'oak';
export const wallById = (id: string) => WALLS.find((f) => f.id === id) ?? WALLS[0];
export const floorById = (id: string) => FLOORS.find((f) => f.id === id) ?? FLOORS[0];

// ---------------------------------------------------------------- a flat's layout

/**
 * One piece out in the flat: which piece, the cell of its back-left corner, and which way it's turned (0 faces the
 * camera, then a quarter turn clockwise at a time). A wall piece's `r` says which wall: 0 the back, 1 the left, 3 the
 * right (it faces into the room from there).
 */
export interface FlatItem {
  id: string;
  x: number;
  z: number;
  r: number;
}

export interface FlatLayout {
  wall: string;
  floor: string;
  items: FlatItem[];
}

/** Everything a profile keeps of its flat: what it owns (pieces by count, finishes by id) and how it's laid out. */
export interface FlatStore {
  owned: Record<string, number>;
  finishes: string[];
  layout: FlatLayout;
}

export const emptyLayout = (): FlatLayout => ({ wall: DEFAULT_WALL, floor: DEFAULT_FLOOR, items: [] });
export const emptyFlat = (): FlatStore => ({ owned: {}, finishes: [], layout: emptyLayout() });

/** The cells a piece covers, as [x0, z0, x1, z1] (x1, z1 exclusive), or null if it's off the grid. */
export function cellsOf(it: FlatItem, piece = pieceById(it.id)): [number, number, number, number] | null {
  if (!piece) return null;
  let w = piece.w;
  let d = piece.d;
  if (piece.kind === 'wall') {
    // Along the back wall, or down a side wall (one cell out from it).
    if (it.r === 0) d = 1;
    else [w, d] = [1, piece.w];
  } else if (it.r % 2) [w, d] = [d, w];
  const box: [number, number, number, number] = [it.x, it.z, it.x + w, it.z + d];
  if (box[0] < 0 || box[1] < 0 || box[2] > COLS || box[3] > ROWS) return null;
  if (piece.kind === 'wall') {
    if (it.r === 0 && it.z !== 0) return null;
    if (it.r === 1 && it.x !== 0) return null;
    if (it.r === 3 && it.x !== COLS - 1) return null;
    if (it.r === 2) return null;
  }
  return box;
}

/** The cells kept clear in front of the door (and the back wall's window, for wall pieces). */
const DOOR_CELLS = [8, 11, 12, 16];
const WINDOW_CELLS = [8, 0, 12, 1];
const overlaps = (a: number[], b: number[]) => a[0] < b[2] && b[0] < a[2] && a[1] < b[3] && b[1] < a[3];

/** The layer a piece is on: things only clash with things on the same one (a rug under a sofa is fine). */
const layerOf = (p: Piece, r: number) => (p.kind === 'wall' ? `wall${r}` : p.kind);

/** Why this piece can't go here among the others (`skip`: the index of itself, when moving one), or null if it fits. */
export function whyNot(items: FlatItem[], it: FlatItem, skip = -1): string | null {
  const piece = pieceById(it.id);
  if (!piece) return 'That isn’t in the catalogue';
  const box = cellsOf(it, piece);
  if (!box) return piece.kind === 'wall' ? 'That goes on a wall' : 'That’s off the edge';
  if (piece.kind !== 'wall' && overlaps(box, DOOR_CELLS)) return 'Keep the doorway clear';
  if (piece.kind === 'wall' && it.r === 0 && overlaps(box, WINDOW_CELLS)) return 'That’s the window';
  const layer = layerOf(piece, it.r);
  for (let i = 0; i < items.length; i++) {
    if (i === skip) continue;
    const other = pieceById(items[i].id);
    if (!other || layerOf(other, items[i].r) !== layer) continue;
    const ob = cellsOf(items[i], other);
    if (ob && overlaps(box, ob)) return `It bumps into the ${other.name.toLowerCase()}`;
  }
  return null;
}

/** A piece's middle in the room, in metres, and the way it faces (radians, 0 towards the camera). */
export function placeOf(it: FlatItem): { x: number; z: number; ry: number } | null {
  const piece = pieceById(it.id);
  const box = cellsOf(it, piece);
  if (!piece || !box) return null;
  const x = -FLAT_HW + ((box[0] + box[2]) / 2) * CELL;
  const z = -FLAT_HD + ((box[1] + box[3]) / 2) * CELL;
  if (piece.kind === 'wall') {
    // Flat against the wall, facing into the room.
    if (it.r === 0) return { x, z: -FLAT_HD, ry: 0 };
    return it.r === 1 ? { x: -FLAT_HW, z, ry: Math.PI / 2 } : { x: FLAT_HW, z, ry: -Math.PI / 2 };
  }
  return { x, z, ry: -(it.r * Math.PI) / 2 };
}

/** Where a wall piece would hang if it were dragged to this cell: on the nearest wall, as far along as it fits. */
export function snapToWall(piece: Piece, cx: number, cz: number): FlatItem {
  const toBack = cz;
  const toLeft = cx;
  const toRight = COLS - 1 - cx;
  const clamp = (v: number, max: number) => Math.max(0, Math.min(max, v));
  if (toBack <= Math.min(toLeft, toRight)) return { id: piece.id, x: clamp(cx - Math.floor(piece.w / 2), COLS - piece.w), z: 0, r: 0 };
  // (Not right up against the back wall, where the back wall's own pieces hang.)
  const z = Math.max(1, clamp(cz - Math.floor(piece.w / 2), ROWS - piece.w));
  return toLeft <= toRight ? { id: piece.id, x: 0, z, r: 1 } : { id: piece.id, x: COLS - 1, z, r: 3 };
}

/** A floor piece dragged so its middle is near this cell, kept on the grid. */
export function centreOn(it: FlatItem, cx: number, cz: number): FlatItem {
  const piece = pieceById(it.id);
  if (!piece) return it;
  if (piece.kind === 'wall') return { ...snapToWall(piece, cx, cz), id: it.id };
  const [w, d] = it.r % 2 ? [piece.d, piece.w] : [piece.w, piece.d];
  return { ...it, x: Math.max(0, Math.min(COLS - w, cx - Math.floor((w - 1) / 2))), z: Math.max(0, Math.min(ROWS - d, cz - Math.floor((d - 1) / 2))) };
}

/** A free spot for a piece, as near the middle of the room as there is, or null if there's no room for it. */
export function freeSpot(items: FlatItem[], id: string): FlatItem | null {
  const piece = pieceById(id);
  if (!piece) return null;
  const tries: FlatItem[] = [];
  if (piece.kind === 'wall') {
    for (let x = 0; x <= COLS - piece.w; x++) tries.push({ id, x, z: 0, r: 0 });
    for (let z = 1; z <= ROWS - piece.w; z++) tries.push({ id, x: 0, z, r: 1 }, { id, x: COLS - 1, z, r: 3 });
  } else {
    for (const r of [0, 1]) {
      const [w, d] = r ? [piece.d, piece.w] : [piece.w, piece.d];
      for (let z = 0; z <= ROWS - d; z++) for (let x = 0; x <= COLS - w; x++) tries.push({ id, x, z, r });
    }
  }
  const mid = (t: FlatItem) => {
    const b = cellsOf(t, piece);
    return b ? Math.hypot((b[0] + b[2]) / 2 - COLS / 2, (b[1] + b[3]) / 2 - ROWS * 0.4) + t.r * 0.5 : Infinity;
  };
  tries.sort((a, b) => mid(a) - mid(b));
  return tries.find((t) => !whyNot(items, t)) ?? null;
}

/** How many of each piece are out in the flat. */
export function countPlaced(items: FlatItem[]): Record<string, number> {
  const n: Record<string, number> = {};
  for (const it of items) n[it.id] = (n[it.id] ?? 0) + 1;
  return n;
}

/**
 * Which piece is at a spot on the floor (in metres; a spot past a wall means that wall), the one on top first, or -1.
 */
export function itemAt(items: FlatItem[], x: number, z: number): number {
  const cx = Math.floor((x + FLAT_HW) / CELL);
  const cz = Math.floor((z + FLAT_HD) / CELL);
  const inside = (b: number[] | null, px: number, pz: number) => Boolean(b && px >= b[0] && px < b[2] && pz >= b[1] && pz < b[3]);
  const find = (kinds: PieceKind[], px: number, pz: number, walls?: number[]) =>
    items.findIndex((it) => {
      const p = pieceById(it.id);
      return Boolean(p && kinds.includes(p.kind) && (!walls || walls.includes(it.r)) && inside(cellsOf(it, p), px, pz));
    });
  const clampX = Math.max(0, Math.min(COLS - 1, cx));
  const clampZ = Math.max(0, Math.min(ROWS - 1, cz));
  // Past a wall (the camera looks down on it from the front): whatever hangs there.
  if (cz < 0) return find(['wall'], clampX, 0, [0]);
  if (cx < 0) return find(['wall'], 0, clampZ, [1]);
  if (cx >= COLS) return find(['wall'], COLS - 1, clampZ, [3]);
  for (const kinds of [['floor'], ['rug'], ['wall']] as PieceKind[][]) {
    const i = find(kinds, clampX, clampZ);
    if (i >= 0) return i;
  }
  return -1;
}

/** The cell under a spot on the floor, kept on the grid. */
export const cellAt = (x: number, z: number) => ({
  cx: Math.max(0, Math.min(COLS - 1, Math.floor((x + FLAT_HW) / CELL))),
  cz: Math.max(0, Math.min(ROWS - 1, Math.floor((z + FLAT_HD) / CELL))),
});

const whole = (v: unknown, max: number) => Math.max(0, Math.min(max, Math.floor(Number(v) || 0)));

/** A layout from storage or the network: known pieces the owner has, on the grid, none overlapping, in sane numbers. */
export function cleanLayout(raw: unknown, owned: Record<string, number>, finishes: string[]): FlatLayout {
  const r = (raw && typeof raw === 'object' ? raw : {}) as Partial<FlatLayout>;
  const items: FlatItem[] = [];
  const used: Record<string, number> = {};
  for (const x of Array.isArray(r.items) ? r.items.slice(0, MAX_PLACED * 2) : []) {
    if (items.length >= MAX_PLACED || !x || typeof x !== 'object') continue;
    const it = { id: String((x as FlatItem).id), x: whole((x as FlatItem).x, COLS), z: whole((x as FlatItem).z, ROWS), r: whole((x as FlatItem).r, 3) };
    if ((used[it.id] ?? 0) >= (owned[it.id] ?? 0)) continue;
    if (whyNot(items, it)) continue;
    used[it.id] = (used[it.id] ?? 0) + 1;
    items.push(it);
  }
  const ok = (id: unknown, list: Finish[]) => typeof id === 'string' && list.some((f) => f.id === id && (f.price === 0 || finishes.includes(id)));
  return { wall: ok(r.wall, WALLS) ? (r.wall as string) : DEFAULT_WALL, floor: ok(r.floor, FLOORS) ? (r.floor as string) : DEFAULT_FLOOR, items };
}

/** A whole flat from storage: what's owned (known pieces and finishes, within limits), and the layout that fits it. */
export function cleanFlat(raw: unknown): FlatStore {
  const r = (raw && typeof raw === 'object' ? raw : {}) as Partial<FlatStore>;
  const owned: Record<string, number> = {};
  let total = 0;
  if (r.owned && typeof r.owned === 'object') {
    for (const [id, n] of Object.entries(r.owned)) {
      const k = Math.min(whole(n, MAX_EACH), MAX_OWNED - total);
      if (!pieceById(id) || k <= 0) continue;
      owned[id] = k;
      total += k;
    }
  }
  const known = [...WALLS, ...FLOORS].map((f) => f.id);
  const finishes = Array.isArray(r.finishes) ? [...new Set(r.finishes.filter((f): f is string => typeof f === 'string' && known.includes(f)))] : [];
  return { owned, finishes, layout: cleanLayout(r.layout, owned, finishes) };
}

// ---------------------------------------------------------------- on the wire

/** What a player does in the apartment block. */
export type FlatAction =
  /** Buy a piece of furniture (it goes into storage), or a wallpaper or floor. */
  | { k: 'buy'; id: string }
  /** Their flat laid out like this (only pieces they own, and only in their own flat). */
  | { k: 'arrange'; layout: FlatLayout };

/** What a player is sent while in the block: the lobby's list of residents, or the flat they're standing in. */
export interface FlatView {
  /** In the lobby: everyone with a flat here, by the key it's kept under and their name. */
  dir?: { key: string; name: string }[];
  /** In a flat: whose, and how it's laid out. */
  flat?: { key: string; name: string; layout: FlatLayout; mine: boolean };
  /** In their own flat: everything they own. */
  own?: { owned: Record<string, number>; finishes: string[] };
  /** A word back about the last thing they did ("The sofa is $40, and you have $12"). */
  note?: { text: string; ok: boolean; at: number } | null;
}
