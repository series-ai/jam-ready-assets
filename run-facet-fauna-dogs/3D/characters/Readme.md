# Facet Fauna: Dogs 3D/characters

Original assets for RUN. Keep License.txt with redistributed files.

Faceted low-poly dogs: 104 ready-made breeds, each one skinned GLB with 65
animation clips, and a mix-and-match kit of the parts they are made from
(21 body builds, heads, ears, tails, coat shells, coat patterns, a collar and
a bandana) that can make all 414 breeds in its table, or any cross of two, at
run time. Every GLB is meshopt-compressed: load it with the meshopt decoder
(see "Using them in a game").

- `breeds/<breed>.glb`: ready-made breeds. Load one, play a clip; nothing
  else needed.
- `kit/`: the kit. `dogkit.js` assembles dogs from `kit/dog_*.glb` and the
  pattern masks in `kit/patterns/`.

Units are metres, +Y is up, and a dog faces +X (its left side is -Z); its
origin is on the floor under the middle of the body. Each breed is scaled to
its real length, nose to rump: 0.29 m (a Chihuahua) to 1.2 m (a Great Dane).
The kit and the clips are made in units of body length, so the speeds below
are in body lengths.

## Breeds (104)

One shared skeleton, 21 body builds:

- **shepherd**: german-shepherd, belgian-malinois, border-collie, rough-collie,
  smooth-collie, shetland-sheepdog, australian-shepherd, australian-cattle-dog
- **gundog**: labrador-retriever, golden-retriever, irish-setter
- **spaniel**: american-cocker-spaniel, english-cocker-spaniel,
  english-springer-spaniel, cavalier-king-charles-spaniel, brittany
- **lean**: doberman-pinscher, dalmatian, german-shorthaired-pointer, weimaraner,
  vizsla, rhodesian-ridgeback, great-dane, basenji
- **sighthound**: greyhound, whippet, italian-greyhound, saluki, afghan-hound,
  borzoi, irish-wolfhound
- **scenthound**: beagle, bloodhound, black-and-tan-coonhound,
  bluetick-coonhound, redbone-coonhound, treeing-walker-coonhound
- **spitz**: siberian-husky, alaskan-malamute, samoyed, akita, shiba-inu,
  chow-chow, keeshond, pomeranian
- **terrier**: jack-russell-terrier, wire-fox-terrier, border-terrier,
  airedale-terrier, soft-coated-wheaten-terrier, miniature-schnauzer,
  standard-schnauzer, giant-schnauzer
- **lowterrier**: scottish-terrier, west-highland-white-terrier, cairn-terrier
- **mountain**: bernese-mountain-dog, rottweiler, newfoundland, great-pyrenees,
  leonberger
- **mastiff**: english-mastiff, bullmastiff, cane-corso, saint-bernard, shar-pei
- **bully**: american-pit-bull-terrier, american-staffordshire-terrier,
  staffordshire-bull-terrier, american-bully, boxer
- **bullterrier**: bull-terrier, miniature-bull-terrier
- **bulldog**: english-bulldog
- **brachy**: pug, french-bulldog, boston-terrier
- **corgi**: pembroke-welsh-corgi, cardigan-welsh-corgi
- **longlow**: dachshund, basset-hound
- **toy**: chihuahua, papillon, chinese-crested
- **toylong**: shih-tzu, lhasa-apso, maltese, yorkshire-terrier, havanese,
  bichon-frise, pekingese
- **shaggy**: old-english-sheepdog, bearded-collie, puli, komondor
- **poodle**: standard-poodle, miniature-poodle, toy-poodle,
  portuguese-water-dog, bedlington-terrier, labradoodle, goldendoodle,
  bernedoodle, cockapoo

