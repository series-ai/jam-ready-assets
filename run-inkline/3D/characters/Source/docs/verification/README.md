# INKLINE 1.4.5 verification

The current correction addresses elbow and knee compression. Final evidence is in `joints/`. The joint-shape check (regenerable with `scripts/verify-joint-shape.ts`; raw trace not committed) passes 14,520 checks across all 12 bodies. Each body has 2,416 triangles, ten surface parts, and 18 bones. `ground-rebake.json` records the two forward-recovery clearance exceptions. Prior motion, contact, stance, firearm, reload, grip, avatar, spine, style, and timing checks pass. Saved standard-body black, thin pale, and 390 px views support the visual review. The review does not claim continuous film review or a new Android benchmark. Read [the joint shape notes](../joint-shape.md). Archive and local delivery results remain separate.

The 1.4.4 correction lowered the rifle and shotgun to the lower chest. Its reports and recordings are in `gun-height/`. The checks measure gun height, arm reach, support contact, pump motion, and reload contact. Read [the gun height notes](../gun-height.md).

The 1.4.3 correction covers the block stance. Its evidence is in `block/`. The new stance check measures foot spacing, knee bend, torso angle, height, and foot contact. Read [the block notes](../block-stance.md).

The previous correction covers standing foot contact and the demo landing hold. Read [the contact notes](../foot-contact.md). Its reports and recordings are in `feet/`. `feet/foot-contact.json` checks both expected feet independently of the exported support list.

The previous correction covered combat stance, rifle fit, shotgun fit, pump motion, and magazine contact. Read [the correction notes](../combat-stance.md). Those reports and recordings are in `stance/`. The final file hashes are in `correction/final-review.json`. Earlier 1.4.0 results remain below as historical evidence.

- `stance/combat-stance.json` checks seven attack clips on all twelve bodies.
- `stance/firearm-quality.json` checks gun fit, aim, hand contacts, recoil, and moving parts.
- `stance/reload-support.json` checks reload contacts and the free middle section.
- The stance motion check (regenerable with `scripts/verify-motion-quality.ts`; raw trace not committed) covers the full motion set and foot contacts.
- `stance/figure-final-media.json` binds the three new normal-speed recordings to their source files.

# Historical 1.4.0 verification

This pass reviews all 64 effects and all 85 clips. Read [the pass notes](../effects-motion-polish.md). Current reports are in `polish/`.

- `effect-quality.json` checks all 64 effect lifetimes and counts. `effect-frame-bounds.json` in the parent directory checks all 512 atlas frames.
- the motion-quality check (regenerable with `scripts/verify-motion-quality.ts`; raw trace not committed), `grip-quality.json`, `motion-style.json`, `avatar-contact.json`, and `line-quality.json` check the final 12 character files.
- `timing-contract.json` compares the included 1.3.1 timing baseline with the new catalog and GLBs. Timing changes are intentional.
- `reload-support.json` checks that the reload hand remains free and the firing grip stays attached.
- `figure-final-media.json` and `effect-media.json` record all 85 clips and all 64 effects at normal speed.
- `animation-final-review.md`, `effect-independent-review.md`, and `runtime-independent-review.md` state the visual review scope and limits.
- `browser-benchmark.json` and `game-performance.json` record current desktop measurements. Physical Android remains unverified.
- `review-page.json` checks 390 px and 1440 px layouts and video playback. `game-visual.json` checks the live jump and records phone views.
- `polish-delivery.json` is the final receipt. It is outside both archives.

The top-level asset, browser test, motion bounds, export, source extraction, installation, and local delivery reports are refreshed for this release. `correction/final-review.json` binds the final source, models, and review files. Intermediate and prototype reports remain named as such.

# Earlier 1.3 verification

The earlier character follow-up is **1.3.1**. Read [the joint and spine report](correction/line-refinement.md), `correction/line-quality.json`, the line motion-quality check (regenerable with `scripts/verify-motion-quality.ts`; raw trace not committed), and `correction/line-delivery.json`. Earlier camera and timed performance reports identify their exact 1.3.0 file hashes. They are historical evidence for those files.

The checks use the exported files and the running app. Read [the correction summary](correction/correction-summary.md) for the seven reported faults, [the style assessment](../style-correction.md) for the reference comparison, and [the figure report](correction/figure-correction.md) for the motion changes.

## Earlier evidence

