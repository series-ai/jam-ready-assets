// Lighter variants: optional, additive copies of selected packs whose pictures and sounds are
// smaller, so a game opens faster. Pure logic only; build-light-variants.mjs runs it and
// mirror-to-gcs.mjs publishes the result.
//
// What never changes: the original pack, its `version`, its files, its packs/<id>@<version>/
// URLs, and the v1 manifest. A variant is a second file set for the same pack, at the same
// relative paths (so atlas and model siblings still resolve), with its own content-derived
// version and so its own immutable packs/<id>@<variantVersion>/ prefix. Files the recipe does
// not cover, or that cannot be made smaller safely, point at the original bytes.
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { basename, extname, join } from 'node:path';
import { packVersion } from './pack-version.mjs';
import { PREVIEW_FILE } from './preview-policy.mjs';

export const RECIPE_FILE = 'light-variants.json';
export const VARIANT_NAME = 'light';
export const RECORD_SCHEMA = 1;

const HASH = /^[a-f0-9]{64}$/;
const RECIPE_VERSION = /^[a-z0-9][a-z0-9.-]{0,40}$/;
const IMAGE_TYPES = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg' };
const AUDIO_TYPES = { '.ogg': 'audio/ogg', '.mp3': 'audio/mpeg' };
// Text files that can name an image by file name: atlases, bitmap fonts, tile maps, scenes.
// An image any of them mentions is part of a graph and keeps its original bytes.
const SIDECAR_EXTS = new Set(['.json', '.xml', '.fnt', '.tmx', '.tsx', '.atlas', '.plist', '.tpsheet', '.gltf']);
// A frame grid often lives only in game code, so a picture whose path says sheet, tiles, strip
// or frames is never resized: its cells would stop lining up. Lossless keeps every pixel, so it
// stays eligible for that.
const GRID_NAME = /sheet|tile|atlas|strip|frame|anim|sprites/i;
const DEFAULT_LIMITS = { maxSourceBytes: 50 * 1024 * 1024, maxConversionsPerRun: 400 };

/** Validates the committed recipe. Throws with a message naming the problem. */
export function validateRecipe(recipe) {
  if (!recipe || recipe.schemaVersion !== 1) throw new Error(`${RECIPE_FILE}: schemaVersion must be 1`);
  if (!RECIPE_VERSION.test(recipe.recipeVersion ?? '')) {
    throw new Error(`${RECIPE_FILE}: recipeVersion must be a short lowercase identifier`);
  }
  const helper = recipe.helper ?? {};
  if (helper.sha256 !== null && !HASH.test(helper.sha256 ?? '')) {
    throw new Error(`${RECIPE_FILE}: helper.sha256 must be a SHA-256 or null (conversion off)`);
  }
  const limits = { ...DEFAULT_LIMITS, ...(recipe.limits ?? {}) };
  for (const [key, value] of Object.entries(limits)) {
    if (!Number.isInteger(value) || value <= 0) throw new Error(`${RECIPE_FILE}: limits.${key} must be a positive integer`);
  }
  if (!recipe.packs || typeof recipe.packs !== 'object' || Array.isArray(recipe.packs)) {
    throw new Error(`${RECIPE_FILE}: packs must be an object keyed by pack id`);
  }
  for (const [id, rule] of Object.entries(recipe.packs)) {
    // Models reference their textures by uri and carry UVs and materials tuned to them.
    if (id.split('/')[1] === '3D') throw new Error(`${id}: 3D packs keep their original files`);
    if (!rule || typeof rule !== 'object') throw new Error(`${id}: rule must be an object`);
    if (rule.images === undefined && rule.audio === undefined) throw new Error(`${id}: rule selects no media`);
    if (rule.images !== undefined && !['lossless', 'resize'].includes(rule.images)) {
      throw new Error(`${id}: images must be "lossless" or "resize"`);
    }
    if (rule.images === 'resize' && !(Number.isInteger(rule.maxDimension) && rule.maxDimension >= 64)) {
      throw new Error(`${id}: resize needs an integer maxDimension of at least 64`);
    }
    if (rule.images !== 'resize' && rule.maxDimension !== undefined) throw new Error(`${id}: maxDimension only applies to resize`);
    // Only sounds known not to loop are re-encoded: a loop point or gapless seam is not visible
    // in the file name, so unknown audio keeps its original bytes.
    if (rule.audio !== undefined && rule.audio !== 'non-looping') throw new Error(`${id}: audio must be "non-looping"`);
    if (rule.pixelArt !== undefined && typeof rule.pixelArt !== 'boolean') throw new Error(`${id}: pixelArt must be true or false`);
    if (rule.exclude !== undefined && !(Array.isArray(rule.exclude) && rule.exclude.every((p) => typeof p === 'string' && p))) {
      throw new Error(`${id}: exclude must be a list of relative paths or folder prefixes`);
    }
  }
  return { ...recipe, limits };
}

