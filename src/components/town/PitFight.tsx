import { useEffect, useState } from 'react';
import { local } from '../../game/local';
import { presence } from '../../game/presence';
import { BEATS, PIT, allowed, heartsAt } from '../../game/pitRules';
import { player } from '../../net/client';
import type { PitFight, PitMove, PitRound } from '../../state/types';
import { ui } from '../../state/ui';
import { useView, type SeatView } from '../../state/view';
import { MOVE_LABEL } from '../../world/pitfight';
import { PETS, zoneKind } from '../../world/types';

/**
 * The pet pit on screen, for anyone down in the tavern's cellar: the lobby (who's here, challenges in and out), the
 * scoreboard over a fight (both pets' hearts and charges, the round, the clock, what just happened), and for the two
 * fighters, the three big buttons to pick a move.
 */

const HINT: Record<PitMove, string> = {
  attack: '1 damage, +1 a charge',
  block: 'Stop an attack, hit back 2',
  charge: '+1 to your next attack',
};

/** Whether we're in the cellar, and who else is, checked a few times a second. */
function useCellar(): { here: boolean; others: string[] } {
  const read = () => ({
    here: zoneKind(local.zone) === 'cellar',
    others: [...presence.others].filter(([key, p]) => key !== 'st' && p.zone === 'cellar').map(([key]) => key),
  });
  const [state, set] = useState(read);
  useEffect(() => {
    const t = setInterval(() => {
      const next = read();
      set((prev) => (prev.here === next.here && prev.others.join() === next.others.join() ? prev : next));
    }, 300);
    return () => clearInterval(t);
  }, []);
  return state;
}

/** Re-renders every so often while `on`. */
function useTicking(on: boolean, ms = 100) {
  const [, set] = useState(0);
  useEffect(() => {
    if (!on) return;
    const t = setInterval(() => set((n) => n + 1), ms);
    return () => clearInterval(t);
  }, [on, ms]);
}

const petOf = (s: SeatView | undefined) => PETS.find((p) => p.id === s?.look?.pet) ?? null;
const petIcon = (id: string) => PETS.find((p) => p.id === id)?.icon ?? '🐾';

const stageLen = (f: PitFight) => (f.stage === 'intro' ? PIT.introMs : f.stage === 'pick' ? PIT.pickMs : f.stage === 'reveal' ? PIT.revealMs : PIT.overMs);
const ageOf = (f: PitFight) => (Date.now() - (f.until - stageLen(f))) / 1000;

/** What happened in a round, in words. */
function tell(r: PitRound, names: [string, string]): string {
  const [a, b] = r.moves;
  const [A, B] = names;
  if (a === 'attack' && b === 'attack') return `Both attack! ${A} hits for ${r.power[0]}, ${B} for ${r.power[1]}.`;
  for (const [i, o] of [
    [0, 1],
    [1, 0],
  ] as const) {
    const [me, them] = [names[i], names[o]];
    if (r.moves[i] !== 'attack') continue;
    if (r.moves[o] === 'block') return `${them} blocks ${me}’s attack and hits back twice!`;
    if (r.moves[o] === 'charge') return `${me} hits ${them} for ${r.power[i]} while ${them} charges up.`;
  }
  if (a === 'charge' && b === 'charge') return 'Both charge up.';
  if (a === 'block' && b === 'block') return 'Both block. Nothing happens.';
  const blocker = a === 'block' ? A : B;
  const charger = a === 'charge' ? A : B;
  return `${charger} charges up while ${blocker} blocks thin air.`;
}

function Hearts({ n }: { n: number }) {
  return (
    <span className="pit-hearts" aria-label={`${n} of ${PIT.hearts} hearts`}>
      {Array.from({ length: PIT.hearts }, (_, i) => (
        <span key={i} className={`pit-heart${i < n ? ' on' : ''}`}>
          ♥
        </span>
      ))}
    </span>
  );
}

function Charges({ n }: { n: number }) {
  if (!n) return null;
  return (
    <span className="pit-charges" aria-label={`${n} charged`}>
      {'⚡'.repeat(n)}
    </span>
  );
}

