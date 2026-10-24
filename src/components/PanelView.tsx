import { getRole } from '../data';
import type { Ask, GrimoireSnapshot, WakePanel, WakeReply } from '../state/types';
import { useView } from '../state/view';
import { Icon } from './Icon';
import { cardTitle, InfoCard, SignGlyph, signLabel } from './InfoCard';
import { RichText } from './RichText';
import { Token } from './Token';
import { shownName } from '../state/nicks';

export interface PanelEdit {
  active: number;
  select: (i: number) => void;
  removePanel: (i: number) => void;
  removeCard: (i: number) => void;
  removeRole: (i: number, id: string) => void;
  removeSeat: (i: number, id: string) => void;
  removeSign: (i: number, s: string) => void;
  clearText: (i: number) => void;
  removeGrimoire: (i: number) => void;
}

/** A snapshot of the grimoire laid out as a circle, the way the Spy sees it. */
export function GrimoireSnapshotView({ snap, seatFor }: { snap: GrimoireSnapshot; seatFor?: string | null }) {
  const n = snap.seats.length;
  const R = 92;
  return (
    <div className="snap">
      <div className="snap-ring" style={{ width: R * 2 + 70, height: R * 2 + 70 }}>
        {snap.seats.map((s, i) => {
          const a = (i / Math.max(1, n)) * Math.PI * 2 - Math.PI / 2;
          return (
            <div key={s.id} className={`snap-seat ${s.dead ? 'is-dead' : ''} ${s.id === seatFor ? 'is-me' : ''}`} style={{ left: `calc(50% + ${Math.cos(a) * R}px)`, top: `calc(50% + ${Math.sin(a) * R}px)` }}>
              <Token roleId={s.roleId} dead={s.dead} blank="unknown" label={false} />
              <em>{shownName(s.name, '')}</em>
              <b>{getRole(s.roleId)?.name ?? '—'}</b>
              {s.reminders.length > 0 && <small>{s.reminders.join(' · ')}</small>}
            </div>
          );
        })}
        <div className="snap-centre">
          <span className="eyebrow">The grimoire</span>
          {snap.bluffs.length > 0 && (
            <div className="snap-bluffs">
              <span>Demon bluffs</span>
              <div>
                {snap.bluffs.map((id) => (
                  <Token key={id} roleId={id} label={false} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Everyone round the circle in the grimoire's order, the first seat at the top and going clockwise, names only (no
 * characters or reminders): shown with a clockwise or anticlockwise sign, so the Shugenja knows which way round the
 * Storyteller means. The same chart hangs on the bedroom wall.
 */
export function SeatingCircle({ seatFor, dir }: { seatFor?: string | null; dir: 'clockwise' | 'anticlockwise' }) {
  const view = useView();
  const seats = [...view.seats].sort((a, b) => a.index - b.index);
  const n = seats.length;
  const R = 100;
  return (
    <div className="seating" aria-label="Who sits where, as the Storyteller sees it">
      <div className="seating-ring" style={{ width: R * 2 + 110, height: R * 2 + 56 }}>
        {seats.map((s, i) => {
          const a = (i / Math.max(1, n)) * Math.PI * 2 - Math.PI / 2;
          return (
            <span
              key={s.id}
              className={`seating-seat ${s.dead ? 'is-dead' : ''} ${s.id === seatFor ? 'is-me' : ''}`}
              style={{ left: `calc(50% + ${Math.cos(a) * R}px)`, top: `calc(50% + ${Math.sin(a) * R}px)` }}
            >
              {s.label}
              {s.id === seatFor && <small>you</small>}
            </span>
          );
        })}
        <svg className={`seating-arrow ${dir}`} viewBox="0 0 100 100" aria-hidden="true">
          <defs>
            <marker id="seating-head" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="5" markerHeight="5" orient="auto">
              <path d="M0 0 L10 5 L0 10 z" />
            </marker>
          </defs>
          <path d="M 50 16 A 34 34 0 1 1 20.6 67" markerEnd="url(#seating-head)" />
        </svg>
      </div>
      <span className="seating-note">As the Storyteller sees it</span>
    </div>
  );
}

function X({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      className="panel-x"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      aria-label={label}
      title={label}
    >
      <Icon name="x" />
    </button>
  );
}

export function askText(ask: Ask): string {
  if (!ask) return '';
  if (ask.prompt) return ask.prompt;
  if (ask.kind === 'yesno') return 'Answer yes or no';
  if (ask.kind === 'players') return ask.count === 1 ? 'Choose a player' : `Choose ${ask.count} players`;
  return ask.count === 1 ? 'Choose a character' : `Choose ${ask.count} characters`;
}

export function PanelView({
  message,
  compact,
  reply,
  edit,
  seatFor,
}: {
  message: { panels: WakePanel[]; ask: Ask };
  compact?: boolean;
  reply?: WakeReply;
  edit?: PanelEdit;
  /** The seat this is being shown to, so their own name reads as “you”. */
  seatFor?: string | null;
}) {
  const view = useView();
  const name = (id: string) => {
    const s = view.seats.find((x) => x.id === id);
    if (!s) return 'Someone';
    return id === seatFor ? `${s.label} (you)` : s.label;
  };

  if (compact) {
    return (
      <div className="panels compact">
        {message.panels.map((p, i) => (
          <div key={i} className="panel-line">
            {p.card && <span className="panel-card-name">{cardTitle(p.card)}</span>}
            {p.roleIds.map((id) => (
              <span key={id} className="chip role">
                <Token roleId={id} label={false} /> {getRole(id)?.name}
              </span>
            ))}
            {p.seatIds.map((id) => (
              <span key={id} className="chip seat">
                {name(id)}
              </span>
            ))}
            {p.signs.map((s) => (
              <span key={s} className={`chip sign sign-${s}`}>
                <span className="chip-glyph">
                  <SignGlyph sign={s} />
                </span>
                {signLabel(s)}
              </span>
            ))}
            {p.text && <span className="panel-text-inline">“{p.text}”</span>}
            {p.grimoire && <span className="chip">📖 Grimoire snapshot</span>}
          </div>
        ))}
        {reply && <ReplyLine reply={reply} name={name} />}
      </div>
    );
  }

  return (
    <div className={`panels ${message.panels.length > 1 ? 'multi' : ''}`}>
      {message.panels.map((p, i) => {
        const empty = !p.card && !p.roleIds.length && !p.seatIds.length && !p.signs.length && !p.text && !p.grimoire;
        const single = p.roleIds.length === 1 && !p.seatIds.length;
        return (
          <section
            key={i}
            className={`panel ${edit?.active === i ? 'active' : ''} ${p.card ? 'has-card' : ''} ${empty ? 'empty' : ''}`}
            onClick={edit ? () => edit.select(i) : undefined}
          >
            {edit && message.panels.length > 1 && <X onClick={() => edit.removePanel(i)} label="Remove this card" />}
            {p.card && (
              <div className="panel-card">
                <InfoCard id={p.card} size={edit ? 'md' : 'lg'} />
                {edit && <X onClick={() => edit.removeCard(i)} label="Remove card" />}
              </div>
            )}
            <div className="panel-content">
              {empty && edit && <p className="panel-hint">Pick a card, a signal, players or characters on the left.</p>}
              {p.roleIds.length > 0 && (
                <div className={`panel-roles n${Math.min(p.roleIds.length, 4)}`}>
                  {p.roleIds.map((id) => {
                    const r = getRole(id);
                    return (
                      <div key={id} className="panel-role">
                        <Token roleId={id} />
                        {single && r && !edit && (
                          <p>
                            <RichText text={r.ability} />
                          </p>
                        )}
                        {edit && <X onClick={() => edit.removeRole(i, id)} label={`Remove ${r?.name}`} />}
                      </div>
                    );
                  })}
                </div>
              )}
              {p.seatIds.length > 0 && (
                <div className="panel-seats">
                  {p.seatIds.map((id) => (
                    <span key={id} className={`panel-seat ${id === seatFor ? 'me' : ''}`}>
                      <Icon name="pin" />
                      {name(id)}
                      {edit && <X onClick={() => edit.removeSeat(i, id)} label="Remove player" />}
                    </span>
                  ))}
                </div>
              )}
              {p.signs.length > 0 && (
                <div className="panel-signs">
                  {p.signs.map((s) => (
                    <span key={s} className={`panel-sign sign-${s}`}>
                      <span className="panel-sign-glyph">
                        <SignGlyph sign={s} />
                      </span>
                      <span>{signLabel(s)}</span>
                      {edit && <X onClick={() => edit.removeSign(i, s)} label="Remove signal" />}
                    </span>
                  ))}
                </div>
              )}
              {p.signs.some((s) => s === 'clockwise' || s === 'anticlockwise') && (
                <SeatingCircle seatFor={seatFor} dir={p.signs.includes('anticlockwise') ? 'anticlockwise' : 'clockwise'} />
              )}
              {p.text && (
                <p className="panel-text">
                  {p.text}
                  {edit && <X onClick={() => edit.clearText(i)} label="Remove text" />}
                </p>
              )}
              {p.grimoire && (
                <div className="panel-grimoire">
                  <GrimoireSnapshotView snap={p.grimoire} seatFor={seatFor} />
                  {edit && <X onClick={() => edit.removeGrimoire(i)} label="Remove the grimoire" />}
                </div>
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}

export function ReplyLine({ reply, name }: { reply: WakeReply; name: (id: string) => string }) {
  const parts: string[] = [];
  if (reply.seatIds?.length) parts.push(reply.seatIds.map(name).join(', '));
  if (reply.roleIds?.length) parts.push(reply.roleIds.map((id) => getRole(id)?.name ?? id).join(', '));
  if (reply.answer !== undefined) parts.push(reply.answer ? 'Yes' : 'No');
  return (
    <div className="reply-line">
      <Icon name="feather" /> Answered: <b>{parts.join(' · ') || 'nothing'}</b>
    </div>
  );
}
