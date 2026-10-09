# Reuse INKLINE in a RUN game

Use Three.js 0.170 or a compatible version. The exported GLBs use meters, +Y up, and +Z forward. Each file has its own dimensions in the manifest. The figures share bone names. Each character file contains all 85 clips with timing adapted to that figure.

Copy the complete `run-inkline` directory to your public assets. Copy `3D/characters/Source/types.ts` and its `runtime` directory into your source tree. Keep their relative paths. The consumer manifest in `Source/manifest.json` has paths relative to the pack root.

The current `mountEquipment()` call takes the animation catalog as its fourth argument. Staff alignment uses the authored `staff-thrust` contact time. Other melee tools use the common first pose of `punch-heavy`. Shields use the body-specific guard pose. The exported wrist keys account for these references. Do not replace a mount reference with another idle pose.

## Load a character and equip it

```ts
import * as THREE from 'three'
import { AssetLibrary, applyAvatar, mountEquipment, supportEquipment, disposeInstance } from './inkline/runtime/assets'
import { DEFAULT_AVATAR, type PackManifest } from './inkline/types'

const packURL = new URL('./run-inkline/', document.baseURI)
const response = await fetch(new URL('3D/characters/Source/manifest.json', packURL))
if (!response.ok) throw new Error('The pack catalog could not load.')
const manifest: PackManifest = await response.json()
const library = new AssetLibrary(manifest, packURL)
const character = await library.create('stick-standard')
applyAvatar(character.root, { ...DEFAULT_AVATAR, equipment: 'rifle', headwear: 'cap' })
scene.add(character.root)

const rifle = await library.create('rifle')
mountEquipment(character.root, rifle, character.clips, manifest.animations)
const mixer = new THREE.AnimationMixer(character.root)
const idle = character.clips.find(clip => clip.name === 'rifle-idle')
if (!idle) throw new Error('Rifle Idle is missing.')
mixer.clipAction(idle).play()

function update(delta: number) {
  mixer.update(delta)
  supportEquipment(character.root, rifle.root, 'rifle-idle')
}

function dispose() {
  mixer.stopAllAction()
  mixer.uncacheRoot(character.root)
  disposeInstance(character.root)
  library.dispose()
}
```

`scene` is the scene in your game. Call `update` before rendering. Call `dispose` when this scene ends. Stop animation actions before disposing the character.

`applyAvatar(root, config)` changes body color, uniform height, limb thickness, head size, and headwear. It does not load held equipment. `mountEquipment` adds that equipment at its grip. `supportEquipment` keeps the left palm on a long gun during Rifle and Shotgun clips. Call it after the mixer update.

For a bow, call `supportEquipment(character.root, bow.root, clipName, action.time)`. The named `bow-string` child follows the right palm during `bow-draw`. During `bow-release`, it returns to its resting line at the catalog contact time. The string endpoints stay on the bow. The helper keeps source geometry unchanged.

Avatar bounds are height 0.85–1.15, thickness 0.70–1.30, and head size 0.80–1.20. The accent color controls headwear. The default heads have no faces. `validateAvatar` checks imported JSON. Check its preset and equipment IDs against your catalog too. Select only props with the `held` tag for hand equipment.

## Effects

```ts
import * as THREE from 'three'
import { InkEffects } from './inkline/runtime/effects'

const effects = new InkEffects(2048)
scene.add(effects.group)
effects.trigger('heavy-impact', new THREE.Vector3(0, 1, 0))
// Optional overrides: color, size, planar direction in radians, lifetime.
effects.trigger('sword-slash', new THREE.Vector3(0, 1, 0), '#d45538', 1.2, 0, 0.8)

function updateEffects(delta: number) {
  effects.update(delta, camera)
}
```

`camera` is the active camera in your game. A missing color override preserves the preset palette. A supplied color changes the accent layers. Ink and paper layers keep their preset colors. Some presets combine several shapes. `activeCount` gives particle count. `activeBursts` gives burst count. `clear` removes active particles. `dispose` releases the pool and removes its group.

The sprite sheets use transparent RGBA PNG. Read `2D/misc/atlas.json` for frame size, layout, and duration. Frames run left to right, then top to bottom. The last frame clears the effect. These sheets are an alternative to the procedural runtime.

## Build a district

```ts
import { createDistrict } from './inkline/runtime/district'
const district = await createDistrict(library)
scene.add(district.root)
// When the scene ends:
// district.clearance.dispose()
// disposeInstance(district.root)
```

The full assembly is also supplied as GLB and Blender files. Layout positions use +Y up. The Blender generator converts them to +Z up. Some pipe and mount origins sit on a centerline. They are not ground pivots. Read `prop-contract.md` before placing them.

`moveBody(body, input, collision, delta)` moves a simple character proxy. Use fixed substeps of 1/60 second. The demo includes explicit ramp surfaces and major solid obstacles. Small dressing objects do not all have collision. The controller has movement, jumping, running, ground support, and wall sliding. It does not perform ladder climbing, wall running, or vault detection. Those motions are supplied as animation clips for use in your game.

## License and provenance

The pack is licensed under the RUN Repository Supplemental License v1.0 (see root `LICENSE.md`). Keep the full `License.txt` notice. All pack art was generated from the included original source definitions. Flash animation informed the visual direction. No art from those references is included.

## Additional level scenes

Call `createDistrict(library, false, 'service-yard')` or `createDistrict(library, false, 'roof-works')` to assemble another scene. `EXTRA_LAYOUTS` contains placement, actor, and effect data. The runtime batches each static scene by material. Dispose the returned `clearance` and `root` when the scene ends.

