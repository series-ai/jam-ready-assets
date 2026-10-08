// Content-addressed visual labels are independent of original pack bytes.
import { readFileSync, readdirSync, existsSync, mkdirSync, writeFileSync, renameSync } from 'node:fs';
import { join } from 'node:path';
import { gunzipSync, gzipSync } from 'node:zlib';
import { createHash } from 'node:crypto';

export const HASH = /^[a-f0-9]{64}$/;
export const CURRENT_IDENTITY = Object.freeze({ model: 'gpt-6-astra', promptRevision: 'asset-visual-v3', preprocessingRevision: 'source-static-v1', schemaRevision: 1 });
export const HISTORICAL_PROMPTS = ['astra-visual-v2', 'astra-visual-v2-audit-v1', 'astra-visual-v2-schema-fix-v1', 'astra-visual-v2-missing-cell-recovery-1', 'astra-visual-v2-schema-structured-v1'];
export const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex');
const fail = (message) => { throw new Error(`Visual metadata: ${message}`); };
const text = (value, max, field) => {
  if (typeof value !== 'string' || value.length > max || /[\u0000-\u001f\u007f]/.test(value)) fail(`invalid ${field}`);
};
export function validIdentity(identity) {
  if (identity?.model === 'alpha-channel-check' && identity.promptRevision === 'empty-image-v1' && ['audited-source-views-v2', 'source-static-v1'].includes(identity.preprocessingRevision) && identity.schemaRevision === 1) return true;
  return identity && identity.model === 'gpt-6-astra' && identity.schemaRevision === 1 &&
    ((identity.promptRevision === CURRENT_IDENTITY.promptRevision && identity.preprocessingRevision === CURRENT_IDENTITY.preprocessingRevision) ||
    (HISTORICAL_PROMPTS.includes(identity.promptRevision) && identity.preprocessingRevision === 'audited-source-views-v2'));
}
export function validateLabel(row) {
  if (!row || !HASH.test(row.oid)) fail('invalid source hash');
  const fields = new Set(['oid', 'status', 'description', 'keywords', 'kind', 'style', 'perspective', 'confidence', 'dimensions', 'frameCount', 'pageCount', 'evidenceRevision', 'generationIdentity']);
  if (Object.keys(row).some((key) => !fields.has(key))) fail('unexpected label field');
  if (!validIdentity(row.generationIdentity)) fail('unapproved generation identity');
  text(row.description, 300, 'description');
  for (const field of ['kind', 'style', 'perspective', 'evidenceRevision']) text(row[field], 100, field);
  if (!['high', 'medium', 'low', 'none'].includes(row.confidence)) fail('invalid confidence');
  if (!['tagged', 'empty'].includes(row.status)) fail('invalid status');
  if (!Array.isArray(row.keywords) || row.keywords.length > 256) fail('invalid keywords');
  for (const word of row.keywords) text(word, 70, 'keyword');
  if (new Set(row.keywords).size !== row.keywords.length) fail('duplicate keyword');
  if (!Array.isArray(row.dimensions) || row.dimensions.length !== 2 || row.dimensions.some((n) => !Number.isSafeInteger(n) || n < 1 || n > 100000)) fail('invalid dimensions');
  for (const field of ['frameCount', 'pageCount']) if (!Number.isSafeInteger(row[field]) || row[field] < 1 || row[field] > 100000) fail(`invalid ${field}`);
  return row;
}
export function cacheEligible(row, oid, invalidations = {}, identity = CURRENT_IDENTITY) {
  if (!row || row.oid !== oid || !validIdentity(row.generationIdentity)) return false;
  // Explicit per-hash overrides invalidate only the named content. Historical audited
  // identities are accepted until a targeted correction requires the current identity.
  const expected = invalidations[oid];
  if (!expected) return true;
  return Object.entries(expected === true ? identity : expected).every(([key, value]) => row.generationIdentity[key] === value);
}
export function validateBinding(row) {
  if (!HASH.test(row.oid) || typeof row.packId !== 'string' || typeof row.path !== 'string' || !row.path.startsWith(`${row.packId}/`) || row.path.length > 1400 || /[\u0000-\u001f\\]/.test(row.path) || row.path.split('/').some((x) => !x || x === '.' || x === '..') || !['runtime', 'source', 'preview'].includes(row.role)) fail('invalid path binding');
  return row;
}
export function readJsonLines(path) {
  return gunzipSync(readFileSync(path), { maxOutputLength: 128 * 1024 * 1024 }).toString('utf8').trim().split('\n').filter(Boolean).map((line) => JSON.parse(line));
}
export function writeJsonLines(path, rows) {
  mkdirSync(join(path, '..'), { recursive: true });
  const tmp = `${path}.tmp`;
  writeFileSync(tmp, gzipSync(`${rows.map((r) => JSON.stringify(r)).join('\n')}\n`, { level: 9, mtime: 0 }));
  renameSync(tmp, path);
}
export function readVisualMetadata(root) {
  const dir = join(root, 'metadata');
  if (!existsSync(join(dir, 'visual.json'))) return { labels: new Map(), bindings: new Map(), thumbnails: {}, config: null };
  const config = JSON.parse(readFileSync(join(dir, 'visual.json'), 'utf8'));
  if (config.schemaVersion !== 1 || typeof config.enabled !== 'boolean' || !config.invalidations || typeof config.invalidations !== 'object' || Array.isArray(config.invalidations)) fail('invalid configuration');
  for (const [oid, expected] of Object.entries(config.invalidations)) {
    if (!HASH.test(oid) || (expected !== true && (!expected || typeof expected !== 'object' || Array.isArray(expected) || !Object.keys(expected).length || Object.entries(expected).some(([key, value]) => CURRENT_IDENTITY[key] !== value)))) fail('unsupported targeted invalidation');
  }
  const labels = new Map();
  for (const name of readdirSync(join(dir, 'labels')).sort()) {
    if (!/^[a-f0-9]{2}\.jsonl\.gz$/.test(name)) fail('invalid label shard');
    for (const row of readJsonLines(join(dir, 'labels', name))) {
      validateLabel(row);
      if (!row.oid.startsWith(name.slice(0, 2)) || labels.has(row.oid)) fail('duplicate or misplaced source hash');
      labels.set(row.oid, row);
    }
  }
  const bindings = new Map();
  for (const row of readJsonLines(join(dir, 'paths.jsonl.gz'))) {
    validateBinding(row);
    if (bindings.has(row.path)) fail('duplicate path binding');
    bindings.set(row.path, row);
  }
  const thumbnails = JSON.parse(readFileSync(join(dir, 'thumbnails.json'), 'utf8'));
  for (const [oid, thumbnail] of Object.entries(thumbnails)) {
    if (!HASH.test(oid) || !HASH.test(thumbnail.oid) || !Number.isInteger(thumbnail.bytes) || thumbnail.bytes < 1 || thumbnail.bytes > 40960 || ![thumbnail.width, thumbnail.height].every((n) => Number.isInteger(n) && n > 0 && n <= 256)) fail('invalid thumbnail');
  }
  return { labels, bindings, thumbnails, config };
}
export function metadataRevision(metadata) {
  return sha256(JSON.stringify([metadata.config, [...metadata.labels.values()], [...metadata.bindings.values()], metadata.thumbnails]));
}
export function currentLabel(metadata, packId, file) {
  const binding = metadata.bindings.get(`${packId}/${file.path}`);
  if (!binding || binding.oid !== file.oid || binding.role !== 'runtime' || !file.runtime) return null;
  const row = metadata.labels.get(file.oid);
  if (!cacheEligible(row, file.oid, metadata.config?.invalidations)) return null;
  return row;
}
