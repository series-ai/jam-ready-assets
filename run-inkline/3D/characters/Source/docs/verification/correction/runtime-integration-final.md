# Final runtime integration review

Reviewed the frozen runtime source on 2026-09-27. The review covered coordinate
spaces, ownership and disposal, camera state, contact timing, directional falls,
and avatar deformation. No runtime source changed during this review.

The review found no P0 or P1 fault.

`assets.ts` keeps source GLTF geometry shared and clones instance materials. It
marks generated geometry as owned. `disposeInstance` disposes owned geometry,
instance materials, and each primary skeleton once. It leaves shared source
geometry for `AssetLibrary.dispose`. Equipment and headwear follow the same
ownership path. The support solver converts the grip point and rifle axis to
world space before it solves the arm in parent space. Equipment contact points
return to world space before hit tests (`assets.ts:28-61`, `assets.ts:287-405`).

Avatar deformation stores pristine bind-space positions. It derives bone
centres from the bind matrices. Headwear uses the Head bind frame. The contour
shares the primary skeleton and geometry. Black bodies hide the contour without
creating a second contour (`assets.ts:70-205`).

`renderer.ts` stops and uncaches mixers before scene replacement. It disposes
all content roots, checks scene and equipment generations after each async load,
and rejects stale results. Camera framing resets `CameraMotion` and the
foreground cutaway after a scene or camera change. Game updates evaluate the
actor mixer before contact resolution. The camera then uses the resolved body
position and the current collision clearance (`renderer.ts:337-426`,
`renderer.ts:514-565`, `renderer.ts:819-930`).

Contact timing uses the manifest contact time and fires once when a step crosses
that time. The tick loop uses 1/60-second substeps. Falls keep their horizontal
landing displacement and choose `get-up-forward` for a forward death. The
direction rule uses target local +Z as forward and normalises horizontal force
vectors (`presentation.ts:116-126`, `kinetics.ts:180-207`,
`renderer.ts:657-708`, `renderer.ts:765-785`).

The cutaway converts the body focus to camera view space. It tests world floor
height and camera depth in the shader. It applies only to game district
surfaces and resets on scene changes (`cutaway.ts:12-56`). Catalog parsing
rejects invalid contact times, duplicate IDs, external paths, and travel clips
without loops (`catalog.ts:20-56`).

The repeatable travel check passed against the final public files. It used all
12 character GLBs, 10 travel clips, 1,080 rate and frame scenarios, six active
cycle wraps per scenario, and 372 contact checks across 31 clips. It found no
failures. The maximum phase error was `1.23e-15` seconds. The checked manifest
is version `1.3.0`. The check does not create a WebGL renderer or open a
browser.

The source hashes for this review are:

| File | SHA-256 |
| --- | --- |
| `src/runtime/assets.ts` | `9ff77bc1fd4186adedcaa32d91259f452b625e4a87a38abd3f807ac1430888bc` |
| `src/runtime/renderer.ts` | `303fc8e035ec3fb650e3c1ddee4218295f63acd071ac9de1f0393eb9e44e5b5a` |
| `src/runtime/kinetics.ts` | `8712470c57527c7c261c67ef98e718e670b9fea29f875ee44556115ebf2898ad` |
| `src/runtime/cutaway.ts` | `bb2bc82a9a11b8d80d90f4db2a8702432b513d98dfdf1efc997e012dbb463a29` |
| `src/runtime/presentation.ts` | `78fa996d0da36284fc676086a574a2b3649b0afe8b44c8e779b50c7656754199` |
| `src/catalog.ts` | `3a96cb664fc1b12c6c949b99cc8b3de7a9c5b6d4ea0f34c95cd0a259a2ae1bf3` |
| `public/assets/manifest.json` | `3e659eaa99da26a78a7cf7d12fc98caefd67d46d316491b74f2192c095f804e6` |

The travel receipt records the same renderer and manifest hashes. This review
does not prove GPU depth ordering, shader compilation, visual equipment contact,
or all browser camera routes. Those limits remain with the browser and visual
verification reports.
