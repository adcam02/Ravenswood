import { useEffect, useRef, useState } from 'react';
import { useHud } from '../game/hud';
import { player, useClient, useNominated } from '../net/client';
import { nominateBlock, nominateWhy, nominationsOpen, seatName, st, useHost } from '../state/host';
import type { NominationRequest } from '../state/types';
import { ui, useUI } from '../state/ui';
import { useView, type View } from '../state/view';
import { Icon } from './Icon';
import { Modal } from './Modal';

/**
 * Whether this player has a Nominate button: by day once the game is under way, for the living. `why` says why
 * they can't nominate just now (they've had today's), and `waiting` is a request the Storyteller hasn't answered.
 */
export function nominateButton(view: View): { show: boolean; why: string | null; waiting: NominationRequest | null } {
  const me = view.seats.find((s) => s.isMe);
  if (!me || me.dead || !nominationsOpen(view)) return { show: false, why: null, waiting: null };
  const block = nominateBlock(view, me.id);
  const waiting = view.nomRequests.find((r) => r.by === me.id && r.status === 'pending') ?? null;
  return { show: true, why: block ? nominateWhy(block) : null, waiting };
}

const nameIn = (view: View, id: string) => view.seats.find((s) => s.id === id)?.label ?? 'Someone';

/** A player choosing who to nominate. It goes to the Storyteller, who starts the vote (or doesn't). */
export function NominateModal() {
  const view = useView();
  const me = view.seats.find((s) => s.isMe);
  const [target, setTarget] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [why, setWhy] = useState('');
  const sentAt = useRef(0);
  const answer = useNominated();
  const outdated = useClient((s) => s.hostOutdated);
  const block = me ? nominateBlock(view, me.id) : 'noSeat';
  const waiting = me ? view.nomRequests.find((r) => r.by === me.id && r.status === 'pending') : undefined;
  // Anyone at the table, dead or alive, yourself included.
  const choices = view.seats.filter((s) => s.claimed || s.name);
  const chosen = view.seats.find((s) => s.id === target);

  // The Storyteller's page has it (it shows up as waiting), or says why not.
  useEffect(() => {
    if (!sending || answer.at < sentAt.current) return;
    setSending(false);
    if (answer.ok) {
      ui.toast(`You nominated ${chosen?.label ?? 'them'}. The Storyteller will start the vote.`, 'good');
      ui.close();
    } else setWhy(answer.why || 'The Storyteller didn’t get that. Try again?');
  }, [answer.at, answer.ok, answer.why, sending, chosen?.label]);

  const send = () => {
    if (!chosen) return;
    sentAt.current = Date.now();
    setWhy('');
    setSending(true);
    player.nominate(chosen.id);
  };

  let body;
  if (!me) body = <p className="slayer-blurb">Take a seat in town first.</p>;
  else if (waiting) {
    body = (
      <>
        <p className="slayer-blurb">
          You’ve nominated <b>{nameIn(view, waiting.target)}</b>. The Storyteller will start the vote, or let you know if they don’t.
        </p>
        <div className="slayer-go">
          <button
            className="btn"
            onClick={() => {
              player.withdrawNomination(waiting.id);
              ui.close();
            }}
          >
            Take it back
          </button>
        </div>
      </>
    );
  } else if (block) body = <p className="slayer-blurb">{nominateWhy(block)}</p>;
  else if (outdated) body = <p className="slayer-blurb">The Storyteller’s page is out of date, so it can’t take nominations from here yet. Ask them to reload it.</p>;
  else {
    body = (
      <>
        <p className="slayer-blurb">
          Choose who you think should be executed. The Storyteller starts the vote, then everyone votes as the clock hand goes round.
          You can nominate once a day, and each player can only be nominated once a day.
        </p>
        <h3 className="slayer-ask">Who do you nominate?</h3>
        <div className="ask-seats">
          {choices.map((s) => {
            const taken = nominateBlock(view, me.id, s.id) === 'targetNominated';
            return (
              <button
                key={s.id}
                className={`ask-seat ${target === s.id ? 'on' : ''} ${s.dead ? 'dead' : ''}`}
                disabled={taken}
                onClick={() => setTarget(s.id)}
                title={taken ? `${s.label} has already been nominated today` : undefined}
              >
                <span className="ask-num">{s.index + 1}</span>
                {s.label}
                {s.isMe ? <em>you</em> : taken ? <em>nominated today</em> : s.dead && <em>dead</em>}
              </button>
            );
          })}
        </div>
        {why && <p className="nominate-why">{why}</p>}
        <div className="slayer-go">
          <button className="btn big primary" disabled={!chosen || sending} onClick={send}>
            <Icon name="point" /> {sending ? 'Asking the Storyteller…' : chosen ? `Nominate ${chosen.label}` : 'Choose a player'}
          </button>
        </div>
      </>
    );
  }
  return (
    <Modal title="Nominate" eyebrow="Once a day" size="sm" className="nominate-modal">
      {body}
    </Modal>
  );
}