/** The fight over the ring: both sides, the round and the clock, and what's going on. */
function Scoreboard({ f, mine }: { f: PitFight; mine: number }) {
  const age = ageOf(f);
  const r = f.last;
  const reveal = f.stage === 'reveal' && r;
  const names: [string, string] = [f.sides[0].name, f.sides[1].name];
  const hearts = (i: 0 | 1) => (reveal ? heartsAt(r, i, age) : f.sides[i].hp);
  const charges = (i: 0 | 1) => (reveal ? (age < BEATS.lunge + 0.3 ? r.had[i] : r.charge[i]) : f.sides[i].charge);
  let line = '';
  if (f.stage === 'intro') line = `${names[0]} and ${names[1]} step into the ring…`;
  else if (f.stage === 'pick') {
    const waiting = f.sides.filter((s) => !s.picked).map((s) => s.name);
    line = waiting.length === 2 ? 'Both picking…' : waiting.length ? `Waiting for ${waiting[0]}…` : 'Here we go!';
  } else if (reveal) line = tell(r, names);
  else if (f.stage === 'over' && f.result) {
    const res = f.result;
    const prize = res.prize ? ` +$${res.prize}` : '';
    if (res.why === 'off') line = 'The fight’s off.';
    else if (res.why === 'draw') line = `A draw!${res.prize ? ` $${res.prize} each` : ''}`;
    else if (res.winner !== null) {
      const w = names[res.winner];
      const l = names[res.winner === 0 ? 1 : 0];
      line = res.why === 'left' ? `${l} walked out. ${w} wins!${prize}` : `${w} wins!${prize}`;
      if (res.winner === mine && !res.prize && (res.why === 'ko' || f.last)) line += ' (no more prizes today)';
    }
  }
  const left = Math.max(0, Math.ceil((f.until - Date.now()) / 1000));
  const side = (i: 0 | 1) => (
    <div className={`pit-side side-${i}${mine === i ? ' is-me' : ''}`}>
      <div className="pit-who">
        <span className="pit-pet">{petIcon(f.sides[i].pet)}</span>
        <b>{mine === i ? 'You' : f.sides[i].name}</b>
      </div>
      <div className="pit-stats">
        <Hearts n={hearts(i)} />
        <Charges n={charges(i)} />
      </div>
    </div>
  );
  return (
    <div className="pit-score cosy-panel">
      <div className="pit-row">
        {side(0)}
        <div className="pit-mid">
          <span className="pit-round">{f.round ? `Round ${f.round}` : 'Fight!'}</span>
          {f.stage === 'pick' && <span className={`pit-clock${left <= 3 ? ' is-low' : ''}`}>{left}</span>}
        </div>
        {side(1)}
      </div>
      {line && <div className="pit-line">{line}</div>}
    </div>
  );
}

