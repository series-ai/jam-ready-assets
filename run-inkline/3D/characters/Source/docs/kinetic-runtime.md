# Kinetic runtime pass

The asset catalog version is 1.3.0. The pack has 12 figures, 85 clips per figure, 291 props, and 64 effects. The quality correction adds a forward recovery clip and changes the body construction, support-foot motion, camera, reactions, and pale contour. See the [style assessment](style-correction.md).

## Action and contact

The exported clip metadata defines the contact time. `advanceAttack()` emits one contact event. The game uses that event for damage, the effect, and the target response. A miss does not stop time.

Impact profiles separate light hits, heavy hits, kicks, melee tools, and ranged tools. A nonlethal reaction starts at zero, reaches an early peak, and returns to zero. The direction selector uses the force relative to the target facing. A rear hit selects a forward fall. A front hit selects a backward fall. A side hit turns the fall toward the force by no more than a quarter turn.

A knocked-down target stays at its landing position. Its root does not move back during the fall. The target uses `get-up` after a backward fall and `get-up-forward` after a forward fall. Reset restores the original training positions. These are authored reactions, not a ragdoll simulation.

Staff grips use the shared thrust contact pose. The animation catalog supplies the reference time. Each body keeps the same forward staff axis despite its different idle pose.

Melee tools use the nearest point on their visible segment and the target chest bone. The target must also pass bounded range, facing, and scene visibility tests. Ranged attacks stop at the first visible target. A scene surface can block a shot. A short trace connects the muzzle to the contact point.

A new attack press can wait for 160 ms. Holding the input does not add more presses. The buffer uses real elapsed time. Slow playback does not lengthen it. Reset, blur, scene changes, and equipment changes clear pending input.

## Motion accents

The trail pool contains four paths with 16 samples each. It uses one mesh, one draw call, and at most 240 triangles. Trail samples follow the active hand, foot, or matching held tool. They expire in no more than 180 ms. The pool does not allocate geometry during playback. Inactive trails do not upload buffers.

The overview has a short platform and ramp sequence. The figure runs, jumps, lands, turns, and returns. Combat uses the same clip contact clock as the playable arena. Movement effects mark sprint starts, hard stops, jumps, and landings.

Dust uses open uneven strokes. Each stroke grows as its instance alpha fades. The other graphic effects keep their crisp envelope. The pool has seven instanced shape groups and a shared limit of 2,048 particles. Empty groups are hidden and do not upload instance buffers.

## Camera and motion setting

Camera clearance samples a fixed body envelope at five heights and three horizontal points. The sample does not change with an animated wrist or tool. A static bounds hierarchy rejects distant objects before exact triangle tests. The query uses shared geometry. Disposal leaves source geometry intact.

One motion system owns the rendered camera position and target. Obstacle checks can shorten its distance, but cannot change the requested direction. A short clear interval prevents repeated inward and outward movement at an edge. Orthographic views keep their full distance. A fixed local cutaway stays ready around the player. It removes only structure in front of the bounded body region. A second cutaway follows the nearest reacting target within 4.5 m. It holds that target through the fall and recovery, then fades before selecting another target. Both cutaways preserve the support floor and structure beyond the body region. Geometry visibility diagnostics still report the actual obstruction.

Perspective game controls own a separate requested camera. Collision corrections do not change the user's orbit. Explicit mode, camera, and reset actions can select a default view. Preview refits retain the current direction. Resize only enlarges the frame when the current content needs more space.

Avatar and animation previews fit a sampled full-clip box, including mounted equipment and support-hand IK. The box is cached for the current figure, clip, avatar settings, and tool. Sampling runs when that selection changes. It does not run in the frame loop.

Attack look-ahead is limited to 0.25 m. Camera kick and zoom stay small. The renderer restores the camera transform and projection after each accent. Reduced motion removes trails, extra camera movement, and reaction tilt. It keeps movement, damage, and local contact marks. The device reduced-motion setting also applies.

## Support and outline

Grounded attacks hold the player root while the authored support foot stays planted. Travel clips export their nominal `travelSpeed` in metres per second. The runtime scales their playback from actual horizontal movement and avatar height. A blocked player stops the travel cycle.

Pale figures use a back-face contour that shares the body geometry and skin. The contour width is set in screen pixels. It uses one extra draw call. Black figures do not draw it. Repeated avatar edits reuse the same contour. The contour does not add interior triangle edges.

## Evidence and limits

The runtime verifier uses real input. It checks input edges, expiry, reset, blur, contact timing, misses, target recoil, weapon contact, scene blocking, and framing. It captures 1440×900 and 390×844 views with all four game cameras.

The pack includes a normal-speed comparison with the saved previous pass. The final benchmark records source and asset hashes. Its desktop result does not establish Android thermal or driver performance. Physical Android testing remains required.
