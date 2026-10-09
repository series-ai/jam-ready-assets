# Effects and motion pass

Version 1.4.0 reviews all 64 effects and all 85 animation clips. The joint mesh, simple spine, rig names, character IDs, and animation IDs remain in place.

## Effects

The review uses the same 1.80 m figure and a fixed camera for every effect. It checks each effect at default size. It also checks effects at game size. The fixed-scale sheets are in `verification/polish/`.

- Blade arcs use a thin stroke with tapered ends. Staff sweep uses one main arc.
- Block and hit rings are smaller. The shield uses one ring around the figure.
- The explosion uses one main flash, a paper core, one ring, six rays, and four smoke strokes. It uses 13 particles instead of 33.
- Short muzzle flashes use one clear center. Fewer secondary rays leave the weapon and target visible.
- Small dust marks use stronger lines. The game uses separate footstep, stop, and dash sizes so the marks remain visible.
- Crossed sword marks use two crossing strokes. The combo mark moves upward.

Effect `scale` now changes all distances from the trigger point. It changes shape size, travel, gravity, initial offset, and orbit radius. Previously it changed shape size only. Callers that compensated for the old travel distance must check their sizes again.

Particle position now comes from elapsed time. A 30 Hz update and a 120 Hz update follow the same path. The instance pools and particle capacity are unchanged. The effects need no texture or light.

Recipes can set `angle` in radians relative to the trigger direction. Recipes can set `orbitRadius` in metres. `effectMaxDuration()` includes the longest layer, delayed start, and life variation. The eight-frame sprite sheets use this full duration plus a clear final interval. `effectAtlasDuration()` gives the atlas duration. Their frames sample the center of each equal time interval. Read `atlas.json` for playback duration.

## Animation review

The initial review covers 85 clips. It ranks 25 pose or timing corrections and records 20 smaller items. The report also records clips that already read clearly. Current changes and exact frame times are listed in `verification/polish/animation-changes.md` and the timing report.

The rifle foregrip rule now applies only during idle and firing. It leaves the authored reload hand path free. The live jump starts at its authored takeoff phase. This keeps the pose extension aligned with the immediate physics launch. The isolated clip retains its full load phase.

Consumers must read `duration` and `contactTime` from the current catalog. Do not keep old contact times in game code. A timing report compares the previous release with the new exported clips. It checks the same rig and clip IDs, event frames, support phases, and exported duration.

## Verification and limits

Final checks cover all 12 character files, 1,020 body/clip pairs, 24 fall boundaries, 288 grips, 504 avatar floor cases, and 96 action-pose checks. The catalog changes 23 clip times. The pass changes 27 clips and 59 effect recipes. Review films cover all 85 clips and all 64 effects. The external delivery receipt records the final checks and hashes.

Desktop measurements do not establish performance on a physical 2022 Android phone. That device test remains unverified. Earlier full-pack films remain marked with their original release.
