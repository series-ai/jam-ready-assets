# INKLINE prop surface verification

Result: **FAIL**.

Scanned 291 GLB files. Found 1229 near-coplanar differently-colored triangle overlaps in 68 files.

The default scan requires one triangle to use `None`. Use `--all-materials` for a broad material audit.

The check uses a plane gap of `1e-05` m, a normal tolerance of `0.0001`, and a minimum projected overlap of `1e-08` m².

The check covers triangle pairs inside one GLB. It does not cover curved contact, volume intersections, edge-only contact, cross-file placement, or renderer depth precision.

## balance-beam.glb

- `InkMat_OffWhite` triangle 1 overlaps `InkMat_StructuralGray` triangle 41 by `0.000186396` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 1 overlaps `InkMat_StructuralGray` triangle 42 by `0.000186396` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 1 overlaps `InkMat_StructuralGray` triangle 44 by `0.000899999` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 1 overlaps `InkMat_StructuralGray` triangle 45 by `0.000899999` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 1 overlaps `InkMat_StructuralGray` triangle 40 by `0.000186396` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 1 overlaps `InkMat_StructuralGray` triangle 43 by `0.000186396` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 0 overlaps `InkMat_StructuralGray` triangle 76 by `0.000186396` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 0 overlaps `InkMat_StructuralGray` triangle 77 by `0.000186396` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 0 overlaps `InkMat_StructuralGray` triangle 79 by `0.000899999` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 0 overlaps `InkMat_StructuralGray` triangle 74 by `0.000186396` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 0 overlaps `InkMat_StructuralGray` triangle 75 by `0.000186396` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 0 overlaps `InkMat_StructuralGray` triangle 78 by `0.000899999` m² at a plane gap of `0` m.

## bollard-retractable.glb

- `InkMat_StructuralGray` triangle 27 overlaps `InkMat_OffWhite` triangle 28 by `0.000306075` m² at a plane gap of `1.11759e-08` m.
- `InkMat_StructuralGray` triangle 29 overlaps `InkMat_OffWhite` triangle 28 by `0.00131043` m² at a plane gap of `1.11759e-08` m.
- `InkMat_StructuralGray` triangle 26 overlaps `InkMat_OffWhite` triangle 29 by `8.50651e-05` m² at a plane gap of `1.11759e-08` m.
- `InkMat_StructuralGray` triangle 29 overlaps `InkMat_OffWhite` triangle 29 by `0.00153144` m² at a plane gap of `1.11759e-08` m.
- `InkMat_StructuralGray` triangle 29 overlaps `InkMat_OffWhite` triangle 33 by `0.00941059` m² at a plane gap of `1.11759e-08` m.
- `InkMat_StructuralGray` triangle 29 overlaps `InkMat_OffWhite` triangle 32 by `0.0016165` m² at a plane gap of `1.11759e-08` m.
- `InkMat_StructuralGray` triangle 29 overlaps `InkMat_OffWhite` triangle 35 by `0.0152792` m² at a plane gap of `1.11759e-08` m.
- `InkMat_StructuralGray` triangle 26 overlaps `InkMat_OffWhite` triangle 30 by `8.50651e-05` m² at a plane gap of `1.11759e-08` m.
- `InkMat_StructuralGray` triangle 29 overlaps `InkMat_OffWhite` triangle 30 by `0.00153144` m² at a plane gap of `1.11759e-08` m.
- `InkMat_StructuralGray` triangle 29 overlaps `InkMat_OffWhite` triangle 34 by `0.00941059` m² at a plane gap of `1.11759e-08` m.
- `InkMat_StructuralGray` triangle 29 overlaps `InkMat_OffWhite` triangle 31 by `0.00131043` m² at a plane gap of `1.11759e-08` m.
- `InkMat_StructuralGray` triangle 28 overlaps `InkMat_OffWhite` triangle 31 by `0.000306075` m² at a plane gap of `1.11759e-08` m.

## cargo-container-short.glb

- `InkMat_StructuralGray` triangle 80 overlaps `InkMat_OffWhite` triangle 10 by `0.124096` m² at a plane gap of `0` m.
- `InkMat_StructuralGray` triangle 81 overlaps `InkMat_OffWhite` triangle 10 by `0.0589614` m² at a plane gap of `0` m.
- `InkMat_StructuralGray` triangle 57 overlaps `InkMat_OffWhite` triangle 10 by `0.00375477` m² at a plane gap of `0` m.
- `InkMat_StructuralGray` triangle 68 overlaps `InkMat_OffWhite` triangle 10 by `0.0735866` m² at a plane gap of `0` m.
- `InkMat_StructuralGray` triangle 69 overlaps `InkMat_OffWhite` triangle 10 by `0.155986` m² at a plane gap of `0` m.
- `InkMat_StructuralGray` triangle 56 overlaps `InkMat_OffWhite` triangle 11 by `0.155986` m² at a plane gap of `0` m.
- `InkMat_StructuralGray` triangle 57 overlaps `InkMat_OffWhite` triangle 11 by `0.0735866` m² at a plane gap of `0` m.
- `InkMat_StructuralGray` triangle 68 overlaps `InkMat_OffWhite` triangle 11 by `0.00375477` m² at a plane gap of `0` m.
- `InkMat_StructuralGray` triangle 118 overlaps `InkMat_OffWhite` triangle 20 by `0.00570177` m² at a plane gap of `3.72529e-08` m.
- `InkMat_StructuralGray` triangle 119 overlaps `InkMat_OffWhite` triangle 20 by `0.00212873` m² at a plane gap of `3.72529e-08` m.
- `InkMat_StructuralGray` triangle 106 overlaps `InkMat_OffWhite` triangle 21 by `0.00722653` m² at a plane gap of `3.72529e-08` m.
- `InkMat_StructuralGray` triangle 118 overlaps `InkMat_OffWhite` triangle 32 by `0.00396547` m² at a plane gap of `3.72529e-08` m.
- `InkMat_StructuralGray` triangle 119 overlaps `InkMat_OffWhite` triangle 32 by `0.00386503` m² at a plane gap of `3.72529e-08` m.
- `InkMat_StructuralGray` triangle 106 overlaps `InkMat_OffWhite` triangle 33 by `0.00545809` m² at a plane gap of `3.72529e-08` m.
- `InkMat_StructuralGray` triangle 107 overlaps `InkMat_OffWhite` triangle 33 by `0.00237241` m² at a plane gap of `3.72529e-08` m.
- `InkMat_StructuralGray` triangle 118 overlaps `InkMat_OffWhite` triangle 44 by `0.00221234` m² at a plane gap of `3.72529e-08` m.
- `InkMat_StructuralGray` triangle 119 overlaps `InkMat_OffWhite` triangle 44 by `0.00561816` m² at a plane gap of `3.72529e-08` m.
- `InkMat_StructuralGray` triangle 106 overlaps `InkMat_OffWhite` triangle 45 by `0.00370649` m² at a plane gap of `3.72529e-08` m.
- `InkMat_StructuralGray` triangle 107 overlaps `InkMat_OffWhite` triangle 45 by `0.00412401` m² at a plane gap of `3.72529e-08` m.
- `InkMat_StructuralGray` triangle 119 overlaps `InkMat_OffWhite` triangle 56 by `0.00738813` m² at a plane gap of `3.72529e-08` m.
- `InkMat_StructuralGray` triangle 106 overlaps `InkMat_OffWhite` triangle 57 by `0.00197172` m² at a plane gap of `3.72529e-08` m.
- `InkMat_StructuralGray` triangle 107 overlaps `InkMat_OffWhite` triangle 57 by `0.00585878` m² at a plane gap of `3.72529e-08` m.
- `InkMat_OffWhite` triangle 11 overlaps `InkMat_StructuralGray` triangle 92 by `0.0589614` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 11 overlaps `InkMat_StructuralGray` triangle 93 by `0.124096` m² at a plane gap of `0` m.

## cargo-container.glb

- `InkMat_StructuralGray` triangle 80 overlaps `InkMat_OffWhite` triangle 10 by `0.124201` m² at a plane gap of `0` m.
- `InkMat_StructuralGray` triangle 81 overlaps `InkMat_OffWhite` triangle 10 by `0.060145` m² at a plane gap of `0` m.
- `InkMat_StructuralGray` triangle 57 overlaps `InkMat_OffWhite` triangle 10 by `0.00768849` m² at a plane gap of `0` m.
- `InkMat_StructuralGray` triangle 68 overlaps `InkMat_OffWhite` triangle 10 by `0.149649` m² at a plane gap of `0` m.
- `InkMat_StructuralGray` triangle 69 overlaps `InkMat_OffWhite` triangle 10 by `0.315785` m² at a plane gap of `0` m.
- `InkMat_StructuralGray` triangle 56 overlaps `InkMat_OffWhite` triangle 11 by `0.315785` m² at a plane gap of `0` m.
- `InkMat_StructuralGray` triangle 57 overlaps `InkMat_OffWhite` triangle 11 by `0.149649` m² at a plane gap of `0` m.
- `InkMat_StructuralGray` triangle 68 overlaps `InkMat_OffWhite` triangle 11 by `0.00768849` m² at a plane gap of `0` m.
- `InkMat_StructuralGray` triangle 118 overlaps `InkMat_OffWhite` triangle 20 by `0.00708614` m² at a plane gap of `3.72529e-08` m.
- `InkMat_StructuralGray` triangle 106 overlaps `InkMat_OffWhite` triangle 21 by `0.00783049` m² at a plane gap of `3.72529e-08` m.
- `InkMat_StructuralGray` triangle 118 overlaps `InkMat_OffWhite` triangle 32 by `0.00623235` m² at a plane gap of `3.72529e-08` m.
- `InkMat_StructuralGray` triangle 106 overlaps `InkMat_OffWhite` triangle 33 by `0.00777136` m² at a plane gap of `3.72529e-08` m.
- `InkMat_StructuralGray` triangle 118 overlaps `InkMat_OffWhite` triangle 44 by `0.0053744` m² at a plane gap of `3.72529e-08` m.
- `InkMat_StructuralGray` triangle 119 overlaps `InkMat_OffWhite` triangle 44 by `0.00245609` m² at a plane gap of `3.72529e-08` m.
- `InkMat_StructuralGray` triangle 106 overlaps `InkMat_OffWhite` triangle 45 by `0.00688823` m² at a plane gap of `3.72529e-08` m.
- `InkMat_StructuralGray` triangle 118 overlaps `InkMat_OffWhite` triangle 56 by `0.00451231` m² at a plane gap of `3.72529e-08` m.
- `InkMat_StructuralGray` triangle 119 overlaps `InkMat_OffWhite` triangle 56 by `0.0033182` m² at a plane gap of `3.72529e-08` m.
- `InkMat_StructuralGray` triangle 106 overlaps `InkMat_OffWhite` triangle 57 by `0.00600914` m² at a plane gap of `3.72529e-08` m.
- `InkMat_StructuralGray` triangle 118 overlaps `InkMat_OffWhite` triangle 68 by `0.00364605` m² at a plane gap of `3.72529e-08` m.
- `InkMat_StructuralGray` triangle 119 overlaps `InkMat_OffWhite` triangle 68 by `0.00418445` m² at a plane gap of `3.72529e-08` m.
- `InkMat_StructuralGray` triangle 106 overlaps `InkMat_OffWhite` triangle 69 by `0.0051342` m² at a plane gap of `3.72529e-08` m.
- `InkMat_StructuralGray` triangle 107 overlaps `InkMat_OffWhite` triangle 69 by `0.0026963` m² at a plane gap of `3.72529e-08` m.
- `InkMat_StructuralGray` triangle 118 overlaps `InkMat_OffWhite` triangle 80 by `0.00277564` m² at a plane gap of `3.72529e-08` m.
- `InkMat_StructuralGray` triangle 119 overlaps `InkMat_OffWhite` triangle 80 by `0.00505486` m² at a plane gap of `3.72529e-08` m.
- `InkMat_StructuralGray` triangle 106 overlaps `InkMat_OffWhite` triangle 81 by `0.00426341` m² at a plane gap of `3.72529e-08` m.
- `InkMat_StructuralGray` triangle 107 overlaps `InkMat_OffWhite` triangle 81 by `0.00356709` m² at a plane gap of `3.72529e-08` m.
- `InkMat_StructuralGray` triangle 118 overlaps `InkMat_OffWhite` triangle 92 by `0.00190108` m² at a plane gap of `3.72529e-08` m.
- `InkMat_StructuralGray` triangle 119 overlaps `InkMat_OffWhite` triangle 92 by `0.00592943` m² at a plane gap of `3.72529e-08` m.
- `InkMat_StructuralGray` triangle 106 overlaps `InkMat_OffWhite` triangle 93 by `0.00339678` m² at a plane gap of `3.72529e-08` m.
- `InkMat_StructuralGray` triangle 107 overlaps `InkMat_OffWhite` triangle 93 by `0.00443373` m² at a plane gap of `3.72529e-08` m.
- `InkMat_StructuralGray` triangle 119 overlaps `InkMat_OffWhite` triangle 104 by `0.00680814` m² at a plane gap of `3.72529e-08` m.
- `InkMat_StructuralGray` triangle 106 overlaps `InkMat_OffWhite` triangle 105 by `0.0025343` m² at a plane gap of `3.72529e-08` m.
- `InkMat_StructuralGray` triangle 107 overlaps `InkMat_OffWhite` triangle 105 by `0.0052962` m² at a plane gap of `3.72529e-08` m.
- `InkMat_StructuralGray` triangle 119 overlaps `InkMat_OffWhite` triangle 116 by `0.00769101` m² at a plane gap of `3.72529e-08` m.
- `InkMat_StructuralGray` triangle 107 overlaps `InkMat_OffWhite` triangle 117 by `0.00615452` m² at a plane gap of `3.72529e-08` m.
- `InkMat_StructuralGray` triangle 119 overlaps `InkMat_OffWhite` triangle 128 by `0.00783049` m² at a plane gap of `3.72529e-08` m.
- `InkMat_StructuralGray` triangle 107 overlaps `InkMat_OffWhite` triangle 129 by `0.00700869` m² at a plane gap of `3.72529e-08` m.
- `InkMat_OffWhite` triangle 11 overlaps `InkMat_StructuralGray` triangle 92 by `0.060145` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 11 overlaps `InkMat_StructuralGray` triangle 93 by `0.124201` m² at a plane gap of `0` m.

## catwalk-grate-long.glb

- `InkMat_OffWhite` triangle 36 overlaps `InkMat_StructuralGray` triangle 120 by `0.00016` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 36 overlaps `InkMat_StructuralGray` triangle 121 by `0.000639999` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 36 overlaps `InkMat_StructuralGray` triangle 162 by `0.00016` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 36 overlaps `InkMat_StructuralGray` triangle 163 by `0.00064` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 36 overlaps `InkMat_StructuralGray` triangle 202 by `0.000157339` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 36 overlaps `InkMat_StructuralGray` triangle 203 by `0.000564114` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 37 overlaps `InkMat_StructuralGray` triangle 203 by `7.58851e-05` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 52 overlaps `InkMat_StructuralGray` triangle 386 by `0.000157339` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 52 overlaps `InkMat_StructuralGray` triangle 387 by `0.000564114` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 53 overlaps `InkMat_StructuralGray` triangle 387 by `7.58851e-05` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 52 overlaps `InkMat_StructuralGray` triangle 432 by `0.00016` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 52 overlaps `InkMat_StructuralGray` triangle 433 by `0.00064` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 52 overlaps `InkMat_StructuralGray` triangle 466 by `0.00016` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 52 overlaps `InkMat_StructuralGray` triangle 467 by `0.000639999` m² at a plane gap of `0` m.

## catwalk.glb

- `InkMat_OffWhite` triangle 36 overlaps `InkMat_StructuralGray` triangle 120 by `0.00016` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 36 overlaps `InkMat_StructuralGray` triangle 121 by `0.00064` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 36 overlaps `InkMat_StructuralGray` triangle 162 by `0.00016` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 36 overlaps `InkMat_StructuralGray` triangle 163 by `0.00064` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 52 overlaps `InkMat_StructuralGray` triangle 344 by `0.00016` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 52 overlaps `InkMat_StructuralGray` triangle 345 by `0.00064` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 52 overlaps `InkMat_StructuralGray` triangle 386 by `0.00016` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 52 overlaps `InkMat_StructuralGray` triangle 387 by `0.00064` m² at a plane gap of `0` m.

## climbing-rope.glb

- `InkMat_StructuralGray` triangle 8 overlaps `InkMat_OffWhite` triangle 9 by `5.35898e-05` m² at a plane gap of `0` m.
- `InkMat_StructuralGray` triangle 9 overlaps `InkMat_OffWhite` triangle 9 by `0.000119615` m² at a plane gap of `0` m.
- `InkMat_StructuralGray` triangle 8 overlaps `InkMat_OffWhite` triangle 10 by `9.80762e-06` m² at a plane gap of `0` m.
- `InkMat_StructuralGray` triangle 9 overlaps `InkMat_OffWhite` triangle 10 by `0.000163397` m² at a plane gap of `0` m.
- `InkMat_StructuralGray` triangle 8 overlaps `InkMat_OffWhite` triangle 11 by `0.000283013` m² at a plane gap of `0` m.
- `InkMat_StructuralGray` triangle 9 overlaps `InkMat_OffWhite` triangle 11 by `0.000236603` m² at a plane gap of `0` m.
- `InkMat_StructuralGray` triangle 8 overlaps `InkMat_OffWhite` triangle 8 by `0.000173205` m² at a plane gap of `0` m.

## conveyor-incline.glb

- `InkMat_OffWhite` triangle 4 overlaps `InkMat_StructuralGray` triangle 4 by `0.227479` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 4 overlaps `InkMat_StructuralGray` triangle 5 by `0.0767059` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 5 overlaps `InkMat_StructuralGray` triangle 12 by `0.070297` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 5 overlaps `InkMat_StructuralGray` triangle 13 by `0.233887` m² at a plane gap of `0` m.

## crane-jib.glb

- `InkMat_OffWhite` triangle 2 overlaps `InkMat_StructuralGray` triangle 53 by `6.23536e-05` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 2 overlaps `InkMat_StructuralGray` triangle 54 by `6.23536e-05` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 2 overlaps `InkMat_StructuralGray` triangle 55 by `0.000187062` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 2 overlaps `InkMat_StructuralGray` triangle 52 by `6.23543e-05` m² at a plane gap of `0` m.

## crane.glb

- `InkMat_StructuralGray` triangle 8 overlaps `InkMat_OffWhite` triangle 17 by `7.17318e-05` m² at a plane gap of `0` m.
- `InkMat_StructuralGray` triangle 9 overlaps `InkMat_OffWhite` triangle 17 by `2.5696e-05` m² at a plane gap of `0` m.
- `InkMat_StructuralGray` triangle 9 overlaps `InkMat_OffWhite` triangle 18 by `9.74278e-05` m² at a plane gap of `0` m.
- `InkMat_StructuralGray` triangle 8 overlaps `InkMat_OffWhite` triangle 19 by `0.000131439` m² at a plane gap of `0` m.
- `InkMat_StructuralGray` triangle 9 overlaps `InkMat_OffWhite` triangle 19 by `0.000160845` m² at a plane gap of `0` m.
- `InkMat_StructuralGray` triangle 8 overlaps `InkMat_OffWhite` triangle 16 by `8.9113e-05` m² at a plane gap of `0` m.
- `InkMat_StructuralGray` triangle 9 overlaps `InkMat_OffWhite` triangle 16 by `8.31483e-06` m² at a plane gap of `0` m.

## crate-heavy-wooden.glb

- `InkMat_OffWhite` triangle 8 overlaps `InkMat_StructuralGray` triangle 10 by `0.00320513` m² at a plane gap of `2.23517e-08` m.
- `InkMat_OffWhite` triangle 9 overlaps `InkMat_StructuralGray` triangle 10 by `0.0767949` m² at a plane gap of `2.23517e-08` m.
- `InkMat_OffWhite` triangle 8 overlaps `InkMat_StructuralGray` triangle 11 by `0.0234615` m² at a plane gap of `2.23517e-08` m.
- `InkMat_OffWhite` triangle 9 overlaps `InkMat_StructuralGray` triangle 11 by `0.0565385` m² at a plane gap of `2.23517e-08` m.
- `InkMat_OffWhite` triangle 8 overlaps `InkMat_StructuralGray` triangle 22 by `0.0565385` m² at a plane gap of `2.23517e-08` m.
- `InkMat_OffWhite` triangle 9 overlaps `InkMat_StructuralGray` triangle 22 by `0.0234615` m² at a plane gap of `2.23517e-08` m.
- `InkMat_OffWhite` triangle 8 overlaps `InkMat_StructuralGray` triangle 23 by `0.0767949` m² at a plane gap of `2.23517e-08` m.
- `InkMat_OffWhite` triangle 9 overlaps `InkMat_StructuralGray` triangle 23 by `0.00320513` m² at a plane gap of `2.23517e-08` m.

## cryo-capsule.glb

