# INKLINE 1.3.1 animation review

All 85 clips were inspected. This report ranks 25 corrections. The main issues are weak action poses, late contact in light attacks, and one runtime rule that hides the rifle reload. Keep the simple joints and nearly straight spine. Do not use a global speed increase as the only correction.

## Evidence and limits

Read authoring and runtime source. Extract current normal-speed recordings at 10 fps. Inspect five chronological side poses and contact/middle front and three-quarter poses for every clip. Inspect 25 fps source sequences for six dense clips. This is a timed-frame review, not a claim of continuous normal-speed playback.

The source baseline is `7d839b7`. The recordings identify version 1.3.1. Each coverage entry in `animation-triage.json` gives the video interval, contact time, authored phases, and image sheet. The 15 `*-triage-*.png` sheets cover all 85 clips. The six `*-detail.png` sheets show dense sequences for rifle-reload, ball-throw, bat-swing, staff-spin, hammer-overhead, and shield-slam.

- Only the standard black body appears in these motion videos.
- No new GPU capture or browser was used. No source or assets were changed.
- No in-game responsiveness, effects, obstacle contact, or new timing targets were tested.
- Proposed times are design targets, not measured acceptance results. Video sample boundaries are approximate within 0.1 s.
- Sparse samples can miss a brief peak. Low-confidence items are listed as secondary.

## Ranked corrections

The order reflects user-visible value. It is not a list of 25 software blockers. Rifle-reload has a confirmed runtime cause. The other entries are visual and timing corrections. The proposed times use seconds. At 30 fps, one authored frame is about 0.033 s.

