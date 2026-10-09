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
const ANIMATION_DIRS = ['anim', 'anims', 'animation', 'animations', 'animated', 'frame', 'frames', 'sequence', 'sequences'];
const GROUP_WORDS = new Set(['font', 'fonts', ...ANIMATION_DIRS]);
const ANIMATION_WORDS = new Set([...ANIMATION_ACTIONS, ...ANIMATION_DIRS]);
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
const underDescriptor = (file, evidence) => [...evidence.descriptorDirs].some((dir) => dir === '.' || file.path.startsWith(`${dir}/`));
export function selectionReason(pack, file, label, evidence) {
  if (!label || label.status !== 'tagged' || label.confidence === 'none') return 'Visual description pending';
  if (!['2d', 'ui'].includes(pack.category)) return 'Available with pack';
  if (!/\.(png|jpe?g|svg)$/i.test(file.path) || label.frameCount !== 1 || label.pageCount !== 1) return 'Animation available with pack';
  if (tokens(`${pack.id}/${file.path}`).some((word) => GROUP_WORDS.has(word))) return 'Related files available with pack';
  // A descriptor may name images in child directories. Refuse the entire subtree.
  if (underDescriptor(file, evidence)) return 'Companion metadata available with pack';
  if ((evidence.numbered.get(numberedKey(file.path)) ?? 0) > 1 && tokens(file.path).some((word) => ANIMATION_ACTIONS.has(word))) return 'Frame sequence available with pack';
  return null;
}

// Previews only. A sheet's grid comes from its shape, so only single-row or single-column
// strips of square frames qualify; anything else keeps a static thumbnail.
const MAX_PREVIEW_FRAMES = 32;
// Every frame of a selectable sequence is listed on its first frame, so the caps bound page size:
// a lead adds at most about 3.3 KB (32 thumbnail hashes plus 16 ids) to a 64 KiB page of 16 items.
const MAX_SELECTABLE_FRAMES = 16;
const SEQUENCE_REASONS = new Set(['Frame sequence available with pack', 'Related files available with pack']);
const hasAnimationWord = (path) => tokens(path).some((word) => ANIMATION_WORDS.has(word));
function stripFrames([width, height]) {
  const frames = Math.max(width, height) / Math.min(width, height);
  return Number.isInteger(frames) && frames >= 2 && frames <= MAX_PREVIEW_FRAMES ? frames : 0;
}
function frameNumber(path) {
  return Number(path.match(/(\d+)[)\]]?(?=\.[^.]+$)/)[1]);
}
const tagged = (label) => !!label && label.status === 'tagged' && label.confidence !== 'none';
// Numbered frames of one clip become a single catalog entry led by the first frame; the other
// frames stay in the catalog for import but are left out of search.
export function sequenceGroups(pack, files, labelFor, thumbnails, evidence) {
  const candidates = new Map();
  for (const file of files) {
    if (!file.runtime || !/\.(png|jpe?g|svg|webp)$/i.test(file.path) || !hasAnimationWord(file.path)) continue;
    const key = numberedKey(file.path);
    if (key === file.path) continue;
    candidates.set(key, [...(candidates.get(key) ?? []), file]);
  }
  const groups = new Map();
  for (const members of candidates.values()) {
    if (members.length < 2 || members.length > MAX_PREVIEW_FRAMES) continue;
    const labels = members.map(labelFor);
    const [width, height] = labels[0]?.dimensions ?? [];
    // Same-size numbered files are frames even when each is wide or tall, unless each is labelled a sheet.
    if (labels.some((label) => !tagged(label) || label.frameCount !== 1 || label.kind === 'sheet' || label.dimensions[0] !== width || label.dimensions[1] !== height)) continue;
    if (members.some((file) => !thumbnails[file.oid])) continue;
    members.sort((a, b) => frameNumber(a.path) - frameNumber(b.path) || a.path.localeCompare(b.path));
    if (new Set(members.map((file) => frameNumber(file.path))).size !== members.length) continue;
    const selectable = members.length <= MAX_SELECTABLE_FRAMES && ['2d', 'ui'].includes(pack.category) &&
      !tokens(`${pack.id}/${members[0].path}`).some((word) => word === 'font' || word === 'fonts') &&
      members.every((file, i) => /\.(png|jpe?g|svg)$/i.test(file.path) && !underDescriptor(file, evidence) &&
        SEQUENCE_REASONS.has(selectionReason(pack, file, labels[i], evidence)));
    const group = { members, selectable };
    for (const file of members) groups.set(file.path, group);
  }
  return groups;
}
export function assetAnimation(pack, file, label, groups, thumbnails, evidence) {
  const group = groups.get(file.path);
  if (group) {
    if (group.members[0] !== file) return null;
    return {
      type: 'sequence', frames: group.members.length,
      frameThumbnailOids: group.members.map((member) => thumbnails[member.oid].oid),
      ...(group.selectable ? { frameIds: group.members.map((member) => sha256(`${pack.id}\0${member.path}`)) } : {}),
    };
  }
  if (!tagged(label)) return null;
  if (label.frameCount > 1) return /\.(gif|webp|png)$/i.test(file.path) ? { type: 'animated', frames: label.frameCount } : null;
  if (!/\.png$/i.test(file.path) || !hasAnimationWord(file.path)) return null;
  // A numbered file that did not group is a sheet only when it was labelled one.
  if ((evidence.numbered.get(numberedKey(file.path)) ?? 0) > 1 && label.kind !== 'sheet') return null;
  const frames = stripFrames(label.dimensions);
  if (!frames) return null;
  const horizontal = label.dimensions[0] > label.dimensions[1];
  return { type: 'sheet', frames, columns: horizontal ? frames : 1, rows: horizontal ? 1 : frames };
}
export function expectedSelectionReason(pack, file, label, evidence, groups) {
  const group = groups.get(file.path);
  return group?.selectable && group.members[0] === file ? null : selectionReason(pack, file, label, evidence);
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
    const groups = sequenceGroups(pack, files, (file) => currentLabel(metadata, pack.id, file), metadata.thumbnails, evidence);
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
      const reason = expectedSelectionReason(pack, file, label, evidence, groups);
      const animation = assetAnimation(pack, file, label, groups, metadata.thumbnails, evidence);
      if (!reason) coverage.selectableImages++;
      if (!label || label.confidence === 'none') coverage.filenameFallbackImages++;
      const item = {
        id, ordinal: 0, packId: pack.id, path: file.path, oid: file.oid, bytes: file.bytes,
        description: label?.description || basename(file.path), keywords: (label?.keywords ?? pathWords(file.path)).slice(0, 12),
        kind: label?.kind ?? 'image', style: label?.style ?? 'unknown', perspective: label?.perspective ?? 'unknown',
        width: label?.dimensions[0] ?? thumbnail.width, height: label?.dimensions[1] ?? thumbnail.height,
        thumbnailOid: thumbnail.oid, selectable: reason === null, ...(reason ? { selectionReason: reason } : {}),
        ...(animation ? { animation } : {}),
      };
      if (item.path.length > 1024 || item.description.length > 300 || item.keywords.some((k) => k.length > 70)) throw new Error('Asset search item exceeds field bounds');
      items.push(item);
      const groupedFrame = groups.has(file.path) && !animation;
      words.set(id, groupedFrame ? [] : [...new Set([...pathWords(file.path), ...visualWords(label)].flatMap((word) => [word, ...singularForms(word)]))]);
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
