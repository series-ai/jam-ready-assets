# AGENTS.md - AI guide to this asset library

This repo is a curated library of **free game art** for building games on the **RUN platform**. This file tells an AI agent how to find, choose, and use assets here, and how to add more without breaking the structure.

## TL;DR for agents

- Everything here is **free to use, modify, and redistribute in any RUN game**, commercially included. There is no single library-wide licence: each pack carries its own `License.txt`, and CI refuses any licence outside **CC0-1.0, MIT, and BSD-2-Clause**. Of 296 packs, 292 are CC0 and 4 are MIT (Proof of Play *Pirate Nation*).
- **Never delete or move a pack's `License.txt`.** For CC0 packs it is provenance; for the others it is the whole obligation, and RUN.studio copies it into the creator's project alongside the assets.
- The public schema-v1 manifest stays **CC0-only** for older Studio builds. Licence-aware consumers use `manifest/v2/`, which may include MIT and BSD-2-Clause packs.
- Layout is **predictable**: `<dimension>/<theme>/<creator>-<pack>/`. Find assets by globbing themes, not by guessing filenames.
- For 3D in a RUN game, **use the `.glb`/`.gltf` file** in a pack (the RUN runtime loads it directly). `.fbx`/`.obj` are editable source only.
- Files are stored with **Git LFS**. After cloning, run `git lfs install && git lfs pull` or you'll only see pointer text, not real assets.

## Repository layout

```
2D/<theme>/<creator>-<pack>/     pixel art, sprites, tilesets, spritesheets (.png, .aseprite)
3D/<theme>/<creator>-<pack>/     models & kits (.glb, .gltf, .fbx, .obj, textures)
ui/<creator>-<pack>/             buttons, panels, cursors, HUD frames
icons/<creator>-<pack>/          game icons, input-prompt icons
audio/<creator>-<pack>/          music, SFX, voice (.ogg, .wav, .mp3)
fonts/<creator>-<pack>/          bitmap & web fonts
```

- The **creator prefix** on every pack folder (`kenney-`, `kaykit-`, `pixel-frog`/`grafxkid-`, etc.) tells you the source at a glance.
- Every pack carries a `License.txt` in its root naming its licence and the source it was verified against. Any original licence or readme the pack shipped with is kept alongside it.
- Full creator credits + source links are in [`README.md`](README.md).

## Themes

**2D:** `platformer` · `top-down-rpg` · `dungeon` · `fantasy` · `western` · `pirate` · `city` · `nature` · `farm` · `food` · `space-scifi` · `vehicles-racing` · `tower-defense` · `strategy-hex` · `characters` · `seasonal-holiday` · `sports` · `prototype-blocks` · `misc`

**3D:** `characters` · `dungeon` · `city` · `nature` · `farm` · `interior-furniture` · `food` · `fantasy` · `weapons` · `space-scifi` · `vehicles-racing` · `platformer` · `tower-defense` · `strategy-hex` · `pirate` · `seasonal-holiday` · `sports` · `prototype-blocks` · `misc`

> Theme contents change over time - enumerate live with `ls 2D/<theme>/` or `ls 3D/<theme>/` rather than assuming a fixed set of packs.

## How to find assets (recommended workflow)

1. **Pick dimension + theme** from the game concept. Examples:
   - mining / dungeon crawler → `3D/dungeon/`, `3D/misc/kaykit-resource-bits`, `3D/nature/`, `2D/top-down-rpg/`
   - cozy farming sim → `3D/farm/`, `3D/interior-furniture/`, `2D/farm/`
   - platformer → `2D/platformer/` (large), `3D/platformer/`
   - tower defense → `2D/fantasy/foozle-spire-*`, `2D/tower-defense/`, `3D/tower-defense/`
   - top-down RPG → `2D/top-down-rpg/`, `3D/characters/`, `3D/dungeon/`
2. **List packs** in that theme: `ls "2D/<theme>/"`.
3. **Inspect a pack** before using it: `ls "<pack>/"` and read its `Readme`/preview images. Many packs ship preview `.gif`/`.png` files.
4. **Cross-browse adjacent themes** - packs are filed by dominant use but often contain props usable elsewhere (e.g. `misc/` and `prototype-blocks/` hold particles, UI bits, blockout tiles).
5. **Note the `*-remastered` / version suffixes** when a creator ships multiple editions of the same set - prefer the newest unless you need pixel-for-pixel parity.

## Format guidance (RUN platform)

