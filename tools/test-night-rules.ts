// Checks the automated night's suggestions (src/night/rules.ts): the information each character should get, the
// tokens placed and who dies. Run with: node --experimental-strip-types tools/test-night-rules.ts
import { aliveNeighbours, evilPairs, idleWhy, impaired, killOutcome, NIGHT_ROLES, type Choice, type Grim, type NSeat } from '../src/night/rules.ts';

let fails = 0;
let passes = 0;
const check = (ok: boolean, what: string) => {
  if (ok) passes++;
  else {
    fails++;
    console.log(`FAIL ${what}`);
  }
};
const eq = (a: unknown, b: unknown, what: string) => check(JSON.stringify(a) === JSON.stringify(b), `${what}: got ${JSON.stringify(a)}, wanted ${JSON.stringify(b)}`);

const TEAMS: Record<string, NSeat['team']> = {
  washerwoman: 'townsfolk', librarian: 'townsfolk', investigator: 'townsfolk', chef: 'townsfolk', empath: 'townsfolk',
  fortuneteller: 'townsfolk', undertaker: 'townsfolk', monk: 'townsfolk', ravenkeeper: 'townsfolk', soldier: 'townsfolk',
  mayor: 'townsfolk', slayer: 'townsfolk', virgin: 'townsfolk', magician: 'townsfolk',
  butler: 'outsider', drunk: 'outsider', recluse: 'outsider', saint: 'outsider', lunatic: 'outsider', barber: 'outsider', hatter: 'outsider',
  poisoner: 'minion', spy: 'minion', baron: 'minion', scarletwoman: 'minion', godfather: 'minion', goblin: 'minion',
  imp: 'demon', fanggu: 'demon', ojo: 'demon',
};
const script = Object.entries(TEAMS).map(([id, team]) => ({ id, team: team!, name: id[0].toUpperCase() + id.slice(1) }));

/** A circle from "name:role" (optionally "name:role>shown", "+dead", "!Poisoned"), clockwise. */
function grim(spec: string[], o: Partial<Grim> = {}): Grim {
  const seats = spec.map((x) => {
    const [name, rest] = x.split(':');
    const dead = rest.includes('+');
    const poisoned = rest.includes('!');
    const [roleId, shown] = rest.replace(/[+!]/g, '').split('>');
    const team = TEAMS[roleId] ?? null;
    return {
      id: name,
      name,
      roleId,
      shownRoleId: shown ?? null,
      team,
      evil: team === 'minion' || team === 'demon',
      dead,
      reminders: poisoned ? [{ roleId: 'poisoner', text: 'Poisoned' }] : [],
    } satisfies NSeat;
  });
  return { seats, night: 1, first: true, script, executed: null, diedToday: [], diedTonight: [], ...o };
}
/** A random source that always gives the same sequence. */
const seeded = (n = 1) => () => {
  n = (n * 16807) % 2147483647;
  return n / 2147483647;
};
const seat = (g: Grim, id: string) => g.seats.find((s) => s.id === id)!;
const out = (g: Grim, role: string, holder: string, choices: Record<string, Choice> = {}) => NIGHT_ROLES[role].outcome!(g, seat(g, holder), choices, seeded());

