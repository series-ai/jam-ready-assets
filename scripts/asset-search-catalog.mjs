import { mkdirSync, writeFileSync } from 'node:fs';
import { join, extname, dirname, basename } from 'node:path';
import { pathWords } from './pack-keywords.mjs';
import { currentLabel, metadataRevision, sha256 } from './visual-metadata.mjs';

export function singularForms(word) {
  if (word.length <= 3) return [word];
  if (word.endsWith('ies') && word.length > 4) return [`${word.slice(0, -3)}y`, word.slice(0, -1)];
  if (/(x|ch|sh|ss)es$/.test(word)) return [word.slice(0, -2)];
  if (/(ss|us|is)$/.test(word)) return [word];
  if (word.endsWith('s')) return [word.slice(0, -1)];
  return [word];
}
export function visualWords(label) {
  return label && label.status === 'tagged' && label.confidence !== 'none'
    ? [...new Set(label.keywords.flatMap((phrase) => phrase.toLowerCase().split(/[^a-z]+/)).filter((word) => word.length >= 3 && word.length <= 70))] : [];
}
export function appendVisualKeywords(original, rows) {
  const existing = new Set(original);
  const counts = new Map();
  for (const row of rows) for (const word of visualWords(row)) if (!existing.has(word)) counts.set(word, (counts.get(word) ?? 0) + 1);
  return [...original, ...[...counts].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, 40).map(([word]) => word)];
}
// These are action words, not substrings: "rune", "white" and "dice" are ordinary assets.
const ANIMATION_ACTIONS = new Set([
  'idle', 'run', 'running', 'walk', 'walking', 'jump', 'jumping', 'attack', 'attacking',
  'death', 'dead', 'dying', 'hurt', 'hit', 'climb', 'climbing', 'swim', 'swimming',
  'fall', 'falling', 'shoot', 'shooting', 'explode', 'explosion', 'explosions',
  'destroy', 'destroyed', 'disappear', 'appearing', 'appear', 'swing', 'dash', 'roll',
  'blink', 'blinking', 'bounce', 'bouncing', 'spin', 'spinning', 'turn', 'turning',
]);
const GROUP_WORDS = new Set(['font', 'fonts', 'anim', 'anims', 'animation', 'animations',
  'animated', 'frame', 'frames', 'sequence', 'sequences']);