export function readRecipe(root) {
  return validateRecipe(JSON.parse(readFileSync(join(root, RECIPE_FILE), 'utf8')));
}

/** Cache namespace: one recipe revision run by one pinned helper build. */
export function recipeKey(recipe) {
  if (!recipe.helper?.sha256) return null;
  return `${recipe.recipeVersion}-${recipe.helper.sha256.slice(0, 16)}`;
}

/** Helper options for one file. Part of the cache key, so any change converts again. */
function jobParams(kind, rule) {
  if (kind === 'audio') return { mode: 'audio', nonLooping: true };
  const params = { mode: rule.images, pixelArt: rule.pixelArt === true };
  if (rule.images === 'resize') Object.assign(params, { width: rule.maxDimension, height: rule.maxDimension });
  return params;
}

export function recordName(sourceOid, params, key) {
  const paramsHash = createHash('sha256').update(JSON.stringify({ key, ...params })).digest('hex').slice(0, 16);
  return `${sourceOid}-${paramsHash}`;
}

const excluded = (path, rule) => (rule.exclude ?? []).some((p) => path === p || path.startsWith(p.endsWith('/') ? p : `${p}/`));

/**
 * The files of one pack the recipe may convert. Conservative by design: runtime pictures that
 * no atlas, font or map names, and runtime sounds only when the rule says they do not loop.
 * `readText(path)` returns a sidecar's text, or null when it cannot be read (an LFS pointer, say);
 * an unreadable sidecar makes every picture in the pack ineligible, since any of them could be
 * part of its graph.
 */
export function eligibleFiles(pack, rule, key, limits, readText) {
  if (pack.category === '3d') return [];
  const files = pack.files.filter((f) => f.runtime && !f.license && !excluded(f.path, rule));
  const sidecars = pack.files.filter((f) => SIDECAR_EXTS.has(extname(f.path).toLowerCase()));
  let texts = [];
  if (rule.images) {
    texts = sidecars.map((f) => ({ path: f.path, text: readText(f.path) }));
    if (texts.some((t) => t.text === null)) texts = null;
  }
  const stems = new Set(sidecars.map((f) => f.path.slice(0, -extname(f.path).length).toLowerCase()));
  const out = [];
  for (const file of files) {
    const ext = extname(file.path).toLowerCase();
    let kind = null;
    if (IMAGE_TYPES[ext] && rule.images && texts) {
      const name = basename(file.path).toLowerCase();
      const stem = file.path.slice(0, -ext.length).toLowerCase();
      const referenced = stems.has(stem) || texts.some((t) => t.text.toLowerCase().includes(name));
      const gridded = rule.images === 'resize' && GRID_NAME.test(file.path);
      if (!referenced && !gridded) kind = 'image';
    } else if (AUDIO_TYPES[ext] && rule.audio === 'non-looping') {
      kind = 'audio';
    }
    if (!kind || file.bytes > limits.maxSourceBytes) continue;
    const params = jobParams(kind, rule);
    out.push({ path: file.path, oid: file.oid, bytes: file.bytes, kind, params, record: recordName(file.oid, params, key) });
  }
  return out;
}

