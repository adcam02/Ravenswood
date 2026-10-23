# Working on Ravenswood (shared brief for this batch)

Ravenswood is a cosy 3D animal town where a group of friends play Blood on the Clocktower with proximity voice.
The Storyteller's browser is the host. Live at https://adcam02.github.io/Ravenswood/ (GitHub Pages serves `docs/`,
which only the lead rebuilds; never touch `docs/`).

Stack: Vite, React 19, TypeScript strict, zustand, three.js r180, PeerJS (WebRTC) mesh.

## Where things are
- `src/state/host.ts`: the host-authoritative `GameState` (`g`), every Storyteller action, `fromPlayer.*` (what a
  player's message may do), `toPublic`/`toPrivate` (what each player is sent). `src/state/types.ts`: GameState,
  `HostMessage`, `ClientMessage`, `TownAction`.
- `src/net/host.ts` receives `ClientMessage`s and calls `st.fromPlayer.*`; `src/net/client.ts` is the player side
  (`window.__client`); `src/state/view.ts` builds the `View` the UI and world read (ST and player alike).
- `src/world/engine.ts`: the 3D world loop (movement, doors, stations/jobs, seating at meetings, emotes,
  achievements triggers, the execution show). `src/world/town/*`: town layout (`layout.ts`: buildings, doors,
  stations, colliders), outdoor buildings (`outdoor.ts`), interiors (`interiors.ts`), `index.ts` ties them.
  `src/world/visit.ts`: the hooded figure's night visits. `src/world/animals.ts` (rig, animation, hat placement
  `HAT_NUDGE`), `recipes.ts` (each animal's sculpt), `hats.ts`, `pets.ts`, `types.ts` (AnimalId/ANIMALS,
  HatId/HATS, FeatId/FEATS, PetId/PETS, Look, zones, booth constants, stations).
- `src/game/progress.ts`: hats, achievements, tallies (currently kept in each player's own browser).
- `src/voice/earshot.ts` (who hears whom, how loud), `src/voice/voice.ts`.
- UI: `src/components/**` (`town/Hud.tsx` is the player's in-world HUD, `town/JoinFlow.tsx` the join and animal
  picker, `town/MiniMap.tsx`, `town/Scenes.tsx`, `TopBar.tsx`, `Modals.tsx` + `src/state/ui.ts` for modals),
  styles in `src/styles/*.css`. Sounds: `src/lib/audio.ts` (synthesised with WebAudio), `ambience.ts`, `music.ts`.
- Test hooks in the page with `?debug`: `window.__host` (zustand store, `.getState().g`), `window.__st.st` (all
  Storyteller actions, e.g. `toggleDead(id)`, and `.fromPlayer`), `window.__engine` (e.g. `place(zone,x,z,ry,false)`,
  `startEmote('dance')`, `goTo(seatId)`), `window.__client`, `window.__local` (my pose), `window.__game.interact()`
  (press E), `window.__presence`.

## Seeing your work
- Dev benches (served by vite): `dev/animals.html` (see `dev/animals-main.ts` for views) and `dev/town.html` (see
  `dev/town-main.ts`; `?zone=tavern&x=0&z=0&t=1&dist=16&yaw=0.3&pitch=0.5`).
- Screenshots from YOUR checkout: `PORT=<yours> node tools/shot-animals.mjs <out-dir> 'view=one&animal=fox&ry=0.6'`
  and `PORT=<yours> VIEWS=a,b node tools/shot-town.mjs <out-dir>` (views are listed in the file; add your own).
- Multiplayer in real browsers: build a copy (`npx vite build --outDir <your scratch dir>/build`) and write a short
  script using `/tmp/claude-0/-home-user-ravenswood/f3f6fd5e-bcab-5998-aa6d-a19b11749b3c/scratchpad/harness.mjs`
  (`setup({dir, port, peer, fps})`, `storyteller()`, `join(room, name, 'Fox')`, `check`, `done`). A worked example:
  `.../scratchpad/thriller/test.mjs`. `page.screenshot` to look. Pass `fps: 6` to keep it light.
- Put all scratch output under `/tmp/claude-0/-home-user-ravenswood/f3f6fd5e-bcab-5998-aa6d-a19b11749b3c/scratchpad/batch/<your letter>/`
  and look with Read (combine shots into contact sheets with Python PIL to save effort).
- `npx tsc --noEmit -p .` must pass before you commit.

## Rules
- Work ONLY in your own checkout (a git worktree on a detached HEAD, node_modules symlinked). Do not touch
  /home/user/ravenswood or any other /home/user/wt-* folder: other helpers are working in parallel in those.
- Use only your own ports (given in your brief) for vite, preview, peer servers and the harness.
- The machine has 4 cores shared by about eight helpers. One browser process at a time, short tests, few views per
  screenshot call. Do NOT run `tools/test-town.mjs` or the long sample game; the lead runs those after merging.
- Never `pkill -f` a pattern that could match your own shell command; kill the specific PIDs you started.
- Australian English and no em dashes anywhere, comments included. Write code that reads like the code around it:
  same naming, idioms and comment density (short, plain comments on the non-obvious bits).
- Keep your changes to your area. Where you must touch a shared file (types.ts, engine.ts, host.ts, state/types.ts,
  Hud.tsx, layout.ts, animals.ts), add rather than rewrite, so the lead can merge everyone's work.
- Anything a player sees should look good on a laptop and on a phone-sized window.
- When done, commit in your worktree (do not push). Several commits are fine. End every commit message with:
  Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
  Claude-Session: https://claude.ai/code/session_01SHr5n4jEUU4286xzpFfxp9
- Report back briefly: commit hashes; what you built and how it works for players and the Storyteller; files
  touched outside your area and why; how you checked it (and what you could not check); anything left rough; paths
  of the screenshots that best show the result.

## Who else is working right now (so you can stay out of each other's way)
- A: voice and presence (mute shown on name plates, smaller hearing radius, shout, door chime and delay entering
  buildings, minimap counts in buildings, names hidden in confession booths, quieter rain).
- B: game flow (a Nominate button for players, accepting the meeting bell, a seating bug, Fang Gu banned at 6 or
  fewer players).
- C: executions (players vote on the method, a spin-the-wheel, firing squad, guillotine, electric chair, missile
  launcher, spit roast, a kaiju's roar and breath, the ghost floating up).
- D: the hooded figure's night visits (six new ones).
- E: animals (penguin fix, a cuter dugong, a meerkat and a skeleton, no drips on water animals, nothing clipping
  through the bed).
- F: a fit pass for every hat on every animal.
- P: profiles kept per player name on the host, money, and more achievements.
- U: character customising (a Customise button on the bar, what can change mid-game, rotating the preview, pets in
  the preview, alphabetical animals, the join screen button, removing face/neck/back accessories, hats making you a
  touch faster).
Later helpers will add pets, new hats, town places (a club, an idea box, more booths), a casino and a pet fight club.
