# Independent effect review

No P0 or P1 blocker was found in the reviewed changes. The 64 effects are more compact. The thin arcs, smaller rings, and simpler explosion leave the figure readable. The remaining items below are quality limits, not release blockers.

## Evidence

Inspected all eight `effects-before-*.jpg` sheets and all eight `effects-after-*.jpg` sheets. Each sheet has eight effects and three time samples. The camera width is 5.6 m. The reference figure is 1.8 m tall. The after report records 64 effects and 192 captures. Its source hash matches the current `effects.ts`. All eight after sheets are newer than that report.

Also inspected the full-size `effects-after/footstep-dust-1.png` and `effects-after/combo-rise-1.png` files. Read `effects.ts`, its test changes, the renderer changes, both atlas scripts, and the fixed-scale capture script and page. No browser or GPU was used. No source files were changed.

The final before and after camera scale and anchors match. The capture page now forces `dash-ring` and `hard-stop` to the foot anchor in both versions. Their changed plane orientation is intentional. The first review used older before rows with hand-height anchors for these two effects; that evidence limit is now closed.

## Source result

- Scale now applies to initial offsets, velocity, gravity, geometry size, and orbit radius. This gives one spatial scale about the trigger anchor. Lifetime and angular speed remain independent.
- The elapsed-time position formula uses the fixed start position and velocity. Gravity has the correct negative vertical sign. It removes the prior frame-step dependence. Delayed particles start with age zero.
- The tests compare complete particle transforms at full and half scale. They also compare 30 Hz and 120 Hz paths. These checks address real behavior. The parent reported 72 unit tests passed. This independent review did not rerun them.
- The seven instance pools and particle limit remain in place. The update path adds no new per-particle vector or geometry allocation. Lower counts reduce work. The explosion now uses 13 particles across its layers.
- The new arc width makes a narrow tapered stroke. Its rotation offset puts the default arc ahead of the trigger point. The figure-scale samples show no inverted or broken arc.
- Renderer scale increases for footstep dust, dash, and stop partly offset the smaller recipes. Runtime placement and view-dependent direction still need the final game capture. Fixed default-direction sheets cannot prove those cases.

## Atlas sampling

`effectMaxDuration` uses the largest base or layer duration, multiplied by 1.25. A particle has at most 1.15 times its recipe duration of life and 0.10 times its duration of start delay. The bound therefore covers the complete layered effect. The renderer samples the midpoint of each of eight equal intervals. The packer uses the same duration rule and records it in atlas metadata. This removes the old reliance on the main layer duration.

The fixed-scale review sheets use 0.12, 0.38, and 0.72 of the main recipe duration. They do not show the full late smoke fade for explosion. The final atlas export is now complete. The frame-bound report records 512 frames, zero clipped frames, and a minimum 32-pixel margin. Atlas metadata has 64 entries. Explosion uses 0.75 s, which includes its longer smoke layer. The final explosion atlas was also inspected on a paper background. It shows the main flash, later smoke, and an almost empty final interval. This is still a sequence of stills, not a normal-speed fade review.

## Initial quality findings (see final recheck below)

| Item | Visible result | Small correction or acceptance |
|---|---|---|
| `footstep-dust`, `jump-puff`, `vault-dust` | The marks are faint and small beside the figure. The late sample nearly disappears into the grid. The full-size footstep frame still has visible open loops. | Keep these subtle if they are optional support effects. If they must confirm an input, increase early contrast or width slightly. Check the final phone view before increasing count. |
| `combo-rise` | The small marks stay close to the body and are hard to distinguish from `damage-pips`. | Move the mark slightly clear of the torso or give it one more distinct upward stroke. Keep the compact size. |
| `sword-cross` | The two arcs read as near-parallel crescents. They do not form a clear cross. This also occurs in the old recipe. | If the label must describe the shape, give the second arc a separate angle. Do not restore the old wide bands. |
| `focus-pulse`, `danger-pulse` | Both use one similar accent ring around the torso. The small size difference is not a strong state cue. | This is acceptable as a generic pulse family. Use a different stroke rhythm or shape if the player must tell the states apart without another cue. |

