// Bounded, checkpointed Responses generation. CI calls this only on trusted main.
import { readFileSync, writeFileSync, existsSync, mkdirSync, renameSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join, extname } from 'node:path';
import { pathToFileURL } from 'node:url';
import sharp from 'sharp';
import { CURRENT_IDENTITY, cacheEligible, readVisualMetadata, validateLabel, writeJsonLines, sha256 } from './visual-metadata.mjs';
import { readThumbnailArchive, writeThumbnailArchive } from './thumbnail-archive.mjs';
import { decodeVisual, representativeVisual, quadrants, thumbnailFromPng } from './visual-render.mjs';

export const LABEL_SCHEMA = {
  type: 'object', additionalProperties: false,
  required: ['description', 'keywords', 'kind', 'style', 'perspective', 'confidence'],
  properties: {
    description: { type: 'string', maxLength: 300 },
    keywords: { type: 'array', maxItems: 40, items: { type: 'string', maxLength: 70 } },
    kind: { type: 'string', enum: ['sprite', 'tile', 'icon', 'ui', 'sheet', 'animation', 'texture', 'background', 'other', 'empty'] },
    style: { type: 'string', enum: ['pixel', 'flat', 'rendered', 'painted', 'mixed', 'unknown'] },
    perspective: { type: 'string', enum: ['front', 'isometric', 'top-down', 'side', 'mixed', 'unknown'] },
    confidence: { type: 'string', enum: ['high', 'medium', 'low', 'none'] },
  },
};
export async function requestLabel(images, apiKey, state, fetcher = fetch, sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))) {
  for (let attempt = 0; attempt <= 3; attempt++) {
    if (state.deadline && Date.now() >= state.deadline) { state.budgetExhausted = true; throw new Error('Generation time budget exhausted'); }
    if (state.stopped) throw new Error('Generation stopped after authentication or quota failure');
    state.calls++;
    let response;
    try {
      response = await fetcher('https://api.openai.com/v1/responses', {
        method: 'POST', signal: AbortSignal.timeout(120000),
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({
          model: CURRENT_IDENTITY.model, reasoning: { effort: 'low' }, store: false, max_output_tokens: 2000,
          input: [{ role: 'user', content: [
            { type: 'input_text', text: 'Describe only visible game art in these views of one source image. Give a short neutral description and specific searchable subject, color, shape and material keywords. Do not infer franchise, creator, license, purpose, dependencies or unseen content. For sheets describe visible subjects across the sheet. Use unknown or none when uncertain. Pixel means visible pixel art; empty means no visible drawing. Views may include full image, quadrants and sampled animation frames.' },
            ...images.map((bytes) => ({ type: 'input_image', image_url: `data:image/png;base64,${bytes.toString('base64')}`, detail: 'high' })),
          ] }], text: { format: { type: 'json_schema', name: 'asset_visual_label', strict: true, schema: LABEL_SCHEMA } },
        }),
      });
    } catch (error) {
      // A timeout may have generated a billable response. Never retry an ambiguous call.
      state.stopped = true;
      throw new Error(`Generation transport failure: ${error.name}`);
    }
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      const quota = body.error?.code === 'insufficient_quota' || body.error?.type === 'insufficient_quota';
      if ([401, 403].includes(response.status) || quota) state.stopped = true;
      if (!state.stopped && (response.status === 429 || response.status >= 500) && attempt < 3) { await sleep(1000 * 2 ** attempt); continue; }
      throw new Error(`Generation HTTP ${response.status}${quota ? ' quota exhausted' : ''}`);
    }
    const result = await response.json();
    const output = result.output?.flatMap((item) => item.content ?? []).filter((item) => item.type === 'output_text').map((item) => item.text).join('');
    if (!output || result.status !== 'completed') throw new Error('Generation did not return a complete structured label');
    return JSON.parse(output);
  }
}
function atomicJson(path, value) {
  writeFileSync(`${path}.tmp`, `${JSON.stringify(value)}\n`); renameSync(`${path}.tmp`, path);
}
export function mergeResume(current, resume) {
  let merged = 0;
  for (const [oid, row] of resume.labels) {
    if (cacheEligible(current.labels.get(oid), oid, current.config.invalidations) && current.thumbnails[oid]) continue;
    if (!cacheEligible(row, oid, current.config.invalidations) || !resume.thumbnails[oid]) continue;
    if (!cacheEligible(current.labels.get(oid), oid, current.config.invalidations)) current.labels.set(oid, row);
    current.thumbnails[oid] = resume.thumbnails[oid]; merged++;
  }
  return merged;
}
export async function generate(root, options = {}) {
  const metadata = readVisualMetadata(root);
  if (!metadata.config) throw new Error('Initialize metadata before incremental generation');
  const directory = join(root, 'metadata');
  const limit = options.limit ?? 200, concurrency = options.concurrency ?? 3;
  if (!Number.isInteger(limit) || limit < 0 || limit > 200 || !Number.isInteger(concurrency) || concurrency < 1 || concurrency > 3) throw new Error('Generation limits: 0-200 hashes and 1-3 concurrent calls');
  const index = JSON.parse(readFileSync(join(root, 'manifest/v2/index.json'), 'utf8'));
  const runtime = new Map();
  for (const pack of index.packs) {
    const manifest = JSON.parse(readFileSync(join(root, 'manifest/v2/commits', index.commit, 'packs', `${pack.id.replaceAll('/', '--')}.json`), 'utf8'));
    for (const file of manifest.files) if (file.runtime && /\.(png|jpe?g|svg|gif|webp)$/i.test(file.path)) {
      const path = `${pack.id}/${file.path}`;
      metadata.bindings.set(path, { path, packId: pack.id, oid: file.oid, role: 'runtime' });
      if (!runtime.has(file.oid)) runtime.set(file.oid, { ...file, path });
    }
  }
  const maxSeconds = options.maxSeconds ?? 1800;
  if (!Number.isInteger(maxSeconds) || maxSeconds < 1 || maxSeconds > 2100) throw new Error('Generation time budget must be 1-2100 seconds');
  const state = { deadline: Date.now() + maxSeconds * 1000, budgetExhausted: false, calls: 0, stopped: false, generated: 0, resumed: 0, pending: 0, errors: [] };
  const archiveCache = new Map();
  const archive = (prefix) => {
    if (!archiveCache.has(prefix)) {
      const path = join(directory, 'thumbnails', `${prefix}.tar`);
      archiveCache.set(prefix, existsSync(path) ? readThumbnailArchive(path) : new Map());
    }
    return archiveCache.get(prefix);
  };
  function checkpoint(prefix) {
    writeJsonLines(join(directory, 'labels', `${prefix}.jsonl.gz`), [...metadata.labels.values()].filter((row) => row.oid.startsWith(prefix)).sort((a, b) => a.oid.localeCompare(b.oid)));
    const path = join(directory, 'thumbnails', `${prefix}.tar`);
    writeThumbnailArchive(`${path}.tmp`, archive(prefix)); renameSync(`${path}.tmp`, path);
    atomicJson(join(directory, 'thumbnails.json'), Object.fromEntries(Object.entries(metadata.thumbnails).sort(([a], [b]) => a.localeCompare(b))));
  }
  if (options.resumeDir && existsSync(join(options.resumeDir, 'metadata/visual.json'))) {
    const resume = readVisualMetadata(options.resumeDir);
    for (const [oid, row] of resume.labels) {
      if (!runtime.has(oid) || (cacheEligible(metadata.labels.get(oid), oid, metadata.config.invalidations) && metadata.thumbnails[oid]) || !cacheEligible(row, oid, metadata.config.invalidations) || !resume.thumbnails[oid]) continue;
      const prefix = oid.slice(0, 2), thumb = resume.thumbnails[oid];
      const entries = readThumbnailArchive(join(options.resumeDir, 'metadata/thumbnails', `${prefix}.tar`));
      const bytes = entries.get(thumb.oid);
      if (!bytes || bytes.length !== thumb.bytes) throw new Error('Invalid resumed thumbnail');
      archive(prefix).set(thumb.oid, bytes);
      mergeResume(metadata, { labels: new Map([[oid, row]]), thumbnails: { [oid]: thumb } });
      checkpoint(prefix); state.resumed++;
    }
  }
  const pending = [...runtime.values()].filter((file) => !cacheEligible(metadata.labels.get(file.oid), file.oid, metadata.config.invalidations) || !metadata.thumbnails[file.oid]).sort((a, b) => a.oid.localeCompare(b.oid));
  const selected = pending.slice(0, limit);
  state.pending = pending.length;
  // This file contains no credentials or model output. Workflow always preserves it.
  const finish = () => { state.pending = pending.length - state.generated; if (options.statusFile) atomicJson(options.statusFile, state); };
  writeJsonLines(join(directory, 'paths.jsonl.gz'), [...metadata.bindings.values()].sort((a, b) => a.path.localeCompare(b.path)));
  if (!selected.length) { finish(); return state; }
  const apiKey = process.env.ASSET_VISION_OPENAI_API_KEY;
  if (!apiKey && selected.some((file) => !cacheEligible(metadata.labels.get(file.oid), file.oid, metadata.config.invalidations))) { state.errors.push('Set repository secret ASSET_VISION_OPENAI_API_KEY'); finish(); throw new Error(state.errors[0]); }
  // Fetch source bytes only for the bounded selected batch. Existing thumbnail shards
  // are fetched by CI, and accepted records are checkpointed after every image.
  if (!options.skipLfs) execFileSync('git', ['lfs', 'pull', `--include=${selected.map((file) => file.path).join(',')}`], { cwd: root, stdio: 'inherit' });
  let next = 0;
  async function worker() {
    while (!state.stopped && next < selected.length) {
      if (Date.now() >= state.deadline) { state.budgetExhausted = true; break; }
      const file = selected[next++];
      try {
        const bytes = readFileSync(join(root, file.path));
        if (sha256(bytes) !== file.oid) throw new Error('Source hash mismatch');
        const decoded = await representativeVisual(bytes, extname(file.path).toLowerCase());
        const views = [await sharp(decoded.png).resize({ width: 1536, height: 1536, fit: 'inside', withoutEnlargement: true }).png().toBuffer()];
        if (decoded.frames > 1) {
          for (const page of [...new Set([Math.floor((decoded.frames - 1) / 2), decoded.frames - 1])].filter((p) => p > 0)) {
            const frame = await decodeVisual(bytes, extname(file.path).toLowerCase(), page);
            views.push(await sharp(frame.png).resize({ width: 1536, height: 1536, fit: 'inside', withoutEnlargement: true }).png().toBuffer());
          }
        } else if (decoded.width > 1536 || decoded.height > 1536) {
          for (const crop of quadrants(decoded.width, decoded.height)) views.push(await sharp(decoded.png).extract(crop).resize({ width: 1024, height: 1024, fit: 'inside' }).png().toBuffer());
        }
        const cached = metadata.labels.get(file.oid);
        const result = cacheEligible(cached, file.oid, metadata.config.invalidations) ? { ...cached, keywords: [...cached.keywords] } : decoded.empty ? { description: 'Fully transparent image.', keywords: ['transparent', 'empty'], kind: 'empty', style: 'unknown', perspective: 'unknown', confidence: 'high' } : await requestLabel(views, apiKey, state, options.fetcher);
        if (result.kind === 'empty' && !decoded.empty) { result.kind = 'other'; result.confidence = 'none'; result.description = 'Image artwork'; result.keywords = []; }
        const row = validateLabel({ ...result, keywords: [...new Set(result.keywords)], oid: file.oid, status: decoded.empty ? 'empty' : 'tagged', dimensions: [decoded.width, decoded.height], frameCount: decoded.frames, pageCount: 1, generationIdentity: cacheEligible(cached, file.oid, metadata.config.invalidations) ? cached.generationIdentity : decoded.empty ? { model: 'alpha-channel-check', promptRevision: 'empty-image-v1', preprocessingRevision: 'source-static-v1', schemaRevision: 1 } : { ...CURRENT_IDENTITY }, evidenceRevision: cached?.evidenceRevision ?? 'source-visual-v3' });
        const thumbnail = await thumbnailFromPng(decoded.png, row.style === 'pixel'), prefix = file.oid.slice(0, 2);
        archive(prefix).set(thumbnail.oid, thumbnail.data);
        metadata.labels.set(file.oid, row);
        const { data, ...thumbnailRecord } = thumbnail;
        metadata.thumbnails[file.oid] = thumbnailRecord;
        checkpoint(prefix); state.generated++; finish();
      } catch (error) {
        if (!state.budgetExhausted) state.errors.push({ oid: file.oid, message: error.message });
      }
    }
  }
  try { await Promise.all(Array.from({ length: Math.min(concurrency, selected.length) }, worker)); }
  finally {
    writeJsonLines(join(directory, 'paths.jsonl.gz'), [...metadata.bindings.values()].sort((a, b) => a.path.localeCompare(b.path)));
    finish();
  }
  if (state.errors.length) throw new Error(`${state.errors.length} image generation failures; accepted records have been checkpointed`);
  return state;
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const args = process.argv.slice(2), options = {};
  for (let i = 0; i < args.length; i += 2) {
    const key = { '--resume-dir': 'resumeDir', '--status-file': 'statusFile', '--limit': 'limit', '--concurrency': 'concurrency', '--max-seconds': 'maxSeconds' }[args[i]];
    if (!key || args[i + 1] === undefined) throw new Error('Unknown or incomplete generation option');
    options[key] = ['limit', 'concurrency', 'maxSeconds'].includes(key) ? Number(args[i + 1]) : args[i + 1];
  }
  await generate(process.cwd(), options);
}
