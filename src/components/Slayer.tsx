import { useEffect, useState } from 'react';
import { getRole } from '../data';
import { player } from '../net/client';
import { seatName, slayerOpen, st, useHost } from '../state/host';
import { ui, useUI } from '../state/ui';
import { useView, type View } from '../state/view';
import { Icon } from './Icon';
import { Modal } from './Modal';

/** Whether this player could claim to be the Slayer now, and whether they already have. */
export function slayerButton(view: View): { show: boolean; used: boolean } {
  const me = view.seats.find((s) => s.isMe);
  if (!me || me.dead || !slayerOpen(view)) return { show: false, used: false };
  return { show: true, used: view.slayer.some((s) => s.by === me.id) };
}

/** A player claiming to be the Slayer: who do they choose? */
export function SlayerModal() {
  const view = useView();
  const me = view.seats.find((s) => s.isMe);
  const { show, used } = slayerButton(view);
  const [target, setTarget] = useState<string | null>(null);
  const choices = view.seats.filter((s) => !s.isMe && !s.dead && (s.claimed || s.name));
  const chosen = view.seats.find((s) => s.id === target);
  return (
    <Modal title="The Slayer" eyebrow="Once per game" size="sm" className="slayer-modal">
      {!me || !show || used ? (
        <p className="slayer-blurb">{used ? 'You’ve already used this once this game.' : 'The Slayer can only act during the day.'}</p>
      ) : (
        <>
          <p className="slayer-blurb">
            Claim to be the Slayer and choose a player, in front of the whole town. If you really are the Slayer and they’re the
            Demon, they die. Otherwise nothing happens. You can only do this once a game.
          </p>
          <h3 className="slayer-ask">Who do you want to kill?</h3>
          <div className="ask-seats">
            {choices.map((s) => (
              <button key={s.id} className={`ask-seat ${target === s.id ? 'on' : ''}`} onClick={() => setTarget(s.id)}>
                <span className="ask-num">{s.index + 1}</span>
                {s.label}
              </button>
            ))}
          </div>
          <div className="slayer-go">
            <button
              className="btn big blood"
              disabled={!chosen}
              onClick={() => {
                if (!chosen) return;
                player.slay(chosen.id);
                ui.close();
              }}
            >
              <Icon name="dagger" /> {chosen ? `Slay ${chosen.label}` : 'Choose a player'}
            </button>
          </div>
        </>
      )}
    </Modal>
  );
}

/** The answer buttons wait this long after a claim, so even a quick answer takes as long as a real decision. */
const HOLD_MS = 4000;

/**
 * The Storyteller answering a Slayer claim. Every claim gets one, so players can't tell the real Slayer by how
 * long the answer takes. For the real Slayer the Storyteller decides: the target dies if they're the Demon, unless
 * the Slayer is drunk or poisoned (or the Recluse registers as the Demon). For anyone else nothing happens.
 */
export function SlayerPrompt() {
  const g = useHost((s) => s.g);
  const hide = useUI((s) => s.hideGrimoire);
  const shot = g.slayer.find((s) => s.result === 'pending');
  const [, tick] = useState(0);
  const wait = shot ? Math.max(0, shot.at + HOLD_MS - Date.now()) : 0;
  useEffect(() => {
    if (!wait) return;
    const t = setTimeout(() => tick((n) => n + 1), wait);
    return () => clearTimeout(t);
  }, [shot?.id, wait]);
  if (!shot) return null;
  const by = g.seats.find((s) => s.id === shot.by);
  const target = g.seats.find((s) => s.id === shot.target);
  const byName = seatName(g, shot.by);
  const targetName = seatName(g, shot.target);
  const role = getRole(target?.roleId);
  const demon = role?.team === 'demon';
  const byRole = getRole(by?.roleId);
  const notes = [by, target].flatMap((s) => (s?.reminders.length ? [`${seatName(g, s.id)}: ${s.reminders.map((r) => r.text).join(', ')}`] : []));
  const waiting = wait > 0;
  const more = g.slayer.filter((s) => s.result === 'pending').length - 1;
  return (
    <div className="slayer-prompt surface" role="alertdialog" aria-label="The Slayer">
      <span className="eyebrow">
        <Icon name="dagger" /> The Slayer{more > 0 ? ` · ${more} more waiting` : ''}
      </span>
      {shot.real ? (
        <>
          <h3>
            {byName}, the real Slayer, is using the Slayer’s ability on {targetName}
          </h3>
          {!hide && (
            <p>
              {targetName} is {role ? `the ${role.name}` : 'without a character'}
              {demon ? <b className="blood"> (the Demon)</b> : ', not the Demon'}.
            </p>
          )}
          <p>If they’re the Demon, would you like to kill {targetName}? Choose no if {byName} is drunk or poisoned.</p>
          {!hide && notes.length > 0 && <p className="slayer-notes">Reminders: {notes.join(' · ')}</p>}
        </>
      ) : (
        <>
          <h3>
            {byName} claims to be the Slayer and chooses {targetName}
          </h3>
          <p>
            {byName} isn’t the Slayer
            {!hide && byRole ? ` (${by?.shownRoleId === 'slayer' ? `the ${byRole.name}, who only thinks they are` : `they’re the ${byRole.name}`})` : ''}, so
            nothing happens.
          </p>
        </>
      )}
      <p className="slayer-notes">Everyone waits for your answer either way, so the pause gives nothing away.</p>
      <div className="slayer-choice">
        {shot.real && (
          <button className="btn blood" disabled={waiting} onClick={() => st.settleSlayer(shot.id, true)}>
            <Icon name="skull" /> Kill {targetName}
          </button>
        )}
        <button className={`btn ${shot.real ? '' : 'primary'}`} disabled={waiting} onClick={() => st.settleSlayer(shot.id, false)}>
          {waiting ? 'A moment…' : 'Nothing happens'}
        </button>
      </div>
    </div>
  );
}
