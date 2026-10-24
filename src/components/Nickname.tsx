import { useState } from 'react';
import { nickFor, nicks, useNicks } from '../state/nicks';
import { ui } from '../state/ui';
import { useView } from '../state/view';
import { Modal } from './Modal';

/** Someone's name as this viewer calls them, with their real name small beside it when they've a nickname. */
export function NameAndReal({ name, label }: { name: string; label: string }) {
  const nick = useNicks((m) => nickFor(name, m));
  return (
    <>
      {label}
      {nick && <small className="real-name"> ({name})</small>}
    </>
  );
}

/** Giving another player a nickname that only you see. */
export function NicknameModal({ seatId }: { seatId: string }) {
  const view = useView();
  const seat = view.seats.find((s) => s.id === seatId);
  const [text, setText] = useState(seat?.nick ?? '');
  if (!seat?.name) return null;
  const save = (nick: string | null) => {
    nicks.set(seat.name, nick);
    ui.close();
  };
  return (
    <Modal title={`A nickname for ${seat.name}`} eyebrow="Only you see it" size="sm" className="nickname-modal">
      <form
        className="form"
        onSubmit={(e) => {
          e.preventDefault();
          save(text);
        }}
      >
        <label className="field">
          <span>Call them</span>
          <input className="input" value={text} onChange={(e) => setText(e.target.value)} placeholder={seat.name} maxLength={24} autoFocus />
        </label>
        <p className="nickname-hint">
          On your screen, {seat.name} shows as this everywhere: over their head, on the map and in every list. Nobody else sees it, and it
          stays in this browser for next time.
        </p>
        <div className="nickname-actions">
          {seat.nick && (
            <button type="button" className="btn quiet" onClick={() => save(null)}>
              Clear it
            </button>
          )}
          <button className="btn primary">Save</button>
        </div>
      </form>
    </Modal>
  );
}
