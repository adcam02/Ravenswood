// A ghost dancing in the graveyard earns Thriller (and the jack-o'-lantern); dancing there alive, or a ghost
// dancing elsewhere, doesn't.
import { setup, sleep } from '../harness.mjs';
const S = '/tmp/claude-0/-home-user-ravenswood/f3f6fd5e-bcab-5998-aa6d-a19b11749b3c/scratchpad';
const { storyteller, join, check, done } = await setup({ dir: `${S}/build-test`, port: 5231, peer: 9031, fps: 6 });
const st = await storyteller();
const room = await st.evaluate(() => window.__host.getState().g.room);
const p = await join(room, 'Wendy', 'Prawn');
const feats = () => p.evaluate(() => JSON.parse(localStorage.getItem('ravenswood:progress') ?? '{}').feats ?? []);
const hats = () => p.evaluate(() => document.body.innerText);
const GY = { x: -8, z: -23 };
const place = (x, z) => p.evaluate(([x, z]) => window.__engine.place('town', x, z, 0, false), [x, z]);
const dance = async () => { for (let i = 0; i < 4; i++) { await p.evaluate(() => window.__engine.startEmote('dance')); await sleep(800); } };
await check(!(await feats()).includes('spooky') && !(await feats()).includes('thriller'), `nothing for turning up: ${(await feats()).join(', ') || 'none'}`);
// Alive, dancing among the graves.
await place(GY.x, GY.z);
await sleep(1000);
await dance();
await check(!(await feats()).includes('thriller'), 'alive in the graveyard, dancing: no Thriller');
// Dead, dancing out in the square.
const id = await st.evaluate(() => window.__host.getState().g.seats.find((s) => s.name === 'Wendy').id);
await st.evaluate((id) => window.__st.st.toggleDead(id), id);
await p.waitForFunction((id) => window.__client.getState().pub.seats.find((s) => s.id === id)?.dead, id, { timeout: 30000 });
await place(4, 4);
await sleep(1000);
await dance();
await check(!(await feats()).includes('thriller'), 'a ghost dancing in the square: no Thriller');
// (A dance lasts eight seconds: let it finish before going to the graves.)
await sleep(9000);
// Dead, among the graves, standing still: Haunting only.
await place(GY.x, GY.z);
await sleep(1500);
const f1 = await feats();
await check(f1.includes('haunting') && !f1.includes('thriller'), `a ghost among the graves: Haunting, not yet Thriller (${f1.join(', ')})`);
await dance();
await sleep(500);
const f2 = await feats();
await check(f2.includes('thriller'), `a ghost dancing among the graves: Thriller (${f2.join(', ')})`);
// The unlocks come one at a time: the halo for becoming a ghost, then the jack-o'-lantern.
let seen = '';
for (let i = 0; i < 20 && !/Jack-o.{1,2}lantern/.test(seen); i++) {
  await sleep(1000);
  seen = await hats();
  if (!/Jack-o.{1,2}lantern/.test(seen)) await p.evaluate(() => [...document.querySelectorAll('button')].find((b) => b.textContent.trim() === 'Later')?.click());
}
await check(/Jack-o.{1,2}lantern/.test(seen) && /Dance among the graves as a ghost/.test(seen), 'the jack-o\u2019-lantern pops up, saying how it was earned');
await p.screenshot({ path: `${S}/thriller/unlock.png` });
await done();
