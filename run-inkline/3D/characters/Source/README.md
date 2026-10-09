# INKLINE Complete Pack Documentation & Source

This directory contains the master consumer manifest, editable Blender sources, generator scripts, and runtime TypeScript sources for INKLINE.

## Directory Structure
- `manifest.json`: Master consumer manifest containing 303 models and 85 stick figure animations with paths relative to the PACK ROOT.
- `characters.blend`: Authored Blender source file containing the 18-bone rig and 12 base stick figures.
- `characters.py`: Headless Blender script to procedurally regenerate all 12 skinned character GLBs with 85 embedded animation clips.
- `types.ts`: Common TypeScript interfaces (`PackManifest`, `ModelEntry`, `AvatarConfig`, `StageSettings`).
- `runtime/`: Modular runtime libraries matching the showcase source structure:
  - `assets.ts`: `AssetLibrary` loader supporting local base URLs or remote mirrors.
  - `palette.ts`: Graphic-novel palette and cel bands for figures, props, effects, and the stage. `applyFigureShading` and `applyPropShading` apply it to loaded models.
  - `firearms.json`: Shared firearm sizes, grip targets, and support timing. Enable `resolveJsonModule` in the consumer TypeScript configuration.
  - `effects.ts`: `InkEffects` particle manager with 64 procedural presets.
  - `district.ts`: Assembly for Industrial District, Service Yard, and Roof Works.
  - `layouts.ts`: Placement, actor, and effect data for the two extra scenes.
  - `camera.ts`: Visible-mesh camera clearance and scene framing.
  - `kinetics.ts`: Bounded impact profiles, reaction curves, and one-edge input buffer.
  - `trails.ts`: Fixed-pool weapon and limb ribbons.
  - `physics.ts`: Axis-aligned collision proxy resolution and kinematic controller.
  - `index.ts`: Barrel export for runtime modules.
