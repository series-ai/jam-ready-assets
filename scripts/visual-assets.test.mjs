import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import sharp from 'sharp';
import { CURRENT_IDENTITY, validateLabel, validateBinding, cacheEligible, currentLabel, sha256, writeJsonLines, readVisualMetadata } from './visual-metadata.mjs';
import { appendVisualKeywords, buildAssetSearch, singularForms, dependencyEvidence, selectionReason } from './asset-search-catalog.mjs';
import { writeThumbnailArchive, readThumbnailArchive } from './thumbnail-archive.mjs';
import { assertSafeSvg, thumbnailFromPng, representativeVisual, decodeVisual, quadrants, pngFrameCount } from './visual-render.mjs';
import { requestLabel, mergeResume, generate } from './generate-visual-labels.mjs';
const oid = 'a'.repeat(64);
const label = (overrides = {}) => ({ oid, description: 'Red metal sword', keywords: ['red', 'metal sword'], kind: 'sprite', style: 'pixel', perspective: 'side', confidence: 'high', status: 'tagged', dimensions: [32, 48], frameCount: 1, pageCount: 1, evidenceRevision: 'source-visual-v3', generationIdentity: { ...CURRENT_IDENTITY }, ...overrides });
const temp = (t) => { const dir = mkdtempSync(join(tmpdir(), 'visual-test-')); t.after(() => rmSync(dir, { recursive: true, force: true })); return dir; };

