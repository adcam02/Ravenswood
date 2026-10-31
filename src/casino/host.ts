/**
 * The Lucky Raven's tables and shop, run in the Storyteller's browser: it shuffles, deals, takes the bets and pays
 * out, all through the profiles' money (credit/debit), so nobody can win by editing their own page. Each player is
 * sent a view with only what they may see (casinoFor).
 *
 * Blackjack: five seats, and each seat plays its own round against the dealer at its own pace (the dealer keeps a
 * hand for each seat), so nobody waits on anybody. Hit, stand or double; blackjack pays 3:2; the dealer stands on
 * every 17.
 *
 * Texas hold'em: one table of eight. Players buy chips with their money, play with blinds, and cash out what's in
 * front of them when they leave. A player who walks out, drops off or goes quiet is folded (their chips stay safe),
 * and every turn has a timer.
 *
 * Roulette: a European wheel for five. Chips go down on the board while betting is open (25 seconds from the first,
 * or as soon as everyone with chips down says they're ready); they're taken from each player's money when the ball
 * is thrown, and what comes back is paid when it lands. Everyone sees the same spin: the view carries the number and
 * the host-clock times the ball is thrown and settles, and each screen rolls it to that.
 *
 * The slot machines: three along the wall, each played by one player at a time, a pull at a time. The reels are
 * decided the moment the lever's pulled and the stake taken then; what comes back is paid when the last reel stops.
 * Everyone in the room sees the reels turn (the view carries what they stop on and when the lever was pulled).
 *
 * Chips on the table and bets in play are noted in this browser as they change, so if the Storyteller's page closes
 * mid-hand, everyone gets theirs back the next time it opens.
 */
import { create } from 'zustand';
import { credit, debit, grantItem, grantPet, money, profileOf } from '../game/profiles';
import { presence } from '../game/presence';
import { debugHooks, loadJSON, saveJSON } from '../lib/util';
import { useHost } from '../state/host';
import { PETS, type PetId } from '../world/types';
import { bestHand, bjTotal, dealerStands, isBlackjack, newShoe, randomBelow, sharePot, splitPots, type Card, type Contribution } from './cards';
import { boughtNote, petName, petPrice, wareOf } from './shop';
import { isBet, payout } from './roulette';
import { SL, SLOT_STOPS, isSlotBet, linePays, symbolAt } from './slots';
import { BJ_MAX, BJ_MIN, BJ_SEATS, HIDDEN, PK, PK_SEATS, RL, RL_SEATS, SL_MACHINES, type BjResult, type RlView, type SlMachineView, type BjSeatView, type CasinoAction, type CasinoView, type PkSeatView, type PkStage, type PkView } from './types';

/** The casino's zone (the room behind the Lucky Raven's door). */
export const CASINO_ZONE = 'casino';

/** Counts every change, so the Storyteller's page knows to send the players their new views. */
export const useCasino = create<{ rev: number }>(() => ({ rev: 0 }));

/** Away from the casino (or offline) this long, and their seat is given up. */
const AWAY_MS = 8000;
/** A blackjack hand nobody touches stands by itself after this long. */
const BJ_TURN_MS = 45000;
/** An empty blackjack seat that hasn't bet for this long is given up. */
const BJ_IDLE_MS = 5 * 60000;
/** The dealer's cards come one at a time. */
const DEALER_STEP_MS = 750;
const NOTE_MS = 8000;
const SAVE_KEY = 'ravenswood:casino-chips';

// ---------------------------------------------------------------- state

interface Who {
  /** The browser playing, the seat in the game it has, and the name the money is kept under. */
  player: string;
  seatId: string;
  name: string;
  /** Since when they've been away from the casino (or offline), if they are. */
  away: number | null;
}

interface BjSeat extends Who {
  shoe: Card[];
  state: BjSeatView['state'];
  bet: number;
  cards: Card[];
  dealer: Card[];
  revealed: boolean;
  result: BjResult | null;
  paid: number;
  until: number | null;
  /** When the dealer draws next. */
  nextAt: number;
  idleSince: number;
  /** Their hand finishes, then the seat is given up. */
  leaving: boolean;
}

interface PkSeat extends Who {
  stack: number;
  bet: number;
  /** Chips put in over this whole hand. */
  total: number;
  cards: Card[];
  inHand: boolean;
  folded: boolean;
  allIn: boolean;
  /** Has had their say since the last full bet or raise (and so can't raise again unless someone does). */
  acted: boolean;
  out: boolean;
  last: string | null;
  won: number;
  hand: string | null;
  shown: boolean;
  /** Turns missed in a row. */
  missed: number;
  leaving: boolean;
}

interface Table {
  seats: (PkSeat | null)[];
  hand: number;
  stage: PkStage;
  deck: Card[];
  board: Card[];
  button: number | null;
  turn: number | null;
  until: number | null;
  toMatch: number;
  minRaise: number;
  /** Chips from players who folded and left during this hand: still in the pot. */
  dead: Contribution[];
  pots: { amount: number; winners: string[] }[];
  /** What happens next by itself (the next card on a run-out, the next hand), and when. */
  next: { at: number; step: 'street' | 'showdown' | 'start' } | null;
  note: string;
}

const bj: (BjSeat | null)[] = Array.from({ length: BJ_SEATS }, () => null);
const table: Table = {
  seats: Array.from({ length: PK_SEATS }, () => null),
  hand: 0,
  stage: 'waiting',
  deck: [],
  board: [],
  button: null,
  turn: null,
  until: null,
  toMatch: 0,
  minRaise: PK.big,
  dead: [],
  pots: [],
  next: null,
  note: 'Take a seat to play',
};
const notes = new Map<string, { text: string; at: number }>();
/** Tests only (with ?debug): the next poker hand's cards, in the order they're dealt. */
let rigged: Card[] | null = null;
let riggedN: number | null = null;

