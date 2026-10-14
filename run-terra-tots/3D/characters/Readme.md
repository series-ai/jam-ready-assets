# Terra Tots 3D

Original assets for RUN. Keep License.txt with redistributed files.

Potted houseplants with legs and arms. Each tot is a pot body with a plant
growing out of the top, chunky limbs with painted markings, and 29 animation
clips: walks, hops, dances, sitting, hiding in the pot, swinging in a hanging
planter and more. The leaves follow through on every move: the plant sways as a
whole and every leaf sways on its own spring as well. Every GLB is
meshopt-compressed: load it with the meshopt decoder (see "Using them in a
game").

- `tots/`: 23 ready-made tots, each one skinned GLB with all 29 clips. Load one
  and play a clip; nothing else is needed.
- `pots/`: every pot, 37 shapes in their colourways (114 GLBs).
- `props/`: plant-care props, 94 GLBs counting colourways.
- `pests/`: 7 soft toy bugs to sit on the leaves.
- `kit/`: the mix-and-match kit the tots are built from, for games that grow
  plants, swap pots or make their own tots at run time. It has the leaf models,
  the rigged limbs, and `terratots.js`, a three.js module that builds and
  animates tots.

Units: a tot stands about 3 to 7 tall depending on its plant (a big monstera is
the tallest, a small pothos the shortest). +Y is up and the front faces +Z.

## Tots, in `tots/`

The ten characters:

| File | Plant | Pot |
|---|---|---|
| `blanche` | monstera | egg pot, eggshell |
| `stella` | Thai Constellation monstera | stepped pot |
| `domino` | peace lily 'Domino' | checkerboard |
| `velvet` | Alocasia 'Frydek' | dragon scales |
| `tutu` | calathea | sweetheart |
| `raven` | ZZ 'Raven' | cauldron |
| `finn` | whale fin snake plant | half barrel |
| `sunny` | snake plant 'Laurentii' | drip glaze |
| `pearl` | satin pothos | crackle glaze |
| `dottie` | Calathea 'Dottie' | fluted pot |

And 13 more plants, each in a pot: `monstera-albo`, `calathea-white-fusion`,
`alocasia-frydek-variegata`, `zz-variegata`, `marble-queen-pothos`,
`cebu-blue-pothos`, `neon-pothos`, `alocasia-black-velvet`,
`cylindrical-snake-plant`, `snake-plant`, `peace-lily`, `bird-of-paradise` and
`zz-plant`. Variegated leaves carry their pattern in the texture: on the
variegated plants, every leaf is different.

### Clips (30 fps)

The clips play in place: move the tot yourself for the walking ones.

| Clip | Loop | What |
|---|---|---|
| `idle` | yes | standing, breathing, looking about |
| `walk`, `waddle`, `scamper`, `strut`, `sneak`, `lurch`, `trudge`, `run` | yes | walks: plain, toddler, excited, proud, tiptoe, heavy, tired, running |
| `carry` | yes | walks holding a seed pod in both hands |
| `pickup` | yes | bends down, picks up the seed pod, hugs it, puts it back |
| `hop`, `hops` | yes | one hop; three hops in a row |
| `shake` | yes | shakes off like a wet dog |
| `wiggle`, `twist`, `spin` | yes | dances: waggle, twist, twirl |
| `cuddle` | yes | hugs itself |
| `rubhands`, `bellyrub` | yes | eager; hungry |
| `slide` | yes | a baseball slide |
| `hide` | yes | pulls its limbs into the pot, wobbles, pops back out |
| `sit`, `sitkick`, `sitlazy` | yes | sits on a couch: happy, kicking, slumped |
| `swing` | yes | swings in a hanging planter, legs pumping |
| `scruffup` | no | picked up by the back of the pot |
| `scruff` | yes | held up, kicking in protest |
| `scruffdown` | no | put down with a plop |

The props a clip uses come with the tot and only show during that clip. They
are a seed pod, a couch, the hanging planter with its rope and hook, and sweat
drops. Each one is a node scaled to 0 when it isn't in use, so a plain glTF
viewer shows the tot on its own.

## Pots, in `pots/`

Files are `<pot>-<colourway>.glb`. The shapes are amphora, azalea, barrel,
basket, belly, bowl, box, bucket, cauldron, checker, classic, confetti, crackle,
crate, cylinder, diamond, drip, egg, fluted, gem, hearts, hex, mossy, mug,
nursery, pinstripe, polka, ribbed, scales, speckle, stepped, striped, teacup,
terrazzo, tincan, tulip and wavy. They are the same pots the tots wear, on
their own, for shelves, shops or decoration.

## Props and pests

`props/` has a colourway number at the end of the name when there are several:
- watering cans (`can-classic`, `can-teapot`, `can-slim`, `can-kids`,
  `can-haws`) and a `mister`;
- grow lamps (`lamp-clip`, `lamp-pendant`, `lamp-tripod`, `lamp-bar`,
  `lamp-orb`);
- hanging planters (`hang-clips`, `hang-macrame`) and a ceiling `hook`;
- a potting `bench`, soil and supply sacks (`bag-soil`, `bag-food`,
  `bag-perlite`, `bag-bark`, `bag-sand`), and a tool `caddy`;
- tools: `trowel`, `fork`, `shears`, `dibber`, `gloves` and `meter`;
- `seeds` packets, a `seedling` in a nursery pot, a `nursery-stack`, `labels`,
  `twine`, `cloche`, `moss-pole` and `bamboo`;
- care items: `saucer`, `pebble-tray`, `food-spray`, `food-balls` (fertiliser
  pearls), `treat`, `cutting` and `bug-spray`.

`pests/` has `aphid`, `mite`, `mealybug`, `gnat`, `scale`, `thrips` and
`whitefly`: faceless, pill-shaped toy bugs, sized to perch on a leaf.

## The kit, in `kit/`

The tots are built in code: the plant grows leaf by leaf, the pot is generated
from a profile, the limbs are fitted to the pot, and the clips are computed
every frame. `kit/terratots.js` is that code as one ES module. It imports
`three` and `three/examples/jsm/...`, so it uses the game's own copy. It loads
the models in `kit/`: `monstera/`, `pothos/`, `leaves/` (snake plant and ZZ)
and `body/` (the rigged arm and leg).

```js
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import * as TT from './kit/terratots.js';

const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
const kit = await TT.loadPackKit('assets/terra-tots/kit/', loader);
const tot = new TT.Tot(kit, {
  species: 'monstera', age: 0.8,          // age 0..1: a seedling to a full plant
  pot: 'egg', cw: 0,                      // any of TT.POTS, and a colourway index
  skin: '#e6b08c', pattern: 'vitiligo', patternColor: '#fbf6ee',
  legs: 1.3, arms: 1.1, size: 1.2,        // proportions
});
scene.add(tot.root);
tot.setPlant('monstera', 1.0);            // grow it (rebuilds the plant)
tot.mergeMeshes();                        // fewer draw calls (see "Budget"); stays on through setPlant
// every frame: tot.pose(seconds, 'walk') returns the walking speed, to move tot.root by
```

- **Species:** monstera, albo, thai, pothos, satin, cebu, neon, snake, whale,
  cylindrical, laurentii, peacelily, domino, zz, zzvar, raven, alocasia,
  frydek, blackvelvet, calathea, whitefusion, dottie, bop.
- **Skin patterns:** `TT.SKIN_PATTERNS` (none, vitiligo, marble, splash,
  spots, speckle, brindle, wavy, pinstripe).
- **Animations:** `TT.ANIMS` lists them.
- **Characters:** `TT.MEMBERS` has the ten characters' settings (use them with
  `TT.who(name)`).
