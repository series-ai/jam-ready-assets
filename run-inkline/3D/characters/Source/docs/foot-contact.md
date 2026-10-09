# Foot contact — 1.4.2

Some standing clips declared only one support foot. The other foot could move backward or rise while the pose changed. A whole-body floor check could pass because the other foot still touched the floor. The old checks did not test the omitted foot or detect a foot that started above the floor.

Standing attacks, hit reactions, and standing celebrations now declare both support feet for the full clip. The left punch uses a shorter rear stance to prevent a deep crouch. Kicks keep the striking leg free. The export bake places fixed targets at the body’s floor contact height. It adjusts hip height when a leg cannot reach a target. These contacts are stored in the exported bone animation.

The game also permitted horizontal movement during the landing recovery pose. The player now holds position during grounded landing recovery. Air steering and a new jump remain available. Movement resumes when recovery ends.

The foot check uses its own list of expected support feet. It checks each exported body at 120 samples per second. It measures horizontal drift and height error for each support foot. The limit is 3 mm. Separate checks cover motion, stance, weapon contact, avatar shape, timing, and the review page. The landing regression tests use the real game update path without a WebGL canvas.

Current evidence and motion films are in `docs/verification/feet` and `public/review`. The correction retains the 85 clip IDs, durations, and contact times. Earlier performance reports are historical. This release has no new performance measurement. Physical Android performance remains unverified.

Two runtime limits remain. Run-to-idle transitions can move the support feet during the short blend. Ramp movement changes the actor’s height without separate terrain targets for each foot. The new flat-ground contact checks do not certify those cases.
