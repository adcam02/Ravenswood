import { useEffect, useState } from 'react';
import { speechSecs, st, useHost } from '../state/host';
import { useView } from '../state/view';
import { Icon } from './Icon';

/** The seconds left as a clock: 0:24. */
const clock = (secs: number) => `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}`;

/** Seconds left for whoever has the floor, ticking down (in this browser's clock). */
function useSecondsLeft(until: number | null): number {
  const [, tick] = useState(0);
  useEffect(() => {
    if (until === null) return;
    const t = setInterval(() => tick((x) => x + 1), 250);
    return () => clearInterval(t);
  }, [until]);
  return until === null ? 0 : Math.max(0, Math.ceil((until - Date.now()) / 1000));
}

/** The Storyteller's say over the speeches: more time, on to the next one, or straight to the vote. */
export function SpeechControls({ cosy = false }: { cosy?: boolean }) {
  const view = useView();
  const sp = view.nomination?.speech;
  if (view.mode !== 'st' || !sp) return null;
  // The grimoire's own buttons on the clock; the town's cosy ones on the banner.
  const b = (kind: string) => (cosy ? `cosy-btn small ${kind === 'go' ? 'primary' : ''}` : `btn small ${kind === 'go' ? 'sapphire' : kind === 'more' ? 'quiet' : ''}`);
  return (
    <div className="speech-controls">
      <button className={b('more')} onClick={() => st.speechTime(15)} title="Give them 15 more seconds">
        +15s
      </button>
      <button className={b('next')} onClick={st.nextSpeech}>
        {sp.kind === 'accuse' ? 'On to the defence' : 'Start the vote'}
      </button>
      {sp.kind === 'accuse' && (
        <button className={b('go')} onClick={st.skipSpeeches}>
          Straight to the vote
        </button>
      )}
    </div>
  );
}

/**
 * Before a vote, for everyone: who has the floor (the nominator's accusation, then the nominee's defence) and how
 * long they have left. Everyone at the meeting hears them clearly while the rest are hushed.
 */
export function SpeechBanner() {
  const view = useView();
  const n = view.nomination;
  const sp = n?.speech ?? null;
  const left = useSecondsLeft(sp?.until ?? null);
  if (!n || !sp) return null;
  const name = (id: string | null) => view.seats.find((s) => s.id === id)?.label ?? 'Someone';
  const mine = view.seats.find((s) => s.id === sp.seatId)?.isMe;
  const title = sp.kind === 'accuse' ? `${name(n.nominatorId)} accuses ${name(n.nomineeId)}` : `${name(n.nomineeId)}’s defence`;
  const note = mine
    ? 'You have the floor: everyone at the meeting can hear you, and the others are hushed.'
    : sp.kind === 'accuse'
      ? `Then ${name(n.nomineeId)} defends themselves, then the vote.`
      : 'Then the vote.';
  return (
    <div className={`speech-banner cosy-panel ${sp.kind} ${mine ? 'mine' : ''} ${left <= 5 ? 'ending' : ''}`} role="status" aria-live="polite">
      <span className="speech-icon" aria-hidden="true">
        <Icon name={sp.kind === 'accuse' ? 'point' : 'megaphone'} />
      </span>
      <span className="speech-text">
        <strong>
          {title} <span className="speech-clock">{clock(left)}</span>
        </strong>
        <span>{note}</span>
      </span>
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
        <span>Before each vote the nominator makes their case, then the nominee defends themselves, each heard by the whole meeting</span>
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
