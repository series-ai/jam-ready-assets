# INKLINE character contract

The pack has 12 character GLBs. Each GLB contains the same 85 named animation clips. `public/assets/characters.json` lists model dimensions, mesh counts, clip durations, and loop flags.

## Coordinates and rig

One unit is one meter. Blender uses Z up and -Y forward. The exported GLBs use Y up and +Z forward. The root origin is at floor level. The rest pose has the arms near the sides.

Each character uses this 18-bone hierarchy:

```text
Root
└── Hips
    ├── Spine
    │   └── Chest
    │       ├── Neck
    │       │   └── Head
    │       ├── UpperArm_L
    │       │   └── Forearm_L
    │       │       └── Hand_L
    │       └── UpperArm_R
    │           └── Forearm_R
    │               └── Hand_R
    ├── Thigh_L
    │   └── Shin_L
    │       └── Foot_L
    └── Thigh_R
        └── Shin_R
            └── Foot_R
```

Body landmarks drive both the mesh and rig. Both arms share one branch point. Both legs share one branch point. The base body has no lateral shoulder or hip bar and no clothing bands. Each role has a separate proportion record. The six body families and twelve equipment presets are defined in `src/runtime/roles.ts` and exported as `character-roles.json`. The avatar editor applies each role as an editable starting kit.

The models use weighted skinning and one unlit `Ink` material. The GLBs declare `KHR_materials_unlit`. Each base mesh stays within the 2,500-triangle budget. The catalog gives the exact count for each body. Added headwear and equipment increase this count.

## Animation

The catalog has 24 movement clips, 32 melee clips, 10 ranged clips, 9 reactions, 6 interaction clips, and 4 sport clips. Twenty-four clips have a loop flag. The generator copies the first resolved pose to the final pose for these loops.

The quality correction preserves the previous 84 IDs and adds `get-up-forward`. The new clip starts from the final prone pose of `death`. `get-up` starts from the final pose of `knockdown`.

The generator authors clips at 30 frames per second and samples the GLB export at 120 Hz. Export-only NLA scaling preserves the previous durations and contact times. Canonical motion data records the action phases and support-foot intervals. A two-bone solve holds each declared support foot to its path. Signed hip corrections keep grounded mesh surfaces at the floor. Airborne intervals retain their authored flight.

The full motion check samples at 60 Hz. The grounded export check samples at 240 Hz and accepts a floor range of -1 mm to 15 mm. A separate support-foot check measures horizontal and vertical drift against each declared plant path. Avatar checks cover the minimum, default, and maximum stroke thickness. See [grounded-export.json](verification/kinetic/grounded-export.json), the per-sample motion check (regenerable with [verify-motion-quality.ts](../scripts/verify-motion-quality.ts)), and [avatar-contact.json](verification/correction/avatar-contact.json).

Travel loops include a positive `travelSpeed` in metres per second. Use actual movement speed divided by `travelSpeed * avatar.height` as the action playback scale. The authored `motion` metadata uses Blender coordinates, stated in its `coordinateSystem` field. Its phase and plant frame numbers use 30 FPS.

Clips do not move the character root through the level. A game controller must supply travel, collision, attack events, and object interactions. Hip movement and body rotation can still occur within a clip.

Attack entries include `contactTime` in seconds. The GLB retains the Blender time origin. Frame 1 is at 1/30 second. Contact time is the authored frame divided by 30. Use this value for damage, impact effects, and target response. Do not fire these events when the clip starts. The demo uses a brief contact hold, then completes the recovery. The `startAttack` and `advanceAttack` helpers provide the same event rule to another game.

Use the catalog IDs to select clips. Use the catalog loop flag to choose playback behavior. The animation viewer repeats single actions for inspection. That repeat behavior does not change the loop flag.

Climb, vault, wall-run, reload, and sport clips are animation assets. The demo does not provide full gameplay systems for all these actions. Reload clips do not animate separate weapon parts.

## Avatar and equipment API

`applyAvatar` in `src/runtime/assets.ts` applies body color, accessory color, height, stroke thickness, head size, and headwear. These changes occur at runtime. They are not separate baked GLB variants.

The accepted scale ranges are:

| Field | Minimum | Maximum |
| --- | ---: | ---: |
| `height` | 0.85 | 1.15 |
| `thickness` | 0.70 | 1.30 |
| `headScale` | 0.80 | 1.20 |

Head geometry and headwear scale about the Head bone attachment point. This preserves the neck connection at each head size. Headwear choices are none, cap, headband, beanie, visor, and helmet. The faces stay blank. The pack does not include face or finger rigs.

Use `mountEquipment(character, model, clips, manifest.animations)` for a model with the `held` tag. It selects a reference pose and applies the grip rotation, palm offset, and size limit. Bow and shield models use `Hand_L`. Other held models use `Hand_R`.

After the animation mixer updates, call `supportEquipment(character, equipment, clipName, action.time)`. It adjusts the left arm for supported rifle and shotgun clips. It also moves the bow string to the right palm and releases it at the authored contact time. This helper does not provide general hand contact for every action. See [reuse.md](reuse.md) for the call order.

## Source and verification

- `public/assets/characters/*.glb`: runtime models and clips.
- `public/assets/source/characters.blend`: editable character source. It contains 85 source actions and 1,020 corrected actions. Each character has 85 named NLA tracks. The tracks are muted in the saved file. Enable one track to inspect that clip.
- `scripts/blender/characters.py`: geometry, rig, and animation generator.
- `public/assets/sample-pose-metrics.json`: sampled pose diagnostics.

Run the generator from the app directory:

```bash
/Applications/Blender.app/Contents/MacOS/Blender --background --factory-startup --python scripts/blender/characters.py -- --out public/assets
```

Then rebuild the catalog and previews through the asset build workflow. `npm run assets:verify -- --require-previews` checks the exported files, clip IDs, weights, loop endpoints, and previews. Pose samples and file checks do not establish performance on an Android device. See [performance.md](performance.md).

## Limb surface continuity

The generator carries each tube ring basis into the next ring. Cap domes use the matching tube basis. A continuity assertion rejects ring-axis flips. Face normals are rebuilt before export. This prevents twisted sections at ankles and elbows.
