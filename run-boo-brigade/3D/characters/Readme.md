# Boo Brigade 3D

Original assets for RUN. Keep License.txt with redistributed files.

Chibi "Bobble" kids for a Halloween game: one giant rounded-cube head, mitten
hands and stub legs, and a costume built on top. Everything is flat colour with
no textures and opaque materials only. Every kid shares one skeleton style and
the same 22 animation clips. Every GLB is meshopt-compressed: load it with the
meshopt decoder (see "Using them in a game").

- `kids/`: 96 ready-made kids, each one skinned GLB with all 22 clips. 86 are
  in costume and 10 are regular kids. Load one and play a clip; nothing else
  is needed.
- `kit/`: the avatar kit for building regular kids at run time. It has a base
  kid, 46 swappable items (hair, face, top, bottom, shoes and prop), and
  `kidkit.js`, a three.js helper that assembles and recolours them.
- `props/`: a spooky street. There are 16 houses, 6 cars, road, sidewalk,
  fences, trees, lamps, tombstones, jack-o'-lanterns and 6 kinds of candy.

Units: a kid stands about 5.4 tall (taller with big headwear). A house is about
13 wide and 18 to 19 tall, a car about 8 long, a road tile 8 x 16 and a
sidewalk tile 4 x 4. +Y is up and the front faces +Z.

## Kids, in `kids/`

The costumes: alien (blob, green, grey), angel, baker, banana, beach witch,
black cat, bowling dude, bride of Frankenstein, bumblebee, cactus, candy corn,
cardboard robot, cat onesie, Cleopatra, clown, cow abduction, cowboy (and on a
horse), cupcake, devil, disco, disco snail, donut, Dracula, dragon,
firefighter, Frankenstein, ghost, grim reaper, gumball machine, Hamilton,
haunted tree, hazmat, hippie, hot dog (and the vendor), ice-cream cone,
inflatable T. rex, jellyfish, king, knight, mad scientist, mafioso, Marie
Antoinette, Medusa, mummy, Napoleon, Ned Kelly, ninja, octopus, ostrich rider,
pineapple, pirate ghost, pizza slice, princess, pumpkin clown, rebel jacket,
reverse mermaid, rocket, scarecrow, scuba diver, shark, skeleton onesie, space
cat, space wizard, spaceman, sparkly vampire, spider, sports player, Statue of
Liberty, sunflower, superhero, taco, tech CEO, traffic cone, UFO, unicorn,
vampire bat, vending machine, Viking, werewolf, witch, wizard and zombie.

The regular kids are `kid-afro`, `kid-bob`, `kid-bun`, `kid-buzz`, `kid-curly`,
`kid-pigtails`, `kid-platinum`, `kid-ponytail`, `kid-puffs` and `kid-spiky`.
They are the kit's ten ready-made looks, already assembled.

### Clips (30 fps)

| Clip | What |
|---|---|
| `idle` | standing, breathing |
| `idle-peek`, `idle-yawn`, `idle-look` | idle variations |
| `walk`, `run`, `sneak` | moving in place |
| `jump`, `run-jump` | jumps |
| `pick-up` | bends down and picks something up |
| `trick-or-treat` | holds out the bucket |
| `eat-candy` | eats a piece of candy |
| `wave` | waves (right mitt) |
| `celebrate`, `dance-wiggle`, `dance-robot`, `spin` | happy and dancing |
| `scared`, `sad` | reactions |
| `attack`, `hit`, `death` | for games with a scare or a fight |

The clips change the face themselves. Each mouth, brow pair and eye shape hangs
from a switch bone shown at scale 1 and hidden at scale 0:
- mouths: `expr.mouth.smile`, `expr.mouth.grin`, `expr.mouth.o` and
  `expr.mouth.frown`
- brows: `expr.brow.angry` and `expr.brow.worried`
- eyes: `expr.eyes.open`, `expr.eyes.closed` and `expr.eyes.dizzy`

A kid shown without a clip wears its resting face (smile, eyes open). Props sit
on `prop.l` and `prop.r`. Every kid carries a trick-or-treat bucket on the
`bucket` bone. The clips never animate it, so scale it to 0 to hide the bucket
and it stays hidden.

