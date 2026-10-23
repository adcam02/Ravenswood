// Shared bits for multiplayer browser tests against a built copy of the site (so editing src mid-test is safe).
import { spawn } from 'node:child_process';
import { chromium } from '/home/user/ravenswood/node_modules/playwright/index.mjs';

const ROOT = '/home/user/ravenswood';
export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export async function setup({ dir, port = 5196, peer = 9003, fps = 6, viewport = { width: 1100, height: 700 } }) {
  const procs = [];
  const errors = [];
  const run = (cmd, args, cwd = ROOT) => { const p = spawn(cmd, args, { cwd, stdio: 'ignore', detached: true }); procs.push(p); return p; };
  const cleanup = () => { for (const p of procs) { try { process.kill(-p.pid, 'SIGKILL'); } catch {} } };
  process.on('exit', cleanup);
  const fatal = async (e) => { console.log('FATAL', e?.message ?? e); console.log('page errors:', errors.length ? [...new Set(errors)].join('\n  ') : 'none'); try { await browser?.close(); } catch {} cleanup(); process.exit(1); };
  process.on('uncaughtException', fatal);
  process.on('unhandledRejection', fatal);
  async function waitFor(url, ms = 60000) { const end = Date.now() + ms; while (Date.now() < end) { try { const r = await fetch(url); if (r.status < 500) return; } catch {} await sleep(300); } throw new Error('no ' + url); }
  run('node', [`${ROOT}/node_modules/.bin/peerjs`, '--port', String(peer), '--path', '/', '--host', '127.0.0.1']);
  run('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1'], dir);
  await waitFor(`http://127.0.0.1:${peer}/`);
  await waitFor(`http://127.0.0.1:${port}/`);
  const flags = (f = fps) => `peer=127.0.0.1:${peer}&debug&fx=low&fps=${f}`;
  var browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream', '--autoplay-policy=no-user-gesture-required'] });
  let fails = 0;
  const check = (ok, what) => { console.log(`${ok ? 'PASS' : 'FAIL'} ${what}`); if (!ok) fails++; return ok; };
  async function open(name, path, opts = {}) {
    const ctx = await browser.newContext({ viewport: opts.viewport ?? viewport, permissions: ['microphone'] });
    const page = await ctx.newPage();
    page.on('pageerror', (e) => { errors.push(`${name}: ${e.message}`); console.log(`!! ${name} pageerror: ${e.message}`); });
    page.on('crash', () => { errors.push(`${name}: TAB CRASHED`); console.log(`!! ${name} tab crashed`); });
    page.on('console', (m) => { const shader = /THREE\.WebGLProgram|Shader Error|THREE\.WebGLRenderer/.test(m.text()); if (shader || (m.type() === 'error' && !/favicon|WebGL|GPU stall|net::|nostr|tunnel|PeerJS|Could not connect to peer|ERR_|websocket/i.test(m.text()))) { errors.push(`${name} console: ${m.text().slice(0, 300)}`); } });
    await page.goto(`http://127.0.0.1:${port}/${path}${path.includes('?') ? '&' : '?'}${flags(opts.fps)}${opts.extra ?? ''}`);
    page.label = name;
    return page;
  }
  async function jsClick(page, selector, ms = 120000) { await page.waitForSelector(selector, { state: 'attached', timeout: ms }); await page.$eval(selector, (el) => el.click()); }
  async function storyteller(opts = {}) {
    const st = await open('ST', 'index.html?st', opts);
    await st.waitForFunction(() => window.__host && window.__engine && window.__hostNet?.getState().status === 'open', null, { timeout: 240000 });
    return st;
  }
  async function join(room, name, animal, opts = {}) {
    const p = await open(name, `index.html?room=${room}`, opts);
    try {
      return await joinSteps(p, name, animal);
    } catch (e) {
      // Stuck: what was on the screen, and the connection.
      try {
        await p.screenshot({ path: `${dir}/../stuck-${name}.png` });
        const info = await p.evaluate(() => ({ text: document.body.innerText.replace(/\s+/g, ' ').slice(0, 400), status: window.__client?.getState().status, seat: window.__client?.getState().priv?.seatId ?? null }));
        console.log(`STUCK ${name}:`, JSON.stringify(info));
      } catch {}
      throw e;
    }
  }
  async function joinSteps(p, name, animal) {
    await p.waitForSelector('.join-name input', { timeout: 300000 });
    await sleep(400);
    await p.fill('.join-name input', name);
    await jsClick(p, '.join-name button', 300000);
    // Someone joining at the same moment can be looking at it for a while: click it once it's free.
    const end = Date.now() + 300000;
    while (!(await p.evaluate((a) => { const el = document.querySelector(`.join-tile[title="${a}"]`); el?.click(); return Boolean(el); }, animal))) {
      if (Date.now() > end) throw new Error(`the ${animal} never came free`);
      await sleep(500);
    }
    await p.waitForSelector(`.join-tile.on[title="${animal}"]`, { timeout: 60000 });
    await jsClick(p, '.join-animal .cosy-btn.primary', 300000);
    await p.waitForSelector('.join-mic', { timeout: 300000 });
    await jsClick(p, '.join-mic .cosy-btn.big:not(.primary)', 300000);
    await p.waitForSelector('.mic-meter', { timeout: 60000 }).catch(() => {});
    await jsClick(p, '.join-mic .cosy-btn.primary', 300000);
    await p.waitForSelector('.place-chip', { timeout: 300000 });
    // Every change in the connection, for working out what happened if something goes missing.
    await p.evaluate(() => {
      window.__statusLog = [];
      let last = window.__client.getState().status;
      window.__client.subscribe((s) => {
        if (s.status !== last) window.__statusLog.push(`${Math.round(performance.now() / 1000)}s ${last}→${s.status}`);
        last = s.status;
      });
    });
    console.log('joined', name);
    return p;
  }
  async function done() {
    console.log(`\n${fails ? fails + ' FAILED' : 'ALL PASSED'} | errors: ${errors.length ? [...new Set(errors)].join('\n  ') : 'none'}`);
    try { await browser.close(); } catch {}
    cleanup();
    process.exit(0);
  }
  return { browser, open, jsClick, storyteller, join, check, done, errors, sleep };
}
