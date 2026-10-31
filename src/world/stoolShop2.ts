/**
 * More seats and gravestones for the shop, each a nod to a film, a show or a game (none of them the real thing):
 * added to STOOLS and GRAVES in stoolShop.ts after the rest. Their shapes are in town/stools2.ts.
 */

export type PopStoolId =
  | 'grassblock'
  | 'rubik'
  | 'brick'
  | 'sharkbarrel'
  | 'swampstump'
  | 'mushroom'
  | 'qblock'
  | 'chocbar'
  | 'tetris'
  | 'pokeball'
  | 'd20'
  | 'arcadeghost'
  | 'companion'
  | 'pineapple'
  | 'coffin'
  | 'familycouch'
  | 'sortingstool'
  | 'orangecouch'
  | 'jeepseat'
  | 'transporter'
  | 'policebox'
  | 'protonpack'
  | 'falcon'
  | 'lightcycle'
  | 'timecar'
  | 'command'
  | 'oscar'
  | 'catbus'
  | 'gauntlet'
  | 'swordthrone';

/** Cheapest first. */
export const POP_STOOLS: { id: PopStoolId; name: string; icon: string; price: number }[] = [
  { id: 'grassblock', name: 'Blocky grass block', icon: '🟩', price: 25 },
  { id: 'rubik', name: 'Puzzle cube', icon: '🧩', price: 30 },
  { id: 'brick', name: 'Giant toy brick', icon: '🧱', price: 30 },
  { id: 'sharkbarrel', name: 'Shark hunter’s barrel', icon: '🦈', price: 30 },
  { id: 'swampstump', name: 'Ogre’s swamp stump', icon: '🧅', price: 30 },
  { id: 'mushroom', name: 'Power-up mushroom', icon: '🍄', price: 35 },
  { id: 'qblock', name: 'Question block', icon: '❓', price: 35 },
  { id: 'chocbar', name: 'Golden-ticket chocolate bar', icon: '🍫', price: 35 },
  { id: 'tetris', name: 'Falling blocks', icon: '🟪', price: 35 },
  { id: 'pokeball', name: 'Catch-ball beanbag', icon: '🔴', price: 40 },
  { id: 'd20', name: 'Giant twenty-sided die', icon: '🎲', price: 40 },
  { id: 'arcadeghost', name: 'Arcade ghost', icon: '👾', price: 40 },
  { id: 'companion', name: 'Companion cube', icon: '💗', price: 45 },
  { id: 'pineapple', name: 'Undersea pineapple', icon: '🍍', price: 45 },
  { id: 'coffin', name: 'Vampire’s coffin', icon: '🦇', price: 50 },
  { id: 'familycouch', name: 'Cartoon family couch', icon: '🛋️', price: 55 },
  { id: 'sortingstool', name: 'Sorting stool and hat', icon: '🎩', price: 55 },
  { id: 'orangecouch', name: 'Coffee-house orange couch', icon: '☕', price: 60 },
  { id: 'jeepseat', name: 'Dinosaur-park jeep seat', icon: '🦖', price: 60 },
  { id: 'transporter', name: 'Beam-me-up pad', icon: '✨', price: 65 },
  { id: 'policebox', name: 'Blue police box', icon: '📞', price: 70 },
  { id: 'protonpack', name: 'Ghost catcher’s pack', icon: '👻', price: 70 },
  { id: 'falcon', name: 'Smuggler’s cockpit seat', icon: '🚀', price: 85 },
  { id: 'lightcycle', name: 'Light cycle', icon: '🏍️', price: 85 },
  { id: 'timecar', name: 'Time-machine car seat', icon: '⚡', price: 90 },
  { id: 'command', name: 'Starship captain’s chair', icon: '🖖', price: 95 },
  { id: 'oscar', name: 'Golden statuette', icon: '🏆', price: 100 },
  { id: 'catbus', name: 'Cat bus', icon: '🐈', price: 110 },
  { id: 'gauntlet', name: 'Golden gauntlet', icon: '💎', price: 120 },
  { id: 'swordthrone', name: 'Throne of swords', icon: '⚔️', price: 150 },
];

