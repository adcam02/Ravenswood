import { PETS } from '../world/types';
import { GRAVES, STOOLS } from '../world/stoolShop';
import { petPrice, shopDances, shopEmotes, shopHats, shopNomMoves, shopSlayMoves, shopVictories, wareOf } from '../casino/shop';
import { FLOORS, PIECES, WALLS } from '../flats/catalogue';
import { EXEC_METHODS } from '../game/execution';
import { SLAY_MOVES } from '../game/slayMoves';
import { GAME_JOBS, JOB_TITLES } from '../jobs/meta';
import type { Profile } from '../game/profiles';
import type { Stats } from './host';

/**
 * The Storyteller's stats as tables: one row for everything there is (so what's never been bought or chosen shows
 * up as a zero), with the counts kept in stats/host.ts and who owns what worked out from the profiles.
 */

export interface Column {
  key: string;
  label: string;
  /** A number (sortable), shown as is or as money or a percentage. */
  kind?: 'text' | 'num' | 'money' | 'pct';
}
export type Row = Record<string, string | number>;
export interface Table {
  id: string;
  title: string;
  /** The column the table sorts by (most or least first), and what "never" means for a row. */
  by: string;
  never: string;
  columns: Column[];
  rows: Row[];
  note?: string;
}

/** A percentage, or nothing when there's nothing to take it of. */
const pct = (a: number, b: number) => (b ? Math.round((a / b) * 100) : '');

/** How many profiles own each thing, by the same keys as stats.bought. */
function owners(profiles: Profile[]): Record<string, number> {
  const out: Record<string, number> = {};
  const add = (k: string) => void (out[k] = (out[k] ?? 0) + 1);
  for (const p of profiles) {
    for (const k of p.items) add(k);
    for (const pet of p.pets) add(`pet:${pet}`);
    for (const [id, n] of Object.entries(p.flat?.owned ?? {})) if (n > 0) add(`furn:${id}`);
    for (const id of p.flat?.finishes ?? []) add(`${WALLS.some((w) => w.id === id) ? 'wall' : 'floor'}:${id}`);
  }
  return out;
}

const KINDS: Record<string, string> = {
  pet: 'Pet',
  hat: 'Hat',
  dance: 'Dance',
  stool: 'Stool',
  grave: 'Gravestone',
  slay: 'Slayer move',
  win: 'Victory move',
  emote: 'Emote',
  nom: 'Nomination move',
  furn: 'Furniture',
  wall: 'Wallpaper',
  floor: 'Flooring',
};
export const SHOP_KINDS = Object.keys(KINDS);

