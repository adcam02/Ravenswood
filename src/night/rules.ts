import type { Team } from '../data';
import type { Ask, WakePanel } from '../state/types';

/**
 * The automated night's rules, character by character: what each one is asked tonight, and what the grimoire says
 * should follow from their answer (the information to show, the reminder tokens to place, who dies). Pure: it works
 * from a plain picture of the grimoire (`Grim`) and changes nothing, so tools/test-night-rules.ts can check it. The
 * Storyteller always has the last word: these are only suggestions.
 */

export interface NSeat {
  id: string;
  name: string;
  /** The character they really have, and the one they think they have when that differs (the Drunk). */
  roleId: string | null;
  shownRoleId: string | null;
  /** The team of the character they really have (null for a Traveller or nobody). */
  team: Team | null;
  evil: boolean;
  dead: boolean;
  reminders: { roleId: string; text: string }[];
}

export interface Grim {
  /** Everyone in the circle, clockwise. */
  seats: NSeat[];
  /** Which night: 1 is the first. */
  night: number;
  first: boolean;
  /** The script's characters (for false answers and character choices), with their names. */
  script: { id: string; team: Team; name: string }[];
  /** Whoever was executed during the day just gone (and died of it). */
  executed: string | null;
  /** Died during the day just gone, and so far tonight. */
  diedToday: string[];
  diedTonight: string[];
}

/** A player's answer to their question. */
export interface Choice {
  seatIds?: string[];
  roleIds?: string[];
  answer?: boolean;
}

/** Something to do to the grimoire once the Storyteller confirms a step. */
export type NightEffect =
  /** A reminder token. `only`: it moves here from wherever it was (the Poisoner's, the Monk's), rather than adding one. */
  | { k: 'token'; seatId: string; roleId: string; text: string; only?: boolean }
  | { k: 'kill'; seatId: string }
  /** The Barber's haircut: two players swap characters (each keeps their alignment). */
  | { k: 'swap'; a: string; b: string }
  /** The Hatter's tea party: a Minion or Demon becomes another of their kind. */
  | { k: 'become'; seatId: string; roleId: string };

/** What the grimoire suggests for one step tonight. */
export interface NightOutcome {
  /** Who is shown the information (empty when there is none), and what they see. */
  to: string[];
  panels: WakePanel[];
  extra?: Record<string, WakePanel[]>;
  /** The Spy: a snapshot of the grimoire goes in when it's shown. */
  grimoire?: boolean;
  /** After the effects, tell these seats their new character ("You are"). */
  tell?: string[];
  effects: NightEffect[];
  /** For the Storyteller: things that might change the answer (a Recluse, a poisoned player). */
  notes: string[];
  /** The player is drunk or poisoned (or only thinks they have this character): the answer may be wrong. */
  unreliable?: string;
  /** A false answer to give instead, for when they're drunk or poisoned. */
  alt?: { panels: WakePanel[]; effects: NightEffect[]; label: string };
  /** The Storyteller picks who dies (the Ojo chose a character nobody has). */
  pickVictim?: boolean;
}

export interface NightRole {
  /** Why nobody wakes for this tonight, or null when they do. The holder is whoever has (or thinks they have) it. */
  idle?(grim: Grim, holder: NSeat): string | null;
  /** Who answers (the Barber's Demon, the Hatter's Minions and Demons); the holder, unless said otherwise. */
  askers?(grim: Grim, holder: NSeat): string[];
  /** Their question tonight (null: none, it's information or nothing). */
  ask?(grim: Grim, asker: NSeat, holder: NSeat): Ask;
  /** Asked only when the step's turn comes, as it depends on what happened earlier tonight. */
  late?: boolean;
  /**
   * Others shown something at this step, before any question of their own later tonight (the Demon learns the
   * Lunatic's choice before choosing): their question waits until then.
   */
  informs?(grim: Grim, holder: NSeat): string[];
  /** What should follow, given each asker's answer (by seat id). */
  outcome?(grim: Grim, holder: NSeat, choices: Record<string, Choice>, rand: () => number): NightOutcome;
}

