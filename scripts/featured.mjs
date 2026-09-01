// The hand-written curation block that selects packs to feature in RUN.studio's
// Assets panel, where they appear in a highlighted section at the top of the
// pack list. Authored in `featured.json` at the repo root, validated here, and
// embedded into manifest/v2/index.json. Deleting the file (or letting endsAt
// pass — Studio checks it client-side) removes the featured section; neither
// needs a deploy.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

export const FEATURED_FILE = 'featured.json';

// Word limits keep the featured section's title to one line and its blurb to
// at most two lines at Studio's narrowest 400px panel width.
const MAX_TITLE_WORDS = 4;
const MAX_BLURB_WORDS = 14;

/** How many whitespace-separated words the text contains. */
function wordCount(text) {
  const rawParts = text.trim().split(/\s+/);
  const words = rawParts.filter((word) => word.length > 0);
  return words.length;
}

/**
 * Validates a parsed featured.json block against the built pack index.
 * Returns { featured } with exactly the fields the manifest publishes, or
 * { error } naming every problem at once. Unknown pack ids are an error, not
 * a filter: a typo that silently dropped a pack would go unnoticed forever.
 */
export function validateFeaturedCuration(raw, knownPackIds) {
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
    return { error: `${FEATURED_FILE}: must be a JSON object with title, blurb, packIds and optional endsAt` };
  }
  const problems = [];
  if (typeof raw.title !== 'string' || raw.title.trim().length === 0) {
    problems.push('title must be a non-empty string');
  } else if (wordCount(raw.title) > MAX_TITLE_WORDS) {
    problems.push(`title must be at most ${MAX_TITLE_WORDS} words (one line in the featured section), got ${wordCount(raw.title)}`);
  }
  if (typeof raw.blurb !== 'string' || raw.blurb.trim().length === 0) {
    problems.push('blurb must be a non-empty string');
  } else if (wordCount(raw.blurb) > MAX_BLURB_WORDS) {
    problems.push(`blurb must be at most ${MAX_BLURB_WORDS} words (two lines at 400px), got ${wordCount(raw.blurb)}`);
  }
  if (raw.endsAt !== undefined && (typeof raw.endsAt !== 'string' || Number.isNaN(Date.parse(raw.endsAt)))) {
    problems.push('endsAt must be an ISO date string when present, e.g. 2026-09-06T00:00:00Z');
  }
  if (!Array.isArray(raw.packIds) || raw.packIds.length === 0 || raw.packIds.some((id) => typeof id !== 'string')) {
    problems.push('packIds must be a non-empty array of pack id strings; packs are displayed in array order');
  } else {
    const unknownIds = raw.packIds.filter((id) => !knownPackIds.has(id));
    if (unknownIds.length > 0) {
      problems.push(`packIds not in the catalogue (typo, or the pack was rejected): ${unknownIds.join(', ')}`);
    }
    const duplicateIds = raw.packIds.filter((id, position) => raw.packIds.indexOf(id) !== position);
    if (duplicateIds.length > 0) {
      problems.push(`duplicate packIds: ${[...new Set(duplicateIds)].join(', ')}`);
    }
  }
  if (problems.length > 0) {
    return { error: `${FEATURED_FILE}: ${problems.join('; ')}` };
  }
  return {
    featured: {
      title: raw.title.trim(),
      blurb: raw.blurb.trim(),
      ...(raw.endsAt !== undefined ? { endsAt: raw.endsAt } : {}),
      packIds: raw.packIds,
    },
  };
}

/**
 * Reads and validates the repo's featured.json. Returns null when the file
 * does not exist (no curation — the normal state most of the year),
 * { featured } when valid, and { error } for unreadable JSON or an invalid block.
 */
export function readFeaturedCuration(rootDir, knownPackIds) {
  let text;
  try {
    text = readFileSync(join(rootDir, FEATURED_FILE), 'utf8');
  } catch (err) {
    if (err.code === 'ENOENT') return null;
    return { error: `${FEATURED_FILE}: ${err.message}` };
  }
  let raw;
  try {
    raw = JSON.parse(text);
  } catch (err) {
    return { error: `${FEATURED_FILE}: invalid JSON — ${err.message}` };
  }
  return validateFeaturedCuration(raw, knownPackIds);
}
