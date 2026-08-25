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

const LICENSE_FILE = /^(licen[cs]e|copying|unlicense)(\.[a-z0-9]+)?$/i;
const ALLOWED = new Set(['CC0-1.0', 'MIT', 'BSD-2-Clause', 'BSD-3-Clause', 'Zlib']);
/** Recognised but not permitted here. Named so the failure says "policy", not "unparseable". */
const DENIED = new Set(['CC-BY', 'CC-BY-SA', 'CC-BY-NC', 'Apache-2.0', 'OFL-1.1', 'GPL']);
const RULES_URL = 'https://github.com/series-ai/jam-ready-assets/blob/main/AGENTS.md#rules-for-agents-modifying-this-repo';

/** SPDX id inferred from the licence body. Null when nothing recognisable is present. */
function licenseFromText(text) {
  const t = text.toLowerCase();
  if (/creativecommons\.org\/licenses\/by-nc/.test(t)) return 'CC-BY-NC';
  if (/creativecommons\.org\/licenses\/by-sa/.test(t)) return 'CC-BY-SA';
  if (/creativecommons\.org\/licenses\/by/.test(t)) return 'CC-BY';
  if (/creativecommons\.org\/publicdomain\/zero/.test(t) || /creative commons zero/.test(t)) return 'CC0-1.0';
  if (/permission is hereby granted, free of charge/.test(t)) return 'MIT';
  if (/redistributions of source code must retain/.test(t)) {
    return /neither the name/.test(t) ? 'BSD-3-Clause' : 'BSD-2-Clause';
  }
  if (/altered source versions must be plainly marked/.test(t)) return 'Zlib';
  if (/apache license/.test(t)) return 'Apache-2.0';
  if (/sil open font license/.test(t)) return 'OFL-1.1';
  if (/gnu general public license/.test(t)) return 'GPL';
  return null;
}

/**
 * A pack's licence, or a reason it cannot ship. The `SPDX-License-Identifier` header is
 * corroborating evidence, never authority on its own: a declaration that contradicts the
 * body it sits above would otherwise walk a denied licence straight past this gate.
 */
function classifyLicense(packId, files) {
  const rootLicenses = files.filter((f) => !f.path.includes('/') && LICENSE_FILE.test(basename(f.path)));
  if (rootLicenses.length === 0) {
    return { error: `${packId}: no licence file. Add one named License.txt in the pack root (a readme does not count). Allowed: ${[...ALLOWED].join(', ')}. See ${RULES_URL}` };
  }
  if (rootLicenses.length > 1) {
    return { error: `${packId}: ${rootLicenses.length} licence files (${rootLicenses.map((f) => f.path).join(', ')}). One licence per pack, so split it into separate packs.` };
  }
  const file = rootLicenses[0];
  const text = readFileSync(file.abs, 'utf8');
  const declared = text.match(/^\s*SPDX-License-Identifier:\s*([A-Za-z0-9.+-]+)/im)?.[1] ?? null;
  const detected = licenseFromText(text);

  if (declared && detected && declared !== detected) {
    return { error: `${packId}: declares SPDX-License-Identifier: ${declared} but its text reads as ${detected}. Fix whichever is wrong.` };
  }
  const license = detected ?? declared;
  if (!license) {
    return { error: `${packId}: licence text in ${file.path} matches nothing we recognise. Add an SPDX-License-Identifier header naming one of: ${[...ALLOWED].join(', ')}.` };
  }
  if (!ALLOWED.has(license)) {
    const why = DENIED.has(license)
      ? `${license} is not permitted in this library`
      : `${license} is not on the allow list`;
    return { error: `${packId}: ${why}. Allowed: ${[...ALLOWED].join(', ')}. See ${RULES_URL}` };
  }
  return { license, licensePath: file.path };
}

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

const BUCKET_URL = process.env.ASSET_BUCKET_URL ?? 'https://storage.googleapis.com/run-asset-library';

