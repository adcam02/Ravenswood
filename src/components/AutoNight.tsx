import { useEffect, useRef, useState } from 'react';
import { getRole, nightReminder } from '../data';
import { bringDawn, guide, nightKind, stepName, stepNote } from '../lib/nightGuide';
import { joinNames } from '../lib/util';
import {
  answerFor,
  askAgain,
  autoOn,
  chosen,
  currentStep,
  editFirst,
  editOutcome,
  nightPlan,
  reopen,
  rework,
  setAuto,
  settle,
  skip,
  startAutoNight,
  type PlanHolder,
  type PlanStep,
} from '../night/auto';
import type { Choice, KeptOutcome, NightEffect } from '../night/rules';
import { seatName, useHost } from '../state/host';
import type { Ask, GameState } from '../state/types';
import { useUI } from '../state/ui';
import { useView } from '../state/view';
import { Icon } from './Icon';
import { PanelView } from './PanelView';
import { RichText } from './RichText';
import { NightIcon } from './SidePanel';

const STATUS: Record<PlanStep['status'], string> = {
  done: 'Done',
  idle: 'Nobody wakes',
  queued: 'Not asked yet',
  waiting: 'Waiting',
  ready: 'Ready',
  manual: 'By hand',
};

/**
 * The Storyteller's automated night: tonight's night order with where each step is up to, and the step they're on
 * laid out with the players' answers and what the grimoire suggests, ready to show or confirm in one click. Shown in
 * place of the guided night while the automation is on (which it is unless the Storyteller turns it off).
 */
