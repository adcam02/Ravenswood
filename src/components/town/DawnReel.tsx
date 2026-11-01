import { useEffect } from 'react';
import { useHud } from '../../game/hud';
import { st } from '../../state/host';
import { useView } from '../../state/view';

/**
 * Dawn: while the night's deaths are shown to everyone (see the engine's dawn reel), the picture is letterboxed with
 * a caption saying whose flat this is. The Storyteller can skip the rest for everyone.
 */
export function DawnReel() {
  const reel = useHud((s) => s.dawnReel);
  const view = useView();
  // (The map and the prompt for what's underfoot step out of the picture meanwhile.)
  const on = Boolean(reel);
  useEffect(() => {
    document.body.classList.toggle('dawn-on', on);
    return () => document.body.classList.remove('dawn-on');
  }, [on]);
  if (!reel) return null;
  return (
    <div className="dawn-reel" role="status" aria-live="polite">
      <div className="dawn-bar top" aria-hidden="true" />
      <div className="dawn-bar bottom">
        <p key={reel.key} className="dawn-line">
          {reel.line}
          {reel.of > 1 && (
            <span className="dawn-count">
              {reel.n} of {reel.of}
            </span>
          )}
        </p>
        {view.mode === 'st' && (
          <button className="cosy-btn dawn-skip" onClick={() => st.skipDawn()} title="Everyone goes straight on to the day">
            Skip ⏭
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * A Slayer claim playing out in the square (see the engine's Slayer show): letterboxed like the dawn reel, with what's
 * happening along the bottom, and then how it went.
 */
export function SlayReel() {
  const reel = useHud((s) => s.slayReel);
  const on = Boolean(reel);
  useEffect(() => {
    document.body.classList.toggle('dawn-on', on);
    return () => document.body.classList.remove('dawn-on');
  }, [on]);
  if (!reel) return null;
  return (
    <div className="dawn-reel slay-reel" role="status" aria-live="polite">
      <div className="dawn-bar top" aria-hidden="true" />
      <div className="dawn-bar bottom">
        <p className="dawn-line">
          {reel.line}
          {reel.then && (
            <span key={reel.then} className="slay-then">
              {reel.then}
            </span>
          )}
        </p>
      </div>
    </div>
  );
}

/**
 * A nomination's little show at the meeting (see the engine's nomination show): thin bars and who nominated whom,
 * with a button to skip it (just for you).
 */
export function NomReel() {
  const reel = useHud((s) => s.nomReel);
  const on = Boolean(reel);
  // (The meeting's own panels step out of the picture too, for the few seconds it lasts.)
  useEffect(() => {
    document.body.classList.toggle('dawn-on', on);
    document.body.classList.toggle('nom-on', on);
    return () => document.body.classList.remove('dawn-on', 'nom-on');
  }, [on]);
  useEffect(() => {
    if (!on) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && useHud.setState({ nomReel: null });
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [on]);
  if (!reel) return null;
  return (
    <div className="dawn-reel slay-reel nom-reel" role="status" aria-live="polite">
      <div className="dawn-bar top" aria-hidden="true" />
      <div className="dawn-bar bottom">
        <p key={reel.key} className="dawn-line">
          {reel.line}
        </p>
        <button className="cosy-btn dawn-skip" onClick={() => useHud.setState({ nomReel: null })} title="Skip the rest (just for you)">
          Skip ⏭
        </button>
      </div>
    </div>
  );
}
