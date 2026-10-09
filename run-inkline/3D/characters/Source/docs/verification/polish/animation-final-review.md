# INKLINE 1.4.0 final animation review

No remaining P0/P1 visual blocker was found in the reviewed final evidence. All 85 final clips have timed-film coverage. The 27 changed clips retain the corrected action poses and timing. Crouch-idle now matches crouch-walk. The continuous limbs and near-straight spine remain intact.

## Scope

Inspected all 15 `final-*-triage-*.png` sheets: 24 movement, 42 combat, and 19 other clips. They use the published final `motion-movement.mp4`, `motion-combat.mp4`, and `motion-other.mp4` files. Each row has five chronological side samples plus front and three-quarter samples. `animation-final-coverage.json` lists all 85 clips, their film intervals, changed status, and evidence sheet. `final-frame-index.json` retains extraction timing.

This was a timed-frame review of normal-speed recordings. It was not continuous playback. Samples were extracted at 10 Hz. Approximate clip boundaries and rounded sample times can miss a brief contact hold. The columns named contact use approximate requested times; they are not exact event measurements. The prior exact-phase GLB captures and the current final pose checks supply that evidence.

The final films show the standard body. The 12-body statements below come from saved measured checks and verified asset hashes. They do not claim that every frame of every body was visually viewed. CPU extraction finished before the root performance measurement. No GPU or browser was used for this final pass.

## Final result

- Light punches, dagger-stab, sword-thrust, staff-thrust, and the shortened cuts reach contact earlier. Their full extension and guard return remain visible.
- Uppercut keeps its raised fist. Roundhouse keeps the corrected extended contact. The current exact pose checks confirm the short event shapes that a 10 Hz sheet can miss.
- Both dodges move the head out of the strike line. The elbow leads the fist toward the target. The bat crosses the body. The shield slam reaches a downward-facing strike instead of a guard return.
- Hammer-overhead keeps a high load and a separate lower contact. Ball-throw has a raised load and release. The rifle reload hand is no longer held on the foregrip by the runtime solver.
- Crouch-idle and crouch-walk now stay at the same low level. The side and three-quarter silhouettes read as crouched throughout the sampled cycle.
- The final roll, jump, slide, falls, and recoveries retain their distinct silhouettes. No new joint bead or large local spine curve was seen.
- The 58 unchanged clips retain their earlier shapes. Their earlier secondary style notes remain optional refinements. This pass did not turn them into new requirements.

## Final measured checks

Read the current saved reports and checked the referenced public GLB hashes. All 12 body hashes match `motion-style.json`. All source and asset hashes in `figure-final-media.json` match the current files.

| Evidence | Result |
|---|---|
| `motion-style.json` | 96 checks pass across 12 bodies. |
| `grip-quality.json` | 288 grip checks pass. |
| `timing-contract.json` | 1,277 checks pass; 23 timing changes are recorded. |
| `line-quality.json` | 12 bodies pass. Each has six mesh components and 1,712 triangles. Maximum combined spine bend is 10.449 degrees; RMS is 4.724 degrees. |
| motion-quality (regenerable with `scripts/verify-motion-quality.ts`; trace not committed) | Saved final report passes with no listed failure. Root reports 1,020 clips, 24 fall boundaries, and 696 grounded clips checked. |
| `avatar-contact.json` | Root reports 504 final floor cases passed. |

Standard-body crouch Head joint Y is 1.126406 m at idle and 1.125723 m during the checked walk phase. The difference is 0.000683 m. This closes the earlier 0.23 m crouch transition mismatch.

The acrobat body also passes all eight semantic pose checks. Its roundhouse contact knee flex is 3.623 degrees. Its elbow leads the fist by 0.199 m at contact. Both dodges move the head about 0.328 m. Its crouch idle/walk Head joint heights are 1.096382/1.086007 m. The jump extension check passes. These values close the prior concern that role variation could undo the standard-body correction.

## Phone and runtime evidence

Inspected `phone-jump.png` and `phone-scene.png` at their saved 390-pixel width. The jumping figure remains distinct from the scene structure. The combat still shows readable attacker and target poses at a smaller figure scale. Continuous arm and leg lines remain visible. No new clipping or contour gap is visible in these two images.

The root reports 37 live jump samples with no descent fault, 13 browser tests, and 21 review-page checks passed. This independent pass did not rerun those tests. The parser retains authored phase data, and the renderer uses takeoff for the initial airborne animation. The prior runtime integration condition is closed by that source check and the root live-jump evidence.

## Limits

Vault and ledge-climb remain reusable motions. Their exact hand attachment and obstacle clearance depend on consumer placement. This review adds no new obstacle-fixture requirement to the present task.

The films and stills do not prove every possible view, equipment combination, or transition. Pistol reload, backfist, staff sweep, carry, and some small gestures retain the secondary style limits noted in the initial review. They are not new blocking faults. The effect review is separate in `effect-independent-review.md`.

## Coverage and receipt

The media receipt identifies version 1.4.0 and records all 85 clip IDs. Its checked time is `2026-09-28T02:29:23.990751+00:00`.

| Group | Clips | Inspected sheets |
|---|---:|---|
| Movement | 24 | `final-movement-triage-1.png` through `-4.png` |
| Combat | 42 | `final-combat-triage-1.png` through `-7.png` |
| Other | 19 | `final-other-triage-1.png` through `-4.png` |

- `public/assets/characters/stick-standard.glb` SHA-256: `8e24371d14a39641c1b19edc6134eefb2bf97b91931eeab8bed76114a5933a15`.
- `public/assets/characters/stick-acrobat.glb` SHA-256: `da4929ca6f604213f9123bcafe4034c4d71b22ece3d462581884102bce1fadae`.
- `public/assets/characters.json` SHA-256: `275904bb90a927b624d1403c7511afa644ee7d04b280e9da3710e70ee636dbcc`.
- `scripts/blender/characters.py` SHA-256: `17680ea75be2c5ed2c097f1b10d8137f338d71ad9d5a8b8e14de89acdd096aa1`.

This final assessment supersedes the pending family, crouch, and final-film items in the earlier prototype review. The earlier reports remain as the correction history.
