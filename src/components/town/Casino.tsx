import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { bestHand, bjTotal, isCard, type Card } from '../../casino/cards';
import { casino, hostNow, useCasinoView } from '../../casino/client';
import { BJ_MAX, BJ_MIN, HIDDEN, PK, RL, type BjSeatView, type CasinoView, type PkSeatView, type PkView } from '../../casino/types';
import { BET_KEYS, betName, boardCell, colourOf, covers, odds } from '../../casino/roulette';
import { PAYTABLE, SEVEN, SL, SYMBOLS, linePays } from '../../casino/slots';
import { useHud } from '../../game/hud';
import { money } from '../../game/profiles';
import { useMoney, useMyPets } from '../../game/progress';
import { cardSound, casinoLose, casinoWin, chipSound, rouletteSpin, slotLever, slotReels, slotWin, tillSound } from '../../lib/audio';
import { useView } from '../../state/view';
import { Shop } from './Shop';

/**
 * The Lucky Raven's panels: the shop at the counter (in Shop.tsx), and the card tables and the slot machines, which sit
 * along the bottom of the screen while the camera looks across the felt (or at the reels) from your seat. Everything is dealt and paid by the Storyteller's
 * browser; these only show it and send what you choose.
 */
export function CasinoPanels() {
  const at = useHud((s) => s.casino);
  const view = useView();
  const mode = view.mode === 'st' ? 'st' : 'player';
  const cv = useCasinoView(mode);
  useCasinoSounds(cv);
  if (!at) return null;
  if (at.kind === 'shop') return <Shop view={cv} tab={at.tab} away={at.away} />;
  if (!cv) return null;
  if (at.kind === 'roulette') return cv.rl ? <Roulette view={cv} seat={at.seat} /> : null;
  if (at.kind === 'slots') return cv.sl ? <Slots view={cv} machine={at.seat} /> : null;
  return at.kind === 'blackjack' ? <Blackjack view={cv} seat={at.seat} /> : <Poker view={cv} seat={at.seat} />;
}

const close = () => useHud.setState({ casino: null });

/** The player's own note from the host ("You need $35 for the slime"), for a few seconds. */
function Note({ view }: { view: CasinoView | null }) {
  const note = view?.note;
  const [shown, setShown] = useState<string | null>(null);
  useEffect(() => {
    if (!note || hostNow() - note.at > 6000) return;
    setShown(note.text);
    const t = setTimeout(() => setShown(null), 6000 - Math.max(0, hostNow() - note.at));
    return () => clearTimeout(t);
  }, [note?.at, note?.text]);
  return shown ? (
    <p className="casino-note" role="status">
      {shown}
    </p>
  ) : null;
}

// ---------------------------------------------------------------- cards and chips

/** A playing card drawn in CSS: the rank and suit in the corner and a big suit in the middle, or the back. */
export function PlayingCard({ card, size = 'md', fresh = false }: { card: Card; size?: 'sm' | 'md' | 'lg'; fresh?: boolean }) {
  if (card === HIDDEN || !isCard(card)) return <span className={`pc back ${size} ${fresh ? 'fresh' : ''}`} aria-label="A face-down card" />;
  const rank = card[0] === 'T' ? '10' : card[0];
  const suit = { s: '♠', h: '♥', d: '♦', c: '♣' }[card[1]];
  const red = card[1] === 'h' || card[1] === 'd';
  const name = `${{ A: 'Ace', K: 'King', Q: 'Queen', J: 'Jack' }[card[0]] ?? rank} of ${{ s: 'spades', h: 'hearts', d: 'diamonds', c: 'clubs' }[card[1]]}`;
  return (
    <span className={`pc ${red ? 'red' : ''} ${size} ${fresh ? 'fresh' : ''}`} aria-label={name} title={name}>
      <b>{rank}</b>
      <i>{suit}</i>
      <em>{suit}</em>
    </span>
  );
}

function Hand({ cards, size, slots = 0 }: { cards: Card[]; size?: 'sm' | 'md' | 'lg'; slots?: number }) {
  // Cards that weren't there last time deal in.
  const seen = useRef<string[]>([]);
  const fresh = cards.map((c, i) => seen.current[i] !== c);
  useEffect(() => {
    seen.current = cards;
  });
  return (
    <span className="pc-hand">
      {cards.map((c, i) => (
        <PlayingCard key={`${i}:${c}`} card={c} size={size} fresh={fresh[i]} />
      ))}
      {Array.from({ length: Math.max(0, slots - cards.length) }, (_, i) => (
        <span key={`slot${i}`} className={`pc slot ${size ?? 'md'}`} />
      ))}
    </span>
  );
}

