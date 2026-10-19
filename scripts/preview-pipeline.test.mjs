import assert from 'node:assert/strict';
import test from 'node:test';
import {
  mkdtempSync,
  mkdirSync,
  writeFileSync,
  readFileSync,
  cpSync,
  rmSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import sharp from 'sharp';

const sourceRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const hash = (data) => createHash('sha256').update(data).digest('hex');
const run = (cwd, file) =>
  execFileSync(process.execPath, [join(sourceRoot, 'scripts', file)], {
    cwd,
    env: { ...process.env, SKIP_PUBLISHED_CHECK: '1' },
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'pipe'],
  });

test('preview-only edits keep runtime files, versions, counts, bytes and legacy membership unchanged', async () => {
  const root = mkdtempSync(join(tmpdir(), 'asset-preview-test-'));
  try {
    const id = 'example/2D/misc';
    mkdirSync(join(root, id), { recursive: true });
    cpSync(
      join(sourceRoot, 'kenney-1-bit-pack/2D/misc/License.txt'),
      join(root, id, 'License.txt'),
    );
    const sprite = Buffer.from('real game sprite fixture');
    writeFileSync(join(root, id, 'sprite.png'), sprite);
    const image = await sharp({
      create: { width: 3, height: 2, channels: 3, background: 'red' },
    })
      .webp()
      .toBuffer();
    const config = {
      schemaVersion: 1,
      packs: {
        [id]: {
          kind: 'original',
          sourcePath: `${id}/sprite.png`,
          sourceSha256: hash(sprite),
          sourceUrl: 'https://example.org/assets',
          licenseEvidence: `${id}/License.txt`,
          description: 'Original artwork',
          outputSha256: hash(image),
          gallery: ['sprite.png'],
        },
      },
    };
    writeFileSync(join(root, id, 'preview.webp'), image);
    writeFileSync(join(root, 'preview-sources.json'), JSON.stringify(config));
    execFileSync('git', ['init', '-q'], { cwd: root });
    execFileSync('git', ['add', '.'], { cwd: root });
    execFileSync(
      'git',
      [
        '-c',
        'user.name=Fixture',
        '-c',
        'user.email=fixture@example.org',
        '-c',
        'commit.gpgsign=false',
        'commit',
        '-qm',
        'fixture',
      ],
      { cwd: root },
    );
    run(root, 'build-manifest.mjs');
    const first = JSON.parse(
      readFileSync(join(root, 'manifest/v2/index.json')),
    );
    const filesPath = join(
      root,
      `manifest/v2/commits/${first.commit}/packs/example--2D--misc.json`,
    );
    const firstFiles = JSON.parse(readFileSync(filesPath)).files;
    // The gallery names a runtime file, so the index carries its existing object id.
    assert.deepEqual(first.packs[0].galleryOids, [hash(sprite)]);
    const updated = await sharp(image).negate().webp().toBuffer();
    writeFileSync(join(root, id, 'preview.webp'), updated);
    config.packs[id].outputSha256 = hash(updated);
    writeFileSync(join(root, 'preview-sources.json'), JSON.stringify(config));
    run(root, 'build-manifest.mjs');
    const second = JSON.parse(
      readFileSync(join(root, 'manifest/v2/index.json')),
    );
    const stripPreview = ({ previewOid, ...pack }) => pack;
    assert.deepEqual(
      first.packs.map(stripPreview),
      second.packs.map(stripPreview),
    );
    assert.notEqual(first.packs[0].previewOid, second.packs[0].previewOid);
    const files = JSON.parse(readFileSync(filesPath)).files;
    assert.deepEqual(
      firstFiles.filter((f) => f.runtime || f.license),
      files.filter((f) => f.runtime || f.license),
    );
    assert.equal(files.find((f) => f.path === 'preview.webp').runtime, false);
    assert.equal(second.packs[0].fileCount, 2);
    assert.equal(second.packs[0].runtimeFileCount, 1);
    assert.equal(
      JSON.parse(readFileSync(join(root, 'manifest/index.json'))).packs.length,
      1,
    );
    // A pointer-only checkout must build the exact same catalog without decoding any images.
    writeFileSync(
      join(root, id, 'preview.webp'),
      `version https://git-lfs.github.com/spec/v1\noid sha256:${hash(updated)}\nsize ${updated.length}\n`,
    );
    run(root, 'build-manifest.mjs');
    assert.deepEqual(
      JSON.parse(readFileSync(join(root, 'manifest/v2/index.json'))).packs,
      second.packs,
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('mirror sends the preview WebP and non-runtime gallery images with immutable caching before publishing the index', () => {
  const root = mkdtempSync(join(tmpdir(), 'asset-preview-mirror-'));
  try {
    const id = 'example/2D/misc';
    const commit = 'abc123';
    const bytes = Buffer.from('already validated WebP fixture');
    const oid = hash(bytes);
    const sample = Buffer.from('creator sample scene, not a runtime file');
    const sampleOid = hash(sample);
    const source = Buffer.from('editable source art, not in the gallery');
    for (const dir of [
      id,
      'bin',
      'manifest/packs',
      `manifest/v2/commits/${commit}/packs`,
    ])
      mkdirSync(join(root, dir), { recursive: true });
    writeFileSync(join(root, id, 'preview.webp'), bytes);
    writeFileSync(join(root, id, 'Sample.png'), sample);
    writeFileSync(join(root, id, 'source.jpg'), source);
    writeFileSync(
      join(root, 'manifest/v2/index.json'),
      JSON.stringify({
        commit,
        packs: [{ id, previewOid: oid, galleryOids: [sampleOid] }],
      }),
    );
    writeFileSync(
      join(root, `manifest/v2/commits/${commit}/packs/example.json`),
      JSON.stringify({
        id,
        version: 'unchanged',
        files: [
          { path: 'preview.webp', oid, runtime: false },
          { path: 'Sample.png', oid: sampleOid, runtime: false },
          { path: 'source.jpg', oid: hash(source), runtime: false },
        ],
      }),
    );
    const log = join(root, 'commands.jsonl');
    for (const binary of ['gcloud', 'git']) {
      writeFileSync(
        join(root, 'bin', binary),
        `#!${process.execPath}\nrequire('node:fs').appendFileSync(${JSON.stringify(log)}, JSON.stringify({binary:${JSON.stringify(binary)},args:process.argv.slice(2)})+'\\n');\n`,
        { mode: 0o755 },
      );
    }
    execFileSync(
      process.execPath,
      [join(sourceRoot, 'scripts/mirror-to-gcs.mjs')],
      {
        cwd: root,
        env: {
          ...process.env,
          PATH: `${join(root, 'bin')}:${process.env.PATH}`,
        },
        stdio: 'pipe',
      },
    );
    const commands = readFileSync(log, 'utf8')
      .trim()
      .split('\n')
      .map(JSON.parse);
    const upload = commands.findIndex((c) =>
      c.args.includes('--content-type=image/webp'),
    );
    assert.ok(upload >= 0);
    // The gallery's sample scene is published; other non-runtime art is not.
    assert.ok(commands.some((c) => c.args.includes('--content-type=image/png')));
    assert.ok(!commands.some((c) => c.args.includes('--content-type=image/jpeg')));
    assert.ok(
      commands[upload].args.includes(
        '--cache-control=public, max-age=31536000, immutable',
      ),
    );
    const indexPublish = commands.findIndex((c) =>
      c.args.some(
        (arg) =>
          !arg.startsWith('gs://') && arg.endsWith('/manifest/v2/index.json'),
      ),
    );
    assert.ok(indexPublish > upload);
    assert.ok(
      !commands.some((c) =>
        c.args.some((arg) => arg.includes('print-access-token')),
      ),
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('a crop squares the thumbnail and names itself in the recipe', async () => {
  const root = mkdtempSync(join(tmpdir(), 'asset-preview-crop-'));
  try {
    const id = 'example/2D/misc';
    mkdirSync(join(root, id), { recursive: true });
    const source = await sharp({
      create: { width: 900, height: 500, channels: 3, background: 'blue' },
    })
      .png()
      .toBuffer();
    writeFileSync(join(root, id, 'Sample.png'), source);
    const selection = {
      kind: 'original',
      sourcePath: `${id}/Sample.png`,
      sourceSha256: hash(source),
      sourceUrl: 'https://example.org/assets',
      licenseEvidence: `${id}/License.txt`,
      description: 'Bundled sample scene',
      crop: { left: 200, top: 0, size: 500 },
    };
    writeFileSync(
      join(root, 'preview-sources.json'),
      JSON.stringify({ schemaVersion: 1, packs: { [id]: selection } }),
    );
    run(root, 'generate-previews.mjs');
    const written = JSON.parse(
      readFileSync(join(root, 'preview-sources.json')),
    ).packs[id];
    const output = readFileSync(join(root, id, 'preview.webp'));
    const metadata = await sharp(output).metadata();
    assert.equal(metadata.width, 500);
    assert.equal(metadata.height, 500);
    assert.equal(written.width, 500);
    assert.equal(written.outputSha256, hash(output));
    assert.match(written.recipe, /-frame0-crop200_0_500$/);
    const report = run(root, 'check-previews.mjs');
    assert.doesNotMatch(report, /not square/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
