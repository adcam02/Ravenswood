import { useEffect, useMemo, useRef, useState } from 'react';
import { getRole } from '../data';
import { tell } from '../lib/presets';
import { seatName, st, useHost, winCheck } from '../state/host';
import { useNotes } from '../state/notes';
import type { DeathRecord } from '../state/types';
import { ui, useUI } from '../state/ui';
import { useView, type SeatView, type View } from '../state/view';
import { Icon } from './Icon';
import { Modal } from './Modal';
import { Token } from './Token';

const TEAM = { good: 'Good', evil: 'Evil' } as const;

/** How a player's game ended, from the last death noted against them. */
function fateOf(view: View, seat: SeatView): { text: string; dead: boolean } {
  const d = [...view.deaths].reverse().find((x) => x.seatId === seat.id);
  // (Day 0: a death from before deaths were logged, so nobody knows when.)
  if (!d || d.day === 0) return seat.dead ? { text: 'Died', dead: true } : { text: 'Survived', dead: false };
  const when = d.phase === 'night' ? `Night ${d.day}` : `Day ${d.day}`;
  const how: Record<DeathRecord['how'], string> = {
    executed: `Executed on ${when}`,
    night: `Died on ${when}`,
    slayer: `Slain by the Slayer on ${when}`,
    other: `Died on ${when}`,
  };
  return { text: how[d.how], dead: true };
}

const onTeam = (s: SeatView, winner: 'good' | 'evil') => (s.alignment ?? 'good') === winner;
const players = (view: View) => view.seats.filter((s) => s.claimed || s.name || s.roleId);

/**
 * Storyteller: the grimoire says the game might be over (every Demon dead, the Goblin executed, or two players left).
 * Confirm it, or say not yet (a Scarlet Woman, say) and the question waits until something changes. A Demon killed
 * tonight that can hand on (the Imp choosing itself, the Fang Gu choosing an Outsider) offers who takes over instead,
 * and then the wake screen to tell them.
 */
export function WinPrompt() {
  const g = useHost((s) => s.g);
  const hide = useUI((s) => s.hideGrimoire);
  const check = winCheck(g);
  if (!check || check.key === g.winDismissed) return null;
  const good = check.winner === 'good';
  const pass = hide ? undefined : check.pass;
  const demon = getRole(pass?.roleId)?.name;
  return (
    <div className={`win-prompt surface ${check.winner}`} role="alertdialog" aria-label="Is the game over?">
      <span className="eyebrow">Is the game over?</span>
      <h3>{check.reason}.</h3>
      <p>
        {check.note && (pass || !check.pass)
          ? check.note
          : good
            ? 'Unless something keeps the Demon alive (a Scarlet Woman, say), good wins.'
            : 'With two players left and the Demon alive, evil wins.'}
      </p>
      {pass && (
        <div className="win-pass">
          {pass.seatIds.map((id) => (
            <button
              key={id}
              className="btn blood"
              onClick={() => {
                st.becomeDemon(id, pass.roleId);
                tell([id]);
              }}
            >
              {seatName(g, id)} becomes the {demon}
            </button>
          ))}
        </div>
      )}
      <div className="win-choice">
        <button className="btn" onClick={() => st.dismissWin(check.key)}>
          Not yet
        </button>
        <button className={`btn ${pass ? '' : good ? 'sapphire' : 'blood'}`} onClick={() => st.endGame(check.winner, check.reason)}>
          <Icon name="flag" /> {TEAM[check.winner]} wins
        </button>
      </div>
    </div>
  );
}

