# Ravenswood: where the big batch stands (saved before a session limit)

`main` is deployed up to the bakery sign fix, plus the Customise work (helper U, merged and pushed, not yet deployed).

## Preferences
- Australian English, no em dashes. Commit trailers: Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com> and the Claude-Session line.
- Run the full sample game and town test only at key points (after a whole batch, before deploying it). Small fixes: type check, a quick look, deploy.
- Deploy: `npm run build` (writes docs/), commit docs, push main, check `gh run list --repo adcam02/Ravenswood`.
- The 9/11 plane request was declined (re-enacts a real attack). Everything else in the batch is wanted.

## Status (updated at the second session limit)
Merged into main and pushed (not yet deployed): U customise, A voice/presence, F hat fitting, P profiles/money/achievements, B nominate/bell/seating/Fang Gu, D six night visits, E penguin/dugong/meerkat/skeleton/drips/bed, C execution vote + wheel + six methods + ghost, right-click camera swing.

Still in progress, each saved on its branch (a WIP commit on top of the helper's checkout; resume the helper agent or cherry-pick):
- wip/g: club disco + minotaur bouncer + songs, idea box for the ST, 2 outdoor confession booths, fun-run road fix.
- wip/k: casino (The Lucky Raven, replacing Rose Cottage at 296 deg), pet shop and pet locking, blackjack, Texas hold'em, first-person table camera with right-drag look.
- wip/x: pet fight club in the tavern basement (Attack 1 dmg; Block counters an attack for 2, not two rounds running; Charge +1 next attack, any round); winner gets a couple of dollars.
- wip/n: 12 new hats with their own achievements.
- wip/h: 15 pop-culture pets (electric mouse ... Toothless-like).
- wip/h2: (nothing written yet) 15 more pets: snowy owl, Nyan-style cat, Doge, Grumpy Cat, rubber duck, Tamagotchi, Goomba-like, chocobo chick, Gizmo-like, Clippy, tribble, Falkor-like, Appa-like, Wilson, Audrey II-like. Add at the very end of PetId/PETS/pets.ts.

Then: README, full sample game + town test once, deploy.
