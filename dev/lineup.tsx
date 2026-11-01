// The victory lineup on its own, with made-up winners: ?n=4 how many, ?winner=evil, ?moves=woo,backflip,... their moves.
import { createRoot } from 'react-dom/client';
import '../src/styles/base.css';
import '../src/styles/cosy.css';
import '../src/styles/town.css';
import '../src/styles/victory.css';
import { VictoryLineup } from '../src/components/Victory';
import type { SeatView } from '../src/state/view';
import { ANIMALS, HATS, PETS, type Look } from '../src/world/types';
import { VICTORY_IDS } from '../src/world/victoryShop';

const q = new URLSearchParams(location.search);
const n = Number(q.get('n') ?? 5);
const moves = (q.get('moves') ?? 'woo,backflip,powerup,micdrop,dab,pirouette,jojo,landing').split(',');
const animals = (q.get('animals') ?? 'fox,penguin,bat,highland,octopus,snail,deer,robot,frog,capybara,shark,panda').split(',');
const names = ['Abbey', 'Bob', 'Cara', 'Dev', 'Ellie', 'Finn', 'Gus', 'Hana', 'Ivy', 'Jo', 'Kit', 'Lou'];
const seats = Array.from({ length: n }, (_, i) => {
  const a = ANIMALS.find((x) => x.id === animals[i % animals.length])!;
  const look: Look = { animal: a.id, color: a.colors[0], win: (moves[i % moves.length] as (typeof VICTORY_IDS)[number]) ?? null, hat: i % 3 === 1 ? HATS[i * 3].id : null, pet: i % 2 ? PETS[i * 5].id : null };
  return { id: `s${i}`, name: names[i], label: names[i], dead: i === 2, roleId: ['washerwoman', 'empath', 'monk', 'soldier', 'mayor', 'chef'][i % 6], isMe: i === 0, look } as unknown as SeatView;
});
createRoot(document.getElementById('root')!).render(<VictoryLineup winner={q.get('winner') === 'evil' ? 'evil' : 'good'} seats={seats} reason="The Demon was executed" onDone={() => ((window as unknown as { finished: boolean }).finished = true)} />);
