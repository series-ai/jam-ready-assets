import assert from 'node:assert/strict';
import test from 'node:test';
import { BACKFILL_CUTOFF, isBackfilled, oldestDateInLog, preReorgPackPaths } from './pack-dates.mjs';

test('a pack first published before the cutoff is backfilled, after it is not', () => {
  assert.equal(isBackfilled('2026-08-01T10:00:00Z'), true);
  assert.equal(isBackfilled('2026-09-15T10:00:00Z'), false);
});

test('the cutoff itself is not backfilled (strictly-before comparison)', () => {
  assert.equal(isBackfilled(BACKFILL_CUTOFF), false);
});

test('oldestDateInLog takes the last line of newest-first git log output', () => {
  const log = '2026-08-30T12:00:00+00:00\n2026-08-24T09:00:00+00:00\n2026-08-20T15:30:00+00:00\n';
  assert.equal(oldestDateInLog(log), '2026-08-20T15:30:00+00:00');
});

test('oldestDateInLog returns null for a path with no history', () => {
  assert.equal(oldestDateInLog(''), null);
  assert.equal(oldestDateInLog('\n\n'), null);
});

test('preReorgPackPaths inverts a themed pack id to its bucket-first path', () => {
  assert.deepEqual(
    preReorgPackPaths('kenney-character-pack/2D/characters'),
    ['2D/characters/kenney-character-pack'],
  );
});

test('preReorgPackPaths inverts a flat-bucket pack id', () => {
  assert.deepEqual(preReorgPackPaths('kenney-fonts/fonts'), ['fonts/kenney-fonts']);
});

test('preReorgPackPaths adds the alias for packs the reorg also renamed', () => {
  assert.deepEqual(
    preReorgPackPaths('proofofplay-pirate-nation/icons'),
    ['icons/proofofplay-pirate-nation', 'ui/proofofplay-pirate-nation-icons'],
  );
});
