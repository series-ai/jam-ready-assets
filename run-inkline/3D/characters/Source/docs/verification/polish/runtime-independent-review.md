# Independent runtime review

No new P0 or P1 correctness fault was found in the current runtime changes. The animation result remains pending until the corrected prototype and final assets are reviewed.

## Scope and result

Read the changes in `effects.ts`, `assets.ts`, and `renderer.ts`. Also read the effect tests and the atlas render/pack timing. This was a source review. No source was changed. The parent reported typecheck and 72 unit tests passed. This review did not rerun them.

- Effect position now derives from fixed start position, initial velocity, and elapsed particle age. The vertical term is `-0.5 * gravity * age²`. Negative gravity rises. Delayed particles remain hidden until their age reaches zero. This removes frame-step dependence without changing the delay contract.
- Effect scale applies to all distances: initial offset, velocity, gravity, size, and orbit radius. It does not alter time. The new per-layer angle is applied in both live generation and preview bounds. The paper core retains its outer star position and lifetime.
- Existing particle capacity and seven instance pools remain bounded. The new update terms use the existing scratch object. No new per-particle geometry or vector allocation appears in the update loop.
- `effectMaxDuration` covers the longest layer, maximum life variation, and maximum start delay. `effectAtlasDuration` multiplies this by 8/7. The last midpoint sample occurs at 7.5/7 of the maximum life bound, so the final atlas frame is clear. The Python packer records the same duration formula.
- The support-hand filter now includes only `rifle-idle`, `rifle-fire`, and `shotgun-fire`. It releases `rifle-reload` to the authored arm path. The existing bow branch remains separate. The actual prototype capture confirms that the reload hand now moves.
- Jump playback no longer uses fixed 0.16/0.23 s offsets. It derives the start from the named takeoff phase and holds for the remaining clip duration. This avoids offsets outside a shorter clip.
- The movement effect scale changes are finite positive constants. Trigger frequency, cooldowns, and pool capacity are unchanged.

## Jump integration check

Closed at the source level. `jumpStartTime` now selects the named `takeoff` phase. `moveBody` applies jump velocity before playback starts, so this selection aligns the initial airborne motion with extension. The remaining hold is the clip duration minus that start time.

The corrected prototype places takeoff at 0.200 s. Head Y rises from 1.243 m at load to 1.442 m at takeoff and 1.695 m at clear. The exact phase captures show extension after load. The final game jump still needs its normal runtime capture, but the previous load-after-launch source condition is removed.

## Limits

This review does not certify final phone effect contrast, normal-speed late fades, reload transition smoothness across every body, or new animation/physics alignment. Those checks require the revised artifacts and runtime capture. Existing effect sheet findings remain in `effect-independent-review.md`.

## Source receipt

| File | SHA-256 |
|---|---|
| `src/runtime/effects.ts` | `a9a4150115744f4231dc36e46a5961798081d0a39ed1b1bcb4eb4e1b307807fa` |
| `src/runtime/assets.ts` | `d66fdb9a58b2ccac49c7c398db3120314bffa0e0098c9f74e239901c57dd4e51` |
| `src/runtime/renderer.ts` | `92c7a9c2eefcf497bb1a322bdb31cde62382cb3076f2f66270f24ef550efb2b8` |
| `src/runtime/effects.test.ts` | `bd93b996baeda50fadd06c8c80f1dcd7e1118d624bb469b8365543d66e46f1f0` |
| `scripts/render-previews.ts` | `adf73ec67923e52eba271d1230a00ef69c5509523260437a4555179562167c67` |
| `scripts/pack-effect-sheets.py` | `0decaeb84d511d6580b589f102859d25685c96ed68b0059f4bb05bb9aeb3fc39` |

## Manifest phase retention recheck

No P0/P1 fault was found in the parser correction. The previous parser dropped `motion`, which meant the renderer could not find the authored takeoff phase. The parser now retains the runtime phase list. It validates each phase object, a nonempty name, a finite positive frame, and a time within the clip. Fractional frames remain valid for authored gait phases. The runtime type requests only phases, so dropping the export-only support fields here is consistent with that type.

The added test proves that a takeoff phase survives parsing and that an out-of-range phase is rejected. A separate read-only check parsed the current prototype animation catalog through the real parser, with the existing manifest model list. It returned all 85 clips. The jump takeoff phase remained at frame 6, or 0.200 s. The renderer therefore selects 0.200 s and holds the remaining 0.067 s of the 0.267 s clip. It no longer uses the fallback for this export.

This closes the earlier source-level assumption that phase data reached the renderer. The final game capture is still required. No GPU or browser was used for this check.

Current parser receipt:

- `src/catalog.ts` SHA-256: `8b6c474f5778930c44715f5872cff1b92160739d6ae154fd7c30a2745e874918`.
- `src/catalog.test.ts` SHA-256: `ab6ac8ee60b9c4d3c36e7960a257102c5523d6cc3a9be3acdc560e670e1504d2`.
- `src/runtime/renderer.ts` SHA-256: `92c7a9c2eefcf497bb1a322bdb31cde62382cb3076f2f66270f24ef550efb2b8`.
- `src/types.ts` SHA-256: `3a7f9ba8e88e9d75db55c60b94621b2441de39989467eedfd6f1183277e0559d`.
