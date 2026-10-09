# INKLINE prop surface visibility triage

Result: **PASS**.

The broad report contains 1229 pairs: 8 have same-facing normals and 1221 have opposed normals.
Normal-ray samples find 0 exposed pairs and 1229 occluded pairs.

Normal-ray samples classify reported triangle overlaps inside one GLB. Both normal signs are tested because materials are double-sided. A blocked normal ray does not prove invisibility from every oblique camera direction.
