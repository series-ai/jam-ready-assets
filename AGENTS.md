# AGENTS.md - AI guide to this asset library

> ## ⚠️ This repository is PUBLIC. Everything in it is public communication.
>
> `series-ai/jam-ready-assets` is open to the world. Anyone, logged in or not, can read every
> file, commit message, pull request title and body, issue, and code review comment, and search
> engines index them. Treat anything you write here as published under the RUN name, because it is.
>
> **Write for an outside reader, and assume creators whose work is in the library will read it.**
>
> - **Never name a creator or pack in a negative light.** Do not record that a pack was rejected on
>   taste, that a creator's licence wording is contradictory, or that their art was not good enough.
>   Make the technical point without the name: "a store licence tag can disagree with the page terms"
>   rather than naming who. A rejection note that helps nobody here can cost a small creator real
>   standing, and they can find it.
> - **Never put a personal name in a committed file.** `Verified-by` is `run-workshop maintainers`,
>   not a person. These licence files are copied into every creator's project, so a name here travels
>   much further than a commit author line.
> - **No internal references.** No Linear issue keys (`RUN-123`), no references to private repos or
>   their pull requests, no internal service names, dashboards, Slack channels, or employee emails.
>   Describe the reason, not the ticket.
> - **No internal process narration.** Sprint plans, review gates, launch dates, headcount, and
>   anything about what the company is about to ship stay out.
> - **Keep the licence reasoning, drop the gossip.** Explaining *why* a pack is admissible is useful
>   to everyone and belongs here. Explaining *who* failed and how is neither.
> - **Commit messages are the hard case.** A pull request body can be edited; a commit message that
>   has been pushed is effectively permanent. Get it right the first time.
>
> If something genuinely needs to be said and cannot be said in public, put it in the internal
> tracker and link nothing.

This repo is a curated library of **free game art** for building games on the **RUN platform**. This file tells an AI agent how to find, choose, and use assets here, and how to add more without breaking the structure.

## TL;DR for agents

- Everything here is **free to use, modify, and redistribute in any RUN game**, commercially included. There is no single library-wide licence: each pack carries its own `License.txt`, and CI refuses any licence outside **CC0-1.0, MIT, BSD-2-Clause, and the RUN License** (`LicenseRef-RUN-Repository-Supplemental-1.0`, run-workshop's `LICENSE.md`). Of 338 packs, 318 are CC0, 4 are MIT (Proof of Play *Pirate Nation*), and 16 are under the RUN License (every RUN Voxel Packs leaf: RUN projects only until it converts to MIT on 2028-01-01; the `3D/characters` leaves also keep Proof of Play's MIT notice for the Pirate Nation rig data they carry).
- **Never delete or move a pack's `License.txt`.** For CC0 packs it is provenance; for the others it is the whole obligation, and RUN.studio copies it into the creator's project alongside the assets.
- The public schema-v1 manifest stays **CC0-only** for older Studio builds. Licence-aware consumers use `manifest/v2/`, which may include MIT, BSD-2-Clause and RUN License packs.
- Layout is **predictable and pack-first**: `<creator>-<pack>/<dimension>/<theme>/` (plus flat `<pack>/ui|icons|fonts|audio/` buckets). Find assets by globbing themes across packs (`ls -d */2D/platformer`), not by guessing filenames.
- For 3D in a RUN game, **use the `.glb`/`.gltf` file** in a pack (the RUN runtime loads it directly). `.fbx`/`.obj` are editable source only.
- Files are stored with **Git LFS**. After cloning, run `git lfs install && git lfs pull` or you'll only see pointer text, not real assets.

## Repository layout

Every pack is a top-level directory. Inside it, content is bucketed by dimension
(with a theme level under `2D/` and `3D/`) or by flat type buckets:

```
<creator>-<pack>/2D/<theme>/     pixel art, sprites, tilesets, spritesheets (.png, .aseprite)
<creator>-<pack>/3D/<theme>/     models & kits (.glb, .gltf, .fbx, .obj, textures)
<creator>-<pack>/ui/             buttons, panels, cursors, HUD frames
<creator>-<pack>/icons/          game icons, input-prompt icons
<creator>-<pack>/audio/          music, SFX, voice (.ogg, .wav, .mp3)
<creator>-<pack>/fonts/          bitmap & web fonts
```

Most packs hold a single bucket, but one pack may span several, e.g.
`proofofplay-pirate-nation/` carries `3D/pirate/`, `ui/`, `icons/`, and
`audio/` in one place. Each bucket/theme leaf is one catalog pack in the
manifest, with id `<pack>/<bucket>[/<theme>]`.

- The **creator prefix** on every pack folder (`kenney-`, `kaykit-`, `pixel-frog`/`grafxkid-`, etc.) tells you the source at a glance.
- Every pack carries a `License.txt` in its root naming its licence and the source it was verified against. Any original licence or readme the pack shipped with is kept alongside it.
- Full creator credits + source links are in [`README.md`](README.md).

