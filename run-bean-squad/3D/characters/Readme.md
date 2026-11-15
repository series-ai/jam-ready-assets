# Bean Squad 3D

Original assets for RUN. Keep License.txt with redistributed files.

Tall, boxy art-toy beans for party, sports and shooter games. Each bean is a
two-part vinyl-toy body with a hard seam, chunky limbs, and either a printed
art face or a glowing gadget screen. A mix-and-match kit dresses it: tops,
hats, head ornaments, jersey numbers and twelve toy weapons, every part
recolourable. Every part shares one skeleton and the same 70 animation clips.
Everything is flat colour, and every GLB is meshopt-compressed: load it with
the meshopt decoder (see "Using them in a game").

- `kit/base.glb`: the bare bean, the skeleton and all 70 clips.
- `kit/*.glb`: faces, the screen, tops, hats, head ornaments and number
  plates, one GLB per part, all on the same skeleton.
- `kit/weapons/`: twelve toy weapons for the right hand.
- `kit/faces/`: the screen-face masks. `kit/numbers/`: the jersey digits.
- `kit/beankit.js`: a three.js helper that assembles, dresses, recolours and
  animates beans. The whole catalog is built into it, so only the GLBs and
  PNGs need loading.

Units: a bean stands about 2.05 tall (taller with a hat or ornament). +Y is up
and the front faces +Z.

## The kit

A look is one choice per slot, plus colours:

| Slot | Choices |
| --- | --- |
| face | art faces `x`, `dots`, `slits`, `holes`, `stitch`, `cyclops-dot`, `bones`, `tired`, `drip`, `glyph`; screen faces `led-x`, `led-dots`, `led-slits`, `led-glyph`, `led-tired`, `led-bones`, `led-drip`, `led-smirk`, `happy`, `angry`, `love`, `dizzy`, `cool`, `sleepy` |
| top | none, `hoodie`, `vest` (puffer), `coveralls` (front zip, collar, pocket, pant legs) |
| head | none, `bucket`, `beanie` |
| topper | none, `sprout`, `crown`, `antenna`, `horns`, `flower`, `halo` |
| number | none, or 0 to 99: a jersey number on the front and back of a bare body |
| weapon | none, or one of the twelve below |
| finish | `custom` (your body colour), or an art-toy finish: `bone`, `black`, `gold`, `chrome`, `clear`, `glow`, `orange`, `olive` |

The rules the helper applies for you:
- A screen face swaps in `screen.glb`. The hooded top and the hats then use
  their `-screen` versions, cut around the screen.
- A hood replaces any hat or topper. A topper shows only with no hat.
- Numbers show only on a bare body (no top).

**Colour slots:** `body`, `arms`, `hands`, `legs`, `feet`, `mark` (art-face
marks), `top`, `hat`, `topper`, `number`, `bezel` (screen rim), `led` (screen
glow), `weapon`, `weapon_trim` and `weapon_dark`. Each slot is a material name
(`kit.catalog.slots`), so without the helper you can recolour by material
name. Zips, chrome bits, weapon glow and the soaker's water keep their own
colour.

**Weapons** (`kit/weapons/`):
- sidearms: `blaster`, `raygun`, `revolver`
- long guns: `smg`, `rifle`, `sniper`, `shotgun`, `launcher` (a drum grenade
  launcher), `soaker` (a water blaster), `plasma`
- heavies: `bazooka` (held by its front grip, the tube runs back over the
  shoulder) and `minigun`

Each weapon rides the `grip.R` bone, so it follows every clip. Show one for
the shooter clips; the helper's `weapon` slot does it.

```js
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { loadBeanKit } from './beankit.js';

const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
const kit = await loadBeanKit('assets/bean-squad/kit/', { loader });
const bean = await kit.makeBean(kit.looks.striker);     // or kit.randomLook(), or your own
scene.add(bean.object);
bean.play('run');
await bean.set({ top: 'hoodie', head: 'beanie' });      // change any slot
await bean.set({ weapon: 'bazooka' });                  // arm it ('none' to put it away)
bean.paint({ top: '#3a7bd5', led: '#ff4d4d' });         // recolour slots
// every frame: bean.update(dt)
```

