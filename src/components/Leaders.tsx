import { useLeaders } from '../game/leaders';
import { money, nameKey } from '../game/profiles';
import { shownName, useNicks } from '../state/nicks';
import type { LeaderRow } from '../state/types';
import { useView } from '../state/view';
import { Modal } from './Modal';

const MEDALS = ['🥇', '🥈', '🥉'];

/**
 * The leaderboard on the tavern wall: the richest players, the most games won, the most achievements and the pet
 * pit's champions, from everyone's profile (the Storyteller's browser keeps them and sends the board round). Names as
 * the players write them, or as this player has nicknamed them.
 */
export function LeadersModal() {
  const view = useView();
  const board = useLeaders(view.mode === 'st' ? 'st' : 'player');
  const nicks = useNicks();
  const me = view.seats.find((s) => s.isMe);
  const mine = me ? nameKey(me.name) : null;
  const list = (title: string, rows: LeaderRow[] | undefined, show: (n: number) => string) => (
    <section className="leaders-list">
      <h3>{title}</h3>
      {rows?.length ? (
        <ol>
          {rows.map((r, i) => (
            <li key={r.name} className={nameKey(r.name) === mine ? 'me' : ''}>
              <span className="leaders-rank">{MEDALS[i] ?? i + 1}</span>
              <span className="leaders-name">{shownName(r.name, 'Someone', nicks)}</span>
              <span className="leaders-n">{show(r.n)}</span>
            </li>
          ))}
        </ol>
      ) : (
        <p className="leaders-empty">Nobody yet.</p>
      )}
    </section>
  );
  return (
    <Modal title="The leaderboard" eyebrow="The Raven’s Rest" size="md" className="leaders-modal">
      {!board && view.mode === 'player' ? (
        <p className="letter-blurb">The board’s blank: the Storyteller’s page is out of date. Ask them to reload it.</p>
      ) : (
        <div className="leaders-grid">
          {list('💰 Richest', board?.rich, money)}
          {list('🏆 Most games won', board?.wins, (n) => `${n} ${n === 1 ? 'win' : 'wins'}`)}
          {list('🎖️ Most achievements', board?.feats, (n) => String(n))}
          {list('🐾 Pet pit champions', board?.pit, (n) => `${n} ${n === 1 ? 'win' : 'wins'}`)}
        </div>
      )}
    </Modal>
  );
}