No effect vanished in all three samples. Small shell ejection and surface sparks remain visible as small marks. Large effects no longer cover most of the figure. The shield keeps a full-body ring and stays distinct from compact impact rings. No unexpected direction reversal is visible in the sampled sequences.

## Complete coverage

- Sheets 1, before and after: `punch-impact`, `heavy-impact`, `kick-impact`, `uppercut`, `sword-slash`, `sword-cross`, `staff-sweep`, `parry-flash`.
- Sheets 2, before and after: `block-ring`, `guard-break`, `dodge-trail`, `critical-hit`, `blade-contact`, `weapon-clash`, `shield-bash`, `guard-shock`.
- Sheets 3, before and after: `counter-flash`, `pistol-flash`, `rifle-flash`, `shotgun-flash`, `bullet-tracer`, `bullet-impact`, `shell-eject`, `arrow-trail`.
- Sheets 4, before and after: `plasma-pulse`, `muzzle-snap`, `ricochet`, `shell-burst`, `plasma-hit`, `footstep-dust`, `sprint-streak`, `jump-puff`.
- Sheets 5, before and after: `landing-dust`, `double-jump-ring`, `slide-dust`, `wall-scrape`, `dash-ring`, `vault-dust`, `wall-kick`, `grind-sparks`.
- Sheets 6, before and after: `zipline-streak`, `hard-stop`, `crate-break`, `metal-sparks`, `concrete-chips`, `steam-vent`, `smoke-puff`, `explosion`.
- Sheets 7, before and after: `welding-arc`, `steam-burst`, `electric-arc`, `pipe-leak`, `hazard-flare`, `oil-splash`, `pickup-sparkle`, `health-pulse`.
- Sheets 8, before and after: `shield`, `stun-stars`, `checkpoint`, `spawn-ring`, `combo-rise`, `damage-pips`, `focus-pulse`, `danger-pulse`.

## Final narrow recheck

Final capture time: `2026-09-28T01:50:18.904Z`. The source hash matches the report. All eight after sheets are newer than the report. This recheck covers the changed issues only; it does not claim a second full 64-effect review.

- `sword-cross`: Closed. The full-size middle sample now shows two thin strokes crossing at a clear angle. It reads as a cross and leaves the figure readable. The new per-recipe and per-layer angle is applied in both trigger and preview bounds.
- `combo-rise`: Improved. The three samples show a narrow upward path from waist to upper chest. It now differs from outward damage pips. Some overlap with the arm remains in the front view. Keep the phone-view check open; this is not a P0/P1 blocker.
- `footstep-dust`, `jump-puff`, `vault-dust`: Improved. Darker and wider open strokes are visible in the full-size middle samples and the reduced sheets. They remain small support marks. No count increase is needed from this evidence. Keep the final phone and moving-camera check open.
- `focus-pulse` and `danger-pulse`: The earlier similarity note remains. No new change was requested for these two effects.

No P0 or P1 blocker was found in this recheck. Normal-speed late fade, repeated triggers, and final phone gameplay remain outside this still-image review. No GPU or browser was used.

## Final source receipt

| File | SHA-256 |
|---|---|
| `src/runtime/effects.ts` | `54ca0c60521e82b049da97da5bd9bb8aa77aecb4f0f538bf99242475feb02c98` |
| `src/runtime/effects.test.ts` | `bd93b996baeda50fadd06c8c80f1dcd7e1118d624bb469b8365543d66e46f1f0` |
| `src/runtime/renderer.ts` | `16232abe2c15f453aa0f3366ebaefbc7ed82b2b6c3bae0c1087bd389a52159c0` |
| `scripts/render-previews.ts` | `ba7eda2ecf4601ef347dd868586fceea0cf44553488916c5fbdd86ccd9751346` |
| `scripts/pack-effect-sheets.py` | `456b50e37e2282ef29a816701150089ccb02fc656d847d90ff66f143f04b48c5` |
| `scripts/review-effect-scale.ts` | `5c5df20c8a494c0173a94dbaec40e5ac0d2978464e7c0ec5b6cbe731c3f29c27` |
| `docs/verification/polish/effect-review.html` | `6ea605316b42275aec39cbaf39b0df59a13f363496f4aad62f27c8af86126187` |
| `public/assets/effects/atlas.json` | `05de523da289d4794d82f115c30c61f3d8de2b2bb60b011194591374f09cf3ef` |
| `docs/verification/effect-frame-bounds.json` | `c3199c3a74eb6c351a39de6336f1d5608759360dc12d67618088597a07d6002b` |