// ---------------------------------------------------------------- reading the grimoire

const panel = (p: Partial<WakePanel>): WakePanel => ({ card: null, signs: [], roleIds: [], seatIds: [], text: '', ...p });

export const seatOf = (grim: Grim, id: string | undefined) => grim.seats.find((s) => s.id === id);
const roleName = (grim: Grim, id: string | null | undefined) => grim.script.find((r) => r.id === id)?.name ?? id ?? 'nobody';
const hasToken = (s: NSeat, roleId: string, text: string) => s.reminders.some((r) => r.roleId === roleId && r.text === text);

function pick<T>(list: T[], rand: () => number): T | undefined {
  return list.length ? list[Math.floor(rand() * list.length) % list.length] : undefined;
}
function shuffled<T>(list: T[], rand: () => number): T[] {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1)) % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Why this seat's ability might not work tonight: they only think they have the character (the Drunk, the
 * Marionette, the Lunatic), or they carry a Poisoned or Drunk reminder. Null when they're sober and healthy.
 */
export function impaired(holder: NSeat, roleId: string): string | null {
  if (holder.roleId !== roleId) {
    if (holder.roleId === 'drunk') return 'is the Drunk';
    if (holder.roleId === 'marionette') return 'is the Marionette';
    if (holder.roleId === 'lunatic') return 'is the Lunatic';
    return 'only thinks they have this character';
  }
  if (holder.reminders.some((r) => r.text === 'Poisoned')) return 'is poisoned';
  if (holder.reminders.some((r) => r.text === 'Drunk')) return 'is drunk';
  return null;
}

/** The nearest living player each way round, as the Empath counts them (one seat, if only one other is alive). */
export function aliveNeighbours(grim: Grim, seatId: string): NSeat[] {
  const n = grim.seats.length;
  const i = grim.seats.findIndex((s) => s.id === seatId);
  if (i < 0) return [];
  const out: NSeat[] = [];
  for (const step of [-1, 1]) {
    for (let d = 1; d < n; d++) {
      const s = grim.seats[(((i + step * d) % n) + n) % n];
      if (s.dead) continue;
      if (!out.includes(s)) out.push(s);
      break;
    }
  }
  return out;
}

/** Pairs of evil players sitting next to each other, all the way round (living or dead), as the Chef counts them. */
export function evilPairs(grim: Grim): number {
  const n = grim.seats.length;
  if (n < 2) return 0;
  let pairs = 0;
  for (let i = 0; i < (n === 2 ? 1 : n); i++) if (grim.seats[i].evil && grim.seats[(i + 1) % n].evil) pairs++;
  return pairs;
}

/** Who might register as something they aren't: the Recluse as evil, a Minion or the Demon; the Spy as good. */
function registerNotes(_grim: Grim, seats: NSeat[], what: 'evil' | 'minion' | 'demon' | 'good' | 'townsfolk' | 'outsider'): string[] {
  const notes: string[] = [];
  for (const s of seats) {
    if (s.roleId === 'recluse' && ['evil', 'minion', 'demon'].includes(what))
      notes.push(`${s.name} is the Recluse, who might register as ${what === 'evil' ? 'evil' : what === 'minion' ? 'a Minion' : 'the Demon'}.`);
    if (s.roleId === 'spy' && ['good', 'townsfolk', 'outsider'].includes(what))
      notes.push(`${s.name} is the Spy, who might register as ${what === 'good' ? 'good' : what === 'townsfolk' ? 'a Townsfolk' : 'an Outsider'}.`);
  }
  return notes;
}

const living = (grim: Grim, team: Team) => grim.seats.filter((s) => !s.dead && s.team === team);

/** A wrong number near the right one, for a drunk or poisoned Chef or Empath. */
function otherNumber(n: number, max: number, rand: () => number): number {
  const options = Array.from({ length: max + 1 }, (_, i) => i).filter((x) => x !== n);
  return pick(options, rand) ?? n;
}