const CHIP_VALUES = [1, 5, 10, 25];
const chipClass = (v: number) => `chip c${v}`;

function Chip({ value, onClick, disabled }: { value: number; onClick?: () => void; disabled?: boolean }) {
  return (
    <button className={chipClass(value)} onClick={onClick} disabled={disabled} aria-label={`Add ${money(value)}`}>
      {value}
    </button>
  );
}

/** A small stack of chips beside an amount. */
const Stake = ({ amount, label }: { amount: number; label?: string }) =>
  amount > 0 ? (
    <span className="stake">
      <span className="stake-chips" aria-hidden="true">
        <i />
        <i />
        <i />
      </span>
      {label ? `${label} ` : ''}
      {money(amount)}
    </span>
  ) : null;

/** A bar that empties as a turn runs out. */
function TurnTimer({ until, total }: { until: number | null; total: number }) {
  const [, tick] = useState(0);
  useEffect(() => {
    if (!until) return;
    const t = setInterval(() => tick((n) => n + 1), 250);
    return () => clearInterval(t);
  }, [until]);
  if (!until) return null;
  const left = Math.max(0, until - hostNow());
  return (
    <span className={`turn-timer ${left < 8000 ? 'low' : ''}`} title={`${Math.ceil(left / 1000)} seconds left`}>
      <i style={{ width: `${Math.min(100, (left / total) * 100)}%` }} />
    </span>
  );
}

const handTotal = (cards: Card[]) => {
  const shown = cards.filter((c) => c !== HIDDEN);
  if (!shown.length) return '';
  const { total, soft } = bjTotal(shown);
  return soft && total < 21 ? `soft ${total}` : String(total);
};

// ---------------------------------------------------------------- blackjack

const BJ_SAY: Record<NonNullable<BjSeatView['result']>, string> = {
  blackjack: 'Blackjack!',
  win: 'You win!',
  push: 'A push: your bet comes back',
  lose: 'The dealer wins',
  bust: 'Bust!',
};

function Blackjack({ view, seat }: { view: CasinoView; seat: number }) {
  const coins = useMoney();
  const s = view.bj[seat];
  const mine = s?.mine ? s : null;
  const [bet, setBet] = useState(5);
  const v = useView();
  // Sit down when the panel opens (and again if the seat comes free).
  useEffect(() => {
    if (v.mode === 'player' && !s) casino({ k: 'bj', do: 'sit', seat });
  }, [seat, Boolean(s)]);
  const leave = () => {
    if (v.mode === 'player') casino({ k: 'bj', do: 'leave' });
    close();
  };
  // Someone else has it.
  if (s && !s.mine && v.mode === 'player') {
    return (
      <TableShell title="Blackjack" onLeave={close}>
        <p className="casino-wait">{s.name} is sitting there. Try another seat!</p>
      </TableShell>
    );
  }
  const others = view.bj.filter((x, i): x is BjSeatView => Boolean(x) && i !== seat);
  const canBet = mine && (mine.state === 'betting' || mine.state === 'done');
  const most = Math.min(BJ_MAX, coins);
  const stake = Math.max(BJ_MIN, Math.min(bet, most));
  return (
    <TableShell title="Blackjack" rules="Dealer stands on 17 · Blackjack pays 3 to 2" onLeave={leave} leaveLabel={mine?.state === 'playing' ? 'Stand and leave' : 'Leave table'}>
      <Note view={view} />
      {!mine ? (
        <p className="casino-wait">{v.mode === 'st' ? 'Watching the table.' : 'Taking your seat…'}</p>
      ) : (
        <div className="bj-felt">
          <div className="bj-row dealer">
            <span className="bj-label">
              Dealer <b>{handTotal(mine.dealer)}</b>
            </span>
            <Hand cards={mine.dealer} slots={mine.state === 'betting' ? 2 : 0} />
          </div>
          <div className="bj-row you">
            <span className="bj-label">
              You <b>{handTotal(mine.cards)}</b>
            </span>
            <Hand cards={mine.cards} size="lg" slots={mine.state === 'betting' ? 2 : 0} />
            <Stake amount={mine.state === 'betting' ? 0 : mine.bet} label="Bet" />
          </div>
          {mine.state === 'done' && mine.result && (
            <p className={`bj-result ${mine.paid > mine.bet ? 'good' : mine.paid === mine.bet ? 'even' : 'bad'}`}>
              {BJ_SAY[mine.result]} {mine.paid > mine.bet ? `+${money(mine.paid - mine.bet)}` : mine.paid === mine.bet ? '' : `−${money(mine.bet)}`}
            </p>
          )}
          {mine.state === 'dealer' && <p className="bj-result even">The dealer plays…</p>}
          <div className="table-actions">
            {canBet ? (
              <>
                <span className="bet-chips">
                  {CHIP_VALUES.map((c) => (
                    <Chip key={c} value={c} disabled={bet + c > most} onClick={() => (setBet((b) => Math.min(most, b + c)), chipSound())} />
                  ))}
                </span>
                <button className="cosy-btn" onClick={() => setBet(BJ_MIN)}>
                  Clear
                </button>
                <button className="cosy-btn primary big" disabled={most < BJ_MIN} onClick={() => casino({ k: 'bj', do: 'deal', bet: stake })}>
                  {most < BJ_MIN ? 'No money to bet' : `Deal · bet ${money(stake)}`}
                </button>
              </>
            ) : mine.state === 'playing' ? (
              <>
                <button className="cosy-btn primary big" onClick={() => casino({ k: 'bj', do: 'hit' })}>
                  Hit
                </button>
                <button className="cosy-btn big" onClick={() => casino({ k: 'bj', do: 'stand' })}>
                  Stand
                </button>
                <button className="cosy-btn big" disabled={!mine.canDouble || coins < mine.bet} onClick={() => casino({ k: 'bj', do: 'double' })} title="Double your bet, take one more card, and stand">
                  Double {money(mine.bet)}
                </button>
                <TurnTimer until={mine.until} total={45000} />
              </>
            ) : null}
          </div>
        </div>
      )}
      {others.length > 0 && (
        <ul className="table-others">
          {others.map((o) => (
            <li key={o.name}>
              <b>{o.name}</b> {o.state === 'betting' ? 'is choosing a bet' : o.state === 'done' && o.result ? `${BJ_SAY[o.result].replace(/^You win!$/, 'won').replace('!', '')}` : `${handTotal(o.cards)} against ${handTotal(o.dealer)}`}
            </li>
          ))}
        </ul>
      )}
    </TableShell>
  );
}

