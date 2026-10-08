# Visual asset metadata

This directory adds image descriptions and static search thumbnails to the asset catalog.
Original assets, filenames and licence files remain the source of truth. Metadata never
changes a pack's content version or the legacy schema-v1 manifest.

## Stored records

- `labels/00.jsonl.gz` through `labels/ff.jsonl.gz`: source SHA-256 keyed records,
  including description, visual keywords, style, perspective, decoded dimensions,
  frame/page counts, confidence, evidence revision and generation identity. All source
  labels are retained, including editable-source and preview evidence.
- `paths.jsonl.gz`: exact repository path, pack id, source SHA-256 and role. Only a
  current runtime file with a matching path and SHA-256 contributes visual search terms.
- `thumbnails.json`: source SHA-256 to thumbnail SHA-256, byte count, width and height.
- `thumbnails/00.tar` through `thumbnails/ff.tar`: Git LFS archives grouped by source
  hash prefix. Entries are flat `<thumbnail-sha256>.webp` files. Different sources can
  share an identical thumbnail. Each thumbnail is static, at most 256 pixels per side
  and 40 KiB, with preserved aspect ratio and nearest-neighbor scaling for pixel art.
- `visual.json`: schema version, publication enable switch and explicit per-hash
  generation invalidations. Empty invalidations reuse approved historical identities.

Labels are asset facts. They do not determine licences or prove that a file can be used
independently. Selectability also checks the current category, extension, frame count,
font and animation paths, and companion descriptors. Dependent or uncertain assets stay
available through their whole pack. A spritesheet is always the complete original file.

## Search format

`node scripts/build-manifest.mjs` writes an immutable catalog beneath
`manifest/v2/commits/<commit>/assets/`. `index.json` carries the metadata revision,
asset count, page size (16), ordered pack table and membership shard count. Asset ids
are SHA-256 of `packId + NUL + originalPath`; ordinals are dense and sorted by asset id.

- `pages/<n>.json`: at most 16 asset records and 64 KiB.
- `packs/<encoded-pack-id>.json`: compact `entries` of `{id, ordinal}` for selection validation.
  Consumers fetch the corresponding detail pages only for selected ids.
- `terms/<word>.json`: sorted ordinal arrays (`ids`) or base64 bitsets (`bits`).
  Bit `n` is `bytes[n >> 3] & (1 << (n & 7))`. Raw words and applicable singular
  forms are both indexed. Every term file is at most 256 KiB.
- `membership/<n>.json`: `start` ordinal plus base64 unsigned 16-bit little-endian
  pack-table indices, covering at most 32,768 consecutive ordinals.
- `coverage.json`: runtime, label, thumbnail, selectable and filename-fallback counts.

Descriptor plus membership is limited to 512 KiB. If the catalog exceeds that bound,
individual search is explicitly disabled while pack manifests remain publishable.
Display descriptions are limited to 300 characters, paths to 1,024 characters, and
keywords to 12 phrases of at most 70 characters. Postings retain the full validated
word set. Pack summaries preserve their original 60 filename keywords in order and
append at most 40 distinct visual words. Missing labels keep filename search usable.

The mirror verifies archive paths, types, checksums, hashes, byte counts and decoded
static WebP geometry before uploading missing thumbnail objects. Immutable objects and
catalog files publish before the mutable v2 index. Older objects remain available for
pinned consumers and pointer rollback.

## Generate new labels

The trusted-main visual metadata workflow runs incrementally and opens or updates one
metadata pull request. It never merges or commits directly to main. Configure repository
secret `ASSET_VISION_OPENAI_API_KEY` with access to `gpt-6-astra`. Fork pull requests run
only deterministic validation and never receive this secret.

For an authorized local generation run:

```sh
npm ci
python3 -m pip install -r scripts/visual-requirements.txt
SKIP_PUBLISHED_CHECK=1 node scripts/build-manifest.mjs
node scripts/generate-visual-labels.mjs --limit 200 --concurrency 3 --status-file generation-status.json
```

The script reads actual SHA-256 verified image bytes and uses the Responses API with
strict structured output and low reasoning effort. It samples animation frames and
large-image crops, refuses external SVG resources, and bounds generation to 200 hashes
and three concurrent calls. Transient HTTP failures receive at most three retries;
authentication/quota failures stop new calls. Ambiguous transport failures also stop
new calls. Accepted records checkpoint after each hash, even if a later image fails.

`--resume-dir <root>` accepts the preceding metadata branch's `metadata/` subtree.
Accepted current-main records take precedence; missing or explicitly invalidated hashes
can reuse accepted bot-branch records. Fetch that branch's thumbnail LFS objects first;
archive readers can resolve pointer files through the local LFS object cache. A completed
cache run makes zero API calls and needs no API credential. `--limit 0` is a spend-free
coverage check. The optional status file reports generated, resumed, pending, API-call
and error counts. `--max-seconds 1800` stops new work before the workflow deadline
and leaves remaining hashes for the next run. CI preserves accepted metadata even when the generator exits nonzero.

Targeted invalidation is explicit, for example:

```json
{"schemaVersion":1,"enabled":false,"invalidations":{"<source-sha256>":true}}
```

`true` requires the current generation identity for that source hash only. An object
can instead require specific identity fields. Other hashes remain reusable. Unsupported
sources keep their existing filename fallback until a supported decoder is available.

The publication switch defaults to false. Enable it only after consumers support the
selection contract and any previously issued upload credentials have expired. A rollback
sets the switch to false while retaining immutable manifests and objects.

## Verify changes

```sh
npm test
SKIP_PUBLISHED_CHECK=1 node scripts/build-manifest.mjs
node scripts/check-visual-assets.mjs
```

The last command validates metadata, coverage, every thumbnail archive and emitted search
bounds. It needs hydrated thumbnail shards, or their LFS objects in the local cache.
`scripts/import-visual-snapshot.mjs` is an offline seed importer for a previously validated
label/path snapshot and matching source LFS objects. Its three positional arguments are
label JSONL gzip, path JSONL gzip, and source LFS object directory. It verifies source
hashes and regenerates bounded thumbnails without making model calls.
