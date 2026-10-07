import { test } from 'node:test';
import assert from 'node:assert/strict';
import { packKeywords, pathWords } from './pack-keywords.mjs';

test('splits folders, camelCase, separators and digits into words', () => {
  assert.deepEqual(pathWords('Characters/playerShip1_blue.png'), ['characters', 'player', 'ship', 'blue']);
  assert.deepEqual(pathWords('tile_0001.png'), ['tile']);
  assert.deepEqual(pathWords('Models/GLB format/coinGold.glb'), ['coin', 'gold']);
});

test('drops file-format and size words', () => {
  assert.deepEqual(pathWords('Spritesheets/spritesheet_large_retina.png'), []);
});

test('orders words by how many files carry them', () => {
  const paths = ['coin_gold.png', 'coin_silver.png', 'enemy_slime.png', 'coinBronze.png'];
  assert.deepEqual(packKeywords(paths), ['coin', 'bronze', 'enemy', 'gold', 'silver', 'slime']);
});

test('caps the list', () => {
  const paths = Array.from({ length: 10 }, (_, i) => `word${String.fromCharCode(97 + i)}aa.png`);
  assert.equal(packKeywords(paths, 3).length, 3);
});
