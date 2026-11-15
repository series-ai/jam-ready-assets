# Glowdrop Critters 3D

Original assets for RUN. Keep License.txt with redistributed files.

Glowing night-time creatures, plants and collecting props for a cosy
catch-it, grow-it, show-it-off game. Everything is chunky low-poly with flat
colour and no textures. The glow is an emissive material on the bright parts
(spots, lures, bellies, tips), so it blooms when the game adds a bloom pass.
Every material is opaque. Every GLB is meshopt-compressed: load it with the
meshopt decoder (see "Using them in a game").

- `creatures/`: jellyfish, fish and sea critters, and bugs. Most are animated.
- `mushrooms/`, `plants/`, `corals/`: things that grow, one GLB per growth
  stage.
- `kit/mushroom/`: mix-and-match mushroom caps, stems and glow patterns.
- `props/`: nets, rods, jars, tanks and display pieces for collecting.
- `fx/`: ground shadows, a spawn sparkle, bubbles and a ripple.
- `habitat/`: ponds, shoreline, a tide pool, logs, stumps and rocks.

Units: a grown mushroom stands about 0.8 tall on a moss pad 0.56 across, a
fish is about 0.3 to 0.5 long, and a bug about 0.3 to 0.6. +Y is up and the
front faces +Z. Things that grow or walk sit on y = 0. Swimmers and fliers are
centred on their body, so place them at the height you want.

## Growing things

Every stage of a species sits on the same base (moss pad, sand disc or rock),
so a game can swap stages in place as it grows. The number in a file name is
the stage, in order.

- **Mushrooms** (`mushrooms/`, 5 stages: pin, button, young, mature, spore
  puff): `lantern-cap`, `moon-disc`, `inkcap`, `puffball`, `coral-fungus`,
  `pixie-cup`, `jelly-ear`, `shelf-fungus` (on a bark slab, for walls and
  logs), `glow-morel`, `giant-umbrella` (tree-sized), `fairy-ring` and
  `veil-cap`. Example: `mushrooms/moon-disc-4-mature.glb`.
- **Plants** (`plants/`, 5 stages: seed, sprout, bud, bloom, seed pod):
  `moonflower`, `glow-bulb`, `fiddlehead-fern`, `lantern-pod-vine`,
  `glow-cattail`, `glow-lotus-lily-pad`, `star-moss`, `glow-kelp` and
  `glow-grass`.
- **Corals** (`corals/`, 5 stages: polyp, bud, young, full, spawning):
  `finger-coral`, `fan-coral`, `brain-coral` and `bubble-coral`.

## Creatures

Clips are 30 fps. Loops close seamlessly; `caught` is a one-shot that ends
back at rest.

- **Jellyfish** (`creatures/jellies/`): 8 species, each in its real life
  cycle: `-1-polyp` (on a rock), `-2-ephyra` (baby) and `-3-medusa` (grown).
  The species are `moon-jelly`, `comb-jelly`, `box-jelly`, `lion-s-mane`,
  `fried-egg-jelly`, `crown-jelly`, `upside-down-jelly` (rests on the sea
  floor) and `spark-jelly-swarm`.
- **Sea critters** (`creatures/sea/`): `anglerfish`, `lanternfish`,
  `hatchetfish`, `flashlight-fish`, `glow-guppy`, `ribbon-eel`,
  `firefly-squid`, `sea-angel`, `glow-shrimp`, `dumbo-octopus`,
  `glow-seahorse` and `sea-pickle`. Scale a fish up or down for collectible
  sizes.
- **Bugs** (`creatures/bugs/`), with their real life stages:
  - `firefly`: larva, pupa, adult
  - `glowworm`: larva, adult
  - `click-beetle`: larva, adult
  - `glow-moth`: caterpillar, cocoon, adult
  - `railroad-worm`: young, adult
  - `glow-snail`: baby, adult
  - `glow-millipede`: young, adult
  - `cave-gnat`: larva (hanging on its glowing threads under a rock arch), adult
  - `glow-springtail`: young, adult
  - `glow-cricket`: nymph, adult

