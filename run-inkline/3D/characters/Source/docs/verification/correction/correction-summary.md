# INKLINE 1.3 correction summary

This pass addresses the seven reported faults. The review index contains the
new tour, the comparison with release 1.2, the phone capture, and a separate
review of all 85 clips. The images and films show the exported assets.

## Camera

The old clearance search selected discrete yaw and pitch values from animated
body points. It applied that selection after camera smoothing. A small limb
movement could therefore produce a large camera jump. Recorded jumps ranged
from 6.98 to 16.82 metres. Resize also restored the default review angle.

The new solver preserves the requested direction and changes distance through
one damped state. It uses a fixed body envelope. A local foreground opening
keeps the active figure and one nearby reacting target visible. It preserves
the support floor and rear geometry. A fixed framing allowance covers target
lag near walls. New review content fits its own bounds while keeping the chosen
angle. Orthographic fits keep enough depth for a later manual orbit.

The final checks include continuous routes, jumps, rendered body pixels,
stationary camera drift, user orbit, phone resizing, and near-plane clearance.
Read `camera-diagnosis.md` for the causes and exact results.

## Bodies and motion

The earlier rig construction added anatomical width. It worked against the
chosen Flash direction. Each body now has one spine, a common arm junction,
and a common leg junction. Shoulder bars, hip bars, belts, and collars are
removed. Height, stroke width, head size, limb length, guard stance, and
equipment distinguish the twelve figures.

The references get much of their style from whole-body gestures, open space
between limbs, uneven timing, firm support feet, and clear force direction.
The prior pack relied too much on upright poses, soft interpolation, and
effects around weak movement. The correction gives the main strikes stronger
preparation, reach, contact, and recovery. It also corrects the hip translation
input, plants the support feet, and matches travel playback to movement speed.

The pass rewrites the main unarmed, sword, bow, reaction, fall, and recovery
poses. It rebuilds ten travel cycles and retimes the other contact attacks.
Several secondary clips retain their prior poses. `figure-correction.md` lists
the exact changes. The new forward recovery raises the shared catalog to 85
clips. The checks cover all 1,020 body-and-clip combinations and mounted grips.

## Pale edges and directional falls

A skinned back-face contour replaces the view-normal band on pale figures.
Its width follows screen size. Head scaling now uses the head bind origin.
The cap join and thin-body head connection are also corrected.

Hit and fall selection uses the incoming force relative to the target facing.
A rear hit produces a forward fall. A front hit produces a backward fall.
The target retains its landing position and uses the matching recovery clip.
The scene opening also keeps the nearby fallen target visible behind ramps.

## Surfaces and other repairs

The source geometry now separates orange caps, bands, and plates from their
base surfaces. Several collar axes and exposed structural joins are corrected.
All 291 prop files pass the orange overlap scan. The assembled-scene scan also
checks separate placed objects. It found a roof cap and deck overlap that the
individual prop scan could not detect. Six warehouse caps now sit 10 mm below
the unchanged roof surface. The final scene scan has no exposed orange pairs.
Sampled normal-ray checks do not prove visibility from every oblique angle.

Other corrections cover equipment grip frames, bow-string motion, avatar foot
thickness, paused reset behavior, and the header at intermediate screen widths.

## Remaining limits

The 3D limbs still form straighter segments than the curved strokes in drawn
Flash frames. Some front and top views merge limbs through foreshortening.
The shared rig provides less individual acting than a hand-drawn film. The
pack remains an original 3D interpretation of that direction.

Climb and vault clips need placement against a game's own obstacles. The extra
scenes are visual assemblies; their layout data does not provide full game
collision. The district demo includes its own explicit collision proxies.

Desktop performance results and their exact source hashes are in
`../../performance.md`. A physical 2022 Android test remains unverified.
`final-review.json` records completed checks. The external
`../package-acceptance.json` records the final archive and local installation
checks after delivery.
