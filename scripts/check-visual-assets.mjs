// Deterministic publication validation, with no model calls or network writes.
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';
import { readVisualMetadata, sha256 } from './visual-metadata.mjs';
import { readThumbnailArchive } from './thumbnail-archive.mjs';
const root = process.cwd(), metadata = readVisualMetadata(root);
if (!metadata.config) throw new Error('Missing visual metadata');
const validated = new Set();
for (let n = 0; n < 256; n++) {
  const prefix = n.toString(16).padStart(2, '0');
  const entries = readThumbnailArchive(join(root, 'metadata/thumbnails', `${prefix}.tar`));
  const expected = Object.entries(metadata.thumbnails).filter(([oid]) => oid.startsWith(prefix));
  for (const [, thumbnail] of expected) {
    const bytes = entries.get(thumbnail.oid);
    if (!bytes || bytes.length !== thumbnail.bytes) throw new Error('Missing thumbnail or mismatched byte count');
    if (!validated.has(thumbnail.oid)) {
      const image = await sharp(bytes, { animated: true }).metadata();
      if (image.format !== 'webp' || (image.pages ?? 1) !== 1 || image.width !== thumbnail.width || image.height !== thumbnail.height) throw new Error('Thumbnail geometry mismatch');
      validated.add(thumbnail.oid);
    }
  }
}
const index = JSON.parse(readFileSync(join(root, 'manifest/v2/index.json'), 'utf8'));
const base = join(root, 'manifest/v2/commits', index.commit, 'assets');
const json = (path) => JSON.parse(readFileSync(join(base, path), 'utf8'));
const descriptor = json('index.json');
if (descriptor.metadataRevision !== index.assetSearch?.metadataRevision || descriptor.catalogCommit !== index.commit) throw new Error('Revision mismatch');
let membershipBytes = readFileSync(join(base, 'index.json')).length;
const membership = [];
for (let n = 0; n < descriptor.membershipShards; n++) {
  const path = `membership/${n}.json`, shard = json(path);
  membershipBytes += readFileSync(join(base, path)).length;
  if (shard.start !== n * 32768) throw new Error('Membership shard offset mismatch');
  const bytes = Buffer.from(shard.packs, 'base64');
  if (bytes.length % 2 || bytes.length > 65536) throw new Error('Invalid membership length');
  for (let i = 0; i < bytes.length; i += 2) membership.push(bytes.readUInt16LE(i));
}
if (membershipBytes > 512 * 1024 || membership.length !== descriptor.assetCount) throw new Error('Membership bounds mismatch');
let count = 0, lastId = '';
for (let page = 0; page < Math.ceil(descriptor.assetCount / 16); page++) {
  const path = `pages/${page}.json`, data = json(path);
  if (readFileSync(join(base, path)).length > 65536 || data.items.length > 16) throw new Error('Detail page bounds exceeded');
  for (const item of data.items) {
    if (item.ordinal !== count || item.id <= lastId || item.id !== sha256(`${item.packId}\0${item.path}`) || descriptor.packIds[membership[count]] !== item.packId || !validated.has(item.thumbnailOid)) throw new Error('Item identity, membership or thumbnail mismatch');
    lastId = item.id; count++;
  }
}
if (count !== descriptor.assetCount) throw new Error('Asset count mismatch');
for (const name of readdirSync(join(base, 'terms'))) {
  const path = join(base, 'terms', name), bytes = readFileSync(path), term = JSON.parse(bytes);
  if (!/^[a-z]{3,70}\.json$/.test(name) || bytes.length > 262144) throw new Error('Invalid posting file');
  if (term.ids) {
    if (term.ids.some((n, i) => !Number.isInteger(n) || n < 0 || n >= count || (i && n <= term.ids[i - 1]))) throw new Error('Invalid sparse posting');
  } else if (typeof term.bits !== 'string' || Buffer.from(term.bits, 'base64').length !== Math.ceil(count / 8)) throw new Error('Invalid dense posting');
}
console.log(JSON.stringify({ labels: metadata.labels.size, paths: metadata.bindings.size, uniqueThumbnails: validated.size, assets: count, membershipBytes, coverage: json('coverage.json') }));
