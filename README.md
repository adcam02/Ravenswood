# Ravenswood

Blood on the Clocktower as a cosy 3D village. Everyone is an animal walking around town, talking with
proximity voice chat: people close by hear you, people across the square don't, and buildings are
private. The Storyteller floats around as a ghost, runs the grimoire and visits players' homes at night.

It's a static site on GitHub Pages, published from the `docs/` folder. There's no server and no
logins: the Storyteller's browser hosts the game, and everyone connects straight to each other.

## Playing

1. **The Storyteller opens the site** and chooses **Host a game**. The invite link is under the room
   code at the top left.
2. **Players open the link**, type their name and pick an animal and colour. Aquatic animals are a
   little bit wet. Anyone named Jarrod is the bunny, skips the picker, and nobody else can be the bunny.
   Then they turn on their microphone (or just listen).
3. **Wander around town.** Talk to whoever is near you. Step into the tavern, the bakery, the church or
   anyone's house to talk privately.
4. **Daytime jobs**, each a little minigame:
   - **Bartender** at the Raven's Rest: pour drinks onto the bar for anyone to pick up.
   - **Laundry** at the washhouse: scrub the mud out and hang it on the line.
   - **Fishing** off the dock at the pond.
   - **Baking** at the bakery: knead, then pull it out of the oven when it's golden.
   - **Gardening** in the beds around the square: plant and water a flower, and watch it grow.
   Hold something and you can sip it, give it to someone (G) or put it away (Q).
5. **The Storyteller carries the grimoire.** Press **Open grimoire** (or Tab) and the camera swoops in
   over your shoulder as the book opens in your hands; its pages hold the circle of seats, the bag, the
   night order and everything else from the Grimoire. Fill the bag, deal characters and press **Show
   players their characters**. Close it to float off again.
   - **Night**: everyone is sent home and their door locks. The Storyteller wakes players with the same
     tools as the Grimoire, and can float into a house to talk to its owner privately.
   - **Day**: everyone comes back outside. Deaths in the night are announced at dawn, and dead players
     become ghosts of their animal: they can still walk around and talk.
   - **Ring the bell** to call everyone to the square. Arriving counts as being there. During a
     meeting everyone around the clock tower hears everyone else, and **Take your seat** hops you onto
     your stool. Nominations and votes work like the Grimoire: the clock hand goes round and players
     raise a paw.
   - **Hold B** (or the megaphone button) to speak to the whole town at once.

### Controls

| Key | Does |
|---|---|
| W A S D, arrows, or click the ground | Walk (Shift to run) |
| E | Use things: jobs, benches, beds, the bar |
| 1 to 6 | Wave, dance, cheer, laugh, cry, sit |
| G / Q | Give what you're holding / put it away |
| M / V | Mute / hold to talk (if push-to-talk is on) |
| [ ] or right-drag, scroll | Turn the camera, zoom |
| Tab | Storyteller: open or close the grimoire |
| B | Storyteller: speak to everyone |

### Slow laptops

The town turns shadows off and drops the resolution by itself if a machine can't keep up (a notice
says so). Add `?fx=low` to the address to start that way.

## How the connection works

Browsers find the Storyteller through the free [PeerJS](https://peerjs.com/) lobby server, then talk
directly. Voice uses the same lobby: every browser connects to every other one, and each voice's volume
is set from how far apart the two animals are. If the lobby is down, the game falls back to a pool of
public Nostr relays (via [Trystero](https://github.com/dmotz/trystero)), but voice needs the lobby.
Each player only ever receives their own character and information.

If the lobby doesn't work for you, run your own PeerServer and put its address in `docs/config.js`.

## Files

| Path | What it is |
|---|---|
| `src/world/` | The 3D town: `engine.ts` (movement, doors, jobs, camera), `animals.ts` (the animals), `town/` (the village and its interiors) |
| `src/jobs/` | The five job minigames |
| `src/voice/` | Proximity voice chat |
| `src/state/host.ts` | The game rules and the Storyteller's actions |
| `src/net/` | The connections |
| `src/components/` | The Storyteller's grimoire tools and the on-screen controls |
| `src/data/` | Characters, night order and jinxes from the official toolmaker resources |
| `docs/` | The published site (built; don't edit by hand) |
| `dev/` | Test pages for the animals, town and minigames (`npm run dev`, then open `/dev/animals.html` and friends) |

## Changing the site

```sh
npm install
npm run dev        # http://localhost:5173
npm run build      # rebuilds docs/
```

Commit the rebuilt `docs/` folder and GitHub Pages updates within a minute or two.

To test with several browsers on one computer, run `npm run peer` (a local lobby on port 9000) and
add `?peer=127.0.0.1:9000` to every address. `node tools/test-town.mjs` runs a full game with a
Storyteller and four players in headless Chrome and saves screenshots.

## Credits

Built on [the Grimoire](https://github.com/adcam02/clocktower). Character data and icons come from
[The Pandemonium Institute's](https://bloodontheclocktower.com/) official resources and are used
under their Community Created Content terms. Blood on the Clocktower is a trademark of Steven Medway
and The Pandemonium Institute. This is an unofficial, non-commercial fan project.