`kit.looks` holds twelve ready-made looks (`striker`, `goalie`, `skater`,
`hiker`, `mechanic`, `royal`, `sprout`, `imp`, `ghost`, `trooper`, `heavy`,
`glowbug`). `kit.randomLook(rng, { weapon: true })` makes a valid random one;
pass your own seeded `rng` for a repeatable crowd.

## Clips (30 fps)

| Group | Clips |
| --- | --- |
| Idle | `idle`, `idle-look` |
| Move | `walk`, `walk-back`, `strafe-left`, `strafe-right`, `run`, `sprint`, `sneak`, `crouch-idle` |
| Jump | `jump`*, `jump-start`*, `jump-air`, `jump-land`*, `double-jump`*, `fall`, `dive`* |
| Obstacle course | `belly-slide`, `get-up`*, `splat`*, `stumble`*, `tumble`, `climb`, `hang`, `push`, `carry`, `balance`, `whoa`*, `swim` |
| Hits | `knockback`*, `hit`*, `spin-out`* |
| Shooter | `aim`, `shoot`*, `shoot-auto`, `run-aim`, `walk-aim`, `reload`*, `throw`*, `punch`*, `death`*, `respawn`* |
| Celebrate | `victory`, `cheer`, `jumping-jacks`, `wave`, `wave-big`, `celebrate-backflip`* |
| Dance | `dance-bob`, `dance-disco`, `dance-spin`, `dance-robot`, `dance-floss`, `dance-hop` |
| Social | `bow`*, `taunt`, `thumbs-up`*, `yes`*, `no`* |
| Emotions | `sad`, `sigh`*, `cry`, `defeat`*, `sit`, `sleep`, `shrug`*, `laugh`, `angry`, `scared`, `think` |

`*` = one-shot; the rest loop. `kit.clips` lists each clip's duration, loop
flag and tags.

- **Chains:** `jump-start` → `jump-air` → `jump-land`; `dive` or `splat` →
  `belly-slide` → `get-up`; `death` → `respawn`. Every other one-shot starts
  and ends on the idle pose, so it blends both ways.
- **Root motion:** `dive`, `knockback`, `stumble` and the jumps move the
  `root` bone. Set `bean.inPlace = true` to keep the bean in place and move it
  in game code.
- **Ground speed:** in place, the feet stay planted when you move the bean at
  its gait's ground speed (`kit.clips.<name>.speed`, m/s): walk 0.4, run 1.89,
  sprint 3.12, sneak 0.18, strafe 0.54, walk-back -0.29, push 0.2, carry 0.33.
  Scale it by the bean's scale.
- **Airborne:** `jump-air`, `double-jump`, `fall`, `climb`, `hang` and `swim`
  leave the height to the game.

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

**Without the helper.** Every part GLB carries the same skeleton. Clone
`base.glb` with `SkeletonUtils.clone()` (from
`three/addons/utils/SkeletonUtils.js`), then attach each part by rebinding its
skinned meshes to the base's bones by name:

```js
part.scene.traverse(m => {
  if (!m.isSkinnedMesh) return;
  const bones = m.skeleton.bones.map(b => base.getObjectByName(b.name));
  m.bind(new THREE.Skeleton(bones, m.skeleton.boneInverses), m.bindMatrix);
  base.getObjectByName('rig').add(m);
});
```

One `AnimationMixer` on the base then drives every attached part. Screen
faces: set the `screen` material's `emissiveMap` to `faces/<face>.png`
(`flipY = false`) and tint it with `emissive`. Numbers: use
`num-1-body.glb` (material `num`) or `num-2-body.glb` (`numL`, `numR`), set
each material's `map` to `numbers/num-<digit>.png` (`flipY = false`), with
`alphaTest = 0.5`, and tint it with the material colour.

**Budget.** A dressed bean is about 4,700 to 7,500 triangles, plus 700 to
1,900 for a weapon, and about 6 to 12 draw calls (one per material). A
squad of 10 to 20 on screen is comfortable on a phone. For bigger crowds,
update mixers only for beans on screen.

**Metal finishes need an environment.** `gold` and `chrome` are fully metallic,
so they reflect `scene.environment` and render black without one. Any
environment works, e.g. `RoomEnvironment` through a `PMREMGenerator`.

**Shadows.** Shadow maps draw the whole scene a second time. On phones, leave
them off and put a soft dark disc under each bean instead: a `PlaneGeometry`
with a radial-gradient `CanvasTexture`, one shared material, following the
bean's root.
