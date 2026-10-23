import { getRole, nightOrderList, nightReminder, NIGHT_SPECIALS } from '../data';
import { hostGame, isTraveller, seatName, seatsWithRole, st } from '../state/host';
import type { GameState } from '../state/types';
import { ui, useUI } from '../state/ui';
import { evilInfoStatus } from './evilInfo';
import { diedRecently, executedToday, onTeam, townsfolkNeighbours, withReminder } from './grimoire';
import { canWakeTogether, demonInfo, minionInfo, nightPreset, nightWho, wholeEvilTeam, type NightWake } from './presets';

export type NightKind = 'first' | 'other';

/** One line of the night sheet for this game: a character (and who has it, or thinks they do), or a step like dusk. */
export interface NightRow {
  id: string;
  special: boolean;
  holders: ReturnType<typeof seatsWithRole>;
  inPlay: boolean;
}

/** One stop on the guided night: its night-sheet line, and the seats it wakes. */
export interface NightStep {
  key: string;
  row: NightRow;
  who: string[];
}

export const nightKind = (g: GameState): NightKind => (g.day <= 1 ? 'first' : 'other');

const EVIL_STEPS = new Set(['eviltogether', 'minioninfo', 'demoninfo']);

/** The night sheet's lines for this game: the characters in play (or the whole script) with what they do tonight. */
export function nightRows(g: GameState, k: NightKind, showAll = false): NightRow[] {
  const list = nightOrderList(k, g.script);
  // The Storyteller's sheet offers waking the whole evil team in one go, just before the separate steps (not with a
  // Magician, who has to look like a Demon to the Minions and a Minion to the Demon).
  if (k === 'first' && list.includes('minioninfo') && !g.seats.some((s) => s.roleId === 'magician')) list.splice(list.indexOf('minioninfo'), 0, 'eviltogether');
  return list
    .map((id) => {
      if (NIGHT_SPECIALS[id]) {
        if (k === 'other' && EVIL_STEPS.has(id)) return null;
        return { id, special: true, holders: [], inPlay: true };
      }
      const holders = seatsWithRole(g, id);
      const fabled = g.fabled.includes(id);
      if (!holders.length && !fabled && !(showAll && g.script.roles.includes(id))) return null;
      if (!nightReminder(id, k)) return null;
      return { id, special: false, holders, inPlay: holders.length > 0 || fabled };
    })
    .filter(Boolean) as NightRow[];
}

/** Who a line wakes and with what, laid out ready (picking bluffs first if the Demon is to see them). */
export function wakeFor(row: NightRow, k: NightKind): NightWake {
  if (row.id === 'eviltogether') return { ...wholeEvilTeam(), ask: null };
  if (row.id === 'minioninfo') return { ...minionInfo(), ask: null, extra: {} };
  if (row.id === 'demoninfo') return { ...demonInfo(), ask: null, extra: {} };
  return nightPreset(hostGame(), row.id, k, row.holders.map((h) => h.seat.id));
}

/**
 * Tonight's stops, in night-sheet order: dusk, the characters in play, dawn. The evil team's first-night steps only
 * come up in a game of seven or more.
 */
export function guideSteps(g: GameState): NightStep[] {
  const k = nightKind(g);
  const players = g.seats.filter((s) => !isTraveller(s.roleId)).length;
  const evil = evilInfoStatus(g);
  const demons = evil.demons.map((s) => s.id);
  const minions = evil.minions.map((s) => s.id);
  const steps: NightStep[] = [];
  for (const row of nightRows(g, k)) {
    let who = nightWho(g, row.id, k, row.holders.map((h) => h.seat.id));
    if (EVIL_STEPS.has(row.id)) {
      if (players < 7 || !demons.length) continue;
      if (row.id === 'eviltogether') {
        if (!canWakeTogether(g)) continue;
        who = [...demons, ...minions];
      } else if (row.id === 'minioninfo') {
        if (!minions.length) continue;
        who = minions;
      } else who = demons;
    } else if (!row.special && !row.inPlay) continue;
    steps.push({ key: `${k}:${row.id}`, row, who });
  }
  return steps;
}

/** The evil team's information already shown some other way (all together, or one part at a time) needs no stop. */
function shownAlready(step: NightStep, evil: ReturnType<typeof evilInfoStatus>): boolean {
  if (step.row.id === 'eviltogether') return evil.minionsShown || evil.bluffsShown;
  if (step.row.id === 'minioninfo') return evil.minionsShown;
  if (step.row.id === 'demoninfo') return evil.bluffsShown;
  return false;
}

/** Steps still to do tonight, from `after` on (by key; from the start without one). */
export function stepsLeft(g: GameState, after?: string): NightStep[] {
  const steps = guideSteps(g);
  const evil = evilInfoStatus(g);
  const from = after ? steps.findIndex((s) => s.key === after) + 1 : 0;
  return steps.slice(from).filter((s) => !g.nightDone.includes(s.key) && !shownAlready(s, evil));
}

export const stepName = (step: NightStep) => NIGHT_SPECIALS[step.row.id]?.name ?? getRole(step.row.id)?.name ?? step.row.id;

/**
 * A word from the grimoire about a step tonight: who it concerns, or that nobody need wake (`idle`), as when the Barber
 * didn't die or nobody was executed. The Storyteller decides; this only saves looking it up.
 */