function shop(s: Readonly<Stats>, profiles: Profile[]): Table {
  const own = owners(profiles);
  const all: { key: string; name: string; price: number }[] = [
    ...PETS.map((p) => ({ key: `pet:${p.id}`, name: p.name, price: petPrice(p.id) })),
    ...shopHats().map((h) => ({ key: `hat:${h.id}`, name: h.name, price: h.price! })),
    ...shopDances().map((d) => ({ key: `dance:${d.anim}`, name: d.label, price: d.price! })),
    ...STOOLS.filter((x) => x.price).map((x) => ({ key: `stool:${x.id}`, name: x.name, price: x.price })),
    ...GRAVES.filter((x) => x.price).map((x) => ({ key: `grave:${x.id}`, name: x.name, price: x.price })),
    ...shopSlayMoves().map((m) => ({ key: `slay:${m.id}`, name: m.name, price: m.price! })),
    ...shopEmotes().map((e) => ({ key: `emote:${e.anim}`, name: e.label, price: e.price })),
    ...shopVictories().map((m) => ({ key: `win:${m.id}`, name: m.name, price: m.price! })),
    ...shopNomMoves().map((m) => ({ key: `nom:${m.id}`, name: m.name, price: m.price! })),
    ...PIECES.map((p) => ({ key: `furn:${p.id}`, name: p.name, price: p.price })),
    ...WALLS.filter((f) => f.price).map((f) => ({ key: `wall:${f.id}`, name: f.name, price: f.price })),
    ...FLOORS.filter((f) => f.price).map((f) => ({ key: `floor:${f.id}`, name: f.name, price: f.price })),
  ];
  // Anything else bought or owned (something new in the shop, say): named by the shop if it knows it.
  const known = new Set(all.map((x) => x.key));
  for (const key of new Set([...Object.keys(s.bought), ...Object.keys(own)])) {
    if (known.has(key) || !KINDS[key.split(':')[0]]) continue;
    const w = wareOf(key);
    all.push({ key, name: w?.name ?? key.split(':')[1], price: w?.price ?? 0 });
  }
  return {
    id: 'shop',
    title: 'Shop',
    by: 'bought',
    never: 'never bought',
    note: `Bought: counted since the stats began. Owned: from the ${profiles.length} profiles kept here (including anything bought before the stats began).`,
    columns: [
      { key: 'name', label: 'Item' },
      { key: 'kind', label: 'Kind' },
      { key: 'price', label: 'Price', kind: 'money' },
      { key: 'bought', label: 'Bought', kind: 'num' },
      { key: 'owners', label: 'Owned by', kind: 'num' },
      { key: 'spent', label: 'Spent', kind: 'money' },
    ],
    rows: all.map((x) => ({
      key: x.key,
      name: x.name,
      kind: KINDS[x.key.split(':')[0]],
      price: x.price,
      bought: s.bought[x.key] ?? 0,
      owners: own[x.key] ?? 0,
      spent: (s.bought[x.key] ?? 0) * x.price,
    })),
  };
}

function executions(s: Readonly<Stats>): Table {
  return {
    id: 'exec',
    title: 'Executions',
    by: 'chosen',
    never: 'never chosen',
    note: `${s.execs} ${s.execs === 1 ? 'execution' : 'executions'} counted. Offered: on the ballot the town voted from. Picked: chosen by the Storyteller by hand.`,
    columns: [
      { key: 'name', label: 'Method' },
      { key: 'offered', label: 'Offered', kind: 'num' },
      { key: 'votes', label: 'Votes', kind: 'num' },
      { key: 'chosen', label: 'Chosen', kind: 'num' },
      { key: 'picked', label: 'Picked', kind: 'num' },
      { key: 'rate', label: 'Chosen when offered', kind: 'pct' },
    ],
    rows: EXEC_METHODS.map((m) => {
      const c = s.exec[m.id] ?? { offered: 0, votes: 0, chosen: 0, picked: 0 };
      return { key: m.id, name: `${m.icon} ${m.name}`, offered: c.offered, votes: c.votes, chosen: c.chosen, picked: c.picked, rate: pct(c.chosen - c.picked, c.offered) };
    }),
  };
}

function slayer(s: Readonly<Stats>, profiles: Profile[]): Table {
  const own = owners(profiles);
  return {
    id: 'slay',
    title: 'Slayer',
    by: 'used',
    never: 'never used',
    columns: [
      { key: 'name', label: 'Move' },
      { key: 'used', label: 'Used', kind: 'num' },
      { key: 'owners', label: 'Owned by', kind: 'num' },
    ],
    rows: SLAY_MOVES.map((m) => ({ key: m.id, name: `${m.icon} ${m.name}`, used: s.slay[m.id] ?? 0, owners: m.price ? (own[`slay:${m.id}`] ?? 0) : profiles.length })),
  };
}

function minigames(s: Readonly<Stats>): Table {
  return {
    id: 'jobs',
    title: 'Minigames',
    by: 'played',
    never: 'never played',
    columns: [
      { key: 'name', label: 'Minigame' },
      { key: 'played', label: 'Played', kind: 'num' },
      { key: 's0', label: '0★', kind: 'num' },
      { key: 's1', label: '1★', kind: 'num' },
      { key: 's2', label: '2★', kind: 'num' },
      { key: 's3', label: '3★', kind: 'num' },
      { key: 'avg', label: 'Average ★', kind: 'num' },
    ],
    rows: GAME_JOBS.map((j) => {
      const c = s.jobs[j] ?? { played: 0, stars: [0, 0, 0, 0] };
      const avg = c.played ? (c.stars[1] + c.stars[2] * 2 + c.stars[3] * 3) / c.played : 0;
      return { key: j, name: JOB_TITLES[j], played: c.played, s0: c.stars[0], s1: c.stars[1], s2: c.stars[2], s3: c.stars[3], avg: Math.round(avg * 10) / 10 };
    }),
  };
}