- `InkMat_StructuralGray` triangle 26 overlaps `InkMat_OffWhite` triangle 28 by `0.00354878` m² at a plane gap of `8.9407e-08` m.
- `InkMat_StructuralGray` triangle 30 overlaps `InkMat_OffWhite` triangle 28 by `0.0268602` m² at a plane gap of `8.9407e-08` m.
- `InkMat_StructuralGray` triangle 25 overlaps `InkMat_OffWhite` triangle 29 by `0.00354878` m² at a plane gap of `8.9407e-08` m.
- `InkMat_StructuralGray` triangle 26 overlaps `InkMat_OffWhite` triangle 29 by `0.00354878` m² at a plane gap of `8.9407e-08` m.
- `InkMat_StructuralGray` triangle 29 overlaps `InkMat_OffWhite` triangle 29 by `0.00997904` m² at a plane gap of `8.9407e-08` m.
- `InkMat_StructuralGray` triangle 30 overlaps `InkMat_OffWhite` triangle 29 by `0.00997903` m² at a plane gap of `8.9407e-08` m.
- `InkMat_StructuralGray` triangle 31 overlaps `InkMat_OffWhite` triangle 29 by `0.00690211` m² at a plane gap of `8.9407e-08` m.
- `InkMat_StructuralGray` triangle 25 overlaps `InkMat_OffWhite` triangle 33 by `0.00219327` m² at a plane gap of `8.9407e-08` m.
- `InkMat_StructuralGray` triangle 26 overlaps `InkMat_OffWhite` triangle 33 by `0.00574205` m² at a plane gap of `8.9407e-08` m.
- `InkMat_StructuralGray` triangle 29 overlaps `InkMat_OffWhite` triangle 33 by `0.0196952` m² at a plane gap of `8.9407e-08` m.
- `InkMat_StructuralGray` triangle 30 overlaps `InkMat_OffWhite` triangle 33 by `0.124463` m² at a plane gap of `8.9407e-08` m.
- `InkMat_StructuralGray` triangle 31 overlaps `InkMat_OffWhite` triangle 33 by `0.0445048` m² at a plane gap of `8.9407e-08` m.
- `InkMat_OffWhite` triangle 19 overlaps `InkMat_StructuralGray` triangle 101 by `0.0339577` m² at a plane gap of `2.38419e-07` m.
- `InkMat_OffWhite` triangle 18 overlaps `InkMat_StructuralGray` triangle 102 by `0.0339577` m² at a plane gap of `2.38419e-07` m.
- `InkMat_OffWhite` triangle 22 overlaps `InkMat_StructuralGray` triangle 105 by `0.0759318` m² at a plane gap of `2.38419e-07` m.
- `InkMat_OffWhite` triangle 22 overlaps `InkMat_StructuralGray` triangle 106 by `0.0759318` m² at a plane gap of `2.38419e-07` m.
- `InkMat_OffWhite` triangle 22 overlaps `InkMat_StructuralGray` triangle 107 by `0.0469285` m² at a plane gap of `2.38419e-07` m.
- `InkMat_OffWhite` triangle 28 overlaps `InkMat_StructuralGray` triangle 27 by `0.00354878` m² at a plane gap of `8.9407e-08` m.
- `InkMat_OffWhite` triangle 33 overlaps `InkMat_StructuralGray` triangle 27 by `0.00219327` m² at a plane gap of `8.9407e-08` m.
- `InkMat_StructuralGray` triangle 105 overlaps `InkMat_OffWhite` triangle 23 by `0.12286` m² at a plane gap of `2.38419e-07` m.
- `InkMat_StructuralGray` triangle 106 overlaps `InkMat_OffWhite` triangle 23 by `0.0469284` m² at a plane gap of `2.38419e-07` m.
- `InkMat_StructuralGray` triangle 107 overlaps `InkMat_OffWhite` triangle 23 by `0.151864` m² at a plane gap of `2.38419e-07` m.
- `InkMat_StructuralGray` triangle 25 overlaps `InkMat_OffWhite` triangle 30 by `0.00354878` m² at a plane gap of `8.9407e-08` m.
- `InkMat_StructuralGray` triangle 29 overlaps `InkMat_OffWhite` triangle 30 by `0.0268602` m² at a plane gap of `8.9407e-08` m.
- `InkMat_StructuralGray` triangle 25 overlaps `InkMat_OffWhite` triangle 34 by `0.00219327` m² at a plane gap of `8.9407e-08` m.
- `InkMat_StructuralGray` triangle 29 overlaps `InkMat_OffWhite` triangle 34 by `0.124463` m² at a plane gap of `8.9407e-08` m.
- `InkMat_StructuralGray` triangle 31 overlaps `InkMat_OffWhite` triangle 34 by `0.0642` m² at a plane gap of `8.9407e-08` m.
- `InkMat_StructuralGray` triangle 25 overlaps `InkMat_OffWhite` triangle 35 by `0.00135551` m² at a plane gap of `8.9407e-08` m.
- `InkMat_StructuralGray` triangle 29 overlaps `InkMat_OffWhite` triangle 35 by `0.0340608` m² at a plane gap of `8.9407e-08` m.
- `InkMat_StructuralGray` triangle 30 overlaps `InkMat_OffWhite` triangle 35 by `0.053756` m² at a plane gap of `8.9407e-08` m.
- `InkMat_StructuralGray` triangle 31 overlaps `InkMat_OffWhite` triangle 35 by `0.225383` m² at a plane gap of `8.9407e-08` m.
- `InkMat_StructuralGray` triangle 27 overlaps `InkMat_OffWhite` triangle 35 by `0.00354878` m² at a plane gap of `8.9407e-08` m.
- `InkMat_OffWhite` triangle 20 overlaps `InkMat_StructuralGray` triangle 100 by `0.0339577` m² at a plane gap of `2.38419e-07` m.
- `InkMat_StructuralGray` triangle 106 overlaps `InkMat_OffWhite` triangle 21 by `0.0759318` m² at a plane gap of `2.38419e-07` m.
- `InkMat_StructuralGray` triangle 107 overlaps `InkMat_OffWhite` triangle 21 by `0.12286` m² at a plane gap of `2.38419e-07` m.
- `InkMat_StructuralGray` triangle 30 overlaps `InkMat_OffWhite` triangle 32 by `0.00997903` m² at a plane gap of `8.9407e-08` m.
- `InkMat_StructuralGray` triangle 31 overlaps `InkMat_OffWhite` triangle 32 by `0.0168811` m² at a plane gap of `8.9407e-08` m.
- `InkMat_StructuralGray` triangle 27 overlaps `InkMat_OffWhite` triangle 32 by `0.00354878` m² at a plane gap of `8.9407e-08` m.
- `InkMat_OffWhite` triangle 30 overlaps `InkMat_StructuralGray` triangle 24 by `0.00354878` m² at a plane gap of `8.9407e-08` m.
- `InkMat_OffWhite` triangle 34 overlaps `InkMat_StructuralGray` triangle 24 by `0.00574205` m² at a plane gap of `8.9407e-08` m.
- `InkMat_OffWhite` triangle 17 overlaps `InkMat_StructuralGray` triangle 103 by `0.0339577` m² at a plane gap of `2.38419e-07` m.
- `InkMat_StructuralGray` triangle 29 overlaps `InkMat_OffWhite` triangle 31 by `0.00997904` m² at a plane gap of `8.9407e-08` m.
- `InkMat_StructuralGray` triangle 31 overlaps `InkMat_OffWhite` triangle 31 by `0.0168811` m² at a plane gap of `8.9407e-08` m.
- `InkMat_StructuralGray` triangle 24 overlaps `InkMat_OffWhite` triangle 31 by `0.00354878` m² at a plane gap of `8.9407e-08` m.
- `InkMat_OffWhite` triangle 16 overlaps `InkMat_StructuralGray` triangle 104 by `0.0339577` m² at a plane gap of `2.38419e-07` m.
- `InkMat_OffWhite` triangle 34 overlaps `InkMat_StructuralGray` triangle 28 by `0.00219327` m² at a plane gap of `8.9407e-08` m.
- `InkMat_OffWhite` triangle 35 overlaps `InkMat_StructuralGray` triangle 28 by `0.00354878` m² at a plane gap of `8.9407e-08` m.
- `InkMat_OffWhite` triangle 32 overlaps `InkMat_StructuralGray` triangle 28 by `0.00354878` m² at a plane gap of `8.9407e-08` m.
- `InkMat_OffWhite` triangle 31 overlaps `InkMat_StructuralGray` triangle 28 by `0.00354878` m² at a plane gap of `8.9407e-08` m.

## curb-straight.glb

- `InkMat_OffWhite` triangle 6 overlaps `InkMat_StructuralGray` triangle 2 by `0.1` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 7 overlaps `InkMat_StructuralGray` triangle 2 by `0.1` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 6 overlaps `InkMat_StructuralGray` triangle 3 by `0.1` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 7 overlaps `InkMat_StructuralGray` triangle 3 by `0.1` m² at a plane gap of `0` m.

## duct-exhaust-hood.glb

- `InkMat_OffWhite` triangle 0 overlaps `InkMat_StructuralGray` triangle 10 by `1.5` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 1 overlaps `InkMat_StructuralGray` triangle 11 by `1.5` m² at a plane gap of `0` m.

## fire-hydrant.glb

- `InkMat_StructuralGray` triangle 22 overlaps `InkMat_OffWhite` triangle 14 by `0.00232995` m² at a plane gap of `2.23517e-08` m.
- `InkMat_StructuralGray` triangle 23 overlaps `InkMat_OffWhite` triangle 14 by `0.00232995` m² at a plane gap of `2.23517e-08` m.
- `InkMat_StructuralGray` triangle 23 overlaps `InkMat_OffWhite` triangle 13 by `0.0046599` m² at a plane gap of `2.23517e-08` m.
- `InkMat_StructuralGray` triangle 22 overlaps `InkMat_OffWhite` triangle 15 by `0.0046599` m² at a plane gap of `2.23517e-08` m.
- `InkMat_StructuralGray` triangle 22 overlaps `InkMat_OffWhite` triangle 16 by `0.005625` m² at a plane gap of `2.23517e-08` m.
- `InkMat_StructuralGray` triangle 23 overlaps `InkMat_OffWhite` triangle 16 by `0.016875` m² at a plane gap of `2.23517e-08` m.
- `InkMat_StructuralGray` triangle 22 overlaps `InkMat_OffWhite` triangle 17 by `0.016875` m² at a plane gap of `2.23517e-08` m.
- `InkMat_StructuralGray` triangle 23 overlaps `InkMat_OffWhite` triangle 17 by `0.005625` m² at a plane gap of `2.23517e-08` m.
- `InkMat_StructuralGray` triangle 22 overlaps `InkMat_OffWhite` triangle 12 by `0.00232995` m² at a plane gap of `2.23517e-08` m.
- `InkMat_StructuralGray` triangle 23 overlaps `InkMat_OffWhite` triangle 12 by `0.00232995` m² at a plane gap of `2.23517e-08` m.

## floodlight-tower.glb

- `InkMat_OffWhite` triangle 10 overlaps `InkMat_StructuralGray` triangle 91 by `0.000391705` m² at a plane gap of `1.78814e-07` m.
- `InkMat_OffWhite` triangle 11 overlaps `InkMat_StructuralGray` triangle 91 by `0.000933778` m² at a plane gap of `1.78814e-07` m.
- `InkMat_OffWhite` triangle 10 overlaps `InkMat_StructuralGray` triangle 92 by `0.00132548` m² at a plane gap of `1.78814e-07` m.
- `InkMat_OffWhite` triangle 10 overlaps `InkMat_StructuralGray` triangle 94 by `0.00128` m² at a plane gap of `1.78814e-07` m.
- `InkMat_OffWhite` triangle 11 overlaps `InkMat_StructuralGray` triangle 94 by `0.00512` m² at a plane gap of `1.78814e-07` m.
- `InkMat_OffWhite` triangle 10 overlaps `InkMat_StructuralGray` triangle 95 by `0.00512` m² at a plane gap of `1.78814e-07` m.
- `InkMat_OffWhite` triangle 11 overlaps `InkMat_StructuralGray` triangle 95 by `0.00128` m² at a plane gap of `1.78814e-07` m.
- `InkMat_OffWhite` triangle 11 overlaps `InkMat_StructuralGray` triangle 90 by `0.00132548` m² at a plane gap of `1.78814e-07` m.
- `InkMat_OffWhite` triangle 10 overlaps `InkMat_StructuralGray` triangle 93 by `0.000933778` m² at a plane gap of `1.78814e-07` m.
- `InkMat_OffWhite` triangle 11 overlaps `InkMat_StructuralGray` triangle 93 by `0.000391705` m² at a plane gap of `1.78814e-07` m.

## generator-diesel-large.glb

- `InkMat_StructuralGray` triangle 10 overlaps `InkMat_OffWhite` triangle 8 by `1.80889` m² at a plane gap of `0` m.
- `InkMat_StructuralGray` triangle 11 overlaps `InkMat_OffWhite` triangle 8 by `1.87111` m² at a plane gap of `0` m.
- `InkMat_StructuralGray` triangle 10 overlaps `InkMat_OffWhite` triangle 9 by `1.87111` m² at a plane gap of `0` m.
- `InkMat_StructuralGray` triangle 11 overlaps `InkMat_OffWhite` triangle 9 by `1.80889` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 10 overlaps `InkMat_StructuralGray` triangle 47 by `0.00405929` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 10 overlaps `InkMat_StructuralGray` triangle 44 by `0.00405929` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 10 overlaps `InkMat_StructuralGray` triangle 46 by `0.00405929` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 10 overlaps `InkMat_StructuralGray` triangle 48 by `0.0196` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 10 overlaps `InkMat_StructuralGray` triangle 49 by `0.0196` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 10 overlaps `InkMat_StructuralGray` triangle 45 by `0.00405929` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 11 overlaps `InkMat_StructuralGray` triangle 54 by `0.00405929` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 11 overlaps `InkMat_StructuralGray` triangle 53 by `0.00405929` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 11 overlaps `InkMat_StructuralGray` triangle 55 by `0.00405929` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 11 overlaps `InkMat_StructuralGray` triangle 56 by `0.0196` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 11 overlaps `InkMat_StructuralGray` triangle 57 by `0.0196` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 11 overlaps `InkMat_StructuralGray` triangle 52 by `0.00405929` m² at a plane gap of `0` m.

## generator.glb

- `InkMat_StructuralGray` triangle 10 overlaps `InkMat_OffWhite` triangle 8 by `0.907679` m² at a plane gap of `1.49012e-08` m.
- `InkMat_StructuralGray` triangle 11 overlaps `InkMat_OffWhite` triangle 8 by `0.912321` m² at a plane gap of `1.49012e-08` m.
- `InkMat_StructuralGray` triangle 10 overlaps `InkMat_OffWhite` triangle 9 by `0.912321` m² at a plane gap of `1.49012e-08` m.
- `InkMat_StructuralGray` triangle 11 overlaps `InkMat_OffWhite` triangle 9 by `0.907679` m² at a plane gap of `1.49012e-08` m.
- `InkMat_OffWhite` triangle 11 overlaps `InkMat_StructuralGray` triangle 49 by `0.00207107` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 11 overlaps `InkMat_StructuralGray` triangle 46 by `0.00207107` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 11 overlaps `InkMat_StructuralGray` triangle 48 by `0.00207107` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 11 overlaps `InkMat_StructuralGray` triangle 50 by `0.01` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 11 overlaps `InkMat_StructuralGray` triangle 51 by `0.01` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 11 overlaps `InkMat_StructuralGray` triangle 47 by `0.00207107` m² at a plane gap of `0` m.

## golf-club.glb

- `InkMat_Charcoal` triangle 29 overlaps `InkMat_OffWhite` triangle 9 by `1.73205e-06` m² at a plane gap of `0` m.
- `InkMat_Charcoal` triangle 31 overlaps `InkMat_OffWhite` triangle 9 by `1.94856e-05` m² at a plane gap of `0` m.
- `InkMat_Charcoal` triangle 28 overlaps `InkMat_OffWhite` triangle 10 by `1.73205e-06` m² at a plane gap of `0` m.
- `InkMat_Charcoal` triangle 31 overlaps `InkMat_OffWhite` triangle 10 by `1.94856e-05` m² at a plane gap of `0` m.
- `InkMat_Charcoal` triangle 31 overlaps `InkMat_OffWhite` triangle 11 by `6.36529e-05` m² at a plane gap of `0` m.
- `InkMat_Charcoal` triangle 31 overlaps `InkMat_OffWhite` triangle 8 by `1.94856e-05` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 8 overlaps `InkMat_Charcoal` triangle 30 by `1.73205e-06` m² at a plane gap of `0` m.

## grate-floor-square.glb

- `InkMat_OffWhite` triangle 11 overlaps `InkMat_StructuralGray` triangle 8 by `0.0557437` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 10 overlaps `InkMat_StructuralGray` triangle 9 by `0.00174375` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 11 overlaps `InkMat_StructuralGray` triangle 9 by `0.0540562` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 10 overlaps `InkMat_StructuralGray` triangle 20 by `0.0540562` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 11 overlaps `InkMat_StructuralGray` triangle 20 by `0.00174375` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 10 overlaps `InkMat_StructuralGray` triangle 21 by `0.0557437` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 10 overlaps `InkMat_StructuralGray` triangle 32 by `0.0522` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 10 overlaps `InkMat_StructuralGray` triangle 33 by `0.0522` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 11 overlaps `InkMat_StructuralGray` triangle 44 by `0.0522` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 11 overlaps `InkMat_StructuralGray` triangle 45 by `0.0522` m² at a plane gap of `0` m.

## gravity-lift.glb

- `InkMat_StructuralGray` triangle 27 overlaps `InkMat_OffWhite` triangle 35 by `0.0296572` m² at a plane gap of `1.49012e-08` m.
- `InkMat_StructuralGray` triangle 29 overlaps `InkMat_OffWhite` triangle 35 by `0.00131769` m² at a plane gap of `1.49012e-08` m.
- `InkMat_StructuralGray` triangle 27 overlaps `InkMat_OffWhite` triangle 34 by `0.0296572` m² at a plane gap of `1.49012e-08` m.
- `InkMat_StructuralGray` triangle 29 overlaps `InkMat_OffWhite` triangle 34 by `0.00131769` m² at a plane gap of `1.49012e-08` m.
- `InkMat_StructuralGray` triangle 26 overlaps `InkMat_OffWhite` triangle 36 by `0.0296572` m² at a plane gap of `1.49012e-08` m.
- `InkMat_StructuralGray` triangle 29 overlaps `InkMat_OffWhite` triangle 36 by `0.00131769` m² at a plane gap of `1.49012e-08` m.
- `InkMat_StructuralGray` triangle 27 overlaps `InkMat_OffWhite` triangle 40 by `0.135793` m² at a plane gap of `1.49012e-08` m.
- `InkMat_StructuralGray` triangle 29 overlaps `InkMat_OffWhite` triangle 40 by `0.0644323` m² at a plane gap of `1.49012e-08` m.
- `InkMat_StructuralGray` triangle 26 overlaps `InkMat_OffWhite` triangle 41 by `0.135793` m² at a plane gap of `1.49012e-08` m.
- `InkMat_StructuralGray` triangle 29 overlaps `InkMat_OffWhite` triangle 41 by `0.0644323` m² at a plane gap of `1.49012e-08` m.
- `InkMat_StructuralGray` triangle 29 overlaps `InkMat_OffWhite` triangle 43 by `0.600675` m² at a plane gap of `1.49012e-08` m.
- `InkMat_StructuralGray` triangle 26 overlaps `InkMat_OffWhite` triangle 37 by `0.0296572` m² at a plane gap of `1.49012e-08` m.
- `InkMat_StructuralGray` triangle 29 overlaps `InkMat_OffWhite` triangle 37 by `0.00131769` m² at a plane gap of `1.49012e-08` m.
- `InkMat_StructuralGray` triangle 29 overlaps `InkMat_OffWhite` triangle 39 by `0.00131769` m² at a plane gap of `1.49012e-08` m.
- `InkMat_StructuralGray` triangle 29 overlaps `InkMat_OffWhite` triangle 42 by `0.0644323` m² at a plane gap of `1.49012e-08` m.
- `InkMat_OffWhite` triangle 39 overlaps `InkMat_StructuralGray` triangle 28 by `0.0296572` m² at a plane gap of `1.49012e-08` m.
- `InkMat_OffWhite` triangle 42 overlaps `InkMat_StructuralGray` triangle 28 by `0.135793` m² at a plane gap of `1.49012e-08` m.
- `InkMat_StructuralGray` triangle 29 overlaps `InkMat_OffWhite` triangle 38 by `0.00131769` m² at a plane gap of `1.49012e-08` m.
- `InkMat_StructuralGray` triangle 28 overlaps `InkMat_OffWhite` triangle 38 by `0.0296572` m² at a plane gap of `1.49012e-08` m.

## hockey-stick.glb

- `InkMat_Charcoal` triangle 29 overlaps `InkMat_OffWhite` triangle 9 by `6.23538e-05` m² at a plane gap of `5.96046e-08` m.
- `InkMat_Charcoal` triangle 31 overlaps `InkMat_OffWhite` triangle 9 by `2.25167e-05` m² at a plane gap of `5.96046e-08` m.
- `InkMat_Charcoal` triangle 28 overlaps `InkMat_OffWhite` triangle 10 by `6.23538e-05` m² at a plane gap of `5.96046e-08` m.
- `InkMat_Charcoal` triangle 31 overlaps `InkMat_OffWhite` triangle 10 by `2.25167e-05` m² at a plane gap of `5.96046e-08` m.
- `InkMat_Charcoal` triangle 31 overlaps `InkMat_OffWhite` triangle 11 by `0.000254611` m² at a plane gap of `5.96046e-08` m.
- `InkMat_Charcoal` triangle 31 overlaps `InkMat_OffWhite` triangle 8 by `2.25167e-05` m² at a plane gap of `5.96046e-08` m.
- `InkMat_OffWhite` triangle 8 overlaps `InkMat_Charcoal` triangle 30 by `6.23538e-05` m² at a plane gap of `5.96046e-08` m.

## hoist-monorail.glb

- `InkMat_OffWhite` triangle 10 overlaps `InkMat_StructuralGray` triangle 2 by `0.00413887` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 11 overlaps `InkMat_StructuralGray` triangle 2 by `0.000861126` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 10 overlaps `InkMat_StructuralGray` triangle 3 by `0.00373612` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 11 overlaps `InkMat_StructuralGray` triangle 3 by `0.00126387` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 10 overlaps `InkMat_StructuralGray` triangle 14 by `0.00126387` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 11 overlaps `InkMat_StructuralGray` triangle 14 by `0.00373612` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 10 overlaps `InkMat_StructuralGray` triangle 15 by `0.000861126` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 11 overlaps `InkMat_StructuralGray` triangle 15 by `0.00413887` m² at a plane gap of `0` m.

## hologram-projector.glb