## The avatar kit, in `kit/`

The regular kids aren't fixed characters: each is a look made from the kit. A
look is a skin tone plus one item for each of six slots:

| Slot | Items |
| --- | --- |
| hair | crop, anime, swoop, quiff, mohawk, afro, cloud, puffs, braids, ponytail, long |
| face | none, freckles, round glasses, square glasses, plaster |
| top | tee, stripy, hoodie, jersey, cardigan, tube top, raincoat, band tee, sweater vest, puffer, sweater |
| bottom | pants, jeans, joggers, shorts, skirt, tutu, overalls (and the overalls bib) |
| shoes | sneakers, classic, high-tops, wellies, boots |
| prop | none, bucket, full bucket, sack, flashlight, lollipop, wand, teddy |

Any top goes with any bottoms, and the layers never clip. Each item has up to
four colour channels (main, trim, accent, detail) that a game can recolour
freely, plus a few named colourways. Props go in the left mitt, so the right
one stays free for waving and eating.

- `base.glb`: the skeleton, all 22 clips and the plain kid (head, face and
  expressions, skin body).
- One GLB per item, on the same skeleton.
- `kidkit.js`: the three.js helper. The catalog of slots, items, colourways,
  skin tones and the ten ready-made looks is built into it, so only the GLBs
  need loading. It merges a kid into one skinned mesh with one material (one
  draw call per kid), and recolouring is a uniform change.

```js
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { loadKidKit } from './kidkit.js';

const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
const kit = await loadKidKit('assets/boo-brigade/kit/', { loader });
const kid = await kit.makeKid(kit.looks['kid-spiky']);   // or kit.randomLook(), or your own
scene.add(kid.object);
kid.play('walk');
await kid.wear('top', 'raincoat', 'red');               // swap an item (a colourway or colours)
kid.paint('top', 'main', '#3a7bd5');                    // recolour one channel
kid.setSkin(4);                                         // a skin tone index or any colour
// every frame: kid.update(dt)
```

Any kit GLB also opens in a plain glTF loader, in its first colourway. The
costume kids aren't part of the kit: each costume is one fixed piece, in
`kids/`.

## The street, in `props/`

- Houses: `house-01` to `house-12` and `house-a` to `house-d`, each 2 draw
  calls.
- Cars: `car-bug`, `car-pickup`, `car-sedan`, `car-spooky`, `car-van` and
  `car-wagon`.
- Street: `road` (8 x 16) and `sidewalk` (4 x 4) tiles, `street-sign`,
  `hydrant`, `mailbox`, `lamp-single` and `lamp-double`.
- Garden: `fence-white` and `fence-dark` (with `-gate` and `-post` pieces),
  `hedge`, `bush`, `hay-bale`, `leaf-pile`, `crow-post`, `tree-forked`,
  `tree-gnarled` and `tree-leaning`.
- Spooky: `tombstone-cross`, `tombstone-round`, and `jack-small`,
  `jack-medium` and `jack-large`.
- Candy: `candy-apple`, `candy-chocolate`, `candy-corn`, `candy-gumdrop`,
  `candy-lollipop` and `candy-wrapped`.

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

**Ready-made kids are skinned.** Load each kid once. Clone it with
`SkeletonUtils.clone()` (from `three/addons/utils/SkeletonUtils.js`), not
`object.clone()`, so each copy gets its own skeleton. Give each kid its own
`AnimationMixer` and play clips from `gltf.animations` by name. A clip carries
only the bones it moves, so three.js's mixer holds every other bone at its rest
pose, also while cross-fading.

**Budget.** A ready-made kid is about 2,000 to 4,500 triangles and 2 draw
calls. A kit kid is 1 draw call. A house is 2. On a phone, a street of houses
plus 10 to 20 kids on screen is comfortable. For more, update mixers only for
kids on screen.

**Shadows.** Shadow maps draw the whole scene a second time. On phones, leave
them off and put a soft dark disc under each kid instead: a `PlaneGeometry`
with a radial-gradient `CanvasTexture`, one shared material, following the
kid's root.
