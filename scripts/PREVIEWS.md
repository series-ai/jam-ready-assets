# Maintaining asset thumbnails

`preview-sources.json` explicitly selects artwork for each catalog pack. Prefer the
creator's original showcase image or sample scene. A full inventory sheet is a poor
thumbnail when its objects become unreadable at card size. Keep the original image's
composition, match the included edition, and record its source and licence evidence.

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
   title-only covers, unreadable inventories, or art for assets outside this pack.
5. Run `npm test` and `SKIP_PUBLISHED_CHECK=1 node scripts/build-manifest.mjs`.
   Include the source selection and derivative in the same PR. Do not edit the bucket.

Sources under `scripts/preview-inputs/` are fallbacks made from actual included
assets. `compose-fallback-previews.mjs` reproduces the Barker and Puny Monsters
sheets plus the explicit small Kenney selections in `kenney-preview-selections.json`;
`compose-audio-preview.mjs` uses ffmpeg to extract waveform samples from
three Pirate Nation tracks. Hydrate their named inputs first. Their provenance
files record exact source paths and SHA-256 hashes. Pirate Nation's three visual
proofs reuse the reviewed outputs from Venus PR 4650; their pinned remote URLs and
the original proof provenance are retained here.

## Publication and rollback

PR validation fetches only the committed WebP derivatives and verifies their hashes,
decodability, dimensions, and size. The manifest builder also works in a pointer-only
checkout. Normal CI never scrapes or generates artwork.

The existing mirror publishes new immutable objects with `image/webp` and a one-year
cache lifetime before switching either catalog index. Studio continues reading
`previewOid` through `previewUrl`; no schema or backend rollout is required. Catalog
caches can take 10-15 minutes to refresh. Revert the selection and derivative together
to roll back. Preserve all old objects and runtime pack URLs.

## Audit note

The pack currently named `grafxkid-rocky-roads` matches the original **Essssam**
Rocky Roads listing at https://essssam.itch.io/rocky-roads. Its thumbnail provenance
records that source and its CC0 declaration. This thumbnail change preserves the
existing pack ID, creator metadata, and runtime licence file; correcting that earlier
catalog attribution is separate work.