export type PopGraveId =
  | 'blockgrave'
  | 'volleyball'
  | 'tblock'
  | 'orangehood'
  | 'blueghost'
  | 'pirateflag'
  | 'catchball'
  | 'pipe'
  | 'cubegrave'
  | 'gameover'
  | 'noghost'
  | 'purpleshorts'
  | 'pumpkinking'
  | 'excalibur'
  | 'staff'
  | 'triforce'
  | 'llama'
  | 'pineapplehouse'
  | 'priderock'
  | 'idol'
  | 'witchlegs'
  | 'amber'
  | 'hobbitdoor'
  | 'lasersword'
  | 'thumbsup'
  | 'pepperpot'
  | 'onering'
  | 'darkhelm'
  | 'deathstar'
  | 'phonebox';

/** Cheapest first. */
export const POP_GRAVES: { id: PopGraveId; name: string; icon: string; price: number }[] = [
  { id: 'blockgrave', name: 'Blocky stone and sign', icon: '🪧', price: 15 },
  { id: 'volleyball', name: 'Castaway’s volleyball', icon: '🏐', price: 25 },
  { id: 'tblock', name: 'Falling T-block', icon: '🟪', price: 25 },
  { id: 'orangehood', name: 'Orange parka hood', icon: '🧡', price: 30 },
  { id: 'blueghost', name: 'Frightened ghost', icon: '👻', price: 30 },
  { id: 'pirateflag', name: 'Pirate flag', icon: '🏴‍☠️', price: 30 },
  { id: 'catchball', name: 'Catch ball', icon: '🔴', price: 35 },
  { id: 'pipe', name: 'Green warp pipe', icon: '🟢', price: 35 },
  { id: 'cubegrave', name: 'Companion cube', icon: '💗', price: 35 },
  { id: 'gameover', name: 'Game over', icon: '🕹️', price: 40 },
  { id: 'noghost', name: 'No-ghosts sign', icon: '🚫', price: 45 },
  { id: 'purpleshorts', name: 'Torn purple shorts', icon: '🟣', price: 45 },
  { id: 'pumpkinking', name: 'Pumpkin king’s hill', icon: '🎃', price: 50 },
  { id: 'excalibur', name: 'Sword in the stone', icon: '🗡️', price: 55 },
  { id: 'staff', name: 'Wizard’s staff', icon: '🧙', price: 55 },
  { id: 'triforce', name: 'Three golden triangles', icon: '🔺', price: 60 },
  { id: 'llama', name: 'Loot llama', icon: '🦙', price: 60 },
  { id: 'pineapplehouse', name: 'Undersea pineapple house', icon: '🍍', price: 65 },
  { id: 'priderock', name: 'Pride rock', icon: '🦁', price: 70 },
  { id: 'idol', name: 'Golden idol', icon: '🗿', price: 70 },
  { id: 'witchlegs', name: 'Fallen farmhouse', icon: '🏠', price: 75 },
  { id: 'amber', name: 'Mosquito in amber', icon: '🦟', price: 75 },
  { id: 'hobbitdoor', name: 'Round green door', icon: '🚪', price: 80 },
  { id: 'lasersword', name: 'Laser sword in a rock', icon: '⚔️', price: 80 },
  { id: 'thumbsup', name: 'Thumbs up in molten metal', icon: '👍', price: 85 },
  { id: 'pepperpot', name: 'Pepper-pot robot', icon: '🤖', price: 85 },
  { id: 'onering', name: 'The ring on a plinth', icon: '💍', price: 90 },
  { id: 'darkhelm', name: 'Dark lord’s helmet', icon: '⛑️', price: 95 },
  { id: 'deathstar', name: 'Battle moon', icon: '🌑', price: 100 },
  { id: 'phonebox', name: 'Blue police box', icon: '📞', price: 110 },
];