- `InkMat_StructuralGray` triangle 27 overlaps `InkMat_OffWhite` triangle 35 by `0.0182048` m² at a plane gap of `7.45058e-09` m.
- `InkMat_StructuralGray` triangle 29 overlaps `InkMat_OffWhite` triangle 35 by `0.00205889` m² at a plane gap of `7.45058e-09` m.
- `InkMat_StructuralGray` triangle 27 overlaps `InkMat_OffWhite` triangle 34 by `0.0182048` m² at a plane gap of `7.45058e-09` m.
- `InkMat_StructuralGray` triangle 29 overlaps `InkMat_OffWhite` triangle 34 by `0.00205889` m² at a plane gap of `7.45058e-09` m.
- `InkMat_StructuralGray` triangle 26 overlaps `InkMat_OffWhite` triangle 36 by `0.0182048` m² at a plane gap of `7.45058e-09` m.
- `InkMat_StructuralGray` triangle 29 overlaps `InkMat_OffWhite` triangle 36 by `0.00205889` m² at a plane gap of `7.45058e-09` m.
- `InkMat_StructuralGray` triangle 27 overlaps `InkMat_OffWhite` triangle 40 by `0.0692821` m² at a plane gap of `7.45058e-09` m.
- `InkMat_StructuralGray` triangle 29 overlaps `InkMat_OffWhite` triangle 40 by `0.0617043` m² at a plane gap of `7.45058e-09` m.
- `InkMat_StructuralGray` triangle 26 overlaps `InkMat_OffWhite` triangle 41 by `0.069282` m² at a plane gap of `7.45058e-09` m.
- `InkMat_StructuralGray` triangle 29 overlaps `InkMat_OffWhite` triangle 41 by `0.0617043` m² at a plane gap of `7.45058e-09` m.
- `InkMat_StructuralGray` triangle 29 overlaps `InkMat_OffWhite` triangle 43 by `0.392959` m² at a plane gap of `7.45058e-09` m.
- `InkMat_StructuralGray` triangle 26 overlaps `InkMat_OffWhite` triangle 37 by `0.0182048` m² at a plane gap of `7.45058e-09` m.
- `InkMat_StructuralGray` triangle 29 overlaps `InkMat_OffWhite` triangle 37 by `0.00205889` m² at a plane gap of `7.45058e-09` m.
- `InkMat_StructuralGray` triangle 29 overlaps `InkMat_OffWhite` triangle 39 by `0.00205889` m² at a plane gap of `7.45058e-09` m.
- `InkMat_StructuralGray` triangle 29 overlaps `InkMat_OffWhite` triangle 42 by `0.0617043` m² at a plane gap of `7.45058e-09` m.
- `InkMat_OffWhite` triangle 39 overlaps `InkMat_StructuralGray` triangle 28 by `0.0182048` m² at a plane gap of `7.45058e-09` m.
- `InkMat_OffWhite` triangle 42 overlaps `InkMat_StructuralGray` triangle 28 by `0.0692821` m² at a plane gap of `7.45058e-09` m.
- `InkMat_StructuralGray` triangle 29 overlaps `InkMat_OffWhite` triangle 38 by `0.00205889` m² at a plane gap of `7.45058e-09` m.
- `InkMat_StructuralGray` triangle 28 overlaps `InkMat_OffWhite` triangle 38 by `0.0182048` m² at a plane gap of `7.45058e-09` m.

## machine-hydraulic-press.glb

- `InkMat_StructuralGray` triangle 10 overlaps `InkMat_OffWhite` triangle 47 by `0.00132548` m² at a plane gap of `1.19209e-07` m.
- `InkMat_StructuralGray` triangle 10 overlaps `InkMat_OffWhite` triangle 56 by `0.00132548` m² at a plane gap of `1.19209e-07` m.
- `InkMat_StructuralGray` triangle 10 overlaps `InkMat_OffWhite` triangle 44 by `0.00132548` m² at a plane gap of `1.19209e-07` m.
- `InkMat_StructuralGray` triangle 11 overlaps `InkMat_OffWhite` triangle 46 by `0.00130044` m² at a plane gap of `1.19209e-07` m.
- `InkMat_StructuralGray` triangle 10 overlaps `InkMat_OffWhite` triangle 48 by `0.00436691` m² at a plane gap of `1.19209e-07` m.
- `InkMat_StructuralGray` triangle 11 overlaps `InkMat_OffWhite` triangle 48 by `0.00203309` m² at a plane gap of `1.19209e-07` m.
- `InkMat_StructuralGray` triangle 10 overlaps `InkMat_OffWhite` triangle 49 by `0.00407647` m² at a plane gap of `1.19209e-07` m.
- `InkMat_StructuralGray` triangle 11 overlaps `InkMat_OffWhite` triangle 49 by `0.00232354` m² at a plane gap of `1.19209e-07` m.
- `InkMat_StructuralGray` triangle 10 overlaps `InkMat_OffWhite` triangle 55 by `0.00132548` m² at a plane gap of `1.19209e-07` m.
- `InkMat_StructuralGray` triangle 10 overlaps `InkMat_OffWhite` triangle 57 by `0.00132548` m² at a plane gap of `1.19209e-07` m.
- `InkMat_StructuralGray` triangle 10 overlaps `InkMat_OffWhite` triangle 58 by `0.0064` m² at a plane gap of `1.19209e-07` m.
- `InkMat_StructuralGray` triangle 10 overlaps `InkMat_OffWhite` triangle 59 by `0.0064` m² at a plane gap of `1.19209e-07` m.
- `InkMat_StructuralGray` triangle 10 overlaps `InkMat_OffWhite` triangle 45 by `0.00010135` m² at a plane gap of `1.19209e-07` m.
- `InkMat_StructuralGray` triangle 11 overlaps `InkMat_OffWhite` triangle 45 by `0.00122413` m² at a plane gap of `1.19209e-07` m.
- `InkMat_StructuralGray` triangle 10 overlaps `InkMat_OffWhite` triangle 54 by `0.00132548` m² at a plane gap of `1.19209e-07` m.
- `InkMat_StructuralGray` triangle 20 overlaps `InkMat_OffWhite` triangle 143 by `0.000518878` m² at a plane gap of `0` m.
- `InkMat_StructuralGray` triangle 21 overlaps `InkMat_OffWhite` triangle 143 by `0.00649719` m² at a plane gap of `0` m.
- `InkMat_StructuralGray` triangle 21 overlaps `InkMat_OffWhite` triangle 144 by `0.00701606` m² at a plane gap of `0` m.
- `InkMat_StructuralGray` triangle 20 overlaps `InkMat_OffWhite` triangle 146 by `0.0259575` m² at a plane gap of `0` m.
- `InkMat_StructuralGray` triangle 21 overlaps `InkMat_OffWhite` triangle 146 by `0.0151152` m² at a plane gap of `0` m.
- `InkMat_StructuralGray` triangle 20 overlaps `InkMat_OffWhite` triangle 147 by `0.0203252` m² at a plane gap of `0` m.
- `InkMat_StructuralGray` triangle 21 overlaps `InkMat_OffWhite` triangle 147 by `0.0461319` m² at a plane gap of `0` m.
- `InkMat_StructuralGray` triangle 20 overlaps `InkMat_OffWhite` triangle 142 by `0.00701606` m² at a plane gap of `0` m.
- `InkMat_StructuralGray` triangle 20 overlaps `InkMat_OffWhite` triangle 140 by `0.00154146` m² at a plane gap of `0` m.
- `InkMat_StructuralGray` triangle 21 overlaps `InkMat_OffWhite` triangle 140 by `0.0054746` m² at a plane gap of `0` m.
- `InkMat_StructuralGray` triangle 20 overlaps `InkMat_OffWhite` triangle 145 by `0.0294663` m² at a plane gap of `0` m.
- `InkMat_StructuralGray` triangle 21 overlaps `InkMat_OffWhite` triangle 145 by `0.0116064` m² at a plane gap of `0` m.
- `InkMat_StructuralGray` triangle 20 overlaps `InkMat_OffWhite` triangle 141 by `0.00701606` m² at a plane gap of `0` m.
- `InkMat_StructuralGray` triangle 11 overlaps `InkMat_OffWhite` triangle 93 by `0.00132549` m² at a plane gap of `1.19209e-07` m.
- `InkMat_StructuralGray` triangle 11 overlaps `InkMat_OffWhite` triangle 94 by `0.00132548` m² at a plane gap of `1.19209e-07` m.
- `InkMat_StructuralGray` triangle 11 overlaps `InkMat_OffWhite` triangle 96 by `0.0064` m² at a plane gap of `1.19209e-07` m.
- `InkMat_StructuralGray` triangle 11 overlaps `InkMat_OffWhite` triangle 97 by `0.0064` m² at a plane gap of `1.19209e-07` m.
- `InkMat_StructuralGray` triangle 10 overlaps `InkMat_OffWhite` triangle 103 by `0.000301148` m² at a plane gap of `1.19209e-07` m.
- `InkMat_StructuralGray` triangle 11 overlaps `InkMat_OffWhite` triangle 103 by `0.00102434` m² at a plane gap of `1.19209e-07` m.
- `InkMat_StructuralGray` triangle 10 overlaps `InkMat_OffWhite` triangle 104 by `0.00132549` m² at a plane gap of `1.19209e-07` m.
- `InkMat_StructuralGray` triangle 10 overlaps `InkMat_OffWhite` triangle 106 by `0.000800477` m² at a plane gap of `1.19209e-07` m.
- `InkMat_StructuralGray` triangle 11 overlaps `InkMat_OffWhite` triangle 106 by `0.00559952` m² at a plane gap of `1.19209e-07` m.
- `InkMat_StructuralGray` triangle 10 overlaps `InkMat_OffWhite` triangle 107 by `0.00399952` m² at a plane gap of `1.19209e-07` m.
- `InkMat_StructuralGray` triangle 11 overlaps `InkMat_OffWhite` triangle 107 by `0.00240047` m² at a plane gap of `1.19209e-07` m.
- `InkMat_StructuralGray` triangle 11 overlaps `InkMat_OffWhite` triangle 92 by `0.00132549` m² at a plane gap of `1.19209e-07` m.
- `InkMat_StructuralGray` triangle 11 overlaps `InkMat_OffWhite` triangle 95 by `0.00132548` m² at a plane gap of `1.19209e-07` m.
- `InkMat_StructuralGray` triangle 11 overlaps `InkMat_OffWhite` triangle 102 by `0.00132548` m² at a plane gap of `1.19209e-07` m.
- `InkMat_StructuralGray` triangle 10 overlaps `InkMat_OffWhite` triangle 105 by `0.000454566` m² at a plane gap of `1.19209e-07` m.
- `InkMat_StructuralGray` triangle 11 overlaps `InkMat_OffWhite` triangle 105 by `0.00087092` m² at a plane gap of `1.19209e-07` m.

## machine-lathe.glb

- `InkMat_StructuralGray` triangle 10 overlaps `InkMat_OffWhite` triangle 8 by `0.245889` m² at a plane gap of `0` m.
- `InkMat_StructuralGray` triangle 11 overlaps `InkMat_OffWhite` triangle 8 by `0.0166106` m² at a plane gap of `0` m.
- `InkMat_StructuralGray` triangle 10 overlaps `InkMat_OffWhite` triangle 9 by `0.206884` m² at a plane gap of `0` m.
- `InkMat_StructuralGray` triangle 11 overlaps `InkMat_OffWhite` triangle 9 by `0.0556159` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 4 overlaps `InkMat_StructuralGray` triangle 34 by `0.00958759` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 5 overlaps `InkMat_StructuralGray` triangle 34 by `0.000436383` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 5 overlaps `InkMat_StructuralGray` triangle 35 by `0.010024` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 4 overlaps `InkMat_StructuralGray` triangle 36 by `0.000436383` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 5 overlaps `InkMat_StructuralGray` triangle 36 by `0.00958759` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 4 overlaps `InkMat_StructuralGray` triangle 37 by `0.010024` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 4 overlaps `InkMat_StructuralGray` triangle 38 by `0.0201667` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 5 overlaps `InkMat_StructuralGray` triangle 38 by `0.0282333` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 4 overlaps `InkMat_StructuralGray` triangle 39 by `0.0282333` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 5 overlaps `InkMat_StructuralGray` triangle 39 by `0.0201667` m² at a plane gap of `0` m.
- `InkMat_StructuralGray` triangle 10 overlaps `InkMat_OffWhite` triangle 14 by `0.00398201` m² at a plane gap of `5.96046e-08` m.
- `InkMat_StructuralGray` triangle 11 overlaps `InkMat_OffWhite` triangle 14 by `0.121018` m² at a plane gap of `5.96046e-08` m.
- `InkMat_StructuralGray` triangle 11 overlaps `InkMat_OffWhite` triangle 15 by `0.123726` m² at a plane gap of `5.96046e-08` m.

## machine-transformer.glb

- `InkMat_OffWhite` triangle 10 overlaps `InkMat_StructuralGray` triangle 144 by `0.00277128` m² at a plane gap of `1.19209e-07` m.
- `InkMat_OffWhite` triangle 10 overlaps `InkMat_StructuralGray` triangle 146 by `0.00277128` m² at a plane gap of `1.19209e-07` m.
- `InkMat_OffWhite` triangle 10 overlaps `InkMat_StructuralGray` triangle 147 by `0.00831384` m² at a plane gap of `1.19209e-07` m.
- `InkMat_OffWhite` triangle 10 overlaps `InkMat_StructuralGray` triangle 145 by `0.00277128` m² at a plane gap of `1.19209e-07` m.
- `InkMat_OffWhite` triangle 11 overlaps `InkMat_StructuralGray` triangle 162 by `0.00271847` m² at a plane gap of `1.19209e-07` m.
- `InkMat_OffWhite` triangle 10 overlaps `InkMat_StructuralGray` triangle 163 by `0.00277128` m² at a plane gap of `1.19209e-07` m.
- `InkMat_OffWhite` triangle 10 overlaps `InkMat_StructuralGray` triangle 165 by `0.00440334` m² at a plane gap of `1.19209e-07` m.
- `InkMat_OffWhite` triangle 11 overlaps `InkMat_StructuralGray` triangle 165 by `0.00391051` m² at a plane gap of `1.19209e-07` m.
- `InkMat_OffWhite` triangle 10 overlaps `InkMat_StructuralGray` triangle 164 by `0.00108641` m² at a plane gap of `1.19209e-07` m.
- `InkMat_OffWhite` triangle 11 overlaps `InkMat_StructuralGray` triangle 164 by `0.00168487` m² at a plane gap of `1.19209e-07` m.
- `InkMat_OffWhite` triangle 11 overlaps `InkMat_StructuralGray` triangle 177 by `0.00277128` m² at a plane gap of `1.19209e-07` m.
- `InkMat_OffWhite` triangle 11 overlaps `InkMat_StructuralGray` triangle 178 by `0.00277128` m² at a plane gap of `1.19209e-07` m.
- `InkMat_OffWhite` triangle 11 overlaps `InkMat_StructuralGray` triangle 179 by `0.00831384` m² at a plane gap of `1.19209e-07` m.
- `InkMat_OffWhite` triangle 11 overlaps `InkMat_StructuralGray` triangle 176 by `0.00277128` m² at a plane gap of `1.19209e-07` m.

## mailbox.glb

- `InkMat_StructuralGray` triangle 10 overlaps `InkMat_OffWhite` triangle 8 by `0.0625` m² at a plane gap of `2.23517e-08` m.
- `InkMat_StructuralGray` triangle 11 overlaps `InkMat_OffWhite` triangle 8 by `0.0625` m² at a plane gap of `2.23517e-08` m.
- `InkMat_StructuralGray` triangle 10 overlaps `InkMat_OffWhite` triangle 9 by `0.0625` m² at a plane gap of `2.23517e-08` m.
- `InkMat_StructuralGray` triangle 11 overlaps `InkMat_OffWhite` triangle 9 by `0.0625` m² at a plane gap of `2.23517e-08` m.

## parking-meter.glb

- `InkMat_OffWhite` triangle 4 overlaps `InkMat_StructuralGray` triangle 30 by `0.00416538` m² at a plane gap of `7.45058e-09` m.
- `InkMat_OffWhite` triangle 5 overlaps `InkMat_StructuralGray` triangle 30 by `0.00183461` m² at a plane gap of `7.45058e-09` m.
- `InkMat_OffWhite` triangle 4 overlaps `InkMat_StructuralGray` triangle 31 by `0.00543461` m² at a plane gap of `7.45058e-09` m.
- `InkMat_OffWhite` triangle 5 overlaps `InkMat_StructuralGray` triangle 31 by `0.000565383` m² at a plane gap of `7.45058e-09` m.
- `InkMat_OffWhite` triangle 2 overlaps `InkMat_StructuralGray` triangle 23 by `0.000144011` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 3 overlaps `InkMat_StructuralGray` triangle 23 by `0.000109695` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 3 overlaps `InkMat_StructuralGray` triangle 24 by `0.000253706` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 2 overlaps `InkMat_StructuralGray` triangle 26 by `0.000936765` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 3 overlaps `InkMat_StructuralGray` triangle 26 by `0.000288235` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 2 overlaps `InkMat_StructuralGray` triangle 27 by `0.000288235` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 3 overlaps `InkMat_StructuralGray` triangle 27 by `0.000936765` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 2 overlaps `InkMat_StructuralGray` triangle 22 by `0.000253706` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 2 overlaps `InkMat_StructuralGray` triangle 25 by `0.000109695` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 3 overlaps `InkMat_StructuralGray` triangle 25 by `0.000144011` m² at a plane gap of `0` m.

## pipe-cross.glb

- `InkMat_StructuralGray` triangle 117 overlaps `InkMat_OffWhite` triangle 95 by `0.00237375` m² at a plane gap of `5.96046e-08` m.
- `InkMat_StructuralGray` triangle 119 overlaps `InkMat_OffWhite` triangle 95 by `0.000152033` m² at a plane gap of `5.96046e-08` m.
- `InkMat_StructuralGray` triangle 117 overlaps `InkMat_OffWhite` triangle 96 by `0.00237375` m² at a plane gap of `5.96046e-08` m.
- `InkMat_StructuralGray` triangle 119 overlaps `InkMat_OffWhite` triangle 96 by `0.000152033` m² at a plane gap of `5.96046e-08` m.
- `InkMat_StructuralGray` triangle 119 overlaps `InkMat_OffWhite` triangle 97 by `0.00252578` m² at a plane gap of `5.96046e-08` m.
- `InkMat_StructuralGray` triangle 118 overlaps `InkMat_OffWhite` triangle 98 by `0.00237375` m² at a plane gap of `5.96046e-08` m.
- `InkMat_StructuralGray` triangle 119 overlaps `InkMat_OffWhite` triangle 98 by `0.000152032` m² at a plane gap of `7.94794e-08` m.
- `InkMat_StructuralGray` triangle 118 overlaps `InkMat_OffWhite` triangle 99 by `0.00237375` m² at a plane gap of `5.96046e-08` m.
- `InkMat_StructuralGray` triangle 119 overlaps `InkMat_OffWhite` triangle 99 by `0.000152032` m² at a plane gap of `7.94794e-08` m.
- `InkMat_StructuralGray` triangle 117 overlaps `InkMat_OffWhite` triangle 100 by `0.00925846` m² at a plane gap of `5.96046e-08` m.
- `InkMat_StructuralGray` triangle 119 overlaps `InkMat_OffWhite` triangle 100 by `0.00552773` m² at a plane gap of `5.96046e-08` m.
- `InkMat_StructuralGray` triangle 118 overlaps `InkMat_OffWhite` triangle 101 by `0.00353642` m² at a plane gap of `5.96046e-08` m.
- `InkMat_StructuralGray` triangle 119 overlaps `InkMat_OffWhite` triangle 101 by `0.0112498` m² at a plane gap of `7.94794e-08` m.
- `InkMat_StructuralGray` triangle 118 overlaps `InkMat_OffWhite` triangle 102 by `0.00572205` m² at a plane gap of `5.96046e-08` m.
- `InkMat_StructuralGray` triangle 119 overlaps `InkMat_OffWhite` triangle 102 by `0.0182025` m² at a plane gap of `7.94794e-08` m.
- `InkMat_StructuralGray` triangle 91 overlaps `InkMat_OffWhite` triangle 45 by `0.000571958` m² at a plane gap of `7.25374e-08` m.
- `InkMat_StructuralGray` triangle 91 overlaps `InkMat_OffWhite` triangle 46 by `0.00252578` m² at a plane gap of `5.96046e-08` m.
- `InkMat_StructuralGray` triangle 91 overlaps `InkMat_OffWhite` triangle 49 by `0.000925447` m² at a plane gap of `7.25374e-08` m.
- `InkMat_StructuralGray` triangle 91 overlaps `InkMat_OffWhite` triangle 50 by `0.00791342` m² at a plane gap of `5.96046e-08` m.
- `InkMat_StructuralGray` triangle 91 overlaps `InkMat_OffWhite` triangle 51 by `0.0014974` m² at a plane gap of `7.25374e-08` m.
- `InkMat_StructuralGray` triangle 59 overlaps `InkMat_OffWhite` triangle 64 by `0.00195383` m² at a plane gap of `5.96046e-08` m.
- `InkMat_StructuralGray` triangle 58 overlaps `InkMat_OffWhite` triangle 65 by `0.000571958` m² at a plane gap of `5.96046e-08` m.
- `InkMat_StructuralGray` triangle 59 overlaps `InkMat_OffWhite` triangle 65 by `0.00195383` m² at a plane gap of `7.25374e-08` m.
- `InkMat_StructuralGray` triangle 59 overlaps `InkMat_OffWhite` triangle 67 by `0.00687277` m² at a plane gap of `5.96046e-08` m.
- `InkMat_StructuralGray` triangle 58 overlaps `InkMat_OffWhite` triangle 68 by `0.00242285` m² at a plane gap of `5.96046e-08` m.
- `InkMat_StructuralGray` triangle 59 overlaps `InkMat_OffWhite` triangle 68 by `0.0200043` m² at a plane gap of `7.25374e-08` m.
- `InkMat_OffWhite` triangle 64 overlaps `InkMat_StructuralGray` triangle 57 by `0.000571957` m² at a plane gap of `5.96046e-08` m.
- `InkMat_OffWhite` triangle 67 overlaps `InkMat_StructuralGray` triangle 57 by `0.00791341` m² at a plane gap of `5.96046e-08` m.
- `InkMat_OffWhite` triangle 68 overlaps `InkMat_StructuralGray` triangle 57 by `0.0014974` m² at a plane gap of `7.25374e-08` m.
- `InkMat_OffWhite` triangle 45 overlaps `InkMat_StructuralGray` triangle 92 by `0.000571957` m² at a plane gap of `5.96046e-08` m.
- `InkMat_OffWhite` triangle 49 overlaps `InkMat_StructuralGray` triangle 92 by `0.00791342` m² at a plane gap of `5.96046e-08` m.
- `InkMat_OffWhite` triangle 51 overlaps `InkMat_StructuralGray` triangle 92 by `0.00242285` m² at a plane gap of `5.96046e-08` m.
- `InkMat_OffWhite` triangle 45 overlaps `InkMat_StructuralGray` triangle 93 by `0.00138187` m² at a plane gap of `5.96046e-08` m.
- `InkMat_OffWhite` triangle 49 overlaps `InkMat_StructuralGray` triangle 93 by `0.00594733` m² at a plane gap of `5.96046e-08` m.
- `InkMat_OffWhite` triangle 50 overlaps `InkMat_StructuralGray` triangle 93 by `0.00687277` m² at a plane gap of `5.96046e-08` m.
- `InkMat_OffWhite` triangle 51 overlaps `InkMat_StructuralGray` triangle 93 by `0.0200043` m² at a plane gap of `5.96046e-08` m.
- `InkMat_StructuralGray` triangle 91 overlaps `InkMat_OffWhite` triangle 47 by `0.000571958` m² at a plane gap of `5.96046e-08` m.
- `InkMat_StructuralGray` triangle 93 overlaps `InkMat_OffWhite` triangle 47 by `0.00195383` m² at a plane gap of `5.96046e-08` m.
- `InkMat_StructuralGray` triangle 58 overlaps `InkMat_OffWhite` triangle 61 by `0.00252578` m² at a plane gap of `5.96046e-08` m.
- `InkMat_StructuralGray` triangle 58 overlaps `InkMat_OffWhite` triangle 66 by `0.00791342` m² at a plane gap of `5.96046e-08` m.
- `InkMat_StructuralGray` triangle 59 overlaps `InkMat_OffWhite` triangle 66 by `0.00594732` m² at a plane gap of `7.25374e-08` m.
- `InkMat_StructuralGray` triangle 57 overlaps `InkMat_OffWhite` triangle 66 by `0.000925445` m² at a plane gap of `7.25374e-08` m.
- `InkMat_StructuralGray` triangle 92 overlaps `InkMat_OffWhite` triangle 44 by `0.00252578` m² at a plane gap of `5.96046e-08` m.
- `InkMat_StructuralGray` triangle 57 overlaps `InkMat_OffWhite` triangle 63 by `0.00252578` m² at a plane gap of `5.96046e-08` m.
- `InkMat_StructuralGray` triangle 92 overlaps `InkMat_OffWhite` triangle 48 by `0.000571957` m² at a plane gap of `5.96046e-08` m.
- `InkMat_StructuralGray` triangle 93 overlaps `InkMat_OffWhite` triangle 48 by `0.00195383` m² at a plane gap of `5.96046e-08` m.
- `InkMat_StructuralGray` triangle 58 overlaps `InkMat_OffWhite` triangle 62 by `0.000571958` m² at a plane gap of `5.96046e-08` m.
- `InkMat_StructuralGray` triangle 59 overlaps `InkMat_OffWhite` triangle 62 by `0.00138187` m² at a plane gap of `7.25374e-08` m.
- `InkMat_StructuralGray` triangle 57 overlaps `InkMat_OffWhite` triangle 62 by `0.000571957` m² at a plane gap of `7.25374e-08` m.
- `InkMat_OffWhite` triangle 81 overlaps `InkMat_StructuralGray` triangle 141 by `0.00237375` m² at a plane gap of `5.96046e-08` m.
- `InkMat_OffWhite` triangle 82 overlaps `InkMat_StructuralGray` triangle 141 by `0.00237375` m² at a plane gap of `5.96046e-08` m.
- `InkMat_OffWhite` triangle 84 overlaps `InkMat_StructuralGray` triangle 141 by `0.00353642` m² at a plane gap of `5.96046e-08` m.
- `InkMat_OffWhite` triangle 85 overlaps `InkMat_StructuralGray` triangle 141 by `0.00572205` m² at a plane gap of `5.96046e-08` m.
- `InkMat_OffWhite` triangle 79 overlaps `InkMat_StructuralGray` triangle 142 by `0.00237375` m² at a plane gap of `5.96046e-08` m.
- `InkMat_OffWhite` triangle 80 overlaps `InkMat_StructuralGray` triangle 142 by `0.00237375` m² at a plane gap of `5.96046e-08` m.
- `InkMat_OffWhite` triangle 83 overlaps `InkMat_StructuralGray` triangle 142 by `0.00353642` m² at a plane gap of `5.96046e-08` m.
- `InkMat_OffWhite` triangle 84 overlaps `InkMat_StructuralGray` triangle 142 by `0.00353642` m² at a plane gap of `5.96046e-08` m.
- `InkMat_OffWhite` triangle 85 overlaps `InkMat_StructuralGray` triangle 142 by `0.00218563` m² at a plane gap of `5.96046e-08` m.
- `InkMat_OffWhite` triangle 78 overlaps `InkMat_StructuralGray` triangle 143 by `0.00252578` m² at a plane gap of `5.96046e-08` m.
- `InkMat_OffWhite` triangle 79 overlaps `InkMat_StructuralGray` triangle 143 by `0.000152033` m² at a plane gap of `5.96046e-08` m.
- `InkMat_OffWhite` triangle 80 overlaps `InkMat_StructuralGray` triangle 143 by `0.000152033` m² at a plane gap of `5.96046e-08` m.
- `InkMat_OffWhite` triangle 81 overlaps `InkMat_StructuralGray` triangle 143 by `0.000152032` m² at a plane gap of `5.96046e-08` m.
- `InkMat_OffWhite` triangle 82 overlaps `InkMat_StructuralGray` triangle 143 by `0.000152032` m² at a plane gap of `5.96046e-08` m.
- `InkMat_OffWhite` triangle 83 overlaps `InkMat_StructuralGray` triangle 143 by `0.0112498` m² at a plane gap of `5.96046e-08` m.
- `InkMat_OffWhite` triangle 84 overlaps `InkMat_StructuralGray` triangle 143 by `0.00771335` m² at a plane gap of `5.96046e-08` m.
- `InkMat_OffWhite` triangle 85 overlaps `InkMat_StructuralGray` triangle 143 by `0.0160169` m² at a plane gap of `5.96046e-08` m.

