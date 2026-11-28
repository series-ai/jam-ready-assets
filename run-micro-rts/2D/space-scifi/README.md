# RUN Micro-RTS — 2D Units, Buildings, Terrain & Combat VFX

Crisp `8×8`-grid sci-fi micro-RTS pixel art designed for nearest-neighbor rendering on the RUN platform.

## Contents

- `units/` — **72 faction units** (`vanguard`, `kraxen`, `solaris` × 24) in 8-way × 12-frame sheets (`N, NE, E, SE, S, SW, W, NW` rows; `idle 2`, `move 4`, `attack 4`, `death 2` columns), including **12 two-layer hull + independent-turret split units**, shared mineral-carry overlay, `swarm4x4/` ultra-micro sprites, and `units/roster-manifest.json` (with exact `muzzleCell8` weapon origins).
- `buildings/` — **21 grounded faction buildings** across 7 lifecycle states (`build_1`, `build_2`, `idle`, `active_0`, `active_1`, `damaged`, `rubble`) plus mineral/terrain props and `buildings/buildings-manifest.json`.
- `environment/` — **4 planet biome `8×8` Wang-16 tilesets** (`temperate`, `tundra`, `volcanic`, `desert`) with Layer-1 alpha cliffs, 3-frame animated hazards, 4-way ramps, H/V bridges, **31 terrain objects**, **12 neutral 8-way units** (critters + guardians including 2 two-layer turrets), and `environment/env-manifest.json`.
- `vfx/` — **19 combat VFX strips** (projectiles, missiles, flames, explosions, shields, slashes), `vfx/vfx-manifest.json`, and complete 84-unit attack profiles in `vfx/unit-attacks.json`.
- `micro-rts-manifest.json` — Top-level index of every sub-manifest and asset count.

## Rendering Notes

- Use **nearest-neighbor / point texture filtering** (`image-rendering: pixelated`).
- Matching selection rings, tactical cursors, world pings, and HUD icons live in the sibling `run-micro-rts/ui` pack.
