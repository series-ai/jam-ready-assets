// Runs on a PR after build-manifest.mjs. Keywords are what RUN.studio's asset search matches
// besides the title, so a build that stops emitting them fails. A pack the PR touches whose
// file names give search almost nothing to match only warns: the pack still ships.
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

export const MIN_PACK_KEYWORDS = 3;

export function keywordReport(packs, changedTopDirs) {
  const withKeywords = packs.filter((pack) => (pack.keywords?.length ?? 0) > 0).length;
  return {
    withKeywords,
    stoppedEmitting: packs.length > 0 && withKeywords < packs.length / 2,
    thin: packs.filter(
      (pack) => changedTopDirs.has(pack.id.split('/')[0]) && (pack.keywords?.length ?? 0) < MIN_PACK_KEYWORDS,
    ),
  };
}

function changedTopDirs(baseRef) {
  if (!baseRef) return new Set();
  const paths = execFileSync('git', ['diff', '--name-only', `${baseRef}...HEAD`], { encoding: 'utf8' });
  return new Set(paths.split('\n').filter(Boolean).map((path) => path.split('/')[0]));
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const { packs } = JSON.parse(readFileSync('manifest/v2/index.json', 'utf8'));
  const { withKeywords, stoppedEmitting, thin } = keywordReport(packs, changedTopDirs(process.argv[2]));
  for (const pack of thin) {
    const words = pack.keywords?.join(', ') || 'none';
    console.log(
      `::warning::${pack.id} has few search keywords (${words}). Asset search matches file and folder names, so names like coin.png or Characters/ make this pack findable.`,
    );
  }
  if (stoppedEmitting) {
    console.log(`::error::Only ${withKeywords} of ${packs.length} packs have search keywords. The manifest build has stopped emitting them.`);
    process.exit(1);
  }
  console.log(`search keywords: ${withKeywords} of ${packs.length} packs`);
}
