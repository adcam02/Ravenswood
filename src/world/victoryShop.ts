/**
 * The victory moves: what each winner does in the lineup when the game ends (see components/Victory.tsx), and up on
 * their stool in the square after. The fist pump is everyone's; the rest are bought at the Lucky Raven's shop as
 * 'win:<id>' and chosen in Customise (the Victory tab), onto the look as `win`. The moves themselves are in
 * victoryMoves.ts; this is just the names and prices, so it's light to import.
 */
export const VICTORY_IDS = [
  'fistpump',
  'default',
  'floss',
  'takel',
  'dab',
  'gangnam',
  'zombie',
  'carlton',
  'worm',
  'moonwalk',
  'pedro',
  'fever',
  'ymca',
  'chestbeat',
  'rocky',
  'landing',
  'bolt',
  'woo',
  'griddy',
  'hotline',
  'macarena',
  'lean',
  'moonpose',
  'ninjarun',
  'jojo',
  'powerup',
  'pointing',
  'micdrop',
  'backflip',
  'bow',
  'pirouette',
] as const;
export type VictoryId = (typeof VICTORY_IDS)[number];

export interface VictoryMove {
  id: VictoryId;
  name: string;
  icon: string;
  /** Free when there's none. */
  price?: number;
  blurb: string;
  /** Said in a bubble over their head in the lineup. */
  shout?: string;
}

