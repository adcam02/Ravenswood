import { useEffect, useRef, useState } from 'react';
import { useTaken } from '../../net/client';
import { animalsLocked } from '../../state/host';
import { ui } from '../../state/ui';
import { useView } from '../../state/view';
import { animalInfo, fixLook, type AnimalId, type Look } from '../../world/types';
import { letGoOfAnimal, LookEditor, savedLook, useJoin, wearLook, type PickTab } from './JoinFlow';
import { shownName } from '../../state/nicks';

/**
 * The customiser, from the Customise button on the bar: the same pickers as joining, over the town. While a game is
 * on, the animal and its colour stay as they are (the host keeps them too); the hat and pet can change any time.
 */
export function CustomiseModal() {
  const view = useView();
  const me = view.seats.find((s) => s.isMe);
  const mine = me?.look ?? null;
  const locked = Boolean(mine) && animalsLocked(view);
  const [name, setName] = useState(me?.name ?? '');
  const [look, setLook] = useState<Look>(() => fixLook(mine ?? savedLook()));
  const [tab, setTab] = useState<PickTab>(locked ? 'hat' : 'animal');
  const [note, setNote] = useState<string | null>(null);
  // What we've asked the host for, while we wait to see it on our seat.
  const [sent, setSent] = useState<Look | null>(null);
  const opened = useRef(Date.now());

  const close = () => {
    // Anything we were looking at goes back for others to choose.
    letGoOfAnimal(name);
    ui.close();
  };

  // A game starting while this is open: back to the animal and colour we have.
  useEffect(() => {
    if (!locked || !mine) return;
    letGoOfAnimal(name);
    setLook((l) => (l.animal === mine.animal && l.color === mine.color ? l : { ...l, animal: mine.animal, color: mine.color }));
  }, [locked, mine?.animal, mine?.color]);

  // Our seat has what we asked for: done.
  useEffect(() => {
    if (!sent || !mine || me?.name !== name.trim()) return;
    if (mine.animal === sent.animal && mine.color === sent.color && (mine.hat ?? null) === (sent.hat ?? null) && (mine.pet ?? null) === (sent.pet ?? null)) ui.close();
  }, [sent, mine, me?.name, name]);
  // No answer for a while (a slow line): close anyway, as the request is sent again until it lands.
  useEffect(() => {
    if (!sent) return;
    const t = setTimeout(() => ui.close(), 5000);
    return () => clearTimeout(t);
  }, [sent]);

  // The host said someone else got there first: pick again.
  const taken = useTaken();
  useEffect(() => {
    if (!taken.animal || taken.at < opened.current) return;
    if (useJoin.getState().held === taken.animal) useJoin.setState({ held: null });
    const who = animalInfo(taken.animal as AnimalId)?.name ?? 'that animal';
    setNote(`${shownName(taken.by)} just took the ${who.toLowerCase()}. Pick another!`);
    setSent(null);
    setTab('animal');
  }, [taken.at, taken.animal, taken.by]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const save = () => {
    if (!name.trim()) return;
    const l = fixLook(locked && mine ? { ...look, animal: mine.animal, color: mine.color } : look);
    setNote(null);
    setSent(l);
    wearLook(name, l);
  };

  return (
    <div className="join cosy customise" onPointerDown={(e) => e.target === e.currentTarget && close()}>
      <div className="join-card cosy-panel join-animal" role="dialog" aria-modal="true" aria-label="Customise your character">
        <div className="join-animal-head">
          <span className="join-eyebrow">Customise your character</span>
          <label className="customise-name">
            <span>Name</span>
            <input className="cosy-input" value={name} onChange={(e) => setName(e.target.value)} maxLength={24} placeholder="As your friends know you" />
          </label>
          {note && <p className="join-note">{note}</p>}
        </div>
        <LookEditor name={name || me?.name || ''} look={look} setLook={setLook} locked={locked} tab={tab} setTab={setTab} />
        <div className="join-actions">
          <button className="cosy-btn" onClick={close}>
            Cancel
          </button>
          <button className="cosy-btn primary big" onClick={save} disabled={!name.trim() || Boolean(sent)}>
            {sent ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}
