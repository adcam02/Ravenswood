import { useEffect, useState } from 'react';
import { getRole } from '../data';
import { loadJSON, saveJSON } from '../lib/util';
import { useClient } from '../net/client';
import { useNotes, type NoteKind } from '../state/notes';
import { ui } from '../state/ui';
import { useView } from '../state/view';
import { Icon } from './Icon';
import { PanelView } from './PanelView';
import { Token } from './Token';

/** A player's private scribbles. They stay in this browser and never go to anyone else. */
export function Notepad() {
  const view = useView();
  const key = `ravenswood:notepad:${view.room}`;
  const [text, setText] = useState(() => loadJSON<string>(key, ''));
  useEffect(() => {
    const t = setTimeout(() => saveJSON(key, text), 300);
    return () => clearTimeout(t);
  }, [key, text]);
  return (
    <div className="notepad">
      <p className="notepad-hint">Only you can see this. It’s kept in this browser.</p>
      <WhosWho />
      <textarea
        className="notepad-paper"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Who said what, your theories…"
        spellCheck
      />
    </div>
  );
}

/** Every other player: the character they claim, and the one you think they really are. */
function WhosWho() {
  const view = useView();
  const noted = useNotes((s) => s.notes);
  const others = view.seats.filter((s) => !s.isMe && (s.claimed || s.name));
  if (!others.length) return null;
  const slot = (seatId: string, kind: NoteKind) => {
    const role = getRole(noted[seatId]?.[kind]);
    const what = kind === 'claim' ? 'Claims' : 'You think';
    return (
      <button
        className={`whos-slot ${role ? 'set' : ''}`}
        title={role ? `${what}: ${role.name}` : kind === 'claim' ? 'Note what they claim' : 'Note what you think they really are'}
        onClick={() => ui.open({ kind: 'character', seatId, purpose: kind === 'claim' ? 'claim' : 'note' })}
      >
        {role ? <Token roleId={role.id} label={false} /> : <span className="whos-empty">?</span>}
        <span className="whos-role">{role?.name ?? '…'}</span>
      </button>
    );
  };
  return (
    <section className="whos-who" aria-label="Who’s who">
      <div className="whos-row whos-head">
        <span>Who’s who</span>
        <span>Claims</span>
        <span>You think</span>
      </div>
      {others.map((s) => {
        const n = noted[s.id];
        const odd = Boolean(n?.claim && n.guess && n.claim !== n.guess);
        return (
          <div key={s.id} className={`whos-row ${s.dead ? 'dead' : ''} ${odd ? 'odd' : ''}`}>
            <span className="whos-seat">
              <span className="ask-num">{s.index + 1}</span>
              <span className="whos-label">{s.label}</span>
              {s.dead && <Icon name="skull" aria-label="dead" />}
            </span>
            {slot(s.id, 'claim')}
            {slot(s.id, 'guess')}
          </div>
        );
      })}
    </section>
  );
}

/** Everything the Storyteller has shown this player, newest first. */
export function Journal() {
  const priv = useClient((s) => s.priv);
  const log = [...(priv?.log ?? [])].reverse();
  const replies = priv?.replies ?? [];
  if (!log.length) return <p className="char-empty">Nothing yet. Whenever the Storyteller wakes you, what they show you is kept here.</p>;
  return (
    <ol className="journal">
      {log.map((w) => (
        <li key={w.id}>
          <span className="eyebrow">{w.when}</span>
          <PanelView message={w} compact reply={replies.find((r) => r.wakeId === w.id)} seatFor={priv?.seatId} />
        </li>
      ))}
    </ol>
  );
}
