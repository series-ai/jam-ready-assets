# Contact time correction

The GLB exporter retains Blender frame time. Its first sampled key is at 1/30 second. The previous catalog treated frame 1 as time zero. Contact events therefore ran one frame before the authored contact pose.

The error was visible in the new weapon review. At 0.300 seconds, the Staff Thrust shaft had direction `[-0.367, 0.570, 0.735]`. At frame 10, or 0.333333 seconds, its direction was `[0, 0, 1]`. The shield also reached its intended upright orientation at the later time.

The correction changes contact metadata to `contactFrame / 30`. It does not shift the animation tracks. The compatibility report compares all 720 previous tracks with the installed pack before replacement.

`verify-assets.ts` now checks each contact event against the first time in the actual GLB samplers. It failed on the previous Punch Left metadata before the correction. `verify-contact-poses.ts` separately measures mounted weapon directions and the folded knee pose at the catalog contact time.
