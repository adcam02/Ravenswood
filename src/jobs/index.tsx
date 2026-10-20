import { useCallback, useEffect, useRef, useState, type ComponentType, type ReactNode } from 'react';
import type { BakeKind, ClothKind, DrinkKind, FlowerKind } from '../world/types';
import { Bartender, DrinkIcon } from './Bartender';
import { Laundry, ClothArt } from './Laundry';
import { Fishing, FishArt, type FishResult, type FishTier } from './Fishing';
import { Baking, BakeArt } from './Baking';
import { Gardening, FlowerArt } from './Gardening';
import { Darts, DartsArt } from './Darts';
import { Bread, BreadArt } from './Bread';
import { Wine, ChaliceArt } from './Wine';
import { Firewood, LogArt } from './Firewood';
import { Skimming, StoneArt } from './Skimming';
import { Coin, CoinArt } from './Coin';
import { Stars, useKeys, type GameProps, type Summary } from './shared';
import { sfx } from './sfx';

export { setJobsMuted } from './sfx';
export { DrinkIcon, ClothArt, FishArt, BakeArt, FlowerArt, DartsArt, BreadArt, ChaliceArt, LogArt, StoneArt, CoinArt };
export type { FishTier };

export type GameJob = 'bartender' | 'laundry' | 'fishing' | 'baking' | 'gardening' | 'darts' | 'bread' | 'wine' | 'firewood' | 'skimming' | 'coin';

export interface JobResults {
  bartender: { kind: DrinkKind; stars: number };
  laundry: { kind: ClothKind; color: string; stars: number };
  /** null when it got away or the line snapped. */
  fishing: { kind: string; cm: number; stars: number; tier: FishTier } | null;
  baking: { kind: BakeKind; stars: number };
  gardening: { kind: FlowerKind; color: string; stars: number };
  darts: { score: number; stars: number };
  /** evenness 0..100 */
  bread: { evenness: number; stars: number };
  /** fill 0..100, what ended up in the chalice */
  wine: { fill: number; stars: number };
  /** clean splits out of 5 */
  firewood: { logs: number; stars: number };
  skimming: { bounces: number; stars: number };
  /** landed in the well → a one-line fortune */
  coin: { wish: boolean; stars: number; fortune: string };
}

/** The number that counts for records, per game. */
export const SCORE_OF: { [J in GameJob]: (r: NonNullable<JobResults[J]>) => number } = {
  bartender: (r) => r.stars,
  laundry: (r) => r.stars,
  fishing: (r) => r.cm,
  baking: (r) => r.stars,
  gardening: (r) => r.stars,
  darts: (r) => r.score,
  bread: (r) => r.evenness,
  wine: (r) => r.fill,
  firewood: (r) => r.logs,
  skimming: (r) => r.bounces,
  coin: (r) => (r.wish ? 1 : 0),
};

const starsLabel = (s: number) => `${s} star${s === 1 ? '' : 's'}`;

/** "42cm", "120 points", "87% even", "4 skips"… */
export const SCORE_LABEL: Record<GameJob, (score: number) => string> = {
  bartender: starsLabel,
  laundry: starsLabel,
  fishing: (s) => `${s}cm`,
  baking: starsLabel,
  gardening: starsLabel,
  darts: (s) => `${s} points`,
  bread: (s) => `${s}% even`,
  wine: (s) => `${s}% full`,
  firewood: (s) => `${s} of 5 logs`,
  skimming: (s) => `${s} skip${s === 1 ? '' : 's'}`,
  coin: (s) => (s ? 'a wish' : 'no wish'),
};

export const JOB_TITLES: Record<GameJob, string> = {
  bartender: 'Bartending',
  laundry: 'Laundry',
  fishing: 'Fishing',
  baking: 'Baking',
  gardening: 'Gardening',
  darts: 'Darts',
  bread: 'Breaking bread',
  wine: 'Pouring the wine',
  firewood: 'Chopping wood',
  skimming: 'Stone skimming',
  coin: 'Wishing well',
};

const FIRST_HINT: Record<GameJob, string> = {
  bartender: 'What are you pouring?',
  laundry: 'Scrub every bit of mud off.',
  fishing: 'Pick a lure.',
  baking: 'What are you baking today?',
  gardening: 'Which flower will you plant?',
  darts: 'Three darts. Press when the sight is on something good.',
  bread: 'Cut the loaf in half. Press when the knife is in the middle.',
  wine: 'Hold to pour when the chalice is under the jug. Fill it to the line.',
  firewood: 'Press when the mark is on the centre line.',
  skimming: 'Press to lock the angle. Low and flat is best.',
  coin: 'Press to toss when the ring is over the well.',
};

const GAMES: { [J in GameJob]: ComponentType<GameProps<JobResults[J]>> } = {
  bartender: Bartender,
  laundry: Laundry,
  fishing: Fishing,
  baking: Baking,
  gardening: Gardening,
  darts: Darts,
  bread: Bread,
  wine: Wine,
  firewood: Firewood,
  skimming: Skimming,
  coin: Coin,
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
    case 'darts':
      return <DartsArt size={34} />;
    case 'bread':
      return <BreadArt size={36} />;
    case 'wine':
      return <ChaliceArt size={34} />;
    case 'firewood':
      return <LogArt size={36} />;
    case 'skimming':
      return <StoneArt size={36} />;
    case 'coin':
      return <CoinArt size={34} />;
  }
}

