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
// What's in the way, if anything: a modal pauses the world, and overlays can sit over the canvas.
const diag = await page.evaluate(() => ({
  paused: window.__engine.view?.paused,
  modal: Boolean(document.querySelector('.modal-backdrop')),
  atClick: document.elementFromPoint(550, 420)?.className,
  atDrag: document.elementFromPoint(400, 350)?.className,
}));
console.log('diag', JSON.stringify(diag));
if (diag.modal) {
  await page.keyboard.press('Escape');
  await sleep(300);
}
const results = [];
const check = (name, ok, detail = '') => {
  results.push([ok ? 'PASS' : 'FAIL', name, detail]);
  console.log(ok ? 'PASS' : 'FAIL', name, detail);
};
const yaw = () => page.evaluate(() => window.__engine.yaw);
const moveTarget = () => page.evaluate(() => Boolean(window.__engine.moveTarget));

// 1. A click on the ground walks there; the camera stays looking north from the south.
const y0 = await yaw();
await page.mouse.click(clickAt[0], clickAt[1]);
await sleep(150);
check('a click sets off a walk', await moveTarget());
check('the camera faces north from the south', Math.abs(y0) < 1e-3, `yaw ${y0}`);
// 2. A drag does not turn the camera.
await page.evaluate(() => (window.__engine.moveTarget = null));
await page.mouse.move(dragAt[0], dragAt[1]);
await page.mouse.down();
for (let i = 1; i <= 10; i++) {
  await page.mouse.move(dragAt[0] + i * 15, dragAt[1]);
  await sleep(30);
}
await page.mouse.up();
await sleep(300);
const y1 = await yaw();
check('a drag leaves the camera alone', Math.abs(y1) < 1e-3, `yaw ${y1.toFixed(3)}`);
await sleep(1200);
await page.screenshot({ path: `${OUT}/after-drag.png` });
// 3. No turn buttons, and [ ] do nothing.
check('there are no camera turn buttons', !(await page.$('.cam-btns')));
await page.keyboard.press(']');
await sleep(300);
check('[ ] keys leave the camera alone', Math.abs(await yaw()) < 1e-3, `yaw ${(await yaw()).toFixed(3)}`);
// 4. The ambience started on the first click and is running.
const amb = await page.evaluate(() => {
  const a = window.__ambience;
  return { started: Boolean(a?.ctx), state: a?.ctx?.state ?? 'none', layers: Object.keys(a?.layers ?? {}).length, master: a?.master?.gain.value ?? 0 };
});
check('the ambience started on the first click', amb.started && amb.layers >= 10, JSON.stringify(amb));
check('the audio context is running', amb.state === 'running', amb.state);
// 5. Walking with the keys keeps the same view.
await page.evaluate(() => window.__engine.place('town', 0, -2, 0, false));
await sleep(300);
const before = await page.evaluate(() => ({ x: window.__local.x, z: window.__local.z }));
await page.keyboard.down('a');
await sleep(3000);
await page.keyboard.up('a');
const after = await page.evaluate(() => ({ x: window.__local.x, z: window.__local.z }));
const y4 = await yaw();
check('walking moves us but not the camera angle', Math.hypot(after.x - before.x, after.z - before.z) > 1 && Math.abs(y4) < 1e-3, `moved ${Math.hypot(after.x - before.x, after.z - before.z).toFixed(2)}m, yaw ${y4.toFixed(3)}`);
await page.screenshot({ path: `${OUT}/after-walk.png` });
if (errors.length) console.log('Errors:', [...new Set(errors)].join('\n'));
console.log(`${results.filter((r) => r[0] === 'PASS').length}/${results.length} passed`);
await browser.close();
vite.kill();
process.exit(results.some((r) => r[0] === 'FAIL') || errors.length ? 1 : 0);