// ---------------------------------------------------------------- the Chef and the Empath
{
  const g = grim(['A:imp', 'B:poisoner', 'C:chef', 'D:empath', 'E:washerwoman']);
  eq(evilPairs(g), 1, 'Chef: the Imp and Poisoner sit together');
  eq(out(g, 'chef', 'C').panels[0].signs, ['n1'], 'Chef is shown one finger');
  const g2 = grim(['A:imp', 'B:chef', 'C:poisoner', 'D:empath', 'E:washerwoman']);
  eq(evilPairs(g2), 0, 'Chef: evil players apart make no pairs');
  const g3 = grim(['A:imp', 'B:chef', 'C:empath', 'D:washerwoman', 'E:poisoner']);
  eq(evilPairs(g3), 1, 'Chef: the circle wraps round (last and first seat)');
  const g4 = grim(['A:imp', 'B:poisoner', 'C:spy', 'D:chef', 'E:empath', 'F:monk']);
  eq(evilPairs(g4), 2, 'Chef: three evil in a row are two pairs');
}
{
  const g = grim(['A:imp', 'B:empath', 'C:poisoner', 'D:chef', 'E:washerwoman']);
  eq(out(g, 'empath', 'B').panels[0].signs, ['n2'], 'Empath between two evil players: 2');
  const g2 = grim(['A:imp+', 'B:empath', 'C:chef', 'D:monk', 'E:poisoner'], { first: false, night: 2 });
  eq(aliveNeighbours(g2, 'B').map((s) => s.id), ['E', 'C'], 'Empath skips a dead neighbour to the next living one');
  eq(out(g2, 'empath', 'B').panels[0].signs, ['n1'], 'Empath counts the living neighbours only');
  const g3 = grim(['A:imp', 'B:empath!', 'C:chef', 'D:monk', 'E:poisoner']);
  const p = out(g3, 'empath', 'B');
  check(Boolean(p.unreliable) && p.alt !== undefined && p.alt.panels[0].signs[0] !== 'n1', 'a poisoned Empath: flagged, with a different number to give instead');
  const g4 = grim(['A:imp', 'B:empath', 'C:recluse', 'D:monk', 'E:poisoner']);
  check(out(g4, 'empath', 'B').notes.some((n) => /Recluse/.test(n)), 'the Recluse next to the Empath is pointed out');
}

// ---------------------------------------------------------------- the Washerwoman, Librarian and Investigator
{
  const g = grim(['A:imp', 'B:washerwoman', 'C:chef', 'D:poisoner', 'E:empath', 'F:butler']);
  for (let i = 1; i < 6; i++) {
    const o = NIGHT_ROLES.washerwoman.outcome!(g, seat(g, 'B'), {}, seeded(i * 7));
    const shown = o.panels[0].roleIds[0];
    const right = o.panels[0].seatIds.filter((id) => seat(g, id).roleId === shown);
    check(['chef', 'empath'].includes(shown) && right.length === 1 && o.panels[0].seatIds.length === 2 && !o.panels[0].seatIds.includes('B'), `Washerwoman (${i}): a Townsfolk in play, one of two others really is it`);
    eq(o.effects.map((e) => (e.k === 'token' ? e.text : e.k)), ['Townsfolk', 'Wrong'], `Washerwoman (${i}): TOWNSFOLK and WRONG reminders placed`);
  }
  // Reminders already placed are followed.
  const g2 = grim(['A:imp', 'B:washerwoman', 'C:chef', 'D:poisoner', 'E:empath']);
  seat(g2, 'E').reminders.push({ roleId: 'washerwoman', text: 'Townsfolk' });
  seat(g2, 'A').reminders.push({ roleId: 'washerwoman', text: 'Wrong' });
  const o2 = out(g2, 'washerwoman', 'B');
  eq([o2.panels[0].roleIds, [...o2.panels[0].seatIds].sort()], [['empath'], ['A', 'E']], 'Washerwoman follows the tokens already placed');
}
{
  const g = grim(['A:imp', 'B:librarian', 'C:chef', 'D:poisoner', 'E:empath']);
  const o = out(g, 'librarian', 'B');
  eq(o.panels[0].signs, ['n0'], 'Librarian with no Outsiders: zero');
  const g2 = grim(['A:imp', 'B:librarian', 'C:drunk>chef', 'D:poisoner', 'E:empath']);
  eq(out(g2, 'librarian', 'B').panels[0].roleIds, ['drunk'], 'Librarian can be shown the Drunk');
}
{
  const g = grim(['A:imp', 'B:investigator', 'C:chef', 'D:baron', 'E:empath', 'F:saint', 'G:recluse']);
  const o = out(g, 'investigator', 'B');
  eq(o.panels[0].roleIds, ['baron'], 'Investigator is shown the Minion in play');
  check(o.panels[0].seatIds.includes('D'), 'and one of the two is the Baron');
  check(o.notes.some((n) => /Recluse/.test(n)), 'the Recluse might register as a Minion');
  const drunk = grim(['A:imp', 'B:drunk>investigator', 'C:chef', 'D:baron', 'E:empath']);
  const od = out(drunk, 'investigator', 'B');
  check(od.unreliable === 'is the Drunk' && od.alt !== undefined, 'the Drunk who thinks they are the Investigator: flagged, with a false answer ready');
}

