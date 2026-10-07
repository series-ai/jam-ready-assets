// Search keywords for a catalog pack, taken from the words in its runtime file paths.
// Pack titles rarely say what is inside ("Sprite Pack 1"), so Studio's asset search
// also matches these. Most frequent first, so a consumer can rank by position.
import { extname } from 'node:path';

export const MAX_PACK_KEYWORDS = 60;

// Words that describe the file rather than the asset in it.
const NOISE = new Set([
  'png', 'svg', 'gif', 'glb', 'gltf', 'bin', 'jpg', 'ogg', 'mp3', 'wav', 'ttf', 'otf', 'woff', 'woff2', 'fnt', 'xml', 'json',
  'the', 'and', 'for', 'with', 'new', 'old', 'alt', 'var', 'variant', 'version', 'copy', 'final', 'default',
  'asset', 'assets', 'file', 'files', 'image', 'images', 'sprite', 'sprites', 'texture', 'textures', 'colormap',
  'sheet', 'sheets', 'spritesheet', 'spritesheets', 'atlas', 'preview', 'sample', 'samples', 'license',
  'model', 'models', 'mesh', 'meshes', 'pack', 'kit', 'kenney', 'kaykit', 'foozle', 'tilemap', 'packed', 'retina',
  'vector', 'vectors', 'small', 'medium', 'large', 'big', 'tiny', 'left', 'right', 'top', 'bottom',
  'front', 'back', 'side', 'center', 'centre', 'full', 'half', 'part', 'parts', 'set', 'frame', 'frames', 'one', 'two',
  'format', 'formats', 'size', 'sizes', 'variable', 'outline', 'outlines', 'detail', 'details', 'nodetails', 'without',
]);

// Folder names count: many packs name the subject in the directory (Characters/...), not the file.
export function pathWords(path) {
  const withoutExt = path.slice(0, path.length - extname(path).length);
  return withoutExt
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/([A-Za-z])(\d)/g, '$1 $2')
    .toLowerCase()
    .split(/[^a-z]+/)
    .filter((word) => word.length >= 3 && !NOISE.has(word));
}

/** Distinct words across the runtime files, ordered by how many files carry them. */
export function packKeywords(runtimePaths, max = MAX_PACK_KEYWORDS) {
  const counts = new Map();
  for (const path of runtimePaths) {
    for (const word of new Set(pathWords(path))) counts.set(word, (counts.get(word) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, max)
    .map(([word]) => word);
}
