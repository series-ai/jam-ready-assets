import sharp from 'sharp';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { sha256 } from './visual-metadata.mjs';

export function assertSafeSvg(bytes) {
  const xml = bytes.toString('utf8');
  if (/<!ENTITY|<\s*script\b|@import|xml-stylesheet/i.test(xml)) throw new Error('SVG active content or external resources');
  for (const match of xml.matchAll(/(?:href\s*=\s*["']([^"']+)["']|url\(\s*["']?([^)'"\s]+))/gi)) {
    const url = match[1] ?? match[2];
    if (!url.startsWith('#') && !/^data:image\/(png|jpeg|gif|webp);base64,/i.test(url)) throw new Error('SVG external resource');
  }
}
export function pngFrameCount(bytes) {
  if (bytes.length < 8 || bytes.subarray(0, 8).toString('hex') !== '89504e470d0a1a0a') return 1;
  for (let offset = 8; offset + 12 <= bytes.length;) {
    const size = bytes.readUInt32BE(offset);
    if (offset + size + 12 > bytes.length) throw new Error('Truncated PNG chunk');
    if (bytes.subarray(offset + 4, offset + 8).toString() === 'acTL') {
      if (size !== 8 || bytes.readUInt32BE(offset + 8) < 1) throw new Error('Invalid PNG animation control');
      return bytes.readUInt32BE(offset + 8);
    }
    offset += size + 12;
  }
  return 1;
}
export async function decodeVisual(bytes, extension, page = 0) {
  if (bytes.length > 256 * 1024 * 1024) throw new Error('Source exceeds decoding limit');
  if (extension === '.svg') {
    assertSafeSvg(bytes);
    bytes = Buffer.from(bytes.toString('utf8').replace(/<!DOCTYPE[^>]*>/gi, ''));
  }
  try {
    const image = sharp(bytes, { page, pages: 1, limitInputPixels: 100000000 });
    const meta = await image.metadata();
    if (extension === '.png' && pngFrameCount(bytes) > (meta.pages ?? 1)) throw new Error('Animated PNG requires a decoder that exposes every frame');
    const png = await image.png().toBuffer();
    return { png, width: meta.width, height: meta.pageHeight ?? meta.height, frames: meta.pages ?? 1 };
  } catch (error) {
    if (extension !== '.svg') throw error;
    const dir = mkdtempSync(join(tmpdir(), 'asset-svg-'));
    try {
      writeFileSync(join(dir, 'input.svg'), bytes);
      execFileSync(process.env.ASSET_PYTHON ?? 'python3', [join(dirname(fileURLToPath(import.meta.url)), 'render-svg.py'), join(dir, 'input.svg'), join(dir, 'output.png')], { timeout: 60000, maxBuffer: 1024 * 1024 });
      const png = readFileSync(join(dir, 'output.png')), meta = await sharp(png).metadata();
      return { png, width: meta.width, height: meta.height, frames: 1 };
    } finally { rmSync(dir, { recursive: true, force: true }); }
  }
}
export async function thumbnailFromPng(png, pixel = false) {
  for (const [size, quality] of [[256, 80], [256, 60], [256, 40], [256, 20], [192, 40], [128, 40], [64, 40]]) {
    const { data, info } = await sharp(png).resize({ width: size, height: size, fit: 'inside', withoutEnlargement: true, kernel: pixel ? 'nearest' : 'lanczos3' }).webp({ quality, effort: 4 }).toBuffer({ resolveWithObject: true });
    if (data.length <= 40960) return { data, oid: sha256(data), bytes: data.length, width: info.width, height: info.height };
  }
  throw new Error('Thumbnail exceeds 40 KiB');
}

export async function representativeVisual(bytes, extension) {
  const first = await decodeVisual(bytes, extension);
  const visible = async (png) => (await sharp(png).ensureAlpha().extractChannel(3).raw().toBuffer()).some((alpha) => alpha > 0);
  if (await visible(first.png)) return { ...first, frameIndex: 0, empty: false };
  for (let page = 1; page < first.frames; page++) {
    const frame = await decodeVisual(bytes, extension, page);
    if (await visible(frame.png)) return { ...frame, frames: first.frames, frameIndex: page, empty: false };
  }
  return { ...first, frameIndex: 0, empty: true };
}
export function quadrants(width, height) {
  if (width < 2 || height < 2) return [{ left: 0, top: 0, width, height }];
  const w = Math.floor(width / 2), h = Math.floor(height / 2);
  return [[0, 0], [w, 0], [0, h], [w, h]].map(([left, top]) => ({ left, top, width: left === 0 ? w : width - w, height: top === 0 ? h : height - h }));
}
