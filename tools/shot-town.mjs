// Screenshots of the town on its own, from dev/town.html. `node tools/shot-town.mjs [out-dir]`.
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { chromium } from 'playwright';

const OUT = process.argv[2] || 'test-results/town';
mkdirSync(OUT, { recursive: true });
const PORT = 5192;
const vite = spawn('npx', ['vite', '--port', String(PORT), '--strictPort'], { stdio: 'ignore' });
const end = Date.now() + 30000;
while (Date.now() < end) {
  try {
    if ((await fetch(`http://localhost:${PORT}/dev/town.html`)).ok) break;
  } catch {
    /* not yet */
  }
  await new Promise((r) => setTimeout(r, 300));
}

const ALL = {
  'overview-day': 'wide&t=0&z=4',
  'overview-night': 'wide&t=1&z=4',
  'square-day': 'x=0&z=6&t=0&meeting',
  'square-night': 'x=0&z=6&t=1&bell',
  'tavern-front': 'x=-24&z=2&t=0&yaw=-0.6',
  'pond-dock': 'x=20&z=20&t=0',
  'washhouse': 'x=-19&z=23&t=0',
  'flower-bed': 'x=13&z=-13&t=0&dist=11',
  'cottages-night': 'x=0&z=42&t=1&dist=22',
  'tavern-inside': 'zone=tavern&t=0',
  'bakery-inside': 'zone=bakery&t=0',
  'church-inside': 'zone=church&t=0',
  'house-inside': 'zone=house&t=1',
  well: 'x=-7.5&z=-16&t=0&dist=10',
  graveyard: 'x=-8.75&z=-30&t=0&dist=14',
  'tower-top': 'x=0&z=4&t=0&dist=30&pitch=0.35',
};

const views = process.env.VIEWS ? Object.fromEntries(process.env.VIEWS.split(',').map((k) => [k, ALL[k]])) : ALL;
const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
for (const [name, qs] of Object.entries(views)) {
  await page.goto(`http://localhost:${PORT}/dev/town.html?${qs}`);
  try {
    await page.waitForFunction(() => window.done, null, { timeout: 60000 });
  } catch {
    console.log('timed out on', name);
  }
  const info = await page.evaluate(() => window.info);
  await page.screenshot({ path: `${OUT}/${name}.png` });
  console.log(name, JSON.stringify(info));
}
if (errors.length) console.log('Errors:', [...new Set(errors)].join('\n'));
await browser.close();
vite.kill();
