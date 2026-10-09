# Independent joint-shape review — 1.4.5

No P0/P1 blocker was found in this scope. Final source, model, catalog, and evidence hashes are recorded in the JSON report.

The mesh diff changes elbow and knee construction only. Each side uses a rigid tube with a round cap at the same radius as the limb. It does not add a larger joint sphere. Each figure has one skinned mesh, one material, ten surface parts, 18 bones, and 2,416 triangles. This adds 704 triangles, or 41.1%, per figure. Pale contours keep their existing extra pass. These counts do not establish mobile frame rate.

All 12 bodies pass 14,520 joint checks. Surface radius stays at 0.99996983–1.00002707 of its rest value. Local edge lengths stay at 0.99996876–1.00002759. Checks cover all 85 clips, four joints, and thickness values 0.7, 1.0, and 1.3. Surface sampling uses 12 Hz plus authored phases. Pose comparison uses 120 Hz.

Animation authoring, track layout, and timing remain unchanged. Floor-contact rebaking changes some root and leg values. Maximum local rotation change is 1.878 degrees. Maximum world rotation change is 1.595 degrees. Two forward-recovery samples exceed the usual 20 mm position bound. Heavy rises 23.609 mm and sentinel rises 20.949 mm at 0.300 seconds. Both shifts are vertical and below one measured knee radius. Without them, the new cap would enter the floor by 8.616 mm and 5.553 mm. The corrected surfaces are 14.992 mm and 15.396 mm above the floor. This recovery is not classified as grounded. Its separate -1 to 20 mm clearance band is documented in ground-rebake.json. Exported poses are not all identical.

The viewed evidence consists of before.png, after.png, pale-elbow.png, joint-before.png, joint-after.png, and pale-phone-actual.png. The first pair is a manual joint fixture. The pose sheets show block, elbow-strike, crouch-idle, and run in standard black and thin pale. They show uniform bends without visible wider dots or contour gaps. The 390 px pale crouch remains readable. Other body variants have numerical coverage.

Prior foot, stance, firearm, reload, grip, avatar, spine, motion, style, and timing checks pass. The 77 unit tests, 13 browser tests, 25 review-page checks, and exported consumer check pass. All 85 clips have final recordings with matching hashes. This review does not claim continuous visual playback of those films.

Run-to-idle blends can move support feet. Ramp movement has no separate terrain target for each foot. No new performance measurement was made. Physical Android performance remains unverified.
