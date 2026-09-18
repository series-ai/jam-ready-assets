// Offline maintenance: show real audio waveforms when the creator supplied no album art.
// Requires ffmpeg. The output is committed, so CI and browsing do not need ffmpeg.
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import sharp from 'sharp';

const pack = 'proofofplay-pirate-nation/audio';
const tracks = [
  ['MAIN THEME', 'music/music-theme-pop-main-theme-remix-v2-normalized.mp3'],
  ['COMBAT', 'music/music-combat-combat-v16.mp3'],
  ['EXPLORATION', 'music/music-exploration-exploration-v10-normalized.mp3'],
];
const inputs = [];
let svg =
  '<svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">' +
  '<rect width="512" height="512" rx="20" fill="#202a35"/>' +
  '<text x="32" y="65" fill="#f4cf7b" font-family="sans-serif" font-weight="700" font-size="38">PIRATE NATION</text>' +
  '<text x="32" y="100" fill="#ffffff" font-family="sans-serif" font-size="24">Music &amp; sound effects</text>';
for (const [index, [label, path]] of tracks.entries()) {
  const sourcePath = `${pack}/${path}`;
  inputs.push({
    path: sourcePath,
    sha256: createHash('sha256').update(readFileSync(sourcePath)).digest('hex'),
  });
  const pcm = execFileSync('ffmpeg', [
    '-v',
    'error',
    '-i',
    sourcePath,
    '-t',
    '12',
    '-ac',
    '1',
    '-ar',
    '1000',
    '-f',
    'f32le',
    'pipe:1',
  ]);
  const samples = Array.from({ length: pcm.length / 4 }, (_, n) =>
    Math.abs(pcm.readFloatLE(n * 4)),
  );
  const peaks = Array.from({ length: 64 }, (_, n) =>
    Math.max(
      ...samples.slice(
        Math.floor((n * samples.length) / 64),
        Math.floor(((n + 1) * samples.length) / 64),
      ),
    ),
  );
  const maximum = Math.max(...peaks, 0.001);
  const y = 150 + index * 105;
  svg += `<text x="32" y="${y}" fill="#e6edf4" font-family="sans-serif" font-size="18">${label}</text>`;
  for (const [n, peak] of peaks.entries()) {
    const height = Math.max(4, Math.round((peak / maximum) * 52));
    svg += `<rect x="${32 + n * 7}" y="${y + 34 - height / 2}" width="4" height="${height}" rx="2" fill="#8fd7d0"/>`;
  }
}
svg +=
  '<text x="32" y="486" fill="#c4d1dc" font-family="sans-serif" font-size="16">Waveforms from the included soundtrack</text></svg>';
await sharp(Buffer.from(svg))
  .png()
  .toFile('scripts/preview-inputs/pirate-audio.png');
writeFileSync(
  'scripts/preview-inputs/pirate-audio-provenance.json',
  JSON.stringify({ inputs, sampleSeconds: 12 }, null, 2) + '\n',
);
