# Critter Cubes 3D/characters

Original assets for RUN. Keep License.txt with redistributed files.

Every model is an animated GLB: rigid parts on a node hierarchy with TRS clips
(no skinning), flat-colour materials, no textures. Units: one die is 2 x 2 x 2.
+Y is up and the front faces +Z. Everything in Critter Cubes shares one 2-unit
grid, so animals, dice, terrain cubes and puzzle pieces stack and line up:
`3D/characters` (the animals), `3D/prototype-blocks` (dice and terrain cubes)
and `3D/platformer` (puzzle pieces).

## Animals (47)

Every animal is the same 2 x 2 x 2 cube on tiny nub feet (2.16 tall with the
feet), so they stack on the grid: stand one on another at y + 2.16. The top
stays flat inside the die's footprint; ears, wings and horns sit on the sides.

- Farm: cow, pig, sheep, horse, donkey, goat, chicken, hen, rooster, chick,
  duck, goose, turkey, bunny, dog, mouse
- Cats: cat (orange tabby), cat_grey, cat_black, cat_tuxedo, cat_calico, cat_siamese
- Field and pond: frog, fox, raccoon, hedgehog, turtle, skunk
- Owls: owl, owl_barn
- Bears: bear, bear_black, bear_polar, bear_sun, bear_teddy, panda
- Wild: lion, tiger, moose, elephant, giraffe, zebra, monkey, koala, penguin,
  hippo, crocodile

All export at the same size; scale one down in code for a small one. Odd
shapes on purpose, for game rules: nothing sits well on the hedgehog's spines
or the turtle's round shell, and the crocodile's snout pokes into the cell in
front.

## Clips (30 fps)

| Clip | Loop | What |
|---|---|---|
| `idle` | yes | breathe, glance, blink, ear twitch |
| `walk` | yes | a waddle in place, feet stepping |
| `run` | yes | leaning forward and bounding, in place |
| `hop` | yes | crouch, snap up, arc, heavy landing |
| `jump` | no | deep crouch, big launch, slap and clatter |
| `excited` | yes | hop, hop, then a big jump with a full twist |
| `waggle` | yes | ears (wings) flap, playful face |
| `happy` | no | a hop, then a big hop with a full turn |
| `tap` | no | a quick squash-hop, for a tap or selection |
| `land` | no | falls onto its front edge and slaps flat |
| `place` | no | set down onto an edge, slapped flat (snapping onto a stack) |
| `drop` | no | a long fall onto a corner, then a clattering settle |
| `squish` | no | something lands on top: a big squash and a jelly wobble |
| `roll` | no | four heavy quarter tips forward; ends 8 units forward (+Z) |
| `roll_side` | no | the same, sideways; ends 8 units to the die's right (-X) |
| `roll_in` | no | thrown in like a die: starts 12 units behind and up, tumbles onto its spot |
| `spin_start` | no | pops onto a corner and spins up |
| `spin_loop` | yes | spinning like a top on the corner |
| `spin_end` | no | slows, wobbles, tips over and clatters, dizzy |
| `spin` | no | start, two loops and end in one clip |
| `teeter_in` | no | tips onto one edge and catches itself |
| `teeter_loop` | yes | balancing on the edge, scared |
| `teeter_out` | no | loses balance and drops back flat |
| `sleep` | yes | eyes shut, slow breathing (stays flat, fine in a stack) |
| `sad` | yes | a long sigh and a sniffle |

`spin_start` → `spin_loop` → `spin_end` and `teeter_in` → `teeter_loop` →
`teeter_out` chain seamlessly. `roll` and `roll_side` end upright and facing
front, so move the model's origin by the distance when the clip ends. Every
other clip starts and ends on the spot.

## Faces

The face is made of nodes under `body`: `eye_l`/`eye_r` (open eyes),
`happy_*`, `line_*`, `x_*` and `spiral_*` (drawn ^, sleepy, X and dizzy eyes),
`brow_l`/`brow_r`, `mouth_smile`, `mouth_oh`, `mouth_grin`, `mouth_sad`,
`mouth_wavy`, `nose` and `sweat`. Hidden parts are scaled to 0.001; scale one
to 1 to show it. The clips key these into expressions (neutral, playful,
surprised, scared, happy, excited, oof, dizzy, sleepy, sad); a game can also
set them directly. Birds have no mouth nodes.

Other nodes: `root`, `body` (pivot at the bottom centre), the nub feet
(`foot_fl`, `foot_fr`, `foot_bl`, `foot_br`; `foot_l`, `foot_r` on the birds),
`ear_l`, `ear_r` and `tail`.
