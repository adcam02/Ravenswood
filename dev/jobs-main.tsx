/** A test page for the job minigames: `npx vite`, then open /dev/jobs.html. */
import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource/fredoka/400.css';
import '@fontsource/fredoka/500.css';
import '@fontsource/fredoka/600.css';
import '@fontsource/fredoka/700.css';
import '../src/styles/cosy.css';
import '../src/styles/jobs.css';
import { JOB_TITLES, JobGame, type GameJob } from '../src/jobs';

declare global {
  interface Window {
    __jobs: { open: (job: GameJob) => void; results: unknown[]; cancelled: number };
  }
}

const results: unknown[] = [];
let cancelled = 0;

function Harness() {
  const [job, setJob] = useState<GameJob | null>(null);
  const [log, setLog] = useState<string[]>([]);
  window.__jobs = { open: setJob, results, cancelled };
  return (
    <div
      className="cosy"
      style={{ minHeight: '100vh', background: 'linear-gradient(#9fd3ea, #b9e2a8 55%, #8cc27a)', padding: 16, boxSizing: 'border-box' }}
    >
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {(Object.keys(JOB_TITLES) as GameJob[]).map((j) => (
          <button key={j} className="cosy-btn" data-job={j} onClick={() => setJob(j)}>
            {JOB_TITLES[j]}
          </button>
        ))}
      </div>
      <pre style={{ fontSize: 12 }}>{log.join('\n')}</pre>
      {job && (
        <JobGame
          key={job + log.length}
          job={job}
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
