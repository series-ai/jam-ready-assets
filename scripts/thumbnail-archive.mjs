// Minimal deterministic ustar for flat, verified, bounded WebP objects.
import { readFileSync, writeFileSync, statSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';
import { HASH, sha256 } from './visual-metadata.mjs';
export const MAX_THUMBNAIL_BYTES = 40960;
export const MAX_ARCHIVE_BYTES = 64 * 1024 * 1024;
export function readThumbnailArchive(path) {
  if (statSync(path).size > MAX_ARCHIVE_BYTES) throw new Error('Invalid thumbnail archive size');
  let data = readFileSync(path);
  if (data.length < 300 && data.toString().startsWith('version https://git-lfs')) {
    const oid = data.toString().match(/^oid sha256:([a-f0-9]{64})$/m)?.[1];
    if (!oid) throw new Error('Invalid thumbnail LFS pointer');
    const common = execFileSync('git', ['rev-parse', '--git-common-dir'], { encoding: 'utf8' }).trim();
    const objectPath = join(common, 'lfs/objects', oid.slice(0, 2), oid.slice(2, 4), oid);
    if (statSync(objectPath).size > MAX_ARCHIVE_BYTES) throw new Error('Invalid thumbnail archive size');
    data = readFileSync(objectPath);
    if (sha256(data) !== oid) throw new Error('Thumbnail LFS object hash mismatch');
  }
  if (data.length > MAX_ARCHIVE_BYTES || data.length % 512 !== 0) throw new Error('Invalid thumbnail archive size');
  const entries = new Map();
  let ended = false;
  for (let offset = 0; offset < data.length;) {
    const header = data.subarray(offset, offset + 512);
    if (header.every((byte) => byte === 0)) {
      if (data.subarray(offset).some((byte) => byte !== 0)) throw new Error('Archive data after terminator');
      ended = true; break;
    }
    const string = (start, end) => header.subarray(start, end).toString('utf8').replace(/\0.*$/s, '');
    const name = string(0, 100);
    const sizeText = string(124, 136).trim();
    const checksumText = string(148, 156).trim();
    const size = parseInt(sizeText, 8);
    const checksum = [...header].reduce((sum, byte, index) => sum + (index >= 148 && index < 156 ? 32 : byte), 0);
    if (!/^[a-f0-9]{64}\.webp$/.test(name) || !/^[0-7]+$/.test(sizeText) || !/^[0-7]+$/.test(checksumText) || checksum !== parseInt(checksumText, 8) || ![0, 48].includes(header[156]) || string(157, 257) || string(345, 500) || entries.has(name.slice(0, 64)) || size < 1 || size > MAX_THUMBNAIL_BYTES || offset + 512 + size > data.length) throw new Error('Unsafe thumbnail archive entry');
    const bytes = data.subarray(offset + 512, offset + 512 + size);
    const oid = name.slice(0, 64);
    if (sha256(bytes) !== oid || bytes.subarray(0, 4).toString() !== 'RIFF' || bytes.subarray(8, 12).toString() !== 'WEBP') throw new Error('Thumbnail content/hash mismatch');
    entries.set(oid, bytes);
    offset += 512 + Math.ceil(size / 512) * 512;
  }
  if (!ended) throw new Error('Missing archive terminator');
  return entries;
}
export function writeThumbnailArchive(path, entries) {
  const blocks = [];
  for (const [oid, bytes] of [...entries].sort(([a], [b]) => a.localeCompare(b))) {
    if (!HASH.test(oid) || sha256(bytes) !== oid || bytes.length > MAX_THUMBNAIL_BYTES || !bytes.length) throw new Error('Invalid thumbnail');
    const header = Buffer.alloc(512);
    header.write(`${oid}.webp`, 0);
    for (const [start, length, value] of [[100, 8, 420], [108, 8, 0], [116, 8, 0], [124, 12, bytes.length], [136, 12, 0]]) header.write(`${value.toString(8).padStart(length - 1, '0')}\0`, start);
    header.fill(32, 148, 156); header[156] = 48; header.write('ustar\0', 257); header.write('00', 263);
    const checksum = [...header].reduce((sum, byte) => sum + byte, 0);
    header.write(`${checksum.toString(8).padStart(6, '0')}\0 `, 148);
    blocks.push(header, bytes, Buffer.alloc((512 - bytes.length % 512) % 512));
  }
  blocks.push(Buffer.alloc(1024));
  const result = Buffer.concat(blocks);
  if (result.length > MAX_ARCHIVE_BYTES) throw new Error('Thumbnail archive exceeds limit');
  writeFileSync(path, result);
}
