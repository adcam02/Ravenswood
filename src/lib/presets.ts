import { defaultAlignment, getRole, nightReminder, rolesByTeam } from '../data';
import { grimoireSnapshot, hostGame, isTraveller, replyTonight, seatAlignment, seatName, st } from '../state/host';
import type { Ask, GameState, InfoCard, WakePanel } from '../state/types';
import { emptyPanel, ui } from '../state/ui';
import { closestEvil, executedToday, onTeam, withReminder } from './grimoire';
import { shuffle } from './util';

const WORDS: Record<string, number> = { a: 1, one: 1, two: 2, three: 3, '1': 1, '2': 2, '3': 3 };

const QUESTIONS: Record<string, string> = {
  poisoner: 'Who do you want to poison?',
  monk: 'Who do you want to protect?',
  innkeeper: 'Who do you want to protect?',
  butler: 'Who is your master?',
  fortuneteller: 'Which 2 players do you want to check?',
  chambermaid: 'Which 2 players do you want to check?',
  ravenkeeper: 'Whose character do you want to learn?',
  devilsadvocate: 'Who do you want to save from execution?',
  professor: 'Which dead player do you want to bring back?',
  ojo: 'Which character do you want to kill?',
};

/** The question a character's choice is asking, in plain words. Demons, and anything that kills, ask who dies. */
function questionFor(roleId: string): string | undefined {
  if (QUESTIONS[roleId]) return QUESTIONS[roleId];
  const role = getRole(roleId);
  if (!role) return undefined;
  if (role.team === 'demon' || /they die\b/i.test(role.ability)) return 'Who do you want to kill?';
  return undefined;
}

/** Guesses the cards and question a night-sheet entry calls for, so waking someone is one click. */
export function presetFor(roleId: string, kind: 'first' | 'other'): { panels: WakePanel[]; ask: Ask } {
  const text = nightReminder(roleId, kind);
  const panels: WakePanel[] = [];
  const cardFor: [RegExp, InfoCard][] = [
    [/\*YOU ARE\*/i, 'youAre'],
    [/\*THIS PLAYER IS\*/i, 'thisPlayerIs'],
    [/\*THIS CHARACTER SELECTED YOU\*/i, 'selectedYou'],
    [/\*THESE CHARACTERS ARE NOT IN PLAY\*/i, 'notInPlay'],
    [/\*THIS IS THE DEMON\*/i, 'thisIsDemon'],
    [/\*THESE ARE YOUR MINIONS\*/i, 'theseAreMinions'],
  ];
  // A Demon's "you are" is for whoever takes over from it (a starpass, a Fang Gu's jump), told after the change.
  const passes = kind === 'other' && getRole(roleId)?.team === 'demon';
  for (const [re, card] of cardFor) if (re.test(text) && !(passes && card === 'youAre')) panels.push({ ...emptyPanel(), card });

  let ask: Ask = null;
  const players = text.match(/chooses? (a|one|two|three|1|2|3) (?:\w+ )?players?/i);
  const character = /chooses? (?:a|an) (?:\w+ )?character/i.test(text);
  if (players) ask = { kind: 'players', count: WORDS[players[1].toLowerCase()] ?? 1 };
  else if (character) ask = { kind: 'character', count: 1 };
  else if (/might choose|may choose|chooses whether|uses? (?:their|its) ability/i.test(text)) ask = { kind: 'yesno' };
  // The Demon picks a victim every other night, however its sheet entry is worded.
  if (kind === 'other' && getRole(roleId)?.team === 'demon' && (!ask || ask.kind === 'yesno')) ask = { kind: 'players', count: 1 };
  if (ask && ask.kind !== 'yesno') {
    const prompt = questionFor(roleId);
    if (prompt && (ask.kind === 'players' || QUESTIONS[roleId])) ask = { ...ask, prompt };
    // "Might choose": choosing nobody is an answer too.
    if (/might choose|may choose/i.test(text)) ask = { ...ask, optional: true };
  }

  if (ask && ask.kind !== 'yesno' && !panels.some((p) => p.card === 'makeChoice')) panels.unshift({ ...emptyPanel(), card: 'makeChoice' });
  if (ask?.kind === 'yesno' && !panels.length) panels.unshift({ ...emptyPanel(), card: 'useAbility' });
  // The Spy sees the grimoire itself, as it stands when they're woken.
  if (roleId === 'spy') panels.push({ ...emptyPanel(), grimoire: grimoireSnapshot(hostGame()) });
  if (!panels.length) panels.push(emptyPanel());
  return { panels, ask };
}

