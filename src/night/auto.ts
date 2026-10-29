import { getRole, NIGHT_SPECIALS } from '../data';
import { evilInfoStatus } from '../lib/evilInfo';
import { diedRecently, executedToday } from '../lib/grimoire';
import { guideSteps, nightKind, wakeFor, type NightStep } from '../lib/nightGuide';
import { tellCharacters } from '../lib/presets';
import { shuffle } from '../lib/util';
import { grimoireSnapshot, hostGame, isTraveller, seatAlignment, seatName, st, useHost } from '../state/host';
import type { Ask, GameState, WakePanel } from '../state/types';
import { emptyPanel, ui, useUI } from '../state/ui';
import { idleWhy, NIGHT_ROLES, NIGHTLY_TOKENS, type AutoNight, type Choice, type Grim, type KeptOutcome, type NightEffect, type NightRole, type NSeat } from './rules';

/**
 * The automated night, on the Storyteller's side. As night falls every player whose character acts tonight is sent
 * their question at once, on their own screen (so nobody waits on anyone else, and nobody can tell from the timing
 * who is acting); each player's answer comes back here. The Storyteller then goes down the night order as usual:
 * each step shows the answers and what the grimoire says should follow (the information to show, the tokens to place,
 * who dies), worked out when its turn comes so everything earlier tonight counts (a poisoning, a kill). One click
 * shows it and does it; or they change it first, skip it, or do it by hand. A few questions wait their turn: a
 * Ravenkeeper only chooses once killed, and anyone shown something earlier tonight (the evil team's first-night
 * information, the Lunatic's choice for the Demon) is asked only after they've seen it.
 */

/** The game as the night's rules see it (src/night/rules.ts). */
export function grimOf(g: GameState): Grim {
  return {
    seats: g.seats.map((s, i) => ({
      id: s.id,
      name: s.name || `Seat ${i + 1}`,
      roleId: s.roleId,
      shownRoleId: s.shownRoleId,
      team: getRole(s.roleId)?.team ?? null,
      evil: seatAlignment(s) === 'evil',
      dead: s.dead,
      reminders: s.reminders.map((r) => ({ roleId: r.roleId, text: r.text })),
    })),
    night: g.day,
    first: nightKind(g) === 'first',
    script: [...new Set([...g.script.roles, ...(g.seats.map((s) => s.roleId).filter(Boolean) as string[])])]
      .map((id) => getRole(id))
      .filter((r) => r !== undefined)
      .map((r) => ({ id: r.id, team: r.team, name: r.name })),
    executed: executedToday(g)?.id ?? null,
    diedToday: g.seats.filter((s) => diedRecently(g, s.id)).map((s) => s.id),
    diedTonight: g.phase === 'night' ? g.nightDeaths : [],
  };
}

/** Steps whose wake is laid out as the guided night always has (the evil team's first-night information). */
const PRESET = new Set(['eviltogether', 'minioninfo', 'demoninfo']);

export type StepKind = 'special' | 'preset' | 'auto' | 'manual';
export type StepStatus = 'done' | 'idle' | 'queued' | 'waiting' | 'ready' | 'manual';

/** Someone a step is about: who has (or thinks they have) the character, who's asked, and what they answered. */
export interface PlanHolder {
  seat: NSeat;
  believes: boolean;
  idle: string | null;
  /** Each asker's question tonight. */
  asks: Record<string, Ask>;
  answers: Record<string, Choice | undefined>;
  /** Asked already (the wake's id). */
  asked: Record<string, string>;
  /** Where its suggestion is kept. */
  outKey: string;
}

export interface PlanStep {
  step: NightStep;
  key: string;
  kind: StepKind;
  role?: NightRole;
  holders: PlanHolder[];
  status: StepStatus;
  /** Why nobody wakes, when idle. */
  why?: string;
  /** Seats shown something at this step, before any question of their own later on. */
  informs: string[];
}

const answerKey = (h: PlanHolder) => JSON.stringify(Object.keys(h.asks).map((id) => h.answers[id] ?? null));

