import assert from 'node:assert/strict';
import test from 'node:test';
import {
  selectPreview,
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