- **Props and pests:** `TT.PROPS` builds every prop in code, and
  `TT.infest(plant, 'aphid', count)` puts a few bugs on a plant's leaves.
- **Leaf sway:** every leaf sways on its own by default. Pass
  `sway: 'plant'` to have the plant sway as one piece.

The kit's markings and some leaf colours use custom shaders, which is why the
ready-made tots carry them baked into textures instead.

## Using them in a game

RUN games render with three.js.

**Load with the meshopt decoder.** The files are meshopt-compressed
(`EXT_meshopt_compression`, animation included), so the loader needs the
decoder, which ships with three.js. Without it the models fail to load.

```js
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
```

**Ready-made tots are skinned.** Load each tot once and clone it with
`SkeletonUtils.clone()` (from `three/examples/jsm/utils/SkeletonUtils.js`),
not `object.clone()`, so each copy gets its own skeleton. Give each tot its own
`AnimationMixer` and play clips from `gltf.animations` by name. A clip carries
only the nodes it moves, so three.js's mixer holds the rest at their rest pose,
also while cross-fading.

**Budget.** A ready-made tot is 0.7 to 2.8 MB to download (the pothos, with the
most leaves, are the biggest) and about 20 to 30 draw calls; variegated plants,
where every leaf has its own pattern, take up to 50. Everything except the
limbs is drawn as one skinned mesh per material, and each leaf is a bone of
that mesh so it can sway on its own. On a phone, about 100 to 200 draw calls a
frame is comfortable, so plan on 5 to 8 tots on screen. Update mixers only for
tots on screen. Pots and props are light, a few draw calls each. Kit tots built
in code draw each leaf separately (40 to 150+ draw calls) until you call
`tot.mergeMeshes()`.

**Shadows.** On phones, leave shadow maps off and put a soft dark disc under
each tot instead: a `PlaneGeometry` with a radial-gradient `CanvasTexture`,
one shared material, following the tot.

## Credits

The leaf models and the leaf texture are adapted from the *Tiny Treats* house
plants by Isa Lousberg (CC0), which are also in this library.
