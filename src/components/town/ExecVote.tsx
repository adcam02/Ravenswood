import { useEffect, useRef, useState } from 'react';
import { EXEC_METHODS, LAND_MS, PICK_MS, SPIN_MS, execMethod, methodShares, wheelTurns } from '../../game/execution';
import { execSound } from '../../lib/audio';
import { player } from '../../net/client';
import { st } from '../../state/host';
import type { ExecMethod, Execution } from '../../state/types';
import { useView } from '../../state/view';

/** Redraws every frame while `on` (for the wheel), or every few hundred milliseconds otherwise. */
function useClock(on: boolean, fast: boolean) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (!on) return;
    let raf = 0;
    let timer: ReturnType<typeof setTimeout> | null = null;
    const tick = () => {
      setNow(Date.now());
      if (fast) raf = requestAnimationFrame(tick);
      else timer = setTimeout(tick, 200);
    };
    tick();
    return () => {
      cancelAnimationFrame(raf);
      if (timer) clearTimeout(timer);
    };
  }, [on, fast]);
  return now;
}

/**
 * An execution: everyone (the condemned too, and the dead) has a few seconds to vote on how, with big buttons and
 * a running count; then a wheel spins, each way's slice its share of the votes, and lands on the one the
 * Storyteller's page drew, the same on every screen. The Storyteller can simply choose instead.
 */
export function ExecVote() {
  const view = useView();
  const ex = view.execution;
  const st_ = view.mode === 'st';
  const voting = Boolean(ex && !ex.method && ex.vote && Date.now() < ex.vote.until + 2500);
  // (Only while the wheel or the Storyteller's pick is up: then it stops.)
  const spinning = Boolean(ex?.method && ex.drawn && Date.now() < ex.drawn.at + Math.max(SPIN_MS + LAND_MS, PICK_MS) + 200);
  const now = useClock(voting || spinning, spinning);
  if (!ex) return null;
  const name = view.seats.find((s) => s.id === ex.seatId)?.label ?? 'Someone';
  if (voting && ex.vote && now < ex.vote.until + 2500) return <Vote ex={ex} name={name} now={now} st={st_} mine={view.mySeatId} />;
  if (ex.method && ex.drawn?.spin && now < ex.drawn.at + SPIN_MS + LAND_MS && now > ex.drawn.at - 1000) return <Wheel ex={ex} now={now} />;
  if (ex.method && ex.drawn && !ex.drawn.spin && now < ex.drawn.at + PICK_MS && now > ex.drawn.at - 1000) {
    const m = execMethod(ex.method);
    return (
      <div className="exec-vote cosy-panel chosen" role="status" aria-live="polite">
        <span className="exec-eyebrow">The Storyteller chooses</span>
        <strong className="exec-result" style={{ '--m': m.color } as React.CSSProperties}>
          <span>{m.icon}</span> {m.name}
        </strong>
      </div>
    );
  }
  return null;
}

function Vote({ ex, name, now, st: storyteller, mine }: { ex: Execution; name: string; now: number; st: boolean; mine: string | null }) {
  const [picked, setPicked] = useState<{ id: string; m: ExecMethod } | null>(null);
  const left = Math.max(0, (ex.vote?.until ?? now) - now);
  const secs = Math.ceil(left / 1000);
  const lastTick = useRef(0);
  useEffect(() => {
    if (secs > 0 && secs !== lastTick.current) {
      lastTick.current = secs;
      execSound('tick');
    }
  }, [secs]);
  const picks = ex.vote?.picks ?? {};
  const counts = new Map<ExecMethod, number>();
  for (const m of Object.values(picks)) counts.set(m, (counts.get(m) ?? 0) + 1);
  const total = Object.keys(picks).length;
  const mineNow = (mine && picks[mine]) || (picked?.id === ex.id ? picked.m : null);
  const choose = (m: ExecMethod) => {
    if (storyteller) st.pickMethod(m);
    else {
      setPicked({ id: ex.id, m });
      player.method(m);
    }
    execSound('click');
  };
  return (
    <div className="exec-vote cosy-panel" role="dialog" aria-label="How should they be executed?">
      <span className="exec-eyebrow">{name} is to be executed</span>
      <strong className="exec-title">{storyteller ? 'The town is voting on how. Or choose it yourself:' : 'How? Vote now!'}</strong>
      <div className="exec-timer" aria-hidden="true">
        <i style={{ transform: `scaleX(${left / 5000})` }} />
      </div>
      <div className="exec-methods">
        {EXEC_METHODS.map((m) => (
          <button
            key={m.id}
            className={`exec-method ${mineNow === m.id ? 'on' : ''}`}
            style={{ '--m': m.color } as React.CSSProperties}
            onClick={() => choose(m.id)}
            disabled={left <= 0}
            aria-pressed={mineNow === m.id}
          >
            <span className="exec-icon">{m.icon}</span>
            <span className="exec-name">{m.name}</span>
            {counts.get(m.id) ? <span className="exec-count">{counts.get(m.id)}</span> : null}
          </button>
        ))}
      </div>
      <span className="exec-foot">
        {left <= 0 ? 'Spinning the wheel…' : `${secs}s · ${total ? `${total} vote${total === 1 ? '' : 's'}` : 'no votes yet'}${mineNow && !storyteller ? ` · you chose ${execMethod(mineNow).name}` : ''}`}
      </span>
    </div>
  );
}

