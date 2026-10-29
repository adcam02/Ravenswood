import { composition, TEAM_LABEL, TEAM_SINGULAR } from '../data';
import { useView } from '../state/view';

const TEAMS = ['townsfolk', 'outsider', 'minion', 'demon'] as const;

/**
 * How many of each kind of character a game this size has, by the rules' table (Travellers don't count). Only the
 * standard numbers: anything that changes them (a Baron's extra Outsiders) stays the Storyteller's secret.
 */
export function TeamCounts({ className = '' }: { className?: string }) {
  const view = useView();
  const players = view.seats.filter((s) => !s.traveller).length;
  const c = composition(players);
  if (!c) return null;
  const words = TEAMS.map((t) => `${c[t]} ${c[t] === 1 ? TEAM_SINGULAR[t] : TEAM_LABEL[t]}`);
  return (
    <span
      className={`team-counts ${className}`}
      title={`A ${players}-player game usually has ${words.join(', ')} (setup characters can change it)`}
      aria-label={`${players} players: ${words.join(', ')}`}
    >
      <span className="tc-players">{players}p</span>
      {TEAMS.map((t) => (
        <span key={t} className={`tc tc-${t} ${c[t] ? '' : 'none'}`}>
          <b>{c[t]}</b> {c[t] === 1 ? TEAM_SINGULAR[t] : TEAM_LABEL[t]}
        </span>
      ))}
    </span>
  );
}
