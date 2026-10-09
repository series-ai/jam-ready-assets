# Runtime review

## Historical source checks

The read-only review found no P0 or P1 blocker in the current contour, deformation, disposal, or directional fall code. No runtime files changed during this review.

`updatePaleInkContour` shares the primary mesh geometry and skeleton. The child outline has an identity transform, so it uses the same world transform. `disposeInstance` disposes owned geometry once and collects primary skeletons in a set. It does not dispose source geometry. The leaf-bone axis in `deformAvatar` uses the bind transform. It therefore follows the leaf bone instead of world up. Each deformation starts from saved positions.

A CPU check loaded the current stick-standard prototype with the actual GLTF loader. Repeated deformation produced identical positions. Switching to black hid the outline. Switching back to pale reused the same outline. Disposal events showed one owned-geometry disposal, one bone-texture disposal, one outline-material disposal, and zero source-geometry disposals.

A second CPU check sampled the actual prototype lethal clips for four initial facing angles and 24 impact angles. All 96 cases put the head-to-hip direction along the impact. The minimum dot product was 0.5671. The review also checked the reaction selection and final displacement in `selectReaction` and `sampleKnockdown`.

The existing prototype contact report contains 21 cases: seven clips at three thickness values. Floor gaps range from 0.00316 to 0.00669 metres. This evidence covers stick-standard. It does not prove all body variants. This was a prototype check. The final frozen receipt below records the completed final checks.

No browser or GPU work ran for this review. The review does not replace visual checks of the final built assets.

## Historical bow support review

The read-only bow review found no blocker in geometry ownership, timing, or coordinates. The first support update clones the string geometry and marks it as owned. The saved rest positions stay separate from the mutable buffer. Each later update starts from those rest positions. The endpoints have zero weight. The middle follows the right palm in the string mesh local frame. The string returns to rest at the authored release contact time. Static outlines exclude the string, so an old straight outline does not remain after deformation.

The renderer passes the active action time to the support update. Full-clip bounds use the same time and update path. Bounds sampling clones the string geometry and disposes only that new geometry. It retains the live source buffer. Weak maps do not retain a removed equipment instance.

I reran the actual CPU bow check against the current stick-standard prototype. All ten checks passed. They cover draw contact, release timing, fixed endpoints, source preservation, and bounds sampling without live disposal. The largest sampled drawn palm error was about 0.0000000154 metres. This remains a single-body prototype check. This prototype check alone does not prove the full body family.

## Historical renderer integration review

The source review found four concrete quality faults. The root agent fixed all four. The repeatable CPU checks in `camera-integration-cpu.mjs` now pass:

- Orthographic refit now moves the camera in front of larger content. The 4-metre box fixture previously clipped its front face at depth -1.01612. The fixed depth is -0.99889.
- Overview refit now uses a stable envelope for the duel and acrobat route. After desktop-to-phone resize, the acrobat root projects to x=317.4 instead of x=534.7 in a 390-pixel viewport.
- Third-person resize now keeps one direction. The old 600-to-599-pixel transition moved 0.884 metres in one frame and changed yaw by 7.22 degrees. The fixed CPU transition moves zero metres.
- Paused reset now evaluates standing actions. The death-pose head height was unchanged at 0.1644 metres after reset. It now becomes 1.3034 metres, with the block clip active and health restored.

The review found no remaining source blocker. Contact resolution follows mixer evaluation. Held transforms are current before contact tests. Weapon support runs before rendering, with active clip time. Falls retain their final displacement and select the correct forward or backward recovery. Scene and equipment generation checks reject stale asynchronous results. The cutaway applies to game district surfaces and resets on explicit camera or scene changes.

Browser checks for these fixes remain separate from the CPU evidence. Final camera traces must use the final assets.

The later head-scale change also passed source review. Head vertices scale about the Head bind origin. This is the same pivot used by headwear after skinning. Body-height scale applies outside both transforms. Pristine cached positions preserve repeated-call behavior. Final visual checks must cover the neck and headwear at the head-scale limits.

## Preview and headwear checks

The immutable audit at `http://127.0.0.1:5297/audit.html` passed all 26 integration checks. These checks cover large-to-small asset changes, side and top views, user zoom, one-pixel resize, all overview cameras at desktop and phone sizes, repeated resize, the 600-pixel width boundary, and paused reset after a knockout. The report records the snapshot hashes. This snapshot has the earlier weapon mounts. It is valid for these camera checks, but it is not final weapon evidence.

The older preview suite initially reported two phone crops. The baseline capture proved that both crops came from the prior desktop orbit. Cargo had six outside corners before resize and four after resize. Its horizontal bound stayed at 1.267517 normalized units. The district had five outside corners before resize and four after resize. Its bound stayed at 1.426366. Both default fits had zero outside corners. Resize preserved the selected framing. No runtime correction was needed. The tests now retain both raw outside counts, reject added normalized clipping, and test default full-content fits separately.

The one-pixel resize check now measures the body span in CSS pixels. A fixed-width view that grows one pixel in height retains its horizontal scale and body pixel size. Its body span as a fraction of viewport height must change. The previous assertion incorrectly required that fraction to stay fixed.

The source review found no blocker in headwear size or its bind-frame placement. Twelve actual captures cover black and pale bodies, standard and heavy head sizes, and head-scale values 0.8 and 1.2. Standard bodies also have captures without headwear. The cap follows the head size. The neck remains connected. A thin seam is visible at the heavy cap edge in some captures; it does not expose a head or neck gap.

The travel helper skips the leading interval before the first authored key on loop wrap. Its correction uses the active action rate. The acrobat path rate uses the authored travel speed. The animation display now uses the active action time, which avoids the old displayed-clock drift. Animation selection chooses matching equipment through the shared presentation mapping. The review found no remaining source blocker in these changes.

The updated preview suite then passed all 45 checks: the prior 39 checks and six default-fit phone checks. All 12 headwear captures completed. The browser reported no errors. The browser closed after the run. The final motion, continuous route, and performance reports now use the final delivered files.

The frozen final audit passed the 45 preview checks again after the cap-brim correction. Its 12 new headwear captures replace the earlier images. The heavy cap no longer has the bright edge seam at either scale limit. The final 68 camera checks and 16 continuous routes also pass. See `camera-diagnosis.md` for measured results and the associated JSON reports.

The later full-route and fall review found three visibility faults. The primary mask missed one rail and stopped its depth range too early at one beam. The foreground ramp also hid a fallen target. The bounded shader repair is documented in `camera-diagnosis.md`. It passes the 184-check full route and the 12-check front/rear reaction proof. Raw obstruction data and the pixel thresholds are unchanged. No camera solver or camera motion change was needed.

A later continuous route found one valid foot outside the desktop perspective frame during a wall stop. The fixed-envelope camera minimum now includes a one-metre horizontal tracking allowance. It uses no animated joints and does not change the chosen heading or damping. Two new tests bring the full suite to 70 passing tests. Three repeats of the exact failed route cover 3,063 frames with no outside joints or browser errors. The pre-margin failure remains in a separate report. The final frozen repeats now pass with this change.

## Final frozen receipt

All 68 camera checks and all 16 routes pass on the final build. The routes cover 16,337 frames with no outside joints and no browser errors. All timed checks completed, including the full 900-second baseline. The summary verified all measured source and model hashes. `camera-final-receipt.json` also verifies all 306 served GLBs, the manifest, and the source hashes in all seven final reports. The current preview report passes 45 checks and includes 12 headwear captures. No source or media changed during final measurement. Physical Android performance remains unverified.
