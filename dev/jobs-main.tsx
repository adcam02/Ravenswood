/** A test page for the job minigames: `npx vite`, then open /dev/jobs.html (add ?job=darts to open one straight away, &nobests to hide the records). */
import { StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource/fredoka/400.css';
import '@fontsource/fredoka/500.css';
import '@fontsource/fredoka/600.css';
import '@fontsource/fredoka/700.css';
import '../src/styles/cosy.css';
import '../src/styles/jobs.css';
import { JOB_TITLES, JobGame, type Bests, type GameJob } from '../src/jobs';

declare global {
  interface Window {
    __jobs: {
      open: (job: GameJob, bests?: Bests | null) => void;
      results: unknown[];
      cancelled: number;
    };
  }
}

/** Sample records to beat, so the result screens can show a personal best and a town record. */
const BESTS: Record<GameJob, Bests> = {
  bartender: { personal: 2, town: { by: 'Abbey', score: 3 } },
  laundry: { personal: 2, town: { by: 'Colter', score: 3 } },
  fishing: { personal: 38, town: { by: 'Abbey', score: 62 } },
  baking: { personal: 1, town: { by: 'Steele', score: 3 } },
  gardening: { personal: 2, town: { by: 'Jarrod', score: 3 } },
  darts: { personal: 80, town: { by: 'Colter', score: 120 } },
  bread: { personal: 85, town: { by: 'Steele', score: 92 } },
  wine: { personal: 70, town: { by: 'Jarrod', score: 90 } },
  firewood: { personal: 3, town: { by: 'Mika', score: 4 } },
  skimming: { personal: 4, town: { by: 'Theo', score: 6 } },
  coin: { personal: 0 },
  clock: { personal: 72, town: { by: 'Mika', score: 84 } },
};

const results: unknown[] = [];
let cancelled = 0;
const params = new URLSearchParams(location.search);

function Harness() {
  const [job, setJob] = useState<GameJob | null>(null);
  const [bests, setBests] = useState<Bests | undefined>(undefined);
  const [log, setLog] = useState<string[]>([]);
  const open = (j: GameJob, b?: Bests | null) => {
    setBests(b === null ? undefined : (b ?? (params.has('nobests') ? undefined : BESTS[j])));
    setJob(j);
  };
  window.__jobs = { open, results, cancelled };
  useEffect(() => {
    const j = params.get('job') as GameJob | null;
    if (j && j in JOB_TITLES) open(j);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div
      className="cosy"
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(#9fd3ea, #b9e2a8 55%, #8cc27a)',
        padding: 16,
        boxSizing: 'border-box',
      }}
    >
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {(Object.keys(JOB_TITLES) as GameJob[]).map((j) => (
          <button key={j} className="cosy-btn" data-job={j} onClick={() => open(j)}>
            {JOB_TITLES[j]}
          </button>
        ))}
      </div>
      <pre style={{ fontSize: 12 }}>{log.join('\n')}</pre>
      {job && (
        <JobGame
          key={job + log.length}
          job={job}
          bests={bests}
          onDone={(r) => {
            results.push(r);
            setLog((l) => [...l, `${job}: ${JSON.stringify(r)}`]);
            setJob(null);
          }}
          onCancel={() => {
            cancelled += 1;
            window.__jobs.cancelled = cancelled;
            setLog((l) => [...l, `${job}: cancelled`]);
            setJob(null);
          }}
        />
      )}
    </div>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Harness />
  </StrictMode>,
);
