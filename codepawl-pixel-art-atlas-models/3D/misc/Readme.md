---
license: cc0-1.0
license_link: https://huggingface.co/datasets/Angais/pixel-art-atlas-1.4m/blob/main/LICENSE
pretty_name: Pixel Art Atlas 3D GLB
tags:
- 3d
- glb
- gltf
- voxel
- pixel-art
- sprites
- cc0
- game-assets
- threejs
- webgpu
configs:
- config_name: default
  data_files:
  - split: train
    path:
    - "metadata.jsonl"
    - "engine/*/*.glb"
---

# Pixel Art Atlas 3D GLB

<video src="assets/preview.mp4" autoplay loop muted playsinline width="540"></video>

![All 6194 voxel sprites](assets/banner.jpg)

6,194 Low-Poly 3D Pixel game objects built from the 6,194 subjects of Pixel Art Atlas (1.4M 16x16 sprites by Angais, CC0). Each subject is built as a low-poly 3D mesh (smooth bevelled contours, hollow cups and vessels, hinged chests, diamond-section blades and 8-sided cylinders) UV-mapped to its crisp 16x16 pixel-art texture with nearest-neighbour sampling, scaled to 1 unit wide on y = 0, and packed with meshopt web files, plain engine GLBs and convex collision hulls.

6194 voxel sprites from [Pixel Art Atlas](https://huggingface.co/datasets/Angais/pixel-art-atlas-1.4m) by Angais, 470.0 MB of source files packed into 95.9 MB of GLB (web tier). Credit: Pixel Art Atlas (1.4M Synthetic Sprites) by Angais (https://huggingface.co/datasets/Angais/pixel-art-atlas-1.4m), CC0 1.0..

Viewer: https://huggingface.co/spaces/codepawl/pixel-atlas-glb-viewer

## Files

| Folder | Size | What | For |
|---|---|---|---|
| `objects/` | 95.9 MB | meshopt geometry, WebP textures | three.js, Babylon.js, any glTF viewer with the meshopt decoder |
| `engine/` | 431.5 MB | no meshopt, no quantization | Blender and desktop engines that cannot decode meshopt |
| `collision/` | 17.8 MB | convex collision shapes, plain glTF | Rapier, Jolt, PhysX, Unity colliders |

`metadata.jsonl` has one line per item: title, kind, licence, authors, triangle count and the path and size of every tier. Its `file_name` is the `engine/` file, so the Dataset Viewer opens each item in 3D and `load_dataset` returns it as a trimesh scene. Thumbnails are in `thumbs/`.

## For web games and WebGPU

Load the `objects_ktx2/` files for games: KTX2 textures stay block-compressed on the GPU (BC7 on desktop, ASTC or ETC2 on phones), so they take a fraction of the memory of decoded WebP. Switch to `lods/` by distance and to `mobile/` on phones. `collision/` holds convex shapes for physics.

Measured on 12 items spread over triangle count. Phone page: 390x844 at 3x, pixel ratio capped at 2, CPU throttled 4x, network at Chrome's Fast 4G (150 ms, 9 Mbit/s), so phone load includes the download. The GPU is a desktop RTX 3060 and is not throttled: frame time shows the CPU side only, a real phone GPU is slower. VRAM is geometry plus texture bytes on the GPU.

| Tier | File (median) | VRAM (median) | Triangles | Phone load (4G) | Frame time | WebGPU load (local) |
|---|---|---|---|---|---|---|
| web (12) | 0.0 MB | 0.0 MiB | 584 | 191 ms | 0.6 ms | 4 ms |

three.js WebGPU:

```js
import * as THREE from 'three';
import { WebGPURenderer } from 'three/webgpu';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { KTX2Loader } from 'three/addons/loaders/KTX2Loader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';

const renderer = new WebGPURenderer({ antialias: true });
await renderer.init(); // KTX2Loader needs to know which compressed formats this device takes
const ktx2 = new KTX2Loader().setTranscoderPath('https://cdn.jsdelivr.net/npm/three@0.187.0/examples/jsm/libs/basis/').detectSupport(renderer);
const loader = new GLTFLoader().setKTX2Loader(ktx2).setMeshoptDecoder(MeshoptDecoder);
const gltf = await loader.loadAsync('https://huggingface.co/datasets/codepawl/pixel-atlas-glb/resolve/main/objects/aa_battery/aa_battery.glb');
```

## Use it in 67js

[67js](https://github.com/codepawl/67.js) loads these files as they are:

```bash
npm install 67js@npm:@codepawlhq/67js meshoptimizer
```

```js
import { Renderer67 } from '67js';
import { loadGltf } from '67js/addons/gltf';
import { MeshoptDecoder } from 'meshoptimizer';

const asset = await loadGltf('https://huggingface.co/datasets/codepawl/pixel-atlas-glb/resolve/main/objects/aa_battery/aa_battery.glb', { decoders: { meshopt: MeshoptDecoder } });
const renderer = new Renderer67(document.querySelector('canvas'), asset.parts, { ground: true });
renderer.render({ eye: [1.5, 1.2, 2], target: [0, 0.5, 0] });
```

## Tested

Every file was loaded and drawn (drawn pixels counted) in each engine, three.js 0.187.0 and 67js 0.16.0, files from a local copy of this repository.

| Tier | three.js WebGL | three.js WebGPU | 67js |
|---|---|---|---|
| web | 120/120 | 120/120 | 120/120 |
| engine | 120/120 | 120/120 | 120/120 |
| collision | 120/120 | 120/120 | 120/120 |

Blender 5.2 import: engine 120/120, objects 120/120, collision 120/120.

## Licence and credit

Pixel Art Atlas (1.4M Synthetic Sprites) by Angais (https://huggingface.co/datasets/Angais/pixel-art-atlas-1.4m), CC0 1.0.. Licence: CC0-1.0 (https://huggingface.co/datasets/Angais/pixel-art-atlas-1.4m/blob/main/LICENSE).

Changes made: One representative 16x16 sprite selected for each of the 6,194 subjects in Pixel Art Atlas, built into a low-poly 3D pixel GLB mesh (smooth bevelled contours, hollowed vessels, hinged chests, diamond-section blades and 8-sided lathe shapes) with its crisp 16x16 nearest-filtered pixel-art texture and linear COLOR_0 vertex colours, centred on x = 0 and z = 0 and standing on y = 0 at 1 unit wide, with meshopt web files, plain engine GLBs and 64-point convex collision hulls.

Source: https://huggingface.co/datasets/Angais/pixel-art-atlas-1.4m. Packed by [CodePawl](https://huggingface.co/codepawl).