/** Width and height from a PNG or JPEG header, or null. */
export function imageSize(buffer) {
  if (buffer.length >= 24 && buffer.readUInt32BE(0) === 0x89504e47 && buffer.toString('latin1', 12, 16) === 'IHDR') {
    return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
  }
  if (buffer.length >= 4 && buffer[0] === 0xff && buffer[1] === 0xd8) {
    let at = 2;
    while (at + 9 < buffer.length) {
      if (buffer[at] !== 0xff) return null;
      const marker = buffer[at + 1];
      if (marker === 0xff) { at += 1; continue; }
      const length = buffer.readUInt16BE(at + 2);
      // SOF0-SOF15 carry the frame size; C4 (DHT), C8 (JPG) and CC (DAC) share the range.
      if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) {
        return { width: buffer.readUInt16BE(at + 7), height: buffer.readUInt16BE(at + 5) };
      }
      at += 2 + length;
    }
  }
  return null;
}

const sha256 = (buffer) => createHash('sha256').update(buffer).digest('hex');
// Helper errors are recorded in a public bucket: keep them short and free of paths or URLs.
const cleanReason = (text) => String(text ?? 'unknown').replace(/\S*[/\\]\S*/g, '…').slice(0, 160);

/**
 * Turns one helper result into an immutable cache record. Anything short of a provably smaller
 * file of the same format, the same pixels' shape and the stated bounds keeps the original.
 * `output` is the helper's written file (null when it reported no change).
 */
export function makeRecord(file, source, result, output) {
  const ext = extname(file.path).toLowerCase();
  const record = { schemaVersion: RECORD_SCHEMA, sourceOid: file.oid, sourceBytes: source.length, params: file.params };
  const sourceSize = file.kind === 'image' ? imageSize(source) : null;
  if (sourceSize) Object.assign(record, { sourceWidth: sourceSize.width, sourceHeight: sourceSize.height });
  if (typeof result?.recipeVersion === 'string') record.helperRecipeVersion = result.recipeVersion.slice(0, 120);
  const keep = (status, reason) => ({ ...record, status, ...(reason ? { reason } : {}) });
  if (!result || result.ok !== true) return keep('failed', cleanReason(result?.error));
  if (result.sourceSha256 !== file.oid) return keep('failed', 'source digest mismatch');
  if (!result.changed) return keep('unchanged', result.reason ? cleanReason(result.reason) : undefined);
  if (!output) return keep('failed', 'changed without output');
  if (sha256(output) !== result.sha256 || output.length !== result.bytes) return keep('failed', 'output digest mismatch');
  if (output.length >= source.length) return keep('unchanged', 'not smaller');
  // Same relative path, so the format cannot change under it.
  if (result.mimeType !== (IMAGE_TYPES[ext] ?? AUDIO_TYPES[ext])) return keep('failed', 'format changed');
  const changed = { ...record, status: 'changed', oid: result.sha256, bytes: output.length };
  if (file.kind !== 'image') return changed;
  const size = imageSize(output);
  if (!size || !sourceSize) return keep('failed', 'unreadable image size');
  if (file.params.mode === 'lossless') {
    if (size.width !== sourceSize.width || size.height !== sourceSize.height) return keep('failed', 'lossless changed size');
  } else {
    const { width: sw, height: sh } = sourceSize;
    const fits = size.width <= file.params.width && size.height <= file.params.height && size.width <= sw && size.height <= sh;
    // Aspect ratio may drift by rounding only (one pixel on the long side).
    const aspect = Math.abs(size.width * sh - size.height * sw) <= Math.max(sw, sh);
    if (!fits || !aspect) return keep('failed', 'resize out of bounds');
  }
  return { ...changed, width: size.width, height: size.height };
}

