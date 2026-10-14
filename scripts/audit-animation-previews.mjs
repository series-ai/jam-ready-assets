// Read-only coverage report for the generated visual catalog.
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { readVisualMetadata } from './visual-metadata.mjs';

const root = process.cwd();
const index = JSON.parse(readFileSync(join(root, 'manifest/v2/index.json'), 'utf8'));
const dir = join(root, 'manifest/v2/commits', index.commit, 'assets/pages');
const items = readdirSync(dir).flatMap((name) => JSON.parse(readFileSync(join(dir, name), 'utf8')).items);
const metadata = readVisualMetadata(root);
const packs = new Map(index.packs.map((pack) => [pack.id, pack]));
const actions = /\b(idle|run|running|walk|walking|jump|jumping|attack|attacking|death|dying|hurt|hit|climb|swim|shoot|explode|explosion|disappear|swing|dash|roll|blink|bounce|spin|fly|flying|collect)\b/i;
const needsLayout = items.filter((item) =>
  ['2d', 'ui'].includes(packs.get(item.packId)?.category) && item.kind === 'sheet' &&
  item.path.toLowerCase().endsWith('.png') && !item.animation && !metadata.sheetPreviews[item.oid] &&
  actions.test(item.path.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/[^a-z]/gi, ' '))
).map(({ packId, path, oid, width, height }) => ({ packId, path, oid, width, height }));
console.log(JSON.stringify({
  catalogCommit: index.commit,
  images: items.length,
  previews: Object.fromEntries(['sheet', 'sequence', 'animated'].map((type) => [type, items.filter((item) => item.animation?.type === type).length])),
  namedClipSheets: items.filter((item) => item.animation?.clips?.length > 1).length,
  verifiedStaticPoseSheets: items.filter((item) => metadata.sheetPreviews[item.oid]?.clips.length === 0).length,
  largeNativeAnimations: items.filter((item) => item.animation?.type === 'animated' && item.bytes > 1024 * 1024).length,
  // These are inspection candidates, not a claim that every matching filename is animated.
  needsLayout,
}, null, 2));
