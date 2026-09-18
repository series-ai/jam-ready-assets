// Offline fallback for packs without a suitable original showcase image.
// Uses included artwork only. Rerun after hydrating these named LFS inputs.
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import sharp from 'sharp';

const recipes = {
  ...JSON.parse(readFileSync('scripts/kenney-preview-selections.json', 'utf8')),
  'barker-cant-stop-now-launcher/2D/platformer': [
    ['hero.png', 256, 256],
    ['jelly.png'],
    ['balloon.png'],
    ['coin_static.png'],
    ['bench_trim.png'],
    ['spikemine.png'],
  ],
  'barker-cant-stop-now-runner/2D/platformer': [
    ['character_run.png', 512, 682],
    ['character_run.png', 512, 682, 512],
    ['crate.png'],
    ['coin_static.png'],
    ['spike.png'],
    ['cloud.png'],
  ],
  'puny-monsters/2D/top-down-rpg': [
    ['Black-Panther-32x32.png', 32, 32],
    ['Blonde-Dog-32x32.png', 32, 32],
    ['Brown-Boar-32x32.png', 32, 32],
    ['Brown-Spider-32x32.png', 32, 32],
    ['Gray-Wolf-32x32.png', 32, 32],
    ['Navy-Blue-Rat-32x32.png', 32, 32],
    ['Orange-Cat-32x32.png', 32, 32],
    ['Purple-Spider-32x32.png', 32, 32],
    ['Dirty-Gray-Boar-32x32.png', 32, 32],
  ],
};
const output = 'scripts/preview-inputs';
mkdirSync(output, { recursive: true });
const provenance = {};
for (const [id, files] of Object.entries(recipes)) {
  const background =
    id.includes('facial-hair') || id.includes('pattern-pack-pixel')
      ? '#dbe6ec'
      : '#202a35';
  const composites = [];
  const inputs = [];
  for (const [
    index,
    [name, width, height, left = 0, top = 0],
  ] of files.entries()) {
    const path = `${id}/${name}`;
    const bytes = readFileSync(path);
    inputs.push({
      path,
      sha256: createHash('sha256').update(bytes).digest('hex'),
      ...(width ? { frame: { left, top, width, height } } : {}),
    });
    let image = sharp(bytes);
    if (width) image = image.extract({ left, top, width, height });
    const sprite = await image.png().toBuffer();
    const fitted = await sharp(sprite)
      .trim()
      .resize(128, 128, {
        fit: 'contain',
        background,
        kernel:
          id.startsWith('puny') ||
          id.includes('pixel') ||
          id.includes('smilies')
            ? 'nearest'
            : 'lanczos3',
      })
      .png()
      .toBuffer();
    composites.push({
      input: fitted,
      left: 24 + (index % 3) * 160,
      top: 24 + Math.floor(index / 3) * 160,
    });
  }
  const destination = `${output}/${id.split('/')[0]}.png`;
  await sharp({
    create: {
      width: 496,
      height: files.length > 6 ? 496 : 336,
      channels: 3,
      background,
    },
  })
    .composite(composites)
    .png()
    .toFile(destination);
  provenance[id] = { sourcePath: destination, inputs };
}
writeFileSync(
  `${output}/provenance.json`,
  JSON.stringify(provenance, null, 2) + '\n',
);
