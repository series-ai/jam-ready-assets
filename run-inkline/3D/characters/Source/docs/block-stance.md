# Block stance — 1.4.3

This change adjusts the legs and body in the block guard. It uses a shorter stance with bent knees. The arms keep their guard pose. Both support feet remain fixed for the full block clip. The body keeps the simple stick form and common arm and leg junctions.

The source pose change is limited to block. Exported shield poses can change when their shared block reference is rebuilt. Their contact checks remain required. The 85 clip IDs, durations, and contact times remain unchanged. The authored punch, kick, and unrelated source poses remain unchanged. Export checks allow small numerical differences from the bake. They check track values and timing against the 1.4.2 baseline; they do not require identical bytes. The other standing-foot, firearm, reload, grip, and body-shape checks remain required.

Final evidence belongs in [docs/verification/block](https://github.com/series-ai/run-workshop/blob/main/games/inkline-showcase/docs/verification/block). It includes the block stance check, all-body contact and motion checks, rendered pose review, and published motion recordings. The release review must match the final source and asset hashes before acceptance. The 1.4.2 final receipt is retained in [docs/verification/correction/final-review-1.4.2.json](https://github.com/series-ai/run-workshop/blob/main/games/inkline-showcase/docs/verification/correction/final-review-1.4.2.json).

The prior runtime limits remain. Run-to-idle blends can move support feet. Ramp movement has no separate terrain target for each foot. Flat-ground contact checks do not certify those cases. This release has no new performance measurement. Earlier benchmarks are historical. Physical Android performance remains unverified.

The final 12-body checks pass. The standard guard's front-to-back foot spacing falls from 0.521 m to 0.275 m. Its maximum torso tilt falls from 14.04° to 8.13°. All bodies use a narrower stance than before. The checks cover 96 posture cases and 1,020 body/clip comparisons. The 84 protected punch, uppercut, and kick pairs retain exact track values and times. Small export differences in other clips are checked in world space.
