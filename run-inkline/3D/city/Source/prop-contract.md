# INKLINE prop contract

The pack contains 291 static prop GLBs. The models use original procedural geometry and a shared flat color style. [public/assets/props.json](https://github.com/series-ai/run-workshop/blob/main/games/inkline-showcase/public/assets/props.json) lists IDs, dimensions, mesh counts, file paths, and tags.

| Category | Models |
| --- | ---: |
| Industrial | 185 |
| Weapons | 26 |
| City | 26 |
| Parkour | 22 |
| Sports | 16 |
| Science fiction | 16 |
| Total | 291 |

## Coordinates and placement

One unit is one meter. Blender uses Z up and -Y forward. The exported GLBs use Y up and +Z forward. Export maps Blender `(x, y, z)` to runtime `(x, z, -y)`.

The kit includes 2-meter and 4-meter modules. Use each model's catalog dimensions to size a placement. Do not assume that all props have the same size or origin.

Ground props generally use a floor origin. Pipes and ducts use a centerline origin. Elevated parts can use an attachment origin. Some catalog tags describe intended use rather than a measured contact plane. Check the native bounds before aligning an unfamiliar model.

The `held` tag identifies equipment for the avatar system. There are 43 held models. Their grip origins still require a hand rotation and palm offset. Use `mountEquipment` and `supportEquipment` from `src/runtime/assets.ts`. Do not attach all equipment to a hand with an identity transform.

## Materials and mesh data

Props use one to three unlit materials with `KHR_materials_unlit`:

| Material | sRGB color | Use |
| --- | --- | --- |
| `InkMat_OffWhite` | `#dedcd4` | Main surfaces |
| `InkMat_Charcoal` | `#181a1b` | Frames and edges |
| `InkMat_SafetyOrange` | `#d45538` | Selected accents |

The generator converts these colors to linear material factors for export. The models do not require texture maps or scene lights. The showcase adds edge lines at runtime. Those lines are not baked into each GLB.

The current props range from 16 to 1,712 triangles. Mesh counts do not determine frame rate by themselves. Object count, material count, effects, and the host renderer also affect performance.

## Pipe and duct tags

Socket tags describe connection direction and nominal opening size. They use Blender axes. They do not include full connection transforms or automatic snapping logic.

| Tag axis | Runtime axis |
| --- | --- |
| `+X` | `+X` |
| `-X` | `-X` |
| `+Y` | `-Z` |
| `-Y` | `+Z` |
| `+Z` | `+Y` |
| `-Z` | `-Y` |

For example, `socket:in:-Y:0.3` describes a nominal 0.3-meter opening toward runtime +Z. Use model bounds and the generator geometry to determine the connection position. Placement scaling also changes the opening size.

## Source and limits

- `public/assets/props/*.glb`: static runtime models.
- [public/assets/source/industrial.blend](https://github.com/series-ai/run-workshop/blob/main/games/inkline-showcase/public/assets/source/industrial.blend): all 291 props in category collections.
- `scripts/blender/props.py`: mesh and material generator.
- `public/assets/previews/*.png`: rendered model previews.

Run the generator from the app directory:

```bash
/Applications/Blender.app/Contents/MacOS/Blender --background --factory-startup --python scripts/blender/props.py -- --out public/assets
```

The source scene places models in a display grid. Individual exports retain their local origins. Regenerate the catalog, previews, and district after a geometry change.

The models do not contain a physics rig, moving machine parts, weapon logic, or collision meshes. The demo supplies selected collision proxies separately. See [level-contract.md](level-contract.md) and [reuse.md](https://github.com/series-ai/run-workshop/blob/main/games/inkline-showcase/docs/reuse.md).
