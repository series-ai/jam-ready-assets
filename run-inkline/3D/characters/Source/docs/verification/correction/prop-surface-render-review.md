# INKLINE prop surface render review

Result: **PASS**.

This review covers the eight public prop GLBs changed to remove exposed coplanar joins. The CPU orange-only scan passes for all 291 prop files. The rendered review uses the final public files.

The interactive review used the headless Playwright CLI at `http://localhost:5296/` with a 1280 × 720 viewport. It selected the `Props & Kit` filter. Each prop used a reset close view, a continuous three-segment mouse orbit, and a mouse-wheel district-distance view. The recording (26.96 seconds at 25 frames per second) is not committed; regenerate it with the committed capture flow in `scripts/verify-prop-surfaces.py` and the review-page orbit script. A one-second sample produced 27 frames for review.

The immutable capture cross-check used `http://localhost:5299/capture.html` with a 384 × 384 viewport. It rendered front and side views for all eight IDs. Both browser sessions reported zero console errors.

| Prop | Triangles | Close | Orbit | District | 5299 front | 5299 side | Result |
| --- | ---: | --- | --- | --- | --- | --- | --- |
| `roof-cable-bridge` / Roof Cable Bridge | 72 | [prop-surface-final-roof-cable-bridge-close.png](prop-surface-final-roof-cable-bridge-close.png) | [prop-surface-final-roof-cable-bridge-orbit.png](prop-surface-final-roof-cable-bridge-orbit.png) | [prop-surface-final-roof-cable-bridge-district.png](prop-surface-final-roof-cable-bridge-district.png) | [prop-surface-final-5299-roof-cable-bridge-front.png](prop-surface-final-5299-roof-cable-bridge-front.png) | [prop-surface-final-5299-roof-cable-bridge-side.png](prop-surface-final-5299-roof-cable-bridge-side.png) | PASS |
| `walkway-rail-kickplate` / Walkway Rail Toe Board | 200 | [prop-surface-final-walkway-rail-kickplate-close.png](prop-surface-final-walkway-rail-kickplate-close.png) | [prop-surface-final-walkway-rail-kickplate-orbit.png](prop-surface-final-walkway-rail-kickplate-orbit.png) | [prop-surface-final-walkway-rail-kickplate-district.png](prop-surface-final-walkway-rail-kickplate-district.png) | [prop-surface-final-5299-walkway-rail-kickplate-front.png](prop-surface-final-5299-walkway-rail-kickplate-front.png) | [prop-surface-final-5299-walkway-rail-kickplate-side.png](prop-surface-final-5299-walkway-rail-kickplate-side.png) | PASS |
| `walkway-bridge-narrow` / Narrow Walkway Bridge | 448 | [prop-surface-final-walkway-bridge-narrow-close.png](prop-surface-final-walkway-bridge-narrow-close.png) | [prop-surface-final-walkway-bridge-narrow-orbit.png](prop-surface-final-walkway-bridge-narrow-orbit.png) | [prop-surface-final-walkway-bridge-narrow-district.png](prop-surface-final-walkway-bridge-narrow-district.png) | [prop-surface-final-5299-walkway-bridge-narrow-front.png](prop-surface-final-5299-walkway-bridge-narrow-front.png) | [prop-surface-final-5299-walkway-bridge-narrow-side.png](prop-surface-final-5299-walkway-bridge-narrow-side.png) | PASS |
| `service-bay-arch` / Service Bay Arch | 184 | [prop-surface-final-service-bay-arch-close.png](prop-surface-final-service-bay-arch-close.png) | [prop-surface-final-service-bay-arch-orbit.png](prop-surface-final-service-bay-arch-orbit.png) | [prop-surface-final-service-bay-arch-district.png](prop-surface-final-service-bay-arch-district.png) | [prop-surface-final-5299-service-bay-arch-front.png](prop-surface-final-5299-service-bay-arch-front.png) | [prop-surface-final-5299-service-bay-arch-side.png](prop-surface-final-5299-service-bay-arch-side.png) | PASS |
| `service-bay-workbench` / Service Bay Workbench | 160 | [prop-surface-final-service-bay-workbench-close.png](prop-surface-final-service-bay-workbench-close.png) | [prop-surface-final-service-bay-workbench-orbit.png](prop-surface-final-service-bay-workbench-orbit.png) | [prop-surface-final-service-bay-workbench-district.png](prop-surface-final-service-bay-workbench-district.png) | [prop-surface-final-5299-service-bay-workbench-front.png](prop-surface-final-5299-service-bay-workbench-front.png) | [prop-surface-final-5299-service-bay-workbench-side.png](prop-surface-final-5299-service-bay-workbench-side.png) | PASS |
| `loading-platform-ramp` / Loading Platform Ramp | 384 | [prop-surface-final-loading-platform-ramp-close.png](prop-surface-final-loading-platform-ramp-close.png) | [prop-surface-final-loading-platform-ramp-orbit.png](prop-surface-final-loading-platform-ramp-orbit.png) | [prop-surface-final-loading-platform-ramp-district.png](prop-surface-final-loading-platform-ramp-district.png) | [prop-surface-final-5299-loading-platform-ramp-front.png](prop-surface-final-5299-loading-platform-ramp-front.png) | [prop-surface-final-5299-loading-platform-ramp-side.png](prop-surface-final-5299-loading-platform-ramp-side.png) | PASS |
| `loading-gate` / Loading Gate Arm | 100 | [prop-surface-final-loading-gate-close.png](prop-surface-final-loading-gate-close.png) | [prop-surface-final-loading-gate-orbit.png](prop-surface-final-loading-gate-orbit.png) | [prop-surface-final-loading-gate-district.png](prop-surface-final-loading-gate-district.png) | [prop-surface-final-5299-loading-gate-front.png](prop-surface-final-5299-loading-gate-front.png) | [prop-surface-final-5299-loading-gate-side.png](prop-surface-final-5299-loading-gate-side.png) | PASS |
| `utility-cabinet-low` / Low Utility Cabinet | 72 | [prop-surface-final-utility-cabinet-low-close.png](prop-surface-final-utility-cabinet-low-close.png) | [prop-surface-final-utility-cabinet-low-orbit.png](prop-surface-final-utility-cabinet-low-orbit.png) | [prop-surface-final-utility-cabinet-low-district.png](prop-surface-final-utility-cabinet-low-district.png) | [prop-surface-final-5299-utility-cabinet-low-front.png](prop-surface-final-5299-utility-cabinet-low-front.png) | [prop-surface-final-5299-utility-cabinet-low-side.png](prop-surface-final-5299-utility-cabinet-low-side.png) | PASS |

