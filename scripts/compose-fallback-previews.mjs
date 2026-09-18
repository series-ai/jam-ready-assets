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
  "0x72-dungeon-tileset-ii/2D/dungeon": [
    ["frames/pumpkin_dude_idle_anim_f0.png"],
    ["frames/skelet_idle_anim_f0.png"],
    ["frames/big_zombie_idle_anim_f0.png"],
    ["frames/big_demon_idle_anim_f0.png"],
    ["frames/chort_idle_anim_f0.png"],
    ["frames/imp_idle_anim_f0.png"],
    ["frames/orc_shaman_idle_anim_f0.png"],
    ["frames/goblin_idle_anim_f0.png"],
    ["frames/ogre_idle_anim_f0.png"],
  ],
  "chaoswitchnikol-skeleton-warrior/2D/characters": [
    ["skleton.png", 32, 32, 96, 0],
    ["skleton.png", 32, 32, 0, 32],
    ["skleton.png", 32, 32, 64, 32],
  ],
  'favabeans-1-bit-graveyard/icons': [
    ['Skull.png', 16, 16],
    ['Key.png', 16, 16],
    ['Heart.png', 16, 16],
    ['Money.png', 16, 16],
    ['Trophy.png', 16, 16],
    ['Star.png', 16, 16],
    ['Play.png', 16, 16],
    ['Lock.png', 16, 16],
    ['Exclamation.png', 16, 16],
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
