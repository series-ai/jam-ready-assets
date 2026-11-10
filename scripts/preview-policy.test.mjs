import assert from 'node:assert/strict';
import test from 'node:test';
import {
  selectGallery,
  selectPreview,
  selectionRecipeSuffix,
  validateSelection,
  localSourcePath,
  PREVIEW_MAX_BYTES,
} from './preview-policy.mjs';

const oid = 'a'.repeat(64);
const selection = {
  kind: 'original',
  sourcePath: 'pack/Preview.png',
  sourceSha256: oid,
  outputSha256: oid,
  sourceUrl: 'https://creator.example/pack',
  licenseEvidence: 'pack/License.txt',
  description: 'Original cover',
};
const preview = { path: 'preview.webp', oid, bytes: 1024, runtime: false };

test('requires an explicit reviewed derivative even when textures or named previews exist', () => {
  const textures = [
    { ...preview, path: 'texture.png', runtime: true },
    { ...preview, path: 'Preview.png' },
  ];
  assert.throws(
    () => selectPreview('pack', '3d', textures, selection),
    /missing, stale/,
  );
  assert.throws(
    () => selectPreview('pack', '3d', [preview], undefined),
    /missing explicit/,
  );
  assert.equal(
    selectPreview('pack', '3d', [...textures, preview], selection),
    preview,
  );
});

test('rejects stale hashes, excessive bytes, empty files and importable thumbnails', () => {
  for (const changed of [
    { oid: 'b'.repeat(64) },
    { bytes: PREVIEW_MAX_BYTES + 1 },
    { bytes: 0 },
    { runtime: true },
  ]) {
    assert.throws(
      () =>
        selectPreview('pack', '2d', [{ ...preview, ...changed }], selection),
      /missing, stale/,
    );
  }
});

test('only audio may explicitly have no art and stale files are rejected', () => {
  const none = { kind: 'none', reason: 'No soundtrack cover supplied' };
  assert.equal(selectPreview('pack', 'audio', [], none), null);
  assert.throws(() => selectPreview('pack', '2d', [], none), /only audio/);
  assert.throws(
    () => selectPreview('pack', 'audio', [preview], none),
    /unexpected preview/,
  );
});

test('sources stay inside the repository', () => {
  assert.equal(
    localSourcePath('/tmp/catalog', '.preview-sources/cover.png'),
    '/tmp/catalog/.preview-sources/cover.png',
  );
  for (const path of ['../secret', '/tmp/secret', '', 'a\\b']) {
    assert.throws(() => localSourcePath('/tmp/catalog', path));
  }
});

test('a gallery lists the pack\'s own images and yields their object ids', () => {
  const entries = [
    { path: 'Samples/a.png', oid: 'b'.repeat(64), bytes: 2048, runtime: true },
    { path: 'Samples/b.jpg', oid: 'c'.repeat(64), bytes: 2048, runtime: true },
    { path: 'Samples/model.glb', oid: 'd'.repeat(64), bytes: 2048, runtime: true },
    { path: 'Samples/scene.png', oid: 'e'.repeat(64), bytes: 2048, runtime: false },
    { path: 'License.txt', oid: '1'.repeat(64), bytes: 20, runtime: false, license: true },
    { path: 'preview.webp', oid: '2'.repeat(64), bytes: 2048, runtime: false },
    { path: 'Samples/huge.png', oid: 'f'.repeat(64), bytes: 2 * 1024 * 1024, runtime: true },
  ];
  assert.deepEqual(selectGallery('pack', entries, undefined), []);
  assert.deepEqual(selectGallery('pack', entries, ['Samples/b.jpg', 'Samples/a.png']), [
    'c'.repeat(64),
    'b'.repeat(64),
  ]);
  assert.throws(() => selectGallery('pack', entries, []), /1-6 distinct/);
  assert.throws(() => selectGallery('pack', entries, ['Samples/a.png', 'Samples/a.png']), /distinct/);
  assert.throws(() => selectGallery('pack', entries, Array(7).fill('x')), /1-6/);
  // A sample scene that ships outside the runtime files still qualifies.
  assert.deepEqual(selectGallery('pack', entries, ['Samples/scene.png']), ['e'.repeat(64)]);
  assert.throws(() => selectGallery('pack', entries, ['missing.png']), /not an image file/);
  assert.throws(() => selectGallery('pack', entries, ['License.txt']), /not an image file/);
  assert.throws(() => selectGallery('pack', entries, ['preview.webp']), /not an image file/);
  assert.throws(() => selectGallery('pack', entries, ['Samples/model.glb']), /not a PNG/);
  assert.throws(() => selectGallery('pack', entries, ['Samples/huge.png']), /over 1 MiB/);
});

test('a crop is a square in source pixels and changes the recipe', () => {
  assert.equal(selectionRecipeSuffix(selection), '-frame0');
  assert.equal(
    selectionRecipeSuffix({ ...selection, frame: 2, crop: { left: 10, top: 0, size: 288 } }),
    '-frame2-crop10_0_288',
  );
  validateSelection('pack', { ...selection, crop: { left: 0, top: 4, size: 100 } }, '2d');
  for (const crop of [
    { left: 0, top: 0 },
    { left: -1, top: 0, size: 10 },
    { left: 0, top: 0, size: 0 },
    { left: 0, top: 0, size: 10, width: 20 },
    { left: 0.5, top: 0, size: 10 },
  ]) {
    assert.throws(() => validateSelection('pack', { ...selection, crop }, '2d'), /crop must be/);
  }
});