/** The frame both tables share: a title, the rules, and the way out. */
function TableShell({
  title,
  rules,
  onLeave,
  leaveLabel = 'Leave table',
  hint = 'Hold the right mouse button (or drag with a finger) to look around the table.',
  children,
}: {
  title: string;
  rules?: string;
  onLeave: () => void;
  leaveLabel?: string;
  hint?: string;
  children: ReactNode;
}) {
  const coins = useMoney();
  const v = useView();
  return (
    <div className="casino-table cosy-panel" role="region" aria-label={title}>
      <header>
        <h2>{title}</h2>
        {rules && <span className="table-rules">{rules}</span>}
        {v.mode === 'player' && (
          <span className="casino-purse">
            <b>{money(coins)}</b>
          </span>
        )}
        <button className="cosy-btn small" onClick={onLeave}>
          {leaveLabel}
        </button>
      </header>
      {children}
      {hint && <p className="table-hint">{hint}</p>}
    </div>
  );
}

// ---------------------------------------------------------------- Texas hold'em

const STAGE_NAMES: Record<PkView['stage'], string> = { waiting: 'Waiting', preflop: 'Before the flop', flop: 'The flop', turn: 'The turn', river: 'The river', showdown: 'Showdown' };

function Poker({ view, seat }: { view: CasinoView; seat: number }) {
  const coins = useMoney();
  const v = useView();
  const pk = view.pk;
  const s = pk.seats[seat];
  const mine = s?.mine ? s : null;
  const [buyIn, setBuyIn] = useState(Math.min(40, PK.maxBuy));
  const leave = () => {
    if (v.mode === 'player' && mine) casino({ k: 'pk', do: 'leave' });
    close();
  };
  if (s && !s.mine && v.mode === 'player') {
    return (
      <TableShell title="Texas hold’em" onLeave={close}>
        <p className="casino-wait">{s.name} is sitting there. Try another seat!</p>
      </TableShell>
    );
  }
  const maxBuy = Math.min(PK.maxBuy, coins);
  const myTurn = Boolean(mine) && pk.turn === seat;
  return (
    <TableShell
      title="Texas hold’em"
      rules={`Blinds ${money(PK.small)}/${money(PK.big)}`}
      onLeave={leave}
      leaveLabel={mine ? (mine.inHand && !mine.folded && pk.stage !== 'showdown' && pk.stage !== 'waiting' ? 'Fold and cash out' : `Cash out ${money(mine.stack)}`) : 'Leave'}
    >
      <Note view={view} />
      <div className="pk-felt">
        <div className="pk-middle">
          <Hand cards={pk.board} slots={5} />
          <span className="pk-pot">
            <Stake amount={pk.pot} label="Pot" />
            <small>{pk.stage === 'showdown' || pk.stage === 'waiting' ? pk.note : STAGE_NAMES[pk.stage]}</small>
          </span>
        </div>
        <ol className="pk-seats">
          {pk.seats.map((p, i) => (p ? <SeatChip key={i} p={p} i={i} pk={pk} /> : null))}
        </ol>
        {mine ? (
          <>
            <div className="pk-you">
              <Hand cards={mine.cards} size="lg" />
              <span className="pk-you-info">
                <MyHand cards={mine.cards} board={pk.board} folded={mine.folded} />
                <span>
                  Chips <b>{money(mine.stack)}</b>
                  {mine.bet > 0 && <> · in this round {money(mine.bet)}</>}
                </span>
              </span>
            </div>
            {mine.out ? (
              <div className="table-actions">
                <span className="casino-wait">You’re sitting out.</span>
                <button className="cosy-btn primary big" onClick={() => casino({ k: 'pk', do: 'back' })}>
                  I’m back
                </button>
              </div>
            ) : myTurn ? (
              <Betting pk={pk} me={mine} />
            ) : (
              <p className="casino-wait">{pk.stage === 'waiting' ? pk.note : !mine.inHand ? 'You’re in from the next hand.' : mine.folded ? 'Folded. Next hand soon.' : mine.allIn ? 'All in! Good luck.' : pk.turn !== null ? `${pk.seats[pk.turn]?.name ?? 'Someone'} to play…` : '…'}</p>
            )}
          </>
        ) : v.mode === 'player' ? (
          <div className="table-actions buy-in">
            <label>
              Buy in with <b>{money(Math.min(buyIn, maxBuy))}</b>
              <input type="range" min={PK.minBuy} max={Math.max(PK.minBuy, maxBuy)} step={1} value={Math.min(buyIn, Math.max(PK.minBuy, maxBuy))} onChange={(e) => setBuyIn(Number(e.target.value))} disabled={maxBuy < PK.minBuy} />
            </label>
            <button className="cosy-btn primary big" disabled={maxBuy < PK.minBuy} onClick={() => casino({ k: 'pk', do: 'sit', seat, buyIn: Math.min(buyIn, maxBuy) })}>
              {maxBuy < PK.minBuy ? `Chips start at ${money(PK.minBuy)}` : 'Sit down'}
            </button>
          </div>
        ) : (
          <p className="casino-wait">Watching the table.</p>
        )}
      </div>
    </TableShell>
  );
}