/** A pack's lighter variant, or null when a result is still missing or nothing got smaller. */
export function buildVariant({ packManifest, eligible, records, key, commit, encodedId }) {
  const byPath = new Map();
  for (const file of eligible) {
    const record = records.get(file.record);
    if (!record) return null; // advertise whole packs only, so a variant never churns mid-backfill
    byPath.set(file.path, record);
  }
  let changedCount = 0;
  const files = packManifest.files.map((entry) => {
    const record = byPath.get(entry.path);
    if (!record) return entry;
    const dims = record.status === 'changed' && record.width
      ? { width: record.width, height: record.height }
      : record.sourceWidth ? { width: record.sourceWidth, height: record.sourceHeight } : {};
    if (record.status !== 'changed') return { ...entry, ...dims };
    changedCount += 1;
    const { lfs, ...rest } = entry;
    return { ...rest, bytes: record.bytes, oid: record.oid, ...dims, sourceOid: entry.oid, sourceBytes: entry.bytes };
  });
  if (changedCount === 0) return null;
  const version = packVersion(files);
  const manifestPath = `manifest/v2/commits/${commit}/variants/${VARIANT_NAME}/${encodedId}.json`;
  return {
    manifestPath,
    manifest: {
      id: packManifest.id, commit, variant: VARIANT_NAME, version,
      originalVersion: packManifest.version, recipeVersion: key, files,
    },
    descriptor: {
      version,
      recipeVersion: key,
      totalBytes: files.filter((f) => f.path !== PREVIEW_FILE).reduce((sum, f) => sum + f.bytes, 0),
      runtimeFileCount: files.filter((f) => f.runtime).length,
      manifestPath,
    },
  };
}

/** Commit-pinned page showing a pack's original files. Public, immutable, and browsable. */
export function originalArtworkUrl(repoUrl, commit, id) {
  if (!/^https:\/\/[^\s]+$/.test(repoUrl) || !/^[0-9a-f]{7,40}$/.test(commit)) return null;
  return `${repoUrl.replace(/\/$/, '')}/tree/${commit}/${id.split('/').map(encodeURIComponent).join('/')}`;
}

/** Summary fields for a pack with a variant. Purely additive to the v2 pack summary. */
export function withVariant(summary, descriptor, originalUrl) {
  const variantsVersion = createHash('sha256')
    .update(JSON.stringify({ [VARIANT_NAME]: descriptor.version })).digest('hex').slice(0, 12);
  return {
    ...summary,
    variantsVersion,
    variants: { [VARIANT_NAME]: descriptor, ...(originalUrl ? { originalUrl } : {}) },
  };
}

export function withoutVariants({ variants, variantsVersion, ...summary }) {
  return summary;
}

/**
 * Path-addressed copies for every advertised variant whose objects are all in the bucket.
 * A variant with anything missing is dropped, and that pack keeps advertising its original.
 */
export function variantMirrorPlan(index, variantManifests, hasObject) {
  const byId = new Map(variantManifests.map((m) => [m.id, m]));
  const copies = [];
  const dropped = [];
  for (const summary of index.packs) {
    const light = summary.variants?.[VARIANT_NAME];
    if (!light) continue;
    const manifest = byId.get(summary.id);
    const mirrored = manifest?.version === light.version ? manifest.files.filter((f) => f.runtime || f.license) : null;
    if (!mirrored || !mirrored.every((f) => hasObject(f.oid))) {
      dropped.push(summary.id);
      continue;
    }
    for (const f of mirrored) copies.push([`packs/${summary.id}@${light.version}/${f.path}`, f.oid]);
  }
  return { copies, dropped };
}

export const encodePackId = (id) => id.replaceAll('/', '--');
export const contentTypeOf = (path) => IMAGE_TYPES[extname(path).toLowerCase()] ?? AUDIO_TYPES[extname(path).toLowerCase()];
