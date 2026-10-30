import { useEffect, useState } from 'react';
import { player } from '../net/client';
import { speechSecs, st, useHost } from '../state/host';
import { useUI } from '../state/ui';
import { useView } from '../state/view';
import { Icon } from './Icon';

/** The seconds left as a clock: 0:24. */
export const clock = (secs: number) => `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}`;

/** Seconds left for whoever has the floor, ticking down (in this browser's clock). */
export function useSecondsLeft(until: number | null): number {
  const [, tick] = useState(0);
  useEffect(() => {
    if (until === null) return;
    const t = setInterval(() => tick((x) => x + 1), 250);
    return () => clearInterval(t);
  }, [until]);
  return until === null ? 0 : Math.max(0, Math.ceil((until - Date.now()) / 1000));
}

/** The Storyteller's say over the stages: more time, on to the next one, or straight to the vote. */
export function SpeechControls({ cosy = false }: { cosy?: boolean }) {
  const view = useView();
  const sp = view.nomination?.speech;
  if (view.mode !== 'st' || !sp) return null;
  // The grimoire's own buttons on the clock; the town's cosy ones on the banner.
  const b = (kind: string) => (cosy ? `cosy-btn small ${kind === 'go' ? 'primary' : ''}` : `btn small ${kind === 'go' ? 'sapphire' : kind === 'more' ? 'quiet' : ''}`);
  // Open discussion goes on until the Storyteller starts the vote.
  if (sp.kind === 'discuss') {
    return (
      <div className="speech-controls">
        <button className={b('go')} onClick={st.nextSpeech}>
          Start the vote
        </button>
      </div>
    );
  }
  return (
    <div className="speech-controls">
      <button className={b('more')} onClick={() => st.speechTime(15)} title="Give them 15 more seconds">
        +15s
      </button>
      <button className={b('next')} onClick={st.nextSpeech}>
        {sp.kind === 'accuse' ? 'On to the defence' : 'On to discussion'}
      </button>
      <button className={b('go')} onClick={st.skipSpeeches}>
        Straight to the vote
      </button>
    </div>
  );
}

/**
 * Before a vote, for everyone: who holds the talking stick (the nominator's accusation, then the nominee's defence)
 * and how long they have at most, then open discussion until the Storyteller starts the vote. Whoever holds the stick
 * is heard by the whole meeting and every other player is muted; they can pass it on early.
 */
export function SpeechBanner() {
  const view = useView();
  const n = view.nomination;
  const sp = n?.speech ?? null;
  const left = useSecondsLeft(sp && sp.kind !== 'discuss' ? sp.until : null);
  // (In the grimoire the clock in the middle says it all, with the same buttons.)
  const grimoire = useUI((s) => s.grimoireOpen) && view.mode === 'st';
  if (!n || !sp || grimoire) return null;
  const name = (id: string | null) => view.seats.find((s) => s.id === id)?.label ?? 'Someone';
  const open = sp.kind === 'discuss';
  const mine = !open && view.seats.find((s) => s.id === sp.seatId)?.isMe;
  const title = sp.kind === 'accuse' ? `${name(n.nominatorId)} accuses ${name(n.nomineeId)}` : sp.kind === 'defend' ? `${name(n.nomineeId)}’s defence` : 'Open discussion';
  const holder = name(sp.seatId);
  const note = open
    ? `Everyone can talk about ${name(n.nomineeId)}. The Storyteller starts the vote when you’re ready.`
    : mine
      ? 'You have the talking stick: everyone at the meeting hears you, and everyone else is muted.'
      : view.mode === 'st'
        ? `${holder} has the talking stick: the players are muted (you aren’t).`
        : `You’re muted: ${holder} has the talking stick.`;
  return (
    <div className={`speech-banner cosy-panel ${sp.kind} ${mine ? 'mine' : ''} ${!open && left <= 5 ? 'ending' : ''}`} role="status" aria-live="polite">
      <span className="speech-icon" aria-hidden="true">
        {open ? <Icon name="users" /> : '🎤'}
      </span>
      <span className="speech-text">
        <strong>
          {title} {!open && <span className="speech-clock">{clock(left)}</span>}
        </strong>
        <span>{note}</span>
      </span>
      {mine && (
        <button className="cosy-btn small primary speech-done" onClick={() => player.speechDone()} title="Pass the talking stick on">
          I’m done
        </button>
      )}
      <SpeechControls cosy />
    </div>
  );
}

/** The Storyteller's setting: how long the accusation and the defence each last before a vote, or off. */
export function SpeechSetting() {
  const secs = useHost((s) => speechSecs(s.g));
  return (
    <div className="setting">
      <div>
        <strong>Accusation and defence</strong>
        <span>
          Before each vote the nominator, then the nominee, holds the talking stick for up to this long (everyone else is muted), then
          open discussion until you start the vote. Off goes straight to the vote.
        </span>
      </div>
      <div className="speech-lengths">
        {[0, 15, 30, 45, 60].map((n) => (
          <button key={n} className={`btn small ${secs === n ? 'primary' : 'quiet'}`} onClick={() => st.setSpeechSecs(n)}>
            {n ? `${n}s` : 'Off'}
          </button>
        ))}
      </div>
    </div>
  );
}