const TITLES = ['Oops!', 'Not bad!', 'Nice!', 'Perfect!'];

/** What to beat: your own best and the town's, in the game's score. */
export interface Bests {
  personal?: number;
  town?: { by: string; score: number };
}

interface Shown {
  summary: Summary;
  records: string[];
  rarity: 'rare' | 'legendary' | null;
  celebrate: boolean;
}

const CONFETTI = ['#e8504a', '#f2c14e', '#5bbf6a', '#4f8fe0', '#d85ab0', '#ff9a62', '#fff'];

function Confetti({ big }: { big: boolean }) {
  const n = big ? 40 : 24;
  return (
    <div className="job-confetti" aria-hidden="true">
      {Array.from({ length: n }, (_, i) => {
        const a = (i / n) * Math.PI * 2 + (i % 3) * 0.35;
        const d = 60 + ((i * 37) % 70) + (big ? 40 : 0);
        return (
          <i
            key={i}
            style={{
              ['--x' as string]: `${Math.cos(a) * d}px`,
              ['--y' as string]: `${Math.sin(a) * d * 0.6 - 50}px`,
              ['--r' as string]: `${(i * 97) % 360}deg`,
              ['--c' as string]: CONFETTI[i % CONFETTI.length],
              animationDelay: `${(i % 6) * 0.03}s`,
            }}
          />
        );
      })}
    </div>
  );
}

/**
 * A job's minigame, docked along the bottom of the screen so the town stays in view. It reports the
 * result through onDone after showing it for a moment, or onCancel if the player stops (Esc).
 * Pass `bests` to have it call out a new personal best or town record.
 */
export function JobGame<J extends GameJob>({
  job,
  bests,
  onDone,
  onCancel,
}: {
  job: J;
  bests?: Bests;
  onDone: (r: JobResults[J]) => void;
  onCancel: () => void;
}) {
  const [hint, setHint] = useState(FIRST_HINT[job]);
  const [shown, setShown] = useState<Shown | null>(null);
  const done = useRef(false);
  const doneFn = useRef(onDone);
  doneFn.current = onDone;
  const cancelFn = useRef(onCancel);
  cancelFn.current = onCancel;
  const bestsRef = useRef(bests);
  bestsRef.current = bests;
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => void (timer.current && clearTimeout(timer.current)), []);

  const finish = useCallback(
    (r: JobResults[J], s: Summary) => {
      if (done.current) return;
      done.current = true;
      const score = r == null ? null : SCORE_OF[job](r as never);
      const b = bestsRef.current;
      const records: string[] = [];
      if (score != null && score > 0) {
        if (b?.town && score > b.town.score) records.push(`New town record! (was ${b.town.by}'s ${SCORE_LABEL[job](b.town.score)})`);
        if (b?.personal != null && score > b.personal) records.push('New personal best!');
      }
      const tier = job === 'fishing' && r ? (r as FishResult).tier : null;
      const rarity = tier === 'rare' || tier === 'legendary' ? tier : null;
      const celebrate = records.length > 0 || tier === 'legendary';
      setShown({ summary: s, records, rarity, celebrate });
      if (celebrate) sfx.fanfare();
      else if (rarity) {
        sfx.success();
        sfx.shimmer();
      } else if (s.stars >= 3) sfx.success();
      else if (s.stars === 2) sfx.okay();
      else if (s.stars === 0) sfx.fail();
      else sfx.ding();
      timer.current = setTimeout(() => doneFn.current(r), celebrate ? 2600 : 1400);
    },
    [job],
  );

  useKeys((e, down) => {
    if (e.key !== 'Escape') return false;
    if (down && !done.current) cancelFn.current();
    return true;
  });

  const Game = GAMES[job] as ComponentType<GameProps<JobResults[J]>>;
  const result = shown?.summary;

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
        {shown && result && (
          <div className={`job-result stars-${result.stars} ${shown.celebrate ? 'is-celebrate' : ''} ${shown.rarity ? `is-${shown.rarity}` : ''}`}>
            {shown.celebrate && <Confetti big={shown.rarity === 'legendary' || shown.records.some((l) => l.startsWith('New town'))} />}
            <div className="job-result-card">
              {shown.rarity && <span className={`job-rarity ${shown.rarity}`}>{shown.rarity === 'rare' ? '✨ RARE' : '🌙 LEGENDARY'}</span>}
              {result.art && <div className="job-result-art">{result.art}</div>}
              <strong className="job-result-title">{result.title ?? TITLES[Math.max(0, Math.min(3, result.stars))]}</strong>
              <Stars n={result.stars} />
              <p>{result.line}</p>
              {shown.records.map((line) => (
                <em key={line} className="job-record">
                  {line}
                </em>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
