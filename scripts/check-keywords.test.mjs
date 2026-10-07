import { test } from 'node:test';
import assert from 'node:assert/strict';
import { keywordReport } from './check-keywords.mjs';

const pack = (id, keywords) => ({ id, ...(keywords ? { keywords } : {}) });

test('warns only for touched packs with too few keywords', () => {
  const packs = [
    pack('new-pack/2D/misc', ['tile']),
    pack('old-pack/2D/misc'),
    pack('good-pack/2D/misc', ['coin', 'gem', 'chest']),
  ];
  const { thin } = keywordReport(packs, new Set(['new-pack', 'good-pack']));
  assert.deepEqual(thin.map((p) => p.id), ['new-pack/2D/misc']);
});

test('fails when most packs lose their keywords', () => {
  assert.equal(keywordReport([pack('a/audio'), pack('b/audio'), pack('c/audio', ['click'])], new Set()).stoppedEmitting, true);
  assert.equal(keywordReport([pack('a/audio'), pack('b/audio', ['jump']), pack('c/audio', ['click'])], new Set()).stoppedEmitting, false);
});
