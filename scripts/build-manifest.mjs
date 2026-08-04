// Builds manifest/index.json, manifest/packs/<id with / -> -->.json, manifest/files.json
// (into a gitignored local manifest/ dir) from a pointers-only checkout.
// LFS pointers carry real byte size (`size NNN`) and sha256 OID; non-LFS files are
// hashed locally, so EVERY file has a content address for the GCS mirror.
//
// Layout contract (see AGENTS.md): 2D|3D/<theme>/<creator>-<pack>/ plus flat
// ui/ icons/ audio/ fonts/ buckets of <creator>-<pack>/.
import { readdirSync, readFileSync, statSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { join, extname, basename } from 'node:path';

const ROOT = process.cwd();
const BUCKETS = { '3D': '3d', '2D': '2d', ui: 'ui', icons: 'ui', fonts: 'ui', audio: 'audio' };
const THEMED_BUCKETS = new Set(['3D', '2D']);
const SKIP_DIRS = new Set(['source', 'samples', '__macosx']);
const NEVER_RUNTIME = new Set([
  '.fbx', '.obj', '.mtl', '.blend', '.dae', '.stl', '.aseprite', '.ase',
  '.swf', '.zip', '.url', '.tmx', '.tsx', '.html', '.txt', '.md',
]);

const CREATOR_NAMES = {
  kenney: 'Kenney', kaykit: 'KayKit', 'pixel-frog': 'Pixel Frog', grafxkid: 'GrafxKid',
  foozle: 'Foozle', 'pixel-boy': 'Pixel-boy', bakudas: 'Estúdio Vaca Roxa', shade: 'Shade',
  alexs: "Alex's Assets", jestan: 'Jestan', styloo: 'Styloo', isa: 'Isa Lousberg',
};

function creatorOf(slug) {
  const key = Object.keys(CREATOR_NAMES).find((c) => slug.startsWith(`${c}-`));
  return key
    ? { key, name: CREATOR_NAMES[key] }
    : { key: slug.split('-')[0], name: slug.split('-')[0] };
}

function titleOf(slug, creatorKey) {
  const rest = slug.startsWith(`${creatorKey}-`) ? slug.slice(creatorKey.length + 1) : slug;
  return rest.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

/** Real byte size + content OID. LFS pointers carry both; non-LFS files are hashed. */
function sizeAndOid(absPath) {
  const st = statSync(absPath);
  if (st.size > 60 && st.size < 300) {
    const head = readFileSync(absPath, { encoding: 'utf8', flag: 'r' }).slice(0, 300);
    if (head.startsWith('version https://git-lfs')) {
      const size = head.match(/^size (\d+)$/m);
      const oid = head.match(/^oid sha256:([0-9a-f]{64})$/m);
      if (size && oid) return { bytes: Number(size[1]), oid: oid[1], lfs: true };
    }
  }
  const oid = createHash('sha256').update(readFileSync(absPath)).digest('hex');
  return { bytes: st.size, oid, lfs: false };
}

function walk(dir, rel = '') {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue;
    const abs = join(dir, entry.name);
    const relPath = rel ? `${rel}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name.toLowerCase())) {
        out.push(...walk(abs, relPath).map((f) => ({ ...f, skippedDir: true })));
      } else {
        out.push(...walk(abs, relPath));
      }
    } else {
      out.push({ path: relPath, abs, skippedDir: false });
    }
  }
  return out;
}

/** True if the file sits in or below a directory that contains .glb files. */
function underGlbDir(relPath, glbDirs) {
  const parts = relPath.split('/');
  parts.pop();
  while (true) {
    if (glbDirs.has(parts.join('/'))) return true;
    if (parts.length === 0) return false;
    parts.pop();
  }
}

/** Which files RUN games actually load. Editable source formats never ship. */
function isRuntime(file, category, packHasOggOrMp3, glbDirs) {
  if (file.skippedDir) return false;
  const ext = extname(file.path).toLowerCase();
  if (NEVER_RUNTIME.has(ext)) return false;
  if (category === '3d') {
    if (ext === '.glb') return true;
    if (glbDirs.size > 0) {
      // glb geometry is embedded, but Kenney GLBs reference textures by relative
      // uri (e.g. "Textures/colormap.png"). Ship textures that live under a
      // glb-containing dir; still skip the duplicate fbx/obj/gltf texture trees.
      return ['.png', '.jpg'].includes(ext) && underGlbDir(file.path, glbDirs);
    }
    return ['.gltf', '.bin', '.png', '.jpg'].includes(ext);
  }
  if (category === 'audio') {
    if (['.ogg', '.mp3'].includes(ext)) return true;
    return ext === '.wav' && !packHasOggOrMp3; // wav only when no compressed sibling exists
  }
  // 2d + ui (incl. icons/fonts buckets)
  return ['.png', '.svg', '.gif', '.ttf', '.otf', '.woff', '.woff2', '.fnt', '.xml', '.json'].includes(ext);
}

function findPreview(files) {
  const names = ['preview.png', 'contents.png', 'sample.png', 'preview.jpg', 'contents.jpg'];
  for (const n of names) {
    const hit = files.find((f) => basename(f.path).toLowerCase() === n);
    if (hit) return hit.path;
  }
  return files.find((f) => extname(f.path).toLowerCase() === '.png')?.path ?? null;
}

const commit = execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
const index = [];
const filesIndex = {};
rmSync(join(ROOT, 'manifest'), { recursive: true, force: true });
mkdirSync(join(ROOT, 'manifest/packs'), { recursive: true });

for (const [bucket, category] of Object.entries(BUCKETS)) {
  let packDirs = [];
  try {
    // Skip loose files (e.g. a bucket-level LICENSE) — only directories are themes/packs.
    if (THEMED_BUCKETS.has(bucket)) {
      for (const theme of readdirSync(join(ROOT, bucket), { withFileTypes: true })) {
        if (theme.name.startsWith('.') || !theme.isDirectory()) continue;
        for (const pack of readdirSync(join(ROOT, bucket, theme.name), { withFileTypes: true })) {
          if (!pack.name.startsWith('.') && pack.isDirectory()) {
            packDirs.push({ id: `${bucket}/${theme.name}/${pack.name}`, theme: theme.name, slug: pack.name });
          }
        }
      }
    } else {
      packDirs = readdirSync(join(ROOT, bucket), { withFileTypes: true })
        .filter((p) => !p.name.startsWith('.') && p.isDirectory())
        .map((pack) => ({ id: `${bucket}/${pack.name}`, theme: bucket, slug: pack.name }));
    }
  } catch {
    continue; // bucket dir absent — tolerate
  }

  for (const { id, theme, slug } of packDirs) {
    const files = walk(join(ROOT, id));
    if (files.length === 0) continue;
    const exts = files.map((f) => extname(f.path).toLowerCase());
    const packHasOggOrMp3 = exts.includes('.ogg') || exts.includes('.mp3');
    const glbDirs = new Set(
      files
        .filter((f) => !f.skippedDir && extname(f.path).toLowerCase() === '.glb')
        .map((f) => (f.path.includes('/') ? f.path.slice(0, f.path.lastIndexOf('/')) : '')),
    );
    const entries = files.map((f) => ({
      path: f.path,
      ...sizeAndOid(f.abs),
      runtime: isRuntime(f, category, packHasOggOrMp3, glbDirs),
    }));
    const runtime = entries.filter((e) => e.runtime);
    const { key: creatorKey, name: creator } = creatorOf(slug);
    const previewPath = findPreview(files);
    const preview = previewPath ? entries.find((e) => e.path === previewPath) : null;
    const audioPreview = category === 'audio'
      ? (runtime.find((e) => ['.ogg', '.mp3'].includes(extname(e.path).toLowerCase())) ?? null)
      : null;
    index.push({
      id, slug, title: titleOf(slug, creatorKey), category, theme, creator,
      fileCount: entries.length,
      runtimeFileCount: runtime.length,
      totalBytes: entries.reduce((s, e) => s + e.bytes, 0),
      previewOid: preview?.oid ?? null,
      audioPreviewOid: audioPreview?.oid ?? null,
    });
    const encoded = id.replaceAll('/', '--');
    writeFileSync(
      join(ROOT, 'manifest/packs', `${encoded}.json`),
      JSON.stringify({ id, commit, files: entries }),
    );
    filesIndex[id] = runtime.map((e) => [e.path, e.bytes, e.oid]);
  }
}

index.sort((a, b) => a.id.localeCompare(b.id));
writeFileSync(
  join(ROOT, 'manifest/index.json'),
  JSON.stringify({ schemaVersion: 1, generatedAt: new Date().toISOString(), commit, packs: index }, null, 1),
);
writeFileSync(join(ROOT, 'manifest/files.json'), JSON.stringify({ commit, packs: filesIndex }));
console.log(`manifest: ${index.length} packs @ ${commit}`);