function SeatChip({ p, i, pk }: { p: PkSeatView; i: number; pk: PkView }) {
  return (
    <li className={`pk-seat ${pk.turn === i ? 'turn' : ''} ${p.folded ? 'folded' : ''} ${p.mine ? 'mine' : ''} ${p.won > 0 && pk.stage === 'showdown' ? 'won' : ''}`}>
      <span className="pk-seat-name">
        {pk.button === i && <i className="dealer-button">D</i>}
        {p.name}
      </span>
      <span className="pk-seat-stack">{p.out ? 'sitting out' : money(p.stack)}</span>
      {!p.mine && p.cards.length > 0 && <Hand cards={p.cards} size="sm" />}
      {p.last && <span className="pk-seat-last">{p.last}</span>}
      {p.hand && pk.stage === 'showdown' && !p.mine && <span className="pk-seat-hand">{p.hand}</span>}
      {pk.turn === i && <TurnTimer until={pk.until} total={PK.turnMs} />}
    </li>
  );
}

/** What you're holding, in words (once there's a board to make a hand with). */
function MyHand({ cards, board, folded }: { cards: Card[]; board: Card[]; folded: boolean }) {
  const name = useMemo(() => {
    const all = [...cards, ...board].filter(isCard);
    if (cards.length < 2) return '';
    if (all.length < 5) return cards[0][0] === cards[1][0] ? 'A pocket pair' : cards[0][1] === cards[1][1] ? 'Suited' : '';
    return bestHand(all).name;
  }, [cards.join(), board.join()]);
  if (folded) return <span className="pk-hand-name">Folded</span>;
  return name ? <span className="pk-hand-name">{name}</span> : null;
}