function pit(s: Readonly<Stats>): Table {
  return {
    id: 'pit',
    title: 'Pet pit',
    by: 'fights',
    never: 'never fought',
    note: `${s.pit.fights} ${s.pit.fights === 1 ? 'fight' : 'fights'} counted.`,
    columns: [
      { key: 'name', label: 'Pet' },
      { key: 'fights', label: 'Fights', kind: 'num' },
      { key: 'wins', label: 'Wins', kind: 'num' },
      { key: 'rate', label: 'Win rate', kind: 'pct' },
    ],
    rows: PETS.map((p) => {
      const c = s.pit.pets[p.id] ?? { fights: 0, wins: 0 };
      return { key: p.id, name: p.name, fights: c.fights, wins: c.wins, rate: pct(c.wins, c.fights) };
    }),
  };
}

const CASINO: Record<string, string> = { blackjack: 'Blackjack', roulette: 'Roulette', slots: 'Slots', poker: 'Poker (sittings)' };

function casino(s: Readonly<Stats>): Table {
  return {
    id: 'casino',
    title: 'Casino',
    by: 'played',
    never: 'never played',
    note: 'Players’ net is what came back to players less what they staked (below zero: the house won).',
    columns: [
      { key: 'name', label: 'Game' },
      { key: 'played', label: 'Rounds', kind: 'num' },
      { key: 'staked', label: 'Staked', kind: 'money' },
      { key: 'paid', label: 'Paid out', kind: 'money' },
      { key: 'net', label: 'Players’ net', kind: 'money' },
    ],
    rows: Object.keys({ ...CASINO, ...s.casino }).map((k) => {
      const c = s.casino[k] ?? { played: 0, staked: 0, paid: 0 };
      return { key: k, name: CASINO[k] ?? k, played: c.played, staked: c.staked, paid: c.paid, net: c.paid - c.staked };
    }),
  };
}

function gallery(s: Readonly<Stats>): Table {
  const a = s.art;
  return {
    id: 'art',
    title: 'Gallery',
    by: 'count',
    never: 'none yet',
    columns: [
      { key: 'name', label: 'What' },
      { key: 'count', label: 'Count', kind: 'num' },
    ],
    rows: [
      { key: 'drawings', name: 'Drawings sent in', count: a.drawings },
      { key: 'nights', name: 'Nights hung in the gallery', count: a.nights },
      { key: 'perNight', name: 'Drawings a night (average)', count: a.nights ? Math.round((a.drawings / a.nights) * 10) / 10 : 0 },
      { key: 'votes', name: 'Gallery votes', count: a.votes },
      { key: 'hearts', name: 'Hearts given', count: a.hearts },
      { key: 'unhearts', name: 'Hearts taken back', count: a.unhearts },
      { key: 'games', name: 'Games called (for scale)', count: s.games },
    ],
  };
}

/** Every table, from the stats and the profiles as they stand. */
export function statTables(s: Readonly<Stats>, profiles: Profile[]): Table[] {
  return [shop(s, profiles), executions(s), slayer(s, profiles), minigames(s), pit(s), casino(s), gallery(s)];
}

/** The tables as CSV: one block per table, a blank line between. */
export function tablesCSV(tables: Table[]): string {
  const cell = (v: string | number) => (typeof v === 'number' ? String(v) : /[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);
  return tables
    .map((t) => [['section', 'id', ...t.columns.map((c) => c.label)].map(cell).join(','), ...t.rows.map((r) => [t.title, r.key, ...t.columns.map((c) => r[c.key] ?? '')].map(cell).join(','))].join('\n'))
    .join('\n\n');
}