test('labels reject untrusted hashes, identities, field lengths and duplicate keywords', () => {
  assert.equal(validateLabel(label()).oid, oid);
  for (const changes of [{ oid: '../file' }, { description: 'a'.repeat(301) }, { keywords: ['red', 'red'] }, { generationIdentity: { ...CURRENT_IDENTITY, model: 'unknown' } }, { dimensions: [0, 48] }, { frameCount: 0 }]) assert.throws(() => validateLabel(label(changes)));
  assert.throws(() => validateBinding({ path: 'pack/../outside.png', packId: 'pack', oid, role: 'runtime' }));
});
test('cache accepts exact and audited identities; targeted invalidation leaves unrelated hashes reusable', () => {
  const historical = label({ generationIdentity: { ...CURRENT_IDENTITY, promptRevision: 'astra-visual-v2', preprocessingRevision: 'audited-source-views-v2' } });
  assert.equal(cacheEligible(historical, oid), true);
  assert.equal(cacheEligible(historical, oid, { [oid]: true }), false);
  assert.equal(cacheEligible(label(), oid, { [oid]: true }), true);
  assert.equal(cacheEligible(historical, oid, { ['b'.repeat(64)]: true }), true);
  assert.equal(cacheEligible(label(), 'b'.repeat(64)), false);
});
test('only current runtime bindings contribute visual metadata', () => {
  const metadata = { bindings: new Map([['pack/2D/theme/a.png', { oid, role: 'runtime' }]]), labels: new Map([[oid, label()]]), config: {} };
  assert.ok(currentLabel(metadata, 'pack/2D/theme', { path: 'a.png', oid, runtime: true }));
  assert.equal(currentLabel(metadata, 'pack/2D/theme', { path: 'a.png', oid: 'b'.repeat(64), runtime: true }), null);
  assert.equal(currentLabel(metadata, 'pack/2D/theme', { path: 'a.png', oid, runtime: false }), null);
});
test('preserves filename keywords and appends at most forty distinct visual words', () => {
  const original = Array.from({ length: 60 }, (_, n) => `word${n}`);
  const result = appendVisualKeywords(original, [label({ keywords: Array.from({ length: 100 }, (_, n) => `visual${String.fromCharCode(97 + n % 26)}${String.fromCharCode(97 + Math.floor(n / 26))}`) })]);
  assert.deepEqual(result.slice(0, 60), original); assert.equal(result.length, 100);
  assert.deepEqual(appendVisualKeywords(['red'], [label()]), ['red', 'metal', 'sword']);
});
test('normalization fixtures preserve raw tokens and expected consumer singular forms', () => {
  for (const [word, forms] of [['enemies', ['enemy', 'enemie']], ['zombies', ['zomby', 'zombie']], ['boxes', ['box']], ['bushes', ['bush']], ['grass', ['grass']], ['swords', ['sword']], ['bus', ['bus']]]) assert.deepEqual(singularForms(word), forms);
});
test('dependency evidence refuses animation, font and companion metadata selections', () => {
  const pack = { id: 'pack/2D/theme', category: '2d' }, file = { path: 'sword.png' };
  assert.equal(selectionReason(pack, file, label(), dependencyEvidence([file])), null);
  assert.match(selectionReason(pack, file, label(), dependencyEvidence([file, { path: 'atlas.json' }])), /Companion/);
  assert.match(selectionReason(pack, file, label({ frameCount: 2 }), dependencyEvidence([file])), /Animation/);
  assert.match(selectionReason({ ...pack, category: '3d' }, file, label(), dependencyEvidence([file])), /pack/);
  assert.match(selectionReason(pack, { path: 'Knight/idle_01.png' }, label(), dependencyEvidence([{ path: 'Knight/idle_01.png' }, { path: 'Knight/idle_02.png' }])), /Frame sequence/);
});
test('catalog pages, membership, pack lookups and sparse/dense terms agree', (t) => {
  const root = temp(t), packId = 'pack/2D/theme', files = [];
  const metadata = { labels: new Map(), bindings: new Map(), thumbnails: {}, config: { enabled: false, invalidations: {} } };
  for (let n = 0; n < 80; n++) {
    const hash = sha256(`source${n}`), path = `sword_${n}.png`;
    files.push({ path, oid: hash, bytes: 100, runtime: true });
    metadata.labels.set(hash, label({ oid: hash, keywords: n === 0 ? ['swords', 'unique'] : ['swords'] }));
    metadata.bindings.set(`${packId}/${path}`, { oid: hash, role: 'runtime' });
    metadata.thumbnails[hash] = { oid: sha256(`thumb${n}`), width: 32, height: 48, bytes: 100 };
  }
  const summary = { id: packId, category: '2d' }, commit = 'd'.repeat(40);
  const result = buildAssetSearch(root, commit, [{ summary, files }], metadata);
  assert.equal(result.enabled, false);
  const base = join(root, 'manifest/v2/commits', commit, 'assets'), json = (path) => JSON.parse(readFileSync(join(base, path), 'utf8'));
  const descriptor = json('index.json'); assert.equal(descriptor.assetCount, 80); assert.equal(descriptor.membershipShards, 1);
  const lookup = json('packs/pack--2D--theme.json').entries;
  const items = Array.from({ length: 5 }, (_, page) => json(`pages/${page}.json`).items).flat();
  assert.deepEqual(lookup, items.map(({ id, ordinal }) => ({ id, ordinal })));
  assert.equal(items.length, 80); assert.equal(items[0].id, sha256(`${packId}\0${items[0].path}`));
  assert.deepEqual(items.map((x) => x.ordinal), Array.from({ length: 80 }, (_, n) => n));
  assert.equal(json('pages/0.json').items.length, 16);
  assert.equal(Buffer.from(json('membership/0.json').packs, 'base64').length, 160);
  assert.ok(json('terms/swords.json').bits); assert.ok(json('terms/sword.json').bits);
  assert.equal(json('terms/unique.json').ids.length, 1);
});
test('thumbnail archive rejects traversal, links, duplicates, oversized and changed bytes', async (t) => {
  const root = temp(t), path = join(root, 'a.tar');
  const image = await sharp({ create: { width: 3, height: 2, channels: 4, background: '#ff0000' } }).webp().toBuffer();
  const hash = sha256(image); writeThumbnailArchive(path, new Map([[hash, image]]));
  assert.deepEqual(readThumbnailArchive(path).get(hash), image);
  const original = readFileSync(path);
  function rewrite(change) {
    const bytes = Buffer.from(original); change(bytes);
    bytes.fill(32, 148, 156);
    const sum = [...bytes.subarray(0, 512)].reduce((a, b) => a + b, 0);
    bytes.write(`${sum.toString(8).padStart(6, '0')}\0 `, 148);
    writeFileSync(path, bytes); assert.throws(() => readThumbnailArchive(path));
  }
  rewrite((b) => { b.fill(0, 0, 100); b.write('../evil.webp'); });
  rewrite((b) => { b[156] = 50; });
  rewrite((b) => { b[512 + 20] ^= 1; });
  rewrite((b) => { b.write('00000200000\0', 124); });
  const entryLength = original.length - 1024;
  writeFileSync(path, Buffer.concat([original.subarray(0, entryLength), original]));
  assert.throws(() => readThumbnailArchive(path));
});
test('thumbnail encoder preserves aspect and returns static bounded WebP', async () => {
  const source = await sharp({ create: { width: 1000, height: 500, channels: 4, background: '#ff0000' } }).png().toBuffer();
  const thumbnail = await thumbnailFromPng(source, true);
  assert.equal(thumbnail.width, 256); assert.equal(thumbnail.height, 128); assert.ok(thumbnail.bytes <= 40960);
  assert.equal((await sharp(thumbnail.data).metadata()).pages ?? 1, 1);
});
test('SVG renderer refuses network, local file, entity and stylesheet resources', () => {
  for (const svg of ['<svg><image href="https://example.org/a.png"/></svg>', '<svg><image href="file:///etc/passwd"/></svg>', '<!ENTITY x "a"><svg/>', '<svg><style>@import "x";</style></svg>', '<svg><image href="data:image/svg+xml;base64,AA"/></svg>']) assert.throws(() => assertSafeSvg(Buffer.from(svg)));
  assert.doesNotThrow(() => assertSafeSvg(Buffer.from('<svg><use href="#shape"/><image href="data:image/png;base64,AAAA"/></svg>')));
});
test('generation stops on authentication/quota and retries transient responses at most three times', async () => {
  for (const [status, code] of [[401, 'invalid_api_key'], [429, 'insufficient_quota']]) {
    const state = { calls: 0, stopped: false };
    await assert.rejects(requestLabel([Buffer.from('image')], 'test', state, async () => new Response(JSON.stringify({ error: { code } }), { status }), async () => {}));
    assert.equal(state.calls, 1); assert.equal(state.stopped, true);
  }
  const state = { calls: 0, stopped: false };
  await assert.rejects(requestLabel([], 'test', state, async () => new Response('{}', { status: 503 }), async () => {}));
  assert.equal(state.calls, 4);
});
test('resume cache preserves accepted main corrections and fills targeted invalidations', () => {
  const current = { config: { invalidations: {} }, labels: new Map([[oid, label()]]), thumbnails: { [oid]: { oid } } };
  const resume = { labels: new Map([[oid, label({ description: 'Other wording' })]]), thumbnails: { [oid]: { oid } } };
  assert.equal(mergeResume(current, resume), 0); assert.equal(current.labels.get(oid).description, 'Red metal sword');
  current.labels.clear(); assert.equal(mergeResume(current, resume), 1);
});

