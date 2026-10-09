# Roof placement source review

Date: 27 September 2026.

No P0 or P1 contact or placement fault was found in the six Roof Works bay height changes. No source changed during this review.

## Evidence

I read the final `ROOF_WORKS_PLACEMENTS`, roof actors, effects, and inspection route in `src/runtime/layouts.ts`. I also read the instance scaling in `district.ts`, static geometry bake in `assets.ts`, clearance construction in `camera.ts`, and the bay and slab builders in `scripts/blender/props.py`.

All six `warehouse-bay` placements now request size `[8, 3.99, 8]`. Their positions retain Y=0. Their X and Z dimensions and positions remain unchanged. The roof floor still uses `floorGrid(3.84)` with slab height 0.16. Roof props, actors, and route points retain their prior heights, including the raised service route.

I read the position accessor bounds from the actual exported GLBs. Both models have a single mesh node without a node transform. The bay spans Y=0 to 5.199999809. The slab spans Y=0 to 0.204999998. Their manifest heights are 5.2 and 0.205.

`createDistrict` scales each axis by requested size divided by manifest size. Thus the final bay spans Y=0 to 3.989999854. The roof slab spans Y=3.84 to 3.999999999. The cap is approximately 0.010000145 metres below the slab top. It sits inside the slab thickness. The change does not create a gap between the cap and the slab or lower the roof contact surface.

The static bake applies the complete instance world matrix to geometry. Camera clearance copies that same world matrix before baking. The corrected height therefore applies to both rendered geometry and camera obstruction geometry.

## Source and asset hashes

| File | SHA-256 |
| --- | --- |
| `src/runtime/layouts.ts` | `f3a6c7df9a5504699f4311ad319a88ab7330528d66f5f62d1188607b5b676bd2` |
| `src/runtime/district.ts` | `2bafc41073229b7d77f20d3dedba1413d8e1a8da33675a1886c63b351e3f31b7` |
| `public/assets/props/warehouse-bay.glb` | `a0b88d391cb6e0ccd091dacef67df970cac1ef5c46e7737929f8250ac7f8497e` |
| `public/assets/props/floor-slab.glb` | `9e37a01b64b6c73966f5632356966621b540b992be44ffffcaa3bf7d0b02bef7` |

## Limits

This review used source, exported bounds, and numerical calculations. I did not use a browser or GPU. I did not rerun the triangle overlap scan or inspect a new render. Final rendered surface quality remains with the surface verification report.