let changed = false;
const bump = () => (changed = true);

/** Something for one player to read in their panel. */
function tell(player: string, text: string) {
  notes.set(player, { text, at: Date.now() });
  bump();
}

/** The seat in the game this browser has, with its name. */
function gameSeat(player: string) {
  const s = useHost.getState().g.seats.find((x) => x.playerId === player);
  return s?.name.trim() ? s : null;
}

/** Whether this player is in the casino now. */
function inCasino(seatId: string) {
  return presence.others.get(seatId)?.zone === CASINO_ZONE;
}

const who = (s: Who) => ({ name: s.name });
const coinsOf = (name: string) => profileOf({ name })?.coins ?? 0;
const wholeDollars = (v: unknown) => Math.floor(Number(v) || 0);

// ---------------------------------------------------------------- the shop

function buy(player: string, pet: string) {
  const seat = gameSeat(player);
  if (!seat || !PETS.some((p) => p.id === pet)) return;
  if (!inCasino(seat.id)) return tell(player, 'The shop is in the casino.');
  const p = profileOf({ name: seat.name });
  if (p?.pets.includes(pet as PetId)) return tell(player, `You already have the ${petName(pet).toLowerCase()}.`);
  const price = petPrice(pet);
  if (!debit({ name: seat.name }, price, `for the ${petName(pet).toLowerCase()}`)) {
    return tell(player, `The ${petName(pet).toLowerCase()} is ${money(price)}, and you have ${money(p?.coins ?? 0)}.`);
  }
  grantPet({ name: seat.name }, pet as PetId);
  tell(player, `The ${petName(pet).toLowerCase()} is yours! Wear it from Customise.`);
}

/**
 * A hat or a dance. Unlike a pet, these can be bought from anywhere (a locked dance in the Dances picker opens the
 * shop wherever you are), and the player's own screen says how it went from their profile.
 */
function buyItem(player: string, key: string) {
  const seat = gameSeat(player);
  const ware = wareOf(key);
  if (!seat || !ware) return;
  const p = profileOf({ name: seat.name });
  const what = ware.kind === 'dance' ? `“${ware.name}”` : `the ${ware.name.toLowerCase()}`;
  if (p?.items.includes(key)) return tell(player, `You already have ${what}.`);
  if (!debit({ name: seat.name }, ware.price, `for ${what}`)) return tell(player, `That’s ${money(ware.price)}, and you have ${money(p?.coins ?? 0)}.`);
  grantItem({ name: seat.name }, key);
  tell(player, boughtNote(ware));
}

// ---------------------------------------------------------------- blackjack

const bjIndex = (player: string) => bj.findIndex((s) => s?.player === player);
const pkIndex = (player: string) => table.seats.findIndex((s) => s?.player === player);
const rlIndex = (player: string) => wheel.seats.findIndex((s) => s?.player === player);
const slIndex = (player: string) => machines.findIndex((m) => m.seat?.player === player);
/** Already sitting at another table (or a slot machine): which, to say so. */
const elsewhere = (player: string, here: 'bj' | 'pk' | 'rl' | 'sl') =>
  here !== 'bj' && bjIndex(player) >= 0
    ? 'blackjack table'
    : here !== 'pk' && pkIndex(player) >= 0
      ? 'poker table'
      : here !== 'rl' && rlIndex(player) >= 0
        ? 'roulette table'
        : here !== 'sl' && slIndex(player) >= 0
          ? 'slot machine'
          : null;

function bjSit(player: string, i: number) {
  const seat = gameSeat(player);
  if (!seat || !(i >= 0 && i < BJ_SEATS)) return;
  if (!inCasino(seat.id)) return;
  const other = elsewhere(player, 'bj');
  if (other) return tell(player, `Leave the ${other} first.`);
  const mine = bjIndex(player);
  if (mine === i) return;
  if (bj[i]) return tell(player, `${bj[i]!.name} is sitting there.`);
  if (mine >= 0) {
    // Moving seats between hands.
    if (bj[mine]!.state === 'playing' || bj[mine]!.state === 'dealer') return tell(player, 'Finish this hand first.');
    bj[mine] = null;
  }
  bj[i] = {
    player,
    seatId: seat.id,
    name: seat.name.trim(),
    away: null,
    shoe: newShoe(6),
    state: 'betting',
    bet: 0,
    cards: [],
    dealer: [],
    revealed: false,
    result: null,
    paid: 0,
    until: null,
    nextAt: 0,
    idleSince: Date.now(),
    leaving: false,
  };
  bump();
}

/** The next card from this seat's shoe (six decks, shuffled again when it runs low). */
function draw(s: BjSeat): Card {
  if (s.shoe.length < 60) s.shoe = newShoe(6);
  return s.shoe.pop()!;
}

function bjDeal(player: string, raw: unknown) {
  const s = bj[bjIndex(player)];
  if (!s || s.leaving || (s.state !== 'betting' && s.state !== 'done')) return;
  const bet = wholeDollars(raw);
  if (bet < BJ_MIN || bet > BJ_MAX) return tell(player, `Bets are ${money(BJ_MIN)} to ${money(BJ_MAX)}.`);
  if (!debit(who(s), bet, 'bet at blackjack')) return tell(player, `You have ${money(coinsOf(s.name))}: bet a little less.`);
  s.bet = bet;
  s.cards = [draw(s)];
  s.dealer = [draw(s)];
  s.cards.push(draw(s));
  s.dealer.push(draw(s));
  s.revealed = false;
  s.result = null;
  s.paid = 0;
  s.idleSince = Date.now();
  // A blackjack on either side ends it straight away (the dealer peeks under a ten or an ace).
  if (isBlackjack(s.cards) || isBlackjack(s.dealer)) settle(s);
  else {
    s.state = 'playing';
    s.until = Date.now() + BJ_TURN_MS;
  }
  bump();
}