Each breed is one mesh (about 1,300 triangles) with one material and one
512-texel coat texture: one draw call. The `rig` node (the scene's one child)
carries extras, `userData` in three.js: `breed`, `build`, `length_m` and
`looping_clips`. The other 310 breeds of the kit's table (and crosses) come
from the kit.

## Clips (30 fps)

Loop = repeats; the others play once and hold their last frame. Gaits run in
place: move the dog yourself. The paws look planted at about these speeds, in
body lengths per second (multiply by `length_m` for metres per second): walk
0.12, trot 0.42, run 1.2, sneak 0.05; `zoomies` is a sprint, move it fast.

| Group | Clips |
|---|---|
| Idle and resting | `idle`, `idle_happy`, `sit`, `sit_idle`, `sit_to_stand`, `lie_down`, `lie_idle`, `lie_to_stand`, `lie_to_sleep`, `sleep_curl`, `sleep_side` |
| Moving | `walk`, `trot`, `run`, `sneak`, `zoomies`, `walk_back`, `crawl`, `turn_left`, `turn_right`, `jump_up`, `jump_down`, `land`, `spin` |
| Tricks | `play_bow`, `stretch`, `shake_paw`, `roll_over`, `play_dead`, `stand_hind`, `shy`, `speak`, `balance_treat`, `head_tilt` |
| Toys and food | `pick_up`, `carry_idle`, `carry_walk`, `put_down`, `drop_it`, `jump_catch`, `catch_standing`, `tug`, `chew`, `toss`, `shake_toy`, `eat`, `drink`, `receive_treat` |
| Everyday | `sniff`, `dig`, `scratch_ear`, `shake_off`, `shake_big`, `yawn`, `sneeze`, `pee`, `nudge`, `greet`, `get_pet` |
| Moods | `happy`, `sad`, `scared`, `growl`, `howl`, `excited_bounce` |

Transitions (`sit`, `lie_down` and back) start and end on the idles' poses, so
chain them directly: `sit`, then `sit_idle`, then `sit_to_stand`. `jump_up`
ends 0.25 body lengths higher than it starts (onto a ledge) and `jump_down`
starts there. Every clip keeps the paws on the floor, or lifts the dog off it
on purpose.
A clip carries only the bones it moves; three.js's mixer holds every other
bone at its rest pose, also while cross-fading.

**Mouth and toys.** The jaw opens in `speak`, `yawn`, `howl`, the toy clips
and more (it is skinned to the `jaw` bone). Each breed has two empty nodes on
its head bone: `socket_mouth`, where a held toy goes, and `socket_nose`, where
`balance_treat` balances a treat. The `grip` bone's scale is 1 while the mouth
holds something and 0 when it lets go, so a game knows when to attach a toy
to the mouth and when to drop it: `pick_up`, `jump_catch` and
`catch_standing` grab, `put_down`, `drop_it` and `toss` let go (give a tossed
toy the mouth's speed). In `balance_treat` the treat sits on the nose until
1.6 s and is caught at 1.95 s.

## Using them in a game

RUN games render with three.js.

**Load with the meshopt decoder.** The files are meshopt-compressed
(`EXT_meshopt_compression`), so the loader needs the decoder, which ships
with three.js. Without it the models fail to load.

```js
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js';
const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
```

**One dog, playing a clip.** The dogs are skinned, so copy one with
`SkeletonUtils.clone()`, not `clone()` (a plain clone keeps pointing at the
original skeleton). Load each breed once and clone it for every dog of that
breed; clones share geometry, material and texture.

```js
const gltf = await loader.loadAsync('breeds/beagle.glb');
const dog = SkeletonUtils.clone(gltf.scene);
scene.add(dog);
const mixer = new THREE.AnimationMixer(dog);
const { looping_clips: looping, length_m } = gltf.scene.getObjectByName('rig').userData;
function play(name) {
  const action = mixer.clipAction(THREE.AnimationClip.findByName(gltf.animations, name));
  action.reset();
  action.setLoop(looping.includes(name) ? THREE.LoopRepeat : THREE.LoopOnce, Infinity);
  action.clampWhenFinished = true;
  mixer.stopAllAction();
  action.play();
}
play('trot');
// each frame
mixer.update(dt);
```

For smoother changes, `crossFadeTo` the next action over about 0.15 s instead
of `stopAllAction()`. To trot a dog, move it at the clip's speed:
`dog.position.x += 0.42 * length_m * dt` (rotated to its heading).

**A toy in the mouth.**

```js
const mouth = dog.getObjectByName('socket_mouth');
const grip = dog.getObjectByName('grip');
// each frame, after mixer.update: attach while grip.scale.x > 0.5, drop when it falls to 0
if (grip.scale.x > 0.5 && ball.parent !== mouth) mouth.attach(ball);
```

**The kit: make or breed dogs at run time.** Copy `kit/dogkit.js` into your
game's source (it holds the breed table and the colours), and ship the `kit/`
folder's GLBs and `patterns/` with your assets. Parts load the first time a dog
needs them; `kit.preload(...)` loads them ahead, e.g. on a loading screen.

```js
import { loadDogKit } from './dogkit.js';
const kit = await loadDogKit('assets/dogs/kit/');                // the folder holding dog_*.glb
const lab = await kit.makeDog('Labrador Retriever');              // any of the 414 breeds ...
const pup = await kit.makeDog(kit.breed('Pug', 'Beagle'));        // ... or a cross of two
const sid = await kit.makeDog({ ...kit.breeds['Shiba Inu'], wear: ['bandana'] });   // or collar
scene.add(pup.object);
pup.play('play_bow');                                            // cross-fades from the last clip
// each frame
pup.update(dt);
```

`makeDog` also takes a description with the same fields as a breed:
`{ build, size, head, ears, tail, coat, base, layers, nose, wear }`, where
`layers` is up to three `pattern:colour` pairs joined with `|`
(`'saddle:black|tuxedo:white'`). `kit.catalog` lists every build, head, ear,
tail, coat, pattern and colour; `kit.breeds` holds the 414 breeds.
`breed(a, b)` picks each field from one parent or the other, and
`dog.recolour({ base, layers, nose })` repaints a dog. `dog.mouth` and
`dog.nose` are the toy and treat points, `dog.holding()` reads the grip. Kit
dogs use standard materials with the coat patterns drawn in the shader, so
they are lit by your scene's lights like the ready-made breeds. Colours go
through the pack's soft papercraft palette; pass `{ palette: 'natural' }` to
`loadDogKit` for the raw colours. A kit dog is 6 to 8 draw calls (body, tail,
head, jaw, two ears, plus a coat shell and head fluff on fluffy coats); use the ready-made breeds where you don't
need run-time variety.

**Use a blob shadow, not shadow maps.** Shadow maps draw the whole scene a
second time. Put a soft dark disc under each dog instead:

```js
// once: one texture, geometry and material shared by every shadow
const c = document.createElement('canvas');
c.width = c.height = 64;
const g = c.getContext('2d');
const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
grad.addColorStop(0, 'rgba(0,0,0,0.3)');
grad.addColorStop(1, 'rgba(0,0,0,0)');
g.fillStyle = grad;
g.fillRect(0, 0, 64, 64);
const blobGeo = new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2);
const blobMat = new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c), transparent: true, depthWrite: false });

// per dog: about 1.1 times its length
const shadow = new THREE.Mesh(blobGeo, blobMat);
shadow.scale.setScalar(1.1 * length_m);
shadow.position.y = 0.002;
dog.add(shadow);
```

**Budget.** About 100 to 200 draw calls a frame is comfortable on a phone. A
ready-made dog is 1 plus its shadow, so a few dozen dogs on screen is fine;
skinning costs more than drawing, so update mixers only for dogs on screen.
Cap the pixel ratio: `renderer.setPixelRatio(Math.min(devicePixelRatio, 2))`.
