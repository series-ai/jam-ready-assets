# Chonky Hounds: Doggo Dynasties 3D/characters

Original assets for RUN. Keep License.txt with redistributed files.

Thirty chunky toy dog breeds on one shared skeleton, 41 shared animation clips,
223 coat colourways with markings and breeding, a collar and a bandana fitted to
every dog, and 41 props (beds, toys and care items). Every GLB is
meshopt-compressed: load it with the meshopt decoder (see "Using them in a game").

- `dogs/<breed>.glb`: the 30 dogs, about 1,470 triangles each, each with its own
  coat texture. They load and render in any glTF loader.
- `dogs/dog-clips.glb`: every animation, once, for every dog (`code/dogclips.js`
  fits the clips to each dog's legs, body and tail).
- `dogs/coats/`: coat masks for the colourways and markings (`code/dogcoat.js`).
- `wear/<breed>--collar.glb`, `wear/<breed>--bandana.glb`: neckwear fitted to each
  dog, one piece at a time; `bandana-patterns.png` holds the bandana patterns.
- `props/<prop>.glb`: props, made at the dogs' scale.
- `code/`: the three.js helpers. Copy them into your game's source.

Units: each dog model is about 1 unit tall at the top of its head, stands on the
floor at its origin and faces +Z. Scale a dog by its size class (below).

## Breeds (30)

Proportions never change with age, only scale. A puppy is 0.45; dogs grow to their
size class (`SIZES` and `BREEDS` in `code/dogdata.js`):

| Size | Adult scale | Breeds |
|---|---|---|
| toy | 0.45 | `chihuahua`, `shih-tzu`, `yorkshire-terrier`, `pomeranian` |
| small | 0.65 | `french-bulldog`, `beagle`, `dachshund`, `pembroke-welsh-corgi`, `pug`, `shiba-inu`, `cavalier-king-charles-spaniel`, `boston-terrier`, `jack-russell-terrier`, `miniature-schnauzer` |
| medium | 0.85 | `english-bulldog`, `poodle`, `siberian-husky`, `australian-shepherd`, `border-collie`, `dalmatian`, `samoyed` |
| large | 1.1 | `labrador-retriever`, `golden-retriever`, `german-shepherd`, `rottweiler`, `boxer`, `doberman`, `great-dane`, `bernese-mountain-dog`, `greyhound` |

## Clips (41)

| Group | Clips |
|---|---|
| Gaits (loop, in place) | `walk`, `trot`, `run`, `gallop`, `robot` |
| Play | `idle`, `play_bow`, `catch`, `drop_ball`, `stretch`, `bark`, `bark_rapid`, `sniff`, `point` |
| Potty | `pee_male` (leg lift), `pee_female` (squat), `poop` |
| Poses (`_enter`, `_loop`, `_exit`) | `sit`, `down`, `comfy` (rolled on a hip), `sploot`, `beg` (sit pretty), `dance` (on the hind legs), `play_dead` |
| Tricks | `paw` (from sitting), `roll_over` (from lying down), `spin` |

`lib.meta[name]` describes each clip: `duration`, `loop`, `stride` for gaits, the
`from` and `to` pose a clip starts and ends in (`stand`, `sit`, `down`, `comfy`,
`sploot`, `beg`, `dance`, `dead`), and event times (`bark`, `catch`, `release`,
`sniff`, `pee_start`, `pee_end`, `poop`). To change pose, chain clips whose `from`
and `to` link the current pose to the next, then play its `_loop`: `sit_enter`,
`sit_loop`, `sit_exit`.

## Props (41)

| Group | Props |
|---|---|
| bed | `towel`, `cardboard-box`, `donut-bed`, `pillow-bed`, `dog-house`, `crate`, `blanket`, `bolster-bed`, `sofa-bed`, `frame-bed`, `teepee` |
| toy | `stick`, `old-sock`, `plastic-bottle`, `tennis-ball`, `rubber-ball`, `squeaky-bone`, `rope-toy`, `frisbee`, `plush-duck`, `plush-carrot`, `chew-toy`, `tug-ring`, `cotton-rope`, `leather-ball`, `puzzle-toy`, `plush-fox` |
| care | `tin-dish`, `margarine-tub`, `water-bowl`, `kibble-bag`, `treat-jar`, `brush`, `collar-leash`, `bath-tub`, `shampoo`, `poop-bags`, `fire-hydrant`, `floor-bowl`, `raised-feeder`, `water-fountain` |

`floor-bowl` also comes empty, with food and with water (`floor-bowl--empty`,
`floor-bowl--food`, `floor-bowl--water`).

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

**Copy `code/` into your game's source.** `dogclips.js` plays the clips,
`dogcoat.js` does coats, faces and cloth, and `dogdata.js` holds the breed list and
every colourway. They import `three` and nothing else.

**One dog, playing a clip.** The dogs are skinned, so copy one with
`SkeletonUtils.clone()`, not `clone()`. Load each breed once and clone it for every
dog of that breed; load the clip library once for all of them.

```js
import { loadClipLibrary, setupDog } from './dogclips.js';
import { BREEDS, SIZES } from './dogdata.js';

const lib = await loadClipLibrary(loader, 'assets/dogs/dog-clips.glb');
const gltf = await loader.loadAsync('assets/dogs/beagle.glb');
const root = SkeletonUtils.clone(gltf.scene);
const scale = SIZES[BREEDS.find(b => b.slug === 'beagle').size];
root.scale.setScalar(scale);
scene.add(root);
const dog = setupDog(root, lib);
dog.play('trot');                    // cross-fades from the last clip
dog.setSpeed(0.9, scale);            // gaits: set the ground speed, the paws stay planted
dog.onEvent = name => { /* 'bark', 'catch', 'pee_start', ... */ };
// each frame
dog.update(dt);
```

Gaits run in place: move the dog yourself at the speed you gave `setSpeed`. For a
pose, `dog.play('sit_enter')`, then `sit_loop` when it finishes
(`lib.meta.sit_enter.duration`).

**Coats, markings and faces.** A dog shows its breed's own coat until you set one.
`loadCoats` takes the coat data and the folder holding the masks; `apply` puts the
coat shader on a dog.

```js
import { loadCoats, breed } from './dogcoat.js';
import { COATS } from './dogdata.js';

const coats = await loadCoats(COATS, 'assets/dogs/coats/');
const coat = await coats.apply(root, 'beagle', { lite: true });   // lite: cheaper lighting for phones
coat.set(coats.palette('beagle', 'lemon-white'));                   // a colourway by name
const pal = coats.index.beagle.colorways[2];                       // or any in the list
coat.set({ ...pal, marks: { sock_fl: ['#eeedea', 0.2], blaze: ['#eeedea', 0.6] } });
coat.setFace({ eye_l: '#3f78c4', eye_r: '#5a3a1e', nose: '#58301f' });   // eyes, nose, mouth, tongue
coat.set(breed(palA, palB));                                        // a puppy from two parents' palettes
```

Markings: `sock_fl`, `sock_fr`, `sock_hl`, `sock_hr`, `muzzle`, `blaze`, `bib`,
`eye_l`, `eye_r`, `mask`, `tail_tip`, `brows`, each `[colour, amount 0..1]`. Every
breed shares one coat shader, so coats cost one shader program however many breeds
are on screen. To place dogs without waiting, call `coats.preload(['beagle', ...])`
once, then `coats.applyNow(root, 'beagle')`.

**Collars and bandanas.** Load the dog's own piece and bind it to the dog's
skeleton. Use one at a time: they share the neck.

```js
import { attachWear } from './dogclips.js';
import { loadClothPatterns, tintCloth } from './dogcoat.js';

const cloth = await loadClothPatterns('assets/wear/bandana-patterns.png');
const bandana = (await loader.loadAsync('assets/wear/beagle--bandana.glb')).scene;
for (const m of attachWear(root, bandana)) {
  if (m.material.name === 'bandana') tintCloth(m.material, cloth, '#b8322a', '#f6f0e4', 'dots');   // dots, gingham, stripes, plain
}
const collar = (await loader.loadAsync('assets/wear/pug--collar.glb')).scene;
for (const m of attachWear(pugRoot, collar)) {
  if (m.material.name === 'collar') m.material.color.set('#2f6fb5');
}
```

**Use a blob shadow, not shadow maps.** Shadow maps draw the whole scene a second
time. Put a soft dark disc under each dog instead:

```js
const c = document.createElement('canvas');
c.width = c.height = 64;
const g = c.getContext('2d');
const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
grad.addColorStop(0, 'rgba(0,0,0,0.3)');
grad.addColorStop(1, 'rgba(0,0,0,0)');
g.fillStyle = grad;
g.fillRect(0, 0, 64, 64);
const blobGeo = new THREE.PlaneGeometry(1.2, 1.6).rotateX(-Math.PI / 2);
const blobMat = new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c), transparent: true, depthWrite: false });
const shadow = new THREE.Mesh(blobGeo, blobMat);   // per dog
shadow.scale.setScalar(scale);
shadow.position.y = 0.002;
const holder = new THREE.Group();   // move the holder: the dog and its shadow go together
holder.add(root, shadow);           // (beside the dog, not inside it: coats recolour the dog's meshes)
scene.add(holder);
```

**Budget.** A dog is about 2 draw calls (body and face) plus 1 for a collar or
bandana. Thirty dogs measured about 50 draw calls, 39,000 triangles and half a
millisecond of animation a frame on a laptop; on a low-end phone expect 25 to 40
dogs at 30 fps with `lite` coats. Animate dogs off screen or far away at a lower
rate, and cap the pixel ratio: `renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5))`.
