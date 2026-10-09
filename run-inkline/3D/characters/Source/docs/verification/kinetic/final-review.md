# Final Kinetic Review

Historical record: Release 1.2. Current release checks are in the quality correction reports.

Date: 2026-09-26.

The final grounded GLB check passed all 204 pairs: 17 clips on each of 12
bodies. It sampled at 240 Hz. The floor range was 0.946 mm to 10.645 mm,
within the accepted range of -1 mm to 15 mm. See
[grounded-export.json](grounded-export.json).

The pass refines 29 authored motion IDs. The generator samples the GLBs at
120 Hz. It keeps authored timing at 30 FPS. Export-only NLA scaling and dense
signed Hips keys correct the interpolation error between source and GLB poses.
Independent source review found no P0/P1 issue in this correction.

The final build, browser checks, video decoding, review-page playback,
sustained desktop performance, and exported consumer checks pass on the
corrected GLBs. This is the review before packaging. Archive and installation
acceptance is recorded after packaging in `docs/verification/package-acceptance.json`
in the workspace. That receipt is excluded from both archives.
Physical Android performance is unverified.

Asset validation confirms 12 characters, 291 props, 84 clips per character,
and 64 effects. The GLBs total 29,107,852 bytes and 69,964 triangles. The
largest model has 1,712 triangles.

The final image review uses the corrected GLBs. The attacker and target stay
clear at contact in the [desktop capture](../art-pass/combined-impact-desktop.png)
and [phone capture](../art-pass/combined-impact-phone.png). Target lean and
separate limbs show the hit response. The idle figure stays separate from the
overhead structure in the [checkpoint-five phone top view](../art-pass/route-checkpoint-05-phone-top.png).
These three captures are current. The older art-review captures below remain
part of the earlier visual record.

This review used the production audit at `http://127.0.0.1:5297` and the normal app at `http://127.0.0.1:4197`. It used 1440x900 and 390x844 viewports. The browser used normal motion.

The current validation results are:

- Unit checks: 57 passed.
- Node contact-pose checks: 72 passed.
- Grounded export pairs: 204 passed at 240 Hz.
- Full motion pairs: 1,008 passed.
- Camera route checks: 184 passed.
- Moving camera checks: 24 passed.
- Action checks: 41 passed. Browser errors: 0.
- Contact checks: 6 passed. Browser errors: 0.
- Expansion checks: 105 passed.
- Preview framing checks: 31 passed.
- Interface checks: 13 passed in 16.8 seconds with full Chromium.
- `npx tsc --noEmit`: passed.
- The reduced-motion check passed with the OS preference set to reduce. The punch had no active trail and still made one contact attempt.

The first interface run used the software headless shell and missed a timed
movement target. The test now selects the full Chromium channel. The complete
13-check suite passed on repeat. This changed the test browser only. It did
not change runtime code or reduce the contact requirements.

The images below record the visual review before the final export sampling
correction. The current numeric results above use the corrected GLBs.

The contact read is clear in the combat view. The black attacker and red target keep separate silhouettes. The punch reaches the target with a short trail and a small contact mark. The target reaction is visible after contact. The desktop frames show this in [windup](art-review/final-combat-desktop-windup.png), [near contact](art-review/final-combat-desktop-near-contact.png), [contact](art-review/final-combat-desktop-contact.png), and [recovery](art-review/final-combat-desktop-recovery.png). The phone contact frame keeps both figures readable at 390x844 in [final-combat-phone-contact.png](art-review/final-combat-phone-contact.png).

The weight pass improves the wide action views. The kick has a clear lifted leg and body lean. The heavy strike has a longer leg line and a strong forward lean. The action reads in [desktop kick](art-review/final-overview-desktop-kick.png) and [desktop heavy](art-review/final-overview-desktop-heavy.png). The action marks remain small in the wide overview. This is acceptable for the current view distance, but close combat should remain the main action view.

The phone overview keeps the central warehouse and the main pair visible. The figures are small by design. The far right of the wide assembly reaches the phone edge in [final-overview-phone-heavy.png](art-review/final-overview-phone-heavy.png). The phone combat route gives a useful close view in [final-ui-phone-combat-close.png](art-review/final-ui-phone-combat-close.png). The panel opens and closes in [final-ui-phone-combat-panel.png](art-review/final-ui-phone-combat-panel.png) and the close frame. The bottom navigation remains available, and Combat stays selected. The capture record is in [final-samples.json](art-review/final-samples.json).

The final route check passed all 184 checks after the camera fixes. All 11 sampled body points stayed in frame and clear of geometry at all seven checkpoints, in four camera views and two viewport sizes. The moving camera check passed all 24 checks. The preview framing check passed all 31 checks, including equipment, clip, and zoom changes. The full animation bounds check passed all 1,008 character and clip pairs. These results use the corrected GLBs.

The final review media contains a 150.4-second desktop tour, a 30.08-second
normal-speed comparison, and a 27.76-second phone-layout film. Full decode
checks pass. The secondary MP4 durations match their WebM originals.
The phone control sequence scored 80 points. The main tour completed all
seven checkpoints and checked successful staff, shield, and rifle hits.
The score and instruction text have a fixed gap in the final HUD.

The final static review found no P0 or P1 issue in the role, body, unarmed,
and contact sheets. The role sheet uses four columns. The Duelist uses
an overhead-cut pose to show the sword clearly. The base body sheet keeps
one camera scale. Static sheets do not establish dynamic visibility.

The 900.7-second baseline and 60.4-second 100-figure stress test both average
120 FPS. Neither records a frame over 33 ms. Moving combat averages 111.6 FPS;
moving parkour averages 109.2 FPS. Chromium CPU rate 4 gives 93.0 and 88.7 FPS
for those two views. These are desktop checks, not phone measurements.

The exported runtime passes 22 checks. The copied runtime also passes a
strict TypeScript check. All three review films play in the page. All nine
chapter links and sixteen images load. The review page fits a 390 px viewport.
The pale avatar frame retains its dark contour against the light stage.
