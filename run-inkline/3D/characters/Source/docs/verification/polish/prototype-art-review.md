# Prototype animation review

The prototype improves several actions. It is not ready for the final family build without another pass on roundhouse contact, jump takeoff, dodge head travel, elbow lead, bat-swing, and shield-slam. These are visible or measured faults in the actual exported GLB. No source was changed for this review.

## Evidence and scope

Loaded `.cache/polish-character-prototype/characters/stick-standard.glb` through the existing line review page. Used `figureReview.choose`, `equip`, and `capture`. Production `mountEquipment` and `supportEquipment` handled real equipment. No effects were present.

Captured 184 views for all 26 changed clips. The seven `prototype-poses-*.jpg` sheets show named side phases and front/three-quarter key poses. The full PNG files are in `prototype-frames/`. `prototype-capture-receipt.json` records each phase time, equipment, file, and source hash. For clips without a contact event, the key view uses a named contact, release, peak, tuck, pull, or magazine phase when available.

Recorded all 26 clips at normal playback speed in `prototype-normal-speed.webm` (23.56 s). `prototype-film-index.json` gives the clip intervals. The visual findings here come from direct phase images and measured exported bones. This report does not claim continuous human-style viewing of the film. The recording is available for that check. There were no browser errors. The named headless browser was closed. The GPU is free.

CPU measurements use the same GLB through Three.js. `prototype-bone-metrics.json` contains world bone positions. These are joint origins, not the outside of the head mesh. The source and GLB hashes remained unchanged through capture and measurement.

## Required corrections

| Clip | Actual result | Required correction |
|---|---|---|
| `kick-roundhouse` | At contact f8 / 0.267 s, the right knee has 95.9 degrees of flexion. At hold f10 / 0.333 s, it has 3.1 degrees. The full kick happens after the hit event. Sheet 7 shows the change. | Restore the extended kick at contact. Use the support leg and hip placement to meet support checks. Do not fix support drift by folding the striking leg at impact. |
| `jump-start` | Named takeoff f4 / 0.133 s is a deep crouch. Head Y then falls from 1.264 m to 1.233 m at f5 before rising. At f8 it reaches 1.695 m. Sheet 4 shows crouch at takeoff. | Put the deepest load before takeoff. Align the takeoff marker with extension and the runtime airborne transition. |
| `dodge-left`, `dodge-right` | The front silhouette now leans clearly. However, head travel is only 80 mm. Left head X changes from +0.093 to +0.013 m at peak f5. Right mirrors this. Root/hip travel offsets much of the lean. | Move the head at least about one head diameter in the avoidance direction. Keep the straight torso and readable foot catch. Measure net head motion, not only hip offset or local torso angle. |
| `elbow-strike` | The arm is folded, which is an improvement. At contact, elbow Z is 0.212 m and hand Z is 0.308 m. The fist stays 96 mm ahead of the elbow in runtime forward +Z. The elbow extends sideways at X0.210 m. The side image reads as crossed hands near the chest. | Turn the strike plane so the elbow leads the fist toward the target. Keep the fold. Preserve the runtime elbow contact bone. |
| `bat-swing` | The mounted bat stays mostly vertical at load, contact f8 / 0.267 s, and hold. The front and three-quarter contact views also show the upright bat. It does not sweep across the strike plane. Sheet 3. | Correct the mounted bat axis through load, contact, and follow-through. The bat tip must pass across the body in a broad lateral arc. A pose change to the hands alone is not sufficient. |
| `shield-slam` | High load is visible at 0.267 s. At contact 0.367 s, the shield returns to a vertical chest-height guard. It then tips forward to a nearly horizontal shield at follow/settle. This still reads as a guard change. Sheet 2. | End the main downward travel at contact. Set the desired impact plane. If the action is a ground slam, lower the edge to that plane. Do not retain the guard reference orientation if it prevents the slam pose. |

The first two rows are event/pose mismatches. The next four rows prevent the corrected actions from meeting their stated visual purpose. They should be fixed before this pass is described as complete.

## Improvements and remaining limits

