# Mochimon: Characters 2D/characters

Original assets for RUN. Keep License.txt with redistributed files.

16 ready-made pixel-art characters, each with sprite sheets for 47 animations in four directions:
walking and running, jumping, sitting, eating, attacks with their effects, getting hit, magic,
chores, and a full set of emotes.

**Make your own with [Mochimon](https://w.run/run.sterf/mochimon)**, the free RUN app these were made in.
Pick a body, ears, a coat pattern, a hat, glasses, clothes and a tail, choose a palette, and export a
sprite sheet in exactly this format: the same rows, the same JSON, the same role map. Anything you make
there drops into a game built for this pack.

The pack's food is in `run-mochimon/2D/food`, and its speech bubbles and icons in `run-mochimon/ui`.

## Characters

- `musketeer`: a musketeer in a plumed cavalier hat
- `wizard`: a ginger tabby wizard
- `ninja`: a fox-eared ninja
- `pirate`: a tuxedo pirate captain
- `chef`: a big round chef
- `gardener`: a spotty dog-eared gardener with a sprout
- `viking`: a ginger viking
- `astronaut`: an astronaut
- `princess`: a calico princess
- `robot`: a robot with bolts
- `punk`: a pink leopard punk
- `scholar`: a mouse-eared scholar in glasses
- `samurai`: a tortie samurai
- `idol`: a pink bunny idol with a bow
- `imp`: a red imp with bull horns
- `frog`: a mint frog in a scarf

## Files

Every character has its own folder, `<name>/`, with four sheets. Each sheet comes as three files:

- `<name>-<sheet>.png`: the sprite sheet. One row per animation and direction, frames left to right.
- `<name>-<sheet>.json`: frame size, columns and rows, the anchor, fps, and every row's animation,
  direction and frame count.
- `<name>-<sheet>.roles.png`: the same sheet with each pixel's part as a code, for recolouring
  (see "Recolouring").

Draw frame `f` of row `r` from `(f * frameWidth, r * frameHeight)`, `frameWidth` x `frameHeight`. Every
cell on a sheet is the same size and the character's feet are on the same spot in all of them: the
`anchor` in the JSON (29, 53 on the basics sheet), from the cell's top-left. Put
the anchor on the ground where the character stands. Attack sheets have bigger cells, with room for
the effects.

Animations play at 12 frames a second (`fps` in the JSON) and loop. An animation shorter than the
sheet is wide leaves the rest of its row empty: play only its `frames`.

## Directions

Each animation has four rows, `<animation>-0` to `<animation>-3`, one per direction, seen from a
three-quarter view above:

| Row suffix | Facing |
|---|---|
| `-0` | down-right (towards the camera, to the right) |
| `-1` | down-left (towards the camera, to the left) |
| `-2` | up-left (away, to the left) |
| `-3` | up-right (away, to the right) |

These are the four diagonals of an isometric or three-quarter top-down game. For a side-on game, use
`-0` for right and `-1` for left. `spin` is one row that turns all the way round.

## Sheets

### Basics: `<name>-basics.png`

32 columns x 53 rows of 59 x 68 px cells (the same for every character).

| Animation | Frames | Rows |
|---|---|---|
| idle | 16 | 0-3 |
| walk | 8 | 4-7 |
| walk side | 8 | 8-11 |
| run | 8 | 12-15 |
| jump | 12 | 16-19 |
| sit | 24 | 20-23 |
| lie down | 24 | 24-27 |
| pick up | 16 | 28-31 |
| eat | 16 | 32-35 |
| celebrate | 12 | 36-39 |
| hurt | 10 | 40-43 |
| death | 20 | 44-47 |
| spin (turns all the way round in one row) | 32 | 48 |
| faces (one face per frame: the expressions) | 8 | 49-52 |

### Attacks: `<name>-attacks.png`

24 columns x 52 rows of 88 x 70 px cells (the same for every character).

| Animation | Frames | Rows |
|---|---|---|
| slash | 14 | 0-3 |
| swipe | 14 | 4-7 |
| punch | 12 | 8-11 |
| one-two | 16 | 12-15 |
| spear | 14 | 16-19 |
| fireball | 14 | 20-23 |
| beam | 24 | 24-27 |
| sweep | 16 | 28-31 |
| shoot | 24 | 32-35 |
| knockback | 10 | 36-39 |
| faceplant | 24 | 40-43 |
| slashed | 20 | 44-47 |
| shot | 20 | 48-51 |

### Actions: `<name>-actions.png`

24 columns x 40 rows of 88 x 70 px cells (the same for every character).

| Animation | Frames | Rows |
|---|---|---|
| party | 16 | 0-3 |
| wand | 16 | 4-7 |
| water | 16 | 8-11 |
| dig | 12 | 12-15 |
| chop | 12 | 16-19 |
| fish | 24 | 20-23 |
| sleep | 24 | 24-27 |
| wave | 12 | 28-31 |
| dance | 16 | 32-35 |
| broom | 16 | 36-39 |

### Emotes: `<name>-emotes.png`

16 columns x 28 rows of 40 x 51 px cells (the same for every character).

| Animation | Frames | Rows |
|---|---|---|
| love | 16 | 0-3 |
| angry | 12 | 4-7 |
| sad | 16 | 8-11 |
| surprised | 12 | 12-15 |
| alert | 12 | 16-19 |
| confused | 16 | 20-23 |
| talk | 16 | 24-27 |

## Recolouring

`<name>-<sheet>.roles.png` holds a code in its red channel for every pixel (alpha 0 = empty):

- `0`: outline
- `1`: eye
- `2 + role * 8 + shade`: a part of the character, where role is 0 fur, 1 markings, 2 dark
  accessories, 3 light accessories, 4 clothes, 5 accent markings, and shade runs from 0 (lightest)
  to 4 (darkest).

Map every code through your own palette to recolour a character at run time: a team colour, a
night-time palette, or a ginger version of the same cat. The colours used here are in each JSON's
`palette`.

## Palette

Painted in the TOKYO palette at 32 colours. Draw with nearest-neighbour filtering (no smoothing) and
scale by whole numbers only (2x, 3x, 4x) to keep the pixels square.
