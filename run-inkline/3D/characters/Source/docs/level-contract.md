# INKLINE industrial district contract

The district contains 148 static placements from 33 prop IDs. The layout includes warehouses, tanks, machinery, cargo areas, fences, pipes, rails, ramps, platforms, and catwalks. It occupies a yard of about 32 by 28 meters.

## Files and source

- `src/runtime/district.ts`: source placement, collision, and checkpoint data.
- `public/assets/industrial-district.json`: generated layout and gameplay data.
- `public/assets/source/industrial-district.blend`: editable assembled level.
- `public/assets/scenes/industrial-district.glb`: static visual scene.
- `scripts/blender/level.py`: scene generator.

The JSON contains `placements`, `collision`, and `checkpoints`. A placement has a model `id`, position `at`, optional target `size`, and optional `yaw`. Positions and sizes use meters. Yaw uses radians.

## Coordinates and transforms

The JSON uses runtime coordinates: Y up and +Z forward. The Blender generator maps position `(x, y, z)` to `(x, -z, y)`. Runtime yaw about +Y maps to Blender rotation about +Z.

For a target size, the generator divides each target dimension by the catalog model dimension. Blender receives these scale factors in X, Z, Y order. This scales around the native prop origin. It does not recenter the model or move its base to the floor.

Placement objects use names such as `floor-slab-001`. Instances of a prop share its source mesh. The Blender file includes an orthographic overview camera. The GLB excludes cameras, lights, and animations.

## Rendering

The scene uses the three unlit prop materials. It contains visual geometry only. Characters, checkpoint markers, route paint, and effects are added by the demo.

Shared mesh data reduces duplicate geometry storage. It does not guarantee a small number of draw calls. A renderer that loads the raw scene GLB can submit many object and material draws.

The showcase builds the district from its placement data. `createDistrict` uses `bakeStatic` to combine static geometry by compatible material. It then adds edge lines and route paint. This batching is runtime code, not a feature of the raw scene GLB.

## Collision and route

The current collision data contains five route surfaces and eight box obstacles. The route has seven checkpoints. Surfaces describe flat decks and slopes. Boxes represent selected buildings, containers, machinery, and platform bases.

`src/runtime/physics.ts` provides a small character movement controller. It tests horizontal movement against boxes. It uses surface heights and box tops for vertical support. The caller supplies fixed time steps.

These proxies do not cover every visible object. Rails, pipes, ladders, stairs, and small props do not all block movement. The controller is not a complete mesh collision engine. It has no general climbing, vaulting, rigid body, or navigation system.

Update the collision and checkpoint data when a change affects the playable route. The GLB has no embedded collision behavior.

## Regeneration and verification

Build the prop source and catalog before the level. Run this command from the app directory:

```bash
/Applications/Blender.app/Contents/MacOS/Blender --background --factory-startup --python scripts/blender/level.py -- --out public/assets
```

The generator reads the layout JSON, catalog dimensions, and prop meshes. It writes the assembled Blender file and GLB. It then reports the exported node, mesh, material, and geometry counts.

The route test checks movement through all seven checkpoints with the demo collision data. File checks and desktop rendering do not prove an Android frame rate. See [performance.md](performance.md) for the device target and available measurements.

## Additional visual layouts

Service Yard and Roof Works use the same placement contract. `src/runtime/layouts.ts` contains their source data. Each has a GLB, an editable Blender scene, and JSON placement data. `environment-layouts.json` lists all three scenes. Read [environment-layouts.md](environment-layouts.md) for the new assemblies.

Their actor and effect entries are demo placement data. The extra layouts do not yet have gameplay collision or checkpoints. The original district remains the playable combat and parkour level.
