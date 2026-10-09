# Independent foot-contact review

No remaining blocker was found in the final offline foot contacts or grounded landing hold. All 12 final body hashes match the passing CPU reports.

## Source review

`apply_stationary_foot_contacts` runs after the motion polish step. It writes full-clip, zero-velocity plants for both feet in standing actions. Ball-kick retains one planted support foot. The contact bake reads these declarations after the signed floor correction. It keeps the original horizontal anchor and sets the ankle target to the body-specific floor height. The existing solve limit stops an export if foot error exceeds 3 mm.

The independent check has a fixed list of expected support feet. It checks each expected declaration, horizontal drift, and ankle height against that body's idle. It therefore detects a missing second plant and a foot that starts above the floor. Mesh-floor contact remains the task of the separate grounded-mesh checks. The initial local TypeScript metadata error was fixed during review. TypeScript now passes.

The renderer holds horizontal movement only when the body is grounded and jump-land recovery is active. Air steering remains enabled. A queued jump releases the hold. The four focused tests use the real game update and pass for walking input, dash input, landing from air, and a new jump during recovery. No landing-hold correctness fault was found.

## Pose finding and correction

The first foot prototype made punch-left too low. Its rear ankle retained Z=-0.515 m after its starting height changed from 0.228 m to the floor target near 0.091 m. The reach limit lowered the hips by up to 0.206 m. The head dropped 0.142 m from load to contact in about 67 ms.

The revised ready stance moves that rear anchor to Z=-0.253 m. The current prototype has these head heights:

- Ready: 1.4421 m.
- Load: 1.4181 m.
- Contact: 1.4088 m.

The load-to-contact drop is now 9.3 mm. Whole-clip head travel is 42.6 mm at 120 Hz. Contact hips are at 0.8490 m. This closes the deep-dip finding. Both feet still pass contact checks.

## Evidence

- Current standard prototype: 103 foot checks pass. Maximum horizontal drift is 0.0667 mm.
- Four focused landing tests pass.
- TypeScript check passes.
- Viewed `punch-left.png`, the first prototype's actual saved render. It shows clean limb lines and floor contact. It predates the compact-stance correction.
- Inspected `independent-pose-projections.png` for ball-kick, shoulder-check, hit-left, sword-diagonal, backfist, and staff-sweep. These are CPU bone projections of actual GLB poses. They are not rendered meshes. No further pose fault is visible in those projections.
- Compared all 85 old/new standard clips at 60 Hz before the compact correction. Apart from punch-left, changed clips moved the hips by no more than 58 mm. Sixty-one clips were unchanged within 0.1 mm across the measured bones. `independent-body-comparison.json` records that earlier prototype hash.
- `independent-compact-punch.json` records current exact phase positions and the 120 Hz head range.

No browser, GPU, source edit, or asset regeneration was used for this review. The final 12-clip rendered contact sheet was also inspected. The compact left punch is clear. The shown support feet touch the floor, and the ball-kick keeps its free leg raised. No new visible foot or limb fault was found in those stills.

## Final verification

All 1,236 foot-contact checks and all 12 jab head-travel checks pass. Maximum foot drift is 0.110 mm. The four focused landing tests and TypeScript check pass. The saved full unit report has 77 passing tests. Source, catalog, evidence, and all 12 final GLB hashes are in `independent-review.json`.

## Limits

The contact pass applies to exported standing clips on a flat local floor. Run-to-stop blends and sliding across clip transitions are outside this review. The change does not add terrain-aware foot placement on ramps. The landing fix holds the body during grounded recovery; it is not a general foot solver. These limits remain open and are not covered by the scoped pass.

The final visual evidence is a saved 12-clip sheet. All-body conclusions use the verified CPU checks. No continuous final-film playback was reviewed.
