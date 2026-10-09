# Joint and spine correction — 1.3.1

The elbow and knee dots came from separate rigid spheres over a skinned tube.
The hinge rings were also wider than the limb shafts. During a bend, blended
skin weights compressed the tube while the sphere kept its full round shape.

All six limb spheres are removed, including the wrist spheres. The elbow and
knee rings now match the shaft radius. Each limb remains one connected tube.
The head remains round. Each body now has 1,712 triangles, down from 2,192.

The earlier torso used several large local rotations. Their combined effect
made the spine bend more than this stick figure style needs. The correction
retains one quarter of the authored Spine and Chest rotations, with initial
limits of six and four degrees. Small role offsets also use one quarter of
their prior values. The final exported mesh is checked after those offsets.

The removed curve becomes whole-body lean. The direction from the leg junction
to the neck stays the same at authored keys. The thigh roots, arm roots, and
neck keep their world orientation. Support feet and weapon contacts are baked
after this change. Clip names, durations, events, and the 18-bone rig stay the
same. This is an export correction. It adds no runtime solver or render pass.

Across 53,292 sampled poses on all 12 bodies, root-mean-square torso curvature
falls from 21.26 to 4.60 degrees. The largest sampled combined bend is 10.45
degrees. This measurement sums the two angles along the hip-to-neck chain.
It does not measure body lean relative to the ground.

The checks cover all 1,020 body/clip pairs, 672 grounded pairs, 24 fall/recovery
boundaries, 288 weapon-contact poses, and 252 avatar contact cases. The joint
fixtures cover black and pale standard, thin, and heavy bodies at four bend
angles in three views. Deep bends retain angular line corners. They no longer
use round joint dots. Front-view limb overlap can still occur.

The full motion review uses the corrected assets at normal speed. The earlier
full-pack films remain labeled as 1.3.0 reference material. Their character
geometry predates this follow-up. The live demo and downloads use 1.3.1.

The prior 15-minute desktop performance result applies to 1.3.0 character
files. Runtime rendering code is unchanged and triangle counts are lower,
but the old measurement is not a new device test. Physical Android performance
remains unverified.