function bjMove(player: string, move: 'hit' | 'stand' | 'double') {
  const s = bj[bjIndex(player)];
  if (!s || s.state !== 'playing') return;
  s.until = Date.now() + BJ_TURN_MS;
  if (move === 'double') {
    if (s.cards.length !== 2) return;
    if (!debit(who(s), s.bet, 'doubled at blackjack')) return tell(player, `Doubling takes another ${money(s.bet)}.`);
    s.bet *= 2;
    s.cards.push(draw(s));
    standOrBust(s);
  } else if (move === 'hit') {
    s.cards.push(draw(s));
    const t = bjTotal(s.cards).total;
    if (t > 21) settle(s);
    else if (t === 21) standOrBust(s);
  } else standOrBust(s);
  bump();
}

/** The player is done: bust, or over to the dealer. */
function standOrBust(s: BjSeat) {
  if (bjTotal(s.cards).total > 21) return settle(s);
  s.state = 'dealer';
  s.until = null;
  s.nextAt = Date.now() + DEALER_STEP_MS * 0.6;
}

/** The dealer turns the hole card, then draws to 17, a card at a time. */
function dealerStep(s: BjSeat, now: number) {
  if (now < s.nextAt) return;
  s.nextAt = now + DEALER_STEP_MS;
  if (!s.revealed) s.revealed = true;
  else if (!dealerStands(s.dealer)) s.dealer.push(draw(s));
  else settle(s);
  bump();
}

function settle(s: BjSeat) {
  const p = bjTotal(s.cards).total;
  const d = bjTotal(s.dealer).total;
  const pBJ = isBlackjack(s.cards);
  const dBJ = isBlackjack(s.dealer);
  let result: BjResult;
  let paid = 0;
  if (p > 21) result = 'bust';
  else if (pBJ && !dBJ) {
    result = 'blackjack';
    // 3:2, with any half dollar rounded down (rounding up made $1 hands better than even for the player).
    paid = s.bet + Math.floor(s.bet * 1.5);
  } else if (pBJ && dBJ) {
    result = 'push';
    paid = s.bet;
  } else if (dBJ) result = 'lose';
  else if (d > 21 || p > d) {
    result = 'win';
    paid = s.bet * 2;
  } else if (p === d) {
    result = 'push';
    paid = s.bet;
  } else result = 'lose';
  if (paid) credit(who(s), paid, result === 'blackjack' ? 'for a blackjack!' : result === 'win' ? 'won at blackjack' : 'back, a push at blackjack');
  s.result = result;
  s.paid = paid;
  s.state = 'done';
  s.revealed = true;
  s.until = null;
  s.idleSince = Date.now();
  if (s.leaving) bj[bj.indexOf(s)] = null;
  bump();
}

function bjLeave(player: string) {
  const i = bjIndex(player);
  const s = bj[i];
  if (!s) return;
  // A hand in play is stood on and paid out first.
  if (s.state === 'playing') {
    s.leaving = true;
    standOrBust(s);
  } else if (s.state === 'dealer') s.leaving = true;
  else bj[i] = null;
  bump();
}

function bjTick(now: number) {
  for (const s of bj) {
    if (!s) continue;
    if (s.state === 'dealer') dealerStep(s, now);
    else if (s.state === 'playing' && s.until && now > s.until) {
      standOrBust(s);
      tell(s.player, 'Time’s up: you stand.');
    } else if ((s.state === 'betting' || s.state === 'done') && now - s.idleSince > BJ_IDLE_MS) bjLeave(s.player);
  }
}

function bjView(s: BjSeat, mine: boolean): BjSeatView {
  const dealer = s.revealed || s.dealer.length < 2 ? s.dealer : [s.dealer[0], HIDDEN];
  return {
    name: s.name,
    mine,
    state: s.state,
    bet: s.bet,
    cards: s.cards,
    dealer,
    result: s.result,
    paid: s.paid,
    canDouble: s.state === 'playing' && s.cards.length === 2,
    until: s.until,
  };
}

// ---------------------------------------------------------------- Texas hold'em

/** The next seat round from `from` (clockwise) that passes `ok`, or null. */
function nextSeat(from: number, ok: (s: PkSeat) => boolean): number | null {
  for (let k = 1; k <= PK_SEATS; k++) {
    const i = (((from + k) % PK_SEATS) + PK_SEATS) % PK_SEATS;
    const s = table.seats[i];
    if (s && ok(s)) return i;
  }
  return null;
}

const live = () => table.seats.filter((s): s is PkSeat => Boolean(s?.inHand && !s.folded));
const needsToAct = (s: PkSeat) => s.inHand && !s.folded && !s.allIn && (!s.acted || s.bet < table.toMatch);
const playing = () => table.stage !== 'waiting' && table.stage !== 'showdown';
const potTotal = () => table.seats.reduce((sum, s) => sum + (s?.inHand ? s.total : 0), 0) + table.dead.reduce((sum, c) => sum + c.amount, 0);