export interface NightWake {
  to: string[];
  panels: WakePanel[];
  ask: Ask;
  extra: Record<string, WakePanel[]>;
}

const seatIdsOf = (list: { id: string }[]) => list.map((s) => s.id);
const panel = (p: Partial<WakePanel>): WakePanel => ({ ...emptyPanel(), ...p });

/**
 * Who a night-sheet line wakes, when it isn't simply whoever has (or thinks they have) the character: nobody for
 * the Magician (who is shown to the evil team instead) or the Grandmother after the first night, the Demon for the
 * Barber, the Minions and Demon for the Hatter, and on the first night the Demon learns who the Lunatic is when
 * there are too few players for the Lunatic to get Demon info. Anyone who thinks they're the Demon (the Lunatic) is
 * woken alongside it. Changes nothing, so it can be asked any time.
 */
export function nightWho(g: GameState, id: string, k: 'first' | 'other', holders: string[]): string[] {
  const living = (team: string) => seatIdsOf(onTeam(g, team).filter((s) => !s.dead));
  const demons = living('demon');
  const minions = living('minion');
  const lunatics = seatIdsOf(g.seats.filter((s) => s.roleId === 'lunatic' && !s.dead));
  const players = g.seats.filter((s) => !isTraveller(s.roleId)).length;
  if (id === 'magician' && k === 'first') return [];
  if (id === 'grandmother' && k === 'other') return [];
  if (id === 'barber' && k === 'other') return [...demons, ...lunatics];
  if (id === 'hatter' && k === 'other') return [...minions, ...demons, ...lunatics];
  if (id === 'lunatic' && k === 'first' && players < 7) return lunatics.length ? demons : [];
  return holders;
}

/** The Demon learns who the Lunatic is (and, after the first night, who they chose tonight). */
function lunaticPanels(g: GameState, chosen: boolean): WakePanel[] {
  return g.seats
    .filter((s) => s.roleId === 'lunatic' && !(chosen && s.dead))
    .map((s) => {
      const r = chosen ? replyTonight(g, s.id) : null;
      const picks = [...(r?.seatIds ?? []).map((x) => seatName(g, x)), ...(r?.roleIds ?? []).map((x) => `the ${getRole(x)?.name ?? x}`)];
      return panel({ card: 'thisPlayerIs', roleIds: ['lunatic'], seatIds: [s.id], text: picks.length ? `They chose ${picks.join(' & ')}.` : '' });
    });
}

/** Good characters nobody has (or thinks they have). */
function notInPlayGood(g: GameState): string[] {
  const inPlay = new Set(g.seats.flatMap((s) => [s.roleId, s.shownRoleId]));
  const byTeam = rolesByTeam(g.script.roles);
  return [...byTeam.townsfolk, ...byTeam.outsider].map((r) => r.id).filter((id) => !inPlay.has(id));
}

/**
 * The wake for a line of the night sheet, laid out ready to show: who to wake, what they see and what they're asked.
 * Information the grimoire already knows (the Godfather's Outsiders, the Oracle's count, the Shugenja's direction,
 * the Undertaker's character) is filled in truthfully, for the Storyteller to change if they're drunk or poisoned.
 * As with the bluffs, anything the grimoire still needs first (a grandchild, a red herring) is picked and placed,
 * and the Storyteller is told.
 */
