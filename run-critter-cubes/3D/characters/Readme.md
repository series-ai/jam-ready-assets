# Critter Cubes 3D/characters

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
A part scaled to 0.001 is invisible but still drawn: hide it each frame
(see "Using them in a game").
A clip carries only the parts it moves; three.js's mixer holds every other
part at its rest pose, also while cross-fading.

Other nodes: `root`, `body` (pivot at the bottom centre), the nub feet
(`foot_fl`, `foot_fr`, `foot_bl`, `foot_br`; `foot_l`, `foot_r` on the birds),
`ear_l`, `ear_r` and `tail`.

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
`3D/prototype-blocks`). Ten to fifteen animals on screen is comfortable.
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
