// First-publish dates for packs, reconstructed from git history at build time.
// Deterministic across pushes: a pack's first-add commit never changes, so an
// unchanged pack keeps its `addedAt` forever without any registry to maintain.
import { execSync } from 'node:child_process';

/**
 * Packs first published before this moment are marked `backfilled: true` in
 * the manifest. Their dates were reconstructed in bulk when this feature was
 * added, and hundreds of packs share a handful of import commits — without
 * the flag, RUN.studio would show its NEW badge on almost every pack at once.
 * Only packs added after the cutoff can get the badge.
 */
export const BACKFILL_CUTOFF = '2026-09-02T00:00:00Z';

/** Whether a pack's first-publish date predates the backfill cutoff. */
export function isBackfilled(addedAtIso) {
  return Date.parse(addedAtIso) < Date.parse(BACKFILL_CUTOFF);
}

/**
 * The oldest date in `git log --format=%cI` output (git lists newest first).
 * Returns null for empty output (a path git has no history for).
 */
export function oldestDateInLog(gitLogOutput) {
  const outputLines = gitLogOutput.split('\n');
  const dateLines = outputLines.filter((line) => line.trim().length > 0);
  if (dateLines.length === 0) return null;
  return dateLines[dateLines.length - 1].trim();
}

/**
 * True when the checkout has truncated history. In a shallow clone every
 * pack's first-add date would wrongly become the date of the oldest available
 * commit, so callers must omit dates entirely rather than publish wrong ones.
 */
export function isShallowClone() {
  return execSync('git rev-parse --is-shallow-repository', { encoding: 'utf8' }).trim() === 'true';
}

/**
 * ISO committer date of the first commit that added files under the pack's
 * directory. Returns null when git has no such commit, which can happen for a
 * renamed pack directory because the log does not follow renames.
 */
export function packAddedAt(packId) {
  const log = execSync(`git log --diff-filter=A --format=%cI -- "${packId}"`, {
    encoding: 'utf8',
  });
  return oldestDateInLog(log);
}
