# Facet Fauna: Cats 3D/characters

Original assets for RUN. Keep License.txt with redistributed files.

Faceted low-poly cats: 83 ready-made breeds, each one skinned GLB with 37
animation clips, and a mix-and-match kit of the parts they are made from
(body builds, heads, ears, coat patterns) for games that build or breed cats
at run time. Every GLB is meshopt-compressed: load it with the meshopt
decoder (see "Using them in a game").

- `breeds/<breed>.glb`: ready-made breeds. Load one, play a clip; nothing
  else needed.
- `kit/`: the kit. `catkit.js` assembles cats from `kit/cat_*.glb` and the
  pattern masks in `kit/patterns/`.

Units are metres, +Y is up, and a cat faces +X (its left side is -Z); its
origin is on the floor under the middle of the body. Each breed is scaled to
its real length, nose to rump: 0.3 m (a kitten) to 0.8 m (a Maine Coon).
The kit and the clips are made in units of body length, so those speeds and
distances below are in body lengths.

## Breeds (83)

One shared skeleton, six body builds:

- **domestic** (16): domestic-shorthair, domestic-shorthair-ginger,
  domestic-shorthair-tuxedo, domestic-shorthair-calico, domestic-shorthair-tortie,
  domestic-shorthair-grey-tabby, american-shorthair, european-shorthair,
  japanese-bobtail, american-curl, american-wirehair, snowshoe, burmilla, thai,
  tonkinese, laperm
- **cobby**, round and low (16): manx, cymric, british-shorthair,
  british-shorthair-lilac, british-longhair, chartreux, scottish-fold,
  scottish-straight, highland-fold, persian, persian-black, exotic-shorthair,
  himalayan, burmese, bombay, selkirk-rex
- **large**, big and square (14): domestic-longhair, american-bobtail,
  kurilian-bobtail, pixie-bob, maine-coon, maine-coon-silver,
  norwegian-forest-cat, siberian, neva-masquerade, ragdoll, birman, ragamuffin,
  turkish-van, siberian-forest-blue
- **wild**, long and lean (28): siamese, siamese-blue-point, oriental-shorthair,
  oriental-longhair, balinese, javanese, colorpoint-shorthair, peterbald,
  cornish-rex, devon-rex, sphynx, donskoy, lykoi, abyssinian, somali,
  singapura, russian-blue, nebelung, korat, bengal, bengal-snow, egyptian-mau,
  ocicat, savannah, serengeti, toyger, chausie, turkish-angora
- **munchkin**, short legs (5): munchkin, munchkin-longhair, minskin, bambino,
  lambkin
- **kitten** (4): kitten-ginger, kitten-tuxedo, kitten-calico, kitten-fluffy