function pkSit(player: string, i: number, raw: unknown) {
  const seat = gameSeat(player);
  if (!seat || !(i >= 0 && i < PK_SEATS) || !inCasino(seat.id)) return;
  const other = elsewhere(player, 'pk');
  if (other) return tell(player, `Leave the ${other} first.`);
  if (pkIndex(player) >= 0) return;
  if (table.seats[i]) return tell(player, `${table.seats[i]!.name} is sitting there.`);
  const buyIn = Math.max(PK.minBuy, Math.min(PK.maxBuy, wholeDollars(raw)));
  if (!debit({ name: seat.name }, buyIn, 'for poker chips')) return tell(player, `Chips start at ${money(PK.minBuy)}, and you have ${money(coinsOf(seat.name))}.`);
  table.seats[i] = {
    player,
    seatId: seat.id,
    name: seat.name.trim(),
    away: null,
    stack: buyIn,
    bet: 0,
    total: 0,
    cards: [],
    inHand: false,
    folded: false,
    allIn: false,
    acted: false,
    out: false,
    last: null,
    won: 0,
    hand: null,
    shown: false,
    missed: 0,
    leaving: false,
  };
  // A moment for anyone else coming to sit down before the first hand.
  if (table.stage === 'waiting') table.next = { at: Date.now() + 5000, step: 'start' };
  bump();
}

/** Their chips go back into their money, and the seat is free. Chips they'd put in this hand stay in the pot. */
function cashOut(i: number) {
  const s = table.seats[i];
  if (!s) return;
  if (s.inHand && playing() && s.total > 0) table.dead.push({ id: `gone:${s.player}`, amount: s.total, folded: true });
  if (s.stack > 0) credit(who(s), s.stack, 'cashed out from poker');
  table.seats[i] = null;
  bump();
}

function pkLeave(player: string) {
  const i = pkIndex(player);
  const s = table.seats[i];
  if (!s) return;
  if (playing() && s.inHand && !s.folded) {
    if (s.allIn) {
      // All in: they stay in for what's in the pot, and are cashed out when the hand ends.
      s.leaving = true;
      tell(player, 'You’re all in: your winnings (if any) come to you when this hand ends.');
      return bump();
    }
    s.folded = true;
    s.last = 'Fold';
    const wasTurn = table.turn === i;
    cashOut(i);
    if (live().length === 1) winByFold(live()[0]);
    else if (wasTurn) afterAction(i);
    return bump();
  }
  cashOut(i);
}

function post(s: PkSeat, amount: number, what: string) {
  const pay = Math.min(s.stack, amount);
  s.stack -= pay;
  s.bet += pay;
  s.total += pay;
  if (s.stack === 0) s.allIn = true;
  s.last = what;
}

function startHand() {
  table.next = null;
  // First, anyone leaving or out of chips gets up.
  table.seats.forEach((s, i) => {
    if (!s) return;
    if (s.leaving) cashOut(i);
    else if (s.stack <= 0) {
      tell(s.player, 'Out of chips! Buy in again to keep playing.');
      table.seats[i] = null;
    }
  });
  const ready = table.seats.filter((s): s is PkSeat => Boolean(s && s.stack > 0 && !s.out));
  for (const s of table.seats) {
    if (!s) continue;
    Object.assign(s, { bet: 0, total: 0, cards: [], inHand: ready.includes(s), folded: false, allIn: false, acted: false, last: null, won: 0, hand: null, shown: false });
  }
  Object.assign(table, { board: [], pots: [], dead: [], turn: null, until: null, toMatch: 0, minRaise: PK.big });
  if (ready.length < 2) {
    table.stage = 'waiting';
    const seated = table.seats.filter(Boolean).length;
    table.note = seated ? (seated === ready.length ? 'Waiting for another player' : 'Waiting for players who are back') : 'Take a seat to play';
    return bump();
  }
  table.hand += 1;
  table.deck = rigged ? [...rigged].reverse() : newShoe(1);
  rigged = null;
  const button = nextSeat(table.button ?? -1, (s) => s.inHand)!;
  table.button = button;
  // Heads up, the button is the small blind.
  const sb = ready.length === 2 ? button : nextSeat(button, (s) => s.inHand)!;
  const bb = nextSeat(sb, (s) => s.inHand)!;
  post(table.seats[sb]!, PK.small, 'Small blind');
  post(table.seats[bb]!, PK.big, 'Big blind');
  table.toMatch = PK.big;
  table.minRaise = PK.big;
  for (let k = 0; k < 2; k++) for (const s of table.seats) if (s?.inHand) s.cards.push(table.deck.pop()!);
  table.stage = 'preflop';
  table.note = '';
  setTurn(nextSeat(bb, needsToAct));
}

function setTurn(i: number | null) {
  if (i === null) return endRound();
  table.turn = i;
  table.until = Date.now() + PK.turnMs;
  bump();
}

/** After someone's move: the next player, or the end of the round, or the hand if everyone else folded. */
function afterAction(from: number) {
  const left = live();
  if (left.length === 1) return winByFold(left[0]);
  const next = nextSeat(from, needsToAct);
  if (next !== null) setTurn(next);
  else endRound();
}

function endRound() {
  for (const s of table.seats) {
    if (!s) continue;
    s.bet = 0;
    s.acted = false;
    if (!s.allIn && !s.folded) s.last = null;
  }
  table.turn = null;
  table.until = null;
  table.toMatch = 0;
  table.minRaise = PK.big;
  table.next = { at: Date.now() + 900, step: table.stage === 'river' ? 'showdown' : 'street' };
  bump();
}

function street() {
  table.next = null;
  table.deck.pop();
  if (table.stage === 'preflop') {
    table.board.push(table.deck.pop()!, table.deck.pop()!, table.deck.pop()!);
    table.stage = 'flop';
  } else if (table.stage === 'flop') {
    table.board.push(table.deck.pop()!);
    table.stage = 'turn';
  } else {
    table.board.push(table.deck.pop()!);
    table.stage = 'river';
  }
  // Everyone (or all but one) all in: the rest of the board comes out by itself.
  if (live().filter((s) => !s.allIn).length <= 1) {
    for (const s of live()) s.shown = true;
    table.next = { at: Date.now() + 1400, step: table.stage === 'river' ? 'showdown' : 'street' };
    return bump();
  }
  setTurn(nextSeat(table.button ?? 0, needsToAct));
}

