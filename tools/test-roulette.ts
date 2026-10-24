// Checks for the roulette table: the wheel, what each bet covers, and the payout table.
// Run with: node --experimental-strip-types tools/test-roulette.ts
import { BET_KEYS, WHEEL, boardCell, colourOf, covers, odds, payout } from '../src/casino/roulette.ts';

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
const hits = (key: string) => Array.from({ length: 37 }, (_, n) => n).filter((n) => covers(key, n));

// The wheel: every number once, a single zero, eighteen of each colour.
eq(WHEEL.length, 37, '37 pockets');
eq([...WHEEL].sort((a, b) => a - b).join(), Array.from({ length: 37 }, (_, n) => n).join(), 'each number once');
eq(WHEEL.filter((n) => colourOf(n) === 'red').length, 18, '18 red');
eq(WHEEL.filter((n) => colourOf(n) === 'black').length, 18, '18 black');
eq(colourOf(0), 'green', 'zero is green');
// Red and black alternate round the wheel.
check(WHEEL.slice(1).every((n, i) => i === 0 || colourOf(n) !== colourOf(WHEEL[i])), 'colours alternate round the wheel');
eq([1, 2, 3, 10, 11, 19, 28, 29, 36].map(colourOf), ['red', 'black', 'red', 'black', 'black', 'red', 'black', 'black', 'red'], 'some colours');

// What each bet covers.
eq(hits('n17'), [17], 'straight up 17');
eq(hits('n0'), [0], 'straight up zero');
eq(hits('red').length, 18, 'red covers 18');
eq(hits('odd'), Array.from({ length: 18 }, (_, k) => 2 * k + 1), 'odd');
eq(hits('even'), Array.from({ length: 18 }, (_, k) => 2 * k + 2), 'even (zero is not even here)');
eq(hits('low'), Array.from({ length: 18 }, (_, k) => k + 1), 'low');
eq(hits('high'), Array.from({ length: 18 }, (_, k) => k + 19), 'high');
eq(hits('d2'), Array.from({ length: 12 }, (_, k) => k + 13), 'second dozen');
eq(hits('c1'), Array.from({ length: 12 }, (_, k) => 3 * k + 1), 'first column');
eq(hits('c3'), Array.from({ length: 12 }, (_, k) => 3 * k + 3), 'third column');
for (const k of BET_KEYS) if (k !== 'n0') check(!covers(k, 0), `${k} loses on zero`);

// The payout table: 35 to 1, 2 to 1, 1 to 1, the stake back with it.
eq(odds('n5'), 35, 'straight 35:1');
eq(odds('d1'), 2, 'dozen 2:1');
eq(odds('c2'), 2, 'column 2:1');
for (const k of ['red', 'black', 'odd', 'even', 'low', 'high']) eq(odds(k), 1, `${k} 1:1`);
eq(payout({ n17: 2 }, 17), 72, '$2 on 17, 17 comes up: $70 and the $2 back');
eq(payout({ n17: 2 }, 18), 0, '$2 on 17, 18 comes up');
eq(payout({ red: 10 }, 1), 20, 'red on a red');
eq(payout({ red: 10 }, 2), 0, 'red on a black');
eq(payout({ red: 10, n0: 1 }, 0), 36, 'zero: only the bet on zero wins');
eq(payout({ d3: 5 }, 30), 15, 'third dozen');
eq(payout({ c2: 4 }, 35), 12, 'second column (35 is in it)');
eq(payout({ c2: 4 }, 36), 0, '36 is in the third column');
eq(payout({ n7: 1, red: 5, odd: 5, low: 5, d1: 5, c1: 5 }, 7), 36 + 10 + 10 + 10 + 15 + 15, 'everything on 7 wins together');
eq(payout({ black: 5, even: 5, high: 5 }, 7), 0, 'and their opposites lose');
// Over every number, the house keeps 1/37 of an even-money bet and of a straight bet.
const back = (key: string) => Array.from({ length: 37 }, (_, n) => payout({ [key]: 1 }, n)).reduce((a, b) => a + b, 0);
eq(back('red'), 36, 'red over all 37: $36 back on $37');
eq(back('n9'), 36, 'a number over all 37: $36 back');
eq(back('d2'), 36, 'a dozen over all 37: $36 back');

// The board: every bet has a place, and no two overlap.
const taken = new Map<string, string>();
for (const k of BET_KEYS) {
  const c = boardCell(k);
  for (let x = c.col; x < c.col + c.w; x++)
    for (let y = c.row; y < c.row + c.h; y++) {
      const at = `${x},${y}`;
      check(!taken.has(at), `${k} and ${taken.get(at)} share ${at}`);
      taken.set(at, k);
    }
}
eq(taken.size, 14 * 3 + 12 * 2, 'the board is filled (the corners under the zero and the columns are empty)');
eq(boardCell('n3'), { col: 1, row: 0, w: 1, h: 1 }, '3 is top left');
eq(boardCell('n34'), { col: 12, row: 2, w: 1, h: 1 }, '34 is bottom right');

console.log(`${passes} passed, ${fails} failed`);
process.exit(fails ? 1 : 0);
