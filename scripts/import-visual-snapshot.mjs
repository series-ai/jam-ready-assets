// Offline seed import. Explicit paths are operator inputs and never stored in metadata.
import { readFileSync, mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { join, extname } from 'node:path';
import { readJsonLines, writeJsonLines, validateLabel, validateBinding, sha256 } from './visual-metadata.mjs';
import { representativeVisual, thumbnailFromPng } from './visual-render.mjs';
import { writeThumbnailArchive, readThumbnailArchive } from './thumbnail-archive.mjs';

const [labelsPath, pathsPath, lfsObjects] = process.argv.slice(2);
if (!labelsPath || !pathsPath || !lfsObjects) throw new Error('Usage: node scripts/import-visual-snapshot.mjs labels.jsonl.gz paths.jsonl.gz lfs-objects-directory');
const root = process.cwd(), directory = join(root, 'metadata');
mkdirSync(join(directory, 'labels'), { recursive: true }); mkdirSync(join(directory, 'thumbnails'), { recursive: true });
const rows = readJsonLines(labelsPath).map((row) => validateLabel({
  oid: row.oid, status: row.status, description: row.description, keywords: row.keywords,
  kind: row.kind, style: row.style, perspective: row.perspective, confidence: row.confidence,
  dimensions: row.dimensions, frameCount: row.frameCount, pageCount: row.pageCount ?? 1,
  evidenceRevision: '2026-10-07-audited-1',
  generationIdentity: { model: row.model ?? 'alpha-channel-check', promptRevision: row.model ? row.generationRevision : 'empty-image-v1', preprocessingRevision: 'audited-source-views-v2', schemaRevision: 1 },
}));
const paths = readJsonLines(pathsPath).map((row) => validateBinding({ path: row.path, packId: row.packId ?? row.path.split('/').slice(0, /^(2D|3D)$/.test(row.path.split('/')[1]) ? 3 : 2).join('/'), oid: row.oid, role: row.role }));
const labels = new Map(rows.map((row) => [row.oid, row]));
if (labels.size !== rows.length || new Set(paths.map((row) => row.path)).size !== paths.length) throw new Error('Duplicate snapshot records');
writeJsonLines(join(directory, 'paths.jsonl.gz'), paths.sort((a, b) => a.path.localeCompare(b.path)));
writeFileSync(join(directory, 'visual.json'), `${JSON.stringify({ schemaVersion: 1, enabled: false, invalidations: {} }, null, 2)}\n`);
const thumbnailPath = join(directory, 'thumbnails.json');
const thumbnails = existsSync(thumbnailPath) ? JSON.parse(readFileSync(thumbnailPath, 'utf8')) : {};
const runtime = new Map(paths.filter((row) => row.role === 'runtime').map((row) => [row.oid, row]));
let count = 0;
for (let prefixNumber = 0; prefixNumber < 256; prefixNumber++) {
  const prefix = prefixNumber.toString(16).padStart(2, '0');
  writeJsonLines(join(directory, 'labels', `${prefix}.jsonl.gz`), rows.filter((row) => row.oid.startsWith(prefix)).sort((a, b) => a.oid.localeCompare(b.oid)));
  const archivePath = join(directory, 'thumbnails', `${prefix}.tar`);
  const entries = existsSync(archivePath) ? readThumbnailArchive(archivePath) : new Map();
  for (const [oid, path] of runtime) {
    if (!oid.startsWith(prefix)) continue;
    if (thumbnails[oid] && entries.has(thumbnails[oid].oid)) continue;
    const sourcePath = join(lfsObjects, oid.slice(0, 2), oid.slice(2, 4), oid);
    const source = existsSync(sourcePath) ? readFileSync(sourcePath) : readFileSync(join(root, path.path));
    if (sha256(source) !== oid) throw new Error(`Source bytes unavailable for ${oid}`);
    const decoded = await representativeVisual(source, extname(path.path).toLowerCase()).catch((error) => { throw new Error(`${oid}: ${error.message}`); });
    const thumbnail = await thumbnailFromPng(decoded.png, labels.get(oid)?.style === 'pixel');
    entries.set(thumbnail.oid, thumbnail.data);
    const { data, ...record } = thumbnail;
    thumbnails[oid] = record; count++;
  }
  writeThumbnailArchive(archivePath, entries);
  writeFileSync(thumbnailPath, JSON.stringify(Object.fromEntries(Object.entries(thumbnails).sort(([a], [b]) => a.localeCompare(b)))));
  if (prefixNumber % 16 === 15) console.log(`thumbnail shards: ${prefixNumber + 1}/256, generated ${count}`);
}
console.log(`Imported ${labels.size} source labels and ${paths.length} bindings; ${Object.keys(thumbnails).length} runtime thumbnails`);
