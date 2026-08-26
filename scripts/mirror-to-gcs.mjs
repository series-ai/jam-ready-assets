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
// Runtime + licence files are additionally wanted as path-addressed copies under
// packs/<id>@<version>/<path> — the URLs games reference directly.
const index = JSON.parse(readFileSync(join(ROOT, 'manifest/v2/index.json'), 'utf8'));
const byId = new Map(index.packs.map((p) => [p.id, p]));
const wanted = new Map(); // oid -> { repoPath, ext }
const wantedPathCopies = new Map(); // 'packs/<id>@<version>/<path>' -> oid
const versionedPackDir = join(ROOT, 'manifest/v2/commits', index.commit, 'packs');
for (const packFile of readdirSync(versionedPackDir)) {
  const pack = JSON.parse(readFileSync(join(versionedPackDir, packFile), 'utf8'));
  const summary = byId.get(pack.id);
  const previewOids = new Set([summary?.previewOid, summary?.audioPreviewOid].filter(Boolean));
  for (const f of pack.files) {
    if (f.runtime || f.license || previewOids.has(f.oid)) {
      wanted.set(f.oid, { repoPath: `${pack.id}/${f.path}`, ext: extname(f.path).toLowerCase() });
    }
    if (f.runtime || f.license) {
      wantedPathCopies.set(`packs/${pack.id}@${pack.version}/${f.path}`, f.oid);
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

// 5. Path-addressed copies: packs/<id>@<version>/<path>. Games load these URLs directly,
// and each version prefix preserves the pack's folder shape so relative sibling
// references resolve (a .gltf finds its .bin, an atlas its .png). Server-side rewrites
// move no bytes out of GCS and inherit the source object's content-type and immutable
// cache-control. Prefixes are append-only: a changed pack gets a new @version and old
// prefixes are never deleted — shipped games reference them forever.
const bucketName = BUCKET.replace('gs://', '');
const existingPathCopies = new Set(
  execSync(`gcloud storage ls '${BUCKET}/packs/**' 2>/dev/null || true`, {
    encoding: 'utf8',
    maxBuffer: 256 * 1024 * 1024,
  }).split('\n').map((l) => l.trim()).filter(Boolean).map((l) => l.slice(`${BUCKET}/`.length)),
);
const pathCopies = [...wantedPathCopies].filter(([dest]) => !existingPathCopies.has(dest));
console.log(`path copies: ${wantedPathCopies.size} wanted, ${pathCopies.length} to copy`);

const freshToken = () => execSync('gcloud auth print-access-token', { encoding: 'utf8' }).trim();
let token = pathCopies.length > 0 ? freshToken() : '';
async function rewriteObject(oid, dest) {
  const base = `https://storage.googleapis.com/storage/v1/b/${bucketName}/o/`
    + `${encodeURIComponent(`objects/${oid}`)}/rewriteTo/b/${bucketName}/o/${encodeURIComponent(dest)}`;
  let rewriteToken;
  for (let attempt = 0; ; ) {
    const url = rewriteToken ? `${base}?rewriteToken=${encodeURIComponent(rewriteToken)}` : base;
    const res = await fetch(url, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) {
      const body = await res.json();
      if (body.done) return;
      rewriteToken = body.rewriteToken; // >5 GB objects rewrite in chunks; loop until done
      continue;
    }
    if (attempt++ >= 3) throw new Error(`rewrite ${dest}: HTTP ${res.status} ${await res.text()}`);
    if (res.status === 401) token = freshToken(); // token expired mid-run
    else if (res.status === 429 || res.status >= 500) await new Promise((r) => setTimeout(r, 1000 * attempt));
    else throw new Error(`rewrite ${dest}: HTTP ${res.status} ${await res.text()}`);
  }
}
let copied = 0;
let cursor = 0;
async function copyWorker() {
  while (cursor < pathCopies.length) {
    const [dest, oid] = pathCopies[cursor++];
    await rewriteObject(oid, dest);
    if (++copied % 1000 === 0) console.log(`path copies: ${copied}/${pathCopies.length}`);
  }
}
await Promise.all(Array.from({ length: Math.min(32, pathCopies.length) }, copyWorker));

// 6. Publish manifests after their objects. V2 pack data is immutable by commit, so an
// index can never pair with another revision. Legacy pack files are pruned because old
// consumers cache the mutable v1 index and must get a safe 404 after a CC0 reclassification.
execFileSync('gcloud', [
  'storage', 'rsync', '--recursive', '--delete-unmatched-destination-objects',
  '--content-type=application/json',
  '--cache-control=public, max-age=300',
  join(ROOT, 'manifest/packs'), `${BUCKET}/manifest/packs`,
], { stdio: 'inherit' });
execFileSync('gcloud', [
  'storage', 'cp', '-r',
  '--content-type=application/json',
  '--cache-control=public, max-age=31536000, immutable',
  join(ROOT, 'manifest/v2/commits', index.commit), `${BUCKET}/manifest/v2/commits/`,
], { stdio: 'inherit' });
for (const [source, destination] of [
  ['manifest/files.json', `${BUCKET}/manifest/files.json`],
  ['manifest/index.json', `${BUCKET}/manifest/index.json`],
  ['manifest/v2/index.json', `${BUCKET}/manifest/v2/index.json`],
]) {
  execFileSync('gcloud', [
    'storage', 'cp',
    '--content-type=application/json',
    '--cache-control=public, max-age=300',
    join(ROOT, source), destination,
  ], { stdio: 'inherit' });
}
console.log(`mirrored ${missing.length} new objects + manifest @ ${index.commit}`);