/** A fighter's three buttons. */
function Moves({ f, i }: { f: PitFight; i: number }) {
  const me = f.sides[i];
  const [mine, setMine] = useState<{ key: string; move: PitMove } | null>(null);
  const key = `${f.id}:${f.round}`;
  const picked = me.picked || mine?.key === key;
  const left = Math.max(0, (f.until - Date.now()) / PIT.pickMs);
  const pick = (move: PitMove) => {
    if (picked) return;
    setMine({ key, move });
    player.pit({ k: 'move', move });
  };
  return (
    <div className="pit-moves cosy-panel">
      <div className="pit-timer">
        <span style={{ width: `${left * 100}%` }} />
      </div>
      {picked ? (
        <p className="pit-picked">
          {mine?.key === key ? `${MOVE_LABEL[mine.move].icon} ${MOVE_LABEL[mine.move].name}. ` : ''}Waiting for {f.sides[i === 0 ? 1 : 0].name}…
        </p>
      ) : (
        <div className="pit-buttons">
          {(['attack', 'block', 'charge'] as const).map((m) => {
            const ok = allowed(m, me.last);
            const full = m === 'charge' && me.charge >= PIT.maxCharge;
            return (
              <button key={m} className={`pit-move is-${m}`} disabled={!ok} onClick={() => pick(m)} title={ok ? HINT[m] : 'You blocked last round'}>
                <span className="pit-move-icon">{MOVE_LABEL[m].icon}</span>
                <span className="pit-move-name">{MOVE_LABEL[m].name}</span>
                <small>{!ok ? 'Not twice running' : full ? 'Fully charged' : m === 'attack' && me.charge ? `${1 + me.charge} damage` : HINT[m]}</small>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/** Who's down here, and challenges in and out. */
function Lobby({ others, busy }: { others: string[]; busy: boolean }) {
  const view = useView();
  const pit = view.pit;
  const me = view.seats.find((s) => s.isMe);
  const [open, setOpen] = useState(true);
  if (!me) return null;
  const myPet = petOf(me);
  const incoming = (pit?.challenges ?? []).filter((c) => c.to === me.id);
  const outgoing = (pit?.challenges ?? []).find((c) => c.from === me.id);
  const people = others.map((id) => view.seats.find((s) => s.id === id)).filter((s): s is SeatView => Boolean(s?.claimed && s.look));
  const name = (id: string) => view.seats.find((s) => s.id === id)?.label ?? 'Someone';
  return (
    <div className={`pit-lobby cosy-panel${open ? '' : ' is-closed'}`}>
      <button className="pit-lobby-head" onClick={() => setOpen(!open)}>
        <span>🥊 The Pet Pit</span>
        {incoming.length > 0 && <span className="pit-badge-count">{incoming.length}</span>}
        <span className="pit-caret">{open ? '▾' : '▸'}</span>
      </button>
      {open && (
        <div className="pit-lobby-body">
          {incoming.map((c) => (
            <div key={c.id} className="pit-challenge is-in">
              <span>
                <b>{name(c.from)}</b> challenges you!
              </span>
              <span className="pit-challenge-btns">
                <button className="cosy-btn small primary" disabled={busy || !myPet} title={busy ? 'Wait for the ring to be free' : ''} onClick={() => player.pit({ k: 'answer', id: c.id, yes: true })}>
                  Fight
                </button>
                <button className="cosy-btn small" onClick={() => player.pit({ k: 'answer', id: c.id, yes: false })}>
                  No thanks
                </button>
              </span>
            </div>
          ))}
          {outgoing && (
            <div className="pit-challenge is-out">
              <span>
                Waiting for <b>{name(outgoing.to)}</b>…
              </span>
              <button className="cosy-btn small" onClick={() => player.pit({ k: 'withdraw', id: outgoing.id })}>
                Cancel
              </button>
            </div>
          )}
          {!myPet ? (
            <p className="pit-note">
              Bring a pet to fight.{' '}
              <button className="pit-link" onClick={() => ui.open({ kind: 'customise' })}>
                Choose one
              </button>
            </p>
          ) : people.length === 0 ? (
            <p className="pit-note">Nobody else is down here yet. Bring a friend (and their pet)!</p>
          ) : (
            <ul className="pit-people">
              {people.map((s) => {
                const pet = petOf(s);
                const sent = outgoing?.to === s.id;
                return (
                  <li key={s.id}>
                    <span className="pit-person">
                      <span className="pit-pet">{pet?.icon ?? '·'}</span>
                      {s.label}
                    </span>
                    <button className="cosy-btn small" disabled={!pet || sent} onClick={() => player.pit({ k: 'challenge', to: s.id })} title={pet ? `Challenge ${s.label}’s ${pet.name.toLowerCase()}` : 'No pet with them'}>
                      {sent ? 'Sent' : pet ? 'Challenge' : 'No pet'}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
          <p className="pit-note small">
            Win ${PIT.prize} from the house. {busy ? 'A fight’s on: next up when the ring’s free.' : ''}
          </p>
        </div>
      )}
    </div>
  );
}

export function PitPanel() {
  const view = useView();
  const { here, others } = useCellar();
  const f = view.pit?.fight ?? null;
  useTicking(here && Boolean(f));
  if (!here) return null;
  const mine = f ? f.sides.findIndex((s) => s.seat === view.mySeatId) : -1;
  const busy = Boolean(f && f.stage !== 'over');
  const lobby = view.mode === 'player' && (mine < 0 || f?.stage === 'over');
  return (
    <>
      <div className="pit-top">
        {f && <Scoreboard f={f} mine={mine} />}
        {lobby && <Lobby others={others} busy={busy} />}
      </div>
      {f && mine >= 0 && f.stage === 'pick' && <Moves f={f} i={mine} />}
    </>
  );
}
