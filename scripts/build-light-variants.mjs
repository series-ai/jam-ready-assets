// Adds optional lighter variants to the v2 manifest. Runs after build-manifest.mjs and before
// mirror-to-gcs.mjs, and only touches packs named in light-variants.json.
//
// Cost model: every conversion result is cached in the bucket by source sha256 + recipe +
// pinned helper, and the cache is read once per run. Only sources never seen before are pulled
// from LFS and converted, at most `limits.maxConversionsPerRun` per run, so the first backfill
// spreads over a few runs and a daily rebuild with nothing new converts nothing.
//
// Safety model: originals are never touched. A pack advertises its variant only once every
// eligible file has a result, and the mirror drops the advertisement again if any of the
// variant's objects is missing from the bucket. The v2 index is rewritten in one step at the
// end, so a failure anywhere before leaves the catalogue exactly as build-manifest wrote it.
//
// Env: LIGHT_VARIANT_STORE   gs://bucket, or a local directory for a dry run (unset: off)
//      LIGHT_VARIANT_HELPER  path to the pinned preparation helper (unset: cached results only)
//      ASSET_REPO_URL        public repository URL for the Original artwork link
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import {
  existsSync, mkdirSync, mkdtempSync, readFileSync, renameSync, rmSync, statSync, writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  buildVariant, contentTypeOf, eligibleFiles, encodePackId, makeRecord, originalArtworkUrl, readRecipe,
  recipeKey, withVariant,
} from './light-variants.mjs';
import { loadHelper, openStore } from './light-variant-store.mjs';
import { localSourcePath } from './preview-policy.mjs';

const DEFAULT_REPO_URL = 'https://github.com/series-ai/jam-ready-assets';
const CONCURRENCY = 4;
const sha256 = (buffer) => createHash('sha256').update(buffer).digest('hex');

function lfsPull(repoPaths) {
  for (let i = 0; i < repoPaths.length; i += 200) {
    execFileSync('git', ['lfs', 'pull', `--include=${repoPaths.slice(i, i + 200).join(',')}`], { stdio: 'inherit' });
  }
}

async function eachLimited(items, limit, fn) {
  let cursor = 0;
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (cursor < items.length) await fn(items[cursor++]);
  }));
}

/** Converts cache misses, uploads what got smaller, and records every deterministic outcome. */
async function convert({ root, queue, helper, store, key, fetchSources, stats }) {
  const sourcePath = (f) => localSourcePath(root, f.repoPath);
  const isReal = (f) => existsSync(sourcePath(f)) && statSync(sourcePath(f)).size === f.bytes;
  const toPull = queue.filter((f) => !isReal(f));
  stats.pulledFiles = toPull.length;
  stats.pulledBytes = toPull.reduce((sum, f) => sum + f.bytes, 0);
  if (toPull.length > 0) await fetchSources(toPull.map((f) => f.repoPath));

  const work = mkdtempSync(join(tmpdir(), 'light-variants-work-'));
  try {
    const results = new Map();
    await eachLimited(queue, CONCURRENCY, async (f) => {
      let source;
      try {
        source = readFileSync(sourcePath(f));
      } catch {
        source = null;
      }
      if (!source || sha256(source) !== f.oid) {
        stats.unavailable += 1; // still a pointer, or changed on disk: try again next run
        return;
      }
      const destination = join(work, `${f.record}${extname(f.path).toLowerCase()}`);
      const result = await helper.run({ source: sourcePath(f), destination, ...f.params, expectedSha256: f.oid });
      if (!result) {
        stats.helperErrors += 1;
        return;
      }
      const output = result.ok === true && result.changed && existsSync(destination) ? readFileSync(destination) : null;
      results.set(f.record, { record: makeRecord(f, source, result, output), file: destination, path: f.path });
    });

    // Objects first, then the records that point at them: a record is only ever written for an
    // object the bucket has confirmed, at the right size.
    const byType = new Map();
    for (const r of results.values()) {
      if (r.record.status !== 'changed') continue;
      const type = contentTypeOf(r.path);
      if (!byType.has(type)) byType.set(type, []);
      byType.get(type).push({ oid: r.record.oid, file: r.file });
    }
    const present = new Set();
    for (const [type, objects] of byType) {
      for (const oid of await store.putObjects(objects, type)) present.add(oid);
    }
    const fresh = new Map();
    for (const [name, r] of results) {
      if (r.record.status === 'changed' && !present.has(r.record.oid)) continue;
      fresh.set(name, r.record);
      stats[r.record.status] += 1;
    }
    await store.putResults(key, fresh);
    return fresh;
  } finally {
    rmSync(work, { recursive: true, force: true });
  }
}