- `asset-report.json` checks 12 characters, 291 props, and 85 clips per character. It checks geometry, weights, loop endpoints, materials, and preview files.
- The correction motion-quality check (regenerable with `scripts/verify-motion-quality.ts`; raw trace not committed) covers all 1,020 body/clip pairs. It measures the shared branch points, floor clearance, declared foot plants, and 24 fall-to-recovery boundaries. Grounded motion is sampled at 240 Hz.
- `correction/release-compatibility.json` compares the prior release with the new files. It checks the original 84 clip IDs, durations, contact times, loop flags, and 18 bone names. `get-up-forward` is the new clip. The pose tracks intentionally change.
- `correction/avatar-contact.json` checks floor clearance after avatar deformation. `correction/head-connection.json` checks the neck connection at the head-size limits. `correction/bow-string.json` checks draw, release, endpoints, and geometry ownership.
- `correction/runtime-travel-loop.json` checks ten travel cycles on all bodies at three update rates and three playback rates. It also checks the contact clock for non-travel actions.
- `expansion/contact-poses.json` checks mounted weapon directions. `kinetic/contact-poses.json` checks contact placement in the running app.
- The camera-motion check (regenerable with `scripts/verify-camera-motion.ts`; raw trace not committed) covers camera continuity and rendered figure visibility. Raw blocked joint data remain in the report. A local foreground cutaway can make a figure visible while the original scene triangles still block a ray.
- The camera-final-continuity check (regenerable with `docs/verification/correction/camera-final-continuity.mjs`; raw trace not committed) records 16 continuous routes. `correction/camera-cutaway-cpu.json` checks the primary and target cutaway state. `correction/runtime-cutaway-final.md` records the independent source review.
- `correction/camera-integration-browser.json` checks zoom, resize, near-plane clearance, overview framing, and paused reset. `correction/camera-performance.json` measures the low-ceiling camera case at normal and reduced CPU speed.
- `correction/outline/report.json` checks pale and black figures in four cameras at desktop and phone sizes. It includes repeated color changes and resource counts.
- The reaction-direction check (regenerable with `scripts/verify-reaction-direction.ts`; raw trace not committed) covers hits from six directions, final fall position, recovery choice, and restored health.
- `correction/prop-surfaces.json` checks all 291 prop GLBs for coincident faces involving orange material. The broader material scan and normal-ray visibility check identify exposed structural overlaps. `correction/prop-surface-render-review.md` records the close, orbit, and district image review.
- `correction/scene-orange-surfaces.json` checks orange surface overlaps between separate placed objects in all three scene GLBs. It records world-space object names and sampled normal-ray visibility. An occluded normal ray does not prove that every oblique view is clear.
- `motion-bounds.json` samples all 1,020 body/clip pairs at 60 Hz. It checks finite positions and the full motion envelope.
- `correction/header-final.json` checks the title and controls at eight viewport widths, including both responsive boundaries. `correction/header-review.md` records the source review.
- `browser-tests.json` covers search, downloads, saved avatars, seek, equipment selection, mode changes, touch controls, error recovery, and stale requests.
- `art-pass/art-pass.json` checks real-input route travel, hit timing, one damage event per hit, reset cancellation, and rendered visibility at seven checkpoints in four cameras and two viewport sizes.
- `expansion/level-support.json` checks the exported scene surfaces. The extra scenes remain visual assemblies; their layout data does not supply game collision.

The check scripts stay in `scripts/`. Diagnostic reproductions stay in `correction/`. Use the image paths listed in each current report. Other files can record intermediate work. Many use `before`, `baseline`, or `prototype` in their names. Historical reports in `art-pass`, `expansion`, and `kinetic` describe earlier releases unless the current evidence list above names them.

## Performance and delivery

Read [performance.md](../performance.md) for measured desktop results and device limits. The benchmark records source and model hashes. The camera timing check takes its image samples outside the timed interval.

`export-integrity.json` checks every staged file, relative reference, sprite sheet, and ZIP entry. `source-unpack-check.json` checks the extracted source and compares measured runtime and model hashes with the archive. `installation.json` checks the local installed pack. `local-delivery.json` checks the served download bytes. `package-acceptance.json` is the final receipt outside both archives.

The review index contains the current tour, a comparison with release 1.2, phone footage, and still images. The linked motion review shows all 85 clips without effects. `correction/motion-library-published.json` lists their recordings, clip IDs, durations, and hashes. The generated concept sheet sets a direction. It is not a render of the delivered models.

## Review limits

The review includes deterministic checks and an independent in-session source review. Automatic approval review rejected transfer of private source to an external review service. That external review did not run.

No physical 2022 Android device test, remote deployment, or publication is claimed. Desktop tests and CPU throttling do not replace the device test.

## Raw traces, receipts and media policy

Machine-generated QA output is **not committed**:

- Raw trace/receipt JSONs and JSONL (per-frame camera routes, per-sample motion dumps, per-check
  reports) are ignored via `.gitignore` (`/docs/verification/**/*.json`, `*.jsonl`). Regenerate
  them with the committed harnesses: `scripts/verify-motion-quality.ts <assetsDir> <reportPath>`,
  `scripts/verify-joint-shape.ts`, `scripts/verify-camera-motion.ts`,
  `scripts/verify-reaction-direction.ts`, and the committed `docs/verification/correction/*.mjs`
  harnesses. The `scripts/write-*-review.py` receipts fail loudly with the regenerating command
  when an input is missing.
- Verification media is committed only when a committed report links it (contact sheets,
  before/after pairs, and the three final normal-speed reels in `joints/`). Per-frame dump
  sequences and superseded per-pass reel copies are not committed; regenerate them with
  `scripts/record-polish-media.py`, `scripts/build-effect-review-sheets.py`, and the committed
  capture scripts. `export-pack.ts` copies its evidence subset from here, so run those
  regenerators before rebuilding the pack from a clean clone.

The measured numbers live in the committed `.md` reports in this directory and in
`docs/character-contract.md`, `docs/performance.md`, and the per-pass contract documents.