/** Seat indices round from the left of the button, for who gets an odd chip. */
const fromButton = () => Array.from({ length: PK_SEATS }, (_, k) => String(((table.button ?? 0) + 1 + k) % PK_SEATS));

function showdown() {
  table.next = null;
  const contribs: Contribution[] = [...table.dead];
  table.seats.forEach((s, i) => s?.inHand && contribs.push({ id: String(i), amount: s.total, folded: s.folded }));
  const values = new Map<string, ReturnType<typeof bestHand>>();
  table.seats.forEach((s, i) => s?.inHand && !s.folded && values.set(String(i), bestHand([...s.cards, ...table.board])));
  table.pots = [];
  for (const pot of splitPots(contribs)) {
    const top = Math.max(...pot.eligible.map((id) => values.get(id)?.score ?? -1));
    const winners = pot.eligible.filter((id) => values.get(id)?.score === top);
    const shares = sharePot(pot.amount, winners, fromButton());
    for (const [id, n] of Object.entries(shares)) {
      const s = table.seats[Number(id)]!;
      s.stack += n;
      s.won += n;
    }
    table.pots.push({ amount: pot.amount, winners: winners.map((id) => table.seats[Number(id)]!.name) });
  }
  const shown = live();
  for (const s of shown) {
    const i = table.seats.indexOf(s);
    s.shown = shown.length > 1;
    s.hand = values.get(String(i))?.name ?? null;
    if (s.won > 0) s.last = `Wins ${money(s.won)}`;
  }
  const best = [...shown].sort((a, b) => b.won - a.won)[0];
  const winners = shown.filter((s) => s.won > 0);
  table.note =
    winners.length > 1
      ? `${winners.map((s) => s.name).join(' and ')} share the pot`
      : best
        ? `${best.name} wins ${money(best.won)} with ${best.hand ? best.hand.charAt(0).toLowerCase() + best.hand.slice(1) : 'the best hand'}`
        : '';
  finishHand(7000);
}

function winByFold(s: PkSeat) {
  const pot = potTotal();
  s.stack += pot;
  s.won = pot;
  s.last = `Wins ${money(pot)}`;
  table.pots = [{ amount: pot, winners: [s.name] }];
  table.note = `${s.name} takes ${money(pot)}: everyone else folded`;
  finishHand(3500);
}

function finishHand(pause: number) {
  table.stage = 'showdown';
  table.turn = null;
  table.until = null;
  for (const s of table.seats) if (s) s.bet = 0;
  table.next = { at: Date.now() + pause, step: 'start' };
  bump();
}

function pkMove(player: string, a: Extract<CasinoAction, { k: 'pk' }>) {
  const i = pkIndex(player);
  const s = table.seats[i];
  if (!s) return;
  if (a.do === 'leave') return pkLeave(player);
  if (a.do === 'back') {
    s.out = false;
    s.missed = 0;
    if (table.stage === 'waiting') table.next = { at: Date.now() + 1500, step: 'start' };
    return bump();
  }
  if (a.do === 'sit' || !('hand' in a)) return;
  if (!playing() || table.turn !== i || a.hand !== table.hand) return;
  s.missed = 0;
  act(i, a.do, a.do === 'raise' ? wholeDollars(a.to) : 0);
}

/** Whether this seat may raise now: they haven't had their say since the last full raise, and someone can answer. */
function mayRaise(i: number): boolean {
  const s = table.seats[i];
  if (!s || s.acted || s.stack <= table.toMatch - s.bet) return false;
  return live().some((o) => o !== s && !o.allIn);
}

function act(i: number, move: 'fold' | 'check' | 'call' | 'allin' | 'raise', to: number) {
  const s = table.seats[i]!;
  const owe = table.toMatch - s.bet;
  if (move === 'check' && owe > 0) move = 'call';
  if (move === 'allin') {
    if (s.bet + s.stack > table.toMatch && mayRaise(i)) {
      move = 'raise';
      to = s.bet + s.stack;
    } else move = 'call';
  }
  if (move === 'raise' && !mayRaise(i)) move = 'call';
  if (move === 'fold') {
    s.folded = true;
    s.last = 'Fold';
  } else if (move === 'check') {
    s.last = 'Check';
  } else if (move === 'call') {
    const pay = Math.min(owe, s.stack);
    post(s, pay, pay === 0 ? 'Check' : `Call ${money(pay)}`);
    if (s.allIn) s.last = `All in ${money(s.total)}`;
  } else {
    const most = s.bet + s.stack;
    const least = Math.min(most, table.toMatch === 0 ? PK.big : table.toMatch + table.minRaise);
    const target = Math.max(least, Math.min(most, to));
    const raise = target - table.toMatch;
    const opening = table.toMatch === 0;
    post(s, target - s.bet, opening ? `Bet ${money(target)}` : `Raise to ${money(target)}`);
    // A full raise reopens the betting for everyone; an all-in for less than a full raise doesn't.
    if (raise >= table.minRaise) {
      table.minRaise = raise;
      for (const o of table.seats) if (o && o !== s) o.acted = false;
    }
    table.toMatch = Math.max(table.toMatch, target);
    if (s.allIn) s.last = `All in ${money(s.total)}`;
  }
  s.acted = true;
  afterAction(i);
}

