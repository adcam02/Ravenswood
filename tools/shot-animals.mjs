// Screenshots of the animal test bench (dev/animals.html), from this checkout's own source.
//   node tools/shot-animals.mjs out-dir 'view=one&animal=kaiju&ry=0.6' 'view=grid' …
// PORT=5211 picks the port (so several checkouts can run at once); VW and VH set the window size.
// Each view's info (triangle counts, face audits) is printed and saved to out-dir/info.json.
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const PORT = Number(process.env.PORT ?? 5201);
const [out, ...views] = process.argv.slice(2);
if (!out || !views.length) {
  console.log("usage: node tools/shot-animals.mjs out-dir 'view=one&animal=fox' …");
  process.exit(1);
}
mkdirSync(out, { recursive: true });
const vite = spawn('npx', ['vite', '--port', String(PORT), '--strictPort'], { stdio: 'ignore', cwd: ROOT, detached: true });
const stop = () => {
  try {
    process.kill(-vite.pid);
  } catch {
    vite.kill();
  }
};
process.on('exit', stop);
const end = Date.now() + 60000;
while (Date.now() < end) {
  try {
    if ((await fetch(`http://localhost:${PORT}/dev/animals.html`)).ok) break;
  } catch {
    /* not up yet */
  }
  await new Promise((r) => setTimeout(r, 400));
}
const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: Number(process.env.VW ?? 1400), height: Number(process.env.VH ?? 900) } });
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
page.on('console', (m) => {
  if (m.type() === 'error' || /THREE\.WebGLProgram/.test(m.text())) errors.push(m.text().slice(0, 300));
});
const infos = {};
for (const v of views) {
  const name = v.replace(/[=&,:]/g, '_');
  await page.goto(`http://localhost:${PORT}/dev/animals.html?${v}`, { timeout: 120000 });
  await page.waitForFunction(() => window.done, null, { timeout: 240000 });
  await page.waitForTimeout(600);
  await page.screenshot({ path: `${out}/${name}.png` });
  infos[v] = await page.evaluate(() => window.info);
  console.log(name, String(JSON.stringify(infos[v])).slice(0, 400));
}
writeFileSync(`${out}/info.json`, JSON.stringify(infos, null, 1));
if (errors.length) console.log('ERRORS', [...new Set(errors)].join('\n'));
await browser.close();
stop();
process.exit(0);