/** The night as it stands: each of tonight's steps, who it's about, and how far it has got. Changes nothing. */
export function nightPlan(g: GameState): PlanStep[] {
  const a = g.autoNight;
  const grim = grimOf(g);
  const k = nightKind(g);
  const evil = evilInfoStatus(g);
  const replyTo = (wakeId: string | undefined, seatId: string) => (wakeId ? g.replies.find((r) => r.wakeId === wakeId && r.seatId === seatId) : undefined);
  return guideSteps(g).map((step): PlanStep => {
    const id = step.row.id;
    const key = step.key;
    const done = g.nightDone.includes(key);
    if (NIGHT_SPECIALS[id] && !PRESET.has(id)) return { step, key, kind: 'special', holders: [], status: done ? 'done' : 'ready', informs: [] };
    if (PRESET.has(id) || (id === 'lunatic' && k === 'first')) {
      const shown = (id === 'eviltogether' && (evil.minionsShown || evil.bluffsShown)) || (id === 'minioninfo' && evil.minionsShown) || (id === 'demoninfo' && evil.bluffsShown);
      const idle = !step.who.length || step.who.every((x) => g.seats.find((s) => s.id === x)?.dead);
      return { step, key, kind: 'preset', holders: [], status: done || shown ? 'done' : idle ? 'idle' : 'ready', informs: step.who, why: idle ? 'Nobody to wake.' : undefined };
    }
    const role = NIGHT_ROLES[id];
    if (!role) return { step, key, kind: 'manual', holders: [], status: done ? 'done' : step.who.length ? 'manual' : 'idle', informs: [], why: step.who.length ? undefined : 'Nobody to wake.' };
    const demonStep = getRole(id)?.team === 'demon';
    const holders: PlanHolder[] = step.row.holders
      // Someone who only thinks they're the Demon (the Lunatic) has a step of their own.
      .filter((h) => !(h.believes && demonStep && h.seat.roleId === 'lunatic'))
      .map((h) => {
        const seat = grim.seats.find((s) => s.id === h.seat.id)!;
        const idle = idleWhy(grim, id, seat);
        const askers = idle ? [] : (role.askers?.(grim, seat) ?? [seat.id]);
        const asks: Record<string, Ask> = {};
        for (const sid of askers) {
          const asker = grim.seats.find((s) => s.id === sid);
          const q = asker && role.ask?.(grim, asker, seat);
          if (q) asks[sid] = q;
        }
        const asked = a?.asks[key] ?? {};
        const answers: Record<string, Choice | undefined> = {};
        for (const sid of Object.keys(asks)) {
          const r = replyTo(asked[sid], sid);
          answers[sid] = a?.forced[key]?.[sid] ?? (r ? { seatIds: r.seatIds, roleIds: r.roleIds, answer: r.answer } : undefined);
        }
        return { seat, believes: h.believes, idle, asks, answers, asked: Object.fromEntries(Object.keys(asks).filter((sid) => asked[sid]).map((sid) => [sid, asked[sid]])), outKey: `${key}|${seat.id}` };
      });
    const active = holders.filter((h) => !h.idle);
    const informs = active.flatMap((h) => role.informs?.(grim, h.seat) ?? []);
    let status: StepStatus;
    if (done) status = 'done';
    else if (!active.length) status = 'idle';
    else if (active.some((h) => Object.keys(h.asks).some((sid) => !h.answers[sid] && !h.asked[sid]))) status = 'queued';
    else if (active.some((h) => Object.keys(h.asks).some((sid) => !h.answers[sid]))) status = 'waiting';
    else status = 'ready';
    return { step, key, kind: 'auto', role, holders, status, informs, why: active.length ? undefined : (holders.find((h) => h.idle)?.idle ?? 'Nobody to wake.') };
  });
}

/** The step the Storyteller is on: the first not done that has anything to do (dawn, in the end). */
export const currentStep = (plan: PlanStep[]) => plan.find((p) => p.status !== 'done' && p.status !== 'idle' && !(p.kind === 'special' && p.step.row.id === 'dusk'));

/** Automation is on for tonight. */
export function autoOn(g: GameState = hostGame()): boolean {
  return Boolean(g.autoNight?.on && g.autoNight.night === g.day && g.phase === 'night');
}

const update = (fn: (g: GameState) => void) => useHost.getState().update(fn);
const auto = (g: GameState) => g.autoNight as AutoNight;

/** The question as it's shown: "Make a choice" and the question, in the Storyteller's words. */
const askPanels = (q: Ask): WakePanel[] => [{ ...emptyPanel(), card: q?.kind === 'yesno' ? 'useAbility' : 'makeChoice' }];

// ---------------------------------------------------------------- dusk

/**
 * Night falls with the automation on: tokens that only lasted the night before come off, a red herring goes down if
 * the Fortune Teller needs one, and everyone's questions go out (`tick`).
 */