Each breed is one mesh (about 1,300 triangles) with one material and one
512-texel coat texture: one draw call. The `rig` node (the scene's one child)
carries extras, `userData` in three.js: `breed`, `build`, `length_m` and
`looping_clips`.

## Clips (30 fps)

Loop = repeats; the others play once and hold their last frame. Gaits run in
place: move the cat yourself at the speed given, in body lengths per second
(multiply by `length_m` for metres per second).

| Clip | Loop | What |
|---|---|---|
| `idle` | yes | standing: breathing, quick looks left and back, a head tilt, blinks, the tail waving |
| `walk` | yes | 0.29 body lengths/s, paws planted while on the floor |
| `trot` | yes | 1.0 body lengths/s |
| `run` | yes | gallop, 3.8 body lengths/s: back bunching and stretching, two flights per stride |
| `sneak` | yes | crouched stalk, 0.13 body lengths/s |
| `sit` | no | stand to sit |
| `sit_idle` | yes | sitting tall, tail round the paws with the tip tapping, looking about |
| `sit_to_stand` | no | |
| `slow_blink` | no | sitting: eyes close slowly and open (the cat "I love you") |
| `head_tilt` | no | sitting: a curious tilt one way, then the other |
| `paw_swipe` | no | sitting: bats at something in front, twice |
| `loaf` | no | stand to loaf, legs tucked right into the body |
| `loaf_idle` | yes | eyes half shut, ears swivelling, tail sweeping and tapping on the floor |
| `loaf_to_stand` | no | |
| `lie_down` | no | stand to sphinx |
| `lie_idle` | yes | sphinx: tail tip thumping, looking round |
| `knead_lie` | yes | lying, front paws kneading the blanket |
| `lie_to_stand` | no | |
| `sleep` | no | loaf to curled up asleep, eyes shut |
| `sleep_idle` | yes | slow breathing, an ear twitch, a dreaming tail flick |
| `wake` | no | sleep to sphinx: blinks, a big lying stretch |
| `flop` | no | sphinx to lying on its side |
| `flop_idle` | yes | on its side: tail sweeping, a slow blink, a paw kneading the air |
| `stretch` | no | play bow with the front paws far forward, then a back leg out |
| `groom` | yes | sitting, licking a raised paw |
| `knead` | yes | standing, front paws pressing in turn |
| `scratch_ear` | yes | sitting, a hind leg scratching behind the ear |
| `wiggle` | yes | crouched butt wiggle before a pounce |
| `pounce` | no | wiggle, freeze, leap about 0.85 body lengths forward, pin the catch |
| `jump` | no | wiggle, buck and leap forward, land |
| `arch` | no | spooked: tall arched back, tail up |
| `tail_flick` | no | the top of the tail whips over and back, twice |
| `tail_swish` | yes | annoyed lashing |
| `tail_wave` | yes | slow content wave |
| `tail_question` | no | tail up with the top hooked over, a friendly hello |
| `tail_bat` | yes | tail low, striking side to side |
| `tail_quiver` | yes | tail straight up, the tip quivering |

`pounce` and `jump` end forward of where they started (0.85 and 0.38 body
lengths along +X): move the cat's origin by that distance when they finish.
Transitions (`sit`, `loaf`, `lie_down` and back) start and end on the idles'
poses, so chain them directly: `sit`, then `sit_idle`, then `sit_to_stand`.

The skeleton also has an eyelid bone (`lids`, its Y scale closes the eyes),
ear bones, and two breathing bones under the ribs and belly. The clips drive
all of them, so blinks, sleeping eyes, ear flicks and breathing play without
any code.

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

**One cat, playing a clip.** The cats are skinned, so copy one with
`SkeletonUtils.clone()`, not `clone()` (a plain clone keeps pointing at the
original skeleton). Load each breed once and clone it for every cat of that
breed; clones share geometry, material and texture.

```js
const gltf = await loader.loadAsync('breeds/bengal.glb');
const cat = SkeletonUtils.clone(gltf.scene);
scene.add(cat);
const mixer = new THREE.AnimationMixer(cat);
const { looping_clips: looping, length_m } = gltf.scene.getObjectByName('rig').userData;
function play(name) {
  const action = mixer.clipAction(THREE.AnimationClip.findByName(gltf.animations, name));
  action.reset();
  action.setLoop(looping.includes(name) ? THREE.LoopRepeat : THREE.LoopOnce, Infinity);
  action.clampWhenFinished = true;
  mixer.stopAllAction();
  action.play();
}
play('walk');
// each frame
mixer.update(dt);
```

For smoother changes, `crossFadeTo` the next action over about 0.15 s instead
of `stopAllAction()`. To walk a cat, move it at the clip's speed:
`cat.position.x += 0.29 * length_m * dt` (rotated to its heading).

**The kit: make or breed cats at run time.** Copy `kit/catkit.js` into your
game's source (it holds the breed table and the colours), and ship the `kit/`
folder's GLBs and `patterns/` with your assets.

```js
import { loadCatKit } from './catkit.js';
const kit = await loadCatKit('assets/cats/kit/');        // the folder holding cat_*.glb
const tabby = kit.makeCat('Domestic Shorthair (ginger)'); // any breed name ...
const kitten = kit.makeCat(kit.breed('Siamese', 'Maine Coon'));  // ... or a cross of two
scene.add(kitten.object);
kitten.play('sit_idle');                                 // cross-fades from the last clip
// each frame
kitten.update(dt);
```

`makeCat` also takes a description with the same fields as a breed:
`{ build, size, head, ears, tail, coat, base, layers, nose }`, where
`layers` is up to three `pattern:colour` pairs joined with `|`
(`'mackerel:darkred|bicolor:white'`). `kit.catalog` lists every build, head,
ear, tail, coat, pattern and colour; `kit.breeds` holds the 83 breeds.
`breed(a, b)` picks each of those fields from one parent or the other. Kit
cats use standard materials with the coat patterns drawn in the shader, so
they are lit by your scene's lights like the ready-made breeds. A kit cat is
about 7 draw calls (body, coat, tail, head and its fluff, eyes, two ears);
use the ready-made breeds where you don't need run-time variety.

**Use a blob shadow, not shadow maps.** Shadow maps draw the whole scene a
second time. Put a soft dark disc under each cat instead:

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

// per cat: about 1.2 times its length
const shadow = new THREE.Mesh(blobGeo, blobMat);
shadow.scale.setScalar(1.2 * length_m);
shadow.position.y = 0.002;
cat.add(shadow);
```

**Budget.** About 100 to 200 draw calls a frame is comfortable on a phone. A
ready-made cat is 1 plus its shadow, so a few dozen cats on screen is fine;
skinning costs more than drawing, so update mixers only for cats on screen.
Cap the pixel ratio: `renderer.setPixelRatio(Math.min(devicePixelRatio, 2))`.
