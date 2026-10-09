# Independent block stance review — 1.4.3

No blocker remains in the reviewed block legs, body posture, or fixed support feet.

The standard guard now has a short stagger and a more upright body. Its front-to-back foot spacing is 0.275 m, down from 0.521 m. Torso tilt is 8.13°, down from 14.04°. Maximum knee bend is about 28°. The saved front, side, and three-quarter views show clean line joints, bent knees, and both feet on the floor. The sampled phases retain a stable body height.

The widest sentinel variant was also viewed. Its stance reads as a heavy body. It does not show the old crouched posture. Every final body is narrower than before; the smallest width reduction is 15.3%.

All 12 final body hashes match the passing CPU reports. There are 96 posture checks and 1,020 body/clip comparisons. All 84 protected punch, uppercut, and kick pairs retain exact track values and times. Other small export differences are checked through world poses at 120 Hz. Their largest measured joint difference is 0.319 mm; their largest rotation difference is 0.0426°. The fighter bow-release key reduction has a 0.0669 mm / 0.00965° world-pose difference. These are numerical export differences, not an identical-byte claim.

The source pose edit is confined to block_guard. Arm keys and clip timing remain unchanged. The dependent shield reference can change exported shield tracks. Their grip checks pass. The other contact, firearm, reload, line, style, and timing reports also pass. Current hashes and counts are in `independent-review.json`.

The visual review used saved images: before.png, after.png, and sentinel.png. It did not use continuous playback or a new GPU capture. All-body statements use verified CPU evidence.

Run-to-idle blends can still move support feet. Ramp movement has no separate terrain targets for each foot. Those cases are outside this scoped pass. No new performance measurement was made. Earlier benchmark reports are historical. Physical Android performance remains unverified.
