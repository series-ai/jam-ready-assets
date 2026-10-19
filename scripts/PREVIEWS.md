# Maintaining asset thumbnails

`preview-sources.json` explicitly selects artwork for each catalog pack. Prefer the
creator's original showcase image or sample scene. A full inventory sheet is a poor
thumbnail when its objects become unreadable at card size. Keep the original image's
composition, match the included edition, and record its source and licence evidence.

## Why every thumbnail is chosen by hand

There is no automatic thumbnail, and that is deliberate. The obvious default, packing a
pack's assets into one image, produces a contact sheet: every sprite in the pack tiled
into a single picture. It looks complete and it is almost always illegible. Studio renders
these at roughly 144px, so a sheet of forty 16x16 sprites gives each one about 20px of
card. The result reads as texture rather than art, and a creator browsing the panel cannot
tell what is in the pack or tell two packs apart.

Three failure modes come up repeatedly, and all three are rejected at step 4 below:

- **Inventory sheets.** Every item in the pack at once. Nothing is readable. This is what
  the naive default produces and it is the single most common reason to reject an image.
- **Slivers.** A wide strip such as an animation filmstrip or a 960x96 tileset banner. Fitted
  into a square card it becomes a thin line with most of the card empty. `0x72-dungeon-tileset-ii`
  hit exactly this, so its thumbnail is a composed grid of nine monsters instead.
- **Series banners.** One branded cover reused across a creator's whole range, where the art
  is a small strip under a large wordmark. Each pack is legible on its own but a shelf of them
  is a wall of identical covers.

Pick, in order of preference:

1. The creator's **listing cover or mockup scene**, when it shows this pack's art assembled.
   This is the best case: it is designed, it is composed, and it is the art the creator chose
   to lead with.
2. A **bundled sample scene** shipped inside the pack, such as a `Mockup.png`.
3. A **composed derivative**: a handful of representative sprites enlarged to a readable size
   via `compose-fallback-previews.mjs`. Use this when the pack ships no usable showcase image.
   The composer trims each sprite, scales it to a 128px tile (nearest-neighbour for pixel art)
   and lays out at most nine in a grid. Nine large sprites beat four hundred small ones.

A composed grid is a fallback, not an upgrade. When a creator's own cover reads well at card
size, keep it: hand-built grids of small sprites on a flat background tend to look like debug
output next to designed cover art. Judge it at 144px before deciding, not at full size.

Each pack has a committed, LFS-tracked `preview.webp`: one static image, at most 512px
on either axis and 100 KiB. It appears in the per-pack manifest solely for mirroring.
It never becomes a runtime file, changes the runtime version, or adds to asset counts
or download sizes. Existing source files retain their original runtime classification.

## Update an image

1. Set the pack's `sourcePath`, `sourceUrl`, `sourceSha256`, `description`, and
   `licenseEvidence`. An external original also has an `imageUrl`; its local path
   must be inside the ignored `.preview-sources/` cache. A bundled original keeps
   its existing repository path. `frame` optionally selects one GIF frame (zero-based).
2. Hydrate the selected bundled LFS source, or run
   `node scripts/fetch-preview-sources.mjs '<pack-id>'` for a pinned external original.
   This is the only thumbnail maintenance command that contacts creator sites.
   A changed remote hash fails and requires an explicit new selection.
3. Run `npm ci`, `npm run previews:generate`, and `npm run previews:check`.
   Generation is offline. An unchanged source and recipe reuse the committed image.
   The generator writes the output hash, dimensions, and byte size to the selection.
4. Inspect the result at 144px and 256px. Reject blank frames, texture atlases,
   title-only covers, unreadable inventories, slivers, or art for assets outside this pack.
   Render the candidates side by side as a contact sheet at 144px and look at them: a pack
   that is indistinguishable from its neighbours has failed even when the image is sharp.
5. Run `npm test` and `SKIP_PUBLISHED_CHECK=1 node scripts/build-manifest.mjs`.
   Include the source selection and derivative in the same PR. Do not edit the bucket.