export function beginNight() {
  const g0 = hostGame();
  if (g0.phase !== 'night' || !g0.revealed || g0.ended) return;
  const cleared: string[] = [];
  update((g) => {
    for (const s of g.seats) {
      const keep = s.reminders.filter((r) => !NIGHTLY_TOKENS.some(([role, text]) => r.roleId === role && r.text === text));
      if (keep.length !== s.reminders.length) cleared.push(...s.reminders.filter((r) => !keep.includes(r)).map((r) => r.text));
      s.reminders = keep;
    }
    g.autoNight = { night: g.day, on: true, dusk: Date.now(), asks: {}, out: {}, forced: {}, wakes: [] };
    if (!g.nightDone.includes(`${nightKind(g)}:dusk`)) g.nightDone = [...g.nightDone, `${nightKind(g)}:dusk`];
  });
  if (cleared.length) ui.toast(`Last night’s ${[...new Set(cleared)].join(', ')} reminders are off for the new night.`, 'info');
  const g = hostGame();
  const fortune = g.seats.some((s) => (s.roleId === 'fortuneteller' || s.shownRoleId === 'fortuneteller') && !s.dead);
  if (fortune && !g.seats.some((s) => s.reminders.some((r) => r.roleId === 'fortuneteller' && r.text === 'Red Herring'))) {
    const pick = shuffle(g.seats.filter((s) => !isTraveller(s.roleId) && seatAlignment(s) === 'good'))[0];
    if (pick) {
      st.addReminder(pick.id, 'fortuneteller', 'Red Herring');
      ui.toast(`${seatName(g, pick.id)} is the Fortune Teller’s red herring (the reminder’s on them). Move it if you like.`, 'info');
    }
  }
  tick();
}

/** Automation on or off for tonight (and as the Storyteller's choice for nights to come). */
export function setAuto(on: boolean) {
  useUI.setState({ autoNight: on });
  const g = hostGame();
  if (g.phase !== 'night') return;
  if (on && g.autoNight?.night !== g.day) return beginNight();
  update((g) => {
    if (g.autoNight) g.autoNight.on = on;
  });
  if (on) tick();
}

// ---------------------------------------------------------------- keeping the night moving

let queued = false;
/** Looks again soon (after whatever just changed has settled). */
export function nudge() {
  if (queued) return;
  queued = true;
  setTimeout(() => {
    queued = false;
    tick();
  }, 0);
}

/**
 * Sends each player their next question when it's due, shows it again when they've finished looking at something
 * else, puts them back to sleep once they've seen what they were shown, and works out the current step's suggestion
 * once its answers are in. Run after every change; does nothing that's already done.
 */
export function tick() {
  const g = hostGame();
  if (!autoOn(g) || !g.revealed || g.ended) return;
  const plan = nightPlan(g);
  const cur = currentStep(plan);
  const a = auto(g);

  // Each seat's next thing tonight, in night order: a question to answer, or something to be shown first.
  const sends: { key: string; seat: string; ask: Ask }[] = [];
  const reshow: { seat: string; wakeId: string }[] = [];
  const busy = (seat: string, wakeId?: string) => {
    const w = g.awake[seat];
    return Boolean(w && w.wakeId !== wakeId && !w.seen);
  };
  const settled = new Set<string>();
  for (const p of plan) {
    if (p.status === 'done' || p.status === 'idle') continue;
    for (const sid of p.informs) settled.add(sid);
    for (const h of p.holders) {
      if (h.idle) continue;
      for (const [sid, q] of Object.entries(h.asks)) {
        if (h.answers[sid]) continue;
        if (settled.has(sid)) continue;
        settled.add(sid);
        const due = !p.role?.late || p === cur;
        if (!due) continue;
        if (!h.asked[sid]) {
          if (!busy(sid)) sends.push({ key: p.key, seat: sid, ask: q });
        } else if (g.awake[sid]?.wakeId !== h.asked[sid] && !busy(sid)) reshow.push({ seat: sid, wakeId: h.asked[sid] });
      }
    }
  }

  // Anyone done with what this sent them goes back to sleep: they've seen it, or it was a question that no longer
  // stands (its step was skipped, or went idle as they died first). A question still open keeps them awake, so they
  // can change their answer until the Storyteller settles it.
  const openAsks = new Set(
    plan.filter((p) => p.status !== 'done' && p.status !== 'idle').flatMap((p) => p.holders.filter((h) => !h.idle).flatMap((h) => Object.values(h.asked))),
  );
  const anAsk = (wakeId: string) => Object.values(a.asks).some((m) => Object.values(m).includes(wakeId));
  const moving = new Set([...sends.map((x) => x.seat), ...reshow.map((x) => x.seat)]);
  const toSleep = Object.entries(g.awake)
    .filter(([sid, w]) => a.wakes.includes(w.wakeId) && !moving.has(sid) && !openAsks.has(w.wakeId) && (w.seen || anAsk(w.wakeId)))
    .map(([sid]) => sid);

  // The current step's suggestion, worked out once its answers are in (again if an answer changes, until it's used).
  const outs: [string, KeptOutcome][] = [];
  if (cur?.kind === 'auto' && cur.status === 'ready' && cur.role?.outcome) {
    const grim = grimOf(g);
    for (const h of cur.holders) {
      if (h.idle) continue;
      const from = answerKey(h);
      const kept = a.out[h.outKey];
      if (kept && (kept.applied || kept.from === from)) continue;
      const answers = Object.fromEntries(Object.entries(h.answers).filter(([, c]) => c !== undefined)) as Record<string, Choice>;
      outs.push([h.outKey, { ...cur.role.outcome(grim, h.seat, answers, Math.random), from }]);
    }
  }

  if (!sends.length && !reshow.length && !toSleep.length && !outs.length) return;
  for (const s of sends) {
    const id = st.wake([s.seat], askPanels(s.ask), s.ask);
    update((g) => {
      const an = auto(g);
      (an.asks[s.key] ??= {})[s.seat] = id;
      an.wakes.push(id);
    });
  }
  if (reshow.length || toSleep.length || outs.length) {
    update((g) => {
      for (const r of reshow) g.awake[r.seat] = { wakeId: r.wakeId, seen: false };
      for (const sid of toSleep) delete g.awake[sid];
      for (const [k, o] of outs) auto(g).out[k] = o;
    });
  }
}

