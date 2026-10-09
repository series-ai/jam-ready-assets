# INKLINE assembled scene orange surface verification

Result: **PASS**.

Scanned 3 assembled scene GLBs with 332 placed objects and 38980 world-space triangles.
The orange-only check found 6 cross-object near-coplanar pairs: 0 exposed by the bounded normal-ray test and 6 normal-occluded.

Triangle references in this report use `global_index` plus the placed node label. Mesh-local `primitive` and `index` values are included only as local detail.

Settings: plane gap `1e-05` m, normal tolerance `0.0001`, minimum overlap `1e-08` m², normal-ray offset `0.0001` m.

Orange-involved near-coplanar triangle pairs between separate placed objects in assembled scene GLBs. World-space triangle records preserve node labels and global indices.

## industrial-district.glb

- Objects: `148`; world triangles: `18324`; orange triangles: `3212`.
- Candidate pairs: `13346`; cross-object findings: `2`; visible: `0`; normal-occluded: `2`.
- SHA-256: `1fa71aae4b05e5c0a343ec90c2eb54dade4ead81ced2f28913131d509a483b2e`.

### normal-occluded overlap at `[2.899999976158142, 0.987500011920929, 5.4856677723703555]`

- Objects: `platform-low-001` and `ramp-low-001`.
- Global triangles: `16396` and `16353`.
- Materials: `InkMat_OffWhite` and `InkMat_SafetyOrange`.
- Projected overlap: `0.00020931` m²; plane gap: `9.62189e-09` m.
- Exposed normal rays: `0`.

### normal-occluded overlap at `[5.100000014219965, 0.9888071285331822, 5.4856677723703555]`

- Objects: `ramp-low-001` and `platform-low-001`.
- Global triangles: `16356` and `16393`.
- Materials: `InkMat_SafetyOrange` and `InkMat_OffWhite`.
- Projected overlap: `0.000183882` m²; plane gap: `9.62189e-09` m.
- Exposed normal rays: `0`.

## roof-works.glb

- Objects: `103`; world triangles: `10808`; orange triangles: `1872`.
- Candidate pairs: `7358`; cross-object findings: `4`; visible: `0`; normal-occluded: `4`.
- SHA-256: `d1ab5d1066e20dbc7a4047ea450195d048f53af2997a5ff9a123a15d5e61eeb4`.

### normal-occluded overlap at `[3.3999999993967545, 3.8928570716400044, -0.2857139732414945]`

- Objects: `walkway-stair-short-001` and `walkway-bridge-narrow-001`.
- Global triangles: `6414` and `5914`.
- Materials: `InkMat_SafetyOrange` and `InkMat_OffWhite`.
- Projected overlap: `0.00714287` m²; plane gap: `4.48029e-07` m.
- Exposed normal rays: `0`.

### normal-occluded overlap at `[3.400000012832639, 3.852857074396719, -0.385713978295476]`

- Objects: `walkway-stair-short-001` and `walkway-bridge-narrow-001`.
- Global triangles: `6415` and `5914`.
- Materials: `InkMat_SafetyOrange` and `InkMat_OffWhite`.
- Projected overlap: `0.0168571` m²; plane gap: `4.48029e-07` m.
- Exposed normal rays: `0`.

### normal-occluded overlap at `[3.399999932217362, 3.8728570837670677, 0.2142858252202209]`

- Objects: `walkway-stair-short-001` and `walkway-bridge-narrow-001`.
- Global triangles: `6414` and `5915`.
- Materials: `InkMat_SafetyOrange` and `InkMat_OffWhite`.
- Projected overlap: `0.0328571` m²; plane gap: `4.48029e-07` m.
- Exposed normal rays: `0`.

### normal-occluded overlap at `[3.399999962927947, 3.8371427980752935, -0.014285550718538079]`

- Objects: `walkway-stair-short-001` and `walkway-bridge-narrow-001`.
- Global triangles: `6415` and `5915`.
- Materials: `InkMat_SafetyOrange` and `InkMat_OffWhite`.
- Projected overlap: `0.0231428` m²; plane gap: `4.48029e-07` m.
- Exposed normal rays: `0`.

## service-yard.glb

- Objects: `81`; world triangles: `9848`; orange triangles: `2020`.
- Candidate pairs: `6512`; cross-object findings: `0`; visible: `0`; normal-occluded: `0`.
- SHA-256: `fcaaeed0f89f7757a5d974efb953200707dc7fceea01dd1041995c528ecd0011`.

The visibility test samples the overlap center and points toward overlap vertices. It tests both signs of the first triangle normal because scene materials are double-sided.

A normal-occluded pair is not proof that every oblique camera ray is blocked. This check does not replace a renderer review.

## Roof correction

The first assembled-scene scan found 20 exposed orange overlaps between warehouse caps and roof slabs. Six Roof Works warehouse instances now have height 3.99 metres. Their bases remain at zero. The roof top and all roof contact points remain at 4 metres. The rebuilt GLB and editable Blender scene use the same placement data. The final scan has no exposed orange pairs. The six remaining pairs are occluded in the sampled normal directions.
