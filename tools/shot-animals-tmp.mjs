// node shot-animals.mjs <outdir> <view-query>...   e.g. "view=grid" "view=close&animal=fox,bear"
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
const [out, ...views] = process.argv.slice(2);
mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
for (const v of views) {
  const name = v.replace(/[^a-z0-9]+/gi, '_').replace(/^view_/, '');
  await page.goto(`http://localhost:5197/dev/animals.html?${v}`);
  await page.waitForFunction(() => window.done, null, { timeout: 180000 });
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${out}/${name}.png` });
  const info = await page.evaluate(() => window.info);
  console.log(name, JSON.stringify(info));
}
if (errors.length) console.log('Errors:', [...new Set(errors)].join('\n'));
await browser.close();