## pipe-elbow.glb

- `InkMat_StructuralGray` triangle 34 overlaps `InkMat_OffWhite` triangle 64 by `0.00252578` m² at a plane gap of `5.96046e-08` m.
- `InkMat_StructuralGray` triangle 33 overlaps `InkMat_OffWhite` triangle 65 by `0.000571958` m² at a plane gap of `0` m.
- `InkMat_StructuralGray` triangle 34 overlaps `InkMat_OffWhite` triangle 65 by `0.000571957` m² at a plane gap of `5.96046e-08` m.
- `InkMat_StructuralGray` triangle 35 overlaps `InkMat_OffWhite` triangle 65 by `0.00138187` m² at a plane gap of `5.96046e-08` m.
- `InkMat_StructuralGray` triangle 34 overlaps `InkMat_OffWhite` triangle 67 by `0.00791342` m² at a plane gap of `5.96046e-08` m.
- `InkMat_StructuralGray` triangle 35 overlaps `InkMat_OffWhite` triangle 67 by `0.00687277` m² at a plane gap of `5.96046e-08` m.
- `InkMat_StructuralGray` triangle 33 overlaps `InkMat_OffWhite` triangle 68 by `0.00242285` m² at a plane gap of `0` m.
- `InkMat_StructuralGray` triangle 34 overlaps `InkMat_OffWhite` triangle 68 by `0.00242285` m² at a plane gap of `5.96046e-08` m.
- `InkMat_StructuralGray` triangle 35 overlaps `InkMat_OffWhite` triangle 68 by `0.0190789` m² at a plane gap of `5.96046e-08` m.
- `InkMat_StructuralGray` triangle 33 overlaps `InkMat_OffWhite` triangle 61 by `0.00252578` m² at a plane gap of `0` m.
- `InkMat_StructuralGray` triangle 33 overlaps `InkMat_OffWhite` triangle 66 by `0.00791342` m² at a plane gap of `0` m.
- `InkMat_StructuralGray` triangle 35 overlaps `InkMat_OffWhite` triangle 66 by `0.00687277` m² at a plane gap of `5.96046e-08` m.
- `InkMat_StructuralGray` triangle 34 overlaps `InkMat_OffWhite` triangle 63 by `0.000571957` m² at a plane gap of `5.96046e-08` m.
- `InkMat_StructuralGray` triangle 35 overlaps `InkMat_OffWhite` triangle 63 by `0.00195382` m² at a plane gap of `5.96046e-08` m.
- `InkMat_StructuralGray` triangle 33 overlaps `InkMat_OffWhite` triangle 62 by `0.000571958` m² at a plane gap of `0` m.
- `InkMat_StructuralGray` triangle 35 overlaps `InkMat_OffWhite` triangle 62 by `0.00195383` m² at a plane gap of `5.96046e-08` m.
- `InkMat_OffWhite` triangle 80 overlaps `InkMat_StructuralGray` triangle 69 by `0.000571958` m² at a plane gap of `5.96046e-08` m.
- `InkMat_OffWhite` triangle 81 overlaps `InkMat_StructuralGray` triangle 69 by `0.00252578` m² at a plane gap of `5.96046e-08` m.
- `InkMat_OffWhite` triangle 82 overlaps `InkMat_StructuralGray` triangle 69 by `0.000571958` m² at a plane gap of `7.25374e-08` m.
- `InkMat_OffWhite` triangle 84 overlaps `InkMat_StructuralGray` triangle 69 by `0.00791342` m² at a plane gap of `5.96046e-08` m.
- `InkMat_OffWhite` triangle 85 overlaps `InkMat_StructuralGray` triangle 69 by `0.00242285` m² at a plane gap of `7.25374e-08` m.
- `InkMat_OffWhite` triangle 78 overlaps `InkMat_StructuralGray` triangle 70 by `0.000571957` m² at a plane gap of `5.96046e-08` m.
- `InkMat_OffWhite` triangle 79 overlaps `InkMat_StructuralGray` triangle 70 by `0.00252578` m² at a plane gap of `5.96046e-08` m.
- `InkMat_OffWhite` triangle 80 overlaps `InkMat_StructuralGray` triangle 70 by `0.000571956` m² at a plane gap of `5.96046e-08` m.
- `InkMat_OffWhite` triangle 83 overlaps `InkMat_StructuralGray` triangle 70 by `0.00791342` m² at a plane gap of `5.96046e-08` m.
- `InkMat_OffWhite` triangle 84 overlaps `InkMat_StructuralGray` triangle 70 by `0.000925445` m² at a plane gap of `5.96046e-08` m.
- `InkMat_OffWhite` triangle 85 overlaps `InkMat_StructuralGray` triangle 70 by `0.0014974` m² at a plane gap of `5.96046e-08` m.
- `InkMat_OffWhite` triangle 78 overlaps `InkMat_StructuralGray` triangle 71 by `0.00195383` m² at a plane gap of `5.96046e-08` m.
- `InkMat_OffWhite` triangle 80 overlaps `InkMat_StructuralGray` triangle 71 by `0.00138187` m² at a plane gap of `5.96046e-08` m.
- `InkMat_OffWhite` triangle 82 overlaps `InkMat_StructuralGray` triangle 71 by `0.00195382` m² at a plane gap of `5.96046e-08` m.
- `InkMat_OffWhite` triangle 83 overlaps `InkMat_StructuralGray` triangle 71 by `0.00687278` m² at a plane gap of `5.96046e-08` m.
- `InkMat_OffWhite` triangle 84 overlaps `InkMat_StructuralGray` triangle 71 by `0.00594732` m² at a plane gap of `5.96046e-08` m.
- `InkMat_OffWhite` triangle 85 overlaps `InkMat_StructuralGray` triangle 71 by `0.0200043` m² at a plane gap of `5.96046e-08` m.

## pipe-inspection-port.glb

- `InkMat_StructuralGray` triangle 22 overlaps `InkMat_OffWhite` triangle 66 by `0.00148548` m² at a plane gap of `0` m.
- `InkMat_StructuralGray` triangle 22 overlaps `InkMat_OffWhite` triangle 67 by `0.006466` m² at a plane gap of `0` m.
- `InkMat_StructuralGray` triangle 22 overlaps `InkMat_OffWhite` triangle 70 by `0.020377` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 66 overlaps `InkMat_StructuralGray` triangle 23 by `0.00498052` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 70 overlaps `InkMat_StructuralGray` triangle 23 by `0.0174756` m² at a plane gap of `0` m.
- `InkMat_StructuralGray` triangle 22 overlaps `InkMat_OffWhite` triangle 68 by `0.00148548` m² at a plane gap of `0` m.
- `InkMat_StructuralGray` triangle 23 overlaps `InkMat_OffWhite` triangle 68 by `0.00349504` m² at a plane gap of `0` m.
- `InkMat_StructuralGray` triangle 22 overlaps `InkMat_OffWhite` triangle 71 by `0.0062926` m² at a plane gap of `0` m.
- `InkMat_StructuralGray` triangle 23 overlaps `InkMat_OffWhite` triangle 71 by `0.0486617` m² at a plane gap of `0` m.
- `InkMat_StructuralGray` triangle 23 overlaps `InkMat_OffWhite` triangle 65 by `0.00498052` m² at a plane gap of `0` m.
- `InkMat_StructuralGray` triangle 23 overlaps `InkMat_OffWhite` triangle 69 by `0.0174756` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 68 overlaps `InkMat_StructuralGray` triangle 21 by `0.00148548` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 71 overlaps `InkMat_StructuralGray` triangle 21 by `0.0062926` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 65 overlaps `InkMat_StructuralGray` triangle 21 by `0.00148548` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 69 overlaps `InkMat_StructuralGray` triangle 21 by `0.020377` m² at a plane gap of `0` m.
- `InkMat_StructuralGray` triangle 21 overlaps `InkMat_OffWhite` triangle 64 by `0.006466` m² at a plane gap of `0` m.

## pipe-long.glb

- `InkMat_StructuralGray` triangle 98 overlaps `InkMat_OffWhite` triangle 17 by `0.000571958` m² at a plane gap of `2.38419e-07` m.
- `InkMat_StructuralGray` triangle 98 overlaps `InkMat_OffWhite` triangle 18 by `0.00252578` m² at a plane gap of `2.38419e-07` m.
- `InkMat_StructuralGray` triangle 98 overlaps `InkMat_OffWhite` triangle 21 by `0.000925448` m² at a plane gap of `2.38419e-07` m.
- `InkMat_StructuralGray` triangle 98 overlaps `InkMat_OffWhite` triangle 22 by `0.00791342` m² at a plane gap of `2.38419e-07` m.
- `InkMat_StructuralGray` triangle 98 overlaps `InkMat_OffWhite` triangle 23 by `0.00149741` m² at a plane gap of `2.38419e-07` m.
- `InkMat_StructuralGray` triangle 54 overlaps `InkMat_OffWhite` triangle 31 by `0.000571958` m² at a plane gap of `2.38419e-07` m.
- `InkMat_StructuralGray` triangle 54 overlaps `InkMat_OffWhite` triangle 32 by `0.00252578` m² at a plane gap of `2.38419e-07` m.
- `InkMat_StructuralGray` triangle 54 overlaps `InkMat_OffWhite` triangle 34 by `0.000925448` m² at a plane gap of `2.38419e-07` m.
- `InkMat_StructuralGray` triangle 54 overlaps `InkMat_OffWhite` triangle 35 by `0.00848538` m² at a plane gap of `2.38419e-07` m.
- `InkMat_OffWhite` triangle 31 overlaps `InkMat_StructuralGray` triangle 55 by `0.00195382` m² at a plane gap of `2.38419e-07` m.
- `InkMat_OffWhite` triangle 34 overlaps `InkMat_StructuralGray` triangle 55 by `0.0129353` m² at a plane gap of `2.38419e-07` m.
- `InkMat_OffWhite` triangle 35 overlaps `InkMat_StructuralGray` triangle 55 by `0.0139418` m² at a plane gap of `2.38419e-07` m.
- `InkMat_OffWhite` triangle 17 overlaps `InkMat_StructuralGray` triangle 99 by `0.00195382` m² at a plane gap of `2.38419e-07` m.
- `InkMat_OffWhite` triangle 21 overlaps `InkMat_StructuralGray` triangle 99 by `0.0129353` m² at a plane gap of `2.38419e-07` m.
- `InkMat_OffWhite` triangle 22 overlaps `InkMat_StructuralGray` triangle 99 by `0.00594732` m² at a plane gap of `2.38419e-07` m.
- `InkMat_OffWhite` triangle 23 overlaps `InkMat_StructuralGray` triangle 99 by `0.0139418` m² at a plane gap of `2.38419e-07` m.
- `InkMat_StructuralGray` triangle 98 overlaps `InkMat_OffWhite` triangle 19 by `0.000571957` m² at a plane gap of `2.38419e-07` m.
- `InkMat_StructuralGray` triangle 99 overlaps `InkMat_OffWhite` triangle 19 by `0.00138186` m² at a plane gap of `2.38419e-07` m.
- `InkMat_StructuralGray` triangle 54 overlaps `InkMat_OffWhite` triangle 28 by `0.000571958` m² at a plane gap of `2.38419e-07` m.
- `InkMat_StructuralGray` triangle 55 overlaps `InkMat_OffWhite` triangle 28 by `0.00138187` m² at a plane gap of `2.38419e-07` m.
- `InkMat_StructuralGray` triangle 54 overlaps `InkMat_OffWhite` triangle 33 by `0.000925448` m² at a plane gap of `2.38419e-07` m.
- `InkMat_StructuralGray` triangle 55 overlaps `InkMat_OffWhite` triangle 33 by `0.00594732` m² at a plane gap of `2.38419e-07` m.
- `InkMat_StructuralGray` triangle 99 overlaps `InkMat_OffWhite` triangle 16 by `0.00195382` m² at a plane gap of `2.38419e-07` m.
- `InkMat_StructuralGray` triangle 55 overlaps `InkMat_OffWhite` triangle 30 by `0.00195382` m² at a plane gap of `2.38419e-07` m.
- `InkMat_OffWhite` triangle 34 overlaps `InkMat_StructuralGray` triangle 53 by `0.000925448` m² at a plane gap of `2.38419e-07` m.
- `InkMat_OffWhite` triangle 35 overlaps `InkMat_StructuralGray` triangle 53 by `0.00149741` m² at a plane gap of `2.38419e-07` m.
- `InkMat_OffWhite` triangle 28 overlaps `InkMat_StructuralGray` triangle 53 by `0.000571958` m² at a plane gap of `2.38419e-07` m.
- `InkMat_OffWhite` triangle 33 overlaps `InkMat_StructuralGray` triangle 53 by `0.00791342` m² at a plane gap of `2.38419e-07` m.
- `InkMat_OffWhite` triangle 30 overlaps `InkMat_StructuralGray` triangle 53 by `0.000571958` m² at a plane gap of `2.38419e-07` m.
- `InkMat_OffWhite` triangle 21 overlaps `InkMat_StructuralGray` triangle 97 by `0.000925448` m² at a plane gap of `2.38419e-07` m.
- `InkMat_OffWhite` triangle 22 overlaps `InkMat_StructuralGray` triangle 97 by `0.000925448` m² at a plane gap of `2.38419e-07` m.
- `InkMat_OffWhite` triangle 23 overlaps `InkMat_StructuralGray` triangle 97 by `0.00848538` m² at a plane gap of `2.38419e-07` m.
- `InkMat_OffWhite` triangle 19 overlaps `InkMat_StructuralGray` triangle 97 by `0.000571957` m² at a plane gap of `2.38419e-07` m.
- `InkMat_OffWhite` triangle 16 overlaps `InkMat_StructuralGray` triangle 97 by `0.000571958` m² at a plane gap of `2.38419e-07` m.
- `InkMat_StructuralGray` triangle 97 overlaps `InkMat_OffWhite` triangle 20 by `0.00252578` m² at a plane gap of `2.38419e-07` m.
- `InkMat_StructuralGray` triangle 53 overlaps `InkMat_OffWhite` triangle 29 by `0.00252578` m² at a plane gap of `2.38419e-07` m.

## pipe-manifold.glb

- `InkMat_OffWhite` triangle 6 overlaps `InkMat_StructuralGray` triangle 16 by `0.00298234` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 9 overlaps `InkMat_StructuralGray` triangle 16 by `0.00298234` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 10 overlaps `InkMat_StructuralGray` triangle 16 by `0.0072` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 11 overlaps `InkMat_StructuralGray` triangle 16 by `0.0072` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 7 overlaps `InkMat_StructuralGray` triangle 17 by `0.00298234` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 8 overlaps `InkMat_StructuralGray` triangle 17 by `0.00298234` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 10 overlaps `InkMat_StructuralGray` triangle 17 by `0.0072` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 11 overlaps `InkMat_StructuralGray` triangle 17 by `0.0072` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 104 overlaps `InkMat_StructuralGray` triangle 72 by `0.00149117` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 106 overlaps `InkMat_StructuralGray` triangle 72 by `0.00149117` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 107 overlaps `InkMat_StructuralGray` triangle 72 by `0.00298234` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 108 overlaps `InkMat_StructuralGray` triangle 72 by `0.0036` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 109 overlaps `InkMat_StructuralGray` triangle 72 by `0.0108` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 104 overlaps `InkMat_StructuralGray` triangle 73 by `0.00149117` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 105 overlaps `InkMat_StructuralGray` triangle 73 by `0.00298234` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 106 overlaps `InkMat_StructuralGray` triangle 73 by `0.00149117` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 108 overlaps `InkMat_StructuralGray` triangle 73 by `0.0108` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 109 overlaps `InkMat_StructuralGray` triangle 73 by `0.0036` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 76 overlaps `InkMat_StructuralGray` triangle 44 by `0.00149117` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 78 overlaps `InkMat_StructuralGray` triangle 44 by `0.00149117` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 79 overlaps `InkMat_StructuralGray` triangle 44 by `0.00298234` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 80 overlaps `InkMat_StructuralGray` triangle 44 by `0.0036` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 81 overlaps `InkMat_StructuralGray` triangle 44 by `0.0108` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 76 overlaps `InkMat_StructuralGray` triangle 45 by `0.00149117` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 77 overlaps `InkMat_StructuralGray` triangle 45 by `0.00298234` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 78 overlaps `InkMat_StructuralGray` triangle 45 by `0.00149117` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 80 overlaps `InkMat_StructuralGray` triangle 45 by `0.0108` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 81 overlaps `InkMat_StructuralGray` triangle 45 by `0.0036` m² at a plane gap of `0` m.

## pipe-riser.glb