// ---------------------------------------------------------------- the Storyteller's buttons

/** The suggestion a holder's step will use: the true answer, or the false one if the Storyteller picked it. */
export function chosen(o: KeptOutcome): { panels: WakePanel[]; effects: NightEffect[] } {
  return o.useAlt && o.alt ? { panels: o.alt.panels.length ? o.alt.panels : o.panels, effects: o.alt.effects } : { panels: o.panels, effects: o.effects };
}

function applyEffects(effects: NightEffect[]) {
  for (const e of effects) {
    const g = hostGame();
    if (e.k === 'token') {
      update((g) => {
        if (e.only) for (const s of g.seats) s.reminders = s.reminders.filter((r) => !(r.roleId === e.roleId && r.text === e.text));
      });
      st.addReminder(e.seatId, e.roleId, e.text);
    } else if (e.k === 'kill') {
      if (!g.seats.find((s) => s.id === e.seatId)?.dead) st.toggleDead(e.seatId);
    } else if (e.k === 'swap') st.swapRoles(e.a, e.b, true);
    else if (e.k === 'become') st.setRole(e.seatId, e.roleId);
  }
}

/** Puts back to sleep anyone still looking at this step's question (they've answered; it's settled). */
function sleepAskers(key: string) {
  const g = hostGame();
  const asked = g.autoNight?.asks[key] ?? {};
  const awake = Object.entries(asked)
    .filter(([sid, id]) => g.awake[sid]?.wakeId === id)
    .map(([sid]) => sid);
  if (awake.length) st.sleep(awake);
}

const remember = (id: string) => update((g) => void auto(g).wakes.push(id));

/**
 * Does a step: its effects go into the grimoire (tokens, deaths, a haircut), its information is shown, anyone told
 * of a new character is told, and it's ticked off. The evil team's first-night steps show what the guided night lays
 * out (picking bluffs first if there are none).
 */
export function settle(key: string) {
  const g = hostGame();
  const p = nightPlan(g).find((x) => x.key === key);
  if (!p) return;
  if (p.kind === 'preset') {
    const w = wakeFor(p.step.row, nightKind(g));
    if (w.to.length) remember(st.wake(w.to, w.panels, w.ask, w.extra));
  } else if (p.kind === 'auto') {
    for (const h of p.holders) {
      const o = auto(hostGame()).out[h.outKey];
      if (h.idle || !o || o.applied) continue;
      const use = chosen(o);
      applyEffects(use.effects);
      const panels = [...use.panels];
      if (o.grimoire) panels.push({ ...emptyPanel(), grimoire: grimoireSnapshot(hostGame()) });
      const to = o.to.filter((id) => hostGame().seats.some((s) => s.id === id));
      if (to.length && panels.length) remember(st.wake(to, panels, null, o.extra ?? {}));
      if (o.tell?.length) {
        const t = tellCharacters(o.tell);
        if (t.to.length) remember(st.wake(t.to, t.panels, null, t.extra));
      }
      update((g) => {
        const kept = auto(g).out[h.outKey];
        if (kept) kept.applied = true;
      });
    }
  }
  sleepAskers(key);
  st.setNightDone(key, true);
  nudge();
}

