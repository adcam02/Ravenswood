import { useCallback, useEffect, useRef, useState, type ComponentType, type ReactNode } from 'react';
import type { BakeKind, ClothKind, DrinkKind, FlowerKind } from '../world/types';
import { Bartender, DrinkIcon } from './Bartender';
import { Laundry, ClothArt } from './Laundry';
import { Fishing, FishArt } from './Fishing';
import { Baking, BakeArt } from './Baking';
import { Gardening, FlowerArt } from './Gardening';
import { Stars, useKeys, type GameProps, type Summary } from './shared';
import { sfx } from './sfx';

export { setJobsMuted } from './sfx';
export { DrinkIcon, ClothArt, FishArt, BakeArt, FlowerArt };

export type GameJob = 'bartender' | 'laundry' | 'fishing' | 'baking' | 'gardening';

export interface JobResults {
  bartender: { kind: DrinkKind; stars: number };
  laundry: { kind: ClothKind; color: string; stars: number };
  /** null when it got away. */
  fishing: { kind: string; cm: number; stars: number } | null;
  baking: { kind: BakeKind; stars: number };
  gardening: { kind: FlowerKind; color: string; stars: number };
}

export const JOB_TITLES: Record<GameJob, string> = {
  bartender: 'Bartending',
  laundry: 'Laundry',
  fishing: 'Fishing',
  baking: 'Baking',
  gardening: 'Gardening',
};

const FIRST_HINT: Record<GameJob, string> = {
  bartender: 'What are you pouring?',
  laundry: 'Scrub every bit of mud off.',
  fishing: 'Tap the water or press Space to cast.',
  baking: 'What are you baking today?',
  gardening: 'Which flower will you plant?',
};

const GAMES: { [J in GameJob]: ComponentType<GameProps<JobResults[J]>> } = {
  bartender: Bartender,
  laundry: Laundry,
  fishing: Fishing,
  baking: Baking,
  gardening: Gardening,
};

function JobIcon({ job }: { job: GameJob }): ReactNode {
  switch (job) {
    case 'bartender':
      return <DrinkIcon kind="ale" size={34} />;
    case 'laundry':
      return <ClothArt kind="shirt" color="#6fb0e0" size={34} />;
    case 'fishing':
      return <FishArt kind="Trout" size={38} />;
    case 'baking':
      return <BakeArt kind="loaf" size={38} />;
    case 'gardening':
      return <FlowerArt kind="tulip" color="#e8505b" size={34} />;
  }
}

const TITLES = ['Oops!', 'Not bad!', 'Nice!', 'Perfect!'];

/**
 * A job's minigame, docked along the bottom of the screen so the town stays in view. It reports the
 * result through onDone after showing it for a moment, or onCancel if the player stops (Esc).
 */
export function JobGame<J extends GameJob>({ job, onDone, onCancel }: { job: J; onDone: (r: JobResults[J]) => void; onCancel: () => void }) {
  const [hint, setHint] = useState(FIRST_HINT[job]);
  const [result, setResult] = useState<Summary | null>(null);
  const done = useRef(false);
  const doneFn = useRef(onDone);
  doneFn.current = onDone;
  const cancelFn = useRef(onCancel);
  cancelFn.current = onCancel;
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => void (timer.current && clearTimeout(timer.current)), []);

  const finish = useCallback((r: JobResults[J], s: Summary) => {
    if (done.current) return;
    done.current = true;
    setResult(s);
    if (s.stars >= 3) sfx.success();
    else if (s.stars === 2) sfx.okay();
    else if (s.stars === 0) sfx.fail();
    else sfx.ding();
    timer.current = setTimeout(() => doneFn.current(r), 1500);
  }, []);

  useKeys((e, down) => {
    if (e.key !== 'Escape') return false;
    if (down && !done.current) cancelFn.current();
    return true;
  });

  const Game = GAMES[job] as ComponentType<GameProps<JobResults[J]>>;

  return (
    <div className="job-dock cosy" role="dialog" aria-label={JOB_TITLES[job]}>
      <div className={`job-panel cosy-panel job-${job}`}>
        <header className="job-head">
          <span className="job-icon">
            <JobIcon job={job} />
          </span>
          <div className="job-titles">
            <strong>{JOB_TITLES[job]}</strong>
            <span className="job-hint" aria-live="polite">
              {hint}
            </span>
          </div>
          <button className="cosy-btn small job-stop" onClick={() => !done.current && cancelFn.current()} disabled={Boolean(result)}>
            Stop <span className="cosy-key">Esc</span>
          </button>
        </header>
        <div className="job-body">
          <Game finish={finish} setHint={setHint} />
        </div>
        {result && (
          <div className={`job-result stars-${result.stars}`}>
            <div className="job-result-card">
              {result.art && <div className="job-result-art">{result.art}</div>}
              <strong className="job-result-title">{result.title ?? TITLES[Math.max(0, Math.min(3, result.stars))]}</strong>
              <Stars n={result.stars} />
              <p>{result.line}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
