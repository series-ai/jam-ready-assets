# Kinetic animation pass

Historical record: Release 1.2. Current release checks are in the quality correction reports.

This pass refines 23 existing clips in the thin stick figure set. A follow-up
weight pass refines six unarmed clips, with `elbow-strike` reviewed again. An
idle silhouette pass adds one refined clip pose. The pass covers 29 unique
clip IDs. It keeps all 84 animation IDs, the shared 18-bone rig, and the
in-place convention.

The motion uses a clear preparation, a fast action, a short contact hold when
the action has a hit, and a visible recovery. Travel clips use asymmetric arms,
legs, and torso lines. Air clips use one-sided limbs and varied body angles.
Sword and staff hand rotations use the mounted weapon axes. Generic role
offsets do not change authored attack hand rotations.

The refined clips are:

- Idle: `idle` uses a fixed root, bent elbows and knees, opposing hip and spine
  angles, and small front depth offsets. Frame 60 exactly matches frame 1.
- Travel: `walk`, `run`, `sprint`, `walk-left`, `walk-right`, `crouch-walk`,
  `turn-left`, `turn-right`.
- Traversal: `jump-start`, `jump-loop`, `jump-land`, `double-jump`, `vault`,
  `wall-run`, `ledge-climb`.
- Unarmed: `punch-left`, `punch-right`, `punch-heavy`, `kick-front`,
  `kick-roundhouse`, `kick-air`, `elbow-strike`, `backfist`.
- Weapons: `sword-slash`, `sword-overhead`, `sword-thrust`, `staff-spin`.
- Ranged: `bow-release`.

The contact events in the refined set use the authored frame divided by 30.
Frame 1 exports at 1/30 second, so the exported times are:

| Clip | Contact frame | Contact time |
| --- | ---: | ---: |
| `punch-left` | 8 | 0.267 s |
| `punch-right` | 9 | 0.300 s |
| `punch-heavy` | 12 | 0.400 s |
| `kick-front` | 9 | 0.300 s |
| `kick-roundhouse` | 12 | 0.400 s |
| `kick-air` | 12 | 0.400 s |
| `sword-slash` | 12 | 0.400 s |
| `sword-overhead` | 14 | 0.467 s |
| `sword-thrust` | 11 | 0.367 s |
| `elbow-strike` | 9 | 0.300 s |
| `backfist` | 9 | 0.300 s |
| `bow-release` | 5 | 0.167 s |

The unarmed weight pass keeps the collision root in place. It adds hip and
shoulder rotation during preparation, contact, and recovery. It adds planted
support-leg shapes for the punches and kicks. The elbow strike uses a compact
torso turn and an asymmetric stance. The authored hand and foot targets stay
valid after the body changes.

`bow-release` has an explicit frame 5 release pose. Loop clips close with the
same resolved first pose. Weapon strikes use linear key interpolation for a fast contact transition.
Other authored curves use clamped Bezier interpolation. The final export
samples all clips at 120 Hz. This reduces the interpolation difference between
the source and GLB poses. Authored frame numbers, durations, and contact times keep their 30 FPS
convention.

Seventeen grounded clips use signed hip corrections at 120 Hz. These cover
idle, walking, turns, the planted punches and kicks, elbow strike, backfist,
and the three refined sword clips. The root stays fixed. Running and airborne
clips retain their flight phases. The GLB floor check uses 240 samples per
second and a floor band from -1 mm to 15 mm.

The final GLB check passed all 204 pairs: 17 grounded clips on each of 12
bodies. The measured floor range was 0.946 mm to 10.645 mm. The check also
confirmed clip durations and contact keys. The result is in
[grounded-export.json](verification/kinetic/grounded-export.json).
The earlier 30 Hz export floor failures remain as historical evidence in
`verification/kinetic/animation-review/grounded-floor.json`.

The generator command was:

```text
/Applications/Blender.app/Contents/MacOS/Blender --background --factory-startup --python scripts/blender/characters.py -- --out public/assets
```

The completed export contains 12 character GLBs, 84 clips per character, and
1,008 character clip instances. Each character keeps the 18-bone contract.
The editable source is `public/assets/source/characters.blend`.

Checks completed:

- The final 240 Hz GLB floor check passed all 204 grounded pairs.
- `python3 -m py_compile scripts/blender/characters.py` passed.
- Blender generation completed and verified all 12 characters and 84 clips.
- The exported sampler check found the expected contact key in all 30 contact
  clips across all 12 GLBs (360 checks).
- The export contains 1,008 clip instances with finite tracks and the expected
  floor bake.
- The metadata check found all 84 requested IDs and no missing ID.
- Visual inspection of actual GLB captures found no page or console errors. The
  unarmed review covers preparation, contact, recovery, and sampled side
  pose sequences in `docs/verification/kinetic/animation-review/`.
- Visual inspection of the regenerated idle pose covers front and +X side
  views for all 12 bodies in `idle-all-bodies.png`. The GLB pose probe found a
  `0.356 m` standard side joint span across the 11 camera witness bones. The
  smallest sampled foot depth gap was `0.266 m`, and the smallest hand depth
  gap was `0.353 m`. Every body had a sampled mesh floor height of `0.004 m`.
- The idle loop uses zero authored root offsets. The probe found matching frame
  1 and frame 60 poses in the exported action.

Use `node --import tsx scripts/verify-grounded-export.ts` to check the final
GLBs. Use `--character stick-sentinel` with the Blender generator and a separate
`--out` directory to inspect one body before a full export.

The model previews, animation previews, body and role sheets, idle views,
staff contacts, and unarmed pose sequences were regenerated from the final
120 Hz GLBs. Earlier detailed phase sheets remain part of the historical
visual record. Final browser checks, video decoding, sustained desktop performance, and
exported consumer checks pass. Archive and installation acceptance is recorded
after packaging in `docs/verification/package-acceptance.json` in the workspace.
That receipt is excluded from both archives. Physical Android performance
remains unverified.
