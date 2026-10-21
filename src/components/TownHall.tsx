import { useEffect, useRef, useState } from 'react';
import { st } from '../state/host';
import { ui } from '../state/ui';
import { useView } from '../state/view';
import { Icon } from './Icon';

export function BellArt({ className = '' }: { className?: string }) {
  return (
    <svg className={`bell-art ${className}`} viewBox="0 0 100 110" aria-hidden="true">
      <defs>
        <linearGradient id="bell-metal" x1="0" x2="1">
          <stop offset="0" stopColor="#7c5f2e" />
          <stop offset="0.35" stopColor="#f0d48f" />
          <stop offset="0.6" stopColor="#cfa75b" />
          <stop offset="1" stopColor="#6d5226" />
        </linearGradient>
      </defs>
      <g className="bell-swing">
        <path d="M44 14 a6 6 0 1 1 12 0" fill="none" stroke="#cfa75b" strokeWidth="4" />
        <g className="bell-clapper">
          <line x1="50" y1="60" x2="50" y2="84" stroke="#4a3420" strokeWidth="3" />
          <circle cx="50" cy="86" r="6.5" fill="#cfa75b" stroke="#4a3420" strokeWidth="2" />
        </g>
        <path
          d="M50 16 C36 16 30 28 30 44 L28 64 C26 71 20 73 16 78 C14 81 16 83 20 83 L80 83 C84 83 86 81 84 78 C80 73 74 71 72 64 L70 44 C70 28 64 16 50 16 Z"
          fill="url(#bell-metal)"
          stroke="#4a3420"
          strokeWidth="2"
        />
        <path d="M24 76 L76 76" stroke="#4a3420" strokeOpacity="0.5" strokeWidth="1.5" />
        <path d="M40 26 C36 34 35 46 34 60" stroke="#fff6dc" strokeOpacity="0.55" strokeWidth="3" strokeLinecap="round" fill="none" />
      </g>
    </svg>
  );
}

/** The Storyteller's button, which shows who has come back. */
export function HallButton() {
  const view = useView();
  const call = view.townHall;
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  const players = view.seats.filter((s) => s.claimed);
  const back = call ? players.filter((s) => call.back.includes(s.id)) : [];
  const waiting = call ? players.filter((s) => !call.back.includes(s.id)) : [];
  const gathered = Boolean(call?.gathered);
  const allBack = Boolean(call && players.length && !waiting.length);

  // Everyone on their stool: the bell stops, the meeting carries on until it's ended.
  useEffect(() => {
    if (!gathered || !allBack) return;
    ui.toast('Everyone is sat at the square. The meeting is on.', 'good');
    setOpen(false);
  }, [gathered, allBack]);

  useEffect(() => {
    if (!open) return;
    const close = (e: PointerEvent) => !wrap.current?.contains(e.target as Node) && setOpen(false);
    window.addEventListener('pointerdown', close);
    return () => window.removeEventListener('pointerdown', close);
  }, [open]);

  return (
    <div className="hall-wrap" ref={wrap}>
      <button
        className={`tool ${call ? 'on calling' : ''}`}
        title={call ? (gathered ? 'The town meeting is on' : 'The bell is ringing') : 'Ring the bell: everyone to the town square'}
        onClick={() => {
          if (!call) {
            st.callTownHall();
            setOpen(true);
          } else setOpen(!open);
        }}
      >
        <Icon name="bell" />
        <span>{call ? (gathered ? 'Meeting' : 'Ringing…') : 'Ring bell'}</span>
        {call && !gathered && (
          <i className="tool-badge">
            {back.length}/{players.length}
          </i>
        )}
      </button>
      {open && call && (
        <div className="hall-pop surface">
          <strong>{gathered ? 'The town meeting is on' : 'Everyone to the square'}</strong>
          <span>
            {back.length} of {players.length} {gathered ? 'came to the square' : 'have arrived'}
          </span>
          {!gathered && waiting.length > 0 && (
            <p>
              Waiting on <b>{waiting.map((s) => s.label).join(', ')}</b>
            </p>
          )}
          <div className="hall-actions">
            <button className="btn small" onClick={st.callTownHall} title={gathered ? 'Everyone back to their stools' : 'Ring for anyone not here yet'}>
              <Icon name="bell" /> Ring again
            </button>
            {!gathered && (
              <button className="btn small quiet" onClick={st.stopBell} title="Stop the bell and start with whoever is here">
                Stop the bell
              </button>
            )}
            <button
              className="btn small quiet"
              onClick={() => {
                st.endTownHall();
                setOpen(false);
              }}
              title="Everyone gets up off their stools"
            >
              End meeting
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
