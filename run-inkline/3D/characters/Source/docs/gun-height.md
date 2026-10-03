# Gun height — 1.4.4

The rifle and shotgun now use a lower-chest position. Their stock target is 60% of the distance from the hips to the common arm junction. The target follows the body through the clip. The bake keeps the hand at the grip and rejects a target that the arm cannot reach.

The shotgun support hand moves to the rear of the modeled pump. It follows the pump during the pump action. The rifle magazine has a shorter downward withdrawal with more backward movement. This keeps the reload within arm reach at the lower gun position. The magazine still follows the left palm and returns to its seat.

The gun-height check measures the actual mounted stock against an independent torso-height band. It also checks anchor position, elbow bend, support contact, and the protected block, punch, uppercut, and kick clips. Existing firearm checks cover aim, recoil, pump travel, magazine contact, and reset behavior. Prior foot, stance, grip, body-shape, motion, and timing checks remain required.

Final checks cover all 12 bodies: 276 gun-height checks, 9,696 mounted samples, and 96 protected clips with no track-value or timing change. Measured stock height stays between 54.47% and 60.004% of the torso span. The smallest support elbow bend is 29.49 degrees. The largest support-hand gap is below 0.001 mm. The standard-body before/after images show the lower position. Other body variants have numerical coverage.

Final evidence is in [docs/verification/gun-height](https://github.com/series-ai/run-workshop/blob/main/games/inkline-showcase/docs/verification/gun-height). The 85 clip IDs, durations, and contact times remain unchanged. The 1.4.3 final receipt is retained in [docs/verification/correction/final-review-1.4.3.json](https://github.com/series-ai/run-workshop/blob/main/games/inkline-showcase/docs/verification/correction/final-review-1.4.3.json). Acceptance requires the final source, model, media, and delivery hashes to match.

The prior runtime limits remain. Run-to-idle blends can move support feet. Ramp movement has no separate terrain target for each foot. Flat-ground contact checks do not certify those cases. This release has no new performance measurement. Earlier benchmarks are historical. Physical Android performance remains unverified.