| Rank | Clip | Current issue and cause | Proposed correction | Timing target |
|---:|---|---|---|---|
| 1 | `rifle-reload` | The gun stays in its aim pose. The support hand does not show a reload. Runtime supportEquipment pins the left palm to the foregrip for every rifle clip. This overrides the authored left arm path. | Release the foregrip rule during the reload phase. Lower or cant the rifle. Move the left hand to the magazine area and back. | Keep 1.0–1.3 s. Give hand removal, insertion, and return separate intervals. |
| 2 | `parry` | The silhouette changes very little. The action reads as a small guard adjustment. The arm change is small. The body stays centered. Frames 12–18 add a long return hold. | Move the lead forearm across the attack line. Use a short whole-body side lean and clear free-hand spacing. | Peak deflection at 0.10–0.14 s; total 0.30–0.40 s. |
| 3 | `dodge-left` | The small lean does not read as an evasive action. The authored lateral root offset is only 0.08 m. Much of the original gesture depended on spine roll. | Move the head and whole straight torso left. Add a right-foot push and left-foot catch. Keep hands separated. | Maximum avoidance at 0.10–0.14 s; total about 0.40 s. |
| 4 | `dodge-right` | The small lean does not read as an evasive action. The authored lateral root offset is only 0.08 m. Much of the original gesture depended on spine roll. | Mirror the whole-body dodge. Add a left-foot push and right-foot catch. | Maximum avoidance at 0.10–0.14 s; total about 0.40 s. |
| 5 | `elbow-strike` | The arm opens into a short punch. The elbow does not clearly lead. At contact frame 9, Forearm_R reaches -6 degrees. This nearly straightens the striking arm. | Keep the forearm folded 90–120 degrees. Lead with the elbow. Turn the hips and whole torso. Keep the fist near the upper chest. | Contact at 0.17–0.20 s; total 0.40–0.47 s. |
| 6 | `shield-slam` | The shield rises, then returns to a chest-height guard. The impact pose does not show a strong downward slam. The shield has already lowered by frame 10, which the generic phase rule marks as load. The contact grip also keeps a guard-like orientation. | Hold the shield high until the travel phase. Drive its lower edge down with hip and knee compression. Set the intended impact plane explicitly. | Load about 0.23–0.28 s; fast descent to contact about 0.33–0.37 s; total 0.65–0.75 s. |
| 7 | `ball-throw` | The knee lift is clear. The throwing hand stays low at release, so the action reads as a knee lift and arm swing. The current export has no clear overhead release silhouette. The source arm keys need comparison with the exported final pose before editing timing. | Put the hand behind and above the head at load. Lead with the elbow. Extend the release arm above shoulder height. Add an opposite-arm counter and forward step. | Release at 0.27–0.33 s; total 0.65–0.75 s. |
| 8 | `bat-swing` | The bat points along the forward arm at contact. The action reads as a thrust. The hand and mounted bat axes produce a forward line despite authored hip yaw. The follow-through does not carry the bat far across the body. | Keep the bat across the body at contact. Turn the hips and whole torso. Carry the bat to the opposite side after contact. Add a support-foot pivot. | Keep a short 0.20–0.27 s load. Cross the contact plane in 2–3 frames. Total 0.60–0.73 s. |
| 9 | `hammer-overhead` | The main lowering action occurs before contact. The marked hit looks like a small wrist action. The hammer is high at frame 5 and already lowered at frame 9. Generic load insertion copies this lowered pose to frame 12; contact is frame 14. | Keep the hammer overhead through the load. Drive the head down in one fast arc. Add knee compression and a low follow-through. | Load until about 0.27–0.33 s. Contact at 0.37–0.43 s. Keep a longer 0.75–0.85 s total than light attacks. |
| 10 | `vault` | The figure lifts its knees and reaches forward. The sequence reads as a jump rather than a supported vault. There is no clear support-hand pose or interval in the clip. The body does not visibly pass over a planted hand. | Use a fixed-height obstacle fixture. Plant one hand, tuck the knees, carry the hips over the hand, release, and land. | Keep about 0.70–0.80 s. Make the over-obstacle phase faster than load and landing. |
| 11 | `ledge-climb` | The arms move from a hang toward the body without a clear pull, brace, and step over the edge. The source has no hand support contract. The clip lacks a clear body-over-ledge pose. | Use a ledge fixture. Show hang, bent-elbow pull, palm brace, one knee above the edge, and stand. Keep the root-motion policy unchanged. | Allow 0.80–1.00 s if needed. Speed the pull. Give the knee placement a short readable interval. |
| 12 | `crouch-walk` | The walk rises close to standing height. It does not keep the crouch-idle silhouette. Hip height varies from -0.13 to -0.06 m before grounding. Leg poses do not retain the low crouch through the cycle. | Keep bent knees and a lower hip level throughout the cycle. Use alternating short steps and a small whole-body forward lean. | Keep the 0.80 s cycle unless movement speed changes. Match stance speed to the runtime travel speed. |
| 13 | `punch-left` | The jab pose is clear, but contact arrives late for a light attack. Contact is 0.267 s in a 0.533 s clip. The load takes too much of the action. | Keep the clear full extension and free-hand guard. Reduce the load path. Give the fist a fast direct travel. | Contact at 0.13–0.17 s; total 0.33–0.40 s. Keep a 1–2 frame contact hold. |
| 14 | `punch-right` | The punch reads well, but the 0.300 s contact makes the basic combo slow. Half the 0.600 s clip passes before contact. | Keep the stance and extension. Use a short opposite load, then a fast hip-led strike. | Contact at 0.17–0.20 s; total 0.40–0.47 s. |
| 15 | `dagger-stab` | The short weapon action is too slow for its small travel and light weight. Contact is 0.333 s in a 0.733 s clip. The long preparation weakens the quick stab. | Start near the strike line. Use a short elbow load, fast extension, and fast retraction. Keep the free hand clear. | Contact at 0.13–0.17 s; total 0.33–0.40 s. |
| 16 | `sword-thrust` | The sword first rises or changes aim, then thrusts. The preparation is long. Contact is 0.367 s in a 0.667 s clip. The ready pose does not maintain the target line. | Set the blade near the target line before the thrust. Use a short rear-hand load and forward body extension. | Contact at 0.18–0.23 s; total 0.43–0.50 s. |
| 17 | `kick-roundhouse` | The main pose is too similar to the front kick. The sideways sweep is weak. The exported silhouette emphasizes forward leg extension more than hip turn and cross-body travel. | Turn the support foot and hips. Fold the kicking knee across the body, then extend through a lateral arc. Use an opposite-arm counter. | Contact at 0.23–0.30 s; total 0.60–0.70 s. |
| 18 | `roll` | The rotating body stays spread out. It reads as a loose tumble. The legs and arms remain far from the center through much of the rotation. | Tuck both knees toward the hips. Keep the arms near the head. Open only after the hips pass over the support point. | Keep about 0.65–0.80 s. Use a fast middle rotation and slower entry/exit. |
| 19 | `jump-start` | The deep load lasts too long for direct input. The crouch continues to frame 7 of 12, about 0.23 s, before the main extension. | Use a shallower load and fast hip/knee extension. Keep the arm counter and straight torso. | Total 0.22–0.27 s. Use 2–3 load frames and 4–5 extension frames at 30 fps. |
| 20 | `uppercut` | The arm stays near the head. The upward strike lacks a clear low-to-high drive. The contact shape and long 0.367 s preparation do not show enough hand and elbow separation from the head. | Load lower through the knees. Drive upward with the whole body. Put the striking fist above and forward of the face. Keep the forearm bent. | Contact at 0.20–0.24 s; total about 0.50 s. |
| 21 | `shield-push` | The shield tips across the face. The action does not show a sustained forward shove. The wrist orientation and short root travel make the push similar to bash and guard changes. | Keep the shield face toward the target. Extend the arm with a low split stance. Hold forward pressure, then recover. | Reach pressure at 0.23–0.30 s. Hold 0.10–0.15 s. Total about 0.65–0.75 s. |
| 22 | `staff-sweep` | The staff stays near waist height. The body turn and low sweep arc are weak. The contact pose favors a horizontal hold over a distinct low cross-body strike. | Lower the body through the knees. Sweep the staff below hip height across the front. Keep the free hand and staff clear of the torso. | Contact at 0.23–0.30 s; total about 0.65 s. |
| 23 | `sword-slash` | The blade path is readable, but the attack waits too long before contact. Contact is 0.400 s in a 0.733 s clip. | Keep the broad blade arc and straight torso. Shorten preparation. Carry the blade slightly past contact before recovery. | Contact at 0.23–0.27 s; total 0.53–0.60 s. |
| 24 | `backfist` | The action looks like another short straight punch. The cross-body return arc is weak. At contact the elbow is almost straight. The load and contact hand positions do not show a clear back-of-fist sweep. | Load the fist across the chest. Lead with a bent elbow, then swing the back of the fist out. Keep the free hand in guard. | Contact at 0.17–0.20 s; total 0.43–0.50 s. |
| 25 | `sword-diagonal` | The downward diagonal is weak after the contact pose. It resembles a wrist-led straight strike. The corrected contact axis is useful, but the surrounding hand path and whole-body turn do not carry the blade far across the body. | Load the blade above the opposite side. Pass diagonally through contact. End below the far hip with a clear whole-body turn. | Contact at 0.23–0.30 s; total 0.60–0.67 s. |