// ---------------------------------------------------------------- "1 of 2 players is…"

/**
 * The Washerwoman, Librarian and Investigator: a character of this team in play, pointing at the player with it and
 * one other. Reminder tokens the Storyteller already placed are followed (TOWNSFOLK/WRONG, say).
 */
function oneOfTwo(team: 'townsfolk' | 'outsider' | 'minion', marks: [string, string]) {
  return (grim: Grim, holder: NSeat, _c: Record<string, Choice>, rand: () => number): NightOutcome => {
    const id = holder.shownRoleId && holder.roleId !== holder.shownRoleId ? holder.shownRoleId : holder.roleId!;
    const others = grim.seats.filter((s) => s.id !== holder.id);
    const placedRight = others.find((s) => hasToken(s, id, marks[0]));
    const placedWrong = others.find((s) => hasToken(s, id, marks[1]) && s !== placedRight);
    const candidates = others.filter((s) => s.team === team);
    const right = placedRight ?? pick(candidates, rand);
    const notes = registerNotes(grim, others, team === 'townsfolk' ? 'townsfolk' : team === 'outsider' ? 'outsider' : 'minion');
    const unreliable = impaired(holder, id) ?? undefined;
    const falseAnswer = () => {
      const chars = grim.script.filter((r) => r.team === team);
      const two = shuffled(others, rand).slice(0, 2);
      const char = pick(chars, rand);
      return { panels: [panel({ roleIds: char ? [char.id] : [], seatIds: two.map((s) => s.id) })], effects: [], label: 'A false answer' };
    };
    if (!right) {
      // Only the Librarian can be told that none are in play.
      if (team === 'outsider') {
        return { to: [holder.id], panels: [panel({ signs: ['n0'], text: 'No Outsiders are in play.' })], effects: [], notes, unreliable, alt: unreliable ? falseAnswer() : undefined };
      }
      return { to: [holder.id], panels: [panel({})], effects: [], notes: [...notes, `No ${team === 'minion' ? 'Minion' : 'Townsfolk'} is in play to show: choose what to show.`], unreliable };
    }
    const wrong = placedWrong ?? pick(others.filter((s) => s !== right), rand);
    const shown = right.roleId!;
    const seats = shuffled([right, ...(wrong ? [wrong] : [])], rand).map((s) => s.id);
    const effects: NightEffect[] = [
      { k: 'token', seatId: right.id, roleId: id, text: marks[0], only: true },
      ...(wrong ? [{ k: 'token' as const, seatId: wrong.id, roleId: id, text: marks[1], only: true }] : []),
    ];
    return {
      to: [holder.id],
      panels: [panel({ roleIds: [shown], seatIds: seats })],
      effects,
      notes: [`${right.name} is the ${roleName(grim, shown)}${wrong ? `; ${wrong.name} is the other` : ''}.`, ...notes],
      unreliable,
      alt: unreliable ? falseAnswer() : undefined,
    };
  };
}

// ---------------------------------------------------------------- kills

/**
 * What a kill tonight comes to: whether the target dies, or why not (already dead, safe with the Monk, the Soldier, a
 * poisoned Demon), with the Imp's starpass and the Fang Gu's jump noted. `demon`: it's the Demon's kill, which the
 * Monk and Soldier stop.
 */
