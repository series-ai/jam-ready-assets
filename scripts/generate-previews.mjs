// Explicit offline maintenance command. Normal publishing only validates committed derivatives.
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';
import {
  localSourcePath,
  readPreviewSources,
  validateSelection,
  PREVIEW_FILE,
  PREVIEW_MAX_BYTES,
  PREVIEW_MAX_DIMENSION,
} from './preview-policy.mjs';

const root = process.cwd();
const config = readPreviewSources(root);
const sha = (bytes) => createHash('sha256').update(bytes).digest('hex');
const recipe = `sharp-${sharp.versions.sharp}-webp-${sharp.versions.webp}-512-fit-inside-q85-75-65-v1`;
let generated = 0;
for (const [id, entry] of Object.entries(config.packs)) {
  validateSelection(
    id,
    entry,
    id.split('/')[1] === 'audio' ? 'audio' : 'visual',
  );
  if (entry.kind === 'none') continue;
  const output = localSourcePath(root, `${id}/${PREVIEW_FILE}`);
  const entryRecipe = `${recipe}-frame${entry.frame ?? 0}`;
  if (
    entry.recipe === entryRecipe &&
    entry.outputSourceSha256 === entry.sourceSha256 &&
    existsSync(output) &&
    sha(readFileSync(output)) === entry.outputSha256
  )
    continue;
  const input = readFileSync(localSourcePath(root, entry.sourcePath));
  if (sha(input) !== entry.sourceSha256) {
    throw new Error(
      `${id}: source hash mismatch (hydrate the selected LFS source or fetch the pinned original)`,
    );
  }
  let result;
  for (const quality of [85, 75, 65]) {
    result = await sharp(input, {
      page: entry.frame ?? 0,
      pages: 1,
      limitInputPixels: 100_000_000,
    })
      .rotate()
      .resize(PREVIEW_MAX_DIMENSION, PREVIEW_MAX_DIMENSION, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({ quality, effort: 6 })
      .toBuffer({ resolveWithObject: true });
    if (result.data.length <= PREVIEW_MAX_BYTES) break;
  }
  if (result.data.length > PREVIEW_MAX_BYTES)
    throw new Error(`${id}: preview exceeds 100 KiB; choose a better original`);
  writeFileSync(output, result.data);
  Object.assign(entry, {
    outputSha256: sha(result.data),
    outputSourceSha256: entry.sourceSha256,
    width: result.info.width,
    height: result.info.height,
    bytes: result.data.length,
    recipe: entryRecipe,
  });
  generated++;
}
writeFileSync(
  join(root, 'preview-sources.json'),
  JSON.stringify(config, null, 2) + '\n',
);
console.log(`Generated ${generated} previews; unchanged sources reused.`);