test('representative frame finds visible art when first, middle and last frames are transparent', async () => {
  const bytes = Buffer.alloc(2 * 2 * 21 * 4);
  for (let frame = 0; frame < 21; frame++) if (![0, 10, 20].includes(frame)) {
    for (let pixel = 0; pixel < 4; pixel++) {
      const i = (frame * 4 + pixel) * 4; bytes[i] = 100 + frame * 5; bytes[i + 3] = 255;
    }
  }
  const gif = await sharp(bytes, { raw: { width: 2, height: 42, channels: 4, pageHeight: 2 } }).gif({ loop: 0, delay: 50 }).toBuffer();
  const first = await decodeVisual(gif, '.gif');
  assert.ok(first.frames > 3);
  for (const page of [0, Math.floor((first.frames - 1) / 2), first.frames - 1]) {
    const frame = await decodeVisual(gif, '.gif', page);
    assert.equal((await sharp(frame.png).ensureAlpha().extractChannel(3).stats()).channels[0].max, 0);
  }
  const representative = await representativeVisual(gif, '.gif');
  assert.equal(representative.empty, false); assert.equal(representative.frameIndex, 1);
  const transparent = await sharp({ create: { width: 2, height: 2, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } }).png().toBuffer();
  assert.equal((await representativeVisual(transparent, '.png')).empty, true);
  const blue = await sharp({ create: { width: 2, height: 2, channels: 4, background: 'blue' } }).png().toBuffer();
  assert.equal((await representativeVisual(blue, '.png')).empty, false);
});
test('odd-sized crops cover every source pixel exactly once', () => {
  for (const [width, height] of [[7, 9], [1, 2001], [2001, 1], [2001, 2003]]) {
    const crops = quadrants(width, height);
    assert.equal(crops.reduce((sum, crop) => sum + crop.width * crop.height, 0), width * height);
    assert.equal(Math.max(...crops.map((crop) => crop.left + crop.width)), width);
    assert.equal(Math.max(...crops.map((crop) => crop.top + crop.height)), height);
  }
});
test('generation deadline stops model requests before spending', async () => {
  const state = { calls: 0, stopped: false, deadline: Date.now() - 1 };
  await assert.rejects(requestLabel([], 'test', state, async () => { throw new Error('Should not call'); }), /time budget/);
  assert.equal(state.calls, 0); assert.equal(state.budgetExhausted, true);
});