const IMAGE_FILE = /\.(png|jpe?g|svg|gif|webp)$/i;
function tokens(path) {
  return path.replace(/([a-z])([A-Z])/g, '$1 $2').toLowerCase().split(/[^a-z]+/);
}
function numberedKey(path) {
  // Match frame1, frame_01, frame (1), frame[1], and a directory of 1.png, 2.png.
  return path.replace(/[ _-]?[([]?\d+[)\]]?(?=\.[^.]+$)/, '#');
}
export function dependencyEvidence(files) {
  const descriptorDirs = new Set(files.filter((f) => /\.(json|xml|fnt|atlas|plist|tmx|tsx|css|tres|anim|frames)$/i.test(f.path)).map((f) => dirname(f.path)));
  const numbered = new Map();
  for (const file of files) {
    if (!IMAGE_FILE.test(file.path)) continue;
    const key = numberedKey(file.path);
    if (key !== file.path) numbered.set(key, (numbered.get(key) ?? 0) + 1);
  }
  return { descriptorDirs, numbered };
}
export function selectionReason(pack, file, label, evidence) {
  if (!label || label.status !== 'tagged' || label.confidence === 'none') return 'Visual description pending';
  if (!['2d', 'ui'].includes(pack.category)) return 'Available with pack';
  if (!/\.(png|jpe?g|svg)$/i.test(file.path) || label.frameCount !== 1 || label.pageCount !== 1) return 'Animation available with pack';
  if (tokens(`${pack.id}/${file.path}`).some((word) => GROUP_WORDS.has(word))) return 'Related files available with pack';
  // A descriptor may name images in child directories. Refuse the entire subtree.
  if ([...evidence.descriptorDirs].some((dir) => dir === '.' || file.path.startsWith(`${dir}/`))) return 'Companion metadata available with pack';
  if ((evidence.numbered.get(numberedKey(file.path)) ?? 0) > 1 && tokens(file.path).some((word) => ANIMATION_ACTIONS.has(word))) return 'Frame sequence available with pack';
  return null;
}
function writeJson(path, value, max = Infinity) {
  const json = JSON.stringify(value);
  if (Buffer.byteLength(json) > max) throw new Error(`Asset search file exceeds ${max} bytes: ${basename(path)}`);
  mkdirSync(dirname(path), { recursive: true }); writeFileSync(path, json);
  return Buffer.byteLength(json);
}
export function buildAssetSearch(root, commit, packs, metadata) {
  if (!metadata.config) return null;
  const revision = metadataRevision(metadata);
  const output = join(root, 'manifest/v2/commits', commit, 'assets');
  const items = [], words = new Map();
  const coverage = { runtimeImages: 0, labeledImages: 0, thumbnailImages: 0, staleBindings: 0, selectableImages: 0, filenameFallbackImages: 0 };
  for (const { summary: pack, files } of packs) {
    const evidence = dependencyEvidence(files);
    for (const file of files) {
      if (!file.runtime || !/\.(png|jpe?g|svg|gif|webp)$/i.test(file.path)) continue;
      coverage.runtimeImages++;
      const binding = metadata.bindings.get(`${pack.id}/${file.path}`);
      if (binding && binding.oid !== file.oid) coverage.staleBindings++;
      const label = currentLabel(metadata, pack.id, file);
      const thumbnail = metadata.thumbnails[file.oid];
      if (label) coverage.labeledImages++;
      if (thumbnail) coverage.thumbnailImages++;
      if (!thumbnail) { coverage.filenameFallbackImages++; continue; }
      const id = sha256(`${pack.id}\0${file.path}`);
      const reason = selectionReason(pack, file, label, evidence);
      if (!reason) coverage.selectableImages++;
      if (!label || label.confidence === 'none') coverage.filenameFallbackImages++;
      const item = {
        id, ordinal: 0, packId: pack.id, path: file.path, oid: file.oid, bytes: file.bytes,
        description: label?.description || basename(file.path), keywords: (label?.keywords ?? pathWords(file.path)).slice(0, 12),
        kind: label?.kind ?? 'image', style: label?.style ?? 'unknown', perspective: label?.perspective ?? 'unknown',
        width: label?.dimensions[0] ?? thumbnail.width, height: label?.dimensions[1] ?? thumbnail.height,
        thumbnailOid: thumbnail.oid, selectable: reason === null, ...(reason ? { selectionReason: reason } : {}),
      };
      if (item.path.length > 1024 || item.description.length > 300 || item.keywords.some((k) => k.length > 70)) throw new Error('Asset search item exceeds field bounds');
      items.push(item);
      words.set(id, [...new Set([...pathWords(file.path), ...visualWords(label)].flatMap((word) => [word, ...singularForms(word)]))]);
    }
  }
  items.sort((a, b) => a.id.localeCompare(b.id));
  items.forEach((item, ordinal) => { item.ordinal = ordinal; });
  const packIds = packs.map(({ summary }) => summary.id).sort();
  if (packIds.length > 65536) throw new Error('Asset search pack table exceeds uint16');
  const packIndex = new Map(packIds.map((id, index) => [id, index]));
  const descriptor = { schemaVersion: 1, catalogCommit: commit, metadataRevision: revision, assetCount: items.length, pageSize: 16, enabled: metadata.config.enabled, packIds, membershipShards: Math.ceil(items.length / 32768) };
  const membership = [];
  for (let start = 0; start < items.length; start += 32768) {
    const slice = items.slice(start, start + 32768), bytes = Buffer.alloc(slice.length * 2);
    slice.forEach((item, i) => bytes.writeUInt16LE(packIndex.get(item.packId), i * 2));
    membership.push({ start, packs: bytes.toString('base64') });
  }
  const boundedBytes = Buffer.byteLength(JSON.stringify(descriptor)) + membership.reduce((sum, shard) => sum + Buffer.byteLength(JSON.stringify(shard)), 0);
  if (boundedBytes > 512 * 1024) {
    descriptor.enabled = false;
    writeJson(join(output, 'index.json'), descriptor);
    writeJson(join(output, 'coverage.json'), { ...coverage, disabledReason: 'Membership data exceeds the supported catalog size' });
    console.warn('Asset search disabled: membership data exceeds 512 KiB');
    return { schemaVersion: 1, metadataRevision: revision, enabled: false };
  }
  membership.forEach((shard, i) => writeJson(join(output, `membership/${i}.json`), shard, 96 * 1024));
  const termIds = new Map(), byPack = new Map();
  for (const item of items) {
    if (!byPack.has(item.packId)) byPack.set(item.packId, []);
    byPack.get(item.packId).push(item);
    for (const word of words.get(item.id)) {
      if (!/^[a-z]{3,70}$/.test(word)) continue;
      if (!termIds.has(word)) termIds.set(word, []);
      termIds.get(word).push(item.ordinal);
    }
  }
  for (let start = 0; start < items.length; start += 16) writeJson(join(output, `pages/${start / 16}.json`), { catalogCommit: commit, metadataRevision: revision, page: start / 16, items: items.slice(start, start + 16) }, 64 * 1024);
  for (const [packId, packItems] of byPack) writeJson(join(output, `packs/${packId.replaceAll('/', '--')}.json`), { catalogCommit: commit, metadataRevision: revision, entries: packItems.map(({ id, ordinal }) => ({ id, ordinal })) });
  for (const [word, ids] of termIds) {
    const bits = Buffer.alloc(Math.ceil(items.length / 8));
    ids.forEach((id) => { bits[id >> 3] |= 1 << (id & 7); });
    const sparse = { ids }, dense = { bits: bits.toString('base64') };
    writeJson(join(output, `terms/${word}.json`), JSON.stringify(sparse).length <= JSON.stringify(dense).length ? sparse : dense, 256 * 1024);
  }
  writeJson(join(output, 'coverage.json'), coverage);
  writeJson(join(output, 'index.json'), descriptor, 512 * 1024);
  console.log(`asset search: ${items.length} images, ${coverage.selectableImages} selectable, ${termIds.size} terms, ${boundedBytes} membership bytes`);
  return { schemaVersion: 1, metadataRevision: revision, enabled: descriptor.enabled };
}