// ---------------------------------------------------------------- the Fortune Teller
{
  const g = grim(['A:imp', 'B:fortuneteller', 'C:chef', 'D:poisoner', 'E:empath']);
  seat(g, 'C').reminders.push({ roleId: 'fortuneteller', text: 'Red Herring' });
  eq(out(g, 'fortuneteller', 'B', { B: { seatIds: ['A', 'E'] } }).panels[0].signs, ['yes'], 'FT: the Demon among them, yes');
  eq(out(g, 'fortuneteller', 'B', { B: { seatIds: ['D', 'E'] } }).panels[0].signs, ['no'], 'FT: a Minion and a Townsfolk, no');
  eq(out(g, 'fortuneteller', 'B', { B: { seatIds: ['C', 'E'] } }).panels[0].signs, ['yes'], 'FT: the red herring says yes');
  const g2 = grim(['A:imp', 'B:fortuneteller!', 'C:chef', 'D:poisoner', 'E:empath']);
  const o = out(g2, 'fortuneteller', 'B', { B: { seatIds: ['A', 'E'] } });
  eq([o.panels[0].signs, o.alt?.panels[0].signs, Boolean(o.unreliable)], [['yes'], ['no'], true], 'FT poisoned: the true answer and the opposite to choose from');
}

// ---------------------------------------------------------------- the Undertaker and the Ravenkeeper
{
  const g = grim(['A:imp', 'B:undertaker', 'C:drunk>chef+', 'D:poisoner', 'E:empath'], { first: false, night: 2, executed: 'C', diedToday: ['C'] });
  const o = out(g, 'undertaker', 'B');
  eq(o.panels[0].roleIds, ['drunk'], 'Undertaker sees the Drunk as the Drunk');
  eq(idleWhy(grim(['A:imp', 'B:undertaker'], { first: false, night: 2 }), 'undertaker', seat(grim(['A:imp', 'B:undertaker']), 'B')), 'Nobody died by execution today.', 'Undertaker sleeps when nobody was executed');
  const r = grim(['A:imp', 'B:ravenkeeper+', 'C:chef', 'D:poisoner', 'E:empath'], { first: false, night: 2, diedTonight: ['B'], diedToday: ['B'] });
  eq(idleWhy(r, 'ravenkeeper', seat(r, 'B')), null, 'Ravenkeeper killed tonight wakes');
  eq(out(r, 'ravenkeeper', 'B', { B: { seatIds: ['D'] } }).panels[0].roleIds, ['poisoner'], 'Ravenkeeper learns the character chosen');
  const alive = grim(['A:imp', 'B:ravenkeeper', 'C:chef'], { first: false, night: 2 });
  check(idleWhy(alive, 'ravenkeeper', seat(alive, 'B')) !== null, 'a living Ravenkeeper sleeps');
}

