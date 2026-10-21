import { getRole, nightOrderList, nightReminder, NIGHT_SPECIALS } from '../data';
import { hostGame, isTraveller, seatsWithRole, st } from '../state/host';
import type { GameState } from '../state/types';
import { ui, useUI } from '../state/ui';
import { evilInfoStatus } from './evilInfo';
import { demonInfo, minionInfo, presetFor, wholeEvilTeam } from './presets';

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
  // The Storyteller's sheet offers waking the whole evil team in one go, just before the separate steps.
  if (k === 'first' && list.includes('minioninfo')) list.splice(list.indexOf('minioninfo'), 0, 'eviltogether');
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
export function wakeFor(row: NightRow, k: NightKind) {
  if (row.id === 'eviltogether') return wholeEvilTeam();
  if (row.id === 'minioninfo') return { ...minionInfo(), extra: {} };
  if (row.id === 'demoninfo') return { ...demonInfo(), extra: {} };
  const p = presetFor(row.id, k);
  return { to: row.holders.map((h) => h.seat.id), panels: p.panels, ask: p.ask, extra: {} };
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
    let who = row.holders.map((h) => h.seat.id);
    if (EVIL_STEPS.has(row.id)) {
      if (players < 7 || !demons.length) continue;
      if (row.id === 'eviltogether') {
        if (!minions.length) continue;
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
    ui.wake(w.to, w.panels, 'ask' in w ? w.ask : null, w.extra, step.key);
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
