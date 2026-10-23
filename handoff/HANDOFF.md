# Ravenswood: where the big batch stands (saved before a session limit)

`main` is deployed up to the bakery sign fix, plus the Customise work (helper U, merged and pushed, not yet deployed).

## Preferences
- Australian English, no em dashes. Commit trailers: Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com> and the Claude-Session line.
- Run the full sample game and town test only at key points (after a whole batch, before deploying it). Small fixes: type check, a quick look, deploy.
- Deploy: `npm run build` (writes docs/), commit docs, push main, check `gh run list --repo adcam02/Ravenswood`.
- The 9/11 plane request was declined (re-enacts a real attack). Everything else in the batch is wanted.

## The batch (the user's list) and who had what
Each helper's unfinished work is on branch `wip/<letter>` (based on 3f0bad8, before U's merge; rebase or cherry-pick onto main). The briefs they were given are in `handoff/briefs/batch-common.md` plus the prompts below. Their shared test harness is `handoff/harness.mjs` (paths inside point at the old scratchpad; adjust).

- A (wip/a, voice & presence): mute shown on name plates (red dot), smaller hearing radius, shout button, door chime + short delay entering buildings, minimap shows several people in a building, names hidden in confession booths, quieter rain. Was testing near the end.
- B (wip/b, game flow): Nominate button for players (ST approves), accept-the-bell option, a player not seated on their stool (find root cause), Fang Gu banned at 6 or fewer players. Mid-way (was on the bag modal).
- C (wip/c, executions): players vote 5 s on the method, quick weighted spin-the-wheel, firing squad, guillotine that splits the model, electric chair, missile launcher, spit roast, kaiju roar + breath, a reprieve for each (spared), ghost floats up after. Mid-way (engine edits).
- D (wip/d, night visits): six new hooded figure kills. Near done (rendering views).
- E (wip/e, animals): penguin sides fix, cuter dugong, meerkat and skeleton, no drips on water animals, bed clipping. Mid-way (meerkat and skeleton recipes next).
- F (wip/f, hats): fit pass for every hat on every animal (systematic first, then nudges). Mid-way (an outline solver).
- P (wip/p, profiles): per-name profiles kept by the host (progress, money, owned pets), money earned (win bonus etc.), HUD money, ST Profiles panel with export/import, Xengeath gets 'fanmail' and 'lap', ~15 more achievements. Near done (checking screenshots).
- U (merged): Customise button on the bar, animal locked mid-game, rotate buttons, pet in preview, alphabetical, join screen fix, face/neck/back removed, +0.1% speed per hat.
- H (wip/h, nothing written yet): 15 pop-culture pets (electric mouse, Grogu-like, Totoro-like, soot sprite, Stitch-like, Groot-like sapling, Minion-like, arcade ghost, Kirby-like, Companion Cube, creeper, BB-8-like, R2-D2-like, WALL-E-like, Toothless-like).

## Not started (wave 2)
- H2: 15 more pets (snowy owl, Nyan-style cat, Doge, Grumpy Cat, rubber duck, Tamagotchi, Goomba-like, Chocobo chick, Gizmo-like, Clippy, tribble, Falkor-like, Appa-like, Wilson volleyball, Audrey II-like).
- G (town places): club disco replacing a scenery cottage (40, 68 or 118 deg), minotaur bouncer to talk to, players pick cute songs; an idea/request box for the Storyteller (stored on the host, listed for the ST); 2 more confession booths outdoors; fun-run fix (the church cuts off the ring road).
- N: ~12 new hats with achievements (viking, sombrero, beret, astronaut, ushanka, Santa, cat ears, ninja band, knight's helm, gnome, fedora, unicorn horn). After F.
- K (needs P): casino replacing the scenery cottage at 296 deg; shop sells pets (all pets locked until bought, the existing six too); blackjack; Texas hold'em between players. Team win pays money (P).
- X (needs P): pet fight club in a new tavern basement (fight-club / pit look). Each round both pick secretly: Attack (1 damage), Block (if they attacked, it's blocked and you hit back twice), Charge (+1 damage on your next attack). Winner gets a couple of dollars.