export const VICTORY_MOVES: VictoryMove[] = [
  { id: 'fistpump', name: 'Fist pump', icon: '✊', blurb: 'A jump and a punch at the sky, again and again. Everyone has it.' },
  { id: 'default', name: 'The Default', icon: '🕹️', price: 40, blurb: 'Arms swinging, a little kick and a bounce. Every lobby’s favourite.' },
  { id: 'floss', name: 'Floss frenzy', icon: '🦷', price: 20, blurb: 'The floss, twice as fast, with a hop on every swing.' },
  { id: 'takel', name: 'Take the L', icon: '🫵', price: 35, blurb: 'An L on the forehead and a kick-step, for the losing side to see.', shout: 'L!' },
  { id: 'dab', name: 'The Dab', icon: '💪', price: 15, blurb: 'Head down into the elbow, the other arm pointing off to glory.' },
  { id: 'gangnam', name: 'Horse rider style', icon: '🐎', price: 30, blurb: 'Wrists crossed, the shuffle-hop, and a lasso round over the head.', shout: 'Oppa!' },
  { id: 'zombie', name: 'Graveyard groove', icon: '🧟', price: 45, blurb: 'Claws up, a shoulder shrug and a shamble to the side. It’s close to midnight…' },
  { id: 'carlton', name: 'Fresh prince', icon: '🕺', price: 25, blurb: 'The arm swing and the step from the old sitcom, with the big finish.' },
  { id: 'worm', name: 'The worm', icon: '🪱', price: 30, blurb: 'Down on the stage and rippling along it like it’s 1989.' },
  { id: 'moonwalk', name: 'Moonwalk', icon: '🌙', price: 35, blurb: 'Gliding backwards, a spin and up on the toes. Hee-hee!' },
  { id: 'pedro', name: 'Vote for Pedro', icon: '🥾', price: 40, blurb: 'The school-assembly dance: stomping, sliding and flinging those arms about.' },
  { id: 'fever', name: 'Disco fever', icon: '🪩', price: 35, blurb: 'A finger to the ceiling, a finger to the floor, the hips going with it.' },
  { id: 'ymca', name: 'Y.M.C.A.', icon: '🙆', price: 20, blurb: 'Spell it out with your whole body. Everybody knows the words.' },
  { id: 'chestbeat', name: 'Chest beat', icon: '🦍', price: 45, blurb: 'Fists pounding the chest like the giant ape on top of the skyscraper.', shout: 'RAAAWR!' },
  { id: 'rocky', name: 'Top of the steps', icon: '🥊', price: 30, blurb: 'Bouncing on the toes, jabbing, then both arms up at the top of the museum steps.' },
  { id: 'landing', name: 'Superhero landing', icon: '🦸', price: 55, blurb: 'Down out of the sky onto one knee, fist to the floor. It’s very hard on the knees.' },
  { id: 'bolt', name: 'Lightning bolt', icon: '⚡', price: 40, blurb: 'The world’s fastest sprinter’s pose: leaning back and pointing at the sky.' },
  { id: 'woo', name: 'Nature boy strut', icon: '🦚', price: 50, blurb: 'Strutting, chopping and shouting like a sixteen-time champion.', shout: 'WOOOOO!' },
  { id: 'griddy', name: 'The Griddy', icon: '🥽', price: 25, blurb: 'Heel taps, arms swinging, and the goggles. The touchdown classic.' },
  { id: 'hotline', name: 'Late night hotline', icon: '📱', price: 45, blurb: 'The dad-dancing from that music video: shuffling, swaying, pretending to tennis.' },
  { id: 'macarena', name: 'Macarena', icon: '🎶', price: 15, blurb: 'Every paw in turn, a wiggle and a jump. Hey, Macarena!' },
  { id: 'lean', name: 'Antigravity lean', icon: '🎩', price: 70, blurb: 'Leaning right forward, further than anyone should, and back up again. Smooth.' },
  { id: 'moonpose', name: 'In the name of the moon', icon: '🌙', price: 60, blurb: 'A twirl and the magical girl pose: a V over one eye, the other paw on the hip.', shout: 'In the name of the moon!' },
  { id: 'ninjarun', name: 'Ninja run', icon: '🍥', price: 55, blurb: 'Arms streaming out behind, leaning right into it, running on the spot. Believe it!' },
  { id: 'jojo', name: 'Bizarre pose', icon: '💥', price: 65, blurb: 'One dramatic, twisted, utterly impossible pose after another. ゴゴゴ' },
  { id: 'powerup', name: 'Over 9000!', icon: '🔥', price: 80, blurb: 'Fists clenched, crouching, a golden aura and a scream as the power level climbs.', shout: 'It’s over 9000!' },
  { id: 'pointing', name: 'Pointing at myself', icon: '🕷️', price: 35, blurb: 'Pointing at the winner next door, like two spider-heroes who can’t believe it.' },
  { id: 'micdrop', name: 'Mic drop', icon: '🎤', price: 75, blurb: 'One last word into the microphone, held out at arm’s length, and… drop.', shout: 'Goodnight, Ravenswood.' },
  { id: 'backflip', name: 'Backflip', icon: '🤸', price: 60, blurb: 'A crouch, a spring and a full flip backwards, stuck every time.' },
  { id: 'bow', name: 'Grand bow', icon: '🎭', price: 25, blurb: 'A flourish of the paw and a deep, deep bow. Thank you, thank you.' },
  { id: 'pirouette', name: 'Pirouette', icon: '🩰', price: 90, blurb: 'Up on one toe, arms in a circle, spinning like the prima ballerina.' },
];

export const DEFAULT_VICTORY: VictoryId = 'fistpump';
export const victoryKey = (id: VictoryId) => `win:${id}`;
export const victoryMove = (id: string | null | undefined): VictoryMove => VICTORY_MOVES.find((m) => m.id === id) ?? VICTORY_MOVES[0];
/** A known victory move or none (the fist pump). */
export const fixVictory = (v: unknown): VictoryId | null => (v !== DEFAULT_VICTORY && VICTORY_MOVES.some((m) => m.id === v) ? (v as VictoryId) : null);
/** Whether someone with these items may use this move (the free one, or one they've bought). */
export const ownsVictory = (id: VictoryId, items: readonly string[] | undefined) => !victoryMove(id).price || Boolean(items?.includes(victoryKey(id)));
/** The animation that plays it (see Anim in types.ts). */
export const victoryAnim = (id: string | null | undefined) => `win:${victoryMove(id).id}` as const;
