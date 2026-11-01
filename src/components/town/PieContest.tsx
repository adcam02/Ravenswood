import { useEffect, useRef, useState } from 'react';
import { game } from '../../game/hud';
import { local, setItem } from '../../game/local';
import { presence } from '../../game/presence';
import { PIE, PIE_BITES, pieBlocked, pieOn } from '../../game/pieRules';
import { biteSound, countBeat, fanfare } from '../../lib/audio';
import { player } from '../../net/client';
import type { PieContest, PieEater } from '../../state/types';
import { shownName } from '../../state/nicks';
import { useView, type SeatView } from '../../state/view';

/**
 * The pie-eating contest on screen, for anyone in the tavern: who's pulled up a chair (and a button to join), the
 * count of three, then a lane each with their face getting creamier and their pie going down, a cheering crowd of
 * whoever's watching, and for the eaters a big button to tap (or the space bar). The result: the winner's prize,
 * and a ribbon for everyone else who ate.
 */

/** Re-renders every so often while `on`. */
function useTicking(on: boolean, ms = 100) {
  const [, set] = useState(0);
  useEffect(() => {
    if (!on) return;
    const t = setInterval(() => set((n) => n + 1), ms);
    return () => clearInterval(t);
  }, [on, ms]);
}

/** Who else is in the tavern to watch (seat ids), checked a couple of times a second. */
function useWatchers(): string[] {
  const read = () => [...presence.others].filter(([key, p]) => key !== 'st' && p.zone === 'tavern').map(([key]) => key);
  const [list, set] = useState(read);
  useEffect(() => {
    const t = setInterval(() => {
      const next = read();
      set((prev) => (prev.join() === next.join() ? prev : next));
    }, 500);
    return () => clearInterval(t);
  }, []);
  return list;
}

/** A round face in their coat colour, getting creamier with every pie. */
function Face({ seat, bites, chomp }: { seat: SeatView | undefined; bites: number; chomp: boolean }) {
  const cream = Math.min(PIE.pies, Math.floor(bites / PIE.bites) + (bites % PIE.bites > PIE.bites / 2 ? 1 : 0));
  return (
    <span className={`pie-face${chomp ? ' is-chomp' : ''}`} style={{ background: seat?.look?.color ?? '#c9a27a' }}>
      <i className="pie-eye l" />
      <i className="pie-eye r" />
      <i className="pie-mouth" />
      {Array.from({ length: cream * 2 }, (_, i) => (
        <i key={i} className={`pie-cream c${i}`} />
      ))}
    </span>
  );
}

/** The pie on their plate: what's left of this one, as a slice-shaped wedge going round. */
function Pie({ bites }: { bites: number }) {
  const done = bites >= PIE_BITES;
  const left = done ? 0 : 1 - (bites % PIE.bites) / PIE.bites;
  return (
    <span className="pie-plate">
      <span className="pie-pie" style={{ background: `conic-gradient(#e9b562 0 ${left * 360}deg, transparent ${left * 360}deg)`, transform: `scale(${0.75 + left * 0.25})` }} />
    </span>
  );
}

function Lane({ e, seat, mine, bites, lead }: { e: PieEater; seat: SeatView | undefined; mine: boolean; bites: number; lead: boolean }) {
  const pies = Math.floor(bites / PIE.bites);
  return (
    <li className={`pie-lane${mine ? ' is-me' : ''}${lead ? ' is-lead' : ''}`}>
      <Face seat={seat} bites={bites} chomp={bites % 2 === 1} />
      <span className="pie-who">
        <b>{mine ? 'You' : shownName(seat?.label ?? e.name)}</b>
        <span className="pie-count" aria-label={`${pies} of ${PIE.pies} pies`}>
          {Array.from({ length: PIE.pies }, (_, i) => (
            <span key={i} className={i < pies ? 'on' : ''}>
              🥧
            </span>
          ))}
        </span>
      </span>
      <Pie bites={bites} />
    </li>
  );
}

const CHEERS = ['Go! Go! Go!', 'Eat! Eat! Eat!', 'Faster!', 'Ooh, cream!', 'Don’t choke!', 'Chomp chomp!'];