export function nightPreset(g: GameState, id: string, k: 'first' | 'other', holders: string[]): NightWake {
  const to = nightWho(g, id, k, holders);
  const base = presetFor(id, k);
  const out: NightWake = { to, panels: base.panels, ask: base.ask, extra: {} };
  const me = g.seats.find((s) => s.id === holders[0]);
  const players = g.seats.filter((s) => !isTraveller(s.roleId));

  if (id === 'knight') {
    // Two players that aren't the Demon: the ones marked KNOW, or two at random.
    const marked = seatIdsOf(withReminder(g, 'knight'));
    const pool = shuffle(players.filter((s) => s.id !== me?.id && getRole(s.roleId)?.team !== 'demon').map((s) => s.id));
    out.panels = [panel({ seatIds: [...marked, ...pool.filter((x) => !marked.includes(x))].slice(0, 2) })];
  } else if (id === 'grandmother' && k === 'first') {
    let child = withReminder(g, 'grandmother', 'Grandchild')[0];
    if (!child) {
      const pick = shuffle(players.filter((s) => s.id !== me?.id && seatAlignment(s) === 'good'))[0];
      if (pick) {
        st.addReminder(pick.id, 'grandmother', 'Grandchild');
        ui.toast(`${seatName(g, pick.id)} is the grandchild (the reminder’s on them). Move it before you show this, if you like.`, 'info');
        child = pick;
      }
    }
    out.panels = [panel({ card: 'thisPlayerIs', seatIds: child ? [child.id] : [], roleIds: child?.roleId ? [child.roleId] : [] })];
  } else if (id === 'shugenja' && me) {
    const way = closestEvil(g, me.id);
    out.panels = [panel({ signs: way ? [way] : [] })];
  } else if (id === 'oracle') {
    out.panels = [panel({ signs: [`n${g.seats.filter((s) => s.dead && seatAlignment(s) === 'evil').length}`] })];
  } else if (id === 'undertaker') {
    // The character they really had: a Drunk shows as the Drunk.
    const hanged = executedToday(g);
    out.panels = [panel({ roleIds: hanged?.roleId ? [hanged.roleId] : [] })];
  } else if (id === 'godfather' && k === 'first') {
    const outsiders = [...new Set(onTeam(g, 'outsider').map((s) => s.roleId!))];
    out.panels = [panel({ roleIds: outsiders, text: outsiders.length ? 'These Outsiders are in play.' : 'No Outsiders are in play.' })];
  } else if (id === 'fortuneteller' && !withReminder(g, 'fortuneteller', 'Red Herring').length) {
    // Never wake them without a red herring in place: any good player, the Fortune Teller included.
    const pick = shuffle(players.filter((s) => seatAlignment(s) === 'good'))[0];
    if (pick) {
      st.addReminder(pick.id, 'fortuneteller', 'Red Herring');
      ui.toast(`${seatName(g, pick.id)} is the Fortune Teller’s red herring (the reminder’s on them). Move it if you like.`, 'info');
    }
  } else if (id === 'lunatic' && k === 'first') {
    if (to.some((x) => holders.includes(x))) {
      // As if they were the Demon: any players as their Minions, and three good characters.
      const count = Math.max(1, onTeam(g, 'minion').length);
      const anyone = shuffle(players.filter((s) => !holders.includes(s.id)).map((s) => s.id)).slice(0, count);
      out.panels = [panel({ card: 'theseAreMinions', seatIds: anyone }), panel({ card: 'notInPlay', roleIds: shuffle(notInPlayGood(g)).slice(0, 3) })];
    } else out.panels = lunaticPanels(g, false);
    out.ask = null;
  } else if (id === 'lunatic') {
    // Asked whatever the Demon they think they are is asked.
    const believed = me?.shownRoleId && getRole(me.shownRoleId)?.team === 'demon' ? me.shownRoleId : (onTeam(g, 'demon')[0]?.roleId ?? 'imp');
    const p = presetFor(believed, 'other');
    out.panels = p.panels;
    out.ask = p.ask;
  } else if (id === 'barber') {
    out.panels = [panel({ card: 'selectedYou', roleIds: ['barber'] })];
    out.ask = { kind: 'players', count: 2, optional: true, prompt: 'Which 2 players should swap characters, if any?' };
  } else if (id === 'hatter') {
    out.panels = [panel({ card: 'selectedYou', roleIds: ['hatter'] })];
    out.ask = { kind: 'character', count: 1, optional: true, prompt: 'Which character do you want to become, if any?' };
  } else if (k === 'other' && getRole(id)?.team === 'demon') {
    out.panels = [...lunaticPanels(g, true), ...out.panels];
  }
  return out;
}

