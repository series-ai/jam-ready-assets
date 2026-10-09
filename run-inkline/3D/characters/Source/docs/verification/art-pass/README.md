# Art and motion pass

This is a historical report for release 1.1. Some data files in this directory are replaced by current checks. Read [the current verification report](../README.md) and [the 1.3 correction assessment](../../style-correction.md) for the delivered release.

25 September 2026. The work follows the Flash reference study in [flash-reference-study.md](../../flash-reference-study.md).

## Changes

- Light walkable faces replace dark decks. A single slab contour replaces doubled floor borders. The static level now contains 18,324 triangles across its instances.
- Shared anatomy landmarks drive each mesh and rig. Six body families support twelve roles. The Swift bodies have longer leg ratios. Idle and guard poses vary by role.
- Limb rings carry a continuous basis through each bend. Cap rings reuse that basis. This removes twisted tube sections and pinched ankles. A generator assertion checks frame continuity.
- Held weapons use dark silhouettes. The worker has a new wrench. Role kit controls set an editable body, headwear, and equipment setup.
- Authored contact time drives damage, marks, recoil, and short hit holds. The overview has closer framing and a varied four-strike sequence.
- The avatar camera includes equipment bounds. The staff uses a low grip and a slight outward tilt.
- Effect preview framing includes size, travel, gravity, and orbit. All 512 sprite frames pass an edge-margin check.
- Impact stars, paper cores, tapered arcs, dust, and sparks use seven instanced pools. Checkpoint marks remain near the feet.

## Evidence

- `before-parkour.png`, `before-combat.png`, and `before-avatar.png` preserve the prior app views.
- `pose-board.png` shows preparation, contact, and recovery for six actions.
- `art-pass.json` records 184 app checks and 56 checkpoint views.
- `../district-report.json` records the final static district counts and file hash.
- `../motion-bounds.json` records all 1,008 character and clip combinations sampled at 60 Hz.
- `../../../public/review/body-family.png` shows actual base meshes at one camera scale.
- `../../../public/review/character-family.png` shows actual role kits and action poses.
- `../../../public/review/index.html` contains the review video and chapter controls.

The generated Study 04 sheet sets direction. It is not a render of the delivered meshes.

## Review result and limits

An independent image review accepted the body families and role equipment. The expansion pass added camera clearance against actual scene triangles. The earlier full-width combat column obstruction is corrected in the checked views. The refreshed tour shows third-person combat. Camera checks cover the head, hips, and both feet at all seven checkpoints in four camera modes and two viewport sizes.

The expansion evidence is in `../expansion/`. It includes the extra motion poses, scene support checks, equipment contact checks, and independent review.

The app uses explicit collision proxies. Decorative rails and pipes do not all block movement. The supplied demos are asset demonstrations, not complete game systems.

The timed browser result is a desktop measurement. No physical Android result is claimed. Read [performance.md](../../performance.md).