async function generationFixture(root) {
  const packId = 'example/2D/misc', commit = 'e'.repeat(40);
  for (const path of ['metadata/labels', 'metadata/thumbnails', packId, `manifest/v2/commits/${commit}/packs`]) mkdirSync(join(root, path), { recursive: true });
  writeFileSync(join(root, 'metadata/visual.json'), JSON.stringify({ schemaVersion: 1, enabled: false, invalidations: {} }));
  writeFileSync(join(root, 'metadata/thumbnails.json'), '{}'); writeJsonLines(join(root, 'metadata/paths.jsonl.gz'), []);
  const files = [];
  for (const color of ['red', 'blue']) {
    const bytes = await sharp({ create: { width: 4, height: 3, channels: 4, background: color } }).png().toBuffer();
    writeFileSync(join(root, packId, `${color}.png`), bytes);
    files.push({ path: `${color}.png`, oid: sha256(bytes), bytes: bytes.length, runtime: true });
  }
  writeFileSync(join(root, 'manifest/v2/index.json'), JSON.stringify({ commit, packs: [{ id: packId, version: 'abc123' }] }));
  writeFileSync(join(root, `manifest/v2/commits/${commit}/packs/example--2D--misc.json`), JSON.stringify({ files }));
  return { packId, commit, files };
}
const modelResponse = () => new Response(JSON.stringify({ status: 'completed', output: [{ content: [{ type: 'output_text', text: JSON.stringify({ description: 'Colored square', keywords: ['square'], kind: 'sprite', style: 'flat', perspective: 'front', confidence: 'high' }) }] }] }), { status: 200 });
test('partial generation checkpoints and resumes accepted hashes without a repeated API call', async (t) => {
  const prior = temp(t), current = temp(t);
  await generationFixture(prior); const fixture = await generationFixture(current);
  const priorKey = process.env.ASSET_VISION_OPENAI_API_KEY; process.env.ASSET_VISION_OPENAI_API_KEY = 'test-fixture-key';
  t.after(() => { if (priorKey === undefined) delete process.env.ASSET_VISION_OPENAI_API_KEY; else process.env.ASSET_VISION_OPENAI_API_KEY = priorKey; });
  let calls = 0;
  const statusFile = join(prior, 'status.json');
  await assert.rejects(generate(prior, { skipLfs: true, concurrency: 1, statusFile, fetcher: async (_url, options) => {
    const body = JSON.parse(options.body); assert.equal(body.model, 'gpt-6-astra');
    const image = body.input[0].content.find((content) => content.type === 'input_image');
    assert.equal((await sharp(Buffer.from(image.image_url.split(',')[1], 'base64')).metadata()).width, 4);
    return ++calls === 1 ? modelResponse() : new Response('{}', { status: 401 });
  } }), /checkpointed/);
  assert.equal(readVisualMetadata(prior).labels.size, 1);
  assert.equal(JSON.parse(readFileSync(statusFile)).generated, 1);
  let resumeCalls = 0;
  const result = await generate(current, { skipLfs: true, concurrency: 1, resumeDir: prior, fetcher: async () => { resumeCalls++; return modelResponse(); } });
  assert.equal(result.resumed, 1); assert.equal(result.generated, 1); assert.equal(resumeCalls, 1);
  assert.equal(readVisualMetadata(current).labels.size, 2);
  const packPath = join(current, `manifest/v2/commits/${fixture.commit}/packs/example--2D--misc.json`);
  const pack = JSON.parse(readFileSync(packPath)); pack.files.push({ ...fixture.files[0], path: 'new-path.png' }); writeFileSync(packPath, JSON.stringify(pack));
  delete process.env.ASSET_VISION_OPENAI_API_KEY;
  const cached = await generate(current, { skipLfs: true, fetcher: async () => { throw new Error('No model call expected'); } });
  assert.equal(cached.calls, 0); assert.equal(cached.pending, 0);
  assert.ok(readVisualMetadata(current).bindings.has(`${fixture.packId}/new-path.png`));
});
test('mirror verifies and uploads thumbnail objects before publishing the catalog pointer', async (t) => {
  const root = temp(t), { packId, commit, files } = await generationFixture(root);
  const file = files[0], thumb = await thumbnailFromPng(readFileSync(join(root, packId, file.path)));
  writeJsonLines(join(root, 'metadata/labels', `${file.oid.slice(0, 2)}.jsonl.gz`), [label({ oid: file.oid })]);
  writeJsonLines(join(root, 'metadata/paths.jsonl.gz'), [{ path: `${packId}/${file.path}`, packId, oid: file.oid, role: 'runtime' }]);
  const { data, ...record } = thumb; writeFileSync(join(root, 'metadata/thumbnails.json'), JSON.stringify({ [file.oid]: record }));
  writeThumbnailArchive(join(root, 'metadata/thumbnails', `${file.oid.slice(0, 2)}.tar`), new Map([[thumb.oid, data]]));
  writeFileSync(join(root, `manifest/v2/commits/${commit}/packs/example--2D--misc.json`), JSON.stringify({ id: packId, version: 'abc123', files: [file] }));
  mkdirSync(join(root, 'bin')); mkdirSync(join(root, 'manifest/packs'));
  const log = join(root, 'commands.jsonl');
  for (const binary of ['git', 'gcloud']) {
    const code = `#!${process.execPath}\nconst fs=require('node:fs'); const args=process.argv.slice(2); fs.appendFileSync(${JSON.stringify(log)},JSON.stringify({binary:${JSON.stringify(binary)},args})+'\\n'); if(args[0]==='storage'&&args[1]==='ls') {if(args[2].includes('/objects/'))console.log('gs://run-asset-library/objects/${file.oid}'); else console.log('gs://run-asset-library/packs/${packId}@abc123/${file.path}');}\n`;
    writeFileSync(join(root, 'bin', binary), code, { mode: 0o755 });
  }
  const sourceRoot = dirname(dirname(fileURLToPath(import.meta.url)));
  execFileSync(process.execPath, [join(sourceRoot, 'scripts/mirror-to-gcs.mjs')], { cwd: root, env: { ...process.env, PATH: `${join(root, 'bin')}:${process.env.PATH}` }, stdio: 'pipe' });
  const commands = readFileSync(log, 'utf8').trim().split('\n').map(JSON.parse);
  const upload = commands.findIndex((command) => command.args.includes('--content-type=image/webp'));
  const pointer = commands.findIndex((command) => command.args.some((arg) => !arg.startsWith('gs://') && arg.endsWith('/manifest/v2/index.json')));
  assert.ok(upload >= 0 && pointer > upload);
  assert.deepEqual(readFileSync(join(root, '.mirror-stage', thumb.oid)), data);
  assert.ok(commands.some((command) => command.binary === 'git' && command.args.some((arg) => arg.includes(`metadata/thumbnails/${file.oid.slice(0, 2)}.tar`))));
});

