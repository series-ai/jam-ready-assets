# Critter Cubes 3D/prototype-blocks

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

## Using them in a game

RUN games render with three.js. Each cube is a single mesh, `body`, under
`root`, so a level's blocks are best drawn instanced: one draw call per kind
of block, however many you place.

**Load with the meshopt decoder.** The files are meshopt-compressed
(`EXT_meshopt_compression`, about 40% smaller to download), so the loader
needs the decoder, which ships with three.js. Without it the models fail to
load.

```js
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
```

```js
const gltf = await loader.loadAsync('grass.glb');
gltf.scene.updateMatrixWorld(true);
const body = gltf.scene.getObjectByName('body');
const grass = new THREE.InstancedMesh(body.geometry, body.material, cells.length);
const m = new THREE.Matrix4();
cells.forEach(([x, y, z], i) =>          // grid cells; one cube is 2 units
  grass.setMatrixAt(i, m.makeTranslation(x * 2, y * 2, z * 2).multiply(body.matrixWorld)));
grass.computeBoundingSphere();
scene.add(grass);
```

To play a clip on one block (`drop`, `land`, `tap`), hide its instance
(scale its matrix to zero), play a normal clone in its place, then put the
instance back.

Triangle counts vary: `cube` 188, `ice` 728, `hay` 740, `dirt` 888, `sand`
1.1k, `brick` 2.4k, `rock` 2.5k, dice 2.5k, `crate` 2.9k, `grass` 2.9k,
`water` 3.1k, `snow` 3.9k, `bush` 4.1k. For large floors on phones, build
with the light ones and use the heavy ones as accents: a 10 x 10 floor of
`bush` is 410k triangles, of `dirt` 89k.

The dice move like the animals (their `body` carries the roll and the
height), so a blob shadow following `body` works the same way; see
`3D/characters`.