## Sampled normal-speed film recheck

Inspected 36 timed frames from four final category reels: sword-cross, combo-rise, footstep-dust, and explosion. Each reel records two normal-speed bursts. The combined delivery film is 97.04 s and covers 64 effects. This recheck does not claim continuous playback or a second full 64-effect motion review.

The sample sheets are `effect-film-sword-cross-phone.jpg`, `effect-film-combo-rise-phone.jpg`, `effect-film-footstep-dust-phone.jpg`, and `effect-film-explosion-phone.jpg`. Each frame is resized to 354 pixels wide. This matches the video width on a 390-pixel phone after the review page padding. It tests the delivered film display size, not the live phone game camera. `effect-film-samples.json` records reel hashes and sample times. Times derived from the playback log are approximate; frame labels were checked to confirm each selected effect. The initial default-effect and next-effect frames in the footstep reel were excluded from the final sheet.

| Check | Result |
|---|---|
| Sword-cross short flash | Closed at this display size. The early X shape is clear in both bursts. Later samples shrink to clear space. |
| Explosion late fade | Closed for these samples. The flash gives way to open smoke strokes, then clear space. The second burst starts cleanly. No large hard cutoff appears between the selected late samples. |
| Repeated bursts | Closed for these four separated bursts. Clear intervals appear before repeats. This is not an overlapping-particle stress test. |
| Footstep dust at phone film width | Visible as a small mark near the foot in both bursts. Later samples fade. It remains a subtle support effect; live moving-camera contrast is still pending. |
| Combo-rise at phone film width | Remains limited. The upward marks overlap the arm and reduce to a few thin orange pixels. Full-size samples show the upward path, but this narrow film display does not make that path clear. A small lateral offset or stronger separated stroke would help if it must communicate a state alone. This is not a P0/P1 blocker. |

No new P0/P1 fault was found. These samples close the prior unobserved late-smoke and repeated-burst limits for the inspected effects. They do not close live phone gameplay, dense overlapping effects, or continuous temporal review of every recipe. No GPU or browser was used.

Film receipt:

- `public/review/effects-normal-speed.mp4` SHA-256: `6aecb4fe7f3f2ae33d8152beeb746161b0cc220c53838a6970441404af651c1b`.
- Recorded effect source SHA-256 from `effect-media.json`: `a9a4150115744f4231dc36e46a5961798081d0a39ed1b1bcb4eb4e1b307807fa`.
- The source changed after this film receipt for the wider combo-rise mark. That new status reel remains pending.

## Wider combo-rise film recheck

Inspected nine new frames from the refreshed status reel. The final sheet uses denser samples during the short visible rise and excludes the next effect. The samples now show a distinct orange mark beside the arm, rising from the lower chest toward the shoulder in both bursts. The clear intervals remain clean.

The wider tapered spark closes the insufficient-width concern at the 354-pixel film display size. It stays a small accent and does not hide the figure. Some front-view overlap with the arm remains, but it does not require another correction for this scope. The earlier statement that the phone-film width check was open is superseded by this recheck. Live phone game-camera readability remains outside this sampled film test.

This is a timed-frame review, not continuous playback. No P0/P1 blocker was found. No GPU or browser was used. `effect-film-combo-recheck.json` records the refreshed reel hash and exact extraction times.

- Refreshed status reel SHA-256: `af6af11d2b0b355c5e2b3b32baeeacab42d12e0fb341eb4fa8f32a5362b7f7d8`.
- Effect source SHA-256: `74f620b5f1f637bf8da581b472926d1828d9e1559325a675cd960b22fcb4c9c3`.
- The current fixed-scale capture report matches this source hash: `True`.