- `InkMat_StructuralGray` triangle 82 overlaps `InkMat_OffWhite` triangle 17 by `0.000571957` m² at a plane gap of `0` m.
- `InkMat_StructuralGray` triangle 82 overlaps `InkMat_OffWhite` triangle 18 by `0.00252578` m² at a plane gap of `0` m.
- `InkMat_StructuralGray` triangle 82 overlaps `InkMat_OffWhite` triangle 21 by `0.000925446` m² at a plane gap of `0` m.
- `InkMat_StructuralGray` triangle 82 overlaps `InkMat_OffWhite` triangle 22 by `0.00791342` m² at a plane gap of `0` m.
- `InkMat_StructuralGray` triangle 82 overlaps `InkMat_OffWhite` triangle 23 by `0.0014974` m² at a plane gap of `0` m.
- `InkMat_StructuralGray` triangle 38 overlaps `InkMat_OffWhite` triangle 31 by `0.000571957` m² at a plane gap of `5.58794e-08` m.
- `InkMat_StructuralGray` triangle 38 overlaps `InkMat_OffWhite` triangle 32 by `0.00252578` m² at a plane gap of `5.58794e-08` m.
- `InkMat_StructuralGray` triangle 38 overlaps `InkMat_OffWhite` triangle 34 by `0.000925446` m² at a plane gap of `5.58794e-08` m.
- `InkMat_StructuralGray` triangle 38 overlaps `InkMat_OffWhite` triangle 35 by `0.00848538` m² at a plane gap of `5.58794e-08` m.
- `InkMat_OffWhite` triangle 31 overlaps `InkMat_StructuralGray` triangle 39 by `0.00195383` m² at a plane gap of `5.58794e-08` m.
- `InkMat_OffWhite` triangle 34 overlaps `InkMat_StructuralGray` triangle 39 by `0.0129353` m² at a plane gap of `5.58794e-08` m.
- `InkMat_OffWhite` triangle 35 overlaps `InkMat_StructuralGray` triangle 39 by `0.0139418` m² at a plane gap of `5.58794e-08` m.
- `InkMat_OffWhite` triangle 17 overlaps `InkMat_StructuralGray` triangle 83 by `0.00195383` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 21 overlaps `InkMat_StructuralGray` triangle 83 by `0.0129353` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 22 overlaps `InkMat_StructuralGray` triangle 83 by `0.00594732` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 23 overlaps `InkMat_StructuralGray` triangle 83 by `0.0139418` m² at a plane gap of `0` m.
- `InkMat_StructuralGray` triangle 82 overlaps `InkMat_OffWhite` triangle 19 by `0.000571957` m² at a plane gap of `0` m.
- `InkMat_StructuralGray` triangle 83 overlaps `InkMat_OffWhite` triangle 19 by `0.00138187` m² at a plane gap of `0` m.
- `InkMat_StructuralGray` triangle 38 overlaps `InkMat_OffWhite` triangle 28 by `0.000571957` m² at a plane gap of `5.58794e-08` m.
- `InkMat_StructuralGray` triangle 39 overlaps `InkMat_OffWhite` triangle 28 by `0.00138187` m² at a plane gap of `5.58794e-08` m.
- `InkMat_StructuralGray` triangle 38 overlaps `InkMat_OffWhite` triangle 33 by `0.000925446` m² at a plane gap of `5.58794e-08` m.
- `InkMat_StructuralGray` triangle 39 overlaps `InkMat_OffWhite` triangle 33 by `0.00594732` m² at a plane gap of `5.58794e-08` m.
- `InkMat_StructuralGray` triangle 83 overlaps `InkMat_OffWhite` triangle 16 by `0.00195383` m² at a plane gap of `0` m.
- `InkMat_StructuralGray` triangle 39 overlaps `InkMat_OffWhite` triangle 30 by `0.00195383` m² at a plane gap of `5.58794e-08` m.
- `InkMat_OffWhite` triangle 34 overlaps `InkMat_StructuralGray` triangle 37 by `0.000925446` m² at a plane gap of `5.58794e-08` m.
- `InkMat_OffWhite` triangle 35 overlaps `InkMat_StructuralGray` triangle 37 by `0.0014974` m² at a plane gap of `5.58794e-08` m.
- `InkMat_OffWhite` triangle 28 overlaps `InkMat_StructuralGray` triangle 37 by `0.000571957` m² at a plane gap of `5.58794e-08` m.
- `InkMat_OffWhite` triangle 33 overlaps `InkMat_StructuralGray` triangle 37 by `0.00791342` m² at a plane gap of `5.58794e-08` m.
- `InkMat_OffWhite` triangle 30 overlaps `InkMat_StructuralGray` triangle 37 by `0.000571957` m² at a plane gap of `5.58794e-08` m.
- `InkMat_OffWhite` triangle 21 overlaps `InkMat_StructuralGray` triangle 81 by `0.000925446` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 22 overlaps `InkMat_StructuralGray` triangle 81 by `0.000925446` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 23 overlaps `InkMat_StructuralGray` triangle 81 by `0.00848538` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 19 overlaps `InkMat_StructuralGray` triangle 81 by `0.000571957` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 16 overlaps `InkMat_StructuralGray` triangle 81 by `0.000571957` m² at a plane gap of `0` m.
- `InkMat_StructuralGray` triangle 81 overlaps `InkMat_OffWhite` triangle 20 by `0.00252578` m² at a plane gap of `0` m.
- `InkMat_StructuralGray` triangle 37 overlaps `InkMat_OffWhite` triangle 29 by `0.00252578` m² at a plane gap of `5.58794e-08` m.

## pipe-short.glb

- `InkMat_StructuralGray` triangle 70 overlaps `InkMat_OffWhite` triangle 17 by `0.000571957` m² at a plane gap of `0` m.
- `InkMat_StructuralGray` triangle 70 overlaps `InkMat_OffWhite` triangle 18 by `0.00252578` m² at a plane gap of `0` m.
- `InkMat_StructuralGray` triangle 70 overlaps `InkMat_OffWhite` triangle 21 by `0.000925447` m² at a plane gap of `0` m.
- `InkMat_StructuralGray` triangle 70 overlaps `InkMat_OffWhite` triangle 22 by `0.00791342` m² at a plane gap of `0` m.
- `InkMat_StructuralGray` triangle 70 overlaps `InkMat_OffWhite` triangle 23 by `0.0014974` m² at a plane gap of `0` m.
- `InkMat_StructuralGray` triangle 34 overlaps `InkMat_OffWhite` triangle 31 by `0.000571957` m² at a plane gap of `0` m.
- `InkMat_StructuralGray` triangle 34 overlaps `InkMat_OffWhite` triangle 32 by `0.00252578` m² at a plane gap of `0` m.
- `InkMat_StructuralGray` triangle 34 overlaps `InkMat_OffWhite` triangle 34 by `0.000925447` m² at a plane gap of `0` m.
- `InkMat_StructuralGray` triangle 34 overlaps `InkMat_OffWhite` triangle 35 by `0.00848538` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 31 overlaps `InkMat_StructuralGray` triangle 35 by `0.00195382` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 34 overlaps `InkMat_StructuralGray` triangle 35 by `0.0129353` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 35 overlaps `InkMat_StructuralGray` triangle 35 by `0.0139418` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 17 overlaps `InkMat_StructuralGray` triangle 71 by `0.00195382` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 21 overlaps `InkMat_StructuralGray` triangle 71 by `0.0129353` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 22 overlaps `InkMat_StructuralGray` triangle 71 by `0.00594732` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 23 overlaps `InkMat_StructuralGray` triangle 71 by `0.0139418` m² at a plane gap of `0` m.
- `InkMat_StructuralGray` triangle 70 overlaps `InkMat_OffWhite` triangle 19 by `0.000571957` m² at a plane gap of `0` m.
- `InkMat_StructuralGray` triangle 71 overlaps `InkMat_OffWhite` triangle 19 by `0.00138187` m² at a plane gap of `0` m.
- `InkMat_StructuralGray` triangle 34 overlaps `InkMat_OffWhite` triangle 28 by `0.000571957` m² at a plane gap of `0` m.
- `InkMat_StructuralGray` triangle 35 overlaps `InkMat_OffWhite` triangle 28 by `0.00138187` m² at a plane gap of `0` m.
- `InkMat_StructuralGray` triangle 34 overlaps `InkMat_OffWhite` triangle 33 by `0.000925446` m² at a plane gap of `0` m.
- `InkMat_StructuralGray` triangle 35 overlaps `InkMat_OffWhite` triangle 33 by `0.00594732` m² at a plane gap of `0` m.
- `InkMat_StructuralGray` triangle 71 overlaps `InkMat_OffWhite` triangle 16 by `0.00195382` m² at a plane gap of `0` m.
- `InkMat_StructuralGray` triangle 35 overlaps `InkMat_OffWhite` triangle 30 by `0.00195382` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 34 overlaps `InkMat_StructuralGray` triangle 33 by `0.000925447` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 35 overlaps `InkMat_StructuralGray` triangle 33 by `0.0014974` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 28 overlaps `InkMat_StructuralGray` triangle 33 by `0.000571957` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 33 overlaps `InkMat_StructuralGray` triangle 33 by `0.00791342` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 30 overlaps `InkMat_StructuralGray` triangle 33 by `0.000571957` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 21 overlaps `InkMat_StructuralGray` triangle 69 by `0.000925447` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 22 overlaps `InkMat_StructuralGray` triangle 69 by `0.000925446` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 23 overlaps `InkMat_StructuralGray` triangle 69 by `0.00848538` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 19 overlaps `InkMat_StructuralGray` triangle 69 by `0.000571957` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 16 overlaps `InkMat_StructuralGray` triangle 69 by `0.000571957` m² at a plane gap of `0` m.
- `InkMat_StructuralGray` triangle 69 overlaps `InkMat_OffWhite` triangle 20 by `0.00252578` m² at a plane gap of `0` m.
- `InkMat_StructuralGray` triangle 33 overlaps `InkMat_OffWhite` triangle 29 by `0.00252578` m² at a plane gap of `0` m.

## pipe-straight.glb

- `InkMat_StructuralGray` triangle 70 overlaps `InkMat_OffWhite` triangle 17 by `0.000571958` m² at a plane gap of `0` m.
- `InkMat_StructuralGray` triangle 70 overlaps `InkMat_OffWhite` triangle 18 by `0.00252578` m² at a plane gap of `0` m.
- `InkMat_StructuralGray` triangle 70 overlaps `InkMat_OffWhite` triangle 21 by `0.000925447` m² at a plane gap of `0` m.
- `InkMat_StructuralGray` triangle 70 overlaps `InkMat_OffWhite` triangle 22 by `0.00791342` m² at a plane gap of `0` m.
- `InkMat_StructuralGray` triangle 70 overlaps `InkMat_OffWhite` triangle 23 by `0.00149741` m² at a plane gap of `0` m.
- `InkMat_StructuralGray` triangle 34 overlaps `InkMat_OffWhite` triangle 31 by `0.000571957` m² at a plane gap of `0` m.
- `InkMat_StructuralGray` triangle 34 overlaps `InkMat_OffWhite` triangle 32 by `0.00252578` m² at a plane gap of `0` m.
- `InkMat_StructuralGray` triangle 34 overlaps `InkMat_OffWhite` triangle 34 by `0.000925447` m² at a plane gap of `0` m.
- `InkMat_StructuralGray` triangle 34 overlaps `InkMat_OffWhite` triangle 35 by `0.00848538` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 31 overlaps `InkMat_StructuralGray` triangle 35 by `0.00195382` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 34 overlaps `InkMat_StructuralGray` triangle 35 by `0.0129353` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 35 overlaps `InkMat_StructuralGray` triangle 35 by `0.0139418` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 17 overlaps `InkMat_StructuralGray` triangle 71 by `0.00195383` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 21 overlaps `InkMat_StructuralGray` triangle 71 by `0.0129353` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 22 overlaps `InkMat_StructuralGray` triangle 71 by `0.00594732` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 23 overlaps `InkMat_StructuralGray` triangle 71 by `0.0139418` m² at a plane gap of `0` m.
- `InkMat_StructuralGray` triangle 70 overlaps `InkMat_OffWhite` triangle 19 by `0.000571957` m² at a plane gap of `0` m.
- `InkMat_StructuralGray` triangle 71 overlaps `InkMat_OffWhite` triangle 19 by `0.00138187` m² at a plane gap of `0` m.
- `InkMat_StructuralGray` triangle 34 overlaps `InkMat_OffWhite` triangle 28 by `0.000571958` m² at a plane gap of `0` m.
- `InkMat_StructuralGray` triangle 35 overlaps `InkMat_OffWhite` triangle 28 by `0.00138187` m² at a plane gap of `0` m.
- `InkMat_StructuralGray` triangle 34 overlaps `InkMat_OffWhite` triangle 33 by `0.000925447` m² at a plane gap of `0` m.
- `InkMat_StructuralGray` triangle 35 overlaps `InkMat_OffWhite` triangle 33 by `0.00594732` m² at a plane gap of `0` m.
- `InkMat_StructuralGray` triangle 71 overlaps `InkMat_OffWhite` triangle 16 by `0.00195383` m² at a plane gap of `0` m.
- `InkMat_StructuralGray` triangle 35 overlaps `InkMat_OffWhite` triangle 30 by `0.00195382` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 34 overlaps `InkMat_StructuralGray` triangle 33 by `0.000925447` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 35 overlaps `InkMat_StructuralGray` triangle 33 by `0.0014974` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 28 overlaps `InkMat_StructuralGray` triangle 33 by `0.000571958` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 33 overlaps `InkMat_StructuralGray` triangle 33 by `0.00791342` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 30 overlaps `InkMat_StructuralGray` triangle 33 by `0.000571957` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 21 overlaps `InkMat_StructuralGray` triangle 69 by `0.000925447` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 22 overlaps `InkMat_StructuralGray` triangle 69 by `0.000925447` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 23 overlaps `InkMat_StructuralGray` triangle 69 by `0.00848538` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 19 overlaps `InkMat_StructuralGray` triangle 69 by `0.000571957` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 16 overlaps `InkMat_StructuralGray` triangle 69 by `0.000571958` m² at a plane gap of `0` m.
- `InkMat_StructuralGray` triangle 69 overlaps `InkMat_OffWhite` triangle 20 by `0.00252578` m² at a plane gap of `0` m.
- `InkMat_StructuralGray` triangle 33 overlaps `InkMat_OffWhite` triangle 29 by `0.00252578` m² at a plane gap of `0` m.

## pipe-tee.glb

- `InkMat_StructuralGray` triangle 81 overlaps `InkMat_OffWhite` triangle 45 by `0.000571958` m² at a plane gap of `7.25374e-08` m.
- `InkMat_StructuralGray` triangle 81 overlaps `InkMat_OffWhite` triangle 46 by `0.00252578` m² at a plane gap of `5.96046e-08` m.
- `InkMat_StructuralGray` triangle 81 overlaps `InkMat_OffWhite` triangle 49 by `0.000925447` m² at a plane gap of `7.25374e-08` m.
- `InkMat_StructuralGray` triangle 81 overlaps `InkMat_OffWhite` triangle 50 by `0.00791342` m² at a plane gap of `5.96046e-08` m.
- `InkMat_StructuralGray` triangle 81 overlaps `InkMat_OffWhite` triangle 51 by `0.0014974` m² at a plane gap of `7.25374e-08` m.
- `InkMat_StructuralGray` triangle 40 overlaps `InkMat_OffWhite` triangle 64 by `0.00252578` m² at a plane gap of `5.96046e-08` m.
- `InkMat_StructuralGray` triangle 39 overlaps `InkMat_OffWhite` triangle 65 by `0.000571958` m² at a plane gap of `0` m.
- `InkMat_StructuralGray` triangle 40 overlaps `InkMat_OffWhite` triangle 65 by `0.000571957` m² at a plane gap of `5.96046e-08` m.
- `InkMat_StructuralGray` triangle 41 overlaps `InkMat_OffWhite` triangle 65 by `0.00138187` m² at a plane gap of `5.96046e-08` m.
- `InkMat_StructuralGray` triangle 40 overlaps `InkMat_OffWhite` triangle 67 by `0.00791341` m² at a plane gap of `5.96046e-08` m.
- `InkMat_StructuralGray` triangle 41 overlaps `InkMat_OffWhite` triangle 67 by `0.00687277` m² at a plane gap of `5.96046e-08` m.
- `InkMat_StructuralGray` triangle 39 overlaps `InkMat_OffWhite` triangle 68 by `0.00242285` m² at a plane gap of `0` m.
- `InkMat_StructuralGray` triangle 40 overlaps `InkMat_OffWhite` triangle 68 by `0.00242285` m² at a plane gap of `5.96046e-08` m.
- `InkMat_StructuralGray` triangle 41 overlaps `InkMat_OffWhite` triangle 68 by `0.0190789` m² at a plane gap of `5.96046e-08` m.
- `InkMat_OffWhite` triangle 45 overlaps `InkMat_StructuralGray` triangle 82 by `0.000571957` m² at a plane gap of `5.96046e-08` m.
- `InkMat_OffWhite` triangle 49 overlaps `InkMat_StructuralGray` triangle 82 by `0.00791342` m² at a plane gap of `5.96046e-08` m.
- `InkMat_OffWhite` triangle 51 overlaps `InkMat_StructuralGray` triangle 82 by `0.00242285` m² at a plane gap of `5.96046e-08` m.
- `InkMat_OffWhite` triangle 45 overlaps `InkMat_StructuralGray` triangle 83 by `0.00138187` m² at a plane gap of `5.96046e-08` m.
- `InkMat_OffWhite` triangle 49 overlaps `InkMat_StructuralGray` triangle 83 by `0.00594733` m² at a plane gap of `5.96046e-08` m.
- `InkMat_OffWhite` triangle 50 overlaps `InkMat_StructuralGray` triangle 83 by `0.00687277` m² at a plane gap of `5.96046e-08` m.
- `InkMat_OffWhite` triangle 51 overlaps `InkMat_StructuralGray` triangle 83 by `0.0200043` m² at a plane gap of `5.96046e-08` m.
- `InkMat_StructuralGray` triangle 81 overlaps `InkMat_OffWhite` triangle 47 by `0.000571958` m² at a plane gap of `5.96046e-08` m.
- `InkMat_StructuralGray` triangle 83 overlaps `InkMat_OffWhite` triangle 47 by `0.00195383` m² at a plane gap of `5.96046e-08` m.
- `InkMat_StructuralGray` triangle 39 overlaps `InkMat_OffWhite` triangle 61 by `0.00252578` m² at a plane gap of `0` m.
- `InkMat_StructuralGray` triangle 39 overlaps `InkMat_OffWhite` triangle 66 by `0.00791342` m² at a plane gap of `0` m.
- `InkMat_StructuralGray` triangle 41 overlaps `InkMat_OffWhite` triangle 66 by `0.00687277` m² at a plane gap of `5.96046e-08` m.
- `InkMat_StructuralGray` triangle 82 overlaps `InkMat_OffWhite` triangle 44 by `0.00252578` m² at a plane gap of `5.96046e-08` m.
- `InkMat_StructuralGray` triangle 40 overlaps `InkMat_OffWhite` triangle 63 by `0.000571957` m² at a plane gap of `5.96046e-08` m.
- `InkMat_StructuralGray` triangle 41 overlaps `InkMat_OffWhite` triangle 63 by `0.00195383` m² at a plane gap of `5.96046e-08` m.
- `InkMat_StructuralGray` triangle 82 overlaps `InkMat_OffWhite` triangle 48 by `0.000571957` m² at a plane gap of `5.96046e-08` m.
- `InkMat_StructuralGray` triangle 83 overlaps `InkMat_OffWhite` triangle 48 by `0.00195383` m² at a plane gap of `5.96046e-08` m.
- `InkMat_StructuralGray` triangle 39 overlaps `InkMat_OffWhite` triangle 62 by `0.000571958` m² at a plane gap of `0` m.
- `InkMat_StructuralGray` triangle 41 overlaps `InkMat_OffWhite` triangle 62 by `0.00195383` m² at a plane gap of `5.96046e-08` m.
- `InkMat_OffWhite` triangle 80 overlaps `InkMat_StructuralGray` triangle 106 by `0.000571958` m² at a plane gap of `5.96046e-08` m.
- `InkMat_OffWhite` triangle 81 overlaps `InkMat_StructuralGray` triangle 106 by `0.00252578` m² at a plane gap of `5.96046e-08` m.
- `InkMat_OffWhite` triangle 82 overlaps `InkMat_StructuralGray` triangle 106 by `0.000571958` m² at a plane gap of `7.25374e-08` m.
- `InkMat_OffWhite` triangle 84 overlaps `InkMat_StructuralGray` triangle 106 by `0.00791342` m² at a plane gap of `5.96046e-08` m.
- `InkMat_OffWhite` triangle 85 overlaps `InkMat_StructuralGray` triangle 106 by `0.00242285` m² at a plane gap of `7.25374e-08` m.
- `InkMat_OffWhite` triangle 79 overlaps `InkMat_StructuralGray` triangle 107 by `0.00195383` m² at a plane gap of `7.25374e-08` m.
- `InkMat_OffWhite` triangle 80 overlaps `InkMat_StructuralGray` triangle 107 by `0.00195382` m² at a plane gap of `5.96046e-08` m.
- `InkMat_OffWhite` triangle 82 overlaps `InkMat_StructuralGray` triangle 107 by `0.00138187` m² at a plane gap of `7.25374e-08` m.
- `InkMat_OffWhite` triangle 83 overlaps `InkMat_StructuralGray` triangle 107 by `0.00687277` m² at a plane gap of `7.25374e-08` m.
- `InkMat_OffWhite` triangle 84 overlaps `InkMat_StructuralGray` triangle 107 by `0.00687277` m² at a plane gap of `5.96046e-08` m.
- `InkMat_OffWhite` triangle 85 overlaps `InkMat_StructuralGray` triangle 107 by `0.0190789` m² at a plane gap of `7.25374e-08` m.
- `InkMat_OffWhite` triangle 78 overlaps `InkMat_StructuralGray` triangle 105 by `0.00252578` m² at a plane gap of `5.96046e-08` m.
- `InkMat_OffWhite` triangle 79 overlaps `InkMat_StructuralGray` triangle 105 by `0.000571957` m² at a plane gap of `5.96046e-08` m.
- `InkMat_OffWhite` triangle 82 overlaps `InkMat_StructuralGray` triangle 105 by `0.000571957` m² at a plane gap of `5.96046e-08` m.
- `InkMat_OffWhite` triangle 83 overlaps `InkMat_StructuralGray` triangle 105 by `0.00791342` m² at a plane gap of `5.96046e-08` m.
- `InkMat_OffWhite` triangle 85 overlaps `InkMat_StructuralGray` triangle 105 by `0.00242285` m² at a plane gap of `5.96046e-08` m.

## pipe-valve.glb