/** Tells a player what the Storyteller did with their nomination: started it, or not (and why, if it was overtaken). */
function useNominationNews(view: View) {
  const seen = useRef<Map<string, string> | null>(null);
  useEffect(() => {
    const before = seen.current;
    seen.current = new Map(view.nomRequests.map((r) => [r.id, r.status]));
    if (!before) return;
    for (const r of view.nomRequests) {
      if (before.get(r.id) !== 'pending') continue;
      const who = nameIn(view, r.target);
      if (r.status === 'started') ui.toast(`The Storyteller has started your nomination of ${who}.`, 'good');
      else if (r.status === 'declined') ui.toast(`The Storyteller didn’t start your nomination of ${who}.${r.note ? ` ${r.note}` : ''}`, 'info');
    }
  }, [view]);
}

/**
 * The player's Nominate button at the meeting, by their stool (it's in the menu everywhere else), and what's become
 * of a nomination they've made while the Storyteller looks at it, wherever they are.
 */
export function NominateDock() {
  const view = useView();
  const seated = useHud((s) => s.meetingSeated);
  const job = useHud((s) => s.job);
  const { show, why, waiting } = nominateButton(view);
  useNominationNews(view);
  if (!show || job) return null;
  if (waiting) {
    return (
      <div className="nominate-dock waiting cosy-panel" role="status">
        <Icon name="point" />
        <span>
          You nominated <b>{nameIn(view, waiting.target)}</b>
          <em>Waiting for the Storyteller…</em>
        </span>
        <button className="cosy-btn small" onClick={() => player.withdrawNomination(waiting.id)}>
          Take back
        </button>
      </div>
    );
  }
  // Not while a vote is open: one nomination at a time.
  const open = view.nomination && view.nomination.status !== 'done';
  if (!seated || why || open) return null;
  return (
    <button className="nominate-dock cosy-btn" onClick={() => ui.open({ kind: 'nominate' })} title="Nominate someone for execution (once a day)">
      <Icon name="point" /> Nominate
    </button>
  );
}

/**
 * The Storyteller answering a player's nomination: start it (set up on the clock, ready to run the vote as usual)
 * or decline it. It waits behind a Slayer claim, which is more pressing.
 */
export function NominationPrompt() {
  const g = useHost((s) => s.g);
  const pending = (g.nomRequests ?? []).filter((r) => r.status === 'pending' && r.day === g.day);
  const r = pending[0];
  if (!r || !nominationsOpen(g) || g.slayer.some((x) => x.result === 'pending')) return null;
  const by = seatName(g, r.by);
  const target = seatName(g, r.target);
  const block = nominateBlock(g, r.by, r.target, r.id);
  const open = g.nomination && g.nomination.status !== 'done' ? g.nomination : null;
  const note =
    block === 'dead'
      ? `${by} has died since, and the dead can’t nominate.`
      : block === 'nominated'
        ? `${by} has already nominated today.`
        : block === 'targetNominated'
          ? `${target} has already been nominated today.`
          : block
            ? 'They can’t nominate now.'
            : open
              ? `${seatName(g, open.nomineeId)}’s nomination is still open: close it on the clock first.`
              : null;
  return (
    <div className="slayer-prompt nominate-prompt surface" role="alertdialog" aria-label="A nomination">
      <span className="eyebrow">
        <Icon name="point" /> Nomination{pending.length > 1 ? ` · ${pending.length - 1} more waiting` : ''}
      </span>
      <h3>
        {by} nominates {target}
      </h3>
      <p>{note ?? 'Start it to set it up on the clock, then run the vote as usual. Or decline it, and they can nominate again.'}</p>
      <div className="slayer-choice">
        <button className="btn" onClick={() => st.declineNominationRequest(r.id)}>
          Decline
        </button>
        <button
          className="btn primary"
          disabled={Boolean(note)}
          onClick={() => {
            st.startNominationRequest(r.id);
            // The clock and its controls are in the grimoire.
            useUI.setState({ grimoireOpen: true });
          }}
        >
          <Icon name="vote" /> Start the nomination
        </button>
      </div>
    </div>
  );
}
