import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import sharp from 'sharp';
import {
  localSourcePath,
  readPreviewSources,
  selectionRecipeSuffix,
  selectPreview,
  PREVIEW_FILE,
  PREVIEW_MAX_DIMENSION,
} from './preview-policy.mjs';

const root = process.cwd();
let count = 0;
let bytes = 0;
const notSquare = [];
for (const [id, selection] of Object.entries(readPreviewSources(root).packs)) {
  const category = id.split('/')[1] === 'audio' ? 'audio' : 'visual';
  if (selection.kind === 'none') {
    selectPreview(id, category, [], selection);
    continue;
  }
  const input = readFileSync(localSourcePath(root, `${id}/${PREVIEW_FILE}`));
  const oid = createHash('sha256').update(input).digest('hex');
  selectPreview(
    id,
    category,
    [{ path: PREVIEW_FILE, oid, bytes: input.length, runtime: false }],
    selection,
  );
  const metadata = await sharp(input).metadata();
  if (
    metadata.format !== 'webp' ||
    (metadata.pages ?? 1) !== 1 ||
    !metadata.width ||
    !metadata.height ||
    Math.max(metadata.width, metadata.height) > PREVIEW_MAX_DIMENSION ||
    selection.width !== metadata.width ||
    selection.height !== metadata.height ||
    selection.bytes !== input.length ||
    selection.outputSourceSha256 !== selection.sourceSha256 ||
    !selection.recipe?.endsWith(selectionRecipeSuffix(selection))
  )
    throw new Error(`${id}: invalid derivative metadata`);
  // Metadata alone does not detect truncated image data.
  await sharp(input).raw().toBuffer();
  count++;
  bytes += input.length;
  if (metadata.width !== metadata.height) notSquare.push(id);
}
console.log(
  `Validated ${count} static WebP previews, ${bytes} bytes total (${(bytes / count / 1024).toFixed(1)} KiB average).`,
);
// Advisory: Studio letterboxes a non-square thumbnail, so it still works, but
// a square one fills the card. See "Square thumbnails" in scripts/PREVIEWS.md.
if (notSquare.length > 0)
  console.log(
    `${notSquare.length} of ${count} previews are not square yet; add a crop to square them.`,
  );
