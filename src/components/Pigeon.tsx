import { useEffect, useRef, useState } from 'react';
import { useHud } from '../game/hud';
import { local } from '../game/local';
import { player, useClient, usePigeoned } from '../net/client';
import { ui } from '../state/ui';
import { useView } from '../state/view';
import { whereIs } from '../world/town/layout';
import { Icon } from './Icon';
import { Modal } from './Modal';

/** Sending a messenger pigeon: who to, and off it goes, saying where we are. */
export function PigeonModal() {
  const view = useView();
  const me = view.seats.find((s) => s.isMe);
  const [to, setTo] = useState<string | null>(null);
  const [waiting, setWaiting] = useState(false);
  const [why, setWhy] = useState('');
  const sentAt = useRef(0);
  const answer = usePigeoned();
  const outdated = useClient((s) => s.hostOutdated);
  const choices = view.seats.filter((s) => !s.isMe && s.claimed);
  const target = view.seats.find((s) => s.id === to);
  const night = view.phase === 'night';
  const where = whereIs(local.zone, local.x, local.z);

  // The Storyteller's answer: it's flown, or it hasn't (by night, or it's still resting from the last one).
  useEffect(() => {
    if (!waiting || answer.at < sentAt.current) return;
    setWaiting(false);
    if (answer.ok) {
      ui.toast(`Your pigeon is off to find ${target?.label ?? 'them'}! 🕊️`, 'good');
      ui.close();
    } else setWhy(answer.why || 'The pigeon wouldn’t fly');
  }, [answer.at, answer.ok, answer.why, waiting, target?.label]);

  const send = () => {
    if (!target) return;
    sentAt.current = Date.now();
    setWhy('');
    setWaiting(true);
    player.pigeon(target.id, where);
  };

  return (
    <Modal title="Messenger pigeon" eyebrow="Ask someone to come and talk" size="sm" className="pigeon-modal">
      {!me ? (
        <p className="pigeon-blurb">Take a seat in town first.</p>
      ) : night ? (
        <p className="pigeon-blurb">The pigeons are roosting for the night. They fly by day.</p>
      ) : outdated ? (
        <p className="pigeon-blurb">The Storyteller’s page is out of date, so the pigeons can’t fly yet. Ask them to reload it.</p>
      ) : (
        <>
          <p className="pigeon-blurb">
            A pigeon flies off to find them, lands on their shoulder and tells them you want to speak to them, and that
            you’re <strong>{where}</strong>. Then it bursts into confetti.
          </p>
          <div className="ask-seats">
            {choices.map((s) => (
              <button key={s.id} className={`ask-seat ${to === s.id ? 'on' : ''} ${s.dead ? 'dead' : ''}`} onClick={() => setTo(s.id)}>
                <span className="ask-num">{s.index + 1}</span>
                {s.label}
              </button>
            ))}
          </div>
          {why && <p className="pigeon-why">{why}</p>}
          <div className="pigeon-go">
            <button className="btn big primary" disabled={!target || waiting} onClick={send}>
              <Icon name="bird" /> {waiting ? 'Sending…' : target ? `Send it to ${target.label}` : 'Choose who it’s for'}
            </button>
          </div>
        </>
      )}
    </Modal>
  );
}

/** A pigeon has landed on our shoulder: who wants to speak to us, and where they are. */
export function PigeonNote() {
  const note = useHud((s) => s.pigeon);
  useEffect(() => {
    if (!note) return;
    const t = setTimeout(() => useHud.setState((h) => (h.pigeon?.key === note.key ? { pigeon: null } : h)), 9000);
    return () => clearTimeout(t);
  }, [note]);
  if (!note) return null;
  return (
    <button key={note.key} className="pigeon-note cosy-panel" onClick={() => useHud.setState({ pigeon: null })} aria-live="polite">
      <span className="pigeon-note-icon" aria-hidden="true">
        🕊️
      </span>
      <span className="pigeon-note-text">
        <strong>{note.name} wants to speak to you</strong>
        <span>They’re {note.where}.</span>
      </span>
    </button>
  );
}
