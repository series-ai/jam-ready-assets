# Runtime firearm correction

Implemented the shared firearm data in `src/runtime/firearms.json`. Runtime mount scale uses the reference pose arm length. The grip origin stays at the palm. The shotgun pump and support target move together from a stored rest position. The pump resets on clip change. Rifle reload releases support contact in the middle and restores it at both ends. Its named magazine mesh follows the left palm from reach through insertion and resets at all other times.

The runtime uses the same left elbow plane as the Blender bake. Other held weapons retain their prior mounting and support rules. Export now includes the shared JSON. The consumer check enables JSON imports and includes the JSON hash in its receipt.

## Verification

- TypeScript check passed.
- All 73 unit tests passed after the magazine follow change.
- Standard prototype: all 124 firearm checks passed.
- Standard reload: both checks passed. Endpoint grip error was below 0.001 mm. The middle hand remained free with 0.241 m maximum separation.
- Rifle stock separation was about 20 mm. Shot-event aim error was below 0.001°. Rifle and shotgun recoil peaks were 3° and 8°, after the shot event.
- Pump movement, repeated evaluation, clip reset, and actual pump-mesh contact passed.
- Magazine mesh contact passed at reach, withdrawal, and insertion. Withdrawal error was below 0.005 mm. Reach and insertion rest error was below 0.003 mm. Repeated evaluation caused no drift.
- The runtime entry point compiled with the exported-consumer compiler flags.
- Current old family artifacts failed the new stock and aim checks before regeneration. See `firearm-quality-before.json`.

Final 1.4.1 family: all 1,488 firearm checks and all 24 reload checks passed. Final TypeScript check passed. Receipts are `docs/verification/stance/firearm-quality.json` and `reload-support.json`. The exported consumer browser check remains with the parent agent after package export. No visual claim is made from CPU measurements alone.

## Files

- `src/runtime/assets.ts`
- `src/runtime/firearms.json`
- `scripts/verify-firearms.ts`
- `scripts/verify-reload-support.ts`
- `scripts/export-pack.ts`
- `scripts/verify-consumer.ts`
- `scripts/verify-delivery.py`
- `scripts/verify-export.py`

## Receipt

- `src/runtime/assets.ts`: `75cc8507ef8dcf46c18397bf4c2447c5265be1eeb3a970abe6709b04ed472240`
- `src/runtime/firearms.json`: `8984f42a9f943dd64cf3cbbe950b606cc042e60da32d8be58940170a954753cf`
- `scripts/verify-firearms.ts`: `92f007c4d70795b12a73200d1d11d9babd2d4a04a18966dc6478d84130c5c668`
- `scripts/verify-reload-support.ts`: `9640d6e282568e2bb6775e0178799bd5f5602474d326a3cf7425e7b967edf5d2`

## Final family measurements

- Maximum support-palm gap: 0.00114 mm.
- Maximum reload endpoint gap: 0.000422 mm.
- Maximum magazine withdrawal error: 0.0258 mm.
- Maximum magazine rest error at reach or insertion: 0.0256 mm.
- Maximum shot-event pitch or yaw error: 0.000755°.
- Recoil peaks: 3° for rifle and 8° for shotgun, after contact.
- Maximum stock distance: 49.17 mm on the large sentinel with shotgun in rifle-idle. The maximum arm-normalized distance is 39.57 mm, below the 45 mm scaled check limit. This includes the small difference between the shared rifle idle and the smaller shotgun stock.

No runtime changes were required after the final family test.
