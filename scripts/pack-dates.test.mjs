import assert from 'node:assert/strict';
import test from 'node:test';
import { BACKFILL_CUTOFF, isBackfilled, oldestDateInLog } from './pack-dates.mjs';

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