export function killOutcome(grim: Grim, killer: NSeat, roleId: string, targetIds: string[], demon: boolean): NightOutcome {
  const notes: string[] = [];
  const effects: NightEffect[] = [];
  const who = roleName(grim, roleId);
  const off = impaired(killer, roleId);
  if (!targetIds.length) return { to: [], panels: [], effects, notes: [`The ${who} chose nobody.`] };
  if (off) {
    return {
      to: [],
      panels: [],
      effects,
      notes: [`The ${who} ${off}, so nobody dies.`],
      unreliable: off,
      alt: { panels: [], effects: targetIds.map((id) => ({ k: 'kill' as const, seatId: id })), label: 'Kill them anyway' },
    };
  }
  for (const id of targetIds) {
    const t = seatOf(grim, id);
    if (!t) continue;
    if (t.dead) {
      notes.push(`${t.name} is already dead, so nothing happens.`);
      continue;
    }
    if (demon && grim.seats.some((s) => s.roleId === 'monk' && !s.dead && !impaired(s, 'monk')) && hasToken(t, 'monk', 'Safe')) {
      notes.push(`${t.name} is safe tonight (the Monk), so nobody dies.`);
      continue;
    }
    if (demon && t.roleId === 'soldier' && !impaired(t, 'soldier')) {
      notes.push(`${t.name} is the Soldier, safe from the Demon, so nobody dies.`);
      continue;
    }
    if (roleId === 'imp' && t.id === killer.id) {
      const minions = living(grim, 'minion');
      notes.push(
        minions.length
          ? `The Imp chose itself: it dies, and a living Minion (${minions.map((s) => s.name).join(', ')}) becomes the Imp. The game asks which.`
          : 'The Imp chose itself, with no living Minion to take over: it just dies.',
      );
      effects.push({ k: 'kill', seatId: t.id });
      continue;
    }
    if (roleId === 'fanggu' && t.team === 'outsider' && !grim.seats.some((s) => hasToken(s, 'fanggu', 'Once'))) {
      notes.push(`${t.name} is an Outsider (the ${roleName(grim, t.roleId)}): the Fang Gu dies instead, and ${t.name} becomes an evil Fang Gu. The game asks.`);
      effects.push({ k: 'kill', seatId: killer.id });
      continue;
    }
    if (t.roleId === 'mayor' && demon && !impaired(t, 'mayor')) notes.push(`${t.name} is the Mayor: another player might die instead (change who below).`);
    if (t.roleId === 'ravenkeeper') notes.push(`${t.name} is the Ravenkeeper, who will be woken to choose a player.`);
    if (t.roleId === 'barber') notes.push(`${t.name} is the Barber: the Demon may swap two players’ characters tonight.`);
    if (t.roleId === 'hatter') notes.push(`${t.name} is the Hatter: the Minions and Demon may change character tonight.`);
    effects.push({ k: 'kill', seatId: t.id });
  }
  return { to: [], panels: [], effects, notes };
}

const ask1 = (prompt: string, extra: Partial<{ notSelf: boolean; only: 'alive' | 'dead' }> = {}): Ask => ({ kind: 'players', count: 1, prompt, ...extra });

/** A Demon's (or Godfather's) kill: the player they chose dies, unless something stops it. */
const killer =
  (roleId: string, demon = true) =>
  (grim: Grim, holder: NSeat, choices: Record<string, Choice>): NightOutcome =>
    killOutcome(grim, holder, roleId, choices[holder.id]?.seatIds ?? [], demon);

/** A token on the player chosen, moved there from wherever it was. */
const marker =
  (roleId: string, text: string) =>
  (grim: Grim, holder: NSeat, choices: Record<string, Choice>): NightOutcome => {
    const t = seatOf(grim, choices[holder.id]?.seatIds?.[0]);
    const off = impaired(holder, roleId);
    if (!t) return { to: [], panels: [], effects: [], notes: ['They chose nobody.'] };
    // A drunk or poisoned Monk protects nobody, so no Safe token (the Storyteller can still place one).
    if (off && roleId === 'monk') return { to: [], panels: [], effects: [], notes: [`The Monk ${off}, so ${t.name} isn’t protected.`], unreliable: off };
    return {
      to: [],
      panels: [],
      effects: [{ k: 'token', seatId: t.id, roleId, text, only: true }],
      notes: off ? [`The ${roleName(grim, roleId)} ${off}: the token is only a note, it does nothing.`] : [],
      unreliable: off ?? undefined,
    };
  };

