# Style correction

Review date: 27 September 2026. This document records the visual faults in release 1.2 and the correction standard for release 1.3.

## Reference observations

The [Flash reference study](flash-reference-study.md) covers Xiao Xiao, SHOCK, Animator vs. Animation, and Stick War. The later studies cover [Stick Fight](reference/kinetic-study-stickfight.md) and [Stickfigurez](reference/kinetic-study-stickfigurez.md). These are visual observations from the sampled footage. They are not measurements of the original animation files.

| Visual rule | What the references show | Fault in release 1.2 | Correction standard |
| --- | --- | --- | --- |
| Figure shape | One spine, shared arm and leg branches, a round head, and round stroke ends. | Lateral shoulder and hip bars made a small human frame. Clothing bands added more width. | Put the paired arm and leg roots at common points. Remove the bars and body bands. Keep proportion and equipment changes. |
| Action shape | The whole body explains the action. The head, spine, striking limb, and support leg form a clear gesture. | Many actions kept an upright spine and moved the hands near the body. | Use a clear load, extended strike, contact shape, and recovery. Give the free arm a separate shape. |
| Open space | Space between the limbs keeps the action readable at a small size. | Side views merged the legs. Some weapon poses hid the grip or blade in the torso. | Check front, side, and three-quarter views. Use a split stance where the action needs a stable base. |
| Timing | Uneven spacing gives preparation, speed, impact, and weight. A short pause makes contact readable. | Generic curves softened the strike. Some main punches did not use the intended fast timing policy. | Author separate phase times. Keep fast travel into contact and a slower return. Review at normal speed. |
| Ground contact | A planted foot gives body movement a fixed reference. Travel cycles cover a distance that fits their stride. | The floor bake fixed height but allowed horizontal sliding. Runtime speed did not match the run cycle. | Bake declared support phases with a leg solver. Export travel speed. Scale playback from actual movement speed. |
| Response | The victim continues along the applied force. A fall has a clear landing and rest. | Reactions always used a front hit or backward fall. The root moved back to its start during the fall. | Select reaction from the force relative to the victim. Hold the landed root until recovery. |
| View | A stable view makes fast motion understandable. | A discrete obstacle search changed camera angle after smoothing. A resize reset the view. | Preserve the requested direction. Smooth one camera state. Use a local foreground cutaway when structure blocks the figure. |
| Line quality | Simple edges are clean and deliberate. Pale figures need a continuous dark boundary. | The pale outline came from a normal-angle band. It changed with view and skin deformation. | Use a skinned back-face contour with screen-based width. Check thin and wide bodies in motion. |
| Detail | Props explain scale and function. Small accents have clear surface separation. | Some orange bands shared a surface with the base shape. | Correct the source geometry. Check exported triangles and rendered views. |
| Effects | Short marks explain the strike path and force. Open space remains around the figure. | Effects could make a weak pose appear busy without making the action clear. | Accept the body motion without effects first. Keep contact marks short and directional. |

## Figure variations

The twelve figures share one stick figure construction. Their useful differences are height, stroke width, head size, limb ratio, stance, and functional equipment. They do not need anatomical shoulder width, a pelvis bar, a belt, or a collar to show a role.

The six families remain Balanced, Swift, Compact, Reach, Power, and Guard. Compare them at one world scale. A tall figure must appear tall in the family sheet. Compare equipped roles separately, because a large staff or shield needs more image space.

## Review method

Review the actual GLB files. The generated concept image remains a direction sample, not evidence of finished geometry.

1. Read each pose without effects or equipment.
2. Read weapon actions with the intended equipment.
3. Play each action at normal speed.
4. Check front, side, and three-quarter views at desktop and phone size.
5. Measure support-foot drift, loop closure, branch positions, contact reach, and fall direction.
6. Review the complete scene after the isolated actions pass.

The checks measure specific faults. A passing floor test does not prove a planted foot. A passing visibility test does not prove a stable camera. A passing build does not prove visual quality.

## Result and remaining style gaps

The correction removes the anatomical bars and body bands. The main combat
poses use more body lean, clearer limb separation, and stronger reach. Travel
cycles now match their declared speed. The feet keep declared support points.
Falls keep their landing position and use a matching recovery. The review
films compare these changes with the saved 1.2 output at normal speed.

The 3D result still differs from the drawn references in three areas:

- Drawn strokes can bend along one continuous curve. These figures use a
  compact jointed rig. Some poses still show straighter segments and sharper
  bends than a drawn frame.
- A drawn action can change its silhouette for one view. Front and top views
  can still overlap limbs through normal foreshortening. The side view gives
  the clearest strike read. The pack does not distort each body for the camera.
- Each reference film can give a character a unique performance. This pack
  shares clip names and a rig across twelve bodies. Proportion, guard stance,
  action selection, and equipment provide variation. Several secondary clips
  retain their prior key poses. The figure report lists the rewritten clips.

Climb and vault clips remain reusable motions. The demo does not solve hand
and foot contact against an arbitrary obstacle. A game must place those
motions against its own level geometry.

## Limits

The pack uses 3D geometry and a shared rig. A drawn film can change each outline for one camera angle. This pack must also work from other views. The aim is a clear original 3D interpretation of the motion and line style.

Desktop browser measurements can find performance regressions. They do not prove performance on a physical 2022 Android phone. That hardware check remains required.

## Joint and spine follow-up — 1.3.1

The earlier small joint spheres still read as dots. They are removed. Limb tubes keep a uniform gauge through elbows and knees. The torso now uses restrained local bending and transfers the removed curve into whole-body lean. The earlier proposal to use more curved strokes is not the target for the spine. The requested direction is a simpler, nearly straight stick body.
