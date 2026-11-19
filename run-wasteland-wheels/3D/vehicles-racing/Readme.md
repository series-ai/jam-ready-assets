# Wasteland Wheels 3D

Original assets for RUN. Keep License.txt with redistributed files.

**Bolt any body onto any wheels.** A school bus on monster-truck tyres, an
ice-cream van on tank treads, a muscle car with drag slicks behind and spiked
wheels in front, a chopper towing a camper: every body takes every wheel set,
every bolt-on and any chain of trailers, and every paint job can be swapped.

Grungy, toy-proportioned wasteland vehicles with pixel-painted rust, dust and
drips. 23 bodies (buses, vans, muscle cars, buggies, a semi, an RV, a hearse,
an armchair on treads and four motorcycles), 8 wheel kinds plus treads, 27
bolt-ons and 5 trailers. When the front and rear wheels differ in size the body
tips toward the smaller ones, and the helper drives springy suspension,
squash and stretch, and wheels that stay on the ground.

- `vehicles/*.glb`: the 23 bodies, ready-made with wheels and bolt-ons, each
  with four clips: `idle`, `move` (looping), `accelerate` and `brake` (a
  springy launch and stop). Drop one in and play a clip.
- `kit/bodies/body-*.glb`: the bare bodies, with mount points (sockets).
- `kit/bodies/trailer-*.glb`: the trailers.
- `kit/wheels/*.glb`: wheel modules for the front (`-f`), rear (`-r`) and
  trailer (`-t`) axles, and `treads-<class>.glb`.
- `kit/parts/<slot>-<name>.glb`: the bolt-ons.
- `kit/wheelskit.js`: a three.js helper that assembles, recolours and animates
  vehicles from the kit. The whole catalogue is built in, so only the GLBs
  need loading.

Units: 1 unit is 1 voxel; a person is about 36 tall, a school bus about 130
long. Scale the vehicle's group to suit your game. +Y is up and vehicles face
-Z.

## The kit

| Part | Choices |
| --- | --- |
| bodies | `bus-hood`, `bus-flat`, `icecream`, `muscle`, `hatch`, `pickup`, `wedge`, `rally`, `roadster`, `buggy`, `armchair`, `bug`, `cruiser`, `camino`, `hearse`, `franken` (two cars welded nose to nose), `semi`, `tow`, `rv` |
| motorcycles | `chopper`, `dirt`, `chairbike`, `scooter` |
| wheels | `monster`, `tractor`, `wire`, `steel`, `spiked`, `slick`, `balloon`, `chained`, or `treads` (front and rear together) |
| single wheels | `mono-<kind>` for every wheel kind: a single on both axles makes a motorcycle, a single and a pair make a trike |
| roof | `cone`, `rack-spare`, `rack-cargo`, `jerry-frame`, `light-bar`, `harpoon`, `searchlights`, `tyre-stack`, `dish`, `surfboard` |
| hood | `blower`, `blower-giant`, `scoop`, `velocity-stacks`, `turbo` |
| stacks | `stack`, `zoomies`, `flame-stack` (a pair, left and right) |
| bumper | `cow-catcher`, `longhorns`, `roo-bar`, `dozer-blade`, `spike-ram`, `winch-bumper`, `tusks`, `tyre-bumper`, `log-ram` |
| trailers | `tanker`, `cattle`, `flatbed`, `camper`, `box`, on any wheel kind |
| paints | `gold`, `orange`, `red`, `pink`, `purple`, `sky`, `teal`, `lime`, `khaki`, `bone`, `steel`, `iron` |

Not every body has every mount point: a slot without its socket on that body
is skipped. `KIT.bodies[name].sockets` lists them.

Every vehicle has three colour roles: `paint` (the body), `trim` (stripes and
panels) and `accent` (bumpers, grilles and details). Bolt-ons and trailers
follow the same roles; each trailer can also have its own colours.

## Using them in a game

```js
import * as THREE from 'three';
import { WheelsKit } from './kit/wheelskit.js';

const kit = await WheelsKit.load('assets/wasteland-wheels/kit/');
const v = await kit.build({
  body: 'bus-hood', front: 'monster', rear: 'monster',
  roof: 'tyre-stack', hood: 'blower', stacks: null, bumper: 'longhorns',
  paint: 'gold', trim: 'iron', accent: 'red',
  trailers: [{ type: 'tanker', wheels: 'steel', paint: 'red' }, { type: 'cattle' }],
});
v.group.scale.setScalar(1 / 36);   // about 1 unit per person
scene.add(v.group);
v.play('accelerate');              // idle | move | accelerate | brake
v.drop();                          // a bounce on its springs, e.g. after a jump

// every frame
v.update(dt);
```

- `KIT.bodies[name].defaults` is the loadout each ready-made vehicle uses.
- For racing, call `v.drive(dt, speed, forwardAccel, sideAccel)` each frame
  instead of `update`: the body pitches, rolls, squashes and bounces from the
  forces, bikes lean into turns, and trailers can swing by setting
  `v.trailers[i].yaw`.
- `await v.exportGLB()` returns the assembled vehicle as a GLB with every clip
  baked, so you can build custom vehicles once and load them as plain models.

Without the helper, the `vehicles/*.glb` files are ordinary animated models.
Kit pieces join at named empty nodes (`socket-axle-f`, `socket-axle-r`,
`socket-belly` for treads, `socket-roof`, `socket-hood`, `socket-front`,
`socket-stack-l` and `-r`, `socket-hitch`, and on trailers `socket-coupler`
and `socket-axle-t`).

## Credits

Made by RUN.sterf. Source:
https://github.com/series-ai/run-workshop/tree/main/tools/run-monster-trucks