export function PiePanel() {
  const view = useView();
  const c: PieContest | null = view.pie;
  const watchers = useWatchers();
  const me = view.seats.find((s) => s.isMe);
  const mine = c?.eaters.find((e) => e.seat === view.mySeatId);
  // Our own bites go up as we tap; the host's count catches up a few times a second.
  const bites = useRef({ id: '', n: 0, sent: 0 });
  const [, bump] = useState(0);
  const lastEmote = useRef(0);
  useTicking(Boolean(c && c.stage !== 'over'));
  if (c && bites.current.id !== c.id) bites.current = { id: c.id, n: 0, sent: 0 };
  const eating = c?.stage === 'eat' && Boolean(mine);
  const mineDone = bites.current.n >= PIE_BITES;

  const bite = () => {
    if (!eating || mineDone) return;
    bites.current.n += 1;
    biteSound();
    bump((n) => n + 1);
    // Paws to mouth, in the town, every so often.
    const now = performance.now();
    if (now - lastEmote.current > 900) {
      lastEmote.current = now;
      game.emote('work');
    }
  };

  // The bites so far go to the Storyteller a few times a second.
  useEffect(() => {
    if (!eating) return;
    const t = setInterval(() => {
      const b = bites.current;
      if (b.n > b.sent) {
        b.sent = b.n;
        player.pie({ k: 'bites', n: b.n });
      }
    }, PIE.sendMs);
    return () => clearInterval(t);
  }, [eating]);

  // The space bar taps too.
  useEffect(() => {
    if (!eating) return;
    const down = (ev: KeyboardEvent) => {
      if (ev.code !== 'Space' || ev.repeat) return;
      ev.preventDefault();
      ev.stopPropagation();
      bite();
    };
    window.addEventListener('keydown', down, true);
    return () => window.removeEventListener('keydown', down, true);
  });

  // A pie in your paw while you eat; the count of three and the result have their sounds.
  const stage = c?.stage;
  const left = c ? Math.max(0, Math.ceil((c.until - Date.now()) / 1000)) : 0;
  useEffect(() => {
    if (!mine) return;
    if (stage === 'eat') setItem({ k: 'pie' });
    else if (stage === 'over' && local.item?.k === 'pie') setItem(null);
  }, [stage, Boolean(mine)]);
  useEffect(() => {
    if (stage === 'count' && left > 0) countBeat(false);
    if (stage === 'eat') countBeat(true);
  }, [stage, stage === 'count' ? left : 0]);
  useEffect(() => {
    if (stage === 'over' && c?.result?.winner && mine) fanfare(c.result.winner === view.mySeatId);
  }, [stage]);

  if (!c) return null;
  const seatOf = (id: string) => view.seats.find((s) => s.id === id);
  const shown = (e: PieEater) => (e.seat === view.mySeatId && c.stage === 'eat' ? Math.max(e.bites, bites.current.n) : e.bites);
  const most = Math.max(0, ...c.eaters.map(shown));
  const crowd = watchers.filter((id) => !c.eaters.some((e) => e.seat === id));
  const blocked = view.mode === 'player' ? pieBlocked(view) : null;
  const canJoin = view.mode === 'player' && c.stage === 'join' && !mine && c.eaters.length < PIE.maxEaters && !blocked && Boolean(me?.look);
  const res = c.result;
  const nameOf = (id: string) => (id === view.mySeatId ? 'You' : shownName(seatOf(id)?.label ?? c.eaters.find((e) => e.seat === id)?.name ?? 'Someone'));

  let line = '';
  if (c.stage === 'join') line = `Pull up a chair! Starts in ${left}s · ${c.eaters.length} of ${PIE.maxEaters}${c.eaters.length < PIE.minEaters ? ` (needs ${PIE.minEaters})` : ''}`;
  else if (c.stage === 'eat') line = `First to ${PIE.pies} pies wins · ${left}s`;
  else if (c.stage === 'over' && res) {
    if (res.why === 'few') line = 'Not enough eaters this time. Try again with a friend!';
    else if (res.why === 'off') line = 'The contest’s off.';
    else if (!res.winner) line = 'A tie! Nobody wins, everybody’s full.';
    else line = `${nameOf(res.winner)} ${res.winner === view.mySeatId ? 'win' : 'wins'}!${res.prize ? ` +$${res.prize}` : res.winner === view.mySeatId ? ' (prize already won today)' : ''}`;
  }
  const ribbon = c.stage === 'over' && res?.winner && mine && res.winner !== view.mySeatId && mine.bites > 0;

  return (
    <>
      <div className="pie-wrap">
        <div className={`pie-card cosy-panel stage-${c.stage}`}>
          <div className="pie-head">
            <span>🥧 Pie-eating contest</span>
            {c.stage === 'eat' && <span className="pie-clock">{left}</span>}
          </div>
          {c.stage === 'count' ? (
            <div className="pie-count-big" key={left}>
              {left || 'Eat!'}
            </div>
          ) : null}
          <ul className="pie-lanes">
            {c.eaters.map((e) => (
              <Lane key={e.seat} e={e} seat={seatOf(e.seat)} mine={e.seat === view.mySeatId} bites={shown(e)} lead={c.stage !== 'join' && most > 0 && shown(e) === most} />
            ))}
          </ul>
          {line && <div className="pie-line">{line}</div>}
          {ribbon && <div className="pie-ribbon">🎀 A participation ribbon for you. Well chewed!</div>}
          {c.stage === 'join' && view.mode === 'player' && (
            <div className="pie-btns">
              {mine ? (
                <button className="cosy-btn small" onClick={() => player.pie({ k: 'leave' })}>
                  Leave the table
                </button>
              ) : (
                <button className="cosy-btn small primary" disabled={!canJoin} title={blocked ?? ''} onClick={() => player.pie({ k: 'join' })}>
                  {c.eaters.length >= PIE.maxEaters ? 'Table full' : 'Join in'}
                </button>
              )}
            </div>
          )}
          {(c.stage === 'eat' || c.stage === 'count') && crowd.length > 0 && (
            <div className="pie-crowd" aria-label="The crowd">
              {crowd.slice(0, 10).map((id, i) => (
                <span key={id} className="pie-fan" style={{ background: seatOf(id)?.look?.color ?? '#c9a27a', animationDelay: `${i * 0.13}s` }} title={seatOf(id)?.label} />
              ))}
              <span className="pie-cheer">{CHEERS[Math.floor(Date.now() / 1800) % CHEERS.length]}</span>
            </div>
          )}
          {c.stage === 'join' && <p className="pie-note">Tap as fast as you can: {PIE.bites} bites a pie, first to {PIE.pies} pies wins ${PIE.prize} (once a day).</p>}
        </div>
      </div>
      {eating && (
        <button
          className={`pie-tap${mineDone ? ' is-done' : ''}`}
          onPointerDown={(ev) => {
            ev.preventDefault();
            bite();
          }}
        >
          <span className="pie-tap-icon">🥧</span>
          <span>{mineDone ? 'Finished!' : 'CHOMP!'}</span>
          <small>Tap fast (or the space bar)</small>
        </button>
      )}
    </>
  );
}

/** Whether there's any contest to show (one on or just over). */
export const pieShown = (c: PieContest | null | undefined) => Boolean(c && (pieOn(c) || c.stage === 'over'));
