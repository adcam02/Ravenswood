import { useUI } from '../../state/ui';
import { useView } from '../../state/view';
import { Icon } from '../Icon';
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
  return (
    <button className="mini-grimoire cosy-panel" onClick={() => useUI.setState({ grimoireOpen: true })} title="Open the grimoire (Tab)">
      <span className="mini-title">
        <Icon name="book" /> {hide ? 'Hidden' : view.phase === 'night' ? `Night ${view.day}` : view.day === 0 ? 'Grimoire' : `Day ${view.day}`}
        {awake > 0 && <i className="mini-awake">{awake} awake</i>}
      </span>
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
              ]
                .filter(Boolean)
                .join(' ')}
              style={{ left: `calc(50% + ${x}px)`, top: `calc(50% + ${y}px)` }}
            >
              <Token roleId={hide ? null : s.roleId} alignment={s.alignment} dead={s.dead} deadBadge={false} blank={s.claimed ? 'unknown' : 'empty'} label={false} />
              <em>{s.label}</em>
              {s.awake && <b className="mini-eye">👁</b>}
              {voted && <b className="mini-paw">✋</b>}
            </span>
          );
        })}
        {n === 0 && <span className="mini-empty">No seats yet</span>}
      </span>
    </button>
  );
}
