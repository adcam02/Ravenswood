# Making animals for Ravenswood (shared brief)

Ravenswood is a cosy 3D animal town (three.js r180, Vite, React, TypeScript strict) where people play Blood on the
Clocktower. Each player picks an animal avatar. Animals are sculpted procedurally: a signed-distance "sculpt" of
melted shapes is meshed into one smooth surface, painted with markings, and rigged to a small skeleton.

## Where things are
- `src/world/recipes.ts`: every animal's Recipe (a function that sculpts and paints it), plus `RECIPES`,
  `PROFILES` (posture, gait, sit style, idle mannerisms) and `DETAILS` (toes, claws, teeth). Read several recipes
  before writing one. Good examples: `kaiju` (newest; uses `piece()` for crisp plates and fangs), `gecko`, `shark`,
  `axolotl`, `seacucumber` (spikes), `crab`, `turtle`, `ibis` (beak via `chain`), `bat` (flying, `membraneWings`),
  `jellyfish` (hovering), `frog`, `highland` (locks of hair), `snail`.
- `src/world/forms.ts`: sculpt helpers (`torso`, `headForm`, `snoutForm`, `earForms`, `armForms`, `wingForms`,
  `membraneWings`, `beakForm`, `finForm`, `legForms`, `tailForm`, `tentacleForms`, `piece`, `surfaceHit`,
  `region`/`all`/`any`/`unitOf` for painting markings, `whiskers`).
- `src/world/sculpt.ts`: SDF primitives (`ellipsoid`, `rod`, `pyramid`, `spiral`, …). Add a primitive here only if
  you really need one (e.g. a rounded box), matching the existing ones.
- `src/world/species.ts`: `Kit`, `eyes`, `mouth`, `nose`, `mix`, `bone`, `part`, `onHead`, the `Profile`, `Gait`,
  `SitStyle`, `Mannerism` types and `RecipeResult` (flags like `aquatic`, `legs: 'none' | 'tentacles'`, `hover`,
  `flaps`, `jelly`, `tendril`).
- `src/world/animals.ts`: the rig and all animation (gaits, poses, sleeping, holding items, ghost mode), where hats
  sit (`HAT_NUDGE`), dress-up placement (`DRESS_NUDGE`, `dressFit`), low detail.
- `src/world/types.ts`: the `AnimalId` union and `ANIMALS` (id, display name, aquatic, colour choices with the
  natural ones first). Add your animals at the end of both.
- `dev/animals-main.ts`: the test bench (`/dev/animals.html?view=...`).

## Look and feel
Cute, chunky, rounded storybook style, like the existing animals: a big head with big eyes, a soft readable
silhouette, distinctive at a glance from across the town square. Clear markings painted with `k.marks`. Crisp small
parts (spikes, antennae, claws, teeth) with `piece()`. Every colour in the animal's `colors` list, and the shared
`EXTRA_COLORS`, must look good (the first natural colour is the default).

## It has to work everywhere
- Poses: `view=poses&animal=ID` shows idle, walk, run, sit, sleep (in bed, on its back), wave, dance, cheer, laugh,
  cry, hand (paw up to vote), work, fish, water, drink, and items held in the paw.
- Hats: `view=hats&set=close&animal=ID&hat=tophat` (try `crown`, `wizard`, `reaper`, `chef`, `beanie` too). Nudge
  with `HAT_NUDGE` if a hat sits wrong.
- Dress-up: `view=one&animal=ID&ry=2.4&wear=back:cape`, `wear=back:backpack`, `wear=face:glasses,neck:scarf`.
- Colours: `view=one&animal=ID&c=1` (index into its colours) or `&color=%23f4efe6`.
- Low detail (seen far off): `view=one&animal=ID&detail=low`.
- Size next to others: `view=close&animal=bear,ID,fox,frog&ry=0.5`.
- Budget and audit: `view=one&animal=ID&lite` prints `faces.inward`, which must be 0, and `coplanar`, keep it
  small. High-detail triangles roughly 3.5k to 5.5k (the kaiju is about 4.6k).
- `npx tsc --noEmit -p .` must pass.

## Screenshots
From your checkout: `PORT=<your port> node tools/shot-animals.mjs <out-dir> 'view=one&animal=ID&ry=0.6' 'view=poses&animal=ID'`
Put out-dirs under `/tmp/claude-0/-home-user-ravenswood/f3f6fd5e-bcab-5998-aa6d-a19b11749b3c/scratchpad/` and look
at them with Read (crop or combine with Python PIL into contact sheets to save effort). The machine has 4 cores
shared with other helpers: run one screenshot process at a time, with a few views per call.

## Rules
- Work ONLY in your own checkout (given below). It's a git worktree on a detached HEAD sharing node_modules by
  symlink. Do not touch /home/user/ravenswood or any other /home/user/wt-* folder. Other helpers are working in
  parallel in those.
- Never `pkill -f` a pattern that also matches your own shell command; kill specific PIDs you started.
- Australian English, no em dashes anywhere (code comments included). Comments read like the surrounding code: a
  short descriptive comment at the top of each recipe saying what the animal is like, and brief comments on
  non-obvious bits.
- When done, commit in your worktree (do not push). End the commit message with these two lines exactly:
  Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
  Claude-Session: https://claude.ai/code/session_01SHr5n4jEUU4286xzpFfxp9
- Report back: the commit hash; what you built and any changes outside recipes.ts/types.ts (and why); triangle
  counts and audit results; anything that still looks off; and the path of a final contact sheet per animal
  (front three-quarter, side, back, a pose sheet, a hat and the cape).
