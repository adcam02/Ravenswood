// Checks the pet pit's round rules (src/game/pitRules.ts). Run: node --experimental-strip-types tools/test-pit-rules.mjs
import { PIT, allowed, outcome, randomMove, resolveRound } from '../src/game/pitRules.ts';

let failed = 0;
const eq = (got, want, what) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (!ok) failed++;
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${what}${ok ? '' : `: got ${JSON.stringify(got)}, want ${JSON.stringify(want)}`}`);
};
const fresh = () => ({ hp: PIT.hearts, charge: 0 });
const round = (a, b, moves) => resolveRound(1, [a, b], moves);

// Attack against attack: both hurt.
let r = round(fresh(), fresh(), ['attack', 'attack']);
eq([r.dmg, r.hp, r.power], [[1, 1], [4, 4], [1, 1]], 'attack v attack: one each');

// Attack against charge: the charger takes the hit and still stores the charge.
r = round(fresh(), fresh(), ['attack', 'charge']);
eq([r.dmg, r.hp, r.charge], [[0, 1], [5, 4], [0, 1]], 'attack v charge: the charger is hit, keeps the charge');

// A block catches an attack and hits back for 2.
r = round(fresh(), fresh(), ['attack', 'block']);
eq([r.dmg, r.countered, r.hp], [[2, 0], [false, true], [3, 5]], 'attack v block: countered for 2');
r = round(fresh(), fresh(), ['block', 'attack']);
eq([r.dmg, r.countered], [[0, 2], [true, false]], 'block v attack, the other way round');

// A block against anything else does nothing.
eq(round(fresh(), fresh(), ['block', 'charge']).dmg, [0, 0], 'block v charge: nothing (the charge goes in)');
eq(round(fresh(), fresh(), ['block', 'charge']).charge, [0, 1], 'block v charge: the charge goes in');
eq(round(fresh(), fresh(), ['block', 'block']).dmg, [0, 0], 'block v block: nothing');

// Charges add to the next attack, and are spent by it.
r = round({ hp: 5, charge: 2 }, fresh(), ['attack', 'charge']);
eq([r.power, r.dmg, r.charge], [[3, 0], [0, 3], [0, 1]], 'two charges: a 3-damage attack, charges spent');
r = round({ hp: 5, charge: 2 }, fresh(), ['attack', 'block']);
eq([r.dmg, r.charge], [[2, 0], [0, 0]], 'a charged attack that is blocked: charges still spent, the counter stays 2');
r = round({ hp: 5, charge: 1 }, { hp: 5, charge: 2 }, ['block', 'attack']);
eq([r.dmg, r.charge], [[0, 2], [1, 0]], 'the blocker keeps its own charges');

// Charges stack to the cap.
let s = fresh();
for (let i = 0; i < 5; i++) s = { hp: s.hp, charge: round(s, fresh(), ['charge', 'block']).charge[0] };
eq(s.charge, PIT.maxCharge, `charges stop at ${PIT.maxCharge}`);

// Hearts don't go below nothing, and who wins.
r = round({ hp: 1, charge: 3 }, { hp: 2, charge: 0 }, ['attack', 'attack']);
eq([r.hp, outcome(r.hp)], [[0, 0], 'draw'], 'both down in the same round: a draw');
r = round({ hp: 1, charge: 0 }, { hp: 3, charge: 0 }, ['attack', 'block']);
eq([r.hp, outcome(r.hp)], [[0, 3], 1], 'countered to nothing: the blocker wins');
eq(outcome([2, 3]), null, 'both standing: no winner yet');

// A block can't follow a block.
eq([allowed('block', 'block'), allowed('block', 'attack'), allowed('block', null), allowed('attack', 'attack'), allowed('charge', 'charge')], [false, true, true, true, true], 'block, not twice running; attack and charge any time');
const picks = new Set();
for (let i = 0; i < 200; i++) picks.add(randomMove('block'));
eq([...picks].sort(), ['attack', 'charge'], 'a random pick after a block never blocks');
picks.clear();
for (let i = 0; i < 200; i++) picks.add(randomMove(null));
eq([...picks].sort(), ['attack', 'block', 'charge'], 'otherwise any of the three');

console.log(failed ? `${failed} failed` : 'all good');
process.exit(failed ? 1 : 0);
