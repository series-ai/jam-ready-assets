# Camera diagnosis and correction

Checked 27 September 2026. Final functional audit: http://127.0.0.1:5297/audit.html. The earlier diagnosis used port 5197.

## Before correction

The diagnostic browser used a 1440 by 900 viewport and reduced motion. Thus impact shake did not cause these changes. It held forward for 1.4 seconds, then right for 1.4 seconds. The later input named `backward` was not a valid action and did not move the actor. The reported failures occurred during the valid right input.

| View | Maximum camera step | Frame interval | Steps above 1 unit |
| --- | ---: | ---: | ---: |
| Third person | 6.98 | 33 ms | 9 |
| Side | 11.33 | 17 ms | 19 |
| Top | 16.82 | 17 ms | 9 |
| Perspective | 7.86 | 17 ms | 4 |

See `camera-initial.json` for every measured frame. One third-person step moved the body 0.064 units. The camera moved 6.94 units. The projected hip moved outside the screen to x 1632, y 1010. The top view moved from camera height 0 to height 16 in one frame. Some frames still had blocked body points.

See `camera-stationary.json` for a second test. The actor stopped at approximately x 2.87, z 2.29. Its block animation still changed the selected camera angle. The third-person camera crossed the figure. One projected hip reached x -52050, y -25317, depth 20.8.

Preview animation playback and overview playback had no camera drift in the measured interval. A separate preview test dragged the orbit, then changed viewport height by one pixel. The resize reset the camera to its default angle. This caused a 6.64-unit step.

## Causes

1. `CameraClearance.resolve` searched discrete yaw and pitch values. It applied a selected value immediately. Current hand, foot, and equipment points changed the search on each animation frame.
2. The prior minimum distance was only a search acceptance test. If all candidates failed, the solver returned a failed candidate. The fraction floor of 0.03 could put the camera inside the figure.
3. Third-person, side, and top views smoothed `followCameraPosition`, then replaced the rendered position with the unsmoothed clearance result. The collision result did not return to the smoothed state.
4. Perspective view used the last collision result as the next OrbitControls input. A collision could change the preferred orbit permanently.
5. ResizeObserver called `frameCamera` for review views. That method restored the default direction after a user orbit.

## Solver contract

`CameraClearance.resolve` now preserves the requested view direction. It only changes boom distance. Its body samples are fixed and independent of the active animation. A minimum distance is enforced. Remaining foreground obstruction is reported for the renderer cutaway.

`CameraMotion` owns the rendered target and boom distance. It limits target speed to 12 units per second and boom speed to 10 units per second. A fixed preferred direction therefore limits position speed to 22 units per second. Both values use exponential damping. Boom extension waits for 0.2 seconds of sustained additional clearance. A 0.03-unit distance band stops small clearance changes from extending the boom.

`reset(position, target)` is for an explicit camera choice, scene change, or game reset. `update(input, clearance)` accepts preferred position, preferred target, body focus, body height, projection type, frame delta, and an optional viewport-specific minimum distance. The renderer must retain the preferred orbit separately from this output. Collision does not modify requested yaw or pitch. User orbit input can change the preferred direction.

## Verification

The camera unit suite has 16 passing tests. The full unit suite has 70 passing tests. It uses actual triangle obstructions. It covers fixed view direction, minimum distance, target and boom speed, delayed extension, stationary side and top views, reset, paused updates, and convergence at 30, 60, and 120 frames per second. It retains broad-phase equivalence and full-box framing checks.

## Historical integrated browser checks

The first integrated pass measured 16 routes: four camera modes at 1440 by 900 and 390 by 844, with normal and reduced motion. It captured 8,176 frames. No joint left the viewport. Maximum camera step was 0.234 units. Maximum speed was 14.04 units per second. Camera heading stayed within 0.000002 degrees. No collected page or console error occurred. The files are `camera-after-*.json`. The `blocked` fields in these first-pass files are raw triangle obstruction. They do not include the shader opening.

A screenshot exposed a narrow rail that crossed both shins. The three fixed height samples missed it. The solver now uses five fixed heights and three fixed horizontal samples. A new test proves that the old feet, chest, and head rays miss the test rail, while the new quarter-height sample detects it.

The renderer now keeps the complete requested boom in orthographic views. A shorter orthographic boom had moved the camera behind an entire foreground panel. The fixed boom preserves that panel and uses only the local opening. Compare `camera-side-rail-before.png` and `camera-side-rail-after.png`. The final camera distance is approximately 12 units. The figure's feet and shins are visible.

`camera-low-ceiling-final.webm` records a normal-speed route and four view selections. The video is 34.04 seconds at 25 frames per second. The complete video decodes without error. The four `camera-low-ceiling-*.png` files show the figure below structure. The raw triangle results still report obstruction. The shader opening shows the body and retains rear rails, barrels, and the support floor. Mesh and line shaders compile without console errors.

`camera-orbit-check.json` records two checks. After a manual preview orbit, a one-pixel resize moves the camera 0.0011 units, with 0.017 degrees of remaining drag damping. The prior resize moved it 6.64 units. After a manual gameplay orbit and movement into a wall, heading changes only 0.007 degrees of remaining drag damping.

The 16-route pass preceded the five-height envelope and fixed orthographic boom refinements. These refinements have unit tests and targeted render checks. The frozen final repeat is recorded in the next section. `camera-capture-source-hashes.json` identifies the files used for the final targeted captures.

## Final frozen verification

The final run uses audit bundle `audit-Dw5hqg8v.js` at `http://127.0.0.1:5297/audit.html`. It includes the final roof placement, tracking margin, cutaway, and district refit corrections. All 306 served GLBs and the served manifest match the delivered files. `camera-final-receipt.json` records the bundle hash, source hashes, scene hashes, and successful validation of all seven camera and performance reports. No measured hash was changed to match a later build.

