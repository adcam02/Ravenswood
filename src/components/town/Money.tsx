import { useEffect, useRef, useState } from 'react';
import { money } from '../../game/profiles';
import { useMoney, usePay } from '../../game/progress';
import { useClient } from '../../net/client';
import type { PayLine } from '../../state/types';

/** Money that's already had its pop this visit. */
const popped = new Set<string>();

/**
 * The player's money, small but clear beside the place name, with a little "+$25 for the win" for each change as it
 * comes in (several at once, at the end of a game, follow each other down).
 */
export function MoneyPill() {
  const coins = useMoney();
  const pay = usePay((s) => s.pay);
  const offset = useClient((s) => s.clockOffset);
  const [pops, setPops] = useState<(PayLine & { delay: number })[]>([]);
  const [spin, setSpin] = useState(0);
  const was = useRef(coins);
  useEffect(() => {
    // (Only what's just happened: not what came before a reload.)
    const now = Date.now() + offset;
    const fresh = pay.filter((l) => !popped.has(l.id) && now - l.at < 30000);
    for (const l of pay) popped.add(l.id);
    if (!fresh.length) return;
    setPops((list) => [...list, ...fresh.map((l, i) => ({ ...l, delay: i * 0.45 }))].slice(-5));
    fresh.forEach((l, i) => setTimeout(() => setPops((list) => list.filter((x) => x.id !== l.id)), 4400 + i * 450));
  }, [pay, offset]);
  useEffect(() => {
    if (coins === was.current) return;
    was.current = coins;
    setSpin((n) => n + 1);
  }, [coins]);
  return (
    <span className="money-pill" title="Your money, earned by playing and kept by the Storyteller under your name">
      <span key={spin} className="money-coin" aria-hidden="true" />
      <b>{money(coins)}</b>
      {pops.length > 0 && (
        <span className="money-pops" role="status">
          {pops.map((l) => (
            <span key={l.id} className={`money-pop ${l.amount < 0 ? 'out' : ''}`} style={{ animationDelay: `${l.delay}s` }}>
              {l.amount > 0 ? '+' : ''}
              {money(l.amount)} {l.why}
            </span>
          ))}
        </span>
      )}
    </span>
  );
}

/** At the end of a game, on the victory card: what it paid (everything since the game was called). */
export function GamePay({ since }: { since: number }) {
  const pay = usePay((s) => s.pay);
  const total = pay.filter((l) => l.at >= since - 2000).reduce((sum, l) => sum + l.amount, 0);
  if (!total) return null;
  return (
    <p className="victory-pay">
      <span className="money-coin" aria-hidden="true" /> {total > 0 ? `You earned ${money(total)}` : `${money(total)} this game`}
    </p>
  );
}
