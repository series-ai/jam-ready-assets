# Runtime travel-loop verification

Result: **PASS**.

The check uses the actual 12 character GLBs in `public/assets/characters`,
Three.js `AnimationMixer`, and the actual
`InklineRenderer.prototype.updateActorAnimation` method. It does not create a
WebGL renderer or open a browser.

Run the check from the showcase root:

```sh
npx tsx docs/verification/correction/verify-runtime-travel-loop.ts
```

The report covers 10 exported `travelSpeed` clips at 30, 60, and 120 Hz and
effective animation rates 0.5, 1, and 2. Each of the 1,080 scenarios runs at
least six complete active-cycle wraps. The action time never falls below the
first authored key. The maximum phase error is
`1.23e-15` seconds. All sampled object transforms are finite.

The check also covers all 31 nontravel clips with authored contact times on
all 12 bodies. It runs 372 contact checks at 30 Hz. Every observed contact
matches the exported frame time and the manifest contact time within the
existing `0.00051` second metadata tolerance. No contact occurs one frame
early.

The machine-readable result is
`runtime-travel-loop.json`. It records the manifest hash, renderer hash, and
hash for each checked character GLB. The checked manifest is version `1.3.0`.

The check does not prove GPU depth behavior, visual foot contact, equipment
contact, or camera behavior. It uses a fixture around the exact renderer
prototype method, so it does not exercise renderer construction or the browser
frame loop. The runtime still derives the active-cycle start from
`clip.tracks[0]`; the check compares that value with the earliest key on every
track and fails if they differ. All current travel clips pass this condition.
