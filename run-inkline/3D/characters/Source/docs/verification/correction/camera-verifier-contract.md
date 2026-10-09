# Camera verification contract

Run the motion check with `node --import tsx scripts/verify-camera-motion.ts`. It uses port 5197 by default. Run the performance check with `node --import tsx scripts/verify-camera-performance.ts`. It uses port 5297 by default. `INKLINE_AUDIT_URL` can select a server. Both scripts close their browser and save reports in this directory.

The motion report contains 16 viewport, camera, and motion-setting combinations. It checks camera settling, rendered standing pixels, and per-frame jump framing and continuity. It then checks four camera views at the starting rail and low ceiling for each viewport. At least one view at each obstruction checkpoint must have a raw blocked joint. The complete report has 68 checks.

The performance report contains two 30-second intervals, at CPU rates 1 and 4. Screenshots run before and after each interval. Screenshot capture and pixel analysis are outside the measured interval. Timed samples check framing, errors, finite camera positions, and camera drift below 0.02 metres. The report includes measured frame rates. CPU throttling does not prove physical Android performance.

Both reports retain the exact raw `blocked` map and its `geometricBlocked` list. These ray results ignore the fragment cutaway shader. The camera obstruction flag and cutaway amount remain separate fields. They cannot make a missing-pixel check pass.

The rendered check reads the saved canvas PNG with Pillow. It counts near-black pixels in small circular patches at 11 projected joints and five body-segment centres. The player uses the standard black color and no equipment or headwear. Each patch needs at least three pixels. The patch radius is 2–6 CSS pixels, scaled from projected body height. It also checks joint framing and the local black pixel bounds. Each report retains point positions, counts, raw obstruction, and its screenshot path.

The pixel gate proves sampled body coverage near these projected points. It does not prove visibility on every frame or identify the exact surface when limbs overlap. The continuous trace checks geometry framing and camera continuity separately. Human image review remains necessary for shape and composition quality.

`camera-pixel-calibration.json` records a CPU check against four existing low-ceiling screenshots. All four positive cases passed. The negative control moved all probe positions to a known empty part of the same screenshot. All 16 probes failed. This proves the classifier rejects missing body pixels. It does not replace a run against the final source and assets.

The live development probe passed 16 pixel checks with no browser errors. Eight views are clear high-platform references. Eight views are under the low ceiling. The high-platform check exposed an incorrect rail fixture because no raw ray was blocked there. The main motion script now checks the rail at the starting position, x=0 and z=8. Earlier side-camera evidence at that position blocks both shins. The final 68-check live run now passes. It records 32 passing screenshot checks, including 14 with raw blocked joints.

The frozen audit also passed the final 16-route continuity run across 16,337 frames. The final preview run passed 45 checks and captured 12 headwear cases. These reports keep their source hashes. The final performance run has its own source record for the delivered prop and scene files.

The primary shader opening now stays ready during gameplay. Its amount reports mask strength, not ray clearance. `camera.occluded` and each joint's raw `blocked` value still report geometry. `camera.reactionCutaway` reports the separate nearby-target opening. None of these flags can make a failed pixel probe pass. The later full-route repair proof has 184 passing checks in `camera-route-check/art-pass.json`.

`camera-final-receipt.json` validates all final report source hashes and all 306 served GLBs against the delivered files. The final 68 checks, 16 routes, 45 preview checks, and all timed performance intervals pass. The old pre-margin failure is retained separately and is not counted as a final pass.
