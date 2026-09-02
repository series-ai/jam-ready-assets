# Asset Provenance: Pirate Nation Asset Pack

This document records the legal origin of `assets/3d-pirate-nation/` and
`modules/asset-pirate-nation/`. Use this file when you release a game that
includes this pack and you need to show the MIT source.

## 1. Upstream source

| Field | Value |
|---|---|
| Project | Pirate Nation Unity game client |
| Copyright holder | Proof of Play, Inc. |
| Repository | https://github.com/proofofplay/piratenation-game |
| Pinned commit | `dc921b650c8a1d7c449b2a3553949d3e7c8266e9` |
| Commit date | 2026-06-17 |
| Commit author | Matt Van (`mattvan@proofofplay.gg`) |
| Upstream license | MIT License |
| Release type | Archival open-source release of the game client |

The extract tool refuses to run if the source checkout is not this commit.

## 2. Upstream MIT license text

The upstream `LICENSE` file at the pinned commit contains:

```text
MIT License

Copyright (c) 2026 Proof of Play, Inc.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

Proof of Play also writes this note in the same file:

- The MIT license covers source authored by Proof of Play.
- Commercial Unity Asset Store packages and proprietary SDKs were removed
  before the open-source release.
- Remaining third-party code in that repository keeps its own license.

This pack does **not** copy those remaining third-party trees.

## 3. What this pack includes

The extractor copies only allowlisted Proof of Play trees:

| Kind | Allowlisted source trees |
|---|---|
| 3D models | `Assets/_PirateNation_/`, `Assets/Models/VoxEdit/`, `Assets/DemoPlaceholder/Models/`, `Assets/DemoPlaceholder/OptimisedAssets/`, `Assets/StreamingAssets/` |
| Audio | `Assets/_PirateNation_/Audio/Music/` (all tracks). Game SFX with `PN_` names, `card_stow_sound`, `pop_then_fanfare`, combat `S_*` files, and Island Builder thud files. |
| 2D | `Assets/UI_Assets/`, `Assets/Menu/`, `Assets/_PirateNation_/Prefabs/UI/` |

Each catalog entry stores:

- `license`: `MIT`
- `copyright`: `Copyright (c) 2026 Proof of Play, Inc.`
- `sourceRelativePath`: path in the pinned upstream commit

## 4. What this pack excludes

These trees exist in the upstream MIT repository. They are **not** in this pack
because they are not Proof of Play original art, or they keep a third-party
license:

| Excluded tree or pattern | Reason |
|---|---|
| `Assets/Pixel Art Icons/` | Unity Asset Store pack (Zakhan Pixel Art Icons) |
| `Assets/Honeti/` | Third-party PixelArtGUI pack |
| `Assets/Animated Loading Icons/` | Third-party loading-icon pack |
| `Assets/DemoPlaceholder/LowPolyWater_Pack/` | Third-party water pack |
| `Assets/ThirdPartyResources/` | Third-party code with its own license |
| `Assets/Plugins/`, `Assets/TextMesh Pro/` | Vendored plugins and Unity TMP |
| `meebit_*` models | Meebit character source, not Pirate Nation voxel art |
| `Game/BattleVFX/Audio` and `SND####` files | Commercial sound-library catalog names |
| Stock filenames (`tv_gameshow_buzzer`, `computer_mac_keyboard`, `hammering_metal`, `boxing_bell`, `household_door_open`, `short_flourish`) | Stock SFX remnants |
| Pixabay-style `name-12345.mp3` files | Stock download names |
| Apple / Google / Discord / email login marks | Third-party brand marks |

`tools/asset-pirate-nation/scripts/source-selection.ts` encodes these rules.
`verify-asset.ts` fails if a denied source path appears in a catalog.

## 5. Downstream open-source use

Games that use only this pack can keep an MIT (or compatible) license when they:

1. Keep `Copyright (c) 2026 Proof of Play, Inc.` and the MIT text in the
   shipped `LICENSE` or `THIRD_PARTY_NOTICES.md`.
2. Do not add assets from the excluded trees above.
3. Point reviewers at this `PROVENANCE.md` and the pinned commit
   `dc921b650c8a1d7c449b2a3553949d3e7c8266e9`.

This pack is a converted extract. It is not the full Unity project.

## 6. Post-extraction repairs

### 2026-08-24 — Y-normalization repair

The extractor normalized each model with a `normalizedShift`. It added that
shift to the mesh vertex Y coordinates. It must add the shift to the root node
transform. Composite models hold their parts under rotated pivot nodes. Each
rotated pivot also rotated the baked shift. As a result, 141 multi-part models
showed their parts away from the correct position (ships, buildings, world
bosses). All 279 shifted models were also too high.

The script `scripts/repair-model-normalization.ts` subtracted the shift from
the POSITION data of each affected GLB. This restores the upstream pose. The
`--verify` mode compared 5 repaired models with the upstream sources named in
`sourceRelativePath`. The maximum vertex deviation was less than 1e-3.

The script also refreshed `bounds`, `sizeBytes`, and `normalizedShift` in
`runtime/models.json`. The `bounds` of a repaired model is the world AABB of
the assembled pose. For a skinned model it is the bind-pose AABB. The `bounds`
of a model with no shift is still the extractor's mesh-space union.

The script is idempotent. Run `npm run repair:models` again after a
re-extract. Check a re-extract against upstream with
`npm run repair:models -- --verify`.

### 2026-08-24 — Moved to cdn-assets, thumbnails added

The pack moved from `public/assets/pirate-nation/` to
`public/cdn-assets/pirate-nation/`. The RUN.world CLI uploads only
`public/cdn-assets/` to the CDN, and the pack is too large for the game bundle.

`thumbnails/` holds one 320x320 JPEG per visual model. These are generated from
the pack's own GLBs by `npm run thumbnails`; they are not upstream art. They
carry the same license as the models they show.
