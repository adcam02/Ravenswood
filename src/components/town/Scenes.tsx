import { useEffect, useState } from 'react';
import { create } from 'zustand';
import { useProgressTracker, whenHatUnlocked } from '../../game/progress';
import { saveJSON } from '../../lib/util';
import { player } from '../../net/client';
import { AnimalPreview } from '../../world/AnimalPreview';
import { st } from '../../state/host';
import { useView } from '../../state/view';
import { HATS, type HatId, type Weather } from '../../world/types';

const WEATHER: { id: Weather; icon: string; label: string }[] = [
  { id: 'clear', icon: '☀️', label: 'Clear' },
  { id: 'mist', icon: '🌫️', label: 'Mist' },
  { id: 'rain', icon: '🌧️', label: 'Rain' },
];

const mmss = (ms: number) => {
  const s = Math.max(0, Math.ceil(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};

/** Ticks once a second while mounted, for countdowns. */
function useNow(on: boolean) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (!on) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [on]);
  return now;
}

/** The Storyteller's one-press scene changes, the weather, and the day's timer. */
export function SceneBar() {
  const view = useView();
  const [open, setOpen] = useState(false);
  const [minutes, setMinutes] = useState(8);
  const [autoBell, setAutoBell] = useState(true);
  const timer = view.dayTimer;
  const now = useNow(Boolean(timer));
  const started = view.phase === 'night' || view.day > 0;
  return (
    <div className={`scene-bar cosy-panel ${open ? 'open' : ''}`}>
      <div className="scene-row">
        <button className="cosy-btn scene-btn" onClick={() => st.setPhase('night')} disabled={view.phase === 'night'} title="Night falls: everyone is put to bed">
          🌙 <span>To bed</span>
        </button>
        <button className="cosy-btn scene-btn" onClick={() => st.setPhase('day')} disabled={view.phase === 'day' || !started} title="Dawn: everyone wakes in the square">
          🌅 <span>Dawn</span>
        </button>
        {view.townHall ? (
          <button className="cosy-btn scene-btn on" onClick={() => st.endTownHall()} title="End the meeting: everyone gets up off their stools">
            🪵 <span>End meeting</span>
          </button>
        ) : (
          <button className="cosy-btn scene-btn" onClick={() => st.callTownHall()} disabled={view.phase !== 'day'} title="Ring the bell: everyone to their stool">
            🔔 <span>Meeting</span>
          </button>
        )}
        <button className={`cosy-btn scene-btn more ${open ? 'on' : ''}`} onClick={() => setOpen((o) => !o)} title="Weather and the day timer">
          {timer ? `⏳ ${mmss(timer.end - now)}` : '⛅'}
        </button>
      </div>
      {open && (
        <div className="scene-more">
          <div className="scene-label">Weather</div>
          <div className="scene-row">
            {WEATHER.map((w) => (
              <button key={w.id} className={`cosy-btn scene-chip ${view.weather === w.id ? 'on' : ''}`} onClick={() => st.setWeather(w.id)}>
                {w.icon} {w.label}
              </button>
            ))}
          </div>
          <div className="scene-label">Day timer</div>
          {timer ? (
            <div className="scene-row">
              <strong className="scene-time">{now >= timer.end ? 'Time’s up' : mmss(timer.end - now)}</strong>
              <button className="cosy-btn scene-chip" onClick={() => st.nudgeDayTimer(-1)}>
                −1 min
              </button>
              <button className="cosy-btn scene-chip" onClick={() => st.nudgeDayTimer(1)}>
                +1 min
              </button>
              <button className="cosy-btn scene-chip" onClick={() => st.setDayTimer(null)}>
                Stop
              </button>
            </div>
          ) : (
            <div className="scene-row">
              {[5, 8, 12, 15].map((m) => (
                <button key={m} className={`cosy-btn scene-chip ${minutes === m ? 'on' : ''}`} onClick={() => setMinutes(m)}>
                  {m} min
                </button>
              ))}
              <label className="scene-check">
                <input type="checkbox" checked={autoBell} onChange={(e) => setAutoBell(e.target.checked)} /> Ring the bell at the end
              </label>
              <button className="cosy-btn primary scene-chip" disabled={view.phase !== 'day'} onClick={() => st.setDayTimer(minutes, autoBell)}>
                Start
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/** Everyone sees the day's timer as the sun crossing a little arc, with the time left. */
export function DayClock() {
  const view = useView();
  const timer = view.dayTimer;
  const now = useNow(Boolean(timer));
  if (!timer || view.phase !== 'day' || view.townHall) return null;
  const p = Math.min(1, Math.max(0, (now - timer.start) / Math.max(1, timer.end - timer.start)));
  const a = Math.PI * (1 - p);
  const sx = 40 + Math.cos(a) * 30;
  const sy = 36 - Math.sin(a) * 26;
  const late = p > 0.8;
  return (
    <div className={`day-clock cosy-panel ${late ? 'late' : ''}`} title={timer.autoBell ? 'The bell rings when the sun sets' : 'Time left today'}>
      <svg width="80" height="42" viewBox="0 0 80 42" aria-hidden="true">
        <path d="M10 36 A30 26 0 0 1 70 36" fill="none" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" strokeLinecap="round" />
        <line x1="4" y1="37" x2="76" y2="37" stroke="currentColor" strokeOpacity="0.35" strokeWidth="2" />
        <circle cx={sx} cy={sy} r="6.5" fill={late ? '#ff8a3d' : '#f6c445'} />
      </svg>
      <span>{now >= timer.end ? 'Time’s up' : mmss(timer.end - now)}</span>
    </div>
  );
}

/** Hats just unlocked, waiting their turn on screen (a town record and a perfect job can land together). */
const useNewHat = create<{ hats: HatId[] }>(() => ({ hats: [] }));

/** Players: remembers stars, records, nights and ghostly walks, and makes a moment of each new hat. */
export function ProgressWatcher() {
  const view = useView();
  useProgressTracker(view);
  useEffect(() => {
    whenHatUnlocked((hat) => useNewHat.setState((s) => ({ hats: s.hats.includes(hat) ? s.hats : [...s.hats, hat] })));
    return () => whenHatUnlocked(() => {});
  }, []);
  return <NewHat />;
}

/** "New hat!": their own animal turning round in it, what it was for, and a button to put it on there and then. */
function NewHat() {
  const id = useNewHat((s) => s.hats[0]);
  const view = useView();
  const me = view.seats.find((s) => s.isMe);
  const hat = HATS.find((h) => h.id === id);
  if (!hat || !me?.look) return null;
  const close = () => useNewHat.setState((s) => ({ hats: s.hats.slice(1) }));
  const wear = () => {
    const look = { ...me.look!, hat: hat.id };
    // (Remembered for next time too, like choosing it on the way in.)
    saveJSON('ravenswood:look', look);
    player.join(me.name, look);
    close();
  };
  return (
    <div key={hat.id} className="new-hat cosy-panel" role="dialog" aria-label="New hat unlocked">
      <div className="new-hat-sparkles" aria-hidden="true">
        {Array.from({ length: 12 }, (_, i) => (
          <i key={i} style={{ '--a': `${i * 30}deg`, '--d': `${(i % 4) * 0.15}s` } as React.CSSProperties} />
        ))}
      </div>
      <span className="new-hat-eyebrow">New hat unlocked!</span>
      <AnimalPreview look={{ ...me.look, hat: hat.id }} size={190} spin anim="wave" />
      <strong>
        {hat.icon} {hat.name}
      </strong>
      <span className="new-hat-how">{hat.how}</span>
      <div className="new-hat-actions">
        <button className="cosy-btn" onClick={close}>
          Later
        </button>
        <button className="cosy-btn primary" onClick={wear} autoFocus>
          Wear it now
        </button>
      </div>
    </div>
  );
}