The two extra scenes are visual level assemblies. Their layout data does not include gameplay collision. The combat and parkour demos use `DISTRICT_COLLISION` in the original district. Add game collision for the extra layouts before you use them as playable levels.

`CameraClearance` tests the visible triangles. It keeps decorative rails and poles separate from the movement collision proxies. `fitPerspectiveBox` fits a scene or equipped avatar within both camera axes.

For a repeatable effect preview, call `effects.clear()` before `effects.trigger()`. This resets the particle seed. `effectPreviewBounds` returns the matching preview center and radius. A live game can trigger repeated effects without clearing to retain particle variation.

Use `equipmentContactPoint(equipment, target)` after `mountEquipment` to place a contact mark on the held model. For a blade or staff, it finds the nearest point on the weapon line. For a firearm, it returns the muzzle point. The demo uses this point for contact effects and the melee weapon distance test. The target point comes from the chest bone. A bounded range and facing test rejects distant targets first. Scene triangle tests block contacts through walls. This is a simple contact system. It does not use swept body collision or a full rigid body solver.


## Kinetic motion helpers

Travel clips declare `travelSpeed` in meters per second. Set playback rate to actual ground speed divided by `travelSpeed` and avatar height. The GLB has its first key at 1/30 second. Start travel actions at that key. On each loop, wrap within `[firstKey, clip.duration)`. This removes the otherwise repeated first pose. The showcase implements this in `updateActorAnimation`. Use ordinary clip time for attacks and other actions so their contact times stay unchanged.

`kinetics.ts` contains pure impact profiles. Call `getImpactProfile(clipId, kind, equipmentId)` to select reach, hit hold, reaction, camera, and trail values. Use `sampleRecoil(profile, age)` to get absolute travel, lift, and tilt. Its age uses seconds. It returns zero with `done: true` after the reaction ends. Apply the result once to a stored origin. Do not add it to the previous frame position.

`advanceAttack()` remains the contact clock. Use the clip metadata from the manifest. `contactTime` equals `contactFrame / 30`. A contact result is true once per attack. Keep damage, the contact mark, and reaction start on that event. A miss must not start hit stop.

`stepActionBuffer(remaining, delta, ready)` holds one input edge for up to `ACTION_BUFFER_SECONDS`, which is 0.16 seconds. Use real elapsed time to age the buffer. The showcase does this once per rendered frame, including during hit stop. It does not extend the window when playback is slow. Clear the buffer on reset, blur, scene change, and equipment change. Holding the action input must not add another edge.

`InkTrails` stores four paths with 16 samples each. It uses one draw call and at most 240 triangles. Supply two world-space edge points for each sample. Sample only during the fast part of a stroke. Use a narrow width for a hand or foot. Use the mounted tool segment for a matching weapon action.

```ts
import { InkTrails } from './inkline/runtime/trails'
const trails = new InkTrails()
scene.add(trails.group)
function sampleTrail(inner: THREE.Vector3, outer: THREE.Vector3, time: number) {
  trails.sample(0, inner, outer, time, '#151716', .14)
  trails.update(time)
}
// At reset, seek, equipment change, or scene change:
trails.clear()
// At scene disposal:
trails.dispose()
```

Trail lifetimes must be positive and no more than 0.18 seconds. `update(time)` takes an absolute time, not a delta. Pause this clock with the animation. The pool clears a path after a backward time jump, long sample gap, or teleport. It does not create geometry during playback.

The showcase has Full and Reduced motion settings. The operating system reduced-motion setting also applies. Reduced mode removes trails, extra camera movement, and reaction tilt. It keeps character movement, damage, and small contact marks. A game that uses the libraries must apply its own reduced-motion setting.

Dust uses open strokes with instance alpha. The strokes grow as they fade. Other effects keep their crisp graphic envelope. The procedural runtime targets Three.js 0.170. Check the dust material shader hooks if you change Three.js versions.

Use `InkTrails.line` for a straight shot trace. It accepts both world endpoints and keeps long shots intact. Use `sample` for hand and tool sweeps. Its distance guard clears samples after a teleport.

## Fit a motion preview

Use `animationBounds(character.root, clip, contactTime)` to measure the full
motion with the attached tool. It samples a cloned rig at 30 Hz and at the
contact time. It includes support-hand IK. It leaves the live pose unchanged.
Cache the result for each body, shape, clip, and tool selection. Do not call it
from the render loop. Use `fitPerspectiveBox()` with a margin to frame the box.


## Stable game cameras

Keep the requested orbit separate from the rendered camera. Pass that
requested pose to `CameraMotion.update`. Use a fixed body height and focus,
not moving hand or foot positions. Apply its returned position and target
once. Reset the motion state only for a camera choice, scene change, or game
reset. The showcase source contains the complete integration.

For foreground visibility, create one `ForegroundCutaway` per game scene.
Call `apply` once on the scene-owned district meshes and line segments.
After the camera pose is current, call `update(camera, focus, height, delta)`.
The focus is the body root plus half its standing height. Call `reset` when
the camera or scene resets. The helper changes material shader hooks. Use it
on scene-owned materials that do not already have custom shader hooks.

The optional `updateSecondary` covers one reacting target. Pass its root,
standing height, support-floor height, and delta. Pass a null root to fade
out. Retain the selected target through its reaction and recovery. Wait for
`secondaryAmount` to fall below 0.01 before replacing it. The helper does not
select a target or change collision geometry.