function Betting({ pk, me }: { pk: PkView; me: PkSeatView }) {
  const owe = Math.max(0, pk.toMatch - me.bet);
  const most = me.bet + me.stack;
  const [to, setTo] = useState(pk.minRaise);
  useEffect(() => setTo(pk.minRaise), [pk.minRaise, pk.hand, pk.stage]);
  const raiseTo = Math.max(pk.minRaise, Math.min(most, to));
  const send = (a: 'fold' | 'check' | 'call' | 'allin') => casino({ k: 'pk', do: a, hand: pk.hand });
  const potSized = (k: number) => Math.min(most, Math.max(pk.minRaise, pk.toMatch + Math.round((pk.pot + owe) * k)));
  return (
    <div className="table-actions pk-actions">
      <TurnTimer until={pk.until} total={PK.turnMs} />
      <button className="cosy-btn big" onClick={() => send('fold')}>
        Fold
      </button>
      {owe === 0 ? (
        <button className="cosy-btn primary big" onClick={() => send('check')}>
          Check
        </button>
      ) : (
        <button className="cosy-btn primary big" onClick={() => send('call')}>
          {owe >= me.stack ? `Call all in ${money(me.stack)}` : `Call ${money(owe)}`}
        </button>
      )}
      {pk.canRaise && most > pk.minRaise && (
        <span className="pk-raise">
          <input type="range" min={pk.minRaise} max={most} step={1} value={raiseTo} onChange={(e) => setTo(Number(e.target.value))} aria-label="How much to raise to" />
          <span className="pk-raise-quick">
            <button className="cosy-btn small" onClick={() => setTo(pk.minRaise)}>
              Min
            </button>
            <button className="cosy-btn small" onClick={() => setTo(potSized(0.5))}>
              ½ pot
            </button>
            <button className="cosy-btn small" onClick={() => setTo(potSized(1))}>
              Pot
            </button>
          </span>
          <button className="cosy-btn primary big" onClick={() => casino({ k: 'pk', do: 'raise', to: raiseTo, hand: pk.hand })}>
            {raiseTo >= most ? `All in ${money(most)}` : `${pk.toMatch === 0 ? 'Bet' : 'Raise to'} ${money(raiseTo)}`}
          </button>
        </span>
      )}
      {(pk.canRaise || owe < me.stack) && (
        <button className="cosy-btn big allin" onClick={() => send('allin')}>
          All in
        </button>
      )}
    </div>
  );
}

// ---------------------------------------------------------------- roulette

const RL_CHIPS = [1, 5, 10, 25];