- `InkMat_StructuralGray` triangle 94 overlaps `InkMat_OffWhite` triangle 17 by `0.000571958` m² at a plane gap of `7.25374e-08` m.
- `InkMat_StructuralGray` triangle 94 overlaps `InkMat_OffWhite` triangle 18 by `0.00252578` m² at a plane gap of `5.96046e-08` m.
- `InkMat_StructuralGray` triangle 94 overlaps `InkMat_OffWhite` triangle 21 by `0.000925447` m² at a plane gap of `7.25374e-08` m.
- `InkMat_StructuralGray` triangle 94 overlaps `InkMat_OffWhite` triangle 22 by `0.00791342` m² at a plane gap of `5.96046e-08` m.
- `InkMat_StructuralGray` triangle 94 overlaps `InkMat_OffWhite` triangle 23 by `0.0014974` m² at a plane gap of `7.25374e-08` m.
- `InkMat_StructuralGray` triangle 46 overlaps `InkMat_OffWhite` triangle 31 by `0.000571958` m² at a plane gap of `7.25374e-08` m.
- `InkMat_StructuralGray` triangle 46 overlaps `InkMat_OffWhite` triangle 32 by `0.00252578` m² at a plane gap of `5.96046e-08` m.
- `InkMat_StructuralGray` triangle 46 overlaps `InkMat_OffWhite` triangle 34 by `0.000925447` m² at a plane gap of `7.25374e-08` m.
- `InkMat_StructuralGray` triangle 46 overlaps `InkMat_OffWhite` triangle 35 by `0.00848538` m² at a plane gap of `7.25374e-08` m.
- `InkMat_OffWhite` triangle 31 overlaps `InkMat_StructuralGray` triangle 47 by `0.00195383` m² at a plane gap of `5.96046e-08` m.
- `InkMat_OffWhite` triangle 34 overlaps `InkMat_StructuralGray` triangle 47 by `0.0129353` m² at a plane gap of `5.96046e-08` m.
- `InkMat_OffWhite` triangle 35 overlaps `InkMat_StructuralGray` triangle 47 by `0.0139418` m² at a plane gap of `5.96046e-08` m.
- `InkMat_OffWhite` triangle 17 overlaps `InkMat_StructuralGray` triangle 95 by `0.00195383` m² at a plane gap of `5.96046e-08` m.
- `InkMat_OffWhite` triangle 21 overlaps `InkMat_StructuralGray` triangle 95 by `0.0129353` m² at a plane gap of `5.96046e-08` m.
- `InkMat_OffWhite` triangle 22 overlaps `InkMat_StructuralGray` triangle 95 by `0.00594732` m² at a plane gap of `5.96046e-08` m.
- `InkMat_OffWhite` triangle 23 overlaps `InkMat_StructuralGray` triangle 95 by `0.0139418` m² at a plane gap of `5.96046e-08` m.
- `InkMat_StructuralGray` triangle 94 overlaps `InkMat_OffWhite` triangle 19 by `0.000571958` m² at a plane gap of `5.96046e-08` m.
- `InkMat_StructuralGray` triangle 95 overlaps `InkMat_OffWhite` triangle 19 by `0.00138187` m² at a plane gap of `5.96046e-08` m.
- `InkMat_StructuralGray` triangle 46 overlaps `InkMat_OffWhite` triangle 28 by `0.000571957` m² at a plane gap of `5.96046e-08` m.
- `InkMat_StructuralGray` triangle 47 overlaps `InkMat_OffWhite` triangle 28 by `0.00138187` m² at a plane gap of `5.96046e-08` m.
- `InkMat_StructuralGray` triangle 46 overlaps `InkMat_OffWhite` triangle 33 by `0.000925446` m² at a plane gap of `7.25374e-08` m.
- `InkMat_StructuralGray` triangle 47 overlaps `InkMat_OffWhite` triangle 33 by `0.00594732` m² at a plane gap of `5.96046e-08` m.
- `InkMat_StructuralGray` triangle 95 overlaps `InkMat_OffWhite` triangle 16 by `0.00195383` m² at a plane gap of `5.96046e-08` m.
- `InkMat_StructuralGray` triangle 47 overlaps `InkMat_OffWhite` triangle 30 by `0.00195383` m² at a plane gap of `5.96046e-08` m.
- `InkMat_OffWhite` triangle 34 overlaps `InkMat_StructuralGray` triangle 45 by `0.000925447` m² at a plane gap of `7.25374e-08` m.
- `InkMat_OffWhite` triangle 35 overlaps `InkMat_StructuralGray` triangle 45 by `0.0014974` m² at a plane gap of `7.25374e-08` m.
- `InkMat_OffWhite` triangle 28 overlaps `InkMat_StructuralGray` triangle 45 by `0.000571957` m² at a plane gap of `5.96046e-08` m.
- `InkMat_OffWhite` triangle 33 overlaps `InkMat_StructuralGray` triangle 45 by `0.00791342` m² at a plane gap of `5.96046e-08` m.
- `InkMat_OffWhite` triangle 30 overlaps `InkMat_StructuralGray` triangle 45 by `0.000571958` m² at a plane gap of `7.25374e-08` m.
- `InkMat_OffWhite` triangle 21 overlaps `InkMat_StructuralGray` triangle 93 by `0.000925447` m² at a plane gap of `7.25374e-08` m.
- `InkMat_OffWhite` triangle 22 overlaps `InkMat_StructuralGray` triangle 93 by `0.000925446` m² at a plane gap of `7.25374e-08` m.
- `InkMat_OffWhite` triangle 23 overlaps `InkMat_StructuralGray` triangle 93 by `0.00848538` m² at a plane gap of `7.25374e-08` m.
- `InkMat_OffWhite` triangle 19 overlaps `InkMat_StructuralGray` triangle 93 by `0.000571958` m² at a plane gap of `5.96046e-08` m.
- `InkMat_OffWhite` triangle 16 overlaps `InkMat_StructuralGray` triangle 93 by `0.000571958` m² at a plane gap of `7.25374e-08` m.
- `InkMat_StructuralGray` triangle 93 overlaps `InkMat_OffWhite` triangle 20 by `0.00252578` m² at a plane gap of `5.96046e-08` m.
- `InkMat_StructuralGray` triangle 45 overlaps `InkMat_OffWhite` triangle 29 by `0.00252578` m² at a plane gap of `5.96046e-08` m.

## pipe-vertical-elbow.glb

- `InkMat_StructuralGray` triangle 34 overlaps `InkMat_OffWhite` triangle 63 by `0.000571957` m² at a plane gap of `7.45058e-09` m.
- `InkMat_StructuralGray` triangle 34 overlaps `InkMat_OffWhite` triangle 64 by `0.00252578` m² at a plane gap of `7.45058e-09` m.
- `InkMat_StructuralGray` triangle 34 overlaps `InkMat_OffWhite` triangle 66 by `0.000925446` m² at a plane gap of `7.45058e-09` m.
- `InkMat_StructuralGray` triangle 34 overlaps `InkMat_OffWhite` triangle 67 by `0.00848538` m² at a plane gap of `7.45058e-09` m.
- `InkMat_OffWhite` triangle 63 overlaps `InkMat_StructuralGray` triangle 35 by `0.00195383` m² at a plane gap of `7.45058e-09` m.
- `InkMat_OffWhite` triangle 66 overlaps `InkMat_StructuralGray` triangle 35 by `0.0129353` m² at a plane gap of `7.45058e-09` m.
- `InkMat_OffWhite` triangle 67 overlaps `InkMat_StructuralGray` triangle 35 by `0.0139418` m² at a plane gap of `7.45058e-09` m.
- `InkMat_StructuralGray` triangle 34 overlaps `InkMat_OffWhite` triangle 60 by `0.000571957` m² at a plane gap of `7.45058e-09` m.
- `InkMat_StructuralGray` triangle 35 overlaps `InkMat_OffWhite` triangle 60 by `0.00138187` m² at a plane gap of `7.45058e-09` m.
- `InkMat_StructuralGray` triangle 34 overlaps `InkMat_OffWhite` triangle 65 by `0.000925446` m² at a plane gap of `7.45058e-09` m.
- `InkMat_StructuralGray` triangle 35 overlaps `InkMat_OffWhite` triangle 65 by `0.00594732` m² at a plane gap of `7.45058e-09` m.
- `InkMat_StructuralGray` triangle 35 overlaps `InkMat_OffWhite` triangle 62 by `0.00195383` m² at a plane gap of `7.45058e-09` m.
- `InkMat_OffWhite` triangle 66 overlaps `InkMat_StructuralGray` triangle 33 by `0.000925446` m² at a plane gap of `7.45058e-09` m.
- `InkMat_OffWhite` triangle 67 overlaps `InkMat_StructuralGray` triangle 33 by `0.0014974` m² at a plane gap of `7.45058e-09` m.
- `InkMat_OffWhite` triangle 60 overlaps `InkMat_StructuralGray` triangle 33 by `0.000571957` m² at a plane gap of `7.45058e-09` m.
- `InkMat_OffWhite` triangle 65 overlaps `InkMat_StructuralGray` triangle 33 by `0.00791342` m² at a plane gap of `7.45058e-09` m.
- `InkMat_OffWhite` triangle 62 overlaps `InkMat_StructuralGray` triangle 33 by `0.000571957` m² at a plane gap of `7.45058e-09` m.
- `InkMat_StructuralGray` triangle 33 overlaps `InkMat_OffWhite` triangle 61 by `0.00252578` m² at a plane gap of `7.45058e-09` m.
- `InkMat_OffWhite` triangle 132 overlaps `InkMat_StructuralGray` triangle 69 by `0.000571957` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 135 overlaps `InkMat_StructuralGray` triangle 69 by `0.000571957` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 136 overlaps `InkMat_StructuralGray` triangle 69 by `0.00252578` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 137 overlaps `InkMat_StructuralGray` triangle 69 by `0.000925446` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 138 overlaps `InkMat_StructuralGray` triangle 69 by `0.000925446` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 139 overlaps `InkMat_StructuralGray` triangle 69 by `0.00848537` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 133 overlaps `InkMat_StructuralGray` triangle 70 by `0.000571957` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 134 overlaps `InkMat_StructuralGray` triangle 70 by `0.00252578` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 135 overlaps `InkMat_StructuralGray` triangle 70 by `0.000571957` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 137 overlaps `InkMat_StructuralGray` triangle 70 by `0.000925446` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 138 overlaps `InkMat_StructuralGray` triangle 70 by `0.00791342` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 139 overlaps `InkMat_StructuralGray` triangle 70 by `0.0014974` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 132 overlaps `InkMat_StructuralGray` triangle 71 by `0.00195383` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 133 overlaps `InkMat_StructuralGray` triangle 71 by `0.00195383` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 135 overlaps `InkMat_StructuralGray` triangle 71 by `0.00138187` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 137 overlaps `InkMat_StructuralGray` triangle 71 by `0.0129353` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 138 overlaps `InkMat_StructuralGray` triangle 71 by `0.00594732` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 139 overlaps `InkMat_StructuralGray` triangle 71 by `0.0139418` m² at a plane gap of `0` m.

## ramp-low.glb

- `InkMat_OffWhite` triangle 4 overlaps `InkMat_StructuralGray` triangle 4 by `0.278248` m² at a plane gap of `5.96046e-08` m.
- `InkMat_OffWhite` triangle 4 overlaps `InkMat_StructuralGray` triangle 5 by `0.0989445` m² at a plane gap of `5.96046e-08` m.
- `InkMat_StructuralGray` triangle 12 overlaps `InkMat_OffWhite` triangle 5 by `0.0806112` m² at a plane gap of `5.96046e-08` m.
- `InkMat_StructuralGray` triangle 13 overlaps `InkMat_OffWhite` triangle 5 by `0.296581` m² at a plane gap of `5.96046e-08` m.

## roof-access-hatch.glb

- `InkMat_OffWhite` triangle 10 overlaps `InkMat_StructuralGray` triangle 8 by `0.0486031` m² at a plane gap of `2.98023e-08` m.
- `InkMat_OffWhite` triangle 10 overlaps `InkMat_StructuralGray` triangle 9 by `0.0457969` m² at a plane gap of `2.98023e-08` m.
- `InkMat_OffWhite` triangle 11 overlaps `InkMat_StructuralGray` triangle 9 by `0.00300308` m² at a plane gap of `2.98023e-08` m.
- `InkMat_OffWhite` triangle 11 overlaps `InkMat_StructuralGray` triangle 32 by `0.0424` m² at a plane gap of `2.98023e-08` m.
- `InkMat_OffWhite` triangle 11 overlaps `InkMat_StructuralGray` triangle 33 by `0.0424` m² at a plane gap of `2.98023e-08` m.
- `InkMat_OffWhite` triangle 10 overlaps `InkMat_StructuralGray` triangle 44 by `0.0424` m² at a plane gap of `2.98023e-08` m.
- `InkMat_OffWhite` triangle 10 overlaps `InkMat_StructuralGray` triangle 45 by `0.0424` m² at a plane gap of `2.98023e-08` m.
- `InkMat_OffWhite` triangle 10 overlaps `InkMat_StructuralGray` triangle 20 by `0.00300308` m² at a plane gap of `2.98023e-08` m.
- `InkMat_OffWhite` triangle 11 overlaps `InkMat_StructuralGray` triangle 20 by `0.0457969` m² at a plane gap of `2.98023e-08` m.
- `InkMat_OffWhite` triangle 11 overlaps `InkMat_StructuralGray` triangle 21 by `0.0486031` m² at a plane gap of `2.98023e-08` m.

## roof-duct-curb.glb

- `InkMat_OffWhite` triangle 10 overlaps `InkMat_StructuralGray` triangle 8 by `0.0924826` m² at a plane gap of `2.98023e-08` m.
- `InkMat_OffWhite` triangle 10 overlaps `InkMat_StructuralGray` triangle 9 by `0.0863174` m² at a plane gap of `2.98023e-08` m.
- `InkMat_OffWhite` triangle 11 overlaps `InkMat_StructuralGray` triangle 9 by `0.00668264` m² at a plane gap of `2.98023e-08` m.
- `InkMat_OffWhite` triangle 11 overlaps `InkMat_StructuralGray` triangle 32 by `0.0786` m² at a plane gap of `2.98023e-08` m.
- `InkMat_OffWhite` triangle 11 overlaps `InkMat_StructuralGray` triangle 33 by `0.0786` m² at a plane gap of `2.98023e-08` m.
- `InkMat_OffWhite` triangle 10 overlaps `InkMat_StructuralGray` triangle 44 by `0.0786` m² at a plane gap of `2.98023e-08` m.
- `InkMat_OffWhite` triangle 10 overlaps `InkMat_StructuralGray` triangle 45 by `0.0786` m² at a plane gap of `2.98023e-08` m.
- `InkMat_OffWhite` triangle 10 overlaps `InkMat_StructuralGray` triangle 20 by `0.00668264` m² at a plane gap of `2.98023e-08` m.
- `InkMat_OffWhite` triangle 11 overlaps `InkMat_StructuralGray` triangle 20 by `0.0863174` m² at a plane gap of `2.98023e-08` m.
- `InkMat_OffWhite` triangle 11 overlaps `InkMat_StructuralGray` triangle 21 by `0.0924826` m² at a plane gap of `2.98023e-08` m.

## roof-equipment-plinth.glb

- `InkMat_OffWhite` triangle 10 overlaps `InkMat_StructuralGray` triangle 35 by `0.00132548` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 10 overlaps `InkMat_StructuralGray` triangle 51 by `0.00132548` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 10 overlaps `InkMat_StructuralGray` triangle 32 by `0.00132548` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 11 overlaps `InkMat_StructuralGray` triangle 34 by `0.00132548` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 10 overlaps `InkMat_StructuralGray` triangle 36 by `0.0032` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 11 overlaps `InkMat_StructuralGray` triangle 36 by `0.0032` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 10 overlaps `InkMat_StructuralGray` triangle 37 by `0.0032` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 11 overlaps `InkMat_StructuralGray` triangle 37 by `0.0032` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 10 overlaps `InkMat_StructuralGray` triangle 48 by `0.00132548` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 10 overlaps `InkMat_StructuralGray` triangle 50 by `0.00132548` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 10 overlaps `InkMat_StructuralGray` triangle 52 by `0.0064` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 10 overlaps `InkMat_StructuralGray` triangle 53 by `0.0064` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 11 overlaps `InkMat_StructuralGray` triangle 33 by `0.00132548` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 10 overlaps `InkMat_StructuralGray` triangle 49 by `0.00132548` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 11 overlaps `InkMat_StructuralGray` triangle 87 by `0.00132548` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 10 overlaps `InkMat_StructuralGray` triangle 99 by `0.00132548` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 11 overlaps `InkMat_StructuralGray` triangle 84 by `0.00132548` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 11 overlaps `InkMat_StructuralGray` triangle 86 by `0.00132548` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 11 overlaps `InkMat_StructuralGray` triangle 88 by `0.0064` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 11 overlaps `InkMat_StructuralGray` triangle 89 by `0.0064` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 10 overlaps `InkMat_StructuralGray` triangle 96 by `0.00132548` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 11 overlaps `InkMat_StructuralGray` triangle 98 by `0.00132548` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 10 overlaps `InkMat_StructuralGray` triangle 100 by `0.0032` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 11 overlaps `InkMat_StructuralGray` triangle 100 by `0.0032` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 10 overlaps `InkMat_StructuralGray` triangle 101 by `0.0032` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 11 overlaps `InkMat_StructuralGray` triangle 101 by `0.0032` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 11 overlaps `InkMat_StructuralGray` triangle 85 by `0.00132548` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 11 overlaps `InkMat_StructuralGray` triangle 97 by `0.00132548` m² at a plane gap of `0` m.

## roof-flat-parapet.glb

- `InkMat_OffWhite` triangle 11 overlaps `InkMat_StructuralGray` triangle 8 by `0.399048` m² at a plane gap of `1.49012e-08` m.
- `InkMat_OffWhite` triangle 10 overlaps `InkMat_StructuralGray` triangle 9 by `0.0190476` m² at a plane gap of `1.49012e-08` m.
- `InkMat_OffWhite` triangle 11 overlaps `InkMat_StructuralGray` triangle 9 by `0.380952` m² at a plane gap of `1.49012e-08` m.
- `InkMat_OffWhite` triangle 10 overlaps `InkMat_StructuralGray` triangle 20 by `0.380952` m² at a plane gap of `1.49012e-08` m.
- `InkMat_OffWhite` triangle 11 overlaps `InkMat_StructuralGray` triangle 20 by `0.0190476` m² at a plane gap of `1.49012e-08` m.
- `InkMat_OffWhite` triangle 10 overlaps `InkMat_StructuralGray` triangle 21 by `0.399048` m² at a plane gap of `1.49012e-08` m.
- `InkMat_OffWhite` triangle 10 overlaps `InkMat_StructuralGray` triangle 32 by `0.36` m² at a plane gap of `1.49012e-08` m.
- `InkMat_OffWhite` triangle 10 overlaps `InkMat_StructuralGray` triangle 33 by `0.36` m² at a plane gap of `1.49012e-08` m.
- `InkMat_OffWhite` triangle 11 overlaps `InkMat_StructuralGray` triangle 44 by `0.36` m² at a plane gap of `1.49012e-08` m.
- `InkMat_OffWhite` triangle 11 overlaps `InkMat_StructuralGray` triangle 45 by `0.36` m² at a plane gap of `1.49012e-08` m.

## roof-service-vent-stack.glb

- `InkMat_StructuralGray` triangle 47 overlaps `InkMat_OffWhite` triangle 17 by `0.00613473` m² at a plane gap of `0` m.
- `InkMat_StructuralGray` triangle 46 overlaps `InkMat_OffWhite` triangle 18 by `0.00204881` m² at a plane gap of `0` m.
- `InkMat_StructuralGray` triangle 47 overlaps `InkMat_OffWhite` triangle 18 by `0.00613473` m² at a plane gap of `0` m.
- `InkMat_StructuralGray` triangle 47 overlaps `InkMat_OffWhite` triangle 21 by `0.0212107` m² at a plane gap of `0` m.
- `InkMat_StructuralGray` triangle 46 overlaps `InkMat_OffWhite` triangle 22 by `0.0266965` m² at a plane gap of `0` m.
- `InkMat_StructuralGray` triangle 47 overlaps `InkMat_OffWhite` triangle 22 by `0.0212107` m² at a plane gap of `0` m.
- `InkMat_StructuralGray` triangle 46 overlaps `InkMat_OffWhite` triangle 23 by `0.00867889` m² at a plane gap of `0` m.
- `InkMat_StructuralGray` triangle 47 overlaps `InkMat_OffWhite` triangle 23 by `0.0601578` m² at a plane gap of `0` m.
- `InkMat_StructuralGray` triangle 10 overlaps `InkMat_OffWhite` triangle 31 by `0.00237976` m² at a plane gap of `2.98023e-08` m.
- `InkMat_StructuralGray` triangle 11 overlaps `InkMat_OffWhite` triangle 31 by `0.00580377` m² at a plane gap of `2.98023e-08` m.
- `InkMat_StructuralGray` triangle 10 overlaps `InkMat_OffWhite` triangle 32 by `0.00818354` m² at a plane gap of `2.98023e-08` m.
- `InkMat_StructuralGray` triangle 10 overlaps `InkMat_OffWhite` triangle 34 by `0.00632273` m² at a plane gap of `2.98023e-08` m.
- `InkMat_StructuralGray` triangle 11 overlaps `InkMat_OffWhite` triangle 34 by `0.0415845` m² at a plane gap of `2.98023e-08` m.
- `InkMat_StructuralGray` triangle 10 overlaps `InkMat_OffWhite` triangle 35 by `0.0531614` m² at a plane gap of `2.98023e-08` m.
- `InkMat_StructuralGray` triangle 11 overlaps `InkMat_OffWhite` triangle 35 by `0.0243542` m² at a plane gap of `2.98023e-08` m.
- `InkMat_OffWhite` triangle 17 overlaps `InkMat_StructuralGray` triangle 45 by `0.00204881` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 21 overlaps `InkMat_StructuralGray` triangle 45 by `0.0266965` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 23 overlaps `InkMat_StructuralGray` triangle 45 by `0.00867889` m² at a plane gap of `0` m.
- `InkMat_StructuralGray` triangle 46 overlaps `InkMat_OffWhite` triangle 19 by `0.00818353` m² at a plane gap of `0` m.
- `InkMat_StructuralGray` triangle 10 overlaps `InkMat_OffWhite` triangle 28 by `0.00818353` m² at a plane gap of `2.98023e-08` m.
- `InkMat_StructuralGray` triangle 10 overlaps `InkMat_OffWhite` triangle 33 by `0.0285797` m² at a plane gap of `2.98023e-08` m.
- `InkMat_StructuralGray` triangle 11 overlaps `InkMat_OffWhite` triangle 33 by `0.0193276` m² at a plane gap of `2.98023e-08` m.
- `InkMat_StructuralGray` triangle 45 overlaps `InkMat_OffWhite` triangle 16 by `0.00818353` m² at a plane gap of `0` m.
- `InkMat_StructuralGray` triangle 11 overlaps `InkMat_OffWhite` triangle 30 by `0.00818353` m² at a plane gap of `2.98023e-08` m.
- `InkMat_StructuralGray` triangle 46 overlaps `InkMat_OffWhite` triangle 20 by `0.00204881` m² at a plane gap of `0` m.
- `InkMat_StructuralGray` triangle 47 overlaps `InkMat_OffWhite` triangle 20 by `0.00408592` m² at a plane gap of `0` m.
- `InkMat_StructuralGray` triangle 45 overlaps `InkMat_OffWhite` triangle 20 by `0.00204881` m² at a plane gap of `0` m.
- `InkMat_StructuralGray` triangle 10 overlaps `InkMat_OffWhite` triangle 29 by `0.000313216` m² at a plane gap of `2.98023e-08` m.
- `InkMat_StructuralGray` triangle 11 overlaps `InkMat_OffWhite` triangle 29 by `0.00787032` m² at a plane gap of `2.98023e-08` m.

