// Screenshots of the town on its own, from dev/town.html. `node tools/shot-town.mjs [out-dir]`.
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { chromium } from 'playwright';

const OUT = process.argv[2] || 'test-results/town';
mkdirSync(OUT, { recursive: true });
const PORT = 5192;
const vite = spawn('npx', ['vite', '--port', String(PORT), '--strictPort'], { stdio: 'ignore', detached: true });
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
  'overview-day': 'wide&t=0&z=4&dist=70',
  'overview-night': 'wide&t=1&z=4&dist=70',
  'square-day': 'x=0&z=6&t=0&meeting',
  'square-night': 'x=0&z=6&t=1&bell',
  // Where the meeting ring runs off the square, over the kerb and the path.
  // The meeting dais, with its steps all round.
  'dais': 'x=0&z=8&t=0&dist=16&pitch=0.6',
  'dais-low': 'x=2&z=10&t=0&dist=9&pitch=0.3&yaw=0.6',
  'dais-meeting': 'x=0&z=8&t=0&dist=14&pitch=0.7&meeting',
  'dais-steps': 'x=2.2&z=12&t=0&dist=4.5&pitch=0.35&yaw=0.4',
  'tavern-front': 'x=-16&z=2&t=0&yaw=-0.6',
  'pond-dock': 'x=6&z=15&t=0&dist=20',
  'washhouse': 'x=-14&z=17&t=0',
  'flower-bed': 'x=10&z=-10&t=0&dist=11',
  'cottages-night': 'x=0&z=26&t=1&dist=22',
  'tavern-inside': 'zone=tavern&t=0',
  'bakery-inside': 'zone=bakery&t=0',
  'church-inside': 'zone=church&t=0',
  'house-inside': 'zone=house&t=0',
  'bedroom-night': 'zone=house&t=1&night&x=2&z=-1&dist=12&yaw=0.35',
  'bedroom-window': 'zone=house&t=1&night&x=0.5&z=-2&dist=7&yaw=0&pitch=0.3',
  well: 'x=-6.5&z=-13&t=0&dist=10',
  graveyard: 'x=-8&z=-20&t=0&dist=14',
  'tower-top': 'x=0&z=4&t=0&dist=30&pitch=0.35',
  'tower-north': 'x=0&z=-4&t=0&dist=26&pitch=0.3&yaw=2.6',
  'cottage-close': 'x=25.6&z=13.6&t=0&dist=11&yaw=0.6',
  gallows: 'x=8.6&z=6.2&t=0&dist=12&gallows=1&yaw=0.9',
  'gallows-shut': 'x=8.6&z=6.2&t=0&dist=12&gallows=0&yaw=0.9',
  // The hanging, beat by beat (no animal here: just the rope, the loop, the trapdoor and the puff).
  'gallows-noose': 'x=8.6&z=6.2&t=0&dist=10&gallows=0&ring=1&rope=2.26&yaw=0.45&pitch=0.6',
  'gallows-hung': 'x=8.6&z=6.2&t=0&dist=10&gallows=1&ring=1&rope=3.66&swing=0.12&yaw=0.45&pitch=0.6',
  'gallows-puff': 'x=8.6&z=6.2&t=0&dist=10&gallows=1&ring=0.4&rope=2.4&puff=0.35&yaw=0.45&pitch=0.6',
  'cottage-gable': 'x=25.6&z=13.6&t=0&dist=11&yaw=2.3&pitch=0.45',
  'well-roof': 'x=-6.5&z=-15.5&t=0&dist=6&pitch=1.1&yaw=0.4',
  // Light, weather and things that move.
  'golden-hour': 'x=0&z=6&t=0&day=0.95&dist=24&pitch=0.5&yaw=-0.4',
  'golden-overview': 'wide&t=0&z=4&dist=70&day=0.95',
  'morning': 'x=0&z=6&t=0&day=0.05&dist=24&pitch=0.6',
  'sunset': 'x=0&z=6&t=0.3&dist=24&pitch=0.45&yaw=-0.4',
  'dusk': 'x=0&z=6&t=0.6&dist=24&pitch=0.45&yaw=-0.4',
  'rain-square': 'x=0&z=8&t=0&weather=rain&dist=18',
  'rain-pond': 'x=6.5&z=16&t=0&weather=rain&dist=14&frames=20',
  'rain-night': 'x=0&z=8&t=1&weather=rain&dist=18',
  'mist-day': 'x=0&z=6&t=0&weather=mist&dist=22',
  'mist-night': 'x=0&z=6&t=1&weather=mist&dist=22',
  'night-glow': 'x=-4&z=6&t=1&dist=26&pitch=0.5&yaw=-0.8',
  'night-glow-cottages': 'x=0&z=24&t=1&dist=20&pitch=0.5',
  'birds-perched': 'x=-20&z=4&t=0&dist=16&pitch=0.55&yaw=-0.5&follow=0,30',
  'birds-flying': 'x=-9&z=3.3&t=0&dist=11&pitch=0.5&yaw=-0.3&follow=-11,3.3&frames=5',
  sway: 'x=14&z=-12&t=0&dist=14&sway=6',
  'sway-b': 'x=14&z=-12&t=0&dist=14&sway=6&skip=1.6',
  'golden-horizon': 'x=-10&z=4&t=0&day=0.95&dist=30&pitch=0.22&yaw=1.57',
  ripples: 'x=6.5&z=17.8&t=0&dist=10&ripple&frames=14',
  'forest-hills': 'x=0&z=-30&t=0&dist=30&pitch=0.35&yaw=3.1',
  'shadow-cottage': 'x=25.6&z=13.6&t=0&dist=9&yaw=0.6',
  // The same view three times, for a steadier build time.
  'build-1': 'wide&t=0&z=4&dist=70&run=1',
  'build-2': 'wide&t=0&z=4&dist=70&run=2',
  'build-3': 'wide&t=0&z=4&dist=70&run=3',
};

const views = process.env.VIEWS ? Object.fromEntries(process.env.VIEWS.split(',').map((k) => [k, ALL[k]])) : ALL;
const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
const errors = [];
page.on('pageerror', (e) => {
  errors.push(e.message);
  console.log('page error:', e.message.slice(0, 300));
});
for (const [name, qs] of Object.entries(views)) {
  await page.goto(`http://localhost:${PORT}/dev/town.html?${qs}`, { timeout: 180000 });
  try {
    await page.waitForFunction(() => window.done, null, { timeout: 120000 });
  } catch {
    console.log('timed out on', name);
  }
  const info = await page.evaluate(() => window.info);
  await page.screenshot({ path: `${OUT}/${name}.png`, timeout: 120000 });
  console.log(name, JSON.stringify(info));
}
if (errors.length) console.log('Errors:', [...new Set(errors)].join('\n'));
await browser.close();
try {
  process.kill(-vite.pid);
} catch {
  vite.kill();
}
