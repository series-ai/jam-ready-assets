// First-publish dates for packs, reconstructed from git history at build time.
// Deterministic across pushes: a pack's first-add commit never changes, so an
// unchanged pack keeps its `addedAt` forever without any registry to maintain.
import { execFileSync, execSync } from 'node:child_process';

/**
 * Packs first published before this moment are marked `backfilled: true` in
 * the manifest, and RUN.studio suppresses their NEW badge forever. The cutoff
 * sits just after the 2026-05-28 bulk import that seeded the library, whose
 * hundreds of packs share a handful of import commits — without the flag they
 * could all badge at once. Packs added organically since then carry real
 * first-add dates and may badge. The feature-ship date would be the wrong
 * cutoff: it would also suppress packs genuinely added in the weeks before
 * the badge launched (barker, pirate-nation).
 */
export const BACKFILL_CUTOFF = '2026-06-01T00:00:00Z';

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
 * ISO committer date of the first commit that added files under any of the
 * given directories. Callers pass the pack's current path plus its pre-reorg
 * paths (see preReorgPackPaths), because the log does not follow renames: a
 * moved pack's current path alone would date it at the move, not its first
 * publish. Returns null when git has no such commit for any path.
 */
export function packAddedAt(packPaths) {
  const log = execFileSync('git', ['log', '--diff-filter=A', '--format=%cI', '--', ...packPaths], {
    encoding: 'utf8',
  });
  return oldestDateInLog(log);
}

/**
 * Packs that moved without following the mechanical bucket-first-to-pack-first
 * inversion, mapped from their current id to their pre-reorg directory.
 */
const PRE_REORG_ALIASES = {
  'proofofplay-pirate-nation/3D/pirate': '3D/pirate/proofofplay-pirate-nation-models',
  'proofofplay-pirate-nation/ui': 'ui/proofofplay-pirate-nation-ui',
  'proofofplay-pirate-nation/icons': 'ui/proofofplay-pirate-nation-icons',
  'proofofplay-pirate-nation/audio': 'audio/proofofplay-pirate-nation-audio',
};

/**
 * Where a pack lived before the pack-first reorg, for git-history dating.
 * Inverts <pack>/<2D|3D>/<theme> to <2D|3D>/<theme>/<pack> and <pack>/<bucket>
 * to <bucket>/<pack>, plus explicit aliases for packs the reorg also renamed.
 * A path that never existed is harmless — git log just finds no commits for it.
 */
export function preReorgPackPaths(packId) {
  const segments = packId.split('/');
  const inverted = segments.length === 3
    ? `${segments[1]}/${segments[2]}/${segments[0]}`
    : segments.length === 2
      ? `${segments[1]}/${segments[0]}`
      : null;
  const alias = PRE_REORG_ALIASES[packId];
  return [...(inverted ? [inverted] : []), ...(alias ? [alias] : [])];
}
