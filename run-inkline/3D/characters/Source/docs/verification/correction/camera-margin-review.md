# Camera margin source review

Date: 27 September 2026.

No P0 or P1 fault was found in the camera margin correction. No source changed during this review.

## Geometry and integration

I read `minimumBodyDistance`, the renderer call, the clearance distance contract, camera smoothing, and the two new framing tests.

The helper derives the backward camera direction from the requested position minus the aim. Its right axis is perpendicular to that direction in the horizontal plane. The cross product gives the camera up axis. The vertical-view fallback avoids a zero right axis.

For each box corner, the required distance equals its depth toward the camera plus the larger horizontal or vertical projection requirement. This uses the correct sign: a corner closer to the camera requires more distance. The horizontal field uses the vertical field tangent multiplied by the aspect ratio. All eight corners are checked. The five-percent projection margin is applied to both screen axes.

The fixed box includes the body height, 0.05 metres above and below, and a horizontal extent of 0.3 times body height plus one metre on each side. The allowance covers the intended horizontal tracking error. It does not sample animated joints. The renderer uses the requested view direction and the same aim height passed to camera motion. Orthographic views retain their prior path. Camera direction, damping, and target ownership remain unchanged.

The helper sets the floor for automatic collision shortening. The existing clearance contract retains a requested distance that is already closer than this floor. The camera agent confirmed that this preserves explicit user zoom. The change therefore does not promise a complete body view after every user zoom.

## Per-frame work

The added calculation checks eight corners once per perspective game-camera update. It adds five temporary vectors across the helper and call site, plus short loop arrays. It does not allocate geometry, materials, textures, or persistent scene objects. This is small, fixed work. I found no P0 or P1 allocation fault. This review does not replace device performance measurements.

## Verification evidence

The first new test uses the saved failing foot, target, and camera coordinates. It checks that the old projection is outside the view and that the corrected distance keeps the foot inside a 0.95 screen bound. The second test projects all box corners for desktop and phone aspects and two camera directions. It checks both screen axes and clip depth.

The camera agent reported a passing type check and all 70 unit tests at 22:00:41 UTC. I read the tests but did not rerun them. Browser route verification was still pending when this source review ended.

## Source hashes

| File | SHA-256 |
| --- | --- |
| `src/runtime/camera.ts` | `a5dfe0b3210c257539c944707a3e6d7be35cd6c818dccd27a1f9877d5f5063c2` |
| `src/runtime/renderer.ts` | `ce45a1cfb4b78040492cfd6c93298dbc61bd70e1fc86400e0a560390b124e409` |
| `src/runtime/camera.test.ts` | `f424c390ba06d89b4def5e6cf3429cee1e9c3a36b1f5e50ca55dd39480a97007` |

## Limits

This was a source review. I did not use a browser or GPU. The fixed box and horizontal allowance do not prove visibility for every airborne pose, vertical tracking error, camera transition, or user-selected zoom. The saved route must confirm the correction in the reported failure case.
