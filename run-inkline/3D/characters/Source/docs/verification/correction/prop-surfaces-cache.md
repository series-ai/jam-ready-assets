# Prop surface correction cache

The source correction is in `scripts/blender/props.py`. The eight exposed
same-facing cases were local join planes. The fixes keep the prop IDs, mesh
primitive counts, attachment axes, and outer bounds.

The changed builders are:

- `build_roof_cable_bridge`: the support box depth is `2.18` m. The support
  end caps are inside the deck end faces.
- `build_walkway_rail_kickplate`: the toe board is centered at `y=-0.02` m
  with depth `0.04` m. Its faces are inside the rail foot tangent planes.
- `build_walkway_bridge_narrow`: both support beams end at `y=+/-2.99` m.
- `build_service_bay_arch`: foot plates use `z=0.0605` m and depth `0.119` m.
  The header web uses `0.018` m thickness.
- `build_service_bay_workbench`: the back stop width is `2.198` m.
- `build_loading_platform_ramp`: the loading box depth is `0.48` m. Both
  rail centerlines end at `y=+/-1.97` m. Their ramp-end heights are `0.0025`
  m and `0.9975` m.
- `build_loading_gate`: the post uses center `z=0.6505` m and depth `1.299`
  m. The base plate keeps the original outer floor bound.
- `build_utility_cabinet_low`: both feet use center `z=0.0805` m and depth
  `0.159` m.

The source was exported with Blender 5.1.0 to the temporary directory
`.cache/props-surface-fix`. The export contains 291 GLBs, 291 catalog entries,
and `source/industrial.blend`. The public asset directory was not written by
this pass.

The cache category counts and maximum triangle counts are weapons 26/488,
city 26/592, parkour 22/564, sports 16/496, sci-fi 16/900, and industrial
185/1712.

The orange-only CPU check passed:

```text
291 files, 0 findings, 0 parse errors
```

The all-material check reports 1,229 pairs in 68 files. The persisted
visibility check classifies 8 pairs as same-facing and 1,221 as opposed-normal
joins. All 1,229 pairs are occluded by the normal-ray samples. It reports zero
externally exposed pairs. It tests overlap interior samples in both normal
directions. A blocked normal ray does not prove invisibility from every
oblique camera direction.

The reports are:

- `prop-surface-fix-orange.json` and `prop-surface-fix-orange.md`
- `prop-surface-fix-all.json` and `prop-surface-fix-all.md`
- `prop-visible-surface-fix.json`

The final source SHA-256 is
`f247d02a4f0bb450e0a76dfcbde5adcec166cf082ba3dd18525f3ec901d6ab55`.
