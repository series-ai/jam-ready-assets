# Joint line diagnosis

Date: 27 September 2026.

The final sampled figures have continuous joints without the reported dots. No P0 or P1 visual regression was found in the 72 final fixture views or the earlier action sheet. Exported geometry and motion reports pass for all 12 bodies. The public assets match those report hashes. This review supports the joint and spine correction. It does not claim a complete video review.

## Final family assessment

I inspected these six final sheets at original image detail:

- `line-fixtures-stick-standard-black.png`
- `line-fixtures-stick-standard-pale.png`
- `line-fixtures-stick-runner-black.png`
- `line-fixtures-stick-runner-pale.png`
- `line-fixtures-stick-heavy-black.png`
- `line-fixtures-stick-heavy-pale.png`

Together they show 72 views: three body samples, two colours, four bend angles, and three camera directions. The standard, runner, and heavy fixtures use thickness values 1, 0.7, and 1.3 respectively.

The thin runner retains a continuous line through its knees at all four angles. The wide heavy figure retains a continuous pale boundary without a separate round joint. The standard figure remains consistent with the earlier pale review. No visible joint gap, detached part, bead, or severe inward pinch was found. At 120 degrees the joints form acute corners. This is the line style shown in the earlier prototype, not a new round enlargement.

Front-view overlap hides some elbows and merges some bent legs. The side and three-quarter views provide the useful joint evidence. The thick black front view has a wider combined shape where both legs overlap. The corresponding pale and side views show that this is overlap rather than a separate joint sphere.

I read the final reports and checked their summary data:

| Report | Result |
| --- | --- |
| `line-quality.json` | Pass. All 12 bodies have six mesh components and 1,712 triangles. The prior bodies had 12 components. |
| Spine samples in `line-quality.json` | 53,292 samples at 60 Hz. RMS bend is 4.603 degrees, down from 21.256 degrees. Maximum bend is 10.449 degrees, down from 55.933 degrees. |
| line-motion-quality (regenerable with `scripts/verify-motion-quality.ts`; trace not committed) | Pass. 1,020 clip records, 672 floor records, and 24 fall boundary records. No failures. |
| `line-grip-quality.json` | All 288 checks pass. |
| `line-avatar-contact.json` | All 252 checks pass. |

I independently computed SHA-256 values for all 12 character files in `public/assets`, using their manifest paths. Every value matches its asset record in the line-motion-quality report (not committed; regenerate with `scripts/verify-motion-quality.ts`). Thus the passing report refers to the promoted public character files, not only to an unpromoted prototype.

The final metrics close the earlier concern about role offsets exceeding the initial 6- and 4-degree source limits. The measured combined spine bend remains below 10.45 degrees across the sampled final family. This is the relevant exported result.

No further joint mesh correction is indicated by these fixtures. I did not measure pixel width against the earlier proposed five-percent criterion. I did not rerun the motion or grip tests. I did not use a browser or GPU, and I did not watch the new recordings. Full-motion playback remains separate evidence.

## Prototype review

I opened `line-before.png` and `line-after.png`. Each sheet shows eight actual exported actions in front, side, and three-quarter views. I inspected idle, block, run, heavy punch, front kick, sword overhead, death, and forward get-up at the labelled sample times. I also reopened the after sheet at original image detail.

The after sheet no longer shows the round knee and elbow enlargement seen in the earlier close views. The limbs read as connected line segments. I found no visible detached part, joint gap, sharp spike, or severe inward pinch at this sheet's resolution. The low punch and get-up knees remain readable. The hand and foot tips retain round ends.

The torso is visibly straighter in run, heavy punch, death, and forward get-up. It retains the required lean. The strike arm still extends, the kick still points outward, and the falling body still tilts toward the floor. Front views still merge some limbs when the action points toward the camera. This was also present before the correction.

The mesh source now has no elbow, wrist, or knee sphere calls. Upper-arm, elbow, forearm, thigh, and knee rings use `r_limb`. The connected loft and existing joint weights remain. This implements the first two recommended changes below without adding more geometry.

`stick_pose_rotations` reconstructs bone transforms in parent order. It reduces Spine and Chest rotations, then rotates the Hips to restore the original hip-to-neck direction. It restores the world orientations of thigh roots, upper-arm roots, and Neck through their new parent transforms. That multiplication order is consistent with the authored parent-relative bone transforms. It preserves limb direction; it does not promise identical hand positions after the torso shape changes. The contact checks are therefore necessary.

The 6-degree Spine and 4-degree Chest limits apply inside this pose correction. Later role offsets are reduced to one quarter, but they can add rotation beyond these limits. Final exported curvature must be measured. The source limits must not be described as hard limits on every final role clip.