- `hammer-overhead`: The weapon now stays high at the named load and reaches a lower contact pose. The old early downstroke is corrected in the sampled phases.
- `ball-throw`: A high load, raised release, and separate follow-through are visible. The basketball stays attached in the review fixture. Projectile release behavior was not tested.
- `uppercut`: The fist now clears the face. Hand Y is 1.424 m at contact; Head joint Y is 1.260 m. The side and three-quarter views show the upward action.
- `crouch-walk`: The pose remains shallow, but the measured head height is 1.371–1.401 m. This is 72–102 mm below idle and 11–41 mm above crouch-idle. It is a remaining style limit, not a large mismatch with crouch-idle. A deeper crouch would improve the front silhouette.
- `rifle-reload`: The support hand can now leave the foregrip. It moves toward the magazine area. The rifle remains aimed and the overall silhouette changes little. A small rifle cant or larger magazine reach would help, but the prior complete suppression is removed.
- `vault` and `ledge-climb`: Tuck and named support phases are clearer. They still need a real obstacle fixture. This empty-floor review cannot certify a planted palm, body clearance, or a ledge step-over. The ledge sequence still reads mainly as arms lowering from a hang.
- `staff-sweep`: Contact remains near waist height. The side view foreshortens the staff. A lower sweep and more cross-body travel would better match the name.
- `backfist`: The shorter timing helps, but contact remains compact and close to guard. Keep it below the required fixes unless the action must be distinct without its label.
- The continuous limb lines and nearly straight spine remain visible. No return of joint beads was seen in these views.

## All 26 changed clips

| Clip | Result |
|---|---|
| `parry` | Stronger deflection silhouette. No new priority fault in these phase views. |
| `dodge-left` | Required: increase net head travel. |
| `dodge-right` | Required: increase net head travel. |
| `elbow-strike` | Required: make elbow lead toward the target. |
| `backfist` | Faster; compact contact remains a secondary limit. |
| `shield-slam` | Required: fix mounted shield contact shape. |
| `hammer-overhead` | High load and lower contact now read. |
| `shield-push` | Shield face and forward arm position read more clearly. |
| `ball-throw` | High release now reads. |
| `bat-swing` | Required: fix mounted bat swing plane. |
| `vault` | Clearer tuck; obstacle support proof remains open. |
| `ledge-climb` | More phases; obstacle support and step-over proof remain open. |
| `crouch-walk` | Low relative to idle, but still shallow in front view. |
| `roll` | Middle pose is tighter. Check its game transition with the full sequence. |
| `jump-start` | Required: align takeoff with extension. |
| `rifle-reload` | Hand suppression is removed; action remains subtle. |
| `punch-left` | Earlier contact with clear full extension. |
| `punch-right` | Earlier contact with clear full extension and stance. |
| `dagger-stab` | Earlier short strike. No new priority shape fault. |
| `sword-thrust` | Earlier axial blade contact. Ready pose still starts high. |
| `staff-thrust` | Earlier horizontal staff contact reads. |
| `sword-slash` | Earlier contact and high load read. |
| `staff-sweep` | Faster; low sweep identity remains weak. |
| `sword-diagonal` | Contact blade angle is diagonal. Surrounding arc still needs final motion review. |
| `kick-roundhouse` | Required: extend the leg at the contact event. |
| `uppercut` | Earlier high fist contact reads. |

## Receipt

- GLB SHA-256: `22bfb9a27ea2797af3395d20bbbdafc09fc5a0cd65b277c8713d0f4c650a7482`.
- Prototype catalog SHA-256: `b617ae577aa0889619683335bd82df1d853024248a51e6f9cc05aef756980217`.
- Authoring source SHA-256: `f1284e71dd74d3a82db912477ffa7f64688bb578d012a10e4a8e357c948d0077`.
- Runtime assets source SHA-256: `d66fdb9a58b2ccac49c7c398db3120314bffa0e0098c9f74e239901c57dd4e51`.

This is a standard-body prototype review. It does not replace the final 12-body checks or full 85-clip review.