function fatal(message) {
  console.error(`\nBUILD FAILED: ${message}`);
  process.exit(1);
}

/** Pack ids in the currently published manifest, so a live pack is never silently dropped. */
async function publishedPackIds() {
  if (process.env.SKIP_PUBLISHED_CHECK === '1') return new Set(); // local dry runs and the PR gate
  let res;
  try {
    res = await fetch(`${BUCKET_URL}/manifest/index.json`);
  } catch (err) {
    fatal(`could not read the published manifest to check for regressions: ${err.message}`);
  }
  if (!res.ok) fatal(`could not read the published manifest (HTTP ${res.status}). Refusing to guess that nothing is published.`);
  return new Set((await res.json()).packs.map((p) => p.id));
}

const commit = execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
const index = [];
const filesIndex = {};
const rejected = [];
const slugOwner = new Map();
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
    const verdict = classifyLicense(id, files);
    if (verdict.error) {
      rejected.push({ id, error: verdict.error });
      continue; // resolved against the published index once every pack has been walked
    }
    const { key: creatorKey, name: creator } = creatorOf(slug);
    const previewPath = findPreview(files);
    const preview = previewPath ? entries.find((e) => e.path === previewPath) : null;
    const audioPreview = category === 'audio'
      ? (runtime.find((e) => ['.ogg', '.mp3'].includes(extname(e.path).toLowerCase())) ?? null)
      : null;
    if (slugOwner.has(slug)) {
      fatal(`slug "${slug}" is used by both ${slugOwner.get(slug)} and ${id}. Imports write to assets/<slug>/, so the second would overwrite the first.`);
    }
    slugOwner.set(slug, id);
    index.push({
      id, slug, title: titleOf(slug, creatorKey), category, theme, creator,
      license: verdict.license,
      fileCount: entries.length,
      runtimeFileCount: runtime.length,
      totalBytes: entries.reduce((s, e) => s + e.bytes, 0),
      previewOid: preview?.oid ?? null,
      audioPreviewOid: audioPreview?.oid ?? null,
    });
    const encoded = id.replaceAll('/', '--');
    writeFileSync(
      join(ROOT, 'manifest/packs', `${encoded}.json`),
      JSON.stringify({
        id,
        commit,
        // `license: true` marks the one file the mirror must upload and the importer must
        // copy alongside the runtime assets. It is deliberately not a runtime file, so it
        // stays out of runtimeFileCount and out of the paths handed to the agent.
        files: entries.map((e) => (e.path === verdict.licensePath ? { ...e, license: true } : e)),
      }),
    );
    filesIndex[id] = runtime.map((e) => [e.path, e.bytes, e.oid]);
  }
}

// A pack that has never shipped can be skipped so one bad contribution does not freeze the
// whole catalogue. A pack that is already live cannot: dropping it from index.json would
// silently unpublish it while its stale per-pack manifest kept serving.
if (rejected.length > 0) {
  const published = await publishedPackIds();
  const regressions = rejected.filter((r) => published.has(r.id));
  for (const r of rejected) console.error(`REJECTED ${r.error}`);
  if (regressions.length > 0) {
    fatal(`${regressions.length} already-published pack(s) would be unpublished: ${regressions.map((r) => r.id).join(', ')}`);
  }
  writeFileSync(join(ROOT, '.rejected-packs.json'), JSON.stringify(rejected, null, 1));
  console.error(`\n${rejected.length} pack(s) skipped. The mirror will publish the rest and the job then fails.`);
}

index.sort((a, b) => a.id.localeCompare(b.id));
writeFileSync(
  join(ROOT, 'manifest/index.json'),
  JSON.stringify({ schemaVersion: 1, generatedAt: new Date().toISOString(), commit, packs: index }, null, 1),
);
writeFileSync(join(ROOT, 'manifest/files.json'), JSON.stringify({ commit, packs: filesIndex }));
console.log(`manifest: ${index.length} packs @ ${commit}`);
