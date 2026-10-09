# INKLINE animation changes

This pass updates `scripts/blender/characters.py` for version 1.4.0. It keeps the 18-bone rig, continuous limb tubes, near-straight spine, 85 clip IDs, loop flags, and 12 role outputs.

The pass uses one timeline remap helper. The helper updates authored keys, contact frames, support plants, and named phases together. It does not apply a global speed or amplitude multiplier.

The 27 authored targets are:

- `parry`, `dodge-left`, and `dodge-right`: short whole-body lean and clear side displacement.
- `elbow-strike` and `backfist`: folded striking arms with a visible body lead.
- `shield-slam`, `hammer-overhead`, and `shield-push`: explicit load, descent, contact, hold, and recovery poses.
- `ball-throw`: high overarm load and a separate release and follow-through.
- `bat-swing`: both hands and the bat cross the body at contact.
- `vault` and `ledge-climb`: support, tuck, pull, knee, and stand phases.
- `crouch-idle`, `crouch-walk`, and `roll`: lower or tighter middle silhouettes with unchanged gait or total duration.
- `jump-start`: fast launch with `load`, `takeoff`, and `clear` phases.
- `rifle-reload`: authored magazine reach and return phases. Runtime foregrip support is owned by the root task.
- `punch-left`, `punch-right`, `dagger-stab`, `sword-thrust`, `staff-thrust`, `sword-slash`, `staff-sweep`, `sword-diagonal`, `kick-roundhouse`, and `uppercut`: earlier contacts and complete action phases.

Timing changes use integer authored frames at 30 fps.

| Clip | Baseline | Updated | Change |
|---|---:|---:|---|
| `jump-start` | 12 frames | 8 frames | faster launch |
| `vault` | 24 frames | 22 frames | shorter traversal |
| `punch-left` | 16 / contact 8 | 12 / contact 5 | 0.167 s contact, 0.400 s total |
| `punch-right` | 18 / contact 9 | 14 / contact 6 | 0.200 s contact, 0.467 s total |
| `uppercut` | 20 / contact 11 | 15 / contact 7 | 0.233 s contact, 0.500 s total |
| `kick-roundhouse` | 24 / contact 12 | 21 / contact 8 | 0.267 s contact, 0.700 s total |
| `parry` | 18 frames | 12 / contact 5 | 0.167 s contact, 0.400 s total |
| `dodge-left`, `dodge-right` | 18 frames | 12 frames | 0.400 s total |
| `sword-slash` | 22 / contact 12 | 18 / contact 7 | 0.233 s contact, 0.600 s total |
| `sword-thrust` | 20 / contact 11 | 15 / contact 6 | 0.200 s contact, 0.500 s total |
| `ball-throw` | 24 frames | 21 frames | 0.700 s total |
| `bat-swing` | 24 frames | 21 frames | 0.700 s total |
| `ledge-climb` | 22 frames | 24 frames | explicit pull and knee interval |
| `elbow-strike` | 20 / contact 9 | 14 / contact 6 | 0.200 s contact, 0.467 s total |
| `backfist` | 20 / contact 9 | 15 / contact 6 | 0.200 s contact, 0.500 s total |
| `staff-thrust` | 22 / contact 10 | 18 / contact 7 | 0.233 s contact, 0.600 s total |
| `staff-sweep` | 24 / contact 11 | 20 / contact 8 | 0.267 s contact, 0.667 s total |
| `sword-diagonal` | 23 / contact 11 | 20 / contact 8 | 0.267 s contact, 0.667 s total |
| `dagger-stab` | 22 / contact 10 | 12 / contact 5 | 0.167 s contact, 0.400 s total |
| `hammer-overhead` | 26 / contact 14 | 24 / contact 12 | 0.400 s contact, 0.800 s total |
| `shield-slam` | 25 / contact 12 | 21 / contact 11 | 0.367 s contact, 0.700 s total |
| `shield-push` | 24 / contact 11 | 21 / contact 8 | 0.267 s contact, 0.700 s total |

The following 58 clips retain their source pose and timing decisions. They remain in the 85 clip catalog: `idle`, `walk`, `run`, `sprint`, `strafe-left`, `strafe-right`, `walk-backward`, `jump-loop`, `jump-land`, `double-jump`, `slide`, `climb`, `wall-run`, `punch-heavy`, `kick-front`, `kick-air`, `sweep`, `block`, `sword-overhead`, `staff-spin`, `pistol-idle`, `pistol-fire`, `pistol-reload`, `rifle-idle`, `rifle-fire`, `shotgun-fire`, `bow-draw`, `bow-release`, `throw`, `hit-front`, `hit-back`, `hit-left`, `hit-right`, `knockdown`, `get-up`, `death`, `stun`, `wave`, `cheer`, `point`, `interact`, `pickup`, `carry`, `ball-kick`, `celebrate`, `walk-left`, `walk-right`, `run-backward`, `turn-left`, `turn-right`, `knee-strike`, `shoulder-check`, `staff-overhead`, `staff-parry`, `sword-lunge`, `shield-bash`, `shield-block`, and `get-up-forward`.

Corrections after prototype review:

- The roundhouse has the same extended leg at contact and hold.
- The elbow leads the fist toward the target.
- The bat uses a calibrated lateral grip axis through contact and follow-through.
- The shield descends from a high load to a low, downward face. Both feet remain planted.
- Dodges move the head 0.32 m in the avoidance direction on the standard body.
- Crouch idle and travel share a low knee bend.
- Jump phases now use load frame 5, takeoff frame 6, and clear frame 8. The live game starts at takeoff.

The corrected standard prototype passes all 85 clip checks, two fall boundaries, and 24 grip checks. Full family reports record the final export checks. The earlier Blender startup fault is resolved by normal macOS graphics access.
