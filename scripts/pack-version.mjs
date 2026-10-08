import { createHash } from 'node:crypto';

/**
 * Content-derived version of a pack's mirrored file set: its runtime files plus its licence
 * (`license: true`). The mirror publishes path-addressed copies under packs/<id>@<version>/,
 * so this changes iff the served file set changes, never with the commit. Lighter variants use
 * the same formula over their own files, so a variant gets its own immutable prefix while the
 * original pack keeps its version.
 */
export function packVersion(files) {
  const mirrored = files
    .filter((f) => f.runtime || f.license)
    .map((f) => [f.path, f.oid])
    .sort((a, b) => a[0].localeCompare(b[0]));
  return createHash('sha256').update(JSON.stringify(mirrored)).digest('hex').slice(0, 12);
}
