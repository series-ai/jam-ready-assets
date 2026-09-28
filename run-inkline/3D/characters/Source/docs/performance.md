# Performance and test limits

The target is 60 FPS at 1280×720 with 20 animated figures and 10 active effects on a high-end Android phone from 2022. A physical 15-minute Android run remains unverified. No phone is connected to this workspace.

The browser harness measures animation-frame intervals. It records frame-time percentiles, draw calls, triangles, geometry counts, texture counts, GPU renderer, browser version, source hashes, and model file hashes. It runs the baseline for 15 minutes. It then runs 100 figures with 40 effects for one minute. It returns to baseline to check resource counts. Results are written to [verification/browser-benchmark.json](https://github.com/series-ai/run-workshop/blob/main/games/inkline-showcase/docs/verification/browser-benchmark.json).

For a repeatable production run, build the isolated harness:

```sh
node --import tsx scripts/build-harness.ts audit
npx vite preview --config vite.audit.config.ts --port 5297
# In a second terminal:
INKLINE_BENCH_URL=http://localhost:5297/audit.html INKLINE_BENCH_PUBLIC_ROOT=dist-audit node --import tsx scripts/benchmark.ts
```

The harness rejects page reloads during a measurement. `INKLINE_BENCH_SECONDS` can shorten a trial run. Leave it unset for the full 15-minute baseline. The default URL uses the development harness on port 5197.

The browser run is a desktop test. It does not measure Android thermals, battery use, touch latency, or mobile driver behavior. Other work on the host can affect frame timings.

The GLB integrity report is [verification/asset-report.json](https://github.com/series-ai/run-workshop/blob/main/games/inkline-showcase/docs/verification/asset-report.json). It records actual geometry counts and file sizes. The pack file sizes and checksums are in `../inventory-checksums.json`. The external [docs/verification/export-report.json](https://github.com/series-ai/run-workshop/blob/main/games/inkline-showcase/docs/verification/export-report.json) is in the workspace and the separate demo source archive. These reports take precedence over estimates.

The renderer uses unlit materials and no shadow maps. Each figure has a skinned mesh and a simple ground shadow. A pale figure adds one back-face contour draw. The contour shares the figure geometry and skeleton. Black figures do not draw this contour. Static district meshes are combined by material. Hard edges use line geometry. Effects use seven instanced shape pools with a shared total capacity of 2,048 particles. The procedural effects need no textures.

The Mobile setting caps the drawing buffer height at 720 pixels and pixel ratio at 1. The High setting uses a pixel ratio up to 1.5. This setting changes resolution. It does not add lighting passes. The performance scene uses a simple floor so that figure and effect costs can be measured separately from the district.

Gameplay collision uses explicit surface and box proxies. Decorative objects do not all have collision. The controller uses fixed substeps. Visual character geometry does not take part in movement collision.

## Version 1.4.1 measurement

The corrected character files and firearm runtime passed a new desktop check on the Apple M5 Max at 1280 × 720. Character geometry remains at 1,712 triangles. The separate pump or magazine adds one draw call while that weapon is equipped.

| Figures | Effects | Duration | Mean FPS | P95 frame time |
| ---: | ---: | ---: | ---: | ---: |
| 20 | 10 | 60.3 s | 120.0 | 9.9 ms |
| 100 | 40 | 60.3 s | 120.0 | 9.6 ms |
| 20 | 10 | 15.1 s | 120.0 | 9.2 ms |

The source and model hashes are in [verification/stance/browser-benchmark.json](https://github.com/series-ai/run-workshop/blob/main/games/inkline-showcase/docs/verification/stance/browser-benchmark.json). This desktop result does not verify the Android target.

## Version 1.4.0 measurement

The current 12 character files and revised effects were measured on the same Apple M5 Max host at 1280 × 720. These short checks use current source and model hashes. They do not replace the earlier 15-minute endurance record below.

| Stage | Figures | Configured effects | Duration | Mean FPS | P95 frame time |
| --- | ---: | ---: | ---: | ---: | ---: |
| Baseline | 20 | 10 | 60.6 s | 120.0 | 9.9 ms |
| Stress | 100 | 40 | 60.3 s | 120.0 | 10.0 ms |
| Return | 20 | 10 | 15.1 s | 120.0 | 10.0 ms |

The browser reported 0 page errors. Read [verification/polish/browser-benchmark.json](https://github.com/series-ai/run-workshop/blob/main/games/inkline-showcase/docs/verification/polish/browser-benchmark.json). These results do not establish physical Android performance.

| Scene | Duration | Mean FPS | P95 frame time |
| --- | ---: | ---: | ---: |
| combat-third-person | 60.0 s | 120.0 | 9.9 ms |
| parkour-side | 60.5 s | 120.0 | 9.9 ms |
| service-yard-effects | 30.3 s | 120.0 | 9.9 ms |
| roof-works-effects | 30.3 s | 120.0 | 9.8 ms |

Read [verification/polish/game-performance.json](https://github.com/series-ai/run-workshop/blob/main/games/inkline-showcase/docs/verification/polish/game-performance.json) for the current moving-scene samples and source hashes.

## Earlier 1.3.0 desktop result

Measured on 2026-09-27 with Chromium 147.0.7727.15 and Apple M5 Max. The renderer was ANGLE (Apple, ANGLE Metal Renderer: Apple M5 Max, Unspecified Version). The drawing buffer was 1280×720. This measurement used the 1.3.0 character files. Release 1.3.1 keeps the runtime rendering code but replaces the twelve character meshes and clips. Its figure triangle count is lower. The old timing result is not a new measurement of those files.

| Stage | Figures | Configured effects | Observed active effects | Duration | Mean FPS | P95 frame time |
| --- | ---: | ---: | --- | ---: | ---: | ---: |
| Baseline | 20 | 10 | 8–10 | 901.0 s | 120.0 | 9.8 ms |
| Stress | 100 | 40 | 35–40 | 60.3 s | 120.0 | 9.6 ms |
| Return | 20 | 10 | 9–10 | 15.1 s | 120.0 | 9.9 ms |

0 measured frames exceeded 33 ms. The browser reported no page errors. Effect counts vary as bursts expire and restart.

Geometry counts at the end of baseline, stress, and return were 29, 110, 30. Texture counts were 20, 100, 20. The return stage checks the resource count after the larger crowd is removed. These counters do not measure every browser or driver allocation.

This result applies to the measured Mac and browser. The Android target remains unverified.

## Moving cameras and assembled scenes

| Scene | Duration | Mean FPS | P95 frame time |
| --- | ---: | ---: | ---: |
| combat-third-person | 60.3 s | 120.0 | 10.0 ms |
| parkour-side | 60.2 s | 120.0 | 9.9 ms |
| service-yard-effects | 30.3 s | 120.0 | 9.8 ms |
| roof-works-effects | 30.3 s | 120.0 | 9.8 ms |

Combat and parkour use movement and action input during measurement. Both extra scenes run their environment effects. These are desktop checks. They do not establish Android performance.

## Desktop CPU stress check

The same four scene tests also ran with Chromium CPU throttling set to 4. This checks CPU margin on this desktop. It is not an Android device model. GPU speed, memory bandwidth, touch input, and phone heat limits are not reproduced.

| Scene | Duration | Mean FPS | P95 frame time |
| --- | ---: | ---: | ---: |
| combat-third-person | 60.0 s | 120.0 | 10.2 ms |
| parkour-side | 60.0 s | 120.0 | 10.2 ms |
| service-yard-effects | 30.2 s | 120.0 | 10.2 ms |
| roof-works-effects | 30.2 s | 120.0 | 10.2 ms |

Read [verification/kinetic/cpu-stress.json](https://github.com/series-ai/run-workshop/blob/main/games/inkline-showcase/docs/verification/kinetic/cpu-stress.json) for the samples and matching source hashes.

## Low-ceiling camera check

The route reaches checkpoint five with real movement input. The top view then holds for 30 seconds at each CPU rate. The camera keeps its requested direction and uses a local foreground cutaway. Pixel checks run before and after each timed interval. Continuous samples check framing and camera drift. Raw geometry obstruction remains in the report.

| Camera | Desktop CPU rate | Duration | Mean FPS | P95 frame time |
| --- | ---: | ---: | ---: | ---: |
| Continuous camera with cutaway | 1 | 30.4 s | 120.0 | 9.8 ms |
| Continuous camera with cutaway | 4 | 30.3 s | 120.0 | 10.2 ms |

This is a desktop cost check. It does not model a phone GPU or thermal limit.