The camera-motion report (regenerable with `scripts/verify-camera-motion.ts`; raw trace not committed) records all 68 passing checks, with no browser errors. All 32 screenshot checks pass. Fourteen views retain raw blocked joints. The minimum probe count is 10 pixels, above the required three. The exact blocked maps remain in the report. The jump checks record 2,893 frames, with maximum camera speed 4.7766 metres per second. No joint leaves the viewport.

The camera-final-continuity report (regenerable with `docs/verification/correction/camera-final-continuity.mjs`; raw trace not committed) records all 16 passing routes across four cameras, two viewport sizes, and full and reduced motion. The routes contain 16,337 frames. No joint leaves the viewport. Maximum camera step is 0.068004 metres. Maximum speed is 6.8691 metres per second. Maximum heading change is 0.00000171 degrees. No page or console errors occurred.

The final preview report passes all 45 checks and contains 12 headwear captures. It covers content fits, orbit retention, user zoom, resize, and body limits. Exact orthographic fits keep the camera outside the full bounds sphere during later user orbit. The heavy cap has a solid brim-to-dome join at scales 0.8 and 1.2. The earlier bright seam is gone.

The final performance sequence also passes. The 901.0-second baseline, 60.3-second stress stage, and 15.1-second return each average 120.0 FPS. Their P95 frame times are 9.8, 9.6, and 9.9 ms. No measured benchmark frame exceeds 33 ms. All four moving-game and extra-scene cases average 120.0 FPS at both CPU rates. The low-ceiling intervals also average 120.0 FPS, with P95 times of 9.8 ms at CPU rate 1 and 10.2 ms at CPU rate 4. Pixel checks run outside those timed intervals. See `../../performance.md` for the full tables. These are desktop measurements. Physical Android performance remains unverified.

## Final obstruction repair

A later full-route test found two real missed pixels. At checkpoint 4, phone perspective, the right foot was behind a rail. The geometric camera envelope missed that rail, so its obstruction flag was false. The pixel probe found one black pixel where three were required. At checkpoint 5, phone top, the right hand was behind a beam. The opening was active, but its depth cutoff stopped at the body focus plane. The hand probe found zero black pixels. The assertions were not changed.

The primary shader opening now stays ready during gameplay. It can remove fragments only inside its fixed body ellipse, above the support floor, and in front of the back of the fixed body envelope. The geometric obstruction flag remains unchanged. Sparse ray misses no longer disable the opening. The depth range now covers body parts on both sides of the focus plane. The primary camera solver, camera position, and heading code did not change.

The front fall also exposed a target behind a foreground ramp. A second opening now covers one nearby reacting target. It selects the nearest active reaction within 4.5 metres and retains that target during hit, fall, and recovery. It fades out before another target can replace it. Its size comes from the fixed target body height and root. It does not use animated joints or affect camera motion. It retains a floor cutoff and a rear depth cutoff. A target behind the camera cannot open the view. Mesh surfaces and line outlines share the same uniforms. The update allocates no geometry or materials. Reset, scene change, and explicit camera selection clear the opening.

The live repair checks used port 5197. `camera-route-check/art-pass.json` records 184 passing full-route checks, with no browser errors. Both formerly hidden points are visible. Open-ground screenshots retain the floor and rear objects. The camera-reactions report (not committed; regenerate with `docs/verification/correction/camera-reaction-proof.ts`) records 12 passing front and rear fall checks. All 11 target-joint pixel probes pass in Side view. The new `camera-reactions/front-side.png` shows the complete horizontal target where the ramp had hidden it.

`camera-cutaway-cpu.json` records eight passing checks for activation without a ray hit, shared mesh and line uniforms, nearest-target selection, fade before replacement, recovery, distance limits, and reset. Typecheck and all 14 camera unit tests pass. A first full-route attempt used the default Chromium headless shell and timed out before initial load. The passing copy uses the same full Chromium channel as the other camera proofs. It retains the same route and pixel assertions.


## Tracking margin repair

The later full-asset repeat found one outside joint in 16,337 frames. In desktop perspective with reduced motion, the left foot reached y=912.58 in a 900-pixel viewport during the run-to-block transition at a wall. Its reconstructed world height was 0.0326 metres, so the pose was valid. The camera was at the old minimum boom distance of 3.33185 metres. Its target lagged the body root by about 0.30 metres. Camera motion remained continuous. The pre-margin continuity trace (not committed; regenerate with `docs/verification/correction/camera-final-continuity.mjs`) preserves the failed run.

`minimumBodyDistance` now fits a fixed body box through both frustum axes. The box has a horizontal tracking allowance of one metre, a 0.05-metre vertical margin, and a five-percent screen margin. The tracking allowance covers sprint speed of 7.6 metres per second, target damping of 10 per second, and camera lead of at most 0.25 metres. The function does not inspect animated joints. The previous height-based floor remains a lower bound. The chosen direction and boom damping are unchanged. A manually closer requested orbit retains the existing user-zoom contract; the new minimum limits automatic collision shortening.

Two tests reproduce the recorded foot projection and check every fixed-envelope corner at desktop and phone aspect ratios. Typecheck and all 70 unit tests pass. The targeted browser proof repeats the exact failed route three times. All 3,063 frames remain inside the viewport, with no browser errors. Maximum camera speed is 6.9386 metres per second. The margin-route report (regenerable with `docs/verification/correction/camera-margin-route.mjs`; raw trace not committed) records those results and source hashes. The final frozen reports above include this margin change and the separate roof placement correction.
