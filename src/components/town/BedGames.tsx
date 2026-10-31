import { game, useHud } from '../../game/hud';
import { money, PAY } from '../../game/profiles';
import { JOB_TITLES, JobIcon } from '../../jobs';
import { GAME_JOBS } from '../../jobs/meta';
import { useKeys } from '../../jobs/shared';
import { useClient } from '../../net/client';

/**
 * In bed at night, "Pass the time": any of the town's minigames, played lying down. They pay as they do by day, toward
 * the same day's limit. A wake, the hooded figure or dawn closes whatever is open (the world sees to that).
 */
export function BedGames() {
  const paid = useClient((s) => s.priv?.profile?.jobPaid ?? 0);
  const tops = useClient((s) => s.priv?.profile?.jobTops ?? []);
  const close = () => useHud.setState({ bedMenu: false });
  useKeys((e, down) => {
    if (e.key !== 'Escape') return false;
    if (down) close();
    return true;
  });
  const left = Math.max(0, PAY.jobDaily - paid);
  return (
    <div className="job-dock cosy" role="dialog" aria-label="Pass the time">
      <div className="job-panel cosy-panel bed-games">
        <header className="job-head">
          <span className="job-icon" aria-hidden="true">
            🌙
          </span>
          <div className="job-titles">
            <strong>Pass the time</strong>
            <span className="job-hint">
              {money(PAY.job)} for three stars (once a day each), {money(PAY.jobTwo)} for two
              {left > 0 ? ` · ${money(left)} more to earn today` : ' · that’s all the pay for today, but play on for fun'}
            </span>
          </div>
          <button className="cosy-btn small job-stop" onClick={close}>
            Close <span className="cosy-key">Esc</span>
          </button>
        </header>
        <div className="bed-games-grid">
          {GAME_JOBS.map((job) => (
            <button key={job} className="bed-game cosy-btn" onClick={() => game.bedGame(job)}>
              <span className="bed-game-art" aria-hidden="true">
                <JobIcon job={job} />
              </span>
              <span>{JOB_TITLES[job]}</span>
              {tops.includes(job) && <em className="bed-game-done" title="Top prize already won today: back tomorrow">★ won today</em>}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