## Shared corrections and checks

1. Keep the present limb mesh and spine rules. Create larger gestures with hip rotation, whole-body lean, arm separation, and knee bend. Do not restore joint spheres or large local spine bends.
2. Give each high-priority action explicit load, travel, contact, hold, and return poses. In `apply_stick_motion_contract`, the generic contact-minus-two rule can copy a pose that has already completed most travel. It is not a substitute for an authored load. Hammer-overhead and shield-slam show this problem.
3. Update clip contact metadata and runtime timing together. Validate the final weapon or limb position at the event. Retain the current grip and support tests.
4. Test the rifle reload support-hand release in the actual runtime. Restore foregrip support before the ready pose. The current broad rifle prefix rule in `src/runtime/assets.ts` overrides the reload hand path.
5. Compare each corrected action with its nearest neighbor. Check front, side, and three-quarter views at normal speed. Use phone-size figures. Disable effects for the first comparison.
6. Keep the existing export checks for 12 bodies, grounded support, grip contact, fall boundaries, continuous joints, and spine bend. Then run a small runtime test for each changed event or support rule.
7. Verify the loop boundary for locomotion. For non-loop actions, check the transition into and out of guard. Check vault and ledge-climb against a fixed obstacle fixture.

## Per-clip acceptance

| Clip | Acceptance |
|---|---|
| `rifle-reload` | At least three distinct hand positions must be visible. The hand must leave the foregrip during reload and return without a jump. |
| `parry` | Front and side views must show a clear ready, deflect, and guard sequence without effects. |
| `dodge-left` | At peak, head displacement should be at least one head diameter in front view. The direction must be clear. |
| `dodge-right` | Match the left dodge distance and time. Keep the torso nearly straight. |
| `elbow-strike` | The elbow must be the furthest forward part of the striking arm at contact. Preserve the Forearm_R contact rule. |
| `shield-slam` | The main shield descent must end at the contact event. If this is a ground slam, the lower edge must reach the ground fixture. |
| `ball-throw` | The hand must pass above shoulder height and then forward. Show a separate follow-through in side and three-quarter views. |
| `bat-swing` | The bat tip must cross the strike plane in a broad side arc. It must not point at the target like a spear. |
| `hammer-overhead` | Peak downward tip speed must occur just before contact. Do not complete the main downstroke before the load marker. |
| `vault` | The support palm must stay on the fixture during the support interval. Keep hips and both feet clear of the obstacle. |
| `ledge-climb` | Hands must hold the ledge through the pull. One knee must visibly clear the edge before the final stand. |
| `crouch-walk` | The head must stay visibly below standing walk through the full loop. It must connect to crouch-idle without a large rise. |
| `punch-left` | The light jab must contact before the heavy punch. Keep all runtime hit events aligned to the new clip contact. |
| `punch-right` | Keep a clear weight shift. The contact must be earlier than the heavy punch and later than the left jab. |
| `dagger-stab` | The dagger action must be clearly faster and shorter than sword-lunge. Keep hand and weapon contact aligned. |
| `sword-thrust` | The blade must advance along its axis during travel. Keep the blade-tip contact solve. |
| `kick-roundhouse` | Front and three-quarter views must distinguish the roundhouse from kick-front without labels. |
| `roll` | The middle silhouette must be compact. Check head clearance and support contact across the actual exported clip. |
| `jump-start` | The visual takeoff must match the runtime airborne transition. Do not shorten only the animation while retaining a late launch event. |
| `uppercut` | The fist path must rise clearly. The contact arm must remain readable beside the head at phone size. |
| `shield-push` | The push must have a longer sustained extension than shield-bash. Keep the head visible in side view. |
| `staff-sweep` | The low staff path must differ from staff-thrust and staff-parry in front and side views. |
| `sword-slash` | Keep the slash visibly different from the thrust. Align the slash effect and hit event to the new contact. |
| `backfist` | The hand must move across the body, not only forward. The pose must differ from punch-right without a label. |
| `sword-diagonal` | The tip path must cross both horizontal and vertical ranges. Preserve the current contact axis and hand grip. |

