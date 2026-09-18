// Opt-in maintenance only. Downloads pinned originals; never called by build or publish.
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { localSourcePath, readPreviewSources } from './preview-policy.mjs';

const root = process.cwd();
const requested = process.argv[2];
const packs = readPreviewSources(root).packs;
if (requested && !packs[requested])
  throw new Error(`Unknown pack: ${requested}`);
const sha = (bytes) => createHash('sha256').update(bytes).digest('hex');
for (const [id, entry] of Object.entries(packs)) {
  if ((requested && requested !== id) || !entry.imageUrl) continue;
  if (!entry.sourcePath.startsWith('.preview-sources/'))
    throw new Error(`${id}: downloads must use the source cache`);
  const output = localSourcePath(root, entry.sourcePath);
  if (existsSync(output) && sha(readFileSync(output)) === entry.sourceSha256)
    continue;
  const url = new URL(entry.imageUrl);
  if (url.protocol !== 'https:')
    throw new Error(`${id}: source must use HTTPS`);
  const response = await fetch(url, { signal: AbortSignal.timeout(30_000) });
  if (!response.ok) throw new Error(`${id}: source HTTP ${response.status}`);
  const chunks = [];
  let size = 0;
  for await (const chunk of response.body) {
    size += chunk.length;
    if (size > 20 * 1024 * 1024)
      throw new Error(`${id}: source exceeds 20 MiB`);
    chunks.push(chunk);
  }
  const bytes = Buffer.concat(chunks);
  if (sha(bytes) !== entry.sourceSha256)
    throw new Error(
      `${id}: original changed; review and repin before using it`,
    );
  mkdirSync(dirname(output), { recursive: true });
  writeFileSync(output, bytes);
  console.log(`Fetched ${id}`);
}