/** A pie of the votes, spinning fast and slowing to land on the drawn way, ticking past each slice. */
function Wheel({ ex, now }: { ex: Execution; now: number }) {
  const shares = methodShares(ex.vote?.picks);
  const start = ex.drawn?.at ?? now;
  const k = Math.min(1, Math.max(0, (now - start) / SPIN_MS));
  // Fast at first, slowing right down at the end.
  const turns = wheelTurns(ex) * (1 - (1 - k) ** 4);
  const landed = k >= 1;
  // Which slice is under the pointer, for the ticks.
  const under = (() => {
    const f = (((1 - (turns % 1)) % 1) + 1) % 1;
    let at = 0;
    for (let i = 0; i < shares.length; i++) {
      at += shares[i].share;
      if (f < at) return i;
    }
    return shares.length - 1;
  })();
  const last = useRef(-1);
  const rang = useRef(false);
  useEffect(() => {
    if (landed) {
      if (!rang.current) {
        rang.current = true;
        execSound('land');
      }
      return;
    }
    if (under !== last.current && shares.length > 1) execSound('click');
    last.current = under;
  }, [under, landed, shares.length]);
  const R = 100;
  let a0 = 0;
  const slices = shares.map((s) => {
    const m = execMethod(s.id);
    const from = a0;
    const to = a0 + s.share;
    a0 = to;
    const p = (f: number, r = R) => [Math.sin(f * Math.PI * 2) * r, -Math.cos(f * Math.PI * 2) * r];
    const [x0, y0] = p(from);
    const [x1, y1] = p(to);
    const big = s.share > 0.5 ? 1 : 0;
    const d = s.share >= 0.999 ? `M 0 ${-R} A ${R} ${R} 0 1 1 0 ${R} A ${R} ${R} 0 1 1 0 ${-R} Z` : `M 0 0 L ${x0} ${y0} A ${R} ${R} 0 ${big} 1 ${x1} ${y1} Z`;
    const [ix, iy] = p((from + to) / 2, R * 0.66);
    return { m, d, ix, iy, wide: s.share > 0.07, mid: (from + to) / 2 };
  });
  const result = execMethod(ex.method);
  return (
    <div className={`exec-vote cosy-panel wheel ${landed ? 'landed' : ''}`} role="status" aria-live="polite" aria-label="The wheel">
      <span className="exec-eyebrow">{landed ? 'The wheel has spoken' : 'Spinning the wheel…'}</span>
      <div className="exec-wheel">
        <svg viewBox="-110 -112 220 222" aria-hidden="true">
          <g style={{ transform: `rotate(${turns * 360}deg)` }}>
            {slices.map((s) => (
              <g key={s.m.id} className={landed && s.m.id === result.id ? 'win' : ''}>
                <path d={s.d} fill={s.m.color} stroke="#fff8ea" strokeWidth="3" />
                {s.wide && (
                  <text x={s.ix} y={s.iy} transform={`rotate(${s.mid * 360} ${s.ix} ${s.iy})`} textAnchor="middle" dominantBaseline="central" fontSize="28">
                    {s.m.icon}
                  </text>
                )}
              </g>
            ))}
            <circle r="14" fill="#fff8ea" stroke="#e7d3b0" strokeWidth="3" />
          </g>
          <path d="M -11 -110 L 11 -110 L 0 -86 Z" fill="#5a4434" stroke="#fff8ea" strokeWidth="2" />
        </svg>
      </div>
      <strong className={`exec-result ${landed ? 'in' : ''}`} style={{ '--m': result.color } as React.CSSProperties}>
        {landed ? (
          <>
            <span>{result.icon}</span> {result.name}!
          </>
        ) : (
          '…'
        )}
      </strong>
    </div>
  );
}
