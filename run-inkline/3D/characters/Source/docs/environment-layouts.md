# Environment layouts

Inkline has two extra layouts for the industrial prop pack.

| Layout | Role | Placements | New modules | Actor support |
| --- | --- | ---: | ---: | --- |
| Service Yard | Repair, loading, and utility yard | 81 | 30 | Ground `y=0`; dock `y=1.04` |
| Roof Works | Elevated roof inspection route | 103 | 21 | Roof `y=4`; landing `y=4.6` |

The typed source is `src/runtime/layouts.ts`. It exports `EXTRA_LAYOUTS` and
the `EnvironmentLayout` contract. The JSON files use meters, `+Y` up, and the
same placement shape as the district layout.

## Service Yard

The yard uses a six by five floor grid. Each floor slab is four metres wide,
four metres deep, and has its top at `y=0`. The service bay is on the north-west
edge. The loading platform and half-turned ramp form the east loading lane. The
utility row faces the open center. The walkway parts form one route from the
north bay through the T and L turns, across the narrow bridge, down the scaled
service ramp, and onto a low service platform.

The loading platform deck top is `y=1.04`. The loading actor uses root `y=1.04`.
Ground actors use root `y=0`.

The layout uses these new module IDs:

`service-bay-arch`, `service-bay-canopy`, `service-bay-pillar`,
`service-bay-door-track`, `service-bay-workbench`, `service-bay-tool-board`,
`loading-platform`, `loading-platform-ramp`, `loading-dock-bumper`,
`loading-dock-ladder`, `loading-gate`, `loading-wheel-stop`, `walkway-straight`,
`walkway-t-junction`, `walkway-l-junction`, `walkway-ramp`,
`walkway-rail-gate`, `walkway-rail-kickplate`, `walkway-bridge-narrow`,
`walkway-service-steps`, `pipe-manifold`, `pipe-vertical-elbow`,
`utility-panel`, `utility-panel-double`, `utility-cabinet-low`, `utility-bench`,
`utility-tool-rack`, `utility-drain-channel`, `utility-sewer-opening`, and
`utility-meter-pedestal`.

## Roof Works

The roof uses the same six by five grid above a matching ground grid. Six open
warehouse bay frames form the building base. Each frame is scaled to four
metres high. Its top beam meets the roof slab underside. A ground office,
container, generator, ladder, and perimeter fences provide service context.
Each roof slab is four metres wide, four metres deep, and has its top at `y=4`.
Low curbs and safety posts mark the edge. The equipment plinth, vent stack, and
antenna stay near the perimeter. The walkway pieces form one route from the
west straight, through the grated turn and cross junction, across the bridge,
up the short stair, and onto the raised landing.

The roof ladder landing starts at `y=4` with its authored lower attachment at
`y=3.82`. Its landing deck is above the roof. The main walkway landing is
placed at `y=3.57`, so its deck top is `y=4.6`. Its actor root is `y=4.6`.

The layout uses these new module IDs:

`roof-curb-straight`, `roof-curb-corner`, `roof-access-hatch`,
`roof-service-vent-stack`, `roof-equipment-plinth`, `roof-safety-post`,
`roof-drain-scupper`, `roof-antenna-mast`, `roof-cable-bridge`,
`roof-fall-arrest-anchor`, `roof-ladder-landing`, `roof-duct-curb`,
`walkway-straight`, `walkway-grated-turn`, `walkway-cross-junction`,
`walkway-landing`, `walkway-stair-short`, `walkway-bridge-narrow`,
`walkway-ramp`, `pipe-flange-pair`, and `pipe-inspection-port`.

## Snap and connector rules

- Use a four metre floor snap grid for slabs and perimeter panels.
- Use a two metre centerline for walkways and service lanes.
- Keep walkway centerlines at least two metres wide for a figure route.
- Place ramps along their authored local Z axis. Their low end is at local positive Z.
- Place straight walkways along local Z. Rotate by `Math.PI / 2` for an east-west run.
- Keep service bay arch and canopy openings clear at their local center.
- Keep loading platform ramps aligned to the platform centerline.
- Place pipe modules with their authored local Z axis toward the service lane.
- Keep roof curbs and fall arrest modules on the four metre roof edge grid.
- Keep floor slabs at `[x, -0.16, z]` with size `[4, 0.16, 4]` for ground.
- Keep roof slabs at `[x, 3.84, z]` with size `[4, 0.16, 4]` for the roof.
- Place the loading ramp at yaw `Math.PI` so its high end meets the dock.
- Place the short stair low end on the bridge deck and its high end on the landing.

The placement origins are authored object centers. A module does not use a
padding box. Repeated modules use the same dimensions and local sockets.
Each layout also exports `inspectionRoute` points at the intended deck surface.
The verification script raycasts these points at ten centimetre spacing.

## Effects and export

Each layout has four sparse effect sources. Service Yard uses welding arc, pipe
leak, hazard flare, and steam burst. Roof Works uses electric arc, steam burst,
welding arc, and hazard flare. The renderer triggers these sources only when
ambient effects are enabled.

Generate the scene assets with:

```sh
/Applications/Blender.app/Contents/MacOS/Blender --background --factory-startup --python scripts/blender/level.py -- --out public/assets --district public/assets/service-yard.json --source public/assets/source/industrial.blend --manifest public/assets/props.json --target-blend public/assets/source/service-yard.blend --target-glb public/assets/scenes/service-yard.glb
/Applications/Blender.app/Contents/MacOS/Blender --background --factory-startup --python scripts/blender/level.py -- --out public/assets --district public/assets/roof-works.json --source public/assets/source/industrial.blend --manifest public/assets/props.json --target-blend public/assets/source/roof-works.blend --target-glb public/assets/scenes/roof-works.glb
```

The exporter checks placement count, unique mesh count, finite bounds, unique
node names, and unlit materials. The editable blend files keep the same named
placement objects as the exported GLB files.
