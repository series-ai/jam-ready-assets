import assert from 'node:assert/strict';
import test from 'node:test';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import {
  cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import {
  RECIPE_FILE, buildVariant, eligibleFiles, imageSize, makeRecord, originalArtworkUrl, readRecipe,
  validateRecipe, variantMirrorPlan, withVariant, withoutVariants,
} from './light-variants.mjs';
import { loadHelper } from './light-variant-store.mjs';
import { packVersion } from './pack-version.mjs';

const sourceRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const hash = (data) => createHash('sha256').update(data).digest('hex');
const LIMITS = { maxSourceBytes: 1000, maxConversionsPerRun: 10 };
const KEY = 'light-v1-0123456789abcdef';
const oid = (n) => String(n).repeat(64).slice(0, 64);
const recipe = (packs, sha256 = 'a'.repeat(64)) => ({ schemaVersion: 1, recipeVersion: 'light-v1', helper: { sha256 }, packs });

test('the committed recipe is valid and only names 2D, UI and audio packs that exist', () => {
  const committed = readRecipe(sourceRoot);
  for (const id of Object.keys(committed.packs)) {
    assert.ok(existsSync(join(sourceRoot, id)), `${RECIPE_FILE} names a missing pack: ${id}`);
  }
});

test('recipe validation refuses models, unbounded resizes and audio of unknown looping', () => {
  assert.throws(() => validateRecipe(recipe({ 'a/3D/city': { images: 'lossless' } })), /3D packs/);
  assert.throws(() => validateRecipe(recipe({ 'a/2D/misc': { images: 'resize' } })), /maxDimension/);
  assert.throws(() => validateRecipe(recipe({ 'a/audio': { audio: 'yes' } })), /non-looping/);
  assert.throws(() => validateRecipe(recipe({ 'a/ui': {} })), /selects no media/);
  assert.throws(() => validateRecipe(recipe({}, 'not-a-hash')), /helper.sha256/);
  assert.equal(validateRecipe(recipe({}, null)).limits.maxConversionsPerRun, 400);
});

const packFiles = [
  { path: 'License.txt', bytes: 10, oid: oid(1), runtime: false, license: true },
  { path: 'coin.png', bytes: 500, oid: oid(2), runtime: true },
  { path: 'Sheets/sheet.png', bytes: 500, oid: oid(3), runtime: true },
  { path: 'Sheets/sheet.xml', bytes: 50, oid: oid(4), runtime: true },
  { path: 'font_0.png', bytes: 500, oid: oid(5), runtime: true },
  { path: 'font.fnt', bytes: 50, oid: oid(6), runtime: true },
  { path: 'spin.gif', bytes: 500, oid: oid(7), runtime: true },
  { path: 'icon.svg', bytes: 500, oid: oid(8), runtime: true },
  { path: 'Source/coin.png', bytes: 500, oid: oid(9), runtime: false },
  { path: 'Huge/backdrop.png', bytes: 5000, oid: oid('a'), runtime: true },
  { path: 'Skip/flag.png', bytes: 500, oid: oid('b'), runtime: true },
  { path: 'jump.ogg', bytes: 500, oid: oid('c'), runtime: true },
];
const sidecarText = { 'Sheets/sheet.xml': '<TextureAtlas imagePath="sheet.png"/>', 'font.fnt': 'page id=0 file="font_0.png"' };

test('only standalone runtime pictures, and sounds marked non-looping, are eligible', () => {
  const pack = { id: 'x/2D/misc', category: '2d', files: packFiles };
  const rule = { images: 'lossless', exclude: ['Skip'] };
  const paths = eligibleFiles(pack, rule, KEY, LIMITS, (p) => sidecarText[p]).map((f) => f.path);
  // The atlas and font pages stay original; GIF, SVG, sources, licences and oversized files too.
  assert.deepEqual(paths, ['coin.png']);
  const withAudio = eligibleFiles(pack, { ...rule, audio: 'non-looping' }, KEY, LIMITS, (p) => sidecarText[p]);
  assert.deepEqual(withAudio.map((f) => [f.path, f.kind, f.params.mode]), [['coin.png', 'image', 'lossless'], ['jump.ogg', 'audio', 'audio']]);
  // A sidecar that cannot be read could reference any picture, so none is eligible.
  assert.deepEqual(eligibleFiles(pack, rule, KEY, LIMITS, () => null), []);
  assert.deepEqual(eligibleFiles({ ...pack, category: '3d' }, rule, KEY, LIMITS, () => ''), []);
  // A sheet with no sidecar keeps its size under resize (its frame grid lives in game code).
  const sheets = { ...pack, files: [...packFiles, { path: 'Characters/hero_spritesheet.png', bytes: 500, oid: oid('d'), runtime: true }] };
  const read = (p) => sidecarText[p];
  assert.deepEqual(eligibleFiles(sheets, { images: 'resize', maxDimension: 256, exclude: ['Skip'] }, KEY, LIMITS, read).map((f) => f.path), ['coin.png']);
  assert.deepEqual(eligibleFiles(sheets, rule, KEY, LIMITS, read).map((f) => f.path), ['coin.png', 'Characters/hero_spritesheet.png']);
});

test('cache record names change with the source, the options and the recipe', () => {
  const pack = { id: 'x/2D/misc', category: '2d', files: packFiles };
  const name = (rule, key = KEY) => eligibleFiles(pack, rule, key, LIMITS, (p) => sidecarText[p])[0].record;
  const lossless = name({ images: 'lossless' });
  assert.match(lossless, new RegExp(`^${oid(2)}-[0-9a-f]{16}$`));
  assert.notEqual(lossless, name({ images: 'resize', maxDimension: 256 }));
  assert.notEqual(name({ images: 'resize', maxDimension: 256 }), name({ images: 'resize', maxDimension: 512 }));
  assert.notEqual(lossless, name({ images: 'lossless' }, 'light-v2-0123456789abcdef'));
});

const png = (width, height, compressionLevel = 0) =>
  sharp({ create: { width, height, channels: 4, background: { r: 200, g: 40, b: 90, alpha: 0.5 } } })
    .png({ compressionLevel }).toBuffer();

test('image sizes come from PNG and JPEG headers', async () => {
  assert.deepEqual(imageSize(await png(300, 200)), { width: 300, height: 200 });
  const jpeg = await sharp({ create: { width: 17, height: 9, channels: 3, background: 'blue' } }).jpeg().toBuffer();
  assert.deepEqual(imageSize(jpeg), { width: 17, height: 9 });
  assert.equal(imageSize(Buffer.from('not an image')), null);
});

test('a result is used only when it is provably smaller, same format, and within bounds', async () => {
  const source = await png(300, 200, 0);
  const smaller = await png(300, 200, 9);
  const resized = await sharp(source).resize(64, 64, { fit: 'inside' }).png({ compressionLevel: 9 }).toBuffer();
  const file = (mode) => ({
    path: 'coin.png', oid: hash(source), kind: 'image',
    params: mode === 'resize' ? { mode, width: 64, height: 64, pixelArt: false } : { mode, pixelArt: false },
  });
  const ok = (output, extra = {}) => ({
    ok: true, changed: true, bytes: output.length, sha256: hash(output), sourceSha256: hash(source),
    sourceBytes: source.length, mimeType: 'image/png', recipeVersion: 'tool-1', ...extra,
  });

  const lossless = makeRecord(file('lossless'), source, ok(smaller), smaller);
  assert.equal(lossless.status, 'changed');
  assert.deepEqual([lossless.width, lossless.height, lossless.sourceWidth], [300, 200, 300]);

  const fit = makeRecord(file('resize'), source, ok(resized), resized);
  assert.deepEqual([fit.status, fit.width, fit.height], ['changed', 64, 43]);

  assert.equal(makeRecord(file('lossless'), source, ok(resized), resized).reason, 'lossless changed size');
  assert.equal(makeRecord(file('lossless'), source, ok(smaller, { mimeType: 'image/webp' }), smaller).reason, 'format changed');
  assert.equal(makeRecord(file('lossless'), source, ok(smaller, { sha256: oid(1) }), smaller).reason, 'output digest mismatch');
  assert.equal(makeRecord(file('lossless'), source, ok(smaller, { sourceSha256: oid(1) }), smaller).reason, 'source digest mismatch');
  const bigger = makeRecord({ ...file('lossless'), oid: hash(smaller) }, smaller, ok(source, { sourceSha256: hash(smaller) }), source);
  assert.deepEqual([bigger.status, bigger.reason], ['unchanged', 'not smaller']);
  assert.equal(makeRecord(file('lossless'), source, { ...ok(source), changed: false }, null).status, 'unchanged');
  // Helper errors land in a public bucket: paths are scrubbed.
  const failed = makeRecord(file('lossless'), source, { ok: false, error: 'cannot open /tmp/secret/x.png' }, null);
  assert.equal(failed.status, 'failed');
  assert.ok(!failed.reason.includes('/tmp'));
});

const manifest = {
  id: 'x/2D/misc',
  version: 'original1234',
  files: [
    { path: 'License.txt', bytes: 10, oid: oid(1), runtime: false, lfs: false, license: true },
    { path: 'coin.png', bytes: 500, oid: oid(2), runtime: true, lfs: true },
    { path: 'Sheets/sheet.png', bytes: 500, oid: oid(3), runtime: true, lfs: true },
    { path: 'Sheets/sheet.xml', bytes: 50, oid: oid(4), runtime: true, lfs: false },
    { path: 'preview.webp', bytes: 99, oid: oid(5), runtime: false, lfs: true },
  ],
};
const eligibleCoin = [{ path: 'coin.png', oid: oid(2), record: 'coin-record' }];
const changedCoin = { status: 'changed', oid: oid(6), bytes: 200, width: 32, height: 32, sourceWidth: 32, sourceHeight: 32 };

test('a variant keeps every path, sibling and licence, and versions only its own files', () => {
  const build = (records) => buildVariant({ packManifest: manifest, eligible: eligibleCoin, records: new Map(records), key: KEY, commit: 'c0ffee', encodedId: 'x--2D--misc' });
  assert.equal(build([]), null, 'incomplete packs are not advertised');
  assert.equal(build([['coin-record', { status: 'unchanged' }]]), null, 'nothing smaller, nothing to advertise');

  const variant = build([['coin-record', changedCoin]]);
  const { files } = variant.manifest;
  assert.deepEqual(files.map((f) => f.path), manifest.files.map((f) => f.path));
  assert.deepEqual(files.filter((f) => f.path !== 'coin.png'), manifest.files.filter((f) => f.path !== 'coin.png'));
  assert.deepEqual(files[1], {
    path: 'coin.png', bytes: 200, oid: oid(6), runtime: true, width: 32, height: 32, sourceOid: oid(2), sourceBytes: 500,
  });
  assert.equal(variant.manifest.originalVersion, 'original1234');
  assert.equal(variant.descriptor.version, packVersion(files));
  assert.notEqual(variant.descriptor.version, packVersion(manifest.files));
  assert.equal(variant.descriptor.totalBytes, 10 + 200 + 500 + 50);
  assert.equal(variant.descriptor.runtimeFileCount, 3);
  assert.equal(variant.descriptor.manifestPath, 'manifest/v2/commits/c0ffee/variants/light/x--2D--misc.json');

  const summary = { id: 'x/2D/misc', version: 'original1234', license: 'CC0-1.0' };
  const advertised = withVariant(summary, variant.descriptor, 'https://example.org/original');
  assert.equal(advertised.version, 'original1234');
  assert.deepEqual(advertised.variants.light, variant.descriptor);
  assert.match(advertised.variantsVersion, /^[0-9a-f]{12}$/);
  assert.deepEqual(withoutVariants(advertised), summary);
});

test('the shared version formula matches the one every published pack was versioned with', () => {
  const files = manifest.files;
  const legacy = createHash('sha256').update(JSON.stringify(
    files.filter((e) => e.runtime || e.license).map((e) => [e.path, e.oid]).sort((a, b) => a[0].localeCompare(b[0])),
  )).digest('hex').slice(0, 12);
  assert.equal(packVersion(files), legacy);
});

test('the mirror copies a variant only when the bucket holds every one of its objects', () => {
  const variant = buildVariant({ packManifest: manifest, eligible: eligibleCoin, records: new Map([['coin-record', changedCoin]]), key: KEY, commit: 'c0ffee', encodedId: 'x--2D--misc' });
  const index = { packs: [withVariant({ id: 'x/2D/misc' }, variant.descriptor, null), { id: 'y/ui' }] };
  const all = variantMirrorPlan(index, [variant.manifest], () => true);
  assert.deepEqual(all.dropped, []);
  assert.deepEqual(all.copies.map(([dest]) => dest).sort(), ['License.txt', 'Sheets/sheet.png', 'Sheets/sheet.xml', 'coin.png']
    .map((p) => `packs/x/2D/misc@${variant.descriptor.version}/${p}`).sort());
  assert.deepEqual(variantMirrorPlan(index, [variant.manifest], (o) => o !== oid(6)), { copies: [], dropped: ['x/2D/misc'] });
  assert.deepEqual(variantMirrorPlan(index, [], () => true).dropped, ['x/2D/misc']);
});

test('the Original artwork link is a commit-pinned public HTTPS page', () => {
  assert.equal(
    originalArtworkUrl('https://github.com/example/assets/', 'abc1234def', 'my pack/2D/misc'),
    'https://github.com/example/assets/tree/abc1234def/my%20pack/2D/misc',
  );
  assert.equal(originalArtworkUrl('http://example.org', 'abc1234def', 'x/ui'), null);
  assert.equal(originalArtworkUrl('https://example.org', 'main', 'x/ui'), null);
});

test('a helper build that does not match the pinned SHA-256 is refused', () => {
  const dir = mkdtempSync(join(tmpdir(), 'light-helper-pin-'));
  try {
    const helper = join(dir, 'prepare-asset.mjs');
    writeFileSync(helper, 'console.log("{}")');
    assert.equal(loadHelper(undefined, hash('x')), null);
    assert.equal(loadHelper(helper, null), null);
    assert.throws(() => loadHelper(helper, 'f'.repeat(64)), /does not match the pinned/);
    assert.ok(loadHelper(helper, hash(readFileSync(helper))));
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

// A stand-in for the published preparation helper, honouring the same JSON argv interface.
const fakeHelper = (sharpUrl, log) => `
import sharp from ${JSON.stringify(sharpUrl)};
import { appendFileSync, readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
const job = JSON.parse(process.argv[2]);
appendFileSync(${JSON.stringify(log)}, job.mode + ' ' + job.source.split('/').pop() + '\\n');
const input = readFileSync(job.source);
const h = (b) => createHash('sha256').update(b).digest('hex');
const base = { ok: true, sourceBytes: input.length, sourceSha256: h(input), recipeVersion: 'fixture-1' };
if (job.mode === 'audio') {
  console.log(JSON.stringify({ ...base, changed: false, bytes: input.length, sha256: h(input), mimeType: 'audio/ogg', reason: 'already small' }));
} else {
  let image = sharp(input);
  if (job.mode === 'resize') image = image.resize(job.width, job.height, { fit: 'inside', withoutEnlargement: true });
  const out = await image.png({ compressionLevel: 9 }).toBuffer();
  writeFileSync(job.destination, out);
  const meta = await sharp(out).metadata();
  console.log(JSON.stringify({ ...base, changed: true, bytes: out.length, sha256: h(out), mimeType: 'image/png', width: meta.width, height: meta.height }));
}
`;

const run = (cwd, script, env = {}) => execFileSync(process.execPath, [join(sourceRoot, 'scripts', script)], {
  cwd, env: { ...process.env, SKIP_PUBLISHED_CHECK: '1', ...env }, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'],
});

async function fixtureRepo(root) {
  const licence = join(sourceRoot, 'kenney-1-bit-pack/2D/misc/License.txt');
  const preview = await sharp({ create: { width: 2, height: 2, channels: 3, background: 'red' } }).webp().toBuffer();
  const selections = {};
  const sprites = 'example-sprites/2D/misc';
  const big = 'example-big/2D/misc';
  const sounds = 'example-sounds/audio';
  for (const id of [sprites, big, sounds]) {
    mkdirSync(join(root, id), { recursive: true });
    cpSync(licence, join(root, id, 'License.txt'));
  }
  for (const id of [sprites, big]) {
    writeFileSync(join(root, id, 'preview.webp'), preview);
    selections[id] = {
      kind: 'original', sourcePath: `${id}/preview.webp`, sourceSha256: hash(preview), sourceUrl: 'https://example.org/assets',
      licenseEvidence: `${id}/License.txt`, description: 'Fixture', outputSha256: hash(preview),
    };
  }
  selections[sounds] = { kind: 'none', reason: 'Sound only' };
  writeFileSync(join(root, sprites, 'coin.png'), await png(120, 80, 0));
  mkdirSync(join(root, sprites, 'Sheets'));
  writeFileSync(join(root, sprites, 'Sheets/sheet.png'), await png(64, 64, 0));
  writeFileSync(join(root, sprites, 'Sheets/sheet.xml'), '<TextureAtlas imagePath="sheet.png"/>');
  writeFileSync(join(root, big, 'backdrop.png'), await png(300, 200, 0));
  writeFileSync(join(root, sounds, 'jump.ogg'), Buffer.from('OggS fixture sound'));
  writeFileSync(join(root, 'preview-sources.json'), JSON.stringify({ schemaVersion: 1, packs: selections }));
  execFileSync('git', ['init', '-q'], { cwd: root });
  execFileSync('git', ['add', '.'], { cwd: root });
  execFileSync('git', ['-c', 'user.name=Fixture', '-c', 'user.email=fixture@example.org', '-c', 'commit.gpgsign=false', 'commit', '-qm', 'fixture'], { cwd: root });
  return { sprites, big, sounds };
}

const snapshot = (root) => {
  const read = (p) => readFileSync(join(root, p), 'utf8');
  const commit = JSON.parse(read('manifest/v2/index.json')).commit;
  const packsDir = `manifest/v2/commits/${commit}/packs`;
  return {
    commit,
    legacyIndex: JSON.parse(read('manifest/index.json')).packs,
    legacyFiles: read('manifest/files.json'),
    v2Index: JSON.parse(read('manifest/v2/index.json')),
    v2Files: read(`manifest/v2/commits/${commit}/files.json`),
    packs: Object.fromEntries(readdirSync(join(root, packsDir)).map((n) => [n, read(`${packsDir}/${n}`)])),
  };
};

test('end to end: originals stay byte-identical, variants are additive, cached, and mirror-checked', async () => {
  const root = mkdtempSync(join(tmpdir(), 'light-variants-e2e-'));
  try {
    const { sprites, big, sounds } = await fixtureRepo(root);
    run(root, 'build-manifest.mjs');
    const before = snapshot(root);

    const helperLog = join(root, '.helper.log');
    const helperPath = join(root, '.helper.mjs');
    writeFileSync(helperPath, fakeHelper(import.meta.resolve('sharp'), helperLog));
    writeFileSync(join(root, RECIPE_FILE), JSON.stringify(recipe({
      [sprites]: { images: 'lossless' },
      [big]: { images: 'resize', maxDimension: 64 },
      [sounds]: { audio: 'non-looping' },
    }, hash(readFileSync(helperPath)))));
    const store = join(root, '.store');
    const env = { LIGHT_VARIANT_STORE: store, LIGHT_VARIANT_HELPER: helperPath, ASSET_REPO_URL: 'https://github.com/example/assets' };
    run(root, 'build-light-variants.mjs', env);
    const after = snapshot(root);

    // Everything an existing consumer reads is untouched.
    for (const key of ['legacyIndex', 'legacyFiles', 'v2Files', 'packs']) assert.deepEqual(after[key], before[key], key);
    const strip = after.v2Index.packs.map(withoutVariants);
    assert.deepEqual({ ...after.v2Index, packs: strip }, before.v2Index);
    assert.deepEqual(after.legacyIndex.map((p) => Object.keys(p).filter((k) => k.startsWith('variant'))).flat(), []);

    const byId = new Map(after.v2Index.packs.map((p) => [p.id, p]));
    assert.equal(byId.get(sounds).variants, undefined, 'unchanged audio keeps its original');
    const spriteLight = byId.get(sprites).variants.light;
    assert.equal(byId.get(sprites).variants.originalUrl, `https://github.com/example/assets/tree/${after.commit}/${sprites}`);
    assert.ok(spriteLight.totalBytes < byId.get(sprites).totalBytes);
    const variant = JSON.parse(readFileSync(join(root, spriteLight.manifestPath), 'utf8'));
    const original = JSON.parse(after.packs['example-sprites--2D--misc.json']);
    assert.deepEqual(variant.files.map((f) => f.path), original.files.map((f) => f.path));
    const pick = (files, path) => files.find((f) => f.path === path);
    assert.deepEqual(pick(variant.files, 'Sheets/sheet.png'), pick(original.files, 'Sheets/sheet.png'), 'atlas page untouched');
    assert.deepEqual(pick(variant.files, 'License.txt'), pick(original.files, 'License.txt'));
    const coin = pick(variant.files, 'coin.png');
    assert.deepEqual([coin.width, coin.height, coin.sourceOid], [120, 80, pick(original.files, 'coin.png').oid]);
    assert.equal(hash(readFileSync(join(store, 'objects', coin.oid))), coin.oid);
    const backdrop = pick(JSON.parse(readFileSync(join(root, byId.get(big).variants.light.manifestPath), 'utf8')).files, 'backdrop.png');
    assert.deepEqual([backdrop.width, backdrop.height], [64, 43]);
    assert.equal(readFileSync(helperLog, 'utf8').trim().split('\n').length, 3, 'one conversion per eligible source');

    // A rebuild converts nothing and publishes the same variants, with or without the helper.
    run(root, 'build-manifest.mjs');
    run(root, 'build-light-variants.mjs', env);
    run(root, 'build-manifest.mjs');
    run(root, 'build-light-variants.mjs', { ...env, LIGHT_VARIANT_HELPER: '' });
    assert.equal(readFileSync(helperLog, 'utf8').trim().split('\n').length, 3);
    const rebuilt = JSON.parse(readFileSync(join(root, 'manifest/v2/index.json'), 'utf8'));
    assert.deepEqual(rebuilt.packs.map((p) => p.variants?.light?.version), after.v2Index.packs.map((p) => p.variants?.light?.version));

    // The mirror, with gcloud and git stubbed: path copies for the variant only when its objects exist.
    const mirror = (objectsInBucket) => {
      const bin = join(root, '.bin');
      mkdirSync(bin, { recursive: true });
      writeFileSync(join(root, '.objects'), objectsInBucket.join('\n'));
      writeFileSync(join(bin, 'gcloud'), `#!${process.execPath}
const fs = require('node:fs'); const path = require('node:path');
const args = process.argv.slice(2);
fs.appendFileSync('.gcloud.log', JSON.stringify(args) + '\\n');
if (args[1] === 'ls' && args[2].endsWith('/objects/*')) {
  for (const o of fs.readFileSync('.objects', 'utf8').split('\\n')) console.log('gs://b/objects/' + o);
} else if (args[1] === 'ls' && args[2].endsWith('/packs/**')) {
  // Every path copy already exists, so the stubbed run never calls the rewrite API.
  const index = JSON.parse(fs.readFileSync('manifest/v2/index.json', 'utf8'));
  const base = path.join('manifest/v2/commits', index.commit);
  const dirs = [path.join(base, 'packs'), path.join(base, 'variants/light')].filter((d) => fs.existsSync(d));
  for (const d of dirs) for (const n of fs.readdirSync(d)) {
    const m = JSON.parse(fs.readFileSync(path.join(d, n), 'utf8'));
    for (const f of m.files) console.log('gs://b/packs/' + m.id + '@' + m.version + '/' + f.path);
  }
}
`, { mode: 0o755 });
      writeFileSync(join(bin, 'git'), `#!${process.execPath}\n`, { mode: 0o755 });
      execFileSync(process.execPath, [join(sourceRoot, 'scripts/mirror-to-gcs.mjs')], {
        cwd: root, env: { ...process.env, ASSET_BUCKET: 'gs://b', PATH: `${bin}:${process.env.PATH}` }, stdio: 'pipe',
      });
      return JSON.parse(readFileSync(join(root, 'manifest/v2/index.json'), 'utf8'));
    };
    const derived = readdirSync(join(store, 'objects'));
    const originals = Object.values(after.packs).flatMap((m) => JSON.parse(m).files.map((f) => f.oid));
    const published = mirror([...originals, ...derived]);
    assert.ok(published.packs.find((p) => p.id === sprites).variants);

    run(root, 'build-manifest.mjs');
    run(root, 'build-light-variants.mjs', env);
    const fallback = mirror(originals);
    assert.deepEqual(fallback.packs.map((p) => p.variants), fallback.packs.map(() => undefined));
    assert.deepEqual(fallback.packs.map(withoutVariants), before.v2Index.packs);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('without a pinned helper or a store the build publishes originals only', async () => {
  const root = mkdtempSync(join(tmpdir(), 'light-variants-off-'));
  try {
    await fixtureRepo(root);
    cpSync(join(sourceRoot, RECIPE_FILE), join(root, RECIPE_FILE));
    run(root, 'build-manifest.mjs');
    const before = readFileSync(join(root, 'manifest/v2/index.json'), 'utf8');
    assert.match(run(root, 'build-light-variants.mjs', { LIGHT_VARIANT_STORE: join(root, '.store') }), /originals only/);
    assert.equal(readFileSync(join(root, 'manifest/v2/index.json'), 'utf8'), before);
    assert.ok(!existsSync(join(root, '.store')));
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