function pkTick(now: number) {
  if (table.next && now >= table.next.at) {
    const step = table.next.step;
    if (step === 'start') startHand();
    else if (step === 'street') street();
    else showdown();
  }
  if (!playing() || table.turn === null) return;
  const s = table.seats[table.turn];
  if (!s) return afterAction(table.turn);
  // Sitting out, or out of time: check if they can, fold if not.
  if (s.out || (table.until && now > table.until)) {
    const free = table.toMatch - s.bet <= 0;
    if (!s.out) {
      s.missed += 1;
      if (s.missed >= 2) {
        s.out = true;
        tell(s.player, 'You’ve missed two turns, so you’re sitting out. Press “I’m back” to play again.');
      }
    }
    act(table.turn, free ? 'check' : 'fold', 0);
    s.last = `${free ? 'Check' : 'Fold'} (no time)`;
  }
}

function pkView(player: string | null): PkView {
  const t = table;
  const seats = t.seats.map((s): PkSeatView | null => {
    if (!s) return null;
    const mine = s.player === player;
    const cards = mine || s.shown ? s.cards : s.inHand && !s.folded && s.cards.length ? [HIDDEN, HIDDEN] : [];
    return {
      name: s.name,
      mine,
      stack: s.stack,
      bet: s.bet,
      inHand: s.inHand,
      folded: s.folded,
      allIn: s.allIn,
      out: s.out,
      cards,
      last: s.last,
      won: s.won,
      hand: s.shown || mine ? s.hand : null,
    };
  });
  const turnSeat = t.turn !== null ? t.seats[t.turn] : null;
  return {
    seats,
    hand: t.hand,
    stage: t.stage,
    board: t.board,
    pot: t.stage === 'showdown' ? t.pots.reduce((sum, p) => sum + p.amount, 0) : potTotal(),
    pots: t.stage === 'showdown' ? t.pots : [],
    button: t.button,
    turn: t.turn,
    until: t.until,
    toMatch: t.toMatch,
    minRaise: turnSeat ? Math.min(turnSeat.bet + turnSeat.stack, t.toMatch === 0 ? PK.big : t.toMatch + t.minRaise) : 0,
    canRaise: t.turn !== null && mayRaise(t.turn),
    note: t.note,
  };
}

// ---------------------------------------------------------------- roulette

interface RlSeat extends Who {
  bets: Record<string, number>;
  ready: boolean;
  staked: number;
  won: number;
}

/** The roulette table. Bets are promised while betting is open and taken when the ball is thrown. */
const wheel: {
  seats: (RlSeat | null)[];
  stage: RlView['stage'];
  closes: number | null;
  spin: RlView['spin'];
  history: number[];
  /** The bets riding on the ball in the air, by name: paid when it settles, even if their owner has left. */
  riding: { name: string; player: string; bets: Record<string, number>; staked: number }[];
  /** When the called number gives way to betting again. */
  resultUntil: number;
} = { seats: Array.from({ length: RL_SEATS }, () => null), stage: 'betting', closes: null, spin: null, history: [], riding: [], resultUntil: 0 };

const staked = (bets: Record<string, number>) => Object.values(bets).reduce((a, b) => a + b, 0);

function rlSit(player: string, i: number) {
  const seat = gameSeat(player);
  if (!seat || !(i >= 0 && i < RL_SEATS) || !inCasino(seat.id)) return;
  const other = elsewhere(player, 'rl');
  if (other) return tell(player, `Leave the ${other} first.`);
  const mine = rlIndex(player);
  if (mine === i) return;
  if (wheel.seats[i]) return tell(player, `${wheel.seats[i]!.name} is sitting there.`);
  if (mine >= 0) wheel.seats[mine] = null;
  wheel.seats[i] = { player, seatId: seat.id, name: seat.name.trim(), away: null, bets: {}, ready: false, staked: 0, won: 0 };
  bump();
}

function rlLeave(player: string) {
  const i = rlIndex(player);
  if (i < 0) return;
  // (Bets not yet taken just go; any riding on the ball are paid when it lands.)
  wheel.seats[i] = null;
  bump();
}

function rlBet(player: string, key: unknown, raw: unknown) {
  const s = wheel.seats[rlIndex(player)];
  if (!s || wheel.stage !== 'betting' || !isBet(key)) return;
  const amount = wholeDollars(raw);
  if (amount <= 0) return;
  const total = staked(s.bets) + amount;
  if (total > RL.max) return tell(player, `Up to ${money(RL.max)} a spin.`);
  if (total > coinsOf(s.name)) return tell(player, `You have ${money(coinsOf(s.name))}.`);
  s.bets = { ...s.bets, [key]: (s.bets[key] ?? 0) + amount };
  s.ready = false;
  wheel.closes ??= Date.now() + RL.betMs;
  bump();
}

function rlClear(player: string) {
  const s = wheel.seats[rlIndex(player)];
  if (!s || wheel.stage !== 'betting') return;
  s.bets = {};
  s.ready = false;
  if (!wheel.seats.some((x) => x && staked(x.bets) > 0)) wheel.closes = null;
  bump();
}

function rlReady(player: string) {
  const s = wheel.seats[rlIndex(player)];
  if (!s || wheel.stage !== 'betting' || !staked(s.bets)) return;
  s.ready = true;
  bump();
}

/** No more bets: each player's chips are taken from their money, and the ball is thrown. */
function throwBall(now: number) {
  wheel.riding = [];
  for (const s of wheel.seats) {
    if (!s) continue;
    const total = staked(s.bets);
    s.staked = 0;
    s.won = 0;
    if (!total) continue;
    if (!debit(who(s), total, 'bet at roulette')) {
      tell(s.player, 'Not enough money for those bets any more: they’re off the table.');
      s.bets = {};
      continue;
    }
    s.staked = total;
    wheel.riding.push({ name: s.name, player: s.player, bets: s.bets, staked: total });
  }
  wheel.closes = null;
  if (!wheel.riding.length) return bump();
  const n = riggedN ?? randomBelow(37);
  riggedN = null;
  wheel.spin = { n, at: now + 400, until: now + 400 + RL.spinMs, no: (wheel.spin?.no ?? 0) + 1 };
  wheel.stage = 'spinning';
  bump();
}