## Themes

**2D:** `platformer` · `top-down-rpg` · `dungeon` · `fantasy` · `western` · `pirate` · `city` · `nature` · `farm` · `food` · `space-scifi` · `vehicles-racing` · `tower-defense` · `strategy-hex` · `characters` · `seasonal-holiday` · `sports` · `prototype-blocks` · `misc`

**3D:** `characters` · `dungeon` · `city` · `nature` · `farm` · `interior-furniture` · `food` · `fantasy` · `weapons` · `space-scifi` · `vehicles-racing` · `platformer` · `tower-defense` · `strategy-hex` · `pirate` · `monster` · `post-apocalypse` · `seasonal-holiday` · `sports` · `prototype-blocks` · `misc`

> Theme contents change over time - enumerate live with `ls -d */2D/<theme>` or `ls -d */3D/<theme>` rather than assuming a fixed set of packs.

## How to find assets (recommended workflow)

1. **Pick dimension + theme** from the game concept, then glob for packs carrying it. Examples:
   - mining / dungeon crawler → `*/3D/dungeon`, `kaykit-resource-bits/`, `*/3D/nature`, `*/2D/top-down-rpg`
   - cozy farming sim → `*/3D/farm`, `*/3D/interior-furniture`, `*/2D/farm`
   - platformer → `*/2D/platformer` (large), `*/3D/platformer`
   - tower defense → `foozle-spire-*/2D/fantasy`, `*/2D/tower-defense`, `*/3D/tower-defense`
   - top-down RPG → `*/2D/top-down-rpg`, `*/3D/characters`, `*/3D/dungeon`
2. **List packs** in that theme: `ls -d */2D/<theme>`.
3. **Inspect a pack** before using it: `ls "<pack>/"` and read its `Readme`/preview images. Many packs ship preview `.gif`/`.png` files.
4. **Cross-browse adjacent themes** - packs are filed by dominant use but often contain props usable elsewhere (e.g. `misc/` and `prototype-blocks/` hold particles, UI bits, blockout tiles).
5. **Note the `*-remastered` / version suffixes** when a creator ships multiple editions of the same set - prefer the newest unless you need pixel-for-pixel parity.

## Format guidance (RUN platform)

- **3D** - load the **`.glb`** (or `.gltf` + its `.bin`/textures) in your RUN game. Use the bundled `.fbx`/`.obj` only if you need to edit geometry in a 3D tool first, then re-export to glTF.
- **2D** - use the exported `.png` sprites/sheets. `.aseprite`/`.ase` files are editable source. Keep texture filtering at **nearest/point** so pixel art stays crisp.
- **Audio** - `.ogg` is the most broadly compatible; `.wav` is uncompressed source.
- **`cozy-farm/3D/farm`** - use an unlit/emission material; its textures are baked and a metallic-roughness PBR setup washes out the colors.

## Rules for agents modifying this repo

- **Every pack must contain a licence file in its pack root** (the bucket/theme leaf dir the assets live in, e.g. `<pack>/3D/pirate/License.txt`, one per leaf when a pack spans buckets), named `License.txt` (or `LICENSE`, `COPYING`, `UNLICENSE`). A readme is not licence evidence, even when it mentions a licence: copy the terms into `License.txt`. CI rejects a pack with no licence file, with two of them, or with a licence outside the allowed set, and names the pack in the failure.
- **Allowed licences: `CC0-1.0`, `MIT`, `BSD-2-Clause`, `LicenseRef-RUN-Repository-Supplemental-1.0` (the RUN License).** MIT and BSD-2-Clause require their copyright and permission notices to ship with the work, and the RUN License requires its whole text to ship with the work, which the pipeline handles automatically. Only Series Entertainment work from run-workshop uses the RUN License. Anything demanding visible attribution (CC-BY), share-alike, non-commercial terms, modified-version marking (Zlib), an endorsement restriction (BSD-3-Clause), a NOTICE file (Apache-2.0), or reserved font names (OFL) is refused, as is any public-domain dedication other than CC0 (Unlicense): one dedication keeps the CC0 checks meaningful. A pack mixing two licences must be split.
- **Head the licence file with its provenance** so the claim is checkable:
  ```
  SPDX-License-Identifier: CC0-1.0
  Source: https://example.itch.io/the-pack
  Verified-by: run-workshop maintainers, YYYY-MM-DD
  ```
  **`Verified-by` is always `run-workshop maintainers`, never a person's name.** This repository is
  public and these files ship into every creator's project, so a real name here is published far
  more widely than whoever wrote it intended. The line records that the library's maintainers
  checked the licence on that date, which is the part anyone relying on it needs.
  CI requires recognisable terms in the body, fails when the body and header disagree, and checks that MIT, BSD-2-Clause and the RUN License carry their full terms plus a real copyright line (the RUN License also needs the `Source:` and `Verified-by:` lines). An SPDX header cannot admit a pack on its own.
