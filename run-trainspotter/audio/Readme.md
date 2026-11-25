# Trainspotter Audio

Original assets for RUN. Keep License.txt with redistributed files.

Railway sound effects to go with the Trainspotter voxel railway kit
(`run-trainspotter/3D/vehicles-racing`, "Trainspotter 3D"): steam, diesel and
electric trains, wheels on rails, stations, signals and the countryside they
run through. 36 sounds, 79 files, Ogg Vorbis at 44.1 kHz stereo.

Most sounds come in two takes, `<name>_01.ogg` and `<name>_02.ogg`; alternate
them so repeats don't sound the same. Names ending in `-loop` loop without a
seam. One-shots are levelled to about -16 LUFS and loops to about -20 LUFS.

| Group | Sounds |
| --- | --- |
| steam | `approaching-steam-train` (a short showcase: chuffing that swells in, with a whistle), `steam-chuff` (4 single exhaust beats), `steam-chuff-loop-slow`, `steam-chuff-loop-fast`, `steam-whistle-short`, `steam-whistle-long`, `steam-hiss` (cylinder drains), `steam-safety-valve`, `steam-bell` |
| diesel | `diesel-idle-loop`, `diesel-throttle-up`, `diesel-horn-short`, `diesel-horn-long` |
| electric and high-speed | `electric-motor-whine`, `electric-horn`, `pantograph-arc`, `highspeed-pass-by`, `highspeed-horn` |
| track | `rail-clatter-loop`, `rail-joint` (4 single wheel-over-joint clacks), `freight-pass-by`, `wheel-squeal`, `brake-squeal`, `coupling-clank`, `points-throw` |
| station | `station-chime`, `door-open`, `door-close`, `guard-whistle`, `station-ambience-loop` |
| signals and crossings | `crossing-bell-loop`, `crossing-gate`, `signal-clunk`, `tram-bell` |
| countryside | `countryside-ambience-loop` (breeze and birdsong), `bird-chirp` (6 single calls) |

The single hits (`steam-chuff`, `rail-joint`, `bird-chirp`) are for rhythm
that follows a game: play one chuff per exhaust beat, four per turn of the
driving wheels, and one clack per axle as it crosses a rail joint, so a train
at a steady speed keeps a steady clickety-clack and a slowing train slows its
rhythm. Scatter bird calls at random times and pitches over the countryside
loop.

The kit's helper does all of this: `helper/trainaudio.js` in the 3D folder
plays these files for trains running on its track (chuffs, clacks, rumble,
horns, brakes, station sounds and the countryside). Pass this folder as its
`base`.

## Credits

Made by RUN.hugh3, with ElevenLabs sound effects. Source:
https://github.com/series-ai/run-workshop/tree/main/tools/run-trainspotter
