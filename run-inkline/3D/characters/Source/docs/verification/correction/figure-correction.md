# Figure and motion correction — 1.3.0

This is the prior 1.3.0 construction report. [The 1.3.1 follow-up](line-refinement.md) removes the joint spheres and reduces spine curvature. Current source and asset hashes are in `line-quality.json`.

The generator now makes one spine, one common arm node, and one common leg
node. It keeps the round head and narrow limbs. It removes the shoulder and
hip bars, collars, belts, straps, and other body accents. Each of the 12 bodies
has 18 bones and 2,192 triangles. Head spheres use 32 segments and 16 rings.
Small joint spheres keep the elbow, wrist, and knee outlines round.

The source SHA-256 is
`67ebe7ef405c95791c1d5bcb6d81b694b093464302b4dbeebc88935cb0e0c3bd`.
The checked output is `.cache/correction-character-family`.

## Motion changes

All 85 clips use the centered rig, consistent quaternion signs, explicit curve
modes, and the corrected hip position input. The source defines action phases,
foot plants, and travel speed. The exported JSON keeps these values.

The following clips have new full pose sequences:

- `idle`, `block`, `punch-left`, `punch-right`, `punch-heavy`, `uppercut`,
  `kick-front`, `kick-roundhouse`, `sweep`.
- `sword-slash`, `sword-overhead`, `sword-thrust`, `bow-draw`, `bow-release`.
- `hit-front`, `hit-back`, `knockdown`, `death`, `get-up`.
- `stun`, `pickup`, `bat-swing`, `throw`.
- New clip: `get-up-forward`.

Ten travel loops have baked foot paths and speed data: `walk`, `run`, `sprint`,
`walk-backward`, `run-backward`, `walk-left`, `walk-right`, `strafe-left`,
`strafe-right`, and `crouch-walk`. The foot moves against the intended travel
velocity during each support interval. The free foot follows a raised return
path. The body keeps the intended forward or side lean.

The remaining contact attacks have a short drive, a two-frame hold, and a
slower return: `elbow-strike`, `backfist`, `knee-strike`, `shoulder-check`,
`staff-thrust`, `staff-sweep`, `staff-overhead`, `staff-parry`, `sword-diagonal`,
`dagger-stab`, `sword-lunge`, `hammer-overhead`, `shield-bash`, `shield-block`,
`shield-slam`, and `shield-push`.

Melee mounts use the same neutral grip for each body. The role-specific guard
pose no longer changes the sword angle. The source exports grip targets for
thrust, lunge, overhead cut, diagonal cut, and shield slam. The bake solves the
wrist at contact and hold against each body's actual mount reference. Thrusts
point forward. The overhead cut stays in the forward plane. The diagonal cut
points down and across. The shield remains upright. Preparation and body
motion remain in the authored curves.

Ranged stances, staff spin, wave, point, and interact have a split base and
stationary support feet. Heavy punch, sword overhead, and hammer overhead
use both support feet. Light strikes retain a free pivot leg. Idle and guard
use opposite foot depth and side offsets so the legs remain separate in the
three-quarter view.

The other clips keep their existing key poses. All 85 were included in the
front/side review and normal-speed playback. Climb, vault, and ledge-climb
remain asset motions. This source does not solve contact against a runtime
obstacle.

## Timing and recovery contract

All original 84 IDs, durations, and existing contact times remain unchanged.
Sweep adds contact frame 13 at 30 FPS. `get-up-forward` adds a 1.333-second
forward recovery. It starts at the exact baked endpoint of `death`.
`get-up` starts at the exact baked endpoint of `knockdown`.

The source uses Blender Z-up and forward −Y. The GLB uses Three.js Y-up and
forward +Z. `knockdown` falls backward. `death` falls forward.

Events stay at 30 FPS. Export samples stay at 120 Hz. Verification samples
support targets and floor bounds at 240 Hz. A 4 mm interpolation allowance
keeps the mesh clear between export samples. Free-foot contact checks include
the toe endpoint as well as the ankle.

Travel tracks start at 1/30 second. Their active cycle is `cycleFrames/30`,
where `cycleFrames` is the last authored frame minus one. Runtime travel loops
must skip the static interval before the first sample to keep the declared
foot speed. The raw GLB duration remains unchanged.

## Verification

Run:

```sh
node --import tsx scripts/verify-motion-quality.ts .cache/correction-character-family docs/verification/correction/figure-family-motion-quality.json --grounded
node --import tsx scripts/verify-motion-quality-grips.ts .cache/correction-character-family docs/verification/correction/figure-grip-quality.json
```

The final report passes:

- 1,020 body/clip pairs.
- 24 fall/recovery boundaries.
- 672 grounded body/clip pairs at 240 Hz.
- 288 mounted contact and hold checks across all 12 bodies.
- Common arm and leg origins through every clip.
- Position and rotation closure for every loop.
- Declared support velocity and stationary foot targets.
- Near-straight punch contact extension.
- Correct forward/backward fall directions and low final body positions.

The floor range is 5.412–10.571 mm. The largest support residual is 5.231 mm.
The report includes the source, catalog, and all GLB hashes. TypeScript and
Python syntax checks also pass.

## Final visual evidence

`figure-family-idle-guard.png` shows all 12 bodies at the same scale.
`figure-final-all-1.png` through `figure-final-all-6.png` show all 85 clips
from side and front views. Their action samples use the canonical contact or
grasp phase when it exists.

`figure-grip-family-1.png` and `figure-grip-family-2.png` show mounted sword
and shield contacts on all 12 bodies. Each cell has side and three-quarter
views. The capture camera includes the full weapon.

The final normal-speed recordings are kept once, in `joints/` (the shipped 1.4.5 geometry). The earlier per-pass reel copies are not committed; regenerate them with `scripts/record-polish-media.py`:

- `figure-final-movement-normal-speed.webm`: 24 clips, 44.88 seconds.
- `figure-final-combat-normal-speed.webm`: 42 clips, 54.28 seconds.
- `figure-final-other-normal-speed.webm`: 19 clips, 35.76 seconds.

The player uses the actual GLB clips and mounted props. Each loop plays twice.
Each non-loop clip plays once and reaches its final sample. No browser errors
occurred. `figure-final-media.json` records all 85 IDs and the source, runtime,
catalog, image, and recording hashes. The browser is closed.

The parent task owns runtime camera, outline, avatar scaling, equipment mounts,
movement phase, and final promotion to `public/assets`. This task did not edit
those files or promote generated assets.