- **Follow the layout:** packs are top-level, `<creator>-<pack-slug>/` (lowercase, dash-separated), holding `2D|3D/<theme>/` and/or flat `ui|icons|audio|fonts/` bucket dirs. Keep everything one pack ships under its single top-level dir, even when it spans buckets. A pack dir may contain **only** bucket dirs; CI rejects anything else at that level.
- **Name files and folders for what they show.** RUN.studio's asset search matches the words in a pack's file and folder names, extracted automatically when the manifest is built, so there is no keyword file to maintain. `coinGold.png` or `Characters/knight.png` is findable; `tile_0001.png` is not. When a source pack numbers its files, keep the original names and group them into descriptively named folders instead. The PR check warns when a pack you add or change gives search fewer than three words.
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
- `packs/<id>@<version>/<path>` - immutable path-addressed copies of each pack's
  runtime + licence files, in the pack's original folder shape. These are the
  URLs published games load at runtime, so relative sibling references resolve
  (a `.gltf` finds its `.bin`, an atlas its `.png`). `<version>` is derived from
  the mirrored file contents (`build-manifest.mjs`), not the commit: an unchanged
  pack keeps its version across pushes, so all games share the same long-cached
  URLs; a changed pack gets a new `@version` prefix. **Append-only forever:
  never delete or overwrite anything under `packs/` or `objects/` - shipped
  games reference these URLs permanently, even for packs later removed from
  this repo.** (The bucket has object versioning as a backstop, not a licence
  to delete.)
- `manifest/index.json`, `manifest/packs/*.json`, `manifest/files.json` -
  regenerated every push (`scripts/build-manifest.mjs`), short cache TTL.

Each pack summary in `index.json` carries a `license` field holding its SPDX id, which is
what RUN.studio shows a creator before they import. In `manifest/packs/<id>.json` the pack's
licence file is flagged `"license": true`. That flag is what gets it mirrored and copied into
a creator's project; it is deliberately not a runtime file, so it stays out of
`runtimeFileCount` and out of the asset paths handed to the coding agent.

Each v2 pack summary also carries `addedAt` - the committer date of the first commit that
added the pack, reconstructed from git history at build time (`scripts/pack-dates.mjs`), so
adding a pack still needs no manifest work. RUN.studio's "Newest" ordering and NEW badge
read it. Packs first published before the cutoff in `pack-dates.mjs` are additionally marked
`"backfilled": true`: their dates arrived in bulk, and without the flag the NEW badge would
land on the entire library at once. Both fields depend on full git history, so the workflows
check out with `fetch-depth: 0`; a shallow build omits the dates rather than publishing
wrong ones.

Each v2 pack summary also carries `keywords`: up to 60 lowercase words taken from the pack's
runtime file and folder names (`scripts/pack-keywords.mjs`), most common first. Pack titles
rarely say what is inside, so RUN.studio's asset search matches these too, and a search for
"coin" or "sword" finds the packs that contain one. Clear file names make a pack easier to
find. Like every manifest field, consumers should treat the words as untrusted text.

## Lighter variants (`light-variants.json`)

Big pictures and sounds make a game slower to open. A pack can additionally be published as a
**lighter variant**: the same files at the same relative paths, with selected pictures and sounds
made smaller. It is purely additive. The original pack, its `version`, its files, its
`packs/<id>@<version>/` URLs and the schema-v1 manifest never change, and anything the variant does
not cover points at the original bytes.

- **Opt-in per pack.** Only packs named in the committed `light-variants.json` get a variant:
  ```json
  "packs": {
    "example-icons/ui": { "images": "lossless" },
    "example-backdrops/2D/misc": { "images": "resize", "maxDimension": 1024, "exclude": ["Sheets"] },
    "example-sounds/audio": { "audio": "non-looping" }
  }
  ```
  `lossless` keeps every pixel and only re-encodes. `resize` shrinks pictures to fit
  `maxDimension`, so use it only where pictures are single images, not gridded sheets. `audio` is
  re-encoded only when the pack's sounds are known not to loop. `pixelArt: true` keeps hard pixel
  edges. 3D packs are refused: models reference textures by path and are tuned to them.
- **Conservative within a pack.** A picture is eligible only when it is a runtime PNG or JPEG
  that no atlas, bitmap font or map file in the pack names, and (for `resize`) whose path does not
  say `sheet`, `tile`, `strip`, `frame` or similar. GIFs, SVGs, fonts, licence files and models
  always stay original. A result is used only when it is the same format, smaller, and the right
  size (identical for `lossless`, within bounds and the same shape for `resize`). Otherwise the
  original is kept.
