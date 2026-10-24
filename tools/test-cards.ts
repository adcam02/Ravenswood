// Checks for the casino's cards: blackjack totals, the poker hand evaluator, and side pots.
// Run with: node --experimental-strip-types tools/test-cards.ts
import { bestHand, bjTotal, dealerStands, evaluate5, isBlackjack, newShoe, sharePot, splitPots, type Contribution } from '../src/casino/cards.ts';

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
const hand = (s: string) => s.split(' ');

// ---------------------------------------------------------------- the deck
{
  const shoe = newShoe(6);
  eq(shoe.length, 312, 'six decks');
  eq(new Set(newShoe(1)).size, 52, 'one deck has 52 different cards');
}

// ---------------------------------------------------------------- blackjack
eq(bjTotal(hand('As Kd')), { total: 21, soft: true }, 'ace king');
check(isBlackjack(hand('As Kd')), 'ace king is blackjack');
check(!isBlackjack(hand('7s 7d 7c')), 'three sevens are 21 but not blackjack');
eq(bjTotal(hand('As Ad')), { total: 12, soft: true }, 'two aces');
eq(bjTotal(hand('As Ad 9c')), { total: 21, soft: true }, 'A A 9');
eq(bjTotal(hand('As 6d 9c')), { total: 16, soft: false }, 'A 6 9 is hard 16');
eq(bjTotal(hand('Ks Qd 5c')), { total: 25, soft: false }, 'bust');
check(dealerStands(hand('As 6d')), 'dealer stands on soft 17');
check(!dealerStands(hand('Ts 6d')), 'dealer draws on 16');

// ---------------------------------------------------------------- five-card hands, each category
const cat = (s: string) => evaluate5(hand(s)).cat;
eq(cat('As Ks Qs Js Ts'), 8, 'royal flush');
eq(evaluate5(hand('As Ks Qs Js Ts')).name, 'Royal flush', 'royal flush name');
eq(cat('5h 4h 3h 2h Ah'), 8, 'steel wheel');
eq(cat('9c 9d 9h 9s 2c'), 7, 'quads');
eq(cat('9c 9d 9h 2s 2c'), 6, 'full house');
eq(cat('Ac 9c 7c 4c 2c'), 5, 'flush');
eq(cat('5c 4d 3h 2s Ac'), 4, 'wheel straight');
eq(cat('Ac Kd Qh Js Tc'), 4, 'broadway');
eq(cat('Qc Kd Ah 2s 3c'), 0, 'no wrapping straight');
eq(cat('7c 7d 7h Ks 2c'), 3, 'trips');
eq(cat('7c 7d Kh Ks 2c'), 2, 'two pair');
eq(cat('7c 7d Kh Qs 2c'), 1, 'pair');
eq(cat('7c 5d Kh Qs 2c'), 0, 'high card');
eq(evaluate5(hand('Kc Kd 5h 5s 2c')).name, 'Two pair, kings and fives', 'two pair name');
eq(evaluate5(hand('9c 9d 9h 2s 2c')).name, 'Full house, nines full of twos', 'full house name');

// Order between hands.
const beats = (a: string, b: string) => evaluate5(hand(a)).score > evaluate5(hand(b)).score;
const ties = (a: string, b: string) => evaluate5(hand(a)).score === evaluate5(hand(b)).score;
check(beats('6c 5d 4h 3s 2c', '5c 4d 3h 2s Ac'), 'six-high straight beats the wheel');
check(beats('Ac Kd Qh Js Tc', 'Kc Qd Jh Ts 9c'), 'broadway beats king high');
check(beats('2c 2d 2h 3s 3c', 'Ac Kc 9c 4c 2c'), 'full house beats flush');
check(beats('Ac Kc 9c 4c 3c', 'Ac Kc 9c 4c 2c'), 'flush decided by the fifth card');
check(beats('Kc Kd 5h 5s 3c', 'Kc Kd 5h 5s 2c'), 'two pair kicker');
check(beats('Kc Kd 6h 6s 2c', 'Kc Kd 5h 5s Ac'), 'second pair before kicker');
check(beats('Ac Ad 3h 4s 5c', 'Kc Kd Ah Qs Jc'), 'aces beat kings');
check(beats('Ac Ad Kh 4s 5c', 'As Ah Qh Js Tc'), 'pair kicker');
check(beats('2c 2d 2h 2s 3c', 'Ac Ad Ah Ks Kc'), 'quads beat a full house');
check(beats('9c 9d 9h 2s 2c', '8c 8d 8h As Ac'), 'full house by the trips');
check(ties('Ac Kd Qh Js 9c', 'As Kh Qd Jc 9s'), 'same ranks tie');
check(beats('Ac Kd Qh Js 9c', 'Ac Kd Qh Js 8c'), 'high card kickers');

