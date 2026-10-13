# Critter Cubes 3D/platformer

Original assets for RUN. Keep License.txt with redistributed files.

Every model is an animated, meshopt-compressed GLB (load it with the meshopt
decoder; see "Using them in a game"): rigid parts on a node hierarchy with
TRS clips (no skinning), flat colour, no textures. A part in several colours
carries them as vertex colours (`COLOR_0`) on one shared `colors` material,
so each node is one draw call; single-colour parts keep their own material.
Units: one die is 2 x 2 x 2. +Y is up and the front faces +Z. Everything in
Critter Cubes shares one 2-unit grid, so animals, dice, terrain cubes and
puzzle pieces stack and line up: `3D/characters` (the animals),
`3D/prototype-blocks` (dice and terrain cubes) and `3D/platformer` (puzzle
pieces). For loading, draw calls and shadows on phones, read "Using them in
a game" at the end.

Nine puzzle pieces, each one 2 x 2 cell, for dice to roll, drop and get
pushed onto. Parts a game may want to recolour are their own nodes, with a
material per colour (`cap`, `platter`, the `flag_*` segments). Rotate a
piece to point it (a sideways fan, a conveyor going left).

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

## Using them in a game

RUN games render with three.js.

**Load with the meshopt decoder.** The files are meshopt-compressed
(`EXT_meshopt_compression`, about 40% smaller to download), so the loader
needs the decoder, which ships with three.js. Without it the models fail to
load.

```js
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
```

Each piece is a few meshes (1 to 6 draw calls); give each animated piece its
own `AnimationMixer`. Parts that are off (the fan's puffs, the portal's
sparkles) are scaled to nothing rather than removed, so hide them each frame
after `mixer.update()`, as in `3D/characters`:
`o.visible = o.scale.x > 0.01`. The `ramp` is a single mesh: draw many of
them instanced, like the terrain cubes in `3D/prototype-blocks`.
