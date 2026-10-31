import { useContext, useEffect, useState } from 'react';
import { HIDE, PROPS, hidersLeft } from '../../game/hideRules';
import { hideSeek } from '../../game/hideSeek';
import { money } from '../../game/profiles';
import { player } from '../../net/client';
import type { HideRound } from '../../state/types';
import { ModeContext, useView } from '../../state/view';
import { hideLocal } from '../../world/hideSeek';

/**
 * Town-wide hide and seek on screen: the button to start a round (between games of Clocktower), the call to join
 * (everyone's in unless they sit it out), the seekers' blindfold while the rest hide, the clock, how many are still
 * hidden and who found whom, the buttons (tag, taunt, become a prop), and the result.
 */

/** Re-renders every so often while `on`. */
function useTicking(on: boolean, ms = 250) {
  const [, set] = useState(0);
  useEffect(() => {
    if (!on) return;
    const t = setInterval(() => set((n) => n + 1), ms);
    return () => clearInterval(t);
  }, [on, ms]);
}

const secsLeft = (r: HideRound) => Math.max(0, Math.ceil((r.until - Date.now()) / 1000));
const clock = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
const typing = () => document.activeElement instanceof HTMLInputElement || document.activeElement instanceof HTMLTextAreaElement;

export function HideSeekLayer() {
  const view = useView();
  const mode = useContext(ModeContext);
  const r = view.hide;
  useTicking(Boolean(r));
  const st = mode === 'st';
  const name = (seat: string | null | undefined) => view.seats.find((s) => s.id === seat)?.label ?? 'Someone';
  const mine = r?.players.find((p) => p.seat === view.mySeatId);
  const locked = !view.ended && (view.revealed || view.day > 0 || view.phase === 'night');
  const canStart = !locked || view.hideAllowed;

  // A seeker's tag (F) and a hider's taunt (Q), from the keyboard too.
  const [canTag, setCanTag] = useState(false);
  const [tauntAt, setTauntAt] = useState(0);
  useEffect(() => {
    if (r?.stage !== 'seeking' || mine?.role !== 'seeker') return setCanTag(false);
    const t = setInterval(() => setCanTag(hideLocal.canTag), 120);
    return () => clearInterval(t);
  }, [r?.stage, mine?.role]);
  const tag = () => player.hide({ k: 'tag' });
  const taunt = () => {
    if (Date.now() - tauntAt < HIDE.tauntGapMs) return;
    setTauntAt(Date.now());
    player.hide({ k: 'taunt' });
  };
  useEffect(() => {
    if (r?.stage !== 'seeking' || !mine) return;
    const on = (e: KeyboardEvent) => {
      if (e.repeat || typing() || e.ctrlKey || e.metaKey || e.altKey) return;
      const k = e.key.toLowerCase();
      if (k === 'f' && mine.role === 'seeker') tag();
      if (k === 'q' && mine.role === 'hider') taunt();
    };
    window.addEventListener('keydown', on);
    return () => window.removeEventListener('keydown', on);
  });
  const [propsOpen, setPropsOpen] = useState(false);

  if (!r) {
    if (!st && !canStart) return null;
    return (
      <div className="hs-start">
        {canStart && (
          <button className="cosy-btn small hs-start-btn" onClick={() => (st ? hideSeek.start() : player.hide({ k: 'start' }))} title="Start a round of hide and seek for everyone in town">
            🙈 Hide &amp; seek
          </button>
        )}
        {st && locked && (
          <label className="hs-allow cosy-panel">
            <input type="checkbox" checked={view.hideAllowed} onChange={(e) => hideSeek.allow(e.target.checked)} /> Allow during the game
          </label>
        )}
      </div>
    );
  }

  const left = secsLeft(r);
  const res = r.result;

  if (r.stage === 'gather') {
    return (
      <div className="hs-top">
        <div className="hs-card cosy-panel hs-gather">
          <div className="hs-title">🙈 Hide and seek in {left}s!</div>
          <div className="hs-sub">
            Started by {r.by}. Everyone in town is in: one of you seeks{` (two from ${HIDE.twoSeekersFrom} players)`}, the rest hide anywhere, buildings too.
          </div>
          {!st && (
            <div className="hs-row">
              {view.hideOut ? (
                <>
                  <span className="hs-note">You’re sitting this one out.</span>
                  <button className="cosy-btn small primary" onClick={() => player.hide({ k: 'out', out: false })}>
                    Count me in
                  </button>
                </>
              ) : (
                <>
                  <span className="hs-note">You’re in!</span>
                  <button className="cosy-btn small" onClick={() => player.hide({ k: 'out', out: true })}>
                    Sit this one out
                  </button>
                </>
              )}
            </div>
          )}
          {st && (
            <div className="hs-row">
              <button className="cosy-btn small" onClick={() => hideSeek.stop()}>
                Call it off
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (r.stage === 'over') {
    if (!res) return null;
    const few = res.why === 'few';
    const off = res.why === 'off';
    const won = view.mySeatId ? (res.prizes[view.mySeatId] ?? 0) : 0;
    return (
      <div className="hs-end-wrap">
        <div className="hs-end cosy-panel">
          <div className="hs-end-title">{few ? 'Not enough players' : off ? 'Hide and seek called off' : res.why === 'time' ? 'Time’s up: the hiders win!' : 'Everyone found!'}</div>
          {few && <div className="hs-sub">Hide and seek needs at least two (one to seek, one to hide).</div>}
          {!few && !off && (
            <div className="hs-awards">
              {res.survivors.length > 0 && (
                <div className="hs-award">
                  <span className="hs-award-icon">🏆</span>
                  <div>
                    <small>Never found</small>
                    <b>{res.survivors.map(name).join(', ')}</b>
                  </div>
                </div>
              )}
              {res.last && (
                <div className="hs-award">
                  <span className="hs-award-icon">🫣</span>
                  <div>
                    <small>Last survivor</small>
                    <b>{name(res.last)}</b>
                  </div>
                </div>
              )}
              {res.best && (
                <div className="hs-award">
                  <span className="hs-award-icon">🔎</span>
                  <div>
                    <small>Best seeker</small>
                    <b>
                      {name(res.best)} <span className="hs-dim">found {res.bestFinds}</span>
                    </b>
                  </div>
                </div>
              )}
              {!res.survivors.length && !res.last && !res.best && <div className="hs-sub">Nobody found anybody.</div>}
            </div>
          )}
          {won > 0 && <div className="hs-prize">+{money(won)} for you</div>}
        </div>
      </div>
    );
  }

  // Hiding or seeking.
  const blind = r.stage === 'hiding' && mine?.role === 'seeker' && mine.first;
  const n = hidersLeft(r);
  const lastMinute = r.stage === 'seeking' && left <= HIDE.forcedFromMs / 1000;
  const tauntWait = Math.max(0, Math.ceil((HIDE.tauntGapMs - (Date.now() - tauntAt)) / 1000));
  return (
    <>
      {blind && (
        <div className="hs-blind">
          <div className="hs-blind-eyes">🙈</div>
          <div className="hs-blind-count">{left}</div>
          <div className="hs-blind-text">Eyes shut and count! The others are hiding…</div>
        </div>
      )}
      <div className="hs-top">
        <div className={`hs-card cosy-panel ${lastMinute ? 'hs-hurry' : ''}`}>
          <div className="hs-head">
            <span className="hs-stage">{r.stage === 'hiding' ? '🙈 Hiding' : '🔎 Seeking'}</span>
            <span className="hs-time">{clock(left)}</span>
            <span className="hs-left">
              <b>{n}</b> {n === 1 ? 'hider' : 'hiders'} left
            </span>
          </div>
          {mine && (
            <div className={`hs-you ${mine.role}`}>
              {mine.role === 'seeker'
                ? r.stage === 'hiding'
                  ? 'You’re seeking: wait for the count…'
                  : mine.first
                    ? 'You’re seeking! Get close and tag them.'
                    : 'Found! Now you seek too.'
                : mine.prop
                  ? `You’re a ${mine.prop.kind}. Stay still…`
                  : r.stage === 'hiding'
                    ? 'Hide! Anywhere in town, buildings too (not your own flat).'
                    : lastMinute
                      ? 'Last minute: you squeak every so often!'
                      : 'Stay hidden! Taunt them if you dare.'}
            </div>
          )}
          {r.feed.length > 0 && (
            <ul className="hs-feed">
              {r.feed
                .slice(-3)
                .reverse()
                .map((f) => (
                  <li key={`${f.who}${f.at}`}>{f.by ? `🔎 ${name(f.by)} found ${name(f.who)}` : `🏠 ${name(f.who)} went home: out!`}</li>
                ))}
            </ul>
          )}
          {st && (
            <button className="cosy-btn small hs-stop" onClick={() => hideSeek.stop()}>
              Call it off
            </button>
          )}
        </div>
      </div>
      {mine && !blind && (
        <div className="hs-actions">
          {mine.role === 'seeker' && r.stage === 'seeking' && (
            <button className={`cosy-btn hs-btn hs-tag ${canTag ? 'ready' : ''}`} onClick={tag}>
              ✋ Tag <span className="cosy-key">F</span>
            </button>
          )}
          {mine.role === 'hider' && r.stage === 'seeking' && (
            <button className="cosy-btn hs-btn hs-taunt" onClick={taunt} disabled={tauntWait > 0}>
              🦆 Taunt {tauntWait > 0 ? <span className="hs-dim">{tauntWait}s</span> : <span className="cosy-key">Q</span>}
            </button>
          )}
          {mine.role === 'hider' && !mine.prop && (
            <div className="hs-props">
              {propsOpen ? (
                PROPS.map((p) => (
                  <button
                    key={p.kind}
                    className="cosy-btn hs-btn"
                    onClick={() => {
                      setPropsOpen(false);
                      player.hide({ k: 'prop', kind: p.kind });
                    }}
                  >
                    {p.icon} {p.label}
                  </button>
                ))
              ) : (
                <button className="cosy-btn hs-btn" onClick={() => setPropsOpen(true)} title="Turn into a barrel, a bush or a crate where you stand (and stay put)">
                  🪄 Become a prop
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
}
