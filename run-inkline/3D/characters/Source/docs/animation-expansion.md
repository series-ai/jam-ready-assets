# INKLINE animation expansion

Historical record: Release 1.1. Current release checks are in the quality correction reports.

This pass adds 24 clips. The pack now has 84 clips on each of the 12 character GLBs.

The original 60 clip IDs stay unchanged. The new clips use the same 18 bones. They stay in place. The generator applies the ground contact bake to every character and every clip.

## New clip IDs

Movement clips:

- `walk-left`
- `walk-right`
- `run-backward`
- `crouch-idle`
- `crouch-walk`
- `turn-left`
- `turn-right`
- `ledge-climb`

Unarmed clips:

- `elbow-strike`
- `backfist`
- `knee-strike`
- `shoulder-check`

Staff clips:

- `staff-thrust`
- `staff-sweep`
- `staff-overhead`
- `staff-parry`

Sword, dagger, and hammer clips:

- `sword-diagonal`
- `dagger-stab`
- `sword-lunge`
- `hammer-overhead`

Shield clips:

- `shield-bash`
- `shield-block`
- `shield-slam`
- `shield-push`

Each melee clip has a preparation pose, a contact frame, a short hold, and a recovery pose. The contact frame is after frame 1. GLB frame 1 starts at `1 / 30` seconds. The catalog writes `contactTime` as `contact_frame / 30` seconds.

## New timing metadata

| ID | Duration | Contact time | Loop |
| --- | ---: | ---: | :---: |
| `walk-left` | 0.800 | — | yes |
| `walk-right` | 0.800 | — | yes |
| `run-backward` | 0.800 | — | yes |
| `crouch-idle` | 0.800 | — | yes |
| `crouch-walk` | 0.800 | — | yes |
| `turn-left` | 0.600 | — | no |
| `turn-right` | 0.600 | — | no |
| `ledge-climb` | 0.733 | — | no |
| `elbow-strike` | 0.667 | 0.300 | no |
| `backfist` | 0.667 | 0.300 | no |
| `knee-strike` | 0.733 | 0.333 | no |
| `shoulder-check` | 0.800 | 0.333 | no |
| `staff-thrust` | 0.733 | 0.333 | no |
| `staff-sweep` | 0.800 | 0.367 | no |
| `staff-overhead` | 0.833 | 0.433 | no |
| `staff-parry` | 0.667 | 0.233 | no |
| `sword-diagonal` | 0.767 | 0.367 | no |
| `dagger-stab` | 0.733 | 0.333 | no |
| `sword-lunge` | 0.733 | 0.333 | no |
| `hammer-overhead` | 0.867 | 0.467 | no |
| `shield-bash` | 0.733 | 0.333 | no |
| `shield-block` | 0.667 | 0.267 | no |
| `shield-slam` | 0.833 | 0.400 | no |
| `shield-push` | 0.800 | 0.367 | no |

## Generation and checks

Run the generator from this directory:

```bash
/Applications/Blender.app/Contents/MacOS/Blender --background --factory-startup --python scripts/blender/characters.py -- --out public/assets
```

The generator completed with 84 authored clips. It exported 12 GLBs. Each GLB has 84 animation entries and 18 joints. The exported position accessors have finite bounds.

The generated metadata has 84 unique IDs. The new 16 melee IDs have finite contact times before the clip end. The ground contact report has 84 entries for each character. The minimum sampled floor value for the new clips is 0.003935 m. No new clip has a floor penetration report.

The editable source is `public/assets/source/characters.blend`. It contains 84 source actions and 1,008 corrected character actions. Each character has 84 muted NLA tracks.
