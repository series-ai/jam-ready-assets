# Furries Unleashed 3D

Original assets for RUN. Keep License.txt with redistributed files.

**Mix and match any part with any other to make whatever creature you want.**
A shark with fox ears and a mohawk, a bunny-eared wolf with a dragon's tail on
hooves, a bat-eared cat with talons: every head, ear, cheek tuft, hairstyle, eye, set of
teeth, tail and foot fits every other, on one shared body. 23 species come
ready-made as starting points (wolf, fox, cat, lion, dragon, shark, horse,
bunny and more), and every colour region can be recoloured.

Chunky low-poly anthro characters, fursona style: a digitigrade body with big
fursuit paws, distinct snoots and an opening jaw. Every character shares one
skeleton and the same 32 animation clips: walk, trot, sprint and gallop, paw
slashes, a maul, a bite, a bark and a roar, a jump, getting hurt and dying,
going down on all fours, sitting (and typing, eating and chatting while
seated), picking things up and waving. Every GLB is meshopt-compressed: load
it with the meshopt decoder (see "Using them in a game").

- `characters/*.glb`: the 23 species, ready-made: each has its own parts and
  colours and every clip. Drop one in and play a clip.
- `kit/base.glb`: the bare body, the skeleton and every clip.
- `kit/*.glb`: one GLB per part, all bound to the same skeleton.
- `kit/furrykit.js`: a three.js helper that assembles, recolours and animates
  characters in the pack's toon look. The whole catalog is built in, so only
  the GLBs need loading.

Units: a character stands about 2 tall to the top of the head (more with tall
ears or horns). +Y is up and the front faces +Z.

## Species

wolf, husky, fox, dog, cat, tiger, lion, bunny, deer, horse, goat, bear,
raccoon, red panda (`redpanda`), otter, hyena, mouse, kangaroo, bat, dragon,
lizard, shark and bird. Each species is just a preset of the parts below plus
a palette: swap any part on any of them, or start from scratch.

## The kit

| Slot | Choices |
| --- | --- |
| head | the 23 species heads |
| ears | `wolf`, `fox`, `cat`, `round`, `big_round`, `small`, `bunny`, `tall`, `horse`, `deer`, `bat`, `lop`, `fin`, none |
| cheeks | `spiky`, `round`, `fin`, none |
| hair | `crest`, `mohawk`, `swoop`, `long`, none |
| eyes | `almond`, `round`, `sharp`, `sleepy`, `happy`, `slit`, `dot` |
| teeth | `fangs`, `buck`, `shark`, `tusks`, `snaggle`, none |
| tail | 20 tails (from fluffy wolf and fox brushes to a dragon's spined tail and a shark's fluke), none |
| feet | `paws`, `hooves`, `cloven`, `talons`, `reptile` |
| extras | chest `tuft`, `claws`, a hoodie (`top`) and shorts (`bottom`) |

Each teeth style comes fitted to every snout (`kit/teeth-<style>__<snout>.glb`);
the helper picks the one that matches the head. Toe claws (`claws-paws`) go
with paws only: hooves, talons and reptile feet bring their own.

**Colour regions:** `fur`, `fur_light` (markings), `fur_dark` (socks, gloves,
brows), `inner_ear`, `pads`, `hair`, `iris`, `eye_white` (also the teeth),
`pupil`, `nose`, `mouth` (also the lids and the inside of the mouth), `horn`
(horns, beaks, hooves), `claws`, and `cloth_top`, `cloth_top_trim`,
`cloth_bottom`, `cloth_bottom_trim`. Each region is a material name, so without
the helper you can recolour by material name.

## Clips

| Group | Clips |
| --- | --- |
| moving | `walk`, `trot`, `sprint`, `gallop`, `jump` |
| standing | `idle`, `wave`, `wave_princess`, `tpose` |
| fighting | `slash_r`, `slash_l`, `slash_combo`, `maul`, `bite`, `bark`, `roar`, `hurt`, `death` |
| on all fours | `fours_down`, `fours_idle`, `fours_up` |
| sitting | `sit_down`, `sit_idle`, `sit_type`, `sit_eat`, `sit_talk`, `sit_up` |
| hands | `pickup`, `collect`, `interact`, `gather`, `type` |

The gaits run in place: move the character yourself. Looping clips:
`walk`, `trot`, `sprint`, `gallop`, `idle`, `wave`, `wave_princess`, `bark`,
`fours_idle`, `sit_idle`, `sit_type`, `sit_eat`, `sit_talk`, `gather`, `type`.
The seated clips sit on a seat 0.46 high under the hips.

**Swing trails:** the slashes and the maul list when each paw is mid-swing
(`fur.trails()`, in seconds). Attach your slash effect to `fur.clawTip('L' | 'R')`
during those windows.

## The look

The pack has one look: toon shading with a dark outline. The helper applies it
to every character it builds, and `kit.toonify(object)` gives a ready-made
character from `characters/` the same look. Tune it with
`fur.setStyle({ outline, ink, steps, shadow })` (outline thickness, outline
darkness, shading bands and shadow level; defaults in `kit.style`). The GLBs'
own materials are plain colours by region, used as the toon colours.

## Using them in a game

```js
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { loadFurryKit } from './furrykit.js';

const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
const kit = await loadFurryKit('assets/furries-unleashed/kit/', { loader });
const fur = await kit.makeFurry('fox');                 // a species, or kit.randomLook(), or your own look
scene.add(fur.object);
fur.play('trot');
await fur.set({ head: 'dragon', tail: 'dragon' });      // swap any part
await fur.set({ teeth: 'fangs', hair: 'mohawk' });
fur.paint({ fur: '#3a7bd5', hair: '#ff6fd8' });         // recolour regions
fur.play('slash_r');                                    // one-shots hold their last frame
// every frame: fur.update(dt)
```

`kit.lookFor('lion', { eyes: 'sharp' })` gives a species preset with changes;
`kit.partsFor(look)` lists the part GLBs a look needs.

For a ready-made character without building it from parts:

```js
import { toonify } from './furrykit.js';
const gltf = await loader.loadAsync('assets/furries-unleashed/characters/wolf.glb');
scene.add(toonify(gltf.scene));                          // the pack's toon look
const mixer = new THREE.AnimationMixer(gltf.scene);
mixer.clipAction(THREE.AnimationClip.findByName(gltf.animations, 'idle')).play();
```

GLTFLoader drops the dots from bone names (`hand.L` becomes `handL`).