The main agent reported passing prototype checks for 85 motions, 56 grounded cases, two fall boundaries, and 24 grips. I did not rerun those checks. I did not view pale prototypes or the complete family in this pass. I did not watch a video. This is approval of the sampled visual direction, not final acceptance of all exported motion.

Reviewed `scripts/blender/characters.py` SHA-256: `2e233582dcfe80509b5ff5667bb8a3693807184759c73af51d4fa3c5f6b0eb2d`.

## Pale joint fixture review

I opened `line-fixtures-stick-standard-pale.png` at original image detail. It shows the actual standard-body export with the production pale material and contour. The rows test 0-, 45-, 90-, and 120-degree bends. Each row has front, side, and three-quarter views.

No visible contour gap, detached joint, or round joint bead was found. The side and three-quarter knees form continuous line corners at 45, 90, and 120 degrees. The 120-degree corner is acute, but it does not close to a point or break the limb. I found no severe inward pinch at the displayed size. The exposed forearm lines also remain continuous.

The symmetric front fixture overlaps arms with the torso and overlaps bent legs with each other. Small internal curves in those views do not establish a separate joint bead. The side and three-quarter views are the useful evidence for these joints. Some elbow boundaries remain hidden by the torso in this fixture, so it does not replace the action sheets.

No P0 or P1 visual fault was found in these 12 pale views. This closes the standard pale fixture check. The complete body family, intermediate motion frames, and final exported geometry measurements remain outside this fixture review. I did not use a browser or GPU.

## Original cause

In `scripts/blender/characters.py`, `build_character_mesh` adds a continuous arm or leg tube, then adds separate spheres at both elbows, both knees, and both wrists. The elbow and knee spheres use the parent bone alone. They remain round as the child segment turns.

The elbow ring has radius `1.05 * r_limb`. The upper arm midpoint has radius `0.96 * r_limb`. This makes the elbow about 9.4 percent wider than that shaft before deformation. The knee ring has radius `1.08 * r_limb`, compared with `1.00` to `1.02` on its adjacent shafts.

The elbow and knee rings use equal weights from the two adjoining bones. Under linear blended skinning, a bend can compress the ring along the bend plane. The separate sphere does not compress with it. The result is a round centre with thinner segments entering it. Widening the ring adds another local width change.

The authored poses use substantial bends. For example, the melee base pose sets forearm rotations to -75 and -80 degrees. Pickup uses knee rotations of 85 degrees. The mesh must handle these angles without joint covers becoming separate visible shapes.

## Saved image observations

I opened these actual saved images with `view_image`:

- `outline/1100-perspective-black.png`
- `outline/1100-side-white.png`
- `outline/390-side-black.png`
- `figure-family-idle-guard.png`

Paths are relative to this report's directory. The phone black image has a rounded enlargement at the forward knee. The pale side image shows rounded elbow ends and a local knee enlargement. The small family sheet reduces their visibility. That sheet alone is insufficient to judge line quality.

## Recommended correction

1. Remove the separate elbow, knee, and wrist spheres. Retain the head sphere and rounded terminal hand and foot caps.
2. Use one nominal radius through each upper arm, elbow, forearm, thigh, knee, and shin. Remove the 1.05 and 1.08 hinge enlargement. Avoid a narrow shaft immediately beside a wider hinge.
3. Keep the current connected tube and shared bone pivots. Start with the existing skinning. If a deep bend produces a visible pinch, put one rigid-weight ring on each side of the hinge, about one stroke radius from the pivot. Keep the central blended ring between them. This confines the blend to a short joint zone and preserves straight shafts. Check this change in a prototype before applying it to all bodies.

Do not compensate for a pinch by restoring spheres or increasing the hinge radius. Those changes restore the reported dot shape. No rig, animation timing, joint position, or weapon mount change is needed for the first mesh correction. Spine shape was outside the initial diagnosis. The prototype section above records the later spine review.

## Acceptance

- Source check: no separate limb joint spheres remain. Elbow and knee rings use the same nominal radius as their adjoining shafts. Skin weights remain normalised.
- Straight-limb check: projected width at the hinge differs from the adjacent shaft by no more than five percent, allowing one pixel for image sampling. Do not apply this width comparison to a strongly foreshortened segment.
- Bent-limb check: inspect 45-, 90-, and 120-degree bends from front, side, and three-quarter views. A joint must read as one turn in the line. It must not show a round dot, gap, inward pinch, doubled edge, or pointed spike.
- Asset check: inspect the thin, standard, and heavy bodies in black and pale colours at desktop and 390-pixel widths. Include guard, run, heavy punch, crouch, front kick, sweep, and pickup. Check intermediate frames as well as the named contact frame.
- Contact check: preserve the existing head connection, hand grips, common branch points, and support-foot positions. Compare the exported assets with the contact checks already used for this pack.

The numerical width check cannot replace visual review of bent joints. I did not render a prototype, use a browser or GPU, edit source, or review video in this task.