## Full coverage

`retain` means no clear priority fault in this evidence. It is not a claim that the clip needs no further tuning. `secondary` means a useful later change or a check that needs closer runtime evidence.

| Clip | Status | Finding | Evidence |
|---|---|---|---|
| `idle` | retain | The quiet standing pose serves its purpose. | [movement-triage-1.png](movement-triage-1.png) |
| `walk` | retain | The alternating stride and arm swing read clearly. | [movement-triage-1.png](movement-triage-1.png) |
| `run` | retain | The stride and forward lean read clearly. | [movement-triage-1.png](movement-triage-1.png) |
| `sprint` | retain | The low lean and fast stride differ from run. | [movement-triage-1.png](movement-triage-1.png) |
| `strafe-left` | secondary | Add a clearer lateral push if needed. Front view shows the direction better than side view. | [movement-triage-1.png](movement-triage-1.png) |
| `strafe-right` | secondary | Match any lateral push change to the left clip. | [movement-triage-1.png](movement-triage-1.png) |
| `walk-backward` | retain | The backward step cycle is readable. | [movement-triage-2.png](movement-triage-2.png) |
| `jump-start` | prioritize | The deep load lasts too long for direct input. | [movement-triage-2.png](movement-triage-2.png) |
| `jump-loop` | secondary | Use unequal knee heights to separate this pose from other jumps. | [movement-triage-2.png](movement-triage-2.png) |
| `jump-land` | retain | The compression and return to stand are clear. A shorter recovery is optional. | [movement-triage-2.png](movement-triage-2.png) |
| `double-jump` | secondary | Add a distinct midair tuck and relaunch pose. It currently resembles a second ordinary jump. | [movement-triage-2.png](movement-triage-2.png) |
| `slide` | retain | The low split-leg pose and lean are clear. | [movement-triage-2.png](movement-triage-2.png) |
| `vault` | prioritize | The figure lifts its knees and reaches forward. The sequence reads as a jump rather than a supported vault. | [movement-triage-3.png](movement-triage-3.png) |
| `climb` | retain | Alternating reaches and knees read as a climb. Wall contact needs a level fixture. | [movement-triage-3.png](movement-triage-3.png) |
| `wall-run` | retain | The tilted running pose reads. Wall attachment is outside this video review. | [movement-triage-3.png](movement-triage-3.png) |
| `roll` | prioritize | The rotating body stays spread out. It reads as a loose tumble. | [movement-triage-3.png](movement-triage-3.png) |
| `punch-left` | prioritize | The jab pose is clear, but contact arrives late for a light attack. | [combat-triage-1.png](combat-triage-1.png) |
| `punch-right` | prioritize | The punch reads well, but the 0.300 s contact makes the basic combo slow. | [combat-triage-1.png](combat-triage-1.png) |
| `punch-heavy` | retain | The lunge and contact shape are strong. Keep it slower than the light punches. | [combat-triage-1.png](combat-triage-1.png) |
| `uppercut` | prioritize | The arm stays near the head. The upward strike lacks a clear low-to-high drive. | [combat-triage-1.png](combat-triage-1.png) |
| `kick-front` | retain | The forward leg extension is clear. | [combat-triage-1.png](combat-triage-1.png) |
| `kick-roundhouse` | prioritize | The main pose is too similar to the front kick. The sideways sweep is weak. | [combat-triage-1.png](combat-triage-1.png) |
| `kick-air` | retain | The airborne extension is distinct. | [combat-triage-2.png](combat-triage-2.png) |
| `sweep` | retain | The low, wide leg sweep is readable. | [combat-triage-2.png](combat-triage-2.png) |
| `block` | retain | The stable guard serves its purpose. | [combat-triage-2.png](combat-triage-2.png) |
| `parry` | prioritize | The silhouette changes very little. The action reads as a small guard adjustment. | [combat-triage-2.png](combat-triage-2.png) |
| `dodge-left` | prioritize | The small lean does not read as an evasive action. | [combat-triage-2.png](combat-triage-2.png) |
| `dodge-right` | prioritize | The small lean does not read as an evasive action. | [combat-triage-2.png](combat-triage-2.png) |
| `sword-slash` | prioritize | The blade path is readable, but the attack waits too long before contact. | [combat-triage-3.png](combat-triage-3.png) |
| `sword-overhead` | secondary | The raised blade is clear. Contact at 0.467 s is slow; keep heavy timing or shorten it after light attacks are tuned. | [combat-triage-3.png](combat-triage-3.png) |
| `sword-thrust` | prioritize | The sword first rises or changes aim, then thrusts. The preparation is long. | [combat-triage-3.png](combat-triage-3.png) |
| `staff-spin` | secondary | The staff changes through large angles, but the apparent speed is uneven. Check the continuous tip path before changing the loop. The extracted sequence does not prove a rotation-direction fault. | [combat-triage-3.png](combat-triage-3.png) |
| `pistol-idle` | retain | The quiet aim is clear. | [combat-triage-3.png](combat-triage-3.png) |
| `pistol-fire` | secondary | Recoil is small. Check the actual peak at game size before increasing the wrist action. | [combat-triage-3.png](combat-triage-3.png) |
| `pistol-reload` | secondary | The free hand moves, but the gun stays near aim. Add a clearer magazine gesture and gun cant after rifle-reload. | [combat-triage-4.png](combat-triage-4.png) |
| `rifle-idle` | retain | The supported aim is clear. | [combat-triage-4.png](combat-triage-4.png) |
| `rifle-fire` | retain | The short recoil and supported return read. | [combat-triage-4.png](combat-triage-4.png) |
| `rifle-reload` | prioritize | The gun stays in its aim pose. The support hand does not show a reload. | [combat-triage-4.png](combat-triage-4.png) |
| `shotgun-fire` | retain | The stronger recoil differs from rifle-fire. | [combat-triage-4.png](combat-triage-4.png) |
| `bow-draw` | retain | The draw arm and bow line are readable. | [combat-triage-4.png](combat-triage-4.png) |
| `bow-release` | retain | The release hand separates from the draw position. | [combat-triage-5.png](combat-triage-5.png) |
| `throw` | retain | The overarm load and forward release read clearly. | [combat-triage-5.png](combat-triage-5.png) |
| `hit-front` | retain | The recoil direction and return are clear. | [other-triage-1.png](other-triage-1.png) |
| `hit-back` | retain | The opposite recoil direction is clear. | [other-triage-1.png](other-triage-1.png) |
| `hit-left` | secondary | Side view is subtle. Check the front-view peak at game scale before changing the lateral recoil. | [other-triage-1.png](other-triage-1.png) |
| `hit-right` | secondary | Match the left recoil if its amplitude changes. | [other-triage-1.png](other-triage-1.png) |
| `knockdown` | retain | The backward fall ends in a clear floor pose. | [other-triage-1.png](other-triage-1.png) |
| `get-up` | secondary | Add one clear hand or knee support pose between the seated and squat phases. | [other-triage-1.png](other-triage-1.png) |
| `death` | retain | The forward fall and final pose differ from knockdown. | [other-triage-2.png](other-triage-2.png) |
| `stun` | retain | The hand-to-head and backward lean read as stun. | [other-triage-2.png](other-triage-2.png) |
| `wave` | retain | The raised-arm gesture reads as a wave. | [other-triage-2.png](other-triage-2.png) |
| `cheer` | secondary | Add a small whole-body upward pulse to distinguish it from a held hands-up pose. | [other-triage-2.png](other-triage-2.png) |
| `point` | retain | The pointing arm is clear. | [other-triage-2.png](other-triage-2.png) |
| `interact` | secondary | The small hand reach is generic. A target-height fixture can guide a stronger pose. | [other-triage-2.png](other-triage-2.png) |
| `pickup` | retain | The low reach and lift are clear. | [other-triage-3.png](other-triage-3.png) |
| `carry` | secondary | The hands resemble a guard. Use two level, separated palms and a small load-bearing lean. | [other-triage-3.png](other-triage-3.png) |
| `ball-kick` | retain | The backswing and forward kick are clear. A support step is optional. | [other-triage-3.png](other-triage-3.png) |
| `ball-throw` | prioritize | The knee lift is clear. The throwing hand stays low at release, so the action reads as a knee lift and arm swing. | [other-triage-3.png](other-triage-3.png) |
| `bat-swing` | prioritize | The bat points along the forward arm at contact. The action reads as a thrust. | [other-triage-3.png](other-triage-3.png) |
| `celebrate` | secondary | The hand action resembles wave. Add a distinct body pulse or alternating arms. | [other-triage-3.png](other-triage-3.png) |
| `walk-left` | secondary | A clearer lateral push can improve the front-view cycle. | [movement-triage-3.png](movement-triage-3.png) |
| `walk-right` | secondary | Match any lateral push change to walk-left. | [movement-triage-3.png](movement-triage-3.png) |
| `run-backward` | retain | The opposite lean and stride read clearly. | [movement-triage-4.png](movement-triage-4.png) |
| `crouch-idle` | retain | The low bent-knee stance is clear. | [movement-triage-4.png](movement-triage-4.png) |
| `crouch-walk` | prioritize | The walk rises close to standing height. It does not keep the crouch-idle silhouette. | [movement-triage-4.png](movement-triage-4.png) |
| `turn-left` | secondary | Add a short foot step or pivot. The turn now reads as a body swivel. | [movement-triage-4.png](movement-triage-4.png) |
| `turn-right` | secondary | Add the matching short foot step or pivot. | [movement-triage-4.png](movement-triage-4.png) |
| `ledge-climb` | prioritize | The arms move from a hang toward the body without a clear pull, brace, and step over the edge. | [movement-triage-4.png](movement-triage-4.png) |
| `elbow-strike` | prioritize | The arm opens into a short punch. The elbow does not clearly lead. | [combat-triage-5.png](combat-triage-5.png) |
| `backfist` | prioritize | The action looks like another short straight punch. The cross-body return arc is weak. | [combat-triage-5.png](combat-triage-5.png) |
| `knee-strike` | retain | The raised knee and compact stance are clear. | [combat-triage-5.png](combat-triage-5.png) |
| `shoulder-check` | retain | The whole-body lean and lunge read. More drive is optional. | [combat-triage-5.png](combat-triage-5.png) |
| `staff-thrust` | retain | The horizontal reach reads as a thrust. | [combat-triage-6.png](combat-triage-6.png) |
| `staff-sweep` | prioritize | The staff stays near waist height. The body turn and low sweep arc are weak. | [combat-triage-6.png](combat-triage-6.png) |
| `staff-overhead` | retain | The raised staff and downward action read. Timing can be tuned after the higher priorities. | [combat-triage-6.png](combat-triage-6.png) |
| `staff-parry` | retain | The staff deflection has a clear silhouette. | [combat-triage-6.png](combat-triage-6.png) |
| `sword-diagonal` | prioritize | The downward diagonal is weak after the contact pose. It resembles a wrist-led straight strike. | [combat-triage-6.png](combat-triage-6.png) |
| `dagger-stab` | prioritize | The short weapon action is too slow for its small travel and light weight. | [combat-triage-6.png](combat-triage-6.png) |
| `sword-lunge` | retain | The extended blade and split stance are clear. | [combat-triage-7.png](combat-triage-7.png) |
| `hammer-overhead` | prioritize | The main lowering action occurs before contact. The marked hit looks like a small wrist action. | [combat-triage-7.png](combat-triage-7.png) |
| `shield-bash` | secondary | Add a stronger forward body drive to distinguish it from shield-block. | [combat-triage-7.png](combat-triage-7.png) |
| `shield-block` | retain | The shield moves into a clear guard. | [combat-triage-7.png](combat-triage-7.png) |
| `shield-slam` | prioritize | The shield rises, then returns to a chest-height guard. The impact pose does not show a strong downward slam. | [combat-triage-7.png](combat-triage-7.png) |
| `shield-push` | prioritize | The shield tips across the face. The action does not show a sustained forward shove. | [combat-triage-7.png](combat-triage-7.png) |
| `get-up-forward` | retain | The kneel, rise, and return to guard are clear. | [other-triage-4.png](other-triage-4.png) |

## Source receipt

| File | SHA-256 |
|---|---|
| `scripts/blender/characters.py` | `2e233582dcfe80509b5ff5667bb8a3693807184759c73af51d4fa3c5f6b0eb2d` |
| `public/assets/characters.json` | `088e6b7caaeb71fb5c1aee0f47a06581599e52f3b9d83d6e5a4d2032bbb20f5e` |
| `src/runtime/assets.ts` | `9ff77bc1fd4186adedcaa32d91259f452b625e4a87a38abd3f807ac1430888bc` |
| `public/review/motion-movement.mp4` | `f0bba808d042a88813a32cd90e8700f789a60228f0789d400146ab4be7557c49` |
| `public/review/motion-combat.mp4` | `7ca2a706f1e4f246499b5ec9c389543bedbc5f64db27b603c693d674f614c369` |
| `public/review/motion-other.mp4` | `6a01996e117781b8006b6465435a79c090dd0c27a7a125e2df37db7d4b372662` |

No source, runtime, or asset files were changed. The review used CPU frame extraction. The GPU remained available to the parent task.
