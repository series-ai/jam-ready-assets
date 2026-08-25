# 🎮 Jam-Ready Assets

A curated, ready-to-use library of **free game art** for building games on the **RUN platform**: **292 asset packs** of 2D sprites, tilesets, 3D models, UI kits, icons, fonts, and audio, organized so you can find what you need in seconds. Drop them straight into your RUN game.

> **Free for any RUN game**, personal, educational, or commercial. Modify it freely.
>
> There is no single licence across the library. Every pack carries its own `License.txt`, and the library only accepts licences whose obligations RUN.studio can carry into the published game: **CC0 / public domain, MIT, and BSD-2-Clause**. All 292 packs are currently CC0, so nothing here asks anything of you. If a pack under MIT or BSD-2-Clause is added later, RUN.studio copies its licence file into your published project automatically when you import the pack. Leave it where it lands and you are done.
> Older RUN.studio builds use a CC0-only schema-v1 catalog. Licence-aware builds use schema v2 with immutable per-commit pack manifests, so a non-CC0 pack cannot reach a client that would strip its notice or pair with another revision's notice.
>
> The creators below deserve a shout-out either way, see [Credits](#-credits).

## 🏆 Build on RUN

- **[Upcoming events & contests →](https://events.run.world/)** - game jams and competitions with **real cash prizes**.
- **[RUN blog →](https://run.world/blog)** - updates on what we're building.

---

## 🧭 How to navigate

Assets are sorted first by **dimension** (2D vs 3D), then by **theme**. Inside each theme, folders are prefixed by their **creator** (e.g. `kaykit-`, `kenney-`) so you can always tell where a pack came from.

```
2D/   pixel art, sprites, tilesets        ui/      buttons, panels, cursors, HUD
3D/   models, kits (.fbx / .glb / .gltf)  icons/   game & input-prompt icons
                                          fonts/   bitmap & web fonts
                                          audio/   music, SFX, voice
```

### 2D themes
`platformer` · `top-down-rpg` · `dungeon` · `fantasy` · `western` · `pirate` · `city` · `nature` · `farm` · `food` · `space-scifi` · `vehicles-racing` · `tower-defense` · `strategy-hex` · `characters` · `seasonal-holiday` · `sports` · `prototype-blocks` · `misc`

### 3D themes
`characters` · `dungeon` · `city` · `nature` · `farm` · `interior-furniture` · `food` · `fantasy` · `weapons` · `space-scifi` · `vehicles-racing` · `platformer` · `tower-defense` · `strategy-hex` · `pirate` · `seasonal-holiday` · `sports` · `prototype-blocks` · `misc`

**Examples**
- Making a **mining / adventure** game? → `3D/dungeon/`, `3D/nature/`, `3D/misc/kaykit-resource-bits`, `2D/top-down-rpg/`
- A **cozy farming sim**? → `3D/farm/cozy-farm`, `3D/interior-furniture/`, `2D/farm/`
- A **platformer**? → `2D/platformer/` (Pixel Frog, GrafxKid, Kenney) and `3D/platformer/`
- A **tower-defense**? → `2D/fantasy/foozle-spire-*`, `2D/tower-defense/`, `3D/tower-defense/`

Every pack carries its own `License.txt` naming the licence and where it was verified, so provenance travels with the art. Packs that shipped their own licence or readme from the original download keep those too.

> 🤖 **Building with an AI agent?** See [`AGENTS.md`](AGENTS.md) for a machine-friendly guide to finding, choosing, and adding assets.

---

## 📦 Working with this repo (Git LFS)

Binary assets (images, models, audio, fonts, nested archives) are stored with **[Git LFS](https://git-lfs.com/)**. Install it once before cloning:

```bash
git lfs install
git clone https://github.com/series-ai/jam-ready-assets.git
```

If you cloned before installing LFS, run `git lfs pull` to fetch the real files.

---

## 🙌 Credits

Every pack in the table below is CC0 today, verified pack by pack rather than assumed, so attribution is **optional but appreciated**. Check a pack's own `License.txt` for its licence and the source it was verified against. Please consider supporting these creators.

| Creator | Packs | Licence | What | Source |
|---|---|---|---|---|
| **Kenney** | 240 | CC0-1.0 | The legendary *Game Assets All-in-1* - 2D, 3D, UI, icons, fonts & audio, split across every theme | [kenney.nl](https://kenney.nl) |
| **Kay Lousberg** | 20 | CC0-1.0 | *KayKit* Complete Collection - stylized low-poly 3D kits (dungeon, city, characters, weapons, space…) | [kaylousberg.com](https://kaylousberg.com) |
| **Isa Lousberg** | 1 | CC0-1.0 | *Tiny Treats* - charming 3D cozy-home & bakery sets | [isalousberg.com](https://www.isalousberg.com) |
| **Foozle** (commissioned from **Baldur**) | 8 | CC0-1.0 | *Spire* - dark-fantasy 2D enemies, towers, builder & tileset | [foozlecc.itch.io](https://foozlecc.itch.io) |
| **Pixel Frog** | 4 | CC0-1.0 | *Pixel Adventure*, *Kings and Pigs*, *Pirate Bomb*, *Treasure Hunters* - polished 2D platformer sets | [pixelfrog-assets.itch.io](https://pixelfrog-assets.itch.io) |
| **Pixel-boy & AAA** | 1 | CC0-1.0 | *Ninja Adventure* - huge top-down 2D pack (characters, tilesets, FX, music) | [pixel-boy.itch.io](https://pixel-boy.itch.io) |
| **Estúdio Vaca Roxa** (Bakudas & Gabe Fern) | 2 | CC0-1.0 | *Generic RPG Pack* & *Old West Graphics* - 2D top-down / western | [bakudas.itch.io](https://bakudas.itch.io) |
| **GrafxKid** | 8 | CC0-1.0 | Sprite Packs, *Rocky Roads*, *Seasonal Tilesets* - versatile 2D platformer art | [grafxkid.itch.io](https://grafxkid.itch.io) |
| **Shade** | 2 | CC0-1.0 | *Puny Characters* & *Puny Monsters* - 16×16 top-down sprites | [merchant-shade.itch.io](https://merchant-shade.itch.io) |
| **Alex's Assets** | 2 | CC0-1.0 | *16×16 Outdoors Tileset* & *16×16 RPG Item Pack* | [alexs-assets.itch.io](https://alexs-assets.itch.io) |
| **Jestan** | 1 | CC0-1.0 | *Classic RPG Tileset* | [jestan.itch.io](https://jestan.itch.io) |
| **Styloo** | 1 | CC0-1.0 | *Cozy Farm* - 3D farm models (FBX + GLB) | [styloo.itch.io](https://styloo.itch.io) |
| **Barker** | 2 | CC0-1.0 | *Cant Stop Now* runner & launcher packs - painted 2D characters, emotes, spritesheets & parallax backgrounds | [series.ai](https://series.ai) |

---

## 💡 Usage notes

- **3D formats** - most 3D packs ship `.gltf`/`.glb`, `.fbx`, and `.obj`. Use **glTF/GLB** in your RUN game - it's the format the RUN runtime loads directly. The `.fbx`/`.obj` copies are included only as editable source if you want to tweak a model in a 3D tool first.
- **Cozy Farm shader tip** - for `3D/farm/cozy-farm`, use an **unlit / emission** shader rather than a metallic-roughness PBR workflow (the textures are baked; PBR washes out the colors). If you must use PBR, set roughness to 1.
- **Pixel art** - keep texture filtering set to **nearest / point** (no bilinear) to avoid blurring sprites and tiles.
- **Kenney sprite variants** - some Kenney packs include nested `.zip`s with alternate sprite formats (isometric / side / topdown) and sample projects; unzip the variant you need.

---

## ℹ️ Notes on contents

- **Mixed-format packs** are filed by their dominant use; a pack tagged one theme often contains props usable elsewhere - browse adjacent themes too.
- A few Kenney *Mobile Controls* high-DPI ("@2x") variants were omitted because their filenames use characters this filesystem can't store - the standard-resolution versions are all present.
- Kenney's legacy **Archive** (superseded older versions), promotional **Goodies**, and sample projects were left out to keep the library clean. Grab the full original collection from [kenney.nl](https://kenney.nl) if you need them.