- **Pinned conversion.** Conversion runs the asset-preparation helper published with RUN CLI
  releases, pinned by SHA-256 in `helper.sha256`. With no pin, nothing is converted. A different
  build is refused rather than mixed into the cache.
- **Converted once.** Every result is stored in the bucket as one immutable record under
  `variants/results/<recipeVersion>-<helper>/`, keyed by the source file's sha256 and the
  options. Each run reads that index once, pulls from LFS and converts only sources it has never
  seen, at most `limits.maxConversionsPerRun` per run, so a daily rebuild with nothing new
  converts nothing. Changing the recipe version or the helper pin converts again. Like `objects/`
  and `packs/`, `variants/` is append-only: nothing there is ever overwritten or deleted.
- **Published.** Smaller files go to `objects/<sha256>` like everything else, then the variant is
  served under its own `packs/<id>@<variantVersion>/` prefix, its version derived from its own
  files and licence with the same formula as the original. A pack advertises its variant only once
  every eligible file has a result, and the mirror stops advertising it if any of its objects is
  missing from the bucket.

In `manifest/v2/index.json` a pack with a variant gains:

```json
"variantsVersion": "<12 hex>",
"variants": {
  "light": {
    "version": "<variantVersion>",
    "recipeVersion": "light-v1-<helper>",
    "totalBytes": 123456,
    "runtimeFileCount": 42,
    "manifestPath": "manifest/v2/commits/<commit>/variants/light/<id with / as -->.json"
  },
  "originalUrl": "https://github.com/series-ai/jam-ready-assets/tree/<commit>/<id>"
}
```

The variant manifest has the original manifest's shape (`id`, `version`, `files`) plus
`variant`, `originalVersion` and `recipeVersion`. Changed files carry their new `oid` and `bytes`,
the original's `sourceOid`/`sourceBytes`, and `width`/`height`; unchanged eligible pictures carry
their `width`/`height`. `originalUrl` is a commit-pinned page of the pack's original files, so a
creator can always get the full-size artwork. Consumers that do not know these fields ignore
them.

To try a recipe without the bucket, build the manifest, then
`LIGHT_VARIANT_STORE=.variant-dry-run LIGHT_VARIANT_HELPER=<path to helper> node scripts/build-light-variants.mjs`.
The local directory is laid out like the bucket.

## Featuring packs for an event (`featured.json`)

To put a curated shelf at the top of RUN.studio's Assets panel (e.g. for a jam), check a
hand-written `featured.json` into the repo root:

```json
{
  "title": "Neon Nights Jam",
  "blurb": "Packs for night streets, neon and synth. Picked by the RUN team.",
  "endsAt": "2026-09-06T00:00:00Z",
  "packIds": [
    "kenney-isometric-tiles-buildings/2D/city",
    "kenney-music-jingles/audio"
  ]
}
```

- `packIds` order is shelf order. Every id must exist in the catalogue - a typo fails the
  build (and the PR gate) rather than silently dropping a pack from the shelf.
- Copy budget is enforced: `title` ≤ 4 words, `blurb` ≤ 14 words, so the shelf header stays
  readable at Studio's narrowest 400px column. Sentence case, no exclamation, no emoji.
- `endsAt` is optional and evaluated client-side by Studio; when it passes, the shelf
  retires on its own and Studio falls back to Newest. Deleting the file retires it too.
  Either way there is no Studio deploy in the loop - but the catalogue is cached for 10
  minutes, so merge-to-visible is 10-15 minutes and the shelf cannot carry anything
  time-critical inside an hour.
- The block lands in `manifest/v2/index.json` only; older Studio builds on the legacy
  manifest never see it. Validation lives in `scripts/featured.mjs`.

"Runtime" files (what studio imports into games): `.glb` for 3D (gltf/bin/textures
only when a pack has no glb), `.png`/`.svg`/`.gif` for 2D/UI, `.ogg`/`.mp3` for audio
(`.wav` only when no compressed version exists), font formats for fonts. Editable
sources (`.fbx`, `.obj`, `.blend`, `.aseprite`, …) and `Source/`/`Samples/` dirs are
never mirrored. Adding packs needs no manifest work - CI picks them up as long as
the standard layout (`<pack>/2D|3D/<theme>/`, flat `<pack>/ui|icons|audio|fonts/`)
is followed and each bucket/theme leaf carries a licence file in its root.

Two gates guard this. `.github/workflows/check-packs.yml` runs on every pull request and
fails on any pack the licence rules reject: that is where a problem should be caught. On
`main`, a pack that has never shipped is skipped so one bad contribution cannot freeze the
catalogue for everyone, the good packs still publish, and the job then fails naming what was
skipped. A pack that is **already** published and would now be rejected stops the build
before the mirror runs, because dropping it from `index.json` would silently unpublish it.
