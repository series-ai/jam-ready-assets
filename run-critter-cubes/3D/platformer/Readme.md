# Critter Cubes 3D/platformer

Original assets for RUN. Keep License.txt with redistributed files.

Every model is an animated GLB: rigid parts on a node hierarchy with TRS clips
(no skinning), flat-colour materials, no textures. Units: one die is 2 x 2 x 2.
+Y is up and the front faces +Z. Everything in Critter Cubes shares one 2-unit
grid, so animals, dice, terrain cubes and puzzle pieces stack and line up:
`3D/characters` (the animals), `3D/prototype-blocks` (dice and terrain cubes)
and `3D/platformer` (puzzle pieces).

Nine puzzle pieces, each one 2 x 2 cell, for dice to roll, drop and get pushed
onto. Parts a game may want to recolour are their own nodes (`cap`, `platter`,
the `flag_*` segments). Rotate a piece to point it (a sideways fan, a conveyor
going left).

| Piece | Clips (30 fps) |
|---|---|
| `button` | `idle`, `press` (squashes down with a bounce), `held` (loop), `release` |
| `fan` | `off`, `spin_up`, `on` (loop: blades and rising puffs), `spin_down` |
| `conveyor` | `run` (loop: chevrons ride the belt forward, toward +Z), `stop` |
| `spring` | `idle`, `boing` (compress, launch, wobble out) |
| `gate` | `closed`, `open` (the bars sink into the floor slot), `opened`, `close` |
| `goal_flag` | `wave` (loop) |
| `turntable` | `idle`, `turn_left`, `turn_right` (a quarter turn with a little overshoot) |
| `portal` | `swirl` (loop): a standing ring doorway a die can roll through |
| `ramp` | none: a gentle wedge two cells long, up to one die's height |

A die standing on a conveyor sits at y = 0.38; on a resting spring, y = 0.84.
The gate's posts sit outside the cell, so a die fits through the opening.
