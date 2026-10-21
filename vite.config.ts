import { existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Each build names its scripts afresh, and a page left open from before a deploy still asks for its own (old)
 * files the first time it opens a dialog or a minigame. So the last few deploys' files stay alongside the new
 * ones, listed in assets/deploys.json, and only older ones are cleared away.
 */
function keepRecentDeploys(keep: number): Plugin {
  let assets = '';
  let listPath = '';
  return {
    name: 'keep-recent-deploys',
    apply: 'build',
    // Wherever this build is going (docs/ for the site, or a scratch folder with --outDir).
    configResolved(config) {
      assets = join(config.build.outDir, 'assets');
      listPath = join(assets, 'deploys.json');
    },
    writeBundle(_, bundle) {
      const files = Object.keys(bundle)
        .filter((f) => f.startsWith('assets/'))
        .map((f) => f.slice('assets/'.length))
        .sort();
      const past: { at: string; files: string[] }[] = existsSync(listPath) ? JSON.parse(readFileSync(listPath, 'utf8')).deploys : [];
      // Building the same thing twice doesn't use up a place in the list.
      const fresh = past[0]?.files.join() !== files.join();
      const deploys = fresh ? [{ at: new Date().toISOString(), files }, ...past].slice(0, keep) : past;
      const kept = new Set(deploys.flatMap((d) => d.files));
      for (const d of past) for (const f of d.files) if (!kept.has(f)) rmSync(join(assets, f), { force: true });
      writeFileSync(listPath, `${JSON.stringify({ deploys }, null, 1)}\n`);
    },
  };
}

// The built site goes to docs/, which GitHub Pages serves.
export default defineConfig({
  base: './',
  define: {
    __BUILD__: JSON.stringify(new Date().toISOString()),
  },
  plugins: [react(), keepRecentDeploys(15)],
  build: {
    outDir: 'docs',
    // Not emptied: keepRecentDeploys clears out old files itself.
    emptyOutDir: false,
    chunkSizeWarningLimit: 1200,
  },
});
