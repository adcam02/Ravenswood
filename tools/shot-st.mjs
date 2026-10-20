// Screenshots of the Storyteller's view on its own, with the grimoire closed and open.
// `node tools/shot-st.mjs [out-dir]`
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { chromium } from 'playwright';

const OUT = process.argv[2] || 'test-results/st';
mkdirSync(OUT, { recursive: true });
const PORT = 5193;
const vite = spawn('npx', ['vite', '--port', String(PORT), '--strictPort'], { stdio: 'ignore' });
const end = Date.now() + 30000;
while (Date.now() < end) {
  try {
    if ((await fetch(`http://localhost:${PORT}/`)).ok) break;
  } catch {
    /* not yet */
  }
  await new Promise((r) => setTimeout(r, 300));
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
await page.goto(`http://localhost:${PORT}/?st&nopeer&nomesh&fx=low&fps=12`);
await page.waitForFunction(() => window.__engine && window.__hud?.getState().ready, null, { timeout: 90000 });
await sleep(1500);
await page.screenshot({ path: `${OUT}/st-town.png` });
await page.keyboard.press('Tab');
await sleep(350);
await page.screenshot({ path: `${OUT}/st-swoop.png` });
await sleep(1800);
await page.screenshot({ path: `${OUT}/st-reading.png` });
await page.keyboard.press('Tab');
await sleep(1500);
await page.screenshot({ path: `${OUT}/st-closed.png` });
if (errors.length) console.log('Errors:', [...new Set(errors)].join('\n'));
await browser.close();
vite.kill();
