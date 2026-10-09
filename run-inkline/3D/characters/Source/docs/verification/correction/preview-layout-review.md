# Final preview layout source review

Date: 27 September 2026.

No P0 or P1 fault was found in the final preview fit correction. No source changed during this review.

## Findings

I read `refitPreviewCamera`, scene rebuild, camera framing, resize handling, and the settings paths that request a rebuild.

When the selected asset or district layout changes, rebuild retains the chosen view direction but now requests an exact fit to the new content. Other preserved preview views retain the expand-only rule. Game views return before this fitting code.

The orthographic fit derives width and height from all eight box corners in camera space. It converts horizontal size through the viewport aspect ratio. The radius includes the camera zoom factor, which cancels the retained zoom in the visible orthographic extent. The new fit can therefore reduce the visible area after a smaller scene replaces a larger one.

For an exact fit, the camera distance now starts from `max(1, orbitExtent + near + 0.1)`. `orbitExtent` is the largest distance from the target to any of the eight box corners. This replaces the shorter width-and-height distance, which the browser check found could clip the scene after a manual orbit.

Every point in the box lies within this target-centred radius. Its projection toward the camera cannot exceed that radius in any direction. The new distance therefore leaves every point at least 0.1 metres beyond the near plane during an orbit about the same target at the same distance. This calculation does not depend on the initial side-view depth.

The exact fit no longer retains a large prior offset solely because the old scene needed it. Orthographic screen size does not depend on this distance. The new bound reduces inherited excess depth without changing the fitted screen extent.

The final distance still cannot be less than `frontExtent + near + 0.1`. The depth sign is correct: the corner toward the camera has positive projection on the backward camera axis. The limit leaves that corner at least 0.1 metres beyond the near plane. The expand-only path retains the previous distance unless this same near-plane limit requires more distance.

The scene bounds and fit work run on preview changes. The radius calculation adds one vector length operation for each corner in the existing loop. The correction adds no per-frame loop or persistent allocation.

## Source hashes

| File | SHA-256 |
| --- | --- |
| `src/runtime/renderer.ts` | `fabc139f6a187dba82b3f9c636e2f99bad92c8ffcaa8c80b7b922d20dcd72381` |
| `src/runtime/camera.ts` | `a5dfe0b3210c257539c944707a3e6d7be35cd6c818dccd27a1f9877d5f5063c2` |

## Limits

This was a source review. I did not use a browser or GPU. I did not rerun the preview checks or measure final scene coverage. Those checks must confirm the actual layout transitions, fog, and screen coverage at desktop and phone widths. The orbit radius proves near-plane clearance around the unchanged target. It does not prove screen coverage for every orbit, changed target, or user zoom.