// ---------------------------------------------------------------- kills
{
  const base = ['A:imp', 'B:monk', 'C:chef', 'D:poisoner', 'E:soldier', 'F:mayor'];
  const g = grim(base, { first: false, night: 2 });
  eq(killOutcome(g, seat(g, 'A'), 'imp', ['C'], true).effects, [{ k: 'kill', seatId: 'C' }], 'the Imp kills the Chef');
  eq(killOutcome(g, seat(g, 'A'), 'imp', ['E'], true).effects, [], 'the Soldier is safe from the Demon');
  const safe = grim(base, { first: false, night: 2 });
  seat(safe, 'C').reminders.push({ roleId: 'monk', text: 'Safe' });
  eq(killOutcome(safe, seat(safe, 'A'), 'imp', ['C'], true).effects, [], 'the Monk’s Safe player survives');
  const poisonedMonk = grim(['A:imp', 'B:monk!', 'C:chef', 'D:poisoner'], { first: false, night: 2 });
  seat(poisonedMonk, 'C').reminders.push({ roleId: 'monk', text: 'Safe' });
  eq(killOutcome(poisonedMonk, seat(poisonedMonk, 'A'), 'imp', ['C'], true).effects, [{ k: 'kill', seatId: 'C' }], 'a poisoned Monk protects nobody');
  const sick = grim(['A:imp!', 'B:monk', 'C:chef'], { first: false, night: 2 });
  const o = killOutcome(sick, seat(sick, 'A'), 'imp', ['C'], true);
  eq([o.effects, o.alt?.effects], [[], [{ k: 'kill', seatId: 'C' }]], 'a poisoned Imp kills nobody (or anyway, if the Storyteller says)');
  const star = killOutcome(g, seat(g, 'A'), 'imp', ['A'], true);
  check(star.effects[0]?.k === 'kill' && star.notes.some((n) => /becomes the Imp/.test(n)), 'the Imp choosing itself dies, and a Minion takes over');
  check(killOutcome(g, seat(g, 'A'), 'imp', ['F'], true).notes.some((n) => /Mayor/.test(n)), 'killing the Mayor says another might die instead');
  const dead = grim(['A:imp', 'B:monk', 'C:chef+'], { first: false, night: 2 });
  eq(killOutcome(dead, seat(dead, 'A'), 'imp', ['C'], true).effects, [], 'choosing a dead player kills nobody');
}
{
  const g = grim(['A:fanggu', 'B:saint', 'C:chef', 'D:poisoner', 'E:empath', 'F:monk', 'G:butler'], { first: false, night: 2 });
  eq(out(g, 'fanggu', 'A', { A: { seatIds: ['B'] } }).effects, [{ k: 'kill', seatId: 'A' }], 'the Fang Gu choosing an Outsider dies instead (the jump)');
  seat(g, 'B').reminders.push({ roleId: 'fanggu', text: 'Once' });
  eq(out(g, 'fanggu', 'A', { A: { seatIds: ['G'] } }).effects, [{ k: 'kill', seatId: 'G' }], 'after it has jumped once, an Outsider just dies');
}
{
  const g = grim(['A:ojo', 'B:monk', 'C:chef', 'D:poisoner', 'E:empath'], { first: false, night: 2 });
  eq(out(g, 'ojo', 'A', { A: { roleIds: ['chef'] } }).effects, [{ k: 'kill', seatId: 'C' }], 'the Ojo chooses the Chef: the Chef dies');
  const none = out(g, 'ojo', 'A', { A: { roleIds: ['saint'] } });
  eq([none.effects, none.pickVictim], [[], true], 'the Ojo chooses a character not in play: the Storyteller picks');
}
{
  const g = grim(['A:imp', 'B:godfather', 'C:saint+', 'D:chef', 'E:empath'], { first: false, night: 2, diedToday: ['C'] });
  eq(idleWhy(g, 'godfather', seat(g, 'B')), null, 'the Godfather wakes after an Outsider died today');
  eq(out(g, 'godfather', 'B', { B: { seatIds: ['D'] } }).effects, [{ k: 'kill', seatId: 'D' }], 'and kills');
  const quiet = grim(['A:imp', 'B:godfather', 'C:saint', 'D:chef'], { first: false, night: 2 });
  check(idleWhy(quiet, 'godfather', seat(quiet, 'B')) !== null, 'otherwise the Godfather sleeps');
  const first = grim(['A:imp', 'B:godfather', 'C:saint', 'D:chef', 'E:butler']);
  eq([...out(first, 'godfather', 'B').panels[0].roleIds].sort(), ['butler', 'saint'], 'first night: the Godfather learns the Outsiders');
}

