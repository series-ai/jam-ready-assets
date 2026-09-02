import assert from 'node:assert/strict';
import test from 'node:test';
import { validateFeaturedCuration } from './featured.mjs';

const KNOWN_IDS = new Set([
  '2D/pirate/proofofplay-pirate-tiles',
  '3D/pirate/proofofplay-pirate-ships',
  'audio/kenney-music-jingles',
]);

const VALID = {
  title: 'Pirate Jam',
  blurb: 'Ships, tiles and jingles picked for the pirate jam.',
  endsAt: '2026-09-06T00:00:00Z',
  packIds: ['3D/pirate/proofofplay-pirate-ships', '2D/pirate/proofofplay-pirate-tiles'],
};

test('accepts a valid block and preserves packIds order (shelf order)', () => {
  const verdict = validateFeaturedCuration(VALID, KNOWN_IDS);
  assert.equal(verdict.error, undefined);
  assert.deepEqual(verdict.featured, VALID);
});

test('endsAt is optional — an open-ended curation is valid', () => {
  const { endsAt, ...openEnded } = VALID;
  const verdict = validateFeaturedCuration(openEnded, KNOWN_IDS);
  assert.equal(verdict.error, undefined);
  assert.equal(verdict.featured.endsAt, undefined);
});

test('rejects an unknown pack id by name instead of silently dropping it', () => {
  const withTypo = { ...VALID, packIds: [...VALID.packIds, '3D/pirate/proofofplay-pirate-shipz'] };
  const verdict = validateFeaturedCuration(withTypo, KNOWN_IDS);
  assert.match(verdict.error, /proofofplay-pirate-shipz/);
});

test('rejects duplicate pack ids', () => {
  const withDuplicate = { ...VALID, packIds: [VALID.packIds[0], VALID.packIds[0]] };
  const verdict = validateFeaturedCuration(withDuplicate, KNOWN_IDS);
  assert.match(verdict.error, /duplicate/);
});

test('enforces the copy budget: 4-word title, 14-word blurb', () => {
  const longTitle = { ...VALID, title: 'The Very Long Pirate Jam Title' };
  assert.match(validateFeaturedCuration(longTitle, KNOWN_IDS).error, /title must be at most 4 words/);

  const longBlurb = {
    ...VALID,
    blurb: 'This blurb rambles on for far too many words to ever fit on two lines at four hundred pixels.',
  };
  assert.match(validateFeaturedCuration(longBlurb, KNOWN_IDS).error, /blurb must be at most 14 words/);
});

test('rejects a malformed endsAt and an empty packIds list', () => {
  assert.match(
    validateFeaturedCuration({ ...VALID, endsAt: 'next sunday' }, KNOWN_IDS).error,
    /endsAt must be an ISO date/,
  );
  assert.match(
    validateFeaturedCuration({ ...VALID, packIds: [] }, KNOWN_IDS).error,
    /packIds must be a non-empty array/,
  );
});

test('rejects non-object roots and collects every problem in one message', () => {
  assert.match(validateFeaturedCuration([], KNOWN_IDS).error, /must be a JSON object/);
  const allWrong = { title: '', blurb: '', packIds: 'nope' };
  const verdict = validateFeaturedCuration(allWrong, KNOWN_IDS);
  assert.match(verdict.error, /title/);
  assert.match(verdict.error, /blurb/);
  assert.match(verdict.error, /packIds/);
});
