// The two side effects of building lighter variants, kept behind small interfaces so the
// pipeline can be tested and dry-run without the live bucket:
//
// - a store for derived objects and the result index. Objects go to objects/<sha256>, the same
//   content-addressed prefix originals use, and are never overwritten. Each conversion result
//   is one immutable record under variants/results/<recipeKey>/, read once per run, so a daily
//   build converts only sources it has never seen.
// - the preparation helper: a pinned build of the published asset-preparation tool, run as a
//   subprocess with a JSON job, verified against the SHA-256 in light-variants.json first.
import { execFile, execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import {
  copyFileSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const IMMUTABLE = 'public, max-age=31536000, immutable';
const RECORD_NAME = /^[0-9a-f]{64}-[0-9a-f]{16}$/;

function parseRecords(dir) {
  const records = new Map();
  if (!existsSync(dir)) return records;
  for (const name of readdirSync(dir)) {
    const key = name.replace(/\.json$/, '');
    if (!RECORD_NAME.test(key)) continue;
    try {
      records.set(key, JSON.parse(readFileSync(join(dir, name), 'utf8')));
    } catch {
      // A record that does not parse is treated as missing and converted again.
    }
  }
  return records;
}

/** A plain directory laid out like the bucket. For dry runs and tests. */
export function localStore(root) {
  return {
    async readResults(key) {
      return parseRecords(join(root, 'variants/results', key));
    },
    /** objects: [{ oid, file }]. Returns the oids now present with the right size. */
    async putObjects(objects) {
      mkdirSync(join(root, 'objects'), { recursive: true });
      const present = new Set();
      for (const { oid, file } of objects) {
        const dest = join(root, 'objects', oid);
        if (!existsSync(dest)) copyFileSync(file, dest);
        if (statSync(dest).size === statSync(file).size) present.add(oid);
      }
      return present;
    },
    async putResults(key, records) {
      const dir = join(root, 'variants/results', key);
      mkdirSync(dir, { recursive: true });
      for (const [name, record] of records) {
        const dest = join(dir, `${name}.json`);
        if (!existsSync(dest)) writeFileSync(dest, `${JSON.stringify(record)}\n`);
      }
    },
  };
}

const NO_MATCH = /matched no objects|no urls matched/i;

/** The public bucket, through gcloud. Uploads are no-clobber; nothing is ever deleted. */
export function gcsStore(bucket, run = execFileSync) {
  const gcloud = (args, options = {}) => run('gcloud', ['storage', ...args], { encoding: 'utf8', maxBuffer: 256 * 1024 * 1024, ...options });
  const stage = () => mkdtempSync(join(tmpdir(), 'light-variants-'));
  return {
    async readResults(key) {
      const dir = stage();
      try {
        try {
          gcloud(['cp', '-r', `${bucket}/variants/results/${key}/*`, dir], { stdio: ['ignore', 'pipe', 'pipe'] });
        } catch (err) {
          if (NO_MATCH.test(String(err.stderr ?? err.message))) return new Map();
          throw err;
        }
        return parseRecords(dir);
      } finally {
        rmSync(dir, { recursive: true, force: true });
      }
    },
    async putObjects(objects, contentType) {
      if (objects.length === 0) return new Set();
      const dir = stage();
      try {
        for (const { oid, file } of objects) copyFileSync(file, join(dir, oid));
        // Grouped by content type by the caller: objects are immutable, so a wrong type sticks.
        gcloud(['cp', '--no-clobber', '--read-paths-from-stdin', `--content-type=${contentType}`, `--cache-control=${IMMUTABLE}`, `${bucket}/objects/`], {
          input: objects.map(({ oid }) => join(dir, oid)).join('\n'),
          stdio: ['pipe', 'inherit', 'inherit'],
        });
        const sizes = new Map(objects.map(({ oid, file }) => [oid, statSync(file).size]));
        const present = new Set();
        for (let i = 0; i < objects.length; i += 100) {
          const listing = gcloud(['ls', '-l', ...objects.slice(i, i + 100).map(({ oid }) => `${bucket}/objects/${oid}`)]);
          for (const line of listing.split('\n')) {
            const match = line.match(/^\s*(\d+)\s+\S+\s+gs:\/\/\S+\/objects\/([0-9a-f]{64})\s*$/);
            if (match && sizes.get(match[2]) === Number(match[1])) present.add(match[2]);
          }
        }
        return present;
      } finally {
        rmSync(dir, { recursive: true, force: true });
      }
    },
    async putResults(key, records) {
      if (records.size === 0) return;
      const dir = stage();
      try {
        for (const [name, record] of records) writeFileSync(join(dir, `${name}.json`), `${JSON.stringify(record)}\n`);
        gcloud(['cp', '--no-clobber', '--read-paths-from-stdin', '--content-type=application/json', `--cache-control=${IMMUTABLE}`, `${bucket}/variants/results/${key}/`], {
          input: [...records.keys()].map((name) => join(dir, `${name}.json`)).join('\n'),
          stdio: ['pipe', 'inherit', 'inherit'],
        });
      } finally {
        rmSync(dir, { recursive: true, force: true });
      }
    },
  };
}

/** LIGHT_VARIANT_STORE: a gs:// bucket, or a local directory for dry runs. Unset means off. */
export function openStore(spec) {
  if (!spec) return null;
  return spec.startsWith('gs://') ? gcsStore(spec.replace(/\/$/, '')) : localStore(spec);
}

/**
 * The pinned helper, or null when none is configured. The file must match the recipe's
 * SHA-256 exactly: a different build could produce different bytes under the same cache key.
 *
 * Interface (the helper's JSON argv entry point):
 *   node <helper> '<job json>'   ->   last stdout line is the result JSON
 *   job:    { source, destination, mode: "lossless"|"resize"|"audio", width?, height?,
 *             pixelArt?, nonLooping?, expectedSha256 }
 *   result: { ok: true, changed, bytes, sourceBytes, width?, height?, mimeType, sha256,
 *             sourceSha256, recipeVersion, reason? } | { ok: false, error }
 * When `changed` is false the helper writes nothing and the original is used.
 */
export function loadHelper(path, pinnedSha256, { timeoutMs = 60_000 } = {}) {
  if (!path || !pinnedSha256) return null;
  const actual = createHash('sha256').update(readFileSync(path)).digest('hex');
  if (actual !== pinnedSha256) {
    throw new Error(`preparation helper SHA-256 ${actual} does not match the pinned ${pinnedSha256}`);
  }
  return {
    run(job) {
      return new Promise((resolve) => {
        // A minimal environment: the helper needs no credentials, so it gets none.
        execFile(process.execPath, [path, JSON.stringify(job), '--tool-dir', fileURLToPath(new URL('../', import.meta.url))], {
          env: { PATH: process.env.PATH ?? '' },
          cwd: tmpdir(),
          timeout: timeoutMs,
          maxBuffer: 1024 * 1024,
        }, (_err, stdout) => {
          // A crash or timeout yields null: not recorded, so the next run tries again. A helper
          // that reports { ok: false } is recorded, so a file it refuses is not retried daily.
          const line = String(stdout ?? '').trim().split('\n').pop();
          try {
            const result = JSON.parse(line);
            resolve(result && typeof result === 'object' ? result : null);
          } catch {
            resolve(null);
          }
        });
      });
    },
  };
}
