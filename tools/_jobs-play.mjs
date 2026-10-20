// Temporary: plays every job minigame in a real browser and screenshots each stage.
import { chromium } from 'playwright';

const OUT = '/tmp/claude-0/jobs';
const URL = 'http://localhost:5183/dev/jobs.html';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'] });
const errors = [];

async function run(tag, viewport, mouse) {
  const page = await browser.newPage({ viewport });
  page.on('console', (m) => m.type() === 'error' && errors.push(`${tag}: ${m.text()}`));
  page.on('pageerror', (e) => errors.push(`${tag}: ${e.message}`));
  await page.goto(URL);
  await page.waitForSelector('[data-job]');
  const shot = (name) => page.screenshot({ path: `${OUT}/${tag}-${name}.png` });
  const open = async (job) => {
    await page.click(`[data-job=${job}]`);
    await page.waitForSelector('.job-dock');
    await sleep(400);
  };
  const waitClosed = () => page.waitForSelector('.job-dock', { state: 'detached', timeout: 8000 });
  const results = () => page.evaluate(() => window.__jobs.results.length);

  // ---------------------------------------------------------------- bartender
  await open('bartender');
  await shot('bar-1-pick');
  if (mouse) await page.click('.job-choice >> nth=3');
  else await page.keyboard.press('Space');
  await sleep(300);
  await shot('bar-2-ready');
  // Pour until the liquid reaches the line.
  const lineY = await page.evaluate(() => Number(document.querySelector('.job-bar line[stroke="#3f9a49"]').getAttribute('y1')));
  if (mouse) {
    const box = await page.locator('.job-bar').boundingBox();
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
  } else await page.keyboard.down('Space');
  let midShot = false;
  for (let i = 0; i < 200; i++) {
    const top = await page.evaluate(() => {
      const d = document.querySelector('.job-bar g[clip-path] path').getAttribute('d');
      return Number(d.split(' L')[1].split(' ')[1]);
    });
    if (!midShot && top < 140) {
      await shot('bar-3-pouring');
      midShot = true;
    }
    if (top <= lineY + 1.5) break;
    await sleep(16);
  }
  if (mouse) await page.mouse.up();
  else await page.keyboard.up('Space');
  await sleep(400);
  await shot('bar-4-settling');
  await sleep(1300);
  await shot('bar-5-result');
  await waitClosed();
  console.log(tag, 'bartender', JSON.stringify(await page.evaluate(() => window.__jobs.results.at(-1))));

  // ---------------------------------------------------------------- laundry
  await open('laundry');
  await shot('wash-1-start');
  if (mouse) {
    // Scrub back and forth across the whole tub.
    const box = await page.locator('.job-wash svg').boundingBox();
    for (let pass = 0; pass < 6; pass++) {
      for (let row = 0; row < 7; row++) {
        const y = box.y + box.height * (0.16 + row * 0.12);
        await page.mouse.move(box.x + box.width * 0.18, y);
        await page.mouse.down();
        for (let k = 0; k < 10; k++) await page.mouse.move(box.x + box.width * (0.18 + (k % 2 ? 0.64 : 0)), y + (k % 3) * 4, { steps: 6 });
        await page.mouse.up();
      }
      if (await page.locator('.job-action').count()) break;
      if (pass === 0) await shot('wash-2-scrubbing');
    }
  } else {
    for (let i = 0; i < 60; i++) {
      await page.keyboard.press(i % 2 ? 'd' : 'a');
      await sleep(45);
      if (i === 14) await shot('wash-2-scrubbing');
      if (await page.locator('.job-action').count()) break;
    }
  }
  await sleep(300);
  await shot('wash-3-clean');
  if (mouse) await page.click('.job-action button');
  else await page.keyboard.press('Space');
  await sleep(700);
  await shot('wash-4-result');
  await waitClosed();
  console.log(tag, 'laundry', JSON.stringify(await page.evaluate(() => window.__jobs.results.at(-1))));

  // ---------------------------------------------------------------- fishing
  await open('fishing');
  await shot('fish-1-ready');
  await page.keyboard.press('Space');
  await sleep(900);
  await shot('fish-2-waiting');
  await page.waitForSelector('.job-bang', { timeout: 12000 });
  await sleep(120);
  await shot('fish-3-bite');
  await page.keyboard.press('Space');
  await sleep(100);
  let reelShot = false;
  let holding = false;
  const t0 = Date.now();
  while (Date.now() - t0 < 25000) {
    const s = await page.evaluate(() => {
      const reel = document.querySelector('.job-reel');
      if (!reel) return null;
      const zone = reel.querySelector('rect[fill="#6fbf73"]');
      const marker = reel.querySelector('g');
      const zx = Number(zone.getAttribute('x'));
      const zw = Number(zone.getAttribute('width'));
      const mx = Number(marker.getAttribute('transform').match(/translate\(([\d.]+)/)[1]);
      return { zx, zw, mx };
    });
    if (!s) break;
    if (!reelShot && Date.now() - t0 > 1500) {
      await shot('fish-4-reeling');
      reelShot = true;
    }
    const want = s.mx < s.zx + s.zw * 0.55;
    if (want && !holding) await page.keyboard.down('Space');
    if (!want && holding) await page.keyboard.up('Space');
    holding = want;
    await sleep(20);
  }
  if (holding) await page.keyboard.up('Space');
  await sleep(300);
  await shot('fish-5-result');
  await waitClosed();
  console.log(tag, 'fishing', JSON.stringify(await page.evaluate(() => window.__jobs.results.at(-1))));

  // ---------------------------------------------------------------- baking
  await open('baking');
  await shot('bake-1-pick');
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('Space');
  await sleep(200);
  for (let k = 0; k < 4; k++) {
    for (let i = 0; i < 300; i++) {
      const rx = await page.evaluate(() => {
        const e = [...document.querySelectorAll('.job-knead ellipse')].find((x) => x.getAttribute('stroke-width') === '5');
        return e ? Number(e.getAttribute('rx')) : null;
      });
      if (rx !== null && rx <= 56.5) break;
      await sleep(8);
    }
    if (k === 1) await shot('bake-2-knead');
    await page.keyboard.press('Space');
    await sleep(150);
  }
  await page.waitForSelector('.job-oven', { timeout: 4000 });
  for (let i = 0; i < 400; i++) {
    const x = await page.evaluate(() => {
      const g = [...document.querySelectorAll('.job-oven g[transform]')].at(-1);
      return Number(g.getAttribute('transform').match(/translate\(([\d.]+)/)[1]);
    });
    if (x >= 30 + 260 * 0.58 && x < 30 + 260 * 0.6) await shot('bake-3-oven');
    if (x >= 30 + 260 * 0.615) break;
    await sleep(10);
  }
  await page.keyboard.press('Space');
  await sleep(500);
  await shot('bake-4-result');
  await waitClosed();
  console.log(tag, 'baking', JSON.stringify(await page.evaluate(() => window.__jobs.results.at(-1))));

  // ---------------------------------------------------------------- gardening
  await open('gardening');
  await shot('garden-1-flower');
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('Space');
  await sleep(250);
  await shot('garden-2-colour');
  if (mouse) await page.click('.job-choice >> nth=1');
  else {
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('Space');
  }
  await sleep(250);
  for (let i = 0; i < 3; i++) {
    await page.keyboard.press('Space');
    await sleep(220);
    if (i === 1) await shot('garden-3-dig');
  }
  await sleep(1200);
  await shot('garden-4-water-ready');
  const band = await page.evaluate(() => {
    const r = document.querySelector('.job-garden rect[fill="#6fbf73"]');
    return Number(r.getAttribute('y')) + Number(r.getAttribute('height')) / 2;
  });
  await page.keyboard.down('Space');
  let wshot = false;
  for (let i = 0; i < 400; i++) {
    const y = await page.evaluate(() => {
      const r = [...document.querySelectorAll('.job-garden rect')].find((x) => x.getAttribute('fill') === '#6fb0e0' && x.getAttribute('x') === '278');
      return Number(r.getAttribute('y'));
    });
    if (!wshot && y < 150) {
      await shot('garden-5-watering');
      wshot = true;
    }
    if (y <= band + 1) break;
    await sleep(10);
  }
  await page.keyboard.up('Space');
  await sleep(1500);
  await shot('garden-6-result');
  await waitClosed();
  console.log(tag, 'gardening', JSON.stringify(await page.evaluate(() => window.__jobs.results.at(-1))));

  // ---------------------------------------------------------------- escape cancels, and no keys leak
  const leaked = await page.evaluate(() => {
    window.__leaked = 0;
    window.addEventListener('keydown', () => (window.__leaked += 1));
    return 0;
  });
  void leaked;
  await open('fishing');
  await page.keyboard.press('Space');
  await page.keyboard.press('Escape');
  await waitClosed();
  console.log(tag, 'cancelled', await page.evaluate(() => window.__jobs.cancelled), 'leaked keys', await page.evaluate(() => window.__leaked), 'results', await results());
  await page.close();
}

await run('desk', { width: 1280, height: 720 }, false);
await run('phone', { width: 390, height: 844 }, true);
console.log('errors', errors.length ? errors : 'none');
await browser.close();
