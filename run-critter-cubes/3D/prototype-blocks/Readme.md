# Critter Cubes 3D/prototype-blocks

Original assets for RUN. Keep License.txt with redistributed files.

Every model is an animated GLB: rigid parts on a node hierarchy with TRS clips
(no skinning), flat-colour materials, no textures. Units: one die is 2 x 2 x 2.
+Y is up and the front faces +Z. Everything in Critter Cubes shares one 2-unit
grid, so animals, dice, terrain cubes and puzzle pieces stack and line up:
`3D/characters` (the animals), `3D/prototype-blocks` (dice and terrain cubes)
and `3D/platformer` (puzzle pieces).

15 cubes, each 2 x 2 x 2 sitting flat on the ground (no feet), with the same
rounded edges as the animals. Stack them at y + 2.

- Dice: `die_white` (red 1), `die_red`, `die_wood`. Opposite faces add up to 7
  (front 1, back 6, top 2, bottom 5, right 3, left 4).
- Plain cube: `cube`, white, one material. Tint it any colour by setting its
  material colour.
- Terrain: `grass`, `dirt`, `rock`, `sand`, `snow`, `ice`, `water`, `crate`,
  `hay`, `brick`, `bush`. Sink a row of them by 2 to make a floor whose top is
  at y = 0.

## Clips (30 fps)

| Model | Clips |
|---|---|
| dice | `roll_in`, `roll`, `roll_side`, `drop`, `place`, `tap`, `spin`, `spin_start`, `spin_loop`, `spin_end` |
| plain and terrain cubes | `place`, `drop`, `land`, `tap` |

The dice clips match the animals' clips of the same name (same timing and
root motion: `roll` ends 8 units forward, +Z).
