# Critter Cubes 3D

Original assets for RUN. Keep License.txt with redistributed files.

Every model is an animated, meshopt-compressed GLB (load it with the meshopt
decoder; see "Using them in a game"): rigid parts on a node hierarchy with
TRS clips (no skinning), flat colour, no textures. A part in several colours
carries them as vertex colours (`COLOR_0`) on one shared `colors` material,
so each node is one draw call; single-colour parts keep their own material.
Units: one die is 2 x 2 x 2. +Y is up and the front faces +Z. Everything in
Critter Cubes shares one 2-unit grid, so animals, dice, terrain cubes and
puzzle pieces stack and line up:

- `animals/`: 47 dice animals with 25 clips and swappable faces each
- `blocks/`: dice, a tintable cube and 11 terrain cubes
- `puzzle/`: 9 animated puzzle pieces

For loading, draw calls and shadows on phones, read "Using them in a game" at
the end.

## Animals (47), in `animals/`


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

### Animal clips (30 fps)

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

### Faces

The face is made of nodes under `body`: `eye_l`/`eye_r` (open eyes),
`happy_*`, `line_*`, `x_*` and `spiral_*` (drawn ^, sleepy, X and dizzy eyes),
`brow_l`/`brow_r`, `mouth_smile`, `mouth_oh`, `mouth_grin`, `mouth_sad`,
`mouth_wavy`, `nose` and `sweat`. Hidden parts are scaled to 0.001; scale one
to 1 to show it. The clips key these into expressions (neutral, playful,
surprised, scared, happy, excited, oof, dizzy, sleepy, sad); a game can also
set them directly. Birds have no mouth nodes.
A part scaled to 0.001 is invisible but still drawn: hide it each frame
(see "Using them in a game").
A clip carries only the parts it moves; three.js's mixer holds every other
part at its rest pose, also while cross-fading.

Other nodes: `root`, `body` (pivot at the bottom centre), the nub feet
(`foot_fl`, `foot_fr`, `foot_bl`, `foot_br`; `foot_l`, `foot_r` on the birds),
`ear_l`, `ear_r` and `tail`.

## Dice and terrain cubes, in `blocks/`

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

### Block clips (30 fps)

| Model | Clips |
|---|---|
| dice | `roll_in`, `roll`, `roll_side`, `drop`, `place`, `tap`, `spin`, `spin_start`, `spin_loop`, `spin_end` |
| plain and terrain cubes | `place`, `drop`, `land`, `tap` |

The dice clips match the animals' clips of the same name (same timing and
root motion: `roll` ends 8 units forward, +Z).

## Puzzle pieces, in `puzzle/`

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


RUN games render with three.js. These notes keep a scene of Critter Cubes
fast on phones.

**Load with the meshopt decoder.** The files are meshopt-compressed
(`EXT_meshopt_compression`, about 40% smaller to download), so the loader
needs the decoder, which ships with three.js. Without it the models fail to
load.

```js
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
```

**How a model is built.** `root` holds `body` (the cube, which carries all
the travel and height in the clips) and the feet; the face, ears and tail
hang under `body`. Every part is its own mesh moved by the clips, and
nothing is skinned, so:

- Load each species once and `clone()` it for every animal. A plain clone
  works (there is no skeleton to rebind) and shares geometry and materials.
- Give each animal its own `AnimationMixer`.
- To tint one animal, clone its material first: every clone of a species
  shares the same materials.

**Hide the parts a clip has scaled away**, every frame, after
`mixer.update()`. The spare eyes, mouths, brows and sweat drop sit at 0.001
scale and are still drawn unless hidden; hiding them takes an animal from
about 24 draw calls to about 11.

```js
const parts = [];
animal.traverse(o => parts.push(o));          // once, after cloning

// each frame
mixer.update(dt);
for (const o of parts) o.visible = o.scale.x > 0.01;
```

**Use a blob shadow, not shadow maps.** Shadow maps draw the whole scene a
second time. Leave `renderer.shadowMap.enabled` off and put a soft dark disc
under each animal that follows `body` and shrinks as it leaves the ground:

```js
// once: one texture, geometry and material shared by every shadow
const c = document.createElement('canvas');
c.width = c.height = 64;
const g = c.getContext('2d');
const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
grad.addColorStop(0, 'rgba(0,0,0,0.35)');
grad.addColorStop(1, 'rgba(0,0,0,0)');
g.fillStyle = grad;
g.fillRect(0, 0, 64, 64);
const blobGeo = new THREE.PlaneGeometry(2.6, 2.6).rotateX(-Math.PI / 2);
const blobMat = new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c), transparent: true, depthWrite: false });

// per animal
const body = animal.getObjectByName('body');
const restY = body.position.y;                // before any clip plays
const shadow = new THREE.Mesh(blobGeo, blobMat);
animal.add(shadow);

// each frame, after mixer.update()
const s = 1 / (1 + 0.3 * Math.max(0, body.position.y - restY));
shadow.position.set(body.position.x, 0.01, body.position.z);
shadow.scale.set(s, 1, s);
```

The shadow sits at the animal's base, so on a stack it falls on the cube
below.

**Budget.** About 100 to 200 draw calls a frame is comfortable on a phone.
With the hiding above, an animal is about 11, plus 1 for its shadow; a
terrain cube is 1, and drawn instanced a whole floor of one kind is 1 (see
`blocks/`). Ten to fifteen animals on screen is comfortable.
For more, update mixers only for animals on screen.

**Cheaper lighting on low-end phones.** The materials are
`MeshStandardMaterial` (roughness 0.9, no metal). `MeshLambertMaterial`
looks close and costs less per pixel. Swap once, on the loaded scene before
cloning, sharing the replacements:

```js
const lambert = new Map();
gltf.scene.traverse(o => {
  if (!o.isMesh) return;
  const m = o.material;
  if (!lambert.has(m)) lambert.set(m, new THREE.MeshLambertMaterial({ name: m.name, color: m.color, vertexColors: m.vertexColors }));
  o.material = lambert.get(m);
});
```

Cap the pixel ratio too: `renderer.setPixelRatio(Math.min(devicePixelRatio, 2))`.

### Dice and terrain cubes

Each cube is a single mesh, `body`, under
`root`, so a level's blocks are best drawn instanced: one draw call per kind
of block, however many you place.

```js
const gltf = await loader.loadAsync('blocks/grass.glb');
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
height), so a blob shadow following `body` works the same way.

### Puzzle pieces

Each piece is a few meshes (1 to 6 draw calls); give each animated piece its
own `AnimationMixer`. Parts that are off (the fan's puffs, the portal's
sparkles) are scaled to nothing rather than removed, so hide them each frame
after `mixer.update()`, as with the animals:
`o.visible = o.scale.x > 0.01`. The `ramp` is a single mesh: draw many of
them instanced, like the terrain cubes in `blocks/`.
