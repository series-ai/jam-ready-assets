# INKLINE prop surface verification

Result: **PASS**.

Scanned 291 GLB files. Found 0 near-coplanar differently-colored triangle overlaps in 0 files.

The default scan requires one triangle to use `InkMat_SafetyOrange`. Use `--all-materials` for a broad material audit.

The check uses a plane gap of `1e-05` m, a normal tolerance of `0.0001`, and a minimum projected overlap of `1e-08` m².

The check covers triangle pairs inside one GLB. It does not cover curved contact, volume intersections, edge-only contact, cross-file placement, or renderer depth precision.
