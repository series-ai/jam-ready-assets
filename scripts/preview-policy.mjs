import { readFileSync } from 'node:fs';
import { resolve, sep } from 'node:path';

export const PREVIEW_FILE = 'preview.webp';
export const PREVIEW_MAX_BYTES = 100 * 1024;
export const PREVIEW_MAX_DIMENSION = 512;
const HASH = /^[a-f0-9]{64}$/;
// Studio's preview carousel shows the thumbnail plus at most this many gallery images.
export const GALLERY_MAX_IMAGES = 6;
// Gallery images are served as the original file, so keep them light.
export const GALLERY_MAX_BYTES = 1024 * 1024;
const GALLERY_IMAGE = /\.(png|jpe?g|webp|gif)$/i;

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
  if (selection.crop !== undefined) {
    const { left, top, size } = selection.crop ?? {};
    if (
      Object.keys(selection.crop).length !== 3 ||
      ![left, top].every((n) => Number.isInteger(n) && n >= 0) ||
      !Number.isInteger(size) ||
      size <= 0
    ) {
      throw new Error(
        `${id}: crop must be { left, top, size } in source pixels, a square`,
      );
    }
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

/**
 * The recipe tail that names what was cut from the source: the GIF frame and,
 * for a squared thumbnail, the crop square. A changed crop regenerates the image.
 */
export function selectionRecipeSuffix(selection) {
  const crop = selection.crop
    ? `-crop${selection.crop.left}_${selection.crop.top}_${selection.crop.size}`
    : '';
  return `-frame${selection.frame ?? 0}${crop}`;
}

/**
 * The carousel images: pack-relative paths of the pack's own image files, in
 * display order. A creator's sample scene is often not a runtime file, so any
 * pack image qualifies except the licence notice and the thumbnail; the mirror
 * publishes a gallery image the same way it publishes the thumbnail.
 */
export function selectGallery(id, entries, gallery) {
  if (gallery === undefined) return [];
  if (
    !Array.isArray(gallery) ||
    gallery.length === 0 ||
    gallery.length > GALLERY_MAX_IMAGES ||
    new Set(gallery).size !== gallery.length
  ) {
    throw new Error(
      `${id}: gallery must list 1-${GALLERY_MAX_IMAGES} distinct pack file paths`,
    );
  }
  return gallery.map((path) => {
    const entry = entries.find((candidate) => candidate.path === path);
    if (!entry || entry.license || path === PREVIEW_FILE)
      throw new Error(`${id}: gallery image ${path} is not an image file of this pack`);
    if (!GALLERY_IMAGE.test(path))
      throw new Error(`${id}: gallery image ${path} is not a PNG, JPEG, WebP or GIF`);
    if (entry.bytes > GALLERY_MAX_BYTES)
      throw new Error(`${id}: gallery image ${path} is over 1 MiB`);
    return entry.oid;
  });
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