test('PNG animation control prevents a multi-frame source being treated as static', () => {
  const header = Buffer.from('89504e470d0a1a0a', 'hex'), chunk = Buffer.alloc(20);
  chunk.writeUInt32BE(8, 0); chunk.write('acTL', 4); chunk.writeUInt32BE(21, 8);
  assert.equal(pngFrameCount(Buffer.concat([header, chunk])), 21);
  assert.throws(() => pngFrameCount(Buffer.concat([header, chunk.subarray(0, 17)])), /Truncated/);
});

test('animation sequences stay grouped across source naming conventions', () => {
  const pack = { id: 'example/2D/characters', category: '2d' };
  for (const paths of [
    ['hero_walk1.png', 'hero_walk2.png'],
    ['heroRun01.png', 'heroRun02.png'],
    ['WALK1.PNG', 'WALK2.PNG'],
    ['9-Hit/1.png', '9-Hit/2.png'],
    ['Effects/simpleExplosion01.png', 'Effects/simpleExplosion02.png'],
    ['enemySwimming1.png', 'enemySwimming2.png'],
    ['Walk/hero (1).png', 'Walk/hero (2).png'],
    ['Attack/hero[1].png', 'Attack/hero[2].png'],
    ['SeparateAnim/Special1.png', 'SeparateAnim/Special2.png'],
    ['Main Menu animated background 1.png', 'Main Menu animated background 2.png'],
  ]) {
    const files = paths.map((path) => ({ path })), evidence = dependencyEvidence(files);
    for (const file of files) assert.ok(selectionReason(pack, file, label(), evidence), file.path);
  }
});
test('numbered independent art and complete self-contained sheets remain selectable', () => {
  const pack = { id: 'example/2D/misc', category: '2d' };
  const files = ['tile_01.png', 'tile_02.png', 'white1.png', 'white2.png',
    'runeBlue1.png', 'runeBlue2.png', 'dieRed1.png', 'dieRed2.png',
    'Spritesheets/hero_walk.png', 'icons/attack.png', 'hero_run1.png', 'hero_run2.svg'].map((path) => ({ path }));
  const evidence = dependencyEvidence(files);
  for (const file of files) assert.equal(selectionReason(pack, file, label({ kind: 'sheet' }), evidence), null, file.path);
});
test('CSS and resource descriptors keep sibling images together without blocking other directories', () => {
  const pack = { id: 'example/2D/misc', category: '2d' };
  for (const extension of ['css', 'tres', 'anim', 'frames']) {
    const files = [{ path: `Character/clip.${extension}` }, { path: 'Character/sheet.png' },
      { path: 'Character/nested/texture.png' }, { path: 'Characters/icon.png' }];
    const evidence = dependencyEvidence(files);
    for (const file of files.slice(1, 3)) assert.match(selectionReason(pack, file, label(), evidence), /Companion/);
    assert.equal(selectionReason(pack, files[3], label(), evidence), null);
  }
});
const emit = (t, paths, labelFor = () => ({}), category = '2d', packId = 'example/2D/characters') => {
  const root = temp(t);
  const metadata = { labels: new Map(), bindings: new Map(), thumbnails: {}, config: { enabled: true, invalidations: {} } };
  const files = paths.map((path, i) => {
    const hash = sha256(path);
    metadata.labels.set(hash, label({ oid: hash, keywords: ['robot'], ...labelFor(path) }));
    metadata.bindings.set(`${packId}/${path}`, { oid: hash, role: 'runtime' });
    metadata.thumbnails[hash] = { oid: sha256(`thumb${i}`), width: 32, height: 48, bytes: 100 };
    return { path, oid: hash, bytes: 100, runtime: true };
  });
  const commit = 'e'.repeat(40);
  buildAssetSearch(root, commit, [{ summary: { id: packId, category }, files }], metadata);
  const base = join(root, 'manifest/v2/commits', commit, 'assets');
  const items = JSON.parse(readFileSync(join(base, 'pages/0.json'))).items;
  const term = JSON.parse(readFileSync(join(base, 'terms/robot.json')));
  const searchable = new Set(term.ids ?? items.filter((x) => Buffer.from(term.bits, 'base64')[x.ordinal >> 3] & (1 << (x.ordinal & 7))).map((x) => x.ordinal));
  return { packId, metadata, items: new Map(items.map((x) => [x.path, x])), searchable: (x) => searchable.has(x.ordinal) };
};
test('a frame sequence becomes one selectable search result that lists every frame in order', (t) => {
  const { packId, metadata, items, searchable } = emit(t, ['hero_walk2.png', 'hero_walk10.png', 'hero_walk1.png', 'hero.png']);
  const lead = items.get('hero_walk1.png');
  assert.equal(lead.selectable, true); assert.equal(lead.selectionReason, undefined);
  assert.deepEqual(lead.animation, {
    type: 'sequence', frames: 3,
    frameThumbnailOids: ['hero_walk1.png', 'hero_walk2.png', 'hero_walk10.png'].map((path) => metadata.thumbnails[sha256(path)].oid),
    frameIds: ['hero_walk1.png', 'hero_walk2.png', 'hero_walk10.png'].map((path) => sha256(`${packId}\0${path}`)),
  });
  for (const path of ['hero_walk2.png', 'hero_walk10.png']) {
    const frame = items.get(path);
    assert.equal(frame.selectable, false); assert.match(frame.selectionReason, /Frame sequence/);
    assert.equal(frame.animation, undefined); assert.equal(searchable(frame), false);
  }
  assert.equal(searchable(lead), true); assert.equal(searchable(items.get('hero.png')), true);
  assert.equal(items.get('hero.png').animation, undefined);
});
test('long, mixed-size and descriptor-backed sequences preview without becoming selectable', (t) => {
  const long = emit(t, Array.from({ length: 17 }, (_, n) => `hero_walk${n + 1}.png`)).items.get('hero_walk1.png');
  assert.equal(long.selectable, false); assert.equal(long.animation.frames, 17); assert.equal(long.animation.frameIds, undefined);
  assert.equal(emit(t, Array.from({ length: 33 }, (_, n) => `hero_walk${n + 1}.png`)).items.get('hero_walk1.png').animation, undefined);
  const mixed = emit(t, ['hero_walk1.png', 'hero_walk2.png'], (path) => (path.endsWith('2.png') ? { dimensions: [32, 32] } : {}));
  assert.equal(mixed.items.get('hero_walk1.png').animation, undefined);
  const sheets = emit(t, ['hero_walk1.png', 'hero_walk2.png'], () => ({ kind: 'sheet', dimensions: [128, 32] }));
  for (const item of sheets.items.values()) assert.deepEqual(item.animation, { type: 'sheet', frames: 4, columns: 4, rows: 1 });
  const wideFrames = emit(t, ['hero_death1.png', 'hero_death2.png', 'hero_death3.png'], () => ({ dimensions: [96, 32] }));
  assert.equal(wideFrames.items.get('hero_death1.png').animation.type, 'sequence');
  assert.equal(wideFrames.items.get('hero_death2.png').animation, undefined);
  const lone = emit(t, ['hero_walk1.png', 'hero_walk2.png'], (path) => ({ dimensions: path.endsWith('1.png') ? [128, 32] : [64, 32] }));
  assert.equal(lone.items.get('hero_walk1.png').animation, undefined);
  const fonts = emit(t, ['fonts/frames/glyph1.png', 'fonts/frames/glyph2.png']).items.get('fonts/frames/glyph1.png');
  assert.equal(fonts.selectable, false); assert.equal(fonts.animation.type, 'sequence');
  const fontPack = emit(t, ['frames/a1.png', 'frames/a2.png'], () => ({}), '2d', 'example/2D/fonts').items.get('frames/a1.png');
  assert.equal(fontPack.selectable, false); assert.equal(fontPack.animation.frameIds, undefined);
  const described = emit(t, ['anims/hero_run1.png', 'anims/hero_run2.png', 'anims/hero.json']).items.get('anims/hero_run1.png');
  assert.equal(described.selectable, false); assert.equal(described.animation.frameIds, undefined);
});
test('square-frame strips and multi-frame images carry a preview; other shapes stay static', (t) => {
  const { items } = emit(t, ['hero_run.png', 'hero_jump.png', 'hero_tall_idle.png', 'tiles.png', 'hero_hurt.png', 'portal.gif'], (path) => ({
    dimensions: { 'hero_run.png': [192, 48], 'hero_jump.png': [200, 48], 'hero_tall_idle.png': [32, 128], 'tiles.png': [192, 48], 'hero_hurt.png': [48, 48] }[path] ?? [32, 32],
    frameCount: path.endsWith('.gif') ? 12 : 1,
  }));
  assert.deepEqual(items.get('hero_run.png').animation, { type: 'sheet', frames: 4, columns: 4, rows: 1 });
  assert.deepEqual(items.get('hero_tall_idle.png').animation, { type: 'sheet', frames: 4, columns: 1, rows: 4 });
  assert.deepEqual(items.get('portal.gif').animation, { type: 'animated', frames: 12 });
  for (const path of ['hero_jump.png', 'tiles.png', 'hero_hurt.png']) assert.equal(items.get(path).animation, undefined, path);
  assert.equal(items.get('hero_run.png').selectable, true);
});