// ---------------------------------------------------------------- best of seven
{
  const v = bestHand(hand('Ah Kh 2c 3d Qh Jh Th'));
  eq(v.cat, 8, 'royal from seven');
  eq(v.best.slice().sort(), hand('Ah Jh Kh Qh Th').sort(), 'the royal flush cards');
  eq(bestHand(hand('2c 2d 2h 3s 3c 3d Ks')).name, 'Full house, threes full of twos', 'two sets make the better full house');
  eq(bestHand(hand('Ac Ad Kh Ks Qc Qd 2s')).name, 'Two pair, aces and kings', 'three pairs: best two, with the third as kicker');
  eq(bestHand(hand('Ac Ad Kh Ks Qc Qd 2s')).score, evaluate5(hand('Ac Ad Kh Ks Qc')).score, 'queen kicker counted');
  eq(bestHand(hand('5c 6d 7h 8s 9c Ts Js')).name, 'Straight, jack high', 'the highest straight in seven');
  eq(bestHand(hand('Ac 2d 3h 4s 5c Kd Kh')).cat, 4, 'wheel beats a pair');
  eq(bestHand(hand('2h 4h 6h 8h Th Qh Ac')).name, 'Flush, queen high', 'six hearts: best five');
  // The board plays: both players tie.
  const board = hand('Ac Kd Qh Js Tc');
  check(bestHand([...board, '2c', '3d']).score === bestHand([...board, '4h', '5s']).score, 'board straight splits');
  // A flush beats a straight on the same board.
  check(bestHand(hand('9h 8h 7h 6c 5d Kh 2h')).cat === 5, 'flush over straight');
  check(bestHand(hand('9h 8h 7h 6h 5h Kh 2c')).cat === 8, 'straight flush over flush');
}

// ---------------------------------------------------------------- side pots
const c = (id: string, amount: number, folded = false): Contribution => ({ id, amount, folded });
eq(splitPots([c('a', 50), c('b', 50), c('c', 50)]), [{ amount: 150, eligible: ['a', 'b', 'c'] }], 'one pot');
eq(
  splitPots([c('a', 20), c('b', 100), c('c', 100)]),
  [
    { amount: 60, eligible: ['a', 'b', 'c'] },
    { amount: 160, eligible: ['b', 'c'] },
  ],
  'one short all-in: main and side pot',
);
eq(
  splitPots([c('a', 10), c('b', 40), c('c', 100), c('d', 100)]),
  [
    { amount: 40, eligible: ['a', 'b', 'c', 'd'] },
    { amount: 90, eligible: ['b', 'c', 'd'] },
    { amount: 120, eligible: ['c', 'd'] },
  ],
  'two all-ins, three pots',
);
eq(
  splitPots([c('a', 30), c('b', 100), c('c', 60, true)]),
  [
    { amount: 90, eligible: ['a', 'b'] },
    { amount: 100, eligible: ['b'] },
  ],
  'a folder’s chips go in at their level; the uncalled rest comes back',
);
eq(splitPots([c('a', 2, true), c('b', 1, true), c('c', 2)]), [{ amount: 5, eligible: ['c'] }], 'everyone else folded');
eq(splitPots([c('a', 100), c('b', 30)]), [{ amount: 60, eligible: ['a', 'b'] }, { amount: 70, eligible: ['a'] }], 'uncalled bet back to the bettor');
{
  // Totals always add up.
  for (let n = 0; n < 500; n++) {
    const list = Array.from({ length: 2 + (n % 7) }, (_, i) => c(`p${i}`, Math.floor(Math.random() * 200), Math.random() < 0.3));
    if (list.every((x) => x.folded)) list[0].folded = false;
    const total = list.reduce((s, x) => s + x.amount, 0);
    const pots = splitPots(list);
    const live = list.some((x) => !x.folded && x.amount > 0);
    if (live) check(pots.reduce((s, p) => s + p.amount, 0) === total, `pots add up (${JSON.stringify(list)})`);
  }
}
eq(sharePot(101, ['a', 'b'], ['b', 'c', 'a']), { a: 50, b: 51 }, 'odd chip to the first winner left of the button');
eq(sharePot(10, ['a', 'b', 'c'], ['c', 'a', 'b']), { a: 3, b: 3, c: 4 }, 'three-way split');

console.log(`${passes} passed, ${fails} failed`);
process.exit(fails ? 1 : 0);
