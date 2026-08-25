// Uploads content-addressed objects the bucket is missing, then the manifest.
// Incremental by construction: objects/<oid> is immutable, so only new OIDs ever
// need LFS bytes pulled or uploaded. Manifest uploads LAST so readers never see
// a manifest referencing un-mirrored objects.
// Requires: gcloud (authed — WIF in CI), git-lfs, and a prior build-manifest run.
import { readFileSync, readdirSync, mkdirSync, copyFileSync, rmSync } from 'node:fs';
import { execSync, execFileSync } from 'node:child_process';
import { join, extname } from 'node:path';

const BUCKET = process.env.ASSET_BUCKET ?? 'gs://run-asset-library';
const ROOT = process.cwd();
const CONTENT_TYPES = {
  '.png': 'image/png', '.jpg': 'image/jpeg', '.gif': 'image/gif', '.svg': 'image/svg+xml',
  '.glb': 'model/gltf-binary', '.gltf': 'model/gltf+json', '.bin': 'application/octet-stream',
  '.ogg': 'audio/ogg', '.mp3': 'audio/mpeg', '.wav': 'audio/wav',
  '.ttf': 'font/ttf', '.otf': 'font/otf', '.woff': 'font/woff', '.woff2': 'font/woff2',
  '.fnt': 'text/plain', '.xml': 'application/xml', '.json': 'application/json',
  // Licence files ship as text so a creator can open one straight from the CDN. Objects are
  // uploaded immutable, so a wrong content type here cannot be corrected later.
  '.txt': 'text/plain', '.md': 'text/plain', '': 'text/plain',
};

// 1. Wanted objects = every runtime file, each pack's licence, and its preview/audio-preview.
const index = JSON.parse(readFileSync(join(ROOT, 'manifest/index.json'), 'utf8'));
const byId = new Map(index.packs.map((p) => [p.id, p]));
const wanted = new Map(); // oid -> { repoPath, ext }
for (const packFile of readdirSync(join(ROOT, 'manifest/packs'))) {
  const pack = JSON.parse(readFileSync(join(ROOT, 'manifest/packs', packFile), 'utf8'));
  const summary = byId.get(pack.id);
  const previewOids = new Set([summary?.previewOid, summary?.audioPreviewOid].filter(Boolean));
  for (const f of pack.files) {
    if (f.runtime || f.license || previewOids.has(f.oid)) {
      wanted.set(f.oid, { repoPath: `${pack.id}/${f.path}`, ext: extname(f.path).toLowerCase() });
    }
  }
}

// 2. What the bucket already has.
const existing = new Set(
  execSync(`gcloud storage ls '${BUCKET}/objects/*' 2>/dev/null || true`, {
    encoding: 'utf8',
    maxBuffer: 256 * 1024 * 1024,
  }).split('\n').map((l) => l.trim().split('/').pop()).filter(Boolean),
);
const missing = [...wanted].filter(([oid]) => !existing.has(oid));
console.log(`objects: ${wanted.size} wanted, ${existing.size} in bucket, ${missing.length} to upload`);

// 3. Pull LFS bytes for missing objects only, in batches. Non-LFS files are
//    already real on disk; including them in --include is harmless.
for (let i = 0; i < missing.length; i += 200) {
  const batch = missing.slice(i, i + 200).map(([, m]) => m.repoPath);
  execFileSync('git', ['lfs', 'pull', `--include=${batch.join(',')}`], { stdio: 'inherit' });
}

// 4. Stage as <oid> filenames, grouped by content-type, and bulk-upload immutable.
const stageDir = join(ROOT, '.mirror-stage');
rmSync(stageDir, { recursive: true, force: true });
mkdirSync(stageDir, { recursive: true });
const byType = new Map();
for (const [oid, m] of missing) {
  const type = CONTENT_TYPES[m.ext] ?? 'application/octet-stream';
  const staged = join(stageDir, oid);
  copyFileSync(join(ROOT, m.repoPath), staged);
  if (!byType.has(type)) byType.set(type, []);
  byType.get(type).push(staged);
}
for (const [type, paths] of byType) {
  execFileSync('gcloud', [
    'storage', 'cp', '--read-paths-from-stdin',
    `--content-type=${type}`,
    '--cache-control=public, max-age=31536000, immutable',
    `${BUCKET}/objects/`,
  ], { input: paths.join('\n'), stdio: ['pipe', 'inherit', 'inherit'] });
}

// 5. Manifest last, short TTL.
execFileSync('gcloud', [
  'storage', 'cp', '-r',
  '--content-type=application/json',
  '--cache-control=public, max-age=300',
  join(ROOT, 'manifest'), `${BUCKET}/`,
], { stdio: 'inherit' });
console.log(`mirrored ${missing.length} new objects + manifest @ ${index.commit}`);
