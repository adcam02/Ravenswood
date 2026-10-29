import { useEffect, useState } from 'react';
import { getRole } from '../data';
import { loadJSON, saveJSON } from '../lib/util';
import { useClient } from '../net/client';
import { useNotes, type NoteKind } from '../state/notes';
import { ui } from '../state/ui';
import { useView } from '../state/view';
import { Icon } from './Icon';
import { NameAndReal } from './Nickname';
import { PanelView, SeatingCircle } from './PanelView';
import { Token } from './Token';

const TAB_KEY = 'ravenswood:notepad-tab';

type NotesTab = 'notes' | 'journal' | 'circle';

/** The player's Notepad: their own notes, a tab for everything the Storyteller has shown them, and who sits where. */
export function NotesPanel({ start }: { start?: NotesTab }) {
  const [tab, setTab] = useState<NotesTab>(() => {
    const kept = loadJSON<string>(TAB_KEY, 'notes');
    return start ?? (kept === 'journal' || kept === 'circle' ? kept : 'notes');
  });
  const shown = useClient((s) => s.priv?.log?.length ?? 0);
  const pick = (t: NotesTab) => {
    setTab(t);
    saveJSON(TAB_KEY, t);
  };
  return (
    <div className="notes-panel">
      <div className="seg small" role="tablist">
        <button role="tab" aria-selected={tab === 'notes'} className={tab === 'notes' ? 'on' : ''} onClick={() => pick('notes')}>
          My notes
        </button>
        <button role="tab" aria-selected={tab === 'journal'} className={tab === 'journal' ? 'on' : ''} onClick={() => pick('journal')}>
          From the Storyteller{shown ? ` (${shown})` : ''}
        </button>
        <button role="tab" aria-selected={tab === 'circle'} className={tab === 'circle' ? 'on' : ''} onClick={() => pick('circle')}>
          Circle
        </button>
      </div>
      {tab === 'notes' ? <Notepad /> : tab === 'journal' ? <Journal /> : <Circle />}
    </div>
  );
}

/** Who sits where round the circle, the same chart as on the bedroom wall: there whenever the Notepad is. */
function Circle() {
  const view = useView();
  const me = view.seats.find((s) => s.isMe);
  return (
    <div className="notes-circle">
      <SeatingCircle seatFor={me?.id ?? null} dir="clockwise" />
      <p className="notepad-hint">The first seat is at the top, going clockwise. The stools round the dais in the square go in the same order.</p>
    </div>
  );
}

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
      <p className="notepad-hint">Only you can see this. It’s kept in this browser. Tap a name to give them a nickname.</p>
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
              {s.name ? (
                <button
                  className="whos-nick"
                  title={s.nick ? `You call ${s.name} “${s.nick}”. Change or clear it` : `Give ${s.name} a nickname only you see`}
                  onClick={() => ui.open({ kind: 'nickname', seatId: s.id })}
                >
                  <span className="whos-label">
                    <NameAndReal name={s.name} label={s.label} />
                  </span>
                  <Icon name="pencil" />
                </button>
              ) : (
                <span className="whos-label">{s.label}</span>
              )}
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
  // The same card shown twice in a row (sent again by mistake) is kept once.
  const log = [...(priv?.log ?? [])].filter((w, i, all) => i === 0 || w.when !== all[i - 1].when || JSON.stringify(w.panels) !== JSON.stringify(all[i - 1].panels)).reverse();
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