const onlyAt = (when: 'first' | 'other') => (grim: Grim) => ((when === 'first') !== grim.first ? 'Not tonight.' : null);

// ---------------------------------------------------------------- the characters

export const NIGHT_ROLES: Record<string, NightRole> = {
  // ---- Trouble Brewing
  poisoner: {
    ask: () => ask1('Who do you want to poison?'),
    outcome: marker('poisoner', 'Poisoned'),
  },
  monk: {
    ask: () => ask1('Who do you want to protect?', { notSelf: true }),
    outcome: marker('monk', 'Safe'),
  },
  butler: {
    ask: () => ask1('Who is your master?', { notSelf: true }),
    outcome: marker('butler', 'Master'),
  },
  imp: {
    idle: onlyAt('other'),
    ask: () => ask1('Who do you want to kill?'),
    outcome: killer('imp'),
  },
  washerwoman: { idle: onlyAt('first'), outcome: oneOfTwo('townsfolk', ['Townsfolk', 'Wrong']) },
  librarian: { idle: onlyAt('first'), outcome: oneOfTwo('outsider', ['Outsider', 'Wrong']) },
  investigator: { idle: onlyAt('first'), outcome: oneOfTwo('minion', ['Minion', 'Wrong']) },
  chef: {
    idle: onlyAt('first'),
    outcome: (grim, holder, _c, rand) => {
      const n = evilPairs(grim);
      const off = impaired(holder, 'chef') ?? undefined;
      return {
        to: [holder.id],
        panels: [panel({ signs: [`n${n}`] })],
        effects: [],
        notes: [`${n} pair${n === 1 ? '' : 's'} of evil players sit together.`, ...registerNotes(grim, grim.seats, 'evil'), ...registerNotes(grim, grim.seats, 'good')],
        unreliable: off,
        alt: off ? { panels: [panel({ signs: [`n${otherNumber(n, 2, rand)}`] })], effects: [], label: 'A false number' } : undefined,
      };
    },
  },
  empath: {
    outcome: (grim, holder, _c, rand) => {
      const next = aliveNeighbours(grim, holder.id);
      const n = next.filter((s) => s.evil).length;
      const off = impaired(holder, 'empath') ?? undefined;
      return {
        to: [holder.id],
        panels: [panel({ signs: [`n${n}`] })],
        effects: [],
        notes: [`Living neighbours: ${next.map((s) => `${s.name}${s.evil ? ' (evil)' : ''}`).join(' & ') || 'nobody'}.`, ...registerNotes(grim, next, 'evil'), ...registerNotes(grim, next, 'good')],
        unreliable: off,
        alt: off ? { panels: [panel({ signs: [`n${otherNumber(n, Math.min(2, next.length), rand)}`] })], effects: [], label: 'A false number' } : undefined,
      };
    },
  },
  fortuneteller: {
    ask: () => ({ kind: 'players', count: 2, prompt: 'Which 2 players do you want to check?' }),
    outcome: (grim, holder, choices) => {
      const picked = (choices[holder.id]?.seatIds ?? []).map((id) => seatOf(grim, id)).filter((s): s is NSeat => Boolean(s));
      const demon = picked.filter((s) => s.team === 'demon');
      const herring = picked.filter((s) => hasToken(s, 'fortuneteller', 'Red Herring'));
      const yes = demon.length > 0 || herring.length > 0;
      const off = impaired(holder, 'fortuneteller') ?? undefined;
      const why = demon.length ? `${demon[0].name} is the Demon.` : herring.length ? `${herring[0].name} is the red herring.` : 'Neither is the Demon or the red herring.';
      return {
        to: [holder.id],
        panels: [panel({ signs: [yes ? 'yes' : 'no'] })],
        effects: [],
        notes: [why, ...registerNotes(grim, picked, 'demon')],
        unreliable: off,
        alt: off ? { panels: [panel({ signs: [yes ? 'no' : 'yes'] })], effects: [], label: yes ? 'Say no' : 'Say yes' } : undefined,
      };
    },
  },
  undertaker: {
    idle: (grim, holder) => (grim.first ? 'Not tonight.' : holder.dead ? `${holder.name} is dead.` : !grim.executed ? 'Nobody died by execution today.' : null),
    outcome: (grim, holder, _c, rand) => {
      const hanged = seatOf(grim, grim.executed ?? undefined);
      const off = impaired(holder, 'undertaker') ?? undefined;
      const wrong = pick(grim.script.filter((r) => r.id !== hanged?.roleId && r.team !== 'traveller'), rand);
      return {
        to: [holder.id],
        panels: [panel({ roleIds: hanged?.roleId ? [hanged.roleId] : [] })],
        effects: hanged ? [{ k: 'token', seatId: hanged.id, roleId: 'undertaker', text: 'Died Today', only: true }] : [],
        notes: [...(hanged ? [`${hanged.name} was the ${roleName(grim, hanged.roleId)}.`] : []), ...registerNotes(grim, hanged ? [hanged] : [], 'demon')],
        unreliable: off,
        alt: off && wrong ? { panels: [panel({ roleIds: [wrong.id] })], effects: [], label: `Show the ${wrong.name}` } : undefined,
      };
    },
  },
  ravenkeeper: {
    late: true,
    idle: (grim, holder) => (grim.first ? 'Not tonight.' : grim.diedTonight.includes(holder.id) ? null : 'Wakes only if they die tonight.'),
    ask: () => ask1('Whose character do you want to learn?'),
    outcome: (grim, holder, choices, rand) => {
      const t = seatOf(grim, choices[holder.id]?.seatIds?.[0]);
      const off = impaired(holder, 'ravenkeeper') ?? undefined;
      const wrong = pick(grim.script.filter((r) => r.id !== t?.roleId && r.team !== 'traveller'), rand);
      return {
        to: [holder.id],
        panels: [panel({ roleIds: t?.roleId ? [t.roleId] : [] })],
        effects: [],
        notes: [...(t ? [`${t.name} is the ${roleName(grim, t.roleId)}.`] : []), ...registerNotes(grim, t ? [t] : [], 'demon'), ...registerNotes(grim, t ? [t] : [], 'townsfolk')],
        unreliable: off,
        alt: off && wrong ? { panels: [panel({ roleIds: [wrong.id] })], effects: [], label: `Show the ${wrong.name}` } : undefined,
      };
    },
  },
  spy: {
    outcome: (_grim, holder) => ({ to: [holder.id], panels: [], grimoire: true, effects: [], notes: [] }),
  },

  // ---- the town's own script
  godfather: {
    idle: (grim, holder) => {
      if (holder.dead) return `${holder.name} is dead.`;
      if (grim.first) return null;
      return grim.seats.some((s) => s.team === 'outsider' && grim.diedToday.includes(s.id) && !grim.diedTonight.includes(s.id)) ? null : 'No Outsider died today.';
    },
    ask: (grim) => (grim.first ? null : ask1('Who do you want to kill?')),
    outcome: (grim, holder, choices) => {
      if (!grim.first) return killOutcome(grim, holder, 'godfather', choices[holder.id]?.seatIds ?? [], false);
      const outsiders = [...new Set(grim.seats.filter((s) => s.team === 'outsider').map((s) => s.roleId!))];
      return {
        to: [holder.id],
        panels: [panel({ roleIds: outsiders, text: outsiders.length ? 'These Outsiders are in play.' : 'No Outsiders are in play.' })],
        effects: [],
        notes: [],
      };
    },
  },
  fanggu: {
    idle: onlyAt('other'),
    ask: () => ask1('Who do you want to kill?'),
    outcome: killer('fanggu'),
  },
  ojo: {
    idle: onlyAt('other'),
    ask: () => ({ kind: 'character', count: 1, prompt: 'Which character do you want to kill?' }),
    outcome: (grim, holder, choices) => {
      const char = choices[holder.id]?.roleIds?.[0];
      if (!char) return { to: [], panels: [], effects: [], notes: ['The Ojo chose no character.'] };
      const have = grim.seats.filter((s) => s.roleId === char);
      if (!have.length) return { to: [], panels: [], effects: [], notes: [`Nobody is the ${roleName(grim, char)}: you choose who dies (or nobody).`], pickVictim: true };
      const out = killOutcome(grim, holder, 'ojo', have.map((s) => s.id), true);
      return { ...out, notes: [`The Ojo chose the ${roleName(grim, char)}: ${have.map((s) => s.name).join(' & ')}.`, ...out.notes] };
    },
  },
  magician: {
    idle: (grim) => (grim.first ? 'Nobody wakes: the Minions see the Magician as a Demon, and the Demon sees them as a Minion.' : 'Not tonight.'),
  },
  lunatic: {
    // The first night is laid out as before (fake Demon info for the Lunatic, the Demon told who they are).
    idle: (_grim, holder) => (holder.dead ? `${holder.name} is dead.` : null),
    informs: (grim) => (grim.first ? [] : living(grim, 'demon').map((s) => s.id)),
    ask: (grim, asker) => {
      if (grim.first) return null;
      // Asked whatever the Demon they think they are is asked.
      const believed = asker.shownRoleId ?? 'imp';
      return NIGHT_ROLES[believed]?.ask?.(grim, asker, asker) ?? ask1('Who do you want to kill?');
    },
    outcome: (grim, holder, choices) => {
      const c = choices[holder.id] ?? {};
      const seats = (c.seatIds ?? []).map((id) => seatOf(grim, id)).filter((s): s is NSeat => Boolean(s));
      const chose = [...seats.map((s) => s.name), ...(c.roleIds ?? []).map((id) => `the ${roleName(grim, id)}`)];
      const demons = living(grim, 'demon').map((s) => s.id);
      return {
        to: demons,
        panels: [panel({ card: 'thisPlayerIs', roleIds: ['lunatic'], seatIds: [holder.id], text: chose.length ? `They chose ${chose.join(' & ')}.` : 'They chose nobody.' })],
        effects: seats.map((s) => ({ k: 'token' as const, seatId: s.id, roleId: 'lunatic', text: 'Chosen' })),
        notes: [`Nothing happens to ${chose.join(' & ') || 'anyone'}: the Lunatic isn’t really the Demon. The Demon is told.`],
      };
    },
  },
  barber: {
    late: true,
    idle: (grim, holder) =>
      grim.first ? 'Not tonight.' : !grim.diedToday.includes(holder.id) ? `${holder.name} didn’t die today or tonight.` : !living(grim, 'demon').length ? 'No living Demon to choose.' : null,
    askers: (grim) => living(grim, 'demon').map((s) => s.id),
    ask: () => ({ kind: 'players', count: 2, optional: true, prompt: 'The Barber died: which 2 players should swap characters, if any?' }),
    outcome: (grim, _holder, choices) => {
      const pair = Object.values(choices).find((c) => (c.seatIds?.length ?? 0) === 2)?.seatIds;
      const seats = (pair ?? []).map((id) => seatOf(grim, id)).filter((s): s is NSeat => Boolean(s));
      if (seats.length !== 2) return { to: [], panels: [], effects: [], notes: ['The Demon chose not to swap anyone.'] };
      const notes = [`${seats[0].name} (the ${roleName(grim, seats[0].roleId)}) and ${seats[1].name} (the ${roleName(grim, seats[1].roleId)}) swap characters, each keeping their alignment.`];
      if (seats.some((s) => s.team === 'demon')) notes.push('One of them is a Demon: the Barber can’t swap another Demon (you may leave it).');
      return { to: [], panels: [], effects: [{ k: 'swap', a: seats[0].id, b: seats[1].id }], tell: seats.map((s) => s.id), notes };
    },
  },
  hatter: {
    late: true,
    idle: (grim, holder) => (grim.first ? 'Not tonight.' : !grim.diedToday.includes(holder.id) ? `${holder.name} didn’t die today or tonight.` : null),
    askers: (grim) => [...living(grim, 'minion'), ...living(grim, 'demon')].map((s) => s.id),
    ask: (_grim, asker) => ({
      kind: 'character',
      count: 1,
      optional: true,
      teams: [asker.team === 'demon' ? 'demon' : 'minion'],
      prompt: `The Hatter died: which ${asker.team === 'demon' ? 'Demon' : 'Minion'} do you want to become, if any?`,
    }),
    outcome: (grim, _holder, choices) => {
      const effects: NightEffect[] = [];
      const notes: string[] = [];
      for (const [seatId, c] of Object.entries(choices)) {
        const s = seatOf(grim, seatId);
        const to = c.roleIds?.[0];
        if (!s || !to || to === s.roleId) continue;
        effects.push({ k: 'become', seatId, roleId: to });
        notes.push(`${s.name} becomes the ${roleName(grim, to)}.`);
      }
      if (!effects.length) notes.push('Nobody changed character.');
      return { to: [], panels: [], effects, tell: effects.map((e) => (e as { seatId: string }).seatId), notes };
    },
  },

  // ---- Travellers often seen with Trouble Brewing
  thief: { ask: () => ask1('Whose vote counts against them tomorrow?', { notSelf: true }), outcome: marker('thief', 'Negative Vote') },
  bureaucrat: { ask: () => ask1('Whose vote counts three times tomorrow?', { notSelf: true }), outcome: marker('bureaucrat', '3 Votes') },
};