## roof-skylight.glb

- `InkMat_OffWhite` triangle 10 overlaps `InkMat_StructuralGray` triangle 8 by `1.21` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 11 overlaps `InkMat_StructuralGray` triangle 8 by `1.21` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 10 overlaps `InkMat_StructuralGray` triangle 9 by `1.21` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 11 overlaps `InkMat_StructuralGray` triangle 9 by `1.21` m² at a plane gap of `0` m.
- `InkMat_StructuralGray` triangle 10 overlaps `InkMat_OffWhite` triangle 12 by `1` m² at a plane gap of `0` m.
- `InkMat_StructuralGray` triangle 10 overlaps `InkMat_OffWhite` triangle 13 by `0.5` m² at a plane gap of `0` m.
- `InkMat_StructuralGray` triangle 11 overlaps `InkMat_OffWhite` triangle 13 by `0.5` m² at a plane gap of `0` m.
- `InkMat_StructuralGray` triangle 10 overlaps `InkMat_OffWhite` triangle 20 by `0.5` m² at a plane gap of `0` m.
- `InkMat_StructuralGray` triangle 11 overlaps `InkMat_OffWhite` triangle 20 by `0.5` m² at a plane gap of `0` m.
- `InkMat_StructuralGray` triangle 11 overlaps `InkMat_OffWhite` triangle 21 by `1` m² at a plane gap of `0` m.

## scrap-sheet-metal.glb

- `InkMat_OffWhite` triangle 10 overlaps `InkMat_StructuralGray` triangle 9 by `0.308982` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 20 overlaps `InkMat_StructuralGray` triangle 10 by `0.307066` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 21 overlaps `InkMat_StructuralGray` triangle 10 by `0.217949` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 20 overlaps `InkMat_StructuralGray` triangle 11 by `0.0861957` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 21 overlaps `InkMat_StructuralGray` triangle 11 by `0.223322` m² at a plane gap of `0` m.
- `InkMat_StructuralGray` triangle 9 overlaps `InkMat_OffWhite` triangle 11 by `0.240017` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 10 overlaps `InkMat_StructuralGray` triangle 8 by `0.189256` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 11 overlaps `InkMat_StructuralGray` triangle 8 by `0.36475` m² at a plane gap of `0` m.

## service-bay-canopy.glb

- `InkMat_OffWhite` triangle 6 overlaps `InkMat_StructuralGray` triangle 35 by `0.00101482` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 6 overlaps `InkMat_StructuralGray` triangle 36 by `0.00100978` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 6 overlaps `InkMat_StructuralGray` triangle 38 by `0.00490001` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 6 overlaps `InkMat_StructuralGray` triangle 39 by `0.00482221` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 6 overlaps `InkMat_StructuralGray` triangle 76 by `0.00101482` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 6 overlaps `InkMat_StructuralGray` triangle 79 by `0.00101482` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 6 overlaps `InkMat_StructuralGray` triangle 80 by `0.00490001` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 6 overlaps `InkMat_StructuralGray` triangle 81 by `0.00490001` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 6 overlaps `InkMat_StructuralGray` triangle 34 by `0.00101482` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 6 overlaps `InkMat_StructuralGray` triangle 37 by `0.000239737` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 7 overlaps `InkMat_StructuralGray` triangle 37 by `0.000775086` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 6 overlaps `InkMat_StructuralGray` triangle 77 by `0.00101482` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 6 overlaps `InkMat_StructuralGray` triangle 78 by `0.00101482` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 7 overlaps `InkMat_StructuralGray` triangle 90 by `0.00101483` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 6 overlaps `InkMat_StructuralGray` triangle 129 by `0.000147512` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 7 overlaps `InkMat_StructuralGray` triangle 129 by `0.000867313` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 7 overlaps `InkMat_StructuralGray` triangle 89 by `0.00101483` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 7 overlaps `InkMat_StructuralGray` triangle 91 by `0.00101483` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 7 overlaps `InkMat_StructuralGray` triangle 92 by `0.0049` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 7 overlaps `InkMat_StructuralGray` triangle 93 by `0.0049` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 7 overlaps `InkMat_StructuralGray` triangle 126 by `0.00101483` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 6 overlaps `InkMat_StructuralGray` triangle 128 by `0.000379001` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 7 overlaps `InkMat_StructuralGray` triangle 128 by `0.000635824` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 7 overlaps `InkMat_StructuralGray` triangle 130 by `0.0049` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 6 overlaps `InkMat_StructuralGray` triangle 131 by `0.000331415` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 7 overlaps `InkMat_StructuralGray` triangle 131 by `0.00456859` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 7 overlaps `InkMat_StructuralGray` triangle 88 by `0.00101483` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 7 overlaps `InkMat_StructuralGray` triangle 127 by `0.00101483` m² at a plane gap of `0` m.

## smokestack-tall.glb

- `InkMat_StructuralGray` triangle 22 overlaps `InkMat_OffWhite` triangle 35 by `0.0286156` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 35 overlaps `InkMat_StructuralGray` triangle 27 by `0.0836779` m² at a plane gap of `0` m.
- `InkMat_StructuralGray` triangle 23 overlaps `InkMat_OffWhite` triangle 34 by `0.0286156` m² at a plane gap of `0` m.
- `InkMat_StructuralGray` triangle 27 overlaps `InkMat_OffWhite` triangle 34 by `0.0836779` m² at a plane gap of `0` m.
- `InkMat_StructuralGray` triangle 21 overlaps `InkMat_OffWhite` triangle 36 by `0.0286156` m² at a plane gap of `0` m.
- `InkMat_StructuralGray` triangle 26 overlaps `InkMat_OffWhite` triangle 36 by `0.0836779` m² at a plane gap of `0` m.
- `InkMat_StructuralGray` triangle 27 overlaps `InkMat_OffWhite` triangle 40 by `0.623538` m² at a plane gap of `0` m.
- `InkMat_StructuralGray` triangle 29 overlaps `InkMat_OffWhite` triangle 40 by `0.108253` m² at a plane gap of `0` m.
- `InkMat_StructuralGray` triangle 26 overlaps `InkMat_OffWhite` triangle 41 by `0.623538` m² at a plane gap of `0` m.
- `InkMat_StructuralGray` triangle 29 overlaps `InkMat_OffWhite` triangle 41 by `0.108253` m² at a plane gap of `0` m.
- `InkMat_StructuralGray` triangle 29 overlaps `InkMat_OffWhite` triangle 43 by `2.19537` m² at a plane gap of `0` m.
- `InkMat_StructuralGray` triangle 26 overlaps `InkMat_OffWhite` triangle 37 by `0.0836779` m² at a plane gap of `0` m.
- `InkMat_StructuralGray` triangle 29 overlaps `InkMat_OffWhite` triangle 42 by `0.108253` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 37 overlaps `InkMat_StructuralGray` triangle 20 by `0.0286156` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 39 overlaps `InkMat_StructuralGray` triangle 24 by `0.0286156` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 39 overlaps `InkMat_StructuralGray` triangle 28 by `0.0836779` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 42 overlaps `InkMat_StructuralGray` triangle 28 by `0.623538` m² at a plane gap of `0` m.
- `InkMat_StructuralGray` triangle 28 overlaps `InkMat_OffWhite` triangle 38 by `0.0836779` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 38 overlaps `InkMat_StructuralGray` triangle 25 by `0.0286156` m² at a plane gap of `0` m.

## smokestack.glb

- `InkMat_StructuralGray` triangle 38 overlaps `InkMat_OffWhite` triangle 28 by `0.00439567` m² at a plane gap of `3.57628e-07` m.
- `InkMat_StructuralGray` triangle 42 overlaps `InkMat_OffWhite` triangle 28 by `0.0630531` m² at a plane gap of `3.57628e-07` m.
- `InkMat_StructuralGray` triangle 37 overlaps `InkMat_OffWhite` triangle 29 by `0.00439567` m² at a plane gap of `3.57628e-07` m.
- `InkMat_StructuralGray` triangle 38 overlaps `InkMat_OffWhite` triangle 29 by `0.00439567` m² at a plane gap of `3.57628e-07` m.
- `InkMat_StructuralGray` triangle 41 overlaps `InkMat_OffWhite` triangle 29 by `0.0229616` m² at a plane gap of `3.57628e-07` m.
- `InkMat_StructuralGray` triangle 42 overlaps `InkMat_OffWhite` triangle 29 by `0.0229616` m² at a plane gap of `3.57628e-07` m.
- `InkMat_StructuralGray` triangle 43 overlaps `InkMat_OffWhite` triangle 29 by `0.01713` m² at a plane gap of `3.57628e-07` m.
- `InkMat_StructuralGray` triangle 37 overlaps `InkMat_OffWhite` triangle 33 by `0.00271667` m² at a plane gap of `3.57628e-07` m.
- `InkMat_StructuralGray` triangle 38 overlaps `InkMat_OffWhite` triangle 33 by `0.00711234` m² at a plane gap of `3.57628e-07` m.
- `InkMat_StructuralGray` triangle 41 overlaps `InkMat_OffWhite` triangle 33 by `0.0415483` m² at a plane gap of `3.57628e-07` m.
- `InkMat_StructuralGray` triangle 42 overlaps `InkMat_OffWhite` triangle 33 by `0.26567` m² at a plane gap of `3.57628e-07` m.
- `InkMat_StructuralGray` triangle 43 overlaps `InkMat_OffWhite` triangle 33 by `0.100821` m² at a plane gap of `3.57628e-07` m.
- `InkMat_OffWhite` triangle 28 overlaps `InkMat_StructuralGray` triangle 39 by `0.00439567` m² at a plane gap of `3.57628e-07` m.
- `InkMat_OffWhite` triangle 33 overlaps `InkMat_StructuralGray` triangle 39 by `0.00271667` m² at a plane gap of `3.57628e-07` m.
- `InkMat_StructuralGray` triangle 37 overlaps `InkMat_OffWhite` triangle 30 by `0.00439567` m² at a plane gap of `3.57628e-07` m.
- `InkMat_StructuralGray` triangle 41 overlaps `InkMat_OffWhite` triangle 30 by `0.0630531` m² at a plane gap of `3.57628e-07` m.
- `InkMat_StructuralGray` triangle 37 overlaps `InkMat_OffWhite` triangle 34 by `0.00271667` m² at a plane gap of `3.57628e-07` m.
- `InkMat_StructuralGray` triangle 41 overlaps `InkMat_OffWhite` triangle 34 by `0.26567` m² at a plane gap of `3.57628e-07` m.
- `InkMat_StructuralGray` triangle 43 overlaps `InkMat_OffWhite` triangle 34 by `0.14237` m² at a plane gap of `3.57628e-07` m.
- `InkMat_StructuralGray` triangle 41 overlaps `InkMat_OffWhite` triangle 35 by `0.0699432` m² at a plane gap of `3.57628e-07` m.
- `InkMat_StructuralGray` triangle 42 overlaps `InkMat_OffWhite` triangle 35 by `0.111492` m² at a plane gap of `3.57628e-07` m.
- `InkMat_StructuralGray` triangle 43 overlaps `InkMat_OffWhite` triangle 35 by `0.488616` m² at a plane gap of `3.57628e-07` m.
- `InkMat_StructuralGray` triangle 39 overlaps `InkMat_OffWhite` triangle 35 by `0.00439567` m² at a plane gap of `3.57628e-07` m.
- `InkMat_StructuralGray` triangle 42 overlaps `InkMat_OffWhite` triangle 32 by `0.0229616` m² at a plane gap of `3.57628e-07` m.
- `InkMat_StructuralGray` triangle 43 overlaps `InkMat_OffWhite` triangle 32 by `0.0400916` m² at a plane gap of `3.57628e-07` m.
- `InkMat_StructuralGray` triangle 39 overlaps `InkMat_OffWhite` triangle 32 by `0.00439567` m² at a plane gap of `3.57628e-07` m.
- `InkMat_OffWhite` triangle 30 overlaps `InkMat_StructuralGray` triangle 36 by `0.00439567` m² at a plane gap of `3.57628e-07` m.
- `InkMat_OffWhite` triangle 34 overlaps `InkMat_StructuralGray` triangle 36 by `0.00711234` m² at a plane gap of `3.57628e-07` m.
- `InkMat_StructuralGray` triangle 41 overlaps `InkMat_OffWhite` triangle 31 by `0.0229616` m² at a plane gap of `3.57628e-07` m.
- `InkMat_StructuralGray` triangle 43 overlaps `InkMat_OffWhite` triangle 31 by `0.0400916` m² at a plane gap of `3.57628e-07` m.
- `InkMat_StructuralGray` triangle 36 overlaps `InkMat_OffWhite` triangle 31 by `0.00439567` m² at a plane gap of `3.57628e-07` m.
- `InkMat_OffWhite` triangle 34 overlaps `InkMat_StructuralGray` triangle 40 by `0.00271667` m² at a plane gap of `3.57628e-07` m.
- `InkMat_OffWhite` triangle 35 overlaps `InkMat_StructuralGray` triangle 40 by `0.00439567` m² at a plane gap of `3.57628e-07` m.
- `InkMat_OffWhite` triangle 32 overlaps `InkMat_StructuralGray` triangle 40 by `0.00439567` m² at a plane gap of `3.57628e-07` m.
- `InkMat_OffWhite` triangle 31 overlaps `InkMat_StructuralGray` triangle 40 by `0.00439567` m² at a plane gap of `3.57628e-07` m.

## subway-entrance.glb

- `InkMat_OffWhite` triangle 11 overlaps `InkMat_StructuralGray` triangle 39 by `0.000331369` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 11 overlaps `InkMat_StructuralGray` triangle 36 by `0.000331369` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 11 overlaps `InkMat_StructuralGray` triangle 38 by `0.000331369` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 11 overlaps `InkMat_StructuralGray` triangle 40 by `0.0016` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 11 overlaps `InkMat_StructuralGray` triangle 41 by `0.0016` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 11 overlaps `InkMat_StructuralGray` triangle 37 by `0.000331369` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 23 overlaps `InkMat_StructuralGray` triangle 48 by `0.000331369` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 23 overlaps `InkMat_StructuralGray` triangle 47 by `0.000331369` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 23 overlaps `InkMat_StructuralGray` triangle 49 by `0.000331369` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 23 overlaps `InkMat_StructuralGray` triangle 50 by `0.0016` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 23 overlaps `InkMat_StructuralGray` triangle 51 by `0.0016` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 23 overlaps `InkMat_StructuralGray` triangle 46 by `0.000331369` m² at a plane gap of `0` m.

## tank-silo.glb

- `InkMat_OffWhite` triangle 69 overlaps `InkMat_StructuralGray` triangle 148 by `0.0964618` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 64 overlaps `InkMat_StructuralGray` triangle 147 by `0.0964617` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 68 overlaps `InkMat_StructuralGray` triangle 149 by `0.0964617` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 70 overlaps `InkMat_StructuralGray` triangle 152 by `0.623538` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 72 overlaps `InkMat_StructuralGray` triangle 153 by `0.623538` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 73 overlaps `InkMat_StructuralGray` triangle 155 by `1.87061` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 65 overlaps `InkMat_StructuralGray` triangle 146 by `0.0964617` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 67 overlaps `InkMat_StructuralGray` triangle 150 by `0.0964617` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 71 overlaps `InkMat_StructuralGray` triangle 154 by `0.623538` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 66 overlaps `InkMat_StructuralGray` triangle 151 by `0.0964618` m² at a plane gap of `0` m.

## tank-vertical.glb

- `InkMat_OffWhite` triangle 70 overlaps `InkMat_StructuralGray` triangle 134 by `0.00692388` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 72 overlaps `InkMat_StructuralGray` triangle 134 by `0.000893125` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 73 overlaps `InkMat_StructuralGray` triangle 134 by `0.0108226` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 72 overlaps `InkMat_StructuralGray` triangle 135 by `0.0156036` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 73 overlaps `InkMat_StructuralGray` triangle 135 by `0.00303603` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 70 overlaps `InkMat_StructuralGray` triangle 138 by `0.005` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 72 overlaps `InkMat_StructuralGray` triangle 138 by `0.00715391` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 73 overlaps `InkMat_StructuralGray` triangle 138 by `0.0778461` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 73 overlaps `InkMat_StructuralGray` triangle 136 by `0.00303603` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 71 overlaps `InkMat_StructuralGray` triangle 136 by `0.0156036` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 70 overlaps `InkMat_StructuralGray` triangle 137 by `0.00692388` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 73 overlaps `InkMat_StructuralGray` triangle 137 by `0.0108226` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 71 overlaps `InkMat_StructuralGray` triangle 137 by `0.000893125` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 70 overlaps `InkMat_StructuralGray` triangle 139 by `0.005` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 73 overlaps `InkMat_StructuralGray` triangle 139 by `0.0778461` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 71 overlaps `InkMat_StructuralGray` triangle 139 by `0.00715391` m² at a plane gap of `0` m.

## telephone-booth.glb

- `InkMat_OffWhite` triangle 6 overlaps `InkMat_StructuralGray` triangle 72 by `0.032111` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 7 overlaps `InkMat_StructuralGray` triangle 72 by `0.0178891` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 6 overlaps `InkMat_StructuralGray` triangle 73 by `0.0364838` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 7 overlaps `InkMat_StructuralGray` triangle 73 by `0.0135162` m² at a plane gap of `0` m.

## teleporter-pad.glb

- `InkMat_OffWhite` triangle 16 overlaps `InkMat_StructuralGray` triangle 169 by `0.0569478` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 17 overlaps `InkMat_StructuralGray` triangle 169 by `0.0569478` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 16 overlaps `InkMat_StructuralGray` triangle 166 by `0.113896` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 17 overlaps `InkMat_StructuralGray` triangle 168 by `0.113896` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 16 overlaps `InkMat_StructuralGray` triangle 170 by `0.419115` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 17 overlaps `InkMat_StructuralGray` triangle 170 by `0.139705` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 16 overlaps `InkMat_StructuralGray` triangle 171 by `0.139705` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 17 overlaps `InkMat_StructuralGray` triangle 171 by `0.419115` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 16 overlaps `InkMat_StructuralGray` triangle 167 by `0.0569478` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 17 overlaps `InkMat_StructuralGray` triangle 167 by `0.0569478` m² at a plane gap of `0` m.

## tennis-racket.glb

- `InkMat_Charcoal` triangle 16 overlaps `InkMat_OffWhite` triangle 1 by `1.03641e-05` m² at a plane gap of `0` m.
- `InkMat_Charcoal` triangle 17 overlaps `InkMat_OffWhite` triangle 1 by `5.17795e-05` m² at a plane gap of `0` m.
- `InkMat_Charcoal` triangle 16 overlaps `InkMat_OffWhite` triangle 2 by `6.21436e-05` m² at a plane gap of `0` m.
- `InkMat_Charcoal` triangle 16 overlaps `InkMat_OffWhite` triangle 3 by `0.000103825` m² at a plane gap of `0` m.
- `InkMat_Charcoal` triangle 17 overlaps `InkMat_OffWhite` triangle 3 by `8.31384e-05` m² at a plane gap of `0` m.
- `InkMat_Charcoal` triangle 16 overlaps `InkMat_OffWhite` triangle 0 by `1.03641e-05` m² at a plane gap of `0` m.
- `InkMat_Charcoal` triangle 17 overlaps `InkMat_OffWhite` triangle 0 by `5.17795e-05` m² at a plane gap of `0` m.

## traffic-light.glb

- `InkMat_StructuralGray` triangle 53 overlaps `InkMat_OffWhite` triangle 30 by `3.85304e-05` m² at a plane gap of `3.25593e-07` m.
- `InkMat_StructuralGray` triangle 61 overlaps `InkMat_OffWhite` triangle 52 by `3.85304e-05` m² at a plane gap of `3.25593e-07` m.
- `InkMat_StructuralGray` triangle 53 overlaps `InkMat_OffWhite` triangle 31 by `0.00167756` m² at a plane gap of `5.96046e-08` m.
- `InkMat_StructuralGray` triangle 53 overlaps `InkMat_OffWhite` triangle 33 by `0.00164303` m² at a plane gap of `9.53641e-08` m.
- `InkMat_StructuralGray` triangle 61 overlaps `InkMat_OffWhite` triangle 53 by `0.00167756` m² at a plane gap of `5.96046e-08` m.
- `InkMat_StructuralGray` triangle 61 overlaps `InkMat_OffWhite` triangle 55 by `0.00164303` m² at a plane gap of `9.53641e-08` m.
- `InkMat_StructuralGray` triangle 53 overlaps `InkMat_OffWhite` triangle 28 by `3.85304e-05` m² at a plane gap of `2.83446e-07` m.
- `InkMat_StructuralGray` triangle 61 overlaps `InkMat_OffWhite` triangle 50 by `3.85304e-05` m² at a plane gap of `2.83446e-07` m.

## trash-can.glb