/**
 * "You are" with the character each seat now has (or thinks they have) and their alignment, for telling them after
 * a change in the night: a starpass, a Fang Gu's jump, a Barber's haircut, a Hatter's tea party. Several at once
 * each see only their own.
 */
export function tellCharacters(seatIds: string[]): NightWake {
  const g = hostGame();
  const seats = seatIds.map((id) => g.seats.find((s) => s.id === id)).filter((s) => s !== undefined);
  const told = (s: (typeof seats)[number], card: InfoCard | null): WakePanel => {
    const shown = s.shownRoleId ?? s.roleId;
    const side = s.alignment ?? defaultAlignment(getRole(shown)?.team);
    return panel({ card, roleIds: shown ? [shown] : [], signs: side ? [side] : [] });
  };
  if (seats.length === 1) return { to: [seats[0].id], panels: [told(seats[0], 'youAre')], ask: null, extra: {} };
  return {
    to: seats.map((s) => s.id),
    panels: [panel({ card: 'youAre' })],
    ask: null,
    extra: Object.fromEntries(seats.map((s) => [s.id, [told(s, null)]])),
  };
}

/** Opens the wake screen ready to tell these seats their character. Nothing is shown until the Storyteller says. */
export function tell(seatIds: string[]) {
  const t = tellCharacters(seatIds);
  if (t.to.length) ui.wake(t.to, t.panels, null, t.extra);
}

export function evilTeam() {
  const g = hostGame();
  const demons = seatIdsOf(onTeam(g, 'demon'));
  const minions = seatIdsOf(onTeam(g, 'minion'));
  // Minions think the Magician is a Demon, and the Demon thinks they're a Minion.
  const magicians = seatIdsOf(g.seats.filter((s) => s.roleId === 'magician'));
  const bluffs = g.bluffs.filter(Boolean) as string[];
  return { demons, minions, magicians, bluffs };
}

/**
 * Whether the Demon and Minions can be woken together to see each other. Not with a Magician in play: the Minions
 * have to think the Magician is a Demon, while the Demon thinks they're a Minion.
 */
export function canWakeTogether(g: GameState = hostGame()): boolean {
  return onTeam(g, 'demon').length > 0 && onTeam(g, 'minion').length > 0 && !g.seats.some((s) => s.roleId === 'magician');
}

export function minionInfo(): { to: string[]; panels: WakePanel[] } {
  const { demons, minions, magicians } = evilTeam();
  return {
    to: minions,
    panels: [panel({ card: 'thisIsDemon', seatIds: shuffle([...demons, ...magicians]) }), panel({ card: 'theseAreMinions', seatIds: minions })],
  };
}

/** Never wake the Demon without bluffs to show them. */
function evilTeamWithBluffs() {
  if (!evilTeam().bluffs.length) {
    st.randomBluffs();
    ui.toast('Picked three bluffs for you. Change them at the bottom left before you show them.', 'info');
  }
  return evilTeam();
}

export function demonInfo(): { to: string[]; panels: WakePanel[] } {
  const { demons, minions, magicians, bluffs } = evilTeamWithBluffs();
  return {
    to: demons,
    panels: [
      panel({ card: 'theseAreMinions', seatIds: shuffle([...minions, ...magicians]) }),
      ...lunaticPanels(hostGame(), false),
      panel({ card: 'notInPlay', roleIds: bluffs }),
    ],
  };
}

/** Wakes the Demon and Minions together so they all see each other; only the Demon also sees the bluffs (and the Lunatic). */
export function wholeEvilTeam(): { to: string[]; panels: WakePanel[]; extra: Record<string, WakePanel[]> } {
  const { demons, minions, bluffs } = evilTeamWithBluffs();
  const lunatic = lunaticPanels(hostGame(), false);
  return {
    to: [...demons, ...minions],
    panels: [panel({ card: 'thisIsDemon', seatIds: demons }), panel({ card: 'theseAreMinions', seatIds: minions })],
    extra: Object.fromEntries(demons.map((id) => [id, [...lunatic, panel({ card: 'notInPlay', roleIds: bluffs })]])),
  };
}
