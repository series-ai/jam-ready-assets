# Final cutaway source review

Date: 27 September 2026.

No P0 or P1 fault was found in the final cutaway source or its renderer integration. No runtime source changed during this review.

## Scope

This review covers the primary opening, depth and floor limits, secondary target selection, fade state, camera update order, and reset paths. It supplements `runtime-integration-final.md`. It does not replace that report or change its source hashes.

## Findings

- `ForegroundCutaway.update` enables the primary opening each frame. It does not wait for a discrete obstruction result. The opening has finite width, height, and rear depth relative to the player. The floor condition keeps the ground below the body outside the opening.
- Both shader openings use the current camera view space. Perspective views project each surface point to the focus depth. Orthographic views use the view coordinates directly. The secondary test rejects a focus behind the camera.
- The renderer updates the camera pose before the primary and secondary uniforms. The primary update refreshes the camera world matrix before the secondary update reads it.
- Secondary selection starts with the nearest reacting actor within 4.5 world units. The loop excludes the player. It retains the current target while that target reacts or gets up. All combat targets use `stick-fighter`, which matches the height source for this opening.
- An inactive target fades out at its last stored world position. Camera movement still updates that position in view space during the fade. The renderer releases the target after the fade drops below the shader threshold. It then selects another eligible target. This avoids an immediate move of the opening between two targets.
- Scene replacement, game reset, and camera framing clear both opening strengths and the selected target. The shader change applies to game district meshes and line segments. It does not change collision geometry or camera motion.

## Saved visual evidence

I opened `camera-reactions/front-side.png` and `camera-reactions/rear-side.png` with `view_image`. Both images show the fallen red target, including its head and torso. The front target is now visible through the ramp opening. The earlier front endpoint evidence limit is closed for this view.

The supplied camera-reactions report (not committed; regenerate with `docs/verification/correction/camera-reaction-proof.ts`) records 12 passing checks and no errors. I read that result. I did not rerun those checks.

## Source hashes

| File | SHA-256 |
| --- | --- |
| `src/runtime/cutaway.ts` | `10c0cb606b00eee1dc24a6def91b8daec9451eb1710d423892d98571bb0c17f8` |
| `src/runtime/renderer.ts` | `d48ffc7d9599083e443678919f186072972d29a896acce025da4c2eab56f261d` |

## Limits

This was a source and still-image review. I did not use a browser or GPU. I did not compile shaders, watch video, run tests, or measure performance. The two side images establish visible endpoints. They do not establish continuous visibility during every fall, fade, or camera path.
