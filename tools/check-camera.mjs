// Checks the camera controls and the ambience in a real browser: a drag turns the camera, a click walks,
// the buttons turn, and the ambient sound starts on the first click. `node tools/check-camera.mjs [out-dir]`
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { chromium } from 'playwright';

const OUT = process.argv[2] || 'test-results/camera';
mkdirSync(OUT, { recursive: true });
const PORT = 5194;
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
const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'] });
const page = await browser.newPage({ viewport: { width: 1100, height: 650 } });
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
page.on('console', (m) => m.type() === 'error' && !/WebGL|GPU|favicon|net::/.test(m.text()) && errors.push(m.text()));
await page.goto(`http://localhost:${PORT}/?st&nopeer&nomesh&fx=low&fps=12&debug`);
await page.waitForFunction(() => window.__engine && window.__hud?.getState().ready, null, { timeout: 120000 });
await sleep(1500);
const results = [];
const check = (name, ok, detail = '') => {
  results.push([ok ? 'PASS' : 'FAIL', name, detail]);
  console.log(ok ? 'PASS' : 'FAIL', name, detail);
};
const yaw = () => page.evaluate(() => window.__engine.yawTarget);
const moveTarget = () => page.evaluate(() => Boolean(window.__engine.moveTarget));

// 1. A plain click on the ground walks there and doesn't turn the camera.
const y0 = await yaw();
await page.mouse.click(550, 420);
await sleep(300);
check('a click sets off a walk', await moveTarget());
check('a click leaves the camera alone', Math.abs((await yaw()) - y0) < 1e-6, `${y0} -> ${await yaw()}`);
// 2. A drag turns the camera and doesn't walk.
await page.evaluate(() => (window.__engine.moveTarget = null));
await page.mouse.move(400, 350);
await page.mouse.down();
for (let i = 1; i <= 10; i++) {
  await page.mouse.move(400 + i * 15, 350);
  await sleep(30);
}
await page.mouse.up();
await sleep(300);
const y1 = await yaw();
check('a drag turns the camera', Math.abs(y1 - y0) > 0.5, `${y0.toFixed(2)} -> ${y1.toFixed(2)}`);
check('a drag does not walk', !(await moveTarget()));
await sleep(1200);
await page.screenshot({ path: `${OUT}/after-drag.png` });
// 3. The on-screen buttons turn it a step.
await page.click('.cam-btns button:first-child');
await sleep(200);
const y2 = await yaw();
check('the left button turns a step', Math.abs(y2 - y1 + Math.PI / 4) < 1e-6, `${y1.toFixed(2)} -> ${y2.toFixed(2)}`);
// 4. The ambience started on the first click and is running.
const amb = await page.evaluate(() => {
  const a = window.__ambience;
  return { started: Boolean(a?.ctx), state: a?.ctx?.state ?? 'none', layers: Object.keys(a?.layers ?? {}).length, master: a?.master?.gain.value ?? 0 };
});
check('the ambience started on the first click', amb.started && amb.layers >= 10, JSON.stringify(amb));
check('the audio context is running', amb.state === 'running', amb.state);
// 5. Walking with the keys swings the camera round behind.
await page.evaluate(() => window.__engine.place('town', 0, -2, 0, false));
await sleep(300);
const y3 = await yaw();
await page.keyboard.down('a');
await sleep(2500);
await page.keyboard.up('a');
const y4 = await yaw();
check('walking with the keys swings the camera round', Math.abs(y4 - y3) > 0.3, `${y3.toFixed(2)} -> ${y4.toFixed(2)}`);
await page.screenshot({ path: `${OUT}/after-walk.png` });
if (errors.length) console.log('Errors:', [...new Set(errors)].join('\n'));
console.log(`${results.filter((r) => r[0] === 'PASS').length}/${results.length} passed`);
await browser.close();
vite.kill();
process.exit(results.some((r) => r[0] === 'FAIL') || errors.length ? 1 : 0);
