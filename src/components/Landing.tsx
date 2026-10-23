import { useState } from 'react';
import { go } from '../App';
import { loadJSON } from '../lib/util';
import { st } from '../state/host';
import type { GameState } from '../state/types';
import { World } from '../world/World';
import { WorldFailed } from './town/Hud';

const BASE = import.meta.env.BASE_URL;

export function Landing() {
  const saved = loadJSON<GameState | null>('ravenswood:storyteller', null);
  const [code, setCode] = useState('');
  const clean = code.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 5);
  const named = saved?.seats.filter((s) => s.name).length ?? 0;
  const host = () => {
    st.newRoom();
    go({ kind: 'st' });
  };

  return (
    <div className="app landing cosy">
      <World mode="preview" />
      <main className="landing-main">
        <header className="landing-head">
          <h1 className="landing-title">Ravenswood</h1>
          <p className="landing-sub">A cosy little town with a Demon in it. Blood on the Clocktower, played as animals, with proximity chat.</p>
        </header>

        <div className="landing-cards">
          <section className="landing-card cosy-panel">
            <span className="landing-emoji">👻</span>
            <h2>Storyteller</h2>
            <p>Host the game. You float around town as a ghost, run the grimoire and wake players at night.</p>
            {saved ? (
              <div className="landing-actions">
                <button className="cosy-btn primary big" onClick={() => go({ kind: 'st' })}>
                  Return to room {saved.room}
                </button>
                <span className="landing-note">
                  {saved.script.name || 'Custom script'} · {named ? `${named} players` : 'no players yet'} · {saved.phase === 'night' ? 'Night' : 'Day'} {saved.day}
                </span>
                <button className="cosy-btn small" onClick={host}>
                  Start a fresh room instead
                </button>
              </div>
            ) : (
              <div className="landing-actions">
                <button className="cosy-btn primary big" onClick={host}>
                  Host a game
                </button>
              </div>
            )}
          </section>

          <section className="landing-card cosy-panel">
            <span className="landing-emoji">🐾</span>
            <h2>Player</h2>
            <p>Your Storyteller’s link brings you straight in. If you only have the room code, type it here.</p>
            <form
              className="landing-actions join-code"
              onSubmit={(e) => {
                e.preventDefault();
                if (clean.length === 5) go({ kind: 'player', room: clean });
              }}
            >
              <input
                className="cosy-input code-input"
                value={clean}
                onChange={(e) => setCode(e.target.value)}
                placeholder="ROOM"
                aria-label="Room code"
                autoCapitalize="characters"
                spellCheck={false}
              />
              <button className="cosy-btn primary big" disabled={clean.length !== 5}>
                Join
              </button>
            </form>
          </section>
        </div>

        <footer className="landing-foot">
          <img src={`${BASE}assets/ccc.png`} alt="Community Created Content" />
          <p>
            An unofficial, non-commercial game for playing with friends. Blood on the Clocktower and its character art belong to The Pandemonium
            Institute.
          </p>
        </footer>
      </main>
      <WorldFailed />
    </div>
  );
}
