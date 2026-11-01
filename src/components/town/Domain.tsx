import { useEffect, useState } from 'react';
import { game, useHud } from '../../game/hud';
import { local } from '../../game/local';
import { useView } from '../../state/view';
import { DOMAIN_HAT, zoneKind } from '../../world/types';

/**
 * The Domain Expansioner's button, for whoever is wearing it: open a Domain where you stand (X), out in town by day,
 * or close yours, with the time it has left (see game/domain.ts). The Storyteller's browser says whether it may open.
 */
export function DomainButton() {
  const v = useView();
  const job = useHud((s) => s.job);
  // (Ticks over each second, for the time left and for where we are.)
  const [, setNow] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const me = v.seats.find((s) => s.isMe);
  const mine = v.domains.find((d) => d.owner === v.mySeatId);
  if (v.mode !== 'player' || job || (!mine && (me?.look?.hat !== DOMAIN_HAT || v.phase !== 'day' || zoneKind(local.zone) !== 'town'))) return null;
  const left = mine ? Math.max(0, Math.ceil((mine.until - Date.now()) / 1000)) : 0;
  return (
    <button className={`domain-btn cosy-panel ${mine ? 'open' : ''}`} onClick={() => game.domain()} title={mine ? 'Close your Domain (X)' : 'Open a Domain here: a private booth for you and one other, once a day (X)'}>
      <span className="domain-icon">🌌</span>
      <span className="domain-words">
        <b>{mine ? 'Close Domain' : 'Domain Expansion'}</b>
        <small>{mine ? `${mine.guest ? 'Someone’s in with you' : 'Waiting for a guest'} · ${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}` : 'Once a day, by day'}</small>
      </span>
      <span className="cosy-key">X</span>
    </button>
  );
}