/** Why nobody wakes for this holder tonight (dead, not tonight, nothing happened), or null. */
export function idleWhy(grim: Grim, roleId: string, holder: NSeat): string | null {
  const role = NIGHT_ROLES[roleId];
  if (!role) return null;
  const own = role.idle?.(grim, holder);
  if (own !== undefined && own !== null) return own;
  // The dead don't wake, except those whose ability is about dying (who say so in their own rule).
  if (holder.dead && !['ravenkeeper', 'barber', 'hatter'].includes(roleId)) return `${holder.name} is dead.`;
  return null;
}

/** Reminder tokens that only last the night (and the day after): cleared as the next night falls. */
export const NIGHTLY_TOKENS: [string, string][] = [
  ['poisoner', 'Poisoned'],
  ['monk', 'Safe'],
  ['lunatic', 'Chosen'],
  ['thief', 'Negative Vote'],
  ['bureaucrat', '3 Votes'],
  ['undertaker', 'Died Today'],
];

// ---------------------------------------------------------------- kept with the game

/** A step's suggestion as kept with the game: worked out once its answers are in, so it doesn't change under the Storyteller. */
export interface KeptOutcome extends NightOutcome {
  /** The answers it was worked out from: a changed answer works it out again (until it's been used). */
  from: string;
  /** The Storyteller chose the false answer. */
  useAlt?: boolean;
  /** Done: the effects are in the grimoire and the information shown. */
  applied?: boolean;
}

/** The Storyteller's automated night, kept with the game (never sent to players). */
export interface AutoNight {
  /** Which night this is for (the game's day number). */
  night: number;
  /** Off: the night is run by hand, the old way (anything already asked still stands). */
  on: boolean;
  /** When the night's questions went out. */
  dusk: number;
  /** The question sent to each player, by night step then seat: the wake's id. */
  asks: Record<string, Record<string, string>>;
  /** Suggestions by night step and holder (`step|seat`). */
  out: Record<string, KeptOutcome>;
  /** Answers the Storyteller gave for a player (who didn't answer), by night step then seat. */
  forced: Record<string, Record<string, Choice>>;
  /** Wakes this sent, which it may put back to sleep once seen. */
  wakes: string[];
}