// ---------------------------------------------------------------- tokens, the Lunatic, the Barber and the Hatter
{
  const g = grim(['A:imp', 'B:poisoner', 'C:chef', 'D:monk', 'E:empath'], { first: false, night: 2 });
  eq(out(g, 'poisoner', 'B', { B: { seatIds: ['C'] } }).effects, [{ k: 'token', seatId: 'C', roleId: 'poisoner', text: 'Poisoned', only: true }], 'Poisoner: POISONED moves to the player chosen');
  eq(out(g, 'monk', 'D', { D: { seatIds: ['C'] } }).effects, [{ k: 'token', seatId: 'C', roleId: 'monk', text: 'Safe', only: true }], 'Monk: SAFE on the player chosen');
  const ask = NIGHT_ROLES.monk.ask!(g, seat(g, 'D'), seat(g, 'D'));
  check(ask?.kind === 'players' && ask.notSelf === true, 'the Monk can’t choose themselves');
  eq(impaired(seat(g, 'C'), 'chef'), null, 'a sober Chef is fine');
}
{
  const g = grim(['A:imp', 'B:lunatic>imp', 'C:chef', 'D:poisoner', 'E:empath'], { first: false, night: 2 });
  const o = out(g, 'lunatic', 'B', { B: { seatIds: ['C'] } });
  eq([o.to, o.panels[0].card, o.panels[0].seatIds, o.effects.length], [['A'], 'thisPlayerIs', ['B'], 1], 'the Lunatic’s choice goes to the Demon, with a CHOSEN token');
  eq(NIGHT_ROLES.lunatic.informs!(g, seat(g, 'B')), ['A'], 'the Demon is told before choosing');
}
{
  const g = grim(['A:imp', 'B:barber+', 'C:chef', 'D:poisoner', 'E:empath'], { first: false, night: 2, diedToday: ['B'] });
  eq(idleWhy(g, 'barber', seat(g, 'B')), null, 'the Barber died today: the Demon wakes');
  eq(NIGHT_ROLES.barber.askers!(g, seat(g, 'B')), ['A'], 'the Demon is the one asked');
  const o = out(g, 'barber', 'B', { A: { seatIds: ['C', 'E'] } });
  eq([o.effects, o.tell], [[{ k: 'swap', a: 'C', b: 'E' }], ['C', 'E']], 'a haircut: the two swap, and each is told');
  eq(out(g, 'barber', 'B', { A: { seatIds: [] } }).effects, [], 'or the Demon swaps nobody');
}
{
  const g = grim(['A:imp', 'B:hatter+', 'C:chef', 'D:poisoner', 'E:empath'], { first: false, night: 2, diedToday: ['B'] });
  eq(NIGHT_ROLES.hatter.askers!(g, seat(g, 'B')), ['D', 'A'], 'the Hatter wakes the Minions and the Demon');
  const ask = NIGHT_ROLES.hatter.ask!(g, seat(g, 'D'), seat(g, 'B'));
  check(ask?.kind === 'character' && JSON.stringify(ask.teams) === '["minion"]', 'a Minion chooses among Minions');
  eq(out(g, 'hatter', 'B', { D: { roleIds: ['spy'] }, A: { roleIds: [] } }).effects, [{ k: 'become', seatId: 'D', roleId: 'spy' }], 'the Poisoner becomes the Spy; the Imp stays');
}

console.log(`${passes} passed, ${fails} failed`);
if (fails) process.exit(1);
