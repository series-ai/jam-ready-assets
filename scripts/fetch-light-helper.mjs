import { createHash } from 'node:crypto';
import { appendFileSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

// Only a committed release and digest can enable conversion. An empty recipe
// needs no helper download and continues to publish the original catalogue.
const recipe = JSON.parse(readFileSync(new URL('../light-variants.json', import.meta.url), 'utf8'));
const { version, sha256, artifact } = recipe.helper ?? {};
if (Object.keys(recipe.packs ?? {}).length && version && sha256) {
  if (!/^v?\d+\.\d+\.\d+(?:-[a-zA-Z0-9.-]+)?$/.test(version) ||
      !/^[a-f0-9]{64}$/.test(sha256) || artifact !== 'prepare-asset.mjs') {
    throw new Error('Invalid asset helper release pin');
  }
  const tag = version.startsWith('v') ? version : `v${version}`;
  const response = await fetch(`https://github.com/series-ai/rundot-cli-releases/releases/download/${tag}/${artifact}`, {
    signal: AbortSignal.timeout(60_000),
  });
  if (!response.ok) throw new Error(`Asset helper download failed (${response.status})`);
  const bytes = Buffer.from(await response.arrayBuffer());
  if (bytes.length > 1024 * 1024 || createHash('sha256').update(bytes).digest('hex') !== sha256) {
    throw new Error('Asset helper does not match the committed digest');
  }
  const path = join(mkdtempSync(join(tmpdir(), 'asset-helper-')), artifact);
  writeFileSync(path, bytes);
  if (process.env.GITHUB_ENV) appendFileSync(process.env.GITHUB_ENV, `LIGHT_VARIANT_HELPER=${path}\n`);
  else console.log(path);
}