function settleWheel(now: number) {
  const n = wheel.spin!.n;
  for (const r of wheel.riding) {
    const back = payout(r.bets, n);
    if (back > 0) credit({ name: r.name }, back, 'won at roulette');
    const s = wheel.seats[rlIndex(r.player)];
    if (s) s.won = back;
  }
  wheel.riding = [];
  wheel.history = [...wheel.history, n].slice(-12);
  wheel.stage = 'result';
  wheel.resultUntil = now + RL.resultMs;
  bump();
}

function rlTick(now: number) {
  if (wheel.stage === 'betting') {
    const seated = wheel.seats.filter((s): s is RlSeat => Boolean(s));
    const betting = seated.filter((s) => staked(s.bets) > 0);
    // Everyone with chips down has said so (and nobody else is still choosing), or time's up.
    const allReady = betting.length > 0 && betting.every((s) => s.ready) && seated.every((s) => s.ready || !staked(s.bets));
    if (betting.length && ((wheel.closes && now >= wheel.closes) || allReady)) throwBall(now);
  } else if (wheel.stage === 'spinning' && wheel.spin && now >= wheel.spin.until) settleWheel(now);
  else if (wheel.stage === 'result' && now >= wheel.resultUntil) {
    wheel.stage = 'betting';
    for (const s of wheel.seats) if (s) Object.assign(s, { bets: {}, ready: false });
    bump();
  }
}

function rlView(player: string | null): RlView {
  return {
    seats: wheel.seats.map((s) => (s ? { name: s.name, mine: s.player === player, bets: s.bets, ready: s.ready, staked: s.staked, won: s.won } : null)),
    stage: wheel.stage,
    closes: wheel.closes,
    spin: wheel.spin,
    history: wheel.history,
  };
}

// ---------------------------------------------------------------- the slot machines

/** Each machine: who's playing it, and its last pull (kept when they go, so its reels stay where they stopped). */
const machines: { seat: Who | null; spin: SlMachineView['spin']; readyAt: number }[] = Array.from({ length: SL_MACHINES }, () => ({ seat: null, spin: null, readyAt: 0 }));
/** Pulls whose reels are still turning: paid when the last one stops, even if the player has walked off. */
let pulls: { name: string; bet: number; won: number; until: number }[] = [];
/** Tests only (with ?debug): what the next pull's reels stop on. */
let riggedReels: number[] | null = null;

function slSit(player: string, i: number) {
  const seat = gameSeat(player);
  if (!seat || !(i >= 0 && i < SL_MACHINES) || !inCasino(seat.id)) return;
  const other = elsewhere(player, 'sl');
  if (other) return tell(player, `Leave the ${other} first.`);
  const mine = slIndex(player);
  if (mine === i) return;
  if (machines[i].seat) return tell(player, `${machines[i].seat!.name} is playing that one.`);
  if (mine >= 0) machines[mine].seat = null;
  machines[i].seat = { player, seatId: seat.id, name: seat.name.trim(), away: null };
  bump();
}

function slLeave(player: string) {
  const i = slIndex(player);
  if (i < 0) return;
  machines[i].seat = null;
  bump();
}

/** A pull of the lever: the stake taken, the reels decided. Pulls while the reels are still turning (or just after) do nothing. */
function slPull(player: string, bet: unknown) {
  const m = machines[slIndex(player)];
  if (!m?.seat || !isSlotBet(bet)) return;
  const now = Date.now();
  if (now < m.readyAt) return;
  if (!debit(who(m.seat), bet, 'on the slots')) return tell(player, `A pull is ${money(bet)}, and you have ${money(coinsOf(m.seat.name))}.`);
  const reels = riggedReels ?? [0, 1, 2].map(() => symbolAt(randomBelow(SLOT_STOPS)));
  riggedReels = null;
  const won = bet * linePays(reels).times;
  const at = now + SL.pullMs;
  m.spin = { reels, bet, won, at, no: (m.spin?.no ?? 0) + 1 };
  m.readyAt = at + SL.stops[2] + SL.coolMs;
  pulls.push({ name: m.seat.name, bet, won, until: at + SL.stops[2] });
  bump();
}

function slTick(now: number) {
  const due = pulls.filter((p) => now >= p.until);
  if (!due.length) return;
  pulls = pulls.filter((p) => now < p.until);
  for (const p of due) if (p.won > 0) credit({ name: p.name }, p.won, p.won >= p.bet * 100 ? 'for the JACKPOT!' : 'won on the slots');
  bump();
}

function slView(player: string | null): SlMachineView[] {
  return machines.map((m) => ({ name: m.seat?.name ?? null, mine: Boolean(player && m.seat?.player === player), spin: m.spin, readyAt: m.readyAt }));
}

// ---------------------------------------------------------------- players coming and going

/** Players who've left the casino, dropped off or given up their seat in the game lose their table seats. */
function checkAway(now: number, online: Record<string, true>) {
  const g = useHost.getState().g;
  const here = (s: Who) => g.seats.some((x) => x.id === s.seatId && x.playerId === s.player) && online[s.player] && inCasino(s.seatId);
  for (const s of [...bj, ...table.seats, ...wheel.seats, ...machines.map((m) => m.seat)]) {
    if (!s) continue;
    if (here(s)) s.away = null;
    else if (s.away === null) s.away = now;
    else if (now - s.away > AWAY_MS) {
      s.away = null;
      if (bj.includes(s as BjSeat)) bjLeave(s.player);
      else if (wheel.seats.includes(s as RlSeat)) rlLeave(s.player);
      else if (machines.some((m) => m.seat === s)) slLeave(s.player);
      else pkLeave(s.player);
    }
  }
}