- **3D** - load the **`.glb`** (or `.gltf` + its `.bin`/textures) in your RUN game. Use the bundled `.fbx`/`.obj` only if you need to edit geometry in a 3D tool first, then re-export to glTF.
- **2D** - use the exported `.png` sprites/sheets. `.aseprite`/`.ase` files are editable source. Keep texture filtering at **nearest/point** so pixel art stays crisp.
- **Audio** - `.ogg` is the most broadly compatible; `.wav` is uncompressed source.
- **`cozy-farm` (3D/farm)** - use an unlit/emission material; its textures are baked and a metallic-roughness PBR setup washes out the colors.

## Rules for agents modifying this repo

- **Every pack must contain a licence file in its pack root**, named `License.txt` (or `LICENSE`, `COPYING`, `UNLICENSE`). A readme is not licence evidence, even when it mentions a licence: copy the terms into `License.txt`. CI rejects a pack with no licence file, with two of them, or with a licence outside the allowed set, and names the pack in the failure.
- **Allowed licences: `CC0-1.0`, `MIT`, `BSD-2-Clause`.** MIT and BSD-2-Clause require their copyright and permission notices to ship with the work, which the pipeline handles automatically. Anything demanding visible attribution (CC-BY), share-alike, non-commercial terms, modified-version marking (Zlib), an endorsement restriction (BSD-3-Clause), a NOTICE file (Apache-2.0), or reserved font names (OFL) is refused, as is any public-domain dedication other than CC0 (Unlicense): one dedication keeps the CC0 checks meaningful. A pack mixing two licences must be split.
- **Head the licence file with its provenance** so the claim is checkable:
  ```
  SPDX-License-Identifier: CC0-1.0
  Source: https://example.itch.io/the-pack
  Verified-by: Your Name, YYYY-MM-DD
  ```
  CI requires recognisable terms in the body, fails when the body and header disagree, and checks that MIT and BSD-2-Clause carry their full notices plus a real copyright line. An SPDX header cannot admit a pack on its own.
- **Follow the layout:** `2D|3D/<theme>/<creator>-<pack-slug>/` (lowercase, dash-separated). UI/icons/audio/fonts go in their top-level buckets.
- **Keep any original `License.txt`/`Readme`** the pack shipped with, alongside the one above.
- **Binary assets must be LFS-tracked.** Patterns live in `.gitattributes` (png, jpg, gif, fbx, glb, gltf, bin, obj, mtl, blend, ogg, wav, mp3, zip, fonts). If you introduce a new binary extension, add it there before committing.
- **Never commit junk:** no `.DS_Store`, `__MACOSX/`, `*.app/`, `Thumbs.db` (already covered by `.gitignore`).
- **Update [`README.md`](README.md)** credits + theme lists when you add a new creator or theme.
- **Don't reference other game engines/platforms** in docs - this library is framed for the RUN platform.

## GCS mirror (CI-owned - do not hand-edit or hand-upload)

Every push to `main` runs `.github/workflows/build-manifest.yml`, which builds a
JSON manifest of all packs and mirrors game-loadable files to the public bucket
`gs://run-asset-library`, consumed by RUN.studio:

- `objects/<sha256>` - immutable content-addressed files (the sha256 comes from
  each file's Git LFS pointer). Only OIDs missing from the bucket are uploaded,
  so pushes are incremental.
- `manifest/index.json`, `manifest/packs/*.json`, `manifest/files.json` -
  regenerated every push (`scripts/build-manifest.mjs`), short cache TTL.

Each pack summary in `index.json` carries a `license` field holding its SPDX id, which is
what RUN.studio shows a creator before they import. In `manifest/packs/<id>.json` the pack's
licence file is flagged `"license": true`. That flag is what gets it mirrored and copied into
a creator's project; it is deliberately not a runtime file, so it stays out of
`runtimeFileCount` and out of the asset paths handed to the coding agent.

"Runtime" files (what studio imports into games): `.glb` for 3D (gltf/bin/textures
only when a pack has no glb), `.png`/`.svg`/`.gif` for 2D/UI, `.ogg`/`.mp3` for audio
(`.wav` only when no compressed version exists), font formats for fonts. Editable
sources (`.fbx`, `.obj`, `.blend`, `.aseprite`, …) and `Source/`/`Samples/` dirs are
never mirrored. Adding packs needs no manifest work - CI picks them up as long as
the standard layout (`2D|3D/<theme>/<creator>-<pack>/`, flat `ui|icons|audio|fonts`)
is followed and the pack carries a licence file.

Two gates guard this. `.github/workflows/check-packs.yml` runs on every pull request and
fails on any pack the licence rules reject: that is where a problem should be caught. On
`main`, a pack that has never shipped is skipped so one bad contribution cannot freeze the
catalogue for everyone, the good packs still publish, and the job then fails naming what was
skipped. A pack that is **already** published and would now be rejected stops the build
before the mirror runs, because dropping it from `index.json` would silently unpublish it.
