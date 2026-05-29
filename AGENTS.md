# AGENTS.md — AI guide to this asset library

This repo is a curated library of **free, CC0 game art** for building games on the **RUN platform**. This file tells an AI agent how to find, choose, and use assets here, and how to add more without breaking the structure.

## TL;DR for agents

- Everything is **CC0** → free to use, modify, and redistribute in any RUN game. No attribution required, no license checks needed.
- Layout is **predictable**: `<dimension>/<theme>/<creator>-<pack>/`. Find assets by globbing themes, not by guessing filenames.
- For 3D in a RUN game, **use the `.glb`/`.gltf` file** in a pack (the RUN runtime loads it directly). `.fbx`/`.obj` are editable source only.
- Files are stored with **Git LFS**. After cloning, run `git lfs install && git lfs pull` or you'll only see pointer text, not real assets.

## Repository layout

```
2D/<theme>/<creator>-<pack>/     pixel art, sprites, tilesets, spritesheets (.png, .aseprite)
3D/<theme>/<creator>-<pack>/     models & kits (.glb, .gltf, .fbx, .obj, textures)
ui/<creator>-<pack>/             buttons, panels, cursors, HUD frames
icons/<creator>-<pack>/          game icons, input-prompt icons
audio/<creator>-<pack>/          music, SFX, voice (.ogg, .wav, .mp3)
fonts/<creator>-<pack>/          bitmap & web fonts
```

- The **creator prefix** on every pack folder (`kenney-`, `kaykit-`, `pixel-frog`/`grafxkid-`, etc.) tells you the source at a glance.
- Each pack keeps its original `License.txt` / `Readme` inside its folder.
- Full creator credits + source links are in [`README.md`](README.md).

## Themes

**2D:** `platformer` · `top-down-rpg` · `dungeon` · `fantasy` · `western` · `pirate` · `city` · `nature` · `farm` · `food` · `space-scifi` · `vehicles-racing` · `tower-defense` · `strategy-hex` · `characters` · `seasonal-holiday` · `sports` · `prototype-blocks` · `misc`

**3D:** `characters` · `dungeon` · `city` · `nature` · `farm` · `interior-furniture` · `food` · `fantasy` · `weapons` · `space-scifi` · `vehicles-racing` · `platformer` · `tower-defense` · `strategy-hex` · `pirate` · `seasonal-holiday` · `sports` · `prototype-blocks` · `misc`

> Theme contents change over time — enumerate live with `ls 2D/<theme>/` or `ls 3D/<theme>/` rather than assuming a fixed set of packs.

## How to find assets (recommended workflow)

1. **Pick dimension + theme** from the game concept. Examples:
   - mining / dungeon crawler → `3D/dungeon/`, `3D/misc/kaykit-resource-bits`, `3D/nature/`, `2D/top-down-rpg/`
   - cozy farming sim → `3D/farm/`, `3D/interior-furniture/`, `2D/farm/`
   - platformer → `2D/platformer/` (large), `3D/platformer/`
   - tower defense → `2D/fantasy/foozle-spire-*`, `2D/tower-defense/`, `3D/tower-defense/`
   - top-down RPG → `2D/top-down-rpg/`, `3D/characters/`, `3D/dungeon/`
2. **List packs** in that theme: `ls "2D/<theme>/"`.
3. **Inspect a pack** before using it: `ls "<pack>/"` and read its `Readme`/preview images. Many packs ship preview `.gif`/`.png` files.
4. **Cross-browse adjacent themes** — packs are filed by dominant use but often contain props usable elsewhere (e.g. `misc/` and `prototype-blocks/` hold particles, UI bits, blockout tiles).
5. **Note the `*-remastered` / version suffixes** when a creator ships multiple editions of the same set — prefer the newest unless you need pixel-for-pixel parity.

## Format guidance (RUN platform)

- **3D** — load the **`.glb`** (or `.gltf` + its `.bin`/textures) in your RUN game. Use the bundled `.fbx`/`.obj` only if you need to edit geometry in a 3D tool first, then re-export to glTF.
- **2D** — use the exported `.png` sprites/sheets. `.aseprite`/`.ase` files are editable source. Keep texture filtering at **nearest/point** so pixel art stays crisp.
- **Audio** — `.ogg` is the most broadly compatible; `.wav` is uncompressed source.
- **`cozy-farm` (3D/farm)** — use an unlit/emission material; its textures are baked and a metallic-roughness PBR setup washes out the colors.

## Rules for agents modifying this repo

- **Only add CC0 (or equivalently public-domain) assets.** This library's promise is that everything is freely usable in any RUN game. Do not add assets under any other license.
- **Follow the layout:** `2D|3D/<theme>/<creator>-<pack-slug>/` (lowercase, dash-separated). UI/icons/audio/fonts go in their top-level buckets.
- **Keep each pack's `License.txt`/`Readme`** inside its folder so provenance travels with the art.
- **Binary assets must be LFS-tracked.** Patterns live in `.gitattributes` (png, jpg, gif, fbx, glb, gltf, bin, obj, mtl, blend, ogg, wav, mp3, zip, fonts). If you introduce a new binary extension, add it there before committing.
- **Never commit junk:** no `.DS_Store`, `__MACOSX/`, `*.app/`, `Thumbs.db` (already covered by `.gitignore`).
- **Update [`README.md`](README.md)** credits + theme lists when you add a new creator or theme.
- **Don't reference other game engines/platforms** in docs — this library is framed for the RUN platform.