/** Who's in the casino, so their pages get the tables when they walk in. */
let presentKey = '';
function checkPresent() {
  const key = useHost
    .getState()
    .g.seats.filter((s) => s.playerId && inCasino(s.id))
    .map((s) => s.id)
    .join();
  if (key !== presentKey) {
    presentKey = key;
    bump();
  }
}

/** Pets are bought at the casino: one worn without being owned (from before, or another page) goes home. */
function checkPets() {
  const g = useHost.getState().g;
  const unowned = (name: string, pet: PetId | null | undefined) => Boolean(pet && profileOf({ name }) && !profileOf({ name })!.pets.includes(pet));
  if (!g.seats.some((s) => s.look && unowned(s.name, s.look.pet))) return;
  useHost.getState().update((x) => {
    for (const s of x.seats) if (s.look && unowned(s.name, s.look.pet)) s.look = { ...s.look, pet: null };
  });
}

// ---------------------------------------------------------------- keeping chips safe

interface Saved {
  chips: { name: string; amount: number; why: string }[];
}

/** What would go back to each player if this page closed now: chips on the table, bets in play. */
function save() {
  const chips: Saved['chips'] = [];
  for (const s of table.seats) if (s) chips.push({ name: s.name, amount: s.stack + (playing() && s.inHand ? s.total : 0), why: 'back from the poker table' });
  for (const s of bj) if (s && (s.state === 'playing' || s.state === 'dealer')) chips.push({ name: s.name, amount: s.bet, why: 'back from blackjack' });
  for (const r of wheel.riding) chips.push({ name: r.name, amount: r.staked, why: 'back from roulette' });
  for (const p of pulls) chips.push({ name: p.name, amount: p.bet, why: 'back from the slots' });
  saveJSON(SAVE_KEY, { chips: chips.filter((c) => c.amount > 0) } satisfies Saved);
}

/** Anything left on the tables when this page last closed goes back to its owner. */
function refund() {
  const saved = loadJSON<Saved | null>(SAVE_KEY, null);
  for (const c of saved?.chips ?? []) if (typeof c?.name === 'string' && c.amount > 0) credit({ name: c.name }, Math.floor(c.amount), String(c.why ?? 'back from the casino'));
  saveJSON(SAVE_KEY, { chips: [] });
}

// ---------------------------------------------------------------- in and out

/** A player's message for the casino. */
export function receiveCasino(player: string, raw: unknown) {
  if (!raw || typeof raw !== 'object') return;
  const a = raw as CasinoAction;
  if (a.k === 'buy') buy(player, String(a.pet));
  else if (a.k === 'buyItem') buyItem(player, String(a.item));
  else if (a.k === 'bj') {
    if (a.do === 'sit') bjSit(player, wholeDollars(a.seat));
    else if (a.do === 'leave') bjLeave(player);
    else if (a.do === 'deal') bjDeal(player, a.bet);
    else if (a.do === 'hit' || a.do === 'stand' || a.do === 'double') bjMove(player, a.do);
  } else if (a.k === 'pk') {
    if (a.do === 'sit') pkSit(player, wholeDollars(a.seat), a.buyIn);
    else if (['leave', 'back', 'fold', 'check', 'call', 'allin', 'raise'].includes(a.do)) pkMove(player, a);
  } else if (a.k === 'rl') {
    if (a.do === 'sit') rlSit(player, wholeDollars(a.seat));
    else if (a.do === 'leave') rlLeave(player);
    else if (a.do === 'bet') rlBet(player, a.bet, a.amount);
    else if (a.do === 'clear') rlClear(player);
    else if (a.do === 'ready') rlReady(player);
  } else if (a.k === 'sl') {
    if (a.do === 'sit') slSit(player, wholeDollars(a.seat));
    else if (a.do === 'leave') slLeave(player);
    else if (a.do === 'spin') slPull(player, a.bet);
  }
  flush();
}

/** What a player sees of the casino: the tables while they're in it (or sitting at one), and nothing otherwise. */
export function casinoFor(player: string | null): CasinoView | null {
  const seat = player ? useHost.getState().g.seats.find((s) => s.playerId === player) : null;
  if (player && !(seat && (inCasino(seat.id) || bjIndex(player) >= 0 || pkIndex(player) >= 0 || rlIndex(player) >= 0 || slIndex(player) >= 0))) return null;
  const note = player ? notes.get(player) : undefined;
  return {
    bj: bj.map((s) => (s ? bjView(s, s.player === player) : null)),
    pk: pkView(player),
    rl: rlView(player),
    sl: slView(player),
    note: note && Date.now() - note.at < NOTE_MS ? note : null,
  };
}

function flush() {
  if (!changed) return;
  changed = false;
  save();
  useCasino.setState((s) => ({ rev: s.rev + 1 }));
}

let started = false;
/** Opens the casino, in the Storyteller's browser. `online`: the players connected right now. */
export function startCasino(online: () => Record<string, true>) {
  if (started) return;
  started = true;
  refund();
  setInterval(() => {
    try {
      const now = Date.now();
      checkAway(now, online());
      checkPresent();
      checkPets();
      bjTick(now);
      pkTick(now);
      rlTick(now);
      slTick(now);
      for (const [p, n] of notes) if (now - n.at > NOTE_MS) notes.delete(p);
    } catch (e) {
      console.error(e);
    }
    flush();
  }, 250);
}

if (debugHooks()) Object.assign(window, { __casino: { bj, table, wheel, casinoFor, receiveCasino, store: useCasino, rig: (cards: Card[]) => void (rigged = cards), rigWheel: (n: number) => void (riggedN = n), machines, rigSlots: (reels: number[]) => void (riggedReels = reels) } });