| Clip | Loops | Who has it |
|---|---|---|
| `swim` | yes | fish and sea critters (tail beat, jet, or fin flaps) |
| `idle` | yes | sea critters (hover), polyps (sway), firefly and click beetle (glow blink), moth (slow wing fan), cricket (chirp), pupa and cocoon (wriggle) |
| `pulse` | yes | ephyras and medusas (contract fast, relax slowly) |
| `crawl` | yes | larvae, worms, millipedes and snails (a wave down the body, in place) |
| `fly` | yes | firefly, moth and cave gnat adults (hovering) |
| `hop` | yes | springtail and cricket (a real jump with a landing) |
| `click` | yes | click beetle (flips over in a jump) |
| `caught` | no | every creature that moves: a startled flail, then rest |

Creatures move in place. The game moves the root for travel.

## Mushroom kit, in `kit/mushroom/`

Build your own mushroom from a stem, a cap and a glow pattern:

- Stems: `stem-slim`, `stem-stout`, `stem-bulb`, `stem-ringed` and
  `stem-curved`, each on a moss pad. Each has an empty node named `cap` where
  the cap goes.
- Caps: `cap-bell`, `cap-dome`, `cap-disc`, `cap-cone` and `cap-wavy`. A cap's
  origin is where it meets the stem: parent it to `cap` and it sits slightly
  down onto the stem top.
- Glow patterns: `glow-<pattern>-for-<cap>`, with patterns `spots`, `rim`,
  `gills`, `whole` and `stripes`. Each is shaped for one cap and shares that
  cap's origin.

```js
const stem = (await loader.loadAsync('kit/mushroom/stem-bulb.glb')).scene;
const cap = (await loader.loadAsync('kit/mushroom/cap-dome.glb')).scene;
const glow = (await loader.loadAsync('kit/mushroom/glow-spots-for-dome.glb')).scene;
stem.getObjectByName('cap').add(cap, glow);
```

Recolour a cap by setting its material colour. The glow patterns carry their
own emissive colour.

## Props, FX and habitat

- `props/`: `bug-net`, `fishing-rod`, `field-guide`, `lantern`, `jar-empty`,
  `jar-firefly`, `jar-mushroom`, `jar-jelly` (a jar glows in the colour of
  what's inside), `terrarium`, `museum-plinth`, `display-case`, and
  `aquarium-small`, `aquarium-medium` and `aquarium-large`. The tanks, case
  and terrarium are open-fronted, so what's inside shows without glass.
- `fx/`: `shadow-1` to `shadow-6` (dark ground discs in growing sizes for a
  fish- or bug-shadow "something's here" tell), `spawn-sparkle` (clip `pop`),
  `bubbles` (clip `wobble`; move the column up yourself) and `ripple-ring`
  (clip `spread`, a one-shot).
- `habitat/`: `glow-pond-small`, `glow-pond-medium`, `glow-pond-large`,
  `shore-straight`, `shore-corner`, `tide-pool`, `mossy-log`, `stump`,
  `rock-cluster`, `stalagmites` and `driftwood`.

## Using them in a game

RUN games render with three.js.

**Load with the meshopt decoder.** The files are meshopt-compressed
(`EXT_meshopt_compression`, animation included), so the loader needs the
decoder, which ships with three.js. Without it the models fail to load.

```js
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
```

**Make it glow.** The glowing parts are emissive (with
`KHR_materials_emissive_strength`). They look bright on their own; for the
soft halo, add a bloom pass on a dark scene:

```js
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
composer.addPass(new UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), 0.7, 0.5, 0.82));
composer.addPass(new OutputPass());
// each frame: composer.render() instead of renderer.render(scene, camera)
```

On phones, bloom costs a few full-screen passes. Without it the glowing parts
still read as bright colour.

**Animation.** The creatures are node-animated: their moving parts (tail,
wings, segments, tentacles) are separate nodes. Plain `object.clone()` works,
and no skinning is needed. Give each creature an `AnimationMixer` and play
clips from `gltf.animations` by name. A clip carries only the parts it moves,
so the mixer holds the rest at their rest pose.

**Budget.** Most models are 500 to 3,000 triangles. Plants, mushrooms and
corals take 2 to 8 draw calls, fish and jellies 2 to 10, and segmented bugs up
to 20 (each moving segment is its own node). For a crowded scene, show distant
creatures with a simpler stand-in or pause their mixers off screen.