function Roulette({ view, seat }: { view: CasinoView; seat: number }) {
  const coins = useMoney();
  const v = useView();
  const rl = view.rl;
  const s = rl.seats[seat];
  const mine = s?.mine ? s : null;
  const [chip, setChip] = useState(5);
  useEffect(() => {
    if (v.mode === 'player' && !s) casino({ k: 'rl', do: 'sit', seat });
  }, [seat, Boolean(s)]);
  const leave = () => {
    if (v.mode === 'player') casino({ k: 'rl', do: 'leave' });
    close();
  };
  if (s && !s.mine && v.mode === 'player') {
    return (
      <TableShell title="Roulette" onLeave={close}>
        <p className="casino-wait">{s.name} is sitting there. Try another seat!</p>
      </TableShell>
    );
  }
  const down = mine ? Object.values(mine.bets).reduce((a, b) => a + b, 0) : 0;
  const betting = rl.stage === 'betting' && Boolean(mine);
  const room = Math.min(RL.max, coins) - down;
  const n = rl.stage === 'result' ? (rl.spin?.n ?? null) : null;
  const others = rl.seats.filter((x): x is NonNullable<typeof x> => Boolean(x && !x.mine));
  // Everyone's chips, by cell, for the little markers on the board (yours counted apart).
  const theirs: Record<string, number> = {};
  for (const o of others) for (const [k, a] of Object.entries(o.bets)) theirs[k] = (theirs[k] ?? 0) + a;
  return (
    <TableShell title="Roulette" rules="Single zero · a number pays 35 to 1, dozens and columns 2 to 1, the rest 1 to 1" onLeave={leave}>
      <Note view={view} />
      <div className="rl-top">
        <span className="rl-history" aria-label="The last numbers">
          {rl.history.slice(-10).map((h, i) => (
            <i key={i} className={`rl-dot ${colourOf(h)}`}>
              {h}
            </i>
          ))}
        </span>
        {rl.stage === 'betting' && (
          <span className="rl-status">
            {rl.closes ? 'Bets close soon' : 'Place your bets'}
            <TurnTimer until={rl.closes} total={RL.betMs} />
          </span>
        )}
        {rl.stage === 'spinning' && <span className="rl-status">No more bets! The ball is rolling…</span>}
        {n !== null && (
          <span className={`rl-result ${colourOf(n)}`}>
            <b>{n}</b> {n === 0 ? 'Zero' : colourOf(n) === 'red' ? 'Red' : 'Black'}
          </span>
        )}
      </div>
      {mine && rl.stage === 'result' && mine.staked > 0 && (
        <p className={`bj-result ${mine.won > mine.staked ? 'good' : mine.won === mine.staked ? 'even' : 'bad'}`}>
          {mine.won > 0 ? `You won ${money(mine.won)}${mine.won > mine.staked ? ` (+${money(mine.won - mine.staked)})` : ''}` : `No luck: −${money(mine.staked)}`}
        </p>
      )}
      <div className={`rl-board ${betting ? 'open' : ''}`} role="grid" aria-label="The betting board">
        {BET_KEYS.map((key) => {
          const c = boardCell(key);
          const num = key[0] === 'n' ? Number(key.slice(1)) : null;
          const amount = mine?.bets[key] ?? 0;
          const win = n !== null && covers(key, n);
          return (
            <button
              key={key}
              className={`rl-cell ${num !== null ? colourOf(num) : key === 'red' || key === 'black' ? `${key} swatch` : 'outside'} ${win ? 'win' : ''}`}
              style={{ gridColumn: `${c.col + 1} / span ${c.w}`, gridRow: `${c.row + 1} / span ${c.h}` }}
              disabled={!betting || chip > room}
              onClick={() => (casino({ k: 'rl', do: 'bet', bet: key, amount: chip }), chipSound())}
              title={`${num !== null ? `Number ${num}` : betName(key)}: pays ${odds(key)} to 1`}
            >
              <span>{key === 'red' || key === 'black' ? '' : betName(key)}</span>
              {amount > 0 && <em className="rl-chip">{amount}</em>}
              {!amount && theirs[key] > 0 && <i className="rl-theirs" />}
            </button>
          );
        })}
      </div>
      {mine ? (
        <div className="table-actions">
          <span className="bet-chips">
            {RL_CHIPS.map((c) => (
              <button key={c} className={`${chipClass(c)} ${chip === c ? 'picked' : ''}`} onClick={() => setChip(c)} aria-pressed={chip === c} aria-label={`Bet ${money(c)} a click`}>
                {c}
              </button>
            ))}
          </span>
          <span className="rl-down">
            On the table <b>{money(down)}</b>
          </span>
          <button className="cosy-btn" disabled={!betting || !down} onClick={() => casino({ k: 'rl', do: 'clear' })}>
            Clear
          </button>
          <button className="cosy-btn primary big" disabled={!betting || !down || mine.ready} onClick={() => casino({ k: 'rl', do: 'ready' })}>
            {mine.ready ? 'Ready ✓' : 'Spin!'}
          </button>
        </div>
      ) : (
        <p className="casino-wait">{v.mode === 'st' ? 'Watching the table.' : 'Taking your seat…'}</p>
      )}
      {others.length > 0 && (
        <ul className="table-others">
          {others.map((o) => {
            const on = Object.values(o.bets).reduce((a, b) => a + b, 0);
            return (
              <li key={o.name}>
                <b>{o.name}</b> {rl.stage === 'result' && o.staked ? (o.won ? `won ${money(o.won)}` : 'lost') : on ? `${money(on)} down${o.ready ? ', ready' : ''}` : 'choosing'}
              </li>
            );
          })}
        </ul>
      )}
    </TableShell>
  );
}

// ---------------------------------------------------------------- the slot machines

/** One symbol on a reel: an emoji, or the lucky seven drawn big and red. */
const SlotSymbol = ({ i }: { i: number }) => (i === SEVEN ? <b className="sl-seven">7</b> : <span>{SYMBOLS[i]?.glyph}</span>);

/** A reel in the panel: spinning (a blur of symbols) until its moment to stop, then the symbol it stopped on. */
function SlotReel({ symbol, spinning, win }: { symbol: number | null; spinning: boolean; win: boolean }) {
  return (
    <span className={`sl-reel ${spinning ? 'spinning' : 'stopped'} ${win ? 'win' : ''}`}>
      {spinning ? (
        <span className="sl-blur" aria-hidden="true">
          {[...SYMBOLS, ...SYMBOLS].map((_, k) => (
            <SlotSymbol key={k} i={k % SYMBOLS.length} />
          ))}
        </span>
      ) : (
        <span className="sl-face" key={`${symbol}`}>
          {symbol === null ? <span>❔</span> : <SlotSymbol i={symbol} />}
        </span>
      )}
    </span>
  );
}