Sources under `scripts/preview-inputs/` are fallbacks made from actual included
assets. `compose-fallback-previews.mjs` reproduces the Barker and Puny Monsters
sheets plus the explicit small Kenney selections in `kenney-preview-selections.json`;
`compose-audio-preview.mjs` uses ffmpeg to extract waveform samples from
three Pirate Nation tracks. Hydrate their named inputs first. Their provenance
files record exact source paths and SHA-256 hashes. Pirate Nation's three visual
proofs reuse previously reviewed outputs; their pinned remote URLs and
the original proof provenance are retained here.

## Square thumbnails

Studio shows every thumbnail in a square tile. A landscape image still works, since Studio
letterboxes it over a blurred copy of itself, but a square one fills the card. Make new
thumbnails square, and square an existing one whenever you touch it.

Add a `crop` to the pack's selection: `{ "left": 384, "top": 0, "size": 929 }`, a square in
the source image's own pixels, cut before the 512px resize. A changed crop changes the
recipe, so `npm run previews:generate` rebuilds that pack and leaves the rest alone.

- Start from the centre of the image and move the square until no logo, wordmark, badge or
  caption is cut through. A whole mark is fine. Half a word reads as a mistake.
- When a corner badge and an opposite corner label leave no full-height square clear of
  both, use a smaller square anchored to the top (KayKit samples crop to 86% of the height).
- Don't crop a wordmark that is wider than any square, or an inventory sheet into
  unreadable slivers. Leave that image landscape and note it in the PR.

`npm run previews:check` reports how many previews are still not square. It is advisory:
it never fails CI.

## Gallery images

The pack preview in Studio is a carousel: the thumbnail first, then up to six more images.
List them as `gallery` on the pack's selection, as pack-relative paths of the pack's own
files, in display order:

```json
"gallery": ["SampleA.png", "SampleB.png"]
```

Each one must be a PNG, JPEG, WebP or GIF of at most 1 MiB, and may be any image in the
pack except the licence notice and `preview.webp`. A creator's sample scene is often not a
runtime file; the mirror publishes every gallery image the same way it publishes the
thumbnail. The manifest builder rejects anything else.

Choose images that show what the pack contains: sample scenes and mockups first, then
sheets and backgrounds whose art is readable at about 384px. A gallery needs at least two
such images; a pack with fewer keeps just its thumbnail rather than padding the carousel
with a lone sprite. Never use an animation strip (it reads as a sliver), a colour palette
or swatch atlas, a UV or skin texture, the thumbnail's own source image, or several colour
variants of the same sheet. In a 3D pack only rendered previews qualify.

The first galleries were picked with those rules from the visual labels in `metadata/`
(kind `preview`, then `sheet` and `background`, at least 160px on the short side), then
reviewed as contact sheets. Edit any pack's list by hand; a hand-written list is kept as is.
Without a `gallery`, Studio guesses from the pack's runtime files, so a pack whose images
are all weak is better left without one.

## Publication and rollback

PR validation fetches only the committed WebP derivatives and verifies their hashes,
decodability, dimensions, and size. The manifest builder also works in a pointer-only
checkout. Normal CI never scrapes or generates artwork.

The existing mirror publishes new immutable objects with `image/webp` and a one-year
cache lifetime before switching either catalog index. Studio continues reading
`previewOid` through `previewUrl`; no schema or backend rollout is required. `galleryOids`
is optional: a Studio worker that predates it ignores the field. Catalog
caches can take 10-15 minutes to refresh. Revert the selection and derivative together
to roll back. Preserve all old objects and runtime pack URLs.

## Audit note

The pack currently named `grafxkid-rocky-roads` matches the original **Essssam**
Rocky Roads listing at https://essssam.itch.io/rocky-roads. Its thumbnail provenance
records that source and its CC0 declaration. This thumbnail change preserves the
existing pack ID, creator metadata, and runtime licence file; correcting that earlier
catalog attribution is separate work.