export function stepNote(g: GameState, step: NightStep): { text: string; idle?: boolean } | null {
  const k = nightKind(g);
  const id = step.row.id;
  const name = (s: { id: string }) => seatName(g, s.id);
  const died = (roleId: string) => step.row.holders.some((h) => !h.believes && h.seat.roleId === roleId && diedRecently(g, h.seat.id));
  if (id === 'magician' && k === 'first') return { text: 'Nobody wakes for this: the Minions are shown the Magician as a Demon, and the Demon is shown them as a Minion.', idle: true };
  if (id === 'grandmother' && k === 'other') {
    const child = withReminder(g, 'grandmother', 'Grandchild')[0];
    return { text: `Nobody wakes for this.${child ? ` The grandchild is ${name(child)}${child.dead ? ', who is dead' : ''}.` : ''}`, idle: true };
  }
  if (id === 'barber' && k === 'other' && !died('barber')) return { text: 'The Barber didn’t die today or tonight, so nobody wakes.', idle: true };
  if (id === 'hatter' && k === 'other' && !died('hatter')) return { text: 'The Hatter didn’t die today or tonight, so nobody wakes.', idle: true };
  if (id === 'godfather' && k === 'other') {
    const outsiders = onTeam(g, 'outsider').filter((s) => diedRecently(g, s.id, false));
    if (!outsiders.length) return { text: 'No Outsider died today, so the Godfather doesn’t wake.', idle: true };
    return { text: `${outsiders.map(name).join(' & ')} died today.` };
  }
  if (id === 'undertaker' && k === 'other') {
    const hanged = executedToday(g);
    return hanged ? { text: `${name(hanged)} was executed today: the ${getRole(hanged.roleId)?.name ?? 'character'}.` } : { text: 'Nobody died by execution today, so the Undertaker doesn’t wake.', idle: true };
  }
  if (id === 'professor' && k === 'other' && step.row.holders.some((h) => h.seat.reminders.some((r) => r.roleId === 'professor' && r.text === 'No Ability'))) {
    return { text: 'The Professor has used their ability.', idle: true };
  }
  if (id === 'nodashii') {
    const nd = step.row.holders.find((h) => !h.believes)?.seat;
    const next = nd ? townsfolkNeighbours(g, nd.id) : [];
    if (next.length) return { text: `Townsfolk neighbours (poisoned): ${next.map(name).join(' & ')}.` };
  }
  if (id === 'fanggu' && !withReminder(g, 'fanggu', 'Once').length) {
    const outsiders = onTeam(g, 'outsider').filter((s) => !s.dead);
    if (outsiders.length) return { text: `If it chooses a living Outsider (${outsiders.map((s) => `${name(s)}, the ${getRole(s.roleId)?.name}`).join('; ')}), mark the Fang Gu dead: the game asks who takes over.` };
  }
  if (id === 'imp') return { text: 'If it chooses itself, mark the Imp dead: the game asks which Minion becomes the Imp.' };
  if (id === 'lunatic' && k === 'first' && !step.who.some((x) => step.row.holders.some((h) => h.seat.id === x))) {
    return { text: 'Fewer than 7 players, so no Demon info for the Lunatic, but the Demon learns who they are.' };
  }
  return null;
}

/** Morning, checking first that the evil team got their first-night information. */
export function bringDawn() {
  if (evilInfoStatus(hostGame()).missing) ui.open({ kind: 'dawnCheck' });
  else st.setPhase('day');
}

export const guide = {
  /** Opens the wake screen for a step, ready to show; anyone still awake from an earlier step goes back to sleep. */
  wake(step: NightStep) {
    const g = hostGame();
    const steps = guideSteps(g);
    const earlier = new Set(steps.slice(0, Math.max(0, steps.findIndex((s) => s.key === step.key))).flatMap((s) => s.who));
    const drowsy = Object.keys(g.awake).filter((id) => earlier.has(id) && !step.who.includes(id));
    if (drowsy.length) st.sleep(drowsy);
    const w = wakeFor(step.row, nightKind(g));
    ui.wake(w.to, w.panels, w.ask, w.extra, step.key);
  },
  /** That step's done: its people go back to sleep, and the next one's wake screen opens (or closes, if nobody wakes). */
  next(key: string) {
    const g = hostGame();
    const step = guideSteps(g).find((s) => s.key === key);
    if (!step) return;
    const awake = step.who.filter((id) => g.awake[id]);
    if (awake.length) st.sleep(awake);
    st.setNightDone(key, true);
    const nxt = stepsLeft(hostGame(), key)[0];
    if (nxt?.who.length) guide.wake(nxt);
    else if (useUI.getState().modal?.kind === 'wake') ui.close();
  },
  /** Passed over without waking anyone (a dead character, say). */
  skip(key: string) {
    st.setNightDone(key, true);
  },
  /** Back to the last step done. */
  back(key: string) {
    const g = hostGame();
    const steps = guideSteps(g);
    const i = steps.findIndex((s) => s.key === key);
    const prev = steps.slice(0, i < 0 ? steps.length : i).reverse().find((s) => g.nightDone.includes(s.key));
    if (prev) st.setNightDone(prev.key, false);
  },
};
