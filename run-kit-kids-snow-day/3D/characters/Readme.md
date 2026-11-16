# Kit Kids: Snow Day

Original assets for RUN. Keep License.txt with redistributed files.

Skis, sleds, snowball fights and carolers. Mix-and-match chibi kids for any game: one big rounded-cube head, mitten hands and stub
legs, dressed from swappable pieces. Every piece is flat colour with no textures, every colour can be changed,
and the whole kid draws as one skinned mesh with one material.

This is one of the Kit Kids packs. They all share one skeleton, one set of clips and one set of file names, so
any packs combine: put their `kit/` folders together and merge their catalogs (see below).

- `kit/base.glb`: the skeleton, the plain kid (head, face and expressions, skin body) and all 33 clips.
- `kit/<slot>-<item>.glb`: one per piece, skinned to the same skeleton (47 files in all, with the
  short hair worn under hats and the overalls' bib).
- `kit/kidkit.js`: a three.js helper that assembles a kid from a look, recolours it and plays its clips. The
  pack's catalog is built in.

Every GLB is meshopt-compressed; load them with the meshopt decoder.

## Pieces

28 pieces of its own, plus the basics every Kit Kids pack includes
(six hairstyles, plain trousers, jeans and leggings, sneakers, boots and bare feet).

| Slot | Items |
|---|---|
| Hair | crop, long, braids, ponytail, buzz, afro |
| Hat | earmuffs, trapper hat, beanie, top hat |
| Neck | scarf |
| Top | puffy coat, sweater, hoodie, wool coat |
| Bottom | pants, jeans, leggings, snow pants, joggers |
| Shoes | bare feet, sneakers, boots, snow boots, ice skates, wellies, skis |
| Hands | mittens |
| Left hand | snowball, snow shovel, ski pole |
| Right hand | songbook, candle, cocoa, ski pole, snowball |
| Ride on | snowboard, sled, saucer sled |

Each piece has up to four colour channels (main, trim, accent, detail) and a few named colourways; any colour
works. Skin can be any of six tones or any colour.

## Ready-made looks

The pack's outfits are built in as `kit.looks`: `skier`, `snowboarder`, `sledder`, `saucer-rider`, `ice-skater`, `snowball-fighter`, `shoveller`, `caroler`, `candle-caroler`.

## Using them in a game

```js
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { loadKidKit } from './kit/kidkit.js';

const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
const kit = await loadKidKit('assets/run-kit-kids-snow-day/kit/', { loader });
const kid = await kit.makeKid(kit.looks['skier']);   // a ready-made look, or kit.randomLook()
scene.add(kid.object);
kid.play('idle');
await kid.wear('hat', 'earmuffs');   // swap a piece
kid.paint('top', 'main', '#3a7bd5');                 // recolour one channel
kid.setSkin(3);                                      // a skin tone index or any colour
// every frame: kid.update(dt);
```

A look is `{ skin, hair, hat, ... }`, each slot `{ item, way }` (a colourway name) or
`{ item, colours: [main, trim, accent, detail] }`. `kit.items` lists every slot's items with their channel
names and colourways. `kid.setMaterial(pal => withKitPalette(new THREE.MeshToonMaterial(), pal))` puts the kit's
colours on any three.js material.

To use several Kit Kids packs together, copy their `kit/` folders into one and load it with
`loadKidKit(dir, { loader, catalog: mergeCatalogs(catalogA, catalogB) })`, importing each pack's `CATALOG`.

A ride (`snowboard`, `sled`, `saucer-sled`) sits under the kid and is worn with its own clip: `kit.items.ride[name].clip`
(and `kit.items.shoes.skis.clip` for the skis). A ride is never worn with skis or ski poles; kidkit drops them.

## Clips (30 fps)

| Clip | What |
|---|---|
| `idle` | standing, breathing |
| `walk` | walking in place |
| `run` | running in place |
| `jump` | a jump |
| `pick-up` | bends down and picks something up |
| `celebrate` | a cheer |
| `scared` | a fright |
| `attack` | a lunge |
| `trick-or-treat` | holds out what is in its hand |
| `wave` | waves |
| `hit` | hit, and recovers |
| `sad` | sad |
| `sneak` | sneaking in place |
| `spin` | a spin |
| `idle-peek` | idle: peeks round |
| `idle-yawn` | idle: a big yawn |
| `idle-look` | idle: looks around |
| `dance-wiggle` | a wiggle dance |
| `dance-robot` | a robot dance |
| `run-jump` | a running jump |
| `eat-candy` | eats a sweet |
| `death` | falls over (ends lying down) |
| `aim` | aims a held weapon |
| `run-aim` | runs, aiming |
| `shoot` | fires a held weapon |
| `ready` | weapon and shield up, ready |
| `slash` | a sideways weapon swing |
| `smash` | an overhead weapon smash |
| `fly` | hovering in the air (jetpack, wings) |
| `lift-off` | crouches and shoots up into the hover |
| `snowboard` | carving on the snowboard (wear ride: snowboard) |
| `ski` | double-poling on skis (wear shoes: skis) |
| `sled` | sitting on the sled or saucer, arms up (wear ride: sled or saucer-sled) |

The clips change the face themselves (mouths, brows, closed eyes). `death` ends lying down; kidkit moves each kid
so that whatever it wears rests on the floor.

Units: a kid stands about 5.4 tall (taller with big hats). +Y is up and the kid faces +Z.