/** Passes over a step without doing anything (and lets anyone still being asked go back to sleep). */
export function skip(key: string) {
  sleepAskers(key);
  st.setNightDone(key, true);
  nudge();
}

/** Opens a step again, to do it differently. What was already done in the grimoire stays done. */
export function reopen(key: string) {
  st.setNightDone(key, false);
  update((g) => {
    for (const k of Object.keys(auto(g).out)) if (k.startsWith(`${key}|`)) delete auto(g).out[k];
  });
  nudge();
}

/** Works a step's suggestion out again from the grimoire as it is now (after a change by hand, or for other players). */
export function rework(key: string) {
  update((g) => {
    for (const [k, o] of Object.entries(auto(g).out)) if (k.startsWith(`${key}|`) && !o.applied) delete auto(g).out[k];
  });
  nudge();
}

/** The Storyteller answers for a player (who hasn't, or can't). */
export function answerFor(key: string, seatId: string, c: Choice | null) {
  update((g) => {
    const f = (auto(g).forced[key] ??= {});
    if (c) f[seatId] = c;
    else delete f[seatId];
  });
  nudge();
}

/** Shows a player their question again (they closed it, or were woken for something else). */
export function askAgain(key: string, seatId: string) {
  const id = hostGame().autoNight?.asks[key]?.[seatId];
  if (id) update((g) => void (g.awake[seatId] = { wakeId: id, seen: false }));
}

/** The Storyteller's own changes to a suggestion: the false answer instead, or who dies. */
export function editOutcome(outKey: string, fn: (o: KeptOutcome) => void) {
  update((g) => {
    const o = auto(g).out[outKey];
    if (o && !o.applied) fn(o);
  });
}

/** Opens the wake screen with a step's information laid out, to change it before it's shown (Show does the rest). */
export function editFirst(key: string) {
  const g = hostGame();
  const p = nightPlan(g).find((x) => x.key === key);
  if (!p) return;
  if (p.kind !== 'auto') {
    const w = wakeFor(p.step.row, nightKind(g));
    ui.wake(w.to, w.panels, w.ask, w.extra, key);
    return;
  }
  const h = p.holders.find((x) => !x.idle && auto(g).out[x.outKey]?.to.length);
  const o = h && auto(g).out[h.outKey];
  if (!o) return;
  const panels = [...chosen(o).panels];
  if (o.grimoire) panels.push({ ...emptyPanel(), grimoire: grimoireSnapshot(g) });
  ui.wake(o.to, panels.length ? panels : [emptyPanel()], null, o.extra ?? {}, key);
}

/**
 * Something was shown from the wake screen for a step of tonight's (changed first, or done by hand). For a step the
 * automation worked out, its tokens and deaths go in as well and the step is ticked off; a question waits for its
 * answer, as the Storyteller carries on from the wake screen.
 */
export function shownByHand(key: string, wakeId: string, asked: boolean) {
  const g = hostGame();
  if (!autoOn(g) || asked) return;
  remember(wakeId);
  const p = nightPlan(g).find((x) => x.key === key);
  if (p?.kind === 'auto') {
    for (const h of p.holders) {
      const o = auto(hostGame()).out[h.outKey];
      if (h.idle || !o || o.applied) continue;
      applyEffects(chosen(o).effects);
      if (o.tell?.length) {
        const t = tellCharacters(o.tell);
        if (t.to.length) remember(st.wake(t.to, t.panels, null, t.extra));
      }
      update((g) => {
        const kept = auto(g).out[h.outKey];
        if (kept) kept.applied = true;
      });
    }
  }
  sleepAskers(key);
  st.setNightDone(key, true);
  ui.close();
  nudge();
}

// ---------------------------------------------------------------- watching the game

let started = false;
/** Starts watching the game on the Storyteller's page: night falling (with the automation on) and every change after. */
export function startAutoNight() {
  if (started) return;
  started = true;
  let was = hostGame();
  useHost.subscribe(({ g }) => {
    // Night falling, or the characters going out once it has.
    const nightfall = g.phase === 'night' && (was.phase !== 'night' || was.day !== g.day || (g.revealed && !was.revealed));
    was = g;
    if (nightfall && useUI.getState().autoNight && g.revealed && g.autoNight?.night !== g.day) {
      setTimeout(beginNight, 0);
      return;
    }
    if (autoOn(g)) nudge();
  });
  // Reloaded mid-night: carry on.
  if (autoOn()) nudge();
}