- `InkMat_StructuralGray` triangle 38 overlaps `InkMat_OffWhite` triangle 28 by `0.000468783` m² at a plane gap of `1.49012e-08` m.
- `InkMat_StructuralGray` triangle 42 overlaps `InkMat_OffWhite` triangle 28 by `0.0060785` m² at a plane gap of `1.49012e-08` m.
- `InkMat_StructuralGray` triangle 37 overlaps `InkMat_OffWhite` triangle 29 by `0.000468783` m² at a plane gap of `1.49012e-08` m.
- `InkMat_StructuralGray` triangle 38 overlaps `InkMat_OffWhite` triangle 29 by `0.000468783` m² at a plane gap of `1.49012e-08` m.
- `InkMat_StructuralGray` triangle 41 overlaps `InkMat_OffWhite` triangle 29 by `0.00222075` m² at a plane gap of `1.49012e-08` m.
- `InkMat_StructuralGray` triangle 42 overlaps `InkMat_OffWhite` triangle 29 by `0.00222075` m² at a plane gap of `1.49012e-08` m.
- `InkMat_StructuralGray` triangle 43 overlaps `InkMat_OffWhite` triangle 29 by `0.001637` m² at a plane gap of `1.49012e-08` m.
- `InkMat_StructuralGray` triangle 37 overlaps `InkMat_OffWhite` triangle 33 by `0.000289724` m² at a plane gap of `1.49012e-08` m.
- `InkMat_StructuralGray` triangle 38 overlaps `InkMat_OffWhite` triangle 33 by `0.000758507` m² at a plane gap of `1.49012e-08` m.
- `InkMat_StructuralGray` triangle 41 overlaps `InkMat_OffWhite` triangle 33 by `0.00406203` m² at a plane gap of `1.49012e-08` m.
- `InkMat_StructuralGray` triangle 42 overlaps `InkMat_OffWhite` triangle 33 by `0.0259225` m² at a plane gap of `1.49012e-08` m.
- `InkMat_StructuralGray` triangle 43 overlaps `InkMat_OffWhite` triangle 33 by `0.00975023` m² at a plane gap of `1.49012e-08` m.
- `InkMat_OffWhite` triangle 19 overlaps `InkMat_StructuralGray` triangle 211 by `0.00193919` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 22 overlaps `InkMat_StructuralGray` triangle 211 by `0.00119849` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 18 overlaps `InkMat_StructuralGray` triangle 212 by `0.00193919` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 19 overlaps `InkMat_StructuralGray` triangle 212 by `0.00193919` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 22 overlaps `InkMat_StructuralGray` triangle 212 by `0.00313768` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 19 overlaps `InkMat_StructuralGray` triangle 214 by `0.00119849` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 22 overlaps `InkMat_StructuralGray` triangle 214 by `0.00387838` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 18 overlaps `InkMat_StructuralGray` triangle 215 by `0.00193919` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 19 overlaps `InkMat_StructuralGray` triangle 215 by `0.00193919` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 22 overlaps `InkMat_StructuralGray` triangle 215 by `0.0277813` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 28 overlaps `InkMat_StructuralGray` triangle 39 by `0.000468783` m² at a plane gap of `1.49012e-08` m.
- `InkMat_OffWhite` triangle 33 overlaps `InkMat_StructuralGray` triangle 39 by `0.000289724` m² at a plane gap of `1.49012e-08` m.
- `InkMat_StructuralGray` triangle 211 overlaps `InkMat_OffWhite` triangle 20 by `0.00193919` m² at a plane gap of `0` m.
- `InkMat_StructuralGray` triangle 214 overlaps `InkMat_OffWhite` triangle 20 by `0.00313768` m² at a plane gap of `0` m.
- `InkMat_StructuralGray` triangle 211 overlaps `InkMat_OffWhite` triangle 23 by `0.00193919` m² at a plane gap of `0` m.
- `InkMat_StructuralGray` triangle 214 overlaps `InkMat_OffWhite` triangle 23 by `0.0277813` m² at a plane gap of `0` m.
- `InkMat_StructuralGray` triangle 215 overlaps `InkMat_OffWhite` triangle 23 by `0.0265828` m² at a plane gap of `0` m.
- `InkMat_StructuralGray` triangle 37 overlaps `InkMat_OffWhite` triangle 30 by `0.000468783` m² at a plane gap of `1.49012e-08` m.
- `InkMat_StructuralGray` triangle 41 overlaps `InkMat_OffWhite` triangle 30 by `0.0060785` m² at a plane gap of `1.49012e-08` m.
- `InkMat_StructuralGray` triangle 37 overlaps `InkMat_OffWhite` triangle 34 by `0.000289724` m² at a plane gap of `1.49012e-08` m.
- `InkMat_StructuralGray` triangle 41 overlaps `InkMat_OffWhite` triangle 34 by `0.0259225` m² at a plane gap of `1.49012e-08` m.
- `InkMat_StructuralGray` triangle 43 overlaps `InkMat_OffWhite` triangle 34 by `0.0138123` m² at a plane gap of `1.49012e-08` m.
- `InkMat_StructuralGray` triangle 37 overlaps `InkMat_OffWhite` triangle 35 by `0.000179059` m² at a plane gap of `1.49012e-08` m.
- `InkMat_StructuralGray` triangle 41 overlaps `InkMat_OffWhite` triangle 35 by `0.00686222` m² at a plane gap of `1.49012e-08` m.
- `InkMat_StructuralGray` triangle 42 overlaps `InkMat_OffWhite` triangle 35 by `0.0109243` m² at a plane gap of `1.49012e-08` m.
- `InkMat_StructuralGray` triangle 43 overlaps `InkMat_OffWhite` triangle 35 by `0.047554` m² at a plane gap of `1.49012e-08` m.
- `InkMat_StructuralGray` triangle 39 overlaps `InkMat_OffWhite` triangle 35 by `0.000468783` m² at a plane gap of `1.49012e-08` m.
- `InkMat_OffWhite` triangle 18 overlaps `InkMat_StructuralGray` triangle 208 by `0.00193919` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 22 overlaps `InkMat_StructuralGray` triangle 208 by `0.00119849` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 23 overlaps `InkMat_StructuralGray` triangle 208 by `0.000740705` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 18 overlaps `InkMat_StructuralGray` triangle 213 by `0.00119849` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 22 overlaps `InkMat_StructuralGray` triangle 213 by `0.00387838` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 23 overlaps `InkMat_StructuralGray` triangle 213 by `0.00747384` m² at a plane gap of `0` m.
- `InkMat_StructuralGray` triangle 208 overlaps `InkMat_OffWhite` triangle 17 by `0.00193919` m² at a plane gap of `0` m.
- `InkMat_StructuralGray` triangle 213 overlaps `InkMat_OffWhite` triangle 17 by `0.00313768` m² at a plane gap of `0` m.
- `InkMat_StructuralGray` triangle 214 overlaps `InkMat_OffWhite` triangle 21 by `0.00387838` m² at a plane gap of `0` m.
- `InkMat_StructuralGray` triangle 215 overlaps `InkMat_OffWhite` triangle 21 by `0.00747384` m² at a plane gap of `0` m.
- `InkMat_StructuralGray` triangle 208 overlaps `InkMat_OffWhite` triangle 21 by `0.00119849` m² at a plane gap of `0` m.
- `InkMat_StructuralGray` triangle 213 overlaps `InkMat_OffWhite` triangle 21 by `0.0241859` m² at a plane gap of `0` m.
- `InkMat_StructuralGray` triangle 42 overlaps `InkMat_OffWhite` triangle 32 by `0.00222075` m² at a plane gap of `1.49012e-08` m.
- `InkMat_StructuralGray` triangle 43 overlaps `InkMat_OffWhite` triangle 32 by `0.00385775` m² at a plane gap of `1.49012e-08` m.
- `InkMat_StructuralGray` triangle 39 overlaps `InkMat_OffWhite` triangle 32 by `0.000468783` m² at a plane gap of `1.49012e-08` m.
- `InkMat_OffWhite` triangle 30 overlaps `InkMat_StructuralGray` triangle 36 by `0.000468783` m² at a plane gap of `1.49012e-08` m.
- `InkMat_OffWhite` triangle 34 overlaps `InkMat_StructuralGray` triangle 36 by `0.000758506` m² at a plane gap of `1.49012e-08` m.
- `InkMat_OffWhite` triangle 20 overlaps `InkMat_StructuralGray` triangle 210 by `0.00193919` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 23 overlaps `InkMat_StructuralGray` triangle 210 by `0.00193919` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 21 overlaps `InkMat_StructuralGray` triangle 210 by `0.00119849` m² at a plane gap of `0` m.
- `InkMat_StructuralGray` triangle 214 overlaps `InkMat_OffWhite` triangle 16 by `0.00119849` m² at a plane gap of `0` m.
- `InkMat_StructuralGray` triangle 215 overlaps `InkMat_OffWhite` triangle 16 by `0.000740706` m² at a plane gap of `0` m.
- `InkMat_StructuralGray` triangle 213 overlaps `InkMat_OffWhite` triangle 16 by `0.00119849` m² at a plane gap of `0` m.
- `InkMat_StructuralGray` triangle 210 overlaps `InkMat_OffWhite` triangle 16 by `0.00193919` m² at a plane gap of `0` m.
- `InkMat_StructuralGray` triangle 41 overlaps `InkMat_OffWhite` triangle 31 by `0.00222075` m² at a plane gap of `1.49012e-08` m.
- `InkMat_StructuralGray` triangle 43 overlaps `InkMat_OffWhite` triangle 31 by `0.00385775` m² at a plane gap of `1.49012e-08` m.
- `InkMat_StructuralGray` triangle 36 overlaps `InkMat_OffWhite` triangle 31 by `0.000468783` m² at a plane gap of `1.49012e-08` m.
- `InkMat_OffWhite` triangle 17 overlaps `InkMat_StructuralGray` triangle 209 by `0.00193919` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 21 overlaps `InkMat_StructuralGray` triangle 209 by `0.00313768` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 16 overlaps `InkMat_StructuralGray` triangle 209 by `0.00193919` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 34 overlaps `InkMat_StructuralGray` triangle 40 by `0.000289724` m² at a plane gap of `1.49012e-08` m.
- `InkMat_OffWhite` triangle 35 overlaps `InkMat_StructuralGray` triangle 40 by `0.000468783` m² at a plane gap of `1.49012e-08` m.
- `InkMat_OffWhite` triangle 32 overlaps `InkMat_StructuralGray` triangle 40 by `0.000468783` m² at a plane gap of `1.49012e-08` m.
- `InkMat_OffWhite` triangle 31 overlaps `InkMat_StructuralGray` triangle 40 by `0.000468783` m² at a plane gap of `1.49012e-08` m.

## turret-automated.glb

- `InkMat_StructuralGray` triangle 27 overlaps `InkMat_OffWhite` triangle 34 by `0.00270064` m² at a plane gap of `0` m.
- `InkMat_StructuralGray` triangle 28 overlaps `InkMat_OffWhite` triangle 34 by `0.018772` m² at a plane gap of `0` m.
- `InkMat_StructuralGray` triangle 29 overlaps `InkMat_OffWhite` triangle 34 by `0.00843358` m² at a plane gap of `0` m.
- `InkMat_StructuralGray` triangle 27 overlaps `InkMat_OffWhite` triangle 35 by `0.0299062` m² at a plane gap of `0` m.
- `InkMat_StructuralGray` triangle 28 overlaps `InkMat_OffWhite` triangle 37 by `0.026456` m² at a plane gap of `0` m.
- `InkMat_StructuralGray` triangle 29 overlaps `InkMat_OffWhite` triangle 37 by `0.00345026` m² at a plane gap of `0` m.
- `InkMat_StructuralGray` triangle 27 overlaps `InkMat_OffWhite` triangle 38 by `0.054847` m² at a plane gap of `0` m.
- `InkMat_StructuralGray` triangle 28 overlaps `InkMat_OffWhite` triangle 38 by `0.0215738` m² at a plane gap of `0` m.
- `InkMat_StructuralGray` triangle 29 overlaps `InkMat_OffWhite` triangle 38 by `0.0679791` m² at a plane gap of `0` m.
- `InkMat_StructuralGray` triangle 27 overlaps `InkMat_OffWhite` triangle 39 by `0.00651991` m² at a plane gap of `0` m.
- `InkMat_StructuralGray` triangle 28 overlaps `InkMat_OffWhite` triangle 39 by `0.0296938` m² at a plane gap of `0` m.
- `InkMat_StructuralGray` triangle 29 overlaps `InkMat_OffWhite` triangle 39 by `0.108186` m² at a plane gap of `0` m.
- `InkMat_StructuralGray` triangle 27 overlaps `InkMat_OffWhite` triangle 36 by `0.00270064` m² at a plane gap of `0` m.
- `InkMat_StructuralGray` triangle 29 overlaps `InkMat_OffWhite` triangle 36 by `0.0272056` m² at a plane gap of `0` m.

## utility-cabinet-low.glb

- `InkMat_OffWhite` triangle 6 overlaps `InkMat_StructuralGray` triangle 2 by `0.299523` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 7 overlaps `InkMat_StructuralGray` triangle 2 by `0.321477` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 6 overlaps `InkMat_StructuralGray` triangle 3 by `0.321477` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 7 overlaps `InkMat_StructuralGray` triangle 3 by `0.299523` m² at a plane gap of `0` m.

## utility-panel-double.glb

- `InkMat_OffWhite` triangle 6 overlaps `InkMat_StructuralGray` triangle 2 by `0.30186` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 7 overlaps `InkMat_StructuralGray` triangle 2 by `0.28314` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 6 overlaps `InkMat_StructuralGray` triangle 3 by `0.28314` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 7 overlaps `InkMat_StructuralGray` triangle 3 by `0.30186` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 18 overlaps `InkMat_StructuralGray` triangle 14 by `0.30186` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 19 overlaps `InkMat_StructuralGray` triangle 14 by `0.28314` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 18 overlaps `InkMat_StructuralGray` triangle 15 by `0.28314` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 19 overlaps `InkMat_StructuralGray` triangle 15 by `0.30186` m² at a plane gap of `0` m.

## vault-box.glb

- `InkMat_OffWhite` triangle 8 overlaps `InkMat_StructuralGray` triangle 10 by `0.255331` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 9 overlaps `InkMat_StructuralGray` triangle 10 by `0.269669` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 8 overlaps `InkMat_StructuralGray` triangle 11 by `0.269669` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 9 overlaps `InkMat_StructuralGray` triangle 11 by `0.255331` m² at a plane gap of `0` m.

## walkway-l-junction.glb

- `InkMat_OffWhite` triangle 10 overlaps `InkMat_StructuralGray` triangle 26 by `0.000366349` m² at a plane gap of `7.45058e-09` m.
- `InkMat_OffWhite` triangle 11 overlaps `InkMat_StructuralGray` triangle 26 by `2.33611e-05` m² at a plane gap of `7.45058e-09` m.
- `InkMat_OffWhite` triangle 10 overlaps `InkMat_StructuralGray` triangle 28 by `0.000388602` m² at a plane gap of `7.45058e-09` m.
- `InkMat_OffWhite` triangle 10 overlaps `InkMat_StructuralGray` triangle 29 by `0.000901613` m² at a plane gap of `7.45058e-09` m.
- `InkMat_OffWhite` triangle 11 overlaps `InkMat_StructuralGray` triangle 29 by `0.000267518` m² at a plane gap of `7.45058e-09` m.
- `InkMat_OffWhite` triangle 10 overlaps `InkMat_StructuralGray` triangle 63 by `0.00038971` m² at a plane gap of `7.45058e-09` m.
- `InkMat_OffWhite` triangle 10 overlaps `InkMat_StructuralGray` triangle 64 by `0.00038971` m² at a plane gap of `7.45058e-09` m.
- `InkMat_OffWhite` triangle 10 overlaps `InkMat_StructuralGray` triangle 65 by `0.00116913` m² at a plane gap of `7.45058e-09` m.
- `InkMat_OffWhite` triangle 11 overlaps `InkMat_StructuralGray` triangle 27 by `0.00038971` m² at a plane gap of `7.45058e-09` m.
- `InkMat_OffWhite` triangle 10 overlaps `InkMat_StructuralGray` triangle 62 by `0.00038971` m² at a plane gap of `7.45058e-09` m.
- `InkMat_OffWhite` triangle 23 overlaps `InkMat_StructuralGray` triangle 44 by `0.000389711` m² at a plane gap of `7.45058e-09` m.
- `InkMat_OffWhite` triangle 23 overlaps `InkMat_StructuralGray` triangle 45 by `0.00038971` m² at a plane gap of `7.45058e-09` m.
- `InkMat_OffWhite` triangle 23 overlaps `InkMat_StructuralGray` triangle 47 by `0.00116913` m² at a plane gap of `7.45058e-09` m.
- `InkMat_OffWhite` triangle 23 overlaps `InkMat_StructuralGray` triangle 69 by `0.00038971` m² at a plane gap of `7.45058e-09` m.
- `InkMat_OffWhite` triangle 22 overlaps `InkMat_StructuralGray` triangle 70 by `0.000223285` m² at a plane gap of `7.45058e-09` m.
- `InkMat_OffWhite` triangle 23 overlaps `InkMat_StructuralGray` triangle 70 by `0.000166426` m² at a plane gap of `7.45058e-09` m.
- `InkMat_OffWhite` triangle 22 overlaps `InkMat_StructuralGray` triangle 71 by `6.56087e-05` m² at a plane gap of `7.45058e-09` m.
- `InkMat_OffWhite` triangle 23 overlaps `InkMat_StructuralGray` triangle 71 by `0.00110352` m² at a plane gap of `7.45058e-09` m.
- `InkMat_OffWhite` triangle 23 overlaps `InkMat_StructuralGray` triangle 46 by `0.00038971` m² at a plane gap of `7.45058e-09` m.
- `InkMat_OffWhite` triangle 22 overlaps `InkMat_StructuralGray` triangle 68 by `2.10281e-05` m² at a plane gap of `7.45058e-09` m.
- `InkMat_OffWhite` triangle 23 overlaps `InkMat_StructuralGray` triangle 68 by `0.000368682` m² at a plane gap of `7.45058e-09` m.

## walkway-t-junction.glb

- `InkMat_OffWhite` triangle 10 overlaps `InkMat_StructuralGray` triangle 26 by `0.00038971` m² at a plane gap of `7.45058e-09` m.
- `InkMat_OffWhite` triangle 10 overlaps `InkMat_StructuralGray` triangle 28 by `0.00038971` m² at a plane gap of `7.45058e-09` m.
- `InkMat_OffWhite` triangle 10 overlaps `InkMat_StructuralGray` triangle 29 by `0.00116913` m² at a plane gap of `7.45058e-09` m.
- `InkMat_OffWhite` triangle 10 overlaps `InkMat_StructuralGray` triangle 27 by `0.00038971` m² at a plane gap of `7.45058e-09` m.
- `InkMat_OffWhite` triangle 22 overlaps `InkMat_StructuralGray` triangle 63 by `0.000389711` m² at a plane gap of `7.45058e-09` m.
- `InkMat_OffWhite` triangle 22 overlaps `InkMat_StructuralGray` triangle 64 by `0.000389711` m² at a plane gap of `7.45058e-09` m.
- `InkMat_OffWhite` triangle 22 overlaps `InkMat_StructuralGray` triangle 65 by `0.00116913` m² at a plane gap of `7.45058e-09` m.
- `InkMat_OffWhite` triangle 22 overlaps `InkMat_StructuralGray` triangle 62 by `0.000389711` m² at a plane gap of `7.45058e-09` m.
- `InkMat_OffWhite` triangle 23 overlaps `InkMat_StructuralGray` triangle 69 by `0.000389711` m² at a plane gap of `7.45058e-09` m.
- `InkMat_OffWhite` triangle 23 overlaps `InkMat_StructuralGray` triangle 70 by `0.000389711` m² at a plane gap of `7.45058e-09` m.
- `InkMat_OffWhite` triangle 23 overlaps `InkMat_StructuralGray` triangle 71 by `0.00116913` m² at a plane gap of `7.45058e-09` m.
- `InkMat_OffWhite` triangle 23 overlaps `InkMat_StructuralGray` triangle 68 by `0.000389711` m² at a plane gap of `7.45058e-09` m.
- `InkMat_OffWhite` triangle 11 overlaps `InkMat_StructuralGray` triangle 44 by `0.00038971` m² at a plane gap of `7.45058e-09` m.
- `InkMat_OffWhite` triangle 11 overlaps `InkMat_StructuralGray` triangle 45 by `0.00038971` m² at a plane gap of `7.45058e-09` m.
- `InkMat_OffWhite` triangle 11 overlaps `InkMat_StructuralGray` triangle 47 by `0.00116913` m² at a plane gap of `7.45058e-09` m.
- `InkMat_OffWhite` triangle 11 overlaps `InkMat_StructuralGray` triangle 46 by `0.00038971` m² at a plane gap of `7.45058e-09` m.

## warehouse-office.glb

- `InkMat_StructuralGray` triangle 8 overlaps `InkMat_OffWhite` triangle 10 by `4` m² at a plane gap of `0` m.
- `InkMat_StructuralGray` triangle 9 overlaps `InkMat_OffWhite` triangle 10 by `4` m² at a plane gap of `0` m.
- `InkMat_StructuralGray` triangle 8 overlaps `InkMat_OffWhite` triangle 11 by `4` m² at a plane gap of `0` m.
- `InkMat_StructuralGray` triangle 9 overlaps `InkMat_OffWhite` triangle 11 by `4` m² at a plane gap of `0` m.

## warehouse.glb

- `InkMat_OffWhite` triangle 10 overlaps `InkMat_StructuralGray` triangle 0 by `16` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 10 overlaps `InkMat_StructuralGray` triangle 1 by `8` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 11 overlaps `InkMat_StructuralGray` triangle 1 by `8` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 10 overlaps `InkMat_StructuralGray` triangle 8 by `8` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 11 overlaps `InkMat_StructuralGray` triangle 8 by `8` m² at a plane gap of `0` m.
- `InkMat_OffWhite` triangle 11 overlaps `InkMat_StructuralGray` triangle 9 by `16` m² at a plane gap of `0` m.

## warp-beacon.glb

- `InkMat_StructuralGray` triangle 30 overlaps `InkMat_OffWhite` triangle 14 by `0.00103553` m² at a plane gap of `5.96046e-08` m.
- `InkMat_StructuralGray` triangle 31 overlaps `InkMat_OffWhite` triangle 14 by `0.00103553` m² at a plane gap of `5.96046e-08` m.
- `InkMat_StructuralGray` triangle 31 overlaps `InkMat_OffWhite` triangle 13 by `0.00207107` m² at a plane gap of `5.96046e-08` m.
- `InkMat_StructuralGray` triangle 30 overlaps `InkMat_OffWhite` triangle 15 by `0.00207107` m² at a plane gap of `5.96046e-08` m.
- `InkMat_StructuralGray` triangle 30 overlaps `InkMat_OffWhite` triangle 16 by `0.0025` m² at a plane gap of `5.96046e-08` m.
- `InkMat_StructuralGray` triangle 31 overlaps `InkMat_OffWhite` triangle 16 by `0.0075` m² at a plane gap of `5.96046e-08` m.
- `InkMat_StructuralGray` triangle 30 overlaps `InkMat_OffWhite` triangle 17 by `0.0075` m² at a plane gap of `5.96046e-08` m.
- `InkMat_StructuralGray` triangle 31 overlaps `InkMat_OffWhite` triangle 17 by `0.0025` m² at a plane gap of `5.96046e-08` m.
- `InkMat_StructuralGray` triangle 30 overlaps `InkMat_OffWhite` triangle 12 by `0.00103553` m² at a plane gap of `5.96046e-08` m.
- `InkMat_StructuralGray` triangle 31 overlaps `InkMat_OffWhite` triangle 12 by `0.00103553` m² at a plane gap of `5.96046e-08` m.