The saved stills and sampled orbit frames show no visible orange flash, exposed coplanar surface, or attachment axis defect. The video contains the continuous orbit action for every case.

The canonical orange-only scan is [prop-surfaces.json](prop-surfaces.json): 291 files, 0 findings, and 0 parse errors. The persisted visibility triage is [prop-visible-surfaces.json](prop-visible-surfaces.json): 1,229 broad pairs, 8 same-facing pairs, 1,221 opposed-normal pairs, 0 exposed normal-ray pairs, and 1,229 occluded pairs.

The source hash is `f247d02a4f0bb450e0a76dfcbde5adcec166cf082ba3dd18525f3ec901d6ab55` for `scripts/blender/props.py`. The detailed machine receipt is [prop-surface-render-review.json](prop-surface-render-review.json).

Limits: the rendered review uses one viewport and one lighting setup. The orbit receipt samples 27 frames from the recording. The visibility triage tests bounded normal rays and does not prove absence from every oblique camera direction.

## Final scene hashes

- `industrial-district.glb`: `1fa71aae4b05e5c0a343ec90c2eb54dade4ead81ced2f28913131d509a483b2e`
- `roof-works.glb`: `0be84d0811583dd2728dad1b9ef2724ba4f7d1666ce37246d155481a57339d45`
- `service-yard.glb`: `fcaaeed0f89f7757a5d974efb953200707dc7fceea01dd1041995c528ecd0011`

## Final scene source hashes

- `industrial-district.blend`: `768a23402fe28e009cfcc8e8620f5e61dfda8b3993d9670a09058cbe53ae1501`
- `roof-works.blend`: `40c61a872ddb3699b23fdcdb4662fcd148f98f9a585377e38d1e26b746aa294b`
- `service-yard.blend`: `a5f01cfb9883c2ccef306610b1ff67f3ebec65bfcff05412e8ebd4cd3be9e873`


## Earlier orange detail review

The first source correction also has a 39.44-second orbit recording at
`prop-surface-render-review.webm`. It covers `ramp-low`, `platform-low`,
`pipe-riser`, `barrel-toxic`, `electrical-panel-wall`, and `vault-rail`.
The matching files use `prop-surface-<id>-close.png`, `-orbit.png`, and
`-district.png`. That review checked the separated orange caps, strips,
collars, and latch faces. The later eight-prop correction did not change
these six builders. The final all-prop orange scan covers them again.
