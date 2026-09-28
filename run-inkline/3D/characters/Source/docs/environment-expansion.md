# Environment Expansion

This expansion adds 48 industrial environment modules. The pack now has 291
prop GLBs and 185 industrial models.

Dimensions below use the runtime catalog order: X, Y up, Z. One unit is one
meter. Blender uses Z up and -Y forward. The exporter maps Blender `(x, y, z)`
to runtime `(x, z, -y)`.

## Roof modules

| ID | Dimensions (m) | Triangles |
| --- | ---: | ---: |
| `roof-curb-straight` | 4 x 0.32 x 0.355 | 36 |
| `roof-curb-corner` | 2.2 x 0.335 x 2 | 60 |
| `roof-access-hatch` | 1.35 x 0.665 x 1.35 | 100 |
| `roof-service-vent-stack` | 0.9 x 1.78 x 0.9 | 228 |
| `roof-equipment-plinth` | 2.2 x 0.87 x 2.2 | 184 |
| `roof-safety-post` | 2.08 x 1.25 x 0.28 | 388 |
| `roof-drain-scupper` | 1 x 1.35 x 0.86 | 196 |
| `roof-antenna-mast` | 0.761 x 3.383 x 0.77 | 176 |
| `roof-cable-bridge` | 1.7 x 0.88 x 2.255 | 72 |
| `roof-fall-arrest-anchor` | 1.28 x 1.255 x 1.18 | 240 |
| `roof-ladder-landing` | 1.8 x 1.597 x 1.445 | 588 |
| `roof-duct-curb` | 2 x 0.96 x 2 | 84 |

## Walkway modules

| ID | Dimensions (m) | Triangles |
| --- | ---: | ---: |
| `walkway-straight` | 2 x 1.165 x 4.1 | 532 |
| `walkway-t-junction` | 3 x 1.1 x 2.75 | 116 |
| `walkway-l-junction` | 2.6 x 1.05 x 3 | 116 |
| `walkway-ramp` | 2 x 1.724 x 3.1 | 372 |
| `walkway-stair-short` | 1.26 x 1.673 x 1.95 | 412 |
| `walkway-landing` | 2 x 2.025 x 2 | 420 |
| `walkway-rail-gate` | 1.18 x 1.15 x 0.08 | 132 |
| `walkway-rail-kickplate` | 2.1 x 1.06 x 0.12 | 200 |
| `walkway-bridge-narrow` | 1.02 x 1.145 x 6.1 | 448 |
| `walkway-grated-turn` | 2.26 x 1.125 x 2.9 | 604 |
| `walkway-service-steps` | 0.9 x 0.692 x 1.13 | 88 |
| `walkway-cross-junction` | 4.3 x 1 x 4.3 | 152 |

## Service bay and loading modules

| ID | Dimensions (m) | Triangles |
| --- | ---: | ---: |
| `service-bay-arch` | 4.05 x 3.74 x 0.45 | 184 |
| `service-bay-canopy` | 3.9 x 3.27 x 2.9 | 204 |
| `service-bay-pillar` | 0.9 x 3.92 x 0.9 | 204 |
| `service-bay-door-track` | 4 x 0.57 x 0.44 | 128 |
| `service-bay-workbench` | 2.2 x 1.645 x 0.945 | 160 |
| `service-bay-tool-board` | 2.4 x 1.8 x 0.19 | 120 |
| `loading-platform` | 4 x 2.075 x 2.035 | 384 |
| `loading-platform-ramp` | 2 x 1.974 x 4.1 | 208 |
| `loading-dock-bumper` | 3.4 x 1.15 x 0.565 | 96 |
| `loading-dock-ladder` | 0.8 x 1.54 x 0.35 | 144 |
| `loading-gate` | 3.455 x 1.3 x 0.55 | 100 |
| `loading-wheel-stop` | 2.4 x 0.42 x 0.54 | 56 |

## Pipe and utility modules

| ID | Dimensions (m) | Triangles |
| --- | ---: | ---: |
| `pipe-manifold` | 1.84 x 2.2 x 0.7 | 648 |
| `pipe-vertical-elbow` | 1.209 x 1.809 x 0.44 | 368 |
| `pipe-flange-pair` | 0.457 x 0.48 x 1.44 | 252 |
| `pipe-inspection-port` | 0.666 x 1.052 x 0.7 | 272 |
| `utility-panel` | 1.115 x 2 x 0.53 | 68 |
| `utility-panel-double` | 2.3 x 1.91 x 0.52 | 112 |
| `utility-cabinet-low` | 1.5 x 1.1 x 0.775 | 72 |
| `utility-bench` | 1.8 x 1.05 x 0.755 | 148 |
| `utility-tool-rack` | 1.8 x 2.5 x 0.23 | 156 |
| `utility-drain-channel` | 2.4 x 0.42 x 0.7 | 112 |
| `utility-sewer-opening` | 1.5 x 0.36 x 1.5 | 112 |
| `utility-meter-pedestal` | 0.95 x 1.3 x 0.8 | 244 |

## Placement and connectors

Every new builder uses a local origin. Floor-touching modules start at Z zero
in Blender. Elevated service attachments keep their authored height. Place
each asset at the floor or at the intended roof deck. The catalog bounds are
the source of truth for the runtime placement size.

Use the 2m grid for walkway, hatch, plinth, platform, and junction placement.
Use the 4m grid for roof curbs, service bay frames, loading platforms, and
long walkway runs. Use half-grid offsets for one-meter access pieces. Align
walkway endpoints at the center of the short edge. Align bay posts at the
outer edge of the 4m opening.

Pipe sockets use the contract axis tags. `pipe-manifold` has a bottom `-Z`
socket and branch `+X` sockets. `pipe-vertical-elbow` has a bottom `-Z`
socket and a horizontal `+X` outlet. `pipe-flange-pair` runs from `-Y` to
`+Y`. `pipe-inspection-port` has a bottom `-Z` socket. The nominal pipe
opening is 0.3m unless the tag states another value.

The new modules use the existing unlit materials. Large faces use off-white.
Frames and rails use structural gray. Orange marks show service points,
anchors, or safety edges. No texture maps or lights are stored in the GLBs.
Every new mesh is below 700 triangles. The full pack remains below the 2,500
triangle per-prop contract limit.