/** Falling confetti in the winning team's colours. */
function Confetti({ winner }: { winner: 'good' | 'evil' }) {
  const bits = useMemo(() => {
    const colours = winner === 'good' ? ['#7cc4ff', '#ffe08a', '#ffffff', '#9ad8a4', '#4e98ec'] : ['#ff5d6c', '#b46bff', '#ffb04a', '#2a1020', '#ff8fc8'];
    return Array.from({ length: 90 }, (_, i) => ({
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 3.5}s`,
      time: `${3.2 + Math.random() * 3}s`,
      colour: colours[i % colours.length],
      spin: `${Math.random() < 0.5 ? -1 : 1}`,
      w: `${6 + Math.random() * 8}px`,
    }));
  }, [winner]);
  return (
    <div className="confetti" aria-hidden="true">
      {bits.map((b, i) => (
        <i key={i} style={{ left: b.left, animationDelay: b.delay, animationDuration: b.time, background: b.colour, width: b.w, '--spin': b.spin } as React.CSSProperties} />
      ))}
    </div>
  );
}

/**
 * Everyone: the moment the game ends, a big announcement with confetti and the winning team; after that, a
 * "Game recap" button stays at the top of the screen.
 */
export function GameOverLayer() {
  const view = useView();
  const ended = view.ended;
  const [open, setOpen] = useState(false);
  const was = useRef(ended);
  useEffect(() => {
    // Only when it happens: a page loaded after the end just gets the recap button.
    if (ended && !was.current) setOpen(true);
    if (!ended) setOpen(false);
    was.current = ended;
  }, [ended]);
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => setOpen(false), 16000);
    return () => clearTimeout(t);
  }, [open]);
  if (!ended) return null;
  const winners = players(view).filter((s) => onTeam(s, ended.winner));
  const me = view.seats.find((s) => s.isMe);
  const iWon = me ? onTeam(me, ended.winner) : null;
  return (
    <>
      {open && (
        <div className={`victory ${ended.winner}`}>
          <Confetti winner={ended.winner} />
          <div className="victory-card">
            <span className="victory-eyebrow">The game is over</span>
            <h1 className="victory-title">{TEAM[ended.winner]} wins!</h1>
            <p className="victory-reason">{ended.reason}</p>
            {iWon !== null && <p className="victory-you">{iWon ? 'Your team won. Well played!' : 'Your team lost this time.'}</p>}
            <div className="victory-team">
              {winners.map((s) => (
                <div key={s.id} className="victory-seat">
                  <Token roleId={s.roleId} alignment={s.alignment} dead={s.dead} deadBadge label={false} />
                  <span>{s.label}</span>
                  <em>{getRole(s.roleId)?.name ?? ''}</em>
                </div>
              ))}
            </div>
            <div className="victory-actions">
              <button className="btn" onClick={() => setOpen(false)}>
                Close
              </button>
              <button
                className="btn primary"
                onClick={() => {
                  setOpen(false);
                  ui.open({ kind: 'recap' });
                }}
              >
                <Icon name="scroll" /> See the recap
              </button>
            </div>
          </div>
        </div>
      )}
      {!open && (
        <button className={`recap-pill ${ended.winner}`} onClick={() => ui.open({ kind: 'recap' })}>
          <Icon name="scroll" /> {TEAM[ended.winner]} won · Game recap
        </button>
      )}
    </>
  );
}

interface Award {
  icon: string;
  title: string;
  who: string;
  detail: string;
}

/** A few light-hearted honours from the game's numbers. */
function awardsFor(view: View): Award[] {
  const name = (id: string | null) => view.seats.find((s) => s.id === id)?.label ?? 'Someone';
  const top = (ids: (string | null)[]) => {
    const n = new Map<string, number>();
    for (const id of ids) if (id) n.set(id, (n.get(id) ?? 0) + 1);
    let best: [string, number] | null = null;
    for (const e of n) if (!best || e[1] > best[1]) best = e;
    return best;
  };
  const out: Award[] = [];
  const first = view.deaths[0];
  if (first && first.day > 0) out.push({ icon: '🪦', title: 'First to fall', who: name(first.seatId), detail: first.phase === 'night' ? `Night ${first.day}` : `Day ${first.day}` });
  const nominee = top(view.history.map((h) => h.nomineeId));
  if (nominee && nominee[1] >= 2) out.push({ icon: '🔍', title: 'Most suspected', who: name(nominee[0]), detail: `Nominated ${nominee[1]} times` });
  const accuser = top(view.history.map((h) => h.nominatorId));
  if (accuser && accuser[1] >= 2) out.push({ icon: '☝️', title: 'Keenest accuser', who: name(accuser[0]), detail: `${accuser[1]} nominations` });
  const hand = top(view.history.flatMap((h) => h.voters));
  if (hand) out.push({ icon: '✋', title: 'Quickest hand', who: name(hand[0]), detail: `${hand[1]} ${hand[1] === 1 ? 'vote' : 'votes'} raised` });
  // This game's fish only (the town's catch log runs on from game to game).
  const since = view.ended?.since ?? 0;
  const fish = view.town.fish.filter((f) => f.at >= since).sort((a, b) => b.cm - a.cm)[0];
  if (fish && fish.cm > 0) out.push({ icon: '🎣', title: 'Biggest catch', who: fish.by, detail: `${fish.kind}, ${fish.cm}cm` });
  return out;
}

/** What happened on each night and day, in order. */
function timelineOf(view: View): { title: string; lines: string[] }[] {
  const name = (id: string | null) => view.seats.find((s) => s.id === id)?.label ?? 'Someone';
  const last = view.ended?.day ?? view.day;
  const out: { title: string; lines: string[] }[] = [];
  for (let d = 1; d <= last; d++) {
    const night = view.deaths.filter((x) => x.day === d && x.phase === 'night').map((x) => `${name(x.seatId)} died`);
    out.push({ title: `Night ${d}`, lines: night.length ? night : ['Nobody died'] });
    const day: string[] = [];
    for (const h of view.history.filter((x) => x.day === d)) {
      day.push(`${h.nominatorName || 'The Storyteller'} nominated ${h.nomineeName}: ${h.votes} ${h.votes === 1 ? 'vote' : 'votes'} (needed ${h.majority})`);
    }
    for (const s of view.slayer.filter((x) => x.day === d && x.result !== 'pending')) {
      day.push(`${name(s.by)} claimed to be the Slayer and chose ${name(s.target)}: ${s.result === 'dies' ? `${name(s.target)} died` : 'nothing happened'}`);
    }
    for (const x of view.deaths.filter((x) => x.day === d && x.phase === 'day' && x.how !== 'slayer')) {
      day.push(x.how === 'executed' ? `${name(x.seatId)} was executed` : `${name(x.seatId)} died`);
    }
    if (day.length || d < last) out.push({ title: `Day ${d}`, lines: day.length ? day : ['A quiet day'] });
  }
  return out;
}

/** The player's own notes against the truth: guesses that were right, and claims that weren't. */
function MyNotes({ view }: { view: View }) {
  const noted = useNotes((s) => s.notes);
  const others = players(view).filter((s) => !s.isMe && s.roleId);
  const guessed = others.filter((s) => noted[s.id]?.guess);
  const right = guessed.filter((s) => noted[s.id]!.guess === s.roleId);
  const lies = others.filter((s) => noted[s.id]?.claim && noted[s.id]!.claim !== s.roleId);
  if (!guessed.length && !lies.length) return null;
  return (
    <section className="recap-section">
      <h3>Your notes</h3>
      {guessed.length > 0 && (
        <p>
          You guessed <b>{right.length}</b> of {guessed.length} {guessed.length === 1 ? 'character' : 'characters'} right
          {right.length === guessed.length && guessed.length > 1 ? '. Perfect!' : '.'}
        </p>
      )}
      {lies.length > 0 && (
        <ul className="recap-lies">
          {lies.map((s) => (
            <li key={s.id}>
              {s.label} claimed the {getRole(noted[s.id]!.claim)?.name ?? '…'}, but was the <b>{getRole(s.roleId)?.name}</b>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

/** Everything about the game once it's over: who was who, how each of them fared, and how it went, day by day. */
export function RecapModal() {
  const view = useView();
  const ended = view.ended;
  const awards = useMemo(() => awardsFor(view), [view]);
  const timeline = useMemo(() => timelineOf(view), [view]);
  if (!ended) {
    return (
      <Modal title="Game recap" size="sm">
        <p>The game isn’t over yet.</p>
      </Modal>
    );
  }
  const seats = players(view);
  return (
    <Modal title={`${TEAM[ended.winner]} wins`} eyebrow={`Game over · after ${ended.day} ${ended.day === 1 ? 'day' : 'days'}`} size="lg" className={`recap ${ended.winner}`}>
      <p className="recap-reason">{ended.reason}.</p>
      {view.mode === 'player' && <MyNotes view={view} />}
      {awards.length > 0 && (
        <section className="recap-section">
          <h3>Honours</h3>
          <div className="recap-awards">
            {awards.map((a) => (
              <div key={a.title} className="recap-award">
                <span className="recap-award-icon">{a.icon}</span>
                <strong>{a.title}</strong>
                <span>{a.who}</span>
                <em>{a.detail}</em>
              </div>
            ))}
          </div>
        </section>
      )}
      <section className="recap-section">
        <h3>Who was who</h3>
        <div className="recap-seats">
          {seats.map((s) => {
            const fate = fateOf(view, s);
            const role = getRole(s.roleId);
            const shown = s.shownRoleId && s.shownRoleId !== s.roleId ? getRole(s.shownRoleId) : null;
            return (
              <div key={s.id} className={`recap-seat ${onTeam(s, ended.winner) ? 'won' : 'lost'} ${s.alignment ?? 'good'}`}>
                <Token roleId={s.roleId} alignment={s.alignment} dead={fate.dead} deadBadge label={false} />
                <div className="recap-seat-text">
                  <strong>{s.label}</strong>
                  <span>
                    {role ? `The ${role.name}` : 'No character'}
                    {shown && <em> (thought they were the {shown.name})</em>}
                  </span>
                  <span className={`recap-fate ${fate.dead ? 'dead' : ''}`}>{fate.text}</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>
      {timeline.length > 0 && (
        <section className="recap-section">
          <h3>How it went</h3>
          <ol className="recap-timeline">
            {timeline.map((t) => (
              <li key={t.title} className={t.title.startsWith('Night') ? 'night' : 'day'}>
                <span className="eyebrow">{t.title}</span>
                {t.lines.map((l, i) => (
                  <p key={i}>{l}</p>
                ))}
              </li>
            ))}
          </ol>
        </section>
      )}
      {view.mode === 'st' && (
        <div className="recap-st">
          <button className="btn quiet" onClick={() => (st.reopenGame(), ui.close())}>
            Carry on playing
          </button>
          <button className="btn primary" onClick={() => (st.newGame(true), ui.close())}>
            New game, same players
          </button>
        </div>
      )}
    </Modal>
  );
}

/** Storyteller settings: call the game for either side, or take it back. */
export function EndGameSetting() {
  const ended = useHost((s) => s.g.ended);
  if (ended) {
    return (
      <div className="setting">
        <div>
          <strong>Game over: {TEAM[ended.winner].toLowerCase()} won</strong>
          <span>{ended.reason}</span>
        </div>
        <button className="btn" onClick={() => ui.open({ kind: 'recap' })}>
          Recap
        </button>
        <button className="btn quiet" onClick={() => st.reopenGame()}>
          Carry on playing
        </button>
      </div>
    );
  }
  return (
    <div className="setting">
      <div>
        <strong>End the game</strong>
        <span>Reveal everyone and celebrate in the square</span>
      </div>
      <button className="btn sapphire" onClick={() => (st.endGame('good', 'The Storyteller called it for good'), ui.close())}>
        Good wins
      </button>
      <button className="btn blood" onClick={() => (st.endGame('evil', 'The Storyteller called it for evil'), ui.close())}>
        Evil wins
      </button>
    </div>
  );
}
