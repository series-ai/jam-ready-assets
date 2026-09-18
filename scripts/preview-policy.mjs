import { readFileSync } from 'node:fs';
import { resolve, sep } from 'node:path';

export const PREVIEW_FILE = 'preview.webp';
export const PREVIEW_MAX_BYTES = 100 * 1024;
export const PREVIEW_MAX_DIMENSION = 512;
const HASH = /^[a-f0-9]{64}$/;

export function localSourcePath(root, path) {
  if (typeof path !== 'string' || !path || path.includes('\\'))
    throw new Error('Invalid preview source path');
  const absolute = resolve(root, path);
  if (!absolute.startsWith(resolve(root) + sep))
    throw new Error('Preview source must stay inside the repository');
  return absolute;
}

export function readPreviewSources(root) {
  const config = JSON.parse(
    readFileSync(resolve(root, 'preview-sources.json'), 'utf8'),
  );
  if (
    config.schemaVersion !== 1 ||
    !config.packs ||
    Array.isArray(config.packs)
  ) {
    throw new Error('Invalid preview-sources.json');
  }
  return config;
}

export function validateSelection(id, selection, category) {
  if (!selection || typeof selection !== 'object')
    throw new Error(`${id}: missing explicit preview selection`);
  if (selection.kind === 'none') {
    if (category !== 'audio' || !selection.reason)
      throw new Error(`${id}: only audio may omit artwork, with a reason`);
    return;
  }
  if (
    selection.frame !== undefined &&
    (!Number.isInteger(selection.frame) || selection.frame < 0)
  ) {
    throw new Error(`${id}: frame must be a non-negative integer`);
  }
  if (
    !['original', 'derived'].includes(selection.kind) ||
    !selection.sourcePath ||
    !HASH.test(selection.sourceSha256) ||
    !selection.licenseEvidence ||
    !selection.description ||
    !/^https:\/\//.test(selection.sourceUrl)
  ) {
    throw new Error(
      `${id}: preview needs source path, SHA-256, URL, description and licence evidence`,
    );
  }
}

/** Select only the reviewed derivative. Never guess from a texture or sprite filename. */
export function selectPreview(id, category, entries, selection) {
  validateSelection(id, selection, category);
  const preview = entries.find((entry) => entry.path === PREVIEW_FILE);
  if (selection.kind === 'none') {
    if (preview)
      throw new Error(`${id}: no-art selection has an unexpected preview file`);
    return null;
  }
  if (
    !preview ||
    !HASH.test(selection.outputSha256) ||
    preview.oid !== selection.outputSha256 ||
    preview.bytes <= 0 ||
    preview.bytes > PREVIEW_MAX_BYTES ||
    preview.runtime
  ) {
    throw new Error(
      `${id}: missing, stale or oversized preview.webp; run npm run previews:generate`,
    );
  }
  return preview;
}