function Slots({ view, machine }: { view: CasinoView; machine: number }) {
  const coins = useMoney();
  const v = useView();
  const m = view.sl[machine];
  const mine = m?.mine ? m : null;
  const [bet, setBet] = useState(1);
  const [, tick] = useState(0);
  useEffect(() => {
    if (v.mode === 'player' && m && !m.name) casino({ k: 'sl', do: 'sit', seat: machine });
  }, [machine, Boolean(m?.name)]);
  const spin = m?.spin ?? null;
  const now = hostNow();
  const done = spin ? spin.at + SL.stops[2] : 0;
  // Ticking along while the reels turn (and until the next pull is allowed), so each reel stops on time.
  const busyUntil = Math.max(done, m?.readyAt ?? 0);
  useEffect(() => {
    if (busyUntil <= hostNow()) return;
    const t = setInterval(() => {
      tick((n) => n + 1);
      if (hostNow() > busyUntil + 100) clearInterval(t);
    }, 60);
    return () => clearInterval(t);
  }, [busyUntil]);
  // Our own pulls: the reels whirring and clunking to a stop, then a jingle for a win.
  const heard = useRef(spin?.no ?? 0);
  useEffect(() => {
    if (!mine || !spin || spin.no === heard.current) return;
    heard.current = spin.no;
    const left = spin.at - hostNow();
    if (left < -1000) return;
    slotReels(SL.stops.map((ms) => Math.max(0, left + ms) / 1000));
    const pays = linePays(spin.reels);
    if (pays.times > 1) {
      const t = setTimeout(() => slotWin(spin.won >= spin.bet * 100 ? 'jackpot' : pays.times >= 10 ? 'big' : 'small'), Math.max(0, left + SL.stops[2] + 120));
      return () => clearTimeout(t);
    }
    if (pays.times === 1) {
      const t = setTimeout(() => chipSound(), Math.max(0, left + SL.stops[2] + 120));
      return () => clearTimeout(t);
    }
  }, [spin?.no, Boolean(mine)]);
  const leave = () => {
    if (v.mode === 'player') casino({ k: 'sl', do: 'leave' });
    close();
  };
  if (m?.name && !m.mine && v.mode === 'player') {
    return (
      <TableShell title="Slot machine" onLeave={close} hint="">
        <p className="casino-wait">{m.name} is playing this one. Try another machine!</p>
      </TableShell>
    );
  }
  const settled = !spin || now >= done;
  const pays = spin && settled ? linePays(spin.reels) : null;
  const ready = Boolean(mine) && now >= (m?.readyAt ?? 0);
  const broke = coins < SL.bets[0];
  const stake = SL.bets.includes(bet) && bet <= coins ? bet : ([...SL.bets].reverse().find((b) => b <= coins) ?? SL.bets[0]);
  const jackpot = Boolean(spin && settled && spin.won >= spin.bet * 100);
  const pull = () => {
    if (!ready || broke) return;
    slotLever();
    casino({ k: 'sl', do: 'spin', bet: stake });
  };
  const others = view.sl.filter((x, i) => i !== machine && x.name);
  return (
    <TableShell title="🎰 Slot machine" rules="Three reels, one line · $1, $2 or $5 a pull" onLeave={leave} leaveLabel="Get up" hint="">
      <Note view={view} />
      <div className="sl-play">
        <div className={`sl-machine ${jackpot ? 'jackpot' : pays && pays.times > 1 ? 'won' : ''}`}>
          <div className="sl-window" aria-label="The reels" role="img">
            {[0, 1, 2].map((r) => (
              <SlotReel key={r} symbol={spin ? spin.reels[r] : null} spinning={Boolean(spin && now < spin.at + SL.stops[r])} win={Boolean(pays && pays.times > 1)} />
            ))}
          </div>
          <p className={`sl-result ${pays && pays.times > 1 ? 'good' : ''}`} role="status">
            {!spin || !mine
              ? 'Choose a bet and pull the lever!'
              : !settled
                ? 'Round they go…'
                : pays && pays.times > 0
                  ? `${pays.what}! ${pays.times > 1 ? `You win ${money(spin.won)}` : ''}`
                  : 'No luck this time.'}
          </p>
        </div>
        {mine ? (
          <div className="table-actions">
            <span className="bet-chips" role="radiogroup" aria-label="Your bet">
              {SL.bets.map((b) => (
                <button key={b} className={`chip c${b} ${stake === b ? 'picked' : ''}`} disabled={b > coins} onClick={() => (setBet(b), chipSound())} role="radio" aria-checked={stake === b} aria-label={`Bet ${money(b)} a pull`}>
                  {b}
                </button>
              ))}
            </span>
            <button className="cosy-btn primary big sl-pull" disabled={!ready || broke} onClick={pull}>
              {broke ? 'Not enough money' : `Pull · ${money(stake)}`}
            </button>
          </div>
        ) : (
          <p className="casino-wait">{v.mode === 'st' ? 'Watching the machine.' : 'Taking your seat…'}</p>
        )}
      </div>
      <ul className="sl-paytable" aria-label="What pays">
        {PAYTABLE.map((row, k) => (
          <li key={k} className={row.reels[0] === SEVEN && row.reels.length === 3 ? 'top' : ''}>
            <span className="sl-pay-reels">
              {row.reels.map((i, j) => (
                <SlotSymbol key={j} i={i} />
              ))}
              {row.label && <small>{row.label}</small>}
            </span>
            <b>{row.times === 1 ? 'bet back' : `×${row.times}`}</b>
          </li>
        ))}
      </ul>
      {others.length > 0 && (
        <ul className="table-others">
          {others.map((o) => (
            <li key={o.name}>
              <b>{o.name}</b> {o.spin && hostNow() >= o.spin.at + SL.stops[2] && hostNow() < o.spin.at + SL.stops[2] + 8000 && o.spin.won > o.spin.bet ? `won ${money(o.spin.won)}!` : 'is playing the slots'}
            </li>
          ))}
        </ul>
      )}
    </TableShell>
  );
}

