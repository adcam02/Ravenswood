import { disguise, heldRole, nominationsToday } from '../../state/host';
import { ui, useUI } from '../../state/ui';
import { useView } from '../../state/view';
import { Icon } from '../Icon';
import { TeamCounts } from '../TeamCounts';
import { Token } from '../Token';

const R = 78;

/** A small circle of the seats in the corner of the Storyteller's screen, to glance at without opening the book. */
export function MiniGrimoire() {
  const view = useView();
  const hide = useUI((s) => s.hideGrimoire);
  const n = view.seats.length;
  const nom = view.nomination;
  const handOn = nom && (nom.status === 'running' || nom.status === 'paused' || nom.status === 'done') ? (nom.step === 0 ? nom.nomineeId : nom.order[nom.step - 1]) : null;
  const handIndex = handOn ? view.seats.findIndex((s) => s.id === handOn) : -1;
  const awake = view.seats.filter((s) => s.awake).length;
  const today = nominationsToday(view);
  return (
    <button className="mini-grimoire cosy-panel" onClick={() => useUI.setState({ grimoireOpen: true })} title="Open the grimoire (Tab)">
      <span className="mini-title">
        <Icon name="book" /> {hide ? 'Hidden' : view.phase === 'night' ? `Night ${view.day}` : view.day === 0 ? 'Grimoire' : `Day ${view.day}`}
        {awake > 0 && <i className="mini-awake">{awake} awake</i>}
      </span>
      <TeamCounts className="mini-counts" />
      <span className="mini-ring" style={{ width: R * 2 + 44, height: R * 2 + 44 }}>
        {handIndex >= 0 && (
          <span className="mini-hand" style={{ transform: `translate(-50%, -100%) rotate(${(handIndex / Math.max(1, n)) * 360}deg)` }} />
        )}
        {view.seats.map((s, i) => {
          const a = (i / Math.max(1, n)) * Math.PI * 2 - Math.PI / 2;
          const x = Math.cos(a) * R;
          const y = Math.sin(a) * R;
          const voted = nom?.votes.includes(s.id);
          return (
            <span
              key={s.id}
              className={[
                'mini-seat',
                s.dead && 'is-dead',
                s.awake && 'is-awake',
                nom?.nomineeId === s.id && 'is-nominee',
                view.marked?.seatId === s.id && 'is-marked',
                voted && 'has-voted',
                !s.connected && s.claimed && 'is-offline',
                s.slow && 'is-slow',
              ]
                .filter(Boolean)
                .join(' ')}
              style={{ left: `calc(50% + ${x}px)`, top: `calc(50% + ${y}px)` }}
            >
              <Token roleId={hide ? null : heldRole(s)} alignment={s.alignment} dead={s.dead} deadBadge={false} blank={s.claimed ? 'unknown' : 'empty'} label={false} />
              {!hide && disguise(s) && (
                <b className="mini-secret" title={disguise(s)!}>
                  <Token roleId={s.roleId} label={false} />
                </b>
              )}
              <em>{s.label}</em>
              {s.awake && <b className="mini-eye">👁</b>}
              {voted && <b className="mini-paw">✋</b>}
              {s.star && <b className="mini-star" title="Counted the sheep">⭐</b>}
              {(today.by.has(s.id) || today.of.has(s.id)) && (
                <b className="mini-noms">
                  {today.by.has(s.id) && <i className="by" title="Has nominated today" />}
                  {today.of.has(s.id) && <i className="of" title="Has been nominated today" />}
                </b>
              )}
            </span>
          );
        })}
        {n === 0 && <span className="mini-empty">No seats yet</span>}
      </span>
    </button>
  );
}

const PR = 62;

/**
 * The players' own little circle, in the same corner style: who sits where and who has died, nothing more (no
 * characters). Click it for the full "Who sits where".
 */
export function PlayerCircle() {
  const view = useView();
  const n = view.seats.length;
  if (n < 2) return null;
  return (
    <button className="mini-grimoire player-circle cosy-panel" onClick={() => ui.open({ kind: 'seating' })} title="Who sits where round the circle">
      <span className="mini-title">
        <Icon name="book" /> {view.phase === 'night' ? `Night ${view.day}` : view.day === 0 ? 'The circle' : `Day ${view.day}`}
      </span>
      <span className="mini-ring" style={{ width: PR * 2 + 44, height: PR * 2 + 44 }}>
        {view.seats.map((s, i) => {
          const a = (i / n) * Math.PI * 2 - Math.PI / 2;
          return (
            <span
              key={s.id}
              className={['mini-seat', s.dead && 'is-dead', s.isMe && 'is-me'].filter(Boolean).join(' ')}
              style={{ left: `calc(50% + ${Math.cos(a) * PR}px)`, top: `calc(50% + ${Math.sin(a) * PR}px)` }}
            >
              <Token roleId={null} dead={s.dead} deadBadge={false} blank={s.claimed ? 'unknown' : 'empty'} label={false} />
              <em>{s.label}</em>
            </span>
          );
        })}
      </span>
    </button>
  );
}