export function AutoNightPanel() {
  useEffect(() => startAutoNight(), []);
  const view = useView();
  const g = useHost((s) => s.g);
  const open = useUI((s) => s.nightGuide);
  const hidden = useUI((s) => s.hideGrimoire);
  const [picked, setPicked] = useState<string | null>(null);
  const list = useRef<HTMLOListElement>(null);
  const curKey = g.phase === 'night' && autoOn(g) ? currentStep(nightPlan(g))?.key : undefined;
  // Keep the step being done in sight in the list, as the night moves on.
  useEffect(() => {
    const row = list.current?.querySelector<HTMLElement>('.auto-row.cur');
    if (row && list.current) list.current.scrollTop = Math.max(0, row.offsetTop - list.current.offsetTop - 40);
  }, [curKey, open]);
  if (view.mode !== 'st' || g.phase !== 'night' || !g.revealed || g.ended || hidden || !autoOn(g)) return null;
  const plan = nightPlan(g);
  const cur = currentStep(plan);
  const shown = plan.find((p) => p.key === picked) ?? cur;
  const at = cur ? plan.indexOf(cur) + 1 : plan.length;
  const waiting = plan.filter((p) => p.status === 'waiting').length;
  if (!open) {
    return (
      <button className="night-guide-tab surface" onClick={() => useUI.setState({ nightGuide: true })} title="Open the night">
        <Icon name="moon" /> {at} of {plan.length}: {cur ? stepName(cur.step) : 'Dawn'}
        {waiting > 0 && <span className="auto-count">{waiting} waiting</span>}
      </button>
    );
  }
  return (
    <div className="night-guide auto-night surface" role="region" aria-label="The night">
      <div className="night-guide-head">
        <span className="eyebrow">
          <Icon name="moon" /> Night {g.day} · players choose on their screens
        </span>
        <span className="auto-head-tools">
          <button className="btn small quiet" onClick={() => setAuto(false)} title="Run the night by hand instead, waking each character yourself">
            Run by hand
          </button>
          <button className="night-guide-hide" onClick={() => useUI.setState({ nightGuide: false })} title="Tuck the night away" aria-label="Tuck the night away">
            <Icon name="chevronDown" />
          </button>
        </span>
      </div>
      {shown && <StepCard p={shown} g={g} current={shown === cur} back={shown !== cur && cur ? () => setPicked(null) : undefined} />}
      <ol className="auto-list" ref={list}>
        {plan.map((p) => (
          <li key={p.key}>
            <button className={`auto-row ${p.status} ${p === shown ? 'on' : ''} ${p === cur ? 'cur' : ''}`} onClick={() => setPicked(p === cur ? null : p.key)}>
              <span className="night-icon">
                <NightIcon id={p.step.row.id} />
              </span>
              <span className="auto-row-name">
                <b>{stepName(p.step)}</b>
                <small>{who(g, p)}</small>
              </span>
              <span className={`auto-chip ${p.status}`}>{p.status === 'waiting' ? `Waiting for ${joinNames(waitingFor(p).map((id) => seatName(g, id)))}` : STATUS[p.status]}</span>
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}

/** Whose step it is: who has the character (or thinks so), and anyone else asked, like the Barber's Demon. */
const wakes = (p: PlanStep): string[] => (p.kind === 'auto' ? [...new Set(p.holders.flatMap((h) => [h.seat.id, ...Object.keys(h.asks)]))] : p.step.who);
const who = (g: GameState, p: PlanStep) => joinNames(wakes(p).map((id) => seatName(g, id)));

const waitingFor = (p: PlanStep) => p.holders.flatMap((h) => Object.keys(h.asks).filter((id) => !h.answers[id] && h.asked[id]));

function StepCard({ p, g, current, back }: { p: PlanStep; g: GameState; current: boolean; back?: () => void }) {
  const k = nightKind(g);
  const text = nightReminder(p.step.row.id, k);
  const note = stepNote(g, p.step);
  const [more, setMore] = useState(false);
  const holders = p.holders.filter((h) => !h.idle);
  const outs = holders.map((h) => g.autoNight?.out[h.outKey]).filter((o): o is KeptOutcome => Boolean(o));
  return (
    <div className="auto-step">
      <div className="night-guide-step">
        <div className="night-icon">
          <NightIcon id={p.step.row.id} />
        </div>
        <div className="night-guide-text">
          <div className="night-name">
            <strong>{stepName(p.step)}</strong>
            {wakes(p).map((id) => {
              const s = g.seats.find((x) => x.id === id);
              const believes = p.step.row.holders.some((h) => h.believes && h.seat.id === id);
              return (
                <span key={id} className={`night-who ${s?.dead ? 'dead' : ''}`}>
                  {seatName(g, id)}
                  {believes && ` (${getRole(s?.roleId)?.name})`}
                </span>
              );
            })}
            {back && (
              <button className="btn small quiet auto-back" onClick={back}>
                Back to the current step
              </button>
            )}
          </div>
          {text && (
            <p className={`auto-reminder ${more ? 'open' : ''}`} onClick={() => setMore(!more)} title={more ? undefined : 'Show it all'}>
              <RichText text={text} />
            </p>
          )}
          {p.status === 'idle' && <p className="night-guide-note">{p.why ?? note?.text ?? 'Nobody wakes for this tonight.'}</p>}
          {p.status !== 'idle' && note && p.kind !== 'auto' && <p className="night-guide-note">{note.text}</p>}
        </div>
      </div>
      {p.kind === 'auto' && p.status !== 'idle' && holders.map((h) => <Holder key={h.outKey} p={p} h={h} g={g} current={current} />)}
      {p.kind === 'preset' && p.status !== 'done' && p.status !== 'idle' && (
        <p className="auto-says">
          {p.step.row.id === 'lunatic'
            ? 'The Lunatic’s first night, laid out as the guided night does: Demon information for the Lunatic, or the Demon told who the Lunatic is.'
            : `Shows ${joinNames(p.step.who.map((id) => seatName(g, id)))} the evil team${p.step.row.id !== 'minioninfo' ? ' (and the Demon its three bluffs, picked now if you haven’t)' : ''}.`}
        </p>
      )}
      <Actions p={p} g={g} outs={outs} current={current} />
    </div>
  );
}

/** One holder's part in a step: who answered what, and what follows from it. */
function Holder({ p, h, g, current }: { p: PlanStep; h: PlanHolder; g: GameState; current: boolean }) {
  const o = g.autoNight?.out[h.outKey];
  const done = p.status === 'done';
  return (
    <div className="auto-holder">
      {Object.entries(h.asks).map(([sid, ask]) => (
        <Answer key={sid} p={p} seatId={sid} ask={ask} choice={h.answers[sid]} asked={Boolean(h.asked[sid])} forced={Boolean(g.autoNight?.forced[p.key]?.[sid])} g={g} done={done} />
      ))}
      {!Object.keys(h.asks).length && p.status !== 'done' && !o && <p className="auto-says">Nothing to ask: {current ? 'working it out…' : 'worked out when its turn comes.'}</p>}
      {o && <Suggestion o={o} outKey={h.outKey} g={g} name={h.seat.name} done={done || Boolean(o.applied)} />}
    </div>
  );
}

function Answer({ p, seatId, ask, choice, asked, forced, g, done }: { p: PlanStep; seatId: string; ask: Ask; choice?: Choice; asked: boolean; forced: boolean; g: GameState; done: boolean }) {
  const [picking, setPicking] = useState(false);
  const name = seatName(g, seatId);
  const awake = g.awake[seatId];
  const said = choice ? describe(g, choice, ask) : null;
  return (
    <div className="auto-answer">
      <span className={`auto-dot ${choice ? 'in' : asked ? 'out' : ''}`} />
      <span className="grow">
        {said ? (
          <>
            <b>{name}</b> {forced ? 'answered (by you):' : 'chose'} <b>{said}</b>
          </>
        ) : asked ? (
          <>
            Waiting for <b>{name}</b>
            <small>{awake ? (awake.seen ? ' · looking at something else' : ' · their question is on screen') : ' · asleep'}</small>
          </>
        ) : (
          <>
            <b>{name}</b> hasn’t been asked yet <small>{p.role?.late ? '(when its turn comes)' : '(after what they’re shown first)'}</small>
          </>
        )}
      </span>
      {!done && (
        <span className="auto-answer-tools">
          {asked && !choice && (
            <button className="btn small quiet" onClick={() => askAgain(p.key, seatId)} title="Put their question back on their screen">
              Ask again
            </button>
          )}
          <button className="btn small quiet" onClick={() => (forced ? answerFor(p.key, seatId, null) : setPicking(!picking))}>
            {forced ? 'Use theirs' : 'Answer for them'}
          </button>
        </span>
      )}
      {picking && !done && (
        <AnswerPicker
          g={g}
          ask={ask}
          self={seatId}
          done={(c) => {
            answerFor(p.key, seatId, c);
            setPicking(false);
          }}
        />
      )}
    </div>
  );
}

function describe(g: GameState, c: Choice, ask: Ask): string {
  const parts = [...(c.seatIds ?? []).map((id) => seatName(g, id)), ...(c.roleIds ?? []).map((id) => `the ${getRole(id)?.name ?? id}`)];
  if (c.answer !== undefined) parts.push(c.answer ? 'yes' : 'no');
  return parts.length ? joinNames(parts) : ask?.kind === 'players' ? 'nobody' : 'none';
}

/** The Storyteller choosing for a player: players round the circle, or a character from the script. */
function AnswerPicker({ g, ask, self, done }: { g: GameState; ask: Ask; self: string; done: (c: Choice) => void }) {
  const [ids, setIds] = useState<string[]>([]);
  if (!ask) return null;
  if (ask.kind === 'yesno') {
    return (
      <div className="auto-picker">
        <button className="btn small" onClick={() => done({ answer: true })}>
          Yes
        </button>
        <button className="btn small" onClick={() => done({ answer: false })}>
          No
        </button>
      </div>
    );
  }
  if (ask.kind === 'character') {
    const roles = g.script.roles.map((id) => getRole(id)).filter((r) => r && (!ask.teams || ask.teams.includes(r.team)));
    return (
      <div className="auto-picker">
        <select defaultValue="" onChange={(e) => e.target.value !== '' && done({ roleIds: e.target.value === '-' ? [] : [e.target.value] })}>
          <option value="" disabled>
            Choose a character…
          </option>
          {ask.optional && <option value="-">None</option>}
          {roles.map((r) => (
            <option key={r!.id} value={r!.id}>
              {r!.name}
            </option>
          ))}
        </select>
      </div>
    );
  }
  return (
    <div className="auto-picker">
      {g.seats.map((s) => (
        <button
          key={s.id}
          className={`btn small ${ids.includes(s.id) ? 'primary' : ''}`}
          disabled={ask.notSelf && s.id === self}
          onClick={() => setIds((x) => (x.includes(s.id) ? x.filter((y) => y !== s.id) : [...x, s.id].slice(-ask.count)))}
        >
          {seatName(g, s.id)}
        </button>
      ))}
      <button className="btn small primary" disabled={ids.length !== ask.count && !(ask.optional && !ids.length)} onClick={() => done({ seatIds: ids })}>
        Use
      </button>
    </div>
  );
}

const effectText = (g: GameState, e: NightEffect): string =>
  e.k === 'token'
    ? `${e.text} reminder on ${seatName(g, e.seatId)}`
    : e.k === 'kill'
      ? `${seatName(g, e.seatId)} dies`
      : e.k === 'swap'
        ? `${seatName(g, e.a)} and ${seatName(g, e.b)} swap characters`
        : `${seatName(g, e.seatId)} becomes the ${getRole(e.roleId)?.name ?? e.roleId}`;

/** What the grimoire says: the information (and to whom), notes, the tokens and deaths, and the false answer. */
function Suggestion({ o, outKey, g, name, done }: { o: KeptOutcome; outKey: string; g: GameState; name: string; done: boolean }) {
  const use = chosen(o);
  const kills = use.effects.filter((e) => e.k === 'kill');
  const canKill = kills.length > 0 || o.pickVictim || o.notes.some((n) => /Mayor/.test(n));
  return (
    <div className="auto-suggest">
      {o.unreliable && (
        <div className="auto-warn">
          <Icon name="info" />
          <span className="grow">
            {name} {o.unreliable}: {o.to.length ? 'the answer can be wrong' : 'it may do nothing'}.
          </span>
          {o.alt && !done && (
            <span className="auto-toggle">
              <button className={`btn small ${!o.useAlt ? 'primary' : ''}`} onClick={() => editOutcome(outKey, (x) => (x.useAlt = false))}>
                The truth
              </button>
              <button className={`btn small ${o.useAlt ? 'primary' : ''}`} onClick={() => editOutcome(outKey, (x) => (x.useAlt = true))}>
                {o.alt.label}
              </button>
            </span>
          )}
        </div>
      )}
      {(use.panels.length > 0 || o.grimoire) && o.to.length > 0 && (
        <div className="auto-info">
          <span className="auto-label">
            {done ? 'Shown to' : 'Show'} {joinNames(o.to.map((id) => seatName(g, id)))}
          </span>
          <PanelView message={{ panels: use.panels, ask: null }} compact />
          {o.grimoire && <span className="chip">The grimoire as it stands</span>}
        </div>
      )}
      {o.notes.length > 0 && (
        <ul className="auto-notes">
          {o.notes.map((n) => (
            <li key={n}>{n}</li>
          ))}
        </ul>
      )}
      {(use.effects.length > 0 || o.tell?.length) && (
        <div className="auto-effects">
          <span className="auto-label">{done ? 'Done' : 'Then'}</span>
          {use.effects.map((e, i) => (
            <span key={i} className={`auto-effect ${e.k}`}>
              {effectText(g, e)}
            </span>
          ))}
          {o.tell?.length ? <span className="auto-effect">and each is told their new character</span> : null}
        </div>
      )}
      {canKill && !done && (
        <label className="auto-victim">
          <span>Who dies</span>
          <select
            value={kills.map((e) => (e as { seatId: string }).seatId)[0] ?? ''}
            onChange={(e) => {
              const id = e.target.value;
              editOutcome(outKey, (x) => {
                const keep = (list: NightEffect[]) => [...list.filter((f) => f.k !== 'kill'), ...(id ? [{ k: 'kill' as const, seatId: id }] : [])];
                if (x.useAlt && x.alt) x.alt.effects = keep(x.alt.effects);
                else x.effects = keep(x.effects);
              });
            }}
          >
            <option value="">Nobody</option>
            {g.seats
              .filter((s) => !s.dead)
              .map((s) => (
                <option key={s.id} value={s.id}>
                  {seatName(g, s.id)} ({getRole(s.roleId)?.name ?? 'no character'})
                </option>
              ))}
          </select>
        </label>
      )}
    </div>
  );
}

function Actions({ p, g, outs, current }: { p: PlanStep; g: GameState; outs: KeptOutcome[]; current: boolean }) {
  const id = p.step.row.id;
  if (p.status === 'done') {
    return (
      <div className="night-guide-actions">
        <span className="grow auto-says">Done.</span>
        {p.kind !== 'special' && (
          <button className="btn small" onClick={() => reopen(p.key)} title="Untick it, to do it again (what was done in the grimoire stays)">
            Undo the tick
          </button>
        )}
      </div>
    );
  }
  if (p.kind === 'special') {
    return (
      <div className="night-guide-actions">
        <span className="grow" />
        {id === 'dawn' ? (
          <button className="btn primary" onClick={bringDawn}>
            <Icon name="sun" /> Bring the dawn
          </button>
        ) : (
          <button className="btn primary" onClick={() => skip(p.key)}>
            Done
          </button>
        )}
      </div>
    );
  }
  const byHand = p.step.who.length > 0 && (
    <button className="btn" onClick={() => guide.wake(p.step)} title="Open the wake screen for this, as the guided night does">
      <Icon name="wake" /> Wake by hand
    </button>
  );
  if (p.kind === 'manual' || p.status === 'idle') {
    return (
      <div className="night-guide-actions">
        <button className="btn" onClick={() => skip(p.key)}>
          {p.status === 'idle' ? 'Tick it off' : 'Done'}
        </button>
        <span className="grow" />
        {byHand}
      </div>
    );
  }
  if (p.kind === 'preset') {
    return (
      <div className="night-guide-actions">
        <button className="btn" onClick={() => skip(p.key)}>
          Skip
        </button>
        <span className="grow" />
        <button className="btn" onClick={() => editFirst(p.key)}>
          <Icon name="pencil" /> Edit first
        </button>
        <button className="btn primary" onClick={() => settle(p.key)}>
          <Icon name="wake" /> Show them
        </button>
      </div>
    );
  }
  const info = outs.some((o) => o.to.length > 0 && (chosen(o).panels.length > 0 || o.grimoire));
  const effects = outs.flatMap((o) => chosen(o).effects);
  const tells = outs.some((o) => o.tell?.length);
  const label = info
    ? `Show ${joinNames([...new Set(outs.flatMap((o) => o.to))].map((x) => seatName(g, x)))}`
    : effects.length || tells
      ? effects.some((e) => e.k === 'kill')
        ? `Confirm: ${joinNames(effects.filter((e) => e.k === 'kill').map((e) => seatName(g, (e as { seatId: string }).seatId)))} ${effects.filter((e) => e.k === 'kill').length > 1 ? 'die' : 'dies'}`
        : 'Confirm'
      : 'Done';
  const ready = p.status === 'ready' && outs.length > 0;
  return (
    <div className="night-guide-actions">
      <button className="btn" onClick={() => skip(p.key)} title="Tick this off without doing anything">
        Skip
      </button>
      <span className="grow" />
      {!ready && byHand}
      {ready && (
        <button className="btn square" onClick={() => rework(p.key)} title="Work it out again from the grimoire as it is now" aria-label="Work it out again">
          <Icon name="shuffle" />
        </button>
      )}
      {ready && info && (
        <button className="btn" onClick={() => editFirst(p.key)} title="Open it in the wake screen to change it before it's shown">
          <Icon name="pencil" /> Edit first
        </button>
      )}
      {ready ? (
        <button className="btn primary" onClick={() => settle(p.key)}>
          {info ? <Icon name="wake" /> : <Icon name="check" />} {label}
        </button>
      ) : (
        <span className="auto-says">{current ? (p.status === 'ready' ? 'Working it out…' : 'Waiting for an answer.') : 'Not its turn yet.'}</span>
      )}
    </div>
  );
}