// ---------------------------------------------------------------- sounds

/** Cards and chips as they change on the tables in view, and a little fanfare for your own wins. */
function useCasinoSounds(view: CasinoView | null) {
  const last = useRef<CasinoView | null>(null);
  const pets = useMyPets();
  const petCount = useRef(pets.length);
  const at = useHud((s) => s.casino);
  useEffect(() => {
    if (pets.length > petCount.current) tillSound();
    petCount.current = pets.length;
  }, [pets.length]);
  useEffect(() => {
    const was = last.current;
    last.current = view;
    // (The slot machine's panel makes its own.)
    if (!view || !was || !at || at.kind === 'shop' || at.kind === 'slots') return;
    if (at.kind === 'roulette') {
      const rl = view.rl;
      const me = rl?.seats.find((s) => s?.mine);
      if (rl?.spin && rl.stage === 'spinning' && was.rl?.stage !== 'spinning') rouletteSpin(Math.max(1, (rl.spin.until - hostNow()) / 1000));
      if (rl?.stage === 'result' && was.rl?.stage !== 'result' && me?.staked) {
        if (me.won > me.staked) casinoWin(me.won >= me.staked * 5);
        else if (me.won < me.staked) casinoLose();
        else chipSound();
      }
      return;
    }
    const cards = (v: CasinoView) =>
      (at.kind === 'blackjack' ? v.bj.reduce((n, s) => n + (s ? s.cards.length + s.dealer.filter((c) => c !== HIDDEN).length : 0), 0) : v.pk.board.length + v.pk.seats.reduce((n, s) => n + (s?.cards.length ?? 0), 0));
    const dealt = cards(view) - cards(was);
    if (dealt > 0) cardSound(dealt);
    if (at.kind === 'blackjack') {
      const me = view.bj.find((s) => s?.mine);
      const before = was.bj.find((s) => s?.mine);
      if (me && before && me.state === 'done' && before.state !== 'done') {
        if (me.paid > me.bet) setTimeout(() => casinoWin(me.result === 'blackjack'), 250);
        else if (me.paid < me.bet) setTimeout(casinoLose, 250);
        else setTimeout(() => chipSound(), 250);
      } else if (me && before && me.state !== 'betting' && before.state !== me.state && me.state === 'playing') chipSound();
    } else {
      const bets = (v: CasinoView) => v.pk.seats.reduce((n, s) => n + (s?.bet ?? 0), 0);
      if (bets(view) > bets(was)) chipSound();
      const me = view.pk.seats.find((s) => s?.mine);
      const before = was.pk.seats.find((s) => s?.mine);
      if (view.pk.stage === 'showdown' && was.pk.stage !== 'showdown') {
        if (me && me.won > 0) setTimeout(() => casinoWin(me.won >= 20), 200);
        else if (me && before?.inHand && !me.folded) setTimeout(casinoLose, 200);
        else setTimeout(() => chipSound(true), 200);
      }
    }
  }, [view, at]);
}
