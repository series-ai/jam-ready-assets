import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import sharp from 'sharp';
import {
  localSourcePath,
  readPreviewSources,
  selectPreview,
  PREVIEW_FILE,
  PREVIEW_MAX_DIMENSION,
} from './preview-policy.mjs';

const root = process.cwd();
let count = 0;
let bytes = 0;
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
    !selection.recipe?.endsWith(`-frame${selection.frame ?? 0}`)
  )
    throw new Error(`${id}: invalid derivative metadata`);
  // Metadata alone does not detect truncated image data.
  await sharp(input).raw().toBuffer();
  count++;
  bytes += input.length;
}
console.log(
  `Validated ${count} static WebP previews, ${bytes} bytes total (${(bytes / count / 1024).toFixed(1)} KiB average).`,
);
