# Chonky Cats: Purrfect Pedigrees 3D/characters

Original assets for RUN. Keep License.txt with redistributed files.

Chunky toy cats and kittens: eight cat bodies on one shared skeleton, 26 animation
clips, 236 coat colourways covering 30 breeds, eyes that dilate from slits to round
pupils, kittens with big eyes that grow up, four fitted neck pieces, and 50 props. A
companion to *Chonky Hounds: Doggo Dynasties*, on the same rig and coat system, so cats
and dogs share a scene. Every GLB is meshopt-compressed: load it with the meshopt
decoder (see "Using them in a game").

- `cats/<body>.glb`: the 8 cat bodies, about 1,850 triangles each.
- `cats/cat-clips.glb`: every animation, once, for every body (`code/catclips.js` fits
  the clips to each body's legs, body and tail).
- `cats/coats/`: coat masks for the colourways (`code/catcoat.js`).
- `wear/<body>--collar.glb`, `--bandana.glb`, `--bell_collar.glb`, `--neckerchief.glb`:
  neck pieces fitted to each body, one at a time; `cloth-patterns.png` holds the cloth patterns.
- `props/<prop>.glb`: beds, scratchers, toys and care items, made at the cats' scale.
- `code/`: the three.js helpers. Copy them into your game's source.

Units: each cat model is about 1 unit tall at the top of its head, stands on the floor
at its origin and faces +Z. Scale a cat by its size class (below).

## Bodies and breeds (30)

A breed is a colourway on its body (`COLOURWAYS` in `code/catdata.js`):

| Body | Shape | Breeds |
|---|---|---|
| `moggy` | standard shorthair | `ginger-tabby`, `tuxedo`, `calico`, `brown-tabby`, `black-cat`, `bengal`, `american-shorthair`, `tortoiseshell`, `turkish-van`, `egyptian-mau` |
| `cobby` | round and plush, small ears | `british-shorthair`, `scottish-fold` |
| `flatface` | round long-hair, flat face | `persian`, `exotic-shorthair`, `himalayan` |
| `floof` | big, shaggy ruff, tufted ears, plume tail | `maine-coon`, `ragdoll`, `norwegian-forest-cat`, `birman`, `siberian` |
| `sleek` | slim, big ears, thin tail | `siamese`, `russian-blue`, `abyssinian`, `savannah`, `oriental-shorthair` |
| `pixie` | hairless or wavy coat, huge ears | `sphynx`, `devon-rex` |
| `munchkin` | short legs | `munchkin` |
| `bobtail` | pom-pom tail | `manx`, `japanese-bobtail` |

## Sizes and kittens

Proportions never change with age, only scale. A kitten is 0.3; cats grow to their size
class: small 0.45 (`devon-rex`, `munchkin`, `oriental-shorthair`, `japanese-bobtail`), medium 0.55, large 0.65 (`maine-coon`, `ragdoll`, `norwegian-forest-cat`, `birman`, `savannah`, `turkish-van`, `siberian`).
These match the Chonky Hounds scale (a puppy is 0.45, a medium dog 0.85).
`cat.grow(g, adultScale)` (g from 0, a kitten, to 1, grown) sets the scale and gives
kittens bigger eyes (1.35 times), shrinking to the adult size as they grow.

## Clips (26)

| Group | Clips |
|---|---|
| Gaits (loop, in place) | `walk`, `trot`, `run`, `gallop` |
| Standing | `idle`, `meow`, `hiss` (puffed tail held straight out), `pounce`, `stretch`, `sniff` |
| Sitting | `sit_enter`, `sit_loop`, `sit_exit`, `groom`, `bat`, `knead` |
| Lying | `down_enter`, `down_loop`, `down_exit`, `loaf_enter`, `loaf_loop`, `loaf_exit` (paws tucked), `flop_enter`, `flop_loop`, `flop_exit` (on its side), `roll_over` |

`lib.meta[name]` gives each clip's `duration`, `loop`, `stride` for gaits, the `from`
and `to` pose (`stand`, `sit`, `down`, `loaf`, `flop`) and event times (`meow`, `hiss`,
`land`). To change pose, chain clips whose `from` and `to` link the current pose to the
next, then play its `_loop`.

Pupils follow the clip: slits when calm, open for play and kneading, wide for the
pounce and the hiss. `cat.pupils = 0..1` holds them anywhere (0 slit, 1 round);
`null` hands them back to the clip.

## Props (50)

| Group | Props |
|---|---|
| bed | `paper-bag`, `laundry-basket`, `cardboard-box`, `cat-cave`, `window-perch`, `radiator-hammock`, `crinkle-tunnel`, `heated-pad`, `strawberry-cave`, `fruit-tart-bed`, `watermelon-bed`, `avocado-bed`, `toast-bed`, `shark-bed`, `cat-teepee`, `cat-condo`, `cat-tree`, `pineapple-house`, `mushroom-house` |
| scratch | `scratch-pad`, `scratch-post`, `scratch-lounge`, `mushroom-tree` |
| toy | `paper-ball`, `bottle-cap`, `hair-tie`, `toy-mouse`, `yarn-ball`, `crinkle-ball`, `jingle-ball`, `feather-wand`, `spring-toys`, `catnip-fish`, `croissant-toy`, `ball-track`, `mechanical-mouse`, `kicker-toy` |
| care | `litter-tray`, `milk-saucer`, `cucumber`, `cat-poop`, `litter-clump`, `pee-spot`, `litter-scoop`, `food-tin`, `food-bag`, `cat-grass`, `nail-clipper`, `covered-litter`, `carrier` |

Every bed, cave, house, carrier and litter box fits a large cat curled up (sitting, for
litter boxes). `cat-poop`, `litter-clump` and `pee-spot` dress a litter tray or a floor.

## Using them in a game

RUN games render with three.js.

**Load with the meshopt decoder.** The files are meshopt-compressed
(`EXT_meshopt_compression`), so the loader needs the decoder, which ships with
three.js. Without it the models fail to load.

```js
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js';
const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
```

**Copy `code/` into your game's source.** `catclips.js` plays the clips, `catcoat.js`
does coats, faces and cloth, and `catdata.js` holds the breeds, sizes and every
colourway. They import `three` and nothing else.

**One cat, playing a clip.** The cats are skinned, so copy one with
`SkeletonUtils.clone()`, not `clone()`. Load each body once and clone it for every cat
on it; load the clip library once for all of them.

```js
import { loadClipLibrary, setupDog } from './catclips.js';
import { BREEDS, SIZES, COLOURWAYS, COATS } from './catdata.js';
import { loadCoats } from './catcoat.js';

const lib = await loadClipLibrary(loader, 'assets/cats/cat-clips.glb');
const coats = await loadCoats(COATS, 'assets/cats/coats/');

const breed = BREEDS.find(b => b.slug === 'siamese');            // body 'sleek', size 'medium'
const root = SkeletonUtils.clone((await loader.loadAsync(`assets/cats/${breed.body}.glb`)).scene);
scene.add(root);
const cat = setupDog(root, lib);
const scale = cat.grow(1, SIZES[breed.size]);                    // 0 for a kitten
const coat = await coats.apply(root, breed.body, { lite: true }); // lite: cheaper lighting for phones
coat.set(coats.palette(breed.body, COLOURWAYS[breed.slug]));     // the breed's coat (and eye colour)
cat.play('walk');
cat.setSpeed(0.6, scale);                                       // gaits: the paws stay planted
cat.onEvent = name => { /* 'meow', 'hiss', 'land' */ };
// each frame
cat.update(dt);
```

Gaits run in place: move the cat yourself at the speed you gave `setSpeed`.

**Coats.** Every body has its own colourways plus everyday ones (black, white, blue,
cream, ginger, tabbies, tuxedo, calicos, tortoiseshell, socks and boots, white cats with
brows or a cap): `coats.index[body].colorways`. Markings on top of any coat are set per
cat: `coat.set({ ...palette, marks: { sock_fl: ['#efece6', 0.28], bib: ['#efece6', 0.8] } })`
(socks 0.28, boots 0.55 on these legs). `coat.setFace({ eyes: '#4f8fd6' })` sets the eye
colour (`eye_l`, `eye_r` for odd eyes) and `nose`.

**Neck pieces.** One at a time, bound to the cat's own skeleton:

```js
import { attachWear } from './catclips.js';
import { loadClothPatterns, tintCloth } from './catcoat.js';
const cloth = await loadClothPatterns('assets/wear/cloth-patterns.png');
const wear = (await loader.loadAsync(`assets/wear/${breed.body}--neckerchief.glb`)).scene;
for (const m of attachWear(root, wear)) {
  if (m.material.name === 'bandana') tintCloth(m.material, cloth, '#2c9a5a', '#f6f0e4', 'gingham');   // dots, gingham, stripes, plain
  else if (m.material.name === 'collar') m.material.color.set('#d93a3a');                             // the bell collar's strap
}
```

**Props** are plain GLBs: load and place them. The beds and houses are sized for the cats
at their size classes.