export async function buildLightVariants({ root, recipe, store, helper, fetchSources = lfsPull, repoUrl = DEFAULT_REPO_URL }) {
  const key = recipeKey(recipe);
  const stats = {
    packs: 0, eligible: 0, cached: 0, queued: 0, deferred: 0, pulledFiles: 0, pulledBytes: 0,
    changed: 0, unchanged: 0, failed: 0, unavailable: 0, helperErrors: 0, advertised: 0,
  };
  const indexPath = join(root, 'manifest/v2/index.json');
  const index = JSON.parse(readFileSync(indexPath, 'utf8'));
  const byId = new Map(index.packs.map((p) => [p.id, p]));
  const packDir = join(root, 'manifest/v2/commits', index.commit, 'packs');

  const plans = new Map();
  for (const [id, rule] of Object.entries(recipe.packs)) {
    const summary = byId.get(id);
    if (!summary) {
      console.warn(`light variants: ${id} is not in this catalogue; skipped`);
      continue;
    }
    const packManifest = JSON.parse(readFileSync(join(packDir, `${encodePackId(id)}.json`), 'utf8'));
    const readText = (path) => {
      try {
        const text = readFileSync(localSourcePath(root, `${id}/${path}`), 'utf8');
        return text.startsWith('version https://git-lfs') ? null : text;
      } catch {
        return null;
      }
    };
    const eligible = eligibleFiles({ ...packManifest, category: summary.category }, rule, key, recipe.limits, readText);
    plans.set(id, { packManifest, eligible });
    stats.packs += 1;
    stats.eligible += eligible.length;
  }

  const records = await store.readResults(key);
  const misses = new Map();
  for (const [id, { eligible }] of plans) {
    for (const f of eligible) {
      if (records.has(f.record)) stats.cached += 1;
      else if (!misses.has(f.record)) misses.set(f.record, { ...f, repoPath: `${id}/${f.path}` });
    }
  }
  const queue = helper ? [...misses.values()].slice(0, recipe.limits.maxConversionsPerRun) : [];
  stats.queued = queue.length;
  stats.deferred = misses.size - queue.length;
  if (queue.length > 0) {
    for (const [name, record] of await convert({ root, queue, helper, store, key, fetchSources, stats })) {
      records.set(name, record);
    }
  }

  const packs = index.packs.map((summary) => {
    const plan = plans.get(summary.id);
    if (!plan) return summary;
    const variant = buildVariant({
      packManifest: plan.packManifest, eligible: plan.eligible, records, key,
      commit: index.commit, encodedId: encodePackId(summary.id),
    });
    if (!variant) return summary;
    mkdirSync(dirname(join(root, variant.manifestPath)), { recursive: true });
    writeFileSync(join(root, variant.manifestPath), JSON.stringify(variant.manifest));
    stats.advertised += 1;
    return withVariant(summary, variant.descriptor, originalArtworkUrl(repoUrl, index.commit, summary.id));
  });
  const tmp = `${indexPath}.tmp`;
  writeFileSync(tmp, JSON.stringify({ ...index, packs }, null, 1));
  renameSync(tmp, indexPath);
  return stats;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const root = process.cwd();
  const recipe = readRecipe(root);
  const store = openStore(process.env.LIGHT_VARIANT_STORE);
  if (!recipeKey(recipe) || Object.keys(recipe.packs).length === 0) {
    console.log('light variants: no pinned helper or no packs selected; publishing originals only');
  } else if (!store) {
    console.log('light variants: LIGHT_VARIANT_STORE not set; publishing originals only');
  } else {
    const helper = loadHelper(process.env.LIGHT_VARIANT_HELPER, recipe.helper.sha256);
    if (!helper) console.log('light variants: no helper given; using cached results only');
    const stats = await buildLightVariants({
      root, recipe, store, helper, repoUrl: process.env.ASSET_REPO_URL ?? DEFAULT_REPO_URL,
    });
    console.log(`light variants: ${JSON.stringify(stats)}`);
  }
}
