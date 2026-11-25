# Trainspotter 3D

Original assets for RUN. Keep License.txt with redistributed files.

**Lay track, run trains.** A voxel railway kit: track that snaps together on a
45-degree grid, 61 locomotives, carriages, wagons, trams and metro cars from
every era, and the stations, signals, bridges, tunnels, towns and scenery to
build a whole model railway. Made for route-building board games, railway
management games and train-driving games.

The trains follow well-known real types (a green express steam engine, a
streamlined diesel, a round-nosed bullet train, stainless commuter sets) under
plain descriptive names, in the chunky RUN voxel style.

The sounds that go with it are in this pack's audio folder
(`run-trainspotter/audio`, "Trainspotter Audio").

- `railway-track/`: 19 pieces: straights (32 to 256 long and a diagonal),
  curves (45 and 90 degrees, three radii), switches, an S-shift, a diamond
  crossing, a ramp, a level crossing, a buffer stop and a turntable. Switch
  blades and the turntable move with `open` / `close` clips.
- `steam-locomotives/`, `diesel-locomotives/`, `electric-locomotives/`,
  `high-speed-trains/`, `trams-metro/`: locomotives with tenders, power cars
  and intermediate cars, commuter and metro cab and middle cars, trams and a
  hill cable car. Every vehicle has `idle` and a looping `move` (wheels turn,
  steam rods drive); pantographs and sliding doors use `open` / `close`.
- `passenger-carriages/`, `freight-wagons/`, `freight-loads/`: 8 carriages,
  12 wagons, and 5 loads that sit on a wagon's `socket-load`.
- `stations-platforms/`, `signals-crossings/`, `lineside-props/`: platforms
  (side, island, ramp ends, canopy), three stations and a signal box,
  semaphore and colour-light signals, crossing gates and lights, a water
  tower and crane, catenary masts, lamps, benches and nameboards. Signals and
  gates move with `open` / `close`.
- `bridges-tunnels/`: girder, truss and arched viaduct spans, a pier, and
  single- and double-track tunnel portals.
- `city-buildings/`, `city-street/`, `scenery-nature/`, `scenery-terrain/`:
  houses, shops, a church, offices, a factory and a warehouse; roads, cars, a
  bus, a van, people, lamps and telegraph poles; trees, bushes, rocks and
  flowerbeds; a tunnel hill, a mound, a mountain peak, a cliff and a retaining
  wall.
- `board-game-tokens/`: a train car, a station marker and a route segment for
  board games, recoloured at runtime.
- `helper/`: a three.js helper. `trainkit.js` lays track from a list of
  pieces and runs trains over it, with the whole catalogue built in, so only
  the GLBs need loading. `trackpath.js` holds the path maths with no
  dependencies, `trainfx.js` the steam, exhaust and spark effects,
  `driver.js` station stops and signals, and `trainaudio.js` the sounds.

Units: 1 unit is 1 voxel; a person is 36 tall, a coach 160 long. +Y is up and
vehicles face -Z. Scale a train's group to suit your game.

## How the pieces fit

- **Track.** A piece's origin is its connector `a`, on the centre line at
  ground level, and the track leaves `a` toward -Z. Connectors are empty
  nodes named `socket-track-a`, `-b` (and `-c` on switches) on a 32 grid at
  multiples of 45 degrees, so pieces join end to end. Rails are 30 apart, the
  rail top is 8 above the ground, and parallel tracks are 64 apart. Curves
  turn right; turn one round to go left.
- **Vehicles.** The origin is on the centre line in the rail-head plane,
  midway between the bogies. Couplers (`socket-coupler-f`, `-r`) are 10 above
  the rail, so coupled cars meet face to face; floors are 16 above the rail,
  level with a platform. Wheel radii are 6, 9, 12 or 18, so every wheel turns
  a whole number of times in one 3-second `move` loop.
- **Platforms and stations** stand beside a straight and use that piece's
  position and rotation.
- **Colours.** Every vehicle has three colour roles, `paint`, `trim` and
  `accent`, that the helper can swap; lamps, glass, rails and ironwork keep
  their colours. Some vehicles carry named liveries.

## Using them in a game

```js
import * as THREE from 'three';
import { TrainKit, TrainFx } from './helper/trainkit.js';

const kit = await TrainKit.load('assets/run-trainspotter-3d/'); // this folder
const layout = await kit.layout([
  'track-curve-90-r192', 'track-curve-90-r192', 'track-straight-256',
  'track-curve-90-r192', 'track-curve-90-r192', 'track-straight-256',
]);
scene.add(layout.group);

const train = await kit.consist([
  { id: 'steam-express-green' }, { id: 'tender-express' },
  { id: 'coach-classic', paint: 'teal' }, { id: 'coach-dining' },
]);
scene.add(train.group);
train.setTrack(layout, layout.edge(0));
train.go(90);                        // voxels per second; train.brake() stops smoothly

const fx = new TrainFx(scene);       // steam timed to the wheels, exhaust, sparks
fx.attach(train);

// every frame
layout.update(dt);
train.update(dt);
fx.update(dt);
```

- `layout.setSwitch(step, 'open' | 'close')` throws a set of points; trains
  follow whichever route is set.
- `kit.beside(layout, step, 'platform-side')` places a platform or station
  beside a straight.
- `await kit.catenary(layout)` returns overhead wires and masts for electric
  trains, as a group to add to the scene.
- `car.setDoors(true)` and `car.setPantograph(true)` drive the moving parts.
- `train.reverse()` turns a train round on the spot.
- `driver.js` runs trains like a railway: station stops with doors, shuttles
  that reverse at the end of the line, and signals.
- `trainaudio.js` plays the Trainspotter sounds: chuffs on the driving
  wheels' beats, wheels clacking over rail joints, horns, brakes and station
  sounds. Point it at the audio folder,
  `new TrainAudio({ base: 'assets/run-trainspotter-audio/' })`, call
  `await audio.start()` from a click, `audio.attach(train)`, then
  `audio.update(dt, camera.position)` every frame.

The helper imports `three` and `three/addons/...`, so use an import map or a
bundler. Without it, every GLB is an ordinary model: play `move` to turn the
wheels, and join pieces at their sockets.

## Credits

Made by RUN.hugh3. Source:
https://github.com/series-ai/run-workshop/tree/main/tools/run-trainspotter
